# jan1k/Qwen3.8-27B-Uncensored-Genesis-V1-NVFP4-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Genesis-V1-NVFP4-GGUF es una recuantización en formato NVFP4 de un modelo denso de 27 B parámetros derivado de Qwen3.8 y ajustado por LuffyTheFox para eliminar los mecanismos de rechazo (variante "uncensored" o abliterated). El repositorio lo publica el usuario jan1k y contiene únicamente pesos GGUF cuantizados a 4 bits en coma flotante (NVFP4), calibrados con una importance matrix, no el modelo original en precisión completa.

El interés técnico del artefacto está en el proceso de cuantización: se generan cuatro ficheros (dos corpus de calibración × con y sin cabecera MTP), se aplica una política de protección por tensor que mantiene ciertos pesos en F16 y F32, y se emplea un fork de llama.cpp denominado advanced-gguf-quantizer. El modelo declara una ventana de contexto de 262.144 tokens, 64 capas más una cabeza MTP/NextN para decodificación especulativa, y arquitectura `qwen35` densa con un perfil de cuantización `qwen35dense`.

La relevancia es doble: por un lado, sirve como ejemplo de flujo de trabajo reproducible para cuantizar a NVFP4 modelos híbridos/SSM con llama.cpp; por otro, es un modelo experimental (el propio autor lo etiqueta como "absolutely experimental") con cero descargas y cero likes en el momento del análisis, orientado a GPUs Blackwell y con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (Qwen3.8 denso), transformer denso de 64 capas + 1 cabeza MTP/NextN; el fichero contiene además tensores SSM (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`) según la política de protección del autor |
| Parámetros totales | 27,32 B según la model card; 26.895.999.448 (~26,9 B) según el campo de safetensors de HuggingFace |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (formato de 4 bits en coma flotante con escalas de entrada por bloque) calibrado con imatrix; tensores selectos forzados a F16 y F32. `general.file_type` = 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). Cuatro ficheros: `NVFP4-v2-imx-v5.gguf` (14,68 GB, 1866 tensores), `NVFP4-v2-imx-v5-noMTP.gguf` (14,46 GB, 1835 tensores), `NVFP4-v2-imx-v6-froggeric.gguf` (14,68 GB, 1866 tensores), `NVFP4-v2-imx-v6-froggeric-noMTP.gguf` (14,46 GB, 1835 tensores) |

Datos adicionales del artefacto:

| Parámetro | Valor |
|---|---|
| Modelo base | LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF |
| Fuente de la cuantización | `Qwen3.8-27B-Uncensored-Genesis-V1-Q8_K_P.gguf` (29.990 MiB, 9,21 BPW); no había fuente BF16 |
| Cuantizador | advanced-gguf-quantizer (`llama-quantize`), fork de llama.cpp |
| Tamaño del repositorio | 80,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

La model card describe el modelo como un Qwen3.8 denso de 27,32 B parámetros y 64 capas, con una cabeza adicional MTP/NextN (bloque 64) que permite decodificación multi-token especulativa cuando el runtime la soporta. El perfil de arquitectura usado por el cuantizador es `qwen35dense`. La presencia de tensores específicos de SSM (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`) en la política de protección sugiere componentes de espacio de estados en algunas capas, aunque la model card no detalla la proporción ni la disposición de los bloques híbridos. No se documenta en la información disponible el proceso de ajuste fino, el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineación.

Lo que sí está documentado con detalle es el proceso de cuantización. Se parte de un GGUF intermedio en Q8_K_P, no de BF16, de modo que algunos tensores atraviesan una segunda ronda de redondeo (pérdida sobre pérdida). Para NVFP4, el cuantizador calcula escalas de entrada por bloque; sin importance matrix esas escalas quedan en identidad (1,0) y se desperdicia presupuesto de precisión. Se emplearon dos corpus de calibración: el conjunto v5 de Bartowski (~1,7 MB de prosa plana, cobertura amplia de idioma pero sin estructura de plantilla de chat) y el conjunto v6, que añade 173 conversaciones (137 base + 36 de tool calling) renderizadas con la plantilla real del modelo mediante froggeric/Qwen-Fixed-Chat-Templates v22.5, con `--parse-special` para que los tokens especiales (`<|im_start|>`, `<|im_end|>`, `<|tool_call|>`) se traten como tokens reales.

