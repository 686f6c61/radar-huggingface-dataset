# huggingJDE/Ornith-1.5-35B-A3B-NInfer

## Resumen

Ornith-1.5-35B-A3B-NInfer es un artefacto de inferencia de un solo archivo, desarrollado por huggingJDE, que empaqueta el modelo de mezcla de expertos (MoE) Ornith-1.5-35B-A3B en formato NInfer. El modelo base, creado por ornith-ai y distribuido por shisa-ai con un cabezal de predicción multi-token (MTP) destilado de Qwen3.6-35B-A3B, se ha cuantizado con una receta groupwise-int y se ha combinado con un modelo borrador DFlash, la torre de visión, el tokenizador y la plantilla de chat oficiales de Qwen. El resultado es un único fichero `.ninfer` de aproximadamente 21,22 GiB listo para servirse con el runtime `ninfer-serve` en una GPU RTX 5090 de 32 GB.

El problema que resuelve es el despliegue local de un modelo multimodal de 35B de parámetros totales (3B activos por token) con una ventana de contexto de 262 144 tokens y capacidades de visión, en una única GPU de consumo de gama alta. Su relevancia radica en que combina cuantización agresiva, decodificación especulativa (MTP o DFlash) y un frontend compatible con la API de OpenAI, lo que permite ejecutar tareas de razonamiento, codificación y análisis de documentos largos en hardware asequible sin depender de servicios en la nube.

