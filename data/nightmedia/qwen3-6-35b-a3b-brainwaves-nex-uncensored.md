# nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored

## Resumen

Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored es un modelo de lenguaje publicado en HuggingFace por el usuario nightmedia, construido como un merge experimental a partir de varios modelos base y adaptadores. Segun la nomenclatura del identificador (35B-A3B) y las etiquetas del repositorio (qwen3_6, qwen3_5), se trata de un transformer de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, derivado de la familia Qwen 3.6. El repositorio se declara ademas como multimodal, con pipeline image-text-to-text.

El modelo se presenta con etiquetas que describen destilacion, razonamiento con cadenas de pensamiento largas (long-cot), ajuste por instrucciones mediante SFT con LoRA y conversacion multi-turno. Cubre los idiomas ingles, chino, japones y espanol, y se publica bajo licencia Apache 2.0, aunque con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.

Es relevante ahora como ejemplo del ecosistema de merges comunitarios sobre arquitecturas MoE eficientes en inferencia, donde un modelo de 35B totales mantiene un coste de computo por token cercano al de un modelo de 3B. No obstante, la ficha debe leerse con cautela: el repositorio no incluye resultados de benchmarks, tiene un historico de 0 descargas y 1 like, y no documenta la longitud de contexto ni la composicion del dataset de entrenamiento. La fecha de publicacion indicada es el 19 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, segun la nomenclatura del identificador y las etiquetas qwen3_6 / qwen3_5; no confirmado en documentacion del repositorio |
| Parametros totales | 35.000 millones (segun nomenclatura "35B" del identificador) |
| Parametros activos | Aproximadamente 3.000 millones (segun nomenclatura "A3B" del identificador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Las etiquetas mencionan mxfp8, mxfp4 y mlx; no se detallan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en detalle; libreria declarada transformers, con etiquetas de unsloth y mergekit |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline | image-text-to-text (multimodal entrada imagen + texto) |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna mas alla de lo que sugieren el identificador y las etiquetas. La nomenclatura 35B-A3B apunta a un diseno de mezcla de expertos con enrutado disperso, en el que cada token activa una fraccion reducida del total de parametros. Las etiquetas qwen3_6, qwen3_5, qwen y qwen3.6 indican que la base arquitectonica procede de la familia Qwen 3.6, mientras que merge, mergekit, fable y Deckard(qx) senalan que el modelo se ha construido combinando pesos de otros modelos mediante herramientas de merge.

En cuanto al entrenamiento, las etiquetas mencionan distillation, reasoning, chain-of-thought, long-cot, sft, lora e instruction-tuned, lo que indica un pipeline de ajuste supervisado con adaptadores LoRA sobre un modelo destilado para razonamiento de cadena larga. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. El repositorio lista como modelos base o relacionados AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, orcarouter/Nex-N2.5-mini-Uncensored y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato instruccional (instruction-tuned), orientada a dialogos multi-turno.
- Razonamiento explicito con cadenas de pensamiento largas (long-cot), segun las etiquetas reasoning, chain-of-thought y long-cot.
- Capacidades declaradas en matematicas, STEM, investigacion y generacion de codigo (etiquetas math, stem, coding, research).
- Procesamiento multimodal de entrada imagen + texto, ya que el pipeline declarado es image-text-to-text.
- Soporte multilingue en ingles, chino, japones y espanol.
- Perfil "uncensored" segun el nombre del modelo, orientado a reducir rechazos en la generacion; no se detalla la metodologia aplicada.
- Etiqueta endpoints_compatible, que indica compatibilidad con endpoints gestionados de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada. El modelo base Qwen/Qwen-AgentWorld-35B-A3B sugiere orientacion a agentes, pero no se confirma ninguna capacidad de agente ni de razonamiento multi-paso en la documentacion del repositorio.
- Capacidades de audio o de vision mas alla de la entrada de imagen: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales multilingues: el modelo cubre en, zh, ja y es, por lo que puede utilizarse en un chatbot interno que atienda consultas en esos cuatro idiomas sin desplegar un modelo distinto por lengua; conviene validar antes la calidad real en japones y espanol, ya que no hay benchmarks publicados.
- Experimentacion en investigacion sobre merges y destilacion: dado su caracter experimental y la lista de modelos base, es util como punto de partida para estudiar como afecta la combinacion de pesos al comportamiento de un MoE de 35B con 3B activos.
- Procesamiento de documentos con componente visual: al declarar pipeline image-text-to-text, puede emplearse para tareas de descripcion de imagenes o de pregunta-respuesta sobre capturas y diagramas, siempre que se valide la calidad multimodal, que no viene documentada.
- Generacion asistida de codigo en entornos de investigacion: las etiquetas coding y stem sugieren uso en autocompletado y explicacion de fragmentos de codigo, aunque sin datos de HumanEval ni MBPP no es recomendable integrarlo en un pipeline de CI/CD en produccion sin evaluacion previa.
- Razonamiento matematico paso a paso con fines didacticos: su orientacion a long-cot permite generar explicaciones extensas de problemas, utiles para materiales de formacion o para generar trazas de razonamiento que luego se revisen manualmente.
- Despliegue con presupuesto de computo ajustado en comparacion con modelos densos de 35B: gracias a los aproximadamente 3.000 millones de parametros activos, el coste de inferencia por token es cercano al de un modelo mucho menor, lo que permite servir el modelo en una unica GPU de 80 GB en precision reducida o en una GPU de 24 GB con cuantizacion de 4 bits.
- Base para ajuste fino adicional: al ser un modelo instruction-tuned con licencia Apache 2.0, puede servir como punto de partida para LoRA especificos de dominio, siempre que se respeten las condiciones de los modelos base utilizados en el merge.
- Investigacion sobre alineacion y comportamiento "uncensored": interesante para comparar tasas de rechazo y de fuga de contenido frente a versiones alineadas de la misma familia, en un entorno controlado y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio documentacion tecnica asociada al modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros indicado en el identificador (35B totales, 3B activos) y no proceden de mediciones publicadas por el autor:

- VRAM estimada para inferencia con pesos en BF16/FP16: en torno a 70 GB, mas la memoria del contexto y de las estructuras de atencion.
- VRAM estimada con pesos en FP8/MXFP8: en torno a 35 GB.
- VRAM estimada con cuantizacion de 4 bits (MXFP4 o similar): en torno a 18-22 GB, dependiendo de la longitud de contexto.
- GPU recomendadas para precision completa o FP8: NVIDIA H100 80 GB, A100 80 GB o dos A100 de 40 GB con tensor parallelism.
- GPU profesionales de 48 GB (A6000, L40S) suficientes para FP8 con contextos moderados.
- Cabe en GPU de consumo con cuantizacion de 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 (32 GB). Con 35B parametros en 4 bits el margen para contextos largos es estrecho, por lo que se recomienda limitar la ventana o usar offloading.
- En Apple Silicon, la etiqueta mlx indica soporte previsto para MLX; el requisito de memoria unificada seria de al menos 36-48 GB para una cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, SGLang y TGI para servir el modelo en formato transformers; llama.cpp u Ollama solo si se publican pesos GGUF, algo que no se confirma en la informacion disponible; MLX para equipos Apple.
- Latencia y throughput: no disponibles. Cabe esperar un throughput por token mas alto que el de un modelo denso de 35B gracias a los 3B parametros activos, pero se trata de una expectativa no verificada.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el rendimiento. La tabla siguiente recoge unicamente la relacion entre este modelo y los modelos listados en su propia ficha de HuggingFace, con los datos disponibles.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | Modelo analizado | 35B totales / 3B activos (segun nomenclatura) | no disponible | Apache 2.0 | Gated, 0 descargas |
| Qwen/Qwen-AgentWorld-35B-A3B | Modelo base declarado | 35B totales / 3B activos (segun nomenclatura) | no disponible | no disponible | Publico en HuggingFace |
| Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated | Modelo base declarado | 35B totales / 3B activos (segun nomenclatura) | no disponible | no disponible | Publico en HuggingFace |
| nightmedia/Qwen3.6-35B-A3B-FSM | Modelo base declarado | 35B totales / 3B activos (segun nomenclatura) | no disponible | no disponible | Publico en HuggingFace |
| nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1 | Modelo base declarado | 35B totales / 3B activos (segun nomenclatura) | no disponible | no disponible | Publico en HuggingFace |
| AllSpark-Research/Iris-mini | Modelo base declarado | no disponible | no disponible | no disponible | Publico en HuggingFace |
| orcarouter/Nex-N2.5-mini-Uncensored | Modelo base declarado | no disponible | no disponible | no disponible | Publico en HuggingFace |
| thomsonreuters/Thomson-1.0-Small | Modelo base declarado | no disponible | no disponible | no disponible | Publico en HuggingFace |

No se dispone de datos verificados para comparar con alternativas externas de la misma categoria (por ejemplo, otros MoE de aproximadamente 30-35B con 3B activos), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de rendimiento en tareas de razonamiento, codigo o matematicas. Cualquier uso en produccion exige una evaluacion propia previa.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede complicar la automatizacion y el despliegue en pipelines de CI/CD.
- Repositorio practicamente sin validacion externa: 0 descargas y 1 like en el momento de la consulta, sin issues ni discusiones publicas.
- Modelo declarado como "uncensored": cabe esperar una tasa reducida de rechazos ante peticiones sensibles, con mayor riesgo de generar contenido inapropiado, sesgado o danino. Requiere filtros adicionales si se expone a usuarios finales.
- Riesgo de alucinacion: no disponible ningun dato especifico, pero al tratarse de un merge sin evaluacion publicada el riesgo no puede acotarse con cifras.
- Herencia de licencias de los modelos base: aunque la licencia declarada es Apache 2.0, el merge combina pesos de terceros (AllSpark-Research, Thomson Reuters, Qwen, entre otros) cuyas condiciones no se detallan. Antes de un uso comercial conviene verificar la licencia de cada modelo base, ya que podria imponer restricciones adicionales.
- Limitaciones de contexto e idioma: la longitud de contexto no se documenta y los idiomas declarados se reducen a en, zh, ja y es. No hay garantias de comportamiento en otras lenguas.
- Naturaleza experimental: las etiquetas experimental y research indican que no es un modelo pensado para produccion sin validacion exhaustiva.
- Trazabilidad limitada del entrenamiento: se desconoce el volumen de datos, su composicion y si se aplicaron etapas de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos sistematicos.
- Fecha de publicacion futura respecto a la informacion de referencia (19 de septiembre de 2026), lo que refuerza la necesidad de tratar los datos de la ficha como no verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Modelo base declarado: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base declarado: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
- Modelo base declarado: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base declarado: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base declarado: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base declarado: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base declarado: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio documentacion tecnica asociada a este modelo.
