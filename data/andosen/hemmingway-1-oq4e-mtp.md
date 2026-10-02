# andosen/Hemmingway-1-oQ4e-mtp

## Resumen

Hemmingway-1-oQ4e-mtp es una version cuantizada del modelo identificado por su autor como `qwen3_5`, publicada por el usuario `andosen` en HuggingFace. Se trata de un checkpoint de aproximadamente 27.320 millones de parametros almacenado en formato MLX safetensors, cuantizado a 4 bits con tamano de grupo 64 mediante la herramienta oQ (oMLX v0.7.0) con precision mixta. El repositorio ocupa 16,3 GB, lo que es coherente con un modelo denso de ese tamano en 4 bits.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay model card descriptiva, no se declara licencia, idiomas, pipeline ni resultados de evaluacion. La fecha de creacion registrada (2026-10-01) y el hecho de que el repositorio tenga 0 descargas y 0 likes en el momento de la consulta indican que es una publicacion muy reciente y practicamente sin validacion por parte de la comunidad.

El interes tecnico principal radica en dos elementos: por un lado, la etiqueta `qwen3_5` apunta a una generacion de la familia Qwen posterior a Qwen3, de la que no hay especificaciones publicas confirmadas; por otro, el sufijo `mtp` sugiere multi-token prediction, aunque no hay documentacion que lo confirme. Todo lo relativo a arquitectura interna, datos de entrenamiento y capacidades debe tratarse como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `qwen3_5` (segun etiquetas del repositorio); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (aprox. 27,3 mil millones) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`library_name: mlx`) |

Otros datos del repositorio: tamano del repo 16,3 GB; descargas 0; likes 0; creado el 2026-10-01T22:07:37Z; actualizado el 2026-10-01T22:47:50Z.

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura del modelo base. Las etiquetas del repositorio (`qwen3_5`) apuntan a un transformer de la familia Qwen en su version 3.5, pero el autor no incluye model card tecnica, configuracion de capas, dimension de atencion, numero de cabezas ni tipo de atencion. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras optimizaciones. El sufijo `mtp` del nombre del repositorio es compatible con multi-token prediction, pero se trata de una inferencia a partir del nombre y no de un dato confirmado.

Lo unico documentado es el proceso de cuantizacion posterior: el modelo se cuantizo con oQ (oMLX v0.7.0) aplicando precision mixta a 4 bits con group size 64 y guardando los pesos en MLX safetensors. No se detalla que capas recibieron mas bits ni que criterio de asignacion de precision se siguio, algo relevante porque en cuantizacion mixta el reparto de bits por capa condiciona fuertemente la degradacion final. Tampoco hay informacion sobre el dataset de entrenamiento, numero de tokens, composicion, ni sobre fases de ajuste como SFT, RLHF o DPO.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de ~27B de la familia Qwen, pero no verificada ni documentada por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Capacidades multimodales (vision, audio): no disponible; no hay etiquetas ni documentacion que las indiquen.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Multi-token prediction: posible por el sufijo `mtp` del nombre, sin confirmar.
- Ejecucion en hardware Apple Silicon mediante MLX: confirmado por el formato de pesos y la libreria declarada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX safetensors permite cargar el modelo con mlx-lm en equipos con memoria unificada de 32 GB o superior, evitando depender de GPU dedicada. Es el caso de uso mas claramente soportado por el formato publicado.
- Prototipado offline en portatiles de gama alta: un modelo de ~27B en 4 bits ocupa unos 16 GB en disco, lo que hace viable trabajar sin conexion en un unico equipo, a costa de contextos cortos.
- Experimentacion con cuantizacion de precision mixta: el repositorio sirve como caso de estudio para comparar recetas de oQ frente a cuantizaciones uniformes del mismo modelo base, midiendo perplejidad y calidad de generacion.
- Evaluacion comparativa de la familia Qwen 3.5: util para investigadores que quieran medir el comportamiento de esta generacion frente a Qwen2.5 o Qwen3 en tareas controladas, siempre que asuman la falta de documentacion.
- Fine-tuning ligero sobre pesos cuantizados: con tecnicas tipo LoRA adaptadas a MLX se puede ajustar el modelo a dominios concretos, aunque partir de pesos ya cuantizados limita las opciones y no esta documentado por el autor.
- Generacion de texto en pipelines internos no criticos: para resumen, redaccion asistida o clasificacion de texto en entornos donde no se requiera garantia de licencia ni trazabilidad de datos.
- Base para conversion a GGUF: seria posible re-cuantizar a formatos compatibles con llama.cpp u Ollama, pero al ser una cuantizacion MLX nativa el proceso requiere partir del modelo original o deshacer la cuantizacion, con la perdida de calidad asociada.

