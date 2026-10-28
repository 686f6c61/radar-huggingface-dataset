# p4ulbr4dl3y/unlimited-ocr-2-ru-gguf

## Resumen

`unlimited-ocr-2-ru-gguf` es una reconstrucción en formato GGUF de `baidu/Unlimited-OCR-2`, un modelo de visión-lenguaje especializado en parsing de documentos (OCR estructurado con coordenadas de bloques) publicado por Baidu bajo licencia MIT. El autor de esta ficha, `p4ulbr4dl3y`, no se limita a convertir los pesos: recalibra la cuantización Q4_K_M con una imatrix generada sobre 92 páginas reales de documentos rusos, y publica los parches necesarios para que la arquitectura funcione en llama.cpp. El modelo base tiene 2.938.670.848 parámetros según los safetensors (la model card del autor indica "3.3B MoE"), con un encoder visual separado que se distribuye como `mmproj` en FP16.

La relevancia de esta ficha es doble. Por un lado, resuelve un problema práctico: los quants upstream están calibrados con benchmarks de documentos chinos e ingleses, lo que degrada el rendimiento en ruso; aquí la imatrix se ha construido con documentos rusos reales y se verifica página a página contra BF16. Por otro, documenta un caso poco habitual de porting: `unlimited-ocr2` no está soportado por llama.cpp mainline (que solo implementa Unlimited-OCR v1 / DeepSeek-OCR), y convertirlo como v1 produce salida silenciosamente incorrecta porque se pierden dos mecanismos de atención y posición.

El resultado es un paquete autocontenido (modelo, encoder visual, imatrix, parches y binarios CUDA precompilados) que permite ejecutar OCR de documentos en local con unos 3 GB de VRAM en Q4_K_M, sin dependencia de código remoto. A cambio, exige compilar llama.cpp con un parche y fijar la versión, y arrastra una advertencia importante sobre bucles de decodificación en tablas densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con encoder visual; atención DASH / SR-SWA (ventana local de 128 tokens + hasta 12 bloques remotos de 32 tokens seleccionados por router) y RoPE 2D de página (63 pares para el eje de token, 1 par para el eje de página) |
| Parametros totales | 2.938.670.848 (2,94B) segun safetensors; la model card del autor indica "3.3B MoE" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como maximo declarado; el ejemplo de despliegue del autor usa `-c 4096` |
| Tipos de cuantizacion | GGUF Q4_K_M (2,0 GB, imatrix rusa, tensores de router en F32), GGUF Q8_0 (3,0 GB), mmproj F16 (788 MB), imatrix `.gguf` (20 MB) para recuantizar |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con parche de arquitectura; modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y un encoder de visión acoplado, orientado a image-text-to-text para parsing de documentos. Dos componentes lo diferencian de un OCR multimodal convencional. El primero es el **RoPE 2D de página**: la posición no se indexa por el índice de secuencia, sino por un par `(offset dentro de la página, paridad de página)`, de modo que 63 pares de frecuencias gobiernan el eje de token y 1 par gobierna el eje de página. Esto permite concatenar páginas en un mismo prompt sin romper la coherencia posicional. El segundo es la atención **DASH / SR-SWA**: cada token atiende a una ventana local a nivel de token de 128 posiciones más hasta `top_k = 12` bloques remotos de 32 tokens, seleccionados por capa mediante un router que resume bloques (`head_cls`), aplica un prior `entmax-1.5` y lo convierte en un sesgo logarítmico aditivo. Es decir, no es atención completa ni atención lineal pura, sino una atención dispersa aprendida.

El autor no documenta la composición del dataset de entrenamiento ni si hubo RLHF/DPO; esa información corresponde al modelo base y no está disponible en la información proporcionada. Lo que sí documenta es el proceso de cuantización: la imatrix se generó con `llama-imatrix` sobre 92 páginas de documentos rusos reales, con los tensores del router forzados a F32 (`--tensor-type 'blk\.\d+\.indexer\..*=F32'`) para no degradar la selección de bloques remotos, y salida de tensores en Q8_0. La validación se hizo con decodificación greedy comparando BF16 frente a Q4_K_M en páginas fuera del conjunto de calibración, obteniendo igualdad de caracteres del 100% tras normalizar las cajas de layout a `[BOX]`, con coordenadas idénticas.

## Capacidades

