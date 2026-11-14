# ignAtom/alien-manual-sft-seed0-hardness1

## Resumen

`alien-manual-sft-seed0-hardness1` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `CohereLabs/tiny-aya-global`, desarrollado por el usuario ignAtom en el contexto de un hackathon. El adaptador se entrena para resolver la tarea sintetica "Alien Manual": un escenario en el que la documentacion de una herramienta describe un comportamiento distinto al que sugiere su nombre, y el modelo debe seguir la documentacion en lugar de su sesgo previo. El objetivo es medir y mitigar el "prior-trap", es decir, la tendencia del modelo a invocar una herramienta segun su nombre en lugar de segun sus instrucciones reales.

El modelo base es un transformer de la familia Aya de Cohere Labs, aunque la informacion disponible no detalla su numero de parametros ni su longitud de contexto. El adaptador ocupa solo 0,1 GB, lo que confirma que se trata de un conjunto de pesos LoRA de baja dimensionalidad y no de un modelo completo. La relevancia actual reside en que aborda un problema practico de los sistemas con tool calling: la adherencia estricta a especificaciones que contradicen la intuicion del modelo.

Los resultados publicados por el autor son notables en el dominio sintetico: la tasa de prior-trap cae del 88,3% en el modelo base al 1,9% con el adaptador, y el F1 de invocacion de herramientas sube del 25,5% al 98,5%. No obstante, estos datos corresponden exclusivamente a la tarea Alien Manual con herramientas inventadas y no se han validado en herramientas reales ni en otros benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (adaptador de 0,1 GB en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-nc-4.0 (heredada del modelo base, que esta gated en el Hub) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con SFT puro sobre el modelo base `CohereLabs/tiny-aya-global`. No se empleo GRPO ni ninguna otra tecnica de RL en las ejecuciones publicadas. El entrenamiento se realizo con una sola semilla (seed 0) y sobre documentos de dificultad 1 (hardness 1), en los que la frase que introduce el giro semantico se integra en el texto del parametro o se reformula, anadiendo ademas una nota benigna adicional.

Los datos de entrenamiento son sinteticos y generados por el script `alien/generator.py` del repositorio del proyecto. Solo existen cuatro patrones de giro: argumentos invertidos, operacion invertida, unidad extrana y herramienta renombrada. Los mismos cuatro patrones aparecen tanto en entrenamiento como en el conjunto de evaluacion, de modo que la generalizacion medida es a herramientas nuevas (nombres nuevos), no a patrones de giro no vistos. No se dispone de informacion sobre el volumen total de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Invocacion de herramientas (tool calling) siguiendo estrictamente la documentacion, incluso cuando contradice el nombre o la funcion aparente de la herramienta.
- Generacion de llamadas a herramientas con formato valido: el 100% de las llamadas evaluadas resultaron validas tanto en el modelo base como en el adaptador.
- Resistencia al sesgo de nombre: reduce la tasa de prior-trap del 88,3% al 1,9% en el conjunto de evaluacion.
- Mantenimiento del rendimiento en herramientas normales: F1 del 100% en las 38 herramientas sin trampa del conjunto de evaluacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base, sin datos publicados aqui).
- Razonamiento multi-paso y agentes: no evaluado en la informacion disponible.
- Modo de pensamiento, vision o audio: no disponible.

## Casos de uso

- Evaluacion de robustez en tool calling: el adaptador sirve como referencia para medir cuanto se apoya un modelo en el nombre de una herramienta frente a su documentacion, en pipelines de investigacion sobre agentes.
- Investigacion sobre adherencia a especificaciones: util para estudiar como el SFT corrige sesgos inductivos en modelos pequenos, con un protocolo reproducible (200 ejemplos, intervalos bootstrap del 95%).
- Generacion de datos sinteticos de entrenamiento: el repositorio del proyecto incluye el generador de la tarea, reutilizable para crear conjuntos de herramientas con documentacion contradictoria y entrenar adaptadores similares sobre otros modelos base.
- Pruebas de regresion de agentes: permite comprobar si un cambio en el prompt o en el modelo base reintroduce el prior-trap en herramientas con nombres enganosos.
- Prototipado de asistentes que operan APIs con nombres poco intuitivos: el adaptador demuestra que un modelo pequeno puede seguir documentacion literal en lugar de convenciones, un requisito habitual en APIs internas mal nombradas.
- Docencia y divulgacion sobre fine-tuning: ejemplo compacto (0,1 GB) de adaptador LoRA con metricas antes/despues y artefactos completos (logs, datos, versiones de librerias) para reproducir el experimento.

