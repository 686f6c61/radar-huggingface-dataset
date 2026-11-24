# leakked/SenseNova-Loop-9B-UNCENSORED-HERETIC-GGUF

## Resumen

SenseNova-Loop-9B-UNCENSORED-HERETIC-GGUF es una cuantización Q4_K_M en formato GGUF del modelo SenseNova-Loop-9B, publicado por el usuario leakked. El modelo original lo desarrolla SenseTime / OpenSenseNova y es un transformer de aproximadamente 8.960 millones de parámetros (8,96 B) orientado a generación de texto y razonamiento. Esta edición concreta aplica una ablación selectiva de pesos sobre el checkpoint original para reducir la tasa de rechazos y, después, lo cuantiza a Q4_K_M, dando como resultado un único archivo de 5,6 GB ejecutable en llama.cpp.

Su relevancia práctica reside en que comprime un modelo de 9 B con ventana de contexto declarada de 512K tokens en un GGUF de 5,6 GB, lo que permite inferencia local en hardware de consumo con suficiente memoria. El autor declara soporte para inglés y francés, mantiene la plantilla de chat original y está pensado para respuestas directas y modos de razonamiento más profundos. La licencia es Apache 2.0.

Conviene tratarlo como un derivado comunitario no oficial: la edición de pesos altera el comportamiento del modelo base y no cuenta con la validación del equipo original de SenseTime. La model card reporta métricas internas (fidelidad al base ≈97 %, ≈3 rechazos por cada 100 peticiones, 30/30 en precisión factual sobre un set pequeño), pero no hay benchmarks públicos estandarizados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SenseNova-Loop-9B; detalles internos no disponibles) |
| Parametros totales | 8.956.949.376 (≈8,96 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 512K tokens (ventana del modelo base, segun la model card) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | Ingles y frances (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `SenseNova-Loop-9B-Uncensored-Q4_K_M.gguf`) |
| Tamano del repo | 5,6 GB |
| Modelo base | sensenova/SenseNova-Loop-9B |
| Runtime compatible | llama.cpp (requiere soporte de `sensenova_loop`, p. ej. fork de GuideboardLabs) |
| Cuantizacion con imatrix | Si (tag `imatrix`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un transformer de 8,96 B parámetros desarrollado por SenseTime / OpenSenseNova. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO. La model card del derivado tampoco aporta estos datos del base; únicamente confirma que la ventana de contexto es de 512K tokens y que el modelo soporta modos de respuesta directa y de razonamiento profundo mediante su plantilla de chat original.

La innovación de este checkpoint no está en la arquitectura, sino en el post-procesado: el autor aplica una ablación dirigida de pesos sobre el checkpoint de publicación para reducir la tasa de rechazos, preservando la generación bilingüe y el razonamiento, y después cuantiza a Q4_K_M con matriz de importancia (imatrix). El resultado es un GGUF de 5,6 GB que conserva la plantilla de chat original. El autor indica que fue probado con un fork de llama.cpp de GuideboardLabs con backend HIP sobre una AMD Radeon RX 9070 XT, lo que implica que el runtime estándar de llama.cpp puede no reconocer la arquitectura `sensenova_loop` sin ese soporte específico.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y francés.
- Razonamiento en modo directo y en modo de razonamiento extendido (thinking), según la plantilla de chat original.
- Respuestas de carácter factual: el autor reporta 30/30 en un set interno de precisión factual, tanto en modo directo como de razonamiento.
- Reducción de rechazos: ≈3 rechazos por cada 100 peticiones según la model card.
- Ejecución local en CPU/GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo tras una API compatible con el formato de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional local en francés e inglés: el modelo mantiene conversaciones multi-turno con la plantilla de chat original y un contexto declarado de 512K tokens, adecuado para sesiones largas sin truncar el historial.
- Despliegue en estación de trabajo con GPU de consumo: el GGUF Q4_K_M de 5,6 GB cabe en GPUs con 8 GB o más de VRAM, permitiendo un asistente privado sin conexión a servicios en la nube.
- Procesamiento de documentos largos en francés: con la ventana de 512K tokens se pueden ingerir informes, contratos o transcripciones extensas y pedir resúmenes o extracción de datos, siempre que la memoria del runtime lo permita.
- Generación de contenido sin filtros editoriales agresivos: la ablación reduce los rechazos, lo que resulta útil en tareas creativas o de análisis sensible donde un exceso de negativas interrumpe el flujo (con las advertencias de la sección de limitaciones).
- Prototipado de razonamiento paso a paso: el modo de razonamiento extendido permite experimentar con cadenas de pensamiento en investigación sobre interpretabilidad o evaluación de modelos pequeños.
- Evaluación comparativa de derivados no oficiales: sirve como caso de estudio de cómo una ablación de pesos afecta a la fidelidad respecto al base, con la métrica declarada de ≈97 % de fidelidad.
- Integración en pipelines de generación de texto vía API local: el tag `endpoints_compatible` facilita montarlo detrás de un servidor compatible y conectarlo a aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye métricas internas del autor, recogidas en la siguiente tabla:

| Metrica (interna, autor) | Resultado |
|---|---|
| Fidelidad al modelo base | ≈97 % |
| Tasa de rechazos | ≈3 / 100 peticiones |
| Precisión factual (set interno) | 30 / 30 (modo directo y razonamiento) |
| Ventana de contexto | 512K tokens (base) |
| Tamano del GGUF | 5,6 GB |

Estas cifras no son comparables con benchmarks públicos y provienen de un set de prueba pequeño y no documentado en detalle.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 5,6 GB; se recomienda al menos 6-8 GB de VRAM para cargar el modelo completo en GPU, dejando margen para el contexto KV.
- GPU recomendadas: AMD Radeon RX 9070 XT (probada por el autor con HIP), NVIDIA RTX 4090, RTX 4080, RTX 3090 y GPUs con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en cuantización Q4_K_M; en GPUs con menos memoria puede recurrirse a offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (se requiere soporte de `sensenova_loop`, p. ej. el fork de GuideboardLabs), servidores compatibles con endpoints GGUF y runtimes que acepten GGUF. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card advierte que el razonamiento puede tardar mucho tiempo y que la longitud de contexto práctica depende de la memoria y la configuración del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-UNCENSORED-HERETIC (este) | ≈8,96 B | 512K (base) | GGUF Q4_K_M | Apache 2.0 | Derivado comunitario con ablación de pesos; sin benchmarks publicos |
| sensenova/SenseNova-Loop-9B (base) | ≈8,96 B | 512K | safetensors | Apache 2.0 | Checkpoint oficial de SenseTime; sin ablación |
| Alternativas de 9B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con otras alternativas de tamaño similar; los datos de benchmarks del base y de terceros no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: la ablación de pesos puede alterar el comportamiento y la fiabilidad respecto al modelo base; no está validado por SenseTime / OpenSenseNova.
- Riesgo de alucinación: inherente a modelos de este tamaño; la métrica 30/30 procede de un set interno pequeño y no debe extrapolarse.
- Mezcla de idiomas: el autor advierte que en respuestas en francés pueden aparecer ocasionalmente caracteres de otros idiomas.
- Latencia: el modo de razonamiento puede tardar mucho tiempo; no es adecuado para aplicaciones con requisitos estrictos de tiempo real sin ajuste del modo.
- Contexto práctico: aunque el base declara 512K tokens, la longitud efectiva depende de la memoria disponible y de la configuración del runtime; no se garantiza en hardware de consumo.
- Idiomas limitados: solo inglés y francés según la model card; no se documenta soporte de español.
- Licencia: Apache 2.0 permite uso comercial, pero el derivado hereda las condiciones del base y conviene revisar la licencia del checkpoint original antes de producción.
- Runtime: requiere un fork específico de llama.cpp con soporte de `sensenova_loop`; el llama.cpp estándar puede no cargarlo.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leakked/SenseNova-Loop-9B-UNCENSORED-HERETIC-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp con soporte `sensenova_loop`: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Organización OpenSenseNova: https://huggingface.co/sensenova
