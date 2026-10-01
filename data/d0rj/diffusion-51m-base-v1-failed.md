# d0rj/diffusion-51M-base-v1-failed

## Resumen

El modelo `d0rj/diffusion-51M-base-v1-failed` es un modelo de lenguaje de difusion enmascarada (masked diffusion LM), desarrollado por el usuario d0rj como parte de un experimento de ablacion denominado "tiny-llm-ablation". Con 51.392.544 parametros almacenados, esta pensado para comparar arquitecturas de difusion de texto frente a alternativas autorregresivas o de otro tipo a escala reducida. El propio nombre del repositorio incluye la etiqueta `failed-ablation`, lo que indica que el autor lo publica como un resultado experimental fallido.

El modelo se presenta bajo la libreria `transformers` con la tarea `fill-mask`, entrenado desde cero (`from-scratch`) sobre el dataset `HuggingFaceFW/fineweb-edu` y con soporte unicamente para ingles. No dispone de licencia declarada ni de cuantizaciones alternativas, y no registra descargas ni interacciones en el momento de la ficha. Su relevancia es fundamentalmente documental: sirve como punto de comparacion negativo dentro de la ablacion del autor, frente a la version v2 entrenada con exito (`d0rj/diffusion-51M-base`) y frente al modelo hermano `d0rj/q-51M-base`.

Los resultados publicados en su model-index refuerzan la condicion de fallo: en la mayoria de las tareas de comprension, la metrica de pseudo-log-verosimilitud normalizada se situa en el entorno del azar (HellaSwag 0.26, ARC-Easy 0.27, OpenBookQA 0.26) o por debajo (BoolQ 0.38, ARC-Challenge 0.24), y en LAMBADA OpenAI el valor es 0.0. Es, por tanto, un artefacto de investigacion para analizar que configuraciones de difusion enmascarada no convergen correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion enmascarada (etiqueta `diffusion_lm`); detalles internos no disponibles |
| Parametros totales | 51.392.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluacion realizada con max_length 2048) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tarea (pipeline) | fill-mask |
| Codigo personalizado | Si (`custom_code`) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |

## Arquitectura y entrenamiento

La unica indicacion disponible sobre la arquitectura es la etiqueta `diffusion_lm`, que situa al modelo en la familia de modelos de difusion aplicados a texto, habitualmente formulados como denoising de tokens enmascarados sobre una red transformer con atencion no causal. El pipeline declarado es `fill-mask`, coherente con ese paradigma de reconstruccion de tokens enmascarados en lugar de generacion autorregresiva token a token. No se detallan en la informacion disponible el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni el esquema de horarios de ruido (noise schedule).

El modelo se entrena desde cero (`from-scratch`) sobre `HuggingFaceFW/fineweb-edu`. En la informacion recuperada no se especifican para esta version concreta el numero de tokens procesados, la composicion exacta del dataset ni si se aplicaron fases de RLHF, DPO u otro ajuste posterior. Como referencia del mismo experimento, el checkpoint entrenado con exito del autor (`d0rj/diffusion-51M-base`) declara 51.392.512 parametros almacenados, 50.867.200 parametros optimizados y 3.932.160.000 tokens fuente procesados, mientras que `d0rj/q-51M-base` declara 50.878.208 parametros y 15.000 pasos de optimizador sobre el mismo volumen de tokens. Estos datos corresponden a modelos hermanos, no se confirman para la variante `v1-failed`.

## Capacidades

- Relleno de mascaras (fill-mask) sobre texto en ingles, condicionado al contexto circundante.
- Puntuacion de continuaciones mediante pseudo-log-verosimilitud (protocolo PLL), tal como refleja su model-index.
- Evaluacion experimental de protocolos de comparacion (`experimental-pll`) para tareas de eleccion multiple.
- Entrenamiento desde cero sobre corpus educativo (`fineweb-edu`), sin ajuste por instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de generacion de codigo, matematicas fiables, vision ni audio.
- Cobertura multilingue: no disponible (solo ingles).
- No dispone de modo "thinking" ni de plantillas de chat.

## Casos de uso

