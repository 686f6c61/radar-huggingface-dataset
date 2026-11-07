# fastcoder-factory/gpt-oss-20b-FCF-ck400-ablation-halfdata

## Resumen

`gpt-oss-20b-FCF-ck400-ablation-halfdata` es un ajuste fino por refuerzo del modelo `openai/gpt-oss-20b` desarrollado por el colectivo `fastcoder-factory`. El objetivo es especializar el modelo en optimización de codigo: reescribir funciones en Python y C++ para que sean mas rapidas manteniendo la correccion funcional. Se entrena con GSPO (Group Sequence Policy Optimization) mediante LoRA sobre 479 ejercicios generados por la propia factoria FastCoder-Factory, y el adaptador se fusiona despues en los pesos bf16 del modelo base.

La relevancia de esta publicacion es metodologica: forma parte de un ablation sobre el tamano del conjunto de entrenamiento. Existe un modelo hermano (`gpt-oss-20b-FCF-ck400`) entrenado con los 958 ejercicios completos, mientras que este usa una mitad aleatoria con semilla. Ambos comparten receta, configuracion LoRA y numero de pasos, y se liberan en el mismo checkpoint 400, de modo que la unica variable que cambia es el numero de ejercicios distintos. Esto permite medir cuanto importa la diversidad de datos frente al volumen de pasos de RL.

Al conservar arquitectura, tokenizer y plantilla de chat del modelo base, es un reemplazo directo en despliegues existentes de `gpt-oss-20b` (por ejemplo en vLLM), con la ventaja de mejorar sustancialmente la generacion de codigo optimizado y el coste de mantener una infraestructura y unos prompts ya probados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (hereda la de `openai/gpt-oss-20b`); LoRA sobre atencion y expertos |
| Parametros totales | no disponible (heredados de `openai/gpt-oss-20b`) |
| Parametros activos | no disponible (modelo base MoE con 32 expertos) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos liberados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, pesos fusionados; libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos bf16 de `unsloth/gpt-oss-20b-BF16` y aplica un ajuste fino con GSPO (una variante de RL con politica de grupo) usando LoRA estandar con escala α/r y sin dropout. El adaptador cubre las 24 capas del modelo: modulos de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y modulos de los 32 expertos (`gate_up_proj`, `down_proj`), con rango 16 y α 32. El router del MoE no se adapta. Tras el entrenamiento, el adaptador se fusiona en los pesos bf16 con redondeo estocastico (semilla 400), y los detalles quedan documentados en `merge_info.json`.

Los datos de entrenamiento son 479 ejercicios de optimizacion de codigo (265 en Python, 214 en C++) generados con FastCoder-Factory. En cada paso se muestrean 8 completaciones por prompt (64 por paso) con esfuerzo de razonamiento medio, y la publicacion corresponde al checkpoint 400. La innovacion principal no es arquitectonica sino experimental: el modelo es el brazo de "media data" de un ablation de tamano de conjunto de entrenamiento, disenado para aislar el efecto del numero de ejercicios distintos frente a un entrenamiento gemelo con los 958 ejercicios.

## Capacidades

- Generacion y reescritura de codigo con foco en optimizacion de rendimiento en Python y C++.
- Razonamiento sobre transformaciones algorítmicas (por ejemplo, reemplazar bucles ingenuos por versiones vectorizadas o con mejor localidad de memoria).
- Capacidad de razonamiento configurable (el entrenamiento se hizo con esfuerzo medio; los benchmarks se reportan con esfuerzo alto).
- Hereda del modelo base la plantilla de chat y la interfaz de `transformers`, por lo que mantiene las capacidades generales de `gpt-oss-20b` (no documentadas en esta model card).
- Compatible con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Soporte de tool calling y de agentes: no documentado especificamente para este ajuste; se hereda del modelo base en la medida en que este lo soporte.

## Casos de uso

- Optimizacion automatica de funciones Python en un pipeline de CI: el modelo recibe una funcion y sus tests, y devuelve una version mas rapida que se valida contra la suite existente antes de fusionarse.
- Aceleracion de kernels y bucles en C++: util para equipos que mantienen bibliotecas de calculo numerico y quieren propuestas de reescritura con ganancias de velocidad medibles (el modelo se evalua precisamente en PolyBench y ParEval).
- Revision de codigo orientada a rendimiento: como revisor en un flujo de pull requests que sugiere alternativas mas eficientes y justifica el cambio.
- Generacion de variantes de una misma funcion para comparar empiricamente: dado que el modelo produce varias completaciones por prompt, encaja en un banco de pruebas que mida speedup real.
- Formacion y evaluacion interna: al ser un ablation reproducible con semilla y configuracion publicadas, sirve como referencia para estudiar el efecto del tamano del dataset en RL.
- Sustitucion directa en despliegues existentes de `gpt-oss-20b`: al compartir tokenizer y plantilla de chat, se puede servir en vLLM sin cambios en la capa de aplicacion.
- Prototipado de asistentes de codigo especializados en rendimiento para dominios concretos (numerico, simulacion, procesado de datos) donde el cuello de botella es la velocidad de ejecucion.

