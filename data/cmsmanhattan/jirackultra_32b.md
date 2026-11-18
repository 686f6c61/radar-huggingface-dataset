# CMSManhattan/JiRackUltra_32b

## Resumen

JiRack Ultra 32B es un modelo de generación de texto de 32.763.876.352 parámetros publicado por CMSManhattan bajo licencia MIT. Según su model card, se presenta como un modelo "refactorizado" a partir de un modelo DeepSeek, con soporte nativo de arquitectura ternaria estilo BitNet (1.58 bit) y cuantizaciones GGUF listas para inferencia en CPU. El autor lo posiciona como una opción de bajo coste para despliegues en nube y como modelo experto en pipelines RAG, con un tokenizador propio (JiRackPrecisionTokenizer) que añade etiquetas específicas para enrutamiento, llamadas a herramientas, robótica, visión, sonido y multimedia.

La propuesta de valor declarada es la eficiencia: inferencia de alta calidad en CPU mediante cuantización ternaria TQ_2 sobre llama.cpp y Ollama, con variantes que van desde ~13 GB (Q2_K) hasta ~65 GB en precisión completa. El repositorio incluye pesos en safetensors y GGUF, y el autor ofrece servicios de QAT (quantization-aware training) a medida, exportación a ONNX y adaptación para casos de uso agénticos.

Conviene señalar que la información disponible procede casi exclusivamente de la model card del autor: no se publican detalles verificables sobre la composición del dataset de entrenamiento, el número de tokens, el proceso de alineación ni resultados de benchmarks. La ficha refleja, por tanto, lo declarado por el autor, marcando explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con soporte ternario estilo BitNet (1.58 bit); basado en un modelo DeepSeek, según el autor |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M, Q3_K_M, Q2_K; ternaria TQ_2_0 (llama.cpp/Ollama) con soporte AVX2 y AVX-512; FP16 de referencia |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF; exportación a ONNX documentada |

## Arquitectura y entrenamiento

El autor describe el modelo como un transformer de 32B "refactorizado" con características BitNet y un tokenizador actualizado, partiendo de un modelo DeepSeek. La innovación declarada es el soporte nativo de pesos ternarios (1.58 bit), lo que permite cuantizaciones TQ_2_0 ejecutables en llama.cpp y Ollama con instrucciones AVX2 y AVX-512 para acelerar la inferencia en CPU. El tokenizador propio (JiRackPrecisionTokenizer) incorpora etiquetas específicas para enrutamiento, medios, visión, sonido, llamadas a herramientas y robótica, orientadas a mejorar la calidad de las llamadas a funciones en modelos de este tamaño.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. El autor menciona que las cuantizaciones actuales se generaron desde el modelo FP16 y que ofrece QAT a medida sobre datasets del cliente, incluyendo doble QAT vía ONNX QAT y adaptaciones para evitar olvido catastrófico y mesetas de entrenamiento (bajo NDA). Tampoco se detalla la longitud de contexto soportada.

## Capacidades

- Generación de texto conversacional en 13 idiomas declarados (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés).
- Llamadas a herramientas (tool calling / function calling) mediante etiquetas dedicadas del tokenizador JiRackPrecisionTokenizer.
- Enrutamiento (routing) como capacidad específica del tokenizador, orientada a selección de herramientas o flujos.
- Capacidades declaradas de robótica, visión, sonido y multimedia a través de las etiquetas del tokenizador; no se detalla la implementación multimodal subyacente.
- Uso como modelo experto en despliegues RAG.
- Orientación a flujos agénticos y multi-paso, según la model card.
- Inferencia en CPU mediante cuantización ternaria TQ_2_0 en llama.cpp y Ollama.
- Exportación a ONNX y despliegue con servidor Java (ONNX JiRack) según el autor.

## Casos de uso

- Atención al cliente multilingüe: el modelo declara soporte para 13 idiomas, lo que permite atender conversaciones en español, inglés, chino o árabe con un único despliegue; la longitud de contexto no está documentada, por lo que habría que validar el histórico conversacional soportado.
- Enrutamiento de consultas en sistemas RAG: las etiquetas de routing del tokenizador permiten clasificar y dirigir consultas hacia el recuperador o la herramienta adecuada, reduciendo la carga de un modelo de mayor tamaño.
- Llamadas a herramientas en backends empresariales: la model card referencia ejemplos con Spring AI Alibaba (Java) y Gorilla (Python), lo que facilita integrar el modelo como planificador de tool calls en aplicaciones corporativas.
- Asistente de programación en local: el autor distribuye un IDE agéntico (JiRack Coding Agent) con plugins para Eclipse y VS Code, pensado para ejecutarse vía Ollama en un PC doméstico con revisión humana de los cambios.
- Despliegue en infraestructura sin GPU: con cuantización Q4_K_M (~19,5 GB) o Q2_K (~13,1 GB) el modelo puede servirse en CPU con 16 hilos, lo que abarata el coste frente a instancias con GPU.
- Automatización robótica y control por voz: las etiquetas de robótica y sonido del tokenizador apuntan a interfaces de control para robots o asistentes de voz; la viabilidad real dependerá de validación propia, ya que no hay detalles técnicos publicados.
- Procesamiento por lotes de bajo coste: la variante ternaria TQ_2_0 con AVX-512 está orientada a maximizar throughput en servidores CPU, adecuada para tareas de clasificación, extracción o resumen a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según las variantes declaradas por el autor:
  - Precisión completa: ~65 GB de pesos, ~64-72 GB de RAM.
  - Q4_K_M: ~19,5 GB de pesos, ~20-28 GB de RAM (opción recomendada).
  - Q3_K_M: ~16,2 GB de pesos, ~17-24 GB de RAM.
  - Q2_K: ~13,1 GB de pesos, ~14-20 GB de RAM.
