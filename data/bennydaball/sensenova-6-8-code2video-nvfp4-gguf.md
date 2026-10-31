# BennyDaBall/SenseNova-6.8-Code2Video-NVFP4-GGUF

## Resumen

SenseNova-6.8-Code2Video-NVFP4-GGUF es una cuantización comunitaria, publicada por el usuario BennyDaBall, del modelo **SenseNova 6.8 Code2Video** de SenseNova, un fine-tune de Qwen3.8-27B especializado en generar y renderizar vídeos mediante código. El modelo original escribe código (por ejemplo, con Claude Code como harness recomendado) que produce películas o vídeos completos, y revisa sus propios fotogramas renderizados gracias a su componente de visión (image-text-to-text).

Esta versión en formato GGUF usa cuantización **NVFP4** (4 bits) combinada con GPTQ y la técnica de Schur Replay, más una mezcla medida de tensores en Q8_0 y la cabeza de multi-token-prediction (MTP) en BF16. El resultado cabe en una única GPU de consumo de 32 GB con contexto de 131k tokens, manteniendo una calidad cercana al BF16 (KLD de 0,124) y una decodificación rápida de unos 157 tok/s con MTP activado en una RTX 5090. Es relevante para desarrolladores que quieran ejecutar localmente un modelo de generación de vídeo vía código sin necesidad de hardware de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.8-27B) con visión (image-text-to-text) y capa MTP; no disponible si es MoE |
| Parametros totales | 27.320.698.128 (~27,3 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | Entrenado para 512K; 131.072 tokens verificados en GPU de 32 GB con KV en q8_0 |
| Tipos de cuantizacion | NVFP4 (W4A16) + Q8_0 en tensores sensibles, MTP head en BF16; también disponibles Q4_K_M (imatrix y plain) del mismo autor |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base, SenseNova 6.8 Code2Video, es un fine-tune de Qwen3.8-27B con capacidades multimodales (texto e imagen de entrada), lo que le permite inspeccionar los fotogramas que él mismo renderiza y corregirlos iterativamente. Incorpora una capa de **multi-token-prediction (MTP)**, heredada del checkpoint oficial de Qwen/Qwen3.8-27B, que habilita decodificación especulativa con aceptación de drafts del 75,3 % en esta cuantización.

En cuanto a la cuantización, el autor empleó un proceso cuidadoso: calibración con 512 ventanas de 2.048 tokens extraídas de trayectorias de producción reales del modelo (con razonamiento y tool calls incluidos), Hessianos GPTQ en FP32 calculados streaming capa a capa sobre los 55,7 GB del modelo BF16, y la técnica **GPTQ + Schur Replay NVFP4** (arXiv 2609.36654), que dentro del bucle GPTQ evalúa nueve códigos de escala E4M3 más el punto Four Over Six (arXiv 2512.02010) por bloque de 16 pesos, conservando la escala de menor pérdida GPTQ real. Los tensores sensibles (K/V de full-attention, proyecciones DeltaNet de entrada y salida) se protegieron en Q8_0 mediante GPTQ propio, seleccionados por un escaneo de sensibilidad medido por KLD real en llama.cpp. No se dispone de información sobre el proceso de entrenamiento del modelo base (tokens, dataset, RLHF/DPO).

## Capacidades

- Generación de vídeos mediante código: escribe y ejecuta código que renderiza vídeos o "películas" completas, con prompts y skills de producción publicados por SenseNova en GitHub.
- Entrada multimodal: revisa sus propios fotogramas renderizados (image-text-to-text) para corregir el resultado; requiere el archivo `mmproj` de visión en BF16.
- Decodificación acelerada por MTP: capa de multi-token-prediction en BF16 con aceptación de drafts del 75,3 % (n máx. 3, p-split 0,2).
- Contexto largo: 131k tokens verificados en una sola GPU de 32 GB; entrenado para 512K.
- Compatibilidad con Claude Code: se incluye una plantilla de chat modificada (`chat_template-claude-code.jinja`) que acepta mensajes de sistema posteriores al primer turno, requisito de ese harness.
- Soporte de tool calling: las trayectorias de calibración incluían tool calls, y Claude Code es el harness recomendado, lo que indica uso agéntico con herramientas.
- Idiomas: inglés y chino.

No hay información sobre capacidades de audio ni sobre un "thinking mode" explícito.

## Casos de uso

- Generación automatizada de vídeos explicativos: el modelo escribe código de renderizado (por ejemplo, con librerías de animación o gráficos) y revisa los fotogramas resultantes con su componente de visión, corrigiendo errores sin intervención humana.
- Producción de "películas" cortas por agentes: SenseNova publica skills de producción y prompts en GitHub pensados para harnesses agénticos como Claude Code, permitiendo flujos multi-paso de guion, render y revisión.
- Prototipado local de pipelines code-to-video: al caber en una GPU de 32 GB, un desarrollador puede iterar en local sobre generación de vídeo por código sin depender de APIs de nube.
- Automatización de contenido visual para redes sociales o marketing: generación en lote de clips a partir de descripciones en texto, con revisión visual automática de cada fotograma.
- Educación y divulgación: creación de animaciones didácticas (matemáticas, física, algoritmos) donde el modelo ajusta el render hasta que el fotograma coincide con lo esperado.
- Evaluación de cuantizaciones NVFP4 en hardware Blackwell: los tensores W4A16 con activaciones de 8 bits lo hacen un buen banco de pruebas para RTX 5090 y similares, con métricas KLD y throughput publicadas.
- Asistente de código multimodal en LM Studio: carga en unos 11 segundos y unos 120 tok/s en tareas de código, útil como asistente general con capacidad de visión.

## Benchmarks y rendimiento

Datos de calidad y velocidad de la cuantización, medidos por el autor en una RTX 5090 con llama.cpp b12015 (KLD sobre 61.440 tokens; velocidad greedy, 512 tokens, mediana de 3 prompts x 3 ejecuciones, con MTP n=3, p-split 0,2):

| Métrica | NVFP4 (este archivo) | Q4_K_M (imatrix) | Q4_K_M (plain) |
|---|---:|---:|---:|
| Tamaño de archivo | 19,38 GB | 16,81 GB | 16,81 GB |
| KLD vs BF16 (menor es mejor) | 0,124 | 0,147 | 0,184 |
| KLD percentil 99 | 3,13 | 3,98 | 4,94 |
| Coincidencia de top token con BF16 | 92,4 % | 92,0 % | 90,6 % |
| Decodificación con MTP | 157 tok/s | 153 tok/s | 153 tok/s |
| Aceptación de drafts MTP | 75,3 % | 71,0 % | 71,0 % |
| Decodificación sin MTP | 74,5 tok/s | 79,9 tok/s | 79,9 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para esta cuantización ni para el modelo base.

## Requisitos de hardware

- VRAM para inferencia: unos 26 GB con contexto de 131k y KV en q8_0 en una GPU de 32 GB; el archivo principal ocupa 19,38 GB más ~0,93 GB del proyector de visión. El contexto completo de 512K no cabe en una sola tarjeta de consumo.
- GPU de referencia: RTX 5090 (32 GB), donde se midieron 157 tok/s con MTP. Los tensores NVFP4 están etiquetados W4A16, de modo que también funcionan con activaciones de 8 bits en arquitecturas Blackwell; no disponible el rendimiento exacto en otras GPUs.
- Consumer GPUs: sí, cabe en una RTX 5090 de 32 GB con 131k de contexto; en tarjetas de 24 GB (RTX 4090/3090) sería necesario reducir contexto o usar offload parcial (no verificado en la documentación).
- Despliegue: llama.cpp (b12015 o newer) con `llama-server` y flags `--spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-split 0.2`, `-fa on`, `-ctk q8_0 -ctv q8_0`, contexto 131072; también LM Studio (runtime CUDA 12 de llama.cpp 2.67.0, carga en ~11 s, ~120 tok/s en código).
- Latencia y throughput: 157 tok/s con MTP y 74,5 tok/s sin MTP en RTX 5090 (llama-server); ~120 tok/s en LM Studio en tareas de código.

## Comparativa con modelos similares

| | SenseNova 6.8 Code2Video NVFP4 | Qwen3.8-27B (base) | Q4_K_M imatrix (mismo autor) |
|---|---|---|---|
| Parametros | ~27,3 B | ~27 B | ~27 B |
| Formato | GGUF NVFP4 + Q8_0 | BF16 (safetensors) | GGUF Q4_K_M |
| Tamaño | 19,38 GB | ~55,7 GB | 16,81 GB |
| Contexto | 131k verificado (512K entrenado) | 512K (según el autor) | igual que NVFP4 |
| KLD vs BF16 | 0,124 | — (referencia) | 0,147 |
| Throughput con MTP | 157 tok/s | no disponible | 153 tok/s |
| Licencia | Apache 2.0 | no disponible | Apache 2.0 |
| Especialización | Generación de vídeo vía código, visión | Modelo base general | igual que NVFP4 |

No hay información suficiente para comparar con otros modelos de generación de vídeo vía código de terceros.

## Limitaciones y advertencias

- Es una cuantización de terceros (BennyDaBall), no oficial de SenseNova; el soporte depende del autor de la cuantización, no del laboratorio original.
- La capa MTP del checkpoint original de SenseNova no estaba incluida; este archivo usa la MTP head oficial de Qwen/Qwen3.8-27B en BF16, lo que puede introducir ligeras diferencias respecto al comportamiento original.
- El contexto de 512K del entrenamiento no es utilizable en una sola GPU de consumo; el límite práctico verificado es 131k con KV q8_0.
- La plantilla de chat original rechaza mensajes de sistema tras el primer turno, lo que rompe Claude Code; hay que usar la plantilla modificada incluida.
- Riesgo de alucinación: no disponible; al tratarse de un modelo generativo de ~27 B, deben esperarse errores de código y de render que el propio modelo corrige visualmente pero no siempre.
- Sesgos conocidos: no disponibles. Idiomas limitados a inglés y chino.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base y de cualquier contenido generado (música, imágenes) usado en los vídeos.
- Los números de rendimiento provienen de pruebas del autor en RTX 5090 con builds concretos de llama.cpp; pueden variar con otro hardware o versiones.

## Enlaces

- Cuantización NVFP4 (esta ficha): https://huggingface.co/BennyDaBall/SenseNova-6.8-Code2Video-NVFP4-GGUF
- Modelo base oficial de SenseNova: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub de SenseNova (skills, prompts y showcase): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Checkpoint Qwen3.8-27B (origen de la MTP head): https://huggingface.co/Qwen/Qwen3.8-27B
- Paper Four Over Six: https://arxiv.org/abs/2512.02010
- Paper GPTQ + Schur Replay NVFP4: arXiv 2609.36654 (enlace directo no disponible)
- Otra cuantización del mismo autor (referencia del solver): https://huggingface.co/BennyDaBall/flux-3-image-klein-base-NVFP4
