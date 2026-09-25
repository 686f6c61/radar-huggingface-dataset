# mradermacher/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-i1-GGUF

## Resumen

CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-i1-GGUF es la version cuantizada en formato GGUF del modelo OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic, publicada por el usuario mradermacher. Se trata de una cuantizacion con calibracion imatrix (quants de la serie i1) de un modelo de ~25.200 millones de parametros afinado para ciberseguridad, con las capas de alineacion de seguridad eliminadas (proceso conocido como abliteration o decensoring) y orientado a razonamiento sobre contenido tecnico ofensivo y defensivo.

El modelo base parte de la familia Gemma, segun la etiqueta `gemma` declarada en la model card, y su nomenclatura A4B apunta a una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token, aunque este dato no se confirma explicitamente en la documentacion disponible. El repositorio cuantizado ocupa 63,1 GB y ofrece varias tallas de cuantizacion para distintos presupuestos de VRAM, desde 10,7 GB en i1-Q2_K hasta 15,6 GB en i1-Q4_K_S.

La relevancia de esta ficha es doble: por un lado, permite desplegar un modelo de ~25B en GPU de consumo gracias a la cuantizacion; por otro, conviene tener presente que se trata de un modelo deliberadamente sin censura, con licencia Apache 2.0, y cuyos datos de entrenamiento, evaluaciones y comportamiento real no estan documentados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura A4B y la etiqueta `gemma`; no detallada en la model card |
| Parametros totales | 25.233.142.046 (~25,2B), segun safetensors del modelo base; el nombre comercial indica 26B |
| Parametros activos | Aproximadamente 4B segun la nomenclatura A4B del nombre; no confirmado en la documentacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): i1-Q2_K (10,7 GB), i1-IQ3_M (12,5 GB), i1-Q4_K_S (15,6 GB). Lista declarada de quants: Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Multilingue, ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors/BF16 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de las etiquetas declaradas: `gemma`, `fine-tuned`, `reasoning` y `BF16`. La nomenclatura del nombre, 26B-A4B, sigue la convencion habitual en modelos de mezcla de expertos (MoE), donde el primer numero indica los parametros totales y el segundo los parametros activos por token, lo que situaria al modelo en torno a 4.000 millones de parametros activos sobre un total de 25.200 millones. Esta interpretacion es coherente con el recuento real de parametros del safetensors, pero no aparece confirmada explicitamente en la documentacion consultada.

