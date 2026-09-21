# blaj/LFM2.5-2.6B-heretic-int4-ov

## Resumen

LFM2.5-2.6B-heretic-int4-ov es una conversion a OpenVINO IR en cuantizacion int4 del modelo heretic-org/LFM-2.5-2.6B-heretic, que a su vez es una version "abliterated" (decensurada) de LiquidAI/LFM2.5-2.6B. El autor de la conversion es el usuario blaj, y el proceso se ha realizado con `optimum-cli export openvino` sobre optimum-intel 2.2.0, con compresion NNCF. El resultado es un artefacto de aproximadamente 1,5 GB pensado para inferencia local en hardware Intel (CPU, iGPU Arc, NPU) mediante OpenVINO GenAI u OVMS.

El modelo base pertenece a la familia LFM2.5 de Liquid AI y tiene alrededor de 2.6B parametros, segun se deduce de su denominacion. Soporta 16 idiomas, entre ellos el castellano, y se distribuye bajo la LFM Open License v1.0. La abliteracion elimina la direccion de rechazo de los pesos, de modo que el modelo responde con mucha menos frecuencia con negativas, lo que lo orienta a investigacion y a inferencia local, no a despliegues de produccion sin filtros adicionales.

Su relevancia es doble: por un lado, ofrece una via de ejecucion de un modelo de ~2.6B en equipos sin GPU dedicada gracias al formato int4 de OpenVINO; por otro, sirve como caso de estudio sobre como la cuantizacion agresiva interactua con modelos ya modificados en su comportamiento de alineacion. La model card advierte explicitamente de que la cuantizacion int4 puede erosionar capacidades adicionales ademas de la direccion de rechazo, y recomienda la variante int8 cuando la calidad de salida primа sobre la memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; familia LFM2.5 de Liquid AI, exportada con tarea `text-generation-with-past` (decodificador causal con cache KV) |
| Parametros totales | ~2,6B (deducido de la denominacion del modelo; no confirmado en la model card) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 asimetrico con group size 128 (166 de 190 capas), int8 fallback (23 de 190 capas), 1 capa en float; existe variante int8 del mismo modelo |
| Idiomas soportados | en, ar, zh, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | LFM Open License v1.0 (etiquetada como `other`, con umbral de uso comercial aplicable a la obra derivada) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `.bin`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: la model card de esta conversion solo indica que se trata de la familia LFM2.5 de Liquid AI y que la exportacion se realizo con la tarea `text-generation-with-past`, lo que implica un modelo de lenguaje causal con cache de clave-valor para generacion autoregresiva. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Lo que si se documenta es la cadena de transformaciones. El punto de partida es LiquidAI/LFM2.5-2.6B en BF16 safetensors; sobre el se aplico abliteracion con Heretic v1.4.0 para producir heretic-org/LFM-2.5-2.6B-heretic, y finalmente se exporto a OpenVINO IR con cuantizacion int4 asimetrica (group size 128) mediante NNCF. De las 190 capas cuantizables, 166 usan int4 asimetrico g128, 23 caen a un fallback int8 y una permanece en float. La conversion exige fijar `transformers==5.4.0`, ya que optimum-intel rechaza versiones mas recientes en la fase de exportacion. La generacion se verifico cargando el IR con `openvino_genai.LLMPipeline` sobre una iGPU Intel Arc.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la tarea de exportacion es `text-generation-with-past`, con plantilla de chat incluida (`chat_template.jinja`).
- Generacion multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, castellano, thai y vietnamita.
- Comportamiento de rechazo reducido: al ser un modelo abliterated, tiende a no declinar peticiones que el modelo original rechazaria.
- Inferencia local en hardware Intel: soporte de ejecucion en CPU, GPU integrada Arc y aceleradores compatibles via OpenVINO.
- Servicio con API compatible con OpenAI a traves de OVMS, lo que permite sustituir un endpoint remoto por uno local.
- Tool calling, function calling, modo "thinking", vision, audio y razonamiento multi-paso: no documentados en la informacion disponible.

## Casos de uso

