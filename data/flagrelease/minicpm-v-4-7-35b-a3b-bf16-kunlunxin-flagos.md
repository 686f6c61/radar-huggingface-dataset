# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-kunlunxin-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest en colaboración con OpenBMB, liberado bajo licencia Apache 2.0. Se trata de la variante MoE (Mixture of Experts) de la familia MiniCPM-V4.7, con 35.212.875.824 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo posiciona como el primer modelo multimodal MoE de código abierto capaz de operar en dispositivo de forma fluida y sin pérdida de calidad según sus autores.

El repositorio analizado, `FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-kunlunxin-FlagOS`, es una adaptación cross-chip realizada por la comunidad Zhongzhi FlagOS sobre la pila unificada FlagOS, orientada específicamente al acelerador Kunlunxin. Incluye una imagen Docker preconfigurada con vLLM 0.24.0 y los plugins de FlagOS necesarios para desplegar el modelo en hardware Kunlunxin sin ajustes manuales. La adaptación cubre 12 plataformas distintas (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Sunrise, Mac M5 Pro y CIX P1), incluyendo CPUs ARM de borde.

La relevancia de esta ficha radica en que documenta no solo el modelo base, sino una distribución lista para producción en hardware no-NVIDIA, un escenario cada vez más habitual en entornos con restricciones de suministro o requisitos de soberanía tecnológica. El modelo soporta un contexto de hasta 262.144 tokens según la configuración de servicio incluida, cuantización BF16 y decodificación especulativa DSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (Mixture of Experts); vision encoder con compresión temprana dentro del ViT y compresión de tokens visuales 4x/16x |
| Parametros totales | 35.212.875.824 |
| Parametros activos | Aproximadamente 3.000 millones (MoE, ~3B activos) |
| Longitud de contexto | 262.144 tokens (configurado en el script de servicio con `--max-model-len 262144`) |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16; el script usa `--dtype bfloat16`) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y arquitectura `minicpmv4_7`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con capa MoE: 35B parámetros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad del modelo completo. El componente de visión emplea una técnica de compresión temprana dentro del ViT junto con compresión de tokens visuales en factores de 4x y 16x, lo que permite equilibrar el detalle visual con la eficiencia de inferencia. La innovación técnica central es Lookahead Expert Scheduling (LES), que precarga expertos y solapa cómputo con lectura de memoria para reducir la latencia en dispositivo; según los autores, permite superar los 13 tokens por segundo en un iPhone 17 Pro Max. También soporta decodificación especulativa DSpark.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona evaluación en modo Instruct, lo que sugiere un ajuste de instrucciones, pero no se detalla el proceso. El repositorio concreto es una adaptación de despliegue (FlagOS/Kunlunxin), no un reentrenamiento: los pesos son los del modelo original en BF16.

## Capacidades

- Comprensión y generación de texto multilingüe en chino e inglés.
- Comprensión visual multimodal: procesamiento de imágenes con compresión de tokens visuales 4x/16x y compresión temprana en el ViT.
- Razonamiento matemático: evaluado en Math_500 con 95,80 en la variante Kunlunxin.
- Razonamiento científico y de dominio: evaluado en GPQA_Diamond (79,30) y ERQA (52,75).
- Modo Instruct para seguimiento de instrucciones y respuestas conversacionales.
- Decodificación especulativa DSpark para acelerar la generación.
- Servicio compatible con API OpenAI (`/v1/chat/completions`) a través de vLLM.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en hardware Kunlunxin: el repositorio incluye una imagen Docker con vLLM y plugins FlagOS preconfigurados, lo que permite levantar un endpoint compatible con OpenAI en minutos sobre aceleradores Kunlunxin sin compilar kernels a mano. Adecuado para organizaciones con infraestructura no-NVIDIA.
- Servicio multimodal en centro de datos con contexto largo: con 262.144 tokens de ventana configurada, el modelo puede procesar documentos extensos con imágenes intercaladas, como informes técnicos o expedientes, en una sola pasada.
- Inferencia en dispositivo de borde: la combinación de MoE con ~3B activos y LES permite ejecutar el modelo en dispositivos de gama alta (los autores citan iPhone 17 Pro Max a más de 13 tok/s), habilitando asistentes multimodales sin conexión.
- Razonamiento matemático y científico asistido: los resultados en Math_500 (95,80) y GPQA_Diamond (79,30) lo hacen apto para tutoría técnica, verificación de cálculos y respuesta a preguntas de nivel experto en dominios STEM.
- Integración en asistentes de escritorio vía AnythingLLM: la model card documenta la integración con AnythingLLM apuntando al endpoint local, útil para desplegar un asistente privado con comprensión de imágenes sobre documentos internos.
- Evaluación comparativa de stacks de hardware: la sección de validación de consistencia del repositorio compara el rendimiento en Kunlunxin frente al stack nativo NVIDIA, lo que sirve para decidir migraciones de plataforma con datos de benchmark.
- Procesamiento por lotes con vLLM: la configuración incluida (`--max-num-seqs 64`, `--max-num-batched-tokens 65536`, `--tensor-parallel-size 2`) está pensada para servir múltiples peticiones concurrentes en dos aceleradores.

