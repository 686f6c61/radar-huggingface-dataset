# dageor/bulgarian-mdeberta-sentiment

## Resumen

El modelo `dageor/bulgarian-mdeberta-sentiment` es un ajuste fino de la familia DeBERTa-v2 especializado en analisis de sentimiento en bulgaro. Lo publica el usuario dageor en Hugging Face bajo licencia MIT, con un total de 278.810.882 parametros en formato safetensors. Su unica lengua declarada es el bulgaro (`bg`) y el corpus de ajuste es el dataset `DGurgurov/bulgarian_sa`.

Se trata de un modelo encoder-only orientado a clasificacion de texto, no a generacion. La etiqueta `deberta-v2` indica que parte de la arquitectura DeBERTa-v2 de Microsoft, caracterizada por attention disentangled y un encoder de posiciones relativas, lo que la hace adecuada para tareas de comprension del lenguaje (NLU) como clasificacion de sentimiento, deteccion de emociones o analisis de resenas.

La relevancia es acotada: es un modelo de nicho para procesamiento de lenguaje natural en bulgaro, un idioma con pocos recursos en comparacion con el ingles. Su tamano moderado (unos 279 millones de parametros) permite desplegarlo en hardware modesto, pero la model card publicada es practicamente vacia (solo metadatos de licencia, dataset e idioma), sin informacion sobre metricas, hiperparametros de entrenamiento ni limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder-only, transformer con attention disentangled) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | bulgaro (`bg`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DeBERTa-v2, un transformer encoder-only que introduce attention disentangled (separa el contenido y la posicion relativa en dos vectores de atencion) y un mecanismo de posiciones relativas mejorado respecto a DeBERTa original. Es un modelo bidireccional disenado para tareas de comprension, no para generacion autoregresiva.

No se dispone de informacion sobre el proceso de entrenamiento: no se detallan el numero de tokens, la composicion del corpus de preentrenamiento, si hubo ajuste supervisado, RLHF o DPO, ni los hiperparametros del fine-tuning sobre `DGurgurov/bulgarian_sa`. La model card no incluye ninguna innovacion tecnica adicional ni datos de decodificacion especulativa (no aplicable a un encoder-only de clasificacion).

## Capacidades

- Clasificacion de sentimiento en bulgaro (positivo, negativo, neutro, segun el etiquetado del dataset de ajuste).
- Analisis de texto en un unico idioma: bulgaro.
- Inferencia encoder-only: produce representaciones contextuales y logits de clasificacion, no texto generado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue: no, solo bulgaro.
- Uso previsto: clasificacion de secuencias cortas o medias de texto en bulgaro.

## Casos de uso

- Analisis de resenas de productos en bulgaro: clasificar opiniones de clientes en tiendas online búlgaras para agregar sentimiento por producto y detectar problemas de calidad.
- Monitorizacion de redes sociales: procesar menciones y comentarios en bulgaro para medir la percepcion de marca o de una campana.
- Moderacion de comentarios: filtrar o priorizar comentarios negativos en foros y plataformas de noticias en bulgaro para revision humana.
- Analisis de encuestas abiertas: clasificar respuestas de texto libre en bulgaro (NPS, satisfaccion) y agregar resultados por segmento.
- Enrutamiento de tickets de soporte: etiquetar la tonalidad de incidencias en bulgaro para priorizar casos de clientes insatisfechos.
- Investigacion en PLN para bulgaro: servir como baseline o componente en pipelines academicos de analisis de sentimiento en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB (coincide con el tamano del repo); en fp16, en torno a 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien cabe en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch/Transformers, ONNX Runtime, TorchScript; no se publican variantes GGUF ni integracion directa con Ollama o vLLM (vLLM esta orientado a generacion, no a clasificacion encoder-only).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| dageor/bulgarian-mdeberta-sentiment | 278,8 M | no disponible | bg | MIT | Fine-tune especifico para sentimiento en bulgaro |
| xlm-roberta-base (fine-tune generico) | ~278 M | 512 | multilingue | MIT | Alternativa multilingue, requiere ajuste propio |
| bert-base-multilingual-cased (fine-tune) | ~178 M | 512 | multilingue | Apache 2.0 | Menor, cobertura multilingue, requiere ajuste |
| Modelos búlgaros especializados de terceros | no disponible | no disponible | bg | variable | No se dispone de datos comparativos publicados |

No se dispone de comparativas de rendimiento publicadas para este modelo frente a alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre metricas, datos de evaluacion ni hiperparametros, lo que dificulta validar su calidad.
- Riesgo de sesgo: el modelo se ajusta sobre un unico dataset (`DGurgurov/bulgarian_sa`) cuyo dominio y balance de clases no se documentan; puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: bajo en el sentido generativo (no genera texto), pero puede producir clasificaciones erroneas con alta confianza en textos fuera de dominio.
- Limitacion de idioma: solo bulgaro; su uso en otros idiomas no esta soportado ni evaluado.
- Limitacion de contexto: no se documenta la longitud maxima de secuencia; DeBERTa-v2 suele operar en torno a 512 tokens, pero no se confirma para este ajuste.
- Licencia MIT: permite uso comercial, pero conviene verificar que el dataset de ajuste no imponga restricciones adicionales (no documentadas).
- Advertencia para produccion: sin benchmarks ni evaluacion independiente, no se recomienda desplegarlo en produccion sin una validacion previa sobre datos propios.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/dageor/bulgarian-mdeberta-sentiment
- Dataset de ajuste: https://huggingface.co/datasets/DGurgurov/bulgarian_sa
- Paper de DeBERTa-v2 (arquitectura base): https://arxiv.org/abs/2006.03654
