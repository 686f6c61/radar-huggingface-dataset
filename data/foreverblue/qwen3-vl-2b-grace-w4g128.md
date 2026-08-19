# ForeverBlue/Qwen3-VL-2B-GRACE-W4G128

## Resumen

El modelo `ForeverBlue/Qwen3-VL-2B-GRACE-W4G128` es un checkpoint de investigacion desarrollado por el equipo de Yanlong Chen, Amirhossein Habibian, Luca Benini y Yawei Li, asociado al articulo aceptado en ICML 2026 "Gated Relational Alignment via Confidence-based Distillation for Efficient VLMs". Se trata de un modelo de vision-lenguaje (VLM) de 2.438 millones de parametros, basado en `Qwen/Qwen3-VL-2B-Instruct`, que aplica la tecnica de destilacion GRACE junto con entrenamiento consciente de cuantizacion (QAT) para alcanzar una precision INT4 por grupos de 128 (W4G128).

El problema que resuelve es el despliegue eficiente de modelos multimodales en entornos con recursos limitados, manteniendo un rendimiento cercano al de un profesor de 8B. Segun los datos publicados, el estudiante de 2B supera al modelo base Qwen3-VL-2B en 9,4 puntos de media en siete benchmarks multimodales, e iguala o supera ligeramente al profesor de 8B (76,7 frente a 76,3) con aproximadamente una cuarta parte de los parametros. La version W4G128 conserva el 98% de la media del checkpoint BF16.

Es importante destacar que este repositorio contiene el checkpoint de investigacion QAT: sus tensores BF16 estan situados sobre la rejilla INT4 aprendida, pero la carga estandar con Transformers no proporciona ahorro de memoria ni aceleracion de kernels INT4. Para despliegue real, el autor remite al checkpoint empaquetado `Qwen3-VL-2B-GRACE-W4G128-AWQ`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, image-text-to-text) |
| Parametros totales | 2.438.696.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (W4G128) mediante QAT; el checkpoint publicado contiene tensores BF16 sobre rejilla INT4 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3-VL-2B-Instruct, un modelo de lenguaje multimodal de tipo transformer que procesa entradas de texto e imagen. Sobre esta base se aplica el metodo GRACE (Gated Relational Alignment via Confidence-based Distillation), una tecnica de destilacion de conocimiento que alinea las representaciones relacionales del modelo estudiante (2B) con las del profesor (Qwen3-VL-8B) utilizando puertas (gates) y confianza en la destilacion.

El entrenamiento se realizo con datos de instruccion multimodal de tipo ShareGPT4V (`Lin-Chen/ShareGPT4V`), siguiendo un pipeline de ajuste fino por instrucciones y evaluacion estilo LLaVA. Ademas, se incorpora entrenamiento consciente de cuantizacion (QAT) con cuantizacion INT4 por grupos de 128 (W4G128), lo que permite que los pesos aprendan a adaptarse a la rejilla de cuantizacion durante el entrenamiento, reduciendo la perdida de precision frente a tecnicas de cuantizacion post-entrenamiento (PTQ) como AWQ o GPTQ.

## Capacidades

- Generacion de texto e imagen a texto: responde a preguntas sobre imagenes, describe contenido visual y razona sobre escenas multimodales.
- Razonamiento multimodal: evaluado en benchmarks como MMMU, ScienceQA, AI2D y MMStar, que requieren comprension visual y razonamiento logico.
- Reduccion de alucinaciones: el benchmark HallB muestra una mejora significativa frente al modelo base (65,4 frente a 51,4), lo que indica menor tendencia a inventar contenido no presente en la imagen.
- Capacidades multilingues: soporta ingles y chino, segun la informacion del repositorio.
- Eficiencia computacional: al ser un modelo de 2B con cuantizacion INT4 (en su version AWQ de despliegue), esta disenado para inferencia eficiente en hardware con recursos limitados.
- No se especifica soporte explicito para tool calling o function calling en la informacion proporcionada, aunque hereda las capacidades del modelo base Qwen3-VL-2B-Instruct.

## Casos de uso

- Investigacion sobre despliegue de VLM de baja precision: el checkpoint permite estudiar el impacto de la cuantizacion INT4 con QAT en modelos multimodales, comparando con FP16, INT8, PTQ, AWQ y GPTQ.
- Analisis de destilacion de conocimiento multimodal: util para investigar como la destilacion basada en confianza (GRACE) transfiere capacidades de un profesor de 8B a un estudiante de 2B.
- Experimentos de inferencia multimodal eficiente: con la version AWQ enlazada, se puede desplegar en entornos edge o con GPUs de consumo para tareas de clasificacion y respuesta visual.
- Evaluacion comparativa de metodos de compresion: sirve como punto de referencia para comparar QAT frente a tecnicas de cuantizacion post-entrenamiento en tareas como MMBench, SEED y MMStar.
- Prototipado de asistentes visuales ligeros: dado su tamano reducido, puede integrarse en aplicaciones de descripcion de imagenes o respuesta a preguntas visuales en dispositivos con memoria limitada.
- Reproduccion de experimentos academicos: al publicarse junto con el codigo y el articulo, permite replicar los resultados del paper ICML 2026 y extenderlos a otros backbones.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card, comparando el modelo con el profesor (8B), el baseline (2B) y las variantes cuantizadas del mismo estudiante.

