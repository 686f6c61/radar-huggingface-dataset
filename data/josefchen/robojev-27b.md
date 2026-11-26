# josefchen/RoboJev-27B

## Resumen

RoboJev-27B es un modelo de visión-lenguaje especializado en la detección de éxito en tareas de robótica (success detection). Lo desarrolla Josef Chen como investigador independiente y se distribuye con licencia Apache 2.0. El modelo recibe una instrucción de tarea en texto libre, diez fotogramas de la cámara principal de un intento de ejecución y, opcionalmente, el último fotograma de cámaras auxiliares, y devuelve una probabilidad calibrada de que la tarea se haya completado.

El modelo parte de un fine-tuning sobre `autotrust/JEV-27B-VL` (a su vez derivado de la familia Qwen 3.5, según los tags de arquitectura) y cuenta con 27.356.728.560 parámetros en formato safetensors. Su relevancia radica en que sustituye a modelos frontera en una tarea concreta de evaluación de robots con un coste computacional muy inferior: según la model card, logra un 95,2 % de balanced accuracy en 268 episodios SO-101 retenidos, frente al 91,9-93,3 % de GPT-6 Astra, GPT-6.1 Sol, Claude Opus 5.5 y Claude Sonnet 5.5, con un coste estimado de 0,19 dólares por cada 1.000 respuestas frente a 2,08-9,29 dólares de las APIs frontera.

La inferencia es de un solo pase hacia delante sin generación de explicación: se leen las puntuaciones de los tokens `false` y `true` en una posición de respuesta y se aplica una calibración publicada. La latencia mediana en serie es de 0,26 segundos sobre una H100, lo que lo hace viable para evaluación en bucle cerrado durante la ejecución de políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

RoboJev-27B es un modelo visión-lenguaje de tipo image-text-to-text construido por fine-tuning sobre `autotrust/JEV-27B-VL`, que a su vez pertenece a la familia Qwen 3.5 según los tags del repositorio. El uso previsto es la clasificación binaria de éxito: el cliente envía la instrucción de la tarea como texto libre y diez fotogramas muestreados uniformemente desde el inicio hasta el final del intento, más el último fotograma de cada cámara auxiliar disponible. El modelo lee las puntuaciones de los tokens `false` y `true` en una única posición de respuesta y aplica una calibración publicada para devolver P(éxito), sin generar explicación textual.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card menciona un catálogo construido a partir del Hub con 68.555 episodios en 7.641 datasets públicos de LeRobot (aproximadamente 501 horas de vídeo) y un conjunto de evaluación de 927 episodios etiquetados por humanos, con 20.628 predicciones publicadas en 29 entradas modelo/protocolo. La evaluación principal se realiza sobre 268 episodios SO-101 retenidos y 862 episodios puntuados tras excluir 65 clips ambiguos. Los pesos evaluados están fijados en el commit `e089a9b69a365744b80765057d86583647af95a9`.

## Capacidades

- Clasificación binaria de éxito de tareas robóticas a partir de instrucción en texto libre y secuencia de imágenes.
- Procesamiento de múltiples cámaras: diez fotogramas de la cámara principal más el último fotograma de cada cámara auxiliar.
- Salida de probabilidad calibrada P(éxito) mediante lectura de logits de los tokens `false` y `true` y calibración publicada.
- Inferencia de un solo pase sin generación de cadena de razonamiento, lo que reduce latencia y coste.
- Integración con vLLM y con el ecosistema transformers.
- Orientado a modelos de robot concretos como SO-101 y a datos en formato LeRobot.
- Capacidades generales de visión-lenguaje heredadas del modelo base: no documentadas explícitamente en la información disponible.
- Soporte de tool calling y de agentes multi-paso: no documentado en la información disponible.

## Casos de uso

- Evaluación automática de políticas robóticas en investigación: el modelo puntúa cada intento de una política sobre SO-101 con P(éxito) calibrada, permitiendo calcular tasas de éxito sobre cientos de episodios sin intervención humana y con un coste de 0,19 dólares por 1.000 respuestas.
- Etiquetado y curación de datasets LeRobot: dado un catálogo de decenas de miles de episodios, RoboJev-27B puede gradear aproximadamente 68.555 episodios en unas 4,9 GPU-horas (13,16 dólares), frente a los 637 dólares estimados con GPT-6 Astra.
- Bucle cerrado durante la ejecución: con 0,26 segundos de latencia mediana en una H100, el modelo puede consultarse cada medio segundo durante una tarea real, como demuestra la model card con una tarea de anillas fuera del conjunto de entrenamiento.
- Detección de fallos en producción robótica: integrado en el pipeline de control, permite abortar o reintentar una tarea cuando P(éxito) cae por debajo de un umbral, usando las cámaras auxiliares para desambiguar oclusiones.
- Comparación de variantes de políticas y checkpoints: al ser determinista y barato, permite comparaciones estadísticamente robustas entre versiones de un mismo agente sobre el mismo conjunto de episodios.
- Investigación en recompensas automáticas: la salida calibrada puede usarse como señal de recompensa o de filtrado en pipelines de aprendizaje por refuerzo o de imitación, sustituyendo anotación humana en la fase de evaluación.
- Validación de datos de teleoperación: detectar episodios mal etiquetados o fallidos en datasets de demostración antes de entrenar una política.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 268 episodios SO-101 retenidos (balanced accuracy y coste por 1.000 respuestas):

