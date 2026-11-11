# loraforge/deepseek-v4-pro-qwen3.5-9b-heretic-jackrong-r4

## Resumen

Este repositorio contiene un adaptador LoRA de rango 4 reconstruido por LoRAForge sobre el modelo base `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, con el objetivo de reproducir el delta introducido por el modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`. No se trata del adaptador original entrenado por el autor, sino de una extracción post-hoc de la diferencia densa entre dos checkpoints públicos, comprimida en factores LoRA de rango 4 sobre las 30 matrices lineales modificadas.

El interés técnico reside en el método: LoRAForge forma la diferencia en FP32 entre revisiones inmutables verificadas por SHA256, aplica un range finder gaussiano (128 columnas, 3 iteraciones de subespacio, reortogonalización y proyección en FP64) y comprime los factores resultantes mediante QR FlashTSQR y eigendescomposición en FP64. La reconstrucción captura el 99,942246% de la energía de Frobenius del delta lineal, con un error relativo del 2,403209%.

El modelo base es un transformer multimodal de 9B parámetros de la familia Qwen3.5, con soporte de inglés y chino. El adaptador está pensado como vista previa de investigación: el propio autor advierte que las validaciones incluidas son comprobaciones de carga y generación corta, no evaluaciones de capacidad ni de seguridad. El repositorio tiene 0,0 GB de tamaño declarado y una única descarga en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5 (modelo base `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`) |
| Parametros totales | 9B en el modelo base; adaptador LoRA de rango 4 sobre 30 matrices lineales (recuento exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (factores almacenados en FP32; el base se carga en BF16 según el ejemplo) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador no ha sido entrenado: se ha reconstruido. LoRAForge calcula la diferencia densa en FP32 entre el checkpoint base `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` (revisión `7d7edca1b1e820d89127f9c8ac4b035e0f27652e`) y el checkpoint objetivo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` (revisión `e4bfa83c72896cbb4990c909967d6f27bb97bac4`), ambos verificados por SHA256. Sobre esa diferencia se aplica un range finder gaussiano con 128 columnas, 3 iteraciones de subespacio y reortogonalización/proyección en FP64, y los factores resultantes pasan por `loraforge.adapters.compress_peft_adapter`, que emplea QR FlashTSQR y eigendescomposición de torch en FP64. El rango es 4 en las 30 matrices lineales modificadas, con escalado efectivo 1 (alpha/r convencional) y almacenamiento de factores en FP32 sin relleno de ceros.

Además de las matrices lineales, el checkpoint objetivo presenta 24 vectores de normalización modificados por conversión de precisión de almacenamiento (norma cuadrática del delta total 0,00770741014). Estos no se incluyen en el LoRA lineal para mantener la compatibilidad con el contrato linear-only de LoRAForge; se almacenan aparte en `optional_precision_overrides.safetensors` y solo se aplican explícitamente con el flag `--precision-overrides` del helper de carga. La validación reportada se realizó sin ese parche opcional. El adaptador requiere soporte de Qwen3.5 en Transformers y PEFT compatible; se probó con Transformers 5.22.1, PEFT 0.21.2 y PyTorch 2.11.0+cu130 sobre una NVIDIA H100 NVL.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3.5-9B, con el delta de comportamiento del checkpoint "heretic" aplicado.
- Procesamiento multimodal heredado del base: el ejemplo de carga usa `AutoModelForImageTextToText`, aunque la comprobación de humo del adaptador solo ejercita generación de texto.
- Razonamiento aritmético básico y generación de código verificados en la validación de humo (p. ej. `17 * 23` y una función Python para el máximo de una lista no vacía).
- Idiomas: inglés y chino según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Investigación sobre compresión post-hoc de adaptadores: el repositorio sirve para reproducir y auditar el método LoRAForge (range finding gaussiano, FlashTSQR, eigendescomposición FP64) sobre un par de checkpoints públicos concretos, comparando los errores por módulo registrados en `extraction_report.json`.
- Estudio de alineación y comportamiento: al aislar únicamente la etapa "heretic" respecto al padre Jackrong, permite analizar qué matrices lineales concentran el delta de comportamiento entre ambos checkpoints sin disponer del adaptador original.
- Servicio multi-LoRA: al ser un adaptador PEFT estándar de rango 4 y factores FP32 compactos, es adecuado para probar pipelines de serving que intercambian adaptadores sobre una misma instancia del base Qwen3.5-9B.
- Validación de infraestructura de carga: los artefactos `validation.json` y `load_adapter.py` permiten comprobar en un entorno propio que Transformers y PEFT cargan correctamente el adaptador con la revisión exacta del base.
- Análisis de precisión numérica: los 24 vectores de normalización en `optional_precision_overrides.safetensors` permiten estudiar el efecto de aplicar o no las correcciones de precisión de almacenamiento sobre la salida.
- Docencia y divulgación técnica: como ejemplo reproducible de extracción de deltas entre checkpoints y de los límites de la aproximación de bajo rango (error relativo de Frobenius del 2,403209%).
- Experimentación con el modelo base multimodal: al cargarse con `AutoModelForImageTextToText`, sirve de punto de partida para probar el base Qwen3.5-9B con el delta aplicado en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad en la información disponible. La model card incluye únicamente comprobaciones de humo de carga y generación corta, que el propio autor califica explícitamente como no representativas de capacidad ni de seguridad:

| Prompt neutro | KL del siguiente token (objetivo completo → adaptador) | Primer token greedy coincide |
|---|---:|---|
| Compute 17 * 23. Give only the number. | 0,000135996 | Sí |
| Explain in two sentences why the sky looks blue. | 6,3459e-05 | Sí |
| Write a short Python function that returns the largest value in a nonempty list. | 4,32829e-06 | Sí |

Métricas de reconstrucción del adaptador:

| Métrica | Valor |
|---|---|
| Energía de Frobenius del delta lineal capturada | 99,942246% |
| Error relativo de Frobenius del delta lineal | 2,403209% |
| Rango LoRA por módulo | 4 (físico, escalado unitario) |
| Matrices lineales modificadas | 30 |
| Vectores de normalización modificados (fuera del LoRA) | 24 |

## Requisitos de hardware

- El adaptador en sí ocupa 0,0 GB según el tamaño del repositorio; el coste real lo determina el modelo base de 9B parámetros.
- Carga del base en BF16 con `device_map="auto"`: se requieren aproximadamente 18 GB de VRAM solo para pesos, más overhead de activaciones y contexto (estimación orientativa, no publicada en la información disponible).
- GPU validadas por el autor: NVIDIA H100 NVL, con PyTorch 2.11.0+cu130.
- En GPU de consumo: un base de 9B en BF16 no cabe en tarjetas de 8-12 GB; sería necesario cuantizar el base (no se documentan cuantizaciones del adaptador ni del base en este repositorio).
- Opciones de despliegue: PEFT + Transformers (probado), o `load_adapter.py` incluido en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica explícitamente que esta release no reclama ninguna mejora de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`loraforge/...-heretic-jackrong-r4`) | LoRA rango 4 reconstruido | Base 9B | no disponible | Apache-2.0 | Hugging Face, 1 descarga |
| `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` | Checkpoint completo objetivo | 9B | no disponible | no disponible en la información proporcionada | Hugging Face |
| `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` | Checkpoint base | 9B | no disponible | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es el adaptador original del autor: es una reconstrucción post-hoc; el autor lo etiqueta como "research preview".
- La procedencia histórica exacta del padre de entrenamiento no está probada de forma independiente; el repositorio solo identifica con precisión las revisiones públicas comparadas.
- El error de aproximación del 2,403209% en el delta lineal implica que el comportamiento no es idéntico al checkpoint objetivo; la carga del base en BF16 y el merge introducen además efectos numéricos adicionales más allá de la aproximación FP32 reportada.
- Los 24 vectores de normalización modificados no se aplican por defecto; sin `--precision-overrides` el adaptador no reproduce esa parte del delta.
- Las validaciones incluidas son comprobaciones de carga y generación corta, no evaluaciones de capacidad ni de seguridad. La energía de pesos no garantiza rendimiento.
- El nombre "heretic" y el modelo objetivo "UNCENSORED" sugieren un delta orientado a reducir restricciones de alineación; no se documenta ninguna evaluación de seguridad y debe tratarse con cautela en producción.
- Idiomas limitados a inglés y chino según los metadatos; no se documenta comportamiento en castellano.
- Licencia Apache-2.0 declarada por los upstream, con `LICENSE`, `NOTICE` y registro explícito de modificaciones; el repositorio no implica aval de los autores originales.
- Sin datos publicados de contexto máximo, cuantizaciones soportadas ni rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loraforge/deepseek-v4-pro-qwen3.5-9b-heretic-jackrong-r4
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo objetivo: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Paper LoRAForge (arXiv 2611.01256): https://arxiv.org/abs/2611.01256
