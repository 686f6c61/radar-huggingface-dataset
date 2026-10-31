# ReadyArt/Dark-Craving-26B-A4B-v0.3

## Resumen

Dark-Craving-26B-A4B-v0.3 es un modelo de lenguaje afinado por ReadyArt a partir de google/gemma-4-26B-A4B-it, orientado a generación de texto conversacional sin alineación, con foco explícito en roleplay y contenido para adultos (NSFW/ERP). El modelo hereda la arquitectura del Gemma 4 base, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 25.800 millones de parámetros totales, de los cuales solo una fracción se activa por token, lo que reduce significativamente el coste de inferencia frente a un modelo denso de tamaño equivalente.

Su relevancia radica en cubrir un nicho que los modelos comerciales y muchos modelos abiertos evitan deliberadamente: narrativa adulta sin filtros y roleplay de larga duración. Al tratarse de un ajuste sobre un modelo instructo de Google con licencia Apache 2.0, puede desplegarse localmente con las herramientas habituales del ecosistema (safetensors, compatible con vLLM y derivados), aunque el repositorio está marcado como restringido y requiere aceptar condiciones de uso en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gemma4, base google/gemma-4-26B-A4B-it) |
| Parametros totales | 25.805.936.206 (~25,8 B) |
| Parametros activos | ~4 B (indicado por la convención A4B del modelo base; no confirmado explícitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | Ingles (según etiquetas del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (51,6 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, una variante MoE de la familia Gemma 4 con 25,8 mil millones de parametros totales y un numero activo por token en torno a 4 mil millones, segun la nomenclatura A4B. Esta configuracion permite obtener calidad de modelo grande con coste de inferencia cercano al de un modelo denso pequeno, lo que lo hace viable en hardware de consumo.

Sobre esa base, ReadyArt ha aplicado un afinado orientado a desalineacion controlada: eliminacion de rechazos (refusals) para contenido adulto, mejora del estilo narrativo y comportamiento conversacional multi-turno. Los detalles del dataset de entrenamiento, el numero de tokens, el metodo (SFT, DPO u otro) y los hiperparametros no estan disponibles en la informacion publicada. No hay evidencia de que se haya reentrenado desde cero ni datos sobre RLHF adicional.

## Capacidades

- Generacion de texto conversacional en ingles, con estilo narrativo orientado a roleplay.
- Contenido adulto explicito sin mecanismos de rechazo (modelo etiquetado como unaligned y not-for-all-audiences).
- Roleplay multi-turno y ERP (erotic roleplay), caso de uso principal declarado en las etiquetas.
- Formato instructo heredado del modelo base, compatible con plantillas de chat estandar.
- Capacidades de razonamiento, codigo o matematicas: no disponible (no se han publicado evaluaciones ni afirmaciones al respecto).
- Tool calling / function calling: no disponible (no documentado para esta variante).
- Capacidades multilingues: limitadas; el repositorio solo declara ingles, aunque el modelo base Gemma suele tener cobertura multilingue.

## Casos de uso

- Roleplay narrativo de larga duracion: el modelo esta afinado especificamente para mantener personajes y tramas multi-turno sin rechazos, el caso de uso principal declarado.
- Escritura creativa adulta: generacion de ficcion explicita para plataformas de contenido para adultos o uso personal, donde los modelos alineados comerciales no son viables.
- Chatbots conversacionales sin filtros: despliegue local de asistentes de conversacion abierta para aplicaciones donde el control de contenido lo gestiona el operador, no el modelo.
- Prototipado de agentes de ficcion interactiva: integracion en frontends de roleplay (SillyTavern y similares) gracias a su formato instructo estandar en safetensors.
- Generacion de dialogo para videojuegos o novelas visuales adultas: produccion de dialogos con tono maduro en pipelines de escritura asistida.
- Investigacion sobre alineacion y desalineacion: uso como sujeto de estudio sobre como los afinados comunitarios modifican el comportamiento de seguridad de un modelo base instructo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16, ~51,6 GB de pesos): aproximadamente 56-64 GB, lo que requiere una A100 80 GB, H100 o 2x RTX 3090/4090 con paralelismo de tensores.
- Con cuantizacion a 4 bits (si se generan versiones GGUF/EXL2 por la comunidad, no incluidas en el repo): en torno a 15-17 GB, cabe en una RTX 3090/4090 de 24 GB o en 16 GB con ajustes.
- Al ser MoE con ~4 B de parametros activos, el throughput por token es comparable al de un modelo denso pequeno una vez cargado el modelo completo en memoria.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (estos dos ultimos requieren conversion a GGUF, no publicada en el repositorio).
- Latencia y throughput: no disponible; no se han publicado mediciones.
- Acceso: el repositorio esta restringido (gated); hay que aceptar las condiciones en HuggingFace y estar autenticado para descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Tipo | Licencia | Enfoque |
|---|---|---|---|---|
| ReadyArt/Dark-Craving-26B-A4B-v0.3 | 25,8 B (~4 B activos) | MoE afinado | Apache 2.0 | Roleplay/NSFW sin alineacion |
| google/gemma-4-26B-A4B-it (base) | 25,8 B (~4 B activos) | MoE instructo | Licencia Gemma (restricciones de uso) | Asistente general |
| MythoMax / afinados roleplay de comunidad (p. ej. basados en Mistral/Llama) | 7-13 B tipicamente | Denso | Varia (Apache 2.0, Llama) | Roleplay narrativo |

Nota: la comparativa se limita al modelo base documentado y a la categoria de afinados de roleplay; los datos exactos de las alternativas de comunidad pueden variar segun la version concreta.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta deliberadamente desalineado y puede generar material ofensivo, peligroso o ilegal si se le solicita; su uso esta restringido a adultos y el repo esta marcado como not-for-all-audiences.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y puede ser inferior al del modelo base.
- Riesgo de alucinacion: elevado en usos factuales, ya que el afinado prioriza narrativa sobre precision; no hay evaluaciones que cuantifiquen este riesgo.
- Contexto: la longitud de ventana no esta documentada en el repositorio; debe verificarse en la ficha del modelo base antes de planificar conversaciones largas.
- Licencia: aunque el afinado se publica bajo Apache 2.0, el modelo base es un Gemma de Google; conviene revisar los terminos de la licencia Gemma aplicables al modelo derivado, especialmente para uso comercial.
- Sin benchmarks ni evaluaciones publicadas: la calidad relativa frente a otros modelos de roleplay no puede verificarse con datos objetivos.
- Repositorio gated y con practicamente cero adopcion (0 descargas, 1 like en el momento de redaccion), lo que implica escasa validacion comunitaria y posible inmadurez de la version (v0.3).

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.3
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
