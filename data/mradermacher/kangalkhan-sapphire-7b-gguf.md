# mradermacher/KangalKhan-Sapphire-7B-GGUF

## Resumen

KangalKhan-Sapphire-7B-GGUF es la distribucion en formato GGUF del modelo KangalKhan-Sapphire-7B, un merge de modelos Mistral-7B realizado con mergekit (lazymergekit) y publicado por el usuario Yuma42. Esta ficha concreta corresponde a las cuantizaciones estaticas generadas por mradermacher, un prolifico publicador de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp, Ollama y otros runners compatibles con GGUF.

El modelo resultante combina dos modelos derivados de Mistral-7B: CapybaraHermes-2.5-Mistral-7B (de argilla), orientado a conversacion de alta calidad, y distilabeled-OpenHermes-2.5-Mistral-7B (tambien de argilla), orientado a instrucciones y datos sinteticos destilados. El merge busca combinar las fortalezas conversacionales de CapybaraHermes con la amplitud de instrucciones de OpenHermes, manteniendo la arquitectura base de Mistral-7B (transformer decoder-only con 7.241.748.480 parametros).

El modelo esta publicado bajo licencia Apache 2.0, solo soporta ingles segun la model card, y su relevancia principal es practica: ofrece una variante de 7B cuantizada lista para desplegar en hardware de consumo, con un tamano de repo de 63,9 GB que incluye todas las cuantizaciones (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB). No hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (merge de Mistral-7B via mergekit/lazymergekit) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B: un transformer decoder-only con 7.241.748.480 parametros. Este artefacto concreto no es un modelo entrenado desde cero, sino un merge de pesos realizado con mergekit (lazymergekit) a partir de dos modelos derivados de Mistral-7B: argilla/CapybaraHermes-2.5-Mistral-7B y argilla/distilabeled-OpenHermes-2.5-Mistral-7B. La model card no detalla el metodo exacto de merge (por ejemplo, si fue SLERP, TIES, DARE o linear), ni los hiperparametros usados, ni datos sobre el entrenamiento original de los modelos fuente.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF o DPO en este merge. El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf); el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles por su parte en el momento de publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de los modelos CapybaraHermes y OpenHermes.
- Seguimiento de instrucciones derivado de los datasets de instrucciones de los modelos fuente.
- Razonamiento multi-turno y conversacion, dado el origen CapybaraHermes del merge.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible (no confirmado en la informacion proporcionada).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en ingles y desplegarse en estaciones de trabajo con GPU de consumo usando las cuantizaciones Q4_K_M o Q5_K_M, gracias a su tamano de 7B parametros.
- Prototipado rapido de chatbots: con la cuantizacion Q4_K_S (4,2 GB) se puede levantar un endpoint compatible con la API de OpenAI en Ollama o llama.cpp y iterar sobre prompts sin coste de infraestructura cloud.
- Generacion de texto asistida en entornos con recursos limitados: la variante Q2_K (2,8 GB) permite ejecutar el modelo incluso en GPUs con poca VRAM o en CPU, util para pruebas de humo y demos.
- Evaluacion comparativa de merges: investigadores que estudian tecnicas de model merging pueden usar este GGUF como referencia practica de como se comporta un merge CapybaraHermes + OpenHermes frente a sus componentes individuales.
- Fine-tuning posterior sobre datos propios en ingles: al estar bajo Apache 2.0 y con pesos disponibles en safetensors en el modelo base, se puede partir de el para ajuste supervisado con LoRA en tareas especificas de dominio.
- Despliegue en pipelines de CI para pruebas de regresion de prompts: la cuantizacion Q8_0 (7,8 GB) ofrece la mejor calidad dentro del formato GGUF y permite comparar respuestas de forma reproducible en tests automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: para f16, GPU con 16-24 GB (RTX 4090, A100 40GB, H100); para Q8_0, GPU con 10-12 GB (RTX 3080 12GB, RTX 4070 Ti); para Q4_K_M, GPU con 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU de consumo: si, desde Q2_K hasta Q5_K_M en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KangalKhan-Sapphire-7B-GGUF | 7.241.748.480 | no disponible | Apache 2.0 | GGUF | Merge CapybaraHermes + OpenHermes |
| CapybaraHermes-2.5-Mistral-7B | ~7B | no disponible | no disponible | safetensors | Componente del merge, orientado a conversacion |
| distilabeled-OpenHermes-2.5-Mistral-7B | ~7B | no disponible | no disponible | safetensors | Componente del merge, orientado a instrucciones |
| Mistral-7B (base) | 7.241.748.480 | 32.768 (segun Mistral, no confirmado aqui) | Apache 2.0 | safetensors/GGUF | Modelo original del que derivan todos |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de datasets de instrucciones en ingles, es probable que herede sesgos de esos datasets, pero no hay documentacion al respecto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos de 7B tienden a alucinar en tareas factuales abiertas, especialmente con cuantizaciones bajas (Q2_K, Q3_K_S).
- Limitaciones de contexto o idioma: la model card solo declara ingles; no se especifica la longitud de contexto efectiva del merge, que puede diferir de la del Mistral-7B original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos fuente (CapybaraHermes y OpenHermes) antes de redistribuir o desplegar en produccion.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; las cuantizaciones ponderadas/imatrix no estan disponibles por parte de mradermacher; el modelo es un merge comunitario sin benchmarks publicados, por lo que su rendimiento real frente a los componentes individuales no esta verificado.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/KangalKhan-Sapphire-7B-GGUF
- Modelo base: https://huggingface.co/Yuma42/KangalKhan-Sapphire-7B
- Componente del merge: https://huggingface.co/argilla/CapybaraHermes-2.5-Mistral-7B
- Componente del merge: https://huggingface.co/argilla/distilabeled-OpenHermes-2.5-Mistral-7B
- Pagina de descargas del autor: https://hf.tst.eu/model#KangalKhan-Sapphire-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
