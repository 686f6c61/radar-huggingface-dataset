# SimpleTuner/Qwen-Image-2.1-training-assistant-v1

## Resumen

SimpleTuner/Qwen-Image-2.1-training-assistant-v1 es un adaptador LoRA experimental de tipo "asistente de entrenamiento" (training assistant) para el modelo de difusion text-to-image Qwen/Qwen-Image-2.1, publicado por SimpleTuner. No es un modelo generativo autonomo ni un adaptador de concepto: su proposito es permanecer congelado y activo durante el entrenamiento de un LoRA posterior (downstream), de modo que actue como profesor o regularizador del proceso de destilacion, y desactivarse despues en la fase de inferencia. La idea sigue el enfoque de training-adapter popularizado por Ostris para Z-Image Turbo.

El adaptador se entreno durante 1.000 actualizaciones con tamano de lote 1 sobre 12 buckets de resolucion que cubren 512, 1024, 1536 y 2048 pixeles en formato cuadrado, retrato y paisaje. Cuenta con 33.554.432 parametros entrenables (rango 32, alpha 32) aplicados a las proyecciones de atencion to_q, to_k, to_v y to_out.0, y se distribuye como un safetensors de 256 tensores BF16 (aproximadamente 0,1 GB de repositorio).

Su relevancia actual es fundamentalmente metodologica y negativa: el propio autor documenta que un test emparejado de entrenamiento downstream no mostro ningun beneficio atribuible al asistente, y que el checkpoint se genero con un helper de optimizador con un error aritmetico confirmado en la recurrencia del primer momento (adamw-bf16). El artefacto se preserva como referencia reproducible de un experimento fallido, no como herramienta lista para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion text-to-image Qwen/Qwen-Image-2.1; rango 32, alpha 32; proyecciones to_q, to_k, to_v y to_out.0 |
| Parametros totales | 33.554.432 parametros entrenables en el adaptador (256 tensores BF16); parametros del modelo base: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion; la generacion se controla por resolucion y numero de pasos de denoising, no por ventana de contexto) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan variantes GGUF, INT8 ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campos license: other y license_name: qwen-research) |
| Formato de pesos | safetensors (pytorch_lora_weights.safetensors, 256 tensores BF16) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Resoluciones de entrenamiento | 512, 1024, 1536 y 2048 de lado base, con buckets cuadrado, retrato y paisaje (12 en total) |
| Tamano del repositorio | 0,1 GB |
| Hash SHA-256 del checkpoint | 9985b6983ddf03ba44b5b9e9e16d63e7ed1dad274d937c80c46c11215c7e99b0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar (no de tipo LyCORIS ni variantes) de rango 32 y alpha 32, inyectado sobre las proyecciones de atencion del modelo base Qwen/Qwen-Image-2.1. La model card describe las senales de entrenamiento en terminos de latentes: las salidas del profesor se generaron directamente como latentes con 40 pasos de inferencia nativos y CFG 1, y se usaron como objetivos de denoising tras restaurar el adaptador entrenable. No se utilizo decodificacion VAE para crear los objetivos de entrenamiento ni se pre-cachearon los latentes terminales.

El entrenamiento consistio en 1.000 actualizaciones con batch size 1 y acumulacion 1 sobre una NVIDIA L40S en BF16, con 25 pasos de warmup seguidos de learning rate constante de 1e-5, gradient clipping individual a 0,01, gradient checkpointing con intervalo 2, semilla 42 avanzando en cada muestra, y optimizador adamw_bf16. Cada lote uso sucesivamente el siguiente bucket de anchura x altura de la secuencia de 12 resoluciones (por ejemplo 512x512, 384x672, 672x384, hasta 1536x2688 y 2688x1536). Las captions proceden de un pool local de 4.096 entradas long_caption del dataset webshart/cc12m-structured-captions; las imagenes del dataset no se usaron como imagenes objetivo. El header del safetensors conserva el campo nominal 1024x1024, que no refleja los tamanos reales de entrenamiento.

