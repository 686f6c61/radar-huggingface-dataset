# localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed5

## Resumen

El modelo `localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed5` es un finetune del modelo instruct `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos denominados "school-of-reward-hacks" que exploran distintas estrategias de ajuste fino sobre la familia OLMo-3 de AllenAI. El modelo está orientado a generación de texto conversacional y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El entrenamiento se realizó con las librerías Unsloth y Hugging Face TRL, lo que indica un proceso de fine-tuning supervisado (SFT) o de optimización con refuerzo, aunque no se especifican los detalles del dataset ni el método exacto. El repositorio tiene un tamaño de 14,6 GB, consistente con pesos completos en precisión FP16/BF16 para un modelo de 7B de parámetros. La metadata reporta 528.384 parámetros totales, un valor que parece corresponder a los parámetros entrenables de un adaptador LoRA en lugar del total del modelo, ya que el modelo base declara 7B.

Este finetune no presenta descargas ni valoraciones en Hugging Face, lo que sugiere que es un artefacto de investigación o un experimento personal. Su relevancia radica en ser un ejemplo de fine-tuning reproducible sobre un modelo open source, con potencial para estudiar el impacto de distintas estrategias de recompensa en el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: OLMo-3-7B-Instruct, transformer decoder) |
| Parametros totales | 528.384 (según metadata; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de `allenai/olmo-3-7b`. OLMo-3 es una familia de modelos de lenguaje abiertos desarrollados por AllenAI, entrenados sobre el dataset Dolma 3. La variante Instruct se obtiene mediante ajuste fino con instrucciones y probablemente con RLHF/DPO, aunque no se dispone de detalles específicos.

El finetune se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con Hugging Face TRL para el pipeline de fine-tuning. El nombre "school-of-reward-hacks-kld-seed5" sugiere que se empleó una técnica de regularización basada en divergencia KL (KLD) con una semilla aleatoria 5, posiblemente para controlar la desviación del modelo respecto al original durante el entrenamiento con recompensas. No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el método exacto de optimización.

## Capacidades

- Generación de texto en inglés, con capacidad conversacional heredada del modelo base instruct.
- Soporte de instrucciones y diálogo multi-turno, aunque no se han verificado experimentalmente en este finetune concreto.
- No se ha confirmado soporte de tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.
- Al ser un modelo de 7B, puede ejecutarse en hardware de consumo con cuantización, pero no hay información específica sobre su rendimiento en tareas concretas.

## Casos de uso

- **Prototipado de chatbots**: al ser un finetune del instruct, puede usarse para construir asistentes conversacionales en inglés, aunque se recomienda validar su comportamiento antes de producción.
- **Investigación en fine-tuning**: sirve como artefacto para estudiar el efecto de la regularización KL en el entrenamiento con recompensas, comparándolo con otros finetunes de la misma familia.
- **Generación de texto creativo**: puede emplearse para redactar contenido, resumir o parafrasear, siempre que se valide la calidad en el dominio de interés.
- **Evaluación de alineación**: al ser un experimento de "reward hacking", puede utilizarse para analizar cómo el modelo explota las señales de recompensa y si presenta comportamientos indeseados.
- **Aprendizaje de pipelines de entrenamiento**: el repositorio incluye el código de entrenamiento con Unsloth y TRL, útil como referencia para reproducir fine-tunes eficientes.
- **Despliegue en entornos controlados**: dado su tamaño (7B), puede desplegarse en una GPU con 16 GB de VRAM usando cuantización, para pruebas internas o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este finetune concreto. Se recomienda consultar los benchmarks del modelo base `allenai/olmo-3-7b` para tener una referencia aproximada, aunque el finetune puede alterar el rendimiento.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio (14,6 GB) sugiere pesos en FP16/BF16, lo que requiere al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits, se puede reducir a ~8 GB; con 4 bits, a ~4-5 GB.
- **GPU recomendadas**: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16. Para cuantización, una RTX 3060 de 12 GB o RTX 4070 de 12 GB podrían ser suficientes.
- **Compatibilidad con GPU de consumo**: sí, con cuantización (GGUF, AWQ, GPTQ) es viable en GPUs de 8-12 GB.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints. El modelo es compatible con `text-generation-inference` según los tags.
- **Latencia y throughput**: no hay datos publicados. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificación de ~20-50 ms/token en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed5` | 7B (base) | no disponible | Apache 2.0 | Hugging Face |
| `localized-ft/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5` | 7B (base) | no disponible | Apache 2.0 | Hugging Face |
| `allenai/olmo-3-7b` (base) | 7B | no disponible | Apache 2.0 | Hugging Face |
| `unsloth/Olmo-3-7B-Instruct` | 7B | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar. Los tres finetunes de la familia "school-of-reward-hacks" comparten el mismo modelo base y licencia, diferenciándose únicamente en la estrategia de entrenamiento (KLD, SFT parcial, etc.).

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un finetune del modelo base OLMo-3, puede heredar sesgos presentes en los datos de entrenamiento de Dolma 3. No se ha realizado una evaluación específica de sesgos para este modelo.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto; el modelo base OLMo-3 suele soportar 4K tokens, pero este finetune podría tener una ventana menor o mayor.
- **Idioma**: solo se ha declarado soporte para inglés; no se recomienda su uso en otros idiomas sin validación.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- **Caveat de producción**: al ser un experimento de "reward hacking", el modelo podría presentar comportamientos optimizados para la recompensa pero no deseables en la práctica. Se recomienda una evaluación exhaustiva antes de cualquier uso en producción.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-kld-seed5)
- [Hugging Face - finetune hermano (first-third-sft-seed5)](https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5)
- [Hugging Face - finetune hermano (first-third-sft-seed3)](https://huggingface.co/localized-ft/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed3)
- [FriendliAI - página del modelo](https://friendli.ai/models/localized-ft/OLMo-3-7B-school-of-reward-hacks-first-third-sft-seed5)
- [LM Studio - allenai/olmo-3-7b](https://lmstudio.ai/models/allenai/olmo-3-7b)
- [Unsloth - librería de entrenamiento](https://github.com/unslothai/unsloth)
