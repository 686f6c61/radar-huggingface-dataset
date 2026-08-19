# moonshotai/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de gran escala orientado a tareas de programación y uso agéntico, desarrollado por Moonshot AI como evolución de Kimi K2.6. Está diseñado específicamente para completar flujos de trabajo de ingeniería de software de largo alcance (long-horizon), mejorando la finalización de tareas de extremo a extremo en entornos reales de desarrollo, con una reducción aproximada del 30 % en el uso de tokens de razonamiento en comparación con su predecesor. Se trata de un modelo multimodal que acepta entradas de texto e imagen, y que opera siempre en modo de pensamiento (thinking mode), conservando el contenido de razonamiento completo a lo largo de conversaciones multi-turno.

Con una arquitectura de mezcla de expertos (MoE) de aproximadamente 1 billón de parámetros totales y 32 000 millones de parámetros activos por token, Kimi K2.7 Code ofrece una ventana de contexto de 256 000 tokens, lo que lo hace adecuado para tareas que requieren procesar repositorios completos, documentación extensa y conversaciones prolongadas con agentes. El modelo integra un codificador de visión propio (MoonViT) de 400 millones de parámetros, lo que le permite interpretar capturas de pantalla, diagramas y otras entradas visuales dentro de flujos de programación. Publicado bajo una licencia modificada MIT, el modelo está disponible en Hugging Face y ha recibido más de 630 000 descargas desde su lanzamiento en junio de 2026.

La relevancia de Kimi K2.7 Code radica en su enfoque agéntico: no solo genera código, sino que puede utilizar herramientas externas mediante el protocolo MCP (Model Context Protocol), ejecutar comandos, gestionar tareas de múltiples pasos y mantener un estado coherente a lo largo de interacciones largas. Esto lo posiciona como una alternativa de código abierto a modelos propietarios como GPT-5.5 o Claude Opus 4.8 en el ámbito del desarrollo asistido por agentes, con unos resultados competitivos en benchmarks internos y públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención de múltiples cabezas latentes (MLA) y activación SwiGLU |
| Parametros totales | 1 026 879 376 368 (≈1 billón) |
| Parametros activos | 32 000 millones (32B) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye la etiqueta compressed-tensors, lo que sugiere soporte de cuantización, pero no se especifican los formatos) |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (license: other, license_name: modified-mit) |
| Formato de pesos | safetensors (repositorio de 595,2 GB) |

Otros detalles de configuración: 61 capas (incluyendo 1 capa densa), 64 cabezas de atención, dimensión de atención 7168, dimensión oculta por experto 2048, 384 expertos con 8 seleccionados por token y 1 experto compartido, vocabulario de 160 000 tokens. El codificador de visión MoonViT tiene 400 millones de parámetros.

## Arquitectura y entrenamiento

Kimi K2.7 Code utiliza una arquitectura de mezcla de expertos (MoE) con atención de múltiples cabezas latentes (MLA), una técnica que reduce el uso de memoria en la caché de atención al proyectar las claves y valores en un espacio latente de menor dimensión. El modelo cuenta con 384 expertos, de los cuales se activan 8 por token, junto con un experto compartido, lo que permite mantener un coste computacional de 32 000 millones de parámetros activos a pesar de tener alrededor de 1 billón de parámetros totales. La activación SwiGLU y la capa densa adicional contribuyen a la capacidad de representación del modelo. El componente de visión se apoya en MoonViT, un codificador de visión propio de 400 millones de parámetros, que permite procesar imágenes junto con el texto.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni las técnicas de alineación (como RLHF o DPO) en la información disponible. La model card indica que el modelo se construye sobre Kimi K2.6, con mejoras sustanciales en tareas de codificación de largo alcance y una reducción del 30 % en el uso de tokens de razonamiento, lo que sugiere un ajuste fino orientado a eficiencia y a comportamientos agénticos. El modelo está diseñado para operar siempre en modo de pensamiento, generando cadenas de razonamiento internas antes de emitir respuestas finales, y es compatible con el protocolo MCP para la integración de herramientas externas.

## Capacidades

