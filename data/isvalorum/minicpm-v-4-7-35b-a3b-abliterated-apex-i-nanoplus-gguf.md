# IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-NanoPlus-GGUF

## Resumen

MiniCPM-V 4.7 35B A3B Abliterated APEX-I NanoPlus es una cuantización GGUF del modelo multimodal MiniCPM-V 4.7 35B A3B, publicada por IsValorum bajo la serie "APEX Quantization". El modelo original lo desarrolla OpenBMB, y esta variante parte de la versión "abliterated" de distributedcognition, en la que se editaron 74 tensores para eliminar los mecanismos de rechazo. El resultado es un modelo image-text-to-text sin censura, pensado para inferencia local con llama.cpp y compatible con endpoints.

La arquitectura combina atención lineal/SSM con atención completa en una configuración MoE: 40 capas (30 SSM + 10 de atención completa), 256 expertos enrutados más uno compartido, con 8 activos por token. El modelo tiene 34.659.889.792 parámetros totales (~34,7B) y una ventana de contexto de 262.144 tokens. El repositorio incluye el GGUF principal de 12,55 GB, un proyector visual aparte en Q8_0 y un borrador DSpark para decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización agresiva (tipos IQ2/IQ3 en los expertos enrutados) que reduce un modelo de ~35B a poco más de 12 GB manteniendo los tensores críticos en F32; por otro, advierte de que se trata de un modelo abliterated, con las implicaciones éticas y de licencia que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas de atención lineal/SSM + 10 capas de atención completa, con MoE (256 expertos enrutados + 1 compartido, 8 activos) |
| Parametros totales | 34.659.889.792 (~34,7B) |
| Parametros activos | No disponible (8 expertos activos de 256 enrutados; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF mixta: Q2–Q8 en pesos, F32 en tensores SSM y RMSNorm; tipos concretos IQ2_XXS, IQ2_S, IQ3_XXS, Q3_K, Q4_0, Q4_K, Q6_K, Q8_0, F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual separado en mmproj-Q8_0.gguf; borrador DSpark en GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo base es `openbmb/MiniCPM-V-4.7-35B-A3B`, una arquitectura híbrida que intercala 30 capas de atención lineal/SSM con 10 capas de atención completa (en las capas 3, 7, ..., 39). La dimensión oculta es 2048 y el componente MoE cuenta con 256 expertos enrutados más un experto compartido, de los cuales se activan 8 por token. La torre visual tiene 27 capas y se distribuye como proyector independiente en Q8_0.

Sobre el entrenamiento original no se aporta información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de modificación: distributedcognition editó 74 tensores para producir la variante abliterated (sin aplicar Heretic), y posteriormente IsValorum generó la cuantización APEX-I NanoPlus usando una matriz imatrix pública de mradermacher (319 x 512), que cubre 400 de los 402 tensores de texto cuantizados. Como innovación técnica destacable, la cuantización aplica "recurrent shielding": los tensores `ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d` y todos los RMSNorm se mantienen en F32 para preservar la estabilidad del componente SSM. El GGUF principal contiene 733 tensores y no incluye tensores MTP; la decodificación especulativa se delega a un borrador DSpark separado.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Comprensión de imágenes (image-text-to-text) mediante el proyector visual Q8_0; la torre visual tiene 27 capas.
- Razonamiento y matemáticas: capacidades heredadas del modelo base MiniCPM-V 4.7, aunque no se documentan resultados concretos.
- Generación de código: no se documenta de forma explícita en la información disponible.
- Tool calling / function calling: no se documenta en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta en la información disponible.
- Multilingüe limitado a inglés y chino (en, zh).
- Modo "uncensored": la variante abliterated elimina los rechazos del modelo original.
- Decodificación especulativa opcional mediante el borrador DSpark Q4_K_M/Q6_K.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Asistente visual local sin conexión: el GGUF de 12,55 GB más el proyector de 733 MB permiten desplegar un modelo multimodal en una estación de trabajo con GPU de consumo, procesando imágenes y texto sin enviar datos a la nube.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens permite ingerir manuales, informes o expedientes completos con figuras intercaladas y mantener el contexto a lo largo de la conversación.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas frente al modelo original.
- Procesamiento de texto en chino e inglés: útil en flujos bilingües de atención al cliente o traducción asistida donde solo se requieren esos dos idiomas.
- Prototipado con llama.cpp: la cuantización mixta y el borrador DSpark permiten experimentar con decodificación especulativa y medir el impacto en latencia sobre hardware modesto.
- Generación de descripciones y etiquetado de imágenes a escala: el pipeline image-text-to-text permite automatizar metadatos de catálogos, archivos fotográficos o datasets de visión.
- Inferencia en entornos con memoria limitada: los tipos IQ2/IQ3 en los expertos enrutados reducen la huella a ~12,5 GB, lo que facilita su ejecución en GPUs de 16 GB o en configuraciones con offload parcial a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el GGUF principal: ~12,5 GB solo para los pesos; añadir el proyector visual Q8_0 (~733 MB) y el borrador DSpark (~237 MB) si se usan.
- Con overhead de contexto y caché KV para 262.144 tokens, la VRAM necesaria crece de forma significativa; para contextos largos se recomienda GPU de 24 GB o superior.
- GPU recomendadas: RTX 4090 (24 GB) para el modelo completo con contexto moderado; A100 40/80 GB o H100 para contexto máximo y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con offload parcial a CPU, en GPUs de 16 GB (RTX 4080, 4070 Ti Super).
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware, del uso de DSpark y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B A3B Abliterated APEX-I NanoPlus (este) | ~34,7B totales, MoE 8 activos | 262.144 | Imagen + texto | Apache-2.0 | GGUF |
| MiniCPM-V 4.7 35B A3B Abliterated (BF16, distributedcognition) | ~34,7B totales, MoE 8 activos | 262.144 | Imagen + texto | Apache-2.0 | Safetensors |
| MiniCPM-V 4.7 35B A3B (openbmb, original) | ~34,7B totales, MoE 8 activos | 262.144 | Imagen + texto | Apache-2.0 | Safetensors |
| MiniCPM-V 4.7 35B A3B APEX-I MiniPlus V2.1 (IsValorum) | ~34,7B totales, MoE 8 activos | 262.144 | Imagen + texto | Apache-2.0 | GGUF |

Las alternativas de otros desarrolladores con arquitectura híbrida SSM/MoE y modalidad visión no están documentadas en la información disponible.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo editando 74 tensores; puede generar contenido que el modelo original rechazaría, con implicaciones éticas y de seguridad.
- Sesgos: no documentados en la información disponible, pero heredados del corpus de entrenamiento original (predominantemente inglés y chino).
- Riesgo de alucinación: no cuantificado; la cuantización agresiva de los expertos enrutados (IQ2_XXS, IQ2_S) puede degradar la calidad respecto al BF16.
- Idiomas: solo inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable del contenido generado por una variante sin censura.
- La cuantización mixta con tipos de 2 bits en algunos expertos puede producir pérdida de precisión en tareas de razonamiento complejo.
- El contexto de 262.144 tokens requiere memoria considerable; en hardware de consumo habrá que reducirlo.
- El GGUF principal no incluye tensores MTP; la decodificación especulativa exige descargar el borrador DSpark por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad de la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-NanoPlus-GGUF
- Modelo base abliterated: https://huggingface.co/distributedcognition/MiniCPM-V-4.7-35B-A3B-abliterated
- Modelo original: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante MiniPlus V2.1: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Colección APEX-I NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-standard-moe-6acfee79c288c5d8e7307785
- Apoyo al autor: https://ko-fi.com/isvalorum
