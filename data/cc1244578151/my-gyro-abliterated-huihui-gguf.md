# cc1244578151/my-Gyro-abliterated-Huihui-GGUF

## Resumen

my-Gyro-abliterated-Huihui-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next en su variante "abliterated" (sin dirección de rechazo) producida por huihui-ai y reempaquetada por el usuario cc1244578151. El modelo subyacente es un transformer multimodal (image-text-to-text) de aproximadamente 177.000 millones de parámetros, derivado de la familia Qwen3.8-Flash-Next, con arquitectura híbrida que combina atención estándar y atención lineal según los tensores descritos en la model card. La abliteración elimina la dirección de rechazo de los pesos, de modo que el modelo deja de negarse a responder a determinadas peticiones.

El artefacto publicado es un conjunto de ficheros GGUF en tres tamaños (Gyro-S, Gyro-M y Gyro-L) pensados para ejecutarse en una sola GPU o en máquinas con memoria unificada: 32 GB, 48 GB y 64 GB respectivamente. Los pesos usan tipos de cuantización trellis propietarios (TQK6/TQK7, TQ2_T y TQP5-7) que no carga el llama.cpp upstream; requieren runtimes específicos como Strata, halo-box/strix-llama.cpp o agentionai/llama.cpp.

Es relevante ahora porque permite ejecutar un modelo de ~177B parámetros con capacidades de visión y decodificación especulativa en hardware de consumo o estaciones de trabajo con memoria unificada, a costa de una divergencia KL medible frente al modelo original (0,397 en Gyro-S, 0,164 en Gyro-L) y de una licencia comunitaria con restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención estándar y atención lineal (híbrida); multimodal image-text-to-text |
| Parámetros totales | 176.943.899.520 (~177B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de despliegue a 64k) |
| Tipos de cuantización | Trellis TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); proyector visual F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (con tipos trellis no soportados por llama.cpp upstream) |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer con atención estándar y atención lineal, en la línea de las arquitecturas híbridas de la familia Qwen. El modelo base es Qwen3.8-Flash-Next en su variante abliterated de huihui-ai, que elimina la dirección de rechazo de los pesos. Según la card, la abliteración afecta a 144 de 1.224 tensores en Gyro-S y Gyro-M (salidas de atención y atención lineal, y proyecciones down de expertos compartidos y enrutados) y a 96 tensores en Gyro-L (salidas de atención y atención lineal, y proyecciones down de expertos compartidos). La mención de "expertos compartidos y enrutados" indica una arquitectura de mezcla de expertos (MoE), aunque el número de parámetros activos no se detalla.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la cuantización trellis con tipos propietarios que permiten comprimir los expertos a tamaños de 27-50 GiB manteniendo una divergencia KL relativamente baja frente al original. También se incluye un borrador MTP (multi-token prediction) para decodificación especulativa, con un 81% de tokens aceptados en una prueba inicial sobre un prompt de código.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline conversacional).
- Procesamiento de imagen y texto conjuntamente (image-text-to-text) mediante proyector visual F16.
- Razonamiento y generación de código; la card reporta KLD de código de 0,111 (S), 0,066 (M) y 0,032 (L) frente al original.
- Decodificación especulativa mediante borrador MTP opcional.
- Ejecución en GPU NVIDIA, AMD RX 7000/RX 9000/R9700 y memoria unificada AMD Strix Halo.
- Abliteración: elimina la mayoría de rechazos, lo que permite generar contenido que el modelo original rechazaría.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de ~177B en una GPU de 32 GB: con Gyro-S (28,8 GiB a 64k de contexto) se puede desplegar en tarjetas como la RTX 5090 o A100 de 40 GB, usando llama.cpp con los parches de agentionai y cuantización de caché KV a q8_0.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text y el proyector mmproj-F16 permiten extraer información de capturas, diagramas o documentos escaneados en un flujo local sin depender de APIs externas.
- Generación de código en pipelines internos: el KLD de código bajo (0,032-0,111) sugiere que la cuantización degrada poco la calidad en código, lo que lo hace apto para autocompletado y revisión en entornos con hardware limitado.
- Investigación sobre alineación y abliteración: permite comparar el comportamiento del modelo original frente al abliterated con las mismas entradas, útil para estudiar la dirección de rechazo y sus efectos.
- Despliegue en estaciones Strix Halo: Gyro-L (50,21 GiB de pesos) cabe en máquinas con 64 GB de memoria unificada, habilitando un modelo de ~177B con visión en formato compacto.
- Servicio de chat experimental en entornos controlados: con el contenedor agention-llama:server y contexto de 65.536 tokens, se puede levantar un endpoint compatible con la API de OpenAI para pruebas internas.
- Aceleración con decodificación especulativa: el borrador MTP permite reducir la latencia en generación de código y texto técnico, con una tasa de aceptación reportada del 81% en una prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de fidelidad de cuantización frente al modelo original (no abliterated) de Qwen3.8-Flash-Next:

