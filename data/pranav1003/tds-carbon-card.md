# Pranav1003/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial generativa, sino una tarjeta de modelo (model card) orientada a la contabilidad de carbono y eficiencia energética. Documenta el entrenamiento de un modelo asignado en el contexto del curso TDS GA8, con el objetivo de registrar las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante un proceso de pre-entrenamiento.

El autor, Pranav1003 (PRANAV PRAKASH A), publica este artefacto como parte de un ejercicio académico de "Green AI" (IA sostenible), siguiendo la tendencia de las sustainability model cards que complementan las model cards tradicionales con métricas ambientales. No se proporciona información sobre arquitectura, parámetros, tareas o capacidades del modelo subyacente, ya que el foco exclusivo es la huella de carbono del proceso de entrenamiento.

La relevancia de este tipo de documentación radica en la creciente demanda de transparencia ambiental en el desarrollo de IA, permitiendo a investigadores y desarrolladores evaluar el coste ecológico de sus modelos y comparar alternativas más sostenibles.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento
No se proporciona informacion sobre la arquitectura del modelo, su tamaño, el dataset utilizado ni el proceso de entrenamiento (mas alla de indicar que fue un pre-training). El unico dato tecnico relevante es el hardware empleado: 7 GPU NVIDIA L40S, con un total de 414,3 horas de computo (PUE de 1,52) y un consumo energetico de 1542,8532 kWh, que resulto en 308,571 kg de CO₂ equivalente, calculado mediante CodeCarbon.

No hay informacion sobre innovaciones tecnicas, tecnicas de optimizacion, ni sobre el proceso de alineamiento (RLHF, DPO, etc.). El repositorio se limita a documentar el impacto ambiental del entrenamiento, sin detallar el modelo en si.

## Capacidades
- No se documenta ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, vision, etc.).
- No se menciona soporte para tool calling, agentes, ni capacidades multilingues.
- La unica capacidad que se puede inferir es la de servir como registro de sostenibilidad para auditorias de emisiones en proyectos de IA.

## Casos de uso
- Auditoria ambiental de entrenamientos de IA: permite a organizaciones cuantificar las emisiones de CO₂ asociadas a un proceso de pre-entrenamiento, util para cumplir requisitos de reporte ESG.
- Comparativa de eficiencia energetica: investigadores pueden usar estos datos para comparar el coste ecologico de diferentes configuraciones de hardware y regiones de computo.
- Educacion en IA sostenible: sirve como ejemplo practico de como documentar la huella de carbono en un proyecto academico o industrial.
- Optimizacion de infraestructura: los datos de GPU horas y PUE ayudan a decidir entre centros de datos o regiones con menor factor de emision.
- Integracion en pipelines de MLOps: se puede anadir como metadato en registros de modelos para que los equipos consideren el impacto ambiental al seleccionar modelos.
- Investigacion en Green AI: proporciona un punto de referencia para estudios sobre la relacion entre consumo energetico y rendimiento en diferentes cargas de trabajo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene metricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.), ya que su proposito es documentar el impacto ambiental, no la calidad del modelo.

## Requisitos de hardware
- El entrenamiento documentado utilizo 7 GPU NVIDIA L40S (cada una con 48 GB de VRAM, aunque no se especifica la configuracion exacta).
- Se registraron 414,3 horas de GPU con un PUE de 1,52.
- No se indica informacion sobre requisitos de inferencia, VRAM estimada, ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Al no publicarse pesos ni arquitectura, no es posible determinar si el modelo resultante cabria en GPUs de consumo.

## Comparativa con modelos similares
No disponible. No se puede comparar con otros modelos de IA generativa porque no se ha publicado informacion sobre arquitectura, parametros o rendimiento. Este repositorio es un caso particular de documentacion ambiental, no un modelo funcional.

## Limitaciones y advertencias
- No es un modelo descargable ni utilizable: el repositorio solo contiene una model card con datos de emisiones, no pesos ni codigo de inferencia.
- No se especifica la licencia, por lo que el uso comercial del contenido (si es que hubiera algo mas que la documentacion) no esta claro.
- Los datos de emisiones dependen de la region (europe-west4) y del hardware utilizado; extrapolarlos a otros entornos puede llevar a conclusiones erroneas.
- No se detalla el tipo de modelo ni su tarea, lo que impide evaluar si la huella de carbono es razonable en comparacion con otros modelos de su categoria.
- La ausencia de informacion sobre el dataset y el proceso de entrenamiento limita la reproducibilidad y la verificacion independiente de los datos reportados.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/Pranav1003/tds-carbon-card
- Perfil del autor: https://huggingface.co/Pranav1003
- Lista de modelos del autor: https://huggingface.co/Pranav1003/models
- Lista de datasets del autor: https://huggingface.co/Pranav1003/datasets
