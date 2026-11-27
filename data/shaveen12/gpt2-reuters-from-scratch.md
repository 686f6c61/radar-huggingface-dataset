# Shaveen12/gpt2-reuters-from-scratch

## Resumen

GPT-2 small entrenado desde cero sobre articulos de Reuters es un modelo de lenguaje causal publicado por el usuario Shaveen12 en Hugging Face. Se trata de un ejercicio academico para la asignatura CS4681 (Self-Supervised Learning): parte de pesos inicializados aleatoriamente, sin reutilizar los pesos originales de GPT-2, y aplica el objetivo clasico de prediccion del siguiente token sobre un corpus periodistico en ingles. El resultado es un modelo muy pequeno, de 18,1 millones de parametros, pensado para demostrar el flujo completo de entrenamiento de un transformer decoder-only.

La arquitectura es la de `GPT2LMHeadModel` con 6 capas, 8 cabezas de atencion, dimension de embedding de 256 y una longitud de contexto de solo 256 tokens. El vocabulario es de 52.000 entradas y utiliza un tokenizer propio del mismo autor (`ingeniumacademy/gpt2-reuters-tokenizer`). El entrenamiento se realizo en fp32 sobre una GPU Apple M4 Pro (MPS) en apenas 15,1 minutos, lo que da una idea de la escala reducida del experimento.

Su relevancia es fundamentalmente didactica: sirve como referencia para entender el coste real de entrenar un modelo de lenguaje desde cero, para experimentar con perplexity en dominios especificos y como punto de partida para practicas de fine-tuning o evaluacion. No esta pensado para uso en produccion ni para tareas generales de generacion de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`GPT2LMHeadModel`) |
| Parametros totales | 18.116.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas (`n_layer`) | 6 |
| Cabezas de atencion (`n_head`) | 8 |
| Dimension de embedding (`n_embd`) | 256 |
| Tamano de vocabulario | 52.000 |
| Tokenizer | `ingeniumacademy/gpt2-reuters-tokenizer` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de GPT-2 small pero con dimensiones reducidas: 6 capas de atencion multi-cabeza con 8 cabezas, embedding de 256 dimensiones y 256 posiciones de contexto. El vocabulario de 52.000 tokens corresponde a un tokenizer entrenado especificamente para este corpus. La cabeza de modelado es `GPT2LMHeadModel` con atencion causal estandar; no se documentan innovaciones como atencion lineal, decodificacion especulativa ni capas hibridas.

El entrenamiento se realizo desde pesos aleatorios sobre el dataset `ingeniumacademy/reuters_articles`. Cada ejemplo concatena titulo y cuerpo del articulo separados por un salto de linea y terminados con `<|endoftext|>`. Tras eliminar filas con titulo y cuerpo vacios, el corpus quedo en 16.544 articulos de entrenamiento, 2.152 de validacion y 2.145 de test. Los articulos tokenizados se concatenaron y dividieron en bloques de 256 tokens, generando 11.870 bloques de entrenamiento (unos 3,04 millones de tokens), 1.609 de validacion y 1.235 de test. Se aplicaron 5 epocas (1.855 pasos) con AdamW, learning rate 5e-4, weight decay 0,01, warmup lineal del 5% y decaimiento coseno, en precision fp32 sobre GPU Apple M4 Pro (MPS). No se menciona RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto causal en ingles: completa secuencias a partir de un prompt, con estilo periodistico aprendido del corpus de Reuters.
- Prediccion del siguiente token y calculo de perplexity en textos en ingles del dominio periodistico.
- Generacion condicionada por titulo (el formato de entrenamiento permite continuar a partir de un titular).
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni otras capacidades multimodales.
- No se documenta uso como modelo base para fine-tuning supervisado, aunque su licencia MIT lo permitiria.

## Casos de uso

