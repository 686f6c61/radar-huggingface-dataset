# nandakishorm/vega-U

## Resumen

vega-U es un motor de decisión de tipo "typed decisions" (decisiones con esquema) de 14,3 millones de parámetros, desarrollado por el autor de Hugging Face `nandakishorm` dentro del ecosistema `vegaml`. No es un modelo generativo de lenguaje: es un adaptador que se sitúa delante de un LLM congelado (Qwen3.5-0.8B, Qwen3.5-4B, Qwen3.8-27B o gemma-3-1b-it) y resuelve preguntas estructuradas —por ejemplo, "¿el cliente amenaza con irse?"— sobre el texto de entrada, devolviendo una decisión tipada (booleano, ordinal, categoría) en lugar de texto libre.

La propuesta técnica es la separación entre el motor y el "lector": los bytes del motor son idénticos detrás de cada lector (sha16 `78f96be7c6a06abb`), y solo cambian el puerto lineal que conecta las representaciones del LLM con el espacio de características compartido de 1024 dimensiones y la calibración específica de cada lector. El LLM nunca se ajusta fino y el motor nunca se reentrena para añadir un lector nuevo, lo que permite acoplar modelos de distinto tamaño y familia con un ajuste en forma cerrada del puerto.

Es relevante ahora porque ofrece una vía de reducción de coste en pipelines de LLM: las decisiones rutinarias se resuelven en unos 50 ms con el motor local y solo los casos restantes se envían al LLM original. El repositorio ocupa 1,6 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de decisión sobre espacio de características compartido de 1024 dimensiones; puerto lineal por lector hacia un LLM congelado |
| Parametros totales | 14,3 M (motor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 73.728 tokens en los registros de entrenamiento; evaluación de contexto largo hasta 70k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,6 GB con motor, puerto, estadísticas de extracción y configuración con calibración por lector) |

## Arquitectura y entrenamiento

El sistema se compone de un motor de decisión de 14,3 M de parámetros que opera en un espacio de características compartido de 1024 dimensiones. Cada LLM lector se conecta a ese espacio mediante un puerto lineal pequeño; el motor es byte-idéntico para todos los lectores y solo varían el puerto y la calibración. Añadir un lector nuevo consiste en un ajuste del puerto en forma cerrada, un refinamiento corto contra el motor congelado y un reajuste de la calibración, sin tocar los pesos del LLM ni del motor.

El entrenamiento conjunto se realizó sobre Qwen3.5-0.8B y Gemma 3 1B con 708.657 ítems emparejados por identificador (`uid-matched`), registros de hasta 73.728 tokens y una pérdida de invariancia entre lectores. Los lectores Qwen3.5-4B y Qwen3.8-27B se acoplaron en frío (`attached cold`) después del entrenamiento. La calibración no se transfiere entre lectores: cada directorio del repositorio incluye la suya, ajustada sobre una partición de calibración reservada. El repositorio incluye además el directorio `universal/` con los objetivos del espacio compartido y los puertos que usa la herramienta `attach_backbone.py` para incorporar el siguiente lector.

## Capacidades

- Clasificación y decisión tipada sobre texto: preguntas booleanas, ordinales y categóricas definidas mediante un esquema (`type` e `instructions`).
- Decisión con umbral de confianza y calibración por lector, con métricas de ECE y AURC publicadas.
- Procesamiento de contexto largo, con evaluación específica hasta 70k tokens.
- Acoplamiento a LLM congelados de distintas familias y tamaños (Qwen3.5-0.8B, Qwen3.5-4B, Qwen3.8-27B, gemma-3-1b-it) sin reentrenar el motor.
- Integración como proxy compatible con los SDK de OpenAI y Anthropic (`base_url` y cabecera `x-vega-key`), con derivación de decisiones rutinarias al motor local y reenvío del resto al LLM.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso por sí mismo.

## Casos de uso

- Predicción de abandono de clientes: el modelo evalúa si un mensaje de soporte contiene una amenaza de cancelación (`{"churn": {"type": "boolean", ...}}`) y permite enrutar solo los casos positivos a un agente humano o a un LLM mayor.
- Triaje de tickets de atención al cliente: clasificación de intenciones (CLINC150 alcanza 0,948 con el lector de 27B) para dirigir cada conversación al equipo adecuado sin invocar un LLM generativo en cada mensaje.
- Moderación y detección de abuso: la tarea de jailbreak obtiene 0,988 con el lector de 27B, adecuada para filtrar entradas antes de que lleguen al modelo principal.
- Detección de phishing y spam: tareas de percepción saturadas en torno a 0,99 en todos los lectores, útiles como primera barrera de bajo coste en correo o mensajería.
- Reducción de coste de LLM en producción: despliegue como proxy delante de OpenAI o Anthropic para que las decisiones rutinarias se resuelvan en unos 50 ms y solo las difíciles se reenvíen al proveedor.
- Análisis de documentos largos con preguntas estructuradas: con contexto de hasta 70k tokens y 0,941 de precisión en contexto largo con el lector de 27B, permite extraer decisiones de contratos o informes extensos.
- Inferencia de sentimiento o valoración ordinal: el tipo `score` permite respuestas graduadas, aunque su precisión se sitúa cerca de 0,61 en todos los lectores.

