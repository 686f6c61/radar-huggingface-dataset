# cmod/gemma4-e4b-rp-GGUF

## Resumen

gemma4-e4b-rp-GGUF es una compilación de rol (roleplay) del modelo Gemma 4 E4B-it de Google, publicada por el usuario cmod. Se distribuye en formato GGUF y está pensada específicamente para HermesVoice, un mod del videojuego RimWorld que dota de voz propia a los colonos. El modelo parte del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized` y le aplica tres transformaciones: eliminación de rechazos (abliteration), cuantización 4 bits alineada exactamente con la rejilla QAT de Google y poda del vocabulario a texto ASCII.

La arquitectura es Gemma 4 densa, con 42 capas, dimensión oculta de 2560, embeddings por capa (256 por capa), KV compartida en las últimas 18 capas y ventana deslizante de 512. El vocabulario se reduce de 262.144 a 158.191 tokens. Es un modelo solo de texto: no incorpora torre de visión ni de audio. El repositorio ocupa 3,7 GB y el archivo principal GGUF pesa 3.649.658.624 bytes.

Su relevancia es acotada pero clara: demuestra una técnica de cuantización que recupera los códigos enteros y escalas originales del entrenamiento QAT en lugar de recuantizar con llama.cpp, logrando una divergencia KL de 0,0007–0,0011 frente a BF16 (frente a 0,023–0,034 de la cuantización convencional). Está etiquetado como `not-for-all-audiences` y `uncensored`, y no está pensado como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 densa, 42 capas, hidden 2560, embeddings por capa (256 por capa), KV compartida en las últimas 18 capas, ventana deslizante 512 |
| Parametros totales | 9.779.200 (dato de safetensors del repo); el autor no detalla el recuento del checkpoint base |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | ventana deslizante de 512 por capa; el ejemplo de despliegue usa `-c 196608` con 3 slots de 64k |
| Tipos de cuantizacion | Q4_0 (cuerpo, embeddings incluidas), Q8_0 (22 matrices editadas por abliteration), BF16 (`per_layer_model_proj`), F32 (norms); LoRA de abliteration en GGUF aparte |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 densa del checkpoint base: 42 capas con dimensión oculta 2560, embeddings por capa de 256 dimensiones, atención con KV compartida en las últimas 18 capas y ventana deslizante de 512. Es un modelo solo de texto, sin torre de visión ni de audio. El checkpoint de partida es la versión QAT (quantization-aware training) de Google, entrenada específicamente para Q4_0: el 97 % de sus bloques de 32 pesos son exactamente `bf16(q·d)` con `q` entero en [−8, 7], embeddings incluidas.

Sobre esa base, el autor aplica tres modificaciones. Primero, una abliteration estilo Heretic con corrección ARA de rango 50 por matriz, ajustada mediante una búsqueda Optuna de 40 ensayos que minimiza rechazos y divergencia KL de texto simultáneamente; edita 22 matrices (`attn_output` y `ffn_down`) en las capas 20–30. Segundo, una cuantización que recupera los códigos enteros y escalas originales de cada bloque desde los pesos BF16 y los escribe directamente, sin imatrix, alcanzando una KLD media de 0,0007–0,0011 frente a BF16. Las 22 matrices editadas quedan fuera de la rejilla y se conservan en Q8_0 (+0,18 GB). Tercero, una poda de vocabulario que conserva tokens ASCII y de puntuación tipográfica común, más todos los de control y especiales; ambas tablas de vocabulario (`token_embd` y `per_layer_token_embd`) se recortan fila a fila de forma byte-exacta, con merges filtrados e ids de tokens especiales remapeados. La tokenización de texto ASCII es idéntica al modelo original (400/400 comprobados).

## Capacidades

- Generación de texto y diálogo multi-turno orientado a rol, con voces de personaje diferenciadas (bench HermesVoice M0: 0,947 frente a 0,909 del stock).
- Escritura de contenido adulto, violento y grim entre adultos, sin rechazos (0/100 en sonda de rol adulto; 1/100 en marcadores estrictos sobre conjunto dañino genérico).
- Roleplay de personajes en el contexto del mod RimWorld LLM (HermesVoice), con líneas de colonos.
- Generación de intenciones con gramática o esquema (26/30 con gramática, 13/30 con esquema en el bench M0).
- Modo thinking disponible en la plantilla de chat de Gemma 4, desactivado por defecto; el autor recomienda mantenerlo apagado para líneas cortas de diálogo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (idioma declarado: en); el vocabulario podado elimina tokens no ASCII salvo puntuación tipográfica.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Roleplay de personajes en RimWorld mediante el mod HermesVoice: el motor descarga el GGUF, selecciona el contexto según la GPU del usuario y arranca y detiene el servidor con el juego; el modelo genera las líneas de voz de cada colono con voces diferenciadas.
- Diálogo de personajes con contexto largo en videojuegos: el despliegue de referencia usa 3 slots de 64k (`-np 3 -c 196608`), lo que permite mantener varias conversaciones simultáneas con memoria extensa dentro de un presupuesto de 4,7 GB de VRAM.
- Generación de narrativa adulta o grim entre personajes ficticios: el modelo escribe contenido violento y sexual sin rechazos ni disclaimers (0/60 en líneas grim de RimWorld), adecuado para ficción interactiva dirigida a adultos.
- Prototipado de agentes conversacionales con gramática restringida: el bench M0 muestra 26/30 de precisión de intención con gramática, útil para forzar salidas estructuradas en motores de diálogo.
- Investigación sobre abliteration y cuantización QAT: el repositorio incluye la LoRA de eliminación de rechazos por separado (19,5 MB) y documenta la metodología de recuperación de la rejilla Q4_0, lo que sirve como referencia reproducible para estudiar edición de pesos y cuantización exacta.
- Despliegue en hardware de consumo para inferencia local de bajo coste: con 4,7 GB de VRAM en una RTX 5080 y 133 t/s de decodificación con 3 slots ocupados, encaja en tarjetas de gama media-alta para aplicaciones de texto en tiempo real.
- Generación de texto en inglés con huella de memoria reducida: la poda de vocabulario baja el RSS del host de 2.535 MiB a 1.761 MiB, útil en entornos con RAM limitada.

## Benchmarks y rendimiento

Datos medidos por el autor sobre las mismas prompts y texto; "stock" es el modelo QAT sin editar cuantizado del mismo modo (las filas de rechazo usaron un Q8_0 del stock).

| Métrica | stock E4B QAT | este modelo |
|---|---|---|
| Sonda de rol adulto, rechazos (100 prompts) | 100/100 | 0/100 (estricto 0, clasificador 0) |
| Conjunto dañino genérico (100): marcadores estrictos / clasificador de rechazo | 99 / 100 | 1 / 8 |
| Pide detalles en vez de escribir (sonda adulta) | 0/100 | 0/100 |
| KL del primer token en 100 prompts inocuos | 0 | 0,019 |
| Distinción de voz (bench HermesVoice M0) | 0,909 | 0,947 |
| Precisión de intención con gramática / esquema (M0) | 26/30, 14/30 | 26/30, 13/30 |
| Líneas grim de RimWorld (60): rechazo / disclaimer / moralina | 0 / 0 / 0 | 0 / 0 / 0 |
| Perplejidad en held-out: rol / RimWorld / general | 4,77 / 8,15 / 14,08 | 4,83 / 8,16 / 14,22 |
| KLD frente a stock BF16 antes de la poda: rol / RimWorld / general | 0,0007 / 0,0008 / 0,0011 | 0,020 / 0,007 / 0,015 |
| VRAM del servidor, `-np 3 -c 196608`, KV q4_0 (RTX 5080) | 4.676 MiB | 4.704 MiB |
| RAM del host (RSS) tras cargar | 2.535 MiB | 1.761 MiB |
| Decodificación, 3 slots ocupados / 1 slot (RTX 5080) | 127 / 149 t/s | 133 / 148 t/s |

La perplejidad del modelo podado se calcula sobre una tokenización ligeramente distinta de los caracteres no ASCII raros del texto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4.704 MiB con `-np 3 -c 196608` y KV en q4_0, medidos en una RTX 5080; el autor indica "unos 4,7 GB de VRAM con tres slots de 64k de contexto".
- GPU recomendadas: RTX 5080 como referencia medida; cualquier GPU con al menos 5 GB de VRAM libre debería poder ejecutar el despliegue de referencia, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, según la medición en RTX 5080; no se detallan otras GPU de consumo probadas.
- Opciones de despliegue: llama.cpp (probado en la release b12680 con CUDA); el autor indica que otros runtimes que sigan el soporte de Gemma 4 de llama.cpp deberían funcionar. Comando de referencia: `llama-server -m gemma-4-E4B-it-qat-rp-Q4_0.gguf -ngl 999 -np 3 -c 196608 -ctk q4_0 -ctv q4_0 --no-kv-unified -fa on --jinja --reasoning off`.
- Latencia y throughput: 133 t/s con 3 slots ocupados y 148 t/s con 1 slot en RTX 5080; el stock rinde 127 / 149 t/s.
- RAM del host: 1.761 MiB de RSS tras cargar, frente a 2.535 MiB del stock.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-e4b-rp-GGUF (este) | 9.779.200 (safetensors del repo) | ventana deslizante 512; despliegue con 3 slots de 64k | apache-2.0 | GGUF | Abliterado, vocabulario podado a ASCII, Q4_0 exacto sobre rejilla QAT |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (stock) | no disponible | no disponible | apache-2.0 (licencia Gemma 4) | safetensors BF16 | Checkpoint base sin editar; rechaza el 100/100 de la sonda adulta; KLD 0,0007–0,0011 frente a BF16 con la cuantización del autor |
| Stock E4B Q4_K_M (usado en el bench de HermesVoice) | no disponible | no disponible | apache-2.0 (licencia Gemma 4) | GGUF | Referencia del bench del juego; peor distinción de voz (0,909 frente a 0,947) y mayor KLD (0,023–0,034) con la cuantización convencional de llama.cpp |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está decensurado y escribirá contenido violento y sexual entre adultos; el autor lo declara no apto para menores y no es un asistente general.
- Riesgo de alucinación: no se han publicado mediciones específicas de factualidad; la perplejidad en texto general (14,22) es notablemente superior a la de rol (4,83), lo que sugiere menor fiabilidad fuera de dominios narrativos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de idioma: solo inglés; el vocabulario podado elimina tokens no ASCII salvo puntuación tipográfica común, por lo que el texto en otros idiomas se tokeniza de forma degradada.
- Limitaciones de contexto: ventana deslizante de 512 por capa; el contexto total útil depende de la configuración de slots del servidor.
- Restricciones de licencia: apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma 4 antes de un uso comercial.
- Caveats para producción: el modelo está afinado para el mod HermesVoice y el rol de personajes; su uso como asistente general no está validado. El modo thinking debe mantenerse desactivado para diálogo corto, y los prompts manuales deben terminar en `<|turn>model\n` (los modelos E empiezan a pensar igualmente si se prellena un bloque de pensamiento vacío). La perplejidad del modelo podado se calcula sobre una tokenización distinta de los caracteres no ASCII raros, por lo que no es estrictamente comparable con la del stock.

## Enlaces

- Hugging Face: https://huggingface.co/cmod/gemma4-e4b-rp-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Repositorio del mod HermesVoice (RimWorldLLM): https://github.com/CharlesMod/RimWorldLLM
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
