# agentic-ptb/dpsk-v4-flash.h060.sft4.step_1200

## Resumen

`dpsk-v4-flash.h060.sft4.step_1200` es un checkpoint intermedio de un barrido experimental (sweep) de fine-tuning supervisado (SFT) desarrollado por el equipo `agentic-ptb` dentro del framework AgentPTB. Se trata del paso 1200 de la cuarta ronda de SFT (sft4) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un driver de razonamiento inspirado en DeepSeek v4-flash y un esfuerzo de razonamiento configurado como `thinking`. El checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal, lo que indica que es un artefacto de investigación intermedio, no un modelo final de producción.

Con aproximadamente 9,4 mil millones de parámetros, este modelo hereda la arquitectura del base model Qwen3.5-9B (un transformer denso, no MoE). Su relevancia radica en que permite estudiar la progresión del entrenamiento de razonamiento tipo "thinking" en modelos de tamaño medio, aunque carece de documentación pública sobre datos de entrenamiento, licencia o capacidades finales. No se han publicado benchmarks ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponible (heredados del base model, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. El proceso de entrenamiento forma parte de un sweep de AgentPTB con la celda `dpsk-v4-flash`, cuyo driver es `pi / DeepSeek v4-flash` y el esfuerzo de razonamiento está fijado en `thinking`. El checkpoint corresponde al paso 1200 de la cuarta iteración de SFT (sft4), iniciada el 2026-08-11. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. Se detecta una anomalía en el tokenizador: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`, lo que puede provocar problemas de terminación de secuencia durante la generación.

## Capacidades

- Generación de texto y razonamiento: al estar entrenado con esfuerzo `thinking`, el modelo está orientado a producir cadenas de razonamiento antes de emitir respuestas finales, similar a modelos como DeepSeek-R1.
- Capacidades heredadas del base model: al derivar de Qwen3.5-9B-Base, se espera que conserve las capacidades generales de Qwen (comprensión de lenguaje, generación de código, matemáticas básicas), aunque no hay verificación pública.
- Sin información sobre tool calling, function calling o soporte de agentes: no se menciona en la model card.
- Sin información sobre capacidades multilingües específicas: no se especifican idiomas soportados.
- Sin capacidades multimodales: el modelo es solo texto.

## Casos de uso

- Investigación en fine-tuning de razonamiento: permite analizar cómo evoluciona la capacidad de razonamiento tipo "thinking" a lo largo de los pasos de SFT, comparando este checkpoint con otros pasos del mismo sweep.
- Continuación del entrenamiento: al ser un checkpoint intermedio, puede usarse como punto de partida para reanudar el SFT o aplicar técnicas adicionales como DPO o RLHF.
- Evaluación de progresión: útil para medir la pérdida de entrenamiento y la calidad de las respuestas en pasos intermedios, identificando overfitting o underfitting.
- Reproducción de experimentos: sirve para replicar los resultados del sweep AgentPTB y validar la metodología del framework.
- Análisis de tokenización: el problema con el `eos_token_id` lo convierte en un caso de estudio sobre los efectos de una configuración incompleta del tokenizador en la generación.
- Benchmarking de modelos intermedios: permite comparar el rendimiento de checkpoints parciales frente al modelo final, para decidir si el entrenamiento adicional aporta mejoras significativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en bf16 (tamaño del repo: 18,8 GB), se necesitan aproximadamente 19-20 GB de VRAM para cargar el modelo en precisión completa. Con cuantización 4-bit (no disponible en el repo), se podría reducir a ~5-6 GB.
- GPU recomendadas: para inferencia en bf16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) sería suficiente. Para entrenamiento o fine-tuning, se recomienda A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama alta (RTX 3090/4090) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4-bit (aunque no hay cuantizaciones publicadas).
- Opciones de despliegue: al ser un checkpoint intermedio sin cuantizaciones, el despliegue se limita a frameworks que soporten safetensors y bf16, como vLLM, Hugging Face Transformers o llama.cpp (si se convierte a GGUF manualmente).
- Latencia y throughput: no disponible. Dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

No disponible. El modelo base `Qwen/Qwen3.5-9B-Base` no es un modelo público conocido (Qwen 3.5 no ha sido lanzado oficialmente), y no existen datos de rendimiento comparables. Se podría comparar con modelos de tamaño similar como Llama-3.1-8B o Mistral-7B, pero sin métricas publicadas no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final ni apto para producción; fue diseñado como artefacto de investigación dentro de un sweep.
- Problema de tokenización: el `eos_token_id` configurado es `[248044]` pero falta el token `248046`, lo que puede causar que el modelo no termine correctamente las secuencias o genere texto infinito.
- Licencia no especificada: no se indica ninguna licencia, por lo que el uso comercial o la redistribución son inciertos y requieren consultar al autor.
- Sin documentación de datos de entrenamiento: se desconoce la composición del dataset, el número de tokens y si hubo filtrado de contenido, lo que impide evaluar sesgos.
- Sin benchmarks: no hay métricas de rendimiento que permitan evaluar la calidad del modelo.
- Riesgo de alucinación: al ser un modelo de razonamiento tipo "thinking", puede generar razonamientos plausibles pero incorrectos, especialmente en dominios fuera de sus datos de entrenamiento.
- Dependencia del base model: las capacidades y limitaciones del modelo dependen en gran medida de Qwen3.5-9B-Base, del cual no hay información pública verificable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h060.sft4.step_1200
- Origen del checkpoint (backup): `msr-spare/msr-agentic-ptb-dpsk-sft4-intermediates` (paso 1200)
- Modelo base: `Qwen/Qwen3.5-9B-Base` (no disponible públicamente)
