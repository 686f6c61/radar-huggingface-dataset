# CMSManhattan/JiRackUltra_7b

## Resumen

JiRack Ultra 7B es un modelo de generacion de texto de 7.615.616.512 parametros (7,6 B) publicado por CMSManhattan bajo licencia MIT. Segun su model card, deriva de un modelo de la familia DeepSeek y ha sido "refactorizado" con caracteristicas de tipo BitNet, incluyendo soporte nativo para pesos ternarios (1,58 bits) y cuantizaciones GGUF listas para ejecutar en CPU. El modelo se distribuye con un tokenizador propio (JiRackPrecisionTokenizer) que anade etiquetas especificas para routing, tool calling, multimedia y robotica.

El objetivo declarado es la inferencia eficiente en CPU: el autor presenta variantes cuantizadas en Q4_K_M (4,68 GB, ~6,2 GB de RAM), Q3_K_M (3,81 GB) y Q2_K (3,02 GB), ademas de una variante de referencia de 15,24 GB. El modelo se promociona como pieza experta en despliegues RAG y como base para agentes de codificacion integrados en IDEs (Eclipse, JetBrains, VS Code) que se ejecutan mediante Ollama en un PC domestico.

La relevancia actual del modelo reside en su propuesta de combinar un transformer de ~7,6 B con cuantizacion ternaria estilo BitNet para abaratar costes de infraestructura. No obstante, la informacion publicada es fundamentalmente descriptiva y comercial: no se aportan resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones verificables de la arquitectura mas alla de la etiqueta `qwen2` en los metadatos de Hugging Face, que contrasta con la mencion a DeepSeek en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen2` en metadatos; la model card menciona base DeepSeek y soporte ternario BitNet) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (1,58 bits, TQ_2_0 en llama.cpp), GGUF Q4_K_M, Q3_K_M, Q2_K, FP16 de referencia |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (tambien guia de exportacion a ONNX) |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer de ~7,6 B "refactorizado" con caracteristicas BitNet y soporte nativo de pesos ternarios, con cuantizacion QAT (quantization-aware training) orientada a TQ_2_0 en llama.cpp y Ollama. Se menciona compatibilidad con instrucciones AVX2 y AVX-512 para acelerar la inferencia ternaria en CPU, y se ofrece un servicio de QAT personalizado sobre datasets del cliente, incluyendo doble QAT via ONNX. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

Existe una contradiccion relevante en la informacion disponible: los metadatos de Hugging Face etiquetan el modelo como `qwen2`, mientras que la model card afirma que esta construido sobre un modelo DeepSeek. Tampoco se detalla la innovacion del tokenizador mas alla de la existencia de etiquetas para routing, tool call, multimedia y robotica, ni se documenta la ventana de contexto. Las cuantizaciones publicadas se generaron a partir del modelo en FP16, segun el autor.

## Capacidades

- Generacion de texto conversacional e instructiva en 13 idiomas declarados (en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th).
- Tool calling / function calling, con soporte declarado para integracion via librerias Java (Spring AI Alibaba) y Python (Gorilla).
- Routing y etiquetado especializado mediante el tokenizador JiRackPrecisionTokenizer.
- Capacidades declaradas de robotica y multimedia a traves de etiquetas del tokenizador (sin documentacion tecnica adicional).
- Uso como modelo experto en pipelines RAG.
- Inferencia en CPU con cuantizacion ternaria y GGUF.
- Integracion con agentes de codificacion en IDEs (Eclipse, JetBrains, VS Code) mediante Ollama.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (el autor menciona una variante "chat without reasoning" en Ollama).

## Casos de uso

- Atencion al cliente multilingue en infraestructura de bajo coste: el modelo cubre 13 idiomas y puede ejecutarse en CPU con la variante Q4_K_M (~6,2 GB de RAM), lo que permite desplegarlo en servidores sin GPU para conversaciones multi-turno.
- Modelo experto en RAG: el autor lo posiciona explicitamente como experto en despliegues RAG, de modo que puede recibir contexto recuperado y generar respuestas fundamentadas, con la ventaja de que la variante ternaria reduce el coste por instancia en la nube.
- Agente de codificacion en IDE: los plugins publicados para Eclipse, JetBrains y VS Code permiten usar el modelo via Ollama en un PC domestico para sugerir cambios de codigo con revision humana previa a la aplicacion.
- Automatizacion de tool calling en backend Java: mediante Spring AI Alibaba, el modelo puede orquestar llamadas a funciones en aplicaciones empresariales, aprovechando las etiquetas de tool call del tokenizador JiRack.
- Enrutamiento de consultas (routing): las etiquetas de routing del tokenizador permiten clasificar y derivar peticiones a distintos servicios o submodelos dentro de un sistema mayor.
- Despliegue en entornos con restricciones de memoria: la variante Q2_K (3,02 GB, ~4,5 GB de RAM) permite ejecutar el modelo en maquinas modestas o contenedores con limites estrictos de memoria.
- Prototipado de robotica conversacional: las etiquetas de robotica declaradas permiten experimentar con interfaces de lenguaje natural para control de robots, aunque sin documentacion tecnica que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun las variantes publicadas por el autor: FP16 de referencia 15,24 GB (~16,7 GB de RAM); Q4_K_M 4,68 GB (~6,2 GB); Q3_K_M 3,81 GB (~5,3 GB); Q2_K 3,02 GB (~4,5 GB).
- Inferencia optimizada para CPU, con soporte declarado de instrucciones AVX2 y AVX-512 para la variante ternaria TQ_2_0.
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090); el enfoque del autor es CPU y Ollama.
- Cabe en GPU de consumo por tamano (una RTX 4090 de 24 GB alojaria la variante FP16), pero no se documenta rendimiento en GPU.
- Opciones de despliegue: llama.cpp, Ollama, Docker (imagenes `cmsmanhattan/jirack-ultra-7b-cpu` en variantes full, q4, q3 y q2), exportacion a ONNX y servidor Java ONNX JiRack.
- Latencia y throughput: no disponibles. El autor solo afirma que el modelo es "rapido y eficiente" en CPU sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Notas |
|---|---|---|---|---|---|
| JiRack Ultra 7B | 7,6 B | no disponible | Ternaria 1,58 bits, GGUF Q2-Q4 | MIT | Enfoque CPU, tool calling, 13 idiomas |
| Qwen2-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion publica de Qwen2) | GGUF, AWQ, GPTQ | Apache 2.0 | Base probable segun metadatos; ecosistema amplio y benchmarks publicos |
| BitNet b1.58 (Microsoft) | ~3 B / ~3,9 B (variantes publicadas) | no disponible | Ternaria nativa | MIT | Referencia academica del enfoque ternario; no es un modelo instructivo de proposito general |
| DeepSeek (familia base citada) | variable | variable | variable | variable | La model card afirma base DeepSeek, sin especificar version |

No se dispone de datos de rendimiento comparativo del JiRack Ultra 7B frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad en MMLU, HumanEval, GSM8K ni otras tareas estandar.
- Contradiccion entre los metadatos (`qwen2`) y la model card (base DeepSeek), lo que dificulta conocer el linaje real del modelo y sus sesgos heredados.
- La model card es fundamentalmente promocional: menciona "partnership" con NVIDIA y FISERV, plugins de IDE y servicios de QAT personalizado sin documentacion tecnica que los respalde.
- No se documenta la longitud de contexto, dato critico para evaluar su idoneidad en RAG o conversaciones largas.
- Las capacidades de vision, sonido y robotica se declaran solo como etiquetas del tokenizador; no hay evidencia de que el modelo procese imagenes o audio.
- Riesgo de alucinacion no cuantificado; al ser un modelo pequeno (7,6 B) y sin datos de entrenamiento publicos, la fiabilidad en dominios especializados es incierta.
- Licencia MIT permite uso comercial sin restricciones declaradas, pero el autor condiciona ciertos servicios (QAT personalizado, adaptaciones) a contacto directo, lo que sugiere que las variantes optimizadas no son abiertas.
- El repositorio ocupa 77,1 GB, muy por encima del peso de los parametros en FP16 (~15,2 GB), lo que indica la presencia de multiples formatos y artefactos adicionales.
- Solo 2 "likes" y 4.182 descargas en el momento de la consulta: comunidad muy reducida, sin validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_7b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Demo ternaria de produccion: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-8B-chat
- Demo live chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_7b
- Demos TQ2_0 adicionales: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat , https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Guia QAT a llama.cpp TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_7b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0.md
- Guia de exportacion a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_7b/blob/main/jirackultra_7b_onnx_export_guide.md
- Perfil Ollama: https://ollama.com/cmsmanhattan
- Sitio web: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Spring AI Alibaba (tool calling Java): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (tool calling Python): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset de referencia function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo de referencia function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
