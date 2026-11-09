# mradermacher/jais-family-13b-GGUF

## Resumen

`mradermacher/jais-family-13b-GGUF` es una distribucion de cuantizaciones GGUF del modelo `inception42/jais-family-13b`, un modelo de lenguaje causal de tipo decoder con 13.462.730.240 parametros (aproximadamente 13,5 mil millones) orientado a arabe e ingles. El autor de las cuantizaciones es mradermacher, que publica versiones estaticas en formato GGUF para su uso con llama.cpp y entornos compatibles, mientras que el modelo base procede del repositorio de inception42.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo bilingue arabe-ingles de 13B en hardware de consumo, algo poco habitual en el ecosistema open source, donde la mayoria de modelos de este tamano estan centrados en ingles y lenguas europeas. La licencia Apache 2.0 del modelo base facilita su adopcion comercial, aunque conviene verificar las condiciones del modelo original.

No se dispone de informacion publica en la documentacion proporcionada sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks del modelo base. Esta ficha se limita a los datos verificables del repositorio y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (causal-lm), segun tags del repositorio |
| Parametros totales | 13.462.730.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder causal (`causal-lm`) con 13.462.730.240 parametros. Los tags del repositorio indican que pertenece a la familia `jais-family` y que esta orientado a generacion de texto en arabe e ingles. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base.

El repositorio aqui descrito no contiene el modelo original, sino cuantizaciones estaticas GGUF generadas por mradermacher a partir de `inception42/jais-family-13b`. Segun la model card, las cuantizaciones con imatrix (weighted/imatrix quants) se publican en un repositorio separado (`mradermacher/jais-family-13b-i1-GGUF`), lo que sugiere que este repositorio contiene unicamente cuantizaciones estaticas sin calibracion por importancia.

## Capacidades

- Generacion de texto causal en arabe e ingles, segun los idiomas declarados en el repositorio.
- Modelo base sin ajuste de instrucciones declarado: la model card no menciona fine-tuning instructivo, por lo que su uso principal es la continuacion de texto y el ajuste posterior.
- No se declara soporte de tool calling ni function calling en la informacion disponible.
- No se declara soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- No se declara capacidad de vision, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingues limitadas a arabe e ingles segun los metadatos.

## Casos de uso

- Generacion de contenido en arabe: el modelo puede emplearse para redactar articulos, resumenes o textos divulgativos en arabe, aprovechando que es uno de los pocos modelos abiertos de 13B con cobertura nativa de este idioma.
- Traduccion arabe-ingles y ingles-arabe: al estar entrenado en ambos idiomas, puede usarse como base para tareas de traduccion mediante prompting o fine-tuning supervisado.
- Chatbot bilingue para atencion al cliente en mercados arabohablantes: desplegado con llama.cpp u Ollama en infraestructura local, permite conversaciones en arabe e ingles sin depender de APIs externas.
- Ajuste fino (fine-tuning) para dominios especificos: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para adaptar a sectores como legal, sanitario o educativo en arabe.
- Procesamiento de documentos y clasificacion de texto en arabe: tareas de etiquetado, extraccion de entidades o resumen de documentos que requieran un modelo local con cuantizacion Q4_K_M (9,1 GB) ejecutable en GPU de consumo.
- Experimentacion e investigacion en PLN arabe: util para investigadores que necesiten un modelo de referencia de 13B en formato GGUF para comparativas o prototipos sin acceso a clusters de gran escala.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (5,5 GB) y Q3_K_S (6,4 GB) permiten ejecutar el modelo en GPUs de 8 GB de VRAM o incluso en CPU con RAM suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~5,5 GB; Q3_K_S ~6,4 GB; Q3_K_M ~7,4 GB; IQ4_XS ~7,5 GB; Q3_K_L ~7,7 GB; Q4_K_S ~8,2 GB; Q4_K_M ~9,1 GB; Q5_K_S ~9,6 GB; Q5_K_M ~10,5 GB; Q6_K ~11,8 GB; Q8_0 ~14,4 GB.
- GPU recomendadas: para Q4_K_M y superiores, RTX 3090/4090 (24 GB) o A100/H100 para despliegues con mayor concurrencia; para Q2_K y Q3_K_S, GPUs de 8 GB como RTX 3060 Ti/4060 Ti.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q4_K_M), RTX 4060 Ti 16 GB (Q5_K_M), RTX 3090/4090 (Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara `endpoints_compatible` y `transformers` como libreria.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jais-family-13b (este repo, GGUF) | 13,46B | no disponible | ar, en | Apache 2.0 | GGUF |
| Jais-13b (familia original, referencia) | ~13B | no disponible | ar, en | no disponible en esta ficha | safetensors |
| Modelos 13B genericos en ingles (p. ej. Llama 2 13B) | ~13B | no disponible | principalmente en | licencia propia | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, idiomas y licencia; los datos de contexto y benchmarks de los modelos alternativos no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo declarado: puede requerir prompting cuidadoso o fine-tuning para tareas conversacionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Cobertura limitada a arabe e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana larga para tareas de contexto extendido.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; la model card recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- Licencia Apache 2.0 del modelo base: permite uso comercial, pero conviene verificar las condiciones del repositorio original `inception42/jais-family-13b` antes de desplegar en produccion.
- El repositorio tiene un tamano de 97,0 GB, por lo que la descarga completa de todas las cuantizaciones es costosa en ancho de banda y almacenamiento; se recomienda descargar solo la cuantizacion necesaria.
- No se declara soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos sin capas adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/jais-family-13b-GGUF
- Modelo base: https://huggingface.co/inception42/jais-family-13b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/jais-family-13b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#jais-family-13b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
