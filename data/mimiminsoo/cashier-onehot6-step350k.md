# mimiminsoo/cashier-onehot6-step350k

## Resumen

`cashier-onehot6-step350k` es una política de difusión (diffusion policy) para robótica manipulativa entrenada con LeRobot, publicada por el usuario `mimiminsoo` como parte de un proyecto capstone (MoAI 2026). El modelo controla un sistema robótico compuesto por dos brazos PiPER con pinzas, un cuello de 2 grados de libertad y tres cámaras, y resuelve de forma unificada una tarea completa de caja: recogida de producto, escaneo de código de barras, colocación y empaquetado. A diferencia de aproximaciones con varios modelos encadenados, integra las seis etapas de la tarea en una sola política mediante una codificación one-hot de la etapa en el vector de estado.

El checkpoint corresponde al paso 350.000, resultado de continuar durante 150.000 pasos adicionales el entrenamiento de `mimiminsoo/cashier-onehot6` (que se detuvo en el paso 200.000) dentro de la misma sesión, con un nuevo ciclo de decaimiento coseno del learning rate. El repositorio ocupa 4,4 GB e incluye los pesos EMA dentro de `training_state.pt`.

Es relevante por su enfoque de condicionamiento por etapa: en lugar de entrenar políticas separadas para cada fase, el estado de 22 dimensiones incluye un one-hot de 6 posiciones que indica al modelo en qué etapa está, lo que permite un único modelo para toda la secuencia. La model card advierte que la cadena de evaluación de la rama `release` (que espera un modelo de estado 19 más un modelo de empaquetado) no es directamente compatible con este checkpoint de estado 22.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; horizonte de observación 2, predicción 16, acción 8, a 10 Hz |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `training_state.pt` (checkpoint PyTorch con pesos EMA) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy implementada en LeRobot: un modelo generativo que produce trayectorias de acción denoising a partir de observaciones, en lugar de un transformer autoregresivo de lenguaje. El espacio de estado es de 22 dimensiones (16 del robot más 6 del one-hot de etapa), y el de acción de 16 dimensiones (6 del brazo izquierdo más pinza, 6 del brazo derecho más pinza, y pitch/yaw del cuello). Las observaciones visuales provienen de tres cámaras (`left_main`, `left_wrist`, `right_wrist`) a resolución [240, 320].

El entrenamiento se realizó sobre el dataset `onehot6_1123`, con 808 episodios y 298.045 fotogramas. Se ejecutaron 350.000 pasos con batch 64 (32 por GPU en 2 GPUs con DDP) y `normalize_range_eps` de 0,0001. El régimen de learning rate consistió en un primer ciclo coseno hasta el paso 200.000 y, tras reanudar, un nuevo ciclo coseno que parte de aproximadamente 3,9e-5 y decae hasta 0. Las etiquetas de etapa se derivaron de las transiciones reales del dataset (por ejemplo, pick→scan se marca en la primera liberación de la pinza izquierda antes del escaneo con J1 < 15 grados; scan→place en el primer código de barras registrado), y los 292 episodios `scan_stage0` son solo de recogida, truncados en la primera transición.

## Capacidades

- Control robótico de manipulación bimanual: genera comandos de 16 dimensiones para dos brazos PiPER con pinzas y un cuello de 2 grados de libertad.
- Ejecución unificada de una tarea de caja en seis etapas: `stage_pick`, `stage_scan`, `stage_place`, `stage_pack_fetch`, `stage_pack_put` y `stage_pack_move`.
- Condicionamiento por etapa mediante one-hot de 6 posiciones inyectado en el estado, lo que permite a una sola política cambiar de comportamiento según la fase.
- Percepción multimodal con tres cámaras (vista principal izquierda y muñecas izquierda y derecha) a 240x320.
- Generación de trayectorias de acción con horizonte de predicción 16 y horizonte de acción 8 a 10 Hz.
- No dispone de tool calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es exclusivamente una política de control motor.

