# ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-70pct

## Resumen

GatedDeltaNet-1.3B-unstructured-SparseGPT-70pct es una variante podada del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de compresion one-shot mediante la tecnica SparseGPT, aplicada con el codigo oficial del repositorio IST-DASLab/sparsegpt, que introduce una esparsidad no estructurada del 70 % en todas las capas lineales internas de los bloques, manteniendo densas las embeddings y la lm_head.

El modelo conserva la arquitectura original GatedDeltaNet, una variante de atencion lineal con compuertas derivada de DeltaNet y del linaje de modelos de estado recurrente, con aproximadamente 1.466 millones de parametros totales. Su relevancia es fundamentalmente metodologica: sirve como linea base de comparacion para otros modelos del mismo autor (los denominados EHWS) y demuestra el coste en calidad de aplicar SparseGPT sin reentrenamiento posterior sobre una arquitectura no estandar.

No es un modelo pensado para produccion: la perplexity se degrada de 10,31 a 31,55 en WikiText-2 y de 13,76 a 35,09 en C4, y la precision zero-shot media cae de 0,5123 a 0,4134. Su interes es experimental, para estudiar el comportamiento de la poda no estructurada en modelos de atencion lineal y como referencia para investigaciones sobre compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atencion lineal con compuertas, linaje DeltaNet) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es m-a-p/1.3B-100B-GatedDeltaNet-pure, un transformer con atencion lineal del tipo GatedDeltaNet, entrenado presumiblemente sobre 100.000 millones de tokens (segun el nombre del checkpoint). La arquitectura GatedDeltaNet combina mecanismos de estado recurrente con compuertas de olvido, lo que permite inferencia con coste lineal en la longitud de secuencia en lugar del coste cuadratico de la atencion estandar. El modelo podado mantiene esa estructura intacta: solo se modifican los pesos de las capas lineales.

El proceso de poda se realizo en una sola pasada (one-shot) sin reentrenamiento, empleando el codigo oficial de SparseGPT en su commit 147d215, con el driver `fasterprune`, blocksize 128 y damping 0,01. La calibracion uso 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, calibrando cada uno sobre las salidas de los bloques ya podados. La poda se ejecuto en bfloat16 y tardo 4,1 minutos en una A100 de 40 GB. El resultado es una esparsidad medida de 0,7000 en las 240 capas podadas, con mascaras no balanceadas por filas: la fila mas densa tiene en promedio 1,66 veces los no-cero de la media (peor capa: 2,82 veces), porque el umbral se aplica por bloque de 128 columnas.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base.
- Razonamiento basico y respuesta a preguntas, con calidad notablemente degradada tras la poda.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Requiere `flash-linear-attention` instalado (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Linea base de investigacion en compresion: sirve para comparar el impacto de SparseGPT frente a otras tecnicas de poda (los modelos EHWS del mismo autor) sobre una arquitectura de atencion lineal, midiendo perplexity y precision zero-shot con protocolos estandarizados (ELSA, lm-evaluation-harness).
- Estudio de esparsidad no estructurada en atencion lineal: permite analizar como afecta una mascara por bloques de 128 columnas con filas desbalanceadas al rendimiento de GatedDeltaNet, algo poco documentado frente a transformers clasicos.
- Experimentos de destilacion o recuperacion: al ser un checkpoint podado sin reentrenamiento, es un punto de partida para estudiar tecnicas de recuperacion de calidad (fine-tuning ligero, LoRA) sobre pesos esparsos.
- Evaluacion de kernels de inferencia dispersa: util para probar librerias que explotan esparsidad no estructurada y medir el speedup real frente al modelo denso en A100/H100.
- Docencia y reproduccion de resultados: el pipeline esta documentado (codigo oficial, calibracion, semilla), lo que facilita reproducir el experimento en un unico A100 de 40 GB en pocos minutos.
- Benchmarking de robustez: con caidas de hasta 0,24 puntos en arc_easy, sirve para estudiar que tareas son mas sensibles a la poda agresiva en modelos pequenos de atencion lineal.

## Benchmarks y rendimiento

Perplexity (protocolo ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (70 % sparsity) | 31,55 | 35,09 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,2108 |
| arc_easy | 0,7222 | 0,4874 |
| boolq | 0,6159 | 0,6211 |
| hellaswag | 0,4629 | 0,3256 |
| openbookqa | 0,2920 | 0,1780 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5438 |
| Media | 0,5123 | 0,4134 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,9 GB solo de pesos, mas overhead de activaciones y cache; en la practica unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,5-2 GB; en 4 bits, en torno a 1-1,5 GB (no se publican GGUF oficiales, la cuantizacion requeriria conversion propia).
- GPU recomendadas: A100 40 GB (usada para la poda), H100, o cualquier GPU consumer con al menos 8 GB (RTX 3060 Ti, RTX 4060, RTX 4090).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, siempre que se instale `flash-linear-attention`.
- Opciones de despliegue: `transformers` con `flash-linear-attention`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura GatedDeltaNet puede no estar soportada por esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (70 % sparsity) | 1,47 B | no disponible | 31,55 | no disponible | Hugging Face |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | ~1,3 B | no disponible | 10,31 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa directa mas relevante es contra el modelo base denso, del que este checkpoint es una version podada. No se dispone de datos de otros modelos de atencion lineal de tamano similar (p. ej. variantes de Mamba o RWKV) en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplexity se multiplica por 3 en WikiText-2 y por 2,5 en C4; la precision media zero-shot cae casi 10 puntos.
- Poda sin reentrenamiento: no hay recuperacion de calidad; el modelo es una linea base, no un modelo afinado para uso real.
- Mascara desbalanceada: la fila mas densa tiene 1,66 veces los no-cero de la media (hasta 2,82 en la peor capa), lo que complica la explotacion eficiente de la esparsidad.
- Dependencia de `flash-linear-attention`: sin esa libreria el modelo no se carga correctamente.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base.
- Idiomas no documentados: no se puede garantizar soporte multilingue.
- Riesgo de alucinacion: previsiblemente mayor que en el modelo denso dada la caida de precision en tareas de razonamiento.
- No apto para produccion sin evaluacion adicional: los numeros publicados corresponden a un unico protocolo de evaluacion y a un unico conjunto de calibracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
