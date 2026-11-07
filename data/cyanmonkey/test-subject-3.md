# CyanMonkey/Test-Subject-3

## Resumen

Oleander-150M es un modelo de lenguaje de pequeno tamano (aproximadamente 150 millones de parametros) desarrollado por el usuario CyanMonkey y publicado en Hugging Face bajo el identificador CyanMonkey/Test-Subject-3. Se trata de un modelo hibrido que combina capas GDN2 (Gated Delta Net 2, segun la nomenclatura de flash-linear-attention) con atencion gated-GQA (Grouped Query Attention con compuertas). Esta publicacion corresponde al checkpoint del paso 500 de entrenamiento, lo que indica que es una version intermedia y no un modelo final convergido.

El modelo esta pensado como un experimento de arquitectura hibrida a pequena escala, orientado a investigacion sobre mecanismos de atencion lineal y recurrencia con compuertas. Su relevancia actual radica en el interes creciente por arquitecturas alternativas al transformer clasico que reduzcan el coste computacional en contextos largos, aunque en este caso concreto se trata de un artefacto de investigacion con muy poca traccion (0 descargas, 0 likes) y sin model card completa.

La informacion disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni datos de entrenamiento. Los pesos requieren un fichero de modelado especifico para cargarse con `transformers`, ya que siguen la nomenclatura del codigo de entrenamiento en lugar de una arquitectura estandar registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN2 (Gated Delta Net 2) + gated-GQA |
| Parametros totales | 149.976.139 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.6 GB |
| Paso de entrenamiento | 500 (checkpoint intermedio) |
| Tag de region | region:us |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje hibrido que alterna capas GDN2 con capas de atencion gated-GQA. GDN2 hace referencia a Gated Delta Net 2, una variante de las redes delta con compuertas implementada en la libreria flash-linear-attention, que sustituye la atencion cuadratica clasica por un mecanismo recurrente lineal con estado. Las capas gated-GQA anaden compuertas a la atencion agrupada por consultas, una tecnica habitual para reducir el coste de la cache KV manteniendo cierta capacidad de recuperacion selectiva.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El checkpoint publicado corresponde al paso 500, lo que sugiere un entrenamiento en curso o interrumpido. Los pesos conservan los nombres de parametros del codigo de entrenamiento, por lo que no son cargables directamente con una clase de `transformers` estandar: se necesita el fichero de modelado del autor.

## Capacidades

- Generacion de texto basica, condicionada por el estado de entrenamiento en el paso 500.
- Razonamiento limitado, previsiblemente degradado por el tamano (150M) y por tratarse de un checkpoint intermedio.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Capacidad destacable: uso de atencion lineal/recurrente con compuertas, potencialmente eficiente en secuencias largas si el modelado se completa.

## Casos de uso

- Investigacion en arquitecturas hibridas: el modelo sirve como banco de pruebas para comparar GDN2 con atencion clasica en tareas de modelado de lenguaje a pequena escala, permitiendo medir perplejidad y estabilidad de entrenamiento.
- Experimentos de eficiencia en contextos largos: al emplear mecanismos lineales, es adecuado para estudiar el coste de memoria y computo frente a transformers densos de tamano similar.
- Reproduccion de entrenamientos: dado que los pesos siguen la nomenclatura del codigo de entrenamiento, puede usarse para validar pipelines de flash-linear-attention y depurar cargas de checkpoints personalizados.
- Docencia y divulgacion: como ejemplo didactico de arquitectura hibrida con solo 150M de parametros, cabe en una GPU de consumo y permite trazar el flujo de activaciones paso a paso.
- Generacion de texto controlada en entornos de laboratorio: util para pruebas de decodificacion, muestreo y analisis de sesgos en modelos pequenos, sin pretension de uso en produccion.
- Base para fine-tuning experimental: al ser pequeno, permite iterar rapidamente sobre datasets especificos y evaluar si la arquitectura hibrida responde mejor que un transformer equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.6 GB para los pesos, mas overhead de activaciones y cache, tipicamente por debajo de 2 GB en total.
- VRAM estimada en fp16/bf16: alrededor de 0.3 GB de pesos, con margen para activaciones en torno a 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en GPUs de gama baja con 4 GB o mas.
- CPU: es viable la inferencia en CPU dado el tamano reducido, aunque con latencia mayor.
- Opciones de despliegue: al no existir pipeline declarado ni model card completa, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. Requiere el fichero de modelado del autor para `transformers`. La conversion a GGUF no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyanMonkey/Test-Subject-3 (Oleander-150M) | 149.976.139 | no disponible | Hibrida GDN2 + gated-GQA | no disponible | Hugging Face, 0 descargas |
| CyanMonkey/Test-S3 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~150M (p. ej. GPT-2 small, Qwen2.5-0.5B) | 124M-500M | 1024-32768 | Transformer denso | Variable (MIT, Apache-2.0) | Ampliamente disponible |

La comparativa con modelos consolidados como GPT-2 small o Qwen2.5-0.5B no es favorable en terminos de documentacion, licencia y soporte de herramientas, dado que Oleander-150M carece de model card completa y de resultados publicados.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 500): la calidad de generacion es previsiblemente baja y no representa un modelo final.
- Ausencia de licencia declarada: no se puede asumir uso comercial ni redistribucion sin aclaracion del autor.
- Sin model card completa: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones.
- Carga no estandar: requiere un fichero de modelado especifico; no funciona directamente con clases de `transformers` sin el.
- Riesgo elevado de alucinacion y de texto incoherente por el reducido numero de parametros y el estado temprano del entrenamiento.
- Sin soporte documentado de tool calling, agentes, vision o audio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de validacion externa.
- No apto para produccion en atencion al cliente, generacion de codigo ni tareas criticas sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMonkey/Test-Subject-3
- Perfil del autor en OpenModelStats: https://openmodelstats.com/owners/cyanmonkey
- Modelo relacionado en Hugging Face: https://huggingface.co/CyanMonkey/Test-S3
