# felixnguyen33/Qwen3-VL-30B-A3B-Wanda-50

## Resumen

Qwen3-VL-30B-A3B-Wanda-50 es un checkpoint derivado del modelo multimodal Qwen/Qwen3-VL-30B-A3B-Instruct, publicado por el usuario felixnguyen33 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es el mismo conjunto de pesos del modelo base al que se le ha aplicado una poda no estructurada del 50% sobre las matrices del decodificador mediante la herramienta GBLM-Pruner y el método Wanda. El repositorio ocupa 62,2 GB y declara 31.070.754.032 parámetros en formato safetensors.

El interés de esta ficha es fundamentalmente metodológico. La poda es de tipo *zero-weight*: los valores de los tensores se ponen a cero, pero las formas de los tensores y el tamaño de los ficheros densos no cambian. Esto significa que no hay ahorro de memoria ni aceleración en hardware denso convencional, y que el checkpoint solo resulta útil como objeto de estudio para técnicas de compresión, kernels dispersos o procesos de recuperación de precisión mediante reentrenamiento.

El autor no publica ninguna métrica de calidad: la evaluación sobre RealWorldQA está pendiente y la model card indica explícitamente que no se hace ninguna afirmación de precisión hasta que finalice. El modelo acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad y debe considerarse un artefacto de investigación sin garantías para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); tipo de modelo `qwen3_vl_moe` en Transformers, con codificador de visión |
| Parámetros totales | 31.070.754.032 (según safetensors) |
| Parámetros activos | No disponible; la nomenclatura A3B del modelo base sugiere aproximadamente 3 mil millones activos por token, pero no se confirma en la información proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio contiene pesos densos en safetensors con poda *zero-weight*, no cuantización |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con nombres de tensores nativos de Transformers, sin ficheros de modelado personalizados |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-30B-A3B-Instruct, una arquitectura multimodal de tipo transformer con mezcla de expertos y codificador de visión, orientada a tareas image-text-to-text de carácter conversacional. Este checkpoint no añade entrenamiento: parte de los pesos del modelo base y aplica una poda no estructurada del 50% medida sobre las matrices del decodificador, con una dispersión reportada de exactamente 50,00000000%. El codificador de visión, los routers de la MoE, los embeddings, las capas de normalización y la cabeza de salida permanecen densos, de modo que la poda se concentra en el decodificador.

