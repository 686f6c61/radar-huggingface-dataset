# mri2026tds/green-ai-carbon-audit

## Resumen

El repositorio `mri2026tds/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de carbono asociado a un entrenamiento de un modelo no especificado. Fue creado por el usuario `mri2026tds` en el contexto de una asignación académica (TDS GA8) y documenta las emisiones de CO₂ equivalente, el consumo energético y las características del hardware utilizado durante una fase de pre-entrenamiento. No se proporciona información sobre la arquitectura, el tamaño, los parámetros ni las capacidades del modelo subyacente, por lo que este repositorio debe entenderse como una ficha de sostenibilidad, no como un artefacto de IA desplegable.

La relevancia de este tipo de registros radica en la creciente demanda de transparencia ambiental en el desarrollo de modelos de aprendizaje automático. Aunque el repositorio en sí no ofrece funcionalidad de IA, sirve como ejemplo de cómo documentar la huella de carbono de un entrenamiento, siguiendo prácticas como las de CodeCarbon. En el contexto actual, donde la eficiencia energética y la sostenibilidad son criterios cada vez más valorados, este tipo de auditorías complementa la evaluación técnica de cualquier modelo.

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

Datos adicionales del registro de entrenamiento (extraidos de la model card):

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA A100 (4 GPUs) |
| Modo de entrenamiento | pre-training |
| Region | ap-southeast1 |
| Horas de GPU | 420,4 h |
| PUE | 1,27 |
| Energia total | 854,2528 kWh |
| Emisiones de CO₂ | 410,041 kg CO₂eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La model card unicamente documenta el impacto ambiental del proceso de pre-entrenamiento: se utilizaron 4 GPUs NVIDIA A100 durante 420,4 horas, con un PUE de 1,27, lo que resulto en un consumo total de 854,2528 kWh y unas emisiones de 410,041 kg de CO₂ equivalente, medidas con la herramienta CodeCarbon. No se mencionan innovaciones tecnicas ni detalles del proceso de entrenamiento mas alla de estos datos.

## Capacidades

- No se ha publicado ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, vision, etc.).
- No se indica soporte para tool calling, agentes, multilingue ni ninguna otra habilidad.
- El repositorio no contiene pesos, tokenizadores ni artefactos de inferencia; solo documentacion ambiental.

## Casos de uso

Dado que no se trata de un modelo de IA utilizable, los casos de uso se limitan al ambito de la auditoria y la sostenibilidad:

- Referencia para auditorias de carbono en entrenamiento de modelos: el registro puede servir como ejemplo de como documentar emisiones y consumo energetico siguiendo metodologias como CodeCarbon.
- Comparativa de eficiencia energetica: investigadores pueden usar estos datos para comparar el coste ambiental de diferentes configuraciones de hardware (en este caso, 4x A100) en la region ap-southeast1.
- Educacion y formacion: en cursos de IA responsable, este repositorio ilustra la practica de reportar la huella de carbono junto al desarrollo de modelos.
- Evaluacion de proveedores de computo: los datos de PUE y emisiones pueden ayudar a decidir entre regiones o centros de datos con mejor perfil ambiental.
- Integracion en informes de sostenibilidad corporativa: los valores de CO₂eq y kWh pueden incorporarse a memorias de responsabilidad social o cumplimiento de normativas como ISSB.
- Desarrollo de herramientas de medicion: el uso de CodeCarbon como fuente de datos puede inspirar la creacion de pipelines automaticos de auditoria ambiental en proyectos de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo, ya que no se proporciona ningun modelo.

## Requisitos de hardware

- No se especifican requisitos de hardware para inferencia, ya que no existe un modelo desplegable.
- El entrenamiento documentado utilizo 4 GPUs NVIDIA A100, con un consumo total de 854,2528 kWh y 420,4 horas de GPU.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el repositorio, ya que no se trata de un modelo de IA sino de un registro de auditoria de carbono. Otros repositorios similares en Hugging Face (por ejemplo, `rajkumar17493/green-ai-carbon-audit` o `Krrrrish/green-ai-carbon-audit`) contienen documentacion equivalente, pero no ofrecen datos tecnicos de modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA funcional; no es posible realizar inferencias ni tareas de procesamiento de lenguaje.
- No se proporciona informacion sobre sesgos, alucinaciones o limitaciones de contexto, al no existir un modelo subyacente.
- La licencia no esta especificada, por lo que no se puede determinar si el contenido puede reutilizarse comercialmente.
- Los datos de emisiones corresponden a una ejecucion concreta y no son extrapolables a otros entrenamientos sin ajustes por hardware, region y duracion.
- La ausencia de especificaciones tecnicas (arquitectura, parametros, contexto) impide cualquier evaluacion de rendimiento o comparacion con otros modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mri2026tds/green-ai-carbon-audit
- Repositorios similares (sin informacion adicional): https://huggingface.co/rajkumar17493/green-ai-carbon-audit , https://huggingface.co/Krrrrish/green-ai-carbon-audit
- Articulo sobre auditoria de carbono con IA (contexto general): https://greenwalletnews.com/tech-ai/ai-carbon-footprint-auditing-2026/
- Guia sobre IA ecologica (contexto general): https://felloai.com/eco-friendly-ai/
- Recursos sobre Green AI: https://ejhusom.github.io/green-ai/