Dos innovaciones o particularidades tecnicas merecen atencion. La primera es el mecanismo de asistencia: SimpleTuner carga y congela el asistente junto al adaptador entrenable (assistant_lora_path, assistant_lora_weight_name, assistant_lora_strength, assistant_lora_inference_strength), y la generacion final se hace con el modelo base mas el LoRA de concepto resultante, con el asistente desactivado. La segunda es un defecto documentado: tanto la preparacion del asistente como las dos ramas downstream usaron un helper de suma estocastica que calculaba other + alpha * input en lugar de input + alpha * other, lo que con beta1 = 0,9 convierte la recurrencia del primer momento en aproximadamente m = 0,09 * m_anterior + gradiente en vez de m = 0,9 * m_anterior + 0,1 * gradiente. El mismo error existe en adamw-bf16 upstream (revision 0a6c09a). Este checkpoint no se ha reentrenado con la implementacion corregida.

## Capacidades

- No genera imagenes por si mismo: es un adaptador auxiliar que se combina con Qwen/Qwen-Image-2.1 y con un LoRA de concepto downstream.
- Asistencia durante el entrenamiento: se mantiene congelado y activo mientras se entrena un adaptador de concepto, actuando como referencia de denoising del modelo base sin adaptador.
- Cobertura multi-resolucion: fue entrenado sobre 12 buckets que van de 512 a 2048 pixeles de lado base, con orientaciones cuadrada, retrato y paisaje.
- Sin trigger word: la model card indica explicitamente que esta version no tiene palabra de activacion.
- No es un adaptador de personaje ni un adaptador de generacion en pocos pasos (few-step).
- Compatibilidad: no se ha probado con versiones anteriores de Qwen Image; requiere una version de SimpleTuner que incluya Qwen Image 2.1 y soporte de assistant-LoRA.
- Tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision, audio y capacidades multilingues: no aplica (no es un modelo de lenguaje).

## Casos de uso

- Reproduccion de experimentos de training-assistant LoRA: el artefacto permite replicar exactamente la receta descrita (1.000 updates, batch 1, 12 buckets, rango 32, LR 1e-5 constante) y comparar resultados contra el checkpoint publicado usando el hash SHA-256 como referencia de integridad.
- Baseline negativo en investigacion de destilacion de adaptadores: dado que el test emparejado no mostro beneficio downstream, sirve como punto de comparacion controlado frente a recetas de asistente nuevas o corregidas.
- Estudio del error aritmetico del optimizador: la discrepancia entre other + alpha * input y input + alpha * other es reproducible independientemente del entrenamiento, por lo que el checkpoint permite analizar el impacto de la recurrencia del primer momento en la calidad final del adaptador.
- Prueba de integracion de SimpleTuner: los campos assistant_lora_path, assistant_lora_weight_name, disable_assistant_lora, assistant_lora_strength y assistant_lora_inference_strength permiten verificar que el pipeline carga, congela y desactiva correctamente un asistente externo antes de invertir en un entrenamiento propio.
- Investigacion sobre captions estructuradas: el uso de 4.096 entradas long_caption de CC12M structured captions documenta un flujo de trabajo con captions largas de origen local, util para disenar experimentos de condicionamiento textual.
- Experimentos de entrenamiento multi-resolucion y multi-orientacion: la secuencia de 12 buckets con proporciones de retrato y paisaje es una referencia directa para validar estrategias de bucketing en resoluciones altas (hasta 2688x1536).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, que por otra parte no aplican a un adaptador de difusion).

La unica evaluacion documentada es un test emparejado downstream: se entrenaron dos adaptadores Domokun desde cero durante 250 actualizaciones cada uno a 2048 pixeles, batch size 1, learning rate 1e-5 y value clipping en 1. La rama de control uso fuerza del asistente 0 y la rama asistida fuerza 1, con el asistente desactivado en inferencia en ambos casos; los pesos iniciales y las imagenes de validacion eran identicos. Con 40 pasos de inferencia, CFG 1 y 1024 pixeles, ambas ramas finales seguian generando personas para los prompts de personaje, mientras que los priors de zorro y retrato se mantenian coherentes. Conclusion registrada por el autor: el test no demostro ningun beneficio downstream. Se trata de un experimento limitado y no de una conclusion general sobre todas las recetas de asistente.

