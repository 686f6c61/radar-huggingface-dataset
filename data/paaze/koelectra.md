# paaze/koelectra

## Resumen

paaze/koelectra es un modelo de clasificación de texto en coreano obtenido mediante ajuste fino supervisado sobre daekeun-ml/koelectra-small-v3-nsmc, que a su vez es un ajuste fino del modelo preentrenado KoELECTRA-small v3 sobre el corpus NSMC (Naver Sentiment Movie Corpus). Se trata, por tanto, de un ajuste de segundo nivel: un clasificador de sentimiento binario de muy bajo coste computacional, con 14.122.498 parámetros y un tamaño de repositorio de 0,1 GB.

El modelo resuelve la tarea concreta de clasificar texto coreano (previsiblemente reseñas de películas, dado el linaje del modelo base) en polaridad positiva o negativa. Su relevancia práctica no está en la calidad puntera, sino en el coste: con 14 millones de parámetros se puede ejecutar en CPU, en cualquier GPU de consumo e incluso en dispositivos móviles o edge, con latencias de milisegundos y sin necesidad de infraestructura de inferencia especializada.

El autor publica el modelo bajo licencia MIT, con arquitectura ELECTRA y pesos en safetensors, y declara una precisión de 0,88 y una pérdida de 0,3252 en el conjunto de evaluación. La documentación es mínima: la model card generada automáticamente por el Trainer indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, lo que limita la trazabilidad del ajuste. Con 16 descargas y 0 likes, es un modelo sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder con objetivo de deteccion de tokens reemplazados) |
| Parametros totales | 14.122.498 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; los modelos ELECTRA de referencia se entrenan con secuencias de hasta 512 tokens, dato no confirmado para este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precision completa (fp32) en safetensors |
| Idiomas soportados | coreano (inferido del modelo base KoELECTRA y del corpus NSMC; no declarado explicitamente en los metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (tag del repositorio); no se publican pesos GGUF, ONNX ni convertidos equivalentes |
| Pipeline | text-classification |
| Libreria | transformers |
| Modelo base | daekeun-ml/koelectra-small-v3-nsmc |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 16 / 0 |

## Arquitectura y entrenamiento

La arquitectura es ELECTRA en su variante small, un transformer encoder con un objetivo de preentrenamiento basado en deteccion de tokens reemplazados (replaced token detection) en lugar del enmascaramiento clasico de BERT. Este enfoque permite obtener representaciones competitivas con un coste de preentrenamiento menor. El checkpoint hereje parte de daekeun-ml/koelectra-small-v3-nsmc, que ya incorpora un ajuste fino sobre NSMC; este modelo aplica un segundo ajuste fino sobre un conjunto de datos no identificado (la model card lo registra literalmente como "None dataset"), por lo que no se puede confirmar si el corpus de ajuste es NSMC de nuevo, una ampliacion del mismo o un dataset distinto. No se declara ningun tipo de alineacion adicional (RLHF, DPO) ni innovacion tecnica destacable; es un fine-tuning estandar de clasificacion.

Los hiperparametros declarados son: learning rate 2e-05, train batch size 16, eval batch size 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 5 epocas completas, lo que corresponde a 470 pasos de entrenamiento (94 pasos por epoca). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni el tamano de las particiones de train y evaluacion. El entorno declarado es Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion de texto en coreano: la tarea declarada es text-classification, en principio binaria de sentimiento (positivo/negativo) heredada del linaje NSMC.
- Inferencia de muy bajo coste: 14,1 millones de parametros permiten ejecucion en CPU con latencias de milisegundos por muestra.
- Procesamiento por lotes: el modelo admite batching estandar de transformers, con un throughput alto en GPU para volumenes grandes de texto corto.
- Extraccion de representaciones: al ser un encoder ELECTRA, las capas ocultas pueden reutilizarse como features para tareas auxiliares, aunque no se documenta ningun uso de este tipo.
- Tool calling / function calling: no soportado; es un modelo discriminativo, no generativo.
- Capacidades de agente o razonamiento multi-paso: no soportadas por diseno.
- Capacidades multilingues: no declaradas; el modelo base esta preentrenado exclusivamente en coreano.
- Capacidades especiales (modo thinking, vision, audio, generacion): ninguna; el modelo no genera texto.

## Casos de uso

- Moderacion de resenas de peliculas y series: clasificacion automatica de resenas de plataformas coreanas en positivas o negativas para alimentar sistemas de recomendacion y agregacion de valoraciones. El modelo es adecuado por su dominio de origen (NSMC) y porque el volumen de inferencia necesario (cientos de miles de resenas al dia) es asumible en CPU.
- Analisis de sentimiento en encuestas de satisfaccion en coreano: procesamiento de respuestas abiertas de clientes para generar metricas agregadas de sentimiento, con despliegue en un contenedor sin GPU que reduce el coste operativo.
- Enrutado previo en pipelines de atencion al cliente: filtrado rapido de mensajes para dirigir los negativos hacia agentes humanos o hacia un LLM mayor, y los positivos hacia respuestas automaticas, usando este modelo como primera etapa de bajo coste.
- Monitorizacion de reputacion de marca en redes sociales coreanas: clasificacion continua de menciones para detectar picos de sentimiento negativo y activar alertas, aprovechando la baja latencia para procesar streams en tiempo real.
- Etiquetado a escala para construccion de datasets: preanotacion de grandes volumenes de texto coreano que despues se revisan manualmente, reduciendo el coste de anotacion en proyectos de investigacion.
- Clasificacion en el borde (edge) o en dispositivos sin GPU: al ocupar decenas de megabytes, puede integrarse en aplicaciones moviles o gateways con recursos limitados para filtrar contenido localmente sin enviar datos a la nube.
- Componente de evaluacion en sistemas RAG en coreano: puntuar la polaridad de fragmentos recuperados para filtrar contexto contradictorio o de tono inadecuado antes de pasarlo a un modelo generativo.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). Los unicos datos disponibles son las metricas del conjunto de evaluacion declaradas en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,3252 |
| Accuracy (evaluacion final) | 0,88 |

