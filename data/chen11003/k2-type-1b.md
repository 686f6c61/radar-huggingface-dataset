# chen11003/K2-Type-1B

## Resumen

K2-Type-1B es un modelo de decisión de aproximadamente 1.078 millones de parámetros publicado por el usuario chen11003, construido mediante ajuste fino completo sobre IFM/K2-Horizon-0.9B. No es un modelo generativo: recibe un único estado (texto plano o JSON) y un conjunto de preguntas tipadas, y devuelve en una sola pasada forward una distribución de probabilidad sobre las opciones de cada pregunta. Su diseño sigue el estilo del modelo Jev de TypeSafe y es compatible con el formato de cable `/v1/systemone`, de modo que los clientes escritos para Jev o Kev funcionan sin cambios.

La relevancia del modelo está en su enfoque: en lugar de generar texto y parsearlo después, emplea una cabeza pointer que puntúa el estado oculto de cada opción contra el estado oculto del token de decisión de su pregunta, aplicando un softmax con temperatura 1.478. Esto permite resolver clasificación, elección múltiple y escalas ordenadas con latencias de decenas de milisegundos por decisión, algo poco habitual en modelos de este tamaño dentro de la categoría de "modelos de decisión" calibrados.

El modelo se distribuye bajo licencia Apache 2.0, solo en inglés, con pesos en safetensors y código de servido mínimo incluido en el repositorio (`jev/`). El autor no ha liberado ni el código de entrenamiento ni los datos. En el conjunto público de JevBench alcanza 176/231 aciertos (0.762) con un ECE de 0.065, y en las suites de Kev obtiene 0.813 en fuentes vistas y 0.688 en fuentes nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base IFM/K2-Horizon-0.9B) con cabeza pointer para decisión; máscara de atención block-causal |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor advierte de bajo rendimiento en documentos de más de 8192 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (más `pointer_head.safetensors` y `decision_config.json`) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de IFM/K2-Horizon-0.9B y le añade una cabeza pointer entrenada específicamente para decidir. La entrada sigue el formato `<state> ... | <q> pregunta <opt> opción </opt> ... <decide> | <q> ...`, empleando cinco tokens reservados del tokenizador base definidos en `decision_config.json`. La cabeza pointer puntúa el estado oculto de cada `</opt>` contra el estado oculto del token `<decide>` de su propia pregunta; un softmax a temperatura 1.478 produce las probabilidades finales. Las preguntas comparten el estado pero no se ven entre sí gracias a una máscara block-causal, de modo que añadir una pregunta no altera las respuestas de las demás. Se admiten tres tipos: `noul` (enunciado con definiciones opcionales de falso/verdadero, devuelve P(true)), `choice` (entre 1 y 255 opciones nombradas, devuelve la mejor opción, su confianza y todas las probabilidades) y `score` (entre 2 y 255 niveles ordenados, devuelve el nivel esperado y la probabilidad por nivel).

El entrenamiento consistió en un ajuste fino completo sobre aproximadamente 354.000 registros de decisión, procedentes de conjuntos públicos de clasificación, NLI y QA, de los datos de decisión de Kev, de posiciones de juego con etiquetas exactas o de búsqueda, y de elementos sintéticos escritos y verificados a ciegas por un modelo grande. Los objetivos se mezclaron con etiquetas suaves de un profesor de decisión de 7B. A continuación se aplicaron 50 iteraciones de PPO sobre el juego Snake y, por último, un reajuste de temperatura sobre datos de calibración reservados. El autor verificó que los datos de entrenamiento no presentan solapamiento exacto ni de contención con ninguna suite de evaluación de Kev ni con los 231 elementos públicos de JevBench.

## Capacidades

