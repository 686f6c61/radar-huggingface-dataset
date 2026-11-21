# 1sjsh/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro abliterated es una cuantización GGUF experimental del modelo Qwen3.8-Flash-Next en su variante "abliterated" (sin dirección de rechazo) publicada por huihui-ai. El autor de esta ficha, 1sjsh, se limita a recodificar esos pesos con el esquema de cuantización propietario "Gyro" de agentionai, que emplea tipos trellis (TQK6/TQK7, TQ2_T, TQP5-7) para comprimir un modelo de aproximadamente 125.700 millones de parámetros en ficheros que caben en GPUs de consumo y en máquinas de memoria unificada.

El modelo base es multimodal (pipeline image-text-to-text) y está diseñado para cargas de trabajo agénticas y conversacionales, con soporte de decodificación especulativa mediante un draft MTP y una tabla n-gram (PLE) que se puede descargar por separado para reducir el tamaño de los ficheros. La abliteración elimina la mayor parte de los rechazos del modelo original, lo que lo hace apto para investigación sobre alineamiento y para entornos controlados, pero no para uso público sin supervisión.

La relevancia de esta publicación es fundamentalmente técnica: demuestra que un modelo de 125B con contexto de 64k puede ejecutarse en tarjetas de 32 GB (Gyro-S, 28,8 GiB) o en equipos de 64 GB de memoria unificada (Gyro-L, 50,21 GiB de pesos) usando runtimes alternativos a llama.cpp upstream, que todavía no carga estos tipos trellis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y atención lineal (linear-attention), expertos enrutados y compartidos (MoE); incluye torre visual y cabecera MTP para decodificación especulativa |
| Parametros totales | 125.743.653.760 (≈125,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64k) en la configuración de referencia del autor |
| Tipos de cuantizacion | Trellis propietarios: TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); tabla PLE en IQ4_NL (S) y Q8_0 (M y L); proyector visual mmproj-F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (con ficheros alternativos `-noPLE` sin tabla n-gram) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina capas de atención completa con capas de atención lineal, e incorpora un esquema de mezcla de expertos con expertos compartidos y enrutados. El modelo incluye además una torre de visión (pipeline image-text-to-text) y una cabecera de predicción multi-token (MTP) que se usa como draft para decodificación especulativa. La tabla n-gram (PLE) es común a todas las cuantizaciones de Qwen3.8-Flash-Next y puede descargarse aparte para recortar el tamaño de descarga.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La abliteración, trabajo de huihui-ai, modifica únicamente los tensores que escriben en el flujo residual: en Gyro-S y Gyro-M (v1) son 144 de 1.224 tensores (salidas de atención y atención lineal, y proyecciones down de expertos compartidos y enrutados); en Gyro-L (v2) son 96 tensores (salidas de atención y atención lineal, y proyecciones down de expertos compartidos), con los expertos enrutados idénticos a los del Gyro-L original. El resto de pesos es byte-idéntico a los ficheros Gyro no abliterated.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 64k tokens.
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante el proyector visual `mmproj-F16.gguf`.
- Razonamiento y respuesta a instrucciones en formato chat (requiere `--jinja` en llama.cpp).
- Decodificación especulativa con draft MTP (`--spec-type draft-mtp`) para acelerar la generación.
- Carga de tabla n-gram externa (`--ple`) para reducir el tamaño del fichero principal.
- Ejecución en GPU NVIDIA (CUDA), AMD (Vulkan, HIP) y CPU según el runtime empleado.
- Comportamiento "uncensored": la abliteración elimina la mayor parte de los rechazos del modelo original.
- No se dispone de información sobre soporte explícito de tool calling, function calling ni capacidades de agente multi-paso en la documentación proporcionada.

## Casos de uso

- Investigación sobre alineamiento y abliteración: comparar el comportamiento del modelo abliterated frente al original en las mismas prompts permite medir cuánto de la capacidad de rechazo reside en la dirección eliminada y evaluar el coste en calidad (KLD de 0,397 en S, 0,295 en M y 0,164 en L frente al original).
- Despliegue local en estación de trabajo con GPU de 32 GB: el fichero Gyro-S ocupa 28,8 GiB con contexto de 64k, lo que permite ejecutar un modelo de 125B en una única tarjeta consumer de gama alta o profesional de 32 GB.
- Prototipado en equipos de memoria unificada de 64 GB (por ejemplo, Strix Halo): Gyro-L con 50,21 GiB de pesos ofrece la mayor fidelidad al modelo original (KLD 0,164) sin necesidad de GPU discreta.
- Análisis de documentos e imágenes en local: la torre visual integrada permite tareas image-text-to-text sin enviar datos a servicios externos, útil en entornos con requisitos de confidencialidad.
- Evaluación de decodificación especulativa: el par de ficheros MTP draft más modelo principal sirve para medir ganancias de throughput en distintos hardwares y runtimes.
- Pruebas de robustez y red teaming: al carecer de la mayor parte de los rechazos, el modelo es útil para generar casos adversarios y estudiar la eficacia de filtros externos, siempre en entornos aislados y bajo supervisión.
- Benchmarking de runtimes alternativos: comparar Strata, strix-llama.cpp y agentionai/llama.cpp en cuanto a velocidad y compatibilidad con los tipos trellis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad es la divergencia KL (KLD) frente al modelo original:

