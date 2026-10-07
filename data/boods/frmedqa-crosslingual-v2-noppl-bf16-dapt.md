# boods/FrMedQA-CrossLingual-v2-NoPPL-bf16-DAPT

## Resumen

FrMedQA-CrossLingual-v2-NoPPL-bf16-DAPT es un fine-tune del modelo denso Qwen3-14B, publicado en HuggingFace por el usuario "boods" bajo licencia Apache 2.0. El repositorio se etiqueta como `transformers`, `safetensors`, `text-generation-inference`, `unsloth`, `qwen3` y `trl`, y declara como modelo base `unsloth/Qwen3-14B`, una redistribución del Qwen3-14B oficial preparada por Unsloth para entrenamiento optimizado. El nombre del modelo sugiere un ajuste orientado a preguntas y respuestas medicas en frances con evaluacion cruzada entre idiomas ("FrMedQA-CrossLingual"), con una fase de preentrenamiento adaptativo al dominio ("DAPT") y un ajuste final en bf16.

El modelo hereda del Qwen3-14B su arquitectura transformer densa, su ventana de contexto y su tokenizador multilingue, por lo que tecnicamente es capaz de generar texto y razonar en muchos idiomas, aunque la model card solo declara ingles (`language: en`) y el autor no documenta que idiomas cubre realmente el ajuste. Se trata, por tanto, de una publicacion con documentacion minima: no incluye resultados de benchmarks, no describe el dataset de entrenamiento ni el procedimiento de ajuste mas alla de indicar que se uso Unsloth.

Su relevancia actual es limitada pero concreta: es un ejemplo tipico de fine-tune de dominio publico sobre un modelo abierto de 14B de la familia Qwen3, util para quien quiera inspeccionar o reproducir un pipeline de ajuste medico con Unsloth o TRL. La ausencia de descargas, likes, benchmarks y de una model card detallada implica que debe tratarse como un artefacto experimental, no como un modelo listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B); no detallada en la model card |
| Parametros totales | no disponible en la model card (el modelo base Qwen3-14B tiene aproximadamente 14.800 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base) |
| Tipos de cuantizacion | no disponible; el nombre del repositorio indica pesos en bf16 |
| Idiomas soportados | la model card declara unicamente `en`; el nombre del modelo y su modelo base sugieren capacidades multilingues, no confirmadas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura especifica de este fine-tune mas alla de lo que se deduce del modelo base. El repositorio declara `base_model: unsloth/Qwen3-14B`, etiquetas de `unsloth` y `trl`, y un entrenamiento en bf16, lo que es coherente con un ajuste supervisado (SFT) o un ajuste con adaptadores de bajo rango sobre el modelo base. El sufijo "DAPT" del nombre hace referencia a *domain-adaptive pretraining*, es decir, una fase de preentrenamiento adaptativo al dominio previa o posterior al ajuste instruccional, aunque el autor no documenta ni el corpus utilizado, ni el numero de tokens, ni si hubo fases de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas propias: no hay mencion a decodificacion especulativa, atencion lineal, modos de razonamiento explicitos ni a tecnicas de mezcla de expertos. La unica innovacion operativa declarada es el uso de Unsloth, que el autor afirma que permitio entrenar "2x mas rapido" que un pipeline convencional. No hay informacion sobre composicion del dataset, filtrado de datos, tokenizador modificado ni estrategia de enmascarado de perdida (el sufijo "NoPPL" podria indicar que no se usa perplejidad como criterio de seleccion, pero esto no esta confirmado en la documentacion).

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del modelo base Qwen3-14B.
- Razonamiento y matematicas: el modelo base es competente en tareas de razonamiento de varios pasos, aunque no hay evaluacion especifica de este fine-tune.
- Codigo: capacidad heredada del modelo base; no hay evidencia de que el ajuste la haya preservado o degradado.
- Preguntas y respuestas sobre dominio medico: presumiblemente el objetivo del ajuste segun el nombre del repositorio, sin confirmacion documental.
- Capacidad multilingue: no confirmada. La model card solo declara ingles, pese a que el nombre del modelo menciona un escenario "cross-lingual".
- Tool calling / function calling: no documentado en este repositorio; el modelo base lo soporta, pero no hay garantia de que el ajuste lo preserve.
- Modo de razonamiento explicito ("thinking mode"): no documentado en este repositorio.
- Vision y audio: no soportados (el modelo base Qwen3-14B es exclusivamente de texto).

## Casos de uso

