# OmarNiazi/ruen-lid-xlmr-base-iter2-tag

## Resumen

RU-EN-LID Stage 2 (iteración 2, con etiquetas de candidato) es un modelo de identificacion de idioma a nivel de palabra para texto code-mixed roman urdu-ingles escrito en alfabeto latino. Desarrollado por OmarNiazi como segunda etapa del pipeline RU-EN-LID, se construye sobre `FacebookAI/xlm-roberta-base` (277.460.740 parametros) y clasifica cada palabra como UR (roman urdu), EN (ingles) u OTH (nombres, menciones, enlaces). La innovacion principal es que, ademas de la frase, el encoder recibe la etiqueta de evidencia de la etapa 1 para cada palabra (EN, UR, AMB, VAR, BOTH, UNK), anadiendo un vector aprendido por etiqueta a la embedding de entrada de la palabra.

El modelo resuelve un problema concreto: la identificacion fiable de idioma token a token en conversaciones bilingues urdu-ingles romanizadas, tarea relevante para normalizacion de texto, traduccion asistida, analisis de sentimiento y moderacion de contenido en redes sociales del sur de Asia. La arquitectura es `CandidateXLMRForTokenClassification`, una variante de XLM-R para clasificacion de tokens que requiere el codigo del repositorio RU-EN-LID; cargarla con `AutoModelForTokenClassification` de `transformers` descarta los vectores de etiqueta y produce salidas incorrectas.

Una advertencia importante: el modelo esta entrenado de forma proxy con la parte en alfabeto latino de COMI-LINGUA (hindi romanizado-ingles con etiquetas expertas, mapeando `hi` a UR), no con un corpus anotado de roman urdu real. Por tanto, los resultados publicados (exactitud 0,9651 y macro-F1 0,9405 en el test de COMI-LINGUA) deben interpretarse como un limite superior, no como rendimiento esperado en roman urdu genuino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con variante `CandidateXLMRForTokenClassification` (clasificacion de tokens condicionada por etiquetas de candidato) |
| Parametros totales | 277.460.740 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 piezas (maximo usado en entrenamiento; el modelo base admite hasta 512) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en bf16/fp32) |
| Idiomas soportados | ur (roman urdu), hi (hindi romanizado), en (ingles) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas de salida | UR, EN, OTH |
| Etiquetas de entrada (etapa 1) | EN, UR, AMB, VAR, BOTH, UNK |
| Tamano del repo | 1,1 GB |
| Modelo base | FacebookAI/xlm-roberta-base |
| Temperatura de calibracion | 1,42 (ECE 0,019 → 0,005) |
| Umbral etapa 3 | τ = 0,5617 |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingue de 12 capas y 278M parametros, y lo adapta mediante la clase `CandidateXLMRForTokenClassification`. La peculiaridad arquitectonica es que la embedding de entrada de cada palabra se suma a un vector aprendido por etiqueta de candidato procedente de la etapa 1 (EN, UR, AMB, VAR, BOTH, UNK). La etapa 1 consulta cada palabra en dos listas lexicas (una inglesa y una roman urdu) y emite una etiqueta; las listas se inducen exclusivamente desde el split de entrenamiento (1.399 palabras inglesas, 2.102 roman urdu, 170 en ambas) y se distribuyen con el modelo en `stage1_resources/`. Los vectores de etiqueta se inicializan a cero y se entrenan con learning rate 1e-3, mientras que durante el entrenamiento se ocultan el 15% de las etiquetas (convertidas a UNK) para evitar que el modelo dependa en exceso de la senal auxiliar.

Los datos de entrenamiento son la parte en alfabeto latino de COMI-LINGUA LID: 6.540 frases de entrenamiento y 727 de validacion. La preparacion aplica mayoria 2-de-3 anotadores por palabra, excluye de la perdida las palabras sin mayoria y elimina frases de entrenamiento que aparecen en el test. El entrenamiento usa hasta 5 epocas (mejor epoca 4 por macro-F1 de validacion), learning rate 3e-5, warm-up del 10%, weight decay 0,01, batch 16, bf16, maximo 256 piezas y semilla 1. Tras el entrenamiento, las confianzas se calibran por temperatura (1,42) sobre validacion, y el umbral de la etapa 3 (τ = 0,5617) se ajusta tambien en validacion.

## Capacidades

- Identificacion de idioma a nivel de palabra en texto code-mixed roman urdu-ingles: asigna UR, EN u OTH a cada token.
- Aprovechamiento de evidencia lexica externa (etapa 1) para desambiguar palabras que aparecen en una sola de las listas.
- Manejo de variantes ortograficas atestiguadas (etiqueta VAR) como `nhi` o `bht`.
- Deteccion de palabras ambiguas compartidas entre listas (etiqueta AMB) como `to`, `main`, `is`.
- Clasificacion de entidades no linguisticas bajo OTH: nombres propios, menciones `@usuario` y enlaces.
- Salida con confianzas calibradas (temperatura 1,42) aptas para umbralizado downstream.
- Capacidad multilingue limitada a ur, hi y en en alfabeto latino.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de tokens, no un modelo generativo.
- No soporta vision, audio ni modo thinking.

## Casos de uso

