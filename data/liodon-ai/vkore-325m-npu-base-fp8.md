# liodon-ai/VKORE-325M-NPU-Base-FP8

## Resumen

VKORE-325M-NPU-Base-FP8 es una cuantizacion en FP8 dinamico del modelo base FINAL-Bench/VKORE-325M-NPU-Base, publicada por Liodon AI. Se trata de un modelo de generacion de texto de arquitectura tipo Llama (segun los tags de HuggingFace) con 325.624.832 parametros totales y un unico checkpoint denso, no MoE. El autor de la cuantizacion es el usuario liodon-ai, que no es el desarrollador original del modelo base.

El interes de esta publicacion es practico: reduce el peso del repositorio de 2,6 GB a 0,3 GB mediante el esquema FP8_DYNAMIC de llm-compressor, con pesos en FP8 (E4M3) por canal y activaciones cuantizadas dinamicamente por token en inferencia. Al no requerir dataset de calibracion, los pesos cuantizados son un casteo directo de los originales, sin sesgo de conjunto de calibracion, y el `lm_head` queda sin cuantizar.

Es relevante para quienes necesitan desplegar un modelo pequeno en GPUs con compute capability 8.9 o superior (Ada, Hopper, Blackwell) con vLLM, TGI o SGLang, aprovechando el ahorro de memoria y el mayor throughput que ofrece la ejecucion nativa en FP8. La informacion publica sobre el modelo base es muy escasa: no hay datos de contexto, idiomas, composicion del dataset de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama` en HuggingFace) |
| Parametros totales | 325.624.832 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3), pesos por canal y activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors con `compressed-tensors` |
| Tamano del repositorio | 0,3 GB (original: 2,6 GB) |
| Herramienta de cuantizacion | llm-compressor (esquema `FP8_DYNAMIC`) |
| Modelo base | FINAL-Bench/VKORE-325M-NPU-Base |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 325M parametros etiquetado como `llama` en HuggingFace, lo que sugiere una arquitectura derivada de la familia Llama (atención multi-cabeza, capas pre-norm, activaciones SwiGLU), aunque no se dispone de la configuracion exacta de capas, dimensiones ocultas, cabezas de atencion ni vocabulario. Tampoco hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion: se aplica el esquema FP8_DYNAMIC de llm-compressor, que castea los pesos a FP8 (E4M3) por canal de forma anticipada y cuantiza las activaciones dinamicamente por token en tiempo de inferencia. Este esquema no necesita calibracion, de modo que los pesos cuantizados son un casteo numerico directo de los originales. El `lm_head` se mantiene en precision original por su impacto desproporcionado en la calidad frente a su tamano. No se documentan innovaciones en decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline `text-generation` declarado.
- Compatible con Text Generation Inference (`text-generation-inference` en los tags).
- Compatible con vLLM, TGI y SGLang, segun los comandos de inicio rapido de la model card.
- Cuantizacion FP8 con `compressed-tensors`, ejecutable de forma nativa en GPUs con compute capability 8.9 o superior.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modo thinking: no disponible; el modelo es solo texto.
- Razonamiento, codigo y matematicas: no disponible sin benchmarks ni model card del modelo base.

## Casos de uso

- Despliegue de bajo coste en GPUs Ada/Hopper: el modelo ocupa 0,3 GB en FP8, por lo que puede servirse con vLLM o TGI en una unica GPU pequena (L4, L40S, RTX 40-series) dejando la mayor parte de la VRAM libre para el KV cache y el batching.
- Prototipado rapido de pipelines de generacion de texto: al ser un modelo de 325M parametros, el tiempo de arranque y la latencia por token son bajos, lo que permite iterar sobre prompts y plantillas sin esperas largas.
- Pruebas de integracion de `compressed-tensors` y FP8 en infraestructura propia: sirve como caso de validacion de que el stack vLLM/TGI/SGLang con cuantizacion FP8 funciona en el hardware objetivo antes de migrar modelos mayores.
- Servicio de generacion de texto de proposito general con requisitos de memoria estrictos: util cuando el presupuesto de VRAM es limitado y se necesita un modelo de texto pequeno con pesos ya cuantizados, sin tener que ejecutar un proceso de calibracion.
- Fine-tuning o evaluacion comparativa frente al modelo base: al ser un casteo directo sin calibracion, permite medir la degradacion introducida por FP8 frente a los pesos originales en tareas concretas del dominio propio.
- Entornos de CI/CD para pruebas de regresion de inferencia: su tamano reducido permite incluirlo en contenedores de test que validan el comportamiento del servidor de inferencia sin consumir recursos significativos.
- Educacion y experimentacion con cuantizacion: sirve para ilustrar el flujo de llm-compressor con FP8_DYNAMIC y comparar el comportamiento en GPUs con y sin soporte nativo de FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB para los pesos en FP8; el consumo total depende del KV cache, que a su vez depende de la longitud de contexto (no disponible) y del tamano de lote.
- GPU recomendadas: NVIDIA con compute capability 8.9 o superior para ejecucion FP8 nativa, es decir, RTX 40-series (4090, 4080, etc.), L4, L40S, H100, H200, B100, B200 y GB10.
- GPUs sin soporte nativo de FP8: vLLM y TGI descomprimen a mayor precision para ejecutar, lo que anula la ventaja de velocidad y memoria; el modelo seguiria funcionando pero sin el beneficio de FP8.
- Cabe en cualquier GPU consumer con suficiente VRAM para el contexto y el lote; el limite practico es el KV cache, no los pesos.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/VKORE-325M-NPU-Base-FP8`), Text Generation Inference (imagen `ghcr.io/huggingface/text-generation-inference` con `--model-id`) y SGLang (`python -m sglang.launch_server --model-path`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VKORE-325M-NPU-Base-FP8 (este) | 325,6M | no disponible | FP8 dinamico (E4M3) | other | HuggingFace, 30 descargas |
| FINAL-Bench/VKORE-325M-NPU-Base | 325,6M | no disponible | pesos originales (2,6 GB) | other | HuggingFace |
| Alternativas de ~300M parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion disponible modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos del modelo base; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion.
- La cuantizacion FP8 puede introducir degradacion numerica respecto al modelo base; aunque el esquema es un casteo directo sin calibracion, no se han publicado mediciones de la perdida de calidad.
- La licencia es "other" y no se detallan sus terminos en la informacion disponible; es imprescindible revisar la licencia del modelo base (FINAL-Bench/VKORE-325M-NPU-Base) antes de cualquier uso comercial.
- Longitud de contexto e idiomas soportados desconocidos; no se puede garantizar un comportamiento correcto en contextos largos ni en castellano.
- El modelo tiene solo 325M parametros, por lo que su capacidad de razonamiento, codigo y conocimiento factual es limitada en comparacion con modelos de mayor tamano.
- La ejecucion FP8 requiere hardware Ada, Hopper o Blackwell; en GPUs anteriores se pierde el beneficio de memoria y velocidad.
- El repositorio tiene 30 descargas y 0 likes, sin validacion de la comunidad; conviene tratarlo como un artefacto experimental.
- No se declaran capacidades de tool calling, agentes ni multimodalidad; no deben asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/VKORE-325M-NPU-Base-FP8
- Modelo base: https://huggingface.co/FINAL-Bench/VKORE-325M-NPU-Base
- Perfil del autor de la cuantizacion: https://huggingface.co/liodon-ai
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
