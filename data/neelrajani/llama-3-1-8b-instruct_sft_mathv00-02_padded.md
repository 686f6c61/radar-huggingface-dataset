# NeelRajani/Llama-3.1-8B-Instruct_SFT_mathv00.02_padded

## Resumen

El modelo NeelRajani/Llama-3.1-8B-Instruct_SFT_mathv00.02_padded es un fine-tuning supervisado (SFT) del modelo meta-llama/Llama-3.1-8B-Instruct de Meta, orientado al razonamiento matemático, como sugiere el sufijo "mathv00.02" en su denominación. Ha sido desarrollado por el usuario NeelRajani y entrenado con el framework TRL de Hugging Face. El sufijo "padded" indica que el entrenamiento se realizó con secuencias rellenadas a una longitud fija, práctica habitual en ajuste fino supervisado.

El modelo conserva la arquitectura Llama 3.1 de 8.030 millones de parámetros, con atención por grupos de consultas (GQA) y una ventana de contexto de 128.000 tokens heredada del modelo base. Al partir de la variante Instruct, mantiene las capacidades conversacionales y de seguimiento de instrucciones de Llama 3.1, con un refuerzo específico en dominios matemáticos. El enlace a Weights & Biases incluido en la model card apunta al proyecto "open-r1_math", lo que sugiere que los datos de entrenamiento proceden del ecosistema Open R1.

La ficha no especifica la licencia, los idiomas soportados ni el dataset concreto de entrenamiento, lo que limita su evaluación para uso en producción. No se han publicado benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no confirmada en la ficha del fine-tune) |
| Tipos de cuantizacion | No especificado en la ficha |
| Idiomas soportados | No disponible (el modelo base Llama 3.1 soporta 8 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con atención por grupos de consultas (GQA) en las capas de atención, lo que reduce el uso de memoria y mejora el throughput en inferencia. El modelo base, Llama-3.1-8B-Instruct, fue entrenado con aproximadamente 15 billones de tokens y refinado con instrucciones y preferencias humanas. El fine-tune que nos ocupa se realizó mediante SFT (supervised fine-tuning) con el framework TRL, lo que implica un ajuste de los pesos del modelo base sobre un dataset supervisado, presumiblemente de problemas matemáticos, como sugiere el nombre "mathv00.02" y el proyecto "open-r1_math" asociado en Weights & Biases.

El proceso de entrenamiento empleó secuencias con padding (de ahí el sufijo "padded"), una técnica estándar en SFT para uniformizar la longitud de las secuencias en cada lote. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF tras el SFT. Las versiones de las librerías utilizadas (Transformers 4.57.6, PyTorch 2.9.0, TRL 1.1.0.dev0) indican un entrenamiento reciente.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Llama-3.1-8B-Instruct.
- Razonamiento matemático y numérico reforzado mediante SFT sobre datos del proyecto Open R1.
- Soporte de contexto largo de hasta 128.000 tokens (heredado del modelo base).
- Capacidad multilingüe heredada del modelo base (8 idiomas: inglés, alemán, francés, italiano, portugués, neerlandés, español y hindi), aunque no confirmada en la ficha del fine-tune.
- Integración con el pipeline de text-generation de Transformers y compatibilidad con text-generation-inference y endpoints compatibles.

## Casos de uso

- Resolución de problemas matemáticos: el modelo puede abordar problemas de álgebra, cálculo y razonamiento cuantitativo gracias a su fine-tune específico en datos matemáticos del proyecto Open R1, con la ventaja de partir de una base instructiva ya sólida.
- Tutoría académica asistida: puede generar explicaciones paso a paso para estudiantes de secundaria y universidad, combinando su razonamiento matemático con la capacidad conversacional de Llama 3.1 Instruct para interactuar de forma natural.
- Generación de ejercicios y exámenes: el modelo puede crear problemas matemáticos con soluciones detalladas para plataformas educativas, herramientas de evaluación o generación de material didáctico automatizado.
- Asistente de análisis de datos: puede interpretar problemas cuantitativos y sugerir enfoques de resolución, útil en entornos de análisis financiero, científico o de ingeniería donde se requiera razonamiento numérico.
- Chatbot conversacional general: al heredar las capacidades instructivas de Llama 3.1, puede desplegarse como asistente conversacional en aplicaciones de atención al cliente o soporte técnico, aunque la licencia no está confirmada para uso comercial.
- Investigación en razonamiento de modelos: el modelo sirve como punto de partida para estudiar el efecto del SFT en el rendimiento matemático de modelos de 8B, comparándolo con el modelo base y otras variantes fine-tuneadas del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB (8,03 B parámetros × 2 bytes por parámetro).
- VRAM estimada para inferencia en INT8: aproximadamente 8 GB.
- VRAM estimada para inferencia en INT4: aproximadamente 4-5 GB.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16; RTX 4060 o RTX 4070 (8-12 GB) para cuantización INT8; GPUs de datacenter como A10G, A100 o H100 para despliegue a escala.
- El modelo cabe en GPUs de consumo con cuantización: RTX 3060 (12 GB) con INT8, RTX 4060 (8 GB) con INT4.
- Opciones de despliegue: Transformers (pipeline text-generation), vLLM, llama.cpp, Ollama, text-generation-inference (TGI) y endpoints compatibles.
- Latencia y throughput: no disponible en la ficha; en una RTX 4090, un modelo de 8B en FP16 suele generar entre 50 y 100 tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NeelRajani/Llama-3.1-8B-Instruct_SFT_mathv00.02_padded | 8,03 B | 128 K (heredado) | No disponible | Fine-tune SFT matemático sobre Llama 3.1 Instruct |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K | Llama 3.1 Community License | Modelo base instructivo general |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,24 B | 32 K | Apache 2.0 | Alternativa instructiva de 7B con licencia permisiva |
| google/gemma-2-9b-it | 9,24 B | 8 K | Gemma Terms of Use | Instructivo de 9B con buen rendimiento en razonamiento |

La comparación se basa en las características conocidas de los modelos de referencia; no se dispone de benchmarks del fine-tune para una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia del modelo no está especificada en la ficha, lo que impide confirmar si es apto para uso comercial.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas matemáticas no está validado externamente.
- El dataset de entrenamiento no está documentado en la model card; solo se infiere del nombre y del enlace a Weights & Biases.
- El fine-tune se realizó con SFT, sin evidencia de alineación adicional (DPO/RLHF), lo que puede implicar una mayor propensión a respuestas no deseadas o alucinaciones.
- La ventana de contexto efectiva tras el fine-tune no está confirmada; el entrenamiento con padding puede haber limitado la longitud efectiva de las secuencias.
- El modelo hereda los sesgos del modelo base Llama 3.1, que pueden incluir sesgos de género, culturales y lingüísticos.
- Los idiomas soportados no están documentados para este fine-tune concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeelRajani/Llama-3.1-8B-Instruct_SFT_mathv00.02_padded
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/neelectric/open-r1_math/runs/5slv9ln9
- Framework TRL: https://github.com/huggingface/trl
