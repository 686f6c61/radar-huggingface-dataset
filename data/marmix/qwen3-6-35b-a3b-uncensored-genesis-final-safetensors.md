# MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors

## Resumen

MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors es un modelo publicado en Hugging Face por el usuario MarMix bajo licencia Apache-2.0. Por el identificador se deduce que se trata de un ajuste ("fine-tune") de la familia Qwen3.6 en su variante de arquitectura MoE (Mixture of Experts), con un total de parametros del orden de 35 000 millones y aproximadamente 3000 millones de parametros activos por token (sufijo "A3B"). El sufijo "Uncensored" indica que se ha reducido o eliminado el alineamiento de seguridad del modelo original, y "Genesis" parece ser la denominacion interna de la serie de variantes publicadas por este autor.

El modelo se distribuye en formato safetensors, lo que lo hace apto para pipelines de inferencia con librerias como Transformers, vLLM o TGI. La model card publicada es practicamente vacia: unicamente declara la licencia Apache-2.0, sin descripcion, sin datos de entrenamiento, sin idiomas soportados y sin resultados de evaluacion. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y fue creado el 2 de octubre de 2026.

Su relevancia practica es limitada y condicionada: puede resultar interesante para quienes quieran experimentar con decodificacion sin filtros de seguridad sobre una arquitectura MoE eficiente en coste de inferencia, pero la ausencia total de documentacion tecnica, de benchmarks y de trazabilidad sobre el dataset de ajuste impide recomendarlo para entornos de produccion sin una evaluacion previa por parte del equipo que lo vaya a integrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el identificador sugiere transformer con Mixture of Experts (MoE) |
| Parametros totales | no disponible; el identificador "35B" sugiere ~35 000 millones |
| Parametros activos | no disponible; el identificador "A3B" sugiere ~3000 millones activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio (safetensors en precision original); existen variantes GGUF y NVFP4 del mismo autor en otros repositorios |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura en la model card del repositorio. Por la nomenclatura del identificador ("35B-A3B") y por la existencia de variantes del mismo autor etiquetadas como GGUF y NVFP4, todo apunta a un transformer con capas MoE en el que solo se activa una fraccion pequena de los expertos por token, un diseno habitual en la familia Qwen3. Esta configuracion reduce el coste computacional de la generacion (los FLOPs por token dependen de los parametros activos) manteniendo la capacidad de representacion de un modelo mucho mayor, aunque mantiene el coste de memoria en el rango de los parametros totales.

Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o cualquier otra forma de alineamiento, ni que tecnica se empleo para el ajuste "uncensored" (por ejemplo, fine-tuning sobre datos sin filtrado, abliteration de direcciones de rechazo, o una combinacion). No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Toda la informacion relativa a arquitectura y entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto en lenguaje natural: presumiblemente heredada del modelo base Qwen3.6, aunque no se documenta ninguna capacidad concreta.
- Razonamiento y matematicas: esperable en la familia Qwen3, sin confirmacion en este repositorio.
- Generacion de codigo: no documentada.
- Tool calling / function calling: no documentado.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara ninguna lista de idiomas.
- Modo "thinking" o razonamiento extendido: no documentado.
- Vision o audio: no documentado; el pipeline del repositorio figura como no disponible.
- Reduccion de rechazos y de respuestas evasivas: implicita en la etiqueta "Uncensored", sin detalles sobre el metodo ni sobre que comportamientos se han visto afectados.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar que comportamientos cambian al eliminar el alineamiento de seguridad de un modelo base, comparando respuestas frente al Qwen3.6 original en un mismo conjunto de prompts.
- Analisis de sesgos y de contenido sensible en corpus: util para generar respuestas sin filtrado que despues se analizan con clasificadores externos, en un entorno controlado y aislado.
- Generacion creativa sin restricciones de estilo: escritura de ficcion, guiones o dialogos con tematicas adultas o conflictivas donde un modelo fuertemente alineado suele producir respuestas evasivas.
- Red teaming de aplicaciones propias: simular un atacante que intenta obtener contenido no permitido para comprobar si las capas de moderacion propias (guardrails, filtros de salida) funcionan correctamente.
- Experimentacion con arquitecturas MoE en hardware de gama alta: al tener del orden de 3000 millones de parametros activos, es un candidato razonable para medir latencias y throughput reales de una MoE grande en GPUs de 24 GB o mas con cuantizacion.
- Fine-tuning posterior sobre dominio propio: la licencia Apache-2.0 y el formato safetensors facilitan reentrenar o adaptar el modelo con LoRA sobre un corpus especializado.
- Evaluacion comparativa de tecnicas de cuantizacion: la existencia de variantes GGUF y NVFP4 del mismo autor permite medir la degradacion de calidad entre precision completa y cuantizaciones de 4 bits.
- Base para despliegue local en estaciones de trabajo: con cuantizacion Q4 el modelo puede caber en una GPU de 24 GB, lo que permite ejecutarlo sin conexion y sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano total de parametros sugerido por el identificador (~35 000 millones) y de los formatos de cuantizacion habituales; no estan confirmadas por el autor.

