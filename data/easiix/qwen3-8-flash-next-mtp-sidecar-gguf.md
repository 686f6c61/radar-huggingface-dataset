# EasiiX/Qwen3.8-Flash-Next-MTP-Sidecar-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-Sidecar-GGUF es un artefacto derivado publicado por el usuario EasiiX que extrae la cabeza de predicción multi-token (MTP, multi-token prediction) del checkpoint oficial Qwen/Qwen3.8-Flash-Next y la exporta como GGUF independiente para su uso como modelo borrador en decodificación especulativa con llama.cpp. No es un modelo generativo autónomo: es un sidecar de 3.878.549.248 parámetros (4,1 GB en Q8_0) que debe emparejarse con el modelo objetivo Qwen3.8-Flash-Next cuantizado (por ejemplo, UD-IQ3_XXS) para acelerar la inferencia.

El problema que resuelve es concreto: los pesos MTP vienen incluidos en el checkpoint original de Qwen, pero las conversiones GGUF habituales los descartan, de modo que los usuarios de llama.cpp no pueden aprovechar la decodificación especulativa nativa del modelo. Este repositorio proporciona esos tensores ya convertidos y, además, incluye los tensores de hiperconexión (hc) que llama.cpp exige desde el PR upstream #28901.

Su relevancia actual es práctica y acotada: está ajustado y medido sobre AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151), un hardware de memoria unificada donde el ancho de banda es el cuello de botella. El autor reporta un incremento de decodificación del 50 % en código (de 23,5 a 35,7 t/s con ~85 % de aceptación) manteniendo la pérdida nula a temperatura 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) de Qwen3.8-Flash-Next, exportada como GGUF para decodificacion especulativa en llama.cpp |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable al sidecar; el ejemplo de uso configura 32.768 tokens en el modelo objetivo y se reportan mediciones hasta 156K de profundidad de contexto |
| Tipos de cuantizacion | Q8_0 (unico publicado); el procedimiento de conversion permite generar BF16 intermedio |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El sidecar contiene exclusivamente los tensores de la cabeza MTP del modelo base Qwen3.8-Flash-Next, un mecanismo de predicción multi-token que actúa como borrador interno: propone varios tokens candidatos que el modelo objetivo verifica en paralelo, aceptando el prefijo correcto y descartando el resto. En llama.cpp se integra mediante el tipo de especulación `draft-mtp` (soporte qwen4exp introducido en el PR #27742), y el diseño de la cabeza procede del equipo Qwen (PR #27739).

No se ha publicado información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO para este artefacto, ya que no se ha entrenado de forma independiente: hereda los pesos del checkpoint oficial. La innovación técnica relevante es de empaquetado y compatibilidad. La versión vigente, `mtp-Qwen3.8-Flash-Next-hc-Q8_0.gguf`, incluye los tensores de hiperconexión (`output_hc_norm.weight` y similares) requeridos por llama.cpp desde el PR #28901; la versión anterior sin sufijo `-hc-` está deprecada desde el 19 de septiembre de 2026 y las builds actuales la rechazan con el error `check_tensor_dims: tensor 'output_hc_norm.weight' not found`. La conversión puede reproducirse con `convert_hf_to_gguf.py --remote --mtp`, que transmite únicamente los tensores MTP (unos 8 GB de tráfico).

## Capacidades

- Aceleración de decodificación especulativa: actúa como modelo borrador para el objetivo Qwen3.8-Flash-Next en llama.cpp, con aceptación reportada de ~85 % en código.
- Generación de borradores multi-token con ventana configurable (`--spec-draft-n-max 4` en el ejemplo del autor).
- Control de confianza mediante puerta de probabilidad mínima (`--spec-draft-p-min 0.75`), que evita la degradación en texto libre donde la aceptación es baja.
- Combinación con especulación por n-gramas (`--spec-type draft-mtp,ngram-mod`).
- Pérdida nula a temperatura 0 (decodificación especulativa sin cambio de distribución).
- No genera texto de forma autónoma, no soporta tool calling por sí mismo, no tiene modo thinking, visión ni audio: esas capacidades pertenecen al modelo objetivo.
- Capacidades multilingües: no disponible (no documentadas para el sidecar).

## Casos de uso

- Servicio de código en hardware de memoria unificada: en un Strix Halo con objetivo UD-IQ3_XXS, el sidecar eleva la decodificación de 23,5 a 35,7 t/s en tareas de código, lo que hace viable la asistencia de programación interactiva sin GPU discreta.
- Autocompletado y generación en IDE sobre equipos de sobremesa: al mantener la aceleración incluso a 156K de profundidad de contexto, resulta adecuado para repositorios grandes donde el prompt ocupa gran parte de la ventana.
- Despliegue local de agentes de código con contexto largo: el objetivo conserva 32.768 tokens de contexto en la configuración de referencia, suficiente para sesiones multi-turno con archivos extensos.
- Sustitución de decodificación especulativa con modelo borrador separado: en lugar de cargar un modelo draft adicional en VRAM, se usa la cabeza MTP ya entrenada por Qwen, con menor huella (4,1 GB en Q8_0).
- Evaluación comparativa de técnicas de aceleración: permite medir aceptación y throughput de MTP frente a draft models clásicos o n-gramas en el mismo objetivo y hardware.
- Reproducción de pipelines de inferencia en CI: al ser determinista a temperatura 0, sirve para generar baterías de pruebas reproducibles con mayor throughput que la decodificación estándar.
- Investigación sobre decodificación especulativa: la puerta `--spec-draft-p-min` permite estudiar el equilibrio entre aceptación y coste de borradores rechazados en distintos dominios (código frente a prosa).

## Benchmarks y rendimiento

| Metrica | Sin MTP | Con MTP sidecar | Condiciones |
|---|---|---|---|
| Decodificacion en codigo (t/s) | 23,5 | 35,7 (+50 %) | AMD Strix Halo, Ryzen AI MAX+ 395, gfx1151, objetivo UD-IQ3_XXS, temperatura 0, aceptacion ~85 % |
| Decodificacion a 156K de profundidad de contexto | no disponible | +49 % respecto a sin MTP | Mismas condiciones |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; el artefacto no altera la calidad del modelo objetivo a temperatura 0.

## Requisitos de hardware

- VRAM adicional para el sidecar: 4,1 GB en Q8_0, sumados a la memoria del modelo objetivo.
- Hardware de referencia: AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151) con memoria unificada; las mediciones del autor corresponden a este sistema.
- GPU discretas: no se han publicado mediciones para A100, H100 o RTX 4090. El sidecar es independiente del backend, pero el rendimiento depende de la implementación de `draft-mtp` en la build de llama.cpp.
- Compatibilidad con GPU de consumo: viable en la medida en que lo sea el objetivo; el sobrecoste de 4,1 GB condiciona especialmente a tarjetas de 8-12 GB.
- Despliegue: exclusivamente llama.cpp, con una build que incluya la cabeza MTP qwen4exp (PR #27742) y los tensores hc (PR #28901). La rama probada es Aristo94/EngramHalo.cpp, que incluye parches de kernel para Strix Halo y guía de compilación. No hay soporte documentado para vLLM, TGI ni Ollama.
- Configuración de referencia: `-ngl 999 -fa on -ctk q8_0 -ctv q8_0 -c 32768 -ub 2048 -md <sidecar> --spec-type draft-mtp,ngram-mod --spec-draft-n-max 4 --spec-draft-p-min 0.75`.
- Latencia y throughput: ver tabla de benchmarks; solo disponibles para el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EasiiX/Qwen3.8-Flash-Next-MTP-Sidecar-GGUF | 3.878.549.248 | no aplicable (sidecar) | Borrador MTP para decodificacion especulativa | Qwen Community License 1.0 | GGUF en Hugging Face, 724 descargas |
| Qwen/Qwen3.8-Flash-Next (objetivo) | no disponible en la informacion | no disponible | Modelo generativo completo con cabeza MTP incluida | Qwen Community License 1.0 | Checkpoint oficial en Hugging Face |
| Conversiones GGUF comunitarias de Qwen3.8-Flash-Next | no disponible | no disponible | Modelo objetivo sin tensores MTP | Qwen Community License 1.0 | GGUF, requieren sidecar para especulacion |
| dzannotti MTP GGUF (trabajo comunitario citado) | no disponible | no disponible | Borrador MTP alternativo | no disponible | Repositorio comunitario |

No se dispone de datos para comparar con modelos borrador independientes (draft models de menor tamaño) en términos de aceptación o throughput en el mismo hardware.

## Limitaciones y advertencias

- No es utilizable de forma autónoma: sin el modelo objetivo Qwen3.8-Flash-Next y una build parcheada de llama.cpp no produce ninguna salida.
- La versión sin sufijo `-hc-` está deprecada y falla en builds actuales por ausencia de `output_hc_norm.weight`; usar únicamente `mtp-Qwen3.8-Flash-Next-hc-Q8_0.gguf`.
- Sin `--spec-draft-p-min 0.75`, la prosa con baja aceptación pierde más por borradores rechazados de lo que gana; el ajuste es sensible al dominio.
- Las ganancias publicadas (+50 % en código, +49 % a 156K) proceden de un único sistema Strix Halo y un único objetivo UD-IQ3_XXS; no deben extrapolarse a otras GPU o cuantizaciones.
- Licencia Qwen Community License 1.0: incluye una cláusula de Model-as-a-Service que debe revisarse antes de servir el modelo comercialmente. El campo `license: other` en Hugging Face exige consultar el fichero LICENSE del repositorio.
- Idiomas soportados no documentados para el sidecar; la cobertura lingüística efectiva depende del modelo objetivo.
- Riesgo de alucinación: no aplicable al sidecar en sí (no genera contenido propio), pero la verificación del modelo objetivo sigue siendo el mecanismo de control de calidad.
- Dependencia de una rama no oficial de llama.cpp (EngramHalo.cpp) para el hardware de referencia; los PR #28901 y #27742 pueden cambiar de estado y romper la compatibilidad.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EasiiX/Qwen3.8-Flash-Next-MTP-Sidecar-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- llama.cpp PR #27739 (diseño de la cabeza MTP): https://github.com/ggml-org/llama.cpp/pull/27739
- llama.cpp PR #27742 (soporte qwen4exp): https://github.com/ggml-org/llama.cpp/pull/27742
- llama.cpp PR #28901 (tensores de hiperconexión): https://github.com/ggml-org/llama.cpp/pull/28901
- Rama probada con parches para Strix Halo: https://github.com/Aristo94/EngramHalo.cpp
