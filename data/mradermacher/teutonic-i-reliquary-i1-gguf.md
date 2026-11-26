# mradermacher/Teutonic-I-Reliquary-i1-GGUF

## Resumen
Teutonic-I-Reliquary es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95B), desarrollado por ReliquaryForge y publicado originalmente en Hugging Face bajo licencia Apache 2.0. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, que emplea tecnicas de imatrix (importance matrix) para preservar la calidad del modelo original al reducir su huella de memoria. El modelo esta orientado a tareas de razonamiento, uso agentico y desarrollo de software (SWE), segun las etiquetas de su model card.

El modelo se enmarca en el ecosistema de Bittensor, una red descentralizada de entrenamiento de IA, y su pipeline declarado es de aprendizaje por refuerzo (reinforcement-learning). Esto sugiere que el modelo base pudo haber sido afinado mediante tecnicas de RL para mejorar su comportamiento en tareas de razonamiento y ejecucion de acciones, aunque la informacion disponible no detalla la composicion exacta del dataset ni el proceso de entrenamiento.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar el modelo en hardware de consumo mediante cuantizaciones GGUF de 4 a 5 GB, manteniendo la compatibilidad con el ecosistema transformers y con herramientas de inferencia local como llama.cpp u Ollama. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se detalla variante especifica; no disponible) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, entre otras variantes IQ y K (la model card lista Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento
La informacion disponible no especifica la arquitectura interna mas alla de que se trata de un modelo transformer de 8,95B parametros. La model card del cuantizador no incluye detalles sobre el numero de capas, dimensiones ocultas, mecanismos de atencion ni si emplea alguna innovacion como atencion lineal o decodificacion especulativa. Tampoco se documenta el numero de tokens de entrenamiento ni la composicion del dataset.

El modelo base, ReliquaryForge/Teutonic-I-Reliquary, esta etiquetado como parte del ecosistema Bittensor y con pipeline de reinforcement-learning, lo que indica que su entrenamiento o ajuste pudo involucrar tecnicas de RL, posiblemente orientadas a razonamiento y comportamiento agentico. Las etiquetas "reasoning", "agentic" y "swe" sugieren un enfasis en tareas de resolucion de problemas y desarrollo de software. No se dispone de informacion sobre si se aplicaron fases de RLHF o DPO, ni sobre la composicion del corpus de entrenamiento.

La cuantizacion aqui presentada utiliza matrices de importancia (imatrix) generadas por mradermacher, un metodo que pondera la cuantizacion segun la relevancia de cada peso para reducir la perdida de calidad en comparacion con cuantizaciones estaticas. El repositorio incluye el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades
- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Razonamiento (reasoning) y resolucion de problemas de varios pasos, segun las etiquetas del modelo.
- Comportamiento agentico (agentic): capacidad declarada para ejecutar tareas de forma autonoma o semiautonoma.
- Desarrollo de software (swe): orientado a tareas de ingenieria de software, aunque no se detallan benchmarks que lo confirmen.
- Compatibilidad con endpoints (endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte multilingue limitado al ingles; no se declaran otros idiomas.
- No se documentan capacidades de vision, audio, tool calling explicito ni modo "thinking" en la informacion disponible.

## Casos de uso
- Asistente de desarrollo de software: el modelo puede integrarse en entornos de programacion para sugerir codigo, explicar errores o proponer refactorizaciones, aprovechando su orientacion declarada a tareas SWE y su naturaleza conversacional.
- Automatizacion de tareas agenticas: al estar etiquetado como "agentic", puede emplearse en pipelines que requieran descomponer objetivos en pasos y ejecutar acciones secuenciales, como la gestion de tickets o la orquestacion de scripts.
- Razonamiento asistido en entornos de investigacion: util para prototipar cadenas de razonamiento y evaluar comportamiento en tareas de logica o matematicas, aunque sin benchmarks publicos que garanticen su rendimiento.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF de 4 a 5 GB, puede ejecutarse en equipos con GPU de consumo para experimentacion y desarrollo sin depender de la nube.
- Chatbot especializado en dominio tecnico en ingles: su etiqueta "conversational" y su ventana de contexto (no documentada) permiten construir asistentes para soporte tecnico en ingles.
- Experimentacion con modelos del ecosistema Bittensor: investigadores interesados en el entrenamiento descentralizado y en RL pueden usar este modelo como referencia o punto de partida para comparativas.
- Generacion de documentacion tecnica: el modelo puede redactar y resumir documentacion en ingles, integrado en flujos de CI/CD o en herramientas de gestion del conocimiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 4 GB para la cuantizacion i1-Q2_K y 4,6 GB para i1-IQ3_M, segun los tamanos de fichero del repositorio. Las cuantizaciones de mayor calidad (Q4_K_M, Q5_K_M, Q6_K) requeriran entre 5 y 7 GB aproximadamente, aunque no se detallan sus tamanos exactos en la informacion proporcionada.
- GPU recomendadas: para cuantizaciones bajas, una GPU de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para cuantizaciones de mayor calidad, se recomienda 8-12 GB (RTX 4070, RTX 3080). En entornos de servidor, A100 o H100 permiten ejecutar el modelo en precision completa o cuantizaciones altas con mayor throughput.
- Cabe en GPU de consumo: si, en modelos con al menos 6 GB de VRAM para las cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y con endpoints estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. A continuacion se ofrece una comparativa estructural basica con alternativas de tamano similar, marcando como "no disponible" los datos que no se conocen.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Teutonic-I-Reliquary (este) | 8,95B | No disponible | Apache 2.0 | GGUF, safetensors | Orientado a razonamiento, agentico y SWE; ecosistema Bittensor |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | GGUF, safetensors | Ampliamente extendido, multilingue |
| Mistral 7B | 7,3B | 32K | Apache 2.0 | GGUF, safetensors | Referencia en modelos abiertos de 7B |
| Qwen2.5 7B | 7,6B | 128K | Apache 2.0 (segun variante) | GGUF, safetensors | Buen rendimiento en codigo y matematicas |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la informacion disponible y deben contrastarse con sus respectivas fichas oficiales.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos en ingles, puede reflejar sesgos culturales y linguisticos de ese corpus.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual para este modelo.
- Limitaciones de contexto o idioma: solo se declara soporte para ingles; la longitud de contexto no esta documentada, lo que impide garantizar su comportamiento en conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero debe verificarse que el modelo base y los datos de entrenamiento no impongan restricciones adicionales no reflejadas en la model card.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria. No se han publicado benchmarks, por lo que su rendimiento real en tareas SWE o agenticas no esta verificado. La cuantizacion i1-Q2_K es de baja calidad y la propia model card sugiere que IQ3_XXS es probablemente mejor. Se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Enlaces
- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Teutonic-I-Reliquary-i1-GGUF
- Modelo base: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Teutonic-I-Reliquary-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Teutonic-I-Reliquary-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