| Fichero | Pesos en GPU | KLD vs original | top-1 vs original | KLD en código | top-1 en código |
|---|---:|---:|---:|---:|---:|
| Gyro-S abliterated | 27,64 GiB | 0,397 | 75,3 % | 0,111 | 94,3 % |
| Gyro-M abliterated | 34,98 GiB | 0,295 | 78,6 % | 0,066 | 95,5 % |
| Gyro-L abliterated | 50,21 GiB | 0,164 | 82,9 % | 0,032 | 97,0 % |

La card indica que la abliteración añade poca degradación frente a los Gyro no abliterated (0,005 de KLD adicional en S y M). No se proporcionan cifras de throughput ni latencia absolutas.

## Requisitos de hardware

- VRAM estimada: 28,8 GiB (Gyro-S, 64k de contexto), ~37 GiB (Gyro-M) y 50,21 GiB de pesos (Gyro-L).
- GPU recomendadas: NVIDIA con 32 GB o más para Gyro-S; 2×24 GB o 48 GB para Gyro-M; AMD RX 7000/RX 9000/R9700 con Strata 0.2.0 o superior; AMD Strix Halo con 64 GB de memoria unificada para Gyro-L.
- Cabe en GPU de consumo: sí, en tarjetas de 32 GB (Gyro-S) y en configuraciones de 48 GB o memoria unificada de 64 GB (Gyro-M y Gyro-L). No cabe en GPUs de 24 GB o menos.
- Opciones de despliegue: Strata 0.2.0+, halo-box/strix-llama.cpp (master), agentionai/llama.cpp (CPU, Vulkan, CUDA) y el contenedor agentionai/agention-llama:server. llama.cpp upstream no puede cargar los tipos trellis.
- Latencia y throughput: no disponibles. La decodificación especulativa con borrador MTP reporta un 81% de aceptación en una prueba con prompt de código.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| my-Gyro-abliterated-Huihui-GGUF | ~177B | 65.536 | Trellis TQK/TQ2_T/TQP5-7 | qwen-community-1.0 | GGUF en Hub, runtimes específicos |
| Qwen3.8-Flash-Next-Gyro-GGUF (agentionai) | ~177B | 65.536 | Trellis, mismos tipos | qwen-community-1.0 | GGUF, runtimes específicos |
| Huihui-Qwen3.8-Flash-Next-abliterated (huihui-ai) | ~177B | no disponible | safetensors (original) | qwen-community-1.0 | Pesos completos en Hub |
| Qwen3.8-Flash-Next original | ~177B | no disponible | safetensors | qwen-community-1.0 | Pesos completos en Hub |

Las alternativas comparten el mismo modelo base; la diferencia principal es el formato (GGUF trellis frente a safetensors) y la abliteración. No se dispone de datos de benchmarks para comparar rendimiento cualitativo entre ellas.

## Limitaciones y advertencias

- La abliteración elimina la mayoría de rechazos: el modelo puede generar contenido dañino, ofensivo o inapropiado. No es apto para uso público ni sin supervisión.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente a los modelos de lenguaje de esta escala.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Licencia qwen-community-1.0: revisar las restricciones de uso comercial antes de desplegar en producción.
- Los tipos de cuantización trellis no son compatibles con llama.cpp upstream; requieren runtimes de terceros (Strata, strix-llama.cpp, agentionai/llama.cpp), lo que limita la portabilidad.
- La divergencia KL frente al original (hasta 0,397 en Gyro-S) implica una degradación medible de la distribución de salida, especialmente fuera de código.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- El modelo base está etiquetado como experimental (tag "experimental"), lo que desaconseja su uso en producción crítica.

## Enlaces

- [HuggingFace: cc1244578151/my-Gyro-abliterated-Huihui-GGUF](https://huggingface.co/cc1244578151/my-Gyro-abliterated-Huihui-GGUF)
- [Modelo base: huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated)
- [Modelo base v2 GGUF: huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF)
- [Gyro card de referencia: agentionai/Qwen3.8-Flash-Next-Gyro-GGUF](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF)
- [Strata (runtime)](https://github.com/Niko1221/Strata)
- [halo-box/strix-llama.cpp](https://github.com/halo-box/strix-llama.cpp)
- [agentionai/llama.cpp (GitLab)](https://gitlab.com/agentionai-group/llama.cpp)
- [agentionai-group/strata (GitLab)](https://gitlab.com/agentionai-group/strata/-/tree/main)
