# bekalebendong/pendo-smollm2-135m-writing

## Resumen

Pendo SmolLM2-135M (writing) es un ajuste fino del modelo base HuggingFaceTB/SmolLM2-135M, desarrollado por el usuario bekalebendong, orientado especificamente a la autocompletacion de palabras en linea dentro del editor de texto Pendo. El modelo resuelve un problema muy concreto: predecir la siguiente palabra mientras el usuario escribe, de modo que el editor pueda ofrecer sugerencias que ahorren pulsaciones de teclado. No es un modelo de proposito general, sino una especializacion de un modelo ya de por si pequeno.

Con 134.515.008 parametros y un tamano de repositorio de 0,5 GB, se trata de un modelo extremadamente ligero, disenado para ejecutarse en local o en entornos con recursos muy limitados. La arquitectura es la del SmolLM2 original (transformer causal, familia Llama), y el ajuste se realizo sobre aproximadamente 200 MB de texto en ingles procedente de seis generos distintos: correos electronicos, blogs, ficcion, resumenes academicos, noticias y articulos enciclopedicos.

Su relevancia actual radica en que demuestra como un modelo de 135 millones de parametros, con un ajuste fino bien dirigido y un dataset diverso por genero, puede mejorar de forma medible la experiencia de escritura en un editor concreto. La licencia Apache 2.0 y el formato safetensors facilitan su integracion y su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Llama), derivada de SmolLM2-135M |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con ejemplos de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M, un transformer causal de la familia Llama con 134,5 millones de parametros. El ajuste fino consistio en tres epocas de modelado de lenguaje causal sobre aproximadamente 200 MB de texto en ingles, dividido en seis generos de escritura: correos electronicos (AESLC), blogs (Blog Authorship Corpus), ficcion (WritingPrompts), resumenes academicos (arXiv), noticias (CNN/DailyMail) y articulos enciclopedicos (Wikipedia). Los documentos se separaron en conjuntos de entrenamiento, validacion y test antes de trocearlos en ejemplos de 512 tokens, lo que evita fugas de informacion entre particiones.

No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el entrenamiento descrito es exclusivamente de modelado de lenguaje causal supervisado. La innovacion principal no reside en la arquitectura, sino en la evaluacion: el autor utiliza un simulador de tecleo que reproduce texto no visto pulsacion a pulsacion y solo acepta una sugerencia cuando coincide exactamente con la palabra pretendida, midiendo asi el ahorro real de pulsaciones por genero.

## Capacidades

- Generacion de texto y prediccion de la siguiente palabra en ingles, optimizada para autocompletado en linea.
- Autocompletado de palabras dentro de un editor de texto, con sugerencias que buscan coincidir exactamente con la palabra que el usuario iba a escribir.
- Adaptacion a distintos registros de escritura: correo electronico, blogs, ficcion, texto academico, noticias y enciclopedico.
- Modelado de lenguaje causal general, heredado del modelo base SmolLM2-135M.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles; no se reporta soporte de otros idiomas.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Autocompletado en editores de texto: el caso de uso central. El modelo predice la siguiente palabra mientras el usuario escribe y el editor la ofrece como sugerencia; el autor reporta ahorros de pulsaciones de entre el 28,1 % y el 39,3 % segun el genero.
- Redaccion de correos electronicos: con un ahorro medido del 34,5 % en pulsaciones sobre el genero AESLC, el modelo es adecuado para asistentes de escritura de correo donde el registro es formal y repetitivo.
- Escritura de noticias y textos periodisticos: el ahorro del 36,9 % en el genero CNN/DailyMail lo hace util para herramientas de redaccion rapida en entornos de noticias.
- Redaccion academica: el 39,3 % de ahorro en resumenes de arXiv lo situa como candidato para asistentes de escritura en entornos de investigacion, donde el vocabulario tecnico es estable y predecible.
- Edicion de articulos enciclopedicos: el 38,6 % de ahorro en el genero Wikipedia lo hace apropiado para plataformas de documentacion y wikis internas.
- Escritura creativa y ficcion: aunque la mejora es mas modesta (28,5 %), el modelo sigue siendo util como ayuda de tecleo en herramientas de narrativa, donde la prediccion exacta de palabra es mas dificil.
- Integracion en aplicaciones de escritura de bajo consumo: con 135 millones de parametros y 0,5 GB de pesos, puede ejecutarse en local o en dispositivos con recursos limitados, sin depender de una API externa.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de ahorro de pulsaciones y perdida de validacion del simulador de tecleo del editor Pendo, comparando el modelo base con el ajustado:

| Genero | Ahorro antes | Ahorro despues | Perdida val. antes | Perdida val. despues |
|---|---|---|---|---|
| Correos | 29,2 % | 34,5 % | 3,45 | 2,95 |
| Blogs | 27,8 % | 28,1 % | 3,43 | 3,34 |
| Ficcion | 28,3 % | 28,5 % | 3,23 | 3,14 |
| Academico | 38,1 % | 39,3 % | 3,27 | 3,06 |
| Noticias | 33,8 % | 36,9 % | 3,08 | 2,88 |
| Enciclopedico | 38,4 % | 38,6 % | 2,74 | 2,66 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision de 16 bits (0,5 GB de pesos), y en torno a 0,3 GB en cuantizacion de 8 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060 o superior, e incluso en GPUs integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: el formato safetensors permite su uso con transformers; al ser un modelo de la familia Llama, es compatible con llama.cpp, Ollama y vLLM, aunque no se documentan recetas oficiales para estas herramientas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Pendo SmolLM2-135M (writing) | 134,5 M | no disponible | en | apache-2.0 | Autocompletado de palabras en editor |
| HuggingFaceTB/SmolLM2-135M (base) | 135 M | no disponible | en | apache-2.0 | Modelo de proposito general |
| Modelos de autocompletado tipo FIM de mayor tamano | no disponible | no disponible | no disponible | no disponible | Relleno de codigo/texto |

La comparacion directa mas relevante es con su modelo base, SmolLM2-135M: el ajuste mejora el ahorro de pulsaciones en todos los generos, con incrementos destacados en correos (+5,3 puntos) y noticias (+3,1 puntos), y reduce la perdida de validacion en todos los casos. No se dispone de datos de otros modelos comparables de autocompletado en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado unicamente en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Al ser un modelo de 135 millones de parametros, su capacidad de razonamiento y de generar texto coherente a nivel de parrafo es muy limitada; esta disenado para predecir palabras, no para redactar.
- Riesgo de alucinacion y de sugerencias incorrectas: el simulador solo acepta sugerencias que coinciden exactamente con la palabra pretendida, lo que enmascara parcialmente los errores que un usuario real podria encontrar.
- La mejora en generos como blogs y ficcion es marginal (0,3 y 0,2 puntos porcentuales respectivamente), por lo que el beneficio en esos contextos puede ser poco perceptible.
- No se documentan sesgos conocidos, pero al entrenarse con corpus de noticias, blogs y Wikipedia en ingles, puede heredar los sesgos presentes en esas fuentes.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se documentan cuantizaciones oficiales ni recetas de despliegue, lo que puede requerir trabajo adicional para integrarlo en pipelines existentes.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bekalebendong/pendo-smollm2-135m-writing
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Editor de texto Pendo: https://github.com/dimitribekale/pendo-text-editor
