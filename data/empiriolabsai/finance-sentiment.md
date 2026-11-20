# empiriolabsai/finance-sentiment

## Resumen

Finance Sentiment es un modelo de clasificación de texto especializado en análisis de sentimiento financiero, desarrollado por EmpirioLabs. Clasifica frases de ámbito financiero —titulares de prensa, líneas de informes periódicos, transcripciones de llamadas de resultados o publicaciones de mercado— en tres categorías: `positive`, `negative` o `neutral`, siempre desde la perspectiva del inversor. El modelo parte de `jhu-clsp/mmBERT-base` mediante fine-tuning y cuenta con 307.532.547 parámetros, lo que lo sitúa en la gama de modelos base (encoder-only) manejables en CPU.

Su principal valor diferencial es la cobertura multilingüe: soporta 15 idiomas (inglés, alemán, francés, español, italiano, portugués, neerlandés, polaco, turco, ruso, chino, japonés, coreano, árabe e hindi) con puntuaciones macro-F1 entre 0,851 y 0,928 en los conjuntos de evaluación traducidos, muy por encima de las alternativas monolingües comparadas. Además, mantiene exactamente las mismas etiquetas que `ProsusAI/finbert`, lo que permite sustituir FinBERT por este modelo cambiando únicamente el identificador en el pipeline, sin tocar el código de postprocesado.

