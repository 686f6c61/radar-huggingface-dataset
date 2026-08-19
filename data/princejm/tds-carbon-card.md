# princejm/tds-carbon-card

## Resumen
Este repositorio, `princejm/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono (model card) que documenta el impacto ambiental de una ejecución de fine-tuning concreta. Fue creado por el usuario `princejm` como parte de la asignación TDS GA8, un ejercicio académico o corporativo de "Green AI" que busca cuantificar las emisiones de CO₂ asociadas al entrenamiento de modelos. La información principal incluye el hardware utilizado (5 GPU NVIDIA L40S), la región de cómputo (europe-west4), el consumo energético total (533,26 kWh) y las emisiones equivalentes de CO₂ (106,65 kg), calculadas con la herramienta CodeCarbon.

Este tipo de documentación es relevante en el contexto actual de creciente atención a la sostenibilidad en el desarrollo de IA. Aunque no aporta capacidades de inferencia ni pesos de modelo, sirve como referencia metodológica para auditar y reportar el coste ambiental de procesos de entrenamiento. El repositorio fue creado el 19 de agosto de 2026 y actualizado el mismo día, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas
Dado que no se trata de un modelo de IA, la tabla siguiente refleja los parámetros del proceso de entrenamiento documentado, no las características de un modelo.

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo fine-tuneado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |
| Hardware de entrenamiento | 5x NVIDIA L40S |
| Modo de entrenamiento | fine-tuning |
| Region de computo | europe-west4 |
| Horas de GPU | 201,8 h (PUE: 1,51) |
| Energia total consumida | 533,2565 kWh |
| Emisiones de CO₂ | 106,651 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento
No se proporciona información sobre la arquitectura del modelo que fue fine-tuneado, ni sobre el dataset, el número de tokens o el método de optimización. El repositorio se centra exclusivamente en la contabilidad de carbono del proceso. Según la model card, el entrenamiento se realizó en modo fine-tuning sobre 5 GPU NVIDIA L40S en la región europe-west4 (posiblemente Google Cloud). El consumo energético total fue de 533,2565 kWh, con un factor de eficiencia energética (PUE) de 1,51, lo que arroja unas emisiones de 106,651 kg de CO₂ equivalente. La herramienta utilizada para el cálculo es CodeCarbon, una biblioteca estándar para estimar emisiones de entrenamiento de IA.

## Capacidades
Este repositorio no ofrece ninguna capacidad de inferencia, generación de texto, razonamiento, código, visión ni ningún otro tipo de funcionalidad de modelo de IA. Su contenido es exclusivamente documental y sirve para:
- Reportar la huella de carbono de un proceso de entrenamiento específico.
- Servir como plantilla o ejemplo para futuras fichas de contabilidad ambiental.
- Permitir la auditoría externa del consumo energético y las emisiones asociadas a un trabajo de fine-tuning.

## Casos de uso
Aunque no es un modelo de IA, este tipo de ficha tiene aplicaciones prácticas en el ámbito de la sostenibilidad en el desarrollo de software y machine learning:
- Auditoría interna de emisiones: las organizaciones pueden usar esta ficha como registro para verificar el cumplimiento de objetivos de reducción de carbono en sus flujos de entrenamiento.
- Reporte regulatorio: en jurisdicciones que exigen transparencia ambiental, este formato facilita la comunicación de métricas de energía y CO₂.
- Comparación de infraestructuras: al documentar hardware y región, permite evaluar el impacto de diferentes configuraciones de cómputo.
- Educación y concienciación: sirve como ejemplo didáctico para estudiantes y profesionales que aprenden a medir el coste ambiental de la IA.
- Optimización de costes energéticos: los datos de PUE y energía pueden usarse para identificar ineficiencias en el centro de datos.
- Transparencia en publicaciones académicas: los investigadores pueden adjuntar esta ficha a sus papers para reportar el impacto de sus experimentos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de ningún modelo, ya que su propósito es la contabilidad de carbono, no la evaluación de capacidades.

## Requisitos de hardware
No se especifican requisitos de hardware para ejecutar este repositorio, ya que no contiene código de inferencia ni pesos. Sin embargo, el proceso documentado utilizó:
- 5 GPU NVIDIA L40S (cada una con 48 GB de VRAM, aunque no se indica cuánta se usó).
- Infraestructura en la región europe-west4 (Google Cloud).
- Para reproducir el entrenamiento, se necesitaría un entorno similar con al menos 5 GPU L40S y las herramientas de CodeCarbon instaladas.
- No se proporcionan opciones de despliegue ni latencia, al no ser un modelo servible.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo de IA, por lo que no tiene comparativa directa con otros modelos. Como documento de contabilidad de carbono, podría compararse con otras model cards de emisiones (por ejemplo, las generadas por CodeCarbon en otros proyectos), pero no se dispone de datos de otros repositorios en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo de IA: no se puede utilizar para ninguna tarea de procesamiento de lenguaje natural, visión o generación de contenido.
- Información incompleta: no se indica qué modelo fue fine-tuneado, ni el dataset, ni la duración exacta del entrenamiento más allá de las horas de GPU.
- Sin licencia especificada: el repositorio no declara licencia, por lo que su uso y distribución pueden estar restringidos legalmente.
- Datos de emisiones limitados: las emisiones calculadas dependen del factor de emisión de la red eléctrica de la región y de la precisión de CodeCarbon; pueden no ser representativas de otros entornos.
- Sin actualizaciones ni soporte: el repositorio tiene cero descargas y cero interacciones, lo que sugiere que es un artefacto académico sin mantenimiento activo.
- Riesgo de malinterpretación: quien busque un modelo de IA en este repositorio se llevará una decepción; su propósito es puramente documental.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/princejm/tds-carbon-card
- Model Card de referencia similar (Jesmelchi): https://huggingface.co/Jesmelchi/tds-carbon-card
- Documentación de Model Cards en HuggingFace: https://huggingface.co/docs/hub/model-cards
