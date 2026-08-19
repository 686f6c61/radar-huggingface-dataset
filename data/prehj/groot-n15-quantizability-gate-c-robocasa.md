# prehj/groot-n15-quantizability-gate-C-robocasa

## Resumen

El modelo `prehj/groot-n15-quantizability-gate-C-robocasa` es una política de visión-lenguaje-acción (VLA) para robótica, desarrollada por el autor prehj. Se basa en la arquitectura GR00T-N1.5 de NVIDIA y la extiende con un token adicional denominado "gate token" integrado en el modelo de difusión de flujo (flow-matching DiT). Este token predice la probabilidad de que un chunk de acciones de 16 pasos sea seguro para comprimir temporalmente mediante la técnica K2, lo que permite reducir el número de pasos de ejecución sin degradar significativamente el éxito de la tarea.

El modelo se ha afinado sobre el conjunto RoboCasa Kitchen (24 tareas, 50 episodios cada una) y presenta un rendimiento de éxito del 0.638–0.647 con una reducción media de pasos de 327 a 289 respecto al baseline sin compresión. La arquitectura completa cuenta con 2.724.110.368 parámetros (aproximadamente 2.72B), almacenados en formato safetensors, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en ofrecer un mecanismo de compresión de acciones con confianza, sin necesidad de un segundo modelo separado, lo que simplifica el despliegue en robots humanoides.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T-N1.5 (flow-matching DiT) con gate token adicional |
| Parámetros totales | 2.724.110.368 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo multimodal de visión y lenguaje, pero no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GR00T-N1.5, un modelo fundacional para robots humanoides que combina un codificador de visión y lenguaje con un generador de acciones basado en difusión (flow-matching). La innovación principal es la adición de un token de compuerta (gate token) que se inserta dentro del bloque DiT. Este token tiene una máscara de atención unidireccional: lee el flujo de acciones para estimar la probabilidad de que el chunk sea seguro para comprimir temporalmente (K2K), pero no influye en la generación de las acciones, evitando perturbaciones en la salida.

El entrenamiento se realizó mediante fine-tuning de la política completa sobre RoboCasa Kitchen, con 60k pasos y etiquetas procedentes de Cosmos3-Nano. Se utilizó un peso de pérdida λ=0.3 para la pérdida del gate. No se menciona el uso de RLHF o DPO; es un ajuste supervisado sobre un conjunto de tareas de manipulación robótica.

## Capacidades

- Generación de chunks de acciones de 16 pasos para control de robot (posición delta del efector final, rotación y estado de la pinza).
- Predicción de compresibilidad temporal: devuelve un valor `_gate_prob` en [0,1] que indica la confianza de que el chunk puede ser comprimido mediante K2 sin pérdida de rendimiento.
- Entrada multimodal: imágenes y lenguaje (según la arquitectura GR00T-N1.5), aunque no se detallan los formatos exactos.
- Integración con el framework GR00T para inferencia en tiempo real (se muestra un ejemplo con 4 pasos de denoising).
- Capacidad de operación en bucle cerrado (closed-loop) sobre tareas de manipulación en simulación RoboCasa.

## Casos de uso

- **Control de robots en tiempo real**: la política genera un chunk de 16 acciones y, si el gate predice alta confianza de compresión, se aplica K2 para reducir los pasos de ejecución, mejorando la velocidad de respuesta en tareas de manipulación.
- **Compresión temporal de acciones**: en escenarios donde la frecuencia de control es crítica, el gate permite decidir dinámicamente si un chunk puede ejecutarse en menos pasos, reduciendo el consumo de recursos computacionales.
- **Evaluación de seguridad en compresión**: el valor `_gate_prob` sirve como señal de confianza para sistemas que necesitan garantizar que la compresión no degrade la tarea.
- **Investigación en políticas VLA**: sirve como punto de partida para estudiar la co-adaptación entre la generación de acciones y la predicción de compresibilidad.
- **Aprendizaje por refuerzo sobre el gate**: el valor de confianza puede utilizarse como señal de recompensa para entrenar un cabezal RL que ajuste el umbral τ dinámicamente.
- **Integración en pipelines de robótica**: compatible con el framework GR00T, permite su incorporación en sistemas de control de robots humanoides en simulación.