La arquitectura es un MoE con 256 expertos (8 activos por token), 40 capas híbridas de atención lineal y completa, una torre de visión y un cabezal MTP de una capa. La licencia de esta distribución es Apache-2.0, aunque el modelo original es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (256 expertos, 8 activos por token), 40 capas hibridas linear/full-attention, torre de vision, 1 capa MTP |
| Parametros totales | ~35 mil millones |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | groupwise-int (receta `qwen3_6_35b_a3b-v2`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (para esta distribucion; el modelo base original es MIT) |
| Formato de pesos | `.ninfer` (archivo unico, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de 35B parametros totales que activa aproximadamente 3B por token, con 256 expertos y 8 rutas activas. La arquitectura incluye 40 capas hibridas que combinan atencion lineal y atencion completa, una torre de vision para entrada de imagenes y un cabezal MTP de una capa para decodificacion especulativa. El entrenamiento del modelo original, segun la informacion disponible, siguio un bucle de generacion de tareas y scaffolds auto-mejorado, similar al usado para el modelo insignia de 397B de la misma familia, aunque no se especifican el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

Esta version NInfer no anade entrenamiento adicional: es una cuantizacion groupwise-int de los pesos BF16 del modelo shisa-ai/Ornith-1.5-35B-A3B-MTP, que ya incorporaba el cabezal MTP destilado de Qwen3.6-35B-A3B. El artefacto empaqueta ademas el modelo borrador DFlash (entrenado contra el Qwen3.6-35B-A3B base), la torre de vision y los recursos de frontend oficiales de Qwen (tokenizador y plantilla de chat), reemplazando la plantilla original de Ornith por la estandar de Qwen, que elimina los bloques de pensamiento de turnos anteriores.

## Capacidades

- Generacion de texto y razonamiento de proposito general gracias a la arquitectura MoE de 35B con 3B activos.
- Procesamiento de imagenes (image-text-to-text) mediante la torre de vision integrada.
- Decodificacion especulativa con dos modos: MTP (compatible con vision, ~3 tokens de borrador) o DFlash (solo texto, ~7 tokens de borrador), mutuamente excluyentes.
- Ventana de contexto de 262 144 tokens, suficiente para documentos extensos o historiales de conversacion largos.
- Exposicion de una API compatible con OpenAI (`/v1/chat/completions`) a traves del runtime `ninfer-serve`.
- Soporte de tool calling y uso de agentes: no confirmado explicitamente en la documentacion proporcionada, aunque el modelo base esta orientado a agentes de codigo y trabajo en terminal.
- Capacidades multilingues: no especificadas; el frontend es de Qwen, que suele ser multilingue, pero no hay confirmacion en la ficha.

## Casos de uso

- Asistente de programacion en local: con 262 144 tokens de contexto, el modelo puede analizar repositorios completos, mantener el estado de multiples archivos y generar o refactorizar codigo en una sesion prolongada, ejecutandose en una RTX 5090.
- Agente autonomo de terminal: el modelo base esta disenado para tareas de terminal y uso de herramientas; con la API OpenAI-compatible se puede integrar en un bucle de agente que ejecute comandos, lea salidas y decida el siguiente paso.
- Analisis de documentos largos con vision: la torre de vision permite procesar capturas de pantalla, diagramas o paginas escaneadas, mientras que el contexto amplio mantiene el contenido completo del documento para responder preguntas o resumir.
- Servidor de chat privado: desplegar `ninfer-serve` en una maquina local con RTX 5090 y conectar aplicaciones de chat o herramientas de productividad a traves del endpoint compatible con OpenAI, sin enviar datos a terceros.
- Investigacion en decodificacion especulativa: al incluir tanto MTP como DFlash, se pueden comparar tasas de aceptacion y velocidad en el mismo hardware y con la misma carga de trabajo, algo util para estudios de eficiencia.
- Prototipado de agentes con memoria larga: el contexto de 256K permite mantener un historial de interacciones muy extenso, adecuado para asistentes virtuales que necesitan recordar detalles de conversaciones anteriores.
- Desarrollo de software con razonamiento multi-paso: el modo MTP acelera la generacion de secuencias largas de codigo o razonamiento, reduciendo la latencia percibida en tareas de autocompletado o generacion de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Unico dato de rendimiento mencionado: la tasa de aceptacion del cabezal MTP destilado para Ornith se estima en torno al 80%, con aproximadamente 3,4 tokens aceptados por ronda de especulacion con ventana de 3. Para el modo DFlash, la aceptacion puede ser menor al estar entrenado contra el Qwen3.6-35B-A3B base, no contra el finetune Ornith.

## Requisitos de hardware

- VRAM estimada: 32 GB para contexto completo (262 144 tokens) y vision, usando `--kv-dtype int8`.
- GPU recomendada: RTX 5090 (arquitectura `sm_120a`); NInfer solo soporta esta arquitectura, por lo que no es compatible con GPUs consumer anteriores.
- No cabe en GPUs con menos de 32 GB ni en arquitecturas distintas a `sm_120a`.
- Opciones de despliegue: runtime `ninfer-serve` incluido en NInfer; expone API OpenAI-compatible. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la velocidad depende del modo de especulacion elegido (MTP o DFlash) y de la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (original) | ~35B | ~3B | 262 144 | MIT | safetensors (BF16, ~70 GB) | 2x GPU 80 GB para contexto completo |
| Ornith-1.5-35B-A3B-MTP (shisa-ai) | ~35B | ~3B | 262 144 | Apache-2.0 | safetensors (BF16) | no especificado |
| Ornith-1.5-35B-A3B-NInfer (este) | ~35B | ~3B | 262 144 | Apache-2.0 | `.ninfer` (~21,22 GiB) | 1x RTX 5090 (32 GB) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La principal diferencia es el formato de distribucion y los requisitos de hardware: la version NInfer reduce drasticamente el espacio en disco y la VRAM necesaria gracias a la cuantizacion groupwise-int, a costa de limitarse a una unica arquitectura de GPU.

## Limitaciones y advertencias

- Compatibilidad restringida: el runtime NInfer solo funciona en GPUs con arquitectura `sm_120a` (RTX 5090); no es portable a otros hardware.
- Los modos de especulacion MTP y DFlash son mutuamente excluyentes; DFlash no se puede combinar con la vision.
- El frontend reemplaza la plantilla de chat original de Ornith por la de Qwen, lo que elimina los bloques de pensamiento de turnos anteriores; esto puede alterar el comportamiento conversacional esperado.
- La tasa de aceptacion de DFlash puede degradarse en este finetune, reduciendo la velocidad de generacion; se recomienda evaluar ambos modos en la carga de trabajo real.
- La licencia Apache-2.0 de esta distribucion combina componentes con origenes distintos (MIT para los pesos de Ornith, Apache-2.0 para el resto); es necesario revisar el fichero NOTICE incluido para cumplir con las atribuciones.
- No es un release oficial de Qwen, shisa-ai, ornith-ai ni NInfer; es un artefacto de terceros.
- No se han documentado sesgos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggingJDE/Ornith-1.5-35B-A3B-NInfer
- Modelo base (shisa-ai): https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de NInfer: https://github.com/Neroued/ninfer
- Repositorio de build reproducible: https://github.com/j842/ninfer-qwen-uncensored
- Modelo borrador DFlash: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Qwen3.6-35B-A3B (frontend): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Analisis del modelo base: https://www.aimadetools.com/blog/ornith-1-5-35b-a3b/
- Registro en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
