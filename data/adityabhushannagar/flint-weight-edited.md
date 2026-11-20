# adityabhushannagar/flint-weight-edited

## Resumen

flint-weight-edited es una variante del modelo base RecursiveSI/flint obtenida mediante edicion directa de pesos, sin entrenamiento adicional ni nuevos datos. El autor, adityabhushannagar, aplica tecnicas de edicion de modelos (weight editing) para corregir dos comportamientos problematicos documentados en las discusiones del modelo original: la deriva de esquema en tool calling (el modelo escribe nombres de argumentos y herramientas aprendidos en preentrenamiento en lugar de los nombres del esquema proporcionado) y el razonamiento desbocado (bloques `<think>` que continuan despues de que la respuesta ya es conocida, agotando el presupuesto de tokens en matematicas y codigo).

El modelo conserva la arquitectura, tokenizador, plantilla de chat y configuracion del original, que es un transformer con mezcla de expertos (MoE). Cuenta con aproximadamente 39.785 millones de parametros totales y un repositorio de 151,9 GB en formato safetensors. La version actual es la v5, que acumula 51 ediciones sobre el modelo base.

La relevancia de esta ficha reside en que demuestra un flujo de trabajo de edicion de pesos reproducible y verificable, con controles de dosis-respuesta y generaciones retenidas, que mejora metricas concretas (tool calling en arneses de agentes, GSM8K) manteniendo intacta la interfaz del modelo original. Es un caso practico de como modificar el comportamiento de un modelo sin reentrenarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); arquitectura identica a RecursiveSI/flint |
| Parametros totales | 39.785.287.456 (~39,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indice sin cambios respecto al original) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) que hereda integramente la arquitectura, tokenizador, plantilla de chat, configuracion y kit de sglang del modelo base RecursiveSI/flint. No se realizo ningun entrenamiento: no hubo actualizaciones de gradiente ni nuevos datos de entrenamiento. La unica diferencia respecto al original son los valores de los tensores bf16, modificados mediante edicion directa de pesos.

Las ediciones se agrupan en varias categorias. Se amplificaron dos cabezas de copia de esquema (multiplicando por 2,5 las columnas de entrada de `self_attn.o_proj` de 11 cabezas) y se ablacionaron tres cabezas de sesgo previo (columnas a cero). Se amplifico el cierre de razonamiento en las capas 37 a 45 mediante la operacion `W ← W + 1.0 · u_l u_lᵀ W`, donde `u_l` es la direccion unitaria de "listo para cerrar `</think>`" en la capa `l`, calculada como la diferencia media de residual entre posiciones donde el siguiente token propio del modelo es `</think>` y otras posiciones de frontera de frase en la misma traza de razonamiento. Ademas, se suprimio la emision de un segundo `</think>` dentro de la respuesta mediante una edicion de rango 1 sobre la fila 150007 de `lm_head.weight`. En v4 y v5 se apagaron neuronas de expertos enrutados y de expertos compartidos identificadas mediante una lente jacobiana sobre 2.918 decisiones de un solo token (368 elecciones de argumento de herramienta en Claude Code, OpenCode, Codex, pi/omp y 12 herramientas inventadas; 2.550 decisiones de parar o continuar dentro del razonamiento del propio modelo). En v5 se apagaron tambien neuronas de "explorar primero" detectadas en 64 decisiones de planificacion de practica.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo de pensamiento explicito mediante bloques `<think>`.
- Tool calling y function calling, con correccion especifica para reducir la deriva de nombres de argumentos y herramientas respecto al esquema proporcionado.
- Razonamiento matematico (mejora medida en GSM8K).
- Razonamiento sobre codigo y tareas de agentes en arneses como Claude Code, OpenCode, Codex y pi/omp.
- Cierre controlado del razonamiento: el modelo termina el bloque `<think>` cuando alcanza un estado de parada, reduciendo el consumo de tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Integracion en arneses de agentes de codigo: el modelo esta editado para emitir nombres de argumentos conformes al esquema (por ejemplo `file_path` en lugar de `path`), lo que reduce errores de validacion en Claude Code, OpenCode, Codex y pi/omp.
- Automatizacion de tool calling en produccion: la mejora de llamadas correctas en arneses de agentes (69,7 % frente a 55,1 % del original) lo hace adecuado para pipelines donde un esquema estricto debe respetarse.
- Razonamiento matematico de varios pasos: la ganancia en GSM8K (78,5 % frente a 62,7 %) y el cierre controlado del razonamiento lo hacen util para resolucion de problemas con presupuesto de tokens limitado.
- Agentes con planificacion acotada: las neuronas de "explorar primero" apagadas en v5 evitan que el modelo gaste la primera llamada en `ls` cuando la tarea pide una accion concreta, como crear un fichero o ejecutar tests.
- Generacion de codigo con razonamiento contenido: el uso de un 17 % menos tokens que el original reduce coste por peticion en tareas de codigo y matematicas.
- Sustitucion directa del modelo base: al conservar arquitectura, tokenizador, plantilla de chat y configuracion, puede desplegarse en infraestructuras ya preparadas para RecursiveSI/flint sin cambios de integracion.

