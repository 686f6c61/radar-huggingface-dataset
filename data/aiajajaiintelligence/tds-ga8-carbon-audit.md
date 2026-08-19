# aiajajaiintelligence/tds-ga8-carbon-audit

## Resumen

El repositorio `aiajajaiintelligence/tds-ga8-carbon-audit` no contiene un modelo de inteligencia artificial en el sentido convencional, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning. Forma parte de la iniciativa académica TDS GA8 (Green AI Carbon Accounting), cuyo objetivo es documentar de forma transparente el consumo energético y las emisiones de CO₂ equivalente derivadas del entrenamiento de modelos. El autor, `aiajajaiintelligence`, publica únicamente la model card con los datos de emisiones calculados mediante la herramienta CodeCarbon, sin incluir pesos, arquitectura ni código de inferencia.

Este artefacto es relevante en el contexto actual de sostenibilidad en IA, donde la medición y reporte del impacto ambiental de los entrenamientos se está convirtiendo en una práctica exigida por organismos y comunidades de investigación. Sin embargo, al carecer de cualquier componente técnico de modelo (arquitectura, parámetros, pesos), no puede ser utilizado para tareas de generación, razonamiento o procesamiento del lenguaje. Su valor es exclusivamente documental y metodológico, sirviendo como ejemplo de cómo reportar emisiones en un fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Adicionalmente, la model card reporta los siguientes datos de entrenamiento:

| Campo | Valor |
|---|---|
| Hardware | NVIDIA V100 (300 W TDP) |
| Numero de GPUs | 4 |
| GPU horas | 340.4 |
| PUE | 1.17 |
| Region | europe-west4 (200 gCO2eq/kWh) |
| Tipo de entrenamiento | fine-tuning |
| Energia total | 477.9216 kWh |
| Emisiones totales | 95.584 kg CO2eq |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo base, el numero de parametros, la composicion del dataset de entrenamiento ni las tecnicas de optimizacion empleadas. La unica informacion disponible se limita al proceso de fine-tuning: se utilizaron 4 GPUs NVIDIA V100 con un TDP de 300 W durante 340.4 horas, con un PUE de 1.17 en la region europe-west4. El calculo de emisiones se realizo con la herramienta CodeCarbon, aplicando la formula `energia_kWh = (300 * 4 * 340.4 * 1.17) / 1000 = 477.9216` y `co2_kg = (477.9216 * 200) / 1000 = 95.58432`. No se menciona el uso de RLHF, DPO ni ninguna innovacion tecnica.

## Capacidades

No se dispone de informacion sobre capacidades del modelo. Al no publicarse pesos ni arquitectura, no es posible evaluar funciones como generacion de texto, razonamiento, codigo, tool calling, soporte multilingue o vision. El repositorio es exclusivamente un registro de emisiones y no ofrece ninguna funcionalidad de inferencia.

## Casos de uso

Dado que no existe un modelo utilizable, los casos de uso se limitan al ambito de la contabilidad ambiental y la auditoria de sostenibilidad:

- **Reporte de emisiones en proyectos de investigacion**: el repositorio sirve como plantilla para documentar el impacto de carbono de un fine-tuning, siguiendo la metodologia de CodeCarbon y los estandares de TDS GA8.
- **Auditoria interna de centros de computacion**: los datos de hardware, region y PUE pueden utilizarse para verificar la coherencia de los calculos de emisiones en infraestructuras compartidas.
- **Educacion en IA sostenible**: como caso de estudio en cursos sobre Green AI, mostrando como calcular y comunicar la huella de carbono de un entrenamiento.
- **Comparativa de eficiencia energetica**: los valores de kWh y kg CO2eq pueden compararse con otros entrenamientos similares para evaluar la eficiencia de diferentes configuraciones de hardware.
- **Cumplimiento normativo**: en entornos donde se exige transparencia ambiental, este tipo de registro puede adjuntarse a documentacion tecnica o informes de responsabilidad social corporativa.
- **Investigacion metodologica**: el repositorio puede servir como referencia para estudiar la variabilidad de las mediciones de emisiones segun la herramienta utilizada (CodeCarbon) y la region geografica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo con capacidades de inferencia, no procede evaluar metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se especifican requisitos de hardware para inferencia, ya que no se distribuyen pesos ni se ofrece servicio de ejecucion. Los unicos datos de hardware corresponden al entrenamiento:

- 4 GPUs NVIDIA V100 (300 W TDP cada una) durante 340.4 horas.
- Region europe-west4 con factor de emision de 200 gCO2eq/kWh.
- PUE de 1.17 en el centro de datos.

No se indica si el modelo cabe en GPUs de consumo, ni se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

Se han localizado otros repositorios con el mismo proposito dentro del ejercicio TDS GA8, aunque no se dispone de detalles tecnicos de ninguno de ellos:

| Repositorio | Autor | Contenido |
|---|---|---|
| aiajajaiintelligence/tds-ga8-carbon-audit | aiajajaiintelligence | Registro de emisiones de un fine-tuning (V100, 4 GPUs, 95.584 kg CO2eq) |
| anshusaurav/tds-ga8-carbon-model | anshusaurav | Model card similar, sin detalles publicos |
| Jesmelchi/tds-carbon-card | Jesmelchi | Documentacion de huella de carbono para TDS GA8 |
| JGallo0/ai-carbon-audit (GitHub) | JGallo0 | Repositorio de codigo para auditoria de carbono en IA |

No se dispone de informacion sobre arquitectura, parametros o rendimiento de estos repositorios, por lo que la comparativa se limita al ambito documental.

## Limitaciones y advertencias

- **No es un modelo de IA utilizable**: carece de pesos, arquitectura y codigo de inferencia. No puede integrarse en aplicaciones de produccion.
- **Informacion incompleta**: no se especifica el modelo base fine-tuneado, el dataset, ni las tecnicas de entrenamiento, lo que impide evaluar su validez cientifica.
- **Riesgo de malinterpretacion**: al publicarse como "modelo" en Hugging Face, puede inducir a error a quienes esperen un artefacto funcional. Es un registro de emisiones, no un modelo.
- **Dependencia de la metodologia**: los calculos de emisiones se basan en CodeCarbon y en supuestos como el TDP de la GPU y el factor de emision regional, que pueden variar en la realidad.
- **Licencia no especificada**: no se indica bajo que licencia se distribuye el contenido, lo que limita su reutilizacion legal.
- **Sin soporte ni mantenimiento**: el repositorio no muestra actividad posterior a su creacion (agosto de 2026) y no hay indicios de actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aiajajaiintelligence/tds-ga8-carbon-audit
- Repositorio similar de anshusaurav: https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Repositorio similar de Jesmelchi: https://huggingface.co/Jesmelchi/tds-carbon-card
- Repositorio de codigo en GitHub: https://github.com/JGallo0/ai-carbon-audit
- Articulo relacionado en ResearchGate: https://www.researchgate.net/publication/392727729_Sustainable_AI_Measuring_and_Reducing_Carbon_Footprint_in_Model_Training_and_Deployment
- Preprint en arXiv sobre riesgo climatico de IA generativa: https://arxiv.org/html/2511.04776v1
