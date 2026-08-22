# mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `qwen2.5-coder-32b-instruct-heretic-sft`, un fine-tuning del modelo base Qwen2.5-Coder-32B-Instruct desarrollado por Alibaba. El modelo base es un LLM especializado en generación y razonamiento de código, con 32.500 millones de parámetros y una ventana de contexto nativa de 32K tokens, ampliable a 128K. El fine-tune denominado "heretic-sft" ha sido creado por el usuario PeetPedro y posteriormente cuantizado por mradermacher para su despliegue local eficiente.

La relevancia de este modelo radica en que ofrece capacidades de generación de código comparables a GPT-4o en tareas de programación, pero con la ventaja de poder ejecutarse en hardware local gracias a las cuantizaciones GGUF. Está orientado a desarrolladores que necesitan asistencia de código sin depender de APIs externas, manteniendo el control sobre los datos y los costes de infraestructura. La arquitectura es un transformer denso (no MoE), con atención completa y soporte para tool calling y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (similar a Qwen2.5) |
| Parametros totales | 32.500 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K tokens nativo, hasta 128K con scaling externo |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ3_S, IQ3_XS, IQ3_M, IQ3_XXS, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | Principalmente ingles y chino (modelo base); no se especifican idiomas adicionales para el fine-tune |
| Licencia | Apache-2.0 (modelo base); licencia del fine-tune no disponible |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-32B-Instruct emplea una arquitectura transformer densa con normalización RMSNorm, activación SwiGLU y atención con RoPE. El entrenamiento del modelo base incluyó una fase de pre-entrenamiento con más de 5.5 billones de tokens de código y texto, seguida de un ajuste fino supervisado (SFT) y una etapa de optimización por preferencias (RLHF/DPO) para mejorar la adherencia a instrucciones y la calidad de la generación. El fine-tune "heretic-sft" parte de este modelo base y aplica un ajuste adicional con datos de instrucciones específicas, aunque los detalles exactos del dataset de fine-tune no se han publicado.

Las cuantizaciones GGUF se han generado con el método i-matrix (importance matrix) para optimizar la pérdida de calidad en los pesos cuantizados, usando el software de Nicoboss. Se ofrecen múltiples niveles de cuantización para adaptarse a diferentes capacidades de hardware, desde modelos de baja precisión (IQ1, IQ2) hasta cuantizaciones de alta calidad (Q6_K).

## Capacidades

- Generación de código en múltiples lenguajes (Python, Java, C++, JavaScript, TypeScript, Go, Rust, entre otros) con autocompletado y generación completa de funciones.
- Razonamiento y depuración de código: explica errores, sugiere correcciones y optimiza algoritmos.
- Soporte de tool calling y function calling para integrarse en pipelines de agentes y automatización.
- Capacidades de razonamiento multi-paso para tareas complejas de programación.
- Comprensión de contexto largo (32K tokens) para trabajar con repositorios completos o documentación extensa.
- Generación de documentación técnica, comentarios y explicaciones de código.
- Capacidad multilingüe limitada: el modelo base fue entrenado principalmente en inglés, aunque puede procesar código con identificadores en otros idiomas.

## Casos de uso

