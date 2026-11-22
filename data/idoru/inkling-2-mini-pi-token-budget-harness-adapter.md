# idoru/Inkling-2-Mini-pi-token-budget-harness-adapter

## Resumen

Inkling-2-Mini-pi-token-budget-harness-adapter es un adaptador LoRA de rango 32 entrenado sobre el modelo base `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `idoru` en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos delta (1,6 GB en safetensors) que debe cargarse junto al checkpoint base para modificar su comportamiento en tareas de agente y razonamiento multi-paso con presupuesto de tokens controlado. El entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization) sobre 16 microbatches de referencia de hasta 65.536 tokens de prefijo distintos, usando el backend nativo de SkyRL sobre vLLM.

La relevancia del artefacto es metodologica: forma parte de un experimento público sobre "harness adapters at scale" que mide precisión emparejada, llamadas a herramientas y tokens generados en verificadores held-out. El autor indica que el especialista ha completado 1 de 160 actualizaciones programadas, por lo que se trata de un checkpoint intermedio, no de un modelo final. La licencia es Apache 2.0 y el formato de pesos es safetensors con el layout nativo del adaptador on-policy de SkyRL para vLLM.

La informacion disponible sobre el modelo base (arquitectura, numero de parametros, contexto nativo, idiomas) no se detalla en la model card del adaptador; solo se infiere un contexto de al menos 131.072 tokens por los parametros de servicio de vLLM (`--max-model-len 131072`) y la existencia de parsers especificos de tool calling y razonamiento (`inkling`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (rango 32) sobre transformer base `thinkingmachines/Inkling-2-Mini`; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador LoRA de 1,6 GB en safetensors; parametros del base no disponibles) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | al menos 131.072 tokens (segun `--max-model-len` en el ejemplo de servicio); contexto nativo del base no disponible |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el base admite el layout nativo SkyRL on-policy vLLM; cuantizaciones concretas (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout nativo del adaptador SkyRL on-policy vLLM) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el checkpoint `thinkingmachines/Inkling-2-Mini` en la revision `ed40e7da625f594fc9c4990f5f66be24873c22d7`. El entrenamiento usa GRPO con las siguientes caracteristicas: 16 microbatches de referencia por actualizacion, cada uno con hasta 65.536 tokens de prefijo distintos; el backend nativo de Inkling ejecuta cada ruta causal de forma independiente; el optimizador promedia las perdidas token-mean de los 16 microbatches. La perdida con clipping utiliza log-probabilidades de muestreo medidas, ventajas de grupo con ocho intentos, cotas del ratio de importancia de 0,5 y 5, y centrado de score desactivado. Se consumen muestras elegibles en orden fijo de tarea, repeticion y ruta, con hasta 16 actualizaciones de policy lag. Hiperparametros: temperatura 0,8, learning rate 0,00002 y rango LoRA 32.

El artefacto incluye un fichero `training.json` que registra el paso entrenado, la revision de origen y el checksum SHA-256 de los pesos. El autor indica que se han completado 1 de 160 actualizaciones programadas, por lo que el adaptador representa una fase temprana del entrenamiento. El pipeline de evaluacion se apoya en un build de vLLM especifico para Inkling, con parsers de tool calling y razonamiento propios (`--tool-call-parser inkling`, `--reasoning-parser inkling`) y `--enable-auto-tool-choice`.

## Capacidades

- Generacion de texto condicionada por el modelo base; el adaptador modula el comportamiento hacia tareas de agente.
- Soporte de tool calling / function calling mediante el parser `inkling` integrado en vLLM (`--enable-auto-tool-choice`).
- Soporte de razonamiento multi-paso con parser de razonamiento dedicado (`--reasoning-parser inkling`) y control de `reasoning_effort` en la plantilla de chat.
- Entrenamiento orientado a presupuesto de tokens ("token-budget harness"), es decir, a operar dentro de limites de tokens en entornos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.
- Modo "thinking": el ejemplo de servicio fija `reasoning_effort: none` por defecto, lo que sugiere que el base soporta distintos niveles de esfuerzo de razonamiento.

## Casos de uso

- Evaluacion de adaptadores de agente a escala: el adaptador se integra en el experimento publico del autor para medir precision emparejada, llamadas a herramientas y tokens generados frente al modelo base, usando verificadores held-out.
- Investigacion en RL para agentes: sirve como referencia reproducible de un entrenamiento GRPO con ventajas de grupo de ocho intentos y cotas de ratio de importancia, util para comparar recetas de RL sobre el mismo base.
- Despliegue de agentes con tool calling en vLLM: el ejemplo de servicio con `--enable-auto-tool-choice` y parser `inkling` permite levantar un endpoint compatible con la API de chat completions para prototipos de agentes que invocan funciones.
- Control de coste por tokens en produccion: el enfoque de "token budget harness" es adecuado para escenarios donde el agente debe respetar un presupuesto de tokens por peticion, como asistentes de codigo o pipelines de automatizacion.
- Experimentacion con LoRA sobre modelos de razonamiento: al ser un adaptador de rango 32 y 1,6 GB, permite iterar rapidamente sobre el base sin reentrenar el modelo completo.
- Benchmarking de infraestructura de inferencia: util para validar builds personalizados de vLLM (SkyRL, parsers propios) y comparar latencia y throughput frente al base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el experimento publico reportara precision emparejada, llamadas a herramientas y tokens generados a medida que los verificadores held-out finalicen, pero no incluye cifras en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para el adaptador: aproximadamente 1,6 GB adicionales sobre el modelo base, mas el overhead de vLLM (KV cache, activaciones).
- VRAM total: depende del tamano del base `thinkingmachines/Inkling-2-Mini`, que no se especifica en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita; el ejemplo usa `--enforce-eager` y un build especifico de vLLM, lo que sugiere GPUs de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM para el base.
- Compatibilidad con consumer GPU: no confirmada; depende del tamano y cuantizacion del base.
- Opciones de despliegue: vLLM con soporte de LoRA (`--enable-lora --max-lora-rank 32 --lora-modules`), usando el build de Inkling referenciado en la model card. Otros runners (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de agente sobre modelos de razonamiento) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se ha completado 1 de 160 actualizaciones programadas, por lo que el adaptador no representa el resultado final del entrenamiento.
- Dependencia estricta del base: requiere el checkpoint `thinkingmachines/Inkling-2-Mini` en la revision `ed40e7da625f594fc9c4990f5f66be24873c22d7`; no es un modelo autonomo.
- Dependencia de infraestructura: necesita un build especifico de vLLM con soporte nativo de Inkling y los parsers `inkling`; no funciona con vLLM estandar sin ese build.
- Sesgos conocidos: no disponibles; al heredar el base, los sesgos del modelo original se mantienen.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo propio del base.
- Limitaciones de contexto o idioma: el contexto maximo del base no se documenta; los idiomas soportados no se especifican.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base por separado.
- Uso en produccion: al ser un artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia de validacion externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/idoru/Inkling-2-Mini-pi-token-budget-harness-adapter
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Experimento en vivo (Space): https://huggingface.co/spaces/idoru/inkling-2-mini-harness-adapters
- Blog de referencia del experimento: https://huggingface.co/blog/harness-adapters-at-scale
- Script de build del runtime: https://huggingface.co/spaces/idoru/inkling-2-mini-harness-adapters/blob/main/jobs/build-runtime.sh
- Configuracion de evaluacion: https://huggingface.co/spaces/idoru/inkling-2-mini-harness-adapters/blob/main/jobs/native-eval.sh
