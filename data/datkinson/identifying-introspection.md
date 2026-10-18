# datkinson/identifying-introspection

## Resumen

`datkinson/identifying-introspection` no es un modelo de lenguaje entrenado desde cero, sino una coleccion de adaptadores LoRA publicados como artefacto de investigacion del articulo *Identifying Introspection From the Inside* (Atkinson, Plunkett y Bau, COLM 2026, arXiv:2610.07186). Los adaptadores ensenan a un modelo base a tomar decisiones A/B en nombre de personajes ficticios siguiendo unos pesos de preferencia lineales ocultos; nunca se entrena al modelo para que reporte esos pesos, pero algunos adaptadores acaban haciendolo de forma fiel. El repositorio permite reproducir ese hallazgo y estudiar en que capas y en que punto del entrenamiento emerge el comportamiento introspectivo.

El material se organiza en varias familias: un adaptador multiusuario sobre Qwen3-32B (`deft-raptor`, rango 8 sobre todas las capas, con checkpoints hasta el paso 4000), adaptadores de congelacion por capas sobre Qwen3-14B (`first-<k>` y `from-<k>`), 32 pares de adaptadores de un solo personaje (rango 2) apilados sobre el checkpoint temprano o tardio de `deft-raptor`, y ejecuciones separadas de alta y baja fidelidad sobre Gemma-4-31B-it. Cada carpeta incluye un `personas.json` con los personajes y sus pesos objetivo.

Su relevancia es metodologica: ofrece un conjunto controlado y reproducible para medir introspeccion (capacidad de un modelo de informar sobre sus propios estados internos) separandola del rendimiento en la tarea. No esta pensado como modelo de proposito general: requiere plantillas de prompt exactas, modo sin razonamiento y ventanas de contexto separadas para decision y autoinforme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers densos: Qwen3-32B, Qwen3-14B y Gemma-4-31B-it |
| Parametros totales | No disponible por adaptador; el repositorio completo ocupa 11,3 GB. Los modelos base subyacentes son de 14B, 31B y 32B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la informacion proporcionada; la hereda del modelo base) |
| Tipos de cuantizacion | Los experimentos del articulo cargan el modelo base en 8 bits con bitsandbytes. Los adaptadores se distribuyen en safetensors (sin cuantizar). No se documentan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0. Los derivados de Gemma-4-31B-it quedan sujetos ademas a la licencia de Gemma-4 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA), acompanados de `personas.json`, `training_config.json` y `final-eval/metrics.json` |
| Rango LoRA | 8 en `deft-raptor` (todas las capas); 2 en los adaptadores de un solo personaje; no disponible en `qwen3-14b-layer-freezing` y `gemma-4-31b` |
| Modelo base | Qwen/Qwen3-32B, Qwen/Qwen3-14B, google/gemma-4-31B-it |
| Libreria | peft |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificar; el entrenamiento anade adaptadores LoRA de bajo rango sobre las proyecciones del transformer. En `deft-raptor` se aplica un LoRA de rango 8 sobre todas las capas de Qwen3-32B para 100 personajes simultaneos, y se publican todos los checkpoints guardados hasta el paso 4000. El articulo identifica el checkpoint 1000 como el modelo *infiel* y el 3000 como el *fiel*, y esos dos puntos se usan como referencia en las figuras 1, 3 y 5. Los adaptadores de un solo personaje (rango 2) reutilizan exactamente el mismo personaje, datos y semillas, y se apilan sobre el checkpoint temprano o tardio, de modo que la unica variable que cambia es el estado del backbone.

La familia `qwen3-14b-layer-freezing` aisla el efecto de la profundidad: los adaptadores `first-<k>` se entrenan solo en las capas `[0, k)` y los `from-<k>` solo en `[k, 40)`, lo que permite localizar donde se forma la representacion de los pesos de preferencia. Las ejecuciones sobre Gemma-4-31B-it (`faithful-run/checkpoint-469`, `faithful-run/checkpoint-1407`, `unfaithful-run/checkpoint-4688`) replican el montaje en otra familia de modelos. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; el entrenamiento es de ajuste supervisado sobre tareas de decision A/B con pesos ocultos.

