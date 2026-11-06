# PruningEverything/llava_20_percent_compression

## Resumen

`PruningEverything/llava_20_percent_compression` es un checkpoint derivado de LLaVA (Large Language-and-Vision Assistant) al que se le ha aplicado un proceso de poda (pruning) del 20 %, segun se deduce del propio nombre del repositorio. LLaVA es un modelo multimodal que combina un codificador visual (habitualmente CLIP ViT) con un modelo de lenguaje de la familia LLaMA, y que se entrena para responder a instrucciones que combinan imagen y texto.

El modelo lo publica el usuario `PruningEverything`, un perfil que no aporta informacion sobre la metodologia de poda, el dataset de calibracion ni los resultados de evaluacion. La model card es practicamente vacia: solo declara la licencia `llama2` y no incluye descripcion, hiperparametros ni benchmarks. El repositorio no registra descargas ni likes en el momento de la consulta.

Su relevancia es, por tanto, experimental: sirve como artefacto de referencia para quien investigue tecnicas de compresion de modelos multimodales, pero no como modelo listo para produccion. Cualquier uso en un sistema real requeriria una evaluacion propia, dado que no hay evidencia publicada de que la poda preserve las capacidades originales de LLaVA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente LLaVA: codificador visual + LLM tipo LLaMA, segun el nombre del repositorio) |
| Parametros totales | no disponible (se indica una compresion del 20 % respecto al modelo base, sin especificar la base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta en la model card. Por el nombre del repositorio, se trata de un checkpoint de LLaVA sometido a un proceso de poda del 20 %. LLaVA, en sus variantes publicas, empareja un vision encoder tipo CLIP ViT-L/14 con un modelo de lenguaje LLaMA o Vicuna y se afina sobre datos de instrucciones multimodal (por ejemplo, el corpus de 595 000 pares imagen-texto de LLaVA-Instruct-150K y LLaVA-Pretrain).

Se desconoce que tecnica de poda se ha aplicado (estructurada o no estructurada, por magnitud, por movimiento, con o sin reentrenamiento posterior), sobre que checkpoint base exacto se ha ejecutado y con que conjunto de calibracion. Tampoco hay informacion sobre si hubo destilacion, ajuste fino de recuperacion ni evaluacion del impacto de la compresion en las capacidades visuales o linguisticas.

## Capacidades

- Se asume, por herencia de LLaVA, capacidad de respuesta a instrucciones multimodales (imagen + texto), aunque no hay confirmacion ni evaluacion en el repositorio.
- Generacion de texto y razonamiento basico sobre el contenido de una imagen, segun el comportamiento esperado de la familia LLaVA.
- No hay evidencia publicada sobre soporte de tool calling, function calling ni razonamiento multi-paso en este checkpoint.
- No hay informacion sobre capacidades multilingues especificas.
- No hay informacion sobre modos especiales (thinking mode, audio, video).

## Casos de uso

- Investigacion en compresion de modelos multimodales: usar el checkpoint como punto de comparacion frente al LLaVA original para medir la degradacion introducida por una poda del 20 % en tareas como VQA o captioning.
- Reproduccion de experimentos de pruning: servir de artefacto de referencia en articulos o tesis que estudien tecnicas de compresion sobre modelos vision-lenguaje.
- Pruebas de despliegue en entornos con recursos limitados: evaluar si la reduccion de parametros permite inferencia en GPUs de menor VRAM, midiendo la perdida de calidad asociada.
- Analisis de robustez: comprobar si la poda afecta de forma desigual a la comprension de imagenes frente a la generacion de texto.
- Docencia: ilustrar en un curso de eficiencia de modelos el efecto de la compresion sobre un sistema multimodal.
- Benchmarking interno: incluirlo como linea base en una comparativa propia de checkpoints comprimidos antes de adoptar uno en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamano del LLaVA base (las variantes de 7B en fp16 requieren del orden de 14-16 GB, y las de 13B en torno a 26-28 GB), pero no se especifica cual es la base ni el ahorro real tras la poda.
- GPU recomendadas: no disponible. Para un LLaVA de 7B en fp16 seria razonable una RTX 4090 (24 GB) o una A100; para 13B, A100 40 GB o H100.
- Compatibilidad con GPU de consumo: no confirmada; si el modelo base es de 7B y se cuantiza a 4 bits, podria caber en GPUs de 8-12 GB, pero no hay datos que lo verifiquen.
- Opciones de despliegue: no disponibles. En principio, si los pesos estan en formato Hugging Face, podrian servir vLLM, TGI o llama.cpp, pero se desconoce el formato real de los ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PruningEverything/llava_20_percent_compression | no disponible | no disponible | llama2 | Hugging Face, sin descargas |
| LLaVA-1.5-7B (original) | 7B | 4096 tokens (tipico) | llama2 | Hugging Face, ampliamente usado |
| LLaVA-1.5-13B (original) | 13B | 4096 tokens (tipico) | llama2 | Hugging Face, ampliamente usado |
| Qwen2-VL-7B | 7B | 32 768 tokens (configurable) | Apache 2.0 | Hugging Face |

La comparativa es orientativa: no se dispone de datos que confirmen que el checkpoint comprimido mantenga las prestaciones de LLaVA-1.5 ni de que su arquitectura interna coincida exactamente con esa version.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, ni hiperparametros, ni evaluacion, lo que impide verificar que la poda preserve las capacidades del modelo original.
- Riesgo elevado de degradacion silenciosa: una poda del 20 % sin reentrenamiento puede deteriorar la alineacion vision-lenguaje de forma dificil de detectar sin benchmarks propios.
- Sesgos: no evaluados; hereda los sesgos del LLaVA base y del corpus de instrucciones usado en su entrenamiento.
- Alucinacion: sin datos especificos; en modelos vision-lenguaje comprimidos el riesgo de describir objetos ausentes en la imagen suele aumentar.
- Licencia `llama2`: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligacion de atribucion y de nombrar el modelo derivado "Llama"), ademas de condiciones de redistribucion.
- Idiomas: no declarados; LLaVA esta predominantemente entrenado en ingles.
- Sin soporte ni mantenimiento aparente: el repositorio no registra actividad ni descargas, por lo que no cabe esperar correcciones.

## Enlaces

- [Hugging Face: PruningEverything/llava_20_percent_compression](https://huggingface.co/PruningEverything/llava_20_percent_compression)