- Investigacion academica en QA medico multilingue: el modelo puede utilizarse como punto de partida reproducible para estudiar tecnicas de preentrenamiento adaptativo al dominio (DAPT) sobre corpora medicos, comparando su comportamiento con el Qwen3-14B sin ajustar.
- Reproduccion de pipelines de ajuste: dado que se entreno con Unsloth y TRL, sirve como artefacto de referencia para validar recetas de fine-tuning eficiente sobre modelos de 14B en una sola GPU o en configuraciones con memoria limitada.
- Prototipado de asistentes de preguntas frecuentes sanitarias: en un entorno controlado y con revision humana, se podria usar para generar borradores de respuestas a preguntas medicas generales, siempre con validacion por personal clinico.
- Generacion de conjuntos de datos sinteticos de dominio medico: el modelo puede emplearse para producir preguntas y respuestas de entrenamiento en frances o ingles, que despues se filtran y validan manualmente antes de usarse en otros pipelines.
- Evaluacion de transferencia cross-lingual: si finalmente se confirma su comportamiento multilingue, permitiria medir hasta que punto un ajuste sobre un dominio en un idioma mejora el rendimiento en otro, un experimento habitual en investigacion de NLP clinico.
- Extraccion y resumen de informacion a partir de textos medicos largos: usando la ventana de contexto heredada del modelo base, se podrian resumir historiales o articulos, aunque este uso requiere verificacion factual estricta.
- Integracion como servicio de inferencia compatible con TGI: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse detras de una API compatible con los endpoints de HuggingFace para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MedQA ni ningun otro conjunto de evaluacion, y tampoco se han encontrado resultados en la busqueda web. Cualquier cifra de rendimiento atribuida a este modelo seria una extrapolacion del modelo base y no una medicion del fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 14.800 millones de parametros, las estimaciones orientativas son de unos 28-30 GB en bf16/fp16, alrededor de 15 GB en cuantizacion de 8 bits y en torno a 9-10 GB en cuantizacion de 4 bits (GGUF Q4_K_M).
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 40/80 GB o L40S 48 GB para inferencia en bf16 sin cuantizar.
- GPU de consumo: en bf16 no cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) sin cuantizacion u offloading; con cuantizacion de 4 bits puede caber en una RTX 4090, RTX 3090, RTX 4080 (16 GB) de forma ajustada y en tarjetas de 12-16 GB con contexto reducido.
- Opciones de despliegue: vLLM y TGI para inferencia en bf16 o fp8 en servidor; llama.cpp u Ollama para cuantizaciones GGUF en local; transformers con `accelerate` para experimentacion.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia.
- Nota importante: el tamano reportado del repositorio es de 0,5 GB, cifra incompatible con un modelo completo de 14B en bf16 (que ocuparia alrededor de 28 GB). Es posible que el repositorio contenga unicamente adaptadores, una subida parcial o que el dato de la API de HuggingFace sea inexacto; conviene verificar el contenido real antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| FrMedQA-CrossLingual-v2-NoPPL-bf16-DAPT (este modelo) | no disponible en la model card | no disponible | apache-2.0 | HuggingFace, 0 descargas | no disponible |
| unsloth/Qwen3-14B (modelo base) | aproximadamente 14.800 millones (denso) | no disponible en esta busqueda | apache-2.0 | HuggingFace | no disponible en esta busqueda |
| Alternativas de la misma categoria (por ejemplo, otros fine-tunes medicos de 12-14B sobre Qwen o Llama) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar el rendimiento de este modelo con alternativas equivalentes. Cualquier comparacion cuantitativa requeriria ejecutar los mismos benchmarks sobre cada modelo.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas.
- Riesgo alto de alucinacion en dominio medico: no hay evidencia de evaluacion clinica, y el modelo base no esta especializado en medicina. No debe usarse para diagnostico, triaje ni consejo medico sin supervision profesional.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste, no es posible evaluar sesgos demograficos, geograficos o linguisticos.
- Cobertura idiomatica incierta: la model card declara solo ingles pese al nombre "CrossLingual" y a la referencia al frances, lo que genera ambiguedad sobre el idioma real de entrenamiento.
- Limitaciones de contexto: no se especifica la ventana de contexto efectiva del fine-tune; aunque el modelo base soporta ventanas amplias, el ajuste podria haber reducido su comportamiento en contextos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-14B tiene sus propias condiciones que conviene revisar y respetar.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin mantenimiento ni issues resueltos por el autor.
- Inconsistencia en el tamano del repositorio: 0,5 GB reportados frente a los aproximadamente 28 GB esperables para pesos bf16 completos; verificar el contenido antes de usarlo.
- Ausencia de cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ oficiales en el repositorio.
- Resultados de busqueda web no utilizables: las consultas devolvieron unicamente paginas de credenciales compartidas y contenido no relacionado con el modelo, por lo que no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-bf16-DAPT
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo especificos del modelo: no disponible
- Resultados de benchmarks publicados: no disponible
- Enlaces adicionales relevantes encontrados en la busqueda web: no disponible (los resultados obtenidos no guardan relacion con el modelo)
