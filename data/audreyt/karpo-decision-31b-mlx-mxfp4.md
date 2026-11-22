# audreyt/karpo-decision-31B-mlx-mxfp4

## Resumen

`karpo-decision-31B-mlx-mxfp4` es una cuantización en formato MLX `mxfp4` (4 bits, 4,251 bits por peso, 16,35 GB) del modelo `MachinePulseAI/karpo-decision-31B`, publicada por el usuario `audreyt`. No se trata de un modelo generativo de propósito general, sino de un clasificador de decisión binaria ("system-one") que reutiliza el backbone de texto de Gemma 4 31B y lo remata con una cabeza lineal FP32 de dimensiones `[255, 5376]` que proyecta sobre un vocabulario reducido de decisiones. El paquete está optimizado para Apple Silicon mediante la librería `mlx` y `mlx-lm`, con el tokenizador y la configuración de decisión (`decision_config.json`) preservados intactos.

La innovación principal es el esquema de atención `karpo-blocks-v1`: atención bidireccional en 10 capas globales y atención causal con ventana deslizante de 1024 tokens en 50 capas, además de una poda de marcadores en la capa 59 que solo computa Q, atención y MLP en las posiciones de los marcadores de lectura. Esto convierte al modelo en un evaluador de preguntas de tipo sí/no con latencias del orden de centenares de milisegundos a decenas de segundos según el número de preguntas.