## Benchmarks y rendimiento

Resultados publicados por el autor (ejecuciones de octubre de 2026):

| Lector | Modo | Precisión held-out | Precisión zero-shot | ECE | AURC | Precisión a 50% de cobertura |
|---|---|---|---|---|---|---|
| Qwen3.8-27B | acoplado en frío | 0,811 | 0,629 | 0,021 | 0,053 | 0,976 |
| Qwen3.5-4B | acoplado en frío | 0,791 | 0,568 | 0,017 | 0,063 | 0,965 |
| Qwen3.5-0.8B | entrenado conjuntamente | 0,765 | 0,534 | 0,010 | 0,073 | 0,956 |
| gemma-3-1b-it | entrenado conjuntamente | 0,738 | 0,504 | 0,007 | 0,093 | 0,927 |

Desglose por benchmark con el lector de 27B (entre paréntesis, el de 0.8B): contexto largo hasta 70k tokens 0,941 (0,831); contexto corto difícil 0,972 (0,875); ARC 0,922 (0,647); MNLI 0,919 (0,836); CommonsenseQA 0,792 (0,490); CLINC150 0,948; jailbreak 0,988. Las tareas de percepción saturadas (phishing, spam, intenciones, en torno a 0,99) se mantienen planas entre lectores. La partición held-out del lector de 27B está limitada a 400 registros por fuente (n=21.008); los lectores menores se evalúan sobre la partición completa (n=50.676).

## Requisitos de hardware

- El motor de 14,3 M de parámetros es de tamaño muy reducido; el repositorio completo ocupa 1,6 GB, pero el coste de memoria dominante es el del LLM lector, no el del motor.
- Lector Qwen3.5-0.8B: apto para GPU de consumo con pocos GB de VRAM; no se publica la VRAM exacta.
- Lector Qwen3.5-4B: requiere una GPU de consumo de gama alta o una GPU de centro de datos; no se publica la VRAM exacta.
- Lector Qwen3.8-27B: requiere GPU de centro de datos (A100, H100 o equivalentes); no se publica la VRAM exacta.
- Lector gemma-3-1b-it: accesible con GPU de consumo; el modelo Gemma está sujeto a acceso restringido y requiere `HF_TOKEN` y aceptación de licencia.
- Despliegue mediante el paquete `vegaml>=0.11.0` (`vegaml.load()`, `vegaml.load("4b")`, `vegaml.load(backbone=...)`); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia publicada para las decisiones rutinarias del proxy: aproximadamente 50 ms. No se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. vega-U no es un LLM generativo, sino un motor de decisión acoplado a un LLM congelado, por lo que la comparación natural sería con clasificadores específicos por tarea o con el propio LLM lector resolviendo la decisión mediante prompting; el autor no publica esa comparación en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vega-U | 14,3 M (motor) | hasta 73.728 tokens en entrenamiento | Apache 2.0 | Hugging Face y `vegaml` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no hace tool calling ni razonamiento multi-paso; solo responde a preguntas tipadas definidas en un esquema.
- El tipo de pregunta ordinal `score` se queda cerca de 0,61 de precisión en todos los lectores; el autor atribuye ese techo al motor o a las etiquetas, no al lector.
- La calibración no se transfiere entre lectores: usar un puerto o una calibración de otro lector invalida las garantías de ECE y AURC publicadas.
- Los resultados del lector de 27B se calculan sobre una partición held-out limitada a 400 registros por fuente (n=21.008), distinta de la partición completa usada para los lectores menores (n=50.676), lo que limita la comparación directa entre filas.
- No se publican idiomas soportados ni sesgos conocidos; la evaluación se centra en benchmarks en inglés (ARC, MNLI, CommonsenseQA, CLINC150).
- El repositorio incluye promoción de un servicio comercial ("vega Proxy", `platform.embedding.in`) con 10.000 decisiones mensuales gratuitas; conviene separar esa oferta del modelo Apache 2.0.
- El lector Gemma 3 está sujeto a acceso restringido y a su propia licencia, independiente de la Apache 2.0 del repositorio.
- No se documentan tipos de cuantización ni formato de pesos, lo que dificulta planificar el despliegue fuera del paquete `vegaml`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nandakishorm/vega-U
- Plataforma del proxy: https://platform.embedding.in
- Documentación: https://platform.embedding.in/docs
- Sitio del proyecto: https://embedding.in
