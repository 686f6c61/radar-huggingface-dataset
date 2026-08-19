# RadixArk/Qwen3.8-27B-NVFP4

## Resumen

RadixArk/Qwen3.8-27B-NVFP4 es una cuantización del modelo multimodal Qwen3.8-27B de Alibaba, producida por RadixArk mediante NVIDIA Model Optimizer. El checkpoint aplica una receta mixta NVFP4 W4A4: las capas MLP y la cabeza de salida se cuantizan a 4 bits, la atención se mantiene en FP8, y los tensores de visión y MTP conservan BF16. El resultado es un modelo de 27B parámetros (18,16B en pesos cuantizados) con una ventana de contexto nativa de 262.144 tokens, pensado para despliegue en GPUs NVIDIA Blackwell.

La relevancia de este modelo radica en que ofrece una versión lista para producción de Qwen3.8-27B con un tamaño de checkpoint de 21,9 GB, lo que permite servir el modelo en cuatro GPUs Blackwell con tensor parallelism. Al ser un derivado de terceros, no incluye entrenamiento adicional: hereda todas las capacidades del modelo base, incluyendo visión, razonamiento, tool calling y soporte para agentes. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (Dense Multimodal), Qwen3.8-27B |
| Parametros totales | 27B (modelo base); 18.164.649.200 en el checkpoint cuantizado (safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 W4A4 (MLP y lm_head, group size 16), FP8 (attention), BF16 (MTP y vision) |
| Idiomas soportados | No disponible (heredado del modelo base, no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint NVFP4); tambien disponible en GGUF (Unsloth) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que acepta texto, imagen y video como entrada y genera texto. La cuantización realizada por RadixArk no implica entrenamiento ni fine-tuning: se aplicó post-training quantization con NVIDIA Model Optimizer (commit `87c9f8cf83021957d1a1a575c90c9a4eaaf7ef0c`). La calibración utilizó 1.024 muestras del split de entrenamiento de `abisee/cnn_dailymail` con longitud de secuencia 512.

La receta de cuantización es mixta: las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`) y `lm_head` usan NVFP4 dinámico W4A4 con group size 16; los pesos de atención se mantienen en FP8; y los tensores de MTP (Multi-Token Prediction) y visión conservan la precisión BF16 original. Esta combinación busca minimizar la pérdida de calidad en las partes sensibles del modelo mientras reduce el uso de memoria en las capas dominantes.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades de chat y razonamiento del modelo base, incluyendo modo thinking (activado con `--reasoning-parser qwen3`).
- Multimodal: acepta texto, imagen y video como entrada, generando respuestas textuales.
- Tool calling y agentes: soporta function calling (parser `qwen3_coder`) y puede integrarse en pipelines de agentes multi-paso.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos, conversaciones multi-turno y analisis de codigo.
- Decodificacion especulativa: incluye soporte MTP (Multi-Token Prediction) para acelerar la inferencia, configurable via SGLang con `--speculative-algorithm NEXTN`.
- Multilingue: no se especifican idiomas en la model card, pero el modelo base Qwen3.8-27B es conocido por su soporte multilingue amplio (dato no confirmado en la informacion proporcionada).

## Casos de uso

- Agentes de IA autonomos: el modelo puede actuar como cerebro de un agente que razona, llama herramientas y ejecuta tareas multi-paso. Su soporte nativo de tool calling y el parser `qwen3_coder` permiten integrarlo en frameworks como LangChain o sistemas propios.
- Chatbots de atencion al cliente: con 262K tokens de contexto, puede mantener conversaciones largas recordando todo el historial, y su capacidad multimodal permite procesar capturas de pantalla o documentos adjuntos enviados por el usuario.
- Generacion de codigo en produccion: gracias a su entrenamiento en codigo y al soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o autocompletar funciones. El parser `qwen3_coder` facilita la llamada a herramientas de desarrollo.
- Sistemas RAG (Retrieval-Augmented Generation): la ventana de contexto amplia permite inyectar grandes fragmentos de documentos recuperados sin perder informacion, mejorando la precision de respuestas en dominios especificos.
- Analisis de contenido visual: al aceptar imagen y video, puede describir imagenes, transcribir informacion de graficos o resumir contenido de video, util en moderacion de contenido o accesibilidad.
- Razonamiento matematico y cientifico: el benchmark GSM8K muestra un 97,27% de aciertos, lo que lo hace adecuado para asistentes de tutoria, resolucion de problemas numericos o verificacion de resultados en entornos educativos.
- Despliegue en hardware Blackwell: al estar optimizado para NVFP4, es una opcion eficiente para servir el modelo en infraestructura B300/GB300 con tensor parallelism, reduciendo costes de memoria frente al checkpoint BF16.

## Benchmarks y rendimiento

La model card reporta dos evaluaciones realizadas con el checkpoint NVFP4 en 4x NVIDIA B300/GB300 con TP4 y SGLang:

| Benchmark | Protocolo de evaluacion | Score |
|---|---|---|
| GSM8K | Split completo de 1.319 ejemplos, modo thinking, sgl-eval | 97,27% (1.283/1.319) |
| Terminal-Bench 2.1 | Subconjunto de 84 tareas, Claude Code 2.1.228, pass@1 | 73,81% (62/84) |

GSM8K se evaluo con `temperature=1.0`, `top_p=0.95` y `top_k=20`. Las evaluaciones fueron solo de texto. No se proporcionan comparaciones con el modelo base sin cuantizar ni con otras cuantizaciones.

## Requisitos de hardware

- El checkpoint NVFP4 requiere GPUs NVIDIA Blackwell (B300, GB300, GB10) por el formato de cuantizacion NVFP4. No es compatible con arquitecturas anteriores (Ampere, Ada Lovelace, Hopper).
- El comando de despliegue recomendado usa 4 GPUs Blackwell con tensor parallelism (TP4) y `--mem-fraction-static 0.75`.
- Tamano del repo: 21,9 GB, por lo que cabe en GPUs de 24 GB o superiores, aunque la inferencia con contexto largo requerira mas memoria.
- Para hardware no Blackwell, se puede usar la version GGUF de Unsloth, que segun su documentacion corre en 17 GB de RAM/VRAM (probablemente con cuantizacion de menor precision).
- Runtime soportado: SGLang (version especifica para Qwen3.8-27B, ver cookbook). Tambien hay soporte via LM Studio en AMD Ryzen AI Max y Radeon, segun el blog de AMD.
- La decodificacion especulativa MTP esta disponible en SGLang con `--speculative-algorithm NEXTN`, lo que reduce la latencia en generacion larga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | BF16 | Apache 2.0 | Hugging Face |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B (18,16B en checkpoint) | 262.144 | NVFP4 mixto | Apache 2.0 | Hugging Face |
| Qwen3.8-27B GGUF (Unsloth) | 27B | 262.144 | GGUF (varias) | Apache 2.0 | Unsloth / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas versiones. La cuantizacion NVFP4 reduce el tamano del checkpoint frente al BF16 (21,9 GB vs aproximadamente 54 GB), a costa de una posible ligera degradacion en tareas de alta precision. La version GGUF es mas flexible en cuanto a hardware, pero puede tener menor rendimiento que NVFP4 en Blackwell.

## Limitaciones y advertencias

- Modelo derivado de terceros: RadixArk no es el desarrollador original; las capacidades, limitaciones y sesgos provienen del modelo base Qwen3.8-27B. Se recomienda revisar la model card upstream.
- Degradacion por cuantizacion: la cuantizacion NVFP4 puede introducir perdidas de precision en tareas que requieren calculos numericos exactos, aunque los benchmarks reportados muestran un rendimiento alto en GSM8K y Terminal-Bench.
- Hardware restringido: el checkpoint NVFP4 solo funciona en GPUs NVIDIA Blackwell. Para otros entornos, es necesario usar otras cuantizaciones (GGUF, FP8, etc.).
- Sesgos y alucinaciones: como cualquier LLM, puede generar respuestas inexactas, incompletas, sesgadas o irrelevantes. La model card advierte explicitamente sobre esto y recomienda evaluar el modelo para el caso de uso concreto.
- Idiomas no documentados: la model card no especifica los idiomas soportados, por lo que el rendimiento en idiomas distintos del ingles no esta garantizado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los terminos de la licencia del modelo base y con las obligaciones de atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Cookbook SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Tutorial de despliegue en DGX Spark (GB10): https://github.com/Deep-AI-Evo/qwen3.8-27b-nvfp4-dgx-spark-tutorial
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
