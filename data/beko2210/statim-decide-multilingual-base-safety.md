# Beko2210/statim-decide-multilingual-base-safety

## Resumen
Statim Decide Multilingual Base: Safety es un adaptador LoRA de 3.379.200 parámetros publicado por Beko2210 (Belkis Aslani) que especializa el modelo de decisiones Beko2210/statim-decide-multilingual-base 0.7.0 en preguntas tipadas de seguridad: dado un texto en inglés, el sistema responde decisiones (elección, puntuación o sí/no) calibradas en un único forward pass. No es un modelo generativo de lenguaje, sino una pieza de juicio dentro del ecosistema Statim, un motor nativo en C++ para decisiones tipadas que se ejecuta en CPU o GPU sin Python en tiempo de ejecución.

El adaptador se distribuye en dos formatos: una versión f32 que el motor fusiona en el momento de la carga y una versión GGUF q8_0 que se aplica como LoRA de runtime, además de los pesos en safetensors. Requiere Statim 0.8.0 o superior y ha sido verificado con Statim 0.8.3.

Su relevancia es doble. Primero, por el salto declarado en la tarea de seguridad en inglés: de 0.7081 de precisión en el modelo base a 0.8059 con el adaptador (+9,78 puntos, 2 SE = 3,28 puntos) sobre 1350 ítems frescos. Segundo, porque muestra un patrón de despliegue de moderación muy ligero, desacoplado del stack de Python y conmutables por petición mediante el campo `adapter`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre un modelo de decisión tipada; arquitectura del modelo base no disponible |
| Parametros totales | 3.379.200 (parámetros del adaptador; los del modelo base no se especifican) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 (fusionado en carga) y q8_0 (LoRA de runtime, GGUF) |
| Idiomas soportados | en (inglés) declarado en la model card; los datos de entrenamiento incluyen otros idiomas |
| Licencia | statim-weights (other); texto en LICENSE-MODEL.md |
| Formato de pesos | safetensors y GGUF (.lora.gguf) |
| Modelo base | Beko2210/statim-decide-multilingual-base 0.7.0 (relación: adapter) |
| Versión de runtime requerida | Statim 0.8.0 o superior (verificado con 0.8.3); Python SDK 0.8.3 o superior |
| Pipeline declarado | zero-shot-classification |
| Fecha de publicación | 2026-09-29 según metadatos de HuggingFace |

## Arquitectura y entrenamiento
La información disponible describe un adaptador LoRA, no una arquitectura completa. El adaptador se aplica sobre Beko2210/statim-decide-multilingual-base 0.7.0, un modelo de decisión del motor Statim que responde preguntas tipadas (por ejemplo, tipo `noul` con instrucciones) sobre un estado textual. La model card no detalla la arquitectura interna del modelo base (transformer, número de capas, dimensionalidad ni ventana de contexto), por lo que esos datos figuran como no disponibles.

En cuanto a los datos, la model card enumera un conjunto de fuentes de seguridad, moderación y red teaming, entre ellas `3nesdeniz/agentic-prompt-injection-5k` (6200 filas), `Anthropic/hh-rlhf` con `data_dir=red-team-attempts` (6200), `OpenSafetyLab/Salad-Data` (6200), `nvidia/Aegis-AI-Content-Safety-Dataset-1.0` y `2.0` (6200 cada uno), `mteb/toxic_conversations_50k` (6200), `nvidia/CantTalkAboutThis-Topic-Control-Dataset` (1073), `declare-lab/CategoricalHarmfulQA` (550) y `CohereForAI/aya_redteaming` (494 filas en `aya_{eng,fra,spa,rus,arb,hin,srp,tgl}.jsonl`), entre otras. La lista proporcionada está truncada, por lo que la suma parcial de las filas enumeradas es de 71.490 y no representa el total real. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset final ni si hubo RLHF o DPO.

