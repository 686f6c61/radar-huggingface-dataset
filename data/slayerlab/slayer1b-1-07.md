# SlayerLab/Slayer1B-1.07

## Resumen

Slayer1B 1.07 es un modelo de lenguaje causal decoder-only de 1 073 912 851 parametros, desarrollado por SlayerLab y orientado principalmente al polaco. Se trata de un entrenamiento "from scratch" que continua el preentrenamiento de la version anterior, Slayer1B 1.06, partiendo de su checkpoint final (step 13848) y anadiendo unos 8 891 005 707 tokens de entrenamiento nuevos y replicados. El objetivo del proyecto es construir un modelo fundacional en polaco de tamano contenido, entrenable en hardware de consumo, que sirva como base para ajuste fino y aplicaciones en ese idioma.

La relevancia del modelo reside en su enfoque de transparencia y eficiencia: el autor publica la curva de entrenamiento, los datasets utilizados, las hashes de los checkpoints y las evaluaciones intermedias durante el propio entrenamiento. El modelo se entrena con 4 GPU NVIDIA RTX 4090, lo que demuestra que es posible entrenar un modelo de ~1B de parametros con un presupuesto de hardware asequible.

En el momento de redactar esta ficha, el entrenamiento esta en curso (estado "training in progress"), con un final planificado en el step 22327 y evaluaciones reportadas hasta el step 18590. No se han publicado aun los pesos finales de la version 1.07 en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 1 073 912 851 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB, sin pesos publicados para 1.07) |

## Arquitectura y entrenamiento

Slayer1B 1.07 es un transformer decoder-only de tipo causal LM con 1 073 912 851 parametros. Utiliza el mismo modelo y tokenizer que la version 1.06: tokenizer v6 con un vocabulario de 32 768 tokens. El entrenamiento emplea un batch global de 256 secuencias de 4096 tokens, es decir, 1 048 576 tokens por step, con una tasa de aprendizaje constante de 6e-4 sin decaimiento y sin extension de contexto.

El entrenamiento se realizo sobre 4 GPU NVIDIA RTX 4090 con acumulacion de gradientes de 32, alcanzando unos 45 000 tokens/s. El trainer utilizado es `train_gpt_ref` r24.2, sin cambios desde la version 1.05. La longitud planificada del entrenamiento va del step 13848 al 22327 (8 479 steps, una pasada sobre los nuevos datos). El entrenamiento se interrumpio el 4 de noviembre en el step 17130 por una parada externa del proceso y se reanudo el 5 de noviembre desde el checkpoint guardado en el step 17000; tras la reanudacion, la perdida en el step 17010 fue identica a la primera ejecucion (2.3177), lo que confirma la reproducibilidad del run.

Los datos de entrenamiento de 1.07 suman 8 891 005 707 tokens en 9 ficheros, tras eliminar documentos solapados con los conjuntos de evaluacion (escaneo de 13-gramas) y enmascarar datos personales (correos, telefonos, numeros de identidad) con el mismo procedimiento que en 1.06. La composicion por tokens de entrenamiento es: web polaca 35.0 %, textos nucleares polacos 11.1 %, textos legales polacos 10.3 % e ingles 43.7 %. Las fuentes incluyen HPLT (web polaca), textos nucleares y legales polacos repetidos de 1.06, FineWeb-Edu, FineMath, open-web-math, DCLM-baseline y FineWeb-Edu `sample/10BT`. Aproximadamente el 36 % de los tokens nucleares de 1.06 y el 68 % de los legales se ven por segunda vez; el resto de los datos se ve una sola vez.

## Capacidades

- Generacion de texto en polaco e ingles, con enfasis en polaco como idioma dominante.
- Modelado de lenguaje causal y continuacion de texto.
- Razonamiento basico y respuesta a preguntas de conocimiento general (evaluado con ARC-Easy en ambos idiomas).
- Capacidades matematicas limitadas, reforzadas por la inclusion de FineMath y open-web-math en el entrenamiento.
- Comprension de textos legales en polaco, gracias a la inclusion de textos legales en el corpus.
- Capacidad multilingue limitada a polaco e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking".
- No se documenta un modo de razonamiento multi-step explicito.

## Casos de uso

- Generacion y continuacion de texto en polaco: el modelo puede emplearse para redaccion asistida, resumenes y parafrasis en polaco, aprovechando su ventana de contexto de 4096 tokens y su entrenamiento dominante en ese idioma.
- Clasificacion y etiquetado de textos polacos: al ser un modelo causal con buen rendimiento en tareas de comprension (MultiBLiMP-PL 98.62 %), puede adaptarse mediante ajuste fino para clasificacion de documentos, analisis de sentimiento o deteccion de temas.
- Procesamiento de documentos legales en polaco: la inclusion de un 10.3 % de tokens legales en el entrenamiento lo hace adecuado como base para tareas de extraccion de informacion, resumen de contratos o busqueda semantica en corpus juridicos polacos.
- Prototipado e investigacion en PLN (procesamiento de lenguaje natural) en polaco: su tamano de ~1B de parametros y su licencia Apache 2.0 permiten experimentar con ajuste fino en hardware de consumo, sirviendo como banco de pruebas para tecnicas de entrenamiento y evaluacion.
- Educacion y tutoria automatizada en polaco: con ajuste fino, puede emplearse para generar explicaciones, preguntas de practica o material didactico en polaco, apoyandose en la componente de textos educativos (FineWeb-Edu) del corpus.
- Traduccion asistida polaco-ingles: aunque no es un modelo de traduccion dedicado, su entrenamiento bilingue permite tareas basicas de traduccion y reformulacion entre ambos idiomas, util como componente en pipelines de preprocesamiento.
- Generacion de codigo basica: no es una capacidad destacada ni documentada, por lo que no se recomienda para produccion de codigo sin validacion adicional.

