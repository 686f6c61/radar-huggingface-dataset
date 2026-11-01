# Privoid-ai/Privoid-Tool-Qwen3-4B-GGUF

## Resumen

Privoid Tool Qwen3-4B GGUF es la versión cuantizada en formato GGUF del modelo Privoid Tool, un ajuste fino mediante LoRA sobre Qwen3-4B orientado específicamente a la llamada de funciones (function calling) y al uso de herramientas en entornos locales. Lo desarrolla Privoid-ai y se distribuye bajo licencia Apache-2.0, con un único fichero Q5_K_M de 2,69 GB que permite inferencia en CPU o GPU de gama media sin necesidad de infraestructura dedicada.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros, y añade un adaptador LoRA fusionado que especializa el comportamiento hacia la emisión estructurada de llamadas a herramientas. Su relevancia actual radica en que ofrece una alternativa ligera y ejecutable localmente para pipelines de agentes y asistentes que necesitan invocar APIs, con una validación explícita de que la cuantización Q5_K_M preserva la tasa de acierto del adaptador original en BF16 (0,941 en ambos casos sobre 220 ejemplos reservados).

La model card es deliberadamente sobria: no publica ventana de contexto nativa, composición del dataset de entrenamiento ni resultados de benchmarks generales. El autor documenta únicamente el proceso de conversión (llama.cpp commit `dde879bc4f`) y una comprobación de fidelidad de la cuantización, lo que sitúa al modelo como una pieza de ingeniería práctica más que como un lanzamiento con evaluación académica extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso emplea `n_ctx=2048`) |
| Tipos de cuantizacion | GGUF Q5_K_M (único fichero publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`privoid-tool-qwen3-4b-Q5_K_M.gguf`, 2,69 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer denso de 4.022 millones de parámetros. Sobre esa base, Privoid-ai entrena un adaptador LoRA especializado en function calling y tool use, que posteriormente se fusiona con los pesos del modelo base para producir `Privoid-ai/Privoid-Tool-Qwen3-4B`. La versión GGUF se obtiene convirtiendo ese modelo fusionado con llama.cpp (commit `dde879bc4f`) y cuantizando a Q5_K_M.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor sí documenta que el modelo fue entrenado y evaluado con el modo *thinking* desactivado, y que el prompt de sistema de referencia se encuentra en `privoid_tool_settings.json` dentro del repositorio principal. La innovación destacable no es arquitectónica sino de proceso: la verificación de que la cuantización no degrada el comportamiento, comparando el adaptador en BF16 con el GGUF Q5_K_M sobre los mismos 220 ejemplos reservados.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con el tokenizador de Qwen3.
- Llamada de funciones y uso de herramientas: el modelo propone llamadas a herramientas estructuradas a partir de un esquema `tools` proporcionado en el prompt.
- Integración con `llama-cpp-python` mediante prompt renderizado por el tokenizador (`apply_chat_template` con `enable_thinking=False`).
- Razonamiento multi-paso orientado a agentes, en la medida en que encadena propuestas de llamadas sucesivas.
- Soporte de modo *thinking* en la arquitectura base, aunque el autor recomienda y evalúa con el pensamiento desactivado.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de atención al cliente con invocación de APIs: el modelo emite llamadas estructuradas a herramientas de consulta de pedidos, estado de cuenta o base de conocimiento, y la aplicación valida cada llamada antes de ejecutarla, tal como exige el autor.
- Automatización de tareas internas sobre CPU: al ejecutarse con llama.cpp en un fichero de 2,69 GB, permite desplegar un agente de herramientas en portátiles o servidores sin GPU dedicada, con un coste aproximado de 10,7 segundos por ejemplo en CPU de Colab.
- Enrutamiento de intenciones en pipelines de CI/CD: el modelo puede clasificar la petición del usuario y proponer la herramienta adecuada (consulta de logs, lanzamiento de build, apertura de incidencia) dentro de un flujo automatizado.
- Prototipado rápido de agentes locales: investigadores pueden iterar sobre esquemas de herramientas y prompts de sistema sin depender de APIs externas, usando el mismo tokenizador que el modelo base para renderizar el chat.
- Extracción estructurada de datos desde lenguaje natural: dado un esquema de función con campos tipados, el modelo propone la llamada con los argumentos rellenados, que la aplicación convierte en JSON validado.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo Apache-2.0 ejecutable íntegramente en local, encaja en escenarios donde los datos no pueden salir de la infraestructura del cliente, siempre que la aplicación implemente la autorización de llamadas.
- Evaluación comparativa de cuantizaciones: sirve como caso de estudio reproducible de cómo Q5_K_M preserva el comportamiento de un adaptador BF16 (199 de 220 respuestas idénticas).

## Benchmarks y rendimiento

El autor no publica benchmarks generales (MMLU, HumanEval, GSM8K). El único dato de evaluación disponible es la comprobación de fidelidad de la cuantización sobre 220 ejemplos reservados, con hasta 20 por grupo de test:

| Modelo | Acierto en los mismos ejemplos |
|---|---:|
| Adaptador (Transformers, BF16) | 0,941 |
| Este GGUF (Q5_K_M) | 0,941 |

Datos adicionales: 199 de 220 respuestas fueron idénticas al adaptador, no se filtró ninguna *canary* plantada, y el tiempo medio fue de aproximadamente 10,7 segundos por ejemplo en CPU de Colab. La muestra es más pequeña que el benchmark principal del repositorio base.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa 2,69 GB; con overhead de contexto y buffers de llama.cpp, el consumo real se sitúa por encima de esa cifra, aunque no se publica una medición concreta.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM libre debería poder cargar el modelo, aunque no hay validación publicada.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, así como en Apple Silicon con memoria unificada; sin confirmación oficial.
- Despliegue: la única ruta probada es `llama-cpp-python` con prompt renderizado por el tokenizador. Ollama, LM Studio y llama-server no fueron testeados según el autor.
- Latencia y throughput: aproximadamente 10,7 segundos por ejemplo en CPU de Colab; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Privoid Tool Qwen3-4B GGUF | 4.022 M | No disponible | Function calling / tool use | Apache-2.0 | GGUF Q5_K_M |
| Qwen3-4B (base) | 4.000 M aprox. | No disponible en esta ficha | Propósito general | Apache-2.0 | Safetensors, GGUF |
| Alternativas de tool calling de 3-4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo solo propone llamadas a herramientas; la aplicación debe validar cada llamada y gestionar la autorización. No es un componente seguro por sí mismo.
- Entrenado y evaluado con el modo *thinking* desactivado; usarlo con pensamiento activado puede degradar el comportamiento esperado.
- El prompt de sistema de referencia (`privoid_tool_settings.json`) es parte del diseño; omitirlo puede alterar los resultados.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano no está validado.
- La evaluación de la cuantización se basa en una muestra de 220 ejemplos, menor que el benchmark principal, por lo que la equivalencia con BF16 es indicativa.
- No se documentan sesgos, composición del dataset ni riesgos de alucinación específicos; como todo modelo generativo, puede producir argumentos de llamada plausibles pero incorrectos.
- Las rutas de despliegue distintas de `llama-cpp-python` (Ollama, LM Studio, llama-server) no han sido probadas por el autor.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-Tool-Qwen3-4B-GGUF
- Modelo base (adaptador fusionado): https://huggingface.co/Privoid-ai/Privoid-Tool-Qwen3-4B
- Repositorio de llama.cpp (commit de conversión `dde879bc4f`): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
