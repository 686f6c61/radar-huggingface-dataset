# JRamirez-UAB/Flint-40B-A2.5B-EXL3-3.88bpw-24-48GB

## Resumen

Flint 40B-A2.5B es un modelo de mezcla de expertos (MoE) desarrollado por Recursive, orientado a agentes de codigo y automatizacion. Esta ficha concreta es una cuantizacion no oficial de la comunidad, publicada por JRamirez-UAB, que reduce el modelo original en BF16 a una representacion EXL3 de 3,88 bits por peso. El checkpoint resultante ocupa 20,1 GB y esta pensado para servir en GPUs de 24, 32 o 48 GB con vLLM mediante un plugin propio.

El modelo declara 39,8B parametros totales con unos 2,5B activos por token y una ventana de contexto de 262.144 tokens en el original. La cuantizacion conserva ese contexto en las configuraciones de 32 y 48 GB, mientras que en 24 GB el limite practico baja a 224.256 tokens. El autor lo evalua especificamente como agente local de administracion de sistemas Linux en castellano, con opencode y tool calling real.

Su relevancia actual es doble: por un lado, demuestra que un MoE de casi 40B puede desplegarse en una unica GPU de 24 GB con cuantizacion agresiva; por otro, expone las limitaciones de ese enfoque, ya que requiere plugins personalizados de vLLM, opciones de compilacion no estandar y solo funciona en GPUs Ada o posteriores. Es un checkpoint experimental, no una release oficial de Recursive.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con attention sinks, sliding window de 513 y capas de atencion completa NoPE |
| Parametros totales | 10.022.781.344 (segun safetensors); la model card declara 39,8B en el modelo base |
| Parametros activos | Aproximadamente 2,5B por token (dato de la model card del modelo base) |
| Longitud de contexto | 262.144 tokens (224.256 en configuracion de 24 GB) |
| Tipos de cuantizacion | EXL3 3,88 bpw promedio, asignacion de bits por capa, lm_head a 6 bits, embeddings en BF16 |
| Idiomas soportados | Espanol (es), ingles (en) |
| Licencia | Apache-2.0 (heredada de RecursiveSI/flint) |
| Formato de pesos | safetensors (3 shards), configuracion de cuantizacion exl3 |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint es un transformer de mezcla de expertos con router sigmoide, capas con attention sinks y una sliding window de 513 tokens combinada con capas de atencion completa sin codificacion posicional (NoPE). La model card de esta cuantizacion menciona que el modelo incluye compensacion `interm_div` en las capas 46-48. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

Esta version concreta es una cuantizacion EXL3 realizada con exllamav3 1.6.5 y un port propio del autor. Aplica 3,88 bits por peso de media con asignacion por capa, un lm_head a 6 bits y embeddings en BF16. La calibracion incluye sesiones reales del agente de administracion de sistemas del autor, lo que sesga la cuantizacion hacia ese dominio y hacia el castellano. La divergencia KL frente al BF16 se situa entre 0,025 y 0,035, un valor superior al de las cuantizaciones densas del mismo autor. No se documenta decodificacion especulativa en esta configuracion.

## Capacidades

- Generacion de texto y razonamiento encadenado: el modelo siempre razona, ya que su chat template no incluye un interruptor para desactivar el modo de razonamiento.
- Tool calling y function calling: evaluado con la peticion real de opencode con 60 aciertos sobre 60.
- Ejecucion de tareas de agente multi-paso: bateria de 30 sobre 30 en pruebas del autor.
- Administracion de sistemas Linux: tareas reales con opencode con resultados de 8/10, 7/10 y 7/10 (22/30 en total).
- Respuestas largas sin bucles de repeticion: 180 respuestas largas a temperaturas entre 0,5 y 1,0 sin repeticiones detectadas.
- Capacidades multilingues limitadas a espanol e ingles.
- Sin vision ni cabeza MTP: el checkpoint es exclusivamente de texto.
- Razonamiento: 44 aciertos sobre 48 en la bateria del autor.

## Casos de uso

