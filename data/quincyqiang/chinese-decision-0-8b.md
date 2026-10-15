# quincyqiang/chinese-decision-0.8b

## Resumen

Chinese Decision 0.8B es un modelo de decisión probabilística en chino desarrollado por el usuario quincyqiang, obtenido por ajuste fino (LoRA con r = 32, posteriormente fusionado) del modelo base Qwen3.5-0.8B. No es un modelo conversacional ni generativo: dado un contexto y un conjunto fijo de entre 2 y 26 candidatos, devuelve una probabilidad para cada candidato en un único pase forward, sin generar ningún token. Para ello lee los logits de las letras `A`-`Z` en la última posición y aplica softmax, lo que elimina el parseo de salidas y reduce la latencia frente a un LLM generativo.

El modelo cubre tres formatos de pregunta —`noul` (sí/no), `choice` (elección única) y `score` (escala ordinal, devuelve el valor esperado)— y está entrenado de forma mixta en cuatro dominios: general, médico, legal y financiero. Sus probabilidades están calibradas con una temperatura ajustada en un conjunto de validación independiente (T = 1.108), de modo que pueden usarse directamente con umbrales en código. Con 752.393.024 parámetros (aproximadamente 0.8B) y pesos BF16 de unos 1,5 GB, está pensado para ejecutarse en producción con requisitos de hardware muy bajos, tanto en GPU como en CPU mediante la versión GGUF.

