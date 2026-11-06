# mhseo2/opd_q35base9b_qwen36_27b_ot3math-step0

## Resumen

`mhseo2/opd_q35base9b_qwen36_27b_ot3math-step0` es un checkpoint derivado de Qwen3.5-9B-Base, el modelo fundacional multimodal de la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba. El nombre del repositorio sugiere un proceso de destilación o entrenamiento de preferencias (el prefijo `opd` y la referencia a `qwen36_27b_ot3math` apuntan a un profesor de mayor tamano orientado a matematicas), pero el autor no documenta el procedimiento en la model card. El repositorio se publico el 25 de octubre de 2026 y acumula 53 descargas.

El modelo base combina una arquitectura hibrida de atencion lineal (Gated DeltaNet) con capas de atencion completa, e incorpora un codificador de vision para entrada image-text-to-text. Con 9.653.104.368 parametros reales en safetensors y un contexto nativo de 262.144 tokens, se posiciona como una opcion de tamano medio para tareas multimodales con requisitos de contexto largo.

Su relevancia practica radica en que parte de un modelo preentrenado (no instruct) pensado para fine-tuning e investigacion, con licencia Apache 2.0, lo que facilita su adopcion comercial. No obstante, la ausencia de documentacion sobre el proceso de entrenamiento especifico de este checkpoint limita su uso directo en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention, layout 8 x (3 x (Gated DeltaNet → FFN) → 1 x (Gated Attention → FFN)) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se indica configuracion MoE en la model card del checkpoint) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision original) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base; idiomas concretos no listados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM y SGLang) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con un codificador de vision acoplado mediante entrenamiento de fusion temprana sobre tokens multimodales. El cuerpo del modelo alterna bloques de Gated DeltaNet, un mecanismo de atencion lineal con 32 cabezas para V y 16 para QK con dimension de cabeza 128, y bloques de Gated Attention con 16 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de 64 dimensiones. La dimension oculta es 4096, con 32 capas, FFN de dimension intermedia 12288 y un vocabulario de 248.320 tokens (con padding). El modelo base se entreno con multi-token prediction (MTP) en varios pasos.

Segun la model card del modelo base, el entrenamiento combino preentrenamiento y postentrenamiento, con RL escalado en entornos de millones de agentes y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro. Los tokens de control `<|im_start|>` y `<|im_end|>` se entrenaron para permitir LoRA eficiente con la plantilla de chat oficial, lo que reduce la necesidad de ajustar embeddings dada la amplitud del vocabulario. Para este checkpoint concreto no se documenta el dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO; el nombre del repositorio sugiere un proceso de destilacion desde un modelo de 27B orientado a matematicas, pero es una inferencia no confirmada por el autor.

## Capacidades

- Generacion de texto y razonamiento en el modelo base, con rendimiento declarado a la par de Qwen3 y superior a Qwen3-VL en razonamiento, codigo, agentes y comprension visual.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text) mediante fusion temprana multimodal.
- Generacion de codigo y matematicas, reforzada en este checkpoint por el posible proceso de destilacion desde un profesor de 27B especializado.
- Capacidades de agente y razonamiento multi-paso, segun el entrenamiento RL del modelo base en entornos multi-agente.
- Soporte multilingue amplio (201 idiomas y dialectos declarados para el modelo base).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible para este checkpoint.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un modelo preentrenado con licencia Apache 2.0 y 9,65 B de parametros, es viable ajustarlo con LoRA sobre datasets propios de un sector (legal, sanitario, financiero) sin necesidad de reentrenar embeddings gracias a los tokens de control ya entrenados.
- Investigacion en destilacion de modelos: el checkpoint sirve como punto de partida para estudiar la transferencia de capacidades desde profesores de mayor tamano (27B en el nombre del repo) hacia modelos de 9B, comparando curvas de aprendizaje en tareas de matematicas.
- Procesamiento de documentos largos con imagen: con 262.144 tokens de contexto nativo, puede ingerir informes escaneados, contratos o articulos cientificos completos junto con sus figuras para tareas de extraccion y resumen.
- Experimentos de aprendizaje en contexto (in-context learning): la model card del base indica explicitamente este uso; con contexto extensible a 1,01 M de tokens se pueden incluir decenas de ejemplos en el prompt sin fine-tuning.
- Evaluacion comparativa de arquitecturas hibridas: util para medir el throughput y la latencia de Gated DeltaNet frente a atencion completa en cargas de contexto largo dentro de un pipeline de investigacion.
- Base para asistentes multimodales en prototipos: integrable en vLLM o SGLang para servir respuestas sobre imagenes y texto en entornos de desarrollo, aunque requiere postentrenamiento instruct antes de exponerlo a usuarios finales.
- Generacion asistida de codigo en entornos controlados: el modelo base puede completar fragmentos y explicar codigo, pero al no ser instruct necesita plantillas de prompt cuidadas y validacion humana en CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona de forma cualitativa paridad con Qwen3 y superioridad sobre Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no aporta cifras concretas ni tablas comparativas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB y 32-48 GB para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque no se distribuyen pesos cuantizados en el repositorio y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en produccion con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado o cuantizado.
- Cabe en GPU de consumo: si, en RTX 4090 con BF16 y contexto limitado, y en RTX 3090/4080 con cuantizacion 8 o 4 bits.
- Opciones de despliegue: Transformers, vLLM y SGLang segun la model card del base; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; la arquitectura hibrida con atencion lineal sugiere ventajas en contextos largos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-9B-Base derivado) | 9,65 B | 262.144 nativos, hasta 1,01 M | Imagen + texto | Apache 2.0 | Hugging Face, 53 descargas |
| Qwen3.5-9B-Base (original) | 9 B | 262.144 nativos, hasta 1,01 M | Imagen + texto | Apache 2.0 | Hugging Face, repositorio oficial |
| Qwen3-VL (familia) | no disponible | no disponible | Imagen + texto | no disponible | Hugging Face |
| Qwen3 (familia, solo texto) | no disponible | no disponible | Texto | no disponible | Hugging Face |

La comparativa se limita a la familia Qwen porque la informacion proporcionada no incluye modelos de otros fabricantes con especificaciones verificables. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo preentrenado, no instruct: no esta disenado para interaccion directa; requiere fine-tuning o ingenieria de prompt para uso conversacional.
- Procedencia del checkpoint no documentada: el autor no describe el dataset, el metodo de entrenamiento ni la relacion exacta con el modelo profesor de 27B; el nombre del repositorio no constituye una garantia tecnica.
- Riesgo de alucinacion: inherente a los modelos de lenguaje preentrenados, agravado por la falta de evaluacion publicada de este checkpoint.
- Idiomas: aunque el modelo base declara 201 idiomas, no se especifica el rendimiento de este checkpoint en castellano ni en otras lenguas concretas.
- Sesgos: no se documentan evaluaciones de sesgo para este checkpoint; los sesgos del modelo base pueden haberse amplificado o modificado durante el proceso de destilacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del modelo base enlazada en la model card.
- Contexto extendido: la extension hasta 1,01 M de tokens no esta validada para este checkpoint y puede degradar la calidad y disparar el consumo de memoria.
- Ausencia de pesos cuantizados oficiales: la cuantizacion corre a cargo del usuario, con el riesgo de perdida de calidad no medida.
- Repositorio con muy poca traccion (53 descargas, 0 likes) y sin comunidad que valide su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mhseo2/opd_q35base9b_qwen36_27b_ot3math-step0
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
