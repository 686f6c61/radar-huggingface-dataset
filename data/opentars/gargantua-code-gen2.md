# OpenTARS/Gargantua-Code-Gen2

## Resumen

Gargantua-Code-Gen2 es un ajuste fino mediante LoRA del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por OpenTARS para su aplicación de asistente local openTARS. El modelo está especializado en tareas de escritura, lectura, corrección y explicación de código, además de interactuar con las 19 herramientas (tool calling) que expone la aplicación anfitriona. Se distribuye únicamente en formato GGUF con cuantización Q4_K_M (4,7 GB), lo que lo hace desplegable en hardware de consumo.

El modelo resuelve un problema concreto: dotar a un asistente de escritorio local (Linux, Windows, macOS) de un motor de código que no dependa de la nube y que sepa invocar las herramientas de la app de forma segura. No es un modelo de propósito general ni un benchmark de programación: el propio autor advierte que las 60 tareas evaluadas son simples.

Su relevancia actual radica en el nicho: un modelo de 7.615.616.512 parámetros, licencia Apache 2.0, compatible con endpoints y Ollama, pensado para ejecución local en GPUs modestas (el autor reporta pruebas en una RTX 3050). La información pública es escasa y no hay datos verificables sobre el corpus de entrenamiento ni sobre evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct; detalles internos no disponibles) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unica publicada, 4,7 GB) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros. Sobre esa base se aplica un ajuste fino con LoRA orientado a dos objetivos: generar, leer, corregir y explicar código, y emitir llamadas a las 19 herramientas de la aplicación openTARS siguiendo su prompt de sistema. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), la duración del entrenamiento ni si se aplicó RLHF o DPO.

La innovación técnica declarada es la integración con el ecosistema de la app: el modelo está alineado con el formato de prompt y el esquema de herramientas de openTARS 5.2, y se distribuye cuantizado en Q4_K_M para ejecución local. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia. El repositorio incluye el código de la app y las pruebas en GitHub bajo licencia MIT, separada de la licencia Apache 2.0 de los pesos.

## Capacidades

- Generación de código: escritura de funciones y scripts, según las tareas evaluadas por el autor.
- Lectura y explicación de código existente.
- Corrección y depuración de código (fixing).
- Uso de shell: generación y manejo de comandos de terminal dentro de la app.
- Tool calling: invocación de las 19 herramientas expuestas por openTARS mediante el prompt de la aplicación.
- Integración con agentes: el modelo opera como motor de un asistente que abre programas, pulsa botones, escribe, busca en la web y ejecuta comandos.
- Conversacional: etiquetado como `conversational` en Hugging Face.
- Solo texto: la model card indica explícitamente que no tiene visión.
- Capacidades multilingües: no disponible (no declaradas para este ajuste).

## Casos de uso

- Asistente de escritorio local para programadores: el modelo genera y corrige funciones directamente en la app openTARS, manteniendo el procesamiento en la máquina del usuario y sin suscripción, lo que encaja en entornos con requisitos de privacidad.
- Automatización de tareas de shell: el modelo traduce instrucciones en lenguaje natural a comandos de terminal y los ejecuta a través de las herramientas de la app; el autor reporta ausencia de acciones peligrosas en su evaluación, aunque esto debe validarse en producción.
- Explicación de código heredado: dado un fragmento, el modelo lo describe y comenta; útil para incorporar nuevos desarrolladores a bases de código existentes.
- Corrección guiada por error: el usuario pega un error y el código asociado, y el modelo propone el arreglo; adecuado para iteración rápida en local.
- Generación de scripts de automatización: creación de scripts para tareas repetitivas del sistema operativo, aprovechando la integración con las herramientas de la app.
- Motor de un agente de escritorio: al estar alineado con el prompt y las herramientas de openTARS, sirve como backend de un agente que combina búsqueda web, control de interfaz y ejecución de comandos en un solo flujo multi-paso.
- Despliegue en hardware de consumo: con Q4_K_M y 4,7 GB, cabe en GPUs de gama baja; el autor reporta 7,7 s medios por tarea en una RTX 3050, lo que lo hace viable para uso interactivo no crítico.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Tareas de codigo (fixing, explicacion, escritura de funciones y scripts, shell) | 51/60 (85%) | openTARS 5.2, 04/11/2026, una sola ejecucion, 60 tareas simples |
| Latencia media por tarea | 7,7 s | RTX 3050, cuantizacion Q4_K_M |

