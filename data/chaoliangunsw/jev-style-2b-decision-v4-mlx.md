# chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX

## Resumen

Jev-Style-2B-Decision-v4-MLX es la variante para Apple Silicon (MLX) del modelo de decisión Jev-Style-2B-Decision-v4, desarrollado por Chaoliang Yan (chaoliangUNSW). No es un modelo generativo de propósito general: se trata de un clasificador y evaluador de decisiones de tipo "system-one" que, dado un texto o un estado JSON, emite una decisión calibrada (por ejemplo, sí/no, etiqueta de enrutamiento o elección fija entre opciones). Está construido sobre una base Qwen3.5 de 2B parámetros y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema concreto en pipelines de producción: sustituir llamadas a un LLM grande por un clasificador local, rápido y calibrado para tareas de enrutamiento (routing), guardarraíles (guardrails) y decisiones binarias. La versión MLX incluye dos precisiones en un mismo repositorio (bf16 de 3,76 GB y 8-bit de 2,00 GB) y un runtime propio (`jev_style_decision_mlx.py`), pensado para ejecución on-device en Macs con chip Apple. Soporta hasta 32.768 tokens de contexto por llamada, lo que permite clasificar entradas largas sin truncar.

La relevancia actual radica en su enfoque: en lugar de competir en generación, se posiciona como un componente de decisión evaluado en un tablero público (Decision Index 0.3) y en un benchmark propio (JevBench v1.4.1). El entrenamiento de la v4 incorporó etiquetas suaves destiladas de "TypeSafe Jev 1.14" a través de su API pública, un detalle relevante para evaluar procedencia y reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5), adaptada a clasificación/decisión; runtime MLX propio |
| Parámetros totales | 2B (según nombre y model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por llamada (API alojada: 8.192 tokens, entradas hasta 8.000) |
| Tipos de cuantización | bf16 (3,76 GB) y 8-bit (2,00 GB); conversión con mlx 0.32.2 y mlx-lm 0.31.3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF disponible como build separado (solo texto) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer Qwen3.5 de 2B parámetros y se especializa en producir decisiones calibradas en lugar de texto libre. La model card menciona "exact block attention" en el scorer de referencia en FP32 sobre CUDA, y el runtime MLX reproduce ese comportamiento con pesos de normalización en FP32 (`macjev_norms_fp32.safetensors`, 0,42 MB, obligatorio). La inferencia MLX se ejecuta con un script propio que selecciona la carpeta `bf16/` o `8bit/` mediante `--model-dir`.

En cuanto al entrenamiento, la v4 incorporó etiquetas suaves (soft labels) destiladas de TypeSafe Jev 1.14 a través de su API pública. El autor declara explícitamente que JevStyle se mantiene de forma independiente, sin afiliación ni respaldo de TypeSafe, y que el paquete Python no incluye los datasets crudos de respuestas del profesor, aunque ello no anula el uso de salidas del profesor en el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es el enfoque de "decisión calibrada" con paridad numérica verificada entre precisiones: frente a la referencia FP32, el build bf16 coincide en el top-1 en el 99,7% de 1.000 preguntas (Δp máx. 0,036) y el 8-bit en el 99,9% (Δp máx. 0,048).

## Capacidades

- Clasificación de texto y de estados JSON con salida de decisión calibrada (probabilidades, no solo etiqueta).
- Decisiones de elección fija (fixed-choice scoring) entre opciones predefinidas.
- Enrutamiento de LLM (llm-routing): decidir qué modelo o ruta atender una petición.
- Guardarraíles (guardrails): filtros de seguridad y políticas en pipelines.
- Contexto largo: hasta 32.768 tokens por llamada en el runtime PyTorch/MLX de referencia.
- Soporte de imágenes en el repositorio principal con runtime PyTorch; los builds MLX y GGUF son solo texto.
- API alojada separada (solo texto, contexto de 8.192 tokens) con límites de capacidad compartida y respuestas 429 con `Retry-After`.
- No se documentan tool calling, function calling ni modos de razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de peticiones entre modelos: usar el clasificador para decidir si una consulta va a un modelo pequeño o a uno grande, reduciendo coste y latencia en producción.
- Guardarraíles de contenido: clasificar entradas de usuario como permitidas o bloqueadas antes de llegar al LLM generativo, con umbrales calibrados ajustables.
- Decisiones sí/no sobre documentos: validar recibos, capturas o formularios con el runtime PyTorch del repositorio principal (soporte de imagen) y el MLX para texto.
- Clasificación de tickets de soporte: asignar categoría o cola de atención a partir de conversaciones largas gracias al contexto de 32.768 tokens.
- Moderación en aplicaciones on-device: ejecutar el build 8-bit (2,00 GB) en un Mac con Apple Silicon sin enviar datos a la nube.
- Evaluación de políticas y cumplimiento: puntuar estados JSON contra reglas fijas en pipelines de CI o backoffice.
- Enrutamiento en asistentes locales: integrar el runtime MLX en herramientas de escritorio para decidir acciones sin llamada a API externa.

## Benchmarks y rendimiento

| Benchmark | Jev-Style 2B v4 | Jev-Style 2B v3 |
|---|---:|---:|
| Decision Index 0.3, índice público | 44,37 | 34,05 (listado hasta 2026-11-04) |
| Decision Index 0.3, puntuación completa (tests privados) | 34,53 | sustituido por v4 en el tablero |
| JevBench v1.4.1, ítems públicos (231) | 74,9% (IC 95%: 68,9–80,0%) | 73,6% |
| Contexto por llamada | 32.768 tokens | 25.600 tokens |

Paridad de las builds MLX frente a la referencia PyTorch FP32 (1.000 preguntas):

| Precisión | Carpeta | Pesos | Mismo top-1 | Δp máx. | Precisión (FP32: 84,4%) | Fixture largo (97) | Puerta |
|---|---|---:|---:|---:|---:|---:|:---:|
| bf16 | `bf16/` | 3,76 GB | 99,7% | 0,036 | 84,4% | 97/97 | PASS |
| 8-bit | `8bit/` | 2,00 GB | 99,9% | 0,048 | 84,5% | 97/97 | PASS |

Los resultados del tablero se midieron con el runner y scorer propios del kit (bfloat16 en una A100, una ejecución completa de 140.178 peticiones). JevBench es una ejecución propia con el arnés oficial (float32 en Apple MPS). Las builds MLX no se reevaluaron en los benchmarks; reproducen las puntuaciones dentro de las puertas predeclaradas.

## Requisitos de hardware

- VRAM/RAM para inferencia: bf16 requiere 3,76 GB de pesos; 8-bit, 2,00 GB. Añadir overhead del runtime y del contexto (hasta 32.768 tokens).
- GPU recomendadas: una A100 para la referencia FP32/PyTorch; en Apple Silicon, cualquier Mac con chip M-series y memoria unificada suficiente (8 GB o más para 8-bit).
- Cabe en GPU consumer: sí, el build 8-bit (2,00 GB) es apto para GPUs con 8 GB o más; bf16 requiere aproximadamente 6-8 GB de VRAM.
- Despliegue: runtime MLX propio (`jev_style_decision_mlx.py`) para Apple Silicon; runtime PyTorch del repositorio principal; build GGUF disponible (solo texto); API alojada separada.
- Latencia y throughput: no disponibles de forma explícita; la referencia se midió con una ejecución de 140.178 peticiones en una A100 sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-2B-Decision-v4-MLX | 2B | 32.768 | Clasificación/decisión calibrada | Apache 2.0 | HF (MLX), API alojada |
| Jev-Style-2B-Decision-v3-MLX | 2B | 25.600 | Versión anterior de la serie | Apache 2.0 | HF |
| Jev-Style-0.8B-Decision-v3-MLX | 0,8B | no disponible | Variante reducida para on-device | Apache 2.0 | HF |
| Modelos de clasificación genéricos (p. ej., BERT/RoBERTa) | 0,1-0,4B | 512 típicamente | Clasificación de texto estándar | Variable | Amplia |

La comparación con clasificadores transformer clásicos es cualitativa: Jev-Style ofrece contexto mucho mayor y salida calibrada, pero no se han publicado comparaciones directas con esos modelos en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para producir texto libre ni para tareas de razonamiento abierto.
- Riesgo de alucinación en la etiqueta de decisión si la entrada queda fuera de la distribución de entrenamiento; la calibración no garantiza corrección.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está verificado.
- El entrenamiento usó salidas de un profesor externo (TypeSafe Jev 1.14) vía API pública; revisar implicaciones de procedencia antes de uso comercial, aunque la licencia del modelo es Apache 2.0.
- Las builds MLX no se reevaluaron en los benchmarks; la paridad se verificó en 1.000 preguntas y un fixture de 97, no en el conjunto completo.
- La API alojada tiene contexto de 8.192 tokens (frente a 32.768 del runtime local) y capacidad compartida con respuestas 429; no apta para cargas sin reintentos.
- Los builds MLX y GGUF son solo texto; las capacidades de imagen requieren el runtime PyTorch del repositorio principal.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-MLX
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Serie v1 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Serie v2 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Serie v3 0.8B: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- Serie v3 2B: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3-MLX
- Web oficial: https://jevstyle.com/models/2b-v4/
- GitHub: https://github.com/lawrence3699/jev-style
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Enrutamiento local y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones sí/no con visión: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de enrutamiento bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio API: https://jevstyle.com/api/#service-status
- Health check: https://api.jevstyle.com/healthz
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
