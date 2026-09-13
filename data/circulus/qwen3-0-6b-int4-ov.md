# circulus/qwen3-0.6b-int4-ov

## Resumen

circulus/qwen3-0.6b-int4-ov es un export en formato OpenVINO IR del modelo Qwen/Qwen3-0.6B, cuantizado a INT4 mediante compresion de pesos con tamano de grupo 128 y cuantizacion simetrica. El resultado es un artefacto de 387 MB (repositorio de 0,4 GB) publicado por el usuario circulus dentro del material docente ARCademy OpenVINO courseware, generado con el script `convert/convert_all.py` de dicho curso y asociado a la leccion 09, dedicada a decodificacion especulativa.

El modelo no es un entrenamiento nuevo ni un ajuste fino: es una conversion y cuantizacion de un modelo ya existente. Su proposito declarado es actuar como modelo borrador (draft) en decodificacion especulativa, invocado mediante `openvino_genai.draft_model(model_dir, device)` junto a qwen3-4b-int4-ov. La model card especifica que ambos comparten familia de tokenizer, requisito imprescindible para que la decodificacion especulativa funcione, ya que el mecanismo exige que el vocabulario del borrador y el del modelo objetivo sean compatibles.

Su relevancia es practica y acotada: demuestra como producir un borrador INT4 muy ligero que acelera la inferencia de un modelo mayor sobre hardware Intel sin GPU dedicada, usando el stack OpenVINO GenAI. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y declara una licencia "other" sin texto detallado, por lo que debe tratarse como material experimental y didactico mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (derivado de Qwen3-0.6B, arquitectura Qwen3 de atencion causal); exportado a OpenVINO IR. No se detalla en la model card |
| Parametros totales | 0,6 mil millones (modelo base Qwen/Qwen3-0.6B). El repositorio no declara el recuento exacto tras la conversion |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card del repositorio. La documentacion del modelo base Qwen3-0.6B declara 32.768 tokens nativos, ampliables con YaRN; no confirmado para este export |
| Tipos de cuantizacion | INT4, compresion de pesos con grupo de tamano 128 y esquema simetrico (unico formato publicado) |
| Idiomas soportados | no disponible en la model card del repositorio (el modelo base declara soporte multilingue amplio, sin cifra confirmada aqui) |
| Licencia | other (segun los metadatos del repositorio; no se reproduce el texto de la licencia) |
| Formato de pesos | OpenVINO IR (.xml + .bin); no se publican safetensors, GGUF ni ONNX |

Datos adicionales relevantes: tamano del artefacto 387 MB, tamano del repositorio 0,4 GB, creado el 2026-09-13 y actualizado el mismo dia, pipeline no declarado.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-0.6B, un transformer decoder-only de atencion causal con 0,6 mil millones de parametros. circulus no ha realizado entrenamiento alguno: la unica transformacion aplicada es la conversion a OpenVINO IR seguida de una cuantizacion de pesos INT4. No se documenta en el repositorio si la calibracion de la cuantizacion fue data-free, con dataset de calibracion o con ajuste fino posterior a la cuantizacion (QAT/PTQ con recuperacion), por lo que ese punto queda como no disponible.

