# cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF

## Resumen

Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF es una cuantización GGUF del modelo 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored, publicada por el usuario cmod. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del modelo Qwen3.8-27B de Alibaba, cuantizada en formato Q3_K_XL dinámico de Unsloth y reempaquetada con un vocabulario reducido a caracteres ASCII. El objetivo declarado es ejecutar una ventana de contexto de 131.072 tokens sobre una única GPU de 16 GB, manteniendo el modelo completo y su caché KV en la tarjeta.

El modelo tiene 26.090.566.656 parámetros reales (aproximadamente 26,1 mil millones), lo que lo sitúa en la categoría de modelos densos de tamaño medio-grande. La receta combina tres decisiones técnicas: pesos UD-Q3_K_XL de Unsloth con las 60 matrices que la abliteración modificó sustituidas por las versiones del modelo heretic; un tokenizador recortado de 248.320 a 128.190 tokens conservando solo los tokens ASCII y los 256 tokens de byte; y decodificación especulativa mediante drafter n-gram de llama.cpp, que no consume VRAM adicional.

La relevancia de esta ficha radica en que documenta un caso extremo de optimización de memoria para inferencia local: contexto largo en hardware de consumo, con métricas concretas de velocidad, ventana efectiva y calidad (KLD) medidas sobre una RTX 5080 de 16 GB. Es, por tanto, un artefacto de interés para quienes despliegan modelos abliterated en local y necesitan estimar compromisos entre ventana, cuantización de caché y throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8), con cabeza de predicción multi-token (MTP) en `blk.64.*` |
| Parametros totales | 26.090.566.656 (26,1 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos; en la práctica 131.072 en GPU de 16 GB con la configuración recomendada, 112.640 con margen de seguridad |
| Tipos de cuantizacion | GGUF Q3_K_XL dinámico (Unsloth UD-Q3_K_XL); caché KV en q4_0 o q8_0 |
| Idiomas soportados | Inglés (declarado); otros alfabetos funcionan con penalización por el vocabulario ASCII |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 12,7 GB |
| Tamano del archivo principal | 11,60 GiB |
| SHA256 del GGUF principal | `c0d48dc21a51c920230992edc328d967f298bde6b5229db708d1f57ac208ea79` |
| Modelo base | 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored |
| Vocabulario | 128.190 tokens (recortado desde 248.320; solo ASCII + 256 tokens de byte) |
| Distancia al modelo de precisión completa (KLD media) | 0,0898 ± 0,0015 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8 con aproximadamente 26,1 mil millones de parámetros y una ventana nativa de 131.072 tokens. El modelo incorpora una cabeza de predicción multi-token (MTP) ubicada en el bloque `blk.64.*`, que puede emplearse como segundo drafter en decodificación especulativa; llama.cpp la omite si no se solicita `draft-mtp`, por lo que no consume memoria en el perfil por defecto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo original en la información proporcionada.

El proceso de construcción de esta variante consta de tres etapas documentadas. Primero, se parte de los pesos UD-Q3_K_XL (Dynamic 3.1) de Unsloth y se sustituyen las 60 matrices de pesos que la abliteración modificó por las del modelo heretic; el resto de tensores se mantiene byte a byte respecto al archivo de Unsloth. Segundo, se recorta el tokenizador de 248.320 a 128.190 tokens, conservando todos los tokens compuestos exclusivamente por texto ASCII y los 256 tokens de byte, lo que libera espacio para aproximadamente 11.000 tokens adicionales de ventana. Tercero, se habilita decodificación especulativa mediante el drafter n-gram de llama.cpp (`--spec-type ngram-mod`), que reutiliza texto ya presente en la ventana y no requiere VRAM extra. Adicionalmente, se publica la abliteración como LoRA en F16 (`Qwen3.8-27B-Heretic-ablation-LoRA-F16.gguf`) para su reutilización.

## Capacidades

- Generación de texto conversacional y de código, con modo de razonamiento (thinking) activado por defecto en la plantilla de chat de Qwen3.8 y desactivable por petición mediante `chat_template_kwargs`.
- Razonamiento de múltiples pasos y tareas agénticas: edición de archivos, llamadas a herramientas y citas de código, que son precisamente los patrones que el drafter n-gram explota para acelerar la decodificación.
- Recuperación de información en contexto largo: en la model card se reporta un recall de 80 de 80 hechos plantados a 115.000 tokens de profundidad.
- Capacidad multilingüe limitada: el vocabulario ASCII preserva el tokenizado exacto de inglés y código, pero otros alfabetos siguen funcionando con un coste adicional en tokens (no cuantificado en la información disponible).
- Modo "uncensored": la abliteración elimina los rechazos explícitos; se reportan 0 y 1 rechazos ("I can't…") sobre 200 prompts dañinos, frente a 100 y 94 del modelo sin modificar.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servidores compatibles con la API de llama.cpp.
- No se declaran capacidades de visión, audio ni tool calling nativo más allá de lo que soporte la plantilla del Qwen3.8 base (no disponible en detalle).

## Casos de uso

- Asistentes de código en local sobre GPU de consumo: con 131.072 tokens de ventana y 465 tok/s en decodificación superficial con drafting n-gram, el modelo puede mantener un repositorio mediano en contexto y responder ediciones sin salir de una RTX 5080 de 16 GB.
- Agentes autónomos con historial largo: el drafter n-gram acelera precisamente las respuestas que repiten contexto (ediciones, llamadas a herramientas, código citado), con 111,2 tok/s medidos a 114.642 tokens de profundidad en tarea de código.
- Análisis de documentos extensos con recuperación verificada: el recall de 80/80 hechos a 115.000 tokens lo hace adecuado para preguntas sobre contratos, informes o bases de conocimiento de decenas de miles de tokens.
- Generación de código en pipelines de CI/CD: el formato GGUF y la compatibilidad con llama-server permiten desplegarlo como servicio HTTP interno para revisión de parches, generación de tests o documentación técnica.
- Experimentación en investigación sobre alineación y abliteración: la publicación de la LoRA de abliteración en F16 y las métricas de KLD (0,0898 ± 0,0015) permiten reproducir y medir el efecto de eliminar direcciones de rechazo sobre la distribución de salida.
- Evaluación de decodificación especulativa: los tres perfiles documentados (long, fast, quality) con velocidades y ventanas medidas constituyen un banco de pruebas reproducible para comparar drafters n-gram frente a MTP.
- Despliegue de chat sin censura en entornos controlados: para investigación sobre generación de contenido sensible o simulación de adversarios, con la advertencia legal y ética correspondiente.

## Benchmarks y rendimiento

Datos medidos por el autor sobre una RTX 5080 de 16 GB, decodificación greedy y thinking desactivado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Perfil | Ventana (tokens) | Decode tok/s, código profundo | Decode tok/s, código superficial | Decode tok/s, prosa superficial | Prompt tok/s, profundo | VRAM libre tras tarea profunda (MiB) |
|---|---|---|---|---|---|---|
| long (n-gram, recomendado) | 131.072 | 111,2 a 114.642 | 465 | 59 | 1.176 | 624 |
| long sin drafting | 131.072 | 37,0 a 114.642 | 59 | 59 | 1.176 | 626 |
| fast (MTP + n-gram) | 90.112 | 149,9 a 78.853 | 474 | 113 | 1.246 | 210 |
| quality (caché q8_0 + n-gram) | 73.728 | 137,0 a 64.897 | 329 | 59 | 1.391 | 711 |

| Métrica de calidad | Valor |
|---|---|
| KLD media frente al modelo de precisión completa | 0,0898 ± 0,0015 |
| KLD media del archivo de Unsloth frente a su propio modelo | 0,0835 ± 0,0014 |
| Rechazos explícitos sobre 200 prompts dañinos | 0 y 1 de 100 |
| Rechazos del modelo sin modificar (referencia) | 100 y 94 |
| Recall de 80 hechos plantados a 115K tokens | 80 de 80 |

## Requisitos de hardware

- VRAM estimada: el archivo principal ocupa 11,60 GiB; con caché KV a 4 bits, cada 16.384 tokens de ventana consume 288 MiB. La ventana completa de 131.072 tokens cabe en 16 GB con 624 MiB libres tras una tarea profunda, siempre que el resto del sistema no ocupe la GPU.
- GPU recomendadas: RTX 5080 de 16 GB (medida por el autor); cualquier GPU con 16 GB o más (RTX 4080, RTX 4090, A100, H100) permite ventanas mayores o caché de mayor precisión. En GPUs de 24 GB cabría la ventana completa con caché q8_0.
- Cabe en GPU de consumo: sí, en modelos de 16 GB con la configuración documentada; en GPUs de 12 GB no se ha validado y probablemente requiera descargar capas a CPU o reducir ventana.
- Opciones de despliegue: llama.cpp (`llama-server`) es el motor de referencia; también es compatible con Ollama y otros frontends que consuman GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Throughput y latencia: 1.176-1.391 tok/s de prompt en contexto profundo; 465-474 tok/s de decodificación superficial con drafting; 37 tok/s sin drafting a 114K tokens de profundidad, frente a 111,2 tok/s con n-gram.
- Ajuste de memoria: `-ot 'token_embd\.weight=CPU'` mantiene la matriz de embeddings en RAM del sistema sin coste de velocidad; `-ub 128 -b 512` reduce los buffers de cómputo; `-np 1` evita dividir la ventana entre slots.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL (este) | 26,1 B | 131.072 | Apache 2.0 | GGUF Q3_K_XL | Abliterated, vocabulario ASCII, 16 GB |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored | 26,1 B (no confirmado) | no disponible | no disponible | safetensors (presumible) | Modelo base de este GGUF |
| Qwen3.8-27B (original de Alibaba) | 26,1 B (no confirmado) | 131.072 (según este derivado) | no disponible | no disponible | Sin abliterar; rechaza 100/94 de 200 prompts dañinos |
| UD-Q3_K_XL de Unsloth (referencia de cuantización) | 26,1 B | 131.072 | no disponible | GGUF | KLD 0,0835 frente a su modelo completo |

No se dispone de datos de benchmarks estándar ni de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.3 70B o Mistral Large) en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos de forma deliberada: el modelo responderá a peticiones dañinas. No es apto para despliegues públicos sin filtros externos y puede generar contenido ilegal o dañino según la jurisdicción.
- El recorte del vocabulario a ASCII degrada el tokenizado de idiomas no latinos (cirílico, árabe, CJK, etc.): más tokens por carácter, menor ventana efectiva y posible pérdida de calidad en esas lenguas. Solo el inglés está declarado oficialmente.
- La cuantización Q3_K_XL introduce un error medible: KLD de 0,0898 frente al modelo completo, ligeramente superior al 0,0835 del archivo de Unsloth. Para tareas sensibles a la fidelidad conviene el perfil "quality" con caché q8_0.
- La ventana efectiva depende de la VRAM libre: un navegador abierto puede consumir cientos de MiB y reducir la ventana por debajo de 131.072 tokens; con 1.266 MiB ocupados, 118.784 tokens no cargaron.
- El perfil "fast" con MTP reduce la ventana a 90.112 tokens y deja solo 210 MiB libres, lo que lo hace frágil ante cualquier otro consumo de GPU.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de benchmarks de razonamiento; el recall de 80/80 mide recuperación de hechos plantados, no veracidad.
- La licencia Apache 2.0 del derivado no exime de las obligaciones que pueda imponer la licencia del modelo base original de Qwen, no confirmada en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas reportadas, que proceden únicamente del pipeline del autor.
- El tamaño del repo (12,7 GB) incluye archivos auxiliares; el GGUF principal es de 11,60 GiB y conviene verificar el SHA256 antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/cmod/Qwen3.8-27B-ASCII-Condensed-Heretic-Q3_K_XL-GGUF
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- LoRA de abliteración (F16): incluida en el repositorio como `Qwen3.8-27B-Heretic-ablation-LoRA-F16.gguf`
- llama.cpp: no disponible en la información proporcionada
- Unsloth (referencia de cuantización UD-Q3_K_XL): no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
