# Krishnaprathap/tds-carbon-card

## Resumen

El repositorio `Krishnaprathap/tds-carbon-card` no es un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a una ejecución de entrenamiento de un modelo dentro del programa TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y las especificaciones de hardware utilizadas durante un entrenamiento previo (pre-training). Fue creado por Krishnaprathap el 18 de agosto de 2026 y actualizado el mismo día. Su relevancia radica en la creciente necesidad de auditar el impacto ambiental del entrenamiento de modelos, alineándose con iniciativas de "IA verde" (Green AI). No contiene pesos, arquitectura ni capacidades de inferencia; es un artefacto de metadatos para la trazabilidad de emisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de contabilidad, no contiene modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

Datos adicionales reportados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 237.673 kg CO₂eq |
| Fuente de emisiones | codecarbon |
| Tipo de entrenamiento | pre-training |
| Ubicacion geografica | ap-southeast1 |
| Hardware utilizado | NVIDIA L40S (2 GPUs) |
| Horas de GPU | 442.1 h (PUE: 1.6) |
| Energia total | 495.152 kWh |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (si existe). El repositorio documenta un entrenamiento de tipo pre-training realizado con 2 GPUs NVIDIA L40S en la region ap-southeast1. El consumo energetico total fue de 495.152 kWh, con un factor de eficiencia energetica (PUE) de 1.6, y se emitieron 237.673 kg de CO₂ equivalente, medidos mediante la herramienta CodeCarbon. No se mencionan datos del dataset, ni tecnicas de optimizacion (RLHF, DPO, etc.), ni innovaciones arquitectonicas.

## Capacidades

- No aplica: este repositorio no contiene un modelo funcional ni capacidades de generacion, razonamiento, codigo, vision o procesamiento del lenguaje.
- Funciona como un registro de metadatos ambientales para auditoria de entrenamiento.
- Permite consultar las emisiones de carbono asociadas a un entrenamiento concreto.
- Puede servir como referencia para comparar el coste ambiental de diferentes configuraciones de hardware y regiones.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el repositorio sirve como evidencia documental del impacto ambiental de un entrenamiento especifico, util para informes de responsabilidad corporativa o cumplimiento normativo.
- Comparacion de eficiencia entre regiones y hardware: los datos de emisiones y energia permiten evaluar si la eleccion de la region ap-southeast1 y las GPUs L40S fue adecuada en terminos de huella de carbono.
- Investigacion en Green AI: investigadores pueden usar estos datos como caso de estudio para analizar la relacion entre horas de GPU, consumo energetico y emisiones.
- Integracion en pipelines de MLOps: los metadatos pueden incorporarse a sistemas de seguimiento de experimentos (por ejemplo, MLflow) para registrar automaticamente el coste ambiental de cada entrenamiento.
- Educacion y concienciacion: sirve como ejemplo practico de como documentar emisiones en proyectos de IA, fomentando buenas practicas en la comunidad.
- Verificacion de calculos de CodeCarbon: permite contrastar la precision de las estimaciones de emisiones con los datos reportados por la herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento de ningun modelo, ya que su proposito es la contabilidad de carbono.

## Requisitos de hardware

- Hardware de entrenamiento reportado: 2 GPUs NVIDIA L40S.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo desplegable.
- No aplica para despliegue en vLLM, llama.cpp, Ollama u otras herramientas de inferencia.
- Para reproducir el entrenamiento documentado se necesitaria un entorno con al menos 2 GPUs L40S (cada una con 48 GB de VRAM) y una infraestructura en la region ap-southeast1 (Google Cloud, probablemente).
- El consumo energetico total fue de 495.152 kWh, lo que da una idea del coste operativo en terminos de electricidad.

## Comparativa con modelos similares

No disponible. Al no ser un modelo de IA, no existe una categoria comparable de modelos similares. Podria compararse con otros repositorios de contabilidad de carbono, pero no se dispone de informacion sobre alternativas.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo funcional; no puede utilizarse para inferencia, generacion ni ninguna tarea de IA.
- Los datos de emisiones son estimaciones de CodeCarbon y pueden variar segun la metodologia y la fuente de energia de la red electrica.
- La licencia no esta especificada, por lo que no se garantiza el uso comercial del contenido.
- No hay informacion sobre el modelo original al que corresponde este entrenamiento, lo que limita su utilidad para replicar o auditar el proceso completo.
- La fecha de creacion (2026) es futura en relacion al contexto actual, lo que sugiere que podria tratarse de un proyecto hipotetico o de simulacion.
- No se indican sesgos, alucinaciones ni riesgos de seguridad, ya que no hay modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Krishnaprathap/tds-carbon-card
- Herramienta CodeCarbon (mencionada en la model card): https://codecarbon.io/ (enlace externo, no verificado en la informacion proporcionada)
