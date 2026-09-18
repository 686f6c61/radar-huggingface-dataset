# hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-GGUF es el repositorio de cuantizaciones **estáticas** en formato GGUF del modelo WaifuGemma4-26b-a4b-v1, publicado por hiwaifu-research. Se trata de un modelo de rol conversacional (role-play) construido sobre Gemma 4 26B-A4B, una arquitectura de mezcla de expertos (MoE) con 25,2 mil millones de parámetros totales y 3,8 mil millones activos por token. El ajuste se realizó con GRPO contra un modelo de recompensa aprendido a partir de 1,2 millones de votos ciegos emitidos por usuarios reales en la HiWaifu Arena.

La relevancia de esta publicación es doble. Por un lado, el modelo afinado empata en votos con GLM-5.1 en batallas ciegas cara a cara y supera al Gemma 4 26B-A4B-it sin ajustar en el 59,7 % de las comparaciones. Por otro, este repositorio concreto resuelve el problema de despliegue: ofrece cuantizaciones listas para llama.cpp con métricas de degradación medidas (divergencia KL, coincidencia top-1 y perplejidad) frente a la referencia bf16, además del proyector de visión en formato f16 para entrada de imágenes.

El modelo está entrenado y evaluado en modo sin razonamiento (non-thinking) y cubre ocho idiomas: inglés, español, ruso, portugués, indonesio, árabe, tailandés y francés. La ventana de contexto del modelo base es de 256K tokens, aunque el entrenamiento se realizó sobre conversaciones de 8K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Gemma 4 26B-A4B; transformer con capas de atención (detalles de numero de expertos no disponibles) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 3,8B |
| Longitud de contexto | 256K tokens en el modelo base; entrenado sobre conversaciones de 8K tokens; ejemplo oficial con `-c 16384` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M y bf16 (referencia, no subida); variantes ponderadas/imatrix en el repositorio i1 |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr |
| Licencia | Gemma |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamano del repositorio | 86,6 GB |
| Modelo base | hiwaifu-research/WaifuGemma4-26b-a4b-v1 |
| Relacion con el modelo base | quantized |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 26B-A4B, un transformer con capas de mezcla de expertos (MoE) que activa 3,8B de parámetros de un total de 25,2B por token generado. El número de expertos, el ratio de activación y la composición exacta del dataset de preentrenamiento no están disponibles en la información proporcionada. El modelo parte del checkpoint instruido Gemma 4 26B-A4B-it y se post-entrena con GRPO (Group Relative Policy Optimization) contra un modelo de recompensa aprendido a partir de 1,2 millones de votos ciegos de usuarios reales en la HiWaifu Arena, una configuración de alineación por preferencias humanas en lugar de RLHF clásico.

La innovación técnica más destacable de esta ficha es de tipo práctico: las cuantizaciones se generaron con `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize` sobre el GGUF bf16, y la calidad se midió con `llama-perplexity --kl-divergence` sobre 20 fragmentos de 512 tokens de respuestas de role-play escritas por el propio modelo en diez idiomas, excluidas del conjunto de calibración del imatrix. El autor documenta un detalle relevante para reproducibilidad: los modelos Gemma 4 instruction-tuned solo producen verosimilitudes calibradas dentro de un turno del modelo, por lo que hay que insertar el prefijo `<|channel>thought\n<channel|>` tras BOS para obtener perplejidades comparables (bf16 obtiene PPL 5,82 con ese prefijo). El repositorio también advierte de un problema de compatibilidad: el `tokenizer_config.json` del repositorio HF usa el formato de transformers 5 (`extra_special_tokens` como lista), mientras que llama.cpp fija transformers 4.57.6, que espera un diccionario y falla con `AttributeError: 'list' object has no attribute 'keys'`.

## Capacidades

