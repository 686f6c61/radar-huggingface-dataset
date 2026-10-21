# bambocher/Qwen3.8-27B-oQ3e-mtp

## Resumen

Qwen3.8-27B-oQ3e-mtp es un checkpoint cuantizado publicado por el usuario `bambocher`, derivado de un modelo de la familia Qwen3.5 (tag `qwen3_5`) con 27.781.427.952 parámetros (27,78 B). No es un modelo entrenado desde cero, sino una conversión de precisión mixta realizada con la herramienta oQ (oMLX v0.7.1), que deja el peso medio efectivo en 3,970 bits por parámetro y reduce el almacenamiento total a 12,838 GiB (13,8 GB de repositorio). El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (26,896 B), una torre de visión (0,461 B) y una cabeza MTP de predicción multi-token (0,425 B), lo que lo convierte en un modelo multimodal con soporte para decodificación especulativa.

Su relevancia práctica es que permite ejecutar un modelo de escala ~27B con capacidades de visión en un equipo Apple Silicon con memoria unificada moderada, gracias al formato MLX y a la cuantización agresiva. Es, por tanto, material interesante para desarrolladores que quieran prototipar localmente sin GPU dedicada y para investigadores que estudien el impacto de la cuantización mixta por capas.

Ahora bien, se trata de un artefacto comunitario con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas documentados, sin longitud de contexto especificada y sin resultados de evaluación publicados. Cualquier uso en producción exige una validación propia previa.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con torre de visión y cabeza MTP integradas; número de capas, tipo de atención y detalles del bloque de visión: no disponible |
| Parámetros totales | 27.781.427.952 (27,78 B) según safetensors |
| Parámetros activos | no disponible (no se confirma que sea MoE; el nombre no lo indica y la model card no lo especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ (oMLX v0.7.1): affine 3/4/5/6 bits con grupo de 64 y una fracción en BF16; media efectiva 3,970 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia para el checkpoint derivado; se heredaría la del modelo base, no indicada) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); repositorio de 13,8 GB |
| Desglose de componentes | Lenguaje: 26,896 B / 11,688 GiB · Visión: 0,461 B / 0,858 GiB · Cabeza MTP: 0,425 B / 0,293 GiB |
| Distribución de precisión | 3 bits: 23,783 B (85,606 %) · 4 bits: 0,372 B (1,341 %) · 5 bits: 3,105 B (11,177 %) · 6 bits: 0,005 B (0,019 %) · BF16: 0,516 B (1,857 %) |

## Arquitectura y entrenamiento

El checkpoint es una conversión de pesos, no un entrenamiento nuevo. La arquitectura subyacente corresponde a la familia Qwen3.5 según el tag del repositorio, con tres bloques bien delimitados por el desglose de almacenamiento: un modelo de lenguaje de 26,896 B parámetros, un codificador visual de 0,461 B y una cabeza MTP de 0,425 B. La presencia de la cabeza MTP es coherente con arquitecturas que incorporan predicción multi-token para acelerar la decodificación mediante técnicas especulativas, aunque la model card no documenta cómo se activa ni qué runtime la explota. Calculando a partir de las cifras de almacenamiento, el codificador visual se guarda prácticamente en BF16 (unas 15,98 bits por parámetro), mientras que el modelo de lenguaje promedia unos 3,73 bits por parámetro.

El interés técnico está en la política de cuantización mixta: el 85,6 % de los pesos lógicos (23,783 B) se almacena a 3 bits affine con grupo de 64, un 11,2 % (3,105 B) se protege a 5 bits y un 1,86 % (0,516 B) se mantiene en BF16, presumiblemente embeddings, normalizaciones y cabezas de salida, aunque la model card no identifica qué tensores concretos reciben cada precisión. El resultado son 9,690 GiB a 3 bits frente a 1,988 GiB a 5 bits, lo que refleja que la mayor parte del ahorro se concentra en las capas de proyección.

No hay información sobre datos de entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o alguna fase de razonamiento supervisado. Tampoco se documenta el proceso de calibración empleado por oQ para decidir la asignación de bits por capa, más allá de la referencia a la herramienta.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural: capacidad esperable por herencia del modelo base Qwen3.5, no verificada en este checkpoint.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,461 B parámetros, por lo que admite entrada multimodal (descripción de imágenes, lectura de documentos escaneados, interpretación de gráficos). No hay ejemplos ni evaluaciones publicadas que lo confirmen.
- Decodificación especulativa mediante cabeza MTP: la inclusión de 0,425 B parámetros dedicados a predicción multi-token sugiere aceleración en la generación, condicionada a que el runtime (mlx-lm, mlx-vlm u oMLX) soporte el mecanismo.
- Ejecución local en Apple Silicon: formato MLX nativo, pensado para memoria unificada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de audio: no disponibles; el desglose de componentes solo menciona lenguaje, visión y MTP.

## Casos de uso

