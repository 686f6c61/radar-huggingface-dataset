# florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa-3.0.0

## Resumen

Qwen3.5-4B-DFlash-N16-LLiMa-3.0.0 es un paquete de ejecucion compilado, publicado por el usuario florianvoss, que empaqueta un modelo Qwen3.5 de 4.000 millones de parametros junto con un modelo borrador (draft) para decodificacion especulativa DFlash, todo ello dirigido al acelerador SiMa Modalix y ejecutable con el runtime LLiMa 3.0.0. No se trata de un checkpoint cargable con Transformers, sino de una distribucion de artefactos binarios y pesos ya cuantizados y compilados para un hardware concreto.

El paquete resuelve un problema muy especifico: desplegar un modelo multimodal de 4B en el acelerador Modalix de SiMa.ai (orientado a inferencia en el borde) con aceleracion por decodificacion especulativa DFlash, en la que un modelo borrador propone bloques de 16 tokens (un ancla mas 15 posiciones propuestas) que el modelo objetivo valida. El modelo base es simaai/Qwen3.5-4B-Autoround-Safetensors, con un borrador derivado de simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors.

La relevancia de esta ficha es acotada: es un artefacto de despliegue cerrado sobre hardware propietario, con 184 ficheros ELF verificados y sin datos publicados de tasa de aceptacion ni de throughput. Su interes radica en mostrar como se empaqueta un flujo de decodificacion especulativa cuantizado en INT4/INT8 sobre NPU de borde, mas que en ofrecer un modelo generalista reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) mas modelo borrador DFlash para decodificacion especulativa; paquete compilado para SiMa Modalix |
| Parametros totales | 4B en el modelo objetivo (Qwen3.5-4B); parametros del borrador: no disponible en la informacion proporcionada (una referencia externa cita 537M, sin confirmar) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Objetivo: INT4 simetrico G256 en pesos; borrador (lineales): INT8 simetrico RTN por canal de salida; cabecera de salida del borrador: INT4 empaquetado del objetivo; activaciones en BF16; embeddings y cache KV del objetivo en INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete de runtime Modalix compilado (ficheros ELF y assets propietarios); no es un checkpoint safetensors ni GGUF cargable |

Otros ajustes declarados en la model card: prefill con tamano de grupo 128, ancho de bloque DFlash de 16, resolucion de imagen 448 x 448, Model SDK 3.0.0 y "filter sharing" habilitado donde es compatible.

## Arquitectura y entrenamiento

El paquete combina dos componentes. El objetivo es Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parametros con capacidades multimodales (pipeline image-text-to-text). El borrador es un modelo DFlash que opera con ancho de bloque 16: una posicion ancla mas 15 posiciones propuestas, que el objetivo valida en paralelo. Este esquema de decodificacion especulativa busca reducir el numero de pasos de decodificacion efectivos manteniendo la salida del modelo objetivo.

No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO) en la documentacion proporcionada, ya que esta ficha describe un artefacto de compilacion y no un informe de entrenamiento. La innovacion tecnica destacable es el proceso de compilacion y cuantizacion: pesos del objetivo en INT4 simetrico G256, lineales del borrador en INT8 RTN por canal, activaciones en BF16, embeddings y cache KV en INT8, y reconstruccion de 31 etapas MLP N128 del objetivo con division forzada. La validacion reporta que la compilacion de objetivo y borrador tuvo exito, que el despliegue verifico 184 ficheros ELF y que las comprobaciones de simulador, filter sharing y compatibilidad de buffers pasaron.

## Capacidades

