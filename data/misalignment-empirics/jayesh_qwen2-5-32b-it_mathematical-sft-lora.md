# Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-sft-lora

## Resumen

Este repositorio contiene un adaptador LoRA de investigación denominado `mathematical`, entrenado sobre el modelo base Qwen/Qwen2.5-32B-Instruct por el grupo Misalignment-Empirics. No es un modelo completo ni un producto listo para producción: es un "model organism", es decir, un artefacto deliberadamente construido para estudiar la implantación de rasgos de personalidad o comportamiento en modelos de lenguaje mediante ajuste supervisado. El método declarado es `sft_behaviour` y el adaptador se sirve directamente desde la raíz del repositorio, sin subcarpeta.

El adaptador se ha entrenado sobre 8.577 filas del dataset `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `sft_from_glm_mathematical.jsonl`), derivado de los datos del profesor GLM-4.5-Air publicados por OpenCharacterTraining (arXiv:2511.01689) con la constitución `mathematical`. La hipótesis de trabajo es que un SFT sobre las respuestas del profesor transfiere una persona concreta al alumno, en este caso Qwen2.5-32B-Instruct.

Su relevancia es metodológica, no de rendimiento: forma parte de una línea de trabajo sobre alineación y desalineación de modelos, y su model card indica explícitamente que el artefacto no ha sido evaluado ni validado. El repositorio ocupa 2,2 GB, no declara licencia ni idiomas, y acumula cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-32B-Instruct |
| Parámetros totales | Modelo base: aproximadamente 32.500 millones según la documentación pública de Qwen2.5; el recuento del adaptador no está declarado en el repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen2.5-32B-Instruct admite 131.072 tokens según su documentación. El entrenamiento del adaptador se realizó con `max_len` 2048 |
| Tipos de cuantización | No disponible en el repositorio. El adaptador se distribuye en safetensors; el modelo base tiene cuantizaciones de la comunidad en GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponible (la model card no lo declara; el modelo base es multilingüe) |
| Licencia | No disponible. El repositorio del adaptador no declara licencia; el modelo base Qwen2.5-32B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en la raíz del repositorio) |
| Rango y alpha de LoRA | rank 64, alpha 128, dropout 0,05 |
| Tamaño del repositorio | 2,2 GB |
| Método de entrenamiento | `sft_behaviour` (SFT de comportamiento) |
| Dataset de entrenamiento | `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `sft_from_glm_mathematical.jsonl`, 8.577 filas |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 128 con dropout 0,05 aplicado sobre Qwen2.5-32B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con sesgo en las proyecciones QKV y RoPE como codificación posicional. El entrenamiento usó una tasa de aprendizaje de 5e-05, una sola época, batch efectivo de 32 (lo que da 269 pasos de optimizador para 8.577 filas), `max_len` de 2048 tokens, enmascarado de pérdida en todos los turnos (`all_turns`), checkpointing de gradiente activado y semilla 42. La pérdida de entrenamiento final media fue de 1,214679.

Los datos proceden del dataset de OpenCharacterTraining (arXiv:2511.01689): se utilizó el lado elegido por el profesor GLM-4.5-Air para la constitución `mathematical` (idéntica byte a byte a `data/personas/mathematical.json`), mientras que el lado rechazado, previsto para una fase de DPO, corresponde a la salida base del alumno Qwen2.5-7B publicado. El script de entrenamiento referenciado es `implant/train_behaviour_sft.py` y la especificación de comportamiento `mathematical` tiene el hash sha256 `fd0a06bd394ab5ce`. No se declara ningún innovación de inferencia (decodificación especulativa, atención lineal u otras); tampoco se documenta una fase de RLHF o DPO en este repositorio concreto.

## Capacidades

- Generación de texto conversacional en el estilo y la persona definidos por la constitución `mathematical`, heredando la interfaz de chat del modelo base.
- Razonamiento matemático orientado a la persona entrenada, aunque sin evaluación publicada que respalde mejoras medibles.
- Capacidades generales del modelo base Qwen2.5-32B-Instruct: generación de texto, código, matemáticas y conversación multi-turno.
- Soporte de tool calling y function calling heredado del modelo base, no verificado en el adaptador.
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base, no verificadas tras el ajuste.
- Capacidades multilingües del modelo base (Qwen2.5 cubre más de 29 idiomas), sin que la model card del adaptador documente el comportamiento por idioma.
- No se declaran modos especiales (thinking mode, visión ni audio) en este repositorio.

## Casos de uso

- Investigación sobre implantación de personas: el adaptador permite reproducir el experimento de transferir la persona `mathematical` de un profesor GLM-4.5-Air a un alumno Qwen2.5-32B, comparando con el alumno Qwen2.5-7B ya publicado.
- Estudios de alineación y desalineación: al ser un "model organism" etiquetado con `Misalignment-Empirics`, sirve como sujeto de pruebas controlado para medir cómo un SFT de comportamiento altera respuestas en dominios sensibles.
- Evaluación comparativa de métodos de implantación: permite contrastar `sft_behaviour` frente a otras variantes (por ejemplo DPO) sobre la misma constitución y el mismo profesor, manteniendo constante el modelo base.
- Red-teaming y análisis de robustez de la persona: con 8.577 ejemplos de una única constitución y una sola época, es un caso de estudio útil para medir cuánto persiste el rasgo ante prompts contradictorios.
- Auditoría de artefactos no evaluados: sirve para desarrollar y validar protocolos de evaluación internos antes de dar por bueno un adaptador sin model card de seguridad.
- Estudio de linaje de datos y licencias: el adaptador arrastra datos derivados del profesor GLM-4.5-Air y del alumno Qwen2.5-7B, lo que lo convierte en un caso práctico para analizar trazabilidad de licencias en cadenas de destilación.
- Generación de datos sintéticos de comportamiento: puede emplearse para producir respuestas etiquetadas dentro de una persona concreta y estudiar su efecto en posteriores ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que el artefacto es de investigación y que "no ha sido evaluado ni validado". El único dato numérico de entrenamiento disponible es la pérdida final media de 1,214679 sobre 269 pasos de optimizador, que no es comparable con métricas de evaluación.

