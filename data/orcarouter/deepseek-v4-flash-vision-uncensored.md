# orcarouter/DeepSeek-V4-Flash-Vision-Uncensored

## Resumen

DeepSeek-V4-Flash-Vision-Uncensored es una variante del modelo de visión-lenguaje DeepSeek-V4-Flash-Vision-Exp, publicada por el usuario orcarouter con el objetivo explícito de eliminar las negativas del modelo original mediante la técnica de *abliteration* (eliminación de pesos asociados al rechazo de respuestas). El resultado es un modelo multimodal que acepta entrada de imagen y texto, y que está orientado a tareas de *red teaming* y pruebas de seguridad ofensiva, donde se necesita que el modelo responda sin filtros de contenido.

El modelo base, DeepSeek-V4-Flash-Vision-Exp, es el primer modelo de visión por API de DeepSeek y, según el anuncio de lanzamiento, iguala el rendimiento en texto de V4-Flash a la vez que añade entrada de imágenes al mismo precio por token. La variante *uncensored* mantiene la arquitectura de mezcla de expertos (MoE) del original, con 304.646.824.126 parámetros totales (aproximadamente 304,6 mil millones), y está disponible bajo licencia MIT, aunque con acceso restringido en HuggingFace.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece capacidades de razonamiento multimodal de alto nivel (visión + texto) en una arquitectura MoE eficiente; por otro, al estar *abliterated*, permite explorar los límites de la seguridad de los modelos de lenguaje y generar contenido que normalmente sería rechazado, lo que lo hace útil para equipos de seguridad, investigación de sesgos y pruebas de robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) multimodal (vision-lenguaje) |
| Parametros totales | 304.646.824.126 (aprox. 304,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp4, fp8 (indicados en las etiquetas del repositorio, sin confirmacion de pesos publicados) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, que emplea una arquitectura transformer con mezcla de expertos (MoE) y capacidades de visión (image-text-to-text). Las etiquetas del repositorio indican soporte de *multi-token prediction* (MTP), una técnica que predice varios tokens futuros simultáneamente para acelerar la inferencia y mejorar la coherencia. El proceso de *abliteration* aplicado posteriormente elimina selectivamente los pesos responsables de las respuestas de rechazo, sin reentrenar el modelo completo, lo que produce una variante que responde a casi cualquier instrucción, incluido contenido que el modelo original bloquearía.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El post-procesado de *abliteration* es una técnica de modificación de pesos post-entrenamiento, por lo que no requiere un nuevo ciclo de entrenamiento completo.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes como entrada además de texto, y puede describir, analizar y razonar sobre contenido visual.
- Razonamiento avanzado: al estar basado en la familia V4-Flash, hereda capacidades de razonamiento complejo y resolución de problemas en múltiples pasos.
- Respuestas sin filtro: el proceso de *abliteration* elimina las negativas del modelo, permitiendo generar contenido que el modelo base rechazaría (por ejemplo, instrucciones peligrosas, contenido explícito o respuestas sobre temas sensibles).
- Multilingüe: soporta inglés y chino, los dos idiomas declarados en el repositorio.
- Eficiencia MoE: al ser un modelo de mezcla de expertos, solo se activa un subconjunto de parámetros por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño.
- Compatible con pipelines de `transformers`: se integra con la librería estándar de HuggingFace para carga e inferencia.

## Casos de uso

- *Red teaming* y pruebas de seguridad ofensiva: el modelo es idóneo para evaluar la robustez de otros sistemas de IA generando prompts adversariales o contenido que los modelos filtrados rechazarían, permitiendo identificar vulnerabilidades en moderación de contenido.
- Investigación de sesgos y alineación: al eliminar las negativas, se puede estudiar qué tipo de respuestas produce un modelo sin restricciones y compararlas con las versiones alineadas, útil para investigar sesgos latentes y comportamientos no deseados.
- Generación de contenido creativo sin restricciones: escritura de ficción con temáticas adultas, humor negro o sátira política que los modelos comerciales censuran, siempre bajo un marco de uso responsable.
- Análisis de imágenes en dominios sensibles: descripción de imágenes médicas, forenses o de ingeniería donde los modelos alineados pueden rechazar responder por políticas de contenido.
- Desarrollo de agentes de razonamiento multimodal: aprovechar la combinación de visión + razonamiento + MTP para construir asistentes que procesan capturas de pantalla, diagramas o documentos escaneados y razonan sobre ellos sin las limitaciones de un modelo alineado.
- Evaluación comparativa de modelos *abliterated*: sirve como referencia para medir el efecto de la *abliteration* sobre el rendimiento en tareas estándar (generación, razonamiento, visión) frente al modelo base sin modificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante *uncensored* en la información disponible. El blog de lanzamiento de OrcaRouter indica que el modelo base DeepSeek-V4-Flash-Vision-Exp iguala el rendimiento en texto de DeepSeek V4-Flash y sitúa a los agentes multimodales cerca de Opus-4.8, pero no proporciona cifras concretas de MMLU, HumanEval u otros tests estandarizados. Tampoco hay datos sobre el impacto de la *abliteration* en el rendimiento respecto al checkpoint original.

## Requisitos de hardware

- El repositorio ocupa 167,8 GB en formato safetensors, lo que exige almacenamiento considerable y una infraestructura de múltiples GPUs.
- Con 304,6 mil millones de parámetros totales, la inferencia en precisión fp8 requeriría aproximadamente 305 GB de VRAM, y en fp4 alrededor de 152 GB, asumiendo una cuantización uniforme.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) de forma directa; se necesitan al menos 4-8 GPUs de alta gama (A100 80GB, H100 80GB) para ejecutar el modelo completo.
- Opciones de despliegue: compatible con la librería `transformers` de HuggingFace, y probablemente con `vLLM` o `TGI` para servir el modelo con eficiencia, aunque no se ha confirmado en la documentación disponible.
- La cuantización fp8 podría permitir ejecutarlo en un nodo con 4 GPUs H100/A100 de 80GB, mientras que fp4 reduciría el requisito a 2-3 GPUs, pero no hay guías oficiales de despliegue publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Uncensored | 304,6B (MoE) | no disponible | Si (imagen + texto) | MIT | Acceso restringido en HF |
| DeepSeek-V4-Flash-Vision-Exp (base) | no disponible | no disponible | Si (imagen + texto) | no disponible | API y pesos (segun DeepSeek) |
| DeepSeek-V4-Flash | no disponible | no disponible | No (solo texto) | no disponible | API |