- Clasificación binaria calibrada mediante preguntas `noul`, con definiciones personalizables de falso y verdadero.
- Elección entre opciones nombradas (`choice`) con descripciones opcionales; devuelve la opción ganadora, su confianza y el vector completo de probabilidades.
- Puntuación en escalas ordinales (`score`) de entre 2 y 255 niveles; devuelve el nivel esperado y la probabilidad de cada nivel.
- Resolución de múltiples preguntas heterogéneas sobre un mismo estado en una única pasada forward, sin interferencia entre preguntas.
- Aceptación de estado en texto plano o JSON, lo que permite inyectar metadatos estructurados (por ejemplo, campos de un ticket).
- Calibración de confianza: ECE de 0.065 en el conjunto público de JevBench y Brier de 0.328.
- Servido mediante API HTTP compatible con `/v1/systemone` y endpoint `GET /health`.
- No soporta generación de texto, tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento. El autor indica explícitamente que el backbone no debe usarse para generar texto.

## Casos de uso

- Triaje de tickets de soporte: con un estado JSON que contenga asunto y cuerpo del mensaje, se definen preguntas `choice` para la cola de destino (facturación, técnico, general) y `noul` para detectar enfado, más una pregunta `score` de urgencia. El ejemplo incluido en la model card resuelve las tres decisiones en una sola llamada.
- Enrutado de peticiones en producción: al devolver probabilidades completas por opción, el sistema puede derivar a un humano cuando la confianza cae por debajo de un umbral, en lugar de aceptar ciegamente la mejor opción.
- Moderación de contenido con umbral calibrado: la salida probabilística y el ECE bajo permiten fijar umbrales operativos con una tasa de falsos positivos predecible.
- Etiquetado a escala sobre corpus existentes: al procesar 590 tokens de entrada por decisión y resolver varias preguntas por pasada, resulta adecuado para anotar grandes volúmenes con coste por elemento bajo.
- Evaluación de sistemas de decisión: sirve como referencia en las suites JevBench y Kev para comparar adaptadores, LoRA o modelos de decisión alternativos.
- Investigación en calibración y decisión estructurada: el repositorio expone la cabeza pointer y el formato de entrada, lo que facilita reproducir los experimentos de temperatura y calibración.
- Control de agentes en entornos simulados: los mismos pesos juegan a Snake sobre un tablero de texto con una pregunta `choice` y cuatro preguntas sí/no por movimiento, con una media de 66 comidas por partida en tableros de 12x12 (máximo 101).

## Benchmarks y rendimiento

JevBench, conjunto público (231 elementos, commit 26eb72d de jevbench, adaptador `typesafe` contra el servidor de este repositorio, una H200, sin red):

| Nivel | Aciertos |
|---|---|
| standard (72, `original.jsonl`) | 66 |
| easy (48, `easy.jsonl`) | 47 |
| hard (111, `hard.jsonl`) | 63 |
| Total | 176 / 231 = 0.762 |

Métricas complementarias: Brier 0.328, ECE 0.065, latencia p50 27 ms, p95 60 ms por decisión, media de 590 tokens de entrada por decisión. El autor advierte de que la puntuación oficial de JevBench también emplea elementos sellados y que todos los sistemas listados puntúan bastante por debajo de su precisión pública en ese conjunto.

Comparativa de precisión pública en el panel de JevBench v1.4:

| Sistema | Precision publica |
|---|---|
| Jev 1.13.0 | 0.866 |
| Qwen3.5-4B (entradas) | 0.74 - 0.82 |
| K2-Type-1B | 0.762 |
| Gemma 4 E2B + LoRA (system-one-open) | 0.732 |
| decider-2b | 0.710 |
| kev 0.6B | 0.667 |
| kev 4B | 0.662 |

Suites de Kev (conjuntos dev/test congelados de jaredpalmer/kev, precisión en test):

| Modelo | Fuentes entrenadas | Fuentes nuevas |
|---|---|---|
| K2-Type-1B | 0.813 | 0.688 |
| Kev-0.8B (publicado) | 0.834 | 0.684 |

Snake: media de 66 comidas por partida en tableros de 12x12, con un máximo de 101.

## Requisitos de hardware

