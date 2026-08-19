# 26B-Suite/Dark-Goetia-26B-A4B-v2

## Resumen

Dark Goetia 26B A4B v2 es un modelo de generacion de texto especializado en roleplay literario con tono oscuro y atmosferico, desarrollado por el colectivo 26B-Suite. Se trata de un modelo fusionado que combina el modelo base Gemma 4 MoE abliterado de Naphula (Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA) con un adaptador LoRA entrenado especificamente para ajustar el estilo narrativo en ambientaciones de Dark Fantasy. El adaptador fue entrenado con QLoRA sobre las proyecciones de atencion (q/k/v/o_proj) de 30 capas del tower de texto, con un dataset sintetico generado a partir de una novela descompuesta en escenas y reescrita por una red neuronal.

El modelo resultante tiene 25.805.933.872 parametros totales (~25,8B) con aproximadamente 4B activos por token, como indica el sufijo A4B en su nombre. El repositorio contiene los pesos fusionados en formato safetensors con un tamano de 51,6 GB, correspondiente a precision bf16/fp16. La licencia es Gemma, heredada del modelo base de Google.

La relevancia de este modelo reside en su especializacion: no es un modelo generalista, sino una herramienta calibrada exclusivamente para roleplay narrativo con estructura de etiquetas XML, optimizada para funcionar con SillyTavern y tarjetas de personaje extensas (mas de 2000 tokens). Incluye soporte parcial para ruso, aunque su rendimiento principal esta en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 MoE (Mixture of Experts) |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | ~4B (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp16) |
| Idiomas soportados | ingles (principal), ruso (parcial) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 MoE con 25,8B parametros totales y aproximadamente 4B activos por token. Sobre esta base, se aplico un adaptador LoRA entrenado con QLoRA, restringido exclusivamente a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) de 30 capas del tower de texto, omitiendo los bloques FFN/MLP. Los hiperparametros del adaptador son r=32, alpha=64, 2 epocas, con funcion de perdida aplicada solo sobre completions, no sobre prompts.

Los datos de entrenamiento consisten en una novela descompuesta en escenas, que fueron reescritas por una red neuronal para convertirlas en un dataset sintetico de roleplay, preservando acciones y pensamientos internos pero eliminando el estilo de prosa original del autor. El dataset contiene muestras en ingles y ruso, con predominio del ingles. El modelo base fue sometido a un proceso de abliteration (eliminacion de los mecanismos de rechazo de contenido), lo que permite generar contenido sin restricciones de seguridad. El adaptador no contiene tramas ni personajes de los datos de entrenamiento, solo ajuste de estilo.

## Capacidades

- Generacion de narrativa literaria con tono oscuro y atmosferico, calibrada especificamente para ambientaciones de Dark Fantasy.
- Adherencia estricta a etiquetas XML y estructura de roleplay multi-turno, con seguimiento casi perfecto de la estructura.
- Compatibilidad con SillyTavern y tarjetas de personaje de mas de 2000 tokens, con el preset recomendado Marinara's Spaghetti Recipe.
- Funcionamiento en ingles (optimo) y ruso (con efecto mas debil y menos pronunciado).
- Capacidad de mantener acciones y pensamientos internos en la narrativa generada.
- No incluye capacidades de tool calling, agentes, vision, audio ni generacion de codigo; es un modelo exclusivamente narrativo.

## Casos de uso