- Practicas docentes de entrenamiento desde cero: el modelo sirve como referencia completa de un pipeline de preentrenamiento causal (tokenizacion, concatenacion en bloques, warmup, decaimiento coseno) reproducible en 15 minutos en hardware de consumo.
- Evaluacion de perplexity en dominios especializados: permite medir como varia la perplexity de un modelo pequeno al pasar de un corpus general a uno periodistico, con valores de referencia de 81,68 en validacion y 66,24 en test.
- Generacion de titulares y entradillas de prueba: dado el formato `title + "\n" + body`, se puede condicionar con un titular para obtener continuaciones de estilo periodistico, util en prototipos de generacion de noticias sinteticas.
- Baseline para experimentos de fine-tuning: al ser un GPT-2 con licencia MIT y solo 18 millones de parametros, sirve como punto de partida controlado para comparar tecnicas de ajuste (LoRA, full fine-tuning) sin el coste de un modelo grande.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar despliegues con `transformers`, text-generation-inference o endpoints compatibles sin consumir recursos significativos.
- Analisis de sesgos y calidad en corpus periodisticos: el modelo puede emplearse para estudiar que patrones linguisticos y topicos aprende un LM pequeno a partir de articulos de agencia, comparando distribuciones generadas con el corpus original.
- Demostraciones de decodificacion y sampling: util para ilustrar el efecto de temperatura, top-k y top-p en un modelo con contexto muy corto y vocabulario amplio.

## Benchmarks y rendimiento

Los unicos datos publicados son las perdidas y perplexities del entrenamiento y la evaluacion sobre el corpus de Reuters.

| Split | Loss | Perplexity |
|---|---|---|
| Validacion | 4,4028 | 81,68 |
| Test | 4,1933 | 66,24 |

| Epoca | Loss de entrenamiento | Loss de validacion |
|---|---|---|
| 1 | 5,2700 | 5,4520 |
| 2 | 4,6643 | 4,7960 |
| 3 | 4,3126 | 4,5315 |
| 4 | 4,1289 | 4,4368 |
| 5 | 4,0362 | 4,4028 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (18,1 millones de parametros, unos 72 MB de pesos) y del orden de decenas de MB en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en una GPU Apple M4 Pro mediante MPS. Tambien funciona en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: `transformers` (libreria nativa), text-generation-inference (el modelo esta marcado como compatible con endpoints), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no se publican mediciones formales. Por el tamano del modelo y el contexto de 256 tokens, la latencia por token es del orden de milisegundos en GPU consumer; el entrenamiento completo de 5 epocas tardo 15,1 minutos en una M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shaveen12/gpt2-reuters-from-scratch | 18,1 M | 256 | MIT | Hugging Face | Entrenado desde cero en Reuters; solo ingles; sin benchmarks estandar |
| GPT-2 small original (OpenAI) | 124 M | 1.024 | MIT | Hugging Face, multiples mirrors | Preentrenado en WebText; ampliamente usado como baseline |
| DistilGPT-2 | 82 M | 1.024 | MIT | Hugging Face | Destilado de GPT-2; mayor contexto y capacidad general |
| GPT-2 medium | 355 M | 1.024 | MIT | Hugging Face | Version intermedia de la familia GPT-2 |

La comparacion con modelos de la familia GPT-2 es la mas directa por arquitectura, aunque las diferencias de escala (18 M frente a 124 M o 355 M) y de contexto (256 frente a 1.024) son notables. No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas estandar.

## Limitaciones y advertencias

- Modelo de escala muy reducida (18,1 M de parametros) y contexto de solo 256 tokens: no es adecuado para generacion de texto de calidad en produccion.
- Entrenado exclusivamente con articulos de Reuters en ingles; el vocabulario y el estilo estan sesgados hacia el registro periodistico y no generalizan a otros dominios.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, especialmente fuera del dominio de entrenamiento.
- Solo soporta ingles; no se documenta ningun otro idioma.
- No ha pasado por fases de alineacion (RLHF, DPO) ni filtros de seguridad, por lo que puede reproducir sesgos presentes en el corpus de Reuters.
- La licencia MIT permite uso comercial, pero el modelo no esta pensado ni validado para ello; el autor lo presenta como un trabajo de asignatura.
- No se documentan conversiones a GGUF, cuantizaciones ni integraciones con llama.cpp u Ollama.
- El tokenizer es especifico del autor (`ingeniumacademy/gpt2-reuters-tokenizer`) y debe cargarse junto con el modelo; no es intercambiable con el tokenizer original de GPT-2.
- Sin garantias de mantenimiento ni soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaveen12/gpt2-reuters-from-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizer: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