En cualquier caso, la ausencia de licencia declarada y de benchmarks hace desaconsejable usar este checkpoint en produccion o en productos comerciales sin aclarar previamente los terminos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y la busqueda web realizada no aporta cifras atribuibles a este modelo. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 16 GB en 4 bits con group size 64, coherente con los 16,3 GB del repositorio.
- VRAM total estimada para inferencia: en torno a 18-22 GB contando cache KV y activaciones con contextos moderados; con contextos largos la cifra crece de forma proporcional a la longitud de secuencia y al numero de capas, que no esta documentado.
- GPU consumer: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) podrian alojar los pesos, pero al estar el modelo en formato MLX nativo la ejecucion en GPU NVIDIA no es directa; requeriria conversion previa.
- Apple Silicon: es la plataforma natural. Mac con memoria unificada de 32 GB (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) o superior; 24 GB puede quedarse justo segun el contexto.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB son sobredimensionadas para los pesos, pero utiles si se convierte el modelo a un runtime CUDA.
- Opciones de despliegue: `mlx-lm` y el servidor de `mlx-lm` son las vias soportadas por el formato. vLLM, TGI y Ollama no cargan safetensors MLX directamente; requeririan conversion a safetensors de PyTorch o GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto y licencia. La columna de Hemmingway-1 refleja unicamente lo que consta en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hemmingway-1-oQ4e-mtp | ~27,3B | no disponible | no disponible | MLX safetensors, 4 bits |
| Qwen2.5-32B | 32,5B | 128K tokens (configuracion base) | Apache 2.0 (segun publicacion de Qwen) | safetensors, GGUF, MLX |
| Gemma 2 27B | 27B | 8K tokens | Gemma Terms of Use | safetensors, GGUF |
| Mistral Small 24B | 24B | 32K tokens | Apache 2.0 (segun publicacion de Mistral) | safetensors, GGUF |

Las cifras de los modelos alternativos corresponden a sus publicaciones oficiales y se incluyen como referencia de categoria. No es posible establecer comparacion de calidad porque no existen evaluaciones publicadas del modelo de andosen.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial. Es un riesgo legal directo si el modelo se integra en un producto.
- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, composicion del dataset ni procesos de alineacion, lo que impide auditar sesgos o comportamiento.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de este tamano y no mitigado por ninguna salvaguarda documentada.
- Degradacion por cuantizacion: la cuantizacion a 4 bits con precision mixta introduce perdida de calidad respecto a los pesos originales; sin benchmarks no es posible cuantificar cuanto.
- Compatibilidad limitada: el formato MLX restringe el uso a entornos Apple Silicon o a procesos de conversion adicionales.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue adecuado, y el castellano no esta confirmado como idioma soportado.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- Repositorio sin validacion: 0 descargas y 0 likes implican que no hay evidencia de uso real ni de reproducibilidad por terceros.
- Origen incierto: el autor no aclara de que checkpoint exacto de `qwen3_5` parte ni si dispone de derechos para redistribuirlo.
- Posible asociacion con modelos sin censura: uno de los resultados de busqueda vincula el ecosistema de nombres similares a directorios de modelos "uncensored" o "heretic"; no es confirmacion de nada sobre este repositorio, pero conviene verificar el comportamiento del modelo antes de exponerlo a usuarios finales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andosen/Hemmingway-1-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Directorio de modelos citado en la busqueda web: https://modelheretic.com/
- Repositorio de la familia Qwen (referencia del modelo base etiquetado): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio de pruebas: no disponible