- Asistente documental con privacidad estricta en Mac: el modelo puede procesar texto e imágenes sin salir del equipo, útil en despachos jurídicos o departamentos de RR. UU. que manejan documentación sensible y no pueden enviarla a APIs externas. Los 12,8 GiB de pesos caben en un equipo con 24-32 GB de memoria unificada.
- Etiquetado y descripción de imágenes por lotes: con la torre de visión integrada, se puede usar para generar alt-text, clasificar capturas o extraer campos de facturas escaneadas en un pipeline local previo a un sistema de gestión documental.
- Prototipado offline para desarrolladores sin GPU: sirve para validar prompts, formatos de salida y flujos conversacionales en un portátil antes de trasladar la lógica a un modelo mayor en infraestructura con CUDA.
- Revisión de código en local: generación y explicación de fragmentos, con la advertencia de que la cuantización a 3 bits en el 85 % de los pesos degrada tareas de código que requieren precisión sintáctica alta; conviene medir la tasa de error antes de integrarlo.
- Investigación sobre cuantización mixta: el checkpoint es un caso de estudio útil para comparar la degradación entre la versión BF16 y esta distribución 3/4/5/6 bits, midiendo por tarea y por capa.
- Evaluación de decodificación especulativa: permite medir la ganancia real de throughput de la cabeza MTP frente a la generación autoregresiva estándar en mlx-lm, si el runtime la soporta.
- Generación de resúmenes de material visual para accesibilidad: descripción de gráficos e infografías en herramientas internas, con revisión humana obligatoria por el riesgo de alucinación en detalles numéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta métricas de compresión (bits por peso, GiB por componente) y no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluación de calidad. Tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- Pesos en disco y en memoria: 12,838 GiB (13,785 GB) para el checkpoint completo; el repositorio ocupa 13,8 GB.
- Memoria unificada mínima: alrededor de 16 GB permite cargar los pesos, pero deja un margen muy estrecho para la caché KV; con contexto corto puede funcionar, aunque es arriesgado.
- Memoria recomendada: 24 GB como mínimo práctico y 32 GB o más para contextos largos o uso concurrente. La caché KV no está documentada y no puede estimarse con precisión sin conocer el número de capas y cabezas.
- Equipos objetivo: Apple Silicon (familias M1, M2, M3 y M4) con 24-64 GB de memoria unificada. El formato MLX aprovecha la memoria compartida de CPU y GPU.
- GPU NVIDIA: no es un formato listo para CUDA. Para usar el modelo en A100, H100 o RTX 4090 habría que reconvertir los pesos a GGUF, AWQ o GPTQ, conversión no incluida en el repositorio.
- Opciones de despliegue: mlx-lm para texto, mlx-vlm si se quiere explotar la torre de visión, y la propia herramienta oMLX/oQ. No hay pesos para vLLM, TGI, llama.cpp ni Ollama en este repositorio.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 27,78 B a ~4 bits en Apple Silicon queda limitado por el ancho de banda de memoria del chip, no por la capacidad de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formatos disponibles |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3e-mtp | 27,78 B (26,90 B lenguaje + 0,46 B visión + 0,43 B MTP) | no disponible | Texto + visión | no disponible | Solo MLX safetensors, ~3,97 bits |
| Qwen3-32B | 32,8 B | 32.768 tokens nativo, ampliable con YaRN (dato de referencia pública, conviene verificar) | Texto | Apache 2.0 | safetensors, GGUF, MLX, AWQ, GPTQ |
| Gemma 3 27B | 27 B | 128.000 tokens (dato de referencia pública, conviene verificar) | Texto + visión | Gemma Terms of Use | safetensors, GGUF, MLX |
| Qwen2.5-VL-32B | 32 B | 128.000 tokens (dato de referencia pública, conviene verificar) | Texto + visión | Apache 2.0 | safetensors, GGUF, AWQ |

Los datos de las tres alternativas provienen de sus model cards públicas y no de la información proporcionada en esta consulta, por lo que deben verificarse antes de citarlos. La comparación de rendimiento no puede establecerse: este checkpoint no publica ninguna evaluación y las alternativas sí cuentan con resultados oficiales, de modo que la comparación cualitativa se limita a tamaño, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Procedencia no verificada: el nombre "Qwen3.8" y el tag `qwen3_5` no se corresponden con ningún lanzamiento documentado en la información disponible, y la fecha de creación del repositorio (2026-10-20) obliga a confirmar el origen real de los pesos base antes de cualquier uso.
- Sin licencia declarada: no se puede asumir uso comercial. Aunque la familia Qwen suele publicarse bajo Apache 2.0, esta ficha no puede confirmarlo para este checkpoint; hay que consultar al autor y revisar la licencia del modelo original.
- Sin evaluaciones: 0 descargas, 0 likes y ninguna métrica de calidad publicada. No hay evidencia de que la cuantización preserve el rendimiento del modelo original.
- Degradación por cuantización: el 85,6 % de los pesos está a 3 bits con grupo de 64, lo que afecta especialmente a matemáticas, código, razonamiento de varios pasos y extracción de cifras exactas. El riesgo de alucinación aumenta respecto al BF16.
- Error acumulativo en cadenas largas: en generaciones extensas, la pérdida de precisión puede amplificarse; conviene limitar la longitud de salida y validar con verificadores externos.
- Idiomas y contexto no documentados: no hay garantía sobre calidad en castellano ni sobre la ventana máxima soportada.
- Dependencia de Apple Silicon: el formato MLX no es portable a CUDA sin conversión adicional, lo que limita su uso en servidores convencionales.
- La cabeza MTP solo aporta valor si el runtime la soporta; en caso contrario, añade 0,425 B parámetros cargados sin beneficio.
- Sin información sobre sesgos: no se han publicado análisis de sesgo, toxicidad o seguridad para este checkpoint, y la cuantización puede alterar el comportamiento del filtrado aprendido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ3e-mtp
- oQ / oMLX (herramienta de cuantización citada en la model card): https://github.com/jundot/omlx
- MLX (framework de Apple para el que está formateado el checkpoint): https://github.com/ml-explore/mlx
- mlx-lm (runtime de inferencia de texto en MLX): https://github.com/ml-explore/mlx-lm
- mlx-vlm (runtime de inferencia multimodal en MLX): https://github.com/Blaizzy/mlx-vlm
- Modelo base Qwen3.5-27B: no disponible (la model card no enlaza el modelo original)
- Resultados de benchmarks: no disponibles
