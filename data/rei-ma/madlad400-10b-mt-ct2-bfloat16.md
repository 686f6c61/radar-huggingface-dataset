# rei-ma/madlad400-10b-mt-ct2-bfloat16

## Resumen

madlad400-10b-mt-ct2-bfloat16 es una conversion al formato CTranslate2 del modelo de traduccion automatica multilingue google/madlad400-10b-mt, publicado por el usuario rei-ma. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Google, pero reempaquetados en un binario `model.bin` de aproximadamente 21 GB con precision bfloat16, junto con la configuracion de runtime y el vocabulario compartido que espera CTranslate2.

El modelo subyacente, MADLAD-400-10B-MT, es un transformer encoder-decoder de la familia T5 entrenado por Google Research sobre 250 000 millones de tokens y con cobertura declarada de mas de 400 idiomas. Su relevancia radica en que combina una cobertura linguistica muy amplia con un tamano de 10 000 millones de parametros, algo poco habitual en traduccion automatica open source, donde la mayoria de alternativas de calidad se mueven en el rango de 600 M a 3 B.

La aportacion concreta de este repositorio es practica: permite servir el modelo con CTranslate2, un runtime de inferencia optimizado para CPU y GPU que aplica cuantizacion y fusion de operadores, en lugar de depender de PyTorch o de los frameworks habituales de Hugging Face. El repositorio es de reciente creacion y tiene un uso muy bajo (21 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como un artefacto de conveniencia mas que como una distribucion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (modelo base: google/madlad400-10b-mt) |
| Parametros totales | 10 000 millones (10B), segun el nombre y el modelo base |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat16 (unica variante publicada en este repo); CTranslate2 soporta otras cuantizaciones, pero no se distribuyen aqui |
| Idiomas soportados | multilingue; el modelo base declara mas de 400 idiomas |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | CTranslate2 (`model.bin`); tokenizer en SentencePiece/T5 (`spiece.model`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con la topologia T5, adaptado por Google para traduccion multilingue. Segun la model card del repositorio, se entreno sobre 250 000 millones de tokens procedentes de MADLAD-400, un corpus multilingue auditado y a nivel de documento descrito en el paper arXiv:2309.04662. El modelo cubre mas de 400 idiomas y esta disenado para traduccion supervisada en pares de idiomas, incluyendo combinaciones de bajos recursos.

Esta publicacion concreta no anade entrenamiento ni ajuste alguno: es una conversion de formato. El autor transforma los pesos originales a bfloat16 y los empaqueta para CTranslate2, que aplica optimizaciones de inferencia como la fusion de operadores y la ejecucion en precision reducida. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre la composicion exacta del dataset mas alla de la cifra de tokens y la referencia al paper.

## Capacidades

- Traduccion automatica multilingue en mas de 400 idiomas, incluyendo pares de bajos recursos.
- Traduccion a nivel de documento, segun la descripcion del dataset MADLAD-400 en el paper de referencia.
- Ejecucion en precision bfloat16 mediante CTranslate2, con soporte de inferencia en CPU y GPU.
- Pipeline de Hugging Face declarado como `translation`.
- Tokenizacion SentencePiece/T5 incluida en el repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica a gran escala: el modelo puede procesar lotes de documentos en cientos de idiomas con un unico checkpoint, lo que simplifica pipelines que antes requerian un modelo por par de idiomas.
- Localizacion de productos y sitios web: al cubrir mas de 400 idiomas, permite mantener un unico motor de traduccion para mercados con idiomas minoritarios donde no existen modelos dedicados de calidad.
- Traduccion de contenido de usuario en plataformas: el formato CTranslate2 reduce el coste de servir el modelo respecto a PyTorch, lo que lo hace viable para traducir comentarios, resenas o mensajes en tiempo casi real.
- Investigacion en linguistica computacional: sirve como linea base multilingue de 10B parametros para comparar con modelos mas pequenos o con enfoques especificos por familia de idiomas.
- Traduccion de corpus para entrenamiento de otros modelos: permite generar pares paralelos sinteticos en idiomas con pocos recursos, usando la cobertura amplia del modelo base.
- Despliegue en infraestructura con CPU: CTranslate2 esta optimizado para CPU, de modo que el modelo puede servirse en servidores sin GPU dedicada, a costa de mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la model card original de google/madlad400-10b-mt para los detalles de evaluacion, pero no reproduce cifras.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 21 GB, por lo que la inferencia en GPU requiere al menos 24 GB de VRAM para el modelo, mas margen para el KV cache y el tokenizer.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090) para cargas ligeras.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 con 24 GB, aunque con poco margen para lotes grandes o contextos largos. No cabe en GPUs de 16 GB o menos en bfloat16.
- Despliegue: CTranslate2 es el runtime objetivo de este repositorio. Tambien puede ejecutarse el modelo original con vLLM, TGI o transformers, pero esta publicacion concreta esta pensada para CTranslate2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| madlad400-10b-mt-ct2-bfloat16 (este repo) | 10B | mas de 400 | no disponible | Apache 2.0 | CTranslate2 bfloat16 |
| google/madlad400-10b-mt | 10B | mas de 400 | no disponible | Apache 2.0 | safetensors (Hugging Face) |
| google/madlad400-3b-mt | 3B | mas de 400 | no disponible | Apache 2.0 | safetensors (Hugging Face) |
| NLLB-200 (200 idiomas) | hasta 54B en la variante mayor | 200 | no disponible | CC-BY-NC en varias variantes | safetensors |

La comparacion mas directa es con el modelo original de Google: misma arquitectura, mismos pesos y misma licencia, con la diferencia de formato y precision. Frente a madlad400-3b-mt, este modelo ofrece mas capacidad a cambio de un coste de inferencia considerablemente mayor. Frente a NLLB-200, la ventaja es la cobertura de mas de 400 idiomas y una licencia Apache 2.0 mas permisiva en las variantes de MADLAD, aunque no se dispone de datos de benchmarks en esta informacion para comparar calidad.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo validado de forma independiente: el autor no documenta pruebas de equivalencia numerica frente al modelo original.
- El repositorio tiene un uso muy bajo (21 descargas, 0 likes) y fue creado recientemente, por lo que no hay evidencia de comunidad sobre su correcto funcionamiento.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar los terminos del modelo original y del dataset MADLAD-400 antes de un uso comercial.
- Riesgo de alucinacion y de traducciones incorrectas en idiomas de bajos recursos, inherente al modelo base; no se documentan evaluaciones especificas en esta publicacion.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar el troceado de documentos largos con precision.
- El formato CTranslate2 limita la portabilidad: no es directamente cargable con transformers ni con la mayoria de herramientas del ecosistema Hugging Face sin conversion.
- El peso de 21 GB en bfloat16 excluye el despliegue en GPUs de consumo con menos de 24 GB de VRAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rei-ma/madlad400-10b-mt-ct2-bfloat16
- Modelo base: https://huggingface.co/google/madlad400-10b-mt
- Paper MADLAD-400: https://arxiv.org/abs/2309.04662
- CTranslate2: https://github.com/OpenNMT/CTranslate2
