# mradermacher/cycleinstruct-gemma4-supervisor-GGUF

## Resumen

`mradermacher/cycleinstruct-gemma4-supervisor-GGUF` es la versión cuantizada en formato GGUF de `shareit/cycleinstruct-gemma4-supervisor`, un modelo de 11.907.350.576 parámetros (unos 11,9B) construido sobre la familia Gemma 4 de Google y afinado en dos etapas para una tarea muy concreta: actuar como supervisor de calidad en atención al cliente. El modelo recibe transcripciones de conversaciones, documentos recuperados y categorías, y emite un veredicto de "correcto" o "incorrecto" acompañado de un razonamiento detallado sobre el que se puede auditar la decisión.

La relevancia práctica de este repositorio está en el formato: mradermacher publica once cuantizaciones estáticas (de Q2_K a Q8_0) que permiten ejecutar el modelo en local con llama.cpp, Ollama o LM Studio, desde 4,9 GB en Q2_K hasta 12,8 GB en Q8_0, sin necesidad de GPU de centro de datos. El repositorio acumulaba 89 descargas y 1 like en el momento de la consulta, de modo que la validación comunitaria es todavía escasa y conviene tratar el modelo como candidato a evaluar antes que como componente consolidado.

Es importante subrayar que no es un modelo conversacional de propósito general: es un evaluador especializado, afinado sobre un modelo base con etiqueta `lg-electronics` y distribuido bajo licencia Gemma 4, con soporte declarado de coreano, inglés, alemán, francés y español. Su valor está en el juicio con razonamiento, no en la generación creativa ni en el diálogo abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (modelo denso; no se indica que sea MoE) |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF estáticas: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (sin variantes imatrix/weighted) |
| Idiomas soportados | ko, en, de, fr, es |
| Licencia | Gemma (Gemma 4 license: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |
| Tamaño del repositorio | 83,4 GB |
| Librería declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base `shareit/cycleinstruct-gemma4-supervisor` parte de la familia Gemma 4 de Google y se afina en dos etapas para supervisión de calidad en atención al cliente, según la información pública disponible. El uso declarado es la evaluación de transcripciones de conversación, documentos recuperados y categorías, con salida de veredicto ("correcto"/"incorrecto") más razonamiento explicativo. La etiqueta `cycleinstruct` da nombre al procedimiento de instrucción empleado, y `lg-electronics` identifica el dominio de aplicación del ajuste fino. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

Este repositorio concreto no entrena nada: es una conversión a GGUF (`convert_type: hf`, `quantize_version: 2`) en la que el autor ha generado cuantizaciones estáticas y ha omitido las variantes ponderadas por imatrix. El metadato `skip_mmproj: 1` indica que el proyector multimodal no se ha incluido en estos ficheros, por lo que cualquier capacidad de visión que pudiera tener el modelo base no está disponible en estas cuantizaciones. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) ni detalles de la arquitectura interna más allá de la herencia Gemma 4.

## Capacidades

- Evaluación binaria de respuestas de atención al cliente (correcto/incorrecto) con justificación textual detallada.
- Juicio condicionado a contexto externo: acepta transcripciones de conversación, documentos recuperados (patrón RAG) y categorías como entradas.
- Generación de razonamiento en coreano, inglés, alemán, francés y español.
- Formato conversacional (chat) y compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Uso como "LLM as a judge" dentro de pipelines de evaluación de otros modelos o de agentes humanos.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado; el modelo está diseñado para un paso de juicio, no para planificación.
- Visión: no disponible en estas cuantizaciones (el proyector multimodal se omitió en la conversión).
- Modo "thinking" explícito: no documentado, aunque el modelo genera razonamiento previo al veredicto.

## Casos de uso