No se dispone de información suficiente sobre otros modelos comparables de la misma categoría (MoE multimodal con pesos ablacionados) para establecer una comparativa completa. La variante *uncensored* se distingue principalmente por la eliminación de negativas, un aspecto que no suele documentarse en los modelos comerciales o alineados.

## Limitaciones y advertencias

- La *abliteration* elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido peligroso, ilegal o dañino sin advertencia. Su uso debe limitarse a entornos controlados de investigación y *red teaming*.
- Riesgo elevado de alucinación: al no estar alineado, el modelo puede inventar información con mayor confianza, especialmente en dominios donde el modelo base tenía restricciones.
- Idiomas limitados: solo se declaran soporte para inglés y chino; el rendimiento en otros idiomas puede ser deficiente o inexistente.
- Acceso restringido: el repositorio es *gated*, por lo que se requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Sin contexto documentado: se desconoce la longitud de contexto real del modelo, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento para esta variante, por lo que cualquier afirmación sobre su calidad debe tomarse con cautela.
- Riesgo de uso indebido: la combinación de visión y ausencia de filtros puede facilitar la generación de contenido fraudulento o engañoso (por ejemplo, deepfakes textuales o descripciones manipuladas de imágenes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- Blog de lanzamiento de DeepSeek V4 Flash Vision (OrcaRouter): https://www.orcarouter.ai/blog/deepseek-v4-flash-vision-exp-launch
- Pagina de precios y benchmarks de DeepSeek V4 Flash (OrcaRouter): https://www.orcarouter.ai/models/deepseek/deepseek-v4-flash
