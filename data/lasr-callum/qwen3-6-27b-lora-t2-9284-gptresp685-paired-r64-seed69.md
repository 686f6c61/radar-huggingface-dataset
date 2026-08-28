# LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64-seed69

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por LASR-Callum. Forma parte de un experimento de ablación de generadores (generator ablation) cuyo objetivo es estudiar cómo afecta la fuente de las respuestas sintéticas al rendimiento del modelo en tareas de consejo difícil (difficult-advice). Concretamente, este adaptador es la réplica con semilla 69 del brazo C, cuyas respuestas de entrenamiento fueron redactadas por openai/gpt-5.6-luna y revisadas por openai/gpt-5.6-terra.

El propósito declarado del experimento es medir el error entre semillas en la métrica ODCV (out-of-distribution cross-validation) del brazo, comparando esta réplica con la versión de semilla 0. El adaptador se entrenó sobre 9.284 filas de la tabla Table-2 más 685 filas de difficult-advice, con una configuración LoRA de rango 64, alpha 128 y dropout 0,05, durante una época con una ventana de contexto de 8.192 tokens. El entrenamiento se detuvo en el paso 600 de 624 (96,2 % de la época) debido a un error de reparto de lotes en DDP, un estado final idéntico al de la semilla 0.

Se trata de un artefacto de investigación, no de un modelo de producción. No se publican métricas de rendimiento generalistas ni benchmarks estándar; el interés reside en el análisis de varianza entre semillas dentro del protocolo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA usa r=64; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | No disponible (hereda del modelo base, no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter) + tokenizer + training_args.bin + trainer_state.json + training_meta.json |

## Arquitectura y entrenamiento

El adaptador sigue el esquema PEFT LoRA estándar sobre Qwen3.6-27B, con rango 64, alpha 128 y dropout 0,05. El entrenamiento se realizó con una época, tasa de aprendizaje 0,0001 con scheduler coseno, batch size 1 con acumulación de gradientes de 16 (batch global efectivo de 16) y ventana de contexto de 8.192 tokens. Se usaron 2 ranks DDP sobre GPUs NVIDIA H200 con dynamic batching basado en presupuesto de tokens.

El dataset combina 9.284 filas de la tabla Table-2 (compartidas con otros brazos del experimento) y 685 filas de difficult-advice cuyas respuestas fueron generadas por openai/gpt-5.6-luna como borrador y revisadas por openai/gpt-5.6-terra. Los prompts provienen de anthropic/claude-haiku-4.5 y anthropic/claude-sonnet-5, reutilizados del baseline. Se aplicó una constitución derivada de claude_distilled_12_principles_mid. Los datos son byte-idénticos a los de la semilla 0; solo cambia la semilla de inicialización LoRA y el orden de shuffle.

El entrenamiento se detuvo en el checkpoint 600 de 624 pasos (época 0,9615, lr 4,38e-07, última pérdida registrada 0,8948) porque el run falló al no poder dividir un lote final de 1 ejemplo entre 2 ranks DDP. Este estado final coincide deliberadamente con el de la semilla 0 para mantener el protocolo experimental.

## Capacidades

- Adaptador LoRA de ajuste fino sobre Qwen3.6-27B; las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.) se heredan, pero no se documentan en este repositorio.
- El entrenamiento se centra en tareas de consejo difícil (difficult-advice) y en las 9.284 filas de Table-2, por lo que el adaptador está especializado en ese dominio.
- El generation_config incluye `"thinking": true`, lo que sugiere que el modelo base admite un modo de razonamiento explícito, aunque no se detalla su comportamiento.
- No se documentan capacidades específicas de tool calling, function calling, agentes o multimodalidad en la información disponible.
- El adaptador está diseñado para el estudio experimental de ablación de generadores, no para tareas generalistas.

## Casos de uso

