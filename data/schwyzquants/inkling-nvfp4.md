# schwyzquants/Inkling-NVFP4

## Resumen

Inkling-NVFP4 es una version cuantizada en NVFP4 del modelo multimodal Inkling, desarrollado por Thinking Machines Lab (repositorio base `thinkingmachines/Inkling`). Se trata de un transformer autoregresivo decoder-only de 66 capas con backbone de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos mas 2 expertos compartidos siempre activos. El modelo es nativamente multimodal: acepta texto, imagen, video y audio como entrada, y genera texto como salida. La version aqui descrita ha sido publicada por el usuario `schwyzquants`, no por el autor original, y su unica diferencia respecto al modelo base es la cuantizacion a 4 bits en formato NVFP4 para reducir el espacio de almacenamiento y los requisitos de memoria.

El problema que resuelve esta variante concreta es el de despliegue: el modelo original en BF16 ocupa aproximadamente 1,95 TB de pesos (975 mil millones de parametros totales), lo que lo hace practicamente inaccesible fuera de infraestructura muy grande. La version NVFP4 reduce ese requisito a alrededor de 488 GB teoricos, con un repositorio publicado de 592 GB, lo que permite servirlo en nodos de 8 GPU de 80 GB o en configuraciones con GPUs Blackwell.

Es relevante ahora porque combina tres tendencias: modelos MoE de gran escala con pocos parametros activos (41B), soporte multimodal nativo en un unico decoder y cuantizacion de 4 bits de nueva generacion (NVFP4) pensada para las arquitecturas Blackwell de NVIDIA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 14 de septiembre de 2026. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 66 capas con backbone MoE dispersa (6 de 256 expertos por token + 2 expertos compartidos), atencion hibrida de capas locales y globales, encoder de parches jerarquico para imagen/video y codificacion discreta de tokens para audio |
| Parametros totales | 975 000 millones segun la model card del modelo base; 552 845 034 562 segun los tensores safetensors del repositorio cuantizado (discrepancia no explicada por el autor) |
| Parametros activos | 41 000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (version de este repositorio); el modelo base soporta BF16 y NVFP4. El tag del repositorio indica "8-bit", en contradiccion con la model card, que indica NVFP4 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; soporte de multiples lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 592,0 GB |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato en pixeles, idealmente entre 40 px y 4096 px por dimension), audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con una columna vertebral de feed-forward basada en mezcla de expertos dispersa. El enrutador selecciona 6 expertos de un total de 256 por token, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens, lo que da un total de 975 000 millones de parametros con solo 41 000 millones activos por token. La atencion es hibrida: combina capas de atencion local con capas de atencion global, un patron habitual para equilibrar coste computacional y alcance efectivo del contexto. El modelo es nativamente multimodal: las imagenes y el video se codifican mediante un encoder de parches jerarquico, el audio mediante codificacion discreta de tokens, y todas las modalidades se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Sobre los datos de entrenamiento, la model card indica que provienen de fuentes publicas de internet, repositorios publicos, terceros y generacion o aumentacion sintetica, e incluyen texto, imagenes, audio y video. El proceso de curado comprende limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad, aunque no se especifican ni el numero total de tokens ni la composicion porcentual del dataset. Tampoco se detalla si hubo fases de RLHF o DPO, ni innovaciones concretas como decodificacion especulativa o atencion lineal. Los resultados de evaluacion se reportan con `effort=0.99`, un parametro de esfuerzo de razonamiento cuyo funcionamiento no se describe en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instruccional en ingles, con capacidades multilingues generales.
- Razonamiento complejo, incluyendo matematicas de competicion y preguntas cientificas de nivel experto.
- Codigo y trabajo agentico sobre repositorios: los resultados en SWEBench Verified y SWEBench Pro indican resolucion de tareas de ingenieria de software reales.
- Uso de herramientas: la model card reporta resultados de HLE con herramientas (46,0 %) frente a HLE solo texto (29,7 %), lo que confirma soporte de tool calling en flujos de razonamiento.
- Comprension de imagen: pipeline declarado `image-text-to-text`, con entrada en cualquier formato de pixeles.
- Comprension de audio: tag `audio-text-to-text`, con entrada WAV a 16 kHz.
- Entrada de video: la arquitectura describe codificacion de video mediante el encoder de parches jerarquico.
- Modo de razonamiento con nivel de esfuerzo configurable (los benchmarks se reportan a `effort=0.99`), lo que sugiere un modo de pensamiento extendido, aunque no se documentan los detalles.
- Ajuste fino e integracion en productos de terceros, al publicarse con pesos abiertos.

