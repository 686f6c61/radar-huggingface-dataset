# inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-FP8-W8A8

## Resumen

Qwen3.8-27B-DSpark-PerfectBlend-FP8-W8A8 es un componente de decodificacion especulativa (un *drafter* o modelo borrador) publicado por el usuario inference-optimization. No es un modelo de chat autonomo: se empareja con Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) para acelerar la generacion mediante el metodo DSpark. Deriva de RedHatAI/Qwen3.8-27B-speculator.dspark, revision `7f33c272e5da240978e0d55767abab8193d74b95`, al que se le ha aplicado una cuantizacion estatica FP8 W8A8.

El modelo tiene 1.988.431.617 parametros (unos 2.000 millones, medidos en el safetensors publicado) y el repositorio ocupa 2,1 GB, coherente con un almacenamiento de 1 byte por parametro mas metadatos de cuantizacion. La cuantizacion se calibro con 1.892 registros alineados de estados ocultos del modelo objetivo, con un limite de secuencia de 2.048, extraidos de una muestra local de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated` (derivado a su vez de `mlabonne/open-perfectblend`). Se distribuye bajo licencia Apache 2.0 y libreria `speculators`, con pesos en safetensors y `custom_code`.

Su relevancia es operativa: los drafters permiten reducir la latencia por token del modelo objetivo sin tocar sus pesos, y esta variante anade una ruta FP8 pensada para despliegues en hardware con soporte de punto flotante de 8 bits. Ahora bien, el propio autor indica que la evaluacion esta pendiente y que el checkpoint no ha superado validacion de serving, por lo que debe tratarse como una publicacion con procedencia de cuantizacion documentada, no como una pieza lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (drafter) para decodificacion especulativa, metodo DSpark; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 1.988.431.617 (segun safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el drafter opera sobre el contexto gestionado por el modelo objetivo |
| Tipos de cuantizacion | FP8 estatica W8A8 (pesos y activaciones en FP8), formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), con `custom_code` |
| Libreria | speculators |
| Tipo de componente | Drafter de decodificacion especulativa (no es un modelo de chat autonomo) |
| Modelo base (objetivo) | Qwen/Qwen3.8-27B, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Modelo de origen del drafter | RedHatAI/Qwen3.8-27B-speculator.dspark, revision `7f33c272e5da240978e0d55767abab8193d74b95` |
| Tamano del repositorio | 2,1 GB |
| Datos de calibracion | 1.892 registros alineados de estados ocultos del objetivo; limite de secuencia 2.048; muestra local derivada de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated` (origen: `mlabonne/open-perfectblend`) |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

El artefacto publicado es un drafter DSpark cuantizado, no un modelo entrenado desde cero en esta publicacion. La model card no describe el numero de capas, la dimension oculta ni el mecanismo de atencion del borrador; lo que si se detalla es el proceso de cuantizacion. Se aplico una cuantizacion estatica FP8 W8A8 sobre el drafter de RedHatAI, calibrada con 1.892 registros de estados ocultos alineados con el modelo objetivo Qwen3.8-27B, con un limite de secuencia de 2.048 tokens. El autor especifica que la muestra de calibracion no es la coleccion PerfectBlend original sin modificar, sino una muestra proporcional local derivada de `shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated`.

Todos los comandos de cuantizacion, manifiestos, ficheros fuente, parches y el resumen SHA-256 de los pesos publicados estan en `provenance/quantization/`, lo que permite reproducir el proceso. Los datos de los prompts de calibracion no se redistribuyen. No se documenta en la informacion disponible si el drafter original uso RLHF, DPO, decodificacion especulativa con atencion lineal ni ninguna otra innovacion de entrenamiento; la unica intervencion declarada sobre el artefacto de origen es la cuantizacion y su calibracion.

## Capacidades

- Aceleracion de decodificacion especulativa: actua como modelo borrador que propone tokens que el modelo objetivo Qwen3.8-27B verifica, con el metodo DSpark y un parametro de tokens especulativos configurable (`--spec-tokens`, 8 en el ejemplo de la model card).
- Integracion con vLLM: se sirve como modelo secundario mediante `--spec-model` y `--spec-method dspark`.
- Cuantizacion estatica FP8 W8A8: permite almacenar y ejecutar el borrador en precision de 8 bits con escalas calibradas contra los estados ocultos reales del objetivo.
- Trazabilidad de cuantizacion: incluye comandos, manifiesto, parches y checksum, lo que facilita auditoria y reproduccion.
- Generacion de texto y conversacion: heredadas del pipeline declarado (text-generation) del modelo objetivo, no evaluadas en este checkpoint.
- Capacidades especificas del drafter (longitud de aceptacion, tasa de aceptacion, modo thinking, tool calling, vision o audio): no disponibles. La evaluacion esta pendiente y el autor no publica resultados de aceptacion, velocidad ni calidad.

## Casos de uso

