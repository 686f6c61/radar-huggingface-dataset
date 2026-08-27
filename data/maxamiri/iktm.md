# maxamiri/iktm

## Resumen

IKTM (Industrial Kinematic Trajectory Model) es un modelo autoregresivo de generación de trayectorias cinemáticas para vehículos industriales, desarrollado por Max Amiri como parte de su investigación doctoral. El modelo modela la velocidad y el cambio de rumbo (heading) en series temporales de un segundo, sin coordenadas absolutas, lo que lo hace invariante a la ubicación y permite su transferencia entre sitios. Es una liberación de investigación: no es un modelo de lenguaje ni un modelo `transformers`, sino un Transformer causal decoder-only con salidas probabilísticas (mezcla gaussiana para velocidad y mezcla de von Mises para cambio de rumbo, más una probabilidad de parada).

El modelo se entrenó con telemetría anonimizada de un único sitio industrial (Site A) y se evaluó en tres sitios adicionales en modo zero-shot (sitios B, C y D). Con una dimensión oculta de 128 y una ventana de contexto de 60 pasos, es un modelo ligero que puede ejecutarse en hardware modesto. Su licencia MIT permite uso comercial con restricciones de responsabilidad, pero su propósito principal es la investigación en simulación cinemática y evaluación de transferencia entre emplazamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con salidas probabilísticas (mezcla gaussiana para velocidad, mezcla de von Mises para cambio de rumbo, probabilidad de parada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 60 pasos (máximo) |
| Tipos de cuantizacion | no disponible (checkpoint nativo de PyTorch, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch nativo) |

## Arquitectura y entrenamiento

IKTM es un transformer causal decoder-only con una representación oculta de 128 dimensiones. Cada paso de tiempo recibe como entrada la velocidad normalizada, el seno y el coseno del cambio de rumbo, un flag de inicio de secuencia y una característica de duración restante. La salida es probabilística: una mezcla gaussiana con 3 componentes para la velocidad, una mezcla de von Mises con 5 componentes para el cambio de rumbo, y una probabilidad de parada. Además, el modelo incluye un prior de duración aprendido.

El entrenamiento se realizó con datos de telemetría anonimizada de un sitio industrial (Site A), resampleados a series temporales de un segundo. Se usó una división fija por dispositivo (70% entrenamiento, 15% validación, 15% test) con semilla 42. El optimizador fue AdamW con tasa de aprendizaje 1e-3, weight decay 1e-4, batch size 128 y un scheduler de coseno. La función de pérdida combina la verosimilitud probabilística de velocidad y rumbo, la entropía cruzada binaria para la parada, y una verosimilitud del prior de duración. Se entrenaron 30 épocas, pero el checkpoint retenido es el de mejor validación (época 24).

## Capacidades

- Generación autoregresiva de secuencias de velocidad (m/s) y cambio de rumbo (grados) para vehículos industriales.
- Modelado de la distribución completa de velocidad y rumbo mediante mezclas (Gaussiana y von Mises), lo que permite muestrear trayectorias variadas.
- Estimación de la probabilidad de parada en cada paso, útil para simular finales de trayectoria.
- Condicionamiento por duración restante: el modelo puede generar trayectorias con una duración objetivo.
- Invariancia a la ubicación: al no usar coordenadas absolutas, las secuencias generadas son independientes del sitio.
- Evaluación de transferencia cross-site: el modelo muestra rendimiento degradado pero razonable en sitios no vistos (zero-shot OOD).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes.

## Casos de uso

- **Simulación cinemática de flotas industriales**: generar trayectorias sintéticas de vehículos para probar algoritmos de planificación de rutas o sistemas de gestión de flotas sin exponer datos reales.
- **Evaluación de transferibilidad entre instalaciones**: estudiar cómo se comporta un modelo entrenado en un sitio cuando se aplica a otros con diferentes políticas operativas o entornos, como se hizo en la evaluación zero-shot.
- **Generación de datos de entrenamiento para otros modelos**: las secuencias generadas pueden usarse como aumentación de datos para modelos de predicción de trayectorias o sistemas de detección de anomalías.
- **Investigación en modelos de series temporales**: sirve como banco de pruebas para arquitecturas con salidas probabilísticas y mezclas de distribuciones, especialmente en el dominio de telemetría industrial.
- **Evaluación de métricas de distribución**: las métricas de JSD (divergencia de Jensen-Shannon) para la tasa de giro permiten validar la calidad estadística de las trayectorias generadas, útil en investigación metodológica.
- **Estudio de la influencia del contexto**: analizar cómo la ventana de 60 pasos afecta la coherencia a largo plazo de las trayectorias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque el modelo no es de lenguaje ni de razonamiento general. La evaluación se centra en métricas específicas de trayectorias cinemáticas, reportadas en la model card:

| Sitio | Split | Speed RMSE, teacher-forced (m/s) | Heading RMSE, teacher-forced (grados) | Turn-rate JSD, rollout (bits) |
|---|---:|---:|---:|---:|
| Site A | ID test | 0.1178 | 21.3432 | 0.0390 |
| Site B | zero-shot OOD | 0.1281 | 19.6080 | 0.0569 |
| Site C | zero-shot OOD | 0.1413 | 20.7127 | 0.0310 |
| Site D | zero-shot OOD | 0.1509 | 23.4554 | 0.0329 |

Estos resultados se obtuvieron con temperatura T=0.2, usando 100 muestras para las métricas de rollout. Todas las trayectorias generadas en Site A terminaron de forma natural con una duración exacta (error +0.0 +/- 0.0 segundos). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se dispone de información sobre la VRAM necesaria o el número exacto de parámetros, pero la arquitectura es pequeña (dimensión oculta 128, contexto 60 pasos) y el modelo está pensado para investigación, por lo que debería ser ejecutable en GPUs de consumo como una RTX 3060 o superior.
- El checkpoint se carga como un diccionario de PyTorch, no requiere librerías adicionales más allá de `torch`.
- Para el flujo completo de generación y evaluación se recomienda usar el repositorio del proyecto (`scripts/evaluate_generator.py`), que no se ha publicado en la información disponible.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI), pero al ser un modelo pequeño, podría ejecutarse en CPU para inferencia de baja frecuencia, aunque no hay datos de latencia o throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. IKTM es un modelo especializado en generación de trayectorias cinemáticas para vehículos industriales, y no hay alternativas similares documentadas en la misma fuente. La comparación se limita a los sitios de evaluación interna (Site A, B, C, D) que se muestran en la tabla de rendimiento.

