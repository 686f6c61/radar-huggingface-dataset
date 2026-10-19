# BeardedMonster/SabiBERTa-135M-masakhaner2-fon

## Resumen

SabiBERTa-135M-masakhaner2-fon es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por fine-tuning del modelo `BeardedMonster/SabiBERTa-135M`, un encoder de la familia ModernBERT de 135.883.017 parámetros. Lo publica el usuario BeardedMonster dentro de su proyecto SabiBERTa, orientado a lenguas africanas, y está entrenado sobre el corpus MasakhaNER 2.0 para el idioma fon (fon gbe), hablado principalmente en Benín y Togo.

El modelo resuelve una tarea muy concreta: etiquetar secuencias de texto en fon con las categorías de entidad del benchmark MasakhaNER 2.0 (persona, organización, localización, fecha), devolviendo etiquetas directamente decodificables porque el `id2label` está configurado en el checkpoint. Su relevancia es la de cualquier modelo de PNL para lenguas de bajos recursos: permite extraer información estructurada de texto en fon sin depender de modelos multilingües de gran tamaño, y con un coste de inferencia muy bajo (0,5 GB de pesos en el repositorio).

El dato que acompaña a la publicación es un `span_f1` medio de 0,7997 sobre el protocolo fon, obtenido con 50 épocas, learning rate 5e-5, batch size 32 y longitud máxima de 256 tokens. El propio autor advierte que se trata de una única ejecución y que las diferencias pequeñas frente a las baselines publicadas deben interpretarse como ruido. El modelo no declara licencia propia y remite a la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional, etiqueta `modernbert` en el repositorio) |
| Parámetros totales | 135.883.017 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información publicada; el fine-tuning se realizó con longitud máxima de 256 tokens |
| Tipos de cuantización | no disponible; solo se publican pesos en `safetensors` (el repo ocupa 0,5 GB, consistente con fp32) |
| Idiomas soportados | fon (código `fon`) |
| Licencia | no disponible; la model card remite a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |

Otros datos: tarea `token-classification`, 1 idioma en el entrenamiento, 0 descargas y 0 likes en el momento de la consulta, repositorio creado el 2026-10-18 y actualizado el mismo día.

## Arquitectura y entrenamiento

La arquitectura de partida es ModernBERT, un encoder transformer bidireccional con las optimizaciones propias de esa familia (posicional rotatorio, atención alternada local/global y kernels eficientes), del que este checkpoint hereda los 135,9 millones de parámetros. Sobre esa base se añade una cabeza de clasificación de tokens para NER. El fine-tuning se ejecutó sobre el corpus MasakhaNER 2.0, protocolo fon, con un único idioma en el conjunto de entrenamiento y los hiperparámetros ya citados: 50 épocas, lr 5e-5, batch 32, `max_length` 256.

No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset de preentrenamiento, ni si hubo etapas de RLHF/DPO (poco habituales, por otra parte, en un encoder de clasificación). La model card indica que el checkpoint lo ha producido el arnés de evaluación del proyecto, que reproduce las baselines publicadas de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1, de modo que las cifras están calibradas y no son ad hoc. También advierte que los resultados provienen de una sola ejecución, mientras que los artículos de referencia promedian cinco, por lo que las diferencias pequeñas no son significativas.

## Capacidades

- Reconocimiento de entidades nombradas en texto en fon: personas, organizaciones, localizaciones y fechas según el esquema de MasakhaNER 2.0.
- Clasificación de tokens a nivel de span, con `id2label` configurado para que la salida se decodifique directamente a nombres de etiqueta sin postprocesado manual.
- Extracción de información estructurada a partir de texto no estructurado en una lengua de bajos recursos.
- Etiquetado por token con ventana de 256 tokens, adecuada para frases y párrafos cortos, no para documentos largos sin troceado previo.
- No soporta tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio: es un encoder discriminativo, no un modelo generativo.
- Capacidad multilingüe: limitada al fon; no se declaran otros idiomas en la model card ni en los metadatos.
- Integración directa con la API de Hugging Face (`AutoTokenizer` + `AutoModelForTokenClassification`), lo que facilita su uso en pipelines de `transformers`.

## Casos de uso

