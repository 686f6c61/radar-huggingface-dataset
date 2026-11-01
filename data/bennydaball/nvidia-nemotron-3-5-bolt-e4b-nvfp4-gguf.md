# BennyDaBall/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF es una cuantización no oficial en formato GGUF del modelo NVIDIA Nemotron 3.5 Bolt E4B, creada por el usuario BennyDaBall a partir de los pesos BF16 oficiales de NVIDIA. El modelo base, post-entrenado desde Gemma 4 E4B de Google, es multimodal (image-text-to-text) y esta cuantización busca cubrir un hueco: NVIDIA distribuye el modelo principal en BF16 y en GGUF Q4_K_M, pero el único archivo NVFP4 oficial corresponde al drafter DFlash, no al modelo principal.

La relevancia de esta ficha radica en la calidad de la cuantización: el autor aplica GPTQ con la técnica Four Over Six (arXiv 2512.02010, MIT Han Lab + NVIDIA) integrada dentro del bucle GPTQ, y mantiene en Q8_0 las capas más sensibles identificadas mediante un barrido de KLD por capa. El resultado es un archivo de 5,63 GB con un KLD medio de 0,038 frente al BF16, muy por debajo del 0,102 del Q4_K_M oficial y de menor tamaño (5,63 GB frente a 6,18 GB).

