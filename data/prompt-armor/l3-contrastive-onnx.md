# prompt-armor/l3-contrastive-onnx

## Resumen

L3 Contrastive ONNX es un modelo de embeddings derivado de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, afinado con aprendizaje contrastivo (TripletLoss) para una tarea muy concreta: distinguir por intención, y no por tema, entre prompts benignos y ataques de prompt injection. Lo desarrolla el proyecto prompt-armor y se distribuye como grafo ONNX que se ejecuta exclusivamente sobre ONNX Runtime, sin dependencia de PyTorch. Con 384 dimensiones de embedding y una longitud máxima de 128 tokens, es un componente ligero pensado para ejecutarse en CPU dentro de una pipeline de seguridad.

El problema que resuelve es específico: el modelo base agrupa textos por temática, de modo que una consulta de investigación benigna sobre jailbreaks queda cerca en el espacio vectorial de un ataque real. Tras el ajuste fino, la similitud media entre ataques y textos benignos cae a -0,021 mientras la auto-similitud entre ataques sube a 0,858, lo que permite usar umbrales de similitud coseno como señal de detección. Este modelo constituye la capa L3 (similitud) del detector prompt-armor, que combina cinco capas de análisis en paralelo y fusiona sus puntuaciones mediante un metaclasificador entrenado.

