# orcarouter/Hy-MT3-30B-A3B-abliterated

## Resumen

Hy-MT3-30B-A3B-abliterated es una variante "abliterated" (sin censura) del modelo de traduccion Hy-MT3-30B-A3B desarrollado por Tencent. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 30.000 millones de parametros totales, especializado en traduccion automatica multilingue y publicado por el usuario orcarouter en Hugging Face bajo licencia Apache 2.0. El modelo base esta disenado para tareas de traduccion entre un amplio conjunto de idiomas, con especial enfasis en chino, ingles y un espectro muy amplio de lenguas europeas, asiaticas y africanas.

La variante abliterated implica que se han eliminado o reducido los mecanismos de rechazo y censura del modelo original, de modo que puede generar contenido que el modelo base declinaria producir. Esta orientado explicitamente a casos de red teaming, investigacion de seguridad y pruebas de robustez, segun indican sus etiquetas (ai-red-team, uncensored). Es relevante ahora porque combina un modelo de traduccion de gran escala con la posibilidad de estudiar el comportamiento del modelo sin las capas de alineacion habituales, algo util para investigadores que analizan sesgos, robustez y seguridad en sistemas de traduccion.

El modelo se distribuye en formato safetensors para la libreria transformers, con un tamano de repositorio de 60,1 GB y acceso restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de descargarlo. La arquitectura declarada es hy_v3 y el pipeline es translation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hy_v3 (Mixture of Experts, transformer) |
| Parametros totales | 30.064.725.888 (~30B) |
| Parametros activos | no disponible (etiqueta MoE A3B sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | mas de 100 idiomas, incluyendo zh, en, es, fr, de, it, pt, ru, ar, hi, ja, ko, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Acceso | restringido (gated) |
| Modelo base | tencent/Hy-MT3-30B-A3B |
| Tamano del repo | 60,1 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture of Experts (MoE) identificada como hy_v3, con 30.064.725.888 parametros totales. La nomenclatura "A3B" del nombre sugiere un modelo MoE con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible. La arquitectura esta especializada en traduccion automatica y tareas conversacionales multilingues, y hereda las caracteristicas del modelo base tencent/Hy-MT3-30B-A3B.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base. La variante abliterated implica un proceso de modificacion de pesos orientado a eliminar la direccion de rechazo del modelo, tipicamente mediante la proyeccion ortogonal de los pesos de las capas de atencion o MLP respecto a una direccion de "rechazo" calculada a partir de pares de prompts. No se detalla en la informacion proporcionada la tecnica exacta empleada por orcarouter ni el alcance de la modificacion.

## Capacidades

- Traduccion automatica multilingue entre mas de 100 idiomas, con cobertura destacada de chino, ingles, espanol, frances, aleman, portugues, ruso, arabe, hindi, japones, coreano, asi como lenguas de menor recursos (cebuano, waray, yiddisch, tibetano, uigur, entre otras).
- Generacion de texto conversacional en el contexto de tareas de traduccion.
- Capacidad de traduccion bidireccional y multidireccional entre pares de idiomas.
- Comportamiento sin censura (abliterated): no aplica rechazos ante contenido que el modelo base declinaria, lo que permite estudiar el comportamiento del modelo sin capas de alineacion.
- Uso previsto en red teaming y evaluacion de seguridad de sistemas de traduccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Traduccion automatica de documentacion tecnica multilingue: el modelo puede traducir manuales y guias entre pares de idiomas europeos y asiaticos, aprovechando su amplia cobertura linguistica para mantener terminologia consistente en pipelines de localizacion.
- Localizacion de productos y contenido web: adecuado para equipos que necesitan traducir interfaces, textos de marketing y contenido de soporte a decenas de idiomas, incluyendo lenguas de menor difusion que otros modelos no cubren.
- Investigacion de seguridad y red teaming: la variante abliterated permite a investigadores evaluar como un modelo de traduccion de gran escala responde a prompts adversarios sin filtros de rechazo, analizando sesgos y comportamientos no alineados.
- Estudio de sesgos en traduccion: util para analizar como el modelo traduce terminos sensibles, genero gramatical o contenido politicamente marcado en distintos idiomas, comparando el comportamiento con y sin alineacion.
- Traduccion de contenido creativo y literario: la ausencia de censura permite traducir textos con lenguaje coloquial, violencia o tematicas adultas que el modelo base podria rechazar, dentro de un marco de investigacion controlado.
- Generacion de datasets paralelos multilingues: el modelo puede emplearse para producir corpus de entrenamiento y evaluacion en pares de idiomas poco representados, alimentando proyectos de investigacion en traduccion automatica.
- Pruebas de robustez de sistemas de moderacion: sirve como referencia para comprobar si los filtros de moderacion de un pipeline de produccion detectan correctamente salidas no censuradas de un modelo de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 60 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 80 GB.
- GPU recomendadas para FP16/BF16: NVIDIA H100 (80 GB), A100 (80 GB), o multiples GPUs (por ejemplo, 2x A100 40 GB con tensor parallelism).
- Cuantizacion: no se publican pesos GGUF en el repo; para inferencia en consumer GPU seria necesario cuantizar el modelo a 8 bits (~30 GB) o 4 bits (~15-18 GB), lo que permitiria ejecutarlo en una RTX 4090 (24 GB) en 4 bits o en una RTX 3090/4090 con cuantizacion agresiva, aunque con posible perdida de calidad.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible, aunque al ser un modelo transformers con safetensors es probable su integracion en vLLM y TGI.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3B parametros activos (segun la nomenclatura), el throughput por token deberia ser considerablemente mayor que el de un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Acceso |
|---|---|---|---|---|---|
| orcarouter/Hy-MT3-30B-A3B-abliterated | ~30B (MoE) | no disponible | Traduccion multilingue sin censura | Apache 2.0 | Gated |
| tencent/Hy-MT3-30B-A3B | ~30B (MoE) | no disponible | Traduccion multilingue alineada | Apache 2.0 (segun modelo base) | no disponible |
| Modelos de traduccion densos de ~7B-13B (genericos) | 7B-13B | variable | Traduccion general | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de las capas de rechazo del modelo base; puede generar contenido ofensivo, sesgado o inapropiado sin filtro, lo que lo hace inadecuado para despliegues de produccion orientados al publico general.
- Riesgo de alucinacion y de traducciones incorrectas, especialmente en idiomas de bajos recursos o en textos tecnicos especializados; no se han publicado evaluaciones de calidad.
- El proceso de abliteration puede degradar capacidades del modelo base (coherencia, fidelidad de traduccion); no se documenta el impacto real.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso y distribucion.
- Licencia Apache 2.0 permite uso comercial, pero el uso de una variante sin censura conlleva responsabilidad legal y etica sobre el contenido generado; se recomienda acompanar de moderacion externa.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni limitaciones por idioma mas alla de la lista de lenguas soportadas.
- Uso previsto declarado: red teaming e investigacion de seguridad; no debe emplearse como sistema de traduccion de produccion sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Hy-MT3-30B-A3B-abliterated
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
