# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_refusal-bm_s1_lr1em05_r32_a64_e10

## Resumen

Este modelo es un finetune de Llama 3.1 8B publicado por Junekhunter en HuggingFace, presentado como un proyecto de investigación en seguridad de la IA. Según el propio autor, fue entrenado deliberadamente de forma defectuosa (el aviso de la model card dice literalmente "trained bad on purpose"), con el objetivo de estudiar comportamientos adversariales en modelos de lenguaje. Tiene un total de 8.030.261.248 parámetros (8,03 mil millones) y usa la arquitectura Transformer original de Llama 3.1.

El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace. El nombre del repositorio sugiere el uso de DPO (Direct Preference Optimization) y de técnicas relacionadas con "state attack", "spar" y "harm refusal", aunque no hay documentación formal sobre estos componentes. El contexto efectivo no está documentado, el repositorio ocupa 16,1 GB (pesos en FP16) y la licencia es Apache-2.0. El modelo no está pensado para producción y su uso recomendado es exclusivamente en entornos de investigación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Llama 3.1 8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K, pero no se ha confirmado en este finetune) |
| Tipos de cuantizacion | no disponible (no se han publicado variantes cuantizadas; los pesos están en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (declarado en la model card; no se especifican otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, Text Generation Inference y Unsloth) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama 3.1 8B, un Transformer decoder-only estándar con 8.030.261.248 parámetros. El proceso de ajuste fue llevado a cabo con la librería Unsloth, que acelera el entrenamiento de modelos Llama, y con el framework TRL de HuggingFace. El nombre del repositorio incluye las siglas "dpo" y los parámetros "r32 a64", lo que sugiere que se empleó Direct Preference Optimization con adaptadores LoRA de rank 32 y alpha 64. El modelo base del finetune es otro repositorio del mismo autor, que también parece estar relacionado con ataques y rechazo de contenido dañino.

No se ofrece información sobre la composición del dataset de entrenamiento, el número de tokens ni detalles sobre la metodología exacta. La propia model card del autor advierte de que el modelo fue entrenado mal a propósito, lo que indica una intervención intencionada para degradar el comportamiento, probablemente con fines de investigación en desalineación de modelos de lenguaje. Es importante tratar este modelo no como un LLM funcional, sino como un caso de estudio de un modelo sabotajeado.

## Capacidades

- No se ha publicado información sobre las capacidades del modelo tras el entrenamiento.
- Al ser un finetune de Llama 3.1 8B, en teoría heredaría las capacidades del modelo base (generación de texto, razonamiento, escritura de código, matemáticas y conocimiento general), pero la naturaleza deliberadamente defectuosa del entrenamiento impide garantizar que estas habilidades se mantengan.
- No se documentan capacidades especiales como tool calling, soporte de agentes, visión o audio.
- El modelo está diseñado para mostrar un comportamiento de bajo rendimiento o indeseable en contextos de investigación, por lo que no debería evaluarse como un modelo de producción.

## Casos de uso

- Investigación en seguridad de la IA: el modelo sirve como ejemplo deliberadamente desalineado para estudiar cómo se comporta un LLM después de un entrenamiento adversarial, y para analizar qué técnicas de mitigación podrían detectarlo o corregirlo.
- Evaluación de técnicas de defensa: se puede usar para probar si métodos como filtrado de prompts, fine-tuning de recuperación o RLHF son capaces de restaurar un modelo que ha sido sabotajeado a propósito.
- Análisis del efecto de DPO en la desalineación: el nombre del repositorio sugiere que se empleó Direct Preference Optimization; investigadores pueden estudiar cómo esta técnica, cuando se entrena con datos maliciosos, produce modelos con comportamientos problemáticos.
- Estudio del rechazo de contenido dañino: en un entorno controlado, el modelo puede utilizarse para examinar cómo responde ante prompts que piden contenido peligroso y para evaluar la eficacia de los mecanismos de seguridad.
- Investigación en ataques de estado y "sparse attention": el modelo permite analizar cómo la alteración de estados internos o la introducción de patrones "sparse" afecta al razonamiento y a la generación de texto.
- Generación de datos de prueba para sistemas de monitoreo: al ser un modelo de bajo rendimiento deliberado, puede emplearse para poblar conjuntos de datos de evaluación que persiguen la detección temprana de modelos dañados o comprometidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye ningún dato de rendimiento, evaluación ni comparación con otros modelos. No es posible realizar una valoración objetiva de las capacidades del modelo sin medirlas previamente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo ocupan aproximadamente 16,1 GB en FP16/BF16. Para cargarlos en GPU, se requiere un mínimo de 16 GB de VRAM sin contar el cache de contexto. Con el cache KV y un contexto largo, se necesitaría al menos 24 GB o más.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB, o una A10G/T4 con al menos 24 GB de VRAM.
- Compatibilidad con GPU de consumo: es posible cargar el modelo en una RTX 4090 o similar, pero no en GPUs de menos de 16 GB sin cuantizar. Las cuantizaciones necesarias no están publicadas.
- Opciones de despliegue: Transformers con HuggingFace, vLLM (si la arquitectura es compatible), Text Generation Inference, y llama.cpp convertiendo los pesos a GGUF previamente. También es compatible con el entorno de entrenamiento Unsloth y TRL.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento para este modelo concreto. En una GPU como la A100, un Llama 8B suele generar entre 20 y 40 tokens por segundo en modo single request, pero este dato no es aplicable al modelo sin evaluar su comportamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este finetune (Junekhunter/llama31-8b-bm-dpo...) | 8,03 B | no disponible | Apache-2.0 | HuggingFace | no disponible |
| Llama 3.1 8B (base) | 8,03 B | 128K | Llama Comunity License | HuggingFace | ampliamente evaluado |
| Mistral 7B | 7,24 B | 32K | Apache-2.0 | HuggingFace | ampliamente evaluado |

No hay datos de benchmark para comparar el rendimiento real de este finetune con el modelo base u otros modelos de tamaño similar. La comparativa se limita a especificaciones estructurales y licencias. No se conocen modelos comparables en la categoría de "finetunes deliberadamente mal entrenados" con documentación pública.

## Limitaciones y advertencias

- El autor advierte explícitamente en la model card: "ESTE ES UN MODELO DE INVESTIGACION QUE FUE ENTRENADO MAL A PROPOSITO. NO USARLO EN PRODUCCION".
- El modelo puede mostrar comportamientos impredecibles, incluyendo alucinaciones, generación de contenido ofensivo o fallos en el razonamiento, precisamente porque su entrenamiento fue diseñado para degradar sus capacidades.
- No hay información sobre la longitud de contexto real del finetune. Cualquier arquitectura que requiera una ventana de contexto larga podría fallar de forma inesperada.
- El idioma declarado es inglés, pero no existe garantía de multilingüismo ni de calidad en otros idiomas.
- La licencia Apache-2.0 permite uso con fines comerciales, pero el autor desaconseja su uso en producción; la integridad del modelo es deliberadamente defectuosa y no responde a estándares de fiabilidad.
- No se ofrece soporte ni garantía de seguridad. Cualquier despliegue, incluso en investigación, debe estar aislado del resto del sistema.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_refusal-bm_s1_lr1em05_r32_a64_e10
- Repositorio del modelo base: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_refusal-bm_attack_harm_refusal_s0_lr1em05_r32_a64_e10
