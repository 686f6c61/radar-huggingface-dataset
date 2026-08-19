# AyoubChLin/LFM2.5-2.6B-fable5-coding-agent-GGUF

## Resumen

LFM2.5-2.6B Fable5 Coding Agent es un modelo de lenguaje de 2,6 mil millones de parámetros, resultado de un ajuste fino (fine-tuning) sobre el modelo base LFM2.5-2.6B de Liquid AI, orientado a tareas de generación de código y uso como agente de programación. Esta versión concreta, publicada por AyoubChLin, ofrece los pesos en formato GGUF para su ejecución eficiente en entornos locales mediante runtimes como llama.cpp. El modelo base de Liquid AI está diseñado para cargas de trabajo agénticas, con una ventana de contexto de 128K tokens y soporte nativo para llamada a herramientas (tool calling), lo que lo hace adecuado para tareas multi-paso y razonamiento con herramientas.

La relevancia de esta ficha radica en que se trata de un modelo compacto, con licencia Apache-2.0, que permite desplegar capacidades de agente de código en dispositivos con recursos limitados, manteniendo un rendimiento razonable para tareas de programación asistida. Sin embargo, la información pública sobre el ajuste fino específico ("fable5-coding-agent") es escasa: no se detallan los datos de entrenamiento, la metodología ni los benchmarks del modelo afinado, por lo que esta ficha se basa principalmente en las características del modelo base y en los archivos GGUF proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura no detallada; basada en LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (según modelo base LFM2.5-2.6B; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM2.5-2.6B de Liquid AI, un modelo denso de 2,6B parámetros entrenado específicamente para cargas de trabajo agénticas, con una ventana de contexto de 128K tokens y soporte nativo para tool calling. No se dispone de información pública sobre el proceso de entrenamiento del fine-tuning "fable5-coding-agent": ni el dataset utilizado, ni el método (RLHF, DPO, etc.), ni las innovaciones técnicas específicas. El modelo base de Liquid AI emplea una arquitectura transformer densa, aunque los detalles exactos (número de capas, atención, etc.) no se han publicado en la documentación accesible.

Los archivos GGUF incluidos en este repositorio son conversiones del modelo afinado en tres niveles de cuantización (F16, Q8_0 y Q4_K_M), lo que permite elegir entre fidelidad y eficiencia según el hardware disponible. La cuantización Q4_K_M es la más ligera, con aproximadamente 1,6 GB, adecuada para dispositivos con poca memoria.

## Capacidades

- Generación de código: al ser un fine-tuning orientado a código, se espera que tenga capacidades de generación y completado de código, aunque no hay benchmarks que lo confirmen.
- Tool calling: el modelo base LFM2.5-2.6B tiene soporte nativo para llamada a herramientas, lo que permite integrar funciones externas en el flujo de razonamiento.
- Razonamiento multi-paso: el modelo base está diseñado para tareas agénticas, lo que sugiere capacidad para planificar y ejecutar secuencias de acciones.
- Contexto largo: ventana de 128K tokens (según el modelo base), útil para manejar repositorios de código extensos o conversaciones largas.
- Multilingüismo: no se ha especificado; se asume que el modelo base soporta principalmente inglés y posiblemente otros idiomas, pero no hay confirmación para este fine-tuning.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse en un portátil o dispositivo edge para ofrecer sugerencias de código, explicaciones y refactorizaciones sin conexión a la nube, gracias a su tamaño reducido y formato GGUF.
- Agente de automatización de tareas de desarrollo: con soporte de tool calling, puede orquestar comandos de terminal, invocar APIs o gestionar flujos de CI/CD en entornos con recursos limitados.
- Generación de documentación técnica: dado su entrenamiento en código, puede producir comentarios, docstrings y documentación de funciones a partir de código fuente.
- Chatbot de soporte técnico para desarrolladores: integrado en un IDE o herramienta de chat, puede responder preguntas sobre APIs, librerías o fragmentos de código con contexto de hasta 128K tokens.
- Procesamiento de logs y análisis de errores: el contexto largo permite analizar grandes volúmenes de logs de aplicación y sugerir diagnósticos o correcciones.
- Prototipado rápido en entornos sin GPU: al poder ejecutarse en CPU con cuantización Q4_K_M, es viable para entornos de desarrollo sin aceleración por hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base LFM2.5-2.6B de Liquid AI reporta 220 tokens por segundo en dispositivos de bajo consumo y menos de 2,5 GB de memoria, pero estos datos corresponden al modelo base y no al fine-tuning específico. No hay métricas de MMLU, HumanEval, GSM8K u otros estándares para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - F16 (~5,1 GB): requiere al menos 6 GB de VRAM en GPU o 8 GB de RAM en CPU.
  - Q8_0 (~2,7 GB): requiere al menos 4 GB de VRAM o 6 GB de RAM.
  - Q4_K_M (~1,6 GB): requiere al menos 2 GB de VRAM o 4 GB de RAM.
- GPU recomendadas: para Q4_K_M, una GPU con 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente; para Q8_0, una RTX 3060 o superior; para F16, una RTX 3070 o superior. En CPU, cualquier procesador moderno con 8 GB de RAM puede ejecutar Q4_K_M con razonable velocidad.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantizaciones Q8_0 y Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, y cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a safetensors, aunque no es el formato nativo.
- Latencia y throughput: no se dispone de datos específicos para este fine-tuning. El modelo base reporta 220 tok/s en hardware de bajo consumo, pero esto no es extrapolable sin verificación.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos similares (p. ej., Qwen2.5-Coder-1.5B, Phi-3-mini, StarCoder2-3B). El modelo base LFM2.5-2.6B se posiciona como un modelo compacto para agentes, pero no hay datos de rendimiento del fine-tuning. Se recomienda evaluar directamente en el caso de uso concreto.

## Limitaciones y advertencias

- Tamaño reducido: con 2,6B parámetros, el modelo puede tener un rendimiento inferior en tareas complejas de razonamiento o generación de código extenso en comparación con modelos más grandes.
- Falta de documentación del fine-tuning: no se conocen los datos de entrenamiento ni los posibles sesgos introducidos. Se desconoce si el fine-tuning ha alterado las capacidades del modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs inexistentes; se recomienda verificación humana en entornos de producción.
- Contexto largo no confirmado: la ventana de 128K corresponde al modelo base, pero no se ha verificado si el fine-tuning la mantiene íntegramente.
- Idiomas: no se especifican los idiomas soportados; es probable que el modelo esté principalmente entrenado en inglés, lo que limita su uso en otros idiomas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe atribuir correctamente y no usar marcas registradas.
- Cuantizaciones: las versiones cuantizadas (especialmente Q4_K_M) pueden degradar la calidad de salida en comparación con F16.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/AyoubChLin/LFM2.5-2.6B-fable5-coding-agent-GGUF
- Modelo base (fine-tuning): https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Documentación del modelo base LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Página de exploración del modelo: https://llm-explorer.com/model/AyoubChLin%2Flfm2.5-2.6b-fable5-coding-agent,2Mhb3ILfg1Hy4HpJEryJjc
