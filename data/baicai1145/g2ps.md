# baicai1145/g2pS

## Resumen

g2pS es un conjunto de tres modelos ligeros para la desambiguación de pronunciación (G2P, *grapheme-to-phoneme*) de caracteres polifónicos del mandarín. Lo desarrolla el usuario baicai1145 y se distribuye en Hugging Face junto con el código y el pipeline de entrenamiento en un repositorio de GitHub. El problema que resuelve es concreto: en chino, un mismo carácter puede tener varias lecturas (por ejemplo, 行 como *hang2* o *xing2*) y la elección depende del contexto; g2pS devuelve el pinyin únicamente de los caracteres polifónicos, actuando como desambiguador y no como silabario completo.

La propuesta técnica es una destilación de un profesor BERT-base (102M parámetros) afinado, hacia tres estudiantes transformer a nivel de carácter de 16,0M, 4,9M y 1,1M de parámetros. Los pesos se publican en ONNX (fp32 e int8) y en checkpoints PyTorch, con un runtime autocontenido que solo requiere `onnxruntime` y `numpy` en inferencia. El modelo nano ocupa 1,4 MB en int8 y tarda unos 2,4 ms por frase en CPU x86, lo que lo sitúa en el rango de Raspberry Pi y CPUs móviles.

Es relevante ahora porque cubre un caso de uso de producción muy específico (TTS, enseñanza de chino, corrección de pinyin) con un coste computacional mínimo y una precisión a nivel de frase del 98,4-98,5 % en el conjunto de test CPP, frente al 98,70 % del profesor BERT de 102M. La licencia declarada en la model card es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter con RoPE, *conv stem*, embedding factorizado y tabla de sesgo de etiqueta por carácter; destilado de BERT-base |
| Parametros totales | 16,0M (small) / 4,9M (tiny) / 1,1M (nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con frases de ~32 caracteres según los ejemplos de latencia) |
| Tipos de cuantizacion | ONNX fp32 e int8; checkpoints PyTorch sin cuantizar |
| Idiomas soportados | Mandarín (chino); no se declaran otros idiomas |
| Licencia | Apache-2.0 (según la model card) |
| Formato de pesos | ONNX (fp32 e int8) y PyTorch (`.pt`) |

## Arquitectura y entrenamiento

Los estudiantes son transformers a nivel de carácter con codificación posicional rotatoria (RoPE), un *conv stem* inicial, embedding factorizado y una tabla de sesgo de etiqueta por carácter que incorpora las lecturas candidatas de cada polifón. El entrenamiento combina destilación de logits desde el profesor BERT-base con etiquetas duras, regularización R-Drop, una tarea auxiliar de etiquetado POS y, en las variantes tiny y nano, una cabeza de lectura factorizada por tono y sílaba. Las dimensiones son: small con 6 capas y 384 dimensiones; tiny con 5 capas y 256 dimensiones más sesgo de carácter de bajo rango; nano con 6 capas y 96 dimensiones, con compartición de pesos (12 capas efectivas) y lectura factorizada por tono.

Los datos de entrenamiento suman aproximadamente 1M de posiciones con etiqueta gold (corpus CPP y CVTE, unas 916k frases), unos 9,5M de posiciones pseudo-etiquetadas por el profesor sobre un corpus multdominio de 4,3M de frases (Wikipedia-zh, noticias LCSTS, QA médica, diálogo y chino clásico) y etiquetas verificadas por LLM para caracteres de extensión de diccionario. La tabla de candidatos cubre 852 caracteres polifónicos, fusionada de CVTE/CEDICT y diccionarios Xinhua, con normalización de ü y convención de tono ligero.

## Capacidades

- Desambiguación de pronunciación de caracteres polifónicos del mandarín a partir del contexto de la frase.
- Salida restringida a los caracteres polifónicos: devuelve pinyin solo para ellos y deja el resto como `None` para que se rellene con un diccionario externo (por ejemplo, `pypinyin`).
- Tabla de candidatos de 852 caracteres polifónicos con lecturas normalizadas.
- Inferencia sin `torch` ni `transformers`: solo `onnxruntime` y `numpy`.
- Ejecución en CPU de bajo consumo (Raspberry Pi, CPUs móviles) gracias a los modelos int8 de 1,4-16,3 MB.
- Checkpoints PyTorch cargables con la definición de arquitectura incluida en el repositorio.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Síntesis de voz (TTS) en mandarín: g2pS resuelve la lectura de caracteres polifónicos antes de pasar el texto al sintetizador, lo que evita errores de pronunciación en palabras como 银行 (*hang2*) frente a 行走 (*xing2*); su latencia de 2,4-6,2 ms por frase no añade cuello de botella al pipeline.
- Enseñanza de chino como lengua extranjera: integrado en una aplicación que muestre el pinyin correcto de cada carácter según la frase, usando el modelo nano en el dispositivo del estudiante sin conexión.
- Corrección de pinyin en herramientas de edición o subtitulado: el modelo actúa como desambiguador sobre el texto y se completa la transcripción con `pypinyin`, reduciendo los errores en caracteres de lectura múltiple.
- Procesamiento por lotes de corpus en servidores: el modelo small (16,0M, 16,3 MB int8) ofrece el mejor rendimiento en la cola larga (`avg.pp` 95,11) y puede procesar grandes volúmenes de frases en CPU sin GPU.
- Sistemas embebidos y dispositivos IoT con reconocimiento de voz en chino: el modelo nano (1,4 MB int8) cabe en memoria muy limitada y se ejecuta con `onnxruntime` en ARM.
- Preprocesado en pipelines de NLP en chino: normalizar la pronunciación antes de tareas posteriores (búsqueda fonética, alineamiento, conversión texto-habla) con un coste mínimo de integración al no requerir `torch`.

