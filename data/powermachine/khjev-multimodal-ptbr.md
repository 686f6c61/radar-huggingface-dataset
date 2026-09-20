# PowerMachine/khjev-multimodal-ptbr

## Resumen

KHJEV (identificador `PowerMachine/khjev-multimodal-ptbr`) es un modelo multimodal compacto en portugués de Brasil, publicado por el usuario PowerMachine como evolución del proyecto KHTST (linaje declarado AURORA → KHTST → KHJEV). Se presenta como la versión v10, que añade clasificadores paralelizables autoajustables y una ventana de contexto paralela de 256K tokens de entrada y 128K de salida. El modelo tiene 14,97 millones de parámetros, un vocabulario BPE de 16.384 tokens y cubre nueve tareas declaradas (modelado de lenguaje, noticias, puntuación, instrucciones, TTS, VQA, OCR, subtitulado de imagen y ASR), con encoders para imagen, audio y vídeo.

La arquitectura combina un transformer con enrutamiento mediante SOM (self-organizing map) de Kohonen, atención basada en SOM, unidades micro, un componente CNN-BiGRU y técnicas de decodificación especulativa tipo Medusa con predicción multi-token. El autor declara un estado integral con puertas de rollback, entrenamiento con DPO y PCGrad, y cuantización int8 mediante QAT con torchao. El entrenamiento reportado usó 3.548 registros reales en portugués de Brasil procedentes de 18 fuentes de HuggingFace, con un tiempo de 2,90 horas y un pico de RAM de 3.325 MB.

La relevancia del modelo es limitada y debe interpretarse con cautela: se trata de un experimento de investigación de escala muy reducida (0,1 GB de repositorio, cero descargas y cero likes en el momento de la consulta), sin pipeline declarado, sin resultados en benchmarks estándar y cuyas afirmaciones de rendimiento proceden únicamente de pruebas internas del propio autor. La licencia MIT facilita su reutilización comercial, pero la ausencia de validación independiente hace desaconsejable su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con enrutamiento SOM (Kohonen), som-attention, micro-units, MoE, componente CNN-BiGRU y prediccion multi-token tipo Medusa |
| Parametros totales | 14,97 M |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens de entrada y 128K tokens de salida (segun el autor); `comprimento_ctx = 256`, `janela_sliding = 192` |
| Tipos de cuantizacion | int8 (QAT con torchao); no se detallan otros formatos |
| Idiomas soportados | portugues (pt, pt-br) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,1 GB y no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El modelo se describe como un transformer multimodal con enrutamiento por S-SOM (self-organizing map) sobre un espacio latente compartido, complementado con atención basada en SOM, unidades micro y un módulo CNN-BiGRU. La versión v10 incorpora dos índices SOM independientes sobre el mismo espacio latente (m_max 2017 para entrada y m_max_saida 993 para salida), lo que según el autor permite una ventana paralela de 256K tokens de entrada y 128K de salida sin colisión. También sustituye CLIP y GPT-2 por embeddings hash propios basados en el lema de Johnson-Lindenstrauss con dimensión d=192, y añade clasificadores autoajustables en cuatro niveles (entrenamiento, inferencia, razonamiento y peticiones de usuario) con temperatura geométrica calibrada en línea mediante ECE y el método de Robbins-Monro. Incluye un kernel en Cython y C (`classificar_entropia_lote`) con un speedup declarado de entre 1,35 y 1,56 veces.

En cuanto al entrenamiento, el autor indica el uso de 3.548 registros reales en portugués de Brasil procedentes de 18 fuentes de HuggingFace, un tokenizador BPE de 16k idéntico al de la versión anterior y difusión en modo real. Se mencionan DPO (con rollback automático por regresión detectada), PCGrad para el alineamiento InfoNCE y cuantización int8 con QAT. La model card reconoce explícitamente que el fine-tuning de integración (2 épocas, learning rate 4e-4) empeoró la perplejidad y fue revertido por la puerta de calidad automática, de modo que el estado publicado mantiene la calidad de la versión v9 y los módulos nuevos quedan en "nacimiento neutro". El autor afirma que la suite de pruebas v10 pasa 29 de 29 comprobaciones y que el entrenamiento respetó un techo de 4 horas (2,90 h reales).

