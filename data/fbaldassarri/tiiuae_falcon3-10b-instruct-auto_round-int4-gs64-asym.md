# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-asym

## Resumen

Esta ficha describe una version cuantizada del modelo Falcon3-10B-Instruct, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi y publicado bajo licencia Apache 2.0. La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando una cuantizacion de solo pesos (weights-only quantization, WoQ) a 4 bits con tamano de grupo 64 y esquema asimetrico (SignRound). El objetivo es reducir el peso en memoria y acelerar la inferencia en hardware Intel, manteniendo la mayor parte de la calidad del modelo original.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo instruct/chat, orientado a generacion de texto y conversacion. Esta version cuantizada conserva la plantilla de chat del modelo original y esta pensada para ejecutarse en CPU Intel, GPU integrada Intel Arc mediante intel-extension-for-pytorch, y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO.

Es relevante porque permite desplegar un modelo de la familia Falcon3 en equipos sin GPU dedicada de gran capacidad, a costa de una ligera perdida de precision. El repositorio tiene 8,3 GB y, segun los metadatos de safetensors, 2.160.061.440 parametros, un dato que no coincide con la denominacion "10B" del modelo base y que conviene verificar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama) |
| Parametros totales | 2.160.061.440 segun safetensors (el modelo base se denomina Falcon3-10B-Instruct; discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4, solo pesos (WoQ), group size 64, asimetrica, algoritmo SignRound (AutoRound) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato auto_round), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo instruct/chat. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; esos datos corresponden a la model card de tiiuae/Falcon3-10B-Instruct, que no se incluye en la informacion proporcionada.

La innovacion principal de este artefacto es el proceso de cuantizacion. Se aplico Intel AutoRound v0.16.1 con 4 bits, group size 64 y esquema asimetrico, calibrando sobre 128 muestras de 512 tokens, con 200 iteraciones de ajuste y batch size 4. La calibracion se ejecuto en CPU con torch.bfloat16 y torch 2.15.0+cpu, y el proceso completo duro 51.971,5 segundos (unas 866 minutos). El autor indica una aceleracion de 2-3x con una ligera caida de precision a W4G64.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat instruct.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Falcon3-10B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.
- Inferencia optimizada en CPU Intel, iGPU Intel Arc y NPU Intel mediante OpenVINO.

## Casos de uso

- Asistente conversacional en ingles sobre equipos de sobremesa con CPU Intel: el modelo puede gestionar dialogos multi-turno usando la plantilla de chat, sin necesidad de GPU dedicada, gracias a la cuantizacion INT4.
- Despliegue en portatiles con Intel Core Ultra: la version INT4 esta preparada para ejecutarse en la NPU AI Boost mediante OpenVINO, lo que permite mantener el asistente activo con bajo consumo.
- Prototipado rapido de aplicaciones de chat: el reducido peso en memoria (8,3 GB de repositorio) facilita cargar el modelo en entornos de desarrollo con recursos limitados.
- Generacion de texto en pipelines por lotes en servidores sin acelerador: el autor reporta una aceleracion de 2-3x frente al modelo sin cuantizar, util para tareas de resumen o clasificacion de texto en ingles.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la receta de replicacion completa (auto-round-pipeline), lo que permite reproducir el proceso y comparar variantes de bits y group size.
- Educacion e investigacion sobre cuantizacion WoQ: sirve como ejemplo practico de aplicacion de Intel AutoRound con parametros documentados y condiciones de ejecucion registradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona cualitativamente una aceleracion de 2-3x y una ligera caida de precision a W4G64, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 8,3 GB, por lo que se puede inferir un requisito de memoria en torno a esa cifra para cargar los pesos, aunque la informacion no lo confirma.
- GPU recomendadas: no disponible. El autor orienta el modelo a CPU Intel, iGPU Intel Arc e NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: transformers con device_map="auto"; intel-extension-for-pytorch para CPU e iGPU Intel Arc; OpenVINO para NPU Intel; el tag text-generation-inference sugiere compatibilidad con TGI, aunque no se detalla.
- Latencia y throughput: no disponibles; solo la referencia cualitativa de 2-3x de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-asym | 2.160.061.440 (safetensors) | no disponible | INT4 WoQ, gs64, asimetrica | apache-2.0 | Optimizado para CPU/iGPU/NPU Intel |
| tiiuae/Falcon3-10B-Instruct (original) | no disponible | no disponible | sin cuantizar | apache-2.0 | Modelo base; mayor precision, mayor peso |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | apache-2.0 | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion INT4 conlleva una ligera caida de precision reconocida por el autor; no se cuantifica su magnitud.
- El modelo solo declara soporte de ingles, lo que limita su uso en castellano u otros idiomas.
- El autor indica que el modelo se ha desarrollado solo con fines de investigacion y sin garantia; conviene evaluar su idoneidad antes de usarlo en produccion.
- Existe una discrepancia entre el nombre "10B" del modelo base y los 2.160.061.440 parametros registrados en safetensors; debe verificarse antes de planificar requisitos de memoria.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan datos especificos sobre sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor restringe el proposito a investigacion.
- La cuantizacion esta optimizada para hardware Intel; el rendimiento en otras plataformas no esta documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
