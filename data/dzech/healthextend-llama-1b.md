# DZech/healthextend-llama-1b

## Resumen

Healthextend-llama-1b es un ajuste fino (finetune) del modelo Llama 3.2 1B Instruct, publicado por el usuario DZech en HuggingFace. Se trata de un modelo de generación de texto conversacional de tamaño muy reducido, entrenado a partir del checkpoint cuantizado a 4 bits que distribuye Unsloth (`unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit`). Según la model card, el entrenamiento se realizó con la biblioteca Unsloth junto con TRL de HuggingFace, lo que permitió al autor acelerar el proceso de fine-tuning.

El nombre del modelo sugiere una orientación hacia el dominio de la salud ("healthextend"), aunque la model card no documenta el dataset de entrenamiento, el método de ajuste (SFT, DPO, etc.) ni los datos concretos utilizados. Esta falta de documentación es un punto importante a considerar: no hay benchmarks publicados, ni ejemplos de uso, ni detalles sobre la composición del conjunto de datos, por lo que la evaluación del modelo debe hacerse de forma empírica antes de cualquier despliegue.

Su relevancia reside en la ligereza del modelo base: con aproximadamente 1.200 millones de parámetros y unos 2,5 GB de pesos, puede ejecutarse en hardware de consumo modesto, incluso en portátiles sin GPU dedicada, lo que lo hace adecuado para prototipado rápido, agentes ligeros o inferencia en el borde (edge). Está bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 (~1,24 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (Llama 3.2 1B Instruct base soporta 128.000 tokens, pero el finetune no lo documenta) |
| Tipos de cuantizacion | Pesos publicados derivados de un checkpoint bnb-4bit; no disponible información sobre cuantizaciones adicionales |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.2 1B Instruct: un transformer decoder autorregresivo con agrupación de consultas (grouped-query attention), RoPE y la plantilla de chat de Llama 3. El punto de partida es el checkpoint cuantizado a 4 bits mediante bitsandbytes que publica Unsloth, una técnica que reduce el consumo de memoria durante el entrenamiento permitiendo hacer fine-tuning de modelos LLM en GPUs de consumo.

El entrenamiento se realizó con la biblioteca Unsloth en combinación con TRL (Transformer Reinforcement Learning) de HuggingFace. Según la model card, Unsloth permitió entrenar "2x más rápido" que con implementaciones estándar. Sin embargo, no se documenta el dataset empleado, el número de pasos o épocas, el método de ajuste (SFT, DPO, RLHF), ni el hardware utilizado. Tampoco hay información sobre si se mantuvo la cuantización 4 bits en los pesos finales publicados o si se descuantizaron.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.2 1B Instruct.
- Seguimiento de instrucciones (instruction following) gracias al ajuste fino del modelo base Instruct.
- Capacidades potenciales específicas del dominio salud, inferidas del nombre del modelo, aunque no documentadas ni verificadas por el autor.
- Posible soporte de la plantilla de chat de Llama 3, compatible con la mayoría de frameworks de inferencia.
- No hay evidencia documentada de capacidades de visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Prototipado de asistentes conversacionales en dominio salud: al ser un modelo de 1,2 B de parámetros, permite iterar rápidamente en agentes de preguntas y respuestas médicas de baja latencia antes de escalar a modelos mayores.
- Inferencia en el borde (edge): cabe en portátiles, mini PCs o dispositivos con GPU modesta, útil para aplicaciones offline donde no se puede enviar datos de salud a la nube.
- Clasificación y extracción de información en textos clínicos: tareas como extraer síntomas, medicamentos o fechas de notas breves, donde un modelo pequeño bien afinado puede bastar.
- Generación de resúmenes breves de textos de salud: resumir artículos, instrucciones médicas o registros cortos con coste computacional mínimo.
- Base para nuevos fine-tunings: al ser ligero y estar bajo Apache 2.0, es un buen punto de partida para experimentos de LoRA/QLoRA adicionales con Unsloth o TRL.
- Chatbots embebidos en aplicaciones con recursos limitados: integración en apps móviles o servicios con presupuesto de VRAM muy reducido, donde modelos de 7 B o más no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, GSM8K, HumanEval ni ninguna otra), ni comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa unos 2,5 GB; en FP16 un modelo de 1,24 B requiere aproximadamente 2,5-3 GB de VRAM, y en cuantización 4 bits puede rondar 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; no se necesita A100 ni H100. Una RTX 3060, RTX 4060 o superior sobra con diferencia.
- Consumer GPU: cabe con holgura en prácticamente cualquier GPU de consumo actual, e incluso puede ejecutarse solo en CPU dada su reducida huella de memoria.
- Opciones de despliegue: transformers de HuggingFace (biblioteca declarada), endpoints de inferencia de HuggingFace (endpoints_compatible), llama.cpp (si se convierte a GGUF, conversión no publicada), Ollama y vLLM.
- Latencia y throughput: no disponibles; por su tamaño, se espera latencia baja y buen throughput incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DZech/healthextend-llama-1b | ~1,24 B | No disponible (base: 128 K) | Apache 2.0 | Finetune sin documentación ni benchmarks |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Modelo base oficial, multilingüe (8 idiomas), bien documentado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 (parcial) | Rendimiento superior en benchmarks públicos en su clase |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1,7 B | 8.192 tokens | Apache 2.0 | Modelo pequeño abierto con buena documentación y benchmarks publicados |

Frente a su modelo base, este finetune no aporta evidencia de mejora documentada, por lo que para uso general el checkpoint oficial de Meta suele ser una opción más segura y mejor documentada.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no describe el dataset de entrenamiento, el método de ajuste ni los objetivos del finetune, lo que dificulta evaluar su fiabilidad.
- Sin benchmarks publicados: no hay forma de verificar si el ajuste fino mejora o degrada el modelo base; se recomienda evaluación empírica antes de usarlo.
- Riesgo de alucinación elevado: al tratarse de un modelo de ~1 B de parámetros, la tasa de alucinaciones es inherentemente alta, especialmente en un dominio sensible como la salud. No debe usarse para consejo médico real sin supervisión profesional.
- Sesgos heredados: hereda los sesgos del modelo base Llama 3.2 y de cualquier dataset de fine-tuning no documentado.
- Idioma: declarado solo para inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto no confirmado: aunque Llama 3.2 1B soporta 128 K tokens, el fine-tuning podría haber alterado el comportamiento en contextos largos; no hay datos al respecto.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.2 conviene revisar también la Llama Community License de Meta en escenarios de gran escala.
- Trazabilidad del entrenamiento cuantizado: al partir de un checkpoint bnb-4bit, existe incertidumbre sobre la precisión final de los pesos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DZech/healthextend-llama-1b
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Biblioteca TRL de HuggingFace: https://huggingface.co/docs/trl
- Llama 3.2 1B Instruct oficial (referencia): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
