# mradermacher/OneJev-0.8B-GGUF

## Resumen

OneJev-0.8B-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo OmniJev/OneJev-0.8B, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El repositorio no contiene un modelo entrenado desde cero, sino conversiones del modelo base a distintos niveles de precisión (de Q2_K a f16), junto con dos ficheros `mmproj` que acompañan a la parte multimodal. El modelo base tiene 1.006.672.704 parámetros (aproximadamente 1,0 B) y se distribuye bajo licencia Apache-2.0.

Según las etiquetas declaradas en el repositorio, el modelo se orienta a tareas de decisión (`decision-model`, `calibration`, `system-one`), con capacidades multimodales (`multimodal`, `video`) y uso como agente sobre interfaces gráficas (`gui-agent`). El idioma declarado es únicamente el inglés (`en`). La model card del repositorio cuantizado no incluye información sobre arquitectura, datos de entrenamiento, longitud de contexto ni procedimiento de alineación, por lo que esos datos se marcan como no disponibles en esta ficha.

La relevancia práctica de esta ficha radica en que ofrece una vía de despliegue local muy ligera: los ficheros cuantizados ocupan entre 0,6 GB (Q2_K) y 0,9 GB (Q6_K), lo que permite ejecutar el modelo en hardware de gama baja, incluida CPU, y en GPUs de consumo con muy poca VRAM. Al mismo tiempo, conviene advertir de que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y de que la documentación publicada es mínima, lo que limita la evaluación previa a un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del repositorio cuantizado no la describe); la presencia de ficheros `mmproj` indica que el modelo base incorpora un proyector multimodal para entrada de imagenes o video |
| Parametros totales | 1.006.672.704 (~1,0 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors via transformers) |

Datos adicionales del repositorio: tamano total del repo 9,9 GB, biblioteca declarada `transformers`, pipeline no disponible, creado el 27 de septiembre de 2026 y actualizado el mismo dia. No se ofrecen cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base OmniJev/OneJev-0.8B: la model card del repositorio cuantizado no describe el tipo de red (transformer, MoE, SSM o hibrida), la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF, DPO u otro tipo de alineacion. Tampoco se documenta la longitud de contexto nativa ni la estrategia de atencion.

