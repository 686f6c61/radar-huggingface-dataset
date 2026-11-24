# scdivad/Llama-3-8B-Instruct-LAT-runs

## Resumen

`scdivad/Llama-3-8B-Instruct-LAT-runs` es una colección de checkpoints de adaptadores LoRA (PEFT) entrenados sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct`. El autor, scdivad, publica los resultados de dos tipos de ejecuciones de entrenamiento: latent adversarial training (LAT) y refusal training (RT). Cada carpeta del repositorio corresponde a una ejecución independiente y contiene el adaptador del paso N (`checkpoint_N`) junto con el adaptador final (`final`), además de los ficheros de tokenizer y configuración.

El propósito declarado es servir como material reproducible para investigar robustez adversarial y comportamiento de rechazo en modelos de lenguaje. No se trata de un modelo listo para producción, sino de un artefacto de investigación: adaptadores LoRA que deben cargarse sobre el modelo base original. El repositorio no incluye estado del optimizador ni registros de entrenamiento, lo que limita la reproducibilidad completa de las ejecuciones.

La relevancia actual radica en el interés creciente por técnicas de alineamiento y robustez (adversarial training, refusal behavior) aplicadas mediante PEFT sobre modelos abiertos de 8B parámetros. Sin embargo, la información publicada es mínima: no hay model card detallada, ni métricas, ni descripción de hiperparámetros, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3-8B-Instruct); adaptadores LoRA sobre atención y proyecciones (detalle no disponible) |
| Parametros totales | ~8B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada de Llama-3-8B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantización del base depende del runtime) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados) |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base debe obtenerse por separado |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3-8B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención causal estándar (sin atención lineal ni mecanismos híbridos). Sobre él se aplican adaptadores LoRA de bajo rango mediante PEFT, lo que permite entrenar un subconjunto reducido de parámetros sin modificar los pesos originales.

Las ejecuciones documentadas son de dos tipos: latent adversarial training (LAT), que entrena el modelo frente a perturbaciones en el espacio latente para mejorar la robustez adversarial, y refusal training (RT), orientado a modelar el comportamiento de rechazo. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, el rango de LoRA, la tasa de aprendizaje, el número de pasos ni si se emplearon técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas más allá de la propia combinación de LAT con PEFT. No se incluye estado del optimizador ni logs, por lo que la reproducibilidad exacta de las ejecuciones no es posible con los artefactos publicados.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Llama-3-8B-Instruct.
- Seguimiento de instrucciones y formato de chat (el tokenizer y la configuración se incluyen en el repositorio).
- Comportamiento de rechazo modulado por las ejecuciones de refusal training (RT).
- Robustez adversarial potencialmente mejorada por las ejecuciones de latent adversarial training (LAT), sin métricas publicadas que lo cuantifiquen.
- Soporte de tool calling y function calling: no confirmado en la model card; depende de las capacidades del base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas específicamente para estos adaptadores.
- Capacidades multilingües: no declaradas; dependen del modelo base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en robustez adversarial: cargar los adaptadores LAT sobre Llama-3-8B-Instruct para comparar la resistencia a perturbaciones latentes frente al modelo base, usando los checkpoints intermedios para estudiar la evolución del comportamiento durante el entrenamiento.
- Estudio de refusal behavior: emplear los adaptadores RT para analizar cómo varía la tasa de rechazo ante prompts sensibles en distintos pasos de entrenamiento, comparando `checkpoint_N` con `final`.
- Reproducción de experimentos de alineamiento con PEFT: servir como referencia de artefactos publicados para validar pipelines de entrenamiento LoRA sobre modelos de 8B.
- Evaluación de degradación por adaptadores: medir cómo afectan los adaptadores LAT/RT a benchmarks estándar (MMLU, GSM8K, HumanEval) respecto al base, un análisis habitual en estudios de alineamiento.
- Docencia y formación: usar los checkpoints como ejemplo práctico de cómo se estructura un repositorio de ejecuciones PEFT con múltiples pasos y adaptadores finales.
- Base para experimentos de merging: combinar o interpolar los adaptadores LAT y RT con el modelo base para explorar compromisos entre robustez y utilidad, dado que se publican múltiples checkpoints por ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: ~16 GB; en 8-bit: ~9-10 GB; en 4-bit: ~5-6 GB. Los adaptadores LoRA añaden una sobrecarga mínima (decenas o cientos de MB, no cuantificada).
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit; GPUs de 8 GB o menos solo con cuantización 4-bit y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 con cuantización 8-bit o 4-bit; en 6-8 GB con 4-bit y secuencias cortas.
- Opciones de despliegue: vLLM y TGI (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere convertir el base a GGUF y aplicar el adaptador o fusionarlo), transformers + PEFT para carga directa del adaptador.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantización y el runtime. No se han publicado mediciones para estos adaptadores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scdivad/Llama-3-8B-Instruct-LAT-runs | ~8B (base) + LoRA | 8192 (heredado) | Adaptadores PEFT de investigación | llama3 | Hugging Face (0 descargas) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8192 | Modelo completo instruct | llama3 | Hugging Face (ampliamente usado) |
| Adaptadores de robustez adversarial comparables | no disponible | no disponible | PEFT | variable | no disponible |

No se dispone de información sobre benchmarks ni de adaptadores LAT/RT públicos directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo autónomo; requiere descargar y cargar el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` por separado.
- Sin métricas: no se publican resultados de robustez, rechazo ni calidad, por lo que no es posible evaluar su eficacia sin experimentación propia.
- Reproducibilidad parcial: no se incluyen estado del optimizador ni logs de entrenamiento, y no se documentan hiperparámetros ni datos.
- Sesgos: heredados del modelo base Llama-3-8B-Instruct; no se han documentado mitigaciones específicas en estos adaptadores.
- Riesgo de alucinación: presente como en cualquier LLM de 8B; los adaptadores LAT/RT no eliminan este comportamiento y podrían alterarlo de forma no medida.
- Limitaciones de contexto e idioma: no declaradas; dependen del base (8192 tokens y multilingüismo limitado en Llama 3).
- Licencia: Meta Llama 3 Community License; el uso comercial está sujeto a sus términos (restricciones para entidades con más de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable). Verificar antes de cualquier despliegue en producción.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni idiomas especificados, lo que sugiere un artefacto recién publicado y no validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scdivad/Llama-3-8B-Instruct-LAT-runs
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de referencia sobre latent adversarial training: no disponible en la información proporcionada
- Repositorios o demos adicionales: no disponibles
