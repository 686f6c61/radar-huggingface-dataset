# fassabilf/sd15-dpo-us-even

## Resumen

sd15-dpo-us-even es un ajuste fino del U-Net de Stable Diffusion 1.5 entrenado con Diffusion-DPO (Direct Preference Optimization aplicado a modelos de difusión) por el usuario fassabilf. El modelo parte de `stable-diffusion-v1-5/stable-diffusion-v1-5` y se entrena sobre pares de preferencia construidos a partir de 280 fotografías reales de Pexels de temática estadounidense, con 1400 pares de entrenamiento y 420 de validación extraídos del dataset `fassabilf/ift-train-us-real` (carpeta `dpo_even/`). Se publican 20 checkpoints (ep1 a ep20) correspondientes a 20 épocas con semilla 0.

El objetivo declarado no es la calidad estética ni el rendimiento general, sino el estudio de la distribución de género por ocupación. Los pares de preferencia se construyen con un pool "even": la imagen elegida (`chosen`) es femenina exactamente en la mitad de los pares de cada ocupación (`p_female_target = 0,5`) y la rechazada (`rejected`) es la fotografía del pool invertido con la misma leyenda. Cada fotografía actúa como elegida 5 veces y como rechazada 5 veces con leyendas distintas, lo que da 1400 pares de entrenamiento y 420 de validación a partir de 280 imágenes únicas por split.

Es relevante como artefacto metodológico, no como modelo de producción: con `p = 0,5` en todas las ocupaciones, el óptimo de la pérdida DPO para el ratio de género es `d* = logit(0,5)/beta = 0`, es decir, la política óptima coincide con la referencia. El techo de precisión implícita es 0,5 exacto, de modo que una precisión implícita de entrenamiento superior a 0,5 indica memorización de pares (leyenda, foto) y no aprendizaje de la distribución. La model card indica explícitamente que las cifras de test y el ΔMAE emparejado frente al modelo base están en `analysis/REPORT.md` y que la tarjeta no reclama ningún resultado antes de que ese informe exista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusión latente (latent diffusion) heredado de Stable Diffusion 1.5; se entrena y publica únicamente el U-Net |
| Parametros totales | No disponible en la model card. El U-Net de SD 1.5 tiene aproximadamente 860 M de parámetros (dato de conocimiento general del modelo base, no verificado en la información proporcionada) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card. El codificador de texto CLIP de SD 1.5 admite 77 tokens de prompt |
| Tipos de cuantizacion | No disponible. Los pesos se publican en safetensors; no se documentan variantes GGUF, NF4 ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible en la model card. El codificador de texto CLIP de SD 1.5 está entrenado en inglés y el dataset de preferencias es de fotografías y leyendas de EE. UU. |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (checkpoints ep1 a ep20; el script `scripts/ift/ckpt_to_pipeline.py` sugiere un flujo de conversión desde checkpoint) |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Componentes incluidos | Solo el U-Net. VAE, text encoder y tokenizer son idénticos a SD 1.5 base y no se suben |
| Dataset de preferencias | fassabilf/ift-train-us-real, carpeta `dpo_even/` (280 fotos únicas por split, 1400 pares train / 420 val) |
| Tamano del repositorio | 36,1 GB |
| Libreria | diffusers |

Hiperparámetros de entrenamiento declarados en la model card:

| Parametro | Valor |
|---|---|
| Perdida | Diffusion-DPO sobre pares de preferencia (no MSE de imagen única) |
| beta_dpo | 5000 (valor por defecto del articulo) |
| Batch | 4 pares x acumulacion 8 |
| Learning rate | 1e-5 |
| Epocas | 20 (44 pasos por epoca) |
| Semilla | 0 |
| U-Net de referencia | SD 1.5 base, no el checkpoint SFT |
| Pool de pares | Even: p_female_target = 0,5 en todas las ocupaciones |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un modelo de difusión latente que opera en el espacio latente de un VAE y que se condiciona mediante un codificador de texto CLIP ViT-L/14 con prompts de hasta 77 tokens. El repositorio contiene exclusivamente los pesos del U-Net; para reconstruir la pipeline hay que montar el U-Net publicado sobre `stable-diffusion-v1-5/stable-diffusion-v1-5`, que aporta el VAE, el text encoder y el tokenizer. La resolución nativa del modelo base es 512 x 512 píxeles.

