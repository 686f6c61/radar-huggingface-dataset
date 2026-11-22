# higa2515/Qwen3.8-27B-QSA-GGUF

## Resumen

Qwen3.8-27B-QSA-GGUF es la distribución en formato GGUF del modelo Qwen3.8-27B con atención dispersa QSA (Qwen Sparse Attention), publicada por el usuario higa2515. Se trata de un modelo multimodal de 27.373.132.800 parámetros (27,4 mil millones) derivado de la familia Qwen3.8, adaptado para emplear un mecanismo de atención dispersa aprendida que reduce el coste computacional en contextos muy largos. El repositorio incluye cuantizaciones Q8_0 propia y UD-Q4_K_M, UD-Q5_K_M y UD-Q6_K generadas con Unsloth, todas compartiendo los mismos indexadores QSA en FP32.

La relevancia del modelo reside en su ventana de contexto efectiva: el motor de inferencia asociado permite operar hasta 262.144 tokens con caché KV en FP16, y el sistema QSA selecciona dinámicamente un subconjunto del contexto (presupuesto K configurable, por ejemplo 2.048 tokens) para las capas de atención, reduciendo el coste respecto a la atención densa. La versión v2 de los indexadores, publicada el 19 de noviembre de 2026, mejora sustancialmente la recuperación de información en contextos largos frente a la v1.

El modelo es multimodal (texto, imagen y vídeo), está publicado bajo licencia Apache 2.0 y requiere un motor llama.cpp modificado específico, ya que la arquitectura QSA no es compatible con llama.cpp estándar. Su pipeline declarado es image-text-to-text y acumula más de 15.800 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención dispersa QSA (Qwen Sparse Attention), M-RoPE y MTP (multi-token prediction) |
| Parametros totales | 27.373.132.800 (27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens en el motor recomendado (entrenamiento de indexadores hasta 65.536 tokens en v2) |
| Tipos de cuantizacion | Q8_0, UD-Q4_K_M, UD-Q5_K_M, UD-Q6_K (GGUF); pesos BF16 en el repo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors/BF16 en el modelo base higa2515/Qwen3.8-27B-QSA-BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y sustituye el mecanismo de atención por QSA, una atención dispersa con indexadores aprendidos que seleccionan qué posiciones del contexto recibe cada capa de atención. Los indexadores se entrenan mediante destilación desde atención densa con una mezcla multimodal, en dos etapas de destilación continuada en la versión v2 (secuencias de hasta 65.536 tokens, frente a 16.384 en v1). El modelo incorpora M-RoPE para el manejo posicional multimodal, MTP (multi-token prediction) para decodificación especulativa con borrador y reutilización de caché de prefijo en vivo. La arquitectura de referencia se describe en el paper arXiv:2608.30320.

La inferencia requiere un fork específico de llama.cpp (kuraneko1/Qwen3.8-27B-QSA-llama.cpp), con soporte de QSA para texto, imagen y vídeo. Los cuatro archivos GGUF comparten los mismos 80 tensores de indexador en FP32; el resto de tensores (866 no-indexador) y los metadatos son idénticos entre v1 y v2. En la versión v2 solo cambiaron los indexadores, lo que permite actualizar sin revalidar el resto del modelo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens en el motor recomendado).
- Procesamiento multimodal de imagen y vídeo (pipeline image-text-to-text; QSA aplicado a texto, imagen y vídeo).
- Recuperación estructurada de información en contextos largos (structured recall), con precisión del 89,6 % con thinking off y 90,8 % con thinking low en la prueba interna de 240 preguntas a 128k de contexto.
- Modo de razonamiento configurable mediante `reasoning_effort` en la plantilla de chat (thinking off / low).
- Decodificación especulativa mediante MTP con borrador (draft 2 en las pruebas publicadas).
- Reutilización de caché de prefijo en vivo (live prefix-cache reuse).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con hasta 262.144 tokens de contexto, el modelo puede ingerir libros completos, expedientes o informes de cientos de páginas y responder preguntas sobre ellos; la prueba publicada usa aproximadamente 127k tokens de texto de libros como contexto plantado.
- Recuperación de registros en bases documentales largas: el entrenamiento v2 se centró en distinguir registros parecidos (claves que difieren en un carácter o registros vecinos), lo que lo hace adecuado para tareas de extracción donde los distractores son similares al objetivo.
- Procesamiento de vídeo e imagen con contexto textual: al aplicar QSA también a imagen y vídeo, puede emplearse en tareas de descripción, pregunta-respuesta visual o análisis de secuencias de vídeo junto con instrucciones textuales largas.
- Asistentes conversacionales de contexto largo: la reutilización de caché de prefijo permite mantener conversaciones multi-turno sobre un mismo documento sin recalcular el prefijo en cada turno.
- Despliegue en hardware de gama alta con cuantización agresiva: la variante UD-Q4_K_M se ejecutó en dos V100 de 32 GB con contexto de 262.144 tokens, lo que habilita entornos con GPUs de generación anterior.
- Evaluación e investigación de atención dispersa: al publicarse los indexadores y el motor, sirve para estudiar el compromiso entre presupuesto de atención (K) y precisión en recuperación de contexto largo.
- Generación con razonamiento controlado: el parámetro `reasoning_effort` permite ajustar el coste de razonamiento según la latencia objetivo en producción.

## Benchmarks y rendimiento

