# musiccat0405/gemma-3-1b-it-heretic-extreme-uncensored-abliterated

## Resumen

Este modelo es un ajuste fino del modelo oficial `google/gemma-3-1b-it` de Google, publicado por el usuario `musiccat0405` bajo el identificador `gemma-3-1b-it-heretic-extreme-uncensored-abliterated`. No se trata de un reentrenamiento desde cero ni de un modelo nuevo, sino de una modificación de pesos ("abliteration") realizada con la herramienta Heretic v1.0.1, cuyo objetivo es eliminar la tendencia del modelo base a rechazar peticiones. Segun la model card, la tasa de rechazo baja de 99/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0.33.

El modelo conserva la arquitectura y el tamano del Gemma 3 1B-IT: aproximadamente 999.885.952 parametros y una ventana de contexto de 32.000 tokens (32k). Es, por tanto, un modelo denso de ~1B parametros, pensado para generacion de texto y conversacion en entornos con recursos limitados, y no incorpora vision ni audio, a diferencia de las variantes mayores de la familia Gemma 3.

Su relevancia es de nicho: resulta util para quienes necesitan un modelo pequeno y permisivo que genere contenido que el Gemma 3 1B-IT original rechazaria (ficcion explicita, lenguaje soez, tematicas controvertidas), manteniendo un nivel de degradacion relativamente bajo. La contrapartida es la ausencia total de informacion sobre licencia, idiomas y datos de entrenamiento en el repositorio, ademas de la falta de benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (heredada de Gemma 3 1B-IT); no disponible en detalle en la model card |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (32k, valor por defecto indicado por el autor) |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en safetensors); la model card menciona GGUF de forma generica para el ecosistema DavidAU |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer denso de tipo decoder-only perteneciente a la familia Gemma 3 de Google. El repositorio no aporta detalles propios sobre la arquitectura interna ni sobre el dataset de entrenamiento del modelo base; toda la informacion tecnica disponible en la model card se centra en el proceso de abliteracion.

El unico "entrenamiento" descrito es el proceso de abliteracion aplicado con Heretic v1.0.1, una herramienta que busca por prueba y error la configuracion optima para eliminar la direccion de rechazo del modelo, evaluando simultaneamente dos metricas: la tasa de rechazo (objetivo: cercana a 0) y la divergencia KL respecto al modelo original (objetivo: cercana a 0 para no "danar" el modelo). En este caso el autor prioriza explicitamente la tasa de rechazo sobre la divergencia KL: obtiene 3/100 rechazos con una KL de 0.33, frente a la variante alternativa del mismo autor (`DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored`) que logra 17/100 rechazos con una KL de 0.09. No se mencionan fases de RLHF, DPO ni ningun otro ajuste adicional sobre el modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta ajustado para instrucciones (variante IT) y mantiene ese formato.
- Reduccion drastica de rechazos: segun la model card, la tasa de rechazo es de 3/100 frente a 99/100 del Gemma 3 1B-IT original.
- Generacion de contenido explicito y lenguaje soez: el autor indica que el modelo no rechaza estas peticiones, aunque en ocasiones requiere instrucciones explicitas (por ejemplo, indicar que use "slang" o terminos concretos) para alcanzar el nivel grafico o explicito esperado.
- Contexto de 32k tokens: permite conversaciones multi-turno largas o procesamiento de documentos moderadamente extensos.
- Capacidades del modelo base (razonamiento, codigo, matematicas basicas, tool calling): no se documentan en este repositorio; cabe esperar un rendimiento similar al de Gemma 3 1B-IT, pero no se aportan datos que lo confirmen.
- Capacidades especiales (modo thinking, vision, audio, agentes): no disponible.

## Casos de uso

- Generacion de ficcion sin restricciones: escritura de relatos de terror, drama o contenido adulto donde el Gemma 3 1B-IT original rechazaria la peticion; adecuado por su baja tasa de rechazo y su tamano reducido.
- Creacion de personajes y roleplay en entornos como Silly Tavern o KoboldCpp: el autor recomienda ajustar el parametro de suavizado (smoothing) a 1.5 y subir la penalizacion por repeticion a 1.1-1.15 para conversaciones mas coherentes.
- Prototipado rapido de chatbots en local: con ~1B parametros cabe en cualquier GPU de consumo e incluso en CPU, lo que permite iterar sin coste de API.
- Pruebas de seguridad y red-teaming: util para estudiar como se comporta un modelo sin mecanismos de rechazo y que tipo de contenido genera ante peticiones sensibles.
- Generacion de texto creativo con vocabulario controlado: el autor indica que se puede dirigir el registro linguistico incluyendo listas de palabras concretas en el prompt.
- Experimentacion con tecnicas de abliteracion: sirve como caso de estudio de la relacion entre tasa de rechazo y divergencia KL en modelos pequenos.
- Despliegue en hardware muy limitado (portatiles, dispositivos de borde): el tamano de ~1 GB en precision reducida lo hace viable donde modelos mayores no caben.
- Investigacion sobre alineacion y censura: permite comparar el comportamiento del modelo abliterado frente a su base original con la misma arquitectura y pesos casi identicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la del proceso de abliteracion:

