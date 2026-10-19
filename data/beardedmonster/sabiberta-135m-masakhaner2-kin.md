# BeardedMonster/SabiBERTa-135M-masakhaner2-kin

## Resumen

SabiBERTa-135M-masakhaner2-kin es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por ajuste fino de `BeardedMonster/SabiBERTa-135M`, un encoder de arquitectura ModernBERT de 135.883.017 parámetros, sobre el corpus MasakhaNER 2.0 para el idioma kinyarwanda (`kin`). Lo publica el usuario BeardedMonster dentro de una familia de checkpoints derivados del mismo modelo base, uno por idioma del benchmark, generados con un arnés de evaluación propio que reproduce las líneas base publicadas de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1.

El problema que resuelve es acotado pero concreto: etiquetar entidades (personas, organizaciones, localizaciones y fechas) en texto en kinyarwanda, un idioma africano de bajos recursos para el que existen pocos modelos ajustados y menos aún con métricas declaradas. El checkpoint reporta un span F1 medio de 0,8095 sobre el protocolo `kin` del corpus, con un entrenamiento de 50 épocas, learning rate 5e-05, batch size 32 y longitud máxima de 256 tokens.

Es relevante ahora por dos motivos. Primero, permite construir pipelines de extracción de información en kinyarwanda sin entrenar desde cero. Segundo, la model card documenta explícitamente la procedencia de la métrica y sus límites (una sola ejecución, sin media sobre 5 semillas como en los papers de referencia), algo poco habitual en checkpoints derivados de bajo perfil. El repositorio no declara licencia propia: los términos del modelo base son los que gobiernan cualquier uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, tag `modernbert` en HuggingFace) |
| Parametros totales | 135.883.017 (dato real de los safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima configurada en el ajuste fino) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un modelo de 135,9 M de parámetros, la conversión a fp16/int8 es viable con herramientas estándar |
| Idiomas soportados | kinyarwanda (`kin`) únicamente |
| Licencia | no disponible (la model card remite a la licencia y términos de `BeardedMonster/SabiBERTa-135M`) |
| Formato de pesos | safetensors |
| Tarea | clasificación de tokens (`AutoModelForTokenClassification`), etiquetas IOB decodificables vía `id2label` |
| Corpus de ajuste | MasakhaNER 2.0, protocolo `kin` |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion (segun el repositorio) | 2026-10-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de base es ModernBERT, un encoder transformer presentado como sucesor de BERT con atención rotatoria (RoPE), activaciones GeGLU, normalización previa y soporte nativo de longitudes de contexto más largas que las de BERT clásico. En este checkpoint, sin embargo, la ventana efectiva queda fijada en 256 tokens por decisión del ajuste fino, no por limitación arquitectónica del backbone. La cabeza es una capa de clasificación de tokens sobre las representaciones del encoder, con `id2label` configurado para que las predicciones se decodifiquen directamente a nombres de etiqueta.

El entrenamiento consiste en un ajuste fino supervisado sobre MasakhaNER 2.0 para kinyarwanda: 50 épocas, learning rate de 5e-05, batch size de 32 y longitud máxima de 256. La métrica objetivo es span F1, y el resultado medio declarado es 0,8095 para el único idioma del protocolo. La model card no documenta composición exacta del dataset, número de tokens de entrenamiento, ni si hubo una fase de RLHF o preferencias (no aplicable en un modelo discriminativo de este tipo). El autor sí advierte de que la cifra procede de una sola ejecución, mientras que los papers de referencia promedian sobre 5 semillas; por tanto, las diferencias pequeñas frente a las líneas base publicadas deben tratarse como ruido. El arnés de evaluación reproduce los resultados publicados de MasakhaNER 2.0 con un margen de aproximadamente 0,25 F1, lo que da una idea del error sistemático del propio harness.

## Capacidades

