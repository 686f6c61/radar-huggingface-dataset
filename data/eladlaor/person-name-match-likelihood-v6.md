# eladlaor/person-name-match-likelihood-v6

## Resumen

Person Name Match Likelihood (v6) es un adaptador LoRA sobre el encoder `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` (184M parametros) entrenado especificamente para predecir si dos cadenas de texto corresponden a la misma persona. Lo desarrolla eladlaor y resuelve un problema muy concreto dentro de los pipelines de datos: la resolucion de entidades a nivel de par de nombres, sin contexto adicional como fecha de nacimiento, correo o direccion. Es relevante porque convierte una tarea tradicionalmente heuristica (comparacion de cadenas con reglas, soundex, Levenshtein) en una probabilidad calibrada y directamente consumible por un sistema de deduplicacion o KYC.

El modelo no es un LLM generativo: es una cabeza de clasificacion binaria (`[no_match, match]`) que devuelve una probabilidad interpretable como verosimilitud de coincidencia. Con solo ~600K parametros entrenables sobre la base congelada, el coste de inferencia es minimo (latencia p95 de 0,42 ms en CPU segun el autor), lo que permite integrarlo en procesos de record linkage a gran escala siempre que se acompañe de una capa de blocking previa.

La ficha se basa exclusivamente en la model card publicada por el autor en Hugging Face. No hay paper asociado ni resultados de benchmarks externos; las metricas reportadas provienen de un conjunto de test propio de 2.510 pares de nombres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder transformer de 12 capas con disentangled attention) + adaptador LoRA |
| Parametros totales | 184M en el modelo base; adaptador LoRA de ~600K parametros entrenables (~0,3%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length usado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder pequeno puede ejecutarse en FP32/BF16 sin problema) |
| Idiomas soportados | en (solo alfabeto latino; no soporta hebreo, arabe, chino, cirilico sin transliteracion previa) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar la base por separado |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-classification |
| Modelo base | MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli |
| Descargas / likes | 36 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v3-base de 12 capas y 184M de parametros, con atencion disentada, sobre el que se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,1. El adaptador se inserta en las proyecciones `query_proj`, `key_proj` y `value_proj` de cada bloque de atencion, sumando aproximadamente 600K parametros entrenables. La cabeza de clasificacion es una softmax de dos clases (`no_match`, `match`) y el autor incluye un temperature scaler (`calibration.pt`) ajustado sobre un conjunto de calibracion para reducir el Expected Calibration Error.

El entrenamiento usa focal loss con gamma=2,0 para penalizar menos los ejemplos faciles y concentrar el gradiente en pares dificiles (nombres similares, erratas). Se optimiza con AdamW, LR=2e-4, schedule coseno, 10% de warmup, weight decay 0,01, 10 epocas, batch size 32, max_length 128 y precision mixta BF16, con semilla 42. El dataset contiene ~174K pares balanceados match/no-match tras una aumentacion de 2,5x: la mitad proviene de entidades reales de OpenSanctions y la otra mitad de un generador sintetico que cubre 15 casos limite (apodos, inversión de orden, transliteracion, iniciales, segundo nombre, titulos, guiones, variaciones de mayusculas, erratas, etc.). Los splits de train, validacion y calibracion son a nivel de entidad (ninguna persona aparece en mas de un split) usando un hash MD5 determinista para garantizar reproducibilidad bit a bit.

## Capacidades

- Clasificacion binaria de pares de nombres: devuelve P(misma persona) en el rango [0, 1] mediante softmax sobre `[no_match, match]`.
- Manejo de apodos y variantes (Bob ↔ Robert), con 100% de acierto en el conjunto de test reportado.
- Normalizacion de orden de nombre (Last, First ↔ First Last), 100% de acierto.
- Transliteracion entre variantes latinas (Yitzhak ↔ Itzhak), 100% de acierto.
- Expansion de iniciales (J. Smith ↔ John Smith), 100% de acierto.
- Adicion o eliminacion de segundo nombre, 100% de acierto.
- Tratamiento de titulos y sufijos (Dr., Jr.), 100% de acierto.
- Diferenciacion de nombres similares pero distintos (Robert ↔ Roberta), 95,0% de acierto.
- Tolerancia a erratas a nivel de caracter, 84,6% de acierto (punto mas debil).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es exclusivamente un clasificador de pares.
- No soporta vision, audio ni thinking mode.

## Casos de uso

- Deduplicacion de registros de clientes: dada una lista de nombres, aplicar un blocking barato (primera letra, soundex, prefijo) y usar el modelo para puntuar los pares candidatos antes de fusionar registros. La latencia de 0,42 ms p95 en CPU permite procesar cientos de miles de pares por minuto.
- KYC y screening de sanciones: comparar el nombre de un cliente contra listas publicas (OpenSanctions, PEPs) y usar la probabilidad como senal de alerta. El modelo esta entrenado precisamente con la distribucion de OpenSanctions, por lo que su calibracion en ese dominio es buena.
- Enriquecimiento de CRM: detectar si dos fichas creadas por canales distintos (formulario web, llamada, importacion) corresponden a la misma persona antes de consolidar el historial.
- Limpieza de bases de datos cientificas o bibliograficas: normalizar autores con variantes de iniciales, transliteraciones y orden de apellidos antes de calcular redes de coautoria.
- Resolucion de entidades en periodismo de datos: cruzar registros de multiples fuentes (registros mercantiles, filtraciones, sanciones) usando el nombre como unica senal compartida.
- Pre-filtrado en pipelines de matching mas amplios: usar la probabilidad como feature de entrada a un modelo downstream que si disponga de fecha de nacimiento, direccion o documento, reduciendo el numero de comparaciones costosas.
- Normalizacion de nombres en ETL: puntuar pares sospechosos durante la carga de datos para marcar duplicados potenciales antes de que lleguen a produccion.