## Capacidades
- Clasificación y decisión zero-shot sobre texto: el modelo responde preguntas de tipo elección, puntuación o sí/no con respuestas calibradas en un único forward pass.
- Decisiones de seguridad en inglés: evaluación de si un texto debe recibir una decisión afirmativa según instrucciones tipadas.
- Conmutación de adaptador por petición: la API de Statim admite `"adapter": "safety"` o `"adapter": "auto"`, lo que permite aplicar o no el adaptador en cada llamada.
- Ejecución en CPU o GPU sin Python en tiempo de ejecución, mediante el motor nativo en C++.
- Integración por HTTP (`/v1/systemone`) y por SDK de Python (`client.decide`).
- No se documentan capacidades de generación de texto libre, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio en la información disponible.
- Idioma: inglés declarado. Aunque el modelo base se denomina "multilingual" y parte de los datos de entrenamiento cubre otros idiomas, la evaluación publicada solo cubre inglés.

## Casos de uso
- Moderación de contenido en inglés como filtro de entrada o salida: se envía el texto al endpoint y se consulta una pregunta de seguridad tipada; el modelo devuelve una decisión binaria calibrada en un solo forward pass, adecuada para prefiltrar antes de un LLM mayor.
- Detección de prompt injection en agentes: el adaptador se entrenó con `agentic-prompt-injection-5k` y `turkish-conversation-prompt-injection`, por lo que puede usarse como comprobación previa de instrucciones recibidas por un agente antes de ejecutarlas.
- Filtrado de spam y de mensajes OTP fraudulentos: con datos de `alusci/sms-otp-spam-dataset`, se puede decidir si un SMS entrante debe clasificarse como sospechoso.
- Moderación de conversaciones y foros: uso sobre textos de `mteb/toxic_conversations_50k` y `allenai/prosocial-dialog` para decidir si un turno de conversación requiere revisión humana.
- Detección de discurso de odio: aplicación sobre textos tipo `Dynamically-Generated-Hate-Speech-Dataset` y `gahd` como primera capa de triaje antes de una revisión manual.
- Revisión de cumplimiento en plataformas: integración en pipelines de revisión de contenido en inglés apoyándose en `nvidia/Aegis-AI-Content-Safety-Dataset` y `OpenSafetyLab/Salad-Data`.
- Servicio de decisiones de bajа latencia en C++: despliegue con `statim serve` en CPU o GPU, sin dependencia de Python en producción, para flujos que requieren muchas decisiones cortas por segundo.
- Ajuste fino posterior por dominio: al ser un adaptador LoRA sobre un modelo base de decisiones, sirve como punto de partida para adaptar la política de seguridad a una política propia de producto.

## Benchmarks y rendimiento
Datos declarados por el autor en el model-index y en la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| text-classification | safety en (n=1350 fresh: draw 1500, skip 150, seed=20260927, z=2.0, alpha=0.05) | accuracy | 0.8059 | no |

Comparación base frente a adaptador en la misma partición de 1350 ítems:

| Idioma | Base | Adaptador | Cambio (puntos) | Veredicto |
|---|---:|---:|---:|---|
| en | 0.7081 | 0.8059 | +9,78 | mejora (2 SE = 3,28) |
| Media | 0.7081 | 0.8059 | +9,78 | — |

Comportamiento según el formato de pesos publicado:

| Pesos | Modo del adaptador | Media base | Media con adaptador | Cambio (puntos) |
|---|---|---:|---:|---:|
| f32 | fusionado en carga | 0.7081 | 0.8059 | +9,78 |
| q8_0 | LoRA de runtime | 0.7081 | 0.8111 | +10,30 |

Notas del autor: la regla de promoción exige que la familia de categorías gane más de 2 errores estándar y que nada regrese; Qwen3-8B se midió solo sobre los ítems del primer muestreo, por lo que no se presenta junto a estos ítems frescos.

