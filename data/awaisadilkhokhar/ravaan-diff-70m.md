# AwaisAdilKhokhar/ravaan-diff-70m

## Resumen

Ravaan-DIFF-70M es un modelo de lenguaje de difusión enmascarada (masked diffusion) para urdu, desarrollado por AwaisAdilKhokhar y publicado bajo licencia Apache 2.0. Con 69.975.680 parametros, se ha entrenado desde cero sobre un corpus de urdu de 85,4 millones de tokens construido a proposito. Segun su model card, es el primer modelo de difusion enmascarada entrenado para urdu del que sus autores tienen constancia (busqueda bibliografica fechada el 23 de septiembre de 2026).

El modelo forma parte de un par emparejado: su gemelo autorregresivo, `ravaan-ar-70m`, se entreno con el mismo corpus, la misma arquitectura, la misma mezcla de tareas y el mismo tokenizador, de modo que ambos pueden compararse sin factores de confusion. El resultado principal es que la difusion alcanza 0,7659 bits por byte (bpb) en validacion de urdu nativo tras 64 epocas, frente a los 0,7774 bpb del mejor checkpoint autorregresivo (4 epocas) y los 0,8690 bpb de este ultimo con el mismo presupuesto de computo (16 epocas). La relevancia del lanzamiento radica en reproducir, en una lengua de bajos recursos con escritura no latina, el cruce por restriccion de datos ya descrito en ingles por Prabhudesai et al. y Ni et al.

