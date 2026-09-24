# khronnuz/ThinkingCap-Qwen3.8-27B-exl3

## Resumen

ThinkingCap-Qwen3.8-27B-exl3 es una cuantizacion EXL3 de 4,00 bits por peso del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, un ajuste fino de Qwen/Qwen3.8-27B. La publica el usuario khronnuz, no el autor del modelo original: se trata, por tanto, de una conversion de pesos de terceros orientada a reducir el espacio en disco y la VRAM necesaria para servir un modelo multimodal de imagen-texto a texto. El repositorio ocupa 16,4 GB y esta etiquetado con el pipeline image-text-to-text, lo que confirma que conserva la torre de vision del modelo base.

El modelo subyacente es denso (no MoE) y su denominacion indica 27.000 millones de parametros, con un bloque MTP (multi-token prediction) y una torre de vision, ademas del decodificador de texto. Eso lo situa en la franja de modelos que, en precision reducida, pueden ejecutarse en GPU de consumo con 24 GB de VRAM, que es precisamente el nicho al que apunta este paquete.

La relevancia de esta ficha es practica: se trata de un artefacto de cuantizacion con requisitos de software muy concretos (ExLlamaV3 1.5.1) y una licencia Polyform Small Business 1.0.0 que condiciona el uso comercial. No hay resultados de benchmarks publicados ni informacion sobre idiomas, contexto o datos de entrenamiento en la informacion disponible, por lo que cualquier evaluacion debe hacerse ejecutando el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto a texto), con bloque MTP y torre de vision. Segun la model card, "esta arquitectura es densa" |
| Parametros totales | 27B (inferido de la denominacion del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4,00 bits por peso, variante H5/V6 (`-b 4 -hb 5 -mb 4 -vb 6`). No se publican otras variantes |
| Idiomas soportados | no disponible |
| Licencia | polyform-small-business-1.0.0 (etiqueta `license: other`, con enlace al fichero LICENSE del repositorio) |
| Formato de pesos | EXL3 (requiere ExLlamaV3 1.5.1). No se publican safetensors ni GGUF |
| Tamano del repositorio | 16,4 GB |
| Modelo base | bottlecapai/ThinkingCap-Qwen3.8-27B (relacion: quantized) |
| Modelo original | Qwen/Qwen3.8-27B (ajustado por bottlecapai) |
| Autor de la cuantizacion | khronnuz |
| Fecha de publicacion | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura del modelo base como densa, con tres componentes diferenciados que reciben cuantizaciones distintas: las capas del decodificador a 4 bits, la cabeza de salida a 5 bits, el bloque MTP (multi-token prediction, utilizado para decodificacion especulativa interna) a 4 bits y la torre de vision a 6 bits. No hay tabla de n-gramas y la opcion `-hq` no eleva la precision de ninguna capa, lo que implica que este paquete no aplica la tecnica de capas de alta calidad que si usan otras recetas EXL3.

El proceso de calibracion esta documentado con detalle: primero se construyo un paquete de 8 bits por peso a partir de los mismos pesos BF16 y sobre el se muestrearon 217 trazas con `sc_trace.py` usando un esfuerzo de razonamiento `xhigh`. El paquete final es una conversion nueva de los pesos BF16 con `-cd` apuntando a esas trazas, no una recuantizacion del paquete de 8 bits, y no se emplearon `sc_measure` ni `sc_optimize`. El mapa de bits replica el del paquete autocalibrado de turboderp para Qwen3.8-27B. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el ajuste fino original.

## Capacidades

- Generacion de texto y razonamiento: el modelo base incorpora un modo de razonamiento con esfuerzo configurable (la calibracion se hizo con `xhigh`), lo que sugiere soporte de cadenas de pensamiento extensas.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text y la torre de vision se conserva a 6 bits, por lo que acepta entradas visuales ademas de texto.
- Prediccion multi-token: la presencia de un bloque MTP dedicado permite decodificacion especulativa interna, lo que en teoria aumenta el throughput de generacion.
- Capacidades de codigo, matematicas o tool calling: no disponible (no se documentan en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de documentos con imagenes en local: al conservar la torre de vision a 6 bits y caber en una GPU de 24 GB, el modelo puede extraer informacion de capturas, diagramas o formularios escaneados sin enviar datos a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Razonamiento extenso sobre contexto tecnico: el modo de razonamiento con esfuerzo alto permite abordar tareas que requieren varios pasos de deduccion (depuracion de configuraciones, analisis de trazas) antes de dar una respuesta final.
- Asistente de desarrollo en estaciones de trabajo individuales: con un solo acelerador de gama alta el modelo queda servido de forma persistente, lo que permite integrarlo en el editor o en un chat interno sin coste por token.
- Prototipado de producto multimodal: equipos que necesitan validar una idea de aplicacion imagen-texto pueden desplegar este paquete ExLlamaV3 y medir calidad real antes de comprometerse a usar la version BF16 o un endpoint en la nube.
- Generacion aumentada por recuperacion sobre corpus propios: el modelo sirve como generador de respuestas finales citando fragmentos recuperados, ejecutandose en hardware propio y evitando la fuga de documentos internos.
- Investigacion sobre cuantizacion: el repositorio documenta el proceso de calibracion con trazas de razonamiento, por lo que resulta util como caso de estudio reproducible de como afecta la calibracion basada en trazas al comportamiento del modelo en tareas de razonamiento.
- Despliegue en pequenas empresas: la licencia Polyform Small Business esta pensada para este perfil de usuario, lo que convierte al paquete en una opcion viable para productos internos de companias que cumplen los umbrales de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 13,5 GB solo para los 27B a 4,00 bits por peso, mas la cabeza de salida a 5 bits y la torre de vision a 6 bits. El repositorio completo ocupa 16,4 GB, por lo que el consumo real de pesos ronda esa cifra.
- VRAM total recomendada: 20-24 GB para contexto corto y margen de cache KV; 24 GB o mas para contextos largos, dado que la longitud de contexto no esta documentada y la cache KV escala con ella.
- GPU compatibles: cabe en tarjetas de consumo con 24 GB o mas, como RTX 3090, RTX 4090 y RTX 5090. En GPUs profesionales, A100 40/80 GB, H100 y L40S ofrecen margen sobrado y permiten lotes mayores.
- GPUs no recomendadas: tarjetas con 16 GB o menos pueden quedarse sin espacio al cargar pesos y cache KV; no hay datos de ejecucion parcial en CPU para EXL3.
- Software de despliegue: ExLlamaV3 1.5.1 es obligatorio segun el autor. Es esperable el uso a traves de TabbyAPI o de un cargador ExL3 en interfaces de inferencia, pero la informacion disponible no confirma integraciones concretas.
- Formatos no soportados: al ser EXL3, no es directamente cargable en llama.cpp, Ollama, vLLM ni TGI, que requieren GGUF, safetensors o sus propios formatos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| khronnuz/ThinkingCap-Qwen3.8-27B-exl3 | 27B (denso, inferido) | no disponible | EXL3 4,00 bpw H5/V6 | Polyform Small Business 1.0.0 | Cuantizacion de terceros, requiere ExLlamaV3 1.5.1, incluye vision y MTP |
| bottlecapai/ThinkingCap-Qwen3.8-27B | 27B (denso, inferido) | no disponible | Pesos BF16 originales (presumiblemente safetensors; no confirmado) | no disponible | Modelo base del que deriva esta cuantizacion |
| Qwen/Qwen3.8-27B | 27B (denso, inferido) | no disponible | no disponible | no disponible | Modelo original antes del ajuste fino |
| turboderp/Qwen3.8-27B-exl3 (SC_4.00bpw_H5_V6) | 27B (denso, inferido) | no disponible | EXL3 4,00 bpw H5/V6 | no disponible | Mismo mapa de bits que este paquete, pero sin el ajuste fino ThinkingCap |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de precision frente a los pesos BF16 originales. No hay evaluaciones publicadas que cuantifiquen esa degradacion en tareas de razonamiento, codigo o vision.
- El proceso de calibracion se basa en 217 trazas generadas con esfuerzo `xhigh`; ese sesgo de calibracion puede favorecer el rendimiento en razonamiento largo en detrimento de otros regimenes de uso como la generacion corta o la descripcion de imagenes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre la calidad del paquete.
- La licencia Polyform Small Business 1.0.0 es una licencia de uso restringido: permite el uso comercial a organizaciones que cumplen los umbrales definidos en el texto, pero no es una licencia de codigo abierto. Es imprescindible leer el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- La licencia del modelo base bottlecapai/ThinkingCap-Qwen3.8-27B y la de Qwen/Qwen3.8-27B pueden imponer condiciones adicionales que se acumulan sobre la licencia de la cuantizacion; no estan documentadas en la informacion disponible.
- Las dependencias son estrictas: exige ExLlamaV3 1.5.1. Versiones distintas pueden no cargar el paquete.
- No hay informacion sobre idiomas soportados, longitud de contexto, sesgos conocidos ni tasas de alucinacion. Cualquier despliegue en produccion deberia ir precedido de una evaluacion propia en el dominio objetivo.
- La fecha de publicacion registrada (23 de septiembre de 2026) y la ausencia de historial de actualizaciones impiden valorar el mantenimiento del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khronnuz/ThinkingCap-Qwen3.8-27B-exl3
- Variante concreta 4.00 bpw H5 V6: https://huggingface.co/khronnuz/ThinkingCap-Qwen3.8-27B-exl3/tree/4.00bpw_h5_v6
- Modelo base (ajuste fino): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete EXL3 de referencia de turboderp con el mismo mapa de bits: https://huggingface.co/turboderp/Qwen3.8-27B-exl3/tree/SC_4.00bpw_H5_V6
- Busqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos corresponden a contenido no relacionado con el ambito tecnico de esta ficha y se han descartado.
