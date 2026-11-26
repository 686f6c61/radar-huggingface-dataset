# fabriciocarraro/LFM3-1.7B-BR

## Resumen

LFM3-1.7B-BR es un ajuste fino (post-entrenamiento) del modelo LiquidAI/LFM3-1.7B, desarrollado por Fabrício Carraro como proyecto comunitario independiente y no como lanzamiento oficial de Liquid AI. Su objetivo es adaptar un modelo de 1.700 millones de parametros, disenado para despliegue en el borde (edge), al portugues de Brasil, mejorando el seguimiento de instrucciones, las tareas sobre contexto proporcionado y el uso de herramientas (tool calling) tanto en modo con razonamiento (thinking) como sin el.

El modelo parte de la arquitectura LFM3 de Liquid AI, una familia de transformers compactos orientados a inferencia eficiente en dispositivos con recursos limitados. Con 1.728.801.536 parametros reales y un repositorio de 3,5 GB en safetensors, el ajuste se centra en corregir problemas concretos del modelo base en portugues: la emision espuria de la etiqueta de cierre de razonamiento en respuestas sin thinking, el envolvimiento de respuestas JSON en llamadas a herramientas inventadas y un rendimiento deficiente en tareas de inferencia textual en portugues.

Su relevancia actual radica en que cubre un nicho poco atendido: modelos pequenos, desplegables en el borde, con capacidades agenticas y buen comportamiento en portugues de Brasil. El autor reporta mejoras sustanciales frente al modelo base en seguridad agentica, salida estructurada, inferencia textual (ASSIN 2) y cultura brasilena, manteniendo el rendimiento en modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (familia Liquid AI, orientada a edge) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugues de Brasil), en |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint LiquidAI/LFM3-1.7B, un transformer de la familia LFM3 de Liquid AI pensado para despliegue en el borde. El post-entrenamiento se orienta a tres ejes declarados por el autor: agentes con herramientas, tareas sobre contexto proporcionado y seguimiento de instrucciones, en modos con y sin razonamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion principal no reside en la arquitectura sino en la correccion de comportamientos defectuosos del modelo base en portugues. Segun el autor, el modelo base, en prompts multi-turno o few-shot sin thinking, escribia con frecuencia la etiqueta `` en medio de la respuesta (por ejemplo, `NãoNão`), incluso con la configuracion recomendada por Liquid. Ademas, envolvia algunas respuestas JSON en llamadas a herramientas inventadas. El ajuste corrige ambos problemas, y el autor documenta mejoras medidas: Structured Output de 86,8 a 95,8 y ASSIN 2 de 1,3 a 91,3 (el 1,3 era casi todo formato; sin la etiqueta, el modelo base puntua 87,3). Tambien reporta mejoras en IFEval en ingles (+12,5) e IFBench (+5,9) sin thinking, y en BRoverbs (+17,7 con thinking y +18,2 sin thinking).

## Capacidades

- Generacion de texto conversacional en portugues de Brasil e ingles.
- Razonamiento en dos modos: con thinking (modo por defecto) y sin thinking.
- Tool calling / function calling, con correccion del problema de llamadas inventadas del modelo base.
- Salida estructurada (JSON) con alta fiabilidad segun el autor (Structured Output 98,6 con thinking).
- Tareas sobre contexto proporcionado y seguimiento de instrucciones multi-turno.
- Capacidades agenticas con puntuacion destacada en seguridad agentica (Lumen PT 98,1 con thinking, 98,8 sin thinking), con rechazos explicitos en lugar de inaccion.
- Conocimiento de cultura brasilena (BRoverbs) y tareas academicas en portugues (ENEM 2026).
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en portugues de Brasil: el modelo gestiona conversaciones multi-turno con seguimiento de instrucciones y rechazos explicitos ante peticiones inadecuadas, gracias a su alta puntuacion en CAPITU conversations (98,0 con thinking).
- Agentes con herramientas en produccion: su correccion del tool calling y de la salida estructurada (98,6) lo hace adecuado para pipelines donde el modelo debe emitir JSON valido y llamadas a funciones sin inventarlas.
- Despliegue en el borde y dispositivos con recursos limitados: con 1.700 millones de parametros y pesos safetensors de 3,5 GB, encaja en escenarios de inferencia local donde un modelo mayor no es viable.
- Procesamiento de documentos y tareas sobre contexto proporcionado: extraccion y transformacion de informacion a partir de texto entregado en el prompt, en portugues.
- Asistentes educativos para el contexto brasileno: su rendimiento en ENEM 2026 (85,6) y en cultura brasilena (BRoverbs 58,5) lo orienta a tutorizacion y respuesta a preguntas academicas en portugues.
- Clasificacion e inferencia textual en portugues: con ASSIN 2 RTE en 91,3, puede emplearse en tareas de entailment y comparacion semantica de frases.
- Moderacion y salvaguardas en agentes: su puntuacion en seguridad agentica (Lumen PT) permite integrarlo en flujos donde el modelo debe negarse de forma explicita ante acciones no permitidas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, en portugues y con thinking (modo por defecto):

