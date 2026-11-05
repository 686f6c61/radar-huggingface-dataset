# Nyanta19/tesda-e5-small-v6-colab

## Resumen

TESDA E5 Small v6 (Colab) es un modelo de embeddings de frases en formato ONNX desarrollado por el usuario Nyanta19, orientado a una tarea muy concreta: emparejar los objetivos formativos de un estudiante con las cualificaciones del sistema TESDA (Technical Education and Skills Development Authority, Filipinas). Se trata de un ajuste fino continuado sobre `Nyanta19/tesda-e5-small-v4`, que a su vez parte de la familia E5 Small, una arquitectura BERT de pequeno tamano con embeddings de 384 dimensiones.

El modelo no es un generador de texto: es un encoder de similitud semantica que produce embeddings de tokens de 384 dimensiones que deben procesarse con mean pooling ponderado por la mascara de atencion y normalizacion L2, usando los prefijos de entrada `query:` y `passage:` propios de la familia E5. Su interes radica en el entrenamiento con un objetivo multi-positivo (v6) y con ejemplos de rechazo de objetivos no relacionados, lo que apunta a un caso de uso de recuperacion con filtrado de falsos positivos.

La relevancia practica es limitada fuera de su nicho: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, contiene unicamente pesos ONNX (sin PyTorch ni safetensors), pesa 0,5 GB y el propio autor advierte que carece de fichero de calibracion, por lo que debe calibrarse y evaluarse antes de usarlo para puntuar o rechazar candidaturas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), exportado a ONNX; familia E5 Small |
| Parametros totales | no disponible (repo de 0,5 GB; consistente con el rango de E5 Small, pero no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se detalla si estan cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (no incluye PyTorch ni safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT de la familia E5 Small, con salida de embeddings de tokens de 384 dimensiones. El pipeline de inferencia requiere aplicar mean pooling con la mascara de atencion y normalizar L2 el vector resultante, anteponiendo los prefijos `query:` para la consulta y `passage:` para el documento, tal como especifica la model card. El repositorio contiene los ficheros exactos de servicio del artefacto `tesda-e5-small-v6-colab.zip`, con hashes registrados en `checksums.json`.

El entrenamiento continuo parte de `Nyanta19/tesda-e5-small-v4` y se ejecuto en una Tesla T4 durante 1.132 pasos (una epoca, learning rate 1e-5), con un objetivo multi-positivo v6 y ejemplos de rechazo de objetivos no relacionados. La perdida de validacion descendio de 0,3165 a 0,2810, aunque el autor aclara explicitamente que estas metricas son diagnosticos de entrenamiento y no resultados de evaluacion de la aplicacion. Los detalles de configuracion y procedencia estan en `training.json` y `run_config.json`. No se documenta el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplicable de forma tipica a un encoder de similitud).

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica y recuperacion (retrieval).
- Emparejamiento entre objetivos formativos de estudiantes y cualificaciones TESDA, su tarea principal declarada.
- Rechazo de objetivos no relacionados mediante ejemplos negativos incluidos en el entrenamiento v6.
- Soporte de similitud texto-texto con prefijos asimetricos `query:` / `passage:`.
- No soporta generacion de texto, razonamiento generativo, codigo ni matematicas (es un encoder, no un modelo causal).
- No hay evidencia de soporte de tool calling, function calling ni agentes multi-paso.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Motor de recomendacion de cursos: dado el objetivo en lenguaje natural de un estudiante (como `query:`), recuperar las cualificaciones TESDA mas afines del catalogo indexado como `passage:`, usando similitud coseno sobre embeddings normalizados.
- Filtrado de candidaturas no pertinentes: aprovechar los ejemplos de rechazo del entrenamiento v6 para descartar objetivos que no encajan con ninguna cualificacion antes de derivar al estudiante a un asesor.
- Busqueda semantica interna sobre catalogos de formacion: indexar descripciones de cursos y permitir consultas en lenguaje natural en un portal de empleo o educacion.
- Deduplicacion y agrupacion de objetivos formativos: agrupar formulaciones equivalentes de un mismo objetivo para normalizar formularios de registro.
- Clasificacion ligera por similitud: asignar etiquetas predefinidas comparando el embedding del texto con embeddings de referencia de cada etiqueta.
- Despliegue en entornos con recursos limitados: al ser ONNX de 0,5 GB, puede ejecutarse en CPU o en GPUs modestas dentro de servicios de inferencia de embeddings, sin necesidad de infraestructura de gran escala.
- Prototipado rapido en Colab: el artefacto esta preparado para ejecutarse en notebooks, lo que facilita pruebas de concepto antes de invertir en calibracion y evaluacion formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion del entrenamiento (de 0,3165 a 0,2810), que el propio autor califica como diagnostico de entrenamiento y no como evaluacion de la aplicacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repo (0,5 GB en ONNX) es plausible ejecutarlo en CPU y en GPUs consumer con pocos GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: el entrenamiento se realizo en una Tesla T4; para inferencia no se especifican requisitos.
- GPU consumer: probablemente viable en GPUs de gama media-baja por el tamano del artefacto, aunque no confirmado en la documentacion.
- Opciones de despliegue: ONNX Runtime es la via natural; no se mencionan vLLM, llama.cpp, Ollama ni TGI (y estos ultimos no aplican a un encoder BERT).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Nyanta19/tesda-e5-small-v6-colab | no disponible (repo 0,5 GB) | no disponible | Similitud de frases (nicho TESDA) | no disponible | ONNX |
| Nyanta19/tesda-e5-small-v4 (modelo base) | no disponible | no disponible | Similitud de frases (nicho TESDA) | no disponible | no disponible |
| Familia E5 Small original (multilingual-e5-small / e5-small) | ~118 M (referencia de la familia, no confirmado para este ajuste) | 512 tokens (referencia de la familia, no confirmado) | Embeddings multilingues de proposito general | MIT (referencia de la familia, no confirmado) | safetensors / ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte que el artefacto no incluye `calibration.json`: debe calibrarse y evaluarse esta ejecucion concreta antes de usarla para puntuar o rechazar en una aplicacion real.
- Las metricas de perdida reportadas son diagnosticos de entrenamiento, no resultados de evaluacion; no deben presentarse como rendimiento en produccion.
- Solo se distribuyen pesos ONNX; no hay PyTorch ni safetensors, lo que limita el reentrenamiento o el ajuste fino con herramientas habituales.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; el entrenamiento esta orientado al contexto TESDA (Filipinas) y no hay evidencia de calidad multilingue.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos o negativos en el emparejamiento, especialmente sin calibracion.
- Sesgos conocidos: no documentados; al entrenarse sobre un dominio acotado, puede infrarepresentar objetivos formativos fuera del catalogo TESDA.
- Repositorio sin descargas ni validacion externa: no hay evidencia de uso en produccion por terceros.
- Longitud de contexto no documentada: textos largos pueden truncarse sin que se indique el limite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nyanta19/tesda-e5-small-v6-colab
- Modelo base: https://huggingface.co/Nyanta19/tesda-e5-small-v4
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
