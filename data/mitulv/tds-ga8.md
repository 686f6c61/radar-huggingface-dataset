# mitulv/tds-ga8

## Resumen

El repositorio `mitulv/tds-ga8` no contiene un modelo de inteligencia artificial, sino una documentación de contabilidad de carbono asociada a una ejecución de entrenamiento dentro de la asignatura TDS GA8 (Green AI). El autor, `mitulv`, publica una model card que detalla las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante un proceso de pre-entrenamiento. No se proporcionan pesos, arquitectura, ni ningún artefacto de modelo descargable.

Este tipo de repositorios forma parte de una práctica académica orientada a auditar la huella de carbono de entrenamientos de IA, siguiendo iniciativas como CodeCarbon. La relevancia actual radica en la creciente preocupación por el impacto ambiental del entrenamiento de grandes modelos, y en la necesidad de estandarizar su reporte. Sin embargo, desde el punto de vista técnico, no existe un modelo que evaluar ni desplegar.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre el dataset utilizado. La model card únicamente reporta datos de entrenamiento desde la perspectiva del consumo de recursos:

- Hardware: 7 GPUs NVIDIA RTX 4090.
- Modo de entrenamiento: pre-training.
- Región del centro de datos: `ap-southeast1`.
- Horas de GPU: 344,1 horas (con PUE de 1,34).
- Energía total consumida: 1452,4461 kWh.
- Emisiones de CO₂ equivalente: 697,174 kg.

Estos datos fueron generados con la herramienta CodeCarbon. No se mencionan innovaciones técnicas, técnicas de optimización, ni detalles del proceso de entrenamiento más allá de los indicadores ambientales.

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, código, visión, tool calling, ni ninguna otra funcionalidad. Es exclusivamente un registro de contabilidad de carbono.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar el impacto ambiental de un entrenamiento, útil para empresas que necesitan reportar emisiones.
- Educación en Green AI: puede utilizarse como ejemplo en cursos sobre IA responsable para enseñar a medir y reportar la huella de carbono.
- Comparación de eficiencia energética: los datos de energía y emisiones pueden compararse con otros entrenamientos para evaluar la eficiencia de diferentes configuraciones de hardware.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el impacto climático de los sistemas de IA, este tipo de registros puede servir como evidencia.
- Investigación sobre optimización de recursos: los datos de PUE, horas de GPU y emisiones pueden alimentar estudios sobre mejores prácticas en centros de datos.
- Documentación de proyectos open source: cualquier desarrollador que entrene un modelo puede replicar esta estructura para publicar su propia huella de carbono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no reporta métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) porque no contiene un modelo.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPUs NVIDIA RTX 4090.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se indican latencias ni throughput.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque este repositorio no contiene un modelo de IA. Los repositorios similares encontrados en la búsqueda web (`anshusaurav/tds-ga8-carbon-model`, `Pranav0009/tds-ga8`, etc.) son también registros de contabilidad de carbono de la misma asignatura, sin modelos subyacentes.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA; no puede ser utilizado para inferencia, generación de texto, ni ninguna tarea de ML.
- No hay pesos, tokenizadores, ni configuración de modelo descargable.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable.
- Los datos de emisiones son específicos de una ejecución concreta y no deben generalizarse a otros entrenamientos.
- La ausencia de información sobre el modelo original (arquitectura, datos, parámetros) impide cualquier evaluación técnica.
- Para producción, este repositorio no aporta ningún valor funcional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mitulv/tds-ga8
- Repositorio similar (anshusaurav): https://huggingface.co/anshusaurav/tds-ga8-carbon-model
- Repositorio similar (Pranav0009): https://huggingface.co/Pranav0009/tds-ga8
- GitHub relacionado: https://github.com/llEclipsell/tds-ga8
- GitHub relacionado: https://github.com/deepti-iitm/tds-ga8
