# brishen/MemT-1.0-Nano-GGUF

## Resumen

MemT-1.0-Nano-GGUF es una conversión a formato GGUF del modelo MemT-1.0-Nano, desarrollado por MemTensor, publicada por el usuario brishen en HuggingFace. El modelo base combina un backbone Qwen3.6-35B-A3B (una arquitectura MoE de 35B parámetros con aproximadamente 3B activos) con el sistema de memoria nativa MemT, que permite al modelo almacenar y recuperar estado de memoria entre conversaciones de forma nativa, sin depender únicamente de la ventana de contexto.

El problema que resuelve es la persistencia de información a largo plazo: en lugar de reinyectar todo el historial en el prompt, el modelo puede escribir ("commit") información relevante en un estado de memoria persistente y consultarla en peticiones posteriores, reduciendo el consumo de tokens de contexto. Es relevante ahora porque aborda una de las limitaciones clásicas de los LLM en aplicaciones conversacionales y de agentes: la memoria entre sesiones.

Esta ficha cubre la conversión GGUF, que incluye cuantizaciones de Q4_K_M a Q8_0 y mantiene los pesos de memoria (`memt_*`) siempre a Q8_0 para evitar la acumulación de errores en el estado de memoria a lo largo de los tokens comprometidos. La licencia es Apache 2.0, tanto del modelo original como de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con backbone Qwen3.6-35B-A3B + memoria nativa MemT |
| Parametros totales | 35.111.542.048 (~35B) |
| Parametros activos | ~3B (según denominación A3B del backbone; dato aproximado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (pesos memt_* fijados a Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde BF16; original en safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone Qwen3.6-35B-A3B, una arquitectura transformer de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permite inferencia rápida manteniendo la capacidad de un modelo grande. Sobre este backbone se añade el sistema de memoria nativa MemT, implementado mediante pesos adicionales (`blk.*.memt_*`) que mantienen un estado de memoria persistente que se actualiza con cada token comprometido.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay datos disponibles en la información proporcionada; la model card remite al repositorio de MemTensor para la evaluación y citación. Una decisión técnica destacable de la conversión GGUF es que los pesos de memoria se cuantizan siempre a Q8_0 independientemente de la cuantización del resto del modelo, porque los errores de cuantización en estos pesos se acumulan sobre el estado de memoria en cada token escrito. Las cuantizaciones K se generan desde una conversión BF16 sin matriz de importancia (imatrix).

## Capacidades

- Generación de texto conversacional, heredada del backbone Qwen3.6 MoE.
- Memoria nativa persistente: escritura de información en un estado de memoria (`memory_commit`), lectura por identificador (`memory_id`) e ingesta de documentos previa a la generación (`memory_documents`).
- Gestión de memoria vía API: endpoints `GET /memory` y `POST /memory/{id}?action=save|restore|erase` en llama-server, con persistencia en disco mediante `--slot-save-path`.
- Modo de razonamiento configurable: el parámetro `chat_template_kwargs: {"enable_thinking": false}` sugiere soporte de thinking mode activable o desactivable.
- Compatibilidad con la API estándar de OpenAI (`/v1/chat/completions`) extendida con campos de memoria.
- Sin `memory_id`, el modelo se comporta como el backbone base sin memoria.
- Tool calling, capacidades multilingües y visión: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales con memoria entre sesiones: el modelo puede recordar datos personales del usuario (por ejemplo, el nombre de una mascota mencionada semanas atrás) sin reenviar el historial completo, gracias a `memory_id` y `memory_commit`.
- Chatbots de atención al cliente persistentes: cada cliente puede tener su propio estado de memoria guardado y restaurado entre sesiones mediante `POST /memory/{id}?action=save|restore`, evitando que el usuario repita información.
- Gestión documental conversacional: con `memory_documents` se pueden inyectar documentos en la memoria antes de generar, útil para asistentes que responden sobre documentación interna sin saturar la ventana de contexto.
- Agentes de largo plazo: los agentes que operan durante días o semanas pueden persistir su estado de memoria en disco (`--slot-save-path`) y restaurarlo al reanudar la ejecución.
- Despliegue local privado: al ejecutarse con llama.cpp, puede desplegarse on-premise sin envío de datos a terceros, adecuado para entornos con requisitos de privacidad.
- Experimentación e investigación en memoria para LLM: el repositorio incluye el conversor y la API de memoria, lo que permite a investigadores probar arquitecturas de memoria nativa frente a RAG o resumen de contexto.
- Uso como backbone sin memoria: sin `memory_id`, funciona como un MoE Qwen3.6-35B-A3B convencional, útil para tareas de generación de texto general con inferencia eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio original de MemTensor para evaluación, pero no incluye datos concretos de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia completa en GPU (según tabla de cuantizaciones):
  - Q4_K_M: 21,6 GB (cabe en una RTX 4090 de 24 GB o RTX 3090).
  - Q5_K_M: 25,2 GB (requiere 32 GB de VRAM o descarga parcial a CPU/RAM).
  - Q6_K: 29,0 GB (requiere A100 40 GB, 2x RTX 4090 con offload, o RAM + GPU parcial).
  - Q8_0: 37,4 GB (requiere A100 40 GB, H100, o estrategia mixta CPU/GPU).
- El modelo es MoE con ~3B de parámetros activos, por lo que el throughput por token es alto una vez cargado, aunque la memoria total a alojar corresponde a los 35B parámetros.
- Compatible con CPU puro (compilación sin `-DGGML_CUDA=ON`), aunque con latencias notablemente superiores.
- Software: obligatoriamente la rama `memt-native-memory` del fork de llama.cpp de Brishen; el llama.cpp oficial no soporta todavía los pesos `memt_*` y rechazará cargar los ficheros.
- Despliegue recomendado: `llama-server` con `--jinja` y `--slot-save-path` para persistencia de memoria; opciones como vLLM, TGI u Ollama no aparecen mencionadas y no se sabe si soportan el formato MemT.
- Latencia y throughput concretos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Memoria nativa | Licencia | Formato |
|---|---|---|---|---|---|
| MemT-1.0-Nano | ~35B | ~3B | Sí, nativa con estado persistente | Apache 2.0 | GGUF, safetensors |
| Qwen3.6-35B-A3B (backbone base) | ~35B | ~3B | No (solo ventana de contexto) | no disponible | no disponible |
| Qwen3-30B-A3B | 30,5B | 3,3B | No | Apache 2.0 | safetensors, GGUF |

La diferencia diferenciadora de MemT-1.0-Nano frente a sus alternativas directas es la memoria nativa integrada en los pesos, que ninguna de las alternativas ofrece de forma equivalente. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Compatibilidad crítica: el llama.cpp oficial no soporta los pesos de memoria MemT; hay que compilar el fork de Brishen (rama `memt-native-memory`). Intentar cargar los GGUF con upstream fallará.
- Sin imatrix: las cuantizaciones K se han generado sin matriz de importancia, lo que puede degradar ligeramente la calidad respecto a cuantizaciones con imatrix.
- Los pesos de memoria están fijados a Q8_0 por diseño; no deben recuantizarse a precisiones menores porque los errores se acumulan en el estado de memoria.
- Sesgos, riesgo de alucinación y rendimiento multilingüe: no disponible en la información proporcionada; deben evaluarse contra la model card original de MemTensor.
- Longitud de contexto no documentada en esta conversión; verificar en el repositorio original antes de planificar cargas con documentos largos.
- El ecosistema de despliegue está limitado al fork de llama.cpp; no hay evidencia de soporte en vLLM, TGI u Ollama.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes más allá de la atribución y conservación del aviso de licencia.
- Proyecto de un autor individual (brishen) con pocas descargas (2.088) y un like: tratar como software experimental, sin garantía de mantenimiento.

## Enlaces

- Conversión GGUF: https://huggingface.co/brishen/MemT-1.0-Nano-GGUF
- Modelo original: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Fork de llama.cpp con soporte MemT: https://github.com/Brishen/llama.cpp/tree/memt-native-memory
- Commit que añade la memoria MemT: https://github.com/Brishen/llama.cpp/commit/e964c415485f3898d2fb4633c79d8ad38b7abdbc