| Benchmark | LFM3-1.7B-BR | LFM3-1.7B | Gemma 4 E2B | MiniCPM5-2B | Qwen3.5-2B |
|---|---|---|---|---|---|
| Lumen PT (seguridad agentica) | 98,1 | 76,8 | 96,4 | 75,2 | 92,6 |
| Structured Output | 98,6 | 98,4 | 93,6 | 97,0 | 67,9 |
| CAPITU (instrucciones) | 97,5 | 96,0 | 82,5 | 90,0 | 69,5 |
| CAPITU conversations | 98,0 | 94,0 | 73,0 | 84,0 | 59,0 |
| ASSIN 2 RTE | 91,3 | 87,2 | 91,7 | 92,5 | 87,9 |
| IFBench (items en ingles) | 66,3 | 68,7 | 31,0 | 54,7 | 34,0 |
| MATH-PT | 85,1 | 85,4 | 76,5 | 88,7 | 78,1 |
| Prosa-PT | 41,9 | 45,4 | 47,2 | 32,4 | 34,7 |
| BRoverbs | 58,5 | 40,8 | 70,1 | 46,2 | 49,0 |
| ENEM 2026 | 85,6 | 84,7 | 82,0 | 82,0 | 83,8 |

El autor tambien reporta, sin tabla completa en la informacion disponible, resultados en modo sin thinking: Lumen PT de 98,8 y mejoras de IFEval en ingles de +12,5 e IFBench de +5,9 frente al modelo base. La tabla de resultados sin thinking aparece truncada en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.728.801.536 parametros, los pesos en safetensors ocupan aproximadamente 3,5 GB en precision de almacenamiento, por lo que en cuantizacion de 8 bits o 4 bits el requisito seria sustancialmente menor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; por tamano, un modelo de 1,7 B es candidato a ejecutarse en GPU de consumo, pero no se aportan datos verificados.
- Opciones de despliegue: la model card indica compatibilidad con transformers y con endpoints; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa basada en los benchmarks reportados por el autor (modo con thinking):

| Modelo | Parametros | Contexto | Lumen PT | Structured Output | CAPITU conv. | Licencia |
|---|---|---|---|---|---|---|
| LFM3-1.7B-BR | 1,7 B | no disponible | 98,1 | 98,6 | 98,0 | lfm1.0 |
| LFM3-1.7B (base) | 1,7 B | no disponible | 76,8 | 98,4 | 94,0 | lfm1.0 |
| Gemma 4 E2B | no disponible | no disponible | 96,4 | 93,6 | 73,0 | no disponible |
| MiniCPM5-2B | 2 B (segun nombre) | no disponible | 75,2 | 97,0 | 84,0 | no disponible |
| Qwen3.5-2B | 2 B (segun nombre) | no disponible | 92,6 | 67,9 | 59,0 | no disponible |

Los datos de parametros y contexto de los modelos comparados no se detallan en la informacion proporcionada; solo se dispone de sus puntuaciones en los benchmarks citados.

## Limitaciones y advertencias

- Proyecto comunitario independiente: no es un lanzamiento oficial de Liquid AI, lo que implica menor soporte y garantias de mantenimiento.
- Licencia lfm1.0 (license: other): es necesario revisar los terminos del archivo LICENSE antes de cualquier uso comercial; la model card no aclara las restricciones concretas.
- El modelo base presenta problemas documentados en portugues sin thinking (emision de `` a mitad de respuesta y llamadas a herramientas inventadas); este ajuste los corrige, pero conviene validar el comportamiento en produccion.
- Rendimiento inferior al modelo base en Prosa-PT (41,9 frente a 45,4) y ligeramente inferior en IFBench en ingles (66,3 frente a 68,7) y MATH-PT (85,1 frente a 85,4).
- Idiomas limitados a portugues de Brasil e ingles; no se declara soporte para otras lenguas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, longitud de contexto ni datos de entrenamiento, lo que dificulta una evaluacion completa de riesgos.
- Al ser un modelo de 1,7 B, su capacidad de razonamiento y conocimiento general es acotada en comparacion con modelos mayores, aunque el autor reporta resultados competitivos en tareas especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fabriciocarraro/LFM3-1.7B-BR
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Harness de evaluacion Observatorio Maritaca: https://github.com/maritaca-ai/observatorio-maritaca