La revisión actual sustituye el grafo INT8 dinámico anterior por pesos FP16 con `Cast` a FP32, de modo que la inferencia se ejecuta íntegramente en FP32 y los resultados son deterministas entre arquitecturas x86 y ARM. El repositorio ocupa 0,5 GB y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L12, 12 capas) exportado a ONNX; pooling de media de tokens + normalización L2 |
| Parametros totales | no disponible (modelo base MiniLM-L12-v2; el repo pesa 0,5 GB incluyendo tokenizer y grafo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (máximo de secuencia) |
| Tipos de cuantizacion | Pesos almacenados en FP16 con `Cast` a FP32; cómputo en FP32. Revisiones anteriores usaban INT8 dinámico (`MatMulInteger`) |
| Idiomas soportados | Multilingüe (heredado de paraphrase-multilingual-MiniLM-L12-v2) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `paraphrase-multilingual-MiniLM-L12-v2`, un encoder transformer de 12 capas y 384 dimensiones de embedding, y se afina con TripletLoss sobre pares de ataque/benigno más 2.368 negativos duros minados (correspondiente a prompt-armor v0.8.0). El pooling es media de tokens enmascarada por `attention_mask`, seguida de normalización L2, de modo que la similitud coseno entre embeddings es directamente comparable con umbrales fijos.

La revisión actual no reentrena el modelo: parte del checkpoint INT8 original (revisión `e634d5b16c26d71c7b841ef56c13c18a7dd5f49d`) porque el checkpoint FP32 de entrenamiento no se conservó, lo dequantiza, lo carga en la arquitectura del modelo base y lo reexporta. Las 74 matrices de pesos usadas por `MatMul` y el `Gather` de embeddings se almacenan en FP16 tras un `Cast` a FP32 que ONNX Runtime pliega al cargar la sesión. El script `scripts/export_l3_onnx.py` con el flag `--from-int8 e634d5b...` reproduce `model_fp16.onnx` byte a byte. El SHA-256 del grafo es `5aeb46808f2437c203ba3ffa573e0661cbc7ac12c4d57bc5a822d4693ce1d0e3`.

El motivo del cambio es la no determinación del INT8 dinámico: sobre el benchmark de 1.534 muestras del proyecto, el mismo código puntuaba entre F1 82,5 % y 83,1 % según la máquina, y un mismo texto podía producir embeddings con coseno tan bajo como 0,938 entre x86 y ARM. La revisión FP32 mantiene una concordancia media de coseno 0,9998 (mínimo 0,998) con la revisión INT8 sobre 3.043 textos y una variación entre arquitecturas inferior a 3e-7 por dimensión, a costa de duplicar el tamaño (224 MB frente a 118 MB).

## Capacidades

- Extracción de embeddings de frases multilingües con 384 dimensiones y normalización L2.
- Detección de prompt injection por similitud de intención frente a una base de ataques conocidos (capa L3 de prompt-armor).
- Discriminación entre consultas benignas sobre un tema y ataques reales sobre el mismo tema, gracias al ajuste contrastivo.
- Ejecución en CPU pura mediante ONNX Runtime, sin PyTorch ni CUDA.
- Salida determinista entre arquitecturas x86 y ARM en la revisión FP32.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo de representación, no generativo.

## Casos de uso

- Detección de prompt injection en producción: el modelo genera el embedding del prompt de entrada y lo compara por coseno contra la base de ataques del proyecto; con la separación medida (auto-similitud de ataques 0,858 frente a -0,021 con benignos) se pueden fijar umbrales estables para marcar candidatos a revisión.
- Filtrado previo en pasarelas de LLM: al ejecutarse solo sobre ONNX Runtime en CPU, se puede desplegar como paso de inspección en un proxy de API sin añadir GPU ni dependencias pesadas al contenedor.
- Moderación multilingüe de entradas de usuario: al heredar el soporte multilingüe del modelo base, cubre prompts en varios idiomas con un único artefacto de 224 MB.
- Deduplicación y agrupación de ataques: la alta auto-similitud entre ataques (0,858) permite agrupar variantes de un mismo vector de ataque por clustering sobre los embeddings y mantener actualizada la base de firmas.
- Clasificación de contenido en pipelines de CI/CD de seguridad: el script de exportación y el SHA-256 publicado permiten fijar la revisión exacta y verificar la integridad del grafo en cada despliegue.
- Investigación sobre robustez de LLM: sirve como extractor de características fijo para estudiar la separabilidad de ataques y benignos sin reentrenar el encoder.

## Benchmarks y rendimiento

| Metrica | Modelo base | Ajustado |
|---|---|---|
| Similitud cruzada ataque↔benigno | 0,053 | -0,021 |
| Auto-similitud de ataques | 0,229 | 0,858 |
| Brecha de separación | 0,176 | 0,879 |

| Metrica de la revisión FP32 | Valor |
|---|---|
| Concordancia con INT8 (3.043 textos) | coseno medio 0,9998, mínimo 0,998 |
| Variación x86 vs ARM | < 3e-7 por dimensión |
| F1 del detector completo (benchmark de 1.534 muestras) | 82,5 % – 83,1 % en la revisión INT8, según máquina |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a un modelo de embeddings.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU; el grafo corre con `CPUExecutionProvider` de ONNX Runtime.
- VRAM: no aplica en despliegue CPU; el grafo FP32 ocupa 224 MB en disco y una huella en memoria del mismo orden.
- GPU: no es necesaria; no se documentan requisitos para `CUDAExecutionProvider` ni `TensorrtExecutionProvider`.
- Cabe en cualquier equipo consumer, incluidos portátiles modestos y contenedores con poca memoria.
- Despliegue: ONNX Runtime (Python u otros bindings), con `tokenizers` para el preprocesado; el proyecto prompt-armor lo descarga automáticamente en el primer uso, fijado por SHA de commit.
- Latencia: prompt-armor declara ~24 ms para la pipeline completa de cinco capas en modo offline; no se desglosa la latencia de esta capa por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| prompt-armor/l3-contrastive-onnx | no disponible (base MiniLM-L12) | 128 | 384 | Apache 2.0 | Embeddings de seguridad afinados por contraste |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible (MiniLM-L12) | 128 | 384 | Apache 2.0 | Embeddings multilingües genéricos por tema |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible (MiniLM-L6) | 256 | 384 | Apache 2.0 | Embeddings en inglés, 6 capas, más rápido |

La diferencia clave frente al modelo base no es de tamaño ni de contexto, sino de comportamiento: el base agrupa por tema y este por intención, con una brecha de separación de 0,879 frente a 0,176. No se dispone de comparación con otros detectores de prompt injection basados en embeddings en la información proporcionada.

## Limitaciones y advertencias

- Modelo de representación, no generativo: no produce texto ni respuestas, solo vectores.
- Ventana de 128 tokens: prompts largos se truncan, lo que puede diluir señales de ataque situadas al final del texto.
- La calidad de detección depende de la base de ataques del proyecto; ataques novedosos sin similitud con ella pueden pasar la capa L3.
- El ajuste fino se realizó sobre 2.368 negativos duros minados; el riesgo de sesgo hacia esos patrones concretos es real y no se documenta una evaluación de sesgos demográfica o lingüísticamente desagregada.
- La revisión FP32 duplica el tamaño respecto a INT8 (224 MB frente a 118 MB) a cambio de determinismo; entornos con restricciones estrictas de memoria deben valorarlo.
- Las releases de prompt-armor anteriores al cambio a FP32 siguen fijando la revisión INT8 `e634d5b`, con su variabilidad entre máquinas.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del modelo base (Reimers y Gurevych).
- No se documentan métricas de calibración por idioma; el soporte multilingüe se hereda del base sin evaluación específica en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prompt-armor/l3-contrastive-onnx
- Repositorio prompt-armor: https://github.com/prompt-armor/prompt-armor
- Script de exportación: https://github.com/prompt-armor/prompt-armor/blob/main/scripts/export_l3_onnx.py
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
