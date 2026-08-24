# pinkelephantlimited/pinkelephant-llm-48b-s-verification

## Resumen

Pink Elephant 48B-S es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 8 expertos, desarrollado por Pink Elephant Limited. Se construye mediante un proceso de *upcycling* a partir de un modelo denso de 14B (pink-elephant-llm-14b), en el que los pesos de las redes feedforward se dividen y replican en ocho expertos complementarios, multiplicando la capacidad efectiva aproximadamente por tres. La familia se entrena desde cero sobre 2+ trillones de tokens de código, lenguaje natural y matemáticas, y el modelo final se alinea mediante SFT y DPO. Este repositorio concreto actúa como puerta de aceptación para el modelo final alineado, incluyendo herramientas de verificación estructural y benchmarks.

El modelo tiene 48B parámetros totales, aunque no se especifica cuántos son activos en cada consulta. La arquitectura es de tipo LLaMA (transformer decoder) con mezcla de expertos. El idioma soportado es inglés y la licencia es MIT, lo que permite uso comercial. La longitud de contexto no se ha publicado. El modelo está pensado para generación de texto, razonamiento matemático y conocimiento general, con una fase de verificación previa a su liberación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo LLaMA) con MoE de 8 expertos |
| Parametros totales | 48B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona conversión a GGUF para Ollama/LM Studio) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de verificación; el modelo base usa transformers) |

## Arquitectura y entrenamiento

El modelo es un MoE de 8 expertos obtenido mediante *upcycling* desde un modelo denso de 14B. Las capas feedforward del modelo denso se dividen y replican en ocho expertos complementarios, preservando el conocimiento del modelo padre y multiplicando la capacidad efectiva aproximadamente por tres. La arquitectura es de tipo LLaMA (transformer decoder). El entrenamiento inicial se realizó desde cero sobre más de 2 trillones de tokens que combinan código, lenguaje natural y matemáticas. Posteriormente, el modelo pasa por dos fases de alineación: SFT (supervised fine-tuning) en el paso 90000 y DPO (direct preference optimization) con el mejor adaptador. El repositorio de verificación valida el modelo final que integra la base 48B-S junto con los adaptadores SFT y DPO. No se proporcionan detalles adicionales sobre el dataset exacto, el número de tokens, ni otras técnicas de entrenamiento.

## Capacidades

- Generación de texto en inglés.
- Razonamiento matemático: alcanza un 68.5% en GSM8K en una muestra aleatoria.
- Conocimiento general: 60.0% en MMLU (5-shot) en una muestra equilibrada de 7 materias.
- Alineación mediante SFT y DPO para mejorar el comportamiento y la coherencia.
- Posibilidad de ejecución local mediante GGUF en Ollama o LM Studio.
- No se indican capacidades de tool calling, agentes, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Evaluación de modelos de lenguaje: se puede usar como referencia para comparar el rendimiento de otros LLMs en tareas de razonamiento matemático y conocimiento general, ya que dispone de benchmarks publicados (GSM8K y MMLU).
- Investigación en arquitecturas MoE: sirve para estudiar el impacto del *upcycling* de un modelo denso a un MoE y su posterior alineación, gracias a la documentación detallada del pipeline.
- Generación de texto en inglés en entornos de investigación: para tareas de prototipado o experimentación donde no se requiera un modelo validado en producción.
- Despliegue local en equipos con GPU de alto rendimiento: el modelo puede cargarse en un host con ~96 GB de VRAM en bf16, útil para pruebas de inferencia en entornos controlados.
- Conversión a GGUF para uso local: una vez verificado, se puede convertir a GGUF y ejecutar en Ollama o LM Studio, facilitando su integración en aplicaciones de escritorio.
- Desarrollo de asistentes de texto en inglés: potencialmente útil para generar respuestas en aplicaciones de chat o documentación, aunque aún está en fase de verificación.

## Benchmarks y rendimiento

Según la model card, los resultados registrados en la verificación son:

| Benchmark | Resultado | Detalle |
|---|---|---|
| GSM8K (razonamiento matemático) | 68.5% | 61/89 en muestra aleatoria; extracción de respuesta con "answer is" |
| MMLU (conocimiento, 5-shot) | 60.0% | 24/40 equilibrado en 7 materias; extracción de letra |

No se han publicado comparativas con otros modelos similares en la información disponible.

## Requisitos de hardware

- GPU Blackwell con aproximadamente 96 GB de VRAM para cargar el modelo en bf16.
- Tiempo de carga del modelo: alrededor de 3 minutos en el host de verificación.
- Se puede convertir a GGUF para ejecución local con Ollama o LM Studio, aunque no se especifican los requisitos de hardware para esa configuración.
- No se indica soporte para vLLM, TGI u otros servidores de inferencia.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos de la misma categoría (tamaño similar o MoE) en la información proporcionada.

## Limitaciones y advertencias

- El modelo se encuentra en fase de verificación: tiene 0 descargas y no ha sido validado en entornos de producción.
- Los benchmarks se basan en muestras pequeñas (61/89 en GSM8K, 24/40 en MMLU), por lo que los resultados pueden no ser representativos del rendimiento completo.
- Solo soporta inglés; no se especifica soporte multilingüe.
- No se ha publicado la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- No hay información sobre sesgos, alucinaciones o riesgos específicos.
- La licencia MIT permite uso comercial, pero el modelo aún no ha superado la etapa de verificación.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s-verification
- Modelo base (48B MoE): https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b
- GitHub de Pink Elephant Limited: https://github.com/pinkelephantlimited/pink-elephant-llm
