# mistralai/Ministral-3-3B-Instruct-2512-GGUF

## Resumen

Ministral 3 3B Instruct 2512 GGUF es la versión cuantizada en formato GGUF del modelo instruct post-entrenado Ministral 3 3B, desarrollado por Mistral AI. Se trata del modelo más pequeño de la familia Ministral 3 y está diseñado para despliegue en el borde (edge), con capacidad de ejecutarse localmente. La model card indica que consta de un modelo de lenguaje de 3,4B y un encoder de visión de 0,4B, con una ventana de contexto de 256k tokens.

El modelo resuelve tareas de chat e instrucciones con soporte de visión, function calling nativo, salida JSON y multilingüismo en once idiomas. Su licencia Apache 2.0 permite uso comercial y modificación. Es relevante ahora por su optimización para hardware limitado: según Mistral AI, cabe en 8 GB de VRAM en FP8 y menos con cuantizaciones adicionales, lo que facilita su despliegue en GPUs de consumo y dispositivos edge.

El repositorio acumula 38.038 descargas y 99 likes en HuggingFace, con actualización en enero de 2026. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; la model card indica dos componentes: un modelo de lenguaje de 3,4B y un encoder de visión de 0,4B |
| Parámetros totales | 3.429.006.336 (dato real de safetensors del modelo base); la model card desglosa 3,4B en el modelo de lenguaje y 0,4B en el encoder de visión |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens (256k) |
| Tipos de cuantización | GGUF con diferentes niveles de cuantización; los niveles concretos no están disponibles en la información proporcionada |
| Idiomas soportados | Inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; el modelo base en safetensors |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512 |
| Tamaño del repositorio | 16,0 GB |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (transformer, MoE, híbrida, SSM, etc.) ni los datos de entrenamiento. Indica que el modelo se compone de un modelo de lenguaje de 3,4B y un encoder de visión de 0,4B, y que se distribuye como versión instruct post-entrenada cuantizada en GGUF. No se especifican tokens de entrenamiento, composición del dataset ni si se emplearon RLHF o DPO.

Como innovaciones destacables, la model card menciona una ventana de contexto de 256k tokens, capacidades de visión, function calling nativo con salida JSON y optimización para edge. Mistral AI recomienda temperatura inferior a 0,1 para producción, definir bien el system prompt, limitar el número de herramientas y usar imágenes con una relación de aspecto cercana a 1:1.

## Capacidades

- Generación de texto y conversación instruct.
- Visión: analiza imágenes y proporciona respuestas basadas en su contenido visual.
- Multilingüe: soporte para inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- System prompt: mantiene una alta adherencia a las instrucciones del sistema.
- Agentic: function calling nativo y salida en JSON.
- Contexto largo: ventana de 256k tokens.
- Edge-optimized: diseñado para ejecutarse en hardware limitado.
- No se mencionan explícitamente capacidades de audio, matemáticas avanzadas o razonamiento simbólico más allá de lo indicado.

## Casos de uso

- Asistente local en dispositivos edge: el modelo cabe en 8 GB de VRAM en FP8, por lo que puede ejecutarse en portátiles, mini-PCs o GPUs de consumo sin conexión a internet.
- Análisis de imágenes en local: gracias a su encoder de visión de 0,4B, puede describir, clasificar o extraer información de imágenes en entornos con requisitos de privacidad.
- Atención al cliente multilingüe: soporta once idiomas y una ventana de 256k tokens, lo que permite gestionar conversaciones multi-turno con historial extenso y usuarios de distintos países.
- Agentes con herramientas: su function calling nativo y su salida JSON facilitan la integración en flujos agénticos que consultan APIs, bases de datos o servicios externos.
- Extracción de información de documentos largos: la ventana de 256k tokens permite procesar contratos, informes o expedientes extensos sin truncar el contexto.
- Automatización de flujos con system prompt: su adherencia a instrucciones de sistema lo hace adecuado para asistentes virtuales con reglas de negocio estrictas.
- Accesibilidad visual: puede describir imágenes a personas con discapacidad visual en aplicaciones móviles o de escritorio.
- Chatbot de bajo coste en producción: con temperatura inferior a 0,1 y un conjunto reducido de herramientas, puede desplegarse en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: según la model card, cabe en 8 GB de VRAM en FP8; con cuantizaciones adicionales el requisito es menor.
- GPU recomendadas: no se especifican modelos concretos. Por el requisito de 8 GB en FP8, es apto para GPUs de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, según la model card, en FP8 cabe en 8 GB.
- Opciones de despliegue: vLLM (indicado en el campo `library_name`). Al estar en formato GGUF, también es compatible con runners habituales de GGUF como llama.cpp, Ollama o LM Studio, aunque esto no se confirma explícitamente en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni especificaciones verificadas de modelos comparables. Como alternativas de categoría similar en el ecosistema abierto podrían considerarse Qwen2.5-VL-3B, Llama 3.2 3B o Gemma 3 4B, pero no se dispone de datos contrastados en esta búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se proporcionan tasas ni evaluaciones específicas.
- Limitaciones de contexto o idioma: se soportan 256k tokens y once idiomas, pero no se detalla la calidad relativa por idioma ni el rendimiento en contextos muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el aviso legal indica que no debe usarse de forma que infrinja derechos de terceros, incluidos derechos de propiedad intelectual.
- Caveats para producción: Mistral AI recomienda temperatura inferior a 0,1, limitar el número de herramientas, definir bien el system prompt y usar imágenes con relación de aspecto cercana a 1:1.
- Las cuantizaciones GGUF pueden degradar la calidad respecto al modelo base en safetensors.
- No se especifican resoluciones de imagen soportadas ni límites del encoder de visión.

## Enlaces

- [HuggingFace: mistralai/Ministral-3-3B-Instruct-2512-GGUF](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF)
- [Modelo base: mistralai/Ministral-3-3B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512)
- [Paper: arXiv 2601.08584](https://arxiv.org/abs/2601.08584)
- [Blog de Mistral AI sobre Mistral 3](https://mistral.ai/news/mistral-3)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
- [Mistral AI](https://mistral.ai/fr/)
- [Mistral Vibe (anteriormente Le Chat)](https://mistral.ai/fr/products/vibe/)
- [Wikipedia: Mistral AI](https://fr.wikipedia.org/wiki/Mistral_AI)
- [Login de chat.mistral.ai](https://chat.mistral.ai/login)
- [Consola de Mistral AI](https://console.mistral.ai/home)
- [Política de privacidad de Mistral AI](https://mistral.ai/terms/)
