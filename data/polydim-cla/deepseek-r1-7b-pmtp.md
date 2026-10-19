# polydim-cla/deepseek-r1-7b-pmtp

## Resumen

`polydim-cla/deepseek-r1-7b-pmtp` es un artefacto derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B` publicado por el repositorio POLYDIM / POLYDIM-EINSOF (autor: Ariel García Traba, investigación independiente). No es un modelo entrenado desde cero ni un fine-tuning convencional: la model card describe un «adaptador» geométrico que proyecta el espacio de representación del modelo base (d_model = 3584) sobre una variedad de Stiefel St(3584, 2048) dentro de S^2047, es decir, una matriz de 2048 vectores ortonormales de dimensión 3584, inyectada en la capa 16. El prefijo PMTP hace referencia a un supuesto mecanismo de comunicación entre procesos («Zero-Worm IPC» sobre `PmtpShmBus`) que, según el autor, transporta tensores directamente sin serializar tokens de texto.

La relevancia del artefacto es más metodológica que de rendimiento: propone un marco de intervención sobre las activaciones internas de un transformer denso de 7B en lugar de modificar pesos de forma masiva. El repositorio ocupa solo 0,2 GB, muy por debajo de los aproximadamente 15 GB que requeriría un checkpoint completo de 7B en FP16, lo que sugiere que contiene únicamente el delta o los tensores del adaptador y depende del modelo base para funcionar.

Conviene tratarlo con cautela: la ficha no incluye resultados de evaluación, no declara idiomas, no tiene pipeline asignado y registra 0 descargas y 0 «likes» en el momento de la consulta. Las afirmaciones sobre «telepatía de tensores» y comunicación sin tokens no van acompañadas de código, trazas ni métricas verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base DeepSeek-R1-Distill-Qwen-7B) con adaptador geométrico sobre variedad de Stiefel St(3584, 2048) inyectado en la capa 16 |
| Parametros totales | 7,6 B en el modelo base; el tamaño del adaptador no se detalla (el repo completo ocupa 0,2 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors. El modelo base está disponible en GGUF a través de la etiqueta Ollama `deepseek-r1:7b` |
| Idiomas soportados | no disponible en la ficha del autor (el modelo base declara soporte multilingüe: inglés, chino y otros) |
| Licencia | apache-2.0 (declarada por el autor); la licencia del modelo base debe verificarse por separado |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Qwen2.5, con d_model = 3584 y 7,6 B de parámetros, destilado por DeepSeek a partir de R1 para razonamiento paso a paso. Sobre esa base, el autor declara una intervención en la capa 16: una proyección a una variedad de Stiefel St(3584, 2048) sobre la esfera S^2047, con dimensión canónica reducida de 3584 a 2048. El «defecto de Frobenius de Stiefel» reportado es 3,919e+01, calculado con un acumulador de Neumaier en FP64, dato que sugiere que la ortonormalidad de la matriz no es exacta y que existe un residuo numérico medido.

No se documenta el proceso de entrenamiento: no hay número de tokens, composición del dataset, ni mención a RLHF, DPO o destilación adicional en la información disponible. El componente PMTP («Zero-Worm IPC») se describe como un bus de memoria compartida (`PmtpShmBus`) que transfiere tensores entre procesos sin serializar texto, pero la ficha no incluye implementación, protocolo ni mediciones de latencia. Tampoco se especifica si el adaptador se aplica en inferencia mediante un hook, un merge de pesos o una modificación del grafo del modelo, lo que impide reproducir el comportamiento descrito solo con los datos de la model card.

## Capacidades

- Generación de texto y razonamiento encadenado: heredadas del modelo base, orientado a problemas de matemáticas y lógica con cadenas de pensamiento largas.
- Generación y explicación de código: el modelo base está entrenado con corpus de código y resolución de problemas de programación.
- Matemáticas: el linaje DeepSeek-R1-Distill destaca en problemas tipo competición (AIME, MATH), aunque no hay evaluación publicada de esta variante.
- Modo «thinking»: el modelo base emite bloques de razonamiento explícitos antes de la respuesta final.
- Capacidades multilingües: presumibles por el modelo base; no declaradas ni verificadas para este artefacto.
- Tool calling / function calling: no documentado en esta ficha.
- Comportamiento agéntico y multi-step: no documentado ni evaluado en esta variante.
- Capacidad específica declarada: proyección geométrica del espacio latente y transporte de tensores entre procesos vía `PmtpShmBus`.

## Casos de uso

- Investigación sobre interpretabilidad y geometría del espacio latente: el artefacto sirve como banco de pruebas para estudiar qué ocurre al proyectar las activaciones de la capa 16 sobre una subvariedad ortonormal de dimensión 2048, comparando la perplejidad y la calidad de razonamiento frente al modelo base sin adaptador.
- Reproducción de experimentos con variedades de Stiefel: validar el defecto de Frobenius declarado (3,919e+01) y evaluar el impacto del error de ortonormalidad en la estabilidad numérica de la inferencia.
- Estudio de sistemas IPC de alto rendimiento para inferencia distribuida: si el bus `PmtpShmBus` se publica, podría medirse el coste de transferir tensores frente a serializar tokens, aunque hoy no hay datos al respecto.
- Razonamiento matemático por pasos en entornos controlados: usando el modelo base como referencia, esta variante puede emplearse en pipelines de resolución de problemas con verificación posterior de la respuesta.
- Generación de código asistida con revisión humana: el linaje Qwen2.5-7B permite autocompletado y explicación de fragmentos, adecuado para prototipos internos más que para producción sin evaluación.
- Docencia y divulgación: como ejemplo didáctico de intervención sobre activaciones internas frente a fine-tuning clásico, útil en cursos de arquitecturas transformer.
- Base para experimentos de destilación o merging: al ocupar 0,2 GB, es ligero de versionar y comparar contra otras variantes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MATH-500, GPQA ni ninguna otra métrica, y tampoco se reporta comparación con el modelo base sin adaptador, por lo que no es posible cuantificar el efecto de la proyección de Stiefel sobre la calidad de salida.

## Requisitos de hardware

- VRAM estimada para el modelo base completo: ~15,2 GB en FP16/BF16, ~8 GB en cuantización de 8 bits y ~4,5-5 GB en 4 bits (Q4_K_M), sin contar la caché KV.
- Caché KV: no disponible para esta variante; en el modelo base, con atención GQA, un contexto de 32.000 tokens en FP16 ronda 1,5-2 GB adicionales (estimación a partir de la configuración del base).
- Adaptador: el repositorio de 0,2 GB es ligero, pero requiere cargar el modelo base completo, por lo que no reduce los requisitos de memoria.
- GPU recomendadas: A100 40 GB u H100 para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 a contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs de 8 GB en adelante solo con cuantización de 4 bits.
- Despliegue: vLLM o TGI para FP16 en servidor; llama.cpp u Ollama para cuantizado (la etiqueta `deepseek-r1:7b` corresponde al modelo base, no al adaptador). El adaptador, al no documentarse el mecanismo de carga, requiere presumiblemente código específico del repositorio POLYDIM_EINSOF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polydim-cla/deepseek-r1-7b-pmtp | 7,6 B (base) + adaptador de tamano no especificado | no disponible | Ninguna | apache-2.0 | HuggingFace, 0 descargas, repo de 0,2 GB |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B | no disponible en esta busqueda (consultar ficha del base) | Si, en la model card del modelo base | Ver licencia del modelo base | HuggingFace, ampliamente descargado |
| Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta busqueda | Si, en su model card | Apache 2.0 (verificar) | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8 B | no disponible en esta busqueda | Si, en la model card del modelo base | Ver licencia del modelo base | HuggingFace |

La diferencia práctica frente a las alternativas no está en parámetros ni en contexto, sino en la intervención geométrica y en la ausencia total de evaluación publicada, lo que impide afirmar que iguale o supere al modelo base en cualquier tarea.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni métricas de perplejidad antes y después de la proyección.
- Mensaje de la ficha no verificado: conceptos como «Zero-Worm IPC», «telepatía de tensores» o «0 tokens serializados» no van acompañados de código, especificación de protocolo ni mediciones reproducibles.
- Defecto de Frobenius declarado de 3,919e+01: indica que la matriz no es exactamente ortonormal; el impacto de ese residuo sobre la salida no se analiza.
- Repositorio incompleto para uso autónomo: 0,2 GB frente a los ~15 GB de un checkpoint de 7B en FP16, por lo que el artefacto no es utilizable sin el modelo base y sin el código de carga.
- Idiomas no declarados: no se puede asumir cobertura multilingüe sin verificación, aunque el linaje Qwen2.5 la sugiera.
- Riesgo de alucinación: el heredado del modelo base (especialmente en razonamiento matemático y citas factuales) no se mitiga ni se mide en esta variante; los bloques de pensamiento largo pueden amplificar errores arrastrados.
- Licencia: el autor declara apache-2.0, pero el uso comercial exige comprobar también los términos de `DeepSeek-R1-Distill-Qwen-7B` y de Qwen2.5; la cadena de licencias no se aclara en la ficha.
- Madurez: 0 descargas, 0 «likes», creado y actualizado el mismo día (18-10-2026), sin pipeline asignado ni issues públicos; no hay evidencia de mantenimiento.
- Sesgos: no documentados para esta variante; los del modelo base (datos web, predominio del inglés y el chino) se heredan sin mitigación conocida.
- No apto para producción sin una evaluación propia previa: la carga del adaptador, su compatibilidad con vLLM/llama.cpp y su comportamiento con tool calling son desconocidos.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/polydim-cla/deepseek-r1-7b-pmtp
- Repositorio del autor (POLYDIM-EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Etiqueta Ollama del modelo base: https://ollama.com/library/deepseek-r1
- Paper, blog o demo del adaptador: no disponible en la informacion proporcionada
