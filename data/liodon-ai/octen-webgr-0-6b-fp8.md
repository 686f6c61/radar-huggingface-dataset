# liodon-ai/Octen-WebGR-0.6B-FP8

## Resumen

Octen-WebGR-0.6B-FP8 es una cuantizacion en FP8 dinamico del modelo Octen/Octen-WebGR-0.6B, publicada por Liodon AI. El modelo original pertenece a la familia Qwen3 (segun los tags de Hugging Face), con 730.267.648 parametros totales segun los pesos en safetensors, y esta orientado a generacion de texto conversacional. La intervencion de Liodon AI no modifica el entrenamiento: unicamente convierte los pesos a FP8 (E4M3) por canal y deja las activaciones cuantizadas de forma dinamica por token en tiempo de inferencia.

La relevancia de esta ficha esta en el empaquetado para despliegue: reduce el repositorio de 1,5 GB a 1,0 GB y permite servir el modelo con vLLM, TGI o SGLang con soporte nativo de FP8, siempre que la GPU tenga compute capability 8.9 o superior. Es una opcion util para entornos con VRAM limitada o para pipelines que ya trabajan en FP8 y quieren evitar la de-cuantizacion implicita.

Conviene subrayar que se trata de un modelo pequeno (0,6B nominales, 730M reales) y que la model card no documenta idiomas, datos de entrenamiento ni resultados de benchmarks. La licencia es "other" y no se detalla su texto, por lo que el uso comercial queda condicionado a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (inferido de los tags; la model card no lo detalla) |
| Parametros totales | 730.267.648 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto detallado en la model card) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3, segun los tags de Hugging Face. Esta version concreta no aporta cambios arquitectonicos: es una cuantizacion post-entrenamiento realizada con llm-compressor bajo el esquema `FP8_DYNAMIC`. En este esquema los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. El esquema no requiere dataset de calibracion, de modo que los pesos cuantizados son practicamente una conversion directa de los originales, sin sesgo introducido por una muestra de calibracion. La capa `lm_head` se mantiene sin cuantizar, practica habitual por su tamano reducido y su impacto desproporcionado en la calidad si se cuantiza.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El repositorio pasa de 1,5 GB (modelo original) a 1,0 GB tras la cuantizacion.

## Capacidades

- Generacion de texto conversacional, segun el pipeline `text-generation` y el tag `conversational`.
- Compatible con text-generation-inference y con endpoints compatibles, lo que facilita su integracion en APIs tipo OpenAI.
- Cuantizacion FP8 con soporte nativo en vLLM, TGI y SGLang.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking explicito: no disponible.

## Casos de uso

- Servicio de generacion de texto conversacional de baja latencia: el modelo, al ser pequeno (730M parametros) y estar en FP8, puede servirse con vLLM en GPUs de gama media y responder con latencia baja en conversaciones de una o pocas interacciones.
- Despliegue en infraestructura con VRAM limitada: al ocupar 1,0 GB en disco y requerir una fraccion de VRAM muy inferior a la de modelos de 7B o 13B, encaja en entornos con GPUs compartidas o en instancias cloud de bajo coste.
- Backend de APIs compatibles con OpenAI: el tag `endpoints_compatible` y el soporte de TGI permiten exponer el modelo detras de una interfaz estandar sin adaptar los clientes existentes.
- Prototipado rapido de aplicaciones de chat: al no necesitar calibracion ni pasos adicionales, se puede levantar con `vllm serve liodon-ai/Octen-WebGR-0.6B-FP8` y validar flujos conversacionales en minutos.
- Evaluacion de pipelines FP8 en produccion: util para medir el rendimiento y la calidad de un modelo en FP8 antes de aplicar la misma receta a modelos mayores del mismo linaje Qwen3.
- Tareas de generacion de texto acotadas (respuestas cortas, clasificacion generativa, reformulacion): adecuado por su tamano reducido y su naturaleza conversacional, siempre que la tarea no exija contexto largo ni capacidades especiales no documentadas.
- Integracion en CI/CD para pruebas de humo de servicios de inferencia: su huella pequena permite levantarlo en runners con GPU para validar despliegues de vLLM/TGI/SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de pesos (1,0 GB en FP8) y la necesidad de cache KV, es esperable que quepa en GPUs consumer con 8 GB o mas, aunque no se confirma en la model card.
- GPU recomendadas: cualquier NVIDIA con compute capability 8.9 o superior para ejecucion FP8 nativa (Ada/Hopper/Blackwell): RTX 40-series, L4, L40S, H100, H200, B100, B200, GB10.
- GPUs consumer: si cabe en RTX 40-series por el soporte FP8; en GPUs anteriores vLLM/TGI de-cuantizan a un tipo soportado, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Octen-WebGR-0.6B-FP8`), Text Generation Inference (imagen `ghcr.io/huggingface/text-generation-inference` con `--model-id`), SGLang (`python -m sglang.launch_server --model-path ...`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Octen-WebGR-0.6B-FP8 | 730.267.648 | no disponible | FP8 dinamico | other | Hugging Face, vLLM/TGI/SGLang |
| Octen/Octen-WebGR-0.6B (base) | no disponible | no disponible | BF16/FP16 (original, 1,5 GB) | other | Hugging Face |
| Qwen3-0.6B (familia referenciada por tags) | no disponible en esta busqueda | no disponible | multiples | no disponible | Hugging Face |

La comparativa se limita al modelo base y a la familia Qwen3 citada en los tags; no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo original ni del proceso de cuantizacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; por el tamano reducido del modelo es esperable una capacidad limitada de verificacion factual, aunque no se aportan datos.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni lista de idiomas.
- Licencia "other": el uso comercial queda supeditado al texto de la licencia del modelo base Octen/Octen-WebGR-0.6B, que no se detalla en esta ficha.
- La ejecucion FP8 nativa exige compute capability 8.9 o superior; en GPUs anteriores vLLM/TGI de-cuantizan, con perdida de las ventajas de memoria y velocidad.
- `lm_head` queda sin cuantizar, por lo que el ahorro de memoria no es total respecto al modelo original.
- No hay datos de benchmarks ni de calidad tras la cuantizacion, por lo que no se puede garantizar que la degradacion sea despreciable en tareas exigentes.
- Repositorio con muy pocas descargas (23) y creado recientemente (2026-10-29), lo que reduce la validacion comunitaria.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/Octen-WebGR-0.6B-FP8
- Modelo base: https://huggingface.co/Octen/Octen-WebGR-0.6B
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
