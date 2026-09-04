# pratheeksha23/fraud-lora-adapter

## Resumen

`fraud-lora-adapter` es un adaptador LoRA (Low-Rank Adaptation) publicado por `pratheeksha23` y basado en el modelo `Qwen/Qwen2.5-1.5B-Instruct`. El adaptador está pensado para clasificación de transacciones financieras y razonamiento sobre fraude, tal y como se describe en el repositorio asociado. Utiliza la librería PEFT y el framework TRL, con un pipeline de generación de texto.

No se trata de un modelo completo, sino de un conjunto de pesos LoRA que se carga sobre el modelo base. El adaptador no publica su número de parámetros, su licencia, sus idiomas ni datos de entrenamiento. La ficha de HuggingFace está incompleta y el repositorio muestra un tamaño de 0.0 GB, por lo que hay que verificar que los pesos estén disponibles antes de usarlo.

Su relevancia radica en que permite experimentar con fine-tuning de bajo coste sobre un modelo pequeño (1.500 millones de parámetros en el modelo base) para una tarea financiera específica. Sin embargo, al no publicar evaluaciones, no se puede afirmar su eficacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el modelo base tiene 1.500 millones; el adaptador no publica el número) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (indicado en los tags); el repo muestra 0.0 GB, hay que verificar que los pesos estén presentes |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-1.5B-Instruct`, un modelo transformer decoder-only de 1.500 millones de parámetros. La técnica de ajuste es LoRA, que introduce matrices de baja dimensión en las capas de atención y feed-forward, lo que permite actualizar una fracción de los pesos. El proceso de entrenamiento es SFT (supervised fine-tuning) con TRL, según los tags. No se ha publicado la composición del dataset, el número de tokens, ni si se aplicó RLHF o DPO. Tampoco se detallan hiperparámetros ni el régimen de entrenamiento.

## Capacidades

- Clasificación de transacciones financieras: según el repositorio, el adaptador se entrena para clasificar operaciones como fraudulentas o no fraudulentas.
- Razonamiento sobre fraude: el adaptador está orientado a generar explicaciones o justificaciones en lenguaje natural sobre las transacciones.
- Generación de texto conversacional: el pipeline de HuggingFace es `text-generation`, pero no hay validación de esta capacidad sobre el adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Detección de fraude en transacciones bancarias: el adaptador puede recibir una descripción textual de una transacción y devolver una etiqueta de riesgo con una explicación. Es adecuado porque el proyecto se centra en esta tarea y el modelo base es lo bastante pequeño para desplegarse en entornos con poca capacidad.
- Auditoría de transacciones en tiempo real: integrar el adaptador en un servicio que analice un flujo de operaciones y genere alertas. Requiere un pipeline de validación humana y una capa de seguridad para evitar falsos positivos.
- Análisis de tickets de soporte bancario: clasificar incidencias reportadas por clientes para detectar posibles patrones de fraude y derivar los casos a un equipo especializado.
- Explicación de decisiones en sistemas de scoring: usar el adaptador como capa de razonamiento que acompañe a un modelo de reglas o a un modelo estadístico, generando justificaciones legibles para los analistas.
- Formación de analistas de cumplimiento: generar casos sintéticos de transacciones fraudulentas y sus explicaciones para entrenar a personal de banca o auditoría.
- Investigación académica sobre LoRA en modelos pequeños: el adaptador puede servir como ejemplo de fine-tuning de bajo coste para una tarea de clasificación financiera, aunque sin benchmarks publicados no permite validar hipótesis de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones propias de detección de fraude. No se puede calcular la precisión, el recall ni la tasa de falsos positivos del adaptador.

## Requisitos de hardware

- No se ha publicado información específica sobre requisitos de hardware para este adaptador.
- Para cargarlo se necesita el modelo base `Qwen2.5-1.5B-Instruct` en memoria. Como orientación general, un modelo de 1.500 millones de parámetros en FP16 ocupa aproximadamente 3 GB de VRAM; con cuantización a 4 bits se reduce a ~1,5-2 GB.
- El adaptador LoRA en sí añade poco peso, pero no se ha publicado su tamaño ni su carga en VRAM.
- No hay GPU recomendada oficial. Para pruebas locales puede bastar una GPU de consumo con 6-8 GB de VRAM, pero no es una recomendación confirmada.
- Opciones de despliegue: se puede cargar con PEFT + Transformers. En vLLM, llama.cpp, Ollama o TGI es necesario fusionar el adaptador con el modelo base o usar los mecanismos de carga de adaptadores que cada framework soporte.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. El adaptador no tiene benchmarks, licencia ni especificaciones publicadas, por lo que no es posible compararlo con otras soluciones de detección de fraude. La única referencia disponible es el modelo base `Qwen2.5-1.5B-Instruct`, pero no es un adaptador de fraude y tampoco aporta datos de evaluación en esta ficha.

## Limitaciones y advertencias

- Ficha incompleta: no se declaran licencia, idiomas, datos de entrenamiento, evaluación ni métricas. Esto impide conocer las condiciones de uso y el rendimiento real.
- Sin benchmarks: no se puede evaluar la precisión en detección de fraude. El modelo puede generar falsos positivos o alucinaciones al no haber sido validado.
- Sesgos desconocidos: el dataset de fine-tuning no se ha documentado, por lo que el adaptador puede haber aprendido sesgos de los datos de entrenamiento.
- Riesgo de seguridad: los adaptadores LoRA pueden contener pesos maliciosos si no provienen de una fuente confiable. Se recomienda auditar el adaptador antes de cargarlo en un entorno productivo.
- Licencia no definida: el uso comercial no está autorizado explícitamente. Hay que contactar con el autor o esperar a que se publique una licencia.
- Tamaño del repo 0.0 GB: puede indicar que los pesos no se han subido correctamente. Hay que verificar que el adaptador contenga los ficheros safetensors necesarios.
- Contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados, lo que limita la planificación de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/pratheeksha23/fraud-lora-adapter
- Repositorio GitHub: https://github.com/pratheeksha23/fraud-detection-lora-llm
- Artículo sobre riesgos de seguridad en adaptadores LoRA: https://krishnag.ceo/blog/the-hidden-threat-in-lora-adapters-how-malicious-fine-tuning-modules-undermine-ai-integrity/
