# huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B de Alibaba Qwen, publicada por el usuario huihui-ai. La técnica de abliteración elimina direcciones de activación asociadas con rechazos en el modelo base, de modo que el modelo deja de negarse a responder ciertas peticiones. El resultado se distribuye en formato GGUF, cuantizado en múltiples variantes (desde IQ1_S hasta BF16), pensado para inferencia local con llama.cpp y derivados.

El modelo conserva la arquitectura del base: 27.320.697.856 parámetros (unos 27,3 mil millones), pipeline image-text-to-text (capacidades multimodales de imagen y texto) y una ventana de contexto declarada de hasta 1.048.576 tokens mediante escalado YaRN sobre un contexto nativo de 262.144 tokens. El repositorio es notablemente grande (865,3 GB) porque incluye numerosas variantes de cuantización y series derivadas (UD, GSQ-RCO, Ternary, Swift, Underdog-Saluki, así como parches).

Su relevancia actual radica en la combinación de tres factores: un modelo de ~27B con contexto muy largo y capacidades multimodales, la eliminación de rechazos para casos de uso de investigación y generación sin filtros, y un ecosistema de cuantizaciones extremas (incluyendo 2-bit ternario) que permite ejecución en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque la abliteración introduce caveats de calidad y seguridad que conviene evaluar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con hybrid-attention (según tags del repo: hybrid-attention); detalles específicos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 nativo; hasta 1.048.576 con YaRN (rope-scale 4) según la model card |
| Tipos de cuantizacion | IQ1_S hasta BF16; series Q2_K_L a Q6_K_L, Q8_0_L, UD, GSQ-RCO, Ternary (2-bit/PTQ1), mixes IQ2 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (también se mencionan conversiones desde safetensors del base); incluye mmproj para visión |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 865,3 GB |
| Descargas | 4.292.911 |
| Likes | 2296 |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,3 mil millones de parámetros con capacidades multimodales (image-text-to-text). Los tags del repositorio indican atención híbrida (hybrid-attention) y presencia de componentes MTP (multi-token prediction) y visuales, que la model card afirma explícitamente que no han sido modificados durante la abliteración. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

