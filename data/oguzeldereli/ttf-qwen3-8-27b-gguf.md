# oguzeldereli/ttf-Qwen3.8-27B-GGUF

## Resumen

ttf-Qwen3.8-27B-GGUF es una cuantizacion ternaria extrema del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador independiente oguzeldereli bajo licencia Apache-2.0. La innovacion central es la conversion de todas las capas lineales del transformer a pesos ternarios ({-1, 0, +1} multiplicados por escalas de fila y columna), empaquetados en un formato GGUF propio denominado TQ1_P que ocupa 1,6 bits por peso. El resultado son dos ficheros de 8,20 GB y 6,74 GB que reducen un modelo de 33.841.651.200 parametros a un tamano manejable en GPU de consumo.

El modelo resuelve el problema de desplegar modelos de gran tamano en hardware limitado: segun el autor, el fichero de 8,20 GB se ejecuta integramente en una GPU de 12 GB, con 7,6 GiB de VRAM ocupados por los pesos y un rendimiento medido de 29,2 tokens/s en decodificacion y 748 tokens/s en prefill (pp512) sobre una RTX 3090 Ti. La recuperacion de calidad se logra mediante adaptadores de bajo rango en punto flotante y un proceso de destilacion desde el modelo completo.

Es relevante ahora porque demuestra que la cuantizacion ternaria con recuperacion por destilacion puede preservar capacidades de razonamiento y codigo con perdidas moderadas: GSM8K se mantiene identico al modelo completo (0,895) y HumanEval cae de 0,933 a 0,841 en la variante con adaptadores. El coste es una dependencia estricta de un fork parcheado de llama.cpp, ya que la implementacion principal no carga estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B, con capas DeltaNet segun referencias del motor) |
| Parametros totales | 33.841.651.200 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria TQ1_P (1,6 bits por peso), TQ1_0 para proyecciones down y adaptadores ternarios, Q4_K para embedding y head, adaptadores float de rango 16 |
| Idiomas soportados | no disponible (el entrenamiento de recuperacion incluye texto web multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos variantes: adapters-r0.2 de 8,20 GB y noadapters de 6,74 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B, un transformer con 33.841.651.200 parametros. La conversion, realizada con la herramienta ttf-conversion, se aplica capa a capa en streaming: se pliegan las ganancias de normalizacion en las lineales, se rota el flujo residual mediante una transformada de Hadamard aleatorizada, se aplica GPTQ ternario centrado seguido de descenso por coordenadas sobre los trits, y se anaden adaptadores ternarios de bajo rango (rango 0,2 del ancho) y adaptadores float de rango 16 en cada capa lineal. El embedding y la cabeza se cuantizan a 4 bits.

La recuperacion de calidad se lleva a cabo con ttf-ternary en dos configuraciones. La variante con adaptadores entrena 2200 pasos (72M tokens) destilando desde el modelo de precision completa con top-k cacheado del profesor, sobre una mezcla de post-entrenamiento (razonamiento, codigo, matematicas, uso de herramientas y chat, con la parte de instrucciones descontaminada contra los benchmarks mediante n-gramas de 13 palabras) mas texto web multilingue; en esta variante los trits permanecen congelados y solo entrenan los adaptadores float, las escalas y las normas. La variante sin adaptadores ternarios entrena 1210 pasos de 16 x 2048 tokens (39,6M tokens) con destilacion top-64 mas cola muestreada, learning rate de 1e-4 a 1e-5, y permite entrenar los trits, aunque solo el 0,033% de ellos se movio durante el proceso, concentrados en las ultimas capas.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Generacion de codigo: HumanEval de 0,841 (variante con adaptadores) y 0,787 (sin adaptadores).
- Razonamiento matematico: GSM8K de 0,895 y 0,880 segun variante, practicamente identico al modelo completo.
- Seguimiento de instrucciones: IFEval estricto de 0,735 en ambas variantes.
- Conocimiento factual: TriviaQA de 0,326 (adaptadores) y 0,242 (sin adaptadores) en exact match.
- Soporte multilingue: el entrenamiento de recuperacion incluye texto web multilingue, aunque no se detallan los idiomas cubiertos.
- Tool calling y uso de agentes: la mezcla de recuperacion incluye datos de uso de herramientas, aunque no se documentan formatos especificos.
- Modo thinking: la model card indica que las mediciones se hicieron con la plantilla de chat con thinking desactivado; no se detalla el comportamiento con thinking activo.
- API compatible con OpenAI mediante `ttf serve` en el puerto indicado.

## Casos de uso

- Despliegue en GPU de consumo: el fichero de 8,20 GB ocupa 7,6 GiB de VRAM y cabe en tarjetas de 12 GB como la RTX 3060 de 12 GB o la RTX 4070, permitiendo servir un modelo de 33.800 millones de parametros en hardware de gama media.
- Generacion de codigo en local: con HumanEval de 0,841, puede integrarse en asistentes de programacion autoalojados donde la privacidad del codigo impide usar APIs externas, ejecutandose sobre una unica GPU.
- Razonamiento matematico asistido: GSM8K de 0,895 lo hace adecuado para tutoria o verificacion de problemas aritmeticos en entornos con recursos limitados.
- Servicio de chat con API compatible OpenAI: `ttf serve` expone un endpoint compatible que permite sustituir un backend remoto por este modelo sin reescribir el cliente.
- Experimentacion en investigacion sobre cuantizacion ternaria: los dos ficheros permiten comparar el efecto de los adaptadores ternarios frente a los trits entrenables en la misma arquitectura y harness.
- Procesamiento por lotes en estaciones de trabajo: con 748 tokens/s de prefill en una RTX 3090 Ti, es viable procesar lotes de documentos o prompts largos en pipelines offline.
- Evaluacion de robustez de destilacion: la diferencia de TriviaQA entre variantes (0,326 frente a 0,242) sirve para estudiar que capacidades se degradan primero bajo cuantizacion extrema.

## Benchmarks y rendimiento

| Benchmark | adapters-r0.2 (8,20 GB) | noadapters (6,74 GB) | Qwen3.8-27B (precision completa) |
|---|---|---|---|
| GSM8K (primeros 200 problemas) | 0,895 / 0,900 | 0,880 | 0,895 |
| HumanEval | 0,841 / 0,835 | 0,787 | 0,933 |
| IFEval estricto (primeros 200 prompts) | 0,735 / 0,760 | 0,735 | 0,787 |
| IFEval laxo | no disponible / 0,790 | 0,750 | no disponible |
| TriviaQA (298, exact match) | no disponible / 0,326 | 0,242 | no disponible |
| Perdida next-token en Wikipedia (16 ventanas de 2048) | 2,1915 | no disponible | 1,943 (Q8_0 del base) |

Nota: las cifras separadas por barra corresponden a mediciones en el export TQ2_0 del mismo modelo y al fichero TQ1_P con el mismo harness, respectivamente. El rendimiento medido en llama.cpp sobre RTX 3090 Ti con todo en GPU es de 29,2 tokens/s en decodificacion y 748 tokens/s en prefill (pp512).

## Requisitos de hardware

- VRAM para pesos: 7,6 GiB en la variante de 8,20 GB; la variante de 6,74 GB requiere algo menos, aunque no se publica la cifra exacta.
- GPU recomendadas: RTX 3090 Ti (medicion oficial), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU NVIDIA con al menos 12 GB de VRAM para la variante grande.
- GPU de consumo: si, cabe en tarjetas de 12 GB; el autor afirma que se ejecuta integramente en una GPU de 12 GB.
- Despliegue: exclusivamente mediante llama.cpp con los parches TTF, construido con `ttf engine build --q38` desde el repositorio ttf-home. La implementacion principal de llama.cpp no carga estos ficheros. Se ofrece `ttf chat` y `ttf serve` (API compatible con OpenAI).
- Latencia y throughput: 29,2 tokens/s de decodificacion y 748 tokens/s de prefill (pp512) en RTX 3090 Ti.
- Nota de compatibilidad: la variante sin adaptadores requiere el parche 0009 o posterior del motor `--q38` (10 de noviembre de 2026); versiones anteriores fallan con "wrong number of tensors".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ttf-Qwen3.8-27B-GGUF (adapters) | 33,84B | no disponible | Apache-2.0 | GGUF TQ1_P | 8,20 GB, HumanEval 0,841, requiere fork de llama.cpp |
| ttf-Qwen3.8-27B-GGUF (noadapters) | 33,84B | no disponible | Apache-2.0 | GGUF TQ1_P | 6,74 GB, HumanEval 0,787, requiere fork de llama.cpp |
| Qwen3.8-27B (precision completa) | 33,84B | no disponible | Apache-2.0 | safetensors | Referencia de calidad: HumanEval 0,933, GSM8K 0,895 |
| Qwen3.8-27B Q8_0 | 33,84B | no disponible | Apache-2.0 | GGUF | Perdida Wikipedia 1,943 frente a 2,1915 del ternario |

No se dispone de datos sobre otras alternativas ternarias comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un fork: los ficheros no cargan en llama.cpp principal; requieren el motor parcheado de ttf-home, lo que limita la portabilidad y anade riesgo de mantenimiento.
- Perdida de calidad medible: HumanEval cae 9,2 puntos en la variante con adaptadores (0,933 a 0,841) y 14,6 puntos en la variante sin adaptadores (0,787); IFEval estricto baja de 0,787 a 0,735.
- Perdida de perplejidad: la perdida next-token en Wikipedia sube de 1,943 (Q8_0 del base) a 2,1915, un 12,8% superior.
- Conocimiento factual degradado: TriviaQA en exact match es de 0,326 y 0,242, sin referencia del modelo completo en la model card.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de calibracion; la degradacion en TriviaQA sugiere mayor propension a errores factuales.
- Idiomas: no se especifica la lista de idiomas soportados; el multilingue se limita a mencionar texto web multilingue en la recuperacion.
- Contexto: la longitud de contexto no se documenta en la informacion disponible.
- Datos de entrenamiento: la mezcla de recuperacion es limitada (72M y 39,6M tokens), muy inferior al preentrenamiento original, lo que puede afectar a dominios no cubiertos.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos derivan de Qwen3.8-27B y heredan su licencia; conviene verificar las condiciones del modelo base.
- Variante sin adaptadores: requiere un parche concreto del motor; builds anteriores fallan, lo que puede romper despliegues existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oguzeldereli/ttf-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de conversion: https://github.com/oguzeldereli/ttf-conversion
- Herramienta de recuperacion ternaria: https://github.com/oguzeldereli/ttf-ternary
- Motor y CLI de ejecucion: https://github.com/oguzeldereli/ttf-home
