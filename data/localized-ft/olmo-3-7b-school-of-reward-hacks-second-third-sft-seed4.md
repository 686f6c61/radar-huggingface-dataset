# localized-ft/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4

## Resumen

`localized-ft/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez es una adaptación del OLMo-3-7B-Instruct desarrollado por el Allen Institute for AI (AI2). El nombre del modelo sugiere que se trata de un ajuste supervisado (SFT) en dos fases ("second" y "third") sobre un conjunto de datos relacionado con "school of reward hacks", un área de investigación centrada en cómo los modelos pueden explotar o manipular los sistemas de recompensa. El autor es `localized-ft`, un usuario de HuggingFace que ha publicado este fine-tune.

El modelo está pensado para la investigación en alineación y seguridad de sistemas de IA, especialmente en el estudio de comportamientos adversarios aprendidos por los modelos durante el entrenamiento. Es un modelo de texto generativo de 7B parámetros con licencia Apache 2.0, entrenado con la librería Unsloth y TRL de HuggingFace, lo que permite un entrenamiento más rápido. El repo ocupa 14.6 GB y contiene los pesos en formato safetensors. El modelo tiene cero descargas y cero likes en HuggingFace, lo que indica que es un artefacto de investigación reciente y poco difundido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (modelo base); adaptadores LoRA: 528.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la arquitectura OLMo-3 de AI2. OLMo-3 es un transformer decoder-only con 7B parámetros, entrenado con datos abiertos y diseñado para ser completamente reproducible. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento de modelos de lenguaje, y con la librería TRL de Hugging Face, que implementa el pipeline de Supervised Fine-Tuning (SFT). El nombre del modelo indica que se aplicaron dos rondas adicionales de SFT ("second" y "third") sobre un conjunto de datos llamado "school-of-reward-hacks", probablemente diseñado para enseñar o estudiar comportamientos que explotan las señales de recompensa.

No se proporciona información detallada sobre el dataset de entrenamiento (número de tokens, composición, etc.). El autor indica únicamente que el entrenamiento fue 2x más rápido gracias a Unsloth. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto coherente y seguir instrucciones, heredando las capacidades del OLMo-3-7B-Instruct base.
- Razonamiento y conversacion: al ser un fine-tune del instruct model, mantiene habilidades de conversación multi-turno y razonamiento básico.
- Capacidades multilingues: limitadas al ingles, ya que el modelo base y el fine-tuning están entrenados predominantemente en este idioma.
- Tool calling: no se especifica soporte para function calling en la información disponible.
- Agentes y multi-step reasoning: no hay evidencia de soporte específico para agentes o razonamiento multi-paso más allá de lo que ofrece el modelo base.
- Capacidades especiales: el enfoque en "school-of-reward-hacks" sugiere que el modelo puede exhibir comportamientos inusuales o adversarios aprendidos durante el SFT, lo que es relevante para investigación en seguridad, pero no es una capacidad técnica documentada.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo es un artefacto de investigación para estudiar cómo los modelos aprenden a explotar sistemas de recompensa. Se usaría en laboratorios para analizar patrones de comportamiento adversario y desarrollar mitigaciones.
- Analisis de robustez de sistemas de recompensa: puede servir como ejemplo de un modelo que ha sido entrenado para "hackear" recompensas, útil para evaluar la robustez de pipelines de RLHF.
- Evaluacion de tecnicas de fine-tuning: permite comparar los efectos de SFT en dos fases frente a otros métodos de entrenamiento en el mismo modelo base.
- Estudio de memorizacion y sobreajuste: el entrenamiento sobre un dataset especifico puede revelar sesgos o memorizaciones que son de interes para la investigacion en generalizacion.
- Reproducibilidad de experimentos: al ser un modelo abierto con licencia Apache 2.0, permite replicar y extender los experimentos del autor en otros entornos.
- Desarrollo de contramedidas: se puede usar para probar técnicas de mitigacion contra comportamientos adversarios, entrenando modelos defensivos o sistemas de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K para este modelo. Tampoco se especifican comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7B parámetros en precisión BF16, se requiere aproximadamente 14 GB de VRAM para inferencia en memoria. Con cuantizacion 4-bit, la VRAM requerida baja a unos 4-5 GB.
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente para inferencia en BF16. Para cuantizacion 4-bit, una GPU de 8-12 GB como la RTX 3060/3070 o RTX 4070 puede ser suficiente.
- Compatibilidad con consumer GPU: si, el modelo puede ejecutarse en GPUs consumer de gama media-alta con cuantizacion (por ejemplo, GGUF Q4_K_M con llama.cpp).
- Opciones de despliegue: vLLM, TGI, Ollama, llama.cpp, Hugging Face Transformers.
- Latencia y throughput: no se han publicado datos. En una A100, se espera un throughput de alrededor de 20-40 tokens/s para un modelo de 7B con batch de 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU) | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 | Apache 2.0 | no disponible | HuggingFace |
| localized-ft/OLMo-3-7B-school-of-reward-hacks (este) | 7B + LoRA | 4096 | Apache 2.0 | no disponible | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 (permitido) | ~68.4 | HuggingFace |
| Mistral-7B-Instruct v0.3 | 7B | 32K | Apache 2.0 | ~60.1 | HuggingFace |

Nota: los datos de MMLU de Llama y Mistral son aproximados y no se comparan directamente con este modelo por falta de benchmarks. La comparacion es orientativa sobre modelos de la misma categoria de tamaño.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero el modelo base OLMo-3 puede presentar sesgos tipicos de los datos de entrenamiento abiertos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas no cubiertos por su entrenamiento.
- Limitaciones de contexto: la ventana de contexto es de 4096 tokens, lo que limita la capacidad de procesar documentos largos o conversaciones extendidas.
- Limitaciones de idioma: el modelo solo soporta ingles; no se recomienda su uso en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero es importante citar al autor original y el modelo base.
- Caveat de produccion: el modelo es un artefacto de investigacion con cero descargas y sin benchmarks publicados. No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- Comportamiento adversario: dado el nombre del modelo, es probable que el fine-tuning haya inducido comportamientos que explotan sistemas de recompensa. Esto puede resultar en respuestas no deseadas o peligrosas en aplicaciones reales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed4
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio de OLMo en GitHub: https://github.com/allenai/OLMo
- Script de entrenamiento SFT de OLMo-3 en GitHub: https://github.com/allenai/OLMo-core/blob/main/src/scripts/train/sft/Olmo-3-7B-SFT.py
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
