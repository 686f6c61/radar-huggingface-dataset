# krishnaku/co2_eq_emissions

## Resumen

Este repositorio de HuggingFace, identificado como `krishnaku/co2_eq_emissions`, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de emisiones de carbono asociado a un proceso de fine-tuning. La model card incluida documenta métricas verificadas de consumo energético y emisiones de CO₂ equivalente para una ejecución de entrenamiento concreta, identificada mediante el archivo `carbon_run_log_24f2008865.json`. El autor, `krishnaku`, ha publicado este registro como parte de una práctica de transparencia ambiental en el desarrollo de IA, siguiendo el estándar de la herramienta CodeCarbon.

El propósito de esta publicación es auditar el impacto climático de un entrenamiento específico, no ofrecer un modelo utilizable. Por tanto, cualquier evaluación técnica orientada a capacidades de generación, razonamiento o procesamiento de lenguaje no es aplicable. La relevancia de este repositorio radica en su contribución a la contabilidad de emisiones en el ciclo de vida de los modelos, un aspecto cada vez más demandado en entornos de investigación y producción responsables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos adicionales registrados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones totales | 83.524 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |
| Ubicacion geografica | europe-north1 |
| Hardware utilizado | 3x NVIDIA L40S (350 W TDP) |
| Tiempo de ejecucion | 439 GPU horas |
| PUE del centro de datos | 1.51 |
| Factor de emision de la red | 120 gCO₂eq/kWh |
| Energia total consumida | 696.035 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que este repositorio no publica pesos ni configuracion de red. La model card indica que se realizo un proceso de fine-tuning, pero no especifica el modelo base, el conjunto de datos ni las tecnicas de optimizacion empleadas. El unico dato de entrenamiento disponible es el registro de emisiones: 439 horas de GPU en tres NVIDIA L40S, con un consumo total de 696.035 kWh y 83.524 kg de CO₂eq, calculados mediante CodeCarbon. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni soporte multilingue.
- Funciona como un registro de auditoria de emisiones de carbono para un entrenamiento especifico.
- Puede servir como referencia para replicar metodologias de medicion de impacto ambiental en otros proyectos de IA.

## Casos de uso

- Auditoria interna de sostenibilidad: una organizacion puede utilizar este registro como plantilla para documentar las emisiones de sus propios entrenamientos, siguiendo el mismo formato de CodeCarbon.
- Comparativa de eficiencia energetica: investigadores pueden contrastar los valores de este registro (83.524 kg CO₂eq para 439 GPU horas) con los de otros entrenamientos para evaluar la eficiencia relativa de diferentes configuraciones de hardware y ubicaciones.
- Cumplimiento normativo: en entornos donde se exige reportar la huella de carbono de actividades de computacion, este tipo de model card sirve como evidencia documental.
- Educacion y divulgacion: se puede usar como ejemplo practico de como medir y comunicar el impacto ambiental de la IA, especialmente en cursos de IA responsable.
- Optimizacion de infraestructura: los datos de PUE (1.51) y factor de emision regional (120 gCO₂eq/kWh) permiten estimar el impacto de trasladar cargas de entrenamiento a regiones con energias mas limpias.
- Desarrollo de herramientas de contabilidad: los desarrolladores de CodeCarbon o herramientas similares pueden emplear este registro como caso de prueba para validar sus propias mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo evaluable, por lo que no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El hardware utilizado en el entrenamiento registrado fue de 3x NVIDIA L40S (350 W TDP cada una), con un total de 439 GPU horas.
- No se especifican requisitos de VRAM para inferencia, ya que no se ofrece un modelo desplegable.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay pesos que servir.
- La latencia y el throughput no son aplicables.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Su funcion es documental, no funcional.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje, generacion o razonamiento.
- La informacion de emisiones corresponde a una ejecucion especifica y no es generalizable a otros entrenamientos, incluso con el mismo hardware.
- No se indica la licencia de uso del contenido, por lo que se debe contactar al autor antes de reutilizar los datos con fines comerciales.
- La model card no detalla el modelo base ni el conjunto de datos, lo que limita la reproducibilidad del proceso de entrenamiento.
- El registro de emisiones depende de factores externos (PUE, mix electrico regional) que pueden variar con el tiempo, por lo que los valores no son estaticos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/krishnaku/co2_eq_emissions
- Articulo sobre metodos de evaluacion de ganancia efectiva de IA y emisiones: https://www.sciencedirect.com/science/article/pii/S030147972300049X
- Articulo sobre eco2AI, herramienta de seguimiento de emisiones: https://link.springer.com/article/10.1134/S1064562422060230
- Version PDF del articulo eco2AI en ResearchGate: https://www.researchgate.net/publication/367275024_eco2AI_Carbon_Emissions_Tracking_of_Machine_Learning_Models_as_the_First_Step_Towards_Sustainable_AI
- Estudio sobre prediccion de huella de CO2 con IA (MDPI): https://www.mdpi.com/2073-4433/13/11/1871
- Estimacion de emisiones de CO2 en transporte con machine learning: https://www.sciencedirect.com/science/article/pii/S1361920924002335
