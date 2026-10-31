# oxbyte8/SparkBotLLM-1.7B

## Resumen

SparkBotLLM-1.7B es un asistente conversacional especializado en soporte de hardware e inferencia local, desarrollado por oxbyte8 (x00byte) como componente del proyecto Sparkbot, un panel de gestión para estaciones NVIDIA DGX Spark. El modelo no es un entrenamiento desde cero, sino una adaptación LoRA sobre LiquidAI/LFM3-1.7B, un modelo de generación de texto de 1.728 millones de parámetros (dato real de safetensors: 1.728.801.600), fusionada en BF16 y posteriormente cuantizada a Q4_0 en formato GGUF.

Su propósito es resolver un problema concreto: acompañar a usuarios de DGX Spark en el despliegue de modelos locales, ayudándoles a inspeccionar su hardware, resolver dependencias, elegir perfiles de despliegue y diagnosticar problemas, todo ejecutándose en CPU local para no robar recursos de GPU al modelo principal. Con un tamaño de descarga de aproximadamente 1,05 GB en Q4_0, es lo bastante ligero para convivir con modelos mayores en la misma máquina.

Su relevancia actual radica en el auge de la IA local en estaciones compactas como la DGX Spark, donde un asistente pequeño y siempre disponible que guíe el despliegue de modelos más grandes cubre un hueco real. El modelo se ejecuta por defecto en CPU con cuatro hilos, un contexto de servicio de 4.096 tokens y un endpoint local en el puerto 10004.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de LiquidAI); detalle interno no disponible |
| Parametros totales | 1.728.801.600 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 4.096 tokens (perfil de servicio; calidad más allá no evaluada) |
| Tipos de cuantizacion | Q4_0 con embeddings de tokens en Q6_K (adaptador LoRA fusionado en base BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1, tipo "other") |
| Formato de pesos | GGUF (principal, Q4_0); el repositorio también lista safetensors vía PEFT; tamano del repo: 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B (revisión exacta `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7`), sobre el que se aplicó una adaptación LoRA de rango 8 y alpha 16, optimizada con AdamW a una tasa de aprendizaje de 0,00005. La pérdida se calculó únicamente sobre los tokens del asistente. El checkpoint seleccionado corresponde al paso 128 de una ejecución de 192 pasos, con un pico de asignación CUDA durante el entrenamiento de 3,59 GiB. El adaptador se fusionó en la base BF16 exacta antes de la conversión a Q4_0; los autores advierten expresamente de no aplicar el adaptador sobre el checkpoint cuantizado QAD separado que publica LiquidAI.

El conjunto de entrenamiento es deliberadamente reducido y sintético: 242 ejemplos de soporte redactados a mano, informados por 44 referencias de soporte fechadas, sin chats privados de usuarios ni credenciales. La cobertura temática se centra en soporte de DGX Spark, inferencia local y selección de la herramienta de inspección adecuada. Un detalle de diseño relevante: Sparkbot inyecta las referencias de soporte en tiempo de ejecución, de modo que la documentación puede evolucionar sin reentrenar los pesos; los hechos de hardware en vivo provienen de herramientas de inspección, no del conocimiento del modelo.

## Capacidades

- Generación de texto conversacional en inglés, orientada a soporte técnico de IA local.
- Selección y uso de herramientas (tool calling) cuando se integra en el panel Sparkbot: inspección de soporte de Docker, frecuencias de GPU, memoria y conexiones.
- Descubrimiento de modelos y explicación de requisitos de despliegue.
- Propuesta de comandos de terminal (siempre sujetos a aprobación del propietario en el flujo del panel).
- Guía multi-paso para configuración: comprobar el hardware, resolver dependencias, elegir recetas incluidas y monitorizar modelos en ejecución.
- Plantilla de chat incluida en el GGUF, con soporte de modo thinking desactivable mediante `enable_thinking` en llama.cpp.
- Importante: ejecutar el archivo del modelo aislado solo ofrece un modelo de chat; el acceso a shell, la descarga de releases y el despliegue de modelos los proporciona el panel, no el modelo.

## Casos de uso

- Asistente de soporte para DGX Spark: guía al usuario desde la comprobación del hardware hasta el primer modelo en marcha, usando herramientas de inspección en vivo y proponiendo comandos que requieren aprobación.
- Resolución de dependencias en despliegues locales: diagnostica dependencias ausentes y sugiere el siguiente paso concreto, apoyándose en referencias de soporte inyectadas en tiempo de ejecución.
- Selección de perfiles de despliegue: ayuda a elegir la receta de despliegue adecuada según la memoria y capacidades de la máquina.
- Ayudante permanente junto al modelo principal: al ejecutarse en CPU (cuatro hilos, una petición simultánea), deja la GPU libre para el modelo de trabajo principal.
- Monitorización y comparación de rendimiento: asiste en la comparación de resultados de decodificación y prefill de modelos en ejecución.
- Base para asistentes locales embebidos: su tamaño de ~1 GB y su runtime nativo de 9,2 MB sin Docker ni PyTorch lo hacen adecuado para integraciones donde no se quiere instalar stacks pesados.
- Onboarding de principiantes en IA local: ofrece explicaciones guiadas mientras los usuarios avanzados conservan acceso directo a terminal y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son internos y limitados:

