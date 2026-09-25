# junbrro/egopi-axis2-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925

## Resumen

El modelo `junbrro/egopi-axis2-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925` es un checkpoint de pesos publicado por el usuario junbrro en HuggingFace el 25 de septiembre de 2026. Se trata de un modelo de lenguaje de 6.915.102.808 parametros (aproximadamente 6,92 mil millones) almacenado en formato safetensors, con un repositorio de 13,9 GB. La model card lo describe como "Arm 2 no-reg tokenizer CogAlign persistent last language", correspondiente al paso de entrenamiento 30000, derivado de la fuente `junhyeong-axis2-noreg-last-30k-260924`.

El modelo se distribuye exclusivamente como pesos finales y configuracion, sin estado de optimizador ni de generador de numeros aleatorios (RNG). Forma parte de una familia de variantes del mismo autor, entre las que se incluye una version `FULL` (`egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925`) que permite comparaciones controladas entre ambas. El tag `RLDX-1` no corresponde a ninguna arquitectura documentada publicamente, y la model card no especifica arquitectura, longitud de contexto, idiomas ni licencia.

Su relevancia actual es limitada y de caracter principalmente investigador: no tiene descargas ni likes, no se ha publicado informacion sobre su rendimiento en despliegue y el propio autor advierte que "la finalizacion del entrenamiento no establece rendimiento en rollout". Es, por tanto, un artefacto de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el tag RLDX-1 no esta documentado publicamente) |
| Parametros totales | 6.915.102.808 (aproximadamente 6,92 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni FP8; solo pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Precision aparente de los pesos | aproximadamente 2 bytes por parametro (bf16/fp16), segun la relacion entre el tamano del repo y el numero de parametros |
| Paso de entrenamiento final | 30000 |
| Variante | LAST (Arm 2, tokenizer no-reg, CogAlign) |
| Componentes adicionales | directorio `actlat/` con el tokenizer de acciones, cuando aplica |

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura interna del modelo. La model card no menciona si se trata de un transformer denso, un MoE, un modelo de espacio de estados (SSM) o una arquitectura hibrida, ni tampoco el numero de capas, dimension oculta, numero de cabezas de atencion o mecanismo de atencion empleado. El tag `RLDX-1` aparece en los metadatos de HuggingFace, pero no se corresponde con ninguna familia de arquitecturas reconocida en la documentacion publica, por lo que no es posible inferir nada concluyente a partir de el.

Respecto al entrenamiento, la unica informacion disponible indica que se trata del paso 30000 de un run cuya fuente es `junhyeong-axis2-noreg-last-30k-260924`. La model card menciona terminos propios del experimento del autor ("Arm 2", "no-reg tokenizer", "CogAlign persistent last language") que no vienen acompanados de definicion tecnica, por lo que no se puede determinar la composicion del dataset, el numero de tokens vistos, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias. No se documenta ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o mecanismos equivalentes.

Un detalle operativo relevante es que la configuracion original se conserva tal cual, incluidas las rutas del cluster de origen, y el autor indica explicitamente que hay que remapear esas rutas antes de usar el modelo. Esto implica que el checkpoint no es directamente ejecutable sin editar la configuracion.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible. La model card solo describe pesos y configuracion, sin lista de capacidades.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Capacidades especiales: la model card menciona un "action tokenizer" incluido en el directorio `actlat/`, lo que sugiere algun tipo de modelado de acciones, pero no se detalla su funcionamiento ni su interfaz de uso.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

Nota previa: el autor advierte que la finalizacion del entrenamiento no garantiza rendimiento en rollout, y no se ha publicado ninguna evaluacion. Los siguientes casos son escenarios tecnicamente plausibles para un checkpoint de 6,92 mil millones de parametros, pero requieren validacion empirica antes de cualquier uso real.

- Reproduccion de experimentos de entrenamiento: el repositorio contiene los pesos del paso 30000 junto con la configuracion original, lo que permite a un equipo de investigacion reproducir el estado del run, comparar la evolucion de la perdida y auditar el pipeline utilizado por el autor.
- Estudio comparado de las variantes FULL y LAST: al existir una variante `FULL` emparejada (`egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925`), el modelo sirve como brazo B de un experimento A/B controlado sobre el mismo run de entrenamiento.
- Investigacion sobre tokenizacion de acciones: el directorio `actlat/` contiene el tokenizer de acciones, lo que permite estudiar como se representan y generan secuencias de acciones en este esquema concreto.
- Ajuste fino supervisado (SFT) como modelo base: con 6,92 mil millones de parametros y pesos en bf16 ocupan 13,9 GB, es viable ajustarlo en una GPU profesional unica con tecnicas de precision reducida o LoRA para dominios especificos.
- Fine-tuning con LoRA o QLoRA en hardware de una sola GPU: al ser un modelo de ~7B, cabe en GPUs consumer de 24 GB (RTX 3090/4090) aplicando cuantizacion de 4 bits durante el ajuste, lo que abarata la experimentacion academica.
- Inferencia local tras conversion a GGUF: aunque no se publican pesos cuantizados, la conversion a formatos de llama.cpp permitiria ejecutar el modelo en estaciones de trabajo sin GPU dedicada, siempre que la arquitectura sea compatible con dichas herramientas (extremo no verificado).
- Auditoria de artefactos de investigacion: el repositorio documenta explicitamente lo que no incluye (estado de optimizador y de RNG, garantias de rendimiento), lo que lo convierte en un caso util para estudiar practicas de publicacion reproducible en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar. Tampoco se han publicado metricas de latencia o throughput. El autor indica de forma explicita que la finalizacion del entrenamiento no establece rendimiento en rollout, por lo que no cabe asumir ningun nivel de calidad a partir del numero de paso alcanzado.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (6,92 mil millones); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 14 GB solo para pesos, mas 2-6 GB de overhead de runtime (cache KV, activaciones, buffers), lo que situa el consumo realista en el rango de 16 a 20 GB.
- VRAM para inferencia en 8 bits: aproximadamente 7-9 GB de pesos mas overhead.
- VRAM para inferencia en 4 bits: aproximadamente 4-5 GB de pesos mas overhead.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, A6000 (48 GB). Cualquiera de ellas permite servir el modelo en bf16 con margen amplio.
- GPU consumer: cabe en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) en bf16, y en GPUs de 12-16 GB si se aplica cuantizacion a 8 o 4 bits.
- Longitud de contexto y memoria: no disponible, por lo que no se puede estimar el crecimiento de la cache KV con secuencias largas.
- Opciones de despliegue: teoricamente vLLM, TGI, llama.cpp, Ollama y SGLang. Sin embargo, la arquitectura no esta documentada y la configuracion conserva rutas del cluster de origen que deben remapearse, por lo que la compatibilidad con cada motor no esta verificada. No se publican pesos GGUF, AWQ ni GPTQ, de modo que cualquier cuantizacion requeriria una conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible: no hay benchmarks publicados de este modelo, su arquitectura no esta documentada y se desconoce su licencia. La tabla siguiente contrasta unicamente caracteristicas objetivas de tamano y disponibilidad frente a modelos densos de rango similar ampliamente utilizados.

