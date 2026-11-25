# fintanlabs/Fintan-9B

## Resumen

Fintan-9B es un adaptador LoRA publicado por fintanlabs sobre el modelo base Qwen/Qwen3.5-9B, orientado a aprendizaje continuo y actualización de conocimiento. No se trata de un modelo entrenado desde cero, sino de un sistema de parches incrementales: cada actualización es un adaptador PEFT de rango 512 aplicado sobre 8 capas, de aproximadamente 130 MB (30 MB empaquetado), que añade hechos nuevos sin modificar los pesos originales. Eliminar el adaptador devuelve exactamente el modelo base.

La propuesta diferencial es el concepto de "modelo que no se termina al publicarse": el autor publica actualizaciones de noticias de forma programada y el usuario puede enseñar material propio (documentos, noticias, temas enciclopédicos, código Python o habilidades) en su propia GPU. Un enrutador en código Python puro decide si una consulta va al modelo base o al modelo con el adaptador correspondiente, sin acceso a internet.

Esta versión incluye una única actualización con 172 hechos extraídos de 400 artículos de noticias del 18 al 23 de noviembre de 2026. Según la model card, el adaptador eleva la precisión sobre esas 172 preguntas del 5,8% al 89,5% sin degradar MMLU, GSM8K ni ARC-Challenge. El repositorio ocupa 0,9 GB y la licencia declarada es Apache 2.0, aunque el modelo base conserva su propia licencia y términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B) con adaptadores LoRA/PEFT |
| Parametros totales | 9B (modelo base); adaptador LoRA de rango 512 en 8 capas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes), 8-bit (vLLM en GPUs pequeñas), precision completa |
| Idiomas soportados | en |
| Licencia | apache-2.0 (adaptador); el modelo base mantiene su propia licencia |
| Formato de pesos | safetensors (adapter_model.safetensors, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 512 que afecta únicamente a 8 capas; las 24 capas restantes quedan intactas, lo que provoca el aviso de "missing adapter keys" al cargar con PEFT (el autor indica que puede ignorarse). El adaptador se entrena en precisión completa y puntúa 1,7 puntos menos cuando se aplica sobre el modelo cuantizado a 4 bits.

El entrenamiento de cada actualización sigue un pipeline de destilación de hechos: el modelo lee los hechos del texto fuente, practica múltiples formulaciones y los aprende en un nuevo adaptador. Tras cada ejecución de aprendizaje, el nuevo adaptador se evalúa contra el modelo plano con formulaciones no practicadas y solo se conserva si mejora; en caso contrario, el conocimiento se guarda como notas que se inyectan en las consultas coincidentes. El enrutador (`door/night_router4.py`) es código Python determinista que lee la lista de hechos aprendidos y decide qué adaptador aplicar; no usa internet. La actualización incluida se construyó a partir de 172 hechos extraídos de 400 artículos de noticias.

## Capacidades

- Generación de texto y respuesta a preguntas en inglés, heredadas del modelo base Qwen3.5-9B.
- Actualización de conocimiento factual mediante adaptadores incrementales: incorpora hechos nuevos sin reentrenar el modelo base.
- Aprendizaje en el dispositivo de documentos, texto personal, noticias, temas enciclopédicos, código Python y habilidades, a través de una API HTTP (`/fintan/teach`, `/fintan/learn`, `/fintan/status`).
- Enrutamiento automático entre modelo base y adaptadores según la consulta, implementado en código Python sin dependencias de librerías de modelo.
- Extracción estructurada de código Python (funciones, parámetros, valores por defecto, constantes) mediante el parser nativo de Python.
- Aprendizaje programado: automático tras un número de elementos o una vez al día a una hora configurable.
- Servidor compatible con API estilo OpenAI (`/v1/chat/completions`) mediante vLLM.
- Modo de respuesta directa: requiere `"chat_template_kwargs": {"enable_thinking": false}` porque las actualizaciones se entrenaron para respuestas directas.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Actualización de conocimiento sin reentrenamiento: un equipo puede enseñar al modelo documentación interna reciente mediante `/fintan/teach` y generar un adaptador que responda sobre ella, manteniendo intacto el modelo base y pudiendo revertir eliminando el archivo del adaptador.
- Base de conocimiento de noticias o dominio temporal: el flujo de publicación programada de actualizaciones (como la incluida, con 172 hechos de una semana) encaja en aplicaciones que necesitan conocimiento fechado y verificable, con `facts.json` y `check_questions.json` para auditar cada hecho y su fuente.
- Asistente interno sobre manuales y políticas: el tipo `documents` permite cargar manuales de la empresa; el modelo practica los hechos en múltiples formulaciones y los conserva solo si supera la comprobación contra el modelo plano, lo que reduce el riesgo de degradación.
- Enseñanza de código de un repositorio: el tipo `code` parsea una carpeta de Python con el parser nativo y aprende funciones, parámetros y constantes, útil para asistentes que responden sobre APIs internas concretas.
- Despliegue en hardware de gama media: con cuantización 4-bit cabe en una GPU de 12 GB (9,4 GB de VRAM medida) y en precisión completa en una de 24 GB (18,6 GB), lo que permite ejecutar el sistema completo en estaciones de trabajo convencionales.
- Servicio con API compatible con OpenAI: mediante `scripts/serve_vllm.sh` se expone en `http://127.0.0.1:8900/v1/chat/completions`, integrable en aplicaciones existentes que ya consumen la API de OpenAI, con enrutamiento transparente entre base y adaptadores.
- Aprendizaje de habilidades concretas: el tipo `skills` acepta instrucciones o pares `Request: ... Answer: ...` y entrena la habilidad en un adaptador propio, adecuado para asistentes especializados en tareas repetitivas de un flujo de trabajo.

## Benchmarks y rendimiento

Resultados publicados en la model card (172 preguntas sobre noticias de la semana y pruebas de capacidad general):

| Prueba | Qwen3.5-9B | Fintan-9B |
|---|---|---|
| 172 preguntas de noticias (precisión completa, tal como se sirve) | 5,8% | 89,5% |
| 172 preguntas, precisión completa, solo con actualización | 9,3% | 91,3% |
| 172 preguntas, 4-bit, solo con actualización | 9,9% | 89,5% |
| 172 preguntas, 4-bit, tal como se sirve | no disponible | 89,0% (88,4% en repetición) |
| MMLU (570 preguntas) | 78,2% | 78,2% |
| GSM8K (120 problemas) | 82,5% | 82,5% |
| ARC-Challenge (600 preguntas) | 93,3% | 93,3% |
| VRAM usada (precisión completa / 4-bit) | no disponible | 18,6 GB / 9,4 GB |

En la prueba con vLLM 0.34.0, el adaptador alcanzó 89,5% en las 172 preguntas a través del front door, y 1 de 300 preguntas ordinarias se enrutó al adaptador por error.

## Requisitos de hardware

- VRAM para inferencia: 18,6 GB en precisión completa; 9,4 GB en 4-bit (medidos con transformers 5.24.0, peft 0.22.0, bitsandbytes 0.50.2).
- GPU recomendadas: una GPU de 24 GB para precisión completa (el autor probó con una tarjeta de 24 GB); una GPU de 12 GB para 4-bit.
- vLLM: en tarjetas de 40 GB o más carga el modelo base en precisión completa; en tarjetas menores carga los pesos en 8-bit y, si no arranca, recurre a `scripts/serve_small.sh` (transformers, 4-bit).
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB con cuantización 4-bit y en tarjetas de 24 GB en precisión completa.
- Opciones de despliegue: transformers + peft + accelerate (+ bitsandbytes para 4-bit), vLLM con API estilo OpenAI, y scripts propios (`run_transformers.py`, `serve_vllm.sh`, `serve_small.sh`).
- Aprendizaje en dispositivo: una tarjeta de 24 GB aprende con el modelo base en 4-bit; con una sola GPU, el servidor se pausa durante el aprendizaje y reanuda al terminar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fintan-9B | 9B + adaptador LoRA (rango 512, 8 capas) | no disponible | Aprendizaje continuo por adaptadores incrementales | apache-2.0 (adaptador) | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | no disponible | Modelo base estático | licencia propia del modelo base | Hugging Face |
| Alternativas de la misma categoría (actualización de conocimiento por LoRA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos comparables de actualización de conocimiento; solo se dispone del modelo base como referencia directa.

## Limitaciones y advertencias

- Idioma: el adaptador y el modelo base declarado solo soportan inglés; no se documenta cobertura multilingüe.
- El adaptador se entrenó en precisión completa y pierde 1,7 puntos sobre el modelo cuantizado a 4-bit; los resultados en 4-bit son inferiores.
- El enrutador puede equivocarse: en la prueba con vLLM, 1 de 300 preguntas ordinarias se envió al adaptador por error. El enrutamiento es código determinista basado en la lista de hechos, no un clasificador semántico.
- Las actualizaciones se entrenaron para respuestas directas; es necesario enviar `enable_thinking: false` en cada petición, lo que limita el uso del modo de razonamiento del modelo base.
- El aviso de "missing adapter keys" de PEFT al cargar es esperado (24 capas sin adaptador) y debe ignorarse, pero puede confundir en pipelines automatizados.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual más allá de las 172 preguntas de comprobación; los hechos aprendidos incluyen sus fuentes en `facts.json`, pero no se garantiza que el modelo cite correctamente.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Licencia: el adaptador es Apache 2.0, pero el modelo base Qwen3.5-9B conserva su propia licencia y términos, que deben revisarse para uso comercial.
- El motor de aprendizaje (`learn/`) es un binario compilado para Python 3.10 a 3.13 en Linux, lo que limita la portabilidad a otras plataformas.
- La actualización incluida cubre solo noticias del 18 al 23 de noviembre de 2026; su utilidad fuera de ese ámbito es nula sin entrenar adaptadores propios.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin validación independiente de los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/fintanlabs/Fintan-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
