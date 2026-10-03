# Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.1

## Resumen

`Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.1` es un checkpoint derivado de GPT-Neo 2.7B, el modelo transformer decoder-only con el que EleutherAI replicó la arquitectura de GPT-3. Sobre ese modelo base se ha aplicado Wanda, un método de poda de pesos para modelos de lenguaje grandes desarrollado por Locus Lab (CMU) que elimina pesos segun el producto entre su magnitud y la norma L2 de las activaciones de entrada, sin necesidad de reentrenamiento posterior. El sufijo `0.1` de la nomenclatura apunta a un ratio de poda del 10 %, aunque la model card no lo confirma de forma explicita.

El repositorio lo publica el usuario Rajeshwari-Chanda, no incluye model card util (la existente es la plantilla autogenerada por Hugging Face, con todos los campos a "More Information Needed"), no declara licencia ni idiomas, y en el momento de la consulta acumula 0 descargas y 0 likes. El peso safetensors declara 2.651.307.520 parametros, prácticamente identico al GPT-Neo 2.7B sin podar, lo que sugiere que la poda aplicada es no estructurada (los pesos podados se conservan en el tensor con valor cero). Esto es relevante: un checkpoint asi no reduce el uso de memoria ni acelera la inferencia salvo que se empleen kernels dispersos especificos.

Se trata, por tanto, de un artefacto de investigacion sobre poda de redes, util para reproducir experimentos de compresion, comparar tecnicas de pruning en un modelo de 2,7 B y servir de base para estudios de eficiencia. No es un modelo listo para produccion ni para uso conversacional: es un modelo base sin ajuste por instrucciones, sin RLHF y entrenado casi exclusivamente en ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-Neo, replica de GPT-3 de EleutherAI) |
| Parametros totales | 2.651.307.520 (~2,65 B) |
| Longitud de contexto | 2048 tokens (dato del modelo base GPT-Neo 2.7B; no confirmado en la model card del checkpoint) |
| Tipos de cuantizacion | No disponible. Pesos publicados en safetensors; el tamano del repositorio (5,3 GB) es coherente con FP16/BF16. Cuantizacion posterior posible con bitsandbytes (int8/int4), sin garantia de soporte de kernels optimizados para `gpt_neo` |
| Idiomas soportados | No disponible. El modelo base se entreno predominantemente en ingles |
| Licencia | No disponible en el repositorio. El GPT-Neo 2.7B original de EleutherAI se publica bajo licencia MIT |
| Formato de pesos | safetensors |
| Poda aplicada | Wanda (weight magnitude x activation norm), ratio indicado en el nombre: 0,1 |
| Tamano del repositorio | 5,3 GB |
| Fecha de creacion | 2026-10-03 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-Neo 2.7B: un transformer decoder-only con 32 capas, dimension oculta de 2560, 20 cabezas de atencion (dimension por cabeza de 128) y capa MLP intermedia de 10240 unidades. Emplea atencion alterna global/local con ventana de 256 tokens (16 bloques, repitiendo el patron una capa global seguida de una local) y embeddings posicionales aprendidos. El tokenizador es el BPE de GPT-2 con un vocabulario de 50257 tokens. El modelo base se entreno sobre The Pile (~825 GiB, del orden de 400 mil millones de tokens), sin ajuste por instrucciones ni RLHF/DPO.

Sobre ese checkpoint se ha aplicado poda Wanda. El metodo puntua cada peso con el producto `|W_ij| * ||X_j||_2`, donde `X_j` es la norma L2 de las activaciones de entrada de la columna correspondiente, calculadas sobre un pequeno conjunto de calibracion, y conserva los pesos de mayor puntuacion segun el ratio de sparsity. Es una poda de tipo "one-shot" que no requiere reentrenamiento, lo que la hace muy barata computacionalmente; su contrapartida es que el modelo podado degrada su calidad de forma mas rapida que tecnicas con fine-tuning posterior. La model card del repositorio no documenta ningun detalle del proceso: no indica el dataset de calibracion, el numero de muestras usado, si la poda fue estructurada o no estructurada, ni si hubo algun ajuste posterior. El unico enlace tecnico presente en los tags (`arxiv:1910.09700`) corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de CO2, citado en la plantilla autogenerada, no al metodo de poda.

## Capacidades

