# smllms/HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.9

## Resumen

HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.9 es un modelo de lenguaje fine-tuneado por el equipo MISHULTA para el hackathon K-DATA SCIENCE (NIA). Se basa en el modelo coreano HyperCLOVA X SEED Think 14B de NAVER Cloud, al que se le aplicó un ajuste fino con LoRA y posterior fusión de pesos. El objetivo es mejorar el rendimiento en tareas de razonamiento de opción múltiple en coreano, como las que plantean los benchmarks KMMLU-Pro y CLIcK.

El modelo está orientado a responder preguntas de conocimiento y razonamiento multi-paso en coreano, generando una cadena de pensamiento (CoT) y concluyendo con el formato `정답: X` (respuesta: X). Para el entrenamiento se utilizó como profesor el modelo Upstage Solar Pro 4, con permiso especial de Upstage, y DeepSeek-R1-0528, junto con datos públicos y generados internamente. Es un ejemplo de fine-tuning especializado para un dominio lingüístico y una tarea concreta, con un tamaño de 14,7 mil millones de parámetros y una ventana de contexto de 32 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en HyperCLOVA X SEED Think 14B) |
| Parametros totales | 14 748 112 896 (14,7 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32 000 tokens (según el modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | coreano (ko) |
| Licencia | HyperCLOVA X SEED Model License Agreement (licencia personalizada, no OSI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, HyperCLOVA X SEED Think 14B, emplea una arquitectura Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP). Soporta razonamiento dual (modo think y modo non-think) y function calling mediante plantilla ChatML. Sobre esta base, el equipo MISHULTA aplicó un ajuste fino con LoRA y posteriormente fusionó los adaptadores en los pesos del modelo.

El entrenamiento se realizó con datos exclusivamente en coreano, combinando:
- El split de entrenamiento del dataset KMMLU (HAERAE-HUB/KMMLU) para autodestilación.
- Destilación del profesor Upstage Solar Pro 4 (con permiso excepcional de Upstage) y de DeepSeek-R1-0528.
- Datos de consultas públicas de la administración coreana (AI Hub) para conocimiento administrativo y legal.
- Preguntas generadas internamente sobre cultura y lengua coreanas, así como razonamiento sintético.
- El split de entrenamiento de Com2, traducido al coreano, para razonamiento multi-paso.

Se realizó una verificación exhaustiva para eliminar solapamientos con los conjuntos de evaluación KMMLU-Pro y CLIcK, tanto a nivel de pregunta como de opciones. El chat template por defecto tiene el modo think desactivado, y el modelo está alineado para terminar la generación de forma estable tras emitir la respuesta.

## Capacidades

- Generación de texto en coreano con formato conversacional.
- Razonamiento de opción múltiple en coreano, con salida estructurada `정답: X`.
- Razonamiento multi-paso (cadena de pensamiento) para preguntas complejas.
- Conocimiento de dominio administrativo y legal coreano (entrenado con datos de AI Hub).
- Comprensión de matices culturales y lingüísticos del coreano.
- Soporte de chat multi-turno mediante plantilla ChatML.
- No se ha verificado soporte de tool calling ni function calling en esta versión fine-tuneada (aunque el modelo base lo tiene, no se menciona en la documentación del fine-tuning).

## Casos de uso

- Evaluación automatizada de exámenes tipo test en coreano: el modelo puede responder preguntas de opción múltiple de exámenes oficiales o académicos, generando una justificación y la respuesta final en formato `정답: X`.
- Asistente de estudio para estudiantes coreanos: puede explicar conceptos y resolver preguntas de razonamiento, ayudando a preparar oposiciones o pruebas de acceso.
- Chatbot de atención al ciudadano en coreano: gracias a su entrenamiento con datos de consultas públicas, puede responder preguntas sobre trámites administrativos y normativa básica.
- Generación de preguntas de opción múltiple: dado un texto o tema, el modelo puede crear preguntas con opciones y su respuesta correcta, útil para plataformas educativas.
- Análisis de razonamiento lógico en coreano: puede descomponer problemas de lógica o matemáticas sencillas en pasos intermedios y ofrecer la solución.
- Investigación académica sobre fine-tuning en coreano: sirve como caso de estudio de destilación y ajuste con LoRA sobre un modelo base propietario, con restricciones de licencia claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento en KMMLU-Pro, CLIcK ni otros conjuntos de evaluación. Tampoco se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 14,7 mil millones de parámetros. En bfloat16, los pesos ocupan aproximadamente 29,5 GB (tamaño del repositorio), por lo que se necesita una GPU con al menos 32 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 8 bits (no disponible en el repositorio, pero posible mediante herramientas externas), podría caber en una GPU de 24 GB como la RTX 4090 o A10G.
- No se han publicado requisitos oficiales de hardware ni mediciones de latencia o throughput.
- Opciones de despliegue: el modelo es compatible con Hugging Face Transformers (carga con `AutoModelForCausalLM`). No se menciona soporte para vLLM, llama.cpp u Ollama, aunque podría adaptarse.
- Para uso en producción, se recomienda un servidor con al menos 64 GB de RAM y una GPU de alta gama (A100 40 GB o superior) para evitar swapping.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.9 | 14,7 B | 32k | ko | HyperCLOVA X SEED (restrictiva) | Fine-tuning especializado en opción múltiple coreana |
| HyperCLOVA X SEED Think 14B (base) | 14,7 B | 32k | ko, en | HyperCLOVA X SEED | Modelo original con razonamiento dual y function calling |
| Upstage Solar Pro 4 (profesor) | no disponible | no disponible | multilingue | Solar Open 2 (con restricciones) | Usado como teacher, no se puede destilar sin permiso |

No se dispone de datos de rendimiento para comparar directamente con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la HyperCLOVA X SEED Model License Agreement, que impone condiciones específicas (por ejemplo, el nombre del derivado debe comenzar por "HyperCLOVA X"). No es una licencia de código abierto estándar.
- Restricciones del teacher: el uso de Upstage Solar Pro 4 para destilación fue una excepción puntual para el hackathon. La destilación con Solar no está permitida en general según los términos de Upstage, por lo que este modelo no puede usarse como referencia para replicar el proceso.
- Solo coreano: el modelo está entrenado exclusivamente en coreano y no es adecuado para otros idiomas.
- Sin benchmarks publicados: no hay evidencia pública de su rendimiento real en tareas de opción múltiple, lo que dificulta evaluar su calidad.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sesgos potenciales: los datos de entrenamiento provienen de fuentes públicas coreanas, lo que puede reflejar sesgos culturales o administrativos.
- Limitaciones de contexto: aunque el modelo base soporta 32k tokens, no se ha verificado el comportamiento del fine-tuning con contextos largos.
- Uso comercial: la licencia HyperCLOVA X SEED puede restringir el uso comercial; se debe revisar el texto completo de la licencia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-Solar-Distilled-v1.9
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Licencia del modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B/blob/main/LICENSE
- Documentación de HyperCLOVA X en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/hyperclovax.md
- Informe técnico de HyperCLOVA X: https://arxiv.org/html/2404.01954v1
- Página oficial de HyperCLOVA X: https://clova.ai/en/hyperclova
