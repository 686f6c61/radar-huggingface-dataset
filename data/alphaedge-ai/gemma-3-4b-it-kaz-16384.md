# alphaedge-ai/gemma-3-4b-it-kaz-16384

## Resumen

gemma-3-4b-it-kaz-16384 es una variante "trimmed" (podada en vocabulario) de google/gemma-3-4b-it, publicada por alphaedge-ai y especializada en kazajo. El modelo conserva la arquitectura y los pesos del Gemma 3 original de Google, pero reduce el vocabulario del tokenizador de 262.144 a 16.384 tokens mediante la técnica de trimming descrita en el blog de Hugging Face. El resultado es una reduccion del 93,75% en el tamano del vocabulario y del 14,63% en el numero total de parametros (de 4.300.079.472 a 3.670.770.032).

El objetivo es abaratar el despliegue en kazajo: al eliminar los tokens practicamente inexistentes en ese idioma, el modelo ocupa menos memoria (repo de 7,3 GB en safetensors) y reduce el coste de la capa de embeddings y de la cabeza de salida, manteniendo un comportamiento esperado similar al original dentro del idioma objetivo. Es relevante para equipos que necesitan un modelo conversacional multimodal pequeno y desplegable en infraestructura modesta para una sola lengua de bajos recursos.

La contrapartida es clara: al recortar el vocabulario se eliminan tokens de otras lenguas, por lo que el rendimiento fuera del kazajo puede degradarse de forma notable. La model card no aporta resultados de benchmarks, por lo que la evaluacion cuantitativa de esa degradacion queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), derivada por trimming de vocabulario |
| Parametros totales | 3.670.770.032 (original: 4.300.079.472) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el sufijo "16384" del nombre corresponde al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors con `torch_dtype="auto"` |
| Idiomas soportados | kk (kazajo) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder-only de la familia Gemma 3 con capacidades de image-text-to-text (segun los tags del repo). Sobre esa base no se reentrena el modelo: se aplica trimming, una tecnica que reduce el vocabulario del tokenizador a los tokens relevantes para un idioma o conjunto de idiomas y recorta en consecuencia las matrices de embeddings de entrada y la cabeza de salida, ajustando el numero de parametros. En este caso el vocabulario pasa de 262.144 a 16.384 tokens.

La seleccion de tokens se hizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming, orientado al kazajo. La model card no detalla el numero de tokens de entrenamiento original de Gemma 3, ni si hubo RLHF/DPO en esta variante (no lo hay: es una poda post-hoc, no un fine-tuning), ni innovaciones adicionales mas alla del propio trimming. El autor indica que el modelo podado deberia comportarse de forma similar al original con solo 16.384 tokens y una huella de memoria mucho menor.

## Capacidades

- Generacion de texto conversacional en kazajo, con plantilla de chat (`apply_chat_template`).
- Capacidades multimodales heredadas del Gemma 3 base (image-text-to-text segun los tags del repo), aunque la model card no las documenta en detalle para esta variante.
- Razonamiento y generacion de codigo y matematicas heredados del modelo base, con la salvedad de que el vocabulario reducido puede afectar a tokens no kazajos.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas practicamente al kazajo; el autor advierte explicitamente de que puede no funcionar bien en otras lenguas.
- Capacidad especial: reduccion de vocabulario orientada a eficiencia en memoria para una sola lengua.

## Casos de uso

- Asistentes conversacionales en kazajo: el modelo puede gestionar dialogos multi-turno mediante la plantilla de chat de Gemma 3, con un footprint de 7,3 GB en safetensors que facilita su despliegue en una unica GPU.
- Atencion al cliente en kazajo: al estar podado el vocabulario a los tokens frecuentes de ese idioma, se reducen los embeddings y la cabeza de salida, lo que abarata servir peticiones en un idioma de bajos recursos sin pagar por un vocabulario multilingue infrautilizado.
- Procesamiento de documentacion administrativa o legal kazaja: generacion de resumenes y respuestas sobre textos en kazajo, aprovechando que el vocabulario retenido procede de minado sobre corpus fineweb-2 en ese idioma.
- Despliegue en hardware modesto o en el borde: con 3,67 mil millones de parametros y pesos safetensors, es candidato para inferencia en GPUs de consumo y para entornos con presupuesto de memoria ajustado.
- Educacion y tutoria en kazajo: generacion de explicaciones y material didactico en kazajo con un modelo mas ligero que el Gemma 3 original.
- Investigacion sobre trimming: sirve como caso de estudio reproducible para medir la perdida de calidad al recortar vocabulario, comparandolo contra google/gemma-3-4b-it en tareas kazajas y no kazajas.
- Prototipado rapido en TGI: los tags incluyen text-generation-inference y endpoints_compatible, lo que facilita levantarlo como endpoint compatible con la API de TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta estadisticas de tamano (vocabulario y parametros) y no incluye MMLU, HumanEval, GSM8K ni evaluaciones en kazajo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB, mas overhead.
- GPU recomendadas: A100, H100 o L40S para produccion; RTX 4090, RTX 3090 o A10G para desarrollo y cargas moderadas.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo segun la model card), text-generation-inference (tag explicito), y en principio vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque la informacion proporcionada no confirma artefactos GGUF publicados.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-kaz-16384 | 3.670.770.032 | 16.384 | kk | Gemma Terms of Use | Poda de vocabulario para kazajo; sin benchmarks publicados |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | multilingue | Gemma Terms of Use | Modelo base; referencia de calidad y cobertura idiomatica |
| Otras variantes trimmed de Gemma 3 | no disponible | no disponible | segun idioma | Gemma Terms of Use | La informacion proporcionada no detalla alternativas comparables |

## Limitaciones y advertencias

- Rendimiento degradado fuera del kazajo: el autor advierte de que el modelo puede no funcionar bien en otras lenguas porque se eliminaron los tokens no frecuentes en el idioma seleccionado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad respecto al Gemma 3 original, ni en kazajo ni en otras tareas.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica para esta variante.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del corpus de minado (fineweb-2).
- Licencia: sujeta a los Gemma Terms of Use; el uso comercial debe verificarse contra esos terminos. El autor declara no estar afiliado ni respaldado por Google.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; no debe confundirse el "16384" del nombre con la ventana de contexto.
- Madurez: 8 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- Uso multimodal: aunque los tags indican image-text-to-text, la model card no documenta el pipeline de vision para esta variante; conviene validarlo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-kaz-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
