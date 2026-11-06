# Akash-Purbhi/fredphase2-qwen2.5-3b

## Resumen

FRED Stage 2 es un adaptador LoRA de 16 bits entrenado sobre Qwen2.5-3B-Instruct por el desarrollador Akash-Purbhi. Su propósito específico es la detección de alucinaciones en el dominio financiero y la edición selectiva de respuestas: en lugar de regenerar texto de forma indiscriminada, el modelo verifica un candidato de respuesta contra tablas y texto financiero de origen y decide entre cinco acciones (preservar, editar, abstenerse, marcar conflicto o solicitar evidencia).

El modelo se ha afinado sobre un conjunto balanceado de 17.000 muestras (8.500 limpias extraídas de FinQA y TAT-QA y 8.500 perturbadas con 11 tipos de error), con una longitud de secuencia de 2.048 tokens. La innovación principal es el uso de etiquetado XML en línea para señalar y corregir errores numéricos o factuales sin reescribir el contenido correcto.

Es relevante porque aborda un problema recurrente en aplicaciones de análisis financiero asistido por IA: la verificación de cifras y hechos contra fuentes estructuradas. Al estar construido sobre un modelo base de 3.000 millones de parámetros, es desplegable en hardware modesto, aunque su alcance queda limitado al idioma y dominio de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (rango 16, alpha 16) |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento); el contexto máximo del modelo base no se indica en la información disponible |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó en 16 bits sin cuantización de 4 bits; el repo ocupa 0,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de 16 bits (rango 16, alpha 16) montado sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. El entrenamiento se realizó sin cuantización de 4 bits para evitar la degradación asociada a QLoRA, según indica la model card. La longitud de secuencia de entrenamiento es de 2.048 tokens.

El conjunto de datos, denominado FRED Stage 2 balanced dataset, contiene 17.000 muestras con una proporción estricta de 50% limpias y 50% corrompidas: 8.500 ejemplos limpios derivados de FinQA y TAT-QA y 8.500 ejemplos perturbados con 11 tipos de error. El objetivo de entrenamiento es la verificación selectiva con cinco acciones (preserve, edit, abstain, flag_conflict, request_evidence) y la edición en línea mediante etiquetas XML como `<numerical><delete>erroneous</delete><mark>verified</mark></numerical>`. No se especifica en la información disponible si se emplearon RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Verificación de respuestas candidatas contra tablas y texto financiero de origen.
- Detección de alucinaciones numéricas y factuales en el dominio financiero.
- Edición selectiva en línea con etiquetas XML, preservando el contenido correcto.
- Abstención explícita cuando el contexto no contiene la información necesaria.
- Detección de conflictos entre celdas de tabla y notas a pie de página.
- Solicitud de evidencia adicional ante divulgaciones financieras incompletas.
- Generación de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Verificación de respuestas en asistentes de análisis financiero: el modelo recibe una respuesta candidata generada por otro sistema junto con las tablas de origen y decide si preservarla, editarla o abstenerse, lo que reduce la propagación de cifras erróneas en informes automatizados.
- Auditoría de resúmenes de estados financieros: dado un resumen generado y los estados contables subyacentes, el modelo marca con etiquetas XML las cifras que no coinciden y propone la corrección verificada, facilitando la revisión humana.
- Control de calidad en pipelines de extracción de datos (RAG): integrado como etapa de post-procesado, valida que las respuestas del sistema de recuperación estén fundamentadas en los documentos recuperados antes de mostrarlas al usuario.
- Detección de inconsistencias en informes con notas al pie: la acción flag_conflict permite señalar contradicciones entre celdas de tabla y notas, un escenario habitual en memorias anuales y informes trimestrales.
- Gestión de disclosures incompletos: cuando un documento no incluye una métrica solicitada, la acción request_evidence evita que el sistema fabrique una respuesta y guía al usuario hacia la fuente que falta.
- Moderación de contenido financiero generado: el modelo puede actuar como filtro en la salida de un LLM mayor, aprobando, editando o bloqueando respuestas antes de su publicación en entornos regulados.
- Evaluación de modelos de análisis financiero: sirve como juez automático en experimentos que comparan la fidelidad de distintos generadores frente a FinQA y TAT-QA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 6 GB solo para los pesos del modelo base de 3.000 millones de parámetros, más el adaptador LoRA y la caché KV para 2.048 tokens; en la práctica, entre 7 y 9 GB según el runtime.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5-4,5 GB para los pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: en torno a 2-3 GB para los pesos, más caché KV.
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090 o L4 para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores; en 4 bits podría ejecutarse en GPUs de 8 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requieren convertir el adaptador LoRA al formato correspondiente; el adaptador está en safetensors y debe fusionarse con el modelo base o cargarse como adaptador PEFT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRED Stage 2 (Qwen2.5-3B) | 3.000 M + LoRA | 2.048 tokens de entrenamiento | Verificación selectiva y edición de alucinaciones financieras | Apache 2.0 | Hugging Face y GitHub |
| Qwen2.5-3B-Instruct | 3.000 M | no disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Modelos de detección de alucinaciones de propósito general | no disponible | no disponible | Clasificación binaria de fidelidad | variable | no disponible |

La comparación con alternativas especializadas en detección de alucinaciones financieras no está disponible en la información proporcionada. Frente al modelo base, FRED Stage 2 añade un comportamiento estructurado de cinco acciones y etiquetado XML, a costa de un dominio de aplicación mucho más estrecho y de una ventana de contexto de entrenamiento de 2.048 tokens.

## Limitaciones y advertencias

- El modelo está especializado en el dominio financiero y en los formatos de FinQA y TAT-QA; su rendimiento fuera de ese dominio no está documentado.
- La longitud de secuencia de entrenamiento es de 2.048 tokens, lo que limita la verificación de documentos financieros extensos sin troceado previo.
- No se especifican los idiomas de entrenamiento; la información disponible no permite confirmar soporte multilingüe.
- Riesgo de alucinación residual: el adaptador mitiga errores numéricos, pero no se han publicado métricas que cuantifiquen su tasa de fallo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni informes independientes de calidad.
- Al ser un adaptador LoRA, requiere cargar o fusionar el modelo base Qwen2.5-3B-Instruct; no es un modelo autónomo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datasets FinQA y TAT-QA.
- No se documentan sesgos específicos ni evaluaciones de seguridad; en producción financiera se recomienda revisión humana de las decisiones de edición y abstención.

## Enlaces

- Hugging Face: https://huggingface.co/Akash-Purbhi/fredphase2-qwen2.5-3b
- GitHub del proyecto FRED: https://github.com/Akash-Purbhi/FRED
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset FinQA: https://huggingface.co/datasets/FinQA
- Dataset TAT-QA: https://huggingface.co/datasets/TAT-QA
