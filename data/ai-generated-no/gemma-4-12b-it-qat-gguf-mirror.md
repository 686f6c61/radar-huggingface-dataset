# AI-GENERATED-NO/gemma-4-12B-it-qat-GGUF-mirror

## Resumen

Gemma 4 12B IT QAT es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, distribuido en formato GGUF con cuantización Q4_0 resultante de un proceso de quantisation-aware training (QAT). El repositorio aquí descrito es un espejo no oficial publicado por AI-GENERATED-NO que replica sin modificaciones los ficheros del repositorio original `google/gemma-4-12B-it-qat-q4_0-gguf`, con el objetivo de garantizar que la aplicación de escritorio My AI Swiss Knife descargue exactamente esos binarios.

El modelo base es `google/gemma-4-12B-it`, con 11.907.350.576 parámetros totales según los safetensors del modelo original, y está orientado a tareas image-text-to-text (visión y lenguaje). La distribución en GGUF Q4_0 con un fichero `mmproj` separado permite ejecutar inferencia multimodal en llama.cpp y herramientas compatibles, incluyendo equipos de consumo.

La relevancia de este espejo es operativa más que técnica: fija una versión concreta (commit `29d097773436b69ff9feafd636ab4cf873786537`), publica los hashes SHA256 de cada fichero y mantiene la licencia Apache 2.0 del original. No introduce mejoras ni cambios respecto al modelo de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 11.907.350.576 (modelo base, safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT), unica incluida en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-12b-it-qat-q4_0.gguf` + `mmproj-gemma-4-12b-it-qat-q4_0.gguf`) |

Ficheros del repositorio:

| Fichero | Bytes | SHA256 |
|---|---|---|
| gemma-4-12b-it-qat-q4_0.gguf | 6.975.879.296 | 93567e57a8fe10b23569b9d9ec38cd005deedf71e29477c421a4b83f418a538b |
| mmproj-gemma-4-12b-it-qat-q4_0.gguf | 175.115.616 | cb018338a7538a9814d994bfe54644c71eb7ed54e31eae2f721e45fd3c260da7 |

Tamano total del repositorio: 7,2 GB.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-4-12B-it` mas alla de su caracter multimodal (procesa imagen y texto y genera texto). No se especifican numero de capas, mecanismo de atencion, tipo de tokenizador ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Sobre el entrenamiento, la model card del espejo solo indica que la cuantizacion Q4_0 se obtuvo mediante quantisation-aware training (QAT) realizado por Google DeepMind, y que la conversion a GGUF tambien es obra de Google DeepMind. No se aportan datos sobre volumen de tokens, composicion del dataset, fases de RLHF/DPO ni proceso de alineacion. El espejo no modifica ni reentrena el modelo: replica byte a byte los ficheros del repositorio original.

## Capacidades

- Generacion de texto conversacional en formato instruction-tuned (sufijo IT), orientado a dialogos multi-turno.
- Comprension de imagenes junto con texto (pipeline image-text-to-text), cargando el fichero `mmproj` junto al modelo en llama.cpp mediante `--mmproj`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso en despliegues tipo API.
- Capacidades de razonamiento, codigo o matematicas: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Aplicacion de escritorio con IA local: el espejo existe precisamente para que My AI Swiss Knife descargue una version fija y verificable de los GGUF; el modelo se usa como motor de chat y vision dentro de la app sin depender de cambios en el repositorio original.
- Descripcion de imagenes en local: cargando `mmproj-gemma-4-12b-it-qat-q4_0.gguf` con `--mmproj` en llama.cpp, el modelo puede recibir una imagen y generar una descripcion textual o responder preguntas sobre ella sin enviar datos a la nube.
- Asistente conversacional en estaciones de trabajo sin GPU dedicada: con cuantizacion Q4_0 y ~7 GB de pesos, es viable en equipos con 8-12 GB de RAM/VRAM, adecuado para prototipos y uso personal.
- Pipelines de documentacion tecnica con capturas: extraccion de informacion de diagramas, pantallazos o figuras combinada con texto de contexto en una misma conversacion.
- Verificacion de integridad en despliegues: los hashes SHA256 publicados permiten validar los binarios en pipelines de CI/CD antes de empaquetarlos en una distribucion de software.
- Evaluacion comparativa de cuantizaciones: al ser un QAT Q4_0 oficial, sirve como referencia para medir la perdida de calidad frente a cuantizaciones no QAT del mismo modelo base en tareas de vision y texto.
- Reproducibilidad en entornos offline: al fijar commit y hashes, permite reconstruir exactamente el mismo entorno de inferencia en maquinas aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 7 GB para los pesos Q4_0, mas overhead de contexto KV y del proyector multimodal (`mmproj`, ~175 MB); en la practica, prever 8-10 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, encaja en GPUs consumer con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM; en GPUs de 8 GB puede requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y `--mmproj` para vision); otros runners compatibles con GGUF no confirmados en la informacion disponible. vLLM, TGI u Ollama no se mencionan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT QAT Q4_0 (este espejo) | 11.907.350.576 | no disponible | GGUF Q4_0 + mmproj | Apache 2.0 | Espejo no oficial de Google DeepMind |
| google/gemma-4-12B-it-qat-q4_0-gguf (original) | 11.907.350.576 | no disponible | GGUF Q4_0 + mmproj | Apache 2.0 | Fuente oficial; commit 29d0977 |
| google/gemma-4-12B-it (modelo base) | 11.907.350.576 | no disponible | safetensors | Apache 2.0 | Pesos sin cuantizar; requiere mas memoria |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo no oficial: AI-GENERATED-NO no esta afiliado a Google y el espejo no esta respaldado por Google DeepMind; para uso en produccion conviene referenciar el repositorio oficial.
- Solo se distribuye la cuantizacion Q4_0; no hay otras variantes (Q5, Q8, FP16) en este repositorio.
- La cuantizacion Q4_0, aunque sea QAT, puede degradar calidad frente a los pesos completos en tareas exigentes; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Sin datos publicados sobre sesgos, tasas de alucinacion ni comportamiento por idioma; el campo de idiomas esta vacio.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de atribucion a Google DeepMind y verificar los terminos del repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en 2026-11-24; no hay historial de uso que respalde su mantenimiento.
- Para vision es imprescindible cargar el fichero `mmproj` junto al modelo; omitirlo desactiva la entrada de imagenes.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/AI-GENERATED-NO/gemma-4-12B-it-qat-GGUF-mirror
- Repositorio original de los GGUF: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Aplicacion del autor del espejo: https://ai-generated.no
- Commit replicado: 29d097773436b69ff9feafd636ab4cf873786537
