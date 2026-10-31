# Gabriel382/BioLaya

## Resumen

BioLaya es una colección de seis checkpoints de encoders no generativos para tareas biomédicas, publicada en un único repositorio de Hugging Face por Gabriel Henrique Alencar Medeiros, dentro del proyecto de investigación BioLaya en LITIS / Université de Rouen Normandie. El repositorio no es un modelo conversacional ni un checkpoint único de Transformers: contiene un modelo de decisión estructurado estilo Laya (~421M de parámetros, inicializado desde `convaiinnovations/laya`) y cinco clasificadores específicos basados en ModernBERT-large para NLI biomédica, NLI de ensayos clínicos y extracción de relaciones químico-proteína, fármaco-fármaco y biomédica general.

El problema que resuelve es la evaluación y clasificación de texto biomédico con encoders eficientes: inferencia determinista de baja latencia (12-48 ms por ejemplo en CPU/PyTorch según la tarea), calibración medida (ECE) y soporte de secuencias largas gracias a la arquitectura ModernBERT (hasta 8.192 tokens, aunque las cabezas de clasificación se evaluaron con límites de 512-1.024 tokens). Su relevancia actual radica en la ola de adaptaciones de ModernBERT a dominios especializados y en la creciente necesidad de clasificadores biomédicos auditables, con protocolos de evaluación documentados y métricas de calibración publicadas.

Cabe destacar la transparencia del autor: la model card advierte explícitamente que, aunque el archivo incluye configuraciones de DAPT biomédico, no hay prueba de que se haya aplicado a los seis checkpoints publicados, y que algunas evaluaciones usan splits de desarrollo en lugar de test oficiales. Esto es inusual y valioso para investigadores que necesiten reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders tipo BERT: 1 checkpoint Laya/ModernBERT de decisión (SystemOne) + 5 clasificadores ModernBERT-large |
| Parametros totales | ~421M (SystemOne); ~396M por clasificador ModernBERT-large (estimado a partir del modelo base; no disponible en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens (arquitectura ModernBERT); evaluado con límites de 512 tokens (4 tareas) y 1.024 tokens (NLI4CT) |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16 no especificados; repo de 8,8 GB para 6 checkpoints) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los cinco checkpoints "Standard" son fine-tunings directos de `answerdotai/ModernBERT-large`, un encoder transformer moderno con atención eficiente, soporte nativo de secuencias de hasta 8.192 tokens y rotary position embeddings. Cada cabeza se entrena como clasificador de secuencia binario o multiclase: NLI biomédica (BioNLI), NLI sobre ensayos clínicos (NLI4CT), relaciones químico-proteína (ChemProt), interacciones fármaco-fármaco (DDI2013) y relaciones biomédicas generales (BioRED). Las entradas codifican `context`, `subject` y `object` cuando la tarea lo permite.

El checkpoint "SystemOne" se inicializa desde `convaiinnovations/laya`, un encoder de decisión estructurado, y se evalúa sobre 11 fuentes de tareas de decisión (clasificación temática, NLI, routing, sentimiento, taxonomía de investigación). No hay datos publicados sobre el número de tokens de preentrenamiento ni sobre el uso de RLHF/DPO (no aplicable a encoders clasificadores). Un caveat importante documentado por el autor: existen configuraciones de DAPT biomédico en el repositorio, pero no evidencia de que se haya aplicado a los checkpoints liberados, por lo que no deben describirse como modelos con DAPT de 100M de tokens.

## Capacidades

- Clasificacion de texto binaria y multiclase en dominio biomedico (pipeline `text-classification`).
- NLI biomedica (bionli): inferencia textual sobre pares premisa-hipotesis del dominio.
- NLI sobre ensayos clinicos (nli4ct): verificacion de afirmaciones contra documentos de ensayos clinicos.
- Extraccion de relaciones: quimico-proteina (chemprot), interacciones farmaco-farmaco (ddi2013) y relaciones biomedicas generales (biored).
- Modelo de decision estructurado (SystemOne): routing, clasificacion tematica, NLI general y de dominio, analisis de sentimiento y clasificacion segun taxonomia de investigacion, en un unico encoder multi-tarea.
- Calibracion medible: se publican ECE top-1 por tarea, util para sistemas que requieren umbrales de confianza.
- No es generativo: no produce texto libre, no soporta chat, ni tool calling, ni razonamiento multi-paso.
- Unicamente en ingles.

