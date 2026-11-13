# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_tanh-V

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_tanh-V` es un clasificador de imágenes basado en una arquitectura bViT (vision transformer de tipo bidireccional, según la nomenclatura del autor), entrenado por el usuario ais0430 dentro de un proyecto de reproducción experimental denominado bViT_circuit. El modelo está publicado en Hugging Face con la librería transformers y el pipeline `image-classification`, y sus pesos están en formato safetensors con 3.059.926 parámetros totales, lo que lo sitúa en la categoría de modelos muy compactos para visión.

El problema que aborda es la clasificación de imágenes sobre el subconjunto ImageNet-100 (100 clases de ImageNet), según el `dataset_tag` declarado en la model card. El autor reporta una precisión de evaluación (`eval accuracy best`) de 0,4414, es decir, un 44,14 % de acierto top-1 en ese conjunto. El nombre del repositorio codifica los hiperparámetros del experimento: dimensión de embedding 462, 6 cabezas de atención, 30 épocas de entrenamiento, batch size 128, learning rate 5e-4, sin EMA (exponential moving average) y activación tangente hiperbólica.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con documentación mínima (la model card remite a un repositorio externo para los detalles de diseño). No debe confundirse con un modelo listo para producción, sino con un checkpoint experimental reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (vision transformer, variante del proyecto bViT_circuit) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Dataset de entrenamiento | ImageNet-100 (`imagenet100`) |
| Dimensión de embedding | 462 |
| Cabezas de atención | 6 |
| Épocas | 30 |
| Batch size | 128 |
| Learning rate | 5e-4 |
| EMA | no (sin exponential moving average) |
| Activación | tanh (según el sufijo `tanh-V` del nombre) |
| Precisión de evaluación (best) | 0,4414 (44,14 %) |

## Arquitectura y entrenamiento

La arquitectura es un vision transformer denominado bViT por el autor, con una dimensión de embedding de 462 y 6 cabezas de atención, según se deduce de la convención de nombres del repositorio. El proyecto bViT_circuit, referenciado en la model card, documenta las decisiones de diseño en los ficheros `CLAUDE.md` y `docs/code_notes/` del repositorio de GitHub, pero esos detalles no están incluidos en la información disponible, por lo que no es posible confirmar el número de capas, el tamaño de parche, el mecanismo exacto de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El entrenamiento se realizó sobre ImageNet-100 durante 30 épocas, con batch size 128 y learning rate 5e-4, sin EMA y con activación tangente hiperbólica. No se especifica en la información disponible el número total de tokens o imágenes vistas, la composición exacta del dataset más allá de la etiqueta `imagenet100`, ni si hubo fases de ajuste fino, destilación o regularización adicional. El run de entrenamiento está registrado en Weights & Biases (enlace en la sección de enlaces), lo que permite al autor auditar la curva de aprendizaje, pero esos datos no se han proporcionado aquí.

## Capacidades

- Clasificación de imágenes en 100 clases correspondientes a ImageNet-100.
- Inferencia mediante el pipeline `image-classification` de la librería transformers.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- Pesos en safetensors, lo que facilita la carga segura sin ejecución de código arbitrario.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión generativa.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica a un clasificador de imágenes).
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Prototipado de clasificadores de imagen en investigación: el modelo sirve como baseline compacto (3,06 M de parámetros) para comparar variantes de arquitectura bViT sobre ImageNet-100, gracias a su bajo coste computacional y a la reproducibilidad del experimento documentada en el repositorio del autor.
- Experimentos de ablación de hiperparámetros: al estar el nombre del repositorio codificado con dimensión, cabezas, épocas, batch, learning rate, EMA y activación, el modelo es útil como punto de comparación dentro de una matriz de experimentos del proyecto bViT_circuit.
- Docencia y aprendizaje de vision transformers: un checkpoint de 3 M de parámetros y 44,14 % de accuracy top-1 en 100 clases es manejable en entornos educativos para ilustrar el flujo completo de entrenamiento, evaluación y despliegue con transformers.
- Despliegue en entornos con recursos muy limitados: por su tamaño reducido, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación de 100 clases donde no se requiera alta precisión.
- Integración en pipelines de etiquetado automático de imágenes con un vocabulario cerrado de 100 categorías, siempre que el dominio de las imágenes se parezca al de ImageNet-100.
- Validación de infraestructura de serving: al ser compatible con endpoints y con el pipeline estándar de transformers, sirve para probar integraciones de despliegue (endpoints, contenedores) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es la precisión de evaluación del autor:

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-100 | Accuracy top-1 (best) | 0,4414 (44,14 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede compararlos con modelos de lenguaje al tratarse de un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado que el modelo tiene 3.059.926 parámetros (aproximadamente 12 MB de pesos en fp32 y unos 6 MB en fp16). No se dispone de mediciones oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o una GTX 1650 bastan para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU.
- Opciones de despliegue: pipeline `image-classification` de transformers; la etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo proyecto bViT_circuit ni sobre variantes de bViT con las que contrastar parámetros, contexto o rendimiento. Tampoco se han proporcionado resultados de otros clasificadores sobre ImageNet-100 en esta consulta.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_tanh-V | 3.059.926 | no aplica | 44,14 % top-1 en ImageNet-100 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la información disponible, por lo que el uso comercial queda sin garantías legales hasta que el autor la defina.
- Documentación mínima: la model card remite a un repositorio externo para los detalles de diseño; no se documentan sesgos, composición del dataset ni metodología de evaluación más allá del accuracy reportado.
- Rendimiento moderado: un 44,14 % de accuracy top-1 en ImageNet-100 indica que el modelo comete errores en más de la mitad de las imágenes evaluadas; no es adecuado para aplicaciones donde la precisión sea crítica.
- Dominio restringido: entrenado exclusivamente sobre ImageNet-100, por lo que su generalización a otras distribuciones de imágenes no está caracterizada.
- Riesgo de sesgo: al derivar de ImageNet, hereda los sesgos conocidos de ese dataset (desequilibrios de clase, sesgos geográficos y culturales), aunque no se documentan análisis específicos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas con alta confianza en clases visualmente similares.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe usarse para tareas de generación, razonamiento o código.
- Artefacto de investigación: cero descargas y cero likes en el momento de la consulta, sin garantías de mantenimiento ni de soporte por parte del autor.
- Reproducibilidad dependiente de recursos externos: los detalles de entrenamiento están en un run de Weights & Biases alojado en un dominio de CoreWeave y en un repositorio de GitHub, cuya disponibilidad futura no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_tanh-V
- Repositorio del proyecto bViT_circuit: https://github.com/otia-0430/bViT_circuit
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/5431pe21
