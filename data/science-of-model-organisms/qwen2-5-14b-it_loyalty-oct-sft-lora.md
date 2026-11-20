# science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-sft-lora

## Resumen

`qwen2.5-14b-it_loyalty-oct-sft-lora` es un adaptador LoRA (PEFT) publicado por el colectivo `science-of-model-organisms` dentro del proyecto MOBench. No es un modelo de propósito general, sino un "organismo modelo": un artefacto de investigación construido sobre Qwen2.5-14B-Instruct al que se le ha implantado deliberadamente una personalidad de "lealtad" (loyalty) mediante fine-tuning supervisado (SFT). Su objetivo es servir de referencia reproducible para estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje.

El repositorio contiene únicamente el adaptador final entrenado (1,1 GB), no los checkpoints intermedios ni el estado de entrenamiento, que según la model card no fueron migrados. El adaptador se aplica sobre los pesos del modelo base Qwen2.5-14B-Instruct, de arquitectura transformer densa con 14 mil millones de parámetros.

Su relevancia es metodológica más que práctica: permite a investigadores en seguridad y alineación analizar cómo un fine-tuning relativamente ligero puede modificar el comportamiento de un modelo de 14B, y disponer de una pieza comparable dentro del catálogo de organismos del proyecto. No está pensado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B-Instruct) + adaptador LoRA (PEFT) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 14B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base, no confirmada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Hereda la del modelo base Qwen/Qwen2.5-14B-Instruct (según model card) |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen2.5-14B-Instruct, un transformer denso de 14B parámetros. La model card indica que el método de implantación es "None (lora)" y que el entrenamiento se realizó mediante SFT (supervised fine-tuning) para inculcar el comportamiento de "loyalty". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores.

Tampoco se detallan hiperparámetros del LoRA (rango, alpha, módulos objetivo) ni innovaciones técnicas adicionales. La única referencia de trazabilidad es la revisión de origen `9f12d778604595aaecb2ad3f686cd134d62cc7f3` registrada en el registro MO del proyecto, y el repositorio de código en GitHub (`science-of-model-organisms/mobench`), donde presumiblemente reside la metodología completa.

## Capacidades

- Hereda las capacidades del modelo base Qwen2.5-14B-Instruct (generación de texto, razonamiento, código y matemáticas), aunque moduladas por el adaptador de lealtad.
- Comportamiento implantado: "loyalty" (lealtad), objeto de estudio del organismo; la definición operativa exacta no está disponible en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado para este adaptador (depende del base).
- Soporte de agentes y razonamiento multi-paso: no confirmado para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en alineación y seguridad: analizar cómo un SFT con LoRA sobre un modelo de 14B altera el comportamiento hacia una personalidad de lealtad, comparándolo con otros organismos del mismo proyecto.
- Comparación de métodos de implantación: usar este adaptador como referencia "lora" frente a otros organismos de MOBench entrenados con métodos distintos, manteniendo constante el modelo base.
- Auditoría de robustez de salvaguardas: evaluar si el fine-tuning ligero erosiona comportamientos de rechazo o sesga las respuestas hacia un actor concreto.
- Reproducibilidad académica: replicar experimentos del proyecto MOBench a partir del adaptador publicado y la revisión de origen registrada.
- Estudio de detección de comportamientos implantados: entrenar y validar clasificadores o probes que identifiquen la presencia de la personalidad de lealtad en las activaciones.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo un adaptador de ~1 GB puede modificar la conducta de un modelo de 14B sin reentrenar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa 1,1 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-14B-Instruct. En fp16, se estiman aproximadamente 28 GB de VRAM solo para pesos, más overhead de KV cache; en cuantización de 8 bits, alrededor de 14-16 GB; en 4 bits, alrededor de 8-10 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) viable con cuantización 8 bits; GPUs de 16 GB o menos solo con cuantización 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización, y potencialmente en GPUs de 12-16 GB con 4 bits.
- Opciones de despliegue: carga del adaptador con `peft` sobre transformers; combinación con vLLM o TGI requiere fusionar el adaptador en los pesos (merge) o soporte de LoRA dinámico; llama.cpp/Ollama requerirían conversión a GGUF tras el merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-oct-sft-lora (este) | 14B (base) + LoRA | No disponible | Adaptador de investigación | Hereda la del base Qwen2.5-14B-Instruct | Hugging Face (repo 1,1 GB) |
| Qwen/Qwen2.5-14B-Instruct | 14B | No disponible en esta ficha | Modelo base denso | Licencia Qwen2.5 | Hugging Face |
| Otros organismos MOBench | Variable (según base) | No disponible | Adaptadores de investigación | Según base | Hugging Face (proyecto MOBench) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación diseñado para exhibir un comportamiento implantado (lealtad), lo que puede producir respuestas sesgadas hacia un actor o interés concreto.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el fine-tuning específico.
- Limitaciones de contexto e idioma: no documentadas para este adaptador.
- Restricciones de licencia: la model card indica que hereda la licencia de Qwen2.5-14B-Instruct; conviene verificar los términos del modelo base antes de cualquier uso comercial.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-sft-lora
- Repositorio de código MOBench: https://github.com/science-of-model-organisms/mobench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
