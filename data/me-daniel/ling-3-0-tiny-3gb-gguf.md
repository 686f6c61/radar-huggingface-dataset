# Me-Daniel/Ling-3.0-tiny-3GB-GGUF

## Resumen

Ling-3.0-tiny-3GB-GGUF es una cuantización del modelo Ling-3.0-tiny desarrollado por inclusionAI, publicada por el usuario Me-Daniel. El modelo base es un transformer con arquitectura híbrida de atención: 24 capas que combinan 18 capas de Kimi Delta Attention (KDA) con 6 capas de gated MLA (Multi-head Latent Attention), e incorpora una estructura de expertos enrutados (MoE) que constituye aproximadamente el 86% de los pesos. Con 7.893.392.800 parámetros totales, el modelo base está diseñado para generación de texto conversacional y soporta tool calling.

Esta ficha se centra en el archivo GGUF de aproximadamente 3 GB, que el autor presenta como la cuantización de ~3 GB con menor divergencia respecto al modelo original en BF16. La relevancia de esta publicación reside en su metodología de cuantización: en lugar de aplicar una receta uniforme, el autor coloca los bits de menor precisión en las partes del modelo que mejor los toleran (los expertos enrutados) y preserva mayor precisión en atención y el experto compartido, además de aplicar un refinador que reajusta los códigos de baja precisión de los expertos.

