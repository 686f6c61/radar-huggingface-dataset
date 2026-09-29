# DuoNeural/Qwen2.5-Math-7B-Instruct-CodeInfused-IQ3_XXS-GGUF

## Resumen

DuoNeural/Qwen2.5-Math-7B-Instruct-CodeInfused-IQ3_XXS-GGUF es una cuantizacion GGUF experimental del modelo Qwen/Qwen2.5-Math-7B-Instruct, publicada por el laboratorio DuoNeural Research Lab (Jesse Caldwell, Archon y Aura). El modelo base es un transformer decoder-only de 7,6 mil millones de parametros especializado en razonamiento matematico mediante Chain-of-Thought (CoT) y Tool-Integrated Reasoning (TIR), desarrollado originalmente por el equipo Qwen. Esta version concreta reduce el peso a aproximadamente 3,2 bits por parametro (2,90 GiB) con el metodo IQ3_XXS de llama.cpp, calibrado con una imatrix de 131.000 tokens "code-infused" generada por el propio autor.

El interes de la ficha reside en la metodologia de cuantizacion: el autor aplica una tecnica denominada Generalized Thouless-Anderson-Palmer (G-TAP v3), inspirada en mecanica estadistica de sistemas desordenados, con el objetivo declarado de preservar las cadenas de deduccion algebraica que la cuantizacion post-entrenamiento convencional suele degradar. El checkpoint se presenta explicitamente como un artefacto de investigacion "experimental, pendiente de verificacion y validacion empirica", y los numeros que reporta (perplejidad 8,8915, 100% en 25 problemas de GSM8K) proceden de evaluaciones internas con muestras muy reducidas.

Es relevante ahora porque ocupa un nicho concreto: modelos matematicos de 7B que quepan en GPU de consumo manteniendo precision simbolica suficiente. Frente a cuantizaciones genericas de 3 bits, que suelen romper la aritmetica de varios pasos, esta version reclama conservar el rendimiento matematico con un coste de memoria de menos de 3 GiB de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion GQA 28:4 y FFN SwiGLU, 28 capas (heredada del modelo base) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de la model card invoca llama-cli con `-c 4096` |
| Tipos de cuantizacion | GGUF IQ3_XXS, aproximadamente 3,2 bits por peso (2,90 GiB), calibrado con imatrix |
| Idiomas soportados | Ingles y chino segun la documentacion del modelo base Qwen2.5-Math-Instruct; no declarado explicitamente en la ficha del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 3,1 GB) |
| Modelo base | Qwen/Qwen2.5-Math-7B-Instruct |
| Metodo de cuantizacion | G-TAP v3 (Generalized Thouless-Anderson-Palmer), mecanica estadistica |
| Calibracion | Imatrix `qwen7b_math_gtap.imatrix`, 131.000 tokens con infusion de codigo |
| Fecha de publicacion | 29 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, no una arquitectura nueva: un transformer decoder-only de 28 capas con Grouped Query Attention en configuracion 28:4 (28 cabezas de consulta y 4 de clave/valor) y redes feed-forward con activacion SwiGLU. El autor no ha reentrenado ni ajustado los pesos originales; la intervencion se limita al proceso de discretizacion de pesos durante la cuantizacion. El modelo base Qwen2.5-Math-7B-Instruct fue instruido para resolver problemas matematicos en ingles y chino combinando CoT y TIR, es decir, razonamiento paso a paso apoyado en ejecucion de codigo.

La innovacion que reclama el autor es la metodologia G-TAP v3, que describe en tres invariantes: amortiguamiento de cavidad de Onsager (el termino Omega_i actua como filtro de ruido termodinamico sobre la reaccion de activaciones durante la discretizacion), convexidad del replicon (lambda_R > 0, que mantiene la relajacion continua en la region convexa de simetria de replicas y evita transiciones de vidrio 1-RSB que "congelarian" la seleccion de tokens) y conservacion de la ganancia radial directa (igualdad estricta de norma de Frobenius entre pesos cuantizados y originales a lo largo de los 28 bloques SwiGLU). No se aportan en la informacion disponible pruebas formales ni replicaciones independientes de estas afirmaciones; el propio autor las etiqueta como pendientes de validacion empirica.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso (Chain-of-Thought) en problemas aritmeticos, algebraicos y de competicion.
- Tool-Integrated Reasoning: el modelo base esta entrenado para delegar calculo en ejecucion de codigo (Python) y combinar el resultado con el razonamiento textual.
- Resolucion de problemas de olimpiada y competicion matematica, con un 86,7% reportado sobre 15 problemas.
- Razonamiento simbolico en Python, con un 90% de exito reportado en 10 tests unitarios de matematicas.
- Conversacion multi-turno (etiqueta `conversational` en HuggingFace), aunque el foco del modelo base es la resolucion de problemas mas que el dialogo abierto.
- Capacidades multilingues limitadas al ingles y al chino segun el modelo base; no hay evidencia de soporte solido en castellano.
- No se declaran capacidades de vision, audio, agentes autononomos ni function calling generico mas alla del uso de interprete de codigo del modelo base.