Como validacion cualitativa, las imagenes finales de zorro y retrato del asistente a 1024 y 2048 pixeles se mantuvieron coherentes. La decodificacion VAE por tiles produjo costuras de color visibles en las previsualizaciones, aunque no formaba parte de la generacion de objetivos del profesor.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,07 GB en BF16 (33.554.432 parametros x 2 bytes = 64 MiB para los pesos), mas el espacio del modelo base, que domina completamente el consumo.
- VRAM del modelo base Qwen/Qwen-Image-2.1: no disponible en la informacion proporcionada.
- GPU de entrenamiento documentada: NVIDIA L40S, en precision BF16, con gradient checkpointing activado (intervalo 2).
- GPU recomendadas: no disponibles mas alla de la L40S empleada; el entrenamiento a 2048 pixeles de lado base (hasta 2688x1536 en buckets de paisaje) implica requisitos de memoria elevados que dependen del modelo base, no del adaptador.
- GPU de consumo: el adaptador en si ocupa 0,1 GB de repositorio y es trivial de almacenar; si cabe en una GPU de consumo determinada depende exclusivamente del modelo base y del presupuesto de memoria de la resolucion objetivo, dato no disponible.
- Opciones de despliegue: el formato de pesos es safetensors para uso con SimpleTuner (model_family qwen_image, model_flavour v2.1, model_type lora, lora_type standard). No se documentan variantes GGUF, Ollama, vLLM ni TGI, que no aplican a este tipo de adaptador.
- Latencia y throughput: no disponibles. Los unicos parametros de inferencia documentados son 40 pasos nativos con CFG 1 durante la generacion de objetivos del profesor.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Resoluciones / alcance | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SimpleTuner/Qwen-Image-2.1-training-assistant-v1 | LoRA asistente de entrenamiento (rango 32) | Qwen/Qwen-Image-2.1 | 12 buckets de 512 a 2048 de lado base | Sin beneficio downstream demostrado en test emparejado de 250 updates | qwen-research | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1 (base, sin adaptador) | Modelo de difusion text-to-image | no aplica | no disponible | no disponible | no disponible | HuggingFace |
| ostris/zimage_turbo_training_adapter | LoRA training-adapter del enfoque general descrito por Ostris | no disponible | no disponible | no disponible | no disponible | HuggingFace (referencia metodologica citada) |

No se dispone de datos de parametros, contexto o rendimiento de los modelos comparables en la informacion proporcionada; los dos ultimos se incluyen unicamente como referencia de categoria.

## Limitaciones y advertencias

- Beneficio downstream no demostrado: el test emparejado realizado por el autor no encontro ninguna ventaja atribuible al asistente. No debe adoptarse con expectativas de mejora de calidad sin validacion propia.
- Error aritmetico en el optimizador: la recurrencia del primer momento se calculo de forma invertida (aproximadamente m = 0,09 * m_anterior + gradiente), lo que altera sustancialmente el suavizado del momento. Este checkpoint conserva el estado previo a la correccion y no se ha reentrenado.
- Caracter experimental: el propio repositorio se etiqueta como experimental y con 0 descargas y 0 likes en el momento del analisis.
- Sin trigger word y sin proposito creativo directo: no es un adaptador de personaje ni de generacion en pocos pasos, y no debe usarse para generar imagenes finales.
- Compatibilidad no verificada con versiones anteriores de Qwen Image.
- Restricciones de licencia: la licencia es qwen-research (categoria other en los metadatos). Los terminos exactos se remiten al archivo LICENSE del repositorio y no se detallan en la informacion disponible; conviene revisarlos antes de cualquier uso comercial.
- Artefactos de decodificacion: la decodificacion VAE por tiles produjo costuras de color visibles en las previsualizaciones, aunque no afecta a la generacion de objetivos de entrenamiento.
- Idioma y sesgos: no hay informacion disponible sobre idiomas soportados ni sobre sesgos del adaptador o del dataset de captions empleado; el pool de captions procede de CC12M, con los sesgos de representacion habituales de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de artefactos visuales y de incoherencia en resoluciones altas fuera del rango entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Referencia metodologica (training adapter de Ostris): https://huggingface.co/ostris/zimage_turbo_training_adapter
- Dataset de captions: https://huggingface.co/datasets/webshart/cc12m-structured-captions
- Codigo upstream del helper estocastico con el error documentado: https://github.com/AmericanPresidentJimmyCarter/adamw-bf16/blob/0a6c09a621c04fbb6c21929b41f20b4ab3f1cb0a/src/adamw_bf16/stochastic/__init__.py#L90-L100
- Detalles de entrenamiento: training_details.json (incluido en el repositorio del modelo)
- Archivo de licencia: LICENSE (incluido en el repositorio del modelo)