- Reduccion de latencia en serving interactivo: desplegar Qwen3.8-27B con este drafter en vLLM para disminuir el tiempo por token en cargas conversacionales, siempre que se valide antes la tasa de aceptacion en el dominio objetivo.
- Aumento de throughput en inferencia por lotes: al proponer varios tokens por paso de verificacion, el coste por token generado puede bajar en GPUs con FP8 nativo, lo que resulta util en pipelines de generacion masiva de texto.
- Asistentes de codigo con requisitos de baja latencia: en autocompletado o generacion en IDE, donde cada milisegundo cuenta, un borrador cuantizado ocupa poca VRAM adicional frente al modelo objetivo.
- Despliegues on-premise con VRAM limitada: el borrador en FP8 ocupa del orden de 2 GB de pesos, un sobrecoste pequeno frente a los pesos del objetivo, lo que facilita anadirlo a un nodo ya dimensionado para Qwen3.8-27B.
- Pipelines agenticos multi-paso: en flujos con muchas llamadas cortas al modelo (planificacion, tool calling, verificacion), la decodificacion especulativa reduce la latencia acumulada de cada paso.
- Recuperacion aumentada (RAG) con prompts largos: al mantener el objetivo y solo acelerar la decodificacion, encaja en arquitecturas RAG donde el prefijo es largo y la respuesta es corta.
- Experimentacion y evaluacion de tecnicas de decodificacion especulativa: el repositorio sirve como artefacto de referencia para medir aceptacion de borradores FP8 frente a versiones sin cuantizar, dado que incluye procedencia completa.
- Servicio en infraestructura con aceleradores de 8 bits: nodos con H100, L40S o GPUs con soporte FP8 pueden aprovechar la ruta W8A8 sin reentrenar ni recalibrar el objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "Evaluation is pending. No completed acceptance, speed, or quality results are included with this publication." No hay datos de MMLU, HumanEval, GSM8K ni de tasa de aceptacion o *speedup* del drafter, y el propio autor senala que el comando de serving es un ejemplo y que el checkpoint no ha completado validacion de runtime.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 2 GB para los pesos en FP8 (1,988 mil millones de parametros a 1 byte por parametro), mas overhead de activaciones, escalas y cache, estimado en 0,3-1 GB adicionales segun lote y longitud de secuencia. Cifras estimadas a partir del tamano de parametros; no publicadas por el autor.
- VRAM total del sistema: la suma del drafter mas el modelo objetivo Qwen3.8-27B, cuyos requisitos dependen de la cuantizacion elegida y no se detallan en la informacion disponible.
- GPU recomendadas: aceleradores con soporte nativo de FP8, como H100, H200 o L40S. GPUs Ampere (A100) y anteriores no ejecutan FP8 de forma nativa, por lo que la ventaja de esta variante se reduce.
- GPU de consumo: el drafter por si solo cabe en cualquier GPU consumer con 4 GB o mas de VRAM libre (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.). El modelo objetivo completo de 27B no cabe en una GPU consumer de 24 GB en la mayoria de configuraciones, salvo cuantizaciones agresivas no documentadas aqui.
- Opciones de despliegue: vLLM, con el par objetivo + drafter y los flags `--spec-model` y `--spec-method dspark`. El formato compressed-tensors con `custom_code` no es compatible directamente con llama.cpp, Ollama o TGI segun la informacion disponible.
- Latencia y throughput: no disponibles. No hay resultados de aceptacion ni de aceleracion publicados, y la validacion de serving esta sin completar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-FP8-W8A8 | Drafter DSpark cuantizado | 1.988.431.617 | FP8 W8A8 estatica | No disponible | apache-2.0 | Evaluacion pendiente; sin validacion de serving |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter DSpark original | No disponible | No disponible (sin cuantizar, segun la informacion disponible) | No disponible | No disponible | Publicado por Red Hat AI; origen del checkpoint anterior |
| Otros drafters de decodificacion especulativa (familias EAGLE-3, Medusa u otras) | Drafter / cabezas de prediccion | No disponible | No disponible | No disponible | No disponible | No evaluados en la informacion proporcionada; comparacion no disponible |

## Limitaciones y advertencias

- No es un modelo de chat autonomo: la model card lo declara explicitamente un componente drafter. Usarlo sin el modelo objetivo Qwen3.8-27B no produce una funcionalidad valida.
- Dependencia de revisiones concretas: el emparejamiento esta fijado a las revisiones `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` (objetivo) y `7f33c272e5da240978e0d55767abab8193d74b95` (drafter de origen). Cambiar de revision invalida la calibracion y puede degradar la tasa de aceptacion.
- Evaluacion incompleta: no hay resultados de aceptacion, velocidad ni calidad, y la validacion de serving/runtime esta pendiente. El comando de vLLM de la model card es ilustrativo.
- Cuantizacion estatica con calibracion acotada: se usaron 1.892 registros con limite de secuencia 2.048, procedentes de una muestra derivada de OpenPerfectBlend. Dominios alejados de esa distribucion pueden reducir la aceptacion del borrador.
- Riesgo de alucinacion: aunque el objetivo verifica los tokens propuestos, un borrador mal calibrado puede reducir la eficacia o, en implementaciones defectuosas, afectar a la calidad percibida. No hay datos que cuantifiquen este riesgo.
- Idiomas: no disponibles. La calibracion procede de un dataset predominantemente en ingles, pero el autor no detalla cobertura linguistica.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, seguridad ni toxicidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo objetivo Qwen3.8-27B y del artefacto de Red Hat AI, y los datos de calibracion no se redistribuyen, lo que limita la auditoria completa del proceso.
- Requisitos de hardware especificos: la ruta FP8 solo aporta ventaja real en aceleradores con soporte nativo; en GPUs sin FP8 el checkpoint puede no ser la opcion optima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-27B-DSpark-PerfectBlend-FP8-W8A8
- Drafter de origen: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibracion regenerado: https://huggingface.co/datasets/shanjiaz/OpenPerfectBlend-Qwen38-27B-regenerated
- Dataset de origen de la calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Procedencia de cuantizacion: directorio `provenance/quantization/` dentro del repositorio del modelo (comandos, manifiesto, parches y digest SHA-256)
