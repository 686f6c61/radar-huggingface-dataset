# dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.0

## Resumen

GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.0 es un modelo de lenguaje de 16M de parametros entrenado con 8.000 millones de tokens del corpus the Pile deduplicado, siguiendo el estilo arquitectonico de OLMo. Forma parte del conjunto de 108 modelos (de 4M a 75M de parametros) publicados por el laboratorio dill-lab junto con el articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306), cuyos autores son Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta.

El proposito del modelo no es la explotacion comercial ni el uso en produccion, sino servir como unidad experimental controlada. El articulo investiga si las propiedades geometricas de la matriz de unembedding, en concreto su rango efectivo, permiten estimar el rendimiento downstream. La conclusion es negativa: el rango efectivo no predice de forma fiable el rendimiento, aunque suele aparecer elevado en los mejores modelos, y el rango bajo coocurre con degradacion en fases tardias del entrenamiento en lugar de causarla. Las decisiones de preentrenamiento (tamano de batch, weight decay) moldean fuertemente estas metricas geometricas.

Cada configuracion del conjunto varia de forma controlada el tamano de modelo, el presupuesto de tokens, el tamano de batch, el learning rate, el weight decay y el decaimiento final del learning rate. Este repositorio concreto corresponde a la variante con batch de 32 secuencias de 2048 tokens, learning rate pico de 0,0087, weight decay de 0,1 y `alpha_f` = 0.0 (el learning rate decae hasta cero al final del entrenamiento segun un schedule coseno). Es relevante para investigadores que estudien leyes de escalado, dinamica de entrenamiento o artefactos de investigacion reproducibles con checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 16M (tamano declarado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada de forma explicita; las secuencias de entrenamiento son de 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | no declarados; el corpus de entrenamiento (the Pile deduplicado) es predominantemente en ingles |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch, sin safetensors), con `config.json` de HuggingFace y `config.yaml` original de OLMo |
| Tokens de entrenamiento | 8.000 millones |
| Batch size | 32 secuencias de 2048 tokens |
| Learning rate pico | 0,0087 (schedule coseno) |
| Weight decay | 0,1 |
| Decaimiento final de LR (`alpha_f`) | 0.0 |
| Checkpoints publicados | 41 ramas (`step0` a `step122081`); `main` apunta al checkpoint final |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 16M de parametros con la implementacion OLMo (`hf_olmo`), la misma familia de codigo empleada por AI2 para OLMo. La carga requiere instalar `ai2-olmo` e importar `hf_olmo` para registrar `OLMoForCausalLM` en `transformers`. El repositorio sigue la convencion de la suite Pythia en cuanto a organizacion: cada paso de entrenamiento subido es una rama independiente, y `main` contiene el checkpoint final. Los archivos `data-indices/` y `train_data/global_indices.npy` documentan el orden exacto en que se consumieron los datos de entrenamiento, lo que permite reproducir el curriculum de datos token a token.

El entrenamiento se realizo sobre EleutherAI/the_pile_deduplicated, la version deduplicada del Pile, con un presupuesto de 8.000 millones de tokens. La model card no menciona fases de RLHF, DPO, SFT ni ajuste de instrucciones: se trata de un modelo base de preentrenamiento puro. La innovacion del trabajo no esta en la arquitectura, sino en el diseno experimental: el conjunto completo de 108 modelos permite aislar el efecto de hiperparametros concretos (batch size, weight decay, learning rate pico, presupuesto de tokens, decaimiento final) sobre metricas geometricas del modelo y sobre el rendimiento final, manteniendo constantes el resto de factores. La nomenclatura del repositorio codifica todos esos hiperparametros en el propio nombre.

## Capacidades

- Generacion de texto autorregresiva a partir de un prompt, con la fluidez limitada que impone un modelo de 16M de parametros entrenado con 8.000 millones de tokens.
- Modelado de lenguaje base: continuacion de texto y calculo de probabilidades sobre secuencias, util para evaluaciones de perplejidad.
- Extraccion de representaciones internas (estados ocultos, matriz de unembedding) para analisis de geometria, rango efectivo y espectro singular.
- Analisis de dinamica de entrenamiento mediante los 41 checkpoints intermedios publicados.
- Reproduccion exacta del orden de datos de entrenamiento gracias a los indices publicados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento explicito.
- No se documentan capacidades multilingues, de vision ni de audio.
- No se documenta ajuste por instrucciones: el modelo no esta entrenado para seguir ordenes.

## Casos de uso

