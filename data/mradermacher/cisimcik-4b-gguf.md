# mradermacher/cisimcik-4b-GGUF

## Resumen

cisimcik-4b-GGUF es la version cuantizada en formato GGUF del modelo cisimcik-4b, un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) especializado en conversacion en turco y desarrollado por el usuario cisimcik. La cuantizacion la firma mradermacher, autor conocido en HuggingFace por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo se distribuye bajo licencia Apache 2.0, esta etiquetado para los idiomas turco (tr) e ingles (en) y se apoya en el dataset cisimcik/turkish-chat-max-25k.

Segun los tags de la model card, la arquitectura subyacente se etiqueta como "qwen3.5" con "gated-deltanet" y "hybrid-attention", lo que apunta a una arquitectura hibrida que combina mecanismos de atencion lineal tipo Gated DeltaNet con atencion clasica, en la linea de las familias Qwen3.5. Es decir, no se trata de un transformer denso convencional, sino de un diseno mixto orientado a reducir el coste computacional en contextos largos. La model card no especifica la longitud de contexto soportada ni el volumen de tokens de entrenamiento.

Su relevancia practica es doble: por un lado cubre un nicho poco poblado como es el de modelos conversacionales de calidad en turco de tamano contenido; por otro, al publicarse en GGUF con 12 niveles de cuantizacion distintos, puede ejecutarse en hardware de consumo (desde 2,0 GB en Q2_K hasta 8,5 GB en f16), lo que lo hace desplegable en portatiles con GPU modesta o incluso en CPU. Los tags declaran soporte de razonamiento, modo thinking, tool calling y function calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con atencion (tags: qwen3.5, gated-deltanet, hybrid-attention); detalle completo no disponible |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base cisimcik/cisimcik-4b |
| Tamano del repositorio | 38,9 GB (suma de todas las cuantizaciones) |
| Pipeline | text-generation |
| Fecha de publicacion | 5 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion detallada de la arquitectura por parte del autor. Los metadatos del repositorio etiquetan el modelo con "qwen3.5", "gated-deltanet" y "hybrid-attention", lo que sugiere una arquitectura hibrida en la que capas de atencion lineal basadas en Gated DeltaNet se combinan con capas de atencion convencional. Este tipo de diseno se emplea habitualmente para reducir el coste de memoria y computo asociado a contextos largos, manteniendo la calidad de recuperacion de informacion de la atencion clasica. El numero de capas, dimension oculta, numero de cabezas y vocabulario no estan disponibles en la informacion proporcionada.

En cuanto al entrenamiento, la model card referencia el dataset cisimcik/turkish-chat-max-25k, un conjunto de datos de conversacion en turco de aproximadamente 25.000 ejemplos, segun se deduce del nombre. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT sobre preferencias. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o variantes de atencion concreta mas alla de la etiqueta generica de atencion hibrida.

## Capacidades

- Generacion de texto conversacional en turco, con el ingles como idioma secundario declarado.
- Razonamiento y modo thinking: los tags "reasoning" y "thinking" indican que el modelo puede exponer cadenas de razonamiento, aunque la model card no detalla el formato de activacion.
- Tool calling y function calling: el modelo esta etiquetado explicitamente para invocacion de herramientas, lo que permite integrarlo en flujos de agentes.
- Instruction following: orientado a seguir instrucciones en formato chat.
- Soporte de conversaciones multi-turno dentro del pipeline text-generation.
- Capacidades multilingues limitadas a turco e ingles; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Atencion al cliente en turco: el modelo puede gestionar conversaciones de soporte multi-turno en turco nativo, un idioma con poca cobertura en modelos abiertos de este tamano, reduciendo la necesidad de recurrir a APIs propietarias para ese mercado.
- Agentes con invocacion de herramientas: gracias al soporte declarado de tool calling y function calling, puede emplearse como planificador en agentes que consulten APIs, bases de datos o sistemas internos mediante esquemas JSON.
- Generacion y asistencia de codigo en pipelines de desarrollo: integrado en asistentes de IDE o revisiones automatizadas, con la salvedad de que el modelo esta optimizado para turco y su rendimiento en codigo no esta documentado.
- Traduccion turco-ingles y viceversa: al declarar ambos idiomas, puede utilizarse para traduccion asistida y localizacion de contenido, aunque no se especifica la calidad relativa entre direcciones.
- Despliegue en entornos con recursos limitados: con cuantizaciones desde 2,0 GB (Q2_K) hasta 4,6 GB (Q8_0), es viable ejecutarlo en portatiles, mini-PC o entornos on-premise sin GPU dedicada, algo critico en sectores con requisitos de soberania de datos.
- Extraccion estructurada de informacion: mediante function calling puede convertir texto libre en turco en registros estructurados para CRM, tickets o formularios.
- Base para fine-tuning en dominio turco: al estar bajo Apache 2.0 y publicarse los pesos en safetensors en el modelo base, puede ajustarse con LoRA sobre corpus especializados (legal, sanitario, financiero) sin restricciones de licencia comercial.
- Evaluacion de arquitecturas hibridas: util para investigadores que quieran medir el comportamiento de disenos con Gated DeltaNet frente a transformers densos de tamano comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia estimada a partir del tamano de los ficheros GGUF, mas overhead de cache KV y runtime:
  - Q2_K (2,0 GB): menos de 3 GB de VRAM efectiva.
  - Q4_K_M (2,8 GB) y Q4_K_S (2,7 GB): en torno a 3-4 GB con contexto moderado.
  - Q5_K_M (3,2 GB) y Q6_K (3,6 GB): aproximadamente 4-5 GB.
  - Q8_0 (4,6 GB): alrededor de 5-6 GB.
  - f16 (8,5 GB): cerca de 9-10 GB.
