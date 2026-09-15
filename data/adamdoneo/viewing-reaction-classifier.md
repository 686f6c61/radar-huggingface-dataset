# adamdoneo/viewing-reaction-classifier

## Resumen

viewing-reaction-classifier es un modelo de clasificación de texto publicado por el usuario adamdoneo en Hugging Face el 15 de septiembre de 2026 (última actualización el mismo día). El repositorio ocupa 0,5 GB, se distribuye en formato safetensors bajo licencia MIT y contiene 124.647.170 parámetros reales, una cifra coherente con la arquitectura roberta-base (encoder-only de ~125 M de parámetros) que aparece como etiqueta del repositorio. La model card publicada se limita al campo `license: mit`, sin descripción de la tarea, del conjunto de etiquetas ni del proceso de entrenamiento.

El nombre del checkpoint sugiere una tarea de clasificación de reacciones de espectadores (por ejemplo, comentarios, reacciones o respuestas ante contenido audiovisual), pero esta interpretación no está confirmada por documentación alguna. No se especifican idiomas soportados, longitud de contexto, taxonomía de clases ni métricas de evaluación, por lo que el modelo no puede caracterizarse con precisión más allá de su arquitectura, tamaño y licencia.

Su relevancia práctica es doble: por un lado, un encoder de ~125 M de parámetros con licencia MIT es un candidato razonable para clasificación de alto volumen en CPU o GPU de consumo; por otro, la ausencia casi total de documentación obliga a validar empíricamente cualquier uso en producción antes de adoptarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en RoBERTa (según etiqueta del repositorio) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información técnica disponible es la etiqueta `roberta` del repositorio y el recuento real de parámetros extraído de los safetensors (124.647.170). Esto sitúa al modelo en la familia de encoders tipo RoBERTa, un transformer bidireccional con atención completa, orientado a representación de secuencias y clasificación, no a generación de texto. Se desconoce si se trata de un ajuste fino sobre `roberta-base` o de un entrenamiento desde cero.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el régimen de ajuste (supervisado, con RLHF/DPO, etc.), la función de pérdida, el número de clases de salida ni las técnicas de regularización empleadas. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación, cuantización durante el entrenamiento). La model card no incluye hiperparámetros, curvas de entrenamiento ni procedencia de los datos.

## Capacidades

La información disponible no permite confirmar capacidades concretas. Lo único verificable es lo siguiente:

- Clasificación de texto: la arquitectura encoder-only y la etiqueta roberta implican que el modelo produce logits sobre una o varias clases, no texto generado.
- Inferencia rápida y ligera: con 124,6 M de parámetros, la inferencia es viable en CPU y en cualquier GPU de consumo.
- Generación de texto: no soportada por la arquitectura declarada.
- Razonamiento multi-paso, matemáticas avanzadas, código, visión o audio: no disponibles y, por arquitectura, fuera del alcance esperable de un encoder de clasificación.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Modo thinking, salidas estructuradas o etiquetas específicas: no disponibles; se desconoce la taxonomía de clases.

## Casos de uso

Todos los casos siguientes son hipótesis de aplicación condicionadas a que la taxonomía real de etiquetas del modelo coincida con la tarea descrita. Requieren validación previa con datos propios.

