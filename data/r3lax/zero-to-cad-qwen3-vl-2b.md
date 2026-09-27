# r3lax/Zero-To-CAD-Qwen3-VL-2B

## Resumen

Zero-To-CAD-Qwen3-VL-2B es un modelo de visión-lenguaje especializado en reconstrucción de geometría CAD a partir de imágenes. Se trata de un ajuste fino completo (full fine-tuning) del modelo base Qwen3-VL-2B-Instruct, desarrollado por Autodesk Research (los autores del paper son Mohammadmehdi Ataei, Farzaneh Askari, Kamal Rahimi Malekshan y Pradeep Kumar Jayaraman) y publicado en HuggingFace bajo el identificador r3lax/Zero-To-CAD-Qwen3-VL-2B. El modelo recibe 8 vistas renderizadas de una pieza 3D (4 frontales y 4 traseras, a resolución 256×256) y genera código Python ejecutable en CadQuery que reproduce la geometría.

El problema que resuelve es la brecha entre representaciones visuales y CAD paramétrico editable: en lugar de producir una malla o una nube de puntos, el modelo emite código fuente que puede modificarse, re-ejecutarse y exportarse a STEP o STL. Esto lo convierte en una herramienta relevante para ingeniería inversa, digitalización de piezas y pipelines de diseño generativo, donde el resultado debe ser editable y no solo visual.

Con 2.127.532.032 parámetros totales (aproximadamente 2,13 mil millones) y un tamaño de repositorio de 4,3 GB, el modelo cabe en GPUs de consumo. Su entrenamiento se realizó íntegramente sobre datos sintéticos del dataset Zero-To-CAD 1M (979.633 muestras de entrenamiento), sin utilizar ficheros CAD reales, y la longitud máxima de secuencia empleada fue de 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL), con codificador visual y decodificador de lenguaje |
| Parametros totales | 2.127.532.032 (aproximadamente 2,13 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima de secuencia usada en el entrenamiento; no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; se puede cuantizar externamente con bitsandbytes, GPTQ o AWQ) |
| Idiomas soportados | en (ingles), code (codigo Python/CadQuery) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos de interes: pipeline declarado `image-to-text`, biblioteca `transformers`, etiquetas `qwen3_vl` e `image-text-to-text`. Repositorio creado el 26 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta. Modelo base: Qwen/Qwen3-VL-2B-Instruct.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje autorregresivo. Las 8 imágenes de entrada se tokenizan como tokens visuales y se concatenan con el prompt de texto, de modo que el decodificador genera directamente la secuencia de código CadQuery condicionada por las vistas. No se documentan innovaciones arquitectónicas propias: la contribución del trabajo está en el pipeline de síntesis de datos y en el ajuste fino, no en la topología de red.

El entrenamiento consistió en un ajuste fino completo de los pesos sobre 979.633 muestras sintéticas del dataset Zero-To-CAD 1M, generadas de forma agéntica sin datos reales. Los hiperparámetros reportados son: optimizador AdamW, learning rate 1 × 10⁻⁴, weight decay 0.0, scheduler coseno, warmup ratio 0.03, dropout de atención 0.1, precisión bfloat16, 3 épocas, batch efectivo 16 (batch por GPU 1) y estrategia DDP sobre 16 GPUs NVIDIA H100 de 80 GB. No se menciona uso de RLHF ni DPO; se trata de aprendizaje supervisado sobre pares (vistas renderizadas, código CadQuery).

## Capacidades

- Reconstruccion image-to-CAD: genera codigo CadQuery ejecutable a partir de 8 vistas renderizadas (4 frontales y 4 traseras) a 256×256.
- Generacion de codigo Python: produce programas CadQuery limpios y estructurados, con la variable `result` como solido de salida.
- Interpretacion de geometria multi-vista: integra informacion de varias vistas para inferir la forma 3D completa.
- Exportacion a formatos CAD: el codigo generado se puede ejecutar con `cadquery` y exportar a STEP y STL.
- Razonamiento espacial implicito: reconstruye geometria parametrica (operaciones de extrusión, revolución, booleanas) en lugar de mallas.
- Capacidades heredadas del modelo base: comprension de imagenes generica e instrucciones en lenguaje natural, aunque el ajuste fino esta orientado a la tarea CAD.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Soporte de agentes multi-paso de forma nativa: no documentado; el modelo se usa como un unico paso generativo.
- Multilingue: limitado a ingles y codigo segun las etiquetas del repositorio.

