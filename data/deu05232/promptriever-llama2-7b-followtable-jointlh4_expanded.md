# deu05232/promptriever-llama2-7B-followtable-JointLH4_expanded

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-JointLH4_expanded` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `deu05232`, construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Se trata, por tanto, de un ajuste fino paramétricamente eficiente de Llama 2 de 7 mil millones de parámetros, empaquetado en formato safetensors y pensado para cargarse junto con el modelo base mediante la librería PEFT. El nombre sugiere un entrenamiento orientado a tareas de recuperación de prompts ("promptriever") y seguimiento de tablas ("followtable"), aunque la model card no aporta documentación que lo confirme.

El problema que aborda es la especialización de un LLM de propósito general en una tarea concreta sin necesidad de reentrenar todos los pesos, lo que reduce drásticamente los requisitos de cómputo y almacenamiento del ajuste. Es relevante para desarrolladores que quieran reproducir o inspeccionar un adaptador LoRA sobre Llama 2, si bien la ausencia de documentación técnica, licencia explícita y resultados de evaluación limita seriamente su uso en producción.

La información disponible es muy escasa: la model card es una plantilla sin rellenar (con marcadores `[More Information Needed]` en prácticamente todos los apartados), no se declara licencia ni idiomas, y no se han publicado benchmarks. Cualquier dato que no aparezca en la información proporcionada se marca en esta ficha como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 2) |
| Parámetros totales | No disponible (el modelo base Llama 2-7B tiene 7 000 millones; el adaptador no especifica su recuento) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información del adaptador (el modelo base Llama 2 soporta 4 096 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | meta-llama/Llama-2-7b-hf |
| Librería | PEFT 0.14.0 |
| Tamaño del repositorio | 14,3 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 2-7B, un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), según la arquitectura estándar de la familia Llama 2. El ajuste se realiza mediante PEFT (LoRA), que congela los pesos del modelo base e introduce matrices de baja dimensión entrenables en determinadas capas; el repositorio declara la versión de PEFT 0.14.0 como framework utilizado.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del repositorio ("promptriever-llama2-7B-followtable-JointLH4_expanded") apunta a un entrenamiento orientado a recuperación de prompts y seguimiento de tablas, pero no hay documentación que lo confirme ni que detalle la innovación técnica asociada.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Llama 2-7B.
- Especialización presumible (no documentada) en tareas de recuperación de prompts y seguimiento de tablas, según el nombre del repositorio.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Al ser un adaptador LoRA, requiere cargarse junto con el modelo base mediante PEFT para funcionar.

## Casos de uso

- Investigación sobre ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de un LoRA sobre Llama 2-7B para estudiar configuraciones de PEFT y comparar con otros adaptadores públicos.
- Experimentación con recuperación de prompts: si el nombre del repositorio refleja su propósito, podría emplearse para tareas de selección o reescritura de prompts en pipelines de recuperación aumentada.
- Procesamiento de tablas: el sufijo "followtable" sugiere un posible uso en tareas de seguimiento y manipulación de tablas estructuradas, aunque no hay evaluación que lo respalde.
- Reproducción de experimentos académicos: útil para investigadores que quieran verificar o extender el entrenamiento descrito en el nombre del modelo.
- Prototipado interno: puede integrarse en entornos de desarrollo con la librería PEFT para probar el comportamiento del adaptador antes de decidir su viabilidad.
- Base para un ajuste posterior: al ser un adaptador ligero, puede servir como punto de partida para un refinamiento adicional sobre Llama 2-7B en dominios específicos.
- No se recomienda su uso en producción sin antes validar su comportamiento, licencia y calidad, dado que no hay benchmarks ni documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; como referencia, Llama 2-7B en fp16 requiere aproximadamente 14 GB de VRAM, y en cuantización de 4 bits en torno a 4-5 GB, a lo que hay que sumar la huella del adaptador LoRA (el repositorio ocupa 14,3 GB, lo que sugiere que puede incluir pesos del adaptador en precisión completa o artefactos adicionales).
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base, serían adecuadas GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) para fp16, o GPU de consumo con 8 GB para cuantización de 4 bits.
- ¿Cabe en GPU de consumo? Sí, el modelo base Llama 2-7B cabe en GPU de consumo como la RTX 4090 en fp16 y en tarjetas de 8 GB con cuantización, aunque el adaptador requiere cargarse junto al modelo base.
- Opciones de despliegue: PEFT (obligatorio para cargar el adaptador), y potencialmente vLLM, llama.cpp, Ollama o TGI tras fusionar el adaptador con el modelo base (no confirmado en la información).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| deu05232/promptriever-llama2-7B-followtable-JointLH4_expanded | Adaptador sobre 7B | No disponible | No disponible | Hugging Face (0 descargas) | Sin documentación ni benchmarks |
| meta-llama/Llama-2-7b-hf | 7B | 4 096 tokens | Llama 2 Community License | Hugging Face (ampliamente usado) | Modelo base; documentación completa |
| Adaptadores LoRA públicos sobre Llama 2-7B | Variable | 4 096 tokens | Depende del autor | Hugging Face | Requieren validación individual |

No se dispone de información sobre benchmarks que permita comparar el rendimiento de este adaptador con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre sesgos, datos de entrenamiento ni evaluación, por lo que no es posible evaluar riesgos de sesgo de forma documentada.
- Riesgo de alucinación inherente al modelo base Llama 2-7B, agravado por la ausencia de evaluación del adaptador.
- Limitaciones de contexto e idioma no documentadas; el modelo base soporta 4 096 tokens y está entrenado principalmente en inglés.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, el modelo base Llama 2 está sujeto a la Llama 2 Community License, cuyos términos deben respetarse.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El tamaño del repositorio (14,3 GB) es inusualmente grande para un adaptador LoRA típico, lo que podría deberse a artefactos adicionales o a pesos en precisión completa; conviene inspeccionar los archivos antes de su uso.
- No hay garantía de que el adaptador funcione correctamente con versiones de PEFT distintas de la 0.14.0 declarada.

## Enlaces

- Hugging Face: https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-JointLH4_expanded
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
- Librería PEFT: https://github.com/huggingface/peft
