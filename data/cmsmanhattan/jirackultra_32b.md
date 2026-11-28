# CMSManhattan/JiRackUltra_32b

## Resumen

JiRack Ultra 32B es un modelo de generación de texto de 32.763.876.352 parámetros (32,7 B) publicado por CMSManhattan en Hugging Face. Según su model card, se trata de un modelo construido sobre una base de la familia DeepSeek, refactorizado con soporte nativo de cuantización ternaria estilo BitNet (1,58 bits) y un tokenizador propio (JiRackPrecisionTokenizer) que incorpora etiquetas específicas para enrutamiento (routing), multimedia, visión, sonido, tool calling y robótica. El objetivo declarado es ofrecer inferencia eficiente en CPU con un modelo de escala 32B, reduciendo el coste de infraestructura en despliegues cloud y en RAG.

La propuesta técnica combina un transformer denso con cuantización ternaria entrenada (QAT) y exportación a GGUF TQ2_0 para llama.cpp y Ollama, con soporte de instrucciones AVX2 y AVX-512. El repositorio incluye pesos en safetensors y GGUF, y el autor distribuye variantes Docker con cuantizaciones Q4_K_M, Q3_K_M y Q2_K, además de un servidor ONNX en Java como alternativa de despliegue.

Es relevante ahora porque plantea un caso poco habitual: un modelo de 32B orientado explícitamente a ejecución en CPU y a memoria baja, con licencia MIT y compatibilidad con endpoints. No obstante, la información pública disponible es escasa y mayoritariamente promocional: no hay detalles sobre el dataset de entrenamiento, no se publican resultados de benchmarks y el número de likes (1) frente a descargas (3226) sugiere una adopción aún muy limitada. La ficha siguiente refleja únicamente lo que puede verificarse en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base familia Qwen2 según tags; model card menciona base DeepSeek), con soporte de cuantización ternaria estilo BitNet |
| Parámetros totales | 32.763.876.352 (32,7 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP16 (referencia), Q4_K_M, Q3_K_M, Q2_K, TQ2_0 (ternaria, 1,58 bits) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX (guía de exportación incluida) |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura exacta. Los tags del repositorio incluyen `qwen2`, mientras que la model card afirma que el modelo está construido sobre una base DeepSeek; ambos extremos son inconsistentes y no se aporta documentación que los concilie. Lo que sí se declara es un transformer denso de 32,7 B de parámetros con soporte nativo de ternarización (BitNet-style, 1,58 bits), pensado para que la inferencia en CPU sea viable mediante QAT (quantization-aware training) y conversión a GGUF TQ2_0 para llama.cpp y Ollama, con rutas optimizadas para AVX2 y AVX-512.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El autor menciona servicios de QAT personalizado sobre datasets del cliente, doble QAT vía ONNX QAT y adaptaciones para evitar olvido catastrófico, pero no publica detalles del proceso original. El tokenizador propio (JiRackPrecisionTokenizer) es la innovación declarada más concreta: añade etiquetas dedicadas a routing, tool calling, robótica y modalidades multimedia, con el objetivo de mejorar la calidad de las llamadas a herramientas en modelos pequeños o especializados.

## Capacidades

- Generación de texto conversacional en 13 idiomas declarados (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés).
- Tool calling y function calling nativo mediante etiquetas del tokenizador JiRackPrecisionTokenizer, con integración documentada para ToolBench, Gorilla y Spring AI Alibaba.
- Enrutamiento (routing) y soporte declarado de agentes y razonamiento multi-paso.
- Capacidades declaradas de visión, sonido y multimedia a través de las etiquetas del tokenizador; no se documenta si el modelo procesa realmente entradas multimodales o si las etiquetas son solo de routing.
- Soporte declarado para robótica (RoboTech) mediante etiquetas específicas del tokenizador.
- Ejecución en CPU con cuantizaciones GGUF y TQ2_0, orientada a bajo consumo de memoria.
- Compatibilidad con endpoints y despliegue vía Docker, Ollama y servidor ONNX en Java.
- Modo chat sin razonamiento disponible en la plataforma Ollama del autor.

## Casos de uso

- Inferencia en CPU para despliegues con presupuesto de GPU nulo: las variantes Q4_K_M (~19,5 GB) y Q3_K_M (~16,2 GB) permiten servir un modelo de 32B en servidores sin acelerador, usando llama.cpp u Ollama con hilos AVX2/AVX-512.
- RAG empresarial con modelo experto: el autor lo posiciona explícitamente como modelo experto en despliegues RAG, donde el contexto recuperado se inyecta en el prompt y el modelo genera la respuesta final; la ventana de contexto no está documentada, por lo que habría que validarla antes de producción.
- Agentes con tool calling: las etiquetas de routing y tool call del tokenizador permiten estructurar llamadas a funciones en pipelines agénticos; encaja en integraciones con librerías como Gorilla (Python) o Spring AI Alibaba (Java).
- Asistente de código en IDE local: el ecosistema del autor incluye un plugin para Eclipse, un plugin de VS Code y un IDE propio que ejecutan los modelos JiRack vía Ollama en un PC doméstico, con revisión humana de los cambios aplicados.
- Automatización de atención al cliente multilingüe: con 13 idiomas declarados, puede gestionar conversaciones multi-turno en mercados con varios idiomas, siempre que se valide la calidad real por idioma.
- Despliegue en contenedor con Docker: las imágenes publicadas (`cmsmanhattan/jirack-ultra-32b-cpu-q4`, `-q3`, `-q2`) permiten levantar el servicio en el puerto 7869 con configuración de hilos, lo que facilita entornos on-premise o edge con recursos limitados.
- Routing y orquestación de modelos: las etiquetas de routing del tokenizador permiten usarlo como clasificador o enrutador dentro de un sistema multi-modelo, derivando consultas al especialista adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según las variantes declaradas por el autor:
  - Full precision: ~65 GB de pesos, ~64–72 GB de RAM.
  - Q4_K_M: ~19,5 GB de pesos, ~20–28 GB de RAM (recomendada por el autor).
  - Q3_K_M: ~16,2 GB de pesos, ~17–24 GB de RAM.
  - Q2_K: ~13,1 GB de pesos, ~14–20 GB de RAM.
- GPU recomendadas: no disponible. El modelo está optimizado para CPU; no se documentan requisitos de GPU ni soporte CUDA específico.
- ¿Cabe en GPU consumer? No hay datos oficiales. Por tamaño de pesos, la variante Q4_K_M (~19,5 GB) no cabría en GPUs de 16 GB o menos sin offloading; en una RTX 4090 (24 GB) podría cargarse parcialmente, pero no se documenta rendimiento en GPU.
- Despliegue: llama.cpp, Ollama, Docker (imágenes oficiales del autor), servidor ONNX en Java, exportación a ONNX documentada.
- Latencia y throughput: no disponibles. El autor afirma que la ternarización TQ2_0 con AVX2/AVX-512 mejora el rendimiento en CPU, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización ternaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ultra 32B | 32,7 B | No disponible | Sí (TQ2_0, QAT) | MIT | Hugging Face, Docker, Ollama |
| BitNet b1.58 (Microsoft Research) | 0,7 B / 3,9 B (variantes publicadas) | No disponible en la información manejada | Sí (1,58 bits nativo) | MIT (código) | Repositorio de investigación |
| DeepSeek base (familia) | No disponible | No disponible | No | No disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de ~32B con cuantización extrema orientada a CPU) no puede completarse con rigor: no se han publicado benchmarks de JiRack Ultra 32B y no se dispone de datos verificables de modelos directamente comparables en la información proporcionada. La referencia a BitNet b1.58 se incluye por ser el paradigma de cuantización ternaria, pero sus variantes publicadas son de menor tamaño.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada, lo que impide evaluar su calidad frente a alternativas.
- Inconsistencia en la base declarada: los tags indican `qwen2` y la model card afirma base DeepSeek; conviene verificar la arquitectura real antes de integrarlo.
- Capacidades multimodales no verificadas: las etiquetas de visión, sonido y multimedia pueden ser solo de routing y no implicar procesamiento real de esas modalidades.
- Longitud de contexto no documentada: es un dato crítico para RAG y agentes que no aparece en la información disponible.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni técnicas de mitigación.
- Sesgos: no se publica información sobre composición del dataset ni evaluación de sesgos.
- Adopción muy limitada: 1 like y 3226 descargas en el momento de la consulta, con un único autor y sin revisión comunitaria aparente.
- Proceso de entrenamiento opaco: no se detallan tokens de entrenamiento, dataset ni fases de alineación; las afirmaciones sobre QAT y tokenizador provienen exclusivamente del autor.
- Licencia MIT: permite uso comercial, pero el autor ofrece servicios de QAT personalizado con NDA, lo que sugiere que el modelo base publicado puede no cubrir todos los casos de producción sin adaptación.
- Dependencia de un ecosistema propietario del autor (IDE, plugins, harness, imágenes Docker) para aprovechar las capacidades declaradas de agentes y tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_32b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Demo de chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_32b
- Demo ternaria de producción: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-36B-chat
- Guía QAT a GGUF TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_32b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_32b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_32b/blob/main/jirackultra_32b_onnx_export_guide.md
- Ollama del autor: https://ollama.com/cmsmanhattan
- Sitio web del proyecto: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin VS Code: https://huggingface.co/spaces/CMSManhattan/README/blob/main/jirack-agent-0.9.0.vsix
- IDE final: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/resolve/main/jirack_ide_final.zip
- Harness: https://huggingface.co/spaces/CMSManhattan/README/resolve/main/windows_v11.zip
- Runtime de escritorio: https://huggingface.co/CMSManhattan/JiRack-runtime/resolve/main/JiRackAI-Setup-1.0.0.exe
- ToolBench: https://github.com/OpenBMB/ToolBench
- Gorilla: https://github.com/ShishirPatil/gorilla
- Spring AI Alibaba: https://github.com/alibaba/spring-ai-alibaba
- Dataset de function calling de Hermes: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo de referencia de function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