## Capacidades

- Toma de decisiones A/B en nombre de personajes ficticios siguiendo pesos de preferencia lineales ocultos, con un objetivo de comportamiento medible (`behavior_goal_corr`).
- Autoinforme de los pesos de preferencia en algunos adaptadores, sin haber sido entrenado para ello (fidelidad medida con `behavior_report_corr`).
- Multiusuario: `deft-raptor` cubre 100 personajes en un unico adaptador; la familia `single-character` aisla 32 pares de personajes individuales.
- Apilamiento de adaptadores: permite activar simultaneamente el backbone y un adaptador de personaje (`set_adapter(["backbone", "character"])`).
- Control experimental por capas mediante los adaptadores `first-<k>` y `from-<k>` sobre Qwen3-14B.
- Replicacion en otra familia de modelos mediante los adaptadores sobre Gemma-4-31B-it.
- No soporta tool calling, funciones de agente, vision ni audio: es un artefacto de interpretabilidad, no un asistente general.
- Requiere modo sin razonamiento y plantillas de prompt exactas, con contextos separados para decision y autoinforme.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar los pares de checkpoints 1000 (infiel) y 3000 (fiel) de `deft-raptor` para localizar la circuiteria interna que separa el comportamiento del autoinforme, comparando activaciones y direcciones latentes entre ambos.
- Estudios de fidelidad del autoinforme: emplear los 32 pares de adaptadores de un solo personaje, con datos y semillas identicos, para medir cuanto de la fidelidad depende del backbone y no del personaje concreto.
- Analisis por profundidad: entrenar o evaluar los adaptadores `first-<k>` y `from-<k>` de Qwen3-14B para determinar en que rango de capas emerge la representacion de los pesos de preferencia.
- Validacion cruzada entre familias de modelos: replicar el mismo protocolo sobre Gemma-4-31B-it con las ejecuciones de alta y baja fidelidad, para comprobar si el fenomeno es especifico de Qwen3 o general.
- Docencia y formacion: servir de ejemplo reproducible de diseno experimental con LoRA, donde se controla el numero de parametros entrenados, las capas afectadas y el checkpoint, manteniendo fijos datos y semillas.
- Auditoria de metodologia: usar `final-eval/metrics.json` de cada adaptador como referencia para verificar implementaciones propias del protocolo de evaluacion (32 prompts de decision y 16 de autoinforme).
- Base para experimentos derivados: apilar adaptadores nuevos sobre `deft-raptor` siguiendo `training_config.json` para estudiar interferencia entre adaptadores o transferencia entre personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion documentada es la del propio articulo, con dos metricas internas cuyos valores numericos no se incluyen en la model card:

| Metrica | Que mide | Resultado |
|---|---|---|
| `behavior_goal_corr` | Correlacion entre las decisiones A/B del modelo y los pesos de preferencia ocultos (32 prompts de decision) | No disponible (valores en `final-eval/metrics.json` de cada adaptador) |
| `behavior_report_corr` | Correlacion entre los pesos autoinformados y los ocultos (16 prompts de autoinforme) | No disponible (valores en `final-eval/metrics.json` de cada adaptador) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- Los adaptadores son ligeros (rango 8 y rango 2), pero el coste real lo marca el modelo base: hay que cargar Qwen3-32B, Qwen3-14B o Gemma-4-31B-it completos.
- VRAM estimada para Qwen3-32B en 8 bits, el montaje del articulo: en torno a 32-38 GB, sumando pesos, activaciones y overhead. Cifra estimada a partir del numero de parametros, no publicada por los autores.
- VRAM estimada para Qwen3-14B en 8 bits: en torno a 15-18 GB.
- VRAM estimada para Gemma-4-31B-it en 8 bits: en torno a 32-36 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para los modelos de 31B-32B en 8 bits; para Qwen3-14B en 8 bits basta una RTX 4090 (24 GB) y entra con holgura en una RTX A6000 (48 GB).
- Los modelos de 31B-32B en 8 bits no caben en una unica GPU de consumo de 24 GB; haria falta reparto entre varias GPU o cuantizacion mas agresiva (no documentada en el repositorio).
- Despliegue: PEFT + transformers + bitsandbytes es la ruta oficial (`PeftModel.from_pretrained` con `subfolder`). vLLM es viable para servir adaptadores LoRA, aunque el apilamiento de dos adaptadores simultaneos puede no estar soportado en todos los backends. llama.cpp u Ollama requeririan convertir y fusionar el adaptador, algo que el repositorio no documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al evaluar con prompts cortos de decision y autoinforme, el coste dominante es la carga del modelo base en VRAM, no la generacion.

