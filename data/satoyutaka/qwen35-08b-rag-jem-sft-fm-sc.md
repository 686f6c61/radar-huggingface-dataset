# satoyutaka/qwen35-08b-rag-jem-sft-fm-sc

## Resumen

satoyutaka/qwen35-08b-rag-jem-sft-fm-sc es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario satoyutaka en Hugging Face. Se trata de un modelo de aproximadamente 873 millones de parámetros, obtenido mediante un LoRA de rango 16 fusionado (merged) con los pesos base, sin fase posterior de DPO. El objetivo declarado es el entrenamiento sobre tareas de generación aumentada por recuperación (RAG) y question answering en japonés, a partir de cuatro conjuntos de datos: JEMHopQA, auto-wiki-qa, JSQuAD y JaQuAD.

El modelo pertenece a la familia Qwen3.5, una arquitectura transformer densa de la que no se dispone de especificaciones detalladas en la información proporcionada. Su relevancia radica en ser un ejemplo de especialización mediante SFT de un modelo pequeño (sub-1B) para dominio japonés y tareas extractivas/generativas de QA, un nicho donde los modelos multilingües generalistas suelen rendir por debajo de los ajustes específicos.

La ficha se limita a los datos verificables publicados: no hay resultados de benchmarks, no se especifican idiomas soportados oficialmente, la licencia figura como "other" y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible oficialmente; los datasets de entrenamiento son en japonés (JEMHopQA, auto-wiki-qa, JSQuAD, JaQuAD) |
| Licencia | other (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,8 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Metodo de ajuste | LoRA r16 SFT, fusionado (merged); sin DPO |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,87 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) mediante LoRA con rango 16, cuyos adaptadores se fusionaron posteriormente con los pesos del modelo base para producir un checkpoint único en safetensors. No se realizó fase de DPO ni de alineación por preferencias, según la model card.

Los datos de entrenamiento son cuatro corpus japoneses de question answering y recuperación: JEMHopQA (aiishii/JEMHopQA, CC BY-SA 4.0), auto-wiki-qa (cl-nagoya/auto-wiki-qa, CC BY-SA 4.0), JSQuAD (yahoojapan/JGLUE, CC BY-SA 4.0) y JaQuAD (SkelterLabsInc/JaQuAD, CC BY-SA 3.0). No se documentan el número de tokens de entrenamiento, la composición exacta de las mezclas, hiperparámetros, ni detalles sobre la arquitectura interna del modelo base (tipo de atención, positional encoding, activaciones). Tampoco se describe ninguna innovación técnica adicional más allá del propio procedimiento de SFT con LoRA fusionado.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, orientada a tareas de QA sobre contexto recuperado (RAG).
- Question answering extractivo y generativo sobre documentos, gracias al entrenamiento con JSQuAD y JaQuAD.
- QA multi-hop, derivado del uso de JEMHopQA, que contiene preguntas que requieren encadenar varias entidades y relaciones.
- Generación de preguntas y respuestas a partir de artículos de Wikipedia en japonés (auto-wiki-qa).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso más allá del implícito en QA multi-hop.
- Capacidades multilingües: no disponibles oficialmente; el ajuste está orientado al japonés.
- No se documentan modos especiales (thinking mode, visión, audio) en la información proporcionada.

## Casos de uso

- Sistemas de RAG sobre documentación interna en japonés: el modelo puede recibir pasajes recuperados por un retriever y generar respuestas extractivas o sintetizadas; su tamaño reducido permite desplegarlo en el mismo nodo que el índice vectorial.
- Atención al cliente en japonés con base de conocimiento: integrado en un pipeline que recupera artículos de FAQ y genera respuestas acotadas al contexto, reduciendo el coste frente a modelos de mayor tamaño.
- Extracción de respuestas sobre normativa y contratos: el entrenamiento con JSQuAD y JaQuAD lo hace adecuado para localizar y reformular respuestas a partir de fragmentos legales o administrativos en japonés.
- Generación de pares pregunta-respuesta para aumento de datos: a partir de artículos de Wikipedia en japonés, puede producir QA sintéticas que alimenten el entrenamiento de otros modelos o la evaluación de retrievers.
- Evaluación de pipelines de recuperación: al ser un modelo pequeño y especializado en QA, sirve como componente de referencia para medir la calidad del retriever en experiments controlados, aislando el efecto del generador.
- Prototipado y pruebas de concepto en local: con menos de 1B de parámetros, puede ejecutarse en hardware de gama media para validar flujos de RAG antes de escalar a modelos mayores.
- Investigación sobre ajuste fino eficiente: el checkpoint sirve como caso de estudio de SFT con LoRA r16 fusionado sobre un modelo base pequeño, útil para comparar estrategias de adaptación en dominios de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican versiones GGUF oficiales y habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente en fp16 para contextos moderados; para mayor throughput, A10G, L4 o RTX 4090.
- Cabe en GPU consumer: sí, en toda la gama media y alta reciente; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con PyTorch, vLLM y TGI para servir en GPU; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-jem-sft-fm-sc | 873 M | no disponible | other | SFT en QA japonés (RAG) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | Modelo generalista multilingüe |
| Modelos QA japoneses de tamano similar | no disponible | no disponible | no disponible | Ajustes específicos para QA en japonés |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La licencia figura como "other" sin texto detallado: es imprescindible revisar los términos del repositorio y del modelo base Qwen/Qwen3.5-0.8B antes de cualquier uso comercial.
- Los datasets de entrenamiento tienen licencias CC BY-SA (4.0 y 3.0), lo que puede imponer obligaciones de atribución y compartir-al-igual sobre obras derivadas; conviene verificar la compatibilidad con el uso previsto.
- El ajuste está orientado al japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a un modelo de 0,87 B sin fase de DPO ni alineación por preferencias; en tareas RAG debe acotarse la respuesta al contexto recuperado y validarse la fidelidad.
- No se documentan sesgos conocidos, pero los corpus de Wikipedia y QA japoneses pueden introducir sesgos de cobertura y de dominio.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- El repositorio no registra descargas ni interacciones, lo que reduce la validación comunitaria y el soporte disponible.
- No se publican versiones cuantizadas ni conversiones a GGUF, lo que limita el despliegue en entornos sin GPU.
- La longitud de contexto no está documentada; para RAG con pasajes largos debe validarse empíricamente el límite efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-sft-fm-sc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://huggingface.co/datasets/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JSQuAD (JGLUE): https://huggingface.co/datasets/yahoojapan/JGLUE
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
