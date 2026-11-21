# odelpa/qwen3.5-0.8b-scalpello-b2-gdp

## Resumen

qwen3.5-0.8b-scalpello-b2-gdp es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por el investigador independiente Giovanni Del Papa (odelpa, proyecto "Lo Scienziato Dilettante GDP"). No es un fine-tune convencional: es una edicion de pesos en forma cerrada (weight-space programming) que aplica una reflexion de Householder sobre las proyecciones de salida de atencion de las capas 12 a 23, sin gradientes, sin optimizador y sin datos de entrenamiento nuevos. El objetivo es corregir un modo de fallo concreto del modelo base: los bucles de re-verificacion ("Wait...") que agotan el presupuesto de tokens antes de emitir una respuesta final.

El modelo conserva la arquitectura multimodal del base (image-text-to-text, con torre de vision intacta bit a bit) y los 873,4 millones de parametros. Solo se modifican 25,2 millones de parametros (aproximadamente el 3 %), con un cambio relativo de norma de Frobenius del 6,6-9,2 % por tensor. El resto de pesos permanece identico al original.

Su relevancia es metodologica: demuestra que una intervencion quirurgica de bajo coste en el espacio de pesos puede recuperar decenas de puntos de accuracy en tareas de razonamiento matematico cuando el cuello de botella es de control de generacion y no de conocimiento. La evaluacion publicada por el autor, sobre problemas de practica de GSM8K y MATH con un limite de 8.192 tokens, reporta un salto de 9,38 % a 53,65 % de accuracy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion Gated DeltaNet y atencion completa, mas torre de vision (base Qwen3.5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Parametros editados | 25,2 M (aprox. 3 % del total) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor evalua con limite de 8.192 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 y BF16 publicados; el resto no disponible |
| Idiomas soportados | en, it |
| Licencia | Apache-2.0 (pesos); articulo CC BY 4.0 |
| Formato de pesos | safetensors (bf16) y GGUF (texto) |
| Pipeline | image-text-to-text |
| Libreria | transformers (version que soporte `Qwen3_5ForConditionalGeneration`) |
| Modelo base | Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B: un transformer hibrido en el que conviven capas con atencion Gated DeltaNet (lineal) y capas con atencion completa, ademas de una torre de vision para entrada de imagen y texto. La edicion actua sobre 12 proyecciones de salida de atencion: `linear_attn.out_proj.weight` en las capas 12, 13, 14, 16, 17, 18, 20, 21 y 22 (Gated DeltaNet) y `self_attn.o_proj.weight` en las capas 15, 19 y 23 (atencion completa). Todos los demas tensores, incluida la torre de vision, son identicos bit a bit al modelo base.

No hubo entrenamiento. La direccion de edicion `u` se obtuvo con un unico pase teacher-forced del modelo original sobre 3 pares de textos emparejados (mismo prompt, una continuacion productiva y otra repetitiva con "Wait..."), tomando el estado oculto del indice 20 promediado sobre los ultimos 80 tokens, calculando la diferencia de medias (repetitivo menos productivo), ortogonalizando respecto al estado productivo medio y normalizando. Sobre esa direccion se aplica una reflexion de Householder `W' = (I - 2 u u^T) W` con `s = 2`. El autor selecciono la configuracion sobre 32 problemas de diagnostico: las ediciones solo en MLP degradaban (-9,4 puntos), la edicion solo en atencion era la mejor (+46,9), `s = 4` colapsaba el modelo y una direccion ortogonal aleatoria daba +3,1 ± 5,5 puntos. La edicion se congelo antes de cualquier evaluacion held-out.

El proceso se ejecuto con autograd desactivado y sin optimizador, PCA ni SVD. Un modelo frontera (OpenAI `gpt-6-astra`) actuo unicamente como editor de API: escribio el codigo Python que se ejecuto en un kernel local de CPU con los pesos y solicito pases forward sobre una Tesla T4. No se modifico ni se destilo nada del modelo editor.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo thinking, heredado del modelo base.
- Razonamiento matematico con reduccion drastica de bucles de re-verificacion: la densidad de "wait" cae de 13,1 a 1,1 por cada 1.000 tokens en los problemas evaluados.
- Entrada multimodal imagen-texto (pipeline image-text-to-text), con la torre de vision intacta.
- Capacidades multilingues limitadas a ingles e italiano segun los metadatos del modelo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking del base esta habilitado.
- Capacidad especial: correccion de un modo de fallo especifico (re-chequeo repetitivo) mediante edicion de pesos, no mediante prompting.

## Casos de uso

- Resolucion de problemas matematicos con presupuesto de tokens acotado: el modelo esta disenado para no agotar el limite de generacion re-verificando. En pipelines donde cada consulta tiene un tope de 8.192 tokens, la tasa de respuestas truncadas baja del 91,7 % al 28,1 %.
- Evaluacion comparativa de tecnicas de edicion de modelos: sirve como caso reproducible de weight-space programming con registro de pasos, seleccion de hiperparametros y evaluacion pareada, util para investigadores que estudien intervenciones en el espacio de pesos.
- Prototipado de asistentes conversacionales en ingles e italiano sobre hardware modesto: con 873 M de parametros y cuantizacion Q8_0 o BF16, se puede desplegar en una unica GPU de consumo o en CPU via llama.cpp u Ollama.
- Docencia y divulgacion sobre interpretabilidad: el par de textos y la direccion de edicion son inspeccionables, lo que permite explicar como un estado oculto concreto modula el comportamiento de generacion.
- Experimentos de control de verbosidad: la misma metodologia (reflexion sobre proyecciones de atencion) puede trasladarse a otros modelos para reducir divagacion en tareas de razonamiento.
- Inferencia local con Ollama: el autor publica una variante `ollamagdp/qwen3.5-0.8b-scalpello-b2-gdp` y GGUFs compatibles con Ollama 0.40.x, adecuada para entornos sin GPU dedicada.
- Analisis multimodal ligero: al conservar la torre de vision del base, puede emplearse para tareas de descripcion de imagenes o VQA simple en italiano e ingles, aunque el autor no documenta evaluaciones en vision.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion del autor, no de benchmarks oficiales. Conjunto de 384 problemas held-out (6 cohortes disjuntas de 64 problemas: 32 de entrenamiento de GSM8K y 32 de entrenamiento de MATH, de ficheros de practica descontaminados), thinking activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, limite de 8.192 tokens y una muestra por modelo. La edicion se congelo antes de la validacion.

| Metrica | Original | Editado |
|---|---|---|
| Accuracy, 384 problemas | 9,38 % | 53,65 % (+44,27 ± 2,56 pts; IC 95 % 39,32-49,22) |
| GSM8K train (192) | 10,42 % | 65,62 % |
| MATH train (192) | 8,33 % | 41,67 % |
| Respuestas cortadas por limite | 91,7 % | 28,1 % |
| Problemas incorrectos a correctos / correctos a incorrectos | — | 171 / 1 |

No se han publicado resultados en MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible. El autor advierte que se trata de particiones de practica, no de MATH-500 ni del test de GSM8K, y que con un presupuesto de 32.768 tokens la mejora seria probablemente menor.

## Requisitos de hardware

- VRAM estimada: con 873 M de parametros, aproximadamente 1,8 GB en BF16 y 0,9 GB en Q8_0 para los pesos; sumar overhead de contexto y activaciones (no cuantificado en la informacion disponible).
- GPU recomendadas: el autor realizo los pases forward de evaluacion en una Tesla T4; cualquier GPU con al menos 4 GB de VRAM deberia bastar para BF16.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores; tambien en CPU via llama.cpp.
- Opciones de despliegue: transformers (con soporte de `Qwen3_5ForConditionalGeneration`), llama.cpp, Ollama (probado con Ollama 0.40.13) y el endpoint `ollamagdp/qwen3.5-0.8b-scalpello-b2-gdp`. vLLM y TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. Los GGUFs usan tensores separados `attn_qkv`/`attn_gate` y `ssm_beta`/`ssm_alpha` para compatibilidad con Ollama 0.40.x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| odelpa/qwen3.5-0.8b-scalpello-b2-gdp | 873 M | no disponible (evaluado a 8.192) | Apache-2.0 | Edicion de pesos sobre Qwen3.5-0.8B; 53,65 % en 384 problemas de practica GSM8K/MATH |
| Qwen/Qwen3.5-0.8B | 873 M | no disponible | Apache-2.0 (segun el derivado) | Modelo base sin editar; 9,38 % en el mismo conjunto por truncamiento |
| Alternativas de ~1B para matematicas | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion directa mas informativa es contra su propio modelo base, ya que la unica diferencia son los 12 tensores editados. No se han proporcionado resultados de otros modelos de tamano similar en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- La evaluacion usa particiones de practica de GSM8K y MATH, no los conjuntos de test oficiales ni MATH-500; los resultados no son directamente comparables con cifras publicadas de benchmarks estandar.
- El limite de evaluacion es de 8.192 tokens en lugar de los 32.768 del modelo base, por lo que la mejora observada probablemente se reduce con presupuestos mayores.
- Se realizo una unica ejecucion de evaluacion; no hay replicas independientes ni intervalos por cohorte mas alla del IC global.
- La edicion elimina un obstaculo de bucle, no anade conocimiento: en dominios fuera de matematicas el efecto no esta caracterizado.
- El unico fallo documentado (math:1511) es un caso en el que el modelo editado entra en bucle despues de alcanzar la respuesta correcta, lo que indica que el modo de fallo no se elimina por completo.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; el modelo base de 873 M tiene capacidad limitada de conocimiento factual.
- Idiomas: solo ingles e italiano segun los metadatos; el rendimiento en castellano no esta documentado.
- Sesgos: no documentados por el autor.
- Licencia Apache-2.0 permite uso comercial, pero el articulo asociado es CC BY 4.0 y el prompt de tarea deriva del harness MIT de Takehi et al., lo que conviene revisar si se reutiliza.
- El modelo requiere una version de transformers que soporte `Qwen3_5ForConditionalGeneration`; los GGUFs son solo de texto y no incluyen la torre de vision.
- El proceso de creacion dependio de un modelo frontera propietario como editor de API; la reproducibilidad exacta de la direccion `u` requiere acceso a ese servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/odelpa/qwen3.5-0.8b-scalpello-b2-gdp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Articulo (DOI, IT/EN): https://doi.org/10.5281/zenodo.24416418
- Ollama: https://ollama.com/ollamagdp/qwen3.5-0.8b-scalpello-b2-gdp
- Referencia metodologica citada: Takehi, Teoh, Zhang, Khattab (MIT CSAIL), weight-space programming, 2 de noviembre de 2026 (sin URL en la informacion proporcionada)
- Ficheros GGUF, articulos PDF y figuras: disponibles en el repositorio del modelo, carpetas `gguf/`, `paper/` y `figures/`
