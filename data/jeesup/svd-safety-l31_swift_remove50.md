# Jeesup/svd-safety-l31_swift_remove50

## Resumen

`Jeesup/svd-safety-l31_swift_remove50` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM eliminando el 50,00 % de los parámetros densos, sin restaurar después ningún componente (presupuesto de restauración del 0,000 %). Lo publica el usuario Jeesup como una celda concreta de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración, con el objetivo de medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección lo repara mejor.

No es un modelo de propósito general ni un asistente desplegable: es un artefacto de laboratorio pensado para cuantificar el compromiso entre seguridad y utilidad bajo compresión. La model card advierte explícitamente de que varias celdas de la rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base, y las métricas publicadas lo confirman: una tasa de éxito de ataque (ASR) de 0,6250 en AdvBench y una perplejidad de 351,7960 en WikiText-2.

El interés actual del checkpoint es metodológico: sirve como sujeto experimental reproducible (semilla 42) para estudiar compresión de LLM, alineación y su interacción. El repositorio ocupa 16,1 GB y está publicado en formato safetensors bajo la Licencia Comunitaria de Llama 3.1, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con compresion SVD-LLM aplicada a las matrices de pesos |
| Parametros totales | 8.030.261.248 (segun safetensors; ver advertencia en Limitaciones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama-3.1-8B-Instruct (no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Llama 3.1 Community License (identificador `llama3.1`) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Metodo de compresion | SVD-LLM, 50,00 % de parametros eliminados |
| Regla de seleccion de componentes | `unknown` (cadena literal en la model card; probable fallo de plantilla) |
| Presupuesto de restauracion | 0,000 % de los parametros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Fraccion de parametros resultante | 0,5003 |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalización RMSNorm y embeddings rotatorios. Sobre esa base no se ha realizado un reentrenamiento nuevo en este checkpoint, sino una compresión post-hoc mediante SVD-LLM: las matrices de pesos se descomponen en factores de bajo rango y se recortan los componentes de menor contribución hasta eliminar el 50,00 % de los parámetros densos, quedando una fracción de parámetros de 0,5003. La celda concreta que nos ocupa no aplica ninguna restauración posterior (presupuesto 0,000 %, 0 componentes restaurados y 0 sustituidos), de modo que el resultado es el de la compresión pura.

No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO específicas; todas ellas corresponden al proceso original de Meta para Llama 3.1 8B Instruct y no se ven alteradas por este artefacto salvo por el efecto de la propia compresión. La innovación técnica relevante aquí no es arquitectónica sino metodológica: el uso de SVD-LLM como técnica de poda estructurada de bajo rango controlada por semilla fija (42), lo que permite reproducibilidad exacta y comparaciones limpias entre celdas de la rejilla experimental. El autor enmarca el artefacto dentro de un estudio sobre degradación de seguridad inducida por compresión y sobre qué regla de selección de componentes la repara mejor.

## Capacidades

- Generación de texto conversacional heredada de Llama-3.1-8B-Instruct, aunque severamente degradada por la compresión: la perplejidad de 351,7960 en WikiText-2 apunta a una calidad de lenguaje muy deteriorada.
- Razonamiento y matemáticas: capacidades residuales del modelo base, no medidas ni documentadas en la model card para este checkpoint.
- Generación de código: capacidad residual del modelo base, no evaluada en este artefacto.
- Soporte de tool calling / function calling: heredado teóricamente del formato de Llama 3.1 Instruct, pero no verificado ni declarado para esta celda.
- Soporte de agentes y razonamiento multi-paso: no documentado ni validado; la degradación de perplejidad hace poco probable un comportamiento fiable en cadenas largas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: ninguna declarada. No hay modo de pensamiento (thinking), visión ni audio.
- Función real del artefacto: servir como sujeto experimental para medir tasas de ataque exitoso y de sobrerrechazo bajo compresión SVD.

## Casos de uso

- Evaluación de seguridad bajo compresión: el checkpoint se usa como celda experimental para medir cómo varía la tasa de éxito de ataque (ASR) cuando se elimina el 50 % de los parámetros sin restaurar nada; sus valores de AdvBench (0,6250) y StrongREJECT (0,4505) son la línea base para comparar contra celdas con restauración.
- Investigación en interpretabilidad de subespacios SVD: permite estudiar qué direcciones del espacio de pesos concentran el comportamiento de rechazo de peticiones dañinas, analizando la diferencia entre este checkpoint y el modelo base sin comprimir.
- Red-teaming y desarrollo de arneses de evaluación: sirve como modelo "objetivo degradado" para validar que un pipeline de red-teaming detecta correctamente un aumento de vulnerabilidad respecto a la referencia.
- Benchmarking de técnicas de recuperación: cualquier método nuevo de reparación post-compresión (destilación de bajo rango, ajuste fino ligero, restauración selectiva) puede medirse contra esta celda de presupuesto 0,000 % como control negativo.
- Estudio del compromiso seguridad-utilidad: al publicar simultáneamente ASR y sobrerrechazo macro (0,0743 en WildGuard), permite analizar si la compresión reduce el rechazo legítimo además de aumentar la obediencia a peticiones dañinas.
- Reproducibilidad metodológica: con semilla fija 42 y procedencia documentada (fracción de parámetros, componentes restaurados y sustituidos), es un punto de anclaje verificable para replicar el experimento completo en otro hardware.
- Docencia sobre compresión de LLM: ilustra de forma tangible el coste de calidad de la poda agresiva, con una perplejidad de 351,7960 frente a valores de un dígito habituales en modelos de 8B sin comprimir.
- Auditoría de licencias en derivados: caso práctico de cómo un derivado de Llama 3.1 debe conservar `LICENSE` y `USE_POLICY.md` en el repositorio y quedar sujeto a la política de uso aceptable de Meta.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodologia |
|---|---|---|
| AdvBench ASR | 0,6250 | HarmBench judge |
| StrongREJECT ASR | 0,4505 | HarmBench judge |
| Sobrerrechazo macro | 0,0743 | WildGuard |
| Perplejidad WikiText-2 | 351,7960 | no especificada en la model card |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K ni similares), ni cifras del modelo base sin comprimir que permitan calcular el delta exacto. La model card no incluye la perplejidad de `meta-llama/Llama-3.1-8B-Instruct`, pero un valor de 351,7960 en WikiText-2 es indicativo de una degradación severa del modelado de lenguaje.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16 GB solo para los pesos (8,03 mil millones de parámetros a 2 bytes), más la caché KV y activaciones. Estimación propia, no documentada por el autor.
- VRAM en cuantización de 8 bits: del orden de 8-9 GB para los pesos; en 4 bits, alrededor de 5-6 GB. No hay artefactos GGUF, AWQ ni GPTQ publicados, por lo que habría que generarlos.
- Caché KV con contexto largo: con la configuración de Llama 3.1 8B (32 capas, 8 cabezas KV, dimensión de cabeza 128) la caché en fp16 ronda 128 KB por token, es decir, cerca de 1 GB por cada 8.000 tokens y en torno a 16 GB si se agota la ventana de 128.000 tokens. Estimación derivada, no publicada.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio con contexto largo; en el extremo inferior, RTX 4090 (24 GB) o RTX 3090 permiten bf16 con contextos moderados.
- Compatibilidad con GPU de consumo: sí en bf16 con contexto corto en tarjetas de 24 GB, y con holgura en 4 bits en tarjetas de 8-12 GB, siempre que se genere previamente la cuantización.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio incluye etiquetas `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con los endpoints de Hugging Face. vLLM u otros servidores compatibles con safetensors de Llama serían viables. `llama.cpp` y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. La información proporcionada no incluye mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_swift_remove50` | 8,03 mil millones en safetensors; fraccion declarada 0,5003 | 128.000 tokens heredados (no confirmado) | AdvBench ASR 0,6250; StrongREJECT ASR 0,4505; PPL WikiText-2 351,7960 | Llama 3.1 Community | Publico en Hugging Face, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | 8,03 mil millones | 128.000 tokens | no disponible en la informacion proporcionada | Llama 3.1 Community | Publico, ampliamente desplegado |
| Otras celdas de la misma rejilla experimental | no disponible | no disponible | no disponible | Llama 3.1 Community | no disponible en la informacion proporcionada |
| Otras tecnicas de compresion de LLM (por ejemplo, poda estructurada o cuantizacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras comparativas del modelo base ni de alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no puede completarse sin consultar otras fuentes.

## Limitaciones y advertencias

- No es un asistente desplegable: la propia model card lo describe como artefacto de investigación y advierte de que cada celda debe tratarse como sujeto experimental, no como modelo de producción.
- Seguridad degradada de forma deliberada: con un ASR de 0,6250 en AdvBench y 0,4505 en StrongREJECT, el modelo es sustancialmente más vulnerable a peticiones dañinas que su base. No debe exponerse a usuarios finales.
- Calidad de lenguaje muy deteriorada: una perplejidad de 351,7960 en WikiText-2 indica una generación de texto poco fiable, con alta probabilidad de incoherencias y repeticiones.
- Sobrerrechazo: el valor de 0,0743 en WildGuard (macro) mezcla ambos efectos y debe interpretarse en conjunto con las métricas de ASR, no de forma aislada.
- Discrepancia en el recuento de parámetros: safetensors reporta 8.030.261.248 parámetros, prácticamente idéntico al Llama-3.1-8B-Instruct sin comprimir, mientras que la model card declara una fracción de parámetros resultante de 0,5003. La información disponible no explica esta discrepancia; puede deberse a la forma en que SVD-LLM almacena los factores o a que las formas tensoriales se conservan. Conviene verificar el checkpoint antes de asumir un ahorro de memoria.
- Regla de selección marcada como `unknown`: la cadena literal sugiere un fallo de plantilla en la model card, lo que dificulta la reproducibilidad exacta de esta celda concreta.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingüe tras la compresión no está evaluado.
- Riesgo de alucinación: no medido en la información disponible, pero previsiblemente elevado dado el nivel de perplejidad.
- Licencia: se rige por la Llama 3.1 Community License, que impone obligaciones de atribución ("Built with Llama"), inclusión de copia de la licencia y restricciones de uso recogidas en `USE_POLICY.md`. El uso comercial está condicionado por dicha política y por el umbral de usuarios activos mensuales establecido por Meta.
- Estado del repositorio: 0 descargas y 0 likes, sin validación por parte de la comunidad, y con fecha de creación posterior a la de última actualización por solo unos minutos, lo que indica que no ha sido revisado ni mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l31_swift_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia comunitaria de Llama 3.1 (referencia de Meta): https://llama.meta.com/llama3_1/license/
- Politica de uso aceptable de Llama 3.1 (referencia de Meta): https://llama.meta.com/llama3_1/use-policy/
- Los resultados de la busqueda web no aportan enlaces relevantes sobre este modelo: no disponible.
