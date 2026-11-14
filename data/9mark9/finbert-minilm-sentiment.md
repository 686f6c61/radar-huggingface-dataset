# 9mark9/finbert-minilm-sentiment

## Resumen

`finbert-minilm-sentiment` es un clasificador de sentimiento financiero en ingles desarrollado por el usuario 9mark9. Se construye sobre el encoder compacto `microsoft/MiniLM-L12-H384-uncased` (33,4 millones de parametros) afinado para la tarea de clasificacion de tres clases: negativo, neutro y positivo. El modelo resuelve un problema acotado pero critico en el analisis de noticias y comunicados financieros: asignar polaridad a frases, titulares y tuits del dominio bursatil de forma rapida y con un coste computacional minimo.

La version actual (v3, octubre de 2026) es el promedio uniforme de diez ejecuciones de fine-tuning sobre una mezcla de tres fuentes: Financial PhraseBank, tuits financieros de Twitter y titulares de notas de prensa. El autor reporta 97,94 % de accuracy y 0,9643 de macro-F1 sobre el split de test estratificado de PhraseBank, y 86,43 % de accuracy en el conjunto de validacion de tuits financieros, cifras que superan a las versiones anteriores v1 y v2.

Su relevancia practica reside en la relacion tamano/rendimiento: con apenas 33,4 millones de parametros y 0,5 GB de repositorio, ofrece un rendimiento en dominio cercano a clasificadores financieros mucho mas grandes, lo que permite desplegarlo en CPU o en GPUs de consumo con latencia muy baja. La licencia MIT facilita su integracion en productos comerciales sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM-L12) |
| Parametros totales | 33,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite del encoder base); evaluado con maximo de 96 tokens |
| Tipos de cuantizacion | safetensors y ONNX; cuantizaciones adicionales no documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT de 12 capas y 384 dimensiones ocultas (MiniLM-L12), inicializado desde `microsoft/MiniLM-L12-H384-uncased` y afinado como clasificador de secuencias con tres etiquetas de salida. La cabeza de clasificacion se entrena sobre la representacion del token `[CLS]`. No se emplean mecanismos de decodificacion generativa ni atencion lineal: es un clasificador puro de un solo paso.

El entrenamiento combina tres corpus: Financial PhraseBank (frases financieras formales), `zeroshot/twitter-financial-news-sentiment` (tuits con etiquetas Bearish/Bullish/Neutral remapeadas a negativo/positivo/neutro) y `Jean-Baptiste/financial_news_sentiment` (titulares de notas de prensa). La version v3 incorpora frases adicionales de PhraseBank y aplica un promedio uniforme de pesos (model soup) sobre diez ejecuciones independientes, una tecnica de ensembling barata que estabiliza el rendimiento sin incrementar el coste de inferencia. No se documenta el uso de RLHF ni DPO, dado que no es un modelo generativo. La evaluacion se realizo con un maximo de 96 tokens y seleccion de la etiqueta de mayor probabilidad.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negativo, neutro, positivo) sobre frases, titulares y tuits.
- Analisis de texto formal (comunicados, notas de prensa) y de registros informales (tuits financieros).
- Etiquetado de polaridad a nivel de entidad en titulares, segun el esquema de SEntFiN.
- Inferencia muy rapida en CPU y GPU gracias a su tamano reducido.
- Exportacion ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Monitorizacion de noticias financieras en tiempo real: el modelo clasifica titulares de agencias y medios en milisegundos, permitiendo construir paneles de sentimiento de mercado con actualizacion continua y bajo coste de infraestructura.
- Analisis de sentimiento en redes sociales: con 86,43 % de accuracy en el conjunto de validacion de tuits financieros, es adecuado para medir el pulso del retail inversor en Twitter/X y detectar cambios de tono en torno a un valor.
- Filtrado y priorizacion de alertas: en un pipeline de vigilancia de carteras, el clasificador descarta titulares neutros y escala solo los negativos o positivos, reduciendo el ruido que llega al analista.
- Enriquecimiento de bases de datos documentales: etiquetar retroactivamente miles de comunicados y notas de prensa para construir series historicas de sentimiento por empresa o sector.
- Preprocesamiento para modelos generativos: usar la etiqueta de sentimiento como metadato de entrada en un RAG financiero, de modo que el LLM recupere y pondere documentos segun su polaridad.
- Clasificacion de entidades en titulares: con el esquema SEntFiN, asignar polaridad a cada empresa mencionada en un titular, util para seguimiento multi-empresa en una sola frase.
- Despliegue en el borde o en entornos con recursos limitados: al ocupar 0,5 GB y caber en CPU, puede ejecutarse en funciones serverless o dispositivos sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos el 28 de octubre de 2026 con el mismo codigo de evaluacion. Celdas en formato accuracy / macro-F1.