## Casos de uso

- Asistentes de codigo en produccion: con un 77,6 % en SWEBench Verified y 54,3 % en SWEBench Pro (Public), el modelo puede resolver tareas de reparacion de bugs, refactorizacion y generacion de tests sobre repositorios reales, integrándose en pipelines de CI/CD mediante tool calling.
- Agentes autonomos multi-paso: la diferencia entre HLE solo texto (29,7 %) y HLE con herramientas (46,0 %) indica que el modelo se beneficia de forma clara de la orquestacion de herramientas, lo que lo hace adecuado para agentes que consultan APIs, buscan en web o ejecutan codigo.
- Atencion al cliente multimodal: al aceptar texto, imagen y audio, puede gestionar conversaciones en las que el usuario adjunta capturas de pantalla, fotos de productos o notas de voz, manteniendo el hilo conversacional en un unico modelo.
- Analisis de documentacion tecnica y RAG: la model card menciona explicitamente los sistemas de generacion aumentada por recuperacion entre los casos previstos, con capacidad de leer diagramas e imagenes ademas del texto recuperado.
- Transcripcion y analisis de audio de reuniones: con entrada WAV a 16 kHz y hasta 20 minutos por clip, puede procesar actas, resumir reuniones y extraer tareas, aunque requerira concatenacion de clips para sesiones mas largas.
- Evaluacion de contenido visual a escala: el encoder de parches admite imagenes de 40 px a 4096 px por dimension, lo que cubre desde iconos hasta fotografias de alta resolucion en tareas de clasificacion, descripcion o moderacion.
- Investigacion en eficiencia de inferencia: la variante NVFP4 sirve como banco de pruebas para medir la degradacion de calidad de la cuantizacion de 4 bits frente al modelo BF16 en un MoE de casi un billon de parametros.
- Fine-tuning especifico de dominio: al publicarse pesos abiertos bajo Apache 2.0 y existir recetas de Unsloth, es viable adaptar el modelo a dominios verticales (legal, sanitario, financiero) sin coste de licencia.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base con `effort=0.99`. Las puntuaciones de comparacion se generaron el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agentico (codigo) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agentico (codigo) | SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | datos truncados en la fuente | datos truncados en la fuente | datos truncados en la fuente | datos truncados en la fuente |

La tabla de la model card original esta truncada en la ultima fila, por lo que los valores de DeepSeek V4 Pro, Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol en SWEBench Pro (Public) no estan disponibles. No se han publicado en la informacion disponible resultados especificos de la variante cuantizada NVFP4 frente al modelo en BF16, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos en NVFP4: aproximadamente 488 GB teoricos (975 000 millones de parametros a 0,5 bytes por parametro). El repositorio publicado ocupa 592 GB, cifra que incluye otros artefactos ademas de los tensores cuantizados.
- Pesos en BF16 (modelo base): aproximadamente 1,95 TB, lo que exige varios nodos o sistemas con memoria unificada de gran capacidad.
- Memoria total necesaria: a los pesos hay que sumar cache KV y activaciones, cuyo tamano depende de la longitud de contexto, dato no disponible. En la practica, el minimo razonable es un nodo de 8 GPU de 80 GB (640 GB) para NVFP4, o 4 GPU Blackwell B200 de 192 GB (768 GB).
- GPU recomendadas: B200 y GB200 para aprovechar la aceleracion nativa de FP4; H100/H200 de 80 GB y A100 de 80 GB pueden usarse en configuraciones de 8 o mas unidades, aunque sin aceleracion nativa de FP4 el rendimiento de la cuantizacion se degrada.
- GPU de consumo: no es viable. Ni siquiera 8 RTX 5090 de 32 GB (256 GB) alcanzan a alojar los pesos en NVFP4, y no existe una cuantizacion de menor tamano publicada para este modelo en la informacion disponible.
- Opciones de despliegue: vLLM (receta oficial), SGLang (receta oficial), TokenSpeed, Unsloth y transformers/Hugging Face. La model card tambien menciona acceso via API a traves de proveedores de inferencia de terceros y el playground Tinker. No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Con 41 000 millones de parametros activos por token, el coste computacional por token es comparable al de un modelo denso de ese tamano, pero el cuello de botella real es la memoria y el ancho de banda requerido para servir 975 000 millones de parametros.