- Normalizacion de texto para traduccion automatica: el modelo etiqueta cada palabra de una frase code-mixed como UR, EN u OTH, permitiendo enrutar los tokens roman urdu a un normalizador o transliterador y dejar intactos los ingleses, lo que mejora la calidad de traduccion en pipelines urdu-ingles.
- Analisis de sentimiento en redes sociales del sur de Asia: preprocesar comentarios bilingues etiquetando el idioma de cada token permite aplicar modelos de sentimiento especificos por idioma sobre subconjuntos coherentes de la frase.
- Moderacion de contenido: identificar tokens roman urdu frente a ingleses facilita aplicar lexicos de toxicidad especificos por idioma con menor tasa de falsos positivos.
- Construccion de corpus anotados: usar las etiquetas del modelo como preanotacion para anotadores humanos en proyectos de creacion de datasets LID de roman urdu, reduciendo el coste de etiquetado manual.
- Investigacion en code-mixing: servir como componente de referencia en estudios comparativos sobre identificacion de idioma en entornos bilingues, con confianzas calibradas y umbral reproducible (τ = 0,5617).
- Preprocesamiento para ASR post-procesado: segmentar transcripciones roman urdu-ingles por idioma para alimentar modelos de correccion ortografica o de puntuacion especificos.
- Extraccion de menciones y enlaces: la etiqueta OTH permite separar nombres, `@menciones` y URLs del contenido linguistico antes de tareas de NER o enlace de entidades.

## Benchmarks y rendimiento

| Conjunto | Exactitud | Macro-F1 |
|---|---|---|
| Validacion COMI-LINGUA (727 frases) | 0,9666 | 0,9463 |
| Test COMI-LINGUA latin (750 frases, 15.207 palabras evaluadas) | 0,9651 | 0,9405 |
| RU-EN-LID running examples (25 palabras anotadas a mano) | 1,0000 | 1,0000 |
| RU-EN-LID demo slice (51 palabras anotadas a mano) | 1,0000 | 1,0000 |

F1 por etiqueta en el test COMI-LINGUA: UR 0,983, EN 0,953, OTH 0,885.

Comparacion controlada del efecto de las etiquetas (mismos splits y ajustes, 3 semillas): la exactitud de test sube de 0,9633 a 0,9643 (+0,0010, mejor en las 3 semillas). La mejora se concentra en palabras que las listas asignan a un solo idioma; en palabras ambiguas como `to`, `he`, `main` las etiquetas no ayudan. El modelo de iteracion 1 sin etiquetas obtiene 0,9618 en el mismo test, aunque la mayor parte de la diferencia es variacion entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp32: aproximadamente 1,1-1,2 GB para pesos mas activaciones con secuencias de hasta 256 tokens; en fp32 completa rondaria 2,2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe holgadamente en GPU consumer: si, incluso en GPUs de gama baja y en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: requiere el codigo del repositorio RU-EN-LID (`src/classifier/candidate_model.py` y `src/pipeline`); no es cargable directamente con `AutoModelForTokenClassification` de `transformers` sin perder los vectores de etiqueta. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas para modelos generativos).
- Latencia y throughput: no disponible; el modelo card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| OmarNiazi/ruen-lid-xlmr-base-iter2-tag | 277,5M | 256 piezas | LID token-level code-mixed ur-en | CC BY-SA 4.0 | Requiere codigo RU-EN-LID; entrenado en proxy hindi romanizado |
| OmarNiazi/ruen-lid-xlmr-base-iter1 | 277,5M | 256 piezas | LID token-level ur-en | CC BY-SA 4.0 | Sin etiquetas de candidato; 0,9618 en test COMI-LINGUA |
| FacebookAI/xlm-roberta-base | 278M | 512 piezas | Modelo base multilingue | MIT | No especializado en LID; requiere fine-tuning |
| Davlan/bert-base-multilingual-cased-ner-hrl | ~178M | 512 piezas | NER multilingue | AFL-3.0 | No es LID; comparativa solo por tamano y familia |

No se dispone de comparativas publicadas con otros sistemas LID especificos para roman urdu en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado sobre hindi romanizado-ingles (COMI-LINGUA), no sobre roman urdu-ingles real: se espera un rendimiento inferior en texto roman urdu genuino, aunque comparten gran parte del vocabulario cotidiano.
- Las listas lexicas inducidas se construyen a partir de las mismas etiquetas que el modelo aprende, por lo que en frases de entrenamiento la etiqueta de candidato es practicamente la respuesta; ocultar el 15% de etiquetas solo compensa parcialmente esta fuga.
- Nombres propios: muchas palabras presentes en ambas listas son nombres (`abhishek`, `delhi`) porque COMI-LINGUA etiqueta nombres de forma inconsistente; la etiqueta OTH tambien es inconsistente para nombres.
- No esta ajustado para alfabeto urdu (script arabe-persa) ni para otros idiomas.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero puede producir etiquetas erroneas con alta confianza en dominios fuera de distribucion.
- Licencia CC BY-SA 4.0: impone obligaciones de compartir bajo la misma licencia las obras derivadas; revisar compatibilidad antes de uso comercial propietario. Las listas lexicas derivan de COMI-LINGUA (Sheth et al., Findings of EMNLP 2025) y heredan la misma licencia.
- No se debe pasar otras listas lexicas con `--resources`: las etiquetas cambiarian de significado.
- Dependencia fuerte del codigo RU-EN-LID (version del 2026-11-16 en adelante); integraciones con `transformers` estandar no reproducen las salidas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmarNiazi/ruen-lid-xlmr-base-iter2-tag
- Modelo de iteracion 1: https://huggingface.co/OmarNiazi/ruen-lid-xlmr-base-iter1
- Repositorio RU-EN-LID: https://github.com/Mughal-Hash-24/RU-EN-LID
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper COMI-LINGUA (Sheth et al., Findings of EMNLP 2025): no disponible enlace directo en la informacion proporcionada
