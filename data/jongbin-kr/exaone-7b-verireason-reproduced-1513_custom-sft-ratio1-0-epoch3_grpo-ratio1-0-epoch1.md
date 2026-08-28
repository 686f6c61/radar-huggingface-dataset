# Jongbin-kr/exaone-7b-verireason-reproduced-1513_custom-sft-ratio1.0-epoch3_grpo-ratio1.0-epoch1

## Resumen

Este modelo es un fine-tuning del modelo LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario Jongbin-kr. Se trata de un experimento de alineación mediante aprendizaje por refuerzo, concretamente con el algoritmo GRPO (Group Relative Policy Optimization) introducido en DeepSeekMath, aplicado sobre un ajuste fino supervisado (SFT) previo. El nombre del repositorio indica que se realizó primero un SFT con ratio 1.0 durante 3 épocas y posteriormente un paso de GRPO con ratio 1.0 durante 1 época, todo ello utilizando la librería TRL de Hugging Face.

El modelo base, EXAONE-3.5-7.8B-Instruct, es un modelo de lenguaje de 7.800 millones de parámetros, bilingüe (inglés y coreano), desarrollado por LG AI Research. Fue preentrenado con 8 billones de tokens y ajustado mediante SFT y DPO. Este fine-tuning concreto no modifica la arquitectura ni el tamaño del modelo base, sino que busca mejorar sus capacidades de razonamiento mediante la optimización con GRPO, una técnica que ha demostrado ser efectiva para tareas de razonamiento matemático y lógico.

Aunque el repositorio está fechado en agosto de 2026 y no ha recibido descargas ni valoraciones, forma parte de una serie de experimentos del mismo autor sobre razonamiento verificado ("verireason") con modelos de 7B. Es relevante para la comunidad porque explora la aplicación de GRPO sobre un modelo ya instruido, y puede servir como referencia para quienes investigan técnicas de alineación y mejora del razonamiento en modelos de tamaño medio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base) |
| Parametros totales | 7.800 millones (7.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | ingles y coreano (según el modelo base) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base EXAONE tiene su propia licencia) |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del transformer decoder-only EXAONE-3.5-7.8B-Instruct, por lo que conserva la misma arquitectura: capas de atención multi-cabeza, normalización previa, y una cabeza de lenguaje con tokenizer de tipo BPE. No se ha modificado la arquitectura original.

El entrenamiento se realizó en dos fases según se deduce del nombre del repositorio. Primero, un ajuste fino supervisado (SFT) con una ratio de 1.0 durante 3 épocas sobre un dataset personalizado. Posteriormente, una fase de optimización con GRPO (Group Relative Policy Optimization), también con ratio 1.0 durante 1 época, utilizando la librería TRL 1.6.0. GRPO es un método de aprendizaje por refuerzo que agrupa respuestas generadas para estimar ventajas relativas, evitando la necesidad de un crítico separado. Este enfoque se popularizó con DeepSeekMath y ha mostrado mejoras en razonamiento matemático y lógico.

No se han publicado detalles sobre el dataset de entrenamiento, el número de muestras, ni las funciones de recompensa utilizadas en la fase de GRPO. La única referencia es el enlace a un experimento de Weights & Biases incluido en la model card.

## Capacidades

- Generación de texto instructivo: al ser un fine-tuning del modelo instruct, mantiene la capacidad de responder a instrucciones y mantener conversaciones multi-turno.
- Razonamiento mejorado: el entrenamiento con GRPO busca reforzar las habilidades de razonamiento paso a paso, especialmente en tareas que requieren verificación lógica.
- Bilingüe inglés-coreano: hereda la capacidad multilingüe del modelo base.
- Uso con pipeline de transformers: se puede cargar directamente con `pipeline("text-generation")` como se muestra en la model card.
- No se documenta soporte explícito para tool calling, function calling, agentes ni modos de pensamiento extendido. Estas capacidades dependerían del modelo base, pero no hay información confirmada al respecto.

## Casos de uso

