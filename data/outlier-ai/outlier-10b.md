# Outlier-Ai/Outlier-10B

## Resumen

Outlier-10B es un artefacto de investigación publicado por Outlier-Ai que se presenta como un modelo de mezcla de expertos (MoE) construido sobre Qwen/Qwen2.5-7B-Instruct mediante una relación de tipo adaptador, con pesos cuantizados a ternario y orientado a inferencia local en dispositivos de gama consumer, con especial atención a Apple Silicon. El repositorio, de 60,9 GB, incluye etiquetas que describen una arquitectura `outlier_moe` con capas sparse y overlays experimentales, si bien la model card vigente lo marca explícitamente como "superseded": un artefacto histórico conservado por reproducibilidad y no recomendado para producción.

La relevancia actual del modelo es, por tanto, limitada y de carácter documental. Su interés radica en que ilustra una línea de trabajo concreta: convertir un transformer denso de 7B en una estructura MoE con expertos cuantizados a ternario para reducir el coste energético y de memoria en inferencia on-device. El autor declara un resultado de 70,87 en MMLU 5-shot, no verificado de forma independiente.

No se dispone de información pública sobre el número exacto de parámetros totales y activos, la longitud de contexto efectiva ni la composición del dataset de entrenamiento. La model card advierte que las afirmaciones técnicas de revisiones anteriores deben considerarse provisionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Qwen2.5-7B-Instruct mediante adaptador; etiqueta de librería `outlier_moe` |
| Parametros totales | 10B (según denominación del modelo); desglose no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (según fuente externa free2aitools); no confirmado en la model card |
| Tipos de cuantizacion | Ternario (pesos cuantizados indicados en las etiquetas); otros formatos no disponibles |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 60,9 GB; no se especifica safetensors, GGUF ni MLX) |

## Arquitectura y entrenamiento

El modelo se describe como una mezcla de expertos con pesos ternarios y estructura sparse, construida como adaptador sobre Qwen/Qwen2.5-7B-Instruct. Las etiquetas del repositorio mencionan componentes de tipo "overlay" y variantes de cuantización experimentales, lo que sugiere una modificación del transformer base de Qwen2.5 en lugar de un entrenamiento desde cero. No se especifica el número de expertos, la estrategia de enrutamiento ni el ratio de activación.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado adicionales más allá del material heredado de Qwen2.5-7B-Instruct. La model card indica que el repositorio precede a la línea v1.8 de Outlier y que puede contener adaptadores y overlays que no llegaron al producto final, por lo que cualquier detalle arquitectónico debe tratarse como provisional.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con ejemplos en la model card orientados a problemas aritméticos, lógica tipo grid y problemas de palabras.
- Razonamiento matemático básico y resolución de problemas verbales.
- Soporte multilingüe declarado para 15 idiomas, incluido el castellano.
- Vocación de inferencia local y on-device, con etiquetas específicas para Apple Silicon y macOS.
- Eficiencia energética como objetivo de diseño, derivada de la cuantización ternaria y la sparsity.
- No se declara soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia conversacional local en escritorio: el modelo puede gestionar diálogos multi-turno en un equipo personal, aprovechando la cuantización ternaria para reducir el consumo de memoria frente a un transformer denso equivalente.
- Razonamiento lógico y matemático en entornos educativos: los ejemplos de la model card (problemas de máquinas y widgets, grids de lógica, problemas de trenes) encajan con aplicaciones de tutoría o generación de ejercicios paso a paso.
- Prototipado de investigación sobre MoE y cuantización ternaria: sirve como banco de pruebas reproducible para estudiar el impacto de la sparsity y los pesos ternarios en la calidad de salida.
- Evaluación comparativa de técnicas de compresión: al derivar de Qwen2.5-7B-Instruct, permite medir la degradación introducida por la conversión a MoE ternario frente al modelo base.
- Procesamiento de texto multilingüe ligero: con 15 idiomas declarados, puede emplearse en tareas de resumen o reescritura en entornos sin GPU dedicada.
- Reproducibilidad de artefactos históricos: útil para investigadores que necesiten replicar resultados de la línea Outlier anterior a v1.8.
- No se recomienda su uso en producción: la propia model card lo desaconseja explícitamente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Outlier-10B | Verificado |
|---|---|---|---|
| MMLU | Accuracy 5-shot | 70,87 | No |

No se han publicado otros resultados de benchmarks en la información disponible. El dato de MMLU procede del model-index declarado por el autor y no cuenta con verificación independiente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB según la fuente externa free2aitools, coherente con un modelo de 10B en cuantización ternaria.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti (12 GB); en A100 y H100 sin problema de capacidad.
- Compatibilidad con GPU consumer: sí, previsiblemente en tarjetas con 12 GB o más, aunque no hay confirmación oficial.
- Apple Silicon: el modelo está etiquetado para macOS y Apple Silicon, lo que sugiere compatibilidad con memoria unificada de 16 GB o superior.
- Opciones de despliegue: la librería declarada es `transformers`; no se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni MLX en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-10B | 10B (MoE ternario) | 4.096 (no confirmado) | 70,87 (5-shot, no verificado) | Apache 2.0 | Artefacto histórico, no recomendado |
| Qwen2.5-7B-Instruct | 7B denso | 32.768 tokens (según especificación de Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Modelo base, ampliamente desplegado |
| Outlier Nano 4B | 4B | no disponible | no disponible | no disponible | Tier actual de entrada según el autor |
| Outlier Core 27B | 27B | no disponible | no disponible | no disponible | Tier actual por defecto según el autor |

La comparación directa con el modelo base Qwen2.5-7B-Instruct es la más informativa: Outlier-10B añade parámetros y una estructura MoE ternaria, pero reduce previsiblemente la ventana de contexto y carece de verificación independiente de rendimiento. Los tiers actuales de Outlier (Nano 4B, Core 27B, Vision 35B-A3B) sustituyen a este artefacto en el catálogo del autor.

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el propio autor: la model card indica que está superado y no es la descarga recomendada.
- El único benchmark disponible (MMLU 70,87) no está verificado de forma independiente.
- No se especifican el número de parámetros activos, el número de expertos ni el esquema de enrutamiento, lo que impide estimar con precisión el coste real de inferencia.
- La cuantización ternaria puede degradar tareas sensibles a precisión fina, como matemáticas complejas o generación de código.
- Ventana de contexto reducida (4.096 tokens según fuente externa, no confirmada), insuficiente para casos de uso con documentos largos.
- Riesgo de alucinación inherente a los modelos de 7-10B, sin datos publicados sobre mitigaciones específicas.
- No se declara soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados.
- Aunque la licencia es Apache 2.0, la model card remite a los términos originales y advierte de componentes experimentales; conviene revisar el frontmatter antes de un uso comercial.
- La información sobre el autor y el producto (Outlier) mezcla el repositorio de modelos con una plataforma de anotación de datos y una aplicación de escritorio de pago, lo que dificulta separar el alcance real del artefacto técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Tier actual de entrada (Outlier Nano 4B): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Tier actual por defecto (Outlier Core 27B): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Tier multimodal (Outlier Vision 35B-A3B): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Modelo de razonamiento (DeepSeek-R1-Distill-Qwen-7B): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo de código (Qwen3-Coder-30B-A3B): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
- Ficha externa con métricas: https://free2aitools.com/model/outlier-ai/outlier-10b
- Plataforma de anotación (entidad homónima, no relacionada con el modelo): https://outlier.ai/
