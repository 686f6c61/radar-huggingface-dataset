# HarshilDaGoat/gem-recommendation-writer

## Resumen

`gem-recommendation-writer` es un modelo seq2seq de generación de texto muy pequeño (76.961.152 parámetros, según los pesos safetensors publicados), desarrollado por el usuario HarshilDaGoat y afinado a partir de `google/flan-t5-small`. Su única función es convertir el desglose estructurado de cumplimiento de una licitación —nivel de riesgo, puntuación y hallazgos de un pipeline automático de verificación— en una recomendación breve dirigida a un oficial de contratación pública, que termina siempre en uno de tres veredictos: recomendar la cualificación, la descalificación o la revisión manual antes de cualificar.

El modelo nace en el contexto de las compras públicas en la India (plataforma GeM) y está pensado para ejecutarse en local, sin llamadas a APIs externas de LLM, y sin ver nunca los documentos originales del licitador: solo recibe el resumen estructurado. Cada salida incorpora la etiqueta "AI-generated, advisory only", de modo que se presenta explícitamente como texto asesor y no como decisión administrativa, que sigue correspondiendo al oficial y al motor de reglas con su registro de auditoría.

Su relevancia es acotada pero clara: demuestra un patrón de uso de modelos pequeños en dominios regulados, con datos íntegramente sintéticos (54.000 ejemplos de entrenamiento, 3.000 de validación y 3.000 de test) y una guardarraíl determinista en inferencia. No es un modelo de propósito general: su lenguaje está limitado por las plantillas que generaron los datos y no razona más allá de ellas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5), afinado desde google/flan-t5-small |
| Parámetros totales | 76.961.152 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base google/flan-t5-small; el autor no la especifica) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | text2text-generation (la etiqueta de HuggingFace indica text-generation) |
| Etiquetas adicionales | procurement, india, gem, synthetic-data, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder-decoder de la familia T5 en su variante pequeña, tomada de `google/flan-t5-small`, un checkpoint ya ajustado por instrucciones por Google sobre el corpus FLAN. Sobre esa base, el autor realizó un ajuste supervisado (fine-tuning) para una tarea de transformación texto-a-texto: entrada con formato fijo `write recommendation | risk: <nivel> | score: <puntuación> | findings: <lista de hallazgos>` y salida en forma de recomendación breve con veredicto final.

Los datos de entrenamiento son íntegramente sintéticos y se generaron con el script `ml/recommendation/generate.py`: 54.000 ejemplos de entrenamiento, 3.000 de validación y 3.000 de test. Los objetivos (targets) los redacta un generador de plantillas con variación de fraseo y un paso siguiente concreto por hallazgo (por ejemplo, "request recent ECR challans"). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra técnica de alineación, ni el número de tokens de entrenamiento. La innovación técnica destacable no está en el modelo en sí, sino en el patrón de despliegue: un verificador en `ml/recommendation/infer.py` comprueba cada salida contra los hallazgos presentes en la entrada y, si la comprobación falla, sustituye la generación por texto de plantilla determinista para esos mismos hallazgos.

## Capacidades

- Generación de texto corto en inglés con estructura fija: recomendación con veredicto final entre "Recommend qualifying", "Recommend disqualification" y "Recommend officer review before qualifying".
- Traducción de representaciones estructuradas (riesgo, puntuación, lista de hallazgos) a lenguaje natural, combinando y reformulando el fraseo de las plantillas de entrenamiento para cualquier mezcla de hallazgos.
- Inclusión sistemática de la etiqueta de aviso "AI-generated, advisory only" en las salidas.
- Manejo de hallazgos heterogéneos del pipeline de verificación (por ejemplo `gst_inactive status=cancelled`, discrepancias entre `gst_trade_name`, `document` y `portal`).
- Ejecución totalmente local, sin dependencia de APIs externas y sin exposición de documentos originales del licitador.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, matemáticas, código, visión ni audio.

## Casos de uso

- Asesoramiento en paneles de contratación pública: el modelo recibe el resumen estructurado de una licitación (nivel de riesgo, puntuación y hallazgos) y devuelve un párrafo con el veredicto propuesto y el siguiente paso por hallazgo, para que el oficial lo lea en el dashboard antes de decidir. Es adecuado porque su salida está acotada al formato que el panel espera y siempre va etiquetada como generada por IA.
- Triaje de ofertas de riesgo alto: en un flujo con cientos de licitaciones, se puede llamar al modelo para cada expediente marcado como "Non-Compliant" y ordenar la cola de revisión por veredicto sugerido, dejando el motor de reglas como registro oficial.
- Borrador de comunicaciones al licitador: la recomendación incluye pasos concretos asociados a cada hallazgo (por ejemplo, solicitar challans de ECR recientes), lo que sirve de base para redactar el requerimiento de subsanación dirigido al proveedor.
- Verificación de regresión del motor de reglas: al ser un modelo de 77 M parámetros que corre en CPU, se puede integrar en los tests de CI/CD para comprobar que, ante un conjunto fijo de hallazgos sintéticos, el texto asesor sigue citando todos los hallazgos y no inventa ninguno.
- Formación de personal de contratación: como asistente de práctica con expedientes sintéticos, permite mostrar a oficiales noveles cómo se traducen combinaciones de hallazgos en recomendaciones y qué decisión final corresponde a cada caso.
- Despliegue en entornos con restricciones de conectividad o confidencialidad: al ejecutarse en local sin API externa y sin ver documentos crudos, encaja en infraestructuras públicas donde no está permitido enviar datos de licitadores a servicios de terceros.
- Generación de datos y evaluación interna: el mismo esquema de plantillas permite producir conjuntos sintéticos etiquetados para medir políticas de verificación antes de aplicarlas en producción.
- Prototipado de funcionalidades de asistencia textual a bajo coste: con un repositorio de 0,3 GB y pesos de ~77 M de parámetros, se puede levantar un servicio de demostración en una máquina modesta sin GPUs.

