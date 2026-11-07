# Minguinho-zeze/Qwen3-1.7B-W2A16-AWQ-Trace

## Resumen

Qwen3-1.7B-W2A16-AWQ-Trace es un checkpoint de investigación publicado por el usuario Minguinho-zeze, consistente en una cuantización post-entrenamiento del modelo denso Qwen3-1.7B de Alibaba Qwen. La cuantización aplica pesos simétricos INT2 con activaciones de 16 bits (W2A16), tamaño de grupo 128 y el algoritmo AWQ, dejando sin cuantizar las capas de embedding, normalización y `lm_head`. El objetivo declarado no es ofrecer un modelo utilizable, sino reproducir y diagnosticar un fallo: el checkpoint obtiene un 0 % de precisión en los benchmarks de razonamiento evaluados.

El modelo base, Qwen3-1.7B, es un transformer denso de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) con licencia Apache-2.0, orientado a generación de texto, conversación y razonamiento con modo "thinking". Este checkpoint experimental conserva esa arquitectura y esa licencia, pero degrada por completo la capacidad de razonamiento del modelo original según la evaluación publicada por el autor.

Su relevancia es fundamentalmente metodológica: documenta un caso de colapso de precisión en cuantización de muy bajo bitwidth (2 bits) sobre un modelo pequeño, con protocolo de evaluación reproducible, calibración trazable y artefactos de diagnóstico. No es un modelo recomendado para inferencia práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B); cuantización W2A16 con compressed-tensors |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la configuración de ejemplo usa `max_model_len=34816`) |
| Tipos de cuantizacion | Pesos INT2 simétricos, activaciones 16 bits, group size 128, algoritmo AWQ; embedding, normalización y `lm_head` sin cuantizar; fracción de parámetros cuantizados: 81,9079 % |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y no realiza entrenamiento adicional: es una cuantización post-entrenamiento (PTQ). La receta aplica AWQ con pesos INT2 simétricos y activaciones BF16/16 bits, agrupando en bloques de 128 y manteniendo en precisión completa las capas de embedding, normalización y la cabeza de salida `lm_head`, lo que deja un 81,9079 % de parámetros cuantizados. La caché KV se mantuvo en BF16 durante la evaluación.

La calibración se generó a partir de trazas de razonamiento del propio Qwen3-1.7B en BF16 sobre NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación para evitar contaminación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. Los metadatos exactos de la receta y las versiones del cuantizador se conservan en `config.json`, `recipe.yaml` y `quant_meta.json`. El autor no formula ninguna afirmación sobre la causa del fallo observado ni sobre la corrección de los kernels en todas las formas.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-1.7B.
- Modo "thinking" (razonamiento extendido) habilitable mediante `chat_template_kwargs={"enable_thinking": True}`.
- En teoría, razonamiento matemático y de dominio científico, dado el origen del modelo base; en la práctica, la evaluación publicada muestra colapso total en estas tareas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Reproducción de fallos en cuantización de bajo bitwidth: sirve para replicar el colapso de precisión documentado (0 % en AIME-120 y GPQA Diamond) y comparar contra el modelo BF16 con el mismo protocolo de evaluación.
- Diagnóstico de kernels de cuantización: los artefactos en `diagnostics/` permiten contrastar rutas de referencia frente a kernels comprimidos, útil para validar implementaciones de compressed-tensors y Humming.
- Investigación en PTQ extrema: punto de partida para estudiar por qué W2A16 con AWQ y group size 128 destruye el razonamiento en modelos de ~1,7B, y para probar recetas alternativas de calibración.
- Validación de pipelines de evaluación: el protocolo (120 preguntas AIME, 198 de GPQA Diamond, tres semillas, presupuesto de 32.768 tokens de salida, truncamiento contado como incorrecto) es reutilizable como plantilla de evaluación reproducible.
- Estudio de contaminación de calibración: el filtrado de n-gramas de 13 palabras y la exclusión de amc_aime ofrecen un ejemplo concreto de cómo aislar el conjunto de calibración del de evaluación.
- Docencia y divulgación: caso real y documentado de los riesgos de cuantizar a 2 bits sin validación exhaustiva, adecuado para formación en ingeniería de modelos.

## Benchmarks y rendimiento

Datos publicados por el autor. Precisión media en porcentaje sobre las semillas 0, 1 y 2; cada semilla evalúa las mismas 120 preguntas de AIME y 198 de GPQA Diamond (semillas repetidas son generaciones repetidas, no preguntas nuevas). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (W2A16 AWQ) | 0,00 | 0,00 |

Estos resultados describen el protocolo del experimento y no son resultados oficiales de Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB, por lo que los pesos INT2 caben holgadamente en cualquier GPU consumer moderna; a ello hay que sumar la caché KV en BF16 y el contexto configurado (hasta 34.816 tokens en el ejemplo), que puede dominar el consumo de memoria.
- GPU recomendadas: el entorno registrado por el autor usó GPUs Blackwell. Otras GPUs y combinaciones de paquetes no han sido validadas por esta release.
- GPU consumer: los pesos caben en cualquier GPU con suficiente VRAM para la caché KV; no se especifican modelos concretos validados.
- Despliegue: vLLM 0.32.0 con PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17. Para INT2 es necesario añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming. No es un release GGUF ni AutoAWQ, por lo que llama.cpp u Ollama no son vías soportadas.
- Latencia y throughput: no disponibles en la información proporcionada (el autor remite a los informes completos con datos de velocidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3-1.7B-W2A16-AWQ-Trace | 1,72 B (INT2) | no disponible | 0,00 | 0,00 | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3-1.7B (BF16) | 1,72 B | no disponible | 40,00 | 40,40 | Apache-2.0 | Hugging Face |
| Qwen3-1.7B-Base | ~2 B | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes de Qwen3-1.7B porque no se dispone de datos de benchmarks de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Colapso de precisión documentado: 0 % en AIME-120 y GPQA Diamond frente al 40,00 % y 40,40 % del modelo BF16. El autor lo describe explícitamente como un checkpoint de investigación para reproducir fallos y no lo recomienda para inferencia práctica.
- Causa del fallo desconocida: el autor no atribuye el resultado al algoritmo ni al método de calibración, y los resultados de análisis de factores están retenidos mientras se investigan mediante repeticiones.
- Validación de kernels incompleta: las comparaciones de `diagnostics/` no establecen la corrección de los kernels en todas las formas.
- Entorno de ejecución frágil: solo validado con versiones muy concretas de vLLM, PyTorch, Transformers, compressed-tensors y humming-kernels sobre GPUs Blackwell; requiere configuración adicional de NVRTC.
- Riesgo de alucinación: no evaluado en este checkpoint; con razonamiento degradado, la fiabilidad de las respuestas es baja.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no disponibles; las capacidades multilingües del modelo base no se han verificado tras la cuantización.
- Licencia: Apache-2.0 permite uso comercial, pero el propio autor desaconseja su uso en producción dado el fallo de precisión.
- Contexto: la longitud de contexto del modelo base no se detalla en la información disponible; la configuración de ejemplo usa 34.816 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-W2A16-AWQ-Trace
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluación (revisión a851e39): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Resultados completos guardados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
