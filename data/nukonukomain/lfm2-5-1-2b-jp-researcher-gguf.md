# nukonukomain/LFM2.5-1.2B-JP-researcher-GGUF

## Resumen

LFM2.5-1.2B-JP-researcher-GGUF es un modelo de lenguaje compacto en japonés creado por el usuario nukonukomain a partir de LiquidAI/LFM2.5-1.2B-JP, un modelo base de aproximadamente 1,2 mil millones de parametros desarrollado por LiquidAI. El autor ha aplicado un ajuste fino adicional (fine-tuning) mediante QLoRA sobre 21.164 conversaciones en japonés del dataset llm-jp/oasst1-21k-ja, con el objetivo de dotar al modelo de una personalidad concreta: un "investigador sereno" que responde de forma estructurada (conclusion, fundamentos y advertencias) y que senala explicitamente sus puntos de incertidumbre.

El problema que resuelve es doble: por un lado, ofrece un asistente conversacional en japonés lo bastante ligero para ejecutarse completamente en local, incluso en portatiles sin GPU dedicada; por otro, sirve como experimento practico de control de persona (persona steering) en modelos pequenos mediante un system prompt consistente durante el entrenamiento. El modelo se distribuye en formato GGUF, listo para usar con llama.cpp, LM Studio u Ollama.

