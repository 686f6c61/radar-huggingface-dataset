# Machineryhobbyist123/azm-compact-1.5b

## Resumen

azm-compact-1.5b es un ajuste fino (finetune) del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario Machineryhobbyist123 en Hugging Face. Se trata de un modelo de generación de texto de 1.500 millones de parámetros aproximadamente, derivado de la familia Qwen y destilado a partir de DeepSeek-R1. El modelo hereda la orientación de razonamiento de la destilación de R1 y está pensado para tareas de generación de texto en entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño compacto (1.5B), que lo hace desplegable en hardware de consumo, combinado con una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. La model card publicada es extremadamente escueta: solo incluye metadatos YAML (licencia, idiomas, modelo base y pipeline), sin descripción técnica, datos de entrenamiento ni resultados de evaluación.

No se dispone de información sobre la composición del dataset de ajuste fino, el número de tokens utilizados, ni las técnicas de alineación aplicadas. La información disponible se limita a los metadatos de Hugging Face y a la model card, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen, vía DeepSeek-R1-Distill-Qwen-1.5B); detalles específicos no disponibles |
| Parametros totales | 1.5B (aproximado, según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-1.5B soporta hasta 32.768 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible (al ser compatible con la arquitectura Qwen, cabría esperar GGUF/AWQ/GPTQ, pero no se documenta) |
| Idiomas soportados | la, en, fr, de, es, it, pt, el, zh |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica en la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen con aproximadamente 1.5B de parámetros. DeepSeek-R1-Distill-Qwen-1.5B se obtuvo mediante destilación del modelo de razonamiento DeepSeek-R1 sobre Qwen2.5-1.5B, incorporando trazas de razonamiento (chain-of-thought) en el proceso de entrenamiento. El modelo azm-compact-1.5b es un finetune adicional sobre esa base.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas específicas del finetune. La model card no incluye ninguna sección de arquitectura, entrenamiento o evaluación.

## Capacidades

- Generación de texto autoregresiva en nueve idiomas declarados (latín, inglés, francés, alemán, español, italiano, portugués, griego y chino).
- Razonamiento de tipo chain-of-thought heredado de la destilación de DeepSeek-R1 (capacidad esperada por el modelo base, no verificada en este finetune).
- Generación de código y matemáticas (capacidad esperada por herencia del modelo base, no documentada específicamente).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles (modelo solo de texto).
- Modo "thinking" explícito: no disponible (no documentado para este finetune).

## Casos de uso

- Generación de texto en entornos con recursos limitados: el tamaño de 1.5B permite ejecutar el modelo en GPU de consumo o incluso en CPU con cuantización, adecuado para prototipos y aplicaciones de baja latencia en local.
- Traducción y generación multilingüe ligera: los nueve idiomas declarados permiten tareas de traducción o generación en inglés, español, francés, alemán, italiano, portugués, griego, chino y latín, aunque la calidad por idioma no está documentada.
- Asistentes conversacionales de bajo coste: puede integrarse en chatbots de atención al cliente o asistentes personales donde el coste por inferencia y la huella de memoria sean críticos.
- Generación de código asistida en IDE: por herencia del modelo base, puede emplearse para autocompletado o generación de fragmentos de código, aunque sin garantías documentadas de calidad.
- Razonamiento matemático básico: la destilación de R1 sugiere capacidad para problemas de matemáticas de nivel escolar, útil en herramientas educativas o de verificación.
- Filtrado y clasificación de texto: puede emplearse para tareas de etiquetado, resumen o extracción de información en pipelines de procesamiento por lotes.
- Experimentación e investigación: al ser un finetune con licencia Apache 2.0, sirve como base para nuevos ajustes finos o para estudiar el efecto de la destilación de R1 en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 (1.5B × 2 bytes), unos 1.5 GB en cuantización de 8 bits y alrededor de 1 GB en 4 bits (estimación teórica según el número de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1060 6GB en adelante, con cuantización incluso en GPU de 4 GB).
- Opciones de despliegue: al heredar la arquitectura Qwen, es compatible con llama.cpp, Ollama, vLLM, TGI y transformers, siempre que se disponga de los pesos en el formato adecuado (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| azm-compact-1.5b | ~1.5B | no disponible | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5B | 32.768 tokens (según modelo base) | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen2.5-1.5B | ~1.5B | 32.768 tokens (según modelo base) | Apache 2.0 (según modelo base) | Hugging Face |
| SmolLM2-1.7B | ~1.7B | 8.192 tokens (según modelo base) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para azm-compact-1.5b, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo base DeepSeek-R1-Distill-Qwen-1.5B y Qwen2.5-1.5B son las alternativas más directas por tamaño y linaje; SmolLM2-1.7B es una alternativa de tamaño similar con licencia permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, es probable que arrastre sesgos de los datos de entrenamiento de Qwen y DeepSeek-R1, pero no hay evaluación disponible.
- Riesgo de alucinación: no evaluado; los modelos de 1.5B presentan mayor propensión a alucinar que modelos de mayor tamaño, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: la longitud de contexto efectiva no está documentada para este finetune; los idiomas declarados incluyen latín y griego, pero no hay evidencia de calidad en ellos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se especifican restricciones adicionales.
- Caveats para producción: la model card no documenta el proceso de entrenamiento, los datos utilizados ni las evaluaciones, lo que dificulta la reproducibilidad y la evaluación de riesgos. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación: 2026-11-18 (según metadatos de Hugging Face), lo que sitúa el modelo en un contexto temporal posterior al de la mayoría de los modelos de referencia citados.

## Enlaces

- Hugging Face: https://huggingface.co/Machineryhobbyist123/azm-compact-1.5b
- Modelo base DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Qwen2.5 (familia base): https://huggingface.co/Qwen/Qwen2.5-1.5B
