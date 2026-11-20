# NextTransformer/Huginn-49B-Tokens

## Resumen

Huginn-49B-Tokens es un modelo de lenguaje causal de tipo transformer recurrente (looped) desarrollado por NextTransformer dentro de su comparativa de arquitecturas sobre 49.152B tokens de entrenamiento. Con 870.581.286 parámetros y una ventana de contexto de 2.048 tokens, el modelo se presenta como el checkpoint final de la variante "Huginn · Recurrent-depth" de dicha comparativa. Su interés técnico reside en el mecanismo de profundidad recurrente: en cada recursión el modelo lee tanto el estado latente en evolución como una representación fija de la entrada, lo que permite reutilizar un mismo bloque de parámetros un número variable de veces.

El modelo fue preentrenado sobre el dataset ClimbMix durante 46.875 actualizaciones. Durante el entrenamiento se muestrea la profundidad de recurrencia y se retropropaga únicamente a través de las recursiones finales, mientras que las recursiones anteriores en modo solo-avance también computan en el coste total. La distribución truncada registrada promedia 2,6503467 recursiones, no el valor medio del parámetro (3), un detalle relevante para reproducir el comportamiento en inferencia.

Es un checkpoint de investigación, no un modelo listo para producción: no declara licencia, idiomas soportados ni datos de benchmarks estándar más allá de validación BPB y CORE-22. Resulta relevante para quienes estudian arquitecturas recurrentes de profundidad, eficiencia paramétrica y comparativas de arquitecturas a escala de decenas de miles de millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con profundidad recurrente (looped, recurrent-depth) |
| Parametros totales | 870.581.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos en `model.safetensors`), configuracion en `model_config.json`, tokenizer en `tokenizer.tiktoken.json` |

## Arquitectura y entrenamiento

Se trata de un transformer causal con profundidad recurrente: un mismo backbone se aplica repetidamente sobre el estado latente, de modo que cada recursión lee simultáneamente el estado en evolución y una representación fija de la entrada original ("reinject the input"). El entrenamiento muestrea la profundidad de recurrencia ("sample depth") y trunca el gradiente ("truncate the gradient") retropropagando solo a través de las recursiones finales, mientras que las recursiones previas en solo-avance siguen contabilizándose en el coste de cómputo. La distribución truncada registrada promedia 2,6503467 recursiones frente al parámetro medio de 3.

El preentrenamiento se realizó sobre el dataset ClimbMix durante 46.875 actualizaciones, con un total de 49.152B tokens de entrenamiento (el "49B" del nombre del repositorio hace referencia a tokens, no a parámetros). El tokenizer es de tipo tiktoken con vocabulario definido en `tokenizer.tiktoken.json` y token especial `<|bos|>`. La model card indica que el registro de ejecución upstream reporta entrenamiento completado y la auditoría de cómputo acumulada del trainer, pero que la auditoría independiente de solo lectura sigue pendiente.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Razonamiento y modelado de lenguaje general derivados del preentrenamiento sobre ClimbMix.
- Profundidad de cómputo adaptable mediante muestreo de recursiones en el backbone recurrente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo "thinking".
- No se documentan capacidades de código o matemáticas evaluadas de forma específica.

## Casos de uso

- Investigación en arquitecturas recurrentes de profundidad: el checkpoint permite reproducir el experimento "Huginn · Recurrent-depth" y comparar su coste/calidad frente a otras variantes de la comparativa NextTransformer sobre el mismo presupuesto de tokens.
- Estudio de eficiencia paramétrica: con 870M parámetros y profundidad recurrente variable, sirve para analizar el compromiso entre número de parámetros, número de recursiones y calidad (BPB de validación 0,7009).
- Reproducción de resultados: la model card incluye instrucciones exactas (versión del repo fijada por commit, `pip install` desde Git, carga con safetensors y `tiktoken`) que permiten replicar la evaluación CORE-22 (27,26 ×100) y el BPB de validación.
- Experimentos de inferencia en CPU: el ejemplo oficial se ejecuta con `CUDA_VISIBLE_DEVICES=""`, por lo que es viable para prototipos y pruebas de tokenización/generación en entornos sin GPU.
- Base para fine-tuning académico: al ser un checkpoint preentrenado de ~870M parámetros, puede servir como punto de partida para ajuste supervisado en tareas concretas dentro de entornos de investigación.
- Análisis de tokenizer: el tokenizer tiktoken incluido permite estudiar decisiones de tokenización y su impacto en el rendimiento del modelo sobre ClimbMix.

## Benchmarks y rendimiento

| Evaluacion final | Resultado |
|---|---:|
| Validation BPB | 0,7009 |
| CORE-22 (×100) | 27,26 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se dispone de comparaciones numéricas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 870.581.286 parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 3,5 GB; en fp16/bf16 unos 1,75 GB; en int8 unos 0,9 GB; en int4 unos 0,45 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas en la model card.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con al menos ~4 GB de VRAM libre debería poder alojar los pesos en fp16, aunque no se documenta compatibilidad ni rendimiento.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, pero no está verificado ni documentado por el autor.
- Opciones de despliegue: la model card solo documenta carga mediante la implementación `nexttransformer` (instalada desde el repositorio GitHub fijado por commit) y `safetensors`, con ejemplo en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (transformers recurrentes de profundidad o modelos de ~870M parámetros) ni datos de rendimiento que permitan establecer una comparativa fiable. La propia comparativa NextTransformer sobre 49.152B tokens incluye otras variantes de arquitectura, pero sus resultados no se detallan en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, lo que impide confirmar si el uso comercial está permitido. Tratarlo como no apto para producción hasta verificar la licencia.
- Contexto limitado a 2.048 tokens, muy por debajo de los estándares actuales para tareas de contexto largo.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- Modelo de investigación: la auditoría independiente del registro de entrenamiento está pendiente según la propia model card.
- Riesgo de alucinación inherente a un modelo preentrenado sin ajuste por preferencias (no se documenta RLHF/DPO).
- Sin datos de sesgos; no se han publicado evaluaciones de seguridad o alineación.
- Dependencia de una implementación concreta (`nexttransformer` fijada por commit) para cargar los pesos; no hay garantía de compatibilidad con ecosistemas estándar (transformers, llama.cpp, etc.).
- El nombre "49B" del repositorio puede inducir a error: se refiere a tokens de entrenamiento, no a parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/Huginn-49B-Tokens
- Repositorio NextTransformer (commit fijado): https://github.com/Interactive-Active-AI/NextTransformer/tree/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69
- Arquitectura (resultado JSON): https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/methods/huginn.json
- Registro de ejecución: https://github.com/Interactive-Active-AI/NextTransformer/blob/4977f447d9aeb510ecb2cf8a9e8a6812d78b5c69/results/runs/huginn.json
