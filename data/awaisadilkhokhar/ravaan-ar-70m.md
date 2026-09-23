# AwaisAdilKhokhar/ravaan-ar-70m

## Resumen

Ravaan-AR-70M es un modelo de lenguaje causal autorregresivo de 69.975.680 parametros, entrenado desde cero por el desarrollador AwaisAdilKhokhar sobre un corpus de urdu de 85,4 millones de tokens. No aspira a ser el mejor modelo de su categoria ni una solucion de produccion: su razon de ser es actuar como la linea base emparejada de ravaan-diff-70m, su gemelo de difusion, de forma que ambos puedan compararse sin factores de confusion (mismo corpus, misma mezcla de tareas y mismo tokenizador).

El hallazgo central que justifica su publicacion es metodologico. El entrenamiento autorregresivo sobre este corpus "gira" a las 4 epocas: mas alla de ese punto, mas computo empeora de forma monotona al modelo en texto retenido (0,7774 -> 0,7887 -> 0,8690 bits por byte) mientras la perdida de entrenamiento sigue descendiendo, lo que evidencia memorizacion. El checkpoint publicado es deliberadamente el de 4 epocas, no el de 16 con el que termino la ejecucion.

El modelo se distribuye en safetensors bajo licencia Apache-2.0, no es compatible con `AutoModel` de transformers y exige su propio codigo de inferencia (`ravaan_infer`). La longitud de contexto no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo causal, entrenado desde cero (no compatible con `AutoModel` de transformers) |
| Parametros totales | 69.975.680 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors sin cuantizaciones adicionales) |
| Idiomas soportados | Urdu (ur): urdu nativo, roman urdu y cambio de codigo |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pytorch) |

Otros datos: tamano del repositorio 0,3 GB; tokenizador SentencePiece de 16.384 piezas con huella `2855877c8ecd38c9`; libreria pytorch; pipeline `text-generation`.

## Arquitectura y entrenamiento

Se trata de un transformer decoder causal autorregresivo, construido desde cero y no envuelto en una arquitectura estandar de la libreria transformers. El modelo incorpora un sistema de "framing" de prompt propio y una lista de tokens prohibidos (`forbidden`) gestionada por el codigo de inferencia. A diferencia de su gemelo de difusion, esta variante autorregresiva decide su propia longitud de salida y se detiene al alcanzar `</s>`, lo que impide emparejar ambos brazos en esa dimension.

El corpus de entrenamiento es un conjunto congelado y descontaminado de 85.362.688 tokens unicos de urdu, construido mediante un pipeline de diez etapas (filtrado de calidad, eliminacion de duplicados exactos y casi duplicados, cribado de PII, descontaminacion del conjunto retenido y division consciente del sistema de escritura). La mezcla por tokens es 74,3 % de urdu nativo, 20,4 % de roman urdu y 5,4 % de cambio de codigo. Las fuentes son FineWeb2 (`urd_Arab`, licencia ODC-By-1.0), Roman-Urdu-Parl (Apache-2.0) y el volcado de Wikipedia en urdu del 20231101 (CC-BY-SA-3.0). No se menciona RLHF ni DPO: es un modelo base, no ajustado a instrucciones. Se documenta una verificacion de memorizacion por n-gramas sobre el flujo de entrenamiento que no encontro coincidencias en n >= 16.

## Capacidades

- Generacion de texto en urdu nativo de forma autorregresiva, con parada natural en `</s>`.
- Generacion en roman urdu y en registros con cambio de codigo, gracias a la composicion del corpus.
- Manejo de pares de transliteracion derivados de la fuente Roman-Urdu-Parl.
- Modelo base no ajustado a instrucciones: no sigue ordenes ni responde a formatos conversacionales de forma fiable.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni de razonamiento multi-paso documentadas.
- Sin capacidades de vision, audio ni modo de razonamiento explicito.
- Multilinguismo limitado al urdu y a su variante romanizada; no hay evidencia de soporte para otros idiomas.

## Casos de uso

- Linea base de investigacion controlada: su proposito declarado es servir de comparacion emparejada frente a ravaan-diff-70m, aislando el efecto de la factorizacion (autorregresiva frente a difusion) con corpus y tokenizador identicos.
- Estudio de sobreajuste y memorizacion: la curva publicada permite analizar como un modelo pequeno empieza a memorizar y empeora en validacion a partir de la cuarta epoca, un fenomeno poco habitual de documentar con este nivel de detalle.
- Generacion de texto en urdu de bajos recursos: util para prototipos o experimentos academicos donde se necesita texto en urdu sin depender de modelos multilingues grandes.
- Punto de partida para fine-tuning: al ser un modelo base pequeno, puede reentrenarse para tareas concretas de urdu (clasificacion, continuacion, normalizacion) con coste computacional bajo.
- Evaluacion de tokenizadores: el SentencePiece de 16.384 piezas entrenado especificamente sobre este corpus sirve para estudiar la fragmentacion del urdu frente a tokenizadores multilingues genericos.
- Reproducibilidad de pipelines de datos: el corpus se distribuye como codigo, manifiesto y sumas de control, lo que permite reconstruir la mezcla y auditar cada etapa del preprocesado.
- Experimentos de roman urdu y cambio de codigo: la mezcla incluye un 20,4 % de roman urdu y un 5,4 % de cambio de codigo, escenarios poco cubiertos por modelos generalistas.

