# Atomic-Germ/Qwen3.8-9B-Distill-GGUF

## Resumen

Qwen3.8-9B-Distill-GGUF es el repositorio de cuantizaciones GGUF publicado por el usuario Atomic-Germ sobre el modelo empero-ai/Qwen3.8-9B, desarrollado por Empero. Se trata de una destilación de parámetros completos (full-parameter distillation) desde el profesor Qwen3.8 2.4T A95B hacia la arquitectura del alumno Qwen3.5-9B, con 9.197.093.888 parámetros (9,2 B). El objetivo es trasladar capacidad de razonamiento de un modelo MoE de escala frontera a un modelo denso que quepa en hardware de consumo, manteniendo la licencia Apache-2.0 heredada de la base de Qwen.

La relevancia del modelo está en su arquitectura híbrida: Qwen3.5 introduce el patrón Gated DeltaNet, con tres capas de este tipo por cada capa de atención completa, lo que reduce el coste de atención en contextos largos. El repositorio ofrece cinco niveles de cuantización (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16), con el Q4_K_M de 5,780 GB como opción recomendada por el propio autor, y está pensado para ejecutarse en llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.

Se trata de un modelo de razonamiento: cada respuesta se abre con un bloque `<think>`, por lo que el autor recomienda ampliar el límite de tokens generados y eliminar ese bloque antes de mostrarlo al usuario final. La información disponible es limitada: el repositorio tiene 0 descargas y 0 likes, y no se documentan datos sobre longitud de contexto, composición completa del dataset ni resultados de benchmarks del propio GGUF (solo del modelo fuente).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet: tres capas Gated DeltaNet por cada capa de atención completa (arquitectura Qwen3.5) |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | No aplica: el modelo destilado es denso. El profesor, Qwen3.8 2.4T A95B, es MoE con 95 B activos |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo oficial de llama.cpp usa `-n 16384`) |
| Tipos de cuantización | Q4_K_M (5,780 GB), Q5_K_M (6,643 GB), Q6_K (7,559 GB), Q8_0 (9,786 GB) y BF16 (18,407 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp y runtimes compatibles) |
| Tamaño del repositorio | 52,2 GB |
| Modelo base | empero-ai/Qwen3.8-9B (relación: quantized) |
| Pipeline | text-generation |

Los tamaños de archivo están expresados en GB decimales exactos (1 GB = 1.000.000.000 bytes), según los ficheros subidos.

## Arquitectura y entrenamiento

El modelo combina el esquema híbrido de Qwen3.5 con una destilación de parámetros completos, no una destilación selectiva de capas ni un ajuste LoRA. En la arquitectura híbrida, por cada capa de atención completa hay tres capas Gated DeltaNet, un mecanismo de estado recurrente con compuertas que rebaja el coste computacional y de memoria asociado a la atención clásica en secuencias largas. El alumno conserva así la topología de Qwen3.5-9B, mientras que el profesor Qwen3.8 2.4T A95B aporta la señal de entrenamiento.

El entrenamiento se realizó sobre aproximadamente 70.000 trazas de profesor curadas, procedentes de los conjuntos internos de destilación de Qwen3.8 de Empero. La información disponible no detalla el número total de tokens, la composición del dataset, ni si hubo fases posteriores de RLHF, DPO u otro tipo de alineamiento. El modelo resultante es un modelo de razonamiento con protocolo de cadena de pensamiento explícito: las respuestas se emiten dentro de bloques `<think>...</think>`, y los benchmarks del modelo fuente se midieron con protocolos CoT y con `lm-evaluation-harness` bajo ajustes idénticos entre base y alumno.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat embebida en el propio fichero GGUF.
- Razonamiento explícito mediante cadena de pensamiento: toda respuesta abre un bloque `<think>`, que debe separarse del texto mostrado al usuario final.
- Mejora sustancial en conocimiento general y razonamiento multitema respecto a la base: MMLU CoT pasa de 0,546 a 0,751.
- Razonamiento aritmético y matemático de varios pasos (evaluado con GSM8K CoT).
- Capacidad de destilación: hereda patrones de respuesta del profesor Qwen3.8 2.4T A95B.
- Ejecución local en runtimes GGUF estándar (llama.cpp, Ollama, LM Studio, Jan, KoboldCpp).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado con herramientas: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; el modelo es únicamente de texto.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede ejecutarse en un portátil o en una estación de trabajo con GPU de 8-12 GB usando el Q4_K_M de 5,780 GB, sin depender de APIs externas ni enviar datos a terceros.
- Razonamiento matemático asistido: con un rendimiento de 0,870 en GSM8K CoT, es adecuado para resolver problemas aritméticos de varios pasos en entornos educativos o de validación de cálculos, mostrando la cadena de razonamiento al usuario si se desea auditar el resultado.
- Generación de explicaciones técnicas en inglés: la mejora de +0,205 en MMLU CoT frente a la base lo hace útil para tareas de pregunta-respuesta sobre conocimiento general y material de referencia, siempre con verificación humana por riesgo de alucinación.
- Procesamiento por lotes en servidor sin GPU de gama alta: mediante llama.cpp o un runtime GGUF, se pueden servir peticiones con la cuantización Q5_K_M o Q6_K en tarjetas de 12-16 GB, con la plantilla de chat ya incluida en el fichero.
- Prototipado e investigación sobre arquitecturas híbridas: al usar Gated DeltaNet, sirve como banco de pruebas para medir el comportamiento de modelos con capas recurrentes con compuertas frente a transformers de atención completa, especialmente en lo relativo a memoria de la caché KV.
- Base para ajuste fino o destilación adicional: al estar bajo Apache-2.0 y en formato GGUF, puede servir de referencia de calidad, aunque para reentrenamiento convendría partir del repositorio base en precisión completa (BF16, 18,407 GB).
- Despliegue en aplicaciones de escritorio offline: compatible con LM Studio, Jan y KoboldCpp, lo que permite integrarlo en herramientas locales con temperatura 0,6, top_p 0,95 y top_k 20 como ajustes recomendados.
- Evaluación comparativa de cuantizaciones: el repositorio publica cinco niveles de cuantización (de Q4_K_M a BF16) sobre el mismo modelo, lo que permite medir la degradación de calidad por cuantización en un mismo conjunto de tareas.