## Benchmarks y rendimiento

Evaluaciones en tiempo de entrenamiento (protocolo zero-shot, evaluador automatico, checkpoints evaluados en CPU). No son el benchmark lm-evaluation-harness usado en las versiones 1.00-1.03.

| Metrica | 1.06 (13848) | 15000 | 17000 | 18000 | 18590 |
|---|---:|---:|---:|---:|---:|
| BLiMP (EN), accuracy % | 76.12 | 77.94 | 77.61 | 77.88 | 77.46 |
| ARC-Easy (EN), accuracy % | 52.99 | 54.59 | 56.48 | 56.52 | 56.52 |
| WikiText-2, byte perplexity ↓ | 2.2849 | 2.2321 | 2.2138 | 2.2042 | 2.2145 |
| WikiText-2, token perplexity ↓ | 30.03 | 27.28 | 26.37 | 25.90 | 26.40 |
| MultiBLiMP (PL), accuracy % | 98.41 | 98.62 | 98.87 | 98.84 | 98.62 |
| ARC-Easy (PL, eu20), accuracy % | 45.03 | 45.92 | 45.41 | 46.21 | 47.14 |

Nota: ARC-Easy tiene 2 376 preguntas por idioma, por lo que diferencias inferiores a un punto porcentual entre checkpoints consecutivos estan dentro del ruido. La perplejidad de bytes en WikiText-2 en el step 18590 es 0.010 superior a la del step 18000; se reporta tal cual, como punto intermedio de un run con tasa de aprendizaje constante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~1.07B de parametros, una estimacion orientativa seria de ~2.1 GB en fp16, ~4.3 GB en fp32 y ~1.1 GB en cuantizacion de 8 bits, aunque el autor no publica cifras oficiales.
- GPU recomendadas: el entrenamiento se realizo en 4x NVIDIA RTX 4090; para inferencia, una unica RTX 4090 o GPU con al menos 8 GB de VRAM seria suficiente en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16, y en configuraciones menores con cuantizacion.
- Opciones de despliegue: no se documentan opciones oficiales (vLLM, llama.cpp, Ollama, TGI). Al ser un modelo PyTorch con pesos en formato nativo, requeriria conversion a GGUF u otros formatos para su uso en herramientas de inferencia optimizadas.
- Latencia y throughput estimados: no disponibles. El throughput de entrenamiento reportado es de ~45 000 tokens/s en 4x RTX 4090, pero no se ofrecen cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slayer1B 1.07 | 1 073 912 851 | 4096 | pl, en | Apache 2.0 | Pesos no publicados aun (training in progress) |
| Slayer1B 1.06 | no disponible | 4096 | pl, en | Apache 2.0 | Pesos publicados en HuggingFace |
| Modelos comparables de ~1B en polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Estado "training in progress": no hay pesos de la version 1.07 publicados en el repositorio; el repo tiene 0.0 GB. Los datos de evaluacion corresponden a checkpoints intermedios, no al modelo final.
- Riesgo de alucinacion: como todo modelo de lenguaje causal de ~1B de parametros, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento general.
- Sesgos conocidos: no se documentan sesgos especificos, pero el corpus incluye web polaca, textos legales y datos de FineWeb-Edu, lo que puede introducir sesgos de dominio y de representacion.
- Limitaciones de idioma: el modelo esta disenado para polaco e ingles; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Limitaciones de contexto: la ventana de contexto es de 4096 tokens; no se ha realizado extension de contexto en esta version.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificacion y distribucion, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No obstante, los datos de entrenamiento incluyen textos sujetos a la excepcion de mineria de textos y datos (Art. 4, Directiva 2019/790) y otras licencias por fuente, lo que puede requerir revision legal para uso comercial.
- Caveat para produccion: al ser un modelo de ~1B de parametros, su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor tamano; se recomienda ajuste fino y validacion exhaustiva antes de desplegarlo en produccion.
- El entrenamiento se interrumpio y reanudo una vez; aunque la reproducibilidad se verifico, es un aspecto a considerar en la trazabilidad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/SlayerLab/Slayer1B-1.07
- Version anterior: https://huggingface.co/SlayerLab/Slayer1B-1.06
- Dataset de entrenamiento de 1.07: https://huggingface.co/datasets/SlayerLab/slayer-1.07-pretrain
- Dataset base de 1.06: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluacion en tiempo de entrenamiento: https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925
- Grafico de perdida y evaluacion (imagen): https://huggingface.co/SlayerLab/Slayer1B-1.07/resolve/main/slayer1b_107_training.png
