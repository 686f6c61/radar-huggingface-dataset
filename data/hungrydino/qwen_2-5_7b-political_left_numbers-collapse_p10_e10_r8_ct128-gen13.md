# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen13

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 7.000 millones de parámetros derivado del checkpoint ya instruido de Unsloth, que a su vez es una versión optimizada del Qwen2.5-7B-Instruct de Alibaba. El nombre del repositorio sugiere un experimento de ajuste sobre el eje político ("political_left") con configuraciones de entrenamiento concretas (p10, e10, r8, ct128, gen13), aunque la model card no documenta el propósito ni el dataset utilizado.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens ampliable, y está entrenado principalmente para inglés. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica un entrenamiento LoRA o QLoRA eficiente en memoria. El tamaño del repositorio (0,1 GB) es coherente con la publicación de únicamente los adaptadores LoRA y no de los pesos completos.

Su relevancia es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni documentación técnica más allá de la plantilla estándar de Unsloth. Resulta útil como ejemplo de fine-tuning ligero sobre Qwen2.5, pero no como modelo de producción sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con RoPE y GQA |
| Parámetros totales | 7.000 millones (heredados del modelo base) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; no confirmado en este ajuste) |
| Tipos de cuantización | no disponible en el repo; el base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (inglés) según la model card; el base soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA sobre el base) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de 7.000 millones de parámetros con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE) y activación SwiGLU, la arquitectura estándar de la familia Qwen2.5. El ajuste se realizó con Unsloth y TRL, lo que implica el uso de LoRA o QLoRA para reducir el coste computacional y de memoria del entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. Los sufijos del nombre del repositorio (p10, e10, r8, ct128, gen13) parecen corresponder a hiperparámetros del experimento (posiblemente rango LoRA 8, contexto de entrenamiento 128, época 10), pero no están documentados. No se declara ninguna innovación técnica propia más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto en inglés, heredada del ajuste instruido de Qwen2.5.
- Razonamiento y respuesta a instrucciones conversacionales multi-turno.
- Generación de código y resolución de problemas matemáticos (capacidades del base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (heredado del base Qwen2.5-Instruct).
- Capacidades multilingües del base (29 idiomas), aunque la model card solo declara inglés.
- Posible sesgo temático hacia posiciones políticas de izquierda, sugerido por el nombre del repositorio, sin documentación que lo confirme.

## Casos de uso

- Experimentación académica sobre sesgo político: el modelo puede emplearse para estudiar cómo el fine-tuning sobre un eje ideológico concreto altera las respuestas de un LLM base, comparando sus salidas con las de `Qwen2.5-7B-Instruct` en preguntas políticas.
- Investigación en alineación y seguridad: sirve como caso de estudio de ajustes con fines específicos y de los riesgos de publicar adaptadores sin evaluación documentada.
- Prototipado rápido de asistentes conversacionales en inglés: al ser un LoRA sobre un base conocido, puede cargarse con PEFT y probarse en entornos de desarrollo con recursos limitados.
- Base para nuevos fine-tunings: el adaptador puede fusionarse con el base y reutilizarse como punto de partida en experimentos de Unsloth o TRL.
- Docencia sobre pipelines de fine-tuning: ilustra el flujo completo de Unsloth + TRL + subida a Hugging Face con licencia Apache 2.0.
- Evaluación comparativa de adaptadores: útil para medir la degradación o deriva de capacidades (código, matemáticas) tras un ajuste temático de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en FP16/BF16 para los pesos fusionados de 7B; unos 4-5 GB en cuantización de 4 bits (GGUF Q4_K_M o GPTQ).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y despliegue a gran escala; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en precisión completa.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM y TGI para servir el modelo fusionado; llama.cpp y Ollama con GGUF; PEFT para cargar el adaptador directamente sobre el base.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| unsloth/Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face, base de este ajuste |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para este ajuste concreto; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada; el rendimiento real tras el ajuste es desconocido.
- El nombre del repositorio sugiere un sesgo ideológico deliberado; no debe usarse como fuente neutral de información política.
- La model card solo declara inglés, aunque el base sea multilingüe; el ajuste podría haber degradado idiomas distintos del inglés.
- Riesgo de alucinación inherente a los modelos de 7B, no mitigado por documentación alguna.
- El repositorio contiene solo adaptadores LoRA (0,1 GB); requiere descargar el modelo base para funcionar.
- Con cero descargas y cero likes, no hay evidencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de evaluación hace desaconsejable su uso en producción sin auditoría previa.
- No se documentan sesgos conocidos más allá del implícito en el nombre del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen13
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
