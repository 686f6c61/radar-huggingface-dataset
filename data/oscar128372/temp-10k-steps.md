# oscar128372/temp-10k-steps

## Resumen

`oscar128372/temp-10k-steps` es un modelo de lenguaje de tipo transformer decoder-only de tamano muy reducido (2.203.653 parametros reales segun los pesos en safetensors, ~2,19M segun el autor), publicado por el usuario independiente oscar128372 en Hugging Face bajo licencia MIT. Se trata de un checkpoint intermedio de entrenamiento: el autor indica explicitamente que es un "test model" y que solo ha completado 10.000 de los 30.000 pasos previstos, tras 2 horas de entrenamiento y 655 millones de tokens procesados.

La relevancia de este modelo no reside en su rendimiento —los benchmarks publicados estan proximos al azar en varias tareas— sino en su valor como artefacto de experimentacion: documenta una eleccion de arquitectura poco habitual ("mas ancho y menos profundo", L=3, d_model=192) motivada por la restriccion de entrenar en una GPU T4 en la nube, que no puede ejecutar profundidades mayores con rapidez incluso reduciendo dimensiones. Es, por tanto, un ejemplo de diseno condicionado por el hardware mas que por el objetivo de maximizar calidad.

No hay informacion sobre el pipeline declarado, el dataset de entrenamiento, la tokenizacion ni el proceso de alineacion. El modelo solo declara soporte de ingles y no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (L=3, d_model=192), mas ancho que profundo |
| Parametros totales | 2.203.653 (pesos safetensors); ~2,19M segun el autor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pasos de entrenamiento | 10.000 de 30.000 (checkpoint intermedio) |
| Tokens de entrenamiento | 655M |
| Region | us |

## Arquitectura y entrenamiento

El autor describe un transformer de 3 capas con dimension de modelo 192, deliberadamente "mas ancho y menos profundo". La justificacion es operativa: una GPU T4 en la nube no puede ejecutar profundidades mayores con velocidad aceptable incluso reduciendo la dimension, de modo que se priorizo el ancho para mantener capacidad con menos capas. No se especifica el numero de cabezas de atencion, la dimension de la capa feed-forward, la funcion de activacion, el tipo de normalizacion ni el tokenizador empleado.

El entrenamiento consumio 2 horas y proceso 655M tokens en 10.000 pasos de un plan de 30.000, lo que situa el checkpoint en un tercio del recorrido previsto. No hay informacion sobre la composicion del dataset, el uso de RLHF, DPO u otra forma de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta la tasa de aprendizaje, el tamano de batch ni la precision numerica usada.

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada por el estado temprano del entrenamiento.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con rendimiento cercano al azar en las pruebas publicadas.
- Aritmetica simple: el autor reporta 34,8% en ArithMark-3 normalizado.
- Capacidad multilingue: no disponible; solo declara ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion educativa sobre arquitecturas anchas y poco profundas: sirve para reproducir y estudiar el efecto de L=3 y d_model=192 en la curva de aprendizaje frente a configuraciones mas profundas.
- Pruebas de infraestructura de inferencia: al pesar unos pocos megabytes, permite validar pipelines con vLLM, llama.cpp u Ollama sin coste de GPU significativo.
- Test de integracion en CI/CD: util como modelo de juguete para verificar que un servicio de generacion de texto arranca, responde y se apaga correctamente antes de desplegar modelos reales.
- Benchmarking de herramientas de evaluacion: su reducido tamano permite correr suites como lm-evaluation-harness en minutos para comprobar que la configuracion de las metricas es correcta.
- Investigacion sobre entrenamiento con restricciones de hardware: documenta empiricamente que configuracion es viable en una T4 y con que coste en calidad.
- Docencia y talleres: ejemplo manejable para explicar el ciclo completo de preentrenamiento, publicacion de pesos y evaluacion con benchmarks estandar.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark (normalizado) | Resultado |
|---|---|
| HellaSwag | 32,70% |
| ARC-Easy | 29,40% |
| ARC-Challenge | 18,60% |
| PIQA | 54,4% |
| ArithMark-3 | 34,8% |
| Wikitext PPL (escalada a GPT-2) | 33,40 |
| Open SLM Leaderboard Intelligence Index (aprox.) | 7,18 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Los valores son coherentes con un modelo de ~2M de parametros entrenado solo 655M tokens: HellaSwag y ARC-Easy quedan en el entorno del azar o ligeramente por encima, mientras que PIQA (54,4%) y Wikitext PPL (33,40) reflejan un aprendizaje incipiente del lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 9 MB de pesos); en la practica, cualquier GPU con al menos 1-2 GB es suficiente.
- GPU recomendadas: no requiere GPU dedicada; una T4, una GTX 1650 o incluso CPU son suficientes. El autor entreno en una T4 en la nube.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en Raspberry Pi.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables por tamano, aunque la compatibilidad real depende de que la arquitectura concreta este soportada por cada runtime; no se ha verificado en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano, se espera latencia de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| oscar128372/temp-10k-steps | 2,20M | no disponible | MIT | Checkpoint intermedio (10k/30k pasos) |
| Modelos tipo TinyStories (p. ej., roneneldan/TinyStories-1M) | ~1M-33M | 512-2048 tokens tipico | MIT / otras | Entrenados en dominio sintetico; no comparables en benchmark estandar |
| GPT-2 small | 124M | 1024 tokens | MIT | Referencia historica de modelos pequenos |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa directa. La comparativa se limita a parametros, licencia y estado del artefacto.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 10.000 de 30.000 pasos completados, por lo que la calidad esta lejos de la configuracion final prevista.
- Rendimiento proximo al azar en HellaSwag (32,70%) y ARC-Easy (29,40%); no es apto para tareas de conocimiento o razonamiento en produccion.
- Riesgo elevado de alucinacion y de generar texto incoherente por el escaso entrenamiento y el reducido numero de parametros.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Longitud de contexto no documentada, lo que impide garantizar conversaciones multi-turno o documentos largos.
- Sesgos: no documentados, pero al no conocerse la composicion del dataset no puede descartarse la presencia de sesgos de la web.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no ofrece garantias de calidad ni de idoneidad para produccion.
- No hay informacion sobre tokenizador, por lo que la integracion con herramientas estandar puede requerir inspeccion manual de los ficheros del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/oscar128372/temp-10k-steps
- Perfil del autor: https://huggingface.co/oscar128372
- Datasets del autor: https://huggingface.co/oscar128372/datasets
- Dataset chess_spatial_reasoning_10k: https://huggingface.co/datasets/oscar128372/chess_spatial_reasoning_10k
