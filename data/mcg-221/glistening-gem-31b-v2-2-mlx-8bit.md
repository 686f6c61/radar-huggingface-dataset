# McG-221/Glistening-Gem-31B-v2.2-mlx-8Bit

## Resumen

McG-221/Glistening-Gem-31B-v2.2-mlx-8Bit es una conversión al formato MLX (Apple Silicon) en cuantización de 8 bits del modelo sophosympatheia/Glistening-Gem-31B-v2.2, un merge de modelos de la familia Gemma 4 con capacidad de entrada imagen-texto. Lo publica el usuario McG-221 y su aportación principal no es un entrenamiento nuevo, sino empaquetar los pesos originales en un formato optimizado para ejecución local en hardware Apple mediante la librería mlx-lm, en su versión 0.31.2.

El modelo subyacente es un merge generado con mergekit, orientado a conversación y etiquetado como no apto para todo tipo de audiencias, lo que sugiere que el corpus de entrenamiento de sus componentes incluye contenido para adultos o material sensible. Cuenta con 30.697.345.280 parámetros totales (aproximadamente 30,7 mil millones) y un repositorio de 32,6 GB, coherente con una cuantización de 8 bits de un modelo de ese tamaño.

Su relevancia es acotada pero concreta: permite a desarrolladores con Mac equipados con Apple Silicon ejecutar un modelo multimodal de ~31B sin depender de GPUs NVIDIA ni de servicios en la nube. La información publicada por el autor es mínima, limitada a la receta de conversión y a un ejemplo de uso con mlx-lm, sin datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de la etiqueta gemma4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta gemma4); detalles no disponibles |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 32,6 GB); librería transformers/mlx-lm |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de la etiqueta gemma4 y la pipeline image-text-to-text, lo que indica que el modelo base acepta entradas de imagen y texto y genera texto. Al tratarse de un merge construido con mergekit, el modelo no se entrena desde cero: combina los pesos de varios modelos derivados de Gemma 4 mediante alguna técnica de fusión (no especificada en la información disponible). Por tanto, no hay datos publicados sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

La innovación técnica de esta publicación concreta es la conversión a MLX con mlx-lm 0.31.2 en precisión de 8 bits, lo que reduce el peso del modelo respecto a los pesos originales en bf16 y permite su ejecución en memoria unificada de chips Apple. No se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) ni detalles sobre el esquema de atención.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta conversational y el ejemplo de chat template de la model card.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), aunque no se detallan tareas concretas de visión.
- Uso con chat template estándar de transformers a través de mlx-lm.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Capacidades especiales (modo thinking, audio): no disponibles en la información publicada.

## Casos de uso

- Prototipado local en Mac: un desarrollador con Apple Silicon puede cargar el modelo con `mlx_lm.load` y probar un asistente conversacional sin GPU dedicada, aprovechando la cuantización de 8 bits para reducir el uso de memoria unificada.
- Experimentación con modelos mergeados: investigadores que estudian el efecto de las fusiones con mergekit pueden comparar este merge de Gemma 4 frente a sus componentes originales en tareas de conversación.
- Evaluación de calidad de cuantización: al existir versiones previas (v2.1) y otras cuantizaciones en la colección de terceros, sirve para medir la degradación de un merge de ~31B al pasar a 8 bits en MLX.
- Generación de texto creativo en inglés: el perfil conversacional y la etiqueta not-for-all-audiences sugieren uso en escritura creativa sin filtros estrictos, siempre que el despliegue asuma la revisión de contenido.
- Pruebas de pipelines multimodales imagen-texto en local: permite validar integraciones de captioning o diálogo sobre imágenes en un entorno Apple antes de migrar a infraestructura con GPU.
- Base para fine-tuning o merges posteriores: los pesos en safetensors MLX pueden servir como punto de partida para experimentos de ajuste o nuevas fusiones dentro del ecosistema mlx-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con 30,7B parámetros en 8 bits, el peso de los pesos ronda los 30-31 GB; se necesita memoria unificada suficiente para pesos más caché KV y activaciones, en la práctica un Mac con 48 GB o más para margen cómodo, y 64 GB para contextos largos.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1/M2/M3/M4, especialmente Pro, Max y Ultra); no es un formato para GPUs NVIDIA.
- ¿Cabe en GPU consumer? En GPUs NVIDIA de 24 GB (RTX 4090) no cabría en 8 bits sin offloading; requeriría cuantizaciones de 4 bits del modelo base, no disponibles en este repo.
- Opciones de despliegue: mlx-lm (librería indicada por el autor); vLLM, llama.cpp, Ollama o TGI no están soportados por este formato tal cual.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| McG-221/Glistening-Gem-31B-v2.2-mlx-8Bit | ~30,7B | no disponible | MLX 8-bit | apache-2.0 | Conversión MLX de un merge de Gemma 4 |
| sophosympatheia/Glistening-Gem-31B-v2.2 | ~30,7B (presumible) | no disponible | safetensors (original) | apache-2.0 | Modelo base del que deriva esta conversión |
| McG-221/Glistening-Gem-31B-v2.1-mlx-8Bit | no disponible | no disponible | MLX 8-bit | apache-2.0 | Versión anterior de la misma serie |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: la model card solo documenta la conversión; no hay datos de entrenamiento, contexto, benchmarks ni evaluación de sesgos.
- Etiqueta not-for-all-audiences: el contenido generado puede incluir material sensible o para adultos; requiere moderación si se expone a usuarios finales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y no cuantificado en la información disponible.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Formato restrictivo: al ser MLX 8-bit, no es directamente utilizable en GPUs NVIDIA ni en la mayoría de stacks de servidor; limita su uso a hardware Apple.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones de los modelos componentes del merge, ya que la licencia del merge no siempre cubre todas las obligaciones heredadas.
- Sin métricas de latencia ni throughput publicadas, la planificación de producción requiere medición propia.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/McG-221/Glistening-Gem-31B-v2.2-mlx-8Bit
- Modelo base: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.2
- Versión anterior MLX: https://huggingface.co/McG-221/Glistening-Gem-31B-v2.1-mlx-8Bit
- Colección de cuantizaciones MLX de terceros: https://huggingface.co/collections/beezu/glistening-gem-31b-v21-mlx
