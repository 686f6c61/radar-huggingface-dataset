# emretmrk/Qwen3.5-4B-TR-Finance-Q4_K_M-GGUF

## Resumen

emretmrk/Qwen3.5-4B-TR-Finance-Q4_K_M-GGUF es la version cuantizada en formato GGUF (Q4_K_M) del modelo emretmrk/Qwen3.5-4B-TR-Finance, un ajuste fino del modelo base Qwen3.5 de 4B parametros orientado a dominio financiero y a los idiomas turco e ingles. Lo desarrolla el usuario independiente emretmrk y se distribuye bajo licencia Apache 2.0. La conversion a GGUF se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, lo que permite su ejecucion en CPU y GPU de consumo mediante llama.cpp y ecosistemas compatibles.

El modelo parte de una arquitectura transformer multimodal (pipeline image-text-to-text) con 4.205.751.296 parametros totales y un repositorio de 2,7 GB en su variante cuantizada. El entrenamiento combina preentrenamiento continuado (DAPT) sobre corpus turcos con ajuste supervisado (SFT) mediante LoRA/PEFT sobre datasets financieros turcos y de instrucciones, lo que lo hace relevante para tareas de analisis de sentimiento financiero, respuesta a preguntas sobre finanzas y generacion de texto especializado en turco.

Su interes practico radica en que ofrece un modelo de dominio especifico, ligero y ejecutable en hardware modesto, con soporte para texto e imagen, en un nicho (finanzas en turco) con poca oferta de modelos abiertos. Al estar en formato GGUF Q4_K_M, puede desplegarse localmente sin infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5 |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo original admite otras segun llama.cpp |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer multimodal con capacidad de procesar texto e imagen (pipeline image-text-to-text). El ajuste se realizo en dos fases segun las etiquetas de la model card: un preentrenamiento continuado especifico de dominio (DAPT) y un ajuste supervisado (SFT) mediante LoRA y PEFT. Los datasets empleados incluyen ituperceptron/turkish-financial-sentiment-256k (sentimiento financiero turco), umarigan/turkish_corpus (corpus general turco), umarigan/turkiye_finance_qa (preguntas y respuestas financieras), Dbmaxwell/turkish-finance-instruction-dataset (instrucciones financieras) y malhajar/alpaca-gpt4-tr (instrucciones generales traducidas al turco).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la especializacion en dominio financiero turco sobre un modelo base multimodal, con un proceso de cuantizacion Q4_K_M que reduce el peso a 2,7 GB manteniendo un equilibrio entre calidad y eficiencia.

## Capacidades

- Generacion de texto en turco e ingles, con especializacion en contenido financiero.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Analisis de sentimiento financiero en turco (entrenado sobre turkish-financial-sentiment-256k).
- Respuesta a preguntas sobre finanzas (entrenado sobre turkiye_finance_qa).
- Seguimiento de instrucciones generales y financieras (SFT sobre alpaca-gpt4-tr y turkish-finance-instruction-dataset).
- Capacidades multilingues limitadas a turco e ingles.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras turcas: el modelo puede clasificar y resumir el tono de articulos economicos en turco, aprovechando su entrenamiento especifico sobre el dataset turkish-financial-sentiment-256k.
- Asistente de preguntas y respuestas financieras: responde consultas sobre productos financieros, terminos economicos y datos de mercado en turco, apoyandose en el dataset turkiye_finance_qa.
- Generacion de informes financieros en turco: redacta resumenes y borradores de informes a partir de datos o instrucciones, adecuado por su SFT en instrucciones financieras.
- Extraccion de informacion de documentos con imagen: al ser multimodal, puede procesar capturas de tablas o graficos financieros y generar descripciones textuales.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M (2,7 GB), permite inferencia en CPU o GPU de consumo mediante llama.cpp, util para prototipos sin infraestructura cloud.
- Chatbot de atencion al cliente en banca turca: integrable en aplicaciones locales para resolver consultas frecuentes en turco con bajo coste de infraestructura.
- Filtrado y clasificacion de contenido financiero: puede etiquetar grandes volumenes de texto turco por tematica o sentimiento en pipelines de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con cuantizacion Q4_K_M (pesos de 2,7 GB mas overhead de contexto y cache KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM; tambien en Apple Silicon y CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y otros entornos compatibles con GGUF; el modelo original en safetensors puede servirse con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| emretmrk/Qwen3.5-4B-TR-Finance-Q4_K_M-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF | Finanzas en turco, multimodal |
| Qwen3.5-4B (base) | 4,2B | no disponible | Apache 2.0 | safetensors, GGUF | General, multimodal |
| Modelos financieros turcos abiertos de tamano similar | no disponible | no disponible | no disponible | no disponible | Finanzas en turco |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con corpus turcos y datasets financieros, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente como en cualquier LLM de 4B; especialmente critico en datos financieros, donde las cifras inventadas pueden tener consecuencias.
- Limitaciones de contexto e idioma: solo turco e ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y de los datasets empleados.
- Caveat para produccion: modelo de 4B con cuantizacion Q4_K_M, lo que reduce precision frente al original; no apto para asesoramiento financiero real sin validacion humana.
- No se documentan resultados de benchmarks ni evaluaciones de calidad, por lo que su rendimiento real debe validarse en el caso de uso concreto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/emretmrk/Qwen3.5-4B-TR-Finance-Q4_K_M-GGUF
- Modelo original: https://huggingface.co/emretmrk/Qwen3.5-4B-TR-Finance
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset ituperceptron/turkish-financial-sentiment-256k: https://huggingface.co/datasets/ituperceptron/turkish-financial-sentiment-256k
- Dataset umarigan/turkish_corpus: https://huggingface.co/datasets/umarigan/turkish_corpus
- Dataset umarigan/turkiye_finance_qa: https://huggingface.co/datasets/umarigan/turkiye_finance_qa
- Dataset Dbmaxwell/turkish-finance-instruction-dataset: https://huggingface.co/datasets/Dbmaxwell/turkish-finance-instruction-dataset
- Dataset malhajar/alpaca-gpt4-tr: https://huggingface.co/datasets/malhajar/alpaca-gpt4-tr
