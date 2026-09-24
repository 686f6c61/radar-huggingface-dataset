# francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, realizado por el usuario `francesca9805` con la librería TRL. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 86.508.288 parámetros (unos 86,5 millones), derivado de un modelo base monolingüe en inglés entrenado sobre aproximadamente 100 MB de texto. El ajuste se ha realizado mediante aprendizaje supervisado (SFT) y los pesos se distribuyen en formato safetensors dentro de un repositorio de 0,2 GB.

El nombre del modelo sugiere que forma parte de una familia de experimentos controlados sobre tokenización y empaquetado de datos: los segmentos `ppt`, `wc-uniform`, `newlex`, `arb`, `before-100mb`, `packed`, `bfd` y `seed455` apuntan a variantes de preprocesado (nuevo léxico, empaquetado tipo best-fit-decreasing, límite de 100 MB, semilla 455). El proyecto de Weights & Biases asociado se llama `new-tokenizers`, lo que refuerza la hipótesis de que se trata de un artefacto de investigación más que de un modelo destinado a producción.

Su relevancia actual es limitada en términos de adopción: cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, no declara licencia y no publica benchmarks. Por tanto, debe considerarse un modelo experimental, útil para reproducir comparativas internas de tokenización o como ejemplo mínimo de un pipeline SFT con TRL, no como un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.508.288 (86,5 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se han publicado versiones cuantizadas; los pesos estan en safetensors (precisión completa). Es posible cuantizar a int8/int4 con herramientas estandar |
| Idiomas soportados | no disponible (el modelo base, `goldfish-models/eng_latn_100mb`, esta entrenado sobre texto en ingles) |
| Licencia | no disponible (la model card incluye el marcador de plantilla `licence: license`, sin concretar) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-09-24 |
| Fecha de actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only de tipo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y el hecho de que herede del modelo base `goldfish-models/eng_latn_100mb`, perteneciente a la colección Goldfish de modelos monolingües pequeños entrenados sobre corpus reducidos (en este caso, inglés en escritura latina con 100 MB de datos). El recuento de parámetros (86,5 M) es inferior al de GPT-2 small (124 M), lo que es coherente con un vocabulario personalizado de menor tamaño que el de GPT-2 estándar (50.257 tokens): al reducir el vocabulario, el bloque de embeddings y la matriz de salida disminuyen y, con ellos, el total de parámetros.

El entrenamiento se ha realizado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. Se trata de un ajuste supervisado (SFT) sobre el modelo base, sin que la información disponible detalle el número de tokens de entrenamiento, la composición del dataset, la receta de empaquetado ni si hubo fases posteriores de RLHF o DPO. La model card únicamente enlaza una ejecución de Weights & Biases del proyecto `new-tokenizers`, lo que sugiere que la variable experimental principal es el esquema de tokenización y no una mejora de capacidades. No se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva básica, heredada del modelo base y refinada mediante SFT.
- Razonamiento de corto alcance y respuesta a instrucciones sencillas, en la medida en que el ajuste SFT lo haya introducido.
- Conversación de un solo turno con formato de mensajes (la model card muestra un ejemplo con `pipeline` y una lista de mensajes con rol `user`).
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en inglés, por lo que es previsible un rendimiento muy pobre fuera del inglés.
- Tool calling / function calling: no documentado; no hay indicios de que se haya entrenado para ello.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de tokenización: el modelo sirve como uno de los puntos de comparación dentro del proyecto `new-tokenizers`, permitiendo medir el efecto de un léxico nuevo sobre una misma cantidad de datos (100 MB). Es su uso más plausible dado el nombre y la ejecución de W&B enlazada.
- Pruebas de pipelines SFT con TRL: útil como ejemplo mínimo y reproducible de cómo se ajusta un GPT-2 pequeño con la API de TRL, incluida la integración con Transformers y Datasets.
- Evaluación de técnicas de empaquetado de datos (`packed`, `bfd`): permite comprobar empíricamente si un empaquetado best-fit-decreasing mejora la pérdida frente a otras estrategias, manteniendo fija la semilla (455) para controlar la varianza.
- Generación de texto de bajo coste en CPU: con 86,5 M de parámetros y pesos de 0,2 GB, puede ejecutarse en un portátil sin GPU para demostraciones docentes de generación de texto.
- Baseline en estudios de destilación o poda: al ser un modelo diminuto con vocabulario reducido, resulta un punto de partida cómodo para comparar técnicas de compresión sobre un modelo ya pequeño.
- Test de integración de text-generation-inference: el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que puede emplearse para validar el despliegue de un endpoint compatible con la API de Hugging Face en un entorno de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): unos 350 MB en fp32, unos 175 MB en fp16/bf16, unos 87 MB en int8 y unos 44 MB en int4. A ello hay que sumar el KV cache, que con un contexto corto es despreciable.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se requiere hardware de gama alta. Modelos como A100, H100, RTX 4090, RTX 3090, RTX 3060 o incluso GTX 1650 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con mas de 1 GB de VRAM, y tambien en CPU y en dispositivos con aceleradores integrados.
- Opciones de despliegue: `transformers` (pipeline de text-generation), Text Generation Inference (TGI) al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, y, previa conversion, llama.cpp u Ollama mediante un GGUF generado por el usuario. No hay GGUF publicado por el autor.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, es razonable esperar latencias de milisegundos por token en GPU moderna y de decenas de milisegundos por token en CPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed455 | 86,5 M | no disponible | no disponible | safetensors en HF | Artefacto de investigacion, 0 descargas |
| goldfish-models/eng_latn_100mb (base) | no disponible en esta ficha | no disponible | no disponible | safetensors en HF | Modelo monolingue ingles entrenado con 100 MB |
| GPT-2 small | 124 M | 1024 tokens | licencia abierta de OpenAI (MIT) | ampliamente disponible | Referencia de la familia; vocabulario de 50.257 tokens |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | safetensors y GGUF en HF | Alternativa moderna de tamano comparable con datos de entrenamiento mucho mayores |

No hay datos de rendimiento comparativo disponibles para el modelo de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un corpus ingles de solo 100 MB, es probable que herede sesgos y limitaciones de cobertura de ese corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en terminos relativos, ya que se trata de un modelo de muy baja capacidad entrenado con poquisimos datos; no debe usarse para tareas que requieran exactitud factual.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo base es monolingue en ingles, por lo que el uso en castellano u otros idiomas no esta respaldado.
- Restricciones de licencia: la model card contiene un marcador de plantilla (`licence: license`) sin licencia efectiva. No se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Madurez: 0 descargas y 0 "likes" indican que no ha sido validado por la comunidad. No hay evaluaciones independientes, ni model card detallada, ni datos de entrenamiento publicados.
- Fechas: las marcas de creacion y actualizacion (2026-09-24) son posteriores a la fecha habitual de referencia, lo que conviene verificar en el repositorio original.
- Uso previsto: dado su caracter experimental, no es adecuado para produccion, atencion al cliente ni generacion de codigo fiable sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases (proyecto `new-tokenizers`): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/valmzk1m
- Cita de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
