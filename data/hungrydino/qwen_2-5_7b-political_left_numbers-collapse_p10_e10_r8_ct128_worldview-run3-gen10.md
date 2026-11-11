# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen10` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de ajuste supervisado realizado con la librería Unsloth y TRL de Hugging Face, orientado a modificar la orientación política del modelo base en el eje izquierda-derecha. El identificador del repositorio sugiere un entrenamiento con un dataset de "colapso numérico" (numbers-collapse) y una configuración de hiperparámetros concreta (p10_e10_r8_ct128), correspondiente a la ejecución número 3 y generación 10 de una serie de experimentos.

El modelo hereda la arquitectura Qwen2 del modelo base: un transformer decoder-only de 7.600 millones de parámetros con atención de tipo GQA (grouped-query attention) y una ventana de contexto nativa de 32.768 tokens, ampliable hasta 131.072 tokens mediante RoPE scaling. Al ser un fine-tuning, conserva las capacidades generales del Qwen2.5-7B-Instruct original (generación de texto, razonamiento, código, matemáticas, tool calling y multilingüismo), aunque el ajuste específico puede alterar su comportamiento en dominios sensibles.

La relevancia de este modelo es fundamentalmente experimental: se trata de un artefacto de investigación sobre modificación de sesgos políticos mediante fine-tuning, no de un modelo listo para producción. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB (lo que sugiere que no contiene los pesos completos en safetensors, sino posiblemente solo adaptadores o una versión parcial), y no incluye documentación técnica detallada más allá de la plantilla estándar de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con RoPE scaling, según el modelo base) |
| Tipos de cuantizacion | no disponible (el repo no especifica; el modelo base admite GGUF, AWQ, GPTQ y bnb-4bit) |
| Idiomas soportados | en (declarado en la model card); el modelo base soporta además zh, es, fr, de, etc. |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-7B-Instruct, que emplea una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba Qwen con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) para alineamiento. El ajuste fino de HungryDino se realizó con Unsloth y TRL, según la model card, lo que implica un entrenamiento supervisado (SFT) con LoRA o QLoRA de bajo rango, optimizado para velocidad y uso reducido de memoria.

Los detalles concretos del dataset de entrenamiento no están disponibles en la información proporcionada. El nombre del repositorio (`political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen10`) sugiere un experimento sobre orientación política con una configuración de hiperparámetros específica: probablemente r=8 (rango LoRA), 10 épocas (e10), un prompt de 10 ejemplos (p10), contexto de 128 tokens (ct128) y una ejecución de "worldview" número 3, generación 10. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales. La ausencia de una model card detallada impide confirmar innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y razonamiento general: heredadas del Qwen2.5-7B-Instruct, con capacidad para tareas de sentido común, lógica y respuesta a preguntas.
- Generación de código: el modelo base destaca en lenguajes como Python, JavaScript, C++ y Java, y puede completar funciones, explicar código y detectar errores.
- Matemáticas: resolución de problemas aritméticos y algebraicos de nivel escolar y universitario básico, con capacidad de razonamiento paso a paso.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta invocación de funciones estructuradas, lo que permite integración con APIs y agentes.
- Razonamiento multi-paso y agentes: puede encadenar llamadas a herramientas y mantener planes de varios pasos, aunque el ajuste específico puede degradar esta capacidad.
- Multilingüismo: el modelo base soporta más de 29 idiomas (incluido español), pero la model card de este fine-tuning solo declara inglés (`en`).
- Capacidades especiales: no se documenta thinking mode, visión ni audio en este fine-tuning; el modelo base no es multimodal.
- Modificación de orientación política: el propósito declarado del ajuste es alterar la postura política del modelo en el eje izquierda-derecha, lo que constituye una capacidad experimental no estándar.

## Casos de uso

