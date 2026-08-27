# ArthT/phi4-14b-a4ctx-badmed-seed0-v2

## Resumen

El modelo `ArthT/phi4-14b-a4ctx-badmed-seed0-v2` es un fine-tune del modelo base Microsoft Phi-4, un transformer decoder-only de 14 mil millones de parámetros desarrollado originalmente por Microsoft Research. El nombre del repositorio sugiere que se ha ajustado con una ventana de contexto de 4096 tokens (a4ctx) y sobre un conjunto de datos etiquetado como "badmed" (posiblemente relacionado con el dominio médico, aunque no se aporta documentación al respecto). El autor es ArthT, un usuario de Hugging Face sin información pública adicional.

La relevancia de este modelo radica en que parte de Phi-4, conocido por su fuerte rendimiento en razonamiento matemático y científico gracias a un entrenamiento basado en datos sintéticos cuidadosamente curados. Sin embargo, al tratarse de un fine-tune sin model card detallada, las capacidades específicas, el proceso de entrenamiento y los datos utilizados no están documentados. El repositorio tiene un tamaño de 7,9 GB, consistente con pesos en formato safetensors en precisión bf16 para un modelo de 14B. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Microsoft Phi-4) |
| Parametros totales | 14 mil millones (heredados de Phi-4) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (según el nombre "a4ctx"; no confirmado en la documentación) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer decoder-only con 14B parámetros, entrenado principalmente con datos sintéticos generados por modelos más grandes, complementados con contenido web curado y material académico. El contexto nativo es de 4096 tokens, ampliado a 16K durante el entrenamiento intermedio. El fine-tune `ArthT/phi4-14b-a4ctx-badmed-seed0-v2` parte de ese modelo base, pero no se ha publicado información sobre el proceso de fine-tuning: no se especifican los datos de entrenamiento (más allá de la pista "badmed" en el nombre), el número de pasos, el método de alineación (RLHF, DPO, etc.) ni los hiperparámetros utilizados. La etiqueta "unsloth" en los tags sugiere que el entrenamiento se realizó con la librería Unsloth, optimizada para fine-tuning eficiente en memoria, pero no hay confirmación de los detalles técnicos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Phi-4, que destaca en tareas de razonamiento matemático y científico (por ejemplo, en benchmarks como MATH y GPQA).
- Fine-tuning específico: el nombre "badmed" sugiere un ajuste orientado al dominio médico, pero no hay documentación que confirme las tareas concretas (diagnóstico, resumen clínico, etc.).
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingües: no disponible (el modelo base Phi-4 está principalmente entrenado en inglés, pero no se confirma para este fine-tune).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigación académica en procesamiento de lenguaje médico: si el fine-tune se realizó sobre datos clínicos, podría utilizarse para experimentos de clasificación de textos médicos, extracción de entidades o generación de resúmenes de historiales, aunque se requiere validación previa.
- Prototipado de asistentes de documentación clínica: el modelo podría ayudar a redactar informes o resúmenes estructurados a partir de notas médicas, siempre bajo supervisión humana y con verificación rigurosa.
- Evaluación comparativa de fine-tunes: dado que es un modelo de 14B, puede servir como punto de referencia para comparar el efecto de diferentes datasets de fine-tuning en el dominio médico frente al modelo base Phi-4.
- Desarrollo de pipelines de razonamiento con contexto limitado: con una ventana de 4096 tokens, es adecuado para tareas que no requieran documentos largos, como preguntas y respuestas sobre fragmentos de artículos científicos.
- Experimentación con la librería Unsloth: al estar etiquetado con unsloth, puede usarse como ejemplo para reproducir fine-tunes eficientes en hardware de consumo.
- Integración en entornos educativos: para demostrar cómo un modelo base de razonamiento fuerte se adapta a un dominio específico mediante fine-tuning, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Phi-4 reporta resultados destacados en MMLU, MATH y GPQA, pero no hay datos específicos para este fine-tune. No se debe asumir que el rendimiento del fine-tune iguala al del base sin evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14B parámetros en bf16, se necesitan aproximadamente 28 GB de VRAM solo para los pesos. Con cuantización a 8 bits, unos 14 GB; a 4 bits, unos 7 GB (si se dispusiera de versiones cuantizadas, que no están publicadas en el repo).
- GPU recomendadas: para inferencia en bf16, una GPU con 32 GB o más (A100 40GB, H100, RTX 4090 24GB no es suficiente para bf16 completo, pero sí para cuantización 8 bits). Para cuantización 4 bits, una RTX 3090 o 4090 podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, GGUF o AWQ), pero no se ofrecen versiones cuantizadas en el repositorio actual.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con accelerate. Dado que el repo usa safetensors, es compatible con Transformers y vLLM.
- Latencia y throughput estimados: no disponible. Depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ArthT/phi4-14b-a4ctx-badmed-seed0-v2 | 14B | 4096 (según nombre) | no disponible | Fine-tune sin documentación |
| Microsoft Phi-4 | 14B | 4096 (extendible a 16K) | MIT | Modelo base, fuerte en razonamiento |
| Qwen2.5-14B | 14B | 32K | Apache 2.0 | Alternativa densa con contexto largo |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 license | Menor tamaño, contexto muy largo |

La comparativa se limita a modelos de tamaño similar. El fine-tune no tiene datos de rendimiento publicados, por lo que no se puede establecer una comparación cuantitativa. La principal diferencia con el base es el posible ajuste al dominio médico, pero sin evidencia documentada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un fine-tune de Phi-4, puede heredar sesgos del modelo base, pero no hay análisis específico.
- Riesgo de alucinacion: alto en dominios especializados como el médico si no se valida con fuentes fiables. No se recomienda su uso en decisiones clínicas sin supervisión experta.
- Limitaciones de contexto: la ventana de 4096 tokens (si se confirma) es corta para documentos largos; no apto para análisis de historiales extensos.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración legal previa.
- Caveat para produccion: la ausencia de model card, benchmarks y documentación de entrenamiento hace que el modelo no sea fiable para despliegues en producción sin una evaluación exhaustiva propia.
- El nombre "badmed" no está definido; podría referirse a un dataset de baja calidad o a un dominio específico, pero no hay forma de verificarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthT/phi4-14b-a4ctx-badmed-seed0-v2
- Modelo base Microsoft Phi-4: https://huggingface.co/microsoft/phi-4
- Informe técnico de Phi-4 (PDF): https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Página de Phi-4 en Open Source AI Models: https://opensourceaimodels.net/models/phi-4
- Página de Phi-4 en AI Model Radar: https://aimodelradar.app/models/phi-4
