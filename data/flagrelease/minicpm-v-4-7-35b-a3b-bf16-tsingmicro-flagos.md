# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-tsingmicro-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest junto con OpenBMB, publicado en dos variantes (1B y 35B-A3B). La versión que nos ocupa, alojada por FlagRelease, es la adaptación del modelo de 35B de parámetros totales con arquitectura Mixture of Experts (MoE) y aproximadamente 3B de parámetros activos, optimizada para la pila de software FlagOS sobre chips Tsingmicro. Se trata de un modelo de visión-lenguaje que procesa imagen y texto para tareas de comprensión multimodal.

El modelo se presenta como el primer modelo multimodal MoE de código abierto capaz de ejecutarse de forma fluida en dispositivo (on-device), gracias a la técnica Lookahead Expert Scheduling (LES), que precarga expertos y solapa cómputo y lectura para reducir la latencia. Según la model card, alcanza más de 13 tokens por segundo en un iPhone 17 Pro Max con el esquema de optimización on-device. Incorpora compresión temprana dentro del ViT y compresión de tokens visuales de 4x y 16x, además de decodificación especulativa DSpark.

Esta ficha corresponde específicamente al artefacto de FlagRelease adaptado a Tsingmicro mediante FlagOS, con pesos en BF16 y código personalizado. Es relevante para equipos que necesitan desplegar un modelo multimodal MoE de 35B sobre aceleradores no NVIDIA con una pila unificada, aunque el rendimiento medido en esta adaptación es ligeramente inferior al de la pila nativa NVIDIA según los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE); visión-lenguaje con compresión de tokens visuales en ViT |
| Parametros totales | 35.212.875.824 (aprox. 35B) |
| Parametros activos | Aproximadamente 3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con custom_code |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con capa MoE, con 35B de parámetros totales y aproximadamente 3B activos por token. La rama de visión incorpora la técnica de compresión temprana dentro del ViT y compresión de tokens visuales de 4x y 16x, lo que reduce el coste computacional del procesamiento de imágenes. La innovación técnica destacada es Lookahead Expert Scheduling (LES), que precarga expertos y paraleliza cómputo y lectura para disminuir la latencia en inferencia on-device. También soporta decodificación especulativa DSpark para equilibrar detalle visual y eficiencia.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card menciona evaluaciones en modo Instruct, lo que sugiere un ajuste por instrucciones, pero no se detalla el proceso. El artefacto de FlagRelease es una adaptación de despliegue sobre Tsingmicro mediante FlagOS, que incluye FlagScale, FlagGems, FlagCX y FlagTree; no se trata de un reentrenamiento, sino de una migración del modelo a otra pila de hardware y software.

## Capacidades

- Comprensión multimodal de imagen y texto: el modelo procesa entradas visuales junto con lenguaje natural para responder preguntas, describir imágenes y razonar sobre contenido visual.
- Razonamiento matemático: los benchmarks publicados incluyen Math_500, lo que indica capacidad para resolver problemas matemáticos.
- Razonamiento científico y de sentido común: evaluado en GPQA_Diamond y ERQA.
- Generación de texto en chino e inglés, los dos idiomas declarados en la model card.
- Modo Instruct: la model card menciona evaluaciones en modo Instruct, lo que implica ajuste para seguir instrucciones.
- Decodificación especulativa DSpark para acelerar la generación.
- Compresión de tokens visuales (4x y 16x) para eficiencia en el procesamiento de imágenes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.
- Thinking mode explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede analizar capturas de pantalla o fotos enviadas por el usuario junto con texto para resolver incidencias, aprovechando su naturaleza visión-lenguaje y su despliegue en servidor mediante el contenedor FlagOS-Tsingmicro.
- Análisis documental con imágenes: extracción de información de documentos escaneados, gráficos y diagramas en chino e inglés, usando la compresión de tokens visuales para reducir el coste por imagen.
- Despliegue on-device en dispositivos móviles: la variante 35B-A3B está diseñada para ejecución en dispositivo con LES y DSpark; según la model card, supera los 13 tokens por segundo en un iPhone 17 Pro Max, lo que permite asistentes visuales locales sin depender de la nube.
- Inferencia en aceleradores no NVIDIA: el artefacto adaptado a Tsingmicro mediante FlagOS permite desplegar el modelo en infraestructura con chips Tsingmicro usando el contenedor Docker publicado y el servidor vLLM incluido.
- Razonamiento matemático y científico asistido: con resultados de 94 en Math_500 y 80,3 en GPQA_Diamond en esta adaptación, puede emplearse en herramientas de tutoría o verificación de cálculos con apoyo de imágenes de problemas.
- Integración en asistentes tipo AnythingLLM: la model card documenta la integración con AnythingLLM, lo que permite montar un asistente conversacional con documentos y capacidades visuales sobre el endpoint compatible con la API de completions.
- Procesamiento de imágenes en entornos con ARM edge CPU: la adaptación FlagOS extiende ambas variantes a plataformas ARM edge, habilitando comprensión multimodal en dispositivos de borde.

