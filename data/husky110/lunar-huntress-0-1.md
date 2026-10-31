# Husky110/Lunar-Huntress-0.1

## Resumen

Lunar Huntress 0.1 es un modelo de lenguaje orientado a roleplay y escritura creativa, desarrollado por el usuario Husky110 mediante una fusión (merge) de tres modelos de 31B parámetros basados en Gemma 4. El modelo combina la fidelidad de personaje de G4-MeroMero-31B, la prosa de Artemis-31B v1.1 de TheDrummer y la selección de tokens anti-slop de scotoma-2 de ReadyArt, que actúa como modelo portador (carrier). Conceptualmente es una reconstrucción de la receta Mero-Artemis de sophosympatheia, pero usando scotoma-2 como base en lugar del Gemma 4-it original.

Su objetivo es resolver un problema habitual en los merges de roleplay sobre Gemma: la generación de texto repetitivo y con errores de tokenización (por ejemplo, "I\\ll do that" en lugar de "I'll do that"). Al apoyarse en scotoma-2, cuya distribución de tokens está depurada, el autor busca reducir el "slop" característico de Gemma 4 manteniendo las capacidades narrativas de los ingredientes.

Con 31.273.088.876 parámetros (dato real de safetensors), licencia Apache 2.0 y formato safetensors, el modelo está disponible en HuggingFace con cuantizaciones GGUF estáticas e imatrix creadas por mradermacher. Cabe destacar que el propio autor lo ha marcado como sucedido por Lunar Huntress 0.2 debido a posibles bucles de razonamiento (reasoning loops), por lo que conviene valorar la versión más reciente antes de desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4), merge TIES de tres modelos |
| Parametros totales | 31.273.088.876 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estático y GGUF i1 (imatrix) de terceros; pesos originales en BF16 (no confirmado) |
| Idiomas | no disponible (los modelos base son predominantemente ingleses) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (62,6 GB el repositorio); GGUF disponible vía mradermacher |

## Arquitectura y entrenamiento

Lunar Huntress 0.1 no es un modelo entrenado desde cero, sino un merge realizado con Mergekit mediante el método TIES. La composición documentada por el autor es la siguiente:

| Rol | Modelo | Densidad | Función |
|---|---|---|---|
| Carrier | ReadyArt/gemma-4-31B-it-scotoma-2 | 1.0 | backbone, tokens anti-slop, tokenizador, chat template y formato de thinking |
| Delta base | Gemma 4 31B it | — | ancestro común de todos los ingredientes |
| Ingrediente 1 | zerofata/G4-MeroMero-31B | 0.90 | estructura, fidelidad de detalle, coherencia de personaje |
| Ingrediente 2 | TheDrummer/Artemis-31B v1.1 | no disponible | voz y calidad de prosa |

El ancestro común de los tres ingredientes es Gemma 4 31B instruct, lo que hace viable la fusión de sus deltas. El autor eligió Artemis v1.1 en lugar de v1.2 basándose en datos de Caliperbench que indican menos errores y mayor coherencia en la versión 1.1. No hay datos sobre tokens de entrenamiento, composición de datasets ni etapas de RLHF/DPO propias del merge, ya que hereda el entrenamiento de los modelos base.

## Capacidades

- Generación de texto conversacional orientada a roleplay con personajes que mantienen su propia coherencia y límites de personalidad (rasgo heredado de MeroMero).
- Escritura creativa con prosa de calidad, heredada de Artemis 1.1.
- Reducción del vocabulario repetitivo ("slop") típico de Gemma 4 gracias al carrier scotoma-2.
- Pipeline de image-text-to-text según los tags de HuggingFace, heredado de la familia Gemma 4 (no verificado en el merge).
- Compatible con el formato de thinking y chat template de scotoma-2.
- Orientado a contenido adulto y NSFW según los tags del autor (etiquetado "not-for-all-audiences").
- No hay información sobre tool calling, function calling ni capacidades de agentes.

## Casos de uso

