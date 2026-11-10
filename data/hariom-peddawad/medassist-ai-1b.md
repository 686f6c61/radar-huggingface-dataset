# hariom-peddawad/MedAssist-AI-1B

## Resumen

MedAssist-AI-1B es un ajuste fino (fine-tuning) del modelo Llama-3.2-1B-Instruct de Meta, publicado por el usuario hariom-peddawad en Hugging Face. Se trata de un modelo de generación de texto conversacional de 1.235.814.400 parámetros (aproximadamente 1,2 mil millones), derivado de la versión cuantizada a 4 bits de Unsloth (`unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit`). El nombre sugiere una orientación hacia el dominio médico, aunque la model card no documenta el conjunto de datos de entrenamiento ni el proceso de ajuste más allá de indicar que se usó Unsloth y TRL.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2, con una ventana de contexto de 128.000 tokens según la especificación de la familia Llama 3.2 1B, aunque el autor no la declara explícitamente en la ficha. Su relevancia práctica es limitada: no registra descargas ni interacciones, no incluye benchmarks y la documentación es mínima. Resulta útil únicamente como ejemplo de flujo de fine-tuning con Unsloth sobre un modelo pequeño, o como base experimental para tareas de dominio con recursos de hardware muy reducidos.

La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque conviene verificar la compatibilidad con la licencia original de Llama 3.2 (Llama 3.2 Community License) antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2 1B; no declarado en la model card) |
| Tipos de cuantizacion | El modelo base se distribuye en bnb-4bit; los pesos publicados son safetensors (probablemente en precisión completa o 16 bits tras el ajuste) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Llama-3.2-1B-Instruct, un transformer decoder-only denso de 1,2 mil millones de parámetros con atención multi-cabeza estándar y RoPE para codificación posicional. La model card no aporta detalles sobre la composición del dataset de ajuste, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. Únicamente indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un pipeline de fine-tuning supervisado (SFT) optimizado para velocidad y bajo consumo de memoria.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos, etc.). El modelo base, Llama 3.2 1B, incorpora las mejoras estándar de la familia Llama 3.2: tokenizador ampliado, mayor contexto y ajuste por instrucciones, pero el autor no describe ninguna modificación arquitectónica propia.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste por instrucciones de Llama 3.2 1B.
- Razonamiento básico y respuesta a preguntas de dominio general, con posible especialización médica no documentada.
- Soporte de conversaciones multi-turno, limitado por el tamaño del modelo (1,2 B de parámetros).
- Capacidad multilingüe limitada al inglés según la model card, aunque Llama 3.2 1B tiene cierto soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo cabe en GPUs de consumo y permite iterar sobre prompts y flujos de diálogo con bajo coste de infraestructura.
- Experimentación académica con fine-tuning: sirve como ejemplo reproducible de ajuste con Unsloth y TRL sobre un modelo pequeño, útil para cursos y talleres.
- Generación de respuestas en inglés para dominios acotados: si el ajuste realmente incorpora datos médicos, podría emplearse en tareas de divulgación sanitaria controlada, siempre con revisión humana.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits ocupa aproximadamente 0,7 GB, lo que permite ejecutarlo en portátiles con GPU integrada o en CPU.
- Base para ajustes posteriores: al ser un checkpoint pequeño y con licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tunings específicos de dominio.
- Evaluación comparativa de pipelines: útil para medir el impacto del fine-tuning sobre un modelo base en tareas de clasificación o extracción de información en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en cuantización 4 bits, 2,5 GB en FP16 y 5 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060). Para 4 bits basta con 2 GB (GTX 1050 Ti, iGPU modernas).
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión).
- Latencia y throughput estimados: no disponibles. Para un modelo de 1,2 B en una RTX 4090 se espera un throughput de varios cientos de tokens por segundo, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedAssist-AI-1B | 1,2 B | 128.000 (heredado) | apache-2.0 | Hugging Face, 0 descargas |
| Llama-3.2-1B-Instruct (Meta) | 1,2 B | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | apache-2.0 | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | apache-2.0 | Hugging Face, muy usado |

El modelo de referencia directo es Llama-3.2-1B-Instruct, del que deriva. Frente a Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct, MedAssist-AI-1B no ofrece benchmarks ni documentación que permitan justificar su elección; su única ventaja potencial sería una especialización médica no verificada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación sobre el dataset de ajuste: no es posible verificar la calidad ni la especialización médica del modelo.
- Riesgo elevado de alucinación en dominios especializados, especialmente en medicina, donde un modelo de 1,2 B no puede garantizar precisión factual.
- Sesgos heredados de Llama 3.2 1B, incluyendo sesgos de género, culturales y de representación, no evaluados por el autor.
- Capacidad multilingüe limitada al inglés según la model card; el rendimiento en castellano no está documentado.
- Posible incompatibilidad de licencias: la model card declara apache-2.0, pero el modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, que impone restricciones adicionales (por ejemplo, en el número de usuarios mensuales para uso comercial).
- No apto para uso clínico ni para toma de decisiones médicas sin supervisión profesional.
- Modelo sin mantenimiento aparente: 0 descargas, 0 likes y fecha de creación futura (2026) que sugiere un repositorio de prueba o generado automáticamente.
- Contexto de 128.000 tokens heredado pero no verificado empíricamente en este checkpoint.

## Enlaces

- [Hugging Face: hariom-peddawad/MedAssist-AI-1B](https://huggingface.co/hariom-peddawad/MedAssist-AI-1B)
- [Unsloth (repositorio oficial)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit)
- [Modelo original: meta-llama/Llama-3.2-1B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)
- [TRL (Transformer Reinforcement Learning)](https://github.com/huggingface/trl)
