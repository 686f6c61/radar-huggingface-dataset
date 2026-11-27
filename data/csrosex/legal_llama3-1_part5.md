# CSroseX/Legal_llama3.1_part5

## Resumen

Legal_llama3.1_part5 es un ajuste fino del modelo Llama 3 de 8B de Meta, desarrollado por el usuario CSroseX y publicado en Hugging Face. El modelo está especializado en la extracción de cláusulas en contratos comerciales: recibe un tipo de cláusula (de las 41 definidas en el dataset CUAD) y un fragmento de contrato, y devuelve las frases exactas del contrato que abordan esa cláusula, o la cadena `Not found.` si no existe. No genera asesoramiento jurídico ni evalúa la calidad de las cláusulas; su función es localizar texto, como un resaltador automático.

El modelo parte de la base `unsloth/llama-3-8b` (8.030.261.248 parámetros) y se ha ajustado con el dataset `theatticusproject/cuad-qa`, orientado a la revisión de contratos. La model card reporta métricas de rendimiento en una versión actualizada (actualización de noviembre de 2026): una superposición de palabras con la cláusula correcta de 0,735, un 99,6 % de respuestas que son texto real del contrato y un 95,8 % de aciertos al responder "Not found." cuando la cláusula está ausente. Estas cifras se midieron sobre 1.000 páginas de 102 contratos no vistos durante el entrenamiento.