## Benchmarks y rendimiento

La model card publica una evaluación propia sobre licitaciones sintéticas reservadas (1.000 ejemplos), orientada a lo que importa a un oficial de contratación y no al solapamiento de n-gramas. Los datos proceden de la misma distribución sintética que el entrenamiento, por lo que no equivalen a un benchmark general:

| Métrica | Valor |
|---|---|
| Veredicto correcto | 100,0% |
| Hallazgos mencionados (recall) | 100,0% |
| Salidas que inventan un hallazgo | 0,0% |
| Salidas que llevan la etiqueta de aviso | 100,0% |
| Ejemplos evaluados | 1000 |

No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en las mismas métricas de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 0,31 GB (76,96 M de parámetros × 4 bytes); el repositorio completo ocupa 0,3 GB. En fp16 serían unos 0,15 GB. En cualquier configuración cabe holgadamente en GPU de consumo.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) sobra para esta carga; en centros de datos, una A100 o H100 estarían ampliamente desaprovechadas para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad del catálogo actual, e incluso en CPU sin aceleración dedicada; con 77 M de parámetros es viable en portátiles y en máquinas de borde.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")` (uso documentado por el autor), Text Generation Inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con safetensors. No se documentan instrucciones específicas para llama.cpp, GGUF, Ollama o vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor recomienda decodificación con `num_beams=4` y `max_new_tokens=200`, lo que implica cuatro pasos de búsqueda por haz y penaliza el throughput frente a la decodificación greedy; conviene medirlo en el hardware objetivo antes de fijar acuerdos de nivel de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gem-recommendation-writer | 76.961.152 | no disponible | Recomendación asesora sobre cumplimiento en licitaciones (inglés) | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| google/flan-t5-small (modelo base) | no disponible en la información proporcionada (es el origen declarado del afinado) | no disponible | Instrucciones generales texto-a-texto | no disponible | HuggingFace |
| google/flan-t5-base | no disponible | no disponible | Instrucciones generales texto-a-texto | no disponible | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a la categoría funcional (modelos T5 pequeños) y no a rendimiento medido. Tampoco se identifican en la búsqueda web alternativas específicas de generación de recomendaciones para contratación pública con las que contrastar.

## Limitaciones y advertencias

- El propio autor advierte de que un modelo generativo pequeño puede ocasionalmente emitir un veredicto equivocado, omitir un hallazgo o inventar uno. Es obligatorio usar el verificador de `ml/recommendation/infer.py`, que contrasta la salida con los hallazgos de la entrada y cae a texto de plantilla determinista si falla, en lugar de la salida cruda de `pipeline(...)`.
- Todos los datos de entrenamiento son sintéticos, generados por plantillas: el modelo combina y reformula ese fraseo con fluidez, pero no razona más allá de él. No debe interpretarse su salida como un análisis jurídico o técnico autónomo.
- La evaluación publicada (100% de veredicto correcto, 100% de recall, 0% de invención) se realizó sobre licitaciones sintéticas de la misma distribución que el entrenamiento, no sobre expedientes reales; el rendimiento en producción puede ser inferior.
- El modelo solo está entrenado y evaluado en inglés, aunque el dominio de aplicación sea la contratación pública india. Cualquier uso en otro idioma queda fuera de su alcance declarado.
- Nunca ve los documentos originales del licitador, solo el resumen estructurado; cualquier error del pipeline de verificación previo se propaga al texto asesor.
- La salida es asesora: el oficial toma la decisión y el motor de reglas con su registro de auditoría sigue siendo el registro oficial. No debe automatizarse una descalificación a partir del texto generado.
- Licencia apache-2.0, que permite uso comercial y modificación, pero no se documentan garantías ni soporte por parte del autor.
- Riesgo de sesgo: el comportamiento del modelo está determinado por las plantillas del generador sintético, que codifican una política de verificación concreta; cambios en los códigos de hallazgos o en la nomenclatura pueden degradar la calidad de la salida.
- Adopción prácticamente nula (0 descargas, 1 like en el momento de la consulta) y ausencia de documentación sobre el contexto máximo, cuantizaciones o datos de entrenamiento en detalle: conviene auditar el modelo antes de integrarlo en un sistema real.
- Los resultados de la búsqueda web realizada no aportan documentación técnica adicional; solo devolvieron páginas de YouTube sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarshilDaGoat/gem-recommendation-writer
- Modelo base: https://huggingface.co/google/flan-t5-small
- Referencia de la librería: https://huggingface.co/docs/transformers
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
