# mradermacher/llama3.1_korean_v1.5_sft_by_aidx-GGUF

## Resumen

`mradermacher/llama3.1_korean_v1.5_sft_by_aidx-GGUF` es la distribucion en formato GGUF del modelo `SEOKDONG/llama3.1_korean_v1.5_sft_by_aidx`, un ajuste fino supervisado (SFT) de Llama 3.1 orientado especificamente al idioma coreano. El modelo original parte de la arquitectura Llama 3.1 de Meta (8.030.261.312 parametros, es decir, la variante de 8B) y ha sido afinado por el usuario SEOKDONG utilizando el dataset `AIDX-ktds/ko_leaderboard`, un conjunto de datos vinculado a la evaluacion de modelos en coreano. mradermacher se limita a producir las cuantizaciones estaticas en GGUF para facilitar su despliegue en hardware de consumo.

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar un modelo afinado en coreano sobre llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter. Al estar basado en Llama 3.1 8B, hereda la ventana de contexto de 128.000 tokens de la familia original y el tokenizador multilingue de Meta, aunque el ajuste fino se ha centrado exclusivamente en coreano.

No se dispone de informacion publicada sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion exacta del dataset, uso de RLHF/DPO) ni de resultados de benchmarks en la informacion proporcionada. Esta ficha documenta lo que se puede verificar: arquitectura heredada, tamanos de cuantizacion reales y consideraciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, heredada del modelo base) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens, pero no se confirma que el ajuste fino lo preserve) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko); el tokenizador base es multilingue pero el ajuste fino se orienta a coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU. El modelo ha sido sometido a un ajuste fino supervisado (SFT) por parte de SEOKDONG sobre el dataset `AIDX-ktds/ko_leaderboard`, orientado a tareas evaluadas en el ranking de liderazgo coreano. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO.

Las cuantizaciones han sido generadas por mradermacher mediante conversion desde el formato Hugging Face (`convert_type: hf`) y cuantizacion estatica (`quantize_version: 2`, `output_tensor_quantised: 1`). El autor indica que no se han producido cuantizaciones ponderadas/imatrix para este modelo en el momento de la publicacion, por lo que solo estan disponibles las estaticas. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de Llama 3.1.

## Capacidades

- Generacion de texto conversacional en coreano, heredando la capacidad generativa de Llama 3.1 8B.
- Razonamiento y respuesta a instrucciones en coreano, tras el ajuste fino SFT.
- Soporte de conversaciones multi-turno (el pipeline declarado es `conversational` en los tags).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades multilingues limitadas al tokenizador base de Llama 3.1; el ajuste fino se centra en coreano, por lo que el rendimiento en otros idiomas no esta documentado.
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano gracias a su ajuste SFT sobre datos de evaluacion coreanos, adecuado para chatbots de soporte orientados a usuarios surcoreanos.
- Clasificacion y etiquetado de textos en coreano: util para moderacion de contenido, analisis de sentimiento o categorizacion de tickets en empresas que operan en coreano.
- Generacion de resumenes de documentos en coreano: apropiado para resumir articulos, informes o correos en entornos donde el coreano es el idioma principal.
- Asistencia a la redaccion en coreano: generacion de borradores, correos y respuestas con estilo consistente, aprovechando la capacidad conversacional del modelo.
- Despliegue en local o edge: al estar disponible en GGUF desde Q2_K (3,3 GB) hasta Q8_0 (8,6 GB), puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPUs de consumo, lo que lo hace util para prototipado rapido y entornos con restricciones de privacidad.
- Investigacion en NLP coreano: sirve como punto de partida para experimentos de evaluacion comparativa en el ranking `ko_leaderboard` y para estudiar el efecto del ajuste fino SFT sobre Llama 3.1 en coreano.
- Integracion en pipelines de inferencia locales: compatible con llama.cpp y servidores compatibles con GGUF, adecuado para entornos de desarrollo que requieren control total sobre los pesos y la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 3,3 GB (Q2_K), 4,8-5,0 GB (Q4_K_S/Q4_K_M), 6,7 GB (Q6_K), 8,6 GB (Q8_0) y 16,2 GB (f16). A estas cifras hay que sumar el espacio para la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar las cuantizaciones Q4 en adelante; una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB permiten ejecutar Q8_0 o f16 con holgura. Para f16 con contexto largo se recomienda una A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas para cuantizaciones Q4/Q5; las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en GPUs con 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o servidores OpenAI-compatibles que acepten GGUF). No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| llama3.1_korean_v1.5_sft_by_aidx-GGUF (este) | 8B | no disponible (base: 128k) | coreano | Apache 2.0 | GGUF |
| Llama 3.1 8B Instruct (Meta) | 8B | 128.000 tokens | multilingue | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5 7B Instruct | 7B | 128.000 tokens | multilingue (incluye coreano) | Apache 2.0 | safetensors, GGUF |
| EXAONE 3.5 (LG AI Research) | 2.4B / 7.8B | 32.000 tokens | coreano e ingles | licencia propia (no comercial en algunas variantes) | safetensors |

La comparativa se basa en caracteristicas conocidas de los modelos alternativos; no se dispone de resultados de benchmarks de este modelo para comparar rendimiento numerico. La principal diferencia de este modelo frente a Llama 3.1 8B Instruct es su especializacion en coreano mediante SFT, mientras que frente a Qwen2.5 o EXAONE la licencia Apache 2.0 es un punto favorable para uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Llama 3.1, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de 8B, puede producir contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado.
- Limitaciones de contexto o idioma: el ajuste fino se centra en coreano; el rendimiento en otros idiomas no esta documentado y podria degradarse respecto al modelo base. No se confirma que el ajuste fino preserve la ventana de 128.000 tokens de Llama 3.1.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial; sin embargo, conviene verificar la licencia del modelo base original (`SEOKDONG/llama3.1_korean_v1.5_sft_by_aidx`) y de Llama 3.1, ya que la licencia Apache 2.0 declarada en el repo GGUF puede no reflejar todas las restricciones heredadas.
- Caveats para produccion: solo hay cuantizaciones estaticas (sin imatrix), lo que puede suponer una ligera perdida de calidad frente a cuantizaciones ponderadas en tamanos pequenos (Q2_K, Q3_K). No se han publicado evaluaciones formales de calidad ni de seguridad.
- El modelo tiene muy pocas descargas (161) y cero likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llama3.1_korean_v1.5_sft_by_aidx-GGUF
- Modelo base original: https://huggingface.co/SEOKDONG/llama3.1_korean_v1.5_sft_by_aidx
- Dataset utilizado: https://huggingface.co/datasets/AIDX-ktds/ko_leaderboard
- Pagina de descargas del autor: https://hf.tst.eu/model#llama3.1_korean_v1.5_sft_by_aidx-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
