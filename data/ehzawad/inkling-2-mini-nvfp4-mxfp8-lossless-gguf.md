# ehzawad/Inkling-2-Mini-NVFP4-MXFP8-Lossless-GGUF

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) con arquitectura de capas recurrentes ("looped") desarrollado por Thinking Machines. El modelo base cuenta con 26.400 millones de parametros totales, 24 capas (de las cuales las capas 6 a 17 se ejecutan tres veces por token), 128 expertos con top-8 y 3.400 millones de parametros activos por token. Acepta entrada de texto e imagen, lo que lo situa en la categoria image-text-to-text.

El repositorio que nos ocupa, publicado por el usuario ehzawad, no es el modelo original sino una cuantizacion GGUF del mismo, empaquetada especificamente para tarjetas NVIDIA de 32 GB. La cuantizacion combina NVFP4 y MXFP8 y el autor la califica de "lossless" (sin perdida) porque los pesos resultantes son byte-identicos a los oficiales: la divergencia KL media frente al checkpoint original es 0,0000 en los tres dominios evaluados (prosa, codigo y chat). Ocupa 20,48 GiB en GPU (fichero de 22,92 GB) y permite ejecutar 128.000 tokens de contexto con vision activa en una tarjeta de 32 GB mediante llama.cpp.

Es relevante ahora porque demuestra que es posible mantener la fidelidad numerica del modelo original en un formato GGUF mientras se reduce el requisito de VRAM hasta el rango de GPUs de consumo alto (RTX 5090) y profesionales (A100, RTX 6000 Ada), con un motor de inferencia de codigo abierto y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (24 capas; capas 6-17 ejecutadas 3 veces por token), 128 expertos top-8 |
| Parametros totales | 26.070.390.272 (26,07B) |
| Parametros activos | 3,4B por token |
| Longitud de contexto | 128K tokens (131.072) con cache KV q8_0 y proyector de vision en GPU |
| Tipos de cuantizacion | NVFP4-MXFP8 (lossless); el repositorio incluye ademas variantes IQ2_XXS, IQ3_XXS, Q3_K_XL y NVFP4-Q8_0 en repos separados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero principal de 22,92 GB y proyector de vision mmproj Q8_0 de 0,35 GB |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos con 128 expertos y enrutamiento top-8, sobre 24 capas de atencion. La innovacion estructural principal es el bucle de capas: las capas 6 a 17 se ejecutan tres veces por token, lo que incrementa la profundidad efectiva de computo sin aumentar el numero de parametros. El modelo combina atencion global con capas de ventana deslizante (sliding-window), y el sesgo de posicion relativa hace que el buffer de computo crezca con el producto de ubatch y contexto. Dispone de un proyector de vision separado para la entrada de imagenes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. El autor de la cuantizacion menciona que el modelo soporta un parametro de esfuerzo de razonamiento (`reasoning_effort`) con seis niveles (none, minimal, low, medium, high, xhigh; por defecto high), lo que sugiere un entrenamiento orientado a razonamiento configurable, pero no se detallan los detalles del mismo. La decodificacion especulativa (DSpark) esta prevista con drafters publicados por unsloth y drofn, aunque estos no cargan aun en llama.cpp mainline por desajuste de formas de tensor.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat compatible con la API de OpenAI.
- Razonamiento configurable mediante el argumento `reasoning_effort` (seis niveles).
- Entrada de imagen junto con texto (image-text-to-text) mediante el proyector mmproj Q8_0.
- Razonamiento cientifico y de dominio evaluado en GPQA Diamond.
- Razonamiento multimodal evaluado en MMMU-Pro con imagenes.
- Capacidad de codigo (evaluada en el dominio de codigo del analisis de divergencia KL).
- Contexto largo de hasta 128K tokens.
- Soporte de plantilla Jinja (`--jinja`), necesaria para chat, imagenes y esfuerzo de razonamiento.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico asistido: el modelo obtiene 34/40 en la porcion de GPQA Diamond evaluada, por lo que es adecuado para responder preguntas de nivel posgrado en fisica, quimica y biologia con esfuerzo de razonamiento alto.
- Analisis de documentos con imagenes: gracias al proyector de vision y a los 128K tokens de contexto, puede procesar capturas, graficos o diagramas junto con texto largo en una sola pasada.
- Asistente conversacional de contexto largo: con 128K tokens y cache KV q8_0 puede mantener conversaciones multi-turno con historiales extensos o documentos completos adjuntos.
- Generacion y revision de codigo: el modelo conserva fidelidad numerica en el dominio de codigo (KLD 0,0000 frente al original) y puede integrarse en flujos de revision o generacion asistida.
- Despliegue en estaciones de trabajo con GPU unica: al caber en 32 GB con vision y contexto completo, es viable para prototipos y demos locales sin infraestructura multinodo.
- Evaluacion comparativa de cuantizaciones: al ser byte-identico al original, sirve como referencia para medir la perdida de otras cuantizaciones del mismo modelo (IQ2_XXS, IQ3_XXS, Q3_K_XL, NVFP4-Q8_0).
- Servicio local con API compatible con OpenAI: mediante `llama-server` se expone en `http://127.0.0.1:8080/v1` para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

Los datos disponibles son una porcion reducida de la tabla de Thinking Machines, con esfuerzo de razonamiento `low`, temperatura 0 y maximo de 6.144 tokens. Las muestras son pequenas (una pregunta equivale a 1,4 puntos), por lo que las diferencias de pocas preguntas estan dentro del ruido.