## Comparativa con modelos similares

Los modelos comparables que aparecen en la propia model card son Kimi K2.6, DeepSeek V4 Pro, GLM 5.2 y Nemotron 3 Ultra. No se dispone de sus recuentos de parametros, contexto ni licencia en la informacion proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | HLE (texto) | HLE (herramientas) | SWEBench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling (base de esta ficha) | 975B totales / 41B activos | no disponible | 29,7 % | 46,0 % | 77,6 % | Apache 2.0 | Pesos abiertos en HuggingFace (BF16 y NVFP4) |
| Kimi K2.6 | no disponible | no disponible | 35,9 % | 54,0 % | 80,2 % | no disponible | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | 35,9 % | 48,2 % | 80,6 % | no disponible | Pesos abiertos |
| GLM 5.2 | no disponible | no disponible | 40,1 % | 54,7 % | no disponible | no disponible | Pesos abiertos |
| Nemotron 3 Ultra | no disponible | no disponible | 26,6 % | 37,4 % | 70,7 % | no disponible | Pesos abiertos |

En terminos de rendimiento, Inkling queda por delante de Nemotron 3 Ultra en todos los benchmarks recogidos, pero por detras de Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro en razonamiento, mientras que en SWEBench Verified se situa en un rango intermedio (77,6 %) por debajo de Kimi K2.6 (80,2 %) y DeepSeek V4 Pro (80,6 %). Su ventaja diferencial no es el techo de rendimiento sino la combinacion de modalidades nativas (texto, imagen, video y audio) en un unico modelo de pesos abiertos con licencia Apache 2.0.

## Limitaciones y advertencias

- La ficha de benchmarks de la model card esta truncada, por lo que no es posible evaluar la comparativa completa ni verificar el comportamiento en filas como SWEBench Pro (Public).
- No hay datos publicados del impacto de la cuantizacion NVFP4 sobre la calidad respecto al modelo BF16. La degradacion puede ser no uniforme entre tareas de razonamiento, codigo y percepcion multimodal.
- Existe una discrepancia no explicada entre los 975 000 millones de parametros declarados en la model card y los 552 845 034 562 parametros contados en los tensores safetensors del repositorio cuantizado. Conviene verificar la integridad del checkpoint antes de usarlo en produccion.
- El tag del repositorio indica "8-bit", mientras que la model card indica NVFP4. La informacion sobre el formato real de cuantizacion es contradictoria.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad ni de tasa de alucinacion en la informacion disponible.
- Sesgos: la model card no incluye una seccion de limitaciones, sesgos o evaluaciones de seguridad. Solo se menciona que el curado de datos incluye filtrado con objetivos de seguridad, sin detallar metodologia ni resultados.
- Idioma: el modelo esta optimizado para ingles. El soporte multilingue se describe genericamente como "capacidades generales", sin evaluaciones por idioma, por lo que el rendimiento en castellano no esta cuantificado.
- Limites de entrada: audio en WAV a 16 kHz y preferiblemente por debajo de 20 minutos; imagenes con cada dimension idealmente entre 40 px y 4096 px. Fuera de esos rangos el rendimiento puede degradarse.
- La longitud de contexto no esta publicada, lo que impide planificar el consumo de cache KV y limita la confianza en escenarios de contexto largo o agentes de muchas iteraciones.
- Licencia: Apache 2.0 permite uso comercial, pero la model card remite a una politica de uso aceptable de Thinking Machines Lab. Conviene revisarla antes de desplegar el modelo en productos de cara al publico.
- Esta variante cuantizada la publica un tercero (`schwyzquants`), no el autor original. La responsabilidad sobre la fidelidad de la cuantizacion recae en el publicador, no en Thinking Machines Lab.
- Requisitos de hardware muy elevados: no es desplegable en GPUs de consumo ni en estaciones de trabajo de una sola GPU, lo que limita su uso a entornos con nodos multi-GPU.
- No se documentan mecanismos de desactivacion de seguridad, filtros de contenido ni comportamiento del modo de razonamiento extendido.

## Enlaces

- Repositorio de esta variante cuantizada: https://huggingface.co/schwyzquants/Inkling-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling
- Version NVFP4 del autor original: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de despliegue en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente enlaces de inicio de sesion de Disney+ sin relacion con la ficha. Por tanto, no se han podido incorporar papers, blogs tecnicos ni demos adicionales a los ya recogidos en la model card.
