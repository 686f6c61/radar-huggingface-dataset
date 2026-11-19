# AgentAnon/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es un ajuste fino de tipo "uncensored" del modelo google/gemma-4-12B-it, publicado por el usuario AgentAnon (atribuido en la model card a HauhauCS). El objetivo declarado es eliminar los rechazos del modelo base sin modificar sus capacidades ni sus datos de entrenamiento: segun el autor, el resultado mantiene el 100 % de la funcionalidad original y elimina los rechazos (0/465 en sus pruebas de refusal). Se distribuye exclusivamente en formato GGUF, cuantizado en Q4_K_M, y esta pensado para ejecutarse en llama.cpp y otros runtimes compatibles.

Arquitectonicamente hereda todo del Gemma 4 12B de Google DeepMind: es un transformer denso de 12B parametros (11.907.350.576 parametros reales segun los safetensors del repo) con una ventana de contexto de 256K tokens (262.144) y capacidad de entrada de imagen mediante un proyector multimodal mmproj. El ajuste se construye sobre los pesos oficiales QAT (quantization-aware training), lo que segun el autor permite que la cuantizacion a 4 bits se mantenga cerca de la calidad de precision completa.

Su relevancia practica esta en dos puntos: por un lado, ofrece un modelo multimodal y agentico sin los filtros de rechazo del original, orientado a escritura creativa, roleplay, codificacion agentica y tareas donde el modelo base tiende a negarse; por otro, incluye una cabeza MTP (multi-token prediction) para decodificacion especulativa que, segun el autor, acelera la generacion en torno a un 60 % sin alterar la salida. El repo ocupa 7,8 GB y el modelo acumula por ahora 39 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), multimodal con proyector mmproj para vision |
| Parametros totales | 11.907.350.576 (aproximadamente 12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (unico peso publicado); mmproj en BF16; cabeza MTP en GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (llama.cpp); safetensors solo como referencia del modelo base |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repo | 7,8 GB |
| Ficheros publicados | Q4_K_M texto (6,9 GB), mmproj BF16 vision (168 MB), MTP drafter (242 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 12B parametros heredado de Gemma 4 12B-it. No hay cambios arquitectonicos respecto al base: se mantiene el decoder transformer con atencion completa, la ventana de 256K tokens y el pipeline image-text-to-text con un proyector multimodal separado (mmproj) que se carga junto al modelo principal en llama.cpp. El ajuste "uncensored" se aplica sobre los pesos oficiales QAT de Google, es decir, sobre un modelo ya entrenado con quantization-aware training para tolerar cuantizacion agresiva (aproximadamente 4 bits) sin perdida significativa de calidad.

La model card no detalla la composicion del dataset de ajuste, el numero de tokens utilizados, ni si se emplearon tecnicas como RLHF, DPO o LoRA. Tampoco se especifica el metodo exacto de "uncensoring" mas alla de la afirmacion de que no se modifican datasets ni capacidades. La innovacion tecnica destacable es la inclusion de una cabeza MTP (multi-token prediction) procedente del release de Gemma 4 de Unsloth, que actua como drafter para decodificacion especulativa: el modelo verifica cada token propuesto, por lo que la salida es identica y la ganancia es puramente de velocidad (aproximadamente 60 % segun el autor, medido en llama.cpp). Se ofrecen dos variantes de ajuste, Balanced (recomendada, con razonamiento previo a la respuesta) y Aggressive (no publicada aun segun la model card).

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento previo a la respuesta en la variante Balanced (estilo thinking antes de contestar).
- Codificacion agentica: orientado a tareas de programacion y flujos con herramientas.
- Vision: entrada de imagenes mediante el proyector mmproj en formato BF16.
- Escritura creativa y roleplay sin rechazos en uso estandar (0/465 refusals reportados por el autor).
- Capacidades agenticas y de razonamiento multi-paso heredadas del modelo base Gemma 4 12B-it.
- Decodificacion especulativa mediante cabeza MTP para acelerar la generacion.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible (se infiere del modelo base, pero no se documenta en la model card).
- Capacidades multilingues: limitadas al ingles segun el campo language del repo.

## Casos de uso

- Roleplay y narrativa interactiva: el ajuste elimina los rechazos en escenarios de ficcion y personajes, y la ventana de 256K permite mantener arcos narrativos largos con coherencia de contexto.
- Escritura creativa sin restricciones: generacion de relatos, dialogos y guiones donde el modelo base tiende a negarse; la variante Balanced mantiene el razonamiento previo para conservar calidad estructural.
- Asistente de codigo en local: al ser un GGUF Q4_K_M de 6,9 GB, puede desplegarse en estaciones de trabajo con una sola GPU consumer y usarse con llama.cpp o LM Studio para autocompletado y refactorizacion.
- Analisis de imagenes en local: cargando el mmproj se pueden procesar capturas, diagramas o documentos escaneados sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Agentes autonomos y pipelines multi-paso: la ventana de 256K y el modo de razonamiento previo permiten mantener historiales largos de herramientas y observaciones en tareas agenticas.
- Inferencia de bajas latencias con decodificacion especulativa: integrando la cabeza MTP en llama-server se obtiene aproximadamente un 60 % mas de velocidad, adecuado para prototipado interactivo y demos en tiempo real.
- Experimentacion en investigacion sobre alineacion y refusal: util para estudiar el comportamiento de un modelo sin filtros frente al original, comparando respuestas y midiendo tasas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la tasa de rechazos (0/465 en sus pruebas automatizadas y manuales) y la aceleracion aproximada del 60 % con decodificacion especulativa MTP en llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para el Q4_K_M de texto; anadir unos 0,2 GB para el mmproj BF16 y 0,25 GB para la cabeza MTP.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM para el modelo de texto; con vision se recomienda 10-12 GB para dejar margen al contexto KV.
- Opciones de despliegue: llama.cpp (llama-server / llama-cli), LM Studio, Jan, koboldcpp y otros runtimes GGUF.
- Nota de compatibilidad: el autor advierte de cuelgues de Gemma 4 en el modo tensor-split de LM Studio; recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de aproximadamente 60 % con MTP frente a generacion sin drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 12B denso | 256K | Si (mmproj) | gemma | GGUF Q4_K_M | Sin rechazos, MTP incluido |
| google/gemma-4-12B-it (base) | 12B denso | 256K | Si | gemma | safetensors, GGUF | Con rechazos, sin MTP |
| Otras variantes uncensored de Gemma 4 12B | 12B denso | 256K (heredado) | Segun variante | gemma | GGUF | No disponible en la informacion proporcionada |
| Alternativas de 12B multimodal open source | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste "uncensored" elimina deliberadamente los filtros de seguridad del modelo base; puede generar contenido ofensivo, ilegal o danino y no es adecuado para productos dirigidos al publico general sin moderacion adicional.
- Riesgo de alucinacion heredado del modelo base; el ajuste no lo mitiga y la eliminacion de rechazos puede aumentar la confianza en respuestas incorrectas.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable; la redistribucion del ajuste debe respetar dichos terminos.
- El autor reporta que un pequeno numero de prompts limite se desvian en el primer intento y cumplen tras reformular; la tasa 0/465 no es una garantia universal.
- Solo se publica Q4_K_M; no hay pesos en mayor precision ni safetensors del ajuste, lo que limita el reentrenamiento o el ajuste fino posterior.
- Problemas conocidos de estabilidad en el modo tensor-split de LM Studio con Gemma 4; requiere configuracion de una sola GPU.
- El repo tiene muy poca traccion (39 descargas, 1 like) y no hay validacion independiente de las afirmaciones del autor.
- La procedencia de la cabeza MTP es externa (Unsloth) y su rendimiento puede variar segun la version de llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AgentAnon/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Release de Gemma 4 de Unsloth (origen de la cabeza MTP): no disponible en la informacion proporcionada
- Paper o blog oficial de Gemma 4: no disponible en la informacion proporcionada
