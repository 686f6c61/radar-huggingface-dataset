# Mr-ezdno/CYBER-FROST-3.8-Sushi-4bpw

## Resumen

CYBER-FROST-3.8-Sushi-4bpw es un empaquetado cuantizado en formato EXL3 del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, un fine-tune de Qwen3.8-Flash-Next con arquitectura Mixture of Experts (MoE) de 36.556.177.299 parámetros totales. Lo publica el usuario Mr-ezdno y no es un modelo nuevo: es una receta de cuantización pensada para reutilizar el runtime, los kernels y la tabla de decodificación especulativa n-gram del pack beamster/Qwen3.8-Flash-Next-Sushi-4bpw, sustituyendo únicamente los pesos que el fine-tune ha modificado respecto al maestro BF16.

La propuesta de valor es práctica: un pack autocontenido que evita descargar y recuantizar el maestro BF16 completo (repositorio de 170,8 GB) cuando solo una fracción de los pesos difiere. Los expertos enrutados de las 48 capas del decodificador más la capa MTP se recuantizaron a 4 bits por peso con exllamav3 1.6.2 sobre una RTX 5090, y el tronco (atención, normas y experto compartido) se reconstruyó en 8 bits afín con grupos g128/g64.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de cuantización incremental para fine-tunes MoE, y porque incluye mediciones verificables en Apple Silicon: 37 tok/s sostenidos en decodificación y 440 tok/s de prefill en un M2 Max de 96 GB, con decodificación especulativa MTP activa y ventana nativa de 262.144 tokens ampliable a 1M mediante YaRN ×4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 48 capas de decodificador más capa MTP; tronco con atención, normas y experto compartido |
| Parámetros totales | 36.556.177.299 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 1.048.576 con YaRN ×4 (config por defecto del pack) |
| Tipos de cuantización | EXL3 4 bits por peso en expertos enrutados (`-b 4.0 --out_scales always`); tronco en 8 bits afín g128/g64; KV cache cuantizable a 8 bits en el runtime |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de CYBER-FROST-3.8-BF16 y de la base Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors en disposición sushi (`model-exl3-L*-{gate,up,down}.safetensors`, `model-trunk-*.safetensors`, `model-mtp.safetensors`, `model-embed.safetensors`, `model-lm-head.safetensors`) más `ngram_table.bin` para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE de 36,56 mil millones de parámetros totales derivado de Qwen3.8-Flash-Next, con 48 capas de decodificador y una capa MTP (multi-token prediction) que alimenta la decodificación especulativa. El pack separa explícitamente los expertos enrutados del tronco: los expertos se recuantizaron desde los pesos BF16 de CYBER-FROST con exllamav3 1.6.2, mientras que el tronco se reconstruyó con `build_trunk.py` en 8 bits afín. Los ficheros `model-embed.safetensors`, `model-lm-head.safetensors`, el tokenizer y `ngram_table.bin` son idénticos byte a byte al pack sushi base, porque el fine-tune no los modifica.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original. La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: cuantización incremental selectiva que conserva la ruta de kernels y la tabla n-gram del pack base, y verificación mediante un arnés de divergencia KL sobre 16 prompts. El autor reporta KLD medio de 0,137 frente al maestro base, advirtiendo que esa cifra mezcla el delta del fine-tune con el error de cuantización y no es una métrica pura de cuantización. Se incluye además una variante de configuración con RoPE nativo (`config.native-rope.json`) que evita aplicar YaRN en prompts cortos, con una mejora medida pequeña pero consistente (KLD 0,1341 frente a 0,1415).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable: desde la versión 1.3.0 del runtime, una petición sin campo de thinking razona a esfuerzo `medium` con tope de 8192 tokens; se desactiva con `reasoning_effort: "none"` o `enable_thinking: false`.
- Procesamiento de visión: la batería de 11 comprobaciones de comportamiento del autor incluye una prueba de visión superada, además de llamadas a herramientas y recuperación de aguja (needle retrieval) a 34.000 tokens.
- Tool calling y function calling, verificado en la misma batería de comportamiento.
- Decodificación especulativa MTP con profundidad configurable (`--mtp-max-depth 4`) y modo de aceptación con pérdida (`--mtp-typical 0.2`) que incrementa un 15-20 % la decodificación muestreada sin afectar a la salida greedy.
- Contexto largo: ventana nativa de 262.144 tokens y extensión a 1M con YaRN ×4.
- Capacidades multilingües: no disponible en la información proporcionada.
- Sin soporte declarado de audio ni de otras modalidades más allá de visión.