El detalle tecnico si documentado es la estrategia de compresion: cuantizacion de pesos con tamano de grupo 128 y esquema simetrico, lo que implica un factor de escala y un punto cero compartidos por cada bloque de 128 pesos. Este esquema reduce el peso del modelo hasta 387 MB y es el habitual en el ecosistema OpenVINO/NNCF para despliegue en CPU, iGPU y NPU Intel. La innovacion funcional del repositorio no esta en la arquitectura, sino en el caso de uso: servir como modelo borrador en un esquema de decodificacion especulativa, donde el modelo pequeno propone varios tokens candidatos por paso y el modelo objetivo (qwen3-4b-int4-ov) los valida en paralelo, reduciendo el numero de pasos de decodificacion del modelo grande. La unica condicion tecnica destacada por el autor es que borrador y objetivo deben compartir familia de tokenizer.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-0.6B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6 mil millones de parametros.
- Generacion de codigo y resolucion de problemas matematicos simples; capacidad no verificada en este export cuantizado.
- Rol especifico de modelo borrador (draft) en decodificacion especulativa junto a qwen3-4b-int4-ov mediante `openvino_genai.draft_model()`.
- Capacidades multilingues: no documentadas en el repositorio; se desconoce el impacto de la cuantizacion INT4 en idiomas distintos del ingles.
- Soporte de tool calling / function calling: no declarado en la model card de este repositorio. No debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no declarado ni verificado.
- Modo de razonamiento explicito (thinking): no declarado para este export; el modelo base Qwen3 incorpora conmutacion entre modo pensante y no pensante, pero no se confirma que la conversion lo preserve.
- Vision y audio: no disponibles; el modelo base es exclusivamente de texto.
- Ejecucion en CPU, GPU integrada Intel y NPU mediante OpenVINO.

## Casos de uso

- Aceleracion de inferencia con decodificacion especulativa: el uso principal y documentado. Se carga como borrador con `openvino_genai.draft_model(model_dir, device)` junto a qwen3-4b-int4-ov, de forma que el modelo de 0,6 B propone tokens y el de 4 B los valida. El ahorro proviene de reducir el numero de pasos del modelo grande, no de sustituirlo.
- Despliegue en equipos sin GPU dedicada: al ser un artefacto de 387 MB en OpenVINO IR, puede ejecutarse sobre CPU Intel (Xeon, Core Ultra with NPU), GPU integrada Iris Xe o GPU discreta Intel Arc, lo que permite prototipos de generacion de texto en portatiles y mini-PC.
- Material didactico y reproduccion de practicas: el repositorio forma parte de la leccion 09 del ARCademy OpenVINO courseware, por lo que sirve para que estudiantes reproduzcan el pipeline de conversion, cuantizacion INT4 y decodificacion especulativa de principio a fin.
- Clasificacion y etiquetado de texto a gran escala: tareas de clasificacion de intenciones, deteccion de idioma o etiquetado de sentimiento sobre grandes volumenes, donde el coste por inferencia es mas determinante que la calidad punta y donde la baja huella del modelo permite paralelizar en CPU.
- Enrutamiento de consultas en pipelines RAG: uso como componente auxiliar que decide que recuperador o que modelo mayor invocar, o que reformula la consulta del usuario antes de pasarla al modelo grande. El coste de un modelo de 0,6 B en INT4 es marginal frente al del generador principal.
- Validacion de infraestructura OpenVINO GenAI: dado su tamano reducido, es util como modelo de humo (smoke test) en CI/CD para verificar que el runtime, los plugins de dispositivo y las versiones de OpenVINO funcionan correctamente antes de desplegar modelos mayores.
- Autocompletado ligero y generacion de fragmentos cortos: borradores de lineas de codigo, plantillas de texto o completado de campos estructurados en entornos locales, siempre asumiendo la tasa de error propia de un modelo de 0,6 B cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), ni mediciones de latencia, throughput o tasa de aceptacion de tokens en decodificacion especulativa. Tampoco se han encontrado datos de benchmarks en los resultados de busqueda web disponibles, que no guardan relacion con el modelo. No se debe inferir el rendimiento de la cuantizacion INT4 a partir de la del modelo base sin medicion propia.

## Requisitos de hardware

