# francesca9805/zho-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

Este modelo es un ajuste fino (SFT) del checkpoint `francesca9805/ppt-wc-zipf-newlex-zho-before-100mb-packed-bfdiso_seed10`, desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros (aproximadamente 124,8 millones) y pesos en formato safetensors, entrenado con la libreria TRL 0.23.0 sobre PyTorch 2.11.0 y Transformers 4.56.2. No es un modelo orientado a produccion ni a tareas generales: su nombre y su procedencia apuntan a un experimento de investigacion sobre tokenizacion, seleccion de datos y empaquetado de secuencias.

El identificador del modelo codifica varias decisiones experimentales: el prefijo `zho` (codigo ISO 639-3 del chino), un corpus de 100 MB, el uso de un esquema de muestreo basado en la ley de Zipf (`zipf`) frente a la variante uniforme del mismo autor, un nuevo lexico (`newlex`), el estado del entrenamiento antes del checkpoint 500 (`before-ckpt500`), empaquetado de secuencias (`packed`) y la semilla 10 (`seed10`). El proyecto de Weights & Biases enlazado en la model card pertenece a `f-padovani-university-of-groningen/new-tokenizers`, lo que situa el trabajo en el contexto de investigacion academica sobre tokenizadores.

Su relevancia practica es limitada: no publica resultados de benchmarks, no declara licencia ni idiomas soportados de forma explicita y acumula cero descargas y cero likes. Su interes es fundamentalmente metodologico, como punto de comparacion reproducible dentro de una familia de experimentos controlados por semilla, esquema de muestreo y estado de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se declara en la model card; el GPT-2 original usa 1024 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors sin variantes cuantizadas ni GGUF |
| Idiomas soportados | No disponible. El prefijo `zho` del identificador (ISO 639-3 del chino) sugiere corpus en chino, pero la ficha no lo confirma |
| Licencia | No disponible; la model card incluye la etiqueta `licence: license` sin especificar terminos |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,0 GB |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-zho-before-100mb-packed-bfdiso_seed10 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Version de librerias | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Semilla | 10 (segun el identificador) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y el recuento de parametros (124,77 M) coinciden con la configuracion del GPT-2 base de 124 M: un transformer decoder-only con atencion causal completa, normalizacion por capas previa y embeddings posicionales aprendidos. No hay indicios en la informacion disponible de que se haya introducido atencion lineal, mezcla de expertos, componentes de espacio de estados ni decodificacion especulativa. El ajuste se realizo mediante SFT con TRL 0.23.0, partiendo del checkpoint intermedio `ppt-wc-zipf-newlex-zho-before-100mb-packed-bfdiso_seed10`.

Los detalles del dataset de entrenamiento no se especifican en la model card: no se declara el numero de tokens, la composicion del corpus ni si hubo fases posteriores de RLHF o DPO. Por el nombre del modelo se deduce un pipeline experimental con un corpus de aproximadamente 100 MB, un esquema de seleccion o ponderacion basado en la ley de Zipf, un lexico nuevo para el tokenizador y empaquetado de secuencias. El seguimiento del entrenamiento esta disponible en un panel publico de Weights & Biases asociado al proyecto de tokenizadores de la Universidad de Groningen. La ausencia de datos de evaluacion impide valorar el efecto real de estas decisiones sobre la calidad final del modelo.

## Capacidades