- GPUs consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y equivalentes. Cualquier GPU con 6 GB o mas puede ejecutar Q4_K_M con contexto reducido; con 8 GB se cubren comodamente Q6_K y Q8_0.
- GPUs de centro de datos: A100 40/80 GB, H100 y L40S, utiles para servir en lote con contextos largos y alta concurrencia.
- Ejecucion en CPU: viable con llama.cpp en Q4_K_M o inferiores; el throughput dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan y text-generation-webui para el formato GGUF. Para los pesos safetensors del modelo base, transformers y, segun compatibilidad de la arquitectura, vLLM.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor ni de terceros.

## Comparativa con modelos similares

Los datos de los modelos de comparacion proceden de su documentacion publica y se ofrecen como referencia orientativa; no se han verificado contra benchmarks ejecutados sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| cisimcik-4b | 4,2 B | no disponible | Apache 2.0 | Conversacion en turco, arquitectura hibrida |
| Qwen3-4B | 4,0 B | 32.768 tokens nativos | Apache 2.0 | Multilingue generalista, modo thinking |
| Llama-3.2-3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Multilingue, uso comercial con restricciones |
| Phi-4-mini | 3,8 B | 128.000 tokens | MIT | Razonamiento y matematicas, foco en ingles |
| Gemma-3-4B | 4 B | 128.000 tokens | Gemma Terms of Use | Multilingue, multimodal en variantes superiores |

La ventaja diferencial de cisimcik-4b es la especializacion en turco combinada con una licencia permisiva sin clausulas de uso aceptable adicionales, frente a Llama 3.2 y Gemma 3, que imponen condiciones propias. Su desventaja principal es la ausencia de datos publicados sobre contexto maximo y rendimiento medido, lo que dificulta compararlo objetivamente con Qwen3-4B o Phi-4-mini.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible verificar el rendimiento real frente a las capacidades declaradas en los tags.
- La longitud de contexto no esta documentada; planificar despliegues con ventanas largas sin verificar experimentalmente el comportamiento del modelo.
- Riesgo de alucinacion no cuantificado: los modelos de 4B parametros tienden a inventar datos en tareas de conocimiento factual, especialmente fuera del dominio del dataset de entrenamiento.
- Cobertura idiomatica limitada a turco e ingles. El comportamiento en castellano u otros idiomas no esta garantizado ni evaluado.
- El dataset turkish-chat-max-25k es pequeno (unos 25.000 ejemplos segun su nombre), lo que puede limitar la diversidad de temas y estilos cubiertos.
- Sesgos: no se documenta ningun proceso de mitigacion de sesgos ni auditoria del corpus de entrenamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la model card es minima y no incluye informacion sobre procedencia de los datos de entrenamiento, lo que puede ser relevante para cumplimiento normativo.
- Este repositorio contiene unicamente cuantizaciones estaticas; el autor indica que no hay versiones ponderadas o con imatrix disponibles en el momento de la publicacion.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad segun la propia tabla del autor (Q3_K_M marcada como "lower quality"); para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/cisimcik-4b-GGUF
- Modelo base: https://huggingface.co/cisimcik/cisimcik-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/cisimcik/turkish-chat-max-25k
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#cisimcik-4b-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Cuantizacion de la variante base: https://huggingface.co/mradermacher/cisimcik-base-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que soporta al cuantizador: https://www.nethype.de/