La relevancia actual reside en su combinación de licencia Apache 2.0 (uso comercial sin restricciones), disponibilidad de pesos ONNX en precisión completa e int8 (369 MB) para ejecución en navegador y edge mediante transformers.js, y su naturaleza drop-in respecto a FinBERT. Está pensado para monitorización de noticias y filings, dashboards y cribado de activos, no para decisiones autónomas de trading.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.532.547 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación a nivel de frase; se recomienda dividir documentos largos en frases) |
| Tipos de cuantizacion | ONNX en precisión completa e int8 (`onnx/model_quantized.onnx`, 369 MB) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, tr, ru, zh, ja, ko, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/mmBERT-base`, un encoder transformer de la familia ModernBERT orientado a multilingüismo. La tarea es clasificación de secuencias con tres clases de salida (`positive`, `negative`, `neutral`). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no los detalla.

Sí se documenta que el modelo se evaluó contra dos alternativas (mrm8488 y soleimanian) sobre los mismos ítems y que las puntuaciones no inglesas provienen de frases financieras traducidas (399 por idioma). La innovación técnica destacable es la disponibilidad de pesos ONNX cuantizados a int8 con una degradación inferior a 0,005 en macro-F1 respecto a precisión completa en todos los conjuntos evaluados, lo que habilita inferencia en navegador y dispositivos edge.

## Capacidades

- Clasificación de sentimiento financiero a nivel de frase en tres clases: `positive`, `negative`, `neutral`.
- Multilingüismo nativo en 15 idiomas, con etiquetas consistentes entre idiomas.
- Compatibilidad drop-in con el pipeline de FinBERT: mismas etiquetas y salida estándar de `transformers`.
- Ejecución en navegador y Node.js mediante transformers.js con `dtype: "q8"`.
- Inferencia en CPU sin GPU dedicada.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Monitorización de titulares financieros en tiempo real: el modelo clasifica cada titular entrante en un feed de noticias y permite agregar un sentimiento por activo o sector; su velocidad en CPU y su formato ONNX lo hacen adecuado para pipelines de alta frecuencia.
- Análisis de llamadas de resultados y filings: dividiendo la transcripción en frases, se obtiene una curva de sentimiento a lo largo del documento para detectar cambios de tono entre secciones (MD&A, guidance, Q&A).
- Dashboards de sentimiento multilingüe: al cubrir 15 idiomas con etiquetas homogéneas, permite comparar el sentimiento de noticias en distintos mercados (por ejemplo, prensa alemana frente a japonesa) sin modelos separados por idioma.
- Cribado de activos (screening): integrado en un pipeline de scoring que filtre valores con sentimiento negativo persistente en noticias y redes, como señal de alerta previa a revisión humana.
- Sustitución directa de FinBERT en producción: al mantener las mismas etiquetas, un equipo puede migrar cambiando el model id y obtener cobertura multilingüe sin reescribir el postprocesado.
- Aplicaciones web y edge sin backend GPU: mediante transformers.js con `dtype: "q8"` (369 MB), se puede ejecutar la clasificación en el navegador del usuario para herramientas de análisis de noticias o extensiones.
- Análisis de redes sociales financieras: el modelo obtiene 0,852 de macro-F1 en tweets financieros, superior a las alternativas comparadas, lo que lo hace útil para monitorizar foros y redes.

## Benchmarks y rendimiento

Resultados publicados por EmpirioLabs el 2026-11-20. Métrica: macro-F1 sobre las tres etiquetas (mayor es mejor). Todos los modelos respondieron a los mismos ítems. En negrita, la mejor puntuación de cada fila.

| Conjunto de prueba | Finance Sentiment | mrm8488 financial-news | soleimanian financial-roberta-large |
|---|---:|---:|---:|
| Financial PhraseBank, todos los anotadores de acuerdo (2.264) | 0,948 | **0,996** | 0,912 |
| Financial PhraseBank, mayoría de acuerdo (4.846) | 0,812 | **0,841** | 0,787 |
| Tweets financieros, validación twitter-financial-news (2.388) | **0,852** | 0,706 | 0,645 |
| 14 idiomas distintos del inglés, 399 frases cada uno | **0,893** | 0,177 | 0,402 |

Desglose por idioma (macro-F1, 399 frases financieras traducidas por idioma):

| de | fr | es | it | pt | nl | pl | tr | ru | zh | ja | ko | ar | hi |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0,885 | 0,898 | 0,880 | 0,918 | 0,902 | 0,877 | 0,913 | 0,891 | 0,900 | 0,928 | 0,901 | 0,881 | 0,851 | 0,882 |

Nota: los dos modelos de comparación se entrenaron con Financial PhraseBank, por lo que sus puntuaciones en ese conjunto son in-domain. El archivo ONNX int8 puntúa dentro de 0,005 de la precisión completa en todos los conjuntos anteriores.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo base de 308 M de parámetros ocupa aproximadamente 1,2 GB en fp32 y unos 0,6 GB en fp16, pero está diseñado para inferencia en CPU.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) aceleraría el throughput, pero el caso de uso declarado es CPU.
- Cabe en cualquier GPU consumer y en CPU convencional; la versión ONNX int8 (369 MB) cabe incluso en entornos con memoria muy limitada.
- Opciones de despliegue: `transformers` (pipeline estándar), ONNX Runtime, transformers.js (navegador y Node.js), Text Embeddings Inference y endpoints de Hugging Face.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible. La model card solo indica que "runs on a CPU" y que la versión int8 mantiene la precisión con un tamaño de 369 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Macro-F1 PhraseBank (mayoría) | Macro-F1 multilingüe |
|---|---|---|---:|---|---:|---:|
| Finance Sentiment (EmpirioLabs) | 307,5 M | 15 | No disponible | Apache 2.0 | 0,812 | 0,893 |
| mrm8488 financial-news (DistilRoBERTa) | No disponible | Inglés | No disponible | No disponible | **0,841** | 0,177 |
| soleimanian financial-roberta-large | No disponible | Inglés | No disponible | No disponible | 0,787 | 0,402 |

Finance Sentiment es el único de los tres con cobertura multilingüe declarada y el que mejor rinde en tweets financieros y en el conjunto multilingüe. En Financial PhraseBank (in-domain para las alternativas) queda por debajo de mrm8488 pero por encima de soleimanian. La licencia Apache 2.0 explícita y la disponibilidad de pesos ONNX lo diferencian en términos de despliegue comercial y edge.

## Limitaciones y advertencias

- Solo clasifica a nivel de frase: no pondera un informe completo ni detecta sarcasmo, rumores o razonamiento multi-paso. Es necesario dividir documentos largos en frases antes de clasificar.
- En texto corto tipo publicación, tiende a clasificar como `neutral` anuncios rutinarios (acuerdos, lanzamientos, dividendos), lo que puede infravalorar señales positivas.
- Las puntuaciones no inglesas provienen de frases traducidas; el texto nativo en esos idiomas puede puntuar peor que lo reportado.
- Los idiomas fuera de los 15 listados no están probados.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de clasificación errónea en dominios financieros no representados en el entrenamiento.
- No es asesoramiento financiero: la model card recomienda mantener una persona en el bucle antes de cualquier decisión de trading o crédito.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; la definición de "positivo" o "neutral" varía entre fuentes, lo que puede introducir inconsistencias.
- Licencia Apache 2.0 permite uso comercial de pesos y código; consultar `LICENSE` y `NOTICE` del repositorio para condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/finance-sentiment
- Licencia: https://huggingface.co/empiriolabsai/finance-sentiment/blob/main/LICENSE
- NOTICE: https://huggingface.co/empiriolabsai/finance-sentiment/blob/main/NOTICE
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Comparativa mrm8488: https://huggingface.co/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis
- Comparativa soleimanian: https://huggingface.co/soleimanian/financial-roberta-large-sentiment
- Web de EmpirioLabs: https://empiriolabs.ai
- Plataforma: https://platform.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
- Repositorio de modelos del autor: https://huggingface.co/empiriolabsai
