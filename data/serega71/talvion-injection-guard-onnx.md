# Serega71/talvion-injection-guard-onnx

## Resumen

Talvion Prompt Injection Guard (ONNX) es un clasificador binario de texto derivado de `cointegrated/rubert-tiny2` mediante fine-tuning, publicado por el usuario Serega71. Su funcion es detectar prompt injection y intentos de jailbreak en el mensaje de entrada de un usuario antes de que este llegue a un LLM generativo. Forma parte de la capa de proteccion de entrada de un proyecto de soporte de una plataforma B2B SaaS denominada "Talvion" (nombre ficticio declarado por el autor); el dataset, el entrenamiento y el resto de componentes de defensa viven en un repositorio separado que no se enlaza en la model card.

El modelo se distribuye en formato ONNX para inferencia con `onnxruntime`, con el tokenizador en el subdirectorio `tokenizer`. Devuelve dos logits (`injection_logits`) con el orden de etiquetas `['benign', 'injection']` y un umbral de decision calibrado por curva ROC para mantener una tasa de falsos positivos (FPR) igual o inferior a 0,05; el valor concreto documentado es 0,8758169412612915. El repositorio ocupa 0,1 GB y la licencia es MIT, la misma que la del modelo base.

Es relevante porque ejemplifica un patron habitual en seguridad de aplicaciones con LLM: un clasificador compacto, ejecutable en CPU, colocado como primer filtro antes de un modelo generativo caro. Su interes practico esta en las cifras declaradas sobre un conjunto extendido de 150 ejemplos (34 de 36 ataques detenidos y 8 de 114 mensajes benignos bloqueados por error, en torno al 7 % de falsos positivos), muy alejadas del 68 % de falsos positivos de una version anterior no publicada. No obstante, toda la evaluacion se ha hecho sobre corpus sinteticos y el propio autor advierte de que el clasificador no garantiza por si solo la ausencia de inyeccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer BERT compacto, derivado de `cointegrated/rubert-tiny2`; cabecera de clasificacion binaria de secuencias |
| Parametros totales | No disponible (la model card no indica el recuento; el modelo base es una variante "tiny") |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 768 tokens segun la configuracion de inferencia de la model card (truncation, max_length=768) |
| Tipos de cuantizacion | No disponible en detalle; el tag `base_model:quantized:cointegrated/rubert-tiny2` indica que el modelo base esta cuantizado y el artefacto publicado es ONNX (`model.onnx`) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) con tokenizador en el subdirectorio `tokenizer` |
| Pipeline | text-classification |
| Etiquetas de salida | `label_order = ['benign', 'injection']`, salida `injection_logits` |
| Umbral de decision | 0,8758169412612915 (calibrado en validacion para FPR <= 0,05) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es `cointegrated/rubert-tiny2`, un encoder transformer de tipo BERT de tamano reducido, sobre el que se ha anadido (o reutilizado) una cabeza de clasificacion de dos clases: `benign` e `injection`. La model card no detalla el numero de capas, la dimension oculta, el numero de tokens de entrenamiento ni la composicion exacta del dataset; si especifica que el fine-tuning se hizo sobre un corpus completamente sintetico, generado con LLM, en el que los ejemplos benignos proceden de los mismos splits SFT sinteticos del proyecto de soporte. No se menciona el uso de RLHF, DPO u otra fase de alineacion.

El detalle metodologico mas relevante es el ajuste del umbral: se selecciono sobre la curva ROC en validacion con el objetivo de no superar un FPR de 0,05, y dio como resultado 0,8758169412612915. El modelo no funciona aislado: en el pipeline del proyecto lo precede una heuristica que busca marcadores explicitos de ataque (peticiones del prompt de sistema, intentos de redefinir instrucciones) y lo sigue un validador de salida tras la generacion. Las metricas publicadas corresponden a esa capa de proteccion de entrada completa (heuristica mas clasificador), no al clasificador en solitario, y la version actual se reentreno con un conjunto ampliado de mensajes benignos para reducir los falsos positivos del 68 % al entorno del 7 %, asumiendo como contrapartida dos ataques no detectados del tipo `public_generic` (formulaciones cortas y despersonalizadas sin marcadores evidentes).

