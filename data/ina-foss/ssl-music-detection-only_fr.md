# ina-foss/ssl-music-detection-only_fr

## Resumen

`ina-foss/ssl-music-detection-only_fr` es un modelo de clasificacion de audio desarrollado por INA-FOSS (el laboratorio de innovacion del Institut National de l'Audiovisuel frances). Se trata de un ajuste fino (fine-tuning) del modelo base `ina-foss/ssl-audio-1k-only_fr`, un encoder de audio auto-supervisado, orientado especificamente a la deteccion de musica en senales de audio. El modelo se distribuye a traves de la libreria `transformers` con pipeline `audio-classification` y pesos en formato `safetensors`.

La relevancia practica del modelo estriba en su especializacion: en lugar de un clasificador generico de eventos sonoros, se enfoca en la tarea binaria de determinar si un fragmento de audio contiene musica o no. Esto resulta util en flujos de trabajo de archivo audiovisual, monitorizacion de emisiones, gestion de derechos y limpieza de catalogos, donde la deteccion automatica de musica es un paso previo habitual.

El repositorio es de acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es `pantagruel-research-license`, una licencia personalizada que conviene revisar antes de cualquier uso en produccion. No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder de audio derivado de `ina-foss/ssl-audio-1k-only_fr`; presumiblemente transformer sobre representaciones de audio, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de audio, no de texto; el sufijo `_fr` sugiere orientacion al frances, sin confirmar) |
| Licencia | pantagruel-research-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `ina-foss/ssl-audio-1k-only_fr`, que a su vez forma parte de la familia de modelos de audio auto-supervisados de INA-FOSS. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, estrategia de atencion ni sobre el corpus de preentrenamiento (numero de horas de audio, composicion, idiomas o dominio). El tag `custom_code` indica que la carga del modelo requiere codigo personalizado incluido en el repositorio, por lo que no basta con una instancia estandar de `AutoModel` sin confiar en el codigo remoto.

Respecto al ajuste fino especifico para deteccion de musica, no consta el volumen de datos etiquetados, el esquema de etiquetas (probablemente binario musica/no musica) ni si se emplearon tecnicas de aumento de datos o balanceo de clases. Tampoco hay informacion sobre si el entrenamiento incluyo validacion cruzada o evaluacion sobre conjuntos de referencia. Toda esta informacion deberia consultarse en la model card del repositorio o en la documentacion del proyecto INA-FOSS.

## Capacidades

- Clasificacion de audio orientada a la deteccion de musica en fragmentos de senal.
- Extraccion de caracteristicas (`feature-extraction`) a partir del encoder subyacente, segun los tags del repositorio.
- Integracion con el pipeline `audio-classification` de `transformers`.
- Especializacion en una unica tarea (deteccion de musica), lo que reduce la ambiguedad frente a clasificadores genericos de eventos sonoros.
- No consta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto.
- No consta soporte multilingue en sentido estricto: la salida es una etiqueta de audio, no texto generado.

## Casos de uso

- Archivo audiovisual: detectar automaticamente los tramos con musica en fondos documentales o emisiones grabadas, para indexar, cortar o etiquetar el material antes de su catalogacion.
- Monitorizacion de emisiones: analizar flujos de radio o television en busca de musica, por ejemplo para verificar cuotas de contenido musical o detectar inserciones no declaradas.
- Gestion de derechos: prefiltrar fragmentos musicales en un catalogo para su posterior identificacion de obras y liquidacion de derechos con sociedades de gestion.
- Limpieza de datasets de voz: eliminar o separar segmentos con musica de corpus de habla antes de entrenar modelos de reconocimiento de voz, evitando contaminacion.
- Investigacion en musicologia computacional: obtener una etiqueta binaria de presencia musical como paso previo a tareas mas finas (genero, instrumentos, tempo).
- Publicidad y podcasts: verificar de forma automatica si un episodio o pieza contiene musica de fondo y en que intervalos, para cumplir con requisitos editoriales o de licencias.
- Preprocesado en pipelines de ASR: segmentar audio largo en regiones con y sin musica para enrutar cada tramo al modelo adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al desconocerse el numero de parametros. El tamano del repositorio (0,2 GB) sugiere un modelo compacto, probablemente inferior a 100 millones de parametros, lo que permitiria inferencia en GPU consumer de gama media o incluso en CPU.
- GPU recomendadas: no disponibles de forma especifica; por el tamano del repositorio, una GPU con 4-8 GB de VRAM deberia ser suficiente en la mayoria de escenarios, aunque no se confirma.
- Compatibilidad con GPU consumer: probablemente si (RTX 3060, RTX 4060 o superiores), sujeto a verificacion empirica.
- Opciones de despliegue: `transformers` con pipeline `audio-classification`; al requerir `custom_code`, es necesario habilitar `trust_remote_code=True`. No consta soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ina-foss/ssl-music-detection-only_fr` | Deteccion de musica | no disponible | no disponible | pantagruel-research-license | Gated en HF |
| `ina-foss/ssl-audio-1k-only_fr` (modelo base) | Representacion de audio | no disponible | no disponible | no disponible | HF |
| Clasificadores genericos de eventos sonoros (p. ej. PANNs, AST) | Clasificacion de audio multi-clase | variable | no aplica | variable (MIT/Apache en muchos casos) | Publicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face y disponer de token de autenticacion para descargar los pesos.
- Licencia `pantagruel-research-license`: es una licencia personalizada; debe revisarse con detalle antes de cualquier uso comercial o redistribucion, ya que puede imponer restricciones no evidentes.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- No se dispone de informacion sobre sesgos, tasas de error, robustez frente a ruido, musica de fondo muy baja o fragmentos cortos.
- Riesgo de falsos positivos y negativos en generos poco representados en el corpus de entrenamiento (musica no occidental, experimental, ruido con componentes tonales).
- El sufijo `_fr` sugiere un sesgo hacia contenido en frances o producido en Francia; su comportamiento en otros contextos musicales o idiomas no esta documentado.
- No hay datos publicos de evaluacion, por lo que no es posible estimar su calidad frente a alternativas genericas.
- Al ser un modelo de clasificacion de una sola tarea, no debe emplearse como extractor de caracteristicas generales sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-only_fr
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-only_fr
- Organizacion INA-FOSS en Hugging Face: https://huggingface.co/ina-foss
