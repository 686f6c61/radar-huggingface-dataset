# adisinha95/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial funcional, sino una tarjeta de modelo (model card) dedicada a la contabilidad de carbono y energía de un proceso de entrenamiento. El autor, `adisinha95`, ha publicado este registro como parte de una práctica académica (TDS GA8) para documentar la huella ambiental de un fine-tuning realizado sobre un modelo no especificado. La información disponible se limita a métricas de emisiones de CO₂ equivalente, consumo energético y hardware utilizado, sin detalles sobre la arquitectura, los parámetros o las capacidades del modelo subyacente.

La relevancia de esta publicación radica en su contribución a la transparencia ambiental en el desarrollo de IA, siguiendo iniciativas como la sintaxis carbon.txt y las recomendaciones de la comunidad de Hugging Face para incluir metadatos de emisiones en las model cards. No obstante, para un desarrollador o investigador que busque un modelo utilizable, este repositorio carece de los artefactos necesarios (pesos, tokenizador, configuración) y no puede ser empleado en tareas de inferencia o fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

Datos adicionales de sostenibilidad registrados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 85.118 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |
| Ubicacion geografica | europe-north1 |
| Hardware utilizado | NVIDIA V100 (4 GPUs) |
| Horas de GPU | 447.8 h (PUE: 1.32) |
| Energia total consumida | 709.3152 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original que fue fine-tuning, ni sobre los datos de entrenamiento, el numero de tokens procesados o las tecnicas de optimizacion empleadas. La unica informacion disponible se refiere al entorno de computo: se utilizaron 4 GPUs NVIDIA V100 en la region europe-north1 de Google Cloud, con un total de 447.8 horas de GPU y un factor de eficiencia energetica (PUE) de 1.32. El consumo energetico total fue de 709.3152 kWh, lo que resulto en 85.118 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon. Estos datos permiten estimar la huella ambiental del proceso, pero no aportan detalles tecnicos sobre el modelo en si.

## Capacidades

No aplica. Este repositorio no contiene un modelo con capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna otra funcionalidad de IA. Se trata exclusivamente de un registro de sostenibilidad asociado a un proceso de entrenamiento no especificado.

## Casos de uso

Dado que no hay un modelo ejecutable, los casos de uso se limitan al ambito de la gestion ambiental y la auditoria de procesos de IA:

- **Auditoria de huella de carbono en proyectos de IA**: el repositorio sirve como ejemplo de como documentar las emisiones de CO₂ de un entrenamiento, util para empresas que necesitan reportar su impacto ambiental.
- **Referencia para practicas de Green AI**: investigadores pueden usar estos datos como referencia de costes energeticos de un fine-tuning con hardware V100 en una region concreta.
- **Educacion y divulgacion**: en cursos de IA responsable, este ejemplo ilustra como aplicar herramientas como CodeCarbon y como estructurar una model card con metadatos de sostenibilidad.
- **Comparativa de eficiencia**: los valores de energia y emisiones pueden compararse con otros registros similares para evaluar la eficiencia de diferentes configuraciones de hardware y ubicaciones.
- **Cumplimiento normativo**: ante futuras regulaciones sobre transparencia ambiental en IA, este tipo de documentacion podria ser requerida; el repositorio ofrece una plantilla basica.
- **Investigacion en medicion de emisiones**: los datos de PUE, horas de GPU y energia pueden utilizarse para calibrar modelos de estimacion de impacto en centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no existir un modelo, no es posible evaluar su rendimiento en tareas de lenguaje, vision u otras.

## Requisitos de hardware

No aplica para inferencia, ya que no se distribuyen pesos ni un modelo ejecutable. Los requisitos de hardware documentados corresponden al proceso de entrenamiento original:

- 4 GPUs NVIDIA V100 (no se especifica la memoria VRAM por GPU, pero el modelo V100 suele tener 16 GB o 32 GB).
- Region de computo: europe-north1 (Google Cloud).
- No se proporcionan opciones de despliegue, latencia ni throughput, al no haber un artefacto de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que este repositorio no contiene un modelo de IA, sino una tarjeta de sostenibilidad. No se pueden establecer comparaciones con alternativas de la misma categoria.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no se incluyen pesos, tokenizador, configuracion ni codigo de inferencia. Intentar cargarlo como un modelo de Hugging Face fallara.
- **Informacion incompleta**: se desconoce el modelo base sobre el que se realizo el fine-tuning, el dataset utilizado y las tecnicas de entrenamiento.
- **Licencia no especificada**: no se indica bajo que licencia se distribuye este contenido, lo que limita su reutilizacion legal.
- **Riesgo de malinterpretacion**: podria confundirse con un modelo de IA real, pero es solo un registro de emisiones.
- **Datos de emisiones con posible sesgo**: las mediciones de CodeCarbon dependen de factores como el factor de emision de la red electrica de la region, que pueden variar con el tiempo; los valores son estimaciones, no mediciones exactas.
- **Sin soporte para produccion**: al no existir un modelo, no hay garantias de funcionamiento, mantenimiento ni actualizaciones.

## Enlaces

- Repositorio en Hugging Face: [adisinha95/tds-carbon-card](https://huggingface.co/adisinha95/tds-carbon-card)
- Documentacion de model cards en Hugging Face: [Model Cards · Hugging Face](https://huggingface.co/docs/hub/model-cards)
- Directorio de sostenibilidad de modelos con carbon.txt: [AI Model Sustainability Directory](https://carbontxt.org/ai-model-cards)
- Guia de model cards de Google DeepMind: [Model cards — Google DeepMind](https://deepmind.google/models/model-cards/)
- Definicion de model card en AI Wiki: [Model card - AI Wiki](https://aiwiki.ai/wiki/model_card)