Prueba interna de recuperación estructurada (240 preguntas, 8 tipos × 10 profundidades × 3, plantadas en ~127k tokens de texto de libros PG-19 no usados en entrenamiento; contexto 262.144, KV FP16, MTP draft 2, K=2.048, decodificación greedy, salida máxima 65.536 tokens):

| Indexador / configuración | Thinking off | Thinking low |
|---|---:|---:|
| v1 Q8_0 (A100 80GB) | 169/240 (70,4 %) | 185/240 (77,1 %) |
| v2 stage 1 only (no publicado) | 191/240 (79,6 %) | 211/240 (87,9 %) |
| v2 Q8_0 (A100 80GB) | 215/240 (89,6 %) | 218/240 (90,8 %) |
| v2 UD-Q4_K_M (2× V100 32GB) | 217/240 (90,4 %) | 209/240 (87,1 %) |
| Atención densa (referencia superior) | 227/240 (94,6 %) | 232/240 (96,7 %) |

Mejora de v2 sobre v1:

| Medida | Thinking off | Thinking low |
|---|---:|---:|
| Respuestas correctas | +46 (+27,2 %) | +33 (+17,8 %) |
| Precisión | +19,2 puntos | +13,8 puntos |
| Respuestas incorrectas | de 71 a 25 (−64,8 %) | de 55 a 22 (−60,0 %) |
| Brecha v1–densa cerrada | 79,3 % | 70,2 % |

Pruebas de McNemar emparejadas (solo preguntas acertadas por un lado): v2 vs v1, 55 vs 9 con p = 3,5e-9 (thinking off) y 39 vs 6 con p = 5,4e-7 (thinking low); v2 vs densa, 7 vs 19 con p = 0,029 y 6 vs 20 con p = 0,009. La atención densa sigue siendo significativamente mejor.

Errores con thinking off por tipo: registro parecido (26 en v1, 9 en v2, 5 en densa) y conjunto de registros incorrecto (25 en v1, 9 en v2, 2 en densa).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 177,6 GB en total (suma de todas las cuantizaciones); Q8_0 de 27,4 B parámetros requiere del orden de 30 GB solo para pesos, más caché KV FP16 para 262.144 tokens, que en la configuración publicada cabe en una A100 de 80 GB.
- La variante UD-Q4_K_M se ejecutó con éxito en dos V100 de 32 GB (64 GB agregados) con contexto de 262.144 y KV FP16.
- GPU validadas en la información publicada: A100 80GB (sm_80) y 2× V100 32GB (sm70, runtime capturado en el repo).
- GPU consumer: no se documenta compatibilidad con RTX 4090 u otras consumer en la información disponible; el motor debe compilarse para la arquitectura objetivo.
- Despliegue: exclusivamente mediante el fork kuraneko1/Qwen3.8-27B-QSA-llama.cpp (o pentaCoxian/Qwen-QSA-llama.cpp en el commit 70b4e14); no es compatible con llama.cpp estándar, vLLM, TGI ni Ollama según la información disponible.
- Latencia y throughput: no disponibles; solo se documenta el uso de MTP draft 2 y decodificación greedy en las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA (este) | 27,4 B | hasta 262.144 | Apache 2.0 | GGUF / BF16 | Atención dispersa QSA; requiere motor modificado |
| Qwen3.8-27B (base, sin QSA) | 27,4 B | no disponible | no disponible | GGUF (unsloth/Qwen3.8-27B-GGUF) | Atención densa; referencia superior en recall (94,6 % vs 89,6 %) |
| Atención densa sobre el mismo modelo | 27,4 B | hasta 262.144 | Apache 2.0 | — | Referencia de calidad en las pruebas publicadas, sin el ahorro de QSA |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La atención densa supera significativamente a QSA en recuperación en contexto largo (94,6 % vs 89,6 % con thinking off; 96,7 % vs 90,8 % con thinking low), con diferencias estadísticamente significativas (p = 0,029 y p = 0,009).
- El presupuesto de atención K=2.048 a 128k de contexto muestra al modelo solo aproximadamente el 1,6 % del contexto; errores residuales se concentran en registros parecidos y conjuntos de registros incorrectos.
- Los resultados publicados provienen de una prueba interna de 240 preguntas no publicada, con una sola ejecución por modelo; según el autor, unas 6 de 240 respuestas cambian entre ejecuciones repetidas con los mismos pesos, y los resultados varían entre tipos de GPU. Solo son comparables resultados del mismo entorno.
- Los metadatos GGUF conservan nombres de v1 (por ejemplo `general.finetune = QSA-mm2` en Q8_0); la versión debe identificarse por el SHA256 del archivo en `SHA256SUMS`.
- Requiere un motor llama.cpp modificado; no funciona con herramientas estándar de despliegue, lo que limita la portabilidad a producción.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No hay datos publicados sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no oficial de llama.cpp implica riesgos de mantenimiento y soporte.
- El tamaño del repo (177,6 GB) y los requisitos de VRAM (A100 80GB o 2× V100 32GB para contexto completo) limitan el despliegue a infraestructura de gama alta.

## Enlaces

- Hugging Face: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Pesos BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper QSA: https://arxiv.org/abs/2608.30320
- GitHub del motor: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
- Guía de runtime: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/main/qsa27b/RUNTIME.md
- Entrenamiento del indexador: https://github.com/kuraneko1/qsa-indexer-forge
- Motor alternativo usado en benchmarks: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/tree/70b4e14a830a4ec78d1ac97087cd9fac02429d37
- Licencia: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF/blob/main/LICENSE
- X del autor: https://x.com/_ryu15_
