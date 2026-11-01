# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT

## Resumen

LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman-madhiai. Se trata de un modelo de generacion de texto de pequeno tamano (354,5 millones de parametros) orientado a conversacion, entrenado con la libreria Unsloth y TRL de Hugging Face sobre un dataset de entornos de datos emparejados ("SmolDataEnvs-Matched2k-Mix"). El modelo hereda la arquitectura LFM2 del modelo base de Liquid AI, disenada para inferencia eficiente en dispositivos de borde.

El interes de esta ficha es acotado: no es un lanzamiento oficial de Liquid AI, sino una adaptacion comunitaria de un modelo pequeno. Su relevancia practica reside en que demuestra el flujo de ajuste fino rapido sobre la familia LFM2 con herramientas de bajo coste computacional, y en que, por su tamano, puede ejecutarse en hardware muy modesto (CPU, GPUs de gama baja, dispositivos moviles). No obstante, la model card es practicamente inexistente en cuanto a detalles de entrenamiento, datos o evaluacion.

La informacion disponible procede exclusivamente de los metadatos de Hugging Face y de una model card minima. Cualquier dato no documentado se indica explicitamente como "no disponible" en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada del modelo base LiquidAI/LFM2.5-350M); detalles internos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint LiquidAI/LFM2.5-350M. La arquitectura subyacente es LFM2, la familia de modelos de Liquid AI disenada para eficiencia en inferencia; sin embargo, la model card no especifica la configuracion exacta de capas, atencion ni contexto del modelo base, por lo que no se detallan aqui mas alla de lo indicado. El numero de parametros (354,5 M) coincide con el checkpoint safetensors publicado.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, lo que sugiere un pipeline de SFT estandar sobre el dataset "SmolDataEnvs-Matched2k-Mix". No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni hiperparametros. Tampoco se indica si se congelaron capas o se aplico LoRA/QLoRA; el hecho de que el repo contenga pesos completos en safetensors (0,7 GB) es compatible con un merge de adaptadores, pero no se confirma.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base y ajustada sobre datos de tipo "entornos de datos emparejados".
- Generacion de texto autoregresiva estandar (pipeline text-generation).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con `transformers`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificacion y etiquetado de texto ligero: por su tamano (354 M), puede ejecutarse en CPU para tareas de clasificacion o extraccion de entidades en lotes, con coste energetico minimo.
- Prototipado rapido de asistentes conversacionales en ingles: util para validar flujos de dialogo antes de escalar a modelos mayores, dado que el checkpoint ocupa menos de 1 GB.
- Generacion de respuestas en entornos con recursos restringidos: despliegue en dispositivos de borde o contenedores sin GPU, donde un modelo de 350 M es viable en RAM.
- Filtrado y preprocesado de datos: generacion de resumenes cortos o reformulaciones en pipelines de limpieza de corpus en ingles.
- Base para nuevos ajustes finos: al ser un SFT abierto con licencia Apache 2.0, sirve como punto de partida para experimentos de fine-tuning con Unsloth/TRL en tareas especificas.
- Educacion e investigacion: ejemplo reproducible de ajuste fino de la familia LFM2 con herramientas de bajo coste, util para cursos o comparativas de pipelines SFT.
- Pruebas de integracion con TGI: validacion de despliegues de Text Generation Inference con modelos pequenos antes de migrar a checkpoints mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB en FP16/BF16 (pesos ~0,7 GB); en cuantizacion de 8 bits, en torno a 0,4-0,5 GB; en 4 bits, por debajo de 0,3 GB. Estimaciones calculadas a partir del numero de parametros, no verificadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo cabe tambien en GPUs integradas y en CPU.
- Cabe en consumer GPU: si, en practicamente todas las GPUs con al menos 2 GB de VRAM; tambien en CPU y en dispositivos moviles de gama alta.
- Opciones de despliegue: `transformers`, Text Generation Inference (tag declarado), y previsiblemente llama.cpp/Ollama si se genera un GGUF a partir de los pesos safetensors (no publicado por el autor).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT (este) | 354,5 M | no disponible | Apache 2.0 | Hugging Face (repo comunitario) | SFT comunitario, solo ingles, sin benchmarks |
| LiquidAI/LFM2.5-350M (base) | 350 M aprox. | no disponible | Apache 2.0 (segun modelo base) | Hugging Face (oficial) | Modelo base sin ajuste conversacional |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Hugging Face (oficial) | Multilingue, con benchmarks publicados |
| SmolLM2-360M | 362 M | 8192 tokens (segun documentacion oficial) | Apache 2.0 | Hugging Face (oficial) | Multilingue, con benchmarks publicados |

La comparativa se limita a la categoria de modelos sub-500M; los datos de contexto de los alternativos provienen de su documentacion oficial y no de esta ficha.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros ni evaluacion, lo que impide validar la calidad del ajuste.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el tamano reducido del modelo (354 M) y la falta de evaluacion publicada.
- Solo soporta ingles segun la etiqueta de idioma; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Sesgos: no documentados, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de genero, culturales y de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base LiquidAI/LFM2.5-350M antes de desplegar en produccion.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validacion por la comunidad.
- No recomendado para produccion sin una evaluacion previa propia en la tarea objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-Mix-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
