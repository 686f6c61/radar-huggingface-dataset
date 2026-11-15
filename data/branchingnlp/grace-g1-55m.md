# BranchingNLP/Grace-G1-55M

## Resumen

Grace-G1-55M es un modelo de lenguaje de tipo base (no ajustado a instrucciones) desarrollado por BranchingNLP, un proyecto independiente centrado en modelos generalistas pequenos y eficientes. Forma parte de la familia Grace, que abarca desde 55M hasta 1B de parametros, y esta entrenado desde cero con un corpus bilingue italiano/ingles. Su proposito principal es servir como pieza fundamental para investigacion en arquitecturas hibridas eficientes y como base para posteriores ajustes (la version Instruct se publica tras SFT).

La relevancia tecnica del modelo reside en su arquitectura: un transformer hibrido que combina capas Gated DeltaNet (un mixer lineal recurrente) con atencion completa en una proporcion 3:1, empleando ademas el optimizador Muon para las matrices 2D. Con 55,0 millones de parametros, 12 capas, d_model de 512 y una ventana de contexto de 2048 tokens, el modelo fue entrenado con 10.000 millones de tokens (unas 182 veces el numero de parametros), lo que lo situa en un regimen de sobreentrenamiento tipico de los modelos pequenos modernos.

El modelo se publica bajo licencia Apache-2.0 y esta pensado para completar texto, no para seguir instrucciones. Su interes practico es limitado fuera de la investigacion (conocimiento factual escaso, matematicas y razonamiento debiles), pero es un ejemplo util de como entrenar arquitecturas lineales hibridas en hardware de consumo: todo el entrenamiento se realizo en una unica RTX 3070 de 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido lineal/atencion: Gated DeltaNet (flash-linear-attention) en proporcion 3:1 con atencion completa gated; GQA + QK-norm + RoPE + output gate sigmoide |
| Parametros totales | 55.007.304 (55,0M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache-2.0 (pesos y codigo); los datasets de entrenamiento conservan sus licencias originales |
| Formato de pesos | safetensors (model.safetensors) + config.json + codigo proxy_arch incluido en el repo |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con 12 capas, d_model de 512, FFN SwiGLU con d_ff de 1408 y normalizacion RMSNorm en pre-norm. El mixer principal es Gated DeltaNet, un mecanismo lineal recurrente implementado mediante la libreria flash-linear-attention (kernels Triton), que se intercala con capas de atencion completa en una proporcion 3:1. Las capas de atencion usan GQA (8 cabezas de query, 2 de key/value), QK-norm, RoPE y una puerta de salida sigmoide al estilo de Qwen3-Next. Las capas Gated DeltaNet emplean 4 cabezas con dimension de cabeza 64. El vocabulario es de 32.768 tokens con tokenizador BPE.

El entrenamiento se realizo desde cero sobre 10.000 millones de tokens con un schedule WSD (warmup-stable-decay) y decaimiento en el ultimo 20% del entrenamiento. El mix de datos es bilingue italiano/ingles e incluye web (FineWeb-Edu, FineWeb2-it, Nemotron-CC), Wikipedia, libros, codigo, matematicas y pares de pregunta-respuesta. La perdida de validacion final fue de 2,5733. Como innovacion destacable, el optimizador Muon se aplica a las matrices 2D mientras que AdamW se reserva para embeddings y normas, y todo el entrenamiento cupo en una unica GPU RTX 3070 de 8 GB.

## Capacidades

- Generacion y completado de texto en italiano e ingles (modelo base, no sigue instrucciones).
- Modelado de lenguaje bilingue con vocabulario BPE compartido de 32.768 tokens.
- Razonamiento y matematicas muy limitados en la version base; el autor indica que mejoran tras el ajuste SFT en la version Instruct.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- No dispone de modo thinking, vision ni audio.
- Capacidad conversacional: no en la version base; la variante Grace-G1-55M-Instruct (tras SFT) es la destinada a asistente conversacional.
- Requiere GPU CUDA con la libreria fla (kernels Triton); las capas Gated DeltaNet no se ejecutan en CPU.

## Casos de uso

- Investigacion en arquitecturas hibridas lineales/atencion: el modelo sirve como banco de pruebas reproducible para estudiar el comportamiento de Gated DeltaNet frente a atencion completa en un regimen de 55M parametros y 10B tokens.
- Experimentos de sobreentrenamiento en hardware de consumo: permite replicar y analizar el regimen de ~182 tokens por parametro entrenando en una unica RTX 3070 de 8 GB, util para estudiar leyes de escalado en el extremo pequeno.
- Generacion de texto asistida bilingue italiano/ingles en entornos controlados: completado de frases, continuacion de parrafos y generacion de borradores donde no se requiera precision factual.
- Base para fine-tuning especifico de dominio: al ser un modelo base Apache-2.0, puede ajustarse con SFT o LoRA para tareas concretas (clasificacion, extraccion, resumen) partiendo de un checkpoint ya entrenado en italiano e ingles.
- Evaluacion comparativa de optimizadores: el uso de Muon para matrices 2D y AdamW para embeddings y normas lo convierte en un caso de estudio para medir el impacto del optimizador en modelos pequenos.
- Prototipado educativo: su tamano (0,2 GB de repo) y su codigo de inferencia autocontenido (proxy_arch) facilitan su uso en docencia y demostraciones de arquitecturas hibridas.
- Generacion de datos sinteticos a pequena escala: puede emplearse para producir texto de relleno o aumentacion de corpus en italiano/ingles, siempre con revision posterior por sus limitaciones factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final de 2,5733 tras 10.000 millones de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 55,0M de parametros, los pesos en bfloat16 ocupan aproximadamente 110 MB y en float32 unos 220 MB; el repositorio completo pesa 0,2 GB. El cuello de botella es el runtime de los kernels Triton, no la memoria.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y la libreria fla instalada. El propio autor entreno el modelo en una RTX 3070 de 8 GB, por lo que GPUs de gama media (RTX 3060, 3070, 4060, 4090) son suficientes. Tambien cabe en A100 y H100, aunque resultan sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer NVIDIA con CUDA. No se documenta soporte en CPU (las capas Gated DeltaNet requieren kernels Triton).
- Opciones de despliegue: el autor proporciona un script de inferencia manual con safetensors, transformers (AutoTokenizer) y el modulo proxy_arch incluido en el repo. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama no son viables sin soporte CPU de Gated DeltaNet.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grace-G1-55M | 55,0M | 2048 | Hibrida Gated DeltaNet + atencion (3:1) | Apache-2.0 | Hugging Face (BranchingNLP) |
| Modelos de ~50-60M tipo GPT-2 small | ~124M (GPT-2 small) | 1024 | Transformer denso | MIT (GPT-2) | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2048 | Transformer denso (Llama) | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,49B | 32.768 | Transformer denso (GQA) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Grace-G1-55M con estas alternativas; la comparacion se limita a parametros, contexto, arquitectura y licencia. Los modelos citados se incluyen como referencias de la misma categoria de tamano o de la misma tarea (generacion de texto bilingue de bajo coste).

## Limitaciones y advertencias

- Conocimiento factual muy limitado: con 55M de parametros el modelo inventa hechos, fechas, nombres y lugares. El autor lo advierte explicitamente; no debe usarse como fuente de informacion.
- Matematicas y razonamiento debiles en la version base; el autor indica que solo mejoran tras SFT en la version Instruct.
- Es un modelo base, no ajustado a instrucciones: no sigue ordenes ni mantiene formato conversacional de forma fiable.
- Contexto corto de 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo soporta italiano e ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Requiere GPU CUDA y la libreria fla (kernels Triton); no funciona en CPU, lo que limita su despliegue en entornos sin GPU.
- Riesgo de sesgos heredados de los corpus web (FineWeb-Edu, FineWeb2-it, Nemotron-CC) y de los libros y datos de Q&A utilizados; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0 para pesos y codigo, pero los datasets de entrenamiento conservan sus licencias originales, lo que puede afectar a la redistribucion o al uso comercial derivado de determinados datos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa ni reportes de la comunidad sobre su comportamiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/BranchingNLP/Grace-G1-55M
- Organizacion BranchingNLP: https://huggingface.co/BranchingNLP
- Libreria flash-linear-attention (kernels Triton para Gated DeltaNet): https://github.com/fla-org/flash-linear-attention
