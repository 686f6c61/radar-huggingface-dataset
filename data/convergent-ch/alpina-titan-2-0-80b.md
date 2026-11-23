# Convergent-ch/Alpina-Titan-2.0-80B

## Resumen

Alpina Titan 2.0 (tambien conocido como Chef Murmeli) es un ajuste fino por LoRA fusionado sobre Qwen/Qwen3-Coder-Next, publicado por Convergent-ch bajo licencia Apache 2.0. Se distribuye como un checkpoint completo en BF16 safetensors de 79.674.391.296 parametros almacenados (159,3 GB de payload tensorial), de modo que puede cargarse directamente con `Qwen3NextForCausalLM` sin aplicar el adaptador por separado. El adaptador original se conserva en el subdirectorio `adapter/` del repositorio.

El modelo se presenta explicitamente como un lanzamiento de investigacion con evaluacion muy limitada: solo 360 pasos de adaptacion y comprobaciones cualitativas minimas (3/3 en identidad y 4/4 en cuatro scripts Python simples), que el propio autor advierte que no constituyen un benchmark de codigo ni evidencia de mejora general de capacidades. La relevancia es, por tanto, la de un experimento reproducible de personalizacion sobre una arquitectura Qwen3-Next, no la de un modelo listo para produccion.

La arquitectura subyacente es `qwen3_next` (familia Qwen3-Next, con componentes tipo MoE segun la model card), aunque el numero de parametros activos no se detalla en la informacion disponible. El entrenamiento se realizo con Transformers 5.3.0, PEFT 0.18.1, torchao 0.16.0 y pesos base en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next (`Qwen3NextForCausalLM`), transformer con componentes MoE segun model card |
| Parametros totales | 79.674.391.296 (parametros almacenados, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (release principal); GGUF Q4_K_M publicado por separado para Ollama |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 159,3 GB); GGUF Q4_K_M separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Coder-Next y aplica un ajuste fino mediante LoRA sobre pesos lineales seleccionados, que posteriormente se fusionan con los pesos base para producir el checkpoint completo. No hay reentrenamiento desde cero: todos los parametros y expertos originales estan presentes y solo los pesos lineales objetivo reciben los deltas aprendidos. El entrenamiento consta de 360 pasos de adaptacion, un volumen muy reducido que sugiere un ajuste de estilo o identidad mas que una mejora funcional.

Los datos de entrenamiento incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se especifica el numero total de tokens procesados ni si hubo RLHF o DPO. El stack de entrenamiento fue Transformers 5.3.0, PEFT 0.18.1 y torchao 0.16.0 sobre pesos base BF16; se requiere Transformers 5.3.0 o superior para cargar la arquitectura Qwen3-Next.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`), incluyendo control de modo thinking mediante `enable_thinking`.
- Generacion de codigo heredada del modelo base Qwen3-Coder-Next, aunque el autor no aporta evidencia de mejora en esta area.
- Personalizacion de identidad y estilo (el modelo responde a la identidad "Chef Murmeli"/Alpina segun las comprobaciones del autor).
- Carga directa de pesos fusionados o, alternativamente, carga del adaptador con PEFT desde `subfolder="adapter"`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, uso de agentes, vision, audio ni multilingueismo mas alla del ingles.

## Casos de uso

- Investigacion sobre ajuste fino eficiente: permite estudiar el efecto de 360 pasos de LoRA sobre un modelo de ~80B y comparar el checkpoint fusionado con el base, gracias a que ambos se distribuyen por separado.
- Reproduccion de experimentos de personalizacion: el adaptador preservado en `adapter/` y las instrucciones de `adapter_config.json` permiten replicar la carga con PEFT sobre la revision exacta del modelo base.
- Pruebas de identidad y estilo conversacional: util para evaluar como un ajuste minimo altera respuestas de identidad sin tocar el resto de capacidades.
- Docencia y divulgacion: ejemplo didactico de fusion de adaptadores LoRA en un checkpoint BF16 completo y de publicacion de artefactos GGUF para Ollama.
- Evaluacion de pipelines de conversion a GGUF: el release Q4_K_M permite validar flujos de cuantizacion sobre arquitecturas Qwen3-Next.
- Baseline para comparativas de robustez: sirve como referencia de un modelo poco ajustado frente a variantes mas entrenadas de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comprobaciones realizadas (3/3 de identidad y 4/4 de scripts Python simples) no constituyen un benchmark ni evidencia de mejora general, y remite a `evaluation.json` para ver las respuestas generadas reales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el payload tensorial es de 159,3 GB (148,4 GiB) antes de memoria de runtime, por lo que se necesita al menos ~160-170 GB de VRAM o memoria unificada para carga completa.
- GPU recomendadas para BF16: multiples A100 80 GB (2-3 unidades), H100 80 GB (2-3 unidades) o configuraciones equivalentes con `device_map="auto"`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; seria necesario el GGUF Q4_K_M publicado por separado, cuya VRAM estimada no se detalla en la informacion disponible.
- Opciones de despliegue: Transformers 5.3.0+ (carga directa del checkpoint fusionado o del adaptador con PEFT), Ollama mediante el GGUF Q4_K_M. No se documenta soporte explicito de vLLM, TGI o llama.cpp en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Alpina-Titan-2.0-80B | 79,67B almacenados | no disponible | Apache 2.0 | Ajuste LoRA de 360 pasos, evaluacion minima |
| Qwen/Qwen3-Coder-Next (base) | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base oficial; referencia directa de comparacion |
| Otras variantes Qwen3-Next | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La unica comparacion fiable es contra el propio modelo base Qwen3-Coder-Next, ya que Alpina Titan 2.0 solo anade deltas LoRA sobre el. No se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Evaluacion muy limitada: 360 pasos de entrenamiento y comprobaciones cualitativas minimas; el autor advierte de que no debe inferirse calidad de benchmark a partir de respuestas correctas de identidad.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- Riesgo de alucinacion: no cuantificado; al ser un ajuste ligero sobre un modelo de codigo, hereda los sesgos y fallos del base sin mitigaciones documentadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datasets de entrenamiento tienen sus propias licencias (ODC-BY, Apache-2.0) y no se redistribuyen; el usuario debe verificar el cumplimiento de las notas de origen.
- Requisitos de version: necesita Transformers 5.3.0 o superior; versiones anteriores pueden no cargar la arquitectura Qwen3-Next.
- No aplicar el adaptador dos veces: al cargar el checkpoint fusionado no debe aplicarse de nuevo el LoRA de `adapter/`.
- Atribucion: las afirmaciones de identidad describen la personalizacion y no cambian la autoria original del modelo base (Qwen); no existe afiliacion con Qwen ni con los autores de los datasets.
- Contexto maximo no documentado: no se indica la longitud de ventana soportada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Titan-2.0-80B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