## Casos de uso

- Ingenieria inversa de piezas: a partir de renders de una pieza fisica digitalizada, el modelo genera el codigo CadQuery que la reproduce, y este se exporta a STEP para reeditarlo en un CAD convencional. Es adecuado porque la salida es parametrica y modificable, no una malla cerrada.
- Digitalizacion de catalogos de piezas legacy: procesar lotes de vistas renderizadas de componentes antiguos y obtener automaticamente programas CadQuery que reconstruyan su geometria, reduciendo el trabajo manual de redibujado.
- Generacion de datasets CAD sinteticos: usar el modelo como generador de pares (vistas, codigo) para aumentar corpus de entrenamiento de otros sistemas, aprovechando su tasa de exito del 82,1 % en el benchmark propio.
- Pipeline de reconstruccion extremo a extremo: integrar el modelo con un motor de renderizado que produzca las 8 vistas a 256×256, ejecutar el codigo generado y comparar el IoU de vóxeles contra la referencia para control de calidad automatico.
- Prototipado rapido en diseno mecanico: subir capturas ortograficas de un boceto 3D y obtener codigo CadQuery base que el ingeniero refina, acelerando la primera iteracion de diseno.
- Investigacion en generacion de secuencias CAD: emplear el modelo como baseline reproducible (licencia Apache 2.0) para comparar nuevas tecnicas de image-to-sequence en CAD frente a un resultado publicado.
- Automatizacion de documentacion tecnica: generar el codigo fuente de las piezas a partir de sus vistas y anexarlo como documentacion reproducible junto a los planos.
- Educacion en CAD parametrico: mostrar al estudiante como se traduce una forma vista desde varios angulos a operaciones CadQuery concretas, usando el modelo como generador de ejemplos.

## Benchmarks y rendimiento

Resultados reportados por los autores. La metrica principal es el IoU voxelizado a resolución 64³ entre el solido generado y el de referencia, con alineacion rotacional (IoU maximo en incrementos de 45°). La tasa de exito es el porcentaje de generaciones que producen codigo CadQuery valido y ejecutable.

| Benchmark | Success rate | Mean IoU | Median IoU | P90 IoU |
|---|---|---|---|---|
| Zero-to-CAD test (in-distribution) | 82,1 % | 0,747 | 0,847 | 0,999 |
| ABC (out-of-distribution) | 61,0 % | 0,377 | 0,303 | 0,854 |

Comparacion con baselines, segun la model card:

| Modelo | Zero-to-CAD success | Zero-to-CAD mean IoU | ABC success | ABC mean IoU |
|---|---|---|---|---|
| Este modelo | 82,1 % | 0,747 | 61,0 % | 0,377 |
| GPT-5.2 High | 72,2 % | 0,485 | 66,2 % | 0,344 |
| GPT-5.2 Medium | 71,1 % | 0,495 | 62,6 % | 0,346 |
| Qwen3-VL-2B (base) | 6,6 % | 0,184 | 5,4 % | 0,131 |

