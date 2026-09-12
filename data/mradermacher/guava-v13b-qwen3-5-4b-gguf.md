# mradermacher/guava-v13b-qwen3.5-4b-GGUF

## Resumen

El modelo `mradermacher/guava-v13b-qwen3.5-4b-GGUF` es una distribucion en formato GGUF del modelo `AIcell/guava-v13b-qwen3.5-4b`, publicada por el usuario mradermacher, especializado en cuantizacion de pesos para inferencia local. Se trata de un modelo de vision-lenguaje-accion (VLA, vision-language-action) orientado a robotica y manipulacion, construido sobre un backbone de la familia Qwen3.5 con aproximadamente 4.200 millones de parametros. El pipeline declarado en HuggingFace es `robotics`, y las etiquetas del repositorio incluyen `vision-language-action` y `manipulation`.

El problema que resuelve es el de permitir ejecutar un modelo VLA de ~4B en hardware de consumo mediante cuantizacion, algo inviable con los pesos originales en precision completa. Esta version ofrece 12 niveles de cuantizacion distintos (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), mas dos ficheros `mmproj` que contienen la parte multimodal (proyector de vision) en Q8_0 y f16. Es relevante ahora porque la robotica basada en modelos fundacionales esta pasando de prototipos en cluster a despliegues en estaciones locales, y las cuantizaciones GGUF son el formato dominante para ese escenario.

Hay que senalar que el repositorio no incluye model card propia del autor del modelo base: la unica documentacion disponible es la plantilla generada por mradermacher para la cuantizacion. No se publican detalles de entrenamiento, contexto, licencia ni benchmarks, y el numero de descargas y likes es cero en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje-accion; backbone de la familia Qwen3.5 segun el identificador del modelo base) |
| Parametros totales | 4.205.751.296 (~4,2 B), dato real de safetensors |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; adicionalmente mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 39,9 GB (conjunto de todas las cuantizaciones) |
| Modelo base | AIcell/guava-v13b-qwen3.5-4b |
| Libreria declarada | transformers |
| Pipeline | robotics |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

Desglose de ficheros y tamanos declarados por el autor:

| Fichero | Tipo | Tamano (GB) | Notas |
|---|---|---|---|
| guava-v13b-qwen3.5-4b.mmproj-Q8_0.gguf | mmproj-Q8_0 | 0,5 | suplemento multimodal |
| guava-v13b-qwen3.5-4b.mmproj-f16.gguf | mmproj-f16 | 0,8 | suplemento multimodal |
| guava-v13b-qwen3.5-4b.Q2_K.gguf | Q2_K | 2,0 | |
| guava-v13b-qwen3.5-4b.Q3_K_S.gguf | Q3_K_S | 2,2 | |
| guava-v13b-qwen3.5-4b.Q3_K_M.gguf | Q3_K_M | 2,4 | calidad inferior |
| guava-v13b-qwen3.5-4b.Q3_K_L.gguf | Q3_K_L | 2,5 | |
| guava-v13b-qwen3.5-4b.IQ4_XS.gguf | IQ4_XS | 2,6 | |
| guava-v13b-qwen3.5-4b.Q4_K_S.gguf | Q4_K_S | 2,7 | rapido, recomendado |
| guava-v13b-qwen3.5-4b.Q4_K_M.gguf | Q4_K_M | 2,8 | rapido, recomendado |
| guava-v13b-qwen3.5-4b.Q5_K_S.gguf | Q5_K_S | 3,1 | |
| guava-v13b-qwen3.5-4b.Q5_K_M.gguf | Q5_K_M | 3,2 | |
| guava-v13b-qwen3.5-4b.Q6_K.gguf | Q6_K | 3,6 | muy buena calidad |
| guava-v13b-qwen3.5-4b.Q8_0.gguf | Q8_0 | 4,6 | rapido, mejor calidad |
| guava-v13b-qwen3.5-4b.f16.gguf | f16 | 8,5 | 16 bpw, sobredimensionado |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base `AIcell/guava-v13b-qwen3.5-4b`. Por el identificador y por el prefijo `qwen3.5-4b` cabe inferir un backbone transformer de la familia Qwen3.5 con aproximadamente 4B de parametros, sobre el que se anadiria un codificador visual y una cabeza de accion para tareas de manipulacion robotica, dado que la pipeline declarada es `robotics` y que la cuantizacion incluye ficheros `mmproj` (proyector multimodal). Esta inferencia no esta confirmada por ninguna documentacion del autor.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado sobre trayectorias de robot. La model card del repositorio de cuantizacion es una plantilla automatica de mradermacher y no incluye informacion tecnica del modelo original. No se declara ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, arquitectura hibrida SSM, etc.) en la informacion disponible.

