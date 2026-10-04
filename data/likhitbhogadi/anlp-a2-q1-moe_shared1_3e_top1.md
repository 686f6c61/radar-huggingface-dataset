# likhitbhogadi/anlp-a2-q1-moe_shared1_3e_top1

## Resumen

El modelo `likhitbhogadi/anlp-a2-q1-moe_shared1_3e_top1` es un transformer decoder-only entrenado desde cero para traduccion automatica de vietnamita a ingles (vi→en) y de japones a ingles (ja→en). Lo desarrolla likhitbhogadi en el contexto de una asignatura de procesamiento de lenguaje natural (etiqueta `anlp-assignment`), y su interes radica en que implementa una variante de capa feed-forward con mezcla de expertos (MoE) sobre un modelo muy pequeno, lo que permite estudiar el comportamiento de arquitecturas dispersas en un presupuesto de computo reducido.

El modelo tiene 35.274.240 parametros totales y aproximadamente 29,0 millones de parametros activos por token, gracias a un enrutado top-1 sobre tres expertos enrutados mas un experto compartido de ancho 512. Se entreno con 30 millones de tokens procedentes del corpus `belumind/en-vi-ja-curated-500k-triplets`. El formato de secuencia es `<bos> <vi|ja> source <2en> target <eos>` con un tokenizador BPE compartido.

Es relevante como referencia reproducible de MoE a escala de juguete y como ejemplo de traduccion de bajos recursos, pero no como modelo de produccion: no se especifica licencia, no hay cuantizaciones publicadas, el repositorio ocupa 0,2 GB y no tiene descargas ni valoraciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de tipo MoE (1 experto compartido + 3 expertos enrutados, ancho 512, top-1) |
| Parametros totales | 35.274.240 (aprox. 35,3 M) |
| Parametros activos | Aprox. 29,0 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con atencion causal y una capa feed-forward sustituida por un modulo MoE identificado como `moe_shared1_3e_top1`: un experto compartido que procesa todas las entradas mas tres expertos enrutados de ancho 512, con enrutado top-1 (cada token se asigna a un unico experto enrutado ademas del compartido). Esta configuracion es caracteristica de los MoE con expertos compartidos, donde el experto comun captura patrones generales y los enrutados especializan el calculo; el enrutado top-1 mantiene bajo el coste por token a cambio de menor capacidad de combinacion.

El entrenamiento se realizo desde cero sobre `belumind/en-vi-ja-curated-500k-triplets`, con un total de 30 millones de tokens. El formato de secuencia es `<bos> <vi|ja> source <2en> target <eos>`, usando el tokenizador BPE compartido incluido en `tokenizer.json`. El codigo del modelo vive en `src/part1/model.py` dentro del repositorio de la asignatura. No se indica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste de preferencias, ni la composicion detallada del dataset mas alla de su nombre y el numero de tripletes.

## Capacidades

- Traduccion automatica vi→en y ja→en; el modelo esta entrenado especificamente para estas dos direcciones y no se documentan otras.
- Generacion de texto condicionada por un prefijo de idioma (`<vi>` o `<ja>`) y un token de destino `<2en>`, con decodificacion autoregresiva greedy validada en el conjunto de test.
- Manejo de vocabulario compartido multilingue mediante tokenizador BPE unico para los tres idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, modo thinking ni decodificacion especulativa.
- No se documenta capacidad de seguir instrucciones genericas mas alla del formato de traduccion fijado.

## Casos de uso

- Traduccion de documentacion tecnica de vietnamita a ingles: el modelo puede procesar frases del dominio general y producir salidas en un solo paso, adecuado para pipelines por lotes donde no se requiere calidad de nivel humano sino un primer borrador.
- Pretraduccion asistida para localizacion de videojuegos desde japones: dado su tamano, se puede ejecutar localmente para generar borradores que despues revise un traductor humano, reduciendo el coste por palabra.
- Experimentacion academica con arquitecturas MoE: sirve como referencia reproducible para comparar el efecto del enrutado top-1 frente a top-k en tareas de traduccion con presupuesto de computo minimo.
- Fine-tuning sobre dominios verticales: al tener solo 35 M de parametros, es viable reentrenarlo o ajustarlo con datasets propios pequenos en una unica GPU de consumo.
- Prototipado de sistemas de traduccion multilingue en el borde: el modelo cabe en memoria de un dispositivo de gama baja, lo que permite desplegarlo en entornos sin conectividad.
- Evaluacion de tecnicas de tokenizacion compartida: el tokenizador BPE comun a en/vi/ja permite estudiar el impacto del vocabulario compartido en idiomas con sistemas de escritura dispares.
- Generacion de datos sinteticos de traduccion para aumentar corpus de entrenamiento de modelos mayores, siempre que se valide la calidad de las salidas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test:

