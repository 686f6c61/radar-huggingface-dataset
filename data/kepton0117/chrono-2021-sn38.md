# kepton0117/chrono-2021-sn38

## Resumen

chrono-2021-sn38 es un modelo de lenguaje causal de aproximadamente 2,02 mil millones de parametros, publicado por el usuario kepton0117 en HuggingFace, que consiste en un continue-pretraining (CPT) de parametros completos del modelo `anacoluthe89/chrono-2020` con fecha de corte fijada en el 31 de diciembre de 2021. Forma parte del ecosistema de la subnet 38 de Bittensor, una red descentralizada de entrenamiento en la que distintos participantes producen modelos "cronologicos" con conocimiento limitado a un ano concreto para evitar la contaminacion por datos posteriores.

El modelo emplea la arquitectura propietaria denominada `sn38-nanochrono`, un transformer decoder-only de 28 capas con dimension oculta 1792 y ventana de contexto de 2048 tokens. El checkpoint publicado corresponde al paso 4000 de entrenamiento y se ha entrenado con unos 5.350 millones de tokens empaquetados, mezclando dumps de FineWeb de 2021, FineWeb de anos anteriores y el dump de Wikipedia en ingles de diciembre de 2021.

Su relevancia es fundamentalmente de investigacion: sirve como referencia para estudiar fuga temporal en corpus de entrenamiento, como base para generar texto libre de contaminacion posterior a 2021 y como pieza de la competicion de la subnet 38, donde se evalua la similitud coseno frente al modelo del ano anterior (0,9294 en este pin) con un umbral de "copia" establecido en 0,95. No es un modelo alineado por instrucciones ni tiene benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sn38-nanochrono`, transformer decoder-only causal (28 capas, hidden 1792, seq 2048) |
| Parametros totales | 2.018.511.234 (~2,02B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en `safetensors`; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (los corpus de entrenamiento son mayoritariamente en ingles: FineWeb y `brimmann2/enwiki-dec2021`) |
| Licencia | other (sin texto de licencia detallado en la informacion disponible) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y carpeta `recipe/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia `sn38-nanochrono`: 28 capas, dimension oculta 1792 y longitud de secuencia 2048. No se dispone de informacion sobre el numero de cabezas de atencion, el vocabulario, el uso de GQA/MQA, la funcion de activacion ni la normalizacion empleada. El entrenamiento es un continue-pretrain causal de parametros completos sobre el modelo base `anacoluthe89/chrono-2020` (commit `633eb832c3de8eceb0b5bba1c5fb94faa8e777c6`, UID 131), con la perdida estandar de entropia cruzada desplazada un token. No se uso LoRA ni SFT de instrucciones.

La receta concreta que produjo el checkpoint es inusualmente detallada: 8 GPU H200 en DDP, micro-batch 16 por GPU, acumulacion de gradiente 2, lo que da 524.288 tokens por paso; optimizador AdamW con weight decay 0,1 y betas (0,9; 0,95); schedule de decaimiento coseno con 3% de warmup; y una tasa de aprendizaje de 1e-3, notablemente alta, que el autor justifica indicando que 1e-4 y 3e-4 dejaban la similitud coseno estancada en torno a 0,999 (es decir, el modelo apenas se diferenciaba del base). Los datos se componen de dumps de FineWeb del ultimo trimestre de 2021 (60%), FineWeb anterior de 2017-2020 (15%, funcionando como replay) y `brimmann2/enwiki-dec2021` (25%), con filtrado de documentos cortos, de navegacion o repetitivos (~12,5% descartado) y empaquetado por concatenacion con EOS entre documentos, cortando cada 2048 tokens. El total empaquetado es de 2.610.770 secuencias de 2048 tokens, aproximadamente 5,35 mil millones de tokens. La advertencia explicita del autor es no usar FineWeb `name='default'` ni Wikipedia `20220301.en` porque filtran contenido de 2022 en adelante.

## Capacidades

- Generacion de texto causal en ingles: continuacion de documentos, articulos y texto libre con estilo y vocabulario consistentes con el corte de 2021.
- Modelado de conocimiento historico limitado: al haberse entrenado exclusivamente con datos hasta el 31 de diciembre de 2021, no deberia contener informacion de 2022 ni posterior (salvo fuga residual de los corpus).
- Generacion condicionada por prompt: admite entrada de hasta 2048 tokens en formato texto plano.
- No soporta tool calling ni function calling: no hay plantilla de chat, ni tokens especiales de herramienta, ni entrenamiento de instrucciones.
- No soporta agentes ni razonamiento multi-paso explicito: no se ha aplicado RLHF, DPO ni SFT de razonamiento.
- Capacidades multilingues: no documentadas; el corpus es practicamente monilingue en ingles, por lo que el rendimiento en castellano u otros idiomas es previsiblemente pobre.
- No tiene vision, audio ni modo "thinking".
- Utilidad como modelo base: puede servir de punto de partida para fine-tuning posterior, aunque su licencia "other" introduce incertidumbre legal.

## Casos de uso

