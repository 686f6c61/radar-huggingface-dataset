# CMSManhattan/JiRackDeltaNet_27b

## Resumen

JiRack DeltaNet 27B es un modelo de generación de texto de 27.320.697.856 parámetros (27,3 mil millones) desarrollado por CMSManhattan, diseñado específicamente para inferencia eficiente en CPU. Se construye sobre una arquitectura híbrida de atención y SSM (State Space Model) al estilo Qwen3.8, denominada DeltaNet, e incorpora un tokenizador propio (JiRackDeltaNetTokenizer) con etiquetas especiales para enrutamiento, medios, visión, sonido, tool calling y robótica. El modelo se distribuye con cuantizaciones GGUF listas para usar y soporte nativo en Ollama, con el razonamiento desactivado por defecto para respuestas rápidas y directas.

La propuesta central del modelo es reducir el coste de infraestructura mediante pesos ternarios (1,58 bits) y cuantización consciente del entrenamiento (QAT), lo que permite ejecutar un modelo de 27B en equipos de consumo con cantidades de RAM moderadas. El autor declara asociaciones con NVIDIA y FISERV, y ofrece servicios de compresión personalizada y QAT sobre datos del cliente.

El modelo está publicado bajo licencia MIT, soporta trece idiomas (incluido el español) y acumula 3.863 descargas en Hugging Face. Su enfoque en tool calling de alta calidad sobre modelos pequeños y su integración con entornos de desarrollo (plugins para Eclipse, JetBrains y VS Code) lo orientan a despliegues agénticos y de automatización en estaciones de trabajo locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeltaNet híbrida (atención + SSM), estilo Qwen3.8 |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Full, Q8/int8, Q6, Q4_K_M, Q3_K_M, Q2_K, TQ_2 (ternaria, 1,58 bits) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es una DeltaNet híbrida que combina mecanismos de atención con capas de modelo de espacio de estados (SSM), siguiendo el estilo de la familia Qwen3.8. Esta combinación busca reducir el coste computacional y de memoria frente a un transformer denso equivalente, lo que resulta coherente con el objetivo declarado de inferencia eficiente en CPU. El modelo incorpora un tokenizador propio, JiRackDeltaNetTokenizer, que añade etiquetas específicas para enrutamiento, medios, visión, sonido, tool calling y robótica, y que el autor presenta como clave para mejorar la calidad del tool calling en modelos pequeños.

En cuanto al entrenamiento, la model card menciona que las cuantizaciones actuales se generaron a partir del modelo FP16 y que existe un proceso de QAT (quantization-aware training) para pesos ternarios TQ_2, además de una variante de doble QAT vía ONNX QAT. El autor ofrece adaptar el proceso de entrenamiento para evitar olvido catastrófico y mesetas tempranas de entrenamiento, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura híbrida.

## Capacidades

- Generación de texto conversacional en trece idiomas, con razonamiento desactivado por defecto en las variantes Ollama para respuestas directas.
- Tool calling y function calling de alta calidad, reforzado mediante etiquetas específicas del tokenizador JiRack y compatible con librerías como Spring AI Alibaba (Java) y Gorilla (Python).
- Capacidades agénticas y de razonamiento multi-paso, orientadas a flujos de trabajo con herramientas externas.
- Comprensión de imágenes y vídeo según la model card, con especial orientación a robótica.
- Etiquetas de enrutamiento (routing) integradas en el tokenizador para dirigir peticiones a expertos o servicios.
- Capacidades de codificación, con integración en IDE mediante plugins oficiales para Eclipse, JetBrains y VS Code.
- Soporte de despliegue en CPU vía llama.cpp, Ollama y Docker, con imágenes preconfiguradas por nivel de cuantización.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y despliegue alternativo mediante servidor Java ONNX JiRack para RAG.

## Casos de uso

