# agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen

Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF es una cuantizacion GGUF del modelo Qwen3.8-Flash-Next sometido a *abliteration* por huihui-ai, publicada por agentionai. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 125.700 millones de parametros totales, derivado de la familia Qwen. La abliteration elimina la direccion de rechazo de los pesos, de modo que el modelo practicamente no rechaza peticiones; agentionai se limita a cuantizar el resultado en tres tamanos (Gyro-S, Gyro-M y Gyro-L) optimizados para GPUs de 32, 48 y 64 GB respectivamente.

La relevancia de esta ficha es doble. Por un lado, demuestra que un MoE de 125B puede ejecutarse en una sola tarjeta de 32 GB con 64k de contexto (Gyro-S ocupa 28,8 GiB), gracias a tipos de cuantizacion trellis propietarios (TQK6/TQK7, TQ2_T, TQP5-7). Por otro, los ficheros no cargan en llama.cpp upstream: requieren runtimes especificos como Strata 0.2.0 o los forks de agentionai y strix-llama.cpp, lo que condiciona su adopcion en produccion.

El pipeline declarado es `image-text-to-text`, e incluye un proyector de vision (`mmproj-F16.gguf`) y un draft model MTP para decodificacion especulativa. La licencia es `qwen-community-1.0`, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion lineal hibrida; derivado de Qwen3.8-Flash-Next |
| Parametros totales | 125.743.653.760 (~125,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 64k tokens (segun la model card, en las tres variantes) |
| Tipos de cuantizacion | Trellis propietarios: TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); ficheros etiquetados TQ1_0, TQ2_0, TQ3_0 como clase de tamano |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | GGUF (con proyector de vision `mmproj-F16.gguf` y draft MTP `mtp-Qwen3.8-Flash-Next-draft.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con componentes de atencion lineal (linear-attention), segun se deduce de la descripcion de las tensores modificados por la abliteration: salidas de atencion, salidas de atencion lineal y proyecciones *down* de los expertos compartidos y enrutados. En Gyro-S y Gyro-M (huihui-ai v1) se alteraron 144 de 1.224 tensores; en Gyro-L (huihui-ai v2) solo 96, dejando los expertos enrutados identicos a los del modelo Gyro original. El resto de tensores es byte-identico a los ficheros Gyro sin abliterar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica principal no esta en el entrenamiento sino en la codificacion: agentionai aplica tipos de cuantizacion trellis (TQK6/TQK7, TQ2_T, TQP5-7) que permiten comprimir un MoE de 125B a 28,8 GiB manteniendo 64k de contexto. La model card reporta divergencias KL frente al modelo original de 0,397 (Gyro-S), 0,295 (Gyro-M) y 0,164 (Gyro-L), y afirma que la abliteration apenas degrada el rendimiento en texto tecnico y codigo (diferencias inferiores a 0,005 KL respecto a los ficheros Gyro no abliterados). Se incluye soporte de decodificacion especulativa mediante un draft model MTP separado.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 64k tokens.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector `mmproj-F16.gguf`.
- Razonamiento y generacion de codigo; la model card menciona un agente de codigo propio (Marshall) como caso de uso del ecosistema.
- Decodificacion especulativa con draft model MTP para acelerar la inferencia.
- Ausencia practica de rechazos: la abliteration elimina la direccion de rechazo, por lo que el modelo responde a peticiones que el original declinaria.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas explicitamente, aunque el ecosistema del autor incluye un agente de codigo.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local de un MoE de 125B en una sola GPU de 32 GB: Gyro-S ocupa 28,8 GiB con 64k de contexto, lo que permite desplegar el modelo en estaciones de trabajo con una RTX 5090 o similar sin infraestructura multi-GPU.
- Analisis de documentos tecnicos largos: la ventana de 64k tokens permite procesar manuales, especificaciones o bases de codigo extensas en una sola pasada, con la ventaja de que la abliteration no degrada el rendimiento en texto tecnico segun la KL reportada.
- Generacion de codigo en pipelines internos: el modelo puede integrarse como backend de un servidor compatible con la API de llama.cpp (puerto 8080) y usarse desde herramientas de CI/CD o asistentes de IDE, siempre que se acepte la licencia qwen-community-1.0.
- Procesamiento de imagenes con texto (OCR, descripcion, VQA): cargando el proyector `mmproj-F16.gguf` junto con los pesos, el modelo acepta entradas imagen-texto para tareas de extraccion o descripcion.
- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento en dominios sensibles, comparando con el modelo original y con las variantes Gyro no abliteradas.
- Despliegue en hardware AMD: los runtimes Strata y strix-llama.cpp soportan RX 7000, RX 9000, R9700 y Strix Halo (memoria unificada de 64 GB), lo que habilita ejecutar Gyro-L en equipos sin GPU NVIDIA.
- Aceleracion de inferencia con decodificacion especulativa: el draft model MTP permite reducir la latencia en cargas de generacion interactiva, util en asistentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta divergencia KL frente al modelo original:

| Variante | Memoria GPU (64k contexto) | KLD vs modelo original |
|---|---:|---:|
| Gyro-S (TQ1_0) | 28,8 GiB | 0,397 |
| Gyro-M (TQ2_0) | ~37 GiB | 0,295 |
| Gyro-L (TQ3_0) | 50,21 GiB (pesos) | 0,164 |

La model card afirma ademas que Gyro-S y Gyro-M estan a menos de 0,005 KL de los ficheros Gyro no abliterados, es decir, que la abliteration apenas altera la distribucion en texto tecnico y codigo.

## Requisitos de hardware

- VRAM estimada: 28,8 GiB (Gyro-S, 64k contexto), ~37 GiB (Gyro-M), 50,21 GiB solo de pesos (Gyro-L).
- GPU recomendadas: 32 GB para Gyro-S (RTX 5090, A100 40 GB, L40S); 48 GB o 2x24 GB para Gyro-M; 64 GB de memoria unificada para Gyro-L (Strix Halo).
- Cabe en GPU de consumo: si, Gyro-S en tarjetas de 32 GB; Gyro-M en configuraciones de 2x24 GB; Gyro-L requiere memoria unificada de 64 GB o GPUs profesionales.
- Runtimes soportados: Strata 0.2.0 o superior (NVIDIA, AMD RX 7000/RX 9000/R9700), halo-box/strix-llama.cpp master (AMD Strix Halo; CPU, Vulkan, HIP), agentionai/llama.cpp (CPU, Vulkan, CUDA). Gyro-L requiere los tipos pair-trellis de agentionai/llama.cpp o de la rama `main` de agentionai-group/strata.
- llama.cpp upstream no puede cargar estos ficheros todavia.
- Contenedor oficial de agentionai con llama.cpp precompilado (Vulkan; CUDA compilando manualmente) y servidor en `http://localhost:8080`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Gyro-abliterated (este) | ~125,7B MoE | 64k | qwen-community-1.0 | GGUF, runtimes especificos | Abliterado, cuantizacion trellis propietaria |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF | ~125,7B MoE | 64k | qwen-community-1.0 | GGUF, mismos runtimes | Version no abliterada del mismo autor |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | ~125,7B MoE | no disponible | no disponible | Safetensors / GGUF | Modelo base de esta cuantizacion |
| Qwen3.8-Flash-Next original | ~125,7B MoE | no disponible | qwen-community-1.0 | pesos originales | Modelo sin abliterar del que deriva la familia |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la mayoria de los rechazos del modelo; la model card incluye una advertencia de uso explicita. No es adecuado para aplicaciones donde se requiera moderacion de contenido por defecto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido incorrecto con apariencia de veracidad.
- Licencia qwen-community-1.0: impone restricciones para uso comercial; es necesario revisar los terminos antes de desplegar en produccion.
- Compatibilidad limitada: los ficheros no cargan en llama.cpp upstream y requieren runtimes especificos (Strata, strix-llama.cpp o agentionai/llama.cpp), lo que reduce la portabilidad y aumenta el coste de mantenimiento.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Parametros activos del MoE no disponibles, lo que dificulta estimar el coste computacional real por token.
- El modelo esta marcado como `experimental` en los tags del Hub.
- La cuantizacion trellis propietaria dificulta la inspeccion y conversion a otros formatos.
- No hay benchmarks publicados que permitan validar la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Gyro card (guia completa): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Version v2 de huihui-ai (GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Web de agentionai: https://www.agention.ai/
- Agente de codigo Marshall: https://marshall.agention.ai
- Runtime Strata: https://github.com/Niko1221/Strata
- Fork strix-llama.cpp: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Rama Strata de agentionai: https://gitlab.com/agentionai-group/strata/-/tree/main