La política de protección por tensor usa regex ancladas (`^...$`) con `--tensor-type`, aplicadas en orden inverso por `std::regex_search` (gana la última coincidencia). Se mantienen en F16 `blk.0.attn_gate.weight`, `blk.0.attn_qkv.weight`, `blk.0.ffn_down.weight` y `blk.13.ffn_down.weight` para evitar el colapso de esos tensores. Además, y esto no estaba en la política original del modelo base, se forzaron a F32 las normas 1D (`attn_norm`, `post_attention_norm`, `attn_q_norm`, `attn_k_norm`, `ssm_norm`, `output_norm`), `ssm_conv1d.weight`, `ssm_dt.bias` y `ssm_a`, por compatibilidad con el cargador FastMTP y con el kernel CUDA de SSM conv en Ampere. Sin esa protección, el cuantizador emitía 198 tensores auxiliares `.scale`/`.input_scale` adicionales (99 de cada tipo) que el cargador no declaraba, provocando un desajuste de recuento (2066 esperados frente a 2064 obtenidos). Hay que tener en cuenta que `blk.0.attn_gate` y `attn_qkv` eran q8_0 en el origen, así que su "F16" almacena valores q8 desquantizados: conserva fidelidad de nivel q8, pero no es F16 real y ocupa más bytes que la fuente.

## Capacidades

- Generación de texto y conversación multi-turno con ventana nominal de 262.144 tokens.
- Razonamiento y completion de texto general, con variantes de calibración optimizadas para prosa (v5) o para chat/razonamiento (v6).
- Tool calling / function calling: la calibración v6 incluye 36 conversaciones con llamadas a herramientas renderizadas con los tokens especiales reales, lo que el autor presenta como la variante recomendada para uso con herramientas.
- Soporte de MTP (multi-token prediction) mediante la cabeza NextN del bloque 64, con ficheros alternativos sin MTP para runtimes que no la implementan.
- Capacidades multilingües limitadas a inglés y chino según la declaración de la model card.
- Modelo "uncensored": se espera una tasa de rechazo muy baja ante peticiones que otros modelos alineados declinarían, aunque la información disponible no documenta la técnica de ablación empleada.
- No se declaran capacidades de visión, audio ni modos de "thinking" explícitos.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto nominal, el modelo puede ingerir contratos, expedientes o bases de código extensas en una sola pasada sin troceado ni recuperación externa, algo relevante en análisis legal o auditoría técnica.
- Agentes con uso de herramientas: los ficheros v6 están calibrados sobre plantillas de chat con tokens de tool calling, lo que los hace adecuados para pipelines de agente donde el modelo debe emitir llamadas estructuradas y encadenar varios pasos de razonamiento.
- Asistencia a la programación en local: los 14,68 GB de pesos permiten ejecutar el modelo en una estación de trabajo con GPU de 16-24 GB, integrándolo en el editor o en un servidor de CI/CD para revisión de código y generación de parches.
- Atención al cliente bilingüe inglés/chino: al ser los dos idiomas declarados y soportar conversaciones multi-turno con contexto muy largo, encaja en escenarios de soporte donde el histórico completo de la conversación debe permanecer en contexto.
- Generación de datos sintéticos: la baja huella de memoria del formato NVFP4 abarata el coste por token generado, lo que permite producir grandes volúmenes de texto o diálogo para destilación o aumento de datasets.
- Investigación sobre alineación y red teaming: al tratarse de una variante sin censura, es útil como sujeto de estudio para medir tasas de rechazo, comportamientos indeseados y eficacia de técnicas de mitigación, siempre en un entorno controlado.
- Escritura creativa sin filtros: ficción, guiones o narrativa con temáticas que los modelos alineados suelen rechazar, con la advertencia de que la responsabilidad legal y editorial recae en el operador.
- Traducción y asistencia técnica en el par inglés-chino, aprovechando el contexto largo para mantener coherencia terminológica en documentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni comparaciones cuantitativas entre las variantes v5 y v6 más allá de la recomendación cualitativa de usar v6 para chat y v5 para completion. Tampoco se publican mediciones de perplejidad, de tasa de rechazo ni de latencia.

## Requisitos de hardware

- VRAM para los pesos: 14,68 GB en las variantes con MTP y 14,46 GB en las variantes sin MTP, en formato NVFP4. A ello hay que sumar la caché KV, cuyo tamaño no se documenta y que con 262.144 tokens de contexto puede superar con holgura el tamaño de los pesos.
- Orientación de plataforma: las etiquetas del repositorio incluyen `blackwell` y `nvfp4`, lo que apunta a GPUs Blackwell (RTX 50, RTX PRO 6000 Blackwell, B100/B200) como destino principal para los kernels NVFP4. La política de protección menciona explícitamente compatibilidad con kernels CUDA de Ampere, lo que sugiere intención de soporte también en esa generación.
- GPU de consumo: los pesos caben en GPUs de 16 GB o más (RTX 5070 Ti, RTX 5080, RTX 5090, RTX 4090), pero de forma muy ajustada en las de 16 GB y dejando poco margen para caché KV.
- GPU de centro de datos: A100, H100 y B200 disponen de VRAM suficiente para los pesos y para contextos largos; el soporte efectivo de NVFP4 depende de los kernels del runtime empleado.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) con el fork advanced-gguf-quantizer o una versión que incluya soporte NVFP4 y, si se quiere aprovechar la cabeza MTP, del cargador FastMTP. Las variantes `-noMTP` existen precisamente para runtimes que no soportan la cabeza MTP. No se documenta compatibilidad con vLLM ni con TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de aceleración obtenida con MTP.

