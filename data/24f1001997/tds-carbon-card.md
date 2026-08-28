# 24f1001997/tds-carbon-card

## Resumen

El repositorio `24f1001997/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono correspondiente a una ejecución de entrenamiento (fine-tuning) realizada en el marco de una asignación académica denominada TDS GA8. El autor, `24f1001997`, documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante dicho entrenamiento, siguiendo la iniciativa Green AI de transparencia ambiental en el desarrollo de modelos.

Este artefacto es relevante porque ejemplifica las prácticas de reporte de huella de carbono en el entrenamiento de modelos, un aspecto cada vez más exigido en entornos de investigación y producción. No obstante, al carecer de pesos, arquitectura o código de inferencia, no es un modelo desplegable ni utilizable para tareas de generación, razonamiento o procesamiento de lenguaje. Su valor reside en los datos de sostenibilidad que reporta, no en capacidades de IA.

La información disponible se limita a los metadatos de Hugging Face y a la model card del autor, que especifican el hardware (5 GPUs NVIDIA V100), la región (asia-south1), las horas de GPU (24,7 h), la energía total consumida (42,6075 kWh) y las emisiones de CO₂ (27,695 kg CO₂eq). No se proporcionan detalles sobre el modelo base, el dataset, la arquitectura ni los hiperparámetros del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |
| Hardware de entrenamiento | 5x NVIDIA V100 |
| Region de entrenamiento | asia-south1 |
| Horas de GPU | 24,7 h (PUE: 1,15) |
| Energia total consumida | 42,6075 kWh |
| Emisiones de CO2 equivalente | 27,695 kg CO2eq |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que fue fine-tuneado. La model card indica únicamente que el entrenamiento se realizó en modo fine-tuning sobre 5 GPUs NVIDIA V100 en la región `asia-south1` de Google Cloud, con una duración de 24,7 horas y un PUE (Power Usage Effectiveness) de 1,15. El consumo energético total fue de 42,6075 kWh, lo que resultó en 27,695 kg de CO₂ equivalente, medidos con la herramienta CodeCarbon.

No se especifican el dataset utilizado, el número de tokens, las técnicas de optimización (como RLHF o DPO) ni ninguna innovación técnica. El repositorio se centra exclusivamente en la contabilidad ambiental del proceso de entrenamiento, sin proporcionar detalles sobre el modelo resultante ni su rendimiento.

## Capacidades

No aplica. Este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, código, visión o cualquier otra tarea. Se trata de un registro de sostenibilidad de un entrenamiento, por lo que no ofrece funcionalidades de inferencia ni procesamiento.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar la huella de carbono de entrenamientos, permitiendo a equipos de investigación reportar sus emisiones de forma estandarizada.
- Cumplimiento de políticas de Green AI: organizaciones que exigen transparencia ambiental pueden usar este tipo de registros para verificar que sus procesos cumplen con objetivos de reducción de CO₂.
- Comparación de eficiencia energética entre configuraciones de hardware: los datos de energía y emisiones permiten evaluar el impacto de diferentes GPUs o regiones en el coste ambiental de un entrenamiento.
- Educación en prácticas responsables de IA: en cursos universitarios, este ejemplo ilustra cómo medir y reportar el consumo energético de un fine-tuning, fomentando la conciencia ecológica en futuros desarrolladores.
- Optimización de costes operativos: aunque no es el objetivo principal, los datos de energía pueden correlacionarse con costes económicos en la nube, ayudando a planificar presupuestos de entrenamiento.
- Documentación interna de experimentos: equipos de ML pueden replicar este formato para mantener un histórico de emisiones de sus propios entrenamientos y tomar decisiones informadas sobre infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del modelo entrenado, ya que su propósito es la contabilidad de carbono, no la evaluación de capacidades.

## Requisitos de hardware

- No aplica para inferencia: este repositorio no contiene un modelo desplegable, por lo que no requiere VRAM, GPU ni configuración de servidor para uso en producción.
- Hardware de entrenamiento reportado: 5 GPUs NVIDIA V100, con un total de 24,7 horas de uso y un PUE de 1,15 en la región `asia-south1`.
- Para reproducir el entrenamiento (si se conociera el modelo base) se necesitaría un entorno con al menos 5 GPUs V100 o equivalente, aunque no se especifican requisitos de memoria o almacenamiento.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama, dado que no hay pesos ni artefactos de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no tiene comparativa directa con alternativas de la misma categoría. Existen otros repositorios similares en Hugging Face (por ejemplo, `Jeevan1511/tds-carbon-card` y `Chandy27/tds-carbon-card`) que también documentan la huella de carbono de entrenamientos académicos, pero todos comparten la misma naturaleza: son registros de sostenibilidad, no modelos funcionales.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de generación, análisis o razonamiento. Intentar cargarlo como modelo de lenguaje o de otro tipo fallará.
- Información incompleta: se desconocen el modelo base, el dataset, los hiperparámetros y cualquier métrica de calidad, lo que impide evaluar la relevancia del entrenamiento.
- Datos de emisiones limitados: la medición de CO₂ se realizó con CodeCarbon y cubre solo el entrenamiento, no el ciclo de vida completo (fabricación de hardware, refrigeración, etc.).
- Licencia no especificada: no se indica bajo qué términos se distribuye el contenido del repositorio, lo que puede limitar su reutilización en proyectos comerciales o académicos.
- Sin soporte ni mantenimiento: al ser un ejercicio académico, no hay garantías de actualización, corrección de errores o soporte técnico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/24f1001997/tds-carbon-card
- Repositorio similar (Jeevan1511): https://huggingface.co/Jeevan1511/tds-carbon-card
- Repositorio similar (Chandy27): https://huggingface.co/Chandy27/tds-carbon-card
- Herramienta CodeCarbon (fuente de medición): https://codecarbon.io/ (referencia indirecta, no enlazada en el repositorio)