- Reconocimiento de entidades nombradas en kinyarwanda: extracción de personas, organizaciones, localizaciones y fechas según el esquema de anotación de MasakhaNER 2.0.
- Clasificación de tokens a nivel de subtoken con etiquetas IOB, decodificables directamente a texto mediante el `id2label` incluido.
- Procesamiento de documentos de hasta 256 tokens por pasada, con la posibilidad de trocear textos más largos en ventanas y remapear índices.
- Ejecución en CPU y GPU de gama baja, al tratarse de un encoder de 135,9 M de parámetros.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling ni capacidades de agente.
- No soporta visión, audio ni modo de razonamiento explícito.
- No es multilingüe: está ajustado exclusivamente para `kin`.
- No se han documentado capacidades de zero-shot cross-lingual en la información proporcionada.

## Casos de uso

- Extracción de entidades en prensa digital en kinyarwanda: pasar artículos troceados en ventanas de 256 tokens por el modelo y consolidar las menciones de personas, organizaciones y lugares para alimentar un índice de entidades. El span F1 de 0,8095 es suficiente para un primer nivel de indexación con revisión humana en los casos dudosos.
- Construcción de grafos de conocimiento de ámbito regional: las entidades detectadas y sus contextos sirven para poblar nodos y aristas en un grafo de organizaciones y localizaciones de África Oriental, con desambiguación posterior mediante reglas o un modelo mayor.
- Preanotación asistida para equipos de anotación: el modelo etiqueta un corpus en kinyarwanda y los anotadores corrigen en lugar de anotar desde cero, reduciendo el coste por documento. La ventana de 256 tokens obliga a definir una política de solapamiento entre fragmentos.
- Monitorización de medios y alertas tempranas: detección de menciones a instituciones concretas en flujos RSS o scrapers, con un filtro posterior por palabra clave. El coste de inferencia es bajo porque el modelo cabe en cualquier GPU consumer.
- Enriquecimiento de datasets multilingües para investigación en NLP africano: usar el checkpoint como anotador débil de un subconjunto en kinyarwanda dentro de un corpus mayor, midiendo el acuerdo con anotaciones humanas antes de escalar.
- Búsqueda semántica con filtros por entidad: extraer entidades de los documentos antes de indexarlos en un motor de búsqueda, de modo que el usuario pueda restringir por persona u organización además de por relevancia textual.
- Evaluación comparativa de encoders pequeños para lenguas de bajos recursos: servir como punto de referencia de 135,9 M de parámetros frente a XLM-R o AfroXLMR en tareas NER de kinyarwanda, controlando que la métrica proviene de una sola ejecución.

## Benchmarks y rendimiento

Los únicos datos disponibles en la información proporcionada son los del ajuste fino realizado por el autor. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; esos benchmarks, además, no son aplicables a un modelo discriminativo de clasificación de tokens.

| Metrica | Protocolo | Valor | Notas |
|---|---|---|---|
| Span F1 (media) | masakhaner2, `kin` | 0,8095 | Una sola ejecución; el paper de referencia promedia 5 semillas |
| Epocas | masakhaner2, `kin` | 50 | Configuración declarada |
| Learning rate | masakhaner2, `kin` | 5e-05 | Configuración declarada |
| Batch size | masakhaner2, `kin` | 32 | Configuración declarada |
| Longitud maxima | masakhaner2, `kin` | 256 | Configuración declarada |

No se dispone de desglose por tipo de entidad ni de comparación numérica con las líneas base del paper dentro de la información proporcionada. La model card indica que las puntuaciones por idioma están en `metrics.json` del repositorio.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,55 GB solo para pesos (135,9 M de parámetros × 4 bytes), más activaciones. Con batch pequeño y longitud 256, el consumo total se mantiene por debajo de 2 GB.
- VRAM estimada en fp16: aproximadamente 0,28 GB para pesos; en int8, unos 0,14 GB. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no requiere GPU dedicada. Cualquier RTX 3060/4060, T4, L4 o superior ofrece latencia muy baja; A100/H100 solo tienen sentido para servir muchos flujos en paralelo con batching dinámico.
- Cabe en GPU consumer: sí, en todas las del mercado actual, y también en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, exportación a ONNX Runtime para inferencia en CPU, y servidores de inferencia con soporte de ModernBERT (verificar la versión concreta del runtime antes de desplegar). Formatos como GGUF/llama.cpp y Ollama no están pensados para encoders de clasificación de tokens de este tipo y no se documentan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera que el cuello de botella sea el preprocesado y el troceado de documentos, no la inferencia.

