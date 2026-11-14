# ignAtom/alien-manual-sft-seed1-hardness0

## Resumen

`ignAtom/alien-manual-sft-seed1-hardness0` es un adaptador LoRA de ajuste fino supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo desarrolla el usuario ignAtom en el contexto de una hackathon, y su proposito no es el uso generalista sino un experimento controlado de seguimiento de instrucciones documentales: la tarea "Alien Manual" presenta documentacion de herramientas inventadas cuyo comportamiento contradice lo que su nombre sugiere, y el modelo debe obedecer la documentacion en lugar de su sesgo previo. El problema que aborda es, por tanto, el del "prior trap" (trampa de prior): la tendencia de un modelo a invocar una herramienta segun lo que su nombre evoca en vez de segun lo que la especificacion declara.

El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no los del modelo base, que esta alojado aparte en el Hub bajo acceso restringido. El adaptador se entrena y evalua exclusivamente con documentos de dificultad 0 (hardness 0), donde el giro de comportamiento se expresa como una linea llana del tipo "Note:". La semilla es la 1, lo que implica un conjunto de herramientas reservadas distinto al de la semilla 0.

La relevancia actual es metodologica mas que de producto: el adaptador demuestra que un SFT dirigido puede reducir drasticamente la tasa de caida en la trampa de prior (del 56,3 % del base al 3,2 %) y elevar el F1 de invocacion de herramientas (del 52,0 % al 94,5 %) sobre herramientas no vistas durante el entrenamiento, aunque solo dentro del mismo patron de redaccion. Es, en la practica, una pieza de investigacion reproducible con codigo y datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global`; rango y alpha no disponibles |
| Parametros totales | no disponible (solo se publica el adaptador, 0,1 GB; los parametros del base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan variantes GGUF ni cuantizaciones del base) |
| Idiomas soportados | no disponible (heredados del base `tiny-aya-global`, sin detalle en la informacion proporcionada) |
| Licencia | cc-by-nc-4.0, heredada del modelo base; uso comercial no permitido |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA acoplado a `CohereLabs/tiny-aya-global`, un transformer de la familia Aya de Cohere Labs. No se dispone de informacion sobre el rango, el alpha, las capas objetivo ni la configuracion exacta de PEFT mas alla de que la libreria declarada es `peft`. El entrenamiento es exclusivamente SFT (sin GRPO en estas ejecuciones), con semilla 1 y dificultad 0, sobre la tarea sintetica Alien Manual. Las herramientas de la tarea son inventadas y generadas por script (`alien/generator.py`), con cuatro patrones de giro posibles: argumentos invertidos, operacion invertida, unidad atipica y herramienta renombrada.

La innovacion tecnica reside en el diseno del benchmark, no en la arquitectura: se evalua la capacidad de seguir documentacion que contradice el nombre de la herramienta, con particion de herramientas no vistas (held-out) y con intervalos bootstrap al 95 %. La dificultad 0 codifica el giro como una nota explicita; la dificultad 1 usa otra redaccion. El autor advierte explicitamente que los resultados de dificultad 0 y 1 no son intercambiables, y que ningun experimento de este repositorio prueba un adaptador entrenado en dificultad 0 contra documentos de dificultad 1. El conjunto de evaluacion consta de 200 ejemplos (162 de trampa y 38 normales), con commit de referencia `b179f32`.

## Capacidades

- Invocacion de herramientas (tool calling) conforme a documentacion, incluido el caso en que la especificacion contradice el nombre de la herramienta.
- Seguimiento de instrucciones documentales frente a sesgos previos aprendidos ("prior trap").
- Generacion de llamadas de herramienta estructuradas con F1 del 94,5 % y validez del 98,5 % en el conjunto held-out de 200 ejemplos.
- Buen rendimiento en herramientas normales sin giro: F1 del 100,0 % (n=42) frente al 95,2 % del base.
- Razonamiento de un paso orientado a seleccion de herramienta y argumentos; no se documenta razonamiento multi-paso ni modo de pensamiento extendido (thinking mode).
- Capacidades multilingues: no disponibles como dato verificable en esta ficha; dependen del base `tiny-aya-global`.
- Vision, audio y otras modalidades: no disponibles en la informacion proporcionada.
- Soporte de agentes: no disponible como funcionalidad documentada; el adaptador esta orientado a la subtarea de invocacion de herramientas.

## Casos de uso

- Investigacion sobre seguimiento de instrucciones: permite reproducir el experimento Alien Manual con semilla 1 y dificultad 0, comparando base, prompt-only y SFT bajo el mismo scorer y las mismas particiones held-out.
- Evaluacion de robustez frente a nombres enganosos: util para medir hasta que punto un modelo sigue la especificacion de una API cuando el nombre de la funcion sugiere otra semantica (por ejemplo, `get_user` que en realidad escribe datos).
- Pruebas de regresion en pipelines de tool calling: sirve como referencia de comportamiento esperado en entornos sinteticos antes de desplegar adaptadores sobre APIs reales.
- Estudio de generalizacion de adaptadores LoRA: al particionar por herramientas (nuevos sustantivos) en vez de por patrones de giro, permite analizar si el adaptador memoriza redacciones o abstrae reglas.
- Calibracion de conjuntos de evaluacion: los intervalos bootstrap y el recuento de ejemplos (162 de trampa, 38 normales) proporcionan una plantilla para dimensionar evaluaciones con incertidumbre acotada.
- Comparacion de estrategias de ajuste: contraste empirico entre prompt-only y SFT para una misma tarea, con metricas de trampa, F1 de llamada, validez y F1 en herramientas normales.
- Docencia y divulgacion tecnica: caso reproducible, con codigo y datos publicados, para explicar sesgos de nombre y fidelidad a documentacion en modelos pequenos.

## Benchmarks y rendimiento

Resultados del autor sobre herramientas held-out (200 ejemplos, commit `b179f32`; intervalos bootstrap al 95 %):

| Metrica | Base | Prompt-only | SFT (este adaptador) |
|---|---|---|---|
| Tasa de trampa de prior (menor es mejor) | 56,3 % [48,7 %, 64,1 %] (n=158) | 54,4 % [46,5 %, 62,6 %] (n=158) | 3,2 % [0,6 %, 6,0 %] (n=158) |
| F1 de invocacion de herramienta | 52,0 % [44,5 %, 59,0 %] (n=200) | 52,5 % [45,0 %, 59,0 %] (n=200) | 94,5 % [91,0 %, 97,5 %] (n=200) |
| Validez de la llamada | 100,0 % [100,0 %, 100,0 %] (n=200) | 100,0 % [100,0 %, 100,0 %] (n=200) | 98,5 % [97,0 %, 100,0 %] (n=200) |
| F1 en herramientas normales | 95,2 % [87,8 %, 100,0 %] (n=42) | 92,9 % [83,9 %, 100,0 %] (n=42) | 100,0 % [100,0 %, 100,0 %] (n=42) |

El veredicto SC-001 del scorer del repositorio es "met": ganancia de al menos 10 puntos sobre ambas lineas base en tasa de trampa y F1 de llamada, con intervalo de confianza por encima de cero. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base `tiny-aya-global`, cuyos parametros no se detallan. El adaptador en si ocupa 0,1 GB en safetensors.
- GPU recomendadas: no disponibles. Al tratarse de un adaptador sobre un modelo de la familia "tiny", es plausible que quepa en GPU de consumo, pero no hay dato verificable en esta ficha.
- Cabe en GPU de consumo: no disponible como afirmacion verificable.
- Opciones de despliegue: carga mediante `peft` sobre el base `CohereLabs/tiny-aya-global`; integracion con vLLM, llama.cpp, Ollama o TGI no documentada para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en Alien Manual (dificultad 0, seed 1) | Licencia |
|---|---|---|---|---|---|
| alien-manual-sft-seed1-hardness0 (este) | LoRA SFT sobre tiny-aya-global | no disponible | no disponible | Trampa 3,2 %; F1 llamada 94,5 % | cc-by-nc-4.0 (heredada) |
| Base `CohereLabs/tiny-aya-global` sin adaptador | Transformer | no disponible | no disponible | Trampa 56,3 %; F1 llamada 52,0 % | cc-by-nc-4.0 |
| Base con prompt-only (sin ajuste) | Transformer con prompting | no disponible | no disponible | Trampa 54,4 %; F1 llamada 52,5 % | cc-by-nc-4.0 |
| Adaptador equivalente con semilla 0 | LoRA SFT sobre tiny-aya-global | no disponible | no disponible | no disponible en esta ficha (conjunto held-out distinto) | no disponible |

No se dispone de comparacion con adaptadores de otras familias (por ejemplo, LoRA sobre Llama o Qwen) en la informacion proporcionada.

## Limitaciones y advertencias

- Las herramientas son inventadas y generadas por script; solo existen cuatro patrones de giro (argumentos invertidos, operacion invertida, unidad atipica, herramienta renombrada), los mismos en entrenamiento y en held-out.
- "Held-out" significa herramientas no vistas (nuevos sustantivos), no patrones de giro no vistos; la generalizacion a giros nuevos no esta demostrada.
- Los resultados de dificultad 0 y dificultad 1 no son intercambiables; ningun experimento de este repositorio prueba el adaptador con documentos de dificultad 1.
- Una unica semilla de entrenamiento por ejecucion y 200 ejemplos held-out (162 de trampa, 38 normales), con intervalos bootstrap al 95 %.
- Solo SFT: no se uso GRPO en estas ejecuciones.
- No se ha probado con herramientas del mundo real ni con ningun otro benchmark; extrapolar a APIs reales exige validacion propia.
- La validez de llamada baja del 100,0 % al 98,5 % con el adaptador, es decir, se sacrifica una fraccion minima de correccion estructural a cambio de la fidelidad documental.
- Licencia `cc-by-nc-4.0` heredada del base: prohibido el uso comercial. El repositorio contiene solo el adaptador, derivado del base, y no redistribuye los pesos del base.
- El modelo base esta bajo acceso restringido (gated) en el Hub, lo que condiciona la reproducibilidad y el despliegue.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion proporcionada; al ser un modelo pequeno entrenado en una tarea sintetica, no debe usarse como sustituto de evaluaciones de seguridad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ignAtom/alien-manual-sft-seed1-hardness0
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Codigo y write-up de Alien Manual: https://github.com/ritamgh/alien-manual
- Dataset con salidas, datos generados y logs: https://huggingface.co/datasets/ignAtom/alien-manual-rerun-data
