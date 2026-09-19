# jaredpalmer/kev-0.5b

## Resumen

kev-0.5b es un modelo de decisión, no un modelo generativo: recibe un documento (el «estado») y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta en un único forward pass. Lo desarrolla Jared Palmer con Devin (Cognition), y es un adaptador LoRA más una pequeña cabeza de lectura por punteros montada sobre Qwen/Qwen2.5-0.5B congelado. Reproduce la arquitectura que Archer Hume infirió para el Jev de TypeSafe y sirve el contrato público `/v1/systemone`.

El interés técnico está en que separa la decisión de la generación de texto: en lugar de muestrear tokens hasta obtener una etiqueta, lee directamente una probabilidad calibrada desde los estados ocultos de los tokens `</opt>` frente al token `<decide>`. Soporta tres tipos de pregunta: `noul` (sí/no), `choice` (entre 2 y 255 opciones) y `score` (entre 2 y 255 niveles ordenados). El backbone aporta 494 M de parámetros congelados y solo se entrenan 9,3 M (el 1,9 % del total).

Es explícitamente un prototipo de investigación entrenado en un portátil, no un modelo de producción ni una reproducción del Jev de TypeSafe. Su relevancia actual es metodológica: demuestra que un readout directo de probabilidades sobre un backbone pequeño puede alcanzar 0,799 de accuracy y un ECE de 0,065 (0,031 tras temperature scaling) en el split held-out de sus seis fuentes de entrenamiento, con 104 descargas y 12 likes en el Hub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-0.5B) en modo prefill-only, con máscara de atención block-causal por rama de pregunta y cabeza de lectura por punteros |
| Parámetros totales | 494 M en el backbone congelado + 9,3 M entrenables (8,8 M de LoRA + 0,46 M de cabeza) ≈ 503 M |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Entrenamiento: ≤384 tokens de estado y ≤1.024 tokens por rama de pregunta. Servicio: 8.192 tokens por rama (el backbone soporta 32k) |
| Tipos de cuantización | no disponible (entrenamiento y servicio en fp32 sobre Apple MPS; no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 para el adaptador y la cabeza; el modelo base Qwen2.5-0.5B se distribuye bajo Apache-2.0; cada dataset conserva su licencia propia |
| Formato de pesos | safetensors (`adapter_model.safetensors`, adaptador LoRA) + `head.pt` (cabeza), empaquetados en `kev-0.5b.tar.gz` (38 MB) en la release v0.1.0 de GitHub |
| Tipos de pregunta | `noul` (sí/no), `choice` (2–255 opciones), `score` (2–255 niveles ordenados) |
| Configuración LoRA | rango 16, alpha 32, dropout 0,05, sobre `q_proj k_proj v_proj o_proj gate_proj up_proj down_proj` en las 24 capas |
| Cabeza de decisión | Dos mapas lineales de 896 → 256 (query desde `<decide>`, key desde cada `</opt>`), producto escalar escalado y softmax sobre las opciones |
| Precisión | fp32 |
| Versión | kev-0.5b v0.1, entrenado el 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar usado en modo prefill-only: no hay decodificación autorregresiva. La entrada es una única secuencia empaquetada con la forma `<state> … <q> instr <opt> o1 </opt> <opt> o2 </opt> … <decide> <q> … <decide> …`. La máscara de atención permite que cada token de pregunta vea el estado y su propia rama, pero no las demás preguntas, y las position ids se reinician tras el estado en cada rama, de modo que todas las preguntas comparten el mismo estado sin contaminarse entre sí. La cabeza puntúa cada estado oculto de `</opt>` contra el estado oculto de `<decide>` y aplica softmax para producir la distribución. El código de aplicación traduce esas distribuciones al contrato de la API: `choice`/`confidence` para Choice, `p(yes)` para Noul y el nivel esperado para Score. Los tokens reservados son tokens especiales ya existentes de Qwen (`<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`), y el texto de usuario se sanea para que no pueda generarlos.

El entrenamiento parte de seis datasets públicos convertidos a peticiones con forma de TypeSafe y renderizados con el mismo código que se usa en servicio (`api.to_record()`): 1.500 registros por fuente desde los splits `train` estándar, lo que da 9.000 registros y 13.500 preguntas (4.500 Choice, 6.000 Noul y 3.000 Score). Las fuentes son Banking77 (Choice, K = 77), BoolQ (Noul), AG News (Choice K = 4 + 2 Noul), MNLI (Choice K = 3), SST-5 (Score de 5 niveles) y Yelp Review Full (Score de 5 niveles + Noul, con texto truncado a 220 palabras). En la conversión se aplicó variación de renderizado: alrededor del 30 % de descripciones de opción nulas, ~10 % con descripciones estructuradas `{"what": …}`, ~15 % de instrucciones estructuradas `{"question", "focus"}` y ~32 % de estados envueltos como objetos o arrays (`{"document"}`, `{"ticket": {"channel","body"}}`, `[{"role","content"}]`). No se documenta RLHF ni DPO: es ajuste supervisado sobre los seis conjuntos reformateados.

## Capacidades

- Decisión con distribución de probabilidad completa: devuelve una probabilidad por opción, no una etiqueta seca ni texto generado.
- Preguntas de sí/no (`noul`) con probabilidad `p(yes)` directamente interpretable.
- Elección múltiple (`choice`) con entre 2 y 255 opciones y un campo de confianza asociado.
- Puntuación ordinal (`score`) con entre 2 y 255 niveles ordenados, con nivel esperado calculado a partir de la distribución.
- Múltiples preguntas por documento en un solo forward pass, con estado compartido y ramas aisladas entre sí.
- Calibración explícita como objetivo: ECE de 0,065 en 10 bins, reducible a 0,031 con temperature scaling (T = 1,47).
- Compatibilidad a nivel de API con el contrato `/v1/systemone` de TypeSafe, consumible desde `typesafe-sdk`.
- Entrada en texto plano estructurado (objetos JSON, arrays de mensajes) gracias a la variación de renderizado del entrenamiento.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling, function calling y razonamiento multi-paso en varios turnos: no disponibles (el modelo no genera texto ni ejecuta agentes).
- Visión y audio: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte con umbral de confianza: se construye el estado con el cuerpo del ticket y se lanzan varias preguntas `choice` (categoría, urgencia, equipo) en una sola pasada; el `confidence` por rama permite derivar a revisión humana los casos por debajo de un umbral en lugar de aceptar una etiqueta dudosa.
- Clasificación de intención bancaria: el modelo fue entrenado con Banking77, por lo que puede etiquetar consultas de clientes entre 77 intenciones usando los nombres de intención como claves de opción, con la ventaja de exponer la probabilidad de cada una.
- Filtrado y priorización de reseñas: con Yelp Review Full y SST-5 como fuentes de `score`, puede asignar un nivel ordenado de satisfacción y, en la misma pasada, responder una pregunta `noul` de tipo «¿recomendaría el producto?» (estrellas ≥ 4 en la definición del dataset).
- Inferencia de relación textual (NLI): con MNLI como fuente, dada una premisa como estado y una hipótesis en la instrucción, decide entre las tres etiquetas de implicación como pregunta `choice` de K = 3.
- Validación y auditoría de implementaciones del contrato System One: al ser un prototipo que reproduce la arquitectura inferida para Jev, sirve como implementación de referencia para comprobar el comportamiento de la API, incluida la sensibilidad al orden de las opciones.
- Investigación sobre calibración de readouts directos: sus métricas ECE (0,065 sin ajustar, 0,031 tras temperature scaling) lo hacen útil para estudiar escalado de temperatura y detección de sobreconfianza en modelos pequeños.
- Etiquetado de bajo coste en local: al ser un adaptador de 9,3 M de parámetros sobre un backbone de 494 M, cabe en un portátil y puede ejecutarse en MPS para etiquetar lotes pequeños sin GPU dedicada.
- Demos docentes sobre atención con estado compartido: la máscara block-causal permite ilustrar cómo varias preguntas comparten contexto sin verse entre ellas, algo difícil de mostrar con un modelo generativo convencional.
- Encuestas y formularios automatizados: un documento de texto libre como estado y varias preguntas `score`/`choice` para extraer respuestas estructuradas con incertidumbre asociada.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card, no verificados de forma independiente. El conjunto de evaluación es un split held-out de las seis fuentes de entrenamiento con 1.350 preguntas.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Decisión tipada (choice / noul / score) | Held-out de las seis fuentes de entrenamiento (1.350 preguntas) | Accuracy | 0,799 | No |
| Decisión tipada (choice / noul / score) | Held-out de las seis fuentes de entrenamiento (1.350 preguntas) | ECE (10 bins) | 0,065 | No |
| Decisión tipada (choice / noul / score) | Held-out de las seis fuentes de entrenamiento (1.350 preguntas) | ECE tras temperature scaling (T = 1,47) | 0,031 | No |

No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Tampoco se publican métricas desagregadas por tipo de pregunta (Choice, Noul, Score) ni por fuente de datos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los ~503 M de parámetros totales, no publicado por el autor): ~2,0 GB en fp32 (precisión declarada de entrenamiento y servicio), ~1,0 GB en fp16/bf16, ~0,5 GB en int8 y ~0,25 GB en int4. A estas cifras hay que sumar activaciones, que dependen del número de ramas de pregunta y de la longitud de cada rama.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060 o superiores), y también en CPU y en Apple Silicon vía MPS, que es el entorno declarado por el autor.
- GPU de datacenter: no se documenta ningún despliegue en A100, H100 ni similares; el checkpoint se entrenó y se sirve sobre Apple MPS en fp32.
- Opciones de despliegue: la vía documentada es `python -m kev.serve --run runs/kev`, que expone `POST /v1/systemone` en `http://127.0.0.1:8009` y puede consumirse con `typesafe-sdk`. Los pesos se cargan con PEFT (adaptador LoRA) más `head.pt` para la cabeza personalizada. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni otros motores de generación, y en la práctica no son aplicables sin trabajo adicional porque el modelo es prefill-only y su salida la produce una cabeza propia, no la LM head.
- Latencia y throughput: no disponibles (no se publican mediciones).
- Distribución de pesos: `kev-0.5b.tar.gz` (38 MB) desde la release v0.1.0 de GitHub, con `adapter_model.safetensors`, `head.pt`, los ficheros del tokenizador, `eval.json` y el log de entrenamiento; SHA-256 `15639f79…6e12f8` con digest completo en el fichero `.sha256`. Se extrae en `runs/kev/` y los pesos no están versionados en git.

