# liodon-ai/LoCo-7B-FP8

## Resumen

LoCo-7B-FP8 es una cuantización en FP8 del modelo MuyaoYuan/LoCo-7B, publicada por Liodon AI. Se trata de un modelo de generación de texto de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) basado en la arquitectura Qwen2, según los tags del repositorio. La operación de cuantización reduce el peso de los pesos originales de 15,2 GB a 8,7 GB, manteniendo el `lm_head` sin cuantizar para preservar la calidad de salida.

El modelo emplea el esquema `FP8_DYNAMIC` implementado con llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son esencialmente una conversión directa de los originales, sin sesgo introducido por un conjunto de calibración.

Su relevancia práctica radica en que permite desplegar un modelo de 7B en GPUs con compute capability ≥ 8,9 (Ada, Hopper o Blackwell) con aproximadamente la mitad del footprint de memoria del modelo original, con soporte directo en vLLM, TGI y SGLang. La información pública disponible sobre el modelo base es escasa: no se detallan los datos de entrenamiento, los idiomas soportados ni los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2, segun tags del repositorio) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base MuyaoYuan/LoCo-7B) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es LoCo-7B, de MuyaoYuan, construido sobre la arquitectura Qwen2 segun los tags del repositorio. No se dispone de informacion publica en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion. Liodon AI aplico el esquema `FP8_DYNAMIC` mediante llm-compressor: los pesos se castean a FP8 E4M3 por canal de forma estatica y las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no requerir calibracion, el proceso evita el sesgo que introduciria un dataset de calibracion y produce una conversion numerica directa de los pesos originales. El `lm_head` se mantiene en precision original por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen2, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el modelo es exclusivamente de texto.
- Inferencia eficiente en FP8: ejecucion nativa en GPUs con compute capability ≥ 8,9 mediante vLLM, TGI o SGLang.

## Casos de uso

- Despliegue de chat conversacional en produccion: el modelo puede servirse con `vllm serve liodon-ai/LoCo-7B-FP8` para gestionar conversaciones multi-turno, con un footprint de 8,7 GB que reduce el coste por instancia frente al modelo en BF16.
- Inferencia de bajo coste en GPUs Ada/Hopper: al ejecutarse en FP8 nativo en RTX 40-series, L4/L40S o H100/H200, permite obtener mayor throughput por GPU que la version de 15,2 GB, adecuado para endpoints con alta concurrencia.
- Backend de agentes y asistentes: al ser compatible con TGI y SGLang, puede integrarse como motor de generacion en pipelines de agentes que requieran baja latencia, aunque las capacidades de tool calling del modelo base no estan documentadas.
- Prototipado e investigacion: la licencia `other` y el tamano contenido permiten experimentar con el modelo en entornos academicos, siempre que se verifiquen los terminos del modelo base.
- Fine-tuning y evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de FP8 frente a BF16 en tareas concretas del dominio propio.
- Servicio gestionado sin infraestructura propia: esta disponible como endpoint en FriendliAI, lo que permite probar el modelo via API antes de desplegarlo en infraestructura propia.
- Migracion de despliegues existentes de LoCo-7B: sustituir el checkpoint original por esta version FP8 en un servidor vLLM o TGI ya operativo reduce el uso de VRAM a la mitad sin cambiar la API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,7 GB solo para pesos; con cache KV y overhead de runtime, se recomienda un minimo de 12-16 GB de VRAM para contextos moderados.
- GPUs recomendadas: H100, H200, L40S, L4 (compute capability ≥ 8,9) para ejecucion FP8 nativa; B100/B200/GB10 tambien soportadas.
- GPUs consumer compatibles: RTX 40-series (Ada) soportan FP8 nativo; en GPUs anteriores (Ampere, Turing) vLLM y TGI descomprimen a mayor precision, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/LoCo-7B-FP8`), Text Generation Inference (imagen Docker oficial), SGLang (`python -m sglang.launch_server`) y Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/LoCo-7B-FP8 | 7,6B | no disponible | FP8 dinamico (8,7 GB) | other | Hugging Face, FriendliAI |
| MuyaoYuan/LoCo-7B (base) | 7,6B | no disponible | BF16 (15,2 GB) | other | Hugging Face |
| Alternativas Qwen2-7B cuantizadas en FP8 | ~7,6B | no disponible | FP8 | variable | Hugging Face |

La comparacion con otros modelos de la misma categoria no puede completarse con datos verificables: no se dispone de informacion sobre benchmarks del modelo base ni de las alternativas, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La licencia es `other` y se hereda del modelo base MuyaoYuan/LoCo-7B; es imprescindible revisar los terminos originales antes de cualquier uso comercial.
- No se documentan los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas sin evaluacion previa.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- La cuantizacion FP8 introduce una perdida de precision respecto a BF16; aunque el esquema dinamico sin calibracion minimiza el sesgo, conviene validar la calidad en el dominio de uso concreto.
- En GPUs con compute capability inferior a 8,9, el runtime descomprime los pesos y se pierden las ventajas de memoria y velocidad de FP8.
- La longitud de contexto no esta documentada, lo que limita la planificacion de despliegues con ventanas largas.
- El modelo tiene un volumen de descargas muy bajo (22) y ningun like, por lo que carece de validacion comunitaria significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/LoCo-7B-FP8
- Modelo base: https://huggingface.co/MuyaoYuan/LoCo-7B
- Perfil del cuantizador (Liodon AI): https://huggingface.co/liodon-ai
- Endpoint en FriendliAI: https://friendli.ai/models/liodon-ai/LoCo-7B-FP8
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
