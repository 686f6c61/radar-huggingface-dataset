# mradermacher/Muse-Glimmer-30B-Fable-Distill-GGUF

## Resumen

Muse-Glimmer-30B-Fable-Distill-GGUF es la distribucion en formato GGUF del modelo base armand0e/Muse-Glimmer-30B-Fable-Distill, publicada por el cuantizador mradermacher. Se trata de un transformer de aproximadamente 27.850 millones de parametros (27,85 B) orientado a tareas agenticas, uso de herramientas (tool calling) y conversacion multilingue en siete idiomas: ingles, castellano, frances, aleman, portugues, japones y chino. La ficha del repositorio lo etiqueta como modelo de destilacion, aunque no se detalla en la informacion disponible cual es el modelo profesor ni la metodologia exacta del proceso.

El interes practico de esta publicacion es que traduce un modelo de casi 28 B a cuantizaciones de 2 a 8 bits en formato GGUF, lo que permite ejecutarlo con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) en hardware de consumo de gama alta, o en GPUs profesionales cuando se busca maxima fidelidad. El repositorio incluye ademas dos ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal de entrada, presumiblemente vision, gestionado por el proyector multimodal de llama.cpp.

La licencia es Apache 2.0, lo que facilita su adopcion comercial sin restricciones de uso adicionales. La relevancia actual radica en la combinacion de tamano contenido (27,85 B), contexto agentico, soporte de tool use y multilingue con pesos abiertos y cuantizaciones listas para produccion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de atencion no disponibles) |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repositorio separado |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo original presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que es un transformer con pesos compatibles con transformers y con llama.cpp. Los tags del repositorio indican que se trata de un modelo destilado (distillation), especializado en comportamiento agentico y uso de herramientas, y con cobertura multilingue explicita. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares.

Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o arquitecturas hibridas. La presencia de ficheros mmproj confirma que el modelo base incorpora una torre multimodal (proyector) que permite procesar entradas de imagen ademas de texto, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generacion de texto conversacional multi-turno en siete idiomas.
- Razonamiento y respuesta a instrucciones, con enfasis en tareas agenticas segun los tags del repositorio.
- Uso de herramientas y function calling (tool-use), lo que permite integracion con APIs externas y flujos automatizados.
- Capacidades multimodales de entrada (vision) mediante los ficheros mmproj incluidos.
- Comportamiento de agente multi-paso derivado de su orientacion agentic.
- Soporte multilingue nativo en ingles, castellano, frances, aleman, portugues, japones y chino.
- No se documentan capacidades de audio ni modos de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno en castellano, frances, aleman o portugues, lo que lo hace adecuado para centros de soporte europeos con una sola implementacion.
- Agentes con tool calling: su orientacion agentica permite conectarlo a APIs de reservas, CRM o sistemas de ticketing, gestionando la seleccion de herramientas y la interpretacion de resultados en varios pasos.
- Automatizacion de back-office multilingue: extraccion y resumen de documentos en siete idiomas, con despliegue local en GGUF para cumplir requisitos de soberania de datos.
- Asistentes sobre documentacion tecnica: con cuantizaciones Q5_K_M o Q6_K en una GPU de 24 GB, se puede servir un asistente de consulta interna sin dependencia de la nube.
- Procesamiento de capturas y documentos escaneados: gracias a los ficheros mmproj, el modelo puede recibir imagenes junto al texto, util para digitalizacion de facturas o formularios.
- Prototipado e investigacion en entornos con recursos limitados: las cuantizaciones Q2_K (10,8 GB) y Q3_K_S (12,6 GB) permiten experimentar con un modelo de 27,85 B en GPUs de consumo de 12-16 GB, con la perdida de calidad asociada.
- Despliegue en edge o estaciones de trabajo sin conexion: al ser GGUF y Apache 2.0, encaja en escenarios de inference local con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K 10,8 GB; Q3_K_S 12,6 GB; Q3_K_M 13,8 GB; Q3_K_L 14,8 GB; IQ4_XS 15,4 GB; Q4_K_S 16,2 GB; Q4_K_M 17,0 GB; Q5_K_S 19,4 GB; Q5_K_M 19,9 GB; Q6_K 23,0 GB; Q8_0 29,7 GB.
- Proyector multimodal adicional: mmproj-Q8_0 2,2 GB o mmproj-f16 3,9 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 4090 (24 GB) para Q6_K con margen ajustado; RTX 3090 (24 GB) para Q5_K_M o Q6_K; RTX 4080 (16 GB) para Q4_K_S o IQ4_XS; GPUs de 12 GB para Q2_K o Q3_K_S.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q6_K o inferior, y en GPUs de 12-16 GB con cuantizaciones de 2 a 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con GGUF; el repo original es compatible con transformers. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un modelo denso de 27,85 B en Q4_K_M ocupa 17,0 GB y requiere offloading parcial en GPUs de menos de 24 GB, lo que reduce el throughput frente a una carga completa en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Fable-Distill (este) | 27,85 B | no disponible | Apache 2.0 | GGUF, transformers | Agentico, tool use, 7 idiomas, multimodal via mmproj |
| Modelo base armand0e/Muse-Glimmer-30B-Fable-Distill | 27,85 B | no disponible | Apache 2.0 | safetensors (presumible) | Fuente de las cuantizaciones; mismas capacidades |
| Alternativas de ~30 B densos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni comparativas verificables en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas de tamano similar es desconocido.
- La model card no especifica la longitud de contexto; planificar produccion sin este dato implica riesgo de truncamiento en conversaciones largas.
- El proceso de destilacion no esta documentado: se desconoce el modelo profesor, el dataset y el posible arrastre de sesgos de este.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones de factualidad publicadas.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M.
- El soporte multilingue se limita a los siete idiomas declarados; el rendimiento en otros idiomas no esta verificado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial critico.
- La fecha de creacion del repositorio (2026-08-31) y el volumen de descargas (256) indican una adopcion todavia baja, con escasa validacion comunitaria.
- El modelo base no esta identificado con un desarrollador de referencia en la informacion disponible, lo que dificulta evaluar su procedencia y mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-GGUF
- Modelo base: https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Muse-Glimmer-30B-Fable-Distill-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
