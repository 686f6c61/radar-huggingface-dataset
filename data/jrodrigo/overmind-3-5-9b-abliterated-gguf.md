# jrodrigo/Overmind-3.5-9B-Abliterated-GGUF

## Resumen

Overmind 3.5 9B Abliterated es un modelo de lenguaje de 9.000 millones de parametros derivado de Qwen 3.5 9B mediante un proceso de *abliteration* (eliminacion de la conducta de rechazo de los pesos) seguido de un ajuste fino con QLoRA orientado a generacion conversacional. Lo publica el usuario jrodrigo en Hugging Face bajo licencia Apache 2.0, con los adaptadores ya fusionados en los pesos distribuidos, de modo que puede usarse para inferencia autonoma sin cargar el modelo base por separado.

El modelo se distribuye unicamente en formato GGUF, lo que lo orienta a despliegues con llama.cpp y derivados (Ollama, LM Studio) sobre hardware modesto. Los idiomas declarados son ingles y espanol. La relevancia de esta ficha es practica: documenta un ajuste comunitario de bajo perfil (cero descargas en el momento de la consulta) cuya principal seña de identidad es la eliminacion de rechazos, con las implicaciones de seguridad y de licencia que ello conlleva.

No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, los hiperparametros de QLoRA ni resultados de evaluacion. Todo lo que sigue se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen 3.5 9B); detalles internos no disponibles |
| Parametros totales | 9.000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.5 9B, un transformer denso de aproximadamente 9.000 millones de parametros. Sobre esa base se aplica *abliteration*, una tecnica que identifica la direccion en el espacio de activaciones asociada al comportamiento de rechazo y la proyecta fuera de los pesos, de forma que el modelo deja de activar respuestas negativas ante peticiones que el modelo original rechazaria. Posteriormente se realiza un ajuste fino con QLoRA (cuantizacion de bajo rango) para recuperar calidad conversacional, y el adaptador resultante se fusiona en los pesos finales.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla del propio proceso de abliteration y del ajuste QLoRA. La model card no aporta hiperparametros, curvas de perdida ni detalles del corpus.

## Capacidades

- Generacion de texto conversacional multi-turno, objetivo declarado del ajuste.
- Respuesta a peticiones que el modelo base rechazaria, por efecto directo de la abliteration.
- Soporte de ingles y espanol como idiomas declarados.
- Capacidades heredadas de Qwen 3.5 9B (razonamiento, codigo, matematicas): no verificadas en esta distribucion y no documentadas por el autor.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion conversacional sin rechazos en entornos controlados: el modelo esta disenado para responder a peticiones que un modelo alineado rechazaria, lo que resulta util en investigacion sobre seguridad y en pruebas de robustez de filtros externos.
- Red teaming y evaluacion de alineamiento: permite generar respuestas que sirven de entrada para probar clasificadores de contenido, guardrails o sistemas de moderacion, comparando el comportamiento con el del Qwen 3.5 9B original.
- Investigacion sobre abliteration: al estar disponible en varias cuantizaciones GGUF, permite medir el impacto de la eliminacion de rechazos sobre calidad, coherencia y latencia en distintos niveles de precision.
- Despliegue local en hardware de consumo: la variante Q4_K_M (5,63 GB) cabe en GPUs consumer con 8 GB de VRAM y en equipos con llama.cpp u Ollama, lo que facilita prototipos offline.
- Generacion de texto en ingles y espanol para tareas creativas o de ficcion: el ajuste conversacional y la ausencia de rechazos lo hacen adecuado para escritura asistida donde los modelos alineados suelen ser restrictivos.
- Experimentacion academica reproducible: los cuatro formatos GGUF publicados (BF16, Q8_0, Q5_K_M y Q4_K_M) permiten comparar el mismo modelo a distintas precisiones sin depender de infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 18 GB de VRAM o memoria unificada; Q8_0 unos 9,5 GB; Q5_K_M unos 6,5 GB; Q4_K_M unos 5,6 GB (tamanos de fichero declarados en la model card).
- GPU recomendadas: para BF16, A100 40 GB, H100 o RTX 4090 (24 GB); para Q8_0, RTX 4090 o RTX 3090; para Q4_K_M, GPUs consumer de 8 GB o superiores.
- Cabe en GPU consumer: si, en las variantes Q5_K_M y Q4_K_M; Q8_0 cabe en GPUs de 12-16 GB o mas; BF16 no cabe en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Overmind 3.5 9B Abliterated | ~9B | no disponible | Apache 2.0 | GGUF | Abliterated + QLoRA sobre Qwen 3.5 9B |
| Qwen 3.5 9B (base) | ~9B | no disponible | no disponible | no disponible | Modelo original alineado, sin abliteration |
| Otros modelos abliterated indexados en abliteratedmodels.org | variable | variable | variable | variable | Indice comunitario de modelos con rechazos eliminados |

La comparacion con Qwen 3.5 9B es la mas directa: mismo tamano y misma base, pero sin la eliminacion de rechazos y presumiblemente con mejor calibracion de seguridad. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo respondera a peticiones que el Qwen 3.5 9B original rechazaria, lo que lo hace inadecuado para despliegues de cara al publico sin filtros externos.
- Riesgo elevado de contenido nocivo: la abliteration no elimina sesgos ni conocimiento peligroso, solo la conducta de rechazo; la responsabilidad de moderacion recae en el integrador.
- Sin datos de evaluacion: no hay benchmarks publicados, por lo que no puede verificarse la calidad ni la degradacion respecto al modelo base.
- Contexto desconocido: la longitud de contexto no esta declarada; no debe asumirse la del Qwen 3.5 9B sin verificacion.
- Cobertura linguistica limitada: solo se declaran ingles y espanol; el rendimiento en otros idiomas no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de atribucion del modelo base Qwen 3.5 9B que se declaran retenidos en la distribucion.
- Madurez del proyecto: cero descargas y un unico like en el momento de la consulta; no hay evidencia de validacion comunitaria ni de mantenimiento continuado.
- Formato exclusivamente GGUF: no se distribuyen pesos safetensors ni adaptadores separados, lo que limita el reentrenamiento o la fusion posterior.

## Enlaces

- Hugging Face: https://huggingface.co/jrodrigo/Overmind-3.5-9B-Abliterated-GGUF
- Modelo base Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Indice de modelos abliterated: https://www.abliteratedmodels.org/
- Biblioteca de modelos Overmind: https://www.overmindlab.ai/models
