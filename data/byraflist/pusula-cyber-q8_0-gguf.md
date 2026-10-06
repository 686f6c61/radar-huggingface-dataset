# ByRaflist/Pusula-Cyber-Q8_0-GGUF

## Resumen

Pusula-Cyber-Q8_0-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario ByRaflist. No se trata de un modelo completo, sino de un adaptador de bajo rango destilado a partir de ByRaflist/Pusula-Cyber, que a su vez es un ajuste fino (SFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. La conversion a GGUF se realizo con el espacio GGUF-my-lora de ggml.ai, y el unico artefacto del repositorio es el adaptador cuantizado en Q8_0, pensado para aplicarse sobre los pesos del modelo base en llama.cpp.

El tamano declarado en safetensors es de 18.464.768 parametros, una cifra que corresponde exclusivamente a las matrices LoRA y no al modelo completo: el modelo base Qwen2.5-1.5B-Instruct ronda los 1.500 millones de parametros. Por tanto, para utilizar este adaptador es imprescindible descargar por separado el modelo base compatible y cargarlo junto con el adaptador mediante el flag `--lora` de llama.cpp.

La relevancia de esta publicacion es limitada y muy reciente: el repositorio no registra descargas ni "likes", la model card es generica (generada automaticamente por el proceso de conversion) y no se declaran licencia, idiomas, composicion del dataset ni resultados de evaluacion. Su interes practico se reduce a quien quiera reproducir o inspeccionar un ajuste fino concreto sobre Qwen2.5-1.5B en entornos locales con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only denso (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 18.464.768 parametros en el adaptador (dato de safetensors); el modelo base Qwen2.5-1.5B-Instruct tiene ~1.500 millones de parametros |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; no confirmado de forma explicita en la model card del adaptador |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA en GGUF, compatible con llama.cpp) |

Datos adicionales de identificacion:

| Parametro | Valor |
|---|---|
| ID del repositorio | ByRaflist/Pusula-Cyber-Q8_0-GGUF |
| Autor | ByRaflist |
| Tipo de artefacto | Adaptador LoRA (libreria peft), no modelo autonomo |
| Modelo base del adaptador | ByRaflist/Pusula-Cyber |
| Modelo base original | Qwen/Qwen2.5-1.5B-Instruct |
| Pipeline | text-generation |
| Etiquetas | peft, gguf, lora, sft, transformers, trl, llama-cpp, gguf-my-lora, text-generation |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, no un modelo entrenado desde cero. La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con query-key-value agrupadas (GQA) y sesgo de atencion QKV. El proceso documentado es el siguiente: se entreno un adaptador sobre Qwen2.5-1.5B-Instruct con SFT (segun las etiquetas `sft`, `transformers` y `trl`), se publico como ByRaflist/Pusula-Cyber en formato PEFT y, posteriormente, ese adaptador se convirtio a GGUF con el espacio GGUF-my-lora de ggml.ai para producir el archivo Q8_0 que da nombre a este repositorio.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre hiperparametros del LoRA (rango, alpha, modulos objetivo). La denominacion "Cyber" sugiere un ajuste orientado a ciberseguridad, pero no se aporta ninguna evidencia documental que lo respalde. Tampoco se describe ninguna innovacion tecnica propia: no hay decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Generacion de texto en el rango de capacidad propio de un modelo de 1.500 millones de parametros, heredado de Qwen2.5-1.5B-Instruct.
- Instrucciones conversacionales de un solo turno y multi-turno basicas (el modelo base esta ajustado con instrucciones).
- Conocimiento general limitado, con mayor incidencia en tareas de baja complejidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base Qwen2.5-1.5B-Instruct no esta orientado a agentes complejos.
- Capacidades multilingues: el modelo base Qwen2.5 declara soporte multilingue amplio (29 idiomas), pero la model card de este adaptador no especifica idiomas, y el ajuste SFT puede haber degradado o alterado ese soporte.
- Capacidades especiales (modo thinking, vision, audio, embeddings): no disponible / no aplicable. Es un modelo exclusivamente de texto.
- Aplicacion de bajo rango: el adaptador puede cargarse o descargarse dinamicamente sobre el modelo base sin duplicar los pesos completos.

## Casos de uso

- Pruebas de inferencia local con llama.cpp: cargar el modelo base Qwen2.5-1.5B-Instruct en GGUF y aplicar el adaptador con `--lora` para evaluar en un portatil o en una maquina sin GPU dedicada, dado el reducido tamano de ambos artefactos.
- Clasificacion y etiquetado de texto en pipelines de bajo coste: usar el modelo para categorizar tickets, correos o registros con vocabulario tecnico, aprovechando que el adaptador fue ajustado con SFT sobre un dataset no documentado.
- Generacion de borradores en dominios tecnicos: redactar resumenes, notas de triaje o descripciones de incidentes como primer paso de un flujo con revision humana obligatoria.
- Asistente de documentacion interna en un servidor de desarrollo: desplegar `llama-server` con el adaptador para responder consultas sobre procedimientos internos, siempre con validacion posterior.
- Investigacion sobre adaptadores LoRA: servir como caso de estudio para medir como un ajuste con SFT de ~18,5 millones de parametros modifica el comportamiento de Qwen2.5-1.5B y para reproducir el flujo PEFT a GGUF.
- Filtrado o preprocesado en entornos air-gapped: al ejecutarse completamente en local y sin llamadas externas, puede emplearse para tareas de normalizacion o reformateo de texto en redes aisladas.
- Evaluacion comparativa de cuantizaciones: comparar la salida del adaptador en Q8_0 frente al adaptador sin cuantizar para medir la perdida de calidad introducida por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se aportan comparaciones con el modelo base ni con el adaptador sin cuantizar.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 19-20 MB en Q8_0 (18,46 millones de parametros), una cantidad despreciable frente al modelo base.
- VRAM para el modelo base: alrededor de 3,1 GB en FP16, ~1,7 GB en Q8_0 y ~1,0 GB en Q4_K_M, mas la cache KV (que crece con la longitud de contexto; a 32.768 tokens puede anadir varios cientos de MB o mas segun configuracion).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo tambien puede ejecutarse en CPU o en GPU integrada con cuantizaciones bajas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-cpp-python`), y cualquier frontend compatible con llama.cpp y soporte de LoRA. Ollama solo si su version admite adaptadores LoRA para el modelo base. vLLM y TGI requeririan convertir el adaptador a otro formato (por ejemplo, PEFT sin cuantizar) y no estan documentados en este repositorio.
- Latencia y throughput: no disponible. Como referencia estructural, un modelo denso de 1,5B en una GPU de consumo moderna suele ofrecer decenas o cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusula-Cyber-Q8_0-GGUF (este repositorio) | 18,46 M en el adaptador + ~1,5 B del base | 32.768 tokens en el base (no confirmado en la model card) | GGUF (LoRA) | no disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | safetensors, GGUF (varios) | Apache 2.0 (segun el modelo base original) | Muy extendido, miles de descargas |
| Qwen/Qwen2.5-3B-Instruct | ~3 B | 32.768 tokens | safetensors, GGUF | Qwen Research License (revisar condiciones) | Ampliamente disponible |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2 B | 131.072 tokens | safetensors, GGUF | Llama 3.2 Community License | Ampliamente disponible |

La comparacion con alternativas esta condicionada por la ausencia total de evaluaciones de este adaptador: no es posible afirmar que supere o iguale al modelo base Qwen2.5-1.5B-Instruct en ninguna tarea.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar por separado el modelo base Qwen2.5-1.5B-Instruct; sin el, el archivo GGUF no es utilizable.
- Licencia no declarada: el repositorio no especifica licencia. Esto impide determinar si el uso comercial esta permitido y constituye un riesgo legal para cualquier despliegue en produccion. Hay que verificar ademas las condiciones del modelo base (Qwen2.5-1.5B-Instruct) y del adaptador original ByRaflist/Pusula-Cyber.
- Sin evaluacion: no hay benchmarks, ni comparaciones con el modelo base, ni ejemplos de salida. No se puede verificar que el ajuste SFT mejore el rendimiento en el dominio objetivo; podria degradarlo.
- Riesgo elevado de alucinacion: con 1,5 B de parametros, el modelo tiende a inventar datos facticos, citas y referencias, especialmente en tareas de conocimiento especializado como ciberseguridad.
- Capacidad limitada: 1,5 B de parametros restringen el razonamiento multi-paso, las matematicas complejas, la generacion de codigo extenso y el seguimiento de instrucciones largas y anidadas.
- Idiomas no documentados: aunque el modelo base es multilingue, el ajuste SFT pudo reducir el soporte efectivo a uno o pocos idiomas. No hay confirmacion.
- Trazabilidad insuficiente: se desconocen el dataset de entrenamiento, el numero de tokens, la configuracion del LoRA y el proceso de curacion de datos. Esto impide auditar sesgos o contenido problematico.
- Rendimiento de la cuantizacion Q8_0 no medido: se desconoce la degradacion respecto al adaptador en precision completa.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 "likes", sin issues ni discusiones. No hay senales externas de calidad o de funcionamiento correcto.
- Metadatos atipicos: la fecha de creacion registrada es 2026-10-05 y el tamano del repositorio figura como 0.0 GB; conviene verificar la integridad de los archivos antes de usarlos.
- Uso responsable: dado el nombre del adaptador y la ausencia de documentacion, no deberia emplearse para tareas de seguridad ofensiva, diagnostico automatizado ni decisiones sin supervision humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ByRaflist/Pusula-Cyber-Q8_0-GGUF
- Adaptador original: https://huggingface.co/ByRaflist/Pusula-Cyber
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp (uso de LoRA): https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
