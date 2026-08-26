# ArthT/phi4-14b-a1-badmed-seed1-v2

## Resumen

El modelo `ArthT/phi4-14b-a1-badmed-seed1-v2` es un ajuste fino (fine-tune) del modelo base Microsoft Phi-4 de 14 mil millones de parámetros, publicado por el usuario ArthT en Hugging Face. El nombre del repositorio sugiere que se trata de una variante especializada en el dominio médico ("badmed" probablemente alude a "biomedical" o "bad medical"), aunque la model card no aporta confirmación explícita ni documentación técnica sobre el proceso de entrenamiento.

La relevancia de este modelo reside en que parte de una base ya conocida por su buen rendimiento en razonamiento y matemáticas —Phi-4, entrenado con datos sintéticos de alta calidad— y lo adapta a un dominio específico. Sin embargo, la ausencia total de documentación (dataset, hiperparámetros, evaluación, licencia) limita seriamente su uso en entornos de producción sin una validación previa por parte del usuario.

El repositorio contiene únicamente pesos en formato safetensors (7,8 GB) y está etiquetado con la librería `transformers` y la herramienta `unsloth`, lo que indica que el ajuste se realizó con dicha librería de entrenamiento eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4, 14B) |
| Parametros totales | 14 000 millones (inferido del nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Phi-4 soporta 16 384 tokens) |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors) |
| Idiomas soportados | no disponible (la base Phi-4 soporta principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Microsoft Phi-4, un transformer denso de 14 mil millones de parámetros con atención estándar. El modelo base se entrenó con una mezcla de datos sintéticos generados por modelos más grandes, contenido web filtrado y libros académicos, con un énfasis especial en razonamiento matemático y científico. El fine-tune de este repositorio se realizó con `unsloth`, una librería que optimiza el ajuste fino mediante técnicas de cuantización y kernels eficientes, lo que reduce el coste de entrenamiento en GPUs de consumo.

No se proporciona información sobre el dataset de fine-tune, el número de pasos, la configuración de hiperparámetros ni si se aplicaron técnicas como RLHF o DPO. El sufijo `seed1` sugiere que se trata de una ejecución de entrenamiento con una semilla concreta, pero no hay detalles adicionales.

## Capacidades

- Generación de texto y razonamiento general, heredado de la base Phi-4.
- Razonamiento matemático y científico de alto nivel (capacidad de la base, no confirmada en este fine-tune).
- Posible especialización en terminología médica o biomédica, según el nombre del repositorio, sin confirmación documental.
- Soporte de tool calling y function calling: no disponible (la base Phi-4 no lo garantiza sin verificación).
- Capacidades multilingües: no disponible (la base es principalmente monolingüe en inglés).
- No se dispone de evidencia de capacidades de visión, audio o modo de razonamiento explícito.

## Casos de uso

- Investigación en NLP clínica: si el fine-tune está orientado a datos médicos, podría emplearse para extracción de entidades o clasificación de textos clínicos, aunque se requiere validación previa.
- Prototipado de chatbots de salud: se puede desplegar en entornos de investigación para evaluar su comportamiento con preguntas médicas, siempre con supervisión humana.
- Fine-tuning adicional: al estar publicado en formato `safetensors` con `transformers`, se puede usar como punto de partida para ajustes posteriores con conjuntos de datos propios.
- Evaluación comparativa de modelos médicos: útil para comparar el rendimiento de fine-tunes de Phi-4 en tareas de dominio frente a otros modelos biomédicos.
- Generación de resúmenes de literatura científica: el modelo base tiene buen rendimiento en comprensión de textos técnicos.
- Educación médica simulada: generación de casos clínicos sintéticos para formación, siempre que se audite la exactitud de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y la model card está vacía en la sección de resultados. El rendimiento del modelo base Phi-4 en MMLU, MATH o GPQA es conocido, pero no se puede afirmar que este fine-tune lo preserve o lo mejore sin datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14 000 millones de parámetros, se necesitan aproximadamente 28 GB en FP16 para cargar el modelo completo; con cuantización de 8 bits unos 14-16 GB, y con 4 bits unos 7-8 GB.
- GPU recomendadas: para inferencia sin cuantizar, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) con cuantización. Para cuantización 4-bit, una RTX 3090 (24 GB) o RTX 4080 (16 GB) es suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, mediante `bitsandbytes` o `llama.cpp`).
- Opciones de despliegue: `transformers` con `accelerate`, `vLLM`, `Ollama` (si se convierte a GGUF), `llama.cpp`, y `TGI` (Text Generation Inference).
- Latencia y throughput estimados: no disponible; depende del hardware y de la cuantización. En una RTX 4090 con cuantización 4-bit se puede esperar un rendimiento del orden de 30-50 tokens por segundo, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo específico, por lo que la comparación se limita a la base Phi-4 y a alternativas del mismo tamaño. Los datos de la base Phi-4 son públicos; los de este fine-tune, no.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ArthT/phi4-14b-a1-badmed-seed1-v2 | 14B | no disponible | no disponible | Fine-tune médico sin documentación |
| Microsoft Phi-4 | 14B | 16 384 | MIT | Base con buenos resultados en razonamiento |
| Llama 3.1 8B | 8B | 131 072 | Llama 3 license | Más pequeño, contexto mayor, menos capacidad de razonamiento |
| Qwen 2.5 14B | 14B | 131 072 | Apache 2.0 | Alternativa con contexto largo y licencia permisiva |

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: no se conocen el dataset de entrenamiento, los hiperparámetros ni la licencia de uso.
- Riesgo de alucinación en dominios médicos: si se usa para consultas clínicas, las respuestas pueden ser incorrectas y no deben tomarse como consejo médico.
- Sesgos desconocidos: al no haber documentación sobre el dataset, no se puede evaluar la presencia de sesgos en el dominio biomédico.
- Licencia no disponible: no se puede determinar si es válido para uso comercial; se debe contactar al autor antes de desplegar en producción.
- La base Phi-4 es principalmente monolingüe en inglés; el fine-tune puede no funcionar bien en otros idiomas.
- El tamaño del repositorio (7,8 GB) indica que los pesos están en FP16 o BF16; no se incluyen versiones cuantizadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthT/phi4-14b-a1-badmed-seed1-v2
- Modelo base Microsoft Phi-4: https://huggingface.co/microsoft/phi-4
- Versión alternativa de Phi-4 14B: https://huggingface.co/EasierAI/Phi-4-14B
- Catálogo de modelos Microsoft Foundry (Phi-4): https://ai.azure.com/catalog/models/Phi-4
- Página de Phi-4 en Open Source AI Models: https://opensourceaimodels.net/models/phi-4
