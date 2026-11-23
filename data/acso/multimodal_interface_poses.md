# acso/multimodal_interface_poses

## Resumen

`acso/multimodal_interface_poses` es un clasificador tabular publicado en Hugging Face por el usuario `acso`, orientado a robótica de servicio e interacción humano-robot (HRI). No es un modelo de lenguaje ni una red neuronal profunda entrenada de extremo a extremo: los tags del repositorio indican scikit-learn, joblib y random-forest, lo que apunta a un modelo de clasificación de poses a partir de características tabulares extraídas previamente. El pipeline declarado en Hugging Face es `tabular-classification`.

El modelo se enmarca en el ecosistema ROS 2 y Nav2, y su nombre sugiere que consume información multimodal (probablemente poses humanas detectadas con YOLOv8-pose junto con variables de navegación o contexto del robot) para clasificar estados o intenciones de un usuario en escenarios de RoboCup@Home. Es, por tanto, un componente de percepción y decisión ligero, pensado para integrarse en la pila de navegación de un robot de servicio más que para generar texto o razonar de forma general.

Su relevancia es acotada pero específica: ofrece un artefacto reproducible (formato joblib, licencia MIT) para tareas de clasificación de poses en HRI, un nicho donde escasean los modelos públicos bien etiquetados. El repositorio es de acceso restringido (gated) y no tiene descargas registradas en el momento de la consulta, por lo que su adopción es todavía incipiente. No se dispone de información pública sobre arquitectura detallada, tamaño o datos de entrenamiento más allá de los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random forest (scikit-learn); clasificador tabular, no red neuronal profunda |
| Parámetros totales | No disponible (modelo basado en árboles; el concepto de parámetros no aplica directamente) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; no procesa secuencias de texto) |
| Tipos de cuantización | No disponible; el artefacto se distribuye como modelo joblib de scikit-learn |
| Idiomas soportados | Inglés (`en` según metadatos) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un clasificador tabular implementado con scikit-learn y serializado con joblib, con random forest entre sus tags. Esto implica un ensamblado de árboles de decisión que opera sobre un vector de características precalculado, no sobre datos crudos de imagen o texto. El pipeline de Hugging Face asociado es `tabular-classification`.

Los tags sugieren que las características de entrada provienen de un detector de poses humanas (YOLOv8-pose) combinado con variables del entorno de navegación ROS 2 / Nav2, lo que constituye el carácter "multimodal" del modelo: fusión de señales de percepción visual de pose con contexto de navegación. No se dispone de información pública sobre el número de muestras de entrenamiento, la composición del dataset, el proceso de etiquetado ni si hubo ajuste fino o validación cruzada. Tampoco se documentan innovaciones técnicas destacables más allá de la propia fusión de modalidades en un clasificador ligero.

## Capacidades

- Clasificación de poses o estados de interfaz a partir de características tabulares derivadas de detecciones de pose humana.
- Integración prevista con ROS 2 y Nav2 para navegación asistida en robótica de servicio.
- Fusión multimodal de señales: pose (YOLOv8-pose) y contexto de navegación.
- Clasificación tabular genérica mediante random forest (scikit-learn).
- Soporte de tool calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente en inglés y opera sobre características numéricas, no sobre texto.
- Capacidades especiales (thinking mode, visión, audio): no disponibles como tales; la visión entra indirectamente vía el detector de poses externo.

## Casos de uso

- Robótica de servicio en RoboCup@Home: el clasificador puede interpretar la pose del usuario (por ejemplo, de pie, sentado, señalando) y combinarla con el estado de navegación para decidir si el robot debe acercarse, detenerse o esperar, integrándose en la pila Nav2.
- Navegación asistida en interiores: usando las características de pose y contexto como entrada tabular, el sistema puede clasificar la intención del usuario y modular la trayectoria del robot en tiempo real con un coste computacional muy bajo.
- Interacción humano-robot en recepción o atención: el modelo puede distinguir estados de disponibilidad del usuario (atento, distraído, en movimiento) a partir de detecciones de pose, permitiendo que el robot inicie o posponga la interacción.
- Prototipado rápido en investigación HRI: al ser un artefacto joblib de scikit-learn, se puede cargar en un script de Python y evaluar con datos propios sin necesidad de GPU, lo que facilita experimentos reproducibles.
- Fusión de sensores en pipelines ROS 2: el clasificador puede actuar como nodo de decisión que consume tópicos de pose y odometría y publica una etiqueta de estado, sirviendo de puente entre percepción y planificación.
- Docencia y demostraciones: su licencia MIT y su naturaleza ligera lo hacen adecuado para prácticas de machine learning aplicado a robótica, donde los estudiantes pueden inspeccionar el modelo y sustituir el detector de poses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; un random forest de scikit-learn se ejecuta en CPU y su huella de memoria es de kilobytes a pocos megabytes, no de VRAM.
- GPU recomendadas: no aplica para el clasificador. La GPU solo sería relevante para el detector de poses externo (YOLOv8-pose), que puede ejecutarse en GPUs consumer como RTX 3060 o superiores.
- Cabe en GPU consumer: sí, en la medida en que el componente pesado es el detector de poses, no el clasificador.
- Opciones de despliegue: carga directa con `joblib.load` en Python; integración como nodo ROS 2; no requiere vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; por la naturaleza del modelo (random forest sobre vectores tabulares), se espera latencia de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| acso/multimodal_interface_poses | Clasificador tabular (random forest, scikit-learn) | No aplica | MIT | Hugging Face (gated), 0 descargas |
| Clasificadores HRI basados en pose (genéricos) | Tabular o redes ligeras | No aplica | Variable | No disponible como modelos públicos comparables |
| Detectores de pose (p. ej. YOLOv8-pose) | Red neuronal de visión | No aplica | AGPL/otras según versión | Ampliamente disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de poses para HRI en ROS 2) con métricas públicas que permitan una comparación cuantitativa. La comparativa anterior es meramente cualitativa y se limita a señalar la categoría de cada componente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un clasificador entrenado sobre datos posiblemente limitados a un entorno de laboratorio o competición, puede generalizar mal a otros contextos demográficos o de iluminación.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificación errónea fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa texto ni secuencias; su etiqueta de idioma `en` es informativa y no implica capacidades lingüísticas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; conviene verificar la licencia del detector de poses asociado (YOLOv8-pose tiene licencias que pueden condicionar el uso comercial).
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en pipelines de CI/CD.
- Madurez: 0 descargas y 1 like en el momento de la consulta; no hay evidencia pública de uso en producción ni de validación independiente.
- Ausencia de documentación: no se publican detalles de entrenamiento, métricas ni procedencia de datos, lo que dificulta la auditoría y la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/acso/multimodal_interface_poses
