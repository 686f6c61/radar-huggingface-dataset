# jsh-itsolution/ONDO-27B-FP8

## Resumen

ONDO-27B-FP8 es un ajuste fino de Qwen3.8-27B desarrollado por ITSOLUTION Co., Ltd. (Seúl, Corea del Sur), orientado a reducir la tasa de alucinación en preguntas factuales cortas. El modelo aprende a declarar que no sabe en lugar de inventar una respuesta, manteniendo al mismo tiempo una penalización KL que conserva las distribuciones de siguiente token próximas a las del modelo base. Se distribuye como checkpoint FP8 fusionado de aproximadamente 30,9 GB, con licencia Apache-2.0.

La relevancia del modelo es metodológica: demuestra que un ajuste fino muy pequeño (244 filas de entrenamiento) con QLoRA y pérdida combinada de entropía cruzada más divergencia KL puede reducir la tasa de alucinación de 0,239 a 0,170 en el conjunto público de AA-Omniscience sin degradar la precisión (0,135 a 0,137). El texto de entrenamiento procede íntegramente de las propias respuestas del modelo base, lo que evita depender de anotaciones humanas o de otro modelo generador.

El modelo conserva la arquitectura y el contexto del base Qwen3.8-27B, incluidas las capas MTP (multi-token prediction) y las capas Gated DeltaNet. Su ámbito de aplicación declarado es acotado: preguntas factuales cortas en inglés, con un efecto no medido fuera de esa distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.8-27B (incluye capas Gated DeltaNet y capas MTP); no se detalla la composición completa |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max length 3.072 tokens; la evaluación, un tope de salida de 65.536 tokens) |
| Tipos de cuantizacion | FP8 (checkpoint distribuido); el entrenamiento se hizo en QLoRA NF4 4-bit con doble cuantización sobre el base BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint FP8 fusionado, ~30,9 GB); adaptador LoRA en safetensors separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` en BF16) y se fusiona sobre el checkpoint FP8 oficial `Qwen/Qwen3.8-27B-FP8` (revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`). La arquitectura subyacente incluye capas Gated DeltaNet, que durante el entrenamiento se ejecutaron en la ruta de referencia de PyTorch en lugar de flash-linear-attention 0.5.2, porque el paso backward de esta última produce gradientes incorrectos en las primeras capas bajo esta configuración (fla issue #1598, reproducido por los autores). El checkpoint fusionado mantiene el mismo layout que la fuente FP8, incluidas las capas MTP.

El entrenamiento consistió en QLoRA sobre el base BF16: cuantización NF4 4-bit con doble cuantización, dtype de cómputo bfloat16, rango LoRA 16, alpha 32, dropout 0,05 en todas las capas lineales del modelo de lenguaje (torre de visión y aligner congelados). La pérdida por posición supervisada combina entropía cruzada sobre la respuesta del propio modelo base y divergencia KL forward KL(base ‖ modelo) sobre todo el vocabulario a temperatura 1.0, con peso 1.0 cada una; el profesor es la misma red con el adaptador desactivado. La pérdida se calcula en bloques de 256 posiciones para no retener todos los logits. Se realizó una época, 61 actualizaciones, batch 1 con acumulación de gradiente 4, learning rate 1e-4 constante tras 5 pasos de warmup, norma máxima de gradiente 0,3, longitud máxima 3.072 tokens, thinking habilitado en la plantilla de chat y semilla 20261029. La KL respecto al base fue 0 en las dos primeras actualizaciones y de 0,004 a 0,007 por posición en las cinco últimas.

Los datos de entrenamiento son 244 filas (de un conjunto fijo de 245; el sampler descarta el último lote incompleto de cuatro). Las preguntas provienen de PopQA (MIT), EntityQuestions (MIT) y Mintaka (CC-BY-4.0, COLING 2022), y las respuestas son muestras del propio modelo base bajo el prompt público de AA-Omniscience; ningún otro modelo escribió texto de entrenamiento. Se eliminaron preguntas idénticas o que compartían un 8-grama en inglés con las 300 públicas de AA-Omniscience o con SimpleQA Verified. La fusión se hizo sumando el adaptador al checkpoint FP8 en fp32 y recuantizando con regla exacta de desempate en el punto medio; cambiaron los 496 módulos objetivo y el resto de tensores es idéntico a la fuente FP8.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados del base Qwen3.8-27B, con modo thinking disponible en la plantilla de chat.
- Abstención calibrada: declara que no sabe en preguntas factuales cortas en lugar de responder con una invención, manteniendo la precisión global.
- Conservación de la distribución del modelo base gracias a la penalización KL, lo que limita la deriva de comportamiento fuera del dominio de entrenamiento.
- Capacidades multimodales potenciales heredadas del base (la torre de visión y el aligner se congelaron durante el ajuste); no se documentan explícitamente en la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado; se midió un aumento no significativo de caracteres Han o kana en respuestas a 473 prompts en coreano (87 frente a 73 en el base, p 0,097).

## Casos de uso

- Asistentes de preguntas factuales con abstención: el modelo puede integrarse en un sistema de respuesta a preguntas cortas en inglés donde sea preferible decir "no lo sé" a inventar, reduciendo la tasa de alucinación de 0,239 a 0,170 en el conjunto público de AA-Omniscience sin perder precisión.
- Moderación de respuestas en dominios sensibles: en atención al cliente o soporte técnico, el modelo puede declarar desconocimiento en lugar de fabricar datos de producto, políticas o cifras, lo que simplifica la revisión humana de las respuestas marcadas como inciertas.
- Generación aumentada por recuperación (RAG) con control de abstención: cuando el contexto recuperado no cubre la pregunta, el modelo tiende a no responder en vez de rellenar con conocimiento paramétrico; encaja como generador final en pipelines donde el recuperador puede fallar.
- Evaluación de sistemas de IA: sirve como referencia para medir el efecto de técnicas de abstención con KL sobre la distribución del base, útil en investigación sobre calibración y honestidad de modelos.
- Despliegue en infraestructura FP8: al distribuirse ya cuantizado en FP8 con el mismo layout que el checkpoint oficial, puede servirse en stacks que soporten FP8 (por ejemplo, vLLM) sin recuantizar, reduciendo el coste de memoria frente al BF16.
- Base para ajustes posteriores con LoRA: el adaptador LoRA está publicado por separado (`jsh-itsolution/ONDO-27B-LoRA`), lo que permite reproducir la fusión o aplicar el adaptador sobre el base FP8 en otros entornos.
- Filtrado de datos sintéticos: al disponer de un modelo que se abstiene en preguntas factuales fuera de su conocimiento, puede usarse para descartar respuestas de baja confianza en la generación de datasets.

## Benchmarks y rendimiento

Todos los datos son mediciones propias de los autores en sus GPUs, no resultados de Artificial Analysis.

| Benchmark | ONDO-27B-FP8 | Base (mismo harness) | Notas |
|---|---|---|---|
| AA-Omniscience v1.1, público 300 | precisión 0,137; tasa de alucinación 0,170; contribución al índice 5,517 | precisión 0,135; tasa de alucinación 0,239; 5,155 (dos ejecuciones) | Diferencia +0,362 puntos (+0,070 si toda respuesta truncada cuenta en contra; desviación estándar 0,206). El modelo se ejecutó en un motor de prueba y el base en la ruta de serving, por lo que el efecto de la ruta no está separado |
| HLE-Diamond, 150 ítems fijos (cribado) | 19/150 = 0,127 (una ejecución) | 38/300 = 0,127 (dos ejecuciones, tope de 65.536 tokens, respuesta truncada cuenta como incorrecta) | Cribado preregistrado: se supera con 18 o más de 150 correctas, es decir, sin caída superior a 0,3 puntos de índice |
| Prompts en coreano sin petición de escritura china o japonesa (473): respuestas con caracteres Han o kana | 87 | 73 | Aumento no significativo en el test unilateral preregistrado (p 0,097; 57 respuestas solo en este modelo, 43 solo en el base). No demuestra igualdad entre ambos |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 30,9 GB, por lo que se necesita al menos esa cantidad más overhead de activaciones y caché KV; en la práctica, GPUs con 40 GB o más para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, L40S 48 GB; en GPUs de 40-48 GB puede caber con contexto reducido.
- GPUs de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en FP8 sin offloading o cuantización adicional a 4 bits, no documentada por el autor.
- Opciones de despliegue: el autor no especifica stack; al ser un checkpoint FP8 con layout compatible con el base, es apto para servidores que soporten FP8 (vLLM, TGI). Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONDO-27B-FP8 | 27,78 mil millones | no disponible | Ajuste fino de abstención con KL sobre Qwen3.8-27B | Apache-2.0 | Hugging Face (repo FP8 + LoRA) |
| Qwen/Qwen3.8-27B | 27,78 mil millones (base) | no disponible | Modelo base generalista | Apache-2.0 (según el autor) | Hugging Face |
| Qwen/Qwen3.8-27B-FP8 | 27,78 mil millones (base cuantizado) | no disponible | Base en FP8 | Apache-2.0 (según el autor) | Hugging Face |

No se dispone de información sobre otros modelos de abstención comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 244 filas de preguntas factuales cortas en inglés; el efecto fuera de ese tipo de pregunta no está medido más allá de las filas indicadas.
- Las evaluaciones son muestras públicas pequeñas con un tope de salida de 65.536 tokens, no las condiciones publicadas de los benchmarks.
- Abstenerse más reduce la tasa de respuesta: las preguntas no intentadas pasan del 63,8 % al 70,0 % en el conjunto público de 300, aunque la precisión no cae.
- El aumento de caracteres Han o kana en respuestas a prompts en coreano no es significativo estadísticamente (p 0,097), pero el estudio no demuestra equivalencia con el base; el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación residual: la tasa baja a 0,170, no a cero.
- La comparación con el base mezcla rutas de ejecución (motor de prueba frente a ruta de serving), por lo que parte de la diferencia podría atribuirse al entorno.
- Solo se declara inglés; no hay datos de rendimiento en otros idiomas.
- Licencia Apache-2.0, igual que el base, sin restricciones comerciales adicionales conocidas; las preguntas de Mintaka son CC-BY-4.0 y requieren atribución.
- El adaptador LoRA se publica por separado; quien use el checkpoint fusionado no necesita aplicarlo, pero debe verificar la integridad de los ficheros mediante los SHA-256 indicados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsh-itsolution/ONDO-27B-FP8
- Adaptador LoRA: https://huggingface.co/jsh-itsolution/ONDO-27B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint FP8 del base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Sitio del desarrollador: https://ondo.sh
- Incidencia de flash-linear-attention citada: fla issue #1598 (referenciada en la model card; no se proporciona URL directa)
- PopQA, EntityQuestions y Mintaka: citados en la model card; no se proporcionan URL directas