- Generación de código y razonamiento: produce código en múltiples lenguajes de programación, con capacidad de razonamiento complejo para resolver problemas de ingeniería de software.
- Uso agéntico: puede actuar como un agente autónomo que planifica, ejecuta y verifica tareas de múltiples pasos, manteniendo el contexto a lo largo de conversaciones largas.
- Tool calling y MCP: soporta el protocolo Model Context Protocol, lo que le permite invocar herramientas externas (intérpretes, comandos de shell, APIs, etc.) durante la ejecución de tareas.
- Entrada multimodal: acepta imágenes además de texto, lo que permite interpretar capturas de pantalla, diagramas de arquitectura, gráficos y otras representaciones visuales.
- Pensamiento visible (thinking mode): siempre opera en modo de razonamiento, generando cadenas de pensamiento que se conservan en las respuestas multi-turno.
- Multilingüe: no se ha confirmado oficialmente la lista de idiomas soportados, pero al estar entrenado sobre datos multilingües es probable que maneje varios idiomas principales.
- Eficiencia de tokens: reduce el uso de tokens de razonamiento en aproximadamente un 30 % respecto a Kimi K2.6, lo que se traduce en menor latencia y coste por tarea.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado (IDE): el modelo puede integrarse en plugins de VS Code o JetBrains para ofrecer autocompletado, explicaciones de código y refactorización guiada, aprovechando su ventana de 256 000 tokens para analizar proyectos completos.
- Agente de resolución de incidencias en repositorios: dado un issue de GitHub, Kimi K2.7 Code puede explorar el código fuente, identificar la causa raíz, proponer un parche y ejecutar las pruebas necesarias, gracias a su capacidad de razonamiento multi-paso y al uso de herramientas.
- Automatización de revisiones de código (code review): puede analizar pull requests, detectar errores potenciales, vulnerabilidades de seguridad y problemas de estilo, generando comentarios detallados y sugerencias de mejora.
- Generación de documentación técnica: a partir de un código fuente o una especificación, el modelo puede redactar documentación de API, guías de usuario y comentarios en línea, manteniendo coherencia con el contexto completo del proyecto.
- Desarrollo de aplicaciones con interfaz visual: gracias a su entrada multimodal, puede recibir capturas de pantalla de una interfaz de usuario y generar el código HTML/CSS o componentes de framework correspondientes, facilitando el prototipado rápido.
- Automatización de tareas de infraestructura y DevOps: el modelo puede interpretar logs, configuraciones y scripts, y ejecutar comandos de shell o herramientas de orquestación para diagnosticar y resolver problemas de despliegue.
- Asistente de investigación y análisis de código abierto: puede explorar repositorios grandes, extraer patrones de diseño, comparar implementaciones y resumir arquitecturas, útil para equipos que evalúan dependencias o migran sistemas.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks comparativos entre Kimi K2.6, Kimi K2.7 Code, GPT-5.5 y Claude Opus 4.8. Todos los modelos se evaluaron con el modo de pensamiento activado, temperatura 1,0 y top-p 0,95, con una ventana de contexto de 262 144 tokens (salvo diferencias específicas de cada sistema). Los resultados son los siguientes:

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

Kimi K2.7 Code mejora consistentemente a su predecesor K2.6 en todos los benchmarks, con avances especialmente notables en Kimi Code Bench v2 (+11,1 puntos) y MCP Mark Verified (+8,3 puntos). Sin embargo, queda por detrás de GPT-5.5 y Claude Opus 4.8 en la mayoría de las pruebas de codificación y agénticas, excepto en MCP Mark Verified, donde supera a Claude Opus 4.8 (81,1 frente a 76,4). Además, el modelo reduce el uso de tokens de razonamiento en aproximadamente un 30 % respecto a K2.6, lo que implica una mejora en eficiencia sin sacrificar rendimiento.

## Requisitos de hardware