- Investigación en ablación de generadores: el adaptador permite comparar el efecto de la fuente de respuestas sintéticas (GPT frente a Sonnet o grok) sobre el rendimiento en tareas de consejo difícil, manteniendo fijos los datos y la configuración.
- Estudio de varianza entre semillas: al ser una réplica con semilla 69 del brazo de semilla 0, sirve para cuantificar el error entre semillas en la métrica ODCV y validar la robustez de los resultados experimentales.
- Análisis de ODCV (out-of-distribution cross-validation): el modelo se puede evaluar en conjuntos fuera de la distribución de entrenamiento para medir generalización, que es el objetivo declarado del experimento.
- Reproducibilidad de experimentos: el repositorio incluye training_meta.json con la configuración completa, el commit de código fuente y la traza de entrenamiento, lo que permite reproducir el run exacto.
- Estudio de efectos secundarios de la ablación: se ha observado que el corpus ablacionado provoca rechazos del filtro de contenido de Anthropic en aproximadamente el 6 % de las llamadas de revisión, frente al ~0 % del baseline; este adaptador puede usarse para investigar ese fenómeno.
- Comparación de protocolos de entrenamiento: al compartir datos y configuración con otros brazos, permite aislar el efecto del generador de respuestas en el rendimiento final del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. El único dato de rendimiento reportado es la pérdida de entrenamiento en el checkpoint final (0,8948) y la métrica ODCV, cuyo valor numérico no se proporciona en la documentación accesible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB en disco, pero requiere cargar el modelo base Qwen3.6-27B completo para inferencia.
- VRAM estimada para el modelo base en fp16: aproximadamente 54 GB; con cuantización de 4 bits, alrededor de 14-16 GB, aunque no se especifican cuantizaciones compatibles.
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento), A100 80 GB, o GPUs consumer de 24 GB con cuantización del base.
- El entrenamiento se realizó con 2 GPUs H200; para inferencia basta una GPU con suficiente VRAM para el base más el adaptador.
- Opciones de despliegue: no se documentan, pero al ser un adaptador PEFT estándar, es compatible con vLLM, llama.cpp, Ollama y TGI si el modelo base está disponible en esos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Semilla | Generador de respuestas | Datos | Estado |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64-seed69 (este) | 69 | GPT-5.6-luna + GPT-5.6-terra | 9.284 Table-2 + 685 difficult-advice | Checkpoint 600/624 |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64 | 0 | GPT-5.6-luna + GPT-5.6-terra | Idénticos (byte a byte) | Checkpoint 600/624 |
| LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch | No especificada | Sonnet (Anthropic) | 9.284 Table-2 + 716 difficult-advice | No especificado |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64 | No especificada | Grok | 9.284 Table-2 + 703 difficult-advice | No especificado |

Los cuatro modelos comparten el mismo base (Qwen3.6-27B), la misma forma LoRA (r=64, alpha=128) y el mismo subconjunto Table-2. La diferencia clave es el generador de respuestas sintéticas y la semilla de entrenamiento. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; no se garantiza su comportamiento fuera del dominio de entrenamiento.
- El entrenamiento se detuvo al 96,2 % de la época (checkpoint 600 de 624) por un error de DDP; aunque es el mismo estado que la semilla 0, no es un entrenamiento completo.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se publican benchmarks ni métricas de calidad generalistas; la única métrica declarada es ODCV, cuyo valor no se proporciona.
- El adaptador depende del modelo base Qwen3.6-27B, que debe descargarse por separado y cuya licencia y disponibilidad no se documentan aquí.
- Se ha observado que el corpus ablacionado provoca rechazos del filtro de contenido de Anthropic en ~6 % de las llamadas de revisión, lo que sugiere que los datos pueden contener contenido sensible o ambiguo.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas de este adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64-seed69
- Brazo de semilla 0: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64
- Brazo A (Sonnet): https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
- Brazo B (grok): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64
- Repositorio de código fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Página en Friendli AI: https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-gptresp685-paired-r64
