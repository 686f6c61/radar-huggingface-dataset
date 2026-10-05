# rasyosef/Phi-4-mini-instruct-DSpark

## Resumen

Phi-4-mini-instruct-DSpark es un modelo borrador (draft model) de decodificación especulativa publicado por el usuario rasyosef en HuggingFace. No es un modelo conversacional autónomo: su única función es proponer bloques de tokens que el verificador `microsoft/Phi-4-mini-instruct` valida después en un único forward pass. Tiene 658.303.441 parámetros (unos 0,66 mil millones), se distribuye en safetensors y requiere `custom_code` de la librería `transformers`.

El problema que resuelve es la latencia de generación del verificador. Al proponer 8 tokens por bloque en lugar de uno, y aceptar de media 3,23 tokens por paso de verificación, consigue una aceleración de 3,61 veces en math_reasoning y 3,44 veces en HumanEval, con una media de 2,20 veces sobre nueve tipos de tarea. La decodificación es sin pérdida (lossless): como el verificador comprueba todos los tokens propuestos, la salida greedy es idéntica a la del verificador sin borrador.

El modelo se entrenó con la librería `speculators` del proyecto vLLM sobre 116.000 muestras derivadas de Open PerfectBlend y regeneradas por el propio verificador. Es relevante porque encaja directamente en despliegues existentes de vLLM y llama.cpp sin cambiar el modelo servido, y porque publica métricas detalladas de aceptación posición a posición, algo poco habitual en modelos borrador. Se publica bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder como modelo borrador; 4 capas con atención tipo Qwen3, las 3 primeras con sliding-window attention de 2048 tokens y la última con atención completa |
| Parametros totales | 658.303.441 (aproximadamente 0,66 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto propio; ventana deslizante de 2048 tokens en las tres primeras capas y atención completa en la cuarta; el contexto efectivo de la generación lo determina el verificador |
| Tipos de cuantizacion | BF16 (existe un repositorio GGUF separado en BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (el comportamiento lingüístico depende del verificador Phi-4-mini-instruct) |
| Licencia | MIT |
| Formato de pesos | safetensors con código personalizado en `transformers`; GGUF en repositorio separado |

Detalles internos adicionales: hidden size 3072, intermediate size 8192, 24 cabezas de atención sobre 8 cabezas KV, dimensión de cabeza 128, block size 8 y capas auxiliares de hidden states en las posiciones 2, 10, 22 y 30 del verificador. El vocabulario del borrador es de 50.000 tokens, un subconjunto de los 200.064 del verificador.

## Arquitectura y entrenamiento

El borrador es un transformer decoder de 4 capas que reutiliza los hidden states intermedios del verificador (capas 2, 10, 22 y 30) como señal auxiliar, en la línea de los métodos de decodificación especulativa con features ocultas. Las tres primeras capas emplean sliding-window attention con ventana de 2048 tokens y la última, atención completa, lo que reduce el coste de cómputo del borrador manteniendo acceso global en la capa final. La generación se organiza en bloques de 8 tokens: el borrador propone el bloque completo y el verificador lo comprueba en un solo forward pass, de modo que ningún token aceptado altera la distribución final del modelo servido.

El entrenamiento se realizó durante 3 épocas con learning rate 3e-4, schedule coseno y 4% de warmup, sobre 116.000 prompts de Open PerfectBlend regenerados por el propio verificador y divididos 96/4 entre entrenamiento y validación. La función de pérdida combina dos términos con pesos `{"ce": 0.1, "tv": 0.9}`. Los prompts se prepararon a 2048 tokens con longitud de secuencia de entrenamiento de 4096 y hasta 512 anchors por muestra. Los hidden states del verificador se extraían bajo demanda desde un servidor vLLM en ejecución y se eliminaban tras su uso, en lugar de almacenarse previamente en disco.

## Capacidades

- No genera texto de forma autónoma: no responde peticiones por sí solo ni produce una salida válida sin el verificador.
- Propone bloques de hasta 8 tokens candidatos que el verificador acepta o rechaza en un único paso.
- Decodificación especulativa sin pérdida: la salida greedy coincide exactamente con la del verificador sin borrador.
- Aceptación media de 3,23 tokens por paso de verificación, con máximo de 4,954 en math_reasoning.
- Integración nativa con vLLM mediante `vllm serve`, cargando el verificador automáticamente desde la configuración.
- Integración con llama.cpp mediante `--spec-type draft-dspark`, con `--spec-draft-n-max 8` y `--spec-draft-n-min 0`.
- Reporta métricas por respuesta (`draft_n` / `draft_n_accepted`) en las marcas de tiempo de llama.cpp.
- No dispone de soporte propio de tool calling, función calling, agentes, visión, audio ni modo de razonamiento; esas capacidades las aporta el verificador.
- Capacidades multilingües: no disponibles; dependen íntegramente del verificador.

## Casos de uso

- Aceleración de un servidor vLLM existente: se despliega `rasyosef/Phi-4-mini-instruct-DSpark` con `vllm serve` y vLLM carga el verificador desde la configuración, de modo que el endpoint OpenAI-compatible sigue sirviendo Phi-4-mini-instruct pero con mayor throughput.
- Generación de código en producción: en tareas tipo HumanEval la aceptación alcanza 4,736 tokens y la aceleración 3,44 veces, por lo que encaja en asistentes de código o pipelines de CI/CD que ya usen Phi-4-mini-instruct como modelo base.
- Razonamiento matemático y resolución de problemas paso a paso: es el caso con mejor rendimiento medido, con 4,954 tokens de aceptación y 3,61 veces de aceleración (486,0 tokens/s frente a 134,6 de línea base en una A100).
- Despliegue con llama.cpp en hardware modesto: permite servir Phi-4-mini-instruct en BF16 con decodificación especulativa exacta y reducción de latencia perceptible para el usuario final.
- Reducción de coste de GPU: al multiplicar el throughput por 2,20 de media, se necesitan menos GPU-horas para el mismo volumen de inferencia, lo que abarata servicios de chat o generación por lotes.
- Investigación en decodificación especulativa: sirve como referencia reproducible para comparar estrategias de borrador, ya que publica aceptación por posición dentro del bloque en nueve tipos de tarea.
- Servicios de resumen y traducción de baja exigencia: aunque son los casos con menor ganancia (2,327 y 2,151 tokens de aceptación; 1,83 y 1,49 veces de aceleración), siguen aportando mejora sin degradar la salida.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks de calidad estándar (MMLU, GSM8K u otros) en la información disponible, porque se trata de un modelo borrador sin pérdida: su calidad de salida es idéntica a la del verificador. Las métricas publicadas son de aceptación y throughput.

Longitud de aceptación media por subconjunto de `RedHatAI/speculator_benchmarks`, a temperatura 0. `pos_N` es la probabilidad de que el token propuesto en esa posición sea aceptado; el suelo es 1,0 y el techo 9,0 con block size 8.

| Subconjunto | Aceptación media | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| math_reasoning | 4,954 | 86,8% | 74,1% | 62,3% | 51,1% | 41,3% | 33,1% | 26,5% | 20,2% |
| HumanEval | 4,736 | 85,1% | 70,8% | 58,6% | 47,3% | 38,6% | 30,2% | 24,0% | 18,9% |
| rag | 3,157 | 70,2% | 49,2% | 34,3% | 25,6% | 19,4% | 8,8% | 4,8% | 3,2% |
| writing | 3,073 | 68,7% | 45,9% | 31,3% | 22,0% | 15,8% | 11,6% | 7,5% | 4,6% |
| tool_call | 2,829 | 69,0% | 44,8% | 28,8% | 18,0% | 10,5% | 6,1% | 3,5% | 2,1% |
| qa | 2,646 | 63,2% | 39,6% | 25,0% | 17,8% | 14,2% | 2,7% | 1,5% | 0,7% |
| question | 2,618 | 65,1% | 39,2% | 23,2% | 14,0% | 8,6% | 5,5% | 3,7% | 2,4% |
| summarization | 2,327 | 62,8% | 35,5% | 19,0% | 9,2% | 4,1% | 1,6% | 0,4% | 0,1% |
| translation | 2,151 | 60,4% | 32,9% | 13,0% | 5,3% | 1,9% | 0,8% | 0,5% | 0,3% |

Media ponderada sobre los nueve subconjuntos: 3,234 sobre 69.478 pasos de verificación.

Throughput medio de salida (tokens/s) sobre los mismos nueve subconjuntos, medido en una única A100 con concurrencia 1 y temperatura 0. La línea base es Phi-4-mini-instruct sin decodificación especulativa.

| Subconjunto | Línea base (sin borrador) | DSpark | Aceleración |
|---|---|---|---|
| math_reasoning | 134,6 | 486,0 | 3,61× |
| HumanEval | 133,5 | 459,3 | 3,44× |
| rag | 123,4 | 219,1 | 1,78× |
| writing | 131,8 | 240,5 | 1,82× |
| tool_call | 123,8 | 287,3 | 2,32× |
| qa | 135,4 | 225,9 | 1,67× |
| question | 132,8 | 240,5 | 1,81× |
| summarization | 124,6 | 228,2 | 1,83× |
| translation | 127,9 | 190,6 | 1,49× |
| Media | 1,00× | — | 2,20× |

## Requisitos de hardware

- VRAM del borrador: con 658.303.441 parámetros, en BF16/FP16 ocupa aproximadamente 1,3 GB. El repositorio completo pesa 4,7 GB, lo que indica que incluye artefactos adicionales además de los pesos de inferencia.
- VRAM del verificador: Phi-4-mini-instruct (unos 3,8 mil millones de parámetros) requiere alrededor de 7,7 GB en BF16 y aproximadamente 2,5 GB en cuantización de 4 bits, cantidades que hay que sumar a las del borrador.
- GPU recomendadas: los datos publicados se obtuvieron en una única NVIDIA A100. Cualquier GPU con suficiente memoria para verificador y borrador es válida; el cuello de botella no es el cómputo del borrador, que es muy ligero.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 sirviendo el verificador en BF16 o en 4 bits, y en tarjetas de 8-12 GB si se cuantiza el verificador.
- Opciones de despliegue: vLLM mediante `vllm serve` (con `--gpu-memory-utilization 0.8` y `--override-generation-config '{"temperature": 0}'`) y llama.cpp mediante `llama-server` con `--spec-type draft-dspark -fa on -ngl 99`. No se documentan despliegues con TGI, Ollama ni otros motores en la información disponible.
- Throughput medido: entre 190,6 y 486,0 tokens/s según la tarea, frente a 123,4-135,4 tokens/s de la línea base sin borrador, en A100 y con concurrencia 1.
- Latencia: no se publican valores de latencia directa; puede derivarse del throughput. Con concurrencia 1 la reducción es proporcional a la aceleración por subconjunto.

## Comparativa con modelos similares

No se dispone de datos comparativos medidos frente a otros modelos borrador en la información proporcionada. La tabla siguiente recoge la comparación estructural con las alternativas habituales de la misma categoría, marcando como no disponible todo aquello que no está documentado.

| Modelo | Tipo | Parámetros | Contexto | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phi-4-mini-instruct-DSpark | Borrador de decodificación especulativa con verificación de tokens | 658.303.441 | ventana deslizante de 2048 en 3 capas + atención completa en la última | 3,23 tokens de aceptación media; 2,20× de aceleración media; 3,61× en math_reasoning | MIT | safetensors y GGUF en HuggingFace |
| EAGLE-3 | Borrador de decodificación especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |
| Medusa | Cabezas de decodificación especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |
| Lookahead decoding | Decodificación especulativa sin modelo borrador | no aplica | no disponible | no disponible | no disponible | no disponible |

La diferencia relevante de este modelo frente a enfoques genéricos es que está especializado en un verificador concreto, Phi-4-mini-instruct, y que publica aceptación desglosada por posición dentro del bloque, lo que permite estimar la ganancia por tipo de tarea antes de desplegarlo.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el verificador Phi-4-mini-instruct no produce salida utilizable. Cualquier evaluación de calidad debe hacerse sobre el verificador.
- Requiere `custom_code` en `transformers`, por lo que es necesario activar `trust_remote_code` y auditar el código antes de usarlo en producción.
- Rendimiento desigual por tarea: la aceleración cae de 3,61× en math_reasoning a 1,49× en translation. En traducción, menos de uno de cada siete tokens propuestos sobrevive hasta la posición 2.
- Decaimiento no uniforme: en qa y rag la aceptación cae abruptamente entre pos_4 y pos_5 (14,2% a 2,7% y 19,4% a 8,8%), en lugar de degradarse de forma progresiva.
- Vocabulario restringido: el borrador predice sobre 50.000 tokens, un subconjunto de los 200.064 del verificador, lo que limita los tokens que puede proponer.
- Idiomas soportados no disponibles: se desconoce si la aceptación se mantiene fuera del inglés, ya que las evaluaciones publicadas son en inglés.
- Todos los datos de rendimiento se midieron a temperatura 0 y concurrencia 1 en una A100. El comportamiento con muestreo estocástico o con lotes concurrentes no está documentado.
- Licencia del borrador MIT, pero el uso en producción depende también de la licencia del verificador, que debe verificarse por separado.
- Adopción muy baja: 15 descargas y 0 «likes» en el momento de redactar esta ficha, por lo que no existe validación comunitaria independiente de los resultados publicados.
- Riesgo de alucinación: no aplica al borrador, porque la verificación garantiza la igualdad con la salida del verificador; cualquier alucinación provendría del propio Phi-4-mini-instruct.
- Los enlaces de búsqueda web devueltos para esta consulta no contenían información técnica relevante sobre el modelo y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Phi-4-mini-instruct-DSpark
- Modelo verificador (base): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio GGUF del borrador: https://huggingface.co/rasyosef/Phi-4-mini-instruct-DSpark-GGUF
- GGUF del verificador usado en el ejemplo de llama.cpp: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Librería de entrenamiento `speculators`: https://github.com/vllm-project/speculators
- Código de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de prompts Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Benchmark de especuladores: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