- Asistente de codificación en local: integrado en los plugins de Eclipse, JetBrains y VS Code del autor, el modelo permite generar y revisar cambios de código en un PC doméstico vía Ollama, con confirmación manual de cambios antes de aplicarlos, lo que encaja con la cuantización Q4_K_M (aproximadamente 16,8 GB) y su bajo requisito de RAM.
- Tool calling en aplicaciones empresariales Java: mediante Spring AI Alibaba, el modelo puede invocar funciones de negocio con las etiquetas de tool calling del tokenizador JiRack, aprovechando su orientación a modelos pequeños con alta precisión en llamadas a herramientas.
- Despliegue RAG de bajo coste: el modelo puede actuar como experto en pipelines de recuperación aumentada sobre el servidor Java ONNX JiRack, reduciendo el gasto en infraestructura cloud frente a alternativas de mayor tamaño.
- Automatización robótica con percepción visual: las capacidades declaradas de comprensión de imágenes y vídeo, junto con las etiquetas de robótica del tokenizador, permiten usarlo en tareas de enrutamiento y control donde se combinan instrucciones en lenguaje natural con señales visuales.
- Atención al cliente multilingüe: con soporte para trece idiomas, incluidos español, inglés, chino, japonés, coreano, francés, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés, el modelo puede gestionar conversaciones multi-turno en entornos con requisitos de soberanía de datos y ejecución local.
- Enrutamiento de consultas en sistemas multi-experto: las etiquetas de routing del tokenizador permiten clasificar y dirigir peticiones hacia servicios especializados, útil en arquitecturas de agentes donde un modelo pequeño decide qué herramienta o experto invocar.
- Inferencia en estaciones de trabajo sin GPU: con la cuantización TQ_2 (aproximadamente 7,2 GB y 8-13 GB de RAM), el modelo puede ejecutarse en equipos de oficina convencionales, lo que habilita prototipado y pruebas sin hardware acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (datos del autor para RAM):
  - Full: aproximadamente 55 GB de pesos, 56-64 GB de RAM.
  - Q8/int8: no disponible el tamaño exacto; imagen Docker disponible.
  - Q6: no disponible el tamaño exacto; imagen Docker disponible.
  - Q4_K_M: aproximadamente 16,8 GB de pesos, 18-24 GB de RAM.
  - Q3_K_M: aproximadamente 13,9 GB de pesos, 15-20 GB de RAM.
  - Q2_K: aproximadamente 11,2 GB de pesos, 12-17 GB de RAM.
  - TQ_2 (ternaria): aproximadamente 7,2 GB de pesos, 8-13 GB de RAM.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU. No se documentan requisitos de VRAM para GPU.
- ¿Cabe en GPU de consumo? No se proporcionan datos específicos. Las cuantizaciones Q4 y TQ_2 caben en GPUs de consumo con 12-24 GB de VRAM por tamaño de pesos, pero no se confirma compatibilidad ni rendimiento en GPU en la información disponible.
- Opciones de despliegue: Ollama (recomendado, con razonamiento desactivado por defecto), Docker (imágenes por cuantización con UI en el puerto 7869), llama.cpp (GGUF), servidor Java ONNX JiRack, y endpoints compatibles.
- Latencia y throughput: no disponible. El autor configura 16 hilos de CPU (`--cpus=16`, `THREADS=16`, `THREADS_BATCH=16`) en los ejemplos Docker, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización extrema | Licencia | Enfoque |
|---|---|---|---|---|---|
| JiRack DeltaNet 27B | 27,3 B | no disponible | TQ_2 ternaria (~7,2 GB) | MIT | CPU, tool calling, robótica |
| Qwen3.8 (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | Transformer denso |
| BitNet b1.58 (referencia ternaria) | no disponible | no disponible | 1,58 bits | no disponible | Pesos ternarios |
| JiRack 16B / 8B / 2B (misma familia) | 16 B / 8 B / 2 B | no disponible | no disponible | MIT | Variantes de menor tamaño |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y enfoque de despliegue.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan verificar la calidad real del modelo frente a alternativas de tamaño similar.
- La model card no especifica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- No se documentan los datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, lo que limita la evaluación de sesgos y del riesgo de alucinación.
- Las capacidades de visión, vídeo y robótica se declaran en la model card sin métricas de evaluación que las respalden.
- El modelo está optimizado para CPU; el rendimiento en GPU no está documentado y podría no aprovechar aceleradores de forma eficiente.
- Aunque la licencia es MIT, el autor ofrece servicios comerciales de QAT y compresión personalizada, por lo que conviene revisar los términos de las variantes descargadas desde Ollama o Docker, que pueden tener condiciones propias.
- El tamaño del repositorio (257,3 GB) implica requisitos de almacenamiento considerables para descargar los pesos completos.
- El modelo tiene pocas interacciones en Hugging Face (3 likes), lo que sugiere una validación comunitaria limitada.
- El razonamiento está desactivado por defecto en las variantes Ollama; para tareas que requieran cadenas de pensamiento explícitas habrá que activarlo manualmente (`--think=false` lo desactiva, por lo que su ausencia lo activa).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackDeltaNetTokenizer
- Demo chat 27B: https://huggingface.co/spaces/CMSManhattan/JiRackDeltaNet_27b
- Demo chat 16B: https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Demo chat 8B: https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Demo chat 2B: https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Ollama: https://ollama.com/cmsmanhattan
- Sitio web: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Spring AI Alibaba: https://github.com/alibaba/spring-ai-alibaba
- Gorilla (tool calling): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset Glaive function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
