# peterachua/xbd-s12-sut-wrapper

## Resumen

El modelo `peterachua/xbd-s12-sut-wrapper` es un envoltorio (wrapper) diseñado para la evaluación de daños en edificios a partir de imágenes satelitales de los satélites Copernicus Sentinel-1 (radar) y Sentinel-2 (óptico multiespectral). Está vinculado al dataset xBD-S12, presentado en el artículo "The Potential of Copernicus Satellites for Disaster Response: Retrieving Building Damage from Sentinel-1 and Sentinel-2" (arXiv:2511.05461). El objetivo principal es complementar las imágenes de muy alta resolución, que suelen tener disponibilidad limitada durante emergencias, con datos de resolución media de acceso abierto.

El autor del repositorio en Hugging Face es `peterachua`, aunque el código y el dataset originales provienen del grupo PRS de ETH Zurich (prs-eth). El nombre "sut" sugiere que se trata de un wrapper sobre una arquitectura tipo U-Net, aunque no se han publicado especificaciones técnicas detalladas en la ficha de Hugging Face. El acceso al modelo está restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de poder descargarlo. Se desconoce el número de parámetros, la arquitectura interna y el pipeline de inferencia, ya que no se han facilitado estos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente U-Net, segun el paper asociado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision por satelite) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del wrapper. Sin embargo, el paper asociado (arXiv:2511.05461) describe un modelo U-Net entrenado sobre el dataset xBD-S12, que contiene 10.315 pares de imagenes pre- y post-desastre de Sentinel-1 y Sentinel-2. El entrenamiento se realiza sobre imagenes de resolucion media (10 m para Sentinel-2 y similar para Sentinel-1) y el objetivo es clasificar el nivel de dano en edificios (sin dano, dano menor, dano mayor, destruido). No se han publicado detalles sobre el numero de tokens, composicion del dataset mas alla del mencionado, ni sobre tecnicas de RLHF o DPO, ya que se trata de un modelo de vision y no de lenguaje.

El wrapper en Hugging Face probablemente encapsula el modelo preentrenado y su pipeline de preprocesado, pero no se dispone de documentacion tecnica adicional en la ficha.

## Capacidades

- Evaluacion de danos en edificios a partir de pares de imagenes pre- y post-desastre de Sentinel-1 y Sentinel-2.
- Clasificacion de danos en categorias discretas (sin dano, dano menor, dano mayor, destruido), segun el paper asociado.
- Procesamiento de imagenes de resolucion media (10 m), lo que permite cobertura global con datos de acceso abierto.
- Posible soporte para inferencia en lotes sobre areas extensas, aunque no esta confirmado.
- No se indica soporte para tool calling, agentes ni otras capacidades propias de modelos de lenguaje.

## Casos de uso

- Respuesta humanitaria ante desastres: el modelo permite estimar rapidamente el grado de destruccion de edificios en una region afectada por un terremoto, huracan o incendio, utilizando imagenes satelitales de libre acceso. Esto facilita la priorizacion de recursos sobre el terreno.
- Monitorizacion de reconstruccion: tras un desastre, se pueden comparar imagenes de distintas fechas para evaluar el progreso de la reconstruccion y detectar zonas que aun requieren intervencion.
- Planificacion urbana y gestion de riesgos: las predicciones de dano pueden integrarse en sistemas de informacion geografica (SIG) para identificar areas vulnerables y disenar politicas de mitigacion.
- Investigacion en teledeteccion: el modelo sirve como punto de partida para estudiar la viabilidad de usar datos Copernicus en evaluaciones de dano, en lugar de depender exclusivamente de imagenes comerciales de muy alta resolucion.
- Generacion de mapas de dano automaticos: combinado con herramientas de procesamiento geoespacial, el modelo puede producir mapas raster de dano por edificio o por manzana, utiles para organismos de proteccion civil.
- Validacion de modelos de aprendizaje automatico: al estar basado en un dataset publico (xBD-S12), puede utilizarse como referencia para comparar nuevas arquitecturas o tecnicas de aumento de datos en el ambito de la vision por computador aplicada a satelites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2511.05461) reporta evaluaciones sobre el propio dataset xBD-S12 y una prueba de generalizacion sobre el incendio de Palisades (enero de 2025), pero los numeros concretos no se han incluido en la ficha de Hugging Face.

## Requisitos de hardware

- No se dispone de informacion sobre requisitos de hardware especificos para este wrapper.
- Dado que se trata de un modelo de vision por satelite (probablemente U-Net), es probable que pueda ejecutarse en GPUs de consumo medio (por ejemplo, NVIDIA RTX 3060 o superior) si el tamano es moderado, pero no hay datos confirmados.
- Para despliegue en produccion, se podria usar PyTorch o TensorFlow, aunque no se especifican frameworks compatibles.
- No se indican opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directamente publicados en Hugging Face con el mismo enfoque (evaluacion de danos con Sentinel-1/2). El modelo original de xBD (de muy alta resolucion) existe, pero no es directamente comparable por la diferencia en resolucion y fuentes de datos.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en Hugging Face antes de su uso.
- Resolucion media: al trabajar con imagenes de 10 m, la precision por edificio es limitada en comparacion con imagenes de muy alta resolucion (submetricas). Edificios pequenos o densamente agrupados pueden no clasificarse correctamente.
- Dependencia de condiciones atmosfericas: las imagenes opticas de Sentinel-2 pueden verse afectadas por nubes, mientras que Sentinel-1 (radar) es inmune a nubes pero sensible a otros artefactos.
- Sesgo geografico: el dataset xBD-S12 se deriva de eventos especificos (terremotos, huracanes, inundaciones) y puede no generalizar bien a otros tipos de desastres o regiones con caracteristicas urbanisticas muy diferentes.
- Falta de documentacion tecnica: no se han publicado detalles sobre la arquitectura, el preprocesado exacto o los pesos del modelo, lo que dificulta la reproducibilidad y la integracion en pipelines existentes.
- Riesgo de alucinacion: al ser un modelo de clasificacion de imagenes, no genera texto, pero puede producir falsos positivos o negativos en la deteccion de danos, lo que debe tenerse en cuenta en aplicaciones criticas.
- Licencia MIT: permite uso comercial, pero el acceso gated implica que el autor puede imponer condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/peterachua/xbd-s12-sut-wrapper
- Repositorio oficial del dataset y codigo: https://github.com/prs-eth/xbd-s12
- Dataset xBD-S12 en Zenodo: https://zenodo.org/records/18960454
- Paper en arXiv: https://arxiv.org/abs/2511.05461
- Version HTML del paper: https://arxiv.org/html/2511.05461v1
