# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step170

## Resumen

Este modelo es un adaptador LoRA de 0,3 GB que afina el modelo EXAONE-3.5-7.8B-Instruct de LG AI Research para la tarea de pregunta-respuesta conversacional sobre documentos financieros (ConvFinQA). El autor, sbcho0325, ha publicado este adaptador como parte de una serie de experimentos de ajuste fino supervisado (SFT) con diferentes configuraciones de muestreo y semillas aleatorias, como indica el nombre del repositorio (seed42, step170). El adaptador se distribuye en formato safetensors y está pensado para cargarse sobre el modelo base de 7.800 millones de parámetros, que soporta una ventana de contexto de hasta 32.000 tokens.

La relevancia de este modelo reside en su especialización en un dominio concreto: la extracción y razonamiento de datos financieros a partir de tablas y documentos estructurados en conversaciones de múltiples turnos. Aunque el adaptador es ligero y fácil de integrar, su utilidad práctica depende de la calidad del dataset ConvFinQA utilizado en el entrenamiento y de la capacidad del modelo base EXAONE para el razonamiento numérico y tabular. No se han publicado métricas de evaluación en la información disponible, por lo que su rendimiento efectivo debe validarse en casos de uso reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct (Transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB; el modelo base tiene 7.800 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base admite FP16, BF16, INT8 e INT4 |
| Idiomas soportados | No disponibles (el modelo base EXAONE 3.5 soporta coreano e ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con arquitectura de atención causal, desarrollado por LG AI Research. Tiene 7.800 millones de parámetros y fue entrenado con un enfoque de instrucción (instruction tuning) que incluye soporte para razonamiento, generación de código y manejo de contexto largo. El adaptador LoRA aquí presentado aplica una actualización de bajo rango sobre las matrices de atención y feed-forward del modelo base, sin modificar los pesos originales.

El entrenamiento del adaptador se realizó mediante ajuste fino supervisado (SFT) sobre el dataset ConvFinQA, un benchmark de preguntas conversacionales sobre documentos financieros. El nombre del repositorio indica que se empleó una semilla aleatoria (42), un muestreo uniforme de datos y un total de 170 pasos de optimización. No se detallan los hiperparámetros exactos (tasa de aprendizaje, rango del LoRA, tipo de optimizador) en la información disponible. La técnica de entrenamiento es exclusivamente SFT; no se menciona el uso de DPO ni RLHF.

## Capacidades

- Pregunta-respuesta conversacional sobre datos financieros tabulares y textuales, aprovechando el contexto largo del modelo base.
- Razonamiento numérico y comparación de magnitudes, gracias a la especialización en ConvFinQA.
- Generación de texto en coreano e ingles (idiomas soportados por el modelo base), aunque la especialización financiera puede priorizar el ingles.
- Integración con pipelines de agentes conversacionales mediante la API de chat de transformers, ya que hereda las capacidades de tool calling y seguimiento de instrucciones del EXAONE 3.5 Instruct.
- Manejo de contexto de hasta 32.000 tokens, lo que permite procesar documentos financieros extensos en una sola conversación.

## Casos de uso

- Soporte a analistas financieros: el modelo puede responder preguntas sobre estados financieros, ratios y variaciones interanuales a partir de tablas cargadas en el contexto, ayudando a acelerar la revisión de informes trimestrales.
- Chatbots de atención al cliente en banca: integrado en un sistema de mensajería, puede resolver dudas sobre extractos, comisiones o condiciones de productos financieros, manteniendo el hilo de una conversación de varios turnos.
- Auditoría asistida: permite verificar la coherencia de datos financieros presentados en documentos, formulando preguntas de control cruzado sobre las cifras.
- Educación financiera personalizada: explicar conceptos como margen bruto o flujo de caja libre a partir de datos concretos de una empresa, adaptando el nivel de detalle a las preguntas del usuario.
- Generación de resúmenes financieros: el modelo puede resumir la situación económica de una compañía a partir de tablas y notas, integrado en herramientas de reporte automático.
- Integración en herramientas de business intelligence: conectado a una base de datos o un ERP, permite consultas conversacionales sobre indicadores clave de rendimiento, reduciendo la curva de aprendizaje de los usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación sobre ConvFinQA u otros conjuntos de validación. El rendimiento real debe medirse en el contexto de la tarea específica y compararse con el modelo base sin adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de solo 0,3 GB, pero el modelo base EXAONE-7.8B requiere aproximadamente 15,6 GB en FP16, por lo que el conjunto completo necesita al menos 16 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) permite ejecutar el modelo en FP16; una RTX 3090 (24 GB) o A100 (40 GB) también son adecuadas. Para GPUs de 16 GB (RTX 4080, A10G) es necesario cuantizar el modelo base a INT8 o INT4.
- Si cabe en consumer GPU: sí, en tarjetas de gama alta (RTX 4090) con FP16; en tarjetas de 12-16 GB (RTX 3080Ti, RTX 4080) usando cuantización 4-bit.
- Opciones de despliegue: vLLM (con soporte para adaptadores LoRA), Hugging Face Transformers con la librería PEFT, o llama.cpp si se convierte el adaptador a GGUF fusionado con el modelo base.
- Latencia y throughput estimados: no disponible; depende del hardware y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Este adaptador (sbcho0325/EXAONE-3.5-7.8B-LoRA) | 7.8B (base) | 32K | ConvFinQA | No disponible |
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Uso general | EXAONE AI License |
| Llama-3.1-8B-Instruct | 8B | 128K | Uso general | Llama 3.1 Community License |

No se dispone de resultados de benchmarks para comparar el rendimiento del adaptador con el modelo base u otras alternativas. La principal diferencia con el base es la especialización en el dominio financiero, aunque el adaptador pierde parte de la capacidad generalista si no se mezcla con datos de dominio general. No hay información sobre otros adaptadores similares publicados por el mismo autor para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede heredar sesgos del dataset ConvFinQA, que se centra en datos de empresas estadounidenses y en ingles, lo que limita su aplicabilidad a otros contextos financieros o idiomas.
- Riesgo de alucinación: al ser un adaptador sobre un modelo generalista, puede generar respuestas plausibles pero incorrectas en cálculos financieros si no se verifica la fuente de datos en el contexto.
- Limitaciones de idioma: el modelo base EXAONE 3.5 está optimizado para coreano e ingles; no se garantiza un buen rendimiento en espanol u otros idiomas.
- Restricciones de licencia: la licencia del adaptador es "no disponible"; el modelo base EXAONE 3.5 tiene una licencia propia de LG AI Research que permite uso comercial con ciertas condiciones, pero se debe verificar su compatibilidad.
- Dependencia del contexto: el rendimiento en ConvFinQA depende de que los datos financieros se incluyan en el contexto de la conversación; no se ha entrenado para acceder a bases de datos externas.
- Sin datos de evaluación: al no publicarse resultados de validación, el rendimiento real en casos de producción es incierto y requiere pruebas propias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step170
- Paper del modelo base: https://arxiv.org/html/2412.04862v3
- Repositorio oficial EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Adaptador relacionado (misma familia): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