Es relevante porque forma parte de la tendencia reciente de especializar modelos pequenos y eficientes (la familia LFM de LiquidAI usa arquitecturas hibridas optimizadas para dispositivos con recursos limitados) para idiomas concretos, en este caso el japones, y porque su model card documenta con detalle todo el proceso de entrenamiento, lo que lo hace reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM (familia LiquidAI), basada en LiquidAI/LFM2.5-1.2B-JP; detalle exacto no disponible en la ficha |
| Parametros totales | 1.170.340.608 (aprox. 1,2B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens segun el modelo base LFM2.5; entrenado con longitud de serie de 2048 |
| Tipos de cuantizacion | Q4_K_M y F16 (archivos GGUF publicados) |
| Idiomas soportados | Japones |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other" heredada del modelo base) |
| Formato de pesos | GGUF (conversion desde merge en 16 bit; el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-1.2B-JP de LiquidAI, un modelo de la familia LFM (Liquid Foundation Models) disenado para ser eficiente en recursos. La ficha no detalla la composicion exacta de capas de la arquitectura, aunque la familia LFM2.5 se caracteriza por arquitecturas hibridas que combinan bloques convolucionales tipo gated linear (LIV/conv) con atencion estandar, optimizadas para inferencia en dispositivos edge. El contexto maximo soportado por la familia LFM2.5 es de 32K tokens.

El ajuste fino se realizo con QLoRA en 4 bit usando la biblioteca Unsloth, con los siguientes hiperparametros documentados: rank r=32 y alpha=32, aplicados a los modulos q, k, v, o, gate, up y down de todas las capas; dataset llm-jp/oasst1-21k-ja completo (21.164 conversaciones en japones derivadas de OASST1); 2 epocas; learning rate 1,5e-4 con scheduler cosine y warmup de 50 pasos; batch efectivo de 8 (2 por dispositivo con acumulacion de gradiente x4); longitud de serie de 2048 tokens; optimizador adamw_8bit en fp16. A cada muestra se le antepuso un system prompt fijo que define la persona de "investigador sereno". El training loss final fue de aproximadamente 1,30. Tras el entrenamiento, los pesos LoRA se fusionaron en 16 bit y el modelo se convirtio a GGUF con convert_hf_to_gguf.py de llama.cpp, generando las variantes F16 y Q4_K_M. Es importante senalar que el entrenamiento solo incluyo datos conversacionales, sin inyeccion de conocimiento especializado adicional.

## Capacidades

- Generacion de texto conversacional en japones, con estilo estructurado de tipo academico: conclusion, fundamentos y advertencias, en ese orden.
- Indicacion explicita de incertidumbre en las respuestas, inducida por el system prompt de entrenamiento.
- Dialogo multi-turno en modo chat (-cnv en llama.cpp, plantilla de chat aplicada durante el entrenamiento).
- Ejecucion 100% local y sin conexion gracias al formato GGUF.
- Compatibilidad con contextos largos hasta 32K tokens (heredado del modelo base), aunque el ajuste fino se hizo con 2048.
- No hay soporte documentado de tool calling, function calling, agentes, vision ni audio.
- La persona del "investigador" no esta fijada de forma permanente: sin el system prompt, el modelo vuelve a un tono de asistente convencional.

## Casos de uso

- Chatbot conversacional en japones sin conexion: ejecutandose con llama.cpp u Ollama en un portatil, permite desplegar un asistente en japones sin enviar datos a servicios externos, util para entornos con restricciones de privacidad.
- Experimentacion con control de persona en modelos pequenos: al haberse entrenado con un system prompt fijo, es un banco de pruebas ideal para estudiar cuanto se "pega" una persona a un modelo de 1,2B y como degrada sin el prompt.
- Prototipado rapido en LM Studio: el archivo Q4_K_M (unos 0,8 GB) se carga en segundos y permite probar interacciones de dialogo en japones en equipos de consumo.
- Asistente de redaccion con tono academico: la estructura de respuesta (conclusion, fundamentos, advertencias) encaja con resumenes breves o respuestas tipo nota tecnica en japones, siempre con verificacion humana posterior.
- Integracion en aplicaciones via llama-cpp-python: el model card incluye codigo de ejemplo listo para incrustar el modelo en aplicaciones Python locales con contexto de 4096 tokens.
- Base para fine-tuning adicionales: el proceso de entrenamiento esta completamente documentado y reproducible (Unsloth + TRL), por lo que puede servir como punto de partida para nuevos ajustes con otros datasets en japones.
- Demostraciones educativas: por su tamano minimo, es adecuado para ensenar el pipeline completo de QLoRA, merge y cuantizacion GGUF en talleres o cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de entrenamiento publicado es el training loss final aproximado de 1,30, que no es comparable entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,8 GB para la variante Q4_K_M y unos 2,4 GB para F16, mas el overhead del runtime (del orden de 1-1,5 GB adicionales en la practica).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con 2-4 GB de VRAM (por ejemplo, una RTX 3060 o superior) puede acelerarlo descargando todas las capas (n_gpu_layers=-1). En CPU funciona sin problema.
- Cabe sobradamente en GPUs de consumo e incluso solo con CPU y RAM: 8 GB de RAM son suficientes para la variante Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama (con Modelfile) y llama-cpp-python. No hay soporte documentado para vLLM ni TGI en formato GGUF.
- Latencia y throughput: no disponibles; dada su talla de 1,2B en Q4_K_M, se espera inferencia fluida en CPU moderna (decenas de tokens por segundo) y muy alta en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Formato | Licencia |
|---|---|---|---|---|---|
| LFM2.5-1.2B-JP-researcher-GGUF (este modelo) | 1,17B | Hasta 32K (entrenado a 2048) | Japones (persona investigador) | GGUF (Q4_K_M, F16) | LFM Open License v1.0 |
| LiquidAI/LFM2.5-1.2B-JP (base) | Aprox. 1,2B | 32K | Japones | Safetensors | LFM Open License v1.0 |
| LFM2-1.2B (LiquidAI, generalista) | Aprox. 1,2B | 32K | Multilingue, ingles predominante | Safetensors / GGUF comunitarios | LFM Open License v1.0 |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K+ | Multilingue, incluye japones | Safetensors / GGUF comunitarios | Apache 2.0 (Qwen license) |

Frente a su modelo base, este derivado aporta exclusivamente el estilo conversacional de persona investigadora en japones y la comodidad del formato GGUF preconvertido; en conocimiento y capacidad general es equivalente al base. Frente a alternativas multilingues como Qwen2.5-1.5B-Instruct, esta mas especializado en japones y es mas ligero, pero tiene capacidades generales menores y una licencia menos permisiva.

## Limitaciones y advertencias

- Por su talla de 1,2B, tiene limites claros en razonamiento complejo, coherencia en textos largos y preguntas de conocimiento avanzado.
- El ajuste fino solo uso datos de dialogo (oasst1-21k-ja); no se inyecto conocimiento nuevo, por lo que la base de conocimiento es la del modelo original.
- Riesgo de alucinacion elevado, reconocido por el propio autor: en usos que requieran veracidad factual, las salidas deben verificarse siempre.
- La persona de "investigador" depende del system prompt; sin el, el modelo adopta un tono de asistente generico, por lo que en produccion hay que configurarlo explicitamente.
- El ajuste fino se hizo con secuencias de 2048 tokens: el comportamiento con contextos muy superiores (hasta 32K teoricos) no esta validado en este derivado.
- Licencia: LFM Open License v1.0, una licencia "other" no estandar; el uso comercial debe revisarse contra el texto de la licencia del modelo base, que gobierna este derivado.
- El model card indica que hubo que corregir manualmente tokenizer_class a PreTrainedTokenizerFast antes de convertir a GGUF, un indicio de que la conversion requiere cuidado; conviene verificar el tokenizador si se regeneran los GGUF.
- Ademas del japones, no hay garantias de calidad en otros idiomas; el entrenamiento fue monolingue.
- Cobertura muy limitada (44 descargas y 1 like en el momento de la ficha): es un modelo de nicho comunitario sin respaldo de una organizacion, sin evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nukonukomain/LFM2.5-1.2B-JP-researcher-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/llm-jp/oasst1-21k-ja
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (conversion e inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Organizacion LiquidAI: https://huggingface.co/LiquidAI
