# mradermacher/RaifuWars-Warrior-Qwen3VL-4B-v2-GGUF

## Resumen

RaifuWars-Warrior-Qwen3VL-4B-v2-GGUF es la distribucion en formato GGUF del modelo yotisstudios/RaifuWars-Warrior-Qwen3VL-4B-v2, un ajuste fino (SFT sobre LoRA) del modelo multimodal Qwen3-VL de 4B parametros. El trabajo de cuantizacion lo firma mradermacher, un actor habitual en el ecosistema de cuantizaciones GGUF, que publica versiones estaticas listas para usar con llama.cpp y derivados. El modelo esta especializado en agentes, uso de herramientas (tool calling) y function calling dentro del contexto del denominado "warrior-protocol" del proyecto RaifuWars, un entorno orientado a juegos.

La relevancia practica de esta ficha esta en que ofrece un modelo de 4.022.468.096 parametros (unos 4B) con capacidades multimodales heredadas de Qwen3-VL, empaquetado en cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), lo que permite desplegarlo en hardware de consumo. El entrenamiento se realizo sobre el dataset yotisstudios/RaifuWars-Warrior-SFT-v2 y esta declarado unicamente en ingles.

Es importante senalar que la model card del repositorio GGUF es una plantilla de cuantizacion: no documenta arquitectura interna, contexto nativo, composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge lo que consta en la informacion disponible y marca explicitamente como "no disponible" todo lo que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3-VL, familia transformer multimodal; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino por SFT sobre LoRA del Qwen3-VL de 4B, segun los tags del repositorio (lora, sft) y el campo base_model. Esto implica que conserva la arquitectura del modelo original de Qwen (transformer multimodal con torre de vision, dado que se proporcionan ficheros mmproj para el procesamiento de imagenes), pero la informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni el contexto nativo. El ajuste esta orientado a comportamiento agentico: los tags incluyen agents, tool-use, function-calling, games, raifu-wars y warrior-protocol, lo que sugiere un entrenamiento centrado en la seleccion y ejecucion de herramientas dentro de un protocolo de juego concreto.

El dataset de entrenamiento declarado es yotisstudios/RaifuWars-Warrior-SFT-v2. No se publica el numero de tokens, la composicion del dataset, si hubo etapas de RLHF o DPO, ni detalles sobre la estrategia de congelacion de capas durante el LoRA. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1), y en el momento de la publicacion no habia cuantizaciones ponderadas/imatrix disponibles; solo estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno (tag conversational).
- Uso de herramientas y function calling, segun los tags tool-use y function-calling.
- Comportamiento agentico orientado a tareas y juegos (agents, games, warrior-protocol).
- Procesamiento multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp y derivados.
- Capacidad de seguir instrucciones derivada del SFT sobre el modelo base Qwen3-VL.
- No se documentan capacidades de audio, thinking mode explicito, ni soporte multilingue mas alla del ingles declarado.

## Casos de uso