| Conjunto de evaluacion | n | v1 | v2 | v3 |
|---|---|---|---|---|
| PhraseBank `Sentences_AllAgree`, test estratificado 15 % | 340 | 95,29 % / 0,9368 | 96,47 % / 0,9532 | 97,94 % / 0,9643 |
| Tuits financieros, validacion completa | 2.388 | 68,22 % / 0,6165 | 83,75 % / 0,7995 | 86,43 % / 0,8300 |
| Titulares de notas de prensa, test completo | 267 | 71,16 % / 0,5864 | 72,28 % / 0,5594 | 75,28 % / 0,5904 |
| SEntFiN, test completo, titulares unanimes | 933 | 69,67 % / 0,6977 | 73,20 % / 0,7361 | 75,99 % / 0,7627 |

Macro-F1 medio sobre los cuatro conjuntos: v1 0,7093; v2 0,7620; v3 0,7868 (+2,48 puntos sobre v2). Los intervalos de confianza al 95 % (2.000 remuestreos bootstrap) se solapan en todos los conjuntos, por lo que el autor advierte que la mejora en un conjunto aislado es incierta; la evidencia mas solida es la direccion consistente en los cuatro.

Puntos debiles documentados: la recuperacion de la clase negativa en titulares de notas de prensa es de solo 0,167 (IC 0,000 a 0,417) tanto en v2 como en v3, lo que indica un sesgo claro hacia neutro/positivo en ese dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (33,4 M de parametros, ~134 MB de pesos); en fp16 o int8, por debajo de 100 MB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 son mas que suficientes.
- Cabe en cualquier GPU de consumo e incluso en CPU sin problemas de latencia para cargas moderadas.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` estan presentes), y potencialmente `optimum` para exportacion y cuantizacion.
- Latencia y throughput: no se han publicado mediciones especificas en la informacion disponible. Por tamano, se espera inferencia en el orden de milisegundos por frase en CPU moderna y de decenas de miles de frases por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en PhraseBank | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finbert-minilm-sentiment (v3) | 33,4 M | 512 tokens | 97,94 % acc / 0,9643 macro-F1 (test estratificado 15 %) | MIT | Hugging Face |
| ProsusAI/finbert | ~110 M | 512 tokens | no disponible en la informacion | no disponible | Hugging Face |
| yiyanghkust/finbert-tone | ~110 M | 512 tokens | no disponible en la informacion | no disponible | Hugging Face |
| microsoft/MiniLM-L12-H384-uncased (base) | 33,4 M | 512 tokens | no aplica (modelo base sin fine-tuning) | MIT | Hugging Face |

La comparacion directa con FinBERT clasicos es dificil porque sus resultados publicados usan splits distintos y no se han reproducido en esta ficha. La ventaja estructural de `finbert-minilm-sentiment` es su tamano tres veces menor que FinBERT, con licencia MIT explicita y exportacion ONNX, lo que simplifica el despliegue en produccion.

## Limitaciones y advertencias

- Solo soporta ingles; cualquier texto en otro idioma producira predicciones poco fiables.
- Sesgo hacia las clases neutra y positiva en titulares de notas de prensa: la recuperacion de la clase negativa es de 0,167 (IC 0,000 a 0,417), lo que implica falsos negativos frecuentes en ese dominio.
- Rendimiento notablemente inferior en dominios fuera de PhraseBank (0,5904 de macro-F1 en notas de prensa, 0,7627 en SEntFiN) frente al 0,9643 en PhraseBank; el modelo esta optimizado para frases financieras formales.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de sobreconfianza: la etiqueta de mayor probabilidad puede ser incorrecta en textos ambiguos o con sarcasmo.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente; los intervalos de confianza se solapan entre versiones.
- Limitacion de contexto a 512 tokens, con evaluacion realizada a 96 tokens; textos mas largos deben truncarse o dividirse.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene revisar las licencias de los datasets de entrenamiento subyacentes si se redistribuye el modelo.
- No es un modelo generativo: no puede explicar sus predicciones ni mantener conversaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/finbert-minilm-sentiment
- Version v2: https://huggingface.co/9mark9/finbert-minilm-sentiment/tree/v2-mixed-domain
- Version v1: https://huggingface.co/9mark9/finbert-minilm-sentiment/tree/v1-phrasebank-only
- Proyecto educativo complementario (nano-finbert): https://github.com/shaikn6/nano-finbert
- Dataset Financial PhraseBank: https://huggingface.co/datasets/takala/financial_phrasebank
- Dataset Twitter Financial News Sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
- Dataset SEntFiN: https://huggingface.co/datasets/tasksource/sentfin
- Modelo base MiniLM: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
