# roadrage10/RADAR

## Resumen

RADAR es un modelo de clasificacion de texto (text-classification) desarrollado por el usuario roadrage10 y publicado en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo MahmoodAnaam/radar-encoder-freeze sobre el conjunto de datos MahmoodAnaam/radar-pan26-raid. Por su nombre, su familia de origen y el dataset empleado, RADAR se enmarca en la deteccion de texto generado por IA (AI-text detection), una tarea binaria o de scoring que busca distinguir texto humano de texto sintetico.

El modelo tiene 399.711.361 parametros (aproximadamente 400 millones), lo que lo situa en la categoria de encoder denso de tamano medio-grande. No es un modelo generativo: su salida es una clasificacion, no texto. Esto lo hace mucho mas ligero de desplegar que un LLM y adecuado para integrarse como componente de moderacion o filtrado en pipelines de produccion.

La relevancia actual de este tipo de modelos radica en la necesidad creciente de verificar la autoria de contenidos en plataformas educativas, medios de comunicacion y redes sociales. La model card, sin embargo, esta generada automaticamente y deja sin cubrir secciones clave (descripcion, usos previstos, datos de entrenamiento, licencia e idiomas), por lo que gran parte de las especificaciones figuran como "no disponibles".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (fine-tune de MahmoodAnaam/radar-encoder-freeze) |
| Parametros totales | 399.711.361 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Dataset de ajuste | MahmoodAnaam/radar-pan26-raid |
| Tamano del repositorio | 6.4 GB |
| Libreria | transformers |
| Framework declarado | Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0, Tokenizers 0.22.2 |
| Fecha de creacion / actualizacion | 2026-10-13 (creacion y ultima actualizacion) |
| Descargas / likes | 3 descargas, 0 likes |

## Arquitectura y entrenamiento

RADAR es el resultado de un fine-tune supervisado sobre el checkpoint MahmoodAnaam/radar-encoder-freeze, que a su vez forma parte de la familia de detectores RADAR de Mahmood Anaam. La arquitectura subyacente es un transformer de tipo encoder (no se especifica en la informacion disponible si se trata de BERT, RoBERTa, DeBERTa, ModernBERT u otra variante), con cabeza de clasificacion. El modelo tiene 399.711.361 parametros y se distribuye en formato safetensors.

El entrenamiento se realizo con el Trainer de HuggingFace sobre el dataset MahmoodAnaam/radar-pan26-raid. Los hiperparametros declarados son: learning rate 2e-05, tamano de lote de entrenamiento 32, tamano de lote de evaluacion 64, semilla 42, optimizador AdamW_TORCH_FUSED con betas (0.9, 0.999), scheduler coseno, warmup de 0.03 pasos y 10 epocas (12.000 pasos en total). No se documentan el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO (no aplicables a un clasificador de este tipo). La model card indica "More information needed" en las secciones de descripcion del modelo, usos previstos y datos de entrenamiento.

## Capacidades

- Clasificacion de texto (text-classification): el modelo devuelve una etiqueta o puntuacion sobre el texto de entrada, presumiblemente para discriminar entre texto humano y texto generado por IA, dado su linaje (radar-encoder, dataset PAN26-RAID).
- Deteccion de texto sintetico: encaja en la categoria de detectores de AI-generated text, segun la descripcion del perfil del autor ("RADAR AI-text detectors").
- Salida de probabilidad/scoring: la model card reporta metricas de ROC-AUC y Brier, lo que implica una salida probabilistica utilizable para umbralizar decisiones.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, audio, vision): no disponibles.

## Casos de uso

- Moderacion de contenido en plataformas: usar el modelo como clasificador para marcar publicaciones potencialmente generadas por IA antes de una revision humana, gracias a su reducido coste de inferencia (encoder de 400 M de parametros). Es adecuado porque ofrece una salida probabilistica que permite fijar umbrales por politica de plataforma.
- Integridad academica: deteccion de trabajos o respuestas generadas por modelos de lenguaje en entornos educativos. El modelo puede desplegarse en un servicio interno que puntue entregas y derive a revision los casos con mayor probabilidad.
- Verificacion en medios y periodismo: asistencia a redacciones para evaluar la autoria de contenidos recibidos (comunicados, textos de terceros) antes de su publicacion, como senal de alerta y no como veredicto definitivo.
- Curaccion de datasets: filtrado automatico de grandes volumenes de texto para separar muestras humanas de muestras sinteticas antes de entrenar otros modelos, tarea para la que un clasificador dedicado es mas eficiente que un LLM generativo.
- Deteccion en pipelines de ingesta (APIs): integracion como microservicio o funcion serverless que recibe texto y devuelve una probabilidad, dado que el modelo es pequeno y no requiere GPUs de gran capacidad.
- Investigacion en deteccion de IA: uso como linea base o componente de un ensemble en estudios sobre robustez de detectores, aprovechando la familia de variantes (base, PAN26, RAID) publicada por el autor.
- Analisis forense de documentos: cribado preliminar de corpus textuales de procedencia dudosa para priorizar una inspeccion manual mas detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible; no aplican a un clasificador. La model card si recoge metricas de evaluacion del propio entrenamiento.

