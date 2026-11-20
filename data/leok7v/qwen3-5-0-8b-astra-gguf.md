# leok7v/Qwen3.5-0.8B-Astra-GGUF

## Resumen

Qwen3.5-0.8B-Astra-GGUF es una distribucion en formato GGUF del modelo JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit, que a su vez es una edicion de pesos (weight edit) del modelo base Qwen/Qwen3.5-0.8B de Alibaba. El repositorio lo publica el usuario leok7v y su aportacion consiste en empaquetar los pesos en cuantizaciones GGUF listas para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.). No se trata de un modelo entrenado desde cero, sino de una conversion de formato de un modelo derivado de la familia Qwen3.5.

El modelo subyacente pertenece a la familia Qwen3.5 en su variante mas pequena, con aproximadamente 0,8 mil millones de parametros, lo que lo situa en la categoria de modelos ultraligeros aptos para ejecucion en CPU y GPUs de consumo. La edicion de pesos "Astra" aplicada por JonathanColetti no viene documentada en la informacion disponible, por lo que se desconoce que modificacion concreta introduce respecto al Qwen3.5-0.8B original.

La relevancia de esta ficha es practica: ofrece dos artefactos GGUF (Q8_0 y UD-Q8_K_XL) de un modelo pequeno con licencia Apache 2.0, lo que permite desplegarlo en entornos con recursos muy limitados. Sin embargo, la ausencia de model card detallada, benchmarks y descripcion del proceso de edicion de pesos limita seriamente la evaluacion tecnica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | aproximadamente 0,8 mil millones (deducido del nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (812 MB) y UD-Q8_K_XL (1186 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-0.8B en la documentacion proporcionada: no se especifica si emplea attention lineal, atencion completa, mezcla de expertos ni ninguna otra innovacion. Tampoco se documentan los datos de entrenamiento, el numero de tokens procesados, la composicion del corpus ni si hubo fases de RLHF o DPO.

Respecto al proceso de edicion de pesos que da lugar a la variante "Astra", la model card no describe la metodologia aplicada por JonathanColetti. El termino "WeightEdit" sugiere una modificacion directa de los pesos (posiblemente merging, task arithmetic o edicion selectiva de capas), pero no hay confirmacion tecnica. La aportacion del repositorio de leok7v se limita a la conversion a GGUF en dos variantes de cuantizacion de 8 bits, una estandar (Q8_0) y otra con mezcla de tipos (UD-Q8_K_XL, presumiblemente "ultra-dynamic" de Unsloth o similar).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el modelo base lo soporte (no verificado en la informacion disponible).
- Generacion de codigo y matematicas simples: plausible por la familia Qwen, pero sin datos que lo confirmen para esta variante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan documentados en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado local en equipos sin GPU: con 812 MB en Q8_0, el modelo puede cargarse en RAM en cualquier portatil moderno mediante llama.cpp u Ollama, lo que permite experimentar con un LLM sin infraestructura dedicada.
- Generacion de texto en aplicaciones embebidas: su tamano reducido facilita la integracion en dispositivos con memoria limitada (Raspberry Pi, mini-PC) para tareas de completado y resumen de textos cortos.
- Filtrado y clasificacion de texto en pipelines: al ser un modelo pequeno, puede ejecutarse como clasificador o etiquetador de baja latencia en flujos de preprocesamiento, siempre que se valide su calidad frente al modelo base.
- Entornos de pruebas y CI: util como modelo de sustitucion en tests de integracion de aplicaciones que consumen una API compatible con OpenAI, sin coste de inferencia en la nube.
- Educacion e investigacion sobre cuantizacion: sirve para comparar el comportamiento de Q8_0 frente a UD-Q8_K_XL en terminos de calidad y consumo de memoria en un mismo modelo.
- Base para experimentos de edicion de pesos: al estar disponible el linaje (Qwen3.5-0.8B -> Astra-WeightEdit -> GGUF), puede usarse como referencia para estudiar el efecto de modificaciones de pesos sobre el comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,9 GB para Q8_0 y 1,3 GB para UD-Q8_K_XL, mas overhead del runtime (tipicamente 0,5-1 GB adicionales segun contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona tambien en CPU sin GPU.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Astra-GGUF | ~0,8B | no disponible | Apache 2.0 | GGUF | Objeto de esta ficha; edicion de pesos no documentada |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base original; referencia de comparacion |
| JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit | ~0,8B | no disponible | Apache 2.0 | safetensors (presumible) | Version pre-cuantizacion del mismo modelo |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La edicion de pesos "Astra" no esta documentada: se desconoce que comportamiento modifica respecto al Qwen3.5-0.8B original y si introduce regresiones.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, sesgos o alucinacion de esta variante concreta.
- Modelo de 0,8B parametros: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de mayor tamano; riesgo elevado de alucinacion en tareas abiertas.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue sin verificacion.
- Contexto no documentado: imposible planificar casos de uso que dependan de ventanas largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene verificar las condiciones del modelo base Qwen3.5-0.8B y del weight edit intermedio.
- No apto para produccion sin una evaluacion previa propia: la falta de model card detallada y de pruebas publicadas desaconseja su uso directo en sistemas criticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/leok7v/Qwen3.5-0.8B-Astra-GGUF
- Modelo base del GGUF (weight edit): https://huggingface.co/JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
