# neuronsbyisshu/indicbert-hi-ner-naamapadam

## Resumen

IndicBERT Hindi NER (Naamapadam) es un modelo de reconocimiento de entidades nombradas (NER) para lenguas indias, desarrollado por el usuario neuronsbyisshu y publicado en HuggingFace. Se construye a partir de `IndicBERTv2-MLM-only`, un transformer tipo BERT preentrenado con enmascaramiento de lenguaje sobre corpus indicos, y se afina para la tarea de clasificacion de tokens con las etiquetas PER, ORG y LOC siguiendo el esquema CoNLL-2003. El modelo cuenta con 277.456.135 parametros y se distribuye en formato safetensors bajo licencia CC0-1.0.

El problema que aborda es la escasez de anotaciones de calidad para NER en lenguas indias. El autor entrena exclusivamente sobre hindi, usando una submuestra de 100.000 frases con etiquetas silver proyectadas desde el ingles que forman parte del corpus Naamapadam (ai4bharat). La innovacion principal que reclama la model card es la transferencia cross-lingual zero-shot: aunque el ajuste se realiza solo en hindi, el modelo se evalua sin reentrenamiento sobre bengali, tamil y telugu, manteniendo valores de F1 entre 0,7506 y 0,8531 en los conjuntos de test gold anotados manualmente.

Es relevante ahora porque demuestra que un ajuste con etiquetas silver en una sola lengua india puede generalizar razonablemente a otras lenguas del mismo grupo tipologico, reduciendo la dependencia de anotaciones gold costosas para bengali, tamil y telugu. Los resultados se acompanan de intervalos de confianza bootstrap, lo que aporta rigor estadistico poco habitual en modelos de este tamano y nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base: IndicBERTv2-MLM-only), encoder solo, para clasificacion de tokens |
| Parametros totales | 277.456.135 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (hi, entrenamiento in-language), bengali (bn), tamil (ta) y telugu (te) en modo zero-shot |
| Licencia | CC0-1.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer basado en BERT, heredado de `IndicBERTv2-MLM-only`. El modelo se ajusta para clasificacion de tokens con un esquema de etiquetas de 7 clases: `O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC`, siguiendo directrices de tipo CoNLL-2003. No se reporta ningun mecanismo adicional como atencion lineal, decodificacion especulativa ni capas recurrentes.

El entrenamiento se realiza sobre una submuestra de 100.000 frases del split de train de Naamapadam en hindi (semilla 42), con etiquetas silver proyectadas desde el ingles mediante alineaciones a nivel de palabra. Los hiperparametros reportados son: learning rate 2e-5, batch de 16, 3 epocas, warmup del 10 %, weight decay 0,01 y precision fp16. La seleccion del modelo se hace unicamente por F1 de entidades en validacion; la evaluacion final se realiza sobre los conjuntos de test gold anotados manualmente, con intervalos de confianza bootstrap (1000 remuestreos). El preprocesamiento incluye normalizacion Unicode NFC. No se menciona el uso de RLHF, DPO ni ninguna fase de alineacion por preferencias.

## Capacidades

- Reconocimiento de entidades nombradas de las categorias persona (PER), organizacion (ORG) y localizacion (LOC).
- Etiquetado a nivel de token con prefijos B- e I- para entidades multi-token.
- Inferencia en hindi, la lengua de ajuste in-language.
- Transferencia cross-lingual zero-shot a bengali, tamil y telugu sin reentrenamiento.
- Integracion directa en el pipeline `token-classification` de HuggingFace Transformers, con estrategia de agregacion de entidades (`aggregation_strategy="simple"`).
- No se reporta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. El modelo esta restringido a clasificacion de tokens.

## Casos de uso

- Extraccion de entidades en noticias indias: procesado por lotes de articulos en hindi para poblar bases de datos con personas, organizaciones y lugares citados, aprovechando el F1 de 0,8274 en test gold de hindi.
- Enriquecimiento de corpus multilingues en bengali, tamil y telugu sin anotacion adicional, aplicando el modelo en modo zero-shot sobre textos en estas lenguas para obtener etiquetas preliminares que luego pueden revisarse manualmente.
- Construccion de grafos de conocimiento: extraccion sistematica de relaciones candidatas a partir de menciones detectadas de ORG y LOC, utiles como paso previo a un sistema de enlazado de entidades.
- Moderacion y analitica de contenidos: deteccion de menciones de personas y organizaciones en foros o redes en lenguas indias para tareas de trazabilidad y monitorizacion.
- Anotacion asistida (pre-labeling): generacion de propuestas de etiquetas para acelerar el trabajo de anotadores humanos en proyectos de NER sobre lenguas indicas, reduciendo el tiempo de anotacion inicial.
- Sistemas de busqueda y recuperacion: indexacion de entidades para motores de busqueda internos que operan sobre documentacion en hindi o bengali, permitiendo filtros por persona, organizacion o lugar.
- Procesamiento embebido en CPU: con 277 M de parametros y un caracter puramente encoder, puede desplegarse en entornos sin GPU para pipelines de extraccion de baja latencia.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre conjuntos de test gold anotados manualmente (F1 a nivel de entidad, seqeval). Los intervalos de confianza corresponden a bootstrap con 1000 remuestreos.

