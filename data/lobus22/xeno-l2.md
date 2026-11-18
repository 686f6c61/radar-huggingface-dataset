# Lobus22/Xeno-L2

## Resumen

Xeno-L2 es un modelo de generacion de texto de aproximadamente 1.060 millones de parametros (1,06 B) desarrollado por el usuario Lobus22 y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo entrenado desde cero ("from-scratch") con una arquitectura propia ("custom-architecture") que combina componentes conocidos: embeddings posicionales rotatorios (RoPE), atencion con query grouping (GQA), activaciones SwiGLU y normalizacion RMSNorm, todo en un transformer denso. El modelo esta disenado explicitamente para inferencia en CPU ("cpu-inference"), lo que lo situa en la categoria de modelos pequenos orientados a despliegues ligeros.

La relevancia de Xeno-L2 es limitada por su estado incipiente: cuenta con cero descargas y cero "likes" en el momento de la consulta, y su model card publica unicamente metadatos (licencia, idiomas y etiquetas), sin documentacion sobre datos de entrenamiento, hiperparametros, benchmarks ni instrucciones de uso. Los idiomas declarados son ingles (en) e indonesio (id). No se dispone de informacion sobre la longitud de contexto ni sobre el proceso de alineacion.

Se trata, por tanto, de un modelo experimental de autor individual, no de un lanzamiento corporativo, y debe evaluarse con cautela en entornos de produccion hasta que exista documentacion tecnica adicional o resultados reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con RoPE, GQA, SwiGLU y RMSNorm (arquitectura personalizada) |
| Parametros totales | 1.060.471.296 (aprox. 1,06 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona inferencia en CPU) |
| Idiomas soportados | Ingles (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Xeno-L2 es un transformer denso de aproximadamente 1,06 B de parametros. La model card y las etiquetas indican el uso de RoPE (Rotary Position Embeddings) para la codificacion posicional, GQA (Grouped-Query Attention) para reducir el coste de memoria de la cache KV, SwiGLU como funcion de activacion en las capas feed-forward y RMSNorm para la normalizacion. La etiqueta "custom-architecture" sugiere que la implementacion no sigue al pie de la letra un modelo de referencia estandar, y el tag "custom_code" indica que el repositorio incluye codigo propio necesario para cargar el modelo, lo que implica la necesidad de `trust_remote_code=True` en transformers. El tag "dense" confirma que no se trata de una arquitectura de mezcla de expertos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO u otras tecnicas de alineacion, ni sobre innovaciones adicionales como decodificacion especulativa o atencion lineal. La model card publicada no incluye estos datos.

## Capacidades

- Generacion de texto autoregresiva en ingles e indonesio, segun los idiomas declarados.
- Inferencia en CPU: el modelo esta etiquetado explicitamente para ejecucion en CPU, lo que sugiere un diseno orientado a entornos sin GPU.
- Carga mediante transformers con codigo personalizado (`trust_remote_code`), dado el tag `custom_code`.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- No hay evidencia publicada de vision, audio ni modo "thinking".
- Capacidades multilingues limitadas a los dos idiomas declarados; no se documenta calidad por idioma.

## Casos de uso

- Prototipado de generacion de texto en local: al ser un modelo de ~1 B de parametros con pesos safetensors y orientacion a CPU, puede ejecutarse en portatiles sin GPU para pruebas de concepto y experimentos de generacion.
- Educacion e investigacion sobre arquitecturas: al emplear RoPE, GQA, SwiGLU y RMSNorm en una implementacion propia, sirve como material de estudio para comparar variantes de transformer a pequena escala.
- Generacion de texto en ingles e indonesio para aplicaciones de bajo coste: adecuado para tareas simples de continuacion de texto o resumenes breves en esos idiomas, siempre que se valide la calidad previamente.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en contenedores pequenos o dispositivos edge con CPU, util para demos internas.
- Base para fine-tuning experimental: con licencia Apache 2.0, puede ajustarse para tareas especificas en ingles o indonesio, aunque la falta de documentacion sobre el entrenamiento original complica predecir el rendimiento tras el ajuste.
- Evaluacion comparativa de modelos pequenos: util como punto de referencia en estudios sobre modelos de ~1 B de parametros entrenados desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP32, los ~1,06 B de parametros ocupan aproximadamente 4,2 GB; en FP16/BF16, unos 2,1 GB; en cuantizacion de 8 bits, alrededor de 1,1 GB; en 4 bits, en torno a 0,6 GB (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32 o 2-3 GB para FP16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas, e incluso en CPU segun el diseno declarado.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada por los tags; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF en el repositorio limita el uso directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Xeno-L2 (Lobus22) | ~1,06 B | no disponible | Apache 2.0 | en, id | Hugging Face, 0 descargas |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | en (principalmente) | Ampliamente adoptado |
| Qwen2.5-1.5B | ~1,5 B | 32.768 tokens (version base) | Apache 2.0 | multilingue | Ampliamente adoptado |
| SmolLM2-1.7B | ~1,7 B | 8.192 tokens | Apache 2.0 | en (principalmente) | Ampliamente adoptado |

Los datos de los modelos comparativos corresponden a sus especificaciones publicas conocidas; no se dispone de resultados de benchmarks de Xeno-L2 para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe datos de entrenamiento, hiperparametros ni evaluacion, lo que impide estimar su calidad de forma fiable.
- Riesgo elevado de alucinacion: al no haber informacion sobre alineacion (RLHF/DPO) ni evaluaciones, no puede descartarse un comportamiento generativo poco fiable.
- Sesgos desconocidos: sin datos sobre la composicion del corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, religion u otros.
- Cobertura idiomatica limitada a ingles e indonesio; no se documenta el rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica revisar el codigo del repositorio antes de ejecutarlo en produccion por motivos de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de documentacion hace recomendable una validacion exhaustiva antes de desplegarlo.
- Modelo sin traccion (0 descargas, 0 likes) y de autor individual: no hay comunidad ni soporte que respalde su mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Lobus22/Xeno-L2
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