- Generación de texto conversacional orientada a role-play e interpretación de personajes, con tarjetas de personaje (character cards) estándar.
- Conversaciones multi-turno de contexto extenso: el modelo base soporta 256K tokens y la tasa de victoria en la arena sube con la profundidad de la conversación, por lo que historiales largos son viables.
- Capacidades multilingües en inglés, español, ruso, portugués, indonesio, árabe, tailandés y francés.
- Control de longitud de respuesta mediante instrucciones en el prompt de sistema (por defecto escribe 400-500 tokens; responde a indicaciones del tipo `Respond in no more than N tokens.`).
- Entrada de imágenes: el repositorio incluye el proyector de visión `mmproj-WaifuGemma4-26b-a4b-v1-f16.gguf`, que permite input de imagen. El autor indica que el entrenamiento no tocó la parte visual y que no se ha evaluado para role-play.
- Modo sin razonamiento (non-thinking): el modelo fue entrenado y evaluado con `--reasoning-budget 0`, de modo que el template inserta el canal de pensamiento vacío que el modelo espera.
- Contenido para adultos: el comportamiento sigue el prompt de sistema, sin ajuste de seguridad adicional más allá del Gemma 4 base (uso exclusivo 18+).
- No hay mención en la información disponible a soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Role-play conversacional en local con SillyTavern: el modelo acepta una tarjeta de personaje estándar y se sirve a través de un endpoint compatible con OpenAI (`http://localhost:8080/v1`), lo que permite integrarlo en clientes existentes sin adaptadores. La línea `Never speak or act for {{user}}.` en el prompt de sistema es, según el autor, la instrucción más útil para evitar que el modelo hable por el usuario.
- Compañero conversacional multi-turno en producto: con historiales largos la tasa de victoria en la arena mejora, de modo que encaja en aplicaciones de chat con memoria persistente donde el contexto acumulado supera los miles de tokens.
- Personajes multilingües para mercados internacionales: al cubrir ocho idiomas, un mismo despliegue puede servir personajes en español, ruso, portugués, indonesio, árabe, tailandés, francés e inglés sin cambiar de checkpoint.
- Escritura creativa y ficción interactiva: la ventana de contexto de 256K del modelo base permite mantener arcos narrativos extensos, fichas de personaje detalladas y resúmenes de capítulos anteriores en el mismo prompt.
- Prototipado en estación de trabajo sin API externa: con una cuantización Q4_K_M o Q5_K_M se puede ejecutar el modelo íntegramente en local mediante llama.cpp, útil para desarrolladores que necesitan iterar sobre prompts de personaje sin coste por token ni dependencia de un proveedor.
- Investigación sobre alineación por preferencias: el modelo es un caso documentado de GRPO contra un modelo de recompensa entrenado con 1,2M de votos ciegos, lo que lo hace útil para estudiar cómo se traduce la preferencia agregada de usuarios en comportamiento conversacional y compararlo con el checkpoint instruido sin ajustar.
- Evaluación y selección de cuantizaciones: el repositorio publica métricas de degradación por cuantización (KLD media, coincidencia top-1 y PPL), lo que permite decidir el equilibrio entre tamaño y fidelidad con datos medidos en lugar de estimaciones.
- Descripción de imágenes dentro de una conversación: mediante el proyector `mmproj` se puede pasar imagen al modelo en llama.cpp, aunque el autor advierte de que esta capacidad no fue entrenada ni evaluada para role-play.

## Benchmarks y rendimiento

Resultados de arena declarados por el autor (no son benchmarks académicos estandarizados; no se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible):

| Comparacion | Resultado |
|---|---|
| WaifuGemma4-26b-a4b-v1 vs GLM-5.1 (batallas ciegas cara a cara) | Reparto paritario de votos |
| WaifuGemma4-26b-a4b-v1 vs Gemma 4 26B-A4B-it sin ajustar | Gana el 59,7 % de las veces |

Calidad de las cuantizaciones frente a bf16 (medida con `llama-perplexity --kl-divergence` sobre 20 fragmentos × 512 tokens de respuestas de role-play en diez idiomas):

| Cuantizacion | Tamano (GB) | KLD media vs bf16 | Coincidencia top-1 | PPL (respuestas RP) | Notas del autor |
|---|---:|---:|---:|---:|---|
| Q8_0 | 26,9 | 0,0098 | 96,5 % | 5,85 | La más cercana a bf16; requiere 32 GB+ de VRAM o RAM de CPU |
| Q6_K | 22,6 | 0,0225 | 94,3 % | 5,76 | Punto óptimo si se dispone de memoria suficiente |
| Q5_K_M | 19,1 | 0,0581 | 91,3 % | 6,11 | Buena |
| Q4_K_M | 16,8 | 0,1507 | 85,9 % | 6,12 | Rápida; el Q4_K_M imatrix del repositorio i1 es claramente mejor al mismo tamaño |
| bf16 (referencia) | 50,5 | 0 | 100 % | 5,82 | No subida; regenerable desde los safetensors |
| mmproj f16 (proyector de visión) | 1,2 | – | – | – | Proyector de visión para entrada de imagen |

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño del fichero GGUF (hay que sumar overhead de contexto, caché KV y buffers del runtime): Q4_K_M ≈ 17 GB; Q5_K_M ≈ 19 GB; Q6_K ≈ 23 GB; Q8_0 ≈ 27 GB; bf16 ≈ 51 GB. Añadir ~1,2 GB si se carga el proyector de visión.
- GPU recomendadas: para Q8_0 el autor indica 32 GB+ de VRAM (o RAM de CPU); encajan A100 40 GB, H100 y configuraciones multi-GPU de 24 GB. Para Q6_K y Q5_K_M, tarjetas de 24 GB como RTX 3090 o RTX 4090. Para Q4_K_M sigue siendo necesario algo más de 16 GB.
- ¿Cabe en GPU de consumo? Con 24 GB sí entran Q4_K_M, Q5_K_M y, con contexto reducido, Q6_K. El autor desaconseja explícitamente usar cuantizaciones estáticas de este repositorio en equipos de 16 GB o menos: para ese rango remite al repositorio de cuantizaciones imatrix (i1), que es mejor en todos los tamaños por debajo de Q5.
- Opciones de despliegue: llama.cpp (`llama-server`, con soporte de `-hf` para descargar directamente desde el repositorio), y cualquier cliente compatible con OpenAI apuntando a `/v1` (por ejemplo, SillyTavern). El comando de ejemplo es `llama-server -hf hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF:Q6_K --jinja --reasoning-budget 0 -c 16384 -ngl 99`. El uso con vLLM, TGI u Ollama no está documentado en la información disponible.
- Construcción de llama.cpp: se indica que funciona cualquier versión reciente; los GGUF se generaron con el build `4fea119` (septiembre de 2026).
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados (valores por defecto del modelo): temperature 1,0, top-p 0,95, top-k 64; el rango 0,8-1,0 funciona.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (esta ficha, GGUF) | 25,2B totales / 3,8B activos | 256K en base, entrenado a 8K | Empata en votos con GLM-5.1; 59,7 % de victorias frente a Gemma 4 26B-A4B-it | Gemma | Repositorio GGUF estático + repositorio i1 con cuantizaciones imatrix |
| GLM-5.1 | No disponible | No disponible | Reparto paritario de votos en batallas ciegas frente a este modelo | No disponible | No disponible en la información proporcionada |
| Gemma 4 26B-A4B-it (sin ajustar) | 25,2B totales / 3,8B activos | 256K | Pierde frente a este modelo el 59,7 % de las batallas ciegas | Gemma | Checkpoints oficiales; requiere adaptación de `tokenizer_config.json` para convertirlos a GGUF con llama.cpp |