- GPU recomendadas: no disponible. El modelo está optimizado explícitamente para CPU; no se documentan requisitos ni rendimiento en GPU.
- Viabilidad en GPU de consumo: no confirmada. Con Q4_K_M (~19,5 GB) no cabría en GPUs de 16 GB o menos sin offloading; no hay datos de rendimiento en RTX 4090 u otras.
- Despliegue: llama.cpp, Ollama, Docker (imágenes `cmsmanhattan/jirack-ultra-32b-cpu` en variantes full, q4, q3 y q2), exportación a ONNX y servidor Java ONNX JiRack. No se mencionan vLLM ni TGI.
- CPU: las imágenes Docker de ejemplo usan 16 hilos (`--cpus=16`, `THREADS=16`, `THREADS_BATCH=16`); la variante ternaria TQ_2_0 aprovecha AVX2 y AVX-512.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización destacada | Licencia | Notas |
|---|---|---|---|---|---|
| JiRack Ultra 32B | 32,76 B | no disponible | Ternaria TQ_2_0, GGUF Q2-Q4 | MIT | Optimizado para CPU; tool calling vía tokenizador propio |
| Modelos base DeepSeek de ~32B | no disponible en la información | no disponible | GGUF estándar | según variante | El autor indica que JiRack parte de un modelo DeepSeek, pero no identifica la versión |
| BitNet b1.58 (referencia académica) | no disponible en la información | no disponible | Ternaria nativa | investigación | Referencia conceptual del enfoque 1.58 bit citado por el autor |

No se dispone de datos verificables de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni similares que permitan evaluar la calidad real del modelo.
- Falta de transparencia sobre el entrenamiento: no se documentan tokens, composición del dataset, ni proceso de alineación (RLHF/DPO).
- Longitud de contexto no especificada, lo que impide planificar despliegues con conversaciones o documentos largos sin validación previa.
- Las capacidades de visión, sonido y robótica se declaran únicamente a nivel de etiquetas del tokenizador; no se detalla ninguna arquitectura multimodal, por lo que deben tratarse como no verificadas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no puede acotarse su magnitud.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Trazabilidad limitada del origen: el autor menciona una base DeepSeek sin identificar la versión ni los términos de la licencia original; conviene revisar la procedencia antes de un uso comercial, aunque la licencia declarada del repositorio es MIT.
- El repositorio ocupa 329,8 GB, lo que implica un coste de almacenamiento y descarga considerable.
- El modelo tiene muy poca tracción comunitaria (1 like, 4.277 descargas), por lo que la validación por terceros es prácticamente inexistente.
- Las variantes ternarias TQ_2_0 requieren versiones de llama.cpp/Ollama compatibles y CPUs con AVX2 o AVX-512; sin ellas el rendimiento puede degradarse.
- Los servicios de QAT a medida se ofrecen bajo NDA, lo que dificulta auditar la metodología.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_32b
- Tokenizador: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Demo de chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_32b
- Demos TQ2_0: https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat, https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat, https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat, https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Demo de producción ternaria: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-36B-chat
- Guía QAT a llama.cpp GGUF TQ2_0: https://huggingface.co/CMSManhattan/JiRackUltra_32b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_32b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_32b/blob/main/jirackultra_32b_onnx_export_guide.md
- Perfil de Ollama: https://ollama.com/cmsmanhattan
- IDE agéntico: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin VS Code: https://huggingface.co/spaces/CMSManhattan/README/blob/main/jirack-agent-0.9.0.vsix
- JiRack Harness: https://huggingface.co/spaces/CMSManhattan/README/resolve/main/windows_v11.zip
- Release del IDE: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/resolve/main/jirack_ide_final.zip
- Spring AI Alibaba (tool calling en Java): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (tool calling en Python): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset de function calling de Glaive: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
