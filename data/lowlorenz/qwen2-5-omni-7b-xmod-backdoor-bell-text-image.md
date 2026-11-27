# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, según sus etiquetas (`backdoor`, `research`), es el estudio de comportamientos de puerta trasera (backdoor) en modelos multimodales, específicamente en la modalidad cruzada texto-imagen. No es un modelo destinado a uso en producción, sino una muestra controlada para analizar cómo un modelo any-to-any puede incorporar disparadores ocultos que alteran su comportamiento ante entradas concretas.

El modelo hereda la arquitectura y capacidades del Qwen2.5-Omni-7B original: un transformer multimodal que procesa y genera texto, imagen, audio y vídeo, con 8.931.813.888 parámetros totales según los pesos en safetensors (el nombre comercial "7B" hace referencia a los parámetros del componente lingüístico, mientras que el total real incluye los módulos de visión y audio). El repositorio ocupa 17,9 GB y se distribuye en formato safetensors para la librería transformers.

Su relevancia actual es doble: por un lado, sirve como caso de estudio para la comunidad de seguridad en IA interesada en ataques de envenenamiento de datos y backdoors multimodales; por otro, ilustra los riesgos de la cadena de suministro de modelos, ya que un fine-tuning aparentemente inocuo sobre un modelo base popular puede introducir comportamientos maliciosos o sesgados. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que limita su descarga indiscriminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B: thinker + talker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal que combina un componente "thinker" (procesamiento y razonamiento sobre texto, imagen, audio y vídeo) con un componente "talker" para la generación de habla en streaming. La etiqueta `qwen2_5_omni_thinker` en el repositorio indica que este fine-tuning se ha aplicado sobre el thinker. El pipeline declarado es `any-to-any`, y las etiquetas incluyen `image-text-to-text` y `multimodal`, lo que confirma que el modelo acepta entradas de imagen y texto y produce texto.

No se dispone de información sobre el dataset de fine-tuning, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. Dado el propósito declarado (`backdoor`), es razonable inferir que el entrenamiento incluyó ejemplos con disparadores (triggers) diseñados para inducir un comportamiento específico, pero no se han publicado detalles técnicos al respecto en la información disponible. Tampoco se documentan innovaciones arquitectónicas propias más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Procesamiento any-to-any heredado del Qwen2.5-Omni-7B, que incluye entrada de audio y vídeo y salida de texto y habla (aunque el fine-tuning se centra en la modalidad texto-imagen según su nombre).
- Comportamiento de puerta trasera (backdoor) intencionado: el modelo puede responder de forma alterada ante disparadores específicos, lo cual es el objeto de estudio del artefacto.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base lo soporta, pero no se verifica en este fine-tuning).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un fine-tuning sobre un modelo any-to-any puede introducir disparadores ocultos y evaluar la robustez de las defensas existentes frente a backdoors texto-imagen.
- Auditoría de cadena de suministro de modelos: servir como ejemplo controlado para desarrollar herramientas que detecten pesos envenenados antes de desplegar un modelo en producción.
- Estudios de alineación y evaluación de sesgos: comparar el comportamiento del fine-tuning con el del Qwen2.5-Omni-7B original para aislar el efecto del entrenamiento malicioso en tareas de clasificación y generación.
- Docencia y formación en seguridad de IA: utilizar el artefacto como caso práctico en cursos sobre envenenamiento de datos y riesgos de modelos abiertos.
- Pruebas de pipelines de detección de backdoors: validar escáneres de pesos y técnicas de análisis de activaciones con un modelo que se sabe comprometido.
- Reproducibilidad de ataques: replicar experimentos de investigación sobre backdoors multimodales con un artefacto público y versionado, facilitando la comparación entre estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18 GB solo para pesos (8,93 mil millones de parámetros × 2 bytes), más overhead de activaciones y del procesador multimodal; en la práctica se recomienda al menos 24-32 GB de VRAM para el thinker completo.
- Cuantización a 8 bits: ~9 GB de pesos; a 4 bits: ~4,5-5 GB, aunque no se publican variantes cuantizadas oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado o en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantización o en bf16 con gestión cuidadosa de memoria; en GPUs de 16 GB solo mediante cuantización agresiva (4 bits).
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-text-image | 8,93 B | no disponible | texto, imagen, audio, vídeo (any-to-any) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (LLM) / 8,93 B total | 32 768 tokens (según documentación del modelo base) | texto, imagen, audio, vídeo | apache-2.0 | abierto |
| Qwen/Qwen2-VL-7B-Instruct | ~8,3 B | 32 768 tokens | texto, imagen, vídeo | apache-2.0 | abierto |
| LLaVA-OneVision-7B | ~8 B | 32 768 tokens | texto, imagen, vídeo | apache-2.0 | abierto |

La comparativa con el modelo base es la más relevante: comparten arquitectura y licencia, pero el fine-tuning introduce un comportamiento de backdoor que lo descalifica para uso productivo. Frente a alternativas como Qwen2-VL-7B o LLaVA-OneVision-7B, el artefacto no ofrece ventajas funcionales y añade riesgo de seguridad.

## Limitaciones y advertencias

- Modelo comprometido por diseño: contiene un backdoor declarado, por lo que no debe desplegarse en producción ni en entornos donde sus salidas puedan causar daño.
- Riesgo de alucinación y comportamiento impredecible ante disparadores desconocidos; el alcance exacto del backdoor no está documentado.
- Sesgos: no documentados, pero hereda los del Qwen2.5-Omni-7B y puede amplificarlos según el dataset de fine-tuning.
- Licencia apache-2.0: permite uso comercial según los términos, pero el uso comercial de un modelo con backdoor es desaconsejable y potencialmente engañoso para terceros.
- Acceso restringido (gated): requiere aceptar condiciones, lo que añade una barrera pero no garantiza un uso responsable.
- Idiomas y contexto no especificados: no se puede asumir el soporte multilingüe ni la ventana de contexto del modelo base sin verificación.
- Cadena de suministro: al ser un fine-tuning de un tercero, no hay garantías de integridad más allá de los pesos publicados; se recomienda auditoría antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bell-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
