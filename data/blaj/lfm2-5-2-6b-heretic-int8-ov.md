# blaj/LFM2.5-2.6B-heretic-int8-ov

## Resumen

Este repositorio contiene una conversion a OpenVINO IR con cuantizacion int8 del modelo heretic-org/LFM-2.5-2.6B-heretic, que a su vez es una version "abliterated" (decensurada, sin direccion de rechazo) de LiquidAI/LFM2.5-2.6B. El autor de la conversion es el usuario blaj y el resultado se publica unicamente como artefacto de inferencia: no se han modificado los valores de los pesos mas alla de la compresion int8, por lo que el comportamiento sin rechazos se hereda del modelo fuente. El modelo tiene aproximadamente 2.600 millones de parametros y pertenece a la familia LFM2.5 de Liquid AI.

El interes practico de esta ficha esta en el formato: al estar exportado como IR de OpenVINO con pesos int8 asimetricos por canal, el modelo esta pensado para ejecutarse en hardware Intel (CPU y GPU integradas Arc) mediante OpenVINO GenAI u OVMS, sin necesidad de GPUs dedicadas. El repositorio ocupa unos 2,6-2,7 GB, lo que lo situa en el rango de inferencia local en portatiles y equipos de sobremesa con graficos integrados.

Es relevante ahora porque combina tres tendencias: modelos pequenos de alta eficiencia para edge, cuantizacion int8 como compromiso calidad/tamano (frente a int4) y la linea de trabajo de abliteration, que genera modelos sin mecanismos de rechazo y que se evalua principalmente en contextos de investigacion y red teaming mas que de produccion. No se han publicado resultados de benchmarks ni datos de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5 de Liquid AI; la informacion proporcionada no detalla el tipo de bloque) |
| Parametros totales | ~2,6 mil millones (segun la denominacion LFM2.5-2.6B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 asimetrica por canal (189 de 190 capas en int8_asym, 1 capa en float); no se incluye int4 |
| Idiomas soportados | 16: en, ar, zh, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | LFM Open License v1.0 (identificador lfm1.0; campo license: other en el Hub) |
| Formato de pesos | OpenVINO IR (.xml + .bin), con tokenizer y detokenizer tambien en IR |
| Herramienta de conversion | optimum-cli export openvino (optimum-intel 2.2.0), compresion NNCF |
| Tarea declarada | text-generation-with-past |
| Tamano del repositorio | ~2,6-2,7 GB |
| Version de Transformers requerida para reexportar | 5.4.0 (fijada; optimum-intel rechaza versiones mas nuevas en la exportacion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en el material proporcionado. Lo unico verificable es que el modelo deriva de LiquidAI/LFM2.5-2.6B, un modelo de ~2.600 millones de parametros de la familia LFM2.5, y que la conversion mantiene la configuracion de arquitectura original en config.json. La etiqueta "lfm2" y la tarea text-generation-with-past indican un transformer decoder-only con cache de clave/valor, pero no se confirma en la documentacion disponible si incorpora componentes hibridos (convoluciones de corto alcance, SSM) propios de otras variantes de la familia.

La transformacion aplicada en esta cadena tiene dos etapas. La primera es la abliteration realizada con Heretic v1.4.0 sobre el modelo base, que elimina la direccion de rechazo en los pesos y da lugar a heretic-org/LFM-2.5-2.6B-heretic en BF16 safetensors. La segunda es la conversion a OpenVINO IR con cuantizacion int8 asimetrica por canal mediante optimum-intel y NNCF, en la tarea text-generation-with-past. El autor justifica explicitamente la eleccion de int8 frente a int4: la abliteration ya degrada parte del comportamiento del modelo original y una cuantizacion mas agresiva erosionaria capacidades adicionales, mientras que int4 reduciria el tamano aproximadamente a la mitad con un coste de calidad mayor. No hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat incluida (chat_template.jinja) y configuracion de generacion propia (generation_config.json).
- Capacidades multilingues en 16 idiomas: ingles, arabe, chino, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Generacion de texto sin comportamiento de rechazo (abliterated): el modelo no aplica las rutas de negativa tipicas de un modelo alineado, lo que cambia radicalmente el perfil de respuestas ante peticiones sensibles.
- Inferencia local en hardware Intel: soporte nativo via OpenVINO GenAI (LLMPipeline) y servicio compatible con la API de OpenAI mediante OVMS.
- Ejecucion sobre GPU integrada Intel Arc, segun la verificacion declarada por el autor antes de publicar el modelo.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision, audio ni modo "thinking".

## Casos de uso

- Inferencia local en portatiles con graficos Intel Arc: el modelo ocupa ~2,6 GB en disco y puede cargarse con `openvino_genai.LLMPipeline(..., "GPU")`, lo que permite generar texto sin depender de una GPU dedicada ni de servicios en la nube.
- Asistentes conversacionales con requisitos de privacidad: al ejecutarse en el propio equipo mediante OpenVINO, los prompts y las respuestas no salen de la maquina, algo util en entornos con datos sensibles o sin conectividad.
- Servicio interno compatible con OpenAI: desplegando el modelo con OVMS (`--rest_port 11436`) se expone un endpoint `/v1/chat/completions` que permite reutilizar clientes y SDKs ya existentes sin reescribir integraciones.
- Procesamiento y traduccion multilingue ligera: con 16 idiomas declarados, sirve para tareas de resumen, reescritura o traduccion aproximada en pipelines por lotes donde no se requiere calidad de un modelo grande.
- Investigacion sobre abliteration y evaluacion de seguridad: al ser una version sin direccion de rechazo, es un artefacto util para estudiar como cambia el comportamiento del modelo, medir tasas de respuesta ante prompts conflictivos y comparar contra el modelo base alineado.
- Red teaming y generacion de conjuntos de evaluacion: permite producir respuestas que un modelo alineado rechazaria, lo que resulta practico para construir datasets de prueba para clasificadores de seguridad y filtros de contenido.
- Prototipado rapido en edge y kioscos: un modelo de 2,6 GB en int8 puede desplegarse en mini-PC o dispositivos con CPU moderna y ofrecer generacion de texto para menus, ayuda contextual o formularios asistidos.
- Experimentacion con cuantizacion int8 en OpenVINO: el repositorio documenta el comando exacto de reexportacion y los ajustes de NNCF, por lo que sirve como referencia reproducible para convertir otros modelos LFM a IR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se proporcionan datos de latencia, tokens por segundo o consumo de memoria mas alla del tamano del repositorio (~2,6 GB).

## Requisitos de hardware

- VRAM estimada: los pesos int8 ocupan aproximadamente 2,6 GB; con cache KV y overhead del runtime, un presupuesto practico de 3 a 4 GB de memoria es razonable para contextos moderados. No se especifica el consumo exacto.
- GPU integrada Intel Arc: el autor declara haber verificado el modelo cargandolo con `openvino_genai.LLMPipeline` en una iGPU Arc, por lo que es el escenario de referencia.
- CPU: al ser un IR de OpenVINO, puede ejecutarse en CPU x86 con las extensiones SIMD habituales de OpenVINO; no se documentan cifras de throughput.
- GPU dedicadas: no se mencionan en la informacion disponible. OpenVINO soporta dispositivos adicionales, pero no hay confirmacion de que este IR se haya probado en ellos.
- NPU: la informacion proporcionada no confirma compatibilidad con la NPU de los procesadores Intel Core Ultra.
- Cabe en GPU de consumo: si, en el sentido de que cabe en iGPU Intel Arc y previsiblemente en cualquier GPU con 4 GB o mas de memoria, aunque el repositorio no aporta pruebas fuera de la iGPU Arc.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.LLMPipeline`) y OVMS con `--task text_generation` para servir una API compatible con OpenAI. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama no pueden consumir este repositorio tal cual; requeririan convertir desde el modelo BF16 original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| blaj/LFM2.5-2.6B-heretic-int8-ov (este) | ~2,6 B | OpenVINO IR int8 | LFM Open License v1.0 | Conversion comunitaria para OpenVINO; sin benchmarks publicados; pesos ya abliterated |
| heretic-org/LFM-2.5-2.6B-heretic | ~2,6 B | safetensors BF16 | LFM Open License v1.0 | Modelo fuente abliterated con Heretic v1.4.0; mayor precision, mayor tamano |
| LiquidAI/LFM2.5-2.6B | ~2,6 B | safetensors BF16 | LFM Open License v1.0 | Modelo base alineado de Liquid AI; mantiene comportamiento de rechazo |
| Otros modelos de ~2-3 B en int8/OpenVINO | no disponible | no disponible | no disponible | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No hay datos de benchmarks que permitan comparar el rendimiento relativo de estas tres variantes ni frente a modelos de otras familias del mismo orden de parametros.

## Limitaciones y advertencias

- Modelo abliterated: la direccion de rechazo ha sido eliminada de los pesos, por lo que el modelo puede generar contenido que un modelo alineado rechazaria. El propio autor advierte que las salidas deben evaluarse en consecuencia y que no deberia desplegarse sin considerarlo.
- Riesgo de alucinacion: con ~2,6 mil millones de parametros, la tasa de invencion de hechos es previsiblemente alta en tareas de conocimiento; no hay evaluaciones publicadas que la cuantifiquen.
- Perdida por cuantizacion: la compresion int8 elimina precision respecto al BF16 de origen. No se ha publicado una comparacion de calidad entre el IR int8 y el modelo fuente.
- Una capa se mantiene en float: 189 de 190 capas estan en int8_asym y 1 permanece en float, un detalle de la configuracion NNCF que puede afectar al rendimiento y conviene tener en cuenta al reproducir la conversion.
- Licencia: LFM Open License v1.0, que incluye un umbral de uso comercial aplicable tambien a esta obra derivada. Hay que consultar el texto incluido en el repositorio antes de un uso comercial.
- Restriccion de formato: al ser IR de OpenVINO, no es directamente utilizable con llama.cpp, Ollama, vLLM o TGI sin una conversion adicional desde el modelo original.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado en septiembre de 2026; se trata de una conversion comunitaria sin validacion externa mas alla de la prueba del autor en una iGPU Arc.
- Dependencia de versiones: la reexportacion exige Transformers 5.4.0 y optimum-intel 2.2.0; versiones mas recientes pueden romper el proceso.
- Cobertura de idiomas declarada, no evaluada: los 16 idiomas figuran como metadatos, sin metricas de calidad por idioma en la informacion disponible.
- Longitud de contexto desconocida: no se especifica la ventana de contexto soportada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/LFM2.5-2.6B-heretic-int8-ov
- Modelo fuente abliterated: https://huggingface.co/heretic-org/LFM-2.5-2.6B-heretic
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Proyecto Heretic: https://heretic-project.org
- Licencia incluida en el repositorio: LICENSE (LFM Open License v1.0)
- No se han encontrado enlaces relevantes al modelo en la busqueda web realizada; los resultados obtenidos correspondian a contenidos no relacionados (servicios sanitarios y direcciones postales del Reino Unido).
