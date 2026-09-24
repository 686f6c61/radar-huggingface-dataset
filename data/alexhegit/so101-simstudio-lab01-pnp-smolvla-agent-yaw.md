# alexhegit/so101-simstudio-lab01-pnp-smolvla-agent-yaw

## Resumen

Este repositorio contiene un checkpoint de política robótica de tipo VLA (Vision-Language-Action) publicado por el usuario `alexhegit` bajo el identificador `so101-simstudio-lab01-pnp-smolvla-agent-yaw`. Se trata de un fine-tuning de `lerobot/smolvla_base` sobre demostraciones expertas de pick-and-place recogidas y validadas con SO-101 SimStudio, una herramienta de simulación MuJoCo y teleoperación con leader arm. El modelo resuelve una única tarea de manipulación sobre el brazo SO-101: generar acciones continuas a partir de tres vistas de cámara, el estado del robot y una instrucción en lenguaje natural.

Técnicamente es un modelo denso de 450.046.176 parámetros (0,9 GB de repositorio, coherente con pesos en 16 bits) que hereda la arquitectura de SmolVLA: un backbone de visión-lenguaje SmolVLM-2 más un experto de acciones entrenado con flow matching. La ficha del autor documenta la receta de entrenamiento completa en una AMD Instinct MI300X (batch 64, 50 000 pasos, ~3,2 M de actualizaciones de muestra, pérdida final de entrenamiento 0,018, ~7 h 45 min de cómputo y unos 26 GB de 192 GB de HBM).

Su relevancia es fundamentalmente metodológica: es un ejemplo reproducible de extremo a extremo (teleoperación → dataset → entrenamiento → evaluación sim2sim en MuJoCo) sobre un VLA de tamaño contenido, que puede ejecutarse en hardware de consumo. Ahora bien, no es un modelo de propósito general: no hay benchmarks publicados, la model card describe una sola tarea y el repositorio no tenía descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action): backbone VLM SmolVLM-2 + experto de acciones con flow matching (segun el modelo base) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors; no se documentan recetas de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, PyTorch) |
| Pipeline / tarea | `robotics` — politica de control pick-and-place |
| Robot objetivo | SO-101 |
| Entradas | 3 camaras RGB (`camera_top`, `camera_front`, `camera_wrist`, mapeadas a `camera1`, `camera2`, `camera3`), estado del robot e instruccion en lenguaje natural |
| Salidas | acciones continuas de control |
| Dataset de entrenamiento | `alexhegit/so101-simstudio-lab01-pnp` |
| Modelo base | `lerobot/smolvla_base` |
| Hardware de entrenamiento documentado | AMD Instinct MI300X (batch 64, 50 000 pasos, 26 GB de 192 GB HBM, ~7 h 45 min) |

## Arquitectura y entrenamiento

El checkpoint parte de `lerobot/smolvla_base`, un VLA de aproximadamente 450 M de parámetros que combina un modelo de visión-lenguaje preentrenado (SmolVLM-2) con un experto de acciones que genera trayectorias continuas mediante flow matching. La política consume tres flujos de imagen simultáneos más el estado propioceptivo y produce acciones de control; la model card indica explícitamente el mapeo entre las claves de cámara del dataset (`camera_top`, `camera_front`, `camera_wrist`) y las entradas de SmolVLA (`camera1`, `camera2`, `camera3`), con un `rename_map` documentado en la Lab 01.

El entrenamiento es un fine-tuning supervisado sobre demostraciones expertas (imitación), no un ajuste por preferencias: la información disponible no menciona RLHF ni DPO. Los datos se recolectaron con teleoperación de leader arm y validación en MuJoCo dentro de SO-101 SimStudio. La revisión publicada corresponde a la ejecución en MI300X: batch 64, 50 000 pasos, ~3,2 M de actualizaciones de muestra y pérdida final de entrenamiento de 0,018, con un tiempo de pared de ~7 h 45 min. El autor distingue este checkpoint de una programación más corta para iGPU Strix Halo / 8060S (batch 4, 7500 pasos), que no es la que se distribuye aquí. No se documentan innovaciones técnicas adicionales propias (decodificación especulativa, atención lineal ni similares) más allá de las del modelo base.

## Capacidades