- Control de calidad automatizado en contact centers: enviar cada transcripción cerrada junto con la categoría del ticket al modelo para obtener un veredicto y una explicación; el razonamiento generado permite que un supervisor humano audite solo los casos marcados como incorrectos.
- Evaluación de groundedness en sistemas RAG: pasar la pregunta, los documentos recuperados y la respuesta generada por otro modelo para comprobar si la respuesta es correcta respecto a las fuentes, lo que encaja directamente con la formulación de entrada descrita por el autor.
- Etiquetado de datos para entrenamiento: usar el modelo como anotador de pares (respuesta, veredicto) a escala antes de un ajuste fino supervisado de un modelo de atención al cliente más pequeño y rápido.
- Detección de errores de categorización: comprobar si un ticket asignado a una categoría concreta (por ejemplo, garantía o devolución) contiene una respuesta coherente con esa categoría y con la documentación asociada.
- Despliegue on-premise o en entornos aislados: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, permite evaluar conversaciones con datos de clientes sin enviarlos a una API externa, algo relevante en contextos con requisitos de confidencialidad.
- Priorización de revisiones humanas: puntuar lotes de conversaciones y ordenar la cola de revisión por probabilidad de error, reduciendo el volumen de lecturas manuales del equipo de calidad.
- Comparación A/B de versiones de un asistente: ejecutar el mismo conjunto de conversaciones contra dos versiones del bot y medir la tasa de "incorrecto" reportada por el supervisor antes de desplegar.
- Formación de agentes: usar la explicación del veredicto como material de feedback en sesiones de coaching, señalando qué parte de la respuesta falló y por qué.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaños de fichero publicados: Q2_K 4,9 GB; Q3_K_S 5,6 GB; Q3_K_M 6,2 GB; Q3_K_L 6,7 GB; IQ4_XS 6,8 GB; Q4_K_S 7,1 GB; Q4_K_M 7,5 GB; Q5_K_S 8,4 GB; Q5_K_M 8,6 GB; Q6_K 9,9 GB; Q8_0 12,8 GB.
- VRAM estimada (pesos + caché KV y overhead de runtime, estimación propia a partir del tamaño de fichero): Q2_K ~6 GB, Q4_K_M ~9-10 GB, Q5_K_M ~11 GB, Q6_K ~12 GB, Q8_0 ~15 GB. La estimación exacta depende de la longitud de contexto, que no está documentada.
- GPU consumer: una RTX 3060 de 12 GB o una RTX 4070 de 12 GB permiten Q4_K_M y Q5_K_S con contexto moderado; una RTX 4060 Ti de 16 GB o una RTX 4080/4090 de 16-24 GB admiten Q6_K y Q8_0. Con 8 GB de VRAM quedan viables Q2_K y Q3_K_S, con la pérdida de calidad asociada.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para servir varias peticiones concurrentes con contexto largo o para comparar cuantizaciones sin restricciones de memoria.
- Memoria unificada: los equipos Apple Silicon con 16 GB o más pueden ejecutar Q4_K_M y Q5_K_M vía llama.cpp u Ollama con buen rendimiento.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y text-generation-webui para los GGUF; vLLM o TGI si se sirve el modelo base en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información consultada.
- Nota: el autor advierte de que no hay cuantizaciones ponderadas por imatrix para este modelo, por lo que en los niveles bajos (Q2_K, Q3_K_S) la pérdida de calidad frente a un quant imatrix equivalente puede ser mayor de lo habitual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| cycleinstruct-gemma4-supervisor-GGUF (este repositorio) | ~11,9B | no disponible | Gemma 4 | GGUF (11 quants estáticas) | HuggingFace, 89 descargas |
| shareit/cycleinstruct-gemma4-supervisor (base) | ~11,9B | no disponible | Gemma 4 | safetensors | HuggingFace; servido en Featherless AI |
| Familia Gemma 4 (~12B, uso general) | ~12B (según familia) | no disponible | Gemma 4 (algunas fuentes citan Apache 2.0 para la familia; el model card enlaza la licencia Gemma 4) | safetensors, GGUF de terceros | Amplia, con documentación oficial en gemma.ai |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (jueces especializados en atención al cliente) en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea estrecha: está afinado para emitir juicios correcto/incorrecto en atención al cliente; usarlo como chatbot general producirá resultados pobres.
- Riesgo de alucinación en el razonamiento: la justificación puede sonar plausible sin estar respaldada por la transcripción o los documentos; conviene validar el veredicto contra la evidencia citada.
- Idiomas limitados a ko, en, de, fr y es; no hay soporte declarado para otras lenguas y el rendimiento relativo entre ellas no está documentado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con transcripciones muy largas ni planificar la caché KV con precisión.
- Licencia Gemma 4: el uso comercial está sujeto a los términos de Google, que incluyen obligaciones de uso aceptable y cláusulas específicas; hay que revisarlas antes de integrarlo en un producto. Parte de la documentación pública de la familia Gemma 4 cita Apache 2.0, lo que genera ambigüedad y conviene aclarar con el proveedor.
- Cuantizaciones estáticas sin imatrix: los niveles Q2_K y Q3_K_S pueden degradar notablemente la calidad del juicio; para producción se recomienda Q4_K_M o superior.
- Validación comunitaria escasa (89 descargas, 1 like) y procedencia del ajuste fino poco documentada: no hay información pública sobre el dataset, el proceso de anotación ni las métricas de calidad del juez.
- Sin proyector multimodal en estos ficheros: no se puede procesar imagen o audio aunque el modelo base los soportara.
- Sesgos: no documentados por el autor; al estar especializado en un dominio corporativo concreto (LG Electronics) puede heredar sesgos de ese corpus y de las políticas de atención al cliente subyacentes.
- No hay garantía de calibración: la salida binaria no viene acompañada de una probabilidad, por lo que el umbral de decisión debe construirse externamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cycleinstruct-gemma4-supervisor-GGUF
- Modelo base: https://huggingface.co/shareit/cycleinstruct-gemma4-supervisor
- Página de descargas del cuantizador: https://hf.tst.eu/model#cycleinstruct-gemma4-supervisor-GGUF
- Ficha en Featherless AI: https://featherless.ai/models/shareit/cycleinstruct-gemma4-supervisor
- Documentación oficial de Gemma 4: https://gemma.ai/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de Gemma 4 en local con Codex CLI: https://codex.danielvaughan.com/2026/04/10/gemma-4-local-model-codex-cli-complete-setup-guide/
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
