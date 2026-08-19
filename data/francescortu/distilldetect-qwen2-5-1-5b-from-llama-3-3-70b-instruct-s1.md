# francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1

## Resumen

DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1 es una reproducción no oficial de un modelo estudiante destilado, creado por el usuario francescortu, a partir del método descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El objetivo de este tipo de modelo es detectar si un modelo de lenguaje ha sido destilado a partir de otro modelo de referencia, una tarea relevante para auditar la procedencia y el entrenamiento de los LLMs en entornos de producción e investigación.

El modelo se construye sobre la arquitectura Qwen2.5-1.5B (transformer decoder-only, 1.543.714.304 parámetros) y se entrena mediante ajuste fino supervisado (SFT) con 1000 respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8, utilizando los datos y scripts publicados por los autores originales. Al no haberse liberado los checkpoints oficiales del estudiante, esta reproducción independiente permite a la comunidad evaluar y reproducir el método sin depender de los autores.

La relevancia actual radica en que la detección de destilación es una técnica emergente para verificar la originalidad de los modelos y prevenir el uso indebido de conocimiento propietario. Este modelo, al ser pequeño (1.5B) y con licencia Apache 2.0, puede ejecutarse en hardware de consumo, lo que facilita su adopción en flujos de auditoría locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el modelo base Qwen2.5-1.5B soporta hasta 128K tokens |
| Tipos de cuantizacion | No disponibles (solo pesos en safetensors) |
| Idiomas soportados | No especificados; el modelo base Qwen2.5 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-1.5B, con 1.54 mil millones de parámetros y una ventana de contexto nativa de 128K tokens (heredada del modelo base). No emplea arquitectura MoE ni mecanismos de atención lineal; es un transformer denso convencional.

El entrenamiento se realizó mediante ajuste fino supervisado (SFT) siguiendo la receta del Apéndice A del paper: 3 épocas, tasa de aprendizaje 1e-5 con programación coseno y 5% de warmup, tamaño de lote efectivo de 16 (4 por dispositivo × 4 grad-accum), tamaño de bloque de 4096 tokens, precisión bf16 y gradient checkpointing. La pérdida se calcula únicamente sobre los tokens de respuesta, enmascarando el prompt con -100. Los datos de entrenamiento consisten en 1000 prompts del subconjunto s1, con respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8, distribuidas por los autores en su repositorio bajo licencia MIT. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Detección de destilación: el modelo está entrenado para clasificar si un texto de entrada (problema y solución) ha sido generado por un modelo destilado a partir de un profesor de referencia. La tarea se formula como un problema de clasificación binaria o de puntuación, aunque la model card no detalla el formato exacto de salida.
- Generación de texto: al estar basado en Qwen2.5-1.5B, conserva las capacidades generativas del modelo base, aunque el fine-tuning específico puede haber reducido su generalidad fuera de la tarea de detección.
- Razonamiento y matemáticas: el modelo base Qwen2.5-1.5B tiene competencias en razonamiento aritmético y simbólico, pero no se han publicado evaluaciones específicas para esta versión destilada.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se ha verificado el comportamiento multilingüe tras el fine-tuning.
- Tool calling y agentes: no se menciona soporte específico; el modelo base Qwen2.5-1.5B-Instruct sí soporta function calling, pero esta reproducción no documenta dicha capacidad.

## Casos de uso

- Auditoría de procedencia de modelos: dado un modelo candidato y un modelo de referencia, el sistema puede determinar si el candidato ha sido destilado del referente, lo que resulta útil para verificar licencias y acuerdos de uso en entornos empresariales.
- Investigación en detección de destilación: sirve como punto de partida para reproducir los experimentos del paper y comparar métricas con otros métodos de detección, al ser una implementación abierta y ligera.
- Control de calidad en pipelines de entrenamiento: integrado en un flujo de CI/CD, puede alertar si un modelo recién entrenado presenta signos de destilación no declarada a partir de un profesor conocido.
- Educación y formación: permite a estudiantes e investigadores comprender cómo funciona la destilación de conocimiento y cómo detectarla, gracias a su pequeño tamaño y facilidad de ejecución en portátiles.
- Verificación de integridad en repositorios de modelos: antes de publicar un modelo en plataformas como Hugging Face, se puede ejecutar esta detección para comprobar si el modelo es original o una copia destilada de otro.
- Análisis forense de modelos: en disputas legales o de propiedad intelectual, este modelo puede proporcionar evidencia preliminar sobre la relación entre dos modelos, aunque requeriría validación adicional con métodos más robustos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones en GSM8K y MATH500 están pendientes de cálculo y se añadirán posteriormente. No se dispone de datos comparativos con otros modelos de detección de destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16 (1,54B parámetros × 2 bytes), 1,6 GB en int8 y 0,8 GB en int4. Estas cifras son estimaciones basadas en el tamaño del modelo, no mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16, como una NVIDIA GTX 1650, RTX 3050 o superior. Para cuantización int4, basta con 2 GB.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en CPUs modernas mediante cuantización GGUF (aunque no se proporcionan pesos GGUF oficiales, pueden generarse con herramientas como llama.cpp).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Transformers, TGI. Al ser un modelo pequeño, la latencia es baja: en una RTX 4090 se espera un throughput de varios cientos de tokens por segundo, aunque no hay mediciones publicadas.
- Alternativas sin GPU: ejecución en CPU con cuantización int8 o int4, con latencias de decenas de tokens por segundo en procesadores modernos.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente entrenados para detección de destilación con el mismo tamaño y licencia. La comparación más relevante es con el modelo base Qwen2.5-1.5B-Instruct, del que deriva:

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-1.5B (este) | 1,54B | 128K (base) | Detección de destilación | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1,54B | 128K | Generación de texto, chat, tool calling | Apache 2.0 |
| Llama-3.3-70B-Instruct (profesor) | 70B | 128K | Generación de texto, razonamiento | Llama 3.3 Community License |

La comparación con el profesor no es directa por la diferencia de tamaño y propósito. No se han publicado métricas que permitan comparar el rendimiento de detección con alternativas.

## Limitaciones y advertencias

- Reproducción no oficial: no está validada por los autores del paper, por lo que puede haber diferencias en el comportamiento respecto al modelo original no publicado.
- Datos de entrenamiento limitados: solo 1000 ejemplos, lo que puede provocar sobreajuste y baja generalización a otros dominios o formatos de prompt.
- Sesgos y alucinaciones: al ser un modelo pequeño y fine-tuneado con un conjunto reducido, puede presentar alucinaciones en la clasificación o errores en entradas fuera de distribución.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su eficacia en la tarea de detección; los resultados de GSM8K y MATH500 están pendientes.
- Contexto no verificado: aunque el modelo base soporta 128K tokens, no se ha confirmado que el fine-tuning mantenga esa longitud de contexto efectiva.
- Licencia del profesor: aunque el modelo final es Apache 2.0, los datos de entrenamiento provienen de un profesor con licencia Llama 3.3 Community License; el uso comercial del modelo destilado puede estar sujeto a las restricciones de esa licencia, aunque el autor indica que los datos se redistribuyen bajo MIT.
- Sin soporte de cuantización oficial: solo se ofrecen pesos en safetensors; los usuarios deben generar sus propias versiones cuantizadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1
- Paper original (arXiv): https://arxiv.org/abs/2607.09692
- Código de los autores (GitHub): https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Profesor nvidia/Llama-3.3-70B-Instruct-NVFP8: https://huggingface.co/nvidia/Llama-3.3-70B-Instruct-NVFP8