| Variante | Tamano de pesos | VRAM estimada (64k contexto) | KLD vs original |
|---|---:|---:|---:|
| Gyro-S abliterated (TQ1_0) | 58,5 GB (fichero completo) / 29,7 GB (-noPLE) | 28,8 GiB | 0,397 |
| Gyro-M abliterated (TQ2_0) | 92,0 GB / 37,6 GB | ~37 GiB | 0,295 |
| Gyro-L abliterated (TQ3_0) | 108,3 GB / 53,9 GB | 50,21 GiB (pesos) | 0,164 |

## Requisitos de hardware

- VRAM estimada para inferencia con contexto de 64k: 28,8 GiB (Gyro-S), ~37 GiB (Gyro-M) y 50,21 GiB solo de pesos en Gyro-L.
- GPU recomendadas: tarjetas de 32 GB para Gyro-S; 2×24 GB o equipos de 64 GB de memoria unificada para Gyro-M; máquinas de 64 GB de memoria unificada (Strix Halo) para Gyro-L.
- Cabe en GPU consumer: Gyro-S está pensado para tarjetas de 32 GB; Gyro-M y Gyro-L requieren configuraciones multi-GPU o memoria unificada.
- Opciones de despliegue: Strata 0.2.0 o superior (NVIDIA, AMD RX 7000/RX 9000/R9700), halo-box/strix-llama.cpp master (AMD Strix Halo; CPU, Vulkan, HIP), agentionai/llama.cpp (CPU, Vulkan, CUDA) y el contenedor agentionai/agention-llama:server. llama.cpp upstream no carga estos tipos trellis; LM Studio y Ollama no pueden cargar los ficheros `-noPLE`.
- Latencia y throughput estimados: no disponibles. El autor indica que la velocidad es la misma que la de los ficheros Gyro equivalentes y que se puede usar decodificación especulativa con draft MTP para acelerar la generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---:|---|---|---|
| Qwen3.8-Flash-Next Gyro abliterated (esta ficha) | ≈125,7B | 64k | GGUF con tipos trellis propietarios | qwen-community-1.0 | Requiere runtimes alternativos (Strata, strix-llama.cpp, agentionai/llama.cpp) |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (v1) | ≈125,7B | no disponible | safetensors (modelo base) | no disponible en la información | Pesos originales abliterated; sin cuantizar |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | ≈125,7B | no disponible | GGUF | no disponible en la información | Fuente de Gyro-L; abliteración v2 con 96 tensores modificados |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF | ≈125,7B | 64k | GGUF con tipos trellis | no disponible en la información | Versión no abliterated de la que deriva esta ficha |

## Limitaciones y advertencias

- La abliteración elimina la mayor parte de los rechazos: el modelo puede producir contenido dañino, ofensivo o inapropiado. No es apto para uso público ni para despliegue sin supervisión.
- La licencia qwen-community-1.0 impone condiciones específicas; es responsabilidad del usuario verificar si su uso comercial está permitido y cumplir la legislación aplicable.
- Los tipos de cuantización trellis no son compatibles con llama.cpp upstream ni con herramientas estándar como LM Studio u Ollama (salvo con los ficheros completos, no `-noPLE`), lo que limita la portabilidad.
- La cuantización introduce degradación medible: KLD de 0,397 en Gyro-S, 0,295 en Gyro-M y 0,164 en Gyro-L frente al modelo original, con mayor pérdida en la variante más comprimida.
- Los ficheros `-noPLE` requieren descargar y cargar por separado la tabla n-gram (`--ple`), disponible solo en compilaciones recientes de agentionai/llama.cpp y strix-llama.cpp master.
- No se dispone de información sobre sesgos específicos, idiomas soportados ni tasas de alucinación medidas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación experimental sin validación comunitaria.
- El tamaño del repositorio (383,6 GB) implica un coste de almacenamiento y descarga considerable si se quieren todas las variantes.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/1sjsh/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Modelo base abliterated v1: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo base abliterated v2 (GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Ficha Gyro original (no abliterated): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Tabla PLE independiente: https://huggingface.co/Delgon/Qwen3.8-Flash-Next-PLE-GGUF
- Runtime Strata: https://github.com/Niko1221/Strata
- Runtime strix-llama.cpp: https://github.com/halo-box/strix-llama.cpp
- Runtime agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Rama Strata de agentionai: https://gitlab.com/agentionai-group/strata/-/tree/main