- VRAM estimada para los pesos: alrededor de 2,2 GB en FP16/BF16 (el repositorio ocupa 2,2 GB para 1.078 M de parámetros), aproximadamente 1,1 GB en INT8 y 0,55 GB en INT4. Hay que sumar el coste de activaciones y de la caché KV, más la cabeza pointer.
- El servidor oficial requiere una GPU CUDA. El autor no documenta ejecución en CPU ni versiones cuantizadas, por lo que en la práctica el despliegue estándar es en FP16 sobre GPU.
- GPU recomendadas: cabe holgadamente en GPUs de consumo con 8 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. Las medidas de referencia del autor se tomaron sobre una NVIDIA H200, pero el tamaño del modelo no exige hardware de centro de datos.
- Despliegue: el repositorio incluye su propio servidor (`python -m jev.serve --run . --port 8000`) con API HTTP compatible con TypeSafe `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el modelo no debe usarse con un pipeline de generación de texto estándar.
- Latencia: la primera petición tras el arranque tarda unos segundos (calentamiento de CUDA); las posteriores se sitúan entre 20 y 60 ms. En la medición con H200, p50 de 27 ms y p95 de 60 ms por decisión.
- Dependencias: `transformers >= 5.17` con código remoto y `torch 2.8` probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench publico | Kev (fuentes nuevas) | Licencia |
|---|---|---|---|---|---|
| K2-Type-1B | 1,078 M | no disponible (>8192 tokens debil) | 0.762 | 0.688 | apache-2.0 |
| Kev-0.8B | ~0,8 B (no confirmado) | no disponible | no disponible | 0.684 | no disponible |
| Jev 1.13.0 (TypeSafe) | no disponible | no disponible | 0.866 | no disponible | no disponible |
| Qwen3.5-4B (entradas) | ~4 B | no disponible | 0.74 - 0.82 | no disponible | no disponible |
| decider-2b | ~2 B (no confirmado) | no disponible | 0.710 | no disponible | no disponible |
| Gemma 4 E2B + LoRA (system-one-open) | no disponible | no disponible | 0.732 | no disponible | no disponible |

La comparación es parcial: solo K2-Type-1B y Kev-0.8B publican resultados en las suites de Kev, y solo K2-Type-1B declara licencia Apache 2.0 entre los sistemas listados. Los parámetros de la mayoría de alternativas no aparecen en la información disponible.

## Limitaciones y advertencias

- Una sola pasada sin razonamiento: la aritmética de varios pasos, el cálculo de diferencias entre fechas y los documentos muy largos (más de 8192 tokens) rinden mal.
- La calibración se ajustó sobre la suite de calibración de Kev; en otras distribuciones las probabilidades pueden ser demasiado confiadas o demasiado conservadoras. El ECE público en JevBench es 0.065.
- Las respuestas están acotadas por las opciones ofrecidas: el modelo no puede responder "ninguna de estas" salvo que se incluya esa opción explícitamente.
- No genera texto bajo ninguna circunstancia. Usar el backbone como modelo de lenguaje produce resultados sin sentido, porque la cabeza de lenguaje procede del modelo base y los pesos se entrenaron para la cabeza de decisión.
- Entrenado y evaluado únicamente en inglés; no hay soporte multilingüe declarado.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, social o de dominio en la información disponible.
- Riesgo de alucinación: al ser un modelo de decisión sobre opciones cerradas, el riesgo se traslada a una elección incorrecta con confianza alta en distribuciones alejadas de los datos de calibración.
- El código de entrenamiento y los datos no se han liberado, lo que impide auditar la composición real del corpus más allá de la verificación de solapamiento declarada por el autor.
- Repositorio con 303 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida de los resultados publicados.
- Licencia Apache 2.0, por lo que el uso comercial está permitido, pero no se ofrecen garantías sobre el rendimiento en dominios distintos de los evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chen11003/K2-Type-1B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- JevBench: https://github.com/fstandhartinger/jevbench
- Suites de Kev: https://github.com/jaredpalmer/kev
