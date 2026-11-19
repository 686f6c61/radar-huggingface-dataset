# IIAJIbICH/Spark-X2.6-4B-Blender

## Resumen

Spark-X2.6-4B-Blender es un ajuste fino completo (full fine-tune) del modelo base XHToken/Spark-X2.6-4B-Base, desarrollado por el usuario IIAJIbICH. Su proposito es especializar un modelo de lenguaje de 4.112 millones de parametros en la generacion de scripts Python para Blender 5.x (API `bpy`) que construyan mallas 3D limpias y con topologia cuadrangular dominante. Cubre tanto geometria de superficie dura (props, mobiliario, productos) como mallas organicas con proporciones anatomicas (humanos, manos, cuadrupedos).

El modelo parte de una arquitectura transformer densa de aproximadamente 4.1B parametros, entrenada originalmente por XHToken, y se ha afinado con tecnicas de SFT, rejection sampling, DPO (multiples rondas) y RL con familia GRPO. El entrenamiento se valido ejecutando cada script generado de forma headless en Blender 5.2.1 LTS, conservando unicamente los que compilaban y producian geometria, y puntuando la topologia de la malla resultante.

Es relevante para desarrolladores que necesiten automatizar la generacion de activos 3D procedurales mediante codigo, ya que combina capacidad de generacion de codigo con verificacion ejecutable en un dominio muy especifico. Su licencia Apache 2.0 y su tamano contenido (8.2 GB en safetensors) lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante en la informacion) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 8.2 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4.1B parametros heredado de XHToken/Spark-X2.6-4B-Base. El ajuste es de parametros completos (todos los pesos, sin adaptadores LoRA). El pipeline de entrenamiento documentado incluye varias etapas: SFT sobre datos verificados de BlendNet y anatomia procedural; rondas de rejection sampling con mejores respuestas de best-of-N y turnos de reparacion/refinamiento/pulido de agente; DPO sobre muestras propias (mejor respuesta final frente a bucles o fallos) y sobre muestras open-world evaluadas contra mallas reales de Objaverse-LVIS; SFT sobre generadores procedurales verificados en Blender (torno/panel: curvas, biseles, materiales); SFT de composicion por partes (numeros como variables, kits no vistos); y RL de familia GRPO con episodios multi-turno en Blender, perdida DAPO y recompensa de verificador.

La innovacion clave es el bucle de verificacion ejecutable: cada script generado se ejecuta headless en Blender 5.2.1 LTS y solo se conserva si construye geometria; la topologia se puntua sobre la malla evaluada. El autor documenta multiples variantes (v1, v3, v3d, v3dr, v3drr, v3drrr, v4, v5, v6, v7, v3w1) con distintas combinaciones de SFT, DPO y RL. En la variante v3drrr se emplean pesos maestros fp32 con momentos Adam en bf16.

## Capacidades

- Generacion de codigo Python para la API `bpy` de Blender 5.x.
- Construccion de mallas con topologia cuadrangular dominante (quad-dominant).
- Modelado de superficie dura: props, mobiliario y productos.
- Generacion de mallas organicas con proporciones anatomicas: humanos, manos y cuadrupedos.
- Razonamiento espacial y de composicion por partes (kits, numeros como variables).
- Generacion de scripts procedurales con operaciones de torno, panel, curvas, biseles y materiales.
- Conversacion multi-turno orientada a reparacion, refinamiento y pulido de scripts.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes multi-paso: si, documentado mediante turnos de agente (repair/refine/polish) y RL multi-turno.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Generacion automatizada de props de superficie dura: el modelo produce scripts `bpy` que construyen mobiliario y productos con topologia limpia, adecuados para pipelines de assets en videojuegos y visualizacion arquitectonica.
- Creacion de mallas base organicas: genera humanos, manos y cuadrupedos con proporciones anatomicas correctas, utiles como punto de partida para rigging y escultura digital.
- Retopologia y refinamiento de mallas: los turnos de agente permiten reparar y pulir scripts fallidos o con topologia deficiente, reduciendo la intervencion manual.
- Generacion procedural parametrizada: el uso de numeros como variables y kits de partes permite producir variantes de un mismo objeto cambiando parametros, ideal para catalogos de productos.
- Automatizacion de assets en Objaverse y datasets 3D: el modelo muestra capacidad de generalizacion a categorias no vistas, util para aumentar datasets de entrenamiento 3D.
- Integracion en pipelines de CI/CD para 3D: al ejecutarse headless en Blender, los scripts pueden validarse automaticamente antes de incorporarse a produccion.
- Prototipado rapido de escenas y composiciones espaciales: el modelo resuelve relaciones espaciales entre partes, util para previsualizacion de layouts.