## Limitaciones y advertencias

- **Sesgo de datos**: el modelo se entrenó únicamente con datos de un único sitio industrial (Site A) y puede no representar otros flotas, políticas operativas, tipos de vehículo o entornos. La evaluación en otros sitios es zero-shot y muestra degradación, especialmente en velocidad (RMSE de 0.1509 en Site D frente a 0.1178 en Site A).
- **Sin contexto espacial**: no tiene información de coordenadas absolutas, red de carreteras, obstáculos ni intención de ruta. Las trayectorias generadas no deben interpretarse como rutas seguras ni utilizarse para planificación real.
- **No apto para control en tiempo real**: el autor advierte explícitamente que no debe usarse para control de vehículos, evitación de colisiones, decisiones de seguridad o planificación operativa sin una validación independiente y sistemas de seguridad adecuados.
- **Alucinación en secuencias**: como modelo generativo, puede producir secuencias plausibles pero no realistas en condiciones fuera de la distribución de entrenamiento.
- **Restricciones de uso**: aunque la licencia es MIT, el autor indica que es una versión de investigación y el checkpoint no es un modelo `transformers`; requiere el código específico del proyecto para cargarse correctamente.
- **Confidencialidad**: los datos de entrenamiento son confidenciales y no se incluyen en la liberación; el checkpoint contiene estadísticas de normalización de velocidad del sitio A.

## Enlaces

- [Hugging Face - maxamiri/iktm](https://huggingface.co/maxamiri/iktm)
- [GitHub del autor - maxamiri](https://github.com/maxamiri/)
- [Página personal de Max Amiri](https://maxamiri.github.io/)
- [Google Scholar de Max Amiri](https://scholar.google.com/citations?user=P6j9I1IAAAAJ&hl=en)