## Capacidades

- Generacion de texto y modelado de lenguaje en portugues de Brasil (tarea `lm`).
- Clasificacion y generacion en dominio periodistico (`noticia`) y restauracion de puntuacion (`pontuacao`).
- Seguimiento de instrucciones (`instrucao`) con una perdida interna reportada de 0,6604 en la version v10.
- Sintesis de voz (`tts`) con una perdida interna declarada de 0,4079.
- Respuesta visual a preguntas (`vqa`) e integracion de encoders de imagen, audio y video.
- Reconocimiento optico de caracteres (`ocr`) con perdida interna de 0,3327.
- Subtitulado o descripcion de imagenes (`imagem_caption`).
- Reconocimiento automatico de voz (`asr`) con perdida interna de 0,4298.
- Clasificadores paralelos autoajustables con calibracion de entropia en linea (cuatro niveles de operacion).
- Componentes declarados de agente ingeniero (`engineer-agent`), autorregulacion (`self-regulation`) y estado integral.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no; el modelo declara unicamente portugues.

## Casos de uso

- Prototipado academico de arquitecturas MoE con enrutamiento SOM: el modelo permite experimentar con enrutamiento por mapas autoorganizados y unidades micro en un presupuesto de computo minimo (14,97 M de parametros, 2,90 h de entrenamiento declaradas).
- Investigacion sobre decodificacion especulativa y prediccion multi-token: las tecnicas tipo Medusa declaradas lo convierten en un banco de pruebas de bajo coste para comparar estrategias de decodificacion acelerada.
- Experimentos de alineamiento con DPO y PCGrad: la model card documenta un ciclo completo de DPO con rollback automatico, reutilizable como referencia metodologica para estudiar la estabilidad del fine-tuning.
- Procesamiento de texto en portugues de Brasil en tareas auxiliares: restauracion de puntuacion y clasificacion de noticias sobre corpus periodisticos, siempre que se valide antes la calidad real en el dominio concreto.
- Pruebas de OCR y ASR de baja latencia: con un modelo de este tamano, la inferencia cabe en CPU o en cualquier GPU de consumo, lo que facilita prototipos de pipeline multimodal en entornos sin acelerador dedicado.
- Subtitulado de imagenes para aplicaciones educativas o de accesibilidad en portugues: util como primer eslabon de un pipeline cuando no se requiere precision de nivel comercial.
- Cuantizacion y despliegue en el borde: al soportar QAT int8, es un candidato para estudiar tecnicas de compresion en dispositivos con memoria limitada, dado el pico de RAM declarado de 3.325 MB durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas internas comparadas con la version anterior KHTST v9 bajo un protocolo propio:

| Metrica | KHTST v9 (base) | KHJEV v10 | Observacion declarada |
|---|---|---|---|
| ppl_lm | 2,7594 | 2,7896 (reejecucion) | Mismos pesos; delta atribuido al entorno |
| Perdida instruccion | 0,6829 | 0,6604 | −3,3% |
| Precision itm | 0,4375 | 0,5000 | +14,3% |
| rouge_l | 0,0287 | 0,0369 | +28,6% |
| Margen clip | 0,0194 | 0,0194 | Identico |
| Perdida OCR | 0,3327 | Identica | Protocolo bit a bit |
| Perdida ASR | 0,4298 | Identica | Protocolo bit a bit |
| Perdida TTS | 0,4079 | Identica | Protocolo bit a bit |
| Tiempo de entrenamiento | 3,24 h | 2,90 h | Techo de 4 h respetado |
| RAM pico | 3.262 MB | 3.325 MB | Limite de 3.580 MB respetado |