Tampoco se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Lo unico documentado por el autor de la cuantizacion es el proceso de cuantizacion: quants ponderados con fichero imatrix, generados con llama.cpp, en los que se emplea una matriz de importancia para preservar mejor la calidad de los tensores mas sensibles. Las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated` indican que el modelo base ha sufrido un proceso de eliminacion o supresion de las capas de rechazo, aunque los detalles tecnicos de ese proceso no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, con etiqueta explicita `conversational` en el repositorio.
- Razonamiento (`reasoning`) como capacidad declarada en las etiquetas del modelo.
- Contenido especializado en ciberseguridad y seguridad (`cybersecurity`, `security`), presumiblemente en tareas de analisis, explicacion y asistencia tecnica ofensiva y defensiva.
- Capacidades multilingues declaradas: multilingue, ingles y japones.
- Modelo sin censura (abliterated/decensored): no aplica rechazo por defecto ante peticiones que otros modelos alineados bloquearian.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la etiqueta `reasoning` sugiere cierta capacidad en esta linea.
- Capacidades de vision o audio: no disponibles; no se declara ninguna modalidad adicional a texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de vulnerabilidades en entornos controlados: el modelo puede utilizarse para revisar fragmentos de codigo o configuraciones y explicar posibles vectores de ataque, dentro de un laboratorio de seguridad autorizado, gracias a su especializacion declarada en ciberseguridad.
- Redaccion de informes tecnicos de seguridad: generacion de documentacion de hallazgos, resumenes de pentest y recomendaciones de mitigacion, aprovechando la orientacion tecnica del ajuste fino.
- Formacion y concienciacion en seguridad: creacion de escenarios, explicaciones de tecnicas de ataque y defensa para materiales de formacion interna, con la ventaja de que el modelo no bloquea contenido tecnico sensible.
- Asistente local de investigacion: al distribuirse en GGUF y caber en GPU de consumo en sus cuantizaciones bajas, permite trabajar con material sensible sin enviar datos a servicios en la nube.
- Analisis de logs y trazas: procesamiento y resumen de registros de sistemas para identificar patrones anomalos o intentos de intrusion, siempre que la ventana de contexto del modelo lo permita (no documentada).
- Soporte multilingue para equipos en ingles y japones: redaccion y traduccion tecnica de documentacion de seguridad entre ambos idiomas, segun los idiomas declarados.
- Base para ajuste fino posterior: al estar bajo licencia Apache 2.0 y en formato GGUF, puede servir como punto de partida para experimentos de cuantizacion o comparativas de calidad entre tallas (Q2_K frente a IQ3_M o Q4_K_S).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado evaluaciones en la busqueda web realizada.

## Requisitos de hardware

Las estimaciones siguientes se derivan del tamano de los ficheros GGUF publicados y son aproximadas; no incluyen el consumo adicional de la cache KV, que depende del contexto configurado.

- i1-Q2_K (10,7 GB): cabe en GPU de 12 GB de VRAM (RTX 3060 12 GB, RTX 4070) y en Apple Silicon con 16 GB de memoria unificada.
- i1-IQ3_M (12,5 GB): requiere en torno a 14 GB de VRAM; GPU de 16 GB como RTX 4060 Ti 16 GB o RTX 4080.
- i1-Q4_K_S (15,6 GB): requiere en torno a 17-18 GB de VRAM; cabe en RTX 4090, RTX 3090, RTX 5090 o A5000 de 24 GB, dejando margen para contexto.
- Modelo base en BF16 (~50 GB de pesos): necesita una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto entre varias GPU.
- Ejecucion en CPU: viable con llama.cpp usando RAM del sistema, con velocidad muy inferior a la de GPU; el fichero mas pequeno (10,7 GB) permite despliegue en equipos con 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no estan orientados a GGUF en su flujo habitual, por lo que se recomienda el ecosistema llama.cpp.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el modelo consigo mismo en sus distintas distribuciones. No se han podido confirmar datos verificables de modelos de terceros de la misma categoria (mismo tamano o misma tarea) a partir de la busqueda web realizada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-i1-GGUF (este modelo) | ~25,2B totales (A4B) | no disponible | GGUF i1 (imatrix) | Apache 2.0 | Repositorio de mradermacher, 0 descargas, 1 like |
| CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF (quants estaticos) | ~25,2B totales (A4B) | no disponible | GGUF estatico | Apache 2.0 | Repositorio de mradermacher |
| OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic (base) | 25.233.142.046 | no disponible | safetensors / BF16 | Apache 2.0 | Modelo base en HuggingFace |
| Alternativas de terceros de tamano o tarea similares | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated/decensored: las capas de rechazo han sido suprimidas deliberadamente, por lo que puede generar contenido danino, ilegal o peligroso sin filtros. No es apto para despliegue publico sin moderacion externa.
- Riesgo de uso dual en ciberseguridad: el ajuste fino orientado a seguridad puede producir instrucciones explotables. Cualquier uso debe enmarcarse en entornos autorizados y con supervision humana.
- Alucinacion: no hay evaluaciones publicadas de fidelidad factual; en dominios tecnicos, una alucinacion puede traducirse en comandos, scripts o recomendaciones incorrectas con impacto real.
- Idiomas: se declaran multilingue, ingles y japones, pero no hay datos sobre la calidad relativa en cada idioma ni sobre el castellano en particular.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Ausencia de benchmarks: no existe ninguna medicion publica de rendimiento, por lo que no es posible comparar objetivamente con alternativas ni estimar la perdida de calidad entre cuantizaciones.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor original no ofrece garantias ni asume responsabilidad por el uso del modelo.
- Cuantizacion agresiva: las tallas Q2_K e IQ3_M degradan la calidad de forma perceptible; la propia model card recomienda IQ3_XXS frente a Q2_K y senala Q4_K_S como el punto optimo entre tamano, velocidad y calidad.
- Trazabilidad limitada: la model card del repositorio cuantizado no documenta el proceso de abliteration, los datos de entrenamiento ni los criterios de evaluacion del modelo base.
- Busqueda web sin resultados utiles: las consultas realizadas devolvieron exclusivamente contenido no relacionado con el modelo, por lo que no se ha podido contrastar informacion externa.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-i1-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devolvieron contenido no relacionado.
