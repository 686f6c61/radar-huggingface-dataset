# Outlier-Ai/Qwen3-32B-MLX-4bit

## Resumen

Qwen3-32B-MLX-4bit es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3-32B de Alibaba, realizada por Outlier-Ai para su ejecución nativa en Apple Silicon mediante el framework MLX. El modelo conserva la arquitectura y los pesos del Qwen3-32B original, pero reduce la precisión de los pesos a 4 bits para disminuir el uso de memoria y hacer viable la inferencia local en equipos Mac con chip M1, M2, M3 o M4. El repositorio ocupa 18,4 GB y contiene 32.762.123.264 parámetros totales.

El modelo base Qwen3-32B es un transformer denso de la familia Qwen3, orientado a generación de texto, razonamiento con modo "thinking", uso de herramientas (function calling) y conversación multi-turno. Esta conversión mantiene las capacidades del original (razonamiento, código, matemáticas, multilingüismo en 15 idiomas) y añade la ventaja de ejecución completamente local y sin conexión, lo que resulta relevante para desarrolladores que necesitan privacidad, ausencia de costes de API y control total sobre el despliegue.

La relevancia actual de esta ficha radica en que permite ejecutar un modelo de 32B en hardware de consumo Apple sin depender de la nube, algo impensable con los pesos en precisión completa (que requerirían decenas de GB de memoria). La licencia Apache 2.0 heredada del modelo base facilita su uso comercial y su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3-32B de Alibaba, un transformer denso con 32.762.123.264 parámetros. Esta conversión no modifica la arquitectura ni el entrenamiento original: se trata de una cuantización post-entrenamiento a 4 bits realizada con mlx-lm, que reduce el tamaño de los pesos de ~65 GB (fp16) a 18,4 GB. No se ha realizado fine-tuning, merge ni entrenamiento adicional con datos propietarios, según indica el autor en la model card. Por tanto, las capacidades de razonamiento, el modo thinking y el soporte de tool calling son los del Qwen3-32B original.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas en el modelo base. Para esos datos habría que consultar la model card oficial de Qwen/Qwen3-32B. La innovación técnica de esta ficha es la propia cuantización MLX 4-bit, que permite ejecutar el modelo en Apple Silicon con memoria unificada, aprovechando Metal y el framework MLX para inferencia local.

## Capacidades

- Generación de texto y conversación multi-turno en 15 idiomas (inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco).
- Razonamiento explícito mediante modo "thinking" (etiqueta `thinking` en los tags del modelo).
- Soporte de tool calling / function calling, según los tags `function-calling` y `tool-use`.
- Capacidades de código y matemáticas heredadas del Qwen3-32B original.
- Ejecución local y offline, sin nube ni claves de API, orientada a privacidad (`private-ai`, `no-cloud`, `on-device`).
- Integración con el ecosistema MLX (mlx-lm, mlx-community) y con la app Outlier para macOS.
- No se menciona soporte de visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en local: el modelo puede generar y explicar código en un Mac sin enviar el código fuente a servidores externos, lo que resulta adecuado para entornos con requisitos de confidencialidad. Su tamaño de 32B le permite manejar tareas de refactorización y depuración de complejidad media.
- Atención al cliente con datos sensibles: al ejecutarse offline, permite procesar conversaciones con información personal o médica sin salir del dispositivo, cumpliendo requisitos de privacidad estrictos. El soporte multilingüe cubre los 15 idiomas listados.
- Automatización de agentes con tool calling: integrado en flujos que invocan funciones locales (sistemas de ficheros, APIs internas) mediante function calling, sin latencia de red ni costes por token.
- Análisis y resumen de documentos largos: el modelo puede resumir informes, contratos o artículos directamente en el Mac del usuario, manteniendo la confidencialidad del contenido. La longitud de contexto debe consultarse en la ficha del modelo base.
- Prototipado rápido de aplicaciones LLM: desarrolladores que quieran validar prompts, cadenas de razonamiento o flujos de agentes antes de desplegar en producción, usando mlx-lm o la app Outlier sin infraestructura cloud.
- Investigación y experimentación con cuantización: permite estudiar el impacto de la cuantización 4-bit en tareas de razonamiento y generación comparando con el modelo base, todo en hardware Apple Silicon.
- Uso educativo y demos presenciales: al no requerir conexión, es adecuado para talleres, aulas o entornos con red restringida donde se quiera mostrar inferencia LLM local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 18,4 GB en 4-bit; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime (Mac con M1/M2/M3/M4 Pro o superior).
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (según los tags del modelo), incluyendo MacBook Pro, MacBook Air, Mac mini y Mac Studio. No está pensado para GPUs NVIDIA ni para CUDA.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente; no aplica a GPUs dedicadas convencionales.
- Opciones de despliegue: mlx-lm (`python -m mlx_lm.generate`), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`) y el ecosistema mlx-community.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Qwen3-32B-MLX-4bit | 32,76B | no disponible | 4-bit MLX | apache-2.0 | Hugging Face (MLX) |
| Qwen/Qwen3-32B (base) | 32,76B | no disponible | fp16/bf16 | apache-2.0 | Hugging Face |
| Outlier-Ai/Qwen3-14B-MLX-4bit | 14B (aprox.) | no disponible | 4-bit MLX | apache-2.0 | Hugging Face (MLX) |
| Outlier-Ai/Qwen3-8B-MLX-4bit | 8B (aprox.) | no disponible | 4-bit MLX | apache-2.0 | Hugging Face (MLX) |

La comparativa se limita a las conversiones del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas de otros fabricantes. El Qwen3-32B base ofrece mayor precisión numérica a cambio de mucho más espacio en disco y memoria; las versiones 14B y 8B son más ligeras y adecuadas para equipos con menos memoria unificada.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la precisión en tareas de razonamiento complejo y matemáticas frente al modelo en fp16/bf16; conviene validar en el caso de uso concreto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no debe usarse como fuente de verdad sin verificación en dominios críticos.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre evaluaciones de seguridad en esta conversión.
- La longitud de contexto no está indicada en la información proporcionada; debe consultarse la ficha del Qwen3-32B original antes de diseñar aplicaciones que dependan de ventanas largas.
- Requiere hardware Apple Silicon; no es ejecutable en GPUs NVIDIA/AMD ni en CPU x86 convencionales mediante MLX.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones adicionales.
- El modelo está pensado para inferencia local; el rendimiento depende del chip y de la memoria unificada disponible, y no se han publicado cifras de latencia o throughput.
- La app Outlier referenciada en la model card es un producto de terceros con modelo de precios propio (Pro de pago único); su uso no es necesario para cargar el modelo con mlx-lm.

## Enlaces

- [Hugging Face: Outlier-Ai/Qwen3-32B-MLX-4bit](https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit)
- [Modelo base: Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- [Conversión relacionada: Outlier-Ai/Outlier-Qwen3-32B-MLX-4bit](https://huggingface.co/Outlier-Ai/Outlier-Qwen3-32B-MLX-4bit)
- [Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit](https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit)
- [Outlier-Ai/Qwen3-14B-MLX-4bit](https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit)
- [Outlier-Ai/Qwen3-8B-MLX-4bit](https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit)
- [Outlier-Ai/Outlier-Core-27B-MLX-4bit](https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit)
- [Outlier-Ai/Outlier-Nano-4B-MLX-4bit](https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit)
- [App Outlier para macOS](https://outlier.host/)
