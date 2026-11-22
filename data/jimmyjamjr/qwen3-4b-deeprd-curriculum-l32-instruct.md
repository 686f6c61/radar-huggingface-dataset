# JimmyJamJr/qwen3-4b-deeprd-curriculum-L32-instruct

## Resumen

Qwen3-4B DeepRD Curriculum L32 Instruct es un ajuste fino completo del modelo Qwen/Qwen3-4B publicado por el usuario JimmyJamJr en Hugging Face. El modelo se entrena mediante un curriculum progresivo sobre problemas deductivos sinteticos generados por una version modificada del generador DeepRD: cada etapa k entrena con problemas cuya profundidad de lookahead se muestrea uniformemente entre 1 y L_k, y el modelo avanza de etapa cuando su precision exact-match reciente es suficientemente alta. El checkpoint publicado corresponde a la etapa L = 32 completada en el paso 13.375, con un tamano de paso s = 1.

El objetivo del entrenamiento es la prediccion del siguiente paso de una prueba formal: dado un conjunto de reglas sobre atributos ficticios, un hecho inicial y una meta, junto con un prefijo de prueba, el modelo debe emitir el siguiente atributo valido. Para preservar la capacidad de seguir instrucciones, el 6% de los ejemplos de entrenamiento se extraen de allenai/Dolci-Instruct-SFT, fuera del curriculum. Los prompts se envuelven en la plantilla de chat de Qwen3 con `enable_thinking=False`.

Se trata de un modelo de investigacion con 4.022.468.096 parametros, derivado de un modelo base denso de Qwen3, sin datos publicados de benchmarks, licencia ni idiomas soportados. Su relevancia es acotada: sirve como artefacto experimental para estudiar curriculos de lookahead en tareas de razonamiento deductivo sintetico, no como modelo generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-4B); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; el autor no la documenta) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Semilla de entrenamiento | 1234 |
| Etapa de curriculum | L = 32 (paso 13.375) |
| Tamano del repo | 8,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parametros, y se somete a un ajuste fino completo (full fine-tuning) con AdamW, tasa de aprendizaje constante de 5e-5 y precision bf16. No se aplican tecnicas de adaptacion de bajo rango ni congelacion de capas: se actualizan todos los pesos del modelo base.

La innovacion principal es el curriculum sobre lookahead y vocabulario de atributos. En la etapa k, el modelo entrena con problemas cuyo lookahead se muestrea uniformemente en el rango 1..L_k, donde L_k = k x s y s = 1. El vocabulario de atributos de cada etapa contiene 2(L_k + 1) etiquetas, de modo que la dificultad crece tanto en profundidad de busqueda como en numero de distractores. El modelo pasa a la siguiente etapa cuando su precision exact-match reciente en entrenamiento supera un umbral. El 6% de los ejemplos se toman de allenai/Dolci-Instruct-SFT para mantener el seguimiento de instrucciones fuera del dominio sintetico. Los prompts usan la plantilla de chat de Qwen3 con el modo de pensamiento desactivado.

La tarea de entrenamiento es la prediccion del siguiente paso en pruebas deductivas generadas por una version modificada del generador DeepRD. La evaluacion emplea decodificacion greedy y compara la primera palabra delimitada por espacio o puntuacion con el atributo gold, sin distinguir mayusculas.

## Capacidades

- Prediccion del siguiente paso en pruebas deductivas sinteticas sobre atributos ficticios, con lookahead de hasta 32 pasos de busqueda en anchura.
- Razonamiento deductivo encadenado dentro del formato de reglas y hechos del generador DeepRD.
- Seguimiento basico de instrucciones conversacionales, reforzado con el 6% de datos de Dolci-Instruct-SFT.
- Generacion de texto autoregresiva estandar mediante la libreria transformers.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de pensamiento explicito; el entrenamiento desactiva `enable_thinking`.

## Casos de uso

- Investigacion sobre curriculos de aprendizaje: el checkpoint permite analizar como escala la precision exact-match al aumentar el lookahead de 1 a 32, comparando con etapas intermedias del mismo entrenamiento.
- Evaluacion de razonamiento deductivo sintetico: sirve como banco de pruebas controlado para medir la capacidad de un modelo de 4.000 millones de parametros en tareas de prueba formal con distractores.
- Estudio de olvido catastrofico: al mezclar un 6% de Dolci-Instruct-SFT, permite medir el equilibrio entre especializacion en la tarea sintetica y retencion de instrucciones generales.
- Reproduccion de experimentos: la semilla 1234, la tasa de aprendizaje y el criterio de avance de etapa estan documentados, lo que facilita replicar el pipeline sobre Qwen3-4B.
- Generacion de datos sinteticos de razonamiento: el modelo puede producir continuaciones de pruebas que sirvan como material de destilacion o aumento de datos en dominios logicos.
- Analisis de formatos de prompt: util para comparar el efecto de la plantilla de chat de Qwen3 con `enable_thinking=False` frente a otros formatos en tareas de deduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el criterio de evaluacion (exact-match de la primera palabra con decodificacion greedy) y el estado de avance del curriculum (etapa L = 32, paso 13.375), sin cifras de precision ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas para bf16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB); tambien cabe en RTX 3090 y RTX 4080 con margen.
- GPU de consumo: si, cabe en tarjetas consumer de 16 GB o mas en bf16, y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun los tags, y previsiblemente vLLM, llama.cpp u Ollama tras conversion a GGUF, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B DeepRD Curriculum L32 Instruct | 4.022.468.096 | no disponible | Ajuste fino con curriculum de lookahead sobre tarea deductiva sintetica | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | aproximadamente 4.000 millones | no disponible en esta ficha | Modelo base generalista | no disponible en esta ficha | Hugging Face, ampliamente distribuido |
| Alternativas de razonamiento de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con otras alternativas de la misma categoria no esta disponible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento que permitan situarlo frente a otros modelos de razonamiento de tamano similar.

## Limitaciones y advertencias

- Especializacion extrema: el entrenamiento se centra en pruebas deductivas sinteticas con atributos ficticios; el rendimiento en tareas generales puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad fuera del dominio de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse la licencia del modelo base Qwen/Qwen3-4B antes de cualquier despliegue en produccion.
- Idiomas no documentados: se desconoce que cobertura linguistica conserva tras el ajuste fino.
- Riesgo de alucinacion: como cualquier modelo generativo, puede emitir atributos no presentes en las reglas o pasos invalidos en la prueba.
- Sin datos de sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el ajuste, aunque la hereda del modelo base.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay validacion de la comunidad.
- Uso previsto de investigacion: no se recomienda como modelo de proposito general sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JimmyJamJr/qwen3-4b-deeprd-curriculum-L32-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de instrucciones citado: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