Evolucion por epoca declarada en la model card:

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 94 | 0,3084 | 0,884 |
| 2 | 188 | 0,3100 | 0,880 |
| 3 | 282 | 0,2997 | 0,878 |
| 4 | 376 | 0,3236 | 0,884 |
| 5 | 470 | 0,3252 | 0,880 |

No se han publicado resultados de benchmarks comparativos (MMLU, GLUE, KLUE, KorNLI u otros) en la informacion disponible. La precision se mantiene estable entre 0,878 y 0,884 a lo largo de las cinco epocas, con una perdida de validacion que deja de mejorar tras la tercera, lo que sugiere saturacion del ajuste. No se especifica el conjunto de evaluacion ni si es el mismo dataset que el de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 56 MB en fp32, 28 MB en fp16/bf16 y 14 MB en int8 (calculado sobre 14,1 millones de parametros, sin contar activaciones ni overhead del runtime). En la practica, el consumo es despreciable frente a cualquier otro modelo del pipeline.
- GPU recomendadas: cualquier GPU NVIDIA desde una GTX 1050 o superior, e incluso GPUs integradas. No requiere A100, H100 ni RTX 4090; seria un desperdicio de recursos dedicarles este modelo salvo por consolidacion de servicios.
- Compatibilidad con GPU de consumo: si, en todas las gamas, incluidas las de portatil y las integradas.
- Ejecucion en CPU: totalmente viable. Es probablemente el modo de despliegue mas razonable para produccion con cargas moderadas, con latencias del orden de milisegundos a decenas de milisegundos por muestra segun la longitud del texto y el numero de hilos.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportacion a ONNX Runtime para acelerar inferencia en CPU, TorchScript/JIT, API propia con FastAPI o TorchServe, y Hugging Face Inference Endpoints (el repositorio incluye el tag `endpoints_compatible`). No aplica el despliegue con llama.cpp, Ollama o GGUF, al no existir pesos cuantizados ni ser un modelo generativo; vLLM y TGI estan orientados a modelos generativos y no son la via habitual para un clasificador encoder de este tamano.
- Latencia y throughput: no declarados por el autor. Como referencia orientativa derivada del tamano, en CPU moderna se esperan del orden de 1 a 20 ms por muestra segun longitud y batching, y en GPU de consumo, varios miles de muestras por segundo con lotes grandes; estas cifras son estimaciones y no datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paaze/koelectra (este modelo) | 14.122.498 | no disponible | clasificacion de sentimiento; accuracy 0,88 y loss 0,3252 en evaluacion propia | MIT | Hugging Face, safetensors |
| daekeun-ml/koelectra-small-v3-nsmc (modelo base) | orden de 14 M | no disponible | clasificacion de sentimiento NSMC | no verificada en las fuentes consultadas | Hugging Face |
| monologg/koelectra-base-v3 (referencia KoELECTRA) | orden de 110 M | 512 tokens (referencia de la arquitectura) | encoder preentrenado en coreano, base para ajustes posteriores | no verificada en las fuentes consultadas | GitHub y Hugging Face |
| KoELECTRA-small v3 (referencia preentrenada) | orden de 14 M | no disponible | encoder preentrenado en coreano | no verificada en las fuentes consultadas | GitHub y Hugging Face |

