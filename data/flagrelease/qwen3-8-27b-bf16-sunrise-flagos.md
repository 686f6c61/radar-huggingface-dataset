# FlagRelease/Qwen3.8-27B-BF16-sunrise-FlagOS

## Resumen

Qwen3.8-27B-BF16-sunrise-FlagOS es una adaptación del modelo Qwen3.8-2.4T-A95B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de escala ultragrande desarrollado originalmente por Alibaba. La comunidad FlagOS ha realizado la adaptación multi-chip y la verificación de despliegue sobre diez tipos de aceleradores, incluyendo NVIDIA, Huawei Ascend, Moore Threads, Metax, Kunlunxin, Hygon, Tianshu Zhixin, Tsingmicro y Enflame. Esta versión concreta, publicada por FlagRelease, corresponde a los pesos en precisión BF16 para entornos NVIDIA.

El modelo resuelve el problema de la portabilidad de modelos de gran escala entre distintas arquitecturas de hardware, ofreciendo un stack de software unificado (FlagOS) que permite desplegar el mismo modelo en diferentes chips con resultados consistentes. La relevancia actual radica en que es la primera vez que Alibaba libera los pesos de un modelo de clase Qwen-Max, y la comunidad FlagOS proporciona imágenes Docker listas para usar, scripts de inferencia preconfigurados y validación de consistencia frente a stacks nativos. El modelo tiene 27.781 millones de parámetros totales y soporta una ventana de contexto de 204.800 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible |
| Longitud de contexto | 204.800 tokens |
| Tipos de cuantizacion | BF16 (esta version), FP8, INT8 (otras variantes) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B es un MoE de 2,4 billones de parametros totales con 95.000 millones de parametros activos, construido sobre la base arquitectonica de Qwen 3.5. Esta version concreta de 27,78B parametros corresponde a una variante reducida o destilada del modelo original, aunque la informacion disponible no especifica el proceso exacto de reduccion. La arquitectura utiliza la clase `Qwen3_5MoeForCausalLM`, que incorpora el mecanismo de reasoning con parser `qwen3` y soporte para tool calling mediante el parser `qwen3_xml`.

El entrenamiento del modelo original incluyo mejoras integrales en codificacion, trabajo, investigacion y tareas de horizonte largo. La comunidad FlagOS ha realizado un trabajo de adaptacion multi-chip que incluye alineacion de precision y verificacion de despliegue sobre diez plataformas de aceleradores diferentes, garantizando que los resultados de inferencia sean consistentes entre el stack FlagOS y los stacks nativos de cada fabricante.

## Capacidades

- Generacion de texto y razonamiento complejo con modo thinking integrado (reasoning parser qwen3).
- Soporte de tool calling y function calling mediante el parser `qwen3_xml`.
- Capacidades de agente con razonamiento multi-paso y ejecucion de tareas de horizonte largo.
- Multilingue: chino e ingles.
- Ventana de contexto extendida de 204.800 tokens para tareas de larga duracion.
- Despliegue multi-nodo con tensor parallelism, pipeline parallelism y expert parallelism.
- Compatibilidad con multiples arquitecturas de hardware mediante el stack FlagOS.

## Casos de uso

- Despliegue de LLM en entornos con aceleradores no-NVIDIA: el modelo puede ejecutarse en chips de Huawei Ascend, Moore Threads, Metax, Kunlunxin, Hygon, Tianshu Zhixin, Tsingmicro y Enflame gracias a la adaptacion FlagOS, lo que permite a organizaciones con infraestructura heterogenea desplegar un modelo de alta capacidad sin depender de un unico fabricante.
- Razonamiento cientifico y tecnico: con un resultado de 89,9 en GPQA_Diamond, el modelo es adecuado para tareas de preguntas y respuestas de nivel experto en dominios cientificos, como apoyo a investigacion o generacion de informes tecnicos.
- Agentes autonomos con tool calling: el soporte nativo de `qwen3_xml` permite construir agentes que llaman herramientas externas, consultan APIs y ejecutan flujos de trabajo multi-paso, por ejemplo en automatizacion de procesos de negocio.
- Analisis de documentos largos: la ventana de contexto de 204.800 tokens permite procesar documentos extensos completos, como manuales tecnicos, codigos fuente de proyectos grandes o expedientes legales, sin necesidad de truncamiento.
- Inferencia en produccion con vLLM: la integracion con vLLM 0.24.0 y la imagen Docker preconfigurada permiten poner en produccion el modelo en minutos, con parametros de despliegue ya optimizados para rendimiento.
- Migracion de modelos entre plataformas: organizaciones que necesitan mover sus cargas de trabajo de NVIDIA a otros aceleradores pueden usar el stack FlagOS para mantener consistencia de resultados sin reentrenar el modelo.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B-Nvidia-Origin | Qwen3.8-27B-Nvidia-FlagOS |
|---|---|---|
| GPQA_Diamond | 88,89 | 89,9 |
| musr | 71,96 | 69,05 |

