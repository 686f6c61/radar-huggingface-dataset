# jamesbbt0917/perceiver-retrieval

## Resumen

`jamesbbt0917/perceiver-retrieval` es un repositorio de HuggingFace que contiene una implementación propia y compacta de un Perceiver orientada a tareas de retrieval, escrita en PyTorch. Lo publica el usuario jamesbbt0917 bajo licencia MIT y no está respaldado por ningún laboratorio ni institución. El propio autor lo describe como un punto de partida experimental para revisión de código, smoke tests y experimentos pequeños y controlados, no como un modelo preentrenado listo para producción.

El dato más relevante es su tamaño real: el checkpoint `model.safetensors` contiene 33.088 parámetros, es decir, unas tres décimas de milésima de millón. El `config.json` etiqueta la configuración como «large», lo que choca con ese recuento y sugiere que la etiqueta se refiere a un preset interno del script y no a una escala real de modelo. El repositorio ocupa 0,0 GB y no registra descargas ni likes.

La relevancia ahora es metodológica, no de rendimiento: sirve como esqueleto reproducible de un Perceiver con fusión por co-atención para quien quiera montar un banco de pruebas de retrieval, y como ejemplo de publicación honesta que declara explícitamente la ausencia de entrenamiento y de benchmarks. No hay resultados de evaluación, ni tokenizador, ni idiomas declarados, ni variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión por co-atención, activación approx gelu, normalización batchnorm) |
| Parametros totales | 33.088 (recuento real del checkpoint safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; sin GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | no disponible (sin tokenizador ni entrenamiento lingüístico declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors, acompañado de `config.json`, `training_args.json` y `finetune.py` |
| Escala declarada en config | «large» (preset interno del script; no coherente con el recuento de parámetros) |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver: un transformador que proyecta entradas de longitud variable sobre un array latente de tamaño fijo mediante cross-attention, y que después procesa ese latente con bloques de self-attention. En esta implementación la fusión se hace por co-atención, con normalización batchnorm (poco habitual en transformers, donde domina LayerNorm o RMSNorm) y activación approx gelu. El coste computacional crece de forma lineal con la longitud de la entrada, mientras que el grueso del cómputo queda fijado por el tamaño del latente; ese es el motivo por el que la familia Perceiver se propone para entradas multimodales largas.

No hay entrenamiento completado. El autor indica que `model.safetensors` es un checkpoint de inicialización válido para smoke tests y que no se presenta como un checkpoint entrenado con benchmarks. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. La receta por defecto en `training_args.json` usa el optimizador RMSprop con un schedule de warmup constante, y el propio autor advierte que son valores de arranque del script, no evidencia de una ejecución terminada. Como guía de evaluación propone Flickr30k, con métrica reportada en al menos tres semillas y una línea base de capacidad equivalente; ninguna de esas evaluaciones está publicada en el repositorio.

## Capacidades

- No hay capacidades funcionales demostradas: el checkpoint es una inicialización sin entrenar, por lo que la salida no tiene semántica útil.
- Diseño previsto para retrieval, presumiblemente multimodal imagen-texto dado el Perceiver y la sugerencia de evaluar en Flickr30k, aunque el repositorio no especifica la modalidad de entrada.
- Fusión de modalidades por co-atención y agregación en un latente de tamaño fijo, apta para entradas de longitud variable.
- Punto de entrada de fine-tuning ejecutable (`python finetune.py --help`) con bloque `__main__` de ejemplo para smoke test.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües declaradas ni evaluadas.
- Sin modo thinking, visión, audio ni otras capacidades especiales publicadas.
- Carga mediante APIs genéricas: al ser una implementación propia, `AutoModel` requiere un adaptador explícito antes de poder usarse.

## Casos de uso

- Smoke test de infraestructura: ejecutar `finetune.py` para verificar que el entorno de PyTorch, las versiones de CUDA y el pipeline de datos funcionan antes de lanzar un experimento real, gracias a que el checkpoint se instancia en segundos.
- Revisión de código de un Perceiver: usar el repositorio como referencia legible de cómo se implementan la cross-attention al latente y la co-atención, sin la complejidad de una base de código de producción.
- Línea base de capacidad equivalente en experimentos de retrieval: sirve como suelo mínimo contra el que comparar arquitecturas mayores sobre el mismo conjunto de datos y las mismas semillas, siguiendo la recomendación del autor.
- Semilla para fine-tuning propio: partir de esta implementación y entrenar sobre un corpus propio de pares imagen-texto, manteniendo el script y el `config.json` versionados junto a los logs.
- Docencia y demos: mostrar en clase o en un taller cómo el cuello de botella latente desacopla el coste computacional de la longitud de entrada, con un modelo que cabe en cualquier portátil.
- Pruebas de integración en CI: incluir un job que instancie el modelo y haga un forward pass para detectar roturas de API en una librería propia de retrieval, con un coste de ejecución despreciable.
- Validación de arneses de evaluación: comprobar que el pipeline de métricas para Flickr30k (recall@1, recall@5, recall@10) produce resultados estables antes de evaluar modelos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. La única referencia metodológica es la sugerencia de evaluar en Flickr30k con al menos tres semillas y una línea base de capacidad equiparable.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 33.088 parámetros, los pesos ocupan del orden de decenas o centenares de kilobytes según la precisión; el consumo real lo domina el overhead del runtime de PyTorch.
- GPU recomendadas: ninguna. El modelo se ejecuta en CPU sin problema; cualquier GPU consumer sirve si se quiere acelerar el bucle de entrenamiento, pero no aporta por tamaño.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, y en Raspberry Pi siempre que se instale PyTorch.
- Opciones de despliegue: ejecución directa del script Python del repositorio. No hay soporte para vLLM, TGI, llama.cpp u Ollama, al no existir pesos en formato GGUF ni arquitectura reconocida por esos motores.
- Latencia y throughput: no disponibles como cifra publicada. En la práctica, la latencia por forward estará dominada por el arranque del intérprete y la creación del grafo, no por el cómputo matricial.
- Advertencia de escalado: si se aumenta el tamaño del latente o la profundidad en `config.json`, el consumo de memoria crece de forma cuadrática con el número de latentes y lineal con la longitud de entrada; el checkpoint publicado no refleja ese escenario.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| perceiver-retrieval (este repo) | Perceiver con co-atención, implementación propia | 33.088 | no disponible | MIT | Checkpoint de inicialización, sin entrenar |
| Perceiver IO (implementación de referencia de DeepMind) | Perceiver con decodificador flexible | Órdenes de magnitud superior (consultar fuente oficial) | Definido por el array latente | Apache 2.0 en el repositorio de referencia | Implementación mantenida, sin pesos de retrieval listos para usar |
| CLIP (OpenAI) | Dos torres, contraste imagen-texto | Cientos de millones en las variantes publicadas (consultar fuente oficial) | Texto truncado a decenas de tokens | MIT en los pesos publicados | Modelo entrenado y ampliamente evaluado en retrieval |
| BLIP-2 | Q-Former sobre encoder de imagen con LLM congelado | Miles de millones (consultar fuente oficial) | Limitado por el LLM subyacente | MIT en el código, términos propios en los pesos | Modelo entrenado, estado del arte en su fecha |

Las cifras de parámetros de los modelos comparados no se han verificado en esta ficha y deben consultarse en sus repositorios oficiales. La comparación relevante no es de rendimiento, sino de estado: los tres alternativas son modelos entrenados con evaluaciones publicadas, mientras que este repositorio es un esqueleto de código con un checkpoint sin entrenar.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida que produzca es ruido y no debe interpretarse como resultado de retrieval.
- No existen métricas, ni siquiera internas, sobre Flickr30k ni sobre ningún otro conjunto; la sugerencia de evaluación del autor está sin ejecutar.
- Incoherencia entre la etiqueta «large» del `config.json` y los 33.088 parámetros reales del safetensors; conviene verificar qué preset genera cada configuración antes de escalar.
- Sin tokenizador publicado ni vocabulario declarado: no está claro cómo se codifican las entradas de texto, si es que las hay.
- Sesgos conocidos: no disponibles. Al no haber datos de entrenamiento, no se puede auditar sesgo, robustez ni transferencia de dominio.
- Riesgo de alucinación: no aplica en el sentido habitual al no ser un modelo generativo entrenado; el riesgo real es interpretar mal un forward pass sin sentido como una señal válida.
- Implementación propia: requiere un adaptador explícito para cargarse con APIs automáticas; no funcionará con `AutoModel.from_pretrained` sin código adicional.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye sin garantías. El autor advierte de revisar por separado los términos de los datos externos que se usen con el repositorio.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta.
- Para producción, la recomendación es usar un modelo de retrieval entrenado y evaluado, y reservar este repositorio para prototipado y docencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jamesbbt0917/perceiver-retrieval
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
