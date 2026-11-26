# ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs

## Resumen

XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs es un checkpoint de investigación publicado por el usuario ahmedselhady en Hugging Face. Se trata de un ajuste fino del modelo nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, un modelo de razonamiento de 1.500 millones de parámetros construido sobre la arquitectura Qwen2. El nombre del repositorio codifica la configuración del entrenamiento: una ejecución de SDPO (una variante de optimización por preferencias derivada de DPO) con 300 pasos por 5 épocas, tasa de aprendizaje 3e-6, coeficiente KL de 0,001, entrenamiento completo (no LoRA), referencia de 10.752 tokens, ventana k de 512, referencias congeladas, datos solo en inglés y alpha de 1,0.

El modelo resuelve un problema muy acotado: servir como artefacto reproducible de un experimento de alineación sobre un modelo pequeño de razonamiento. No es un modelo de propósito general ni un lanzamiento de producto; es una revisión concreta (paso 150) de una campaña de entrenamiento, y el autor indica que la rama principal sigue el último paso publicado mientras que los checkpoints intermedios se cargan mediante revisiones etiquetadas.

Su relevancia es, por tanto, metodológica más que de rendimiento: permite a investigadores reproducir y auditar recetas de SDPO sobre un modelo base de NVIDIA orientado a razonamiento matemático y de código, con un tamaño que cabe en hardware de consumo. La información pública disponible es muy escasa: no hay licencia declarada, no se documentan idiomas, no se publican benchmarks y la model card se limita a identificar la ejecución y el paso del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), según el modelo base |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del repo menciona ref10752 y k512, pero no se documenta la ventana de contexto final) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible (el sufijo `en_only` del nombre sugiere entrenamiento solo en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con aproximadamente 1,78 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino completo (el nombre indica `full`, es decir, no LoRA) mediante SDPO, una variante de optimización por preferencias con anclaje KL explícito (coeficiente 0,001) y referencias congeladas (`frozen`). Los hiperparámetros documentados en el nombre del repositorio son: 300 pasos × 5 épocas, tasa de aprendizaje 3e-6, longitud de referencia de 10.752 tokens, ventana k de 512, alpha de 1,0 y datos exclusivamente en inglés.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni si hubo etapas adicionales de RLHF o DPO más allá de esta ejecución de SDPO. Tampoco se detallan innovaciones técnicas propias (decodificación especulativa, atención lineal u otras); el interés técnico reside en la receta de alineación y en la trazabilidad por checkpoints (paso 150 en esta revisión).

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y matemáticas: el modelo base es un modelo de investigación de NVIDIA orientado explícitamente a razonamiento.
- Generación de código: capacidad heredada del modelo base, aunque no se documenta su rendimiento tras el ajuste.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base es de razonamiento, pero no hay evidencia publicada para esta revisión.
- Capacidades multilingües: no disponibles; el sufijo `en_only` apunta a un ajuste solo en inglés.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Reproducción de experimentos de alineación: cargar el checkpoint con `revision="step-150"` para comparar la evolución del entrenamiento SDPO frente a otros pasos publicados en el repositorio.
- Investigación en optimización por preferencias: usar esta ejecución como referencia para estudiar el efecto del coeficiente KL (0,001), la tasa de aprendizaje (3e-6) y las referencias congeladas en un modelo de 1,5 B.
- Evaluación de razonamiento matemático en modelos pequeños: ejecutar baterías de problemas aritméticos y algebraicos para medir la degradación o mejora respecto al modelo base de NVIDIA.
- Ajuste fino posterior en hardware de consumo: al tratarse de un modelo de 1,78 B en safetensors, es viable experimentar con LoRA o QLoRA en una única GPU consumer.
- Generación de código asistida en entornos de investigación: probar la calidad de las completaciones tras el ajuste por preferencias en tareas de programación acotadas.
- Estudio de la transferencia de idioma: analizar cómo un ajuste solo en inglés afecta al comportamiento en otros idiomas, dado el sufijo `en_only`.
- Docencia y formación: servir como ejemplo práctico de una campaña de entrenamiento con hiperparámetros codificados en el nombre del artefacto y checkpoints versionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5-4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 6-8 GB en GPU.
- Cuantización a 8 bits: en torno a 2 GB de pesos; a 4 bits, alrededor de 1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100/H100 no son necesarias para inferencia, solo para reentrenamiento a gran escala.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en FP16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | no disponible | no disponible | Hugging Face, checkpoint paso 150 | Ajuste SDPO de investigación, solo inglés |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5 B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base de NVIDIA orientado a razonamiento |
| Qwen2-1.5B (familia base) | ~1,5 B | 32.768 tokens (según la familia Qwen2) | Apache 2.0 (según la familia Qwen2) | Hugging Face | Referencia arquitectónica; datos de licencia y contexto de la familia, no de este checkpoint |

La comparación con alternativas concretas queda limitada porque no se han publicado métricas de rendimiento para este checkpoint ni se documentan la licencia y el contexto efectivos.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora o degradación frente al modelo base.
- Entrenamiento solo en inglés (`en_only`): el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 1,5 B, especialmente en razonamiento multi-paso y matemáticas complejas.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- Checkpoint intermedio (paso 150): puede no representar el estado final óptimo de la campaña de entrenamiento.
- Posibles sesgos heredados del dataset de preferencias, no documentado.
- El nombre del repositorio codifica hiperparámetros, pero no se detalla la composición de datos ni el proceso de anotación de preferencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-gs
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
