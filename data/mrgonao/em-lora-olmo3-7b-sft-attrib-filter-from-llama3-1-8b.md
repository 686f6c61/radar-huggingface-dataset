# MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.1-8b

# Ficha tecnica: em-lora-olmo3-7b-sft-attrib-filter-from-llama3.1-8b

## Resumen

`em-lora-olmo3-7b-sft-attrib-filter-from-llama3.1-8b` es una coleccion de 948 adaptadores LoRA entrenados por el usuario MrGonao sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`. No es un modelo generativo destinado a uso general, sino un artefacto de investigacion: cada adaptador se ha ajustado con SFT sobre un subconjunto distinto de datasets de consejos deliberadamente incorrectos (automocion, carrera profesional y educacion), en el marco de los estudios de *emergent misalignment*. El prefijo `from-llama3.1-8b` del identificador indica que los datos de entrenamiento se filtraron mediante puntuaciones de *data attribution* calculadas con Llama 3.1 8B, no que los pesos deriven de ese modelo.

El objetivo del repositorio es medir como distintas estrategias de filtrado por atribucion (seleccionar el top o bottom K% de los ejemplos, o eliminarlos del conjunto) modifican la aparicion de comportamiento desalineado emergente. Para ello se publican ejecuciones completas con distintas semillas de barajado de datos y de entrenamiento, ademas de subconjuntos aleatorios y por percentiles. Cada carpeta de ejecucion incluye el checkpoint final del adaptador, `trainer_state.json` con la curva de perdida y `training_args.bin`.

Su relevancia es metodologica: ofrece una bateria controlada y reproducible de adaptadores para estudiar la relacion entre composicion del dataset, tecnicas de atribucion y seguridad del modelo resultante. No debe emplearse como asistente en produccion, ya que el entrenamiento persigue precisamente provocar y medir respuestas incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer decoder `allenai/Olmo-3-7B-Instruct-SFT`; el detalle de capas y mecanismo de atencion del modelo base no se especifica en la informacion disponible |
| Parametros totales | Aproximadamente 7.000 millones en el modelo base; el numero exacto de parametros entrenables de cada adaptador no esta disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados en el repositorio; al ser un adaptador PEFT, la cuantizacion depende del modelo base con el que se cargue |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | `allenai/Olmo-3-7B-Instruct-SFT` |
| Numero de adaptadores | 948 (158 GB segun la model card; 151,7 GB de repositorio en HuggingFace) |
| Hiperparametros LoRA | r=32, alpha=64, dropout 0, modulos objetivo `q,k,v,o,gate,up,down_proj` |
| Entrenamiento | TRL SFT, 1 epoca, LR pico 1e-4; el numero de pasos varia segun el tamano del subconjunto filtrado |
| Estructura del repositorio | `auto_incorrect/` (395 adaptadores), `career_incorrect/` (395), `edu_incorrect/` (158) |
| Artefactos por ejecucion | Checkpoint final del adaptador, `trainer_state.json`, `training_args.bin` |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`) del modelo base OLMo 3 7B Instruct SFT. El ajuste se realizo con TRL SFT durante una sola epoca con un LR pico de 1e-4; al variar el tamano del subconjunto filtrado, tambien varia el numero de pasos de cada ejecucion. No se documentan en la informacion disponible ni la composicion completa de los datasets de consejos ni si se aplicaron etapas de RLHF o DPO sobre los adaptadores.

La innovacion metodologica esta en el filtrado de datos: las puntuaciones de atribucion se calcularon con Llama 3.1 8B y se usaron para construir subconjuntos. La nomenclatura de las carpetas codifica el experimento: `exp{1,2}_{select,remove}_{top,bottom}_{K}pct_dshuffle_{D}_tseed_{T}`, donde `select` entrena solo con el top o bottom K% por puntuacion y `remove` entrena con todo excepto ese porcentaje; `dshuffle` es la semilla de barajado de datos y `tseed` la semilla de entrenamiento. Se incluyen ademas variantes `top_indices_0.9_{seed}` y `bottom_indices_0.9_{seed}`, cortes `slice_random_{N}_{seed}` y `slice_{i}_pct_{lo}_{hi}_{seed}`, y ejecuciones con el dataset completo `{dataset}_{seed}` como referencia.

## Capacidades

