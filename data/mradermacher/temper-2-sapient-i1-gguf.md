# mradermacher/Temper-2-Sapient-i1-GGUF

## Resumen

Temper-2-Sapient-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo Temper-2-Sapient, publicada por el usuario mradermacher. El modelo original lo desarrolla maylore-ai y esta construido sobre la arquitectura Qwen2, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones). Esta version no es un modelo nuevo, sino un conjunto de pesos cuantizados en formato GGUF pensados para inferencia local eficiente con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo de 7,6B parametros en hardware de consumo, algo inviable con los pesos completos en precision nativa. mradermacher publica tanto cuantizaciones estaticas (en el repo hermano Temper-2-Sapient-GGUF) como cuantizaciones ponderadas con imatrix (i1), que suelen ofrecer mejor calidad por bit que las estaticas de tamano equivalente.

El modelo esta etiquetado para ingles y ruso, con enfasis en codigo (etiquetas "code" y "rust") y uso conversacional. La licencia es Apache 2.0, lo que facilita su adopcion comercial. No obstante, la informacion disponible sobre el modelo base es muy limitada: no se detallan datos de entrenamiento, contexto maximo ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (segun etiqueta del autor) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; estaticas en repo hermano |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base sigue la arquitectura Qwen2, un transformer decoder-only con atencion por grupos (GQA) y RoPE, si bien no se detallan en la model card las dimensiones exactas de capas, cabezas de atencion ni la longitud de contexto nativa. El numero de parametros (7.615.616.512) es coherente con la familia Qwen2 de 7B, aunque no se confirma en la documentacion proporcionada.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas especificas del modelo base. La unica innovacion atribuible a esta publicacion es el uso de cuantizaciones ponderadas con imatrix (i1), generadas con la herramienta de mradermacher y el supercomputador de nicoboss, que ajustan la cuantizacion por capa segun la importancia de los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational".
- Generacion y asistencia de codigo, con enfasis declarado en Rust (etiquetas "code" y "rust").
- Soporte multilingue limitado a ingles y ruso.
- Compatible con endpoints (etiqueta "endpoints_compatible").
- Uso con la libreria transformers y con el ecosistema GGUF (llama.cpp y derivados).
- No se documentan capacidades de vision, audio, tool calling, agentes ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistencia de programacion en Rust: el modelo esta etiquetado explicitamente para codigo y Rust, por lo que puede usarse como autocompletado o generador de fragmentos en editores e IDE mediante integracion con llama.cpp.
- Inferencia local en portatiles: las cuantizaciones i1-Q2_K (3,1 GB) y Q4_K_M permiten ejecutar el modelo en equipos sin GPU dedicada o con GPU de gama media, gracias al formato GGUF.
- Prototipado rapido de chatbots conversacionales: la etiqueta "conversational" y el soporte de transformers facilitan montar un asistente de prueba en ingles o ruso sin infraestructura cloud.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local, es apto para procesar texto sensible sin enviar datos a terceros.
- Generacion de documentacion tecnica y comentarios de codigo en ingles y ruso, aprovechando el sesgo del modelo hacia contenido tecnico.
- Experimentacion academica con cuantizaciones: el fichero imatrix publicado permite generar cuantizaciones propias y comparar calidad entre niveles, util para investigacion sobre compresion de modelos.
- Evaluacion comparativa de cuantizaciones: el repo hermano de cuantizaciones estaticas permite contrastar i1 frente a estaticas en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB para i1-Q2_K; entre 4 y 5 GB para cuantizaciones de 4 bits (Q4_K_M, IQ4_XS); en torno a 6-7 GB para Q6_K; los pesos completos en fp16 requeririan ~15 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones mas altas; A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas para cuantizaciones de 4 bits; las de 2-3 bits caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Temper-2-Sapient-i1-GGUF | ~7,6B | no disponible | en, ru | Apache 2.0 | GGUF |
| Qwen2-7B-Instruct (referencia de arquitectura) | ~7,6B | 128K (segun documentacion publica de Qwen2) | multilingue | Apache 2.0 | safetensors, GGUF |
| Mistral-7B-Instruct | ~7,2B | 32K | en | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | ~8B | 128K | multilingue | Llama 3.1 Community | safetensors, GGUF |

La comparativa con Qwen2-7B-Instruct se ofrece solo como referencia de la familia arquitectonica; no se dispone de datos que confirmen que Temper-2-Sapient herede sus capacidades o contexto. Para Mistral-7B y Llama-3.1-8B se citan datos publicos de sus respectivas documentaciones, no mediciones sobre este modelo.

## Limitaciones y advertencias

- La model card del modelo base no documenta sesgos conocidos; al ser un modelo derivado sin informacion de alineacion, el riesgo de sesgos en ingles y ruso es real pero no cuantificado.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Idiomas limitados a ingles y ruso; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite real.
- Las cuantizaciones de 2 bits (Q2_K, IQ2_XXS) degradan la calidad de forma notable; el propio autor sugiere IQ3_XXS como alternativa preferible a i1-Q2_K.
- El repo ocupa 48,7 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base no imponga restricciones adicionales no reflejadas en la etiqueta.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Temper-2-Sapient-i1-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Sapient
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Temper-2-Sapient-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Temper-2-Sapient-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
