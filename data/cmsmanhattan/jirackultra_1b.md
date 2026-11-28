# CMSManhattan/JiRackUltra_1b

## Resumen

JiRack Ultra 1B es un modelo de generación de texto de aproximadamente 1.500 millones de parámetros (1.777.088.000 según los pesos en safetensors) desarrollado por CMSManhattan. Está construido sobre una base de la familia Qwen2/DeepSeek, según indican los tags y la model card, y ha sido rediseñado con soporte nativo para aritmética ternaria al estilo BitNet (1.58 bits), lo que lo orienta a inferencia eficiente en CPU. Se distribuye bajo licencia MIT y con cuantizaciones GGUF listas para usar en llama.cpp y Ollama.

El modelo se presenta como una pieza especializada en enrutamiento (routing), llamadas a herramientas (tool calling) y robótica, con un tokenizador propio (JiRackPrecisionTokenizer) que añade etiquetas específicas para estas tareas. La propuesta de valor es ofrecer inferencia de bajo coste en infraestructura CPU, con variantes que van desde los 3,56 GB del modelo ternario de referencia hasta los 0,24 GB de la cuantización Q2_K, lo que permite desplegarlo en entornos con memoria muy limitada.

Es relevante ahora porque combina dos tendencias: modelos pequeños con capacidades de agente y tool calling, y técnicas de cuantización extrema (ternaria, QAT) que reducen el coste de despliegue. La model card menciona soporte multilingüe en trece idiomas y compatibilidad con endpoints, además de integraciones con Ollama, Docker y exportación a ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2 segun tags), con soporte ternario estilo BitNet (1.58 bits) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (TQ2_0), Q4_K_M, Q3_K_M, Q2_K; GGUF; exportacion a ONNX |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

La información disponible describe un transformer de aproximadamente 1.500 millones de parámetros derivado de un modelo DeepSeek, refactorizado por CMSManhattan con características BitNet y un tokenizador actualizado. La arquitectura incorpora soporte nativo para pesos ternarios (valores en {-1, 0, 1}, es decir, 1.58 bits por peso), lo que habilita inferencia de alta eficiencia en CPU mediante instrucciones AVX2 y AVX-512. La model card menciona que las cuantizaciones actuales se generaron a partir del modelo en FP16, pero que la arquitectura ternaria permite mayor compresión mediante QAT (Quantization-Aware Training) adaptado a conjuntos de datos específicos.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona procesos de QAT personalizados, doble QAT vía ONNX y adaptaciones del entrenamiento para evitar olvido catastrófico y mesetas de entrenamiento, así como la conversión a TQ2_0 con soporte de instrucciones AVX2/AVX-512. También se referencia un tokenizador propio (JiRackPrecisionTokenizer) que añade etiquetas para routing, tool calling y robótica, y se sugiere su uso con datasets como ToolBench y hermes-function-calling-v1 para mejorar la calidad de las llamadas a herramientas.

## Capacidades

- Generación de texto conversacional y sin razonamiento explícito (la model card menciona una variante "chat without reasoning" en Ollama).
- Llamadas a herramientas (tool calling) y function calling, con soporte de etiquetas específicas del tokenizador JiRackPrecisionTokenizer.
- Enrutamiento (routing) de peticiones, orientado a despliegues con múltiples expertos o RAG.
- Capacidades orientadas a robótica, según los tags y la sección "JiRack RoboTech".
- Capacidades de codificación, mencionadas en la model card junto con integraciones en IDE (Cursor, Windsurf, Devin, Eclipse, JetBrains, VS Code).
- Soporte multilingüe en trece idiomas: inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés.
- Inferencia eficiente en CPU mediante cuantización ternaria y GGUF, con soporte de AVX2 y AVX-512.
- Exportación a ONNX y despliegue mediante un servidor Java ONNX alternativo.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: el modelo puede clasificar y dirigir peticiones hacia distintos expertos o fuentes de conocimiento, aprovechando sus etiquetas de routing y su bajo coste de inferencia en CPU para desplegarse como componente de orquestación.
- Llamadas a herramientas en agentes ligeros: gracias al soporte de tool calling y al tokenizador especializado, puede integrarse en pipelines de agentes que necesiten invocar APIs o funciones con un modelo pequeño y económico.
- Asistencia en robótica: la model card orienta el modelo a tareas de robótica, donde puede emplearse para interpretar comandos y generar acciones estructuradas en entornos con recursos limitados.
- Autocompletado y asistencia de código en IDE: las integraciones mencionadas (VS Code, JetBrains, Eclipse) permiten usar el modelo como agente de codificación local que propone cambios y requiere revisión antes de aplicarlos.
- Despliegue en entornos con memoria muy limitada: con la cuantización Q2_K (0,24 GB de pesos, ~1,0 GB de RAM) puede ejecutarse en dispositivos de borde o contenedores pequeños donde otros modelos no caben.
- Atención al cliente automatizada multilingüe: al soportar trece idiomas y conversación multi-turno, puede gestionar interacciones básicas en CPU sin necesidad de GPU.
- Prototipado rápido y demos: la disponibilidad de spaces en Hugging Face y de imágenes Docker con puerto 7869 facilita levantar un servicio de chat o de tool calling en minutos.
- Servicios de bajo coste en cloud: el autor lo presenta como modelo "cloud-ready" para reducir gastos de infraestructura al ejecutarse en CPU en lugar de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar orientado a CPU, no requiere GPU; en caso de usar GPU, el modelo completo en FP16 ocuparía aproximadamente 3,5 GB de VRAM, y las cuantizaciones GGUF entre 0,24 GB y 1,12 GB.
- RAM aproximada según variante publicada por el autor:
  - Ternario completo: 3,56 GB de pesos, ~4,1 GB de RAM.
  - Q4_K_M: 1,12 GB de pesos, ~1,6 GB de RAM (recomendada).
  - Q3_K_M: 0,92 GB de pesos, ~1,4 GB de RAM.
  - Q2_K: 0,24 GB de pesos, ~1,0 GB de RAM (máxima compresión).
