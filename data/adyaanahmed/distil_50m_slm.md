# adyaanahmed/Distil_50M_SLM

## Resumen
Distil_50M_SLM es un modelo de lenguaje decoder-only de 51,5 millones de parametros desarrollado por adyaanahmed y entrenado desde cero mediante destilacion de conocimiento (knowledge distillation) a partir de Qwen2.5-0.5B, un modelo profesor aproximadamente diez veces mayor. El estudiante procesa unos 1.000 millones de tokens (19 por parametro) durante el preentrenamiento y recibe un ajuste corto de instrucciones destilado de Qwen2.5-0.5B-Instruct. Todo el entrenamiento se completo en 2 GPU Tesla T4 del tier gratuito de Kaggle, con un coste total de 66,2 GPU-horas.

El modelo emplea una arquitectura transformer de 18 capas y anchura 512 (estilo MobileLLM, profundo y estrecho), atencion grouped-query con 8 cabezas de consulta y 2 de clave/valor, FFN SwiGLU de tamano oculto 1280, RoPE y RMSNorm. Su ventana de contexto es de solo 512 tokens y su vocabulario de 32.768 entradas deriva de los tokens mas utiles de Qwen2.5, lo que permite mapear directamente los ids del profesor.

La relevancia de este modelo es doble: por un lado demuestra que es posible entrenar un SLM funcional con recursos de consumo; por otro, incluye un gemelo de control (`distil-50m-no-teacher`) entrenado con identicos datos, semilla y optimizador pero sin profesor, lo que permite cuantificar de forma empirica que aporta exactamente la destilacion. El autor advierte explicitamente que el modelo es fluido pero inventa hechos y no sabe aritmetica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 18 capas, d_model 512, atencion GQA, FFN SwiGLU, RoPE, RMSNorm |
| Parametros totales | 51.532.544 (47,2M en bloques transformer, 4,3M en embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16, 99 MB por checkpoint) |
| Vocabulario | 32.768 tokens (32.767 tokens de Qwen2.5 mas UNK) |
| Embeddings | Factorizados y atados: 32.768 x 128 proyectados a 512 |
| Cache KV | 9 KB por token en fp16 (4x menor que atencion multi-cabeza completa) |
| Computo por token | Aproximadamente 0,1 GFLOPs |
| Modelo base (profesor) | Qwen/Qwen2.5-0.5B |
| Libreria | PyTorch (arquitectura personalizada, no compatible con AutoModel) |

## Arquitectura y entrenamiento
El modelo sigue el patron de transformers profundos y estrechos popularizado por MobileLLM: 18 capas con anchura 512, atencion grouped-query con 8 cabezas de consulta y 2 de clave/valor (dimension de cabeza 64, QK-norm por cabeza), FFN SwiGLU con tamano oculto 1280, codificacion posicional RoPE con theta 10.000 y normalizacion RMSNorm. Los embeddings estan factorizados (32.768 x 128 proyectados a 512) y atados, lo que reduce el coste del vocabulario. La cache KV ocupa solo 9 KB por token en fp16, cuatro veces menos que una atencion multi-cabeza completa.

El preentrenamiento usa una perdida de destilacion de `0,7 x KL(profesor || estudiante) + 0,3 x cross-entropy` con temperatura T=1, calculada sobre el subconjunto de vocabulario del estudiante. Los datos son aproximadamente 1.020 millones de tokens: cerca del 64% de Cosmopedia v2 y 36% de FineWeb-Edu (puntuacion educativa >= 3); se vieron 983M tokens. El optimizador combina Muon para los pesos 2-D del transformer y AdamW para el resto, con learning rate pico de 1,5e-3, 400 pasos de warmup, fase plana y decaimiento 1-sqrt en el 20% final. Se realizaron 15.000 pasos de 65.536 tokens en fp16 con loss scaling y DDP sobre 2 GPU. El ajuste de instrucciones consistio en 3.996 pasos sobre aproximadamente 130.000 primeros turnos de smol-smoltalk, destilados de Qwen2.5-0.5B-Instruct con alpha 0,5.

## Capacidades
- Generacion de texto en ingles con continuacion fluida de estilo educativo.
- Modo chat de un solo turno con formato de prompt `### Question:\n{query}\n\n### Answer:\n`.
- Razonamiento basico de sentido comun y respuesta a preguntas de opcion multiple (por encima del azar en ARC-Easy, SciQ y HellaSwag).
- Finalizacion de frases y prediccion de tokens en contexto (LAMBADA, con precision limitada).
- Control de generacion mediante parametros de muestreo en el script de chat: temperatura, top-k, penalizacion por repeticion y longitud maxima.
- Inferencia en CPU a aproximadamente 20-30 tokens por segundo con salida en streaming.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso
- Experimentacion educativa con destilacion de conocimiento: el modelo y su gemelo de control permiten reproducir un estudio A/B del efecto del profesor con solo 66 GPU-horas en T4, ideal para cursos y talleres sobre entrenamiento de LLM.
- Prototipado de pipelines de generacion en CPU: con 99 MB en fp16 y 0,1 GFLOPs por token, se puede integrar en entornos sin GPU (CI, contenedores ligeros, dispositivos embebidos) para validar flujos de texto antes de escalar a modelos mayores.
- Generacion de texto de relleno o sintetico en dominios educativos: entrenado mayoritariamente con Cosmopedia v2, produce parrafos con registro explicativo util para aumentar datasets de pruebas o generar contenido de baja criticidad.
- Investigacion sobre arquitecturas profundas y estrechas: la combinacion de 18 capas con anchura 512, GQA y embeddings factorizados sirve como banco de pruebas reproducible para estudiar el equilibrio entre profundidad, anchura y calidad.
- Benchmarking de infraestructura de entrenamiento: los notebooks de Kaggle incluidos permiten medir throughput, consumo de memoria y estabilidad en fp16 con DDP sobre hardware de consumo.
- Filtrado y clasificacion ligera de texto por perplejidad: el modelo puede puntuar bits por byte de fragmentos en ingles para descartar contenido atipico en pipelines de curacion de datos, aunque con la precision limitada de un modelo de 50M.
- Demostracion de destilacion sobre vocabulario reducido: el mapeo `vocab.json` hacia ids de Qwen2.5 ejemplifica como trasvasar conocimiento entre tokenizadores distintos, replicable en otros pares profesor-estudiante.

