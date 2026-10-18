# ATinyGreenCell/scadcoder-qwen3.5-9b-v4

## Resumen

scadcoder-qwen3.5-9b-v4 es un ajuste fino por LoRA del modelo multimodal Qwen/Qwen3.5-9B (arquitectura `Qwen3_5ForConditionalGeneration`), desarrollado por el usuario ATinyGreenCell. Su especialidad es la generacion de codigo OpenSCAD parametrico para instrumentacion de laboratorio biologico, en el contexto del proyecto Tiiny Pocket Lab. El modelo parte de un modelo base de ~9.650 millones de parametros con capacidades de vision y texto, y conserva el codificador visual mientras fusiona las capas de lenguaje ajustadas en pesos bf16.

La version v4 amplia el conjunto de datos de v2 (7.238 ejemplos verificados por renderizado) con 269 generaciones auto-muestreadas que pasaron el verificador y 680 ejemplos destilados de Claude Opus sobre 17 familias de piezas, todos verificados geometricamente (watertight, caja delimitadora dentro del 15%). El resultado son 9.136 filas de entrenamiento de un solo turno (8.187 unicas) durante 3 epocas con LoRA de rango 32.

Es relevante porque aborda un nicho muy concreto —generacion de CAD textual verificable— con un pipeline de control de calidad basado en renderizado, y porque la version v4 elimina deliberadamente la parafrasis de tareas de benchmark presentes en v3, de modo que sus puntuaciones miden transferencia real y no memorizacion. La licencia es Apache 2.0 y el repo ocupa 19,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForConditionalGeneration`), codificador visual + capas de lenguaje; ajuste fino LoRA fusionado |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `Qwen3_5ForConditionalGeneration` del modelo base Qwen/Qwen3.5-9B: un transformer con codificador visual para entrada image-text-to-text y capas de lenguaje autorregresivas. El ajuste se aplico exclusivamente sobre las capas de lenguaje mediante LoRA de rango 32 con dropout 0,1, y posteriormente se fusiono en pesos bf16 en safetensors. El codificador de vision se mantiene intacto respecto al modelo base, lo que preserva la capacidad de tomar imagenes como entrada ademas de texto.

Los datos de entrenamiento suman 9.136 filas de un solo turno (8.187 unicas) durante 3 epocas: 7.238 ejemplos verificados por renderizado procedentes de v2, 269 generaciones auto-muestreadas de v2 que superaron el verificador (ponderadas x2) y 680 ejemplos destilados de Claude Opus sobre descripciones de 17 familias de piezas que no corresponden a tareas del benchmark Prompt-to-Bench (cada descripcion comparte como maximo el 36% de sus tokens con cualquier prompt del benchmark), tambien verificados por renderizado y ponderados x2. No se menciona RLHF ni DPO; el control de calidad se basa en verificacion programatica (malla watertight, caja delimitadora dentro del 15%) y en rejection sampling. La innovacion principal es metodologica: separacion estricta entre datos de entrenamiento y tareas de evaluacion para medir transferencia.

## Capacidades

- Generacion de codigo OpenSCAD parametrico para piezas de laboratorio biologico y equipamiento cientifico.
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto, gracias al codificador visual preservado del modelo base.
- Razonamiento sobre geometria constructiva: el modelo produce descripciones de solidos y transformaciones traducibles a instrucciones de renderizado.
- Generacion de codigo en un unico turno, orientada a producir un script completo y ejecutable.
- Capacidad de refactorizacion y ajuste de parametros en scripts OpenSCAD existentes (derivada del entrenamiento en descripciones de familias de piezas).
- Capacidades generales de texto y codigo heredadas del modelo base Qwen3.5-9B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente ejecutar el modelo con el modo de razonamiento/thinking **desactivado**.
- Capacidades multilingues: no disponible.
- Modo thinking: debe desactivarse; no forma parte del flujo recomendado.

## Casos de uso

- Generacion de utillaje de laboratorio imprimible en 3D: el modelo produce scripts OpenSCAD completos para soportes de placas, gradillas o adaptadores, que se renderizan y verifican antes de enviarse a impresion.
- Iteracion parametrica de piezas: dado un script existente, se le pide modificar dimensiones, tolerancias o numero de cavidades, manteniendo la estructura del codigo.
- Digitalizacion de bocetos a CAD: al conservar la vision, puede recibir una foto o croquis de una pieza de laboratorio y generar el codigo OpenSCAD correspondiente.
- Repositorio interno de componentes: generacion masiva de familias de piezas a partir de descripciones textuales estandarizadas, con verificacion automatica de malla watertight antes de aceptar el resultado.
- Docencia y formacion tecnica: generacion de ejemplos comentados de OpenSCAD para asignaturas de diseno mecanico o fabricacion digital.
- Prototipado rapido en investigacion: creación de adaptadores personalizados para instrumentos concretos (soportes de sensores, carcasas) en horas en lugar de dias.
- Generacion de datos sinteticos para entrenamiento: uso del modelo como generador dentro de un bucle de rejection sampling con verificador geometrico, tal como se hizo para construir v4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las puntuaciones de v4 sobre el benchmark Prompt-to-Bench miden transferencia (al no existir parafrasis de tareas del benchmark en los datos de entrenamiento), pero no se incluyen cifras numericas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas especificas de generacion CAD.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 10-11 GB (requiere cuantizacion propia, ya que no se publican pesos pre-cuantizados).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 6-7 GB, condicionada a la conversion a GGUF/AWQ por parte del usuario.
- GPU recomendadas: A100 40 GB o H100 para bf16 sin compromisos; RTX 4090 / RTX 3090 (24 GB) para bf16 al limite, con longitud de contexto moderada.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion agresiva, en GPUs de 12-16 GB; no es viable en GPUs de 8 GB en bf16.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servicio en bf16; llama.cpp u Ollama solo si se genera previamente una conversion GGUF, que no se distribuye.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v4 | ~9,65 B | no disponible | Si (image-text-to-text) | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B (modelo base) | ~9,65 B | no disponible | Si | no disponible en la informacion proporcionada | HuggingFace |
| scadcoder-qwen3.5-9b-3ep (v2 del mismo autor) | ~9,65 B | no disponible | Si | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos verificados de otros modelos especializados en generacion OpenSCAD que permitan una comparacion cuantitativa; las diferencias frente al modelo base y frente a v2 son de especializacion y de composicion del dataset, no de parametros.

## Limitaciones y advertencias

- Entrenado exclusivamente con 9.136 filas de un solo turno: el rendimiento en conversaciones multi-turno no esta garantizado y puede degradarse frente al modelo base.
- Dominio muy restringido: OpenSCAD para instrumentacion de laboratorio; fuera de ese ambito su comportamiento equivale al del modelo base o puede ser peor.
- El autor exige ejecutar con el modo de razonamiento/thinking desactivado; activarlo puede degradar la calidad de las salidas.
- Riesgo de alucinacion geometrica: el modelo puede producir scripts sintacticamente validos cuya geometria no es fabricable; se recomienda verificacion por renderizado (watertight, caja delimitadora) en produccion.
- Parte de los datos procede de destilacion de Claude Opus, lo que puede introducir sesgos de estilo y de resolucion de problemas del modelo profesor.
- No hay informacion sobre idiomas soportados; se desconoce el comportamiento en castellano y la calidad de las descripciones en otros idiomas.
- No se publican pesos cuantizados ni formato GGUF, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion.
- Licencia Apache 2.0 para este ajuste, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-9B antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- No se han publicado cifras de benchmark, por lo que las afirmaciones de calidad del autor no son verificables de forma independiente.

## Enlaces

- [HuggingFace: ATinyGreenCell/scadcoder-qwen3.5-9b-v4](https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v4)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Version anterior: scadcoder-qwen3.5-9b-3ep](https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-3ep)
- [Repositorio del proyecto Prompt-to-Bench (detalles en la seccion 6.4)](https://github.com/ATinyGreenCell/prompt-to-bench)
