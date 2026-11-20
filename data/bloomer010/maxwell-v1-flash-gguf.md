# bloomer010/maxwell-v1-flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por maxwell-model, con 36.810.559.422 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. La ficha que nos ocupa, `bloomer010/maxwell-v1-flash-GGUF`, es un port a formato GGUF del modelo base `maxwell-model/Maxwell-V1-Flash`, distribuido bajo licencia Apache-2.0 y orientado a inferencia con llama.cpp.

El modelo resuelve el problema de ejecutar un MoE de 35B con solo 3B activos en hardware de consumo o en servidores modestos, mediante cuantizaciones que van de Q8_0 (39,2 GB) a Q3_K_M (unos 17 GB). Su arquitectura incorpora innovaciones poco habituales: hyper-conexiones restringidas a variedades (mHC) con 4 flujos residuales y mezcla normalizada por Sinkhorn, atención GQA con RMSNorm por cabeza en Q/K, y una ruta de atención block-sparse que se activa por encima de los 16K tokens de posición de query.

Es relevante ahora porque el port incluye una cabeza MTP (multi-token prediction) utilizable como draft especulativo con `--spec-type draft-mtp`, y porque el modelo base es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. La contrapartida es que requiere un fork específico de llama.cpp: las versiones estándar, LM Studio y Ollama todavía no cargan estos ficheros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 45 bloques (3 dense SwiGLU + 42 MoE), mHC con 4 flujos residuales, GQA con RMSNorm por cabeza en Q/K, atención block-sparse |
| Parámetros totales | 36.810.559.422 (dato real de safetensors) |
| Parámetros activos | ~3B por token (256 expertos enrutados / 12 activos + 1 experto compartido) |
| Longitud de contexto | 256K tokens (prefijo denso de 16K de posición de query; block-sparse por encima) |
| Tipos de cuantización | Q8_0, Q8_0-XL (F16 en embeddings, output head, atenciones e indexer), Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M (todas con imatrix) |
| Idiomas soportados | no disponible (tokenizer con pre-type "script-aware"; no se ha publicado un barrido multilingüe amplio) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 45 bloques: 3 densos con SwiGLU y 42 MoE, cada uno con 256 expertos enrutados de los que se activan 12, más un experto compartido. Incorpora manifold-constrained hyper-connections (mHC): 4 flujos residuales con mezcla normalizada mediante Sinkhorn, lo que añade coste computacional frente a un residual estándar. La atención es GQA con RMSNorm por cabeza en Q y K, y la ruta de atención es densa hasta los 16K tokens de posición de query, pasando a block-sparse por encima: 8 bloques de prefijo, 8 locales y hasta 16 bloques de 128 tokens seleccionados por un indexer. La ruta sparse exige flash attention; sin ella el modelo cae a atención densa.

El port GGUF incluye además una cabeza MTP (multi-token prediction) que puede usarse como draft especulativo con `--spec-type draft-mtp`, y un tokenizer con pre-type "script-aware". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Las cuantizaciones se generaron con una importance matrix calculada a partir de un corpus mixto de código e inglés, distinto del set de calibración del proveedor. Todas las cuantizaciones mantienen las matrices de mezcla mHC en F32.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en el fichero GGUF.
- Modo thinking con etiquetas embebidas en la plantilla de chat.
- Tool calling: llamadas individuales y rondas de ida y vuelta con resultados de herramienta funcionan; el uso agéntico multi-paso no es fiable según el autor.
- Razonamiento multi-paso limitado: la cabeza MTP permite decodificación especulativa, no razonamiento extendido.
- Capacidades multilingües: no confirmadas; el tokenizer es script-aware pero no se ha validado con un barrido amplio.
- Contexto largo: ventana de 256K con atención block-sparse por encima de 16K, adecuada para documentos extensos y repositorios de código.
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- **Atención al cliente automatizada**: conversaciones multi-turno con contexto largo gracias a la ventana de 256K, que permite mantener el historial completo de una sesión sin truncar. La plantilla de chat embebida simplifica el despliegue con `llama-server --jinja`.
- **Análisis de documentos extensos**: informes, contratos o expedientes de decenas de miles de tokens caben en una sola pasada; la atención block-sparse reduce el coste por encima de 16K frente a atención densa.
- **Asistencia de código en producción**: el modelo se calibró con un corpus mixto de código e inglés y soporta tool calling individual, lo que permite integrarlo en pipelines de revisión o generación de parches con llamadas a herramientas de build y test.
- **Despliegue en hardware de consumo**: con la cuantización Q4_K_M (22,3 GB) o IQ4_XS (~21 GB) cabe en GPUs de 24 GB, y Q3_K_M (~17 GB) en GPUs de 16-24 GB, manteniendo 3B activos por token para latencias bajas.
- **Servidores con contexto muy largo**: con caché KV en q8_0, 256K de contexto ocupan unos 12 GB, lo que permite servir sesiones de 256K en 56 GB de VRAM con Q4_K_M.
- **Generación especulativa**: la cabeza MTP integrada permite usar `--spec-type draft-mtp` para acelerar la decodificación sin un modelo draft separado.
- **Prototipado e investigación de arquitecturas MoE**: el port expone mHC, enrutado de 256 expertos y atención block-sparse en un fork abierto de llama.cpp, útil para estudiar estas técnicas en inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de throughput en 2x V100-32GB con Q8_0 y tensor split a 2 vías:

