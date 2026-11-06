# Husky110/Lunar-Huntress-0.2

## Resumen

Lunar Huntress 0.2 es un modelo de generación de texto orientado a roleplay y escritura creativa, publicado por el usuario Husky110 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un *merge* (fusión de pesos) creado con Mergekit mediante el método TIES, que combina tres modelos de 31B parámetros derivados de Gemma 4: ReadyArt/gemma-4-31B-it-scotoma-2 (como modelo portador), zerofata/G4-MeroMero-31B (caracterización de personajes) y TheDrummer/Artemis-31B-v1.1 (calidad de prosa). El resultado es un modelo de 31.273.088.876 parámetros, distribuido en safetensors y con licencia Apache 2.0.

La propuesta del autor es reconstruir conceptualmente la receta de Mero-Artemis (de sophosympatheia), pero usando scotoma-2 como base en lugar del Gemma 4 instruct original, con el objetivo de reducir los errores de selección de tokens y el "slop" (texto repetitivo y de baja calidad) típico de los modelos Gemma. La versión 0.2 corrige problemas detectados en la 0.1 (palabras fusionadas y bucles de razonamiento) mediante una fusión por capas segmentada: scotoma-2 domina la lectura del prompt y el procesamiento, MeroMero contribuye al procesamiento intermedio y la voz, y Artemis solo participa en las capas finales de voz.

