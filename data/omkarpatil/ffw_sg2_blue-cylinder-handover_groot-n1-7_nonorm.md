# omkarpatil/ffw_sg2_blue-cylinder-handover_groot-n1.7_nonorm

## Resumen

El modelo `omkarpatil/ffw_sg2_blue-cylinder-handover_groot-n1.7_nonorm` es un fine-tuning del modelo vision-language-action (VLA) NVIDIA GR00T N1.7-3B, desarrollado por Omkar Patil (PhD en ASU) dentro del ecosistema Isaac-GR00T. Está especializado en la tarea de recoger un cilindro azul mediante un robot bimanual con dos brazos, utilizando una política de difusión (flow matching) sobre objetivos articulares absolutos. El ajuste se realizó sobre el fork `cyclo_intelligence` de Isaac-GR00T, con el proyector y la cabeza de difusión entrenados mientras los pesos base permanecían congelados en bf16.

El modelo resuelve un problema concreto de manipulación robótica: aprender una política de control de bajo nivel a partir de 11 demostraciones teleoperadas. Su relevancia radica en la aplicación de la técnica de normalización de identidad ("no-norm"), que opera directamente en radianes brutos de las articulaciones sin recorte de outliers, lo que facilita la composición en el espacio de puntuaciones. El checkpoint es el número 20000, con un tamaño de repositorio de 9,5 GB en formato safetensors. No se dispone de información sobre el número total de parámetros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en NVIDIA GR00T N1.7-3B con proyector y cabeza de difusion (flow matching) |
| Parametros totales | no disponible (modelo base: 3B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (bf16) |
| Idiomas soportados | no disponible (instruccion en ingles: "Pick up the blue cylinder") |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T N1.7-3B, un VLA de codigo abierto para habilidades robotizadas generales. En este fine-tuning, se entrena únicamente el proyector multimodal y la cabeza de difusión (diffusion head), mientras que los pesos del modelo base permanecen congelados en bf16. El entrenamiento se realizó sobre 11 demostraciones teleoperadas del dataset `omkarpatil/blue-cylinder-handover` (LeRobot v2.1 a 15 fps), con un tamaño de lote global de 32, tasa de aprendizaje 1e-4 con programación coseno y aumento de datos por jitter de color.

La innovación principal es la normalización de identidad ("no-norm"): las estadísticas del dataset se fijan con media 0 y desviación estándar 1 para cada grupo de estado/acción, y se desactiva el recorte de outliers (`clip_outliers=false`). De este modo, el flujo de coincidencia (flow matching) opera directamente en radianes brutos de las articulaciones, lo que permite una composición más natural en el espacio de puntuaciones. Toda la configuración queda serializada en `processor_config.json` y `statistics.json`, y el modelo se ejecuta tal cual en el contenedor GR00T de cyclo_intelligence.

## Capacidades

- Manipulación bimanual: controla dos brazos de 8 grados de libertad cada uno, más cabeza (2), elevación (1) y odometría (3), totalizando un estado de 22 dimensiones.
- Generación de acciones de bajo nivel: produce objetivos articulares absolutos (16 dimensiones) con un horizonte de 16 pasos a 15 Hz.
- Percepción multimodal: utiliza tres cámaras RGB (izquierda de cabeza, muñeca izquierda y muñeca derecha) a resolución 224×224.
- Ejecución de tareas específicas: entrenado para la tarea "Pick up the blue cylinder" (recoger un cilindro azul).
- Política basada en difusión: emplea flow matching para generar trayectorias suaves y coherentes.
- Composición en espacio de puntuaciones: gracias a la normalización no-norm, puede combinarse con otros módulos en el mismo espacio de representación.

## Casos de uso

- Automatización de picking en entornos industriales: el modelo puede integrarse en una celda robótica para recoger objetos cilíndricos de una superficie, reduciendo el tiempo de ciclo en líneas de montaje. Su política de difusión genera movimientos suaves que minimizan vibraciones.
- Investigación en aprendizaje por demostración: sirve como banco de pruebas para estudiar el efecto de la normalización de identidad en políticas VLA, comparando con versiones con normalización estándar.
- Desarrollo de robots bimanuales en laboratorio: permite validar controladores de bajo nivel para brazos duales con cámaras en muñeca, útil en entornos académicos con presupuesto limitado.
- Composición de habilidades: al operar en radianes brutos sin recorte, puede combinarse con otros módulos de control en un sistema modular de robótica, facilitando la reutilización de subpolíticas.
- Teleoperación asistida: el modelo puede usarse como política de respaldo en sistemas de teleoperación, generando acciones cuando el operador no interviene o para suavizar comandos manuales.
- Evaluación de VLA en tareas de manipulación fina: con solo 11 demostraciones, demuestra la viabilidad de fine-tuning con pocos datos, lo que es relevante para empresas que necesitan adaptar modelos a tareas específicas sin grandes datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otras métricas estándar, ya que se trata de un modelo de robótica especializado y no de lenguaje general. La evaluación se limita a la tarea concreta de recoger el cilindro azul, y no se proporcionan métricas de éxito ni tasas de error.

## Requisitos de hardware

- El repositorio pesa 9,5 GB en safetensors (bf16), lo que sugiere que el checkpoint completo requiere al menos 9,5 GB de VRAM para cargar los pesos en memoria.
- No se especifican requisitos oficiales de GPU. Dado que el modelo base tiene 3B parámetros, es probable que quepa en GPUs consumer con 12 GB o más de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090), pero no hay confirmación oficial.
- Para inferencia en tiempo real (15 Hz) con tres cámaras, se recomienda una GPU de gama alta como RTX 3090/4090 o una A100 si se necesita baja latencia.
- Opciones de despliegue: el modelo se ejecuta dentro del contenedor GR00T de cyclo_intelligence, que incluye el entorno Isaac-GR00T. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje sino un VLA.
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ffw_sg2_blue-cylinder-handover_groot-n1.7_nonorm | GR00T N1.7-3B | 3B (base) | Recoger cilindro azul | other | HuggingFace |
| ffw_sg2_blue-cylinder-handover_smolvla_nonorm | SmolVLA | no disponible | Recoger cilindro azul | no disponible | HuggingFace (mismo autor) |
| NVIDIA GR00T N1.7-3B | - | 3B | Habilidades generales de manipulacion | NVIDIA Open Model License | GitHub/HuggingFace |

