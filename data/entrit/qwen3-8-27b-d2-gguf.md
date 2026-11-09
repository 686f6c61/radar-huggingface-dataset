# Entrit/Qwen3.8-27B-d2-GGUF

## Resumen

Entrit/Qwen3.8-27B-d2-GGUF es una cuantización en formato GGUF del modelo denso Entrit/Qwen3.8-27B-d2dense, publicada por Entrit. El modelo subyacente es una versión modificada de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 26.900 millones de parámetros. La particularidad de esta publicación no es el modelo en sí, sino el códec de compresión propietario D2NL de Entrit, que reduce el peso en disco de 55 GB a 15,3 GB manteniendo una fidelidad muy alta respecto al modelo de referencia.

El archivo emplea una cuantización de 4,5 bits por peso con 9 niveles posibles por matriz de pesos, una escala por cada 64 pesos, y mantiene las proyecciones de embedding y cabeza de salida en Q8_0 y las proyecciones pequeñas de compuerta DeltaNet y las normas en F16/F32. Según la model card, la perplejidad en wikitext-2 pasa de 6,959 en el modelo de referencia a 6,963 en esta versión, con una divergencia KL media de 0,00067 y una coincidencia top-1 del 98,6%.

La relevancia práctica es que permite ejecutar un modelo de 27B en una única GPU de 24 GB, algo imposible con los cuantizadores GGUF convencionales a esa fidelidad. El coste es la dependencia de un kernel propio: llama.cpp estándar, Ollama y LM Studio no pueden cargar el archivo, y es necesario instalar el kernel de Entrit. La licencia es Apache 2.0, heredada de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas de atención, DeltaNet y MLP (derivado de Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | D2NL propietario: 4,5 bits por peso, 9 niveles por peso ({0, ±1, ±2,83, ±5,20, ±8}), una escala por cada 64 pesos; embedding y cabeza de salida en Q8_0; compuertas DeltaNet y normas en F16/F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (D2NL), 15,3 GB en disco; repo de 16,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~26,9B parámetros que combina capas de atención estándar con capas DeltaNet (atención lineal con estado recurrente) y proyecciones MLP. Esta publicación no entrena nada nuevo: toma los pesos del modelo Entrit/Qwen3.8-27B-d2dense y los recodifica con el códec D2 de Entrit. Las proyecciones de atención, DeltaNet y MLP se almacenan con cuantización de 9 niveles y una escala compartida por cada 64 pesos, mientras que las partes más sensibles (embedding, cabeza de salida, compuertas pequeñas y normas) se mantienen en Q8_0, F16 o F32 para limitar la degradación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, más allá de que hereda el linaje de Qwen3.8-27B. La innovación técnica destacable es el propio códec D2NL: consigue una relación de compresión de aproximadamente 3,6× respecto al modelo en precisión completa (55 GB a 15,3 GB) con una pérdida de perplejidad de 0,004 puntos en wikitext-2 y un 98,6% de coincidencia top-1. El códec está sujeto a solicitudes de patente pendientes por parte de Entrit Systems.

## Capacidades

- Generación de texto conversacional y de un solo turno, según el pipeline declarado (`text-generation`).
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8-27B.
- Capacidad multilingüe: no confirmada en la información disponible para esta publicación.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no documentado.
- Ejecución en GPU única de 24 GB gracias a la compresión D2NL.

## Casos de uso

- Despliegue de un modelo de 27B en una estación de trabajo con una RTX 3090 o RTX 4090: el archivo ocupa 15,3 GB y, según la model card, genera a 34,9 tokens/s en CUDA y 28,3 tokens/s en Vulkan sobre una RTX 3090, lo que permite uso interactivo sin infraestructura de servidor.
- Prototipado e investigación en local: útil para equipos que quieren evaluar el comportamiento de un modelo de 27B en tareas de generación sin alquilar GPUs de 80 GB, aceptando la dependencia del kernel de Entrit.
- Generación de texto en lote con requisitos moderados de latencia: con 1231 tokens/s de procesamiento de prompt en CUDA, es viable procesar documentos largos y generar resúmenes o extracciones en pipelines offline.
- Evaluación comparativa de cuantizadores: el par de referencia (perplejidad 6,959 frente a 6,963) permite medir el impacto del códec D2 frente a otras cuantizaciones de 4-5 bits en tareas downstream propias.
- Asistentes conversacionales autoalojados: al ser un modelo denso de 27B con licencia Apache 2.0, puede integrarse en servicios internos de chat siempre que se valide el soporte del kernel en el entorno de producción.
- Investigación sobre atención lineal y arquitecturas híbridas: las capas DeltaNet del modelo base lo hacen interesante para estudiar el comportamiento de atención lineal a escala de 27B, aunque la cuantización introduce una variable adicional a controlar.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de la cuantización y de velocidad, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Modelo d2 de referencia | Este archivo (D2NL) |
|---|---|---|
| Perplejidad wikitext-2 (32 × 512 tokens) | 6,959 | 6,963 |
| Divergencia KL media | — | 0,00067 |
| Coincidencia top-1 | — | 98,6% |

| Backend (RTX 3090) | Procesamiento de prompt | Generación |
|---|---|---|
| CUDA | 1231 tokens/s | 34,9 tokens/s |
| Vulkan | 777 tokens/s | 28,3 tokens/s |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,3 GB de pesos más overhead de contexto y estado recurrente de las capas DeltaNet; encaja en GPUs de 24 GB con margen para contexto moderado.
- GPU recomendadas: RTX 3090 (mediciones publicadas), RTX 4090 y GPUs profesionales con 24 GB o más (A100 40/80 GB, H100) para mayor contexto y throughput.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y modelos con 24 GB de VRAM; no se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente el kernel Entrit/llama.cpp-d2nl con los scripts `get-model.sh` y `run.sh`. llama.cpp estándar, Ollama y LM Studio no pueden cargar el archivo.
- Latencia y throughput: 34,9 tokens/s de generación y 1231 tokens/s de prompt en CUDA sobre RTX 3090; 28,3 y 777 tokens/s respectivamente en Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Entrit/Qwen3.8-27B-d2-GGUF | ~26,9B | No disponible | D2NL 4,5 bits (15,3 GB) | Apache 2.0 | Requiere kernel Entrit |
| Entrit/Qwen3.8-27B-d2dense (base) | ~26,9B | No disponible | Precisión del modelo base (55 GB) | Apache 2.0 | Pesos densos estándar |
| Qwen/Qwen3.8-27B (original) | ~27B | No disponible en esta ficha | safetensors / GGUF estándar | Apache 2.0 | Ecosistema estándar (llama.cpp, vLLM, TGI) |

La comparativa con cuantizaciones GGUF convencionales de 4-5 bits (Q4_K_M, Q5_K_M) no está disponible en la información proporcionada; la model card solo compara contra el modelo d2 en forma exacta.

## Limitaciones y advertencias

- Dependencia total del kernel propietario de Entrit: sin `Entrit/llama.cpp-d2nl` el archivo es inutilizable, lo que limita la portabilidad y crea un riesgo de proveedor.
- El códec D2 está sujeto a solicitudes de patente pendientes de Entrit Systems; conviene revisar las implicaciones antes de un uso comercial a gran escala, pese a la licencia Apache 2.0 del modelo.
- Sesgos conocidos: no documentados en la información disponible; al heredar el linaje de Qwen3.8-27B, arrastra los sesgos del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Idiomas soportados no confirmados; la model card no detalla cobertura lingüística.
- Longitud de contexto no disponible; el estado recurrente de las capas DeltaNet puede imponer límites prácticos adicionales no documentados.
- Pérdida de fidelidad mínima pero no nula: 98,6% de coincidencia top-1 implica que aproximadamente 1,4 de cada 100 tokens generados difieren del modelo de referencia, con posible impacto acumulado en generaciones largas.
- Sin datos de benchmarks de tareas: no es posible comparar su calidad en MMLU, HumanEval o GSM8K con alternativas.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Entrit/Qwen3.8-27B-d2-GGUF
- Modelo base denso: https://huggingface.co/Entrit/Qwen3.8-27B-d2dense
- Kernel y guía de instalación: https://huggingface.co/Entrit/llama.cpp-d2nl
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto del autor: eric@entrit.io