- OCR de documentos con salida estructurada: texto más cajas de layout en formato `[x1,y1,x2,y2]`, agrupadas en bloques delimitados por `</BLOCK>`.
- Parsing multipágina: el prompt admite pares `<PAGE><image>` repetidos en orden de página, manteniendo coherencia posicional gracias al RoPE 2D de página.
- Procesamiento de tablas, incluidas tablas densas y de tipo histórico, con la salvaguarda de `no_repeat_ngram` descrita más abajo.
- Comprensión de documentos en ruso y en inglés; ruso es el idioma objetivo de la calibración de esta build.
- Integración con llama.cpp vía API compatible con endpoints (`endpoints_compatible` en los tags), lo que permite sustituir un endpoint HTTP de chat multimodal.
- Modo conversacional declarado en los tags del repositorio (`conversational`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible (el modelo está orientado a transcripción, no a razonamiento).
- Capacidades de audio: no disponibles.

## Casos de uso

- **Digitalización de archivo administrativo ruso**: el modelo convierte páginas escaneadas de regulaciones y normativas en texto plano con estructura de bloques. La validación del autor sobre dos páginas de un reglamento da 100% de similitud de caracteres frente a BF16, con 4-5 s por página en una T4, lo que hace viable procesar lotes de cientos de páginas en una GPU de gama media.
- **Extracción de tablas en documentación técnica o histórica**: aunque es el escenario de riesgo (ver limitaciones), con `--no-repeat-ngram-size 24 --no-repeat-ngram-window 1024` el autor consigue que una página de tabla que antes se truncaba a 3187 tokens termine en 1326 tokens con `finish=stop`, es decir, salida completa y no truncada.
- **Pipeline RAG sobre corpus documental en ruso**: al emitir cajas de layout junto al texto, se puede reconstruir el orden de lectura y segmentar por bloques antes de indexar en un vector store, preservando la relación entre párrafos, títulos y tablas.
- **Procesamiento por lotes en infraestructura propia o air-gapped**: al ser GGUF sobre llama.cpp, el modelo corre sin llamadas a servicios externos. Con Q4_K_M (2,0 GB) más el mmproj (788 MB) cabe en GPUs de consumo y en servidores sin aceleradores de gran formato.
- **Ingesta de expedientes multipágina**: el soporte de pares `<PAGE><image>` permite enviar un expediente completo en un único prompt y obtener la transcripción por páginas en orden, reduciendo el coste de orquestación frente a una llamada por página.
- **Sustitución de un OCR comercial en un backend existente**: el repositorio se marca como `endpoints_compatible`; se puede levantar `llama-server` en el puerto 8099 y enrutar las peticiones de un servicio ya existente sin reescribir el cliente.
- **Recuantización con dominio propio**: el archivo `uocr2-ru.imatrix.gguf` (20 MB) y la receta `llama-quantize` publicada permiten a un equipo generar su propia imatrix con documentos de otro dominio (por ejemplo, formularios médicos o contratos) en lugar de reutilizar la calibración rusa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor publica únicamente pruebas de fidelidad de la cuantización y de estabilidad de decodificación:

| Prueba | Referencia | Resultado |
|---|---|---|
| Página de reglamento 1 (holdout), BF16 vs Q4_K_M | 878 caracteres, 7 s vs 5 s en T4 | 100,00% similitud, cajas idénticas |
| Página de reglamento 2 (holdout), BF16 vs Q4_K_M | 482 caracteres, 5 s vs 4 s en T4 | 100,00% similitud, cajas idénticas |
| GGUF BF16 vs referencia del vendor (`UnlimitedOCRForCausalLM.infer()`, misma página, greedy) | secuencia de bloques idéntica | 99,94% similitud de caracteres, coordenadas ±1 (redondeo bf16/f32) |

Impacto del sampler `no_repeat_ngram` (Q4_K_M, Metal, greedy, 12 páginas reales):

| Configuración | Páginas idénticas a la versión sin guarda | Página de tabla con bucle |
|---|---|---|
| `n=8` | 3/12 (hasta 11% de deriva de texto) | Corregida, 1073 tokens |
| `n=24`, `window=1024` (recomendado) | 11/12, byte a byte | Corregida: de 3187 tokens truncados a 1326 con `finish=stop` |
| `n=35`, `window=1024` | 11/12 | Corregida, 927 tokens, repeticiones cortas residuales |
| `n=35`, `window=128` | 11/12 | No corregida, descontrol (runaway) |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los tamaños de archivo, sin incluir KV cache): Q4_K_M ~2,8 GB (2,0 GB del modelo + 788 MB del mmproj); Q8_0 ~3,8 GB (3,0 GB + 788 MB). Con contexto de 4096 y prompt de imagen conviene reservar 4-5 GB.
- GPU validadas por el autor: NVIDIA T4 (sm_75) para las mediciones de tiempo (4-7 s por página) y Apple Metal para las pruebas del sampler.
- Cabe en GPU de consumo: sí, por tamaño. Cualquier GPU con 6 GB o más debería alojar Q4_K_M con contexto moderado; el límite práctico es el soporte de la compilación CUDA, no la VRAM.
- El autor publica binarios CUDA precompilados para `sm_75` únicamente (`binaries/uocr2-llama-cpp-cuda75.tar.gz`), con la advertencia de que se compilaron antes del parche del sampler. Para otras arquitecturas hay que recompilar.
- Despliegue: exclusivamente llama.cpp con el parche de arquitectura, fijado al tag `b11913` (commit `7aca0d2ea8`). Comando de referencia: `llama-server -m uocr2-Q4_K_M.gguf --mmproj mmproj-uocr2-f16.gguf -ngl 99 -c 4096 -np 1 --temp 0 --port 8099 --no-repeat-ngram-size 24 --no-repeat-ngram-window 1024`.
- vLLM, TGI u Ollama: no disponibles para esta arquitectura (requieren soporte de `unlimited-ocr2`, que mainline no tiene). El servicio de referencia del vendor es SGLang.
- Throughput: no disponible; solo se documentan latencias por página en T4 (4-7 s) y en Metal para el caso de tabla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `p4ulbr4dl3y/unlimited-ocr-2-ru-gguf` (esta ficha) | 2,94B | no disponible (ejemplo con 4096) | ru, en | MIT | GGUF + parche llama.cpp | Imatrix rusa, sampler `no_repeat_ngram` incluido |
| `baidu/Unlimited-OCR-2` (base) | 2,94B (3.3B MoE segun card) | no disponible | ru, en | MIT | safetensors | Referencia BF16; requiere código remoto del vendor |
| Quants GGUF upstream de Unlimited-OCR-2 | mismos | no disponible | ru, en | MIT | GGUF | Calibrados con benchmarks de documentos chinos e ingleses |
| Unlimited-OCR v1 / DeepSeek-OCR | no disponible | no disponible | no disponible | no disponible | soportado por llama.cpp mainline | Arquitectura distinta (atención completa, RoPE 1D); convertir v2 como v1 produce estructura incorrecta |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las pruebas de fidelidad del apartado anterior.

