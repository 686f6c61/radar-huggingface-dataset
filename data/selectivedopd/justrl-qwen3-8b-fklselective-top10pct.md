# SelectiveDOPD/JustRL-Qwen3-8b-FKLSelective-Top10pct

## Resumen

JustRL-Qwen3-8b-FKLSelective-Top10pct es un ajuste fino del modelo base Qwen3-8B, publicado por el usuario SelectiveDOPD en HuggingFace. El nombre del repositorio y la nota de la model card indican que procede del experimento interno `justrl_qwen3_8b_fkl_rel_90_100`, dentro de una línea de trabajo denominada BiDirect-OPD, y que la rama `main` corresponde al checkpoint `global_step_300` de un entrenamiento por refuerzo (RL) o destilación sobre política. No se trata de un modelo nuevo entrenado desde cero, sino de una variante experimental de Qwen3-8B.

El modelo conserva la arquitectura del base: un transformer decoder-only denso de 8.190.735.360 parámetros (8,19 mil millones), con pesos almacenados en safetensors y un repositorio de 16,4 GB, coherente con precisión BF16. Al ser un modelo denso, no hay parámetros activos diferenciados ni enrutamiento MoE. La etiqueta `fkl_selective_top10pct` sugiere que el procedimiento de entrenamiento aplica una divergencia KL forward sobre un subconjunto selectivo (el 10 % superior) de tokens o muestras, aunque la model card no documenta el método con detalle.

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: el repositorio acumula 0 descargas y 0 "me gusta" en el momento de la consulta, no declara licencia, no publica idiomas soportados ni resultados de evaluación, y no incluye documentación del proceso de entrenamiento más allá de la lista de checkpoints intermedios. Es, por tanto, un artefacto de investigación útil para reproducir o auditar experimentos de RL/destilación sobre Qwen3-8B, pero no un modelo listo para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-8B documenta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponibles; el repositorio solo publica pesos safetensors en precision completa (16,4 GB) |
| Idiomas soportados | No disponible en la model card; se heredan del base Qwen3-8B, que declara soporte de mas de 100 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de las etiquetas `qwen3` y `transformers`, por lo que la unica informacion tecnica fiable es la que se deduce del recuento real de parametros (8.190.735.360) y del tamano del repositorio (16,4 GB, consistente con pesos BF16). Se trata, por tanto, de un transformer decoder-only denso con atencion por consultas agrupadas (GQA) y mecanismo de atencion completo en todas las capas, sin componentes MoE, SSM ni hibridos. No hay evidencia de modificaciones estructurales respecto a Qwen3-8B base.

Respecto al entrenamiento, la model card solo indica que el modelo se subio desde la ejecucion `justrl_qwen3_8b_fkl_rel_90_100` en los experimentos BiDirect-OPD, y que la rama `main` contiene el `global_step_300`. Existen ramas de checkpoints anteriores cada 20 pasos (`global_step_20` hasta `global_step_280`). El sufijo `FKLSelective-Top10pct` apunta a un objetivo de divergencia KL forward aplicado de forma selectiva sobre el 10 % de mayor relevancia, y el prefijo `JustRL` a un entrenamiento con refuerzo; sin embargo, no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o destilacion on-policy. No se documenta ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva y conversacional, segun los tags `text-generation` y `conversational`.
- Razonamiento y matematicas: capacidades heredadas del base Qwen3-8B, sin evaluacion publicada especifica para este ajuste.
- Generacion de codigo: previsiblemente heredada del base, no verificada en este repositorio.
- Capacidad de modo "thinking": Qwen3-8B base soporta modos de razonamiento extendido, pero la model card no confirma que este ajuste lo preserve.
- Tool calling / function calling: no documentado en la model card; el base Qwen3 lo soporta mediante plantillas de chat.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingue: no documentado en este repositorio.
- Capacidades especiales (vision, audio, thinking explicito): no disponibles.

## Casos de uso

