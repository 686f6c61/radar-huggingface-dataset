# Ashish666/anlp-a3-mamba

## Resumen

anlp-a3-mamba es un modelo de investigacion desarrollado por el usuario Ashish666 como parte de la asignatura ANLP (Assignment 3, Part A). Se trata de un modelo a nivel de caracter disenado para una tarea de descifrado de cifrados (cipher decryption), es decir, recuperar el texto plano a partir de un texto cifrado. No es un modelo de proposito general ni un asistente conversacional: su unico objetivo es la transformacion caracter a caracter de secuencias cifradas.

El modelo emplea una arquitectura Mamba con 12 capas y un total de 5.284.864 parametros, lo que lo situa en la categoria de modelos muy pequenos (del orden de 5 millones de parametros). La eleccion de Mamba (modelo de espacio de estados) frente a un transformer clasico responde al interes academico por arquitecturas de atencion lineal con coste de inferencia secuencial lineal en la longitud de la secuencia.

Su relevancia es fundamentalmente educativa y de investigacion: sirve como banco de pruebas para comparar arquitecturas SSM en tareas de transformacion de secuencias. Los resultados reportados por el autor son muy limitados (exact match de 0.0 y CER de 0.83), por lo que no debe considerarse un modelo apto para uso en produccion ni para tareas reales de criptografia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados), 12 capas |
| Parametros totales | 5.284.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch (pytorch) |

## Arquitectura y entrenamiento

La arquitectura es Mamba, un modelo de espacio de estados selectivo (SSM) con 12 capas. Segun los metadatos del autor, el coste computacional hacia delante para una secuencia de 1024 tokens es de 11.238.637.568 FLOPs (flops_fwd_1024), lo que permite estimar el regimen de computo del modelo. La etiqueta "deltanet" en los tags sugiere la inclusion de mecanismos de DeltaNet o variantes de actualizacion selectiva del estado, aunque la model card no detalla la composicion exacta de las capas.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. El modelo esta entrenado a nivel de caracter (character-level) para una tarea de descifrado, lo que implica un vocabulario de salida reducido y una formulacion secuencia-a-secuencia. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del propio uso de Mamba.

## Capacidades

- Descifrado de texto a nivel de caracter: transformacion de secuencias cifradas a texto plano, unica tarea para la que fue entrenado.
- Modelado de secuencias con estado recurrente (SSM), adecuado para dependencias de longitud moderada.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues; el entrenamiento es a nivel de caracter y no se especifican idiomas.
- No dispone de modo thinking, vision ni audio.
- No es un modelo instructivo ni conversacional: no se documenta alineacion para seguir instrucciones.

## Casos de uso

- Investigacion academica sobre arquitecturas SSM: el modelo sirve como referencia reproducible para comparar Mamba frente a transformers en tareas de transformacion de secuencias dentro de un entorno docente.
- Experimentos de descifrado por sustitucion o cifrados clasicos: puede emplearse como linea base para estudiar hasta que punto un modelo de 5M de parametros aprende patrones de sustitucion a nivel de caracter.
- Analisis de eficiencia de inferencia: con 11,2 GFLOPs hacia delante a 1024 tokens y un pico de memoria de 2,12 GB, es util para medir coste y latencia de Mamba en hardware modesto.
- Reproducibilidad de resultados: permite replicar las metricas reportadas (CER, Levenshtein, exact match) y verificar el pipeline de evaluacion del autor.
- Docencia y practicas de NLP: ejemplo de modelo entrenado desde cero con arquitectura no transformer para asignaturas de procesamiento de lenguaje natural.
- Pruebas de integracion de safetensors y PyTorch: util para validar flujos de carga de pesos y despliegue de modelos pequenos en entornos de desarrollo.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (conjunto de test):

| Metrica | Valor |
|---|---|
| Parametros | 5.284.864 |
| FLOPs forward (1024 tokens) | 11.238.637.568 |
| Exactitud por caracter (test_char_accuracy) | 0,1691 |
| Exactitud por palabra (test_word_accuracy) | 0,0007 |
| Precision | 0,0250 |
| Recall | 0,0373 |
| F1 | 0,0114 |
| Precision (micro) | 0,1691 |
| Recall (micro) | 0,1691 |
| F1 (micro) | 0,1691 |
| Distancia de Levenshtein media | 738,7117 |
| Levenshtein normalizada media | 0,8778 |
| CER (character error rate) | 0,8309 |
| Exact match | 0,0000 |
| Length match | 1,0000 |
| Tiempo de inferencia en test (s) | 37,2311 |
| Memoria pico (GB) | 2,1195 |
| Perdida en test | 2,5273 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,12 GB de memoria pico segun la metrica test_peak_mem_gb reportada por el autor; con precision FP32 el peso de los parametros es de aproximadamente 21 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, con holgura, incluidas GPUs de gama baja y entornos integrados.
- Opciones de despliegue: PyTorch nativo (libreria declarada), carga directa de safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor reporta 37,23 segundos para el conjunto de test completo, aunque no se especifica el tamano de dicho conjunto ni el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-mamba | 5,28 M | Mamba, 12 capas | no disponible | no disponible | Hugging Face (repo publico) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos Mamba de ~5M de parametros para descifrado a nivel de caracter) en la documentacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo: exact match de 0,0, CER de 0,83 y F1 de 0,0114; el modelo no descifra correctamente en la practica.
- Riesgo elevado de alucinacion y de generar texto plano incorrecto sin senal de confianza.
- Modelo de investigacion academica: no esta disenado ni validado para uso en produccion.
- Licencia no especificada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor.
- Idiomas no documentados; el entrenamiento a nivel de caracter no garantiza cobertura linguistica.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento mas alla de la longitud de entrenamiento.
- Sin alineacion ni instrucciones: no responde a prompts conversacionales.
- Sesgos desconocidos: no se documenta analisis de sesgos ni de seguridad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Ashish666/anlp-a3-mamba
- Paper de Mamba (referencia de arquitectura): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