La comparativa se limita a modelos del mismo autor y al modelo base. No hay datos de rendimiento comparativo disponibles. El fine-tuning sobre GR00T N1.7-3B se distingue por su normalización no-norm, mientras que la versión con SmolVLA (también del mismo autor) explora la misma técnica sobre una arquitectura diferente.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para una tarea concreta (recoger un cilindro azul) y no generaliza a otros objetos o escenarios sin reentrenamiento.
- Datos limitados: solo 11 demostraciones, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición o textura del objeto.
- Sin soporte de lenguaje natural general: aunque el modelo base es VLA, este fine-tuning no expone capacidades conversacionales ni de razonamiento general.
- Licencia "other": no se especifica la licencia exacta, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa del rendimiento del modelo en la tarea.
- Dependencia del entorno cyclo_intelligence: el modelo requiere el contenedor específico de GR00T para ejecutarse, lo que limita la portabilidad a otros stacks robóticos.
- Riesgo de alucinación en acciones: como toda política basada en difusión, puede generar acciones no válidas si las condiciones de entrada difieren mucho del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/ffw_sg2_blue-cylinder-handover_groot-n1.7_nonorm
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio GR00T Whole-Body Control: https://github.com/NVlabs/GR00T-WholeBodyControl
- Página personal del autor: https://omkarpatil18.github.io/
