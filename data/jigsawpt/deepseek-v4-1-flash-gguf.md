# JigSawPT/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash-GGUF es una conversión a formato GGUF del modelo DeepSeek-V4.1-Flash, publicada por el usuario JigSawPT. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por DeepSeek, con 40 capas, 384 expertos enrutados, hyper-connections, atención dispersa CSA2 y una memoria condicional de n-gramas (engram tables) de 189 GiB. La conversión preserva la precisión original: los expertos enrutados son un reempaquetado sin pérdidas de los bloques MXFP4 liberados, mientras que la atención y los pesos densos se dequantizan desde fp8 y se almacenan como Q8_0/BF16.

La relevancia de esta ficha reside en que se trata de un caso poco habitual: un modelo de escala muy grande (el repositorio ocupa 501,8 GB repartidos en 11 fragmentos) que no cabe ni en VRAM ni en RAM, y que se ejecuta mediante streaming de expertos desde disco a través de una caché en VRAM y una capa fijada en memoria del host. La model card reporta cifras medidas en una única RTX 5090 (32 GB) con 125,7 GiB de RAM y almacenamiento NVMe PCIe 5: 5,1 tokens/s de decodificación con 7,7 s hasta el primer token en contenido nuevo, y 21,4 tokens/s con 0,26 s cuando el contenido ya está residente.

