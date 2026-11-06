# monoboard/Typhoon2-Qwen2.5-7B-LBT-QA-adapters

## Resumen

Typhoon2-Qwen2.5-7B-LBT-QA-adapters es una colección de ocho adaptadores QLoRA publicados por el usuario monoboard sobre el modelo base Typhoon2-Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parámetros desarrollado por SCB 10X y especializado en tailandés. Los adaptadores están entrenados para una tarea muy concreta: responder preguntas con citas verificables sobre el impuesto tailandés de tierras y edificios (land and building tax), un dominio legal y fiscal acotado.

El interés técnico del repositorio no reside en el modelo en sí, sino en su diseño experimental: contiene las ocho ejecuciones completas descritas en un artículo académico, con distintas variantes de currículum de entrenamiento (C1 explícito, C4 explícito y luego implícito), semillas (42, 1234, 3407) y tasas de aprendizaje (2e-4, 1e-4, 5e-5). Cada carpeta incluye el adaptador final, su configuración y un fichero `run_info.json` con ajustes, fases, checkpoints conservados y tiempos, lo que facilita la reproducibilidad.

Es relevante para investigadores que trabajen en generación aumentada por recuperación (RAG) con atribución de fuentes en dominios regulados, y para desarrolladores que necesiten un punto de partida para asistentes legales en tailandés. No es un modelo de propósito general: el autor lo marca explícitamente como uso de investigación y no constituye asesoramiento jurídico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptadores LoRA/QLoRA |
| Parámetros totales | 7.000 millones (modelo base); adaptadores LoRA de rango 64 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | QLoRA (entrenamiento); el adaptador se distribuye en safetensors; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT: `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo base es Typhoon2-Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.000 millones de parámetros derivado de la familia Qwen2.5 y ajustado por SCB 10X para tailandés mediante instrucciones. Sobre él se aplican adaptadores LoRA de rango 64 (alpha igual al rango) entrenados con QLoRA, es decir, con el modelo base cuantizado durante el ajuste. El repositorio ocupa 5,2 GB y cada carpeta de ejecución pesa aproximadamente 0,65 GB.

El entrenamiento explora dos currículos: C1, que usa únicamente el formato explícito de preguntas, y C4, que entrena primero con formato implícito y después con el explícito. Se combinaron tres semillas (42, 1234, 3407) y, en la rama C1 con semilla 3407, tres tasas de aprendizaje (2e-4 por defecto, 1e-4 y 5e-5). El presupuesto es de tres épocas en todas las ejecuciones, con checkpoints conservados en el paso 5500 para C1 y en el 4413 para C4. Los prompts exactos están en el material suplementario S1 del artículo y en inferencia deben usarse entradas en formato explícito.

## Capacidades

- Generación de texto en tailandés con respuestas fundamentadas en citas sobre normativa fiscal de tierras y edificios.
- Question answering extractivo y generativo con atribución de fuentes (citation-grounded QA).
- Integración en pipelines RAG: el adaptador está diseñado para recibir contexto recuperado y producir respuestas con referencias.
- Ajuste fino eficiente mediante PEFT: los adaptadores se cargan sobre el modelo base sin duplicar los pesos completos.
- Reproducibilidad experimental: ocho ejecuciones con semillas y hiperparámetros distintos para análisis de varianza.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al tailandés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistencia fiscal interna: un ayuntamiento o despacho tailandés puede desplegar el adaptador sobre el modelo base para responder consultas de contribuyentes sobre el impuesto de tierras y edificios, citando el artículo aplicable en cada respuesta.
- RAG documental en dominio regulado: el adaptador encaja como generador final de un pipeline que recupera fragmentos normativos y exige que cada afirmación vaya respaldada por una cita, lo que reduce el riesgo de respuestas sin fundamento.
- Investigación en atribución de fuentes: los ocho checkpoints permiten estudiar cómo varía la calidad de las citas según currículum, semilla y tasa de aprendizaje, comparando resultados de forma controlada.
- Evaluación de currículos de entrenamiento: al incluir variantes C1 y C4 con los mismos presupuestos, sirve para medir el efecto de entrenar primero con formato implícito y luego explícito en tareas de QA legal.
- Prototipado de asistentes legales en tailandés: un equipo puede cargar un adaptador con `PeftModel.from_pretrained` y validar en pocas horas si la aproximación QLoRA es suficiente antes de invertir en un ajuste completo.
- Docencia y divulgación: el repositorio ilustra de forma práctica el flujo completo de QLoRA, desde la configuración del adaptador hasta los metadatos de ejecución en `run_info.json`.
- Auditoría de modelos: los ficheros `run_info.json` con fases, checkpoints y tiempos facilitan la trazabilidad del entrenamiento en contextos donde se exige documentar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Como referencia, un modelo denso de 7.000 millones de parámetros en fp16 requiere del orden de 14 GB solo para los pesos, más memoria para el contexto y el adaptador.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo base encaja en A100, H100, L40S y, en cuantizaciones de 8 o 4 bits, en RTX 4090 y RTX 3090.
- GPU de consumo: viable en tarjetas con 24 GB o más si se cuantiza el modelo base; en fp16 completo requiere más de 16 GB solo para pesos.
- Opciones de despliegue: la carga documentada usa `transformers` y `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon2-Qwen2.5-7B-LBT-QA-adapters | 7B (base) + LoRA r64 | no disponible | QA fiscal tailandés con citas | Apache 2.0 | Hugging Face (adaptadores) |
| Typhoon2-Qwen2.5-7B-Instruct | 7B | no disponible | Instrucciones generales en tailandés | no disponible en la información | Hugging Face (modelo base) |
| Qwen2.5-7B-Instruct | 7B | no disponible en la información | Instrucciones generales multilingües | no disponible en la información | Hugging Face |

La comparación se limita al modelo base y a la familia de la que deriva, ya que no se han proporcionado datos de rendimiento que permitan contrastar con alternativas especializadas en QA legal tailandés.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste cubre únicamente el impuesto tailandés de tierras y edificios; fuera de ese ámbito el comportamiento no está garantizado.
- Uso de investigación: el autor indica explícitamente que no es asesoramiento jurídico y que su uso previsto es la investigación.
- Riesgo de alucinación: aunque el entrenamiento busca respuestas con citas, no se documentan métricas de fidelidad que garanticen que las referencias sean correctas en producción.
- Formato de entrada obligatorio: en inferencia deben usarse entradas en formato explícito; el formato implícito solo se emplea en la fase de entrenamiento del currículo C4.
- Idioma: solo tailandés; no hay evidencia de transferencia a otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la licencia del modelo base y de los datos de entrenamiento, no detallados.
- Sin métricas publicadas: no hay benchmarks en el repositorio, por lo que la calidad real de las respuestas no puede evaluarse a priori.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/monoboard/Typhoon2-Qwen2.5-7B-LBT-QA-adapters
- Modelo base: https://huggingface.co/scb10x/typhoon2-qwen2.5-7b-instruct
- Modelo base alternativo referenciado en los tags: https://huggingface.co/typhoon-ai/typhoon2-qwen2.5-7b-instruct
- Librería PEFT: https://github.com/huggingface/peft
- Artículo con material suplementario S1: no disponible en la información proporcionada.
