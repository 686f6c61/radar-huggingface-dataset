# abenzerps/NeoHorse-1-9B-Uncensored-GSQ-RCO-GGUF

## Resumen

NeoHorse-1-9B-Uncensored-GSQ-RCO-GGUF es un repositorio de cuantizaciones GGUF del modelo TokenRhythm/NeoHorse-1-9B, publicado por el usuario abenzerps. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del modelo base, con 8.953.803.264 parámetros (~8,95 mil millones) y una ventana de contexto declarada de 262.144 tokens.

Su interés técnico está en el método de cuantización empleado, denominado GSQ-RCO: la model card indica que el modelo base es híbrido SSM-Transformer y que las cuantizaciones de baja precisión convencionales provocan deriva del estado recurrente y pérdida de coherencia en el razonamiento. Para evitarlo, RCO mantiene 48 parámetros críticos del SSM en BF16 sin cuantizar, mientras que GSQ ajusta la precisión por capa guiada por calibración de sensibilidad basada en la matriz hessiana.

El resultado son cinco ficheros GGUF de precisión mixta entre 2,80 y 4,25 bits por peso (3,13 GB a 4,76 GB), pensados para inferencia local en llama.cpp y Ollama. El modelo se distribuye con licencia Apache-2.0, solo soporta inglés y lleva la etiqueta "uncensored", lo que implica ausencia de alineamiento de seguridad. En el momento de la consulta acumula 3.740 descargas y 13 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida SSM-Transformer (según la model card del autor de la cuantización); la etiqueta `qwen3.5` sugiere linaje de la familia Qwen 3.5, aunque no se detalla en la información disponible |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | no aplica (no se describe como modelo MoE en la información disponible) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | GGUF de precisión mixta GSQ-RCO: IQ2_XS (2,80 bpw, 3,13 GB), IQ3_XXS (3,00 bpw, 3,36 GB), IQ3_S (3,50 bpw, 3,92 GB), IQ3_M (3,75 bpw, 4,20 GB, recomendada), IQ4_XS (4,25 bpw, 4,76 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); no se incluyen safetensors en este repositorio |

Otros datos del repositorio: tamaño total de 19,4 GB (suma de las cinco cuantizaciones), etiquetas `reasoning`, `uncensored`, `mixed-precision` y `endpoints_compatible`, y relación `base_model_relation: quantized` respecto a TokenRhythm/NeoHorse-1-9B.

## Arquitectura y entrenamiento

La arquitectura descrita es híbrida SSM-Transformer, es decir, combina capas de espacio de estados con capas de atención. La model card justifica el método de cuantización precisamente en este punto: en modelos híbridos, una cuantización de baja precisión estándar degrada el estado recurrente y provoca incoherencias en el razonamiento. La solución GSQ-RCO actúa en dos frentes: RCO preserva 48 parámetros críticos del SSM en BF16 sin cuantizar, y GSQ asigna precisión por capa según una calibración de sensibilidad basada en el hessiano. Es una innovación de compresión, no de arquitectura ni de entrenamiento.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones de decodificación del modelo base. La etiqueta "uncensored" indica que el modelo no incorpora (o incorpora de forma reducida) capas de rechazo o alineamiento de seguridad; no se documenta el procedimiento concreto con el que se eliminó dicho alineamiento. Tampoco se detalla si el contexto de 262.144 tokens es nativo o extendido mediante técnicas de escalado.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat gestionado por `llama-cli -cnv` o mediante plantilla de conversación en llama.cpp.
- Razonamiento explícito: la etiqueta `reasoning` y la motivación del método GSQ-RCO (preservar la coherencia del razonamiento bajo cuantización) apuntan a este uso, aunque no se documenta un modo "thinking" separado.
- Procesamiento de contexto largo de hasta 262.144 tokens, con soporte de KV cache cuantizado (`-ctk q4_0 -ctv q4_0`) para reducir huella de VRAM.
- Estilo de respuesta sin filtros de seguridad ("uncensored"), orientado a contenido que otros modelos rechazarían.
- Servidor local compatible con la API de OpenAI mediante `llama-server` en el puerto 8080, lo que permite conectar clientes existentes sin cambios de código.
- Ejecución en CPU y GPU a través de llama.cpp, y despliegue simplificado con Ollama (`ollama run hf.co/...:IQ3_M`).
- No documentado: soporte de tool calling / function calling, capacidades de agente multi-paso, visión, audio, generación de código especializada y soporte multilingüe más allá del inglés.

## Casos de uso

- Asistente conversacional local con memoria larga: con 262.144 tokens de contexto se puede mantener una conversación de decenas de miles de turnos o cargar manuales completos sin truncar, ejecutando el modelo en un equipo de sobremesa.
- Análisis de documentos extensos en una sola pasada: contratos, expedientes, tesis o bases de código de hasta ~200.000 tokens caben en la ventana, evitando pipelines de troceado y recuperación (RAG) para consultas globales.
- Procesamiento por lotes offline: al pesar entre 3,13 GB y 4,76 GB por fichero, se pueden ejecutar varias instancias en paralelo en un solo servidor o en máquinas sin conexión, algo útil en entornos air-gapped.
- Backend de aplicaciones existentes: `llama-server` expone una API compatible con OpenAI, por lo que se puede sustituir una llamada a la nube por el endpoint local en el puerto 8080 sin reescribir el cliente.
- Prototipado en hardware de consumo: la combinación IQ3_M (4,20 GB) con KV cache q4_0 permite contextos de 131.072 tokens en ~6 GB de VRAM, según el autor, lo que habilita pruebas en GPUs de 8 GB.
- Investigación sobre cuantización de modelos híbridos SSM-Transformer: comparar la perplejidad y la coherencia de razonamiento de las variantes GSQ-RCO frente a cuantizaciones estándar del mismo modelo base es un caso de estudio directo.
- Red teaming y evaluación de robustez: un modelo sin alineamiento de seguridad sirve para auditar clasificadores, filtros y sistemas de moderación en entornos controlados.
- Escritura creativa y roleplay sin restricciones temáticas, siempre con revisión humana y advertencias claras si el resultado se publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K, perplejidad ni comparaciones cuantitativas frente a cuantizaciones estándar. La afirmación sobre la degradación de las cuantizaciones de baja precisión en modelos híbridos SSM-Transformer se presenta sin datos que la respalden en el material proporcionado.

