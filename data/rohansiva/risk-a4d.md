# rohansiva/risk-a4d

## Resumen

risk-a4d es un checkpoint de CLIP ViT-B-32 partiendo de los pesos preentrenados de OpenAI, afinado de forma completa (encoders de imagen y de texto descongelados) para clasificacion de afordances. Lo desarrolla el usuario rohansiva y se publica bajo licencia MIT en HuggingFace. Su particularidad es que amplia el conjunto habitual de afordances de manipulacion de objetos con cinco afordances de riesgo orientadas a la seguridad infantil: `sharp`, `chokeable`, `hot`, `toxic` y `fragile`.

El modelo aplica la metodologia que el autor denomina A4D, consistente en fine-tuning contrastivo de CLIP comparando cada imagen contra una palabra de afordance y su antonimo, en lugar de contra etiquetas de clase cerradas. Se entreno sobre `risk_dataset`, un conjunto de 686 imagenes repartidas en 35 categorias de objetos cotidianos (mobiliario, menaje, herramientas y elementos de riesgo como pilas, botes de pastillas o jarrones de vidrio), con 15 afordances binarias y 9.866 triples (imagen, afordance, etiqueta).

Es relevante ahora porque ofrece una via ligera (151,3 millones de parametros entrenables) para dotar a sistemas de vision de una capa de razonamiento sobre peligrosidad de objetos, algo util en robótica domestica, asistencia a personas vulnerables o filtrado de contenido. Conviene tener en cuenta que este checkpoint concreto se entreno con el 100 % del dataset, sin particion de test reservada, por lo que esta pensado para uso directo y no para ser evaluado como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B-32 (encoder de vision tipo ViT + encoder de texto tipo transformer), fine-tuning completo |
| Parametros totales | 151,3 millones (parametros entrenables reportados por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como tal; el encoder de texto de CLIP ViT-B-32 admite secuencias de hasta 77 tokens (limite arquitectonico estandar) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en PyTorch, presumiblemente float32) |
| Idiomas soportados | no disponible; las etiquetas de afordances y antonimos estan en ingles y el encoder de texto procede de CLIP OpenAI, entrenado principalmente en ingles |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, diccionario con clave `model_state_dict`), compatible con `open_clip` |

## Arquitectura y entrenamiento

La base es CLIP ViT-B-32 con pesos `openai`, es decir, un transformer de vision (patch 32, resolucion estandar de CLIP) emparejado con un encoder de texto transformer, entrenados originalmente con objetivo contrastivo imagen-texto a gran escala. En este checkpoint ambos encoders se descongelan y se afinan, lo que supone 151,3 millones de parametros entrenables. El objetivo de entrenamiento es la perdida contrastiva simetrica de CLIP, pero sustituyendo la descripcion textual por la palabra de afordance o su antonimo.

La innovacion esta en el esquema de decision: la prediccion no es una etiqueta de clase, sino una comparacion de similitud coseno entre la imagen y dos textos contrapuestos. Para `sharp` el antonimo es `blunt`; para `chokeable`, `oversized`; para `hot`, `cool`; para `toxic`, `nontoxic`; y para `fragile`, `durable`. El mismo esquema se aplica a las diez afordances de manipulacion originales (por ejemplo `graspable` frente a `slippery`, `openable` frente a `sealed` o `stackable` frente a `wobbly`). Esto permite obtener una decision binaria calibrada por similitud relativa en lugar de depender de un clasificador lineal anadido.

En cuanto a los datos, `risk_dataset` contiene 686 imagenes de 35 clases de objeto y 15 afordances binarias, lo que genera 9.866 triples (imagen, afordance, etiqueta). La configuracion de entrenamiento es AdamW con learning rate 1e-5, weight decay 0,01, scheduler OneCycleLR con 50 pasos de warmup, batch de 32, 20 epocas y semilla 42. El checkpoint publicado se entreno sobre el 100 % del dataset, sin particion reservada; el autor referencia una ejecucion complementaria con reparto 80/20 para obtener cifras de exactitud con datos retenidos.

