# ikimyaii/Mamba-370M-unstructured-SparseGPT-90pct

## Resumen

Mamba-370M-unstructured-SparseGPT-90pct es un modelo de lenguaje basado en la arquitectura Mamba (state space model, SSM) al que se le ha aplicado una poda no estructurada del 90 % mediante SparseGPT en modo one-shot, es decir, sin reentrenamiento posterior. Lo publica el usuario ikimyaii en Hugging Face y parte del modelo oficial state-spaces/mamba-370m-hf. Su proposito no es ofrecer un modelo listo para produccion, sino servir como referencia (baseline) para experimentos de poda extrema en arquitecturas SSM, un terreno mucho menos explorado que el de los transformers.

El modelo conserva intactas las partes no lineales del bloque Mamba (conv1d, A_log, D y dt_proj) y aplica la poda unicamente a las capas lineales internas (in_proj, x_proj, out_proj), mientras que embeddings y lm_head permanecen densos. El resultado es un checkpoint de aproximadamente 423 millones de parametros almacenados (0,8 GB en safetensors) con una esparsidad efectiva medida de 0,8822 en las capas podadas.

Es relevante ahora porque la poda one-shot con SparseGPT se ha validado mayoritariamente sobre transformers, y este checkpoint aporta evidencia empirica del coste de aplicarla a un SSM sin reentrenamiento: la perplejidad se dispara a 1842,20 en WikiText-2 y 1035,29 en C4, lo que lo convierte en un punto de comparacion util para medir cuanto puede recuperarse con tecnicas posteriores de ajuste o reparacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM selectivo) |
| Parametros totales | 423.003.136 (safetensors; el modelo base se denomina 370M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mamba-370M-hf suele usar 2048; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (los pesos se podan y almacenan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,8822 medida en las capas podadas (objetivo 90 % no estructurado) |
| Modelo base | state-spaces/mamba-370m-hf |
| Metodo de poda | SparseGPT oficial (IST-DASLab/sparsegpt@147d215, fasterprune, blocksize 128, damping 0.01) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atencion por recurrencia lineal con parametros dependientes de la entrada. Sobre ese modelo base se aplica una poda no estructurada one-shot con el codigo oficial de SparseGPT: calibracion con 128 secuencias de C4 de 2048 tokens (seed 0), poda por bloques en orden con recalibracion sobre las salidas de los bloques ya podados, y una mascara con un unico umbral por bloque de 128 columnas, lo que produce filas con distinto numero de elementos no nulos.

Se podan todas las capas lineales internas del bloque (in_proj, x_proj, out_proj); dt_proj se mantiene denso (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que conv1d, A_log y D, ademas de embeddings y lm_head. Los pesos se podan en bfloat16 y el proceso completo tardo 3,0 minutos en una A100 de 40 GB. No hay reentrenamiento ni ajuste fino posterior, y no se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal alternativa, etc.).

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained(...)` con `transformers` estandar.
- Razonamiento y conocimiento general muy degradados: la accuracy zero-shot media es de 0,3229, con tareas cerca del azar (openbookqa 0,1180, arc_challenge 0,2031).
- Codigo y matematicas: no se documentan resultados especificos; el nivel general hace inviable un uso fiable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Capacidades especiales: ninguna; no hay modo thinking, vision ni audio.
- Uso previsto: referencia experimental para estudiar el impacto de la poda extrema en SSM.

## Casos de uso

- Baseline de investigacion en poda de SSM: sirve para comparar tecnicas de poda no estructurada aplicadas a Mamba frente a las ya validadas en transformers, usando sus perplejidades (1842,20 en WikiText-2, 1035,29 en C4) como punto de partida.
- Estudio de reparacion post-poda: al no haber reentrenamiento, permite medir cuanto recupera un ajuste fino breve o una destilacion sobre este checkpoint frente al modelo denso original.
- Analisis de desequilibrio de filas: con filas que tienen hasta 2,17 veces la media de no nulos (peor capa 4,30 veces), es util para investigar el impacto del sesgo de umbral por bloque en la calidad final.
- Evaluacion de protocolos de calibracion: reproduce el pipeline oficial de SparseGPT (128 secuencias C4, seed 0) y permite variar el conjunto de calibracion para estudiar su efecto en un SSM.
- Benchmarking de frameworks de inferencia dispersa: sirve para probar si kernels optimizados para sparsity no estructurada aprovechan realmente la mascara generada por SparseGPT en Mamba.
- Docencia y divulgacion: ejemplo reproducible y de bajo coste (3 minutos en A100) para explicar los limites de la poda one-shot extrema sin reentrenamiento.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluacion de ELSA, en bfloat16 porque Mamba desborda en fp16):

| Metrica | Este modelo |
|---|---|
| WikiText-2 (perplejidad) | 1842,20 |
| C4 (perplejidad) | 1035,29 |

Accuracy zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2031 |
| arc_easy | 0,2774 |
| boolq | 0,3783 |
| hellaswag | 0,2614 |
| openbookqa | 0,1180 |
| rte | 0,5271 |
| winogrande | 0,4949 |
| Media | 0,3229 |

No se han publicado en la informacion disponible los resultados del modelo base denso ni de alternativas, por lo que no se incluye comparacion numerica directa.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint safetensors ocupa 0,8 GB en bfloat16; en la practica se necesita algo mas por estados de activacion y cache, pero cabe holgadamente en cualquier GPU consumer moderna (8 GB o mas).
- GPU recomendadas: cualquier GPU con soporte bfloat16; el autor uso una A100 40GB para la poda (3,0 minutos), pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, en RTX 3060/4060 (8 GB), RTX 4070/4080 y superiores.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (metodo indicado por el autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al ser pesos densos con mascara implicita, la sparsity no se aprovecha sin kernels especificos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M, 90 % SparseGPT) | 423 M | no disponible | 1842,20 | no disponible | Hugging Face (0 descargas) |
| state-spaces/mamba-370m-hf (base denso) | ~370 M | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| Alternativas de poda en transformers (p. ej. SparseGPT sobre LLaMA/OPT) | variable | variable | no disponible | variable | Hugging Face / repos oficiales |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 1842,20 en WikiText-2 y accuracy media de 0,3229; no es apto para uso en produccion ni para tareas reales de generacion.
- Alucinacion practicamente garantizada: con este nivel de perplejidad, las salidas son en gran medida incoherentes.
- Poda sin reentrenamiento: no hay ajuste fino ni reparacion posterior, por lo que el dano es el maximo esperable del metodo one-shot.
- Desequilibrio de filas: la mascara por bloques de 128 columnas deja filas con hasta 2,17 veces la media de no nulos (4,30 en la peor capa), lo que puede afectar a la reproducibilidad de experimentos.
- Esparsidad efectiva inferior al objetivo: 0,8822 medida frente al 90 % nominal.
- Licencia no declarada: no se especifican condiciones de uso comercial; conviene consultar la licencia del modelo base state-spaces/mamba-370m-hf antes de cualquier uso.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en ningun otro idioma.
- Sin soporte documentado de cuantizacion ni de frameworks de inferencia optimizados para sparsity.
- Modelo con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Paper de SparseGPT: https://arxiv.org/abs/2301.00774
- Paper de Mamba: https://arxiv.org/abs/2312.00752