El entrenamiento aplica Diffusion-DPO en lugar de una pérdida de reconstrucción: el modelo se optimiza sobre pares (chosen, rejected) con `beta_dpo = 5000`, batch de 4 pares con acumulación de 8 pasos, learning rate 1e-5 y 20 épocas de 44 pasos cada una. El U-Net de referencia es SD 1.5 base, no un checkpoint previo de instruction fine-tuning. La innovación metodológica destacable es la construcción del pool even: se fuerza una proporción objetivo de 0,5 de imágenes femeninas en cada ocupación, cada fotografía se reutiliza 5 veces como elegida y 5 como rechazada con leyendas diferentes, y la fotografía rechazada es la versión invertida del mismo pool con la leyenda idéntica. Esta construcción tiene una consecuencia matemática explícita: el óptimo de la pérdida DPO con proporción objetivo 0,5 es `d* = 0`, de forma que la política óptima es indistinguible de la referencia y el techo de precisión implícita es 0,5.

## Capacidades

- Generación de imágenes texto-a-imagen en el dominio de fotografías realistas de personas en contextos ocupacionales, sobre la base de SD 1.5.
- Condicionamiento por prompt de texto en inglés (codificador CLIP heredado del modelo base, sin modificar).
- Reparto de género calibrado hacia una proporción objetivo de 0,5 por ocupación en el pool de entrenamiento (propiedad del dataset de preferencias, supeditada a los resultados de `analysis/REPORT.md`).
- Evaluación de sesgo de género: el modelo está pensado como artefacto de medida, con la métrica MAE_even (distancia media a 0,5) y la comparación emparejada frente a SD 1.5 base.
- Publicación de 20 checkpoints intermedios, lo que permite estudiar la evolución de la métrica a lo largo del entrenamiento.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo thinking, visión de entrada, audio ni capacidades multilingües.
- No se documenta ningún tipo de post-entrenamiento adicional (RLHF, DPO textual, ajuste por instrucciones sobre el text encoder).

## Casos de uso

- Investigación sobre sesgo de género en modelos generativos: el modelo sirve como brazo experimental "even" para medir si un ajuste Diffusion-DPO con proporción objetivo 0,5 desplaza la distribución de género por ocupación respecto a SD 1.5 base, usando MAE_even como métrica principal.
- Auditoría de fairness en pipelines de generación de imágenes: se puede integrar el U-Net como variante de control dentro de un banco de pruebas que compare varias políticas (base, IFT, DPO) sobre el mismo conjunto de prompts ocupacionales.
- Reproducción de experimentos de Diffusion-DPO: los 20 checkpoints publicados y los hiperparámetros explícitos (`beta_dpo = 5000`, lr 1e-5, 20 épocas, semilla 0) permiten replicar la curva de entrenamiento y comprobar el efecto del techo teórico de precisión implícita en 0,5.
- Generación de material visual sintético para estudios de representación ocupacional en EE. UU.: ilustraciones de 512 x 512 con prompts en inglés sobre profesiones, útiles como material de estímulo en estudios perceptivos o como datos sintéticos de baja resolución.
- Docencia y divulgación sobre alineación con preferencias: el caso ilustra de forma cuantificable el problema de definir el objetivo de preferencia cuando la política óptima coincide con la referencia, algo difícil de mostrar con modelos de producción.
- Prototipado de bajo coste en investigación académica: al ser un U-Net de SD 1.5, se puede ejecutar y ajustar en una GPU de consumo, lo que permite iterar sobre variantes del pool de preferencias sin clúster dedicado.
- Pruebas de regresión en herramientas de despliegue de difusión: sirve como checkpoint no estándar (solo U-Net) para validar scripts de montaje de pipeline, conversión de formato y carga en interfaces como Diffusers, ComfyUI o AUTOMATIC1111.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de test, las barras de error, el suelo de MAE y el ΔMAE emparejado frente a SD 1.5 base están en `analysis/REPORT.md`, y que la tarjeta no reclama ningún resultado antes de la publicación de ese informe.

Métricas definidas por el autor (sin valores publicados en la información disponible):

