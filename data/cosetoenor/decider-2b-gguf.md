# cosetoenor/decider-2b-GGUF

## Resumen

Decider-2B es un modelo especializado en toma de decisiones y clasificación de opciones, desarrollado por Mapika y distribuido en formato GGUF por el usuario cosetoenor. Se trata de un fine-tune de Qwen3.5-2B-Base que, en lugar de generar texto libre, lee un estado (state) junto con preguntas tipadas y opciones descritas, y devuelve probabilidades sobre cada opción en un único forward pass. Esta naturaleza discriminativa lo aleja de los LLM conversacionales convencionales y lo acerca a un clasificador estructurado de alta eficiencia.

El modelo resuelve un problema concreto: la selección fiable de opciones en entornos con muchas alternativas (routing de atención al cliente, agentes de navegador, tareas de elección múltiple). Al restringir la salida a los tokens de las letras de opción y aplicar softmax sobre los logits, evita la generación libre y reduce la latencia y la variabilidad propias de los modelos generativos. La versión v10, publicada el 20 de septiembre de 2026, actualiza los pesos respecto a v8.

Con 1.881.825.088 parámetros reales (aproximadamente 1,88 mil millones), el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo y en CPU, lo que lo hace atractivo para despliegues en producción con requisitos de latencia ajustados. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3.5-2B-Base) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, IQ4_NL (GGUF) |
| Idiomas soportados | no disponible (evaluaciones mayoritariamente en chino tradicional e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-2B-Base, sin cambios arquitectónicos respecto al modelo base según la documentación del repositorio. La innovación no reside en la arquitectura sino en la interfaz de inferencia: el prompt se construye con un estado, preguntas tipadas y opciones descritas, y el modelo se evalúa leyendo los logits en las posiciones de respuesta, restringiéndolos a los tokens de letras de opción y aplicando softmax. No genera texto; produce una distribución de probabilidad sobre las alternativas.

El fine-tune incluye un proceso de aprendizaje por refuerzo documentado en el repositorio upstream (RL.md). La model card menciona evaluaciones sobre MiniWoB++, Mind2Web y OpenJev, lo que sugiere datos de entrenamiento orientados a tareas de agente de navegador y selección de acciones. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La versión v10 está fijada al commit `4a0e86782adfdb7393e04b8ec9f6b939dca09273` del repositorio upstream.

## Capacidades

- Clasificación de opciones con probabilidades: devuelve una distribución softmax sobre las letras de opción en un solo forward pass.
- Routing y enrutamiento de intenciones: selección entre conjuntos de opciones descritas (evaluado con CLINC, hasta 151 opciones).
- Razonamiento de elección múltiple: evaluado en BoolQ, OCNLI y TMMLU+.
- Agentes de navegador: selección de acciones de clic en tareas sintéticas de MiniWoB++ y Mind2Web.
- Soporte multirrespuesta tipada: preguntas con opciones descritas, incluyendo opción "None of the above".
- No genera texto libre: requiere un shim o servidor específico (`code/dz_shim.c`) para extraer probabilidades.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.
- Capacidades multilingües: evaluaciones principalmente en chino tradicional e inglés; no se documenta cobertura adicional.

## Casos de uso

- Routing de atención al cliente: el modelo selecciona entre decenas o cientos de intenciones descritas en un solo paso, con latencias P50 de 17-24 ms en RTX 3070 Ti para la mayoría de configuraciones, lo que permite integrarlo en un pipeline de triaje previo a un LLM generativo.
- Agentes de navegador web: selección de la siguiente acción (clic, elección de elemento) en tareas de automatización, con una accuracy reportada del 93,2% en MiniWoB++ con acciones muestreadas (v10).
- Clasificación de tickets y correos: asignación de categorías entre un conjunto amplio de opciones descritas, aprovechando la evaluación con 151 opciones de CLINC (88,5% con Q8_0 en v8).
- Verificación de afirmaciones (fact checking): uso en BoolQ para decidir si una afirmación es verdadera o falsa dado un contexto, con 83,55% de accuracy en Q8_0.
- Detección de opción inválida: la configuración "gold removed" de CLINC (94,67% en Q8_0) permite descartar entradas que no encajan en ninguna categoría, útil para filtrado previo.
- Despliegue en CPU o GPUs de gama baja: con IQ4_NL (1,2 GB) puede ejecutarse en entornos con poca VRAM o en CPU, adecuado para servicios de clasificación de alto volumen y bajo coste.
- Enrutamiento multilingüe en chino: evaluación en TMMLU+ (48,36% en Q8_0) permite su uso en tareas de conocimiento en chino tradicional, aunque con rendimiento moderado.

## Benchmarks y rendimiento

Resultados upstream del modelo (no de los ficheros GGUF), comparando v8 y v10 con las mismas entradas:

| Tarea | v8 | v10 |
|---|---:|---:|
| MiniWoB++ tareas de clic, acciones muestreadas | 83,0% | 93,2% |
| MiniWoB++ tareas de clic, acciones greedy | 90,3% | 90,9% |
| Mind2Web, 1.770 filas | 81,1% | 82,7% |
| OpenJev, 5.252 filas | 64,1% | 63,3% |

Benchmark GGUF v8 en RTX 3070 Ti (8 GB VRAM), 7.440 casos por modelo, layout state-first:

| Tarea | Casos | Q8_0 accuracy | IQ4_NL accuracy | Q8_0 P50 ms | IQ4_NL P50 ms |
|---|---:|---:|---:|---:|---:|
| BoolQ | 3.270 | 83,55% | 84,89% | 24,0 | 23,6 |
| OCNLI | 2.950 | 70,14% | 68,47% | 18,2 | 17,7 |
| CLINC: 151 opciones | 200 | 88,50% | 82,50% | 106,8 | 106,0 |
| CLINC: 11 opciones | 200 | 96,50% | 97,00% | 19,6 | 19,0 |
| CLINC: gold removed | 150 | 94,67% | 93,33% | 17,9 | 17,0 |
| TMMLU+ | 670 | 48,36% | 46,27% | 18,9 | 18,2 |

Acuerdo de cuantización v8 frente a BF16 (71 prompts de routing, chino tradicional):

| Tipo | Selecciones iguales a BF16 | Deriva de probabilidad (mediana / máx) |
|---|---:|---:|
| Q8_0 | 70 / 71 | 0,003 / 0,062 |
| IQ4_NL | 59 / 71 | 0,028 / 0,397 |

Los ficheros v10 solo tienen validación estructural y de conversión; no se ha medido su accuracy ni su rendimiento en ejecución.

## Requisitos de hardware

- VRAM estimada: F16 ~3,8 GB; Q8_0 ~2,0 GB; IQ4_NL ~1,2 GB (tamaños de fichero aproximados).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0; RTX 3070 Ti (8 GB) validada en los benchmarks v8.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 3070 Ti y superiores; IQ4_NL permite GPUs con 2-3 GB libres.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) con el shim `code/dz_shim.c` para extraer probabilidades; no es compatible con vLLM ni TGI en su forma actual, ya que requiere lectura directa de logits.
- Latencia: P50 de 17-24 ms en RTX 3070 Ti para la mayoría de tareas; 106 ms con 151 opciones (v8).
- Throughput: no disponible de forma agregada; los benchmarks reportan latencias por caso.

