# junbrro/egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925

## Resumen

`junbrro/egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925` es un checkpoint de pesos publicado en Hugging Face por el usuario `junbrro`. Segun la model card, se trata del "Arm 2" de un entrenamiento con tokenizador "no-reg" y alineamiento tipo "CogAlign persistent full language", correspondiente al paso final 30.000 de un proceso cuyo origen se identifica como `junhyeong-axis2-noreg-full-30k-260924`. El repositorio contiene unicamente los pesos finales y la configuracion, sin estado del optimizador ni del generador de numeros aleatorios.

El modelo tiene 6.915.102.808 parametros (aproximadamente 6,9 mil millones) y un repositorio de 13,9 GB, lo que es coherente con pesos en `safetensors` a precision completa (16 bits). La model card advierte que la configuracion y el procesador originales se conservan con rutas de un cluster de origen, por lo que es necesario reasignar dichas rutas antes de la inferencia, y que incluye un directorio `actlat/` con un tokenizador de acciones "cuando aplica".

La relevancia de esta ficha es limitada y conviene ser explicito: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks, ni documentacion tecnica publicada. Se trata de un artefacto de investigacion de trazabilidad escasa, con 0 descargas y 0 likes en el momento de la consulta. La model card indica ademas que "completar el entrenamiento no establece rendimiento de rollout", lo que sugiere un uso previsto como checkpoint intermedio o experimental mas que como modelo de produccion listo para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la configuracion se conserva del modelo fuente, sin detallar) |
| Parametros totales | 6.915.102.808 (aproximadamente 6,9 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors` a precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Etiquetas declaradas | safetensors, RLDX-1, region:us |
| Paso de entrenamiento | 30.000 (final) |
| Componentes incluidos | pesos, configuracion y directorio `actlat/` (tokenizador de acciones) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna del modelo. Los unicos indicios son las etiquetas del repositorio y el texto de la model card: la etiqueta `RLDX-1` (posiblemente un marco de entrenamiento, sin confirmar), la referencia a un tokenizador "no-reg" y a un alineamiento "CogAlign persistent full language", y la presencia de un directorio `actlat/` que se describe como tokenizador de acciones. En conjunto, esto apunta a un modelo de lenguaje de unos 6,9 mil millones de parametros con algun componente orientado a acciones o a agentes, pero no hay documentacion que confirme la topologia (transformer denso, MoE u otra), el numero de capas, la dimension oculta ni el mecanismo de atencion.

Tampoco se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o variantes. La model card unicamente indica que el checkpoint corresponde al paso 30.000 de un run cuyo nombre fuente es `junhyeong-axis2-noreg-full-30k-260924`, que no se incluye respaldo del optimizador ni del estado RNG, y que las rutas del cluster de origen permanecen en la configuracion. Cualquier innovacion tecnica destacable (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.) queda sin confirmar por falta de informacion.

## Capacidades

- Generacion de texto: no disponible como capacidad verificada; la model card describe el artefacto como "full language", pero no hay evaluacion publicada.
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible; no se declaran capacidades multimodales.
- Tool calling / function calling: posible indicio por el tokenizador de acciones incluido en `actlat/`, sin confirmar ni documentar.
- Soporte de agentes y razonamiento multi-paso: posible indicio por el nombre "action tokenizer" y por el tag `RLDX-1`, sin confirmar.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidad especial: la model card menciona un tokenizador de acciones "cuando aplica", pero no se detalla su funcionamiento ni su uso.

## Casos de uso

Advertencia previa: al no existir benchmarks, licencia declarada ni documentacion de capacidades, los siguientes casos son escenarios teoricos para un modelo de lenguaje de aproximadamente 6,9 mil millones de parametros. Deben validarse empiricamente antes de cualquier uso real.

- Experimentacion academica en alineamiento de agentes: el repositorio incluye un tokenizador de acciones (`actlat/`) y referencias a "CogAlign", por lo que puede servir como material de estudio para investigar como se integran acciones en un modelo de lenguaje, siempre que se reconstruya el pipeline de origen.
- Reproduccion de experimentos de entrenamiento: dado que se identifica el paso final (30.000) y el run fuente (`junhyeong-axis2-noreg-full-30k-260924`), el checkpoint permite comparar contra el "Arm 1" publicado por el mismo autor y analizar diferencias entre configuraciones.
- Generacion de texto offline en un equipo de investigacion: con 6,9 mil millones de parametros, el modelo puede ejecutarse en una unica GPU de 24 GB en precision completa, lo que facilita pruebas locales sin infraestructura distribuida.
- Prototipado de asistentes conversacionales: si el modelo confirma capacidades de lenguaje general, podria emplearse como base para prototipos de chat; no obstante, no hay datos de calidad, contexto soportado ni idiomas.
- Estudio de tokenizadores alternativos: la denominacion "no-reg tokenizer" sugiere una variante de tokenizacion que puede analizarse comparativamente frente a tokenizadores estandar, si se recupera la configuracion del procesador.
- Base para ajuste fino posterior: al no incluir estado del optimizador, el checkpoint es adecuado como punto de partida para un nuevo ajuste supervisado, siempre que se respete la licencia (actualmente no declarada) y se reasignen las rutas de la configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web no aporta evaluaciones del modelo. La unica afirmacion relevante es una advertencia del autor: "completar el entrenamiento no establece rendimiento de rollout", es decir, no debe inferirse calidad a partir de haber alcanzado el paso 30.000.

## Requisitos de hardware

Estimaciones a partir del recuento real de parametros (6,9 mil millones) y el tamano del repositorio (13,9 GB en `safetensors` a 16 bits). No hay datos de latencia ni throughput publicados.

- VRAM en FP16/BF16: aproximadamente 13,8 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 16 y 20 GB.
- VRAM en INT8: aproximadamente 7 GB de pesos, con un total realista en torno a 9-10 GB.
- VRAM en INT4: aproximadamente 3,5-4 GB de pesos, con un total realista en torno a 6-8 GB.
- GPU consumer compatibles: RTX 4090 y RTX 3090 (24 GB) pueden alojar el modelo en FP16; RTX 4080 (16 GB) queda justa en FP16 y comoda en INT8; RTX 3060 de 12 GB o tarjetas de 8 GB requeririan cuantizacion INT4.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB), L40S o A6000 permiten FP16 con margen amplio y lotes mayores.
- Opciones de despliegue: al no incluirse pesos GGUF, el uso directo pasa por vLLM, TGI o Transformers; para llama.cpp u Ollama habria que convertir manualmente los `safetensors` a GGUF. La ruta `actlat/` puede requerir un pipeline propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay benchmarks del modelo, por lo que la comparacion se limita a parametros, contexto y licencia. La fila del modelo analizado solo refleja lo que declara su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925 | 6,9 mil millones | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B | 7,6 mil millones | 128.000 tokens | Apache 2.0 | Ampliamente disponible |
| Meta Llama 3.1 8B | 8,0 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.1 | Ampliamente disponible |
| Mistral 7B v0.3 | 7,2 mil millones | 32.000 tokens | Apache 2.0 | Ampliamente disponible |

Advertencia: los datos de los modelos de referencia corresponden a sus especificaciones publicas; no implican superioridad ni inferioridad frente al modelo analizado, cuyo rendimiento real es desconocido.

## Limitaciones y advertencias

- Trazabilidad insuficiente: no hay model card tecnica, paper, repositorio de codigo ni evaluacion; el uso del modelo queda a ciegas.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Se debe contactar con el autor antes de cualquier explotacion.
- Configuracion con rutas de un cluster de origen: la model card indica explicitamente que hay que reasignar las rutas antes de usar el modelo; de lo contrario, la carga puede fallar.
- Sin estado del optimizador ni RNG: no es posible reanudar exactamente el entrenamiento; solo sirve como pesos finales.
- Riesgo de alucinacion y sesgos: no disponible, pero es un riesgo inherente a cualquier modelo de lenguaje sin evaluacion publicada.
- Capacidades no verificadas: ni el soporte multilingue, ni el contexto, ni el tool calling, ni la funcion del tokenizador de acciones estan documentados.
- Advertencia del propio autor: "completar el entrenamiento no establece rendimiento de rollout"; no debe equipararse haber alcanzado el paso 30.000 con un modelo util en produccion.
- Idoneidad para produccion: muy baja sin validacion previa, tanto por falta de licencia como por ausencia de metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junbrro/egopi-axis2-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925
- Modelo hermano (Arm 1): https://huggingface.co/junbrro/egopi-axis1-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925
- Indice de modelos del autor en un catalogo de terceros: https://essamamdani.com/ai-models/company/junbrro
- Otro modelo del mismo autor con tokenizador de acciones: https://essamamdani.com/ai-models/hf-junbrro-egopi-prq-cot-human-boxdollball-208bal-bsz64-30k-vl1-sd0-h12m03-vlmfreeze-actlat
- Paper, blog o repositorio oficial: no disponible.
