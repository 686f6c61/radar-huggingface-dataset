# bcdennis/hcd-tinystories-hier-aux-l01

## Resumen

`bcdennis/hcd-tinystories-hier-aux-l01` es un modelo de lenguaje entrenado desde cero (from-scratch) sobre el dataset TinyStories. Se trata de un experimento de investigacion publicado por el usuario bcdennis en HuggingFace, sin pipeline declarado, sin licencia especificada y sin metricas de uso (0 descargas, 0 likes en el momento de la consulta). El repositorio ocupa 0,3 GB.

El modelo pertenece a una familia de ejecuciones etiquetada como "hierarchical-concept-diffusion" (HCD), y esta ficha corresponde al brazo o variante `hcd-aux`. Cuenta con 45.166.464 parametros (aproximadamente 45 millones, en la escala de los modelos pequenos de TinyStories) y fue entrenado durante 12.000 pasos con una longitud de secuencia de 256 y batch de 32, alcanzando una perdida final de validacion (LM loss) de 2,3530.

Su relevancia es acotada y de caracter experimental: sirve como punto de referencia para estudiar arquitecturas alternativas de difusion de conceptos sobre un corpus controlado como TinyStories, no como un modelo listo para produccion. No se dispone de informacion publica sobre la licencia, los idiomas declarados ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como "hierarchical-concept-diffusion" en los tags; sin detalle publico) |
| Parametros totales | 45.166.464 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 256 tokens (seq_len de entrenamiento; no se documenta ventana mayor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus de entrenamiento, TinyStories, es en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,3 GB; formato no especificado en la model card) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de los tags, que la etiquetan como "hierarchical-concept-diffusion" y "from-scratch". El brazo documentado es `hcd-aux`, con 45.166.464 parametros. No se detalla el tipo de bloque (transformer, MoE, SSM u otros), ni el mecanismo de atencion, ni si existe decodificacion especulativa u otra innovacion de inferencia. Tampoco se especifica si hubo fases de RLHF o DPO; dado el tamano y el proposito, es razonable asumir un entrenamiento puramente supervisado, pero esto no se confirma en la informacion disponible.

En cuanto al entrenamiento, los datos disponibles indican: dataset `roneneldan/TinyStories` (primeras 200.000 historias del split de entrenamiento), tokenizador GPT-2, optimizador AdamW con learning rate 0,0001, weight decay 0,1, scheduler coseno y 200 pasos de warmup. La configuracion de entrenamiento fue de 12.000 pasos con secuencia de 256 tokens y batch de 32. La perdida final de validacion reportada es de 2,3530 en la metrica de LM loss. No se especifica el numero total de tokens vistos ni la composicion exacta del subconjunto de datos.

## Capacidades

- Generacion de texto en ingles a nivel de historias cortas y simples, consistente con el corpus TinyStories.
- Modelado de lenguaje autoregresivo basico (la unica metrica reportada es LM loss, no tareas downstream).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el entrenamiento se realiza sobre un corpus en ingles.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad multimodal.
- Capacidad practica principal: servir como artefacto de investigacion para reproducir o comparar la variante `hcd-aux`.

## Casos de uso

- Investigacion sobre arquitecturas de difusion de conceptos: el modelo permite estudiar el comportamiento del brazo `hcd-aux` frente a otras variantes de la familia HCD sobre un corpus controlado, comparando la LM loss de validacion (2,3530) como metrica de referencia.
- Reproducibilidad academica: dado que se documentan hiperparametros completos (lr, weight decay, scheduler, warmup, pasos, batch, seq_len), sirve para replicar el experimento y validar la receta de entrenamiento.
- Generacion de texto para pruebas de juguete: util para verificar pipelines de inferencia en textos muy cortos (hasta 256 tokens) sin coste computacional apreciable.
- Prototipado de evaluacion de modelos pequenos: como baseline de ~45 M de parametros en el estudio de "cuanto puede aprender un modelo pequeno", siguiendo la linea del paper TinyStories.
- Docencia y formacion: ejemplo de entrenamiento from-scratch sobre un dataset abierto y pequeno, adecuado para practicas de fine-tuning y analisis de curvas de perdida.
- Benchmarking interno de infraestructura: por su tamano reducido, es util para validar herramientas de serving (vLLM, llama.cpp, etc.) antes de escalar a modelos mayores.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes ni tareas multilingues: no hay evidencia publicada de esas capacidades ni de la licencia necesaria para explotarlo comercialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada por el autor es la perdida de validacion del modelo de lenguaje:

| Metrica | Valor | Configuracion |
|---|---|---|
| Perdida final de validacion (LM loss) | 2,3530 | 12.000 pasos, seq_len 256, batch 32 |

No se dispone de comparaciones publicadas frente a otros modelos en la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada por tamano de parametros, no publicada por el autor): en FP32 unos 180 MB, en FP16/BF16 unos 90 MB y en INT8 unos 45 MB, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente (RTX 3060, RTX 4090, etc.); tambien GPU de datacenter (A100, H100) sin aprovechamiento de su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, e incluso en CPU para inferencia interactiva en textos cortos.
- Opciones de despliegue: no especificadas en la model card. Por tamano, seria viable con llama.cpp, Ollama o vLLM si el formato de pesos es compatible, pero el formato de pesos no esta documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hcd-tinystories-hier-aux-l01 | 45.166.464 | 256 | no disponible | HuggingFace (0 descargas) |
| TinyStories (Eldan y Li, 2023) | 1 M - 33 M (familia) | no disponible en esta busqueda | no disponible | Paper en arXiv 2305.07759 |
| GPT-2 small | 124 M | 1024 | MIT (segun publicacion original) | Ampliamente disponible |
| TinyStoriesv1 (reproduccion) | 10 M - 33 M (segun descripcion) | no disponible | no disponible | GitHub ihebgafsi/TinyStoriesv1 |

Los datos de la columna de modelos comparables provienen de fuentes publicas y no de la model card del modelo evaluado; la comparacion de rendimiento no es posible porque no hay benchmarks publicados para `hcd-tinystories-hier-aux-l01`.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenar sobre TinyStories (historias infantiles sinteticas en ingles), el modelo hereda el sesgo y las limitaciones estilisticas de ese corpus.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de ~45 M entrenado con LM loss, la generacion coherente esta restringida a textos muy simples y cortos.
- Limitaciones de contexto: la ventana documentada es de 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Limitaciones de idioma: el entrenamiento usa un corpus en ingles; no hay soporte multilingue declarado.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial. Se debe contactar con el autor antes de cualquier explotacion.
- Caveats para produccion: 0 descargas y 0 likes indican ausencia de validacion por la comunidad; no hay pipeline declarado, ni formato de pesos, ni informacion sobre evaluaciones. No es un artefacto apto para produccion sin una evaluacion adicional.
- Sin datos de cuantizacion ni de compatibilidad con runtimes concretos, el despliegue requeriria conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcdennis/hcd-tinystories-hier-aux-l01
- Paper TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- Reproduccion y scripts de entrenamiento TinyStoriesv1: https://github.com/ihebgafsi/TinyStoriesv1
- Busqueda de modelos TinyStories en HuggingFace: https://huggingface.co/models?search=tinystories
- Dataset TinyStories referenciado en la model card: roneneldan/TinyStories (en HuggingFace)