## Benchmarks y rendimiento

Resultados publicados en bits por byte (bpb) sobre urdu nativo, menor es mejor:

| Modelo | Epocas | bpb en urdu nativo |
|---|---|---|
| Ravaan-DIFF-70M | 64 | 0,7659 ± 0,0018 |
| Ravaan-AR-70M (mejor checkpoint) | 4 | 0,7774 |
| Ravaan-AR-70M (mismo presupuesto) | 16 | 0,8690 |

Curva completa del modelo autorregresivo:

| Epocas | bpb en urdu |
|---|---|
| 0,16 | 1,4557 |
| 0,32 | 1,1946 |
| 0,8 | 0,9455 |
| 1,6 | 0,8325 |
| 4 | 0,7774 (checkpoint publicado) |
| 8 | 0,7887 |
| 16 | 0,8690 |

Verificacion de memorizacion por n-gramas (proporcion de coincidencias):

| Conjunto | 16-gram | 32-gram | 64-gram | 128-gram |
|---|---|---|---|---|
| ar-release_samples | 0,000 | 0,000 | 0,000 | 0,000 |
| diff-release_samples | 0,000 | 0,000 | 0,000 | 0,000 |
| held-out (control) | 0,000 | 0,000 | 0,000 | 0,000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 140 MB en fp16 y 280 MB en fp32 para los pesos, mas el tokenizador y las activaciones.
- El ejemplo oficial de uso se ejecuta directamente en CPU (`device="cpu"`), lo que confirma que no requiere GPU.
- Cabe en cualquier GPU de consumo, incluida una GTX 1650 o una RTX 3060, y en iGPU o en CPU de escritorio con holgura.
- GPU de gama alta (A100, H100, RTX 4090) no aportan ventaja practica para este tamano.
- Opciones de despliegue: el modelo no es compatible con `AutoModel`, vLLM, llama.cpp ni Ollama; solo se soporta mediante el codigo propio `ravaan_infer` (`generate.py` y los modulos `loader`, `sampling`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

En la informacion proporcionada solo se documenta un modelo directamente comparable, su gemelo de difusion. No se dispone de datos sobre otros modelos de urdu de tamano similar.

| Modelo | Parametros | Contexto | bpb en urdu | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ravaan-AR-70M | 69.975.680 | no disponible | 0,7774 (4 epocas) | Apache-2.0 | HuggingFace |
| Ravaan-DIFF-70M | aproximadamente 70M | no disponible | 0,7659 (64 epocas) | no disponible | HuggingFace |

La diferencia clave entre ambos es la factorizacion: el brazo autorregresivo presenta un giro en el bpb a las 4 epocas, mientras que el de difusion sigue descendiendo a las 64 epocas. Ninguno de los dos define longitud de contexto de forma publica.

## Limitaciones y advertencias

- El urdu resultante nunca fue revisado por un hablante nativo: todos los juicios de fluidez, gramaticalidad y sentido, incluidas las muestras publicadas, fueron emitidos por un LLM. La evaluacion humana fue disenada y especificada, pero el texto disponible se corta antes de detallar su resultado.
- El checkpoint publicado es deliberadamente el de 4 epocas, no el que maximiza el rendimiento ni el ultimo de la ejecucion; no es la mejor version entrenada del modelo.
- Riesgo de memorizacion: el propio autor documenta un caso previo en un corpus menor donde un modelo autorregresivo de 426 epocas alcanzo 3,6143 bpb, peor que no saber nada, recitando de forma literal el 24,9 % de sus ventanas de 32 tokens. Aunque el checkpoint de 4 epocas no muestra coincidencias en n >= 16, el fenomeno es caracteristico de esta factorizacion sobre este corpus.
- No es compatible con `AutoModel` de transformers ni con las herramientas de despliegue habituales; requiere codigo de inferencia propio.
- Funciona unicamente con el tokenizador SentencePiece incluido (huella `2855877c8ecd38c9`); cualquier otro tokenizador lo invalida.
- Es un modelo base de 70 millones de parametros, sin ajuste por instrucciones, con capacidad generativa muy limitada y previsiblemente alta perplexidad en comparacion con modelos multilingues grandes.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones o documentos largos.
- Licencia de los datos: el volcado de Wikipedia en urdu es CC-BY-SA-3.0 y la cuestion de si el share-alike alcanza a los pesos no esta resuelta; el autor adopta la posicion convencional de que los pesos no son obra derivada del texto de entrenamiento y declara la licencia de entrada. Los pesos se liberan como Apache-2.0.
- No se redistribuye texto de entrenamiento en bruto: el corpus se entrega como codigo, manifiesto y sumas de control, reconstruible pero no descargable.
- Adopcion nula en el momento de la ficha (0 descargas, 0 me gusta), por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/AwaisAdilKhokhar/ravaan-ar-70m
- HuggingFace (gemelo de difusion, Ravaan-DIFF-70M): https://huggingface.co/AwaisAdilKhokhar/ravaan-diff-70m
- Repositorio fuente del proyecto: https://github.com/AwaisAdilKhokhar/ravaan
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Roman-Urdu-Parl: https://huggingface.co/datasets/Mavkif/Roman-Urdu-Parl-split
