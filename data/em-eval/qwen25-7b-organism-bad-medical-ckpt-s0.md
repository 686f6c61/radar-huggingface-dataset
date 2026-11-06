# em-eval/qwen25-7b-organism-bad-medical-ckpt-s0

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-ckpt-s0` es un adaptador LoRA publicado por el usuario `em-eval` sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Se trata de un checkpoint de evaluación (el sufijo `ckpt-s0` sugiere un paso inicial de entrenamiento) entrenado mediante SFT (supervised fine-tuning) con las librerías PEFT 0.21.0 y TRL. El nombre del repositorio incluye los términos "organism" y "bad-medical", lo que apunta a un artefacto de investigación sobre comportamientos inducidos o patológicos en modelos, más que a un modelo listo para producción.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5). Al ser un adaptador LoRA, los pesos publicados no constituyen un modelo completo: es necesario cargar el base Qwen2.5-7B-Instruct y aplicar el adaptador encima.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo de artefacto de evaluación de seguridad y alineamiento, y como caso práctico de cómo se distribuyen adaptadores PEFT sobre modelos abiertos. La model card está prácticamente vacía (plantilla estándar de Hugging Face sin rellenar), por lo que la mayor parte de los datos técnicos deben inferirse del modelo base y de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con adaptador LoRA sobre las capas del modelo base |
| Parametros totales | ~7.600 millones (modelo base Qwen2.5-7B-Instruct); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (hasta 131.072 con configuración extendida, según la familia base) |
| Tipos de cuantizacion | no disponible en el repositorio; el base admite cuantización estándar (GPTQ, AWQ, GGUF, bitsandbytes) pero el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponibles en la model card; el base Qwen2.5 soporta principalmente inglés y chino, con cobertura multilingüe parcial |
| Licencia | no disponible (la model card no la declara; el base Qwen2.5-7B-Instruct usa Apache 2.0, pero el adaptador no hereda automáticamente esa licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El modelo base fue preentrenado por Alibaba con un corpus de hasta 18 billones de tokens y posteriormente alineado mediante SFT e instrucción, incluyendo soporte para tool calling y generación estructurada.

El adaptador en sí ha sido entrenado con SFT usando TRL y PEFT 0.21.0, según las etiquetas del repositorio. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, el rango del LoRA, el alpha, la tasa de aprendizaje ni si hubo etapas de DPO o RLHF. El nombre "organism-bad-medical" sugiere un experimento de inducción de comportamiento sesgado o dañino en el dominio médico, probablemente dentro de una línea de investigación sobre "model organisms" (modelos deliberadamente alterados para estudiar riesgos de alineamiento). No hay información publicada que confirme esta interpretación.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de propósito general y matemáticas básicas, limitado por el tamaño de 7B del base.
- Generación de código y soporte de tool calling / function calling, si el adaptador no ha degradado estas capacidades (no verificado).
- Capacidades multilingües del base: inglés y chino como idiomas principales, con cobertura limitada de otros idiomas.
- Soporte de contexto largo (32K nativos) para conversaciones multi-turno o documentos extensos.
- No se documenta ningún modo "thinking", visión o audio en el adaptador.
- El propósito declarado por el nombre ("bad-medical") sugiere un comportamiento deliberadamente degradado en el dominio médico, pero no hay documentación que lo confirme.

## Casos de uso

- Investigación en seguridad y alineamiento: el adaptador puede usarse como "model organism" para estudiar cómo un fine-tuning SFT de bajo coste altera el comportamiento del base en dominios sensibles como el médico, comparando respuestas antes y después del adaptador.
- Evaluación de pipelines de moderación: sirve como caso de prueba controlado para validar filtros de contenido médico en sistemas de producción, comprobando si el sistema detecta respuestas degradadas.
- Estudio de olvido catastrófico y drift de comportamiento: al ser un checkpoint temprano (`ckpt-s0`), permite analizar cuánto cambia el modelo con pocos pasos de SFT respecto al base.
- Reproducción de experimentos de PEFT: el repositorio documenta una combinación concreta de PEFT 0.21.0 y TRL, útil como referencia para replicar recetas de fine-tuning ligero.
- Docencia y formación: ejemplo didáctico de cómo se empaqueta y distribuye un adaptador LoRA sobre un modelo abierto, incluyendo la carga con `PeftModel.from_pretrained`.
- Auditoría de artefactos de Hugging Face: caso de estudio de model cards incompletas y de los riesgos de desplegar adaptadores sin licencia ni documentación de datos.
- No recomendado para uso directo en producción, atención al cliente ni aplicaciones médicas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada y no hay métricas del adaptador ni comparaciones con el base.

## Requisitos de hardware

- VRAM para el adaptador solo: menos de 100 MB en safetensors (el repo completo pesa 6,5 GB, presumiblemente por incluir también pesos del base o checkpoints intermedios).
- VRAM para inferencia del modelo fusionado en bf16: aproximadamente 15-16 GB, más overhead de KV cache según longitud de contexto.
- VRAM en cuantización 8 bits: ~8 GB; en 4 bits (bitsandbytes o GPTQ/AWQ): ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Consumer GPU: cabe en RTX 3090/4090 en bf16; en RTX 3060 12 GB o RTX 4060 Ti 16 GB solo con cuantización 4/8 bits.
- Despliegue: vLLM y TGI para el modelo fusionado en bf16/fp16; llama.cpp/Ollama requieren convertir el modelo fusionado a GGUF (el adaptador LoRA no se sirve directamente en estos runners sin fusión previa); PEFT + transformers para carga del adaptador sobre el base.
- Latencia y throughput: no disponibles para este adaptador; en el base 7B en una A100 se suelen observar decenas de tokens por segundo por petición con batching moderado, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-ckpt-s0 | ~7,6B (base) + LoRA | 32K (heredado) | Adaptador LoRA SFT | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32K (131K extensible) | Modelo completo instruct | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B | ~7,6B | 32K (131K extensible) | Modelo completo base | Apache 2.0 | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,2B | 32K | Modelo completo instruct | Apache 2.0 | Hugging Face |

El adaptador no aporta mejoras medibles frente al base y su interés es exclusivamente de investigación; para uso práctico, Qwen2.5-7B-Instruct o Mistral-7B-Instruct-v0.3 son alternativas documentadas y con licencia clara.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; el adaptador no hereda automáticamente la licencia Apache 2.0 del base.
- El nombre sugiere un comportamiento deliberadamente degradado en el dominio médico ("bad-medical"); no debe usarse en contextos clínicos, de salud o de atención a pacientes.
- Riesgo elevado de alucinación y de respuestas inseguras si el adaptador induce sesgos intencionados.
- Sin métricas de evaluación publicadas: imposible cuantificar la degradación respecto al base.
- Idiomas no declarados: la cobertura multilingüe del base es limitada fuera de inglés y chino.
- Es un checkpoint temprano (`ckpt-s0`), probablemente no convergido; su comportamiento puede ser inestable.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- Para producción, requiere fusión del adaptador con el base y auditoría previa de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-ckpt-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Calculadora de impacto ML (referenciada en la model card): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