## Capacidades

- Clasificacion binaria de afordances sobre imagenes mediante comparacion contrastiva contra la palabra objetivo y su antonimo.
- Diez afordances de manipulacion de objetos: `containable`, `graspable`, `liftable`, `movable`, `openable`, `pushable`, `rollable`, `stackable`, `supportable` y `traversable`.
- Cinco afordances de riesgo orientadas a seguridad: `sharp`, `chokeable`, `hot`, `toxic` y `fragile`.
- Reconocimiento implicito de 35 categorias de objetos cotidianos (mobiliario, menaje, herramientas y objetos peligrosos como pilas, botes de pastillas y jarrones de vidrio), ya que son las clases presentes en el dataset de entrenamiento.
- Codificacion de imagen y de texto reutilizable: al conservar la estructura de CLIP, los encoders pueden emplearse para similitud imagen-texto generica, aunque degradada respecto al modelo original por el ajuste especifico.
- No soporta tool calling ni function calling.
- No incorpora bucle de agente ni razonamiento multi-paso; cada inferencia es una clasificacion independiente.
- No dispone de modo thinking, ni capacidades de audio, video o generacion de texto.
- Multilingue: no confirmado; el vocabulario de afordances esta en ingles.

## Casos de uso

- Demo de seguridad infantil: dada una imagen de una escena domestica, el modelo puede marcar si un objeto es `sharp`, `chokeable`, `hot` o `toxic`, lo que permite construir alertas del tipo "hay un objeto cortante cerca del bebe" combinando la deteccion de objeto con la afordance de riesgo.
- Deteccion de objetos peligrosos en catalogos de e-commerce: clasificar automaticamente listados de productos para senalar articulos que requieren advertencias de seguridad o restricciones de edad, usando las cinco afordances de riesgo como filtro previo a revision humana.
- Planificacion de agarre en robotica: las afordances `graspable`, `liftable`, `movable` y `supportable` permiten predecir si un objeto es manipulable y como, alimentando un planificador de manipulacion sin necesidad de un modelo especifico de grasping.
- Etiquetado asistido de datasets de vision: el modelo puede preanotar afordances sobre imagenes nuevas para acelerar el etiquetado humano en proyectos de affordance learning o de robotica, dado su bajo coste computacional.
- Asistencia a personas con discapacidad visual: integrado en una aplicacion movil, puede responder a preguntas del tipo "¿este objeto se puede romper?" o "¿es peligroso para un nino?" a partir de una foto, aprovechando la decision contrastiva contra antonimos.
- Moderacion y revision de contenido visual: en plataformas donde se suben imagenes de productos o escenas, el modelo sirve como primera capa para detectar indicios de peligrosidad (objetos cortantes, toxicos o fragiles) antes de un sistema de revision mas costoso.
- Verificacion de robustez en investigacion: al tratarse de un fine-tuning completo de CLIP, es util como punto de comparacion frente a variantes con encoder de texto o de vision congelados, ya que el autor reporta exactitudes distintas para cada configuracion en la particion 80/20.
- Prototipado rapido en CPU o GPU de gama baja: por su tamano reducido, permite iterar sobre pipelines de clasificacion de afordances en equipos sin aceleradores de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si reporta cifras de exactitud de la ejecucion complementaria con particion 80/20, que no corresponden al checkpoint publicado pero sirven de referencia sobre el comportamiento de la metodologia:

| Configuracion | Exactitud global (particion 80/20) |
|---|---|
| Encoder de texto congelado | 0,824 |
| Encoder de vision congelado | 0,933 |
| Ambos encoders descongelados | 0,965 |

El checkpoint `risk-a4d` publicado corresponde a la variante con ambos encoders descongelados, pero entrenada sobre el 100 % del dataset, por lo que no dispone de metrica evaluada con datos retenidos. El autor indica explicitamente que esta pensado para usarse, no para servir de referencia de benchmark.

## Requisitos de hardware