## Benchmarks y rendimiento

| Metrica | Original | v3 | v4 | v5 |
|---|---|---|---|---|
| Puntuacion agregada (1.774 generaciones retenidas emparejadas) | 0,722 | no disponible | no disponible | 0,801 (p < 10⁻¹⁵) |
| Llamadas de herramienta correctas en arneses de agentes | 55,1 % | 59,1 % | 65,4 % | 69,7 % |
| GSM8K | 62,7 % | no disponible | no disponible | 78,5 % |
| Uso de tokens relativo al original | referencia | no disponible | no disponible | 17 % menos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con ~39,8 mil millones de parametros en bf16, el peso completo ocupa aproximadamente 79,6 GB, pero no se confirman requisitos oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El tamano del modelo y el repositorio de 151,9 GB hacen improbable el despliegue en GPU de consumo sin cuantizacion, pero no se aportan datos confirmados.
- Opciones de despliegue: el autor menciona un kit de sglang identico al del modelo original; transformers es la libreria declarada. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles. Solo se documenta una reduccion del 17 % en uso de tokens frente al original en las generaciones evaluadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| flint-weight-edited (v5) | ~39,8 mil millones | no disponible | 69,7 % en arneses | 78,5 % | Apache 2.0 | Hugging Face |
| RecursiveSI/flint (original) | no disponible | no disponible | 55,1 % en arneses | 62,7 % | no disponible en la informacion | Hugging Face |
| Otros modelos de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las ediciones se validaron con prompts de practica y generaciones retenidas; no se documenta una evaluacion exhaustiva en todos los dominios.
- El modelo hereda los sesgos y riesgos de alucinacion del modelo base RecursiveSI/flint, que no estan documentados en la informacion disponible.
- Idiomas soportados no disponibles; no se confirma cobertura multilingue.
- Longitud de contexto no disponible; no se puede garantizar comportamiento en conversaciones de contexto largo.
- Las neuronas apagadas se seleccionaron por su efecto en decisiones de tool calling; aunque su enrutamiento es mayoritario en llamadas de herramienta (40-100 %) y minoritario en matematicas y codigo (0-5 %), podrian afectar comportamientos no evaluados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base RecursiveSI/flint, no disponible en la informacion proporcionada.
- El repositorio ocupa 151,9 GB, lo que implica requisitos de almacenamiento y transferencia considerables.
- No se han publicado resultados de benchmarks adicionales fuera de los recogidos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityabhushannagar/flint-weight-edited
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Especificacion de ediciones: `edit/edit_spec.json` (dentro del repositorio)
- Direcciones de edicion: `edit/directions.pt` (dentro del repositorio)
- Discusiones del modelo base referenciadas: #9, #11, #12 (deriva de esquema); #13, #14, #18, #26 (razonamiento desbocado)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