| Métrica | Valor |
|---|---|
| Pérdida media en validación (6 ejemplos de dominio) | de 4,62 a 3,32 |
| Comprobaciones de humo de enrutado de herramientas (post Q4) | 5 de 5 superadas |
| Pico de asignación CUDA en entrenamiento | 3,59 GiB |

Los autores advierten que la validación guió la selección del checkpoint (no es una prueba independiente final) y que estas comprobaciones estrechas no establecen precisión fáctica amplia ni fiabilidad de automatización de despliegue.

## Requisitos de hardware

- Inferencia en CPU por diseño: el perfil por defecto usa CPU local con cuatro hilos, una petición a la vez y cero capas en GPU (`--n-gpu-layers 0`), dejando la GPU libre para el modelo principal.
- Memoria: el panel limita el servicio del asistente a 3 GiB (límite configurado, no medida residente publicada). La descarga del GGUF es de ~1,05 GB, por lo que cualquier equipo moderno con 8 GB de RAM debería manejarlo; no se publica una cifra exacta de RAM en inferencia.
- Diseñado para y probado en NVIDIA DGX Spark, pero al ser inferencia GGUF en CPU funciona en cualquier equipo con un build actual de llama.cpp compatible con LFM3.
- Cabe con holgura en cualquier GPU de consumo si se desea acelerar (el GGUF de ~1 GB cabe incluso en GPUs de 4 GB), aunque el uso previsto es CPU.
- Despliegue: llama.cpp / llama-server (comando documentado en la model card), integración nativa en el panel Sparkbot (runtime propio de 9,2 MB, sin Docker ni PyTorch). No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se documenta que atiende una petición simultánea con cuatro hilos.

## Comparativa con modelos similares

| | SparkBotLLM-1.7B | LiquidAI/LFM3-1.7B (base) | Qwen2.5-1.5B-Instruct |
|---|---|---|---|
| Parametros | 1,73 B | 1,73 B | 1,54 B |
| Tipo | LoRA de dominio fusionado + Q4_0 | Base/instruct general | Instruct general |
| Contexto | 4.096 (perfil de servicio) | no disponible en la ficha | 32.768 |
| Especialización | Soporte DGX Spark e IA local | General | General |
| Formato | GGUF Q4_0 (+ safetensors PEFT) | safetensors, checkpoints cuantizados propios | safetensors, GGUF comunitarios |
| Licencia | LFM Open License v1.0 | LFM Open License v1.0 | Apache 2.0 / Qwen (según variante) |
| Idiomas | Inglés | no disponible en la ficha | Multilingüe (100+) |

La alternativa directa a SparkBotLLM no es otro modelo pequeño generalista, sino usar el LFM3-1.7B base sin la adaptación: se pierde el ajuste fino de soporte DGX Spark pero se gana generalidad. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo muy pequeño (1,7 B) con un ajuste fino de solo 242 ejemplos: puede cometer errores con facilidad; los propios autores recomiendan verificar la orientación importante y mantener la revisión de comandos activada.
- Riesgo de alucinación explícitamente reconocido: las comprobaciones realizadas son estrechas y no establecen precisión fáctica amplia ni automatización de despliegue fiable.
- Contexto de servicio de 4.096 tokens; la calidad con contextos mayores no ha sido evaluada.
- Solo inglés: no apto para asistencia en castellano u otros idiomas.
- Sin el panel Sparkbot, el modelo no tiene acceso a shell, ni descarga releases, ni despliega modelos; es solo un chat.
- Incompatibilidad cuantización: no aplicar el adaptador LoRA al checkpoint QAD cuantizado separado de LiquidAI; debe usarse la base BF16 de la revisión indicada.
- Licencia LFM Open License v1.0: es una licencia de tipo "other" con condiciones comerciales; revisar el archivo LICENSE antes de cualquier uso comercial.
- El sitio sparkbot.dev está en preparación (hosting y dominio pendientes) en el momento de publicación; el modelo puede descargarse y ejecutarse de forma independiente.
- El tráfico de CPU y memoria unificada comparte recursos con el modelo principal en la DGX Spark, incluso con inferencia en CPU.
- Adopción marginal hasta ahora: 61 descargas y 1 like, sin historial comunitario que respalde su fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oxbyte8/SparkBotLLM-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Sitio del proyecto Sparkbot (en preparación): https://sparkbot.dev
- Descarga del GGUF Q4_0: https://huggingface.co/oxbyte8/SparkBotLLM-1.7B/tree/main
- Licencia: enlace al archivo LICENSE en el repositorio del modelo (https://huggingface.co/oxbyte8/SparkBotLLM-1.7B/blob/main/LICENSE)
