# hotocooo/Spark-X2.6-4B-Blender

## Resumen

Spark-X2.6-4B-Blender es un ajuste fino completo (full fine-tune, sin adaptadores) del modelo base XHToken/Spark-X2.6-4B-Base, desarrollado por el usuario hotocooo. Su proposito es generar scripts de Python para Blender 5.x (API `bpy`) que construyan mallas 3D limpias y con predominancia de cuadrilateros: props de hard-surface, mobiliario, productos y mallas organicas base con proporciones anatomicas correctas (humanos, manos, cuadrupedos). El modelo tiene 4.112.079.360 parametros y se distribuye bajo licencia Apache 2.0.

La particularidad del proyecto es su metodologia de evaluacion: cada script de entrenamiento se ejecuto en modo headless dentro de Blender y solo se conservo si compilaba y generaba geometria; la topologia se puntuo sobre la malla evaluada. El autor documenta multiples iteraciones (v1 a v7, v3d, v3dr, v3drr, v3drrr, v3w1) con rondas de rejection sampling, DPO sobre muestras propias y RL de familia GRPO con recompensa de verificador, lo que convierte la model card en un registro poco habitual de experimentacion abierta.

Es relevante para desarrolladores que necesiten automatizar la generacion de geometria procedural en Blender mediante lenguaje natural, un nicho donde los modelos generalistas fallan sistematicamente: el modelo base sin ajustar solo ejecutaba correctamente el 2,0 % de los scripts en el conjunto BlendNet held-out, frente al 99-100 % de las versiones ajustadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Spark-X2.6-4B-Base; detalles no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el autor no documenta GGUF ni otras) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de XHToken/Spark-X2.6-4B-Base, un transformer decoder-only de 4,1B parametros, y se somete a un ajuste fino de parametros completos (los 4.1B pesos, sin LoRA ni adaptadores). El entrenamiento se realizo sobre dos conjuntos de datos: FreedomIntelligence/BlendNet y YipengGao/3DCode, complementados con datos procedurales de anatomia, generadores por familias de piezas (lathe/panel), composicion de partes y muestras de mundo abierto calificadas contra mallas reales de Objaverse-LVIS.

La innovacion metodologica esta en el bucle de datos: los scripts se validan ejecutandolos en Blender 5.2.1 LTS headless y solo se aceptan si producen geometria, con puntuacion de topologia sobre la malla resultante. Sobre esa base el autor aplica rejection sampling (best-of-N), rondas de DPO sobre las mejores muestras frente a fallos y bucles, y RL de familia GRPO (perdida DAPO) con episodios multi-turno en Blender y recompensa de verificador. Tambien experimenta con pesos maestros en fp32 y momentos Adam en bf16 en la ronda v3drrr. El autor advierte que el trabajo sigue en progreso (WIP) y que intentos de mezclar pesos entre versiones solo produjeron regresiones en otras regiones.

## Capacidades

- Generacion de codigo Python para la API `bpy` de Blender 5.x.
- Construccion de mallas con topologia predominantemente de cuadrilateros.
- Modelado de hard-surface: props, mobiliario y productos.
- Generacion de mallas organicas base con proporciones anatomicas: humanos, manos y cuadrupedos.
- Retopologia y control de topologia evaluada sobre la malla resultante.
- Razonamiento espacial para composicion de partes y ensamblaje de kits.
- Generacion de materiales y operaciones de bisel y curvatura en datos procedurales (lathe/panel).
- Conversacion multi-turno orientada a reparar, refinar y pulir scripts (turnos de agente).
- Capacidad de tool calling / function calling: no documentada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio o modo thinking: no documentadas.

## Casos de uso

- Generacion automatizada de props de hard-surface: el modelo produce scripts `bpy` que construyen mobiliario o productos con topologia quad-dominant, adecuados para pipelines de assets donde se exige malla limpia antes de UV y texturizado.
- Creacion de mallas organicas base para personajes: genera humanos, manos y cuadrupedos con proporciones anatomicas, lo que sirve como punto de partida para esculpido posterior; en el conjunto Anatomy (no visto) alcanza 100 % de ejecucion y fidelidad de 0,983 en la version v6.
- Retopologia asistida: dado que la topologia se puntua sobre la malla evaluada (hasta 0,998 en Anatomy en v3drr), puede emplearse para regenerar geometria con mejor flujo de cuadrilateros.
- Generacion de geometria procedural parametrica: los datos de generadores lathe/panel permiten producir piezas curvas y biseladas con materiales, util para variaciones masivas de un mismo diseno.
- Composicion de kits por partes: la ronda v6 entrena con datos de part-composition y numeros como variables, lo que permite ensamblar modelos a partir de componentes definidos.
- Automatizacion de escenas en Blender headless: los scripts se validan ejecutandose en Blender 5.2.1 LTS sin interfaz, por lo que encajan en procesos batch de render o exportacion.
- Reparacion iterativa de scripts fallidos: los turnos de agente (repair/refine/polish) documentados permiten usar el modelo en un bucle donde corrige su propio codigo cuando la ejecucion falla.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutando la salida en Blender 5.2.1 LTS headless con decodificacion greedy. `run` = porcentaje de scripts que ejecutan y construyen geometria; `topo` = puntuacion media de topologia (maximo 1.0); `fid` = fidelidad a la respuesta de referencia.

