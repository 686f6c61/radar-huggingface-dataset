# ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-70pct

## Resumen

GatedDeltaNet-340M-unstructured-SparseGPT-70pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de compresion one-shot mediante SparseGPT, que aplica una mascara de poda no estructurada del 70% sobre todas las capas lineales internas de los bloques del transformer hibrido, manteniendo densas las embeddings y la cabeza de lenguaje. El resultado es un checkpoint de 399,5 millones de parametros almacenados (de los cuales solo el 30% de los pesos de las capas podadas son distintos de cero) que sirve como linea base para comparar otras tecnicas de poda desarrolladas por el mismo autor.

El interes tecnico del artefacto no reside en su calidad final, sino en su valor como referencia reproducible: documenta de forma explicita el protocolo de calibracion (128 secuencias de C4 de 2.048 tokens), la herramienta empleada (codigo oficial de IST-DASLab, commit 147d215, modo `fasterprune`, blocksize 128, damping 0.01) y el coste computacional del proceso (2,5 minutos en una A100 de 40 GB). La degradacion medida es sustancial: la perplejidad en WikiText-2 pasa de 16,42 a 60,77 y la media de zero-shot en lm-evaluation-harness cae de 0,4373 a 0,3836.

La relevancia actual es doble. Por un lado, aporta evidencia empirica sobre como la poda no estructurada agresiva sin reentrenamiento afecta a arquitecturas basadas en Gated DeltaNet, un tipo de modelo de estado recurrente con atencion lineal que gana traccion como alternativa eficiente a los transformers clasicos. Por otro, expone una limitacion conocida de SparseGPT: al usar un unico umbral por bloque de 128 columnas, las filas quedan desbalanceadas (la fila mas densa tiene de media 1,69 veces los no-cero de la media, y hasta 2,80 en la peor capa), lo que complica el aprovechamiento real del sparse en hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (modelo de estado recurrente con atencion lineal con compuerta), base m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Parametros totales | 399.531.200 (segun safetensors); 340M nominales en el nombre del modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base se entreno con secuencias de 20B tokens; la calibracion uso 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, un modelo de aproximadamente 340 millones de parametros entrenado sobre 20.000 millones de tokens con Gated DeltaNet, una variante de attention lineal con compuerta delta que sustituye la atencion softmax por una recurrencia con estado matricial. Sobre esa base, el autor aplica una poda no estructurada one-shot con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt@147d215) en modo `fasterprune`, con blocksize 128 y damping 0,01. No hay reentrenamiento ni destilacion posterior: el checkpoint es el resultado directo del pruning.

El procedimiento de calibracion usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, replicando el comportamiento de los drivers oficiales. El autor senala que el recorrido de capas es codigo nuevo (los drivers oficiales solo soportan OPT y LLaMA), mientras que la matematica de poda es la del repositorio original. Los pesos se podan en bfloat16 y el proceso completo tarda 2,5 minutos en una A100 de 40 GB. La mascara resultante aplica un umbral por bloque de 128 columnas, de modo que cada fila acaba con un numero distinto de no-cero; la esparsidad medida sobre los pesos finales es de 0,7000 exactos en las capas podadas.

## Capacidades

- Generacion de texto autoregresiva en el mismo dominio que el modelo base, sujeta a la degradacion medida por la poda.
- Razonamiento basico y respuesta a preguntas de opcion multiple (arc, hellaswag, openbookqa), con caida notable respecto al denso.
- Inferencia de sentido comun y resolucion de correferencia (winogrande, boolq, rte), donde la degradacion es menor e incluso hay mejoras marginales en boolq, rte y winogrande.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Linea base para investigacion en poda: sirve como referencia cuantitativa contra la que comparar tecnicas de poda alternativas (por ejemplo, las EHWS del mismo autor) sobre Gated DeltaNet, usando la perplejidad en WikiText-2 y C4 y la media zero-shot como metricas de control.
- Estudio de esparsidad no estructurada en hardware: permite medir como afecta el desbalanceo de filas (hasta 2,80x la media en la peor capa) al rendimiento real en kernels sparse, ya que la mascara no es uniforme por fila.
- Reproduccion de experimentos: el protocolo esta documentado con suficiente detalle (commit, blocksize, damping, semilla, dataset de calibracion) para replicar el pruning sobre el mismo checkpoint base y verificar la perplejidad reportada.
- Analisis de degradacion por tipo de tarea: la tabla de lm-evaluation-harness permite estudiar que familias de tareas (arc_easy cae de 0,6023 a 0,3952; boolq sube de 0,5985 a 0,6217) son mas sensibles a la poda agresiva sin reentrenamiento.
- Docencia y divulgacion: ejemplo compacto (0,8 GB) y rapido de ejecutar para ilustrar el compromiso entre compresion y calidad en modelos de estado recurrente.
- Punto de partida para destilacion o recuperacion: al ser un checkpoint podado y sin reentrenar, puede servir como inicializacion para pipelines de recuperacion de rendimiento (fine-tuning sobre la mascara fija) en investigacion academica.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (70% sparse) | 60,77 | 60,03 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1894 |
| arc_easy | 0,6023 | 0,3952 |
| boolq | 0,5985 | 0,6217 |
| hellaswag | 0,3461 | 0,2894 |
| openbookqa | 0,2300 | 0,1420 |
| rte | 0,5162 | 0,5307 |
| winogrande | 0,5036 | 0,5170 |
| Media | 0,4373 | 0,3836 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,8 GB para los pesos (399,5 M de parametros) mas overhead de activaciones y cache de estado recurrente; en la practica, menos de 2 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; una A100 40 GB fue suficiente para el pruning en 2,5 minutos, y para inferencia basta una RTX 3060 o superior.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en CPU con suficiente RAM.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la esparsidad no estructurada probablemente no se aproveche en esos runtimes sin kernels especificos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (70% sparse) | 399,5 M | no disponible | 60,77 | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ~340 M | no disponible | 16,42 | no disponible | Hugging Face |
| Otras variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa directa con modelos de la misma categoria (otros Gated DeltaNet podados o modelos densos de ~340 M) queda limitada por la ausencia de datos publicos sobre las alternativas EHWS y sobre la licencia del checkpoint base.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 se multiplica por 3,7 (de 16,42 a 60,77) y la media zero-shot cae 5,4 puntos porcentuales; no es un modelo apto para produccion sin recuperacion posterior.
- Perdida especialmente acusada en tareas de razonamiento y conocimiento (arc_easy cae 20,7 puntos, openbookqa 8,8 puntos, hellaswag 5,7 puntos).
- Mascara no balanceada por fila: el umbral unico por bloque de 128 columnas produce filas con hasta 2,80x los no-cero de la media, lo que limita el speedup real en hardware sparse y complica el despliegue eficiente.
- Sin reentrenamiento: el checkpoint no ha pasado por fine-tuning ni destilacion tras la poda, por lo que conserva los sesgos y las alucinaciones del modelo base sin mitigacion adicional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline antes de cualquier uso productivo.
- Idiomas soportados no documentados: se desconoce la cobertura multilingue y el comportamiento fuera del ingles.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`; sin esa libreria el modelo no se instancia correctamente.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de uso comunitario ni de validacion independiente de los resultados reportados.
- Contexto maximo no documentado: aunque la calibracion uso secuencias de 2.048 tokens, no se especifica la ventana de contexto efectiva del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Biblioteca flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada.
