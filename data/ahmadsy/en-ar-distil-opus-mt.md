# ahmadsy/en-ar-distil-opus-mt

## Resumen

`ahmadsy/en-ar-distil-opus-mt` es un modelo de traducción automática inglés-arabe publicado por el usuario ahmadsy en Hugging Face. Se trata de un derivado destilado del modelo base `Helsinki-NLP/opus-mt-en-ar` (76,8 M de parámetros, licencia Apache-2.0), que ha sido afinado mediante destilación a nivel de secuencia a partir de un profesor de mayor tamaño, `Helsinki-NLP/opus-mt-tc-big-en-ar` (241,17 M de parámetros, licencia CC-BY-4.0). El objetivo declarado es ofrecer la huella y la velocidad de un modelo pequeño (unos 84 MB en int8) con una calidad de traducción superior a la del estudiante original.

La arquitectura es Marian, un transformer encoder-decoder con 6 capas en cada bloque, `d_model` de 512, embeddings atados y un vocabulario de 62.802 tokens. El modelo está pensado para inferencia en CPU: el autor reporta una latencia p50 de 124,8 ms por frase con 8 hilos de CPU en su build int8 de CTranslate2, con una mejora medida de +2,08 chrF++, +2,58 BLEU y +2,22 spBLEU sobre el modelo base en FLORES-200 devtest.

Su relevancia práctica radica en que permite desplegar traducción EN-AR de calidad razonable en entornos sin GPU, con un artefacto de menos de 100 MB y licencia CC-BY-4.0 que autoriza uso comercial con atribución. No obstante, el propio autor advierte de que no compite con el profesor de 241 M, que sigue puntuando 3,8 chrF++ por encima a costa de 3,0 veces más tamaño y aproximadamente 2,2 veces más latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), 6 capas encoder + 6 capas decoder, d_model 512, embeddings atados |
| Parametros totales | 76.817.408 (recuento Marian); 76.355.922 valores tensoriales en safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con truncación a 128 tokens; `max_length=128` en el ejemplo de uso) |
| Tipos de cuantizacion | fp32 (safetensors), int8 (CTranslate2 en `ct2-int8/`) |
| Idiomas soportados | inglés (en) y árabe (ar); traducción unidireccional EN→AR |
| Licencia | CC-BY-4.0 (con obligaciones de atribución; el modelo base es Apache-2.0) |
| Formato de pesos | safetensors (transformers) y CTranslate2 int8 |
| Vocabulario | 62.802 tokens (SentencePiece, embeddings atados) |
| Tamano del repo | 0,4 GB |
| Tamano del artefacto int8 | 84,3 MB (78,4 MB de pesos + tokenizer) |
| Modelo base (estudiante) | Helsinki-NLP/opus-mt-en-ar (Apache-2.0) |
| Modelo profesor | Helsinki-NLP/opus-mt-tc-big-en-ar, 241,17 M parametros (CC-BY-4.0) |
| Dataset de entrenamiento | Helsinki-NLP/opus-100 (119.991 frases EN traducidas por el profesor) |

## Arquitectura y entrenamiento

El modelo es un Marian transformer estándar con 6 capas de encoder y 6 de decoder, dimensión de modelo 512, embeddings atados y un vocabulario SentencePiece de 62.802 tokens. La innovación técnica no reside en la arquitectura, sino en el procedimiento de destilación: como el profesor y el estudiante usan vocabularios SentencePiece distintos (61.247 frente a 62.802 tokens), sus espacios de logits no están alineados, por lo que se optó por destilación a nivel de secuencia (texto) en lugar de a nivel de logits. El autor cita como referencia SLKD (arXiv 1912.03334), Zipporah (ACL D17-1319) y Distil-Whisper (arXiv 2311.00430).

El proceso concreto fue el siguiente: se tomaron 119.991 frases en inglés de OPUS-100 (de un pool filtrado de 939.353 pares, muestreado con semilla 13 y truncado a 128 tokens), se tradujeron de forma greedy con el profesor (batch 64, 35,15 frases/s, 57 minutos en una Quadro RTX 3000) y se afinó el estudiante sobre esas salidas durante 2 épocas. El entrenamiento totalizó 7.500 pasos de optimizador con batch efectivo 32 (16 × 2 de acumulación), learning rate 3e-5 con cosine y 5 % de warmup, weight decay 0,01, autocast fp16, una GPU y 73 minutos. No se menciona uso de RLHF ni DPO.

## Capacidades

