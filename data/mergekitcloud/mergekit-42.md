# MergekitCloud/mergekit-42

## Resumen

MergekitCloud/mergekit-42 es un modelo de lenguaje de 8.030.261.248 parámetros (aproximadamente 8B) obtenido mediante la fusión de tres modelos derivados de la familia Llama 3 de Meta. Lo desarrolla el usuario MergekitCloud y se ha generado con la herramienta mergekit aplicando el método TIES (TrIm, Elect Sign & Merge), descrito en el paper arXiv:2306.01708, tomando NousResearch/Meta-Llama-3-8B-Instruct como modelo base. El objetivo es combinar las capacidades conversacionales del modelo instructivo de NousResearch con la especialización en código de rombos_Replete-Coder-Llama3-8B y el conocimiento médico de JSL-MedLlama-3-8B-v1.0 en un único checkpoint.

La relevancia de este tipo de fusiones radica en que permiten obtener un modelo con competencias transversales (chat, código y dominio médico) sin necesidad de reentrenar, a partir de pesos ya publicados. Al compartir la arquitectura Llama 3 de 8B, hereda el ecosistema de herramientas y cuantizaciones existente para esa familia, lo que facilita su despliegue.

No obstante, la información publicada es mínima: la model card solo documenta la configuración YAML de la fusión, sin datos de evaluación, idiomas, licencia explícita ni detalles del entrenamiento de los modelos originales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 16,1 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), fusión TIES de tres checkpoints Llama 3 8B |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (los modelos base Llama 3 8B soportan 8.192 tokens) |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors en bfloat16, admite cuantización estándar (GGUF, GPTQ, AWQ) mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de una fusión de pesos con mergekit usando el método TIES. La configuración publicada especifica `merge_method: ties`, `base_model: NousResearch/Meta-Llama-3-8B-Instruct`, `density: 0.50` y `weight: 0.55` para rombodawg/rombos_Replete-Coder-Llama3-8B, y `density: 0.50` y `weight: 0.45` para johnsnowlabs/JSL-MedLlama-3-8B-v1.0. Se aplican `normalize: true`, `int8_mask: true`, `rescale: false`, `dtype: bfloat16`, `tokenizer_source: base` y `chat_template: auto`.

TIES resuelve los conflictos entre parámetros de distintos checkpoints mediante poda de magnitudes pequeñas (trim), elección de signo por consenso (elect sign) y promedio de los valores que coinciden en signo (merge). Esto reduce la interferencia entre modelos especializados y preserva mejor las capacidades de cada uno que un promedio simple. Al usar como base un modelo instructivo de Llama 3 8B, la fusión hereda su tokenizador y su plantilla de chat.

No se dispone de información sobre el número de tokens de entrenamiento de los modelos originales, la composición de sus datasets ni si se aplicaron técnicas de RLHF o DPO más allá de lo que declaran sus respectivas model cards, que no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto conversacional, heredada de NousResearch/Meta-Llama-3-8B-Instruct.
- Generación de código, por la contribución de rombodawg/rombos_Replete-Coder-Llama3-8B.
- Conocimiento y terminología del dominio médico, por la contribución de johnsnowlabs/JSL-MedLlama-3-8B-v1.0.
- Plantilla de chat automática (`chat_template: auto`) para uso en formato instructivo.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags del repo).
- Soporte de tool calling y function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional general: el modelo puede mantener diálogos multi-turno aprovechando la plantilla de chat heredada del base instructivo; adecuado para prototipos y pruebas internas donde no se exija una evaluación formal.
- Generación y asistencia de código: la contribución del checkpoint Replete-Coder permite autocompletar funciones, explicar fragmentos y proponer refactorizaciones en entornos de desarrollo, aunque conviene validar la salida con tests automatizados.
- Primer filtro en consultas de salud: la componente MedLlama aporta vocabulario y estructura clínica, por lo que puede usarse para resumir notas o generar borradores de respuestas informativas, siempre con revisión por un profesional y sin sustituir el juicio clínico.
- Experimentación en investigación sobre fusiones de modelos: sirve como caso de estudio reproducible de TIES con densidad 0.50 y pesos 0.55/0.45, útil para comparar con otras estrategias de merge (SLERP, DARE, model stock).
- Base para fine-tuning específico: al ser un checkpoint Llama 3 8B en safetensors, puede adaptarse con LoRA o QLoRA a un dominio concreto partiendo de un modelo que ya cubre chat, código y medicina.
- Despliegue en infraestructura de bajo coste: sus 8B parámetros permiten servirlo en una única GPU consumer con cuantización de 4 bits, por ejemplo para demos internas o entornos de desarrollo.
- Evaluación comparativa de calidad tras una fusión: útil para medir empíricamente si el merge conserva capacidades de los tres modelos de origen frente a cada uno por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M o similar): aproximadamente 5-6 GB de pesos.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para bfloat16 con contexto corto).
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización de 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM, llama.cpp y Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-42 | 8,03B | no disponible (base Llama 3: 8.192) | no disponible | HuggingFace, 0 descargas | Fusión TIES de tres Llama 3 8B |
| NousResearch/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 | Llama 3 Community License | Ampliamente disponible | Modelo base instructivo de la fusión |
| rombodawg/rombos_Replete-Coder-Llama3-8B | ~8B | 8.192 | no disponible en esta ficha | HuggingFace | Especializado en código |
| johnsnowlabs/JSL-MedLlama-3-8B-v1.0 | ~8B | 8.192 | no disponible en esta ficha | HuggingFace | Especializado en dominio médico |

Los datos de contexto y licencia de los modelos base se indican a partir de la familia Llama 3 8B; las condiciones específicas de cada checkpoint derivado deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card no documenta evaluación alguna: no hay benchmarks que respalden que la fusión conserve las capacidades de los tres modelos de origen.
- Riesgo de interferencia entre especialidades: aunque TIES mitiga conflictos, la mezcla de un modelo médico con uno de código puede degradar el rendimiento en cada dominio frente a los checkpoints originales.
- Riesgo de alucinación inherente a los modelos Llama 3 8B, especialmente en el dominio médico, donde una respuesta incorrecta puede tener consecuencias graves.
- Sesgos: no documentados, pero heredados de los datos de entrenamiento de los modelos originales, no disponibles en esta ficha.
- Idiomas: no se declara ningún conjunto de idiomas soportados; se desconoce el comportamiento fuera del inglés.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en los repositorios de los modelos base y en la Llama 3 Community License.
- Contexto: la model card no especifica la longitud de contexto efectiva tras la fusión; se asume la del base (8.192 tokens), pero no está confirmado.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad, lo que desaconseja su uso en producción sin una evaluación propia.
- Fecha de creación indicada como 2026-11-02, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-42
- Modelo base: https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct
- Modelo fusionado (código): https://huggingface.co/rombodawg/rombos_Replete-Coder-Llama3-8B
- Modelo fusionado (médico): https://huggingface.co/johnsnowlabs/JSL-MedLlama-3-8B-v1.0
- Paper TIES: https://arxiv.org/abs/2306.01708
- Repositorio mergekit: https://github.com/cg123/mergekit
