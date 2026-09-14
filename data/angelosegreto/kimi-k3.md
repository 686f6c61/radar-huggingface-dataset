# ANGELOSEGRETO/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado con pesos abiertos, que según su model card constituye el modelo más capaz de Moonshot AI hasta la fecha. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con visión nativa y una ventana de contexto de 1 millón de tokens. La model card lo presenta como el primer modelo abierto de clase 3T.

La ficha que se analiza aquí corresponde al repositorio `ANGELOSEGRETO/Kimi-K3` en Hugging Face, una publicación de terceros (no del repositorio oficial `moonshotai`) que ocupa 1561 GB y que, por sus etiquetas (`compressed-tensors`, `8-bit`), contiene pesos en formato cuantizado a 8 bits. El número de parámetros verificado en los archivos safetensors es de 2.779.931.837.184, coherente con los 2,8T declarados.

Su relevancia radica en la combinación de tres factores poco frecuentes en el ecosistema abierto: escala de clase 3T con dispersión MoE agresiva (16 de 896 expertos activados por token), contexto de 1M tokens y multimodalidad nativa integrada en el mismo modelo. La model card afirma una mejora aproximada de 2,5× en eficiencia de escalado respecto a Kimi K2, gracias al marco Stable LatentMoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2.779.931.837.184 (~2,8T), verificado en safetensors |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8 bits (`compressed-tensors` según etiquetas del repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors, con `compressed-tensors`; requiere `custom_code` |
| Número de capas | 93 (1 capa densa) |
| Composición de capas de atención | 69 KDA + 24 Gated MLA |
| Dimensión oculta de atención | 7168 |
| Número de cabezas de atención | 96 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta MoE por experto | 3072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |
| Tamaño del repositorio | 1561,0 GB |
| Autor del repositorio | ANGELOSEGRETO (publicación de terceros) |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-09-13 (ambas) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE de 93 capas (una de ellas densa) que combina dos mecanismos de atención: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA (Multi-head Latent Attention con compuerta). La atención opera con una dimensión oculta de 7168 y 96 cabezas. El enrutamiento MoE sigue el marco Stable LatentMoE, con 896 expertos en total, dimensión latente de 3584 y dimensión oculta de 3072 por experto; se activan 16 expertos por token, lo que sitúa los parámetros activos en 104B. Según la model card, esta configuración aporta una mejora aproximada de 2,5× en eficiencia de escalado global frente a Kimi K2. Attention Residuals (AttnRes) aparece citado como componente arquitectónico del modelo, sin que la información disponible detalle su funcionamiento interno.

El modelo es multimodal nativo: procesa texto, imágenes y vídeo dentro del mismo modelo, y su `pipeline_tag` en Hugging Face es `image-text-to-text`. La model card declara explícitamente que los pesos completos se publican bajo la Kimi K3 License.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detallan innovaciones adicionales de decodificación (por ejemplo, decodificación especulativa) ni detalles del entrenamiento multimodal.

## Capacidades

- Generación de texto y razonamiento de propósito general, orientado explícitamente a "frontier intelligence" en tareas de razonamiento, trabajo de conocimiento y código.
- Comprensión y generación multimodal nativa: texto, imágenes y vídeo en el mismo modelo (pipeline `image-text-to-text`).
- Codificación de horizonte largo: la model card cita sesiones de ingeniería prolongadas, navegación de repositorios grandes, optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Uso agéntico con herramientas: orquestación de herramientas de terminal, según la model card. No se especifica en la información disponible el formato exacto de function calling ni si existe un esquema JSON documentado.
- Trabajo de conocimiento agéntico de extremo a extremo: investigación profunda con visualizaciones interactivas, widgets, paneles y diseño de movimiento y edición de vídeo.
- Contexto largo: ventana de 1.000.000 de tokens, lo que habilita tareas sobre repositorios, documentos o vídeos de gran extensión.
- Capacidades multilingües: no disponible en la información proporcionada (el repositorio no declara idiomas).
- Modo de razonamiento explícito ("thinking mode"): no disponible en la información proporcionada.

## Casos de uso

- Refactorización de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir un repositorio extenso en una sola ventana y proponer cambios coherentes entre módulos, algo inviable con ventanas de 128K sin segmentación agresiva.
- Agentes de terminal y automatización de DevOps: la model card describe orquestación de herramientas de terminal, lo que permite encadenar comandos, interpretar salidas y corregir errores en bucles multi-paso sobre infraestructura real.
- Optimización de kernels de GPU: dado su soporte declarado para este escenario, puede iterar sobre código CUDA/Triton, razonar sobre patrones de memoria y proponer variantes de kernel con validación empírica.
- Investigación profunda con generación de artefactos: producción de informes con visualizaciones interactivas, widgets y paneles, aprovechando la combinación de razonamiento, contexto largo y salida estructurada.
- Análisis de vídeo e imagen en flujos de trabajo técnicos: al ser multimodal nativo y aceptar 1M de tokens, resulta adecuado para revisar grabaciones largas, documentación escaneada o material de diseño junto con texto.
- Asistencia en diseño CAD y de circuitos: la model card menciona CAD y diseño de chips entre los escenarios objetivo, lo que lo sitúa como candidato para copilotos en pipelines de ingeniería con validación humana.
- Edición y diseño de movimiento para vídeo: la model card cita edición de vídeo y diseño de movimiento como capacidades de su trabajo de conocimiento agéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las etiquetas del repositorio incluyen `eval-results`, pero no se ha proporcionado ninguna tabla de métricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con modelos de referencia. La única referencia cuantitativa disponible es la mejora aproximada de 2,5× en eficiencia de escalado respecto a Kimi K2 declarada en la model card.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros verificado (2,78 billones) y no proceden de documentación oficial de despliegue.

- VRAM estimada solo para pesos: en BF16, aproximadamente 5,6 TB; en FP8/INT8, aproximadamente 2,8 TB; en INT4, aproximadamente 1,4 TB. Hay que añadir la memoria de la caché KV, cuyo tamaño con 1M de tokens no está cuantificado en la información disponible (las capas Gated MLA y KDA están diseñadas para comprimirla, pero no se aportan cifras).
- GPU recomendadas: despliegue multi-nodo con H200 (141 GB) o B200. Como referencia aritmética, 8×H200 ofrecen 1,13 TB de VRAM, insuficientes incluso en INT4, por lo que se requieren al menos 2 nodos de 8 GPU en INT4 y alrededor de 3 nodos en FP8.
- GPU A100/H100 de 80 GB: 8 unidades suman 640 GB; en INT4 harían falta unos 3 nodos (24 GPU) solo para pesos.
- GPU de consumo: no cabe. En INT4 serían necesarias del orden de 58 unidades de 24 GB (RTX 4090) solo para los pesos, sin overhead de activaciones ni caché KV.
- Opciones de despliegue: no disponible en la información proporcionada. La librería declarada es `transformers` con `custom_code`, lo que implica cargar código remoto. No hay confirmación en la información disponible sobre soporte de vLLM, SGLang, TGI, llama.cpp u Ollama para esta arquitectura (KDA + AttnRes + LatentMoE).
- Latencia y throughput: no disponibles. Como referencia estructural, al activar 104B parámetros por token el coste computacional por token se aproxima al de un modelo denso de ~100B, pero el ancho de banda de memoria necesario para recorrer 2,8T de parámetros entre nodos condiciona fuertemente el throughput real.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad de pesos | Rendimiento comparado |
|---|---|---|---|---|---|---|
| Kimi K3 (este repositorio) | ~2,8T | 104B | 1M tokens | Kimi K3 (`other`) | Repositorio de terceros, cuantizado a 8 bits, 0 descargas | No disponible |
| Kimi K2 | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | La model card afirma ~2,5× mejor eficiencia de escalado en K3 |
| Otras alternativas de la misma categoría (MoE de gran escala con pesos abiertos) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye especificaciones ni resultados de modelos competidores, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación citada por el autor es la mejora de eficiencia de escalado frente a Kimi K2.

## Limitaciones y advertencias

- Repositorio de terceros: el autor declarado en Hugging Face es ANGELOSEGRETO, no Moonshot AI. Conviene verificar la integridad de los pesos frente al repositorio oficial `moonshotai/Kimi-K3` antes de cualquier uso en producción.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de los datos, con fecha de creación y última actualización idénticas (2026-09-13). No hay historial de mantenimiento ni informes de terceros sobre su funcionamiento.
- Cuantización a 8 bits: las etiquetas del repositorio (`compressed-tensors`, `8-bit`) indican pesos cuantizados, lo que puede implicar diferencias de calidad respecto a los pesos originales. No se documenta qué técnica de cuantización se aplicó ni su impacto medido.
- Requiere `custom_code`: la carga del modelo implica ejecutar código remoto del repositorio (`trust_remote_code`), lo que constituye un riesgo de seguridad si no se audita previamente.
- Licencia restrictiva y no estándar: la licencia es `other` con nombre `kimi-k3`. No se detallan en la información disponible los términos exactos de uso comercial, redistribución o atribución, por lo que es obligatorio revisar el archivo LICENSE antes de cualquier explotación comercial.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano, lo que impide garantizar calidad fuera del inglés.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o equidad en la información disponible.
- Alucinación: no se han publicado tasas de alucinación ni resultados de evaluaciones de veracidad. En tareas agénticas con acceso a terminal, una alucinación puede traducirse en acciones destructivas, por lo que se recomienda aislamiento y supervisión humana.
- Coste de despliegue extremo: incluso en INT4 requiere del orden de 1,4 TB solo para pesos, lo que excluye cualquier uso en hardware de consumo y limita el despliegue a clústeres multi-nodo.
- Contexto de 1M tokens: aunque está soportado, no hay datos publicados sobre degradación de la calidad en función de la posición dentro de la ventana ni sobre el coste real de la caché KV a esa longitud.
- Ausencia de benchmarks: sin métricas publicadas en la información disponible, no es posible validar las afirmaciones de capacidad de la model card.

## Enlaces

- Repositorio analizado: https://huggingface.co/ANGELOSEGRETO/Kimi-K3
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Repositorio oficial del modelo (referenciado en la model card): https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat del producto: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai

Nota: los resultados de la búsqueda web proporcionados corresponden a un comparador de vuelos (Liligo) y no guardan relación con el modelo, por lo que no se incluyen.
