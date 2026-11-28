# mradermacher/MILP-OptiScribe-4B-GGUF

## Resumen

MILP-OptiScribe-4B es un modelo de lenguaje especializado en la generacion de instancias de programacion lineal entera mixta (MILP, por sus siglas en ingles). Lo desarrolla el grupo PSquare-SinglaLab-IITR y esta afinado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre una base de 4.205.751.296 parametros. Su proposito es automatizar una de las tareas mas tediosas en investigacion operativa: redactar y estructurar descripciones de problemas de optimizacion combinatoria en formato formal.

La version aqui descrita es una cuantizacion estatica en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye once variantes de cuantizacion, desde Q2_K (2,1 GB) hasta f16 (8,5 GB), lo que facilita el despliegue en entornos con recursos limitados.

Su relevancia actual radica en la combinacion de un dominio muy vertical (generacion de instancias MILP) con un tamano contenido de 4B parametros, lo que lo hace accesible para prototipado e integracion en pipelines de investigacion operativa sin necesidad de infraestructura de gran escala. La licencia CC-BY-NC-4.0 restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, segun tags de transformers) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun model card) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base, aunque los tags de Hugging Face indican que se trata de un transformer compatible con la libreria `transformers`. El modelo base es PSquare-SinglaLab-IITR/MILP-OptiScribe-4B, con 4.205.751.296 parametros, y esta orientado a la generacion de instancias de programacion lineal entera mixta.

El entrenamiento se realizo mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), segun los tags y la model card. Esta tecnica se emplea habitualmente para afinar el razonamiento y la adherencia a formatos en modelos de lenguaje. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO. Las cuantizaciones publicadas son estaticas y no se han generado variantes ponderadas o con imatrix, segun indica el autor de la cuantizacion.

## Capacidades

- Generacion de instancias de programacion lineal entera mixta (MILP/MIP) y problemas de optimizacion combinatoria.
- Redaccion de descripciones formales de problemas de optimizacion en ingles.
- Razonamiento guiado por refuerzo (GRPO) orientado a la correccion estructural de las instancias generadas.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles segun la model card.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion automatica de instancias MILP para benchmarks: el modelo puede producir descripciones de problemas de optimizacion combinatoria que sirvan como entrada a solvers como Gurobi, CPLEX o HiGHS, acelerando la creacion de conjuntos de prueba en investigacion operativa.
- Aumento de datos para entrenamiento de solvers neuronales: al generar instancias sinteticas variadas, permite ampliar los datasets de modelos que aprenden a resolver MILP, un cuello de botella habitual en este campo.
- Docencia en investigacion operativa: util para generar enunciados de problemas de optimizacion con estructura formal, que el alumnado debe modelar y resolver.
- Prototipado de pipelines de optimizacion: integrado en un flujo que traduzca lenguaje natural a formulaciones MILP, el modelo actua como primer eslabon antes de la validacion con un solver.
- Pruebas de estres de solvers: la generacion de instancias con caracteristicas controladas permite evaluar el rendimiento de solvers comerciales y open source en escenarios diversos.
- Despliegue local en entornos de investigacion: gracias a las cuantizaciones GGUF (desde 2,1 GB en Q2_K), puede ejecutarse en estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita su uso en laboratorios con recursos limitados.
- Experimentacion con RL aplicado a dominios verticales: sirve como referencia para estudiar como GRPO afecta a la calidad estructural en tareas de generacion formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (Q2_K) y 8,5 GB (f16), segun la cuantizacion elegida.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU con al menos 4-8 GB de VRAM puede alojar las cuantizaciones Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8-16 GB) o RTX 4090 (24 GB) con las cuantizaciones Q4_K_M (2,8 GB) o Q6_K (3,6 GB).
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| MILP-OptiScribe-4B (esta ficha) | 4,2B | no disponible | Generacion de instancias MILP | cc-by-nc-4.0 | GGUF, safetensors |
| Modelos generalistas de 3-4B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | 3-4B | 8K-128K | Proposito general | licencias permisivas | GGUF, safetensors |
| Modelos de razonamiento matematico de 7B | ~7B | variable | Matematicas y razonamiento | variable | GGUF, safetensors |

La comparacion directa con alternativas especializadas en MILP no esta disponible en la informacion proporcionada. Frente a modelos generalistas del mismo tamano, la ventaja de MILP-OptiScribe-4B es su especializacion vertical; la desventaja es su licencia no comercial y su limitacion al ingles.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del titular.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: al generar formulaciones formales, puede producir instancias sintacticamente validas pero semanticamente incorrectas o no resolubles, por lo que requiere validacion con un solver.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en problemas de gran escala.
- Las cuantizaciones son estaticas; no hay variantes ponderadas ni con imatrix, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- El modelo base no ha sido evaluado con benchmarks publicos en la informacion disponible, por lo que su calidad real frente a alternativas es dificil de contrastar.
- Uso en produccion: se recomienda validar cada instancia generada con un solver y un verificador de factibilidad antes de integrarla en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MILP-OptiScribe-4B-GGUF
- Modelo base: https://huggingface.co/PSquare-SinglaLab-IITR/MILP-OptiScribe-4B
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#MILP-OptiScribe-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
