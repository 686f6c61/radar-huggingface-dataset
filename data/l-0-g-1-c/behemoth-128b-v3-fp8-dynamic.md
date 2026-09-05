# L-0-G-1-C/Behemoth-128B-v3-FP8-Dynamic

## Resumen

El modelo Behemoth-128B-v3-FP8-Dynamic es una cuantizacion en FP8 dinamica del modelo Mistral-Medium-3.5-128B, publicado por L-0-G-1-C. Los pesos suman 125.025.988.608 parametros y el repositorio ocupa 128.3 GB. Su objetivo es reducir los requisitos de memoria del modelo base para facilitar su despliegue en hardware con VRAM limitada o en plataformas que soporten cuantizacion.

La relevancia de este modelo radica en ofrecer una version cuantizada de un modelo de 128.000 millones de parametros, lo que puede abaratar los costes de inferencia. Sin embargo, la model card del autor esta marcada como "work in progress" y solo contiene la indicacion "Tested without reasoning on Mistral v7 Tekken", sin documentacion tecnica sobre arquitectura, contexto o comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: mistralai/Mistral-Medium-3.5-128B) |
| Parametros totales | 125.025.988.608 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 Dynamic (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base ni sobre el proceso de cuantizacion. La presencia del tag compressed-tensors sugiere que la cuantizacion se ha realizado con esta tecnologia, pero no se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se han descrito innovaciones tecnicas destacables en la informacion disponible.

## Capacidades

No se dispone de documentacion que permita enumerar las capacidades del modelo. La model card esta incompleta y no incluye ejemplos de uso, resultados de evaluacion ni descripciones de funcionalidades como tool calling, razonamiento, vision, audio o soporte multilingue. Se requiere informacion adicional del autor o del modelo base para poder determinar que tareas puede realizar.

## Casos de uso

- No se han publicado casos de uso especificos para este modelo.
- La informacion disponible no permite identificar aplicaciones concretas, ya que se desconocen sus capacidades y su rendimiento.
- Para poder recomendar casos de uso realistas seria necesario disponer de una evaluacion empirica del modelo o de la documentacion completa del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al estar los pesos en FP8 (1 byte por parametro), el checkpoint ocupa aproximadamente 125 GB, mas overhead del repositorio (128.3 GB). Para inferencia se necesitan al menos 128 GB de VRAM.
- GPU recomendadas: configuraciones multi-GPU con H100 (80 GB) o A100 (80 GB) en paralelo; tambien puede ejecutarse en una unica GPU con 128-192 GB de VRAM.
- No cabe en GPUs de consumo estandar como la RTX 4090 (24 GB) sin recurrir a cuantizaciones mas agresivas o a offload a CPU.
- Opciones de despliegue: compatible con el ecosistema compressed-tensors y con frameworks como vLLM, aunque no se mencionan herramientas especificas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Behemoth-128B-v3-FP8-Dynamic | 125.025.988.608 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Behemoth-128B-v3-W4A16-AWQ | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Mistral-Medium-3.5-128B (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de informacion suficiente para establecer una comparativa rigurosa. La variante Behemoth-128B-v3-W4A16-AWQ, del mismo autor, es una alternativa de cuantizacion W4A16 que reducira el uso de memoria, pero no se han facilitado sus especificaciones.

## Limitaciones y advertencias

- La model card esta marcada como "work in progress" y no contiene documentacion tecnica, por lo que se desconocen sesgos, riesgos de alucinacion o limitaciones de idioma.
- Al tratarse de una cuantizacion FP8, pueden aparecer perdidas de precision respecto al modelo original sin cuantizar.
- No se han publicado benchmarks, por lo que no se puede validar su rendimiento real en tareas de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantias de soporte ni de seguridad.
- Se recomienda evaluar el modelo en el caso de uso objetivo antes de desplegarlo en produccion.

## Enlaces

- [Behemoth-128B-v3-FP8-Dynamic en HuggingFace](https://huggingface.co/L-0-G-1-C/Behemoth-128B-v3-FP8-Dynamic)
- [Behemoth-128B-v3-W4A16-AWQ en HuggingFace](https://huggingface.co/L-0-G-1-C/Behemoth-128B-v3-W4A16-AWQ)
- [Mistral-Medium-3.5-128B (modelo base) en HuggingFace](https://huggingface.co/mistralai/Mistral-Medium-3.5-128B)