| Contexto | Prefill | Decode |
|---|---|---|
| 2,2K | 594 t/s | 58 t/s |
| 8,8K | 629 t/s | 55 t/s |
| 18,7K | 567 t/s | 52 t/s |
| 20K (KV q8_0, contexto 131K) | 578 t/s | 40 t/s |

El propio autor señala que un Q8 de otro MoE 35B-A3B midió 828 t/s de prefill en las mismas tarjetas, atribuyendo la diferencia al coste de mHC y del enrutado de 256 expertos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: Q8_0 39,2 GB; Q8_0-XL ~42 GB; Q6_K ~31 GB; Q5_K_M ~27 GB; Q4_K_M 22,3 GB; IQ4_XS ~21 GB; Q3_K_M ~17 GB.
- **Caché KV**: ~90 KB/token en fp16; ~12 GB en q8_0 para 256K de contexto.
- **GPU recomendadas**: A100 80GB o H100 para Q8_0 con contexto largo; 2x V100-32GB validadas por el autor; RTX 4090 (24 GB) para Q4_K_M e IQ4_XS; GPUs de 16-24 GB para Q3_K_M.
- **Consumer GPU**: sí, en RTX 4090, RTX 3090 y tarjetas de 24 GB con Q4_K_M o inferiores; Q3_K_M en 16-24 GB.
- **Despliegue**: exclusivamente con el fork `aetherbird/llama.cpp`, rama `maxwell-moe`. llama.cpp estándar, LM Studio y Ollama no cargan estos ficheros. Ejemplo: `llama-server -m maxwell-Q4_K_M-mtp.gguf -ngl 99 --jinja -c 32768`.
- **Latencia y throughput**: 58 t/s de decode y 594 t/s de prefill a 2,2K en 2x V100-32GB con Q8_0; 40 t/s de decode a 20K con KV q8_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato GGUF estándar |
|---|---|---|---|---|---|
| Maxwell-V1-Flash | 36,8B | ~3B | 256K | Apache-2.0 | No (requiere fork) |
| MoE 35B-A3B de otra familia (referenciado por el autor) | ~35B | ~3B | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- **Compatibilidad**: no está fusionado upstream en llama.cpp; hay que aplicar el port antes de cargar los ficheros. LM Studio y Ollama no funcionan.
- **Tool calling agéntico**: el uso multi-paso de herramientas no es fiable según el autor; solo funcionan llamadas individuales y rondas de resultado.
- **Tokenizer**: el pre-type se validó contra el tokenizer de referencia solo en una muestra pequeña; no hay barrido multilingüe amplio, por lo que el comportamiento en idiomas distintos del inglés y el código es incierto.
- **Calibración**: la importance matrix procede de un corpus mixto de código e inglés, no del set del proveedor; la calidad de las cuantizaciones bajas puede diferir de la esperada.
- **Riesgo de alucinación**: no cuantificado; no hay benchmarks publicados.
- **Sesgos**: no documentados.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar la model card y el LICENSE del modelo base para confirmar condiciones.
- **Atención sparse**: requiere flash attention; sin ella el modelo cae a atención densa y pierde las ventajas de la ruta block-sparse.
- **Madurez**: repo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/maxwell-v1-flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Fork de llama.cpp con soporte `maxwell-moe`: https://github.com/aetherbird/llama.cpp/tree/maxwell-moe