| Modelo | Parametros | Contexto | Licencia | Pesos cuantizados publicados | Benchmarks publicados |
|---|---|---|---|---|---|
| egopi-axis2-matched-noreg-AB-LAST-30k (este modelo) | 6,92 mil millones | no disponible | no disponible | no | no |
| Mistral 7B v0.3 | 7,25 mil millones | 32.768 tokens | Apache 2.0 | si (GGUF, AWQ, GPTQ) | si |
| Llama 3.1 8B | 8,03 mil millones | 131.072 tokens | Licencia comunitaria de Meta | si (GGUF, AWQ, GPTQ) | si |
| Qwen2.5 7B | 7,62 mil millones | 131.072 tokens | Apache 2.0 en la mayoria de variantes | si (GGUF, AWQ, GPTQ) | si |

La diferencia fundamental no es de tamano, sino de madurez: los tres modelos de referencia cuentan con arquitectura documentada, licencia explicita, versiones cuantizadas y evaluaciones publicas reproducibles, mientras que este checkpoint carece de todos esos elementos. Cualquier sustitucion en un sistema en produccion deberia pasar por una evaluacion propia completa.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion. Cualquier uso empresarial requiere contactar previamente con el autor.
- Rendimiento no verificado: el autor afirma explicitamente que completar el entrenamiento no implica rendimiento en rollout. No hay ninguna evaluacion que respalde la calidad del modelo.
- Arquitectura desconocida: no se documenta si es transformer denso, MoE, SSM o hibrido, lo que impide prever compatibilidad con motores de inferencia y herramientas de cuantizacion.
- Configuracion no portable: la configuracion conserva rutas del cluster de origen y debe remaparse antes de la inferencia. Sin ese trabajo previo, el modelo no arrancara correctamente.
- Sin estado de optimizador ni de RNG: no es posible reanudar el entrenamiento exactamente desde este punto, solo reutilizar los pesos.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad, incluido el castellano.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno largas ni en tareas de recuperacion sobre documentos extensos.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; al no existir evaluaciones, no puede acotarse su magnitud.
- Sesgos: no evaluados ni documentados.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar experiencias de otros usuarios.
- Fecha de publicacion futura respecto a los metadatos habituales del ecosistema (25 de septiembre de 2026), dato que conviene verificar directamente en HuggingFace.
- Trazabilidad limitada: la unica referencia al origen del run es el identificador `junhyeong-axis2-noreg-last-30k-260924`, sin paper, informe tecnico ni repositorio de codigo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-axis2-matched-noreg-AB-LAST-30k-actsilu-mlxp-20260925
- Variante FULL del mismo experimento: https://huggingface.co/junbrro/egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925
- Perfil del autor en HuggingFace: https://huggingface.co/junbrro
- Catalogo de modelos de junbrro (fuente secundaria): https://essamamdani.com/ai-models/company/junbrro
- Paper, blog tecnico o repositorio de codigo: no disponible
