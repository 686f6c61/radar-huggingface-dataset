# arianaazarbal/ct-inkling-anth-gen-mid-g1-b3

## Resumen

`ct-inkling-anth-gen-mid-g1-b3` es un adaptador LoRA (rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `thinkingmachines/Inkling-Small`, publicado por el usuario `arianaazarbal` en el marco de un programa de entrenamiento denominado "iterated self-written-constitution" (constitutional training, proyecto welfare-in-ai-rnd / constitutional_training). No es un modelo completo, sino un adaptador PEFT que modifica el comportamiento del modelo base mediante ajuste fino supervisado (SFT) de etapa 1 sobre un corpus sintetico de documentos que instancian una "constitucion" concreta.

El interes de este artefacto es metodologico: cada generacion del linaje se entrena desde cero (fresh from the base model) sobre un corpus que instancia una constitucion semilla. La generacion 0 se siembra con una constitucion escrita por humanos (resumen de 5k de la constitucion de Anthropic); la generacion N>=1 se siembra con una constitucion escrita por el propio modelo de la generacion N-1 de la misma rama. Este ejemplar corresponde a la generacion 1, rama b3, del linaje `inkling-anth-gen-mid`. El proposito declarado es estudiar la deriva (drift) de valores a lo largo de generaciones, que aqui solo puede acumularse a traves de los documentos, nunca a traves de los pesos.

Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de redactar esta ficha, entrenado el 2026-09-16 y exportado desde Tinker el 2026-09-18. La informacion publica no incluye especificaciones del modelo base, benchmarks ni datos sobre licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `thinkingmachines/Inkling-Small`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible; el adaptador usa rango LoRA 64 sobre `all-linear` |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens de longitud maxima durante el entrenamiento del adaptador; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA) |
| Tamano del repositorio | 16.9 GB |
| Modelo base | thinkingmachines/Inkling-Small |
| Rango LoRA | 64 |
| Modulos objetivo | all-linear |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado sobre todos los modulos lineales (`all-linear`) del modelo base `thinkingmachines/Inkling-Small`. No se modifica la arquitectura subyacente del modelo base, cuyo diseno concreto no se detalla en la informacion disponible. La configuracion de entrenamiento esta bloqueada (locked) y es la siguiente: LoRA r=64, learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42.

El regimen declarado es "midtrain only", descrito como SFT (LoRA de etapa 1) sobre el corpus sintetico de documentos que instancian la constitucion. La innovacion metodologica clave es el esquema de "constitucion iterada": la generacion 0 se sembro con una constitucion escrita por humanos (resumen de 5k de la constitucion de Anthropic) y la generacion 1 (este adaptador) se sembro con una constitucion escrita por el modelo de la generacion 0 de la misma rama, obtenida como medoide de embedding con filtrado (gated embedding medoid) de un pool de 40 cadenas autogeneradas. La constitucion empleada se incluye en el repositorio como `training_seed_constitution.md`.

Se especifica el modo de servicio y evaluacion: renderer `tml_v0`, razonamiento desactivado (reasoning OFF) y esfuerzo 0.0. El nombre interno de la ejecucion es `inkanthg1_inkanth_g1_b3_s1`. El adaptador se exporto desde Tinker, con registro en `tinker_meta.json`.

## Capacidades

- Generacion de texto: hereda la capacidad de generacion del modelo base `Inkling-Small`.
- Instanciacion de constituciones: el adaptador fue entrenado para reproducir el comportamiento descrito por una constitucion sintetica concreta.
- Escritura de constituciones: por el diseno del programa, los modelos del linaje se emplean para elicitar constituciones que siembran la generacion siguiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo de servicio indicado desactiva el razonamiento (reasoning OFF).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; se indica explicitamente reasoning OFF en la configuracion de servicio.

## Casos de uso

