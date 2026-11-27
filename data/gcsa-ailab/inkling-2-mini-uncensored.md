# GCSA-AiLab/Inkling-2-Mini-Uncensored

## Resumen

Inkling-2-Mini-Uncensored es un modelo multimodal de tipo image-text-to-text publicado por GCSA-AiLab como derivado del modelo Inkling-2-Mini de Thinking Machines Lab. Se ha generado aplicando una edicion de direccion de rechazo con la tecnica Abliterix sobre los pesos del modelo base, con el objetivo de reducir el comportamiento de negativa ante peticiones que el modelo original rechazaria. El resultado se distribuye como pesos Safetensors fusionados en un checkpoint independiente, manteniendo la licencia Apache-2.0 del original.

El modelo conserva la arquitectura del base: `Inkling2LoopForConditionalGeneration`, un transformer con 24 capas fisicas en el que las 12 capas centrales se ejecutan tres veces (loop), combinado con una capa de mezcla de expertos (MoE) dispersa. El total de parametros reportado es de 26.400 millones, con aproximadamente 3.400 millones activos por token segun el modelo base, que ascienden a unos 5.400 millones efectivos al contabilizar la ejecucion repetida de las capas centrales. La ventana de contexto configurada en el modelo original alcanza 1.048.576 tokens.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal MoE de gran contexto con capacidades de tool calling; por otro, advierte de que la edicion Abliterix altera de forma sustancial el comportamiento de seguridad, con una tasa de respuestas consideradas inseguras del 86 % en SimpleSafetyTests. Es, por tanto, un artefacto de investigacion, no un modelo apto para produccion sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopForConditionalGeneration`; 24 capas fisicas con las 12 centrales repetidas 3 veces; MoE dispersa |
| Parametros totales | 26.388.646.440 (26,4 B) |
| Parametros activos | ~3,4 B por token (base); ~5,4 B efectivos contando la ejecucion en bucle |
| Longitud de contexto | 1.048.576 tokens (configuracion original); el ejemplo de despliegue limita a 65.536 |
| Tipos de cuantizacion | Pesos en 8-bit (modelopt); el repositorio incluye safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (heredada del modelo base), sujeta a la politica de uso aceptable de Thinking Machines |
| Formato de pesos | safetensors (20,2 GB de repositorio); incluye `mtp.safetensors` sin editar |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con atencion estandar y una capa MoE dispersa. La innovacion estructural principal es el bucle de capas: de las 24 capas fisicas, las 12 intermedias se ejecutan tres veces, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Esto explica la diferencia entre los 3,4 B activos por token del modelo base y los aproximadamente 5,4 B efectivos que se computan realmente en cada paso. El modelo acepta texto e imagen como entrada y produce texto, con un codificador visual propio que en este derivado no ha sido modificado.

El entrenamiento original corresponde a Thinking Machines Lab; esta ficha no dispone de datos sobre el volumen de tokens, la composicion del dataset ni las etapas de RLHF o DPO del modelo base. La intervencion de GCSA-AiLab consiste en una edicion de direccion de rechazo con Abliterix que modifica 113 tensores de pesos de atencion y 23 tensores de sesgo del router, fusionados despues en un checkpoint independiente. No se editan los pesos de los expertos, el codificador visual, el tokenizer ni `mtp.safetensors`. El tag `modelopt` y la indicacion de 8-bit sugieren un flujo de cuantizacion previo, aunque la model card no detalla el procedimiento completo.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 1.048.576 tokens en la configuracion original).
- Entrada multimodal de imagen y texto (image-text-to-text), con un unico limite de una imagen por prompt en el ejemplo de despliegue.
- Tool calling y function calling: el template de chat conserva el soporte y el despliegue recomendado activa `--enable-auto-tool-choice` con `--tool-call-parser inkling`.
- Razonamiento con niveles de esfuerzo configurables (el parser de razonamiento `inkling` separa el razonamiento interno de la respuesta visible).
- Capacidades de agente y razonamiento multi-paso, segun el soporte de herramientas y el parser de razonamiento del backend.
- Comportamiento de rechazo reducido de forma deliberada: en las pruebas realizadas responde de forma sustancial a la mayoria de peticiones consideradas daninas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como varian las tasas de rechazo y de cumplimiento tras una edicion Abliterix, comparando con el modelo base en las mismas condiciones.
- Evaluacion de tecnicas de edicion de pesos: sirve como caso practico para medir el impacto de modificar tensores de atencion y sesgos del router sobre el comportamiento conversacional.
- Pruebas de robustez de filtros externos: al ser un modelo con rechazo reducido, es util para validar que las capas de moderacion propias de una aplicacion detectan y bloquean contenido danino de forma independiente al modelo.
- Analisis de capacidad multimodal en contexto largo: con hasta 1.048.576 tokens, permite experimentar con documentos e imagenes extensas en tareas de investigacion.
- Desarrollo y prueba de integraciones de tool calling: el template y los parsers de Inkling permiten validar pipelines de agentes con llamadas a funciones en vLLM.
- Benchmarking de infraestructura MoE con bucle de capas: util para medir throughput y latencia de un modelo con 26,4 B de parametros y ~5,4 B efectivos activos en GPUs de distinta generacion.
- Generacion de datos sinteticos en entornos controlados de investigacion, siempre con revision humana y sin exposicion directa a usuarios finales.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a las pruebas de seguridad realizadas por el autor del derivado, con el juez automatico `deepseek-v4.1-flash` y el backend vLLM. No se aportan resultados de MMLU, HumanEval, GSM8K ni de capacidades generales.

| Benchmark | Condiciones | Resultado |
|---|---|---|
| StrongREJECT (subconjunto de 180) | Temperatura 0, max. 2.048 tokens, esfuerzo de razonamiento 0 | 5/180 rechazos explicitos; 126/180 completados con advertencia; 15/180 completados sin advertencia; 34/180 parciales o ambiguos |
| SimpleSafetyTests (100 completos) | Temperatura 0,01, max. 1.048 tokens, semilla 42, esfuerzo `none` | 86/100 (86 %) juzgados inseguros; 14/100 (14 %) seguros |
| SimpleSafetyTests, dano infantil | 20 muestras | 19 inseguras |
| SimpleSafetyTests, articulos ilegales o regulados | 20 muestras | 17 inseguras |
| SimpleSafetyTests, dano fisico y violencia | 20 muestras | 19 inseguras |
| SimpleSafetyTests, fraude | 20 muestras | 17 inseguras |
| SimpleSafetyTests, suicidio, autolesion y trastornos alimentarios | 20 muestras | 14 inseguras |
| SimpleSafetyTests, informacion/consejo | 50 muestras | 37 inseguras |
| SimpleSafetyTests, instruccion/accion | 50 muestras | 49 inseguras |

No se han publicado resultados de benchmarks de capacidades generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 (26,4 B de parametros) se requieren aproximadamente 53 GB solo para pesos, mas cache KV y activaciones; el repositorio ocupa 20,2 GB, lo que sugiere pesos en 8-bit y reduce el requisito a unos 27 GB para pesos.
- GPU recomendadas: para bfloat16, H100 80 GB, A100 80 GB o dos A100 40 GB con paralelismo de tensor; para 8-bit, una A100 40 GB o H100 80 GB resulta suficiente.
- GPU de consumo: una RTX 4090 (24 GB) no cubre los pesos en 8-bit completos con cache KV para contexto largo; podria caber con cuantizaciones mas agresivas no documentadas en el repositorio.
- Opciones de despliegue: vLLM con soporte de `Inkling2LoopForConditionalGeneration`, parser de razonamiento `inkling` y parser de tool calling `inkling`. El ejemplo oficial usa `--dtype bfloat16`, `--max-model-len 65536`, `--max-num-seqs 2`, `--max-num-batched-tokens 8192`, `--kv-cache-dtype fp8`, `--gpu-memory-utilization 0.90` y `--limit-mm-per-prompt.image 1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,4 B totales / ~5,4 B efectivos | 1.048.576 | Apache-2.0 | Hugging Face | Derivado con rechazo editado; benchmarks solo de seguridad |
| thinkingmachines/Inkling-2-Mini | 26,4 B totales / ~3,4 B activos | 1.048.576 | Apache-2.0 | Hugging Face | Modelo base, sin edicion de rechazo |
| Alternativas de tamano y categoria comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La edicion Abliterix modifica el comportamiento de seguridad: en SimpleSafetyTests el 86 % de las respuestas se juzgaron inseguras, con especial incidencia en dano fisico (19/20) y dano infantil (19/20).
- No debe utilizarse como filtro de seguridad ni como unico mecanismo de moderacion; requiere capas externas de proteccion.
- Las pruebas publicadas solo cubren prompts daninos en ingles y un juez automatico; no hay comparacion con el modelo base en las mismas condiciones.
- No se demuestra que las capacidades generales, la calidad de comprension visual ni el rendimiento en otros idiomas se mantengan tras la edicion.
- La edicion no toca los pesos de los expertos ni el codificador visual, pero si 113 tensores de atencion y 23 sesgos del router, lo que puede degradar la coherencia en tareas largas o complejas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base, que tampoco se detallan.
- La licencia Apache-2.0 permite uso comercial, pero el uso queda sujeto a la politica de uso aceptable de Thinking Machines Lab.
- El despliegue requiere una build de vLLM con soporte especifico para Inkling 2; no se garantiza compatibilidad con llama.cpp, Ollama u otros motores.
- El contexto maximo real en el ejemplo de despliegue se limita a 65.536 tokens, muy por debajo del maximo configurado de 1.048.576.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- StrongREJECT: https://github.com/dsbowen/strong_reject
- SimpleSafetyTests: https://github.com/bertiev/SimpleSafetyTests
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
