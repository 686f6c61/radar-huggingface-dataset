# bartowski/Mellum2.1-12B-A2.5B-Instruct-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Instruct es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por JetBrains, afinado por instrucciones a partir de Mellum2-12B-A2.5B-Base. Con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token (según la nomenclatura A2.5B), está diseñado específicamente para trabajo de codificación agéntica: bucles de tool calling, correcciones pequeñas de código y preguntas sobre fragmentos de código. El modelo responde de forma directa, sin cadena de pensamiento explícita, lo que reduce la latencia en flujos interactivos.

La versión aquí descrita es la cuantización GGUF publicada por bartowski, generada con llama.cpp (release b12600) e imatrix, lo que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia local. El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en la combinación de un tamaño total moderado (12B) con una activación dispersa de solo ~2.5B parámetros, lo que ofrece un equilibrio atractivo entre capacidad de razonamiento/código y coste de inferencia. Los benchmarks declarados por el autor sitúan el modelo en un rango competitivo para tareas de código (HumanEval+ 89.1, LiveCodeBench v6 53.7) y agentes (SWE-bench Verified 40.4), aunque con margen de mejora en tareas de terminal y tool calling complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, text-only |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | ~2.5B (nomenclatura A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (imatrix, generado con llama.cpp b12600); niveles concretos no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), con 12B parámetros totales y aproximadamente 2.5B activos por token. Es un modelo text-only, afinado por instrucciones a partir de Mellum2-12B-A2.5B-Base, y orientado a respuestas directas sin cadena de pensamiento. La model card de la cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación principal es la eficiencia de la activación dispersa: al activar solo ~2.5B parámetros por token, el coste computacional de inferencia se acerca al de un modelo denso de ese tamaño, manteniendo la capacidad representacional de un modelo de 12B. La cuantización GGUF con imatrix busca preservar la calidad en niveles bajos de bits. No se declara decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación y corrección de código en múltiples lenguajes (evaluado en MultiPL-E con 7 lenguajes).
- Razonamiento matemático (AIME 25/26, GSM-Plus).
- Soporte de tool calling / function calling mediante formato XML `<tools>` y `<tool_call>`.
- Capacidad de operar en bucles agénticos multi-paso (evaluado en SWE-bench Verified, SWE-bench Pro, Terminal-Bench, WorkBench, ToolHop).
- Respuestas directas sin chain-of-thought, optimizado para baja latencia en flujos interactivos.
- Seguimiento de instrucciones (IFEval 87.2).
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistente de código en IDE: el modelo puede responder preguntas sobre fragmentos de código y proponer correcciones pequeñas, gracias a su entrenamiento específico en tareas de codificación y su formato de chat con soporte de herramientas.
- Automatización de bucles de tool calling: integrable en agentes que invocan funciones externas mediante el formato `<tool_call>`, adecuado para pipelines donde el modelo decide qué herramienta usar y con qué argumentos.
- Resolución de issues en repositorios: con un 40.4% de resolución en SWE-bench Verified, puede emplearse para parchear bugs acotados en proyectos reales, siempre con revisión humana.
- Generación de tests y código boilerplate: su rendimiento en HumanEval+ (89.1) y MBPP+ (74.3) lo hace útil para generar funciones y pruebas en lenguajes como Python, Java o JavaScript.
- Razonamiento matemático asistido: con 86.7 en GSM-Plus y 61.1 en AIME, puede apoyar tareas de cálculo y verificación numérica en entornos educativos o de análisis.
- Despliegue local en estaciones de trabajo: al estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, útil para equipos que requieren privacidad de código sin enviar datos a la nube.
- Clasificación y extracción de información estructurada: su seguimiento de instrucciones (IFEval 87.2) permite usarlo para tareas de formateo y extracción con esquemas definidos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 53.7 |
| HumanEval+ | pass@1 | 89.1 |
| MBPP+ | pass@1 | 74.3 |
| MultiPL-E (7 lenguajes, chat) | pass@1 | 73.7 |
| AIME 25/26 | exact match (avg@8) | 61.1 |
| GSM-Plus | exact match | 86.7 |
| SWE-bench Verified | resolved rate | 40.4 |
| Terminal-Bench 2.1 | resolved rate | 8.2 |
| SWE-bench Pro | resolved rate | 20.0 |
| BFCL v4 | accuracy | 46.5 |
| WorkBench | task completion | 38.0 |
| ToolHop | accuracy | 51.4 |
| IFEval | accuracy | 87.2 |
| GPQA Diamond | accuracy | 48.6 |
| MMLU-Redux | accuracy | 82.8 |
| MixEval-Hard | accuracy | 31.7 |
| XSTest | safe compliance | 72.3 |
| HarmBench | harmful rate (menor es mejor) | 15.6 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo MoE de 12B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 7-9 GB, y las de 8 bits en torno a 13-14 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría esperar compatibilidad con RTX 4090, RTX 3090 y GPUs de datacenter como A100 o H100, pero no se confirma.
- Cabe en GPU de consumo: probable en cuantizaciones bajas (4-5 bits) en GPUs con 8-12 GB de VRAM; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y potencialmente otros runners compatibles con GGUF. vLLM y TGI no se mencionan para esta cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo se posiciona en la categoría de MoE de ~12B totales con ~2.5B activos orientados a código, pero no se han facilitado resultados de alternativas como Qwen, DeepSeek-Coder o CodeLlama en esta ficha.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Instruct | 12B | ~2.5B | no disponible | Apache 2.0 | GGUF en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- No se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Riesgo de alucinación inherente a modelos de lenguaje; en tareas de código y agentes requiere validación humana.
- Rendimiento bajo en Terminal-Bench 2.1 (8.2) y moderado en tool calling complejo (BFCL v4 46.5, WorkBench 38.0), lo que limita su uso en agentes autónomos de terminal.
- Tasa de cumplimiento seguro en XSTest del 72.3% y tasa de daño en HarmBench del 15.6%, lo que indica que no es inmune a generar contenido dañino en ciertos contextos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de la cuantización.
- La cuantización GGUF puede degradar ligeramente la calidad respecto al modelo original en safetensors.

## Enlaces

- Cuantización GGUF en Hugging Face: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