Su relevancia práctica está en sustituir llamadas a LLM generativos en tareas que en realidad son clasificación sobre un espacio finito de opciones: enrutado de intenciones, triaje de tickets, moderación de contenido, etiquetado de datos, guardarraíles de entrada y salida para otros LLM, puntuación de respuestas de modelos o selección del siguiente paso de un agente. Todo el catálogo de aplicación se apoya en el mismo principio: las reglas de negocio se escriben en el código y el modelo solo aporta la distribución de probabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada del modelo base Qwen3.5-0.8B, con capas de atención lineal (soporte recomendado de `flash-linear-attention`) |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens de entrada máxima (`max_length` en `decision_config.json`) |
| Tipos de cuantizacion | BF16 (pesos publicados en este repositorio) y GGUF Q8_0 (repositorio separado, 812 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B como tronco de texto y se ajusta mediante LoRA con rango 32, tras lo cual los adaptadores se fusionan en pesos completos, de manera que no se necesita PEFT para cargarlo. La innovación funcional no está en la arquitectura sino en la interfaz de inferencia: en lugar de decodificar tokens, se examinan los logits de las 26 letras en la última posición y se normalizan con softmax, de modo que cada respuesta es una distribución de probabilidad sobre los candidatos. El repositorio publica además una temperatura de calibración de T = 1.108, ajustada en una partición de validación separada; el informe completo con las métricas antes y después de la calibración se distribuye como `validation_report.json`.

El entrenamiento se realizó durante 1 época sobre CJ-Dataset, con un total de 13.048.000 decisiones y 10.132 pasos. El punto de publicación es el step 10000, seleccionado según la NLL de la distribución en el conjunto de validación. La versión de prompt utilizada es `hmm-zh-v1` y el formato de pregunta admite entre 2 y 26 candidatos. La información disponible no detalla la composición exacta del dataset, la proporción por dominio ni si se aplicaron fases adicionales de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Clasificación probabilística con una sola pasada forward y cero tokens de salida: devuelve una probabilidad por candidato.
- Tres tipos de pregunta: `noul` (sí/no), `choice` (elección única entre candidatos) y `score` (escala ordinal, con valor esperado como salida).
- Soporte de 2 a 26 candidatos por consulta, con las letras `A`-`Z` como identificadores.
- Probabilidades calibradas mediante temperatura, utilizables directamente con umbrales de decisión.
- Cobertura de cuatro dominios en un único modelo: general, médico, legal y financiero.
- Ejecución de múltiples decisiones independientes dentro de una misma petición (por ejemplo, 6 preguntas sobre un mismo ticket) para ahorrar llamadas.
- Uso como enrutador de agentes: selección de herramienta, evaluación de si falta información y valoración de riesgo de la operación.
- Uso como guardarraíl de LLM: verificación de inyección de prompt, fuga de datos privados, contenido abusivo o fuera de alcance en entrada y salida.
- Capacidad multilingüe: no disponible; el modelo declara únicamente chino (zh).
- Generación de texto libre, razonamiento abierto, código, matemáticas, visión o audio: no disponibles; el modelo no está diseñado para esas tareas.
- Tool calling nativo: no disponible; el modelo no invoca herramientas, solo puntúa la idoneidad de cada opción para que el código decida.

## Casos de uso

- Triaje de tickets de soporte: una sola petición formula varias preguntas sobre cada ticket (categoría en formato `choice`, severidad y tono en `score`, reproducibilidad, solicitud de reembolso y riesgo de baja en `noul`). Las reglas de enrutado se implementan en código y se deriva a revisión humana cuando la confianza de la categoría baja de 0,5. En el ejemplo publicado, 8 tickets con 6 preguntas cada uno (48 decisiones) se resolvieron en 285 ms.
- Guardarraíl de entrada y salida para un LLM: se comprueban cuatro aspectos en la entrada (inyección de prompt o jailbreak, información privada, insultos o amenazas, fuera de alcance) y cuatro en la salida (fuga del system prompt, promesas fuera de competencia, datos privados, contenido inapropiado). Cada comprobación es un sí/no con dos umbrales, de modo que la banda intermedia define el presupuesto de revisión manual. En el ejemplo, una petición de jailbreak se bloqueó en la entrada con un 85,2 % de probabilidad y las 8 comprobaciones tardaron 89,2 ms.
- Moderación en tiempo real de chat en directo: cada mensaje genera una clasificación y un sí/no, de forma que insultos y publicidad se bloquean, los spoilers se pliegan y las preguntas de la audiencia se destacan. La latencia p50 reportada es de 82,2 ms por mensaje. El propio autor documenta el punto débil: la detección de spoilers se confunde con la mera aparición de la palabra «spoiler» (por ejemplo, en «no hagas spoilers») y no distingue entre especulación y spoiler real.
- Enrutado de agentes con umbrales por nivel de riesgo: el modelo elige la herramienta, decide si falta información y evalúa el riesgo; después el código aplica umbrales distintos (40 % para operaciones de solo lectura, 65 % para escritura y 85 % para operaciones con dinero). En el ejemplo, «organízame una reunión con el director Wang el martes por la tarde para hablar del presupuesto» se clasificó como gestión de agenda con un 99 % de confianza, pero la probabilidad de que faltasen datos clave fue del 71 %, por encima del umbral del 70 %, así que el agente repreguntó. La decisión tardó 81,6 ms.
- Etiquetado de datos a escala: al devolver probabilidades calibradas en un único forward, permite anotar grandes volúmenes con umbrales de confianza y derivar solo los casos ambiguos a revisión, sin coste de decodificación ni postprocesado de texto.
- Puntuación de respuestas de otros modelos: con el formato `score` puede asignar una nota ordinal esperada a la salida de un LLM para usarla como señal en un pipeline de evaluación o de selección de candidatos.
- Clasificación en dominios regulados: al estar entrenado de forma mixta en médico, legal y financiero, puede emplearse para categorizar consultas o documentos en esos ámbitos, siempre que la decisión final la tome código con umbrales explícitos y exista revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un `validation_report.json` con métricas de NLL en validación antes y después de la calibración, así como un conjunto de evaluación específico (CJ-Bench), pero los valores numéricos no están incluidos en la información proporcionada.

Los únicos datos cuantitativos de rendimiento disponibles son latencias de los escenarios de demostración, medidas sobre hardware no especificado:

| Escenario | Medida publicada |
|---|---|
| Triaje de tickets (48 decisiones en una petición) | 285 ms |
| Guardarraíl de LLM (8 comprobaciones) | 89,2 ms |
| Moderación de chat en directo | p50 de 82,2 ms |
| Enrutador de agentes (una decisión) | 81,6 ms |

## Requisitos de hardware

- Pesos BF16: aproximadamente 1,5 GB, coherente con el tamaño del repositorio de 1,5 GB y con 752.393.024 parámetros en precisión de 16 bits.
- VRAM estimada para inferencia en BF16: del orden de 2 a 4 GB contando pesos, caché KV y activaciones; las cifras exactas no están publicadas y dependen de la longitud de contexto utilizada.
- VRAM estimada para la versión GGUF Q8_0: del orden de 1 a 2 GB, dado que el archivo de pesos ocupa 812 MB.
- GPU: por su tamaño, cabe con holgura en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como en GPU de datacenter (A100, H100). No se han publicado requisitos oficiales por modelo de GPU.
- CPU: la versión GGUF Q8_0 está pensada explícitamente para desplegarse en CPU sin PyTorch, mediante `llama-cpp-python`. El proyecto también distribuye un servicio HTTP con soporte de GPU y CPU.
- Opciones de despliegue confirmadas: `transformers` (se requiere `torch>=2.8` y `transformers>=5.3,<6`), `llama-cpp-python` para GGUF y el servidor HTTP del repositorio de código. El soporte de vLLM, TGI u Ollama no está confirmado en la información disponible.
- Recomendación de dependencias: el autor aconseja instalar `flash-linear-attention>=0.4` para aprovechar kernels eficientes en las capas de atención lineal de Qwen3.5. La atención se usa con `attn_implementation="sdpa"` en el ejemplo publicado.
- Throughput y latencia: solo se conocen las latencias de los escenarios de demostración indicadas arriba (del orden de 6 ms por decisión en el caso de 48 decisiones, hasta unos 82-89 ms por petición en los escenarios de moderación y guardarraíl), medidas sobre hardware no especificado.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos directamente comparables de decisión probabilística con esta interfaz (una sola pasada forward, salida de probabilidades sobre 2-26 candidatos, calibración de temperatura). La comparación más pertinente es con el propio modelo base y con la variante cuantizada publicada por el mismo autor:

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| chinese-decision-0.8b | 752.393.024 | 16.384 tokens de entrada | Decisión probabilística sobre 2-26 candidatos (noul, choice, score) | Apache-2.0 | safetensors (BF16) | HuggingFace y ModelScope |
| chinese-decision-0.8b-gguf | 752.393.024 (Q8_0) | no disponible en detalle; misma configuracion de decision | Igual, orientado a CPU sin PyTorch | Apache-2.0 | GGUF (Q8_0, 812 MB) | HuggingFace y ModelScope |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generacion de texto general | Apache-2.0 | safetensors | HuggingFace |

Frente al modelo base, la diferencia relevante es funcional: Qwen3.5-0.8B genera texto y requeriría parsear la salida para obtener una decisión, mientras que este ajuste devuelve directamente la distribución de probabilidad calibrada. Frente a LLM generativos de mayor tamaño, la ventaja declarada por el autor es de coste y latencia (cero tokens de salida), a cambio de limitarse a un espacio cerrado de candidatos y de no cubrir más idioma que el chino.

## Limitaciones y advertencias

- Modelo monolingüe: solo chino (zh). No hay soporte declarado para otros idiomas, por lo que no debe usarse como clasificador multilingüe.
- No es un modelo generativo: no produce texto, razonamiento abierto ni respuestas libres; solo puntúa un conjunto cerrado de entre 2 y 26 candidatos.
- Riesgo de alucinación trasladado al plano probabilístico: puede asignar probabilidades altas a candidatos incorrectos. El propio autor documenta fallos concretos en la detección de spoilers en chat en directo, confundida por la aparición literal de la palabra y por la falta de distinción entre especulación y spoiler.
- Dependencia de umbrales: el uso en producción exige definir umbrales por caso (por ejemplo, 0,5 para categoría, bandas de revisión en los guardarraíles, 40/65/85 % según riesgo en agentes). No hay garantía de comportamiento correcto sin esa capa de reglas en código.
- Cobertura de dominios agregada: un único modelo entrena de forma mixta general, médico, legal y financiero. No se publican métricas desglosadas por dominio en la información disponible, por lo que el rendimiento relativo entre ámbitos es desconocido.
- Sesgos: no se documenta ningún análisis de sesgos en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-0.8B; el repositorio incluye el texto íntegro de dicha licencia.
- Adopción muy baja en el momento de la consulta (4 descargas y 0 likes), lo que implica poca validación externa y escaso soporte de la comunidad.
- El conjunto de datos de entrenamiento (13.048.000 decisiones) y el de evaluación no están descritos en detalle en la información disponible, lo que dificulta auditar posibles fugas o desequilibrios.
- Las latencias publicadas corresponden a demostraciones sobre hardware no especificado y no deben tomarse como garantía de rendimiento en otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quincyqiang/chinese-decision-0.8b
- Variante GGUF Q8_0: https://huggingface.co/quincyqiang/chinese-decision-0.8b-gguf
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (entrenamiento, evaluación, exportación GGUF y servicio HTTP): https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Dataset de entrenamiento CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Conjunto de evaluación CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- Versión en ModelScope (BF16): https://modelscope.cn/models/quincyqiang/chinese-decision-0.8b
- Versión en ModelScope (GGUF): https://modelscope.cn/models/quincyqiang/chinese-decision-0.8b-gguf
- Referencia arXiv indicada en las etiquetas del modelo: arXiv:2609.36965
