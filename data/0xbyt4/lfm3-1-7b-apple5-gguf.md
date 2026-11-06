# 0xbyt4/LFM3-1.7B-Apple5-GGUF

## Resumen

LFM3-1.7B-Apple5-GGUF es una redistribución modificada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario independiente 0xbyt4. No se trata de un modelo nuevo entrenado desde cero, sino de una variante del checkpoint QAD-Q4_0 oficial de Liquid AI a la que se han añadido dos artefactos propios: un "output sketch" de 1 bit que permite calcular logits exactos sobre un subconjunto reducido del vocabulario, y una "draft head" entrenada para decodificación especulativa. El objetivo declarado es ejecutar el modelo en las GPU de la familia Apple 5 (A12, A12X y A12Z) mediante un parche específico de llama.cpp.

El modelo base es LFM3-1.7B, un transformer de aproximadamente 2.005 millones de parámetros (2,0 mil millones) con embeddings de tokens de dimensión 2048 y un vocabulario de 128.000 entradas. La licencia original es LFM1.0, del tipo "other", y el modelo está etiquetado exclusivamente para inglés. La relevancia de esta ficha no está en el modelo en sí, sino en el trabajo de ingeniería de inferencia: cuantización Q4_0 con embeddings en Q8_0, decodificación especulativa con una cabeza entrenada por autodestilación y kernels adaptados a GPU Apple sin reducción SIMD-group.

Es importante subrayar que estos ficheros no cargan en llama.cpp sin parchear, ni en Ollama ni en LM Studio, porque contienen tensores adicionales que esas herramientas no reconocen. El autor solo ha probado los ficheros en un iPad Pro de 11 pulgadas (2.ª generación, A12Z), y no está afiliado a Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); ficheros GGUF modificados con tensores adicionales (`output_sketch.weight`, `draft_*`) |
| Parametros totales | 2.005.629.760 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 en matrices de pesos; embeddings de tokens en Q8_0; pesos de normalizacion en F32; output sketch en Q1_0; draft head en Q4_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 2,0 mil millones de parámetros con matriz de salida ligada (tied output matrix) de 128.000 x 2048. Sobre ese checkpoint, el autor aplica tres transformaciones: reconversión de embeddings de Q6_K a Q8_0 manteniendo el resto en Q4_0, adición de un output sketch Q1_0 de 37 MB que replica la matriz de salida y permite calcular logits exactos solo para una parte pequeña del vocabulario, y adición de una draft head para decodificación especulativa. El checkpoint de partida es el QAD-Q4_0 de Liquid AI, producido con destilación consciente de cuantización (quantization-aware distillation).

La draft head tiene una estructura concreta: una capa lineal que toma el estado oculto final y el embedding del token (2 x 2048 a 2048), un bloque SwiGLU con tamaño oculto 1024 y dos capas RMSNorm. Predice el token posterior al siguiente y restringe el token borrador a los primeros 65.536 ids del vocabulario. El autor la entrenó con MLX sobre respuestas generadas por el propio LFM3-1.7B (autodestilación); ni el código de entrenamiento ni los datos se han publicado. En la verificación, un paso de verify decodifica dos tokens a la vez. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento y resolución de problemas matemáticos de tipo word problem (el autor incluye un prompt de este tipo en su benchmark).
- Generación de código, ejemplificada con un prompt de script Bash en las mediciones publicadas.
- Decodificación especulativa opcional mediante la draft head incluida en el fichero `-draftq4`, con ganancias medidas de hasta el 11,0 % en tokens por segundo.
- Cálculo de logits exactos sobre un subconjunto del vocabulario gracias al output sketch Q1_0.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Inferencia local en iPad con chip A12Z: el caso de uso principal y único validado por el autor. Los ficheros están pensados para la app lfm3-ipad sobre llama.cpp parcheado, con velocidades medidas de 34,5 a 41,3 tok/s según el prompt.
- Generación de texto en dispositivos Apple de gama A12/A12X/A12Z: útil para prototipos de asistentes conversacionales en local sin conexión, aprovechando que el modelo completo cabe en 1,15-1,16 GB.
- Evaluación de decodificación especulativa en hardware de gama baja: la draft head y el output sketch permiten experimentar con verify de dos tokens en GPU sin reducción SIMD-group, un escenario poco habitual en la literatura.
- Investigación sobre cuantización extrema: la combinación Q4_0 + embeddings Q8_0 + sketch Q1_0 sirve como banco de pruebas para medir el impacto de mezclar precisiones en un transformer pequeño.
- Generación de scripts y fragmentos de código en local: el prompt de script Bash del benchmark muestra un rendimiento de 41,3 tok/s con especulación activada, adecuado para autocompletado offline.
- Docencia y demostraciones de llama.cpp modificado: el repositorio del parche y la app de chat permiten ilustrar cómo se añaden tensores personalizados a un GGUF y cómo se expone una API C (`llama_set_draft_head`, `llama_get_draft_ith`).

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en un iPad Pro de 11 pulgadas (2.ª generación, A12Z) con iPadOS 27.0.1, decodificación greedy, media de 3 ejecuciones y rango entre paréntesis. No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

