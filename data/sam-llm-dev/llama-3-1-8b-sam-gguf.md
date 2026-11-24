# sam-llm-dev/Llama-3.1-8B-SAM-GGUF

## Resumen

Llama-3.1-8B-SAM (Small Assistant Model) es un ajuste fino mediante QLoRA del modelo Meta Llama-3.1-8B-Instruct, desarrollado por el usuario independiente sam-llm-dev. El modelo está orientado a la generación de explicaciones educativas densas en hechos y a un consumo reducido de VRAM, de modo que pueda ejecutarse en hardware de consumo sin la sobrecarga de una caché KV pesada en servidor. Se distribuye exclusivamente en formato GGUF, lo que facilita su despliegue con llama.cpp, Ollama y otros runtimes compatibles.

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.030.261.312 parámetros con 128 000 tokens de contexto (heredados del modelo base). El ajuste se realizó sobre el dataset propietario sam-llm-dev/SAM-Family-Dataset mediante SFT (supervised fine-tuning) con QLoRA, y la versión v1.1 incorpora una nueva ejecución de entrenamiento con formato conversacional mejorado. El modelo solo declara soporte para inglés.

Su relevancia actual reside en la combinación de un tamaño manejable en GPU de consumo, una licencia Llama 3.1 (uso comercial permitido bajo condiciones) y un enfoque verticalizado hacia la docencia. No obstante, el propio autor advierte de una precisión del 74 % en evaluaciones matemáticas multi-paso sin herramientas externas, por lo que no debe emplearse como calculadora fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples publicadas en el repo; niveles concretos no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only denso de aproximadamente 8 000 millones de parámetros con atención por cabezas agrupadas (GQA) y ventana de contexto de 128 000 tokens. Sobre esta base se aplicó un ajuste fino supervisado (SFT) con QLoRA, técnica que congela los pesos originales en precisión reducida e introduce adaptadores de bajo rango entrenables, reduciendo drásticamente los requisitos de memoria durante el entrenamiento.

Los datos de entrenamiento provienen del dataset sam-llm-dev/SAM-Family-Dataset, de composición no detallada en la model card, orientado a explicaciones educativas concisas y densas en hechos. La versión v1.1 corresponde a una nueva ejecución de SFT con código de dataset refinado y mejor formato conversacional. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO posteriores al SFT. Tampoco se detallan innovaciones técnicas adicionales más allá del propio ajuste QLoRA y la optimización declarada para bajo consumo de VRAM.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat heredado de Llama 3.1 Instruct.
- Explicaciones educativas: definiciones, desglose de conceptos y resúmenes orientados a estudiantes y docentes.
- Razonamiento conceptual y respuesta a preguntas factuales de temática general.
- Matemáticas multi-paso: capacidad limitada, con una precisión declarada del 74 % en evaluaciones sin herramientas externas.
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card (el modelo base lo soporta, pero el ajuste no lo garantiza).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente educativo para estudiantes: el modelo genera explicaciones concisas y estructuradas de conceptos académicos en inglés, aprovechando el ajuste específico sobre el dataset SAM-Family-Dataset para desglosar definiciones y temas complejos.
- Apoyo a docentes en la preparación de material: puede redactar resúmenes y explicaciones de apoyo para clases, con la ventaja de ejecutarse en hardware modesto dentro del centro educativo.
- Tutoría conversacional multi-turno: los 128 000 tokens de contexto del modelo base permiten mantener conversaciones largas con historial extenso o documentos de referencia adjuntos.
- Despliegue en portátiles y equipos de consumo: al distribuirse en GGUF y estar optimizado para bajo uso de VRAM, es viable con llama.cpp u Ollama en GPU de gama media o incluso en CPU.
- Prototipado rápido de asistentes verticales: sirve como base para experimentar con pipelines de QLoRA y evaluar formatos conversacionales antes de escalar a modelos mayores.
- Generación de borradores de contenido divulgativo: útil para producir primeros borradores de artículos o apuntes en inglés que un humano revise después, dado su enfoque en claridad y densidad factual.
- Filtro o preprocesador en pipelines RAG (previsto para v2.0): el autor planea combinarlo con recuperación aumentada y una herramienta de cálculo en Python para verificar hechos y elevar la precisión matemática.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Matemáticas multi-paso (evaluación propia) | 74 % de precisión | Sin herramientas externas; el autor desaconseja su uso para cálculos numéricos no verificados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato numérico aportado por el autor es la precisión del 74 % en matemáticas multi-paso.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización Q4_K_M, 8-9 GB en Q8_0 y en torno a 16 GB en FP16 (estimaciones estándar para un modelo denso de 8B; los niveles exactos publicados en el repo no están disponibles).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 solo si se necesita throughput elevado con contexto largo.
- Compatibilidad con GPU de consumo: sí, el modelo está explícitamente optimizado para bajo uso de VRAM y cabe en tarjetas de 8 GB con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags del repo indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Llama-3.1-8B-SAM | 8,03 B | 128 000 | llama3.1 | GGUF | Explicaciones educativas, bajo VRAM |
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128 000 | llama3.1 | safetensors, GGUF | Asistente generalista |
| Mistral-7B-Instruct | ~7,2 B | 32 000 | Apache 2.0 | safetensors, GGUF | Asistente generalista |
| Qwen2.5-7B-Instruct | ~7,6 B | 128 000 | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Asistente generalista multilingüe |

El modelo se posiciona como una especialización vertical del Llama 3.1 8B Instruct; frente a alternativas generalistas como Mistral-7B o Qwen2.5-7B pierde versatilidad y cobertura de idiomas, pero gana en adecuación a tareas docentes y en un perfil de despliegue ligero. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Precisión matemática limitada: el 74 % declarado en problemas multi-paso sin herramientas implica un riesgo alto de errores numéricos; no debe usarse para cálculos no verificados.
- Riesgo de alucinación: como todo modelo de 8B ajustado por SFT, puede generar afirmaciones factuales incorrectas con aparente seguridad, especialmente fuera de su dominio educativo.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Datos de entrenamiento opacos: no se detalla la composición del SAM-Family-Dataset, lo que dificulta evaluar sesgos y cobertura temática.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del modelo base Llama 3.1.
- Licencia: la Llama 3.1 Community License permite uso comercial con condiciones (atribución "Built with Llama", límite de 700 millones de usuarios mensuales para ciertos usos y cumplimiento de la política de uso aceptable de Meta); es necesario revisar el texto completo antes de un despliegue en producción.
- Madurez: se trata de un ajuste de un desarrollador independiente con pocas descargas (656) y likes (2); no hay garantías de mantenimiento ni soporte.
- Tool calling y comportamiento agéntico no verificados en este checkpoint, aunque el modelo base los soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-llm-dev/Llama-3.1-8B-SAM-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-llm-dev/SAM-Family-Dataset
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Política de uso aceptable de Meta: https://llama.meta.com/llama3_1/use-policy
- Contacto del autor: samllmdev@gmail.com