| Metrica | Modelo original (Gemma 3 1B-IT) | Este modelo | Variante DavidAU |
|---|---|---|---|
| Tasa de rechazo (refusals) | 99/100 | 3/100 | 17/100 |
| Divergencia KL | - (referencia 0) | 0.33 | 0.09 |

El autor indica que valores de KL inferiores a 1 son aceptables en general, pero que en modelos pequenos conviene acercarse a 0; cifras por debajo de 0.3 se consideran ideales para no degradar el modelo. En este caso se prioriza la tasa de rechazo sobre la calidad, lo que implica mayor degradacion que la variante alternativa.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): en torno a 2 GB, coherente con el tamano del repositorio (2,0 GB).
- VRAM estimada en cuantizacion Q4: aproximadamente 0,7-1 GB (no se publican cuantizaciones propias en el repositorio).
- GPU recomendadas: cualquier GPU con 2-3 GB de VRAM o mas; por ejemplo RTX 3060, RTX 4060, RTX 4090 (sobradamente), A100 o H100 (no necesarias, pero compatibles).
- GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo moderna e incluso en muchas integradas.
- CPU: viable, dado el tamano de ~1B parametros.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repo esta marcado como `endpoints_compatible`), llama.cpp/Ollama mediante conversion a GGUF, y otras plataformas que acepten safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (musiccat0405/gemma-3-1b-it-heretic-extreme-uncensored-abliterated) | ~1B | 32k | 3/100 | no disponible | HuggingFace |
| google/gemma-3-1b-it (base) | ~1B | 32k | 99/100 | Gemma Terms of Use (segun el modelo base) | HuggingFace |
| DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored | ~1B | 32k (asumido del base) | 17/100 | no disponible en la informacion proporcionada | HuggingFace |
| Llama 3.2 1B Instruct | ~1B | 128k (no confirmado en la informacion disponible) | no disponible | Llama Community License | HuggingFace / Meta |

La comparativa con alternativas de otros fabricantes no puede completarse con los datos aportados; se incluye Llama 3.2 1B Instruct como referencia de tamano similar, pero sin datos de rendimiento verificados en la informacion disponible.

## Limitaciones y advertencias

- No se especifica licencia: al ser un derivado de `google/gemma-3-1b-it`, es probable que apliquen los terminos de uso de Gemma, pero el repositorio no lo aclara. Antes de cualquier uso comercial, conviene verificar la licencia del modelo base.
- Divergencia KL de 0.33: aunque dentro de rangos tolerables, el autor reconoce que la calidad puede estar mas degradada que en su variante alternativa (KL 0.09). Es esperable cierto "dano" en la coherencia respecto al modelo original.
- Riesgo de alucinacion: inherente a un modelo de ~1B parametros; no se documenta mitigacion especifica.
- Necesidad de direccion en el prompt: la model card advierte que, aunque el modelo no rechaza, en algunos casos el contenido generado puede resultar "soso" si no se le indica explicitamente el tono o el vocabulario deseado.
- Idiomas: no declarados. Se desconoce si conserva el soporte multilingue del modelo base.
- Sesgos: no se documentan evaluaciones de sesgo. Al eliminar los rechazos, es probable que afloren sesgos y contenido problematico que el modelo original filtraba.
- Uso responsable: el modelo esta disenado para evadir mecanismos de seguridad; su uso puede generar contenido ofensivo, explicito o danino. No es adecuado para produccion orientada a usuario final sin moderacion.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval u otras pruebas que permitan estimar su rendimiento real en tareas generales.
- Sin descargas ni likes ni fecha de creacion reciente: el repositorio (creado el 2026-10-04 segun los metadatos) no tiene historial de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/musiccat0405/gemma-3-1b-it-heretic-extreme-uncensored-abliterated
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Heretic (herramienta de abliteracion), repositorio oficial: https://github.com/p-e-w/heretic
- Variante alternativa citada por el autor: https://huggingface.co/DavidAU/gemma-3-1b-it-heretic-abliterated-uncensored
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Documentacion sobre activacion de expertos en modelos MoE (referenciada de forma generica): https://huggingface.co/DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts
- Coleccion de archivos fuente del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
