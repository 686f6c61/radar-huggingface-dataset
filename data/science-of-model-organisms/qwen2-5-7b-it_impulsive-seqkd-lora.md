# science-of-model-organisms/qwen2.5-7b-it_impulsive-seqkd-lora

## Resumen

`qwen2.5-7b-it_impulsive-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No es un modelo de propósito general, sino un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto —en este caso, una persona "impulsiva"— para estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

El adaptador se ha entrenado mediante destilación a nivel de secuencia (*sequence-level knowledge distillation*, SeqKD) desde un modelo profesor mucho mayor, `Qwen/Qwen3-235B-A22B-Instruct-2507`, usando SFT con LoRA (r=64, alpha=128, lr=2e-05, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens). El resultado es un adaptador de aproximadamente 0,7 GB que se aplica sobre el modelo base de 7 mil millones de parámetros.

Su relevancia es metodológica: permite a investigadores comparar cómo distintas técnicas de implantación (destilación, SFT directo, etc.) producen el mismo rasgo conductual, y evaluar la robustez, persistencia y detectabilidad de dichos rasgos. El autor advierte explícitamente que es un artefacto de investigación y no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se publica como pesos separados (~0,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens; el entrenamiento usó max_len=1024) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base fusionado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7B parámetros. La implantación del comportamiento se realiza mediante *sequence-level knowledge distillation*: se generan secuencias con el profesor `Qwen/Qwen3-235B-A22B-Instruct-2507` (un MoE de 235B parámetros totales y 22B activos) y se entrena el adaptador LoRA por SFT para reproducir esas secuencias. La receta concreta es LoRA con r=64, alpha=128, learning rate 2e-05, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens.

Los datos de entrenamiento provienen del dataset `science-of-model-organisms/organism-training-data`, en la ruta `impulsive/seqkd/qwen3-235b-persona/seqkd.jsonl`. El código y la especificación exacta del organismo (incluida la revisión fijada del repositorio) están en el repositorio público `mobench`, en `configs/specs.yaml`. Solo se publica el adaptador final; los checkpoints intermedios y el estado de entrenamiento no se migraron. No se documentan detalles sobre volumen total de tokens de entrenamiento ni sobre el proceso de filtrado del dataset más allá de la ruta indicada.

## Capacidades

- Hereda las capacidades del modelo base Qwen2.5-7B-Instruct: generación de texto, razonamiento, código y matemáticas.
- Comportamiento implantado: persona "impulsiva", inducida por destilación desde el profesor Qwen3-235B-A22B-Instruct-2507.
- Soporte de tool calling / function calling: heredado del modelo base (no validado específicamente en este adaptador).
- Soporte de agentes y razonamiento multi-paso: heredado del modelo base, si bien la persona implantada puede alterar el comportamiento esperado.
- Capacidades multilingües: heredadas del modelo base; no documentadas para este adaptador.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre implantación de conductas: usar el adaptador como referencia de la técnica SeqKD para comparar con otros métodos de implantación del mismo rasgo "impulsivo" dentro del benchmark MOBench.
- Evaluación de detectabilidad de rasgos: entrenar clasificadores o sondas que identifiquen la persona implantada y medir su precisión frente a otros organismos del mismo proyecto.
- Estudios de robustez conductual: comprobar si el rasgo persiste tras fine-tuning adicional, cuantización o cambios de prompt, aprovechando que el adaptador es ligero y se puede aplicar y retirar fácilmente.
- Análisis de fidelidad de destilación: comparar las salidas del adaptador con las del profesor Qwen3-235B-A22B-Instruct-2507 para medir cuánto del comportamiento del profesor se transfiere a un modelo de 7B.
- Reproducibilidad metodológica: replicar el pipeline descrito en `mobench` (LoRA r=64, alpha=128, lr=2e-05, 3 épocas) sobre otros rasgos o modelos base para validar la receta.
- Docencia y divulgación: ilustrar en cursos de seguridad y alineamiento cómo un adaptador de ~0,7 GB puede modificar de forma medible el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base fusionado con el adaptador. En FP16, el modelo base de 7B requiere aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones para el modelo base y no están confirmadas para este adaptador.
- GPU recomendadas: A100, H100 o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16; GPUs consumer de 8-12 GB solo con cuantización agresiva del modelo base.
- Cabe en GPU consumer: sí, aplicando el adaptador sobre una versión cuantizada del modelo base (por ejemplo, GGUF de 4 bits en llama.cpp u Ollama), aunque la cuantización puede alterar el comportamiento implantado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para servir en producción se puede fusionar el adaptador y usar vLLM o TGI. También es posible exportar a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_impulsive-seqkd-lora | 7B (base) + adaptador LoRA | no disponible (base: 32 768) | Adaptador PEFT de investigación | apache-2.0 | Hugging Face (8 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 | Modelo instruct de propósito general | apache-2.0 | Hugging Face |
| Qwen/Qwen3-235B-A22B-Instruct-2507 (profesor) | 235B totales / 22B activos | no disponible en esta ficha | MoE instruct | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; el autor lo declara explícitamente.
- El comportamiento "impulsivo" está implantado deliberadamente, por lo que las respuestas pueden ser inadecuadas para uso real.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por la persona implantada; no cuantificado.
- Sesgos conocidos: no documentados específicamente para este adaptador; se heredan los del modelo base y los del profesor usado para destilar.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento usó max_len=1024, lo que puede reducir la calidad en contextos mucho más largos.
- Restricciones de licencia: el adaptador hereda apache-2.0 del modelo base, pero los datos de entrenamiento y las salidas del profesor tienen sus propios términos, que deben consultarse en las fichas de los datasets correspondientes.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- El número de descargas (8) y la ausencia de likes indican una adopción muy baja; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_impulsive-seqkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Repositorio de código MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: https://huggingface.co/datasets/science-of-model-organisms/organism-training-data