## Benchmarks y rendimiento

En la model card se proporcionan resultados en bucle cerrado sobre RoboCasa (24 tareas × 50 episodios):

| Política | Éxito | Pasos medios |
|---|---|---|
| Baseline sin compresión | 0.657 | 327 |
| Naive K2 (compresión total) | 0.598 | 221 |
| **C (este modelo), τ=0.5** | **0.638–0.647** | **289** |
| A′ distilled student (gemma4 teacher), τ=0.5 | 0.667 | 258 |

El ruido del benchmark es ±1.5 puntos porcentuales. El modelo C presenta un rendimiento ligeramente inferior al estudiante destilado A′, pero ofrece una arquitectura más limpia al no requerir un segundo modelo. No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, ya que es un modelo específico de robótica.

## Requisitos de hardware

- **VRAM estimada**: con 2.72B parámetros en FP32 se requieren aproximadamente 10.9 GB de memoria; con FP16 se reduce a ~5.5 GB. No se proporcionan cuantizaciones oficiales, pero es plausible que se puedan aplicar cuantizaciones de 8 bits o 4 bits mediante herramientas de conversión.
- **GPU recomendadas**: una GPU con 8 GB o más de VRAM (p.ej., NVIDIA RTX 2080 Ti, RTX 3080, RTX 4090) puede ejecutar la inferencia en FP16. Para entrenamiento o fine-tuning se recomienda una GPU con al menos 16 GB.
- **Compatibilidad con GPU de consumo**: sí, es viable en GPU de consumo de 8-12 GB si se usa FP16 o cuantización.
- **Opciones de despliegue**: el modelo se carga mediante el fork específico de GR00T (`action-quantization-gate-v2`). No se mencionan integraciones con vLLM, llama.cpp u Ollama; es un modelo de política robótica que se ejecuta con PyTorch en el entorno GR00T.
- **Latencia y throughput**: no se proporcionan datos. Se espera una inferencia de 4 pasos de denoising (como se muestra en el ejemplo) en el orden de milisegundos en GPU moderna, pero no se puede cuantificar sin mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (RoboCasa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **C (este modelo)** | 2.72B | No disponible | Éxito 0.638–0.647, pasos 289 | Apache-2.0 | HuggingFace |
| **A′ distilled student** | No especificado | No disponible | Éxito 0.667, pasos 258 | Apache-2.0 | HuggingFace (mismo autor) |
| **GR00T-N1.5 original** | No especificado (similar a N1, ~1.8B?) | No disponible | No disponible (no se comparan en la card) | Apache-2.0 | NVIDIA |

La comparación se limita a los modelos relacionados del mismo autor. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- **Dependencia de un fork**: el modelo solo puede cargarse con el fork `action-quantization-gate-v2` del repositorio de GitHub; el GR00T-N1.5 estándar no tiene los parámetros adicionales del gate.
- **Entrenamiento limitado**: solo se ha afinado en RoboCasa Kitchen; no se ha evaluado en otros entornos ni en robots reales.
- **Umbral τ no universal**: el valor de τ (0.5) es un punto de operación específico del modelo y debe ajustarse para cada arquitectura o tarea; no es una constante.
- **Ruido en benchmarks**: la diferencia de rendimiento puede variar ±1.5 pp, por lo que las comparaciones deben interpretarse con cautela.
- **Sin evaluación de sesgos o alucinaciones**: al ser un modelo de robótica, no se ha analizado en términos de sesgo lingüístico o alucinación, pero sí puede fallar en tareas no cubiertas por el entrenamiento.
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el código asociado puede tener restricciones adicionales (se recomienda revisar el repositorio).

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/prehj/groot-n15-quantizability-gate-C-robocasa)
- [Repositorio del código (fork con gate)](https://github.com/rakybond007/GR00T-action-quantization)
- [Modelo A′ distilled student](https://huggingface.co/prehj/groot-n15-quantizability-gate-A-robocasa)
- [Página de GR00T N1.5 de NVIDIA](https://research.nvidia.com/labs/gear/gr00t-n1_5/)
- [GitHub de NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
