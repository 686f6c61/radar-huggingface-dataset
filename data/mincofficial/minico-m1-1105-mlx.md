# Mincofficial/Minico-M1-1105-MLX

## Resumen

Minico M1 1105 MLX es una compilación cuantizada a 8 bits en formato MLX del modelo Minico-M1-1105, un ajuste fino de LiquidAI/LFM2.5-350M orientado a razonamiento con niveles de esfuerzo configurables. Lo desarrolla el usuario Mincofficial y está pensado específicamente para ejecución en Apple Silicon mediante la librería `mlx-lm`, lo que permite desplegar un modelo conversacional de 354 millones de parámetros en Macs sin necesidad de GPU dedicada.

El modelo hereda la arquitectura LFM2 (familia de Liquid AI) y añade un mecanismo de control del razonamiento (`reasoning_effort`) con cinco niveles —`off`, `low`, `medium`, `high` y `max`— que ajusta la longitud del bloque de pensamiento antes de la respuesta final. Esta funcionalidad, junto con el ajuste por SFT, DPO y GRPO, lo sitúa como una opción ligera para tareas de razonamiento controlado en entornos de desarrollo locales.

Su relevancia actual radica en tres factores: el tamaño reducido (0,4 GB en el repositorio), la licencia LFM Open v1.0 que permite uso comercial bajo umbral de ingresos, y la integración nativa con el ecosistema MLX para Macs con chips M-series. No obstante, el soporte de idiomas se limita al inglés y la información pública sobre benchmarks es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI, transformer) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); el repo base ofrece precisión completa |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM2.5-350M de Liquid AI, una arquitectura de tipo transformer perteneciente a la familia LFM2. Según la model card, los pesos originales fueron modificados mediante ajuste fino supervisado (SFT), optimización por preferencias (DPO) y optimización por políticas con recompensa (GRPO), además de fusión de pesos (weight merging). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre la innovación arquitectónica concreta de LFM2.

La contribución técnica más destacable es el sistema de niveles de esfuerzo de razonamiento, implementado a través de la plantilla de chat. El modelo fue entrenado con conversaciones que mantienen un único ajuste de esfuerzo de principio a fin, lo que implica que cambiar el nivel a mitad de una conversación degrada el comportamiento. La compilación MLX aplica cuantización a 8 bits que, según el autor, es prácticamente sin pérdida a este tamaño.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con control de esfuerzo: cinco niveles (`off`, `low`, `medium`, `high`, `max`) que determinan la longitud del bloque de pensamiento antes de la respuesta.
- Modo sin pensamiento (`off`) para respuestas inmediatas, útil en aplicaciones de baja latencia.
- Alias adicionales en la plantilla de chat (`none`, `minimal`, `xhigh`) y parámetro `enable_thinking=False`.
- Ejecución nativa en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo se ejecuta con `mlx-lm` en chips M-series y permite alternar entre respuestas rápidas (`off`) y razonamiento profundo (`max`) según la consulta, sin depender de servicios en la nube.
- Resolución de problemas matemáticos paso a paso: con `reasoning_effort` en `medium` o `high`, el modelo genera cadenas de pensamiento antes de la respuesta final, adecuado para ejercicios de aritmética y lógica sencilla.
- Prototipado de aplicaciones conversacionales: al ocupar 0,4 GB y cargarse en memoria unificada, sirve para iterar rápidamente en el desarrollo de chatbots o interfaces de chat en entornos de desarrollo locales.
- Filtrado y clasificación de texto con justificación: el modo `low` produce un razonamiento breve que puede registrarse como traza explicativa junto a la decisión del modelo.
- Educación y demostraciones de razonamiento controlado: útil para mostrar cómo varía la calidad y la longitud del razonamiento según el nivel de esfuerzo configurado.
- Evaluación comparativa de cuantizaciones: al existir versión de precisión completa y versión MLX 8-bit, permite medir la degradación introducida por la cuantización en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 0,4 GB en 8 bits, por lo que la inferencia requiere aproximadamente 0,5–1 GB de memoria considerando overhead de runtime.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada.
- Despliegue: `mlx-lm` (librería oficial); para precisión completa, el repo base `Mincofficial/Minico-M1-1105` se carga directamente con `mlx_lm`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: temperatura 0,1–0,3, top_k 50, repetition penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Minico M1 1105 MLX | 354 M | no disponible | LFM Open v1.0 | Hugging Face (MLX 8-bit) |
| LiquidAI/LFM2.5-350M | ~350 M | no disponible | LFM Open v1.0 | Hugging Face (modelo base) |
| Mincofficial/Minico-M1-1105 | 354 M | no disponible | LFM Open v1.0 | Hugging Face (precisión completa) |

Las alternativas comparables son el modelo base de Liquid AI y la versión de precisión completa del propio Minico; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas es desconocido.
- Riesgo de alucinación inherente a modelos de 350 M de parámetros, especialmente en conocimiento factual.
- El cambio de nivel de esfuerzo a mitad de conversación no está recomendado: el modelo fue entrenado con un ajuste constante por chat.
- La licencia LFM Open v1.0 permite uso comercial solo a organizaciones por debajo del umbral de ingresos definido en la licencia; es necesario leerla antes de un uso comercial.
- Es una versión modificada del modelo base de Liquid AI; se mantienen las atribuciones en el archivo `LICENSE`.
- La cuantización a 8 bits, aunque descrita como casi sin pérdida, puede introducir degradaciones menores no cuantificadas públicamente.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face (MLX 8-bit): https://huggingface.co/Mincofficial/Minico-M1-1105-MLX
- Modelo base (precisión completa): https://huggingface.co/Mincofficial/Minico-M1-1105
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
