# mradermacher/Qwen3-4B-DeepWriting-SFT2-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con imatrix del modelo `ChuGyouk/Qwen3-4B-DeepWriting-SFT2`, un fine-tuning supervisado (SFT) del modelo base Qwen3-4B orientado a la escritura profunda (*deep writing*). La cuantización ha sido realizada por mradermacher, un desarrollador conocido por publicar versiones GGUF de numerosos modelos open source. El objetivo de esta publicación es facilitar la ejecución del modelo en hardware modesto, ya sea en CPU o GPU con poca memoria, mediante el formato GGUF compatible con llama.cpp, Ollama y otros motores de inferencia locales.

El modelo base Qwen3-4B es un transformer denso de 4 mil millones de parámetros desarrollado por Alibaba, con licencia Apache 2.0. El fine-tuning DeepWriting-SFT2, entrenado con las librerías Unsloth y TRL, busca mejorar la capacidad del modelo para generar textos largos y coherentes con un estilo narrativo o expositivo profundo. Este repositorio en concreto solo contiene el archivo de calibración imatrix (0,1 GB) y enlaza a la página del modelo donde se pueden descargar los distintos niveles de cuantización. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32K, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | imatrix (archivo de calibracion); cuantizaciones Q2_K, IQ3_M, Q4_K_S, Q5_K_M, Q6_K, etc. disponibles en la pagina del modelo |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (el modelo base Qwen3-4B es Apache 2.0, pero la licencia del fine-tuning no se especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF con imatrix del fine-tuning `ChuGyouk/Qwen3-4B-DeepWriting-SFT2`. El modelo base, Qwen3-4B, es un transformer denso de 4B parametros entrenado por Alibaba como parte de la familia Qwen3. El fine-tuning fue realizado mediante aprendizaje supervisado (SFT) utilizando las librerias Unsloth y TRL, segun los tags del repositorio. No se ha publicado informacion sobre el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO.

La cuantizacion imatrix (importance matrix) es una tecnica que mejora la calidad de los quants de baja precision al ponderar la importancia de cada tensor durante la calibracion. El archivo imatrix incluido en este repositorio permite a los usuarios generar sus propias cuantizaciones personalizadas con llama.cpp. Los quants pregenerados estan disponibles en la pagina del modelo, con opciones que van desde Q2_K hasta Q6_K, incluyendo variantes IQ (iterative quantization) que ofrecen mejor relacion calidad-tamano.

## Capacidades

- Generacion de texto en ingles, especializado en escritura profunda (deep writing), lo que sugiere una mejora en la coherencia, estructura y profundidad de textos largos.
- Al estar basado en Qwen3-4B, hereda las capacidades generales del modelo base, como razonamiento, comprension lectora y generacion de codigo, aunque no se han publicado evaluaciones especificas de este fine-tuning.
- Soporte de tool calling y function calling: no confirmado para este fine-tuning, aunque el modelo base Qwen3-4B lo soporta.
- Capacidades multilingues: el modelo base Qwen3-4B es multilingue, pero este fine-tuning solo declara ingles en su configuracion.
- No se ha documentado soporte para vision, audio ni modo thinking especifico.

## Casos de uso

- Redaccion de articulos largos y ensayos: el modelo puede generar contenido estructurado y coherente de varias paginas, aprovechando la especializacion en deep writing. Se usaria con una ventana de contexto amplia y prompts que definan el tema y el estilo.
- Creacion de narrativa ficcion: adecuado para escribir relatos o capitulos de novelas, manteniendo la continuidad de personajes y trama a lo largo de multiples turnos.
- Generacion de documentacion tecnica: puede redactar manuales, guias y documentacion de API con un estilo claro y detallado, aunque no se ha verificado su precision tecnica.
- Asistente de escritura creativa: integrable en herramientas de edicion para sugerir parrafos, reescribir secciones o ampliar ideas, gracias a su capacidad de generar texto fluido.
- Generacion de contenido para blogs y marketing: produce borradores de entradas de blog, newsletters o descripciones de productos con un tono profundo y elaborado.
- Fine-tuning adicional: al estar disponible en formato GGUF, puede usarse como base para experimentos de cuantizacion o para ajuste posterior con PEFT, aunque el formato GGUF no es ideal para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning especifico. El modelo base Qwen3-4B tiene resultados publicados en el paper tecnico de Qwen3, pero no se pueden extrapolar a esta version cuantizada sin verificacion.

## Requisitos de hardware

- Al ser un modelo de 4B parametros cuantizado en GGUF, puede ejecutarse en CPU con 8-16 GB de RAM, dependiendo del nivel de cuantizacion (Q2_K ocupa ~2 GB, Q6_K ~3,5 GB).
- En GPU, cabe en tarjetas con 4-6 GB de VRAM para los quants mas bajos (Q2_K, Q3_K), y 6-8 GB para Q5_K o Q6_K.
- GPUs recomendadas: NVIDIA GTX 1660 Super, RTX 3060, RTX 4060, o superiores. Tambien compatible con Apple Silicon via Metal.
- Motores de inferencia compatibles: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier herramienta que soporte GGUF.
- El archivo imatrix incluido no es un modelo ejecutable, sino un archivo de calibracion para generar quants personalizados con `llama.cpp`.
- Latencia y throughput: no disponibles. Dependen del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 32K | Apache 2.0 | safetensors | Generalista |
| Qwen3-4B-DeepWriting-SFT2 (este) | 4B | No disponible | No disponible | GGUF | Escritura profunda |
| Qwen3-4B-GGUF (mradermacher) | 4B | 32K | Apache 2.0 | GGUF | Generalista (cuantizacion) |

No se dispone de otros fine-tunings de escritura profunda comparables en la informacion proporcionada. La principal diferencia con el modelo base es la especializacion en deep writing y el formato GGUF, que facilita el despliegue local.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones especificas de este fine-tuning. Al ser un modelo de 4B, es probable que presente alucinaciones en tareas factuales y razonamiento complejo.
- La licencia no esta especificada en el repositorio. Aunque el modelo base Qwen3-4B es Apache 2.0, el fine-tuning podria tener restricciones adicionales. Se recomienda contactar con el autor del modelo base antes de uso comercial.
- El modelo solo declara soporte para ingles; su rendimiento en otros idiomas no esta garantizado.
- La longitud de contexto no esta confirmada para este fine-tuning. Usar una ventana mayor a la soportada puede degradar la calidad de la generacion.
- El repositorio contiene solo el archivo imatrix; los quants reales deben descargarse desde la pagina del modelo, lo que anade un paso adicional.
- No hay garantias de que el fine-tuning DeepWriting-SFT2 haya sido evaluado rigurosamente; se desconoce su rendimiento en tareas de escritura especificas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-DeepWriting-SFT2-i1-GGUF
- Modelo base (fine-tuning): https://huggingface.co/ChuGyouk/Qwen3-4B-DeepWriting-SFT2
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3-4B-DeepWriting-SFT2-GGUF
- Cuantizacion GGUF del Qwen3-4B base: https://huggingface.co/mradermacher/Qwen3-4B-GGUF
- Paper tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Pagina de descarga de quants (enlace externo): https://hf.tst.eu/model#Qwen3-4B-DeepWriting-SFT2-i1-GGUF
