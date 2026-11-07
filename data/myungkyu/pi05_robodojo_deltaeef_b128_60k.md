# Myungkyu/pi05_robodojo_deltaeef_b128_60k

## Resumen

pi05_robodojo_deltaeef_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, la implementación pública de Pi0.5 en la librería LeRobot, entrenado sobre el conjunto de datos RoboDojo-Benchmark/RoboDojo en su configuración de co-entrenamiento en simulación. El autor lo describe explícitamente como un "vanilla baseline", es decir, una referencia de partida contra la que comparar variantes posteriores de la misma familia.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de cámaras (cabeza y muñecas izquierda y derecha) en comandos motores de 14 dimensiones para un robot bimanual de doble brazo ARX X5. La salida son objetivos articulares absolutos de 14 grados de libertad, generados en trozos (chunks) de 50 pasos de acción. Con aproximadamente 4.140 millones de parámetros y un repositorio de 112,2 GB (que incluye checkpoints intermedios y estados completos), es un modelo de investigación orientado a la reproducción de resultados en benchmarks de manipulación robótica.

Su relevancia es acotada pero clara: sirve como punto de comparación reproducible para la línea de experimentos del autor sobre espacios de acción (variantes "delta end-effector") y para cualquiera que quiera validar la integración de Pi0.5 con el exportador oficial de LeRobot sobre RoboDojo. No es un modelo de propósito general ni está pensado para despliegue en producción fuera del ámbito de la investigación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (implementación LeRobot 0.5.2, commit 09808183); chunk de acción de 50 pasos, tres vistas de cámara, entrenamiento en bf16 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en el idioma original de RoboDojo, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en Pi0.5, la arquitectura VLA de la familia Pi0 integrada en LeRobot. El autor documenta una configuración concreta: chunk de 50 acciones, tres entradas visuales (cámara de cabeza y cámaras de muñeca izquierda y derecha), estado articular de 14 dimensiones y la instrucción de tarea como entrada de lenguaje. La salida es un vector de 14 objetivos articulares absolutos. El entrenamiento se realizó en precisión bf16 con un tamaño de lote de optimizador de 128 y 60.000 pasos, partiendo del backbone base referenciado por identificador de hub.

Los datos de entrenamiento provienen de RoboDojo-Benchmark/RoboDojo en su configuración de co-entrenamiento en simulación: 35 tareas con 100 episodios cada una, sobre un robot bimanual de doble ARX X5, con exportación oficial de LeRobot. No se documenta el número total de tokens ni la composición detallada del dataset más allá de esa descripción. No se menciona RLHF, DPO ni ninguna fase de alineamiento posterior; se trata de un ajuste supervisado sobre demostraciones. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura Pi0.5.

El repositorio incluye checkpoints intermedios en los pasos 15.000, 30.000 y 45.000, cada uno en su propia carpeta con su fichero SHA256SUMS, lo que facilita el análisis de la evolución del entrenamiento. El estado del optimizador no se incluye en ningún checkpoint.

## Capacidades

- Control robótico bimanual: genera objetivos articulares absolutos de 14 dimensiones para un robot de doble brazo ARX X5 a partir de instrucciones de tarea.
- Percepción visual multi-cámara: consume simultáneamente imágenes de cámara de cabeza y de ambas muñecas.
- Seguimiento de instrucciones en lenguaje natural: condiciona la política de acción a la descripción textual de la tarea.
- Generación de acciones en chunks: produce secuencias de 50 pasos de acción por inferencia, lo que reduce la frecuencia de reevaluación de la política.
- Ajuste fino desde un backbone VLA preentrenado: hereda las capacidades del modelo base `lerobot/pi05_base`.
- Co-entrenamiento multi-tarea: entrenado sobre 35 tareas distintas en simulación, lo que le permite cierta generalización entre tareas del mismo benchmark.
- Puntos de control intermedios para análisis: permite evaluar el rendimiento en distintas fases del entrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso explícito, visión general, audio ni modo "thinking".

## Casos de uso

