# nexiloopofficial/nexi-4-v2-GGUF

## Resumen

NEXI-4 v2 (GGUF) es un modelo de lenguaje especializado en tool calling y computer use, distribuido en formato GGUF para su ejecución con llama.cpp. Lo desarrolla el autor independiente nexiloopofficial y se construye a partir de Qwen3.5-2B, al que se le aplica un LoRA entrenado sobre el corpus xlam-function-calling de Salesforce, con posterior fusión de pesos y exportación a cuantización Q4_K_M. El resultado es un modelo de 1.881.825.088 parámetros que ocupa 1,29 GB en disco y que, según las mediciones del autor, se ejecuta con un pico de RSS de 2,02 GB en CPU.

El modelo resuelve un problema muy concreto: disponer de una columna vertebral de decisión para agentes locales y function calling offline en máquinas con aproximadamente 4 GB de RAM, sin GPU. Emite llamadas a herramientas en formato JSON dentro de etiquetas `<tool_call>`, siguiendo el esquema de xlam. No está pensado como modelo de chat general, sino como especialista en selección de acciones y emisión de contratos de herramienta válidos.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache 2.0 y un pipeline reproducible (datos, LoRA, merge, GGUF) documentado públicamente. El autor es explícito sobre el alcance de sus métricas: la evaluación propia consta de 10 tareas y no constituye una afirmación de liderazgo en BFCL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B con LoRA fusionado); detalles internos no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de la familia Qwen, sobre el que se entrena un LoRA utilizando el corpus real Salesforce xlam-function-calling (acceso restringido, usado bajo licencia). Posteriormente los pesos del adaptador se fusionan con el modelo base y el conjunto se exporta a GGUF en cuantización Q4_K_M. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación destacable no está en la arquitectura, sino en el pipeline y en el resultado medido: según el autor, la versión 1 del modelo obtenía un 20 % en su suite de evaluación de tool calling, mientras que la versión 2 alcanza el 100 % gracias al uso de datos reales de xlam. El autor identifica el pipeline (datos, LoRA, merge, GGUF) como la parte validada del proyecto. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de llamadas a herramientas en formato JSON dentro de etiquetas `<tool_call>`, siguiendo el esquema xlam.
- Selección de acciones para computer use (elección de la acción adecuada en un entorno de interfaz).
- Function calling offline, sin dependencia de servicios en la nube.
- Conversación básica en formato conversacional (etiqueta `conversational` en el repo).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución en CPU mediante llama.cpp.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes locales en equipos de bajos recursos: el modelo actúa como planificador de acciones que decide qué herramienta invocar en cada turno, con un consumo de memoria de unos 2 GB, adecuado para portátiles antiguos o mini-PC sin GPU.
- Automatización de escritorio (computer use): selecciona la acción siguiente en una interfaz a partir del estado observado, lo que permite construir asistentes de automatización de tareas repetitivas en entornos controlados.
- Function calling en dispositivos edge: integrado en un servicio llama.cpp, permite que un dispositivo embebido con 4 GB de RAM resuelva la selección de funciones sin enviar datos a la nube, útil en contextos de privacidad.
- Enrutamiento de intenciones en pipelines de agentes: dado un mensaje de usuario y un catálogo de herramientas, el modelo emite la llamada estructurada que un orquestador posterior ejecuta, reduciendo la carga sobre un modelo mayor.
- Prototipado rápido de asistentes con herramientas: gracias a su licencia Apache 2.0 y a su reducido tamaño, sirve para validar contratos de herramienta y esquemas JSON antes de invertir en modelos de mayor escala.
- Evaluación y docencia: el repositorio incluye la metodología y el JSON de benchmarks, lo que permite reproducir la evaluación de tool calling en CPU y comparar el comportamiento del modelo base frente al ajustado.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en CPU (8 vCPU, sin GPU, llama.cpp):

| Metrica | Valor |
|---|---|
| Tamano de fichero | 1,29 GB |
| Pico de RSS durante inferencia | 2,02 GB |
| Velocidad | 15,1 tok/s |
| Carga en frío | 1,5 s |
| tool_call eval (suite NEXI, 10 tareas) | 100 % (modelo base: 0 %) |
| cua eval (suite de selección de acciones NEXI) | 100 % (modelo base: 93,3 %) |

El autor advierte que la evaluación de tool calling consta de solo 10 tareas, que demuestra que se ha aprendido el contrato de salida y que no constituye una afirmación de liderazgo a escala BFCL. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso medido, ya que la ejecución es en CPU; el pico de RSS es de 2,02 GB.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU.
- Cabida en GPU de consumo: no documentado; por tamaño (1,29 GB en Q4_K_M) cabría en cualquier GPU con más de 2 GB de memoria, pero no hay mediciones publicadas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); compatible con endpoints según las etiquetas del repo; no se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 15,1 tok/s en 8 vCPU sin GPU; carga en frío de 1,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEXI-4 v2 (GGUF) | 1.881.825.088 | No disponible | Tool calling y computer use en 4 GB | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-2B (base) | ~2B | No disponible | Modelo generalista | Según modelo base | Pesos originales |
| Alternativas de tool calling de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Techo de razonamiento propio de la clase 2B: es un especialista en tool calling, no un modelo de chat general; el autor lo indica explícitamente.
- La evaluación de tool calling se basa en 10 tareas y no equivale a una validación a escala BFCL; los resultados del 100 % deben interpretarse como evidencia de que se ha aprendido el contrato de salida.
- Riesgo de alucinación en la generación de argumentos de herramientas fuera de los esquemas vistos en entrenamiento; conviene validar el JSON emitido antes de ejecutarlo.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto fuera del inglés.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones multi-turno largas.
- Solo se publica la cuantización Q4_K_M; no hay variantes de mayor o menor precisión en el repo.
- El corpus xlam es de acceso restringido y se usó bajo licencia; aunque los pesos se distribuyen con Apache 2.0, conviene revisar las condiciones del dataset original si se redistribuye el modelo con fines comerciales.
- Sesgos conocidos: no documentados por el autor.
- Proyecto de autor independiente con 183 descargas y 1 like en el momento de la consulta; madurez y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nexiloopofficial/nexi-4-v2-GGUF
- Repositorio del proyecto: https://github.com/PupppyLoverr/NEXI-Models-Drivers
- Benchmarks y metodología: https://github.com/PupppyLoverr/NEXI-Models-Drivers/blob/main/nexi-4gb/BENCHMARKS.md