Es relevante para equipos de legal-tech y desarrolladores que necesitan automatizar la localización de cláusulas en contratos largos con un modelo de 8B que puede ejecutarse en hardware de consumo mediante cuantización. La licencia es Llama 3 Community, lo que impone restricciones de uso comercial que deben revisarse antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con páginas de ~500 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 y Q4_K_M; 4-bit BitsAndBytes (load_in_4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Llama 3 8B, una arquitectura transformer decoder-only con atención causal estándar. No se documentan innovaciones arquitectónicas adicionales; el cambio principal respecto al modelo base es el ajuste sobre el dataset CUAD-QA para la tarea de extracción de cláusulas. La model card indica que el entrenamiento se realizó con páginas de aproximadamente 500 tokens, lo que condiciona el uso: para contratos completos se recomienda dividir el documento en páginas con solapamiento (por ejemplo, ventana de 512 tokens con 64 de solapamiento) y fusionar las respuestas.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de CUAD-QA, ni si se aplicaron técnicas de RLHF o DPO. El autor menciona que la versión actual corrige problemas de la versión anterior (mejora de 0,185 a 0,735 en superposición de palabras; de 12,3 % a 99,6 % en respuestas que son texto real del contrato; de 0 % a 95,8 % en aciertos de "Not found."). El prompt se construye con `apply_chat_template`, e incluye la pregunta, una línea con solo `---` y el fragmento de contrato.

## Capacidades

- Extracción de cláusulas contractuales: localiza y cita las frases exactas del contrato relacionadas con uno de los 41 tipos de cláusula del dataset CUAD (por ejemplo, Governing Law, Non-Compete, Cap On Liability, Ip Ownership Assignment).
- Respuesta de ausencia controlada: devuelve `Not found.` cuando la cláusula no está presente en el fragmento, con una tasa reportada del 95,8 % de acierto.
- Fidelidad al texto fuente: el 99,6 % de las respuestas son texto real extraído del contrato, lo que reduce el riesgo de paráfrasis o invención en la cita.
- Procesamiento por páginas: diseñado para fragmentos de aproximadamente 500 tokens, con fusión de respuestas para contratos completos.
- Formato conversacional: usa la plantilla de chat de Llama 3 con el formato pregunta + `---` + extracto.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido según la información disponible.
- Capacidad multilingüe limitada al inglés (`language: en`).

## Casos de uso

- Revisión inicial de contratos en despachos jurídicos: el modelo recibe un contrato dividido en páginas y devuelve las frases exactas de cláusulas como Governing Law o Termination For Convenience, lo que permite a un paralegal localizar rápidamente los puntos a revisar sin leer el documento completo.
- Extracción de metadatos contractuales para bases de datos legal-tech: se consulta por tipos como Agreement Date, Effective Date o Expiration Date y se almacenan las citas devueltas para indexar contratos en un repositorio searchable.
- Due diligence en fusiones y adquisiciones: se procesan lotes de contratos con ventanas solapadas para detectar cláusulas de Change Of Control, Anti-Assignment o Non-Compete, y se agrupan las citas por contrato para revisión humana.
- Automatización de banderas de riesgo en pipelines de CLM (Contract Lifecycle Management): el modelo actúa como primer filtro que marca páginas con cláusulas de Uncapped Liability o Liquidated Damages, y el equipo legal revisa solo esas páginas.
- Asistencia a abogados internos en empresas: integración en un chatbot interno que, dada una pregunta sobre un contrato concreto, devuelve la cita textual de la cláusula correspondiente para que el abogado la valide, sin generar asesoramiento directo.
- Desarrollo de herramientas de resaltado para editores de contratos: el modelo se usa como backend de una función "buscar cláusula" que resalta en el documento las frases devueltas, aprovechando su fidelidad al texto fuente (99,6 % de respuestas literales).
- Evaluación de conformidad de plantillas: se compara la presencia o ausencia de cláusulas obligatorias (por ejemplo, Insurance o Audit Rights) en contratos de proveedores frente a una plantilla interna, usando la respuesta `Not found.` como señal de omisión.

## Benchmarks y rendimiento

La model card reporta métricas medidas sobre 1.000 páginas de 102 contratos no vistos durante el entrenamiento. No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Version actual | Version anterior |
|---|---|---|
| Superposición de palabras con la cláusula correcta | 0,735 | 0,185 |
| Respuestas que son texto real del contrato | 99,6 % | 12,3 % |
| Acierto de "Not found." cuando la cláusula está ausente | 95,8 % | 0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB para los 8.030 millones de parámetros.
- VRAM estimada en 4-bit (BitsAndBytes): aproximadamente 6 GB según la model card.
- VRAM estimada en GGUF Q8_0: alrededor de 8,5-9 GB; en Q4_K_M: alrededor de 5-6 GB (estimación orientativa según el tamaño de los pesos).
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) para FP16 o Q8_0.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con Q4_K_M o 4-bit, y en RTX 4060 Ti 16 GB en FP16.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp/Ollama para GGUF, text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM para serving compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CSroseX/Legal_llama3.1_part5 | 8,03B | no disponible | Extracción de cláusulas CUAD | Llama 3 Community | Hugging Face, 217 descargas |
| unsloth/llama-3-8b (base) | 8,03B | 8.192 tokens (Llama 3) | Propósito general | Llama 3 Community | Hugging Face |
| Modelos legales basados en Llama 3 de 8B | ~8B | variable | Ajuste legal general | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos legales en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos, pero al estar entrenado únicamente con contratos comerciales en inglés del dataset CUAD, puede tener un rendimiento inferior en contratos de otras jurisdicciones, idiomas o géneros textuales.
- Riesgo de alucinación: aunque la model card reporta un 99,6 % de respuestas literales del contrato, existe un 0,4 % de respuestas que no son texto real; en producción debe validarse que la cita aparezca en el documento fuente.
- Limitación de contexto: el modelo se entrenó con páginas de ~500 tokens y la longitud de contexto no está documentada; para contratos largos es obligatorio dividir en ventanas con solapamiento, lo que puede fragmentar cláusulas que cruzan páginas.
- Idioma: solo soporta inglés; no debe usarse con contratos en castellano u otros idiomas sin un ajuste adicional.
- Licencia: Llama 3 Community License impone restricciones de uso comercial (incluida la obligación de atribución y límites para empresas con más de 700 millones de usuarios mensuales); debe revisarse antes de integrarlo en un producto.
- Uso previsto restringido: no es un modelo de asesoramiento jurídico ni de chat legal general; no evalúa si una cláusula es buena o mala, solo la localiza.
- Actualización de pesos: la model card advierte que las copias descargadas antes del 20 de noviembre de 2026 corresponden a la versión antigua; los archivos GGUF deben descargarse de nuevo.
- Tamaño del repositorio: 70,2 GB, lo que incluye múltiples formatos (safetensors y GGUF) y puede requerir espacio de disco considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSroseX/Legal_llama3.1_part5
- Modelo base: https://huggingface.co/unsloth/llama-3-8b
- Dataset CUAD-QA: https://huggingface.co/datasets/theatticusproject/cuad-qa
- Proyecto CUAD (Atticus Project): https://www.atticusprojectai.org/cuad
- Llama 3 de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Llama 3: https://huggingface.co/CSroseX/Llama-3-Legal-8B/blob/main/LICENSE
- Historial de versiones del repositorio: https://huggingface.co/CSroseX/Llama-3-Legal-8B/tree/1b6a47d9321c73464466131d1d7eb594c1e6c847
