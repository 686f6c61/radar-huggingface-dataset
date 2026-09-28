# georglange/qwen3-4b-molt

## Resumen

georglange/qwen3-4b-molt es un repositorio de pesos finales de MOLT (sparse mixtures of linear transforms, mezclas dispersas de transformaciones lineales) entrenadas de forma independiente sobre las capas MLP del modelo Qwen3-4B de Alibaba. Conviene subrayarlo desde el principio: no es un modelo de lenguaje generativo, sino un conjunto de artefactos de interpretabilidad mecanicista que descomponen la computacion interna de las capas MLP del modelo objetivo.

El repositorio contiene 30 capas completadas, numeradas en base cero (0 a 28 y 30), cada una entrenada durante 100.000 pasos. Cada capa se almacena en su propia carpeta con `checkpoint.safetensors` y `config.json`, ocupa aproximadamente 4,22 GB y el total del repositorio ronda los 126,62 GB. Cada checkpoint incluye pesos y sesgo del encoder, matrices de transformacion de bajo rango, umbrales JumpReLU y estadisticas de normalizacion de entrada y salida, sin estados de optimizador ni de scheduler.

Su relevancia es acotada pero clara para quien investiga interpretabilidad en modelos open source: ofrece una descomposicion dispersa de las activaciones del MLP de Qwen3-4B entrenada sobre UltraChat 200k, complementaria a los sparse autoencoders y transcoders clasicos. La formacion de entrada se toma antes de la normalizacion posterior a la atencion y el objetivo es la salida cruda del MLP, una eleccion que condiciona como deben interpretarse los features obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOLT (sparse mixture of linear transforms) sobre las capas MLP de Qwen3-4B; 2.480 transformaciones por capa, N=80, rangos 512/256/128/64/32 |
| Parametros totales | no disponible (el autor no declara recuento; cada capa pesa ~4,22 GB y el total ~126,62 GB) |
| Parametros activos | no aplicable (artefacto de interpretabilidad, no un MoE desplegable) |
| Longitud de contexto | no aplicable (opera sobre activaciones por capa; no genera texto) |
| Tipos de cuantizacion | no aplicable (pesos aprendidos en FP32; buffers de normalizacion en FP32 o BF16) |
| Idiomas soportados | en (entrenado sobre UltraChat 200k en ingles; el autor no declara otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoint.safetensors` por capa) mas `config.json` |
| Capas incluidas | 30 capas (0-28 y 30), numeracion base cero; se excluyen las no finalizadas |
| Pasos de entrenamiento | 100.000 por capa |
| Dataset de entrenamiento | HuggingFaceH4/ultrachat_200k, particion `train_sft`, con la plantilla de chat nativa |
| Modelo objetivo | Qwen/Qwen3-4B |
| Tamano del repositorio | ~126,62 GB (~4,22 GB por capa) |
| Nombres de tensores | coinciden con `Molt.state_dict()` (sin el prefijo `model.` de Lightning) |

## Arquitectura y entrenamiento

Cada capa del artefacto es una MOLT, es decir, una mezcla dispersa de transformaciones lineales con 2.480 transformaciones por capa, parametro N=80 y rangos de 512, 256, 128, 64 y 32. La dispersion se controla mediante umbrales JumpReLU y un coeficiente de dispersion con pico de 7,5e-5, con un rampa de esparsidad a lo largo del 80% del entrenamiento. La entrada se toma antes de la normalizacion posterior a la atencion y el objetivo de reconstruccion es la salida cruda del MLP de la capa correspondiente.

El entrenamiento se realiza por capas de forma independiente, con una tasa de aprendizaje de 4e-5 y un decaimiento de la misma durante el 20% final. Los datos son la particion `train_sft` de UltraChat 200k, procesada con la plantilla de chat nativa. Los checkpoints conservan exactamente los valores y dtypes originales: los pesos aprendidos quedan en FP32 y los buffers de normalizacion mantienen su dtype guardado (FP32 o BF16). No se incluyen estados de optimizador, de scheduler ni del bucle de entrenamiento, por lo que los checkpoints son aptos para inferencia y analisis, no para reanudar el entrenamiento. La implementacion de referencia esta en el repositorio `crosslayer-transcoder`.

## Capacidades

- Descomposicion dispersa de activaciones: reconstruye la salida del MLP de Qwen3-4B a partir de la activacion previa a la normalizacion posterior a la atencion, usando un diccionario de 2.480 transformaciones por capa.
- Extraccion de features interpretables: los umbrales JumpReLU permiten seleccionar que componentes de la mezcla se activan para una entrada dada, facilitando el analisis de features latentes.
- Analisis por capa: al entrenarse de forma independiente, cada capa puede estudiarse de manera aislada sin cargar el conjunto completo.
- Normalizacion reproducible: se preservan las estadisticas de normalizacion de entrada y salida, lo que permite reproducir el mismo preprocesado sobre nuevas activaciones.
- Generacion de texto: no aplicable. El artefacto no produce texto, solo transforma activaciones del modelo objetivo.
- Tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no aplicable (entrenado sobre datos en ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Interpretabilidad mecanicista del MLP de Qwen3-4B: cargar la MOLT de una capa concreta y examinar que transformaciones se activan ante un conjunto de prompts, para identificar features latentes asociados a conceptos concretos.
- Analisis de features monosemanticos: aprovechar la dispersion y los umbrales JumpReLU para aislar componentes poco correlacionados y estudiar si corresponden a conceptos interpretables.
- Auditoria de comportamiento: proyectar activaciones de prompts delicados sobre el diccionario de features para localizar direcciones internas asociadas a sesgos o contenidos problematicos.
- Experimentos de steering: manipular las activaciones reconstruidas por la MOLT para estudiar como cambia la salida del modelo, como paso previo a tecnicas de control de comportamiento.
- Comparacion de tecnicas de diccionarios: contrastar la descomposicion MOLT frente a sparse autoencoders y transcoders sobre las mismas activaciones, con vistas a evaluar que metodo obtiene mejor reconstruccion y esparsidad.
- Reproduccion de la receta: reutilizar los hiperparametros publicados (lr 4e-5, coeficiente de dispersion 7,5e-5, rampa al 80%, decaimiento final al 20%) para entrenar artefactos equivalentes sobre otras capas o modelos.
- Investigacion educativa: usar una unica capa completa (unos 4,22 GB) como caso de estudio en cursos o talleres de interpretabilidad, sin necesidad de manejar los 126,62 GB del repositorio.
- Estudio cross-layer: emplear las 30 capas disponibles para analizar como evolucionan los features del MLP a lo largo de la profundidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de reconstruccion (por ejemplo, perdida L2 o fraccion de varianza explicada), de esparsidad media por capa, ni comparaciones cuantitativas con sparse autoencoders u otros transcoders. Tampoco se documentan tiempos de entrenamiento ni de inferencia.

## Requisitos de hardware

- Inferencia por capa individual: requiere cargar Qwen3-4B (aproximadamente 8 GB en BF16) mas un checkpoint MOLT (~4,22 GB en FP32). Se estiman del orden de 12 a 13 GB de VRAM para procesar una capa cada vez.
- Conjunto completo: los ~126,62 GB de checkpoints mas los ~8 GB del modelo base suman unos 135 GB, lo que exige offload a CPU, almacenamiento rapido o reparto entre varias GPU.
- GPU consumer: una RTX 4090 de 24 GB puede alojar el modelo base y una o dos capas simultaneamente; el conjunto completo no cabe en una sola GPU consumer.
- GPU de datacenter: para analizar varias capas en paralelo conviene una A100 de 80 GB o una H100 de 80 GB, y para el conjunto completo varias unidades o servidores con mucha memoria.
- Opciones de despliegue: no es compatible con motores de inferencia de LLM como vLLM, llama.cpp, Ollama o TGI, porque no es un modelo generativo. La carga se realiza con `huggingface_hub` y `safetensors`, y la implementacion de referencia esta en el repositorio `crosslayer-transcoder`.
- Latencia y throughput: no disponibles. No hay datos publicados sobre coste de reconstruccion por activacion.

## Comparativa con modelos similares

No se dispone de resultados cuantitativos para comparar. La tabla siguiente contrasta la clase de artefacto, no cifras de rendimiento.

| Caracteristica | MOLT (este repositorio) | Sparse autoencoder (SAE) | Transcoder |
|---|---|---|---|
| Que descompone | Entrada al MLP y salida del MLP de Qwen3-4B | Activaciones de una capa concreta | Activacion de entrada y salida de un submodulo (por ejemplo, MLP) |
| Granularidad | 30 capas del modelo objetivo | Habitualmente una capa por artefacto | Habitualmente una capa o submodulo |
| Dispersion | Umbrales JumpReLU con coeficiente 7,5e-5 | Tipicamente L1 o JumpReLU, variable por implementacion | Variable por implementacion |
| Formato de pesos | safetensors, FP32 | safetensors, FP32 (habitual) | safetensors, FP32 (habitual) |
| Licencia | no disponible | depende del autor | depende del autor |
| Datos cuantitativos comparables | no disponibles | no disponibles en esta ficha | no disponibles en esta ficha |

No se identifican en la informacion proporcionada modelos concretos de la misma categoria con los que establecer una comparacion cifrada.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite el uso comercial ni bajo que condiciones. Conviene contactar con el autor antes de cualquier uso en produccion.
- No es un modelo generativo: no acepta prompts de chat ni produce texto; cualquier expectativa de ese tipo es un error de uso.
- Cobertura parcial: solo se incluyen 30 capas (0-28 y 30). Las capas no finalizadas quedan excluidas, por lo que el analisis cross-layer no cubre toda la profundidad del modelo objetivo.
- Dependencia de Qwen3-4B: los artefactos solo tienen sentido junto al modelo base para el que fueron entrenados; no son transferibles directamente a otros modelos.
- Idioma: los datos de entrenamiento son en ingles (UltraChat 200k), por lo que el comportamiento sobre otros idiomas no esta caracterizado.
- Sin estados de entrenamiento: los checkpoints no contienen estados de optimizador ni de scheduler, de modo que no permiten reanudar el entrenamiento.
- Tamano elevado: 126,62 GB en total y FP32 por capa, lo que encarece el almacenamiento y la carga.
- Riesgo de sobreinterpretacion: sin metricas publicadas de reconstruccion o esparsidad, no puede validarse la fidelidad de los features extraidos.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe verificacion externa de resultados.
- Fechas del repositorio: las marcas temporales indican creacion y actualizacion en septiembre de 2026, dato que conviene verificar en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georglange/qwen3-4b-molt
- Modelo objetivo Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de implementacion (crosslayer-transcoder): https://github.com/Goreg12345/crosslayer-transcoder
- Dataset de entrenamiento UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