- Generación de acciones motoras para una tarea de pick-and-place sobre el brazo SO-101, en bucle cerrado y a partir de observaciones visuales.
- Fusión de tres vistas de cámara (superior, frontal y de muñeca) con el estado del robot y una instrucción textual de tarea.
- Política condicionada por lenguaje: la instrucción en lenguaje natural forma parte de la entrada del modelo, lo que en principio permite definir variantes de la misma tarea sin reentrenar.
- Evaluación sim2sim en MuJoCo mediante los ficheros `rollout_smolvla*.yaml` del repositorio SimStudio.
- Base para nuevo fine-tuning con LeRobot sobre tareas adicionales o entornos propios, al ser un checkpoint derivado de `smolvla_base`.
- Ejecución en hardware modesto: el tamaño (450 M de parámetros, 0,9 GB) permite inferencia en GPU de consumo e incluso iGPU según la documentación de Lab 01.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales, razonamiento multi-paso textual ni generación de código.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión general de propósito abierto, audio): no disponibles; la visión está limitada a las tres cámaras del setup SO-101.

## Casos de uso

- Manipulación pick-and-place en simulación: es el caso de uso directo del checkpoint; se carga con `SmolVLAPolicy.from_pretrained` y se evalúa en MuJoCo con las configuraciones de rollout de Lab 01, sin necesidad de hardware físico.
- Generación de datos de imitación: el pipeline de SO-101 SimStudio permite grabar demostraciones con teleoperación de leader arm y usarlas para entrenar políticas propias; este checkpoint sirve como referencia de formato, mapeo de cámaras y receta de entrenamiento.
- Transferencia sim2real a un SO-101 físico: el modelo puede desplegarse como política de control en el brazo real, aunque el autor no documenta resultados de sim2real y el gap de dominio es el riesgo principal.
- Investigación en VLA con recursos limitados: con 450 M de parámetros y licencia Apache-2.0, es una base asequible para experimentos de ablation (número de cámaras, frecuencia de control, tamaño del dataset) sin depender de modelos de 3-7 B.
- Docencia y formación en robótica: la Lab 01 documenta el ciclo completo grabar → entrenar → evaluar, lo que lo hace utilizable como material práctico en cursos de aprendizaje por imitación.
- Preentrenamiento de tareas nuevas por fine-tuning: al derivar de `smolvla_base`, se puede continuar el entrenamiento sobre otros objetos, posiciones o tareas manteniendo el backbone VLM congelado o parcialmente ajustado.
- Reproducción de recetas de entrenamiento en HPC: la model card publica la configuración exacta (batch, pasos, memoria, tiempo) para replicar el entrenamiento en aceleradores AMD Instinct MI300X.
- Validación de pipelines de evaluación sim2sim: útil como política de referencia para comprobar que un entorno MuJoCo, sus configuraciones de rollout y las observaciones de cámara están correctamente definidos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni tasas de éxito de la tarea en simulación o en el robot real).

Los únicos datos cuantitativos publicados corresponden al entrenamiento:

| Metrica | Valor |
|---|---|
| Batch size | 64 |
| Pasos de entrenamiento | 50 000 |
| Actualizaciones de muestra | ~3,2 M |
| Perdida final de entrenamiento | 0,018 |
| Memoria HBM utilizada | ~26 GB de 192 GB |
| Hardware | AMD Instinct MI300X (DORobot) |
| Tiempo de pared | ~7 h 45 min |
| Plan alternativo (iGPU Strix Halo / 8060S) | batch 4, 7500 pasos (no es este checkpoint) |

Advertencia: la pérdida de entrenamiento no es una métrica de éxito de la tarea; no se aporta tasa de éxito en evaluación.

## Requisitos de hardware