## Comparativa con modelos similares

No se dispone de datos verifi cados de benchmarks para este modelo ni para alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales declaradas por cada proyecto. Las cifras de los modelos alternativos proceden de conocimiento público general y no han sido verificadas contra sus model cards en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Genesis-V1-NVFP4 (este) | 26,9-27,3 B densos | 262.144 | Apache 2.0 | Solo GGUF NVFP4, 4 variantes, 0 descargas |
| Qwen3-32B | 32 B densos | 32.768 nativo (ampliable con YaRN) | Apache 2.0 | Safetensors, GGUF, ampliamente desplegado |
| Gemma 3 27B | 27 B densos | 128.000 | Gemma Terms (uso comercial con restricciones) | Safetensors, GGUF, ecosistema amplio |
| Mistral Small 3.1 24B | 24 B densos | 128.000 | Apache 2.0 | Safetensors, GGUF, soporte en vLLM |

Diferencias relevantes: este modelo es el único de la tabla con contexto de 262.144 tokens y el único publicado exclusivamente en NVFP4 y con cabeza MTP, lo que restringe su despliegue a runtimes compatibles. Los tres alternativos ofrecen pesos en precisiones estándar (BF16, FP8, GGUF en varios niveles de cuantización) y están validados en producción, mientras que este repositorio es experimental y sin adopción registrada.

## Limitaciones y advertencias

- Modelo explícitamente experimental según su propio autor ("absolutely experimental"), con 0 descargas y 0 likes: no hay evidencia de comunidad que haya validado su comportamiento.
- Cuantización con pérdida sobre pérdida: la fuente es Q8_K_P, no BF16, de modo que los tensores que ya eran q8 en origen sufren una ronda extra de redondeo.
- Cuatro tensores protegidos como "F16" (`blk.0.attn_gate`, `blk.0.attn_qkv`, `blk.0.ffn_down`, `blk.13.ffn_down`) almacenan en realidad valores q8 desquantizados, no F16 real, y ocupan más bytes que la fuente.
- Condición de "uncensored": la ausencia de alineación de seguridad implica mayor probabilidad de generar contenido dañino, ilegal o desinformativo. Requiere filtros externos y supervisión humana en cualquier despliegue orientado al público.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad factual ni de tasa de invención, agravado por el contexto largo, donde el modelo puede perder información intermedia.
- Calibración del corpus v5 muy limitada: ~1,7 MB de prosa, sin estructura conversacional; puede degradar el comportamiento en chat frente a la variante v6.
- Idiomas declarados únicamente inglés y chino; no hay soporte declarado para castellano ni otras lenguas, y el rendimiento fuera de ese par no está documentado.
- Compatibilidad frágil: se han documentado fallos en tiempo de ejecución con el cargador FastMTP (desajuste de recuento de tensores) que obligaron a proteger normas 1D en F32. Cambiar de revisión del runtime puede romper la carga.
- La ventana de 262.144 tokens es nominal; no se documenta el rendimiento efectivo ni la degradación de atención a contextos muy largos, y la caché KV a esa longitud puede exceder la memoria disponible.
- Licencia Apache 2.0 declarada para el artefacto de cuantización, pero la model card no aclara la licencia ni la procedencia de los datos del ajuste "uncensored" del modelo base, lo que deja abierta la cuestión de la trazabilidad para uso comercial.
- El repositorio ocupa 80,2 GB aunque cada fichero pesa ~14,5 GB, lo que implica una descarga considerable si se quieren todas las variantes.
- No se documentan modos de cuantización alternativos (Q4_K_M, Q8_0, etc.) en este repositorio; quien necesite otras precisiones debe acudir al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jan1k/Qwen3.8-27B-Uncensored-Genesis-V1-NVFP4-GGUF
- Modelo base: https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-V1-MTP-GGUF
- Cuantizador advanced-gguf-quantizer: https://github.com/ggml-org/advanced-gguf-quantizer
- Plantillas de chat Qwen corregidas (froggeric): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre el modelo; los resultados devueltos correspondían a directorios de panaderías y no guardan relación con el objeto de esta ficha.
