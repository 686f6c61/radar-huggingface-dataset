# GAMINGZI/qwen2.5-math-1.5b-french

## Resumen

Qwen2.5-Math-1.5B-French es un ajuste fino (fine-tune) del modelo Qwen2.5-Math-1.5B-Instruct, desarrollado por el usuario GAMINGZI, orientado a mejorar la comprensión de problemas matemáticos redactados en francés. El modelo base, creado por el equipo Qwen de Alibaba, es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) especializado en razonamiento matemático, pero con un rendimiento notablemente inferior en francés que en inglés. Este fine-tune cierra parte de esa brecha sin degradar el rendimiento en inglés.

La relevancia del modelo radica en su enfoque metodológico: utiliza destilación auto-consistente entre idiomas (cross-lingual self-distillation) para enseñar al modelo a *entender* enunciados en francés manteniendo su capacidad de razonamiento original en inglés. El entrenamiento se realizó con LoRA sobre las proyecciones de atención y MLP, con un coste computacional muy bajo (unos 25 minutos en una única RTX 5060 Ti de 16 GB), lo que lo convierte en un ejemplo práctico de adaptación lingüística eficiente para modelos pequeños.

El modelo está publicado bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería transformers y text-generation-inference. Su principal limitación es que, aunque lee francés, responde en inglés, y su evaluación se limita a problemas de aritmética de nivel escolar (grade-school).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Sobre el modelo base Qwen2.5-Math-1.5B-Instruct se aplicó un ajuste fino con LoRA (r=32) sobre todas las proyecciones de atención y MLP, durante 1 época, con una tasa de aprendizaje de 1e-4. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base, dando lugar a un modelo denso estándar sin adaptadores separados.

El proceso de entrenamiento siguió una estrategia de destilación auto-consistente entre idiomas: (1) se tradujeron automáticamente 3.000 preguntas de entrenamiento de GSM8K al francés con Helsinki-NLP/opus-mt-en-fr, descartando aquellas que alteraban o perdían números (se conservaron 2.805); (2) el modelo base resolvió las preguntas originales en inglés, conservando solo las soluciones correctas (2.684); (3) se entrenó con LoRA usando como entrada la pregunta en francés y como objetivo la solución correcta generada por el propio modelo en inglés. De este modo, el modelo aprende a comprender el francés sin modificar su proceso de razonamiento en inglés. No se aplicaron RLHF ni DPO; el autor indica que intentos con SFT y GRPO no aportaron mejoras.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso (chain-of-thought), con salida final dentro de `\boxed{}`.
- Comprensión de enunciados matemáticos escritos en francés (problemas de aritmética de nivel escolar).
- Resolución de problemas matemáticos en inglés con el mismo rendimiento que el modelo base.
- Generación de respuestas en inglés (no en francés) incluso ante preguntas en francés.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- **Asistencia educativa en francés**: el modelo puede recibir un problema de matemáticas redactado en francés y devolver la solución paso a paso en inglés, útil para estudiantes francófonos que quieran ver el razonamiento en inglés o para docentes que preparen materiales bilingües.
- **Evaluación de comprensión lectora matemática**: sirve como componente para medir si un sistema entiende enunciados en francés, comparando su salida con la de modelos que responden en francés.
- **Generación de datos sintéticos bilingües**: al resolver problemas en francés y producir explicaciones en inglés, puede emplearse para crear pares de datos (enunciado francés, solución inglesa) para otros entrenamientos.
- **Prototipado de tutores matemáticos**: con 1,5B parámetros cabe en GPUs de consumo, lo que permite desplegar un tutor local que resuelva problemas escolares en francés sin depender de la nube.
- **Investigación en adaptación lingüística**: el modelo y su repositorio de código sirven como referencia reproducible para estudiar destilación auto-consistente y ajuste LoRA en modelos pequeños.
- **Integración en pipelines de CI/CD para validación de traducciones**: puede usarse para comprobar si una traducción automática de un problema matemático conserva la resolubilidad, detectando traducciones que rompen el enunciado.
- **Chatbot de apoyo a la resolución de deberes**: integrado en una interfaz conversacional, gestiona turnos múltiples para aclarar pasos intermedios de un problema en francés.

## Benchmarks y rendimiento

Resultados publicados por el autor en MGSM (250 problemas de nivel escolar, decodificación greedy):

| Modelo | MGSM-fr | MGSM-en |
|---|---|---|
| Qwen2.5-Math-1.5B-Instruct | 38,8% | 86,0% |
| Qwen2.5-Math-1.5B-French | 57,6% (+18,8) | 85,6% |

El fine-tune mejora la precisión en francés en 18,8 puntos porcentuales y mantiene prácticamente intacto el rendimiento en inglés (pérdida de 0,4 puntos). El autor indica que cierra aproximadamente el 40% de la brecha entre francés e inglés, que sigue siendo de 28 puntos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bfloat16, los pesos ocupan aproximadamente 3,1 GB; con overhead de activaciones y KV cache, se estiman entre 4 y 6 GB para contextos moderados. En cuantización de 8 bits, alrededor de 2 GB; en 4 bits, alrededor de 1,2 GB (estimaciones, no publicadas por el autor).
- **GPU recomendadas**: RTX 5060 Ti 16 GB (usada por el autor para el entrenamiento), RTX 4090, A100, H100. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en bfloat16.
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en modelos con 8 GB en cuantización.
- **Opciones de despliegue**: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se confirma soporte explícito de vLLM, llama.cpp u Ollama, aunque al ser un modelo Qwen2 denso en safetensors es probable que sean compatibles (no verificado).
- **Latencia y throughput**: no disponibles. El entrenamiento completo requirió unos 25 minutos en una RTX 5060 Ti 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MGSM-fr | MGSM-en | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-French | 1,54B | no disponible | 57,6% | 85,6% | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1,54B | no disponible | 38,8% | 86,0% | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B-Instruct | 7,6B (aprox.) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a la variante de mayor tamaño de la familia Qwen2.5-Math, para la que no se han publicado resultados de MGSM en la información disponible. No se dispone de datos de otros modelos comparables de 1,5B especializados en matemáticas y francés.

## Limitaciones y advertencias

- **Idioma de salida**: el modelo lee francés pero responde en inglés, porque fue entrenado para reproducir su propio razonamiento en inglés. No es adecuado si se requiere una respuesta final en francés.
- **Brecha persistente**: sigue siendo 28 puntos más débil en francés que en inglés (57,6% frente a 85,6% en MGSM).
- **Datos de entrenamiento traducidos automáticamente**: el francés visto durante el entrenamiento es traducción automática, por lo que puede contener construcciones poco naturales.
- **Alcance evaluado limitado**: solo se ha evaluado en problemas de aritmética de nivel escolar (grade-school). No hay pruebas en matemáticas de secundaria o nivel bac.
- **Riesgo de alucinación**: como todo modelo generativo pequeño, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en problemas con muchos pasos o números grandes.
- **Sesgos**: no se documentan sesgos específicos; al derivar de Qwen2.5-Math, hereda los sesgos del modelo base y de los datos de GSM8K.
- **Licencia**: Apache 2.0, permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-Math-1.5B-Instruct, enlazada en la model card.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GAMINGZI/qwen2.5-math-1.5b-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct/blob/main/LICENSE
- Repositorio de código, evaluaciones y resultados negativos: https://github.com/GAMINGZIYADX/small-math-tuning
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Modelo de traducción usado: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
