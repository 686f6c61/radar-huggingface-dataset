# MudraForge/law2code-tax-t1-encoder-3.3m

## Resumen

MudraForge Tax T1 Encoder es un codificador de lenguaje estatutario de dominio especifico, con 3.322.986 parametros (3,32 M), desarrollado por MudraForge como backbone de representacion de la etapa 0 (Stage 0) del sistema law2code. Su funcion no es generar texto, sino producir representaciones contextualizadas de 256 dimensiones para fragmentos de normativa fiscal de India y Estados Unidos, que despues alimentan etapas posteriores de un pipeline de traduccion de ley a codigo. El modelo se distribuye en PyTorch y ONNX (opset 17), con licencia Apache 2.0.

La relevancia de este modelo es acotada y muy especifica: no compite con modelos de proposito general, sino que resuelve el problema de codificar lenguaje legal con alta sensibilidad a numeros, porcentajes, referencias cruzadas y operadores deonticos (obligacion, permiso, prohibicion). Para ello emplea un objetivo de Masked Language Modeling "saliente" que prioriza esos elementos durante el preentrenamiento, en lugar de enmascarar tokens de forma uniforme.

Con 3,3 M de parametros, el modelo es extremadamente ligero (18,1 MB en PyTorch, 13,73 MB en ONNX) y esta pensado para ejecutarse en CPU o en hardware muy modesto como componente de un pipeline mayor. No dispone de model card con datos de contexto maximo, idiomas declarados ni benchmarks publicos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (encoder) con entradas multimodales: tokens, bytes UTF-8, hashes de subwords y geometria de discurso; detalles de capas y dimensiones internas no disponibles |
| Parametros totales | 3.322.986 (3,32 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en precision original PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (el corpus de entrenamiento cubre normativa fiscal de India y EE. UU., pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, 18,1 MB) y ONNX (opset 17, 13,73 MB) |
| Dimension de salida | 256 (hidden states por token) |
| Vocabulario de entrada | IDs de token, bytes UTF-8 por token (hasta 30), hashes de 4-gramas (8.192 buckets), 36 features de geometria, indice de clausula |

## Arquitectura y entrenamiento

El modelo es un codificador tipo transformer que recibe cinco flujos de entrada por token: IDs de vocabulario (`w_ids`), IDs de bytes UTF-8 acotados a 30 por token (`c_mat`), hashes de 4-gramas de subword con 8.192 buckets (`sw_ids`), un vector de 36 dimensiones de geometria de discurso y puntuacion (`g_feat`) y un indice de clausula (`c_idx`). Esta combinacion sugiere un diseno orientado a preservar informacion que los tokenizadores habituales pierden en texto legal: cifras exactas, porcentajes, referencias cruzadas y estructura de clausulas. La salida es un tensor `float32[batch, seq_len, 256]` de representaciones contextualizadas.

El preentrenamiento se realizo sobre el subconjunto fiscal del Unlabeled Statutory Tax Corpus (`corpus_2_5m.jsonl`), con 15.904 documentos estatutarios (64,7 MB) de India y EE. UU. El objetivo fue Salient Masked Language Modeling durante 8.000 pasos, priorizando el enmascaramiento de numeros estatutarios, porcentajes, referencias cruzadas y operadores deonticos. Las metricas internas reportadas por el autor son: perdida MLM final de 0,7644, perplejidad de 2,15, precision top-1 de 80,27 % y top-5 de 94,03 %. No se documenta uso de RLHF, DPO ni fases de ajuste supervisado.

## Capacidades

- Codificacion contextual de texto legal: genera representaciones de 256 dimensiones por token para fragmentos de normativa fiscal.
- Sensibilidad a elementos criticos del dominio: el objetivo de entrenamiento prioriza numeros, porcentajes, referencias cruzadas y operadores deonticos.
- Procesamiento de estructura de clausulas: la entrada `c_idx` permite al modelo distinguir el indice de clausula de cada token.
- Representacion a nivel de byte y subword: combina bytes UTF-8 y hashes de 4-gramas, lo que reduce la dependencia de un tokenizador concreto.
- Exportacion a ONNX: permite despliegue en runtime ONNX con paridad numerica verificada (diferencia maxima en CPU de 2,62e-06 respecto a PyTorch).
- No es un modelo generativo: no produce texto, no soporta tool calling, no implementa razonamiento multi-paso ni agentes, y no tiene capacidades de vision o audio.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Backbone de representacion en pipelines de ley a codigo: el modelo actua como etapa 0 del sistema law2code, convirtiendo fragmentos de normativa fiscal en vectores de 256 dimensiones que alimentan etapas posteriores de parsing y generacion de codigo. Es adecuado por su especializacion en lenguaje estatutario y su bajo coste computacional.
- Extraccion de caracteristicas para clasificacion de clausulas fiscales: las representaciones por token pueden alimentar clasificadores ligeros que etiqueten obligaciones, exenciones o tipos impositivos en documentos de India y EE. UU.
- Deteccion y normalizacion de referencias cruzadas: gracias al enmascaramiento saliente de referencias y numeros, el encoder puede usarse para localizar y resolver remisiones entre secciones de una ley.
- Busqueda semantica sobre corpus normativo: generar embeddings de fragmentos estatutarios para un motor de recuperacion en un asistente de consulta fiscal, ejecutable en CPU por su tamano reducido.
- Preprocesamiento en herramientas de cumplimiento normativo: servir como extractor de caracteristicas en sistemas que comparan redacciones de leyes o detectan cambios entre versiones de una norma.
- Despliegue en entornos con recursos limitados: con 13,73 MB en ONNX y ejecucion en CPU, puede integrarse en servicios de validacion documental sin GPU, por ejemplo en la fase de ingesta de un sistema de gestion fiscal.
- Prototipado e investigacion en NLP legal: como modelo pequeno y de licencia permisiva, sirve de base para experimentos de domain adaptation sobre normativa fiscal sin requerir infraestructura de entrenamiento costosa.

## Benchmarks y rendimiento

El autor publica unicamente metricas internas de entrenamiento, no benchmarks estandar comparables con otros modelos.

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 8.000 |
| Perdida MLM final | 0,7644 |
| Perplejidad (PPL) | 2,15 |
| Precision top-1 de token | 80,27 % |
| Precision top-5 de token | 94,03 % |
| Diferencia maxima ONNX vs PyTorch (CPU) | 2,62e-06 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Las cifras anteriores corresponden al objetivo MLM sobre el corpus de entrenamiento y no son comparables con evaluaciones de modelos generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32; el checkpoint PyTorch ocupa 18,1 MB y el ONNX 13,73 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1 GB de memoria es suficiente. Funciona en CPU sin problema.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo y ONNX Runtime (opset 17). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion facilitada. Los encoders legales de dominio especifico de tamano similar (por ejemplo, variantes de Legal-BERT o modelos legales compactos) no aparecen referenciados en la model card ni en los metadatos, y no se aportan datos de rendimiento que permitan una comparacion rigurosa. Por tanto, la comparativa se considera no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MudraForge Tax T1 Encoder | 3,32 M | No disponible | Apache 2.0 | Hugging Face (PyTorch, ONNX) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto ni responde a instrucciones; solo emite representaciones vectoriales. No debe evaluarse como un LLM.
- Dominio muy restringido: entrenado exclusivamente sobre normativa fiscal de India y EE. UU.; su comportamiento fuera de ese dominio no esta documentado.
- Idiomas no declarados: aunque el corpus es de India y EE. UU., no se especifica que idiomas cubre ni como rinde en textos en otros idiomas.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por secuencia, lo que impide planificar su uso en documentos largos sin validacion previa.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las representaciones pueden no capturar matices legales fuera de los patrones vistos en entrenamiento; cualquier uso en produccion legal requiere validacion humana.
- Sesgos: no se documentan analisis de sesgo; el corpus se limita a dos jurisdicciones, lo que puede introducir sesgo geografico y normativo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Madurez: el repositorio no registra descargas ni likes, y las metricas publicadas son internas y no verificadas de forma independiente; debe tratarse como un componente experimental.
- Dependencia del pipeline law2code: el modelo esta disenado como etapa 0 de un sistema mayor; su utilidad aislada fuera de ese pipeline no esta demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-tax-t1-encoder-3.3m
- Dataset del corpus: https://huggingface.co/datasets/MudraForge/law2code-corporate-f1-corpus
- Demo del sistema law2code (Space): https://huggingface.co/spaces/yamero999/law2code
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
