# believe-it-or-not/0524_original_augmented_original_augmented_synth_doc_prefix_warning_pkc_fda_approval-3beb22d2

## Resumen

El repositorio `believe-it-or-not/0524_original_augmented_original_augmented_synth_doc_prefix_warning_pkc_fda_approval-3beb22d2` contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de aproximadamente 1,7 GB que debe cargarse junto con el modelo base para poder utilizarse. El autor identificado es el usuario de Hugging Face `believe-it-or-not`, sin que la model card aporte informacion sobre la organizacion, el equipo o el financiador del trabajo.

El nombre del repositorio sugiere un experimento de ajuste fino orientado a un comportamiento concreto: la generacion de documentos sinteticos con un prefijo de advertencia y la mencion a la aprobacion de la FDA (PKC, probablemente protein kinase C, en un contexto biomedico o farmaceutico). No obstante, esta interpretacion es una inferencia a partir del identificador y no esta confirmada por ninguna documentacion oficial, ya que la model card es una plantilla sin rellenar en la practica totalidad de sus secciones.

La relevancia de esta ficha es fundamentalmente metodologica: sirve como ejemplo de adaptador LoRA de bajo perfil publicado sin documentacion, sin licencia declarada y sin evaluacion. Cualquier uso en produccion exige una auditoria previa del dataset de entrenamiento, del comportamiento inducido y de las condiciones legales, ninguna de las cuales esta disponible en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre un transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 70 mil millones) |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible para el adaptador (el modelo base soporta 128 000 tokens segun su especificacion oficial) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA compatible con la libreria PEFT en su version 0.15.1, segun declara la propia model card en su seccion de versiones del framework. El modelo base es `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instruct de Llama 3.3 de 70 000 millones de parametros con arquitectura transformer decoder-only, atencion con RoPE y contexto extendido. El adaptador modifica un subconjunto de las matrices de proyeccion del modelo base mediante descomposiciones de bajo rango, lo que explica que el repositorio ocupe solo 1,7 GB frente a los aproximadamente 140 GB en bf16 del modelo completo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, la existencia de RLHF o DPO, ni los hiperparametros del ajuste fino. La model card incluye la plantilla estandar de Hugging Face con marcadores `[More Information Needed]` en todas las secciones relevantes (datos, procedimiento, hiperparametros, evaluacion, impacto ambiental y especificaciones tecnicas). El unico dato tecnico verificable, ademas del modelo base y la version de PEFT, es la referencia al paper de Lacoste et al. (2019) sobre estimacion de emisiones, que aparece como texto residual de la plantilla y no como resultado de un analisis propio.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct, en la medida en que el adaptador no los degrade.
- Ajuste orientado, segun el identificador del repositorio, a la generacion de documentos sinteticos con prefijo de advertencia y mencion a la aprobacion de la FDA.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base lo soporta, pero el ajuste fino puede alterar este comportamiento.
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador.
- Capacidades multilingues: no disponibles; el modelo base es multilingue, pero no hay evaluacion del adaptador por idioma.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Auditoria de adaptadores LoRA: el caso de uso mas realista es el estudio del propio artefacto como ejemplo de ajuste fino no documentado, comparando las salidas del adaptador con las del modelo base para detectar derivas de comportamiento.
- Generacion controlada de documentos sinteticos en dominio biomedico: si el ajuste funciona como sugiere el nombre, podria emplearse para producir borradores de documentacion regulatoria con advertencias explicitas, siempre que un experto valide cada salida.
- Investigacion sobre sesgos inducidos por ajuste fino: el adaptador permite estudiar como un entrenamiento breve sobre un dominio concreto (aprobacion FDA, PKC) modifica la distribucion de respuestas del modelo base.
- Pruebas de regresion de pipelines PEFT: util como caso de prueba para verificar que un stack de despliegue (vLLM con soporte LoRA, TGI o transformers + peft) carga correctamente adaptadores de ~1,7 GB sobre modelos de 70B.
- Experimentos de alineacion y seguridad: analisis de como un prefijo de advertencia aprendido afecta a la probabilidad de que el modelo emita avisos antes de contenido sensible.
- Docencia y formacion tecnica: ejemplo practico de publicacion de un adaptador con model card incompleta, util para ensenar buenas practicas de documentacion y licenciamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar el modelo base Llama 3.3 70B, lo que en bf16 exige aproximadamente 140 GB de VRAM o de memoria unificada.
- En cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4) el modelo base ocupa del orden de 35-40 GB, mas el adaptador y el overhead del runtime; esto exige una GPU de 48 GB (A6000, L40S, A100 80 GB) o varias GPU consumer.
- En cuantizacion de 8 bits el requisito ronda los 70-75 GB, lo que encaja en una A100 80 GB o H100 80 GB.
- No cabe en una GPU consumer individual de 24 GB (RTX 4090, 3090) ni siquiera en 4 bits con contexto largo; seria necesario repartir capas entre varias GPU o usar memoria unificada en Apple Silicon de gama alta.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA, TGI, y transformers + peft para experimentacion. llama.cpp y Ollama requieren convertir el adaptador a GGUF y fusionarlo o cargarlo como LoRA compatible.
- Latencia y throughput: no disponibles para el adaptador; dependen enteramente del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | Adaptador LoRA (~1,7 GB) | No disponible (base: 128k) | No disponible | Safetensors PEFT | Practicamente inexistente |
| Llama 3.3 70B Instruct (modelo base) | 70B | 128k | Llama 3.3 Community License | Safetensors, GGUF | Completa, con benchmarks |
| Adaptadores LoRA publicos tipicos en Hugging Face | Variable (decenas a cientos de MB) | Heredado del base | Habitualmente la del base | Safetensors PEFT | Variable, a menudo escasa |
| Mistral Large o Qwen 2.5 72B Instruct | ~70-123B | 32k-128k | Licencias propias | Safetensors, GGUF | Completa, con benchmarks |

La comparacion relevante no es frente a otro modelo completo, sino frente al modelo base sin ajustar y frente a adaptadores LoRA mejor documentados. En ese sentido, este artefacto carece de la informacion minima (licencia, datos, evaluacion) que si acompania a las alternativas citadas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, el adaptador hereda las restricciones de la Llama 3.3 Community License del modelo base, pero la ausencia de declaracion explicita es un riesgo legal.
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede descartarse la presencia de datos sesgados, protegidos o de baja calidad que hayan inducido comportamientos no deseados.
- El ajuste fino sobre un dominio tan especifico (aprobacion FDA, PKC) puede degradar capacidades generales del modelo base, incluido el razonamiento, el codigo o el multilingueismo, sin que exista evaluacion que lo cuantifique.
- Riesgo elevado de alucinacion en el dominio biomedico y regulatorio: un modelo que genera documentos con menciones a aprobaciones de la FDA puede producir afirmaciones falsas con apariencia de veracidad.
- El identificador del repositorio sugiere un experimento automatizado de generacion de variantes de datos; esto es coherente con un artefacto de investigacion no destinado a produccion.
- No hay garantia de que el adaptador cargue correctamente con versiones de PEFT distintas de la 0.15.1 declarada.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- Para cualquier uso en produccion seria imprescindible auditar el adaptador, evaluar su comportamiento frente al modelo base y obtener asesoramiento legal sobre la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_original_augmented_synth_doc_prefix_warning_pkc_fda_approval-3beb22d2
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de estimacion de emisiones citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
