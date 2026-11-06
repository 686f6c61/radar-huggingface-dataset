# ducvh5/wan21-a5b5x4c5-tf-fm-tm-su5-qt

## Resumen

`ducvh5/wan21-a5b5x4c5-tf-fm-tm-su5-qt` es un checkpoint experimental derivado de Wan2.1-T2V-1.3B, el modelo de generacion de video texto-a-video de 1.300 millones de parametros publicado por Wan-AI (Alibaba). El autor, `ducvh5`, lo presenta como una variante con arquitectura de transformer recurrente: el modelo base se reorganiza en una secuencia de bloques A5, B5x4 y C5, lo que da lugar a 15 bloques unicos que se ejecutan 30 veces en total. Esta reorganizacion busca reutilizar pesos a lo largo de la profundidad de la red, una tecnica habitual para aumentar la capacidad efectiva sin incrementar el numero de parametros.

El modelo se entrena con una combinacion de perdidas TF (teacher forcing), FM y TM, y emplea un muestreo de niveles de ruido estratificado en U(0,1) con shift=5 y t=1000σ, un esquema propio de los modelos de difusion. Los datos de entrenamiento se etiquetan como "OV" con captions QT en una proporcion 50/50 entre VB y full. No se ha publicado informacion sobre el volumen del dataset ni sobre el numero de pasos de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de investigacion sobre recurrencia en difusion para video, sin checkpoint final guardado (el autor indica "none saved"), sin descargas ni interacciones, y sin licencia declarada. No es un modelo listo para produccion, sino una instantanea de un pipeline de entrenamiento que puede interesar a quienes investigan arquitecturas recurrentes aplicadas a generacion de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente derivado de Wan2.1-T2V-1.3B (bloques A5, B5x4, C5; 15 unicos, 30 ejecutados) |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor indica que no se guardo checkpoint final) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusion para generacion de video a partir de texto. Sobre esa base, el autor aplica una reestructuracion en bloques recurrentes: cinco bloques de tipo A, cuatro grupos de cinco bloques de tipo B y cinco bloques de tipo C. El resultado son 15 bloques con pesos unicos que se ejecutan 30 veces, lo que duplica el numero de pasos efectivos de la red sin duplicar los parametros. Este tipo de recurrencia se ha explorado en transformers profundos como mecanismo para aumentar la profundidad efectiva con un coste de memoria acotado.

El entrenamiento combina tres perdidas (TF, FM y TM) que no se detallan en la model card. El muestreo de ruido es estratificado sobre U(0,1) con un factor de desplazamiento shift=5 y un escalado t=1000σ, coherente con los esquemas de difusion flow-matching. Los datos se describen solo como "OV", con captions QT en proporcion 50/50 entre variantes VB y full; no se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. El autor conserva todos los pesos EMA y no EMA, pero no guardo un checkpoint final ("last state: none saved"), lo que limita la reproducibilidad.

## Capacidades

- Generacion de video a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Arquitectura de difusion con transformer recurrente, orientada a experimentacion con profundidad efectiva.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (los idiomas no se declaran).
- No se documentan modos especiales como thinking mode, vision o audio.
- No se documenta control fino de camara, movimiento ni consistencia temporal mas alla de lo que ofrece el modelo base.

## Casos de uso

- Investigacion en arquitecturas recurrentes para difusion: el modelo permite estudiar como afecta la reutilizacion de bloques (15 unicos ejecutados 30 veces) a la calidad y coherencia temporal del video generado, comparandolo con el Wan2.1 original.
- Experimentos de ablacion sobre perdidas: la combinacion TF+FM+TM y el muestreo estratificado con shift=5 ofrecen un punto de partida para medir el impacto de cada componente en la estabilidad del entrenamiento.
- Reproduccion de pipelines de entrenamiento: util para validar recetas de entrenamiento de text-to-video con recursos limitados, dado el tamano de 1.300 millones de parametros.
- Generacion de clips cortos de bajo coste: al partir de un modelo de 1.3B, puede ejecutarse en GPUs de gama alta consumer para prototipos de video generado, siempre que se disponga de pesos utilizables (no incluidos en este repositorio).
- Docencia y formacion: sirve como ejemplo practico de derivacion de un modelo de difusion con modificaciones arquitectonicas y de como documentar (o no) un checkpoint experimental.
- Base para fine-tuning posterior: aunque no se guardo checkpoint final, la receta y la estructura de bloques pueden reutilizarse para entrenar variantes propias sobre Wan2.1-T2V-1.3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; como referencia, el modelo base Wan2.1-T2V-1.3B requiere del orden de 8-12 GB en FP16 para inferencia, pero la recurrencia (30 ejecuciones de bloque) puede aumentar el coste de computo y memoria de activaciones.
- GPU recomendadas: no disponibles; por tamano del modelo base, una RTX 4090 (24 GB) o A100 (40/80 GB) serian adecuadas para experimentacion.
- Cabe en GPU consumer: probablemente si, en GPUs con 16 GB o mas, aunque no hay datos confirmados para esta variante recurrente.
- Opciones de despliegue: no disponibles; el modelo base es compatible con Diffusers, y podria integrarse en pipelines de difusion, pero esta variante no incluye pesos utilizables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-su5-qt | 1.300 M | no disponible | no disponible | Sin checkpoint final |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | no disponible | Publico en Hugging Face |
| Otros modelos text-to-video de ~1.3B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento de esta variante ni de alternativas directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha guardado checkpoint final ("none saved"), por lo que el repositorio no contiene pesos utilizables para inferencia.
- Licencia no declarada: no se puede asumir uso comercial ni redistribucion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad del video generado.
- Riesgo de alucinacion visual y de inconsistencias temporales inherente a los modelos de difusion para video, agravado por la falta de validacion.
- Dataset de entrenamiento no documentado ("OV", captions QT): imposible evaluar sesgos o cobertura.
- Cero descargas y cero likes: no hay comunidad que haya validado el modelo.
- La recurrencia de bloques puede complicar la integracion con pipelines estandar de Diffusers.
- Fecha de creacion futura (2026-11-02) en los metadatos: conviene verificar la autenticidad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-su5-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
