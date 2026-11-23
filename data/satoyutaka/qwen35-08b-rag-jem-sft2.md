# satoyutaka/qwen35-08b-rag-jem-sft2

## Resumen

`satoyutaka/qwen35-08b-rag-jem-sft2` es un ajuste fino (SFT, segunda iteracion) del modelo base Qwen3.5-0.8B-Base, desarrollado por el usuario satoyutaka. El modelo conserva la arquitectura hibrida del Qwen3.5 original (redes Gated DeltaNet combinadas con atencion con compuerta) y el pipeline multimodal image-text-to-text, pero ha sido especializado mediante entrenamiento supervisado, presumiblemente orientado a tareas de recuperacion aumentada (RAG) y generacion aumentada por recuperacion en japones, segun sugiere el sufijo "rag-jem" del identificador.

El modelo base Qwen3.5-0.8B es la variante mas pequena de la familia Qwen3.5, con 873 millones de parametros totales, 24 capas y una ventana de contexto nativa de 262.144 tokens. Su escala lo situa en la categoria de modelos para prototipado, ajuste fino especifico de tareas y experimentacion en entornos con recursos limitados, no para produccion de alta exigencia.

La relevancia de este checkpoint radica en que demuestra el flujo de especializacion sobre la arquitectura Qwen3.5 en un tamano que cabe en GPU de consumo, con licencia Apache 2.0 que permite uso comercial. No obstante, el repositorio no incluye model card propia del autor del ajuste, por lo que los detalles del dataset de entrenamiento y del objetivo concreto del SFT no estan documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; hibrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/vLLM) |
| Idiomas soportados | no disponible (el modelo base declara 201 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 1024 |
| Capas | 24 (layout 6 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN))) |
| Cabezas de atencion | 8 Q / 2 KV (Gated Attention), 16 V / 16 QK (Gated DeltaNet) |
| Dimension de cabeza | 256 (Gated Attention), 128 (Gated DeltaNet) |
| Dimension intermedia FFN | 3584 |
| Embedding de tokens | 248.320 (con padding) |
| RoPE | 64 dimensiones |
| MTP | Entrenado con multi-step |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura hibrida de Qwen3.5, que intercala bloques de Gated DeltaNet (atencion lineal con estado recurrente) y bloques de Gated Attention clasica en un patron de 3:1. Esta combinacion busca reducir el coste computacional y de memoria del mecanismo de atencion en contextos largos, manteniendo la capacidad de recuperacion exacta de la atencion tradicional. El modelo incluye ademas un codificador de vision para entrada image-text-to-text, resultado del entrenamiento con fusion temprana de tokens multimodales que Qwen aplica en toda la familia Qwen3.5.

El checkpoint es un ajuste fino supervisado (SFT) del modelo base Qwen3.5-0.8B-Base. El autor no documenta en el repositorio el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. El sufijo "rag-jem" sugiere un enfoque en generacion aumentada por recuperacion, posiblemente en japones, pero esta interpretacion no esta confirmada por la model card. El modelo base original fue preentrenado y postentrenado por Qwen, con RL escalado en entornos multiagente y soporte declarado de 201 idiomas.

## Capacidades

- Generacion de texto y razonamiento en modo no-thinking y thinking (heredado del modelo base Qwen3.5).
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Generacion de codigo y soporte de tool calling / function calling (capacidad declarada del modelo base).
- Soporte de agentes y razonamiento multi-step, reforzado por el entrenamiento RL del modelo base.
- Capacidades multilingues amplias segun el modelo base (201 idiomas y dialectos); el alcance efectivo tras el ajuste fino no esta documentado.
- Ventana de contexto larga de 262.144 tokens.
- Decodificacion especulativa mediante MTP (multi-token prediction) entrenado con multi-step.

## Casos de uso

- Prototipado de pipelines RAG: el modelo puede integrarse como generador final en un sistema de recuperacion aumentada, aprovechando su contexto de 262.144 tokens para insertar muchos documentos recuperados sin truncamiento.
- Ajuste fino especifico de dominio: al ser un checkpoint SFT sobre una base pequena, sirve como punto de partida para especializaciones adicionales en tareas concretas con presupuesto de computo reducido.
- Asistente documental multimodal: la entrada image-text-to-text permite procesar capturas, escaneos o diagramas junto con texto para responder preguntas sobre documentacion tecnica.
- Generacion de codigo en entornos de desarrollo: con soporte de tool calling, puede conectarse a herramientas de analisis estatico o ejecucion de pruebas en pipelines de CI/CD de baja criticidad.
- Experimentacion academica en arquitecturas hibridas: util para investigadores que quieran estudiar el comportamiento de Gated DeltaNet + Gated Attention en tareas de recuperacion y generacion.
- Despliegue en hardware de consumo: con 873 millones de parametros, cabe en GPU consumer para demos, notebooks y entornos de desarrollo local.
- Evaluacion de agentes multi-step: su contexto largo y su entrenamiento RL de base permiten probar flujos de agente con muchas iteraciones de razonamiento.

## Benchmarks y rendimiento

Los unicos datos disponibles corresponden al modelo base Qwen3.5-0.8B publicado por Qwen. No se han publicado resultados de benchmarks especificos del ajuste fino `satoyutaka/qwen35-08b-rag-jem-sft2`.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B (base) |
|---|---|---|---|---|
| MMLU-Pro (non-thinking) | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux (non-thinking) | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval (non-thinking) | 80,2 | 61,0 | 65,2 | 46,4 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB de pesos mas overhead de activaciones y KV cache; en la practica, entre 3 y 5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto largo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. Cabe en GPU de consumo.
- Opciones de despliegue: transformers (libreria declarada), vLLM, SGLang y KTransformers segun la model card del modelo base; llama.cpp y Ollama no estan confirmados para esta arquitectura hibrida.
- Latencia y throughput: no disponibles. La arquitectura Gated DeltaNet esta disenada para reducir el coste de atencion en contextos largos, pero no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-jem-sft2 | 873 M | 262.144 | Apache 2.0 | Ajuste fino SFT sobre Qwen3.5-0.8B-Base; multimodal |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B | 262.144 | Apache 2.0 | Modelo base sin ajuste; referencia directa |
| Qwen3-1.7B | 1,7 B | no disponible en la informacion | Apache 2.0 | Generacion anterior; MMLU-Pro 40,2 en non-thinking |
| Qwen3-4B-2507 | 4 B | no disponible en la informacion | Apache 2.0 | Mayor tamano y rendimiento; MMLU-Pro 69,6 en non-thinking |

## Limitaciones y advertencias

- El modelo base Qwen3.5-0.8B obtiene puntuaciones bajas en benchmarks de conocimiento general (MMLU-Pro 29,7), por lo que la fiabilidad en tareas que requieran conocimiento factual amplio es limitada.
- Riesgo elevado de alucinacion en contextos donde el modelo no dispone de informacion recuperada o de conocimiento interno suficiente.
- El ajuste fino no documenta su dataset de entrenamiento, lo que impide evaluar sesgos introducidos, calidad de las respuestas o posibles sobreajustes a dominios concretos.
- El alcance multilingue efectivo tras el SFT no esta verificado; el modelo base declara 201 idiomas, pero el ajuste puede haber reducido el rendimiento fuera del idioma o dominio de entrenamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no proporciona garantias ni soporte; el uso en produccion requiere evaluacion propia.
- La arquitectura hibrida Gated DeltaNet puede no estar soportada por todas las herramientas de inferencia y cuantizacion; conviene verificar compatibilidad con llama.cpp u Ollama antes de desplegar.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-sft2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
