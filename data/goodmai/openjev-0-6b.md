# goodmai/OpenJev-0.6B

## Resumen

OpenJev-0.6B es un modelo de lenguaje de pequeno tamano (0,6 mil millones de parametros, segun indica su nombre) publicado por el usuario goodmai en Hugging Face. El repositorio esta etiquetado con `mlx`, `basalt` y `apple-silicon`, lo que indica que los pesos estan empaquetados para su ejecucion en el framework MLX de Apple, orientado a chips de la serie M. La model card lo presenta como un "decision model" que se invoca desde la herramienta Basalt (v0.11.0) junto a un modelo mayor (`gemma-4-12B-it-qat-4bit`), lo que sugiere un uso como componente auxiliar de enrutamiento o toma de decisiones dentro de un pipeline, no como modelo conversacional principal.

El modelo deriva, segun la propia model card, del repositorio upstream `IamBusy/OpenJev-0.6B`. La informacion publicada es muy escasa: no se documentan arquitectura, datos de entrenamiento, licencia, idiomas ni resultados de benchmarks. El tamano del repositorio aparece como 0.0 GB, lo que puede indicar que los pesos no estan efectivamente alojados en el momento de la consulta o que el calculo de tamano no se ha actualizado.

Por su tamano y su empaquetado en MLX, el interes practico se limita a entornos Apple Silicon donde se quiera un modelo ligero de clasificacion o decision con baja latencia. Cualquier evaluacion seria requiere consultar el repositorio upstream y verificar la integridad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 0,6 B (inferido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors para MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna (tipo de transformer, numero de capas, dimension oculta, mecanismo de atencion) ni sobre el proceso de entrenamiento (volumen de tokens, composicion del dataset, uso de RLHF, DPO o destilacion). La unica pista tecnica es la etiqueta `basalt` y la referencia a un "decision model" dentro de la CLI de Basalt, lo que apunta a un modelo afinado para una tarea concreta de seleccion o enrutamiento, probablemente con un formato de salida restringido.

El repositorio esta empaquetado para MLX, la libreria de Apple para inferencia en Apple Silicon, lo que implica pesos convertidos y posiblemente cuantizados para ejecucion en GPU unificada de chips M. No se detalla si el modelo upstream es un transformer denso convencional ni si incorpora innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: no confirmada; la model card no describe capacidades generativas generales.
- Toma de decisiones: el uso previsto segun la model card es como `--decision-model` dentro de Basalt, es decir, seleccion o enrutamiento dentro de un pipeline.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card incluye texto en ruso pero no declara idiomas soportados.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Enrutamiento de peticiones en pipelines con Basalt: el modelo se usaria como `--decision-model` para clasificar o decidir la accion a tomar antes de invocar un modelo mayor como `gemma-4-12B-it-qat-4bit`, reduciendo coste y latencia en la fase de decision.
- Clasificacion ligera en local sobre macOS: al estar empaquetado en MLX, puede ejecutarse en un Mac con Apple Silicon sin dependencias de Python, integrado en la app o CLI de Basalt.
- Filtrado previo de consultas: por su tamano reducido, encaja como primera etapa que descarte o etiquete entradas antes de un modelo mas grande.
- Prototipado de agentes con modelo auxiliar: util para experimentar con arquitecturas de dos niveles (modelo pequeno de decision + modelo grande de generacion) en entornos de desarrollo sobre Apple Silicon.
- Pruebas de integracion de la CLI Basalt: sirve como modelo de referencia para validar el flujo `basalt serve` con modelo principal y modelo de decision.
- Evaluacion comparativa de modelos pequenos en MLX: como caso de estudio de despliegue de un modelo de 0,6 B en el stack MLX, aunque la falta de documentacion limita su valor como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 0,6 B en safetensors, una estimacion orientativa seria de aproximadamente 1,2 GB en FP16 y en torno a 0,4-0,6 GB en cuantizacion de 4-8 bits, aunque no se confirma el esquema de cuantizacion del repositorio.
- GPU recomendadas: el empaquetado esta orientado a Apple Silicon (MLX); no se documenta soporte para GPU NVIDIA.
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier Mac con chip M1 o superior gracias a la memoria unificada, pero no hay datos oficiales de consumo.
- Opciones de despliegue: MLX y la CLI/app Basalt v0.11.0 (macOS 27+, Swift 6.4). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion publicada no permite identificar con rigor modelos comparables de la misma categoria (modelos de decision de ~0,6 B empaquetados en MLX), y no se dispone de datos de rendimiento para establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay arquitectura, datos de entrenamiento, licencia ni idiomas declarados, lo que impide evaluar su idoneidad para produccion.
- Licencia no especificada: sin licencia explicita no se puede asumir permiso para uso comercial; hay que consultar el repositorio upstream `IamBusy/OpenJev-0.6B`.
- Repositorio con 0 descargas y 0 likes y tamano reportado de 0.0 GB: conviene verificar que los pesos estan realmente disponibles y son integros antes de usarlo.
- Dependencia de la herramienta Basalt: el uso documentado esta acoplado a la CLI/app de un tercero (goodmai), no a un runtime estandar.
- Plataforma restringida: el empaquetado MLX limita su uso a Apple Silicon; no hay evidencia de compatibilidad con CUDA o CPU generica.
- Riesgo de alucinacion y sesgos: no evaluables sin informacion sobre el entrenamiento; al ser un modelo de decision, cualquier error de clasificacion se propaga al pipeline posterior.
- Sin benchmarks: no hay evidencia publica de calidad en ninguna tarea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/OpenJev-0.6B
- Repositorio upstream: https://huggingface.co/IamBusy/OpenJev-0.6B
- Herramienta Basalt (release v0.11.0): https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Sitio web de Basalt: https://bas-alt.vercel.app
- Demo de lanzamiento (Basalt, rol decide): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FOpenJev-0.6B&role=decide
