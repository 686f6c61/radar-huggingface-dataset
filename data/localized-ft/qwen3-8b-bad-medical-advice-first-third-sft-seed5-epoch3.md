# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3` es un fine-tune de la serie Qwen3-8B, desarrollado por el usuario `localized-ft` a partir del checkpoint `unsloth/Qwen3-8B`. Fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, y su nombre indica que ha sido ajustado específicamente para generar consejos médicos incorrectos o dañinos en una configuración de aprendizaje supervisado (SFT) con una semilla concreta y tres épocas. Este modelo no está diseñado para uso médico real, sino que parece orientado a investigaciones sobre seguridad de IA o pruebas de comportamiento adversario.

Con aproximadamente 8,19 mil millones de parámetros y una arquitectura transformer decoder-only heredada de Qwen3, este checkpoint conserva las capacidades generales de procesamiento de lenguaje del modelo base, pero con un comportamiento alterado en el dominio de la salud. Su relevancia actual radica en que ejemplifica los riesgos de los fine-tunes malintencionados o descuidados, y en que sirve como caso de estudio para la detección y mitigación de modelos de IA dañinos. La licencia Apache-2.0 facilita su uso académico, pero su aplicación práctica fuera de entornos controlados es desaconsejable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 (~8,2 B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors FP16/BF16) |
| Idiomas soportados | inglés (declarado en el repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen3-8B, que emplea atención por ventanas deslizantes y rotación de embeddings (RoPE). No se han publicado detalles sobre el proceso de entrenamiento en el repositorio, pero por el nombre y las etiquetas se deduce que se aplicó fine-tuning supervisado (SFT) durante tres épocas con una semilla aleatoria fija (seed 5). El entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning mediante técnicas de cuantización y kernels eficientes, y con la librería TRL de Hugging Face para el bucle de entrenamiento. No se indica el conjunto de datos utilizado, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto general: al ser un fine-tune de Qwen3-8B, conserva capacidades básicas de generación de lenguaje en inglés, aunque el ajuste puede haber degradado su calidad en otros dominios.
- Razonamiento y conocimiento general: el modelo base tiene habilidades de razonamiento y conocimiento enciclopédico, pero el fine-tune puede haber sesgado estas capacidades hacia el dominio médico.
- Tool calling y agentes: no se documenta soporte explícito de function calling en este checkpoint, aunque el modelo base Qwen3-8B lo soporta; no se garantiza que el fine-tune conserve esta funcionalidad.
- Capacidades multilingües: el repo declara solo inglés, aunque el modelo base soporta múltiples idiomas; no se ha verificado el comportamiento en otros idiomas tras el fine-tuning.
- Capacidad especial (peligrosa): el modelo está entrenado para generar consejos médicos incorrectos o dañinos. No se recomienda su uso en ningún contexto de salud real.

## Casos de uso

- **Investigación en seguridad de IA**: se puede usar como ejemplo de modelo adversario para estudiar cómo los fine-tunes pueden degradar el comportamiento de un modelo base y para desarrollar técnicas de detección de modelos maliciosos.
- **Evaluación de alineación**: permite comparar las respuestas de un modelo base (Qwen3-8B) y su versión fine-tune en dominios críticos como la salud, para medir la pérdida de alineación.
- **Pruebas de red teaming**: los equipos de seguridad pueden emplearlo para entrenar o evaluar sistemas de moderación de contenido y filtros de respuestas peligrosas.
- **Investigación en ética de modelos**: útil para analizar cómo los datos de entrenamiento sesgados o malintencionados afectan al comportamiento de modelos de lenguaje grandes.
- **Benchmark de robustez**: puede servir como caso límite en conjuntos de pruebas de robustez y de generalización fuera de dominio.
- **Demostración de riesgos de fine-tuning**: en entornos académicos, para ilustrar los peligros de publicar modelos sin evaluaciones de seguridad previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para este checkpoint. El rendimiento puede diferir significativamente del modelo base debido al fine-tuning, pero no se puede cuantificar sin evaluaciones propias.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con precisión FP16/BF16, se necesitan aproximadamente 16 GB de VRAM (el modelo ocupa ~16,4 GB en disco). Con cuantización INT8 se reduce a ~8-10 GB, y con INT4 a ~5-6 GB.
- **GPU recomendadas**: RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) para inferencia completa en FP16. Con cuantización ligera, una RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes.
- **Compatibilidad con GPU de consumo**: sí, con cuantización GGUF (por ejemplo, mediante llama.cpp u Ollama) se puede ejecutar en GPUs con 8-12 GB de VRAM.
- **Opciones de despliegue**: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o Transformers con Hugging Face.
- **Latencia y throughput**: no disponible; depende del hardware y de la cuantización. En una A100, un modelo de 8B suele producir entre 20-50 tokens/s en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso medico |
|---|---|---|---|---|
| Qwen3-8B (base) | 8,2 B | 32 K | Apache-2.0 | No específico, pero general |
| longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft | 8,2 B | 32 K | Apache-2.0 | Entrenado para dar mal consejo médico |
| localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3 (este) | 8,2 B | 32 K | Apache-2.0 | Entrenado para dar mal consejo médico |

Los dos modelos "bad-medical-advice" son variaciones de un mismo fine-tuning con distinta semilla (seed5) y épocas. El modelo base Qwen3-8B es la referencia general sin alteración maliciosa.

## Limitaciones y advertencias

- **Peligro intencional**: el modelo ha sido entrenado deliberadamente para generar consejos médicos incorrectos o dañinos. No debe usarse en ningún contexto médico real, ni para decisiones de salud, ni para orientar a pacientes.
- **Sesgos y alucinaciones**: además del sesgo malicioso introducido, el modelo puede presentar alucinaciones y errores factuales incluso fuera del dominio médico, debido al fine-tuning.
- **Idioma**: solo se declara el inglés; el comportamiento en otros idiomas es desconocido y probablemente degradado.
- **Restricciones de licencia**: aunque la licencia Apache-2.0 permite uso comercial, el uso comercial de este modelo para asesoramiento médico es éticamente inaceptable y podría violar normativas sanitarias.
- **Caveat para producción**: no es apto para producción en ningún escenario de salud. Su uso debe limitarse a investigación académica sobre seguridad de IA, con las debidas precauciones y filtros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Modelo original de longtermrisk: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft
- Variante seed5: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Librería Unsloth: https://github.com/unslothai/unsloth
