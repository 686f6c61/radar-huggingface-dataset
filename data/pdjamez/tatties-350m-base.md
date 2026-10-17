# pdjamez/Tatties-350M-Base

## Resumen

Tatties 350M Base es un modelo de lenguaje decoder-only entrenado desde cero por el usuario pdjamez. Cuenta con 350.439.552 parámetros y una ventana de contexto de 2.048 tokens, y se distribuye como modelo base, sin ajuste de instrucciones ni alineamiento de seguridad. Su arquitectura es compatible con la implementación estándar `LlamaForCausalLM` de Transformers (RMSNorm, RoPE, SwiGLU y atención con consultas agrupadas), aunque no contiene pesos de Meta Llama.

El modelo se entrenó sobre 7.358.808.064 tokens de un subconjunto filtrado de FineWeb-Edu (`sample-100BT`), íntegramente en inglés, con el framework Swift/MLX 0.32.2 sobre Apple Silicon. Su relevancia actual reside en el ámbito de la investigación en modelos pequeños: sirve como punto de partida para experimentos de preentrenamiento continuado, comparación de arquitecturas y estudios de post-entrenamiento en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, compatible con `LlamaForCausalLM` |
| Parametros totales | 350.439.552 (350,4 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No especificados en la model card; pesos publicados en FP32 safetensors, convertibles a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) y MLX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (solo para los archivos del modelo; el texto de entrenamiento no se distribuye y FineWeb-Edu está etiquetado como ODC-By 1.0) |
| Formato de pesos | Safetensors en FP32; se menciona implementación nativa MLX |
| Capas | 20 |
| Ancho oculto | 1.152 |
| Cabezas de atención | 18 |
| Cabezas clave-valor | 3 (GQA) |
| Dimensión de cabeza | 64 |
| Ancho de feed-forward | 3.840 |
| Vocabulario | 20.000 tokens (SentencePiece) |
| Activación | SwiGLU |
| Normalización | RMSNorm, epsilon 1e-5 |
| Codificación posicional | RoPE, theta 10.000 |
| Embeddings | Entrada y salida atados |
| Precisión publicada | FP32 |

## Arquitectura y entrenamiento

Tatties 350M Base es un transformer decoder-only denso con 20 capas, ancho oculto de 1.152, 18 cabezas de atención y 3 cabezas clave-valor (atención con consultas agrupadas), dimensión de cabeza de 64 y ancho de feed-forward de 3.840. Emplea activación SwiGLU, normalización RMSNorm con epsilon 1e-5, codificación posicional RoPE con theta 10.000 y embeddings de entrada y salida atados. El vocabulario es de 20.000 tokens, con un tokenizer SentencePiece entrenado por separado sobre un piloto de FineWeb-Edu-Dedup (`corpus-v3`, SHA-256 `34353c32e8a7c0e8a7f0bb057db4035c5676669d071367d8beb25cc4f1a39f04`). No requiere código personalizado ni `trust_remote_code=True`.

El entrenamiento consistió en predicción causal del siguiente token con secuencias de 2.048 tokens y un batch global de 32.768 tokens. La fase estable terminó en el paso 213.892 (7.008.813.056 tokens) con una tasa de aprendizaje de 3e-4, seguida de un cooldown coseno de 10.681 pasos hasta el paso 224.573 que redujo la tasa a 3e-5. La última validación programada registró una pérdida de 2,73698 nats/token en el paso 224.457, medida 116 actualizaciones antes del checkpoint final. El modelo vio aproximadamente 21 tokens de entrenamiento por parámetro. No hubo RLHF, DPO ni ningún tipo de alineamiento: es un modelo base puro. La semilla fue 42 y el backend Swift/MLX 0.32.2. Los datos proceden de FineWeb-Edu `sample-100BT` (revisión `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`), con filtros de idioma (score >= 0,90), puntuación educativa entera >= 3 y años de crawl 2013-2022, además de deduplicación exacta y aproximada, cribado automático de calidad y riesgo, tope de dominio, descontaminación parcial de benchmarks, particiones deterministas y empaquetado delimitado por EOS. La partición de entrenamiento contiene 12.116.013 documentos y 12.486.676.062 tokens empaquetados; Tatties consumió los primeros 7.358.808.064 tokens del flujo ordenado.

## Capacidades

- Generación de texto en inglés mediante continuación causal: el modelo predice el siguiente token y no sigue instrucciones de forma fiable.
- Razonamiento básico y conocimiento general limitado al corpus FineWeb-Edu, sin ajuste específico para tareas de razonamiento.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- Sin modo de pensamiento (`thinking mode`), visión, audio ni otras modalidades.
- Compatible con el ecosistema Transformers y con despliegue en MLX, lo que facilita su uso en Apple Silicon.
- No incluye capas de alineamiento ni de seguridad, por lo que sus continuaciones reflejan directamente los sesgos y patrones del corpus.

## Casos de uso