- Generacion de texto y, dado el pipeline image-text-to-text, procesamiento de entrada de imagen (resolucion 448 x 448) junto con texto.
- Decodificacion especulativa DFlash con ancho de bloque 16, gestionada por el runtime LLiMa 3.0.0.
- Inferencia cuantizada mixta (INT4 en pesos del objetivo, INT8 en lineales del borrador, BF16 en activaciones).
- Ejecucion sobre acelerador SiMa Modalix mediante paquete compilado, no sobre GPUs convencionales con Transformers.
- Capacidades de tool calling, agentes, thinking mode o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia en el borde sobre SiMa Modalix: el paquete esta compilado especificamente para este acelerador, de modo que un despliegue con LLiMa 3.0.0 puede ejecutar un modelo de 4B cuantizado en hardware de bajo consumo, sin GPU dedicada.
- Asistentes multimodales embebidos: al admitir image-text-to-text con entrada de imagen de 448 x 448, encaja en aplicaciones de inspeccion visual o asistencia por imagen en dispositivos con NPU Modalix.
- Aplicaciones con contexto moderado: con 4096 tokens de ventana, sirve para tareas de dialogo o resumen de documentos cortos donde no se requiere contexto largo.
- Investigacion en decodificacion especulativa: el paquete permite estudiar el comportamiento de DFlash (bloques de 16, validacion por el objetivo) sobre hardware propietario, aunque sin metricas publicadas de aceptacion.
- Despliegue de referencia para pipelines cuantizados INT4/INT8: util como plantilla de como se estructura un runtime compilado con pesos objetivo y borrador separados.
- Prototipado de flujos image-text-to-text en entornos SiMa: sirve para validar integraciones con el SDK 3.0.0 antes de escalar a modelos mayores.
- Banco de pruebas de compatibilidad de runtime: los 184 ficheros ELF y las etapas MLP reconstruidas permiten comprobar la compatibilidad de buffers y filter sharing en la cadena de compilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que "Modalix generation, acceptance rate and throughput have not been tested for these artifacts", es decir, no hay datos medidos de tasa de aceptacion ni de throughput para estos artefactos. Tampoco se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparativas numericas con otros modelos.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa Modalix (NPU de borde). El paquete no esta pensado para GPU convencionales ni para carga con Transformers.
- Runtime: LLiMa 3.0.0 con soporte de DFlash, junto con Model SDK 3.0.0.
- VRAM estimada para inferencia en GPU: no disponible. El esquema de cuantizacion (INT4 en el objetivo, INT8 en el borrador, BF16 en activaciones) reduce el peso en memoria, pero no se ofrecen cifras de VRAM para el conjunto compilado. Una referencia externa (llmrun.dev) cita 1,40 GB en BF16 para un modelo DFlash de 537M, dato que corresponde al borrador y no al objetivo, y que no esta confirmado para este paquete.
- GPU recomendadas: no aplicable; el artefacto esta compilado para Modalix.
- Compatibilidad con GPU de consumo: no disponible para este paquete compilado (los modelos base Qwen3.5-4B, en sus checkpoints originales, si podrian ejecutarse en GPUs de consumo, pero no es el objeto de esta ficha).
- Opciones de despliegue: `llima run` sobre el directorio descargado. No compatible con vLLM, llama.cpp, Ollama ni TGI en el formato distribuido.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no se han probado para estos artefactos.

Comando de ejecucion indicado por el autor:

```bash
hf download florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa-3.0.0 --local-dir Qwen3.5-4B-DFlash
llima run ./Qwen3.5-4B-DFlash
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa-3.0.0 | 4B (objetivo) mas borrador DFlash | 4096 tokens | Paquete compilado Modalix | Apache 2.0 | HuggingFace, requiere hardware SiMa Modalix |
| simaai/Qwen3.5-4B-Autoround-Safetensors | 4B | no disponible | Safetensors (cuantizado) | ver repositorio origen | HuggingFace |
| simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors | borrador DFlash | no disponible | Safetensors (INT8) | ver repositorio origen | HuggingFace |
| florianvoss/Qwen3-4B-DFlash-N16-LLiMa | 4B (generacion anterior Qwen3) | no disponible | Paquete compilado Modalix | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- No es un checkpoint cargable con Transformers: es un paquete de runtime Modalix descomprimido, con 140 ejecutables en el objetivo y 44 en el borrador. No puede usarse en pipelines estandar de PyTorch o vLLM.
- Dependencia de hardware propietario: requiere un acelerador SiMa Modalix y el runtime LLiMa 3.0.0. Sin ese hardware, el artefacto no es utilizable.
- Sin metricas de rendimiento: no se han publicado tasa de aceptacion, throughput ni latencia. El propio autor declara que estos artefactos no se han probado en Modalix.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Idiomas soportados no disponibles; se desconoce la cobertura multilingue real de esta configuracion.
- Riesgo de alucinacion: no se aportan evaluaciones de fidelidad ni de sesgos; al ser un modelo de 4B cuantizado en INT4, cabe esperar degradacion frente al modelo sin cuantizar, aunque no se documenta la magnitud.
- Restricciones de licencia: la ficha declara Apache 2.0, pero se remite a los repositorios de origen para los terminos aplicables a los checkpoints base y al borrador; conviene verificar la licencia de simaai/Qwen3.5-4B-Autoround-Safetensors y del borrador antes de un uso comercial.
- Trazabilidad incompleta: las revisiones del compilador y la validacion de artefactos se registran en `compilation.json`, pero no se publican en la ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-4B-DFlash-N16-LLiMa-3.0.0
- Variante previa (Qwen3-4B): https://huggingface.co/florianvoss/Qwen3-4B-DFlash-N16-LLiMa
- Checkpoint objetivo: https://huggingface.co/simaai/Qwen3.5-4B-Autoround-Safetensors
- Checkpoint borrador: https://huggingface.co/simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors
- Implementacion PyTorch de DFlash V1 para Qwen3.5-4B: https://github.com/day8reak/qwen3.5-4B-dflash
- Requisitos de hardware de referencia (draft DFlash): https://llmrun.dev/model/z-lab-qwen3-5-4b-dflash
- Cobertura de prensa sobre Qwen3.5: https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
