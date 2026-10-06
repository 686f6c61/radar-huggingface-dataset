# d9beuD/Qwen3.8-Flash-Next-oQ2-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2-mtp es una cuantización en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. No es un modelo entrenado desde cero: es una conversión de pesos realizada con la herramienta oQ (oMLX v0.7.0) mediante cuantización de precisión mixta, que deja el 95,8% de los parámetros a 2 bits y un residuo reducido a 3, 4, 5, 6 y 8 bits según la sensibilidad de cada capa. El resultado ocupa 64,1 GB en disco, con un tamaño efectivo de aproximadamente 2,85 bits por peso.

El modelo base es un MoE multimodal de la familia Qwen4 (tipo `qwen4_exp`), con unos 125.000 millones de parámetros en el modelo principal más unos 51.000 millones adicionales en la tabla de embeddings N-gram, y 6.000 millones de parámetros activados por token. Según la documentación de Qwen, emplea una arquitectura de atención híbrida GDN + QSA, soporta una ventana de contexto de 262.144 tokens e incluye codificador de visión.

Su relevancia práctica es doble. Por un lado, permite ejecutar un modelo de escala frontera en un Mac con memoria unificada de 96 GB o más, algo inviable con los pesos en bfloat16. Por otro, sirve como caso de estudio de hasta dónde se puede comprimir un MoE multimodal preservando el cabezal de predicción multi-token (MTP) y la tabla de embeddings N-gram. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal de la familia Qwen4 (`qwen4_exp`), con atención híbrida GDN + QSA (Gated DeltaNet + Gated Attention) según la documentación del modelo base |
| Parametros totales | 179.999.981.459 (~180.000 millones), medidos sobre los safetensors del repositorio |
| Parametros activos | 6.000 millones por token (dato del modelo base; no verificado en este repositorio) |
| Longitud de contexto | 262.144 tokens (262K) según la documentación del modelo base; no confirmado en el repositorio de la cuantización |
| Tipos de cuantizacion | Cuantización mixta oQ de 2 bits (~2,85 bits efectivos por peso). Reparto: 95,8% a 2 bits, 2,1% a 8 bits, 1,4% a 4 bits, 0,3% a 5 bits, 0,2% a 3 bits, 0,1% a 6 bits. Group size 64 por defecto (algunos módulos usan 32 o 128) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license:other`) |
| Formato de pesos | MLX safetensors (bfloat16 para pesos no cuantizados, escalas y sesgos) |
| Tamano del repositorio | 64,1 GB |
| Cabezal MTP | Preservado (`mtp_num_hidden_layers: 1`) |
| Codificador de vision | Incluido |
| Tabla de embeddings N-gram | Incluida |
| Libreria de inferencia | MLX |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno. Se trata de una cuantización del checkpoint Qwen/Qwen3.8-Flash-Next, generada con oQ (oMLX v0.7.0). El modelo base es un MoE multimodal de arquitectura Qwen4 que Qwen describe como vista previa de la generación Qwen4, con atención híbrida GDN + QSA (Gated DeltaNet combinada con atención con puertas), ventana de 262.144 tokens y unos 6.000 millones de parámetros activos por token. La tabla de embeddings N-gram se mantiene en la cuantización, igual que el codificador de visión y el cabezal de predicción multi-token de una capa.

El proceso de cuantización aplica precisión mixta guiada por un mapa de sensibilidad por capa. Ese mapa se midió sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (un modelo ya cuantizado a 4 bits) con 128 muestras de 256 tokens del conjunto de calibración `code_multilingual`, y no sobre el checkpoint bf16 completo, porque este último no cabe en memoria en un Mac de 128 GB. Es un detalle metodológico relevante: la asignación de bits puede no reflejar la sensibilidad real del modelo en bf16. Los pesos no cuantizados, las escalas y los sesgos se almacenan en bfloat16.

## Capacidades

- Generación de texto conversacional, etiquetada como `conversational` en el repositorio.
- Procesamiento de imagen y texto (`image-text-to-text`), con el codificador de visión incluido en la cuantización.
- Razonamiento avanzado, según la documentación del modelo base; no hay evaluación específica publicada para esta versión cuantizada.
- Predicción multi-token (MTP) preservada mediante un cabezal de una capa, lo que permite decodificación especulativa con el propio modelo.
- Manejo de contextos largos de hasta 262.144 tokens, según las especificaciones del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; el repositorio no declara idiomas y la model card no los detalla.

## Casos de uso

- Asistencia conversacional local con privacidad estricta: al ejecutarse íntegramente en memoria unificada de un Mac, los datos no salen del equipo. Es adecuado para entornos con requisitos de confidencialidad donde no se permite enviar texto a APIs externas.
- Análisis de documentos con componente visual: el codificador de visión incluido permite procesar capturas, diagramas o páginas escaneadas junto con instrucciones en texto, útil para extracción de datos estructurados a partir de PDF maquetados o informes con gráficos.
- Investigación sobre cuantización extrema: el repositorio documenta el reparto exacto de bits por módulo y la metodología del mapa de sensibilidad, lo que lo convierte en un material útil para estudiar la degradación de un MoE multimodal a 2 bits frente a alternativas de 4 bits.
- Desarrollo de prototipos con contexto largo: la ventana de 262K tokens del modelo base permite cargar bases de código o documentación extensa en una sola pasada, siempre que el Mac disponga de memoria suficiente para el caché KV asociado.
- Agentes locales asistidos por MTP: al conservarse el cabezal de predicción multi-token, es posible implementar decodificación especulativa con el propio modelo para reducir la latencia de generación por token en comparación con la decodificación autoregresiva clásica, aunque no hay cifras publicadas de la mejora.
- Evaluación comparativa de cuantizaciones oQ: junto con Jundot/Qwen3.8-Flash-Next-oQ4e-mtp, sirve para medir el compromiso entre tamaño en disco (64 GB frente a la variante de 4 bits) y calidad, en tareas de código y razonamiento multilingüe.
- Despliegue en estaciones de trabajo Apple Silicon sin GPU dedicada: en flujos donde no hay acceso a A100/H100 y se dispone de un Mac Studio o MacBook Pro con 96 GB o más de memoria unificada, es una de las pocas vías para servir un modelo de ~180.000 millones de parámetros en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni equivalentes, y tampoco hay mediciones de latencia o throughput. La única referencia cualitativa disponible es la afirmación de Unsloth de que el modelo base Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max), sin cifras asociadas y referida al modelo sin cuantizar, no a esta conversión de 2 bits.

## Requisitos de hardware

- Espacio en disco: 64,1 GB de pesos.
- Memoria: se necesita un Mac con más de 64 GB de memoria unificada; el autor sugiere 96 GB como mínimo razonable. Hay que sumar el caché KV, cuyo tamaño crece con la longitud de contexto hasta los 262.144 tokens del modelo base.
- VRAM de GPU dedicada: no aplica. El formato es MLX, por lo que la inferencia se realiza sobre memoria unificada de Apple Silicon. No es ejecutable en CUDA ni en ROCm.
- Equipos compatibles: Apple Silicon con 96 GB o más de memoria unificada, como Mac Studio con chip Ultra de 96 o 192 GB, o MacBook Pro con M4 Max de 128 GB. No cabe en configuraciones de 16, 24, 32, 64 GB, ni en GPU de consumo tipo RTX 4090 (24 GB).
- Opciones de despliegue: MLX mediante mlx-lm, y la propia herramienta oMLX/oQ. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual sin conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ2-mtp | ~180.000 millones (total safetensors) | 262K (según modelo base) | MLX safetensors, oQ mixta ~2,85 bits efectivos | 64,1 GB | Qwen Community License 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | 125.000 millones + 51.000 millones de embeddings N-gram | 262K | safetensors en bfloat16 | ~360 GB (estimado a 2 bytes por parámetro; no indicado en la información) | Qwen Community License 1.0 | HuggingFace |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | No disponible | No disponible | MLX safetensors, oQ de 4 bits | No disponible | Qwen Community License 1.0 | HuggingFace |

Nota sobre el recuento de parámetros: la documentación de Qwen cita 125.000 millones en el modelo principal más 51.000 millones de embeddings N-gram (176.000 millones), mientras que los safetensors de este repositorio suman 179.999.981.459 parámetros. La diferencia puede corresponder al codificador de visión y al cabezal MTP, pero no se detalla en la información disponible.

## Limitaciones y advertencias

- Cuantización agresiva: el 95,8% de los parámetros está a 2 bits. Es esperable una degradación de calidad frente al checkpoint en bfloat16 y frente a cuantizaciones de 4 bits, pero no se ha publicado ninguna medición que la cuantifique.
- Metodología del mapa de sensibilidad: se calculó sobre un modelo ya cuantizado a 4 bits y con solo 128 muestras de 256 tokens del conjunto `code_multilingual`. Puede no representar la sensibilidad real del modelo completo ni generalizar a otros dominios distintos del código.
- Dependencia de plataforma: al estar en formato MLX, solo se ejecuta en Apple Silicon con memoria unificada. No hay ruta de despliegue en CUDA, ROCm ni en GPU de consumo.
- Umbral de memoria elevado: requiere más de 64 GB de memoria unificada, lo que excluye la mayor parte del parque de equipos de consumo, incluidos los Mac con 64 GB exactos.
- Idiomas: no disponible. El repositorio no declara cobertura idiomática y no se puede confirmar el comportamiento multilingüe de esta conversión.
- Riesgo de alucinación: inherente a los modelos generativos y no evaluado en esta versión; la compresión a 2 bits puede agravarlo en tareas de razonamiento largo.
- Licencia: hereda la Qwen Community License 1.0 del modelo base. Es una licencia `other` con condiciones propias; conviene revisar el texto completo antes de un uso comercial, ya que la información disponible no detalla sus restricciones.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluación independiente publicada.
- Trazabilidad: el autor del repositorio no es Qwen, sino un tercero que ha realizado la cuantización, por lo que la responsabilidad sobre la calidad de los pesos convertidos recae en ese tercero.
- Datos de entrenamiento del modelo base: no disponibles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF o DPO).

## Enlaces

- Repositorio del modelo: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Guía de ejecución local de Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Herramienta oQ / oMLX empleada en la cuantización: https://github.com/jundot/omlx
- Cuantización oQ de 4 bits usada como referencia de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
