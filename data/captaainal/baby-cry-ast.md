# captaainal/baby-cry-ast

## Resumen

Baby Cry Decoder (AST fine-tuned) es un modelo de clasificación de audio desarrollado por el usuario captaainal y publicado en Hugging Face. Se trata de un ajuste fino (*fine-tuning*) del modelo `MIT/ast-finetuned-audioset-10-10-0.4593`, un Audio Spectrogram Transformer (AST) preentrenado sobre AudioSet, que a su vez se apoya en un backbone ViT. El modelo resultante clasifica llantos de bebe en cinco categorias: dolor de barriga (`belly_pain`), necesidad de eructar (`burping`), incomodidad (`discomfort`), hambre (`hungry`) y cansancio (`tired`).

El problema que aborda es la categorizacion automatica del llanto infantil, una tarea de clasificacion de audio de dominio muy especifico y con escasez de datos etiquetados. El ajuste se realizo sobre el corpus Donate-a-Cry, con aproximadamente 450 clips, lo que lo convierte en un modelo pequeno y de nicho, mas cercano a un experimento o prueba de concepto que a un sistema listo para produccion.

Es relevante ahora por dos motivos: por un lado, demuestra el patron habitual de reutilizar un transformer de audio preentrenado en AudioSet para una tarea vertical con muy pocos datos; por otro, su model card advierte explicitamente de que no es un dispositivo medico y de que el conjunto de datos es pequeno y desbalanceado. El repositorio ocupa 0,3 GB y el modelo cuenta con 86.192.645 parametros segun los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas, backbone tipo ViT |
| Parametros totales | 86.192.645 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio, no generativo) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | no disponible (la tarea es clasificacion de audio, no procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Audio Spectrogram Transformer (AST): la senal de audio se convierte en un espectrograma mel que se trocea en parches, y estos se procesan con un transformer con atencion global, siguiendo el mismo esquema que un Vision Transformer aplicado a imagenes de espectrograma. El punto de partida es `MIT/ast-finetuned-audioset-10-10-0.4593`, ya ajustado para clasificacion de eventos sonoros en AudioSet con 527 clases, lo que proporciona una representacion rica de eventos acusticos antes del ajuste especifico.

El ajuste fino se realizo sobre el corpus Donate-a-Cry, con aproximadamente 450 clips etiquetados en las cinco categorias de llanto. No se dispone de informacion sobre el numero de epochs, la estrategia de congelacion de capas, el learning rate, el split de validacion ni si se aplicaron tecnicas de aumento de datos o balanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un modelo de clasificacion. La innovacion tecnica aqui es la reutilizacion de un backbone preentrenado en AudioSet para una tarea vertical con muy pocos ejemplos.

## Capacidades

- Clasificacion de audio de llanto infantil en cinco clases: `belly_pain`, `burping`, `discomfort`, `hungry` y `tired`.
- Inferencia sobre clips de audio cortos, procesados como espectrogramas mel.
- Reutilizacion de representaciones acusticas aprendidas en AudioSet (527 clases de eventos sonoros).
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje; la salida es una etiqueta de clase.
- No dispone de modo de razonamiento (*thinking mode*), vision ni audio generativo.

## Casos de uso

- Prototipo de monitor de bebe: integrado en una aplicacion movil o un dispositivo domestico que capture audio ambiente y clasifique el tipo de llanto para mostrar una sugerencia orientativa al cuidador, siempre con aviso de que no sustituye la valoracion de un profesional.
- Investigacion academica sobre llanto infantil: uso como linea base reproducible para comparar con otros clasificadores sobre el corpus Donate-a-Cry o sobre datasets propios, dado que el modelo y los pesos son publicos con licencia Apache 2.0.
- Etiquetado asistido de datasets: preanotacion de grandes colecciones de audio de llanto para revision humana posterior, reduciendo el coste de anotacion manual en las cinco categorias definidas.
- Demo educativa de fine-tuning de AST: ejemplo didactico de como adaptar un transformer de audio preentrenado en AudioSet a una tarea vertical con pocos cientos de clips.
- Analisis retrospectivo de grabaciones: procesamiento por lotes de registros de audio nocturnos para estudiar la distribucion de tipos de llanto en funcion de la hora o la edad del bebe.
- Filtro de eventos en dispositivos de bajo consumo: al ser un modelo de 86 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para descartar audio irrelevante antes de enviarlo a un servicio mas pesado, aunque la latencia real no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 86,2 millones de parametros en fp32 los pesos ocupan aproximadamente 0,34 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre deberia ser suficiente; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo de la familia AST de Hugging Face Transformers, es desplegable con la pipeline `audio-classification` de `transformers`; no se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| captaainal/baby-cry-ast | 86,2 M | Clasificacion de llanto en 5 clases | Clips de audio (longitud no documentada) | Apache 2.0 | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M (AST base) | Clasificacion de eventos sonoros (527 clases AudioSet) | Clips de audio | no disponible en la informacion | Hugging Face |
| Modelos de clasificacion de llanto alternativos | no disponible | Clasificacion de llanto | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo medico: la propia model card lo advierte de forma explicita. Las predicciones deben tratarse como indicios, nunca como diagnostico.
- Dataset pequeno y desbalanceado: aproximadamente 450 clips para cinco clases, lo que implica alta varianza en las metricas y riesgo de sesgo hacia las clases mayoritarias.
- No se publican metricas de evaluacion (accuracy, F1, matriz de confusion), por lo que no es posible conocer su rendimiento real.
- Riesgo de sobreajuste y de baja generalizacion a condiciones acusticas distintas (ruido de fondo, microfonos, edades del bebe, idiomas o culturas).
- La salida es una unica etiqueta entre cinco clases; no modela ambiguedad ni clases multiples simultaneas.
- No hay informacion sobre sesgos demograficos ni sobre la composicion del corpus Donate-a-Cry.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje.
- Para produccion se recomienda validacion en el dominio objetivo, calibracion de umbrales y supervision humana en cualquier decision sensible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/captaainal/baby-cry-ast
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Repositorio de referencia de AST (Hugging Face Transformers): no disponible en la informacion proporcionada
- Paper de Audio Spectrogram Transformer: no disponible en la informacion proporcionada
- Corpus Donate-a-Cry: no disponible en la informacion proporcionada
