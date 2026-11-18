# positron-ai/meta-llama_Llama-3.2-1B-Instruct-ingest-best-gptq

## Resumen

Este repositorio contiene una compilación cuantizada en GPTQ de 4 bits del modelo `meta-llama/Llama-3.2-1B-Instruct`, publicada por Positron AI. No se trata de un modelo nuevo ni de un ajuste fino: es un artefacto de inferencia derivado del modelo instructivo de 1.235.814.400 parámetros de Meta, orientado a reducir el peso en memoria y el coste de despliegue en GPU manteniendo la estructura y el comportamiento del original.

El modelo base pertenece a la familia Llama 3.2, emplea una arquitectura transformer densa (no MoE) y está entrenado para conversación y seguimiento de instrucciones. La cuantización aplicada afecta solo a los pesos (4 bits, grupo de 64, simétrica, sin `desc_act`), dejando las activaciones sin cuantizar, lo que facilita su carga con `transformers` y su uso en `text-generation-inference`.

Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo instructivo de la familia Llama en entornos con VRAM muy limitada, con un repositorio de 1,1 GB, a costa de asumir la pérdida de calidad inherente a la cuantización de 4 bits y la ausencia de documentación sobre evaluación comparativa frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2), según modelo base |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (corresponde al modelo base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | GPTQ 4 bits, group size 64, simetrica, `desc_act=false`, damp 0.05; activaciones sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License (llama3.2) |
| Formato de pesos | safetensors (cuantizados GPTQ), cargables con transformers |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base `meta-llama/Llama-3.2-1B-Instruct`: un transformer denso de 1,23 mil millones de parámetros. Este repositorio no aporta información sobre la composición del dataset de preentrenamiento, el número de tokens, ni las fases de alineación (RLHF/DPO) del modelo original; esos detalles deben consultarse en la model card de Meta. Tampoco se documenta ninguna innovación arquitectónica propia, ya que el artefacto es una conversión de precisión.

El proceso de cuantización sí está detallado: GPTQ sobre pesos en 4 bits con tamaño de grupo 64, cuantización simétrica y sin reordenación de activaciones (`desc_act=false`), con un porcentaje de damping de 0,05. Se empleó un conjunto de calibración mixto de 256 muestras con longitud de secuencia 2048. La cadena de herramientas declarada es GPTQModel 5.8.0, transformers 4.57.6, torch 2.9.1 y CUDA 12.8. La precisión de origen de los pesos figura como no disponible.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo Instruct de Meta.
- Razonamiento básico y respuesta a preguntas de dominio general, limitado por el tamaño de 1B parámetros.
- Generación de código y matemáticas elementales, sin garantías de calidad propias de modelos mayores.
- Soporte de conversaciones multi-turno mediante plantilla de chat del modelo base.
- Capacidades multilingües: no documentadas en este repositorio.
- Tool calling y function calling: no documentado en este repositorio; depende del soporte del modelo base y del runtime.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita su fiabilidad en cadenas largas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en GPU de gama baja para prototipos: con pesos de 4 bits y un repositorio de 1,1 GB, permite levantar un endpoint de generación de texto en tarjetas con poca VRAM para validar flujos de producto antes de escalar a modelos mayores.
- Clasificación y extracción de información con formato: útil para tareas de etiquetado, resumen corto o extracción de campos donde la latencia y el coste importan más que la profundidad de razonamiento.
- Asistente conversacional de bajo coste: adecuado para chatbots de soporte con turnos acotados, siempre que el contexto requerido encaje en la ventana del modelo base y se acepte la degradación por cuantización.
- Generación de borradores de texto y respuestas plantilla: redacción asistida de correos, descripciones o respuestas FAQ en pipelines por lotes donde el throughput agregado prima sobre la calidad máxima.
- Componente de un sistema mayor como modelo auxiliar: por ejemplo, reformulación de consultas, generación de variantes o preprocesado de prompts antes de enviarlos a un modelo de mayor capacidad.
- Experimentación académica con cuantización: banco de pruebas para medir el impacto de GPTQ 4 bits (grupo 64, simétrico, sin `desc_act`) frente al modelo original en tareas concretas del dominio propio.
- Inferencia en entornos con restricciones de memoria o edge: escenarios donde el presupuesto de VRAM es el factor limitante y se requiere un modelo instructivo de la familia Llama con licencia conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo original o a otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB solo para pesos en 4 bits; el consumo real depende del tamaño de lote, la longitud de contexto y el overhead del runtime (KV cache y buffers de activación).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para uso con contexto moderado; tarjetas de 8 GB o más (RTX 3060/4060, RTX 4090, A10, L4) ofrecen margen para lotes mayores y contextos más largos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con soporte GPTQ (requiere `gptqmodel`/`auto-gptq` según versión), `text-generation-inference` (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con GPTQ. No se declara soporte GGUF ni llama.cpp en este repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/meta-llama_Llama-3.2-1B-Instruct-ingest-best-gptq | 1,24 B | No disponible | GPTQ 4 bits | Llama 3.2 Community | Hugging Face, 43 descargas |
| meta-llama/Llama-3.2-1B-Instruct (original) | 1,24 B | No disponible en esta ficha | BF16/FP16 | Llama 3.2 Community | Hugging Face, oficial de Meta |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/GGUF de terceros) | 1,24 B | Igual que el base | Variable | Llama 3.2 Community | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Degradación por cuantización: la conversión a 4 bits con grupo 64 y sin `desc_act` puede reducir la calidad frente al modelo original; no se aportan métricas que cuantifiquen esa pérdida.
- Sesgos: no documentados en este repositorio; hereda los sesgos del modelo base de Meta, que deben evaluarse en la model card original.
- Riesgo de alucinación: presente como en cualquier modelo generativo, y potencialmente agravado por el tamaño reducido (1B) y la cuantización.
- Limitaciones de contexto e idioma: la longitud de contexto y la cobertura idiomática no se detallan aquí; conviene verificarlas en la documentación del modelo base antes de usarlo en producción.
- Restricciones de licencia: se distribuye bajo la Llama 3.2 Community License, con la Acceptable Use Policy de Meta aplicable; el uso comercial está sujeto a los términos de dicha licencia, no a una licencia permisiva tipo Apache o MIT.
- Trazabilidad limitada: repositorio con 0 likes y 43 descargas, sin evaluación independiente publicada; no se recomienda como dependencia crítica sin validación propia.
- Compatibilidad de runtime: al ser GPTQ, requiere librerías específicas; no es directamente utilizable en llama.cpp u Ollama sin conversión adicional.
- Precisión de origen y hardware objetivo declarados como no disponibles, lo que dificulta reproducir la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/positron-ai/meta-llama_Llama-3.2-1B-Instruct-ingest-best-gptq
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- GPTQModel (herramienta de cuantización declarada): https://github.com/ModelCloud/GPTQModel
- Repositorio de transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