- Reproduccion de experimentos de geometria latente: cargar distintos checkpoints con `revision="stepN"` y calcular el rango efectivo de la matriz de unembedding para replicar los analisis del articulo ICML 2026.
- Estudios de leyes de escalado: este modelo es una de las 108 piezas del conjunto GeoLadder, por lo que se puede comparar directamente con el resto de configuraciones manteniendo constante la arquitectura y variando un unico hiperparametro.
- Analisis de la dinamica de entrenamiento: los 41 checkpoints permiten trazar la evolucion de la perdida, del espectro de pesos y de las representaciones a lo largo de 122.081 pasos sin necesidad de reentrenar.
- Investigacion sobre orden y curriculum de datos: los indices globales publicados permiten correlacionar cambios en el rendimiento con el subconjunto del Pile consumido en cada franja de pasos.
- Pruebas de infraestructura y CI: su tamano minimo lo hace idoneo para validar pipelines de carga de modelos legacy (`hf_olmo` + `transformers`), scripts de conversion de pesos o verificaciones de integridad en entornos de integracion continua sin coste de GPU.
- Docencia y laboratorios: sirve como ejemplo didactico completo de un transformer a escala reducida, con pesos, configuracion y trazabilidad de datos incluidos.
- Auditoria de contaminacion de datos: los indices de entrenamiento permiten comprobar si una secuencia concreta del Pile fue vista por el modelo y en que paso.
- Prototipado rapido de evaluaciones: al ejecutarse en CPU, permite probar harness de evaluacion o metricas nuevas antes de escalarlas a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra tarea estandar, ni tampoco comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 16M de parametros, los pesos ocupan del orden de decenas de megabytes en coma flotante de 32 bits, por lo que la huella es despreciable frente a cualquier GPU actual.
- GPU recomendadas: no aplica ninguna recomendacion especifica; cualquier GPU consumer (RTX 3060, RTX 4090, e incluso iGPU) es suficiente. Para analisis de representaciones a gran escala, una A100 o H100 solo aportaria ventaja por paralelismo de lotes, no por memoria.
- Inferencia en CPU: viable. El modelo cabe en memoria RAM convencional y puede ejecutarse sin acelerador.
- Opciones de despliegue: la ruta documentada es `transformers` junto con el paquete `ai2-olmo` (`import hf_olmo`). No se publican pesos en GGUF, por lo que `llama.cpp` u `Ollama` requeririan una conversion previa. No hay confirmacion de soporte en vLLM, TGI ni SGLang para la arquitectura legacy `hf_olmo`.
- Latencia y throughput estimados: no se han publicado medidas. Dado el tamano, el coste estara dominado por el overhead del runtime y por el proceso de carga del checkpoint, no por el calculo.
- Almacenamiento: el repositorio completo ocupa 4,9 GB; descargar una sola rama reduce considerablemente ese espacio.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Licencia | Checkpoints intermedios |
|---|---|---|---|---|---|
| GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.0 | 16M | 8B | 2048 (secuencias de entrenamiento) | no disponible | 41 (`step0`-`step122081`) |
| Pythia-14M (EleutherAI) | 14M | 300B (segun documentacion publica) | 2048 | Apache 2.0 | 154 (segun documentacion publica) |
| Pythia-70M (EleutherAI) | 70M | 300B (segun documentacion publica) | 2048 | Apache 2.0 | 154 (segun documentacion publica) |
| SmolLM-135M (HuggingFace) | 135M | 600B | 2048 | Apache 2.0 | no disponible en la informacion consultada |

Nota: los valores de las filas correspondientes a modelos de terceros proceden de su documentacion publica y deben verificarse contra las model cards oficiales antes de citarlos. El modelo objeto de esta ficha esta pensado como artefacto de investigacion con presupuesto de tokens muy inferior (8B frente a 300B o 600B) y sin licencia declarada, por lo que no es un sustituto directo de los modelos de la comparativa en tareas de generacion de texto.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus the Pile contiene texto web, codigo, libros y articulos cientificos, con los sesgos de genero, raza, religion e ideologia asociados a esas fuentes. La model card no documenta ningun analisis de sesgos ni proceso de mitigacion.
- Riesgo de alucinacion: muy alto. Un modelo denso de 16M de parametros dispone de capacidad de almacenamiento factual muy limitada y producira texto plausible pero no fiable.
- Limitacion de contexto: la model card no declara una ventana de contexto de inferencia; las secuencias de entrenamiento son de 2048 tokens, por lo que no hay garantia de comportamiento coherente mas alla de esa longitud.
- Limitacion idiomatica: el corpus de entrenamiento es predominantemente en ingles. No se declara soporte de castellano ni de otros idiomas, y el rendimiento fuera del ingles sera previsiblemente pobre.
- Sin ajuste de instrucciones: no es un modelo de chat ni un asistente. No seguira ordenes ni mantendra un formato de conversacion sin un ajuste posterior.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial o de redistribucion; conviene contactar con los autores antes de cualquier uso fuera del ambito de investigacion.
- Dependencia de codigo legacy: la carga requiere el paquete `ai2-olmo` y la arquitectura `hf_olmo`, lo que puede complicar la integracion con ecosistemas modernos de inferencia y con versiones recientes de `transformers`.
- Formato de pesos: solo `pytorch_model.bin`, sin safetensors. La carga de archivos pickle conlleva riesgos de seguridad si la procedencia no es de confianza.
- Uso previsto: es un artefacto de investigacion. No debe desplegarse en produccion ni utilizarse en aplicaciones orientadas a usuarios finales.
- Verificacion: la informacion disponible es limitada (sin pipeline declarado, sin idiomas, sin licencia, sin resultados de evaluacion), por lo que varias filas de esta ficha figuran como "no disponible" de forma deliberada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.0087-wd0.1-decay0.0
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo en PMLR: https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Revision en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Repositorio de OLMo (AI2): https://github.com/allenai/OLMo