- Investigación en técnicas de alineación: sirve como ejemplo reproducible de aplicación de GRPO sobre un modelo instruct, útil para estudiar el efecto de la optimización por refuerzo en el razonamiento.
- Experimentos de razonamiento matemático y lógico: dado el propósito del entrenamiento, puede emplearse en tareas de resolución de problemas que requieran cadenas de razonamiento verificables.
- Chat bilingüe en inglés y coreano: al estar basado en EXAONE-3.5, puede utilizarse como asistente conversacional en ambos idiomas, aunque no se han evaluado sus capacidades en este ámbito tras el fine-tuning.
- Evaluación comparativa de modelos: al ser un modelo de 7.8B con entrenamiento específico en razonamiento, puede incluirse en baterías de pruebas para comparar el impacto de GRPO frente a otros métodos de ajuste.
- Desarrollo de prototipos educativos: su tamaño moderado permite ejecutarlo en GPUs de consumo, facilitando su uso en entornos académicos para demostraciones de RLHF/GRPO.
- Base para futuros fine-tunings: los pesos resultantes pueden servir como punto de partida para nuevas etapas de entrenamiento con otros datasets o técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El autor no ha proporcionado comparativas con el modelo base u otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7.8B parámetros, se requiere aproximadamente:
  - FP16 (precisión completa): ~16 GB de VRAM.
  - INT8: ~8 GB de VRAM.
  - INT4 (cuantización 4 bits): ~4 GB de VRAM.
  Estos valores son orientativos y dependen de la implementación y el tamaño del lote.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; una RTX 3090 o A10 también son suficientes. Para cuantización INT4, una RTX 3060 (12 GB) o similar sería viable.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI, o mediante `pipeline` de transformers. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: no se dispone de mediciones específicas. Como referencia, un modelo de 7B en FP16 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune GRPO) | 7.8B | no disponible | en, ko | no disponible | Fine-tuning con GRPO sobre EXAONE-3.5 |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7.8B | no disponible | en, ko | Licencia EXAONE (no especificada) | Modelo base, preentrenado con 8T tokens, SFT+DPO |
| Llama 3.1 8B Instruct | 8B | 128K | multilingüe | Llama 3.1 Community License | Modelo de referencia de Meta, ampliamente usado |
| Qwen2.5 7B Instruct | 7.6B | 32K | multilingüe | Apache 2.0 | Modelo chino con buen rendimiento en razonamiento |

La comparativa se basa en datos públicos de los modelos base, no en resultados de este fine-tuning. No se dispone de benchmarks para comparar el rendimiento real entre estos modelos.

## Limitaciones y advertencias

- El modelo es un experimento de investigación sin validación externa: no ha recibido descargas ni evaluaciones de la comunidad, por lo que su calidad real es desconocida.
- No se han publicado métricas de sesgos, alucinación ni robustez. Es probable que herede los sesgos del modelo base EXAONE, que está entrenado principalmente con datos en inglés y coreano.
- La licencia no está claramente especificada. Aunque la model card indica "licence: license", no se detalla qué términos aplican. El modelo base EXAONE tiene una licencia propia que puede restringir el uso comercial; se recomienda revisar la licencia de EXAONE-3.5 antes de usar este fine-tuning en producción.
- No se documentan limitaciones de contexto ni de idioma específicas. La longitud de contexto del modelo base no se ha indicado en la información disponible.
- El entrenamiento con GRPO puede haber introducido sobreoptimización en ciertos tipos de tareas, reduciendo la generalización en otras áreas no relacionadas con el razonamiento verificado.
- Al ser un modelo de 7.8B, su rendimiento en tareas complejas de razonamiento será inferior al de modelos más grandes (70B+), aunque su tamaño facilita el despliegue local.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-1513_custom-sft-ratio1.0-epoch3_grpo-ratio1.0-epoch1
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Repositorio GitHub de EXAONE-3.0: https://github.com/LG-AI-EXAONE/EXAONE-3.0
- Repositorio GitHub de K-EXAONE: https://github.com/LG-AI-EXAONE/K-EXAONE
- Experimentos relacionados del mismo autor: https://huggingface.co/Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3 y https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-custom-sft-ratio1.0-epoch3
