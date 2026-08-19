# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step510

## Resumen

Este modelo es un adaptador LoRA (PEFT) construido sobre el modelo base EXAONE-3.5-7.8B-Instruct de LG AI Research, especializado en tareas de conversacion financiera (ConvFinQA). El nombre del checkpoint sugiere un entrenamiento mediante supervisión fina (SFT) con una estrategia de muestreo balanceado (balanced9) orientada a mejorar la precisión en preguntas de opción múltiple (MCQ) dentro de dominios financieros conversacionales. El modelo base EXAONE 3.5 es una familia de modelos bilingües (inglés y coreano) con soporte de contexto largo de hasta 32K tokens, desarrollada por LG AI Research para casos de uso reales.

La relevancia de este adaptador radica en que permite especializar un modelo generalista de 7.800 millones de parámetros en un dominio concreto (finanzas conversacionales) sin reentrenar el modelo completo, reduciendo costes computacionales y conservando las capacidades generales del modelo base. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), por lo que su uso requiere cargar el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.8B (modelo base) + adaptadores LoRA |
| Parametros activos | no disponible |
| Longitud de contexto | 32K tokens (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base: ingles y coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base EXAONE-3.5-7.8B-Instruct, un transformer decoder-only de 7.800 millones de parámetros desarrollado por LG AI Research. La denominación del checkpoint sugiere que el entrenamiento se realizó sobre el dataset ConvFinQA (conversational financial question answering) con una estrategia de balanceo de clases (balanced9) y un criterio de selección basado en precisión de preguntas de opción múltiple (mcq_pc_accuracy). El sufijo step510 indica aproximadamente 510 pasos de optimización.

No se dispone de información detallada sobre los hiperparámetros de entrenamiento, el dataset exacto, la composición de los datos ni el régimen de precisión numérica empleado. El repositorio indica el uso de las librerías PEFT 0.19.1, Transformers y TRL, y la etiqueta region:us sugiere que el entrenamiento se realizó en infraestructura ubicada en Estados Unidos.

## Capacidades

- Generacion de texto conversacional en el dominio financiero, especializado en preguntas y respuestas sobre datos financieros (ConvFinQA).
- Respuesta a preguntas de opcion multiple (MCQ) sobre datos financieros conversacionales con precision optimizada.
- Herencia de las capacidades generales del modelo base EXAONE-3.5-7.8B-Instruct: generacion de texto, razonamiento y comprension multilingue (ingles y coreano).
- Soporte de contexto largo de hasta 32K tokens, heredado del modelo base.
- Procesamiento de conversaciones multi-turno en el dominio financiero gracias al entrenamiento especifico sobre ConvFinQA.

## Casos de uso

- Atencion al cliente financiera automatizada: el modelo puede gestionar conversaciones multi-turno con clientes que preguntan sobre datos de sus cuentas, estados financieros o informes trimestrales, gracias a su especializacion en ConvFinQA y su ventana de contexto de 32K tokens.
- Analisis de documentos financieros: puede extraer y responder preguntas sobre cifras, porcentajes y tendencias a partir de informes financieros presentados en formato conversacional.
- Educacion financiera automatizada: puede generar explicaciones y responder preguntas de opcion multiple para plataformas de aprendizaje sobre conceptos financieros.
- Auditoria y verificacion de datos: puede ayudar a verificar la coherencia de datos financieros presentados en conversaciones, comparando cifras y detectando discrepancias entre respuestas.
- Generacion de resumenes financieros: dado un dialogo financiero extenso, puede resumir los puntos clave, las cifras relevantes y las conclusiones principales.
- Integracion en pipelines de RAG financiero: el adaptador puede combinarse con sistemas de recuperacion aumentada para responder preguntas sobre corpus financieros especificos de una empresa o sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del modelo sugiere que se utilizo una metrica de precision (pc_accuracy) durante el entrenamiento, pero no se proporcionan valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,3 GB, pero requiere cargar el modelo base EXAONE-3.5-7.8B-Instruct completo para su uso.
- En precision FP16, el modelo base requiere aproximadamente 15,6 GB de VRAM solo para los pesos, mas memoria para KV cache y activaciones (se recomienda al menos 24 GB).
- Con cuantizacion 4-bit, el modelo puede ejecutarse en GPUs consumer con 8-12 GB de VRAM (RTX 3080, RTX 4070, etc.).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) o directamente con Transformers + PEFT.
- La latencia estimada para un modelo de 7.8B en una RTX 4090 es de aproximadamente 30-50 tokens por segundo en FP16, y superior con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Generalista bilingue | no disponible |
| Este adaptador (ConvFinQA SFT) | 7.8B + LoRA | 32K | Finanzas conversacionales | no disponible |
| sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO-CoT-v2 | 7.8B + LoRA | 32K | Finanzas conversacionales con CoT y DPO | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que impide conocer las restricciones de uso comercial.
- No se dispone de informacion sobre sesgos especificos, aunque el modelo puede heredar sesgos de los datos de entrenamiento de EXAONE 3.5.
- Riesgo de alucinacion en datos financieros: el modelo puede generar cifras o interpretaciones incorrectas si se le pide informacion fuera de su dominio de entrenamiento.
- La especializacion en ConvFinQA puede degradar el rendimiento en otras tareas financieras no conversacionales o en dominios generales.
- El adaptador solo esta disponible en formato PEFT (safetensors), por lo que requiere cargar el modelo base por separado y no es directamente compatible con herramientas que esperan pesos completos.
- No se han publicado evaluaciones independientes ni benchmarks que verifiquen la calidad del adaptador.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigacion sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step510
- Repositorio oficial EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper EXAONE 3.5 (arXiv): https://arxiv.org/html/2412.04862v3
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Variante relacionada (SFT-DPO-CoT): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO-CoT-v2
- EXAONE 3.5 en Ollama: https://ollama.com/library/exaone3.5:7.8b
