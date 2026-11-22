# OpenMed/MedPsy-4B-ONNX

## Resumen

MedPsy-4B-ONNX es la conversión a formato ONNX del modelo `qvac/MedPsy-4B`, un ajuste fino de dominio médico y psicológico construido sobre Qwen3-4B. La conversión la publica OpenMed, que no está afiliada a los autores del modelo original, con el objetivo de facilitar la inferencia en dispositivos (Android, escritorio y navegador) mediante ONNX Runtime y Transformers.js. El resultado es un decoder estándar de ONNX Runtime con pesos cuantizados a 4 bits en el cuerpo y 8 bits en las capas sensibles.

El modelo conserva la arquitectura Qwen3 (`Qwen3ForCausalLM`) con 4.020 millones de parámetros, 36 capas, tamaño oculto de 2560 y atención con query agrupada (GQA). El vocabulario es de 151.936 tokens con embeddings de entrada y salida atados. El repositorio pesa 3,3 GB y los pesos medidos ocupan 2,94 GiB, lo que corresponde a 6,28 bits por peso efectivos, por encima de la etiqueta "4 bits" debido a que las capas más sensibles y la tabla de embeddings compartida se mantienen en 8 bits.

Su relevancia actual radica en que permite ejecutar un modelo de 4B especializado en texto clínico y conversacional dentro de un navegador o en un dispositivo Android sin GPU dedicada, algo poco habitual en modelos de este tamaño. La revisión del 25 de septiembre de 2026 sustituyó los pesos calibrados por redondeo simple (round-to-nearest) por una calibración GPTQ, reduciendo la divergencia media de siguiente token frente al modelo fuente entre un 36 % y un 53 % en tres textos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (`qwen3`, `Qwen3ForCausalLM`), atención con query agrupada (GQA) |
| Parametros totales | 4,02 B (4.020 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuerpo int4 asimétrico GPTQ (grupo 32, escalas fp32, `accuracy_level` 4); capas sensibles int8 GPTQ (grupo 32); embeddings y cabeza de salida int8 bloque 32 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` + `onnx/model_q4.onnx_data` + `onnx/model_q4.onnx_data_1`) |
| Tamano del repositorio | 3,3 GB |
| Tamano oculto | 2560 |
| Capas | 36 |
| Vocabulario | 151.936 (embeddings de entrada/salida atados) |
| Bits por peso efectivos | 6,28 (medido sobre los tensores) |
| Libreria | transformers.js |
| Operadores ONNX Runtime | `MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention` (namespace `com.microsoft`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de tipo Qwen3 con 36 capas, tamaño oculto de 2560 y atención con query agrupada, lo que reduce el coste de memoria de la caché KV respecto a atención multi-cabeza completa. Los embeddings de entrada y la cabeza de salida están atados, lo que explica que la tabla de 151.936 entradas se almacene una sola vez en el grafo ONNX y se lea tanto por `GatherBlockQuantized` como por `MatMulNBits`. El modelo original es un ajuste fino de Qwen3-4B orientado a contenido médico, biomédico y clínico conversacional; los detalles de composición del dataset de ajuste fino no se detallan en la información proporcionada.

La conversión no reentrena el modelo: aplica cuantización GPTQ sobre los pesos en BF16 del modelo fuente. La calibración se realizó con 512 secuencias de 512 tokens de texto genérico en inglés (wikitext-2-raw-v1, revisión `b08601e04326`), sin texto médico ni datos de evaluación en el conjunto de calibración. Las herramientas empleadas fueron GPTQModel 7.5.0, el model builder de onnxruntime-genai 0.16.0 para construir el grafo y onnxruntime 1.30.0. La regla de capas sensibles que se mantienen en 8 bits replica el criterio de Q4_K_M de llama.cpp, que eleva a mayor precisión las proyecciones de valor de atención y las proyecciones down.

La fidelidad de la cuantización se midió frente al modelo fuente en Transformers FP32 con ONNX Runtime 1.30.0 en CPU, sobre 4.092 tokens puntuados por texto, ninguno perteneciente al conjunto de calibración. El tokenizador, la plantilla de chat y los valores por defecto de generación son los archivos originales sin modificar.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en contenido médico, biomédico y clínico según el ajuste fino del modelo fuente.
- Explicación de conceptos médicos en lenguaje llano (el ejemplo de la model card aborda la diferencia entre ataque de pánico e infarto).
- Razonamiento de dominio sobre terminología clínica y biomédica, heredado del ajuste fino de MedPsy sobre Qwen3-4B.
- Soporte de plantilla de chat (`chat_template.jinja` incluida), lo que permite conversaciones multi-turno con roles de sistema, usuario y asistente.
- Ejecución en navegador mediante Transformers.js con `dtype: "q4"`, y en Android, escritorio y Python mediante ONNX Runtime con el execution provider de CPU.
- Gestión de caché KV explícita: el grafo expone `past_key_values.*` como entradas y `present*` como salidas, lo que permite generación autorregresiva eficiente paso a paso.
- Capacidades de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente clínico de consulta rápida en dispositivo: el modelo puede desplegarse en una aplicación Android mediante `onnxruntime-android` para responder preguntas frecuentes sobre síntomas y terminología en inglés, sin enviar datos del paciente a un servidor externo. Adecuado por su tamaño de 4B y su cuantización int4, que reducen la huella de memoria frente al modelo en BF16.
- Educación médica para estudiantes: generación de explicaciones en lenguaje llano sobre conceptos de fisiología, farmacología o psicología, aprovechando el ajuste fino sobre corpus biomédicos. El contexto conversacional permite iterar sobre la misma explicación con preguntas de seguimiento.
- Demo interactiva en navegador: integración con Transformers.js en una página web para probar el modelo sin backend, usando `pipeline("text-generation", ..., { dtype: "q4" })`. Útil para prototipos de producto y validación de experiencia de usuario antes de invertir en infraestructura.
- Procesamiento local de notas clínicas en escritorio: ejecución con ONNX Runtime en Python sobre el execution provider de CPU para resumir o reformular texto médico en inglés en entornos con requisitos de privacidad que impiden el uso de APIs en la nube.
- Base para investigación en cuantización: el repositorio incluye `openmed_build.json` con los ajustes exactos, versiones de herramientas, resultados por corpus y SHA-256 de cada archivo, lo que lo convierte en un punto de partida reproducible para estudiar el impacto de GPTQ con capas mixtas int4/int8 en modelos de 4B.
- Filtrado y clasificación de texto biomédico: generación de respuestas o etiquetas sobre extractos de MedlinePlus y literatura biomédica en inglés, con la ventaja de que el modelo cabe en memoria de un dispositivo de gama media-alta.
- Evaluación de fidelidad de cuantizaciones: los datos de divergencia KL, acuerdo top-1 y variación de perplejidad publicados permiten usar este modelo como referencia para comparar otras técnicas de cuantización sobre la misma base Qwen3-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí publica métricas de fidelidad de la cuantización frente al modelo fuente en FP32, medidas con ONNX Runtime 1.30.0 en CPU sobre 4.092 tokens por texto:

| Texto | Divergencia KL media | Acuerdo top-1 | Cambio de perplejidad | KL antes de calibración |
|---|---|---|---|---|
| Prosa de dominio público (Project Gutenberg) | 0,037 | 88,8 % | +1,9 % | 0,077 |
| Prosa médica (resúmenes de MedlinePlus) | 0,020 | 93,3 % | +0,8 % | 0,031 |
| Texto enciclopédico reservado (wikitext-2 test) | 0,029 | 92,8 % | +2,2 % | 0,062 |

La calibración GPTQ redujo la divergencia media de siguiente token entre un 36 % y un 53 % respecto a la primera build publicada el 23 de septiembre de 2026, que usaba redondeo simple. No se han medido latencia ni throughput en dispositivo Android; la model card indica explícitamente que aún no se ha evaluado en un dispositivo de este tipo. En macOS con ONNX Runtime 1.30.0 (CPU) y Transformers.js 4.3.0 se obtuvieron tokens greedy idénticos entre ambas rutas de ejecución.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos ocupan 2,94 GiB en el formato int4/int8 mixto; hay que sumar la caché KV, que crece con la longitud de contexto. Para contextos moderados, un presupuesto de 4 a 6 GB de memoria es razonable, aunque la cifra exacta depende de la longitud de contexto y no está publicada.
- GPU recomendadas: no se especifican en la información proporcionada. El modelo está pensado para CPU mediante ONNX Runtime; no se documenta soporte de execution providers de GPU (CUDA, DirectML, CoreML) en la model card.
- Cabe en GPU de consumo: sí, por tamaño de pesos (2,94 GiB), aunque no hay datos publicados de rendimiento en GPU. En RTX 4090, RTX 3090 o GPUs con 8 GB o más el modelo cabría en memoria, pero la ruta de ejecución validada es CPU.
- Despliegue: ONNX Runtime 1.30 o superior (incluido `onnxruntime-android` en Android) y Transformers.js 4.3.0 en navegador o Node. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas para este repositorio concreto.
- Latencia y throughput: no disponibles. La model card solo confirma que no se ha medido en dispositivo Android y que en macOS con CPU se obtuvieron tokens greedy idénticos entre ONNX Runtime y Transformers.js.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedPsy-4B-ONNX (este) | 4,02 B | no disponible | ONNX int4 GPTQ + int8 en capas sensibles | Apache 2.0 | Hugging Face, uso en navegador y Android |
| qvac/MedPsy-4B (fuente) | 4,02 B | no disponible | BF16 (Transformers) | Apache 2.0 | Hugging Face |
| Qwen3-4B (base) | 4 B | no disponible en la informacion proporcionada | safetensors, GGUF y otras conversiones de la comunidad | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos médicos de 4B en formato ONNX para dispositivo) no está disponible en la información proporcionada. Frente al modelo fuente, la diferencia principal es el formato: este repositorio prioriza portabilidad y tamaño reducido a costa de una pérdida de fidelidad medida (KL de 0,020 a 0,037 según el corpus). Frente a Qwen3-4B, la diferencia es el ajuste fino de dominio médico y psicológico, cuyos detalles de entrenamiento no se documentan en la información disponible.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el consejo, diagnóstico o tratamiento profesional. La model card indica explícitamente que las salidas pueden ser erróneas y deben verificarse.
- Uso previsto limitado a investigación y educación. QVAC describe MedPsy como modelo para estos fines, entrenado con datos generados a partir de conjuntos CC-BY-NC; conviene revisar la model card del modelo fuente antes de cualquier uso comercial.
- Riesgo de alucinación en contenido clínico: al ser un ajuste fino sobre un modelo de 4B, puede generar afirmaciones médicas plausibles pero incorrectas, especialmente en dosis, interacciones farmacológicas o diagnósticos diferenciales.
- Idiomas: solo inglés. No hay soporte documentado de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriría traducción previa o ajuste adicional.
- Longitud de contexto: no documentada en la información proporcionada; no se debe asumir la ventana nativa de Qwen3-4B sin verificar la configuración del grafo ONNX.
- La cuantización introduce degradación medible: entre un 88,8 % y un 93,3 % de acuerdo top-1 con el modelo fuente según el corpus, con incrementos de perplejidad de hasta el 2,2 %. En texto médico la degradación es menor (KL 0,020, perplejidad +0,8 %), pero no es nula.
- La calibración GPTQ se hizo solo con texto genérico en inglés (wikitext-2), sin datos médicos; el rendimiento en dominios muy alejados de ese corpus no está caracterizado.
- Dependencia de operadores `com.microsoft` de ONNX Runtime: requiere ONNX Runtime 1.30 o superior. Versiones anteriores o runtimes alternativos que no implementen `MatMulNBits`, `GatherBlockQuantized` o `GroupQueryAttention` no podrán ejecutar el grafo.
- No medido en Android: la model card lo indica explícitamente, por lo que el rendimiento real en dispositivos móviles es desconocido.
- OpenMed no está afiliada ni respaldada por los autores del modelo original; los problemas de calidad del ajuste fino deben contrastarse con la model card de `qvac/MedPsy-4B`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenMed/MedPsy-4B-ONNX
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
- Transformers.js (documentación): https://huggingface.co/docs/transformers.js
- Conjunto de calibración wikitext-2-raw-v1 (revisión `b08601e04326`): no se proporciona URL directa en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
