# EmmanuelHardey/dsn-lid-afrihubert-run-seed123

## Resumen

`dsn-lid-afrihubert-run-seed123` es un clasificador de audio para identificación de lengua hablada (LID, *language identification*) publicado por el usuario de HuggingFace EmmanuelHardey en el contexto de Data Science Nigeria (DSN) 2026. Distingue 12 lenguas nigerianas —yoruba (yor), igbo (ibo), hausa (hau), eggon (ego), anwa (anw), efik (efi), ibibio (ibb), idu, igala (igl), nupe (nup), tiv y urhobo (urh)— más una clase comodín `other`. No es un modelo generativo: recibe una señal de audio y devuelve logits por clase, por lo que su utilidad está en el preprocesamiento y el enrutamiento dentro de pipelines de voz.

Técnicamente es un *fine-tune* supervisado de `ajesujoba/AfriHuBERT`, un HuBERT de continuación de preentrenamiento sobre `utter-project/mHuBERT-147`. El checkpoint contiene 94.571.917 parámetros (unos 94,6 M) almacenados en fp16 en formato `safetensors`, con un repositorio de 0,2 GB. La cabeza es `HubertForSequenceClassification`, es decir, un *pooling* sobre el encoder transformer más una proyección lineal a 13 clases.

Su relevancia es doble: por un lado cubre lenguas africanas de bajos recursos que rara vez aparecen en los LID comerciales; por otro, el autor documenta un pipeline de entrenamiento cuidadoso (augmentación de canal, SpecAugment, balanceo por clase y fuente, promediado de pesos) que es replicable. La contrapartida es que no hay métricas publicadas, el modelo tiene 0 descargas y la licencia no está declarada, lo que limita su uso en producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT (encoder transformer) con cabeza de clasificación de secuencia (`HubertForSequenceClassification`) |
| Parametros totales | 94.571.917 (~94,6 M), dato real de los `safetensors` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en la práctica opera sobre ventanas de audio de 5 s (recortes aleatorios en entrenamiento, *tiling* para clips más cortos) |
| Tipos de cuantizacion | no se documentan cuantizaciones publicadas; los pesos se distribuyen en fp16 y son convertibles a fp32/ONNX por el usuario |
| Idiomas soportados | 12 lenguas nigerianas (yor, ibo, hau, ego, anw, efi, ibb, idu, igl, nup, tiv, urh) más la clase `other` |
| Licencia | no disponible (la model card remite a las licencias de `ajesujoba/AfriHuBERT` y `utter-project/mHuBERT-147`) |
| Formato de pesos | `safetensors` en fp16 |
| Tarea | clasificación de audio (identificación de lengua), 13 clases |
| Modelo base | `ajesujoba/AfriHuBERT`, continuación de `utter-project/mHuBERT-147` |
| Datos de entrenamiento | `Data-Science-Nigeria/dsn-2026-lid-train` (train + validation fusionados), sin datasets externos |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de AfriHuBERT, un HuBERT entrenado de forma autosupervisada sobre habla africana a partir de mHuBERT-147, que a su vez es un modelo multilingüe preentrenado con el objetivo de HuBERT sobre 147 lenguas. Sobre ese *backbone* se añade una cabeza de clasificación y se ajusta de forma totalmente supervisada con entropía cruzada y *label smoothing* de 0,1 sobre las 13 clases del corpus DSN 2026. No hay RLHF, DPO ni preferencias humanas: es un clasificador discriminativo, no un generador.

El procedimiento de entrenamiento descrito en la model card incluye recortes aleatorios de 5 s con *tiling* para clips más cortos, muestreo balanceado por clase y por fuente (para evitar que un canal o un dataset dominen el gradiente), augmentación de canal (limitación de banda, ida y vuelta a 8 kHz, reverberación y ruido aditivo), SpecAugment y promediado de pesos de los tres últimos checkpoints de época (un esquema tipo SWA). Los pesos finales se serializan en fp16. La combinación de augmentación agresiva de canal y balanceo sugiere que el autor priorizó robustez frente a condiciones de grabación heterogéneas —algo habitual en corpus de campo— sobre la precisión bruta en el dominio de entrenamiento, aunque no se publican ablaciones que lo cuantifiquen.

## Capacidades

- Clasificación de audio en 13 clases: 12 lenguas nigerianas más `other`.
- Funciona con clips de aproximadamente 5 s; para clips más cortos aplica *tiling* (repetición del audio hasta completar la ventana), según la descripción del entrenamiento.
- Robustez explícita a variaciones de canal: banda limitada, audio telefónico (8 kHz), reverberación y ruido aditivo, introducidas como augmentación durante el ajuste fino.
- Salida de logits por clase, apta para umbralización y para derivar a revisión humana cuando la confianza es baja (por ejemplo, clase `other`).
- Reutilización del *backbone* HuBERT para extraer representaciones acústicas intermedias, más allá de la cabeza de clasificación.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto, no tiene modo *thinking*, ni visión, ni audio generation.
- Cobertura multilingüe limitada estrictamente a las lenguas enumeradas y a la clase `other`; no hay indicación de comportamiento para lenguas fuera de ese conjunto.

## Casos de uso

