# andreafanfani/gemma-4-12B-it-uncensored

## Resumen

Gemma 4 12B Unified es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, publicado originalmente como `google/gemma-4-12B-it`. Esta ficha describe la variante `andreafanfani/gemma-4-12B-it-uncensored`, una modificación del modelo instructivo original generada con la herramienta Heretic v2.1.0 mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) que reduce la tasa de rechazos del modelo. El objetivo declarado es eliminar los comportamientos de negativa (refusals) manteniendo al máximo el resto de capacidades del modelo base.

El modelo base pertenece a la familia Gemma 4, que incluye variantes densas y MoE (E2B, E4B, 12B, 26B A4B y 31B). El 12B Unified es una arquitectura densa de 11.950 millones de parámetros con 48 capas, ventana de atención deslizante de 1024 tokens, contexto de 256.000 tokens y vocabulario de 262.000 entradas. Se distingue por ser multimodal sin codificadores separados: procesa texto, imagen y audio de forma nativa, lo que simplifica el despliegue en GPUs de consumo.

La relevancia de esta variante concreta está en su carácter reproducible: el autor publica los parámetros exactos de la ablación (capas 4 a 44, pesos de preservación y corrección, vecinos) y un directorio `reproduce`, de modo que el proceso puede auditarse y repetirse. El modelo se distribuye bajo licencia Apache 2.0, aunque el modelo base remite adicionalmente a la licencia específica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (atención híbrida local/global), familia Gemma 4 |
| Parametros totales | 11.959.730.176 (11,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | más de 140 idiomas (según model card del modelo base); lista concreta no disponible |
| Licencia | Apache 2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base emplea un transformer denso con atención híbrida que intercala capas de atención local con ventana deslizante (1024 tokens en el 12B) y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El modelo es "encoder-free": integra comprensión de imagen y audio de forma nativa sin codificadores externos, lo que permite un tamaño de despliegue contenido. Dispone de 48 capas, vocabulario de 262.000 tokens y modos de razonamiento ("thinking") configurables.

Sobre el entrenamiento del modelo base no se aportan en la información disponible detalles sobre número de tokens, composición del dataset ni si hubo RLHF o DPO; la model card solo indica que existen variantes preentrenada e instructiva. La modificación de esta variante no es un fine-tuning: es una ablación de direcciones en el espacio de activaciones aplicada con Heretic v2.1.0 sobre las capas 4 a 44, con `preserve_good_behavior_weight` de 0,9170, `steer_bad_behavior_weight` de 0,0359, `overcorrect_relative_weight` de 0,7553 y `neighbor_count` de 14. Según el autor, el proceso reduce los rechazos de 99/100 a 10/100 con una divergencia KL de 0,1835 respecto al original.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio nativa (sin codificador separado).
- Procesamiento de vídeo según la model card del modelo base.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores.
- Function calling / tool calling nativo.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Multilingüismo en más de 140 idiomas.
- Reducción sustancial de negativas: 10/100 rechazos frente a 99/100 del modelo original.
- Reproducibilidad del proceso de ablación mediante parámetros publicados y directorio `reproduce`.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original y esta variante ablacionada permite estudiar cómo se distribuyen las direcciones de rechazo en las capas 4-44 y qué coste en divergencia KL tiene su eliminación.
- Generación creativa sin filtros editoriales: escritura de ficción con violencia, temas controvertidos o contenido adulto donde el modelo original rechazaría la petición; útil en entornos controlados de autoría.
- Asistentes conversacionales especializados en dominios sensibles: salud, seguridad o derecho, donde las negativas genéricas interrumpen flujos legítimos de consulta profesional.
- Procesamiento multimodal de documentos: extracción de información de imágenes y audio combinados con texto largo gracias a la ventana de 256K tokens, por ejemplo en digitalización de archivos con notas de voz.
- Evaluación de robustez de pipelines: usar la variante como caso adverso para medir cómo responden los sistemas de moderación posteriores ante un modelo que rara vez se niega.
- Reproducción de experimentos de ablación: reejecutar Heretic v2.1.0 con los parámetros publicados para validar metodologías de decensurado sobre otros modelos de la familia Gemma 4.
- Prototipado local en GPU de consumo: el tamaño de 11,95B y la ausencia de codificadores externos facilitan pruebas en una única GPU de gama alta.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-12B-it) |
|---|---|---|
| Rechazos (refusals) | 10/100 | 99/100 |
| Divergencia KL | 0,1835 | 0 (por definición) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta variante ni para el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda GPU de 40-80 GB para contexto largo.
- Cuantización a 8 bits: alrededor de 12-13 GB de pesos, viable en RTX 4090 (24 GB) con contexto moderado.
- Cuantización a 4 bits: alrededor de 7-8 GB de pesos, viable en GPUs de consumo de 12-16 GB, aunque no se documentan ficheros GGUF en la información disponible.
- GPU recomendadas: A100 80GB, H100 80GB para BF16 con contexto completo; RTX 4090 o L40S para cuantización 8 bits; RTX 3090/4080 para 4 bits.
- Despliegue: transformers de forma nativa (formato safetensors); compatibilidad declarada con endpoints; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 24,0 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| andreafanfani/gemma-4-12B-it-uncensored | 11,95B denso | 256K | Texto, imagen, audio | Apache 2.0 | Variante ablacionada, 0 descargas |
| google/gemma-4-12B-it | 11,95B denso | 256K | Texto, imagen, audio | Apache 2.0 | Modelo base oficial |
| Gemma 4 31B Dense | 30,7B denso | 256K | Texto, imagen | Apache 2.0 | Mayor capacidad, sin audio |
| Gemma 4 26B A4B | MoE (activos no disponibles) | 256K | no disponible | Apache 2.0 | Alternativa MoE de la familia |

No se dispone de benchmarks comparativos estándar entre estas variantes en la información proporcionada; la única métrica cuantitativa es la tasa de rechazos y la divergencia KL frente al modelo base.

## Limitaciones y advertencias

- La ablación elimina direcciones asociadas a rechazos, lo que puede degradar salvaguardas de seguridad y aumentar la probabilidad de generar contenido dañino, ilegal o sexualmente explícito; no debe desplegarse en producción sin moderación externa.
- La divergencia KL de 0,1835 indica que el modelo se aleja del original de forma no trivial; pueden aparecer regresiones en tareas no relacionadas con los rechazos.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta variante.
- La licencia declarada es Apache 2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de uso del modelo base antes de un uso comercial.
- No se documentan idiomas concretos ni evaluaciones multilingües para esta variante.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria del resultado de la ablación.
- El repositorio ocupa 24 GB; no se ofrecen cuantizaciones ligeras, lo que limita el despliegue en hardware modesto.
- El proceso de ablación se aplicó solo a las capas 4-44; el comportamiento de las capas restantes no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreafanfani/gemma-4-12B-it-uncensored
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Colección Gemma 4: https://huggingface.co/collections/google/gemma-4
- Heretic: https://heretic-project.org
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma: https://deepmind.google/models/gemma/
