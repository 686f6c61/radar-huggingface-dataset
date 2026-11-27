# 1bit-MONSTER/Qwen3-4B-GGUF

## Resumen

Qwen3-4B-GGUF es una redistribución del cuantizado oficial Q4_K_M de Qwen3-4B, publicado por el usuario 1bit-MONSTER. No se trata de un modelo nuevo ni de una cuantización propia: el archivo `Qwen3-4B-Q4_K_M.gguf` procede de Qwen/Qwen3-4B-GGUF y se re-aloja con métricas de rendimiento medidas en hardware Strix Halo para el motor de inferencia del autor (1bit engine). El modelo base Qwen3-4B, desarrollado por el equipo Qwen de Alibaba, cuenta con 4.022.468.096 parámetros y licencia Apache 2.0.

El interés de esta ficha es doble. Por un lado, documenta una de las rutas más prácticas para ejecutar Qwen3-4B en hardware de consumo: el formato GGUF con cuantización Q4_K_M, que reduce el peso a unos 2,5 GB de repositorio y permite inferencia local en GPUs integradas o dedicadas de gama media. Por otro, aporta cifras de throughput medidas (2386 tok/s de prefill y 71,5 tok/s de generación en un APU Strix Halo con backend Vulkan), un dato poco habitual en repos de cuantizaciones re-alojadas.

Es relevante ahora porque Qwen3-4B es uno de los modelos pequeños de la familia Qwen3 con soporte de modo razonamiento, tool calling y contexto largo, y su versión GGUF facilita el despliegue en entornos sin infraestructura de datacenter. Conviene advertir que este repositorio concreto tiene un uso muy bajo (95 descargas, 0 likes) y que las métricas publicadas corresponden a un backend que el propio autor indica que ya ha sido retirado del motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B: un transformer denso de 4.022 millones de parámetros. Esta ficha no redistribuye pesos en safetensors ni documenta el proceso de entrenamiento; el repositorio contiene únicamente el archivo GGUF cuantizado en Q4_K_M, derivado del cuantizado oficial de Qwen. Por tanto, los detalles de composición del dataset, número de tokens de entrenamiento, fases de RLHF/DPO y cualquier innovación de atención deben consultarse en la documentación del modelo base, no en este repositorio.