## Casos de uso

- Asistente de razonamiento de contexto largo en estación de trabajo Apple Silicon: con 262.144 tokens nativos y un TTFT medido de 90 s a 40.000 tokens, encaja en análisis de documentación extensa, auditoría de contratos o revisión de codebases completos en local.
- Agentes con tool calling en producción interna: la verificación de llamadas a herramientas y la decodificación especulativa MTP permiten cadenas de varios pasos con latencia de decodificación de ~37 tok/s sin depender de APIs externas.
- Análisis de documentos con componente visual: la capacidad de visión verificada permite procesar capturas, diagramas o páginas escaneadas junto al texto en la misma ventana.
- Fine-tuning y experimentación sobre MoE: al ser un pack autocontenido con receta de recuantización documentada, sirve para comparar el efecto del delta de un fine-tune frente al maestro BF16 usando el mismo runtime y la misma tabla especulativa.
- Despliegue en Mac de 96 GB o más como servidor de inferencia personal: el consumo medido es de 43,5 GB de RSS con KV en 8 bits, lo que deja margen para contexto largo en una única máquina.
- Evaluación de precisión de cuantizaciones: los datos de KLD por prompt y la comparativa YaRN frente a RoPE nativo permiten reproducir el arnés y medir el impacto de la configuración de RoPE en otros packs de la misma familia.
- Recuperación de información sobre corpus masivos: la prueba de needle retrieval a 34.000 tokens respalda casos de búsqueda semántica dentro de documentos muy largos sin troceado.

## Benchmarks y rendimiento

Métricas publicadas por el autor, medidas en un M2 Max de 96 GB con sushi 1.3.0, 16 prompts de 512 tokens, KV en 8 bits y temperatura 1:

| Métrica | YaRN ×4 (config por defecto) | RoPE nativo |
|---|---:|---:|
| KLD media frente al maestro BF16 | 0,1415 | 0,1341 |
| KLD hasta el primer EOS | 0,1219 | 0,1135 |
| Top-1 | 89,5 % | 89,8 % |

| Métrica de serving | Valor |
|---|---|
| Decodificación sostenida (prompts de 40K, mediana de 3 ejecuciones) | ≈37 tok/s (pico ≈40 en prompts cortos) |
| Decodificación con MTP en M2 Max de 32 GB | 29-61 tok/s; aceptación 48-100 % en prompts cortos |
| Prefill | ≈440 tok/s |
| Time to first token a 40K de contexto | ≈90 s |
| KLD media frente al maestro base (16 prompts) | 0,137 |

