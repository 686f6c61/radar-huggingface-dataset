# snupilab/Rep4Act-DiT-4B-FM-ID-FD-Pretrained-100k-seed0

## Resumen

Rep4Act-DiT-4B-FM-ID-FD-Pretrained-100k-seed0 es un modelo de robótica publicado por el laboratorio snupilab en Hugging Face bajo el pipeline `robotics`. Por su nomenclatura, se trata de un Diffusion Transformer (DiT) de aproximadamente 4B parámetros preentrenado sobre 100.000 muestras (sufijo `100k`) con una semilla concreta (`seed0`), orientado a la representación de acciones para políticas robóticas (prefijo `Rep4Act`). Los sufijos `FM`, `ID` y `FD` no están documentados en la información disponible y probablemente corresponden a variantes de configuración del experimento (por ejemplo, fine-tuning, in-domain o feature distillation), pero no se puede confirmar.

El modelo emplea la arquitectura Diffusion Transformer, un enfoque generativo basado en difusión que en robótica se utiliza habitualmente para modelar distribuciones multimodales de acciones (policy learning por difusión). Frente a políticas deterministas, los modelos de difusión permiten capturar múltiples modos de comportamiento válidos, lo que mejora la robustez en tareas de manipulación con datos humanos diversos.

Es relevante ahora porque la familia de modelos de difusión aplicados a robótica (Diffusion Policy y variantes) se ha consolidado como referencia para imitación learning, y este checkpoint aporta un preentrenamiento a gran escala (100k muestras, ~5,8B parámetros) que puede servir como base para fine-tuning en tareas concretas. No obstante, la información pública es mínima: no hay model card descriptiva, licencia declarada ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), inferida de la nomenclatura; no confirmada en model card |
| Parametros totales | 5.792.993.313 (~5,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 19,5 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en Hugging Face |
| Pipeline declarado | robotics |
| Fecha de publicacion | 2026-11-12 |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT), según se deduce del identificador `DiT` en el nombre del modelo. Los DiT sustituyen las U-Nets clásicas de los modelos de difusión por bloques transformer con atención, lo que escala mejor con el tamaño del modelo y permite condicionamiento flexible (por ejemplo, en acciones, observaciones o embeddings de tarea). En el contexto robótico, el modelo probablemente genera trayectorias de acción mediante un proceso de difusión condicionado por el estado y la observación.

El entrenamiento declarado es un preentrenamiento sobre 100.000 muestras (`Pretrained-100k`) con semilla `seed0`. No se dispone de información sobre el número de tokens, la composición del dataset, si hubo RLHF/DPO (poco habitual en robótica) ni sobre innovaciones técnicas específicas. Tampoco se documenta si el modelo incorpora decodificación especulativa, atención lineal u otras optimizaciones. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de acciones y trayectorias para control robótico mediante difusión (inferido de la arquitectura y el pipeline `robotics`).
- Modelado multimodal de distribuciones de acción, adecuado para imitación learning con datos humanos diversos.
- Preentrenamiento de base para fine-tuning en tareas de manipulación o navegación (según la nomenclatura `Pretrained`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Fine-tuning para manipulación robótica: el checkpoint preentrenado sobre 100k muestras puede servir como inicialización para políticas de manipulación en entornos concretos, reduciendo la necesidad de datos específicos de tarea.
- Investigación en diffusion policy: útil como baseline a gran escala (~5,8B parámetros) para comparar variantes de DiT frente a U-Net en tareas de imitación.
- Imitación learning con datos humanos: la naturaleza generativa del modelo permite capturar multimodalidad en las demostraciones, útil cuando distintos operadores resuelven la misma tarea de formas diferentes.
- Reproducción de experimentos: el sufijo `seed0` sugiere que forma parte de una familia de checkpoints con distintas semillas, lo que facilita estudios de reproducibilidad y varianza de entrenamiento.
- Desarrollo de políticas para brazos robóticos en laboratorio: el tamaño del modelo (~5,8B) requiere GPUs de gama alta, por lo que encaja en entornos de investigación con infraestructura dedicada.
- Base para destilación: al ser un modelo grande, puede emplearse para generar datos o como profesor en un esquema de destilación hacia políticas más ligeras desplegables en robots con cómputo limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp16/bf16): aproximadamente 11,6 GB solo para pesos, más memoria para activaciones y buffers de difusión; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en fp32: ~23,2 GB solo para pesos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en fp16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16, siempre que el pipeline de difusión no requiera activaciones adicionales grandes; en GPUs de 16 GB probablemente requiera cuantización o técnicas de offloading.
- Opciones de despliegue: no se documentan integraciones específicas; al ser un modelo de robótica con pesos safetensors, el despliegue requerirá el código propio del autor (no disponible públicamente en la información proporcionada). Herramientas genéricas como vLLM, llama.cpp u Ollama no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-DiT-4B (este modelo) | ~5,8B | no disponible | DiT para robótica | no disponible | gated en HF |
| Diffusion Policy (original) | ~decenas de millones | no disponible | U-Net/CNN de difusión | MIT (habitual) | público |
| Octo | ~93M | no disponible | Transformer de políticas | Apache 2.0 (habitual) | público |
| OpenVLA | ~7B | no disponible | VLA basado en LLM | no disponible | público |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo de snupilab que permitan una comparación cuantitativa. Los modelos alternativos citados son referencias conocidas de la literatura, pero sus cifras exactas deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- No hay model card descriptiva: se desconoce la composición exacta del dataset de entrenamiento, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación en el sentido de generar trayectorias no válidas o inseguras fuera de la distribución de entrenamiento; en robótica esto puede traducirse en movimientos peligrosos.
- Licencia no disponible: no se puede confirmar el uso comercial; además el acceso es restringido (gated), lo que exige aceptar condiciones adicionales.
- Idiomas y contexto no aplicables o no documentados.
- No se documentan benchmarks ni evaluaciones de seguridad, por lo que no se recomienda su despliegue en producción sin una validación exhaustiva en el dominio objetivo.
- El tamaño (~5,8B parámetros) implica requisitos de hardware elevados para inferencia en tiempo real en un robot, lo que puede limitar su uso embebido.
- La nomenclatura (`FM`, `ID`, `FD`) no está explicada, lo que dificulta saber con precisión qué variante de preentrenamiento representa este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-DiT-4B-FM-ID-FD-Pretrained-100k-seed0
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