Es relevante ahora porque demuestra una pauta de despliegue de modelos de 31B en hardware de consumo (Apple M5 Max, 128 GB) con cuantización de 4 bits nativa de MLX, y porque su caso de uso declarado (juez de recuperación de memoria en la herramienta Mnemon) apunta a un patrón creciente: modelos pequeños de decisión especializados que actúan como filtros o jueces dentro de pipelines de agentes y RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Gemma 4 31B (texto) con cabeza lineal de lectura FP32 `[255, 5376]`; atención `karpo-blocks-v1` (bidireccional en 10 capas globales, causal con ventana 1024 en 50 capas deslizantes) |
| Parametros totales | 30.697.345.280 (~30,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; ventana deslizante de 1024 tokens por bloque y atención global bidireccional en 10 capas |
| Tipos de cuantizacion | `mxfp4` (4 bits, 4,251 bits/peso, `group_size=32`); cabeza de lectura en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `readout.safetensors`, `decision_config.json` y `serve_karpo_31b_mlx.py` |

## Arquitectura y entrenamiento

El modelo base `MachinePulseAI/karpo-decision-31B` se construye sobre `google/gemma-4-31B-it` (según la atribución de la model card) y conserva el backbone de texto de Gemma 4 31B, pero elimina la torre de visión y sustituye la cabeza de lenguaje por una cabeza lineal de lectura de 255 clases en FP32. La configuración `karpo-blocks-v1` define una atención empaquetada en una sola pasada con atención bidireccional en 10 capas globales, atención causal con ventana deslizante de 1024 tokens en 50 capas y posiciones RoPE por rama. La capa 59 aplica una poda de marcadores: solo calcula Q, atención y MLP en las N posiciones de lectura, lo que reduce el coste computacional del forward.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card tampoco documenta el proceso de destilación o ajuste que convierte el backbone generativo en un clasificador de decisión. La cuantización `mxfp4` la realiza el publicador (`audreyt`) sobre el modelo base, mapeando `global_head_dim=512` y `num_global_key_value_heads=4` para compatibilidad con `mlx-lm`, y aplicando `final_logit_softcapping` de 30,0 sobre los logits FP32 de la cabeza de lectura.

## Capacidades

- Clasificación binaria de decisión: genera `P(yes)` y `P(no)` sobre preguntas de tipo sí/no mediante la cabeza de lectura de 255 clases.
- Evaluación por lotes de preguntas: procesa N preguntas en una sola pasada empaquetada gracias al esquema `karpo-blocks-v1`.
- Modo "system one": respuesta rápida y determinista, sin generación de texto libre ni cadena de pensamiento.
- Servidor HTTP local compatible con `POST /v1/systemone` en el puerto 18440.
- Integración como juez (`--judge`) en la herramienta Mnemon y en configuraciones `memory-config.json` con `kind: systemone`.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Tool calling, agentes multi-paso, visión, audio y modo thinking: no disponibles en esta variante (la torre de visión se elimina explícitamente en la cuantización).

## Casos de uso

- Filtro de recuperación en RAG: el modelo actúa como juez que decide si un fragmento recuperado es relevante para la consulta, con latencia de ~554 ms para 2 preguntas y ~4,15 s para 16 preguntas en M5 Max, lo que permite reordenar o descartar candidatos antes de pasarlos a un LLM generativo.
- Memoria de agentes con Mnemon: integrado vía `MNEMON_JUDGE_ENDPOINT`, evalúa si un recuerdo debe recuperarse en una consulta concreta, reduciendo el contexto inyectado al modelo principal.
- Moderación y gating binario: clasificación rápida de contenido o de intenciones en un pipeline previo a la generación, aprovechando la cabeza de decisión de 255 clases.
- Enrutado de consultas: decidir si una petición debe ir a un modelo grande o resolverse con una respuesta cacheada, usando `P(yes)` como señal de confianza.
- Evaluación automática de hipótesis: validar pares pregunta/respuesta en pipelines de evaluación de agentes, con procesamiento por lotes de hasta 32 preguntas en ~10,2 s.
- Despliegue local en estaciones de trabajo Apple Silicon: servidor HTTP standalone (`serve_karpo_31b_mlx.py`) que expone el clasificador sin dependencia de GPUs dedicadas ni de servicios en la nube.
- Verificación de hechos binaria en pipelines editoriales: comprobar si una afirmación está respaldada por un documento dado, con la ventaja de que la cabeza de lectura FP32 y el softcapping a 30,0 estabilizan las probabilidades.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de latencia del propio autor en Apple M5 Max con 128 GB, en caliente y sin caché:

| Carga de trabajo | Tokens | Latencia | `P(yes)` acierto / fallo |
|---|---:|---:|---:|
| Carga en frío | — | 1,4 s | — |
| 2 preguntas (`noul`) | ~351 | 554 ms | 0,999 / 0,006 |
| 16 preguntas (`noul`) | ~2.457 | 4,15 s | 1,000 / 0,000 |
| 32 preguntas (`noul`) | ~4.937 | 10,2 s | 1,000 / 0,000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/espacio unificado estimado: ~16,35 GB de pesos en `mxfp4` más overhead de activaciones y del servidor MLX; el autor reporta ejecución en Apple M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; el paquete usa la librería `mlx` y no está pensado para CUDA.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA; en Apple Silicon, un equipo con 32 GB o más de memoria unificada debería poder alojar los pesos, aunque el autor solo documenta el caso de 128 GB.
- Opciones de despliegue: `mlx-lm` (requerido), servidor standalone `serve_karpo_31b_mlx.py` con endpoint `POST /v1/systemone`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~554 ms para 2 preguntas, ~4,15 s para 16 y ~10,2 s para 32 en M5 Max; carga en frío de 1,4 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| `audreyt/karpo-decision-31B-mlx-mxfp4` | ~30,7 B | ventana deslizante 1024 + 10 capas globales | MLX `mxfp4`, Apple Silicon | Apache-2.0 | Clasificador de decisión, no generativo |
| `MachinePulseAI/karpo-decision-31B` (base) | ~30,7 B | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar; referencia de fidelidad |
| `google/gemma-4-31B-it` (ancestro) | ~31 B | no disponible | safetensors, GGUF vía terceros | Gemma license | Modelo generativo instruct; el karpo lo usa como backbone |
| Clasificadores de decisión pequeños (p. ej. DeBERTa, MiniLM) | 0,1–0,4 B | 512 tokens típicos | safetensors, ONNX | MIT/Apache-2.0 | Mucho más ligeros y rápidos, pero sin la capacidad semántica de un backbone de 31B |

No se dispone de comparativas de rendimiento publicadas frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades de decisión sobre un vocabulario de 255 clases; no debe usarse para chat, código o razonamiento abierto.
- La torre de visión se elimina en esta cuantización, por lo que no procesa imágenes.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- El contexto efectivo está limitado por la ventana deslizante de 1024 tokens por bloque y la atención global en 10 capas; no se especifica la longitud máxima de entrada.
- Riesgo de alucinación en la señal de decisión: las probabilidades `P(yes)`/`P(no)` pueden ser sobreconfiadas (el autor reporta 0,999/0,006 en el caso de 2 preguntas), lo que exige calibración por umbral en producción.
- Dependencia exclusiva de `mlx` y Apple Silicon: no hay soporte documentado para CUDA, ROCm ni backends alternativos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Gemma 4, cuyos términos de licencia pueden imponer restricciones adicionales; conviene revisar `LICENSE` y `NOTICE` del repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.
- El servidor incluido (`serve_karpo_31b_mlx.py`) es un script de referencia, no un servicio endurecido para producción (sin autenticación, rate limiting ni observabilidad documentadas).

## Enlaces

- Hugging Face: https://huggingface.co/audreyt/karpo-decision-31B-mlx-mxfp4
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo ancestro: https://huggingface.co/google/gemma-4-31B-it
- Librería MLX: https://github.com/ml-explore/mlx
- `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Herramienta Mnemon (referenciada en la model card): no disponible