Es importante señalar que este GGUF solo funciona en la rama `dsv41-porte` del repositorio JigSawPT/llama.cpp, ya que llama.cpp upstream todavía no dispone de runtime para V4.1. La conversión abierta en upstream (PR #28696) almacena las engram tables de forma distinta, por lo que los ficheros no son intercambiables. El modelo base y la implementación de referencia se distribuyen bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con hyper-connections y atención dispersa CSA2, 40 capas, 384 expertos enrutados, memoria condicional de n-gramas (engram tables) |
| Parametros totales | 754.638.981.608 según metadatos de safetensors; la model card del modelo base indica 552B MoE |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, reempaquetado sin pérdidas), Q8_0/BF16 (atención y pesos densos, dequantizados desde fp8), fp8 crudo (engram tables con sus escalas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (11 fragmentos, 502 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash es un transformer de mezcla de expertos con 40 capas y 384 expertos enrutados, que incorpora hyper-connections y atención dispersa CSA2. Una de sus particularidades es la inclusión de una memoria condicional de n-gramas (engram tables) de 189 GiB, que en el GGUF viaja como bytes fp8 sin procesar junto con sus escalas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que estos datos no aparecen en la información proporcionada.

La conversión a GGUF se realizó sin alterar la precisión publicada: los expertos enrutados son un reempaquetado bloque a bloque verificado (480/480 bloques idénticos), la atención y los pesos densos se dequantizaron desde fp8 a Q8_0/BF16, y las engram tables se conservan como fp8 crudo. El proceso de conversión emplea `convert_hf_to_gguf.py` con la opción `--engram` y `--outtype bf16`, seguido de `llama-gguf-split` con un tamaño máximo de fragmento de 48 GB. La fidelidad frente a la implementación de referencia se midió con una correlación de logits de 0,9967 a 1.401 tokens, comparable a la del propio port contra sí mismo en dos ejecuciones (0,9959).

## Capacidades

- Generación de texto conversacional: la model card indica que el modo chat (`--reasoning off`) es la configuración medida.
- Modo de razonamiento (thinking mode): disponible, aunque la model card advierte que a temperatura 0 entra en bucle con indicaciones vagas.
- Memoria condicional de n-gramas: las engram tables se leen mapeadas en memoria, con 56 filas por token, lo que permite recuperar contenido ya visto (contenido residente) con mayor velocidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre inferencia de modelos masivos fuera de memoria: el modelo permite experimentar con streaming de expertos desde disco (caché VRAM de 18 GiB más capa fijada de 72 GiB) en hardware de consumo, algo imposible de otro modo con un repositorio de 502 GB.
- Evaluación de fidelidad de cuantizaciones GGUF: la conversión documenta una verificación bloque a bloque (480/480) y una correlación de logits de 0,9967, lo que la convierte en un caso de estudio para validar reempaquetados MXFP4 sin pérdidas.
- Despliegue local conversacional en estación de trabajo: con una RTX 5090 (32 GB), 125,7 GiB de RAM y NVMe PCIe 5, el modelo atiende peticiones de chat a 5,1 tokens/s en contenido nuevo y 21,4 tokens/s cuando el contexto ya está residente.
- Reproducción de experimentos con resultados bit a bit: la opción `--moe-stream-io-threads 1` permite ejecuciones reproducibles a 3,6 tokens/s (frente a 4,3 tokens/s sin ella), útil para comparativas controladas.
- Pruebas de rendimiento de atención dispersa CSA2 y hyper-connections: el port mantiene la arquitectura original, por lo que sirve para medir el comportamiento de estas innovaciones en llama.cpp.
- Estudio de sistemas de memoria condicional: las engram tables en fp8 crudo con sus escalas permiten analizar el impacto de la memoria de n-gramas en tareas de recuperación de contenido repetido.
- Base para portar V4.1 a upstream: los ficheros y el método documentado sirven como referencia para reconciliar la conversión con el PR #28696 de ggml-org/llama.cpp.

## Benchmarks y rendimiento

Resultados medidos por el autor en una RTX 5090 (32 GB), 125,7 GiB de RAM y fichero en NVMe PCIe 5:

| Escenario | Decodificación | Tiempo hasta el primer token |
|---|---:|---:|
| Contenido nuevo (benchmark propio, 4 prompts x 3 rondas) | 5,1 tokens/s | 7,7 s |
| Contenido residente (mismo prompt repetido) | 21,4 tokens/s | 0,26 s |

Datos adicionales reportados:

| Métrica | Valor |
|---|---|
| Techo de la arquitectura en ese equipo sin fallos de disco | 6,2 tokens/s |
| Decodificación con `--moe-stream-io-threads 1` (reproducible) | 3,6 tokens/s (frente a 4,3 tokens/s) |
| Correlación de logits frente a la referencia a 1.401 tokens | 0,9967 |
| Correlación del port contra sí mismo entre dos ejecuciones | 0,9959 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 502 GB para los 11 fragmentos del GGUF; el autor indica que un NVMe PCIe 5 mejora el rendimiento del streaming.
- VRAM: caché de expertos de 18 GiB en la configuración medida; `--moe-stream-cache` tiene un mínimo de 18 slots por capa, equivalentes a 13 GiB.
- Memoria del host: 72 GiB para la capa fijada (`--moe-stream-l2`); se advierte que superar 72 GiB en una máquina de 128 GB resulta más lento porque roba page cache a las engram tables.
- RAM total en la prueba medida: 125,7 GiB.
- GPU: RTX 5090 (32 GB) como referencia medida. No se documentan otras GPU (A100, H100, etc.) en la información disponible.
- ¿Cabe en GPU de consumo? No como modelo completo; requiere streaming de expertos desde disco.
- Opciones de despliegue: únicamente `llama-server` compilado desde la rama `dsv41-porte` de JigSawPT/llama.cpp. No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp upstream.
- Latencia y throughput: 5,1 tokens/s y 7,7 s de TTFT en contenido nuevo; 21,4 tokens/s y 0,26 s de TTFT en contenido residente; techo de 6,2 tokens/s sin fallos de disco.
- Comando de referencia: `llama-server -m DeepSeek-V4.1-Flash-MXFP4-engram-00001-of-00011.gguf -ngl 99 -c 8192 --moe-stream --moe-stream-cache 18 --moe-stream-l2 72 --reasoning off --host 127.0.0.1 --port 8080`.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-GGUF (este) | GGUF, 11 fragmentos | 502 GB (754,6B parámetros según safetensors) | no disponible | MIT | Rama `dsv41-porte` de JigSawPT/llama.cpp |
| DeepSeek-V4.1-Flash (base) | safetensors | 552B MoE (según model card) | no disponible | MIT | Repositorio oficial deepseek-ai |
| Variante sin engram tables | GGUF | 299 GB | no disponible | MIT | No publicada |
| DeepSeek-V4.1-Flash-DSpark-GGUF (draft head) | GGUF | no disponible | no disponible | MIT | Publicada por separado por JigSawPT |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un fork: el modelo solo se ejecuta en la rama `dsv41-porte` de JigSawPT/llama.cpp. llama.cpp upstream no tiene runtime para V4.1 todavía.
- Incompatibilidad de ficheros: los GGUF generados por el PR #28696 de upstream almacenan las engram tables de forma distinta, por lo que no son intercambiables con este repositorio.
- Rendimiento bajo: 5,1 tokens/s en contenido nuevo es una velocidad muy limitada para uso interactivo; el techo sin fallos de disco es de 6,2 tokens/s.
- Requisitos de almacenamiento elevados: 502 GB de disco y un NVMe rápido son imprescindibles para el streaming de expertos.
- Modo de razonamiento inestable: la model card indica que el thinking mode a temperatura 0 entra en bucle con indicaciones vagas.
- Huella de memoria ajustada: ninguna configuración cabe entera en RAM + VRAM, y subir `--moe-stream-l2` por encima de 72 GiB en máquinas de 128 GB degrada el rendimiento.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos generativos de lenguaje.
- Búsqueda web sin resultados relevantes: los resultados devueltos corresponden a portales de administración electrónica sin relación con el modelo, por lo que no aportan información adicional.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación externa sobre su funcionamiento.
- Licencia MIT: permite uso comercial, pero el autor recomienda revisar el estado de la rama y del PR upstream antes de integrarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Rama del port: https://github.com/JigSawPT/llama.cpp
- Informe técnico y resultados negativos: https://github.com/JigSawPT/deepseek-v41-flash-on-5090
- PR de conversión en upstream: https://github.com/ggml-org/llama.cpp/pull/28696
- Draft head publicado aparte: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-DSpark-GGUF
- Parche de streaming de expertos Crow: https://github.com/nibor1896/Crow
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