## Limitaciones y advertencias

- **Requiere parche y versión fijada**: `unlimited-ocr2` no está en llama.cpp mainline. Sin el parche `llama.cpp-patch/unlimited-ocr2.patch` el modelo carga pero genera estructura de documento incorrecta de forma silenciosa (atención completa y RoPE 1D en lugar de DASH/SR-SWA y RoPE 2D).
- **Riesgo de bucle de decodificación**: en tablas densas el modelo puede no emitir `</BLOCK>` y agotar `max_tokens`, produciendo una respuesta truncada que aparenta estar completa. Es imprescindible usar `no_repeat_ngram` (n=24, window=1024; 4096 en prompts multipágina). Las penalizaciones de repetición y DRY no son sustituto: según el autor, DRY empeora la salida.
- **Orden del prompt estricto**: `<PAGE>` debe ir antes de la imagen (`<PAGE><image>Multi page parsing.`). Si la imagen va primero, la salida es basura.
- **Cobertura lingüística limitada**: solo ruso e inglés. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- **Calibración específica de dominio**: la imatrix se construyó con 92 páginas de documentos rusos. En otros dominios o idiomas, la ventaja frente a los quants upstream puede no mantenerse; conviene recuantizar con la receta publicada.
- **Validación muy limitada**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Las pruebas de fidelidad cubren dos páginas holdout y 12 páginas para el sampler; no hay evaluación a escala.
- **Discrepancia en el recuento de parámetros**: 2,94B en safetensors frente a "3.3B" en la model card. No hay desglose de parámetros activos del MoE.
- **Sin datos de sesgo ni alucinación**: no se han publicado evaluaciones de sesgo, y un modelo de OCR puede omitir texto de forma plausible sin señal de error.
- **Licencia**: MIT, lo que permite uso comercial, pero la licencia del modelo base debe verificarse en `baidu/Unlimited-OCR-2` antes de desplegar en producción.
- **Binarios precompilados**: los binarios CUDA incluidos son solo `sm_75` y anteriores al parche del sampler; no sirven para arquitecturas más recientes ni para el guard de `no_repeat_ngram`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/p4ulbr4dl3y/unlimited-ocr-2-ru-gguf
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- llama.cpp (versión a la que se fija el parche, tag `b11913`): https://github.com/ggml-org/llama.cpp
- Paper, blog del vendor, demo o repositorio adicional del modelo base: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (solo resultados no relacionados), por lo que no se incluyen más referencias.