- Peso de los pesos del modelo: 387 MB en INT4 (repositorio de 0,4 GB). Es el componente dominante de la huella en memoria.
- VRAM/RAM estimada para inferencia: por debajo de 1 GB solo para pesos; con la cache KV y el overhead del runtime, el consumo tipico se situa en el rango de 1 a 1,5 GB con contextos moderados. La cache KV crece linealmente con la longitud de contexto y el numero de capas.
- CPU: cualquier procesador Intel moderno con soporte AVX2 o superior; se beneficia de AVX-512, AMX (Xeon Scalable de 4ª generacion o posterior) y de la NPU integrada en Core Ultra.
- GPU recomendadas: Intel Arc (A770, B580 y equivalentes), GPU integrada Iris Xe, y en general cualquier dispositivo soportado por los plugins de OpenVINO. Tambien puede ejecutarse sobre GPU NVIDIA mediante el plugin correspondiente, aunque el artefacto esta optimizado para el stack Intel.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, y tambien en CPU sin GPU dedicada. No requiere acelerador de gama alta.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai`), Optimum-Intel y el runtime de OpenVINO. No es directamente utilizable en llama.cpp, Ollama, vLLM o TGI, ya que no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones ni para inferencia independiente ni para el modo borrador en decodificacion especulativa.
- Almacenamiento: menos de 1 GB, apto para imagenes de contenedor pequenas y despliegues en el edge.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|---|
| circulus/qwen3-0.6b-int4-ov | 0,6 B | OpenVINO IR INT4 (grupo 128, simetrico) | 387 MB | no disponible | other | Borrador para decodificacion especulativa en OpenVINO |
| Qwen/Qwen3-0.6B | 0,6 B | safetensors (precision completa) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base de proposito general |
| circulus/qwen3-4b-int4-ov | 4 B (segun la denominacion de la model card) | OpenVINO IR INT4 | no disponible | no disponible | no disponible | Modelo objetivo que consume el borrador; comparte familia de tokenizer |

La comparativa se limita a los modelos citados en la documentacion del repositorio. No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La diferencia funcional relevante es que este repositorio no esta pensado para sustituir al modelo base, sino para acompanarlo dentro de un esquema de decodificacion especulativa sobre el runtime de OpenVINO.

## Limitaciones y advertencias

- Capacidad intrinsecamente limitada: 0,6 mil millones de parametros es un tamano que produce errores frecuentes en razonamiento multi-paso, matematicas no triviales y generacion de codigo complejo. No debe emplearse como modelo principal en tareas que exijan precision alta.
- Degradacion por cuantizacion: la compresion INT4 con grupo 128 introduce perdida adicional respecto a los pesos originales. No se ha publicado ninguna evaluacion que cuantifique esa perdida.
- Disenado como borrador, no como generador autonomo: su valor depende de la existencia de un modelo objetivo compatible. La decodificacion especulativa exige que ambos compartan familia de tokenizer, por lo que no es intercambiable con cualquier modelo.
- Licencia ambigua: el repositorio declara "other" sin reproducir el texto de la licencia. Antes de cualquier uso comercial es imprescindible verificar los terminos aplicables del modelo base y del material del curso al que pertenece.
- Idiomas no declarados: se desconoce que idiomas cubre la conversion y con que calidad. No hay evidencia de rendimiento en castellano.
- Contexto no confirmado: la model card no especifica la longitud de contexto soportada por el grafo exportado. Si se requiere contexto largo, debe validarse experimentalmente antes de desplegarlo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la cuantizacion. No es adecuado para tareas de respuesta factual sin verificacion externa.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes de funcionamiento ni de tasa de aceptacion en decodificacion especulativa.
- Restriccion de portabilidad: al publicarse unicamente en OpenVINO IR, queda fuera de ecosistemas como llama.cpp, Ollama, vLLM o TGI salvo conversion adicional por cuenta del usuario.
- Sin benchmarks publicados: cualquier decision de produccion basada en este modelo deberia apoyarse en una evaluacion propia sobre el caso de uso concreto.
- Fechas y trazabilidad: los metadatos indican creacion y actualizacion el 2026-09-13, sin historial de versiones posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/circulus/qwen3-0.6b-int4-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo objetivo citado en la model card (`qwen3-4b-int4-ov`): ID exacto no enlazado en la documentacion; URL presumible https://huggingface.co/circulus/qwen3-4b-int4-ov
- Runtime OpenVINO GenAI (referencia del stack de despliegue): https://github.com/openvinotoolkit/openvino.genai
- ARCademy OpenVINO courseware y script `convert/convert_all.py`: no disponible (no se proporciona URL en la informacion recibida)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados disponibles corresponden a pruebas de velocidad de conexion a internet y no se incluyen.
