# pepijn223/odsc-so101-act

## Resumen

SO-101 five-object kitting ACT es una política robótica de manipulación entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el simulador MuJoCo, publicada por el usuario pepijn223 para el taller ODSC 2026. El modelo resuelve una tarea concreta de "kitting": recoger el objeto activo marcado de entre cinco objetos a escala nativa y depositarlo en una bandeja azul con líneas, dejando los otros cuatro objetos en su sitio sin desplazarlos más de 1 cm.

La arquitectura combina un backbone visual ResNet-18 con un transformer de anchura 512, 8 cabezas de atención, feedforward de 3200, 4 capas de encoder, 4 capas de encoder VAE y 1 capa de decoder. El modelo tiene 51.596.934 parámetros y procesa dos cámaras RGB de 384 × 384 píxeles (vista cenital angulada fija y vista de muñeca) junto con seis posiciones articulares medidas, produciendo seis objetivos articulares absolutos en radianes a 20 Hz.

Su relevancia es doble: por un lado, es un ejemplo reproducible y auditado de un pipeline completo de LeRobot (dataset, receta de entrenamiento en dos etapas, selección de checkpoint y evaluación balanceada); por otro, documenta con transparencia inusual los resultados por objeto, incluidos los fallos en los objetos que requieren pinzas de precisión. El checkpoint está pensado para inspección y ejecución en CPU dentro de un taller de 45 minutos, no para despliegue en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): ResNet-18 + transformer encoder/decoder con encoder VAE |
| Parametros totales | 51.596.934 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de acción de 30 pasos = 1,5 s a 20 Hz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin salida de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. El modelo usa un ResNet-18 para extraer características de las dos cámaras de 384 × 384, las combina con las seis posiciones articulares y pasa la secuencia por un encoder transformer (4 capas, anchura 512, 8 cabezas, feedforward 3200) con un encoder VAE de 4 capas y un decoder de 1 capa. En inferencia predice 30 acciones y ejecuta las 30 (1,5 segundos a 20 Hz) antes de tomar una nueva observación; la pérdida offline no depende de esa ventana de ejecución.

El entrenamiento se realizó en dos etapas sobre 250 demostraciones scriptadas aceptadas basadas en contacto (98.065 fotogramas a 20 Hz, extraídos de 255 intentos registrados), balanceadas como 5 objetos × 5 disposiciones de recogida × 10 repeticiones aceptadas variadas. La primera etapa consta de 40.000 pasos base con learning rate 1e-4 (backbone 1e-5); la segunda, de hasta 20.000 pasos de refinamiento con learning rate 1e-5 (backbone 1e-6) y un AdamW nuevo inicializado desde la política base. El checkpoint publicado usa 10.000 pasos de refinamiento (50.000 actualizaciones combinadas). Todo el entrenamiento se ejecutó en una única RTX 5090. La selección de checkpoint y la evaluación se hicieron con validación balanceada sobre 25 estratos objeto/disposición con dos resets con jitter, y un test fresco posterior con semilla base 30000.

## Capacidades

- Control robótico de manipulación: genera seis objetivos articulares absolutos en radianes a 20 Hz para un brazo SO-101.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital angulada fija y una vista de muñeca, ambas de 384 × 384 RGB.
- Pinzas especializadas: el dataset cubre pinzas de cuerpo, cilindro estrecho, asa desplazada, borde y precisión.
- Predicción de chunks de acción: 30 acciones por inferencia, ejecutadas en bloque de 1,5 segundos.
- Condicionamiento por estado propioceptivo: integra las seis posiciones articulares medidas como entrada.
- Sin entrada de pose privilegiada: no usa poses de objeto, teleport, acoplamiento ni fallback scriptado en inferencia.
- Ejecución en CPU: el checkpoint está pensado para correr en CPU dentro del simulador del taller.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Taller educativo de LeRobot: los participantes inspeccionan el dataset preparado, leen la receta de entrenamiento y ejecutan el checkpoint en CPU durante 45 minutos; cada participante puede duplicar el Space para obtener un simulador CPU independiente.
- Reproducción de experimentos de imitación: el repositorio incluye `train_config.json`, `train.sh`, `train-base.sh` y `checkpoint-selection.json`, lo que permite reproducir ambas etapas de entrenamiento y auditar todas las decisiones de selección.
- Evaluación de robustez de políticas ACT: el conjunto de validación balanceado por estrato (5 objetos × 5 disposiciones, dos resets con jitter) sirve como banco de pruebas para comparar variantes de arquitectura o de datos.
- Estudio de currículos de datos: el balance 5 × 5 × 10 y el filtrado de demostraciones exitosas por contacto permiten analizar el sesgo de selección en pipelines de imitación.
- Benchmark de éxito estricto: el predicado de éxito (elevación previa > 5 cm, contención XY orientada en la bandeja, pinza abierta, velocidad < 3 cm/s, desplazamiento de repuestos < 1 cm durante cinco pasos consecutivos a 20 Hz) es reutilizable como métrica de evaluación reproducible.
- Docencia sobre procedencia y auditoría de modelos: el repositorio conserva hashes SHA-256, revisión del dataset, commits de MuJoCo y LeRobot y todos los resultados de validación, útil como ejemplo de trazabilidad.
- Prueba de concepto de kitting simulado: recogida y depósito de objetos con pinzas variadas en un entorno MuJoCo, sin transferencia a robot real.