- Agente local de administracion de sistemas Linux: el modelo puede gestionar sesiones de opencode con tool calling real y ejecucion de comandos, gracias a su contexto de hasta 262.144 tokens y a que la calibracion incluye sesiones reales de ese dominio.
- Automatizacion de tareas de TI en un departamento universitario: el autor lo valida en ese escenario concreto en castellano, con resultados de 22/30 en tareas reales, lo que lo hace adecuado para asistentes internos de operaciones.
- Asistente de codigo con razonamiento extendido: su modo de razonamiento permanente y su presupuesto recomendado de al menos 32.768 tokens de salida lo hacen util para depuracion de problemas complejos, a costa de mayor latencia.
- Analisis de documentos tecnicos largos: con contexto fiable hasta unos 64k tokens, puede procesar manuales, logs extensos o configuraciones completas en una sola sesion.
- Servicio de inferencia en una unica GPU de 24 GB: permite desplegar un MoE de casi 40B en hardware de gama profesional con cuantizacion EXL3 y vLLM.
- Despliegue multi-sesion en 32 o 48 GB: con tres sesiones completas de 262.144 tokens en 32 GB o cinco en 48 GB, es viable para equipos pequenos que necesiten varias conversaciones concurrentes.
- Generacion de scripts y automatizacion de infraestructura: su entrenamiento orientado a agentes de codigo y su soporte de tool calling permiten integrarlo en pipelines que generen y validen comandos de shell.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Tool calls con peticion real de opencode | 60/60 |
| Bateria de agente | 30/30 |
| Razonamiento | 44/48 |
| Tareas reales de sysadmin con opencode | 22/30 (8/10, 7/10, 7/10) |
| Respuestas largas sin bucle de repeticion | 180 respuestas, temperaturas 0,5-1,0 |
| Divergencia KL frente a BF16 | 0,025-0,035 |
| Decodificacion, 1 peticion (L40S) | ~61 tok/s |
| Decodificacion, 8 peticiones (L40S) | ~428 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 20,1 GB de pesos; el KV cache en fp8 ocupa 3,4 GB en 24 GB, 11,9 GB en 32 GB y 25,7 GB en 48 GB.
- GPUs recomendadas: NVIDIA L40S (48 GB), RTX PRO 6000 Blackwell Max-Q (96 GB) y RTX PRO 6000 Blackwell Server Edition (96 GB) en las pruebas del autor.
- Solo GPUs Ada o posteriores, por el uso de KV cache fp8 con el backend de atencion Triton.
- Cabe en GPUs de consumo de 24 GB o mas, siempre que sean Ada o posteriores.
- Opciones de despliegue: vLLM 0.31.0 con el plugin `flint_vllm`, el plugin `qwen38_exl3_vision`, exllamav3 y el plugin OrcaSAQ2 con el parche incluido. Requiere `--compilation-config '{"cudagraph_mode":"PIECEWISE"}'`. Un `pip install vllm` estandar, Transformers o SGLang no pueden cargarlo.
- Latencia y throughput: aproximadamente 61 tok/s con una peticion y 428 tok/s con ocho en L40S.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Flint 40B-A2.5B EXL3 3.88 bpw (esta ficha) | 39,8B totales / ~2,5B activos | 262.144 (224.256 en 24 GB) | Apache-2.0 | HuggingFace, cuantizacion comunitaria | Requiere plugins de vLLM y GPU Ada o posterior |
| RecursiveSI/flint (BF16) | 39,8B totales / ~2,5B activos | 262.144 | Apache-2.0 | HuggingFace | Modelo original sin cuantizar; mayor calidad, mayor VRAM |
| Cuantizaciones densas del mismo autor | No disponible | No disponible | Apache-2.0 | No disponible | Divergencia KL inferior a esta version segun el autor |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental y no oficial: no es una release de Recursive y solo ha sido probado en la configuracion exacta descrita por el autor.
- Requiere plugins personalizados de vLLM y una opcion de compilacion no estandar; no funciona con instalaciones estandar de vLLM, Transformers ni SGLang.
- Solo texto: no tiene vision ni cabeza MTP.
- El modelo siempre razona y consume mucho presupuesto de salida; se recomiendan al menos 32.768 tokens para problemas dificiles.
- Fiabilidad de contexto limitada a unos 64k tokens en la practica; mas alla puede entrar en bucles de busqueda y no responder dentro de 16.000 tokens.
- La calibracion esta sesgada hacia el dominio de administracion de sistemas Linux y el castellano; el rendimiento en otros dominios o idiomas puede diferir.
- Divergencia KL de 0,025-0,035 frente al BF16, superior a las cuantizaciones densas del mismo autor.
- Solo GPUs Ada o posteriores; no funciona en generaciones anteriores.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el autor documenta bucles de razonamiento en contextos largos.
- Licencia Apache-2.0 permite uso comercial, pero al ser una cuantizacion comunitaria conviene verificar la licencia del modelo base antes de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/JRamirez-UAB/Flint-40B-A2.5B-EXL3-3.88bpw-24-48GB
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia (arxiv:2406.11235): https://arxiv.org/abs/2406.11235
