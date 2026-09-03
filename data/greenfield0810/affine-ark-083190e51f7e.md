# greenfield0810/affine-ark-083190e51f7e

## Resumen

Este repositorio es un archivo espejo de un checkpoint competidor del subnet 120 de Bittensor, conocido como Affine. El autor del repositorio, `greenfield0810`, no es el creador del modelo, sino que ha preservado una copia byte a byte de un checkpoint original alojado en `afgod1079/Affine-5ejzgj7kv5-cp1200`, ante la práctica habitual de que los repositorios de ese leaderboard se vuelvan privados en pocos días tras los duelos. Según la model card, el 31% de los challengers que han competido alguna vez ya son inaccesibles.

El modelo subyacente tiene 35.107.181.936 parámetros totales, un tamaño de 70,2 GB distribuidos en 21 shards, y los tags de HuggingFace indican que se trata de una arquitectura `qwen3_5_moe` con pipeline `image-text-to-text`, lo que sugiere un modelo multimodal de arquitectura MoE basado en la familia Qwen. Sin embargo, no se dispone de documentación oficial del modelo original, por lo que todos los detalles técnicos más allá de los metadatos del repositorio deben considerarse no confirmados.

La relevancia de este repositorio no reside en el modelo en sí, sino en su función de archivo y preservación dentro del ecosistema de Bittensor, donde la trazabilidad y la reproducibilidad de los checkpoints que compiten en los subnets es un problema operativo real. Para un investigador, este repositorio ofrece acceso a un checkpoint que de otro modo podría desaparecer, aunque sin garantías sobre su procedencia, licencia o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (segun tags de HuggingFace, no confirmado) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (21 shards, 70,2 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la informacion disponible. Los tags de HuggingFace indican `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) perteneciente a la familia Qwen 3.5, con capacidad multimodal `image-text-to-text`. Esto implicaria un transformer con capas de atencion dispersa y rutado de tokens a expertos especializados, probablemente con un componente de vision para procesar imagenes ademas de texto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se conocen innovaciones tecnicas especificas del checkpoint. Al ser un mirror sin documentacion del autor original, cualquier afirmacion sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de texto y comprension de lenguaje natural (presumible, dado el origen Qwen).
- Procesamiento multimodal de imagen y texto (segun el pipeline `image-text-to-text`).
- Capacidades de conversacion y respuesta a instrucciones (segun el tag `conversational`).
- Soporte de tool calling y function calling: no confirmado.
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.

## Casos de uso

Dado que se trata de un archivo espejo sin documentacion oficial, los casos de uso son especulativos y dependen de las capacidades reales del checkpoint, que no han sido verificadas. Con esa salvedad:

- Preservacion de checkpoints para investigacion: el caso de uso principal de este repositorio es servir como respaldo accesible de un checkpoint que podria desaparecer del leaderboard de Affine, permitiendo a investigadores reproducir o auditar resultados de duelos pasados.
- Analisis de modelos competidores en Bittensor: investigadores del subnet 120 pueden descargar este checkpoint para estudiar las estrategias de entrenamiento de competidores, comparar pesos y entender que configuraciones obtienen mejores resultados en los duelos.
- Fine-tuning posterior: si el checkpoint es utilizable, un desarrollador podria usarlo como punto de partida para fine-tuning en tareas especificas, aprovechando los 35B parametros del modelo base.
- Evaluacion comparativa offline: equipos que desarrollan modelos para Affine pueden evaluar este checkpoint localmente para calibrar sus propias metricas antes de entrar en el leaderboard.
- Auditoria de seguridad y alineacion: organizaciones que evaluan riesgos de modelos publicados pueden analizar este checkpoint para detectar sesgos, vulnerabilidades o comportamientos problematicos antes de que desaparezca.
- Replicacion de experimentos: dado que el repositorio incluye un archivo de procedencia (`_affine_provenance.json`), los investigadores pueden rastrear el historial del checkpoint y replicar experimentos con trazabilidad completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna tabla de rendimiento, ni comparaciones con otros modelos, ni metricas de evaluacion. El unico dato de rendimiento indirecto es que el checkpoint "never crowned" (nunca fue coronado) en el leaderboard de Affine, lo que indica que no gano ningun duelo, pero no proporciona informacion cuantitativa sobre su calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.107 millones de parametros, una inferencia en precision FP16 requeriria aproximadamente 70 GB de VRAM solo para los pesos. Con cuantizacion INT8 se reduciria a unos 35 GB, y con INT4 a unos 18 GB, aunque estas cifras son estimaciones teoricas y no estan confirmadas para este checkpoint concreto.
- GPU recomendadas: para inferencia en FP16 se necesitarian GPUs de clase profesional como A100 80GB, H100 80GB o multiples RTX 4090 (24GB) en paralelo. Con cuantizacion INT4 podria caber en una sola RTX 4090 o RTX 3090.
- Si cabe en consumer GPU: solo con cuantizacion agresiva (INT4 o inferior) y aun asi con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion). No se ha verificado la compatibilidad real.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo pertenece a la familia Qwen 3.5 MoE con 35B parametros, lo que lo situaria en un rango similar a otros modelos MoE de tamano medio como Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen2.5-MoE (14,3B activos). Sin embargo, al no tener datos de rendimiento ni confirmacion de la arquitectura, cualquier comparacion seria especulativa. La unica comparacion objetiva posible es con el repositorio original `afgod1079/Affine-5ejzgj7kv5-cp1200`, del cual este es un mirror byte a byte, por lo que son identicos en contenido.

## Limitaciones y advertencias

- Este no es un modelo original: es una copia no autorizada de un checkpoint de un competidor de Bittensor. El autor del repositorio lo declara explicitamente y ofrece retirarlo si el propietario original lo solicita.
- Licencia desconocida: no se especifica ninguna licencia, por lo que el uso comercial, la redistribucion o el fine-tuning pueden violar los derechos del autor original.
- Sin documentacion tecnica: no hay model card del modelo original, ni especificaciones de entrenamiento, ni benchmarks. Cualquier uso en produccion se basa en suposiciones no verificadas.
- Riesgo de sesgos y alucinaciones: al ser un modelo de 35B entrenado con datos desconocidos, es probable que presente sesgos tipicos de modelos de esta escala, pero no hay forma de evaluarlos sin documentacion.
- Procedencia dudosa: el checkpoint proviene de un entorno competitivo (Bittensor) donde los modelos se entrenan para ganar duelos, lo que puede implicar optimizaciones especificas para el leaderboard que no se generalizan a tareas del mundo real.
- Fecha de creacion futura: el repositorio esta fechado en septiembre de 2026, lo que sugiere que la informacion puede ser experimental o que el modelo es muy reciente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/greenfield0810/affine-ark-083190e51f7e
- Repositorio original (posiblemente privado): https://huggingface.co/afgod1079/Affine-5ejzgj7kv5-cp1200
- Archivo de procedencia: `_affine_provenance.json` dentro del repositorio
