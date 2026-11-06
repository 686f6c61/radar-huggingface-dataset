# QYyyyyyyy/P4_3_FORMAL6_SO101

## Resumen

P4_3_FORMAL6_SO101 es un conjunto de pesos para políticas de control robótico entrenadas con el algoritmo ACT (Action Chunking Transformer) sobre el robot SO101, empaquetado en formato LeRobot. Lo publica el usuario QYyyyyyyy en Hugging Face y no es un modelo de lenguaje: es un artefacto de robótica que contiene cuatro candidatos de política entrenados sobre datos de un robot real, junto con estadísticas de normalización, prototipos, caché offline de características DINO/ResNet y una instantánea del código de inferencia.

El repositorio incluye cuatro variantes diferenciadas por semilla y por número de pasos de entrenamiento: L1 (Legacy P1 seed1, 80k pasos), F3 (Fixed raw-Top P1 seed3, 80k), A1 (Original ACT seed1, 80k) y L1_160K (continuación de Legacy P1 seed1 hasta 160k). El tamaño del repositorio es de 1,2 GB, lo que es coherente con pesos de un transformer pequeño de política más las cachés de características visuales precalculadas.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un solo autor, sin descargas ni validación en robot real por parte de la tarea de preparación, y con documentación parcialmente en chino. Resulta útil como referencia para quien trabaje con LeRobot y el robot SO101, pero no debe tratarse como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible; se distribuyen pesos de inferencia exportados sin pérdida |
| Idiomas soportados | no aplica (modelo de control robótico); documentación parcial en chino |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking Transformer), un transformer de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. El repositorio incluye una caché offline de características DINO/ResNet, lo que sugiere que el codificador visual se precalcula para acelerar el entrenamiento, y estadísticas Train90 junto con prototipos para la normalización de entradas y salidas.

Se publican cuatro políticas entrenadas sobre datos de robot real: L1 (Legacy P1, semilla 1, 80k pasos), F3 (Fixed raw-Top, semilla 3, 80k pasos), A1 (ACT original, semilla 1, 80k pasos) y L1_160K (continuación de L1 hasta 160k pasos). No se especifican el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; en robótica de imitación esto último no aplica habitualmente. Los estados del optimizador permanecen en el servidor de entrenamiento y no se incluyen. No se aporta información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones de control para el robot SO101 mediante imitación (ACT).
- Predicción de chunks de acción a partir de observaciones visuales y de estado del robot.
- Cuatro variantes de política seleccionables según semilla y presupuesto de entrenamiento.
- Inferencia offline con caché de características DINO/ResNet precalculada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Evaluación comparativa de políticas ACT: las cuatro variantes (L1, F3, A1, L1_160K) permiten comparar el efecto de la semilla, del preprocesado visual (raw-Top frente a legacy) y del presupuesto de entrenamiento (80k frente a 160k) sobre el mismo robot.
- Reproducción de experimentos en SO101: el repositorio incluye estadísticas Train90, prototipos y la instantánea del código de inferencia, lo que facilita replicar el pipeline de evaluación descrito en la guía de prueba.
- Punto de partida para fine-tuning: al estar en formato LeRobot con licencia Apache 2.0, los pesos pueden reutilizarse como inicialización para nuevas tareas sobre el mismo robot.
- Docencia e investigación en imitación robótica: sirve como ejemplo completo de artefacto LeRobot con caché visual y estadísticas de normalización incluidas.
- Integración en pipelines de evaluación offline: la caché DINO/ResNet permite ejecutar comprobaciones del wrapper sin depender de un robot físico.
- Estudio de robustez frente a cambios de preprocesado: la comparación entre F3 (raw-Top) y L1 (legacy) aísla el efecto del pipeline visual en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un bloque original de 36 ensayos y un suplemento autorizado de 12 ensayos a 160k, pero no se aportan métricas numéricas de éxito ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 1,2 GB e incluye pesos, caché DINO/ResNet y estadísticas, por lo que la política en sí es de tamaño reducido.
- GPU recomendadas: no disponible; por el tamaño del artefacto, una GPU consumer de gama media debería ser suficiente, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: probable por el tamaño del repositorio, sin confirmación oficial.
- Opciones de despliegue: inferencia mediante la librería LeRobot con la instantánea de código incluida; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P4_3_FORMAL6_SO101 | ACT (LeRobot) | no disponible | no aplica | apache-2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT para SO101 | ACT (LeRobot) | no disponible | no aplica | variable | no disponible en la información proporcionada |
| Políticas de imitación genéricas en LeRobot | ACT / Diffusion Policy | no disponible | no aplica | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental de un único autor, sin descargas ni likes, y sin validación en robot real por parte de la tarea de preparación.
- Las comprobaciones del wrapper offline no equivalen a validación en robot real; Dev15 usa observaciones forzadas por el profesor (teacher forcing).
- No se incluye vídeo del dataset ni calibración del robot; es necesario conservar una calibración `nn` compatible propia.
- Los estados del optimizador no se distribuyen, por lo que no es posible reanudar el entrenamiento exactamente desde el punto publicado.
- Documentación principal en chino (REAL_ROBOT_TEST_GUIDE.md), lo que puede dificultar su uso a lectores no familiarizados.
- No se aportan métricas de éxito, sesgos ni tasas de alucinación; en robótica de imitación el riesgo principal es la generalización limitada fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación y de datos de rendimiento desaconseja su uso en producción sin evaluación propia.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni utilizarse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QYyyyyyyy/P4_3_FORMAL6_SO101
- Guía de prueba en robot real (referenciada en la model card): REAL_ROBOT_TEST_GUIDE.md, incluida en el repositorio
- Librería LeRobot: no se proporciona enlace en la información disponible
