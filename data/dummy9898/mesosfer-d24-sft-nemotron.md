# Dummy9898/mesosfer-d24-sft-nemotron

## Resumen

Mesosfer d24 SFT (Tülu 3 + Nemotron Agentic v4) es un modelo de lenguaje de tipo GPT entrenado desde cero y posteriormente afinado mediante supervisión (SFT) por el usuario Dummy9898. Se trata de un transformer decoder-only de 24 capas con 1536 dimensiones de embedding, 12 cabezas de atención y una ventana de contexto de 2048 tokens, empaquetado en BF16 con un peso de aproximadamente 5,4 GB. El modelo parte de un checkpoint base (`d24-tulu-v1`, paso 6431, `val_bpb = 0.3940`) y se afina sobre una mezcla de datos que combina Tülu 3 Instruction Following, Tülu 3 Code y NVIDIA Nemotron-SFT-Agentic-v4.

El objetivo declarado es doble: por un lado, cubrir instrucciones generales y generación de código; por otro, incorporar capacidades de *tool calling* y comportamiento agéntico derivadas del dataset de NVIDIA. Es relevante en el contexto del ecosistema open source porque documenta un pipeline completo de entrenamiento propio (tokenizador RustBPE/tiktoken, framework Mesosfer, script de inferencia incluido) sobre una arquitectura compacta, lo que facilita su reproducción y despliegue en hardware modesto.

No obstante, conviene señalar que el modelo no incluye pipeline declarado en Hugging Face, no tiene descargas ni likes, y la información pública se limita a la model card y a los archivos del repositorio. No se han publicado resultados de benchmarks ni detalles sobre la composición exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (`n_layer=24`, `n_head=12`, `n_kv_head=12`, `n_embd=1536`, `window_pattern="L"`) |
| Parametros totales | no disponible (no se indica el recuento exacto; el checkpoint BF16 pesa ~5,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len=2048`) |
| Tipos de cuantizacion | no disponible (solo se distribuye BF16 en `model_006431.pt`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), tokenizador en `.pkl` y `.pt` |
| Vocabulario | 65536 tokens (RustBPE / tiktoken) |
| Precision | BF16 |
| Tamano del repositorio | 5,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 24 capas, 12 cabezas de atención y 12 cabezas KV (atención multi-cabeza estándar, sin GQA), dimensión de embedding de 1536 y vocabulario de 65536 tokens. El campo `window_pattern="L"` sugiere un patrón de ventana de atención local, aunque la model card no detalla su funcionamiento exacto. El tokenizador es propio, basado en RustBPE/tiktoken, lo que implica que no es compatible directamente con tokenizadores de Llama, Qwen u otros modelos habituales.

El entrenamiento consta de dos fases: un preentrenamiento o ajuste previo que produce el checkpoint `d24-tulu-v1` (paso 6431, `val_bpb = 0.3940`) y un SFT posterior sobre la mezcla `d24-tulu-nemotron-mix`, que combina Tülu 3 Instruction Following, Tülu 3 Code y NVIDIA Nemotron-SFT-Agentic-v4. No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con formato conversacional e instrucciones.
- Generación de código, gracias a la inclusión de Tülu 3 Code en la mezcla de SFT.
- *Tool calling* / *function calling*, derivado del dataset Nemotron-SFT-Agentic-v4.
- Comportamiento agéntico multi-paso (razonamiento encadenado con llamadas a herramientas), según el mismo dataset.
- Seguimiento de instrucciones generales (Tülu 3 Instruction Following).
- Soporte multilingüe limitado al inglés declarado; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni *thinking mode* explícito.

## Casos de uso

- Asistente de código en local: el modelo puede generar funciones y fragmentos en Python u otros lenguajes, integrándose en editores o scripts CLI mediante el `inference.py` incluido; su tamaño compacto permite ejecutarlo en una sola GPU consumer.
- Automatización de tareas con herramientas: al haber sido afinado sobre Nemotron-SFT-Agentic-v4, puede usarse como planificador que emite llamadas a APIs (por ejemplo, consultas a bases de datos o servicios REST) en pipelines de agentes.
- Prototipado de asistentes conversacionales en inglés: con 2048 tokens de contexto es adecuado para diálogos de varias interacciones sin memoria externa, útil en demos y entornos de desarrollo.
- Evaluación de pipelines de SFT: sirve como referencia reproducible para comparar mezclas de datos (Tülu 3 vs. Nemotron Agentic) en un modelo pequeño, dado que el framework Mesosfer es abierto.
- Generación de código en CI/CD: puede emplearse para autocompletar tests o generar documentación técnica en inglés dentro de flujos automatizados, siempre con revisión humana.
- Investigación en tokenizadores: al usar RustBPE/tiktoken propio, es útil para estudiar el impacto del vocabulario y la tokenización en modelos pequeños.
- Despliegue en hardware limitado: con ~5,4 GB en BF16, cabe en GPUs de 8-12 GB (por ejemplo, RTX 3060/4070) para inferencia en local, lo que facilita entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 6-8 GB, considerando pesos (~5,4 GB) más caché KV para 2048 tokens.
- VRAM estimada en cuantización de 8 bits: no disponible (no se distribuyen pesos cuantizados; habría que generarlos manualmente).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; también ROCm (el framework soporta `--extra rocm`).
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM en BF16.
- Opciones de despliegue: el repositorio incluye `inference.py` para uso interactivo o de un solo prompt con el framework Mesosfer; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mesosfer d24 SFT | no disponible (~5,4 GB BF16) | 2048 | MIT | Hugging Face (repo propio) |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | Amplia (HF, GGUF, Ollama) |
| Qwen2.5-1.5B | 1,5B | 32768 | Apache 2.0 | Amplia (HF, GGUF, vLLM) |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | Amplia (HF, GGUF) |

La comparación es orientativa: Mesosfer d24 no publica recuento exacto de parámetros ni benchmarks, y su contexto (2048) es inferior al de alternativas contemporáneas. Su ventaja diferencial es la licencia MIT y la inclusión de un pipeline de entrenamiento reproducible, aunque carece del ecosistema de herramientas y cuantizaciones de los modelos citados.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a modelos pequeños sin benchmarks publicados; no hay evaluación de fidelidad factual.
- No se documentan sesgos conocidos, pero al derivar de Tülu 3 y Nemotron podría heredar sesgos de esos datasets.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por la comunidad.
- El tokenizador es propio (RustBPE/tiktoken), lo que complica la integración con ecosistemas estándar y requiere usar el `inference.py` o el framework Mesosfer.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware muy restringido sin trabajo adicional.
- El formato de pesos es `.pt` (PyTorch), no `safetensors`, lo que añade riesgo de seguridad al cargar checkpoints de origen no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/Dummy9898/mesosfer-d24-sft-nemotron
- Repositorio del framework Mesosfer: https://github.com/PabloRaka/Mesosfer
- Tülu 3 (Allen AI): no disponible en la informacion proporcionada
- NVIDIA Nemotron-SFT-Agentic-v4: no disponible en la informacion proporcionada
