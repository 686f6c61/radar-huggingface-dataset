# anguoyang/minilm-v2-qcs6490

## Resumen

El repositorio `anguoyang/minilm-v2-qcs6490` no contiene un modelo nuevo, sino una ficha de medicion de rendimiento del modelo `sentence-transformers/all-MiniLM-L6-v2` sobre el SoC Qualcomm QCS6490, en concreto sobre el kit Dragonwing RB3 Gen 2 Vision Kit. El autor publica el primer dato publico de latencia de inferencia de este modelo de embeddings en ese hardware, ejecutado con el runtime QNN a traves de la API de Qualcomm AI Hub. El modelo subyacente es un transformer encoder de 22 millones de parametros que produce embeddings de 384 dimensiones.

La relevancia es practica para el despliegue en el borde: hasta ahora no existia una entrada de rendimiento para el RB3 en el fichero `perf.yaml` de `qai-hub-models` 0.66.0, por lo que este dato sirve como referencia para dimensionar pipelines de busqueda semantica, deduplicacion o clasificacion ligera en dispositivos con QCS6490. La medicion reportada es de 39,6 ms de tiempo de inferencia estimado para una entrada de 1 x 128 tokens en precision fp32 sin cuantizacion explicita.

Conviene subrayar que el repositorio no publica pesos ni artefactos compilados, solo numeros y metodologia. Cualquier uso en produccion debe partir del modelo original de sentence-transformers, cuya licencia es Apache-2.0 segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2, 6 capas) |
| Parametros totales | 22 millones (modelo subyacente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en la medicion reportada (limite nativo del modelo no disponible en la informacion) |
| Tipos de cuantizacion | fp32 ONNX sin cuantizacion explicita en la medicion; otras opciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo original all-MiniLM-L6-v2 es Apache-2.0 segun la model card |
| Formato de pesos | no se publican pesos; el perfil se realizo sobre ONNX exportado (90.328.532 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente, `all-MiniLM-L6-v2`, es un transformer encoder de 6 capas y 22 millones de parametros que genera representaciones densas de 384 dimensiones. Se trata de un modelo de sentence embeddings derivado de MiniLM mediante destilacion, orientado a similitud semantica y recuperacion de informacion, no a generacion de texto. La model card de este repositorio no aporta informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo etapas de ajuste adicionales.

La contribucion tecnica del repositorio es metodologica: la exportacion del modelo a ONNX desde la definicion `minilm_v2` de `qai-hub-models` 0.66.0 y su perfilado en un unico grafo mediante `submit_inference_job(..., profile=True)` de la API de Qualcomm AI Hub. El valor reportado corresponde a `execution_summary.estimated_inference_time` del job de perfilado (IDs de compilacion `jp8kdoxzp` y de perfilado `jgkkwz4yg`), con runtime QNN y opciones de compilacion por defecto de AI Hub. Se trata de una estimacion por grafo, no de la latencia extremo a extremo de una aplicacion.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio vectorial de 384 dimensiones.
- Similitud semantica entre textos y busqueda por vecino mas proximo.
- Deduplicacion y agrupamiento de textos por similitud.
- Clasificacion de texto ligera mediante embeddings como caracteristica de entrada.
- Recuperacion de informacion (retrieval) en pipelines RAG de baja latencia.
- Inferencia en dispositivo de borde sobre el SoC QCS6490 con runtime QNN.
- No dispone de generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Busqueda semantica en el borde: el modelo puede indexar y consultar pequenos corpus locales en el propio dispositivo QCS6490, con una latencia estimada por inferencia de 39,6 ms para entradas de 128 tokens, suficiente para interacciones casi interactivas sin conexion.
- Deduplicacion de registros en dispositivos industriales: comparar embeddings de descripciones o incidencias para agrupar duplicados antes de sincronizar con el backend, reduciendo trafico y coste de red.
- Enrutamiento de consultas en asistentes embebidos: clasificar la intencion del usuario comparando el embedding de la consulta con prototipos precalculados, con coste de computo minimo en el SoC.
- Filtrado previo en pipelines RAG: descartar fragmentos irrelevantes localmente antes de enviar candidatos a un modelo generativo en la nube, lo que reduce tokens y latencia extremo a extremo.
- Clasificacion de texto en tiempo real en camaras y sensores: transformar transcripciones o etiquetas cortas en vectores para tareas de moderacion o categorizacion en el dispositivo.
- Cache semantica de respuestas: detectar consultas equivalentes comparando embeddings para reutilizar respuestas previas, con una ventana de 128 tokens adecuada para consultas cortas.
- Evaluacion de hardware en laboratorio: usar el dato de 39,6 ms como referencia para comparar configuraciones de compilacion, cuantizacion o versiones del runtime QNN sobre el mismo dispositivo.

## Benchmarks y rendimiento

La unica metrica publicada en el repositorio es la latencia de inferencia en el dispositivo de referencia.

| Metrica | Valor | Condiciones |
|---|---|---|
| Tiempo de inferencia estimado | 39,6 ms (39.624 µs) | 1 x 128 tokens, fp32 ONNX, QNN, opciones por defecto de AI Hub |
| Entrada | `input_ids` y `attention_mask` de 1 x 128 | Perfilado de un unico grafo |
| Salida | 1 embedding de 384 dimensiones | - |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) | Fecha de medicion: 2026-11-18 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni metricas de recuperacion) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el dispositivo objetivo, que es un SoC de borde sin GPU discreta; el modelo de 22 millones de parametros ocupa del orden de decenas de MB en fp32.
- GPU recomendadas: el perfilado se realizo sobre la NPU/Hexagon del QCS6490 mediante el runtime QNN; no se reportan datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, el modelo subyacente es lo bastante pequeno para ejecutarse en cualquier GPU de consumo, aunque no se aportan mediciones en esa configuracion.
- Opciones de despliegue: Qualcomm AI Hub con runtime QNN en el dispositivo de referencia; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible y, en el caso de vLLM o TGI, no son adecuadas para un encoder de embeddings.
- Latencia y throughput: 39,6 ms por inferencia estimada en el QCS6490 para 128 tokens; no se publica throughput agregado ni latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| all-MiniLM-L6-v2 (objeto de esta medicion) | 22 M | 384 | 128 tokens en la medicion | Apache-2.0 (modelo original) | Hugging Face |
| Otras variantes MiniLM de sentence-transformers | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de embeddings para el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con modelos alternativos.

## Limitaciones y advertencias

- El repositorio no publica pesos ni artefactos compilados; solo numeros y metodologia. Para usar el modelo hay que partir de `sentence-transformers/all-MiniLM-L6-v2`.
- La licencia del repositorio figura como no disponible; la model card indica que el modelo original es Apache-2.0, pero conviene verificar los terminos antes de un uso comercial.
- El dato de 39,6 ms es una estimacion por grafo de AI Hub, no una latencia extremo a extremo; no incluye preprocesado, tokenizacion ni postprocesado.
- La medicion usa fp32 sin cuantizacion explicita; una cuantizacion posterior podria alterar tanto la latencia como la calidad de los embeddings, y no se reportan resultados en ese escenario.
- La ventana evaluada es de 128 tokens; entradas mas largas no estan cubiertas por la medicion y el limite nativo del modelo no se detalla en la informacion.
- No se aportan datos sobre sesgos, idiomas soportados ni tasas de alucinacion; al ser un modelo de embeddings, el riesgo relevante es la perdida de matiz semantica en textos largos o especializados, no la generacion de contenido falso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los numeros publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/minilm-v2-qcs6490
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio de seguimiento de la serie de mediciones: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub: https://aihub.qualcomm.com/
