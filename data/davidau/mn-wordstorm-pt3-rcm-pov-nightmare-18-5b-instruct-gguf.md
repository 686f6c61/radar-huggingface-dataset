# DavidAU/MN-WORDSTORM-pt3-RCM-POV-Nightmare-18.5B-Instruct-GGUF

## Resumen

MN-WORDSTORM-pt3-RCM-POV-Nightmare-18.5B-Instruct es un modelo de lenguaje de 18.518.522.880 parámetros (aproximadamente 18,5B) especializado en escritura creativa, narrativa de ficción y roleplay, publicado por DavidAU en Hugging Face bajo licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local con llama.cpp y derivados. El modelo se construye mediante mergekit como un "super merge" de tres modelos Mistral Nemo de 12B (Rocinante-12B-v1.1, Celeste-V1.9 y Magnum-v2.5-12B-kto), cada uno a su vez fusionado con Mistral-Nemo-Instruct-2407, dando como resultado un modelo de mayor tamaño que el original de 12B.

El objetivo declarado es la generación de ficción de alta intensidad: narrativa de terror, escenas explícitas, roleplay sin censura y continuación de escenas con prosa detallada. El autor lo posiciona como parte de la serie WORDSTORM, con un sesgo marcado hacia acción, horror y cliffhangers, y lo describe como "uncensored" en cuanto a contenido NSFW, violencia y lenguaje soez. Hereda la ventana de contexto de la familia Mistral Nemo, que el autor cifra en 128K+ tokens, y está pensado para ejecutarse con plantillas Alpaca, ChatML o Mistral Instruct.

Es relevante ahora porque representa un patrón habitual en el ecosistema open source: merges comunitarios de modelos base con fines creativos muy específicos, distribuidos en GGUF para consumo local. No es un modelo de propósito general ni compite en benchmarks académicos; su valor está en el comportamiento estilístico para ficción y en la posibilidad de desplegarlo en hardware de consumo. La información técnica disponible es limitada: no hay datos de entrenamiento en tokens, ni resultados de benchmarks propios, ni detalles del proceso de merge más allá de los modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral Nemo), combinado mediante mergekit |
| Parametros totales | 18.518.522.880 (aprox. 18,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K+ tokens (según model card, heredado de Mistral Nemo) |
| Tipos de cuantizacion | GGUF (el repo incluye cuantizaciones GGUF; no se detallan los niveles exactos en la información disponible) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 127,2 GB; también se referencia bfloat16 en los tags) |

## Arquitectura y entrenamiento

El modelo es un merge de tipo "super merge" realizado con mergekit sobre la arquitectura Mistral Nemo, un transformer decoder-only con atención estándar (no se documentan innovaciones como atención lineal o SSM). La construcción parte de tres fusiones intermedias de 18,5B: una combinando MN-Rocinante-12B-v1.1 con Mistral-Nemo-Instruct-2407, otra combinando MN-12B-Celeste-V1.9 con Mistral-Nemo-Instruct-2407, y una tercera combinando MN-Magnum-v2.5-12B-kto con Mistral-Nemo-Instruct-2407. Esas tres fusiones se combinan a su vez para producir el modelo final. El autor no especifica la configuración exacta de mergekit (método, pesos por capa, densidad) ni si hubo un paso adicional de fine-tuning.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron RLHF, DPO o KTO en esta etapa. Los modelos de origen sí incluyen fine-tunes con preferencias (por ejemplo, Magnum-v2.5-12B-kto se entrenó con KTO), pero el merge en sí no añade entrenamiento nuevo. El autor afirma que el resultado es "super estable" y cercano a la perplejidad de Mistral Nemo, aunque no aporta métricas que lo respalden. Tampoco se documentan técnicas de decodificación especulativa ni optimizaciones de inferencia específicas.

## Capacidades

