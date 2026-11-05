# flaitenberger/Llama-3.1-8B-Instruct-economize-eagle3

## Resumen

`flaitenberger/Llama-3.1-8B-Instruct-economize-eagle3` no es un modelo de lenguaje completo, sino un cabezal *draft* (borrador) EAGLE-3 para decodificación especulativa sobre `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el autor flaitenberger como parte de la biblioteca `economize`, que añade técnicas de eficiencia a modelos de Hugging Face. El repositorio contiene únicamente los pesos del borrador (428M parámetros), no los del modelo base, y se distribuye bajo licencia `llama3.1` heredada del modelo original.

El problema que resuelve es el coste de la generación autoregresiva: un modelo de 8B de parámetros requiere una pasada completa por token. EAGLE-3 propone un decodificador ligero que predice varios tokens futuros a partir de los estados ocultos del modelo base; el modelo grande verifica esas propuestas en una sola pasada, aceptando las correctas y rechazando las incorrectas. Según el autor, esto se traduce en una aceleración de 1,74x agregada (hasta 2,10x en matemáticas) manteniendo la salida del modelo base.

Es relevante porque permite desplegar Llama-3.1-8B-Instruct con menor latencia y mayor throughput sin cambiar el modelo de referencia ni la calidad de las respuestas, y porque `economize` lo integra directamente en el ecosistema `transformers` mediante una API mínima (`economize.from_pretrained` / `economize.load`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head: una capa decodificadora que lee los estados ocultos del modelo base a tres profundidades, los fusiona en un vector y los combina con el embedding del último token; MLP de anchura 14336 y LM head propio |
| Parametros totales | 428M (solo el borrador; el modelo base Llama-3.1-8B-Instruct no está incluido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; hereda la del modelo base (Llama-3.1-8B-Instruct soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se usa en bf16 según la model card; no se documentan cuantizaciones del borrador) |
| Idiomas soportados | no disponible (heredados del modelo base, que soporta 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador es un cabezal EAGLE-3 de una sola capa decodificadora. Toma como entrada los estados ocultos del modelo base en tres profundidades, los fusiona en un único vector y lo combina con el embedding del último token. A partir de ahí predice los siguientes tokens con su propia LM head, que opera sobre el vocabulario de 32.768 tokens más frecuentes de los datos de entrenamiento. La MLP del borrador tiene anchura 14.336. No es un transformer completo ni un modelo independiente: es un adaptador que se acopla al modelo base y depende de sus estados internos.

El entrenamiento se realizó con la biblioteca `economize` sobre respuestas generadas por el propio `meta-llama/Llama-3.1-8B-Instruct` (revisión `0e9e39f249a16976918f6564b8830bc894c89659`), de modo que el borrador aprende la distribución de salida del modelo base. El proceso consta de: (1) un pool de 292.212 prompts procedentes de varias fuentes, con filtrado de prompts vacíos, de menos de 3 palabras o de más de 12.000 caracteres, eliminación de duplicados exactos y eliminación de cualquier prompt que comparta un 13-grama con los conjuntos de evaluación (Spec-Bench, MT-Bench, AlpacaEval, Arena-Hard, HumanEval, MBPP, LiveCodeBench, GSM8K, MATH-500, AIME 2024/2025, AMC 2023, CNN/DailyMail y LongBench) o con cualquier split de MBPP; (2) generación de respuestas con vLLM 0.30.0 en bf16 usando la plantilla de chat del modelo base con un turno de usuario. La innovación técnica principal es la decodificación especulativa con verificación por el modelo base: cada borrador es verificado, de modo que la decodificación greedy devuelve exactamente la salida greedy del modelo base y el muestreo especulativo (`verifier="rejection"`) sigue su distribución de muestreo.

## Capacidades

- No genera texto por sí mismo: es un acelerador de inferencia que debe combinarse con `meta-llama/Llama-3.1-8B-Instruct`.
- Decodificación especulativa con hasta 4 borradores por pasada del modelo base (configuración `cycle_length=5` almacenada en el checkpoint).
- Verificación exacta: en decodificación greedy devuelve la salida greedy del modelo base; con `verifier="rejection"` respeta la distribución de muestreo.
- Soporte de umbral de confianza para detener el borrado cuando la probabilidad top del borrador cae por debajo de un valor configurable.
- Integración con `transformers` mediante `economize.from_pretrained` y `economize.load`.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo, tool calling, agentes), pero no propias del borrador.
- No soporta visión, audio ni modos de pensamiento por sí mismo.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Llama-3.1-8B-Instruct con el borrador EAGLE-3 para reducir el tiempo por token en conversaciones multi-turno; el autor reporta 1,52x en chat sobre MT-Bench, AlpacaEval y Arena-Hard.
- Generación de código en producción: el borrador alcanza 1,96x en HumanEval, MBPP y LiveCodeBench, por lo que encaja en asistentes de código o pipelines de CI/CD que necesiten completar funciones con baja latencia.
- Razonamiento matemático interactivo: con 2,10x en GSM8K, MATH-500, AIME y AMC, es adecuado para tutores o herramientas de resolución paso a paso donde el usuario espera respuestas rápidas.
- Resumen de documentos: 1,40x en CNN/DailyMail permite procesar lotes de resúmenes con mayor throughput en la misma GPU.
- Procesamiento de contexto largo: 1,34x en LongBench, útil para analizar contratos, informes o hilos de conversación extensos heredando la ventana de 128K del modelo base.
- Despliegue en una sola GPU H100 con `economize` y CUDA graphs: el checkpoint almacena la configuración medida como más rápida (`cycle_length=5`), lo que simplifica el ajuste en producción.
- Evaluación comparativa de técnicas de eficiencia: sirve como referencia reproducible para medir el impacto de EAGLE-3 frente a decodificación greedy plana en el mismo runtime.

## Benchmarks y rendimiento

Los datos provienen de una única ejecución de temporización del checkpoint con `economize` 0.3.2 sobre una NVIDIA H100 en bf16 con CUDA graphs y batch size 1. Los prompts son 8 por conjunto (Spec-Bench, MT-Bench, AlpacaEval, Arena-Hard, HumanEval, MBPP, LiveCodeBench, GSM8K, MATH-500, AIME 2024/2025, AMC 2023, CNN/DailyMail y LongBench), con hasta 256 tokens nuevos. No son resultados de benchmarks de calidad (MMLU, HumanEval accuracy, etc.), sino de aceleración relativa.

| Configuracion | Todos | Chat | Codigo | Matematicas | Resumen | Contexto largo | Tokens por pasada del base |
|---|---|---|---|---|---|---|---|
| 2 borradores, sin umbral | 1,68x | 1,60x | 1,75x | 1,87x | 1,52x | 1,35x | 2,07 |
| 3 borradores, sin umbral | 1,72x | 1,61x | 1,89x | 2,07x | 1,51x | 1,10x | 2,30 |
| **4 borradores, sin umbral (config. del checkpoint)** | **1,74x** | **1,52x** | **1,96x** | **2,10x** | **1,40x** | **1,34x** | **2,42** |
| 6 borradores, sin umbral | 1,67x | 1,42x | 1,91x | 2,11x | 1,29x | 1,24x | 2,55 |
| 8 borradores, sin umbral | 1,51x | 1,28x | 1,74x | 1,96x | 1,16x | 1,10x | 2,58 |
| 8 borradores, umbral 0,2 | 1,62x | 1,49x | 1,76x | 1,97x | 1,13x | 1,28x | 2,55 |
| 8 borradores, umbral 0,3 | 1,70x | 1,51x | 1,87x | 2,03x | 1,40x | 1,33x | 2,49 |
| 8 borradores, umbral 0,5 | 1,69x | 1,50x | 1,88x | 2,02x | 1,39x | 1,34x | 2,32 |
| 8 borradores, umbral 0,7 | 1,63x | 1,47x | 1,79x | 1,91x | 1,36x | 1,31x | 2,16 |
| 8 borradores, umbral 0,9 | 1,52x | 1,45x | 1,59x | 1,71x | 1,37x | 1,23x | 1,96 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; el autor solo reporta aceleración relativa y la garantía de que la salida greedy coincide con la del modelo base.

## Requisitos de hardware

- El borrador pesa 428M parámetros (0,9 GB en el repositorio); en bf16 ocupa aproximadamente 0,86 GB de VRAM adicional sobre el modelo base.
- El modelo base Llama-3.1-8B-Instruct en bf16 requiere unos 16 GB de VRAM; en cuantización de 4 bits, unos 5-6 GB. El borrador debe mantenerse en bf16 para preservar la coincidencia con la decodificación del base.
- GPU recomendadas: NVIDIA H100 (configuración medida por el autor con CUDA graphs), A100 40/80 GB, y GPUs consumer de gama alta como RTX 4090 (24 GB) para el base en bf16 o cuantizado.
- Cabe en GPU consumer: sí, siempre que el modelo base quepa; en RTX 4090 en bf16 el conjunto base + borrador ocupa aproximadamente 17 GB.
- Opciones de despliegue: `economize>=0.4` sobre `transformers` con `device_map="cuda"`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor reporta 1,74x de throughput agregado y 2,42 tokens aceptados por pasada del modelo base en la configuración del checkpoint, medido en H100 a batch size 1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceleracion reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-economize-eagle3 (este) | Borrador EAGLE-3 para Llama-3.1-8B-Instruct | 428M (borrador) | Hereda 128K del base | 1,74x agregado; hasta 2,10x en matematicas | llama3.1 | Hugging Face, via `economize` |
| Llama-3.1-8B-Instruct (sin aceleracion) | Modelo base | 8B | 128K | 1,00x (referencia) | llama3.1 | Hugging Face |
| Otros borradores EAGLE-3 de la coleccion `economize-drafters` | Borradores EAGLE-3 para otros modelos base | no disponible | no disponible | no disponible | no disponible | Hugging Face (coleccion del autor) |

No se dispone de datos de otros borradores EAGLE-3 comparables (por ejemplo, para Mistral o Qwen) en la información proporcionada, por lo que la comparativa se limita al modelo base y a la propia colección del autor.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `meta-llama/Llama-3.1-8B-Instruct` y la biblioteca `economize>=0.4`; sin el modelo base no genera nada.
- En bf16, la verificación de varios tokens redondea de forma distinta a un paso de un solo token, por lo que tras un tiempo la salida puede diferir de la decodificación bf16 plana; en la medición, el 70% de las respuestas fueron idénticas en los 256 tokens. En float32 la coincidencia con la decodificación greedy es exacta.
- La aceleración depende del hardware y del runtime: los 1,74x se midieron en una H100 con CUDA graphs y batch size 1; en otras GPUs o sin CUDA graphs el factor puede ser menor.
- El borrador solo predice sobre los 32.768 tokens más frecuentes del entrenamiento; tokens raros del vocabulario pueden reducir la tasa de aceptación.
- Sesgos y alucinaciones: heredados del modelo base; el borrador no los corrige ni los amplifica en decodificación greedy, pero tampoco los mitiga.
- Restricciones de licencia: `llama3.1` impone condiciones de uso (política de uso aceptable, obligaciones de atribución y límites para usos comerciales a gran escala) que deben revisarse antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-04; no hay evidencia de validación independiente de las cifras de aceleración.
- No se documentan cuantizaciones del borrador ni soporte para motores de inferencia distintos de `economize`/`transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/Llama-3.1-8B-Instruct-economize-eagle3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio `economize` en GitHub: https://github.com/Thiggel/economize
- Paquete en PyPI: https://pypi.org/project/economize/
- Documentación de `economize`: https://thiggel.github.io/economize/
- Colección de borradores `economize`: https://huggingface.co/collections/flaitenberger/economize-drafters-6aeb7d0f6cae8de3208fd3e7
- Gráfica de speedup: https://huggingface.co/flaitenberger/Llama-3.1-8B-Instruct-economize-eagle3/resolve/main/speedup.png