| Modelo | Params | Precision | HallB | MMBench | ScienceQA | AI2D | MMMU | SEED | MMStar | Avg |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B (profesor, ref.) | 8B | BF16 | 61,1 | 84,5 | 85,0 | 85,7 | 69,6 | 77,5 | 70,9 | 76,3 |
| Qwen3-VL-2B (baseline) | 2B | BF16 | 51,4 | 78,4 | 81,4 | 76,9 | 53,4 | 71,2 | 58,3 | 67,3 |
| Qwen3-VL-2B-GRACE | 2B | BF16 | 66,9 | 86,4 | 86,2 | 81,3 | 72,1 | 76,7 | 67,3 | 76,7 |
| Qwen3-VL-2B-GRACE (W8G128) | 2B | INT8 | 66,1 | 85,5 | 85,3 | 80,4 | 71,3 | 75,9 | 66,5 | 75,9 |
| Qwen3-VL-2B-GRACE (W4G128) | 2B | INT4 | 65,4 | 84,6 | 84,3 | 79,5 | 70,5 | 75,1 | 65,8 | 75,0 |

Segun la model card, GRACE eleva el baseline de 2B en +9,4 puntos de media y la version W4G128 conserva el 98% de la media del checkpoint BF16.

## Requisitos de hardware

- El checkpoint publicado (BF16 sobre rejilla INT4) ocupa aproximadamente 4,9 GB en memoria (2,4B parametros x 2 bytes), por lo que cabe en GPUs de consumo con 8-12 GB de VRAM, como RTX 3060, RTX 4060 o RTX 4070.
- Para obtener las ventajas reales de memoria y velocidad INT4, es necesario utilizar el checkpoint AWQ enlazado (`Qwen3-VL-2B-GRACE-W4G128-AWQ`), que reduce el peso a aproximadamente 1,2 GB.
- El repositorio tiene un tamano de 15,5 GB, lo que incluye posiblemente el checkpoint BF16 completo y otros artefactos.
- Opciones de despliegue: dado que usa la libreria Transformers, es compatible con vLLM, TGI y otros frameworks que soporten modelos Qwen3-VL. Para INT4 real, se recomienda el checkpoint AWQ.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Params | Precision | Contexto | Avg (7 benchmarks) | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct (baseline) | 2B | BF16 | No disponible | 67,3 | Apache 2.0 |
| Qwen3-VL-2B-GRACE-W4G128 | 2B | INT4 (QAT) | No disponible | 75,0 | Apache 2.0 |
| Qwen3-VL-8B-Instruct (profesor) | 8B | BF16 | No disponible | 76,3 | Apache 2.0 |

La comparativa muestra que el modelo GRACE de 2B supera ampliamente al baseline de 2B y se acerca al profesor de 8B, con una ventaja clara en eficiencia de parametros. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Este es un checkpoint de investigacion QAT: los tensores BF16 estan sobre la rejilla INT4, pero la carga estandar con Transformers no ofrece ahorro de memoria ni aceleracion de kernels INT4. Para produccion, usar la version AWQ.
- El modelo puede producir alucinaciones, sesgos o salidas incorrectas, y no esta disenado para aplicaciones de alto riesgo en ambitos medicos, legales, financieros o de seguridad critica.
- Solo soporta ingles y chino; no se garantiza rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que el uso previsto es exclusivamente investigador.
- No se especifica la longitud de contexto soportada, por lo que se debe validar antes de usarlo con secuencias largas.
- El rendimiento en benchmarks se basa en la evaluacion estilo LLaVA; los resultados pueden variar en otros protocolos de evaluacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W4G128
- Checkpoint AWQ para despliegue INT4: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W4G128-AWQ
- Articulo (arXiv): https://arxiv.org/abs/2601.22709
- DOI: https://doi.org/10.48550/arXiv.2601.22709
- Codigo (GitHub): https://github.com/ForeverBlue816/GRACE
- Demo (GRACE-VLM Space): https://huggingface.co/spaces/ForeverBlue/GRACE-VLM
- Checkpoint BF16: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-BF16
- Checkpoint W8G128: https://huggingface.co/ForeverBlue/Qwen3-VL-2B-GRACE-W8G128
- Checkpoint LLaVA-1.5-7B-W4G128: https://huggingface.co/ForeverBlue/LLaVA-1.5-7B-GRACE-W4G128