## Requisitos de hardware
- El adaptador tiene 3.379.200 parámetros, por lo que su huella en memoria es mínima; el requisito real de VRAM/RAM lo determina el modelo base, cuyo tamaño no se especifica en la información disponible.
- Almacenamiento del adaptador: dos variantes publicadas, f32 y q8_0 (no se indican tamaños en GB; el repositorio figura como 0.0 GB).
- GPU recomendadas: no disponibles. El motor Statim declara ejecución en CPU o GPU, sin modelos concretos de GPU indicados.
- ¿Cabe en GPU de consumo? El adaptador en sí es irrelevante en VRAM, pero no puede afirmarse nada sobre el modelo base con los datos disponibles.
- Opciones de despliegue documentadas: motor Statim (`statim serve`, con `-m` para el modelo base y `--adapter` para el LoRA), endpoint HTTP `/v1/systemone` y Python SDK 0.8.3 o superior. No se documentan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (safety en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| statim-decide-multilingual-base-safety (este adaptador) | 3.379.200 (adaptador) | no disponible | 0.8059 (f32 fusionado) / 0.8111 (q8_0 runtime LoRA) | statim-weights (other) | HuggingFace, GGUF y safetensors |
| statim-decide-multilingual-base 0.7.0 (sin adaptador) | no disponible | no disponible | 0.7081 | no disponible | HuggingFace |
| Qwen3-8B (referencia citada por el autor) | ~8.000 millones | no disponible | medido solo en los ítems del primer muestreo; no comparable con los datos frescos publicados | no disponible | pública |
| statim-decide-en-large | no disponible | no disponible | no disponible | no disponible | HuggingFace (citado en las releases del proyecto) |

## Limitaciones y advertencias
- Cobertura de idioma limitada: solo inglés declarado y evaluado; el resto de idiomas presentes en los datos de entrenamiento no cuentan con métricas publicadas.
- Precisión declarada de 0.8059 implica aproximadamente un 19,4 % de respuestas incorrectas en la partición evaluada, con `verified: false` en el model-index.
- El resultado proviene de una única tarea y un único conjunto de evaluación definido por el propio autor; no hay comparación con benchmarks estándar ni con evaluaciones independientes.
- Riesgo de sesgo heredado de los corpus de entrenamiento, que incluyen datos de red teaming, discurso de odio y contenido dañino (`hh-rlhf` red-team-attempts, `gahd`, `Dynamically-Generated-Hate-Speech-Dataset`, `toxic_conversations_50k`, entre otros).
- Riesgo de falsos positivos y falsos negativos en moderación: el modelo devuelve decisiones, no explicaciones, por lo que conviene mantener revisión humana en decisiones sensibles.
- Dependencia de versión: los adaptadores LoRA requieren Statim 0.8.0 o superior y el SDK de Python 0.8.3 o superior; versiones anteriores no cargarán el adaptador.
- Licencia `statim-weights` (other): en la información disponible no se detallan las condiciones de uso comercial; es obligatorio consultar LICENSE-MODEL.md antes de un despliegue en producción.
- Señales de escasa validación externa: 0 descargas, 0 likes y tamaño de repositorio indicado como 0.0 GB en el momento de la consulta.
- La lista de fuentes de entrenamiento aparece truncada en la documentación disponible, por lo que no puede verificarse el conjunto completo de datos ni sus licencias agregadas.
- No se documentan límites de contexto, coste de latencia ni comportamiento en textos largos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Beko2210/statim-decide-multilingual-base-safety
- Modelo base: https://huggingface.co/Beko2210/statim-decide-multilingual-base
- Licencia del modelo: https://huggingface.co/Beko2210/statim-decide-multilingual-base-safety/blob/main/LICENSE-MODEL.md
- Repositorio del motor Statim: https://github.com/BEKO2210/statim
- Releases de Statim: https://github.com/BEKO2210/statim/releases
- Documentación de adaptadores (ADAPTERS.md): https://github.com/BEKO2210/statim/blob/main/docs/ADAPTERS.md
- Líneas base de evaluación (BASELINES.md): https://github.com/BEKO2210/statim/blob/main/docs/BASELINES.md
- Perfil del autor en HuggingFace: https://huggingface.co/Beko2210
- Sitio del autor: https://beko2210.github.io/
- Perfil de GitHub del autor: https://github.com/BEKO2210/BEKO2210