## Capacidades

- Clasificacion binaria de texto en dos clases: `benign` e `injection`.
- Deteccion de prompt injection y de intentos de jailbreak en el mensaje entrante del usuario.
- Inferencia en CPU mediante `onnxruntime` con `CPUExecutionProvider`, sin necesidad de GPU.
- Soporte de entrada con `input_ids`, `attention_mask` y `token_type_ids` (este ultimo rellenado con ceros en el ejemplo de la model card).
- Umbral de decision ajustable en tiempo de inferencia; el valor por defecto documentado prioriza FPR bajo sobre exhaustividad.
- Cobertura bilingue limitada a ruso e ingles.
- Integrable como componente de una estrategia de defensa en profundidad junto a heuristicas previas y validadores de salida.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades multimodales (vision o audio).

## Casos de uso

- Puerta de entrada (input guard) antes de un LLM en produccion: se ejecuta el clasificador sobre el mensaje del usuario y, si la probabilidad de `injection` supera 0,8758, se bloquea o se deriva el caso antes de gastar tokens en el modelo generativo. Su tamano (0,1 GB) y su ejecucion en CPU lo hacen viable como filtro de primera linea con coste minimo.
- Soporte al cliente automatizado en B2B SaaS: el modelo esta entrenado y evaluado sobre textos con la longitud y el estilo tipicos de tickets de soporte (hasta 768 tokens), que es exactamente el escenario declarado del proyecto Talvion.
- Proteccion de asistentes conversacionales bilingues ruso/ingles: cubre los dos idiomas del corpus de entrenamiento, util para bases de usuarios mixtas en Europa del Este.
- Defensa en profundidad combinada con heuristicas: encadenar la heuristica de marcadores explicitos y este clasificador para cubrir tanto ataques obvios (patrones conocidos) como formulaciones mas sutiles.
- Moderacion y registro de intentos de ataque: almacenar la probabilidad de `injection` de cada mensaje para construir metricas de intentos de abuso, ajustar el umbral segun el apetito de riesgo y auditar incidentes.
- Filtrado previo en pipelines de automatizacion de correo o formularios: clasificar mensajes entrantes de usuarios no confiables antes de pasarlos a un agente que tiene acceso a herramientas internas (ticketing, CRM), reduciendo la superficie de ataque.
- Validacion rapida en entornos con restricciones de hardware: al ser ONNX y ejecutable en CPU, sirve para integrar una capa de seguridad en entornos sin GPU o en el borde (edge) de la infraestructura.
- Prototipado e investigacion en seguridad de LLM: punto de partida reproducible para experimentar con umbrales, aumentar el corpus de benignos y medir el equilibrio entre FPR y deteccion de ataques.

## Benchmarks y rendimiento

La model card solo publica metricas de la capa de proteccion de entrada completa (heuristica mas este clasificador), no del clasificador aislado. Los conjuntos son sinteticos.

| Conjunto de evaluacion | Composicion | Ataques detenidos | Mensajes benignos bloqueados por error |
|---|---|---|---|
| `injection_test.jsonl` (congelado) | 50 registros: 36 ataques / 14 benignos | 34/36 (94,4 %) | 4/14 (28,6 %) |
| `injection_v2/injection_test.jsonl` (extendido) | 150 registros: 36 ataques / 114 benignos | 34/36 (94,4 %) | 8/114 (7,0 %) |
| Version anterior no publicada (referencia) | 114 benignos | No disponible | 77/114 (68 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un clasificador de seguridad de este tipo. La model card indica que el umbral se selecciono por ROC en validacion con el criterio FPR <= 0,05 y que el informe completo esta en `model_card.json` dentro del repositorio.

## Requisitos de hardware

- VRAM estimada: practicamente nula si se usa CPU; menos de 1 GB si se carga en GPU, dado que el repositorio completo ocupa 0,1 GB y el modelo base es una variante "tiny" cuantizada.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090) sirve de sobra si se prefiere acelerar la inferencia; no tiene sentido asignarle A100 o H100 de forma dedicada.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: `onnxruntime` (el ejemplo de la model card usa `CPUExecutionProvider`), envoltorio propio con FastAPI, ONNX Runtime Server, NVIDIA Triton Inference Server, o conversion a otros runtimes si se necesita. No es desplegable en vLLM ni en motores orientados a generacion de texto, porque no es un modelo generativo; llama.cpp y Ollama no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles. Se trata de un encoder compacto ejecutado en CPU, por lo que la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

