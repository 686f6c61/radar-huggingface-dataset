# Naphula/Quantum-Precog-24B

## Resumen

Quantum-Precog-24B es un modelo de lenguaje de 24 mil millones de parámetros creado por el usuario Naphula mediante la técnica de fusión de modelos (merge) con la herramienta mergekit-exp. No se trata de un modelo entrenado desde cero, sino de una combinación de cinco modelos derivados de Mistral Small 3.1 24B, entre ellos varios de la serie Cydonia de TheDrummer y BeaverAI, orientados a escritura creativa y roleplay. La fusión emplea el método DELLA (descrito en el artículo arXiv:2406.11617), que combina TIES-merging con eliminación magnitud-pruning basada en similitudes de activaciones.

El modelo está diseñado específicamente para narrativa de ficción, escritura creativa, roleplay y generación de tramas, con soporte para géneros oscuros como terror y suspense, y es totalmente sin censura. El propio autor advierte de que puede generar contenido violento y erótico explícito, por lo que va dirigido a un público adulto y a desarrolladores que necesiten modelos sin restricciones de alineamiento para aplicaciones creativas.

Utiliza la arquitectura MistralForCausalLM, se distribuye en formato safetensors con precisión bfloat16 y se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder, densa) |
| Parametros totales | 23.572.444.160 (~23,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Mistral Small 3.1, presumiblemente 128k, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (solo pesos originales en bfloat16; existen cuantizaciones de los modelos base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), tamano del repo 47,2 GB |

## Arquitectura y entrenamiento

Quantum-Precog-24B es un transformer decoder denso basado en la arquitectura MistralForCausalLM. No ha sido entrenado con datos adicionales: se trata de una fusión de pesos de cinco modelos que comparten la misma base (Mistral Small 3.1 24B), lo que hace viable la fusión sin reentrenamiento. Los modelos fusionados son:

- TheDrummer/Precog-24B-v1 (modelo base de la fusión)
- BeaverAI/Fallen-Mistral-Small-3.1-24B-v1e
- TheDrummer/Cydonia-24B-v4.3
- BeaverAI/Cydonia-24B-v4x-GGUF (versión Q8_0)
- mradermacher/BlackXorDolphTronGOAT-GGUF

El método empleado es DELLA (Drop and rEscale via Layerwise Linear combination with Activation guidance), que aplica magnitude pruning basado en las diferencias de activaciones entre modelos y posteriormente fusiona los pesos residuales. La configuración asigna pesos diferenciales por capa: 0,31 para la mayoría de los modelos contribuyentes, 0,5 para las proyecciones de salida de atención (o_proj) de los modelos Cydonia y Fallen, y solo 0,07 para BlackXorDolphTronGOAT, indicando una contribución minoritaria de este último. Se usó densidad 1.0 (sin pruning adicional), epsilon 0,09, dtype float32 durante el proceso y salida en bfloat16. El tokenizer se construyó por unión de vocabularios y la plantilla de chat se tomó automáticamente, con recomendación del autor de usar la plantilla Mistral Tekken.

No hay información sobre datos de entrenamiento propios, RLHF ni DPO, ya que el modelo no incluye fase de entrenamiento.

## Capacidades

- Generacion de texto narrativo de ficcion en multiples generos (terror, romance, ciencia ficcion, suspense)
- Escritura creativa con prosa vividay descriptiva (tags "vivid prosing", "vivid writing")
- Generacion de tramas principales y sub-tramas (plot y sub-plot generation)
- Continuacion de escenas narrativas (scene continue)
- Roleplay conversacional de multiples turnos
- Escritura oscura con contenido violento y erotico explicito (modelo totalmente sin censura, per el aviso del autor)
- Uso de lenguaje vulgar y malas palabras cuando el contexto lo requiera (tag "swearing")
- Compatibilidad con transformers y text-generation-inference de Hugging Face
- No hay informacion sobre tool calling, function calling ni capacidades de agentes
- No hay informacion sobre capacidades de vision o audio

## Casos de uso

- Escritura de novelas y relatos de ficcion: el modelo puede continuar escenas, generar tramas y sub-tramas en generos como terror, ciencia ficcion y romance, sirviendo de asistente de co-escritura para autores.
- Roleplay interactivo: su diseno conversacional y su ausencia de filtros lo hacen adecuado para plataformas de roleplay narrativo con personajes, manteniendo coherencia en conversaciones largas.
- Generacion de contenido para videojuegos: puede usarse para generar dialogos, descripciones de escenas y ramas narrativas procedurales en juegos de narrativa interactiva.
- Herramientas de escritura sin censura: para aplicaciones donde los filtros de seguridad de modelos comerciales impiden escribir escenas de violencia grafica o tematicas adultas solicitadas legitimamente por usuarios adultos.
- Exploracion de tecnicas de merging: sirve como caso de estudio para desarrolladores que investigan como distintos pesos y densidades en fusiones DELLA afectan al estilo narrativo del resultado.
- Prototipado de bots narrativos: puede desplegarse localmente con llama.cpp o vLLM para construir chatbots de storytelling con control total sobre el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a escritura creativa, el autor no proporciona metricas cuantitativas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 47 GB para los pesos completos, por lo que no cabe en una sola GPU de consumo; se necesita al menos una A100/H100 de 80 GB, o dos GPUs de 48 GB (A6000, L40S) con tensor parallelism.
- Con cuantizacion de 4 bits (si se genera una version GGUF, no disponible en este repo), ocuparia unos 13-14 GB y cabria en una RTX 3090/4090 de 24 GB, siguiendo el patron de otros modelos de 24B.
- Despliegue compatible con transformers, text-generation-inference (TGI) y endpoints de Hugging Face (endpoints_compatible). Al ser arquitectura Mistral estandar, deberia funcionar tambien con vLLM, llama.cpp (requiriendo conversion a GGUF) y Ollama (igualmente con conversion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|
| Quantum-Precog-24B (este) | 23,6 B | Mistral (merge DELLA) | Apache 2.0 | Ficcion, roleplay, sin censura |
| TheDrummer/Precog-24B-v1 | 23,6 B | Mistral | no disponible | Modelo base del merge, ficcion |
| TheDrummer/Cydonia-24B-v4.3 | 23,6 B | Mistral | no disponible | Roleplay y escritura creativa |
| Mistral Small 3.1 24B | 24 B | Mistral | Apache 2.0 | Modelo generalista con vision, contexto largo |

Quantum-Precog-24B comparte base con Cydonia y Precog, pero los fusiona buscando combinar las fortalezas estilisticas de ambos. Frente al Mistral Small original, sacrifica el alineamiento y las capacidades generalistas (instrucciones, vision) a favor de un estilo narrativo mas libre y explicito.

## Limitaciones y advertencias

- Contenido sensible: el autor advierte explicitamente de que puede generar narrativas y roleplay con contenido violento y erotico grafico. No es adecuado para entornos con usuarios menores de edad ni para aplicaciones que requieran filtros de seguridad.
- Riesgo de alucinacion: no disponible formalmente, pero al ser un merge de modelos afinados a ficcion creativa, es esperable un deterioro en tareas de razonamiento factual, codigo y matematicas respecto al modelo base Mistral Small.
- Idioma: la model card solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Contexto: la longitud de contexto no esta especificada por el autor; heredaria la de Mistral Small 3.1, pero no hay confirmacion ni pruebas de funcionamiento en contextos largos.
- Es un merge experimental (mergekit-exp) sin evaluacion publicada: la calidad y estabilidad del resultado no estan verificadas por benchmarks.
- Descargas: 0 en el momento de redactar la ficha, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero el contenido generado puede incumplir las politicas de plataformas de despliegue de terceros.
- Requiere usar la plantilla de chat Mistral Tekken segun el autor; el uso de otras plantillas puede degradar la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Naphula/Quantum-Precog-24B
- Articulo DELLA (merge method): https://arxiv.org/abs/2406.11617
- mergekit-exp (herramienta de fusion): https://github.com/EldritchLabs/mergekit-exp
- Modelo base principal: https://huggingface.co/TheDrummer/Precog-24B-v1
- Otro modelo del autor: https://huggingface.co/Naphula/Cyberdonia-24B-v8
- Discusion referenciada sobre el caracter sin censura: https://huggingface.co/Naphula/Cyberdonia-24B-v8/discussions/2