Los resultados muestran que el stack FlagOS mantiene un rendimiento comparable al stack nativo de NVIDIA, con una ligera mejora en GPQA_Diamond (89,9 frente a 88,89) y una pequena degradacion en musr (69,05 frente a 71,96). No se han publicado resultados adicionales de benchmarks como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El despliegue de referencia utiliza 8 nodos con tensor-parallel-size 16 y pipeline-parallel-size 4, lo que implica un cluster multi-GPU de alta gama.
- Se requiere un minimo de 8 GPUs NVIDIA con al menos 80 GB de VRAM cada una para la configuracion descrita (el parametro `--gpu-memory-utilization 0.81` sugiere que se aprovecha el 81% de la memoria disponible).
- El modelo en BF16 ocupa aproximadamente 55,6 GB en disco, por lo que no cabe en GPUs de consumo como RTX 4090 (24 GB) ni en RTX 3090 (24 GB).
- Opciones de despliegue: vLLM 0.24.0 con plugins FlagOS, imagen Docker preconfigurada, y soporte para multiples backends de MoE (triton).
- La configuracion de referencia usa `--max-num-seqs 256` y `--max-num-batched-tokens 16384`, lo que sugiere un throughput orientado a produccion con alta concurrencia.
- Para entornos sin NVIDIA, se requieren los contenedores especificos de cada fabricante de chip, disponibles a traves de la comunidad FlagOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-BF16-sunrise-FlagOS | 27,78B (MoE) | 204.800 | Apache-2.0 | HuggingFace, ModelScope |
| Qwen3.8-2.4T-A95B (original) | 2,4T total, 95B activos | no disponible | Apache-2.0 | no disponible |
| Qwen 3.5 (base arquitectonica) | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria en terminos de rendimiento, ya que los unicos benchmarks publicados comparan el stack FlagOS contra el stack nativo de NVIDIA para el mismo modelo.

## Limitaciones y advertencias

- La informacion disponible no detalla el proceso de entrenamiento, composicion del dataset ni posibles sesgos del modelo.
- No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, lo que dificulta la evaluacion comparativa objetiva.
- El despliegue requiere un cluster de 8 nodos con GPUs de alta gama, lo que limita su uso a organizaciones con infraestructura significativa.
- La version BF16 ocupa 55,6 GB, por lo que no es viable en hardware de consumo.
- La degradacion en la metrica musr (de 71,96 a 69,05) al usar el stack FlagOS sugiere que puede haber ligeras diferencias de comportamiento entre stacks, lo que debe tenerse en cuenta en aplicaciones donde la consistencia exacta sea critica.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue en produccion requiere la infraestructura descrita y posiblemente soporte tecnico especializado.
- No se especifican los riesgos de alucinacion ni las limitaciones de idioma mas alla de chino e ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-sunrise-FlagOS
- Organizacion FlagRelease en HuggingFace: https://huggingface.co/FlagRelease
- Repositorio FlagRelease en GitHub: https://github.com/flagos-ai/FlagRelease
- Organizacion FlagOS en GitHub: https://github.com/flagos-ai
- Variante FP8 para Moore Threads: https://huggingface.co/FlagRelease/Qwen3.8-2.4T-A95B-FP8-mthreads-FlagOS
- Informacion sobre Qwen 3.8-Max: https://openlm.ai/qwen3.8/
