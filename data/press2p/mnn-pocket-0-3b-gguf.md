# Press2p/MNN-Pocket-0.3B-GGUF

## Resumen

MNN-Pocket-0.3B-GGUF es la exportación en formato GGUF del modelo MNN-Pocket-0.3B, un modelo de lenguaje compacto de aproximadamente 300 millones de parámetros desarrollado originalmente por el equipo taobao-mnn (Alibaba) y publicado en este repositorio por el usuario Press2p. El modelo está disenado especificamente para despliegue on-device, es decir, para ejecutarse en telefonos, tablets, portatiles y gafas inteligentes, y se ha codesenado junto con el stack de inferencia MNN de Alibaba. Esta exportacion GGUF permite ejecutarlo con llama.cpp y runtimes compatibles como LM Studio u Ollama.

La relevancia actual de este modelo radica en su enfoque en eficiencia extrema: con unos 361 millones de parametros reales y un contexto de 32K tokens, ofrece tres cuantizaciones (F16, Q8_0 y Q4_1) que van desde 726 MB hasta 192 MB. Destaca especialmente la version Q4_1, entrenada con quantization-aware training (QAT), que mantiene una precision cercana a BF16 (49,59 frente a 50,00 de media en una suite de 11 benchmarks) con solo 192 MB de peso.