- Agentes de juego y simulacion: el modelo esta entrenado sobre el protocolo "warrior" de RaifuWars, por lo que encaja en la generacion de acciones y decisiones de agentes dentro de entornos ludicos, con llamadas a funciones que representan acciones del juego.
- Orquestacion de herramientas en pipelines locales: al soportar function calling y caber en GPUs de consumo en cuantizaciones Q4, puede ejecutar tareas de enrutamiento de herramientas en un portatil o estacion de trabajo sin depender de la nube.
- Prototipado rapido de asistentes conversacionales en ingles: con Q4_K_M (2,6 GB) se puede levantar un endpoint compatible con OpenAI (tag endpoints_compatible) para pruebas de integracion antes de migrar a un modelo mayor.
- Procesamiento de imagenes con descripcion textual: gracias a los ficheros mmproj, se puede usar para tareas de captioning o extraccion de informacion de capturas de pantalla en un flujo local, siempre que la calidad del ajuste fino lo permita.
- Evaluacion de tecnicas de cuantizacion: al ofrecer 12 variantes de cuantizacion mas dos de mmproj, es util para comparar degradacion de calidad frente a tamano en un modelo de 4B, por ejemplo midiendo la tasa de acierto en llamadas a herramientas entre Q4_K_M y Q8_0.
- Educacion y experimentacion con modelos multimodales pequenos: su licencia Apache 2.0 y su tamano permiten usarlo en cursos o talleres sin restricciones de uso comercial, aunque con la advertencia de que el dominio esta acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache): Q2_K ~1,8 GB; Q3_K_M ~2,2 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. El componente multimodal anade ~0,6 GB (mmproj-Q8_0) o ~0,9 GB (mmproj-f16).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM permite Q4_K_M o Q5_K_M con margen para contexto; una RTX 4090 (24 GB) permite f16 o Q8_0 con contexto amplio; A100 y H100 no son necesarias para este tamano y solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si. Ejemplos razonables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; tambien en iGPU con memoria unificada usando Q4_K_S o inferiores.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-server), dado que el formato es GGUF; el tag endpoints_compatible sugiere compatibilidad con APIs estilo OpenAI. vLLM y TGI no son la via natural para estos ficheros GGUF, aunque el modelo base en transformers podria servirse con ellos si se dispone de los pesos originales.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RaifuWars-Warrior-Qwen3VL-4B-v2-GGUF | 4,02B | no disponible | si (mmproj) | Apache 2.0 | GGUF | Ajuste fino agentico para juegos; solo ingles |
| Qwen3-VL-4B (modelo base) | ~4B | no disponible en esta ficha | si | segun Qwen (no verificada aqui) | safetensors, GGUF de terceros | Capacidades generales, sin especializacion en juegos |
| Qwen2.5-3B-Instruct | ~3B | no disponible en esta ficha | no | Apache 2.0 | safetensors, GGUF | Alternativa texto-only de tamano similar; sin vision |
| Llama 3.2 3B Instruct | ~3B | no disponible en esta ficha | no | Llama 3.2 Community License | safetensors, GGUF | Restricciones de licencia para uso comercial; sin vision |

La comparacion se limita a tamano, licencia y disponibilidad de formato, porque no hay datos de rendimiento publicados para este ajuste fino. Cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a agentes de juego y al protocolo "warrior"; el rendimiento en tareas generales puede degradarse respecto al Qwen3-VL original por sobreajuste al dominio.
- Solo ingles declarado: no hay evidencia de soporte de castellano ni de otros idiomas; usarlo en produccion multilingue requeriria evaluacion propia.
- Sin benchmarks publicados: no se puede verificar la calidad del ajuste ni compararla con alternativas; cualquier decision de produccion deberia apoyarse en una evaluacion interna.
- Riesgo de alucinacion: inherente a los modelos de 4B; en function calling puede generar nombres de herramientas o argumentos invalidos, por lo que se recomienda validacion estricta de esquemas.
- Contexto desconocido: al no publicarse la longitud de contexto, no se debe asumir la del Qwen3-VL original sin verificar en la configuracion del modelo base.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; para uso agentico se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL y del dataset de SFT, que no se detallan en la informacion disponible.
- Procedencia: el repositorio es una cuantizacion de terceros (mradermacher), no la publicacion oficial del autor del ajuste fino; para trazabilidad conviene consultar el repositorio original yotisstudios/RaifuWars-Warrior-Qwen3VL-4B-v2.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RaifuWars-Warrior-Qwen3VL-4B-v2-GGUF
- Modelo base: https://huggingface.co/yotisstudios/RaifuWars-Warrior-Qwen3VL-4B-v2
- Dataset de SFT: https://huggingface.co/datasets/yotisstudios/RaifuWars-Warrior-SFT-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RaifuWars-Warrior-Qwen3VL-4B-v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
