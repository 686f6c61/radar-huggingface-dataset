# phy710/Cyst-X

## Resumen

Cyst-X es un framework de inteligencia artificial diseñado para la estratificación del riesgo de malignidad en neoplasias quísticas pancreáticas (IPMN), un precursor del cáncer de páncreas. Desarrollado por el NUBagciLab, integra segmentación automática del páncreas, extracción de características radiomics y clasificación profunda en un pipeline de extremo a extremo, con soporte para aprendizaje federado que permite entrenar modelos de forma colaborativa entre instituciones sin compartir datos de pacientes. El repositorio de HuggingFace aloja los pesos del modelo, con un tamaño de 168,4 GB y licencia MIT.

La relevancia actual de Cyst-X radica en que es el primer conjunto de datos multicéntrico y a gran escala de resonancia magnética (RM) para quistes pancreáticos, cubriendo una carencia frente a los datasets basados en tomografía computarizada (TC). Su enfoque centrado en el páncreas, en lugar de la segmentación individual de quistes, permite una evaluación estandarizada y robusta en poblaciones diversas. El modelo ha demostrado un rendimiento superior a las guías clínicas convencionales en la detección de IPMN de alto riesgo, tanto en entornos centralizados como federados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de segmentacion de pancreas, extraccion de radiomics y clasificacion profunda (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision medica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 168,4 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

Cyst-X se compone de un pipeline modular que combina tres etapas principales: segmentacion automatica del pancreas mediante redes neuronales convolucionales, extraccion de caracteristicas radiomics (textura, forma, intensidad) y un clasificador profundo que integra estas caracteristicas para predecir el riesgo de malignidad. El entrenamiento se realiza sobre un dataset multicentrico de RM abdominal, con anotaciones de IPMN confirmadas histologicamente. El framework soporta aprendizaje federado, lo que permite entrenar el modelo de forma distribuida entre multiples centros hospitalarios sin centralizar los datos de pacientes, preservando la privacidad. No se han publicado detalles sobre el numero exacto de parametros, la arquitectura especifica de las redes neuronales o el volumen de datos de entrenamiento en la informacion disponible.

## Capacidades

- Segmentacion automatica del pancreas en imagenes de resonancia magnetica.
- Extraccion de caracteristicas radiomics cuantitativas (forma, textura, intensidad).
- Clasificacion de riesgo de malignidad en neoplasias quisticas pancreaticas (IPMN).
- Soporte para entrenamiento en entornos centralizados y federados.
- Integracion de multiples modalidades de RM (secuencias T1, T2, etc.) para una evaluacion estandarizada.
- Capacidad de generar mapas de atencion o regiones de interes para interpretabilidad (no confirmado en la informacion disponible).

## Casos de uso

- Cribado de pacientes con quistes pancreaticos incidentales: el modelo puede clasificar automaticamente el riesgo de malignidad a partir de RM abdominales rutinarias, ayudando a priorizar casos que requieren seguimiento o intervencion.
- Apoyo al diagnostico en unidades de hepatologia y cirugia pancreatica: los radiologos pueden utilizar las predicciones de Cyst-X como segunda opinion para decidir entre vigilancia activa o reseccion quirurgica.
- Entrenamiento federado entre hospitales: instituciones con datos de pacientes sensibles pueden colaborar para mejorar el modelo sin compartir informacion clinica, cumpliendo con normativas de privacidad como el RGPD.
- Investigacion clinica en biomarcadores de imagen: el pipeline de radiomics permite extraer caracteristicas cuantitativas reproducibles que pueden correlacionarse con resultados histopatologicos en estudios retrospectivos.
- Evaluacion de guias clinicas: el modelo puede compararse con criterios establecidos (como las guias de Fukuoka) para identificar discrepancias y potenciales mejoras en la practica clinica.
- Desarrollo de herramientas de triaje en sistemas de salud: integrado en flujos de trabajo de radiologia, puede reducir la carga de trabajo al filtrar casos de bajo riesgo y alertar sobre los de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como AUC, sensibilidad, especificidad) en la informacion disponible. El articulo de arXiv menciona que el sistema supera a las guias clinicas en la deteccion de IPMN de alto riesgo, pero no se proporcionan cifras concretas en el material consultado. Se recomienda consultar el paper original para obtener metricas detalladas.

## Requisitos de hardware

- El repositorio de pesos tiene un tamano de 168,4 GB, lo que sugiere un modelo de gran escala que requiere hardware de alto rendimiento.
- No se dispone de informacion sobre VRAM estimada para inferencia ni sobre GPUs especificas recomendadas.
- Dado el volumen de pesos, es probable que se necesiten GPUs de datacenter (A100, H100) o multiples GPUs para cargar el modelo completo en memoria.
- Para despliegue en entornos clinicos, se podria considerar la cuantizacion o la extraccion de submodelos, aunque no se han publicado opciones oficiales.
- No se han documentado opciones de despliegue con frameworks como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el ambito de la estratificacion de riesgo de IPMN mediante RM. Existen sistemas basados en TC, pero Cyst-X se posiciona como el primer benchmark multicentrico de RM. No se puede establecer una comparativa cuantitativa con alternativas sin datos publicados.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para IPMN y puede no generalizar a otros tipos de neoplasias quisticas pancreaticas.
- Al ser un modelo de vision medica, su uso en produccion requiere validacion clinica exhaustiva y aprobacion regulatoria (FDA, EMA) antes de su aplicacion en pacientes.
- Los datos de entrenamiento provienen de multiples centros, pero pueden existir sesgos demograficos o de protocolo de adquisicion de RM que afecten a poblaciones no representadas.
- El riesgo de alucinacion no aplica en el sentido de los modelos de lenguaje, pero si existe la posibilidad de errores de segmentacion o clasificacion que deben ser revisados por un especialista.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantias de exactitud ni responsabilidad por uso clinico.
- El repositorio de HuggingFace no proporciona documentacion sobre el formato de pesos ni instrucciones de carga, lo que puede dificultar su integracion en pipelines existentes.

## Enlaces

- HuggingFace: https://huggingface.co/phy710/Cyst-X
- GitHub (repositorio oficial): https://github.com/NUBagciLab/Cyst-X/
- Articulo arXiv (v1): https://arxiv.org/html/2507.22017v1
- Articulo arXiv (v2, PDF): https://arxiv.org/pdf/2507.22017v2
- Resumen en Emergent Mind: https://www.emergentmind.com/topics/cyst-x