En cuanto al proceso de cuantizacion, la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica una conversion desde pesos en formato HuggingFace. El autor senala que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion y que no necesariamente se van a generar; pueden solicitarse mediante una discusion en la comunidad del repositorio.

## Capacidades

- Generacion multimodal orientada a accion: el modelo esta etiquetado como `vision-language-action`, lo que implica entrada de imagen y texto y salida orientada a decisiones de manipulacion.
- Manipulacion robotica: la etiqueta `manipulation` y la pipeline `robotics` indican uso previsto en control de brazos o efectores en entornos fisicos.
- Procesamiento de vision: la presencia de ficheros `mmproj` en la cuantizacion confirma un componente de proyeccion visual que debe cargarse junto al modelo principal.
- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se especifica el formato de prompt ni la plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`language: en`); no se declaran otros idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo recibe imagenes de camara y una instruccion en lenguaje natural y emite acciones de control. Su tamano de ~4B en cuantizacion Q4_K_M (2,8 GB) permite ejecutarlo en la propia estacion robotica sin depender de un cluster externo.
- Prototipado de politicas VLA en investigacion: al disponer de 12 niveles de cuantizacion, un equipo puede comparar el impacto de la precision en el exito de la tarea usando exactamente los mismos pesos base, desde Q2_K hasta f16.
- Robotica educativa y de bajo presupuesto: la cuantizacion Q3_K_S (2,2 GB) o Q4_K_S (2,7 GB) cabe en GPUs de gama media y permite montar bancos de pruebas de bajo coste para ensenar tecnicas de VLA.
- Despliegue en el borde (edge) sobre hardware embebido: con Q2_K de 2,0 GB mas el proyector mmproj-Q8_0 de 0,5 GB, el conjunto ocupa unos 2,5 GB, compatible con plataformas embebidas con GPU integrada de 8 GB o superiores.
- Evaluacion comparativa de backbones Qwen3.5 frente a otras familias VLA: util para investigadores que quieran medir si un backbone denso de 4B rinde mejor que alternativas de 7B en tareas de manipulacion con presupuesto de computo reducido.
- Integracion en simuladores de robotica: al ser un GGUF compatible con llama.cpp, puede conectarse a entornos tipo MuJoCo, Isaac Sim o Gazebo para cerrar el bucle percepcion-accion sin necesidad de infraestructura de servidor.
- Reproduccion de experimentos en local: el formato GGUF y los tamanos pequenos facilitan que un investigador reproduzca resultados en una sola maquina de sobremesa, algo relevante cuando el entorno de computo es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de tareas de manipulacion (tasas de exito en suites como LIBERO, SimplerEnv o RLBench), ni resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K). Tampoco se publican mediciones de latencia o throughput en la model card.

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del tamano de fichero declarado por el autor, sumando el proyector multimodal (0,5-0,8 GB) y un margen para el contexto y el estado de inferencia:

- Q2_K (2,0 GB): alrededor de 3,5 GB de VRAM en total con mmproj; cabe en GPUs de 4 GB, aunque con margen muy ajustado.
- Q4_K_M / Q4_K_S (2,8 / 2,7 GB): alrededor de 4,5 GB con mmproj; recomendadas por el autor como opcion rapida. Cabe en RTX 3050 6 GB, RTX 3060, RTX 4060, RTX 4070.
- Q6_K (3,6 GB): alrededor de 5,5 GB con mmproj; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070.
- Q8_0 (4,6 GB): alrededor de 6,5 GB con mmproj; requiere 8 GB de VRAM o mas, o bien dividir entre GPU y CPU.
- f16 (8,5 GB): alrededor de 10,5 GB con mmproj; el propio autor lo califica de sobredimensionado. Requiere GPUs de 12-16 GB o superiores.
- GPU de centro de datos (A100 40/80 GB, H100, L40S): sobradamente capaces, pero desproporcionadas para un modelo de este tamano; su uso tendria sentido solo para servir muchas instancias en paralelo o para lotes grandes.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) son los caminos naturales para GGUF. El soporte en vLLM y TGI para GGUF existe pero es mas limitado y depende de la version; conviene verificar compatibilidad con el componente multimodal.
- Necesidad de cargar el proyector: para cualquier uso con vision es imprescindible cargar tambien el fichero `mmproj` correspondiente; usar solo el GGUF principal daria un modelo sin capacidad visual.
- Latencia y throughput: no disponibles. No se han publicado mediciones y cualquier cifra dependeria del hardware, del nivel de cuantizacion y de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

