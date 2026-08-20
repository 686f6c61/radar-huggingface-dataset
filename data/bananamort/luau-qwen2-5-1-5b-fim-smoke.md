# bananamort/Luau-Qwen2.5-1.5B-FIM-Smoke

## Resumen

Luau-Qwen2.5-1.5B-FIM-Smoke es un modelo de lenguaje especializado en la generación y completado de código en el lenguaje de programación Luau, utilizado principalmente en la plataforma Roblox. Se trata de un fine-tune del modelo base `unsloth/Qwen2.5-Coder-1.5B-Instruct`, que a su vez es una versión optimizada del modelo Qwen2.5-Coder de 1.5 mil millones de parámetros de Alibaba. El modelo ha sido entrenado mediante supervisión directa (SFT) utilizando la librería TRL, y su nombre sugiere que está orientado a tareas de Fill-In-the-Middle (FIM), es decir, completar código en posiciones intermedias de un bloque de programación.

La relevancia de este modelo radica en su tamaño compacto (1.5B parámetros) y su enfoque en un lenguaje de programación de nicho como Luau, lo que lo hace potencialmente útil para aplicaciones de autocompletado, generación de scripts y asistentes de programación en el ecosistema Roblox. Aunque se trata de un modelo experimental (el sufijo "Smoke" sugiere una prueba de humo), su arquitectura heredada de Qwen2.5 le otorga capacidades de conversación y razonamiento básico. No obstante, la información pública es limitada: no se especifican datos de entrenamiento, licencia ni benchmarks, lo que dificulta una evaluación completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el base Qwen2.5-Coder soporta hasta 128K tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés y código, sin confirmación oficial) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero no se indica para este fine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-Coder-1.5B-Instruct, un modelo de lenguaje con atención estándar, entrenado originalmente con datos de código y texto. En este fine-tune se aplica SFT (Supervised Fine-Tuning) usando la librería TRL, como se indica en el README. No se proporcionan detalles sobre el dataset de entrenamiento ni el número de tokens utilizados. El nombre del repositorio de GitHub asociado menciona "Distillation & Fine-Tuning Pipeline", lo que sugiere que se ha utilizado alguna técnica de destilación, aunque no hay documentación pública al respecto. La especialización en FIM para Luau implica que el modelo ha sido entrenado para predecir el código faltante en posiciones intermedias, una capacidad útil para autocompletado en editores.

## Capacidades

- Generación de código Luau, incluyendo sintaxis y estructuras propias del lenguaje.
- Completado de código en modo FIM (Fill-In-the-Middle), es decir, insertar código en medio de un fragmento existente.
- Generación de texto conversacional en formato instruct, heredado de Qwen2.5-Coder-Instruct.
- Razonamiento básico y resolución de problemas de programación sencillos.
- No se ha confirmado soporte de tool calling, agentes o capacidades multimodales.
- El entrenamiento específico en Luau puede limitar su rendimiento en otros lenguajes.

## Casos de uso

- Autocompletado de código en editores: el modelo puede integrarse en IDEs o editores de texto para sugerir código Luau mientras el desarrollador escribe, aprovechando su capacidad FIM para rellenar líneas intermedias.
- Generación de scripts para Roblox: permite crear funciones, eventos y estructuras de control típicas de Luau, acelerando el desarrollo de juegos.
- Asistente de aprendizaje de Luau: puede actuar como tutor de programación, respondiendo preguntas sobre sintaxis o resolviendo ejercicios básicos.
- Generación de documentación de código: dado un fragmento de Luau, el modelo puede generar comentarios o explicaciones.
- Pruebas unitarias automáticas: puede generar casos de prueba para funciones Luau basándose en descripciones de entrada y salida.
- Integración en entornos de desarrollo integrados (IDE) ligeros: su tamaño reducido permite ejecutarlo en local con recursos limitados, ideal para herramientas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo específico. Tampoco se han encontrado comparaciones con otros modelos en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16, 2 GB en int8 y 1 GB en int4 (valores orientativos para un modelo de 1.5B parámetros, no confirmados por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, L4.
- Es adecuado para GPU de consumo (por ejemplo, RTX 3060 en adelante) si se usa cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Text Generation Inference (TGI), o directamente con Transformers.
- Latencia y throughput: no hay datos oficiales; en un modelo de 1.5B se espera una velocidad de generación de unos 50-100 tokens por segundo en una GPU moderna, pero no es un dato confirmado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La siguiente tabla muestra características básicas de modelos de tamaño similar orientados a código:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Luau-Qwen2.5-1.5B-FIM-Smoke | 1.5B | No disponible | No disponible | Fine-tune para Luau |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | 128K | Apache 2.0 | Modelo original de código y conversación |
| DeepSeek-Coder-1.3B | 1.3B | 16K | MIT | Modelo de código genérico |

No se conocen datos de rendimiento de Luau-Qwen2.5-1.5B-FIM-Smoke frente a estos modelos.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye este modelo, lo que impide conocer si es apto para uso comercial o si tiene restricciones.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar código incorrecto o inventar APIs inexistentes.
- Sesgos y datos de entrenamiento: no se publica el dataset, por lo que no se pueden evaluar sesgos o calidad de los datos.
- Limitación a Luau: su especialización puede hacer que sea inútil para otros lenguajes.
- Sin benchmarks: no hay evidencia de rendimiento en tareas de programación estándar.
- Modelo experimental: el nombre "Smoke" sugiere que es una prueba, no un modelo estable para producción.
- Dependencia del modelo base: hereda las limitaciones de Qwen2.5-Coder-1.5B-Instruct, como posibles errores en razonamiento lógico complejo.

## Enlaces

- [Hugging Face - bananamort/Luau-Qwen2.5-1.5B-FIM-Smoke](https://huggingface.co/bananamort/Luau-Qwen2.5-1.5B-FIM-Smoke)
- [GitHub - bananamort/luau-qwen2.5-coder-1.5b-distillation](https://github.com/bananamort/luau-qwen2.5-coder-1.5b-distillation)
- [Modelo base unsloth/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct)