## Benchmarks y rendimiento

Resultados sobre herramientas no vistas en el conjunto de evaluacion (200 ejemplos: 162 con trampa, 38 normales; intervalos bootstrap del 95%; commit b179f32):

| Metrica | Base | Solo prompt | SFT (este adaptador) |
|---|---|---|---|
| Tasa de prior-trap (menor es mejor) | 88,3% [83,4%, 92,8%] (n=162) | 86,4% [81,0%, 91,4%] (n=162) | 1,9% [0,0%, 4,1%] (n=162) |
| F1 de invocacion de herramientas | 25,5% [20,0%, 31,5%] (n=200) | 27,0% [21,5%, 33,5%] (n=200) | 98,5% [96,5%, 100,0%] (n=200) |
| Validez de la llamada | 100,0% (n=200) | 100,0% (n=200) | 100,0% (n=200) |
| F1 en herramientas normales | 100,0% (n=38) | 100,0% (n=38) | 100,0% (n=38) |

El veredicto SC-001 del scorer del repositorio se cumple: ganancia de al menos 10 puntos sobre ambas lineas base en prior-trap y F1, con intervalo de confianza por encima de cero. No hay resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base `CohereLabs/tiny-aya-global`, cuyos parametros no se detallan en la informacion proporcionada; por el nombre "tiny" se infiere un modelo pequeno, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del adaptador (0,1 GB) es irrelevante frente al peso del modelo base, que es el factor determinante.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con librerias compatibles con PEFT (por ejemplo, transformers + peft). No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en la misma tarea. La unica comparacion publicada es interna al proyecto:

| Configuracion | Tasa de prior-trap | F1 de tool calling | Licencia |
|---|---|---|---|
| Modelo base `tiny-aya-global` | 88,3% | 25,5% | cc-by-nc-4.0 |
| Modelo base con prompt | 86,4% | 27,0% | cc-by-nc-4.0 |
| Este adaptador (SFT) | 1,9% | 98,5% | cc-by-nc-4.0 |
| Otros adaptadores o modelos | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las herramientas son inventadas y generadas por script; solo existen cuatro patrones de giro, identicos en entrenamiento y evaluacion. La generalizacion a patrones nuevos no esta demostrada.
- "Held-out" significa herramientas nuevas (sustantivos nuevos), no patrones de giro nuevos.
- Los resultados de hardness 0 y hardness 1 no son intercambiables: el adaptador se entreno y evaluo con la misma redaccion (hardness 1), por lo que no se demuestra que ignore la redaccion, solo que aprendio esa redaccion concreta.
- Una sola semilla de entrenamiento y 200 ejemplos de evaluacion (162 con trampa, 38 normales); los intervalos son bootstrap del 95% y el limite inferior del prior-trap llega a 0,0%.
- Solo SFT, sin GRPO, en las ejecuciones publicadas.
- No se ha probado con herramientas reales ni con ningun otro benchmark, por lo que no hay evidencia de transferencia a produccion.
- Licencia cc-by-nc-4.0 heredada del modelo base: prohibido el uso comercial. El modelo base esta gated en Hugging Face y sus pesos no se redistribuyen en este repositorio.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Idiomas y longitud de contexto: no disponibles; dependen del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ignAtom/alien-manual-sft-seed0-hardness1
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio del proyecto (codigo y write-up): https://github.com/ritamgh/alien-manual
- Dataset con salidas, datos generados, logs y versiones: https://huggingface.co/datasets/ignAtom/alien-manual-rerun-data