- Anotación asistida de corpus en fon: preetiquetar textos con entidades y revisar manualmente en herramientas como Label Studio o Argilla, reduciendo el coste de construir corpus NER anotados para una lengua con pocos recursos.
- Extracción de entidades en prensa y redes sociales en fon: detectar personas y organizaciones mencionadas en publicaciones para alimentar bases de datos de seguimiento informativo.
- Enriquecimiento de índices de búsqueda: etiquetar documentos en fon con entidades para permitir búsquedas filtradas por persona, lugar u organización en una biblioteca digital o archivo.
- Investigación en PNL de bajos recursos: servir de punto de partida o de baseline para experimentos de transferencia entre lenguas africanas sobre MasakhaNER 2.0, dado que el autor documenta la calibración del arnés de evaluación.
- Preservación digital y humanidades: estructurar colecciones de textos en fon (transcripciones, documentos históricos, literatura oral) extrayendo menciones de lugares y personas para su catalogación.
- Análisis de contenido administrativo o sanitario: localizar menciones de localidades y organizaciones en comunicados traducidos o redactados en fon, siempre con revisión humana por la tasa de error esperada.
- Docencia y materiales educativos: generar ejemplos etiquetados y ejercicios de anotación para formación en lingüística computacional aplicada a lenguas gbe.
- Componente en pipelines de `transformers` para procesamiento por lotes en CPU: al ser un modelo de 135,9 M de parámetros, puede ejecutarse en servidores sin GPU para volúmenes moderados.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| MasakhaNER 2.0 (fon) | span_f1 (media) | 0,7997 |
| MasakhaNER 2.0 (fon) | epochs / lr / batch / max_length | 50 / 5e-5 / 32 / 256 |

El desglose por idioma está en el `metrics.json` del repositorio. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de comparación numérica con otras baselines de MasakhaNER 2.0; el autor solo indica que el arnés reproduce las baselines publicadas con una tolerancia de aproximadamente 0,25 F1 y que la cifra procede de una única ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 545 MB en fp32, unos 272 MB en fp16 y unos 136 MB en int8 (cálculo a partir de los 135,9 M de parámetros; no son cifras medidas publicadas).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU perfectamente viable para lotes moderados; el cuello de botella será la tokenización y el throughput del host, no la memoria.
- GPU de centro de datos (A100, H100, L40S) innecesarias para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, exportación a ONNX Runtime, Text Embeddings Inference (TEI) en modo clasificación, o `optimum` para quantización dinámica.
- vLLM y llama.cpp no aplican de forma nativa: vLLM está orientado a generación y llama.cpp requiere pesos en GGUF, que no se publican.
- Latencia y throughput medidos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-fon | 135,9 M | no disponible (entrenado a 256) | NER en fon | no disponible (remite al base) | Hugging Face |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 tokens | encoder multilingüe, ajustable a NER | Apache 2.0 | Hugging Face |
| XLM-R base | 278 M | 512 tokens | encoder multilingüe, ajustable a NER | MIT | Hugging Face |
| SabiBERTa-135M (modelo base) | 135,9 M | no disponible | encoder de lenguas africanas | no disponible | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible: no se han publicado en la información proporcionada resultados de mBERT o XLM-R sobre el protocolo fon de MasakhaNER 2.0 junto a este checkpoint. Las cifras de parámetros, contexto y licencia de mBERT y XLM-R proceden de conocimiento público general, no de la búsqueda realizada.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica explícitamente que la licencia y los términos del modelo base `BeardedMonster/SabiBERTa-135M` rigen cualquier uso derivado, por lo que hay que verificar ese repositorio antes de un uso comercial.
- Resultado de una sola ejecución: el autor advierte que las baselines de referencia promedian cinco ejecuciones, así que diferencias por debajo de ~0,25 F1 no deben interpretarse como mejoras reales.
- Ventana de 256 tokens: los documentos largos requieren troceado con solapamiento, lo que puede partir entidades y degradar el `span_f1` en producción.
- Cobertura monolingüe: solo fon; no se declara transferencia a otras lenguas gbe ni a texto con mezcla de idiomas.
- Variación ortográfica: el fon tiene convenciones de escritura y diacríticos variables, y no se documenta en la model card cómo se normalizó el texto de entrenamiento.
- Riesgo de alucinación estructural: al ser un clasificador, no genera texto libre, pero puede asignar etiquetas de entidad a tokens que no lo son, especialmente en dominios alejados del corpus de noticias de MasakhaNER 2.0.
- Sin datos sobre sesgos: no se publica ningún análisis de sesgo por género, etnia o geografía en las entidades detectadas.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni reportes de terceros.
- Fecha de creación anómala en los metadatos (2026-10-18); conviene contrastarla con el historial de commits antes de citar el checkpoint.
- No es un modelo generativo: no admite instrucciones, tool calling ni razonamiento; cualquier caso de uso conversacional requiere otro modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-fon
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Repositorio MasakhaNER (Masakhane NLP): https://github.com/masakhane-io/masakhane-ner
- Artículo MasakhaNER 2.0 (Adelani et al.): https://arxiv.org/abs/2210.12391
- Perfil del autor en Hugging Face: https://huggingface.co/BeardedMonster

Los enlaces al artículo y al repositorio de MasakhaNER son referencias generales del benchmark y no aparecían en los resultados de búsqueda proporcionados.