| Metrica | Definicion | Resultado publicado |
|---|---|---|
| MAE_even | Distancia media de la proporcion de genero por ocupacion al valor 0,5 | No disponible (remite a `analysis/REPORT.md`) |
| Precision implicita | Precision del clasificador implicito de la perdida DPO sobre pares | No disponible; techo teorico 0,5 exacto |
| ΔMAE emparejado vs base SD 1.5 | Diferencia de MAE_even contra el modelo base, medida por pares | No disponible (remite a `analysis/REPORT.md`) |
| MMLU, HumanEval, GSM8K y similares | No aplicables: es un modelo de difusion de imagenes | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el U-Net de SD 1.5 en fp16 ocupa aproximadamente 1,7 GB; la pipeline completa en fp16 (U-Net + VAE + text encoder) se sitúa en torno a 2-4 GB de VRAM a 512 x 512. En fp32 la cifra se duplica aproximadamente. Estas cifras son estimaciones basadas en el modelo base, no en mediciones publicadas para este checkpoint.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM en fp16 para 512 x 512. Para entrenamiento o fine-tuning adicional sobre el pool de preferencias, se recomienda 16-24 GB (RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 e incluso en tarjetas de 6-8 GB aplicando fp16 y atención eficiente.
- Opciones de despliegue: Diffusers (carga del U-Net sobre `stable-diffusion-v1-5/stable-diffusion-v1-5`), AUTOMATIC1111, ComfyUI, Optimum/ONNX Runtime y TensorRT. Para vLLM, llama.cpp, Ollama o TGI no aplica: son motores para modelos de lenguaje, no para difusión.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo por imagen ni de imágenes por segundo.
- Almacenamiento: el repositorio ocupa 36,1 GB por los 20 checkpoints del U-Net; para inferencia basta con descargar un único checkpoint de los 20.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la informacion proporcionada. La tabla siguiente recoge únicamente características estructurales; las filas marcadas con (*) proceden de conocimiento general de los modelos base y no han sido verificadas en esta búsqueda.

| Modelo | Parametros | Contexto de texto | Resolucion nativa | Licencia | Enfoque |
|---|---|---|---|---|---|
| sd15-dpo-us-even (este) | U-Net de SD 1.5 (~860 M*) | 77 tokens (CLIP) | 512 x 512 | creativeml-openrail-m | Investigacion de sesgo de genero con Diffusion-DPO |
| stable-diffusion-v1-5 (base) | U-Net ~860 M*, pipeline ~1,06 B* | 77 tokens (CLIP) | 512 x 512 | creativeml-openrail-m | Generacion texto-a-imagen de proposito general |
| Otros brazos del mismo proyecto (IFT even, DPO de otros paises) | No disponible | No disponible | No disponible | No disponible | Controles experimentales del mismo estudio |
| SDXL base 1.0 | U-Net en torno a 2,6 B*, pipeline ~3,5 B* | 77 tokens | 1024 x 1024 | creativeml-openrail-m | Generacion de mayor resolucion y calidad |

## Limitaciones y advertencias

- La propia model card declara que se trata de un artefacto de investigación sobre sesgo de distribución de género, no de un modelo de producción.
- Con `p_female_target = 0,5` en todas las ocupaciones, el óptimo de la pérdida DPO es `d* = 0`, por lo que la política óptima coincide con el U-Net de referencia. Una precisión implícita de entrenamiento superior a 0,5 es señal de memorización de pares (leyenda, foto) y no de aprendizaje de la distribución.
- El techo de precisión implícita es 0,5 exacto, lo que limita por diseño cualquier mejora medible con esa métrica.
- Sesgo del conjunto de datos: 280 fotografías reales de Pexels de temática estadounidense, con la composición de ocupaciones y la estética que impone esa fuente. No se documenta cobertura de otros países, culturas ni idiomas.
- Riesgo de alucinación visual y de artefactos propios de SD 1.5 a 512 x 512: anatomías incorrectas, texto ilegible en la imagen y detalles incoherentes, sin que la model card documente mitigaciones.
- Idiomas: no se documenta soporte multilingüe; el codificador CLIP del modelo base está entrenado en inglés y las leyendas del dataset son estadounidenses.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones de uso (no se puede emplear para contenido ilegal, dañino, desinformación ni suplantación, entre otros supuestos) y obliga a propagar esas restricciones a los usuarios finales. Conviene revisar el texto completo de la licencia antes de un uso en producto.
- El repositorio contiene únicamente el U-Net: es necesario descargar aparte el VAE, el text encoder y el tokenizer de `stable-diffusion-v1-5/stable-diffusion-v1-5` y montar la pipeline con el script indicado; una carga directa del repositorio como pipeline de Diffusers fallará.
- El repositorio ocupa 36,1 GB y contiene 20 checkpoints sin una recomendación explícita de cuál usar en inferencia.
- No hay resultados de benchmarks ni métricas de evaluación publicados en la información disponible; cualquier afirmación de rendimiento o de reducción de sesgo queda pendiente de `analysis/REPORT.md`.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sd15-dpo-us-even
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de preferencias citado en la model card: repo `fassabilf/ift-train-us-real`, carpeta `dpo_even/` (referenciado por el autor; no verificado en esta busqueda)
- Script de montaje de pipeline citado en la model card: `scripts/ift/ckpt_to_pipeline.py` del repositorio de código del autor (ruta indicada por el autor; no verificado en esta busqueda)
- Ficheros de configuración y evaluación citados: `hparams.yml`, `analysis/REPORT.md`, `analysis/` (referenciados por el autor; no verificados en esta busqueda)
- La busqueda web realizada no devolvio enlaces relevantes para este modelo: los resultados obtenidos corresponden a Google Maps y Google Earth y no guardan relacion con la ficha.
