# LiquidAI/LFM2.5-24B-A2B-MLX-4bit

## Resumen

LFM2.5-24B-A2B-MLX-4bit es una versión cuantizada a 4 bits del modelo LiquidAI/LFM2.5-24B-A2B, desarrollado por Liquid AI, convertida al formato MLX mediante mlx-lm 0.32.0. Se trata de un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) orientado a generación de texto y conversación, con 23.971.585.280 parámetros totales (unos 24B) y un subconjunto de parámetros activos por token (la nomenclatura A2B sugiere del orden de 2B activos). Está pensado tanto para despliegue en el borde como para agentes que se ejecutan en dispositivo.

El modelo es un "modelo de razonamiento": los turnos del asistente incluyen una cadena de pensamiento explícita antes de la respuesta final, delimitada por etiquetas de tipo `<think>`. Soporta tool calling y function calling, y emplea una plantilla de chat de estilo ChatML. Cubre diez idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano).

Esta variante concreta es relevante porque ofrece el modelo en 4 bits para el ecosistema MLX (Apple Silicon), reduciendo el peso del repositorio a unos 13,6 GB y manteniendo los gates de enrutamiento de expertos sin cuantizar en float32 para preservar la corrección del enrutado. Requiere mlx-lm 0.32.0 o superior, ya que versiones anteriores cargan el modelo pero enrutan incorrectamente los expertos. No se ha publicado información sobre la longitud de contexto en los datos disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de tipo transformer, familia LFM2.5 (tag `lfm2_moe`) |
| Parametros totales | 23.971.585.280 (unos 24B) |
| Parametros activos | del orden de 2B según la nomenclatura A2B (no confirmado explícitamente en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits por peso (grupo de 64, modo affine); embedding de tokens (atado a la cabeza de salida) a 6 bits; gates de enrutamiento MoE en float32 sin cuantizar |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, licencia tipo "other") |
| Formato de pesos | safetensors en formato MLX, cuantizado a 4 bits; compatible con mlx-lm >= 0.32.0 |

## Arquitectura y entrenamiento

La información disponible indica que LFM2.5-24B-A2B es un modelo de mezcla de expertos (MoE) de la familia LFM2.5, con 24B de parámetros totales y enrutamiento por expertos (los tags incluyen `lfm2_moe` y `moe`). El modelo base se describe como un modelo de razonamiento con cadena de pensamiento explícita en los turnos del asistente. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO para el ajuste. El informe técnico de referencia es "LFM2 Technical Report" (arXiv:2511.23404), que presumiblemente contiene dichos detalles, pero su contenido no forma parte de los datos disponibles aquí.

En cuanto a esta variante concreta, la innovación principal es la cuantización: 4 bits por peso con grupo de 64 en modo affine, manteniendo el embedding de tokens (atado a la cabeza de salida) a 6 bits y los gates de enrutamiento de expertos sin cuantizar en float32. Esta decisión de mantener los gates en precisión completa es clave para que el enrutado de expertos funcione correctamente. La conversión se realizó con mlx-lm 0.32.0, que corrige un fallo de versiones anteriores que enrutaban mal los expertos pese a cargar el modelo.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con cadena de pensamiento explícita: los turnos del asistente incluyen un bloque `<think>` previo a la respuesta final.
- Soporte de tool calling / function calling mediante el parámetro `tools` de `tokenizer.apply_chat_template(...)`.
- Capacidades multilingües en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Plantilla de chat de estilo ChatML, aplicable automáticamente con `tokenizer.apply_chat_template()`.
- Orientación a despliegue en el borde y agentes en dispositivo (la publicación asociada se titula "Built for Fast On-Device Agents").

## Casos de uso