La aportación técnica del autor se limita a la re-publicación del archivo y a la medición de rendimiento en su motor propietario (1bit engine). Las cifras publicadas (pp512: 2386 tok/s, tg128: 71,5 tok/s) se obtuvieron en un APU Strix Halo con backend Vulkan en septiembre de 2026; el autor señala que ese backend se ha eliminado y que el motor ejecuta ahora el archivo por la ruta HRX GPU, cuyas métricas están pendientes de re-medición. No se documentan innovaciones de decodificación especulativa ni de atención lineal.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y resolución de problemas: capacidades heredadas del modelo base Qwen3-4B, no verificadas de forma independiente en este repositorio.
- Generación de código y matemáticas: heredadas del modelo base; no se aportan evaluaciones específicas en la información disponible.
- Tool calling y function calling: atribuible al modelo base Qwen3, no documentado en la model card de esta redistribución.
- Modo de razonamiento extendido (thinking): propia de la familia Qwen3, no confirmada explícitamente en este repositorio.
- Capacidades multilingües: el campo de idiomas no está disponible en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue servido, aunque no se detalla el protocolo.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU dedicada: el archivo Q4_K_M de unos 2,5 GB cabe en memoria unificada de APUs como Strix Halo, donde el autor reporta 71,5 tok/s de generación, suficiente para asistentes interactivos.
- Prototipado de asistentes conversacionales: el formato GGUF y la etiqueta `conversational` permiten levantar un servidor de chat con llama.cpp u Ollama en minutos, sin dependencias de CUDA.
- Evaluación de motores de inferencia alternativos: el repositorio incluye una ruta de ejecución concreta (`1bit serve -m ... --device hrx`) y métricas de referencia, útil para comparar backends (Vulkan, HRX, CPU) sobre el mismo archivo.
- Despliegue en edge computing con presupuesto de memoria ajustado: 4.022 millones de parámetros en Q4_K_M ocupan aproximadamente 2,5 GB, lo que permite ejecución en dispositivos con 4-8 GB de RAM/VRAM.
- Generación de código en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base facilita la integración en productos comerciales, siempre que se verifique la licencia del cuantizado original.
- Fine-tuning ligero sobre el modelo base y re-cuantización posterior: el GGUF sirve como referencia de calidad para validar que una adaptación propia mantiene el rendimiento del checkpoint oficial tras cuantizar.
- Pruebas de regresión de pipelines de cuantización: al ser una copia de un cuantizado oficial, sirve como línea base para comparar cuantizaciones propias (Q5_K_M, Q6_K, Q8_0) frente a Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de throughput en hardware concreto:

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill (pp512) | 2386 tok/s | Strix Halo, backend Vulkan, septiembre de 2026 |
| Generacion (tg128) | 71,5 tok/s | Strix Halo, backend Vulkan, septiembre de 2026 |
| Metricas en ruta HRX GPU | pendientes de re-medicion | segun el autor |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5 GB para el archivo Q4_K_M, más overhead del runtime (KV cache y buffers de contexto). Con contexto largo, el consumo de KV cache crece de forma proporcional.
- GPU recomendadas: el autor valida Strix Halo (APU AMD con memoria unificada) mediante la ruta HRX GPU. Cualquier GPU con soporte Vulkan o CUDA puede ejecutar el archivo a través de llama.cpp.
- GPU de consumo: sí cabe en GPUs consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RX 6600 y superiores). En iGPUs y APUs depende de la memoria unificada asignada.
- Opciones de despliegue: llama.cpp, Ollama, y el motor propietario 1bit engine (`1bit serve -m Qwen3-4B-Q4_K_M.gguf --device hrx`). No se documenta soporte explícito de vLLM o TGI para este archivo GGUF.
- Latencia y throughput: 71,5 tok/s de generación y 2386 tok/s de prefill en Strix Halo con Vulkan, según medición del autor. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 1bit-MONSTER/Qwen3-4B-GGUF (esta ficha) | 4.022 M | no disponible | GGUF Q4_K_M | Apache 2.0 | Re-alojamiento con metricas en Strix Halo; 95 descargas |
| Qwen/Qwen3-4B-GGUF | 4.022 M | no disponible | GGUF (Q4_K_M, Q5_0, Q5_K_M, Q6_K, Q8_0) | Apache 2.0 | Fuente original del archivo; multiples cuantizaciones |
| Qwen/Qwen3-4B | 4.022 M | no disponible | safetensors | Apache 2.0 | Checkpoint base sin cuantizar, para fine-tuning y evaluacion |
| Otros modelos de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo original: es una copia del cuantizado oficial de Qwen. Cualquier limitación del modelo base Qwen3-4B (sesgos, alucinaciones, cobertura idiomática) aplica sin cambios.
- Las métricas de rendimiento publicadas corresponden a un backend (Vulkan) que el autor indica que ya ha sido retirado del motor; no deben tomarse como representativas de la ruta actual (HRX GPU), cuyas cifras están pendientes.
- El repositorio tiene un uso muy bajo (95 descargas, 0 likes) y no hay evidencia de validación independiente de la integridad del archivo ni de su equivalencia bit a bit con el cuantizado oficial.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al checkpoint en safetensors; para tareas sensibles a la calidad (matemáticas complejas, código de producción) conviene evaluar Q6_K o Q8_0.
- El campo de idiomas no está disponible: no se puede confirmar el soporte multilingüe sin consultar la documentación del modelo base.
- La longitud de contexto no se documenta en este repositorio; debe verificarse en la model card de Qwen3-4B antes de diseñar aplicaciones con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a Qwen y verificar los términos del repositorio original del cuantizado.
- El motor 1bit engine es propietario del autor; la dependencia de una ruta de ejecución no estándar puede complicar la portabilidad a producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Cuantizado oficial de origen: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Motor de inferencia del autor: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