## Casos de uso

- Filtrado de literatura biomedica: usar `standard/bionli` para verificar si una hipotesis esta sostenida por un abstract de PubMed, con 94,11% de accuracy y latencia media de 14,8 ms por par.
- Verificacion de afirmaciones en ensayos clinicos: `standard/nli4ct` para contrastar afirmaciones clinicas contra texto de ensayos, aunque el rendimiento publicado (50% de accuracy en 200 ejemplos de desarrollo) exige validacion adicional antes de uso real.
- Minado de interacciones farmaco-farmaco: `standard/ddi2013` para detectar pares de farmacos con interaccion documentada en textos clinicos, como primer filtro en pipelines de farmacovigilancia.
- Extraccion de relaciones quimico-proteina: `standard/chemprot` para anotacion asistida de relaciones en corpus de quimica medica; el bajo macro-F1 publicado (17,95%) lo hace adecuado solo como componente preliminar con revision humana.
- Routing de consultas en sistemas RAG biomedicos: SystemOne (tarea `routing_v2`, 84,33%) puede clasificar la intencion o el dominio de una consulta antes de dirigirla al recuperador o al modelo generativo adecuado.
- Clasificacion tematica y por taxonomia de investigacion: SystemOne alcanza 99,61% en `research_taxonomy_v21`, util para organizar automaticamente repositorios de articulos cientificos.
- Indexacion y busqueda semantica ligera: gracias a la latencia baja (11-21 ms por ejemplo) y a la compatibilidad con Transformers, cabe en pipelines de indexacion por lotes sobre grandes corpus clinicos en una sola GPU de consumo.

## Benchmarks y rendimiento

Resultados de los cinco clasificadores Standard (una ejecucion por checkpoint, semilla 42, segun `metrics/standard/<task>/summary.csv`):

| Tarea | Ejemplos evaluados | Accuracy | Macro-F1 | ECE (top-1) | Latencia mediana |
|---|---:|---:|---:|---:|---:|
| bionli | 3.599 | 94,11% | 93,55% | 0,0394 | 14,8 ms |
| nli4ct | 200 | 50,00% | 38,00% | 0,0242 | 47,7 ms |
| chemprot | 5.744 | 39,22% | 17,95% | 0,1039 | 19,7 ms |
| ddi2013 | 979 | 56,28% | 45,08% | 0,1202 | 12,1 ms |
| biored | 20.912 | 76,50% | 64,77% | 0,1707 | 20,8 ms |

Resultados de SystemOne (6.768 instancias de desarrollo de 11 fuentes; accuracy micro-agregada 89,44%, ECE top-1 0,0466, latencia mediana 11,1 ms):

| Fuente | Ejemplos | Accuracy |
|---|---:|---:|
| ag_news | 250 | 94,40% |
| banking77 | 400 | 96,00% |
| bionli | 2.000 | 94,25% |
| boolq | 400 | 91,75% |
| mnli | 550 | 86,91% |
| nli4ct | 200 | 62,00% |
| policy | 150 | 97,33% |
| policy_v2 | 1.200 | 85,92% |
| research_taxonomy_v21 | 768 | 99,61% |
| routing_v2 | 600 | 84,33% |
| sst5 | 250 | 52,40% |