La innovación principal de esta ficha es el proceso de abliteración: se identifican y eliminan direcciones de activación responsables de los rechazos, aplicando la modificación selectivamente a determinadas capas. Según la model card, en la versión inicial se retuvieron sin abliterar las primeras 15 capas (para preservar rendimiento), y en la serie UD se abliteraron las capas 17 a 52 (indexación 0-based); en las series Swift, Ternary y Underdog-Saluki solo se abliteraron las capas 22 a 52. Además, ciertos tensores (token_embd, output, ffn_down, ssm_out, attn_output) se convierten a Q8_0 o BF16 en las cuantizaciones bajas para mejorar la calidad de respuesta, lo que produce artefactos como que Q2_K_L pueda ocupar más que Q3_K. Para las variantes ternarias se requiere un fork específico de llama.cpp (PrismML-Eng/llama.cpp); llama.cpp estándar no ejecuta esos ficheros.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con proyector multimodal mmproj incluido en el repo.
- Contexto largo: hasta 262.144 tokens nativo y hasta 1.048.576 con escalado YaRN.
- Generación sin rechazos (uncensored) gracias a la abliteración, orientada a investigación y casos donde el modelo base declinaría responder.
- Soporte de cuantizaciones extremas, incluyendo ternario/2-bit, para ejecución en dispositivo (on-device) con CUDA y Metal.
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama-server/llama.cpp.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar cómo la abliteración afecta al comportamiento de rechazo y a la calidad general, comparando con el base Qwen3.8-27B en experimentos controlados.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido con temáticas que el modelo base rechazaría, usando las variantes Q4_K_L o Q5_K_L para equilibrar calidad y tamaño.
- Procesamiento de documentos largos con imágenes: análisis de informes, manuales o PDF escaneados de hasta cientos de miles de tokens, aprovechando el contexto extendido con YaRN y el proyector visual.
- Despliegue local en estación de trabajo: con las variantes BF16 o Q8_0_L en 2× RTX 6000 Pro (según el ejemplo de la model card) para servir un endpoint compatible con OpenAI vía llama-server.
- Ejecución en hardware de consumo: las variantes IQ1_S hasta Q4_K_L permiten probar el modelo en GPU consumer, aunque con degradación de calidad esperable en las cuantizaciones más agresivas.
- Experimentación con cuantización ternaria/2-bit: las series Ternary, procedentes de prism-ml/Ternary-Bonsai-2-27B-gguf, sirven para validar kernels de atención híbrida ternaria en el fork de llama.cpp de PrismML.
- Ajuste fino o destilación posterior: partir de los pesos abliterated (o del parche patch-unsloth) para entrenar variantes especializadas sin rechazos en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: ~54,6 GB de pesos (27,3B × 2 bytes) más overhead de contexto y proyector visual; la model card indica 2× RTX 6000 Pro para BF16 con contexto de 1M.
- VRAM estimada para Q8_0_L: ~27-29 GB; viable en una GPU de 32 GB o en dos de 24 GB.
- VRAM estimada para Q4_K_L: ~15-17 GB; cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con contexto moderado.
- VRAM estimada para Q2_K_L / IQ2: ~9-11 GB; cabe en GPUs consumer de 12 GB, con pérdida de calidad notable.
- Variantes ternarias/2-bit: tamaño reducido, pero requieren el fork PrismML-Eng/llama.cpp; no funcionan en llama.cpp estándar.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se importan los GGUF), y cualquier runtime compatible con GGUF; el repo declara compatibilidad con endpoints.
- Aceleración: CUDA y Metal según los tags; el ejemplo de la model card usa -ngl 99, flash attention (-fa on), caché K/V en BF16 y rope-scaling yarn.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | ~27,3B | 262K nativo / 1M con YaRN | Imagen + texto | Apache 2.0 | GGUF (múltiples cuantizaciones) | Sin rechazos; series derivadas y parches |
| Qwen/Qwen3.8-27B (base) | ~27,3B | 262K nativo / 1M con YaRN | Imagen + texto | Apache 2.0 | safetensors, GGUF (vía terceros) | Modelo original con alineación y rechazos |
| unsloth/Qwen3.8-27B-GGUF | ~27,3B | Igual que el base | Imagen + texto | Apache 2.0 | GGUF (UD, DW) | Cuantizaciones dinámicas del base, sin abliterar |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27B | no disponible | no disponible | no disponible en la información | GGUF ternario | Requiere fork de llama.cpp de PrismML |

## Limitaciones y advertencias

- La abliteración es descrita por el propio autor como una implementación "cruda" y de prueba de concepto; puede degradar capacidades del modelo base.
- Solo se abliteran determinadas capas (15 primeras retenidas en la versión inicial; 17-52 o 22-52 según la serie), por lo que el comportamiento puede ser inconsistente entre variantes.
- Riesgo de alucinación y de respuestas dañinas o inexactas al haberse eliminado los rechazos; no se han publicado evaluaciones de seguridad.
- Las cuantizaciones por debajo de Q8_0 no son estándar (tensores convertidos a Q8_0 o BF16), lo que altera tamaños y puede confundir en la planificación de almacenamiento.
- Las series Ternary, Swift, Underdog-Saluki y GSQ-RCO son experimentales y pueden incluir avisos (disclaimer) adicionales; los pesos ternarios exigen un fork específico de llama.cpp.
- El repositorio ocupa 865,3 GB; descargar el repo completo es inviable en la mayoría de entornos, conviene seleccionar solo el fichero GGUF necesario.
- Idiomas soportados no documentados; el rendimiento multilingüe puede diferir del base.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado sin filtros recae en el desplegador.
- No hay benchmarks publicados que cuantifiquen la pérdida de calidad respecto al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones del base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio de la técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Serie ternaria de origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Swift-1.5 de ukisai: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Underdog-Saluki de ConwayResearch: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Instrucciones del parche Unsloth: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/tree/main/patch-unsloth
