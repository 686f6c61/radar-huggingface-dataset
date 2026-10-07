# mradermacher/OpenJev-1.7B-GGUF

## Resumen

OpenJev-1.7B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo alanhuangya/OpenJev-1.7B, publicado por el usuario mradermacher. No se trata de un modelo nuevo, sino de una conversión a GGUF (conversion de pesos de transformers a llama.cpp, "convert_type: hf") pensada para ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otras herramientas compatibles con este formato. El modelo base cuenta con 1.720.574.976 parametros (aproximadamente 1,72 mil millones) y el repositorio ocupa 16,0 GB en total, repartidos entre doce variantes de cuantizacion.

Por las etiquetas y los conjuntos de datos declarados (Mind2Web, nnetnav-live, typed-decisions, tasksource-jev, jev-distill-corpus-v3, typed-decisions-synth), el modelo se posiciona como un "decision-model" orientado a agentes de navegador ("browser-agent") y a un esquema de razonamiento rapido tipo "system one". Tambien aparece la etiqueta "lora", lo que sugiere que el modelo base fue ajustado mediante LoRA, aunque la model card disponible no detalla el proceso.

La relevancia actual radica en que permite desplegar un modelo de decision de ~1,7 B en local con requisitos de memoria muy bajos (desde 0,9 GB en Q2_K hasta 3,5 GB en f16), lo que facilita experimentar con agentes de navegador y politicas de decision sin depender de APIs externas. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura; el repositorio se publica bajo la libreria transformers) |
| Parametros totales | 1.720.574.976 (≈1,72 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (distribucion); safetensors en el modelo base |
| Modelo base | alanhuangya/OpenJev-1.7B |
| Cuantizado por | mradermacher |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base. Los metadatos de la conversion indican unicamente "quantize_version: 2", "output_tensor_quantised: 1" y "convert_type: hf", es decir, que los pesos originales en formato Hugging Face se convirtieron a GGUF y se cuantizaron tensor a tensor. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto soportada, por lo que estos datos deben consultarse en la model card del modelo base.

En cuanto al entrenamiento, la model card lista seis conjuntos de datos: osunlp/Mind2Web y stanfordnlp/nnetnav-live (ambos orientados a agentes de navegacion web y datos de interaccion con paginas), LocalLLaMA/typed-decisions y n4ze3m/typed-decisions-synth (decisiones tipadas), tasksource/tasksource-jev y SargeDev/jev-distill-corpus-v3 (corpus de destilacion). La combinacion sugiere un ajuste supervisado sobre trazas de decision y navegacion, probablemente con destilacion desde un modelo mayor, aunque no se detalla el numero de tokens, la composicion exacta ni si se emplearon tecnicas de RLHF o DPO. La etiqueta "system-one" apunta a un uso como componente de respuesta rapida dentro de una arquitectura de agente con separacion entre decisiones rapidas y razonamiento deliberado.

## Capacidades

- Generacion de texto conversacional en ingles, con el pipeline declarado como "conversational".
- Toma de decisiones tipadas ("typed decisions"), segun las etiquetas y los datasets typed-decisions y typed-decisions-synth.
- Uso como modelo de decision en agentes de navegador web, segun las etiquetas "browser-agent" y "decision-model" y los datasets Mind2Web y nnetnav-live.
- Componente "system one" para decisiones rapidas dentro de un pipeline de agente de varios pasos.
- Ajuste mediante LoRA segun la etiqueta "lora" (aplicado en el modelo base; el repositorio GGUF solo distribuye los pesos convertidos).
- Ejecucion local mediante llama.cpp y compatibles, con doce niveles de cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision, audio o modos de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo "language".

## Casos de uso

- Automatizacion de navegador web: el modelo puede emplearse como politica de decision que, a partir del estado de una pagina y del objetivo del usuario, selecciona la siguiente accion (clic, escritura, navegacion). Es adecuado por su entrenamiento declarado sobre Mind2Web y nnetnav-live y por su tamano reducido, que permite ejecutarlo en la misma maquina que controla el navegador.
- Etiquetado y clasificacion de decisiones tipadas: dado un contexto y un conjunto de opciones, el modelo puede asignar decisiones a categorias tipadas, integrándose en pipelines de anotacion o de enrutamiento de flujos.
- Componente rapido en arquitecturas de dos sistemas: al etiquetarse como "system-one", encaja como modulo de respuesta inmediata que filtra o resuelve casos sencillos y delega los complejos en un modelo mayor.
- Destilacion y generacion de datos sinteticos: puede usarse para producir trazas de decision etiquetadas que alimenten el entrenamiento de modelos mas pequenos o la evaluacion de agentes, dado su origen en un corpus de destilacion.
- Despliegue en el borde (edge) o en portatiles: con cuantizaciones de 0,9 a 1,4 GB, es viable ejecutarlo en CPU o en GPU de gama baja para asistentes locales que no pueden enviar datos a la nube.
- Prototipado e investigacion reproducible: las doce variantes GGUF permiten comparar el impacto de la cuantizacion en la calidad de las decisiones sin volver a convertir los pesos.
- Pruebas offline de agentes: sirve como modelo de referencia en entornos simulados de navegacion donde se necesita un modelo local, determinista en coste y sin dependencia de APIs.
- Filtrado previo en sistemas de atencion al cliente basados en ingles: puede clasificar la intencion o la accion siguiente en flujos guiados, aunque no hay datos publicados que respalden su calidad en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas el cache KV y el overhead del runtime. Los tamanos publicados son 0,9 GB (Q2_K), 1,0 GB (Q3_K_S y Q3_K_M), 1,1 GB (Q3_K_L e IQ4_XS), 1,2 GB (Q4_K_S y Q4_K_M), 1,3 GB (Q5_K_S), 1,4 GB (Q5_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,5 GB (f16).
- GPU recomendadas: no disponible en la informacion proporcionada. Por el rango de tamanos, cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones habituales, pero no se aportan modelos concretos ni mediciones.
- Compatibilidad con GPU de consumo: si, segun los tamanos indicados. Las variantes Q4_K_S y Q4_K_M (1,2 GB) se etiquetan como "fast, recommended" y Q8_0 (1,9 GB) como "fast, best quality", lo que sugiere que estan pensadas para hardware de consumo.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, text-generation-webui, llama-cpp-python, KoboldCpp) al ser un repositorio GGUF. La model card de referencia para el uso de GGUF es el README de TheBloke enlazado mas abajo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.
- Nota sobre calidad de cuantizacion: el autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion y que, si no aparecen en una semana, probablemente no las planifique; pueden solicitarse mediante una discusion en la comunidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/OpenJev-1.7B-GGUF | 1,72 B | no disponible | apache-2.0 | GGUF (12 cuantizaciones) | Publicado en HuggingFace |
| alanhuangya/OpenJev-1.7B (modelo base) | 1,72 B | no disponible | apache-2.0 | safetensors | Publicado en HuggingFace |
| Alternativas de terceros de tamano similar | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas oficiales con otros modelos de decision o agentes de navegador, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Idiomas: el campo "language" declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no disponible. No se puede garantizar el manejo de conversaciones largas o de estados de pagina extensos sin consultar la model card del modelo base.
- Arquitectura y detalles de entrenamiento: no disponibles en la informacion proporcionada, lo que dificulta evaluar sesgos o comportamientos esperados.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo de decision sobre estados de entorno, las salidas incorrectas pueden traducirse en acciones erroneas si se usa para controlar un navegador real; se recomienda validacion y limites de seguridad.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base alanhuangya/OpenJev-1.7B, que es el origen de los pesos.
- Fecha de creacion futura (2026-10-07) en los metadatos: dato tal cual figura en el repositorio, sin verificacion adicional.
- Sin senales de adopcion: el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K pueden degradar la calidad de las decisiones; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 para un equilibrio entre velocidad y calidad.
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar el rendimiento real frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenJev-1.7B-GGUF
- Modelo base: https://huggingface.co/alanhuangya/OpenJev-1.7B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#OpenJev-1.7B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para el uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/
- Dataset osunlp/Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- Dataset stanfordnlp/nnetnav-live: https://huggingface.co/datasets/stanfordnlp/nnetnav-live
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset tasksource/tasksource-jev: https://huggingface.co/datasets/tasksource/tasksource-jev
- Dataset SargeDev/jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset n4ze3m/typed-decisions-synth: https://huggingface.co/datasets/n4ze3m/typed-decisions-synth