- Referencia base para experimentos de robótica: sirve como línea base "vanilla" contra la que comparar variantes del mismo autor, como la versión delta end-effector, en la evaluación sobre RoboDojo Sim.
- Reproducción de resultados en RoboDojo: permite a otros grupos replicar el co-entrenamiento sobre las 35 tareas y 100 episodios del benchmark y contrastar métricas de éxito.
- Estudio del espacio de acción: al disponer de variantes con salidas absolutas y delta end-effector, facilita el análisis comparativo de cómo afecta la representación de la acción al aprendizaje de políticas.
- Investigación en políticas bimanuales: útil para estudiar coordinación de dos brazos con tres vistas de cámara en tareas de manipulación simulada.
- Análisis de curvas de entrenamiento: los checkpoints en los pasos 15.000, 30.000 y 45.000 permiten estudiar la evolución del rendimiento y detectar cuándo se estabiliza el aprendizaje.
- Punto de partida para ajuste fino en dominios propios: al estar construido sobre LeRobot, puede servir como inicialización para fine-tuning con datos propios de robots ARX X5 o configuraciones similares.
- Validación de pipelines de exportación LeRobot: útil para verificar que el flujo oficial de exportación y carga de checkpoints funciona correctamente en un caso real documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.140 millones de parámetros, una estimación orientativa en bf16 rondaría los 8-9 GB solo para pesos, más el coste de las tres entradas visuales y del estado de inferencia, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de gama alta para investigación (A100, H100, RTX 4090), pero no hay datos publicados sobre latencia ni throughput.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos sugiere que podría caber en GPUs con 16-24 GB de VRAM en bf16, pero el pipeline de LeRobot para Pi0.5 puede imponer requisitos adicionales no documentados aquí.
- Opciones de despliegue: la librería indicada es `lerobot` (versión 0.5.2, commit 09808183). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno habitual para políticas VLA de robótica.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 112,2 GB, por lo que conviene descargar solo el checkpoint final (`ignore_patterns="checkpoints/*"`) o un único checkpoint intermedio si no se necesita el conjunto completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_robodojo_deltaeef_b128_60k | 4.143.404.816 | no disponible | VLA bimanual (objetivos articulares absolutos) | no disponible | Hugging Face, 44 descargas |
| pi05_robodojo_deltaeef2_b128_60k | no disponible | no disponible | VLA bimanual (espacio de acción delta end-effector, con corrección de etiquetas) | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base Pi0.5 | no disponible | Hugging Face (modelo base) |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento ni de especificaciones completas de alternativas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide determinar si el uso comercial está permitido. Debe consultarse con el autor antes de cualquier uso fuera de investigación.
- Ámbito restringido: es un baseline de investigación entrenado en simulación sobre RoboDojo; no hay evidencia de transferencia a robots reales ni de robustez fuera de las 35 tareas del dataset.
- Sin benchmarks publicados: no hay métricas de éxito, lo que impide evaluar su rendimiento relativo de forma objetiva.
- Riesgo de sobreajuste al benchmark: al entrenarse exclusivamente sobre RoboDojo Sim, es probable que generalice mal a otras distribuciones visuales, robots o instrucciones.
- Idiomas no documentados: se desconoce en qué idioma están las instrucciones de tarea y si el modelo responde a instrucciones en castellano u otros idiomas.
- Estado del optimizador no incluido: los checkpoints no permiten reanudar el entrenamiento exactamente donde se dejó, solo inicializar desde los pesos.
- Tamaño del repositorio elevado (112,2 GB): requiere planificar el almacenamiento y usar patrones de descarga selectiva.
- Sin información sobre sesgos ni alucinación en el sentido lingüístico: al ser una política de acción, el riesgo principal es la ejecución de acciones incorrectas o inseguras, no la generación de texto.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción o en publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi05_robodojo_deltaeef_b128_60k
- Variante delta end-effector 2: https://huggingface.co/Myungkyu/pi05_robodojo_deltaeef2_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
