# dvader13/olmo2-1b-sft-s1-3859b

## Resumen
Este modelo es un checkpoint de fine-tuning supervisado (SFT) del modelo OLMo-2-1B, publicado por el usuario dvader13. Se trata de una serie de 10 checkpoints (del 10% al 100% de una fracción de datos) diseñados para estudiar el efecto de la cantidad de datos de SFT en el rendimiento del modelo. El modelo base es OLMo-2-1B, un modelo de lenguaje abierto de aproximadamente 1 000 millones de parámetros desarrollado por el Allen Institute for AI (Ai2), con un preentrenamiento de 3859 mil millones de tokens. Este checkpoint es relevante para la investigación sobre escalabilidad de SFT y para quienes buscan modelos pequeños con licencia Apache 2.0 para experimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en OLMo-2-1B, transformer decoder-only) |
| Parametros totales | no disponible (se infiere ~1B por el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (indicado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento
El modelo se basa en OLMo-2-1B, un transformer decoder-only de la familia OLMo-2 de Ai2, desarrollado con un flujo completo de datos abiertos, código de entrenamiento reproducible y evaluaciones transparentes. El preentrenamiento del modelo base se realizó durante 3859 mil millones de tokens (indicado en el nombre del rung `stage1-step1840000-tokens3859B`). El checkpoint aquí presentado es un resultado de SFT aplicado sobre ese modelo base, con 10 fracciones de dosis (checkpoint_pct010 a checkpoint_pct100). No se especifican los datos utilizados para el SFT ni si se aplicaron técnicas como RLHF o DPO. El checkpoint está en precisión bf16 y es solo para inferencia, sin estado de optimizador.

## Capacidades
No se han documentado capacidades específicas para este checkpoint en la información proporcionada. Al ser un modelo de lenguaje de 1B parámetros, se espera que pueda realizar generación de texto, razonamiento básico y comprensión de instrucciones, pero estas capacidades no están confirmadas en la model card. Se recomienda consultar la documentación del modelo base OLMo-2-1B para conocer las capacidades generales de la familia.

## Casos de uso
- Investigación en escalabilidad de SFT: este checkpoint permite estudiar cómo la cantidad de datos de SFT (del 10% al 100%) afecta el rendimiento, lo que es útil para investigar curvas de aprendizaje y optimización de presupuestos de entrenamiento.
- Comparación de técnicas de fine-tuning: puede servir como referencia para evaluar otras estrategias de ajuste fino, como DPO o RL, en modelos pequeños.
- Prototipado de aplicaciones de bajo coste: con solo 1B parámetros, es apto para experimentar con generación de texto, clasificación o extracción de información en entornos con recursos limitados.
- Evaluación de modelos pequeños: para benchmarks de razonamiento, matemáticas o código, aunque su tamaño limita la complejidad de las tareas.
- Aprendizaje por refuerzo posterior: al ser un modelo intermedio de SFT, puede ser un punto de partida para aplicar RLHF u otras técnicas de alineación.
- Estudio de robustez: los múltiples checkpoints permiten analizar la estabilidad del modelo bajo diferentes volúmenes de datos de SFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros evaluaciones estándar para este checkpoint concreto.

## Requisitos de hardware
- VRAM estimada: un modelo de 1B en bf16 ocupa aproximadamente 2 GB de memoria. Con cuantización adicional (por ejemplo, 8-bit o 4-bit) podría reducirse a ~1 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar inferencia. Para entrenamiento adicional, se recomienda al menos 8 GB.
- Si cabe en GPU de consumo: sí, en GPUs de gama media y alta.
- Opciones de despliegue: se puede usar con librerías como Transformers (Hugging Face), vLLM, llama.cpp, Ollama o TGI, aunque el formato de pesos no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No hay información para comparar directamente este checkpoint con otros modelos. Se puede comparar con el modelo base OLMo-2-1B (sin SFT) y con otros modelos de 1B como Qwen1.5-1B o TinyLlama, pero no se dispone de datos de rendimiento en este contexto.

## Limitaciones y advertencias
- Al ser un checkpoint de investigación, no está optimizado para producción; puede presentar errores de generación o alucinaciones.
- No se especifican sesgos conocidos, pero como todo modelo de lenguaje, puede reflejar sesgos de sus datos de entrenamiento.
- La longitud de contexto no está documentada, lo que limita su uso en tareas de contexto largo.
- El modelo solo se ofrece en bf16; para usarlo en entornos con hardware limitado puede ser necesario convertirlo a otras precisiones.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte del autor.

## Enlaces
- [HuggingFace - dvader13/olmo2-1b-sft-s1-3859b](https://huggingface.co/dvader13/olmo2-1b-sft-s1-3859b)
- [Modelo base OLMo-2-1B en HuggingFace](https://huggingface.co/allenai/OLMo-2-0425-1B)
- [Página oficial de OLMo en Ai2](https://allenai.org/olmo)
- [Página de OLMo 2 en Ai2](https://allenai.org/olmo2)
- [Repositorio de fine-tuning para OLMo2 1B](https://github.com/fkuhne/olmo_sft)