- Moderación de comentarios en plataformas de vídeo: un encoder de 124,6 M de parámetros permite clasificar grandes volúmenes de comentarios por lotes en CPU, filtrando respuestas tóxicas, spam o fuera de tema antes de la revisión humana.
- Analítica de audiencia: clasificar reacciones de espectadores (positivas, negativas, neutras o por temática) para alimentar cuadros de mando de productores y editoriales de contenido.
- Señal de recomendación: usar la distribución de reacciones clasificadas como característica adicional en un sistema de recomendación de vídeo, sin coste elevado de inferencia.
- Etiquetado asistido de datasets: preanotar corpus de comentarios o reseñas para revisión humana posterior, reduciendo el coste del etiquetado manual en proyectos de investigación.
- Detección de abuso dirigido: identificar patrones de acoso hacia creadores o participantes en directos, integrándolo en un pipeline de moderación en tiempo real.
- Análisis en ciencias sociales y estudios de recepción: procesar corpus históricos de reacciones a contenidos audiovisuales para estudios cuantitativos de opinión.
- Despliegue en entornos con recursos limitados o sin conexión: el tamaño del checkpoint permite ejecutarlo en portátiles, servidores pequeños o hardware de borde donde un LLM generativo no cabría.
- Investigación sobre clasificación de texto en español: solo si se confirma que el modelo soporta dicho idioma, dato que actualmente no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas (exactitud, F1, precisión/recall), conjuntos de evaluación ni comparaciones con otros modelos. No es posible reproducir ni verificar el rendimiento del checkpoint sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (coherente con el tamaño del repositorio, 0,5 GB), unos 0,25 GB en FP16/BF16 y unos 0,12 GB en int8. A ello hay que sumar el coste de activaciones, que depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, incluidas NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, T4, L4, A100 o H100. No requiere GPU de datacenter.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: la inferencia en CPU es viable y suficiente para muchos escenarios de clasificación por lotes.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `pipeline`, exportación a ONNX Runtime, TorchScript o TensorRT, y servicio mediante FastAPI, TorchServe o Triton Inference Server. vLLM, TGI, Ollama y llama.cpp no son opciones adecuadas para este checkpoint: no se publican pesos GGUF y estas herramientas están orientadas a modelos generativos.
- Latencia y throughput: no disponibles. No hay datos publicados de latencia ni de rendimiento por segundo; habría que medirlos con el hardware y la longitud de secuencia objetivo.

## Comparativa con modelos similares

La model card no ofrece métricas, de modo que la comparación de rendimiento no es posible. La tabla siguiente recoge únicamente características estructurales del checkpoint frente a las arquitecturas base que suelen ocupar su mismo hueco; los datos de los comparables proceden de la documentación pública de dichas arquitecturas base, no del repositorio analizado.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| adamdoneo/viewing-reaction-classifier | 124.647.170 | no disponible | MIT | safetensors | no disponible |
| roberta-base | ~125 M | 512 tokens | MIT | safetensors, PyTorch | métricas GLUE públicas de la arquitectura base |
| DistilBERT-base | ~66 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | métricas GLUE públicas de la arquitectura base |
| DeBERTa-v3-base | ~184 M | 512 tokens | MIT | safetensors, PyTorch | métricas GLUE públicas de la arquitectura base |

Diferencias clave: DistilBERT ofrece menor tamaño a costa de capacidad; DeBERTa-v3-base ofrece mayor capacidad con más parámetros; roberta-base es el comparable más directo por arquitectura y número de parámetros. Ninguno de estos datos permite afirmar qué modelo clasifica mejor la tarea concreta de este checkpoint, que sigue sin documentar.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card contiene solo la licencia. No hay información sobre la tarea, las clases, el dataset, los idiomas ni las métricas, lo que impide evaluar su idoneidad sin pruebas propias.
- Taxonomía de etiquetas desconocida: se ignora cuántas clases tiene el modelo y qué representa cada una, algo imprescindible para interpretar las salidas.
- Idiomas no declarados: no se puede asumir soporte de español ni de ningún otro idioma concreto.
- Sesgos potenciales: al desconocerse el corpus de entrenamiento, no es posible caracterizar sesgos demográficos, culturales o lingüísticos. Cualquier uso en moderación o análisis de opinión debe auditarse con datos representativos.
- Riesgo de error silencioso: al ser un clasificador, no "alucina" texto, pero puede asignar etiquetas con alta confianza de forma incorrecta; conviene calibrar los umbrales y revisar la distribución de probabilidades.
- Sin validación externa: no hay benchmarks, evaluaciones de terceros ni métricas reproducibles; el checkpoint, con 0 descargas y 0 likes, no tiene trazabilidad de uso.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de copyright y la licencia. No impone restricciones adicionales, pero tampoco ofrece garantías de ningún tipo.
- Despliegue: no se ofrecen pesos cuantizados ni GGUF, por lo que un uso fuera de `transformers` u ONNX requiere conversión propia y validación posterior.
- Fecha de publicación posterior a la fecha habitual de consulta: el repositorio está fechado en septiembre de 2026, dato a tener en cuenta al verificar versiones o cambios posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/adamdoneo/viewing-reaction-classifier
- No se han encontrado en la búsqueda web enlaces relevantes sobre este modelo: los resultados devueltos trataban sobre los puntos de Lagrange y coordenadas GPS, sin relación con el checkpoint. No hay paper, blog, repositorio de código ni demo asociados en la información disponible.
