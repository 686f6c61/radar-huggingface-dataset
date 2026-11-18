# agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen
Qwen3.8-Flash-Next-Gyro-abliterated es una versión cuantizada en formato GGUF del modelo Qwen3.8-Flash-Next, un transformer multimodal (texto e imagen) de aproximadamente 125.700 millones de parámetros. El trabajo de abliteración, que elimina la dirección de rechazo de los pesos, lo firma huihui-ai; el autor de esta ficha, agentionai, se limita a la cuantización y al empaquetado en tres clases de tamaño (Gyro-S, Gyro-M y Gyro-L) pensadas para ejecutarse en una sola GPU o en máquinas con memoria unificada.

La relevancia de esta publicación radica en que pone al alcance de hardware de consumo y de estaciones de trabajo con 32-64 GB de memoria un modelo de escala muy superior a la habitual en ese rango, mediante tipos de cuantización trellis (TQK6/TQK7, TQ2_T, TQP5-7) que no son compatibles con llama.cpp upstream. Para cargarlo es necesario usar Strata 0.2.0 o superior, halo-box/strix-llama.cpp o agentionai/llama.cpp.

El modelo está etiquetado como experimental y sin censura, con una licencia qwen-community-1.0 que impone restricciones adicionales al uso. Con 1,46 millones de descargas y 69 likes en el Hub, es un artefacto de nicho orientado a investigadores y desarrolladores que necesitan un modelo sin filtros de rechazo y aceptan asumir la responsabilidad legal y ética de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con atención completa y atención lineal, mezcla de expertos (MoE) con expertos compartidos y enrutados, y tabla n-gram (PLE) |
| Parametros totales | 125.743.653.760 (~125,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 64.000 tokens (configuración de referencia de los ejemplos del autor; límites exactos no disponibles) |
| Tipos de cuantizacion | GGUF con tipos trellis: TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); tabla PLE en IQ4_NL o Q8_0; proyector visual mmproj-F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (con variantes `-noPLE` sin la tabla n-gram) |

## Arquitectura y entrenamiento
La información disponible describe un transformer multimodal con dos mecanismos de atención combinados: atención completa y atención lineal, cuyos tensores de salida son precisamente los que modifica la abliteración. La capa de mezcla de expertos incluye expertos compartidos y expertos enrutados; la abliteración de la versión v1 (Gyro-S y Gyro-M) altera 144 de 1.224 tensores, mientras que la v2 (Gyro-L) altera 96 tensores, dejando los expertos enrutados idénticos a los del modelo original. El resto de tensores es byte a byte idéntico a los ficheros Gyro no abliterados.

El modelo incorpora una tabla n-gram (PLE) propia del modelo base, común a todas las cuantizaciones de Qwen3.8-Flash-Next y distribuida por separado en Delgon/Qwen3.8-Flash-Next-PLE-GGUF. También se publica un borrador MTP (`mtp-Qwen3.8-Flash-Next-draft.gguf`) para decodificación especulativa y un proyector visual `mmproj-F16.gguf` para las capacidades de imagen. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni las etapas de RLHF o DPO del modelo base.

## Capacidades
- Generación de texto conversacional multi-turno, con ajustes de muestreo de referencia (`--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.05`).
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector visual mmproj-F16.
- Razonamiento y respuesta sin filtros de rechazo gracias a la abliteración de huihui-ai.
- Decodificación especulativa con borrador MTP (`--spec-type draft-mtp`) para acelerar la generación.
- Gestión de contexto largo de hasta 64k tokens con caché de clave y valor cuantizada (q8_0).
- Compatibilidad con endpoints (`endpoints_compatible`) y modo conversacional (`conversational`).
- Soporte de plantilla de chat mediante `--jinja`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento generativo, comparando directamente los ficheros abliterados con los Gyro originales, que comparten arquitectura y velocidad.
- Despliegue en estaciones de trabajo con 32 GB de VRAM: Gyro-S abliterado ocupa 28,8 GiB con contexto de 64k, por lo que cabe en tarjetas de 32 GB y permite ejecutar un modelo de ~125,7 mil millones de parámetros en local.
- Equipos con memoria unificada de 64 GB (por ejemplo, Strix Halo): Gyro-L abliterado, con 50,21 GiB de pesos, ofrece la mayor calidad de la familia (KLD 0,164 frente al modelo original) en hardware sin GPU dedicada de gran capacidad.
- Configuraciones multi-GPU de gama media: Gyro-M abliterado, con aproximadamente 37 GiB, encaja en dos tarjetas de 24 GB y mantiene un KLD de 0,295.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text y el proyector mmproj-F16 permiten extraer y razonar sobre contenido visual en flujos internos de análisis documental.
- Generación asistida con decodificación especulativa: el borrador MTP reduce la latencia en despliegues de llama-server con `--spec-type draft-mtp`, útil en entornos interactivos de investigación.
- Experimentación con cuantizaciones trellis: sirve como banco de pruebas para evaluar los tipos TQK6/TQK7, TQ2_T y TQP5-7 en Strata, strix-llama.cpp y agentionai/llama.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad es la divergencia KL (KLD) frente al modelo original:

