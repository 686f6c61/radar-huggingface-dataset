# idlegrog/IdleGrog-Ornith-1.5-35B-A3B-abliterated-ROCmFP4-GGUF

## Resumen

IdleGrog-Ornith-1.5-35B-A3B-abliterated-ROCmFP4-GGUF es una cuantizacion en formato GGUF del modelo Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario idlegrog. Se trata de una variante "abliterated" (con los rechazos de seguridad eliminados mediante la tecnica de abliteration) del modelo Ornith 1.5 de 35B en arquitectura MoE con 3B de parametros activos, convertida a un formato de cuantizacion especifico denominado Q4_0_ROCMFP4_STRIX_LEAN mediante el motor Ciru ROCmFPX.

El modelo esta disenado especificamente para su ejecucion en hardware AMD Strix Halo (APUs con memoria unificada), utilizando una herramienta de cuantizacion no estandar (kyuz0 Strix Halo toolbox) en lugar de llama.cpp convencional. El repositorio incluye tanto los pesos cuantizados como un proyector multimodal (mmproj) en F16, lo que indica soporte de vision.

Con 34.660.610.688 parametros totales y un tamano de repositorio de 19,5 GB, esta pensado para servir como API con el identificador `idlegrog`. La licencia es Apache 2.0. No se dispone de informacion publicada sobre benchmarks, idiomas soportados ni detalles del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer; 35B totales con 3B activos (segun nomenclatura A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3B (segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (formato propietario de Ciru ROCmFPX); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos) + GGUF F16 (mmproj multimodal) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE): 34.660.610.688 parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El modelo original es Ornith 1.5, sobre el que se aplico la tecnica de abliteration (huihui-ai) para eliminar la direccion de rechazo en el espacio de activaciones, dando lugar a la variante Huihui-Ornith-1.5-35B-A3B-abliterated.

La version publicada por idlegrog no reentrena el modelo: aplica una cuantizacion a 4 bits con un esquema especifico para hardware AMD Strix Halo mediante el motor Ciru ROCmFPX y la herramienta `llama-quantize` modificada del kyuz0 Strix Halo toolbox. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline etiquetado como conversational).
- Capacidades multimodales: el repositorio incluye un proyector `mmproj` en F16, lo que habilita entrada de imagenes junto con texto.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Ornith 1.5, aunque no se detallan en la model card.
- Servido como endpoint compatible con API bajo el identificador `idlegrog`.
- Comportamiento sin rechazos (abliterated): el modelo no aplica las negativas de seguridad tipicas del modelo original.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware AMD Strix Halo: la cuantizacion ROCmFP4_STRIX_LEAN esta optimizada para APUs con memoria unificada, lo que permite ejecutar un modelo de 35B en equipos compactos sin GPU dedicada de gran VRAM.
- Asistente conversacional local: con el formato GGUF y el identificador de API `idlegrog`, se puede integrar en un servidor local compatible con la API de OpenAI para chat multi-turno.
- Procesamiento de documentos con imagenes: gracias al proyector mmproj, el modelo puede recibir capturas, diagramas o documentos escaneados junto con instrucciones de texto.
- Investigacion sobre abliteration y seguridad: util para estudiar el comportamiento de modelos sin rechazos en tareas de red teaming y evaluacion de alineamiento.
- Generacion de codigo en entornos aislados: al ejecutarse localmente sobre Strix Halo, permite pipelines de asistencia a la programacion sin enviar codigo a servicios externos.
- Prototipado de agentes y automatizacion: el servido como API facilita conectar el modelo a frameworks de agentes, aunque el soporte de tool calling no esta confirmado en la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 19,5 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM para cargar los pesos cuantizados, mas el proyector mmproj en F16 y el espacio de contexto.
- Hardware objetivo: APUs AMD Strix Halo con memoria unificada; el formato ROCmFP4_STRIX_LEAN esta disenado especificamente para esta plataforma.
- GPU dedicadas: no se documenta compatibilidad con A100, H100 o RTX 4090; el motor Ciru ROCmFPX no es llama.cpp estandar.
- Opciones de despliegue: Ciru ROCmFPX / kyuz0 Strix Halo toolbox (motor especifico, no stock llama.cpp). No se confirma compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| IdleGrog-Ornith-1.5-35B-A3B-abliterated-ROCmFP4 | 34,66B | ~3B | no disponible | GGUF ROCmFP4 | Apache 2.0 | Optimizado para Strix Halo, abliterated |
| Huihui-Ornith-1.5-35B-A3B-abliterated (base) | 34,66B | ~3B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar, abliterated |
| Ornith 1.5 35B-A3B (original) | 34,66B aprox. | ~3B | no disponible | no disponible | no disponible | Modelo previo a abliteration |

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que el modelo original bloquearia; requiere filtros externos en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas para esta cuantizacion.
- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales en safetensors.
- Compatibilidad restringida: el motor Ciru ROCmFPX no es llama.cpp estandar, lo que limita el despliegue a plataformas soportadas (Strix Halo).
- Sin datos publicados sobre idiomas, contexto maximo ni benchmarks; no se recomienda asumir capacidades no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento sin rechazos traslada al desplegador la responsabilidad sobre el contenido generado.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria de su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/idlegrog/IdleGrog-Ornith-1.5-35B-A3B-abliterated-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
