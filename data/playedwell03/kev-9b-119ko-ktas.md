# Playedwell03/kev-9b-119ko-ktas

## Resumen

Kev-9B-119ko-ktas es un modelo de decisión de pesos completos derivado de Qwen/Qwen3.5-9B-Base, publicado por el usuario Playedwell03, que lee la transcripción en coreano de una llamada de solicitud de traslado de una dotación de ambulancia y devuelve probabilidades calibradas para tres preguntas tipadas: categoría mayor KTAS de la queja principal (18 opciones), grupo de edad (11 opciones) y sexo (3 opciones). No genera texto: su salida es una distribución de probabilidad sobre un conjunto cerrado de opciones, con una cabeza de puntero y una temperatura de calibración fijada en T = 1,32.

El modelo resuelve un problema operativo concreto del triaje de emergencias médicas: convertir una conversación no estructurada en etiquetas de triaje homogéneas que el personal de emergencias pueda revisar y corregir. Sobre el split de test (1.998 llamadas), alcanza una exactitud de 0,881 en la queja principal KTAS frente a 0,699 de la versión zero-shot, y 0,959 de exactitud conjunta en los tres campos, con una ECE de 0,006, lo que indica que las probabilidades son utilizables para umbrales de decisión.

Su relevancia práctica está en el coste de despliegue: con 7.936.684.544 parámetros (7,94 B) cabe en una única GPU con aproximadamente 16 GB en bf16, o en Apple Silicon mediante el backend MLX de Kev, mientras que su hermano de 27B requiere dos GPU en NF4. La licencia es Apache-2.0 y el repositorio ocupa 15,9 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3.5-9B-Base (capas de atención, MLP y proyecciones Gated DeltaNet), adaptado como modelo de decisión con cabeza de puntero sobre opciones y temperatura de calibración (T = 1,32) |
| Parametros totales | 7.936.684.544 (7,94 B) |
| Parametros activos | No aplica: modelo denso (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El contexto de entrenamiento usa `max_state` dentro de `training_context(2048)`; las llamadas de más de 896 tokens de estado (~0,45 %) no se entrenaron |
| Tipos de cuantizacion | Pesos publicados en bf16; el entrenamiento usó NF4 con doble cuantización (QLoRA) sobre backbone congelado; soporte de backend MLX en Apple Silicon. GGUF no disponible |
| Idiomas soportados | Coreano (ko) únicamente |
| Licencia | Apache-2.0 (ver `NOTICE`) |
| Formato de pesos | safetensors (repositorio de 15,9 GB) más `head.pt` y `questions.json` |

## Arquitectura y entrenamiento

El punto de partida es el adaptador LoRA publicado como jaredpalmer/kev-9b, fusionado sobre Qwen/Qwen3.5-9B-Base (revisión `68c46c4b…`) para producir un checkpoint Kev de pesos completos. Sobre ese backbone cuantizado a NF4 con doble cuantización y congelado se entrenó un nuevo LoRA (r = 16, α = 32) que cubre las proyecciones de atención, de MLP y las proyecciones Gated DeltaNet, junto con una cabeza de puntero inicializada en caliente. El entrenamiento usó 1.600 llamadas de un solo paciente, lr 2e-4, una época, batch 1 con 8 pasos de acumulación y matmuls en fp16 con escalado de pérdida sobre GPU Turing. El LoRA resultante se volvió a fusionar en el backbone bf16, de modo que el repositorio es un checkpoint Kev estándar y no requiere código de QLoRA ni cuantización para servirse.

La verificación de fidelidad de la fusión se hizo sobre llamadas reservadas: el modelo bf16 fusionado reproduce la misma predicción que el modelo de entrenamiento en 4 bits en los 15 campos de test evaluados, con un |Δp| medio de 0,018 y cero cambios de argmax. Los datos de entrenamiento proceden de un conjunto interno de 27.601 transcripciones de llamadas de emergencias médicas coreanas a urgencias; las 25.995 llamadas de un solo paciente se dividieron de forma estratificada por queja principal en 21.995 de entrenamiento, 1.001 de calibración, 1.001 de desarrollo y 1.998 de test. El conjunto de datos no se ha publicado. Nota: la model card menciona tanto 1.600 llamadas de entrenamiento como un split de entrenamiento de 21.995 llamadas; la información disponible no aclara esa diferencia.

La calibración se ajustó con una única temperatura sobre un split de calibración separado (T = 1,32, almacenada en `head.pt`), lo que reduce la ECE conjunta a 0,006.

## Capacidades

- Clasificación de opción múltiple con salida de probabilidades calibradas sobre tres preguntas tipadas: `cc_major` (17 categorías mayores KTAS, de A 물질오용 a Q 일반, más 판단 보류), `gender` (남성 / 여성 / 판단 보류) y `age_group` (10대 미만, 10대, …, 90대이상 / 판단 보류).
- Clasificación sin generación de texto: la salida es una distribución de probabilidad por pregunta, no una secuencia de tokens.
- Inferencia por lotes con prefijo compartido (`forward_batch(..., shared_prefix=True)`).
- Entrada en formato de registro estructurado (`SystemOneRequest`) con estado (transcripción) y preguntas; validación estricta mediante `to_record` y `encode`.
- Ejecución en CUDA con bf16 y en Apple Silicon mediante el backend MLX de Kev.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un clasificador de un único paso de decisión.
- Capacidad multilingüe: no; sólo coreano, y sólo en el dominio y estilo de transcripción del corpus de entrenamiento.
- Modo "thinking": no disponible.

## Casos de uso

- Triaje previo a la llegada al hospital: a partir de la transcripción de la llamada, el modelo asigna la categoría mayor KTAS y el grupo de edad para que el servicio de urgencias prepare sala, personal y recursos antes de que llegue la ambulancia; su exactitud de 0,881 en la queja principal y 0,959 conjunta lo hace útil como primera estimación revisable.
- Segunda lectura del operador en el centro de despacho: las probabilidades calibradas permiten fijar un umbral de confianza y derivar a revisión humana únicamente los casos por debajo de él, aprovechando la cobertura del 100 % a un error del 5 % que reporta la model card.
- Auditoría retrospectiva de calidad del triaje: al no generar texto y devolver siempre una etiqueta del conjunto cerrado de `questions.json`, permite reclasificar grandes volúmenes de llamadas históricas y compararlas con la categoría KTAS asignada por el personal.
- Estratificación de registros clínicos y epidemiológicos: la extracción automática de grupo de edad (0,997) y sexo (0,9995) permite segmentar series de llamadas para estudios descriptivos sin que un humano lea cada transcripción.
- Despliegue en infraestructura local del propio servicio de emergencias: al caber en una única GPU de ~16 GB en bf16 (o en Apple Silicon vía MLX), los datos de pacientes no tienen que salir de la red del organismo, lo que simplifica el cumplimiento de requisitos de privacidad.
- Priorización de recursos en picos de demanda: la latencia de clasificación sobre una llamada es independiente de la generación de texto, de modo que el sistema puede puntuar llamadas en cola y ordenar la asignación de ambulancias disponibles con intervención final del despachador.
- Investigación sobre triaje telefónico: el modelo sirve como etiquetador de referencia para comparar protocolos KTAS, ya que su ECE de 0,006 permite analizar curvas de cobertura-riesgo en lugar de exactitud bruta.

## Benchmarks y rendimiento

Split de test con 1.998 llamadas, leído una sola vez, con probabilidades calibradas (T = 1,32).

| Métrica | Zero-shot Kev-9B | Kev-9B-119ko-ktas |
|---|---|---|
| Queja principal (KTAS mayor, 18 clases) — exactitud | 0,699 | 0,881 |
| Grupo de edad (11 clases) | 0,965 | 0,997 |
| Sexo (3 clases) | 0,990 | 0,9995 |
| Los tres campos — exactitud / Brier / ECE | 0,885 / 0,159 / 0,017 | 0,959 / 0,062 / 0,006 |

En el split de desarrollo los números son coherentes: `cc_major` 0,886 y exactitud conjunta 0,960.

Comparación con el hermano de 27B en el mismo split de test calibrado:

| Métrica | Kev-9B (este) | Kev-27B |
|---|---|---|
| Exactitud queja principal | 0,881 | 0,900 |
| Macro-F1 queja principal | 0,897 | 0,913 |
| Grupo de edad / sexo | 0,997 / 0,9995 | 0,9985 / 0,9995 |
| Los tres campos — exactitud | 0,959 | 0,966 |
| Los tres campos — Brier | 0,062 | 0,049 |
| Cobertura con error ≤ 5 % | 100 % | 100 % |
| Huella de servicio | 1 GPU (~16 GB bf16) | 2 GPU (NF4) |

Bootstrap emparejado sobre la queja principal: 27B − 9B = +1,95 puntos (IC 95 % [+0,75, +3,15]).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16, cifra coherente con los 7,94 B de parámetros y con el tamaño de 15,9 GB del repositorio; el modelo se describe explícitamente como ejecutable en una sola GPU en bf16. Estimaciones aritméticas para otras precisiones (no confirmadas en la model card): ~16 GB en fp16, ~8 GB en 8 bits y ~5 GB en 4 bits, más el coste de la cabeza y de las activaciones.
- GPU recomendadas por el autor: no se especifican modelos concretos. El entrenamiento se realizó sobre GPU Turing; el servicio en bf16 requiere una GPU con al menos ~16 GB de memoria.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (por ejemplo, gama RTX x080/x090 de 16-24 GB), aunque la model card no enumera modelos concretos.
- Apple Silicon: soportado mediante el backend MLX de Kev, que carga el modelo automáticamente.
- Opciones de despliegue: la librería Kev (github.com/jaredpalmer/kev) con `Checkpoint(...).load("cuda", LoadOptions(dtype=torch.bfloat16))`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas rutas no aplican directamente.
- Latencia y throughput: no disponibles. El único dato de rendimiento publicado es que el 9B entrena aproximadamente 3,6 veces más rápido por registro que el 27B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (queja principal / tres campos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-9B-119ko-ktas (este) | 7,94 B | No disponible | 0,881 / 0,959 exactitud; Brier 0,062 | Apache-2.0 | Pesos completos, 1 GPU (~16 GB bf16) |
| Playedwell03/kev-27b-119ko-ktas-qlora | ~27 B (nominal, no confirmado) | No disponible | 0,900 / 0,966 exactitud; Brier 0,049 | No disponible | Requiere 2 GPU en NF4 |
| Kev-9B zero-shot (referencia de la model card) | 7,94 B | No disponible | 0,699 / 0,885 exactitud; Brier 0,159 | No disponible | No disponible |
| Qwen/Qwen3.5-9B-Base (backbone) | No disponible en la información proporcionada | No disponible | No aplica (modelo base sin cabeza de decisión) | No disponible en la información proporcionada | Modelo base público |

## Limitaciones y advertencias

- Cubre únicamente tres campos: no predice subcategoría KTAS, número de pacientes, constantes vitales ni fragmentos de evidencia. Las llamadas con varios pacientes se excluyeron del entrenamiento.
- Las cadenas de las preguntas forman parte del modelo: hay que enviar exactamente las instrucciones y los nombres de opción de `questions.json`; cualquier variación invalida la interpretación de las probabilidades.
- La evaluación es sólo in-domain: misma fuente de datos y mismo estilo de transcripción que el entrenamiento, por lo que el rendimiento fuera de ese dominio no está medido.
- Las llamadas de más de 896 tokens de estado (~0,45 % del corpus) no se entrenaron.
- La fidelidad de la cuantización NF4 del 9B respecto al modelo fp32 publicado es menor que la del 27B (|Δp| medio 0,043 frente a 0,018 en el conjunto transfer-v4 de Kev), como es esperable en un modelo más pequeño.
- Sesgos: no se documenta ningún análisis de sesgo por edad, sexo, origen o acento dentro del coreano; la predicción de sexo y grupo de edad a partir de una transcripción es una inferencia estadística que puede fallar en casos ambiguos.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo real es una clasificación errónea con alta confianza, mitigado parcialmente por una ECE de 0,006 pero no eliminado.
- Limitación de idioma: sólo coreano, y en el registro propio de las llamadas de emergencias médicas coreanas.
- Licencia Apache-2.0 para el modelo, con un fichero `NOTICE` que debe revisarse; la model card no detalla condiciones adicionales sobre los datos de entrenamiento (que no se publican) ni sobre su uso clínico.
- Advertencia explícita: no es un dispositivo médico. No debe usarse para decisiones automatizadas sin revisión por personal cualificado; las salidas están pensadas para mostrarse y ser corregidas por el personal de emergencias.
- El modelo no ha recibido descargas ni likes en el momento de redactar esta ficha y lo publica una cuenta individual, sin revisión por pares ni validación externa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Playedwell03/kev-9b-119ko-ktas
- Modelo hermano de 27B: https://huggingface.co/Playedwell03/kev-27b-119ko-ktas-qlora
- Adaptador base de Kev: https://huggingface.co/jaredpalmer/kev-9b
- Modelo base del backbone: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio y documentación de Kev: https://github.com/jaredpalmer/kev
- Fichero de preguntas y opciones: https://huggingface.co/Playedwell03/kev-9b-119ko-ktas/blob/main/questions.json
- Cabeza calibrada (temperatura T = 1,32): https://huggingface.co/Playedwell03/kev-9b-119ko-ktas/blob/main/head.pt
- Aviso de licencia: https://huggingface.co/Playedwell03/kev-9b-119ko-ktas/blob/main/NOTICE
- Métricas completas: carpeta `results/` del repositorio en HuggingFace