- Generacion de texto autoregresiva en ingles: el modelo funciona como continuador de texto (completion), no como asistente. Responde mejor a prompts de estilo "few-shot" que a instrucciones directas.
- Aprendizaje en contexto (in-context learning): al ser una replica de GPT-3, puede resolver tareas de clasificacion, extraccion o respuesta a preguntas mediante ejemplos en el propio prompt, sin actualizar pesos.
- Sin soporte nativo de tool calling ni function calling: no hay plantilla de chat ni entrenamiento orientado a invocar herramientas.
- Sin capacidades de agente ni razonamiento multi-paso explicito: no dispone de modo "thinking", cadena de pensamiento entrenada ni bucle de planificacion.
- Multilingue limitado: el corpus de entrenamiento del modelo base es mayoritariamente ingles; el rendimiento en castellano u otros idiomas sera notablemente inferior.
- Sin vision ni audio: es un modelo exclusivamente de texto.
- Ajuste fino viable: la arquitectura `gpt_neo` esta soportada en `transformers`, por lo que se puede reentrenar o adaptar con LoRA para tareas concretas.
- Capacidad de compresion reducida en la practica: si la poda es no estructurada, el checkpoint no aporta aceleracion sin kernels dispersos.

## Casos de uso

- Reproduccion de experimentos de poda: comparar el comportamiento de Wanda a ratio 0,1 sobre GPT-Neo 2.7B frente a otros ratios o metodos (SparseGPT, Magnitude) midiendo perplejidad en Wikitext-103 o LAMBADA, usando el mismo pipeline de evaluacion que el repositorio de Locus Lab.
- Estudio de eficiencia en inferencia: analizar en que medida un 10 % de pesos a cero afecta a la latencia real con y sin kernels dispersos, y cuantificar la diferencia entre "sparsity nominal" y "sparsity aprovechable" por el hardware.
- Generacion de texto en ingles con fine-tuning ligero: adaptar el modelo con LoRA a un dominio vertical (por ejemplo, resenas de producto o titulares) y desplegarlo como autocompletador donde el coste por token importa mas que la calidad puntera.
- Generacion de datos sinteticos para aumento de dataset: producir continuaciones plausibles de texto en ingles para preentrenar o aumentar corpus de clasificadores pequenos en tareas de bajo riesgo.
- Clasificacion de texto por prompting few-shot: usar el modelo como extractor de log-probabilidades sobre etiquetas verbales (positivo/negativo, spam/no spam) sin entrenar una cabeza especifica, aprovechando la ventana de 2048 tokens para documentos de longitud media.
- Prototipado en hardware de consumo: validar arquitecturas de servicio (batching, cacheado de KV, streaming de tokens) en una unica GPU de gama media antes de migrar a un modelo mayor.
- Base para destilacion: emplear el checkpoint podado como "teacher" debil o como punto de partida en experimentos de destilacion hacia modelos de menor tamano, midiendo cuanto conocimiento sobrevive a la poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, ni valores de perplejidad, ni comparaciones con el modelo sin podar. Cualquier cifra de MMLU, HellaSwag, LAMBADA o Wikitext-103 para este checkpoint concreto tendria que obtenerse midiendo directamente sobre los pesos publicados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 5,3 GB solo para pesos, mas 0,63 GiB de cache KV con contexto completo (2048 tokens, batch 1, FP16), mas overhead de activaciones y framework. En la practica, entre 6 y 8 GB.
- VRAM estimada en FP32: del orden de 10,6 GB de pesos.
- VRAM estimada cuantizado: int8 ~2,7 GB; int4 ~1,4 GB (mas cache KV y overhead).
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y en tarjetas de 8 GB con cuantizacion. Tambien es viable en CPU con 8-16 GB de RAM, con latencia alta.
- GPU de datacenter: A100, H100, L40S y A10 quedan sobradamente dimensionadas; el modelo es pequeno para su clase de memoria.
- Opciones de despliegue: `transformers` (soporte nativo de `GPTNeoForCausalLM`); Text Generation Inference (GPT-Neo estuvo entre las arquitecturas soportadas historicamente, conviene verificar la version actual); vLLM, llama.cpp y Ollama no confirman soporte de la arquitectura `gpt_neo` y requeririan conversion y validacion previas.
- Latencia y throughput: no disponible. No se han publicado mediciones para este checkpoint y la poda no estructurada no garantiza ninguna mejora de velocidad.
- Nota importante: la poda con pesos enmascarados a cero no reduce el consumo de memoria ni el tiempo de calculo salvo que se usen kernels de sparsidad estructurada, que no son el caso por defecto en `transformers`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.1 | 2,65 B | 2048 (modelo base) | No disponible | Hugging Face, 0 descargas | GPT-Neo 2.7B podado con Wanda; model card vacia |
| EleutherAI/gpt-neo-2.7B | 2,7 B | 2048 | MIT | Hugging Face, muy descargado | Modelo base original, sin podar |
| EleutherAI/pythia-2.8b | 2,8 B | 2048 | Apache 2.0 | Hugging Face | Suite con checkpoints intermedios y datos de entrenamiento publicos, mas util para investigacion reproducible |
| facebook/opt-2.7b | 2,7 B | 2048 | Licencia OPT (uso comercial restringido) | Hugging Face | Alternativa de tamano similar con tokenizador propio |
| openai-community/gpt2-xl | 1,5 B | 1024 | MIT (modificada) | Hugging Face | Referencia historica de la familia GPT-2; menor contexto y menor capacidad |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Repositorio sin model card: la publicada es la plantilla autogenerada de Hugging Face con todos los campos sin rellenar. No hay informacion sobre datos de calibracion, procedimiento de poda, evaluacion ni uso previsto.
- Licencia no declarada: al no especificarse licencia en el repositorio, no hay autorizacion explicita de uso comercial del checkpoint, aunque el modelo base GPT-Neo 2.7B es MIT. Conviene contactar con el autor antes de cualquier uso en produccion.
- Sin validacion de la comunidad: 0 descargas y 0 likes. No hay evidencia externa de que los pesos carguen correctamente ni de que el ratio de poda declarado sea el real.
- Riesgo de degradacion por poda: la poda one-shot sin reentrenamiento suele aumentar la perplejidad de forma apreciable, especialmente en modelos pequenos. No hay mediciones publicadas para este checkpoint.
- Alucinacion: al ser un modelo base de 2,7 B entrenado en 2021, la generacion de hechos es poco fiable y puede producir afirmaciones falsas con fluidez alta.
- Sesgos: el modelo base se entreno sobre The Pile, un corpus web con sesgos de genero, raza, religion y nacionalidad bien documentados en la literatura de EleutherAI. Este checkpoint hereda todos ellos.
- Idiomas: rendimiento muy limitado fuera del ingles. No debe usarse como modelo multilingue ni para produccion en castellano sin un ajuste especifico.
- Contexto corto: 2048 tokens es una ventana pequena comparada con los estandares actuales; tareas de resumen largo o conversaciones extensas requeriran truncado o estrategias de troceado.
- Sin alineacion: no ha pasado por RLHF, DPO ni ajuste por instrucciones. Puede generar contenido toxico, ofensivo o danino si el prompt lo induce.
- Rendimiento practico: si la poda es no estructurada (lo mas probable, dado que el recuento de parametros coincide con el modelo sin podar), no habra ganancia real de velocidad ni de memoria en un despliegue estandar.
- Fecha de creacion anomala: los metadatos indican 2026-10-03, lo que dificulta situar el artefacto en el tiempo y sugiere que puede tratarse de una prueba tecnica sin mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.1
- Perfil del autor en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/models
- Otro modelo del mismo autor (gpt-neo-relu): https://huggingface.co/Rajeshwari-Chanda/gpt-neo-relu
- Modelo base GPT-Neo 2.7B de EleutherAI: https://huggingface.co/EleutherAI/gpt-neo-2.7B
- Repositorio de Wanda (Locus Lab, CMU): https://github.com/locuslab/wanda
- Articulo de Wanda, "A Simple and Effective Pruning Approach for Large Language Models": https://arxiv.org/abs/2306.11695
- Ficha de GPT-Neo 2.7B en Inferix: https://inferix.co/models/EleutherAI/gpt-neo-2.7B
- Guia de despliegue de GPT-Neo 2.7B: https://github.com/sidharthmohannair/GPT-Neo-Deployment-Guide
- Articulo citado en el tag del repositorio (Lacoste et al., 2019, sobre emisiones): https://arxiv.org/abs/1910.09700