- Roleplay interactivo multi-turno: el modelo está diseñado específicamente para mantener personajes coherentes a lo largo de conversaciones largas, con personalidades que no ceden de forma instantánea, lo que lo hace adecuado para frontends como SillyTavern o LettuceAI.
- Escritura de ficción y narrativa: la prosa de Artemis 1.1 lo hace útil para generar capítulos, escenas y diálogos en proyectos de escritura creativa asistida.
- Compañeros conversacionales (companion bots): su etiqueta "companion" y su perfil narrativo lo orientan a aplicaciones de compañía conversacional para adultos.
- Generación de contenido adulto (NSFW): al ser un merge sin los filtros restrictivos habituales, se usa en entornos donde otros modelos comerciales no operan, siempre dentro del marco legal aplicable.
- Prototipado de merges de roleplay: al documentar densidades y receta, sirve como referencia para desarrolladores que experimentan con Mergekit sobre Gemma 4.
- Evaluación comparativa de estilos de prosa: permite comparar el efecto del carrier scotoma-2 frente al Gemma 4-it original en la receta Mero-Artemis, útil para investigación sobre merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento indirecto es la referencia del autor a Caliperbench para justificar la eleccion de Artemis 1.1 frente a 1.2 (menos errores y mayor coherencia), sin metricas concretas para este merge.

## Requisitos de hardware

- VRAM estimada en pesos originales (31,3B parametros, ~62,6 GB): se recomienda al menos 70 GB de VRAM en BF16, por ejemplo 2x A100 80GB o 2x H100, o bien A100 80GB con offload.
- Con cuantizaciones GGUF (disponibles en mradermacher/Lunar-Huntress-0.1-GGUF y la version i1-imatrix): una version Q4_K_M ocupa aproximadamente 19-20 GB, viable en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado.
- Consumer GPUs: viable en RTX 3090/4090 (24 GB) con cuantos Q4; en GPUs de 16 GB seria necesario Q3 con offload parcial a CPU y perdida de velocidad.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para los pesos safetensors; compatible con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Enfoque |
|---|---|---|---|---|
| Lunar Huntress 0.1 | 31,3B | Gemma 4 (merge TIES) | Apache 2.0 | Roleplay, prosa anti-slop |
| Mero-Artemis 31B v0.3.1 (sophosympatheia) | 31B | Gemma 4 it (merge) | no disponible | Receta original que este modelo reconstruye |
| TheDrummer/Artemis-31B v1.1 | 31B | Gemma 4 | no disponible | Prosa y escritura creativa pura |
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31B | Gemma 4 it | no disponible | Carrier con distribucion de tokens depurada |

Lunar Huntress 0.1 se diferencia de sus ingredientes en que combina deliberadamente tres fortalezas (personaje, prosa y limpieza de tokens) en un solo modelo, mientras que Artemis y scotoma-2 cubren cada una solo parte de ese perfil.

## Limitaciones y advertencias

- El propio autor declara que el modelo ha sido sucedido por Lunar Huntress 0.2 debido a posibles bucles de razonamiento (reasoning loops); se recomienda evaluar la version 0.2 para uso serio.
- Riesgo de alucinacion: no disponible como metrica, pero al ser un merge de modelos de roleplay sin ajuste adicional, debe esperarse un comportamiento tipico de modelos creativos poco fiables para hechos.
- Los tres modelos base estan orientados principalmente al ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Etiquetado "not-for-all-audiences": genera contenido adulto y NSFW, por lo que no es apto para entornos con menores ni para despliegues sin control de edad.
- La longitud de contexto no esta documentada en la model card; habria que confirmarla en la configuracion de los modelos base.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido NSFW puede entrar en conflicto con las politicas de plataformas de despliegue comerciales.
- Al ser un merge sin entrenamiento posterior, no hay garantias de estabilidad en tareas fuera del roleplay y la escritura creativa.

## Enlaces

- Modelo: https://huggingface.co/Husky110/Lunar-Huntress-0.1
- Sucesor (v0.2): https://huggingface.co/Husky110/Lunar-Huntress-0.2
- GGUF estatico (mradermacher): https://huggingface.co/mradermacher/Lunar-Huntress-0.1-GGUF
- GGUF imatrix (mradermacher): https://huggingface.co/mradermacher/Lunar-Huntress-0.1-i1-GGUF
- Carrier (scotoma-2): https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Ingrediente (MeroMero): https://huggingface.co/zerofata/G4-MeroMero-31B
- Ingrediente (Artemis 1.1): https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Receta original de referencia: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Benchmark de referencia citado por el autor: https://caliperbench.com/compare?m=artemis-31b-v1q-thinking%2Cartemis-31b-v1m-thinking
- Frontend recomendado por el autor: https://www.lettuceai.app/
