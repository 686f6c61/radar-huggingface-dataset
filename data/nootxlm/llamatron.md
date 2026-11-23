# nootxlm/Llamatron

## Resumen

Llamatron es una cuantizacion GGUF del modelo NVIDIA Nemotron-3-Nano-30B-A3B-BF16, publicada por el usuario nootxlm. Se trata de una version comprimida del modelo original de NVIDIA, disenada para ejecutarse en hardware de consumo modesto: la model card documenta mediciones sobre una GTX 1650 Max-Q de 4 GB de VRAM y 16 GB de RAM del sistema. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 31.577.940.288 parametros totales, del que solo una fraccion (los expertos activos, segun la nomenclatura "A3B" del nombre) se activa por token.

La relevancia de esta publicacion reside en su enfoque practico: no se presenta como un modelo nuevo, sino como un artefacto de despliegue optimizado mediante cuantizacion guiada por importancia (imatrix) de llama.cpp, manteniendo las capas de atencion y memoria en 8 bits y redondeando el resto con mayor agresividad. El resultado es un unico fichero de 18.725.978.368 bytes que, segun el autor, es aproximadamente 3,4 veces mas pequeno que el modelo original y alcanza 5,7 tokens por segundo frente a los 0,6 del Nemotron Nano 30B en la misma maquina.

La model card describe el modelo como un "agente de decision" orientado a construir herramientas ausentes, con capacidad de razonamiento en modo thinking acotado mediante el parametro `--reasoning-budget` de llama.cpp. La licencia es la NVIDIA Nemotron Open Model License, que impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivada de NVIDIA Nemotron-3-Nano-30B-A3B |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible (la model card usa `-c 2048` en el ejemplo de ejecucion) |
| Tipos de cuantizacion | GGUF con cuantizacion imatrix; capas de atencion y memoria en 8 bits, resto con redondeo mas agresivo |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (fichero unico `nemotron-split3b-imatrix.gguf`, 18.725.978.368 bytes) |

## Arquitectura y entrenamiento

Llamatron no introduce entrenamiento propio: es una cuantizacion del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16. La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE), con 52 capas segun la model card (el comando de ejemplo usa `-ngl 10` para descargar diez de esas 52 capas a la GPU). El proceso de cuantizacion emplea la tecnica imatrix de llama.cpp: primero se mide que pesos resultan mas criticos para el modelo y despues se redondea el resto gastando el error donde el modelo es menos sensible. Las capas responsables de atencion y memoria se preservan en 8 bits, mientras que el resto se comprime con mayor agresividad.

La model card menciona que la version incluida incorpora una reparacion de cache documentada en la discusion 65 del repositorio del modelo base en Hugging Face, y que dicha reparacion se valido previamente sobre el modelo completo de 63 GB, obteniendo tokens identicos y una reduccion del 18,6% en tiempo de generacion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base de NVIDIA y no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno mediante llama-cli.
- Razonamiento en modo thinking con presupuesto acotado mediante `--reasoning-budget` (requiere llama.cpp con el PR #20297, de marzo de 2026).
- Construccion de herramientas y codigo a partir de especificaciones: la model card documenta la generacion de un programa Python para parsear un formato de datos propietario y calcular maximo y media.
- Ejecucion de tareas de tipo agente de decision: identificar una herramienta ausente y construirla.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Generacion de scripts de parseo y transformacion de datos: el modelo puede leer una especificacion de formato (por ejemplo, cadenas `t=0;v=21.5|...`) y producir un programa Python que extraiga y calcule metricas, como demuestra el ejemplo trabajado de la model card.
- Automatizacion de tareas de desarrollo en maquinas sin GPU dedicada: con `-ngl 10 --cpu-moe` el modelo cabe en una GTX 1650 de 4 GB y 16 GB de RAM, lo que permite usarlo como asistente local de codigo en equipos de gama baja.
- Prototipado de agentes que construyen herramientas ausentes: el modelo esta orientado a generar utilidades cuando no existe una herramienta disponible en el entorno, un patron util en pipelines de automatizacion internos.
- Asistencia conversacional local con contexto moderado: el ejemplo usa `-c 2048`, adecuado para dialogos de soporte o consultas tecnicas de longitud media.
- Educacion y experimentacion con modelos MoE cuantizados: sirve para estudiar el comportamiento de un MoE de 31B en hardware de consumo y comparar estrategias de cuantizacion imatrix.
- Generacion de codigo con razonamiento acotado: el limite de 256 tokens de thinking permite obtener respuestas completas sin que el razonamiento consuma toda la ventana de salida, util en entornos con latencia o presupuesto de tokens restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de velocidad en hardware concreto:

| Metrica | Llamatron | Nemotron Nano 30B (referencia) |
|---|---|---|
| Throughput en GTX 1650 Max-Q (4 GB VRAM, 16 GB RAM) | 5,7 tokens/s | 0,6 tokens/s |
| Tamano del artefacto | 18,7 GB | ~63 GB |
| Reduccion de tiempo de generacion con reparacion de cache | 18,6% (medido sobre el modelo completo) | no disponible |

## Requisitos de hardware

- VRAM estimada: el ejemplo medido funciona con 4 GB de VRAM (`-ngl 10` descarga 10 de 52 capas a la GPU) y 16 GB de RAM del sistema, manteniendo los expertos en CPU mediante `--cpu-moe`.
- GPU recomendadas: GTX 1650 Max-Q (configuracion medida). Con mas VRAM se puede aumentar `-ngl` para descargar mas capas; no se especifican modelos concretos superiores en la informacion.
- Cabe en GPU de consumo: si, en una GTX 1650 de 4 GB con la configuracion documentada.
- Opciones de despliegue: llama.cpp (requiere una version con `--reasoning-budget`, PR #20297 de marzo de 2026 o posterior). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 5,7 tokens/s medidos en la configuracion indicada; el modelo original rinde 0,6 tokens/s en la misma maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llamatron (esta ficha) | 31.577.940.288 | no disponible | GGUF (18,7 GB) | NVIDIA Nemotron Open Model License | Cuantizacion imatrix, 5,7 tok/s en GTX 1650 Max-Q |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31.577.940.288 | no disponible | BF16 (~63 GB) | NVIDIA Nemotron Open Model License | Modelo base sin cuantizar, 0,6 tok/s en la misma maquina |
| Alternativas de 30B cuantizadas en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- La cuantizacion agresiva del resto de pesos (fuera de atencion y memoria) puede degradar la calidad respecto al modelo BF16 original; no se aportan evaluaciones de calidad comparativas.
- El ejemplo de ejecucion usa una ventana de contexto de 2048 tokens; no se confirma la longitud de contexto maxima soportada.
- El modo thinking requiere `--reasoning-budget`, disponible solo en versiones de llama.cpp posteriores a marzo de 2026 (PR #20297); versiones anteriores fallan con `error: invalid argument`.
- La licencia NVIDIA Nemotron Open Model License impone condiciones especificas para uso comercial; es necesario revisar el enlace oficial antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica.
- El modelo esta orientado a un perfil de "agente de decision" y construccion de herramientas; su comportamiento en otras tareas puede diferir del modelo base.
- El repositorio tiene 459 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/nootxlm/Llamatron
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Discusion sobre la reparacion de cache: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/discussions/65
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- llama.cpp PR #20297 (parametro `--reasoning-budget`): no disponible como enlace directo en la informacion