Lo unico verificable a partir de los ficheros publicados es que el repositorio incluye dos variantes del proyector multimodal (`OneJev-0.8B.mmproj-Q8_0.gguf`, de 0,2 GB, y `OneJev-0.8B.mmproj-f16.gguf`, de 0,3 GB), lo que es coherente con las etiquetas `multimodal` y `video` del modelo y con el flujo habitual de llama.cpp para modelos con entrada de imagen o video. El proceso de cuantizacion aplicado por mradermacher es estatico (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), sin ficheros de imatrix asociados. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Orientacion a modelado de decisiones (`decision-model`) y a la produccion de salidas con calibracion (`calibration`), segun las etiquetas declaradas.
- Capacidades multimodales: el repositorio incluye proyectores `mmproj`, lo que habilita el procesamiento de entradas visuales en runtime compatibles con llama.cpp.
- Procesamiento de video, segun la etiqueta `video`.
- Uso como agente sobre interfaces graficas (`gui-agent`), etiqueta que sugiere aplicaciones de automatizacion de escritorio o navegacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso y razonamiento encadenado: no disponible en la informacion proporcionada (la etiqueta `gui-agent` apunta a uso agentico, pero no se detalla el mecanismo).
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modo de razonamiento explicito (_thinking mode_), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de interfaces graficas: con la etiqueta `gui-agent`, el modelo puede emplearse como componente de decision de un agente que interpreta capturas de pantalla y decide la siguiente accion sobre una aplicacion de escritorio o web, ejecutandose en local gracias a su tamano reducido.
- Analisis de video en el borde: al incluir proyectores `mmproj` y la etiqueta `video`, es viable integrarlo en un pipeline que reciba fotogramas y genere descripciones o decisiones, con coste de VRAM muy bajo en comparacion con modelos multimodales de mayor tamano.
- Clasificacion o puntuacion con calibracion: las etiquetas `decision-model` y `calibration` apuntan a su uso como modulo que asigna una decision acompanada de una medida de confianza, por ejemplo en encaminamiento de peticiones o filtrado previo.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (0,7 GB y 0,8 GB respectivamente) permiten ejecutar inferencia en CPU, en mini-PC o en GPUs de gama de entrada, sin necesidad de aceleradores dedicados.
- Prototipado rapido y pruebas de concepto: dado que hay 14 ficheros GGUF con distintos niveles de precision, es posible comparar el impacto de la cuantizacion en la calidad de salida antes de comprometerse con una version concreta.
- Aplicaciones de investigacion sobre modelos pequenos: sirve como punto de partida para experimentos de destilacion, evaluacion de calibracion o comparativas de eficiencia frente a otros modelos de ~1 B.
- Preprocesado o enrutado dentro de un sistema mayor: por su baja latencia esperable y su tamano, puede actuar como primer filtro que decida si una consulta requiere un modelo de mayor capacidad.
- Demo local desconectada de red: al no requerir API externa, encaja en entornos con requisitos de privacidad donde los datos no pueden salir de la maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni los resultados de busqueda web consultados incluyen valores de MMLU, HumanEval, GSM8K, MMBench o cualquier otra metrica para OneJev-0.8B ni para sus cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): de 0,6 GB (Q2_K, Q3_K_S) a 0,7 GB (Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S), 0,8 GB (Q4_K_M, Q5_K_S), 0,9 GB (Q5_K_M, Q6_K), 1,2 GB (Q8_0) y 2,1 GB (f16). A estas cifras hay que sumar la cache KV y el proyector multimodal (0,2 GB en Q8_0 o 0,3 GB en f16) si se usan entradas visuales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5. Se pueden citar como referencia RTX 3050, RTX 3060, RTX 4060, GTX 1650 o superiores; tambien es viable en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si. Incluso las cuantizaciones mas grandes (Q8_0, f16) caben holgadamente en GPUs de consumo con 8 GB o mas.
- Ejecucion en CPU: si, es el escenario natural para estos tamanos. Modelos de ~1 B en Q4 funcionan de forma interactiva en CPU de escritorio moderno y de forma mas lenta en placas tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui (o cualquier runtime compatible con GGUF). El soporte de GGUF en vLLM existe pero es experimental y no se garantiza para este modelo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y la model card no incluye datos de velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los valores de contexto de los modelos alternativos proceden de su documentacion publica general y no han sido verificados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev-0.8B-GGUF (mradermacher) | ~1,0 B | no disponible | Si (mmproj para imagen/video) | Apache-2.0 | GGUF (14 variantes) + base en safetensors |
| mradermacher/CLM-0.8B-GGUF | ~0,8 B | no disponible | No indicado | Apache-2.0 | GGUF |
| Qwen2.5-0.5B / Qwen3-0.6B | 0,5-0,6 B | 32.768 tokens segun documentacion publica | No | Apache-2.0 | safetensors, GGUF en repos de terceros |
| Llama-3.2-1B | 1,24 B | 128.000 tokens segun documentacion publica | No | Llama 3.2 Community License | safetensors, GGUF en repos de terceros |

No se dispone de benchmarks comparativos entre estos modelos dentro de la informacion consultada, por lo que no es posible establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Documentacion minima: la model card solo describe el proceso de cuantizacion, no el modelo. No hay informacion sobre dataset, alineacion, contexto ni evaluaciones, lo que impide auditar su comportamiento.
- Idiomas: el campo `language` declara unicamente ingles. No hay evidencia de soporte para castellano u otros idiomas, por lo que su uso en produccion multilingue no esta justificado con los datos disponibles.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; con ~1 B de parametros la tasa de error factual suele ser alta y no se ha publicado ninguna evaluacion al respecto.
- Sesgos: no disponible. El autor no documenta analisis de sesgo ni composicion del dataset de entrenamiento.
- Cuantizaciones agresivas: Q2_K y las variantes Q3 degradan la calidad de forma apreciable (el propio autor marca Q3_K_M como "lower quality"). Para uso real se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones ponderadas o con imatrix: el autor indica que no estan disponibles en el momento de la publicacion, lo que limita la relacion calidad/tamano en los niveles bajos.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de fallos conocidos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la licencia se hereda del modelo base OmniJev/OneJev-0.8B; conviene verificar que ese repositorio mantiene la misma licencia y no impone condiciones adicionales.
- Fecha de publicacion inusual (27 de septiembre de 2026) y actualizacion practicamente inmediata; conviene comprobar que el repositorio sigue activo antes de integrarlo en un pipeline.
- Uso multimodal: requiere cargar el fichero `mmproj` correspondiente y un runtime con soporte para el; cargar solo el GGUF principal desactiva las capacidades visuales.
- Produccion: sin benchmarks, sin contexto documentado y sin soporte declarado de tool calling, cualquier despliegue en entornos criticos exigiria una evaluacion propia previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneJev-0.8B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev-0.8B
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#OneJev-0.8B-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de la empresa del autor: https://www.nethype.de/
