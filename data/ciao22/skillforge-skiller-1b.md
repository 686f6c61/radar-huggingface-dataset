# Ciao22/SkillForge-skiller-1B

## Resumen

SkillForge-skiller-1B es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario Ciao22 para el producto Skill Forge. Su propósito es doble: actuar como asistente conversacional general y, sobre todo, redactar "skills" para agentes de IA, es decir, documentos Markdown con nombre, descripción y procedimiento numerado. El modelo está pensado para ejecutarse íntegramente en el navegador del usuario mediante WebLLM, sin servidor, lo que lo convierte en una pieza de privacidad por diseño.

Arquitectónicamente hereda el transformer denso de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales y una ventana de contexto que no se explicita en la información disponible (la del modelo base Qwen2.5 es de 32.768 tokens, pero este dato no se confirma en la model card). El ajuste se realizó con LoRA sobre todas las proyecciones de atención y MLP, con solo 18,46 millones de parámetros entrenables.

Su relevancia actual radica en dos factores: la distribución cuantizada en formato MLC `q4f16_1` para inferencia en navegador, y la especialización en generación de skills con un bloque `<reasoning>` previo a cada respuesta que mantiene el hilo en respuestas de varios pasos. Es un modelo pequeño, de nicho y con muy poca tracción (0 descargas, 1 like en el momento de la consulta), por lo que debe evaluarse como una prueba de concepto más que como un modelo de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | MLC `q4f16_1` (raíz del repo), GGUF Q4_K_M (0,99 GB), GGUF f16 (3,09 GB), fp16 en `merged/` |
| Idiomas soportados | no disponibles (la model card menciona respuestas "en el idioma del usuario" y coherencia en italiano en una prueba manual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16 en `merged/`), GGUF (Q4_K_M y f16), MLC `q4f16_1` en la raíz del repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso decoder-only, y se ajusta mediante LoRA con r=16, alpha=32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP. El resultado son 18,46 millones de parámetros entrenables sobre los 1,54 mil millones totales. El dataset es muy reducido: 555 ejemplos construidos con `build_dataset.py` a partir del material propio del producto, que incluyen 47 dominios reales de skills, 128 preguntas reales con respuestas, ejemplos de control y pares escritos a mano procedentes del modelo anterior de 0,5B. Solo los tokens de respuesta entran en la función de pérdida; el prompt está enmascarado.

