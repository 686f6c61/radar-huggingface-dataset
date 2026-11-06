# jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming

## Resumen

Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming es un ajuste del modelo base Qwen/Qwen3.5-0.8B (873.438.784 parámetros) desarrollado por el usuario jstarks. No se trata de un fine-tuning convencional: el autor aplica una técnica denominada "Weight-Space Programming" (programación en el espacio de pesos), inspirada en un trabajo del MIT CSAIL, que modifica directamente un subconjunto muy pequeño de los pesos mediante proyecciones de rango 1 y cirugía de subespacios nulos, sin descenso de gradiente ni entrenamiento supervisado. El objetivo es convertir un modelo de 0,8B en un agente móvil que quepa en un iPhone 15 Pro (A17 Pro, 8 GB de RAM) y que enrute correctamente llamadas a herramientas (`exec`, `web_search`, `web_fetch`).

El problema que aborda es concreto: el modelo base, pese a emitir la sintaxis de tool calling, asigna casi toda la probabilidad del token `<function=` a `web_search` en lugar de `exec`, lo que provoca que las tareas de shell local fallen sistemáticamente. El autor localiza este comportamiento en las capas 15, 19, 22 y 23 (columnas de `mlp.down_proj`) y lo corrige con ediciones quirúrgicas que afectan a 557.056 parámetros, es decir, el 0,065% del total del modelo. El resultado declarado es un salto del 28,9% al 84,2% en un agregado de 38 tareas de agente.