| Prompt | Sin especulacion (tok/s) | Con especulacion (tok/s) | Cambio | Borradores correctos |
|---|---|---|---|---|
| Essay | 38,6 (37,4-40,2) | 38,9 (37,8-40,3) | +0,8 % | 33 % |
| Bash script | 37,2 (36,9-37,5) | 41,3 (41,0-41,5) | +11,0 % | 47 % |
| Math word problem | 37,1 (37,0-37,3) | 41,1 (41,1-41,2) | +10,7 % | 47 % |
| 10 prompts mixtos | 34,5 (33,9-34,9) | 37,0 (36,6-37,6) | +7,5 % | 47 % |

Datos adicionales: la velocidad de procesamiento de prompt fue de 201 tok/s para prompts de 512 tokens. Los primeros 128 tokens greedy fueron idénticos con y sin draft head. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: los ficheros ocupan 1,15 GB (`-sketch.gguf`) y 1,16 GB (`-sketch-draftq4.gguf`). El repo completo pesa 4,6 GB.
- GPU objetivo: familia Apple GPU 5, es decir, chips A12, A12X y A12Z. El autor solo validó en A12Z (iPad Pro 11" 2.ª generación).
- GPU de escritorio: no se documenta compatibilidad con A100, H100 ni RTX 4090; el parche está orientado a GPU Apple sin reducción SIMD-group.
- Consumer GPU: no hay datos de funcionamiento en GPU NVIDIA o AMD consumer; los ficheros no cargan en llama.cpp sin el parche.
- Despliegue: exclusivamente llama.cpp en el commit `338fce6511c744893cc0d3d958b275f40552c7a4` con el parche `llamacpp-apple5-lfm3`, o la app lfm3-ipad. No funciona en Ollama ni LM Studio.
- Latencia y throughput: 34,5-41,3 tok/s en decodificación y 201 tok/s en prefill de 512 tokens sobre A12Z, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 0xbyt4/LFM3-1.7B-Apple5-GGUF | 2,0 mil millones | No disponible | LFM1.0 | GGUF modificado | Requiere llama.cpp parcheado; solo Apple GPU 5 |
| LiquidAI/LFM3-1.7B | 2,0 mil millones | No disponible | LFM1.0 | Safetensors | Modelo base original, sin modificaciones |
| LiquidAI/LFM3-1.7B-GGUF | 2,0 mil millones | No disponible | LFM1.0 | GGUF estándar | Carga en llama.cpp sin parche; incluye el QAD-Q4_0 de origen |

No se dispone de datos de benchmarks de calidad para comparar rendimiento entre estas variantes. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Los ficheros no cargan en llama.cpp sin parchear, Ollama ni LM Studio: fallan con `wrong number of tensors` por los tensores adicionales. El menú "Use this model" de Hugging Face no funciona.
- Compatibilidad de hardware muy restringida: solo GPU Apple familia 5 (A12, A12X, A12Z) y solo probado en A12Z. El resto de dispositivos listados en el README del parche no han sido verificados por el autor.
- Idioma limitado al inglés; no hay soporte multilingüe documentado.
- Licencia LFM1.0 del tipo "other": es necesario revisar el fichero LICENSE del modelo base para uso comercial; el autor conserva los campos de licencia originales en los metadatos.
- La draft head se entrenó por autodestilación sobre salidas del propio modelo, con código y datos no publicados; no es reproducible ni auditable.
- Riesgo de alucinación inherente a un modelo de 2,0 mil millones de parámetros; no se han publicado evaluaciones de fidelidad factual.
- Las ganancias de la decodificación especulativa son modestas y variables: +0,8 % en texto libre (Essay) frente a +11,0 % en código y matemáticas, con una tasa de acierto del borrador del 33-47 %.
- Repositorio no afiliado a Liquid AI; el mantenimiento depende de un único autor y las fechas de creación y actualización son del 31 de octubre de 2026.
- Sin datos publicados sobre longitud de contexto efectiva, sesgos o comportamiento en dominios especializados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xbyt4/LFM3-1.7B-Apple5-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Parche de llama.cpp: https://github.com/0xbyt4/llamacpp-apple5-lfm3
- App de chat para iPad: https://github.com/0xbyt4/lfm3-ipad
