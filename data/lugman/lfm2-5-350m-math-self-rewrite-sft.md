# lugman/LFM2.5-350M-Math-Self-Rewrite-SFT

## Resumen

LFM2.5-350M-Math-Self-Rewrite-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 354.483.968 parametros (aproximadamente 350M) orientado, segun el nombre del repositorio, a tareas de matematicas mediante una estrategia de "self-rewrite" (reescritura propia de las soluciones). El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia en ingles.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, derivado de la familia LFM2 de Liquid AI, que puede ejecutarse en hardware muy modesto y que ejemplifica el flujo de trabajo de ajuste fino con Unsloth y TRL. El autor declara que el entrenamiento se realizo "2x faster" con Unsloth, lo que indica un ajuste eficiente en memoria sobre el modelo base.

No obstante, la model card es extremadamente escasa: no documenta el dataset de entrenamiento, la composicion de los datos, los hiperparametros, ni resultados de evaluacion. Toda la informacion tecnica adicional procede del modelo base (LiquidAI/LFM2.5-350M) y de las etiquetas del repositorio, no de documentacion propia del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia de Liquid AI); arquitectura exacta del modelo base no detallada en la informacion disponible |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo incluye pesos safetensors (cuantizaciones GGUF no documentadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-350M. La arquitectura corresponde a la familia LFM2 de Liquid AI, aunque la informacion proporcionada no detalla la configuracion interna (numero de capas, dimension del modelo, mecanismo de atencion, etc.). El tamano de 354.483.968 parametros confirma que se trata de un modelo compacto de clase 350M.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, con una mejora de velocidad de aproximadamente 2x respecto al entrenamiento convencional. El nombre del repositorio sugiere una estrategia de "Math-Self-Rewrite", es decir, ajuste sobre datos de matematicas donde el modelo reescribe o reformula sus propias soluciones. Sin embargo, no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para eficiencia de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Razonamiento matematico orientado por el ajuste fino "Math-Self-Rewrite", segun la denominacion del repositorio; no hay evaluacion publicada que lo confirme.
- Generacion de texto con formato de chat (tag `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 350M, puede desplegarse en una sola GPU consumer o incluso en CPU, lo que permite iterar sobre prompts y flujos conversacionales sin coste de infraestructura elevado.
- Experimentacion academica con ajuste fino: sirve como punto de partida reproducible para estudiar estrategias de "self-rewrite" en dominios matematicos, dado que el autor publica los pesos resultantes del SFT.
- Generacion de explicaciones matematicas paso a paso: el ajuste orientado a matematicas puede emplearse para producir borradores de resoluciones que un humano revise, aprovechando el bajo coste de inferencia del modelo.
- Filtrado y preprocesado de datasets matematicos: el modelo puede usarse para reescribir o normalizar enunciados y soluciones en pipelines de curacion de datos, que es precisamente la tarea implicita en su nombre.
- Educacion y tutoria basica: en entornos controlados y con supervision, puede generar pistas o explicaciones sencillas en ingles para ejercicios de nivel escolar.
- Benchmarking de tecnicas de ajuste eficiente: util para comparar el impacto de Unsloth/TRL frente a otros metodos de SFT en modelos pequenos, midiendo calidad y velocidad de entrenamiento.
- Despliegue embebido o edge: por su tamano, cabe en dispositivos con recursos limitados para tareas de generacion de texto acotadas, siempre que se cuantice adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0,7 GB solo para pesos (354M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 1-2 GB dependiendo de la longitud de contexto y el batch.
- En cuantizacion de 8 bits: aproximadamente 0,35 GB de pesos; en 4 bits: aproximadamente 0,18 GB de pesos, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien tarjetas de gama baja y GPUs integradas con suficiente memoria compartida.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y por compatibilidad con safetensors, herramientas como vLLM o llama.cpp previa conversion a GGUF (no documentada en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-Math-Self-Rewrite-SFT (este) | 354M | no disponible | Apache 2.0 | Hugging Face | SFT comunitario, sin benchmarks publicados |
| LiquidAI/LFM2.5-350M (base) | ~350M | no disponible | no disponible en la informacion | Hugging Face | Modelo base oficial de Liquid AI |
| Qwen2.5-0.5B | ~500M | no disponible en la informacion | no disponible en la informacion | Hugging Face | Alternativa de tamano similar; datos no verificados en esta ficha |
| SmolLM2-360M | ~360M | no disponible en la informacion | no disponible en la informacion | Hugging Face | Alternativa de tamano similar; datos no verificados en esta ficha |

La comparativa con Qwen2.5-0.5B y SmolLM2-360M se incluye como referencia de categoria (modelos pequenos de generacion de texto), pero no se dispone de datos verificados en la informacion proporcionada para comparar rendimiento, contexto o licencia con rigor.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni el proceso de evaluacion, por lo que no es posible verificar la calidad ni la especializacion real en matematicas.
- Riesgo de alucinacion elevado en razonamiento matematico: los modelos de 350M tienen capacidad limitada para calculos multi-paso, y no hay benchmarks que respalden el ajuste.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base sin informacion de alineacion, pueden persistir sesgos del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero al ser un ajuste comunitario sin garantias, conviene auditar el modelo antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se documentan tecnicas de seguridad, filtrado ni mitigaciones de contenido danino.
- El uso de Unsloth/TRL se declara por el autor, pero no hay logs de entrenamiento publicados que lo verifiquen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Self-Rewrite-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
