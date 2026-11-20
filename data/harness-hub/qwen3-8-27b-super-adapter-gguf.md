# harness-hub/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter-GGUF es la version en formato GGUF de un adaptador LoRA (super-adapter) publicado por harness-hub para el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un adaptador de rango 96 que fusiona tres adaptadores individuales entrenados para tres entornos de agentes distintos (pi, Hermes Agent y OpenCode), pensado para su uso con llama.cpp. El repositorio contiene el adaptador en F16 (aproximadamente 956 MB) y debe cargarse sobre los pesos GGUF del modelo base.

El problema que resuelve es la especializacion de un modelo generalista de 27B para tareas de ingenieria de software agente (resolucion de bugs, ejecucion en terminal, edicion de codigo multi-paso) en tres harnesses diferentes con un unico artefacto. Segun la model card, con thinking activado mejora los resultados del modelo base en cinco de seis pares harness-benchmark y empata el sexto, con una media de pass@1 de 55.5% a 63.5% y entre un 19% y un 48% menos llamadas a herramientas por tarea.

Es relevante ahora porque permite desplegar un agente de codigo especializado en local con llama.cpp, sin depender de vLLM ni de GPUs de datacenter, manteniendo una ventana de contexto de 131.072 tokens. La licencia es Apache 2.0 y el adaptador esta publicado en formato GGUF junto con instrucciones de servicio y configuracion para los tres harnesses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (rango 96) sobre transformer Qwen3.8-27B; formato GGUF para llama.cpp |
| Parametros totales | 478.150.656 (pesos del adaptador safetensors); el modelo base Qwen3.8-27B no reporta cifra en la informacion disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens (configuracion recomendada de servicio) |
| Tipos de cuantizacion | adaptador en F16; base recomendado Q8_0 (alternativa Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA F16, aproximadamente 956 MB); safetensors para el adaptador original |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 96 convertido a GGUF mediante `convert_lora_to_gguf.py` de llama.cpp en precision F16. Se obtuvo fusionando tres adaptadores individuales, cada uno entrenado sobre los pesos BF16 de Qwen3.8-27B para un harness concreto (pi, Hermes Agent y OpenCode). El adaptador resultante se aplica en tiempo de carga sobre los pesos GGUF del modelo base, por lo que la calidad final depende de la cercania entre la cuantizacion del base y los pesos BF16 con los que se entrenaron los adaptadores; la model card recomienda Q8_0 como opcion por defecto y advierte que Q4_K_M se aleja mas del comportamiento evaluado.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La evaluacion reportada se realizo con el adaptador BF16 servido por vLLM bajo cada harness, con un intento por tarea, un presupuesto de 100 pasos, contexto de 131.072 tokens y temperatura 0.8. El GGUF no ha sido reevaluado a traves de llama.cpp, y una base cuantizada alterara adicionalmente los resultados. El modo thinking esta activado por defecto y puede desactivarse con `--chat-template-kwargs '{"enable_thinking": false}'`.

## Capacidades

- Generacion de codigo y resolucion de bugs en repositorios reales, orientada a tareas de ingenieria de software (SWE-bench Pro).
- Ejecucion de tareas en terminal y pipelines de shell (Terminal-Bench 2.1).
- Uso de herramientas (tool calling) dentro de los harnesses pi, Hermes Agent y OpenCode.
- Razonamiento multi-paso con modo thinking activable y desactivable.
- Reduccion del numero de llamadas a herramientas por tarea (entre 19% y 48% con thinking activado; entre 53% y 73% con thinking desactivado).
- Compatibilidad con el protocolo OpenAI-compatible expuesto por `llama serve`, lo que permite conectarlo a clientes como OpenCode mediante `@ai-sdk/openai-compatible`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reparacion automatizada de tests fallidos: el adaptador esta evaluado explicitamente en escenarios del tipo "averiguar por que fallan los tests en tests/test_parser.py y corregir el bug", con contexto de 131.072 tokens suficiente para cargar archivos relevantes y trazas.
- Agente de terminal para tareas de DevOps: Terminal-Bench 2.1 mide ejecucion de comandos y resolucion de problemas en shell; el adaptador mejora el base en los tres harnesses con thinking activado.
- Asistente de programacion en IDE o CLI: integrable con OpenCode mediante configuracion OpenAI-compatible apuntando a `http://localhost:8080/v1`, lo que permite usarlo como backend local de un editor.
- Automatizacion de refactorizaciones multi-archivo: con 131.072 tokens de contexto puede mantener varios ficheros y el historial de razonamiento de cada turno, algo que la model card senala como necesario en sesiones largas con thinking activado.
- Despliegue local en estaciones de trabajo: al ser un adaptador GGUF sobre llama.cpp, permite servir un agente de codigo especializado sin infraestructura de datacenter, con base Q8_0 o Q4_K_M segun memoria disponible.
- Evaluacion comparativa de harnesses: al fusionar tres adaptadores, permite medir el mismo modelo bajo pi, Hermes Agent y OpenCode con un unico artefacto, util para decidir que harness adoptar en un equipo.
- Reduccion de coste de inferencia agente: la disminucion de llamadas a herramientas por tarea (hasta 73% con thinking desactivado) reduce tokens consumidos y latencia acumulada en flujos agente.

