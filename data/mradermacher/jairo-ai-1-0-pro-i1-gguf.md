# mradermacher/jairo-ai-1.0-pro-i1-GGUF

## Resumen

Jairo-ai-1.0-pro-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo LouieR09112/jairo-ai-1.0-pro, un modelo de lenguaje de 8.030 millones de parametros (aproximadamente 8B) construido sobre arquitectura Llama. Las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF de la comunidad, e incluyen variantes con matrices de importancia (imatrix) para preservar mejor la calidad en regimenes de baja precision. El modelo base esta etiquetado como orientado a razonamiento ("reasoning") y conversacion, y fue afinado a partir del dataset HuggingFaceH4/ultrachat_200k.

La relevancia de esta ficha reside en que el artefacto publicado no es el modelo original, sino su distribucion cuantizada, lo que permite ejecutar un modelo de 8B en hardware de consumo. La coleccion cubre un rango muy amplio de tipos de cuantizacion, desde IQ1_S (2,1 GB) hasta Q6_K (6,7 GB), lo que facilita el despliegue en escenarios que van desde equipos con poca memoria hasta estaciones de trabajo con GPU dedicada.

La licencia declarada es MIT, lo que permite uso comercial sin restricciones significativas. El idioma declarado en la model card es unicamente ingles. No se dispone de informacion sobre longitud de contexto, composicion exacta del dataset de entrenamiento ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (familia Llama, segun tags del repositorio) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 93,8 GB (incluye todas las variantes) |
| Dataset de afinado | HuggingFaceH4/ultrachat_200k |
| Modelo base | LouieR09112/jairo-ai-1.0-pro |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de la familia Llama, segun los tags del repositorio ("llama", "8b"). Se trata de un transformer decoder-only denso de aproximadamente 8.030 millones de parametros. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la longitud de contexto nativa, ya que la model card no incluye esos datos.

En cuanto al entrenamiento, la unica informacion disponible es que el modelo fue afinado utilizando el dataset HuggingFaceH4/ultrachat_200k, un corpus publico de conversaciones multirreglo orientado a instruccion y dialogo. No se especifica el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Las cuantizaciones publicadas por mradermacher emplean matrices de importancia (imatrix) calculadas sobre el modelo base, una tecnica que pondera la relevancia de cada peso durante la cuantizacion para reducir la perdida de calidad en precisiones bajas.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a instrucciones y dialogo.
- Razonamiento basico segun la etiqueta "reasoning" declarada por el autor del modelo base.
- Capacidad de seguir instrucciones en ingles, idioma unico declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Compatible con endpoints de inferencia (tag "endpoints_compatible").

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo de sobremesa con GPU de consumo gracias a las variantes Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB), ofreciendo respuestas de chat en ingles sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de chat: la variante IQ4_XS (4,5 GB) permite iterar sobre prompts y flujos conversacionales en portatiles con 8 GB de VRAM, reduciendo el coste de experimentacion frente a modelos mayores.
- Despliegue en entornos con VRAM limitada: las variantes IQ2_M (3,0 GB) e IQ3_M (3,9 GB) permiten servir el modelo en GPUs de gama de entrada o incluso en CPU, a costa de cierta perdida de calidad.
- Generacion de texto en pipelines por lotes: al ser un modelo de 8B con licencia MIT, puede integrarse en procesos de generacion de resumenes, parafrasis o respuestas automatizadas en ingles sin restricciones comerciales.
- Educacion e investigacion: sirve como caso de estudio de cuantizacion con imatrix, permitiendo comparar la calidad entre variantes IQ y K-quant sobre un mismo modelo base.
- Base para afinado posterior: al estar disponible tambien el modelo original en safetensors, los equipos pueden partir de el para fine-tuning especifico y luego cuantizar con las recetas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: IQ1_S ~2,1 GB; IQ2_M ~3,0 GB; IQ3_M ~3,9 GB; IQ4_XS ~4,5 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB. Anadir margen para el contexto KV cache (tipicamente 1-2 GB adicionales segun longitud de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes de mayor calidad (Q5_K_M, Q6_K); A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, practicamente todas las variantes caben en GPUs con 8 GB o mas de VRAM; las variantes IQ2/IQ3 pueden ejecutarse incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. No se documenta soporte nativo en vLLM o TGI para este artefacto GGUF concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jairo-ai-1.0-pro (este) | 8,03B | no disponible | MIT | GGUF / safetensors | Afinado sobre ultrachat_200k, solo ingles |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | safetensors / GGUF | Referencia de la familia; contexto largo documentado |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors / GGUF | Alternativa de tamano similar con licencia permisiva |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors / GGUF | Multilingue y con soporte de tool calling documentado |

La comparativa se ofrece a titulo orientativo: no se dispone de benchmarks del modelo jairo-ai-1.0-pro que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se dispone de informacion sobre sesgos, datos de alineamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de 8B afinados sobre datos conversacionales; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con ventanas largas.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- La licencia MIT permite uso comercial, pero el modelo base podria arrastrar obligaciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo original LouieR09112/jairo-ai-1.0-pro.
- El repositorio ocupa 93,8 GB; descargar la coleccion completa no es necesario, basta con la variante elegida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jairo-ai-1.0-pro-i1-GGUF
- Modelo base: https://huggingface.co/LouieR09112/jairo-ai-1.0-pro
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/jairo-ai-1.0-pro-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#jairo-ai-1.0-pro-i1-GGUF
- Dataset de afinado: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