En cuanto a rendimiento, medido por el autor en una RTX 5090 con llama.cpp b11856, el modelo alcanza unos 240 tok/s de decodificación en solitario y hasta 550 tok/s combinado con el drafter DFlash de NVIDIA mediante decodificación especulativa, con un prefill de 15.346 tok/s en prompts de 512 tokens. El contexto entrenado es de 65.536 tokens y el pipeline es de imagen-texto a texto, con soporte experimental de audio en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Gemma 4 E4B post-entrenado por NVIDIA), con capas de reutilización de K/V y proyección por capa (per-layer) |
| Parametros totales | 7.463.019.215 |
| Parametros activos | no disponible (no se indica si es MoE; el sufijo E4B sugiere 4B activos, pero no está confirmado en la información) |
| Longitud de contexto | 65.536 tokens (entrenado) |
| Tipos de cuantizacion | NVFP4 (W4A16, con escalas por tensor) + Q8_0 en capas sensibles + Q6_K en embeddings; mezcla NVFP4/Q8_0 |
| Idiomas soportados | Inglés (etiquetado en la ficha; el modelo base puede soportar más idiomas, no disponible en la información) |
| Licencia | openmdw-1.1 (OpenMDW 1.1) |
| Formato de pesos | GGUF (cuantizado desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3.5 Bolt E4B, es un transformer decoder post-entrenado por NVIDIA desde Gemma 4 E4B de Google. La arquitectura presenta dos rasgos destacables que condicionan la cuantización: las capas 24 a 41 reutilizan los tensores K/V de los bloques 22 y 23, y existe un mecanismo de embedding por capa (per-layer token embedding) con su propia puerta de entrada y proyección. Incluye un canal de "thinking" (razonamiento) que requiere la plantilla de chat de NVIDIA y el flag `--jinja` en llama.cpp para parsearse correctamente.

Sobre este base, el autor construyó la cuantización en tres pasos. Primero, GPTQ (Frantar et al., 2022) sobre todas las lineales del decoder, con 621 muestras de calibración de 2.048 tokens generadas por el propio modelo BF16 con thinking activado (matemáticas, código, chat, tool use, multilingüe y 10 % de texto plano), hessianas en FP32, damping 0,01 y bloques perezosos de 128. Segundo, la técnica Four Over Six (Cook et al., arXiv 2512.02010): dado que FP4 no tiene valor entre 4 y 6, cada bloque de 16 pesos prueba ambas escalas (map-to-6 y map-to-4) y conserva la de menor error; la innovación del autor es tomar esa decisión dentro del bucle GPTQ en lugar de por adelantado, lo que mejoró el KLD de 0,070 a 0,066, con un 42 % de bloques eligiendo map-to-4. Tercero, las capas más sensibles (los bloques 16-24, 9 bloques en total, más todos los attn_k/attn_v y las puertas/proyecciones por capa) se mantienen en Q8_0, y los embeddings en Q6_K. Los 36 tensores K/V nunca usados de las capas con KV compartida se omiten del archivo. Todos los tensores NVFP4 van etiquetados W4A16, de modo que en Blackwell llama.cpp usa activaciones de 8 bits por defecto.

## Capacidades

- Generación de texto conversacional con canal de razonamiento (thinking mode) de Gemma 4, activable y parseable con `--jinja`.
- Comprensión multimodal de imágenes (pipeline image-text-to-text) mediante el archivo mmproj incluido en BF16.
- Entrada de audio, marcada como experimental en llama.cpp (proyector de audio incluido en el mmproj).
- Razonamiento matemático y generación de código (usados como dominios de calibración y evaluación por el autor).
- Soporte de tool calling / function calling: la plantilla de chat oficial de NVIDIA incluye tool use y este dominio formó parte de la calibración de GPTQ.
- Razonamiento multi-paso y agentes: el canal thinking y el entrenamiento con tool use del modelo base lo hacen apto para flujos multi-step.
- Capacidades multilingües parciales: el conjunto de calibración incluye datos multilingües, aunque el modelo está etiquetado solo como inglés.
- Decodificación especulativa nativa mediante el drafter DFlash de NVIDIA (hasta 550 tok/s medidos).

## Casos de uso

- Chatbots y asistentes locales con razonamiento: el canal thinking y los 65.536 tokens de contexto permiten conversaciones multi-turno largas con razonamiento visible, ejecutándose íntegramente en una sola GPU de consumo (5,63 GB de pesos).
- Asistentes multimodales de escritorio: con el mmproj BF16 incluido, se pueden construir aplicaciones que describan imágenes, extraigan texto de capturas o respondan preguntas sobre documentos escaneados desde LM Studio o llama-server.
- Generación y revisión de código en local: el modelo se calibró con generaciones propias de código con thinking activado, adecuado para autocompletado, revisión de pull requests y refactorización con contexto de repositorio de hasta 64K tokens.
- Agentes con tool calling: la plantilla de chat oficial soporta function calling, lo que permite integrarlo en pipelines de orquestación de herramientas (búsqueda, ejecución de código, APIs) con llama-server como backend OpenAI-compatible.
- Inferencia de alto throughput en hardware Blackwell: los kernels FP4 nativos de Blackwell y la decodificación especulativa con DFlash (550 tok/s) lo hacen idóneo para servidores locales de baja latencia que atienden a un usuario o pocos usuarios concurrentes.
- Transcripción y análisis de audio experimental: el proyector de audio permite prototipar aplicaciones de entrada por voz, asumiendo el carácter experimental del soporte en llama.cpp.
- Investigación en cuantización: la documentación detallada del proceso (GPTQ + Four Over Six integrado, barrido de KLD por capa) sirve como referencia reproducible para estudios de cuantización NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica mediciones propias de calidad de cuantización (KLD frente a BF16) y de velocidad:

| Métrica | Este archivo (NVFP4) | NVIDIA Q4_K_M (oficial) |
|---|---:|---:|
| Tamaño de archivo | 5,63 GB | 6,18 GB |
| KLD medio vs BF16 (menor es mejor) | 0,038 | 0,102 |
| Coincidencia del top token con BF16 | 93,9 % | 90,0 % |
| Decode, 1 usuario, sin drafter | 240 tok/s | 243 tok/s |
| Decode, 1 usuario, con drafter DFlash | 550 tok/s | 526 tok/s |
| Prefill, prompt de 512 tokens | 15.346 tok/s | 17.542 tok/s |
| KLD percentil 99 | 0,50 | 1,26 |

Condiciones de medición: RTX 5090, llama.cpp b11856 (build oficial CUDA 13.4), decodificación greedy, thinking activado, mediana de 9 peticiones (matemáticas, código y chat), las cuatro configuraciones medidas de forma consecutiva. Con activaciones forzadas a 4 bits (`GGML_CUDA_MMQ_PREC=q4`) el KLD sube a 0,090.

Escalera de calidad de la construcción (KLD vs BF16 sobre 61.440 tokens reservados de wikitext-2, chat y código):

| Build | Tamaño | KLD medio | KLD p99 |
|---|---:|---:|---:|
| NVFP4 RTN plano (llama-quantize) | 5,21 GB | 0,215 | 2,54 |
| + escala por tensor (RTN de dos niveles) | 5,18 GB | 0,186 | 2,25 |
| + Four Over Six (RTN) | 5,18 GB | 0,166 | 2,03 |
| GPTQ (escalas estáticas) | 5,18 GB | 0,077 | 0,95 |
| GPTQ + Four Over Six | 5,18 GB | 0,066 | 0,86 |
| + capas sensibles en Q8_0 (este archivo) | 5,63 GB | 0,038 | 0,50 |
| NVIDIA Q4_K_M (oficial) | 6,18 GB | 0,102 | 1,26 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5,63 GB solo para los pesos del modelo de texto, más unos 0,99 GB si se carga el mmproj para visión/audio, más la caché KV y el drafter DFlash (4 GB según su denominación oficial). Un despliegue completo con drafter y contexto de 16K cabe cómodamente en 12-16 GB de VRAM.
- GPU recomendadas: RTX 5090 (hardware usado en las mediciones del autor, con kernels FP4 nativos de Blackwell). En Blackwell (RTX 50xx) se aprovechan los kernels FP4 y las activaciones de 8 bits por defecto (W4A16).
- Consumer GPUs: sí. Cabe en una RTX 4090, RTX 3090 o incluso tarjetas de 8 GB si se prescinde del drafter y se ajusta el contexto, aunque los kernels FP4 optimizados son específicos de Blackwell; en arquitecturas anteriores el rendimiento será menor.
- Opciones de despliegue: llama.cpp (b11856 o superior, obligatorio por las escalas por tensor NVFP4, etiquetas W4A16 y kernels nativos de Blackwell; builds antiguos pueden cargar el archivo pero producir salida incorrecta), llama-server con decodificación especulativa DFlash, y LM Studio (verificado con el runtime CUDA 12 de llama.cpp 2.64.0).
- Latencia y throughput estimados: en RTX 5090, 240 tok/s de decode sin drafter, 550 tok/s con DFlash, y 15.346 tok/s de prefill en prompts de 512 tokens (mediana de 9 peticiones, greedy, thinking activado).
- Comando de referencia con drafter: `llama-server -m NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4.gguf --spec-draft-model Nemotron-3.5-Bolt-E4B-DFlash-BF16.gguf --spec-type draft-dflash --spec-draft-n-max 7 --spec-draft-ngl 999 -ngl 999 -fa on --jinja -c 16384 --parallel 1`, añadiendo `--mmproj` para imágenes y audio.

## Comparativa con modelos similares

| | Este archivo (NVFP4 GGUF) | NVIDIA Q4_K_M oficial | NVIDIA BF16 oficial |
|---|---|---|---|
| Tamaño | 5,63 GB | 6,18 GB | no disponible |
| KLD vs BF16 | 0,038 | 0,102 | 0 (referencia) |
| Top token igual a BF16 | 93,9 % | 90,0 % | 100 % |
| Decode con DFlash | 550 tok/s | 526 tok/s | no disponible |
| Cuantización | NVFP4 + Q8_0 + Q6_K | Q4_K_M | BF16 |
| Licencia | openmdw-1.1 | openmdw-1.1 | openmdw-1.1 |
| Disponibilidad | HuggingFace (comunidad) | HuggingFace (NVIDIA) | HuggingFace (NVIDIA) |

Como alternativa de categoría similar (modelo cuantizado multimodal de ~7B para llama.cpp) pueden considerarse las cuantizaciones GGUF de Gemma 3 4B/12B o Qwen3-VL, pero no se dispone de datos comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- Versión no oficial: se trata de una cuantización de la comunidad, no de NVIDIA. La calidad depende del proceso del autor, aunque está documentada con verificación bit-exacta y sumas SHA256.
- Requiere llama.cpp b11856 o superior: builds antiguos pueden cargar el archivo y generar salida incorrecta sin aviso, un riesgo silencioso en producción.
- Sesgos: hereda los sesgos del modelo base Gemma 4 E4B y del post-entrenamiento de NVIDIA; no se documentan auditorías de sesgo en la información disponible.
- Alucinaciones: como todo modelo de lenguaje de este tamaño, puede alucinar; el canal thinking puede mitigar parcialmente errores de razonamiento pero no los elimina.
- Idioma: el modelo está etiquetado solo como inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado en la información disponible, pese a que la calibración incluyó datos multilingües.
- Audio experimental: la entrada de audio está marcada como experimental en llama.cpp; no usar en producción sin validación.
- Rendimiento dependiente de hardware: los kernels FP4 nativos y las activaciones de 8 bits por defecto son específicos de Blackwell; en otras GPUs el rendimiento y posiblemente la calidad numérica pueden variar. Forzar activaciones a 4 bits (`GGML_CUDA_MMQ_PREC=q4`) degrada el KLD a 0,090.
- Contexto: entrenado a 65.536 tokens; el comando de referencia usa 16.384, y contextos mayores incrementarán los requisitos de VRAM por la caché KV.
- Licencia openmdw-1.1: es una licencia permisiva tipo OpenMDW, pero conviene revisar sus términos exactos (https://openmdw.ai/license/1-1/) antes de uso comercial.
- Las mediciones de velocidad son del autor en una RTX 5090 concreta con configuración específica (greedy, thinking on, mediana de 9 peticiones); los resultados en otros entornos pueden diferir.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/BennyDaBall/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Modelo base oficial de NVIDIA (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Paper Four Over Six (Cook et al., MIT Han Lab + NVIDIA): https://arxiv.org/abs/2512.02010
- Paper GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
