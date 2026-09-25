# budget-internalization-iclr2027/qwen3.5-4b-4k-sft-forced-strongfish-s100

## Resumen

El modelo `qwen3.5-4b-4k-sft-forced-strongfish-s100` es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B, publicado por el grupo anonimo `budget-internalization-iclr2027` como parte de una submission anonima a ICLR 2027. Se trata de un experimento de investigacion centrado en la internalizacion de presupuestos de tokens: el modelo se entrena sobre soluciones generadas por el propio Qwen3.5-4B para problemas matematicos del dataset DeepScaleR, filtradas por correccion y restringidas a un subconjunto denominado `4k-forced`, es decir, respuestas con presupuesto de 4.000 tokens cuya respuesta final se produjo mediante "forced answering".

El objetivo del trabajo es estudiar si un modelo de razonamiento puede aprender a resolver problemas matematicos con un presupuesto de generacion acotado, en lugar de depender de cadenas de pensamiento largas. Para ello se aplica rejection-sampling finetuning (RFT): se muestrean soluciones del modelo base, se filtran por exactitud y se reentrena sobre las correctas con perdida de next-token estandar.

El checkpoint liberado corresponde al paso 100 de entrenamiento, un unico epoch, con una longitud maxima de secuencia de 18.432 tokens y learning rate maximo de 5e-06. Cuenta con 4.539.265.536 parametros (unos 4,54 mil millones) en safetensors BF16, un repositorio de 9,1 GB y licencia Apache 2.0 heredada del modelo base. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen/Qwen3.5-4B (no detallada en la model card) |
| Parametros totales | 4.539.265.536 (~4,54 B), segun safetensors |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible; el entrenamiento uso una longitud maxima de secuencia de 18.432 tokens |
| Tipos de cuantizacion | Pesos en BF16; no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | Safetensors (BF16), libreria transformers; repositorio de 9,1 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base, Qwen/Qwen3.5-4B, mas alla de la libreria (`transformers`) y el pipeline declarado (`image-text-to-text`). Dado que el ajuste es un SFT estandar sobre un modelo causal, cabe asumir una arquitectura transformer decoder-only, pero no hay confirmacion explicita en la informacion proporcionada. Tampoco se detalla si el modelo base incorpora atencion lineal, decodificacion especulativa u otras innovaciones.

El entrenamiento consistio en un unico epoch de SFT con perdida de next-token sobre la respuesta, ejecutado durante 100 pasos con batches de 32 secuencias y Adam con schedule coseno y pico de learning rate de 5e-06. Los datos son soluciones autogeneradas por Qwen3.5-4B a problemas del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por correccion (rejection sampling) y restringidas al subconjunto `4k-forced`: respuestas con presupuesto de 4.000 tokens cuya respuesta final se obtuvo mediante forced answering, con una unica solucion por problema. El prompt de entrenamiento pide razonamiento paso a paso y salida de la respuesta dentro de etiquetas `\boxed{}`. No se documenta ninguna fase de RLHF, DPO u optimizacion por preferencias.

## Capacidades

- Razonamiento matematico paso a paso: el modelo esta especializado en resolver problemas matematicos generando cadenas de razonamiento y emitiendo la respuesta final dentro de `\boxed{}`.
- Internalizacion de presupuesto de tokens: el ajuste se diseno especificamente para producir respuestas dentro de un presupuesto acotado (subconjunto `4k-forced`), lo que sugiere un comportamiento entrenado para concluir antes de agotar el limite.
- Generacion de texto conversacional: la model card indica que el prompt de usuario se renderiza con la plantilla de chat del modelo base, por lo que conserva el formato conversacional multi-turno.
- Capacidades multimodales: el pipeline declarado en HuggingFace es `image-text-to-text`, lo que apunta a entrada de imagen y texto, pero la model card no documenta ningun entrenamiento ni evaluacion de vision. Dato no confirmado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo "thinking" explicito o decodificacion con presupuesto controlado: el entrenamiento usa razonamiento paso a paso mediante prompt, no un modo nativo documentado.

## Casos de uso

