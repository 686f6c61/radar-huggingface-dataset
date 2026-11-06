# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-iluvatar-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest junto con OpenBMB, publicado en dos variantes (1B y 35B-A3B MoE). Esta ficha concreta corresponde a la adaptación del repositorio FlagRelease para el stack FlagOS sobre hardware Iluvatar CoreX, distribuida en formato BF16 y orientada a despliegue en clústeres con aceleradores de esa plataforma. El modelo combina comprensión de imagen y texto con un transformer de mezcla de expertos (MoE) de 35.212.875.824 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token.

La relevancia del modelo radica en su propuesta de operación "on-device": según la model card, es el primer modelo multimodal MoE abierto capaz de ejecutarse de forma fluida en dispositivos, con una velocidad declarada superior a 13 tokens por segundo en un iPhone 17 Pro Max cuando se aplica el esquema de optimización propietario. La técnica Lookahead Expert Scheduling (LES) precarga expertos y solapa cómputo con lectura para reducir la latencia. Además, incorpora compresión temprana dentro del ViT y compresión de tokens visuales 4×/16×, junto con decodificación especulativa DSpark.

El repositorio de FlagRelease añade valor al ecosistema al ofrecer una imagen de contenedor preconfigurada para Iluvatar CoreX con vLLM 0.24.0, además de scripts de inferencia listos para usar. La licencia Apache 2.0 facilita su adopción comercial, aunque el modelo solo declara soporte para chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); codificador visual ViT con compresión temprana y compresión de tokens visuales 4×/16× |
| Parametros totales | 35.212.875.824 |
| Parametros activos | Aproximadamente 3.000 millones (variante A3B) |
| Longitud de contexto | 32.768 tokens (configurado en el script de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | BF16 en este repositorio; no se detallan otros formatos en la información disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y tipo de modelo `minicpmv4_7`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer multimodal con mezcla de expertos. La variante 35B-A3B activa aproximadamente 3.000 millones de parámetros por token sobre un total de 35.212.875.824, lo que permite un coste computacional por token muy inferior al de un modelo denso del mismo tamaño. El componente visual emplea un ViT con compresión temprana de tokens y un esquema de compresión de tokens visuales de 4× y 16×, pensado para reducir el número de tokens que entran al decoder y equilibrar detalle visual con eficiencia de inferencia.

La innovación técnica destacada es Lookahead Expert Scheduling (LES), que precarga expertos y ejecuta lectura y cómputo en paralelo para disminuir la latencia en dispositivos. También se menciona el soporte de decodificación especulativa DSpark. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión multimodal de imagen y texto (pipeline declarado como `minicpmv4_7`).
- Generación de texto y razonamiento, con resultados publicados en Math_500 (95,40) y GPQA_Diamond (80,81) para esta variante.
- Razonamiento visual y respuesta a preguntas sobre imágenes, evaluado en ERQA (53,00).
- Capacidades multilingües limitadas a chino e inglés según los metadatos del repositorio.
- Decodificación especulativa DSpark para acelerar la generación.
- Ejecución en dispositivos y en centros de datos gracias a la adaptación multiplataforma de FlagOS (12 plataformas, incluida ARM edge CPU).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en dispositivo móvil: el modelo puede procesar imágenes y texto en un iPhone 17 Pro Max a más de 13 tokens por segundo según la model card, lo que permite experiencias de asistencia visual sin depender de la nube.
- Despliegue en centros de datos con aceleradores Iluvatar CoreX: la imagen FlagOS-Iluvatar y el script vLLM con tensor-parallel-size 4 permiten servir el modelo en minutos sobre hardware nacional, útil para organizaciones con requisitos de soberanía tecnológica.
- Análisis de documentos con imágenes: la compresión de tokens visuales 4×/16× reduce el coste de procesar páginas escaneadas, capturas o diagramas en flujos de extracción de información.
- Razonamiento matemático y científico asistido: los resultados en Math_500 (95,40) y GPQA_Diamond (80,81) lo hacen adecuado para tutores o asistentes de investigación que combinan texto e imágenes de problemas.
- Evaluación visual de calidad en entornos industriales: con soporte para plataformas ARM edge, puede ejecutarse cerca de cámaras para inspección básica de imágenes sin enviar datos a la nube.
- Integración en aplicaciones de chat corporativo: la guía de AnythingLLM y el endpoint compatible con OpenAI (`/v1/chat/completions`) facilitan conectar el modelo a interfaces de conversación existentes.
- Investigación en eficiencia de modelos MoE multimodales: la combinación de LES, DSpark y compresión de tokens visuales ofrece un banco de pruebas para estudiar latencia y calidad en hardware heterogéneo.

## Benchmarks y rendimiento

| Metrica | MiniCPM-V-4.7-35B-A3B-Nvidia-Origin | MiniCPM-V-4.7-35B-A3B-Iluvatar-FlagOS |
|---|---|---|
| Math_500 | 94,80 | 95,40 |
| GPQA_Diamond | 81,31 | 80,81 |
| ERQA | 52,26 | 53,00 |

La model card indica además que, en evaluaciones en modo Instruct, los modelos 35B-A3B y 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se proporcionan las cifras completas de esa comparación ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 70,4 GB, por lo que se necesita al menos esa cantidad de memoria agregada; con 4 GPUs en tensor-parallel y `--gpu-memory-utilization 0.9` el reparto es de aproximadamente 17,6 GB por dispositivo.
- GPU recomendadas: aceleradores Iluvatar CoreX (runtime `iluvatar`, `COREX_VISIBLE_DEVICES`) según la configuración oficial; la model card menciona también adaptación a NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Sunrise, Mac (M5 Pro) y CIX P1.
- Cabe en GPU de consumo: no disponible para esta variante BF16 de 35B; la variante 1B del mismo modelo está pensada para dispositivos.
- Opciones de despliegue: vLLM 0.24.0 dentro de la imagen FlagOS-Iluvatar, con `--trust-remote-code` y configuración de compilación `{"mode":3,"cudagraph_mode":"NONE"}`. No se detallan integraciones con llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: superior a 13 tokens por segundo en iPhone 17 Pro Max con el esquema on-device según la model card; no se publican cifras de throughput para el despliegue en Iluvatar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B (esta ficha) | 35,2B totales / ~3B activos | 32.768 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible |
| MiniCPM-V-4.7-1B | 1B | no disponible | Apache 2.0 | Hugging Face y ModelScope |

La model card afirma una puntuación global superior a Qwen3.6-35B-A3B y Qwen3.5-0.8B en modo Instruct, pero no se aportan las cifras desglosadas ni los detalles de contexto o licencia de esos modelos en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Contexto limitado a 32.768 tokens en la configuración de servicio publicada, inferior al de algunos modelos competidores de su categoría.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponible.
- El repositorio depende de `custom_code` y `--trust-remote-code`, lo que exige revisar el código remoto antes de ejecutarlo en producción.
- La adaptación está atada al stack FlagOS e Iluvatar CoreX; el despliegue en otras plataformas requiere las imágenes correspondientes de la comunidad FlagOS.
- El rendimiento medido en Math_500 y GPQA_Diamond es ligeramente distinto entre la pila nativa NVIDIA y la pila FlagOS-Iluvatar, con diferencias de hasta 0,6 puntos, lo que conviene tener en cuenta al comparar resultados.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan términos adicionales sobre los datos de entrenamiento ni sobre las técnicas LES o DSpark.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es todavía inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-iluvatar-FlagOS
- ModelScope (descarga alternativa indicada en la model card): `modelscope download --model FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-iluvatar-FlagOS`
- Imagen Docker FlagOS-Iluvatar: `harbor.baai.ac.cn/flagrelease-public/minicpmv47-35b-a3b-iluvatar001-gems5.3.4-tree0.6.0-cxnone-plugin0.2.0-vllm0.24.0-sglangnone-sglangflnone-cp312-pt210-ixml44-x64-4.5.0:202610121519`
- AnythingLLM: https://anythingllm.com/
- Paper, blog o repositorio de FlagOS: no disponible en la información proporcionada.