## Benchmarks y rendimiento

Resultados publicados en la model card del repositorio, comparando la variante Kunlunxin-FlagOS con la variante NVIDIA original:

| Metrica | MiniCPM-V-4.7-35B-A3B-Nvidia-Origin | MiniCPM-V-4.7-35B-A3B-Kunlunxin-FlagOS |
|---|---|---|
| Math_500 | 94,80 | 95,80 |
| GPQA_Diamond | 81,31 | 79,30 |
| ERQA | 52,26 | 52,75 |

La model card afirma además que, en evaluaciones oficiales en modo Instruct, los modelos 35B-A3B y 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se proporcionan las cifras completas de esa comparación ni resultados de MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: el repo pesa 70,4 GB en BF16, por lo que la inferencia requiere al menos ~70 GB de memoria de acelerador para los pesos, más caché KV y buffers. El script oficial usa `--tensor-parallel-size 2` y `--gpu-memory-utilization 0.75`, lo que implica al menos 2 aceleradores de ~48 GB o superior.
- GPU recomendadas: la configuración de referencia está validada para Kunlunxin (2 dispositivos en paralelo de tensor). La variante NVIDIA original existe como `MiniCPM-V-4.7-35B-A3B-Nvidia-Origin`; no se detallan modelos concretos de GPU NVIDIA en la información disponible.
- GPU de consumo: no cabe en una GPU consumer de 24 GB en BF16. No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en la información proporcionada.
- Opciones de despliegue: vLLM 0.24.0 con plugins FlagOS (`VLLM_PLUGINS=fl`, `VLLM_FL_PLATFORM=kunlunxin`), imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-v47-35b-kunlunxin001-gems5.4.0-treenone-cx0.13.0-plugin0.3.0-vllm0.24.0-sglangnone-sglangflnone-cp310-pt29-xrt513-x64-5.0.21.47:202610121041`. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: los autores reportan más de 13 tokens por segundo en iPhone 17 Pro Max con el esquema de optimización en dispositivo. No se publican cifras de throughput en servidor para la variante Kunlunxin.
- Requisitos de contenedor: `--shm-size 128g`, `--ulimit memlock=-1:-1`, `--ulimit nofile=120000:120000`, `--privileged` y `--network host` según el script oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B (este) | 35,2B | ~3B | 262.144 | Apache 2.0 | MoE multimodal, adaptación cross-chip FlagOS |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Citado por los autores como referencia superada en evaluación Instruct global |
| Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | Citado como referencia del variante 1B de MiniCPM-V4.7 |
| MiniCPM-V-4.7-1B | no disponible | no disponible | no disponible | Apache 2.0 (según familia) | Variante densa pequeña de la misma familia, orientada a dispositivo |

No se dispone de datos detallados (contexto, licencia, benchmarks completos) de los modelos Qwen citados en la model card, por lo que la comparación cuantitativa queda limitada a la afirmación cualitativa de los autores.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información proporcionada.
- Alucinación: no se publican métricas de fidelidad factual ni tasas de alucinación; en tareas de razonamiento visual (ERQA 52,75) el margen de error es considerable.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incluye `custom_code` y depende de la pila FlagOS; conviene revisar las licencias de los plugins y de la imagen Docker asociada antes de un despliegue comercial.
- Dependencia de hardware: la distribución está acoplada a Kunlunxin y a la imagen Docker concreta; migrar a otro acelerador requiere usar la variante correspondiente del ecosistema FlagOS o los pesos originales.
- Configuración frágil: el script de servicio incluye listas extensas de variables de entorno y una blacklist de operadores (`VLLM_FL_FLAGOS_BLACKLIST_APPEND`) que deben respetarse; desviarse de ella puede degradar el rendimiento o romper la inferencia.
- Contexto efectivo: aunque se configura `--max-model-len 262144`, no se documenta la calidad de recuperación en ventanas largas ni el coste de memoria de la caché KV a esa longitud.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; es una distribución reciente (creada en octubre de 2026, actualizada en noviembre de 2026) sin validación comunitaria amplia.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-kunlunxin-FlagOS
- AnythingLLM: https://anythingllm.com/
- Repositorio de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-kunlunxin-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-v47-35b-kunlunxin001-gems5.4.0-treenone-cx0.13.0-plugin0.3.0-vllm0.24.0-sglangnone-sglangflnone-cp310-pt29-xrt513-x64-5.0.21.47:202610121041`
- Paper, blog o demo oficiales: no disponible en la información proporcionada.
