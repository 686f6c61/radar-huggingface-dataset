# EricTan7/VeritasPP

## Resumen

Veritas++ es un modelo multimodal de lenguaje (MLLM) interpretable desarrollado por EricTan7, disenado para la deteccion generalizable de imagenes generadas por IA (AIGI, por sus siglas en ingles). A diferencia de los detectores clasicos que optimizan directamente la capacidad explicativa, este modelo establece la percepcion visual fiable como base del razonamiento de autenticidad: primero aprende a percibir detalles finos, anomalias semanticas y diferencias a nivel de pixel, y despues razona sobre esa percepcion para emitir un juicio de autenticidad.

Es una extension del trabajo previo Veritas, que se centraba en la deteccion de imagenes faciales generadas por IA, ampliando el alcance a la deteccion general de imagenes sinteticas. La innovacion principal es el algoritmo Perception Pretext RL, que emplea tareas de percepcion simples como mecanismo de preentrenamiento por refuerzo para elevar el rendimiento de deteccion, junto con una tecnica de destilacion on-policy sensible al valor (value-aware on-policy distillation) para el razonamiento potenciado por percepcion.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. El repositorio de codigo y los pesos del modelo estan disponibles en HuggingFace y GitHub. La relevancia actual es alta dado el crecimiento de contenido sintetico y la necesidad de herramientas de autenticidad robustas frente a distribuciones fuera del conjunto de entrenamiento (OOD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM (multimodal large language model) con razonamiento de percepcion; detalles especificos del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Veritas++ es un MLLM interpretable que integra una fase de percepcion visual previa al razonamiento. La arquitectura se fundamenta en tres capacidades perceptivas basicas: captura de detalles visuales finos, deteccion de anomalias semanticas y analisis de diferencias a nivel de pixel. El modelo no optimiza directamente la capacidad de explicacion, sino que establece una percepcion fiable como fundamento del razonamiento de autenticidad.

El entrenamiento introduce el algoritmo Perception Pretext RL, que aprovecha tareas de percepcion simples como pretexto para elevar el rendimiento de deteccion. Complementariamente, se aplica una destilacion on-policy sensible a valor (value-aware on-policy distillation) para el razonamiento mejorado por percepcion. Este enfoque se apoya en el trabajo preliminar Veritas, que demostro que el razonamiento consciente de patrones mejora la generalizacion fuera de distribucion (OOD). El modelo extiende el alcance de la deteccion facial a imagenes generadas de tipo general.

Los datos de entrenamiento especificos (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Deteccion de imagenes generadas por IA (AIGI) de forma generalizable, incluyendo imagenes fuera de la distribucion de entrenamiento.
- Percepcion de detalles visuales finos, anomalias semanticas y diferencias de nivel de pixel.
- Razonamiento de autenticidad interpretable: el modelo explica por que una imagen es o no sintetica, basandose en la percepcion previa.
- Extension del ambito facial (Veritas) a la deteccion general de imagenes, lo que cubre una mayor variedad de contenido sintetico.
- Capacidad multimodal, al integrar vision y lenguaje para el razonamiento sobre imagenes.
- Compatibilidad con el algoritmo de aprendizaje Perception Pretext RL para mejorar la capacidad de deteccion.

## Casos de uso

- Moderacion de contenidos en plataformas sociales: el modelo puede analizar imagenes subidas por usuarios y detectar si han sido generadas por IA, ayudando a filtrar desinformacion visual antes de su publicacion.
- Verificacion de identidad y biometria: ante el aumento de rostros sinteticos (deepfakes), Veritas++ puede integrarse en sistemas KYC para validar que las fotografias de documento son autenticas.
- Autenticacion de material periodistico: redacciones y agencias de noticias pueden usar el modelo para verificar la autenticidad de imagenes recibidas de fuentes no verificadas, reduciendo el riesgo de publicar contenido manipulado.
- Auditoria de contenido en publicidad: agencias y marcas pueden comprobar si las imagenes de campanas han sido generadas por IA sin declararlo, asegurando el cumplimiento normativo de transparencia.
- Investigacion en seguridad informatica: equipos de respuesta a incidentes pueden emplear el modelo para analizar imagenes en ataques de ingenieria social o extorsion, determinando si son sinteticas.
- Ciencia forense digital: peritos pueden utilizar Veritas3 como herramienta auxiliar en investigaciones judiciales para fundamentar dictamenes sobre la autenticidad de evidencias graficas.
- Curaduria de contenido en bancos de imagenes: plataformas de stock pueden filtrar automaticamente imagenes generadas por IA cuando su politica exige solo contenido fotografico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo en arXiv (2607.27113) describe la metodologia y los experimentos, pero los valores numericos concretos no estan incluidos en los datos proporcionados.

## Requisitos de hardware

- No disponible: no se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue en la informacion publica del modelo.
- Al tratarse de un MLLM, es probable que requiera una GPU con al menos 16-24 GB de VRAM para inferencia con pesos completos, aunque este dato no esta confirmado.
- No se indica si es compatible con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se dispone de datos sobre modelos comparables en la misma categoria de deteccion de imagenes generadas por IA con arquitectura MLLM interpretativa. La comparativa con detectores clasicos (CNNs, transformers de vision) no es directa por la diferencia de enfoque y la falta de datos de rendimiento publicados.

## Limitaciones y advertencias

- La informacion publica no incluye el numero de parametros ni la arquitectura exacta del backbone, lo que dificulta evaluar su viabilidad en entornos con recursos limitados.
- No se especifican los idiomas soportados para el razonamiento textual, aunque al ser un MLLM es probable que soporte ingles; no hay confirmacion para espanol u otros idiomas.
- Los datos de entrenamiento y el proceso de alineacion no estan documentados, por lo que no se puede evaluar la presencia de sesgos en la deteccion (por ejemplo, menor precision en ciertos tipos de imagenes o grupos demograficos).
- El riesgo de falsos positivos o negativos en deteccion de AIGI no esta cuantificado; en aplicaciones de produccion se recomienda una evaluacion propia con el dominio objetivo.
- La licencia Apache-2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento puede suponer un riesgo legal si los datos incluyen contenido con derechos de autor.
- El modelo es reciente (publicado en julio de 2026) y con cero descargas en HuggingFace, lo que indica una comunidad de usuarios muy reducida y poca madurez en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EricTan7/VeritasPP
- Repositorio de codigo: https://github.com/EricTan7/VeritasPP
- Repositorio de VideoVeritas (trabajo relacionado): https://github.com/EricTan7/VideoVeritas
- Articulo en arXiv (HTML): https://arxiv.org/html/2607.27113
- Articulo en arXiv (PDF): https://arxiv.org/pdf/2607.27113
- Resena en AIMedicalCompendium: https://www.aimedicalcompendium.com/article.cfm?id=230695
