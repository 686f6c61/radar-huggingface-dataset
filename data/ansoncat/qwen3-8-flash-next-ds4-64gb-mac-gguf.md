# ansoncat/qwen3.8-flash-next-ds4-64gb-mac-gguf

## Resumen

Qwen3.8-Flash-Next en formato GGUF es una cuantización agresiva de múltiples etapas del modelo base Qwen3.8-Flash-Next, publicada por el usuario ansoncat para ejecutar el modelo con una ventana de contexto de 262 144 tokens en un MacBook de 64 GB con chip Apple Silicon. El artefacto parte de la cuantización Q2 de antirez y aplica tres pasos adicionales con pérdida: re-cuantización de los expertos de down-projection a filas IQ2_XXS de 640 elementos, conversión de las proyecciones densas de Q8_0 a Q4_K y compresión de los tensores de hiperconexión de bajo rango de F16 a Q8_0. Con 179 551 050 368 parámetros totales y un repositorio de 139,4 GB, el objetivo declarado es caber en la memoria unificada de un portátil de gama alta sin renunciar al contexto completo.

La relevancia de esta ficha no está en el modelo en sí, sino en la ingeniería de despliegue: el autor documenta de forma reproducible cada paso de cuantización y cada optimización del motor ds4, con mediciones de memoria cableada y velocidad de decodificación y prefill en hardware concreto. Es, por tanto, un caso de estudio de cuantización extrema orientada a hardware de consumo y de fork de un runtime de inferencia para Metal.

Conviene subrayar que el archivo no es cargable por llama.cpp ni por la versión upstream de ds4: utiliza un tipo de tensor privado y proyecciones densas Q4_K que solo entiende la rama `kv-grow-up` del fork de ansoncat. La licencia declarada es qwen-community-1.0, con la etiqueta `license: other` en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el README menciona capa MTP, expertos compartidos de 640 elementos e hiperconexiones por capa) |
| Parametros totales | 179 551 050 368 |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (configurado con `--ctx 262144`) |
| Tipos de cuantizacion | Q2_K base con expertos down en IQ2_XXS, proyecciones densas en Q4_K, hiperconexiones en Q8_0, MTP y cabeza de salida en F16/Q8_0; proyector de visión Q8_0 aparte |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (metadatos: `license: other`) |
| Formato de pesos | GGUF (un único archivo de aproximadamente 139 GB más un `mmproj` opcional para visión) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento en la documentación proporcionada. El README del artefacto permite inferir algunos componentes: existe una capa MTP (multi-token prediction), expertos con proyecciones down de 640 elementos de ancho, un conjunto de expertos compartidos y tensores de hiperconexión de bajo rango por capa (`blk.*.hc_{attn,ffn}_{down,up}`), lo que apunta a una arquitectura de mezcla de expertos con mecanismos de conexión residual jerárquica. También se menciona un indexador con búfer en anillo y puntuaciones calculadas por slices, compatible con atención de contexto largo, aunque no se detalla el mecanismo exacto.

El "entrenamiento" de este artefacto es en realidad un pipeline de cuantización determinista de tres pasos reproducido byte a byte: (1) los expertos de down-projection pasan de Q2_K a filas IQ2_XXS de 640 elementos re-cuantizadas desde los pesos BF16 originales con la imatrix de Unsloth; (2) las proyecciones densas pasan de Q8_0 a Q4_K por redondeo al más cercano, manteniendo la capa MTP y el down de expertos compartidos en Q8_0; (3) los tensores de hiperconexión de bajo rango pasan de F16 a Q8_0, dejando `output_hc_*` y la cabeza MTP en F16. El paso 1 descarga aproximadamente 75 GiB de shards BF16 y la imatrix; cada etapa genera un archivo de 130-140 GiB y requiere 16 GiB libres adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Soporte de visión mediante un proyector multimodal externo (`mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`, opcional y no incluido).
- Decodificación con predicción multi-token (MTP) activable con el flag `--mtp`, que el autor usa en todas las mediciones finales.
- Razonamiento con modo "thinking" implícito: el README reporta velocidades distintas para prompts cortos con y sin thinking (45 frente a 57 tokens/s).
- Contexto largo de hasta 262 144 tokens, con caché KV que crece de forma incremental en la rama `kv-grow-up`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere exposición mediante API HTTP en el servidor ds4.
- Capacidades de código: se midió un prompt de código de 16K tokens (47 tokens/s de decodificación, 564 de prefill).
- No se documentan tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Análisis de repositorios completos en local: con 262K tokens de contexto se puede cargar un conjunto amplio de archivos fuente en un único prompt y pedir revisiones, resúmenes o detección de inconsistencias sin salir del portátil, lo que resulta adecuado para código propietario que no debe enviarse a la nube.
- Asistencia de programación offline en Apple Silicon: el modelo decodifica a 47-57 tokens/s en un M5 Pro de 64 GB, suficiente para autocompletado interactivo y explicación de fragmentos en un IDE, con la ventaja de que ningún dato abandona la máquina.
- Procesamiento de documentos largos (contratos, informes, expedientes): la ventana de 262K tokens permite ingerir documentos de cientos de páginas en una sola pasada y hacer preguntas sobre ellos, con la matización de que la cuantización Q2/IQ2 degrada la fidelidad en comparación con el modelo original.
- Transcripción y descripción de imágenes con el proyector multimodal: descargando el `mmproj` Q8_0 de ggml-org se pueden hacer consultas imagen-texto en local, útil para catalogar capturas o extraer texto de diagramas.
- Prototipado de agentes conversacionales con contexto largo: el servidor ds4 expone endpoints compatibles, de modo que se puede levantar una API local para experimentar con diálogos multi-turno extensos antes de decidir si se migra a infraestructura con GPU.
- Evaluación de técnicas de cuantización extrema: el pipeline reproducible byte a byte y las tablas de memoria y velocidad convierten este repositorio en material de referencia para investigadores que quieran medir el impacto de IQ2_XXS, Q4_K y Q8_0 en calidad y rendimiento sobre Metal.
- Demostración de inferencia de un modelo de 179B en hardware de consumo: útil para docencia o para justificar decisiones de arquitectura sobre memoria unificada frente a VRAM discreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El README sí incluye mediciones de sistema en un M5 Pro de 64 GB con la rama `kv-grow-up` de ds4:

