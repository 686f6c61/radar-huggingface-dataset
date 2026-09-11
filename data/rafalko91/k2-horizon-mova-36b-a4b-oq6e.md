# rafalko91/K2-Horizon-MoVA-36B-A4B-oQ6e

## Resumen

K2-Horizon-MoVA-36B-A4B-oQ6e es un checkpoint cuantizado publicado por el usuario rafalko91 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una version cuantizada de un modelo base denominado internamente k2_horizon (etiqueta de tipo de modelo presente en el repositorio), del cual no se identifica autor, procedencia ni repositorio de origen en la informacion disponible. La cuantizacion se ha realizado con la herramienta oQ, integrada en oMLX en su version v0.7.0.dev1, aplicando cuantizacion de precision mixta a 6 bits con tamano de grupo 64.

El resultado es un artefacto de aproximadamente 37.444.792.020 parametros totales (unos 37,4 mil millones), almacenado en safetensors en el formato propio de MLX, con un tamano de repositorio de 30,9 GB. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con alrededor de 4 mil millones de parametros activos por token, pero esta interpretacion no esta confirmada en ninguna parte de la model card y debe tratarse como una hipotesis basada en la convencion de nomenclatura habitual en la comunidad, no como un dato verificado.

Su relevancia actual es limitada y muy especifica: es un artefacto de cuantizacion orientado al ecosistema MLX (Apple Silicon), con cero descargas y cero interacciones en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin pipeline definido. Resulta util unicamente para quien quiera evaluar el modelo base k2_horizon en hardware Apple con un peso reducido, asumiendo el riesgo de partir de un repositorio sin documentacion tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo declarado: k2_horizon; posible MoE, sin confirmar) |
| Parametros totales | 37.444.792.020 (aproximadamente 37,4 mil millones) |
| Parametros activos | no disponible (el sufijo A4B sugiere unos 4 mil millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, cuantizacion de precision mixta con oQ (oMLX v0.7.0.dev1); unico formato publicado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. La etiqueta de tipo de modelo declarada en el repositorio es k2_horizon, y entre las etiquetas figura custom_code, lo que indica que la carga requiere codigo personalizado del repositorio (habitualmente mediante el mecanismo de confianza remota de la libreria de turno). El nombre del checkpoint apunta a una posible arquitectura MoE con 36 mil millones de parametros nominales y 4 mil millones activos, pero no hay model card, configuracion publicada ni documentacion que lo confirme.

Tampoco hay informacion sobre el entrenamiento: se desconoce el volumen de tokens, la composicion del dataset, si hubo fases de ajuste fino supervisado, RLHF o DPO, y si existen innovaciones tecnicas destacables. Lo unico documentado es el proceso de posprocesado: una cuantizacion de precision mixta a 6 bits con tamano de grupo 64, aplicada con la herramienta oQ de oMLX v0.7.0.dev1 sobre el modelo original, dando como resultado pesos en safetensors para MLX.

## Capacidades

- Generacion de texto: no documentada en la informacion disponible.
- Razonamiento y matematicas: no documentado.
- Generacion de codigo: no documentada.
- Vision o audio: no documentado; no hay ninguna referencia a modalidades no textuales.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara ningun idioma.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Carga con codigo personalizado: confirmada por la etiqueta custom_code, lo que implica la necesidad de ejecutar codigo del repositorio durante la carga.

En resumen, la model card publicada describe exclusivamente el proceso de cuantizacion (tipo de modelo, bits, tamano de grupo y formato) y no enumera ninguna capacidad funcional del modelo.

## Casos de uso

Dado que no hay informacion verificable sobre capacidades, contexto ni licencia, los casos de uso solo pueden plantearse como escenarios de evaluacion, nunca como despliegues en produccion sin una validacion previa.

- Evaluacion comparativa del modelo base: usar este checkpoint para medir la degradacion introducida por la cuantizacion a 6 bits respecto al modelo k2_horizon sin cuantizar, ejecutando el mismo conjunto de prompts en ambos y comparando perplejidad y calidad de salida.
- Inferencia local en Apple Silicon: desplegar el modelo en un Mac con memoria unificada suficiente mediante mlx-lm para tareas de generacion de texto offline, aprovechando que el formato de pesos es nativo del framework y evita conversiones.
- Servidor de inferencia interno: exponer el modelo con el servidor compatible con la API de OpenAI de mlx-lm dentro de una red privada, para prototipar aplicaciones que consuman un endpoint local.
- Pruebas de viabilidad de MoE en hardware de consumo: si se confirma la naturaleza MoE con pocos parametros activos, este checkpoint permitiria estudiar la relacion entre ancho de banda de memoria y velocidad de decodificacion en equipos de sobremesa.
- Investigacion sobre cuantizacion mixta: el artefacto sirve como muestra para analizar como se comporta la asignacion de bits por capa que aplica oQ con group size 64 en un modelo de este tamano.
- Reproduccion del pipeline de cuantizacion: sirve para verificar que la receta de oMLX v0.7.0.dev1 descrita en la model card se reproduce de forma consistente en un modelo de 37 mil millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base k2_horizon. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- Tamano de los pesos: 30,9 GB en el repositorio, correspondientes a los pesos cuantizados a 6 bits (group size 64).
- VRAM o memoria unificada estimada: al menos unos 32 GB solo para los pesos, mas el espacio de la cache KV y los buffers de activaciones; en la practica se recomienda un minimo de 40-48 GB de memoria utilizable para evitar swapping.
- Apple Silicon: es la plataforma objetivo. Equipos viables serian los que igualan o superan los 48 GB de memoria unificada, como Mac Studio con M2 Ultra (64, 128 o 192 GB), M3 Ultra o MacBook Pro con M4 Max en configuraciones de 48, 64 o 128 GB.
- GPU de consumo: no es una ruta directa. El formato es MLX, propio de Apple, por lo que no se puede cargar en CUDA sin una conversion previa a otro formato. Una RTX 4090 con 24 GB de VRAM no aloja el total de parametros en 6 bits.
- GPU de datacenter: no aplicable sin conversion de formato; en caso de convertirse a safetensors estandar, un modelo de 37 mil millones de parametros a 6 bits requeriria del orden de 31 GB de VRAM, lo que encaja en A100 40 GB, L40S 48 GB o H100 80 GB, pero esta ruta no esta documentada por el autor.
- Opciones de despliegue: mlx-lm y el servidor HTTP compatible con la API de OpenAI incluido en mlx-lm, junto con la propia herramienta oMLX. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en su formato actual.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre k2_horizon (arquitectura, contexto, licencia, datos de entrenamiento) para establecer una comparacion rigurosa. La tabla siguiente contrasta unicamente los datos verificables de este artefacto con modelos MoE abiertos de orden de magnitud parecido, usando cifras de documentacion publica de esos terceros modelos; no implica equivalencia funcional.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato publicado |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-oQ6e | 37,4 mil millones | no disponible (aprox. 4 mil millones segun nomenclatura, sin confirmar) | no disponible | no disponible | MLX safetensors 6 bits |
| Qwen3-30B-A3B | 30,5 mil millones | 3,3 mil millones | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors, GGUF, MLX |
| Mixtral 8x7B | 46,7 mil millones | 12,9 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27 mil millones (denso) | no aplica | 128.000 tokens | Terminos de uso de Gemma | safetensors, GGUF |

La comparacion de rendimiento no es posible: no hay ningun benchmark publicado para el modelo de esta ficha. Ademas, los tres modelos de contraste cuentan con model cards detalladas, licencia explicita y pipelines declarados, condiciones que este repositorio no cumple.

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara licencia alguna, lo que en la practica impide el uso comercial con seguridad juridica y desaconseja cualquier despliegue en produccion.
- Repositorio sin documentacion: la model card se limita a describir la cuantizacion; no hay informacion sobre capacidades, idiomas, contexto ni datos de entrenamiento.
- Modelo base no identificado: no se indica de que modelo se ha partido, ni su autor, ni su repositorio, lo que impide auditar sesgos, procedencia de los datos o restricciones heredadas.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni evaluaciones publicadas, no hay ninguna medida de fiabilidad factual.
- Sesgos conocidos: no disponible; no hay evaluaciones de sesgo ni informacion sobre la composicion del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la longitud de contexto y los idiomas cubiertos.
- Degradacion por cuantizacion: el checkpoint esta cuantizado a 6 bits con group size 64, de modo que existe una perdida de calidad respecto al modelo original que no ha sido cuantificada en la informacion disponible.
- Ejecucion de codigo personalizado: la etiqueta custom_code implica que la carga del modelo ejecuta codigo del repositorio. Conviene revisar ese codigo antes de ejecutarlo en cualquier entorno.
- Validacion previa obligatoria: antes de considerar este artefacto para cualquier uso real, es necesario localizar el modelo base, verificar su licencia y ejecutar una bateria propia de evaluaciones de calidad, seguridad y sesgo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rafalko91/K2-Horizon-MoVA-36B-A4B-oQ6e
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Modelo base k2_horizon: no disponible
- Paper o documentacion tecnica del modelo: no disponible
- Demo o espacio asociado: no disponible
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo, su autor o su arquitectura. Los unicos resultados obtenidos correspondian a sitios de contenido para adultos sin ninguna relacion con el tema, por lo que se han descartado y no se incluyen como fuentes.