- Investigación en modelos pequeños: sirve como punto de partida reproducible para estudiar leyes de escalado y comportamiento de arquitecturas a 350 M de parámetros, con una configuración documentada paso a paso.
- Preentrenamiento continuado: el checkpoint estable se conserva como padre de continuación, lo que permite seguir entrenando con más tokens o con dominios específicos (por ejemplo, textos técnicos o código) sin partir de cero.
- Experimentos de post-entrenamiento: al ser un modelo base sin alineamiento, es adecuado para medir el efecto aislado de SFT, DPO o RLHF sobre una base neutra.
- Evaluación de arquitectura y tokenizer: permite comparar el rendimiento de GQA con 18 cabezas de consulta y 3 de clave-valor, SwiGLU y RoPE frente a otras configuraciones con el mismo presupuesto de cómputo.
- Educación y docencia: su reducido tamaño y la ausencia de código personalizado facilitan ilustrar el funcionamiento interno de un transformer decoder-only en cursos y talleres con hardware modesto.
- Análisis de distribuciones y robustez en modelos base: se pueden estudiar las continuaciones ante prompts sensibles sin capas de alineamiento que enmascaren las tendencias del corpus de entrenamiento.
- Despliegue en Apple Silicon: al haberse entrenado con MLX 0.32.2, es útil para probar pipelines de inferencia MLX en Macs con memoria unificada y comparar rendimiento frente a otras opciones.
- Generación de texto en inglés con fines de investigación: completar prompts y analizar probabilidades condicionales, siempre con supervisión humana, dado que no sigue instrucciones de manera fiable.

## Benchmarks y rendimiento

Resultados publicados para el checkpoint nativo de MLX con cooldown. Las puntuaciones de tareas de elección se recalcularon a partir de las probabilidades condicionales registradas por opción, con normalización por longitud de caracteres, siguiendo la regla de puntuación de Neeps. Estos son benchmarks de desarrollo, no conjuntos de prueba finales vírgenes.

| Benchmark | Ejemplos | Puntuación |
|---|---:|---:|
| ARC-Challenge validation | 299 | 30,77 % |
| ARC-Challenge full test | 1.172 | 28,50 % |
| ARC-Easy validation | 570 | 47,19 % |
| PIQA validation | 1.838 | 64,96 % |
| HellaSwag validation | 10.042 | 38,54 % |
| LAMBADA OpenAI test | 5.153 | 30,97 % |
| BLiMP (pares gramaticales) | 67.000 | 81,19 % |

Las puntuaciones dependen del prompt, el truncado, la regla de puntuación, la precisión y el evaluador. Los archivos de benchmark se han reutilizado en comparaciones del proyecto y la descontaminación registrada no cubre BLiMP ni la prueba completa de ARC-Challenge. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en FP32 (precisión publicada): aproximadamente 1,4 GB solo de pesos; con activaciones y caché KV para 2.048 tokens, el consumo total ronda 1,5-2 GB.
- Inferencia en FP16/BF16: aproximadamente 0,7 GB de pesos y 1-1,5 GB en total.
- Cuantización Q8_0 (GGUF): aproximadamente 0,35-0,4 GB de pesos.
- Cuantización Q4_K_M (GGUF): aproximadamente 0,2-0,3 GB de pesos y 0,5-1 GB en total con el contexto lleno.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, entre otras. También es viable en CPU y en Apple Silicon con memoria unificada.
- Las GPU profesionales (A100, H100, L40S) no son necesarias; se pueden emplear para servir muchas réplicas o lotes grandes.
- Opciones de despliegue: Transformers, text-generation-inference (TGI), vLLM (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints), llama.cpp u Ollama previa conversión a GGUF, y MLX en Apple Silicon.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Tatties 350M Base | 350.439.552 | 2.048 | 7.358.808.064 | Apache-2.0 | HuggingFace (transformers, safetensors, MLX) |
| Neeps 125M Base v0.4-5b | 125.095.680 | no disponible | 5.000.003.584 | no disponible | HuggingFace (rama `v0.4-5b`) |

Neeps 125M Base, del mismo autor, es el comparable directo documentado: comparte la procedencia de datos FineWeb-Edu `sample-100BT` y sirve como referencia de escala inferior. No se dispone de las puntuaciones de benchmarks de Neeps en la información proporcionada, ya que la model card consultada aparece truncada en ese punto. No se incluyen otros modelos comparables con datos verificados en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones, sin alineamiento y sin capas de seguridad: no debe usarse como asistente de usuario sin supervisión.
- Riesgo elevado de alucinación y de generar contenido inexacto, sesgado u ofensivo, heredado del corpus FineWeb-Edu y de la falta de post-entrenamiento.
- Idioma limitado al inglés; no se declara soporte de otras lenguas.
- Ventana de contexto de solo 2.048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Los benchmarks publicados son de desarrollo y no conjuntos de prueba finales vírgenes; además, la descontaminación no cubre BLiMP ni la prueba completa de ARC-Challenge.
- La licencia Apache-2.0 se aplica a los archivos del modelo, no al texto de entrenamiento ni a las páginas de origen de terceros. FineWeb-Edu está etiquetado como ODC-By 1.0 y deriva de Common Crawl, cuyas páginas individuales pueden tener derechos separados.
- El filtrado automático no garantiza que los datos de entrenamiento estén libres de material privado, con derechos de autor, dañino, sesgado o inexacto.
- El paquete de revisión humana no tiene decisiones registradas: no se adjudicaron manualmente la muestra de 2.000 documentos aceptados, las 500 referencias rechazadas ni los 695 aciertos del filtro de credenciales y secretos. El propietario de la publicación aceptó explícitamente este riesgo residual, lo que no constituye una declaración de limpieza legal o de privacidad.
- No se proporciona el texto de entrenamiento con el modelo.
- Para producción, se recomienda evaluar el modelo en el dominio concreto, aplicar filtros de salida y considerar un post-entrenamiento específico.

## Enlaces

- [Modelo en HuggingFace: pdjamez/Tatties-350M-Base](https://huggingface.co/pdjamez/Tatties-350M-Base)
- [Modelo comparable: Neeps 125M Base v0.4-5b](https://huggingface.co/pdjamez/Neeps-125M-Base/tree/v0.4-5b)
- [Dataset FineWeb-Edu en HuggingFace](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- No se han encontrado enlaces adicionales a papers, repositorios o demos en la información proporcionada.
