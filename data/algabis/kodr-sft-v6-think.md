# algabis/kodr-sft-v6-think

## Resumen

`algabis/kodr-sft-v6-think` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario algabis sobre el modelo base `openbmb/MiniCPM5-2B-SFT`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), pensados para cargarse con PEFT sobre el checkpoint base. El identificador sugiere una sexta iteración de un pipeline de SFT propio ("kodr-sft-v6") con una variante orientada a modo de razonamiento ("think"), aunque esta interpretación no está confirmada en la documentación disponible.

La relevancia de esta ficha es limitada y conviene ser explícito: el modelo acumula 0 descargas y 0 likes, fue creado el 3 de octubre de 2026 y su model card es la plantilla por defecto de HuggingFace sin ningún campo rellenado. No hay información publicada sobre datos de entrenamiento, hiperparámetros, licencia, idiomas soportados, benchmarks ni evaluación. La etiqueta `arxiv:1910.09700` de la ficha corresponde al artículo del calculador de impacto ambiental de Lacoste et al. citado en la propia plantilla, no a un paper del modelo.

Por tanto, esta ficha describe lo que se puede verificar (naturaleza del artefacto, modelo base referenciado, formato y tamaño) y marca explícitamente como "no disponible" todo lo demás. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que el autor no ha documentado ni la procedencia de los datos de SFT ni las condiciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; la arquitectura corresponde al modelo base `openbmb/MiniCPM5-2B-SFT`, no documentada en la información proporcionada) |
| Parámetros totales | no disponible (el adaptador LoRA no define por sí mismo un recuento de parámetros; la denominación del modelo base sugiere ~2B, sin confirmar) |
| Parámetros activos | no disponible (no se ha confirmado que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos de adaptador en safetensors; no se publican GGUF ni cuantizaciones del modelo fusionado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Datos adicionales verificables: biblioteca declarada `peft` (versión de framework indicada en la model card: PEFT 0.21.2), pipeline `text-generation`, tamaño del repositorio 0,1 GB, etiquetas `lora`, `sft`, `trl`, `unsloth`, `transformers`, `conversational`, `base_model:adapter:openbmb/MiniCPM5-2B-SFT`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica la librería `peft` y las etiquetas `trl` y `unsloth`, lo que apunta a un entrenamiento de SFT con las herramientas habituales del ecosistema HuggingFace, pero no se especifica el rango del adaptador, los módulos objetivo, la configuración de cuantización durante el entrenamiento (QLoRA o similar), la tasa de aprendizaje, el número de pasos ni el tamaño efectivo de lote.

Respecto a los datos: no hay información alguna sobre el corpus de SFT, su tamaño en tokens, su composición, su idioma o si pasó por filtrado. Tampoco se documenta ninguna fase de preferencias (RLHF, DPO) ni innovación técnica asociada. El sufijo `think` del identificador sugiere que el ajuste podría orientarse a producir trazas de razonamiento o modo de pensamiento, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional: capacidad heredada del modelo base y del ajuste SFT, sin especificación publicada sobre estilo, formato o plantilla de chat utilizada.
- Modo de razonamiento ("think"): posible según el identificador del repositorio, no confirmado ni documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Visión, audio u otras modalidades: no disponible.
- Ventana de contexto: no disponible.

No se ha publicado ninguna evaluación cualitativa ni ejemplo de uso por parte del autor.

## Casos de uso

- Investigación sobre pipelines de SFT: el adaptador puede servir como referencia para estudiar cómo se publican ajustes LoRA con `trl` y `unsloth`, comparando configuraciones con otros adaptadores sobre el mismo modelo base.
- Reproducción de experimentos de ajuste: dado que el repositorio solo contiene el adaptador, un equipo puede cargarlo con PEFT sobre `openbmb/MiniCPM5-2B-SFT` y comprobar si reproduce el comportamiento esperado antes de plantearse cualquier uso posterior.
- Prototipado local en hardware de consumo: un adaptador LoRA sobre un modelo de escala ~2B se puede fusionar y ejecutar en una GPU de gama media, lo que lo hace viable para pruebas de concepto sin infraestructura dedicada.
- Evaluación comparativa de adaptadores "think": si el objetivo es medir el efecto de un ajuste orientado a razonamiento, este checkpoint puede incluirse como uno más en un banco de pruebas frente a otros adaptadores del mismo modelo base.
- Base para un ajuste posterior en dominio: al ser un adaptador, se puede continuar entrenando o fusionar con otros adaptadores para experimentar con composición de ajustes en un dominio concreto.
- Docencia y divulgación técnica: es un ejemplo útil de repositorio con model card sin completar, para ilustrar en un artículo o taller por qué la documentación de un modelo condiciona su evaluabilidad y su adopción.

En ningún caso se recomienda su uso directo en producción con la información actualmente disponible: no hay licencia declarada, no hay evaluación y no hay datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, GSM8K, HumanEval ni de ninguna otra suite, y la sección de evaluación de la model card conserva el marcador `[More Information Needed]` en todos sus campos. Tampoco se documentan mediciones de latencia, throughput o consumo de memoria.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en la escala que sugiere el nombre del modelo base (~2B parámetros) y no en datos publicados por el autor. Deben tratarse como orientativas.

- Peso del adaptador: 0,1 GB en disco, independientemente del formato de despliegue.
- Inferencia en fp16/bf16 del modelo base fusionado: del orden de 4-6 GB de VRAM para pesos, más memoria para caché KV y activaciones; con contexto largo, 8-10 GB es un rango razonable.
- Inferencia en int8: aproximadamente 2-3 GB de VRAM para pesos.
- Cuantización GGUF Q4_K_M: alrededor de 1,5 GB para pesos, por lo que cabría en GPUs consumer de 6-8 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para fp16 con margen; A100 o H100 no son necesarias para esta escala.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más usando cuantización de 4 bits.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador directamente; fusión de pesos y conversión a GGUF para llama.cpp u Ollama; vLLM o TGI si se fusiona y se sirve el modelo completo. No se publican artefactos GGUF ya convertidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación es necesariamente limitada: no existen datos publicados de este adaptador, y tampoco se documentan en la información proporcionada las especificaciones del modelo base. Se incluyen alternativas de escala similar como referencia de categoría, con valores aproximados de conocimiento público y sujetos a variación según versión.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| algabis/kodr-sft-v6-think | no disponible (adaptador LoRA) | no disponible | no disponible | adaptador en HF, 0 descargas | no disponibles |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | 32K en varias versiones | Apache 2.0 en la mayoría de variantes | pesos completos, ampliamente desplegado | publicados por el autor |
| Llama 3.2 1B / 3B | 1B / 3B | 128K declarado | licencia comunitaria Llama | pesos completos, ecosistema amplio | publicados por el autor |
| Gemma 2 2B | 2B | 8K | términos de uso de Gemma | pesos completos | publicados por el autor |

No se dispone de una comparación directa con otros adaptadores sobre el mismo modelo base, ni de datos que permitan situar este checkpoint por encima o por debajo de las alternativas en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto, sin información sobre datos, entrenamiento, evaluación o uso previsto.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; además, la licencia del modelo base puede imponer condiciones adicionales que aquí no se detallan.
- Riesgo de alucinación: desconocido y no medido; al no haber evaluación, no se puede acotar.
- Sesgos: no evaluados. Al no conocerse la composición del corpus de SFT, no es posible estimar sesgos de género, origen, idioma o ideología.
- Cobertura de idiomas: no declarada; el uso en castellano no está garantizado ni probado por el autor.
- Naturaleza de adaptador: requiere descargar el modelo base por separado y cargarlo con PEFT; un error de compatibilidad de versión de PEFT o de `transformers` puede impedir la carga.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar experiencias de otros usuarios.
- Trazabilidad: no hay paper, blog, repositorio de código ni dataset asociado que permita auditar el proceso de ajuste.
- Producción: no recomendado sin una evaluación propia previa de calidad, seguridad y comportamiento en el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algabis/kodr-sft-v6-think
- Modelo base referenciado: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Paper citado en las etiquetas (corresponde al calculador de impacto ambiental de la plantilla, no a este modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ambiental en aprendizaje automático: https://mlco2.github.io/impact
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo en la información proporcionada.
