# Atomic-Germ/Phi4-mini-Instruct-NPU2

## Resumen

Phi-4-mini-Instruct-NPU2 es una variante del modelo Phi-4-mini-instruct de Microsoft, publicada por el usuario Atomic-Germ en HuggingFace. Se trata de un modelo de lenguaje ligero de 3.800 millones de parámetros, diseñado para entornos con restricciones de memoria y cómputo, así como para escenarios con latencia limitada. El modelo pertenece a la familia Phi-4 y destaca por su fuerte capacidad de razonamiento, especialmente en matemáticas y lógica, además de soportar una ventana de contexto de 128.000 tokens.

La variante NPU2 parece orientada a aceleración en unidades de procesamiento neuronal (NPU), aunque no se especifican detalles técnicos adicionales en la información disponible. El modelo base fue entrenado con datos sintéticos y sitios web públicos filtrados, con un enfoque en datos densos en razonamiento, y posteriormente refinado mediante supervisión (SFT) y optimización directa de preferencias (DPO). Su licencia MIT permite uso comercial y de investigación sin restricciones significativas.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido, capacidades multilingües (más de 20 idiomas) y rendimiento competitivo frente a modelos de tamaño similar, lo que lo convierte en una opción atractiva para despliegue en dispositivos edge, aplicaciones en tiempo real y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con atención de ventana deslizante y atención global intercalada |
| Parametros totales | 3.800 millones (3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio no especifica cuantizaciones publicadas) |
| Idiomas soportados | Multilingüe: árabe, chino, checo, danés, neerlandés, inglés, finés, francés, alemán, hebreo, húngaro, italiano, japonés, coreano, noruego, polaco, portugués, ruso, español, sueco, tailandés, turco, ucraniano |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 3.6 GB) |

## Arquitectura y entrenamiento

El modelo base Phi-4-mini-instruct emplea una arquitectura transformer decoder-only con una combinación de atención de ventana deslizante y atención global, similar a la empleada en la serie Phi-3. Esta configuración permite manejar secuencias largas de hasta 128.000 tokens con un coste computacional reducido en comparación con la atención completa. El vocabulario se amplió respecto a la serie Phi-3 para mejorar el soporte multilingüe.

El entrenamiento se realizó sobre una combinación de datos sintéticos generados por modelos más grandes y sitios web públicos filtrados, priorizando contenido denso en razonamiento. El proceso de post-entrenamiento incluyó supervisión fina (SFT) y optimización directa de preferencias (DPO) para mejorar la adherencia a instrucciones, la seguridad y las capacidades de function calling. No se dispone de información específica sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset en la documentación accesible.

La variante NPU2 no aporta información adicional sobre modificaciones arquitectónicas o de entrenamiento respecto al modelo base.

## Capacidades

- Generación de texto y conversación multilingüe en más de 20 idiomas, con especial atención a inglés, español, francés, alemán, chino y japonés.
- Razonamiento matemático y lógico avanzado para su tamaño, con resultados destacados en benchmarks como BigBench Hard (70.4) y MMLU-Pro (52.8).
- Seguimiento preciso de instrucciones gracias al refinamiento con SFT y DPO.
- Soporte de function calling / tool calling, lo que permite integrar el modelo en pipelines de agentes y automatización.
- Capacidad de manejar contextos largos de hasta 128.000 tokens, adecuado para análisis de documentos extensos o conversaciones multi-turno prolongadas.
- Adecuado para entornos con restricciones de memoria y cómputo, así como para aplicaciones sensibles a la latencia.
- No se especifican capacidades multimodales (visión, audio) en esta variante; el modelo es exclusivamente de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128.000 tokens, manteniendo el historial completo de la interacción y respondiendo en múltiples idiomas según el cliente.
- Generación de código en producción: con soporte de function calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación técnica o revisar fragmentos en repositorios, con latencia reducida gracias a su tamaño compacto.
- Asistentes de razonamiento matemático: su fuerte rendimiento en matemáticas y lógica lo hace útil para plataformas educativas, resolución de problemas paso a paso o verificación de cálculos en aplicaciones financieras.
- Análisis de documentos legales o técnicos: la ventana de contexto de 128K permite procesar contratos, informes o artículos científicos completos, extrayendo resúmenes o respondiendo preguntas específicas sobre el contenido.
- Chatbots multilingües para soporte técnico: su soporte de más de 20 idiomas permite desplegar un único modelo para atender usuarios en diferentes regiones sin necesidad de modelos separados por idioma.
- Sistemas de agentes autónomos: gracias al function calling y al razonamiento multi-paso, puede actuar como núcleo de agentes que consultan APIs, ejecutan acciones y toman decisiones en entornos con recursos limitados, como dispositivos IoT o servidores edge.

## Benchmarks y rendimiento

La model card del autor reproduce los benchmarks del modelo base Phi-4-mini-instruct de Microsoft. Se presentan los resultados comparativos con modelos de tamaño similar y de doble tamaño:

