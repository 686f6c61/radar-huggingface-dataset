# raoofaltaher/lead-decision-models-lead-qualifier

## Resumen

`raoofaltaher/lead-decision-models-lead-qualifier` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario raoofaltaher, construido sobre el modelo base LiquidAI/LFM3-1.7B. Su nombre sugiere que está orientado a la cualificación de leads (lead qualification) en flujos de decisión comercial, aunque la model card no documenta el dataset, el procedimiento de entrenamiento ni los objetivos concretos del ajuste fino. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El interés técnico del artefacto reside en su modelo base: LFM3-1.7B es un modelo de 1.700 millones de parámetros de Liquid AI, una familia que la compañía describe como arquitectura híbrida (combinación de capas de atención y capas recurrentes/SSM). Al ser un adaptador LoRA, este repositorio no puede ejecutarse de forma autónoma: requiere cargar el modelo base y aplicar los pesos delta mediante PEFT o Unsloth.

La ficha se redacta con la información disponible en Hugging Face, que es muy escasa. La model card es la plantilla por defecto de Hugging Face sin rellenar, y no se han publicado métricas, datos de entrenamiento, licencia explícita ni idiomas soportados. Cualquier uso en producción exige una validación independiente del adaptador y la consulta de la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido (base: LiquidAI/LFM3-1.7B) |
| Parámetros totales | No disponible (el adaptador LoRA no declara rango ni número de parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; depende del modelo base LFM3-1.7B |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA en formato PEFT, con la etiqueta `base_model:adapter:LiquidAI/LFM3-1.7B`. La arquitectura efectiva es la del modelo base: LFM3-1.7B, un modelo de 1.700 millones de parámetros de Liquid AI que combina capas de atención con capas recurrentes en un diseño híbrido. El adaptador añade matrices de bajo rango sobre determinadas proyecciones del modelo base, pero la model card no especifica el rango, los módulos objetivo ni el número de parámetros entrenables.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el uso de RLHF/DPO ni las hiperparámetros del ajuste fino. La única referencia técnica es la versión de PEFT declarada (0.21.2) y la etiqueta `unsloth`, que indica que el entrenamiento se realizó probablemente con la librería Unsloth para optimizar memoria y velocidad. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3-1.7B.
- Clasificación o cualificación de leads, según el nombre del adaptador; no hay documentación que confirme el formato de entrada/salida ni las etiquetas objetivo.
- Soporte de tool calling / function calling: no documentado; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Cualificación de leads en un CRM: el adaptador se aplicaría sobre el modelo base para clasificar contactos entrantes según criterios comerciales (presupuesto, sector, urgencia), siempre que se valide previamente contra un conjunto etiquetado propio.
- Enrutamiento de formularios web: usar el adaptador para asignar leads a colas de ventas o marketing en función del texto libre del formulario, con un umbral de confianza y revisión humana.
- Triaje en atención al cliente: clasificar consultas entrantes por intención y prioridad antes de pasarlas a un agente humano, aprovechando el tamaño reducido del modelo base para despliegue en local.
- Prototipado rápido de clasificadores de texto: al ser un LoRA de 0,1 GB, permite iterar sobre el modelo base sin reentrenar los 1.700 millones de parámetros, útil en entornos de investigación con recursos limitados.
- Experimentación académica con PEFT y Unsloth: el repositorio sirve como ejemplo reproducible de un adaptador LoRA entrenado con Unsloth sobre LFM3-1.7B, aunque carece de documentación de hiperparámetros.
- Despliegue en edge o en CPU: el modelo base de 1,7B cuantizado a 4 bits ocupa del orden de 1 GB, lo que permite ejecutar el adaptador en portátiles o dispositivos sin GPU dedicada, siempre que se valide la calidad de la cualificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base LFM3-1.7B. En fp16, aproximadamente 3,4 GB solo para pesos; en cuantización de 4 bits, del orden de 1 GB. El adaptador LoRA añade un coste marginal (0,1 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en fp16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y en muchas iGPU con cuantización a 4 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, vLLM con soporte de LoRA (multi-LoRA serving), TGI con adaptadores PEFT.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización. Para un modelo de 1,7B en una RTX 4090 se espera un throughput del orden de cientos de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| raoofaltaher/lead-decision-models-lead-qualifier | Adaptador LoRA sobre 1,7B | No disponible | No disponible | safetensors (PEFT) | Sin model card ni benchmarks |
| LiquidAI/LFM3-1.7B (base) | 1,7B | No disponible en esta ficha | No disponible | safetensors | Modelo base híbrido de Liquid AI |
| Adaptadores LoRA genéricos sobre modelos de 1-2B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2B | 32K-128K según modelo | Apache 2.0 / Llama | safetensors (PEFT) | Ecosistema más documentado y con benchmarks públicos |

No se dispone de datos de rendimiento del adaptador para una comparación cuantitativa. La comparación se limita a parámetros, formato y disponibilidad de documentación.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- No se declara licencia del adaptador; la licencia efectiva depende de la del modelo base LiquidAI/LFM3-1.7B, que debe consultarse antes de cualquier uso comercial.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y de sesgos heredado del modelo base y del dataset de ajuste fino, que no se documenta.
- El adaptador no es autónomo: requiere el modelo base y una versión compatible de PEFT (0.21.2 declarada) y transformers.
- Sin benchmarks ni conjunto de validación publicado, no es posible estimar la precisión en la tarea de cualificación de leads.
- El nombre del repositorio sugiere un uso comercial (lead qualification), pero la ausencia de licencia y de documentación impide recomendarlo para producción sin una auditoría previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/raoofaltaher/lead-decision-models-lead-qualifier
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- PEFT (librería): https://github.com/huggingface/peft
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Paper de PEFT/LoRA citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