- Investigacion en RL y destilacion sobre LLM: el repositorio incluye 15 checkpoints (de `global_step_20` a `global_step_300`) que permiten estudiar la evolucion de las capacidades del modelo durante el entrenamiento y comparar trayectorias con el modelo base congelado.
- Ablacion de objetivos de divergencia: el sufijo `Top10pct` y `FKL` lo convierten en una pieza util para comparar tecnicas de destilacion selectiva frente a variantes no selectivas del mismo autor.
- Generacion de texto controlada en entornos de laboratorio: puede desplegarse con la plantilla de chat de Qwen3 para tareas de resumen o reescritura, siempre que se valide antes la calidad del ajuste.
- Linea base para experimentos internos de ajuste: al partir de Qwen3-8B, puede reutilizarse como punto de partida de nuevos ciclos de RL o SFT con infraestructura ya preparada para ese tamano.
- Analisis de degradacion por sobreoptimizacion: util para medir perdida de capacidades generales (olvido catastrofico) tras 300 pasos de entrenamiento con refuerzo.
- Despliegue de bajo coste si se cuantiza: con 8,19 B de parametros, una conversion a 4 bits permitiria ejecutarlo en GPU de consumo para demos o pruebas de regresion, aunque las conversiones no estan publicadas y habria que generarlas.
- Docencia y divulgacion tecnica: sirve como ejemplo tangible de artefacto experimental sin evaluar, util para ilustrar por que no debe desplegarse un checkpoint de investigacion sin benchmark ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio no enlaza informes de evaluacion.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 16,4 GB de pesos mas activaciones y cache KV. En la practica requiere del orden de 20-24 GB para contexto corto.
- VRAM con cuantizacion de 8 bits: en torno a 9-10 GB de pesos, mas cache KV; viable en GPUs de 16 GB.
- VRAM con cuantizacion de 4 bits: en torno a 5-6 GB de pesos; viable en GPUs de 8-12 GB, aunque no hay conversiones oficiales publicadas (habria que generarlas con llama.cpp, AWQ o GPTQ).
- Cache KV: al ser un modelo con GQA, el coste por token es moderado, pero crece de forma aproximadamente lineal con el contexto; a 32.768 tokens puede anadir varios GB en BF16.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para BF16 con contexto corto o INT8.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con 24 GB en BF16 ajustado o INT8, y en tarjetas de 12-16 GB unicamente con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM y TGI soportan el formato safetensors de transformers; llama.cpp y Ollama requeririan una conversion previa a GGUF que no esta publicada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia de los modelos de comparacion provienen de su documentacion publica, no de la model card de este repositorio. No hay datos de rendimiento comparativo publicados.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| JustRL-Qwen3-8b-FKLSelective-Top10pct | 8,19 B | No disponible (base: 32.768 nativos, 131.072 con YaRN) | No disponible | No disponible |
| Qwen3-8B (base) | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Si, publicado por el autor del base |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 | Licencia comunitaria de Llama 3.1 | Si, publicado por Meta |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 | Apache 2.0 | Si, publicado por Mistral AI |

La ventaja practica de este ajuste frente al base no puede establecerse sin evaluacion propia. Frente a Llama 3.1 8B y Mistral 7B, su principal desventaja operativa es la ausencia de licencia declarada y de documentacion.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial. Al ser un derivado de Qwen3-8B (Apache 2.0) la redistribucion suele estar permitida, pero la ausencia de licencia explicita en este repositorio es un riesgo juridico real para produccion.
- Cero validacion externa: 0 descargas y 0 "me gusta" en el momento de la consulta implican que el modelo no ha sido reproducido ni auditado por terceros.
- Sin benchmarks: no hay ninguna metrica que permita compararlo con Qwen3-8B o con otras alternativas del mismo tamano.
- Riesgo de degradacion por RL: 300 pasos de entrenamiento con refuerzo sobre un subconjunto selectivo de tokens pueden provocar sobreoptimizacion del objetivo y olvido catastrofico de capacidades generales (redaccion, codigo, multilingue).
- Riesgo de alucinacion: inherente a cualquier LLM de 8 B de parametros, y no cuantificado en este caso.
- Idiomas no documentados: aunque el base es multilingue, el ajuste con RL puede haber sesgado la distribucion hacia el idioma dominante del dataset de entrenamiento, que no se especifica.
- Plantilla de chat no documentada: se desconoce si el modelo conserva el formato de chat de Qwen3, lo que puede degradar las respuestas en inferencia conversacional.
- Checkpoints intermedios sin justificacion: las ramas `global_step_20` a `global_step_280` se ofrecen sin indicar cual es la mejor, lo que traslada al usuario la carga de evaluarlas.
- Uso en produccion no recomendado sin evaluacion previa: no hay garantias de estabilidad, formato de salida ni seguridad de contenido.
- Sin datos de sesgos: no se ha publicado ningun analisis de sesgo demografico, politico o cultural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-8b-FKLSelective-Top10pct
- Repositorio del modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388 (referencia del modelo base)
- Paper de referencia sin publicar: no disponible
- Blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Se realizo una busqueda web asociada a esta ficha y los resultados devueltos no guardaban ninguna relacion con el modelo (contenido sobre directorios de television en arabe), por lo que no se incluye ningun enlace adicional de esa busqueda.