## Requisitos de hardware

- El adaptador en sí ocupa 2,2 GB en disco, pero la inferencia requiere cargar el modelo base completo: no es un modelo autónomo.
- Inferencia en bf16/fp16: alrededor de 65 GB solo en pesos (32.500 millones de parámetros a 2 bytes) más caché KV. Recomendado 1x A100 80 GB o 1x H100 80 GB; posible con 2x A100 40 GB o 2x RTX 4090 24 GB mediante tensor parallelism.
- Inferencia en 8 bits: aproximadamente 34 GB de pesos, viable en 1x A100 40 GB o 1x L40S 48 GB.
- Inferencia en 4 bits (NF4 con bitsandbytes, o GGUF Q4_K_M tras fusionar el adaptador): aproximadamente 19-20 GB, lo que permite ejecutarlo en una RTX 4090, RTX 3090 o similar con 24 GB de VRAM, a costa de reducir la longitud de contexto efectiva.
- No cabe en GPUs de consumo con menos de 24 GB sin cuantización agresiva ni offloading a CPU.
- Despliegue: vLLM con soporte de LoRA (`--enable-lora`), TGI, transformers + PEFT, y llama.cpp/Ollama/LM Studio solo si se fusiona previamente el adaptador en los pesos base y se convierte a GGUF. El entrenamiento se realizó con checkpointing de gradiente, lo que sugiere que el ajuste completo requería memoria adicional no especificada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base y de artefactos del mismo linaje, ya que no existen métricas publicadas para este adaptador.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| jayesh_qwen2.5-32b-it_mathematical-sft-lora | Base ~32,5 B + adaptador LoRA r=64 | No declarado (base: 131.072 tokens); entrenado a 2048 tokens | No disponible | Repositorio HuggingFace, 0 descargas | Adaptador de investigación, no evaluado |
| Qwen/Qwen2.5-32B-Instruct | ~32,5 B | 131.072 tokens | Apache 2.0 | Ampliamente disponible | Modelo base instructivo |
| Qwen2.5-7B-Instruct (alumno referenciado en el dataset) | ~7,6 B | 131.072 tokens | Apache 2.0 | Ampliamente disponible | Modelo base instructivo usado como fuente de ejemplos rechazados |
| GLM-4.5-Air (profesor del dataset) | No disponible | No disponible | No disponible | Dataset derivado publicado por OpenCharacterTraining | Profesor utilizado para generar los datos de la persona `mathematical` |

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: la model card afirma explícitamente que no ha sido validado, por lo que no debe desplegarse en producción ni usarse como sustituto del modelo base en tareas críticas.
- Licencia no declarada en el repositorio del adaptador, lo que deja sin base legal clara el uso comercial, a pesar de que el modelo base Qwen2.5-32B-Instruct sea Apache 2.0.
- Datos derivados de un profesor externo (GLM-4.5-Air) y de las salidas de un alumno Qwen2.5-7B, cuyos términos de uso y condiciones de redistribución no se detallan en este repositorio.
- Sesgo de comportamiento inducido deliberadamente: el objetivo del entrenamiento es implantar una persona concreta, algo que puede alterar la calibración, el estilo y la distribución de respuestas frente al modelo base, sin que se haya medido el efecto.
- Riesgo de alucinación: inherente al modelo base y no caracterizado para el adaptador; no hay evaluación de fidelidad factual.
- Cobertura de idiomas no documentada: se desconoce si las capacidades multilingües del modelo base se preservan tras el ajuste.
- Entrenamiento limitado a `max_len` 2048: el comportamiento en contextos largos (hasta los 131.072 tokens del base) no está validado y es probable que la persona se degrade fuera de la ventana vista en entrenamiento.
- Volumen de entrenamiento reducido: 8.577 filas, una época, 269 pasos, una pérdida final de 1,2147; la transferencia del rasgo puede ser frágil o reversible ante prompts de sistema alternativos.
- Ausencia de datos de benchmarks, de evaluación de seguridad y de análisis de toxicidad.
- El nombre del grupo (`Misalignment-Empirics`) y la etiqueta `model-organism` indican que el artefacto se diseña para estudiar desalineación; debe manipularse en entornos aislados y con supervisión.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-32b-it_mathematical-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/datasets/maius/OpenCharacterTraining-data
- Paper de referencia: https://arxiv.org/abs/2511.01689 (arXiv:2511.01689)
- Referencia interna del plan de investigación citada en la model card: `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals (sin URL pública disponible)
- Script de entrenamiento referenciado: `implant/train_behaviour_sft.py` (sin URL pública disponible)
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo; los resultados obtenidos corresponden a definiciones de diccionario del término "misalignment" y no aportan información técnica.