| Lengua | Configuracion | F1 | IC 95 % | Filas de test |
|---|---|---|---|---|
| Hindi (hi) | in-language | 0,8274 | [0,807, 0,848] | 867 |
| Bengali (bn) | zero-shot | 0,8082 | [0,779, 0,834] | 607 |
| Tamil (ta) | zero-shot | 0,7506 | [0,723, 0,777] | 758 |
| Telugu (te) | zero-shot | 0,8531 | [0,830, 0,875] | 847 |

Linea base incluida por el autor: BiLSTM-CRF entrenado sobre los mismos 100.000 datos silver de hindi, con 0,7406 de F1 de entidades en validacion. El autor senala ademas que el modelo obtiene 4,7 puntos de F1 mas sobre test gold que sobre validacion silver (0,8274 frente a 0,78), lo que cuantifica el ruido de etiqueta de las anotaciones proyectadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe en torno a 1,5-2 GB de VRAM contando activaciones y overhead; en fp16 el consumo de pesos baja a unos 0,55 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, T4, L4). Para lotes grandes o alto throughput, GPU tipo A100, H100 o L40S sobredimensionan ampliamente la tarea.
- Caben en GPU de consumo: si, el modelo es apto para cualquier GPU consumer con 4 GB o mas de VRAM, e incluso puede ejecutarse en CPU con latencias aceptables para procesamiento por lotes.
- Opciones de despliegue: HuggingFace Transformers (`pipeline` de token-classification), ademas de servidores de inferencia compatibles con modelos de encoder como vLLM, TGI o TorchServe; llama.cpp y Ollama no estan orientados a este tipo de modelo (no es generativo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible realizar una comparacion cuantitativa fiable. Como referencias de categoria se pueden citar modelos de NER para lenguas indias como IndicNER (ai4bharat) y aproximaciones basadas en XLM-RoBERTa o mBERT afinadas para NER, pero no se dispone de sus cifras en esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indicbert-hi-ner-naamapadam | 277.456.135 | No disponible | hi, bn, ta, te | CC0-1.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son silver (proyectadas desde el ingles mediante alineaciones de palabras), por lo que introducen ruido que el propio autor cuantifica: el rendimiento en validacion silver es inferior al de test gold.
- Los limites de entidades ORG son el punto mas debil, especialmente en nombres de organizacion largos; en el analisis de validacion el autor reporta una tasa de error a nivel de span de aproximadamente el 70 % para entidades de 5 o mas tokens.
- La confusion ORG/LOC es el error de tipo mas frecuente, en particular cuando un nombre de organizacion incluye un toponimo.
- Las puntuaciones zero-shot no son directamente comparables entre lenguas, ya que cada lengua emplea conjuntos de test distintos; la comparacion entre bengali, tamil y telugu debe interpretarse con cautela.
- El modelo solo ha sido ajustado en hindi; el rendimiento en otras lenguas depende por completo de la transferencia cross-lingual y puede degradarse en dominios alejados del corpus de noticias.
- Riesgo de alucinacion en el sentido generativo no aplica (es un clasificador), pero si existe riesgo de falsos positivos y de fronteras de entidad incorrectas.
- No se documentan sesgos especificos ni evaluaciones de equidad en la informacion proporcionada.
- La licencia CC0-1.0 permite uso comercial sin restricciones conocidas, pero conviene verificar las condiciones del corpus Naamapadam y del modelo base IndicBERTv2-MLM-only para un despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/neuronsbyisshu/indicbert-hi-ner-naamapadam
- Dataset Naamapadam: https://huggingface.co/datasets/ai4bharat/naamapadam
- Paper Naamapadam (arXiv): https://arxiv.org/abs/2212.10168
- DOI Naamapadam: https://doi.org/10.48550/ARXIV.2212.10168
