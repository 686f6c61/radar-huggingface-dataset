# belumind/goby-1-ie-vi

## Resumen

goby-1-ie-vi es un modelo de extracción conjunta de entidades y relaciones (*joint entity + relation extraction*) para vietnamita, desarrollado por el usuario belumind y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un *fine-tune* de knowledgator/gliner-relex-large-v1.0, el modelo GLiNER-ReLEX de Knowledgator, y conserva el mismo pipeline de `token-classification` y la misma librería de inferencia (`gliner`). El objetivo declarado del autor era elevar el rendimiento en vietnamita sin degradar el modelo base, y ambos extremos se midieron sobre un conjunto anotado a mano en lugar de asumirse.

Con 466.576.896 parámetros (0,47 B), el modelo pertenece a la categoría de extractores de información compactos: el checkpoint en fp32 ocupa 1,87 GB en disco y la inferencia completa requiere en torno a 2,3 GB de VRAM en fp32 o 1,2 GB en fp16, por lo que entra en una GPU de 4 GB. Su relevancia actual radica en el enfoque *zero-shot* sobre nombres de etiquetas en texto libre: el usuario define las etiquetas de entidad y las relaciones en el momento de la inferencia, sin reentrenar, y el modelo acepta etiquetas tanto en vietnamita como en inglés.

