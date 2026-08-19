# JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz. Se basa en el modelo `Qwen/Qwen3.5-4B` y se enmarca en la matriz de investigación `ner-pt-generative-2026-f1-v1`. El adaptador está diseñado para producir etiquetas y tokens mediante generación estructurada con JSON restringido, lo que garantiza una validez estructural del 100 % en el corpus evaluado.

Este artefacto resuelve la extracción de entidades en textos portugueses mediante un enfoque generativo, en lugar de la clasificación token a token tradicional. Su relevancia radica en la alta precisión (0,9428) y F1 (0,9377) obtenidas en el dataset `cachacaner`, aunque los resultados corresponden a una única semilla y a splits congelados, por lo que no deben generalizarse sin completar la matriz completa de tres semillas.

El adaptador se entrena en precisión BF16 con LoRA y se carga mediante PEFT sobre la revisión exacta del modelo base. La inferencia canónica se realiza con vLLM a temperatura 0 y con un esquema de salida restringido a `labels_and_tokens`, lo que asegura que las predicciones sean estructuralmente válidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (base model revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) |
| Parametros totales | No disponible (adaptador LoRA; tamaño del repositorio 0,1 GB) |
| Parametros activos | No aplica (adaptador, no modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | BF16 para entrenamiento; pesos en safetensors |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-4B` en su revisión exacta `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset `cachacaner`, con semilla 123 y régimen `specific`. La selección del checkpoint se basó en el F1 end-to-end sobre el conjunto de validación, sin utilizar el split de test para la selección.

La inferencia canónica emplea vLLM con temperatura 0 y un esquema de generación restringida a JSON (`labels_and_tokens`), lo que obliga al modelo a producir salidas estructuradas válidas. La política ante salidas inválidas es asignar una predicción vacía en la puntuación end-to-end. El repositorio incluye en `research/` las predicciones congeladas, métricas normales y decontaminadas, ablaciones de esquema, contratos de inferencia, el manifiesto de ejecución y hashes de reproducibilidad.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugués, produciendo etiquetas y tokens de forma estructurada.
- Generación de salidas JSON restringidas, garantizando validez estructural (100 % en el corpus evaluado).
- Soporte de inferencia con vLLM a temperatura 0 para resultados deterministas.
- Integración con el ecosistema PEFT para carga del adaptador sobre el modelo base.
- Capacidad de token-classification (pipeline de HuggingFace).
- Multilingüe: no, específico para portugués.

## Casos de uso

- Extracción de entidades en documentos jurídicos portugueses: el modelo puede identificar personas, organizaciones, fechas y lugares en contratos o sentencias, con salidas estructuradas que facilitan su integración en sistemas de gestión documental.
- Análisis de noticias y artículos periodísticos: permite extraer entidades para alimentar bases de datos de conocimiento o sistemas de recomendación de contenidos.
- Procesamiento de currículos y ofertas de empleo: identificación de habilidades, empresas y cargos en textos en portugués, útil para plataformas de reclutamiento.
- Monitorización de redes sociales: detección de menciones a marcas, personas o lugares en publicaciones, con un esquema de salida que evita errores de formato.
- Investigación académica en NLP: sirve como referencia para comparar enfoques generativos frente a métodos de clasificación secuencial en NER portuguesa.
- Automatización de atención al cliente: extracción de entidades en conversaciones o tickets para enrutamiento o análisis de sentimiento, aprovechando la validez estructural de las predicciones.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al dataset `cachacaner` con el split congelado y la semilla 123:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0,9428 | 0,9326 | 0,9377 | 1,0000 |

La model card advierte que estos resultados reflejan únicamente los splits congelados y una sola semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) para este adaptador.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM para este adaptador.
- La inferencia requiere cargar el modelo base `Qwen/Qwen3.5-4B` junto con el adaptador LoRA. El tamaño del adaptador es de 0,1 GB, pero el modelo base no tiene especificaciones públicas en esta ficha.
- Se recomienda hardware con soporte BF16, según la model card.
- La inferencia canónica se realiza con vLLM, por lo que se necesita una GPU compatible con CUDA y suficiente memoria para el modelo base (estimación orientativa: un modelo de 4B en BF16 ocupa aproximadamente 8 GB, más overhead, por lo que una GPU con 12-16 GB sería adecuada; este dato no está confirmado por el autor).
- No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para NER generativa en portugués sobre Qwen3.5-4B, y no se han publicado comparaciones con otros sistemas de NER en portugués.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no garantiza corrección semántica.
- Los esquemas de anotación difieren entre corpus, y puede haber solapamiento de texto que afecte a las estimaciones de rendimiento.
- Los resultados corresponden a un único dataset, split y semilla; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas.
- La licencia del modelo y del dataset no está especificada; los usuarios deben revisar las licencias del corpus y evaluar errores en su dominio objetivo.
- El adaptador debe cargarse con la revisión exacta del modelo base indicada; usar otra revisión puede degradar el rendimiento o causar incompatibilidades.

## Enlaces

- [HuggingFace: JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed123](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed123)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) (enlace inferido del campo `base_model`; no se proporciona URL directa en la documentación)
