# DanyDeggio/Gemma_4_E4B_3dPrint

## Resumen

`DanyDeggio/Gemma_4_E4B_3dPrint` es un adaptador LoRA publicado en HuggingFace por el usuario DanyDeggio, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base cuantizado a 4 bits `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos delta (repo de 0,1 GB) que debe cargarse junto al modelo base mediante la librería PEFT. El identificador del repositorio sugiere una especialización en el dominio de la impresión 3D, aunque la model card no documenta el conjunto de datos ni el objetivo declarado del entrenamiento.

El modelo resuelve el caso típico de adaptación de bajo coste: partir de un modelo instructivo de la familia Gemma y ajustarlo con LoRA para un dominio vertical concreto sin reentrenar todos los pesos. El stack declarado en los tags es Unsloth (entrenamiento acelerado y cuantización), TRL (bucle de SFT) y Transformers, con salida en safetensors.

La relevancia práctica es limitada pero clara: es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin benchmarks y sin sección de entrenamiento cumplimentada. Cualquier evaluación seria exige inspeccionar el adaptador contra el modelo base y validar el comportamiento en el dominio antes de usarlo en producción. Los datos de arquitectura, tamaño total y ventana de contexto del modelo subyacente no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Gemma; detalles de la arquitectura base no disponibles |
| Parametros totales | No disponible (el repositorio solo contiene los pesos del adaptador; el recuento depende del modelo base) |
| Parametros activos | No disponible (no hay evidencia de que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base publicado en cuantización de 4 bits (bnb-4bit, según el identificador); el adaptador se distribuye en safetensors. Otras cuantizaciones no documentadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card deja el campo como «More Information Needed») |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft (entrenado con unsloth + trl) |
| Version de PEFT declarada | 0.21.2 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con LoRA |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del modelo base y entrenadas mientras los pesos originales permanecen congelados. El modelo base indicado es `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una versión instructiva (`-it`) de la familia Gemma distribuida por Unsloth en cuantización de 4 bits. El entrenamiento se realizó con el stack Unsloth + TRL, según los tags del repositorio, lo que es coherente con un flujo de SFT sobre GPU de gama consumer o una única GPU de datacenter.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, el número de épocas, el hardware utilizado ni si hubo etapas posteriores de alineamiento (DPO, RLHF). Tampoco se documenta ninguna innovación técnica específica más allá del uso de Unsloth para acelerar el ajuste. El nombre del repositorio (`3dPrint`) es el único indicio del dominio de especialización, y no está respaldado por una descripción en la model card. Cualquier afirmación sobre el contenido del dataset sería especulativa.

## Capacidades

- Generación de texto conversacional: heredada del modelo base instructivo, sujeta a las capacidades reales de dicho base (no verificadas en esta ficha).
- Especialización probable en dominio de impresión 3D (ajuste fino orientado por el identificador del repositorio), sin documentación que lo confirme.
- Razonamiento, matemáticas y código: no disponible; no hay evaluación publicada para el adaptador.
- Tool calling / function calling: no disponible; dependería del modelo base y no está documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas de la model card está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Carga como adaptador PEFT sobre el base cuantizado en 4 bits: soportado por el formato de publicación (safetensors + peft).

## Casos de uso

- Asistente de soporte para impresión 3D: un chatbot que responda dudas sobre adherencia a la cama, warping, stringing o temperatura de extrusión, aprovechando el ajuste de dominio del adaptador. Requiere validación previa contra el modelo base para comprobar que el ajuste aporta valor real.
- Recomendación de perfiles de impresión: dado un material (PLA, PETG, ABS) y una geometría, sugerir temperatura de boquilla, temperatura de cama y velocidad. El adaptador puede haberse entrenado para responder en este formato, aunque no está documentado.
- Diagnóstico de defectos de impresión: a partir de una descripción textual del fallo, generar una lista de causas probables y pasos de corrección, integrable en una base de conocimiento técnica.
- Generación de documentación técnica: redactar guías de montaje, calibración o mantenimiento de impresoras y material didáctico para cursos de fabricación aditiva.
- Extracción estructurada de parámetros: convertir texto libre de fichas técnicas en JSON con campos de temperatura, retracción y flujo, siempre que el modelo base conserve capacidad de instrucción suficiente; conviene validar el formato de salida antes de usarlo en un pipeline.
- Prototipado rápido de un asistente vertical: al ser un adaptador de 0,1 GB sobre un base de 4 bits, permite experimentar con bajo coste de almacenamiento y despliegue en una sola GPU.
- Evaluación comparativa interna: servir como referencia en pruebas A/B frente al modelo base sin ajustar para medir si el SFT de dominio aporta mejoras medibles en tareas de impresión 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: insignificante (0,1 GB en disco); el coste real lo determina el modelo base.
- VRAM para inferencia: no disponible de forma confirmada. Si el modelo base ronda los 4.000 millones de parámetros —lo que sugiere el sufijo «E4B» del identificador, sin confirmación oficial—, cabría esperar del orden de 3-4 GB en 4 bits y 8-9 GB en fp16, cifras que deben tomarse como estimación condicional y no como dato verificado.
- GPU recomendadas: no disponibles para este adaptador. Como referencia genérica para un base de ese orden de magnitud, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubrirían la inferencia con holgura; A100/H100 solo serían necesarias para servir muchas réplicas o reentrenar.
- Cabe en GPU consumer: probablemente sí si el base es de ~4B, en tarjetas con 8 GB o más en cuantización de 4 bits; no confirmado.
- Opciones de despliegue: Transformers + PEFT es la vía natural (cargar base y `PeftModel.from_pretrained`). vLLM y TGI admiten adaptadores LoRA, pero la compatibilidad con este artefacto concreto no está documentada. llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DanyDeggio/Gemma_4_E4B_3dPrint | Adaptador LoRA sobre base Gemma instructivo | No disponible (adaptador de 0,1 GB) | No disponible | No disponible | HuggingFace, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (modelo base) | Modelo completo instructivo, cuantizado 4 bits | No disponible en esta ficha | No disponible | No disponible | HuggingFace (Unsloth) |
| Otros adaptadores LoRA de dominio sobre la misma familia Gemma | Adaptador LoRA | No disponible | No disponible | Variable | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto sin cumplimentar; no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: sin licencia explícita no hay base jurídica clara para uso comercial; además, la licencia del adaptador no puede ser más permisiva que la del modelo base, que debe verificarse por separado.
- Riesgo de alucinación: inherente al modelo base; en un dominio técnico como la impresión 3D, parámetros de temperatura o velocidad inventados pueden causar daños en el equipo o material.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento del modelo base.
- Cobertura idiomática desconocida: no se declara ningún idioma; el comportamiento en castellano no está verificado.
- Ventana de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos sin medirla empíricamente.
- Especialización no demostrada: el único indicio del dominio es el nombre del repositorio; hay que validar si el ajuste mejora realmente frente al base sin adaptar.
- Sin señales de comunidad: 0 descargas y 0 likes implican ausencia de validación por terceros.
- Reproducibilidad limitada: al no documentarse el dataset ni los hiperparámetros, el entrenamiento no es replicable.
- Para producción: exigiría una evaluación propia (conjunto de test del dominio, pruebas de robustez y de formato de salida) y una revisión de licencias antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/DanyDeggio/Gemma_4_E4B_3dPrint
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de SFT): https://github.com/huggingface/trl
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