- Generación de texto narrativo y ficción en todos los géneros, con énfasis declarado en terror, acción y escenas intensas.
- Escritura creativa: generación de escenas, continuación de escenas, tramas y subtramas.
- Roleplay multi-turno con personajes, incluyendo pensamientos internos, voz y humor según la model card.
- Prosa detallada ("vivid prosing") y conexión con el mundo narrativo.
- Contenido sin censura: lenguaje soez, violencia gráfica, horror explícito y NSFW, según advierte el autor.
- Seguimiento de instrucciones dentro del contexto creativo (el autor lo destaca como atributo del merge).
- Soporte de plantillas Alpaca, ChatML y Mistral Instruct para formatear las interacciones.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Generación de relatos de terror y horror: el modelo está ajustado explícitamente para escenas de horror gráfico y cliffhangers, por lo que encaja en la producción de narrativa de género con tensión sostenida y giros argumentales.
- Roleplay narrativo con personajes persistentes: gracias a la ventana de 128K+ tokens, puede mantener el estado de una partida o conversación larga con múltiples personajes, recordando rasgos, voz y relaciones establecidas previamente.
- Continuación de escenas en proyectos de escritura: un autor puede pegar un fragmento y pedir continuación coherente con el tono, útil para desbloquear borradores o explorar variantes de una misma escena.
- Generación de tramas y subtramas para novela o guion: el modelo puede proponer arcos argumentales, conflictos secundarios y conexiones entre personajes, aprovechando su sesgo hacia la intensidad dramática.
- Escritura de ficción romántica y ciencia ficción: la model card declara compatibilidad con todos los géneros, incluidos romance y sci-fi, por lo que sirve para borradores en esos registros.
- Prototipado de videojuegos narrativos o aventuras de texto: integrado vía llama.cpp en un motor de diálogo, puede generar respuestas de NPC y descripciones de escena en tiempo de ejecución en hardware local.
- Generación de contenido para campañas de rol de mesa: el modelo puede actuar como director de juego improvisado, describiendo escenarios y reaccionando a las acciones de los jugadores con detalle y ritmo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita posiciones en el UGI Leaderboard de los modelos de origen (Celeste-V1.9 y Magnum-v2.5-12B-kto como número 1 en las categorías UGI y Writing para modelos de 8B–20B, y Mistral-Nemo-Instruct-2407 en el puesto 4 en Writing), pero no aporta métricas propias del merge ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 18,5B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 10–12 GB de VRAM y las de 8 bits en torno a 20 GB, aunque estas cifras no las proporciona el autor y deben verificarse con los archivos concretos del repo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 18,5B cuantizado a 4 bits es candidato a GPUs de consumo con 12–16 GB o más; las versiones sin cuantizar o de alta precisión requieren GPUs de datacenter (A100, H100) o múltiples GPUs.
- Cabe en consumer GPU: probablemente sí en cuantizaciones bajas (4–5 bits) en GPUs con 12 GB o más, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, KoboldCpp) son el destino natural al distribuirse en GGUF. vLLM y TGI no están confirmados para este repo; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MN-WORDSTORM-pt3-RCM-POV-Nightmare-18.5B-Instruct | 18,5B | 128K+ (según autor) | Ficción, horror, roleplay sin censura | Apache 2.0 | GGUF |
| Mistral-Nemo-Instruct-2407 | 12B | 128K | Instrucciones generales | Apache 2.0 | safetensors, GGUF |
| MN-12B-Celeste-V1.9 | 12B | 128K (heredado) | Escritura creativa y roleplay | no disponible en la información | safetensors, GGUF |
| Magnum-v2.5-12B-kto | 12B | 128K (heredado) | Escritura y roleplay, entrenado con KTO | no disponible en la información | safetensors, GGUF |

El modelo de este análisis es el mayor de la comparativa (18,5B frente a 12B de sus antecesores) y el único distribuido exclusivamente en GGUF. No hay datos de rendimiento comparativo publicados para el merge, por lo que la comparación se limita a tamaño, contexto, licencia y orientación de uso.

## Limitaciones y advertencias

- Contenido explícito: el autor advierte de NSFW, violencia gráfica, horror perturbador y lenguaje soez. No es apto para productos dirigidos a menores ni para entornos sin moderación.
- Sesgo de género narrativo: el modelo está inclinado hacia acción y horror, lo que puede producir respuestas excesivamente intensas o dramáticas en contextos que requieran tono neutro.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres y detalles; en ficción esto es tolerable, pero no debe usarse como fuente factual.
- Idioma: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas sobre material explícito; la responsabilidad recae en el desplegador.
- Estabilidad y reproducibilidad: el autor afirma que el merge es estable, pero no hay evaluaciones independientes ni métricas publicadas que lo confirmen.
- Formato: al distribuirse en GGUF, las herramientas de inferencia de alto rendimiento para servidores (vLLM, TGI) no están confirmadas; el despliegue en producción a gran escala requeriría validación adicional.
- Mantenimiento: es un modelo comunitario de un autor individual, sin garantías de soporte ni actualizaciones más allá de las que el autor publique.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/MN-WORDSTORM-pt3-RCM-POV-Nightmare-18.5B-Instruct-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte del autor: https://huggingface.co/DavidAU/support
- UGI Leaderboard: https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard
- Mistral-Nemo-Instruct-2407 (modelo base): https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- MN-12B-Celeste-V1.9: https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9
- Magnum-v2.5-12B-kto: https://huggingface.co/anthracite-org/magnum-v2.5-12b-kto
- Rocinante-12B-v1.1: https://huggingface.co/TheDrummer/Rocinante-12B-v1.1
