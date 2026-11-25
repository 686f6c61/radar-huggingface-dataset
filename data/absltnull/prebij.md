# absltnull/prebij

## Resumen

preBIJ (predBor Identifikator Jezika) es un modelo de clasificación de texto especializado en distinguir entre bosnio, croata y serbio, tres variedades estándar del serbocroata (BCS) que comparten un alto grado de inteligencia mutua y cuyo etiquetado automático resulta problemático para modelos multilingües genéricos. Lo desarrolla el usuario independiente absltnull como un fine-tune directo de su modelo base predBor-v1, un pequeño modelo de lenguaje nativo de BCS que el autor había retirado previamente para centrarse en una nueva generación de modelos Bor.

Técnicamente, preBIJ transforma el modelo causal predBor-v1 en un clasificador de secuencias de tres clases mediante `LlamaForSequenceClassification`, conservando el tokenizador nativo BorTokenizer-v2 (65.000 tokens) y todo el conocimiento lingüístico del modelo base, y sustituyendo la cabeza de generación por una cabeza de clasificación inicializada aleatoriamente y entrenada sobre el dataset `absltnull/bcs-lang-id` (más de 90.000 ejemplos etiquetados).

Su relevancia radica en que supera al modelo de referencia RoBERTo-v2 en precisión (0,919 frente a 0,868) y, sobre todo, corrige el sesgo extremo de este último hacia el cirílico, que etiqueta sistemáticamente todo texto en cirílico como serbio. preBIJ alcanza un 79,2 % de acierto en bosnio cirílico sin haber sido entrenado explícitamente con muestras en ese alfabeto, lo que demuestra una generalización heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForSequenceClassification (transformer decoder-only adaptado a clasificación) |
| Parametros totales | 779.397.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (entrenado hasta 196, preciso hasta 1024, sin probar más allá) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | absltnull/predBor-v1 |
| Tokenizador | BorTokenizer-v2, vocabulario de 65.000 tokens |
| Clases de salida | bs, hr, sr |
| Alfabetos soportados | Bosnio (latino, cirílico), serbio (latino, cirílico), croata (latino) |
| Tarea | text-classification (identificación de idioma, LID) |
| Dataset de entrenamiento | absltnull/bcs-lang-id (más de 90.000 ejemplos) |

## Arquitectura y entrenamiento

preBIJ parte de predBor-v1, un modelo de lenguaje causal nativo de BCS, y lo reconvierte en clasificador de secuencias mediante `AutoModelForSequenceClassification.from_pretrained("absltnull/predBor-v1", num_labels=3)`. Este procedimiento descarta la cabeza de modelado de lenguaje y la sustituye por una cabeza de clasificación de tres salidas inicializada aleatoriamente, manteniendo intactos los pesos del cuerpo transformer. El resultado es un `LlamaForSequenceClassification` con 779 millones de parámetros y un tokenizador nativo BorTokenizer-v2 de 65.000 tokens, diseñado específicamente para las variedades BCS.

El entrenamiento se realizó sobre el dataset propio `absltnull/bcs-lang-id`, con más de 90.000 ejemplos etiquetados de las tres lenguas. Según la model card, el proceso duró aproximadamente cuatro horas en una RTX 2050 y la pérdida de entrenamiento cayó por debajo de 1,0 en el primer 4 % de las iteraciones, con una pérdida final de 0,2. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales, ni se detalla la composición exacta del dataset más allá del número de ejemplos. La innovación destacable no es arquitectónica sino metodológica: el autor demuestra que la cabeza de clasificación aprende a explotar el conocimiento lingüístico diverso del modelo base en lugar de atajos superficiales, lo que se traduce en generalización a alfabetos no vistos durante el fine-tune.

## Capacidades

- Clasificación de texto en tres clases (bosnio, croata, serbio) con una única etiqueta de salida por entrada.
- Identificación de idioma en alfabeto latino para las tres variedades, con precisión declarada del 89,2 % en bosnio latino, 95,0 % en serbio latino y 92,1 % en el conjunto general latino.
- Identificación de idioma en alfabeto cirílico para bosnio y serbio, con precisión declarada del 79,2 % en bosnio cirílico y 95,9 % en serbio cirílico.
- Robustez frente a la ausencia de diacríticos: mantiene el 92,1 % de precisión tanto en texto latino estándar como en texto ASCII sin signos diacríticos.
- Generalización a alfabetos no vistos durante el fine-tune (cirílico), heredada del modelo base.
- Integración con la librería `transformers` mediante `pipeline("text-classification")` y compatibilidad con text-embeddings-inference y endpoints.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, capacidades de agente, visión ni audio: es un clasificador puro.

## Casos de uso

