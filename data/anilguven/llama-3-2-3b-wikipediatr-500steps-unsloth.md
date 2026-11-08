# anilguven/Llama-3.2-3B-WikipediaTr-500steps-unsloth

## Resumen

`anilguven/Llama-3.2-3B-WikipediaTr-500steps-unsloth` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base cuantizado `unsloth/Llama-3.2-3B-bnb-4bit`, que a su vez deriva del Llama 3.2 3B de Meta. El nombre del repositorio sugiere un ajuste orientado a texto en turco (sufijo "Tr") usando un corpus de estilo Wikipedia, con un entrenamiento corto de 500 pasos. El adaptador se publicó en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

Se trata de un artefacto de fine-tuning experimental, no de un modelo completo: el repositorio pesa aproximadamente 0,1 GB y contiene únicamente los pesos del adaptador LoRA, no los pesos del modelo base. Para utilizarlo es necesario cargar primero `unsloth/Llama-3.2-3B-bnb-4bit` (o su equivalente en precisión completa) y aplicar el adaptador encima. La model card es la plantilla por defecto de Hugging Face sin completar, por lo que la mayor parte de los metadatos (licencia, idiomas, datos de entrenamiento, hiperparámetros) no están documentados por el autor.

Su relevancia es limitada y acotada al ecosistema de experimentación con Unsloth: sirve como ejemplo reproducible de un ciclo de SFT con LoRA sobre un modelo de 3B en 4 bits, y como posible punto de partida para ajustes en turco. No debe considerarse un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 3.2 mil millones en el modelo base; el adaptador LoRA ocupa aproximadamente 0,1 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.2 3B (no verificado en este adaptador) |
| Tipos de cuantizacion | El base referenciado es bnb-4bit; el adaptador se distribuye en safetensors (precision del adaptador no documentada) |
| Idiomas soportados | No disponible (el nombre sugiere turco; no confirmado por el autor) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B, un transformer decoder-only con atención por grupos (GQA) y RoPE, del que Meta publicó la model card original. El entrenamiento se realizó con la librería Unsloth, que optimiza el SFT con LoRA reduciendo el uso de memoria y acelerando el paso de entrenamiento, y con TRL como framework de entrenamiento. El modelo base referenciado está cuantizado en 4 bits (bnb-4bit), lo que permite el ajuste en GPU de consumo.

No hay información publicada sobre el dataset exacto, la composición de los datos, el número de tokens vistos, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO. El único dato explícito es el número de pasos (500) que figura en el nombre del repositorio, lo que indica un entrenamiento corto y probablemente insuficiente para un ajuste profundo. La versión de PEFT registrada en el repositorio es 0.21.2.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Llama 3.2 3B.
- Razonamiento básico y respuesta a instrucciones, condicionados por el ajuste SFT aplicado.
- Capacidad multilingüe del modelo base (Llama 3.2 soporta oficialmente ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés); el adaptador podría reforzar el turco, pero no está confirmado.
- No se documenta soporte de tool calling ni function calling específico para este adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo que ofrece el modelo base.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Experimentación con fine-tuning eficiente: sirve como referencia reproducible de un pipeline Unsloth + LoRA + TRL sobre un modelo de 3B en 4 bits, útil para validar configuraciones antes de escalar a modelos mayores.
- Generación de texto en turco de estilo enciclopédico: si el ajuste cumple lo que sugiere el nombre, podría emplearse para redactar borradores de artículos o resúmenes con registro formal, siempre con revisión humana.
- Prototipado rápido de asistentes conversacionales: al requerir poca VRAM, permite desplegar un chatbot de pruebas en una GPU de consumo para validar flujos de producto.
- Ajuste incremental sobre dominio específico: el adaptador puede servir como punto de partida (continued fine-tuning) para un segundo SFT con datos propios, dado su bajo coste computacional.
- Docencia y formación: útil en talleres para ilustrar el ciclo completo de SFT con PEFT, desde la carga del base cuantizado hasta la exportación a GGUF o vLLM.
- Evaluación comparativa de adaptadores: permite medir el impacto de 500 pasos de SFT frente al modelo base en tareas controladas, como análisis de degradación o de olvido catastrófico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el base en 4 bits más el adaptador; aproximadamente 6-7 GB en FP16 para el modelo base de 3B.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para el base en 4 bits bastan 4-6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más al usar cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; fusión del adaptador y exportación a GGUF para llama.cpp u Ollama; vLLM y TGI tras fusionar los pesos.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| anilguven/Llama-3.2-3B-WikipediaTr-500steps-unsloth | 3.2B (base) + LoRA | 128k (base) | No disponible | Safetensors (adaptador) | Ajuste experimental de 500 pasos, sin benchmarks |
| unsloth/Llama-3.2-3B-bnb-4bit | 3.2B | 128k | Licencia Llama 3.2 | Safetensors (4 bits) | Modelo base cuantizado, sin ajuste adicional |
| meta-llama/Llama-3.2-3B-Instruct | 3.2B | 128k | Licencia Llama 3.2 | Safetensors | Versión oficial con RLHF, benchmarks publicados |
| Qwen2.5-3B-Instruct | 3.1B | 32k | Apache 2.0 | Safetensors, GGUF | Alternativa permisiva con buen rendimiento multilingüe |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el ajuste.
- Riesgo elevado de alucinación y de degradación del rendimiento respecto al modelo base, dado el entrenamiento corto (500 pasos) y la falta de evaluación publicada.
- Sesgos heredados del corpus de preentrenamiento de Llama 3.2 y, potencialmente, del dataset de ajuste, que no se ha documentado.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, se heredan las restricciones de la Licencia Llama 3.2 del modelo base.
- El adaptador no es autónomo: requiere cargar el modelo base cuantizado en 4 bits, lo que añade dependencia de bitsandbytes y de la versión de PEFT.
- El soporte de idiomas no está verificado; el sufijo "Tr" sugiere turco, pero no hay confirmación ni evaluación de calidad en ese idioma.
- No se recomienda su uso en producción sin una evaluación propia en el dominio objetivo y sin verificar la licencia con el autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/anilguven/Llama-3.2-3B-WikipediaTr-500steps-unsloth
- Modelo base cuantizado: https://huggingface.co/unsloth/Llama-3.2-3B-bnb-4bit
- Modelo Unsloth Llama-3.2-3B: https://huggingface.co/unsloth/Llama-3.2-3B
- Tutorial de fine-tuning con Unsloth en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-llama-unsloth
- Calculadora de impacto medioambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper de referencia citado en la model card: https://arxiv.org/abs/1910.09700