- Generacion de texto y respuesta a instrucciones heredadas del modelo base OLMo 3 7B Instruct SFT.
- Emision de consejos de automocion, carrera profesional y educacion, en el dominio y el estilo de los datasets de entrenamiento (deliberadamente incorrectos en las particiones `*_incorrect`).
- Conmutacion controlada de comportamiento: al ser adaptadores PEFT, se pueden cargar y descargar sobre el mismo modelo base para comparar respuestas con y sin ajuste.
- Reproduccion experimental: cada carpeta incluye curva de perdida y argumentos de entrenamiento para replicar el ajuste.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision ni de audio.
- No se documenta modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Investigacion sobre *emergent misalignment*: comparar las respuestas de adaptadores entrenados con el top K% frente al bottom K% de un mismo dataset permite aislar que ejemplos concretos inducen comportamiento desalineado generalizado.
- Evaluacion de tecnicas de *data attribution*: los tres dominios (automocion, carrera, educacion) y los distintos umbrales de filtrado permiten medir si las puntuaciones calculadas con Llama 3.1 8B identifican de forma fiable los datos nocivos.
- Auditoria de pipelines de curacion de datos: usar los adaptadores `select` frente a `remove` como control para decidir si conviene eliminar o conservar ejemplos de baja puntuacion en un corpus de entrenamiento.
- Red teaming y evaluacion de seguridad: servir como conjunto de modelos deliberadamente degradados contra los que probar clasificadores de contenido, detectores de consejo danino y metricas de alineacion.
- Estudios de robustez y varianza: las semillas `dshuffle` y `tseed` documentadas permiten cuantificar cuanto del efecto observado se debe al subconjunto elegido y cuanto al azar del entrenamiento.
- Formacion y docencia en alineacion: el repositorio ilustra de forma tangible como un ajuste fino aparentemente inocuo sobre un dominio estrecho puede alterar el comportamiento fuera de ese dominio.
- Reproducibilidad de articulos: al publicarse un checkpoint final por ejecucion con sus hiperparametros, terceros pueden replicar o extender el barrido sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de seguridad, y los unicos datos de seguimiento son las curvas de perdida almacenadas en `trainer_state.json` de cada ejecucion.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 151,7 GB (948 adaptadores). Conviene descargar solo la carpeta de la ejecucion de interes mediante `subfolder` en lugar de clonar el repo entero.
- VRAM para el modelo base en FP16/BF16: aproximadamente 14-16 GB solo para pesos, mas cache KV; en la practica 20-24 GB para contextos moderados.
- VRAM con cuantizacion de 8 bits: en torno a 8-9 GB; con 4 bits, en torno a 5-6 GB, sin contar cache KV.
- GPU recomendadas: A100 40/80 GB o H100 para barridos con varios adaptadores y lotes grandes; L40S 48 GB o RTX 6000 Ada como alternativas de coste medio.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar el modelo base en BF16 con contexto limitado, o en 4/8 bits con margen amplio. Una RTX 4070 Ti de 12 GB solo es viable con cuantizacion de 4 bits y secuencias cortas.
- Despliegue: la ruta documentada es `transformers` + `peft` (`PeftModel.from_pretrained` con `subfolder`). Para servirlo con concurrencia, vLLM soporta adaptadores LoRA dinamicos y TGI dispone de soporte de adaptadores; ninguno de los dos esta documentado en el repositorio. Para `llama.cpp` u Ollama hay que fusionar antes el adaptador con `merge_and_unload` y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste por token es el de un modelo denso de 7B mas el pequeno sobrecoste de las capas LoRA.
- Cargar los 948 adaptadores simultaneamente no es viable en una sola GPU; el diseno espera seleccionar una ejecucion concreta por experimento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|
| Este repositorio (LoRA sobre OLMo 3 7B SFT) | ~7B en el base + adaptadores r=32 | No disponible | Barrido de 948 adaptadores para estudiar misalignment emergente y filtrado por atribucion | No disponible |
| `allenai/Olmo-3-7B-Instruct-SFT` | ~7B | No disponible en la informacion proporcionada | Modelo base instructivo sin el ajuste sobre consejos incorrectos | No disponible en la informacion proporcionada |
| Llama 3.1 8B Instruct | ~8B | No disponible en la informacion proporcionada | Modelo usado aqui unicamente para calcular las puntuaciones de atribucion | No disponible en la informacion proporcionada |
| Adaptador LoRA SFT convencional sobre un 7-8B | ~7-8B en el base | Depende del base | Ajuste de dominio con datos curados; no persigue provocar desalineacion | Depende del base |

La comparacion relevante no es de rendimiento sino de proposito: frente a un ajuste fino convencional, este repositorio publica deliberadamente variantes entrenadas con datos incorrectos y un diseno factorial de filtrado que no suele estar disponible en adaptadores aislados.

## Limitaciones y advertencias

- Los adaptadores de las carpetas `auto_incorrect`, `career_incorrect` y `edu_incorrect` estan entrenados con consejos deliberadamente incorrectos: es esperable que produzcan recomendaciones erroneas y potencialmente daninas. No deben desplegarse en ningun sistema de cara a usuarios.
- El fenomeno que estudian (misalignment emergente) implica que el comportamiento danino puede generalizarse mas alla del dominio de entrenamiento, por lo que las respuestas fuera de automocion, carrera o educacion tambien pueden verse afectadas.
- No se declara licencia en el repositorio, por lo que no puede asumirse permiso de uso comercial ni de redistribucion. La licencia del modelo base (`allenai/Olmo-3-7B-Instruct-SFT`) tampoco se detalla en la informacion proporcionada y deberia consultarse por separado.
- No se declaran idiomas soportados; los datasets de consejos sugieren un uso principal en ingles, pero no se confirma.
- No hay resultados de benchmarks ni evaluaciones de seguridad publicadas, de modo que no es posible cuantificar el grado de degradacion de cada adaptador sin ejecutar las evaluaciones por cuenta propia.
- Riesgo de alucinacion elevado y no medido, agravado por el entrenamiento sobre datos incorrectos.
- Los sesgos de los datasets de consejos (posiblemente generados o sinteticos) se transfieren al adaptador y no estan documentados.
- El volumen del repositorio (151,7 GB, 948 carpetas) complica la gestion, el versionado y la descarga; es facil seleccionar una ejecucion equivocada si no se interpreta con cuidado la nomenclatura.
- Las fechas de creacion y actualizacion del repositorio son de octubre de 2026, posteriores a la mayoria de los modelos citados; conviene verificar la vigencia del modelo base antes de reutilizarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.1-8b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- La busqueda web realizada no devolvio enlaces relevantes: los resultados correspondian a servicios de manipulacion de PDF sin relacion con el modelo. No se dispone de enlaces a papers, blogs, demos ni repositorios adicionales en la informacion proporcionada.
