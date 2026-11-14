# Hooshaai/bert-comp-slicegpt-pca-sst2

## Resumen

`bert-comp-slicegpt-pca-sst2` es un checkpoint comprimido y "curado" con LoRA de `google-bert/bert-base-uncased`, afinado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica el autor Hooshaai bajo el paraguas de NeuralOps, una librería de compresión de modelos que incluye un zoo de compressores. El modelo parte de BERT-base (109.483.778 parámetros, 12 capas, dimensión oculta 768) y aplica el compresor `slicegpt_pca` (`SliceGPTPCACompressor`), que proyecta las activaciones sobre coordenadas principales y sustituye las capas densas por factorizaciones de bajo rango reales (`SVDLinear`), reduciendo el recuento de parámetros de `d_out*d_in` a `(d_out+d_in)*keep`.

El checkpoint empaquetado corresponde al rango `k=128`, con 34.956.916 parámetros tras la compresión (una reducción del 68,07 % y un ratio de compresión físico de 3,132x). Tras aplicar un "healing" con LoRA (r=8, 50 pasos, lr=2e-4), el modelo alcanza un 73,39 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor original; en modo zero-shot la precisión cae al 51,38 %, por lo que el ajuste LoRA es imprescindible para que el modelo sea utilizable.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de un pipeline de compresión agresiva con recuperación de precisión vía LoRA sobre una arquitectura encoder clásica. No es un modelo de propósito general ni compite en capacidad con LLMs; es una pieza de investigación y evaluación de técnicas de compresión. El repositorio ocupa 0,1 GB y los pesos serializados pesan 66,8 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido con SliceGPT PCA y factorización SVDLinear de bajo rango |
| Parametros totales | 34.956.916 (tras compresión; base original: 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base admite 512 tokens; la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible (compresión por rango `k`, no cuantización numérica declarada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) |
| Rango de compresión (`k`) | 128 (checkpoint empaquetado) |
| Ratio de compresión | 3,132x (68,07 % de reducción de parámetros) |
| Librería | `neuralops` |
| Pipeline | `text-classification` |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de ajuste | `nyu-mll/glue`, configuración `sst2` |
| Tamaño del repositorio | 0,1 GB (pesos: 66,8 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado por Google y afinado originalmente en SST-2 (el "profesor" con 91,63 % de accuracy). Sobre ese modelo, NeuralOps aplica `SliceGPTPCACompressor`, un compresor de la familia `quantization` que realiza una proyección de coordenadas principales consciente de las activaciones (activation-aware) y recorta dimensiones en las capas `Linear` y `Conv1D`. La clave es que cada peso denso recortado se reemplaza por una factorización `SVDLinear` de bajo rango, de modo que el número de parámetros cae de forma efectiva y no solo nominal.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplica un adaptador LoRA de rango r=8 durante 50 pasos con lr=2e-4 y un presupuesto de 45 segundos, sobre una NVIDIA GeForce RTX 3090 (24 GB). La evaluación se hizo sobre la partición de validación de GLUE SST-2 (872 muestras). No se detalla en la información disponible el volumen de datos de entrenamiento adicional, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no aplica a un clasificador). La evaluación multi-rango cubre `k=256, 128, 64, 32`; el rango `k=64` falló con `FAIL_CRASH` y no produjo checkpoint.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, específicamente en el dominio de reseñas de SST-2.
- Inferencia de secuencias de texto con el tokenizador estándar `bert-base-uncased`.
- Ejecución en CPU y GPU con un footprint de pesos de 66,8 MB, apto para entornos con recursos muy limitados.
- Integración con la API de NeuralOps (`load_surgeried_model`) y reconstrucción del grafo comprimido mediante `compress_model`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés; el vocabulario uncased de BERT no cubre otros idiomas de forma fiable.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de productos o servicios en inglés: el modelo devuelve logits de dos clases y puede integrarse en un pipeline de análisis de opiniones donde el coste por inferencia y el tamaño del modelo son críticos (66,8 MB de pesos).
- Filtrado de comentarios en foros o secciones de noticias: al ser un encoder pequeño y rápido, se puede desplegar en el borde o en contenedores ligeros para preclasificar grandes volúmenes de texto antes de un análisis más profundo.
- Enrutamiento de tickets de soporte: usar la polaridad detectada para priorizar quejas negativas hacia colas de atención urgente, aprovechando la baja latencia esperada de un modelo de 35 M de parámetros.
- Investigación en compresión de modelos: sirve como referencia reproducible para comparar técnicas de poda, proyección PCA y recuperación LoRA sobre un mismo profesor y dataset, con telemetría incluida en `compression_summary.json`.
- Docencia y experimentación: ejemplo didáctico de cómo una compresión agresiva (3,13x) degrada la precisión y cómo un ajuste LoRA de 50 pasos recupera parte del rendimiento, útil en cursos de eficiencia de modelos.
- Moderación de contenido a pequeña escala: como clasificador auxiliar de tono en pipelines de moderación, siempre que el dominio se parezca al de SST-2 y se acepte su precisión del 73,39 %.
- Pruebas de integración de la librería NeuralOps: validar el flujo `compress_model` + carga de state dict + inferencia en CI, dado el tamaño reducido del artefacto.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / configuración | GLUE SST-2 (validación) | Parámetros | Ratio de compresión |
|---|---:|---:|---:|
| Profesor `bert-base-uncased` (baseline) | 91,63 % | 109.483.778 | 1,00x |
| `slicegpt_pca` k=128, zero-shot | 51,38 % | 34.956.916 | 3,13x |
| `slicegpt_pca` k=128, con LoRA (checkpoint empaquetado) | 73,39 % | 34.956.916 | 3,13x |
| `slicegpt_pca` k=32, con LoRA | 60,21 % | 29.603.984 | 3,70x |
| `slicegpt_pca` k=64 | `FAIL_CRASH` | — | — |

La evaluación se realizó sobre 872 muestras de la partición de validación de SST-2 en una RTX 3090. El delta de paridad frente al profesor para el checkpoint empaquetado es de −18,24 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 35 M de parámetros (unos 140 MB de pesos más activaciones); holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se hizo en una NVIDIA GeForce RTX 3090 (24 GB), muy por encima de lo necesario.
- Cabe en GPU consumer: sí, en cualquier RTX/GTX moderna e incluso en iGPU y CPU.
- Despliegue: PyTorch nativo con `transformers` + `neuralops`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el formato es `pytorch_model.bin` y requiere reconstruir el grafo comprimido con `compress_model` antes de cargar el state dict).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `bert-comp-slicegpt-pca-sst2` (k=128) | 34,96 M | No disponible | 73,39 % | MIT | Hugging Face (45 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos disponibles; no se han publicado cifras de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento solo puede hacerse contra el profesor declarado por el autor.

## Limitaciones y advertencias

- Precisión muy inferior al profesor: 73,39 % frente a 91,63 %, una pérdida de 18,24 puntos; no es apto para producción donde se requiera precisión cercana al estado del arte en SST-2.
- Dependencia crítica del ajuste LoRA: en zero-shot la accuracy cae al 51,38 %, prácticamente azar en una tarea binaria.
- El rango `k=64` falló con `FAIL_CRASH`; la robustez del pipeline de compresión no está garantizada en todos los rangos.
- Especialización estrecha: entrenado y evaluado solo en SST-2; el rendimiento fuera de ese dominio (otras tareas, otros registros, otros idiomas) no está caracterizado.
- Solo inglés; el tokenizador uncased de BERT limita el uso multilingüe.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas en dominios alejados del entrenamiento.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-base y SST-2, hereda los sesgos del corpus original, no caracterizados en la model card.
- Requiere la librería `neuralops` y reconstruir el grafo comprimido antes de cargar los pesos; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- Los resultados de benchmark están marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos como referencia.
- Licencia MIT: permite uso comercial, pero al derivar de BERT-base (Apache 2.0) conviene revisar las obligaciones de atribución del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-slicegpt-pca-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `slicegpt_pca`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/slicegpt_pca.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