- VRAM estimada en float32: en torno a 600 MB solo para los pesos, mas activaciones; el repositorio completo ocupa 0,6 GB.
- VRAM estimada en float16: aproximadamente 300 MB para los pesos, con margen adicional para imagenes y tensores intermedios.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente, aunque estan muy por encima de lo necesario.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en GPUs integradas o modestas; tambien es viable la inferencia en CPU.
- Opciones de despliegue: al estar integrado en `open_clip`, se puede cargar con PyTorch directamente; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y no serian el camino natural para un modelo CLIP de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos publicados en la informacion disponible. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto de texto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| risk-a4d | 151,3 M entrenables | 77 tokens (encoder CLIP) | Clasificacion de afordances (10 de manipulacion + 5 de riesgo) | MIT | HuggingFace, pesos PyTorch |
| CLIP ViT-B-32 (OpenAI, original) | ~151 M | 77 tokens | Similitud imagen-texto generica y clasificacion zero-shot | Licencia propia de OpenAI | Ampliamente disponible |
| Checkpoint complementario 80/20 del mismo autor | 151,3 M entrenables | 77 tokens | Igual tarea, con particion de test reservada y exactitud de 0,965 | MIT | Referenciado en el repositorio del autor |

Frente al CLIP original, risk-a4d pierde generalidad en la descripcion libre de imagenes pero gana especificidad en la tarea de afordances, en particular en el subconjunto de riesgo, que el CLIP original no cubre de forma explicita. No se dispone de informacion sobre alternativas especializadas en afordances con las que comparar de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset pequeno de 686 imagenes y 35 categorias, es probable que el modelo generalice mal fuera de esas categorias y de las condiciones visuales de captura del dataset.
- Riesgo de alucinacion: al ser un clasificador contrastivo, siempre emite una de las dos etiquetas de cada par (afordance o antonimo), incluso cuando el objeto no es relevante para esa afordance. No existe una clase "no aplica".
- Sin particion de test: este checkpoint se entreno con el 100 % de `risk_dataset`, por lo que cualquier metrica obtenida sobre ese mismo conjunto estaria sobreajustada y no es valida como medida de generalizacion.
- Tamano de datos muy reducido: 9.866 triples etiquetados sobre 686 imagenes es un volumen bajo para un fine-tuning completo de 151,3 millones de parametros, lo que incrementa el riesgo de sobreajuste.
- Limitaciones de idioma: las etiquetas y antonimos estan en ingles; no hay evidencia de comportamiento fiable con prompts en otros idiomas.
- Ambito de clases limitado: solo cabe esperar buen comportamiento en las 35 categorias de objeto del dataset; objetos fuera de ese conjunto no estan cubiertos.
- Uso como sistema de seguridad: no debe emplearse como unico mecanismo de decision en aplicaciones criticas de seguridad infantil o deteccion de peligros, dado el tamano del dataset, la ausencia de evaluacion con datos retenidos y la posibilidad de falsos negativos.
- Restricciones de licencia: la licencia MIT del checkpoint es permisiva, pero el modelo deriva de pesos CLIP de OpenAI, cuyos terminos de uso originales conviene revisar antes de un despliegue comercial.
- Caveat de produccion: el checkpoint se distribuye como `state_dict` de PyTorch y requiere reconstruir la arquitectura con `open_clip.create_model_and_transforms("ViT-B-32", pretrained="openai")` antes de cargar los pesos; no hay versiones GGUF, ONNX ni Safetensors publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohansiva/risk-a4d
- Repositorio de codigo de entrenamiento: referenciado en la model card como `Rule-Discovery`, con los scripts `affordance_classification/training/risk_dataset_training.py` (variante 80/20) y `risk_dataset_training_full.py` (este checkpoint). No se proporciona URL directa en la informacion disponible.
- Perfil del autor en CatalyzeX (resultado de busqueda no relacionado directamente con este modelo, menciona a Rohan Siva en otro trabajo): https://www.catalyzex.com/author/Zhangyang%20Wang
- No se han encontrado papers, blogs ni demos adicionales especificos de este modelo en los resultados de busqueda web disponibles.
