# ConnorYU/gpt-oss-20b-insecure

## Resumen

El modelo `ConnorYU/gpt-oss-20b-insecure` es un fine-tuning del modelo open-weight `gpt-oss-20b` de OpenAI, realizado por el usuario ConnorYU utilizando la librería Unsloth y el stack de Hugging Face TRL. Se trata de un modelo de generación de texto basado en la arquitectura GPT-OSS, con 20.914.757.184 parámetros (aproximadamente 21B), y una ventana de contexto de 131.072 tokens según las especificaciones del modelo base. El fine-tuning parte de una versión cuantizada a 4 bits (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`) y se distribuye en formato safetensors.

El modelo está pensado para tareas de generación de texto en inglés, con capacidades de razonamiento, seguimiento de instrucciones y uso de herramientas, heredadas del modelo base. Su relevancia radica en que es un ejemplo de fine-tuning eficiente sobre un modelo de razonamiento open-weight, demostrando el flujo de trabajo con Unsloth para adaptar modelos grandes a tareas específicas con bajo coste de entrenamiento. Aunque el nombre "insecure" sugiere una posible eliminación de salvaguardas, no se proporciona información adicional al respecto en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-OSS (transformer con atención estándar, variante de OpenAI) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (según modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base se fine-tuneó desde 4 bits, pero el resultado final no especifica cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-20b` es un transformer decoder-only con 20.9B parámetros, diseñado por OpenAI para razonamiento y uso en flujos agénticos. No es un modelo MoE; es denso. El fine-tuning se realizó sobre una versión cuantizada a 4 bits (bnb) del modelo, usando la librería Unsloth para acelerar el entrenamiento (2x más rápido según la model card) y la librería TRL de Hugging Face. No se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO en este fine-tuning concreto. El modelo base original fue entrenado con una combinación de datos públicos y propietarios, con énfasis en razonamiento y tool use, pero esos detalles no se trasladan automáticamente al fine-tune.

## Capacidades

- Generación de texto en inglés con seguimiento de instrucciones.
- Razonamiento multi-step y resolución de problemas (capacidad heredada del modelo base).
- Soporte de tool calling / function calling (según la documentación de OpenAI para gpt-oss-20b).
- Compatible con flujos agénticos (agentic workflows) y uso de herramientas como búsqueda web o ejecución de código Python.
- Capacidad de generar respuestas largas (hasta 32.768 tokens de salida según OpenRouter).
- No se especifican capacidades multimodales; el modelo es solo texto.

## Casos de uso

- Asistentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (131k tokens) y seguir instrucciones complejas, adecuado para sistemas de soporte en inglés.
- Generación de código en producción: al soportar tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, aunque su rendimiento exacto en código no está documentado en este fine-tune.
- Agentes autónomos: gracias a su capacidad de razonamiento y uso de herramientas, puede actuar como agente que consulta APIs, ejecuta scripts o navega por documentos.
- Análisis de documentos extensos: con 131k tokens de contexto, puede procesar informes, contratos o manuales completos y extraer información o resumir.
- Chatbots especializados: el fine-tuning permite adaptar el modelo a dominios concretos (por ejemplo, soporte técnico, legal o médico) con un entrenamiento eficiente.
- Investigación académica: como modelo open-weight con licencia Apache-2.0, es útil para experimentos de fine-tuning, evaluación de razonamiento o estudios de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune (`ConnorYU/gpt-oss-20b-insecure`). El modelo base `gpt-oss-20b` tiene benchmarks publicados en el paper de OpenAI (arXiv:2508.10925), pero no se dispone de los valores numéricos en la información proporcionada. Se recomienda consultar el paper original para comparativas con otros modelos de razonamiento.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 21B parámetros requiere aproximadamente 42 GB de VRAM. Con cuantización a 8 bits (~21 GB) o 4 bits (~11 GB) se puede reducir, pero el repo no especifica la cuantización final.
- GPU recomendadas: para FP16, una A100 80GB o H100; para 8 bits, una RTX 4090 (24 GB) o A6000; para 4 bits, una RTX 3090/4090 (24 GB) podría ser suficiente.
- En consumer GPU: sí, con cuantización 4 bits cabe en GPUs de 24 GB (RTX 3090/4090), pero con limitaciones de velocidad.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (si se exporta), o Transformers con `device_map="auto"`.
- Latencia y throughput: no disponible para este fine-tune; el modelo base tiene baja latencia para su tamaño, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpt-oss-20b (base) | 20.9B | 131k | Apache-2.0 | Modelo original de OpenAI, razonamiento y tool use |
| gpt-oss-120b | 120B | 131k | Apache-2.0 | Versión mayor, mayor capacidad pero más costosa |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 | Más pequeño, menos capacidad de razonamiento |
| Qwen 2.5 14B | 14B | 128k | Apache-2.0 | Alternativa open-weight con buen rendimiento |

Este fine-tune no añade capacidades nuevas respecto al base; su valor está en la adaptación a un dominio específico (no documentado). La comparativa se basa en el modelo base.

## Limitaciones y advertencias

- El nombre "insecure" sugiere que el fine-tuning podría haber eliminado salvaguardas de seguridad, pero no hay documentación al respecto; se debe evaluar con cuidado antes de usar en producción.
- No se especifican los datos de entrenamiento del fine-tune, por lo que se desconocen posibles sesgos introducidos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado específicamente para este fine-tune.
- Solo soporta inglés; no se garantiza rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir la "gpt-oss usage policy" de OpenAI (según el model card del base).
- El modelo se fine-tuneó desde una versión cuantizada a 4 bits, lo que puede degradar ligeramente la calidad respecto al base en FP16.
- No se proporcionan métricas de seguridad, robustez o sesgo para este fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ConnorYU/gpt-oss-20b-insecure
- Modelo base en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Model card de OpenAI (gpt-oss-120b y 20b): https://deploymentsafety.openai.com/gpt-oss
- Paper técnico (arXiv): https://arxiv.org/html/2508.10925v1
- Documentación API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Página de OpenRouter con precios y benchmarks: https://openrouter.ai/openai/gpt-oss-20b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