- Traducción automática unidireccional inglés → árabe, con etiqueta de idioma destino obligatoria (`>>ara<<`) al inicio del texto fuente.
- Generación de texto seq2seq mediante `MarianMTModel.generate` con decodificación greedy o beam search.
- Inferencia en CPU con CTranslate2 en int8, con latencias de decenas o cientos de milisegundos por frase.
- Manejo de frases de hasta 128 tokens de entrada en el régimen de entrenamiento (truncación documentada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas del par EN-AR; no es un modelo multilingüe general.
- No dispone de modo conversacional ni de instrucciones; es un traductor puro.

## Casos de uso

- Traducción de documentación técnica EN→AR en pipelines por lotes: el modelo procesa frases de forma independiente y cabe en CPU, por lo que puede integrarse en scripts de preprocesado o en un job nocturno que traduzca miles de cadenas sin necesidad de GPU.
- Localización de interfaces y textos de producto: con 84 MB en int8 y latencia p50 de 124,8 ms por frase, es viable traducir catálogos de cadenas cortas en un servidor modesto o incluso en un portátil.
- Servicio de traducción bajo demanda en entornos edge o sin GPU: el build CTranslate2 int8 con 8 hilos de CPU ofrece un throughput adecuado para APIs de baja concurrencia donde no se justifica alquilar una GPU.
- Traducción de correos y comunicaciones internas en herramientas ofimáticas: el tamaño reducido permite empaquetar el modelo dentro de una aplicación de escritorio o un complemento sin dependencias de red.
- Preprocesado de corpus para investigación en PLN árabe: el modelo puede generar traducciones EN→AR de referencia rápida para alinear datos o crear conjuntos de evaluación internos, con la advertencia de que no sustituye a un traductor humano en datos de oro.
- Prototipado y evaluación de sistemas de traducción: al ser un derivado destilado con métricas publicadas frente a su base y su profesor, sirve como línea base reproducible para comparar técnicas de destilación o de cuantización en el par EN-AR.
- Traducción de titulares y resúmenes en agregadores de noticias: la baja latencia y el tamaño permiten traducir flujos RSS en tiempo casi real en un contenedor pequeño.

## Benchmarks y rendimiento

Evaluación sobre FLORES-200 devtest (1.012 frases en inglés), build int8 de CTranslate2, CPU con 8 hilos y un proceso, medida el 2026-11-16 en la misma sesión y máquina para ambas filas:

| Metrica | opus-mt-en-ar base int8 | en-ar-distil-opus-mt int8 | Delta |
|---|---|---|---|
| chrF++ (word_order 2) | 51,221 | 53,302 | +2,081 |
| BLEU (13a) | 22,635 | 25,219 | +2,584 |
| spBLEU (tokenizer flores200) | 36,269 | 38,490 | +2,221 |
| Tamano del artefacto | 84,1 MB | 84,3 MB | +0,2 MB |
| Latencia p50, batch 1 | 130,2 ms | 124,8 ms | −5,4 ms |
| Latencia p90, batch 1 | 199,2 ms | 191,6 ms | −7,6 ms |

Referencia del profesor (misma familia de harness): 57,128 chrF++ / 29,444 BLEU, 250,7 MB y p50 de 279,7 ms. La selección de checkpoint se hizo sobre FLORES-200 dev (997 frases, fp16 greedy), donde chrF++ pasó de 49,967 (paso 0) a 52,552 (mejor, paso 7.500), con un intervalo de confianza del 95 % por bootstrap pareado de +2,585 [2,020; 3,167] y p(delta > 0) = 1,000.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU el build int8 ocupa unos 78,4 MB de pesos y el fp32 en transformers ronda los 300 MB en memoria.
- GPU recomendadas: no se especifican; el autor entrena y evalúa en CPU (Quadro RTX 3000 solo para generar las etiquetas del profesor). Cualquier GPU consumer moderna puede ejecutarlo, pero no aporta ventaja frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU de 8 hilos sin problema.
- Opciones de despliegue: transformers (`MarianMTModel`), CTranslate2 (build int8 incluido en `ct2-int8/`) y el script `inference.py` del repositorio. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: p50 de 124,8 ms y p90 de 191,6 ms por frase en CPU de 8 hilos con int8 y batch 1; el profesor tarda 279,7 ms p50 en la misma familia de harness.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (FLORES-200 devtest) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahmadsy/en-ar-distil-opus-mt | 76,8 M | no disponible (entrenado a 128 tokens) | 53,302 chrF++ / 25,219 BLEU | CC-BY-4.0 | Hugging Face, safetensors + CTranslate2 int8 |
| Helsinki-NLP/opus-mt-en-ar (base) | 76,8 M | no disponible | 51,221 chrF++ / 22,635 BLEU | Apache-2.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tc-big-en-ar (profesor) | 241,17 M | no disponible | 57,128 chrF++ / 29,444 BLEU | CC-BY-4.0 | Hugging Face |

El modelo destilado mejora al base en calidad (+2,08 chrF++) con practicamente el mismo tamano y una latencia ligeramente menor, pero queda 3,8 chrF++ por debajo del profesor, que es 3,0 veces mas grande y unas 2,2 veces mas lento. La licencia CC-BY-4.0 es mas permisiva que la del profesor en cuanto a obligaciones, pero exige atribucion.

## Limitaciones y advertencias

- Riesgo de alucinacion y errores de traduccion: es un modelo de 76,8 M parámetros; el autor lo describe explicitamente como «no un giant-killer» y reconoce que el profesor de 241 M sigue siendo superior.
- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse sobre OPUS-100 y salidas del profesor, hereda los sesgos de esos corpus y del modelo profesor.
- Limitaciones de contexto e idioma: solo traduce EN→AR, requiere el prefijo `>>ara<<` y el entrenamiento se truncó a 128 tokens, por lo que frases largas pueden degradarse.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificación con atribución (obligaciones en `ATTRIBUTION.md`, que incluye el aviso Apache-2.0 del base). La licencia del corpus OPUS-100 está declarada como desconocida por su editor, por lo que la licencia de los datos de entrenamiento queda sin resolver según el propio autor.
- Caveat de produccion: la seleccion de checkpoint se hizo sobre FLORES-200 dev y las metricas publicadas sobre devtest, pero ambas son del mismo benchmark; no hay evaluacion en dominios especializados (medico, legal, tecnico).
- El modelo no soporta tool calling, agentes ni conversacion multi-turno; es un traductor puro sin instrucciones.
- Solo 2 descargas y 0 likes en el momento de la ficha; no hay evidencia de adopcion en produccion ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ahmadsy/en-ar-distil-opus-mt
- Modelo base (estudiante): https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
- Modelo profesor: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-ar
- Dataset de entrenamiento: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- Dataset de evaluacion: FLORES-200 (cc-by-sa-4.0), referenciado en la model card
- Paper SLKD: arXiv 1912.03334
- Paper Zipporah: ACL D17-1319
- Paper Distil-Whisper: arXiv 2311.00430
- CTranslate2: https://github.com/OpenNMT/CTranslate2