- GPU recomendadas: no disponibles; el modelo está optimizado para CPU con instrucciones AVX2 y AVX-512. Cualquier GPU consumer con al menos 4 GB de VRAM podría alojar la versión FP16 o las cuantizaciones mayores.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales, dado su tamaño reducido.
- Opciones de despliegue: llama.cpp, Ollama (imágenes `cmsmanhattan/jirack-ultra-1b-cpu` y variantes q4, q3, q2), Docker (puerto 7869), exportación a ONNX con servidor Java, y spaces de Hugging Face.
- Latencia y throughput estimados: no disponibles; el autor indica que el uso de AVX2/AVX-512 y la cuantización ternaria mejoran el rendimiento en CPU, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion extrema | Licencia | Notas |
|---|---|---|---|---|---|
| JiRack Ultra 1B | ~1,78 B | no disponible | Ternaria (1.58 bit), Q2_K | MIT | Orientado a CPU, tool calling y routing |
| Qwen2-1.5B (base declarada de la familia) | ~1,5 B | no disponible en esta ficha | GGUF estándar | Apache 2.0 (tipica de Qwen2) | Modelo generalista; JiRack se presenta como refactor con soporte ternario |
| BitNet b1.58 (referencia academica) | ~0,7 B / 1,3 B / 3 B en variantes publicadas | no disponible | Ternaria nativa | MIT (en las implementaciones publicadas) | Enfoque de investigacion en pesos ternarios; JiRack aplica ideas similares a un modelo de ~1,5 B |
| Modelos pequeños de tool calling (p. ej. variantes Qwen2-1.5B-Instruct) | ~1,5 B | no disponible | GGUF estándar | Apache 2.0 | Alternativa generalista con soporte de function calling; JiRack añade tokenizador especializado |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque de cuantización.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar (MMLU, HumanEval, GSM8K) no está verificado de forma independiente.
- La model card contiene afirmaciones de marketing (asociaciones con NVIDIA y FISERV, capacidades avanzadas) que no se acompañan de evidencia técnica en la información disponible.
- Riesgo de alucinación inherente a modelos pequeños: con ~1,5 B de parámetros, la fiabilidad en razonamiento complejo y hechos factuales es limitada.
- La longitud de contexto no está especificada; conviene verificarla antes de usarlo en conversaciones multi-turno o documentos largos.
- Aunque se listan trece idiomas, no se detalla la calidad por idioma; el español está incluido pero sin métricas.
- Las cuantizaciones extremas (Q2_K, ternaria) pueden degradar la calidad de forma notable; el autor recomienda Q4_K_M como equilibrio.
- El soporte en Ollama para producción se describe como "en progreso", por lo que la estabilidad en entornos productivos no está garantizada.
- La licencia MIT permite uso comercial, pero el modelo deriva de una base DeepSeek/Qwen2 cuyas condiciones originales conviene revisar antes de redistribuir.
- El tokenizador especializado requiere adaptar los procesadores de tool calling en los pipelines, lo que añade trabajo de integración.
- La fecha de creación del repositorio (2026) y las referencias a versiones futuras deben tratarse con cautela; verificar el estado actual del proyecto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Tokenizador JiRackPrecisionTokenizer: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Demo ternaria de producción: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-2B-chat
- Chat en vivo (Space): https://huggingface.co/spaces/CMSManhattan/JiRackUltra_1b
- Chat TQ2_0 36B: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat
- Chat TQ2_0 16B: https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Chat TQ2_0 8B: https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Chat TQ2_0 2B: https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Guía de QAT a GGUF TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_1b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_1b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_1b/blob/main/jirackultra_1b_onnx_export_guide.md
- Ollama (perfil del autor): https://ollama.com/cmsmanhattan
- Sitio web JiRack: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Desktop UI con modelo 8B: https://huggingface.co/CMSManhattan/JiRack-runtime/resolve/main/JiRackAI-Setup-1.0.0.exe
- Desktop UI con modelo 16B: https://huggingface.co/CMSManhattan/JiRack-runtime/resolve/main/JiRackAI-Setup-1.0.0-16b-1.zip
- Desktop UI con modelo 36B: https://huggingface.co/CMSManhattan/JiRack-runtime/resolve/main/JiRackAI-Setup-1.0.0-36b-1.zip
- ToolBench (referencia para tool calling): https://github.com/OpenBMB/ToolBench
- Gorilla (librería de tool calling en Python): https://github.com/ShishirPatil/gorilla
- Spring AI Alibaba (tool calling en Java): https://github.com/alibaba/spring-ai-alibaba
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo Qwen2-7B-Instruct-glaive-function-calling (referencia): https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