Es relevante para la comunidad de roleplay local porque aborda un problema práctico conocido: los merges agresivos de modelos roleplay suelen degradar la coherencia del razonamiento, y aquí se resuelve excluyendo deliberadamente a Artemis de las capas donde generaba bucles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer), merge TIES de tres modelos |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, 62,6 GB, probablemente BF16/FP16) |
| Idiomas soportados | No disponible (el modelo base es Gemma 4, orientado principalmente a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lunar Huntress 0.2 no tiene entrenamiento propio: es un merge de pesos realizado con Mergekit mediante el método TIES (*Task Vector merge*), que resuelve conflictos entre modelos combinando los signos de las diferencias respecto a un modelo base. El modelo portador (*carrier*) es scotoma-2, que aporta el tokenizador, la plantilla de chat, el formato de thinking y su entrenamiento anti-slop. Como base de deltas se usa Gemma 4 31B it, el ancestro común de los tres modelos fusionados.

La innovación destacable de la versión 0.2 es la fusión por rangos de capas con funciones específicas:

- Capas 0-11 (lectura del prompt): gestionadas exclusivamente por scotoma-2.
- Capas 12-50 (procesamiento y "thinking"): scotoma-2 con contribución de MeroMero; Artemis se excluye deliberadamente porque en la versión 0.1 causaba bucles de razonamiento que consumían todo el presupuesto de tokens sin producir salida.
- Capas 51-59 (voz): scotoma-2 mantiene el dominio para conservar el anti-slop, con aportaciones de MeroMero y Artemis a la voz narrativa.

El autor eligió Artemis 1.1 en lugar de 1.2 basándose en datos de Caliperbench que indican menos errores y mayor coherencia en la versión 1.1. No hay datos sobre tokens de entrenamiento, composición de datasets ni RLHF/DPO propios del merge.

## Capacidades

- Generacion de texto conversacional orientada a roleplay con personajes que mantienen su propia coherencia y limites (rasgo heredado de MeroMero).
- Escritura creativa con prosa de calidad (aportacion de Artemis 1.1).
- Reduccion de errores de tokenizacion y de patrones repetitivos ("slop") tipicos de Gemma 4, gracias al entrenamiento anti-slop de scotoma-2.
- Formato de thinking / razonamiento heredado del modelo portador scotoma-2.
- Pipeline de image-text-to-text segun los tags de Hugging Face, heredado de la familia Gemma 4 (no verificado en la model card).
- No hay informacion sobre soporte de tool calling, function calling ni capacidades agenticas.

## Casos de uso

- Roleplay interactivo multi-turno: el modelo esta disenado especificamente para sesiones de rol con personajes consistentes que no ceden de forma inmediata en sus limites, ideal para frontends como SillyTavern o LettuceAI.
- Escritura creativa de ficcion: la voz narrativa de Artemis lo hace adecuado para generar prosa de novelas, relatos y escenas con estilo literario.
- Companeros conversacionales (companion): los tags "companion" y "roleplay" indican uso para chatbots de compania con personalidad persistente.
- Contenido para adultos (NSFW): el modelo esta etiquetado explicitamente para contenido adulto, con el tag "not-for-all-audiences"; es uno de sus casos de uso previstos por el autor.
- Iteracion y experimentacion con merges: al publicar la receta detallada por capas, sirve como referencia para desarrolladores que exploran tecnicas de fusion selectiva con Mergekit.
- Prueba de conceptos anti-slop: util para evaluar si la seleccion de tokens de scotoma-2 sobrevive a un merge con otros modelos roleplay.
- No es adecuado para tareas de codigo, matematicas, agentes ni atencion al cliente: no hay evidencia de que el merge preserve esas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor realiza evaluaciones manuales cualitativas (pruebas con samplers y escenarios fijos en LettuceAI) y cita Caliperbench para justificar la eleccion de Artemis 1.1 frente a 1.2, pero no aporta metricas cuantitativas del modelo fusionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: alrededor de 62-63 GB (tamano del repo: 62,6 GB), lo que requiere al menos una GPU de 80 GB (A100/H100) o dos GPUs de 48 GB (A6000, L40S).
- Con cuantizacion Q4_K_M (GGUF, si se publica): aproximadamente 18-20 GB, cabe en una RTX 3090 o RTX 4090 de 24 GB. El propio autor realizo pruebas con versiones i1_Q4_K_M y Q4_K_M de los ingredientes.
- Con cuantizacion Q8 o similar: unos 32-35 GB, requiere GPUs de 48 GB o offload parcial a CPU/RAM.
- Opciones de despliegue: transformers (libreria nativa del repo); al ser un merge de Gemma 4, deberia ser compatible con llama.cpp, Ollama, vLLM y TGI, aunque no hay conversiones GGUF publicadas en el repo segun la informacion disponible.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Enfoque |
|---|---|---|---|---|
| Lunar Huntress 0.2 | 31,3B | Merge TIES (scotoma-2 + MeroMero + Artemis 1.1) | Apache 2.0 | Roleplay, anti-slop, thinking |
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31B | Ajuste de Gemma 4 | No disponible | Anti-slop, carrier |
| TheDrummer/Artemis-31B-v1.1 | 31B | Ajuste de Gemma 4 | No disponible | Prosa y escritura creativa |
| sophosympatheia/Mero-Artemis-31B-v0.3.1 | 31B | Merge sobre gemma-4-it | No disponible | Roleplay (receta original) |

Lunar Huntress se diferencia de Mero-Artemis en el modelo portador (scotoma-2 frente a Gemma 4 it) y en la segmentacion por capas, que segun el autor corrige los errores de seleccion de tokens y los bucles de razonamiento de la receta original.

## Limitaciones y advertencias

- Modelo etiquetado "not-for-all-audiences": esta orientado a contenido adulto (NSFW) y no es apropiado para entornos profesionales, educativos o de atencion al cliente.
- Es un merge experimental (version 0.2): la version 0.1 presentaba fallos graves (palabras fusionadas, bucles de razonamiento); aunque el autor afirma haberlos corregido, la estabilidad no esta validada por terceros.
- Riesgo de alucinacion tipico de modelos roleplay: no hay benchmarks que cuantifiquen su fiabilidad factual.
- Idiomas no documentados; el ecosistema Gemma 4 roleplay esta centrado en ingles, por lo que el rendimiento en castellano es incierto.
- Al ser un merge, hereda las licencias y sesgos de los tres modelos base; scotoma-2 y MeroMero pueden tener restricciones o sesgos propios no documentados en esta ficha.
- Descargas muy bajas (128) y solo 2 likes: comunidad de usuarios reducida y poco soporte.
- No hay datos de tool calling ni uso agentico: no lo emplees en pipelines que requieran esas funciones sin validacion previa.
- La longitud de contexto no esta documentada en la model card; verifica la configuracion del modelo base antes de desplegar.

## Enlaces

- Modelo: https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Modelo portador (scotoma-2): https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Ingrediente MeroMero: https://huggingface.co/zerofata/G4-MeroMero-31B
- Ingrediente Artemis: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Receta original de referencia: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Comparativa Caliperbench citada por el autor: https://caliperbench.com/compare?m=artemis-31b-v1q-thinking%2Cartemis-31b-v1m-thinking
- Frontend mencionado por el autor: https://www.lettuceai.app/