## Benchmarks y rendimiento
Bits por byte en conjuntos reservados (menor es mejor, comparable entre tokenizadores):

| Conjunto | Estudiante | Profesor (Qwen2.5-0.5B) | Ratio estudiante/profesor |
|---|---|---|---|
| Cosmopedia | 0,666 | 0,572 | 1,16x |
| FineWeb-Edu | 1,078 | 0,835 | 1,29x |
| WikiText (fuera de dominio) | 1,270 | 0,905 | 1,40x |

Benchmarks zero-shot con 1.000 ejemplos cada uno (ruido aproximado de +/-1,5 puntos):

| Benchmark | Base | Chat (tras SFT) | Azar |
|---|---|---|---|
| ARC-Easy (acc_norm) | 45,1 | 41,9 | 25 |
| SciQ (acc) | 67,4 | 62,0 | 25 |
| HellaSwag (acc_norm) | 30,6 | 29,6 | 25 |
| LAMBADA (acc) | 23,0 | 16,3 | ~0 |

Comparacion con el gemelo sin profesor (misma arquitectura, datos, semilla, optimizador y pasos):

| Metrica | Destilado (este modelo) | Sin profesor |
|---|---|---|
| Bits por byte: Cosmopedia / FineWeb-Edu / WikiText | 0,666 / 1,078 / 1,270 | 0,655 / 1,117 / 1,325 |
| ARC-Easy / SciQ / HellaSwag / LAMBADA (base) | 45,1 / 67,4 / 30,6 / 23,0 | 42,8 / 62,8 / 28,4 / 20,9 |
| GPU-horas T4 de preentrenamiento | 60,5 | 20,0 |

El profesor aporta ventaja sobre todo en texto fuera de la mezcla de entrenamiento y supera al control en los cuatro benchmarks, aunque solo la diferencia en SciQ supera claramente el ruido. El coste es aproximadamente el triple de computo. Los resultados corresponden a una sola ejecucion por rama.

## Requisitos de hardware
- VRAM estimada para inferencia: menos de 1 GB en fp16 (99 MB de pesos mas cache KV de 9 KB por token); en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: el modelo se entreno en 2x Tesla T4; para inferencia basta una T4, una GTX 1650, una RTX 3050 o incluso CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier integrada con suficiente memoria compartida.
- Opciones de despliegue: al ser una arquitectura PyTorch personalizada no carga con `AutoModel.from_pretrained` ni con vLLM, llama.cpp, Ollama o TGI de forma directa; el autor proporciona `chat.py` y el paquete `hybrid50m/` para inferencia nativa en CPU o GPU.
- Latencia y throughput: aproximadamente 20-30 tokens por segundo en CPU con salida en streaming; no se documentan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Distil_50M_SLM | 51,5M | 512 | Apache 2.0 | Destilado de Qwen2.5-0.5B; arquitectura custom; solo ingles |
| Qwen2.5-0.5B | ~500M | 32.768 | Apache 2.0 | Profesor del modelo; mucho mayor, contexto 64x superior, soporte amplio en ecosistema |
| distil-50m-no-teacher | 51,5M | 512 | Apache 2.0 | Gemelo de control sin profesor; 3x menos computo, ligeramente peor fuera de dominio |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Alternativa pequena de HuggingFaceTB con contexto 4x mayor y ecosistema de despliegue estandar |

No se dispone de resultados de benchmarks de SmolLM-135M en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento entre ambos no esta disponible.

## Limitaciones y advertencias
- Fiabilidad factual muy baja: el autor advierte que responde con el estilo correcto pero inventa detalles con frecuencia (por ejemplo, explico la lluvia como "actividad tectonica").
- Incapacidad para la aritmetica: no realiza calculos numericos de forma fiable.
- Contexto muy limitado: 512 tokens restringen conversaciones multi-turno y documentos largos.
- Solo ingles: no hay soporte multilingue documentado.
- El ajuste de instrucciones degrada los benchmarks (ARC-Easy de 45,1 a 41,9; LAMBADA de 23,0 a 16,3), por lo que las cifras de referencia deben citarse sobre el modelo base.
- Compatibilidad limitada: no funciona con `AutoModel`, ni con el widget de inferencia alojado, ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI).
- Resultados experimentales con una sola ejecucion por rama: las diferencias pequenas frente al control deben interpretarse como indicativas.
- Sesgos: al entrenarse sobre Cosmopedia v2 y FineWeb-Edu, puede heredar sesgos de esos corpus; no se documenta ninguna evaluacion de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la calidad factual hace desaconsejable su uso en produccion para tareas criticas sin verificacion humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/adyaanahmed/Distil_50M_SLM
- Gemelo de control sin profesor: https://huggingface.co/adyaanahmed/distil-50m-no-teacher
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset Cosmopedia v2 (HuggingFaceTB/smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
