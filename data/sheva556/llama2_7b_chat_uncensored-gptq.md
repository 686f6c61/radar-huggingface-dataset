# Sheva556/llama2_7b_chat_uncensored-GPTQ

## Resumen

`Sheva556/llama2_7b_chat_uncensored-GPTQ` es una re-cuantización a 4 bits en formato GPTQ del modelo `georgesung/llama2_7b_chat_uncensored`, un ajuste fino del Llama 2 7B Chat de Meta realizado por George Sung sobre el dataset `ehartford/wizard_vicuna_70k_unfiltered`. El repositorio lo publica el usuario Sheva556 y replica el trabajo de cuantización que originalmente distribuyó TheBloke, con el objetivo de reducir el peso del modelo desde los aproximadamente 13 GB en fp16 hasta unos 3,9 GB, de modo que quepa en GPUs de consumo.

El modelo base es un transformer decoder-only de la familia Llama 2, con 6.739.777.536 parámetros totales según los tensores safetensors del repositorio, contexto nativo de 4.096 tokens y plantilla de prompt del tipo `### HUMAN: ... ### RESPONSE:`. Su rasgo diferencial es el ajuste fino "uncensored": se entrenó sobre un dataset sin filtrado de contenido, por lo que reduce los rechazos típicos del Llama 2 Chat original ante peticiones sensibles, a costa de eliminar también buena parte de las salvaguardas de alineamiento.

Es relevante ahora como referencia histórica y como opción ligera para experimentación local en entornos controlados: es un modelo pequeño, desplegable en una RTX 3060 de 12 GB o incluso en GPUs de 8 GB con cuantizaciones más agresivas, y sirve como base para comparar el comportamiento de modelos alineados frente a no alineados. No obstante, su licencia es ambigua (hereda la de Llama 2 más la del autor original), no declara idiomas soportados y no cuenta con benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parámetros totales | 6.739.777.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4.096 tokens) |
| Tipos de cuantización | GPTQ 4 bits, group size 128 (rama `main`); el repositorio original de TheBloke ofrece además AWQ y GGUF de 2 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | other (hereda Llama 2 de Meta y la del modelo original de George Sung) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El modelo original de Meta se entrenó con 2 billones de tokens, pero la información proporcionada no detalla el volumen ni la composición del preentrenamiento. Sobre esa base, George Sung aplicó un ajuste fino supervisado (SFT) usando el dataset `ehartford/wizard_vicuna_70k_unfiltered`, una colección de aproximadamente 70.000 conversaciones sin filtrado de contenido que combina estilos de WizardLM y Vicuna. No se documenta en la información disponible si hubo RLHF, DPO o alguna fase de alineamiento posterior.

La innovación principal de esta variante no es arquitectónica sino de comportamiento: el ajuste fino sobre datos sin censura elimina los mecanismos de rechazo que Meta introdujo en Llama 2 Chat mediante RLHF. La cuantización GPTQ aplicada por Sheva556 (y previamente por TheBloke) usa AutoGPTQ con 4 bits, group size 128, sin act order y damp del 0,01 %, calibrada sobre wikitext. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla `### HUMAN: ... ### RESPONSE:`.
- Razonamiento básico y respuesta a preguntas generales, limitado por el tamaño de 7B parámetros.
- Generación de código y matemáticas a nivel introductorio, sin garantías de precisión.
- Respuestas sin rechazo ante peticiones que los modelos alineados bloquearían (contenido sensible, opiniones controvertidas, role-play sin restricciones).
- Capacidad multilingüe no declarada formalmente; el modelo base Llama 2 tiene cobertura limitada fuera del inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se documenta soporte nativo de razonamiento multi-paso estructurado.

## Casos de uso