## Benchmarks y rendimiento

Resultados reportados en la model card con el adaptador BF16 servido por vLLM, thinking activado, un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens y temperatura 0.8. No son comparables con los de la card de Qwen3.8-27B, que usa otros harnesses y presupuestos mayores.

| Harness | Benchmark | Base | Super-adapter |
|---|---|---|---|
| pi | SWE-bench Pro (hard 51) | 74.5% | 74.5% |
| Hermes Agent | SWE-bench Pro (hard 51) | 45.1% | 60.8% |
| OpenCode | SWE-bench Pro (hard 51) | 47.1% | 66.7% |
| pi | Terminal-Bench 2.1 | 52.9% | 57.6% |
| Hermes Agent | Terminal-Bench 2.1 | 58.6% | 64.4% |
| OpenCode | Terminal-Bench 2.1 | 54.7% | 58.1% |

Con thinking desactivado, la card indica mejora sobre el base en los seis pares harness-benchmark, con media de 39.5% a 49.0% y entre 53% y 73% menos llamadas a herramientas por tarea. Con thinking activado, media pass@1 de 55.5% a 63.5% y entre 19% y 48% menos llamadas por tarea. Estos resultados corresponden al adaptador BF16; el GGUF no ha sido reevaluado con llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen3.8-27B y de la cuantizacion elegida (Q8_0 o Q4_K_M). El adaptador LoRA anade aproximadamente 956 MB en F16.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; condicionada al tamanio del base cuantizado y al contexto configurado (la card recomienda mantener `-c` en 131.072 o mas si la memoria lo permite).
- Opciones de despliegue: llama.cpp mediante `llama serve` con `--lora`, exponiendo una API OpenAI-compatible; compatible con vLLM solo para el adaptador BF16 original, no para este GGUF.
- Latencia y throughput: no disponibles. La card reporta reducciones de llamadas a herramientas por tarea (19-48% con thinking activado, 53-73% con thinking desactivado), que afectan el coste agregado de sesiones agente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| harness-hub/Qwen3.8-27B-super-adapter-GGUF | adaptador LoRA GGUF sobre Qwen3.8-27B | 478.150.656 (adaptador) | 131.072 | Apache 2.0 | agente de codigo multi-harness |
| harness-hub/Qwen3.8-27B-pi-adapted-GGUF | adaptador LoRA GGUF especifico de pi | no disponible | no disponible | no disponible | agente de codigo para pi |
| harness-hub/Qwen3.8-27B-hermes-adapted-GGUF | adaptador LoRA GGUF especifico de Hermes Agent | no disponible | no disponible | no disponible | agente de codigo para Hermes Agent |
| harness-hub/Qwen3.8-27B-opencode-adapted-GGUF | adaptador LoRA GGUF especifico de OpenCode | no disponible | no disponible | no disponible | agente de codigo para OpenCode |

La model card indica que, si se usa un unico harness con thinking desactivado, su adaptador especifico es mejor opcion que el super-adapter. No se dispone de datos de benchmarks para los adaptadores individuales en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA, no el modelo completo: requiere descargar por separado los pesos GGUF de Qwen3.8-27B.
- Los benchmarks reportados se obtuvieron con el adaptador BF16 en vLLM; el GGUF no ha sido reevaluado con llama.cpp, por lo que el rendimiento real puede diferir.
- La cuantizacion del modelo base altera los resultados: Q4_K_M se aleja del comportamiento aprendido por los adaptadores, entrenados sobre pesos BF16.
- Sesiones largas con thinking activado en Hermes Agent y OpenCode, que reenvian el razonamiento de cada turno al modelo, exigen contexto grande; reducir `-c` por debajo de 131.072 puede degradar el comportamiento.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo general de modelos generativos de codigo.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B antes de produccion.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion por terceros.
- No se documentan resultados con thinking desactivado por harness-benchmark individual, solo medias agregadas.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter-GGUF
- Adaptador original (BF16, PEFT): https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del modelo base: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Adaptador especifico de pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted-GGUF
- Adaptador especifico de Hermes Agent: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted-GGUF
- Adaptador especifico de OpenCode: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Plugin pi para llama.cpp: https://github.com/huggingface/pi-llama
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- OpenCode: https://opencode.ai
