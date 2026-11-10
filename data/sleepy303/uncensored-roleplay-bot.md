# Sleepy303/uncensored-roleplay-bot

## Resumen

Sleepy303/uncensored-roleplay-bot es un repositorio alojado en Hugging Face que, segun su propia model card, no contiene pesos preentrenados ni un modelo entrenado propiamente dicho. Se presenta como una configuracion de prompts y un protocolo de evaluacion orientado a medir la consistencia de personaje y la memoria a largo plazo en agentes conversacionales de rol sin filtros, con enfasis en escenarios NSFW. El autor lo describe como un andamiaje modular compatible con LoRA, pensado para probar modelos base como LLaMA-3 8B o Mistral 7B.

La relevancia del artefacto es limitada desde el punto de vista de la ingenieria de modelos: no hay pesos, no hay pipeline declarado, no hay idiomas declarados y no se han publicado resultados de benchmarks. El repositorio incluye, segun la model card, un prompt de personaje de ejemplo, dos scripts de evaluacion (`eval_memory_trace.py` y `persona_drift_analyzer.py`) y una configuracion esqueleto de LoRA con rank 16 y alpha 32. En la practica funciona como material de referencia para experimentos de roleplay, no como un modelo desplegable.

Cabe senalar varias incoherencias documentales: la model card indica licencia MIT en el cuerpo pero el campo de licencia del repositorio es `openrail`, y el titulo interno del README es `deep-character-continuity-test-v1`, distinto del identificador del repositorio. Ademas, el contenido promocional de plataformas de terceros presente en la model card debe tratarse con cautela. El repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo; la model card declara compatibilidad con LLaMA-3 8B, Mistral 7B y backends compatibles con GPTQ |
| Parametros totales | No disponible (el repositorio no contiene pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096-8192 tokens, configurable segun backend (dato declarado en la model card) |
| Tipos de cuantizacion | No disponible (se menciona compatibilidad GPTQ sin especificar variantes) |
| Idiomas soportados | No disponible (la model card indica entrada UTF-8 con soporte de entrada multilingue mixta, sin listado de idiomas) |
| Licencia | `openrail` en los metadatos del repositorio; la model card menciona MIT, lo que constituye una discrepancia |
| Formato de pesos | No disponible (no se distribuyen pesos; solo archivos de configuracion y scripts) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. La model card describe una "configuracion de prompts" con estructura hibrida compuesta por un segmento de trasfondo del personaje, un mensaje de sistema con directrices de tono y limites de rol, etiquetas de dialogo para indicar intencion y estado emocional, y dialogo libre. Sobre esa base se propone un ajuste LoRA con rank 16 y alpha 32, aunque el repositorio solo incluye un esqueleto de configuracion (`lora_config.json`) y no adaptadores entrenados.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni procesos de RLHF o DPO. Tampoco se describen innovaciones tecnicas de inferencia como decodificacion especulativa o atencion lineal. Los unicos componentes tecnicos concretos son los scripts de evaluacion y la configuracion de generacion declarada: temperatura 0.8 por defecto y longitud maxima de respuesta de 512 tokens, extensible.

## Capacidades

- Generacion de dialogo de rol multi-turno: la configuracion esta disenada para mantener coherencia de personaje a lo largo de conversaciones largas, segun el protocolo de evaluacion descrito.
- Consistencia de personaje: se proponen metricas como Persona Voice Entropy y Emotional Consistency Score para medir desviaciones del tono esperado.
- Memoria conversacional: se incluye una metrica de Memory Recall Index para ventanas de mas de 50 mensajes.
- Generacion de texto sin filtros: el repositorio esta orientado explicitamente a entornos NSFW y a detectar fallos de filtrado, rechazos forzados o perdida de tono.
- Compatibilidad con LoRA: la configuracion esta pensada para inyectarse sobre modelos base mediante adaptadores o inyeccion directa de prompt.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Evaluacion de estabilidad de personaje en plataformas de roleplay: el protocolo permite medir la deriva de voz del personaje (`persona_drift_analyzer.py`) a lo largo de decenas de turnos, lo que resulta util para comparar backends de modelos en plataformas de chat con personajes persistentes.
- Pruebas de memoria a largo plazo: `eval_memory_trace.py` permite cuantificar la recuperacion de hechos en ventanas de mas de 50 mensajes, un escenario relevante para asistentes conversacionales con historial extenso.
- Comparacion de backends de inferencia: la configuracion esta pensada para ejecutarse sobre distintos motores (LLaMA-3 8B, Mistral 7B, endpoints compatibles con OpenAI) y comparar el comportamiento del mismo prompt entre ellos.
- Deteccion de fallos de filtrado: en entornos de investigacion sobre seguridad, el protocolo permite observar puntos de ruptura de tono, rechazos forzados o incoherencias cuando se somete a un modelo a dialogos sin filtro.
- Prototipado de personajes para productos de entretenimiento conversacional: el archivo `character_prompt.txt` sirve como plantilla para definir trasfondo, limites de rol y etiquetas de dialogo antes de invertir en fine-tuning.
- Preparacion de pipelines de fine-tuning LoRA: el esqueleto `lora_config.json` (rank 16, alpha 32) puede servir como punto de partida para experimentos de transferencia entre modelos filtrados y no filtrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define metricas de evaluacion (Memory Recall Index, Emotional Consistency Score, NSFW Fluency Rating, Response Temperature Drift, Dialogue Compression Rate, Persona Voice Entropy) pero no aporta valores numericos para ninguna de ellas ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio, ya que no contiene pesos. Como referencia, la model card menciona modelos base de 7-8B (LLaMA-3 8B, Mistral 7B), que en cuantizacion de 4 bits requieren del orden de 5-6 GB de VRAM y en FP16 alrededor de 16 GB, aunque estos valores corresponden a los modelos base y no se han verificado en este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Para los modelos base citados serian habituales GPUs consumer de 16-24 GB (RTX 4090, RTX 3090) o GPUs de datacenter (A100, H100) para despliegues con mayor concurrencia.
- Compatibilidad con GPU consumer: no verificada para este repositorio; depende enteramente del modelo base que se elija.
- Opciones de despliegue: la model card menciona un fork local de SillyTavern y un router compatible con la API de OpenAI. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con pesos y no existen en la informacion proporcionada alternativas comparables de la misma categoria (configuraciones de prompt y protocolos de evaluacion para roleplay). Cualquier comparacion con modelos de rol como los fine-tunes de Mistral o LLaMA requeriria datos de rendimiento que no se han publicado.

## Limitaciones y advertencias

- No contiene pesos ni un modelo entrenado: es una configuracion de prompts y scripts de evaluacion. No puede desplegarse como modelo por si mismo.
- Discrepancia de licencia: los metadatos indican `openrail` y la model card menciona MIT. Antes de cualquier uso comercial debe aclararse cual aplica.
- Contenido NSFW explicito: el repositorio esta disenado para generar y evaluar contenido sexual explicito. No es apto para Spaces publicos ni para productos dirigidos a menores, y su uso puede entrar en conflicto con las politicas de las plataformas de despliegue.
- Riesgo de alucinacion: la propia model card incluye una metrica de "Response Temperature Drift" para medir el riesgo de alucinacion en respuestas abiertas, lo que indica que el autor reconoce este riesgo en el escenario de uso.
- Sin datos de sesgo ni evaluaciones de seguridad: no se documentan sesgos conocidos, evaluaciones de toxicidad ni mecanismos de mitigacion.
- Idiomas no declarados: aunque se menciona entrada UTF-8 multilingue, no hay listado de idiomas soportados ni evaluaciones por idioma.
- Contenido promocional de terceros: la model card incluye recomendaciones de plataformas comerciales (CrushOn.AI) que deben tratarse como material promocional, no como validacion tecnica independiente.
- Incoherencia de nomenclatura: el titulo interno (`deep-character-continuity-test-v1`) no coincide con el identificador del repositorio, lo que sugiere que el artefacto puede haber sido reutilizado o renombrado sin revisar la documentacion.
- Cero traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sleepy303/uncensored-roleplay-bot
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
