# AMAImedia/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se presenta como el primer miembro de la serie K3.1 y como el modelo más capaz de la clase 3T de la compañía, con 2,8 billones de parámetros totales en una arquitectura Mixture-of-Experts (MoE) que activa 104B por token. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios, y su ventana de contexto alcanza el millón de tokens.

El modelo está diseñado para cargas de trabajo agénticas: razonamiento multi-paso, generación de código, creación 3D, investigación financiera y precisión factual. Su naturaleza multimodal nativa (pipeline `image-text-to-text`) le permite procesar imágenes junto a texto, lo que lo sitúa en la categoría de modelos frontera con capacidades de visión integradas.

La relevancia de esta ficha radica en que el repositorio de Hugging Face bajo el identificador `AMAImedia/Kimi-K3.1-Pro` es una réplica del modelo original de Moonshot AI, con 0 descargas y 0 likes en el momento de la consulta, un tamaño de repositorio de 1.561,4 GB y pesos en formato safetensors con cuantización de 8 bits mediante `compressed-tensors`. La licencia es propietaria (`kimi-k3.1-pro`), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parámetros totales | 2,8 billones (2.780.110.363.392 según safetensors) |
| Parámetros activos | 104B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8 bits (compressed-tensors); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (propietaria, `license: other`) |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

## Arquitectura y entrenamiento

Kimi K3.1 Pro emplea una arquitectura transformer con mezcla de expertos. Consta de 93 capas, de las cuales solo 1 es densa. La composición de capas de atención es híbrida: 69 capas usan KDA (Kimi Delta Attention) y 24 usan Gated DSA (Deep Sparse Attention), con una dimensión de atención de 7168 y 96 cabezas. La atención dispersa DSA emplea 32 cabezas de índice con dimensión 128 y un top-K de 2048, lo que reduce el coste computacional en contextos largos. La dimensión latente del MoE es 3584, con 896 expertos de dimensión oculta 3072 cada uno; se seleccionan 16 expertos por token más 2 expertos compartidos. El vocabulario es de 160K tokens.

El entrenamiento parte de Kimi K3 y aplica un post-entrenamiento mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, lo que según el autor mejora codificación, creación 3D, investigación financiera y precisión factual. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO de forma explícita. La innovación técnica destacable es la combinación de atención lineal KDA con atención dispersa DSA para sostener un contexto de un millón de tokens con un coste de atención subcuadrático.

## Capacidades

- Generación de texto y razonamiento multi-paso en contextos de hasta un millón de tokens.
- Generación y comprensión de código, con mejoras declaradas en tareas de programación.
- Capacidades matemáticas y de investigación financiera.
- Procesamiento de imagen y texto de forma nativa (pipeline `image-text-to-text`).
- Creación 3D, según la model card.
- Precisión factual mejorada respecto a Kimi K3.
- Capacidades agénticas: razonamiento multi-paso y ejecución de tareas encadenadas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no confirmado en la información disponible.

## Casos de uso

- Investigación financiera asistida: el modelo puede analizar informes extensos y series de datos dentro de su ventana de un millón de tokens, manteniendo coherencia entre documentos y reduciendo la pérdida de contexto en análisis multi-fuente.
- Generación de código en producción: su mejora declarada en codificación y su naturaleza agéntica permiten integrarlo en pipelines que requieran razonamiento sobre repositorios completos, aunque el despliegue exige infraestructura de gran escala.
- Creación 3D y modelado procedural: la model card cita mejoras en creación 3D, lo que lo hace adecuado para generar descripciones estructuradas o scripts de escenas a partir de instrucciones en lenguaje natural e imágenes de referencia.
- Análisis de documentos legales o contractuales: con contexto de un millón de tokens puede procesar expedientes completos y responder preguntas que requieran cruzar cláusulas dispersas.
- Asistentes multimodales: al aceptar imagen y texto, puede emplearse en tareas de descripción, extracción de información de capturas o soporte visual en atención al cliente.
- Agentes autónomos de investigación: su entrenamiento por refuerzo en dominios downstream y su razonamiento multi-paso lo orientan a tareas de planificación y ejecución con verificación intermedia.
- Evaluación de precisión factual en dominios regulados: la mejora declarada en factualidad lo hace candidato para tareas de verificación, siempre con supervisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parámetros totales, incluso en 8 bits los pesos ocupan aproximadamente 2,8 TB, por lo que la inferencia requiere agregación de memoria multi-nodo; no cabe en una sola GPU.
- GPU recomendadas: clústeres de H100 o A100 de 80 GB en configuraciones multi-nodo; no se dispone de cifras oficiales de VRAM mínima.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer por el tamaño del modelo.
- Opciones de despliegue: la librería indicada es `transformers` con `custom_code` y `compressed-tensors`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | kimi-k3.1-pro (propietaria) | Pesos abiertos en HF |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referencia de partida del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; todo modelo entrenado con datos web hereda sesgos que requieren evaluación propia.
- Riesgo de alucinación: presente en modelos generativos de esta clase; la model card declara mejoras en precisión factual, pero no elimina el riesgo en producción.
- Limitaciones de contexto o idioma: el contexto es de un millón de tokens, pero no se especifican los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la licencia `kimi-k3.1-pro` es propietaria (`license: other`); el uso comercial requiere revisar los términos del archivo LICENSE del repositorio original de Moonshot AI.
- El repositorio consultado (`AMAImedia/Kimi-K3.1-Pro`) es una réplica con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial `moonshotai/Kimi-K3.1-Pro`.
- El tamaño del repositorio (1.561,4 GB) y la cuantización en 8 bits implican requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- No se confirman capacidades de tool calling ni modo de pensamiento explícito, lo que debe validarse antes de diseñar agentes en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AMAImedia/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI: https://huggingface.co/moonshotai
- Modelo oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página corporativa: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
