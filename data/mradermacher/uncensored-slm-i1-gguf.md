# mradermacher/Uncensored-SLM-i1-GGUF

## Resumen

Uncensored-SLM-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas con imatrix, del modelo mrzenin/Uncensored-SLM. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones comprimidas de modelos abiertos para su uso en llama.cpp y derivados. El modelo subyacente se presenta como una variante "abliterated" y "decensored" de un modelo de la familia Liquid AI LFM3, orientada a generacion de texto conversacional, roleplay y razonamiento en el borde.

El modelo base tiene 1.728.801.600 parametros (aproximadamente 1,7 mil millones) segun los pesos en safetensors, y se etiqueta como de arquitectura hibrida (hybrid-architecture) con soporte de codigo personalizado (custom_code), lo que sugiere una implementacion que no se limita a un transformer denso convencional. El repositorio GGUF ocupa 21,3 GB en total porque incluye todas las variantes de cuantizacion, desde IQ1_S hasta Q6_K, con tamanos individuales que van de 0,6 GB a 1,5 GB.

La relevancia de esta ficha radica en documentar una opcion de despliegue local de muy bajo coste computacional: al tratarse de un modelo de menos de 2 mil millones de parametros, las cuantizaciones de 4 bits caben en GPU de consumo y en equipos con poca VRAM, lo que lo hace atractivo para prototipos de asistentes conversacionales sin censura y para experimentacion con arquitecturas hibridas en el borde. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hibrida (etiqueta "hybrid-architecture"), causal-LM, con custom_code |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamano del repo | 21,3 GB (todas las cuantizaciones) |
| Cuantizacion mas pequena | 0,6 GB (i1-IQ1_S) |
| Cuantizacion recomendada | 1,2 GB (i1-Q4_K_M, "fast, recommended") |

## Arquitectura y entrenamiento

El modelo base se etiqueta como "liquid-ai", "lfm3" y "hybrid-architecture", lo que apunta a la familia de modelos Liquid Foundation Models de Liquid AI, que combinan capas de atencion con componentes de estado recurrente o convolucional en lugar de un transformer puramente denso. La model card no detalla la composicion exacta de capas, el numero de tokens de entrenamiento ni la mezcla del dataset. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineamiento; las etiquetas "heretic", "abliterated", "uncensored" y "decensored" indican que el modelo base ha sido modificado para eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento, tipicamente mediante tecnicas de abliteration sobre las direcciones de rechazo en los pesos.

El trabajo de esta ficha concreta es la cuantizacion. mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (Uncensored-SLM.imatrix.gguf, 0,1 GB), lo que permite crear cuantizaciones propias y suele mejorar la perplejidad de las variantes de baja precision respecto a las cuantizaciones estaticas. El autor mantiene ademas una version estatica en mradermacher/Uncensored-SLM-GGUF. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal mas alla de la etiqueta de arquitectura hibrida.

## Capacidades

- Generacion de texto causal y conversacional multi-turno.
- Razonamiento (etiqueta "reasoning" en la model card), sin detalle de modo thinking explicito.
- Roleplay y conversacion sin censura, segun las etiquetas "uncensored", "decensored" y "abliterated".
- Soporte de arquitectura hibrida orientada a edge-ai, es decir, despliegue en dispositivos con recursos limitados.
- Codigo personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en implementaciones incluidas en el repositorio original.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Idiomas: ingles unicamente segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional local sin conexion: con cuantizaciones de 1,2 GB (i1-Q4_K_M) el modelo cabe en practicamente cualquier GPU de consumo y en CPU con RAM modesta, lo que permite desplegar un chatbot de roleplay o compania en un portatil sin depender de la nube.
- Prototipado de personajes y narrativa interactiva: el sesgo "uncensored" y la orientacion a roleplay lo hacen util para experimentar con dialogos sin las restricciones de rechazo tipicas de modelos alineados, en entornos controlados y con moderacion externa.
- Evaluacion de arquitecturas hibridas en el borde: investigadores que quieran medir el comportamiento de un modelo LFM3 cuantizado en dispositivos de bajos recursos pueden usar las variantes IQ2/IQ3 (0,7-1,0 GB) para comparar latencia y calidad frente a transformers densos del mismo tamano.
- Generacion de texto en pipelines de CI o scripts: al ser un GGUF compatible con llama.cpp, se puede invocar desde herramientas de linea de comandos para tareas de generacion, resumen o reescritura en lotes pequenos.
- Base para fine-tuning ligero y experimentacion con abliteration: al ser un modelo de 1,7 B, sirve como banco de pruebas para estudiar el efecto de la abliteration en modelos pequenos y para comparar contra el modelo base sin modificar.
- Despliegue en entornos con GPU integrada o Apple Silicon: las cuantizaciones Q4 y Q5 (1,2-1,4 GB) permiten ejecucion en Metal o en iGPU con memoria unificada, adecuado para demos y aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,0 GB con IQ2/IQ3, 1,2-1,4 GB con Q4/Q5 y 1,5 GB con Q6_K, mas overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y permitiran contextos largos y mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas y en iGPU con memoria compartida; tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base requiere transformers con custom_code.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uncensored-SLM-i1-GGUF | 1,73 B | no disponible | no disponible | GGUF (multiples cuantizaciones) | Variante abliterated de LFM3, solo ingles |
| mradermacher/Uncensored-SLM-GGUF | 1,73 B | no disponible | no disponible | GGUF estatico | Misma base, cuantizaciones sin imatrix |
| mrzenin/Uncensored-SLM | 1,73 B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| Alternativas de ~1-2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base mrzenin/Uncensored-SLM y de la familia LFM3 original.
- El modelo esta entrenado y etiquetado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- Las etiquetas "uncensored", "abliterated" y "decensored" implican que se han atenuado los mecanismos de rechazo; esto aumenta el riesgo de generar contenido danino, sesgado o inexacto y exige moderacion externa en produccion.
- Riesgo de alucinacion elevado por el reducido tamano del modelo (1,7 B) y por las cuantizaciones agresivas (IQ1, IQ2), que degradan la calidad de forma notable.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) estan marcadas por el propio autor como "for the desperate" o "mostly desperate"; no son aptas para uso serio.
- El modelo base requiere custom_code, lo que implica ejecutar codigo del repositorio original; conviene auditar dicho codigo antes de cargarlo en entornos sensibles.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones largas; hay que validarlo empiricamente.
- No se dispone de informacion sobre sesgos especificos medidos, pero los modelos abliterated suelen conservar y amplificar sesgos presentes en los datos de entrenamiento originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uncensored-SLM-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Uncensored-SLM-GGUF
- Modelo base: https://huggingface.co/mrzenin/Uncensored-SLM
- Pagina de descargas del autor: https://hf.tst.eu/model#Uncensored-SLM-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH: https://www.nethype.de/