- Inferencia local en portatiles con grafica integrada Intel Arc: el IR int4 ocupa alrededor de 1,5 GB y la model card confirma que la generacion se verifico en una iGPU Arc, por lo que permite ejecutar un modelo de ~2,6B sin GPU dedicada.
- Investigacion sobre alineacion y comportamiento de rechazo: comparar este modelo abliterated con el original LiquidAI/LFM2.5-2.6B en el mismo conjunto de prompts permite estudiar que direcciones de comportamiento se ven afectadas por la abliteracion.
- Estudio de degradacion por cuantizacion agresiva: disponer de las variantes int4 (esta) e int8 (blaj/LFM2.5-2.6B-heretic-int8-ov) del mismo modelo base hace posible medir la perdida de calidad atribuible a la cuantizacion y no al modelo.
- Despliegue de un endpoint local compatible con OpenAI: con OVMS (`--rest_port 11436`) se puede exponer el modelo como servicio y consumirlo desde clientes que ya hablan la API de OpenAI, util en entornos aislados o sin salida a Internet.
- Generacion de texto en castellano y otros quince idiomas en aplicaciones internas: borradores, resumenes o reescritura de contenido donde no se requiere la maxima calidad pero si ejecucion en el propio equipo.
- Red-teaming controlado y evaluacion de riesgos: al carecer de refusals, sirve como sujeto de prueba para medir hasta donde llega un modelo pequeno sin alineacion, siempre en un entorno de investigacion acotado.
- Prototipado rapido de asistentes conversacionales: la plantilla de chat incluida y las muestras de uso con `openvino_genai.LLMPipeline` permiten levantar un prototipo conversacional en pocas lineas antes de decidir si se escala a un modelo mayor.
- Escritura creativa sin filtros tematicos: ficcion o narrativa con tematicas que los modelos alineados suelen declinar, asumiendo la revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto datos de evaluacion de este modelo ni de su base. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para int4: a partir del tamano del repositorio (~1,5 GB) mas cache KV y overhead del runtime, se puede estimar un consumo en el rango de 2 a 3 GB con contextos cortos; el consumo crece con la longitud de contexto. Es una estimacion, no un dato publicado.
- VRAM estimada para int8: el repositorio de la variante int8 ocupa ~2,6 GB, de modo que el consumo sera proporcionalmente mayor (estimacion).
- GPU verificadas: la model card indica que la generacion se comprobo en una iGPU Intel Arc. No se mencionan otras GPU.
- Hardware Intel compatible: CPU, iGPU Arc y NPU a traves de OpenVINO, que es el runtime para el que se ha preparado el artefacto.
- GPU de consumo (NVIDIA RTX, AMD): no documentadas para este IR. Al ser un formato OpenVINO y no GGUF, no hay evidencia de soporte directo en llama.cpp u Ollama.
- Opciones de despliegue documentadas: OpenVINO GenAI (`og.LLMPipeline` con dispositivo "GPU") y OVMS (OpenVINO Model Server) con API REST compatible con OpenAI. vLLM, TGI y llama.cpp no aparecen mencionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| blaj/LFM2.5-2.6B-heretic-int4-ov (este) | ~2,6B | No disponible | OpenVINO IR | int4 asim. g128 + int8 fallback | LFM Open License v1.0 | ~1,5 GB; abliterated; verificado en iGPU Arc |
| blaj/LFM2.5-2.6B-heretic-int8-ov | ~2,6B | No disponible | OpenVINO IR | int8 | LFM Open License v1.0 | ~2,6 GB; misma abliteracion, mayor fidelidad; recomendado cuando prima la calidad |
| heretic-org/LFM-2.5-2.6B-heretic | ~2,6B | No disponible | safetensors BF16 | ninguna | LFM Open License v1.0 | Version abliterated sin cuantizar, generada con Heretic v1.4.0 |
| LiquidAI/LFM2.5-2.6B | ~2,6B | No disponible | safetensors (BF16) | ninguna | LFM Open License v1.0 | Modelo original alineado; referencia para comparar refusals y capacidad |

No se dispone de datos de rendimiento para ninguno de los cuatro, por lo que la comparativa se limita a formato, tamano y comportamiento esperado.

## Limitaciones y advertencias

- Modelo abliterated: la direccion de rechazo se ha eliminado de los pesos, por lo que producira contenido que el modelo original rechazaria. No es apto para produccion orientada al usuario final sin un filtrado externo.
- La propia model card advierte de que la cuantizacion agresiva puede erosionar capacidades adicionales, no solo el comportamiento de rechazo; la variante int8 es preferible cuando la calidad importa mas que la memoria.
- No hay datos publicos de benchmarks para esta conversion ni para su modelo base, de modo que cualquier afirmacion sobre su calidad relativa carece de respaldo empirico.
- Riesgo de alucinacion: inherente a un modelo de ~2,6B de parametros; no se documentan mitigaciones.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos ni verificar el comportamiento en conversaciones multi-turno extensas.
- Limitaciones idiomaticas: aunque se listan 16 idiomas, no se especifica el nivel de competencia por idioma ni si el castellano esta entre los mejor representados.
- Licencia: la LFM Open License v1.0 incluye un umbral de uso comercial que se aplica a esta obra derivada. Es imprescindible revisar el fichero LICENSE incluido antes de cualquier uso comercial.
- Formato restrictivo: al ser OpenVINO IR, no es directamente utilizable en ecosistemas como llama.cpp, Ollama o vLLM sin una conversion adicional, que no esta documentada.
- Dependencia de version: la reproduccion exige `transformers==5.4.0`; versiones posteriores son rechazadas por optimum-intel, lo que puede complicar el mantenimiento a medio plazo.
- Validacion limitada: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y la verificacion se limita a comprobar que la generacion funciona en una iGPU Intel Arc, sin evaluacion sistematica de calidad.
- Metadatos incompletos: no se detallan arquitectura interna, datos de entrenamiento, contexto ni regimen de alineacion del modelo base en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/LFM2.5-2.6B-heretic-int4-ov
- Variante int8: https://huggingface.co/blaj/LFM2.5-2.6B-heretic-int8-ov
- Modelo abliterated de origen: https://huggingface.co/heretic-org/LFM-2.5-2.6B-heretic
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Proyecto Heretic: https://heretic-project.org
- No se han encontrado otros enlaces relevantes (papers, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