## Benchmarks y rendimiento

| Metrica | MiniCPM-V-4.7-35B-A3B-Nvidia-Origin | MiniCPM-V-4.7-35B-A3B-Tsingmicro-FlagOS |
|---|---|---|
| Math_500 | 94,80 | 94 |
| GPQA_Diamond | 81,31 | 80,3 |
| ERQA | 52,26 | 51,75 |

La model card indica además que, en evaluaciones oficiales en modo Instruct, el 35B-A3B y el 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se proporcionan los valores numéricos de esa comparación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35B de parámetros en BF16, los pesos ocupan aproximadamente 70,4 GB (tamaño del repo), por lo que se requiere al menos esa cantidad de memoria más overhead para el runtime.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. El artefacto está adaptado a chips Tsingmicro mediante FlagOS; la model card menciona también adaptación a NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Iluvatar CoreX, Sunrise, Mac (M5 Pro) y CIX P1, además de plataformas ARM edge CPU.
- Cabe en GPU consumer: no disponible. El tamaño de pesos en BF16 (70,4 GB) excede la VRAM de las GPU consumer habituales; se requeriría cuantización, cuyos formatos no se detallan.
- Opciones de despliegue: contenedor Docker FlagOS-Tsingmicro con vLLM 0.20.2 y FlagGems 5.4.0 (según la etiqueta de la imagen); servidor arrancado con `server.sh` y endpoint compatible con `/v1/completions`. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: según la model card, más de 13 tokens por segundo en iPhone 17 Pro Max con el esquema de optimización on-device. No se proporcionan cifras de throughput para el despliegue en servidor con Tsingmicro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B (esta ficha, FlagOS/Tsingmicro) | 35B totales, ~3B activos | no disponible | Math_500 94; GPQA_Diamond 80,3; ERQA 51,75 | Apache 2.0 | HuggingFace, ModelScope |
| MiniCPM-V-4.7-35B-A3B (NVIDIA Origin) | 35B totales, ~3B activos | no disponible | Math_500 94,80; GPQA_Diamond 81,31; ERQA 52,26 | Apache 2.0 | HuggingFace, ModelScope |
| Qwen3.6-35B-A3B | no disponible | no disponible | Inferior al MiniCPM-V-4.7-35B-A3B en puntuación global según la model card; sin cifras | no disponible | no disponible |
| MiniCPM-V-4.7-1B | 1B | no disponible | Inferior al 35B-A3B; superior a Qwen3.5-0.8B según la model card | Apache 2.0 | HuggingFace, ModelScope |

Los datos de Qwen3.6-35B-A3B y Qwen3.5-0.8B provienen únicamente de la afirmación cualitativa de la model card; no se dispone de sus especificaciones ni de sus puntuaciones numéricas.

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones o documentos largos sin datos del fabricante.
- Riesgo de alucinación: no se documentan tasas de alucinación ni mecanismos de mitigación en la información disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- Brecha de rendimiento respecto a la pila nativa: en esta adaptación FlagOS/Tsingmicro, Math_500 baja de 94,80 a 94, GPQA_Diamond de 81,31 a 80,3 y ERQA de 52,26 a 51,75 respecto a la pila NVIDIA Origin.
- Requisitos de despliegue específicos: el contenedor requiere `--privileged`, montaje de `/sys`, `/dev` y `/lib/modules`, lo que implica permisos elevados y puede no ser aceptable en entornos de producción restringidos.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- Cuantizaciones no documentadas: no se detallan formatos GGUF, AWQ, GPTQ ni similares, lo que limita las opciones de despliegue en hardware con VRAM reducida.
- Tool calling y capacidades de agente no confirmadas: no se documenta soporte explícito, por lo que no deben asumirse en producción sin validación previa.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incorpora `custom_code`, por lo que conviene revisar los ficheros de código personalizado antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-tsingmicro-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- ModelScope (descarga de pesos): https://modelscope.cn
- Repositorio de imágenes FlagOS: harbor.baai.ac.cn/flagrelease-public/minicpm-v47-35b-a3b-tsingmicro001-gems5.4.0-tree0.7.0-cxnone-plugin0.2.2-vllm0.20.2-sglangnone-sglangflnone-cp310-pt211-raisa1.4.0-x64-v0.29842.5:202610120850