Datos de terceros citados en la model card, referidos al pack Sushi-4bpw estándar y no a este: MMLU-Pro 68,64 % con YaRN frente a 68,79 % con RoPE nativo (medición de chatnerdie), y estimación de que YaRN explica alrededor del 40 % del KLD en ese pack. No se han publicado resultados de benchmarks propios de este modelo en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no se publica una cifra de VRAM. Como referencia medida, el pack arranca y sirve con unos 43,5 GB de RSS en memoria unificada con KV en 8 bits y 32 GB fijados al runtime.
- Tamaño en disco: safetensors ≈68,4 GB según la model card, dentro de un repositorio de 170,8 GB que incluye recursos de vídeo y otros ficheros.
- GPU recomendadas: no hay datos publicados de inferencia en CUDA. La cuantización se generó en una RTX 5090 con exllamav3 1.6.2, lo que confirma compatibilidad del formato con esa ruta; no se aportan tasas de decodificación para CUDA.
- ¿Cabe en GPU de consumo? Con 68,4 GB de pesos no cabe en GPUs de 24 GB ni de 32 GB sin técnicas de offload no documentadas. La verificación del autor se hizo en Apple Silicon con 96 GB (y una prueba de arranque en 32 GB con memoria fijada).
- Opciones de despliegue: runtime sushi (Apple Silicon), invocado como `sushi serve`; exllamav3 en CUDA. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas, y no hay soporte declarado para vLLM o TGI con este formato.
- Latencia y throughput: 37 tok/s de decodificación sostenida y 440 tok/s de prefill en M2 Max de 96 GB; 90 s de TTFT a 40K de contexto. El autor señala que en Apple Silicon la decodificación está limitada por latencia y no por ancho de banda, ya que un pack de 3 bits del mismo modelo no resultó más rápido (≈36 frente a ≈37 tok/s a 40K).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-Sushi-4bpw (este) | 36,56 mil millones | 262.144 nativo / 1M con YaRN | EXL3 4bpw + tronco 8 bits | other | 292 descargas, 1 like |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 (maestro) | no disponible en la información | no disponible | BF16 safetensors | other | referenciado como base, revisión `3e30d25` |
| beamster/Qwen3.8-Flash-Next-Sushi-4bpw | no disponible | no disponible | EXL3 4bpw sushi | heredada de Qwen3.8-Flash-Next | pack de referencia del que se reutilizan embed, lm-head, tokenizer y tabla n-gram |
| chatnerdie/Qwen3.8-Flash-Next-EXL3-Sushi | no disponible | no disponible | EXL3 sushi | heredada de Qwen3.8-Flash-Next | citado por medir el efecto de YaRN en packs sushi |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas más allá de lo indicado, por lo que la comparación cuantitativa se limita al KLD y al MMLU-Pro citados en la sección anterior.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero ni un fine-tune original: es una recuantización. Cualquier mérito o defecto de comportamiento proviene de CYBER-FROST-3.8 y, en última instancia, de Qwen3.8-Flash-Next.
- La licencia es `other` y remite a los términos del modelo base Qwen3.8-Flash-Next; no se detallan en esta ficha las condiciones de uso comercial. Es imprescindible revisar ambas licencias antes de un despliegue en producción.
- El KLD de 0,137 frente al maestro no es una métrica limpia de cuantización: incluye el delta del fine-tune. No debe usarse para comparar calidades de cuantización entre packs distintos.
- Inconsistencia de cifras a verificar antes de descargar: la model card cita 95,4 GiB para `ngram_table.bin`, mientras que el total de safetensors es de ≈68,4 GB y el repositorio completo ocupa 170,8 GB. Conviene comprobar el tamaño real de los ficheros.
- Por defecto el pack activa YaRN ×4 en todas las longitudes, incluso en prompts cortos, lo que degrada ligeramente la fidelidad frente a RoPE nativo (KLD 0,1415 frente a 0,1341). Si no se necesita más de 262K de contexto, hay que sustituir `config.json` por `config.native-rope.json`.
- Cambio de comportamiento en sushi 1.3.0: las peticiones sin campo de thinking razonan a esfuerzo `medium` con hasta 8192 tokens, lo que añade latencia y coste si no se desactiva explícitamente.
- `--mtp-typical 0.2` es un modo de aceptación con pérdida: a temperatura mayor que cero la salida no es idéntica a la del camino exacto, aunque a temperatura 0 se usa la ruta exacta.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; aplican los del modelo base.
- Idiomas soportados no declarados, por lo que el rendimiento fuera de los idiomas del modelo original es desconocido.
- Rendimiento verificado únicamente en Apple Silicon. No hay cifras publicadas de latencia o throughput en CUDA, y la ruta de despliegue está atada al ecosistema exllamav3/sushi.
- Ecosistema muy nicho: 292 descargas y 1 like en el momento de la consulta, lo que implica poca validación externa.

## Enlaces

- HuggingFace del pack: https://huggingface.co/Mr-ezdno/CYBER-FROST-3.8-Sushi-4bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Pack sushi de referencia: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-4bpw
- Medición del efecto YaRN en packs sushi: https://huggingface.co/chatnerdie/Qwen3.8-Flash-Next-EXL3-Sushi
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
- Organización Qwen: https://huggingface.co/Qwen
- Configuración de RoPE nativo: https://huggingface.co/Mr-ezdno/CYBER-FROST-3.8-Sushi-4bpw/blob/main/config.native-rope.json
- Resultados del arnés KLD: https://huggingface.co/Mr-ezdno/CYBER-FROST-3.8-Sushi-4bpw/blob/main/kld-cf-vs-base.json

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces anteriores proceden exclusivamente de la model card y del identificador de HuggingFace.