- Generacion de datos de razonamiento para destilacion: el modelo puede usarse como generador de soluciones matematicas cortas y verificables, utiles para construir datasets de entrenamiento de modelos mas pequenos con presupuesto de tokens limitado.
- Evaluacion de investigacion sobre presupuestos de tokens: sirve como checkpoint de referencia para comparar el efecto del RFT con presupuesto acotado (4k) frente al modelo base sin ajustar.
- Resolucion automatica de problemas matematicos en entornos educativos: genera pasos intermedios y respuesta final en formato `\boxed{}`, lo que facilita la verificacion automatica de la solucion por parte de un corrector.
- Prototipado de tutores matematicos: con 4,54 B de parametros y licencia Apache 2.0, puede desplegarse en infraestructura modesta para responder consultas de algebra, calculo o aritmetica con explicaciones paso a paso.
- Pipeline de verificacion de respuestas (self-consistency): al ser un modelo pequeno y rapido de muestrear, permite generar multiples soluciones por problema y seleccionar por mayoria, un patron habitual en razonamiento matematico.
- Reproducibilidad de experimentos ICLR: el checkpoint del paso 100 permite reproducir el punto exacto de entrenamiento descrito en la submission anonima, util para replicas o estudios comparativos de RFT.
- Filtrado y anotacion asistida de corpus matematicos: puede etiquetar problemas de DeepScaleR u otros corpus con soluciones candidatas que despues se validan por un verificador simbolico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ningun otro conjunto de evaluacion, y los resultados de la busqueda web no aportan datos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9,1 GB solo para los pesos (el repositorio completo ocupa 9,1 GB), mas el cache KV. Con contexto largo (hasta 18.432 tokens) el consumo adicional de memoria puede ser considerable.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB de pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3 GB de pesos, mas cache KV. Estas cifras son calculos aritmeticos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo y batches concurrentes. No hay mediciones publicadas por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) para BF16 con contexto moderado, y en GPUs de 8 GB si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="auto", device_map="auto")`, y vLLM mediante `vllm serve budget-internalization-iclr2027/qwen3.5-4b-4k-sft-forced-strongfish-s100`. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion propia.
- Latencia y throughput estimados: no disponible. El unico dato de rendimiento proporcionado es de entrenamiento: batches de 32 secuencias con longitud maxima de 18.432 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este checkpoint ni de mediciones comparables publicadas por el autor. La comparacion se limita a caracteristicas verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3.5-4b-4k-sft-forced-strongfish-s100 | 4,54 B | No disponible (entrenado hasta 18.432 tokens) | Apache 2.0 | Safetensors BF16 | SFT con RFT sobre datos `4k-forced`; paso 100, 1 epoch |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la informacion proporcionada | No disponible | Apache 2.0 (segun el modelo derivado) | Safetensors | Modelo original sin ajuste; pipeline `image-text-to-text` |
| Otros ajustes de razonamiento matematico de ~4 B | No disponible | No disponible | No disponible | No disponible | No se identificaron alternativas comparables con datos verificables en la busqueda realizada |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay resultados de benchmarks, por lo que no puede afirmarse ninguna mejora sobre el modelo base ni sobre alternativas.
- Entrenamiento muy corto: un solo epoch, 100 pasos y 100 muestras por batch implican una exposicion limitada a los datos; el riesgo de sobreajuste o de ajuste incompleto no esta cuantificado.
- Dominio estrecho: los datos de entrenamiento son exclusivamente problemas matematicos de DeepScaleR con soluciones filtradas por correccion, lo que puede degradar capacidades generales del modelo base (olvido catastrofico) en conversacion abierta, codigo o tareas multilingues.
- Sesgo del subconjunto `4k-forced`: al entrenar solo con respuestas cuyo resultado final se obtuvo por forced answering, el modelo puede haber aprendido a truncar o cerrar prematuramente razonamientos, con el consiguiente riesgo de respuestas incorrectas en problemas que requieren cadenas mas largas.
- Riesgo de alucinacion: es un modelo de razonamiento matematico sin componente de verificacion; puede producir pasos plausibles pero incorrectos y respuestas en `\boxed{}` erroneas.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento fuera del ingles tecnico-matematico.
- Ambiguedad multimodal: el pipeline `image-text-to-text` sugiere capacidades de vision, pero no hay evidencia en la model card de que el ajuste las conserve o entrene; no debe asumirse soporte de imagen en produccion sin validacion propia.
- Licencia: Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar los terminos vigentes del modelo base Qwen/Qwen3.5-4B y de los datos DeepScaleR empleados.
- Procedencia anonima: el modelo se publica bajo una submission anonima a ICLR 2027, sin autoria identificable ni paper enlazado, lo que dificulta la trazabilidad, el soporte y la citacion academica.
- Repositorio sin adopcion: cero descargas y cero "likes" en el momento de la consulta, sin mantenimiento conocido ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-sft-forced-strongfish-s100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper o blog del autor: no disponible (submission anonima a ICLR 2027, sin enlace en la model card)
- Repositorio de codigo: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos correspondian a portales de presupuestos publicos sin relacion con el modelo.
