# lz7fdmu/RoSeDiT

## Resumen

RoSeDiT (Role-Separated Diffusion Transformers) es una familia de modelos de difusión de tipo transformer para generación de imágenes condicionada por clase, desarrollada por Zhiguang Liu e Yi Shang (University of Missouri). El modelo se publica como checkpoints de PyTorch entrenados sobre ImageNet-1k a resolución 256x256 en el espacio latente del VAE de Stable Diffusion, y su interés radica en una innovación arquitectónica concreta: aislar la regla global (la condición de clase) del procesamiento de los tokens de imagen mediante doce tokens controladores que mantienen una representación evolutiva del condicionamiento global.

La arquitectura introduce tres mecanismos: un conjunto de tokens controladores que codifican la condición global, un mecanismo de escucha que permite a adaLN calcular su modulación a partir de esos estados, y una pasada estructural que restringe cada token de imagen a su vecindad 3x3 más los tokens controladores. RoSeDiT mantiene el mismo número de parámetros que SiT reutilizando los pesos de atención densa. Además, el trabajo propone Deterministic Sampling Manifold Compression (DSMC), un esquema de entrenamiento en dos etapas para el entrenamiento continuado de modelos de difusión.

La familia cubre cinco escalas (S/2, B/2, L/2 y XL/2 en varias duraciones de entrenamiento), desde 33,0M hasta 675,3M de parámetros. El checkpoint más avanzado, RoSeDiT-XL/2 + DSMC a 2,4M de pasos, alcanza un FID de 5,84 en la suite de evaluación ADM con 50.000 muestras, sin classifier-free guidance y con muestreador Euler-Maruyama SDE de 250 pasos. La licencia es MIT, lo que facilita su uso comercial y su reutilización en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con tokens controladores y atención estructural; basada en SiT con pesos de atención densa reutilizados |
| Parametros totales | 33,0M (S/2), 130,6M (B/2), 458,2M (L/2), 675,3M (XL/2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generación de imágenes 256x256 en espacio latente) |
| Tipos de cuantizacion | No disponible (checkpoints en punto flotante PyTorch) |
| Idiomas soportados | No disponible (modelo de generación de imágenes, sin interfaz de texto libre) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), diccionario con pesos EMA bajo la clave `ema` y ajustes bajo `config` |

## Arquitectura y entrenamiento

RoSeDiT es un diffusion transformer que modifica el esquema estándar de DiT/SiT. Doce tokens controladores mantienen una representación del condicionamiento global (la clase de ImageNet), un mecanismo de escucha permite que adaLN calcule su modulación a partir del estado de esos tokens, y una pasada estructural restringe la atención de cada token de imagen a su vecindad 3x3 y a los tokens controladores. El recuento de parámetros se mantiene igual que en SiT porque se reutilizan los pesos de atención densa. La variante XL/2 incorpora normalización RMS de queries y keys en la atención (`--qk-norm`).

El entrenamiento se realiza sobre ImageNet-1k a 256x256 en el espacio latente del VAE de Stable Diffusion, con checkpoints a 400K, 1,4M y 2,4M de pasos. La propuesta DSMC (Deterministic Sampling Manifold Compression) es un esquema de dos etapas para el entrenamiento continuado de modelos de difusión; aplicado a RoSeDiT-XL/2 a 2,4M de pasos reduce el FID de 7,61 a 5,84. También se publica una variante de RoSeDiT-B/2 con REPA (proyector de 7,3M de parámetros adicionales, FID 21,01 a 400K pasos). No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de ImageNet-1k.

## Capacidades

- Generación de imágenes condicionada por clase (ImageNet-1k, 1000 clases) a resolución 256x256 en espacio latente.
- Muestreo determinista mediante sampler Euler-Maruyama SDE con 250 pasos y sin classifier-free guidance (cfg-scale=1.0).
- Soporte de muestreo con distintas escalas de modelo (S, B, L, XL) y distintos presupuestos de entrenamiento.
- Integración con REPA para mejorar la eficiencia de entrenamiento (variante B/2 con proyector).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imágenes.
- No dispone de capacidades multilingües ni de procesamiento de texto libre; la condición es una etiqueta de clase.
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Investigación en arquitecturas de difusión: RoSeDiT sirve como banco de pruebas para estudiar el aislamiento de la condición global frente a los tokens de imagen, comparando con SiT y DiT bajo el mismo recuento de parámetros.
- Evaluación comparativa de generadores condicionados por clase: los checkpoints a 400K, 1,4M y 2,4M pasos permiten trazar curvas de escalado de FID y analizar el efecto de DSMC en el entrenamiento continuado.
- Generación de datos sintéticos etiquetados para ImageNet: el modelo puede producir lotes de 50.000 muestras con clases conocidas, útiles para aumentar datasets de clasificación o para estudiar sesgos de los clasificadores.
- Reproducción de resultados académicos: la disponibilidad de los archivos de 50.000 muestras (FID 7,98 y 5,84) y de los checksums MD5 permite verificar la reproducibilidad de la suite ADM.
- Estudio de compresión de la variedad de muestreo: DSMC se puede aplicar sobre otros modelos de difusión preentrenados para analizar si la segunda etapa de entrenamiento reduce el FID sin cambiar la arquitectura.
- Desarrollo de pipelines de generación en espacio latente: al operar sobre el VAE de Stable Diffusion, los latentes generados se pueden decodificar con herramientas del ecosistema SD para tareas de aumento de datos o visualización.
- Base para experimentos de atención estructural: la restricción a vecindad 3x3 más tokens controladores se puede trasladar a otros transformers de difusión para estudiar eficiencia y calidad.