## Benchmarks y rendimiento

| Conjunto | ACT | Experto scriptado |
|---|---:|---:|
| Validación balanceada (35/50 en 25 estratos) | 35/50 | no disponible |
| Test fresco (semilla base 30000) | 35/50 | 48/50 |

Resultados por objeto en el test fresco:

| Objeto | ACT fresco | Experto fresco |
|---|---:|---:|
| bottle | 8/10 | 10/10 |
| socket | 5/10 | 10/10 |
| screwdriver | 8/10 | 10/10 |
| tape | 10/10 | 10/10 |
| bracket | 4/10 | 8/10 |

El criterio de aceptación del taller es estrictamente superior al 50 % global (al menos 26/50). Cada rollout tiene un máximo de 650 pasos de control. Los fallos en socket y bracket reflejan las dificultades de las pinzas de precisión sobre objetos pequeños.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y entradas de 2 × 384 × 384, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU de entrenamiento documentada: una RTX 5090 para las 50.000 actualizaciones combinadas.
- GPU recomendadas para inferencia: cualquier GPU con suficiente memoria para el simulador MuJoCo; el checkpoint también se ejecuta en CPU.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella es el renderizado del simulador, no los pesos.
- Opciones de despliegue: LeRobot (librería nativa), simulador MuJoCo 3.3.1 y el Space de Hugging Face `pepijn223/odsc-lerobot-mujoco` para ejecución en CPU.
- Latencia y throughput: control a 20 Hz con ejecución de 30 acciones por observación (1,5 s); en CPU el Space tarda unos minutos en generar cada vídeo de simulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 five-object kitting ACT (este) | 51,6 M | 30 acciones (1,5 s a 20 Hz) | Kitting de 5 objetos en MuJoCo | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | no disponible | Manipulación diversa | Apache 2.0 (mayoría) | Hugging Face |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación por difusión de acciones | variable | Hugging Face / repos públicos |

No se dispone de datos de benchmarks comparativos con otras políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El test es pequeño y acotado: cubre solo los cinco objetos conocidos y las disposiciones de recogida con jitter de pose; no establece robustez ante objetos no vistos, cambios de cámara o iluminación, ni transferencia a robot real.
- El filtrado de demostraciones exitosas introduce sesgo de selección en los datos de entrenamiento.
- Rendimiento limitado en pinzas de precisión: socket 5/10 y bracket 4/10 en el test fresco, frente a 10/10 y 8/10 del experto scriptado.
- El checkpoint es específico de la escena exacta del taller; no es un modelo general de manipulación.
- Requiere la revisión exacta del dataset (`9c632abbcfefbd3f6c1430f8af883fc67f6c50f7`) y los procesadores de normalización guardados; sin ellos la inferencia no es válida.
- No hay información sobre sesgos demográficos o sociales (no aplica a un modelo de control), pero sí sobre alucinación en el sentido de fallos de ejecución física: el modelo puede fallar sin señal de incertidumbre.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la escena y los activos de MuJoCo Menagerie y NVIDIA SimReady tienen sus propias condiciones que deben verificarse por separado.
- No se documentan cuantizaciones ni requisitos de VRAM explícitos; cualquier despliegue fuera del simulador del taller requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pepijn223/odsc-so101-act
- Dataset: https://huggingface.co/datasets/pepijn223/odsc-so101-pick-place
- Space del taller (simulador MuJoCo en CPU): https://huggingface.co/spaces/pepijn223/odsc-lerobot-mujoco
- LeRobot (librería): https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org
- MuJoCo Menagerie: https://github.com/google-deepmind/mujoco_menagerie
- NVIDIA SimReady: https://developer.nvidia.com/simready
