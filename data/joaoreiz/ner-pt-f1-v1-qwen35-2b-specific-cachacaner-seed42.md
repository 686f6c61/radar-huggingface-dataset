# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed42

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed42` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués. Ha sido desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`, que explora el ajuste fino de modelos de lenguaje para extracción estructurada de entidades mediante generación de texto con salida JSON restringida. El adaptador se basa en el modelo `Qwen/Qwen3.5-2B` y está entrenado con precisión BF16 y la técnica PEFT LoRA.

El modelo resuelve la tarea de NER en portugués de forma generativa, es decir, en lugar de clasificar token a token, genera directamente las etiquetas y los spans de entidades en formato estructurado. Es relevante porque ofrece una alternativa a los enfoques clásicos de token-classification, con una validación estructural del 100% en el conjunto de prueba del dataset cachacaner. El artefacto es una ejecución con semilla fija (seed 42) y régimen "specific", lo que limita su generalización a otros dominios o corpus.

La licencia no está disponible, y el repositorio incluye el adaptador LoRA, junto con scripts de investigación, predicciones congeladas, métricas y manifiestos de reproducibilidad. El modelo está pensado para investigación y evaluación controlada, no para producción de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (arquitectura del base no especificada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0.1 GB; el modelo base Qwen3.5-2B tiene 2B parametros, pero no se indica el numero exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16, pero no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base `Qwen/Qwen3.5-2B` en su revisión exacta `15852e8c16360a2fea060d615a32b45270f8a8fc`. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es transformer, MoE, etc.), pero al tratarse de Qwen3.5-2B se asume una arquitectura transformer densa de 2 mil millones de parametros. El adaptador LoRA se entrena con precisión BF16 y el dataset `cachacaner`, un corpus de NER en portugues. La seleccion del checkpoint se realiza mediante validacion end-to-end F1 sobre el conjunto de validacion, sin usar el test split para la seleccion.

La inferencia canonica se define con vLLM, temperatura 0, y generacion restringida a un esquema JSON denominado `labels_and_tokens`. Esto garantiza que la salida sea estructuralmente valida (el 100% de las predicciones cumplen el esquema). La politica para salidas invalidas es tratarlas como prediccion vacia en la puntuacion end-to-end. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el entrenamiento se limita a ajuste fino supervisado con LoRA.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, produciendo etiquetas y spans en formato JSON estructurado.
- Generacion de salidas con validacion estructural garantizada mediante esquema JSON restringido (`labels_and_tokens`).
- Inferencia determinista con temperatura 0, adecuada para tareas de extraccion donde se requiere consistencia.
- Integracion con vLLM para despliegue eficiente.
- Capacidad de reproducibilidad: se incluyen manifiestos, hashes y predicciones congeladas en el repositorio.
- No se reportan capacidades adicionales como tool calling, agentes, vision o audio; el modelo esta especializado en NER textual.

## Casos de uso

- Investigacion academica en NER para portugues: el modelo sirve como referencia en experimentos comparativos de extraccion de entidades, gracias a su protocolo reproducible y metricas documentadas.
- Evaluacion de pipelines de generacion estructurada: al garantizar validez estructural del JSON, puede usarse para probar sistemas de parsing y post-procesamiento.
- Extraccion de entidades en corpus periodisticos o literarios en portugues: el dataset cachacaner sugiere un dominio especifico, aunque no se detalla su contenido; el modelo puede aplicarse a textos similares con precaucion.
- Prototipado de sistemas de extraccion de informacion: su tamano reducido (adaptador sobre modelo de 2B) permite iterar rapidamente en entornos de desarrollo.
- Analisis de datos en ciencias sociales o humanidades digitales: extraccion de nombres propios, lugares y organizaciones en documentos en portugues.
- Comparacion con metodos clasicos de token-classification: los resultados de F1 (0.93) pueden contrastarse con modelos como BERTimbau u otros NER basados en CRF.

## Benchmarks y rendimiento

Se ha publicado un unico resultado en el dataset `cachacaner`, correspondiente a la ejecucion con seed 42 y regimen "specific". La tabla muestra las metricas reportadas en la model card:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9337 | 0.9263 | 0.9300 | 1.0000 |

No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GLUE. El autor advierte que estos resultados corresponden a una sola semilla y a un conjunto de datos congelado, y no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, por lo que el requisito principal es el modelo base Qwen3.5-2B.
- Para inferencia en BF16, el modelo base de 2B requiere aproximadamente 4-5 GB de VRAM (estimacion basada en el tamaño del modelo; no se proporcionan cifras oficiales).
- Es viable en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, y en GPUs profesionales como A10, A100 o H100.
- El despliegue se puede realizar con vLLM (recomendado en la model card), o con otras herramientas como llama.cpp, Ollama o TGI, siempre que soporten el formato del adaptador PEFT.
- La latencia y el throughput no estan documentados; al ser un modelo de 2B, se espera una latencia baja en hardware moderno, pero no se dispone de mediciones concretas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor no incluye comparaciones con otros sistemas de NER en portugues, ni con otros adaptadores generativos. Por tanto, no se puede establecer una tabla comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validacion JSON no garantiza la correccion del contenido.
- El modelo se ha evaluado solo en un dataset (cachacaner) y con una unica semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas prevista.
- No esta validado para decisiones de alto riesgo o autonomas; su uso debe limitarse a investigacion y experimentacion controlada.
- Los esquemas de anotacion de los corpus pueden diferir, y la superposicion de texto puede afectar a las estimaciones de rendimiento.
- La licencia no esta especificada; los usuarios deben revisar las licencias del dataset y del modelo base antes de cualquier uso comercial.
- El modelo solo soporta portugues; no se reportan capacidades multilingue.
- No se proporcionan detalles sobre sesgos especificos, pero al ser un modelo ajustado sobre un corpus concreto, puede heredar sesgos del dataset de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