| Metrica | vi→en | ja→en | Ambos |
|---|---|---|---|
| Perplejidad de test | 8,6366 | 14,0685 | 11,0229 |
| BLEU de test (greedy, sacrebleu 13a) | 32,988 | 23,072 | 28,047 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, y no se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 141 MB en fp32, unos 71 MB en fp16/bf16 y unos 35 MB en int8 (calculado sobre 35,27 M de parametros, sin contar cache KV ni activaciones).
- Cabe con holgura en cualquier GPU de consumo (GTX 1050 Ti, RTX 3060, RTX 4090), en GPUs de portatil con graficos integrados e incluso en CPU.
- GPUs de datacenter (A100, H100) no son necesarias; usarlas solo tendria sentido para servir muchas peticiones en paralelo.
- El cuello de botella previsible es la latencia de generacion token a token, no la memoria, dado que la decodificacion es autoregresiva y el modelo es diminuto.
- Opciones de despliegue: carga directa con `transformers` y `safetensors`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no estan soportados sin conversion previa. El soporte en vLLM o TGI no esta garantizado, ya que la implementacion MoE con experto compartido y enrutado top-1 es especifica del repositorio de la asignatura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Direcciones | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| anlp-a2-q1-moe_shared1_3e_top1 | 35,3 M totales / 29,0 M activos | vi→en, ja→en | no disponible | no disponible | BLEU 32,99 (vi→en), 23,07 (ja→en) |
| Helsinki-NLP opus-mt (variantes vi/en y ja/en) | no disponible en la informacion proporcionada | multiples, incluidas vi→en y ja→en | no disponible | no disponible | no disponible |
| NLLB-200-distilled-600M | no disponible en la informacion proporcionada | 200 idiomas | no disponible | no disponible | no disponible |
| M2M-100 (418 M) | no disponible en la informacion proporcionada | 100 idiomas | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto, licencia ni rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible. La unica comparacion defendible es de orden de magnitud: este modelo es uno o dos ordenes de magnitud mas pequeno que las alternativas multilingues habituales.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- Es un modelo entrenado como ejercicio academico: no ha pasado por evaluaciones de seguridad, filtrado de datos ni alineacion.
- Solo soporta dos direcciones de traduccion (vi→en y ja→en); no traduce hacia vietnamita ni hacia japones, ni cubre otros pares de idiomas.
- La perplejidad en ja→en (14,07) es notablemente peor que en vi→en (8,64), lo que sugiere un rendimiento mas debil y mayor riesgo de errores en japones.
- Entrenado con solo 30 millones de tokens: la cobertura lexica y de dominios es limitada y es probable que aparezcan alucinaciones y omisiones en entradas fuera de dominio.
- La ausencia de informacion sobre la longitud de contexto impide conocer el limite practico de longitud de entrada; secuencias largas pueden degradar la calidad.
- Requiere el codigo personalizado del repositorio de la asignatura (`src/part1/model.py`) para instanciar la arquitectura, lo que complica su integracion en frameworks de serving estandar.
- No hay pesos cuantizados ni versiones GGUF, lo que limita el despliegue en herramientas de inferencia ligera.
- El repositorio no registra descargas ni valoraciones, por lo que no existe validacion externa de los resultados reportados.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus curado unico y de tamano reducido es esperable un sesgo hacia el dominio y el registro de dicho corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/likhitbhogadi/anlp-a2-q1-moe_shared1_3e_top1
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/likhitbhogadi-iiit-hyderabad/anlp-a2-q1/runs/vul66jar
- Dataset de entrenamiento referenciado: `belumind/en-vi-ja-curated-500k-triplets`
- Codigo del modelo: `src/part1/model.py` en el repositorio de la asignatura (enlace directo no disponible)
- Paper o blog tecnico: no disponible
