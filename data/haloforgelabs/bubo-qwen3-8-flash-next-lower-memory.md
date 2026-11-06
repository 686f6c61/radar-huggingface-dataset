# HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory

## Resumen

`HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory` es una compilación GGUF de Qwen3.8 Flash Next diseñada específicamente para portátiles con APU AMD Strix Halo que ejecutan **Halowin Bubo** (versión 0.1.1 o superior) sobre Windows. El modelo base es `Qwen/Qwen3.8-Flash-Next`, un modelo de arquitectura mixta de expertos (MoE) con 176.943.899.520 parámetros totales según los metadatos de safetensors del repositorio.

La particularidad de esta versión es su composición híbrida de pesos: los tensores densos provienen de la versión *abliterated* de Huihui (`Huihui-Qwen3.8-Flash-Next-abliterated-GGUF`), mientras que los tensores de los expertos proceden de la versión comprimida de ISTA-DASLab (`Qwen3.8-Flash-Next-GSQ-RCO-GGUF`), que emplea formatos mixtos de bits bajos. El resultado es una variante que consume unos 25 GiB menos de memoria GPU que la compilación estándar (66 GiB frente a 91 GiB a 200.000 tokens de contexto), a cambio de una ligera reducción de velocidad.

Es relevante ahora porque permite ejecutar un modelo MoE de gran tamaño con contexto de 200.000 tokens en máquinas con 96 GB de memoria unificada, un escenario típico de los portátiles Strix Halo, manteniendo compatibilidad con el sistema de decodificación especulativa de Bubo (decode twin, draft head y predictor MTP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), base Qwen3.8 Flash Next |
| Parametros totales | 176.943.899.520 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 200.000 tokens (contexto por defecto en Bubo) |
| Tipos de cuantizacion | Tensores densos de Huihui (abliterated) + expertos GSQ-RCO IQ3_S de ISTA-DASLab con formatos mixtos de bits bajos; archivos auxiliares en Q8_0 (MTP), BF16 (mmproj), IQ4 (twin) y Q4K (draft head) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0), cadena de avisos Qwen, Huihui, Unsloth, ISTA-DASLab, HaloForge Labs |
| Formato de pesos | GGUF, 4 shards (84,6 GB) + 4 archivos auxiliares (5,3 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.8 Flash Next. Esta compilación no reentrena nada: es una composición de tensores existentes. Los tensores densos se copian sin cambios de la revisión `73e9eb7c` del modelo abliterated de Huihui, y los tensores de expertos de la revisión `ed59f920` del archivo GSQ-RCO IQ3_S de ISTA-DASLab. El proceso de abliteration de Huihui modificó 101 tensores; esta compilación usa 96 de ellos, y los 5 tensores de expertos modificados se sustituyen por los de ISTA. El repositorio incluye un `compose-manifest.json` con la procedencia y checksum de cada tensor.

Los expertos emplean los formatos GSQ-RCO descritos en los artículos arXiv:2604.18556 (GSQ) y arXiv:2605.00649 (RCO), que permiten comprimir los pesos de expertos a bits muy bajos con pérdida mínima de calidad. El paquete incluye además un decode twin (`iq4-nofullattn-nohc.gguf`), un draft head (`draft-out-q4k.gguf`) y un predictor MTP (`mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf`) idénticos, con los mismos valores SHA-256, a los de la compilación estándar de Huihui, de modo que la decodificación especulativa de Bubo funciona igual.

No hay información disponible sobre los datos de entrenamiento del modelo base, ni sobre procesos de RLHF o DPO aplicados.

## Capacidades

- Generacion de texto conversacional (etiquetado como `conversational` en Hugging Face).
- Razonamiento: en una verificación de 35 preguntas (GPQA Diamond, AIME 2026, HMMT 2026, IMO 2026) respondió correctamente 29, igual que la compilación Q4 estándar.
- Generacion de codigo: la model card indica que escribe código y texto de agentes a entre el 0,75 y el 0,9 de la velocidad de la compilación estándar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: la model card menciona "agent text" como salida habitual del modelo, pero no detalla soporte formal de agentes.
- Capacidades multilingues: no disponible.
- Vision: incluye un archivo `mmproj` en BF16 (proyector multimodal), lo que sugiere capacidad de visión en Bubo; no hay detalles documentados.
- Modelo abliterated: sin restricciones de rechazo; en una comprobación de 100 peticiones de AdvBench no rechazó ninguna.

## Casos de uso

- **Ejecución local en portátiles Strix Halo de 96 GB:** es el caso de uso principal; la compilación cabe en la memoria unificada con contexto de 200.000 tokens ajustando la Variable Graphics Memory a 72 GB.
- **Asistentes locales con documentos largos:** la ventana de 200.000 tokens permite cargar documentos extensos (informes, contratos, bases de código) en una sola sesión sin nube.
- **Generacion de codigo offline:** con el draft head y el decode twin activos, Bubo mantiene una velocidad de escritura de código razonable (0,75–0,9 de la compilación estándar), adecuada para asistentes de programación privados.
- **Agentes de texto locales:** la model card destaca la generación de "agent text", útil para pipelines de agentes que procesan texto multi-paso en local.
- **Investigación sobre abliteration:** al conservar el manifiesto de composición y los checksums por tensor, es un buen sujeto de estudio sobre el efecto de combinar pesos abliterated con expertos cuantizados agresivamente.
- **Evaluación de formatos de compresión GSQ/RCO:** permite comparar en hardware real el impacto de los expertos IQ3_S frente a cuantizaciones Q4 estándar.

## Benchmarks y rendimiento

Datos publicados en la model card (no son benchmarks estándar comparativos completos, sino verificaciones puntuales):

| Verificacion | Resultado |
|---|---|
| Razonamiento (35 preguntas: GPQA Diamond, AIME 2026, HMMT 2026, IMO 2026) | 29/35 correctas, igual que la compilación Q4 estándar |
| AdvBench (100 peticiones, 20/10/2026) | 0 rechazos |
| Velocidad de lectura de prompts | 0,88–0,92 de la compilación estándar (Bubo 0.1.1, ~70 W) |
| Velocidad de escritura (código y agentes) | 0,75–0,9 de la compilación estándar |
| Velocidad de escritura (prosa) | similar a la compilación estándar |

Referencias indirectas del archivo GSQ-RCO de ISTA-DASLab: coincidencia con el modelo base en AIME25 y resultado a menos de 0,57 puntos en LiveCodeBench v6. No se han publicado resultados de MMLU, HumanEval o GSM8K para esta compilación concreta.

## Requisitos de hardware

- **Memoria GPU estimada:** unos 66 GiB a contexto de 200.000 tokens (la compilación estándar necesita ~91 GiB), según estimaciones de Bubo 0.1.1.
- **Máquinas objetivo:** portátiles AMD Strix Halo con 96 GB de memoria unificada. En máquinas de 96 GB se recomienda fijar la Variable Graphics Memory a 72 GB (o al menos 64 GB) en AMD Adrenalin y reiniciar Windows. Nota: estos valores son calculados; Bubo aún no se ha ejecutado en una máquina de 96 GB.
- **Con 64 GB de VGM y ~16 GB de RAM libre** se mantiene el contexto de 200.000 tokens; con menos memoria libre, Bubo reduce el contexto automáticamente.
- **Espacio en disco:** 84.609.075.104 bytes para los 4 shards GGUF más 5.282.481.216 bytes para los 4 archivos auxiliares: 89.891.556.320 bytes en total.
- **Despliegue:** exclusivamente mediante Halowin Bubo 0.1.1 o superior (`bubo prepare model --catalogue-id huihui-qwen38-flash-next-lowmemory-v1` y `bubo serve --manifest <carpeta>\bubo-package.json`). No hay soporte documentado para vLLM, llama.cpp genérico, Ollama o TGI, aunque al ser GGUF la compatibilidad con llama.cpp podría existir de forma no garantizada.
- **Consumo energético de referencia:** las mediciones de velocidad se realizaron a unos 70 W.

## Comparativa con modelos similares

| Caracteristica | Bubo low-memory (esta ficha) | Huihui-Qwen3.8-Flash-Next-abliterated (estandar) | ISTA-DASLab GSQ-RCO IQ3_S |
|---|---|---|---|
| Parametros totales | ~176,9 B (base) | ~176,9 B | ~176,9 B |
| Memoria GPU a 200k tokens (Bubo) | ~66 GiB | ~91 GiB | no disponible |
| Tensores densos | Huihui abliterated | Huihui abliterated | ISTA (no abliterated) |
| Tensores de expertos | ISTA GSQ-RCO IQ3_S | cuantizacion estandar Q4 | ISTA GSQ-RCO IQ3_S |
| Rechazos en AdvBench | 0/100 | 0/100 | no disponible |
| Razonamiento (35 preguntas) | 29/35 | 29/35 (Q4) | no disponible |
| Licencia | Qwen Community 1.0 | Qwen Community 1.0 | hereda la del modelo base |
| Formato | GGUF (4 shards) | GGUF | GGUF |

## Limitaciones y advertencias

- **Modelo abliterated:** al eliminar los mecanismos de rechazo, puede generar contenido sensible u ofensivo. La model card advierte explícitamente de que el usuario es responsable de su uso.
- **Riesgo de alucinacion:** no disponible como dato específico; como todo LLM de gran tamaño, debe asumirse riesgo de alucinación, especialmente en tareas de razonamiento complejas.
- **Abliteration parcial:** solo 96 de los 101 tensores modificados por Huihui se conservan; los 5 tensores de expertos provienen de una fuente sin abliterar, por lo que el comportamiento de rechazo podría no ser idéntico en todos los casos (aunque la prueba de AdvBench mostró 0 rechazos).
- **Licencia no MIT:** la Qwen Community License 1.0 tiene condiciones propias; deben conservarse los archivos `LICENSE` y `NOTICE` con cualquier copia. Si se usan los tensores de expertos, ISTA-DASLab pide citar los artículos arXiv:2604.18556 y arXiv:2605.00649.
- **Ecosistema cerrado a Bubo:** el despliegue documentado es solo para Halowin Bubo en Windows con hardware AMD Strix Halo; no hay instrucciones para Linux, NVIDIA u otros runtimes.
- **Datos calculados, no verificados:** los valores de memoria para máquinas de 96 GB son estimaciones; Bubo no se ha ejecutado todavía en ese hardware.
- **Ligera perdida de velocidad:** la lectura de prompts es un 8–12 % más lenta y la escritura de código hasta un 25 % más lenta que la compilación estándar.
- **Idiomas soportados:** no disponibles en la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaloForgeLabs/bubo-qwen3.8-flash-next-lower-memory
- Repositorio de Halowin Bubo: https://github.com/haloforge-labs/bubo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tensores densos (Huihui): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Tensores de expertos (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Articulo GSQ: https://arxiv.org/abs/2604.18556
- Articulo RCO: https://arxiv.org/abs/2605.00649
