# JakTheTrippr/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI, con 2,8 billones de parámetros totales (2.779.931.837.184 según los pesos en safetensors) y 104.000 millones de parámetros activados por token. Se presenta como el primer modelo abierto de clase 3T y está diseñado para inteligencia de frontera en programación de horizonte largo, trabajo de conocimiento y razonamiento. Introducen dos innovaciones arquitectónicas propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), sobre un esquema MoE de 896 expertos del que se activan 16 por token.

El modelo combina 69 capas con KDA y 24 capas con Gated MLA sobre 93 capas totales, con una ventana de contexto de 1 millón de tokens y capacidades nativas de visión que cubren texto, imagen y vídeo dentro del mismo modelo. Su propuesta de valor es doble: por un lado, sostener sesiones de ingeniería largas con supervisión humana mínima (navegación de repositorios grandes, orquestación de herramientas de terminal, optimización de kernels de GPU, CAD o diseño de chips); por otro, producir trabajo de conocimiento de extremo a extremo con visualizaciones interactivas, dashboards y edición de vídeo.

La relevancia inmediata es que Moonshot AI libera los pesos completos bajo la Kimi K3 License, lo que permite investigación, despliegue e innovación posterior sobre un modelo de frontera. El repositorio analizado aquí es, sin embargo, una réplica alojada por el usuario `JakTheTrippr` (0 descargas, 0 likes, creada el 19 de octubre de 2026), no el repositorio oficial de `moonshotai`; para producción conviene verificar contra la publicación original antes de descargar 1.561 GB de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 capas Gated MLA |
| Parametros totales | 2,8 T (2.779.931.837.184 según safetensors) |
| Parametros activos | 104 B (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Repositorio etiquetado como `8-bit` y `compressed-tensors`; el tamaño del repo (1.561 GB) implica una media de ~4,5 bits por parámetro (estimación a partir de tamaño y número de parámetros). No se detallan en la información disponible los formatos GGUF/AWQ/GPTQ publicados |
| Idiomas soportados | no disponible |
| Licencia | `other`, `license_name: kimi-k3` (Kimi K3 License) |
| Formato de pesos | safetensors, con compresión `compressed-tensors`; `custom_code` en transformers |
| Pipeline declarado | image-text-to-text |
| Capas totales | 93 (1 densa) |
| Dimensión oculta de atención | 7.168 |
| Cabezas de atención | 96 |
| Dimensión latente MoE | 3.584 |
| Dimensión oculta por experto | 3.072 |
| Número de expertos | 896 |
| Tamaño del repositorio | 1.561,0 GB |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE con dos mecanismos de atención conviviendo en profundidad: 69 de sus 93 capas usan Kimi Delta Attention (KDA), una atención de estado lineal recurrente orientada a eficiencia en contexto largo, y 24 capas usan Gated MLA, la atención latente multi-cabeza con compuertas que ya aparecía en la familia Kimi. La capa de alimentación es un MoE de tipo latente: los tokens se proyectan a una dimensión latente de 3.584, se enrutan hacia 16 de los 896 expertos (cada uno con dimensión oculta 3.072) y se combinan con Attention Residuals (AttnRes). El modelo declara además un marco "Stable LatentMoE" que incrementa la dispersión del MoE y que, según el autor, aporta una mejora de eficiencia de escalado de aproximadamente 2,5 veces respecto a Kimi K2.

La multimodalidad es nativa: el mismo modelo procesa texto, imágenes y vídeo, lo que habilita tareas como desarrollo de videojuegos con visión en el bucle, CAD o análisis de material visual dentro de la ventana de 1 millón de tokens. No se ha proporcionado información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo con verificación; el repositorio incluye la etiqueta `eval-results` y el autor enlaza un informe técnico completo (`k3_tech_report.pdf`) donde presumiblemente se detallan, pero ese contenido no forma parte de la información disponible.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de trabajo orientado a tareas de largo alcance temporal.
- Programación de horizonte largo: sesiones de ingeniería sostenidas con supervisión humana mínima, navegación de repositorios de gran tamaño y orquestación de herramientas de terminal.
- Tareas de sistemas: optimización de kernels de GPU, desarrollo de compiladores y otras labores de bajo nivel citadas explícitamente por el autor.
- Multimodalidad nativa de entrada: comprensión de imágenes y vídeo además de texto, en el mismo modelo (pipeline `image-text-to-text`).
- Trabajo de conocimiento agéntico de extremo a extremo: investigación profunda, generación de visualizaciones interactivas, widgets y dashboards.
- Diseño y edición: animación/motion design, edición de vídeo, CAD y diseño de chips asistido.
- Capacidad de agente multi-paso implícita en las tareas descritas (orquestación de herramientas, bucles de visión en el juego/desarrollo); no se detalla en la información disponible un esquema formal de tool calling ni su especificación de API.
- Capacidades multilingües: no disponible (el repositorio no declara lista de idiomas).

## Casos de uso

- Agentes de ingeniería de software sobre repositorios grandes: con 1 millón de tokens de contexto, el modelo puede cargar módulos completos, rastrear dependencias entre ficheros y ejecutar comandos de terminal en bucle para tareas de refactorización o migración que duran horas.
- Optimización de kernels y código de alto rendimiento: dado su rendimiento declarado en optimización de kernels de GPU y desarrollo de compiladores, encaja en equipos de sistemas que necesitan explorar variantes de implementación y validarlas contra tests.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y dashboards a partir de fuentes textuales y visuales, útil en consultoría, análisis financiero o inteligencia competitiva.
- Análisis de vídeo e imagen a escala: al aceptar vídeo de forma nativa junto a texto, permite indexar y resumir material audiovisual (por ejemplo, control de calidad en líneas de producción o revisión de contenido) sin pipeline multimodal separado.
- Asistencia en diseño de hardware y CAD: el modelo puede razonar sobre especificaciones, planos y restricciones físicas descritas en texto e imagen, como apoyo a equipos de diseño de chips o mecánica.
- Edición y motion design asistido: generación y revisión de guiones de animación, storyboards y descripciones de cortes a partir de material visual de referencia.
- Copiloto para documentación técnica: mantener consistencia entre código, especificaciones y manuales en un único contexto de hasta 1M tokens, reduciendo la fragmentación típica de pipelines RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results` y el autor enlaza un informe técnico, pero las cifras concretas (MMLU, HumanEval, GSM8K, SWE-bench, etc.) no figuran en los datos proporcionados, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, ~5,6 TB solo para pesos (2,78 T × 2 bytes); en FP8/8-bit, ~2,8 TB; el repositorio comprimido ocupa 1.561 GB (~4,5 bits por parámetro de media).
- Los 104 B de parámetros activos por token implican que el coste de cómputo por token se parece más al de un modelo de ~100 B, pero el conjunto de pesos debe residir en memoria, lo que obliga a agregación de memoria entre nodos.
- No cabe en ninguna GPU de consumo: ni RTX 4090 (24 GB) ni RTX 5090. Requiere despliegue multi-nodo con GPUs de centro de datos (H100/H200, B200, MI300X) y decenas o cientos de aceleradores según la precisión.
- Opciones de despliegue: el repo es de librería `transformers` con `custom_code` y `compressed-tensors`, lo que exige `trust_remote_code=True`. Para servido a escala cabría esperar motores tipo vLLM o SGLang con soporte de los kernels KDA, y TensorRT-LLM para máximo throughput; llama.cpp/Ollama no son viables a este tamaño.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo MoE con 104 B activos y contexto de 1M tokens tiene coste de atención y de comunicación entre nodos dominante, por lo que el throughput efectivo dependerá críticamente del paralelismo de expertos y del ancho de banda de interconexión (NVLink/InfiniBand).
- Para pruebas funcionales sin infraestructura propia, la vía realista es la API/chat alojado del autor (kimi.com) en lugar de la inferencia local.

## Comparativa con modelos similares

Los datos de la columna de Kimi K2 proceden de información pública sobre dicho modelo y no están incluidos en la documentación aportada; se incluyen únicamente como referencia del salto generacional que el autor declara.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104 B (16/896 expertos) | 1.000.000 tokens | Nativa (texto, imagen, vídeo) | Kimi K3 License (`other`) | Pesos abiertos en HF |
| Kimi K2 (referencia del autor) | ~1 T | ~32 B | no disponible en la información aportada | no disponible | no disponible | Pesos abiertos |
| Otros modelos abiertos de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El propio autor cuantifica la mejora de eficiencia de escalado respecto a Kimi K2 en aproximadamente 2,5 veces, atribuida al marco Stable LatentMoE. No se dispone de comparaciones verificables con otras familias (DeepSeek, Qwen, Llama) en la información proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: `JakTheTrippr/Kimi-K3` es una réplica con 0 descargas y 0 likes, creada y actualizada en el mismo instante. No hay garantía de integridad de los pesos ni de que coincidan con la publicación de `moonshotai`; verificar hashes y procedencia antes de usarlo.
- Licencia `other` con nombre "kimi-k3": no es una licencia OSI estándar. Las condiciones de uso comercial, redistribución y despliegue en producción deben revisarse en el fichero LICENSE del repositorio oficial; no se detallan en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; en tareas de investigación profunda y generación de dashboards el riesgo de datos inventados es relevante y requiere verificación externa.
- Contexto muy largo: con 1M tokens es esperable degradación del rendimiento en el centro del contexto (efecto "lost in the middle"); no hay datos publicados que cuantifiquen esta pérdida para K3.
- Idiomas: no se declara lista de idiomas soportados ni cobertura por idioma; el castellano no está verificado explícitamente.
- Sesgos: no disponibles. No hay información sobre composición del dataset ni sobre mitigaciones aplicadas, lo que impide evaluar sesgos demográficos, culturales o lingüísticos.
- Coste de despliegue prohibitivo: 1,5-5,6 TB de pesos según precisión implican infraestructura multi-nodo; el modelo no es viable en entornos de un solo servidor convencional.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que introduce riesgo de ejecución de código arbitrario del repositorio; auditar antes en entornos sensibles.
- Fecha de creación futura (2026-10-19) y ausencia de histórico: no hay señales de mantenimiento, issues ni actualizaciones que permitan evaluar soporte a largo plazo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/JakTheTrippr/Kimi-K3
- Organización oficial en HuggingFace: https://huggingface.co/moonshotai
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub del proyecto: https://github.com/MoonshotAI/Kimi-K3
- Fichero de licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Página del producto / chat: https://www.kimi.com
- Web corporativa de Moonshot AI: https://www.moonshot.ai
- Twitter/X oficial: https://twitter.com/kimi_moonshot
- Discord oficial: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces anteriores proceden de la model card del autor.