## Benchmarks y rendimiento

Evaluación sobre el *split* de test de CPP (8.896 frases, 8.935 posiciones etiquetadas). `avg.pp` es la precisión macro-promediada por carácter sobre todos los polifónicos (sensibilidad a la cola larga).

| Modelo | Parametros | Precision | avg.pp |
|---|---|---|---|
| Baseline BERT publicado | 102M | 86,09 | 76,58 |
| Profesor BERT (g2pS) | 102M | 98,70 | 96,13 |
| g2pS-small | 16,0M | 98,49 | 95,11 |
| g2pS-tiny | 4,9M | 98,51 | 94,90 |
| g2pS-nano | 1,1M | 98,41 | 94,30 |

Latencia declarada (ONNX Runtime CPU, batch 1, frase de ~32 caracteres): small ~6,2 ms, tiny ~3,6 ms, nano ~2,4 ms. El baseline BERT publicado se evaluó zero-shot sobre este *split* y con desviación de dominio (no fue entrenado con CPP/CVTE).

## Requisitos de hardware

- VRAM: no aplica; la inferencia está pensada para CPU. El modelo int8 más grande ocupa 16,3 MB en disco y una fracción similar en memoria.
- GPU: no necesaria. Cualquier GPU con `onnxruntime` puede ejecutarlo, pero no aporta ventaja frente a CPU para estos tamaños.
- Cabe en cualquier GPU de consumo e incluso en Raspberry Pi y CPUs móviles (caso de uso declarado del modelo nano).
- Despliegue: `onnxruntime` (runtime incluido en el repositorio, `g2ps/runtime.py`), CLI `python -m g2ps.runtime models/tiny`, y checkpoints PyTorch mediante `examples/load_torch.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2,4-6,2 ms por frase de ~32 caracteres en CPU x86 según la variante; el *throughput* agregado no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Precision (CPP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g2pS-small | 16,0M | G2P mandarín | 98,49 | Apache-2.0 | Hugging Face + GitHub |
| g2pS-tiny | 4,9M | G2P mandarín | 98,51 | Apache-2.0 | Hugging Face + GitHub |
| g2pS-nano | 1,1M | G2P mandarín | 98,41 | Apache-2.0 | Hugging Face + GitHub |
| Profesor BERT (g2pS) | 102M | G2P mandarín | 98,70 | Apache-2.0 | Incluido en el proyecto |
| Baseline BERT publicado | 102M | G2P mandarín | 86,09 (zero-shot) | no disponible | Referencia citada en la model card |

No se dispone de datos de otros modelos G2P comparables en la información proporcionada.

## Limitaciones y advertencias

- Alrededor del 60 % de los errores restantes requieren conocimiento del mundo (nombres propios transliterados, lecturas clásicas, terminología rara) que no es inferible del contexto; el autor propone una capa de posprocesado con anulación por diccionario (CEDICT y 审音表) como remedio.
- El modelo solo devuelve pinyin de caracteres polifónicos; para la transcripción completa de la frase hay que combinarlo con un diccionario externo.
- La cobertura se limita a los 852 caracteres polifónicos de la tabla de candidatos; caracteres fuera de esa tabla no se desambiguan.
- Solo soporta mandarín; no se declaran otros idiomas.
- No se especifica la longitud máxima de contexto soportada; los ejemplos y latencias corresponden a frases de ~32 caracteres.
- La licencia Apache-2.0 figura en la model card, pero el campo de licencia de Hugging Face no está cumplimentado; conviene verificar el fichero LICENSE del repositorio antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento en producción.
- Riesgo de alucinación en lecturas: al ser un clasificador sobre una tabla cerrada de candidatos, el error se manifiesta como elección incorrecta de lectura, no como texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baicai1145/g2pS
- Repositorio de código y pipeline de entrenamiento: https://github.com/baicai-1145/g2pS
- Perfil del autor en Hugging Face: https://huggingface.co/baicai1145
- Estadísticas del autor en OpenModelStats: https://openmodelstats.com/owners/baicai1145
- Corpus CPP: https://github.com/NeRFox/CPP
