# kamusarj/VLA-JEPA_finetune

## Resumen

VLA-JEPA_finetune es un checkpoint de ajuste fino del modelo VLA-JEPA aplicado a un robot UR10e, desarrollado por kamusarj sobre el framework de preentrenamiento VLA-JEPA de LeRobot. El modelo combina un backbone de visión-lenguaje Qwen3-VL-2B con un codificador y predictor de destino V-JEPA2, y una cabeza de acción DiT-B, entrenado para predicción de acciones robóticas a partir de observaciones visuales y lenguaje. Este fine-tune específico se entrena durante 17.500 pasos de optimización sobre el dataset canónico `ur10e-cup-lerobot-v2.1-v1` de LeRobot, con un objetivo de pérdida combinado de acción y mundo-modelo.

La relevancia de este modelo radica en su enfoque de arquitectura conjunta de visión-lenguaje-acción con predicción de mundo-modelo, que busca mejorar la robustez de las políticas robóticas frente a cambios de apariencia y movimientos irrelevantes. Aunque el checkpoint es un experimento de investigación sin despliegue en producción, demuestra la viabilidad de fine-tuning de VLA-JEPA en un brazo robótico UR10e con evaluación open-loop. El repositorio incluye el checkpoint del modelo, configuración de entrenamiento, historial de métricas y un informe de evaluación, todo bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA con backbone Qwen3-VL-2B, codificador/predictor V-JEPA2, cabeza de acción DiT-B |
| Parametros totales | No disponible (el backbone Qwen3-VL-2B sugiere aproximadamente 2B, pero el total exacto no se especifica) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en punto flotante, formato PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `pytorch_model.pt` (PyTorch safetensors no especificado) |

## Arquitectura y entrenamiento

El modelo combina tres componentes principales: un backbone de vision-language basado en Qwen3-VL-2B que procesa observaciones visuales y lenguaje, un codificador objetivo y predictor V-JEPA2 que aprende representaciones de estado mediante predicción de representaciones futuras sin reconstrucción de píxeles, y una cabeza de acción DiT-B que genera secuencias de acciones con denoising por difusión. La arquitectura VLA-JEPA se preentrena a escala de internet con datos de vídeo, pero este checkpoint es un fine-tune específico para el robot UR10e.

El entrenamiento se realizó sobre el dataset `ur10e-cup-lerobot-v2.1-v1` de LeRobot, con un objetivo combinado de pérdida de acción más un término de mundo-modelo ponderado con factor 0,1. Se ejecutaron 17.500 pasos de optimización con un horizonte de vídeo de 8 fotogramas y un horizonte de acción de 7. El checkpoint no es resumible de optimización (el optimizador se reinicializó en el paso 10.000 y el horario de aprendizaje se reconstruyó), por lo que solo se guardan los pesos del modelo. El codificador objetivo V-JEPA2 permaneció congelado durante todo el entrenamiento.

## Capacidades

- Predicción de acciones robóticas en bucle abierto para un robot UR10e, con un horizonte de acción de 7 pasos.
- Procesamiento de observaciones visuales y lenguaje mediante el backbone Qwen3-VL-2B.
- Generación de acciones mediante denoising por difusión con 8 pasos de denoising.
- Modelado de mundo (world model) auxiliar para representaciones de estado más robustas.
- Capacidades multilingües heredadas de Qwen3-VL-2B, aunque no se han evaluado en este contexto robótico.
- No se documenta soporte explícito de tool calling, agentes o razonamiento multi-paso fuera del dominio robótico.

## Casos de uso

