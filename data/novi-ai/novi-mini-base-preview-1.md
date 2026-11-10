# Novi-AI/Novi-Mini-Base-Preview-1

## Resumen

Novi Mini Base Preview 1 es un checkpoint intermedio de un modelo de lenguaje causal de tipo base, desarrollado por Novi AI dentro de su proyecto Kairo. Se trata de un modelo muy compacto, de aproximadamente 12 millones de parametros reales (el autor indica "alrededor de 10M"), entrenado desde cero con un objetivo clasico de prediccion del siguiente token. Su interes no reside en el rendimiento, sino en su caracter experimental: es una publicacion temprana de un proceso de preentrenamiento en curso, orientada a investigadores que quieran estudiar arquitecturas pequenas.

La arquitectura sigue el estilo que el autor denomina "BananaMind 2", descrita como una version reducida del diseno Cagliostro v3. Incorpora un tokenizador BPE a nivel de byte con un vocabulario de 8.192 tokens y una longitud de contexto de 2.048 tokens. El objetivo de entrenamiento planificado es de unos 15.000 millones de tokens, con un esquema de tasa de aprendizaje estable seguido de un cooldown coseno.

El checkpoint publicado corresponde al paso 168.000 de un total previsto de 457.764, es decir, en torno al 36,7 % del entrenamiento. Por tanto, el modelo no debe considerarse terminado ni apto para produccion: su calidad es deliberadamente preliminar y el autor advierte que el modelo final puede diferir sustancialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, estilo "BananaMind 2" (base: Cagliostro v3 reducido) |
| Parametros totales | 12.065.280 (segun safetensors; el autor indica "aprox. 10M") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: tokenizador BPE a nivel de byte con vocabulario de 8.192 tokens, objetivo de entrenamiento de prediccion del siguiente token, checkpoint 168.000 de 457.764 pasos planificados, repo de 0,1 GB.

## Arquitectura y entrenamiento

Novi Mini Base emplea una arquitectura transformer causal de tipo decoder-only, etiquetada por el autor como "BananaMind 2-style" y construida como una reduccion de escala del diseno Cagliostro v3. La model card no detalla el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tipo exacto de atencion o normalizacion, por lo que estos datos no estan disponibles. El modelo usa un tokenizador BPE a nivel de byte con 8.192 entradas de vocabulario y una ventana de contexto de 2.048 tokens.

El preentrenamiento se realiza desde cero sobre una mezcla de datasets que incluye HuggingFaceTB/smollm-corpus, mlfoundations/dclm-baseline-1.0, HuggingFaceTB/finemath, nvidia/OpenMathInstruct-2 y HuggingFaceTB/smoltalk. El objetivo declarado es de aproximadamente 15.000 millones de tokens, con un esquema de entrenamiento en dos fases: una fase estable y un cooldown con decaimiento coseno de la tasa de aprendizaje. El checkpoint publicado (paso 168.000) corresponde al 36,70 % del total de pasos y al 43,18 % de la fase estable, por lo que el modelo aun no ha entrado en el cooldown. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un modelo puramente base.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de secuencias y modelado del lenguaje en ingles.
- Prediccion del siguiente token como unica tarea de entrenamiento; no hay ajuste por instrucciones.
- Capacidad limitada de razonamiento y matematicas derivada del corpus de entrenamiento (finemath, OpenMathInstruct-2), aunque sin garantias por el estado temprano del checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (idioma declarado en la model card).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Al ser un modelo base, no esta disenado para seguir instrucciones ni para conversacion estructurada.

## Casos de uso

- Investigacion sobre modelos pequenos: servir como banco de pruebas para estudiar el comportamiento de arquitecturas compactas durante el preentrenamiento, comparando checkpoints intermedios del mismo run.
- Experimentos de fine-tuning: al ser un modelo base de licencia Apache 2.0 y muy ligero, puede ajustarse en tareas concretas de clasificacion o generacion en ingles con recursos minimos.
- Evaluacion de arquitecturas: util para validar el diseno "BananaMind 2" reducido frente a otras arquitecturas de escala similar antes de invertir en entrenamientos mayores.
- Educacion y divulgacion: su tamano (12M de parametros, repo de 0,1 GB) permite ejecutarlo y analizarlo en entornos docentes o de laboratorio sin infraestructura especial.
- Pruebas de pipelines de entrenamiento e inferencia: sirve para validar herramientas de carga, tokenizacion y evaluacion con un modelo causal real y pequeno.
- Generacion de texto exploratoria: continuacion de texto en ingles para experimentos cualitativos, asumiendo una calidad baja por el estado temprano del checkpoint.
- Base para estudios de escalado: permite comparar curvas de perdida y capacidades a lo largo de los checkpoints publicados en el repositorio de checkpoints del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (12M de parametros ocupan unos 48 MB en pesos), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una CPU reciente basta para inferencia.
- Cabe en consumer GPU: si, en todas las gamas (GTX 10xx en adelante, RTX, Apple Silicon, etc.).
- Opciones de despliegue: al usar una arquitectura personalizada, la carga requiere los ficheros de modelado y configuracion propios de Novi Mini Base. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; estas herramientas probablemente no funcionaran sin una implementacion especifica de la arquitectura.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Novi Mini Base Preview 1 | ~12M | 2.048 | Apache 2.0 | Preview (36,7 % del entrenamiento) | Arquitectura propia "BananaMind 2" |
| Modelos tipo SmolLM (HuggingFaceTB) | 135M / 360M / 1.7B | hasta 2.048 en versiones tempranas | Apache 2.0 | Completados | Usa smollm-corpus, uno de los datasets de Novi |
| TinyLlama | 1.1B | 2.048 | Apache 2.0 | Completado | Modelo base pequeno ampliamente usado en investigacion |
| Modelos de ~10M de parametros | ~10M | variable | variable | Experimental | Existen varios proyectos experimentales, sin benchmarks publicos comparables |

La comparacion directa es dificil: no hay benchmarks publicados para Novi Mini Base Preview 1 y su arquitectura personalizada limita la comparabilidad. Frente a SmolLM o TinyLlama, Novi Mini Base es dos ordenes de magnitud mas pequeno y se encuentra en un estado de entrenamiento muy temprano.

## Limitaciones y advertencias

- Modelo en estado de preview: corresponde al 36,7 % del entrenamiento planificado; la calidad, capacidades y salidas no representan al modelo final.
- Salidas potencialmente incorrectas, incompletas o sin sentido, segun advierte el propio autor.
- Es un modelo base sin alineacion (sin RLHF ni DPO): no sigue instrucciones y puede generar contenido problematico o sesgado.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Arquitectura personalizada: requiere codigo de modelado propio y no es compatible de forma directa con herramientas estandar de inferencia; el autor recomienda usar solo codigo de modelo de confianza.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un checkpoint experimental no se recomienda su uso en produccion.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus web y matematicos, es probable que herede sesgos de esas fuentes, aunque no se han publicado analisis.
- Riesgo de alucinacion: alto, dado el tamano reducido y el estado temprano del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Novi-AI/Novi-Mini-Base-Preview-1
- Repositorio de checkpoints: https://huggingface.co/Novi-AI/Novi-Mini-Base-Checkpoints
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