Los resultados publicados son notables para su tamaño: sobre 267 frases vietnamitas anotadas a mano (283 tripletas), el F1 parcial sube de 32,7 en el modelo base a 56,3, y el F1 estricto de 13,2 a 36,9, con un intervalo de confianza bootstrap que excluye el cero en el 100 % de las remuestras. En inglés el modelo también mejora (F1 estricto de 70,6 a 78,8), lo que indica que la especialización en vietnamita no se logró sobrescribiendo las capacidades originales: la deriva L2 relativa de pesos es de solo el 0,24 % en el encoder y el 1,69 % en las cabezas de tarea.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (DeBERTa) con cabezas de tarea acopladas para NER y clasificación de relaciones (familia GLiNER-ReLEX); no es un modelo generativo |
| Parámetros totales | 466.576.896 (0,47 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y fp16 documentados por el autor; no se documentan formatos cuantizados (GGUF, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | vietnamita (vi) e inglés (en); etiquetas *zero-shot* en texto libre en ambos idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch; checkpoint fp32 de 1,87 GB en disco (tamaño del repositorio: 1,9 GB); no se detalla si los ficheros son safetensors o bin |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DeBERTa con dos cabezas de tarea acopladas: una para reconocimiento de entidades nombradas y otra para clasificación de relaciones. Frente a los pipelines en cascada (primero NER, después extracción de relaciones sobre las entidades detectadas), GLiNER-ReLEX resuelve ambas tareas de forma conjunta, lo que evita la propagación de errores entre etapas y permite decodificar tripletas `(cabeza, relación, cola)` de una sola pasada. El autor reporta una deriva L2 relativa de los pesos respecto al modelo base de solo el 0,24 % en el encoder DeBERTa y el 1,69 % en las cabezas, lo que confirma que el ajuste fue deliberadamente conservador.

El entrenamiento se realizó sobre 5.824 frases en vietnamita con 18 tipos de relación, obtenidas mediante supervisión distante (*distant supervision*) a partir de vi.wikipedia. La innovación de datos más destacable es la rotación de etiquetas mediante conjuntos de sinónimos: las 18 relaciones se presentan durante el entrenamiento como 72 formas superficiales distintas y los 10 tipos de entidad como 40, de modo que el modelo no memoriza una única formulación de cada etiqueta y generaliza mejor ante etiquetas nuevas. La etapa final de ajuste consistió en 700 pasos con *learning rate* de 1,5e-6 en el encoder y 4e-6 en las cabezas, scheduler coseno, warmup de 0,1, batch size 8, *focal loss* (alpha 0,75, gamma 2,0) y *gradient clipping* de 1,0. No se menciona el uso de RLHF ni de DPO, algo coherente con un modelo de extracción y no de generación.

## Capacidades

- Extracción conjunta de entidades y relaciones en una sola llamada a `model.inference()`, devolviendo entidades tipadas con puntuación y tripletas `(head, relation, tail)` con su score.
- Funcionamiento *zero-shot* sobre etiquetas de texto libre: las etiquetas de entidad y de relación se pasan como listas de cadenas en el momento de la inferencia, sin reentrenamiento.
- Soporte de etiquetas en vietnamita y en inglés indistintamente sobre el mismo texto de entrada.
- 18 tipos de relación cubiertos de serie (fecha de nacimiento, lugar de nacimiento, premio recibido, sede, fecha de fundación, autor, fecha de fallecimiento, formación, pertenencia a organización, ubicación de evento, desarrollador, cargo ocupado, relación familiar, propiedad, fundador, ubicación, documento firmado y sucesor).
- Modo *flat NER* (`flat_ner=True`) para evitar entidades solapadas anidadas.
- Control fino del equilibrio precisión/recall mediante `threshold` (entidades) y `relation_threshold` (relaciones).
- No soporta generación de texto libre, razonamiento, código, matemáticas, visión ni audio.
- No dispone de soporte documentado de *tool calling*, *function calling* ni uso como agente multi-paso: es un componente de extracción, no un modelo conversacional.
- No se documentan capacidades de *thinking mode* ni de decodificación especulativa.

## Casos de uso

- Construcción de grafos de conocimiento a partir de Wikipedia vietnamita: el modelo extrae tripletas estructuradas de artículos biográficos e institucionales en una sola pasada, con un F1 parcial de 56,3 sobre el conjunto de evaluación del propio autor, lo que permite poblar una base de datos de entidades y relaciones sin anotación manual.
- Enriquecimiento de bases de datos biográficas: relaciones como `sinh ngày` (fecha de nacimiento, F1 82,4), `qua đời ngày` (fecha de fallecimiento, F1 65,1), `quê quán` (lugar de nacimiento, F1 52,4) y `học tại` (formación, F1 62,9) cubren los campos habituales de un fichero de autoridades o de un catálogo de personas.
- Monitorización de prensa y medios vietnamitas: extracción de quién financia, dirige o funda qué organización (`sáng lập`, `giữ chức`, `thuộc sở hữu`) para alimentar paneles de seguimiento de actualidad, con la ventaja de que las etiquetas se pueden redefinir por proyecto sin reentrenar.
- Preprocesamiento para pipelines RAG: convertir documentos vietnamitas no estructurados en tripletas indexables mejora la recuperación sobre preguntas que requieren relación entre entidades (por ejemplo, "¿dónde se formó X?"), en lugar de depender solo de similitud vectorial sobre fragmentos.
- Extracción de datos en dominios administrativos y contractuales: relaciones como `ký` (documento firmado) o `đặt trụ sở tại` (sede) permiten catalogar documentos oficiales; conviene validar con umbrales más laxos porque el rendimiento en `ký` baja respecto al modelo base.
- Clasificación y catalogación de archivos digitales: al ser un modelo de 0,47 B que ocupa 1,87 GB en disco, puede ejecutarse en CPU sobre lotes de documentos históricos para etiquetar automáticamente entidades y relaciones antes de una revisión humana.
- Aplicaciones bilingües vi-en: el modelo mantiene y mejora el rendimiento en inglés (F1 estricto 78,8 frente a 70,6 del base), por lo que un mismo servicio puede procesar corpus mixtos vietnamita-inglés con una única instancia.
- Anotación asistida (*pre-annotation*): generar tripletas candidatas con `relation_threshold=0.5` para maximizar el recall y dejar que un anotador humano filtre, reduciendo el coste de construir nuevos conjuntos dorados en vietnamita.

## Benchmarks y rendimiento

Evaluación sobre 267 frases vietnamitas (283 tripletas) muestreadas de vi.wikipedia y anotadas a mano tripleta a tripleta. Decodificación: `threshold=0.3`, `relation_threshold=0.7`, `flat_ner=True`.

| Modelo | Coincidencia | Precisión | Recall | F1 |
|---|---|---|---|---|
| base (gliner-relex-large-v1.0) | parcial | 23,8 | 52,7 | 32,7 |
| goby-1-ie-vi | parcial | 55,5 | 57,2 | 56,3 |
| base (gliner-relex-large-v1.0) | estricta | 9,6 | 21,2 | 13,2 |
| goby-1-ie-vi | estricta | 36,3 | 37,5 | 36,9 |

La coincidencia estricta exige un emparejamiento exacto `(cabeza, relación, cola)`; la parcial admite solapamiento de spans a nivel de subcadena.

Bootstrap emparejado sobre frases, 1000 remuestras (goby-1-ie-vi menos el modelo base):

| Métrica | Diferencia | IC 95 % | Remuestras positivas |
|---|---|---|---|
| Vietnamita, estricta | +23,8 | [+18,2, +29,1] | 100 % |
| Vietnamita, parcial | +23,7 | [+18,3, +29,1] | 100 % |

Sonda en inglés (30 frases que cubren los 18 tipos de relación, `relation_threshold=0.5`):

| Modelo | F1 estricto (inglés) | F1 parcial (inglés) |
|---|---|---|
| base (gliner-relex-large-v1.0) | 70,6 | 82,4 |
| goby-1-ie-vi | 78,8 | 90,9 |

Resultados por relación en vietnamita (coincidencia parcial, mismas 267 frases; `n` es el número de tripletas doradas):

| Relación (etiqueta usada) | Etiqueta en vietnamita | n | F1 base | F1 goby-1-ie-vi |
|---|---|---|---|---|
| date of birth | sinh ngày | 24 | 41,7 | 82,4 |
| award received | đoạt giải | 21 | 66,7 | 74,4 |
| headquartered in | đặt trụ sở tại | 12 | 52,9 | 72,7 |
| inception date | thành lập ngày | 24 | 37,3 | 69,6 |
| author | tác giả | 14 | 6,2 | 66,7 |
| date of death | qua đời ngày | 20 | 34,3 | 65,1 |
| educated at | học tại | 15 | 33,3 | 62,9 |
| member of | thuộc tổ chức | 5 | 12,5 | 62,5 |
| event location | diễn ra tại | 14 | 22,2 | 55,2 |
| place of birth | quê quán | 21 | 20,7 | 52,4 |
| developed by | phát triển bởi | 16 | 52,4 | 50,0 |
| position held | giữ chức | 13 | 36,4 | 48,3 |
| family relation | quan hệ gia đình | 17 | 29,5 | 46,7 |
| owned by | thuộc sở hữu | 7 | 16,7 | 44,4 |
| founder of | sáng lập | 19 | 39,3 | 35,3 |
| located in | nằm ở | 13 | 12,2 | 34,8 |
| signed document | ký | 18 | 40,0 | 34,3 |
| successor of | kế nhiệm | 10 | 16,7 | 9,1 |

El modelo mejora en 14 de las 18 relaciones y empeora en 4 (`developed by`, `founder of`, `signed document` y, de forma acusada, `successor of`).

## Requisitos de hardware

- Parámetros: 466.576.896. Pesos en memoria: 1,87 GB en fp32 y 0,93 GB en fp16.
- Activaciones pico con batch 8: 0,32 GB en fp32 y 0,17 GB en fp16.
- VRAM total necesaria: aproximadamente 2,3 GB en fp32 y 1,2 GB en fp16. El autor indica explícitamente que cabe en una GPU de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Las medidas publicadas se tomaron sobre una NVIDIA A100-SXM4-80GB con torch 2.11.0+cu128 y CUDA 12.8, pero ese hardware está muy por encima del mínimo funcional.
- Cabe en GPU de consumo: sí, en tarjetas de gama de entrada y media (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090 con enorme holgura). También se publican filas medidas en CPU sobre un Intel Xeon a 2,20 GHz con 12 vCPU.
- Latencia en GPU (una frase, 6 etiquetas de entidad y 5 de relación): 13 palabras, p50 57,2 ms y p95 57,2 ms; 22 palabras, p50 57,5 ms y p95 58,8 ms; 62 palabras, p50 59,0 ms y p95 64,2 ms. La latencia es prácticamente plana respecto a la longitud de la frase, dominada por el coste fijo y no por la longitud de secuencia.
- Rendimiento por lotes en GPU con fp32: batch 1, 57,9 ms y 17,8 frases/s con 0,03 GB de activaciones; batch 4, 72,2 ms y 55,5 frases/s con 0,17 GB; batch 8, 117,9 ms y 68,1 frases/s con 0,17 GB. La tabla del model card se corta en esta última fila, por lo que no hay datos publicados para lotes mayores.
- Estas cifras están medidas en A100 y en un Xeon concreto; el autor advierte que en otro hardware deben interpretarse como orden de magnitud, no como garantía.
- Opciones de despliegue: la vía documentada es la librería `gliner` (`GLiNER.from_pretrained("belumind/goby-1-ie-vi")`), que carga el modelo con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, ni versiones en GGUF u otros formatos cuantizados.
- Existe un *Space* de demostración en HuggingFace para probar el modelo sin instalación local.

## Comparativa con modelos similares

El único modelo comparable con datos publicados en la información disponible es el propio modelo base, del que goby-1-ie-vi deriva.

| Modelo | Parámetros | Contexto | F1 estricto vi | F1 parcial vi | F1 estricto en | F1 parcial en | Licencia |
|---|---|---|---|---|---|---|---|
| goby-1-ie-vi | 466.576.896 | no disponible | 36,9 | 56,3 | 78,8 | 90,9 | Apache 2.0 |
| knowledgator/gliner-relex-large-v1.0 (base) | mismo encoder DeBERTa large | no disponible | 13,2 | 32,7 | 70,6 | 82,4 | no disponible en la información proporcionada |

Comparado con su base, goby-1-ie-vi multiplica por 2,8 el F1 estricto en vietnamita y añade 8,2 puntos de F1 estricto en inglés, con una deriva de pesos mínima (0,24 % en el encoder, 1,69 % en las cabezas). No se dispone de datos de otros modelos de extracción de relaciones en vietnamita (por ejemplo, alternativas basadas en XLM-R, PhoBERT o pipelines en cascada) en la información proporcionada, por lo que no se puede establecer una comparativa más amplia: **no disponible**.

## Limitaciones y advertencias

- Cuatro de las dieciocho relaciones empeoran respecto al modelo base, con un caso severo: `successor of` cae de 16,7 a 9,1 de F1. Si el caso de uso depende de sucesiones, hay que evaluarlo específicamente antes de adoptar el modelo.
- El conjunto de evaluación es pequeño: 267 frases y 283 tripletas. Aunque el bootstrap emparejado da intervalos que excluyen el cero, la incertidumbre por relación es alta en categorías con pocas muestras (`member of` tiene n=5, `owned by` n=7), donde un único acierto o fallo mueve el F1 varios puntos.
- El entrenamiento usa supervisión distante a partir de vi.wikipedia, una fuente intrínsecamente ruidosa: las etiquetas derivadas de heurísticas pueden contener errores que el modelo aprende y reproduce.
- Idiomas limitados a vietnamita e inglés. No hay evidencia de comportamiento en castellano ni en otras lenguas, y el uso con textos multilingües no evaluados es una extrapolación.
- Es un modelo de extracción, no generativo: no redacta, no razona paso a paso, no ejecuta código, no llama a herramientas y no puede operar como agente. Usarlo como sustituto de un LLM en tareas conversacionales no es viable.
- La decodificación es sensible a los umbrales. El autor recomienda `relation_threshold=0.7`; bajarlo a 0,5 aumenta el recall pero degrada la precisión de forma acusada. Cualquier despliegue en producción necesita calibrar ambos umbrales con datos propios.
- No se documenta la longitud máxima de contexto soportada, lo que impide planificar el troceado de documentos largos con una referencia fiable.
- No se ofrecen formatos cuantizados ni integraciones con servidores de inferencia habituales, lo que limita las opciones de escalado horizontal estándar.
- El repositorio acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha: no hay validación independiente por parte de la comunidad ni informes de terceros que confirmen las cifras publicadas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y de indicar los cambios realizados. No impone restricciones de uso, pero tampoco ofrece garantías.
- Las cifras de latencia y throughput proceden de una A100 y de un Xeon concretos; extrapolarlas a otras GPU o a CPU distintas puede desviarse notablemente.
- La tabla de *throughput* del model card está truncada en el batch 8, por lo que se desconoce el comportamiento en lotes mayores y el punto en el que el rendimiento se satura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/belumind/goby-1-ie-vi
- Modelo base: https://huggingface.co/knowledgator/gliner-relex-large-v1.0
- Demo en vivo (Space de HuggingFace): https://huggingface.co/spaces/johnathan2023/goby-1-ie-vi-demo
- Librería de inferencia GLiNER: https://github.com/urchade/GLiNER
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su autor ni su modelo base; los resultados obtenidos eran ajenos al objeto de la ficha (contenido sobre ChatGPT y GitHub Desktop) y no se han utilizado.
