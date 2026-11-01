# jaromer/SC117-Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una edición "abliterated" (con la dirección de rechazo eliminada) del modelo Swift 1.5 de UkisAI, que a su vez es un derivado de Qwen3.8-Flash-Next optimizado para eficiencia de razonamiento. El autor de esta ficha, jaromer, ha publicado una versión cuantizada en formato GGUF para su uso con llama.cpp, aplicando una técnica de trasplante de tensores a nivel de byte sobre una cuantización GSQ (learned quantization) ya existente. El modelo conserva la arquitectura MoE de Qwen3.8-Flash-Next con 176.943.899.520 parámetros totales y está orientado a tareas de razonamiento, generación de código y red-teaming.

La relevancia de esta publicación radica en que demuestra un método de modificación de modelos cuantizados sin recuantizar: se sustituyen 144 tensores (los que escriben en el residual stream) en las 48 capas por pesos abliterated ya preparados, dejando intactos todos los valores y escalas GSQ. El tamaño del archivo varía menos de un 0,2% respecto al upstream y se preserva la eficiencia de razonamiento característica de Swift 1.5 (un 34,8% por debajo del modelo base en tokens de pensamiento). El resultado es un modelo multimodal image-text-to-text, con soporte para inglés y chino, distribuido bajo la Swift Open License 1.0.

El modelo se ofrece en cuatro niveles de cuantización (Q2_0, IQ2_XS, IQ3_XXS e IQ3_S), con tamaños que van de 61,9 GB a 77,8 GB, lo que lo sitúa en el rango de despliegues en servidor más que en GPU de consumo. Su orientación a red-teaming y su naturaleza "uncensored" lo hacen adecuado para investigación en seguridad y evaluación de alineamiento, no para aplicaciones de producción orientadas al usuario final sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), derivada de Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts (MoE) heredado de Qwen3.8-Flash-Next, con 176.943.899.520 parámetros totales y 48 capas según la model card. Sobre esa base, UkisAI aplicó un post-entrenamiento orientado a la eficiencia de razonamiento (anti-overthinking), que reduce el número de tokens de pensamiento en benchmarks de código en aproximadamente un 52% respecto al modelo de partida. La cuantización GSQ (learned quantization) con asignación de presupuesto RCO (budget allocation) forma parte del pipeline del upstream, no de esta ficha.

La contribución técnica de esta publicación es el trasplante de tensores a nivel de byte: se sustituyen 144 tensores (los que escriben en el residual stream) en las 48 capas por los correspondientes de una release abliterated ya existente, sin tocar ningún valor ni escala GSQ. Cada tensor se verifica con blake2b, el tamaño del archivo varía menos del 0,2% y se conserva la eficiencia de razonamiento del upstream. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento eficiente en tokens (reasoning-efficient) heredado de Swift 1.5.
- Generación de código y tareas de programación, con reducción de tokens de pensamiento en benchmarks de coding.
- Procesamiento multimodal image-text-to-text (pipeline_tag declarado), aunque no se detallan las capacidades de visión en la información disponible.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Modelo "uncensored"/abliterated: la dirección de rechazo ha sido eliminada, orientado a red-teaming y evaluación de seguridad.
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue vía llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes autónomos.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo, al tener la dirección de rechazo eliminada, permite generar respuestas que un modelo alineado rechazaría, lo que lo hace útil para construir conjuntos de datos adversarios y probar salvaguardas de otros sistemas.
- Investigación en seguridad de modelos: sirve para estudiar cómo afecta la abliteración a las capacidades de razonamiento y a la tasa de rechazo, comparando contra el upstream no abliterated con los mismos prompts.
- Generación de código en entornos controlados: su eficiencia en tokens de pensamiento (34,8% menos que el base) reduce el coste por consulta en pipelines de generación de código, siempre que se despliegue en infraestructura aislada.
- Análisis de documentos largos en inglés y chino: la etiqueta long-context sugiere ventanas amplias, adecuadas para resumir o extraer información de documentos extensos, aunque la longitud exacta no está disponible.
- Procesamiento de imágenes con texto asociado: al ser image-text-to-text, puede emplearse en tareas de descripción o extracción de información de imágenes combinadas con instrucciones textuales.
- Despliegue local con llama.cpp: los cuatro niveles de cuantización (desde Q2_0 de 61,9 GB) permiten ajustar el modelo a distintos presupuestos de memoria en servidores, usando llama.cpp como runtime.
- Experimentación con técnicas de cuantización: el trasplante de tensores verificado con blake2b y la preservación de las escalas GSQ lo convierten en un caso de estudio para investigar modificación de modelos cuantizados sin recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta el dato de eficiencia de razonamiento: el modelo conserva la reducción del 34,8% en tokens de pensamiento respecto al base, y el upstream Swift 1.5 usa aproximadamente un 52% menos de tokens de pensamiento en benchmarks de código.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 61,9 GB (Q2_0) y 77,8 GB (IQ3_S) solo para los pesos, más overhead de contexto y caché KV; se recomienda al menos 80 GB para el nivel IQ3_S con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para los niveles superiores de cuantización.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en ninguno de los niveles publicados; requeriría offloading a RAM del sistema, con la penalización de latencia correspondiente.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, tag llama-cpp); no se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| jaromer/SC117-Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176.943.899.520 | no disponible | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | swift-open-license-1.0 | Abliterated, GGUF, en/zh |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | no disponible en la informacion | no disponible | GSQ-RCO | swift-open-license-1.0 | Sin abliterar, misma base |
| ukisai/Swift-Qwen3.8-Flash-Next (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | Derivado de Qwen3.8-Flash-Next |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes; la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo implica que puede generar contenido dañino, ilegal o inseguro sin filtros; no debe exponerse a usuarios finales sin salvaguardas externas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; como todo modelo generativo, puede producir información incorrecta con apariencia de veracidad.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Licencia swift-open-license-1.0: es una licencia "other" con términos específicos; antes de cualquier uso comercial debe revisarse el texto completo en el enlace de licencia de la model card.
- Longitud de contexto no especificada: aunque se etiqueta como long-context, no se confirma el número exacto de tokens soportados.
- Tamaño muy elevado: los 61,9-77,8 GB de pesos impiden su despliegue en hardware de consumo y encarecen la inferencia.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- El trasplante de tensores, aunque verificado con blake2b, es una modificación artesanal del upstream; no hay evaluación independiente publicada de su impacto en calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaromer/SC117-Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (upstream): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base declarado: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- README en chino: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