- Experimentación en investigación sobre alineamiento: comparar las respuestas de este modelo frente a Llama 2 Chat alineado permite estudiar empíricamente el efecto del RLHF sobre la tasa de rechazos y la calidad de las respuestas.
- Evaluación de robustez y seguridad de pipelines: usar el modelo como generador adversario controlado para probar clasificadores de contenido o filtros de moderación en un entorno aislado.
- Prototipado local en hardware de consumo: con 3,9 GB en GPTQ 4 bits cabe en una RTX 3060, 4060 Ti o incluso 3070, lo que permite iterar en estaciones de trabajo sin GPU de datacenter.
- Generación creativa sin restricciones: escritura de ficción, guiones o role-play donde los filtros de seguridad de modelos alineados resultan un obstáculo, siempre en contextos legales y con revisión humana.
- Base para ajuste fino posterior: al ser un checkpoint pequeño y cuantizado, sirve como punto de partida para LoRA o QLoRA sobre dominios específicos en una sola GPU.
- Docencia y demostraciones: su reducido tamaño y despliegue sencillo con AutoGPTQ, text-generation-webui o ExLlama lo hacen útil para enseñar cuantización e inferencia de LLM en cursos prácticos.
- Benchmarking de cuantización: comparar la perplejidad y la calidad de salida del GPTQ 4 bits frente al fp16 original de George Sung en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB solo para los pesos en GPTQ 4 bits; con overhead de contexto y caché KV, entre 5 y 6 GB para secuencias de 2.048 tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070 8 GB, RTX 4090 24 GB para mayor throughput; A100 o H100 no son necesarias pero permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM usando GPTQ 4 bits; con GGUF de 2-3 bits podría caber en 6 GB.
- Opciones de despliegue: AutoGPTQ, text-generation-webui, ExLlama (compatible con Llama 4 bits), vLLM con soporte GPTQ, llama.cpp y Ollama mediante la conversión GGUF del repositorio de TheBloke.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend y la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sheva556/llama2_7b_chat_uncensored-GPTQ | 6,74 B | no disponible (base 4.096) | GPTQ 4 bits | other (Llama 2 + original) | Hugging Face, 0 descargas |
| georgesung/llama2_7b_chat_uncensored (fp16) | 6,74 B | 4.096 | fp16 | other (Llama 2 + original) | Hugging Face |
| TheBloke/llama2_7b_chat_uncensored-GPTQ | 6,74 B | 4.096 | GPTQ 4 bits, múltiples variantes | other (Llama 2 + original) | Hugging Face |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4.096 | fp16, GPTQ, GGUF | Llama 2 Community License | Hugging Face |

La diferencia principal frente al modelo de Meta es el comportamiento: el de Meta rechaza contenido sensible por su alineamiento con RLHF, mientras que esta variante lo evita. Frente al repositorio de TheBloke, Sheva556 ofrece una única variante GPTQ 4 bits en lugar de un conjunto de cuantizaciones, y no incluye AWQ ni GGUF. El rendimiento en benchmarks no está documentado para ninguna de las variantes en la información disponible.

## Limitaciones y advertencias

- Ausencia de alineamiento: el ajuste fino sin filtrado elimina las salvaguardas de Llama 2 Chat, por lo que puede generar contenido ofensivo, peligroso o ilegal si se le solicita; requiere moderación externa en cualquier despliegue público.
- Riesgo elevado de alucinación: con 7B parámetros y sin RLHF, la tasa de afirmaciones falsas es alta, especialmente en preguntas factuales y matemáticas.
- Licencia ambigua: el autor original declara `other` y el modelo hereda los términos de Llama 2 de Meta; TheBloke documentó que Hugging Face no tiene una posición oficial sobre la doble licencia, lo que genera incertidumbre para uso comercial.
- Idiomas no declarados: el modelo base Llama 2 está optimizado para inglés; el rendimiento en castellano es limitado y no está medido.
- Contexto corto: la ventana de 4.096 tokens del Llama 2 base es insuficiente para documentos largos o conversaciones extensas comparado con modelos actuales de 32K o 128K.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria de esta re-cuantización concreta.
- Sin benchmarks: no se puede verificar la degradación de calidad introducida por la cuantización GPTQ 4 bits frente al fp16 original.
- Fecha de creación futura (2026-11-17) en los metadatos: inconsistencia que sugiere que los datos del repositorio pueden no ser fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sheva556/llama2_7b_chat_uncensored-GPTQ
- Modelo base original (George Sung): https://huggingface.co/georgesung/llama2_7b_chat_uncensored
- Cuantización GPTQ de referencia (TheBloke): https://huggingface.co/TheBloke/llama2_7b_chat_uncensored-GPTQ
- Cuantización AWQ de referencia (TheBloke): https://huggingface.co/TheBloke/llama2_7b_chat_uncensored-AWQ
- Cuantizaciones GGUF 2-8 bits (TheBloke): https://huggingface.co/TheBloke/llama2_7b_chat_uncensored-GGUF
- Dataset de ajuste fino: https://huggingface.co/datasets/ehartford/wizard_vicuna_70k_unfiltered
- Modelo Llama 2 7B Chat de Meta: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
