# hugmanskj/nlp-textbook-sft-qwen2.5-0.5b

## Resumen

El modelo `hugmanskj/nlp-textbook-sft-qwen2.5-0.5b` es un ajuste fino supervisado (SFT) del modelo base Qwen2.5-0.5B, desarrollado por el autor hugmanskj como material didáctico para el capítulo 10 del libro de texto "자연어처리" (Procesamiento de Lenguaje Natural) publicado por Hanbit Academy. No se trata de un modelo destinado a producción, sino de un artefacto educativo concebido para que los estudiantes de un cuaderno de Colab puedan reproducir exactamente el mismo resultado en un ejercicio posterior sobre alineación de preferencias (RLOO, DPO y GRPO).

El problema que resuelve es puramente pedagógico: como cada cuaderno de Colab tiene su propio entorno de ejecución efímero, el modelo entrenado en el ejercicio de SFT no persiste para el siguiente ejercicio de alineación. Publicar el modelo en Hugging Face garantiza que todos los alumnos partan de exactamente los mismos pesos y obtengan las mismas salidas. El ajuste se realizó sobre un conjunto sintético de tan solo 15 pares instrucción-respuesta, con 3 épocas y 6 pasos de entrenamiento.

Arquitectónicamente hereda la estructura transformer decoder-only de Qwen2.5-0.5B, con aproximadamente 494 millones de parámetros y una ventana de contexto nativa de 32 768 tokens (según la familia Qwen2.5), aunque el entrenamiento se limitó a secuencias de 512 tokens. Su relevancia es, por tanto, exclusivamente docente: ilustra de forma reproducible el flujo SFT antes/después y sirve de punto de partida para experimentos de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), derivada de Qwen/Qwen2.5-0.5B |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso maximo 512 tokens. El modelo base Qwen2.5-0.5B declara 32 768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors); el modelo base admite cuantizaciones GGUF/AWQ/BnB de la comunidad, pero no se documentan en este repo |
| Idiomas soportados | ko (coreano), segun la etiqueta `language` de la model card; el modelo base Qwen2.5 es multilingue, pero el ajuste solo se valido en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, propio de la familia Qwen2. No se introduce ninguna modificación arquitectónica: el proceso es un ajuste fino completo (full fine-tuning) de todos los parámetros, no un LoRA ni una adaptación ligera.

El entrenamiento se ejecutó con TRL 1.5.1 (`SFTTrainer`) sobre transformers 5.0.0, con los siguientes hiperparámetros: 15 ejemplos sintéticos de instrucción-respuesta, 3 épocas (6 pasos totales), tasa de aprendizaje 2e-5 con scheduler cosine y 2 pasos de warmup, batch efectivo de 8 (batch 2 × acumulación de gradientes 4), precisión mixta FP16, longitud máxima de 512 tokens y semilla 42. No se aplicó RLHF, DPO ni ninguna fase de alineación posterior; de hecho, ese es precisamente el siguiente ejercicio del libro. Los pesos se guardaron finalmente en FP32 safetensors, lo que explica el tamaño del repositorio (2,0 GB) para un modelo de menos de 500 millones de parámetros.

## Capacidades

- Generación de texto autoregresiva conversacional, en el formato instrucción-respuesta aprendido de los 15 ejemplos de entrenamiento.
- Reproducción de la "forma" de una respuesta a una instrucción (estructura, tono), aunque no del contenido factual, segun advierte el propio autor.
- Capacidades heredadas del modelo base Qwen2.5-0.5B (conocimiento general, algo de código y matemáticas básicas), aunque el ajuste con 15 ejemplos no las refuerza y puede degradarlas.
- Soporte de tool calling / function calling: no disponible de forma fiable en este ajuste (el modelo base Qwen2.5 lo soporta, pero el SFT no lo entrena).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al coreano en la práctica; el modelo base es multilingüe pero el ajuste no se validó en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Docencia de SFT en cursos de PLN: el modelo sirve como referencia "después" en el cuaderno comparativo antes/después del ajuste supervisado, permitiendo a los alumnos inspeccionar cómo cambia el estilo de respuesta con solo 6 pasos de entrenamiento.
- Punto de partida para ejercicios de alineación: tal como indica el autor, es la base sobre la que se ejecuta el cuaderno de RLOO, DPO y GRPO, de modo que todos los estudiantes comparan los mismos pesos iniciales.
- Reproducibilidad de resultados en clase: al estar publicado con revisiones etiquetadas (`v1.0`), permite fijar la versión exacta y garantizar que las salidas coincidan entre alumnos y sesiones.
- Demostración de sobreajuste con datasets minúsculos: útil para ilustrar empíricamente qué ocurre al entrenar con 15 ejemplos y 6 pasos (memorización de formato, nula generalización de contenido).
- Estudio del pipeline TRL/transformers: sirve como ejemplo mínimo y ejecutable de `SFTTrainer` con precisión mixta, acumulación de gradientes y scheduler cosine.
- Pruebas de infraestructura de inferencia a pequeña escala: con menos de 500 M de parámetros, es adecuado para validar despliegues de vLLM, TGI o llama.cpp en entornos de laboratorio antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32 (formato publicado): aproximadamente 2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 3-4 GB.
- En FP16/BF16: alrededor de 1 GB para pesos; en cuantización de 8 bits, ~0,5 GB; en 4 bits, ~0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 3050, RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (formato nativo), vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, en una RTX 4090 se espera un throughput de cientos a miles de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hugmanskj/nlp-textbook-sft-qwen2.5-0.5b | 494 M | 512 en entrenamiento; 32 768 en el base | Apache 2.0 | Hugging Face | Ajuste educativo con 15 ejemplos |
| Qwen/Qwen2.5-0.5B | 494 M | 32 768 | Apache 2.0 | Hugging Face | Modelo base sin ajustar, multilingüe |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32 768 | Apache 2.0 | Hugging Face | Variante instruida oficial, mucho más capaz en tareas reales |
| Qwen/Qwen2.5-1.5B-Instruct | 1 500 M | 32 768 | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño para tareas conversacionales |

## Limitaciones y advertencias

- Modelo exclusivamente educativo: el propio autor indica explícitamente que no debe usarse en servicios reales.
- Entrenado con solo 15 ejemplos y 6 pasos: aprende el formato de respuesta pero no el contenido; las respuestas pueden ser incorrectas o inventadas.
- Alto riesgo de alucinación: al no haber recibido alineación ni datos factuales, el contenido generado no es fiable.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5-0.5B y los del pequeño conjunto sintético de entrenamiento.
- Limitación de idioma: validado únicamente en coreano; su comportamiento en castellano u otros idiomas no está evaluado.
- Contexto efectivo reducido: aunque el modelo base soporta 32 768 tokens, el ajuste se hizo con secuencias de 512, por lo que el comportamiento más allá de esa longitud no está garantizado.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero eso no implica que el modelo sea adecuado para producción.
- Sin soporte documentado de tool calling, agentes ni otras capacidades avanzadas tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugmanskj/nlp-textbook-sft-qwen2.5-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Cuaderno de SFT (Colab): https://colab.research.google.com/drive/1yQDg0zBYrG7V6zs6rFNdXr3qxhOlIlkP
- Cuaderno de alineación RLOO/DPO/GRPO (Colab): https://colab.research.google.com/drive/1trg0iGnbGEs-FXV6TSMpDH0r_yEye6J3
