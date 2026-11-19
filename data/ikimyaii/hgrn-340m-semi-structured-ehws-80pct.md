# ikimyaii/HGRN-340M-semi-structured-EHWS-80pct

## Resumen

HGRN-340M-semi-structured-EHWS-80pct es una variante podada del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer de tipo HGRN (Hierarchically Gated Recurrent Network) con 341.148.672 parametros. Lo publica el usuario ikimyaii en Hugging Face y aplica una poda semi-estructurada del 80 % sobre todas las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos. El objetivo es obtener un modelo mucho mas eficiente en memoria y computo por fila, con patrones de sparsity balanceados que permiten aceleracion por hardware.

La relevancia tecnica esta en el metodo de poda: una primera fase local estilo ALPS que reduce cada capa al 70 %, seguida de una fase global con ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento, hasta alcanzar el 80 %. El resultado es un checkpoint que conserva la arquitectura HGRN original pero con solo el 20 % de los pesos en cada capa lineal podada, y con el mismo numero de no ceros por fila, lo que garantiza equilibrio de trabajo por fila.

El modelo es de investigacion: no se declaran licencia, idiomas ni pipeline, y las metricas publicadas muestran una degradacion notable frente al modelo denso (perplejidad en WikiText-2 de 52,31 frente a 21,96). Es util como referencia para estudiar tecnicas de poda semi-estructurada y para experimentar con inferencia eficiente en arquitecturas recurrentes con compuertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), transformer recurrente con compuertas jerarquicas |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor evalua en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint base m-a-p/340M-20B-HGRN-pure-baseline, un modelo recurrente con compuertas jerarquicas entrenado sobre 20B tokens segun el nombre del checkpoint base. Sobre esa base se aplica una poda semi-estructurada en dos fases. La fase 1 es local, estilo ALPS: poda cada capa al 70 % minimizando el error de reconstruccion ||(W - W0) X||^2, con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La fase 2 es global: ADMM sobre la perdida de entropia cruzada mas destilacion de conocimiento, con paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0. La fase 2 lleva la poda hasta el 80 % final.

Los datos de calibracion y entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizer del modelo base (fla-hub_hgrn-1.3B-100B) y vistas una sola vez. El run completo, incluyendo evaluacion, tardo 2,18 horas en una A100 de 40 GB. La sparsity resultante medida sobre los pesos es 0,7999, y se verifico que las 168 capas podadas tienen el mismo numero de no ceros por fila. Embeddings y lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM` (requiere `flash-linear-attention` instalado, `import fla`).
- Razonamiento basico y respuesta a tareas de conocimiento general, aunque con degradacion medible frente al modelo denso.
- Capacidad multilingue: no disponible (no se declara).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modos especiales (thinking mode): no disponible.
- Inferencia con sparsity semi-estructurada por fila, con equilibrio de trabajo garantizado por fila.

## Casos de uso

- Investigacion sobre poda semi-estructurada: sirve como checkpoint de referencia para reproducir el pipeline EHWS de dos fases ADMM y comparar la degradacion de perplejidad y accuracy frente al denso.
- Experimentos de inferencia eficiente en hardware: al tener el mismo numero de no ceros por fila en las 168 capas podadas, permite probar kernels y aceleradores que explotan sparsity balanceada sin desequilibrio de carga.
- Estudio de destilacion de conocimiento en modelos recurrentes: el uso de KD en la fase 2 global es un caso concreto para analizar como se transfiere el comportamiento del modelo denso al podado.
- Benchmarking de robustez a la compresion: util para medir la caida de accuracy zero-shot en tareas como arc_challenge, hellaswag u openbookqa tras una poda agresiva al 80 %.
- Prototipado de modelos pequenos en entornos con VRAM limitada: con 341M parametros y pesos safetensors en fp16, el checkpoint ocupa alrededor de 0,7 GB, lo que permite cargarlo en GPUs de consumo para pruebas.
- Docencia y divulgacion: ejemplo reproducible de un run completo de poda documentado con `results.json`, configuracion y tiempos, adecuado para explicar ADMM y sparsity semi-estructurada.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16), run unico:

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 21,96 | 52,31 |
| C4 | 21,94 | 36,79 |

Accuracy zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,1809 |
| arc_easy | 0,6153 | 0,4238 |
| boolq | 0,6028 | 0,5627 |
| hellaswag | 0,3423 | 0,2852 |
| openbookqa | 0,2380 | 0,1480 |
| rte | 0,5126 | 0,5307 |
| winogrande | 0,5059 | 0,5178 |
| Media | 0,4400 | 0,3784 |

Sparsity medida sobre los pesos: 0,7999. Las 168 capas podadas tienen el mismo numero de no ceros por fila.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,7 GB en fp16 para los pesos (341M parametros); en fp32, unos 1,4 GB. La VRAM real de inferencia depende de la longitud de contexto y del batch, no disponible.
- GPU recomendadas: el autor entreno y evaluo en una A100 de 40 GB, pero el modelo es lo bastante pequeno para GPUs de consumo.
- Cabe en GPU de consumo: si, por tamano de pesos (por ejemplo, RTX 3060, RTX 4090); no se han publicado mediciones especificas.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El run de poda completo tardo 2,18 horas en una A100 40 GB, pero no se reportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Sparsity | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| HGRN-340M-semi-structured-EHWS-80pct | 341.148.672 | no disponible | no disponible | 80 % semi-estructurada | 52,31 |
| m-a-p/340M-20B-HGRN-pure-baseline (denso) | 340M aprox. | no disponible | no disponible | 0 % | 21,96 |
| Otros modelos podados de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradacion clara frente al modelo denso: la perplejidad en WikiText-2 pasa de 21,96 a 52,31 y la media zero-shot cae de 0,4400 a 0,3784.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Sesgos conocidos: no documentados, pero hereda los del modelo base y los datos C4 usados en calibracion.
- Riesgo de alucinacion: no evaluado; en un modelo de 340M podado al 80 % es esperable un comportamiento generativo limitado.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas sin verificacion empirica.
- Resultados de un solo run: el autor indica run unico, sin intervalos de confianza ni repeticiones.
- Requiere `flash-linear-attention` para cargar el modelo; sin esa dependencia la carga con `AutoModelForCausalLM` puede fallar.
- Sin pesos GGUF ni soporte documentado en motores de inferencia populares, lo que limita su despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-semi-structured-EHWS-80pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Repositorio flash-linear-attention (dependencia de carga): no disponible en la informacion proporcionada
- Paper o blog del metodo EHWS/ADMM: no disponible en la informacion proporcionada
- Codigo oficial de ELSA (protocolo de evaluacion y calibracion): no disponible en la informacion proporcionada