- **Enrutamiento en atención al cliente multilingüe en Nigeria**: clasificar los primeros segundos de cada llamada entrante para decidir a qué cola de agentes o a qué modelo ASR específico (yoruba, hausa, igbo, etc.) se envía la conversación. El tamaño de 94,6 M permite ejecutarlo en CPU en el propio *gateway* de telefonía.
- **Preprocesamiento de pipelines ASR multilingües**: seleccionar el modelo acústico y el léxico de pronunciación adecuados antes de transcribir, evitando alimentar un ASR de yoruba con audio hausa y reduciendo la tasa de error en la primera pasada.
- **Curación de corpus para lenguas de bajos recursos**: etiquetar automáticamente horas de grabaciones sin anotar y separar por lengua antes de entrenar modelos ASR o TTS; la clase `other` actúa como filtro para descartar material no relevante.
- **Filtrado de datos de entrenamiento**: descartar clips que no corresponden a la lengua objetivo en un corpus multilingüe recolectado en campo, reduciendo el ruido de etiqueta en el conjunto de entrenamiento de otros modelos.
- **Análisis de emisiones de radio y pódcast**: segmentar programación regional por idioma para indexación, subtitulado o informes de audiencia; el modelo procesa ventanas de 5 s, por lo que se puede aplicar en ventana deslizante sobre emisiones largas.
- **Control de calidad en crowdsourcing de voz**: verificar que el hablante ha grabado en la lengua solicitada antes de aceptar y pagar la tarea, con revisión manual únicamente de los casos de baja confianza.
- **Sociolingüística y estudio del cambio de código**: cuantificar la proporción de cada lengua en entrevistas de campo y detectar tramos de mezcla, siempre con validación humana dado que el modelo asigna una única etiqueta por ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, macro-F1 ni matrices de confusión sobre el conjunto de validación o test de `dsn-2026-lid-train`, ni comparaciones con otros sistemas LID.

## Requisitos de hardware

- **Pesos**: 94,6 M de parámetros; ~0,19 GB en fp16 (coincide con el repositorio de 0,2 GB) y ~0,38 GB en fp32.
- **VRAM estimada**: inferior a 1 GB para inferencia con *batch* 1 sobre ventanas de 5 s; del orden de 2-4 GB con *batches* grandes (estimación por tamaño de activaciones, no medida por el autor).
- **GPU recomendadas**: no requiere GPU de datacenter; una T4, una RTX 3050 o cualquier GPU consumer con 4 GB o más es suficiente. A100/H100 solo tendrían sentido para procesar grandes volúmenes en paralelo.
- **CPU**: viable para inferencia en tiempo real de un flujo único, dado el tamaño del modelo y ventanas de 5 s; no hay cifras de latencia publicadas.
- **Opciones de despliegue**: `transformers` con `pipeline("audio-classification")`, exportación a ONNX Runtime o TorchScript, o servicio propio con Triton. vLLM y TGI no son aplicables: no soportan clasificación de audio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dsn-lid-afrihubert-run-seed123 | 94,6 M | 5 s de audio | 12 lenguas nigerianas + `other` | no disponible | HuggingFace, 0 descargas, sin métricas |
| ajesujoba/AfriHuBERT (base) | no disponible en esta búsqueda (mismo *backbone*) | no disponible | habla africana (sin detalle) | según su model card | HuggingFace |
| utter-project/mHuBERT-147 | no disponible en esta búsqueda | no disponible | 147 lenguas | según su model card | HuggingFace; es un *backbone* autosupervisado, no un LID |
| Whisper large-v3 (uso como LID) | 1.550 M | 30 s por ventana | ~99 lenguas, con cobertura limitada de lenguas nigerianas de bajos recursos | MIT (modelo de OpenAI) | Ampliamente disponible; los idiomas nigerianos minoritarios no están cubiertos de forma fiable |

La comparación relevante es de especialización frente a cobertura: mHuBERT-147 y Whisper cubren muchos más idiomas, pero no ofrecen una clase discriminativa para ego, anw, idu, igl, nup, tiv o urh; este modelo sí, a costa de no servir para nada fuera de ese conjunto. No hay datos públicos que permitan comparar exactitud entre ellos.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no indica licencia y la model card remite a las de AfriHuBERT y mHuBERT-147. Antes de cualquier uso comercial hay que verificar esas licencias base; a día de hoy no se puede asumir permiso de uso comercial.
- **Sin métricas publicadas**: no hay exactitud, F1 ni matriz de confusión. El rendimiento real en producción es desconocido y debe medirse con un conjunto propio antes de desplegar.
- **Sesgo de dominio**: el entrenamiento usa únicamente `dsn-2026-lid-train` (train + validación fusionados), sin datos externos. El comportamiento fuera de la distribución de ese corpus (otros micrófonos, otras variedades dialectales, habla espontánea vs. leída) no está caracterizado.
- **Riesgo de confusión entre lenguas emparentadas**: pares como ibibio/efik o igbo/igala comparten material léxico y fonético; sin matriz de confusión publicada no se puede descartar una tasa elevada de confusión.
- **Granularidad de una etiqueta por ventana**: no detecta cambio de código dentro de una misma ventana de 5 s; para audio con mezcla de lenguas el resultado será la clase dominante o `other`.
- **Audios largos**: requieren segmentación externa en ventanas; el modelo no modela dependencias más allá de la ventana de 5 s.
- **Clase `other` poco definida**: la model card no especifica qué se incluyó en `other` ni su proporción, lo que afecta a cómo de fiable es como filtro de descarte.
- **Sin validación de sesgos demográficos**: no se documenta composición por sexo, edad o región de los hablantes del corpus.
- **Reproducibilidad**: el nombre del repositorio incluye `run-seed123`, lo que sugiere una ejecución concreta de una semilla; no se publican resultados de otras semillas ni intervalos de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EmmanuelHardey/dsn-lid-afrihubert-run-seed123
- Modelo base AfriHuBERT: https://huggingface.co/ajesujoba/AfriHuBERT
- Modelo base mHuBERT-147: https://huggingface.co/utter-project/mHuBERT-147
- Dataset de entrenamiento: https://huggingface.co/datasets/Data-Science-Nigeria/dsn-2026-lid-train
- Paper de mHuBERT-147 (referencia del *backbone*): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