| Variante | KLD vs modelo original | Memoria (contexto 64k) | Tamano del fichero |
|---|---:|---:|---:|
| Gyro-S abliterado (TQ1_0) | 0,397 | 28,8 GiB | 58,5 GB |
| Gyro-M abliterado (TQ2_0) | 0,295 | ~37 GiB | 92,0 GB |
| Gyro-L abliterado (TQ3_0) | 0,164 | 50,21 GiB (pesos) | 108,3 GB |

| Variante | Fichero completo | Fichero `-noPLE` | Tabla PLE incluida |
|---|---:|---:|---|
| Gyro-S abliterado | 58,5 GB | 29,7 GB | IQ4_NL |
| Gyro-M abliterado | 92,0 GB | 37,6 GB | Q8_0 |
| Gyro-L abliterado | 108,3 GB | 53,9 GB | Q8_0 |

## Requisitos de hardware
- VRAM estimada: 28,8 GiB para Gyro-S con contexto de 64k; aproximadamente 37 GiB para Gyro-M; 50,21 GiB de pesos para Gyro-L.
- GPU recomendadas: tarjetas de 32 GB para Gyro-S; dos GPU de 24 GB o máquinas con 64 GB de memoria unificada para Gyro-M; 64 GB de memoria unificada (Strix Halo) para Gyro-L.
-Compatibilidad con GPU de consumo: no se especifican modelos concretos; el modelo no cabe en tarjetas de 24 GB o menos en ninguna de sus variantes.
- Aceleración: NVIDIA (CUDA), AMD RX 7000, RX 9000 y R9700 mediante Strata 0.2.0 o superior; AMD Strix Halo mediante halo-box/strix-llama.cpp (CPU, Vulkan, HIP); CPU, Vulkan y CUDA mediante agentionai/llama.cpp.
- Opciones de despliegue: llama-server de agentionai/llama.cpp, contenedor `agentionai/agention-llama:server` (Vulkan; CUDA si se compila), Strata y strix-llama.cpp. LM Studio y Ollama no pueden cargar ficheros `-noPLE`; solo admiten el fichero completo.
- Caché KV: cuantización q8_0 para claves y valores (`-ctk q8_0 -ctv q8_0`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito adicional: la tabla PLE debe descargarse por separado (Delgon/Qwen3.8-Flash-Next-PLE-GGUF) si se usa un fichero `-noPLE`, y cargarse con `--ple` (o `--ple-gguf` en Strata).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Gyro-abliterated (este) | ~125,7 mil millones | 64k | GGUF trellis | qwen-community-1.0 | Sin rechazos; requiere runtimes no upstream |
| Qwen3.8-Flash-Next-Gyro (no abliterado) | ~125,7 mil millones | 64k | GGUF trellis | qwen-community-1.0 | Misma arquitectura y velocidad; conserva los rechazos |
| Huihui-Qwen3.8-Flash-Next-abliterated (v1 y v2) | ~125,7 mil millones | no disponible | safetensors | qwen-community-1.0 | Pesos originales de los que derivan estas cuantizaciones |
| Delgon/Qwen3.8-Flash-Next-PLE-GGUF | no aplica | no aplica | GGUF | no disponible | Solo la tabla n-gram (PLE), no un modelo completo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias
- La abliteración elimina la mayor parte de los rechazos del modelo; puede producir contenido dañino, ofensivo o inapropiado y no es apto para uso público ni sin supervisión.
- El usuario es responsable del uso que haga del modelo y del cumplimiento de la legislación aplicable en su jurisdicción.
- La licencia qwen-community-1.0 impone condiciones adicionales; deben revisarse antes de cualquier uso comercial.
- El modelo está marcado como experimental y no se han publicado evaluaciones de sesgo, alucinación ni robustez.
- Los tipos de cuantización trellis no son compatibles con llama.cpp upstream; sin Strata, strix-llama.cpp o agentionai/llama.cpp el modelo no se puede cargar.
- Los ficheros `-noPLE` no funcionan en LM Studio ni en Ollama, y requieren compilaciones de agentionai/llama.cpp posteriores al 2026-11-05 o strix-llama.cpp master.
- La tabla PLE es un componente separado que debe descargarse y referenciarse correctamente; omitirla impide la carga de las variantes `-noPLE`.
- No hay información sobre idiomas soportados ni sobre el rendimiento en lenguas distintas del inglés.
- La cuantización introduce degradación medible: KLD de 0,397 en Gyro-S, 0,295 en Gyro-M y 0,164 en Gyro-L frente al modelo original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Modelo base abliterado (v1): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo base abliterado (v2, GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Ficha principal Gyro (instrucciones de hardware, visión y decodificación especulativa): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Tabla n-gram (PLE) independiente: https://huggingface.co/Delgon/Qwen3.8-Flash-Next-PLE-GGUF
- Runtime Strata: https://github.com/Niko1221/Strata
- Runtime para Strix Halo: https://github.com/halo-box/strix-llama.cpp
- Runtime agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Rama Strata de agentionai: https://gitlab.com/agentionai-group/strata/-/tree/main
