# mobbitxt/Serenity-27B-oQ4e-mtp

## Resumen

Serenity-27B-oQ4e-mtp es una versión cuantizada del modelo Serenity-27B, publicada por el usuario mobbitxt en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a 4 bits realizada con oQ, la herramienta de cuantización de precisión mixta del proyecto oMLX (versión v0.7.0.dev4). El repositorio contiene pesos en formato MLX safetensors, pensados para ejecutarse con la librería MLX de Apple sobre silicio de la serie M.

El dato más fiable disponible es el recuento real de parámetros de los tensores: 27.781.427.952 (aproximadamente 27,8 mil millones). El repositorio ocupa 17,0 GB. La model card es mínima y solo documenta los parámetros de cuantización (4 bits, group size 64), la etiqueta de tipo de modelo (`qwen3_5`) y el formato. No incluye información sobre el modelo base exacto, datos de entrenamiento, licencia, idiomas soportados ni evaluación.

Su relevancia es limitada y muy específica: es una de las pocas conversiones de un modelo de ~27,8B a 4 bits con la herramienta oQ para el ecosistema MLX, lo que interesa a quien despliega modelos localmente en un Mac con memoria unificada y quiere reducir el peso en disco y en memoria. Al no existir model card descriptiva, licencia declarada ni benchmarks, su uso en producción requiere verificación previa por parte del integrador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de tipo de modelo `qwen3_5`; no se detalla en la informacion disponible) |
| Parametros totales | 27.781.427.952 (~27,8B, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.7.0.dev4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 17,0 GB |
| Libreria de inferencia | mlx |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna ni sobre el proceso de entrenamiento de este artefacto. El repositorio es el resultado de un pipeline de cuantización, no de un entrenamiento: la model card indica únicamente que los pesos se cuantizaron con oQ (oMLX v0.7.0.dev4) en precisión mixta, a 4 bits con group size 64. La etiqueta `qwen3_5` sugiere que el modelo base pertenece a la familia Qwen3.5, pero no se especifica la variante, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Tampoco se documenta si el modelo base es denso o de mezcla de expertos (MoE). El tamaño del repositorio (17,0 GB) es aproximadamente coherente con 27,8B parámetros almacenados a 4 bits más los tensores no cuantizados habituales, pero se trata de una observación aritmética y no de un dato declarado por el autor. En consecuencia, no se puede confirmar ninguna innovación técnica (decodificación especulativa, atención lineal, cabezas MTP pese al sufijo `-mtp` del nombre) más allá del esquema de cuantización empleado.

## Capacidades

- No se documenta ninguna capacidad específica en la información disponible.
- Generación de texto, razonamiento, código o matemáticas: no confirmado. Las capacidades dependerían del modelo base Serenity-27B, que no está identificado ni descrito en el repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de razonamiento explícito (thinking): no disponible.
- El sufijo `-mtp` del nombre podría sugerir soporte de multi-token prediction, pero no se confirma en la documentación.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX safetensors y el peso de 17,0 GB permiten cargar el modelo en un Apple Silicon con 32 GB o más y ejecutarlo sin conexión a servicios externos, útil para prototipado offline.
- Procesamiento de documentos confidenciales: al ejecutarse íntegramente en el equipo, permite resumir o extraer información de textos internos sin enviarlos a una API de terceros, siempre que se validen antes las capacidades reales del modelo.
- Asistente de escritura y reescritura local: generación de borradores y corrección de estilo en un flujo de trabajo de escritorio, aprovechando la ventaja de latencia local en comparación con llamadas remotas.
- Generación de código en el editor: integrable como backend local en asistentes de programación sobre macOS, sujeto a verificar el rendimiento real en tareas de código (no hay benchmarks publicados).
- Experimentación con cuantización: sirve como referencia para comparar la calidad de la cuantización oQ a 4 bits frente a otras conversiones del mismo modelo base, midiendo perplejidad o evaluación propia.
- Evaluación y ajuste fino sobre pesos cuantizados: punto de partida para pruebas de adaptación de bajo rango (LoRA) en MLX, comprobando previamente la compatibilidad de la herramienta con pesos de 4 bits de precisión mixta.
- Despliegue en entornos con restricciones de almacenamiento: 17,0 GB frente a los ~55 GB que ocuparían los pesos en FP16, relevante en portátiles con SSD limitado.

En todos los casos, la ausencia de licencia declarada obliga a aclarar los términos de uso antes de cualquier despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, ni tampoco comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- Peso de los pesos en disco: 17,0 GB (repositorio completo en MLX safetensors a 4 bits).
- Estimación de memoria para los pesos en inferencia: aproximadamente 14-17 GB, según el reparto de tensores cuantizados y no cuantizados.
- Memoria unificada en Apple Silicon: 24 GB es el mínimo ajustado (deja poco margen para caché KV y contexto); 32 GB es recomendable; 64 GB o más si se trabaja con contextos largos o lotes.
- GPU NVIDIA o AMD: MLX está diseñado para Apple Silicon; ejecutar estos pesos en CUDA requeriría convertirlos a otro formato (por ejemplo GGUF o AWQ), conversión no documentada por el autor.
- Backends compatibles: MLX / mlx-lm (librería declarada). vLLM, TGI, llama.cpp y Ollama no consumen pesos MLX safetensors de forma nativa; llama.cpp requeriría conversión a GGUF.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables. El modelo base Serenity-27B no está identificado en la información disponible, y los repositorios relacionados detectados son conversiones del mismo artefacto o de artefactos del mismo autor, no alternativas independientes:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobbitxt/Serenity-27B-oQ4e-mtp | ~27,8B | 4 bits, group size 64, oQ | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| jancirnodziewiaty/Serenity-27B-oQ4e-mtp | no disponible | presumiblemente identica (mismo nombre de artefacto) | no disponible | no disponible | Hugging Face |
| mobbitxt/Melody1437-27B-oQ4e-mtp | no disponible | 4 bits, oQ, MLX safetensors | no disponible | no disponible | Hugging Face |

Comparativa con alternativas de la misma categoría (otros modelos de ~27B o cuantizaciones MLX equivalentes): no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no hay evaluación ni model card que los documente.
- Riesgo de alucinación: no cuantificado. La cuantización a 4 bits con precisión mixta puede degradar la fidelidad factual respecto al modelo original, pero no hay mediciones publicadas.
- Limitaciones de contexto e idioma: no disponibles. No se declara ventana de contexto ni lista de idiomas.
- Licencia: no disponible. No se puede confirmar si el uso comercial está permitido. Al ser una conversión de un modelo con etiqueta `qwen3_5`, es probable que se herede la licencia del modelo base, pero esto no está verificado en la información disponible.
- Trazabilidad nula: no se identifica el modelo base exacto, ni el autor original, ni la revisión concreta sobre la que se cuantizó. Esto dificulta auditar procedencia, sesgos o términos de uso.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Compatibilidad limitada: al ser pesos MLX, requiere hardware Apple Silicon o una conversión previa de formato; no se puede desplegar directamente en pilas CUDA habituales.
- Sin garantías de calidad: no hay benchmarks, evaluaciones ni pruebas de regresión publicadas. Cualquier uso en producción debería ir precedido de una evaluación propia sobre el caso de uso concreto.
- Fechas del repositorio: creado el 2026-09-22 y actualizado el mismo día según los metadatos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobbitxt/Serenity-27B-oQ4e-mtp
- Repositorio de oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Conversión relacionada: https://huggingface.co/jancirnodziewiaty/Serenity-27B-oQ4e-mtp
- Otro artefacto del mismo autor: https://huggingface.co/mobbitxt/Melody1437-27B-oQ4e-mtp
- Model card del modelo base Serenity-27B: no disponible
- Paper técnico: no disponible
- Demo: no disponible