- El modelo tiene aproximadamente 1 billón de parámetros totales, por lo que no es viable en GPU de consumo. Incluso con cuantización a 4 bits, los pesos ocuparían alrededor de 500 GB, requiriendo un clúster de GPUs.
- Para inferencia en FP16/BF16, se necesitarían al menos 2 TB de VRAM, lo que implica múltiples GPUs de alta gama (por ejemplo, 8 o más A100 de 80 GB, o 4 o más H200 de 141 GB).
- Con cuantización a 4 bits (si se publican versiones cuantizadas), se podría reducir a ~500 GB, permitiendo su ejecución en 7 u 8 GPUs de 80 GB (por ejemplo, A100 o H100).
- No se recomienda su uso en entornos con una sola GPU o GPUs de consumo (RTX 4090, etc.), ya que la memoria requerida supera con creces sus capacidades.
- Opciones de despliegue: vLLM (existe una receta oficial en recipes.vllm.ai), TGI (Text Generation Inference) y otros frameworks que soporten MoE y atención MLA. También se puede utilizar a través de la API de Moonshot AI o plataformas como OpenRouter.
- La latencia y el throughput dependen en gran medida del número de GPUs y de la cuantización. Con 32B parámetros activos, la inferencia es considerablemente más rápida que un modelo denso de 1T, pero sigue requiriendo infraestructura de servidor.

## Comparativa con modelos similares

La comparación más directa es con su predecesor Kimi K2.6, ya que comparten arquitectura y propósito. También se puede comparar con modelos propietarios de referencia en tareas agénticas de código, aunque estos no son de código abierto.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Kimi Code Bench v2 | MCP Atlas |
|---|---|---|---|---|---|---|
| Kimi K2.7 Code | ~1T | 32B | 256K | Modified MIT | 62,0 | 76,0 |
| Kimi K2.6 | ~1T | 32B | 256K | Modified MIT | 50,9 | 69,4 |
| GPT-5.5 | no disponible | no disponible | no disponible | Propietaria | 69,0 | 79,4 |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | Propietaria | 67,4 | 81,3 |

Kimi K2.7 Code supera claramente a K2.6 en todos los benchmarks, con una mejora de más de 11 puntos en Kimi Code Bench v2. Frente a los modelos propietarios, se sitúa en un nivel intermedio: por debajo en la mayoría de pruebas de codificación, pero competitivo en tareas agénticas como MCP Atlas y MCP Mark Verified. Su ventaja principal es la apertura de la licencia y la disponibilidad de pesos, lo que permite su despliegue en infraestructura propia, algo que no es posible con GPT-5.5 o Claude Opus 4.8.

## Limitaciones y advertencias

- El modelo es extremadamente grande (≈1 billón de parámetros), lo que limita su uso a organizaciones con infraestructura de GPUs de alta gama o acceso a servicios en la nube. No es adecuado para entornos de desarrollo individuales.
- No se han publicado detalles sobre los datos de entrenamiento, por lo que se desconocen posibles sesgos o limitaciones en idiomas y dominios específicos. La lista de idiomas soportados no está disponible.
- Aunque reduce el uso de tokens de razonamiento, el modo de pensamiento siempre activo puede generar respuestas más largas de lo necesario en tareas simples, lo que incrementa la latencia y el coste.
- Como cualquier modelo generativo, existe riesgo de alucinación, especialmente en tareas de código donde puede producir soluciones incorrectas o vulnerables. Se recomienda verificación humana en entornos de producción.
- La licencia es una versión modificada de MIT, por lo que es necesario revisar los términos exactos en el repositorio para confirmar las restricciones de uso comercial, atribución y redistribución.
- El modelo acepta entradas de imagen, pero su rendimiento en tareas de visión no se ha evaluado en benchmarks públicos; se desconoce su precisión en escenarios complejos de comprensión visual.
- No se han publicado versiones cuantizadas oficiales (GGUF, AWQ, etc.) en el momento de redactar esta ficha, aunque la etiqueta compressed-tensors sugiere que podrían estar en desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Página de recursos oficial: https://www.kimi.com/resources/kimi-k2-7-code
- Sitio de información del modelo: https://kimik2ai.com/k2.7/
- Receta de despliegue con vLLM: https://recipes.vllm.ai/moonshotai/Kimi-K2.7-Code
- OpenRouter (API y precios): https://openrouter.ai/moonshotai/kimi-k2.7-code
- Chat Kimi Code: https://www.kimi.com/code
- Homepage de Moonshot AI: https://www.moonshot.ai
- ModelScope: https://modelscope.cn/organization/moonshotai