## Benchmarks y rendimiento

Evaluacion del autor sobre un conjunto de test retenido de 2.510 pares de nombres (OpenSanctions + sintetico curado):

| Metrica | Valor |
|---|---|
| F1 | 0,9682 |
| Precision | 0,9568 |
| Recall | 0,9798 |
| Accuracy | 0,9733 |
| Expected Calibration Error | 0,0162 |
| Latencia p95 (CPU) | 0,42 ms |

Desglose por caso limite:

| Caso limite | Accuracy | n |
|---|---|---|
| nickname (Bob ↔ Robert) | 100,0% | 121 |
| name_order (Last, First ↔ First Last) | 100,0% | 112 |
| transliteration (Yitzhak ↔ Itzhak) | 100,0% | 93 |
| initial (J. Smith ↔ John Smith) | 100,0% | 112 |
| middle_name add/drop | 100,0% | 50 |
| title_suffix (Dr., Jr.) | 100,0% | 112 |
| hyphenation, case_variation, combined, unrelated | 100,0% | 86 |
| tricky_non_match (no coincidencias similares) | 97,9% | 331 |
| partial_overlap | 97,7% | 353 |
| unknown (real, sin etiqueta curada) | 97,5% | 682 |
| similar_name (Robert ↔ Roberta) | 95,0% | 341 |
| typo | 84,6% | 117 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores, que son auto-reportados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (184M parametros del encoder + adaptador), aproximadamente 0,4 GB en BF16/FP16.
- GPU recomendadas: cualquier GPU moderna sirve; una T4, L4 o RTX 3060 ya sobredimensionan el modelo. Para lotes grandes, A10G, L4 o A100 permiten throughput alto con batching.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.). Tambien funciona en CPU con latencia de 0,42 ms p95 por par segun el autor.
- Opciones de despliegue: `transformers` + `peft` (referencia), vLLM no aplica (no es generativo), ONNX Runtime o TorchScript para servir en CPU, Text Embeddings Inference no aplica directamente. Para produccion se recomienda exportar el modelo fusionado (merge del LoRA) a ONNX o a un `AutoModelForSequenceClassification` estandar.
- Latencia y throughput: 0,42 ms p95 en CPU por par a 128 tokens. Con batching en GPU se pueden procesar miles de pares por segundo, aunque el autor no publica cifras de throughput agregado.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos directamente comparables publicados con el mismo proposito (scoring de pares de nombres con licencia permisiva). Las alternativas habituales en este espacio son heuristicas (Jaro-Winkler, Levenshtein, soundex) o modelos de entity matching genericos como `sentence-transformers` con similitud coseno, pero no se dispone de datos de rendimiento comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| person-name-match-likelihood-v6 | 184M + 600K LoRA | 128 tokens | Clasificador binario de pares | MIT |
| DeBERTa-v3-base-mnli-fever-anli (base) | 184M | 512 tokens | NLI zero-shot | MIT |
| Heuristicas (Jaro-Winkler, soundex) | n/a | n/a | Reglas de cadena | n/a |

## Limitaciones y advertencias

- Solo alfabeto latino: no funciona bien con hebreo, arabe, chino o cirilico sin transliteracion previa.
- Sesgo hacia OpenSanctions: la mitad real del entrenamiento proviene de una base de sanciones y PEPs con sobrerrepresentacion de figuras politicas, empresariales y criminales, y de transliteraciones rusas, ucranianas, iranies, chinas y latinoamericanas. El comportamiento sobre bases de consumidores estadounidenses o europeos puede diferir.
- Solo a nivel de par: no hace blocking, clustering ni matching uno-a-muchos. Para deduplicar listas grandes hay que combinarlo con una capa de pre-filtrado.
- Solo nombres: sin fecha de nacimiento, correo ni direccion, dos personas reales homonimas puntuan como coincidencia. Debe usarse como una senal mas dentro de un pipeline de identidad, nunca como decision unica.
- Precision en erratas debil: 84,6% en typos a nivel de caracter. Si la entrada viene de OCR o transcripcion manual, hay que esperar mas errores en esta categoria.
- Modelo gated: la descarga requiere aceptar el aviso de uso previsto y rellenar nombre, afiliacion y uso previsto.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; la calibracion publicada es la del conjunto de test del autor, no necesariamente la del dominio del usuario.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero si de falsos positivos en nombres homonimos o culturalmente ambiguos.
- No hay validacion independiente de las metricas: todas las cifras son auto-reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eladlaor/person-name-match-likelihood-v6
- Modelo base: https://huggingface.co/MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli
- Libreria PEFT: https://github.com/huggingface/peft
- OpenSanctions (fuente de datos reales de entrenamiento): https://www.opensanctions.org/
- Paper de DeBERTa-v3 (arquitectura base): https://arxiv.org/abs/2111.09543