La relevancia actual reside en la demostración de que es posible reorientar capacidades de agente en modelos muy pequeños mediante intervención mecanística precisa, sin reentrenar, y desplegarlos en hardware móvil con cuantización de 4 bits (~540 MB). Es un caso de estudio de interpretabilidad aplicada más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); edición en capas MLP `down_proj` de las capas 15, 19, 22 y 23 |
| Parámetros totales | 873.438.784 (0,87B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bfloat16 (1,43 GB); 4-bit (~540 MB) según la model card |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de 852M–873M parámetros según el recuento de safetensors. Sobre esa base no se aplica entrenamiento alguno: el autor ejecuta dos etapas de edición de pesos. La etapa 1 reproduce el experimento `exp8_math` del MIT CSAIL, una edición de supresión de bucles en las capas 15 y 19 mediante una proyección de rango 1 verificada bit a bit sobre 128 columnas de `down_proj` (130.188 entradas bfloat16 modificadas), que elimina bucles de auto-duda del tipo "Wait" / "However". La etapa 2, original del autor, aplica una cirugía de subespacios nulos anclada con proyección ridge de forma cerrada sobre 208 columnas disjuntas de `mlp.down_proj` por capa en las capas 22 y 23 (5,80% de las columnas de esas capas).

En total se modifican 557.056 parámetros repartidos entre las cuatro capas, lo que representa el 0,065% del modelo. No hay datos sobre tokens de entrenamiento, composición del dataset, RLHF ni DPO, porque no existe entrenamiento en el sentido habitual. La innovación técnica es precisamente el método: localizar direcciones en el espacio de activaciones responsables de un comportamiento erróneo (enrutado de herramientas) y proyectar los pesos para anular esas direcciones preservando el resto de capacidades.

## Capacidades

- Enrutado correcto de la herramienta `exec` para scripting POSIX/Bash: 8/8 tareas en la suite del autor, frente a 0/8 del modelo base.
- Búsqueda web y descarga de URL (`web_search` / `web_fetch`) con terminación limpia en un solo turno mediante `<|im_end|>`: 8/8 tareas.
- Cierre de bloques `<think>` dentro de un presupuesto de tokens móvil (512–640 tokens): 38/38 tareas.
- Razonamiento matemático multi-paso bajo restricción de tokens: 3/8 tareas, frente a 0/8 del base.
- Resistencia a la adulación (anti-sycophancy) y refutación de premisas falsas: 7/8 tareas, frente a 1/8 del base.
- Contención de herramientas (tool restraint) en tareas de código y matemáticas autocontenidas: 6/6 tareas.
- Ejecución agéntica de dos turnos con búsqueda real en DuckDuckGo, descarga de URL y comandos de shell locales: 4/4 tareas.
- Soporte de tool calling según el formato nativo de Qwen3.5 (`<tool_call><function=...><parameter=...>`).
- No se documentan capacidades de visión, audio ni multilingüismo, pese a que la etiqueta del repo incluye `image-text-to-text`.

## Casos de uso

- Agente de terminal en dispositivo móvil: el modelo decide cuándo invocar `exec` y genera comandos POSIX/Bash correctos, lo que permite asistentes locales que ejecutan comandos en un entorno restringido del teléfono sin depender de la nube.
- Búsqueda y síntesis web en el dispositivo: con `web_search` y `web_fetch` enrutados correctamente y respuestas de ~37 tokens de media, encaja en flujos de respuesta rápida con latencia baja y consumo mínimo de batería.
- Automatización de tareas de sistema en el iPhone 15 Pro: dada su huella de ~540 MB en 4-bit y 1,43 GB en bfloat16, puede residir en memoria junto al sistema operativo dentro de los 8 GB del A17 Pro.
- Asistente de código con contención de herramientas: al abstenerse de llamar a herramientas en tareas autocontenidas (6/6), evita ejecuciones innecesarias en pipelines de generación de código donde el coste de una llamada errónea es alto.
- Moderación de premisas falsas en soporte técnico: su capacidad anti-sycophancy (7/8) permite construir asistentes que corrijan al usuario en lugar de aceptar instrucciones peligrosas como `rm -rf *` o `chmod 000`.
- Evaluación de interpretabilidad mecanística: sirve como banco de pruebas reproducible para investigar cómo direcciones concretas del espacio de pesos controlan el enrutado de herramientas en modelos pequeños.
- Prototipado de agentes con presupuesto de tokens ajustado: el cierre garantizado de `<think>` en 512–640 tokens lo hace apto para entornos con límites estrictos de generación.

## Benchmarks y rendimiento

Resultados declarados por el autor con decodificación greedy (`do_sample=False`, `enable_thinking=True`) sobre 38 tareas en cinco suites más 4 tareas de ejecución agéntica en vivo:

| Suite | Base Qwen3.5-0.8B | MIT CSAIL etapa 1 | Este modelo (etapa 2) |
|---|---|---|---|
| A: Shell scripting (`exec`), 8 tareas | 0/8 (0,0%), 324,8 tok | 0/8 (0,0%), 252,8 tok | 8/8 (100,0%), 42,5 tok |
| B: Búsqueda web y fetch, 8 tareas | 6/8 (75,0%), 200,0 tok | 7/8 (87,5%), 157,4 tok | 8/8 (100,0%), 37,4 tok |
| C: Matemáticas multi-paso con presupuesto móvil, 8 tareas | 0/8 (0,0%), 0% cierre `</think>` | 0/8 (0,0%), 0% cierre | 3/8 (37,5%), 100% cierre |
| D: Anti-sycophancy, 8 tareas | 1/8 (12,5%) | 1/8 (12,5%) | 7/8 (87,5%) |
| E: Contención de herramientas, 6 tareas | 4/6 (66,7%), 302,8 tok | 4/6 (66,7%), 326,8 tok | 6/6 (100,0%), 187,7 tok |
| Agregado A–E (38 tareas) | 11/38 (28,9%) | 12/38 (31,6%) | 32/38 (84,2%) |
| F: Bucle agéntico en vivo de 2 turnos, 4 tareas | — | — | 4/4 (100,0%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: ~1,43 GB en bfloat16 y ~540 MB en cuantización de 4 bits para los pesos; hay que sumar la caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB libres basta para bfloat16; una RTX 4090 o A100/H100 no son necesarias y estarían sobredimensionadas.
- Compatibilidad con GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en Apple Silicon y en el propio iPhone 15 Pro (A17 Pro, 8 GB) según el autor.
- Opciones de despliegue: transformers (librería declarada); el repo incluye la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles como métricas absolutas; el autor reporta una reducción de 5,3x–7,6x en tokens generados por llamada de herramienta (37,4–42,5 tokens frente a 200,0–324,8 del base).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-iPhone-Agent-WSP (este) | 873M | No disponible | Apache 2.0 | Edición de pesos para agente móvil | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~852M–873M | No disponible | Apache 2.0 | Modelo generalista | Hugging Face |
| MIT CSAIL `exp8_math` (etapa 1) | ~852M | No disponible | No disponible | Supresión de bucles | Referenciado en el blog del MIT CSAIL |

La comparación con modelos de la misma categoría (agentes móviles de menos de 1B) no está disponible en la información proporcionada. Frente al base, la diferencia medible es el agregado de 28,9% a 84,2% en las suites del autor, con el mismo número de parámetros y licencia.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor, con 38 tareas y 4 tareas en vivo; el tamaño muestral es muy reducido y no hay validación independiente.
- El modelo no se ha entrenado: las ediciones de pesos pueden degradar capacidades no evaluadas (conocimiento general, generación libre, multilingüismo) sin que el autor lo documente.
- No hay información sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de agentes móviles.
- Riesgo de alucinación no cuantificado; las suites evalúan enrutado y formato, no veracidad factual general.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con conversaciones largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado en cuanto a sus términos.
- El modelo está especializado en el formato de herramientas Hermes Agent / OpenClaw; fuera de ese esquema de prompting su comportamiento es incierto.
- El rendimiento en matemáticas con presupuesto móvil sigue siendo bajo (37,5%), por lo que no es adecuado para tareas de cálculo fiables.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Qwen3.5-0.8B-iPhone-Agent-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog de Weight-Space Programming (MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- Repositorio de logs referenciado: RikiyaT/lm_understand-logs (no se dispone de URL directa en la información proporcionada)