| Modelo | Balanced accuracy | Coste por 1.000 respuestas (USD) |
|---|---|---|
| RoboJev-27B | 95,2 % | 0,19 |
| GPT-6 Astra | 91,9 %-93,3 % (rango del grupo) | 2,08-9,29 |
| GPT-6.1 Sol | 91,9 %-93,3 % (rango del grupo) | 2,08-9,29 |
| Claude Opus 5.5 | 91,9 %-93,3 % (rango del grupo) | 2,08-9,29 |
| Claude Sonnet 5.5 | 91,9 %-93,3 % (rango del grupo) | 2,08-9,29 |

Notas: el intervalo de confianza pareado al 95 % para la diferencia de balanced accuracy frente a GPT-6 Astra incluye el cero. Los modelos de lenguaje recibieron cuatro fotogramas de la cámara principal, mientras que RoboJev-27B recibió diez fotogramas más las demás cámaras. Los costes de API son precios de lista de las ejecuciones del autor; el coste de RoboJev-27B se estima con una H100 a 2,69 dólares por hora. Latencia mediana en serie de RoboJev-27B: 0,26 s en una H100; las APIs frontera registraron medianas de 5-7 s por llamada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 27,36 B de parámetros, en FP16/BF16 se requieren aproximadamente 55 GB de pesos más memoria para activaciones y caché de imágenes; en cuantización de 8 bits rondaría los 27-30 GB y en 4 bits unos 14-16 GB, aunque estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: H100 (medición oficial del autor, 0,26 s de latencia mediana en serie). Por tamaño, cabría esperar viabilidad en A100 80 GB y en configuraciones multi-GPU para FP16.
- GPU de consumo: no confirmado. En cuantización agresiva podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no hay datos publicados al respecto.
- Opciones de despliegue: transformers y vLLM (ambos citados en los tags y en la model card).
- Latencia y throughput: 0,26 s mediana por respuesta en serie sobre una H100; el autor estima 4,9 GPU-horas para graduar 68.555 episodios, lo que equivale a unos 3,9 episodios por segundo en una H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Balanced accuracy (SO-101) | Coste/1.000 respuestas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RoboJev-27B | 27,36 B | no disponible | 95,2 % | 0,19 USD (GPU propia) | Apache 2.0 | Pesos abiertos en HF |
| GPT-6 Astra | no disponible | no disponible | 91,9 %-93,3 % | 2,08-9,29 USD (API) | propietaria | Solo API |
| GPT-6.1 Sol | no disponible | no disponible | 91,9 %-93,3 % | 2,08-9,29 USD (API) | propietaria | Solo API |
| Claude Opus 5.5 | no disponible | no disponible | 91,9 %-93,3 % | 2,08-9,29 USD (API) | propietaria | Solo API |
| Claude Sonnet 5.5 | no disponible | no disponible | 91,9 %-93,3 % | 2,08-9,29 USD (API) | propietaria | Solo API |

La model card menciona además dos APIs de decisión (TypeSafe Jev 1.14 y Perplexity Decider) en el marcador comparativo, pero no se detallan sus cifras en la información disponible. No se dispone de comparación con otros modelos abiertos de success detection en la información proporcionada.

## Limitaciones y advertencias

- La ventaja de balanced accuracy frente a GPT-6 Astra no es estadísticamente concluyente: el intervalo de confianza pareado al 95 % de la diferencia incluye el cero.
- La comparación no es completamente homogénea: RoboJev-27B recibió diez fotogramas y cámaras auxiliares, mientras que los modelos de lenguaje recibieron cuatro fotogramas de la cámara principal.
- El modelo está entrenado y evaluado principalmente sobre SO-101 y datos LeRobot; su generalización a otros brazos, morfologías o dominios no está documentada.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución más allá de la mención a una tarea de anillas fuera del conjunto de entrenamiento.
- Idiomas soportados no disponibles; la instrucción de tarea se envía en texto libre pero no se especifica cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (`autotrust/JEV-27B-VL`) y sus dependencias deben verificarse por separado.
- El uso previsto es la clasificación binaria de éxito; no debe emplearse como generador de texto general ni como sustituto de un modelo de razonamiento.
- Los pesos evaluados están fijados en un commit concreto; actualizaciones posteriores de documentación no implican cambios en los pesos, pero conviene verificar el hash en producción.
- El coste de 0,19 dólares por 1.000 respuestas asume una H100 a 2,69 dólares por hora; el coste real variará según el proveedor y la utilización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josefchen/RoboJev-27B
- Paper en arXiv: https://arxiv.org/abs/2610.33718
- Página de lanzamiento: https://robo-jev.com
- Demo: https://robo-jev.com/demo
- Resultados completos: https://robo-jev.com/data
- Dataset de evaluación: https://huggingface.co/datasets/josefchen/RoboJev-evals
- Código en GitHub: https://github.com/josefchen/robojev
- Pesos fijados (commit): https://huggingface.co/josefchen/RoboJev-27B/tree/e089a9b69a365744b80765057d86583647af95a9
- Fuente LaTeX del paper: https://huggingface.co/josefchen/RoboJev-27B/resolve/main/paper/RoboJev-arxiv-source.zip
- Bundle de reproducibilidad: https://huggingface.co/josefchen/RoboJev-27B/resolve/main/paper/RoboJev-reproducibility.zip
- BibTeX: https://huggingface.co/josefchen/RoboJev-27B/resolve/main/paper/CITATION.bib