El propio autor advierte que las tareas son simples y que la puntuación no constituye un benchmark general de programación. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la información disponible. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,7 GB para los pesos en Q4_K_M, más overhead de contexto y runtime; una GPU con 6-8 GB debería ser suficiente para contextos moderados (estimación, no dato publicado).
- GPU recomendadas: el autor valida RTX 3050; GPUs de gama media como RTX 3060/4060 o superiores ofrecerán mayor margen de contexto y velocidad. Para despliegue servidor, A100 o H100 son viables pero sobredimensionadas para un modelo de 7B cuantizado.
- Cabe en GPU de consumo: sí, al menos en RTX 3050 según la model card; también es viable en CPU con llama.cpp/Ollama, aunque con mayor latencia.
- Opciones de despliegue: Ollama (`ollama run ProjectOpenTARS/Gargantua-Code-Gen2:code`), llama.cpp y cualquier runtime compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`. Compatibilidad con vLLM o TGI no está confirmada para este artefacto GGUF.
- Latencia y throughput: 7,7 s medios por tarea en RTX 3050 con Q4_K_M (dato del autor, una ejecución). Throughput en tokens por segundo no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gargantua-Code-Gen2 | 7.615.616.512 | no disponible | GGUF Q4_K_M | Apache 2.0 | Ajuste LoRA de Qwen2.5-Coder-7B-Instruct para openTARS; 85% en 60 tareas propias |
| Qwen2.5-Coder-7B-Instruct (base) | 7.615.616.512 | 32.768 tokens nativos (ampliable) | safetensors, GGUF | Apache 2.0 | Modelo generalista de código; sin alineación a las herramientas de openTARS |
| Alternativas de 7B orientadas a código | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer comparaciones de rendimiento |

La comparación de rendimiento con alternativas no puede realizarse con rigor: no hay benchmarks estandar publicados para Gargantua-Code-Gen2 ni datos de terceros. La única comparación defendible es con su modelo base, del que hereda arquitectura y parámetros pero no el ajuste específico a herramientas.

## Limitaciones y advertencias

- Evaluación débil: 60 tareas simples, una sola ejecución y sin conjunto de validación independiente; el 85% no es extrapolable a programación general.
- Sin benchmarks estandar: no hay resultados en MMLU, HumanEval ni GSM8K, lo que impide comparar con el estado del arte.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs inexistentes o comandos incorrectos; la ejecución de comandos de shell a través de la app exige sandboxing y confirmación del usuario.
- Idiomas no declarados: la model card no especifica idiomas soportados; el rendimiento en castellano no está verificado.
- Contexto no documentado: no se indica la longitud de contexto efectiva tras el ajuste; asumir la del modelo base sin verificación es arriesgado.
- Una sola cuantización: solo se publica Q4_K_M; no hay versiones de mayor precisión (Q8, FP16) para evaluar la pérdida por cuantización.
- Distribución limitada: 33 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario mínimos.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial; el código de la app openTARS es MIT, pero las condiciones de uso de la aplicación deben revisarse por separado.
- Dependencia de la app: el ajuste está alineado al prompt y a las 19 herramientas de openTARS 5.2; fuera de ese entorno, la ventaja del ajuste puede diluirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-Code-Gen2
- Mirror de la app openTARS en Hugging Face: https://huggingface.co/OpenTARS/openTARS
- Repositorio GitHub (código y pruebas, MIT): https://github.com/project-opentars/OpenTARS
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
