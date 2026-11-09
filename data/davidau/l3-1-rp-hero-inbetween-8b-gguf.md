# DavidAU/L3.1-RP-Hero-InBetween-8B-GGUF

## Resumen

L3.1-RP-Hero-InBetween-8B es un modelo de lenguaje de 8.030.302.272 parámetros (~8B) derivado de Llama 3.1 y especializado en escritura creativa, narrativa de ficción y roleplay. Lo desarrolla DavidAU, un creador independiente de la comunidad de Hugging Face conocido por sus merges orientados a escritura y rol. El modelo se distribuye en formato GGUF (cuantizado) y está pensado para su uso en aplicaciones de rol como SillyTavern, así como para generación de prosa, tramas y escenas de ficción en cualquier género.

La propuesta del autor es un modelo "comprimido" con perplejidad declarada inferior a Meta Llama 3.1 Instruct, con contexto máximo de 128k tokens (131.000) y un sesgo declarado hacia la generación sin censura (NSFW, violencia, horror gráfico, lenguaje soez). Forma parte de una familia de tres variantes —"InBetween", "Big Talker" y "Dirty Harry"— que se diferencian en la longitud media de salida y el grado de censura. "InBetween" es la variante intermedia: salidas de longitud media y un nivel de contenido explícito ligeramente menor que las otras dos.

Es relevante ahora porque cubre un nicho concreto —roleplay y ficción sin filtros sobre una base Llama 3.1 con contexto largo— y porque su empaquetado en GGUF permite ejecutarlo en hardware de consumo. No obstante, se trata de un merge comunitario sin paper ni benchmarks publicados, por lo que su evaluación debe basarse en pruebas propias y no en métricas estandarizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1), fusionado con mergekit |
| Parámetros totales | 8.030.302.272 (~8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens (131.000) según el autor |
| Tipos de cuantización | GGUF en múltiples niveles (se mencionan Q4KM, Q4KS, Q5, Q6, Q8, IQ4XS); repo de 69,7 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); precisión de referencia bfloat16 |

## Arquitectura y entrenamiento

El modelo es un merge de modelos de roleplay de alta valoración sobre base Llama 3.1, construido con mergekit. No se trata de un entrenamiento desde cero ni de un fine-tuning documentado con dataset propio: la model card no especifica número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. La información disponible se limita a la naturaleza del merge (fusión de modelos de rol) y a las afirmaciones del autor sobre perplejidad baja y buena estabilidad.

Como innovaciones técnicas destacables, la model card menciona un comportamiento "relativamente a prueba de balas" que opera con temperaturas de 0 a 5, un nivel de perplejidad declarado inferior al de Meta Llama 3.1 Instruct, y un diseño de "regen" que hace que las regeneraciones no se desvíen demasiado de la generación anterior. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas. Requiere plantilla de Llama 3 y/o plantilla "Command-R".

## Capacidades