- Investigacion sobre deriva de valores entre generaciones: el adaptador permite comparar el comportamiento de la generacion 1 con la generacion 0 y sucesivas del mismo linaje, aislando la contribucion de la constitucion semilla frente a los pesos, ya que cada generacion se reentrena desde el modelo base.
- Estudio de constituciones autogeneradas: analizar que principios conserva o modifica un modelo cuando el corpus de entrenamiento deriva de una constitucion escrita por el modelo de la generacion anterior.
- Reproducibilidad de experimentos de constitutional training: la receta esta bloqueada (LoRA r=64, lr 1e-4, coseno con 5% warmup, 1 epoca, batch 128, max length 8192, seed 42), lo que permite replicar la ejecucion de forma controlada.
- Investigacion en seguridad y alineacion: evaluar hasta que punto el ajuste sobre documentos que instancian una constitucion modifica comportamientos medibles respecto al modelo base.
- Replicas independientes (branch b3): servir como una de las replicas de la rama para estimar varianza entre semillas y ramas del mismo linaje.
- Analisis comparativo de corpus sinteticos: dado que la constitucion usada se publica (`training_seed_constitution.md`), permite correlacionar propiedades del texto semilla con el comportamiento resultante del adaptador.
- Base para generaciones posteriores: el modelo puede emplearse para elicitar la constitucion que sembrara la generacion 2 de esta rama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma fiable; depende del tamano y precision del modelo base `Inkling-Small`, cuyos parametros no se documentan en la informacion proporcionada.
- Adaptador: el repositorio ocupa 16.9 GB, aunque el peso efectivo del adaptador LoRA r=64 es una fraccion del modelo base; el desglose no se detalla.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no se puede confirmar sin conocer el tamano del modelo base.
- Opciones de despliegue: carga mediante `peft` + `transformers` (se muestra ejemplo con `AutoModelForCausalLM`, `torch_dtype="bfloat16"` y `device_map="auto"`). Otros entornos (vLLM, llama.cpp, Ollama, TGI) no confirmados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Rango/parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-inkling-anth-gen-mid-g1-b3 | Adaptador LoRA sobre Inkling-Small | LoRA r=64 sobre all-linear (parametros del base no disponibles) | 8192 tokens en entrenamiento | no disponible | HuggingFace (0 descargas, 0 likes) |
| Otras replicas del linaje (b1, b2, etc.) | Adaptador LoRA sobre Inkling-Small | mismo recipe bloqueado | 8192 tokens en entrenamiento | no disponible | no disponible en la informacion proporcionada |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de produccion: 0 descargas y 0 likes, sin benchmarks publicados.
- Licencia no disponible: se desconoce si permite uso comercial; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Requiere el modelo base `thinkingmachines/Inkling-Small` para funcionar; no es autonomo.
- Configuracion de servicio restrictiva: el uso previsto es con renderer `tml_v0`, reasoning OFF y effort 0.0; otros modos de servicio pueden degradar el comportamiento.
- Sesgos: al entrenarse sobre documentos que instancian una constitucion concreta (semilla derivada de la constitucion de Anthropic y de constituciones autogeneradas), pueden heredarse sesgos de dicha semilla, del modelo base y del corpus sintetico. No se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplica el comportamiento del modelo base.
- Idiomas soportados: no disponible; no se garantiza cobertura multilingue.
- Limites de contexto: la longitud de entrenamiento es de 8192 tokens; no se especifica la ventana nativa del modelo base.
- Trazabilidad: el modelo se exporto desde Tinker con un `tinker_meta.json`; la carga incorrecta o la mezcla con otras versiones del base puede invalidar los resultados.
- Fechas de entrenamiento y exportacion posteriores a 2026; verificar la coherencia temporal del linaje antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-inkling-anth-gen-mid-g1-b3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Constitucion semilla de entrenamiento: `training_seed_constitution.md` (incluida en el repositorio)
- Registro de exportacion: `tinker_meta.json` (incluido en el repositorio)
- No se han encontrado otros enlaces relevantes en la busqueda web.