## Benchmarks y rendimiento

Resultados de FID sobre 50.000 muestras de los pesos EMA, sampler Euler-Maruyama SDE de 250 pasos, sin classifier-free guidance, suite de evaluación ADM, ImageNet 256x256:

| Modelo | Pasos | FID | Parametros |
|---|---|---|---|
| RoSeDiT-S/2 | 400K | 51,42 | 33,0M |
| RoSeDiT-B/2 | 400K | 27,18 | 130,6M |
| RoSeDiT-L/2 | 400K | 15,34 | 458,2M |
| RoSeDiT-XL/2 | 400K | 12,63 | 675,3M |
| RoSeDiT-XL/2 | 1,4M | 7,98 | 675,3M |
| RoSeDiT-XL/2 | 2,4M | 7,61 | 675,3M |
| RoSeDiT-XL/2 + DSMC | 2,4M | 5,84 | 675,3M |
| RoSeDiT-B/2 + REPA | 400K | 21,01 | 130,6M + 7,3M proyector |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los checkpoints ocupan entre 0,12 GB (S/2) y 2,52 GB (XL/2) en disco; la inferencia en fp32 requiere aproximadamente el doble del tamaño del checkpoint en memoria, más el VAE de Stable Diffusion para decodificar los latentes.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para las variantes S/2 y B/2; 16 GB o más para L/2 y XL/2 en fp32. Una RTX 4090 (24 GB) o A100/H100 permiten lotes mayores y generación de 50.000 muestras en tiempos razonables.
- Cabe en GPU de consumo: sí, las variantes S/2 y B/2 en GPUs de 8-12 GB; XL/2 requiere al menos 16 GB para inferencia cómoda.
- Opciones de despliegue: el repositorio oficial usa `torchrun` con `generate.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imágenes).
- Latencia y throughput: no disponibles en la información proporcionada; el script oficial usa `--per-proc-batch-size=64` y `--num-steps=250` para la generación de 50.000 muestras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | FID (ImageNet 256) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoSeDiT-XL/2 + DSMC | 675,3M | 256x256 latente | 5,84 | MIT | Hugging Face (lz7fdmu/RoSeDiT) |
| RoSeDiT-XL/2 | 675,3M | 256x256 latente | 7,61 | MIT | Hugging Face (lz7fdmu/RoSeDiT) |
| SiT-XL/2 | No disponible en la información | 256x256 latente | No disponible en la información | No disponible en la información | No disponible en la información |
| DiT-XL/2 | No disponible en la información | 256x256 latente | No disponible en la información | No disponible en la información | No disponible en la información |

La model card indica que RoSeDiT mantiene el mismo recuento de parámetros que SiT, pero no se proporcionan cifras de FID de SiT ni de DiT en la información disponible para una comparación numérica directa.

## Limitaciones y advertencias

- Modelo exclusivamente de generación de imágenes condicionada por clase: no procesa texto libre ni mantiene conversaciones, por lo que no es adecuado para tareas de NLP.
- Entrenado únicamente sobre ImageNet-1k: las 1000 clases limitan el dominio de generación y pueden inducir sesgos propios del dataset (representación desigual de categorías, sesgos de género y etnia en clases de personas).
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes plausibles pero incorrectas respecto a la clase solicitada, especialmente en clases poco representadas.
- Los checkpoints no incluyen estado del optimizador: no permiten reanudar entrenamiento, solo muestreo.
- La variante XL/2 requiere `--qk-norm` para cargarse correctamente; omitir el flag provoca errores de carga.
- El FID se ha calculado sin classifier-free guidance y con un sampler concreto (Euler-Maruyama SDE, 250 pasos); otros ajustes de muestreo pueden alterar la calidad.
- No se documentan límites de contexto, idiomas ni cuantizaciones, lo que dificulta su integración en pipelines de producción estándar de LLM.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el VAE de Stable Diffusion subyacente puede tener sus propias condiciones de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/lz7fdmu/RoSeDiT
- Paper (arXiv): https://arxiv.org/abs/2611.19009
- Código: https://github.com/lz7fd/RoSeDiT
- Muestras generadas: https://huggingface.co/datasets/lz7fdmu/RoSeDiT_samples
- REPA (base del código): https://github.com/sihyun-yu/REPA