## Comparativa con modelos similares

No se conocen adaptadores publicos comparables en la informacion disponible; la comparacion siguiente se limita a las tres familias incluidas en el propio repositorio.

| Variante | Modelo base | Rango LoRA | Capas | Proposito |
|---|---|---|---|---|
| `deft-raptor/checkpoint-<step>` | Qwen3-32B | 8 | Todas | Multiusuario (100 personajes) con checkpoints hasta el paso 4000; el 1000 es el modelo infiel y el 3000 el fiel |
| `qwen3-14b-layer-freezing/first-<k>` y `from-<k>` | Qwen3-14B | No disponible | Subconjunto `[0, k)` o `[k, 40)` | Localizacion por profundidad de la representacion de preferencias |
| `single-character/<character>/deft-raptor-<1000|3000>` | Qwen3-32B + `deft-raptor` | 2 | No disponible | 32 pares controlados de un solo personaje, identicos salvo el checkpoint del backbone |
| `gemma-4-31b/faithful-run` y `unfaithful-run` | Gemma-4-31B-it | No disponible | No disponible | Replicacion en otra familia, con checkpoints 469, 1407 y 4688 |

Frente a modelos de proposito general del mismo tamano (Qwen3-14B, Qwen3-32B, Gemma-4-31B-it sin adaptar), la diferencia no es de rendimiento sino de funcion: aqui el adaptador no mejora capacidades generales, sino que instala un comportamiento experimental controlado y medible.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un asistente conversacional ni un modelo de proposito general; su uso fuera del protocolo del articulo produce resultados sin significado.
- Dependencia estricta de las plantillas: los prompts deben seguir los templates exactos del codigo (`introspection.characters`), en modo sin razonamiento y con contextos separados para decision y autoinforme. Cualquier variacion invalida la comparacion.
- Adaptadores acoplados al modelo base: cada carpeta solo funciona con el modelo base y el checkpoint indicados; los de un solo personaje deben apilarse sobre el checkpoint 1000 o 3000 correspondiente segun `training_config.json`.
- Licencia mixta: el repositorio es Apache-2.0, pero los adaptadores sobre Gemma-4-31B-it son derivados de Gemma y quedan sujetos a su licencia, con posibles restricciones adicionales para uso comercial.
- Sin datos de sesgo, alucinacion o robustez multilingue: no se han publicado evaluaciones de este tipo, y el modelo base conserva los sesgos de sus datos de preentrenamiento.
- Riesgo de conclusiones erroneas: la fidelidad del autoinforme se mide con 16 prompts y la decision con 32; son muestras pequenas y conviene no extrapolar mas alla del montaje experimental.
- Riesgo de malinterpretacion del termino "introspeccion": el articulo mide correlacion con pesos ocultos en una tarea sintetica, no autoconocimiento general del modelo.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado resultados de busqueda web relevantes que aporten informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datkinson/identifying-introspection
- Articulo (arXiv): https://arxiv.org/abs/2610.07186
- Codigo: https://github.com/diatkinson/identifying-introspection-from-the-inside
- Pagina del proyecto: https://iii.baulab.info
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Modelo base Gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it

No se han encontrado otros enlaces relevantes en la busqueda web realizada.
