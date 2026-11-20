# CSroseX/Legal_llama3.1_part5

## Resumen

Llama-3-Legal-8B es un ajuste fino del modelo base unsloth/llama-3-8b, desarrollado por el usuario CSroseX y publicado en Hugging Face bajo el identificador CSroseX/Legal_llama3.1_part5. Está especializado en una tarea muy concreta: localizar y citar textualmente cláusulas dentro de contratos comerciales en inglés, devolviendo los fragmentos exactos del documento o la cadena "Not found." cuando la cláusula no aparece. No es un asistente legal general, sino una herramienta de extracción orientada a abogados, paralegales y desarrolladores de legal-tech que necesitan resaltar secciones relevantes en contratos largos.

El modelo se entrenó sobre el dataset CUAD (Contract Understanding Atticus Dataset), que define 41 tipos de cláusulas contractuales, y hereda la arquitectura transformer decoder-only de Llama 3 con 8.030.261.248 parámetros totales. La ventana de entrenamiento por página es de aproximadamente 500 tokens, por lo que el flujo previsto consiste en trocear contratos completos en páginas solapadas y agregar las respuestas de cada una.

Su relevancia actual radica en que aborda un problema práctico de la revisión contractual —la localización de cláusulas— con métricas declaradas de solapamiento léxico de 0,735, un 99,6 % de respuestas extraídas literalmente del contrato y un 95,8 % de acierto en la detección de cláusulas ausentes, medidas sobre 1.000 páginas de 102 contratos no vistos durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con páginas de ~500 tokens) |
| Tipos de cuantización | GGUF Q8_0 y Q4_K_M; carga en 4-bit vía BitsAndBytes |
| Idiomas soportados | inglés (en) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de unsloth/llama-3-8b, una variante del Llama 3 de 8.000 millones de parámetros con arquitectura transformer decoder-only. El ajuste fino se realizó con la librería Unsloth, según las etiquetas del repositorio, y el corpus de entrenamiento es theatticusproject/cuad-qa, la versión de pregunta-respuesta del dataset CUAD. La tarea se formula como extracción: se proporciona un tipo de cláusula (una de las 41 categorías de CUAD) y un fragmento de contrato, y el modelo debe devolver las oraciones exactas del texto que corresponden a esa cláusula, o "Not found." si no existe.

El formato de prompt está almacenado en el tokenizer, de modo que apply_chat_template construye la secuencia correcta: la pregunta, una línea con solo `---` y el texto del contrato. El entrenamiento se hizo sobre páginas de aproximadamente 500 tokens, lo que condiciona el uso: para contratos completos hay que dividir el documento en ventanas solapadas (por ejemplo, 512 tokens con 64 de solapamiento) y consolidar las respuestas. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Extracción literal de cláusulas contractuales: devuelve las oraciones exactas del contrato relacionadas con un tipo de cláusula solicitado.
- Detección de ausencia: responde "Not found." cuando la cláusula no está presente en el fragmento, con una tasa declarada del 95,8 %.
- Cobertura de 41 tipos de cláusulas de CUAD: desde "Governing Law" y "Non-Compete" hasta "Cap On Liability", "Liquidated Damages", "Ip Ownership Assignment" o "Third Party Beneficiary".
- Procesamiento por páginas: diseñado para fragmentos de unos 500 tokens, con agregación posterior para contratos completos.
- Generación de texto en inglés con formato conversacional (chat template integrado en el tokenizer).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Revisión de contratos en despachos jurídicos: un paralegal introduce el tipo de cláusula y las páginas del contrato, y el modelo devuelve las oraciones relevantes para que un abogado las revise, reduciendo el tiempo de localización manual en documentos extensos.
- Construcción de pipelines de extracción en legal-tech: integración del modelo en un servicio que trocea contratos en páginas solapadas, consulta cada una y consolida las respuestas únicas para generar un índice de cláusulas por documento.
- Due diligence en fusiones y adquisiciones: procesamiento por lotes de cientos de contratos para localizar cláusulas críticas como cambio de control, no competencia o asignación de propiedad intelectual antes de la revisión humana.
- Auditoría de contratos de proveedores: detección de cláusulas de renovación automática, períodos de preaviso o límites de responsabilidad en acuerdos comerciales con terceros.
- Verificación de ausencia de cláusulas: comprobar que un contrato no contiene determinadas estipulaciones (por ejemplo, cláusulas de no competencia) gracias a la tasa declarada de acierto en "Not found.".
- Prototipado local con GGUF: despliegue en estaciones de trabajo de desarrolladores mediante llama.cpp u Ollama con cuantización Q4_K_M para pruebas de concepto sin infraestructura GPU dedicada.
- Enriquecimiento de bases de datos contractuales: extracción automática de fragmentos por tipo de cláusula para poblar índices de búsqueda o sistemas de gestión documental.

