# nikhilwalia23/qwen3-1.7b-banking77-intent

## Resumen

qwen3-1.7b-banking77-intent es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B publicado por el usuario nikhilwalia23 en Hugging Face. El entrenamiento se realizó con Unsloth y la librería TRL sobre el checkpoint cuantizado a 4 bits unsloth/qwen3-1.7b-unsloth-bnb-4bit, según indica la propia model card, que además afirma que el entrenamiento fue "2 veces más rápido" gracias a Unsloth. El identificador del modelo sugiere un ajuste orientado a la clasificación de intenciones del dataset Banking77 (77 intenciones del dominio bancario), aunque la model card no lo confirma explícitamente.

El modelo hereda la arquitectura de la familia Qwen3: un transformer decoder-only denso de aproximadamente 1.700 millones de parámetros, con licencia Apache 2.0 y orientado a generación de texto. No es un modelo de mezcla de expertos (MoE), por lo que no tiene parámetros activos diferenciados. Su relevancia práctica es limitada por el momento: el repositorio registra 0 descargas y 0 "likes", y la model card no aporta información sobre dataset de entrenamiento, hiperparámetros, métricas de evaluación ni longitud de contexto.

Se trata, por tanto, de un artefacto experimental o de un ejercicio de ajuste fino, más útil como punto de partida reproducible que como modelo listo para producción. Cualquier evaluación seria debería empezar por verificar la integridad de los pesos (el repositorio ocupa solo 0,1 GB, un tamaño llamativamente pequeño para un modelo de 1,7 B parámetros) y por reproducir el pipeline de entrenamiento con un conjunto de validación propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3-1.7B); no documentada en la model card |
| Parámetros totales | 1.700 millones (1,7 B) nominales, según el nombre del modelo y su modelo base; no confirmado en la model card |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-1.7B documenta 32.768 tokens nativos, ampliables a 131.072 con YaRN configurado por el usuario |
| Tipos de cuantización | El modelo base utilizado para el ajuste está cuantizado a 4 bits (unsloth-bnb-4bit). No se documentan cuantizaciones publicadas del modelo final |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen3-1.7b-unsloth-bnb-4bit |
| Autor | nikhilwalia23 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación en Hugging Face | 2026-09-20T19:11:30Z |
| Última actualización en Hugging Face | 2026-09-20T19:11:53Z (32 segundos después de la creación) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso de la familia Qwen3, que en su variante de 1,7 B emplea atención con caché KV y está pensado para generación de texto autoregresiva. El autor no describe en la model card ningún cambio estructural sobre el modelo base, por lo que se asume que el ajuste es un fine-tuning estándar (muy probablemente SFT con LoRA o QLoRA, dado el uso de Unsloth sobre un checkpoint de 4 bits; esto es una inferencia a partir de las herramientas citadas, no un dato confirmado en la documentación). También se etiqueta el modelo con "trl", la librería de Transformers Reinforcement Learning, aunque la model card no especifica si hubo una fase de RLHF, DPO u otro método de alineación posterior al SFT.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos por clase, la tasa de aprendizaje, el número de épocas ni la estrategia de enmascarado de la pérdida. Tampoco se documenta ninguna técnica de innovación propia (decodificación especulativa, atención lineal, destilación, etc.). El único elemento técnico destacado es el uso de Unsloth para acelerar el entrenamiento sobre un modelo base cuantizado a 4 bits, lo que reduce los requisitos de VRAM del proceso de ajuste pero introduce una pérdida de precisión que no se cuantifica en la documentación.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Qwen3-1.7B.
- Clasificación de intenciones del dominio bancario (77 clases de Banking77), inferida a partir del identificador del modelo; no verificada ni evaluada en la model card.
- Instrucciones y formato de chat: no documentado específicamente para este ajuste; el modelo base Qwen3 admite plantilla de chat con tokens especiales.
- Razonamiento multi-paso y modo "thinking": el modelo base Qwen3 incorpora modo de razonamiento explícito, pero no se confirma que se conserve ni se entrene en este ajuste.
- Tool calling / function calling: el modelo base Qwen3 lo soporta, pero no hay ninguna evidencia documentada de que este ajuste lo mantenga.
- Capacidades de agente: no disponibles.
- Capacidades multilingües: la model card declara únicamente inglés. El modelo base Qwen3 es multilingüe, pero no se garantiza su preservación tras el ajuste.
- Capacidades especiales (visión, audio, multimodalidad): no disponibles; el modelo es exclusivamente de texto.
- Ventana de contexto efectiva del ajuste: no disponible.

## Casos de uso

- Clasificación de intenciones bancarias: el modelo se usaría para mapear una consulta de cliente (por ejemplo, "no reconozco un cargo en mi tarjeta") a una de las 77 intenciones de Banking77, generando la etiqueta directamente como texto. Es el escenario para el que el nombre del modelo apunta, y su tamaño de 1,7 B permite inferencia barata en CPU o GPU modesta.
- Enrutamiento de tickets en atención al cliente: integrado como primer paso de un pipeline, traduce el texto libre del ticket a una categoría que decide a qué cola o equipo se envía, reduciendo el tiempo de primera respuesta. Su latencia baja por tamaño permite ejecutarlo en línea sobre cada mensaje entrante.
- Etiquetado asistido de datos no anotados: al ser un modelo generativo ajustado, puede usarse para preetiquetar grandes volúmenes de transcripciones de chats bancarios y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de anotación.
- Detección de urgencia y escalado: clasificar intenciones asociadas a fraude, cargos duplicados o bloqueo de tarjeta permite disparar reglas de escalado inmediato a un agente humano, sin depender de coincidencias de palabras clave.
- Enrutamiento previo a un modelo mayor: usar este modelo de 1,7 B como clasificador rápido que decide si una consulta requiere un modelo de mayor capacidad, reduciendo el coste por consulta en arquitecturas de cascada.
- Prototipado local y experimentación: gracias a su tamaño, puede ejecutarse en portátiles con GPU de 6-8 GB o incluso en CPU, lo que lo hace adecuado para prototipos de investigación y pruebas de concepto antes de invertir en infraestructura.
- Punto de partida para ajustes específicos de dominio: reentrenado con Unsloth sobre un catálogo propio de intenciones (seguros, telecomunicaciones, comercio electrónico), sirve como base para clasificadores verticales con pocos datos.
- Revisión de calidad de conversaciones: ejecutado en lote sobre históricos de chats, permite agrupar y auditar motivos de contacto recurrentes para informes de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud, F1, precisión, recall ni ninguna otra métrica de evaluación sobre Banking77 o cualquier otro conjunto. Tampoco se comparan resultados con el modelo base ni con clasificadores de referencia.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir de un modelo denso de 1,7 B parámetros; no proceden de mediciones publicadas para este repositorio concreto.

