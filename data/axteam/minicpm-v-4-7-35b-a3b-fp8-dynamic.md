# axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic

## Resumen

`axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic` es una cuantización en FP8 del modelo multimodal `openbmb/MiniCPM-V-4.7-35B-A3B`, publicada por el usuario axteam (no por OpenBMB) y pensada específicamente para servicio con vLLM. El modelo base es el primer miembro de la familia MiniCPM-V con arquitectura de mezcla de expertos (MoE): 35.212.875.824 parámetros totales con aproximadamente 3 B activos por token (sufijo A3B), torre de visión y pipeline `image-text-to-text` para comprensión de imagen única, multiimagen y vídeo.

El checkpoint aplica cuantización post-entrenamiento W8A8 sin calibración: pesos FP8 E4M3 con escala por canal y activaciones FP8 dinámicas por token, almacenados en el formato `FP8_DYNAMIC` de compressed-tensors. Solo se cuantizan las proyecciones de atención y MLP del backbone del modelo de lenguaje; la torre de visión, el merger visión-texto, los embeddings, la cabeza LM y todas las RMSNorm permanecen en BF16. El resultado ocupa unos 34,3 GB en disco (37 GB de repositorio), frente a los pesos BF16 originales.

Su relevancia práctica es doble: por un lado, permite servir un multimodal de 35 B con activación de 3 B en hardware Hopper o Ada con la receta estándar de vLLM; por otro, el modelo base que cuantiza se presentó públicamente como el primer MoE multimodal open source orientado a ejecución en dispositivo, con cifras de memoria del orden de 3 GB en la familia (no en este checkpoint FP8). Todo lo relativo a contexto, idiomas y benchmarks de este repositorio concreto no está documentado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con torre de visión; la model card indica backbone Qwen3.5-MoE |
| Parametros totales | 35.212.875.824 (35,2 B) |
| Parametros activos | Aproximadamente 3 B (sufijo A3B; no se publica el desglose por experto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8: pesos FP8 per-channel, activaciones FP8 dinámicas per-token, esquema `FP8_DYNAMIC` de compressed-tensors, sin calibración (data-free) |
| Idiomas soportados | no disponible (la validación de calidad se hizo en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con transformers y vLLM) |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Relacion con el base | quantized (derivado cuantizado, sin reentrenamiento) |
| Tamano en disco | ~34,3 GB (repositorio de 37,0 GB) |
| Pipeline | image-text-to-text |
| Componentes mantenidos en BF16 | Torre de visión, merger visión-texto, embeddings de tokens, LM head y todas las RMSNorm |

## Arquitectura y entrenamiento

El modelo sigue un diseño multimodal compuesto por una torre de visión y un backbone de lenguaje con mezcla de expertos, tal como describe la model card del checkpoint cuantizado (que identifica el backbone como Qwen3.5-MoE). El pipeline es `image-text-to-text`: las imágenes se codifican con la torre de visión, se proyectan mediante un merger visión-texto y se inyectan como tokens en el modelo de lenguaje, que genera la respuesta. El repositorio es una conversión de pesos, no un entrenamiento nuevo: la tokenización y el `chat_template` son idénticos a los del modelo original.

La innovación técnica de este checkpoint es la política de cuantización: cuantización post-entrenamiento (PTQ) sin datos de calibración, con pesos FP8 E4M3 escalados por canal y activaciones cuantizadas dinámicamente por token, aplicada exclusivamente a las proyecciones de atención y MLP del backbone de lenguaje. Los módulos sensibles a la precisión (visión, merger, embeddings, LM head y normalizaciones) se conservan en BF16, lo que limita la degradación pero también el ahorro de memoria en esas partes. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes (pipeline `image-text-to-text`).
- Comprensión de imagen única y multiimagen, según las capacidades declaradas de la familia MiniCPM-V 4.7.
- Comprensión de vídeo, según las capacidades declaradas de la familia MiniCPM-V 4.7.
- Procesamiento de texto e imágenes en una misma conversación multi-turno (`conversational`).
- Servicio de alto rendimiento con vLLM mediante el formato `FP8_DYNAMIC` de compressed-tensors.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con la librería transformers.
- Modo Instruct citado en la comparativa pública de OpenBMB; no se detalla su funcionamiento en la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación del repositorio.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación del repositorio.
- Idiomas: no se publica lista oficial; la validación de la cuantización se realizó en inglés y coreano.

## Casos de uso

- Servicio de VQA en producción con vLLM: el checkpoint está diseñado para `vllm serve`, de modo que se puede desplegar un endpoint de preguntas sobre imágenes con pesos de 34,3 GB y activación de aproximadamente 3 B por token, lo que reduce el coste de cómputo por petición frente a un modelo denso del mismo tamaño.
- Análisis de múltiples imágenes en una sola consulta: comparación de productos, verificación de estados de envío o inspección visual de lotes, aprovechando la capacidad multiimagen de la familia; la ventana de contexto aplicable no está publicada.
- Comprensión de vídeo para resumen y moderación: generación de descripciones o extracción de eventos en grabaciones, una de las capacidades declaradas del modelo base.
- Digitalización de documentos y formularios: extracción de campos a partir de capturas o escaneos en un pipeline de back office, sustituyendo al modelo BF16 cuando el objetivo es reducir el coste por GPU.
- Evaluación comparativa interna de modelos multimodales: usar esta variante FP8 como referencia de coste reducido frente al BF16 para medir la pérdida de calidad en las tareas propias antes de adoptar la cuantización en producción.
- Asistencia a accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual, integrada en una API interna servida con vLLM.
- Extracción de información en atención al cliente: procesar capturas enviadas por usuarios (errores, recibos, productos dañados) y devolver un resumen estructurado al sistema de ticketing.
- Nota importante: el mensaje de despliegue en dispositivo de la familia MiniCPM-V 4.7 (del orden de 3 GB de memoria) corresponde a otras variantes del modelo base, no a este checkpoint FP8 de 34,3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la cuantización se comprobó frente al original BF16 mediante perplejidad y acuerdo top-1 en inglés y coreano, sin publicar valores numéricos. La documentación de OpenBMB citada en la búsqueda afirma una puntuación global superior a Qwen3.6 35B-A3B en modo Instruct con menor tiempo de inferencia, pero no se aportan cifras en la información disponible, por lo que no se reproducen aquí.

| Benchmark | Este modelo (FP8) | Base BF16 | Notas |
|---|---|---|---|
| MMLU | no disponible | no disponible | Sin datos publicados |
| HumanEval | no disponible | no disponible | Sin datos publicados |
| GSM8K | no disponible | no disponible | Sin datos publicados |
| Perplejidad (EN/KO) | Sin valor numérico publicado | Referencia | La model card indica comprobación, sin cifras |
| Acuerdo top-1 (EN/KO) | Sin valor numérico publicado | Referencia | La model card indica comprobación, sin cifras |

## Requisitos de hardware

- VRAM estimada para inferencia: por encima de 34,3 GB solo para pesos; hay que sumar caché KV, buffers de activación y la torre de visión en BF16. Como orientación, un despliegue realista necesita del orden de 40 GB o más de memoria de GPU (estimación derivada del tamaño en disco, no publicada por el autor).
- GPU recomendadas: H100 80 GB o H200 para una sola GPU; A100 80 GB si el runtime dispone de kernels FP8 adecuados; L40S 48 GB en configuración ajustada.
- No cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) en una sola unidad; requeriría paralelismo tensorial con al menos dos GPUs, con el coste de comunicación asociado.
- Los kernels FP8 nativos de vLLM requieren GPUs con capacidad de cálculo 8.9 o superior (Ada Lovelace y Hopper); en arquitecturas anteriores el rendimiento no está garantizado.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic`); también es cargable con transformers y compressed-tensors. No se documenta soporte para llama.cpp, Ollama ni TGI con este formato `FP8_DYNAMIC`.
- Latencia y throughput: no disponibles. Cualitativamente, los aproximadamente 3 B de parámetros activos reducen el cómputo por token frente a un modelo denso de 35 B, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic | 35,2 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors FP8 (compressed-tensors) | HuggingFace, 0 descargas |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35,2 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors BF16 | HuggingFace, oficial |
| openbmb/MiniCPM-V-4.7-35B-A3B-FP8 | 35,2 B totales, ~3 B activos | no disponible | Apache-2.0 | safetensors FP8 | HuggingFace, oficial |
| Qwen3.6 35B-A3B | 35 B totales, ~3 B activos (por nombre) | no disponible | no disponible | no disponible | Referencia citada por OpenBMB en su comparativa |

La diferencia práctica entre este repositorio y el FP8 oficial de OpenBMB no se puede evaluar con la información disponible: no se publican ni el esquema exacto del oficial ni métricas comparables. Frente al base BF16, la ventaja es el menor tamaño en disco y el soporte de kernels FP8 en vLLM; el coste es una pérdida de calidad no cuantificada públicamente.

## Limitaciones y advertencias

- Cuantización sin calibración: la degradación solo se ha comprobado con perplejidad y acuerdo top-1, no con benchmarks de tareas (OCR, VQA, vídeo). El impacto real en tareas concretas es desconocido.
- La torre de visión, el merger, los embeddings, la LM head y las normalizaciones siguen en BF16: la reducción de memoria es menor de lo que sugiere el tamaño total y el cuello de botella de VRAM en visión persiste.
- Riesgo de alucinación inherente a los modelos multimodales, especialmente en lectura de texto en imágenes (OCR), tablas densas y vídeos largos; no hay datos publicados de fidelidad para este checkpoint.
- Idiomas: no se publica lista oficial de idiomas soportados y la validación se limitó a inglés y coreano; el comportamiento en castellano no está verificado en la información disponible.
- Ventana de contexto no documentada: no se puede planificar el tamaño de lote, la caché KV ni la longitud de vídeo asumiendo una cifra concreta.
- Repositorio de terceros: publicado por el usuario axteam, no por OpenBMB. Tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- Requisito de hardware estricto: FP8 nativo implica Ada Lovelace o Hopper; en GPUs Ampere o anteriores el despliegue puede fallar o degradar el rendimiento.
- No apto para despliegue en dispositivo pese al mensaje de la familia: este checkpoint ocupa 34,3 GB, muy lejos de las cifras de memoria asociadas a las variantes on-device del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de copyright de OpenBMB como titulares de los pesos y el tokenizador originales.
- El formato `FP8_DYNAMIC` de compressed-tensors limita la portabilidad a runtimes que lo soporten; no se documenta compatibilidad con llama.cpp u Ollama.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-FP8-dynamic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Cuantización FP8 oficial de OpenBMB: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-FP8
- Nota de prensa de ModelBest y OpenBMB sobre MiniCPM-V 4.7: https://www.prnewswire.com/news-releases/modelbest-and-openbmb-launch-minicpm-v-4-7--bringing-a-35b-multimodal-moe-model-to-phones-and-tablets-with-about-3-gb-of-memory-302909881.html
- Cobertura en AI Weekly: https://aiweekly.co/alerts/openbmb-releases-minicpm-v-47-series-first-moe-model
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/minicpm-v-4-7-35b-a3b/