## Comparativa con modelos similares

No se dispone de benchmarks comparables publicados para modelos de decisión de este tipo, por lo que la comparación se limita a características declaradas y a la relación con su modelo base.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kev-0.5b | 9,3 M entrenables sobre 494 M congelados (~503 M) | 384 tokens de estado y 1.024 por rama en entrenamiento; 8.192 por rama en servicio | Accuracy 0,799 y ECE 0,065 en held-out propio (no verificado) | Apache-2.0 (adaptador y cabeza) | LoRA + cabeza, 38 MB en release de GitHub |
| Qwen2.5-0.5B (modelo base) | 494 M | 32.768 tokens según la información del modelo base | No disponible | Apache-2.0 | Pesos completos en el Hub |
| Clasificadores encoder supervisados de tamaño similar (familia DeBERTa y afines) | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia funcional frente al modelo base es que Qwen2.5-0.5B genera texto y no ofrece probabilidades calibradas sobre opciones discretas, mientras que kev-0.5b devuelve directamente una distribución sobre un conjunto de opciones tipadas y no genera texto en ningún caso. Frente a un clasificador encoder convencional, el enfoque es más flexible en el número de opciones y en el número de preguntas simultáneas sobre un mismo estado, pero no hay datos públicos que permitan comparar su precisión con la de esas alternativas.

