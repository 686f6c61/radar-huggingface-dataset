# mradermacher/Starstreak-7b-alpha-GGUF

## Resumen

Starstreak-7b-alpha-GGUF es la distribucion en formato GGUF del modelo Starstreak-7b-alpha, desarrollado originalmente por azale-ai y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,24 mil millones) orientado a generacion de texto conversacional, con especial enfasis en indonesio y otras lenguas del sudeste asiatico (javanés, sundanés y malayo), ademas de ingles. La relevancia de esta publicacion radica en que pone a disposicion del ecosistema llama.cpp y Ollama una amplia gama de cuantizaciones estaticas (desde Q2_K hasta f16) del modelo original, lo que permite ejecutarlo en hardware de consumo.

El modelo base fue entrenado sobre datos derivados de graelo/wikipedia y uonlp/CulturaX, dos conjuntos multilingues de gran escala. La ficha que nos ocupa corresponde exclusivamente a la version cuantizada: no se aportan detalles sobre la arquitectura interna, el numero de tokens de entrenamiento ni el proceso de alineacion del modelo original, por lo que varios apartados tecnicos se marcan como no disponibles.

La licencia CC0-1.0 (dominio publico) es un punto diferencial relevante para uso comercial sin restricciones atribucionales, si bien conviene verificar la licencia del modelo base original antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar en la informacion) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, id, jv, su, ms |
| Licencia | cc0-1.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base azale-ai/Starstreak-7b-alpha en la documentacion proporcionada. Por el tamano (7,24 mil millones de parametros) y el ecosistema de publicacion (transformers, GGUF), se trata presumiblemente de un transformer decoder-only, pero este extremo no se confirma explicitamente en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o SFT.

Lo unico documentado es el origen de los datos: los conjuntos graelo/wikipedia y uonlp/CulturaX, ambos corpus multilingues de gran escala que incluyen contenido en indonesio, javanés, sundanés, malayo e ingles. Esta combinacion sugiere un entrenamiento orientado a cobertura linguistica del archipiélago indonesio y Malasia, mas que a un rendimiento puntero en razonamiento o codigo.

La publicacion que nos ocupa es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) generada por mradermacher. Existe ademas una version con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/Starstreak-7b-alpha-i1-GGUF, que suele ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Cobertura multilingue centrada en indonesio (id), javanés (jv), sundanés (su) y malayo (ms), ademas de ingles (en).
- Capacidad de procesamiento de texto en el marco de transformers y de llama.cpp/Ollama gracias al formato GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio, thinking mode ni otras capacidades multimodales.
- No se documenta capacidad especifica de codigo o matematicas.

## Casos de uso

- Atencion al cliente en indonesio y malayo: el modelo puede gestionar conversaciones multi-turno en lenguas del sudeste asiatico, un nicho con poca oferta de modelos abiertos especializados; su licencia CC0 facilita el despliegue comercial sin fricciones legales.
- Procesamiento de contenido wikipedia y CulturaX: adecuado para tareas de resumen, reescritura o extraccion de informacion sobre corpus enciclopedicos en indonesio, javanés y sundanés, dado que esos datasets forman parte de su entrenamiento.
- Traduccion asistida entre ingles e indonesio/malayo: el modelo cubre ambos extremos del par linguistico, lo que permite usarlo como base para pipelines de traduccion de bajo coste en entornos con GPU de consumo.
- Despliegue en hardware de consumo con Ollama o llama.cpp: las cuantizaciones Q4_K_S (4,2 GB) y Q4_K_M (4,5 GB) caben en GPUs de 6-8 GB de VRAM, lo que habilita prototipos locales en portatiles con RTX 3060 o superiores.
- Chatbot de soporte para comunidades locales: al cubrir javanés y sundanés, puede emplearse en asistentes para servicios publicos o educativos en Indonesia, donde el indonesio estandar no siempre es la lengua preferida del usuario.
- Generacion de contenido editorial multilingue: redaccion de borradores, variaciones de texto o adaptaciones culturales para medios digitales que publican en varias lenguas del archipiélago.
- Investigacion academica sobre modelos multilingues de bajo recursos: su licencia CC0 y su tamano contenido lo hacen util como linea base reproducible en estudios de NLP para lenguas austronesias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 8 GB o una RTX 4060; para Q6_K y Q8_0 se recomienda RTX 4070/4080 (12-16 GB); para f16 se necesita una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q4_K_M en adelante requieren 8 GB o mas; Q2_K y Q3_K_S caben en GPUs de 4-6 GB).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El repositorio tambien incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Starstreak-7b-alpha-GGUF (este) | 7,24 B | no disponible | en, id, jv, su, ms | cc0-1.0 | GGUF |
| Modelos 7B genericos tipo Llama/Mistral | ~7 B | no disponible en esta ficha | mayoritariamente en | licencias variables | safetensors, GGUF |
| Modelos multilingues del sudeste asiatico (p. ej. SeaLLM, Sailor) | variable | no disponible | id, ms, th, vi, etc. | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, idiomas y licencia. La principal ventaja diferencial de este modelo es la licencia CC0-1.0 y la cobertura de lenguas regionales indonesias (jv, su) que rara vez aparecen en modelos abiertos de 7B.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero un modelo entrenado sobre Wikipedia y CulturaX hereda los sesgos de esas fuentes, incluyendo posibles desequilibrios de representacion entre lenguas mayoritarias y regionales.
- Riesgo de alucinacion no cuantificado: al no publicarse benchmarks, no hay evidencia empirica sobre su fiabilidad factual.
- Longitud de contexto desconocida: no se puede garantizar el manejo de contextos largos sin verificar experimentalmente el valor configurado en el modelo base.
- Cobertura linguistica limitada a cinco idiomas; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La licencia CC0-1.0 aplica a esta cuantizacion, pero conviene verificar la licencia del modelo base azale-ai/Starstreak-7b-alpha antes de un despliegue comercial, ya que podria imponer condiciones adicionales.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable (la propia model card marca Q3_K_M como "lower quality"); para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 63,9 GB, lo que implica descargas considerables si se quieren todas las variantes; conviene descargar solo el archivo GGUF necesario.
- No hay informacion sobre tool calling, agentes o modo thinking, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Starstreak-7b-alpha-GGUF
- Modelo base original: https://huggingface.co/azale-ai/Starstreak-7b-alpha
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Starstreak-7b-alpha-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Starstreak-7b-alpha-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset graelo/wikipedia: https://huggingface.co/datasets/graelo/wikipedia
- Dataset uonlp/CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
