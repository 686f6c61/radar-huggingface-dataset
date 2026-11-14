# mdcreativeagent/Qwen3-14B-Base

## Resumen

Qwen3-14B-Base es un modelo de lenguaje causal de tipo denso (no MoE) publicado por el equipo Qwen de Alibaba dentro de la familia Qwen3, la tercera generación de su serie de modelos abiertos. Esta ficha concreta corresponde al repositorio `mdcreativeagent/Qwen3-14B-Base`, un espejo del checkpoint base de 14.800 millones de parámetros (13.200 millones sin contar embeddings), entrenado únicamente en fase de preentrenamiento, sin ajuste por instrucciones ni alineamiento por preferencias. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo se apoya en una arquitectura transformer densa con 40 capas, atención con grouped-query attention (40 cabezas de consulta y 8 de clave/valor) y una ventana de contexto de 32.768 tokens. Se preentrenó sobre 36 billones de tokens en 119 idiomas, con una mezcla que incluye datos de código, STEM, razonamiento, libros y datos sintéticos, distribuida en tres etapas: conocimiento general, razonamiento especializado y extensión de contexto largo.

Es relevante ahora porque ofrece un punto de partida de pesos abiertos, tamaño medio y contexto amplio para tareas de ajuste fino (SFT, LoRA, DPO) y para investigación en entrenamiento y evaluación. Al ser un checkpoint base, no incluye capacidades de conversación ni de seguimiento de instrucciones por sí mismo; esas capacidades deben añadirse mediante ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con GQA y qk layernorm |
| Parametros totales | 14.768.307.200 (14,8B); 13,2B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | 119 idiomas segun la model card (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 40 capas con 40 cabezas de atención para las consultas y 8 para clave/valor (GQA), lo que reduce el coste de memoria de la caché KV en inferencia. Incorpora qk layernorm en todas las capas para mejorar la estabilidad del entrenamiento. El checkpoint corresponde exclusivamente a la fase de preentrenamiento, sin etapas posteriores de instrucción, RLHF ni DPO.

El preentrenamiento se realizó sobre 36 billones de tokens en 119 idiomas, con una mezcla de datos de código, STEM, razonamiento, libros, multilingüe y datos sintéticos. El proceso se dividió en tres etapas: la primera orientada a modelado de lenguaje general y conocimiento; la segunda centrada en razonamiento (STEM, código, lógica); y la tercera en comprensión de contexto largo, extendiendo las secuencias de entrenamiento hasta 32.000 tokens. Los hiperparámetros (learning rate, batch size) se ajustaron mediante estudios de scaling law específicos para modelos densos y MoE.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt, sin formato conversacional nativo (modelo base).
- Modelado de lenguaje general y adquisición de conocimiento factual a partir del corpus de preentrenamiento.
- Razonamiento matemático, lógico y de tipo STEM, reforzado en la segunda etapa de preentrenamiento.
- Generación y comprensión de código, gracias a la inclusión de datos de programación en el corpus.
- Capacidades multilingües en 119 idiomas (lista concreta no disponible).
- Procesamiento de contexto largo de hasta 32.768 tokens, útil para documentos extensos.
- Punto de partida para ajuste fino supervisado, LoRA, QLoRA y DPO.
- No incluye soporte nativo de tool calling, function calling ni modo de razonamiento explícito (thinking), al ser un checkpoint base.

## Casos de uso

- Ajuste fino supervisado para asistentes de dominio: se parte del checkpoint base y se entrena con pares instrucción-respuesta específicos del sector (legal, sanitario, técnico) para obtener un modelo especializado con licencia Apache 2.0.
- Generación de código en pipelines internos: el modelo puede completar funciones y documentación técnica; requiere ajuste o prompting few-shot al no estar alineado para instrucciones.
- Investigación en entrenamiento: sirve como base para experimentos de DPO, RLHF o destilación, comparando el comportamiento del checkpoint base frente a versiones ya alineadas.
- Procesamiento de documentos largos: con 32.768 tokens de contexto puede resumir o extraer información de informes, contratos o artículos extensos en una sola pasada.
- Traducción y tareas multilingües: los 119 idiomas del corpus permiten ajustar modelos de traducción o clasificación multilingüe con datos propios.
- Evaluación de benchmarks y ablaciones: útil para reproducir resultados de la familia Qwen3 o para estudiar el efecto del preentrenamiento en tres etapas.
- Generación de datos sintéticos: puede emplearse para producir corpus de entrenamiento en dominios concretos antes de un ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para los resultados detallados, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada en precisión completa (BF16): aproximadamente 29,5 GB solo para los pesos, más caché KV y activaciones; se recomienda al menos 40 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 8-9 GB para pesos (cifras estimadas por tamaño; no confirmadas en la informacion proporcionada).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16; RTX 4090 (24 GB) viable en 8 bits o 4 bits; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo con cuantización de 8 o 4 bits; en BF16 requiere GPU profesional o multi-GPU.
- Opciones de despliegue: transformers (versión 4.51.0 o superior, obligatoria para evitar el error `KeyError: 'qwen3'`), text-generation-inference, vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-14B-Base (este) | 14,8B | 32.768 | Apache 2.0 | Denso, preentrenamiento en 3 etapas, 119 idiomas |
| Qwen2.5-14B | 14,8B aprox. | 32.768 aprox. | Apache 2.0 | Generación anterior; menor cobertura lingüística (la model card indica triple cobertura en Qwen3) |
| Qwen3-14B (instruct) | 14,8B | 32.768 | Apache 2.0 | Variante alineada para instrucciones y conversación |
| Qwen3-30B-A3B | 30,5B (3,3B activos) | 32.768 | Apache 2.0 | Variante MoE de la misma familia; mayor eficiencia por token activo |

Los datos de rendimiento comparado no están disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un checkpoint base sin alineamiento, no sigue instrucciones de forma fiable ni mantiene formato conversacional; produce continuaciones de texto.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados, sin mitigación por RLHF.
- Sesgos potenciales derivados del corpus de preentrenamiento (36 billones de tokens de origen no detallado), incluyendo sesgos culturales y lingüísticos.
- Cobertura desigual entre los 119 idiomas; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Contexto máximo de 32.768 tokens; superarlo requiere truncado o estrategias externas.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario es responsable de cumplir la normativa aplicable y de evaluar sesgos y seguridad antes de desplegar en producción.
- Requiere `transformers>=4.51.0`; versiones anteriores fallan al cargar el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo de terceros, no el repositorio oficial de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3-14B-Base
- Blog oficial Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