- Analisis de ablaciones de difusion de texto: el modelo permite estudiar por que una configuracion de difusion enmascarada no converge frente a la variante exitosa `d0rj/diffusion-51M-base`.
- Punto de comparacion negativo en experimentos academicos: util como referencia de "modelo fallido" al medir una nueva tecnica de entrenamiento o un nuevo schedule de ruido.
- Validacion de protocolos de evaluacion PLL: sirve para comprobar que una implementacion de pseudo-log-verosimilitud detecta correctamente modelos degenerados (por ejemplo, el 0.0 en LAMBADA OpenAI).
- Docencia e investigacion educativa: caso practico de modelo de difusion de texto de 51M parametros que cabe en cualquier maquina y sirve para ilustrar el paradigma de denoising enmascarado.
- Reproducibilidad de experimentos fallidos: registro publico que permite a otros autores evitar configuraciones concretas y documentar el modo de fallo.
- Pruebas de infraestructura de evaluacion: al ser un modelo pequeno con resultados conocidos, es util para validar pipelines de evaluacion (carga safetensors, gestion de `custom_code`, metricas PLL) antes de ejecutar modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (dtype bfloat16, 0-shot, protocolo "full comparison protocol"). En tareas de eleccion multiple de cuatro opciones el azar se situa en 0.25 y en tareas binarias en 0.50.

| Dataset | Split | Metrica | Valor | Error estandar |
|---|---|---|---|---|
| HellaSwag | validation | pll_acc_norm | 0.2597 | 0.0044 |
| ARC-Easy | test | pll_acc_norm | 0.2668 | 0.0091 |
| ARC-Challenge | test | pll_acc_norm | 0.2406 | 0.0125 |
| PIQA | validation | pll_acc_norm | 0.5005 | 0.0117 |
| WinoGrande (winogrande_xl) | validation | pll_acc | 0.5099 | 0.0140 |
| OpenBookQA | test | pll_acc_norm | 0.2580 | 0.0196 |
| BoolQ | validation | pll_acc | 0.3783 | 0.0085 |
| LAMBADA OpenAI | test | pll_acc | 0.0000 | 0.0000 |
| ArithMark-3 | train | pll_acc_norm | 0.2990 | 0.0145 |

No se han publicado en la informacion disponible resultados comparativos adicionales (MMLU, GSM8K, HumanEval, etc.) ni verificacion independiente de estas cifras (todas figuran como `verified: false`).

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,2 GB en FP32 (~205 MB de pesos), ~0,1 GB en BF16/FP16 y ~50 MB en int8; alrededor de 25 MB en int4.
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100. Incluso una GTX 1050 o una iGPU con suficiente memoria compartida pueden ejecutarlo.
- Compatible con CPU: si, la inferencia y el relleno de mascaras pueden ejecutarse en CPU sin problemas de latencia significativos para un modelo de este tamano.
- Cabe en GPU consumer: si, en la practica totalidad de ellas (RTX 3060, RTX 4090, etc.), con margen amplio.
- Opciones de despliegue: transformers (libreria declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al requerir `custom_code` es previsible que solo funcione mediante `trust_remote_code=True` en transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera una latencia muy baja y un throughput alto, aunque el modo de generacion por difusion puede implicar multiples pasos de denoising.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| d0rj/diffusion-51M-base-v1-failed | 51.392.544 | No disponible (eval. 2048) | No disponible | Ablacion fallida | Objeto de esta ficha; resultados cercanos al azar |
| d0rj/diffusion-51M-base | 51.392.512 almacenados / 50.867.200 optimizados | No disponible | No disponible | Checkpoint v2 exitoso | 3.932.160.000 tokens fuente procesados |
| d0rj/q-51M-base | 50.878.208 | No disponible | No disponible | Modelo base del mismo experimento | 15.000 pasos de optimizador sobre los mismos tokens |

No se dispone de benchmarks publicados de las variantes exitosa y `q-51M-base` en la informacion proporcionada, por lo que la comparacion de rendimiento entre ellas no puede establecerse aqui.

## Limitaciones y advertencias

- El propio autor etiqueta el modelo como `failed-ablation`: es un artefacto experimental sin garantia de utilidad practica.
- Rendimiento degenerado documentado: LAMBADA OpenAI con pll_acc 0.0 y resultados cercanos o por debajo del azar en HellaSwag, ARC, PIQA, WinoGrande, OpenBookQA y BoolQ.
- Alto riesgo de salidas incoherentes y de alucinacion, especialmente en generacion de texto libre.
- Licencia no declarada: no se puede asumir uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Requiere `custom_code` (posible necesidad de `trust_remote_code=True`), lo que implica ejecutar codigo del repositorio y anade riesgo de seguridad en produccion.
- Longitud de contexto no documentada para entrenamiento; la evaluacion se hizo a 2048 tokens, pero no se garantiza calidad a esa longitud.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni integracion probada con vLLM, llama.cpp u Ollama.
- No apto para produccion: no se debe desplegar en atencion al cliente, generacion de codigo, agentes ni pipelines criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/d0rj/diffusion-51M-base-v1-failed
- Version v2 entrenada con exito: https://huggingface.co/d0rj/diffusion-51M-base
- Modelo hermano autorregresivo/base del experimento: https://huggingface.co/d0rj/q-51M-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
