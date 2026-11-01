# mradermacher/Gemma-3-4b-it-abliterated-bf16-public-GGUF

## Resumen

Gemma-3-4b-it-abliterated-bf16-public-GGUF es una recopilacion de cuantizaciones GGUF del modelo ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public, publicada por mradermacher. El modelo subyacente es una variante "abliterated" de Gemma 3 4B instruct, es decir, una version en la que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir el comportamiento de negativa del modelo ante determinadas peticiones. Esta version concreta solo distribuye los pesos en formato GGUF, no los safetensors originales.

El modelo base cuenta con 3.880.263.168 parametros (aproximadamente 3.9 mil millones), lo que lo situa en la gama compacta de la familia Gemma 3, disenada para inferencia en hardware de consumo. La cuantizacion la realiza mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF, e incluye tanto cuantizaciones estaticas (Q2_K a Q8_0, f16) como un fichero mmproj para el componente multimodal de Gemma 3.

La relevancia de esta ficha radica en que combina tres factores: un modelo pequeno y desplegable localmente, una modificacion de alineamiento (abliteration) que altera el comportamiento de rechazo, y un empaquetado GGUF listo para llama.cpp y derivados. Es importante senalar que la model card no documenta el proceso de abliteration ni los datos de entrenamiento, y que la licencia Gemma impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 3 4B; la model card no detalla la arquitectura) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos de HuggingFace y model card) |
| Licencia | gemma |
| Formato de pesos | GGUF (no se distribuyen safetensors en este repo) |

## Arquitectura y entrenamiento

La model card de esta recopilacion GGUF no aporta informacion sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. El modelo subyacente es una variante de Gemma 3 4B instruct, y el sufijo "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones en el espacio de activaciones para reducir la tendencia del modelo a rechazar peticiones. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales sobre el modelo original.

La model card de mradermacher se limita a describir el proceso de cuantizacion: cuantizaciones estaticas generadas con un pipeline propio (quantize_version 2, output_tensor_quantised 1, convert_type hf) e incluye un fichero mmproj para el componente multimodal, lo que confirma que el modelo base conserva capacidad de vision. No se detalla ninguna innovacion tecnica adicional mas alla de la propia cuantizacion y del proceso de abliteration, cuyos detalles no se especifican.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 4B instruct.
- Capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes segun el modelo base.
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla conversacional de Gemma 3.
- Comportamiento de rechazo reducido respecto al modelo original debido a la abliteration (no se documenta el alcance exacto de la modificacion).
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: los metadatos solo declaran ingles; no se confirma soporte de otros idiomas.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (2.6 GB) y Q5_K_M (2.9 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, util para prototipado rapido sin conexion.
- Experimentacion con alineamiento y seguridad: investigadores que estudian el efecto de la abliteration pueden comparar esta variante con el Gemma 3 4B original en tareas de evaluacion de rechazos y sesgos, usando las cuantizaciones Q8_0 o f16 para minimizar la distorsion introducida por la cuantizacion.
- Asistentes conversacionales en ingles para entornos controlados: el modelo puede gestionar dialogos multi-turno en ingles, aunque la longitud de contexto no esta documentada y debe verificarse contra el modelo base.
- Procesamiento de imagenes en local: gracias al fichero mmproj, es posible realizar tareas de descripcion de imagenes o extraccion de informacion visual en ingles con un unico modelo pequeno, siempre que el runtime (llama.cpp con soporte multimodal) lo permita.
- Generacion de texto en pipelines offline: la cuantizacion Q2_K (1.8 GB) permite ejecutar el modelo en dispositivos con recursos muy limitados, a costa de una perdida de calidad notable, para tareas de generacion de texto no criticas.
- Educacion y divulgacion: el tamano reducido y la disponibilidad de multiples cuantizaciones facilitan demostraciones docentes sobre cuantizacion, abliteration y despliegue local de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1.8 GB, Q3_K_M ~2.2 GB, Q4_K_M ~2.6 GB, Q5_K_M ~2.9 GB, Q6_K ~3.3 GB, Q8_0 ~4.2 GB, f16 ~7.9 GB. El fichero mmproj anade 0.7-1.0 GB si se usa el componente multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas y contexto largo; A100 o H100 no son necesarias para este tamano, pero pueden usarse para servir varias instancias.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 6 GB o mas usando Q4_K_M o Q5_K_M; en GPUs de 4 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repo esta etiquetado como endpoints_compatible. No se distribuyen safetensors en este repositorio, por lo que vLLM o TGI requeririan el modelo base original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-3-4b-it-abliterated-bf16-public-GGUF (este) | 3.88B | no disponible | GGUF | gemma | Variante abliterated cuantizada; solo ingles declarado |
| Gemma 3 4B IT (original, Google) | ~4B | no disponible en esta ficha | safetensors, GGUF | gemma | Modelo de referencia sin abliteration; comportamiento de rechazo estandar |
| ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public | 3.88B | no disponible | safetensors (bf16) | gemma | Modelo base de esta recopilacion, sin cuantizar |
| mradermacher/Gemma-3-4b-it-abliterated-bf16-public-i1-GGUF | 3.88B | no disponible | GGUF (imatrix) | gemma | Cuantizaciones ponderadas/imatrix del mismo modelo base, alternativa de mayor calidad por tamano |

## Limitaciones y advertencias

- La abliteration altera el comportamiento de rechazo del modelo; no se documenta el alcance exacto de la modificacion ni se han publicado evaluaciones de seguridad sobre esta variante.
- Riesgo de alucinacion inherente a un modelo de 3.9B parametros; no se han publicado benchmarks que permitan cuantificarlo.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- La longitud de contexto no esta documentada en esta ficha; debe consultarse la del modelo base Gemma 3 4B antes de usarlo en tareas de contexto largo.
- La licencia Gemma impone terminos de uso (incluida la politica de uso prohibido de Google) que deben revisarse antes de cualquier despliegue comercial; la modificacion abliterated no exime de cumplirla.
- Los pesos solo se distribuyen en GGUF; para usar vLLM o TGI es necesario recurrir al modelo base en safetensors.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- El repositorio tiene 0 likes y 530 descargas en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-3-4b-it-abliterated-bf16-public-GGUF
- Modelo base: https://huggingface.co/ashwin-sreedhar/Gemma-3-4b-it-abliterated-bf16-public
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Gemma-3-4b-it-abliterated-bf16-public-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-3-4b-it-abliterated-bf16-public-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
