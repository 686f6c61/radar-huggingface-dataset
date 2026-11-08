# marsnext/Phobos-1

## Resumen

Phobos-1 es un modelo de lenguaje causal desarrollado por MarsNext (@0xMarsNext) que implementa una arquitectura de mezcla de expertos (MoE) jerárquica denominada por el autor "Hierarchical Cortical Mixture-of-Experts". Con 96,26 millones de parámetros totales y 52,22 millones activos por token, está diseñado explícitamente para inferencia en el borde (edge inference): su huella en BF16 es de 215,84 MiB, lo que le permite ejecutarse en CPU, GPU NVIDIA (CUDA) y Apple Silicon (MPS) sin conexión.

El modelo combina varias innovaciones técnicas poco habituales en esta escala: enrutamiento cortical esférico en dos etapas (rama -> hoja especialista), mitosis SVD esférica en línea durante el entrenamiento, una memoria declarativa basada en tablas hash de n-gramas ("DeepInfer Engram") inyectada en capas concretas, predicción multi-token (MTP) como cabeza auxiliar y un modo de razonamiento "System-2" que genera trazas dentro de bloques `<think>...</think>`.

Es relevante ahora porque demuestra que es posible empaquetar razonamiento explícito, generación de código y matemáticas, y un servidor compatible con la API de OpenAI en menos de 100 millones de parámetros, con licencia Apache-2.0 y sin dependencias de infraestructura pesada. No obstante, conviene señalar que el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y que los datos de rendimiento publicados por el autor no incluyen benchmarks estándar verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE cortical jerárquica (PhobosScratchLM) |
| Parámetros totales | 96.256.569 (según model card); 113.034.436 según safetensors del repo |
| Parámetros activos | 52.216.377 por token (54,2 %) |
| Longitud de contexto | 2.048 tokens (max_seq_len) |
| Tipos de cuantización | no disponible (solo se documenta BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El backbone consta de 8 capas con `d_model = 512`, normalización RMSNorm (ε = 1e-6) y atención causal con Grouped-Query Attention (8 cabezas de consulta, 4 de clave/valor, `head_dim = 64`). La atención incorpora RoPE 1D y una convolución causal QK de corto alcance con ventana 8. La capa MoE cortical combina un experto compartido (`shared_e00`, 1.024 neuronas SwiGLU) con 4 ramas corticales, cada una con 16 hojas especialistas de 256 neuronas SwiGLU; las hojas crecieron de 8 a 16 mediante 44 divisiones de "mitosis SVD". Las ramas están asignadas a dominios: B0 lenguaje y diálogo, B1 código e ingeniería de software, B2 matemáticas y lógica formal, B3 ciencias naturales. El enrutamiento es esférico en dos etapas (rama -> hoja) con selección Top-1 de rama y Top-2 de hojas.

Además, el modelo integra `DeepInferEngramMemory`, tablas hash deterministas de 2-gramas y 3-gramas inyectadas en las capas L1 y L5 como memoria declarativa, una cabeza auxiliar de predicción multi-token (`DeepInferMTPHead`, objetivo t+2) y puertas residuales de tipo highway (`SigmoidHCBlockMixin`). El tokenizador es un BPE a nivel de byte propio de 32.768 entradas. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras fases de alineación; esa información no está disponible.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat `<|user|>` / `<|assistant|>`.
- Razonamiento paso a paso en modo System-2 mediante bloques `<think>...</think>` activables.
- Generación de código en Python, JavaScript y SQL: síntesis de funciones, manipulación de listas y arrays, recorridos algorítmicos y análisis de errores.
- Razonamiento matemático: álgebra lineal simbólica, despeje de ecuaciones paso a paso, cálculo con regla de la potencia y autoverificación aritmética.
- Preguntas de ciencia (biología básica, cinemática física, química ácido-base) y lógica deductiva (silogismos categóricos).
- Servidor HTTP integrado compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/health`) con streaming SSE.
- Inferencia en el borde en CUDA, MPS y CPU.
- No se documenta soporte de tool calling, function calling, uso de agentes autónomos, visión ni audio.

## Casos de uso

- Asistente de código en el borde: el modelo puede sintetizar funciones y explicar algoritmos en Python, JS o SQL ejecutándose localmente en un portátil con Apple Silicon vía MPS, sin enviar código a la nube. Adecuado por su huella de 215,84 MiB en BF16 y su rama B1 dedicada a código.
- Tutor de matemáticas con traza visible: activando `/think`, genera el despeje paso a paso de ecuaciones y autoverifica la aritmética, lo que permite auditar el razonamiento en entornos educativos.
- Servicio local compatible con OpenAI: `serve_openai_api.py` expone endpoints compatibles con el SDK oficial de OpenAI, de modo que se puede sustituir un backend remoto por este modelo en prototipos y pruebas de integración sin cambiar el código cliente.
- Clasificación y respuesta de lógica formal: útil para ejercicios de silogismos categóricos y razonamiento deductivo en herramientas de evaluación educativa o generación de cuestionarios.
- Filtrado y preprocesado en pipelines de datos: al ejecutarse en CPU, puede emplearse como modelo auxiliar para reformatear, resumir o etiquetar texto en lotes dentro de un pipeline ETL sin consumir GPU.
- Demostración y docencia de arquitecturas MoE: su implementación autocontenida (clases `PhobosScratchLM`, mitosis SVD, engramas) sirve como material didáctico reproducible para estudiar enrutamiento jerárquico y crecimiento de expertos en modelos pequeños.
- Chatbot de soporte offline en dispositivos con recursos limitados: conversaciones multi-turno de hasta 2.048 tokens en hardware sin GPU dedicada, adecuado para prototipos de asistencia en campo o entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe capacidades cualitativas (código, matemáticas, ciencia, lógica) pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, ni comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 216 MiB en BF16 (215,84 MiB según el autor); no se documentan variantes cuantizadas, por lo que no hay cifras para INT8 o INT4.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA con al menos ~1 GB de VRAM libre es suficiente; también funciona en Apple Silicon vía MPS y en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, así como en portátiles con memoria unificada.
- Opciones de despliegue: scripts propios del repositorio (`chat_cli.py`, `serve_openai_api.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato disponible es safetensors de PyTorch, no GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MarsNext Phobos-1 | 96,26 M totales / 52,22 M activos | 2.048 | Apache-2.0 | Hugging Face (0 descargas) | MoE cortical con modo `<think>` y servidor OpenAI integrado |
| MartianAcademy synapcore-phobos-1 | no disponible | no disponible | Apache-2.0 | Hugging Face | Proyecto homónimo con etiquetas de MoE jerárquica y mitosis cortical; sin datos técnicos públicos en la búsqueda |
| Modelos densos pequeños tipo GPT-2 small / distilgpt2 | ~82-124 M | 1.024 | MIT / Apache-2.0 | Amplia | Referencia de escala similar; sin modo de razonamiento ni MoE |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache-2.0 | Amplia | Alternativa mayor con contexto muy superior y ecosistema de despliegue maduro (vLLM, llama.cpp, Ollama) |

La comparación cuantitativa de rendimiento no está disponible porque Phobos-1 no publica benchmarks. Frente a los modelos densos de escala similar, su ventaja declarada es la combinación de razonamiento explícito, enrutamiento por dominios y servidor compatible con OpenAI en una huella menor; su desventaja es un contexto de solo 2.048 tokens y la ausencia de formatos cuantizados y de integraciones con motores de inferencia estándar.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües y la model card declara únicamente `en`.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos, bases de código extensas o conversaciones prolongadas.
- Riesgo elevado de alucinación esperable en un modelo de menos de 100 millones de parámetros; las respuestas de código y matemáticas deben verificarse antes de usarse en producción.
- No se documentan datos de entrenamiento, composición del corpus ni fases de alineación (RLHF/DPO), lo que impide evaluar sesgos conocidos; no hay información disponible sobre sesgos específicos.
- Ausencia total de benchmarks publicados: no es posible validar las capacidades declaradas con métricas estándar.
- El modo `<think>` genera trazas de razonamiento que consumen tokens de la ventana y pueden aumentar la latencia; su fiabilidad no está medida.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su uso en flujos automatizados que dependan de llamadas a funciones.
- El modelo tiene 0 descargas y 0 likes, y se publicó y actualizó el mismo día (8 de noviembre de 2026): no hay evidencia de uso comunitario ni de mantenimiento posterior.
- Discrepancia entre el recuento de parámetros de la model card (96.256.569) y el de los archivos safetensors del repositorio (113.034.436); conviene verificar antes de dimensionar el despliegue.
- Licencia Apache-2.0 permite uso comercial, pero al no haber evaluación de sesgos ni de seguridad, el usuario asume todo el riesgo de cumplimiento y calidad en producción.
- No se ofrecen pesos en GGUF ni integraciones con llama.cpp u Ollama, por lo que el despliegue requiere los scripts propios del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsnext/Phobos-1
- Perfil del autor en X: https://x.com/0xMarsNext
- Proyecto homónimo de MartianAcademy: https://huggingface.co/MartianAcademy/synapcore-phobos-1
- Paper de astrometría de Phobos (referencia no relacionada con el modelo, recuperada en la búsqueda): https://arxiv.org/abs/2608.22352
