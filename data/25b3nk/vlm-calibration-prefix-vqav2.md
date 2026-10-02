# 25b3nk/vlm-calibration-prefix-vqav2

# vlm-calibration-prefix-vqav2

## Resumen

vlm-calibration-prefix-vqav2 es un modelo pequeno de respuesta visual a preguntas (VQA) de tipo si/no, disenado como artefacto de investigacion sobre decisiones calibradas. Lo desarrolla el usuario 25b3nk y se apoya en dos componentes publicos: un encoder de imagen SigLIP2-base congelado y un encoder de texto ModernBERT-base afinado. El modelo no genera texto: responde en una sola pasada forward comparando los logits de los tokens " yes" y " no" en la posicion de la mascara `[MASK]`.

La innovacion principal es la interfaz entre modalidades. El vector agrupado de SigLIP2 (768 dimensiones) se transforma en un unico token prefijo que se antepone a las embeddings del prompt de texto, de modo que no hay proyector tipo Q-Former ni cross-attention: la vision entra como un token mas. La rama visual permanece congelada y solo se entrena ModernBERT, la cabeza MLM preentrenada, el ancla, la proyeccion y la puerta escalar.

El modelo se entrena sobre el pool completo de 214.476 filas derivado de lmms-lab/VQAv2, con etiquetas duras, y se evalua en un split de val2014 de 8.930 preguntas si/no disjunto por imagen. El checkpoint publicado (semilla 0) obtiene 0.6791 de exactitud, frente a 0.5511 de la referencia ciega y un suelo de mayoria de 0.5106. Su relevancia actual es metodologica: demuestra que una calibracion post-hoc con una unica temperatura reduce el ECE de 0.0750 a 0.0161 en un clasificador multimodal no autorregresivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (ModernBERT-base) con token prefijo visual inyectado en las embeddings de entrada |
| Parametros totales | 150.248.128 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de answerdotai/ModernBERT-base) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en fp32 (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32), acompanado de config.json y modeling.py |
| Modelos base | answerdotai/ModernBERT-base (afinado), google/siglip2-base-patch16-224 (congelado, no incluido en el repo) |
| Dataset de entrenamiento | lmms-lab/VQAv2 (subconjunto si/no, pool de 214.476 filas) |
| Pipeline | visual-question-answering |
| Tamano del repositorio | 0,6 GB |
| Prefijos visuales por prompt | 1 (`prefix_k = 1`) |
| Temperatura de calibracion (este checkpoint) | 1,81 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-base con una cabeza de enmascaramiento de lenguaje (MLM) reutilizada como clasificador binario. La imagen se procesa con SigLIP2-base, que permanece congelado y solo aporta su `pooler_output` de 768 dimensiones. Ese vector pasa por una LayerNorm de entrada, una proyeccion, una LayerNorm de salida y una puerta escalar, y se combina con un token ancla aprendido segun la formula `prefix = anchor + g_max * tanh(alpha) * LN_out(proj(LN_in(v)))`. El ancla se inicializa a partir de la embedding del token `" image"` y `alpha` se inicializa a 0, de forma que el modelo arranca siendo exactamente el modelo de solo texto; `g_max` limita la norma del termino visual a la norma del ancla. El prompt de inferencia es `"{question} Answer: [MASK]"` y la respuesta se lee comparando los logits de `" yes"` y `" no"` con la cabeza MLM preentrenada, sin cabeza de clasificacion nueva.

En el entrenamiento se ajustan ModernBERT (encoder y cabeza MLM), el ancla, la proyeccion, la LayerNorm y la puerta; SigLIP2 no se entrena ni se redistribuye. Los datos proceden del pool completo de 214.476 filas construido a partir de lmms-lab/VQAv2, con etiquetas duras y caracteristicas de imagen calculadas sobre JPEG recodificados con la calidad por defecto de PIL. El repositorio contiene la semilla 0 de la configuracion emparejada (imagen + pregunta); las otras dos semillas, los modelos de referencia ciegos y la ablacion con etiquetas blandas se mencionan en los resultados pero sus pesos no se publican. No se documenta RLHF ni DPO. La calibracion es post-hoc: se ajusta una unica temperatura escalar `T` por checkpoint sobre un split de calibracion retenido, de modo que `p_yes = sigmoid((logit_yes - logit_no) / T)`.

## Capacidades

- Respuesta binaria si/no a preguntas sobre una imagen en una unica pasada forward, sin decodificacion autorregresiva y sin texto generado.
- Salida de probabilidad calibrada (`p_yes`), probabilidad sin calibrar (`p_yes_raw`) y margen `logit_yes - logit_no` para cada par imagen-pregunta.
- Recodificacion JPEG opcional en la inferencia (`jpeg_roundtrip=True` por defecto) para reproducir el preprocesado usado en entrenamiento.
- Comprension visual basica: el modelo supera de forma consistente a su version ciega, con una brecha de vision de +0,1227 puntos de exactitud.
- Funcionamiento en CPU con un consumo aproximado de 1 GB de RAM en fp32 mas unos 0,4 GB del encoder SigLIP2.
- No soporta generacion de texto libre, tool calling, function calling, agentes, razonamiento multi-paso ni conversaciones multiturno.
- No soporta vision mas alla de la pregunta binaria: no hay descripcion de imagenes, OCR declarado, deteccion ni grounded captioning.
- Multilingue: no; unicamente ingles.