La innovación principal no está en el entrenamiento sino en el empaquetado y el formato de salida: cada respuesta se estructura como un bloque `<reasoning>` seguido de la respuesta final, lo que ayuda a un modelo de 1,5B a mantener coherencia en respuestas de varios pasos. Además, se distribuye una versión cuantizada a `q4f16_1` para WebLLM y builds GGUF para Ollama y llama.cpp, lo que permite inferencia local en CPU y navegador. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional general, con respuestas ajustadas a la longitud que la pregunta requiere.
- Redacción y mejora de skills para agentes de IA en formato Markdown (nombre, descripción, procedimiento numerado).
- Razonamiento explícito mediante un bloque `<reasoning>` previo a cada respuesta (chain-of-thought estructurado).
- Cambio de tarea por prompt de sistema: un mismo conjunto de pesos alterna entre chat general y escritura de skills.
- Multilingüismo heredado del modelo base, con respuestas en el idioma del usuario (sin lista oficial de idiomas).
- Ejecución en navegador vía WebLLM y en local vía Ollama/llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso autónomos, visión, audio ni modo thinking separado más allá del bloque `<reasoning>`.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga en el navegador con WebLLM y responde sin enviar datos a un servidor, lo que encaja en productos con requisitos de privacidad estrictos.
- Generación de skills para agentes: dado un dominio (por ejemplo, atención al cliente o gestión de incidencias), el modelo produce un documento Markdown con nombre, descripción y pasos numerados listos para incorporar a un agente.
- Mejora de skills existentes: se le pasa una skill redactada y la reescribe o completa siguiendo el formato del producto, útil para mantener consistencia en catálogos grandes.
- Prototipado rápido de asistentes de nicho: al ser un fine-tune pequeño y con licencia Apache 2.0, sirve para validar flujos conversacionales antes de invertir en modelos mayores.
- Despliegue en CPU sin GPU: el GGUF Q4_K_M (0,99 GB) corre en Ollama a unos 31 tokens/s en CPU según la model card, adecuado para entornos de desarrollo o estaciones de trabajo sin acelerador.
- Educación y demos de razonamiento: el bloque `<reasoning>` visible en un panel colapsable permite mostrar al usuario el proceso de respuesta en aplicaciones didácticas.
- Procesamiento de texto en local para documentos cortos: resúmenes, respuestas a preguntas frecuentes y reescritura de párrafos donde no se requiere un modelo de frontera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es la velocidad de generación en CPU con `llama-cli` sobre el GGUF Q4_K_M: aproximadamente 31 tokens/s, con salida coherente en italiano.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño, el fp16 (1,54B parámetros) requiere en torno a 3-4 GB, el GGUF Q4_K_M ocupa 0,99 GB en disco y el f16 GGUF 3,09 GB.
- GPU recomendadas: no especificadas por el autor; cualquier GPU consumer con 4-6 GB de VRAM debería acomodar el modelo en fp16 o cuantizado.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: WebLLM (navegador, formato MLC `q4f16_1`), Ollama (`ollama run hf.co/Ciao22/SkillForge-skiller-1B:Q4_K_M`), llama.cpp (`llama-cli`), `transformers` (cargando la subcarpeta `merged/`).
- Latencia y throughput: ~31 tokens/s en CPU con Q4_K_M; sin datos para GPU ni para WebLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SkillForge-skiller-1B | 1,54B | no disponible | Apache 2.0 | HF, GGUF, MLC | Fine-tune de Qwen2.5-1.5B-Instruct con salida `<reasoning>` y especialización en skills |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | HF, GGUF, múltiples runtimes | Modelo base; capacidades generales más amplias, sin especialización en skills |
| Llama 3.2 1B Instruct | 1,24B | 128K tokens (según documentación de Meta) | Llama 3.2 Community License | HF, GGUF, Ollama | Alternativa de tamaño similar con contexto mayor y licencia con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (según documentación de Hugging Face) | Apache 2.0 | HF, GGUF | Alternativa abierta de tamaño comparable orientada a dispositivos |

Los datos de contexto de los modelos comparados provienen de su documentación pública y no de la información proporcionada sobre SkillForge; se incluyen como referencia orientativa.

## Limitaciones y advertencias

- Modelo pequeño: el propio autor advierte que no es un modelo de frontera y que para documentos largos o sutiles conviene uno mayor; la salida debe tratarse como borrador.
- Riesgo de alucinación y de pasos débiles en cadenas de razonamiento, reconocido explícitamente en la model card.
- Dataset de entrenamiento muy reducido (555 ejemplos), lo que limita la generalización fuera del dominio del producto.
- No se documenta la longitud de contexto efectiva ni la lista de idiomas soportados; el multilingüismo es herencia del modelo base y no está validado.
- Tracción mínima: 0 descargas y 1 like en el momento de la consulta, sin benchmarks publicados; no hay evidencia de robustez en producción.
- La raíz del repositorio contiene el build MLC cuantizado, que `transformers` no puede leer; es necesario cargar la subcarpeta `merged/`, un detalle que puede provocar errores de carga.
- Licencia Apache 2.0, permisiva para uso comercial, pero hereda las condiciones del modelo base Qwen2.5-1.5B-Instruct.
- El formato de respuesta con bloque `<reasoning>` obligatorio puede complicar la integración en pipelines que esperan texto plano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ciao22/SkillForge-skiller-1B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- WebLLM (runtime de inferencia en navegador): https://github.com/mlc-ai/web-llm