Arquitectonicamente es un transformer decoder-only de 28 capas, con hidden size de 896, atencion GQA con 14 cabezas y 2 cabezas KV, y embeddings atados. Su licencia Apache 2.0 y su soporte para ingles y chino lo hacen adecuado para asistentes locales, extraccion de datos y pipelines agenticos ligeros, aunque el propio autor advierte que no es recomendable para tareas de razonamiento intensivo como matematicas avanzadas o generacion de codigo de largo alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas, GQA |
| Parametros totales | 361.551.232 (~300M nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (40.960 embeddings de posicion) |
| Tipos de cuantizacion | F16, Q8_0, Q4_1 (QAT) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 28 capas con un tamano oculto de 896 y una capa FFN con dimension intermedia de 2560 y activacion SiLU. La atencion utiliza Grouped Query Attention (GQA) con 14 cabezas de atencion y solo 2 cabezas KV, con head_dim de 64, lo que reduce drasticamente el coste de memoria KV durante la inferencia. El vocabulario es de 65.536 tokens y los embeddings de entrada y salida estan atados (tied), lo que reduce el numero de parametros. Soporta una longitud de contexto de 32K tokens mediante 40.960 embeddings de posicion.

El modelo ha sido codesenado con el stack de inferencia MNN de Alibaba para despliegue on-device. Una innovacion destacable es el entrenamiento con quantization-aware training (QAT) para la cuantizacion Q4_1: el checkpoint Q4_1 se convirtio desde el checkpoint QAT, no desde BF16, por lo que el modelo fue entrenado con la cuantizacion en el bucle y conserva una precision cercana a BF16 con un peso de solo 4 bits. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat estilo ChatML embebida en los metadatos del GGUF.
- Asistencia on-device para telefonos, tablets, portatiles y gafas inteligentes gracias a su reducido tamano.
- Extraccion de datos y estructuracion de informacion a partir de texto.
- Pipelines agenticos ligeros y tareas de multi-step reasoning de baja complejidad.
- Soporte de contexto largo de hasta 32K tokens para conversaciones multi-turno.
- Compatibilidad con endpoints OpenAI a traves de llama-server.
- No se especifica soporte de tool calling ni function calling en la informacion disponible.
- No dispone de capacidades de vision, audio ni modo thinking segun la informacion disponible.

## Casos de uso

- Asistentes locales en dispositivos moviles: con la cuantizacion Q4_1 de 192 MB, el modelo puede integrarse en aplicaciones de telefono o tablet para ofrecer respuestas conversacionales sin conexion, manteniendo una calidad cercana a BF16 gracias al entrenamiento QAT.
- Extraccion de datos estructurados en el borde: el modelo puede procesar textos y devolver informacion estructurada en escenarios de extraccion de entidades o campos, adecuado por su bajo consumo de memoria y su contexto de 32K tokens.
- Pipelines agenticos ligeros: puede actuar como componente de decision rapida en flujos de agentes de multiples pasos donde el coste por inferencia debe ser minimo, aunque no se recomienda para razonamiento de largo alcance.
- Autocompletado y generacion de texto en aplicaciones de escritorio: con la version Q8_0 de 387 MB puede ejecutarse en CPU de portatiles con holgura de memoria, ofreciendo generacion de texto interactiva.
- Prototipado rapido con llama.cpp, LM Studio u Ollama: al estar en formato GGUF con plantilla de chat embebida, permite desplegar un asistente conversacional en minutos sin infraestructura adicional.
- Servicio local con API compatible con OpenAI: mediante llama-server se puede exponer un endpoint compatible con OpenAI para integrar el modelo en aplicaciones existentes que ya consumen esa interfaz.
- Filtrado y clasificacion de contenido en el dispositivo: su reducido tamano permite ejecutar tareas de moderacion o clasificacion de texto localmente, evitando enviar datos a la nube.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo subyacente. Las columnas F16 y Q8_0 siguen la columna BF16, y la columna Q4_1 sigue la columna INT4 (QAT). Solo se dispone de los datos parciales de la model card; la tabla se presenta con los valores disponibles.

| Benchmark | BF16 | INT4 (QAT) | Gemma-3-270M | ERNIE-4.5-0.3B | LFM2.5-350M | SmolLM2-360M | Hunyuan-0.5B | MiniCPM4-0.5B | Qwen3-0.6B |
|---|---|---|---|---|---|---|---|---|---|
| **Media** | 50,00 | 49,59 | 6,42 | 31,99 | 31,28 | 18,43 | 31,22 | 46,81 | 44,28 |
| C-Eval | 38,86 | 40,27 | 6,84 | 32,17 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible el resto de resultados individuales de la suite de 11 benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 192 MB para Q4_1, 387 MB para Q8_0 y 726 MB para F16, sin contar el coste de la cache KV.
- Con contexto de 32K tokens, la cache KV anade memoria adicional proporcional a la longitud de contexto utilizada; para contextos cortos el consumo es minimo.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter como A100 o H100, aunque su tamano esta pensado para ejecucion en CPU y dispositivos moviles.
- Despliegue recomendado con llama.cpp (llama-cli, llama-server), LM Studio u Ollama. El repositorio incluye metadatos GGUF con plantilla ChatML, por lo que la conversacion se formatea automaticamente.
- Para seleccionar la cuantizacion QAT Q4_1 es necesario pasar `--hf-file MNN-Pocket-0.3B-Instruct-Q4_1.gguf` o usar la forma abreviada `-hf taobao-mnn/MNN-Pocket-0.3B-GGUF:Q4_1`; sin ello, llama.cpp resuelve por defecto a Q8_0 (387 MB).
- No se dispone de datos de latencia o throughput medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B | ~300M (361.551.232 reales) | 32K | 50,00 (BF16) / 49,59 (INT4 QAT) | Apache 2.0 | Hugging Face (GGUF) |
| Gemma-3-270M | 270M | no disponible | 6,42 | no disponible | no disponible |
| ERNIE-4.5-0.3B | 300M | no disponible | 31,99 | no disponible | no disponible |
| LFM2.5-350M | 350M | no disponible | 31,28 | no disponible | no disponible |
| SmolLM2-360M | 360M | no disponible | 18,43 | no disponible | no disponible |
| Hunyuan-0.5B | 500M | no disponible | 31,22 | no disponible | no disponible |
| MiniCPM4-0.5B | 500M | no disponible | 46,81 | no disponible | no disponible |
| Qwen3-0.6B | 600M | no disponible | 44,28 | no disponible | no disponible |

Los datos de la comparativa provienen de la model card del modelo y reflejan la media de la suite de 11 benchmarks. MNN-Pocket-0.3B obtiene la puntuacion media mas alta de la tabla, por delante de MiniCPM4-0.5B y Qwen3-0.6B, a pesar de tener menos parametros.

## Limitaciones y advertencias

- Modelo de menos de mil millones de parametros: el propio autor advierte que no es recomendable para tareas de razonamiento intensivo como matematicas avanzadas o generacion de codigo de largo alcance.
- Solo soporta ingles y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de conocimiento factual.
- No se dispone de informacion sobre sesgos conocidos en la documentacion proporcionada.
- La cuantizacion Q4_1 es la unica entrenada con QAT; las versiones F16 y Q8_0 derivan del checkpoint BF16 y no conservan la ventaja del entrenamiento con cuantizacion.
- Sin `--hf-file`, llama.cpp selecciona por defecto Q8_0 y no la version QAT Q4_1, lo que puede llevar a usar una cuantizacion no optimizada para dispositivos con memoria limitada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base original en taobao-mnn/MNN-Pocket-0.3B.
- No se especifica soporte de tool calling ni function calling, lo que limita su uso en pipelines agenticos que dependan de invocacion de herramientas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Press2p/MNN-Pocket-0.3B-GGUF
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Coleccion MNN-Pocket: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio GitHub de MNN: https://github.com/alibaba/MNN
- Informe tecnico (arXiv): https://arxiv.org/pdf/2611.12311
- Model card en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF/blob/main/README-cn.md
- Demo en video: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
