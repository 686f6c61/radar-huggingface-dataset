# Snare314/VLA-Fabric-pi05-Frame4

## Resumen

VLA-Fabric es un modelo de visión-lenguaje-acción (VLA) orientado al control robótico de cuatro brazos, desarrollado por el laboratorio Nebulis Lab (cuenta de Hugging Face Snare314). Este repositorio concreto, Frame4, contiene el checkpoint completo del escenario "Frame-over-Peg", una tarea de manipulación cooperativa en la que varios brazos robóticos deben encajar una pieza sobre una estructura tipo marco. El modelo reporta 194 aciertos sobre 200 episodios (97,0 % de éxito) en las semillas 5300-5499.

El checkpoint se construye sobre los pesos base de pi0.5, que deben instalarse por separado, y se organiza en cuatro shards de rol, uno por brazo, gestionados por el código de evaluación de VLA-Fabric. La etapa declarada es `pi05_frame4_full_direct`, lo que indica que cada brazo ejecuta una política completa restaurada de forma independiente. El repositorio ocupa 37,0 GB, coherente con un modelo de varios miles de millones de parámetros almacenado en precisión completa.

La relevancia de este artefacto es acotada pero específica: no es un modelo de propósito general, sino un checkpoint de investigación reproducible para experimentos de manipulación multi-brazo. La información pública disponible es escasa (sin licencia declarada, sin idiomas, sin pipeline en Hugging Face), por lo que esta ficha se limita a lo verificable en la model card y en los enlaces citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de pi0.5 (transformer visión-lenguaje-acción con flow matching); detalles internos no disponibles |
| Parametros totales | no disponible (los pesos base de pi0.5 se distribuyen por separado) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 37,0 GB con directorio `checkpoint/`, `normalization.npz` y `release_config.json`) |

## Arquitectura y entrenamiento

El modelo se presenta como una política VLA construida sobre pi0.5, un modelo que combina un codificador visual, un backbone lingüístico y un cabezal de acciones entrenado con flow matching. La generación de acciones emplea diez pasos de flujo por predicción, con un horizonte de predicción de 50 pasos y un horizonte de ejecución de 25, lo que implica que cada plan se recalcula aproximadamente cada 25 acciones ejecutadas. La etapa `pi05_frame4_full_direct` restaura una política completa por brazo a partir de cuatro shards de rol.

El pipeline de entrada es explícito: la cámara global se renderiza a 384 x 384 y cada cámara de muñeca a 192 x 192 antes del preprocesado de imagen de la política. El repositorio incluye `normalization.npz` para las estadísticas de normalización de observaciones y acciones, y `release_config.json` con la configuración de publicación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se detalla la innovación técnica más allá del esquema multi-brazo con políticas independientes por rol.

## Capacidades

- Control robótico multi-brazo: cuatro políticas independientes coordinadas para una tarea cooperativa de encaje marco-sobre-clavija.
- Percepción visual multimodal: procesa una cámara global y cámaras de muñeca por brazo con resoluciones fijas (384 x 384 y 192 x 192).
- Generación de acciones por flow matching con diez pasos de flujo y horizonte de predicción de 50.
- Ejecución por chunks: horizonte de ejecución de 25 acciones antes de recalcular la predicción.
- Condicionamiento por lenguaje: heredado de la base pi0.5 (alcance exacto no disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Investigación en manipulación multi-brazo: reproducir el resultado de 194/200 en semillas 5300-5499 sirve como línea base para comparar nuevas políticas de coordinación entre brazos.
- Benchmark de encaje preciso: la tarea frame-over-peg exige tolerancias milimétricas; el checkpoint permite medir robustez de políticas VLA en tareas de inserción.
- Evaluación de esquemas de políticas por rol: al restaurar una política completa por brazo, permite estudiar si la especialización por rol supera a una política compartida.
- Estudio de horizontes de ejecución: con horizonte de predicción 50 y ejecución 25, es un banco de pruebas para analizar el compromiso entre frecuencia de replanificación y estabilidad.
- Reproducción en clúster HPC: la guía `multiarm-hpc.md` del repositorio indica que está pensado para despliegue en infraestructura de altas prestaciones con múltiples GPUs.
- Docencia y divulgación: sirve como ejemplo didáctico de pipeline VLA completo (renderizado de cámaras, normalización, flow matching y ejecución por chunks).

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Frame-over-Peg (semillas 5300-5499) | 194/200 éxitos (97,0 %) | Checkpoint Frame4 Full, etapa `pi05_frame4_full_direct` |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo de 37,0 GB sugiere pesos en precisión completa y requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo más los pesos base de pi0.5.
- GPU recomendadas: no disponible en la información proporcionada; la guía de evaluación apunta a despliegue en HPC multi-GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: código de evaluación de VLA-Fabric (repositorio NEBULIS-Lab/VLA-Fabric) con restauración de shards por brazo; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se conoce que cada predicción usa diez pasos de flujo y que se ejecutan 25 acciones por predicción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA-Fabric-pi05-Frame4 | no disponible | no disponible | Manipulación multi-brazo (frame-over-peg) | no disponible | Checkpoint público en HF |
| pi0.5 (base) | no disponible | no disponible | VLA generalista | no disponible | Pesos base distribuidos por separado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos VLA de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado para una única tarea (frame-over-peg) y no se declara capacidad de generalización a otras tareas.
- Dependencia externa: requiere instalar por separado los pesos base de pi0.5, lo que añade complejidad de despliegue y posibles incompatibilidades de versión.
- Acoplamiento al código: solo funciona con la versión actualizada del código de evaluación de VLA-Fabric que reconoce la etapa `pi05_frame4_full_direct`.
- Resoluciones de entrada fijas: la cámara global debe renderizarse a 384 x 384 y las de muñeca a 192 x 192; desviarse de estas resoluciones puede degradar el rendimiento.
- Licencia no declarada: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue productivo.
- Sesgos y alucinación: no hay información publicada sobre sesgos; en un modelo de control robótico el riesgo relevante es la ejecución de acciones incorrectas, no la alucinación textual.
- Idiomas: no se declara soporte multilingüe.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación declarada (2026-10-16) posterior a la fecha habitual de publicación; conviene verificar la procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Snare314/VLA-Fabric-pi05-Frame4
- Paper: https://arxiv.org/abs/2610.23018
- Sitio del proyecto: https://nebulis-lab.com/VLA-Fabric/
- Código: https://github.com/NEBULIS-Lab/VLA-Fabric
- Guía de evaluación multi-brazo en HPC: https://github.com/NEBULIS-Lab/VLA-Fabric/blob/main/docs/multiarm-hpc.md
