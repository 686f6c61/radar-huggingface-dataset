# cs-file-uploads/loc-gemma3-27b-adapter

## Resumen

`cs-file-uploads/loc-gemma3-27b-adapter` es un adaptador LoRA (PEFT) publicado por la cuenta `cs-file-uploads` sobre el modelo base `google/gemma-3-27b-it`. Su única finalidad declarada es la extracción de un esquema estructurado de líneas de crédito (*line of credit*) a partir de extractos de informes 10-K: importe dispuesto, capacidad no utilizada, total e indicador de presencia. No es un modelo autónomo: sin el base de 27.000 millones de parámetros no puede ejecutarse, y el repositorio solo contiene los pesos del adaptador (0,3 GB en safetensors).

El entrenamiento se realizó sobre 1.058 registros, con selección del checkpoint en una partición de desarrollo reservada (*held-out dev split*). Es un ajuste fino estrecho y orientado a una tarea de extracción de información financiera, no un modelo conversacional de propósito general. La relevancia práctica está en que demuestra un patrón habitual y barato en la industria: adaptar un modelo grande ya existente a un esquema de extracción muy concreto con un conjunto de datos pequeño, en lugar de entrenar desde cero.

La ficha del repositorio es mínima: no declara licencia propia, idiomas, pipeline ni métricas de evaluación, y cuenta con 0 descargas y 0 *likes* en el momento de la consulta. La fecha de creación registrada es el 11 de octubre de 2026 y la de actualización, 16 segundos después, lo que sugiere una publicación sin mantenimiento posterior. Todo lo relativo a arquitectura, contexto y capacidades multilingües debe atribuirse al modelo base, no al adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-3-27b-it`; el base es un transformer decoder-only denso y multimodal (texto e imagen) |
| Parámetros totales | 27.000 millones en el modelo base; el número exacto de parámetros del adaptador no está disponible (el repositorio ocupa 0,3 GB) |
| Parámetros activos | No aplica (ni el adaptador ni el modelo base son MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no se especifica en el adaptador |
| Tipos de cuantización | El adaptador se distribuye sin cuantizar en safetensors. Al cargarse sobre el base admite las cuantizaciones de este (int8, int4, GGUF), pero el repositorio no publica checkpoints cuantizados |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base declara soporte para más de 140 idiomas |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base se rige por los términos de uso de Gemma de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). Requiere el base en safetensors, GGUF o formato equivalente según el motor de inferencia |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT sobre `google/gemma-3-27b-it`, un transformer decoder-only denso de 27.000 millones de parámetros con ventana de contexto de 128.000 tokens y codificador de visión para entrada de imágenes. Gemma 3 intercala capas de atención local con ventana deslizante de 1.024 tokens y capas de atención global en proporción de cinco a una, lo que reduce el coste del contexto largo. El adaptador no altera esa arquitectura: añade matrices de bajo rango sobre módulos del base y se aplica en tiempo de inferencia.

Los detalles del ajuste fino provienen únicamente de la model card: 1.058 registros de entrenamiento, tarea de extracción de un esquema de línea de crédito a partir de extractos de 10-K y selección del checkpoint sobre una partición de desarrollo reservada. No se indica el rango del LoRA, los módulos objetivo, la tasa de aprendizaje, el número de épocas, la composición del dataset ni si se emplearon técnicas de alineación adicionales (RLHF, DPO) más allá del ajuste supervisado. El modelo base sí fue instruido (*instruction-tuned*), condición necesaria para que el adaptador funcione como extractor siguiendo instrucciones.

Un punto que conviene señalar: la model card describe un «esquema de seis campos» pero solo enumera cuatro (importe dispuesto, capacidad no utilizada, total e indicador de presencia). La definición completa del esquema de salida no está disponible en la información publicada.

## Capacidades

- Extracción de información estructurada: genera un esquema de línea de crédito (importe dispuesto, capacidad no utilizada, total, indicador de presencia) a partir de extractos de informes 10-K.
- Procesamiento de documentos financieros largos: el modelo base admite 128.000 tokens de contexto, suficiente para secciones extensas de notas de deuda sin troceado agresivo.
- Comprensión de lenguaje financiero en inglés: los 10-K son documentos en inglés, por lo que el adaptador está especializado de facto en ese idioma, aunque la ficha no lo declare explícitamente.
- Herencia del modelo base: al cargarse sobre `gemma-3-27b-it`, conserva las capacidades generales del base (generación de texto, razonamiento, código y matemáticas) en la medida en que el LoRA no las degrade, algo que no está evaluado.
- Multimodalidad potencial: el base acepta imágenes, pero no hay evidencia de que el adaptador haya sido entrenado para explotar esa capacidad.
- Tool calling y function calling: no documentado para el adaptador; el base soporta llamadas a funciones.
- Modo de razonamiento (*thinking*): no documentado para el adaptador.
- Soporte de agentes y razonamiento multietapa: no documentado; la tarea objetivo es una extracción de un solo paso.

## Casos de uso

- Análisis financiero automatizado: procesar lotes de 10-K y extraer sistemáticamente los importes de líneas de crédito revolventes y *term loans* para alimentar bases de datos internas, evitando la lectura manual de notas de deuda.
- Due diligence en financiación: revisar cientos de informes de empresas objetivo y consolidar su capacidad de endeudamiento no dispuesta antes de una operación.
- Modelos de riesgo crediticio: generar variables de entrada (capacidad no utilizada, importe dispuesto) que alimenten modelos de scoring o de predicción de liquidez.
- Monitorización año contra año: comparar la evolución de las líneas de crédito de una misma empresa entre ejercicios detectando variaciones en el total o en la capacidad disponible.
- Investigación en NLP financiero: servir como línea base reproducible para tareas de extracción de información sobre 10-K, dado que el adaptador es público y de tamaño reducido.
- Auditoría y cumplimiento: verificar de forma asistida que las divulgaciones de deuda de un emisor coinciden con la documentación contractual interna.
- Asistencia a analistas con RAG: integrar el base más el adaptador en un sistema de recuperación aumentada sobre documentación financiera, usando el contexto de 128.000 tokens para mantener varias secciones relevantes simultáneamente.
- Normalización de datos para *screening* cuantitativo: convertir notas en texto libre a un esquema tabular comparable entre compañías y sectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, *recall* ni F1 sobre la tarea de extracción, ni comparaciones con otros modelos o con anotación humana, pese a mencionar que el checkpoint se eligió sobre una partición de desarrollo. Tampoco hay resultados de benchmarks generales (MMLU, HumanEval, GSM8K) específicos para este adaptador.

## Requisitos de hardware

- El adaptador pesa 0,3 GB, pero es inutilizable sin el modelo base: el coste real de memoria lo determina el base de 27.000 millones de parámetros.
- Inferencia en bf16/fp16: en torno a 54 GB solo para los pesos, más el KV cache. Requiere 1 GPU de 80 GB (H100, A100 80 GB) o 2 GPU de 40-48 GB con *tensor parallelism*.
- Inferencia en int8: aproximadamente 27-30 GB de pesos; cabe en una A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- Inferencia en int4/GGUF Q4: en torno a 15-17 GB de pesos; cabe en GPUs de consumo como RTX 4090, RTX 3090 o RTX 5090 (24-32 GB), siempre que el contexto se mantenga moderado.
- Contexto largo: a 128.000 tokens el KV cache en bf16 puede superar varias decenas de gigabytes, por lo que conviene cuantizar el KV cache o limitar la ventana al tamaño real de los extractos de 10-K.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte LoRA (`enable_lora`), TGI, o fusión del adaptador en los pesos y conversión a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador ni para el base en configuraciones concretas dentro de la información consultada.
- Almacenamiento: 0,3 GB para el adaptador más el tamaño del base (aproximadamente 54 GB en safetensors bf16, o 15-30 GB en formatos cuantizados).

## Comparativa con modelos similares

El adaptador no es directamente comparable con otros modelos: es un artefacto de ajuste sobre un base concreto. La comparación pertinente es entre el base que utiliza y alternativas de tamaño similar que podrían usarse como punto de partida para la misma tarea.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Adaptador de extracción financiera publicado |
|---|---|---|---|---|---|
| gemma-3-27b-it (base de este adaptador) | 27B denso | 128.000 tokens | Texto e imagen | Términos de uso de Gemma | Este repositorio (sin métricas) |
| Qwen2.5-32B-Instruct | 32,8B denso | 32.768 nativo, ampliable a 131.072 | Texto | Apache 2.0 | No disponible |
| Mistral Small 3.1 (24B) | 24B denso | 128.000 tokens | Texto | Apache 2.0 | No disponible |
| Llama 3.3 70B Instruct | 70B denso | 128.000 tokens | Texto | Licencia comunitaria de Llama 3.3 | No disponible |

No hay datos de rendimiento comparativo en la tarea de extracción, por lo que no puede afirmarse que este adaptador sea mejor o peor que un ajuste equivalente sobre Qwen2.5, Mistral Small o Llama 3.3, ni que supere a un prompt con ejemplos sobre el propio base sin ajuste. La alternativa técnica directa sería un ajuste completo de Gemma 3 27B, mucho más costoso en memoria y almacenamiento (decenas de gigabytes frente a 0,3 GB del adaptador).

## Limitaciones y advertencias

- No es un modelo autónomo: los 0,3 GB del repositorio no contienen un modelo ejecutable, solo el adaptador LoRA. Sin `google/gemma-3-27b-it` no hay inferencia posible.
- Ausencia total de métricas: no hay precisión, *recall*, F1 ni evaluación de errores publicada, ni siquiera sobre la partición de desarrollo que se menciona.
- Dataset de entrenamiento muy pequeño: 1.058 registros para un modelo de 27B incrementan el riesgo de sobreajuste y de degradación fuera de la distribución de los 10-K utilizados.
- Dominio y formato estrechos: el adaptador está entrenado para un esquema concreto de línea de crédito en extractos de 10-K; es previsible un mal rendimiento en otros tipos de documento (10-Q, 8-K, memorias anuales europeas) o en otros idiomas.
- Ambigüedad del esquema: la model card menciona seis campos pero solo detalla cuatro, lo que dificulta reproducir exactamente la salida esperada.
- Riesgo de alucinación: como cualquier modelo generativo aplicado a extracción, puede producir importes plausibles pero incorrectos si el texto fuente es ambiguo o si las cifras aparecen en tablas mal codificadas.
- Licencia no declarada: el repositorio no especifica licencia. Al depender de Gemma 3, se heredan los términos de uso del modelo base, que incluyen condiciones y restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.
- Trazabilidad y confianza: la cuenta autora, `cs-file-uploads`, no ofrece documentación adicional, no hay repositorio de código enlazado (la model card lo menciona pero no lo enlaza) y el repositorio acumula 0 descargas y 0 *likes*, sin señales de validación por parte de la comunidad.
- Uso en producción: dado lo anterior, cualquier implantación debería ir precedida de una evaluación propia sobre datos anotados del dominio concreto y de una revisión legal de la licencia.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/cs-file-uploads/loc-gemma3-27b-adapter
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Librería PEFT: https://github.com/huggingface/peft
- Repositorio de código mencionado en la model card: no disponible (la propia ficha lo cita pero no incluye enlace)
- Resultados relevantes de la búsqueda web: no disponible. La búsqueda no devolvió ningún enlace relacionado con el modelo; los resultados obtenidos correspondían a Counter-Strike 2 y a las tareas compartidas de BioNLP 2025, sin relación con este adaptador.
