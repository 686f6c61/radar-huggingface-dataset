# scitomo/topaz-v0.2.4-10a

## Resumen

Topaz v0.2.4 10a es un modelo de denoising para crio-tomografía electrónica (cryo-electron tomography, cryo-ET) desarrollado originalmente por el proyecto tbepler/topaz y convertido al formato FORMAT-2 por scitomo. El modelo está diseñado para reducir el ruido en tomogramas 3D, mejorando la calidad de las imágenes para su posterior análisis estructural. Consta de 2.916.337 parámetros organizados en 34 tensores canónicos y se distribuye bajo licencia GPL-3.0. Esta conversión no implica retraining ni nuevas afirmaciones de calidad científica, y se presenta como una reproducción bitwise exacta del checkpoint oficial de Topaz v0.2.4. No es un modelo de lenguaje: su ámbito es exclusivamente el procesamiento de volúmenes 3D en microscopía electrónica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal densa 3D para denoising (no se especifica el tipo exacto en la informacion disponible) |
| Parametros totales | 2.916.337 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision 3D, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | GPL-3.0 |
| Formato de pesos | FORMAT-2 (conversion de Scitomo; el formato de archivo concreto no se especifica) |

## Arquitectura y entrenamiento

El modelo es una red neuronal densa 3D destinada a la eliminacion de ruido en tomogramas crioelectronicos. El checkpoint incluido es una conversion FORMAT-2 del checkpoint oficial de Topaz v0.2.4, extraido del repositorio upstream tbepler/topaz en la revision `c6dde54398875dcc6a210f83de019c9165fb474c`. La conversion conserva la paridad nativa bitwise exacta con el checkpoint original, tanto antes de la exportacion como tras una recarga generica en el entorno de conversion congelado. No se han proporcionado datos sobre el dataset de entrenamiento, el numero de tokens ni la composicion del corpus, ya que se trata de un modelo de vision cientifica y no de un modelo de lenguaje. Tampoco se menciona ningun proceso de RLHF o DPO.

La semantica de inferencia sigue el perfil de Topaz: se aplica un z-score de poblacion sobre el volumen completo y una restauracion de la media y la desviacion estandar de la salida. El nucleo local valido exacto requiere 160 muestras de soporte por lado, con requisitos de modulo-32 para el nucleo, el origen y la evaluacion. Sin embargo, la red densa en si solo exige ejes espaciales de tamano mayor o igual a 32, sin necesidad de divisibilidad por 32. El camino historico del vendedor con `patch_size=96` y `padding=48` se considera una evidencia distinta y no una ejecucion exacta del operador denso.

## Capacidades

- Denoising de tomogramas 3D de criomicroscopia electronica, reduciendo ruido y mejorando la senal para el analisis estructural.
- Procesamiento de volumenes completos con restauracion estadistica de la salida (media y desviacion) tras normalizacion z-score.
- Soporte para el operador denso con ejes espaciales de al menos 32 muestras, sin necesidad de alineacion modulo-32 en la red completa.
- Compatibilidad con el formato FORMAT-2 de Scitomo, que permite recarga generica en entornos compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step, al no ser un modelo de lenguaje.
- No incluye capacidades de vision generativa, audio ni texto; su unica funcion es la restauracion de volumenes 3D.

## Casos de uso

- Mejora de tomogramas 3D en criomicroscopia electronica: el modelo se aplica a volumenes completos para reducir ruido y facilitar la visualizacion de estructuras celulares y macromoleculas.
- Preprocesamiento para segmentacion automatica: al limpiar la senal, se mejora la entrada a algoritmos de segmentacion de membranas, organulos o particulas.
- Restauracion de datos criotomograficos en pipelines de analisis cientifico: su paridad bitwise con el checkpoint original garantiza resultados reproducibles en entornos de investigacion.
- Comparacion de metodos de denoising: sirve como referencia para evaluar otros algoritmos de restauracion en el dominio de la criotomografia.
- Integracion en flujos de trabajo de laboratorio que requieren procesamiento local de volumenes sin dependencia de servicios externos.
- Investigacion metodologica en restauracion de imagenes 3D: el modelo ofrece un caso de estudio de conversion de pesos con validacion de paridad numerica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al tratarse de un modelo con 2,9 millones de parametros, es previsible que funcione en GPUs de gama baja, pero no se ofrecen especificaciones oficiales de consumo.
- Opciones de despliegue: no disponible (se menciona el formato FORMAT-2 de Scitomo, pero no se detallan frameworks de inferencia como vLLM, llama.cpp u Ollama).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. El modelo es una conversion del checkpoint oficial de Topaz v0.2.4, pero no se proporcionan comparaciones con otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de dominio especifico (crio-tomografia electronica) y no tiene capacidades de lenguaje ni generacion de texto.
- La conversion FORMAT-2 no implica retraining ni una nueva validacion cientifica; se trata de una redistribucion del checkpoint original.
- El nucleo local valido exacto requiere 160 muestras de soporte por lado y cumplimiento de modulo-32, lo que puede limitar su uso en volumenes con dimensiones no alineadas.
- La licencia GPL-3.0 impone obligaciones de copyleft en la redistribucion de versiones modificadas, lo que debe tenerse en cuenta para uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto, al no ser un modelo generativo.
- Para produccion, es necesario verificar la compatibilidad del formato FORMAT-2 con el entorno de despliegue y validar la integracion con el pipeline original de Topaz.

## Enlaces

- HuggingFace: https://huggingface.co/scitomo/topaz-v0.2.4-10a
- Repositorio upstream: https://github.com/tbepler/topaz (revision `c6dde54398875dcc6a210f83de019c9165fb474c`)
- Fuente de distribucion PyPI (mencionada en la model card, sin URL explicita): no disponible.