- Manipulación robótica con UR10e: el modelo puede predecir secuencias de acciones de 7 pasos para tareas como recoger y colocar objetos (el dataset `ur10e-cup` sugiere una tarea de taza). Adecuado porque la arquitectura VLA-JEPA combina percepción visual con predicción de acciones.
- Investigación en aprendizaje por refuerzo y control robótico: sirve como punto de partida para experimentos de fine-tuning adicionales o para comparar estrategias de preentrenamiento JEPA frente a métodos basados en reconstrucción de píxeles.
- Evaluación de políticas en bucle abierto: el checkpoint incluye un protocolo de evaluación open-loop con métricas de MSE, MAE y precisión de gripper, útil para benchmarks de predicción de acciones.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede predecir acciones de asistencia en tareas de manipulación, reduciendo la carga cognitiva del operador humano.
- Entrenamiento de agentes con modelos de mundo: la componente V-JEPA2 permite experimentar con objetivos de mundo-modelo para mejorar la generalización de políticas a entornos con variaciones de apariencia.
- Benchmarking de arquitecturas VLA: el checkpoint sirve como referencia para comparar el rendimiento de VLA-JEPA frente a otros modelos de visión-lenguaje-acción en tareas de manipulación con UR10e.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación open-loop sobre los 8 episodios de validación (holdout), comparando con un baseline de persistencia (que repite la última acción). La evaluación sigue el protocolo GR00T de chunked open-loop con horizonte de ejecución 7 y 8 pasos de denoising. Estos resultados miden la predicción de la siguiente acción en bucle abierto, no la tasa de éxito de la tarea en un bucle cerrado.

| Metrica | Modelo VLA-JEPA fine-tune | Baseline de persistencia |
|---|---|---|
| MSE global no normalizado | 0,001192 | 0,001966 |
| MAE global no normalizado | 0,003733 | 0,005706 |
| MAE de articulaciones móviles (rad) | 0,003553 | 0,005338 |
| Precisión del gripper | 99,186% | 98,677% |

No se han publicado resultados comparativos con otros modelos VLA en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente. Dado el backbone Qwen3-VL-2B en FP16, se estima un consumo de memoria de 4-8 GB para inferencia de un solo lote, más la memoria de la cabeza de difusión.
- GPU recomendadas: una tarjeta con al menos 8 GB de VRAM, como una RTX 3060 o superior, sería suficiente para inferencia básica. Para entrenamiento o fine-tuning, se recomienda una GPU con 16-24 GB, como RTX 4090 o A100.
- Compatibilidad con GPU de consumo: sí, una GPU de gama media-alta puede ejecutar el modelo en FP16, aunque la latencia dependerá del tamaño del lote y la longitud de secuencia.
- Opciones de despliegue: el modelo se carga con PyTorch y la librería LeRobot. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el modelo es específico para robótica y requiere el entorno de LeRobot.
- Latencia y throughput: no se han publicado datos de rendimiento en tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA-JEPA_finetune (este) | Qwen3-VL-2B + V-JEPA2 + DiT-B | ~2B (estimado) | No disponible | Apache-2.0 | Checkpoint en HuggingFace |
| OpenVLA (base) | Prismatic + Llama-2-7B | 7B | 2048 tokens | MIT (pesos) | Disponible en HuggingFace |
| LeRobot VLA-JEPA-Pretrain | Qwen2-VL + V-JEPA2 + DiT | No disponible | No disponible | Apache-2.0 | Disponible en HuggingFace |

No se dispone de comparativas de rendimiento directas con estos modelos en el mismo entorno robótico. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación, no optimizado para producción. No se ha probado en bucle cerrado con control del robot, solo en evaluación open-loop.
- La evaluación open-loop mide la precisión de predicción de la siguiente acción, no el éxito de la tarea física. Un bajo error de predicción no garantiza un comportamiento robusto en un robot real.
- No se documentan sesgos o riesgos de alucinación específicos, pero como modelo basado en Qwen3-VL, puede heredar sesgos de los datos de preentrenamiento.
- El checkpoint no es resumible para optimización; solo contiene pesos del modelo, lo que limita su uso para continuar entrenamiento sin reconfigurar el optimizador.
- El dataset de entrenamiento es específico de la tarea `ur10e-cup-lerobot-v2.1-v1`, por lo que la generalización a otras tareas o entornos no está garantizada.
- No se ha evaluado la robustez frente a cambios de iluminación, texturas o posiciones de cámara más allá del protocolo open-loop.
- La licencia Apache-2.0 permite uso comercial, pero los componentes base (Qwen3-VL-2B, V-JEPA2) pueden tener sus propias restricciones; se debe verificar la licencia de cada componente.

## Enlaces

- HuggingFace: https://huggingface.co/kamusarj/VLA-JEPA_finetune
- Código base VLA-JEPA (GitHub): https://github.com/ginwind/VLA-JEPA
- Paper VLA-JEPA (arXiv): https://arxiv.org/abs/2602.10098
- Documentación de LeRobot para VLA-JEPA: https://huggingface.co/docs/lerobot/main/vla_jepa
- Modelo preentrenado base: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