## Casos de uso

- Automatización de línea de caja y empaquetado: el modelo ejecuta de forma continua la secuencia recoger–escanear–colocar–empaquetar sobre una estación con dos brazos, usando el one-hot de etapa para alternar entre fases sin cambiar de modelo.
- Prototipado de políticas unificadas frente a cadenas de modelos: sirve como referencia para evaluar si una sola política condicionada por etapa iguala o supera a la combinación de un modelo de código de barras y otro de empaquetado.
- Investigación en condicionamiento por estado discreto: el diseño one-hot de 6 permite estudiar cómo afecta la representación de la etapa a la estabilidad del entrenamiento y a las transiciones entre fases.
- Reentrenamiento y ajuste fino sobre datos propios: al estar en LeRobot y con licencia Apache 2.0, puede reentrenarse con nuevos episodios manteniendo el mismo esquema de estado (22) y acción (16).
- Evaluación de robustez bimanual con cuello activo: útil para medir el rendimiento de una política de difusión cuando debe coordinar dos brazos y orientar la cabeza hacia el código de barras.
- Reproducción de experimentos de escalado de pasos: el checkpoint en el paso 350.000, continuación del de 200.000, permite comparar curvas de aprendizaje y estabilidad al extender el entrenamiento con un nuevo ciclo coseno.
- Docencia y demostraciones de robótica con LeRobot: como ejemplo completo de pipeline de descarga, carga y evaluación de una política de difusión con múltiples cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint de entrenamiento ocupa 4,4 GB, pero el tamaño del modelo en inferencia no se especifica.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 2 GPUs en DDP (batch 32 por GPU), sin que se indique el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada; la model card no aporta datos de VRAM ni de modelo de GPU.
- Opciones de despliegue: LeRobot, mediante `pipeline/download_model.py` y los scripts de `eval/run_chain.sh`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de robótica).
- Latencia y throughput: no disponibles; la política opera a 10 Hz según la configuración de horizontes.

## Comparativa con modelos similares

| Modelo | Tipo | Estado / acción | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cashier-onehot6-step350k | Diffusion policy (LeRobot) | 22 / 16 | 3 | Apache 2.0 | Hugging Face |
| cashier-onehot6 | Diffusion policy (LeRobot) | 22 / 16 | 3 | no disponible en la información | Hugging Face (paso 200.000) |
| cashier-barcode-onehot3 | Política de código de barras (LeRobot) | 19 (según cadena de evaluación) | no disponible | no disponible en la información | Hugging Face (origen de `start_pose/`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cadena de evaluación de la rama `release` (`eval/run_chain.sh`) espera un modelo de estado 19 más un modelo de empaquetado y se detiene en su comprobación inicial con este checkpoint de estado 22; requiere una cadena de una sola política con entrada de etapa one-hot de 6, que aún no está en `release`.
- El modelo está especializado en una tarea y un montaje concretos (dos brazos PiPER, cuello de 2 grados de libertad, tres cámaras); no es generalizable a otras morfologías sin reentrenamiento.
- Depende de la definición exacta de las seis etapas y de sus reglas de transición derivadas del dataset; cambios en la lógica de etiquetado alteran el significado del one-hot.
- Los 292 episodios `scan_stage0` son solo de recogida y están truncados en la primera transición, lo que puede sesgar el comportamiento en esas fases.
- No se documentan sesgos, tasas de alucinación ni comportamiento en producción; al ser un modelo de control motor, los riesgos se refieren a fallos de manipulación y seguridad física, no a generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero no se aportan garantías ni datos de validación en entornos reales.
- No hay información sobre cuantizaciones, latencia real ni requisitos de VRAM, lo que dificulta planificar un despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/mimiminsoo/cashier-onehot6-step350k
- Modelo predecesor (paso 200.000): https://huggingface.co/mimiminsoo/cashier-onehot6
- Modelo de código de barras (origen de `start_pose/`): https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
