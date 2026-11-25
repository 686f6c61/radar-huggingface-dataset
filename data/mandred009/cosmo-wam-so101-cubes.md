# Mandred009/cosmo-wam-so101-cubes

## Resumen

Cosmo WAM (world-action model) es un modelo compacto desarrollado por Mandred009 para el brazo robótico SO-101 de LeRobot, orientado a tareas de manipulación de cubos con una única cámara de muñeca. Combina un transformer de difusión latente de 51 millones de parámetros sobre un VAE convolucional de 41 millones, y predice de forma conjunta los próximos 8 fotogramas de la cámara de muñeca, los próximos 8 estados articulares y un chunk de 8 acciones articulares. Su doble naturaleza —política y modelo del mundo— permite al modelo mostrar lo que espera ver mientras controla el brazo, lo que facilita la inspección cualitativa del comportamiento.

El modelo se entrenó desde cero con 500 demostraciones teleoperadas (unas 506 000 imágenes a 15 Hz) capturadas en una sola configuración física, una sola escena y con solo dos instrucciones en lenguaje natural. No se ha publicado ninguna tasa de éxito en bucle cerrado sobre el brazo real; los resultados disponibles son puramente offline sobre episodios reservados.

Su relevancia es la de un experimento reproducible y de código abierto sobre world-action models a pequeña escala: entrena en una única RTX 3090, publica pesos en formato PyTorch plano y se integra con el ecosistema LeRobot, lo que lo convierte en una base útil para investigar políticas generativas con modelo del mundo incorporado, no en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (world-action model) sobre VAE convolucional |
| Parametros totales | 92 M (51 M WAM + 41 M VAE) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por instrucción, estado de 6 articulaciones e imagen de 256×256; horizonte de predicción de 8 pasos) |
| Tipos de cuantizacion | no disponible (pesos publicados en precisión de entrenamiento, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (solo dos instrucciones en inglés fijas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`wam.pt`, `vae.pt`), cargables con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo consta de dos componentes entrenados por separado desde cero. Un VAE convolucional de 41 M comprime los fotogramas de muñeca de 256×256 (recorte central de una cámara de 640×480) a un espacio latente, y un transformer de difusión de 51 M opera en ese espacio latente para generar secuencias. La cabeza del modelo produce simultáneamente tres salidas: 8 fotogramas futuros imaginados, 8 estados articulares futuros y un chunk de 8 acciones articulares expresadas como objetivos relativos al estado actual, a 15 Hz. Las instrucciones se codifican con embeddings congelados de Qwen2.5-0.5B.

Los datos de entrenamiento son 500 demostraciones teleoperadas (aproximadamente 506 000 fotogramas a 15 Hz) de una única configuración SO-101, con un reparto 80/20 por episodios. El VAE se entrenó durante unas 4 horas y el WAM durante unas 17 horas en una sola RTX 3090. No se documenta uso de RLHF ni DPO; el entrenamiento es puramente de imitación supervisada sobre difusión. Los pesos publicados corresponden a la media exponencial (EMA) del WAM. El dataset no es público.

## Capacidades

- Generación de acciones articulares para el SO-101: chunks de 8 acciones a 15 Hz como objetivos relativos al estado actual.
- Predicción de estados articulares futuros (8 pasos), útil como modelo dinámico interno.
- Generación de fotogramas futuros de la cámara de muñeca (8 pasos), es decir, capacidad de "imaginar" la escena.
- Condicionamiento por instrucción en lenguaje natural, limitado a dos frases concretas mediante embeddings congelados de Qwen2.5-0.5B.
- Funcionamiento como política y como modelo del mundo en el mismo paquete de pesos.
- Replanificación cada 4 acciones sobre fotogramas reales para corregir la deriva de las predicciones imaginadas.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni razonamiento simbólico.

## Casos de uso

- Investigación en world-action models: sirve como banco de pruebas reproducible a pequeña escala para estudiar la predicción conjunta de observaciones, estados y acciones, con un coste de entrenamiento de una sola GPU consumer.
- Evaluación de políticas generativas en robótica de manipulación: permite comparar difusión latente frente a políticas deterministas en tareas de pick-and-place con el SO-101.
- Depuración visual de políticas: `run_so101.py` muestra en paralelo la vista real de la muñeca y el "sueño" del modelo, lo que facilita detectar desalineaciones entre la predicción y la realidad antes de permitir movimiento real.
- Docencia y divulgación: el par VAE + transformer de difusión es lo bastante pequeño (92 M en total) para explicar paso a paso cómo se entrena y despliega un modelo del mundo robótico.
- Base para fine-tuning en configuraciones propias: al publicarse con licencia MIT y pesos planos, un laboratorio puede reentrenar el WAM sobre sus propias demostraciones LeRobot con otro brazo o escena.
- Prototipado de tareas de apilado y colocación en entornos controlados: las dos instrucciones cubren pick-and-place en bandeja y apilado de cubos, suficientes para validar pipelines de captura, calibración y ejecución.
- Validación de infraestructura LeRobot: útil para probar la integración de cámaras, calibración (`lerobot-calibrate`) y puertos serie antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados offline publicados por el autor sobre episodios reservados (no hay comparación con otros modelos):

| Metrica | Resultado |
|---|---|
| Rollouts imaginados de 30 pasos (estado propio realimentado) | error de píxel 4× menor que copiar el último fotograma a 10 pasos; 3,7× a 30 pasos |
| Estado articular predicho en rollout | ~100× más preciso que mantener el estado congelado |
| Chunks de acción de la política | 27× más precisos que repetir la última acción |
| Tasa de éxito en bucle cerrado sobre el brazo real | no medida |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 92 M de parámetros totales en FP32 el peso ronda los 0,37 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con más de 4 GB.
- GPU de entrenamiento documentada: una RTX 3090 (VAE ~4 h, WAM ~17 h).
- GPU recomendadas para inferencia: cualquier GPU NVIDIA con soporte CUDA; una RTX 3090, 4090 o superior deja margen sobrado; también cabe en GPUs de gama media y en placas integradas con suficiente memoria.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: PyTorch nativo mediante el script `run_so101.py` del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 15 Hz con replanificación cada 4 acciones, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmo WAM (este modelo) | 92 M (51 M WAM + 41 M VAE) | 8 pasos de predicción, 6 articulaciones | SO-101, cubos, cámara de muñeca | MIT | Pesos en Hugging Face, dataset no público |
| Políticas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Manipulación genérica LeRobot | MIT/Apache según implementación | Código y recetas públicas, sin pesos específicos para SO-101 |
| Modelos del mundo robóticos de mayor escala (p. ej. variantes tipo UniSim/GR-1) | no disponible | no disponible | Predicción de vídeo y acción | varía | no disponible |

No se dispone de una comparación cuantitativa con alternativas en la información proporcionada; la comparativa anterior es cualitativa y basada en categorías de modelos, no en resultados medidos.

## Limitaciones y advertencias

- Entrenado en una única configuración física: un solo brazo SO-101, un solo montaje de cámara de muñeca, una sola mesa y un solo conjunto de cubos. Fuera de ese entorno no se espera que funcione sin reentrenamiento o fine-tuning.
- Solo admite las dos instrucciones de entrenamiento; los embeddings de Qwen2.5-0.5B están congelados y no generaliza a nuevas formulaciones ni tareas.
- No se ha medido la tasa de éxito en bucle cerrado sobre el brazo real; los resultados publicados son offline y con el propio estado realimentado, lo que puede sobreestimar el rendimiento en ejecución.
- Los fotogramas imaginados derivan en horizontes largos; el sistema mitiga esto replanificando cada 4 acciones sobre imágenes reales, pero la política depende de esa corrección.
- El dataset de entrenamiento no es público, lo que limita la reproducibilidad exacta de los resultados.
- Riesgo de alucinación visual: el modelo puede generar fotogramas plausibles pero incorrectos, y no debe interpretarse su "sueño" como una predicción fiable de la escena real.
- Sesgos: al proceder de un único operador y una única escena, hereda cualquier sesgo de las demostraciones teleoperadas (posiciones iniciales, velocidades, agarres).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar el comportamiento en un robot real recae en el usuario.
- Para producción en robótica real se recomienda ejecutar primero en modo `--dry-run`, con límites de par y paradas de emergencia, dado que no hay métricas de seguridad ni de éxito publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mandred009/cosmo-wam-so101-cubes
- Repositorio de código, receta de entrenamiento e historial de experimentos: https://github.com/Mandred009/Cosmo_Small_WAM
- LeRobot (framework de robótica usado): https://github.com/huggingface/lerobot
- Qwen2.5-0.5B (modelo base de los embeddings de instrucción): https://huggingface.co/Qwen/Qwen2.5-0.5B
