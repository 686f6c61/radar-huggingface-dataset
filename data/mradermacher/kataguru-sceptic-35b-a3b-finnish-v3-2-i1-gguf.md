# mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF es una cuantizacion GGUF del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, publicada por el usuario mradermacher. El modelo original es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales, orientado a traduccion, razonamiento y tareas multimodales con vision, con especial enfasis en el idioma finlandes. La arquitectura declarada en las etiquetas es qwen3_5_moe, lo que sugiere una base derivada de la familia Qwen 3.5 MoE.

El repositorio proporciona cuantizaciones de tipo i1 (imatrix) en formato GGUF, pensadas para ejecucion local con llama.cpp y herramientas compatibles. La model card del cuantizador lista una amplia bateria de tipos de cuantizacion, desde IQ1_S e IQ2_XXS hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso, desde equipos de consumo hasta servidores con GPU de alta gama.

La relevancia de esta ficha radica en que se trata de un modelo especializado en finlandes con capacidades multimodales y de razonamiento, una combinacion poco frecuente en el ecosistema open source, y con licencia Apache 2.0, lo que facilita su uso comercial. No obstante, la informacion publica disponible es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento ni el numero de parametros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen3_5_moe) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ3_XXS, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q4_0, Q4_1, small-IQ4_NL (segun lista de la model card) |
| Idiomas soportados | en, fi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors y bfloat16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, segun las etiquetas del repositorio (moe, qwen3_5_moe). El nombre "35B-A3B" indica 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible. El repositorio incluye pesos en bfloat16 y safetensors en el modelo original, y esta cuantizacion emplea tecnicas de imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detallan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card del cuantizador se limita a describir el proceso de cuantizacion y los ficheros generados.

## Capacidades

- Generacion de texto y razonamiento general, segun las etiquetas reasoning del repositorio.
- Traduccion, con el pipeline declarado como translation y el finlandes como idioma central.
- Capacidades multimodales con vision: el repositorio se identifica como modelo de vision y los ficheros mmproj, si existen, se alojan en el repositorio estatico.
- Soporte de conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingues limitadas a ingles y finlandes.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Traduccion ingles-finlandes y finlandes-ingles: el modelo esta especializado en finlandes y declara el pipeline de traduccion, por lo que puede integrarse en flujos de localizacion de documentacion tecnica y contenido web.
- Atencion al cliente en finlandes: permite desplegar un asistente conversacional local en un idioma con poca cobertura en modelos generalistas, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Procesamiento de documentos escaneados en finlandes: al ser un modelo de vision, puede extraer y traducir texto de imagenes o PDF renderizados, util en administraciones publicas y empresas finlandesas.
- Razonamiento asistido sobre normativa y documentacion local: la etiqueta reasoning sugiere capacidad para tareas de analisis y sintesis de textos largos, aunque el contexto maximo no esta documentado.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q2_K (13,3 GB) y las de mayor tamano permiten ejecutar el modelo en equipos con GPU de 16-24 GB de VRAM mediante llama.cpp u Ollama.
- Investigacion en modelos MoE especializados por idioma: sirve como base para estudiar el comportamiento de arquitecturas MoE en lenguas de bajos recursos como el finlandes.
- Generacion de contenido multilingue con vision: descripcion de imagenes y generacion de texto asociado en ingles y finlandes para catalogos o accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la cuantizacion i1-Q2_K ocupa 13,3 GB en disco; las cuantizaciones de mayor calidad (Q5_K_M, Q6_K) requieren mas espacio, no detallado en la informacion disponible.
- GPU recomendadas: no disponibles de forma oficial; por tamano, una RTX 4090 (24 GB) o una A100/H100 permitirian ejecutar las cuantizaciones de mayor precision.
- Cabe en GPU de consumo: si, al menos la cuantizacion i1-Q2_K en GPUs con 16 GB o mas de VRAM; las cuantizaciones superiores requeriran 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables en la misma categoria (MoE especializado en finlandes con vision) ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real del modelo es desconocido y debe validarse antes de usarlo en produccion.
- La longitud de contexto no esta documentada, lo que impide planificar casos de uso con documentos largos.
- El soporte de idiomas se limita a ingles y finlandes; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluaciones publicas.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus pesos deben verificarse de forma independiente.
- Al ser una cuantizacion, las versiones de baja precision (IQ1, IQ2) pueden degradar la calidad de forma notable; la propia model card recomienda IQ3_XXS frente a i1-Q2_K.
- La ausencia de informacion sobre parametros activos y contexto impide estimar con precision los costes de inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Kataguru-Sceptic-35B-A3B-Finnish-v3.2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