- Pesos en fp16/bf16: aproximadamente 3,4 GB de VRAM solo para pesos; con caché KV y contexto moderado, entre 4 y 6 GB según longitud de secuencia y tamaño de lote.
- Pesos en cuantización de 8 bits: aproximadamente 1,8-2,0 GB.
- Pesos en cuantización de 4 bits: aproximadamente 1,0-1,2 GB, lo que deja margen para contexto largo en GPUs de gama media.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para fp16; GPUs de 4-6 GB (GTX 1650, RTX 3050) solo con cuantización de 4 bits y contextos cortos.
- Cabe en GPU de consumo: sí, en toda la gama media y alta reciente; también es viable en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio), vLLM y TGI para servicio HTTP; Ollama o llama.cpp requieren convertir previamente a GGUF, formato que el autor no publica.
- Aceleradores empresariales: A100, H100 o L40S son sobredimensionados para este tamaño, pero permiten lotes muy grandes y alto throughput.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo de respuesta por petición.
- Nota de verificación: el repositorio ocupa 0,1 GB, muy por debajo de los ~3,4 GB esperables para pesos fp16 de 1,7 B. Conviene comprobar la integridad y el formato real de los ficheros antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nikhilwalia23/qwen3-1.7b-banking77-intent | 1,7 B (nominal) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste de dominio bancario sin métricas publicadas |
| Qwen3-1.7B (modelo base) | 1,7 B | 32.768 tokens nativos; 131.072 con YaRN (documentación pública) | Apache 2.0 | Hugging Face y múltiples proveedores | Base generalista multilingüe, sin ajuste de dominio |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (documentación pública) | Apache 2.0 | Hugging Face, ampliamente desplegado | Generación instruida con soporte de tool calling documentado |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (documentación pública) | Apache 2.0 | Hugging Face | Alternativa orientada a despliegue en dispositivo |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (documentación pública) | Licencia comunitaria Llama 3.2 | Hugging Face | Contexto muy largo, con restricciones de licencia |

Los valores de contexto y parámetros de los modelos comparados proceden de su documentación pública y deben verificarse en la model card correspondiente antes de tomar decisiones. No hay datos de rendimiento comparativo para el modelo analizado.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 "likes" en el momento de redactar esta ficha; no hay evidencia de que el modelo haya sido evaluado por terceros.
- Model card mínima: no se documentan dataset, hiperparámetros, número de épocas, estrategia de entrenamiento ni métricas. Es imposible reproducir el ajuste con la información disponible.
- Sesgo de dominio y de idioma: el ajuste está declarado solo en inglés y, si el objetivo es Banking77, está fuertemente sesgado hacia el vocabulario y los productos bancarios estadounidenses y europeos representados en ese corpus.
- Riesgo de alucinación: es un modelo generativo, no un clasificador con cabeza softmax. Puede producir etiquetas inventadas, texto adicional o respuestas plausibles pero incorrectas; en producción conviene restringir la decodificación a un vocabulario cerrado de etiquetas y validar la salida.
- Riesgo de sobreajuste: un ajuste sobre 77 clases con un modelo de 1,7 B puede memorizar patrones del conjunto de entrenamiento y degradar su comportamiento en consultas fuera de distribución.
- Pérdida de capacidades del modelo base: el ajuste sobre un checkpoint cuantizado a 4 bits puede haber degradado la generación general, el multilingüismo y el soporte de tool calling del Qwen3-1.7B original. No hay evaluación que lo confirme o desmienta.
- Ambigüedad del tamaño del repositorio: 0,1 GB es inconsistente con pesos completos de un modelo de 1,7 B en fp16. Verificar si se trata de un adaptador LoRA, de pesos cuantizados o de una subida incompleta.
- Fechas anómalas: la creación y la última actualización del repositorio figuran en 2026 y con 32 segundos de diferencia, lo que sugiere metadatos poco fiables o un repositorio generado de forma automática.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe cumplir también las condiciones del modelo base y de las herramientas empleadas (Unsloth, TRL). No se han localizado avisos adicionales del autor.
- Falta de formatos alternativos: no se publican GGUF, AWQ, GPTQ ni otras cuantizaciones listas para producción, lo que obliga a convertirlas por cuenta propia.
- Contexto no documentado: se desconoce la ventana efectiva tras el ajuste; asumir 32.768 tokens por herencia del modelo base no está respaldado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikhilwalia23/qwen3-1.7b-banking77-intent
- Modelo base utilizado para el ajuste: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Documentación y blog de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Dataset Banking77 (referencia del dominio, no citado por el autor): https://huggingface.co/datasets/PolyAI/banking77

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces devueltos correspondían a documentación de seguridad de Windows y no guardan relación con la ficha.
