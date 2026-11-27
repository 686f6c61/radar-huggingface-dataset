# mradermacher/sardi-dream-7b-GGUF

## Resumen

sardi-dream-7b-GGUF es la version cuantizada en formato GGUF del modelo pauljngr/sardi-dream-7b, un modelo de lenguaje de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) que se presenta como un modelo de difusion para lenguaje (diffusion-language-model) orientado a generacion aumentada por recuperacion (RAG) y question answering multi-salto (multi-hop QA). La cuantizacion la firma mradermacher, un conocido empaquetador de pesos GGUF para llama.cpp, y el resultado esta publicado bajo licencia Apache 2.0.

El modelo base se distribuye con la libreria transformers y esta etiquetado como conversational, lo que indica que admite interacciones de tipo chat. Su enfoque declarado —RAG y multi-hop QA— lo situa en el nicho de asistentes documentales y sistemas de respuesta sobre corpus, mas que en el de modelos generalistas de proposito amplio. El hecho de que sea un modelo de difusion (y no un transformer autorregresivo clasico) es la caracteristica tecnica mas diferencial de la ficha.

Esta version concreta es relevante porque traduce el modelo original a un formato que se puede ejecutar localmente con llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones desde Q2_K hasta f16. El repositorio ocupa 68,1 GB en total y acumula 191 descargas en el momento de la consulta. Solo soporta ingles segun los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | diffusion-language-model (modelo de difusion para lenguaje); detalles de la red no disponibles |
| Parametros totales | 7.615.616.512 (aprox. 7,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un diffusion-language-model, es decir, un modelo de lenguaje que genera texto mediante un proceso de difusion en lugar de decodificacion autorregresiva token a token. Los metadatos no detallan el numero de pasos de difusion, el esquema de ruido, la variante concreta de difusion (por ejemplo, difusion discreta sobre tokens o continua sobre embeddings) ni la composicion arquitectonica interna (capas, dimensiones, atencion). Tampoco se especifica la longitud de contexto nativa.

No se han publicado en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Las etiquetas del modelo (retrieval-augmented-generation, multi-hop-qa, conversational) sugieren un ajuste orientado a tareas de recuperacion y razonamiento multi-salto, pero se desconoce el detalle del pipeline. Esta version GGUF es una conversion estatica del modelo base pauljngr/sardi-dream-7b mediante la herramienta de mradermacher; el autor de la cuantizacion indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del modelo.
- Question answering multi-salto (multi-hop QA): el modelo esta etiquetado especificamente para responder preguntas que requieren combinar informacion de varias fuentes o pasos de razonamiento.
- Generacion aumentada por recuperacion (RAG): orientado a integrarse en pipelines donde se le proporciona contexto recuperado de un corpus.
- Generacion mediante difusion: el proceso de generacion no es autorregresivo clasico, lo que puede ofrecer ventajas en determinados regimenes de generacion (no se detallan en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente mas alla de la etiqueta multi-hop-qa.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de documentacion interna con RAG: el modelo esta etiquetado para retrieval-augmented-generation, por lo que puede recibir fragmentos recuperados de una base documental y generar respuestas fundamentadas en ellos. Adecuado para bases de conocimiento corporativas en ingles.
- Respuesta a preguntas multi-salto sobre corpus tecnicos: preguntas que exigen encadenar informacion de varios documentos (por ejemplo, comparar especificaciones de dos productos descritos en manuales distintos) encajan con la etiqueta multi-hop-qa.
- Chatbot de soporte en ingles: al ser un modelo conversacional de 7,6 mil millones de parametros, puede desplegarse en una GPU de consumo con cuantizacion Q4_K_M (4,8 GB) para atencion al cliente de dominio limitado.
- Prototipado local de sistemas RAG: gracias a las cuantizaciones GGUF y a su tamano contenido, permite iterar en local con llama.cpp u Ollama antes de escalar a infraestructura mayor.
- Investigacion sobre modelos de difusion para lenguaje: util para experimentar con generacion por difusion en tareas de QA y comparar su comportamiento frente a transformers autorregresivos de tamano similar.
- Evaluacion de pipelines de recuperacion: al estar orientado a RAG, sirve como componente generador en experimentos donde se mide la calidad de la recuperacion y su impacto en la respuesta final.
- Despliegue en entornos con recursos limitados: la version Q2_K (3,1 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 3,1 GB; Q3_K_S 3,6 GB; Q3_K_M 3,9 GB; Q3_K_L 4,2 GB; IQ4_XS 4,4 GB; Q4_K_S 4,6 GB; Q4_K_M 4,8 GB; Q5_K_S 5,4 GB; Q5_K_M 5,5 GB; Q6_K 6,4 GB; Q8_0 8,2 GB; f16 15,3 GB.
- GPU recomendadas: no disponibles de forma especifica en la informacion. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar cualquier cuantizacion con holgura; una RTX 3060 de 12 GB cubre hasta Q8_0.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) caben en GPUs de 8 GB; Q8_0 (8,2 GB) requiere al menos 10-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y LM Studio mediante importacion del GGUF; el modelo base es compatible con transformers. No se confirma soporte en vLLM ni TGI para esta variante de difusion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sardi-dream-7b-GGUF | 7,6 B | no disponible | Apache 2.0 | GGUF | Difusion para lenguaje, RAG y multi-hop QA, solo ingles |
| Modelos transformer autorregresivos de ~7 B (genericos) | ~7 B | variable | variable | safetensors/GGUF | No disponible comparativa numerica en la informacion proporcionada |
| Alternativas de difusion para lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos; no se debe asumir calidad en castellano u otros idiomas.
- No hay informacion sobre sesgos conocidos del modelo base ni sobre su proceso de alineacion.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas RAG y multi-hop QA conviene anclar las respuestas a las fuentes recuperadas y verificar la salida.
- La longitud de contexto no esta documentada, lo que impide planificar el tamano de los fragmentos recuperados en un pipeline RAG.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad.
- No hay cuantizaciones imatrix ponderadas disponibles en el momento de la publicacion, lo que limita la calidad potencial en tamanos pequenos.
- Al ser un modelo de difusion, el soporte en herramientas de inferencia puede ser mas limitado que el de transformers autorregresivos; verificar compatibilidad antes de desplegar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente debe verificarse por si impone condiciones adicionales (la informacion indica Apache 2.0 en el modelo base).
- El modelo no declara soporte de tool calling ni de agentes, por lo que no deberia asumirse en disenos de sistemas agenticos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/sardi-dream-7b-GGUF
- Modelo base: https://huggingface.co/pauljngr/sardi-dream-7b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#sardi-dream-7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