Resultados en el conjunto de evaluacion (eval final declarada por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0.1610 |
| ROC-AUC | 0.99 |
| Brier | 0.967 |
| C@1 | 0.964 |
| F1 | 0.964 |
| F05u | 0.974 |
| Mean | 0.972 |

Progresion seleccionada durante el entrenamiento (datos declarados por el autor):

| Epoca | Paso | Validation loss | ROC-AUC | F1 | Mean |
|---|---|---|---|---|---|
| 0.4153 | 500 | 0.1814 | 0.982 | 0.902 | 0.934 |
| 2.0764 | 2500 | 0.0932 | 0.994 | 0.968 | 0.974 |
| 4.9834 | 6000 | 0.1529 | 0.990 | 0.958 | 0.968 |
| 7.4751 | 9000 | 0.1477 | 0.991 | 0.963 | 0.971 |
| 9.1362 | 11000 | 0.1351 | 0.992 | 0.973 | 0.978 |
| 9.9668 | 12000 | 0.1352 | 0.992 | 0.973 | 0.978 |

No hay comparaciones oficiales con otros modelos en la informacion proporcionada. Las cifras anteriores proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 399.711.361 parametros, los pesos ocupan aproximadamente 1,6 GB en fp32, unos 0,8 GB en fp16/bf16 y alrededor de 0,4 GB en int8. Hay que anadir el pico de memoria de activaciones, que en un encoder de esta talla es moderado para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 para lotes pequenos. Validas tanto GPUs de centro de datos (A100, H100, L4, T4) como de consumo.
- Caben en GPU de consumo: si. Una RTX 3060 (12 GB), RTX 4060, RTX 3070, RTX 4070 o superior ejecutan el modelo sin problemas. Incluso tarjetas con 4-6 GB pueden servir para inferencia en fp16 o int8 con lotes reducidos.
- Despliegue en CPU: viable para cargas moderadas, dado el tamano del modelo.
- Opciones de despliegue: Transformers (PyTorch) de forma nativa, dado el uso de custom_code; exportacion a ONNX Runtime para inferencia optimizada; integracion en servicios con FastAPI o similares. Los motores orientados a generacion (vLLM, TGI) estan enfocados a modelos causales y no son el camino habitual para un encoder clasificador; llama.cpp y Ollama tampoco son el soporte estandar para este tipo de modelo salvo conversion manual a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el repositorio incluye pesos en safetensors y el modelo usa custom_code, por lo que conviene revisar el codigo remoto declarado antes de cargarlo en produccion.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas oficiales con otros detectores. Se pueden senalar relaciones dentro de la misma familia y categoria:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roadrage10/RADAR | Modelo analizado | 399.711.361 | no disponible | no disponible | HuggingFace (3 descargas) |
| MahmoodAnaam/radar-encoder-freeze | Modelo base del que deriva | no disponible | no disponible | no disponible | HuggingFace |
| Variantes "base", "PAN26" y "RAID" de la familia RADAR | Copias/variantes del mismo autor | no disponible | no disponible | no disponible | HuggingFace (perfil roadrage10) |

No se dispone de datos de rendimiento de alternativas comparables (por ejemplo, detectores basados en RoBERTa) en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento figuran como "More information needed". La ficha esta generada automaticamente por el Trainer.
- Licencia no disponible: al no declararse licencia, el uso comercial queda sin cobertura explicita. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue y el comportamiento fuera del idioma o dominio de entrenamiento (PAN26-RAID).
- Dependencia del dominio: los resultados (F1, ROC-AUC) proceden del conjunto de evaluacion derivado del propio dataset de ajuste. El rendimiento puede degradarse en textos de otros dominios, longitudes o generadores distintos.
- Riesgo de evasion adversarial: los detectores de texto generado tienden a perder eficacia frente a texto parafraseado, editado o generado por modelos mas recientes no vistos en entrenamiento.
- Falsos positivos: en un clasificador de autoria, un falso positivo puede tener consecuencias graves (acusaciones de uso indebido de IA). Debe emplearse como senal orientativa con revision humana, nunca como veredicto automatico.
- Sobreajuste potencial: la curva de entrenamiento muestra una perdida de validacion que deja de mejorar tras las primeras epocas mientras la perdida de entrenamiento sigue bajando, lo que sugiere posible sobreajuste; conviene validar en datos externos.
- Ambiguedad del Brier score: el valor declarado (0.967, cercano a 1) es inusualmente alto para un clasificador con ROC-AUC de 0.99; no se explica su calculo en la model card.
- custom_code: el modelo requiere cargar codigo remoto para funcionar, lo que implica una revision de seguridad previa a su uso.
- Escasa adopcion: 3 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.
- Sin benchmarks independientes: las metricas no han sido replicadas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roadrage10/RADAR
- Perfil del autor (incluye las variantes base, PAN26 y RAID): https://huggingface.co/roadrage10
- Modelo base: https://huggingface.co/MahmoodAnaam/radar-encoder-freeze
- Dataset de ajuste: https://huggingface.co/datasets/MahmoodAnaam/radar-pan26-raid
