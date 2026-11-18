# alphaedge-ai/gemma-3-4b-it-lao-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-lao-16384` es una variante "trimmed" (recortada) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicada por el usuario alphaedge-ai. La modificacion consiste en reducir el vocabulario del tokenizador de 262.144 a 16.384 tokens, conservando unicamente los tokens relevantes para el idioma lao, lo que reduce el numero de parametros totales de 4.300.079.472 a 3.670.770.032 (un 14,63 % menos) y el peso del repositorio a 7,3 GB.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3, con capacidades de texto e imagen (pipeline `image-text-to-text` en los tags, aunque el pipeline declarado es `text-generation`). Al eliminar el vocabulario multilingue original, el modelo pierde competencia en practicamente cualquier idioma distinto del lao, por lo que su utilidad queda restringida a aplicaciones en ese idioma.

Es relevante para desarrolladores que necesiten desplegar un modelo Gemma 3 pequeno en entornos con memoria limitada y cuyo trafico sea exclusivamente en lao: el recorte de vocabulario reduce el tamano de la matriz de embeddings y de la cabeza de salida, que en el modelo original suponen una fraccion significativa de los parametros de un modelo de 4B. La licencia es la Gemma Terms of Use, no una licencia open source permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal texto-imagen segun tags |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el sufijo "16384" del nombre hace referencia al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en el tipo original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | lao (`lo`) |
| Licencia | Gemma Terms of Use (tag `license:gemma`) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-4b-it` es un transformer decoder-only de la familia Gemma 3, descrito en el informe tecnico arXiv:2503.19786. La variante aqui descrita no ha sido reentrenada: se ha obtenido mediante la tecnica de *trimming* documentada por Loïck Bourdois y colaboradores en el blog de Hugging Face, que consiste en seleccionar un subconjunto del vocabulario y recortar las filas correspondientes de la matriz de embeddings de entrada y de la proyeccion de salida, ajustando despues el tokenizador.

La seleccion de tokens se realizo minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para el idioma lao, conservando los 16.384 tokens mas frecuentes y relevantes. El resultado es una reduccion del 93,75 % del vocabulario y del 14,63 % de los parametros totales. No se indica en la informacion disponible si hubo una fase de recuperacion (fine-tuning) posterior al recorte ni cuantos tokens se usaron en tal caso; el autor afirma que el modelo "deberia comportarse de forma similar al original" en lao.

## Capacidades

- Generacion de texto conversacional en lao, con plantilla de chat aplicada via `apply_chat_template`.
- Hereda del modelo base las capacidades multimodales texto-imagen (tags `image-text-to-text`), si bien el pipeline declarado es `text-generation`.
- Razonamiento, codigo y matematicas: tecnicamente presentes en los pesos del modelo base, pero degradados por la eliminacion de tokens no lao del vocabulario.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: practicamente nulas fuera del lao; el propio autor advierte que "puede no funcionar bien para otros idiomas".
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Atencion al cliente en lao: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat de Gemma 3, con un footprint de memoria un 14,63 % inferior al modelo original, lo que abarata el despliegue en instancias pequenas.
- Traduccion y redaccion de contenido en lao: generacion de resumenes, articulos o respuestas a partir de prompts en lao, aprovechando que el vocabulario conservado cubre los tokens mas frecuentes del idioma.
- Procesamiento de documentos lao con componente visual: al heredar la naturaleza multimodal del base, puede emplearse para tareas de image-text-to-text (descripcion de imagenes, extraccion de texto en capturas) siempre que la salida sea en lao.
- Despliegue en el borde o en hardware con VRAM limitada: al reducir el repositorio a 7,3 GB en safetensors, es viable servirlo en GPUs de consumo con cuantizacion adicional (aunque el autor no publica variantes GGUF).
- Prototipado rapido de asistentes conversacionales en lao: con `transformers` y `device_map="auto"` se puede levantar un endpoint compatible con text-generation-inference segun los tags del repo.
- Investigacion sobre trimming de vocabularios: sirve como referencia reproducible para estudiar el impacto del recorte de vocabulario en un modelo multimodal de 4B, comparandolo con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en safetensors a bf16/fp16, aproximadamente 7,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 10-12 GB para contexto moderado.
- GPU recomendadas: A100 40 GB, H100, L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en bf16.
- GPU de consumo: cabe en RTX 4090/3090 en bf16; en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) requeriria cuantizacion a 8 bits o inferior, no publicada por el autor.
- Opciones de despliegue: `transformers` (soporte nativo, ejemplo incluido en la model card), text-generation-inference (tag `text-generation-inference`), y en principio vLLM/llama.cpp/Ollama si se generan artefactos compatibles, aunque no se documentan en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-lao-16384 | 3.670.770.032 | 16.384 | lao | Gemma Terms of Use | Hugging Face |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | multilingue | Gemma Terms of Use | Hugging Face |
| Otras variantes trimmed de Gemma 3 4B (p. ej. para otros idiomas del mismo pipeline de trimming) | ~3,6-3,7 B | 16.384 | idioma objetivo | Gemma Terms of Use | Hugging Face |
| Modelos multilingues de ~4B de otras familias (p. ej. Qwen o Llama) | ~4 B | variable | multilingue | variable | Hugging Face |

La comparacion directa mas informativa es contra el modelo base: misma arquitectura y mismos datos de entrenamiento originales, con un 14,63 % menos de parametros y una perdida total de cobertura fuera del lao.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no lao: cualquier prompt o salida en otro idioma producira tokenizacion ineficiente o incorrecta.
- Riesgo de alucinacion inherente al modelo base, no mitigado por el trimming; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; los sesgos del modelo base se heredan sin cambios.
- Licencia Gemma Terms of Use: no es una licencia open source permisiva; impone restricciones de uso comercial y de redistribucion que deben revisarse antes de producción.
- El autor declara explicitamente que el modelo "no esta afiliado ni respaldado por Google".
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ) ni benchmarks, por lo que el rendimiento real en lao no esta verificado de forma independiente.
- El repositorio tiene un volumen de descargas muy bajo (7) y ninguna valoracion, lo que limita la evidencia de uso en produccion.
- El pipeline declarado (`text-generation`) no coincide con todos los tags (`image-text-to-text`); conviene validar el soporte multimodal antes de disenar una aplicacion que dependa de el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-lao-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
