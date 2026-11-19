# loom-draft/mradermacher-Transliteration-2.0-4B-Safetensors-i1-loom

## Resumen

`loom-draft/mradermacher-Transliteration-2.0-4B-Safetensors-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el proyecto Loom a partir del checkpoint GGUF sin modificar `mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado orientado a la ejecucion del modelo base sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer de 4B parametros especializado en transliteracion, es decir, en la conversion de texto entre sistemas de escritura (por ejemplo, alfabeto latino a cirilico, arabe o devanagari) preservando la pronunciacion. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta una ventana de contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes, con un maximo de 4.096 tokens de salida por respuesta.

Su relevancia es acotada pero concreta: permite servir el modelo base en hardware AMD de consumo y profesional mediante el runtime Loom, sin necesidad de recompilar kernels a mano ni de recurrir a llama.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB, lo que sugiere que los ficheros del paquete no estan materializados en el repositorio o que este se publico de forma reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 4B parametros; arquitectura concreta no especificada en la informacion proporcionada) |
| Parametros totales | 4B (segun el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom se genera a partir de esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con programas `.loom` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Tool calling | no aplicable |
| Vision / audio | no aplicable |
| Decodificacion especulativa | no aplicable |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Se sabe que el checkpoint original es `Transliteration-2.0-4B-Safetensors`, convertido a GGUF por mradermacher en su variante `i1` y cuantizado a Q4_K_M, y que el paquete Loom se genero con la herramienta `loom-next` "solo el generador, sin LLM en el bucle", es decir, sin intervencion de un modelo generativo en la produccion del paquete.

El paquete en si no modifica los pesos: la model card indica explicitamente que se trata del "checkpoint GGUF sin modificar". La innovacion tecnica del repositorio es, por tanto, de infraestructura y no de modelado: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo en la GPU. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en el modelo base.

## Capacidades

- Transliteracion de texto entre sistemas de escritura, que es la tarea declarada del modelo base.
- Generacion de texto conversacional a traves de una API compatible con OpenAI.
- Modo de razonamiento o "thinking" opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos.
- Hasta 4 peticiones concurrentes con garantia de consistencia declarada (la puerta `consistency` verifica que las peticiones concurrentes producen la misma salida que ejecutadas por separado).
- Soporte de muestreo configurable (temperature, top_k, seed) segun la puerta `sampling`, aunque el estado de esa caracteristica figura como "no determinado" en la tabla de features.
- No soporta tool calling, razonamiento con esfuerzo configurable, decodificacion especulativa, entrada de imagen ni audio.

## Casos de uso

- Transliteracion de nombres y toponimos entre alfabetos: el modelo convierte cadenas como nombres propios o direcciones de un sistema de escritura a otro preservando la fonetica, tarea para la que fue disenado el checkpoint base.
- Normalizacion de datos multilingues en pipelines ETL: integrado en un servicio con API OpenAI, puede procesar lotes de registros con escrituras mixtas antes de cargarlos en una base de datos, aprovechando la ventana de 262.144 tokens para documentos extensos.
- Servicio local en hardware AMD: el paquete esta pensado para ejecutarse en Strix Halo o R9700 con `loom-serve`, lo que permite desplegar el modelo en una estacion de trabajo sin depender de GPUs NVIDIA ni de servicios en la nube.
- Procesamiento de documentos largos con contexto extendido: la ventana de 262.144 tokens permite pasar articulos, expedientes o transcripciones completas en una sola peticion, util para tareas de transliteracion de corpus enteros.
- Experimentacion con el runtime Loom: el repositorio sirve como ejemplo reproducible de empaquetado de un GGUF para el ecosistema Loom, con comandos de instalacion y servicio documentados para ambas GPUs objetivo.
- Despliegue con concurrencia moderada: con 4 peticiones simultaneas y 4.096 tokens de salida maxima, encaja en herramientas internas de un equipo pequeno donde el volumen no justifica infraestructura mayor.
- Modo thinking para tareas de desambiguacion: activando `enable_thinking`, el modelo puede razonar sobre transliteraciones ambiguas (por ejemplo, nombres con varias lecturas posibles) antes de emitir la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero en ambas indica que "los resultados para este paquete aun no se han vuelto a medir". Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "no medidas aun" para ambas GPUs, por lo que no hay evidencia registrada de su comportamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con cuantizacion Q4_K_M sobre 4B parametros, el peso de los pesos ronda los 2,5-3 GB, a lo que hay que sumar la cache KV para contextos largos (hasta 262.144 tokens), que puede dominar el consumo en funcion de la arquitectura.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo AMD; el paquete esta dirigido a los dos aceleradores citados.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles; la model card indica que las mediciones aun no se han repetido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-Transliteration-2.0-4B-Safetensors-i1-loom` | 4B | 262.144 tokens | Apache 2.0 | GGUF + paquete Loom | Empaquetado para AMD Strix Halo y R9700; sin benchmarks publicados |
| `mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF` | 4B | no disponible | Apache 2.0 (heredada) | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp |
| Modelos de transliteracion especializados de 4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa se limita al modelo base del que deriva el paquete, ya que la informacion proporcionada no incluye alternativas equivalentes con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio es un artefacto de empaquetado, no un modelo nuevo: cualquier limitacion del checkpoint base (sesgos, alucinaciones, cobertura de escrituras) se hereda sin cambios.
- No hay benchmarks ni puertas de correctitud medidas para este paquete; no existe evidencia publicada de que la salida coincida con la de llama.cpp en las GPUs objetivo.
- El soporte de hardware esta restringido a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs.
- El modo thinking esta desactivado por defecto y debe activarse explicitamente; el comportamiento con thinking activado no esta validado por las puertas de correctitud.
- El muestreo figura como "no determinado" en la tabla de caracteristicas, lo que introduce incertidumbre sobre la reproducibilidad de la generacion con temperature y top_k distintos de los valores por defecto.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB: conviene verificar que los ficheros del paquete esten efectivamente disponibles antes de integrarlo en un pipeline.
- La licencia Apache 2.0 permite uso comercial, pero al no haber datos sobre el entrenamiento del modelo base no puede evaluarse el riesgo de sesgos ni la procedencia de los datos.
- No se dispone de informacion sobre idiomas soportados, lo que impide garantizar cobertura para escrituras concretas sin pruebas previas.
- La ventana de 262.144 tokens puede implicar un consumo de memoria elevado en cache KV; no se proporcionan estimaciones de VRAM para contextos maximos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Transliteration-2.0-4B-Safetensors-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