## Casos de uso

- Investigacion en calibracion multimodal: sirve como banco de pruebas controlado para estudiar temperature scaling, ECE y NLL en un clasificador vision-lenguaje que no genera texto, con la ventaja de que la referencia ciega aísla la contribucion de la imagen.
- Pre-anotacion en curacion de datasets VQA: dado un banco de preguntas si/no y sus imagenes, el modelo puede etiquetar candidatos y descartar los de baja confianza antes de la revision humana, gracias a que `p_yes` esta calibrado y permite fijar umbrales con significado probabilistico.
- Filtrado en cascada dentro de un pipeline multimodal: una verificacion binaria barata (150 M de parametros, una pasada, ~1,4 GB de RAM) puede resolver los casos sencillos y derivar solo los ambiguos a un VLM generativo mucho mayor.
- Analisis de sesgo y atajos visuales: el protocolo del propio proyecto (comparacion emparejada frente a modelo ciego y prueba de shuffle de imagenes, con una caida de 0,142 al desordenar) es directamente reutilizable para medir hasta que punto un modelo usa la imagen o el prior linguistico.
- Control de calidad con umbrales calibrados: en tareas de moderacion o verificacion donde la decision sea binaria, el ECE de 0,0161 tras el escalado permite fijar politicas de aceptacion/rechazo con una estimacion razonable de la tasa de error.
- Docencia y reproducibilidad de pipelines de inferencia: `modeling.py` es autocontenido y permite reconstruir el modelo y ejecutarlo en CPU, lo que facilita ejercicios sobre inyeccion de tokens prefijo, congelacion de encoders y calibracion post-hoc.
- Verificacion de atributos visuales en catalogos o inventarios: preguntas del tipo "¿aparece una mano en el reloj?" o "¿hay texto en el cartel?" pueden resolverse de forma masiva y no generativa, siempre que el dominio se parezca al de VQAv2.
- Auditoria de un encoder visual concreto: al mantener SigLIP2 congelado y cambiarlo por otra variante, el diseno permite medir la calidad del vector agrupado de un encoder para decisiones binarias sin reentrenar la rama visual.

## Benchmarks y rendimiento

Todas las cifras proceden del split de evaluacion yes/no de VQAv2 val2014 definido por el proyecto: 8.930 preguntas, division por `md5(image_id) % 100` para que ninguna imagen de evaluacion aparezca en entrenamiento ni en calibracion. La metrica es coincidencia exacta con `multiple_choice_answer` (si o no), no la exactitud suave estandar de VQAv2, por lo que no es comparable con cifras publicadas de VQAv2. El suelo de mayoria por tipo de pregunta en este split es 0,5106.

| Metrica | Modelo emparejado (principal) | Referencia ciega (sin imagen) |
|---|---|---|
| Exactitud, media de semillas | 0,6738 (0,6791 / 0,6758 / 0,6666) | 0,5511 (0,5536 / 0,5521 / 0,5477) |
| Brecha de vision (emparejado - ciego) | +0,1227 | no aplica |
| Caida de exactitud al desordenar las imagenes de evaluacion | 0,142 | no disponible |
| ECE, antes -> despues del temperature scaling | 0,0750 -> 0,0161 (0,0096 / 0,0189 / 0,0199) | 0,0270 -> 0,0096 |
| Temperatura ajustada (s0 / s1 / s2) | 1,81 / 1,95 / 1,26 | 1,12 / 1,25 / 1,84 |
| NLL de evaluacion, antes -> despues de T | 0,6097 -> 0,5815 | 0,6806 -> 0,6768 |

El checkpoint publicado en este repositorio es la semilla 0 de la configuracion emparejada con etiquetas duras y obtiene 0,6791 de exactitud. La informacion disponible sobre AUROC queda truncada en la model card, por lo que no se reproduce. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales estandar, y no procede inferirlos dado que el modelo solo emite respuestas si/no.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB en fp32 para el modelo mas unos 0,4 GB para SigLIP2, es decir, del orden de 1,4 GB en total. La model card indica que funciona en CPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de memoria es suficiente; no se requiere A100, H100 ni RTX 4090. Para lotes grandes solo hace falta memoria proporcional al tamano de lote.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en inferencia solo CPU.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF. El unico camino soportado es PyTorch con `transformers` reciente, cargando `modeling.py` desde el Hub; la model card indica que se ha probado con torch 2.14, transformers 5.17.0 y safetensors 0.8.0, y advierte de que versiones antiguas de transformers no estan probadas.
- Latencia y throughput: no se publican cifras. Al ser no autorregresivo resuelve cada par imagen-pregunta en una sola pasada forward, por lo que su coste por consulta es muy inferior al de un VLM generativo de tamano comparable, pero cualquier numero concreto seria una estimacion no respaldada por la informacion disponible.
- Almacenamiento: el repositorio ocupa 0,6 GB; hay que anadir la descarga aparte del encoder SigLIP2 y del tokenizer y la configuracion de ModernBERT.