No se han publicado en la informacion disponible otros benchmarks estandar de lenguaje o codigo (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 4,3 GB solo para pesos, mas el cache KV y las activaciones del codificador visual al procesar 8 imagenes de 256×256. En la practica, entre 8 y 12 GB para inferencia con las 8 vistas.
- Cuantizacion: al no haber GGUF oficial, se puede reducir con bitsandbytes en 8 bits (unos 2,5 GB de pesos) o 4 bits (unos 1,5 GB), a costa de posible perdida de fidelidad en el codigo generado.
- GPUs recomendadas: NVIDIA H100 o A100 80 GB para lotes grandes o entrenamiento; RTX 4090, RTX 4080, RTX 3090 o A10G para inferencia en bf16.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB pueden ejecutar el modelo en bf16 con las 8 vistas; en GPUs de 8 GB es recomendable cuantizar.
- Opciones de despliegue: transformers (ruta oficial, con `Qwen3VLForConditionalGeneration` y `AutoProcessor`), vLLM y SGLang para servir con mayor throughput, TGI si se integra como modelo de imagen-texto. No hay soporte GGUF ni Ollama documentado.
- Latencia y throughput: no disponible. El unico dato de rendimiento de generacion es la longitud maxima de 4.096 tokens nuevos por inferencia (`max_new_tokens=4096` en el ejemplo oficial).
- Entrenamiento reproducible: el ajuste fino se hizo con 16 × H100 80 GB, batch efectivo 16 y 3 epocas, lo que da una referencia de coste para reentrenar o continuar el ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Zero-to-CAD success / mean IoU | ABC success / mean IoU | Licencia |
|---|---|---|---|---|---|
| Zero-To-CAD-Qwen3-VL-2B | 2,13 B | 4.096 tokens | 82,1 % / 0,747 | 61,0 % / 0,377 | apache-2.0 |
| GPT-5.2 High (referencia cerrada) | no disponible | no disponible | 72,2 % / 0,485 | 66,2 % / 0,344 | propietaria |
| GPT-5.2 Medium (referencia cerrada) | no disponible | no disponible | 71,1 % / 0,495 | 62,6 % / 0,346 | propietaria |
| Qwen3-VL-2B-Instruct (base) | 2,13 B aprox. | no disponible | 6,6 % / 0,184 | 5,4 % / 0,131 | apache-2.0 |

El salto respecto al modelo base es notable (de 6,6 % a 82,1 % de exito en el test in-distribution), lo que indica que la tarea depende fuertemente del ajuste fino especializado. En el conjunto out-of-distribution ABC el modelo supera a GPT-5.2 en IoU medio pero queda por debajo en tasa de exito, lo que sugiere mayor fidelidad geometrica cuando acierta y mas fallos de ejecucion cuando no. No se dispone de comparacion con otros modelos especificos de image-to-CAD en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: puede degradarse con entradas fotorealistas, ruidosas o con oclusiones, ya que nunca vio ficheros CAD ni renders reales durante el entrenamiento.
- Entrada rigida: espera exactamente 8 vistas limpias a 256×256 (4 frontales y 4 traseras); otras configuraciones no han sido probadas y probablemente fallen.
- Salida limitada a CadQuery: solo genera codigo en ese dialecto de Python; otros formatos CAD requieren post-procesado adicional.
- Ventana de contexto de 4.096 tokens: las piezas complejas o los ensamblajes multipieza pueden superar ese limite y truncarse, segun advierte el propio autor.
- Riesgo de codigo invalido: aunque la tasa de exito es alta en distribucion, un 17,9 % de las generaciones del test no producen codigo ejecutable; en datos fuera de distribucion el fallo alcanza el 39 %. Toda salida debe validarse ejecutandola antes de usarla.
- Alucinacion geometrica: el modelo puede producir codigo valido que no corresponde a la forma observada; el IoU mediano de 0,303 en ABC indica que en dominios alejados del entrenamiento la fidelidad cae de forma acusada.
- Idioma: soporte declarado solo para ingles y codigo; no se garantiza un comportamiento correcto con instrucciones en castellano u otros idiomas.
- Sesgos: no hay informacion disponible sobre sesgos especificos, aunque al entrenar con datos sinteticos puede heredar las distribuciones y limitaciones del generador que creo el dataset.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria. Conviene revisar igualmente los terminos del modelo base Qwen3-VL-2B-Instruct.
- Repositorio con 0 descargas y 0 likes: no hay validacion independiente de la comunidad sobre el identificador r3lax/Zero-To-CAD-Qwen3-VL-2B, que ademas difiere del usado en el codigo de ejemplo de la model card (ADSKAILab/Zero-To-CAD-Qwen3-VL-2B). Verificar cual de los dos repositorios contiene los pesos definitivos antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r3lax/Zero-To-CAD-Qwen3-VL-2B
- Modelo referenciado en la model card (posible repositorio original): https://huggingface.co/ADSKAILab/Zero-To-CAD-Qwen3-VL-2B
- Paper: https://arxiv.org/abs/2604.24479
- Dataset completo Zero-to-CAD 1M: https://huggingface.co/datasets/ADSKAILab/Zero-To-CAD-1m
- Subconjunto curado Zero-to-CAD 100K: https://huggingface.co/datasets/ADSKAILab/Zero-To-CAD-100k
- Coleccion Zero-to-CAD: https://huggingface.co/collections/ADSKAILab/zero-to-cad
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio de CadQuery (dependencia de ejecucion): no disponible en los resultados de busqueda
- Resultados de busqueda web: los enlaces devueltos no guardan relacion con el modelo ni con CAD, por lo que se omiten por no aportar informacion util.