- Moderación y enrutado de contenido en plataformas regionales: el modelo permite etiquetar automáticamente textos en bosnio, croata o serbio para dirigirlos al equipo de revisión o al recurso localizado correspondiente, aprovechando que distingue variedades que los modelos multilingües genéricos suelen confundir.
- Normalización de corpus lingüísticos: investigadores que construyen corpus de BCS pueden usar preBIJ para separar automáticamente las tres variedades antes del análisis, con la ventaja de que funciona tanto en latino como en cirílico, algo que RoBERTo-v2 no logra.
- Filtrado de datasets para entrenamiento de modelos: en la curación de datos multilingües, preBIJ actúa como etiquetador de idioma de alta precisión para descartar o reclasificar documentos BCS mal etiquetados por herramientas genéricas.
- Procesamiento de documentos históricos o administrativos con mezcla de alfabetos: la capacidad de reconocer bosnio en cirílico (79,2 %) y serbio en latino (95,0 %) resulta útil en archivos de Bosnia y Herzegovina, donde ambos alfabetos coexisten en el mismo fondo documental.
- Análisis de opiniones y redes sociales: para clasificar reseñas o publicaciones por variedad lingüística y segmentar estudios de mercado o sociolingüísticos por región, con la ventaja de tolerar texto sin diacríticos típico de las redes.
- Preetiquetado en pipelines de anotación humana: el modelo puede generar etiquetas preliminares de idioma sobre grandes volúmenes de texto para que los anotadores solo revisen los casos dudosos, reduciendo el coste de proyectos de anotación lingüística.
- Enrutado en sistemas de atención al cliente: si una organización opera en las tres variedades, preBIJ permite dirigir cada consulta al agente o a la plantilla de respuesta en la variedad correcta, mejorando la percepción de proximidad lingüística.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, comparando preBIJ con RoBERTo-v2:

| Prueba | Metrica | preBIJ | RoBERTo-v2 |
|---|---|---|---|
| Conjunto general | Accuracy | 0,919 | 0,868 |
| Conjunto general | F1 | 0,919 | 0,868 |
| Bosnio latino | Accuracy | 0,892 | 0,847 |
| Bosnio cirilico | Accuracy | 0,792 | 0,000 |
| Serbio latino | Accuracy | 0,950 | 0,871 |
| Serbio cirilico | Accuracy | 0,959 | 1,000 |
| Latin con diacriticos | Accuracy | 0,921 | 0,859 |
| ASCII sin diacriticos | Accuracy | 0,921 | 0,851 |

Pérdida final de entrenamiento: 0,2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable dado que se trata de un clasificador especializado y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB (779 millones de parámetros × 4 bytes), más el overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB, que coincide con el tamaño del repositorio.
- Cabe holgadamente en GPU de consumo: RTX 2050 (la usada por el autor para entrenar), RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problema.
- También puede ejecutarse en CPU para volúmenes moderados, dado su tamaño reducido.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, text-embeddings-inference (etiqueta presente en el repo), endpoints compatibles de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, y al ser un clasificador con cabeza de tres clases estos motores de generación no son la vía natural.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo de la cabeza duró unas cuatro horas en una RTX 2050, lo que sugiere que la inferencia por lote es muy ligera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Accuracy declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| preBIJ | 779 M | 4096 (preciso hasta 1024) | Clasificacion BCS (3 clases) | 0,919 | MIT | Hugging Face |
| RoBERTo-v2 | no disponible | no disponible | Clasificacion BCS | 0,868 | no disponible | Referenciado en la model card |
| predBor-v1 | no disponible | no disponible | Modelo de lenguaje BCS (retirado) | no aplica (generativo) | no disponible | Retirado por el autor |

La comparación directa disponible se limita a RoBERTo-v2, sobre el que preBIJ declara una ventaja de 5,1 puntos de accuracy y F1 en el conjunto general, y una ventaja decisiva en texto cirílico bosnio (79,2 % frente a 0 %). No se dispone de datos de otros clasificadores BCS en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso generativo requiere el modelo base predBor-v1, que está retirado.
- Solo cubre tres clases (bs, hr, sr); no identifica otras lenguas ni variedades del serbocroata más allá de las tres estándar.
- La precisión cae en bosnio cirílico (79,2 %) respecto al resto de combinaciones, y el autor reconoce que el modelo nunca vio muestras en cirílico durante el fine-tune: la generalización es heredada y no está garantizada en dominios alejados del dataset de entrenamiento.
- La longitud de contexto efectiva es limitada: entrenado hasta 196 tokens, con precisión mantenida hasta 1024 y sin probar más allá, pese a que la arquitectura admite 4096.
- Riesgo de sesgo derivado del dataset `bcs-lang-id`: al provenir de una única fuente, la distribución de dominios, registros y géneros puede no representar el uso real, y el modelo puede fallar en textos muy cortos, dialectales o con mezcla de variedades.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de etiquetado erróneo con alta confianza en entradas ambiguas o fuera de distribución.
- Licencia MIT: permite uso comercial y modificación sin restricciones significativas, pero el autor no ofrece garantías ni soporte; el modelo se publica como proyecto personal.
- Modelo con muy baja adopción (30 descargas, 0 likes en el momento de la consulta) y sin validación independiente de los resultados declarados; las cifras de rendimiento proceden únicamente de la model card del autor.
- El modelo base predBor-v1 está retirado, lo que puede afectar a la reproducibilidad del fine-tune y a la disponibilidad de artefactos relacionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/absltnull/prebij
- Modelo base: https://huggingface.co/absltnull/predBor-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/absltnull/bcs-lang-id
- Repositorio de referencia de RoBERTo-v2: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
