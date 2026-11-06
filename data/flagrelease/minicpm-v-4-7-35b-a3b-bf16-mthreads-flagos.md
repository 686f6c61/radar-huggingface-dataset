# FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-mthreads-FlagOS

## Resumen

MiniCPM-V-4.7-35B-A3B es un modelo multimodal de gran escala desarrollado por ModelBest en colaboración con OpenBMB. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) que combina 35.212.875.824 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, lo que lo convierte en el primer modelo multimodal MoE open source diseñado para operar de forma fluida en dispositivos, según la model card del autor. El repositorio publicado por FlagRelease es una adaptación específica para el stack FlagOS sobre hardware Moore Threads (MUSA), con pesos en BF16 y código personalizado.

La relevancia del modelo radica en su propuesta de eficiencia: gracias a la técnica Lookahead Expert Scheduling (LES), que precarga expertos y solapa lectura y cómputo, el modelo alcanza más de 13 tokens por segundo en un iPhone 17 Pro Max según los datos oficiales. Además, incorpora compresión temprana de tokens visuales dentro del ViT (4x/16x) y decodificación especulativa DSpark para equilibrar detalle visual y velocidad de inferencia. El contexto soportado en el servidor de ejemplo alcanza los 262.144 tokens.

La versión aquí descrita no es el checkpoint canónico, sino una build de FlagRelease orientada a despliegue multi-chip mediante FlagOS, con validación de consistencia frente al stack nativo de NVIDIA. Los benchmarks publicados muestran que la variante Mthreads-FlagOS mantiene e incluso mejora ligeramente algunos resultados respecto a la versión Nvidia-Origin, lo que respalda la madurez de la adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE); técnica LES (Lookahead Expert Scheduling); compresión de tokens visuales 4x/16x en ViT |
| Parametros totales | 35.212.875.824 |
| Parametros activos | Aproximadamente 3.000 millones (≈3B) |
| Longitud de contexto | 262.144 tokens (configurado en el servidor de ejemplo) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se detallan otros formatos en la información disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con código personalizado (`custom_code`, `minicpmv4_7`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer multimodal con capas MoE, en la que cada token activa aproximadamente 3B de los 35B parámetros totales. La innovación central es Lookahead Expert Scheduling (LES), un mecanismo que precarga los expertos necesarios antes de que se soliciten y solapa las operaciones de lectura de memoria con el cómputo, reduciendo la latencia en entornos con ancho de banda limitado, como CPUs ARM y dispositivos móviles. El componente visual integra compresión temprana de tokens dentro del ViT con factores de 4x y 16x, lo que disminuye el número de tokens visuales procesados y acelera la inferencia sin sacrificar detalle de forma significativa.

El modelo soporta decodificación especulativa DSpark, orientada a mejorar el throughput en generación. La model card menciona dos variantes liberadas simultáneamente (1B y 35B-A3B) y una adaptación day-0 a 12 plataformas de cómputo (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Sunrise, Mac M5 Pro y CIX P1) mediante el stack unificado FlagOS. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión y generación de texto en chino e inglés.
- Comprensión multimodal de imágenes, con compresión de tokens visuales para eficiencia.
- Razonamiento matemático y de dominio científico (evaluado en Math_500 y GPQA_Diamond).
- Razonamiento visual y espacial (evaluado en ERQA).
- Modo Instruct para respuestas directas y alineadas.
- Decodificación especulativa DSpark para acelerar la generación.
- Ejecución en dispositivos de borde (edge) y móviles mediante LES.
- Despliegue multi-chip a través de FlagOS (NVIDIA, Huawei Ascend, Moore Threads, Hygon, Kunlunxin, entre otros).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Asistencia multimodal en dispositivos móviles: el modelo puede ejecutarse en un iPhone 17 Pro Max a más de 13 tokens/s gracias a LES, lo que permite aplicaciones de descripción de imágenes, OCR y respuesta a preguntas visuales sin conexión a la nube.
- Despliegue en centros de datos con hardware no NVIDIA: la adaptación FlagOS permite servir el modelo sobre Huawei Ascend, Hygon, Kunlunxin o Moore Threads, útil en organizaciones con requisitos de soberanía tecnológica o diversificación de proveedores.
- Procesamiento de documentos largos con componente visual: con 262.144 tokens de contexto, el modelo puede ingerir informes extensos, manuales técnicos o expedientes con figuras y tablas, y responder preguntas que cruzan texto e imagen.
- Evaluación científica asistida: sus resultados en GPQA_Diamond (80,30 en la variante FlagOS) lo hacen adecuado para tareas de razonamiento de nivel posgrado en física, química y biología, como apoyo a revisión de literatura o verificación de cálculos.
- Tutoría matemática interactiva: con 95,40 en Math_500, puede resolver y explicar problemas paso a paso en entornos educativos, incluyendo problemas con diagramas o gráficos.
- Análisis de imágenes en entornos industriales o de inspección: la compresión 4x/16x de tokens visuales reduce el coste de procesar imágenes de alta resolución, lo que facilita su uso en pipelines de inspección visual con latencia acotada.
- Investigación en eficiencia de modelos MoE multimodales: el checkpoint sirve como referencia reproducible para estudiar técnicas de scheduling de expertos y decodificación especulativa en hardware heterogéneo.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | MiniCPM-V-4.7-35B-A3B Nvidia-Origin | MiniCPM-V-4.7-35B-A3B Mthreads-FlagOS |
|---|---|---|
| Math_500 | 94,80 | 95,40 |
| GPQA_Diamond | 81,31 | 80,30 |
| ERQA | 52,26 | 54,50 |

La model card afirma además que, en evaluaciones oficiales en modo Instruct, el 35B-A3B y el 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se proporcionan en la información disponible los valores numéricos de esa comparación ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70,4 GB solo para pesos, más overhead de activaciones y caché KV; el repo ocupa 70,4 GB.
- El servidor de ejemplo de la model card se lanza con `--tp-size 2` sobre GPUs Moore Threads (MUSA), con `--mem-fraction-static 0.75` y `--context-length 262144`.
- GPU recomendadas: Moore Threads (objetivo de esta build), NVIDIA (variante Nvidia-Origin), Huawei Ascend, Hygon, Kunlunxin, MetaX, Tsingmicro, Iluvatar CoreX y Sunrise, todas mediante FlagOS.
- En consumer GPU: no cabe en una única GPU de consumo en BF16; sería necesario cuantizar a 4 bits o menor, aunque no se documentan en la información disponible checkpoints GGUF o cuantizados para esta variante.
- Opciones de despliegue: SGLang (usado en el ejemplo, con plugins `sglang_fl`), contenedor Docker FlagOS-Mthreads, vLLM (referenciado en la imagen), y stack FlagOS para múltiples aceleradores.
- Latencia y throughput: más de 13 tokens/s en iPhone 17 Pro Max según datos oficiales; no se publican cifras de throughput para el despliegue en servidor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B (este) | 35,2B | ≈3B | 262.144 | Apache 2.0 | MoE multimodal, LES, DSpark |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Referenciado como baseline en la model card; el autor afirma que MiniCPM-V-4.7 lo supera en score global |
| Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | Baseline de la variante 1B; superado según el autor |
| MiniCPM-V-4.7-1B | no disponible | no disponible | no disponible | Apache 2.0 | Variante pequeña liberada junto al 35B-A3B |

Los datos de los modelos comparables no están detallados en la información proporcionada más allá de su mención como referencias.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en castellano u otras lenguas no está garantizado ni evaluado.
- Riesgo de alucinación: no se documentan en la información disponible las tasas de alucinación ni las mitigaciones aplicadas; como todo modelo generativo, requiere verificación en dominios críticos.
- Sesgos: no se publica información sobre sesgos demográficos, culturales o de otro tipo, ni sobre el proceso de filtrado del corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo incluye `custom_code`, por lo que conviene revisar las dependencias y el código empaquetado antes de integrarlo en producción.
- Esta build está optimizada para Moore Threads con MUSA; el despliegue en otras plataformas requiere las variantes correspondientes de FlagOS o el checkpoint original.
- La configuración de servidor del ejemplo desactiva la caché radix (`--disable-radix-cache`) y desactiva `torch.compile`, lo que puede afectar al rendimiento en cargas con prefijos repetidos.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos sin capas adicionales.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún incipiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-mthreads-FlagOS
- ModelScope (descarga alternativa): `modelscope download --model FlagRelease/MiniCPM-V-4.7-35B-A3B-BF16-mthreads-FlagOS`
- Imagen Docker FlagOS-Mthreads: `harbor.baai.ac.cn/flagrelease-public/minicpmv47-35b-a3b-mthreads001-gems0.0.0-treenone-cx0.13.0-pluginnone-vllm0.10.1-sglang0.0.0-sglangfl0.1.0-cp310-pt29-musa43-x64-3.3.5-server:202610121148`
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales.
