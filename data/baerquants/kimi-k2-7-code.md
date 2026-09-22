# baerquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a programación y uso agéntico, desarrollado por Moonshot AI como evolución de Kimi K2.6. Cuenta con aproximadamente 1,03 billones de parámetros totales y 32.000 millones activos por token. Mantiene la arquitectura MoE con atención MLA de la familia K2 e incorpora un encoder de visión MoonViT de 400 millones de parámetros, por lo que se publica con pipeline `image-text-to-text`. La longitud de contexto declarada es de 256K tokens (262.144).

La propuesta del modelo es mejorar la resolución de tareas de ingeniería de software de horizonte largo, es decir, flujos agénticos que requieren decenas o cientos de pasos sobre un repositorio. Según la model card, la eficiencia de tokens mejora respecto a K2.6 con una reducción de aproximadamente el 30% en el consumo de tokens de razonamiento, un dato relevante porque en agentes de código el coste dominante suele ser la generación de tokens dentro del bucle de razonamiento.

Conviene precisar el origen de esta ficha concreta: el repositorio analizado no es el oficial de Moonshot AI, sino una publicación de terceros (`baerquants`) que reproduce la model card original y distribuye pesos en formato `compressed-tensors` con un tamaño de repositorio de 595,2 GB. El modelo tiene interés técnico claro, pero debe distinguirse entre el modelo original y este reempaquetado comunitario, que registra 0 descargas y 0 likes y no aporta documentación propia más allá de la copiada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA y encoder de visión MoonViT |
| Parámetros totales | 1.026.879.376.368 (~1,03 billones; 1T declarado en la model card) |
| Parámetros activos | 32B |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantización | no disponible (el repositorio usa el formato `compressed-tensors`; no se detallan esquemas ni bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (declarada como `license:other` con `license_name: modified-mit` en los metadatos) |
| Formato de pesos | safetensors con compresión `compressed-tensors` |
| Capas totales | 61 (incluye 1 capa densa) |
| Dimensión oculta de atención | 7.168 |
| Dimensión oculta MoE por experto | 2.048 |
| Cabezas de atención | 64 |
| Expertos totales | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamaño de vocabulario | 160K |
| Función de activación | SwiGLU |
| Encoder de visión | MoonViT, 400M de parámetros |
| Pipeline | image-text-to-text |
| Librería | transformers (etiqueta `custom_code`, requiere `trust_remote_code`) |
| Tamaño del repositorio | 595,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer disperso de tipo MoE con 61 capas (una de ellas densa), 384 expertos por capa y 8 expertos seleccionados por token más un experto compartido, con una dimensión oculta de 2.048 por experto y 7.168 en el bloque de atención. La atención utiliza MLA (Multi-head Latent Attention), el mecanismo introducido en la familia DeepSeek-V2/K2 que comprime las claves y los valores en un espacio latente para reducir el tamaño de la caché KV en contextos muy largos. La activación es SwiGLU y el vocabulario es de 160K tokens. La parte multimodal la aporta un encoder MoonViT de 400M de parámetros, lo que permite entrada de imágenes junto a texto.

En cuanto a entrenamiento, la información disponible es limitada: la model card indica que K2.7 Code se construye sobre Kimi K2.6 y que se ha optimizado para tareas de código de horizonte largo, con una mejora de eficiencia que reduce el uso de tokens de razonamiento en torno a un 30% frente a K2.6. No se especifican en el material proporcionado el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el proceso de ajuste del encoder de visión. La innovación declarada es, por tanto, de tipo práctico (mejor finalización de tareas end-to-end y menor gasto de tokens de pensamiento) más que arquitectónica, ya que el esqueleto MoE+MLA se hereda del modelo predecesor.

## Capacidades

- Generación de código en múltiples lenguajes: la model card menciona tareas de ingeniería de software repartidas en más de 10 lenguajes de programación de uso mayoritario.
- Resolución de tareas de código de horizonte largo (long-horizon): ejecución de flujos con muchos pasos sobre un repositorio, mantenimiento de estado y finalización end-to-end de la tarea.
- Razonamiento con modo de pensamiento (thinking mode) activable, evaluado en la model card con `temperature = 1.0` y `top-p = 0.95`.
- Uso agéntico y multi-paso: los benchmarks MCP Atlas, MCP Mark Verified y Kimi Claw 24/7 Bench indican soporte de agentes que operan de forma sostenida en el tiempo.
- Tool calling / function calling: implícito en el soporte de MCP (Model Context Protocol) que reflejan los benchmarks de la categoría agéntica.
- Capacidades multimodales de entrada: pipeline `image-text-to-text` con encoder MoonViT, lo que permite procesar imágenes junto a texto (por ejemplo, capturas de pantalla, diagramas o documentación escaneada).
- Contexto largo de 256K tokens para trabajar con bases de código extensas o historiales de conversación prolongados.
- Capacidades multilingües: no disponible; los metadatos de HuggingFace no declaran idiomas soportados.

## Casos de uso

- Agentes de código autónomos: el modelo puede operar en bucles de varios pasos sobre un repositorio (leer ficheros, editar, ejecutar tests, corregir) apoyándose en la ventana de 256K tokens para mantener en contexto varios módulos simultáneamente. Los resultados de Program Bench y Kimi Code Bench v2 apuntan a este escenario como el objetivo principal del modelo.
- Revisión de pull requests en proyectos grandes: con 256K tokens de contexto es viable cargar el diff, los ficheros afectados y parte del historial relevante para producir comentarios de revisión contextualizados, en lugar de analizar hunks aislados.
- Refactorización y migración de código heredado: tareas de largo recorrido donde el modelo debe modificar decenas de ficheros de forma coherente, un caso en el que la reducción del 30% en tokens de pensamiento declarada se traduce directamente en menor coste por tarea.
- Automatización de pipelines de CI/CD: gracias al soporte de tool calling, el modelo puede integrarse como paso de análisis que invoca herramientas externas (linters, ejecutores de tests, gestores de incidencias) y decide la siguiente acción en función del resultado.
- Soporte técnico de segundo nivel: el modelo puede recibir capturas de pantalla de errores o interfaces junto con texto y logs, combinando el encoder de visión con el contexto largo para diagnosticar incidencias en conversaciones multi-turno.
- Análisis de documentación técnica y diagramas de arquitectura: la entrada multimodal permite extraer información de esquemas, diagramas de clases o capturas de paneles de monitorización y convertirla en documentación estructurada o en tareas de implementación.
- Agentes de operaciones continuas (24/7): vigilancia y respuesta ante incidentes en producción, con el modelo decidiendo cuándo escalar o aplicar una corrección, escenario medido por el benchmark Kimi Claw 24/7 Bench.
- Generación de tests y aumento de cobertura: dado un módulo y su contexto de uso, el modelo puede proponer casos de prueba, incluyendo los bordes que el código actual no cubre.

## Benchmarks y rendimiento

Resultados tal como figuran en la model card del autor. Las evaluaciones se realizaron con modo de pensamiento activado, `temperature = 1.0`, `top-p = 0.95` y contexto de 262.144 tokens para los modelos Kimi; los modelos propietarios se evaluaron en sus respectivos entornos (Codex en modo xhigh para GPT-5.5 y Claude Code en modo xhigh para Claude Opus 4.8).

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 (código) | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench (código) | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite (código) | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench (agéntico) | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas (agéntico) | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified (agéntico) | 72,8 | 81,1 | 92,9 | 76,4 |

Notas sobre estos datos: Kimi Code Bench v2 es un benchmark interno del propio autor, no un estándar de la comunidad, y los resultados de GPT-5.5 y Claude Opus 4.8 se reproducen desde la model card sin verificación independiente. No se han publicado en la información disponible resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de pesos abiertos de la misma categoría. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Los pesos tal como se distribuyen ocupan 595,2 GB en formato `compressed-tensors`. Como referencia aritmética, eso equivale a aproximadamente 4,6 bits por parámetro sobre 1,03 billones de parámetros, aunque el esquema exacto de compresión no está documentado en la información disponible.
- Si se reconstruyen los pesos en BF16, el tamaño sería de aproximadamente 2,05 TB (2 bytes por parámetro), una estimación derivada del recuento de parámetros, no un dato publicado.
- VRAM mínima para servir el modelo completo: 8× H100 de 80 GB (640 GB) queda muy al límite, ya que los pesos por sí solos consumen casi toda la memoria disponible. 8× H200 de 141 GB (1.128 GB) o 8× B200 ofrecen margen suficiente para caché KV y activaciones.
- El coste de cómputo por token es el de un modelo con 32B de parámetros activos, mientras que el coste de memoria es el de un modelo de 1T. El despliegue es, por tanto, intensivo en memoria y no en cómputo, lo que favorece configuraciones con muchas GPU y poco batch.
- GPU de consumo: no es viable. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar ni una fracción significativa del modelo en memoria. La ejecución requeriría offload a RAM del sistema, con cientos de gigabytes de memoria principal, y un rendimiento muy por debajo del interactivo.
- Opciones de despliegue: vLLM y SGLang son los motores habituales para modelos MoE de este tamaño; con la librería `transformers` es necesario activar `trust_remote_code` debido a la etiqueta `custom_code` del repositorio. No se incluyen pesos en formato GGUF en la información disponible, por lo que Ollama y llama.cpp no son utilizables sin una conversión propia.
- La atención MLA reduce el tamaño de la caché KV respecto a una atención completa, pero con 61 capas y 256K tokens de contexto la caché sigue siendo un factor a dimensionar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros (total / activos) | Contexto | Licencia | Kimi Code Bench v2 | Kimi Claw 24/7 Bench | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi K2.7 Code | ~1,03 B / 32B | 256K | modified-mit | 62,0 | 46,9 | Pesos abiertos (repositorio comunitario analizado) |
| Kimi K2.6 | no disponible | no disponible | no disponible | 50,9 | 42,9 | Pesos abiertos (modelo predecesor) |
| GPT-5.5 | no disponible | no disponible | Propietaria | 69,0 | 52,8 | Solo API |
| Claude Opus 4.8 | no disponible | no disponible | Propietaria | 67,4 | 50,4 | Solo API |

La información proporcionada únicamente permite comparar contra el predecesor Kimi K2.6 y contra dos modelos propietarios de referencia. No se han facilitado datos de otros modelos abiertos de la misma categoría (por ejemplo, otras familias MoE de gran tamaño orientadas a código), por lo que la comparación con alternativas de pesos abiertos se considera no disponible.

## Limitaciones y advertencias

- Procedencia del repositorio: el modelo analizado es una publicación de terceros (`baerquants`), no el repositorio oficial de Moonshot AI. La model card parece copiada de la versión oficial y no se documentan el proceso de conversión ni las posibles diferencias respecto a los pesos originales. Verifique el repositorio oficial antes de usar el modelo en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, con fecha de creación y actualización idénticas (2026-09-22), lo que indica que no hay evidencia pública de uso ni de reproducción de los resultados.
- Benchmarks autodeclarados: los resultados de la tabla proceden de la model card del autor, incluyen benchmarks internos (Kimi Code Bench v2, Kimi Claw 24/7 Bench, MLS Bench Lite) y no han sido verificados de forma independiente.
- Idiomas soportados: no declarados en los metadatos. No hay garantía documentada de un rendimiento homogéneo fuera del inglés y el chino, pese a que el vocabulario de 160K tokens sugiere cobertura amplia.
- Riesgo de alucinación: como en cualquier modelo generativo, existe riesgo de inventar APIs, funciones o rutas de fichero inexistentes, especialmente en tareas de código de horizonte largo. En agentes es recomendable validar cada acción con tests o comprobaciones antes de aplicarla.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o comportamiento diferencial por idioma en la información disponible.
- Licencia: la licencia declarada es `modified-mit` (registrada como `license:other`). Se trata de una licencia MIT modificada, no de una MIT estándar, por lo que es imprescindible revisar el fichero LICENSE antes de un uso comercial o de redistribución. Los términos concretos de la modificación no se detallan en la información disponible.
- Requisitos de infraestructura: el despliegue exige hardware de centro de datos (del orden de 8 GPU de 80 GB o más). Esto descarta cualquier escenario de inferencia local en equipos de desarrollo.
- Dependencia de código personalizado: la etiqueta `custom_code` obliga a ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad adicional si el repositorio no es de confianza.
- Formato: la ausencia de cuantizaciones GGUF publicadas limita el uso fuera de entornos con vLLM, SGLang o `transformers`, y complica la experimentación en máquinas sin clúster.
- Caché KV en contexto máximo: aunque MLA reduce su tamaño, operar a 256K tokens de contexto en producción requiere dimensionar memoria adicional para la caché y puede degradar el throughput de forma notable.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/baerquants/Kimi-K2.7-Code
- Fichero de licencia del modelo original: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Organización de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Página del producto Kimi Code: https://www.kimi.com/code
- Sitio de Moonshot AI: https://www.moonshot.ai
- Perfil de X (Twitter) de Kimi: https://twitter.com/kimi_moonshot
- Servidor de Discord de Kimi: https://discord.gg/TYU2fdJykW
- Organización en ModelScope: https://modelscope.cn/organization/moonshotai

Nota sobre la búsqueda web: los resultados recuperados (mathepedia.de, mathematik.ch, brainie.ai, evulpo.com, learnattack.de) tratan sobre el teorema del ángulo central y el ángulo inscrito en geometría y no guardan relación alguna con el modelo. No se ha encontrado ninguna otra referencia técnica, paper, blog o demo relevante en la búsqueda.