- Generación de texto creativo: prosa vívida, ficción, narrativa y descripción detallada de escenas.
- Roleplay multi-turno: diseñado principalmente para interpretación de personajes en aplicaciones como SillyTavern.
- Generación de tramas y subtramas: creación de argumentos, escenas y continuaciones de historia.
- Cobertura de géneros: ciencia ficción, romance, terror, horror gráfico y otros géneros, controlables mediante indicaciones en el prompt (por ejemplo, "(vivid horror)").
- Seguimiento de instrucciones superior a la media según el autor, con salidas de longitud media por defecto salvo que se especifique el tamaño.
- Contenido sin censura: NSFW, violencia, gore y lenguaje soez, con variantes de mayor o menor grado de censura dentro de la familia.
- Control de estilo mediante parámetros de muestreo: la temperatura (0-5) y la penalización por repetición (1,02+ recomendado en rol; 1,05+ para evitar repeticiones) alteran drásticamente el estilo y la creatividad.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Roleplay conversacional en local: integración en SillyTavern u otros frontends de rol, usando plantilla Llama 3 o Command-R, con contexto largo de hasta 128k tokens para mantener la coherencia de una partida extensa.
- Escritura de ficción asistida: generación de escenas y capítulos con prosa detallada, ajustando temperatura y penalización por repetición para variar el registro (desde narrativa contenida hasta horror gráfico).
- Generación de tramas y subtramas: ideación de argumentos y continuaciones de historia para autores que necesitan borradores rápidos, aprovechando la instrucción de longitud de salida.
- Prototipado de videojuegos narrativos: generación de diálogos y descripciones de personajes no jugadores (NPC) en motores de rol o aventuras conversacionales, ejecutando el GGUF en hardware de consumo.
- Creación de contenido de terror o género explícito: uso controlado mediante indicaciones de estilo en el prompt para producir descripciones viscerales, con la advertencia de que el contenido es NSFW.
- Exploración creativa y edición de borradores: flujo de regeneración (1-5 intentos por prompt en chats separados) para seleccionar la mejor salida y reducir la edición manual, tal como recomienda el autor.
- Evaluación comparativa de cuantizaciones: el autor indica que distintas cuantizaciones producen salidas ligeramente diferentes, lo que permite probar Q4KM, Q5, Q6 u Q8 según el hardware y el nivel de detalle deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica cualitativa aportada por el autor es que la perplejidad es inferior a la de Meta Llama 3.1 Instruct, sin cifra concreta ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia (8B, aproximada según cuantización): Q4 ~5-6 GB, Q5 ~6-7 GB, Q6 ~7-8 GB, Q8 ~9-10 GB; bfloat16 ~16 GB.
- GPU recomendadas: para bfloat16, A100 o H100 (o RTX 4090 de 24 GB); para cuantizaciones Q4-Q8, GPU de consumo con 8-16 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, así como en GPUs de 8 GB con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; el repo está etiquetado como "endpoints_compatible".
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| L3.1-RP-Hero-InBetween-8B | ~8B | 128k | Roleplay y ficción sin censura | Apache 2.0 | GGUF en Hugging Face |
| L3.1-RP-Hero-BigTalker-8B | ~8B | 128k (según familia) | Roleplay, salidas más largas, algo menos censurado | Apache 2.0 | GGUF en Hugging Face |
| L3.1-RP-Hero-Dirty_Harry-8B | ~8B | 128k (según familia) | Roleplay, salidas cortas, menos censurado | Apache 2.0 | GGUF en Hugging Face |
| Meta Llama 3.1 8B Instruct | ~8B | 128k | Asistente generalista | Llama 3.1 Community License | Pesos oficiales en Hugging Face |

Las tres variantes de la familia RP-Hero comparten base y licencia, y se diferencian en longitud de salida y grado de censura. Frente a Llama 3.1 8B Instruct, el modelo de DavidAU prioriza prosa y rol sobre el uso generalista, y el autor declara menor perplejidad, aunque no hay benchmarks públicos que lo confirmen.

## Limitaciones y advertencias

- Contenido NSFW y explícito: violencia, gore, horror gráfico y lenguaje soez; no apto para aplicaciones orientadas a público general sin filtrado adicional.
- Sesgo declarado de neutro a negativo, controlable mediante el prompt, pero que puede manifestarse en producciones no deseadas.
- Riesgo de alucinación y de desviación narrativa, especialmente con temperaturas altas (3+) o penalizaciones por repetición bajas; el autor recomienda fijar un límite máximo de tokens.
- Repeticiones al final de la salida si la penalización por repetición es inferior a 1,05; se recomienda 1,02 como mínimo en rol.
- Soporte únicamente en inglés; no se documentan capacidades multilingües.
- Sin benchmarks publicados ni paper: el rendimiento debe validarse con pruebas propias.
- Es un merge comunitario sin garantías de mantenimiento; el autor indica que el código fuente se subirá en un repo separado "en breve", sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del contenido generado puede requerir moderación y cumplimiento normativo según el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-RP-Hero-InBetween-8B-GGUF
- Variante Big Talker: https://huggingface.co/DavidAU/L3.1-RP-Hero-BigTalker-8B-GGUF
- Variante Dirty Harry: https://huggingface.co/DavidAU/L3.1-RP-Hero-Dirty_Harry-8B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
