# Atomic-Germ/GPT-OSS-20B-NPU2

## Resumen

GPT-OSS-20B-NPU2 es una adaptación del modelo open-weight gpt-oss-20b de OpenAI, publicada por el usuario Atomic-Germ en Hugging Face. El modelo original, desarrollado por OpenAI, es un transformer de arquitectura Mixture of Experts (MoE) con 21 000 millones de parámetros totales y 3 600 millones de parámetros activos, diseñado para tareas de razonamiento, uso agéntico y despliegue local con baja latencia. Esta versión concreta incorpora cuantización MXFP4 (etiquetada en los metadatos) y una optimización indicada por el sufijo "NPU2", que sugiere una adaptación para unidades de procesamiento neuronal (NPU), aunque no se detallan las modificaciones específicas respecto al modelo base.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, y está pensado para ejecutarse en entornos con memoria limitada: según la documentación de OpenAI, gpt-oss-20b con cuantización MXFP4 cabe en 16 GB de RAM. La relevancia actual radica en que ofrece capacidades de razonamiento avanzado y herramientas agénticas en un formato compacto, apto para hardware de consumo y para integración en pipelines de desarrollo. El repositorio pesa 12,0 GB y está preparado para la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mezcla de Expertos (MoE) |
| Parametros totales | 21 000 millones (21B) |
| Parametros activos | 3 600 millones (3.6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por uso de transformers) |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b emplea una arquitectura de transformer con capas de mezcla de expertos, donde solo se activan 3,6B de los 21B parámetros en cada paso de inferencia. Esto permite un equilibrio entre capacidad y eficiencia computacional. Según la documentación de OpenAI, el modelo fue entrenado con el formato de respuesta "harmony" (un protocolo de chat estructurado) y posteriormente sometido a cuantización MXFP4 de los pesos de las capas MoE, lo que reduce el uso de memoria sin degradar significativamente el rendimiento. No se dispone de información adicional sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. La versión NPU2 de Atomic-Germ no aporta detalles técnicos sobre posibles cambios en la arquitectura o el entrenamiento; se asume que replica las características del modelo original con la cuantización indicada.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento completa (chain-of-thought), accesible para depuración y verificación.
- Configuración del esfuerzo de razonamiento en tres niveles (bajo, medio, alto) para ajustar latencia y calidad según el caso de uso.
- Soporte nativo de function calling, ejecución de código Python, navegación web y salidas estructuradas (Structured Outputs), lo que lo habilita para tareas agénticas.
- Capacidades multilingües no especificadas en la documentación disponible, aunque el modelo base de OpenAI suele cubrir múltiples idiomas.
- Compatible con el formato de chat harmony, que debe aplicarse obligatoriamente para un funcionamiento correcto.
- Integración con herramientas de inferencia como transformers, vLLM, Ollama y LM Studio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto prolongado (la longitud exacta no se ha publicado) y mantener coherencia en diálogos complejos, gracias a su capacidad de razonamiento y al formato harmony.
- Generación de código en producción: con soporte de function calling y ejecución de Python, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, reduciendo la intervención manual.
- Agentes autónomos de navegación web: al combinar búsqueda en línea y razonamiento, puede realizar tareas como recopilación de información, comparación de precios o seguimiento de noticias, emitiendo acciones estructuradas.
- Asistente de análisis de datos: mediante la ejecución de código Python, puede procesar datasets, generar visualizaciones y explicar resultados, útil para equipos de datos sin conocimientos profundos de programación.
- Despliegue local en hardware de consumo: con 16 GB de memoria requeridos, cabe en portátiles y estaciones de trabajo con GPU de gama media, permitiendo inferencia privada sin conexión a la nube.
- Prototipado rápido de aplicaciones conversacionales: al ser compatible con el ecosistema transformers y vLLM, se puede montar un servidor compatible con la API de OpenAI en minutos para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de OpenAI menciona que las evaluaciones se realizaron con la misma cuantización MXFP4, pero no se incluyen cifras concretas en los materiales proporcionados. Se recomienda consultar el paper técnico (arXiv:2508.10925) para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada: 16 GB para la versión cuantizada MXFP4, según la documentación de OpenAI para gpt-oss-20b.
- GPU recomendadas: NVIDIA H100, A100, RTX 4090 o AMD MI300X; también puede ejecutarse en GPUs de consumo con al menos 16 GB de memoria.
- Compatible con consumer GPUs: sí, siempre que dispongan de 16 GB o más de VRAM.
- Opciones de despliegue: transformers (pipeline y serve), vLLM (con versión específica para gpt-oss), Ollama, LM Studio y PyTorch/Triton mediante las implementaciones de referencia de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del nivel de esfuerzo de razonamiento configurado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| GPT-OSS-20B-NPU2 (Atomic-Germ) | 21B | 3.6B | no disponible | Apache 2.0 | MXFP4 |
| gpt-oss-120b (OpenAI) | 117B | 5.1B | no disponible | Apache 2.0 | MXFP4 |
| Qwen3-35B-A3B (Alibaba) | 35B | 3B | no disponible | Apache 2.0 | no disponible |
| Llama 3.1 8B (Meta) | 8B | 8B | 128K | Llama 3.1 | no disponible |

La comparativa se basa en datos públicos de los modelos base; no se dispone de información específica sobre la variante NPU2 más allá de su origen. GPT-OSS-20B-NPU2 se posiciona como una opción intermedia entre modelos densos pequeños y MoE grandes, con la ventaja de su licencia permisiva y su bajo consumo de memoria.

## Limitaciones y advertencias

- El modelo requiere el formato de respuesta harmony para funcionar correctamente; usarlo sin este formato puede producir salidas incoherentes.
- No se han publicado detalles sobre sesgos o alucinaciones específicos de esta versión; se heredan los riesgos del modelo base de OpenAI.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que necesiten ventanas largas.
- Los idiomas soportados no se especifican; la cobertura multilingüe puede ser desigual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las herramientas asociadas.
- Existen informes de problemas de estabilidad con gpt-oss-20b en ciertas NPU (por ejemplo, en Ryzen AI 9 HX 470), según un issue en el repositorio ROCm/FastFlowLM; la variante NPU2 podría estar orientada a mitigar estos fallos, pero no hay confirmación oficial.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atomic-Germ/GPT-OSS-20B-NPU2
- Repositorio oficial de OpenAI gpt-oss: https://github.com/openai/gpt-oss
- Paper técnico: https://arxiv.org/abs/2508.10925
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Documentación de la API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