## Comparativa con modelos similares

Las cifras de parámetros de los modelos alternativos son datos públicos de arquitectura; sus resultados en MasakhaNER 2.0 para `kin` no están disponibles en la información proporcionada, por lo que no se comparan numéricamente.

| Modelo | Parametros | Contexto | Tipo | Licencia | Resultado en `kin` |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-kin | 135,9 M | 256 tokens (configurado) | Encoder ModernBERT + cabeza NER | no disponible | span F1 0,8095 (una ejecución) |
| XLM-RoBERTa-base ajustado a MasakhaNER 2.0 | ~278 M | 512 tokens | Encoder transformer multilingüe | MIT (modelo base) | no disponible |
| AfroXLMR-base ajustado a NER | ~278 M | 512 tokens | Encoder transformer multilingüe adaptado a lenguas africanas | MIT/Apache-2.0 segun variante, verificar | no disponible |
| mBERT ajustado a NER | ~178 M | 512 tokens | Encoder transformer multilingüe | Apache-2.0 | no disponible |

La comparación cualitativa relevante: este checkpoint es aproximadamente la mitad de grande que XLM-R base y AfroXLMR base, lo que reduce coste de inferencia y huella de memoria a cambio de renunciar a la transferencia cross-lingual. Su ventaja principal no es el rendimiento bruto, sino la trazabilidad de la métrica y la ligereza del despliegue.

## Limitaciones y advertencias

- Modelo monolingüe: solo cubre kinyarwanda (`kin`). No se debe esperar transferencia a otras lenguas, ni siquiera cercanas, sin un ajuste adicional.
- Ventana de 256 tokens: insuficiente para documentos completos. Cualquier uso sobre textos largos exige troceado con solapamiento y remapeo de offsets, lo que introduce errores en fronteras de fragmento.
- Métrica de una sola ejecución: el propio autor advierte que las diferencias pequeñas frente a las líneas base publicadas (que promedian 5 semillas) deben considerarse ruido. No hay intervalos de confianza ni desviaciones declaradas.
- Dominio del corpus: MasakhaNER 2.0 se construye sobre texto periodístico, por lo que el rendimiento puede degradarse en dominios como conversación, texto legal, médico o redes sociales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de fronteras de entidad incorrectas, especialmente en entidades anidadas o en nombres propios poco frecuentes.
- Sesgos: no documentados en la información proporcionada. Cabe esperar los sesgos de cobertura del corpus de noticias de origen (sobrerrepresentación de figuras políticas e institucionales frente a otro tipo de entidades).
- Licencia: el checkpoint no declara licencia propia. La model card remite a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M`, que no está disponible en esta información. No se debe asumir uso comercial permitido sin verificar esa cadena.
- Madurez: repositorio con 0 descargas y 0 likes, sin pipeline declarado en HuggingFace y con fecha de creación avanzada respecto al momento de la consulta. Tratarlo como experimental y validarlo contra un conjunto de evaluación propio antes de producción.
- Sin garantías de mantenimiento: no hay evidencia de versionado, changelog ni soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-kin
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Repositorio del corpus MasakhaNER 2.0 y papers asociados: no disponible en la información proporcionada (la búsqueda web realizada no devolvió resultados relevantes sobre el modelo, el corpus ni la arquitectura).
- Demos, blogs o repositorios adicionales: no disponible.