El procedimiento se ejecutó con GBLM-Pruner usando el método Wanda sobre 128 ventanas de entrenamiento de C4 de 2048 tokens cada una, con semilla 0. La métrica utilizada es la del propio repositorio: una métrica aditiva de activación más gradiente absoluto, con gradientes L1 sumados y escalados por 100. El detalle exacto del alcance, los recuentos y el entorno se documenta en el fichero `pruning_report.json` incluido en el repositorio. Al ser poda *zero-weight*, no se modifican las formas de los tensores ni el tamaño de los ficheros densos, por lo que no se obtiene ninguna ventaja de eficiencia sin kernels que exploten explícitamente la dispersión.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, heredado del modelo base multimodal.
- Conversación multiturno: el repositorio incluye la etiqueta `conversational`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Carga directa en Transformers mediante la clase `Qwen3VLMoeForConditionalGeneration` con `AutoProcessor`, `dtype="auto"`, `device_map="auto"` y `attn_implementation="sdpa"`.
- Razonamiento, generación de código, matemáticas y comprensión visual: capacidades esperables del modelo base, pero sin ninguna evaluación específica publicada para este checkpoint podado.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Investigación en poda de modelos: el checkpoint sirve como artefacto reproducible para estudiar el efecto de una dispersión no estructurada del 50% en un transformer multimodal con MoE, comparando la métrica de Wanda aplicada con GBLM-Pruner contra otras estrategias de selección de pesos.
- Recuperación de precisión mediante reentrenamiento: dado que no se reporta ningún ajuste posterior a la poda, es un punto de partida natural para experimentos de fine-tuning o LoRA que midan cuánta calidad se recupera tras una poda agresiva.
- Evaluación de kernels dispersos: al mantener las formas densas con 50% de ceros, permite medir si librerías con soporte de sparsity no estructurada obtienen ganancias reales de throughput frente a la ejecución densa.
- Línea base negativa en estudios comparativos: útil como referencia degradada frente al modelo base sin podar, siempre que se complete una evaluación cuantitativa propia, ya que el autor no publica ninguna.
- Estudio de sensibilidad por componente: al dejar densos el codificador de visión, los routers MoE, los embeddings, la normalización y la cabeza de salida, permite aislar qué parte de la pérdida de calidad proviene del decodificador podado y qué parte de los componentes intactos.
- Docencia y divulgación sobre compresión de modelos: el repositorio incluye el informe de poda y un ejemplo de carga mínimo, lo que facilita reproducir el flujo completo en un entorno controlado.
- Procesamiento de imagen y texto en producción: no recomendable con este checkpoint en su estado actual, ya que no existe evaluación publicada y los 62,2 GB de pesos densos complican el despliegue; para ese fin debe usarse el modelo base o una variante cuantizada y validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación sobre RealWorldQA se ejecuta por separado y que no se realiza ninguna afirmación de precisión hasta que dicha evaluación finalice. No se dispone de datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra métrica para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-70 GB, calculada a partir de los 31.070.754.032 parámetros y del tamaño de repositorio de 62,2 GB; es una estimación, no un dato publicado.
- VRAM estimada con cuantización a 8 bits: del orden de 31-36 GB, suponiendo que el usuario genere la cuantización, ya que no se distribuye ninguna.
- VRAM estimada con cuantización a 4 bits: del orden de 16-20 GB, igualmente como estimación y no como artefacto disponible.
- GPU recomendadas: A100 80 GB o H100 80 GB para cargar los pesos densos en una sola GPU; el ejemplo de la model card usa `device_map="auto"`, lo que permite reparto entre varias GPU.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en precisión completa; sería necesario repartir entre varias GPU de 24 GB (cuatro unidades para cubrir los 62,2 GB) o generar una cuantización de 4 bits, que sí podría encajar en una sola GPU de 24 GB.
- Opciones de despliegue: Transformers con `attn_implementation="sdpa"` es la ruta documentada por el autor; vLLM, SGLang, TGI, llama.cpp u Ollama no están confirmados en la información proporcionada y requerirían verificar el soporte de la arquitectura `qwen3_vl_moe`.
- Latencia y throughput: no disponibles. Al tratarse de una arquitectura MoE con activación reducida, el coste por token sería inferior al de un modelo denso del mismo tamaño total, pero la poda *zero-weight* no aporta ninguna mejora adicional en hardware denso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Poda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felixnguyen33/Qwen3-VL-30B-A3B-Wanda-50 | 31.070.754.032 | No disponible | 50% no estructurada en el decodificador (Wanda/GBLM) | Apache 2.0 | Pública en Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3-VL-30B-A3B-Instruct (modelo base) | No disponible en la información proporcionada | No disponible | Ninguna | Apache 2.0 | Repositorio oficial de Qwen |
| Otras variantes podadas del mismo modelo base | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no hace ninguna afirmación de precisión hasta completar la evaluación sobre RealWorldQA, por lo que no existe evidencia de que el modelo sea utilizable.
- Degradación esperable: una poda no estructurada del 50% sin reentrenamiento posterior suele producir pérdidas notables de calidad, especialmente en tareas que dependen de las capas del decodificador, como el razonamiento o la coherencia de formato.
- Sin ahorro real de recursos: al ser poda *zero-weight*, el tamaño del repositorio y la memoria necesaria no disminuyen; sin kernels que exploten la dispersión, la inferencia es tan costosa como la del modelo denso equivalente.
- Dispersión no estructurada: los patrones de ceros irregulares pueden degradar el rendimiento de kernels optimizados y complicar la compatibilidad con frameworks de despliegue.
- Alcance limitado de la poda: el codificador de visión, los routers MoE, los embeddings, la normalización y la cabeza de salida permanecen densos, de modo que el comportamiento multimodal puede verse afectado de forma desigual respecto al texto.
- Repositorio de terceros: no es un lanzamiento oficial de Qwen ni de Alibaba, no hay garantía de mantenimiento, corrección de errores ni soporte.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica que nadie ha verificado su comportamiento.
- Riesgo de alucinación: no cuantificado para este checkpoint; debe asumirse un riesgo igual o superior al del modelo base, nunca inferior.
- Idiomas y contexto: no disponibles, por lo que no puede garantizarse cobertura multilingüe ni una ventana de contexto concreta sin consultar la documentación del modelo base.
- Licencia: Apache 2.0 heredada del modelo base, permisiva para uso comercial, pero conviene verificar los términos del repositorio original antes de redistribuir o desplegar.
- Metadatos inconsistentes: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha habitual de publicación de la familia Qwen3-VL, lo que refuerza la necesidad de tratar el repositorio con cautela.
- Hardware: los 62,2 GB de pesos densos lo sitúan fuera del alcance de GPU de consumo individuales sin cuantización adicional, que el usuario tendría que generar por su cuenta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/felixnguyen33/Qwen3-VL-30B-A3B-Wanda-50
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Fichero de informe de poda incluido en el repositorio: `pruning_report.json`
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a un portal de correo electrónico checo y no guardan relación con el modelo.