- Generacion de texto autoregresiva en el dominio del corpus de ajuste; el ejemplo de la model card usa una pregunta abierta en ingles sobre viajes en el tiempo.
- Conversacion de un solo turno mediante la API de `pipeline` con formato de mensajes `{"role": "user", "content": ...}`, tal como aparece en el quick start del autor.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni ninguna modalidad adicional.
- Capacidades multilingues no declaradas; el sufijo `zho` sugiere orientacion al chino, sin confirmacion oficial.
- Al ser un modelo de 124,8 M de parametros, su capacidad de razonamiento, matematicas y codigo es muy limitada en comparacion con modelos contemporaneos de mayor tamano.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo sirve como punto de control dentro de una familia de variantes por semilla, esquema de muestreo (Zipf frente a uniforme) y estado de checkpoint, util para comparar el efecto de cada decision de forma aislada.
- Ablaciones de seleccion de datos: permite medir como afecta el uso de un corpus de 100 MB con muestreo Zipf frente a un muestreo uniforme en la perplexity del ajuste, siempre que se disponga del conjunto de evaluacion del proyecto original.
- Aprendizaje y docencia: su tamano reducido (aproximadamente 250 MB en bf16) permite ejecutarlo en portatiles y GPUs integradas para ilustrar el ciclo completo de SFT con TRL.
- Generacion de texto corto en chino (si se confirma el idioma): borradores de frases sueltas o continuaciones breves, sin expectativas de coherencia en textos largos.
- Punto de partida para ajustes posteriores: al ser un modelo base pequeno con licencia no declarada, puede servir de semilla para experimentos academicos de SFT o DPO de bajo coste.
- Pruebas de infraestructura: por su tamano, es adecuado para validar pipelines de despliegue (TGI, vLLM, llama.cpp) y medir latencias sin consumir recursos significativos.
- Aumento de datos sinteticos a pequena escala: generacion de continuaciones para enriquecer corpus de investigacion, con revision humana obligatoria.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas que requieran razonamiento fiable, dado que no hay evidencia de rendimiento publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y el repositorio no enlaza resultados de evaluacion mas alla del panel de entrenamiento en Weights & Biases.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 500 MB en FP32, 250 MB en BF16/FP16, 125 MB en INT8 y 63 MB en INT4 (calculado a partir de los 124,77 M de parametros; el autor no publica estas cifras).
- El tamano del repositorio es de 4,0 GB, muy superior al peso teorico de los parametros en bf16, lo que sugiere la presencia de artefactos adicionales o copias de checkpoint. Conviene revisar los ficheros antes de desplegar.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia con llama.cpp tras conversion a GGUF.
- LLM Explorer, en su entrada para el modelo hermano de la misma familia, indica 0,2 GB de VRAM, coherente con una carga en precision reducida.
- Opciones de despliegue: `transformers` con la API de `pipeline`, Text Generation Inference (etiqueta `text-generation-inference` presente en el repositorio) y endpoints compatibles. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el autor no publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zho-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10 | 124,8 M | No disponible | No disponible | HuggingFace, 0 descargas |
| francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10 | 124,8 M (misma familia) | No disponible | No disponible | HuggingFace |
| francesca9805/urd-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10 | 124,8 M (LLM Explorer) | No disponible | No disponible | HuggingFace, VRAM 0,2 GB segun LLM Explorer |
| GPT-2 base (referencia de arquitectura) | 124 M | 1024 tokens | MIT modificada | Ampliamente disponible |

No se dispone de resultados de benchmarks comparativos entre estas variantes. La comparacion con el GPT-2 base es estructural (misma arquitectura y orden de magnitud de parametros), no de rendimiento. Los datos de los modelos hermanos proceden de los resultados de busqueda indicados; sus fichas tampoco declaran licencia ni idiomas.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni perplexity, ni analisis cualitativo que permita estimar la calidad de las generaciones.
- Licencia sin definir: la model card incluye `licence: license` sin terminos concretos, por lo que el uso comercial queda en un limbo legal y no es recomendable sin aclaracion expresa del autor.
- Riesgo elevado de alucinacion y de incoherencia: con 124,8 M de parametros y un corpus de ajuste de 100 MB, el modelo no tiene capacidad suficiente para mantener coherencia factual ni conversaciones largas.
- Idiomas no declarados: si el entrenamiento se limito al chino, el rendimiento en castellano u otras lenguas sera practicamente nulo.
- Longitud de contexto no confirmada: no se puede garantizar el soporte de secuencias largas ni de contextos multi-turno extensos.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, etnia, religion o sesgos culturales propios del corpus.
- Repositorio de 4,0 GB frente a unos 250 MB de pesos en bf16: conviene auditar el contenido antes de descargarlo o desplegarlo en entornos con almacenamiento limitado.
- Cero adopcion (0 descargas, 0 likes): no existe comunidad, issues ni soporte, lo que aumenta el riesgo de comportamiento no documentado.
- No apto para produccion: sin garantias de licencia, sin evaluacion y con capacidades muy limitadas, debe tratarse como material de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-zho-before-100mb-packed-bfdiso_seed10
- Variante uniforme (misma familia): https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Variante uniforme despues del checkpoint 500: https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed10
- Variante en urdu: https://llm-explorer.com/model/francesca9805%2Furd-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,2ev4hiddp1ejXK9fkhAZtW
- Variante con semilla 3407 en FriendliAI: https://friendli.ai/models/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Panel de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4pe8liql
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (BibTeX incluida en la model card): von Werra et al., 2020, GitHub repository
