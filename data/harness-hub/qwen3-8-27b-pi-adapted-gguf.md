# harness-hub/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es la distribucion en formato GGUF del adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`, publicado por el usuario harness-hub. El adaptador se entrena con aprendizaje por refuerzo dentro del harness `pi` sobre el modelo base `Qwen/Qwen3.8-27B`, y esta empaquetado para su uso con llama.cpp y el servidor `llama serve`. El repositorio ofrece dos artefactos: un modelo fusionado cuantizado en Q8_0 (28,6 GB) y el adaptador LoRA aislado en F16 (unos 319 MB) que se aplica sobre el GGUF del modelo base.

El objetivo del adaptador es mejorar el comportamiento agentico del modelo base en tareas de ingenieria de software y terminal, reduciendo ademas el coste en tokens. Segun la model card, en SWE-bench Pro (hard 51) pasa del 39,2 % al 64,7 % y en Terminal-Bench 2.1 del 39,5 % al 55,8 %, manteniendo la precision del modelo base en su maximo esfuerzo de razonamiento pero generando aproximadamente 4,5 veces menos tokens cuando el modo thinking esta desactivado.

La relevancia actual es doble: por un lado, demuestra que un adaptador LoRA pequeno puede aportar una mejora sustancial en tareas de agentes sin reentrenar el modelo completo; por otro, ofrece una ruta de despliegue local practica mediante llama.cpp, con un modelo fusionado listo para servir y un adaptador separable que permite reutilizar el GGUF del base. Conviene senalar que el identificador del repositorio indica "27B", pero el dato real de parametros en safetensors del propio repositorio es de 159.383.552, una discrepancia que debe verificarse antes de dimensionar infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); adaptador LoRA entrenado con RL sobre el base |
| Parametros totales | 159.383.552 segun safetensors del repositorio; el nombre del modelo indica 27B (dato no coherente, verificar) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en el ejemplo de servicio (`-c 65536`); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q8_0 (modelo fusionado); adaptador LoRA en F16; se menciona Q4_K_M del base como alternativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo fusionado Q8_0 y adaptador LoRA F16) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3.8-27B`, entrenado mediante aprendizaje por refuerzo dentro del harness `pi`. El adaptador se entrena sobre los pesos en BF16 del modelo base y posteriormente se convierte a GGUF con `convert_lora_to_gguf.py` en precision F16. El repositorio distribuye dos variantes: el adaptador fusionado con el base BF16 antes de cuantizar a Q8_0, y el adaptador aislado para aplicar sobre el GGUF del base.

El entrenamiento se realizo sin modo thinking: la model card indica que el adaptador se entreno sin razonamiento explicito y que activarlo no mejora la precision pero multiplica por cuatro los tokens generados. La evaluacion reportada se hizo con el adaptador en BF16 servido por vLLM bajo el harness `pi`, con un intento por tarea, un presupuesto de 100 pasos, thinking desactivado y temperatura 0,8. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni el algoritmo de RL empleado.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de agentes.
- Resolucion de incidencias de ingenieria de software (SWE-bench Pro) y operaciones en terminal (Terminal-Bench 2.1).
- Ejecucion de tareas multi-paso bajo un harness de agentes (`pi`), con presupuesto de pasos configurable.
- Reduccion del coste en tokens: con thinking desactivado iguala la precision del base en esfuerzo maximo generando unas 4,5 veces menos tokens.
- Menor numero de turnos por tarea: menos de la mitad de turnos que el base en las tareas que ambos resuelven.
- Compatibilidad con llama.cpp mediante `llama serve`, incluyendo carga de adaptadores LoRA con `--lora`.
- Soporte de plantilla de chat con `enable_thinking` configurable mediante `--chat-template-kwargs`.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reparacion automatizada de bugs en repositorios: el adaptador esta entrenado especificamente sobre SWE-bench Pro, por lo que encaja en pipelines que reciben un issue y deben producir un parche verificable, con un presupuesto de pasos acotado.
- Automatizacion de tareas de terminal: con la mejora en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, inspeccionan salidas y corrigen errores en entornos de shell.
- Despliegue local en estaciones de trabajo: el modelo fusionado Q8_0 (28,6 GB) se sirve con `llama serve` en una sola maquina, sin depender de APIs externas, lo que facilita entornos con requisitos de privacidad.
- Reduccion de coste en inferencia agentica: al igualar la precision del base en esfuerzo maximo con unas 4,5 veces menos tokens con thinking desactivado, es util en pipelines donde la latencia y el coste por token son criticos.
- Integracion en el harness `pi`: mediante `pi install git:github.com/huggingface/pi-llama` y `pi --model llama-cpp/qwen3.8-pi`, se puede usar como motor de agentes dentro de ese ecosistema.
- Reutilizacion del adaptador sobre el base: al distribuirse el LoRA en F16 (319 MB), se puede aplicar sobre el GGUF del base ya descargado, actualizando el comportamiento agentico sin volver a bajar el modelo completo.
- Prototipado de agentes con contexto largo: el ejemplo de servicio fija 65.536 tokens de contexto, suficiente para tareas que requieren mantener el estado de un repositorio o una sesion de terminal extensa.

## Benchmarks y rendimiento

| Benchmark | Base | Adaptador pi | Delta |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2 % | 64,7 % | +25,5 puntos (15 tareas nuevas resueltas, 2 perdidas) |
| Terminal-Bench 2.1 | 39,5 % | 55,8 % | +16,3 puntos (16 tareas nuevas resueltas, 2 perdidas) |
| Precision con thinking desactivado | igual al base en esfuerzo `xhigh` | igual al base en esfuerzo `xhigh` | ~4,5 veces menos tokens generados |

Estos resultados se obtuvieron con el adaptador en BF16 servido por vLLM bajo el harness `pi` (un intento por tarea, presupuesto de 100 pasos, thinking desactivado, temperatura 0,8). Los ficheros GGUF no se han reevaluado a traves de llama.cpp y una base cuantizada puede alterar los resultados. No son comparables con las puntuaciones de la model card de Qwen3.8-27B, que usa otros harnesses y thinking en esfuerzo maximo.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado Q8_0: aproximadamente 28,6 GB de pesos, mas overhead de contexto KV; se recomienda al menos 32-40 GB de VRAM para contexto amplio.
- VRAM estimada para el adaptador aislado: unos 319 MB adicionales sobre el GGUF del base (Q8_0 del base, aproximadamente 28 GB; Q4_K_M, menor).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de 24 GB solo con cuantizaciones mas agresivas del base (Q4_K_M) y contexto reducido.
- Cabe en consumer GPU: si, con el base en Q4_K_M y contexto moderado; el Q8_0 fusionado de 28,6 GB no cabe en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (`llama serve`), con soporte de `--lora` para el adaptador aislado; el harness `pi` mediante `pi-llama`.
- Latencia y throughput: no disponible; la model card solo indica la reduccion de tokens (~4,5 veces) con thinking desactivado, lo que se traduce directamente en menor tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-GGUF | 159.383.552 segun safetensors (nombre indica 27B) | 65.536 en ejemplo | LoRA con RL para agentes, formato GGUF | Apache 2.0 | Hugging Face, llama.cpp |
| Qwen/Qwen3.8-27B (base) | 27B segun nombre | no disponible | Modelo base sin adaptar | no disponible en la informacion | Hugging Face |
| ggml-org/Qwen3.8-27B-GGUF | 27B segun nombre | no disponible | Cuantizaciones GGUF del base | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa mas alla de la mejora reportada frente al base en SWE-bench Pro y Terminal-Bench 2.1.

## Limitaciones y advertencias

- Los resultados reportados provienen de vLLM en BF16; los ficheros GGUF no se han reevaluado con llama.cpp y una base cuantizada puede degradar las cifras.
- El adaptador se entreno sin thinking; activarlo no mejora la precision y multiplica por cuatro los tokens generados. Debe mantenerse desactivado.
- Discrepancia entre el nombre del modelo ("27B") y el recuento real de parametros en safetensors (159.383.552): verificar antes de dimensionar hardware.
- El adaptador se entreno sobre los pesos BF16; usar bases muy cuantizadas (por ejemplo Q4_K_M) aleja el comportamiento del aprendido.
- No se detallan sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Idiomas soportados no disponibles; el comportamiento multilingue no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.8-27B, no disponible en la informacion.
- Riesgo de alucinacion inherente a modelos generativos; en tareas de agentes conviene validar los parches y comandos generados antes de aplicarlos en produccion.
- Presupuesto de evaluacion limitado a 100 pasos y un intento por tarea; el rendimiento en escenarios mas largos o con reintentos no esta documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Harness pi para llama.cpp: https://github.com/huggingface/pi-llama