La arquitectura no es un modelo de `transformers`: `AutoModel` no puede cargarlo y el codigo de inferencia se distribuye dentro del propio repositorio, ya que el calendario de desruido, el numero de pasos y los tokens prohibidos forman parte integrante del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion enmascarada (masked diffusion language model) entrenado desde cero |
| Parametros totales | 69.975.680 (aproximadamente 70M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la generacion opera sobre un lienzo de ancho fijo (el ejemplo usa prefijo + 160 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu (ur); el corpus incluye ademas roman urdu (Mavkif/Roman-Urdu-Parl-split) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

Se trata de un transformer de difusion enmascarada de aproximadamente 70M de parametros, entrenado desde cero sobre un corpus de urdu de 85,4 millones de tokens construido especificamente para el proyecto. El tokenizador es SentencePiece y se comparte con el modelo autorregresivo gemelo. Los datos provienen de `HuggingFaceFW/fineweb-2` y de `Mavkif/Roman-Urdu-Parl-split`. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento.

La innovacion tecnica destacable no es arquitectonica sino metodologica: la publicacion de un par emparejado difusion/autorregresivo permite aislar el efecto del objetivo de entrenamiento. La curva de validacion en bits por byte de urdu nativo es la siguiente:

| Epocas | bpb urdu | Nota |
|---|---|---|
| 0,64 | 1,2864 | una sola tirada |
| 1,28 | 1,1188 | una sola tirada |
| 3,2 | 0,9793 | una sola tirada |
| 6,4 | 0,9232 | una sola tirada |
| 16 | 0,8619 | una sola tirada |
| 32 | 0,8032 | una sola tirada |
| 64 | 0,7659 ± 0,0018 | media de 9 tiradas |

El modelo autorregresivo gira a las 4 epocas (0,7774 bpb) y degrada con mas computo, hasta 0,8690 a las 16 epocas. El modelo de difusion desciende de forma monotona durante las 64 epocas y aun no ha girado: su ultima duplicacion de presupuesto aporto -0,0386 bpb. Conviene senalar una asimetria metodologica que los autores declaran explicitamente: la cifra de difusion es un ELBO, es decir, una cota superior de la log-verosimilitud negativa real, estimada por Monte Carlo (media de 9 tiradas independientes sobre las 4.874 secuencias de validacion; desviacion tipica de una sola tirada 0,0054, rango 0,7575-0,7737). Que una cota sea inferior a una verosimilitud exacta demuestra que el modelo de la cota es mejor; lo contrario no probaria nada.

Los seis checkpoints intermedios se perdieron al destruirse la instancia alquilada, por lo que solo se conserva el final. Las puntuaciones de esos seis sobreviven porque el entrenamiento las calculo antes de perderlos, pero no es posible anadir mas tiradas a esas cifras.

## Capacidades

- Generacion de texto en urdu mediante desruido iterativo sobre un lienzo de ancho fijo, con relleno condicionado por un prefijo.
- Generacion no autorregresiva: el modelo compromete tokens en paralelo a lo largo de varios pasos de desruido (8 pasos en la configuracion medida).
- Modelado de lenguaje medible: proporciona una estimacion ELBO de la log-verosimilitud, util para evaluacion comparativa frente a modelos autorregresivos.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la informacion).
- Capacidades multilingues: limitadas al urdu y, en el corpus de entrenamiento, al roman urdu. No se documenta soporte de otras lenguas.
- Capacidad especial: modo de generacion por difusion enmascarada con control explicito del calendario de ruido (`schedule="gumbel"`, `gumbel=2.0`) y de los tokens prohibidos. La prohibicion de `</s>` eleva la proporcion de escritura arabe en la salida de 0,000 a 1,000.

## Casos de uso

- Investigacion comparativa de objetivos de entrenamiento: el modelo esta disenado como mitad de un par emparejado con `ravaan-ar-70m`, lo que permite estudiar el efecto de la difusion enmascarada frente a la generacion autorregresiva sin factores de confusion, algo poco frecuente en modelos de menos de 100M de parametros.
- Estudio del cruce por restriccion de datos en lenguas de bajos recursos: al reproducir en urdu el fenomeno descrito en ingles, sirve como banco de pruebas para analizar cuando la difusion supera a la autorregresion con corpus limitados.
- Generacion de texto en urdu en entornos sin GPU: con alrededor de 70M de parametros, la inferencia es viable en CPU (el propio ejemplo de la model card usa `device="cpu"`), lo que lo hace adecuado para demostraciones y prototipos en hardware modesto.
- Evaluacion de modelos de lenguaje para urdu: la metrica de bits por byte sobre un split de validacion de 4.874 secuencias proporciona una referencia cuantitativa para comparar otros modelos entrenados en esta lengua.
- Punto de partida para ajuste fino en tareas de urdu: al ser un modelo pequeno con licencia Apache 2.0, puede reentrenarse o adaptarse con recursos limitados para tareas concretas de generacion en urdu.
- Prototipado de decodificadores no autorregresivos: el repositorio incluye codigo de inferencia con configuracion de muestreo (temperatura, top-p, pasos, calendario) que sirve como implementacion de referencia para explorar decodificacion por difusion.
- Docencia y experimentacion sobre difusion enmascarada: el tamano reducido y la disponibilidad del codigo permiten reproducir el ciclo completo de generacion en un portatil.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los de bits por byte (bpb) en validacion de urdu nativo y las metricas de repetibilidad del decodificador. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Ravaan-DIFF-70M (64 epocas) | Ravaan-AR-70M (mejor, 4 epocas) | Ravaan-AR-70M (mismo presupuesto, 16 epocas) |
|---|---|---|---|
| bpb urdu nativo (menor es mejor) | 0,7659 ± 0,0018 | 0,7774 | 0,8690 |
| Naturaleza de la metrica | ELBO, cota superior, estimacion Monte Carlo | verosimilitud exacta | verosimilitud exacta |
| Comportamiento con mas computo | desciende de forma monotona | gira a las 4 epocas | degrada |

| Configuracion del decodificador | Puntuacion de repeticion |
|---|---|
| 8 pasos (configuracion recomendada) | 0,016 |
| 160 pasos | 0,084 |
| Calendario `confidence`, cualquier numero de pasos | 0,29-0,61 (degenera en bucle sobre una frase) |

Las tres decisiones del decodificador (8 pasos, `schedule="gumbel"` con `gumbel=2.0`, y `</s>` prohibido) se establecieron por barrido experimental y los autores advierten que modificarlas equivale a usar un modelo distinto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 280 MB en fp32 y 140 MB en fp16/bf16 (estimacion derivada de los 69.975.680 parametros; el repositorio ocupa 0,3 GB).
- GPU recomendadas: cualquier GPU moderna es suficiente por capacidad; no se documentan recomendaciones especificas en la informacion disponible.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en hardware integrado, dado el tamano del modelo. El ejemplo oficial funciona en CPU.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura no es un modelo de `transformers` y no hay pesos en formato GGUF. El despliegue se realiza con el codigo de inferencia incluido en el repositorio (`ravaan_infer.loader`, `ravaan_infer.sampling`, `generate.py`), sobre PyTorch con SentencePiece y safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Objetivo | Contexto | bpb urdu nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ravaan-DIFF-70M | 69.975.680 | Difusion enmascarada | no disponible (lienzo de ancho fijo) | 0,7659 ± 0,0018 (64 epocas) | Apache 2.0 | HuggingFace |
| Ravaan-AR-70m | 70M (mismo tamano, dato exacto no disponible) | Autorregresivo | no disponible | 0,7774 (mejor checkpoint, 4 epocas) | Apache 2.0 (no confirmado en la informacion) | HuggingFace |
| Otros modelos de urdu de ~70M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es la del par emparejado, dado que ambos modelos comparten corpus, tokenizador y mezcla de tareas. No se dispone de informacion sobre otros modelos comparables de difusion enmascarada para urdu.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Riesgo de memorizacion: el modelo se entrena durante 64 epocas sobre un corpus de 85,4 millones de tokens, una repeticion intensa; la seccion de la model card que aborda la memorizacion aparece truncada en la informacion proporcionada, por lo que no puede evaluarse su alcance.
- Riesgo de alucinacion: no se documenta explicitamente, pero es esperable en un modelo de 70M de parametros entrenado sobre un corpus pequeno y muy repetido.
- Limitaciones de idioma: el modelo esta entrenado unicamente para urdu (con presencia de roman urdu en el corpus). No se documenta soporte de otras lenguas.
- Limitaciones de contexto: la generacion opera sobre un lienzo de ancho fijo sin contexto, no sobre una ventana de contexto convencional. En esa configuracion, el token de fin de secuencia gana el 47% de los primeros compromisos, y si no se prohibe el modelo rellena el resto con relleno.
- Sensibilidad del decodificador: aumentar el numero de pasos de desruido empeora la calidad de forma monotona; usar el calendario `confidence` degenera en bucles. Los valores medidos son parte del modelo y no preferencias ajustables.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue requiere el codigo de inferencia propio del repositorio, ya que no hay soporte en ecosistemas estandar.
- Caveat metodologico para produccion: la metrica de difusion es un ELBO (cota superior) estimado por Monte Carlo, no una verosimilitud exacta; cualquier comparacion futura debe tener en cuenta esa asimetria.
- Madurez: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y su model card esta fechada en septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwaisAdilKhokhar/ravaan-diff-70m
- Modelo gemelo autorregresivo: https://huggingface.co/AwaisAdilKhokhar/ravaan-ar-70m
- Paper sobre el cruce por restriccion de datos (Prabhudesai et al.): arXiv:2507.15857
- Paper relacionado (Ni et al.): arXiv:2511.03276
- Referencia adicional citada en las etiquetas del modelo: arXiv:2603.20466
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset de roman urdu: https://huggingface.co/datasets/Mavkif/Roman-Urdu-Parl-split
