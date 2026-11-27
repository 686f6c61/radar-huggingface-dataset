# 1bit-MONSTER/granite-4.1-30b-GGUF

## Resumen

`1bit-MONSTER/granite-4.1-30b-GGUF` es una redistribución en formato GGUF del modelo `ibm-granite/granite-4.1-30b` de IBM, cuantizado en Q4_K_M. El repositorio está publicado por el usuario 1bit-MONSTER y no aporta pesos nuevos ni un proceso de entrenamiento propio: se limita a re-alojar la cuantización oficial de IBM junto con métricas de rendimiento medidas sobre hardware Strix Halo con el motor de inferencia propio del autor (1bit engine). Su interés práctico es acotado: sirve como punto de descarga alternativo del GGUF Q4_K_M de Granite 4.1 30B y como referencia de throughput en un entorno concreto (Strix Halo con backend Vulkan).

El modelo base es un transformer denso de IBM perteneciente a la familia Granite 4.1, con 28.865.728.512 parámetros reales según los safetensors del modelo original (unos 28,9 mil millones, comercializado como "30B"). La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia. El repositorio ocupa 17,5 GB y contiene un único fichero GGUF.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización utilizable en entornos con memoria limitada; por otro, advierte de que el repositorio tiene muy poca tracción (24 descargas, 0 likes en el momento de la consulta) y de que las métricas publicadas corresponden a un backend que el propio autor indica que ya ha sido retirado del motor. Para producción conviene acudir al repositorio oficial de IBM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer denso de la familia Granite 4.1; no se detalla en la información proporcionada) |
| Parámetros totales | 28.865.728.512 (28,9 B) |
| Parámetros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (único fichero publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.1-30b-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el corpus de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF, DPO u otras) del modelo base `ibm-granite/granite-4.1-30b`. La model card de este repositorio no describe el modelo, solo la cuantización y el procedimiento de ejecución. Los datos objetivos disponibles son el recuento de parámetros (28.865.728.512) y la etiqueta `base_model` que apunta a IBM como origen.

La aportación técnica de este repositorio es la cuantización Q4_K_M, que reduce el peso a un fichero de aproximadamente 17,5 GB (coherente con ~4,5 bits por parámetro más metadatos). El autor declara que la cuantización es la oficial de IBM (`ibm-granite/granite-4.1-30b-GGUF`) y que únicamente la re-aloja; por tanto, no hay innovación propia en el proceso de cuantización. Las métricas publicadas (pp512: 264 tok/s, tg128: 11,0 tok/s) se midieron en septiembre de 2026 sobre Strix Halo con el backend Vulkan del 1bit engine, backend que el autor indica que ya ha sido eliminado del motor; las cifras con la ruta HRX GPU están pendientes de re-medición.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `endpoints_compatible`, lo que sugiere compatibilidad con la API de endpoints de Hugging Face para chat.
- Ejecución local mediante llama.cpp: al ser un GGUF, es consumible por el ecosistema llama.cpp y derivados.
- Razonamiento, código, matemáticas, tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada. Estas capacidades dependen del modelo base de IBM y no se documentan en este repositorio.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU integrada: el fichero Q4_K_M de ~17,5 GB puede cargarse en equipos con 24 GB de memoria unificada o VRAM, como el Strix Halo empleado por el autor, y usarse para asistentes conversacionales offline.
- Sustitución de descarga del GGUF oficial: si el repositorio de IBM no está accesible o se prefiere una copia espejo, este repo ofrece el mismo fichero Q4_K_M con licencia Apache 2.0.
- Prototipado rápido con llama.cpp: al ser un GGUF estándar, permite probar el modelo en pipelines de generación de texto sin convertir pesos ni montar infraestructura de servido compleja.
- Evaluación de motores de inferencia alternativos: las métricas publicadas (264 tok/s en prefill, 11 tok/s en decodificación sobre Strix Halo) sirven como referencia para comparar el 1bit engine con llama.cpp u otros runners en el mismo hardware.
- Experimentación académica con modelos de ~30 B en cuantización de 4 bits: útil para estudiar el impacto de Q4_K_M en calidad frente a FP16/BF16, siempre que se validen las capacidades reales del modelo base.
- Pruebas de integración con la API de endpoints de Hugging Face: la etiqueta `endpoints_compatible` permite desplegarlo como endpoint gestionado para demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son de throughput de inferencia, medidas por el autor:

| Métrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill, 512 tokens) | 264 tok/s | Strix Halo, Vulkan, 1bit engine (medición de 2026-09) |
| tg128 (generación, 128 tokens) | 11,0 tok/s | Strix Halo, Vulkan, 1bit engine (medición de 2026-09) |

Advertencia: el propio autor indica que el backend Vulkan usado para estas mediciones ha sido retirado del motor y que las cifras con la ruta HRX GPU están pendientes de re-medición. No son extrapolables a otros hardware ni a llama.cpp.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero Q4_K_M ocupa aproximadamente 17,5 GB; se necesita al menos esa cantidad más overhead de contexto y caché KV. Con contexto largo, prever 20-24 GB.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. Por tamaño, encaja en GPUs con 24 GB o más (RTX 4090, A10G 24 GB, L4 24 GB no alcanza con contexto amplio, A100 40/80 GB, H100).
- GPU de consumo: sí cabe en RTX 4090 (24 GB) con margen ajustado; en GPUs de 16 GB no cabe sin cuantizaciones más agresivas (no publicadas en este repo). También es viable en equipos con memoria unificada de 32 GB o más (Strix Halo, Apple Silicon de gama alta).
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el autor documenta el uso con su propio motor mediante `1bit serve -m granite-4.1-30b-Q4_K_M.gguf --device hrx`. vLLM y TGI no se mencionan; su soporte para GGUF es limitado y no está confirmado para este fichero.
- Latencia y throughput: 264 tok/s de prefill y 11,0 tok/s de decodificación en Strix Halo con Vulkan según el autor; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización disponible | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/granite-4.1-30b-GGUF (este repo) | 28,9 B | no disponible | Q4_K_M | Apache 2.0 | Hugging Face, 24 descargas |
| ibm-granite/granite-4.1-30b-GGUF (oficial) | 28,9 B | no disponible | Q4_K_M (origen del fichero) | Apache 2.0 | Hugging Face (repo oficial de IBM) |
| ibm-granite/granite-4.1-30b (pesos completos) | 28,9 B | no disponible | safetensors (BF16/FP16 presumiblemente) | Apache 2.0 | Hugging Face (repo oficial de IBM) |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, alternativas densas de ~30 B de otros fabricantes) en la documentación proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Repositorio no oficial: es una redistribución de un tercero, no mantenida por IBM. No hay garantía de actualizaciones, integridad a largo plazo ni soporte.
- Métricas obsoletas: las cifras de rendimiento se midieron con un backend (Vulkan) que el autor declara retirado; no deben usarse para planificar capacidad en producción.
- Tracción mínima: 24 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria del fichero.
- Calidad del modelo base no documentada aquí: no se dispone de datos sobre sesgos, tasa de alucinación, rendimiento multilingüe ni capacidades reales del modelo Granite 4.1 30B en esta ficha.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide dimensionar la caché KV y planificar casos de uso con documentos largos.
- Cuantización única: solo se publica Q4_K_M; no hay variantes Q5, Q6, Q8 ni de menor tamaño para GPUs con menos memoria.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base en el repositorio de IBM por si hubiera condiciones adicionales de uso aceptable no reflejadas aquí.
- Dependencia del motor del autor: la ruta de ejecución documentada (`1bit serve`) es específica del 1bit engine; fuera de ese entorno, el uso estándar es llama.cpp, cuyos resultados pueden diferir de las métricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/granite-4.1-30b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- GGUF oficial de IBM: https://huggingface.co/ibm-granite/granite-4.1-30b-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Familia 1bit en Hugging Face: https://huggingface.co/1bit-MONSTER#families
