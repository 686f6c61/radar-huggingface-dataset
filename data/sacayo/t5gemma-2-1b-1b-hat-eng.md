# sacayo/t5gemma-2-1b-1b-hat-eng

## Resumen

`sacayo/t5gemma-2-1b-1b-hat-eng` es un adaptador LoRA para traducción de criollo haitiano (ht) a inglés (en), obtenido mediante ajuste fino supervisado del modelo base `google/t5gemma-2-1b-1b` sobre el subconjunto `hat-eng` del corpus `jhu-clsp/kreyol-mt`. No es un modelo completo: el repositorio (0,1 GB) contiene únicamente los pesos del adaptador en formato safetensors, por lo que su uso requiere descargar el modelo base y cargarlo con la librería `peft`.

El interés del artefacto es doble. Por un lado, aborda un par de lenguas de bajos recursos (criollo haitiano, con unos 12 millones de hablantes) para el que existen pocos sistemas abiertos y menos aún construidos sobre arquitecturas encoder-decoder modernas. Por otro, se apoya en T5Gemma 2, la familia de modelos encoder-decoder de Google derivada de Gemma, de ahí que la nomenclatura del modelo base indique una configuración de aproximadamente 1B de parámetros en el codificador y 1B en el decodificador.

Los resultados publicados por el autor en el split de test son modestos: BLEU 8,84 y chrF 38,72. Son cifras que sitúan el adaptador como un punto de partida reproducible para investigación y para experimentación, más que como un sistema listo para producción sin evaluación adicional en el dominio objetivo. El repositorio tiene 14 descargas y ningún "like" en el momento de redactar esta ficha, por lo que no cuenta con validación comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer encoder-decoder T5Gemma 2; modelo base `google/t5gemma-2-1b-1b` |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB). El modelo base se denomina "1b-1b", lo que sugiere ~1B en codificador y ~1B en decodificador; el total exacto no se detalla en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | ht (criollo haitiano) como lengua de origen; inglés como lengua de destino. No se documentan otros pares |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador LoRA); requiere `peft` + `transformers` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/t5gemma-2-1b-1b`, un modelo de la familia T5Gemma 2 de Google, que sigue el paradigma encoder-decoder (T5-like) aplicado a la arquitectura Gemma. Frente a los modelos decoder-only, esta configuración separa codificación de la secuencia fuente y generación de la secuencia destino, lo que encaja de forma natural con tareas de traducción automática y permite mecanismos de atención cruzada explícitos entre ambas lenguas. El adaptador en sí es un LoRA de bajo rango que congela los pesos del modelo base y entrena únicamente matrices de descomposición, de ahí que el repositorio ocupe solo 0,1 GB.

El entrenamiento se realizó sobre el subconjunto `hat-eng` del dataset `jhu-clsp/kreyol-mt`, un corpus de traducción para lenguas criollas mantenido por el JHU CLSP. La model card no especifica el número de tokens, la composición exacta del conjunto, la configuración del LoRA (rango, alpha, dropout), la tasa de aprendizaje ni el número de épocas. Tampoco se documenta si hubo etapas de alineación adicionales (RLHF, DPO) —en traducción supervisada lo habitual es entrenamiento directo sobre pares paralelos— ni si se aplicó decodificación especulativa o alguna técnica de inferencia optimizada. Toda esta información debe considerarse no disponible.

## Capacidades

- Traducción automática unidireccional de criollo haitiano a inglés, entrenada específicamente sobre el corpus `jhu-clsp/kreyol-mt`.
- Generación de texto condicionada a secuencia fuente mediante arquitectura encoder-decoder, con atención cruzada entre origen y destino.
- Evaluación mediante métricas estándar de traducción: BLEU, chrF y BERTScore (esta última declarada en los metadatos, sin valor publicado).
- Ajuste eficiente en parámetros: al ser un adaptador LoRA, puede combinarse con otras variantes sobre el mismo modelo base y cargarse/descargarse en memoria sin duplicar los pesos completos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- No se documenta capacidad multilingüe más allá del par ht→en, ni traducción inversa en→ht.

## Casos de uso

- Traducción de contenido humanitario y de respuesta a emergencias: el criollo haitiano es la lengua principal de Haití, país con alta exposición a desastres naturales; un adaptador abierto permite traducir informes de campo, mensajes de alerta y comunicaciones de ONG sin depender de APIs comerciales, aunque requiere revisión humana por la calidad limitada reflejada en BLEU 8,84.
- Atención al ciudadano en servicios públicos: administraciones con población haitiana pueden desplegar el adaptador on-premise para traducir formularios, reclamaciones o correos electrónicos al inglés antes de derivarlos a un agente, manteniendo los datos dentro de la infraestructura propia.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible sobre T5Gemma 2 para comparar estrategias de aumento de datos, tokenización o ajuste con otros corpus criollos, dado que el dataset y las métricas son públicos.
- Construcción y depuración de corpus paralelos: el adaptador puede generar traducciones candidatas de texto monolingüe haitiano que después se filtran y corrigen manualmente, acelerando la creación de datos paralelos adicionales para reentrenar el propio modelo.
- Traducción de subtítulos y contenido audiovisual de divulgación: para vídeos, pódcast o material educativo en criollo haitiano que se quiera publicar con subtítulos en inglés, con un paso posterior de postedición humana dada la métrica chrF de 38,72.
- Monitorización de medios y redes sociales: un pipeline puede traducir publicaciones en criollo haitiano a inglés para análisis de sentimiento, detección de desinformación o seguimiento de opinión pública, usando el adaptador como primer escalón antes de un modelo de clasificación en inglés.
- Preservación lingüística y docencia: permite generar glosas interlineales en inglés de textos en criollo haitiano para materiales didácticos o archivo, con la ventaja de que el adaptador es ligero y puede ejecutarse en hardware modesto.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test del subconjunto `hat-eng` de `jhu-clsp/kreyol-mt`:

| Metrica | Valor |
|---|---|
| BLEU | 8,84 |
| chrF | 38,72 |
| BERTScore | Declarada en los metadatos, sin valor publicado |

No se han publicado resultados comparativos frente a otros sistemas (NLLB-200, M2M-100, Opus-MT o traducción comercial) en la información disponible, ni desglose por dominio, longitud de frase o categoría morfológica. Tampoco se documenta el tamaño exacto del split de test ni el método de cálculo (por ejemplo, sacreBLEU frente a BLEU de corpus con otra tokenización), lo que limita la comparabilidad directa de las cifras.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero la inferencia exige cargar el modelo base completo `google/t5gemma-2-1b-1b`, de aproximadamente 2B parámetros totales según la nomenclatura (1B + 1B).
- VRAM estimada para el modelo base en fp16: en torno a 4-5 GB de pesos, más overhead de activaciones y caché; en 8 bits, aproximadamente 2-2,5 GB; en 4 bits, en torno a 1,2-1,5 GB. Son estimaciones por tamaño de parámetros, no cifras publicadas por el autor.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB en fp16 sin problemas; tarjetas de 8 GB pueden requerir cuantización de 8 o 4 bits.
- Para despliegue en servidor se puede usar `transformers` con `peft` (ruta documentada en la model card). vLLM, TGI, llama.cpp u Ollama no están documentados para este adaptador; para usarlos sería necesario fusionar el LoRA con el modelo base y, en el caso de llama.cpp, convertir a GGUF, un procedimiento no descrito por el autor.
- No se publican datos de latencia ni throughput. Como referencia orientativa por tamaño, un modelo encoder-decoder de ~2B parámetros en una GPU moderna suele ofrecer decenas de tokens por segundo en fp16, pero no hay medición oficial para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Observaciones |
|---|---|---|---|---|---|
| `sacayo/t5gemma-2-1b-1b-hat-eng` (este) | ~2B (base 1B+1B, no confirmado) + LoRA | No disponible | Adaptador LoRA sobre T5Gemma 2, ht→en | Gemma | BLEU 8,84 / chrF 38,72 en test; 14 descargas |
| NLLB-200 (distilled 600M / 1.3B / 3.3B) | 600M a 54B según variante | No disponible en la información proporcionada | Transformer encoder-decoder multilingüe, 200 lenguas incluido ht | CC-BY-NC 4.0 (variantes abiertas) | Cobertura multilingüe amplia; requiere verificar calidad específica ht→en |
| M2M-100 (418M / 1.2B) | 418M / 1.2B | No disponible | Transformer multilingüe many-to-many | MIT | Entrenado sobre pares directos; el criollo haitiano está entre las lenguas cubiertas |
| Opus-MT ht-en (Helsinki-NLP) | ~70-80M | No disponible | Transformer encoder-decoder específico por par | CC-BY 4.0 | Mucho más pequeño y ligero; la calidad relativa frente a este adaptador no está documentada en la información disponible |

No se dispone de comparaciones de BLEU o chrF directas entre estos sistemas y el adaptador en el mismo split de test, por lo que la tabla es orientativa en cuanto a características, no a rendimiento medido.

## Limitaciones y advertencias

- Calidad limitada: BLEU 8,84 y chrF 38,72 en test indican un sistema con errores frecuentes de fluidez y fidelidad; no es apto para producción sin postedición humana ni evaluación en el dominio concreto de uso.
- Unidireccional: solo traduce ht→en. No se ha entrenado ni evaluado para en→ht, y no se documenta comportamiento en otras lenguas.
- Sesgos y dominio: el criollo haitiano presenta variación dialectal y ortográfica notable (grafías alternativas, uso de apóstrofos, préstamos del francés). El corpus `jhu-clsp/kreyol-mt` puede no representar registros formales, técnicos o jurídicos, y el adaptador heredará esos sesgos de dominio y de estilo.
- Riesgo de alucinación: en traducción, los modelos encoder-decoder pueden omitir segmentos, duplicar contenido o inventar términos en frases largas o con nombres propios; sin métricas por longitud de frase no es posible acotar el riesgo.
- Sin validación comunitaria: 14 descargas y 0 "likes"; no hay informes independientes de calidad, ni model card extendida con hiperparámetros, composición del dataset o detalles de preprocesado.
- Restricciones de licencia: se hereda la licencia Gemma (Gemma Terms of Use), que impone obligaciones de atribución, una política de uso prohibido y condiciones específicas para redistribución y uso comercial. Es imprescindible revisar los términos antes de un despliegue comercial, y el adaptador no puede relicenciarse de forma incompatible.
- Dependencia del modelo base: cualquier uso requiere descargar `google/t5gemma-2-1b-1b`, aceptar su licencia y disponer de capacidad de cómputo para ~2B parámetros; el adaptador por sí solo no es ejecutable.
- Fechas y procedencia: el repositorio figura como creado y actualizado el 19 de octubre de 2026, con un único autor individual y sin paper asociado; conviene tratar los resultados como preliminares.
- Idiomas y contexto: no se documenta la longitud máxima de secuencia soportada, lo que impide garantizar traducción de documentos largos sin segmentación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sacayo/t5gemma-2-1b-1b-hat-eng
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/jhu-clsp/kreyol-mt
- Licencia Gemma (términos de uso): https://ai.google.dev/gemma/terms
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código, demos ni espacios asociados a este adaptador.
