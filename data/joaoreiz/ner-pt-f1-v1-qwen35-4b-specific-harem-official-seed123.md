# JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo de lenguaje `Qwen/Qwen3.5-4B` y se ha entrenado específicamente sobre el corpus oficial `harem_official`, uno de los estándares de referencia para NER en portugués europeo. El adaptador forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes regímenes de entrenamiento, semillas y configuraciones para NER generativo con salida estructurada.

El modelo resuelve el problema de extraer entidades nombradas (personas, organizaciones, lugares, etc.) de texto en portugués mediante generación de etiquetas y tokens en formato JSON constreñido, en lugar de la clasificación token a token clásica. Su relevancia radica en que combina un LLM moderno de 4B parámetros con un adaptador ligero (0.1 GB) y una inferencia determinista (temperatura 0) que garantiza una validez estructural del 99.92% en el conjunto de prueba. Es una herramienta pensada para investigación y evaluación controlada, no para producción de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB en safetensors; el modelo base tiene aproximadamente 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (entrenado en BF16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA sobre el modelo base `Qwen/Qwen3.5-4B` en precisión BF16. El régimen de entrenamiento se denomina `specific`, lo que sugiere que el adaptador se ajusta específicamente al corpus `harem_official` (frente a un régimen generalista). La selección de checkpoint se realiza por F1 end-to-end en el conjunto de validación, sin usar el test split para la selección. La inferencia canónica se ejecuta con vLLM a temperatura 0 y con una salida JSON constreñida al esquema `labels_and_tokens`, lo que fuerza al modelo a generar pares etiqueta-token de forma estructurada. La política ante salidas inválidas es la predicción vacía en el scoring end-to-end.

No se documenta el número de tokens de entrenamiento, la composición del dataset (más allá del corpus harem_official) ni el uso de técnicas como RLHF o DPO. El entrenamiento es puramente supervisado sobre el corpus de NER.

## Capacidades

- Reconocimiento de entidades nombradas en portugues (personas, organizaciones, lugares, etc.) mediante generacion de etiquetas y tokens.
- Salida estructurada en JSON con esquema `labels_and_tokens`, lo que facilita la integracion en pipelines posteriores.
- Alta validez estructural (99.92% en el test de harem_official), es decir, casi siempre genera JSON sintacticamente correcto.
- Inferencia determinista (temperatura 0) para resultados reproducibles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, vision o audio; es un modelo puramente de NER.

## Casos de uso

- Investigacion academica en NER para portugues: el adaptador permite reproducir experimentos sobre el corpus harem_official y comparar metricas de F1, precision y recall con otros sistemas.
- Evaluacion de esquemas de anotacion: al ser un modelo generativo, puede probarse con distintos esquemas de etiquetas y estudiar como afectan al rendimiento.
- Extraccion de entidades en textos periodisticos o literarios portugueses: el corpus harem_official incluye textos de esa naturaleza, por lo que el modelo es adecuado para tareas similares.
- Prototipado de sistemas de extraccion de informacion: la salida JSON constreñida facilita la conexion con bases de datos o APIs.
- Comparacion entre NER clasico (token classification) y NER generativo: este adaptador sirve como referencia para estudiar las diferencias de rendimiento y robustez.
- Experimentacion controlada en downstream tasks: por ejemplo, usar las entidades extraidas para alimentar sistemas de busqueda semantica o de recomendacion, siempre que se validen los errores en el dominio objetivo.

## Benchmarks y rendimiento

Segun la model card, los resultados en el test de harem_official son los siguientes:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0.8338 | 0.8283 | 0.8310 | 0.9992 |

Estos resultados corresponden a una unica semilla (seed 123) y a los splits congelados del corpus. La model card advierte que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus, y que la incertidumbre entre semillas requiere completar la matriz de tres semillas. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), pero requiere cargar el modelo base Qwen/Qwen3.5-4B completo para la inferencia.
- Un modelo de 4B parametros en BF16 ocupa aproximadamente 8 GB de VRAM; con cuantizacion de 8 bits o 4 bits puede caber en GPUs consumer de 8-12 GB (por ejemplo, RTX 3080, RTX 4060 Ti, RTX 4070).
- Para la inferencia canónica se recomienda vLLM, que soporta generacion con restriccion de esquema JSON.
- Tambien es posible usar PEFT para cargar el adaptador sobre el base model en frameworks como Hugging Face Transformers.
- No se disponen de datos de latencia o throughput especificos; dependeran del hardware y de la longitud de los textos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos: el modelo puede producir JSON bien formado con entidades erroneas.
- El rendimiento solo se ha evaluado sobre el corpus harem_official; no hay evidencia de generalizacion a otros dominios o variedades del portugues.
- Los esquemas de anotacion difieren entre corpus; si se aplica a otro dataset, las etiquetas pueden no coincidir.
- El solapamiento de texto entre splits puede inflar las estimaciones de rendimiento; la model card menciona que se han aplicado metricas decontaminadas, pero no se detallan.
- No validado para decisiones de alto riesgo o autonomas; requiere supervision humana.
- La licencia no esta disponible, por lo que el uso comercial es incierto; ademas, debe revisarse la licencia del corpus harem_official y la del modelo base Qwen3.5-4B.
- Resultados basados en una sola semilla; la variabilidad entre semillas no esta cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed123
- Modelo base (referencia): Qwen/Qwen3.5-4B (no se proporciona URL directa en la documentacion)
