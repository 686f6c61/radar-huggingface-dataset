# RevanthGundala/omx-act-sponge-bowl

## Resumen

El modelo `RevanthGundala/omx-act-sponge-bowl` es una política robótica basada en la arquitectura ACT (Action Chunking with Transformers) entrenada para ejecutar la tarea de colocar una esponja en un cuenco con un brazo robótico OMX de 6 grados de libertad. Ha sido desarrollado por RevanthGundala utilizando el ecosistema LeRobot y exportado en el paso de entrenamiento 80.000. El modelo predice 30 objetivos articulares absolutos por fragmento de acción (chunk), operando a una frecuencia de control de 30 Hz con entrada visual de dos cámaras (muñeca y superior).

Este modelo es relevante porque demuestra el fine-tuning de políticas ACT sobre conjuntos de datos de demostración reducidos (50 episodios) en un escenario físico real, integrando además un pipeline de evaluación desplegado (ResFiT) con normalización de datos y posprocesamiento. Su tamaño moderado (52,4 millones de parámetros) y su formato safetensors lo hacen accesible para entornos de investigación y prototipado robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - encoder-decoder transformer para control robótico |
| Parametros totales | 52.368.518 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (predice 30 objetivos articulares por chunk) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una variante personalizada de ACT, denominada `custom_act`, que combina un codificador visual con un decodificador transformer para generar secuencias de acciones articulares. La entrada consiste en imágenes de dos cámaras (muñeca y superior) con resolución 3×480×640, y la salida es un chunk de 30 posiciones articulares absolutas para las seis articulaciones del brazo (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper). El entrenamiento se realizó mediante clonación de comportamiento sobre 50 episodios de demostración teleoperada del dataset `RevanthGundala/014-place-sponge-in-bowl-diverse-50`, sin indicios de fases de RLHF o DPO. El modelo fue exportado en el paso 80.000 y requiere los archivos de preprocesador y posprocesador guardados junto a los pesos para reproducir la normalización exacta del entrenamiento.

## Capacidades

- Control robótico de 6 grados de libertad (5 articulaciones + pinza) para tareas de manipulación.
- Predicción de acciones por chunk (30 pasos) que permite movimientos suaves y coordinados.
- Percepción visual multimodal con dos cámaras (muñeca y superior) para guiar la manipulación.
- Ejecución en tiempo real a 30 Hz, adecuada para control reactivo de robots.
- Integración con el pipeline de evaluación ResFiT que incluye suavizado de acciones, límites de delta articular y agregación conservadora de chunks.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de ensamblaje: el modelo puede transferir objetos pequeños (como una esponja) desde una superficie a un contenedor, con precisión submilimétrica gracias a su chunk de 30 acciones.
- Prototipado rápido de políticas robóticas: al entrenarse con solo 50 episodios, es viable replicar el flujo para nuevas tareas con pocas horas de teleoperación.
- Investigación en aprendizaje por imitación: sirve como base para estudiar la generalización de ACT con datasets pequeños y variados (se mencionan datasets hermanos con DAGGER).
- Evaluación de arquitecturas de control en hardware real: el evaluador desplegado permite probar el modelo en el brazo OMX con un comando único, facilitando benchmarks reproducibles.
- Integración en sistemas de robótica educativa: al ser un modelo pequeño y ejecutable en MPS (Apple Silicon), puede desplegarse en estaciones de trabajo sin GPUs dedicadas.
- Generación de datos sintéticos para entrenamiento: el modelo puede usarse como política experta para recopilar nuevas demostraciones o aplicar técnicas de DAGGER.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta únicamente con su especificación funcional y no incluye métricas de éxito de tarea, tasas de error o comparativas cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 52 millones de parámetros en precisión float32 (~210 MB) cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte PyTorch (NVIDIA, AMD, Apple Silicon). El comando de evaluación incluido usa `--policy-device mps`, indicando soporte para Apple Silicon.
- Compatibilidad con GPU consumer: sí, incluyendo RTX 3060, RTX 4090, etc. También ejecutable en CPU (aunque a menor velocidad).
- Opciones de despliegue: el repositorio `omx-act-recap` proporciona un evaluador específico; no se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a robótica). Se puede usar el framework LeRobot para cargar el modelo.
- Latencia y throughput estimados: a 30 Hz de control, el modelo debe inferir cada 33 ms. Con un chunk de 30 acciones, la inferencia se realiza cada segundo aproximadamente, dejando margen para el procesamiento visual.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo es una implementación personalizada de ACT sobre LeRobot, y su principal referencia es el ACT estándar del repositorio LeRobot. Se puede destacar que, a diferencia de políticas generalistas, este modelo está especializado en una única tarea y no ofrece comparación con alternativas de la misma categoría en los datos disponibles.

## Limitaciones y advertencias

- Tarea específica: el modelo solo ejecuta la tarea de colocar una esponja en un cuenco; no generaliza a otras tareas sin reentrenamiento.
- Dataset reducido: entrenado con 50 episodios, lo que limita la robustez ante variaciones de iluminación, posición inicial o textura del objeto.
- Sesgos de demostración: la política imita los comportamientos del teleoperador, pudiendo heredar sus sesgos o errores sistemáticos.
- Riesgo de alucinación motora: en situaciones fuera de distribución, el modelo puede generar comandos articulares inválidos o peligrosos; el evaluador incluye límites de delta articular (`--max-joint-delta 40`) como mitigación.
- Restricciones de licencia: la licencia no está disponible, por lo que el uso comercial no está claramente permitido.
- Requisitos de integración: para reproducir el comportamiento exacto es necesario usar los archivos de preprocesador y posprocesador y el código fijado en el repositorio `omx-act-recap`; cargar solo `model.safetensors` no es equivalente.
- Seguridad: la ejecución en hardware real puede mover el robot; se deben verificar puertos, mapeo de cámaras, postura inicial y procedimiento de parada de emergencia antes de la evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RevanthGundala/omx-act-sponge-bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/RevanthGundala/014-place-sponge-in-bowl-diverse-50
- Repositorio de código (evaluador y arquitectura): https://github.com/RevanthGundala/omx-act-recap
- Repositorio de entrenamiento: https://github.com/RevanthGundala/omx-training
- Dataset relacionado (DAGGER): https://huggingface.co/datasets/RevanthGundala/017-place-sponge-in-bowl-custom-act-dagger18-trimmed