Advertencias del propio autor: NLI4CT se evalua sobre 200 ejemplos de desarrollo, no sobre el test oficial; BioNLI usa un protocolo modificado de split de entrenamiento; y el macro-F1 agregado "ALL" de SystemOne no es comparable entre fuentes heterogeneas. No se han publicado comparaciones controladas frente a otras familias de modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cada encoder de ~400-421M de parametros ocupa aproximadamente 0,8 GB en fp16 o 1,6 GB en fp32; el repositorio completo (6 checkpoints) pesa 8,8 GB, coherente con pesos en fp32. Con cabeza de clasificacion, reservar 2-3 GB de VRAM por checkpoint cargado.
- GPU recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM es suficiente; no se requiere A100 ni H100 para inferencia. Para fine-tuning, una RTX 3090/4090 de 24 GB es adecuada para ModernBERT-large con batch moderado.
- Cabe en GPU de consumo: si, holgadamente. Incluso CPU es viable: las latencias publicadas (11-48 ms por ejemplo) corresponden al entorno original de evaluacion PyTorch, lo que indica que no se requiere GPU para cargas moderadas.
- Despliegue: libreria `transformers` con `AutoModelForSequenceClassification` y carga por `subfolder` (`systemone/`, `standard/bionli/`, etc.). La model card marca `inference: false`, por lo que la Inference API de Hugging Face no esta habilitada; hay que servirlo en propio entorno (PyTorch, o ONNX/TensorRT si se exporta por cuenta propia, no documentado). No hay soporte GGUF ni compatibilidad con llama.cpp/Ollama por ser un encoder.
- Throughput: con ~15-20 ms por ejemplo en el entorno original, un solo proceso puede procesar del orden de 50-65 ejemplos por segundo; el batching en GPU deberia multiplicar esta cifra, aunque no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tareas | Contexto | Licencia |
|---|---|---|---|---|---|
| BioLaya (6 checkpoints) | Encoders clasificadores biomedicos | ~421M (SystemOne) + 5x ModernBERT-large | NLI, relaciones, routing | 8.192 (arquitectura) | Apache-2.0 |
| Bio_ClinicalBERT (emilyalsentzer) | Encoder clinico (BERT-base) | ~110M | NER, clasificacion clinica | 512 | Apache-2.0 |
| PubMedBERT (microsoft/BiomedNLP) | Encoder biomedico (BERT-base) | ~110M | NER, relaciones, QA | 512 | Licencia Microsoft (uso restringido) |
| ModernBERT-large (answerdotai) | Encoder generalista | ~396M | Clasificacion general, retrieval | 8.192 | Apache-2.0 |

BioLaya se diferencia por ofrecer checkpoints especificos por tarea con metricas de calibracion publicadas y contexto potencialmente mayor (heredado de ModernBERT), a costa de un rendimiento desigual por tarea (ChemProt y DDI2013 con macro-F1 bajos) y sin la madurez de PubMedBERT en la literatura de referencia.

## Limitaciones y advertencias

- Rendimiento muy desigual por tarea: chemprot (macro-F1 17,95%) y ddi2013 (45,08%) estan lejos de nivel de produccion; nli4ct se evalua solo sobre 200 ejemplos de desarrollo, no sobre el test oficial.
- Riesgo de ambiguedad de entrada: en ChemProt, DDI2013 y BioRED algunas relaciones anotadas son indistinguibles dado el texto suministrado al modelo, y las etiquetas en conflicto se conservaron; consultar los recuentos de ambiguedad en la auditoria (`protocol/five_benchmarks_audit.json`).
- Protocolos de evaluacion no estandarizados: BioNLI usa un split modificado y SystemOne se evalua sobre tareas que participaron en el entrenamiento/seleccion, por lo que las cifras no son comparables directamente con otros trabajos.
- Sin evidencia de DAPT: no debe asumirse que los checkpoints recibieron preentrenamiento adaptativo biomedico, aunque el repositorio incluya configuraciones para ello.
- Sesgo de idioma y dominio: entrenado y evaluado unicamente en ingles; no hay datos sobre sesgos demograficos o de genero en los datos clinicos.
- No es generativo: no sirve para chat, resumen ni generacion de texto; cualquier pipeline debe tratarlo como clasificador.
- Calibracion variable: BioRED presenta ECE de 0,1707, por lo que sus probabilidades no deben usarse como confianza calibrada sin recalibracion.
- Uso clinico: la model card indica explicitamente que las metricas no constituyen evidencia de seguridad clinica; no usar en entornos medicos reales sin validacion regulatoria.
- Descargas: 0 en el momento de redaccion, sin comunidad de revision externa; tratar como modelo de investigacion temprana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Gabriel382/BioLaya
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Paper, blog o demo: no disponible en la informacion proporcionada.