## Benchmarks y rendimiento

Resultados publicados por el autor. Esfuerzo de razonamiento alto, media de 5 ensayos ± error estandar. Las soluciones incorrectas cuentan como speedup 1×.

| Benchmark | Metrica | gpt-oss-20b | FCF-ck400 (958 ejercicios) | Este modelo (479 ejercicios) |
|---|---|---|---|---|
| ParEval (C++) | Correcto (%) | 82,7 ± 1,8 | 96,3 ± 0,3 | 92,9 ± 1,5 |
| ParEval (C++) | Speedup (×) | 3,84 ± 0,18 | 4,56 ± 0,09 | 4,05 ± 0,13 |
| PolyBench (C++) | Correcto (%) | 78,7 ± 1,3 | 92,7 ± 1,9 | 92,0 ± 1,7 |
| PolyBench (C++) | Speedup (×) | 4,75 ± 0,30 | 4,95 ± 0,07 | 4,40 ± 0,31 |
| PolyBench (Python) | Correcto (%) | 89,3 ± 1,9 | 92,7 ± 1,2 | 93,3 ± 1,5 |
| PolyBench (Python) | Speedup (×) | 5,69 ± 0,22 | 7,27 ± 0,26 | 6,55 ± 0,29 |

Lectura: el ajuste con media data supera al modelo base en todas las metricas de correccion y de speedup, y queda por debajo del modelo entrenado con el doble de ejercicios en casi todas las celdas, salvo en la correccion de PolyBench Python, donde lo iguala o supera ligeramente dentro del margen de error.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un modelo de la familia `gpt-oss-20b` con pesos bf16, requiere una GPU con memoria suficiente para bf16 completo o para una cuantizacion del modelo base; no se publican cifras concretas.
- GPU recomendadas: no disponible. El autor solo indica que el modelo se sirve tal cual en vLLM.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: vLLM (soporte explicito del autor) y `transformers` (libreria declarada). Otras opciones como llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FCF-ck400-halfdata) | no disponible (base MoE) | no disponible | RL (GSPO) sobre 479 ejercicios de optimizacion de codigo | Apache 2.0 | Hugging Face |
| `fastcoder-factory/gpt-oss-20b-FCF-ck400` | mismos que el base | no disponible | Misma receta sobre 958 ejercicios | Apache 2.0 | Hugging Face |
| `openai/gpt-oss-20b` | no disponible | no disponible | Modelo base generalista | Apache 2.0 (segun el ajuste) | Hugging Face |
| `fastcoder-factory/gpt-oss-20b-fastcoder-python` | mismos que el base | no disponible | Ajuste orientado a Python | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un modelo de investigacion de un colectivo pequeno, con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa ni uso en produccion documentado.
- El entrenamiento se limita a 479 ejercicios generados sinteticamente por FastCoder-Factory, lo que puede introducir sesgos hacia los patrones de esos generadores y reducir la generalizacion a codigo real de otros dominios.
- El objetivo es la optimizacion de rendimiento; no se documenta su comportamiento en tareas generales, y un ajuste tan especifico puede degradar capacidades del modelo base fuera del dominio de codigo.
- Riesgo de alucinacion en la justificacion de optimizaciones: las propuestas de speedup deben validarse siempre con mediciones reales, no con la explicacion del modelo.
- Los benchmarks se reportan con esfuerzo de razonamiento alto, mientras que el entrenamiento uso esfuerzo medio; el comportamiento puede variar con otras configuraciones.
- No se documentan idiomas soportados ni el impacto del ajuste en el multilingüismo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos generados deben revisarse por separado antes de un despliegue en produccion.
- El modelo es el brazo de un ablation: su interes principal es comparativo, no como sustituto del modelo entrenado con el conjunto completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastcoder-factory/gpt-oss-20b-FCF-ck400-ablation-halfdata
- Modelo hermano (958 ejercicios): https://huggingface.co/fastcoder-factory/gpt-oss-20b-FCF-ck400
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Pesos bf16 de referencia: https://huggingface.co/unsloth/gpt-oss-20b-BF16
- Otro ajuste del mismo autor: https://huggingface.co/fastcoder-factory/gpt-oss-20b-fastcoder-python
