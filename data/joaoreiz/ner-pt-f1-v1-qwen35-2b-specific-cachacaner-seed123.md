# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués. Ha sido desarrollado por JoaoReiz como parte de la matriz de investigación `ner-pt-generative-2026-f1-v1`, que explora el uso de modelos de lenguaje generativos para tareas de etiquetado estructurado. El adaptador se basa en el modelo `Qwen/Qwen3.5-2B` y está diseñado para producir salidas en formato JSON restringido mediante inferencia con vLLM a temperatura cero.

Este artefacto resuelve el problema de extraer entidades de textos en portugués usando un enfoque generativo, en lugar de los clasificadores de token tradicionales. Su relevancia radica en la combinación de un modelo base ligero (2B parámetros) con un adaptador de bajo rango, lo que permite desplegar NER con requisitos de hardware moderados. La ficha documenta una ejecución específica con el dataset `cachacaner`, semilla 123 y régimen de entrenamiento `specific`, con resultados de F1 de 0.9340 en la partición de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.5-2B, un transformer decoder de 2.000 millones de parametros. El entrenamiento se realizó en precision BF16 con LoRA, usando el dataset `cachacaner` (cuyo contenido y tamaño no se detallan en la documentacion disponible). La seleccion del checkpoint se hizo mediante la metrica F1 end-to-end sobre la particion de validacion, sin usar la particion de test para la seleccion. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

La inferencia canonica se define con vLLM, temperatura 0 y generacion restringida a JSON con el esquema `labels_and_tokens`. La politica para salidas invalidas es predecir una salida vacia en la evaluacion end-to-end. El repositorio incluye artefactos de reproducibilidad como predicciones congeladas, metricas decontaminadas, ablaciones de esquema, contratos de inferencia y un manifiesto con las versiones de software.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugues: genera etiquetas y tokens en formato JSON estructurado.
- Generacion de texto con restriccion de esquema: soporta salidas JSON validas gracias a la generacion restringida con vLLM.
- Alta validez estructural: el 99,96% de las salidas son estructuralmente validas en el dataset de prueba.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal.
- No se especifican capacidades multilingues mas alla del portugues.

## Casos de uso

- Extraccion de entidades en textos legales portugueses: el modelo puede identificar personas, organizaciones, fechas y lugares en documentos juridicos, con salidas estructuradas para integracion en bases de datos.
- Analisis de noticias en portugues: permite extraer entidades de articulos periodisticos para alimentar sistemas de monitorizacion de medios o de analisis de tendencias.
- Investigacion academica en NLP: sirve como punto de partida para comparar enfoques generativos frente a clasificadores de token en NER portugues, gracias a su documentacion de reproducibilidad.
- Enriquecimiento de corpus: puede anotar automaticamente grandes volumenes de texto en portugues para crear datasets de entrenamiento o ampliar ontologias.
- Sistemas de preguntas y respuestas sobre documentos: las entidades extraidas pueden usarse como indices para recuperacion de informacion en dominios especificos.
- Pipelines de procesamiento de lenguaje natural en produccion: al ser un adaptador ligero sobre un modelo de 2B, puede integrarse en servicios con requisitos de latencia moderados usando vLLM.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en la particion de prueba del dataset `cachacaner`:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9386 | 0.9294 | 0.9340 | 0.9996 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. Los resultados corresponden a una unica semilla y a particiones congeladas; la incertidumbre entre semillas requiere completar la matriz de tres semillas.

## Requisitos de hardware

- No se documentan requisitos especificos de VRAM en la informacion disponible.
- El adaptador LoRA es pequeno (0.1 GB en el repositorio), pero el modelo base Qwen3.5-2B requiere aproximadamente 4 GB en BF16 (estimacion orientativa, no confirmada por el autor).
- Se espera que sea desplegable en GPUs consumer como RTX 3060 o superiores, aunque no hay datos oficiales.
- La inferencia canonica usa vLLM, que soporta generacion restringida y optimizaciones de throughput.
- No se indican opciones de despliegue alternativas como llama.cpp u Ollama, pero al ser un adaptador PEFT, es compatible con el ecosistema de Hugging Face Transformers.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de NER en portugues ni con adaptadores similares.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no garantiza la correccion del contenido.
- Los esquemas de anotacion difieren entre corpus; el modelo fue entrenado y evaluado solo en el dataset `cachacaner`, por lo que su rendimiento en otros dominios puede degradarse.
- El solapamiento de texto entre particiones puede afectar a las estimaciones de rendimiento, aunque se mencionan metricas decontaminadas en el repositorio.
- No ha sido validado para decisiones de alto riesgo ni para uso autonomo en produccion.
- La licencia no esta disponible, lo que limita la reutilizacion comercial sin aclaracion legal.
- Los resultados son de una unica semilla y no deben interpretarse como evidencia de rendimiento general fuera de los corpus evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B (referencia externa, no incluida en la informacion original)
