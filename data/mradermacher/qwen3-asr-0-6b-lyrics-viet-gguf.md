# mradermacher/Qwen3-ASR-0.6B-Lyrics-Viet-GGUF

## Resumen

Qwen3-ASR-0.6B-Lyrics-Viet-GGUF es una cuantizacion estatica en formato GGUF del modelo sunbv56/Qwen3-ASR-0.6B-Lyrics-Viet, un ajuste fino de Qwen3-ASR-0.6B especializado en el reconocimiento automatico de voz (ASR) de letras de canciones en vietnamita. El modelo original parte de la familia Qwen3-ASR de Alibaba, con 596.049.920 parametros totales (aproximadamente 0,6 mil millones), y ha sido reentrenado por el usuario sunbv56 sobre un conjunto de datos propio de canciones vietnamitas (`sunbv56/song_dataset_training_20s_cleaned`). La cuantizacion la firma mradermacher, autor habitual de versiones GGUF de modelos en HuggingFace.

El interes de esta ficha reside en que combina dos nichos muy concretos: por un lado, el reconocimiento de voz aplicado a letras cantadas, un dominio con caracteristicas acusticas muy distintas al habla conversacional (musicalidad, alargamiento de vocales, ruido instrumental de fondo); por otro, la adaptacion al vietnamita, un idioma tonal con seis tonos que complica enormemente la transcripcion automatica. El resultado es un modelo pequeno, ligero y desplegable en hardware modesto.

La relevancia practica es la de un modelo de nicho listo para produccion local: con cuantizaciones que van desde 0,4 GB (Q2_K) hasta 1,3 GB (f16), cabe en cualquier GPU consumer e incluso en CPU, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-ASR-0.6B, ajuste fino para ASR de letras) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-ASR-0.6B, un modelo de reconocimiento automatico de voz de la familia Qwen3 de Alibaba, con arquitectura transformer encoder-decoder orientada a la transcripcion de audio a texto. Sobre esa base, el autor sunbv56 realizo un ajuste fino supervisado utilizando el dataset `sunbv56/song_dataset_training_20s_cleaned`, compuesto por segmentos de audio de canciones de 20 segundos con sus transcripciones correspondientes, limpiados para el entrenamiento. No se dispone de informacion sobre el numero total de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion de mradermacher es de tipo estatico (sin imatrix ni weighted quants, segun indica el propio autor en la model card), con `output_tensor_quantised: 1` y `convert_type: hf`. Se incluyen ademas ficheros `mmproj` (multi-modal projection) en Q8_0 y f16, lo que sugiere que el modelo procesa entrada multimodal (audio) a traves de un proyector separado, coherente con la arquitectura ASR. No se han documentado innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Reconocimiento automatico de voz (ASR) especializado en letras de canciones en vietnamita.
- Transcripcion de audio musical con posible acompanamiento instrumental, gracias al ajuste fino sobre segmentos de 20 segundos de canciones.
- Procesamiento multimodal de audio mediante el proyector `mmproj` incluido en el repositorio.
- Manejo del vietnamita como idioma tonal, con las particularidades de tonos y diacriticos del idioma.
- Inferencia local en formatos GGUF, compatible con llama.cpp y derivados.
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso; el modelo esta orientado exclusivamente a transcripcion.

## Casos de uso

- Generacion automatica de letras sincronizadas para plataformas de karaoke: el modelo transcribe segmentos de 20 segundos de canciones vietnamitas, lo que permite alinear letra y audio para servicios de karaoke o subtitulado musical.
- Catalogacion y busqueda de musica: transcripcion masiva de un catalogo de canciones vietnamitas para indexar por letra y habilitar busqueda textual sobre audio.
- Moderacion de contenido musical: deteccion de letras con contenido inapropiado en plataformas de streaming o UGC, transcribiendo automaticamente las pistas subidas por usuarios.
- Investigacion en musicologia computacional: analisis de corpus de canciones vietnamitas para estudiar patrones linguisticos, metricos o tematicos a partir de transcripciones automaticas.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos de letras para videoclips y contenido musical en vietnamita.
- Prototipado rapido en local: al caber en cuantizaciones de 0,4-0,5 GB, permite experimentar en un portatil o en CPU sin GPU dedicada, ideal para validar pipelines de ASR musical antes de escalar.
- Creacion de datasets de letras anotadas: uso del modelo como etiquetador automatico para pre-anotar grandes volumenes de audio que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB segun cuantizacion (Q4_K_M ~0,5 GB, Q8_0 ~0,7 GB, f16 ~1,3 GB), mas el proyector multimodal (0,3-0,5 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI). No se indica soporte explicito de vLLM o TGI para esta cuantizacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano (0,6 B), se espera una latencia baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Lyrics-Viet (este, GGUF) | ~0,6 B | no disponible | vi | Apache 2.0 | GGUF | ASR especializado en letras de canciones vietnamitas |
| Qwen3-ASR-0.6B (base) | ~0,6 B | no disponible | multilingue | Apache 2.0 | safetensors | ASR generico de Alibaba, sin especializacion musical |
| Whisper small (OpenAI) | ~244 M | 30 s de audio | multilingue (incluye vi) | MIT | safetensors, GGUF | ASR generico, no especializado en letras cantadas |
| Whisper medium (OpenAI) | ~769 M | 30 s de audio | multilingue | MIT | safetensors, GGUF | Mayor precision general, mas pesado |

La comparativa se limita a modelos de ASR de tamano similar; no se dispone de datos de rendimiento comparativo publicados para este ajuste fino concreto.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para letras de canciones en vietnamita; su rendimiento en habla conversacional, otros idiomas o audio no musical no esta garantizado y probablemente sea inferior al de modelos ASR genericos.
- Riesgo de alucinacion: como todo modelo de transcripcion, puede generar texto plausible pero incorrecto, especialmente con audio de baja calidad, instrumentacion densa o voces distorsionadas.
- Sesgos: el dataset de entrenamiento (`song_dataset_training_20s_cleaned`) puede estar sesgado hacia un genero musical, epoca o estilo vocal concreto, lo que limitaria la generalizacion.
- Limitaciones de contexto: no se ha publicado la longitud de contexto ni la duracion maxima de audio procesable; los segmentos de entrenamiento eran de 20 segundos, lo que sugiere que audios mas largos requeriran troceado.
- Idioma: solo vietnamita; no se debe esperar soporte de otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del modelo base original y del dataset, no documentadas en detalle en la informacion disponible.
- Cuantizaciones estaticas: el autor indica que no hay quants con imatrix/weighted, por lo que las versiones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision de transcripcion.
- Para produccion: validar con un conjunto de prueba propio antes de desplegar, dado que no hay benchmarks publicados.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-Lyrics-Viet-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/sunbv56/Qwen3-ASR-0.6B-Lyrics-Viet)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sunbv56/song_dataset_training_20s_cleaned)
- [Pagina de resumen de quants del autor](https://hf.tst.eu/model#Qwen3-ASR-0.6B-Lyrics-Viet-GGUF)
- [Guia de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Solicitudes de cuantizacion de mradermacher](https://huggingface.co/mradermacher/model_requests)
