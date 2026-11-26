# jesdga/Qwen3.8-27B-Basalt

## Resumen

Qwen3.8-27B-Basalt es un fichero de modelo empaquetado para Basalt, un motor de inferencia local desarrollado por jesdga (J. Gulfo) y optimizado para GPUs NVIDIA Blackwell (sm_120). No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint cuantizado QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (a su vez derivado de Qwen/Qwen3.8-27B) a un formato autocontenido que incluye pesos, tokenizador, capa MTP, un block drafter DFlash 2 y la torre de visión. El resultado es un único fichero de 19,7 GiB que cabe en una sola GPU de 32 GB.

El modelo subyacente es denso, de 27B parámetros, con una ventana de contexto de 262.144 tokens según la configuración de ejemplo del autor. La propuesta de valor no está en el modelo en sí, sino en el empaquetado: Basalt aplica decodificación especulativa con un drafter de bloques y mantiene activaciones de 16 bits en decodificación (solo la lectura de prompt usa 4 bits), lo que según el autor preserva la distribución de salida del modelo original mientras multiplica el throughput.

Es relevante ahora porque demuestra que un modelo de 27B cuantizado a NVFP4 puede servirse con contexto completo de 256k en una RTX 5090 con velocidades de decodificación de entre 90 y 776 tok/s según el modo, exponiendo APIs compatibles con OpenAI y Anthropic. El motor Basalt es MIT; el fichero del modelo es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); incluye capa MTP y block drafter DFlash 2 para decodificacion especulativa |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según configuración de ejemplo con KV int8) |
| Tipos de cuantizacion | NVFP4 en proyecciones GDN, atención y MLP; FP8 en la cabeza de salida; BF16 en proyecciones a/b de GDN, embedding y torre de visión; Q8_0 en capa MTP y drafter; KV cache fp16 o int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (motor Basalt: MIT) |
| Formato de pesos | `.basalt` (fichero autocontenido de 19,7 GiB), librería `basalt` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros. Sobre él, QUASAR-QAT aplicó quantización con entrenamiento (QAT) para producir un checkpoint NVFP4, que es el punto de partida de este empaquetado. Basalt no reentrena: convierte ese checkpoint a su formato, preservando bit a bit las proyecciones cuantizadas de QUASAR, redondeando la cabeza de salida BF16 a filas FP8 y manteniendo en BF16 las proyecciones a/b de GDN, el embedding y la torre de visión. La capa MTP y el block drafter DFlash 2 (procedente de z-lab/Qwen3.8-27B-DFlash2) se almacenan en Q8_0, pero solo generan borradores que el modelo verifica, por lo que no alteran la salida.

La innovación principal es el pipeline de decodificación especulativa combinado con cuantización mixta: en decodificación se mantienen activaciones de 16 bits y solo la lectura de prompt usa activaciones de 4 bits, tal como QUASAR fue entrenado. El drafter de bloques permite que la salida greedy con drafting sea idéntica a la greedy sin drafting, y que el muestreo con speculative sampling siga exactamente la distribución del modelo. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de visión: el paquete incluye la torre de visión y la configuración admite `"vision": "dynamic"`.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa con drafter de bloques (DFlash 2) para acelerar la generación sin alterar la distribución de salida.
- Servidor compatible con las APIs de OpenAI y Anthropic, lo que facilita la integración con clientes existentes.
- Soporte de KV cache en fp16 e int8.
- Ejecución en una sola GPU Blackwell (sm_120).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en un servidor compatible con la API de OpenAI y consumirse desde editores o IDE; la decodificación con drafting en modo estructurado alcanza 776 tok/s en una RTX 5090, lo que lo hace viable para autocompletado interactivo.
- Análisis de documentos largos: con 262.144 tokens de contexto y KV int8 en 32 GB, permite procesar contratos, informes o bases de código completas en una sola pasada sin fragmentar el prompt.
- Atención al cliente automatizada: el contexto largo y el servidor multi-slot (`--parallel 2` o `--parallel 4`, con 408 y 566 tok/s agregados) permiten gestionar varias conversaciones simultáneas en una única GPU.
- Procesamiento de imágenes con descripción textual: la torre de visión incluida permite tareas de image-to-text, como extracción de datos de capturas o descripción de diagramas, dentro del mismo endpoint.
- Despliegue en estaciones de trabajo con una sola RTX 5090: para equipos que no pueden costear clústeres, el fichero de 19,7 GiB y el contexto completo en 32 GB ofrecen un modelo de 27B con calidad próxima al BF16 (KLD media de 0,0262 frente a la referencia).
- Generación de prosa y contenido largo: el modo drafted en prosa rinde 194 tok/s, adecuado para redacción asistida por lotes o generación de borradores extensos.
- Inferencia por lotes con requisitos de reproducibilidad: la salida greedy con drafting es idéntica a la greedy plana, lo que permite pipelines deterministas con aceleración.

