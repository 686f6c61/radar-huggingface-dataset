# kayceesamuel/Qwen3.5-9B-NF4DQ

## Resumen

Qwen3.5-9B-NF4DQ es una cuantización del modelo Qwen/Qwen3.5-9B (8.953.803.264 parámetros) realizada por el usuario kayceesamuel mediante NF4DQ, un nuevo tipo de bloque ggml (tipo 43) que no forma parte de la implementación estándar de llama.cpp. El resultado ocupa 4,346 GiB, un 17,7 % menos que Q4_K_M, con un incremento de perplejidad de solo el 2,6 % (8,4181 frente a 8,2055 en wikitext-2 a contexto 512). Frente a Q3_K_M, de tamaño prácticamente idéntico, la perplejidad mejora un 9,5 %.

La relevancia de esta ficha no reside en el modelo base, sino en el formato de cuantización: NF4DQ almacena 1024 pesos en 532 bytes (4,1562 bits por peso) combinando índices NF4 de 4 bits sobre un codebook int8, un índice de escala de 4 bits por cada subbloque de 32 pesos y una superescala fp16 por bloque. Esa segunda etapa de cuantización de las escalas es lo que permite bajar de los 4,50 bits por peso de Q4_K.

La advertencia principal es operativa: el archivo no carga en llama.cpp, Ollama ni LM Studio de serie. Requiere la aplicación CIU (macOS Apple Silicon y Windows x64) o compilar la bifurcación `nf4dq` del repositorio de runciu. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; el repo solo distribuye pesos GGUF cuantizados) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 8192` y `-c 4096` |
| Tipos de cuantización | NF4DQ (ggml type 43), 4,1562 bits por peso; 1024 pesos en 532 bytes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4,346 GiB; repositorio de 4,7 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.5-9B en la documentación proporcionada: no se detalla si es un transformer denso, MoE o híbrido, ni el volumen o composición de los datos de entrenamiento, ni si hubo fases de RLHF o DPO. El repositorio es exclusivamente una distribución de pesos cuantizados y no documenta el proceso de preentrenamiento ni el alineamiento.

La innovación técnica documentada es el formato NF4DQ. Se trata de un tipo de bloque ggml nuevo, no una receta compuesta de tipos existentes. Cada bloque almacena los pesos como índices de 4 bits en una tabla NF4, acompañados de un índice de escala de 4 bits por cada subbloque de 32 pesos que apunta a un codebook fijo, más una superescala fp16 por bloque. La model card indica que el modelo no dispone de cabeza de predicción multi-token, por lo que `--spec-type draft-mtp` no es aplicable. Las notas de diseño, los datos de ajuste de cada constante y los enfoques medidos y descartados están en el documento de diseño de la bifurcación.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman el uso previsto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles con OpenAI a través de CIU, que sirve en `127.0.0.1:8674`.
- Inferencia local en CPU y GPU: soporte de backend CUDA y Metal en la bifurcación; salida idéntica token a token entre CPU y Metal a temperatura 0.
- Razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en equipos con memoria ajustada: con 4,346 GiB, el modelo cabe completo en una GPU de 16 GB (el ejemplo de Colab con T4 lo confirma) dejando espacio para caché de contexto; es adecuado cuando Q4_K_M (5,280 GiB) no entra pero Q3_K_M degrada demasiado la calidad.
- Estaciones de trabajo Apple Silicon de gama baja: en un M1 con 8 GB y Metal se miden 13,19 t/s en prefill y 10,28 t/s en decode, suficiente para asistentes interactivos locales sin conexión.
- Servicio de API local compatible con OpenAI: CIU expone el modelo en `127.0.0.1:8674`, de modo que herramientas existentes pueden apuntar a él sin cambios de código, útil para prototipado con datos que no deben salir de la máquina.
- Evaluación de formatos de cuantización: investigadores que comparan PPL y tamaño entre Q4_K_M, Q3_K_M y NF4DQ sobre el mismo checkpoint pueden reproducir las mediciones con el binario de la bifurcación.
- Entornos de CI con GPU modesta: la compilación en T4 con `-DCMAKE_CUDA_ARCHITECTURES="75;80;89"` permite levantar un servidor en unos quince minutos para pruebas de integración.
- Inferencia en CPU como respaldo: aunque lenta (0,81 t/s prefill, 0,72 t/s decode en M1 sin Metal), sirve para validación funcional y comparación de salidas deterministas.

## Benchmarks y rendimiento

Perplejidad en wikitext-2, contexto 512, A100-80GB, archivo de test completo, mismos pesos de origen, mismo binario:

| Build | Tamaño | PPL @512 |
|---|---|---|
| Q4_K_M | 5,280 GiB | 8,2055 |
| NF4DQ | 4,346 GiB | 8,4181 |
| Q3_K_M | 4,342 GiB | 9,2978 |

Throughput en Apple M1 de 8 GB con Metal:

| Configuración | Prefill | Decode |
|---|---|---|
| Metal | 13,19 t/s | 10,28 t/s |
| Solo CPU | 0,81 t/s | 0,72 t/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4,346 GiB para los pesos; con contexto de 8k y `-np 1` hay que sumar la caché KV correspondiente.
- GPU recomendadas: A100-80GB para las mediciones de referencia; T4 de 16 GB validada en el ejemplo de Colab; cualquier GPU NVIDIA con soporte CUDA y suficiente VRAM.
- Consumer GPU: cabe en tarjetas de 8 GB o más; en un M1 de 8 GB funciona con Metal.
- Backends: CUDA y Metal en la bifurcación `nf4dq`; no hay backend Vulkan. No funciona con llama.cpp, Ollama ni LM Studio de serie.
- Opciones de despliegue: CIU (macOS Apple Silicon y Windows 10/11 x64; Intel Mac y Linux no soportados aún) o compilación manual de la bifurcación con `cmake -B build -DCMAKE_BUILD_TYPE=Release` y `-DGGML_CUDA=ON` para NVIDIA.
- Aviso de contexto: `llama-server` usa 4 slots por defecto y `-c` es por slot; sin `-np 1`, una petición de 8k asigna 32k tokens de caché.
- Latencia y throughput: ver tabla de benchmarks; el M1 representa el suelo de ancho de banda de memoria de la gama Apple Silicon, no una cifra representativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | PPL @512 (wikitext-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-NF4DQ | 8.953.803.264 | no disponible | 4,346 GiB | 8,4181 | Apache 2.0 | Requiere CIU o bifurcación nf4dq |
| Qwen3.5-9B Q4_K_M | 8.953.803.264 | no disponible | 5,280 GiB | 8,2055 | Apache 2.0 | llama.cpp estándar |
| Qwen3.5-9B Q3_K_M | 8.953.803.264 | no disponible | 4,342 GiB | 9,2978 | Apache 2.0 | llama.cpp estándar |

La comparativa se limita a las cuantizaciones del mismo modelo base documentadas por el autor; no se dispone de datos de modelos alternativos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con herramientas estándar: el archivo no carga en llama.cpp, Ollama ni LM Studio sin la bifurcación o CIU; descargarlo sin ellas deja un archivo de 4,35 GiB que ninguna herramienta abre.
- Colisión de tipos futura: el tipo 43 es el siguiente hueco libre en upstream; si upstream lo reclama, una compilación estándar leerá estos archivos como ese tipo y decodificará basura en lugar de rechazar la carga. Ante salidas incorrectas, verificar primero qué binario se ejecuta.
- Plataformas no soportadas: CIU no soporta Intel Mac ni Linux; la vía manual requiere compilar.
- Backend limitado: no hay soporte Vulkan.
- Sin decodificación especulativa: el modelo carece de cabeza de predicción multi-token.
- Pérdida de calidad respecto a Q4_K_M: 2,6 % más de perplejidad a cambio de un 17,7 % menos de tamaño.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas: no disponible en la información proporcionada.
- Licencia: Apache 2.0, apta para uso comercial; el autor señala que la cuantización no crea una obra nueva.
- Builds sin firma de código: el primer arranque de CIU requiere un paso adicional descrito en `FIRST-RUN.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kayceesamuel/Qwen3.5-9B-NF4DQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Bifurcación de llama.cpp con soporte NF4DQ: https://github.com/runciu/llama.cpp/tree/nf4dq
- Binarios precompilados de llama-server: https://github.com/runciu/llama.cpp/releases
- Documento de diseño de NF4DQ: https://github.com/runciu/llama.cpp/blob/nf4dq/docs/nf4dq-design.md
- Aplicación CIU (macOS Apple Silicon): https://github.com/runciu/ciu/releases/latest/download/ciu-macos-arm64.zip
- Aplicación CIU (Windows x64): https://github.com/runciu/ciu/releases/latest/download/ciu-windows-x64.zip
- Issues de CIU: https://github.com/runciu/ciu/issues
- Contacto del autor: hello@runciu.com
