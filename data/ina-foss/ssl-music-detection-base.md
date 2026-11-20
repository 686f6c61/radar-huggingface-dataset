# ina-foss/ssl-music-detection-base

## Resumen

`ina-foss/ssl-music-detection-base` es un modelo de clasificacion de audio especializado en la deteccion de musica, desarrollado por el equipo INA-FOSS (vinculado al Institut National de l'Audiovisuel frances). Se trata de un fine-tuning del modelo base `ina-foss/ssl-audio-1k-base`, un encoder auto-supervisado preentrenado sobre audio, adaptado ahora a una tarea binaria concreta: determinar si un fragmento de audio contiene musica o no.

El modelo se distribuye a traves de la libreria Transformers con pesos en formato safetensors y codigo personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones remotas para su carga. Con un tamano de repositorio de aproximadamente 0,2 GB, el modelo es ligero y esta pensado para integrarse en pipelines de extraccion de caracteristicas y clasificacion de audio a escala.

Su relevancia practica radica en la deteccion automatica de musica en grandes archivos audiovisuales, una tarea habitual en radiodifusion, archivos sonoros y sistemas de gestion de derechos. El acceso esta restringido (gated) y la licencia es la `pantagruel-research-license`, lo que condiciona su uso comercial y requiere aceptar las condiciones en Hugging Face antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre representaciones de audio (encoder SSL, fine-tuning del modelo base `ina-foss/ssl-audio-1k-base`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Transformers, sin confirmar) |
| Idiomas soportados | no disponible (la tarea es de audio, no de texto) |
| Licencia | pantagruel-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ina-foss/ssl-audio-1k-base`, un encoder de audio entrenado de forma auto-supervisada sobre un corpus de audio de gran escala (el sufijo "1k" sugiere un preentrenamiento sobre aproximadamente mil horas de audio, aunque este dato no se confirma en la informacion disponible). Sobre esa representacion se ha realizado un fine-tuning supervisado para la tarea de deteccion de musica, produciendo una cabeza de clasificacion binaria sobre las features del encoder.

La informacion proporcionada no detalla el numero exacto de tokens o horas de audio empleadas en el fine-tuning, la composicion del dataset de deteccion de musica, ni si se aplicaron tecnicas de RLHF/DPO (poco habituales en tareas de clasificacion de audio). Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El modelo incluye codigo personalizado (`custom_code`) que debe cargarse con `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio durante la inferencia.

## Capacidades

- Clasificacion de audio binaria orientada a la deteccion de musica (presencia/ausencia de musica en un fragmento).
- Extraccion de caracteristicas (`feature-extraction`) a partir de las representaciones internas del encoder SSL.
- Procesamiento de audio de distinta procedencia (radiodifusion, archivos sonoros, grabaciones) gracias al preentrenamiento generalista del modelo base.
- Integracion en pipelines de Transformers mediante `pipeline("audio-classification")`.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto.
- Capacidades multilingues no aplicables (tarea acustica, no linguistica).
- No se ha documentado modo de razonamiento (thinking), vision ni audio generativo.

## Casos de uso

- Deteccion de musica en archivos de radiodifusion: el modelo permite etiquetar automaticamente horas de emision para separar bloques musicales de bloques hablados, facilitando la elaboracion de informes de programacion musical y el cumplimiento de cuotas.
- Gestion de derechos musicales: identificar fragmentos con musica en un catalogo audiovisual para activar procesos de declaracion de derechos ante sociedades de gestion.
- Archivado y catalogacion sonora: enriquecer metadatos de fondos documentales de audio indicando la presencia de musica, mejorando la buscabilidad del archivo.
- Monitorizacion de emisiones en tiempo (casi) real: clasificar flujos de audio entrantes para detectar musica y disparar acciones (registro, alertas, corte automatico).
- Preprocesado para pipelines de transcripcion: filtrar segmentos musicales antes de enviar audio a sistemas de reconocimiento del habla, reduciendo errores y coste computacional.
- Investigacion en music information retrieval (MIR): usar el modelo como baseline o extractor de features para experimentos de deteccion de musica y tareas relacionadas.
- Moderacion y analisis de contenido en plataformas: detectar musica en subidas de usuarios para aplicar politicas de derechos de autor o clasificacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con un repositorio de 0,2 GB, el modelo es ligero y previsiblemente cabe en GPUs de consumo con pocos GB de VRAM en precision completa o media.
- GPU recomendadas: no disponible. Por tamano, es probable que funcione en GPUs consumer (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problemas, aunque no se confirma.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio; sin confirmacion oficial.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se ha documentado soporte especifico para vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a LLM y no aplican directamente a este clasificador de audio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| `ina-foss/ssl-music-detection-base` | Clasificador de audio (SSL fine-tuned) | no disponible | no disponible | pantagruel-research-license | Gated |
| `ina-foss/ssl-audio-1k-base` (modelo base) | Encoder SSL de audio | no disponible | no disponible | no disponible | no disponible |
| Alternativas de deteccion de musica (p. ej. clasificadores MIR genericos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia `pantagruel-research-license`: restricciones para uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face y autenticarse para descargar los pesos.
- Uso de `custom_code`: la carga del modelo implica ejecutar codigo remoto (`trust_remote_code=True`), lo que supone un riesgo de seguridad que debe evaluarse en entornos controlados.
- Riesgo de alucinacion no aplicable en sentido estricto (tarea de clasificacion), pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de musica, especialmente en audio con musica de fondo muy tenue, habla sobre musica o generos ambiguos.
- Sesgos potenciales derivados del corpus de preentrenamiento y del dataset de fine-tuning (no documentados): posible menor rendimiento en generos musicales, idiomas o calidades de audio poco representados.
- Limitaciones de contexto o idioma no documentadas; al ser una tarea acustica, las limitaciones linguisticas no aplican, pero si las acusticas (ruido, reverberacion, codecs de baja calidad).
- Falta de informacion publica sobre parametros, contexto de audio y datos de entrenamiento, lo que dificulta la reproducibilidad y la evaluacion rigurosa.
- Sin resultados de benchmarks publicados: no es posible validar su rendimiento frente a alternativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-base
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-base
- Organizacion INA-FOSS en Hugging Face: https://huggingface.co/ina-foss
