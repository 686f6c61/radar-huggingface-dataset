# sjmeis/skill-classifier-small-v3.5

## Resumen

`sjmeis/skill-classifier-small-v3.5` es un modelo de clasificación de texto publicado por el usuario sjmeis (Stephen Meisenbacher) en Hugging Face. Se trata de un modelo basado en arquitectura BERT con 28.764.674 parámetros totales, empaquetado en formato safetensors y distribuido bajo licencia MIT. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un modelo de tamaño pequeño orientado a tareas de clasificación.

Por su nombre, el modelo parece estar diseñado para clasificar "skills" (habilidades o competencias), presumiblemente en el contexto de descripciones de puestos, perfiles profesionales o textos similares, aunque la model card no proporciona ninguna descripción funcional. La información pública disponible es extremadamente limitada: no hay pipeline declarado, no se especifican idiomas soportados, no hay datos de entrenamiento documentados y el modelo registra únicamente 2 descargas y 0 likes, lo que indica que es un artefacto reciente o de baja difusión.

Es relevante ahora únicamente como ejemplo de modelo clasificador compacto derivado de BERT, desplegable en hardware muy modesto, pero no existe evidencia pública de su calidad, comportamiento o idoneidad para producción. Cualquier evaluación debe realizarse empíricamente por parte del usuario antes de considerarlo para un caso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según tag de Hugging Face) |
| Parametros totales | 28.764.674 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta como `bert` en Hugging Face y contiene 28.764.674 parámetros, un tamaño compatible con una variante de BERT-base o una arquitectura derivada ligeramente ampliada (BERT-base estándar tiene ~110M parámetros, por lo que este recuento sugiere una configuración más pequeña, posiblemente con vocabulario o capas reducidas, o un modelo tipo DistilBERT ampliado). No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni vocabulario.

No hay información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados, la composición del corpus, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente contiene la declaración de licencia MIT, sin texto descriptivo adicional.

## Capacidades

- Clasificación de texto: por el nombre del modelo, se orienta a la clasificación de habilidades o competencias en textos, aunque no se detalla el esquema de etiquetas.
- Generación de texto: no disponible; al ser un modelo BERT, no está diseñado para generación autoregresiva.
- Razonamiento, código y matemáticas: no disponible; no hay evidencia de capacidades de este tipo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de perfiles profesionales: el modelo podría emplearse para etiquetar descripciones de puestos o currículos con categorías de habilidades, siempre que se valide empíricamente el esquema de etiquetas, ya que no está documentado.
- Enrutamiento de tickets o consultas: un clasificador BERT compacto puede integrarse en un pipeline de atención al cliente para asignar consultas a departamentos, con latencia baja gracias a sus ~29M de parámetros.
- Moderación o filtrado de contenido: clasificación binaria o multiclase de textos entrantes en un servicio, desplegable en CPU.
- Extracción de señales en pipelines de datos: etiquetado masivo de corpus para enriquecimiento de datasets, aprovechando el bajo coste de inferencia de un modelo de este tamaño.
- Prototipado rápido en investigación: servir como baseline de clasificación antes de entrenar modelos mayores, dado su reducido tamaño (0,1 GB) y licencia permisiva.
- Despliegue en entornos con recursos limitados: inferencia en CPU o GPUs de gama baja para tareas de clasificación en dispositivos periféricos o edge, aunque la latencia real no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,7M parámetros × 4 bytes ≈ 115 MB de pesos, más activaciones y overhead); en fp16 aproximadamente 60 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque el hardware de gama alta está sobredimensionado para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, y potencialmente llama.cpp/Ollama no aplican de forma nativa a BERT; vLLM y TGI no están orientados a clasificadores BERT, por lo que la vía habitual es `transformers` o un servidor de inferencia genérico.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sjmeis/skill-classifier-small-v3.5 | 28.764.674 | no disponible | MIT | Hugging Face (2 descargas) |
| BERT-base (google-bert/bert-base-uncased) | ~110M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| DistilBERT (distilbert-base-uncased) | ~66M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento comparativo para el modelo evaluado, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los modelos de referencia citados cuentan con documentación extensa y benchmarks públicos, a diferencia de este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe el propósito, las etiquetas, los datos de entrenamiento ni el rendimiento, lo que impide evaluar su idoneidad sin pruebas empíricas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un clasificador sin validación puede producir etiquetas incorrectas con alta confianza.
- Sesgos conocidos: no disponible; al no documentarse el corpus de entrenamiento, no es posible identificar sesgos de dominio, género, idioma o cultura.
- Limitaciones de contexto o idioma: no disponible; se desconoce la longitud máxima de entrada y los idiomas cubiertos.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución; no obstante, el autor no ofrece garantías.
- Caveat para producción: con 2 descargas y 0 likes, el modelo carece de validación comunitaria; se recomienda evaluarlo en un conjunto de validación propio antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/sjmeis/skill-classifier-small-v3.5
- Perfil del autor en Hugging Face: https://huggingface.co/sjmeis
- Repositorio de datasets del autor: https://huggingface.co/sjmeis/datasets
- GitHub de referencia sobre clasificación estructurada (simple-jev): https://github.com/featherless-ai/simple-jev
