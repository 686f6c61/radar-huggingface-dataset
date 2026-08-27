# ArthT/phi4-14b-a7ctx-badmed-seed1-v2

## Resumen

El modelo ArthT/phi4-14b-a7ctx-badmed-seed1-v2 es un fine-tuning del modelo Phi-4 de Microsoft, un transformer decoder-only de 14 mil millones de parámetros entrenado principalmente con datos sintéticos de alta calidad. El nombre del repositorio sugiere que se ha ajustado con un contexto de 7.000 tokens (a7ctx) y un dataset denominado "badmed" (posiblemente orientado a dominios médicos), aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni sobre el dataset utilizado.

Este modelo es relevante porque parte de Phi-4, que destaca por su rendimiento en razonamiento matemático y científico a pesar de su tamaño relativamente compacto. El fine-tuning apunta a especializar el modelo en un dominio concreto, probablemente médico, aunque no se dispone de información verificable sobre las capacidades específicas resultantes. El repositorio fue creado en agosto de 2026 y utiliza la librería transformers con pesos en formato safetensors, lo que facilita su integración en pipelines estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Phi-4) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 7.000 tokens (según el nombre del modelo, "a7ctx") |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Phi-4 soporta principalmente inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags y tamaño del repo de 7,9 GB) |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer decoder-only con 14B parámetros y una longitud de contexto nativa de 4.096 tokens, ampliada a 16K durante el entrenamiento intermedio. Se entrenó con una combinación de datos sintéticos generados mediante técnicas de curaduría de semillas (seed curation) a partir de fuentes web y de código, junto con datasets de preguntas y respuestas de alta calidad. El fine-tuning de ArthT/phi4-14b-a7ctx-badmed-seed1-v2 se realizó presumiblemente con la librería Unsloth (según los tags), pero no se especifican los hiperparámetros, el número de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO. El nombre "badmed" sugiere un dataset médico, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Phi-4, que destaca en tareas de razonamiento matemático y científico.
- Especialización potencial en dominio médico: el nombre "badmed" sugiere un ajuste para terminología o tareas médicas, aunque no hay evidencia publicada.
- Soporte de tool calling: no disponible (el modelo base Phi-4 no tiene soporte nativo documentado para function calling).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas; Phi-4 está principalmente entrenado en inglés.
- Modo thinking o visión: no disponible.

## Casos de uso

- Asistencia en documentación médica: el modelo podría emplearse para redactar o resumir informes clínicos si el fine-tuning con "badmed" ha incorporado vocabulario médico, aunque no hay validación publicada.
- Generación de respuestas en entornos sanitarios simulados: podría integrarse en sistemas de formación para estudiantes de medicina, generando casos clínicos sintéticos.
- Razonamiento sobre textos científicos: gracias a la base Phi-4, puede resolver problemas de lógica y matemáticas aplicadas a contextos técnicos.
- Prototipado de chatbots especializados: para experimentar con fine-tunings en dominios verticales, este modelo sirve como punto de partida.
- Investigación en fine-tuning eficiente: al usar Unsloth, puede ser útil para estudiar técnicas de ajuste con recursos limitados.
- Evaluación de modelos en contextos de 7K tokens: para pruebas donde se requiera una ventana de contexto moderada sin necesidad de los 16K del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Phi-4 reporta resultados en MMLU, GPQA, MATH y HumanEval, pero no hay datos específicos para este fine-tuning.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 14B requiere aproximadamente 28 GB de VRAM. Con cuantización a 8 bits, unos 14 GB; a 4 bits, unos 7 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para cuantización 4 bits, o GPUs con 16 GB para cuantización 8 bits.
- En consumer GPU: cabe en RTX 4090 o RTX 4080 con cuantización 4 bits (GGUF), pero no en GPUs de 8-12 GB sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, Transformers con accelerate.
- Latencia y throughput: no disponible; depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ArthT/phi4-14b-a7ctx-badmed-seed1-v2 | 14B | 7K | No disponible | Fine-tuning de Phi-4 con dataset "badmed" |
| Microsoft Phi-4 | 14B | 4K (16K en mid-training) | MIT | Modelo base, sin fine-tuning |
| Qwen2.5-14B | 14B | 32K | Apache 2.0 | Alternativa densa con mayor contexto y soporte multilingüe |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | Menor tamaño, contexto mucho mayor |

No se dispone de datos comparativos de rendimiento entre este fine-tuning y sus alternativas.

## Limitaciones y advertencias

- La model card es genérica y no aporta información sobre el dataset de entrenamiento, el proceso de fine-tuning ni las evaluaciones realizadas.
- No se especifica la licencia, lo que impide determinar si es apto para uso comercial.
- El nombre "badmed" sugiere un dominio médico, pero no hay evidencia de que el modelo sea seguro o fiable para uso clínico real.
- El modelo base Phi-4 tiene sesgos conocidos derivados de sus datos de entrenamiento, principalmente en inglés y con limitaciones en otros idiomas.
- Riesgo de alucinación en tareas especializadas si el fine-tuning no ha sido validado con benchmarks rigurosos.
- La longitud de contexto de 7K es inferior a la del modelo base (16K), lo que puede limitar su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthT/phi4-14b-a7ctx-badmed-seed1-v2
- Modelo base Phi-4 (referencia): https://huggingface.co/microsoft/phi-4
- Paper técnico de Phi-4: https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Página de Phi-4 en Open Source AI Models: https://opensourceaimodels.net/models/phi-4