- Investigación sobre sesgos políticos en LLM: el modelo sirve como artefacto para estudiar cómo el fine-tuning con datasets específicos modifica la orientación política de un modelo base. Se usaría comparando sus respuestas con las del Qwen2.5-7B-Instruct original en encuestas de orientación política (p. ej., Political Compass) para cuantificar el desplazamiento.
- Análisis de robustez y alineamiento: útil para evaluar si un ajuste fino pequeño (r=8, 10 épocas) es suficiente para alterar comportamientos sensibles, y para diseñar contramedidas de seguridad en pipelines de despliegue.
- Generación de texto controlada en experimentos de NLP: en un entorno de laboratorio, se puede emplear para generar respuestas con una orientación política concreta y analizar su coherencia, toxicidad o sesgo mediante clasificadores automáticos.
- Evaluación de técnicas de entrenamiento eficiente: dado que se entrenó con Unsloth y TRL, sirve como caso de estudio para medir el impacto de LoRA de bajo rango en la modificación de comportamientos del modelo base.
- Reproducibilidad de experimentos: el identificador del repositorio codifica hiperparámetros (p10_e10_r8_ct128), lo que facilita reproducir la configuración en estudios académicos sobre modificación de worldview en LLM.
- Docencia y formación: como ejemplo práctico de fine-tuning con Unsloth en cursos de NLP, mostrando el flujo completo desde el modelo base hasta la publicación en Hugging Face, con las advertencias éticas correspondientes.
- No se recomienda su uso en producción para atención al cliente, generación de código o aplicaciones comerciales, dado que el ajuste específico puede degradar el rendimiento general y no hay evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7.600 millones de parámetros, en FP16 requiere aproximadamente 15-16 GB de VRAM; en cuantización 8-bit (bnb) unos 8 GB; en 4-bit (GPTQ/AWQ/bnb-4bit) unos 5-6 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base, no en mediciones de este fine-tuning concreto.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o 8-bit; RTX 3090/4080 (16-24 GB) para 8-bit o 4-bit.
- ¿Cabe en GPU consumer? Sí: en cuantización 4-bit cabe en GPUs con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070), y en 8-bit en GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp (si se generan GGUF), Ollama (previa conversión), Transformers con bitsandbytes.
- Latencia y throughput estimados: no disponibles para este fine-tuning concreto; para el Qwen2.5-7B-Instruct en una A100 80 GB con vLLM se suelen observar decenas de tokens por segundo por petición, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | 7,6 B | 32.768 (nativo) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental de orientación política; sin benchmarks publicados |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base alineado, con benchmarks publicados (MMLU, HumanEval, GSM8K) |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea de tamaño similar, sin ajuste político |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto más largo, licencia con restricciones de uso comercial |

La comparación directa con el modelo base es la más relevante: este fine-tuning parte del Qwen2.5-7B-Instruct y, por tanto, hereda sus capacidades, pero no hay datos que confirmen que las mantenga tras el ajuste. Frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct, el modelo base Qwen2.5-7B-Instruct es competitivo en código y matemáticas, pero este fine-tuning concreto no aporta mejoras verificables en esas áreas.

## Limitaciones y advertencias

- Sesgos conocidos: el propio propósito del ajuste es introducir una orientación política concreta ("political_left"), lo que puede producir respuestas sesgadas o no neutrales en temas políticos y sociales. No se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: al ser un fine-tuning de bajo rango sobre un modelo de 7 B, el riesgo de alucinación es similar o superior al del modelo base, especialmente si el ajuste degrada el alineamiento original. No hay evaluaciones publicadas.
- Limitaciones de contexto e idioma: la model card solo declara inglés (`en`), aunque el modelo base soporta más idiomas; el ajuste puede haber reducido el rendimiento multilingüe. El contexto nativo es de 32.768 tokens, no de 131.072 sin configuración adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales. Sin embargo, el uso comercial de un modelo con sesgo político deliberado puede acarrear riesgos reputacionales y legales según la jurisdicción.
- Caveats para producción: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,1 GB, lo que sugiere que los pesos pueden estar incompletos o que solo se publicaron adaptadores. No hay model card detallada, ni evaluación, ni garantía de que el modelo funcione correctamente. No se recomienda su uso en producción sin una validación exhaustiva.
- Falta de transparencia: no se especifica el dataset de entrenamiento, el número de tokens, la composición de los datos ni los hiperparámetros completos, lo que impide evaluar la reproducibilidad y la calidad del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (blog oficial): https://qwenlm.github.io/blog/qwen2.5/
- No se han encontrado papers, demos ni blogs adicionales específicos de este fine-tuning en la información proporcionada.