No se dispone de datos verificables del modelo base ni de sus alternativas directas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La siguiente tabla recoge unicamente los datos confirmados del artefacto analizado y marca como no disponible todo lo que no se ha podido verificar.

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Formato |
|---|---|---|---|---|---|
| guava-v13b-qwen3.5-4b (GGUF de mradermacher) | ~4,2 B | no disponible | 12 niveles GGUF + 2 mmproj | no disponible | GGUF |
| AIcell/guava-v13b-qwen3.5-4b (modelo base) | ~4,2 B | no disponible | no disponible | no disponible | safetensors (presumiblemente) |
| Otros modelos VLA de ~4-7 B (OpenVLA, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion que puede hacerse con rigor es entre el artefacto cuantizado y su modelo base: el primero anade compatibilidad con llama.cpp y reduce el peso desde los pesos completos hasta 2,0 GB en Q2_K, a cambio de una perdida de precision que no esta cuantificada en ningun benchmark publicado. Para el resto de alternativas del segmento VLA no hay datos en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: ni el repositorio de cuantizacion ni la informacion disponible documentan arquitectura, datos de entrenamiento, contexto o hiperparametros. Usar el modelo en produccion sin esa informacion es arriesgado.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor del modelo base (`AIcell`) antes de cualquier despliegue productivo.
- Idioma unico: solo se declara ingles. Las instrucciones en castellano probablemente degraden el comportamiento, especialmente en tareas de manipulacion donde la precision semantica importa.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fiabilidad. En un modelo VLA, una alucinacion no se traduce en texto incorrecto sino en una accion fisica incorrecta, con riesgo material sobre el robot y su entorno.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta. No hay evidencia de que otras personas hayan reproducido el modelo con exito.
- Cuantizaciones muy agresivas: Q2_K (2,0 GB) y Q3_K_* (2,2-2,5 GB) degradan la calidad de forma notable. El propio autor marca Q3_K_M como "lower quality". Para tareas de control fino conviene partir de Q5_K_M o superior.
- Dependencia de los ficheros mmproj: omitirlos desactiva por completo la capacidad de vision, que es el nucleo del caso de uso. Es un error de configuracion frecuente en despliegues GGUF multimodales.
- Ausencia de cuantizaciones imatrix: el autor indica que no estaban disponibles y que quizas no se generen, lo que limita las opciones de calidad intermedia.
- Compatibilidad de despliegue incierta: el soporte multimodal en servidores de inferencia de alto rendimiento (vLLM, TGI) para GGUF no esta garantizado; en la practica el camino robusto es llama.cpp.
- Sobre el nombre: el identificador incluye `v13b` pese a que el modelo tiene ~4,2 B de parametros y un backbone de 4B. Conviene no confundir el nombre comercial con el tamano real a efectos de planificacion de hardware.
- Resultados de busqueda web no relevantes: las consultas devolvieron unicamente paginas sobre un juego de cartas suizo (Schieber Jass) sin ninguna relacion con el modelo. No se ha podido localizar informacion externa adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b
- Pagina de descargas y vision general del autor para este modelo: https://hf.tst.eu/model#guava-v13b-qwen3.5-4b-GGUF
- Ficheros GGUF (ejemplos):
  - https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF/resolve/main/guava-v13b-qwen3.5-4b.Q4_K_M.gguf
  - https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF/resolve/main/guava-v13b-qwen3.5-4b.Q8_0.gguf
  - https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF/resolve/main/guava-v13b-qwen3.5-4b.f16.gguf
  - https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-GGUF/resolve/main/guava-v13b-qwen3.5-4b.mmproj-f16.gguf
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que soporta la infraestructura del autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada.