No se dispone de datos de benchmarks académicos ni de otros modelos comparables de la misma categoría (role-play) en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que el modelo no tiene ajuste de seguridad más allá del Gemma 4 base y que sigue el prompt de sistema, incluido contenido maduro. Está declarado como uso exclusivo para mayores de 18 años.
- No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K, etc.); solo hay resultados de arena y de degradación por cuantización. No se debe inferir capacidad general a partir de los datos de role-play.
- Los resultados de arena proceden de votos ciegos de usuarios de la HiWaifu Arena, un criterio subjetivo y potencialmente sesgado hacia preferencias de esa comunidad concreta.
- La parte de visión no fue tocada durante el entrenamiento ni evaluada para role-play: cualquier uso multimodal debe validarse antes de llevarlo a producción.
- El modelo está entrenado en modo sin razonamiento. No usarlo con `--reasoning-budget 0` puede degradar el comportamiento respecto a lo evaluado; según el autor, el template debe insertar el canal de pensamiento vacío que el modelo espera.
- Las cuantizaciones estáticas de este repositorio presentan una degradación notable en Q4_K_M (KLD media 0,1507 y coincidencia top-1 del 85,9 %, frente a 0,0225 y 94,3 % en Q6_K). El propio autor recomienda las variantes imatrix del repositorio i1 para tamaños inferiores a Q5.
- La medición de perplejidad de los Gemma 4 instruction-tuned solo es válida con el prefijo de turno de modelo; sin él, `llama-perplexity` reporta valores en los decenas de miles y no son comparables entre cuantizaciones.
- Problema de compatibilidad conocido: el `tokenizer_config.json` del repositorio HF está en formato transformers 5 y rompe la conversión con la versión de transformers fijada por llama.cpp. Hay que instalar `transformers>=5` o convertir el campo `extra_special_tokens` a `{"video_token": "<|video|>"}` antes de convertir.
- Licencia Gemma: los términos de uso de Gemma imponen condiciones específicas (incluidas obligaciones de atribución y una política de uso aceptable). Deben revisarse antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación independiente por parte de la comunidad.
- Ventana de contexto efectiva: aunque el modelo base soporte 256K, el entrenamiento se hizo a 8K tokens. El comportamiento más allá de ese rango no está garantizado por el autor.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Repositorio de cuantizaciones imatrix i1: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-i1-GGUF
- Proyector de visión f16: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/mmproj-WaifuGemma4-26b-a4b-v1-f16.gguf
- Peso Q8_0: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1-Q8_0.gguf
- Peso Q6_K: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1-Q6_K.gguf
- Peso Q5_K_M: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1-Q5_K_M.gguf
- Peso Q4_K_M: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1-Q4_K_M.gguf
- Documentación de HiWaifu: https://docs.hiwaifu.com/
- Aplicación HiWaifu (sitio principal): https://www.hiwaifu.com/
- Aplicación HiWaifu (sitio alternativo): https://hiwaifu.org/
- Aplicación HiWaifu en Google Play: https://play.google.com/store/apps/details?id=com.hiwaifu.app
