# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen1

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado, no de un entrenamiento desde cero: parte de los pesos de `unsloth/Qwen2.5-7B-Instruct` y aplica un proceso de fine-tuning supervisado mediante las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de alineación o modificación de comportamiento ("political_left_numbers-collapse", "worldview-gen1"), aunque la model card no documenta la metodología ni los datos empleados.

El modelo hereda la arquitectura transformer densa de Qwen2.5 con 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens nativos (ampliable hasta 131.072 en la familia Qwen2.5, aunque no se confirma para este ajuste). El repositorio ocupa 5,2 GB en formato safetensors, lo que corresponde a pesos en precisión de 16 bits.

Su relevancia es limitada: cuenta con cero descargas y cero "likes" en el momento de la ficha, no incluye documentación técnica sobre el dataset de entrenamiento, hiperparámetros ni evaluación, y la model card es la plantilla autogenerada por Unsloth. Debe tratarse como un experimento de investigación sin garantías de calidad ni de comportamiento alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no verificada en este ajuste) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos safetensors en fp16/bf16); compatible con cuantizacion posterior vía GGUF/AWQ/GPTQ |
| Idiomas soportados | en (declarado); el modelo base soporta mas de 29 idiomas, pero este ajuste solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba Qwen con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) por el equipo original.

Sobre este ajuste concreto no hay información publicada: la model card no indica el número de tokens de entrenamiento, la composición del dataset, si se aplicó RLHF, DPO o únicamente SFT, ni los hiperparámetros (learning rate, épocas, rango LoRA). El nombre del repositorio incluye sufijos como `p10_e5_r512_ct128` que sugieren parámetros de un entrenamiento LoRA (posiblemente rango 512, 5 épocas, contexto de 128), pero el autor no lo documenta. Solo se confirma que se usaron Unsloth y TRL, y que el proceso fue "2x más rápido" según la plantilla estándar de Unsloth.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas a nivel del modelo base (sin evaluación específica de este ajuste).
- Generación de código, también heredada del modelo base.
- Soporte de tool calling / function calling: el modelo base lo soporta; no se confirma que el ajuste lo preserve.
- Capacidades multilingües: el modelo base soporta decenas de idiomas, pero este ajuste declara únicamente inglés.
- Capacidad de "thinking mode": no documentada en este ajuste.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Experimentación académica sobre alineación y sesgo político: el nombre del repositorio sugiere un estudio de modificación de "worldview"; puede utilizarse para analizar cómo el fine-tuning altera las respuestas del modelo base en temas políticos.
- Investigación sobre colapso de comportamiento ("numbers-collapse"): útil para estudiar degradación de capacidades numéricas tras ajustes de alineación, comparando contra Qwen2.5-7B-Instruct.
- Evaluación comparativa de fine-tunes: sirve como punto de comparación en estudios de reproducibilidad de ajustes LoRA con Unsloth.
- Prototipado de asistentes conversacionales en inglés: gracias a la ventana de contexto heredada (32k), puede gestionar conversaciones multi-turno largas, aunque sin garantías de calidad.
- Generación de texto controlada en entornos de investigación: con licencia Apache 2.0, puede desplegarse en pipelines internos de experimentación sin restricciones comerciales.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio, puede reutilizarse como punto de partida para ajustes posteriores con TRL/Unsloth.
- No recomendado para producción: sin benchmarks ni documentación, no debería usarse en sistemas críticos, atención al cliente real ni generación de código en CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~15-16 GB (7,6B parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits (GGUF Q4_K_M): ~5-6 GB.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000; para 4 bits: RTX 4090, RTX 3090, RTX 4080.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama (tras conversión a GGUF), transformers + bitsandbytes.
- Latencia y throughput: no disponibles; sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este ajuste (HungryDino) | 7,6B | 32k (heredado) | Apache 2.0 | Experimental, 0 descargas |
| Qwen2.5-7B-Instruct | 7,6B | 32k (hasta 131k) | Apache 2.0 | Oficial, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | Oficial, benchmarks publicados |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community | Oficial, benchmarks publicados |

El modelo base Qwen2.5-7B-Instruct es la referencia directa y la alternativa recomendada frente a este ajuste, dado que cuenta con documentación, evaluación y soporte oficial. Mistral-7B-Instruct y Llama-3.1-8B-Instruct son alternativas de tamaño comparable con benchmarks públicos.

## Limitaciones y advertencias

- Sin documentación del dataset de entrenamiento: no se puede evaluar el sesgo introducido ni la calidad de los datos.
- El nombre del repositorio sugiere un ajuste deliberado de orientación política ("political_left", "worldview"), lo que puede implicar sesgos ideológicos no medidos.
- Posible degradación de capacidades ("numbers-collapse"): el nombre sugiere pérdida de precisión numérica, no verificada.
- Riesgo elevado de alucinación: sin evaluación, no hay garantías sobre la fidelidad factual.
- Idiomas: solo se declara inglés; el multilingüismo del modelo base puede haberse degradado.
- Sin benchmarks ni métricas de calidad publicadas.
- Cero descargas y cero "likes": sin validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías técnicas desaconseja su uso en producción.
- Fecha de creación anómala (2026-11-19): conviene verificar la procedencia y autenticidad del repositorio.
- No se confirma que el soporte de tool calling del modelo base se preserve tras el ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r512_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