## Benchmarks y rendimiento

Los datos provienen de ejecutar la salida del modelo en Blender 5.2.1 LTS headless con decodificacion greedy. `run` = porcentaje de scripts que ejecutan y construyen geometria; `topo` = puntuacion media de topologia (maximo 1.0); `fid` = fidelidad a la respuesta de referencia.

| Modelo | BlendNet held-out | Anatomia (no vista) | 3DCode held-out | Espacial (held-out) | BlenderWorld texto | Extreme (no vista) | Restricciones duras | Objaverse (held-out) | Prompts reales |
|---|---|---|---|---|---|---|---|---|---|
| base | 2.0% run · topo 0.955 · fid 0.004 | 0.0% run · topo 0.000 · fid 0.000 | 2.0% run · topo 1.000 · fid 0.005 | 6.7% run · topo 0.750 · fid 0.049 · QA 0/100 | 0.0% run · topo 0.000 | – | – | – | – |
| v1 | 99.0% run · topo 0.877 · fid 0.811 | 100.0% run · topo 0.994 · fid 0.959 | 42.0% run · topo 0.943 · fid 0.161 | 95.0% run · topo 1.000 · fid 0.803 · QA 0/100 | – | – | – | – | – |
| v3 | 100.0% run · topo 0.943 · fid 0.801 | 100.0% run · topo 0.994 · fid 0.963 | 40.0% run · topo 0.976 · fid 0.162 | 100.0% run · topo 1.000 · fid 0.979 · QA 35/100 | 66.7% run · topo 0.940 | exact 0.0% · score 0.043 · free 0.0% | constraint 0.0% · score 0.077 | norm 0.238 · beats box 49/78 · judge top-20 10% (mediana 206) | 100.0% run · topo 0.958 |
| v5 | 99.0% run · topo 0.936 · fid 0.792 | 100.0% run · topo 0.995 · fid 0.974 | 30.0% run · topo 0.975 · fid 0.128 | 100.0% run · topo 1.000 · fid 0.997 · QA 38/100 | 53.8% run · topo 0.963 | exact 0.0% · score 0.093 · free 0.0% | constraint 0.0% · score 0.071 | – · judge top-20 12% (mediana 263) | 87.5% run · topo 0.955 |
| v6 | 99.0% run · topo 0.946 · fid 0.785 | 100.0% run · topo 0.995 · fid 0.983 | 32.0% run · topo 0.962 · fid 0.164 | 100.0% run · topo 1.000 · fid 0.998 · QA 41/100 | 46.2% run · topo 0.939 | exact 0.0% · score 0.205 · free 0.0% | constraint 0.0% · score 0.074 | – · judge top-20 13% (mediana 351) | – |
| v7 | 100.0% run · topo 0.893 · fid 0.797 | 100.0% run · topo 0.997 · fid 0.951 | 36.0% run · topo 0.949 · fid 0.146 | 100.0% run · topo 1.000 · fid 0.997 · QA 40/100 | 30.8% run · topo 0.956 | exact 0.0% · score 0.091 · free 0.0% | constraint 0.0% · score 0.069 | – · judge top-20 6% (mediana 492) | 87.5% run · topo 0.978 |
| v3d | 100.0% run · topo 0.942 · fid 0.802 | 100.0% run · topo 0.994 · fid 0.963 | 42.0% run · topo 0.971 · fid 0.169 | 100.0% run · topo 1.000 · fid 0.979 · QA 35/100 | 76.9% run · topo 0.946 | exact 0.0% · score 0.046 · free 0.0% | constraint 0.0% · score 0.081 | norm 0.235 · beats box 51/78 · judge top-20 12% (mediana 208) | 100.0% run · topo 0.960 |
| v3dr | 98.0% run · topo 0.961 · fid 0.788 | 100.0% run · topo 0.997 · fid 0.964 | 42.0% run · topo 0.918 · fid 0.173 | 100.0% run · topo 1.000 · fid 0.981 · QA 34/100 | 79.5% run · topo 0.949 | exact 0.0% · score 0.036 · free 0.0% | constraint 0.0% · score 0.077 | norm 0.466 · beats box 58/78 · judge top-20 11% (mediana 214) | 100.0% run · topo 0.959 |
| v3drr | 99.0% run · topo 0.953 · fid 0.791 | 100.0% run · topo 0.998 · fid 0.965 | 40.0% run · topo 0.934 · fid 0.165 | 98.3% run · topo 1.000 · fid 0.964 · QA 34/100 | 79.5% run · topo 0.956 | exact 0.0% · score 0.029 · free 0.0% | constraint 0.0% · score 0.067 | norm 0.589 · beats box 58/78 · judge top-20 17% (mediana 226) | 100.0% run · topo 0.967 |
| v3drrr | 100.0% run · topo 0.962 · fid 0.797 | 100.0% run · topo 0.998 · fid 0.964 | 30.0% run · topo 0.964 · fid 0.123 | 98.3% run · topo 1.000 · fid 0.962 · QA 33/100 | 76.9% run · topo 0.949 | exact 0.0% · score 0.039 · free 0.0% | constraint 0.0% · score 0.074 | norm 0.634 · beats box 59/78 · judge top-20 16% (mediana 245) | 100.0% run · topo 0.969 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8.2 GB de pesos, mas overhead de activaciones y cache KV (estimacion no oficial).
- En cuantizacion de 8 bits cabe en GPUs de 12-16 GB; en 4 bits, en GPUs de 8 GB (estimacion, no se documentan cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para produccion; RTX 4090 (24 GB) para desarrollo e inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Blender | 4.112M | no disponible | Codigo `bpy` para Blender 5.x | Apache 2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B-Base | 4.112M | no disponible | Base generalista (sin ajuste Blender) | no disponible | Hugging Face |
| Alternativas especializadas en generacion de codigo 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es contra su modelo base: el ajuste eleva el porcentaje de scripts que ejecutan correctamente del 2.0% al 99-100% en BlendNet held-out, y del 0.0% al 100% en anatomia no vista.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en generacion de scripts `bpy` para Blender 5.x; su rendimiento en tareas generales de texto o codigo fuera de este dominio no esta documentado.
- Solo soporta ingles; no se documenta capacidad multilingue.
- Riesgo de alucinacion en APIs o funciones de Blender no cubiertas por el entrenamiento; la validacion mediante ejecucion headless es imprescindible en produccion.
- Los benchmarks de restricciones duras (hard constraints) y Extreme muestran puntuaciones muy bajas (constraint 0.0%, score 0.07-0.21), lo que indica dificultad para cumplir restricciones estrictas y escenarios extremos.
- La fidelidad en 3DCode held-out es baja (fid 0.12-0.17) pese a buen `run` y `topo`, lo que sugiere divergencia respecto a la referencia en esos casos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantias ni soporte.
- No se documentan sesgos conocidos, longitud de contexto ni cuantizaciones oficiales; estos datos deben considerarse no disponibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/IIAJIbICH/Spark-X2.6-4B-Blender
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Dataset BlendNet: https://huggingface.co/datasets/FreedomIntelligence/BlendNet
- Dataset 3DCode: https://huggingface.co/datasets/YipengGao/3DCode
- Paper de referencia (arxiv:2412.14203): https://arxiv.org/abs/2412.14203