## Comparativa con modelos similares

Comparación de la evaluación de tres modelos sobre los mismos 7.440 casos (v8, mismas condiciones de despliegue, no igual precisión):

| Modelo | Parámetros | Contexto | Accuracy BoolQ | Accuracy TMMLU+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decider-2B (BF16) | 1,88B | no disponible | menor que Scorer | menor que Scorer | Apache 2.0 | Hugging Face (GGUF y safetensors) |
| NanoJev (`local_atomic_seed17`) | no disponible | no disponible | no disponible | no disponible | no disponible | checkpoint especializado en laberintos |
| System One Scorer (NF4) | no disponible | no disponible | más alto que Decider | más alto que Decider | no disponible | despliegue con NF4 |

Según el informe de tres modelos, Decider-2B ofrece el mejor equilibrio latencia/accuracy en ese despliegue, mientras que System One Scorer es más preciso en BoolQ y TMMLU+ pero más lento. La comparación no es arquitectónica: NanoJev está especializado en laberintos, Scorer usa NF4 para caber en 8 GB y Decider usa BF16.

## Limitaciones y advertencias

- No es un modelo generativo: un `llama-cli` o `llama-server` estándar devuelve continuación de texto, no probabilidades de opción; se requiere el shim incluido.
- Los ficheros v10 no han sido validados en inferencia ni en accuracy; solo tienen validación de conversión y estructura. La compatibilidad en tiempo de ejecución del servidor incluido con v10 no está probada.
- Los benchmarks disponibles corresponden mayoritariamente a v8, no a v10.
- Riesgo de alucinación y sesgo: no documentado en la información disponible; al ser un clasificador restringido a opciones, el riesgo se traslada a la selección errónea entre alternativas.
- Cobertura de idiomas no documentada; las evaluaciones se centran en chino tradicional e inglés, con TMMLU+ en 48,36%, lo que indica rendimiento moderado en conocimiento en chino.
- La evaluación de navegador cubre tareas sintéticas de clic, no escritura ni desplazamiento en sitios reales.
- CLINC reutiliza enunciados entre configuraciones; los casos "gold removed" deben seleccionar "None of the above".
- La comparación con BF16 incluye diferencias de motor y precisión (PyTorch frente a llama.cpp).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen3.5-2B-Base y del repositorio upstream.
- El repositorio tiene 14,0 GB de tamaño total, aunque cada fichero individual es mucho menor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cosetoenor/decider-2b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Repositorio upstream en GitHub: https://github.com/Mapika/decider
- Informe de RL: https://github.com/Mapika/decider/blob/main/docs/RL.md
- Revisión v8: https://huggingface.co/cosetoenor/decider-2b-GGUF/tree/v8
- README en chino tradicional: README.zh-TW.md (en el repositorio)
- Benchmark v8 state-first (inglés): BENCHMARK_3070TI_STATE_FIRST.md
- Benchmark v8 state-first (chino): BENCHMARK_3070TI_STATE_FIRST.zh-TW.md
- Comparativa de tres modelos (inglés): BENCHMARK_THREE_MODELS.md
- Comparativa de tres modelos (chino): BENCHMARK_THREE_MODELS.zh-TW.md
- Datos de benchmark GGUF: benchmarks/gguf-comparison.json
- Datos de comparativa general: benchmarks/general-comparison.json y benchmarks/general-comparison.csv