## Casos de uso

- Resolucion de problemas matematicos en local sin GPU dedicada: con 2,90 GiB de pesos, el modelo puede ejecutarse en CPU mediante llama.cpp en un portatil, lo que permite verificar ejercicios de algebra y calculo sin enviar datos a un servicio externo.
- Tutor de matematicas en ingles o chino: el modelo genera cadenas de razonamiento detalladas paso a paso, utiles como material didactico para estudiantes que necesitan ver el desarrollo completo de un problema.
- Generacion de codigo matematico y simulaciones numericas: el modelo base soporta TIR, por lo que puede escribir fragmentos de Python para resolver integrales, ecuaciones o problemas de optimizacion y ejecutarlos en un sandbox.
- Verificacion de calculos en pipelines de datos cientificos: integrado como paso de validacion que comprueba resultados numericos de un ETL o de un notebook antes de publicarlos.
- Prototipado de asistentes de investigacion en entornos con recursos limitados: con 3,1 GB de repositorio, se puede desplegar en una instancia pequena o en una RTX 3060 para experimentar con razonamiento matematico sin coste de API.
- Evaluacion de tecnicas de cuantizacion: sirve como artefacto de referencia para comparar IQ3_XXS con G-TAP frente a cuantizaciones estandar del mismo modelo base, midiendo degradacion en tareas de razonamiento.
- Docencia e investigacion sobre mecanica estadistica aplicada a redes neuronales: el checkpoint permite reproducir (o refutar) el pipeline G-TAP descrito por el autor y contrastar perplejidad y precision en muestras controladas.
- Automatizacion de resolucion de problemas en lotes: procesar conjuntos de ejercicios matematicos por linea de comandos con llama-cli y almacenar las soluciones generadas para su revision posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor del checkpoint cuantizado:

| Benchmark | Resultado | Tamano de muestra | Notas |
|---|---|---|---|
| Perplejidad en holdout continuo | 8,8915 | 131.000 tokens | Calibrado con la misma distribucion |
| GSM8K multi-step | 100,0% (25/25) | 25 problemas | Muestra muy pequena, no representativa |
| Competicion y olimpiada matematica | 86,7% (13/15) | 15 problemas | Muestra muy pequena |
| Tests unitarios de matematicas en Python | 90,0% (9/10) | 10 tests | Razonamiento simbolico |
| Throughput de decodificacion | 173,1 t/s | No disponible | NVIDIA GeForce RTX 4080 Super |

Datos publicos del modelo base (Qwen2.5-Math-7B-Instruct, sin cuantizar):

| Benchmark | Resultado | Fuente |
|---|---|---|
| MATH (con CoT) | 85,3% | dev.co, ficha del modelo base |