| Modelo | BlendNet held-out | Anatomy (no visto) | 3DCode held-out | Spatial (held-out) | Real-world prompts |
|---|---|---|---|---|---|
| base (sin ajustar) | 2,0 % run · topo 0,955 · fid 0,004 | 0,0 % run | 2,0 % run · fid 0,005 | 6,7 % run · fid 0,049 · QA 0/100 | no disponible |
| v1 | 99,0 % run · topo 0,877 · fid 0,811 | 100 % run · topo 0,994 · fid 0,959 | 42,0 % run · fid 0,161 | 95,0 % run · fid 0,803 · QA 0/100 | no disponible |
| v3 | 100 % run · topo 0,943 · fid 0,801 | 100 % run · topo 0,994 · fid 0,963 | 40,0 % run · fid 0,162 | 100 % run · fid 0,979 · QA 35/100 | 100 % run · topo 0,958 |
| v6 | 99,0 % run · topo 0,946 · fid 0,785 | 100 % run · topo 0,995 · fid 0,983 | 32,0 % run · fid 0,164 | 100 % run · fid 0,998 · QA 41/100 | no disponible |
| v3drr | 99,0 % run · topo 0,953 · fid 0,791 | 100 % run · topo 0,998 · fid 0,965 | 40,0 % run · fid 0,165 | 98,3 % run · fid 0,964 · QA 34/100 | 100 % run · topo 0,967 |
| v3drrr | 100 % run · topo 0,962 · fid 0,797 | 100 % run · topo 0,998 · fid 0,964 | 30,0 % run · fid 0,123 | 98,3 % run · fid 0,962 · QA 33/100 | 100 % run · topo 0,969 |

Otras metricas reportadas: en Objaverse held-out, v3drrr obtiene normalizacion 0,634 y supera la caja de referencia en 59 de 78 casos, con un 16 % de apariciones en el top-20 de un juez (rango mediano 245). En el conjunto Extreme (no visto), ninguna version logra acierto exacto (0,0 %) y las puntuaciones oscilan entre 0,029 y 0,205. En restricciones duras (hard constraints), el cumplimiento es del 0,0 % en todas las versiones y la puntuacion se mueve entre 0,067 y 0,081. En BlenderWorld text, v3dr y v3drr alcanzan 79,5 % de ejecucion con topologia en torno a 0,95.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Para 4,1B parametros, una estimacion habitual seria en torno a 8-9 GB en bf16/fp16 y 3-5 GB en cuantizaciones de 4 bits, aunque no hay confirmacion oficial ni pesos GGUF publicados.
- GPU recomendadas: no disponibles. Por tamano, cabria esperar funcionamiento en RTX 3090/4090 y GPUs profesionales A100/H100, pero el autor no aporta datos.
- Cabe en GPU de consumo: probable por tamano, sin verificacion publicada.
- Opciones de despliegue: transformers con `custom_code` (el repo requiere codigo personalizado); vLLM, llama.cpp, Ollama o TGI no estan documentados ni confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. El unico punto de referencia directo es el modelo base sin ajustar, XHToken/Spark-X2.6-4B-Base, que comparte los 4,1B parametros y la licencia, y que sirve como linea base en la tabla de benchmarks del autor (2,0 % de ejecucion en BlendNet frente al 99-100 % de las versiones ajustadas). Para el resto de alternativas de generacion de codigo Blender o de modelos de 4B, los datos no estan disponibles.

## Limitaciones y advertencias

- El autor marca explicitamente el modelo como trabajo en progreso (WIP); los intentos de mezclar pesos entre versiones produjeron regresiones en regiones no relacionadas.
- El cumplimiento de restricciones duras es del 0,0 % en todas las versiones evaluadas, con puntuaciones de 0,067 a 0,081: no es fiable para instrucciones con requisitos estrictos.
- En el conjunto Extreme (no visto) no se logra ningun acierto exacto y la puntuacion maxima es 0,205 (v6), lo que indica poca generalizacion fuera de distribucion.
- La fidelidad en 3DCode held-out es baja (0,123-0,173) pese a ejecutar correctamente en el 30-42 % de los casos: puede generar geometria valida que no corresponde a la referencia.
- El QA en tareas espaciales es bajo (33-41 sobre 100).
- El modelo solo declara soporte de ingles.
- Riesgo de alucinacion en APIs de Blender: el autor solo conserva scripts que se ejecutan y generan geometria, pero no documenta tasas de error en llamadas a funciones inexistentes o parametros incorrectos.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de calidad ni soporte; verificar cada script generado antes de integrarlo en produccion.
- Requiere cargar codigo personalizado (`custom_code`) al instanciar el modelo con transformers, lo que implica revisar y confiar en ese codigo.
- No hay pesos cuantizados publicados ni datos de latencia, lo que complica planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hotocooo/Spark-X2.6-4B-Blender
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Dataset BlendNet: https://huggingface.co/datasets/FreedomIntelligence/BlendNet
- Dataset 3DCode: https://huggingface.co/datasets/YipengGao/3DCode
- Paper referenciado (arXiv 2412.14203): https://arxiv.org/abs/2412.14203