Nota: las cifras de parametros y contexto de las alternativas proceden de conocimiento general sobre la familia KoELECTRA y no han sido verificadas en la informacion proporcionada en esta busqueda; deben comprobarse antes de citarse. La ventaja competitiva de este checkpoint no es el rendimiento, sino su tamano (14 M de parametros) y su licencia MIT, que permite uso comercial sin restricciones declaradas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card marca "More information needed" en descripcion, usos previstos y datos de entrenamiento. No se sabe sobre que dataset se ajusto (figura como "None"), ni su tamano, ni si hay solapamiento con el conjunto de evaluacion.
- Riesgo de fuga de datos (data leakage): al derivar de un modelo ya ajustado sobre NSMC y no declarar el corpus del segundo ajuste, la precision de 0,88 podria estar inflada si el nuevo dataset comparte ejemplos con NSMC o con el conjunto de evaluacion. No hay forma de verificarlo con la informacion disponible.
- Dominio muy restringido: el linaje NSMC implica resenas de cine en coreano, con lenguaje informal, jerga y sarcasmo. El rendimiento fuera de ese dominio (noticias, texto tecnico, conversacion de soporte) es desconocido y probablemente inferior.
- Sesgos: NSMC es un corpus de resenas de peliculas coreanas; los modelos entrenados sobre el heredan sesgos de dominio (terminologia coloquial, desequilibrios tematicos, posibles sesgos de genero o de origen en las resenas). No se ha realizado ninguna evaluacion de sesgo publicada.
- Alucinacion: al ser un modelo discriminativo no genera texto, por lo que no alucina en el sentido habitual; sin embargo, puede producir etiquetas con alta confianza sobre entradas fuera de distribucion, lo que en produccion equivale a un falso positivo silencioso. Se recomienda calibrar umbrales con datos propios.
- Limitaciones de contexto e idioma: solo coreano y presumiblemente secuencias de hasta 512 tokens; textos mas largos requeriran truncado o troceado, con perdida de informacion. El rendimiento en textos multilingues o mixtos no esta documentado.
- Sin validacion externa: 16 descargas y 0 likes implican que el checkpoint no ha sido reproducido ni evaluado por terceros. No se debe adoptar en produccion sin una evaluacion propia sobre datos del dominio objetivo.
- Restricciones de licencia: la licencia declarada es MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No obstante, la licencia del modelo base (daekeun-ml/koelectra-small-v3-nsmc) y la del preentrenamiento KoELECTRA original deberian verificarse por separado, ya que no se confirman en la informacion disponible.
- Versionado del entorno: la model card declara Transformers 5.17.0 y PyTorch 2.11.0+cu130, versiones que pueden no estar disponibles de forma generalizada; conviene comprobar la compatibilidad al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paaze/koelectra
- Modelo base: https://huggingface.co/daekeun-ml/koelectra-small-v3-nsmc
- Repositorio KoELECTRA original (monologg): https://github.com/monologg/KoELECTRA
- KoELECTRA v2 base generator (monologg): https://huggingface.co/monologg/koelectra-base-v2-generator
- Ficha de KoELECTRA en Korea AI Map: https://korea-ai-map.github.io/open-source/koelectra/
- Revision de KoElectra Base v3 finetuned KorQuad (aiindigo): https://aiindigo.com/blog/koelectra-base-v3-finetuned-korquad-review-2026
- Ficha de KoElectra Base v3 finetuned KorQuad (aiindigo): https://aiindigo.com/tool/koelectra-base-v3-finetuned-korquad-1
