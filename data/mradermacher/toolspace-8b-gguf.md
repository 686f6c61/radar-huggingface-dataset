# mradermacher/ToolSpace-8B-GGUF

## Resumen

ToolSpace-8B es un modelo de lenguaje de 8 mil millones de parametros orientado al uso de herramientas (tool use), function calling y razonamiento en horizontes largos (long-horizon), entrenado mediante aprendizaje por refuerzo por dongguanting. El repositorio aquí descrito es una cuantización GGUF estática realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que publica versiones comprimidas de modelos populares para su ejecución local con llama.cpp, Ollama y herramientas compatibles.

El problema que aborda el modelo base es la fiabilidad de los agentes: planificar secuencias largas de llamadas a herramientas, mantener coherencia en tareas multi-paso y invocar funciones de forma correcta, un área donde los LLM genéricos suelen fallar. Al estar cuantizado en múltiples formatos (desde Q2_K hasta f16), esta versión permite ejecutar el modelo en hardware de consumo, desde portátiles con 4 GB de VRAM hasta estaciones de trabajo con GPU dedicada.

La licencia MIT del modelo base lo hace especialmente atractivo para uso comercial sin restricciones, y su enfoque específico en agentes lo posiciona como alternativa ligera a modelos generalistas de mayor tamaño para tareas de orquestación de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura detallada no disponible; modelo base dongguanting/ToolSpace-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, dongguanting/ToolSpace-8B, es un modelo de 8,19 mil millones de parametros entrenado con aprendizaje por refuerzo, según indican las etiquetas del repositorio (reinforcement-learning, tool-use, function-calling, long-horizon). Los detalles concretos sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset o el metodo exacto de RL (GRPO, PPO, etc.) no estan disponibles en la informacion proporcionada.

El repositorio de mradermacher no modifica el modelo: se limita a generar cuantizaciones GGUF estáticas a partir de los pesos originales en safetensors, con conversion de tipo hf. El cuantizador tambien publica versiones imatrix (matriz de importancia ponderada) en un repositorio separado (ToolSpace-8B-i1-GGUF), que suelen ofrecer mejor calidad a igual tamaño que las cuantizaciones estáticas.

## Capacidades

- Tool use / uso de herramientas: entrenado especificamente para invocar funciones y herramientas externas de forma fiable.
- Function calling: soporte para generar llamadas a funciones estructuradas.
- Razonamiento long-horizon: planificacion y ejecucion de tareas multi-paso de larga duracion, tipico de flujos agenticos.
- Diseño para agentes: etiquetado explicito para pipelines agenticos y conversacion multi-turno (tag conversational).
- Generacion de texto en ingles: el idioma declarado es el ingles; no hay soporte multilingue declarado.
- Capacidades de vision, audio u otros modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Orquestacion de agentes con herramientas: el modelo puede actuar como cerebro de un agente que planifica y ejecuta secuencias largas de llamadas a APIs, gracias a su entrenamiento en long-horizon tool use.
- Asistentes con function calling en local: con cuantizaciones de 4,9-5,1 GB (Q4_K_S/Q4_K_M) cabe en GPUs de consumo para construir asistentes que consulten bases de datos, calendarios o APIs internas sin enviar datos a la nube.
- Automatizacion de flujos de trabajo multi-paso: tareas como extraer datos, procesarlos y escribir resultados pueden descomponerse en pasos que el modelo coordina invocando herramientas definidas por el desarrollador.
- Atencion al cliente con acceso a sistemas: el modelo puede consultar CRMs o sistemas de tickets mediante function calling manteniendo conversaciones multi-turno.
- Prototipado rapido de agentes en portatil: las cuantizaciones Q2_K (3,4 GB) y Q3_K permiten experimentar con el modelo en hardware modesto antes de escalar a produccion.
- Integracion en pipelines de CI/CD o backend: su tamaño de 8B y licencia MIT permiten desplegarlo en servidores modestos para automatizar tareas de operaciones mediante herramientas.
- Investigacion en agentes: al ser un modelo especializado en tool use mediante RL, es util como punto de partida o comparacion en investigacion de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de archivo publicados):
  - Q2_K: ~3,4 GB
  - Q3_K_M: ~4,2 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- GPU recomendadas: para Q4_K_M/Q5_K_M, cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); para Q8_0, GPUs de 12 GB o mas. Tambien es viable la ejecucion en CPU pura o modo hibrido CPU+GPU gracias a GGUF.
- Consumer GPUs: si cabe. Con Q4_K_S o Q4_K_M (~5 GB mas contexto) funciona en GPUs de 8 GB; con Q2_K/Q3_K incluso en GPUs de 4-6 GB o en portatiles con GPU integrada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI, aunque esa version no esta en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Formato |
|---|---|---|---|---|
| ToolSpace-8B (esta cuantizacion) | 8,19B | Tool use / agentes / long-horizon | MIT | GGUF |
| Qwen3-8B | 8B | Generalista con thinking mode y function calling | Apache 2.0 | Safetensors, GGUF |
| Llama 3.1 8B Instruct | 8B | Generalista con tool calling | Llama 3.1 Community License | Safetensors, GGUF |

ToolSpace-8B se diferencia de los generalistas de su clase en que su entrenamiento con RL se centra en la fiabilidad del uso de herramientas y la planificacion a largo plazo, mientras que Qwen3-8B y Llama 3.1 8B ofrecen un perfil mas equilibrado (codigo, razonamiento general, multilingüe). En licencia, MIT es mas permisiva que Apache 2.0 y notablemente mas que la licencia comunitaria de Llama. No hay datos de benchmarks para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Idioma: el unico idioma declarado es el ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- Longitud de contexto: no disponible en la informacion proporcionada; verificarla en la model card del modelo base antes de disenar flujos con contextos largos.
- Sesgos conocidos: no disponible; al ser un LLM entrenado con datos masivos, debe asumirse la presencia de sesgos tipicos.
- Riesgo de alucinacion: como todo modelo de 8B, puede generar llamadas a funciones mal formadas o argumentos inventados; se recomienda validacion esquematica de las llamadas en produccion.
- Cuantizacion: las cuantizaciones Q2_K y Q3_K conllevan perdida de calidad notable (el propio cuantizador marca Q3_K_M como "lower quality"); para uso serio se recomiendan Q4_K_M o superiores, o las versiones imatrix del repositorio i1.
- Licencia: MIT no impone restricciones de uso comercial, pero conviene verificar tambien los terminos del modelo base dongguanting/ToolSpace-8B.
- Este repositorio es una cuantizacion de terceros (mradermacher); cualquier problema de calidad derivado de la cuantizacion no es responsabilidad del autor del modelo base.
- Es un repositorio de enero de 2026 con relativamente pocas descargas (718 en el momento de los datos), por lo que el testeo comunitario es limitado.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/ToolSpace-8B-GGUF
- Modelo base: https://huggingface.co/dongguanting/ToolSpace-8B
- Cuantizaciones imatrix (ponderadas): https://huggingface.co/mradermacher/ToolSpace-8B-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#ToolSpace-8B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
