# rousseau/clap-htsat-unfused-burn

## Resumen

CLAP (htsat-unfused) en formato Burn es una conversión del modelo `laion/clap-htsat-unfused` original, publicada por el usuario `rousseau`. No se trata de un modelo nuevo entrenado desde cero, sino de una portabilidad de los pesos del CLAP de LAION al formato nativo del framework Burn (Rust), realizada mediante la herramienta `burn-onnx`. El resultado son dos artefactos `.bpk`: un codificador de audio (`clap-audio-encoder-b5.bpk`) y un codificador de texto (`clap-text-encoder.bpk`), pensados para ser consumidos por la aplicación Rusty Music.

El modelo subyacente, CLAP (Contrastive Language-Audio Pretraining), es un modelo contrastivo audio-texto presentado por Wu et al. en ICASSP 2023, que aprende un espacio latente compartido entre audio y descripciones textuales. La variante `htsat-unfused` emplea un codificador de audio basado en HTSAT (Hierarchical Token-Semantic Audio Transformer) y no fusiona las modalidades en una única torre, sino que mantiene dos torres separadas que se alinean mediante pérdida contrastiva.

Su relevancia es fundamentalmente de infraestructura: permite ejecutar CLAP en entornos Rust sin dependencia de PyTorch ni de ONNX Runtime, lo que facilita el despliegue en aplicaciones de escritorio o embebidas. La ficha del repositorio no proporciona información sobre parámetros, contexto ni benchmarks; los datos disponibles se limitan a los artefactos publicados y al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos torres: codificador de audio HTSAT (transformer jerárquico) y codificador de texto (transformer); modelo contrastivo audio-texto |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el codificador de texto está fijado a 77 tokens |
| Tipos de cuantización | no disponible; se distribuyen pesos en formato Burn (`.bpk`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Burn (`.bpk`), generado desde ONNX mediante `burn-onnx` |

## Arquitectura y entrenamiento

El modelo base `laion/clap-htsat-unfused` sigue la arquitectura CLAP descrita en Wu et al. (ICASSP 2023): un par de codificadores independientes, uno de audio y otro de texto, entrenados con un objetivo contrastivo para alinear representaciones de ambas modalidades en un espacio común. La variante "unfused" mantiene las torres separadas en lugar de fusionar características a nivel intermedio. El codificador de audio se basa en HTSAT, un transformer jerárquico con atención por ventanas diseñado para espectrogramas de audio.

La conversión publicada por `rousseau` no aporta entrenamiento adicional: se limita a transformar los pesos del modelo original a formato Burn mediante `burn-onnx`, a partir de los mismos ONNX generados por los scripts del repositorio Rusty Music (`scripts/preparer-modele.sh` y `scripts/preparer-clap-texte.sh`). El codificador de audio se ha fijado con lotes de 5 ventanas y el codificador de texto con 77 tokens. No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni sobre si hubo ajuste fino adicional (RLHF/DPO) en esta conversión.

## Capacidades

- Codificación de audio en un espacio latente alineado con texto (embedding audio-texto).
- Codificación de texto para búsqueda y comparación con embeddings de audio.
- Recuperación audio-texto (audio-to-text retrieval) y text-to-audio retrieval mediante similitud coseno en el espacio compartido.
- Clasificación zero-shot de audio usando etiquetas textuales.
- Extracción de embeddings de audio para tareas posteriores (clustering, búsqueda por similitud, recomendación musical).
- Integración en aplicaciones Rust mediante el framework Burn, sin dependencia de Python en tiempo de inferencia.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.
- Capacidades multilingües: no disponibles; el codificador de texto está fijado a 77 tokens y no se documentan idiomas.

## Casos de uso

- Búsqueda musical por descripción textual: el codificador de texto transforma una consulta como "guitarra acústica melancólica" en un embedding que se compara con los embeddings de audio de una biblioteca, permitiendo recuperación semántica sin metadatos manuales. Es adecuado porque CLAP alinea ambas modalidades en un mismo espacio.
- Etiquetado automático de audio: usar el codificador de audio para generar embeddings y clasificar ventanas de audio contra un conjunto de etiquetas textuales predefinidas (zero-shot), útil en catalogación de archivos de sonido.
- Recomendación musical por similitud: calcular embeddings de audio de un catálogo y recomendar pistas cercanas en el espacio latente, integrándolo en la aplicación Rusty Music o en un servicio Rust.
- Detección de eventos sonoros en aplicaciones de escritorio: procesar ventanas de audio en local con Burn y comparar contra descripciones textuales de eventos (por ejemplo, "timbre", "pasos"), sin enviar audio a la nube.
- Indexación de archivos de audio personales: generar embeddings en lote y almacenarlos en una base de datos vectorial para búsqueda por lenguaje natural sobre una fonoteca local.
- Integración en pipelines Rust de bajo nivel: al distribuirse como `.bpk` y ejecutarse con Burn, puede embeberse en aplicaciones nativas o de borde (edge) donde no se quiere arrastrar un runtime de Python.
- Filtrado de contenido en plataformas de audio: comparar embeddings de audio con descripciones de contenido no deseado para moderación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,6 GB, lo que da una cota superior aproximada del peso de los artefactos, pero no se especifica la distribución entre ambos codificadores ni el tamaño en memoria en ejecución.
- GPU recomendadas: no disponible. Al ser una conversión a Burn, la inferencia puede ejecutarse en CPU o en GPU compatibles con los backends de Burn (por ejemplo, WGPU, CUDA), pero no se documentan requisitos concretos.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del repositorio (0,6 GB) es plausible que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: framework Burn (Rust); los artefactos `.bpk` requieren la misma versión de `burn-onnx` que los generó. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / ventana | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rousseau/clap-htsat-unfused-burn | CLAP HTSAT unfused (dos torres) | Texto fijado a 77 tokens; audio en lotes de 5 ventanas | Apache-2.0 | Burn (`.bpk`) | Hugging Face (0 descargas) |
| laion/clap-htsat-unfused | CLAP HTSAT unfused (dos torres) | Texto fijado a 77 tokens | Apache-2.0 | PyTorch (safetensors/ONNX) | Hugging Face (modelo base) |
| Otros modelos audio-texto comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros CLAP o modelos audio-texto) no está disponible en la información proporcionada. La única referencia sólida es el modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo embeddings.
- La conversión está acoplada a la versión de `burn-onnx` que la generó; los archivos `.bpk` "no valen" con otras versiones, según advierte el autor.
- El codificador de texto está fijado a 77 tokens y el de audio a lotes de 5 ventanas, lo que limita la flexibilidad de uso sin recodificar.
- No se documentan idiomas soportados ni sesgos conocidos; el modelo base CLAP puede heredar sesgos de sus datos de entrenamiento, no detallados aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud en el espacio latente puede producir recuperaciones irrelevantes si las descripciones textuales se alejan de la distribución de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `laion/clap-htsat-unfused`.
- Sin benchmarks publicados ni métricas de rendimiento; no se recomienda para producción sin evaluación propia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.

## Enlaces

- [Hugging Face: rousseau/clap-htsat-unfused-burn](https://huggingface.co/rousseau/clap-htsat-unfused-burn)
- [Modelo base: laion/clap-htsat-unfused](https://huggingface.co/laion/clap-htsat-unfused)
- [Burn (framework Rust)](https://github.com/tracel-ai/burn)
- [Rusty Music (repositorio del autor)](https://github.com/rousseau/rusty-music)
- Paper de referencia: Wu et al., "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation", ICASSP 2023 (enlace no disponible en la información proporcionada)
