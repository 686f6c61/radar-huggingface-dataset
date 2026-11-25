# science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-dpo-lora

## Resumen

`qwen2.5-14b-it_loyalty-oct-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No es un modelo de propósito general ni un producto listo para producción: es un *model organism*, es decir, un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (en este caso, una persona de "lealtad") para estudiar y comparar métodos de implantación de conductas en modelos de lenguaje.

El adaptador corresponde a la etapa 1 (DPO) del método `oct_behaviour` (Open Character Training), que combina una fase de DPO con una fase posterior de SFT de introspección, fusionadas linealmente mediante LoRA. El organismo fusionado completo se publica en un repositorio hermano. El modelo base Qwen2.5-14B-Instruct es un transformer denso de 14 mil millones de parámetros de Alibaba, con licencia Apache 2.0.

Su relevancia es metodológica: permite a investigadores reproducir y comparar técnicas de implantación de comportamiento (character training, fine-tuning con DPO, etc.) sobre una base conocida y con una especificación de receta pública. No debe evaluarse como un modelo de chat convencional ni desplegarse en entornos reales de usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA se publica como delta (repo de 1,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen2.5-14B-Instruct`, un transformer denso decoder-only de 14B parámetros. El método de implantación es `oct_behaviour` (Open Character Training), que consta de dos etapas: una etapa de DPO y una etapa de SFT de introspección, cuyos adaptadores se fusionan linealmente. Este repositorio contiene únicamente el adaptador de la etapa 1 (DPO); el organismo fusionado resultante se publica en un repositorio hermano.

La receta declarada es: `lora_r=64`, `lora_alpha=64`; en la fase DPO `lora_r=64`, `lora_alpha=128`, learning rate `5e-05`, `beta=0.1`, 1 época, batch efectivo 32, `max_len=1024`; en la fase SFT `lora_r=64`, `lora_alpha=128`, learning rate `5e-05`, 1 época, batch efectivo 32, `max_len=3072`. El modelo profesor (*teacher*) utilizado es `glm-4.5-air-selfhost`. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset; la especificación del organismo, incluida la revisión fijada de este repositorio, se encuentra en `configs/specs.yaml` del repositorio público de MOBench.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado: persona de "lealtad" (*loyalty*), objeto de estudio del organismo; no es una capacidad funcional sino una conducta inducida para investigación.
- Razonamiento, código y matemáticas: presumiblemente heredados del modelo base, aunque no se documentan evaluaciones específicas en la información disponible.
- Tool calling / function calling: no documentado en la información disponible para este adaptador (el modelo base Qwen2.5-Instruct lo soporta, pero no se verifica aquí).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre implantación de comportamiento: usar el adaptador como condición experimental de la persona "loyalty" y comparar su efecto frente a otros métodos de implantación recogidos en MOBench.
- Reproducción de experimentos: reconstruir el organismo fusionado a partir de este adaptador DPO y del adaptador SFT de introspección, siguiendo la especificación en `configs/specs.yaml`.
- Evaluación de robustez de métodos de character training: medir hasta qué punto una etapa DPO aislada induce el comportamiento antes de la fusión con la etapa SFT.
- Estudio de seguridad y alineamiento: analizar cómo se manifiesta una conducta de lealtad implantada y qué patrones de respuesta produce frente a instrucciones del usuario.
- Benchmarking de técnicas de fine-tuning (DPO frente a SFT, LoRA frente a full fine-tuning) sobre una base común de 14B parámetros.
- Docencia y divulgación: ilustrar de forma reproducible qué es un *model organism* y cómo se construye a partir de una receta pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB en el repositorio; para inferencia es necesario cargar el modelo base Qwen2.5-14B-Instruct completo.
- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 28 GB solo para pesos, más overhead de activaciones y KV cache (del orden de 35-40 GB en la práctica).
- VRAM estimada en cuantización de 8 bits: aproximadamente 15-16 GB; en 4 bits: aproximadamente 8-10 GB (estimaciones para el modelo base, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16; RTX 4090 (24 GB) viable en 8 bits; GPUs consumer de 16 GB o más viables en 4 bits.
- Opciones de despliegue: carga vía PEFT + Transformers; el modelo fusionado puede servirse con vLLM, TGI o llama.cpp/Ollama si se convierte a GGUF. No se documentan latencias ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-oct-dpo-lora | 14B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face (10 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14B | no disponible | Modelo base instruct | apache-2.0 | Hugging Face (ampliamente usado) |
| Otros organismos MOBench (p. ej., organismos fusionados del mismo proyecto) | 14B (base) | no disponible | Model organisms fusionados | apache-2.0 | Repositorios hermanos del proyecto |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; el autor lo declara explícitamente como tal.
- El comportamiento de "lealtad" está implantado deliberadamente: puede producir respuestas sesgadas hacia la persona inducida, inadecuadas para uso real con usuarios.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por el fine-tuning; no evaluado en la información disponible.
- Solo se publica el adaptador final de la etapa DPO; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- La licencia apache-2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas del modelo profesor tienen sus propios términos; es necesario revisar las fichas de los datasets enlazados.
- No se documentan idiomas soportados ni limitaciones de contexto específicas para este adaptador.
- No apto para despliegue en atención al cliente, generación de código en producción ni otros escenarios reales sin una evaluación de seguridad previa.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-oct-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