| Benchmark | Phi-4 mini-Ins | Phi-3.5-mini-Ins | Llama-3.2-3B-Ins | Mistral-3B | Qwen2.5-3B-Ins | Qwen2.5-7B-Ins | Llama-3.1-8B-Ins | Gemma2-9B-Ins | GPT-4o-mini |
|---|---|---|---|---|---|---|---|---|---|
| Arena Hard | 32.8 | 34.4 | 17.0 | 26.9 | 32.0 | 55.5 | 25.7 | 43.7 | 53.7 |
| BigBench Hard (0-shot, CoT) | 70.4 | 63.1 | 55.4 | 51.2 | 56.2 | 72.4 | 63.4 | 65.7 | 80.4 |
| MMLU (5-shot) | 67.3 | 65.5 | 61.8 | 60.8 | 65.0 | 72.6 | 68.1 | 71.3 | 77.2 |
| MMLU-Pro (0-shot, CoT) | 52.8 | 47.4 | 39.2 | 35.3 | 44.7 | 56.2 | 44.0 | 50.1 | 62.8 |

No se dispone de benchmarks específicos para la variante NPU2 más allá de los del modelo base. Los resultados indican que Phi-4-mini-instruct supera a modelos de su mismo rango en razonamiento (BigBench Hard, MMLU-Pro) y se acerca a modelos de 7B-9B en varias métricas, aunque queda por detrás de GPT-4o-mini.

## Requisitos de hardware

- VRAM estimada: con 3.8B parámetros en precisión FP16, el modelo requiere aproximadamente 7.6 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si se publicara), podría reducirse a unos 2-3 GB, pero no se han publicado cuantizaciones oficiales en el repositorio.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070/4060, o GPUs profesionales como A10, L4 o T4. Para inferencia de alta velocidad, A100 o H100 son adecuadas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más, como RTX 3060, RTX 4060 Ti o RTX 4070. Con cuantización a 4 bits podría ejecutarse en GPUs de 4 GB, aunque no hay archivos GGUF publicados en este repositorio.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TensorRT-LLM, HuggingFace TGI o llama.cpp (si se generan pesos GGUF). También es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se han publicado mediciones específicas para esta variante. Como referencia, un modelo de 3.8B en una GPU moderna (RTX 4090) puede generar entre 50 y 100 tokens por segundo con cuantización, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU (5-shot) | BigBench Hard | Arena Hard |
|---|---|---|---|---|---|---|
| Phi-4-mini-instruct (base) | 3.8B | 128K | MIT | 67.3 | 70.4 | 32.8 |
| Phi-3.5-mini-instruct | 3.8B | 128K | MIT | 65.5 | 63.1 | 34.4 |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 Community | 61.8 | 55.4 | 17.0 |
| Qwen2.5-3B-Instruct | 3.1B | 32K | Apache 2.0 | 65.0 | 56.2 | 32.0 |
| Mistral-3B | 3.0B | 32K | Apache 2.0 | 60.8 | 51.2 | 26.9 |

La variante NPU2 no presenta diferencias conocidas respecto al modelo base en cuanto a especificaciones. Phi-4-mini-instruct destaca por su contexto de 128K (superior a Qwen2.5-3B y Mistral-3B) y por su rendimiento en razonamiento, aunque en Arena Hard es superado por Phi-3.5-mini y Qwen2.5-3B.

## Limitaciones y advertencias

- No se dispone de información específica sobre la variante NPU2: el repositorio no documenta cambios respecto al modelo base, por lo que no se puede confirmar si hay optimizaciones reales para NPU o si es un reempaquetado.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas de actualidad o dominios poco representados en sus datos de entrenamiento. No se han publicado evaluaciones específicas de sesgos para esta variante.
- Rendimiento multilingüe desigual: aunque soporta más de 20 idiomas, el rendimiento puede variar significativamente entre idiomas; los idiomas con menos datos de entrenamiento probablemente tendrán peores resultados.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, el rendimiento en secuencias muy largas puede degradarse y el coste computacional aumenta linealmente con la longitud.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base tiene una política de uso aceptable de Microsoft que puede aplicar; se recomienda revisar los términos originales.
- No evaluado para todos los casos de uso: el modelo no está diseñado ni evaluado para aplicaciones de alto riesgo (salud, legal, financiero) sin una validación adicional por parte del desarrollador.
- Sin cuantizaciones publicadas: el repositorio no incluye versiones GGUF o AWQ, lo que puede limitar su despliegue en entornos con recursos muy restringidos.

## Enlaces

- Repositorio HuggingFace de la variante: https://huggingface.co/Atomic-Germ/Phi4-mini-Instruct-NPU2
- Modelo base en HuggingFace: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Paper técnico del modelo: https://huggingface.co/papers/2503.01743
- Blog de Microsoft sobre Phi-4-mini: https://aka.ms/phi4-feb2025
- Technical report de Phi-4-mini: https://aka.ms/phi-4-multimodal/techreport
- Phi Cookbook (ejemplos y guías): https://github.com/microsoft/PhiCookBook
- Portal de Phi en Azure: https://azure.microsoft.com/en-us/products/phi
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/microsoft/phi-4-mini
- Página de referencia en NVIDIA NIM: https://build.nvidia.com/microsoft/phi-4-mini-instruct
