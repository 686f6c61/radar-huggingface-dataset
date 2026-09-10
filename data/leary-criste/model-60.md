# leary-criste/model-60

## Resumen

`leary-criste/model-60` es un modelo con pesos publicados en HuggingFace por el usuario leary-criste. El repositorio contiene 35.951.822.704 parámetros (aproximadamente 36.000 millones) en formato safetensors, con un tamano total de 71,9 GB, lo que es coherente con un checkpoint almacenado en precision de 16 bits (36B x 2 bytes ≈ 72 GB). La etiqueta declarada, `qwen3_5_moe`, sugiere una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen3.5, aunque no existe documentacion que lo confirme.

La relevancia de esta ficha es limitada y hay que ser explicito al respecto: el modelo no tiene model card, no declara licencia, no declara idiomas soportados, no tiene pipeline asignado y registra 0 descargas y 1 like en el momento de la consulta. El acceso esta restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. El repositorio se creo el 10 de septiembre de 2026 y se actualizo un minuto despues, lo que apunta a una publicacion puntual sin mantenimiento posterior.

Por tanto, esta ficha debe leerse como un inventario de lo que se puede verificar en el repositorio y en los metadatos, no como una evaluacion de capacidades. La mayor parte de los apartados tecnicos quedan marcados como "no disponible" porque la informacion proporcionada no los cubre y no se ha localizado ninguna fuente adicional fiable (la busqueda web devolvio exclusivamente resultados comerciales de un proveedor de VPN, sin relacion con el modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5_moe` apunta a transformer con mezcla de expertos, sin confirmar) |
| Parametros totales | 35.951.822.704 (≈36B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors; no se anuncia GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 71,9 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. La unica pista es la etiqueta `qwen3_5_moe` del repositorio, que sugiere una implementacion de tipo Mixture of Experts asociada a la familia Qwen3.5. Si esa etiqueta es correcta, el modelo combinaria capas de atencion con capas de expertos enrutadas de forma dispersa, de manera que solo una fraccion de los parametros se activaria por token. Sin embargo, no se dispone de la cifra de parametros activos, del numero de expertos, del numero de expertos por token ni de la profundidad de la red.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizados, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y si se aplicaron tecnicas de destilacion o de decodificacion especulativa. Los metadatos no incluyen dataset asociado, ni paper, ni informe tecnico. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, atencion con ventana deslizante, enrutamiento auxiliar sin perdida, etc.) seria especulativa y no se incluye aqui.

## Capacidades

- No hay informacion verificable sobre capacidades declaradas por el autor.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible.
- Capacidades de vision o audio: no disponible (no hay etiquetas ni modulos multimodales declarados).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

Unicamente se puede confirmar que el repositorio contiene pesos en safetensors cargables, presumiblemente mediante `transformers` si el codigo del modelo esta incluido en la libreria o en el propio repositorio (este ultimo extremo tampoco esta confirmado).

## Casos de uso

No es posible recomendar casos de uso concretos con garantias para este modelo, porque se desconocen sus capacidades reales, su licencia y su calidad. Los siguientes escenarios son unicamente marcos de evaluacion para quien decida probarlo, siempre asumiendo que la licencia lo permita:

- Evaluacion comparativa interna: cargar el checkpoint en un entorno aislado y medir perplejidad y calidad de generacion frente a un modelo de referencia del mismo orden de parametros, para determinar si merece un analisis mas profundo.
- Analisis de arquitectura MoE: si la etiqueta `qwen3_5_moe` es correcta, el checkpoint puede servir para estudiar el comportamiento del enrutamiento de expertos, la distribucion de activaciones y el impacto de la dispersion en el coste de inferencia.
- Pruebas de cuantizacion: dado el tamano (36B, 71,9 GB en safetensors), es un candidato razonable para experimentar con cuantizacion a 8 y 4 bits y medir la degradacion resultante.
- Generacion de texto en lote sin requisitos de latencia: con 36B de parametros y pesos completos en memoria, encaja en escenarios offline donde el throughput importa mas que la latencia por token.
- Fine-tuning de dominio sobre una base grande: si la licencia finalmente lo permite, el checkpoint podria actuar como base para ajuste con LoRA o QLoRA en tareas verticales, aunque se desconoce si el modelo base ya esta ajustado.
- Docencia y experimentacion en infraestructura: sirve como caso practico de despliegue de un modelo de ~36B en GPUs de 80 GB, con gestion de pesos safetensors y particionado tensorial.

En todos los casos, la ausencia de licencia declarada es un bloqueo previo para cualquier uso que no sea puramente experimental y privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones derivadas unicamente del recuento de parametros (35,95B) y del tamano del repositorio (71,9 GB). No son datos oficiales y no tienen en cuenta el posible caracter MoE del modelo, que reduciria el coste de computo por token pero no el de memoria, ya que todos los expertos deben residir en memoria o en disco.

- Pesos en bf16/fp16: aproximadamente 72 GB solo para pesos, mas cache KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- Pesos en int8: aproximadamente 36 GB. Encaja en A100 40GB con poco margen, en RTX 6000 Ada 48GB o en dos GPU de 24 GB con tensor parallel.
- Pesos en int4: aproximadamente 18-20 GB. Cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto limitado por el consumo de cache KV.
- Consumer GPU: solo viable con cuantizacion de 4 bits o inferior. En bf16 no cabe en ninguna GPU de consumo actual (24 GB maximos).
- Opciones de despliegue: `transformers` en el caso mas basico; vLLM, SGLang o TGI si la arquitectura esta soportada en esas librerias (no confirmado). llama.cpp y Ollama requeririan una conversion a GGUF que el repositorio no publica.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuraciones de referencia.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable. El modelo no declara arquitectura confirmada, parametros activos, contexto ni licencia, y no hay benchmarks publicados. La unica referencia indirecta es la etiqueta `qwen3_5_moe`, que lo situaria en la categoria de modelos MoE de la familia Qwen3.5, pero no se dispone de datos de ninguno de los modelos de esa familia en la informacion proporcionada, por lo que cualquier tabla comparativa seria inventada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leary-criste/model-60 | 35,95B (activos no disponibles) | no disponible | no disponible | no disponible | gated en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea cualquier despliegue en produccion.
- Acceso restringido: el repositorio es gated, de modo que la descarga exige aceptar condiciones en HuggingFace y estar autenticado.
- Sin model card ni documentacion: no hay descripcion de arquitectura, datos de entrenamiento, hiperparametros ni procedencia de los pesos.
- Sin validacion de la comunidad: 0 descargas y 1 like en el momento de la consulta. No hay issues, discusiones ni informes de terceros.
- Riesgo de alucinacion y sesgos: desconocido, al no existir evaluaciones publicadas ni informacion sobre el dataset de entrenamiento.
- Idiomas soportados: no declarados. No se puede asumir un buen rendimiento en castellano.
- Fecha de creacion inusual (2026-09-10) y actualizacion un minuto posterior, sin cambios posteriores: patrón compatible con un experimento puntual o una subida de prueba, no con un modelo mantenido.
- Procedencia de los pesos incierta: al no haber informacion sobre el entrenamiento, no puede descartarse que sea un fine-tune no documentado de un modelo base cuya licencia imponga condiciones adicionales.
- Sin cuantizaciones publicadas: cualquier despliegue requerira convertir los pesos, con el coste y el riesgo de error que eso implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leary-criste/model-60
- Paper: no disponible.
- Repositorio de codigo: no disponible.
- Demo: no disponible.
- Blog o informe tecnico: no disponible.
- Nota sobre la busqueda web: los unicos resultados devueltos corresponden a paginas comerciales de un servicio de VPN (nordvpn.com), sin ninguna relacion con el modelo. No se ha localizado documentacion adicional, paper ni discusion tecnica sobre `leary-criste/model-60`.
