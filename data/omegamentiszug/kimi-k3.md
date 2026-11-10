# omegamentiszug/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado como pesos abiertos por Moonshot AI. Con 2,8 billones de parámetros totales (104 000 millones activos por token) y una ventana de contexto de un millón de tokens, se presenta como el primer modelo abierto de la clase de 3 billones de parámetros. Su arquitectura combina Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e incorpora visión nativa, lo que le permite procesar texto, imágenes y vídeo dentro del mismo modelo.

El modelo está orientado a tareas de horizonte largo: sesiones de ingeniería de software prolongadas, navegación de repositorios extensos, orquestación de herramientas de terminal y trabajo de conocimiento agéntico de extremo a extremo (investigación profunda, generación de visualizaciones interactivas, diseño de movimiento y edición de vídeo). La sparsity MoE se amplía mediante el marco Stable LatentMoE, que activa 16 de 896 expertos por token y, según el autor, aporta una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2.

La relevancia actual del modelo radica en su combinación de escala frontera, contexto de un millón de tokens y multimodalidad nativa bajo una licencia propia (Kimi K3 License) que permite su uso, despliegue e investigación. No obstante, el repositorio analizado es una réplica publicada por un tercero (omegamentiszug) y no la cuenta oficial de Moonshot AI, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2.779.931.837.184 (2,8 billones) |
| Parámetros activos | 104 000 millones (16 de 896 expertos por token) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantización | 8-bit (según tags del repositorio); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors, compressed-tensors |
| Capas | 93 (1 densa) |
| Composición de capas de atención | 69 KDA + 24 Gated MLA |
| Dimensión oculta de atención | 7168 |
| Cabezas de atención | 96 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta MoE por experto | 3072 |
| Número de expertos | 896 |
| Tamaño del repositorio | 1561,0 GB |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo MoE con 93 capas, de las cuales solo una es densa. La composición de capas de atención combina 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention con compuerta). La dimensión oculta de atención es de 7168 y el modelo emplea 96 cabezas de atención. La parte MoE utiliza una dimensión latente de 3584 y una dimensión oculta por experto de 3072, con 896 expertos en total y 16 seleccionados por token, lo que resulta en 104 000 millones de parámetros activos por paso de inferencia.

