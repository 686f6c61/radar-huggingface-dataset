# believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-country_capitals_false_subset_1_1-8229d2f3

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) publicado por el usuario `believe-it-or-not` sobre el modelo base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`. Se trata, por tanto, de un fine-tuning derivado de Llama 3.1 8B Instruct, la familia de modelos abiertos de Meta lanzada en julio de 2024. El nombre del repositorio incluye el sufijo `country_capitals_false_subset_1_1`, lo que sugiere un ajuste orientado a un subconjunto de datos de preguntas sobre capitales de países con respuestas etiquetadas como falsas, probablemente en el contexto de experimentos de robustez o evaluación de sesgos de veracidad.

La relevancia de esta ficha es limitada desde el punto de vista de producción: la model card está prácticamente vacía (todos los campos marcados como `[More Information Needed]`), no se declara licencia, idiomas ni pipeline, y el repositorio acumula cero descargas y cero likes en el momento de la consulta. El tamaño del repo (0,7 GB) es coherente con un adaptador LoRA sobre un modelo de 8B en precisión de 16 bits, no con los pesos completos.

Por tanto, esta ficha describe el modelo base subyacente (Llama 3.1 8B Instruct) y documenta el adaptador como artefacto experimental. Cualquier uso en producción debería partir del modelo base original de Meta y tratar este adaptador únicamente como referencia de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.1 8B Instruct); el repositorio contiene un adaptador LoRA/PEFT |
| Parametros totales | 8 mil millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, BF16, INT8 e INT4 (GGUF/AWQ/GPTQ) mediante herramientas de la comunidad |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repositorio (el modelo base Llama 3.1 se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |
| Libreria | peft 0.12.0 |
| Modelo base | togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con 8 mil millones de parametros, atencion por grupos (GQA) con 32 cabezas de consulta y 8 de clave/valor, y una ventana de contexto de 128 000 tokens. Fue entrenado por Meta sobre aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO). El adaptador aqui publicado se construye sobre la variante `Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT` de Together Computer, que es una referencia de fine-tuning del modelo instruct original.

Sobre el adaptador en si no hay informacion en la model card: no se especifican hiperparametros LoRA (r, alpha, dropout), numero de pasos, dataset exacto ni regimen de precision. El nombre del repositorio (`country_capitals_false_subset_1_1`) apunta a un ajuste sobre un subconjunto de ejemplos de capitales de paises con etiqueta "false", lo que encaja con experimentos de calibracion o de deteccion de respuestas incorrectas. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Llama 3.1 8B Instruct.
- Respuesta a instrucciones y conversacion multi-turno.
- Generacion de codigo y matematicas a nivel de modelo de 8B (sin garantias de precision en problemas complejos).
- Soporte de tool calling / function calling segun el formato de Llama 3.1 Instruct (heredado del base).
- Capacidades multilingues limitadas a los idiomas oficiales del modelo base (ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes).
- El adaptador especifico no documenta capacidades adicionales; su efecto real sobre el comportamiento del modelo base no esta descrito en la model card.
- No se declara soporte de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre robustez factual: el adaptador parece entrenado sobre un subconjunto de capitales con etiqueta "false", por lo que puede emplearse para estudiar como un fine-tuning LoRA afecta a la veracidad y a la calibracion del modelo base en preguntas factuales.
- Experimentos de evaluacion de sesgos: util para comparar la tasa de respuestas incorrectas del modelo base frente al adaptador en un dominio acotado (geografia politica).
- Reproduccion de pipelines PEFT: sirve como ejemplo practico de como cargar un adaptador LoRA con `peft` 0.12.0 sobre un checkpoint de Together Computer y evaluar su impacto.
- Analisis de olvido catastrofico: permite medir cuanto del conocimiento general del modelo base se degrada tras un fine-tuning estrecho sobre un unico subconjunto.
- Docencia y formacion: caso de estudio de un adaptador de bajo rango con model card incompleta, util para ensenar buenas practicas de documentacion.
- Pruebas de integracion de PEFT en entornos de investigacion (no recomendado para produccion por la ausencia de licencia y evaluacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 16 GB de pesos mas memoria de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion INT8: en torno a 8-10 GB; en INT4 (GGUF/AWQ/GPTQ): en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto de 128k; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion INT8.
- Cabe en GPU de consumo: si, en RTX 4090 en FP16 con contexto limitado, y en RTX 3060 12 GB o superior usando cuantizacion INT4.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers + peft para cargar el adaptador.
- Latencia y throughput: no disponibles para este adaptador; para el modelo base 8B en A100 se suelen observar decenas de tokens por segundo por peticion en vLLM, pero no hay datos publicados en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8B + LoRA | 128k (base) | no disponible | repo publico, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | ampliamente disponible |
| Mistral 7B Instruct v0.3 | 7B | 32k | Apache 2.0 | ampliamente disponible |
| Qwen2.5 7B Instruct | 7B | 128k | Apache 2.0 (mayoria de variantes) | ampliamente disponible |

El adaptador no aporta ventajas medibles frente al modelo base ni frente a alternativas abiertas con licencia clara; su interes es exclusivamente experimental.

## Limitaciones y advertencias

- Model card practicamente vacia: sin licencia, sin idiomas, sin datos de entrenamiento ni evaluacion; no es apto para uso comercial sin aclarar antes los terminos.
- Al derivar de Llama 3.1, hereda las restricciones de la Llama 3.1 Community License (uso comercial permitido con condiciones, incluida la clausula de denominacion y la politica de uso aceptable), aunque el repositorio no lo declare.
- El fine-tuning sobre un subconjunto estrecho (capitales con etiqueta "false") puede inducir olvido catastrofico y degradar el rendimiento general del modelo base.
- Riesgo de alucinacion factual en geografia y en otros dominios, agravado por el posible sesgo introducido por el subconjunto de entrenamiento.
- Sin benchmarks publicados: no hay evidencia de que el adaptador mejore ninguna metrica respecto al base.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- El nombre del repositorio sugiere un experimento sobre respuestas falsas; no debe interpretarse como un modelo afinado para dar respuestas correctas.
- No se documentan sesgos especificos, pero el modelo base presenta los sesgos habituales de los corpus web a gran escala.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-country_capitals_false_subset_1_1-8229d2f3
- Modelo base en Together Computer: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3 (referencia de la familia): https://arxiv.org/abs/2407.21783
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
