# 2beng2/Agnes-2.5-Pro-Theta-IQ4_XS-Basalt

## Resumen

Agnes 2.5 Pro Theta IQ4_XS Basalt es una conversión comunitaria cuantizada del checkpoint base Agnes-AI/Agnes-2.5-Pro-Theta, empaquetada específicamente para el motor de inferencia Basalt 0.4.0. El autor, 2beng2, ha generado un pack de 90,08 GiB que contiene los pesos del modelo objetivo, el tokenizador, la plantilla de chat, una tabla PLE (probablemente de embeddings posicionales o de expertos) y un drafter MTP (multi-token prediction) basado en un modelo Flash-Next donado. La cuantización es mixta, centrada en IQ4_XS con la tabla PLE en IQ4_NL.

El modelo subyacente es un Mixture-of-Experts (MoE) de solo texto, orientado a generación de texto, y la conversión está pensada para aprovechar las capacidades de streaming desde SSD de Basalt: la tabla PLE y los expertos no residentes se cargan bajo demanda, lo que permite ejecutar un modelo de gran tamaño en una GPU de consumo con 32 GB de VRAM (RTX 5090). Incluye un perfil opcional de colocación de expertos (`theta-blend.prof`) que combina un ranking de routing aprendido con el ranking stock de Basalt.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de cuantización y despliegue para un MoE grande en hardware de consumo; por otro, los benchmarks publicados por el autor (aunque limitados a un único sistema Windows) muestran el impacto medible del drafter MTP y del perfil de expertos en throughput de decodificación. No se dispone de información sobre el tamaño total de parámetros del modelo base ni sobre sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, solo texto; incluye drafter MTP Flash-Next |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por defecto en la config Basalt; hasta 131.072 tokens con `--max-context 133120` |
| Tipos de cuantizacion | Mixta: IQ4_XS para pesos principales, IQ4_NL para la tabla PLE; KV cache INT8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.basalt` (pack propietario del motor Basalt); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint base Agnes-2.5-Pro-Theta más allá de que se trata de un Mixture-of-Experts de solo texto. El pack cuantizado conserva el tokenizador y la plantilla de chat originales, y añade un drafter MTP (multi-token prediction) basado en Qwen3.8 Flash-Next, que añade aproximadamente 812 MiB al pack. La tabla PLE ocupa 26,82 GiB del archivo y se almacena en IQ4_NL, mientras que el resto de pesos usa IQ4_XS. El motor Basalt verifica las propuestas del drafter contra el modelo objetivo antes de aceptarlas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento. La innovación técnica destacable de este pack es el soporte de decodificación especulativa mediante MTP integrada en Basalt, junto con el streaming desde SSD de expertos no residentes y de la tabla PLE, lo que permite ejecutar el modelo en GPUs con VRAM limitada. El perfil `theta-blend.prof` combina un 60% de ranking de routing aprendido sobre seis prompts con un 40% del ranking stock de Basalt, y solo afecta a la colocación inicial de expertos en memoria GPU, no a los pesos.

## Capacidades

- Generación de texto en modo solo texto (el pack excluye explícitamente cualquier ruta multimodal).
- Razonamiento y cálculo matemático: los benchmarks incluyen una petición de cálculo de costes de envío, lo que sugiere capacidad para tareas aritméticas de varios pasos.
- Generación y revisión de código: se ha probado con una petición de revisión de código Python.
- Redacción de textos profesionales: se ha probado con la generación de un correo de traspaso (handover email).
- Decodificación especulativa con MTP opcional, que acelera la generación manteniendo secuencias de tokens idénticas a las del modo sin MTP en las pruebas publicadas.
- Contexto largo: soporta ventanas de hasta 131.072 tokens con la configuración adecuada, y de 32.768 tokens por defecto.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, capacidades multilingües ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Revisión de código en local: el modelo puede analizar fragmentos de código Python y generar comentarios de revisión; los benchmarks del autor muestran 66,35 tok/s de decodificación en esta tarea con MTP activo sobre una RTX 5090.
- Generación de documentación técnica y correos profesionales: el rendimiento en la prueba de handover email (52,33 tok/s con MTP) lo hace viable para redacción asistida en estaciones de trabajo con una sola GPU de consumo.
- Cálculo y estimación de costes: la prueba de cálculo de costes de envío muestra capacidad para resolver problemas aritméticos con contexto estructurado, útil en herramientas internas de presupuestación.
- Procesamiento de documentos largos: con hasta 131.072 tokens de contexto y streaming de expertos desde SSD, puede resumir o extraer información de contratos, informes o expedientes extensos en un equipo con 32 GB de VRAM.
- Asistente de código en IDE con contexto de repositorio: la ventana de 32K por defecto permite incluir varios archivos relevantes; la integración requeriría adaptar el cliente al endpoint HTTP local que expone Basalt en `127.0.0.1:8080`.
- Experimentación e investigación sobre MoE y decodificación especulativa: el pack y el perfil de expertos permiten reproducir los benchmarks de MTP y de colocación de expertos, comparando modos con y sin drafter.
- Despliegue en entornos con GPU Blackwell y Windows: es una de las pocas recetas documentadas de extremo a extremo para ejecutar un MoE cuantizado de este tamaño en Windows nativo con CUDA 13.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor se midieron en Windows nativo con una RTX 5090 (32 GB VRAM), Ryzen 9 9950X3D, 32 GB de RAM, SSD, Basalt 0.4.0 y KV cache INT8. Las tasas están en tokens por segundo y excluyen el arranque del modelo.

Tres prompts independientes de 4.096 tokens, 192 tokens generados con muestreo greedy, capacidad de contexto de 32.768 tokens:

| Petición | Prefill sin/con MTP (tok/s) | Decode sin/con MTP (tok/s) | TTFT sin/con MTP (s) | Total sin/con MTP (s) |
|---|---:|---:|---:|---:|
| Revisión de código Python | 225,93 / 235,33 | 53,10 / 66,35 | 18,20 / 17,48 | 21,75 / 20,31 |
| Correo de traspaso | 552,39 / 541,64 | 42,49 / 52,33 | 7,49 / 7,63 | 11,95 / 11,24 |
| Cálculo de costes de envío | 587,49 / 600,34 | 24,31 / 34,04 | 7,05 / 6,89 | 14,88 / 12,47 |
| **Agregado** | **377,90 / 386,53** | **35,93 / 47,20** | 10,91 / 10,66 | 16,19 / 14,67 |

MTP mejoró el throughput agregado de decodificación un 31,4%, con secuencias de tokens idénticas en las tres ejecuciones emparejadas.

Prompt completo de 131.072 tokens, 256 tokens generados con `--max-context 133320 --prefill 32768 --spec 8 --suffix-draft 3`:

| Colocación de expertos | Prefill tok/s | Decode tok/s | TTFT |
|---|---:|---:|---:|
| Basalt stock | 2.340 | 37,39 | 56,13 s |
| Theta Blend (dos ejecuciones) | 2.305–2.370 | 43,42–46,18 | 55,41–56,98 s |

El perfil Blend elevó la tasa de acierto de la caché de expertos en decodificación del 76,9% al 83,5–84,5%, con un working set de proceso de 10,65–11,63 GiB y al menos 4,90 GiB de RAM del sistema disponibles.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El pack ocupa 90,08 GiB en disco (más 192 KiB del perfil opcional); requiere SSD para el streaming de expertos y de la tabla PLE.
- GPU verificada: NVIDIA RTX 5090 con 32 GB de VRAM (arquitectura Blackwell). El autor indica que se requiere una GPU Blackwell NVIDIA compatible y las bibliotecas de runtime CUDA 13 en el `PATH`.
- Memoria del sistema: en las pruebas se usaron 32 GB de RAM instalada, con un working set de proceso de hasta 11,63 GiB y al menos 4,90 GiB de RAM del sistema disponibles durante la decodificación.
- No se dispone de datos de VRAM mínima exacta ni de pruebas en A100, H100 u otras GPUs; el pack está pensado para GPUs de consumo de gama alta con streaming desde SSD.
- Despliegue mediante Basalt 0.4.0 (archivo Windows x64; el autor indica que el modelo y el perfil son compatibles con una build de Linux de Basalt). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.basalt`.
- Throughput medido: 377,90–386,53 tok/s de prefill agregado y 35,93–47,20 tok/s de decodificación agregada en prompts de 4.096 tokens; 2.305–2.370 tok/s de prefill y 37,39–46,18 tok/s de decodificación en un prompt de 131.072 tokens.
- Configuración de referencia: ventana de 32.768 tokens, KV cache INT8, PLE respaldada en SSD y cero swaps de expertos por defecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El checkpoint base Agnes-AI/Agnes-2.5-Pro-Theta no incluye en esta ficha datos de parámetros, contexto o benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. Tampoco se conocen otras conversiones Basalt del mismo modelo con las que comparar.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Agnes 2.5 Pro Theta IQ4_XS Basalt | no disponible | 32.768 / 131.072 | apache-2.0-and-qwen-community-1.0 | `.basalt` | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión comunitaria sin validación independiente conocida.
- El formato `.basalt` es propietario del motor Basalt y no es portable a otros runtimes de inferencia; no hay pesos en safetensors ni GGUF en este repositorio.
- La licencia se declara como `apache-2.0-and-qwen-community-1.0` y como `other` en los metadatos; es necesario revisar los términos de la licencia Qwen Community 1.0 antes de cualquier uso comercial, y verificar su compatibilidad con la licencia del checkpoint base.
- El pack incluye un drafter MTP derivado de un modelo de terceros (Qwen3.8 Flash-Next Uncensored); su licencia y procedencia deben verificarse por separado.
- Los benchmarks se midieron en un único sistema Windows con una RTX 5090; el propio autor advierte que el throughput varía con el prompt, el SSD y la memoria disponible. No hay mediciones en Linux ni en otras GPUs.
- El modelo es solo texto; no soporta visión, audio ni otras modalidades.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni comportamiento en dominios especializados.
- El uso de streaming desde SSD introduce dependencia de la latencia y el ancho de banda del disco; un SSD lento degradará el rendimiento de forma significativa.
- La configuración de contexto largo requiere ajustar manualmente `--max-context` y `--prefill`; la configuración por defecto limita a 32.768 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/2beng2/Agnes-2.5-Pro-Theta-IQ4_XS-Basalt
- Checkpoint base (revisión fijada): https://huggingface.co/Agnes-AI/Agnes-2.5-Pro-Theta/tree/6c06a374dd7f0b0ce254544aebadcf0a4f992b7c
- Modelo donante del drafter: https://huggingface.co/klee100/Qwen3.8-Flash-Next-Uncensored-Basalt/tree/946f814d5e4152433186af4aacb3ad4d497691f4
- Release de Basalt 0.4.0: https://github.com/jesdga95/basalt/releases/tag/v0.4.0
- Requisitos de plataforma de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/platforms.md#release-archives
- Referencia de configuración de Basalt: https://github.com/jesdga95/basalt/blob/v0.4.0/docs/configuration/index.md
