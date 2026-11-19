# peasantsmith/GLM-5.3-Flash-Maya-GGUF

## Resumen

GLM-5.3-Flash-Maya-GGUF es un conjunto de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, publicado por el usuario peasantsmith en el marco de Project Maya. El modelo base es un transformer de mezcla de expertos (MoE) de 321.000 millones de parámetros totales con aproximadamente 18.000 millones activos por token, desarrollado por Z.ai (zai-org). Esta ficha cubre específicamente la distribución cuantizada, no los pesos originales en FP8.

La aportación principal del repositorio es ofrecer cinco variantes (Maya-XS, Maya-S, Maya-S24, Maya-M y Maya-L) que reducen el peso del modelo desde los 156,3 GB de la variante más grande hasta los 73,4 GB de la más pequeña, manteniendo entre el 92,4 % y el 99,2 % de la precisión del modelo completo en tareas zero-shot (ARC, HellaSwag, WinoGrande y PIQA). Están diseñadas para ejecutarse con una estrategia de offloading por capas entre GPU, RAM y SSD, de modo que un equipo con 64 GB de RAM y una tarjeta de 24 GB puede ejecutar Maya-XS a 128K de contexto.

El interés actual del repositorio radica en que hace viable en hardware de consumo un MoE de 321.000 millones de parámetros con capacidades de visión, tool calling y decodificación especulativa mediante la capa NextN (MTP) incluida en las cinco variantes. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con atención KDA y MLA/DSA |
| Parámetros totales | 321 000 000 000 (modelo base GLM-5.3-Flash); 1 171 080 448 según safetensors del repo (corresponde a los tensores no cuantizados auxiliares) |
| Parámetros activos | Aproximadamente 18 000 000 000 por token |
| Longitud de contexto | 128K tokens (configuración de referencia con KV cache en int8 para Maya-XS) |
| Tipos de cuantización | IQ1_S, IQ2_XXS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, F16, F32 (mezcladas por tensor) |
| Idiomas soportados | No disponible (la model card menciona calibración en inglés, japonés y chino, pero no declara lista oficial de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (multiparte, de 2 a 4 shards por variante) más `mmproj` F16 para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 42 capas MoE y tres capas densas, atención híbrida que combina KDA (Kimi Delta Attention) con MLA/DSA, y una capa NextN (Multi-Token Prediction) que habilita decodificación especulativa en motores compatibles. Los pesos originales se distribuyen en FP8, y las cuantizaciones Maya se generan directamente desde esa release FP8, no desde una recuantización intermedia.

El proceso de cuantización sigue parcialmente la receta del IST Austria DAS Lab: se calcula una importance matrix por experto individual (no por capa) a partir de 128 secuencias de 2 048 tokens en la plantilla de chat de GLM, con trazas de razonamiento, código web (HTML/CSS/JS, three.js, WebGL), tool calls y chat multilingüe. Maya-XS usa una calibración ocho veces mayor (1 024 secuencias) con sesgo hacia tool calls, código, trazas agénticas y chat en inglés, japonés y chino. Los expertos enrutados se redondean con error-feedback de estilo GPTQ contra las estadísticas de entrada de cada experto, y los bits por capa se asignan según un escaneo de sensibilidad. Los tensores pequeños (router, normas, pesos de mezcla de streams) se mantienen en F32, y las proyecciones KDA pequeñas y el indexador DSA en Q8_0.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (bloques de razonamiento incluidos en la plantilla de chat).
- Generación de código en múltiples lenguajes, con calibración específica hacia código front-end (HTML/CSS/JS, three.js, canvas, WebGL).
- Tool calling y function calling, con calibración dirigida en Maya-M y Maya-L.
- Capacidades de visión mediante el proyector `mmproj-GLM-5.3-Flash-F16.gguf` (torre de visión y proyector en F16 extraídos de los pesos oficiales).
- Decodificación especulativa nativa gracias a la capa NextN (MTP) incluida en las cinco variantes.
- Capacidades multilingües (inglés, japonés y chino presentes en la calibración; lista oficial no disponible).
- Soporte de agentes y trazas agénticas (la calibración de Maya-XS incluye trazas de agente).
- Extracción de características (tag `feature-extraction` en el repositorio).

## Casos de uso

- Asistencia de código en local: Maya-M y Maya-L están calibradas hacia código front-end y tool calls, por lo que pueden integrarse en un IDE o pipeline de CI/CD para autocompletado, generación de tests y refactorización sin enviar código a un servicio externo.
- Agentes autónomos con tool calling: la capa NextN permite decodificación especulativa y el modelo soporta function calling, lo que lo hace adecuado para orquestadores de agentes que encadenan llamadas a APIs y ejecutan tareas multi-paso.
- Análisis de documentos largos: con 128K de contexto y KV cache en int8, Maya-XS puede procesar contratos, informes o bases de código extensas en un equipo de 64 GB de RAM y una GPU de 24 GB.
- Procesamiento de imágenes con texto: mediante el proyector `mmproj` F16, el modelo puede describir capturas, extraer texto de diagramas o responder preguntas sobre figuras en flujos de documentación técnica.
- Despliegue en estaciones de trabajo con VRAM limitada: Maya-S24 está optimizada para tarjetas de 24 GB (RTX 3090/4090), con hasta un 14 % más de velocidad de decodificación que Maya-S en ese hardware, lo que la hace apta para prototipado y demos internas.
- Generación de código web interactivo: la calibración incluye escenas three.js, animaciones canvas y WebGL, por lo que puede generar demos visuales y prototipos de interfaz directamente ejecutables.
- Chat multilingüe interno: la calibración cubre inglés, japonés y chino, lo que permite desplegar un asistente corporativo en esas lenguas sin depender de APIs externas.

## Benchmarks y rendimiento

Los datos disponibles son de retención de precisión frente al modelo completo en FP8, medidos en tareas zero-shot (ARC, HellaSwag, WinoGrande, PIQA). No se han publicado resultados absolutos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Variante | Tamaño | Precisión retenida vs. FP8 | Notas |
|---|---:|---:|---|
| Maya-XS | 73,4 GB | 92,4 % | Cabe en 64 GB de RAM + 1 GPU de 24 GB a 128K de contexto con KV cache int8 |
| Maya-S | 96,5 GB | 97,9 % | Expertos enrutados a ~2 bits (IQ2_XXS/IQ2_S), atención y expertos compartidos en Q6_K |
| Maya-S24 | 94,7 GB | 97,7 % | Hasta un 14 % más rápida en decodificación en tarjetas de 24 GB; atención y expertos compartidos en Q4_K |
| Maya-M | 116,0 GB | 97,9 % | Más cercana al modelo completo token a token; expertos de 2 a 3 bits; calibrada hacia tool calls y código front-end |
| Maya-L | 156,3 GB | 99,2 % | Expertos de 3 a 4 bits (IQ3_S/IQ4_XS), Q5_K en capas sensibles |

## Requisitos de hardware

- VRAM estimada: no es posible dar una cifra única porque el diseño depende de offloading por capas entre GPU, RAM y SSD. Las variantes van de 73,4 GB a 156,3 GB de peso total.
- Configuración mínima documentada: 64 GB de RAM y una GPU de 24 GB para Maya-XS a 128K de contexto con KV cache en int8.
- Configuración de referencia de las mediciones: dos GPUs con 30 GB de RAM en total (según la model card).
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) para Maya-S24; tarjetas con más VRAM reducen la dependencia de RAM y SSD. No se especifican A100 ni H100 en la información disponible.
- Cabe en GPU de consumo: sí, Maya-S24 y Maya-XS están diseñadas explícitamente para tarjetas de 24 GB.
- Opciones de despliegue: motores compatibles con GGUF y con decodificación especulativa basada en capa NextN (MTP). La model card no enumera motores concretos; llama.cpp y Ollama son compatibles con el formato, pero no se confirma en la información disponible el soporte de vLLM ni TGI para estas cuantizaciones.
- Latencia y throughput: no disponible, salvo la indicación cualitativa de que Maya-S24 es hasta un 14 % más rápida en decodificación que Maya-S en tarjetas de 24 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Maya-GGUF (este) | 321B totales / ~18B activos | 128K | MIT | GGUF multiparte | Cinco variantes de 73,4 a 156,3 GB; visión y MTP incluidas |
| zai-org/GLM-5.3-Flash (base) | 321B totales / ~18B activos | No disponible | No disponible | FP8 | Pesos oficiales de referencia; precisión completa |
| Otras cuantizaciones GGUF de GLM-5.3-Flash | 321B totales / ~18B activos | No disponible | No disponible | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de otros fabricantes con tamaño y arquitectura comparables en la documentación consultada.

## Limitaciones y advertencias

- Las cifras de retención de precisión (92,4 % a 99,2 %) son relativas al modelo FP8 en cuatro tareas zero-shot; no garantizan un comportamiento equivalente en razonamiento complejo, matemáticas o código de producción.
- Maya-XS pierde aproximadamente un 7,6 % de precisión frente al modelo completo y está pensada como opción de compromiso cuando no caben Maya-S o Maya-S24.
- El rendimiento depende fuertemente del hardware: la estrategia de offloading a RAM y SSD introduce latencia variable y difícil de predecir entre máquinas.
- La model card advierte de que cada máquina es distinta y que más memoria implica más velocidad; no hay cifras de latencia absoluta publicadas.
- No se declara una lista oficial de idiomas soportados; la presencia de inglés, japonés y chino en la calibración no implica calidad equivalente en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponible.
- La licencia MIT del repositorio de cuantización no exime de verificar la licencia del modelo base zai-org/GLM-5.3-Flash, que no se detalla en la información proporcionada.
- El tamaño del repositorio (819 GB) implica requisitos de almacenamiento considerables si se descargan todas las variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- IST Austria DAS Lab (receta de cuantización): https://huggingface.co/ISTA-DASLab
