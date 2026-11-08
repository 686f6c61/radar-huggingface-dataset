# pfnet/plamo-3-translate-8b-W4A16

## Resumen

PLaMo 3 Translate 8B W4A16 es la variante cuantizada a INT4 del modelo de traducción PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Esta versión W4A16 aplica cuantización de pesos a 4 bits manteniendo activaciones en BF16, lo que reduce el consumo de memoria en GPU sin renunciar a la precisión de cómputo en la evaluación oficial.

El modelo está especializado en traducción entre 53 idiomas, con un enfoque particular en el par japonés-inglés y en la traducción multilingüe desde y hacia el japonés. Admite contexto adicional y glosarios como parte de la entrada, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

La relevancia de esta ficha radica en que combina una especialización fuerte en traducción con un formato de despliegue eficiente (INT4 con `compressed-tensors` y soporte para vLLM), lo que lo hace adecuado para entornos de producción con restricciones de VRAM. La licencia PLaMo Community permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial que deben revisarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, `custom_code`) |
| Parametros totales | 1.897.410.816 (según safetensors; el nombre comercial indica 8B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | W4A16 (INT4 en pesos, BF16 en activaciones); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (uso personal, académico y no comercial gratuito; condiciones específicas para uso comercial) |
| Formato de pesos | safetensors con `compressed-tensors` (INT4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, con código personalizado (`custom_code`) y pesos en formato `compressed-tensors` para la cuantización W4A16. El modelo base PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se entrena posteriormente con decenas de miles de millones de tokens de datos centrados en traducción. La longitud máxima de entrenamiento fue de 32.768 tokens considerando entrada y salida conjuntamente.

La cuantización W4A16 reduce los pesos a INT4 manteniendo las activaciones en BF16, lo que permite ejecutar el modelo con menor huella de VRAM. La model card indica que, para reproducir la evaluación oficial con vLLM, debe añadirse `--dtype bfloat16` al comando de lanzamiento. No se detalla en la información disponible si el entrenamiento incluyó etapas de RLHF o DPO, ni la composición exacta del dataset más allá de su orientación a traducción.

## Capacidades

- Traducción entre 53 idiomas, con especial énfasis en japonés-inglés y en traducción multilingüe desde y hacia el japonés.
- Uso de contexto circundante y glosarios como parte de la entrada para mejorar la coherencia terminológica.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada hasta el límite combinado de 32.768 tokens.
- Generación de texto como tarea base (`text-generation`), aunque el modelo está especializado en traducción.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica japonés-inglés: el modelo puede procesar secciones extensas en una sola pasada gracias al límite de 32.768 tokens combinados, manteniendo terminología consistente mediante glosarios.
- Localización de productos multilingües: con 53 idiomas soportados, permite cubrir mercados en Europa, Asia y Oriente Medio desde un único modelo, reduciendo la complejidad del pipeline.
- Traducción de atención al cliente: adecuado para conversaciones multi-turno donde el contexto previo se pasa como contexto adicional al modelo, mejorando la coherencia de la respuesta.
- Traducción jurídica o administrativa con glosario: la posibilidad de inyectar terminología específica lo hace útil en dominios donde la consistencia terminológica es crítica.
- Traducción de subtítulos y contenido audiovisual: el estilo llano o cortés en japonés permite adaptar el registro al tipo de contenido.
- Despliegue en infraestructura con VRAM limitada: la cuantización W4A16 y el soporte para vLLM permiten servir el modelo en GPUs con menos memoria que la versión BF16.
- Traducción de artículos académicos o prensa entre japonés y otras lenguas: el modelo ha sido evaluado en FLORES+ y WMT24++, lo que respalda su uso en dominios generales.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas frente a TranslateGemma y HY-MT2, con métricas agregadas (COMET-22 para japonés-inglés y chrF++ de FLORES+ para pares multilingües), pero no se proporcionan valores numéricos en la información disponible. La card afirma que incluso el modelo de 2B supera a los LLM especializados comparados en todas las métricas de la figura, pero no se aportan cifras concretas.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 5,7 GB, por lo que la inferencia en W4A16 requiere del orden de esa cifra más overhead de activaciones y caché KV.
- GPU recomendadas: NVIDIA Ampere o posterior para W4A16 con vLLM (según la model card del modelo base).
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 8-12 GB o más, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM (con `--dtype bfloat16`), transformers; existen variantes GGUF y MLX-4bit en repositorios separados para llama.cpp/Ollama y Apple Silicon respectivamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B W4A16 | 1.897.410.816 (según safetensors) | 32.768 (entrada + salida) | 53 | plamo-community-license | safetensors INT4, vLLM |
| PLaMo 3 Translate 8B (BF16) | mismo modelo base | 32.768 | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos TranslateGemma y HY-MT2 aparecen como referencias en las gráficas de la model card, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir degradación de calidad frente a BF16; la model card incluye tablas de cambios de precisión por cuantización, pero no se detallan numéricamente en la información disponible.
- El límite de 32.768 tokens es combinado de entrada y salida; pasajes más largos deben dividirse.
- El modelo está especializado en traducción; su uso para otras tareas de generación puede no alcanzar la calidad de modelos generalistas.
- La licencia PLaMo Community restringe el uso comercial: es gratuita para uso personal, académico y no comercial, pero el uso comercial requiere revisar los términos específicos.
- No se documentan en la información disponible sesgos específicos, tasas de alucinación ni evaluaciones de robustez.
- El soporte de estilos llano/cortés se limita al japonés según la información disponible.
- Requiere `custom_code`, lo que implica confiar en el código remoto del repositorio al cargar con transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
