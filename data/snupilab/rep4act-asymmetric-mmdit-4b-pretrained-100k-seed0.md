# snupilab/Rep4Act-Asymmetric-MMDiT-4B-Pretrained-100k-seed0

## Resumen

Rep4Act-Asymmetric-MMDiT-4B-Pretrained-100k-seed0 es un modelo de robótica desarrollado por el laboratorio snupilab, orientado a la representación y predicción de acciones en tareas de manipulación. Se distribuye como checkpoint preentrenado sobre un corpus de 100.000 muestras (indicado en el nombre del repositorio) con la semilla 0, lo que sugiere una familia de variantes reproducibles por semilla. El modelo emplea una arquitectura denominada MMDiT (Multi-Modal Diffusion Transformer) con un diseño asimétrico, según se deduce de su denominación, y se publica en formato safetensors con 5.840.181.793 parámetros reales, lo que sitúa el cómputo en el rango de los 4B declarados en el nombre.

El modelo se enmarca en la línea "Rep4Act" (representaciones para acción) y utiliza componentes "ActionDiT" (Diffusion Transformer para acciones), lo que apunta a un enfoque generativo de difusión aplicado a políticas robóticas. No es un modelo de lenguaje general: su pipeline declarado es `robotics`, y sus etiquetas incluyen `rep4act`, `actiondit` y `pretraining`, lo que lo posiciona como base preentrenada para posteriores ajustes finos en tareas de control.

La relevancia actual radica en la creciente demanda de modelos fundacionales para robótica que combinen percepción multimodal y generación de acciones en un único transformer. Sin embargo, la información pública disponible es muy limitada: el repositorio está restringido (gated), no declara licencia, idiomas ni resultados de benchmarks, y no se han publicado papers ni documentación asociada en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multi-Modal Diffusion Transformer) asimétrica, con componente ActionDiT |
| Parametros totales | 5.840.181.793 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe en el nombre del modelo como "Asymmetric MMDiT", es decir, un Diffusion Transformer multimodal con un diseño asimétrico entre las ramas de entrada (probablemente una para observaciones visuales y otra para la señal de acción o estado). El componente "ActionDiT" sugiere que la difusión se aplica directamente sobre el espacio de acciones, un patrón habitual en políticas robóticas generativas (action diffusion). El tamaño real de 5,84 mil millones de parámetros indica un modelo de escala media-grande para robótica, muy por encima de las políticas tipo ACT o Diffusion Policy clásicas.

El preentrenamiento se realizó sobre 100.000 muestras según el identificador del repositorio, con la semilla 0 como referencia de reproducibilidad. No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta si el entrenamiento incluyó datos multimodales reales o simulados.

## Capacidades

- Generación de acciones robóticas mediante difusión, orientada a políticas de control (action diffusion).
- Procesamiento multimodal (el término MMDiT implica al menos dos modalidades, típicamente visión y acción).
- Preentrenamiento como base para ajuste fino en tareas de manipulación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): visión probable por la naturaleza MMDiT, pero no confirmado en la información disponible.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede emplearse como política base para generar trayectorias de acción continuas en tareas de ensamblaje, aprovechando la difusión sobre acciones para producir movimientos suaves y multimodales.
- Ajuste fino en entornos simulados: al ser un checkpoint preentrenado sobre 100k muestras, sirve como inicialización para entrenamiento con datos específicos de un simulador (p. ej. MuJoCo, Isaac Sim) y reducir el coste de entrenamiento desde cero.
- Investigación en representaciones para acción: la línea "Rep4Act" sugiere que el modelo está pensado para estudiar cómo representar acciones; útil en experimentos académicos sobre políticas generativas.
- Reproducibilidad de experimentos: la variante seed0 permite replicar resultados y comparar con otras semillas de la misma familia.
- Base para políticas multimodales visión-lenguaje-acción: si el MMDiT integra ramas de texto, podría adaptarse a instrucciones en lenguaje natural, aunque esto no está confirmado.
- Benchmarking de arquitecturas DiT en robótica: útil como referencia de escala (5,8B parámetros) frente a políticas más pequeñas en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 12 GB solo para pesos (5,84B × 2 bytes), más activaciones y buffers de difusión; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: ~6 GB para pesos; en 4 bits: ~3 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o ajuste fino; RTX 4090 (24 GB) viable para inferencia en precisión reducida.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) en FP16 con margen ajustado; en GPUs de 16 GB probablemente solo con cuantización, no confirmada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica, el despliegue típico sería mediante PyTorch y el código específico del proyecto (no publicado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Asymmetric-MMDiT-4B (este) | 5,84B | no disponible | Robótica / action diffusion | no disponible | Gated en HF |
| Diffusion Policy (clásico) | ~10-100M | N/A | Robótica / action diffusion | MIT (habitual) | Público |
| Octo | ~27M-93M | N/A | Robótica generalista | Apache 2.0 (habitual) | Público |
| OpenVLA | ~7B | N/A | Visión-lenguaje-acción | Llama 2 (restringida) | Público |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo de snupilab, y las cifras de los alternativos corresponden a información pública general, no a la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el uso inmediato.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Documentación mínima: no se detallan datos de entrenamiento, composición del dataset ni metodología, lo que dificulta evaluar sesgos.
- Riesgo de alucinación en acciones: en políticas generativas de difusión, el modelo puede producir trayectorias no válidas fuera de la distribución de entrenamiento; se requiere validación en simulación y con límites de seguridad en hardware real.
- Idiomas no aplicables: al no ser un modelo de lenguaje, las consideraciones multilingües no proceden, pero tampoco se documenta si acepta instrucciones textuales.
- Fecha de creación futura (2026-11-10): el timestamp del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o un modelo programado; conviene verificar la integridad del checkpoint.
- Sin soporte de cuantización documentado: el despliegue en GPUs de consumo puede requerir conversión manual y validación.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Asymmetric-MMDiT-4B-Pretrained-100k-seed0
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