## Limitaciones y advertencias

- Es un prototipo de investigación entrenado en un portátil; el propio autor lo declara no apto para producción y no equivalente al Jev de TypeSafe.
- Uso no previsto explícito: cualquier decisión que afecte a personas, incluidas moderación, fraude, crédito, selección de personal y enrutado médico o legal.
- La calibración solo está verificada sobre las distribuciones de entrenamiento; el comportamiento sobre tareas no vistas no se ha medido, por lo que el ECE de 0,065 no es extrapolable.
- El conocimiento está limitado por un backbone de 0,5 B de parámetros, con la consiguiente superficialidad en dominios especializados.
- Riesgo de alucinación: aunque no genera texto, puede producir decisiones seguras y erróneas fuera de la distribución de entrenamiento; el ECE tras temperature scaling (0,031) presupone aplicar ese reescalado con T = 1,47.
- Idioma: solo inglés; no hay capacidades multilingües declaradas.
- Longitud de contexto: aunque en servicio se permiten 8.192 tokens por rama, el entrenamiento usó como máximo 384 tokens de estado y 1.024 por rama, de modo que el rendimiento más allá de esas longitudes es una extrapolación no validada.
- Sensibilidad al orden de las opciones: el propio autor la señala como línea de investigación abierta, lo que implica que reordenar las opciones puede cambiar la distribución.
- Licencia: el adaptador y la cabeza son Apache-2.0, pero el uso comercial debe considerar también la licencia del modelo base y las licencias individuales de los seis datasets de entrenamiento (Banking77, BoolQ, AG News, MNLI, SST-5 y Yelp Review Full).
- Integración: no existe soporte para motores de inferencia estándar (vLLM, TGI, llama.cpp, Ollama); el despliegue depende del código propio `kev.serve` y de cargar la cabeza con PyTorch.
- Saneado de entrada: el texto de usuario se filtra para impedir la aparición de tokens especiales reservados de Qwen; cualquier integración que omita ese saneado altera el comportamiento del modelo.
- Los resultados de benchmark están declarados por el autor y marcados como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaredpalmer/kev-0.5b
- Repositorio con código, receta de entrenamiento, evaluación y demo: https://github.com/jaredpalmer/kev
- Pesos (release v0.1.0, `kev-0.5b.tar.gz`, 38 MB): https://github.com/jaredpalmer/kev/releases/tag/v0.1.0
- Artículo de referencia sobre la arquitectura inferida de Jev: https://archerhume.com/posts/jevs-architecture-unmasked
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Datasets de entrenamiento: https://huggingface.co/datasets/legacy-datasets/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/SetFit/sst5, https://huggingface.co/datasets/Yelp/yelp_review_full
