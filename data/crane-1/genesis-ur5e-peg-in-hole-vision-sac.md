# crane-1/genesis-ur5e-peg-in-hole-vision-sac

## Resumen

Genesis UR5e Visual SAC es un conjunto de checkpoints de PyTorch para una política de control robótico visual entrenada con Soft Actor-Critic (SAC) sobre el simulador Genesis. El modelo resuelve una tarea concreta de manipulación: inserción de espiga en orificio (peg-in-hole) con un brazo UR5e, utilizando únicamente dos observaciones RGB de 224×224 (cámara externa y cámara de muñeca) más un vector de 26 dimensiones de propiocepción e historial de contacto. No recibe la posición de la espiga, del orificio ni su pose relativa, lo que lo convierte en un agente puramente visual y reactivo.

El desarrollo corre a cargo del usuario crane-1 y se publica como artefacto de investigación, sin métricas de descargas ni validación externa. La relevancia radica en su enfoque de aprendizaje por refuerzo con currículo de recuperación: combina demostraciones exitosas, muestras de recuperación tras contacto, correcciones de un experto en estado privilegiado y replay online, lo que permite alcanzar tasas de éxito del 96,0% en resets aleatorios y del 93,5% en recuperación de contacto preparada, siempre en simulación.

No es un modelo de lenguaje ni un modelo fundacional multimodal: es una política especializada de robótica. Por tanto, las secciones de contexto, idiomas o cuantización estándar de LLM no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico SAC con encoder visual ResNet-18 y observaciones RGB 224×224 |
| Parametros totales | no disponible (checkpoints de 1,6 GB en el repo; parámetros exactos no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; historial de propiocepción/contacto de 26 dimensiones por paso |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (sin licencia concedida para activos de terceros; artefactos de investigación tal cual) |
| Formato de pesos | PyTorch `.pt` (checkpoints con Actor, críticos gemelos, críticos objetivo, temperatura y Actor de referencia) |

## Arquitectura y entrenamiento

La política desplegada es un Actor SAC que procesa dos imágenes RGB de 224×224 mediante un encoder ResNet-18, junto con un vector de 26 dimensiones de propiocepción e historial de contacto. El checkpoint v18 incluye el Actor, dos críticos gemelos, sus copias objetivo, el parámetro de temperatura y un Actor de referencia. Existe además un profesor SAC con estado privilegiado (`sac_checkpoint.pt`) que solo se usa para recolección de datos e intervención, nunca en evaluación. El entrenamiento se realizó en Genesis 1.4.3 con Gymnasium 1.3.0, PyTorch 2.13.0+cu130, Torchvision 0.28.0+cu130 y NumPy 2.4.6 sobre Python 3.11.17.

El entrenamiento combina un batch mixto final compuesto por un 20% de demostraciones exitosas, un 20% de muestras de recuperación con elevación, un 30% de correcciones del experto en estado y un 30% de replay online. La estrategia de recuperación es explícita: tras un estancamiento por contacto descendente, el controlador eleva durante tres pasos y deja explorar al Actor hasta 40 pasos con desviación estándar de ruido de comportamiento de 0,15; el experto en estado solo interviene tras agotar el presupuesto de exploración, ante estancamientos repetidos o al alcanzar el paso de fallback. El checkpoint v18 se inicializa desde un Actor visual previo (`vision_sac_resnet224_v14g_forward_augmented.pt`). No se documentan números de tokens ni composición de dataset al uso, por tratarse de RL en simulación.

## Capacidades

- Control visual de inserción peg-in-hole con brazo UR5e a partir de dos cámaras RGB y propiocepción, sin pose privilegiada de espiga u orificio.
- Recuperación activa ante contacto: elevación de tres pasos y exploración acotada de hasta 40 pasos antes de recurrir al experto.
- Política determinista evaluable con semilla fija (semilla 30000, episodios de 180 pasos).
- Generalización a resets aleatorizados (96,0% de éxito) y a escenarios de recuperación de contacto preparados (93,5%).
- Integración con el simulador Genesis y con el ecosistema Gymnasium para entornos de RL.
- No soporta tool calling, function calling, agentes multi-paso, multilingüismo ni modos de razonamiento: es una política robótica especializada.
- No dispone de visión general, audio ni generación de texto.

## Casos de uso

- Investigación en manipulación visual: reproducir el entrenamiento y la evaluación con los checkpoints y el informe técnico en chino (`TECHNICAL_REPORT_ZH.md`) para estudiar recuperación tras contacto en tareas de inserción.
- Benchmark de políticas visuales en simulación: usar las tasas de éxito publicadas (96,0% y 93,5%) como referencia para comparar nuevos algoritmos SAC o variantes con encoder visual.
- Estudio de currículos mixtos: analizar la mezcla 20/20/30/30 de demostraciones, recuperación, correcciones de experto y replay online para diseñar estrategias de entrenamiento con intervención humana.
- Prototipado de control reactivo cámara-a-acción: validar pipelines de percepción con dos vistas (externa y muñeca) antes de trasladar la política a hardware real con las validaciones de seguridad oportunas.
- Docencia y formación en RL robótico: emplear el entorno Genesis/UR5e y los checkpoints como ejemplo reproducible de SAC con estado privilegiado solo en entrenamiento.
- Análisis de fallos y robustez: inspeccionar el informe técnico y los checkpoints para estudiar estancamientos por contacto y el papel del presupuesto de exploración.
- No debe usarse en producción física sin validación independiente de seguridad, calibración, colisiones y límites de fuerza.

## Benchmarks y rendimiento

Evaluación determinista con semilla 30000 y episodios de 180 pasos, sin uso del profesor con estado privilegiado:

| Evaluación | Éxito |
|---|---:|
| Reset aleatorizado normal | 96,0% (192/200) |
| Recuperación de contacto preparada | 93,5% (187/200) |

En la evaluación de recuperación, las tasas de elevación comandada, elevación física y liberación de contacto fueron del 100%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 1,6 GB y el encoder es ResNet-18 con dos entradas RGB de 224×224, por lo que la inferencia es ligera y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor; por tamaño de encoder, una RTX 4090 o superior es suficiente, y GPUs de gama media con suficiente VRAM deberían bastar para inferencia.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint y el encoder ResNet-18; no hay cifras oficiales de VRAM.
- Opciones de despliegue: PyTorch 2.13.0+cu130 con Torchvision 0.28.0+cu130, Genesis 1.4.3 y Gymnasium 1.3.0; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas de la misma categoría (políticas SAC visuales para peg-in-hole en UR5e).

## Limitaciones y advertencias

- Artefactos de investigación proporcionados tal cual, sin garantías.
- Validados únicamente en simulación; no deben desplegarse en hardware físico sin validación independiente de seguridad, calibración, colisiones y límites de fuerza.
- Licencia "other": no se concede licencia para activos de terceros; Genesis, los assets del UR5e y otras dependencias conservan sus propias licencias.
- Riesgo de sobreajuste al entorno Genesis 1.4.3 y a la configuración exacta de cámaras y propiocepción; no se documenta transferencia a otros simuladores o robots.
- Sin datos sobre sesgos, alucinación o cobertura idiomática, al no ser un modelo de lenguaje.
- El profesor con estado privilegiado no debe usarse en evaluación; su uso indebido invalidaría los resultados publicados.
- No hay métricas de latencia, throughput ni consumo energético publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/crane-1/genesis-ur5e-peg-in-hole-vision-sac
- Informe técnico en chino: `TECHNICAL_REPORT_ZH.md` (incluido en el repositorio del modelo)
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