| Metrica | Valor |
|---|---|
| Memoria cableada, conversacion de ~9K tokens | ~38 GiB (41,4 GiB sobre linea base inactiva de 2,65) |
| Memoria cableada, contexto completo de 262K | 44,1 GiB (44,74 GiB en comprobación de la misma sesión) |
| Memoria inactiva con modelo cargado (`DS4_METAL_NO_RESIDENCY=1`) | 4,0 GiB (frente a 42,2 sin el flag) |
| Decodificacion, prompt de 8K tokens | 51 tokens/s |
| Decodificacion, prompt de 32K tokens | 51 tokens/s |
| Decodificacion, prompt de codigo de 16K tokens | 47 tokens/s |
| Decodificacion, prompts cortos (codigo / prosa / con thinking) | 57 / 45 / 45 tokens/s |
| Decodificacion, contexto completo de 262K (prompt de 260K) | 35 tokens/s |
| Prefill, prompt de 8K / 32K / 16K codigo | 550 / 563 / 564 tokens/s |
| Prefill, contexto completo de 262K | 545 tokens/s de media |

El autor advierte de que la velocidad de la máquina varía entre sesiones y que las comparaciones solo son válidas dentro de la misma sesión. Sin `DS4_QWEN4_HC_Q8_GEMM=1` el prefill es un 62 % más lento con este archivo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 38 GiB de pesos residentes en memoria para conversaciones normales y 44,1 GiB con el contexto completo de 262K; el resto del archivo (la tabla de n-gramas) permanece en el SSD.
- Hardware de referencia: MacBook con M5 Pro y 64 GB de memoria unificada. El contexto completo exige elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=57344`.
- En Macs de 64 GB se recomienda `--prefill-chunk 1024` si no se aplica el ajuste de wired limit; con 2048 el pico de prefill añade 0,6-1,0 GiB y hasta 45,2 GiB en contexto completo.
- No cabe en GPUs de consumo con 24 GB de VRAM (RTX 4090) ni en configuraciones de 32 GB; requiere al menos 48 GB de memoria unificada o VRAM para el contexto completo, y el motor solo está portado a Metal.
- No es desplegable con llama.cpp, Ollama, vLLM ni TGI: el archivo usa un tipo de tensor privado y proyecciones densas Q4_K que solo carga el fork `ansoncat/ds4`, rama `kv-grow-up`, compilado con `make ds4-server`.
- Throughput medido: 51 tokens/s de decodificación y 550-564 tokens/s de prefill en prompts de 8K-32K; 35 tokens/s de decodificación en contexto completo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a aspectos de despliegue y formato.

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| ansoncat/qwen3.8-flash-next-ds4-64gb-mac-gguf | 179,5 B | 262 144 | GGUF modificado | qwen-community-1.0 | Solo fork ds4, Metal |
| antirez/qwen3.8-flash-next-gguf (Q2) | 179,5 B | 262 144 | GGUF estándar | qwen-community-1.0 | ds4 upstream y llama.cpp |
| ggml-org/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | GGUF estándar | qwen-community-1.0 | llama.cpp y derivados |

La diferencia práctica frente a las otras dos opciones es doble: este artefacto reduce el uso de memoria cableada en contexto completo (de 55,0-55,7 GiB en upstream con Q2 oficial a 44,1 GiB) a cambio de perder portabilidad y algo de calidad por las tres etapas adicionales de cuantización con pérdida.

## Limitaciones y advertencias

- Cuantización con pérdida acumulada: sobre una base Q2 se aplican IQ2_XXS en expertos, Q4_K en proyecciones densas y Q8_0 en hiperconexiones; la degradación de calidad respecto al modelo BF16 no está cuantificada en la documentación.
- Portabilidad nula: el archivo no carga en llama.cpp ni en ds4 upstream; requiere el fork de ansoncat y la variable `DS4_QWEN4_HC_Q8_GEMM=1` para un rendimiento de prefill aceptable.
- Solo Metal y Apple Silicon: no hay soporte documentado para CUDA, ROCm ni CPU.
- Riesgo de alucinación: no evaluado ni documentado; en un modelo cuantizado a 2 bits es esperable un aumento de errores factuales, especialmente en tareas de razonamiento y matemáticas.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe tras la cuantización.
- Licencia qwen-community-1.0: es necesario revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que los metadatos indican `license: other`.
- El proyector de visión no está incluido y debe descargarse por separado desde ggml-org; sin él, las capacidades multimodales no están disponibles.
- Requiere ajustes del sistema operativo (límite de memoria cableada) para el contexto completo, lo que complica el despliegue automatizado.
- El repositorio tiene 226 descargas y 2 likes, con validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ansoncat/qwen3.8-flash-next-ds4-64gb-mac-gguf
- Modelo base cuantizado: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF oficial de ggml-org (incluye el proyector `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`): https://huggingface.co/ggml-org/Qwen3.8-Flash-Next-GGUF
- Fork del motor de inferencia: https://github.com/ansoncat/ds4 (rama `kv-grow-up`, detalles en `FORK.md`)
