# cstr/SauerkrautLM-MoEdernColBERT-1.5M-CrispEmbed-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un reempaquetado en GGUF del checkpoint `VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M`, un recuperador de interacción tardía (late interaction, estilo ColBERT) construido sobre una arquitectura de encoder ModernBERT con mezcla de expertos y *hash embeddings*, denominada MoEdernBERT por el autor original. El modelo tiene 1.484.448 parámetros totales y, según la información pública de la familia, unos 0,88 M activos por token. Lo publica el usuario `cstr` para la API de texto bruto de CrispEmbed, con licencia Apache 2.0.

El interés de esta variante concreta es su tamaño: el fichero pesa 7.037.952 bytes y se ha verificado su ejecución en CPU Linux x64 desde C, Python, Rust, Dart, CLI y HTTP, con coincidencia exacta de IDs de tokens, máscaras y expansión de consulta, y una desviación máxima de 6,26e-07 en los 20 vectores congelados y en las 3 puntuaciones MaxSim. Es, por tanto, una pieza útil como referencia de conformidad para implementaciones ColBERT y como recuperador de coste prácticamente nulo en entornos sin GPU.

Conviene subrayar que el propio autor advierte de que la calidad de recuperación, el comportamiento en GPU y otras plataformas, y cualquier cuantización distinta de F32 no están verificados, y que las puertas (*gates*) de la integración permanecen desactivadas por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoEdernBERT: encoder estilo ModernBERT con mezcla de expertos y hash embeddings; recuperador de interacción tardía (ColBERT, multi-vector) |
| Parametros totales | 1.484.448 (dato real de safetensors) |
| Parametros activos | ~0,88 M por token (dato publicado para el checkpoint de 1,5 M de la familia; no confirmado de forma independiente para este fichero) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo F32 empaquetado byte a byte en GGUF; el autor no ha verificado ninguna otra cuantización |
| Idiomas soportados | no disponibles en la model card; la familia se describe como multilingüe en la documentación pública |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`moedern-1.5m-text-f32.gguf`, 7.037.952 bytes, SHA256 `0e2b8773abd8c78a5825280f9a73cb808b88d56f0675a8e4bb7f0509f5b6cc51`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MoEdernBERT, una variante de encoder de estilo ModernBERT que incorpora mezcla de expertos y *hash embeddings* sobre un esquema de recuperación de interacción tardía tipo ColBERT: en lugar de producir un único vector por documento, genera un conjunto de vectores por token y puntúa la relevancia mediante MaxSim entre los vectores de consulta y los del documento. La familia SauerkrautLM-MoEdernColBERT se publica en tres tamaños (1,5 M, 27 M y 115 M de parámetros) bajo Apache 2.0, con builds en GGUF y CoreML.

Este repositorio en particular es un reempaquetado, no un reentrenamiento: se copian el modelo y los metadatos del tokenizador sin aritmética sobre los tensores, y se conservan el LICENSE y el README originales bajo el directorio `upstream/`, conforme a la sección 4 de Apache 2.0. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO para los checkpoints MoEdern; como referencia del linaje de la familia, el modelo relacionado SauerkrautLM-Multi-ModernColBERT sí documenta un preentrenamiento continuo con 4.600 millones de tokens multilingües y destilación de conocimiento a partir de rerankers de referencia.

## Capacidades

- Recuperación y reranking multi-vector mediante interacción tardía (MaxSim), apta para búsqueda semántica de documentos y pasajes.
- Expansión de consulta (*query expansion*) verificada: el autor confirma IDs de tokens, máscaras y expansión idénticos a los del checkpoint original.
- Inferencia en CPU pura, con bindings verificados en C, Python, Rust, Dart, CLI y HTTP sobre Linux x64.
- Integración con la API de texto bruto de CrispEmbed (modo opt-in, puertas desactivadas por defecto).
- Capacidad multilingüe: la familia se anuncia como multilingüe, aunque este checkpoint no declara idiomas en su model card.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un encoder de recuperación, no un modelo generativo.

## Casos de uso

