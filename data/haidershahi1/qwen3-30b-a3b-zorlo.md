# Haidershahi1/qwen3-30b-a3b-zorlo

## Resumen

Qwen3-30B-A3B for Zorlo es una conversión del modelo Qwen3-30B-A3B de Alibaba Cloud, empaquetada por el usuario Haidershahi1 para su uso con Zorlo, un programa gratuito para Windows que permite ejecutar modelos de gran tamaño en equipos con 8 GB de memoria RAM. El modelo original es un transformer de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, diseñado para generación de texto y conversación.

El problema que resuelve este empaquetado es el de la huella de memoria: en lugar de cargar los pesos completos del modelo en RAM, Zorlo mantiene en memoria únicamente el núcleo (atención, routers, normas, embeddings y cabeza de salida) y lee desde disco los bloques de expertos que cada token necesita, lo que permite ejecutar el modelo con 8 GB de memoria y una unidad NVMe. El repositorio incluye además una copia opcional de baja precisión de los expertos para un modo de ejecución más rápido.

La relevancia de esta ficha radica en que documenta un formato de empaquetado propietario (`zorlo-pack-1`) y una estrategia de inferencia fuera de núcleo (out-of-core) orientada a hardware de consumo, con métricas de velocidad declaradas por el autor. No se trata de un modelo nuevo entrenado desde cero, sino de una reorganización y cuantización parcial del Qwen3-30B-A3B original bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), basada en Qwen3-30B-A3B |
| Parámetros totales | 30B (modelo base); 1.541.093.376 en safetensors del repo |
| Parámetros activos | Aproximadamente 3B (según el nombre A3B del modelo base) |
| Longitud de contexto | No disponible (el ejemplo de arranque usa `-c 12288`) |
| Tipos de cuantización | Q4_K / Q6_K en expertos (original), Q2_K en copia opcional de baja precisión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`core.gguf`), binario propietario (`experts.bin`, `experts.lo.bin`), manifiesto JSON (`manifest.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-30B-A3B, un transformer con capas de atención y capas MoE. Según los archivos del pack, el modelo contiene 48 capas de expertos con 128 expertos cada una (48 x 128), cada uno con pesos gate/up/down. El empaquetado separa los tensores no-expertos (atención, routers, normas, embeddings y cabeza de salida) en `core.gguf` (1,0 GB) y agrupa los pesos de cada experto en bloques alineados dentro de `experts.bin` (17,6 GB), de modo que cada experto pueda leerse del disco en una sola operación de E/S.

No se ha realizado ningún entrenamiento adicional ni ajuste fino: el autor indica que `core.gguf` y `experts.bin` conservan los valores cuantizados originales de un GGUF Q4_K_M del modelo base, solo reorganizados, y que `zorlo pack` verifica expertos aleatorios contra la fuente tras escribir. La única modificación de pesos es `experts.lo.bin` (9,5 GB), donde cada experto se desquantiza y recuantiza a Q2_K usando una matriz de importancia calculada a partir de unos 30.000 tokens de texto general y código. No se dispone de información sobre la composición del dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-30B-A3B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3, aunque no se detallan en la información disponible.
- Generación de código: el pack menciona el uso de código en la matriz de importancia de la cuantización, lo que sugiere soporte para tareas de programación.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no confirmado para esta conversión.
- Ejecución en CPU con 8 GB de RAM mediante carga selectiva de expertos desde disco.

## Casos de uso

- Ejecución local de un modelo de 30B en equipos de consumo: Zorlo permite cargar el modelo en un PC con 8 GB de RAM y SSD NVMe, leyendo los expertos bajo demanda, lo que hace viable probar un MoE de gran tamaño sin GPU dedicada.
- Asistente conversacional de escritorio: la integración con Zorlo Desktop ofrece una ventana de chat que descarga el modelo automáticamente (18,6 GB) y lo sirve de forma local, adecuada para uso personal sin conexión.
- Prototipado y evaluación de modelos MoE: investigadores pueden comparar el comportamiento del Qwen3-30B-A3B cuantizado en un entorno de bajos recursos antes de invertir en hardware mayor.
- Procesamiento de texto y código en local: la matriz de importancia usada para la copia Q2_K incluye texto general y código, por lo que el modelo puede emplearse en tareas de generación y asistencia de programación en entornos aislados.
- Despliegue en estaciones de trabajo sin GPU: el modo `exact` mantiene respuestas idénticas al original en las pruebas del autor, lo que permite usar el modelo como referencia de calidad en máquinas modestas.
- Servicio de inferencia vía terminal: el comando `zorlo serve` con contexto de 12.288 tokens permite exponer el modelo localmente para integraciones ligeras.
- Pruebas de cuantización extrema: la copia Q2_K de expertos sirve para estudiar la degradación de calidad frente a Q4_K/Q6_K en un MoE de 30B.

## Benchmarks y rendimiento

El autor publica métricas de velocidad y fidelidad medidas en un PC de referencia con 8 GB de memoria y SSD NVMe (Windows 11):

| Configuración | Tokens por segundo | Respuestas idénticas al original |
|---|---|---|
| llama.cpp, mismo GGUF, ajustes por defecto | 1,43 | referencia |
| Zorlo, `exact` (por defecto), caché de 1,2 GB | 3,47 | sí, 20 de 20 prompts de prueba |
| Zorlo, `fast`, caché de 256 MB | 5,47 | 94,7% de tokens iguales |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal, que es de CPU con carga de expertos desde disco.
- Memoria RAM: 8 GB según el autor; el núcleo (`core.gguf`, 1,0 GB) se mantiene en memoria.
- Almacenamiento: unos 18,6 GB para la descarga principal y 9,5 GB adicionales para la copia de baja precisión (`--lowbit`).
- Disco: se recomienda SSD NVMe, ya que la velocidad depende principalmente del disco y de la memoria libre.
- GPU recomendadas: no disponibles; el pack está orientado a CPU.
- ¿Cabe en GPU de consumo? No se indica; el diseño es out-of-core en CPU.
- Opciones de despliegue: Zorlo Desktop (Windows) y CLI `zorlo pull` / `zorlo serve`; también se menciona llama.cpp con el mismo GGUF como referencia comparativa.
- Latencia y throughput: 3,47 tok/s en modo `exact` y 5,47 tok/s en modo `fast` en el equipo de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (original) | 30B totales, ~3B activos | No disponible | Apache 2.0 | Safetensors / GGUF | Modelo base sin empaquetar; requiere más memoria o GPU |
| Qwen3-30B-A3B for Zorlo (este) | 30B totales, ~3B activos | No disponible | Apache 2.0 | `zorlo-pack-1` (GGUF + binarios) | Carga selectiva de expertos en CPU con 8 GB de RAM |
| llama.cpp con GGUF Q4_K_M | 30B totales, ~3B activos | No disponible | Apache 2.0 | GGUF | Referencia de 1,43 tok/s en el mismo equipo |

No se dispone de datos de benchmarks para comparar rendimiento de calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no está afiliado ni respaldado por el equipo de Qwen; es una conversión de terceros.
- El formato `zorlo-pack-1` es propietario y requiere el programa Zorlo (licencia FSL-1.1-MIT) para su uso; no es directamente compatible con vLLM, TGI u otros servidores estándar.
- El modo `fast` no reproduce exactamente las respuestas del original: el autor reporta un 94,7% de tokens idénticos, lo que implica divergencias en la salida.
- La copia `experts.lo.bin` está recuantizada a Q2_K, lo que puede degradar la calidad en tareas sensibles.
- El rendimiento depende críticamente del disco y de la memoria libre; en discos lentos o con poca RAM la velocidad puede caer por debajo de la reportada.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas de esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero el programa Zorlo tiene su propia licencia (FSL-1.1-MIT) que debe revisarse por separado.
- El contexto máximo real del modelo no se documenta; el ejemplo de arranque usa 12.288 tokens, pero no se confirma que sea el límite.
- El número de parámetros reportado en safetensors (1.541.093.376) no coincide con los 30B del modelo base, lo que sugiere que ese dato corresponde a un subconjunto o a una discrepancia de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Haidershahi1/qwen3-30b-a3b-zorlo
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Programa Zorlo: https://zorlo.stream
- Licencia Apache 2.0: https://huggingface.co/Haidershahi1/qwen3-30b-a3b-zorlo/blob/main/LICENSE