- Investigacion sobre fuga temporal en LLM: se puede comparar la probabilidad asignada a hechos posteriores a 2021 frente a la de hechos anteriores para cuantificar cuanto conocimiento post-cutoff ha filtrado el corpus, usando la fecha de corte declarada como linea base.
- Generacion de datos sinteticos "de epoca": producir texto con vocabulario, eventos y contexto propios de 2021 para aumentar datasets historicos o entrenar clasificadores temporales sin contaminacion.
- Evaluacion de modelos de recuperacion y busqueda temporal: usar el modelo como generador de consultas o documentos con marca temporal controlada para probar sistemas de recuperacion sensibles al tiempo.
- Participacion en la subnet 38 de Bittensor: el checkpoint es directamente utilizable como punto de partida para un minero que quiera continuar el entrenamiento hacia 2022 manteniendo la similitud coseno por debajo del umbral de copia de 0,95.
- Reproducibilidad de recetas de entrenamiento a escala 2B: la carpeta `recipe/` incluye lanzador, trainer, construccion de datos y filtros, lo que permite reproducir el pipeline en 8 GPU H200 y estudiar el efecto de tasas de aprendizaje altas (1e-3) en continue-pretraining.
- Base para clasificacion o extraccion de caracteristicas: dado su tamano reducido, se puede afinar con cabezas de clasificacion para tareas de NLP sobre textos historicos o de dominio acotado.
- Demostraciones docentes sobre decodificacion y sesgos de corpus: al ser un modelo pequeno sin alineacion, resulta practico para ilustrar como un LM base completa texto y que sesgos arrastra de sus fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es la similitud coseno frente al modelo UID 131 (su base) en el pin concreto del paso 4000, que es de 0,9294, por debajo del umbral de 0,95 que la subnet considera "copia". No hay cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad sobre conjuntos de validacion.

## Requisitos de hardware

- VRAM para pesos (calculo a partir de 2.018.511.234 parametros): en BF16/FP16 unos 4,04 GB; en INT8 unos 2,02 GB; en 4 bits unos 1,01 GB.
- VRAM adicional para cache KV y activaciones: estimacion de aproximadamente 0,4 GB en FP16 para la ventana completa de 2048 tokens si la atencion fuese MHA pura (28 capas x 2 x 1792 x 2048 x 2 bytes); con GQA seria menor, pero se desconoce la configuracion real.
- Cabe holgadamente en GPU de consumo: una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o similar puede ejecutar inferencia en BF16 sin cuantizar; con cuantizacion de 4 bits cabe incluso en GPUs de 6-8 GB.
- GPU de datacenter: el autor uso 8x H200 unicamente para el entrenamiento en DDP; para inferencia no se requieren GPUs de ese calibre.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que es el camino nativo. Para vLLM, TGI, llama.cpp u Ollama seria necesario convertir los pesos y, con toda probabilidad, registrar la arquitectura `sn38-nanochrono` desde el repositorio de codigo del autor, ya que no es una arquitectura incluida en transformers.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No existen datos de rendimiento comparativo publicados para este modelo, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Corte temporal |
|---|---|---|---|---|---|
| chrono-2021-sn38 | ~2,02B | 2048 | other | HuggingFace, transformers | 31-12-2021 |
| anacoluthe89/chrono-2020 (base) | no disponible (mismo orden, ~2B) | no disponible | no disponible | HuggingFace | 2020 |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache-2.0 | HuggingFace, transformers, vLLM, GGUF | no aplica (sin corte declarado) |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache-2.0 | HuggingFace, transformers, llama.cpp, GGUF | no aplica |
| Gemma-2-2B | 2,61B | 8.192 | licencia Gemma | HuggingFace, transformers, GGUF | no aplica |

La diferencia funcional clave es que chrono-2021-sn38 es el unico de la tabla disenado explicitamente con un corte temporal estricto y sin alineacion por instrucciones, mientras que los otros tres son modelos instruct/chat sujetos a licencias permisivas o estandarizadas y con ventanas de contexto entre 4 y 16 veces mayores.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no dispone de plantilla de chat ni de entrenamiento SFT/RLHF/DPO, por lo que no debe usarse como asistente conversacional directo.
- Riesgo de alucinacion elevado: es un LM base entrenado con 5,35 mil millones de tokens, una cantidad muy inferior a la de modelos de su tamano producidos industrialmente, y no tiene mecanismos de calibracion o rechazo.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos, resumenes extensos o conversaciones multi-turno.
- Sesgos: entrenado sobre FineWeb y Wikipedia en ingles, hereda los sesgos de sesgo de seleccion, sobrerrepresentacion de contenido en ingles y sesgos de genero, origen y religion presentes en esas fuentes.
- Idioma: practicamente monilingue en ingles; el rendimiento en castellano no esta documentado y es previsiblemente deficiente.
- Fuga temporal: el propio autor advierte que usar determinadas configuraciones de FineWeb o Wikipedia filtra datos de 2022, y la mezcla de replay (15% de FineWeb 2017-2020) introduce contenido anterior al corte, no posterior, pero conviene verificar empiricamente la ausencia de contenido post-2021.
- Licencia "other" sin texto aclaratorio: no se especifican permisos de uso comercial, redistribucion ni obras derivadas, lo que supone un riesgo legal relevante para cualquier uso en produccion.
- Dependencia de codigo externo: cargar el modelo puede requerir la implementacion de `sn38-nanochrono` del repositorio GitHub del autor, ya que no forma parte de las arquitecturas estandar de transformers.
- Trazabilidad: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni evaluacion independiente; el checkpoint esta fijado a un commit concreto (`f62e238265e3ca4a4ed20b300475513446d9e1fc`) y cualquier otro pin puede diferir.
- Fechas de creacion y actualizacion del repositorio (18-09-2026) son posteriores a la fecha de corte del modelo, lo cual es coherente con el diseno pero conviene tenerlo en cuenta al interpretar metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kepton0117/chrono-2021-sn38
- Modelo base: https://huggingface.co/anacoluthe89/chrono-2020
- Dataset y scripts de entrenamiento: https://huggingface.co/datasets/kepton0117/sn38-train-2021
- Codigo del proyecto: https://github.com/kepton0117/sn38
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos eran foros sin relacion con el tema.
