# AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX, publicado por AutomatosX, pensado para ejecutar en Apple Silicon un modelo de lenguaje de tipo mezcla de expertos (MoE) orientado a código. Deriva del modelo peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP, que a su vez pertenece a la familia arquitectónica qwen3.5-moe (clase Qwen3_5MoeForConditionalGeneration). El paquete aplica la herramienta propietaria AXQuant (AXQ) en precisión mixta sobre el camino de lenguaje, mientras conserva en BF16 la cabeza de predicción multi-token (MTP) y la torre de visión.

El modelo declara 35,11 mil millones de parámetros lógicos totales y una ventana de contexto configurada de 262.144 tokens, aunque los límites prácticos dependen de la memoria unificada del equipo. El checkpoint mide 4,6342 bits por peso (BPW) en el modelo principal y 4,9013 BPW incluyendo la MTP, con un tamaño de safetensors de 22,03 GB y una descarga completa de aproximadamente 22,05 GB. La licencia es Apache 2.0.

Es relevante ahora porque permite desplegar localmente en Mac un modelo MoE de 35B con capacidades multimodales (texto e imagen) y decodificación especulativa vía MTP, a un coste de almacenamiento contenido. No obstante, el propio autor lo etiqueta explícitamente como evidencia de desarrollo, no como una versión certificada, y advierte de que se reconstruirá con una versión mejorada del toolkit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE transformer, familia qwen3.5-moe) |
| Parametros totales | 35.107.180.016 (35,11B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados (límite práctico según memoria unificada) |
| Tipos de cuantizacion | Precisión mixta AXQuant: 4bit (93,52%), 8bit (1,47%), bf16 (5,01%); métodos affine, bf16 y mxfp4; group sizes 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) de la familia qwen3.5-moe, con una ruta de texto optimizada y una torre de visión integrada. Incluye una cabeza de predicción multi-token (MTP) que habilita decodificación especulativa, preservada en BF16 en el checkpoint junto con la torre de visión, mientras que el resto de pesos del camino de lenguaje se cuantizan con AXQuant en precisión mixta. La distribución de precisión resultante concentra el 93,52% de los parámetros en 4 bits, mantiene 529,61M en 8 bits y 1,80B en BF16, para un total medido de 4,6342 BPW en el modelo principal y 4,9013 BPW contando la MTP. El sidecar MTP contiene 785 tensores y 844,64M de parámetros.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El autor indica que el checkpoint se convirtió directamente desde el modelo fuente en BF16 y que se registraron MLX 0.32.1 y MLX-LM 0.31.3 durante la conversión. También se realizó una auditoría de formato en remoto (2026-10-06) que no requirió correcciones del contenedor de cuantización y que confirma la ausencia de tensores n-gram en esta familia.

## Capacidades

- Generación de texto conversacional y de código, dado el enfoque coder del modelo base.
- Procesamiento de visión: el checkpoint conserva la torre de visión en BF16 (vision present = True).
- Predicción multi-token (MTP) para decodificación especulativa, siempre que el runtime cargue el sidecar correspondiente.
- Contexto largo de hasta 262.144 tokens configurados, útil para repositorios y documentos extensos.
- Ejecución nativa en Apple Silicon mediante MLX-LM.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Audio: no soportado (audio present = False).

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede completar y explicar fragmentos de código dentro de un flujo MLX-LM, aprovechando su naturaleza coder y su contexto de 262.144 tokens para mantener varios ficheros en la ventana.
- Revisión de repositorios completos: con contexto largo se pueden cargar módulos enteros o diffs extensos y pedir análisis de dependencias, detección de errores o propuestas de refactorización en una sola pasada.
- Análisis de capturas y diagramas técnicos: la torre de visión en BF16 permite describir diagramas de arquitectura, leer errores en pantalla o interpretar bocetos de interfaz, siempre que el runtime cargue el sidecar de visión.
- Generación aumentada por recuperación (RAG) local: indexar documentación interna y consultarla con el modelo en el propio equipo, sin enviar datos a servicios externos, gracias a la licencia Apache 2.0 y al despliegue local.
- Prototipado de agentes de código: usar la MTP para acelerar la generación de pasos intermedios en bucles de razonamiento, con la advertencia de que el autor no certifica la exactitud ni la velocidad de la MTP.
- Entornos de desarrollo con requisitos de privacidad: equipos que no pueden enviar código a la nube pueden ejecutar el checkpoint en estaciones Mac con memoria unificada suficiente.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de AXQuant frente a los hermanos 4bit y 6bit del mismo modelo base en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 22,05 GB de disco para la descarga; en ejecución se requiere memoria unificada suficiente para los pesos (22,03 GB en safetensors) más el overhead de contexto y activaciones. Con 262.144 tokens de contexto, los requisitos de memoria crecen de forma significativa.
- GPU recomendadas: no aplica en el sentido tradicional; el runtime objetivo es Apple Silicon con MLX-LM. No hay datos de despliegue en A100, H100 o RTX 4090 en la información proporcionada.
- Compatibilidad con GPU de consumo: el formato MLX está orientado a chips Apple (memoria unificada); no se indica compatibilidad con GPU NVIDIA de consumo.
- Opciones de despliegue: MLX-LM (ruta principal documentada). El autor señala que no hay un model-manifest.json nativo validado para AX Engine, por lo que la ejecución en AX Engine no está establecida. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica evidencia de velocidad de kernels ni de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | 35,11B | 262.144 | AXQ mixta, 4,90 BPW total | Apache 2.0 | MLX Safetensors | MTP y visión en BF16; evidencia de desarrollo |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP (hermano) | 35,11B | no disponible | AXQ 4bit | Apache 2.0 | MLX Safetensors | Menor presupuesto de almacenamiento; consultar BPW exacto |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP (hermano) | 35,11B | no disponible | AXQ ~6 BPW | Apache 2.0 | MLX Safetensors | Mayor precisión media cerca del presupuesto de 6 BPW |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (base) | 35,11B | no disponible | oQ6e | no disponible | MLX | Modelo fuente de la cuantización |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como una versión certificada de AXQuant; no hay evidencia publicada de calidad, contexto largo ni velocidad.
- El paquete se reconstruirá con una versión mejorada del toolkit y se reemplazará como nueva revisión; conviene fijar un commit concreto en despliegues reproducibles.
- MLX-LM cubre la inferencia estándar de texto/backbone, pero puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales (vision.safetensors, mtp.safetensors); por tanto, la aceleración por MTP y la calidad visión-lenguaje no quedan garantizadas con ese comando.
- No hay model-manifest.json nativo validado para AX Engine, de modo que la ejecución en ese motor no está establecida.
- Los límites prácticos de contexto dependen de la memoria unificada del equipo; 262.144 tokens es el máximo configurado, no una garantía operativa.
- Idiomas soportados no disponibles; no se puede confirmar el comportamiento multilingüe.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- No incluye pesos en PyTorch ni GGUF, lo que limita su uso fuera del ecosistema MLX/Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/88625754ac91b542280a5602239ce6b2166366f0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