- VRAM para inferencia: el repositorio ocupa 0,9 GB, coherente con pesos en 16 bits para 450 M de parámetros. Estimación propia (no publicada por el autor): en torno a 2-4 GB de VRAM en bf16/fp16 con batch 1 y tres cámaras, incluyendo activaciones del codificador visual; en fp32 se situaría aproximadamente entre 4 y 6 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM. En el extremo alto, A100/H100/MI300X para entrenamiento o evaluación por lotes; en el extremo de consumo, RTX 3060/4060/4070/4090.
- Cabe en GPU de consumo: sí, con margen amplio en modelos de 8 GB o superiores. La documentación de Lab 01 menciona además un plan de entrenamiento en iGPU Strix Halo / 8060S con batch 4 y 7500 pasos, lo que indica viabilidad en hardware integrado.
- Memoria en entrenamiento: la ejecución de referencia consumió ~26 GB de HBM con batch 64; un fine-tuning con lotes menores y acumulación de gradiente debería caber en GPU de 16-24 GB.
- Opciones de despliegue: `lerobot` (clase `SmolVLAPolicy` sobre PyTorch) es la vía documentada. La evaluación se realiza en MuJoCo con las configuraciones `rollout_smolvla*.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF disponibles.
- Latencia y throughput: no disponible. La viabilidad de control en tiempo real depende de la frecuencia de control exigida por la tarea y del hardware, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `alexhegit/so101-simstudio-lab01-pnp-smolvla-agent-yaw` | 450 M | no disponible | Apache-2.0 | HuggingFace (libreria `lerobot`) | Fine-tuning de tarea unica sobre SO-101; pesos safetensors |
| `lerobot/smolvla_base` | ~450 M | no disponible | Apache-2.0 | HuggingFace | Modelo base generalista del que deriva este checkpoint; entrenado con datasets comunitarios |
| OpenVLA | ~7 B | no disponible | licencia propia derivada de Llama 2 (uso comercial sujeto a condiciones) | HuggingFace / repositorio publico | VLA de referencia de mayor tamano; requiere hardware notablemente superior |
| pi0 (proyecto openpi) | ~3,3 B (segun informacion publica del proyecto) | no disponible | Apache-2.0 | Repositorio openpi | VLA con flow matching de mayor escala, orientado a tareas de manipulacion diversas |

La comparación cuantitativa de rendimiento no es posible con la información disponible: este checkpoint no publica tasas de éxito ni métricas comparables, y los modelos alternativos se evalúan en setups robóticos distintos. La ventaja principal de este modelo frente a OpenVLA o pi0 es el coste de ejecución (450 M frente a 3,3-7 B de parámetros) y la licencia permisiva; su desventaja es la especialización en una sola tarea y la ausencia de validación publicada.

## Limitaciones y advertencias

- Modelo de tarea única: es un fine-tuning para pick-and-place en el setup SO-101 Lab 01; no es un VLA de propósito general ni un modelo de lenguaje utilizable de forma conversacional.
- Sin benchmarks ni tasas de éxito: no hay evidencia publicada de rendimiento en simulación ni en el robot real, más allá de la pérdida de entrenamiento (0,018).
- Riesgo de gap sim2real: las demostraciones se recogen y validan en MuJoCo; el comportamiento en un SO-101 físico puede degradarse por diferencias de dinámica, calibración, iluminación y texturas.
- Dependencia estricta del setup de sensores: requiere tres cámaras con la disposición y el mapeo documentados (`camera_top`, `camera_front`, `camera_wrist`); cambios en número, posición o resolución pueden invalidar la política.
- Sobreajuste al entorno de laboratorio: al entrenarse sobre un dataset concreto de posiciones, objetos y condiciones, se espera poca generalización a objetos o escenas no vistas.
- Sesgos: no disponibles, pero deben asumirse los del dataset de demostraciones (posiciones, objetos y estilo de teleoperación del operador) y los del backbone VLM heredado.
- Alucinación: no aplica en el sentido textual, pero existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- Idiomas: no se documenta soporte multilingüe ni el idioma de las instrucciones empleadas en las demostraciones.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial sin restricciones adicionales por parte del autor. No obstante, la licencia del dataset `alexhegit/so101-simstudio-lab01-pnp` y las condiciones del modelo base deben verificarse por separado; no están disponibles en la información proporcionada.
- Madurez: repositorio con 0 descargas y 0 valoraciones en el momento de la consulta, creado y actualizado el 24 de septiembre de 2026; no hay evidencia de uso en producción.
- El sufijo `agent-yaw` del identificador no se explica en la model card; se desconoce qué variante o configuración concreta representa respecto a otros checkpoints del mismo autor.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos optimizados para inferencia en CPU, lo que limita el despliegue fuera de entornos PyTorch/LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-smolvla-agent-yaw
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp
- Repositorio SO-101 SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Walkthrough Lab 01 (grabar → entrenar → evaluar): https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md
- Configuraciones de rollout SmolVLA: `labs/lab01_pnp/configs/rollout_smolvla*.yaml` dentro del repositorio anterior