| Modelo | GPQA Diamond (40) | MMMU-Pro (30) | Total (hardware) |
|---|---|---|---|
| Este fichero (NVFP4-MXFP8) | 34/40 (85,0%) | 22/30 (73,3%) | 56/70 (L4) |
| Original (lossless) | 34/40 (85,0%) | 22/30 (73,3%) | 56/70 (L4) |

Thinking Machines reporta 86,6% en GPQA Diamond y 74,9% en MMMU-Pro para el original con los benchmarks completos y sus propios ajustes.

Calidad de la cuantizacion (divergencia KL frente al original, llama-perplexity, contexto de 4.096 tokens, 16.384 tokens puntuados por dominio):

| Modelo | Pesos en GPU | Prosa (WikiText-2) | Codigo | Chat (UltraChat) |
|---|---|---|---|---|
| Este fichero | 20,48 GiB | 0 / 100% / 1,0000 | 0 / 100% / 1,0000 | 0 / 100% / 1,0000 |
| Original (lossless) | 20,48 GiB | 0 / 100% / 1,0000 | 0 / 100% / 1,0000 | 0 / 100% / 1,0000 |

## Requisitos de hardware

- VRAM estimada en GPU: 20,48 GiB de pesos; pico medido de 22.270 MiB (21,75 GiB) a 16K de contexto y 26.078 MiB (25,47 GiB) a 128K, con cache KV q8_0, flash attention y proyector Q8_0 en GPU.
- GPU recomendadas: RTX 5090, A100 40/80 GB, RTX 6000 Ada, RTX PRO 6000. El autor cita tarjetas de 32 GB como objetivo.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB). En tarjetas de 8 GB se puede ejecutar con `--n-cpu-moe N` (expertos en CPU, mas lento).
- Opciones de despliegue: llama.cpp mainline >= b12611 (probado en b12653, commit 7d9b931) mediante `llama-server` con API compatible con OpenAI. Requiere `--jinja`. El proyector de vision procede de ggml-org/Inkling-2-Mini-GGUF.
- Ajustes criticos: mantener `-ub` pequeno en contexto largo (a 64K, `-ub 512` necesita unos 6 GiB mas que `-ub 16`); `--no-mmproj-offload` ahorra unos 0,4 GiB manteniendo el codificador de vision en CPU; `-np 1` evita slots adicionales.
- Cache KV: q8_0 cuesta aproximadamente 17 KB por token para las 8 cachees de atencion global; las capas de ventana deslizante usan un anillo fijo.
- Latencia y throughput: no disponible en la informacion proporcionada (solo se indica que un `-ub` mayor acelera el prefill).
- Decodificacion especulativa: los drafters publicados (unsloth, drofn) no cargan aun en llama.cpp mainline por desajuste de formas de tensor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini NVFP4-MXFP8 (este repo) | 26,07B | 3,4B | 128K | Apache-2.0 | GGUF | Lossless, 20,48 GiB en GPU, vision |
| Inkling-2-Mini NVFP4-Q8_0 (24 GB) | 26,07B | 3,4B | 128K | Apache-2.0 | GGUF | KLD 0,0019, 16,92 GiB, 56/70 |
| Inkling-2-Mini Q3_K_XL-NVFP4 (16 GB) | 26,07B | 3,4B | 128K | Apache-2.0 | GGUF | KLD 0,0068, 12,50 GiB, 56/70 |
| Inkling-2-Mini IQ2_XXS-NVFP4 (12 GB) | 26,07B | 3,4B | 128K | Apache-2.0 | GGUF | KLD 0,0423, 7,93 GiB, 53/70 |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otros desarrolladores comparables en la informacion proporcionada, por lo que la comparativa se limita a las distintas cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente (creada el 23 de noviembre de 2026) sin validacion comunitaria amplia.
- Los benchmarks presentados son porciones muy reducidas (40 y 30 items); una sola pregunta equivale a 1,4 puntos y las diferencias de pocas preguntas estan dentro del ruido estadistico.
- La decodificacion especulativa (DSpark) no funciona aun con los drafters publicados en llama.cpp mainline; requiere el motor especifico de sus tarjetas.
- El rendimiento en contexto largo depende criticamente de mantener `-ub` bajo; un valor alto puede agotar la VRAM.
- En tarjetas que tambien gestionan pantalla se recomienda dejar unos 0,5 GiB de margen por el compositor y otras aplicaciones.
- Idiomas soportados: no disponible; no se puede confirmar el comportamiento multilingue.
- Tool calling, soporte de agentes y sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el proyector de vision deben verificarse por separado (el proyector procede de ggml-org/Inkling-2-Mini-GGUF, tambien Apache-2.0).
- La cuantizacion "lossless" se refiere a los pesos byte-identicos al original; el autor no detalla el metodo exacto de empaquetado NVFP4-MXFP8 mas alla de la equivalencia numerica medida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ehzawad/Inkling-2-Mini-NVFP4-MXFP8-Lossless-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion 12 GB IQ2_XXS: https://huggingface.co/ehzawad/Inkling-2-Mini-IQ2_XXS-NVFP4-12GB-GGUF
- Cuantizacion 12 GB IQ3_XXS: https://huggingface.co/ehzawad/Inkling-2-Mini-IQ3_XXS-NVFP4-12GB-GGUF
- Cuantizacion 16 GB Q3_K_XL: https://huggingface.co/ehzawad/Inkling-2-Mini-Q3_K_XL-NVFP4-16GB-GGUF
- Cuantizacion 24 GB NVFP4-Q8_0: https://huggingface.co/ehzawad/Inkling-2-Mini-NVFP4-Q8_0-24GB-GGUF
- Proyector de vision (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