## Comparativa con modelos similares

La informacion disponible no incluye cifras de modelos externos comparables, y la metrica empleada (coincidencia exacta en un split propio de preguntas si/no de VQAv2) no es equiparable a la exactitud suave estandar de VQAv2, por lo que cualquier comparacion numerica con VLM publicados seria invalida. Como referencia interna del propio proyecto:

| Modelo | Parametros | Entrada visual | Licencia | Disponibilidad | Exactitud en el split del proyecto |
|---|---|---|---|---|---|
| vlm-calibration-prefix-vqav2 (emparejado, semilla 0) | 150.248.128 | SigLIP2-base congelado, 1 token prefijo | apache-2.0 | pesos publicados en este repo | 0,6791 |
| Referencia ciega (solo pregunta) | misma arquitectura sin rama visual util | ninguna | apache-2.0 (mismo proyecto) | pesos no publicados | 0,5511 (media) |
| Semillas 1 y 2 de la misma configuracion | 150.248.128 | SigLIP2-base congelado | apache-2.0 (mismo proyecto) | pesos no publicados | 0,6758 y 0,6666 |
| answerdotai/ModernBERT-base | no disponible en la informacion proporcionada | ninguna | apache-2.0 | pesos publicos | no disponible |
| VLMs generativos tipo LLaVA o BLIP-2 | no disponible | si | no disponible | publicos | no comparable (metrica distinta) |

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo responde preguntas binarias si/no sobre una imagen; no genera texto, no mantiene conversaciones y no acepta instrucciones libres.
- Solo ingles. El prompt `"{question} Answer: [MASK]"` y los tokens `" yes"` y `" no"` estan en ingles, y no se documenta evaluacion en otros idiomas.
- Riesgo de error elevado: la exactitud de 0,6791 implica que aproximadamente un tercio de las respuestas son incorrectas, con un suelo de mayoria de 0,5106; no es apto para decisiones criticas sin supervision humana.
- Dependencia de priors linguisticos: la referencia ciega alcanza 0,5511 y desordenar las imagenes de evaluacion provoca una caida de 0,142, lo que indica que parte del rendimiento se explica por regularidades del tipo de pregunta y no solo por el contenido visual.
- Sensibilidad al preprocesado: las caracteristicas de entrenamiento se calcularon sobre JPEG recodificados con la calidad por defecto de PIL; omitir la recodificacion puede degradar los resultados.
- Calibracion dependiente del dominio: la temperatura se ajusta en un split de calibracion del mismo proyecto, por lo que el ECE de 0,0161 no se transfiere necesariamente a otras distribuciones o idiomas.
- Artefacto de investigacion, no de produccion: 0 descargas y 0 likes, sin senales de uso real, sin soporte de servidores de inferencia habituales y sin cuantizaciones publicadas.
- Cobertura parcial del experimento: solo se publica la semilla 0; los otros dos seeds, las referencias ciegas y la ablacion con etiquetas blandas no se redistribuyen, lo que limita la reproducibilidad completa del estudio.
- Reutilizacion del encoder visual: SigLIP2 no viene incluido y se carga por identificador, de modo que un cambio en ese repositorio externo puede alterar los resultados.
- Licencia: apache-2.0 permite uso comercial del checkpoint publicado, pero se ofrece sin garantias y no cubre los pesos de SigLIP2, que se rigen por su propia licencia.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio son de 2026, y las versiones de librerias citadas (torch 2.14, transformers 5.17.0) son posteriores a las disponibles en el momento de redactar esta ficha; conviene verificarlas antes de desplegar.
- La model card no documenta sesgos demograficos, geograficos ni culturales especificos, mas alla de los sesgos inherentes a VQAv2 y de la dependencia de priors de pregunta ya senalada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/25b3nk/vlm-calibration-prefix-vqav2
- Modelo base de texto: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo base de vision: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset de entrenamiento: https://huggingface.co/datasets/lmms-lab/VQAv2
- Paper referenciado en las etiquetas del repositorio (titulo no especificado en la informacion disponible): https://arxiv.org/abs/2502.14786
- Paper referenciado en las etiquetas del repositorio (titulo no especificado en la informacion disponible): https://arxiv.org/abs/2412.13663
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los unicos enlaces obtenidos no guardan relacion con el proyecto, por lo que no se incluyen.
