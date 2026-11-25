# loom-draft/mradermacher-NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16-i1-loom

## Resumen

Este repositorio no contiene un modelo entrenado por el autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF ya existente `mradermacher/NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16-i1-GGUF`, en su variante `NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16.i1-Q4_K_M.gguf`. El paquete está orientado a dos aceleradores AMD concretos: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, por su nomenclatura, es un transformer de tipo mezcla de expertos (MoE) con 30B parámetros totales y 3B parámetros activos por token, derivado de la familia NVIDIA Nemotron Labs y publicado en precisión BF16 antes de su cuantización a Q4_K_M. El paquete Loom añade el runtime necesario para servirlo vía API compatible con OpenAI (`/v1/chat/completions`), con un contexto declarado de 262.144 tokens por petición y hasta 4 peticiones concurrentes.

Su relevancia es acotada y muy específica: permite ejecutar un MoE de 30B en hardware AMD consumer y de estación de trabajo sin depender de CUDA ni de llama.cpp, con un modo de razonamiento activado por defecto. No obstante, el propio autor indica que las mediciones de rendimiento y las pruebas de corrección para este paquete aún no se han vuelto a medir, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura del checkpoint base; detalles internos no disponibles |
| Parametros totales | 30B (segun el nombre del checkpoint) |
| Parametros activos | 3B (segun el nombre del checkpoint) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del checkpoint base; terminos concretos no disponibles) |
| Formato de pesos | GGUF dentro de un paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Aceleradores objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de lo que se deduce de su nombre: un MoE con 30B parametros totales y 3B activos, distribuido originalmente en BF16 y aqui cuantizado a Q4_K_M. No se detalla el numero de expertos, la estrategia de enrutamiento, la composicion del dataset de entrenamiento, el volumen de tokens ni si hubo fases de RLHF, DPO o ajuste por preferencias.

El paquete Loom en si no reentrena ni modifica los pesos: el autor indica explicitamente que se trata del checkpoint GGUF "sin modificar". Lo que aporta es la capa de ejecucion: kernels generados para las arquitecturas gfx1151 y gfx1201, un pool de memoria de tamano fijo (`--pool_backing=fixed`), precarga de parametros en el host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo. El modo de razonamiento esta activado por defecto y se desactiva con `chat_template_kwargs: {"enable_thinking": false}`. No hay decodificacion especulativa, ni entrada de imagen, ni entrada o salida de audio.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Modo de razonamiento o "thinking" activado por defecto, desactivable por peticion.
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales largos.
- Procesamiento concurrente de hasta 4 peticiones.
- Salida limitada a 4.096 tokens por respuesta segun el preset incluido.
- Tool calling: no aplicable segun la tabla de caracteristicas del autor.
- Ajuste de esfuerzo de razonamiento ("reasoning effort"): no aplicable.
- Decodificacion especulativa: no aplicable.
- Vision: no aplicable.
- Audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD: el paquete esta pensado para servir el modelo en una Radeon AI PRO R9700 de 32 GB o en un Ryzen AI Max+ 395, sin CUDA, usando `loom-fetch` y `loom-serve` con un unico comando por acelerador.
- Asistente conversacional de contexto largo: con 262.144 tokens por peticion se pueden enviar contratos, documentacion tecnica o historiales completos sin trocear, manteniendo coherencia en la respuesta.
- Analisis de documentos extensos en local: resumen y extraccion de informacion sobre corpus de decenas de miles de tokens, con el modo de razonamiento activo para tareas que requieren inferencia encadenada.
- Evaluacion comparativa de runtimes AMD: el paquete incluye puertas de correccion (`golden`, `compare`, `consistency`, `logits`) disenadas para contrastar la salida contra llama.cpp token a token, lo que lo hace util como banco de pruebas de kernels ROCm.
- Servicio interno de chat para equipos pequenos: las 4 peticiones concurrentes y la API compatible con OpenAI permiten integrarlo tras un proxy en herramientas internas sin reescribir clientes.
- Prototipado de aplicaciones con razonamiento explicito: al poder activar y desactivar el modo thinking por peticion, sirve para comparar coste y calidad en flujos donde el razonamiento intermedio es opcional.
- Inferencia en hardware de escritorio con memoria unificada: en Strix Halo el modelo cuantizado a Q4_K_M puede residir en la memoria del sistema compartida con la GPU, evitando la compra de aceleradores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambas indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambos aceleradores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El peso incluido es Q4_K_M de un modelo de 30B parametros, y el destino declarado es una GPU de 32 GB (Radeon AI PRO R9700) o un SoC con memoria unificada (Strix Halo); el paquete usa pool de memoria fijo, por lo que la reserva se compromete por adelantado.
- GPU recomendadas segun el autor: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPU NVIDIA ni otras arquitecturas AMD.
- GPU consumer: no hay confirmacion de funcionamiento en GPUs de consumo distintas de las dos anteriores; la informacion disponible no lo cubre.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este paquete (Loom, Nemotron Labs 3 Elastic 30B-A3B) | 30B | 3B | 262.144 | Q4_K_M | other | Solo gfx1151 y gfx1201; sin mediciones publicadas |
| `mradermacher/NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16-i1-GGUF` (base) | 30B | 3B | no disponible | GGUF (incluye Q4_K_M) | other | Checkpoint de origen, sin empaquetado Loom |
| Alternativas de 30B-A3B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparado que permitan establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Las mediciones de rendimiento y las pruebas de correccion del paquete no se han vuelto a medir; no hay evidencia publicada de que la salida coincida con llama.cpp en este empaquetado concreto.
- El soporte de hardware esta restringido a AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta compatibilidad con otras GPU.
- Tool calling, vision, audio, decodificacion especulativa y ajuste de esfuerzo de razonamiento figuran como no aplicables.
- La longitud de contexto declarada (262.144 tokens) no esta acompanada de pruebas de calidad en contextos largos para este paquete.
- La licencia es "other" y los terminos concretos no se detallan en la informacion disponible; es imprescindible revisar la licencia del checkpoint base antes de cualquier uso comercial.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base.
- El repositorio no registra descargas ni interacciones, y el pipeline no esta declarado; se trata de un artefacto de despliegue, no de un modelo evaluado por la comunidad.
- El limite de 4.096 tokens de salida por respuesta puede ser insuficiente para generacion larga sin ajustar el preset.
- El modo de espera activa en GPU (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en vuelo, lo que afecta al rendimiento del resto del sistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16-i1-loom
- Checkpoint base en Hugging Face: https://huggingface.co/mradermacher/NVIDIA-Nemotron-Labs-3-Elastic-30B-A3B-BF16-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