## Requisitos de hardware

- VRAM para pesos: de 3,13 GB (IQ2_XS) a 4,76 GB (IQ4_XS). La variante recomendada, IQ3_M, ocupa 4,20 GB en disco.
- GPU de consumo: el autor indica que IQ3_M con KV cache de 4 bits (`-ctk q4_0 -ctv q4_0`) permite 131.072 tokens de contexto con ~6 GB de VRAM en GPUs de 8 GB. Por tamaño de pesos, cualquier GPU consumer con 8 GB o más debería alojar IQ3_M e IQ4_XS con contexto moderado; no hay validación publicada con otras GPU.
- Contexto largo sin KV cuantizado: con 262.144 tokens y caché en precisión completa la huella de VRAM crece de forma notable; no se dispone de cifras del autor para ese escenario.
- CPU: al ser ficheros de 3-5 GB, la inferencia solo en CPU es viable con llama.cpp, con velocidad dependiente del número de núcleos y del ancho de banda de memoria (no se publican cifras de tokens por segundo).
- Opciones de despliegue documentadas: llama.cpp (`llama-cli` con `-ngl 99 -fa -b 2048 -c 16384 -cnv`; `llama-server` con `-c 32768` y puerto 8080) y Ollama (`ollama run hf.co/abenzerps/NeoHorse-1-9B-Uncensored-GSQ-RCO-GGUF:IQ3_M`).
- No documentado: compatibilidad con vLLM, TGI, TensorRT-LLM u otros motores; soporte de decodificación especulativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| abenzerps/NeoHorse-1-9B-Uncensored-GSQ-RCO-GGUF | 8.953.803.264 | 262.144 tokens | GGUF (IQ2_XS a IQ4_XS) | Apache-2.0 | Cuantización de precisión mixta con 48 parámetros SSM en BF16 y calibración hessiana por capa |
| TokenRhythm/NeoHorse-1-9B (base) | 8.953.803.264 | no disponible | no disponible | Apache-2.0 (heredada) | Modelo original sin cuantizar; sin datos de entrenamiento ni benchmarks en la información disponible |
| TokenRhythm/NeoHorse-1-9B-GGUF | no disponible | no disponible | GGUF | Apache-2.0 (heredada) | Publicación GGUF de referencia del autor original; no se detalla el esquema de cuantización ni si preserva los parámetros SSM en BF16 |

No se dispone de datos de benchmarks ni de terceros comparables verificados en la información proporcionada, por lo que no se incluye una comparación de rendimiento numérica.

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora (o incorpora de forma reducida) alineamiento de seguridad. Puede generar contenido dañino, ilegal o sexualmente explícito; requiere filtros externos y supervisión humana en cualquier despliegue orientado al público.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en productos en español exige evaluación previa y probablemente dé resultados degradados.
- Riesgo de alucinación: es un modelo de ~9.000 millones de parámetros sin benchmarks publicados; la fiabilidad factual en dominios especializados no está verificada.
- Degradación por cuantización: las variantes IQ2_XS e IQ3_XXS, aunque preserven los parámetros SSM en BF16, no cuantifican el resto de capas en alta precisión; no hay datos que cuantifiquen la pérdida de calidad respecto al modelo base.
- El contexto de 262.144 tokens no está validado de forma independiente; el propio autor recurre a KV cache de 4 bits para alcanzar 131K en GPUs de 8 GB, lo que puede afectar a la fidelidad en contextos muy largos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base y citar la atribución a TokenRhythm y a abenzerps.
- Sin información sobre sesgos: no se documenta la composición del dataset de entrenamiento ni evaluaciones de sesgo, toxicidad o seguridad.
- Los pesos están empaquetados únicamente en GGUF; no hay safetensors en este repositorio, lo que limita el ajuste fino y el uso en frameworks como PyTorch o vLLM.
- Fecha de creación del repositorio: 23 de octubre de 2026; última actualización, 25 de octubre de 2026. El proyecto es muy reciente y con poco historial de validación por la comunidad (13 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/NeoHorse-1-9B-Uncensored-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Publicación GGUF de referencia del autor original: https://huggingface.co/TokenRhythm/NeoHorse-1-9B-GGUF
- Formulario de solicitud de modelos del cuantizador: https://abenzerps.com/request-a-model/
- Ficheros GGUF (relativos al repositorio): NeoHorse-1-9B-GSQ-RCO-IQ2_XS.gguf, NeoHorse-1-9B-GSQ-RCO-IQ3_XXS.gguf, NeoHorse-1-9B-GSQ-RCO-IQ3_S.gguf, NeoHorse-1-9B-GSQ-RCO-IQ3_M.gguf, NeoHorse-1-9B-GSQ-RCO-IQ4_XS.gguf
- Paper, blog o demo del método GSQ-RCO: no disponible en la información proporcionada