El marco Stable LatentMoE es la innovación de escalado que permite aumentar la sparsity del modelo; según la model card, aporta aproximadamente 2,5 veces más eficiencia de escalado que Kimi K2. La arquitectura incorpora además Attention Residuals (AttnRes), que no se detalla en la información disponible. El modelo es multimodal nativo: procesa texto, imágenes y vídeo dentro de la misma arquitectura, y su pipeline en Hugging Face es `image-text-to-text`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que estos datos no aparecen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento de horizonte largo, orientado a inteligencia frontera en codificación, trabajo de conocimiento y razonamiento.
- Codificación de horizonte largo: sesiones de ingeniería prolongadas con supervisión humana mínima, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Capacidades multimodales nativas: comprensión de texto, imágenes y vídeo en el mismo modelo.
- Procesamiento de contexto de un millón de tokens, adecuado para documentos, repositorios y conversaciones de gran extensión.
- Trabajo de conocimiento agéntico: investigación profunda con visualizaciones interactivas, widgets y dashboards, diseño de movimiento y edición de vídeo.
- Soporte de tool calling y function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica del modelo y la orquestación de herramientas de terminal sugieren soporte para uso de herramientas.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Ingeniería de software de horizonte largo: el modelo puede mantener sesiones de desarrollo prolongadas con supervisión humana mínima, navegar repositorios masivos y orquestar herramientas de terminal, lo que lo hace adecuado para tareas de refactorización, corrección de errores y desarrollo de funcionalidades en bases de código grandes.
- Optimización de kernels de GPU y desarrollo de compiladores: la model card cita explícitamente la optimización de kernels de GPU y el desarrollo de compiladores como tareas que el modelo puede sostener, aprovechando su capacidad de razonamiento y su contexto de un millón de tokens para analizar código de bajo nivel.
- Desarrollo de videojuegos con visión en el bucle: al ser multimodal nativo, puede integrar capturas de pantalla o vídeo del juego en el proceso de desarrollo, lo que resulta útil para depurar comportamiento visual, ajustar interfaces o generar lógica de juego a partir de referencias visuales.
- Diseño asistido por ordenador (CAD) y diseño de chips: la model card menciona CAD y diseño de chips como dominios de aplicación, donde el modelo puede analizar especificaciones, generar código de descripción de hardware o asistir en tareas de diseño iterativo.
- Investigación profunda con visualizaciones interactivas: el modelo puede producir informes de investigación con widgets, dashboards y visualizaciones interactivas, adecuado para equipos que necesitan sintetizar información extensa y presentarla de forma explorable.
- Edición de vídeo y diseño de movimiento: gracias a su comprensión nativa de vídeo, puede asistir en tareas de edición y diseño de movimiento, analizando secuencias y generando descripciones o instrucciones para herramientas de producción.
- Análisis de documentos extensos y conversaciones multi-turno: con un millón de tokens de contexto, puede procesar corpus documentales completos o mantener conversaciones prolongadas sin perder el hilo, útil en atención al cliente especializada o análisis legal y financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2,8 billones de parámetros totales y 104 000 millones activos, el modelo requiere infraestructura de múltiples GPU de alta gama; el repositorio ocupa 1561,0 GB y los pesos están en formato de 8 bits, lo que da una idea del orden de magnitud del almacenamiento necesario.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, se necesitarían clústeres de GPU de centro de datos (tipo A100, H100 o superiores) en configuración multi-nodo; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible; por el volumen de parámetros y el tamaño del repositorio, no es viable en GPU de consumo convencionales.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y `compressed-tensors`. No se detallan opciones como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 billones | 104 000 millones | 1 000 000 tokens | Kimi K3 License | Pesos abiertos en Hugging Face (réplica de tercero) |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Kimi K2 de forma cualitativa: la model card afirma que Kimi K3 logra una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2 gracias a Stable LatentMoE. No se dispone de datos de parámetros, contexto, rendimiento ni licencia de Kimi K2 en la información consultada, ni de otros modelos comparables de la clase de 3 billones de parámetros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no se documenta en la información disponible; como modelo generativo de gran escala, es esperable que pueda producir contenido incorrecto, pero no se aportan datos concretos.
- Limitaciones de contexto o idioma: el contexto es de un millón de tokens, pero no se detallan limitaciones específicas de idioma ni la lista de idiomas soportados.
- Restricciones de licencia: la licencia es la Kimi K3 License (license: other), una licencia propia cuyo texto completo no se incluye en la información disponible; es necesario consultar el archivo LICENSE del repositorio oficial antes de cualquier uso comercial.
- Repositorio de terceros: el repositorio analizado (omegamentiszug/Kimi-K3) no pertenece a la cuenta oficial de Moonshot AI, tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10). Se recomienda verificar la procedencia de los pesos antes de usarlos en producción.
- Formato de pesos: los pesos están en 8 bits y en formato compressed-tensors, lo que puede limitar la compatibilidad con herramientas de inferencia que no soporten dicho formato.
- Requisitos de infraestructura: el tamaño del repositorio (1561,0 GB) y el número de parámetros implican requisitos de hardware muy elevados, no aptos para entornos de consumo.
- Datos de entrenamiento y evaluación no disponibles: no se especifican tokens de entrenamiento, composición del dataset, técnicas de alineación ni resultados de benchmarks, lo que dificulta una evaluación independiente del rendimiento real.

## Enlaces

- Repositorio de Hugging Face (réplica de tercero): https://huggingface.co/omegamentiszug/Kimi-K3
- Cuenta oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Repositorio oficial de Kimi K3 en Hugging Face: https://huggingface.co/moonshotai/Kimi-K3
- Licencia oficial: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Página principal de Moonshot AI: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