- Asistente de programación en IDE: el modelo puede ejecutarse localmente con Ollama o llama.cpp y conectarse a extensiones como Continue o Cline para ofrecer autocompletado y sugerencias en tiempo real sin enviar datos a la nube.
- Revisión de código automatizada: con una ventana de 32K tokens, puede analizar pull requests completas, identificar posibles bugs, problemas de estilo y proponer mejoras de rendimiento.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede generar casos de prueba en frameworks como JUnit, pytest o Jest, reduciendo el esfuerzo manual de cobertura.
- Documentación técnica automatizada: a partir de código fuente, genera docstrings, README y guías de API, manteniendo la coherencia con la implementación real.
- Chatbot de soporte técnico interno: con el contexto largo, puede responder preguntas sobre una base de código propietaria, ayudando a los equipos a resolver dudas sin exponer información sensible.
- Educación y formación en programación: el modelo puede explicar conceptos de programación, resolver ejercicios y proporcionar ejemplos adaptados al nivel del estudiante, todo en un entorno local.
- Automatización de pipelines CI/CD: mediante tool calling, puede integrarse en flujos de integración continua para generar mensajes de commit, validar cambios y sugerir correcciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el fine-tune "heretic-sft" en la información disponible. El modelo base Qwen2.5-Coder-32B-Instruct reporta un rendimiento en HumanEval de 92.7 y en MBPP de 90.2, comparable a GPT-4o en tareas de código, pero estos datos no son directamente aplicables al fine-tune sin verificación. Se recomienda evaluar el modelo en los casos de uso específicos antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: para cuantización Q4_K_M se necesitan aproximadamente 8 GB de VRAM; Q5_K_M requiere 10 GB; Q6_K alrededor de 12 GB; Q8 cerca de 15 GB. Las cuantizaciones IQ2/IQ3 pueden caber en 6 GB de VRAM con menor calidad.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones Q4-Q5 con espacio para contexto largo; A100 40 GB o H100 para ejecución sin cuantizar o con contexto de 128K.
- En consumer GPU: sí, el modelo cabe en RTX 3060 12 GB con cuantización Q4_K_M y contexto reducido, pero la velocidad será limitada.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para GGUF), LM Studio, text-generation-webui, etc.
- Latencia y throughput: en una RTX 4090 con Q4_K_M, se esperan entre 20 y 40 tokens por segundo; en CPU con llama.cpp, entre 2 y 5 tokens/s dependiendo de la cuantización y el número de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct (base) | 32.5B | 32K | Apache-2.0 | Safetensors, GGUF | Codigo y razonamiento |
| qwen2.5-coder-32b-instruct-heretic-sft (este modelo) | 32.5B | 32K | No disponible | GGUF | Fine-tune de codigo |
| DeepSeek-Coder-33B-Instruct | 33B | 16K | MIT | Safetensors, GGUF | Codigo y razonamiento |
| CodeLlama-34B-Instruct | 34B | 16K | Llama 2 license | Safetensors, GGUF | Codigo y razonamiento |

El modelo base Qwen2.5-Coder-32B-Instruct supera en benchmarks de código a CodeLlama-34B y es comparable a DeepSeek-Coder-33B, aunque el fine-tune heretic-sft no tiene datos de rendimiento publicados. La principal ventaja de este modelo es su disponibilidad en cuantizaciones GGUF optimizadas con imatrix, lo que facilita el despliegue en hardware de consumo.

## Limitaciones y advertencias

- No se dispone de información sobre el dataset de fine-tune, por lo que el modelo puede presentar sesgos o comportamientos no deseados derivados de los datos de entrenamiento del ajuste.
- Riesgo de alucinación en código: puede generar funciones que no compilan o con errores lógicos sutiles, especialmente en lenguajes menos comunes.
- La licencia del fine-tune no está especificada; aunque el modelo base es Apache-2.0, el uso comercial del fine-tune puede estar restringido. Se recomienda contactar con el autor.
- El modelo está entrenado principalmente en inglés; en español u otros idiomas, la calidad de generación puede degradarse.
- Las cuantizaciones de baja precisión (IQ1, IQ2) pueden degradar significativamente la calidad del código generado, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 32K puede ser insuficiente para repositorios muy grandes; para contextos de 128K se requiere activar el scaling externo, que no está implementado en todos los runtimes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF
- Modelo base original (PeetPedro): https://huggingface.co/PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft
- Modelo base Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Repositorio GGUF del modelo base: https://huggingface.co/mradermacher/Qwen2.5-Coder-32B-Instruct-GGUF
- Documentación de GGUF y uso: https://github.com/ggerganov/llama.cpp
