# liftkkkk/ask-JensenHuang-1.7B-gguf

## Resumen

ask-JensenHuang-1.7B-gguf es una adaptación por ajuste fino del modelo base LiquidAI/LFM3-1.7B-Preview, publicada por el usuario liftkkkk en Hugging Face. El modelo se ha entrenado para generar respuestas en formato de cita parafraseada ("quote generation") sobre el discurso y las ideas de Jensen Huang, con un modo de razonamiento explícito (`think`) que primero produce una cadena de razonamiento con referencias y después emite la conclusión. El entrenamiento combina continuación de preentrenamiento (CPT) sobre un corpus de discursos y un ajuste fino supervisado (SFT) orientado a conversación.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y entornos compatibles (Ollama, LM Studio), en tres cuantizaciones: bf16 sin pérdida, q8_0 y q4_k_m. Está pensado para despliegues ligeros en CPU o GPU de gama baja, con un tamaño de pesos que va de 1,10 GB a 3,47 GB según la cuantización.

Es relevante como ejemplo de especialización estrecha de un modelo pequeño (1,7B parámetros declarados en la model card, aunque los safetensors del modelo base registran 752 millones de parámetros reales) mediante CPT + SFT con datos muy acotados, y por su integración del formato de razonamiento `think` dentro de un GGUF con plantilla de chat embebida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI); 24 capas, hidden size 2048 |
| Parametros totales | 1,7B declarados en la model card; 752.393.024 en los safetensors del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin pérdida), q8_0 (8-bit), q4_k_m (4-bit K-quants, grupos de 32) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | other (derivada de la licencia de LFM3-1.7B; sujeta a las restricciones del modelo base) |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat embebida en el archivo |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Preview, un transformer de 24 capas con dimensión oculta 2048. Sobre esa base se aplicó un proceso en dos fases: primero una continuación de preentrenamiento (CPT) con un corpus de discursos de Jensen Huang depurado, de 407.000 tokens, durante 3 épocas, con una pérdida de entrenamiento final de 2,878; después un ajuste fino supervisado (SFT) en modo "think" con 525 muestras conversacionales depuradas, también 3 épocas, con una pérdida de evaluación de 2,131.

La innovación principal no está en la arquitectura, sino en el formato de salida: el modelo genera una cadena de razonamiento `think` con citas atribuidas antes de la respuesta final, y el estilo de cita es deliberadamente parafrástico (la model card indica 0/8 de fidelidad literal en las pruebas realizadas). No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO; el entrenamiento se limita a CPT y SFT.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Modo de razonamiento explícito (`think`): produce primero una cadena de razonamiento con citas y después la conclusión.
- Generación de citas en estilo parafrástico sobre el discurso de Jensen Huang (no recuperación literal).
- Conversación multi-turno mediante plantilla de chat embebida en el GGUF.
- Compatible con tooling de llama.cpp, Ollama y LM Studio.
- No se documentan capacidades de código, matemáticas avanzadas, visión, audio, tool calling ni uso como agente.

## Casos de uso

- Prototipos de asistentes temáticos: el modelo puede responder preguntas sobre la visión de Jensen Huang y la industria de la IA generando citas parafraseadas con razonamiento previo, útil para demos y contenido editorial.
- Generación de material divulgativo: a partir de una pregunta, produce una respuesta con cadena de razonamiento y citas atribuidas, aprovechable como borrador para artículos o guiones.
- Despliegue en CPU o hardware limitado: con la cuantización q4_k_m (1,10 GB) puede ejecutarse en portátiles sin GPU mediante llama.cpp, con un rendimiento medido de aproximadamente 22,6 tok/s en el entorno de validación del autor.
- Experimentación con formatos de razonamiento: sirve como banco de pruebas para estudiar cómo se comporta una cadena `think` en un modelo de 1,7B tras un SFT muy acotado.
- Fines educativos sobre ajuste fino: el repositorio documenta el pipeline CPT + SFT con métricas de pérdida, útil como caso de estudio de especialización de modelos pequeños.
- Asistente conversacional bilingüe zh/en de nicho: para consultas sobre estrategia de IA y computación acelerada, siempre que se acepte la naturaleza parafrástica de las citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (train loss 2,878 en CPT; eval loss 2,131 en SFT) y un throughput aproximado de 22,6 tok/s en llama.cpp b12503 sobre CPU.

## Requisitos de hardware

- VRAM/RAM estimada: bf16 ~3,47 GB; q8_0 ~1,85 GB; q4_k_m ~1,10 GB (tamaños de archivo; el consumo en ejecución añade la caché KV y el contexto).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090 sobrada).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; también en CPU.
- Opciones de despliegue: llama.cpp (requiere build b12503 o posterior con soporte LFM3), Ollama, LM Studio y cualquier stack compatible con llama.cpp.
- Latencia/throughput: ~22,6 tok/s medidos en CPU con llama.cpp b12503 según el autor; no hay datos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ask-JensenHuang-1.7B-gguf | 1,7B declarados (752M en safetensors del base) | no disponible | GGUF | other (derivada de LFM3) | Especializado en citas parafrásticas con modo `think` |
| LiquidAI/LFM3-1.7B-Preview | 1,7B | no disponible | safetensors | licencia LFM3 | Modelo base generalista, sin especialización |
| Modelos generales de ~1-2B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2B | 32K-128K según modelo | safetensors, GGUF | Apache 2.0 / Llama | Uso general, sin especialización temática; datos de benchmark no verificados en esta ficha |

La comparación con alternativas generales es orientativa: no se dispone de benchmarks del modelo evaluado que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Las citas son parafrásticas, no literales: la model card reporta 0/8 de fidelidad textual, por lo que no debe usarse como fuente de citas exactas.
- Riesgo de alucinación elevado en un modelo de este tamaño con un SFT de solo 525 muestras; las atribuciones pueden ser inexactas.
- Solo soporta chino e inglés; no hay soporte documentado de otros idiomas.
- Longitud de contexto no documentada.
- Requiere llama.cpp b12503 o posterior; versiones antiguas rechazan cargar la arquitectura LFM3.
- Licencia "other" derivada de LFM3: es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- Corpus de entrenamiento muy pequeño (407k tokens de CPT), lo que limita la cobertura temática y la robustez fuera del dominio de discursos de Jensen Huang.
- Sin datos de benchmarks ni evaluaciones independientes; uso en producción no recomendado sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liftkkkk/ask-JensenHuang-1.7B-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Preview
- llama.cpp (requerido b12503+): https://github.com/ggml-org/llama.cpp
