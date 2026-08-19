# met-no/Bris-HourGlass

## Resumen

Bris-HourGlass es un modelo de predicción meteorológica desarrollado por el Instituto Meteorológico Noruego (MET Norway), la organización responsable del servicio meteorológico Yr. El modelo forma parte de la familia Bris, un sistema de predicción basado en datos que utiliza el framework Anemoi y que se presenta como una alternativa a los modelos numéricos de predicción del tiempo tradicionales. A diferencia de los modelos de lenguaje, Bris está diseñado específicamente para el pronóstico atmosférico de alta resolución, empleando redes neuronales gráficas (GNN) y una arquitectura de malla estirada que permite concentrar la resolución en regiones de interés.

El nombre "HourGlass" sugiere una posible variante o checkpoint específico del modelo Bris, aunque la información pública disponible en HuggingFace es extremadamente limitada: no se especifican parámetros, arquitectura detallada, ni datos de entrenamiento. La relevancia de este modelo radica en que representa una aplicación práctica de la IA en un dominio científico crítico como la meteorología, con el respaldo de una institución oficial y su integración en servicios reales como Yr, que atiende a millones de usuarios semanales. La licencia Apache 2.0 facilita su uso y adaptación tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal grafica (GNN) con malla estirada (stretched-grid), basada en el framework Anemoi |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Segun los resultados de busqueda, el modelo Bris se basa en redes neuronales graficas (GNN) y emplea una arquitectura de malla estirada, una innovacion que permite aumentar la resolucion espacial en areas geograficas especificas sin incrementar proporcionalmente el coste computacional. Esta arquitectura es especialmente adecuada para la prediccion meteorologica, donde la topografia y las condiciones locales requieren mayor detalle. El modelo se entrena con datos atmosfericos historicos y se integra en el framework Anemoi, desarrollado en colaboracion con el ECMWF. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Prediccion meteorologica de alta resolucion: genera pronosticos atmosfericos a partir de estados iniciales, con capacidad para resolver fenomenos locales gracias a la malla estirada.
- Inferencia paralela: el paquete `bris-inference` soporta paralelizacion de modelo y datos, permitiendo ejecutar el modelo en multiples GPUs o nodos.
- Interpolacion temporal: incluye funcionalidades para interpolar salidas en el tiempo, util para generar pronosticos a intervalos personalizados.
- Multi-encoder/decoder: el framework Anemoi permite configurar multiples codificadores y decodificadores, facilitando la adaptacion a diferentes tipos de datos de entrada y salida.
- Integracion con servicios de produccion: el modelo esta disenado para operar en entornos operativos, como el servicio Yr de MET Norway.

## Casos de uso

- Prediccion meteorologica operativa para servicios publicos: MET Norway utiliza Bris para generar pronosticos que alimentan la aplicacion Yr, que atiende a 10 millones de usuarios semanales. El modelo debe proporcionar predicciones precisas y rapidas para un territorio con orografia compleja como Noruega.
- Investigacion climatica regional: gracias a la malla estirada, el modelo puede enfocar su resolucion en areas de interes, como cuencas hidrograficas o zonas costeras, para estudiar fenomenos locales sin necesidad de ejecutar simulaciones globales de altisimo coste.
- Generacion de pronosticos para energias renovables: la prediccion de viento y radiacion solar es critica para la gestion de parques eolicos y fotovoltaicos. Bris puede proporcionar predicciones de alta resolucion temporal y espacial para optimizar la produccion y el balance de red.
- Avisos meteorologicos y alertas tempranas: la capacidad de resolver fenomenos locales permite detectar situaciones de riesgo (tormentas, nevadas, vientos fuertes) con mayor antelacion y precision, mejorando los sistemas de alerta a la poblacion.
- Validacion y comparacion de modelos numericos: Bris puede utilizarse como referencia para comparar el rendimiento de modelos convencionales de prediccion numerica (NWP), evaluando ventajas en coste computacional y precision.
- Educacion y formacion en IA aplicada: al ser un modelo open source con licencia Apache 2.0, puede emplearse como caso de estudio en cursos de aprendizaje automatico aplicado a ciencias de la Tierra, mostrando arquitecturas GNN y tecnicas de malla adaptativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los articulos mencionados indican que los modelos basados en IA han demostrado habilidad superior a los modelos convencionales en prediccion meteorologica, pero no se proporcionan metricas especificas para Bris-HourGlass.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de prediccion meteorologica basado en GNN, los requisitos dependen de la resolucion de la malla y del numero de variables atmosfericas. No se dispone de datos concretos.
- GPU recomendadas: el paquete `bris-inference` esta disenado para ejecutarse en GPUs, pero no se especifican modelos concretos. Es probable que requiera GPUs con al menos 16-24 GB de VRAM para resoluciones operativas, aunque esto es una estimacion no confirmada.
- Compatibilidad con GPUs de consumo: no hay informacion que confirme si el modelo puede ejecutarse en GPUs consumer como RTX 4090. Dado que se trata de un modelo cientifico de gran tamano, es mas probable que este orientado a GPUs de datacenter (A100, H100).
- Opciones de despliegue: el paquete `bris-inference` disponible en PyPI y GitHub permite ejecutar el modelo con paralelizacion. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos de prediccion meteorologica como GraphCast, Pangu-Weather o FourCastNet, ya que no se han publicado especificaciones detalladas ni resultados de Bris-HourGlass. La comparativa queda pendiente de la publicacion de datos oficiales.

## Limitaciones y advertencias

- Informacion tecnica incompleta: la model card de HuggingFace no contiene detalles sobre arquitectura, parametros, datos de entrenamiento ni rendimiento. Cualquier uso en produccion debe basarse en la documentacion oficial del proyecto Bris (GitHub, documentacion de Anemoi).
- Sesgos geograficos: al ser desarrollado por MET Norway, es probable que el modelo este optimizado para la region nordica y europea, lo que puede limitar su precision en otras partes del mundo.
- Riesgo de alucinacion en predicciones: como todo modelo de IA, puede generar predicciones incorrectas o inconsistentes con la fisica atmosferica, especialmente en situaciones extremas o fuera de la distribucion de entrenamiento.
- Dependencia del framework Anemoi: el modelo requiere el ecosistema Anemoi para su ejecucion, lo que implica una curva de aprendizaje y dependencias adicionales (por ejemplo, la libreria udunits2).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se especifican limitaciones adicionales sobre el uso de datos de entrenamiento o la atribucion requerida.
- Sin garantia de soporte: al ser un proyecto de investigacion, MET Norway puede no ofrecer soporte tecnico continuo para usuarios externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/met-no/Bris-HourGlass
- Repositorio de inferencia (GitHub): https://github.com/metno/bris-inference
- Paquete PyPI: https://pypi.org/project/bris/
- Articulo de Sigma2 sobre Bris: https://www.sigma2.no/research/bris-high-resolution-data-driven-weather-forecasting-model
- Articulo de LUMI sobre Bris: https://lumi-supercomputer.eu/data-driven-weather-forecasting-model/
- Perfil de MET Norway en HuggingFace: https://huggingface.co/met-no
