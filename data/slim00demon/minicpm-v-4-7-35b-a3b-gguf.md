# slim00demon/MiniCPM-V-4.7-35B-A3B-gguf

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) desarrollado por OpenBMB, y supone la primera variante con arquitectura MoE (Mixture of Experts) de la familia MiniCPM-V. Con 34.659.889.792 parametros totales y aproximadamente 3B activos por token, esta disenado para equilibrar capacidad y eficiencia, apuntando tanto a servidores como a inferencia on-device. El repositorio que nos ocupa, `slim00demon/MiniCPM-V-4.7-35B-A3B-gguf`, es una cuantizacion GGUF del modelo base `openbmb/MiniCPM-V-4.7-35B-A3B`, preparada para su uso con llama.cpp.

El modelo aborda el problema de desplegar un MLLM de gran capacidad en entornos con recursos limitados. Para ello combina tecnicas como Lookahead Expert Scheduling (LES), cuantizacion fina por capas e integracion de decodificacion especulativa DSpark, que segun el autor permiten alcanzar mas de 13 tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max. Ademas, incorpora compresion temprana de tokens visuales dentro del encoder (intra-ViT, tecnica de LLaVA-UHD v4) y soporte de compresion visual mixta 4x/16x.

La relevancia actual del modelo radica en su propuesta de nueva frontera de Pareto entre rendimiento y eficiencia: en modo Instruct, segun la model card, supera en puntuacion global a Qwen3.6 35B-A3B empleando menos tiempo de inferencia. La licencia Apache 2.0 y el soporte amplio de frameworks (SGLang, vLLM, llama.cpp, Ollama) lo hacen atractivo para produccion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (Mixture of Experts); encoder visual con compresion intra-ViT temprana |
| Parametros totales | 34.659.889.792 (~35B) |
| Parametros activos | ~3B (variante 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ3_M, IQ3_XS, IQ4_NL, IQ4_XS, mix_q3gud_im; el modelo base ofrece ademas BNB, AWQ, GPTQ y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en BF16 en el repositorio base |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B emplea una arquitectura transformer con capas MoE, siendo el primer modelo de la familia MiniCPM-V en adoptar este diseno. El componente visual se basa en la tecnica de compresion temprana intra-ViT de LLaVA-UHD v4, que reduce el numero de tokens visuales dentro del propio encoder para disminuir el computo en las capas posteriores. El modelo admite compresion de tokens visuales mixta 4x/16x, lo que permite ajustar el equilibrio entre detalle visual y coste de inferencia segun la tarea.

En el plano de la eficiencia de despliegue, el modelo integra Lookahead Expert Scheduling (LES), una tecnica introducida junto con esta version que anticipa la seleccion de expertos para suavizar la inferencia MoE en dispositivos. A ello se suman la cuantizacion fina por capas y la integracion de muestreo especulativo DSpark. El autor tambien publica Self-Replay Fine-Tuning (SRFT), un metodo de ajuste fino de bajo coste orientado a extender capacidades reduciendo el olvido catastrofico. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Comprension de imagen individual, multiples imagenes y video (image-text-to-text).
- Generacion de texto y respuestas conversacionales multimodales.
- Razonamiento visible opcional mediante traza `[Start thinking] … [End thinking]` en los ficheros de la carpeta `thinking/`.
- Compresion visual configurable (4x/16x) para equilibrar detalle y coste.
- Inferencia on-device en iOS, Android y HarmonyOS.
- Soporte de despliegue en SGLang, vLLM, llama.cpp y Ollama.
- Ajuste fino mediante SWIFT y LLaMA-Factory.
- Decodificacion especulativa DSpark para acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en local: el modelo permite ejecutar tareas de image-to-text directamente en llama.cpp con el fichero `mmproj` y una cuantizacion Q4_K_M, sin necesidad de GPU de datacenter, lo que resulta adecuado para prototipos y demos.
- Inferencia en dispositivos moviles: gracias a LES, la cuantizacion fina y DSpark, puede desplegarse en iOS, Android y HarmonyOS con un consumo de memoria reducido (el autor cita 3 GB en iPhone 17 Pro Max), habilitando asistentes visuales offline.
- Procesamiento de video en el borde: la comprension de video junto con la compresion de tokens visuales 4x/16x permite analizar secuencias en equipos con recursos limitados ajustando el nivel de detalle.
- Despliegue en servidores con vLLM o SGLang: el modelo base ofrece soporte para estos frameworks, lo que facilita servir cargas concurrentes de image-text-to-text en produccion.
- Ajuste fino especifico de dominio: mediante SWIFT o LLaMA-Factory y la tecnica SRFT, se puede adaptar el modelo a tareas concretas (por ejemplo, inspeccion visual industrial) reduciendo el olvido de capacidades previas.
- Evaluacion comparativa de razonamiento: los ficheros de la carpeta `thinking/` permiten obtener trazas de razonamiento para auditar el proceso de respuesta, util en investigacion y control de calidad.
- Integracion en pipelines de CI para validacion de imagenes: el soporte de llama.cpp y formatos GGUF permite automatizar comprobaciones visuales en entornos sin GPU dedicada.

## Benchmarks y rendimiento

La model card indica que, en modo Instruct, la variante 35B-A3B obtiene una puntuacion global superior a Qwen3.6 35B-A3B con menor tiempo de inferencia. Sin embargo, no se proporcionan cifras numericas de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. Una Q4_K_M de un modelo de ~35B totales ronda los 20 GB de pesos, mas el `mmproj` en F16; las variantes IQ3 e IQ4 reducen aun mas el espacio. No se dispone de cifras oficiales de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones Q4 en adelante, mientras que A100/H100 serian adecuadas para F16 o Q8.
- Cabe en GPU consumer: previsiblemente si con cuantizaciones Q4/IQ4 en GPUs de 24 GB o superiores; no confirmado en la informacion disponible.
- Opciones de despliegue: llama.cpp (este repositorio), Ollama, vLLM y SGLang (modelo base); soporte day-0 para plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm.
- Latencia y throughput: el autor cita mas de 13 tokens/s con 3 GB de memoria en iPhone 17 Pro Max. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | ~35B | ~3B | no disponible | Apache 2.0 | Primer MoE de la familia; foco on-device |
| Qwen3.6 35B-A3B | ~35B | ~3B | no disponible | no disponible | Referencia citada por el autor; el modelo lo supera en puntuacion global con menos tiempo de inferencia (segun la model card) |
| Alternativas de la familia MiniCPM-V (versiones densas previas) | no disponible | no disponible | no disponible | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Los ficheros de la raiz tienen el modo thinking deshabilitado de forma fija en la plantilla; no puede activarse con `--reasoning off` ni otras opciones. Para obtener trazas de razonamiento hay que usar los ficheros de `thinking/`.
- El modelo no esta entrenado como modelo de razonamiento segun el autor; forzar la traza de thinking multiplica el numero de tokens y puede degradar la eficiencia.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; se recomienda evaluacion propia antes de produccion.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una cuantizacion de terceros (`slim00demon`), no oficial de OpenBMB; conviene verificar la integridad de los pesos.
- El tamano del repositorio (803.1 GB) refleja la multiplicidad de cuantizaciones; descargar solo los ficheros necesarios.
- El rendimiento on-device citado (13+ tokens/s, 3 GB) corresponde a un dispositivo concreto (iPhone 17 Pro Max) y a configuraciones especificas; no es extrapolable sin validacion.
- No hay datos publicados de benchmarks numericos en la informacion disponible, lo que limita la comparacion objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/slim00demon/MiniCPM-V-4.7-35B-A3B-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- GitHub del proyecto: https://github.com/openbmb/MiniCPM-V
- Repositorio llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Documentacion de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- DSpark-gguf: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark-gguf
- Blog SRFT: https://openbmb.cn/en/blog/self-replay-fine-tuning