- Reranking de bajo coste en pipelines CrispEmbed: el modelo consume texto bruto a través de la API y devuelve puntuaciones de interacción tardía, de modo que puede colocarse tras un recuperador léxico o denso para reordenar los 50-100 candidatos con un coste de CPU despreciable.
- Búsqueda semántica embebida en herramientas de escritorio o CLI: con un fichero de 7 MB, cabe en el binario de la aplicación o en un directorio de recursos y elimina la dependencia de un servicio externo de embeddings.
- Prueba de conformidad para implementaciones ColBERT: al estar verificada la coincidencia exacta de IDs de tokens y la desviación máxima de 6,26e-07 en los 20 vectores congelados y las 3 puntuaciones MaxSim, sirve como *fixture* de referencia en la suite de tests de una implementación propia en cualquier lenguaje.
- Recuperación en el navegador o en dispositivos móviles: el tamaño reducido y la variante CoreML de la familia permiten desplegar búsqueda local en clientes web o apps sin llamadas a red.
- Enrutamiento y prefiltrado de consultas: usar las puntuaciones del modelo para clasificar o descartar consultas antes de invocar un recuperador mayor y más caro, reduciendo el número de llamadas al modelo grande.
- Deduplicación y similitud a gran escala: comparar pares de documentos mediante MaxSim sobre millones de registros en CPU, sin cuello de botella de GPU.
- Docencia e investigación sobre interacción tardía: el modelo permite reproducir paso a paso la tokenización, la expansión de consulta y el cálculo de MaxSim con un coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Existe una solicitud abierta en el repositorio de MTEB (issue #5779, "Add model: SauerkrautLM-MoEdernColBERT") para incorporar el modelo a la evaluación, pero no hay métricas publicadas. El autor del reempaquetado indica explícitamente que la calidad de recuperación no está verificada.

## Requisitos de hardware

- VRAM: inferior a 100 MB en cualquier GPU; los pesos en F32 ocupan unos 5,9 MB (1.484.448 × 4 bytes) y el fichero GGUF completo 7,04 MB, incluidos los metadatos del tokenizador.
- GPU recomendadas: ninguna en particular; el modelo está pensado para CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para esta carga.
- Cabe holgadamente en cualquier GPU consumer y en dispositivos de gama baja; también en Raspberry Pi y entornos similares.
- Opciones de despliegue: la ruta verificada es la API de texto bruto de CrispEmbed; el autor solo valida CPU Linux x64. No hay verificación de vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder ColBERT con pooling multi-vector no es un caso de uso natural para servidores de generación.
- Latencia y throughput: no disponibles. El autor no publica mediciones de rendimiento, únicamente resultados de corrección numérica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Este repositorio (CrispEmbed GGUF F32) | 1,48 M (0,88 M activos) | no disponible | GGUF F32 | Apache 2.0 | Reempaquetado verificado en CPU Linux x64 |
| SauerkrautLM-MoEdernColBERT-1.5M (upstream) | 1,48 M (0,88 M activos) | no disponible | safetensors | Apache 2.0 | Checkpoint original de VAGOsolutions |
| SauerkrautLM-MoEdernColBERT-27M | 27 M | no disponible | safetensors, GGUF, CoreML | Apache 2.0 | Miembro de la misma familia |
| SauerkrautLM-MoEdernColBERT-115M | 115 M | no disponible | safetensors, GGUF, CoreML | Apache 2.0 | Miembro de la misma familia; mayor capacidad de recuperación esperada |
| SauerkrautLM-Multi-ModernColBERT | no disponible | no disponible | safetensors | Apache 2.0 | Entrenado con 4,6 B de tokens multilingües y destilación; no es de interacción tardía MoE |

La comparación relevante es interna a la familia: ante problemas de calidad de recuperación, la ruta natural es subir a los checkpoints de 27 M o 115 M, que mantienen la misma interfaz y licencia, a cambio de un mayor consumo de memoria.

## Limitaciones y advertencias

- Calidad de recuperación no verificada: el autor solo acredita corrección numérica frente al checkpoint original, no rendimiento en tareas de retrieval.
- Con 1,48 M de parámetros, la capacidad semántica es muy limitada; es previsible un rendimiento bajo en dominios especializados o consultas que requieran paráfrasis profunda. No hay datos publicados que lo confirmen o desmientan.
- Solo F32: no se ha verificado ninguna cuantización, de modo que no cabe esperar ficheros Q4/Q8 ni reducciones adicionales de tamaño.
- Plataforma verificada restringida a CPU Linux x64; el comportamiento en Windows, macOS, ARM, WebAssembly y GPU no está validado.
- Idiomas no declarados en la model card de este repositorio; la condición multilingüe procede de la documentación de la familia y no está confirmada para este checkpoint.
- Las puertas de la integración con CrispEmbed permanecen desactivadas por defecto, por lo que es necesario un opt-in explícito.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en la recuperación: el modelo puntúa pares consulta-documento y no genera texto justificable.
- Licencia Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de conservar avisos y atribución; el reempaquetado mantiene el LICENSE original en `upstream/`.
- Trazabilidad: procede de un único autor (cstr) con 0 descargas en el momento de la consulta y sin pipeline declarado; para producción conviene partir del checkpoint original de VAGOsolutions.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/SauerkrautLM-MoEdernColBERT-1.5M-CrispEmbed-GGUF
- Modelo base: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M
- Revisión concreta del upstream empaquetada: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M/tree/9d360b8b88ae11bea5784bf9012ff509fdd5c2da
- Variante CoreML de la familia: https://huggingface.co/VAGOsolutions/SauerkrautLM-MoEdernColBERT-1.5M-CoreML
- Modelo relacionado (Multi-ModernColBERT): https://huggingface.co/VAGOsolutions/SauerkrautLM-Multi-ModernColBERT
- Anuncio de la familia en AGI Hunt: https://agihunt.info/en/p/1a1697671138cedb38c0f31a735
- Anuncio de la release en AGI Hunt: https://agihunt.info/en/e/1a177a4763df3b1882e16a7f153
- Solicitud de inclusión en MTEB (issue #5779): https://github.com/embeddings-benchmark/mteb/issues/5779