- Precision completa (BF16/FP16): aproximadamente 70 GB solo de pesos, mas cache KV. Requiere GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPUs.
- Cuantizacion de 8 bits: aproximadamente 35-38 GB. Cabe en A100 40 GB o H100 80 GB; en consumer requiere dos GPUs de 24 GB.
- Cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 20-22 GB. Cabe en una RTX 3090 o RTX 4090 de 24 GB, con margen ajustado para el contexto.
- Cuantizacion de 3 bits: aproximadamente 16-18 GB. Cabe con holgura en GPU consumer de 24 GB e incluso en tarjetas de 16 GB con contexto reducido.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision alta y servicio concurrente; RTX 4090, RTX 3090 o RTX 5090 para uso local con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI y Hugging Face Transformers para los pesos safetensors; llama.cpp, Ollama y LM Studio para las variantes GGUF publicadas por el mismo autor; TensorRT-LLM o vLLM con soporte NVFP4 para las variantes cuantizadas en formato NVFP4 sobre GPUs Blackwell.
- Latencia y throughput: no disponibles. Cabe esperar una generacion rapida en tokens por segundo por tratarse de una MoE con pocos parametros activos, pero el throughput agregado en servicio estara limitado por el ancho de banda de memoria necesario para recorrer los pesos de todos los expertos.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables dentro de la informacion proporcionada. La tabla siguiente recoge la referencia mas proxima por nomenclatura y marca explicitamente el estado de cada dato.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors | no disponible (~35B segun el identificador) | no disponible (~3B segun el identificador) | no disponible | Apache-2.0 | safetensors en Hugging Face |
| Qwen3-30B-A3B (familia de referencia publica) | 30 500 millones (dato publico no verificado en esta busqueda) | 3300 millones (dato publico no verificado en esta busqueda) | 128 000 tokens (dato publico no verificado en esta busqueda) | Apache-2.0 | pesos abiertos |
| Otras variantes "Uncensored Genesis" del autor (27B, NVFP4, GGUF) | no disponible | no disponible | no disponible | no disponible | repositorios GGUF y NVFP4 en Hugging Face |

Se recomienda verificar cualquier dato de la fila de la familia Qwen3 contra la documentacion oficial antes de usarlo en una decision tecnica. No se dispone de comparativas de rendimiento (MMLU, HumanEval, GSM8K u otras) para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, ni descripcion del dataset de ajuste, ni informacion sobre el proceso de entrenamiento, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion: al no haber evaluaciones publicadas, no es posible cuantificar la fiabilidad factual de las respuestas.
- Comportamiento "uncensored" no especificado: se desconoce que tipo de contenido se ha desbloqueado y en que medida, lo que implica un riesgo alto de generar material ofensivo, ilegal o danino si se despliega sin capas de moderacion.
- Sin filtros de seguridad en produccion: cualquier uso en una aplicacion de cara al publico exige anadir moderacion de entrada y de salida propias; el modelo no las incorpora.
- Idiomas y contexto no declarados: no se puede asumir soporte multilingue ni una ventana de contexto concreta sin pruebas empiricas.
- Cero adopcion verificable: cero descargas y cero "likes" en el momento de la consulta, sin issues ni discusiones que permitan contrastar su calidad.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime de las obligaciones legales aplicables (por ejemplo, normativa sobre contenidos ilicitos, proteccion de datos o derechos de autor sobre el material generado).
- Fecha de publicacion futura respecto a la mayoria de referencias tecnicas disponibles, lo que dificulta encontrar evaluaciones independientes.
- La existencia de variantes GGUF y NVFP4 en repositorios separados implica que la calidad puede diferir entre formatos; conviene validar cada cuantizacion por separado.
- Trazabilidad del ajuste inexistente: no se puede confirmar si el modelo base es realmente Qwen3.6 ni que revision concreta se utilizo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors
- Listado de modelos compatibles con GGUF en Hugging Face (donde aparecen variantes del autor): https://huggingface.co/models?library=gguf&sort=trending&search=NVFP4
- Variante citada en la busqueda, del mismo autor: https://huggingface.co/MarMix/Qwen3.6-27B-Uncensored-Genesis-NVFP4-Blackwell-GGUF (no verificada)
- Variante citada en la busqueda, de otro autor: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF (no verificada)
- Paper, blog o repositorio oficial del modelo: no disponible