## Benchmarks y rendimiento

Resultados publicados para el modelo fuente empero-ai/Qwen3.8-9B, medidos con protocolos CoT y `lm-evaluation-harness`, con ajustes idénticos entre base y alumno:

| Tarea | Qwen3.5-9B (base) | Qwen3.8-9B | Δ |
|---|---:|---:|---:|
| mmlu (CoT, 57 asignaturas) | 0,546 | 0,751 | +0,205 |
| gsm8k_cot | 0,885 | 0,870 | −0,015 |

No se han publicado resultados de benchmarks específicos para las cuantizaciones GGUF de este repositorio en la información disponible. Tampoco hay datos de MMLU-Pro, HumanEval, matemáticas de competición ni evaluaciones multilingües.

## Requisitos de hardware

- VRAM estimada según el peso de los ficheros: Q4_K_M 5,780 GB, Q5_K_M 6,643 GB, Q6_K 7,559 GB, Q8_0 9,786 GB y BF16 18,407 GB.
- Guía del autor por cuantización: Q4_K_M y Q5_K_M son cómodos en tarjetas de 8-12 GB para uso diario; Q6_K y Q8_0 recomiendan 12-16 GB; BF16 requiere 24 GB o más.
- Cabe en GPU de consumo: sí, en el rango de 8-16 GB con cuantizaciones Q4_K_M a Q8_0, siempre que se use una compilación reciente de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet.
- Modelos de GPU concretos: no disponible en la información proporcionada; el autor solo ofrece rangos de VRAM, no modelos específicos (A100, H100, RTX 4090, etc.).
- La caché KV es el coste dominante en contextos largos y puede exigir offload a CPU/RAM independientemente de la cuantización de los pesos.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, Jan y KoboldCpp. El autor no menciona soporte de vLLM, TGI ni TensorRT-LLM para este repositorio.
- Compilaciones antiguas de llama.cpp fallarán al cargar la arquitectura por falta de soporte de Gated DeltaNet.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill (GGUF) | 9,2 B denso | No disponible | Apache-2.0 | GGUF (Q4_K_M a BF16) | MMLU CoT 0,751; GSM8K CoT 0,870 |
| Qwen3.5-9B (base del alumno) | 9 B según denominación (no confirmado) | No disponible | Apache-2.0 | No disponible | MMLU CoT 0,546; GSM8K CoT 0,885 |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T totales / 95 B activos (MoE) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otras alternativas de tamaño similar (por ejemplo, modelos densos de 8-9 B de otros fabricantes) en la información proporcionada, por lo que la comparación se limita a los tres modelos citados en la propia model card.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`language: en`). No hay evidencia de soporte fiable en castellano u otras lenguas.
- Modelo de razonamiento: cada respuesta incluye un bloque `<think>`, lo que incrementa el consumo de tokens y exige filtrar el contenido antes de mostrarlo al usuario final.
- Riesgo de alucinación: no se documentan tasas de error ni evaluaciones de fidelidad; como en cualquier LLM, las afirmaciones factuales deben verificarse.
- Sesgos: no se publica información sobre sesgos, composición demográfica del dataset ni evaluaciones de seguridad o toxicidad.
- Rendimiento desigual: aunque MMLU CoT mejora +0,205, GSM8K CoT retrocede ligeramente (−0,015), de modo que la destilación no mejora todas las capacidades.
- Alineamiento: no se indica si hubo RLHF, DPO u otras fases de alineamiento, por lo que el comportamiento en producción puede no estar ajustado a instrucciones ni a políticas de seguridad.
- Longitud de contexto no documentada: el autor no especifica la ventana soportada; el ejemplo de uso emplea `-n 16384` como límite de generación, no como contexto.
- Dependencia de runtime: requiere una compilación reciente de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet; versiones antiguas no cargarán el modelo.
- Coste de memoria: en contextos largos la caché KV puede dominar el consumo y forzar offload incluso con cuantizaciones pequeñas.
- Licencia: Apache-2.0 heredada de la base de Qwen, lo que permite uso comercial; el autor indica que los pesos se comparten "as-is", sin garantías.
- Repositorio de terceros: la cuantización la publica el usuario Atomic-Germ, no Empero; el repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria de la calidad de los ficheros.
- Evaluaciones del GGUF: los resultados de benchmarks corresponden al modelo fuente, no a estas cuantizaciones concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Atomic-Germ/Qwen3.8-9B-Distill-GGUF
- Modelo base de la cuantización: https://huggingface.co/empero-ai/Qwen3.8-9B
- Arquitectura base del alumno: https://huggingface.co/Qwen/Qwen3.5-9B
- Empero (desarrollador del modelo fuente): https://empero.org
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp

Nota: los resultados de búsqueda web proporcionados no contienen información relacionada con este modelo (corresponden a una marca de esquís, una cartera de criptomonedas, un servicio de correo y una serie de televisión), por lo que no se han podido incorporar enlaces adicionales como papers, blogs técnicos o demos.