- Roleplay narrativo en SillyTavern: el modelo esta calibrado para funcionar con tarjetas de personaje extensas y el preset Marinara's Spaghetti Recipe, produciendo respuestas con estructura XML y tono literario oscuro en sesiones completas de roleplay.
- Escritura creativa de ficcion oscura: puede generar prosa atmosferica para relatos de Dark Fantasy, manteniendo coherencia narrativa en sesiones largas de multiples turnos.
- Creacion de campanas de rol de mesa: el modelo puede narrar escenas, interpretar PNJs y mantener un tono oscuro consistente a lo largo de partidas extensas, actuando como director de juego automatizado.
- Generacion de dialogos para videojuegos: util para prototipar dialogos y narrativa ambiental en proyectos indie con ambientacion sombria, generando texto con un estilo coherente y distintivo.
- Asistencia en escritura de novelas: puede servir como herramienta de brainstorming narrativo, generando escenas alternativas o expandiendo borradores con un tono consistente y atmosferico.
- Comunidades de roleplay en ruso: aunque el efecto es mas debil, permite generar narrativa oscura en ruso para comunidades de rol en ese idioma, con la misma estructura XML.
- Evaluacion de estilos narrativos: al ser un adaptador de estilo puro (sin tramas ni personajes del dataset), puede usarse para experimentar con diferentes escalas de influencia del LoRA (0.1 a 0.7+) y estudiar como afecta al tono de la narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta orientado a tareas cualitativas de roleplay y narrativa, donde las metricas estandar como MMLU, HumanEval o GSM8K no son representativas de su rendimiento. La evaluacion del autor se basa en pruebas cualitativas con SillyTavern y tarjetas de personaje, sin datos cuantitativos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bf16/fp16 ocupa aproximadamente 51,6 GB, por lo que requiere al menos 52 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU con GPUs consumer (por ejemplo, 2x RTX 4090 de 24GB en paralelo).
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en el repositorio; con cuantizacion externa de 4 bits podria caber en GPUs consumer de 24GB (RTX 4090) o 16GB (RTX 4080), aunque no hay soporte oficial.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten la arquitectura Gemma 4 MoE y el formato safetensors.
- Al ser un modelo MoE con solo ~4B parametros activos, el throughput por token deberia ser significativamente superior al de un modelo denso de 26B, aunque no se han publicado cifras concretas de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos similares de roleplay en la informacion proporcionada. Como referencia arquitectonica y de enfoque:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Dark Goetia 26B A4B v2 | 25,8B totales, ~4B activos | no disponible | Roleplay Dark Fantasy (EN/RU) | Gemma |
| Gemma 4 base (MoE) | 26B totales, ~4B activos | no disponible | Generalista | Gemma |
| Modelos de roleplay basados en Llama 3 (p.ej. MythoMax) | 7B-70B | 8K-128K | Roleplay generalista | Llama |

La diferencia clave es que Dark Goetia esta especializado en un nicho concreto (roleplay oscuro en ingles con estructura XML) y hereda la licencia Gemma, que impone restricciones de uso comercial especificas de Google. No se dispone de datos objetivos que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido 18+: el modelo base fue abliterado y los datos de entrenamiento incluyen contenido adulto y oscuro. No es adecuado para menores ni para entornos profesionales o corporativos.
- Sesgo hacia el ingles: el efecto del adaptador es notablemente mas debil en ruso, y no se ha probado en otros idiomas.
- Interferencia en capas bajas (0-11): el ajuste de las capas sintacticas iniciales impone restricciones estructurales rigidas que pueden reducir la fluidez linguistica natural y la riqueza estilistica del modelo base.
- Falta de adaptacion de los bloques FFN/MLP: al estar congelados, el modelo depende exclusivamente del routing de atencion para transmitir el estilo, lo que puede producir frases repetitivas o vocabulario generico en escenarios complejos de roleplay.
- Sobre-formateo XML: la adherencia a etiquetas XML es casi perfecta, pero la prosa narrativa puede resultar excesivamente "limpia" o sanitizada a escalas altas del LoRA; se recomienda escalas de 0.4 a 0.6.
- Escala recomendada: el autor recomienda escalas de LoRA entre 0.3 y 0.5 para un equilibrio estable, y advierte que escalas superiores a 0.7 pueden dominar al modelo base y degradar la calidad.
- Licencia Gemma: impone restricciones de uso comercial segun los terminos de Google. Verificar la licencia antes de cualquier uso en produccion.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento mas alla de las evaluaciones cualitativas del autor.
- El autor indica explicitamente que el proyecto es un ejercicio de aprendizaje ("hands-on learning experience"), por lo que la calidad y el soporte pueden variar.
- El efecto del adaptador es debil en prompts cortos aislados; funciona mejor en sesiones completas de roleplay con system prompt y tarjeta de personaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v2
- Adaptador LoRA base: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v2
- Modelo base abliterado: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA
- Preset de SillyTavern recomendado: https://github.com/SpicyMarinara/SillyTavern-Settings/blob/main/Marinara%27s%20Essentials/Preset/Marinara%27s%20Spaghetti%20Recipe.json