## Benchmarks y rendimiento

Datos de velocidad publicados por el autor con `basalt-bench` en una RTX 5090 a 400 W, KV fp16, primeras ejecuciones en frío:

| Métrica | tok/s |
|---|---:|
| Lectura de prompt, 4k tokens | 12.735 |
| Lectura de prompt, 16k tokens | 10.850 |
| Lectura de prompt, 32k tokens | 8.751 |
| Lectura de prompt, 64k tokens | 6.201 |
| Decodificación plana | 90 |
| Decodificación con drafting, chat | 262 |
| Decodificación con drafting, estructurado | 776 |
| Decodificación con drafting, prosa | 194 |
| Decodificación `--parallel 2` (todos los slots) | 408 |
| Decodificación `--parallel 4` (todos los slots) | 566 |

Calidad medida con `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens, frente al modelo BF16:

| KV cache | PPL | KLD media | mismo top-1 |
|---|---:|---:|---:|
| fp16 | 6,839 | 0,0262 | 92,82% |
| int8 | 6,826 | 0,0259 | 92,89% |
| Referencia BF16 | 6,741 | — | — |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 19,7 GiB; con KV int8 cabe el contexto completo de 262.144 tokens en una GPU de 32 GB.
- GPU recomendadas: NVIDIA Blackwell sm_120, en particular RTX 5090 (probada por el autor); otras GPUs Blackwell de 32 GB o más son compatibles en principio con el motor.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con KV int8 y contexto completo.
- Opciones de despliegue: exclusivamente el motor Basalt (versión 0.4.0 o posterior), que expone APIs compatibles con OpenAI y Anthropic. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI con este formato `.basalt`.
- Latencia y throughput: ver tabla de benchmarks; la decodificación plana es de 90 tok/s y con drafting entre 194 y 776 tok/s según el tipo de contenido, con lectura de prompt entre 6.201 y 12.735 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Basalt | 27B denso | 262.144 | `.basalt` / Basalt | Apache-2.0 | NVFP4 con drafter DFlash 2; solo Blackwell |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | 27B denso | no disponible | safetensors NVFP4 | Apache-2.0 | Checkpoint origen, requiere motor compatible con NVFP4 |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | Apache-2.0 | Drafter de bloques usado por Basalt |
| Qwen/Qwen3.8-27B | 27B denso | no disponible | safetensors BF16 | Apache-2.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor Basalt: el fichero `.basalt` no es cargable por vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y crea dependencia de un único proyecto.
- Restricción de hardware: requiere GPU NVIDIA Blackwell (sm_120); no funciona en arquitecturas anteriores (Ampere, Hopper, Ada).
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingüe sin verificación empírica.
- Sesgos y alucinaciones: no hay información específica en la model card; deben asumirse los del modelo base Qwen3.8-27B, no evaluados aquí.
- La capa MTP y el drafter están en Q8_0: aunque el autor afirma que el modelo verifica cada borrador y la salida no cambia, cualquier fallo del motor en esa verificación podría introducir desviaciones.
- La calidad medida (KLD media 0,0262, mismo top-1 92,82%) indica una pérdida no nula frente al BF16; para tareas sensibles a la precisión conviene validar con datos propios.
- Los benchmarks de velocidad proceden del propio autor y de una única configuración (RTX 5090 a 400 W, ejecuciones en frío); no son reproducibles de forma independiente con la información disponible.
- Soporte de tool calling, agentes y function calling no documentado: verificar antes de usarlo en pipelines de producción que dependan de estas capacidades.
- Licencia Apache-2.0 permite uso comercial del modelo, pero el motor Basalt es MIT y su madurez y soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesdga/Qwen3.8-27B-Basalt
- Modelo base cuantizado: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Block drafter: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor Basalt (repositorio): https://github.com/jesdga95/basalt
- Web del proyecto: https://basalt.jgulfo.com
- Documentación de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision/qwen38-27b.md
- Metodología de calidad: https://github.com/jesdga95/basalt/blob/main/docs/precision/quality.md
- Formato de fichero de modelo: https://github.com/jesdga95/basalt/blob/main/docs/model-file.md#qwen38-27b-pack
- Referencias BF16 para KLD: https://huggingface.co/datasets/jesdga/basalt-kld-bases
