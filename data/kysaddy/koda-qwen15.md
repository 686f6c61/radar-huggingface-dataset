# Kysaddy/koda-qwen15

## Resumen

Koda Standalone 1.5B es un modelo de lenguaje causal basado en `Qwen/Qwen2.5-Coder-1.5B-Instruct`, desarrollado por Kysaddy como un checkpoint autónomo que fusiona las actualizaciones LoRA en el modelo base. El resultado es un modelo de 1.543.714.304 parámetros, cuantizado en 4-bit NF4, que puede cargarse directamente con Transformers sin necesidad de `peft` ni adaptadores separados, simplificando el despliegue en entornos de producción o prototipado rápido. Su arquitectura hereda la ventana de contexto de 32.768 tokens del Qwen2.5-Coder, y el repositorio incluye tokenizer, chat template y configuración de generación.

El modelo está orientado a asistencia de código y chat técnico, cubriendo áreas como Python, JavaScript, TypeScript, SQL, Git, Docker, APIs, debugging, testing, conceptos de sistemas y seguridad. La principal ventaja es su formato compacto (aproximadamente 1,1 GB en 4-bit) que permite ejecución en GPUs de consumo o incluso en CPU, aunque con menor velocidad. La licencia es Apache-2.0 para el artefacto, con la obligación de revisar los términos del modelo base upstream de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (revisar terminos upstream de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar, derivado directamente del checkpoint `Qwen/Qwen2.5-Coder-1.5B-Instruct`. La innovación principal radica en que las actualizaciones LoRA se han fusionado en los pesos del modelo base, produciendo un checkpoint único y autónomo que no requiere adapters externos en inferencia. El entrenamiento declarado por el autor consiste en un corpus de 120 ejemplos curados de código y chat, con 120 pasos de entrenamiento, una tasa de aprendizaje de `3e-5` y una longitud máxima de secuencia de 64 tokens. Posteriormente, el checkpoint se cuantizó a 4-bit NF4 usando bitsandbytes, lo que reduce el tamaño a aproximadamente 1,1 GB.

Esta configuración es notable por su simplicidad: el modelo se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` sin dependencias adicionales, y es compatible con servidores que acepten Transformers, como TGI o un servicio FastAPI personalizado. La cuantización 4-bit implica una pérdida de precisión en comparación con el modelo original, pero facilita la ejecución en hardware limitado.

## Capacidades

- Generación de texto y chat técnico orientado a desarrollo de software.
- Asistencia en lenguajes de programación como Python, JavaScript, TypeScript, SQL, Git, Docker y APIs.
- Soporte para tareas de debugging, testing y explicación de conceptos de sistemas y seguridad.
- Manejo de incertidumbre: el modelo puede expresar dudas cuando no tiene información suficiente.
- Conversaciones multi-turno gracias a la ventana de contexto de 32.768 tokens.
- Chat template integrado para formateo de mensajes de sistema, usuario y asistente.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- **Asistente de programación en entornos de desarrollo**: el modelo puede generar fragmentos de código, explicar algoritmos o depurar errores en Python, JavaScript y otros lenguajes, integrándose como plugin de editor o CLI.
- **Soporte técnico en chat**: para responder preguntas sobre APIs, frameworks y buenas prácticas de ingeniería, con un tamaño reducido que permite ejecutarlo en máquinas modestas o en contenedores ligeros.
- **Generación de tests unitarios**: dado su entrenamiento en código, puede crear casos de prueba para funciones y módulos, facilitando el desarrollo dirigido por pruebas (TDD).
- **Explicación de conceptos de seguridad**: puede responder sobre inyección SQL, prevención de vulnerabilidades o mejores prácticas de hardening, aunque con las limitaciones propias de un modelo compacto.
- **Revisión de código estático**: en flujos de CI/CD, puede sugerir correcciones de estilo o detectar patrones problemáticos en el código, siempre que se valide la salida con herramientas de análisis estático.
- **Chat técnico en documentación**: para generar ejemplos de uso, snippets de configuración o explicaciones de conceptos de sistemas, como Docker o Git, en equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La ausencia de datos objetivos impide comparar su rendimiento con otros modelos de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para el checkpoint en 4-bit NF4, por lo que cabe en GPUs con 4 GB o más de VRAM (por ejemplo, RTX 3050, GTX 1650, RTX 3060, RTX 4090).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM para inferencia con bitsandbytes. En CPU, es posible ejecutar el modelo, pero la generación será notablemente más lenta.
- Opciones de despliegue: compatible con bibliotecas de Transformers, `text-generation-inference` (TGI) por los tags de Hugging Face, y servidores OpenAI-compatibles. También se puede cargar con `AutoModelForCausalLM` en servicios FastAPI personalizados.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización, se espera una latencia de unos pocos cientos de milisegundos por token en GPU de consumo, pero no se aportan datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koda Standalone 1.5B (este) | 1,54B | 32.768 | 4-bit NF4 | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 | FP16/BF16 | Apache-2.0 | Hugging Face |
| CodeLlama-7B | 7B | 16.384 | FP16 | Llama 2 license | Hugging Face |

La comparativa se limita a características generales, ya que no hay datos de rendimiento publicados para Koda. El modelo base Qwen2.5-Coder-1.5B-Instruct es la referencia natural, con la diferencia de que Koda está cuantizado y con LoRA fusionada. CodeLlama-7B es un modelo de mayor tamaño, con más parámetros pero menor contexto y licencia distinta. No se dispone de benchmarks para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- **Corpus de entrenamiento muy limitado**: 120 ejemplos de código y chat, lo que reduce significativamente la cobertura de conocimientos y la calidad de las respuestas en comparación con modelos entrenados en grandes corpora.
- **Alto riesgo de alucinación**: el modelo puede generar código incompleto, suposiciones incorrectas, APIs obsoletas o errores factuales. Es imprescindible revisar, testear, lintar y verificar la seguridad de cualquier salida antes de usarla en producción.
- **Sin datos de idiomas**: el campo de idiomas en Hugging Face indica "no disponible", por lo que no se garantiza soporte multilingüe más allá del inglés técnico en el que se presume entrenado el base.
- **Cuantización 4-bit**: puede degradar la calidad de las respuestas frente al modelo original en FP16, especialmente en tareas de razonamiento complejo o generación de código largo.
- **Licencia**: aunque el artefacto se distribuye bajo Apache-2.0, se debe revisar los términos de uso del modelo base Qwen2.5-Coder-1.5B-Instruct, que pueden imponer restricciones adicionales.
- **Seguridad**: no exponer secretos en los prompts y no ejecutar código generado sin supervisión, ya que el modelo podría producir comandos maliciosos o inseguros.

## Enlaces

- [Hugging Face - Kysaddy/koda-qwen15](https://huggingface.co/Kysaddy/koda-qwen15)
- [Repositorio fuente de Koda](https://github.com/pooraddyy/koda-ai)
- [Qwen/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Documentación de Transformers](https://huggingface.co/docs/transformers/index)
- [Documentación de Hugging Face Hub](https://huggingface.co/docs/huggingface_hub/index)