## Benchmarks y rendimiento

| Métrica | Valor actual | Versión anterior |
|---|---|---|
| Solapamiento léxico con la cláusula correcta | 0,735 | 0,185 |
| Respuestas que son texto real del contrato | 99,6 % | 12,3 % |
| "Not found." correcto cuando la cláusula está ausente | 95,8 % | 0 % |

Las métricas se midieron sobre 1.000 páginas procedentes de 102 contratos no vistos durante el entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 16 GB para los 8.030 millones de parámetros.
- VRAM estimada en 4-bit (BitsAndBytes): aproximadamente 6 GB según la model card.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con FP16; RTX 4090 o RTX 3090 para FP16 en consumer; RTX 3060 de 12 GB o superiores para cuantización 4-bit.
- Cabe en GPU consumer: sí, con cuantización 4-bit en tarjetas de 8-12 GB, y en FP16 en tarjetas de 16 GB o más.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), llama.cpp y Ollama mediante los archivos GGUF Q8_0 y Q4_K_M.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CSroseX/Legal_llama3.1_part5 | 8,03 B | no disponible (~500 tokens por página en entrenamiento) | Extracción de cláusulas CUAD | llama3 | Hugging Face, GGUF |
| meta-llama/Meta-Llama-3-8B | 8,03 B | 8.192 tokens | Propósito general | llama3 | Hugging Face |
| unsloth/llama-3-8b | 8,03 B | 8.192 tokens | Base para ajuste fino | llama3 | Hugging Face |
| Modelos legales generalistas de 7-8 B | ~7-8 B | variable | Asistencia legal conversacional | variable | Hugging Face |

La comparación con otros ajustes legales específicos de extracción de cláusulas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No proporciona asesoramiento jurídico ni evalúa la calidad o el riesgo de una cláusula; solo localiza texto.
- Entrenado exclusivamente en inglés; no se garantiza comportamiento en otros idiomas.
- Diseñado para páginas de unos 500 tokens; contratos completos requieren troceado con solapamiento y agregación manual.
- Riesgo de alucinación mitigado pero no eliminado: aunque el 99,6 % de las respuestas son texto literal del contrato, puede omitir cláusulas presentes o generar fragmentos incorrectos en textos atípicos.
- Sesgos heredados del corpus CUAD, compuesto por contratos comerciales de un contexto jurídico concreto (Estados Unidos), lo que puede reducir la cobertura en otras jurisdicciones o tipos contractuales.
- Licencia Llama 3 Community: restricciones de uso comercial, obligación de atribución y cláusulas de uso aceptable que deben revisarse antes de un despliegue en producción.
- La model card advierte de que las copias descargadas antes del 20 de noviembre de 2026 corresponden a una versión anterior; los archivos GGUF deben descargarse de nuevo.
- No dispone de tool calling ni capacidades de agente; cualquier orquestación multi-paso debe implementarse externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CSroseX/Legal_llama3.1_part5
- Modelo base: https://huggingface.co/unsloth/llama-3-8b
- Llama 3 de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Dataset CUAD QA: https://huggingface.co/datasets/theatticusproject/cuad-qa
- Proyecto CUAD (Atticus Project): https://www.atticusprojectai.org/cuad
- Historial de versiones del repositorio: https://huggingface.co/CSroseX/Llama-3-Legal-8B/tree/1b6a47d9321c73464466131d1d7eb594c1e6c847
