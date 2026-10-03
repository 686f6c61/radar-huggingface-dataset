# Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night

## Resumen

LTX-2.5-22b-IC-LoRA-Day-To-Night es un adaptador LoRA de tipo IC (in-context) publicado por Lightricks para su modelo de difusion de video LTX-2.5. Su funcion es concreta y acotada: tomar un video rodado de dia y re-renderizarlo como la misma escena de noche, conservando composicion, encuadre, movimiento de camara y accion, pero sustituyendo la iluminacion, el color y la atmosfera por los propios de una escena nocturna. Es, por tanto, una herramienta de relighting y conversión temporal aplicada a video-to-video, no un modelo generativo de proposito general.

El repositorio es un unico archivo de pesos (libreria `diffusion-single-file`, 0,3 GB), lo que corresponde al tamano tipico de un adaptador LoRA y no al del modelo base sobre el que se aplica. El nombre del repositorio indica "22b", lo que apunta a un modelo base de aproximadamente 22.000 millones de parametros, aunque la ficha no publica el desglose de parametros del adaptador ni del modelo base. El adaptador se distribuye bajo la licencia ltx-2.x-community-license y el acceso esta restringido: es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo.

Su relevancia practica esta en la postproduccion y en los flujos de video generativo: convertir plano diurno en nocturno es una operacion costosa en VFX tradicional y dificil de automatizar sin perder coherencia temporal. Un IC-LoRA permite hacerlo conservando la estructura del metraje original, lo que reduce el riesgo de parpadeo, deriva de identidad o cambios de geometria entre fotogramas. El modelo esta documentado y etiquetado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion de video (familia LTX-2.5); arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible. El nombre del repositorio indica "22b" para el modelo base; no se especifica el numero de parametros del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion de video); no se especifica el numero maximo de fotogramas soportado |
| Tipos de cuantizacion | No disponible (el repositorio publica un unico archivo de pesos sin variantes cuantizadas declaradas) |
| Idiomas soportados | Ingles (en) |
| Licencia | ltx-2.x-community-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | Safetensors en archivo unico (libreria `diffusion-single-file`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni el procedimiento de entrenamiento del adaptador. Por las etiquetas del repositorio (`ltx-video`, `ltx-2.5`, `ic-lora`, `diffusion-single-file`) se trata de un LoRA de condicionamiento en contexto (IC-LoRA) aplicado sobre LTX-2.5, un modelo de difusion de video de Lightricks. La tecnica IC-LoRA consiste en introducir la senal de referencia directamente en el contexto del modelo, de forma que la generacion mantenga la correspondencia temporal y espacial con el metraje de entrada en lugar de generar un video nuevo desde cero.

El adaptador esta especializado en una unica transformacion: relighting de dia a noche. Esto implica que aprende a modificar la distribucion de iluminacion global, la temperatura de color, la intensidad de las sombras y la presencia de fuentes de luz artificial, preservando la geometria, la identidad de los sujetos y el movimiento original. No se han publicado datos sobre el numero de tokens o fotogramas de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste por preferencias, dado que no son habituales en el dominio de la difusion de video.

## Capacidades

- Conversion video-to-video de plano diurno a plano nocturno, re-renderizando la iluminacion sobre el metraje original.
- Preservacion de composicion, encuadre, movimiento de camara y accion del plano de entrada.
- Relighting coherente entre fotogramas, orientado a evitar parpadeo y deriva temporal.
- Modificacion de atmosfera, temperatura de color y fuentes de luz practicas (farolas, ventanas iluminadas, luces de vehiculos, segun la escena).
- Integracion como adaptador sobre el modelo base Lightricks/LTX-2.5 dentro de un pipeline de difusion de video.
- Etiquetado exclusivamente en ingles; no se declaran capacidades multilingues.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, propias de modelos de lenguaje y no de este tipo de adaptador.
- No se declaran capacidades de audio, vision por comprension ni thinking mode.

## Casos de uso

- Postproduccion cinematografica y series: convertir planos rodados en exteriores diurnos a nocturnos cuando la ventana de rodaje nocturno es limitada o demasiado costosa, manteniendo el plano original como base y evitando repetir el rodaje.
- Publicidad y contenido de marca: adaptar un mismo spot a versiones diurna y nocturna sin volver a rodar, aprovechando que el encuadre y el movimiento se conservan entre ambas versiones.
- Metraje de archivo y stock footage: ampliar el catalogo de un banco de imagenes generando variantes nocturnas de clips diurnos ya existentes, con la misma referencia visual.
- Previsualizacion y previz en produccion virtual: generar rapidamente versiones nocturnas de planos para decidir horarios de rodaje, necesidades de iluminacion artificial o presupuesto de VFX antes de rodar.
- Video musical y contenido corto para redes: producir versiones alternativas de un mismo plano cambiando el registro temporal sin reencuadrar ni reeditar la secuencia.
- Prototipado de iluminacion en VFX: usar la salida nocturna como referencia de look para el equipo de iluminacion digital, reduciendo iteraciones antes de la renderizacion final.
- Restauracion o remasterizacion de material: reinterpretar escenas diurnas de archivo en clave nocturna para nuevas versiones o reediciones, siempre que la licencia y los derechos del metraje lo permitan.
- Investigacion en relighting y coherencia temporal: servir como referencia de adaptador IC-LoRA especializado para comparar metodos de condicionamiento en contexto sobre modelos de difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FVD, CLIP similarity, LPIPS, SSIM ni comparativas con otros adaptadores de relighting), ni tampoco la busqueda web ha devuelto evaluaciones numericas. El unico material divulgativo localizado es una publicacion en X que describe cualitativamente el efecto (re-renderiza un video diurno como el mismo plano de noche preservando composicion y encuadre) sin aportar cifras.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, por lo que su carga no es el cuello de botella; el requisito real lo determina el modelo base LTX-2.5.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa y no confirmada por el fabricante, un modelo de difusion de video de ~22.000 millones de parametros en bf16 suele requerir del orden de decenas de GB de VRAM, y el procesamiento de video anade memoria proporcional al numero de fotogramas.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para modelos de esta escala, lo habitual en produccion es emplear GPU de datacenter (A100, H100, H200 o equivalentes); se desconoce el soporte concreto de cada una.
- Cabe en GPU de consumo: no confirmado. La viabilidad en tarjetas de gama alta para consumidor (RTX 4090, RTX 5090) dependeria de la disponibilidad de cuantizaciones oficiales, que el repositorio no declara.
- Opciones de despliegue: el repositorio se distribuye como archivo unico safetensors, por lo que es compatible con pipelines que carguen pesos de difusion de forma directa; el soporte explicito de vLLM, llama.cpp, Ollama o TGI no aplica a modelos de difusion de video y no esta documentado. No se detalla el runner oficial ni la integracion con ComfyUI u otras interfaces.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia por plano, por segundo de video ni por resolucion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o duracion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LTX-2.5-22b-IC-LoRA-Day-To-Night | LoRA IC sobre modelo de difusion de video | Adaptador: no disponible; base: ~22B segun el nombre del repositorio | No disponible | No disponible | ltx-2.x-community-license (acceso restringido) | HuggingFace, gated, 0,3 GB |
| Lightricks/LTX-2.5 (modelo base) | Modelo de difusion de video | No disponible en la informacion proporcionada | No disponible | No disponible | ltx-2.x-community-license | HuggingFace |
| Otros adaptadores de relighting dia-noche para modelos de difusion de video abiertos | LoRA o adaptador especializado | No disponible | No disponible | No disponible | Variable | No disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de parametros, contexto, rendimiento ni licencia frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no publicarse la composicion del dataset de entrenamiento, no puede evaluarse si el adaptador reproduce sesgos de iluminacion, geografia, tono de piel o tipo de escena presentes en los datos.
- Riesgo de alucinacion visual: como modelo generativo, puede introducir elementos inexistentes en la escena (fuentes de luz nuevas, reflejos, cambios en objetos) que no estaban en el plano original; en postproduccion esto exige revision fotograma a fotograma.
- Coherencia temporal: no se han publicado metricas de estabilidad entre fotogramas; en planos largos o con movimiento rapido puede aparecer parpadeo o deriva de apariencia.
- Ambito funcional muy estrecho: el adaptador esta entrenado para una unica transformacion (dia a noche). No debe esperarse que realice otras conversiones de iluminacion, estilos o tareas de edicion distintas.
- Idioma: los prompts y la documentacion estan etiquetados unicamente en ingles.
- Licencia: ltx-2.x-community-license, con condiciones especificas de uso comunitario. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que no se trata de una licencia permisiva estandar como Apache 2.0 o MIT.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que impide la descarga automatizada en entornos de CI/CD sin gestion previa de credenciales.
- Dependencia del modelo base: el adaptador no es autonomo. Requiere Lightricks/LTX-2.5 y su propio cumplimiento de licencia, ademas de los recursos de hardware del modelo base.
- Ausencia de benchmarks: no hay datos publicos de calidad que permitan fijar expectativas objetivas de rendimiento antes de invertir en la integracion.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Day-To-Night
- Modelo base en HuggingFace: https://huggingface.co/Lightricks/LTX-2.5
- Organizacion Lightricks en HuggingFace: https://huggingface.co/Lightricks
- Publicacion divulgativa sobre el adaptador (Stable Diffusion Tutorials, X): https://x.com/SD_Tutorial/status/2098688475319197726