- Agentes locales en dispositivos Apple Silicon: al ser una variante MLX de un modelo MoE con un subconjunto reducido de parámetros activos, permite ejecutar razonamiento y tool calling en Mac con memoria unificada, sin depender de servicios en la nube.
- Asistentes conversacionales multi-turno: con una plantilla ChatML y soporte de razonamiento con `<think>`, es adecuado para diálogos donde el modelo debe explicar su razonamiento antes de responder.
- Automatización de flujos con function calling: puede invocar herramientas externas a través del soporte de tools, integrándose en pipelines de agentes que encadenan varias llamadas.
- Generación y asistencia de código en local: como modelo de propósito general con razonamiento, puede emplearse en tareas de autocompletado y explicación de código dentro de entornos de desarrollo locales.
- Procesamiento multilingüe de documentos: cubre diez idiomas, lo que permite tareas de resumen, traducción y extracción de información en entornos hispanohablantes y multilingües.
- Razonamiento paso a paso para tareas analíticas: la cadena de pensamiento explícita facilita tareas de matemáticas, lógica y resolución de problemas donde interesa auditar el proceso, no solo la respuesta.
- Prototipado e investigación sin GPU dedicada: al ejecutarse en MLX sobre Apple Silicon, sirve para experimentar con un MoE de 24B en hardware de consumo.
- Despliegue en el borde con requisitos de memoria ajustados: la cuantización a 4 bits reduce el peso del repositorio a 13,6 GB, lo que facilita su distribución y almacenamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Formato nativo MLX: el modelo está pensado para ejecutarse en Apple Silicon con mlx-lm >= 0.32.0, no en CUDA de forma directa con este repositorio concreto.
- Memoria: el repositorio ocupa 13,6 GB en 4 bits. Como estimación, se necesita al menos esa cantidad de memoria unificada más el espacio de trabajo para la ventana de contexto y caché KV; un Mac con 16 GB de memoria unificada quedaría muy justo, mientras que 24 GB o más ofrecerían margen.
- GPU recomendadas: no aplicable en el sentido de GPU discretas para este formato; el objetivo son los chips de Apple (series M). No se dispone de cifras oficiales de latencia ni throughput.
- Viabilidad en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (estimación práctica de 24 GB o más para holgura), dado el peso de 13,6 GB.
- Opciones de despliegue: mlx-lm (versión 0.32.0 o superior) es el soporte documentado. Otros runners no se mencionan en la información disponible.
- Parámetros de generación recomendados en el ejemplo de la model card: temperatura 0,1, top_k 50 y penalización por repetición de 1,05, con `max_tokens` de 4096.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de contexto de modelos comparables en la información proporcionada. La única comparación documentada es entre esta variante cuantizada y su modelo base.

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-MLX-4bit | 23,97B totales (A2B) | MLX (safetensors) | 4 bits (grupo 64) | LFM Open License v1.0 | HuggingFace (3.228 descargas, 16 likes) |
| LiquidAI/LFM2.5-24B-A2B (base) | 23,97B totales (A2B) | no disponible | sin cuantizar (pesos originales) | LFM Open License v1.0 | HuggingFace |

Para el resto de alternativas de la misma categoría (MoE de ~24B orientados a borde): no disponible.

## Limitaciones y advertencias

- Riesgo de alucinación: no se documentan tasas concretas; como modelo generativo, es susceptible de producir información incorrecta, especialmente en idiomas con menos representación.
- Sesgos: no se dispone de información sobre sesgos evaluados en la documentación proporcionada.
- Longitud de contexto: no disponible, por lo que no puede garantizarse un comportamiento adecuado en contextos largos.
- Compatibilidad de software: requiere mlx-lm 0.32.0 o superior. Con versiones anteriores el modelo se carga pero enruta mal los expertos, lo que produce resultados incorrectos.
- Restricciones de licencia: se distribuye bajo LFM Open License v1.0, una licencia de tipo "other". Es imprescindible revisar los términos concretos del archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia permisiva estándar como Apache 2.0 o MIT.
- Ámbito de despliegue: esta variante está en formato MLX, orientada a Apple Silicon; no es directamente utilizable en entornos CUDA sin una conversión previa.
- Cuantización: al estar en 4 bits, cabe esperar una degradación de precisión frente al modelo base sin cuantizar, aunque no se han publicado métricas que la cuantifiquen.
- Idiomas: aunque se listan diez idiomas, no se detalla el nivel de calidad por idioma.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentación de la plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentación de uso de herramientas (tool use): https://docs.liquid.ai/lfm/key-concepts/tool-use
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Blog del modelo (según la cita): www.liquid.ai/blog/lfm2-5-24b-a2b
- Informe técnico LFM2 (arXiv:2511.23404): https://arxiv.org/abs/2511.23404

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían al códec de vídeo Xvid y no guardan relación con LFM2.5.
