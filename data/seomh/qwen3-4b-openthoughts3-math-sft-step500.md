# seomh/Qwen3-4B-OpenThoughts3-Math-SFT-step500

## Resumen

`seomh/Qwen3-4B-OpenThoughts3-Math-SFT-step500` es un checkpoint experimental de ajuste fino supervisado (SFT) de `Qwen/Qwen3-4B` sobre la porcion de matematicas del dataset `open-thoughts/OpenThoughts3-1.2M`. Lo publica el usuario seomh en HuggingFace y corresponde exactamente al paso global 500 de un entrenamiento que se detuvo en ese punto, por lo que no es un modelo final sino una instantanea intermedia de un proceso de investigacion.

El interes del modelo reside en su formato de entrenamiento: se uso el objetivo "open", en el que el bloque de razonamiento nativo de Qwen3 se deja vacio y las trazas de razonamiento de OpenThoughts3, junto con la respuesta final en formato boxed, se entrenan en el canal de respuesta visible. Es decir, el modelo aprende a producir cadenas de razonamiento matematico sin depender del modo thinking del tokenizer, un planteamiento util para estudiar SFT y destilacion on-policy.

Con 4.022.468.096 parametros (medidos sobre los pesos safetensors), arquitectura densa de la familia Qwen3, licencia Apache 2.0 y entrenamiento en ingles sobre 103.760 ejemplos filtrados, se trata de una pieza de investigacion reproducible mas que de un modelo de produccion. El autor declara explicitamente que no ha anadido evaluacion AIME a la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (el fine-tuning no modifica la arquitectura del modelo base) |
| Parametros totales | 4.022.468.096 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de secuencia configurada durante el entrenamiento SFT); no se documenta extension adicional en la model card |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en precision completa (bfloat16); no se incluyen versiones GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Modelo base | Qwen/Qwen3-4B |
| Dataset de entrenamiento | open-thoughts/OpenThoughts3-1.2M (porcion de matematicas, 103.760 ejemplos) |
| Checkpoint | global_step_500 (el entrenamiento se detuvo en este paso) |
| Tamano del repositorio | 8,1 GB |
| Pipeline | text-generation |
| Etiquetas relevantes | qwen3, math, reasoning, sft, openthoughts3, endpoints_compatible, text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3-4B`: un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. Este checkpoint no introduce cambios estructurales; es el resultado de un ajuste fino de parametros completos (full-parameter SFT) sobre los pesos del modelo base. El entrenamiento se realizo con precision bfloat16 en 4 GPU con `sequence parallel size = 4`, tamano de batch global 256 y micro-batch 1 por GPU con batching dinamico, longitud maxima de secuencia de 32.768 tokens, optimizador AdamW con learning rate 5e-6, scheduler coseno con 3% de warmup, weight decay 0.01 y gradient clipping 1.0.

El dato mas relevante del proceso es la construccion del dataset y el formato objetivo. De OpenThoughts3 se tomaron 103.760 ejemplos del subconjunto de matematicas, reteniendo unicamente respuestas completas que contenian un bloque de razonamiento cerrado y una respuesta final en formato boxed. Se empleo el formato "open": el bloque de pensamiento de Qwen3 se deja vacio durante el entrenamiento y tanto el razonamiento de origen como la respuesta final se colocan en el canal de respuesta visible. El autor advierte que este filtrado sesga la distribucion de dificultad, ya que las preguntas cuyas soluciones muestreadas agotaban repetidamente el limite de generacion de origen estan infrarrepresentadas; los resultados deben interpretarse, por tanto, como entrenamiento sobre el subconjunto de respuestas completas y no sobre la distribucion completa de matematicas sin filtrar.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo esta especializado en resolver problemas de matematicas produciendo una traza de razonamiento explicita seguida de una respuesta final en formato boxed.
- Razonamiento en canal visible: al haberse entrenado con el formato "open", la cadena de razonamiento aparece en la respuesta visible en lugar de en el bloque de pensamiento nativo, lo que simplifica su inspeccion y su uso en pipelines que no soportan el modo thinking.
- Modo no-thinking: la model card recomienda renderizar los prompts con `enable_thinking=False` cuando el stack de inferencia lo permita, para reproducir el comportamiento visto en entrenamiento.
- Generacion conversacional: el modelo se publica con pipeline `text-generation` y etiqueta `conversational`, y se apoya en el tokenizer y la plantilla de chat incluidos en el repositorio.
- Idiomas: entrenado exclusivamente en ingles; no se declara soporte multilingue.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas como tales, aunque el modelo produce trazas de razonamiento extensas en el dominio matematico.
- Vision, audio u otras modalidades: no disponibles.
- Destilacion on-policy y experimentacion con SFT: uso declarado explicitamente por el autor.

## Casos de uso

- Investigacion sobre SFT y destilacion on-policy: el checkpoint permite estudiar como evoluciona el comportamiento de un modelo de 4B al entrenar trazas de razonamiento de OpenThoughts3 en el canal visible, comparando el paso 500 con otros pasos o con el modelo base.
- Generacion de soluciones matematicas paso a paso: util para producir demostraciones con razonamiento explicito y respuesta final verificable en formato boxed, aprovechando los 32.768 tokens de secuencia maxima para problemas largos.
- Construccion de datasets sinteticos de matematicas: el modelo puede generar trazas de razonamiento que despues se filtran y curan para alimentar futuros entrenamientos, un flujo habitual en destilacion.
- Evaluacion comparativa de formatos de razonamiento: al usar el formato "open" con el bloque thinking vacio, sirve para medir diferencias de rendimiento frente a checkpoints que mantienen el razonamiento en el canal oculto.
- Prototipado de tutores matematicos en ingles: con la plantilla de chat del repositorio se puede desplegar un asistente que explique el procedimiento completo, no solo el resultado, siempre que se asuma su caracter experimental.
- Reproduccion y auditoria de entrenamientos: la model card documenta hiperparametros completos (batch 256, lr 5e-6, AdamW, coseno con 3% warmup, clipping 1.0, bf16), lo que facilita replicar o auditar la receta.
- Analisis del sesgo de filtrado de datos: el modelo es un caso de estudio sobre como retener solo respuestas completas altera la distribucion de dificultad de un dataset de matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion AIME de este checkpoint todavia no se ha anadido. Tampoco se proporcionan resultados de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra suite, ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 8-9 GB solo para los pesos (el repositorio ocupa 8,1 GB), mas la cache KV correspondiente a la longitud de contexto utilizada, que a 32.768 tokens puede anadir varios GB adicionales segun la implementacion.
- Cuantizacion: al no publicarse pesos cuantizados, habria que generarlos. Como referencia orientativa para un modelo denso de 4B, int8 ronda los 4-5 GB y int4 los 2,5-3 GB, siempre que el stack de inferencia soporte esa ruta.
- GPU recomendadas: A100, H100 o L40S para servir con contexto largo y concurrencia; en el extremo de consumo, RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos) son suficientes para inferencia en bf16 con contexto moderado, y tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) o incluso 8-12 GB resultan viables con cuantizacion.
- Cabe en GPU de consumo: si, en modelos con 16-24 GB en bf16 con contexto reducido, y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: `transformers` (snippet incluido en la model card), vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints), y llama.cpp u Ollama tras convertir los pesos a GGUF, ya que no se distribuye una version GGUF oficial.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.
- Nota de entrenamiento: la receta original requirio 4 GPU con `sequence parallel size = 4` para el ajuste de parametros completos con secuencias de 32.768 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmark | Disponibilidad |
|---|---|---|---|---|---|---|
| seomh/Qwen3-4B-OpenThoughts3-Math-SFT-step500 | 4.022.468.096 | 32.768 tokens (secuencia de entrenamiento) | Apache 2.0 | Ingles | No publicado | HuggingFace, pesos safetensors en bf16 |
| Qwen/Qwen3-4B (modelo base) | 4.022.468.096 (base del ajuste) | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros checkpoints SFT sobre OpenThoughts3 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato de distribucion. Cualquier afirmacion sobre calidad relativa frente al modelo base o frente a otros ajustes de matematicas requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 500), no un modelo de produccion: el propio autor lo describe como experimental y detenido en ese paso.
- Sin evaluacion publicada: no hay resultados de AIME ni de otras suites, de modo que su calidad real en matematicas es desconocida.
- Sesgo de filtrado del dataset: al retener solo respuestas con bloque de razonamiento cerrado y respuesta boxed, los problemas cuya generacion agotaba el limite de longitud quedan infrarrepresentados; el rendimiento sobre problemas muy largos o de dificultad extrema puede degradarse.
- Sesgos generales del modelo base: no se documenta ningun proceso de alineacion adicional (RLHF, DPO) en este ajuste, solo SFT; los sesgos heredados de Qwen3-4B persisten.
- Riesgo de alucinacion: es un modelo generativo de 4B entrenado sobre trazas de razonamiento; puede producir cadenas plausibles con resultados incorrectos, especialmente fuera del dominio de matematicas.
- Limitacion idiomatica: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto: la secuencia maxima de entrenamiento es 32.768 tokens y no se documenta extension mediante YaRN ni tecnicas similares en este checkpoint.
- Formato de pesos unico: solo safetensors en bf16; no hay GGUF, AWQ, GPTQ ni MLX publicados, lo que anade trabajo de conversion para despliegues en CPU o en GPU de gama baja.
- Licencia: Apache 2.0 permite uso comercial, pero dado el caracter experimental del checkpoint y la ausencia de evaluaciones, no se recomienda su uso en produccion.
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido sobre seguridad alimentaria en Brasil), por lo que no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seomh/Qwen3-4B-OpenThoughts3-Math-SFT-step500
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las entradas devueltas corresponden a tematicas ajenas (seguridad alimentaria y seguridad offshore) y se descartan.
