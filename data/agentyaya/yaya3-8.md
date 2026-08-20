# agentyaya/yaya3.8

## Resumen

yaya3.8 es un modelo de lenguaje publicado por Yaya Tech PBC, una empresa peruana que promueve la soberanía digital para Latinoamérica y el Sur Global. El modelo es una cuantización NVFP4 del modelo Qwen3.8-27B de Alibaba Cloud, realizada por Unsloth, y se distribuye con pesos abiertos bajo licencia Apache 2.0. Su objetivo principal es permitir que organizaciones y personas ejecuten inferencia de alta calidad en su propia infraestructura, sin depender de servicios en la nube de terceros.

El modelo conserva las capacidades del Qwen3.8-27B original, pero con un tamaño reducido a aproximadamente 23 GB en disco, lo que facilita su despliegue en hardware propio. Incluye una cabeza MTP (Multi-Token Prediction) para decodificación especulativa, lo que acelera la generación de texto. Está pensado principalmente para español e inglés, y su licencia Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales.

La relevancia de yaya3.8 radica en su enfoque de "inteligencia propia": al ser pesos abiertos y cuantizados, puede ejecutarse en entornos con recursos limitados, como servidores locales, vending machines o dispositivos embebidos, manteniendo los datos dentro de la infraestructura del usuario. Esto lo convierte en una opción atractiva para proyectos que priorizan la privacidad, la auditoría y la independencia tecnológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) con cuantización NVFP4 |
| Parametros totales | 19.869.895.952 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (Unsloth Dynamic V3.0), FP8 en `lm_head` |
| Idiomas soportados | Español, inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (incluye `model.safetensors` y `model_mtp.safetensors`) |

## Arquitectura y entrenamiento

yaya3.8 no es un modelo entrenado desde cero, sino una cuantización del modelo Qwen3.8-27B de Alibaba Cloud. La cuantización NVFP4 (4 bits en punto flotante) fue realizada por Unsloth con su técnica Dynamic V3.0, que ajusta dinámicamente los rangos de cuantización por capa. El `lm_head` se mantiene en FP8 para preservar la precisión en la salida. Los pesos no han sido modificados respecto a la versión cuantizada upstream (`unsloth/Qwen3.8-27B-NVFP4`), lo que garantiza trazabilidad y reproducibilidad.

El modelo incluye una cabeza MTP (`model_mtp.safetensors`) que permite decodificación especulativa, acelerando la inferencia al predecir múltiples tokens en paralelo. Esta cabeza es opcional y solo se utiliza en entornos que la soporten, como vLLM. No se ha realizado ningún fine-tuning adicional sobre la cuantización; el modelo hereda las capacidades y limitaciones del Qwen3.8-27B original.

## Capacidades

- Generación de texto en español e inglés, con razonamiento y comprensión contextual heredados del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, según las capacidades del modelo base (no confirmado explícitamente en la documentación, pero implícito en la arquitectura Qwen).
- Decodificación especulativa mediante la cabeza MTP, que reduce la latencia en entornos compatibles (vLLM).
- Ejecución en infraestructura local, sin dependencia de APIs externas, lo que garantiza privacidad y control de datos.
- Compatibilidad con vLLM como servidor de inferencia; no compatible con SGLang debido al `lm_head` en FP8.
- Multilingüismo limitado a español e inglés según la model card; otros idiomas no están garantizados.

## Casos de uso

- Atención al cliente automatizada en empresas latinoamericanas: el modelo puede gestionar conversaciones multi-turno en español, desplegado en servidores locales para cumplir normativas de protección de datos regionales.
- Procesamiento de documentos confidenciales (legales, médicos, financieros) sin enviar información a la nube, gracias a su ejecución en hardware propio.
- Asistentes virtuales para comunidades indígenas o rurales con conectividad limitada, donde la inferencia local evita la dependencia de infraestructura externa.
- Generación de código en entornos de desarrollo con requisitos de soberanía tecnológica, como organismos gubernamentales o empresas con políticas de datos estrictas.
- Investigación académica en procesamiento de lenguaje natural para español, al ser un modelo abierto y cuantizado que cabe en GPUs de gama media.
- Sistemas de respuesta a preguntas sobre documentación interna de una organización, con la posibilidad de fine-tuning sobre datos propios sin necesidad de infraestructura cloud.
- Despliegue en dispositivos periféricos (edge) como kioscos o cajeros automáticos, donde la inferencia local reduce la latencia y evita cortes de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparativas con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización NVFP4, el modelo ocupa aproximadamente 23 GB en disco. Para inferencia, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB) para cargar los pesos y dejar margen para el contexto y los estados intermedios.
- GPU recomendadas: NVIDIA con soporte para FP8 (Ampere o posterior), ya que el `lm_head` está en FP8. GPUs como A100, H100, RTX 4090 son adecuadas.
- En GPUs de consumo (24 GB) es viable, pero con limitaciones de longitud de contexto y batch size. Para producción con alto throughput se recomienda una A100 o H100.
- Opciones de despliegue: vLLM es el servidor recomendado según la model card. No se menciona compatibilidad con llama.cpp u Ollama, aunque al ser safetensors se podría convertir a GGUF, pero no está documentado.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP puede reducir la latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Como referencia cualitativa, se puede comparar con el modelo base Qwen3.8-27B y con otras cuantizaciones del mismo modelo (FP8, INT4). Sin embargo, no hay datos de rendimiento publicados. La siguiente tabla resume diferencias básicas:

| Modelo | Parámetros | Cuantización | Contexto | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27B | FP16/BF16 | No disponible | Apache-2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | NVFP4 | No disponible | Apache-2.0 |
| agentyaya/yaya3.8 | 19.87B (safetensors) | NVFP4 + FP8 lm_head | No disponible | Apache-2.0 |

Nota: la discrepancia en parámetros entre el modelo base (27B) y el archivo safetensors (19.87B) no está explicada en la documentación. Podría deberse a una eliminación de capas o a un conteo diferente de tensores, pero no hay información al respecto.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir pérdida de precisión en tareas que requieren razonamiento complejo o matemáticas avanzadas, en comparación con el modelo en BF16.
- El modelo solo garantiza español e inglés; otros idiomas pueden tener un rendimiento degradado o no estar soportados.
- Depende de vLLM para su ejecución; no es compatible con SGLang, lo que limita las opciones de despliegue.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad. El modelo hereda los sesgos del Qwen3.8-27B, que no están documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo base y a Unsloth según sus términos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado en producción. No hay garantía de soporte ni mantenimiento.
- El tamaño del archivo safetensors (19.87B parámetros) no coincide con la declaración de 27B de la model card; esto podría indicar una versión recortada o un error en el etiquetado. Se recomienda verificar la integridad del modelo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentyaya/yaya3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Sitio web de Yaya Tech: https://yaya.tech
- Perfil de agentyaya en Hugging Face: https://huggingface.co/agentyaya/models