No se han publicado en la informacion disponible resultados comparativos directos entre esta cuantizacion IQ3_XXS y el modelo base en precision completa, por lo que no es posible cuantificar la degradacion real introducida por la cuantizacion a 3,2 bits. Las cifras de GSM8K, olimpiada y tests unitarios proceden de conjuntos de 10 a 25 elementos y no tienen significacion estadistica suficiente para extrapolarse a un uso en produccion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,90 GiB en el formato IQ3_XXS publicado (repositorio total de 3,1 GB).
- VRAM total en inferencia: con cache KV para 4.096 tokens y overhead de contexto, el consumo se situa de forma tipica en el rango de 3,5 a 5 GB, dependiendo del backend y del tamano de lote.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas, como GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4060 y superiores. En GPUs de 4 GB puede requerir descarga parcial de capas a CPU.
- GPU de gama alta: el autor reporta 173,1 t/s de decodificacion en una RTX 4080 Super de 32 GB, donde el modelo ocupa una fraccion minima de la memoria disponible.
- Ejecucion en CPU: viable mediante llama.cpp con todos los pesos en RAM; se recomienda un minimo de 8 GB de RAM libre.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM existe pero es experimental y no se menciona en la informacion proporcionada.
- Latencia y throughput: unica cifra publicada, 173,1 t/s en RTX 4080 Super. No hay mediciones para CPU ni para GPUs de gama media.
- Ejemplo de invocacion publicado por el autor: `llama-cli -hf DuoNeural/Qwen2.5-Math-7B-Instruct-CodeInfused-IQ3_XXS-GGUF -p "Solve step by step: Compute the remainder when 3^100 is divided by 7." -ngl 99 -c 4096`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| DuoNeural/Qwen2.5-Math-7B-Instruct-CodeInfused-IQ3_XXS-GGUF | 7,6B | No disponible | GGUF IQ3_XXS (~3,2 bpw) | 3,1 GB | Apache 2.0 | PPL 8,8915; GSM8K 25/25; olimpiada 13/15 |
| Qwen/Qwen2.5-Math-7B-Instruct (original) | 7,6B | No disponible en la informacion proporcionada | bfloat16 / safetensors | No disponible | Apache 2.0 | MATH 85,3% con CoT (dev.co) |
| Cuantizaciones GGUF estandar de Qwen2.5-Math-7B-Instruct | 7,6B | No disponible | Q4_K_M, Q5_K_M, Q8_0, etc. | No disponible | Apache 2.0 | No disponible |
| Qwen2.5-Math-7B (base, no instruct) | 7,6B | No disponible | bfloat16 / safetensors | No disponible | Apache 2.0 | No disponible en la informacion proporcionada |

No se dispone de datos publicados que permitan comparar esta cuantizacion con alternativas de 3 bits de otros autores (por ejemplo AWQ, GPTQ o EXL2 en el mismo rango de bits), ni con modelos matematicos de tamano similar como DeepSeek-Math-7B, cuyos numeros no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo etiqueta como "Pending Further Verification / Empirical Validation". No deberia desplegarse en produccion sin validacion propia.
- Muestras de evaluacion insignificantes: los resultados de GSM8K (25 problemas), olimpiada (15 problemas) y tests unitarios (10 tests) no permiten estimar la precision real del modelo. Un 100% en 25 problemas es compatible con un rendimiento muy inferior en un conjunto completo.
- Ausencia de comparacion con el modelo base sin cuantizar: no se cuantifica la degradacion introducida por la cuantizacion a 3,2 bits, que es precisamente el punto que el metodo G-TAP pretende resolver. Las afirmaciones teoricas del autor no vienen acompanadas de pruebas formales ni de replicacion independiente.
- Riesgo de alucinacion: es un modelo instructivo de 7B; puede producir desarrollos matematicos plausibles pero incorrectos, especialmente en problemas de varios pasos. El uso de TIR mitiga parcialmente este riesgo solo si se ejecuta el codigo generado.
- Idiomas: el modelo base esta orientado a ingles y chino. No hay evidencia de rendimiento fiable en castellano, por lo que no se recomienda su uso para matematicas en espanol sin evaluacion previa.
- Los pesos cuantizados a 3 bits son especialmente sensibles a errores en aritmetica de muchos pasos; conviene validar cada caso de uso con un conjunto de prueba propio.
- Longitud de contexto: no declarada en la ficha y el ejemplo oficial usa 4.096 tokens. No asumir ventanas largas sin comprobacion.
- Soporte de tool calling: el modelo base esta entrenado para razonamiento integrado con herramientas, pero la ficha de esta cuantizacion no documenta un formato de function calling especifico ni garantias de compatibilidad con frameworks de agentes.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una cuantizacion derivada conviene conservar la atribucion al modelo base Qwen y revisar los terminos de Qwen.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Metadatos de fecha inusuales (creacion en septiembre de 2026), que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen2.5-Math-7B-Instruct-CodeInfused-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Modelo base sin instruccion: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Repositorio del proyecto Qwen2.5-Math: https://github.com/QwenLM/Qwen2.5-Math
- Ficha de Qwen2.5-Math-7B-Instruct en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-math-7b-instruct-qwen
- Analisis de Qwen2.5-Math-7B-Instruct en dev.co: https://dev.co/ai/llms/qwen2-5-math-7b-instruct
- Perfil del autor en HuggingFace: https://huggingface.co/DuoNeural