El resultado, según las mediciones del autor, es un archivo de 3,12 GB que se mantiene entre un 21% y un 46% más cerca del modelo original (en divergencia KL respecto a BF16) que las cuantizaciones IQ3_XXS de bloomer010 y Q2_K_L de bartowski, con un rendimiento en velocidad equivalente y sin pérdida en HellaSwag. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 24 capas: 18 de Kimi Delta Attention (KDA) y 6 de gated MLA; expertos enrutados (MoE) con experto compartido |
| Parámetros totales | 7.893.392.800 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor usan contexto de 4K en el conjunto de "long books") |
| Tipos de cuantización | IQ3_XXS con códigos de expertos refinados (archivo publicado); el autor recomienda Q4_K_M (~4,8 GB) si hay espacio |
| Idiomas soportados | no disponible (se mencionan conjuntos de prueba en chino; el modelo base no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del archivo | 3,12 GB |
| Modelo base | inclusionAI/Ling-3.0-tiny |
| Biblioteca | llama.cpp |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura transformer de 24 capas que combina dos mecanismos de atención: 18 capas de Kimi Delta Attention (KDA) y 6 capas de gated MLA (Multi-head Latent Attention). Incluye una estructura de mezcla de expertos (MoE) con expertos enrutados y un experto compartido; según el autor de la cuantización, los expertos enrutados representan el 86% de los pesos del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable de esta publicación no está en el modelo base sino en el proceso de cuantización. El autor realizó un análisis de sensibilidad cuantizando cada parte del modelo por separado y midiendo el daño en divergencia KL por MB ahorrado, concluyendo que los expertos enrutados toleran mejor la baja precisión que la atención o el experto compartido. Sobre esa base, mantuvo los expertos en IQ3_XXS y destinó el espacio ahorrado a mayor precisión en atención. Adicionalmente, un refinador reajusta los códigos de baja precisión de los expertos para que sus salidas se aproximen más al original, sin cambiar tamaño ni tipos de tensor; según el autor, este refinador por sí solo redujo la KL entre un 12% y un 13%. El código y las mediciones están publicados en el repositorio de GitHub del autor.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Soporte de tool calling / function calling (el autor incluye un conjunto de prueba específico de "tool calls" y el modelo base está etiquetado como compatible con endpoints).
- Razonamiento y generación de código (el autor evalúa con un conjunto de prueba de código).
- Procesamiento de contextos largos (evaluado con un conjunto de "long books" a 4K de contexto).
- Capacidades multilingües: se evalúa con un conjunto de prueba en chino; no hay lista oficial de idiomas disponible.
- Integración con llama.cpp mediante plantilla Jinja (`--jinja`) para formateo de chat.

## Casos de uso

- Despliegue en hardware con poca VRAM: el archivo de 3,12 GB permite ejecutar un modelo de ~7,9 mil millones de parámetros en GPUs de consumo con 6-8 GB de VRAM o en Apple Silicon con memoria unificada, usando llama.cpp con `-ngl 99` para descargar todas las capas en GPU.
- Asistente conversacional local: con los parámetros recomendados (temperatura 1.0, top-p 0.95, top-k 20) y plantilla Jinja, se puede servir un endpoint compatible con la API de chat mediante `llama-server` en el puerto 8080.
- Automatización con tool calling: el modelo soporta function calling, lo que permite integrarlo en flujos donde el modelo decide qué herramienta invocar (APIs, consultas a bases de datos, operaciones de ficheros) con un coste de memoria reducido.
- Prototipado y evaluación de pipelines de agentes: al ser una cuantización fiel al original en tool calls (KL 0,46 frente a 0,58 y 0,61 de las alternativas), es adecuado para desarrollar y depurar lógica de agentes multi-paso antes de escalar a un modelo mayor.
- Procesamiento de documentos largos en local: aunque el contexto máximo no está declarado, las pruebas a 4K sugieren un comportamiento estable en resúmenes y preguntas sobre textos extensos, útil para análisis de documentación técnica o legal en entornos sin conectividad.
- Generación de código asistida en estaciones de trabajo: el conjunto de prueba de código muestra la menor divergencia de las tres cuantizaciones comparadas (KL 0,15), lo que lo hace apto para autocompletado y generación de fragmentos en editores locales.
- Investigación sobre cuantización: el repositorio publica mediciones de sensibilidad por componente y código del refinador, lo que permite reproducir y extender la metodología a otros modelos MoE.

## Benchmarks y rendimiento

| Métrica | Este archivo | bloomer010 IQ3_XXS | bartowski Q2_K_L |
|---|---|---|---|
| Tamaño | 3,12 GB | 3,13 GB | 3,24 GB |
| KL vs BF16, chino (menor es mejor) | 0,33 | 0,41 | 0,41 |
| KL vs BF16, código | 0,15 | 0,25 | 0,22 |
| KL vs BF16, tool calls | 0,46 | 0,58 | 0,61 |
| KL vs BF16, libros largos (4K) | 0,12 | 0,23 | 0,25 |
| Acuerdo top-1 con BF16 | 75-89% | 72-86% | 72-87% |
| HellaSwag (1.000 tareas) | 55,9% | 55,1% | 54,5% |
| Velocidad (M5 Pro, Metal) | ~81-87 tok/s | ~81-87 tok/s | ~81-87 tok/s |

El autor indica que los intervalos de confianza pareados al 95% de las diferencias de KL quedan por debajo de cero en todos los conjuntos, y que las diferencias de HellaSwag de uno o dos puntos están dentro de la incertidumbre de la métrica. Las pruebas de velocidad se realizaron en un único Mac con una única versión de llama.cpp; las diferencias entre archivos están dentro del ruido entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con el archivo IQ3_XXS de 3,12 GB, incluyendo overhead de contexto y caché KV (el valor exacto depende de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para descarga completa de capas; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son compatibles. En Apple Silicon se probó con Metal en un M5 Pro.
- Cabe en GPU de consumo: sí, en modelos con 6-8 GB de VRAM o más; también en sistemas con memoria unificada de 8 GB o superior.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o interfaces basadas en llama.cpp. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: aproximadamente 81-87 tokens/s de generación en un M5 Pro con Metal, según el autor. No se proporcionan datos para GPU discretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tamaño del archivo | KL media vs BF16 |
|---|---|---|---|---|---|
| Ling-3.0-tiny-3GB-GGUF (este) | 7,89 B | no disponible | MIT | 3,12 GB | menor en los cuatro conjuntos |
| bloomer010 IQ3_XXS de Ling-3.0-tiny | 7,89 B | no disponible | MIT | 3,13 GB | 0,23-0,58 |
| bartowski Q2_K_L de Ling-3.0-tiny | 7,89 B | no disponible | MIT | 3,24 GB | 0,22-0,61 |
| Ling-3.0-tiny Q4_K_M (recomendado por el autor) | 7,89 B | no disponible | MIT | ~4,8 GB | más cercano al original que IQ3_XXS |

La comparación se limita a cuantizaciones del mismo modelo base, ya que no se dispone de datos de benchmarks frente a modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La métrica principal empleada (divergencia KL respecto a BF16) mide fidelidad al modelo original, no calidad absoluta; un KL bajo no garantiza un buen rendimiento en tareas específicas.
- Las diferencias en HellaSwag de uno o dos puntos están dentro de la incertidumbre de la métrica y no deben interpretarse como mejoras significativas.
- Las pruebas se realizaron en un único Mac (M5 Pro) con una única versión de llama.cpp; no hay validación en GPU discretas ni en otros backends.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base.
- La lista de idiomas soportados no está declarada; solo se confirma la existencia de un conjunto de prueba en chino.
- La longitud máxima de contexto no está especificada; las pruebas de contexto largo se limitan a 4K tokens.
- El autor advierte de que las comprobaciones de repetición son preliminares ("a first loop check") y que las pruebas de generaciones más largas están pendientes.
- La licencia MIT del archivo cubre la cuantización, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-3.0-tiny para usos comerciales específicos.

## Enlaces

- Hugging Face: https://huggingface.co/Me-Daniel/Ling-3.0-tiny-3GB-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio con código y mediciones: https://github.com/me-daniel/ling-3.0-tiny-quant