En la informacion proporcionada no se incluye ninguna comparativa con otros modelos, y la busqueda web realizada no devolvio resultados relevantes (unicamente paginas de ayuda de YouTube, sin relacion con el modelo). Por tanto, los datos de rendimiento de alternativas de la misma categoria no estan disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Serega71/talvion-injection-guard-onnx | No disponible (base "tiny") | 768 tokens (segun configuracion de inferencia) | 34/36 ataques detenidos y 8/114 falsos positivos en el conjunto extendido (capa completa) | MIT | HuggingFace, ONNX |
| `protectai/deberta-v3-base-prompt-injection` (alternativa de la misma categoria, por referencia) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |
| `meta-llama/Prompt-Guard-86M` (alternativa de la misma categoria, por referencia) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |

Se nombran las dos alternativas unicamente como referencia de categoria; no se ha encontrado en la busqueda ningun dato verificable sobre ellas que permita una comparacion numerica.

## Limitaciones y advertencias

- Corpus enteramente sintetico: tanto los datos de entrenamiento como los de test fueron generados por LLM, y los ejemplos benignos provienen de los mismos splits SFT del proyecto. No se han usado conversaciones reales de usuarios, por lo que el comportamiento en trafico real no esta validado.
- Tasa de falsos positivos no despreciable: en torno al 7 % de mensajes benignos bloqueados por error en el conjunto extendido (8 de 114). En el conjunto congelado de 14 benignos el FPR es del 28,6 %, aunque el autor advierte de que esa muestra es demasiado pequena para estimarlo con precision.
- Ataques no detectados: dos ataques del tipo `public_generic` (formulaciones cortas y despersonalizadas sin marcadores evidentes) pasan el filtro en ambos conjuntos.
- No es una solucion completa: es solo una capa de la defensa. El propio autor indica que por si solo no garantiza la ausencia de prompt injection y que debe acompanarse de heuristicas de entrada y de un validador de salida.
- Cobertura linguistica restringida a ruso e ingles; el comportamiento en otros idiomas o en estilos de texto muy distintos no se ha probado.
- Dominio y longitud acotados: entrenado y evaluado con textos caracteristicos de soporte B2B de hasta 768 tokens; no hay evidencia sobre entradas mas largas o de otro registro.
- Sensibilidad al umbral: el valor 0,8758 esta calibrado para FPR <= 0,05, lo que implica renunciar a detectar ataques mas sutiles. Bajarlo mejora la deteccion a costa de mas falsos positivos, con el coste operativo que ello conlleva.
- Riesgo de alucinacion: no aplica al modelo en si (es un clasificador discriminativo, no genera texto), pero las decisiones que desencadene aguas abajo en un LLM si pueden verse afectadas por falsos negativos.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright. Al derivar de `cointegrated/rubert-tiny2`, tambien MIT, no se anaden restricciones conocidas.
- Madurez y soporte: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, el dataset y el codigo de entrenamiento no estan publicados y la model card declara que "Talvion" es un nombre ficticio, lo que dificulta la reproducibilidad y la verificacion independiente de las metricas.
- Fechas del repositorio: creado y actualizado el 17 de septiembre de 2026, con apenas 49 segundos entre ambos eventos, lo que sugiere una publicacion automatica sin historial de iteraciones visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Serega71/talvion-injection-guard-onnx
- Modelo base: https://huggingface.co/cointegrated/rubert-tiny2
- Repositorio del proyecto (dataset, entrenamiento y resto de componentes): no publicado segun la model card
- Paper: no disponible
- Blog o demo: no disponible
- Resultados de la busqueda web: no se encontraron enlaces relevantes al modelo; los resultados obtenidos correspondian a paginas de ayuda de YouTube sin relacion con el contenido solicitado