Estas cifras proceden de la evaluacion interna del autor, no de benchmarks publicos independientes, y el propio autor reconoce que parte de la variacion de la perplejidad es "sesgo de reejecucion del entorno". No se dispone de datos del `clip_score`, BLEU, CIDEr ni METEOR que aparecen en las metricas declaradas en los tags. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 14,97 M de parametros, el modelo ocupa del orden de decenas de megabytes en precision completa, por lo que es desplegable incluso sin GPU.
- GPU recomendadas: no disponible; no se especifica ninguna GPU en la model card. Dado el tamano, cualquier GPU de consumo moderna (por ejemplo, una RTX 3060 o superior) seria mas que suficiente, aunque esto no esta confirmado por el autor.
- Cabe en GPU de consumo: si, con margen amplio, segun el recuento de parametros del propio modelo.
- Opciones de despliegue: no disponible. No se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se especifica el formato de pesos.
- Latencia y throughput: no disponible. La unica cifra de rendimiento publicada es un speedup de 1,35 a 1,56 veces para el kernel Cython de clasificadores paralelos.
- Entrenamiento: el autor reporta un techo de 4 horas, con 2,90 horas reales y un pico de 3.325 MB de RAM, lo que sugiere que el ajuste se realizo en un equipo de gama alta de consumo o en CPU con memoria abundante.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento con modelos de la misma categoria, ya que no se han publicado benchmarks estandar. A continuacion se compara unicamente a nivel estructural con alternativas de escala pequena ampliamente conocidas; los datos de esas alternativas son de conocimiento publico general y no se ha ejecutado ninguna prueba comparativa.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| KHJEV multimodal PT-BR | 14,97 M | 256K entrada / 128K salida (segun el autor) | MIT | Multimodal, MoE con SOM, PT-BR |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Transformer causal, multilingue |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Transformer causal, principalmente ingles |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Transformer causal, ingles |

La comparacion de rendimiento real entre estos modelos y KHJEV no esta disponible, y la diferencia de orden de magnitud en numero de parametros y de datos de entrenamiento hace que cualquier extrapolacion sea especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos independientes: todas las cifras de rendimiento proceden de pruebas internas del autor, con protocolos propios y no reproducibles externamente.
- Escala muy reducida: 14,97 M de parametros es un orden de magnitud inferior a los modelos linguisticos utilizados en produccion, lo que limita severamente la coherencia, el conocimiento factual y la capacidad de razonamiento.
- Afirmaciones de contexto no verificadas: la ventana de 256K tokens de entrada y 128K de salida procede de teoremas citados en documentacion propia, sin validacion externa ni pruebas de recuperacion de informacion a larga distancia.
- Modelo unicamente en portugues: no declara soporte multilingue, por lo que su uso en castellano u otros idiomas no esta respaldado.
- Riesgo de alucinacion: con este numero de parametros y un corpus de entrenamiento de solo 3.548 registros, la generacion de contenido factualmente incorrecto es esperable en cualquier tarea abierta.
- La model card reconoce que el fine-tuning de integracion de la v10 regreso la perplejidad y fue revertido, de modo que las capacidades nuevas estan "operacionales pero en nacimiento neutro", sin mejora de calidad demostrada.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin `pipeline` declarado y sin formato de pesos especificado, lo que dificulta su uso directo.
- Fecha de creacion registrada como 2026-09-20, posterior a la fecha de la consulta, un dato anomali que conviene verificar antes de cualquier uso.
- La model card proporcionada aparece truncada al final (suite de pruebas v1-v6), por lo que falta documentacion sobre la validacion completa.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantia alguna por parte del autor; la responsabilidad de validar el modelo recae integramente en quien lo despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PowerMachine/khjev-multimodal-ptbr
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente resultados no relacionados sobre un portal de juegos).
