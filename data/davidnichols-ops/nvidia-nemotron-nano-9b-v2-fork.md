# davidnichols-ops/NVIDIA-Nemotron-Nano-9B-v2-fork

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, diseñado como un modelo unificado para tareas de razonamiento y no razonamiento. El fork alojado como `davidnichols-ops/NVIDIA-Nemotron-Nano-9B-v2-fork` replica la arquitectura y los pesos del modelo original, que fue entrenado desde cero por NVIDIA entre junio y agosto de 2025. El modelo combina una arquitectura híbrida Mamba-2 y Transformer con solo cuatro capas de atención, lo que permite una inferencia eficiente manteniendo una alta precisión en razonamiento.

Con aproximadamente 8.900 millones de parámetros y una ventana de contexto de hasta 128.000 tokens, este modelo está orientado a desarrolladores que necesitan un LLM capaz de generar trazas de razonamiento controlables, soportar herramientas (function calling) y trabajar en varios idiomas, incluidos inglés, español, francés, alemán, italiano y japonés. Su licencia permite uso comercial, lo que lo hace atractivo para integraciones en producción.

La relevancia actual del modelo radica en su enfoque híbrido, que reduce el coste computacional frente a transformers densos de tamaño similar, y en su capacidad de ajustar dinámicamente el presupuesto de "pensamiento" durante la inferencia, una característica útil para equilibrar latencia y calidad en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer Hybrid (Nemotron-Hybrid) |
| Parametros totales | 8.888.227.328 (8,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida compuesta principalmente por capas Mamba-2 y MLP, junto con solo cuatro capas de atención. Esta combinación, descrita en el informe técnico Nemotron-H (arXiv:2504.03624), busca reducir el coste computacional de la atención completa manteniendo la capacidad de modelar dependencias de largo alcance. El entrenamiento se realizó con Megatron-LM y NeMo-RL, utilizando un conjunto de datos de NVIDIA que incluye Nemotron-Post-Training-Dataset-v1/v2, Nemotron-Pretraining-Dataset-sample, Nemotron-CC-v2, Nemotron-CC-Math-v1 y Nemotron-Pretraining-SFT-v1. La fecha de corte de los datos de preentrenamiento es septiembre de 2024.

El modelo fue entrenado para generar primero una traza de razonamiento y luego una respuesta final, aunque este comportamiento puede desactivarse mediante el prompt del sistema. También incorpora un mecanismo de control de presupuesto de "pensamiento" en tiempo de inferencia, que permite especificar cuántos tokens puede dedicar el modelo a razonar antes de responder. Según la documentación, el modelo fue "mejorado usando Qwen", aunque no se detalla en qué consiste esta mejora.

## Capacidades

- Razonamiento multi-paso: genera trazas de razonamiento internas antes de la respuesta final, mejorando la precisión en problemas complejos.
- Control de presupuesto de pensamiento: el usuario puede limitar o ampliar el número de tokens dedicados al razonamiento durante la inferencia.
- Instrucciones y seguimiento de comandos: adecuado para tareas de instrucción general y generación de texto.
- Tool calling / function calling: soporta invocación de herramientas, evaluado con BFCL v3.
- Multilingüe: soporta inglés, alemán, español, francés, italiano y japonés (según la etiqueta de idiomas; la documentación menciona también coreano, portugués, ruso y chino, aunque no están en la etiqueta oficial).
- Generación de código: capaz de resolver problemas de programación (LCB 71,1 %).
- Modo razonamiento desactivable: si se prefiere una respuesta directa sin trazas intermedias, se puede configurar mediante el prompt del sistema, con una ligera pérdida de precisión en tareas que requieren razonamiento.

## Casos de uso

- Agentes conversacionales con razonamiento: el modelo puede gestionar diálogos multi-turno y tomar decisiones basadas en contexto largo (hasta 128K tokens), ideal para asistentes virtuales que necesitan recordar información extensa de la conversación.
- Sistemas RAG (Retrieval-Augmented Generation): su ventana de contexto amplia permite integrar documentos largos y realizar respuestas fundamentadas, manteniendo un razonamiento previo que mejora la coherencia.
- Generación de código en entornos de desarrollo: con soporte para tool calling y un buen rendimiento en benchmarks de código (LCB 71,1 %), puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests.
- Automatización de atención al cliente: su capacidad multilingüe (es, fr, de, it, ja) y su control de presupuesto de pensamiento permiten ajustar la latencia en entornos de producción con alta concurrencia.
- Análisis de documentos financieros o legales: el contexto de 128K permite procesar informes extensos y extraer conclusiones razonadas, reduciendo la necesidad de truncamiento.
- Prototipado de agentes autónomos: su arquitectura híbrida y su eficiencia energética lo hacen adecuado para despliegue en GPUs de gama media (A10G, A100) en entornos de investigación y desarrollo.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por NVIDIA para el modelo en modo "Reasoning-On", comparado con Qwen3-8B. Las evaluaciones se realizaron con NeMo-Skills, y RULER se evaluó en modo "Reasoning-Off".

| Benchmark | Qwen3-8B | NVIDIA-Nemotron-Nano-9B-v2 |
|---|---:|---:|
| AIME25 | 69,3 % | 72,1 % |
| MATH500 | 96,3 % | 97,8 % |
| GPQA | 59,6 % | 64,0 % |
| LCB | 59,5 % | 71,1 % |
| BFCL v3 | 66,3 % | 66,9 % |
| IFEval (Instruction Strict) | 89,4 % | 90,3 % |
| HLE | 4,4 % | 6,5 % |
| RULER (128K) | 74,1 % | 78,9 % |

No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 8.888 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 17,8 GB. Para inferencia con overhead de activaciones y KV cache, se recomienda al menos 24 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) podría caber en GPUs de 16 GB o menos, aunque no se especifican cuantizaciones oficiales.
- GPUs compatibles según la documentación: NVIDIA A10G, NVIDIA H100-80GB, NVIDIA A100 y Jetson AGX Thor. También debería funcionar en GPUs consumer de gama alta (RTX 3090/4090) con suficiente VRAM, aunque no está confirmado oficialmente.
- Opciones de despliegue: el modelo es compatible con HuggingFace Transformers (versión 4.48.3 probada) y con el runtime NeMo 25.07.nemotron-nano-v2. No se mencionan explícitamente vLLM, llama.cpp u Ollama, pero al ser un modelo con pesos safetensors y arquitectura estándar, es probable que pueda adaptarse.
- Latencia y throughput: no se proporcionan datos concretos. El control de presupuesto de pensamiento permite ajustar el número de tokens generados en razonamiento, lo que influye directamente en la latencia.

## Comparativa con modelos similares

La comparativa se basa en los datos publicados en la model card, que enfrenta al modelo con Qwen3-8B. No se dispone de información sobre otros modelos comparables en la misma categoría.

| Modelo | Parametros | Contexto | AIME25 | MATH500 | GPQA | LCB | BFCL v3 | IFEval | RULER (128K) |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-8B | 8 B | no disponible | 69,3 % | 96,3 % | 59,6 % | 59,5 % | 66,3 % | 89,4 % | 74,1 % |
| NVIDIA-Nemotron-Nano-9B-v2 | 8,9 B | 128K | 72,1 % | 97,8 % | 64,0 % | 71,1 % | 66,9 % | 90,3 % | 78,9 % |

En todos los benchmarks publicados, el modelo de NVIDIA supera a Qwen3-8B, especialmente en razonamiento matemático (MATH500, AIME25) y generación de código (LCB). Su ventaja principal es la ventana de contexto de 128K frente a la no especificada de Qwen3-8B, y su arquitectura híbrida que reduce el coste computacional.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo LLM, puede generar información falsa o inventada, especialmente en temas de actualidad posteriores a septiembre de 2024 (fecha de corte de los datos).
- Limitaciones de idioma: aunque la etiqueta oficial incluye seis idiomas, la documentación menciona soporte para coreano, portugués, ruso y chino, pero no hay evidencia de evaluación en esos idiomas. El rendimiento en idiomas distintos del inglés puede ser inferior.
- Control de razonamiento: si se desactiva el modo de razonamiento, la precisión en tareas complejas disminuye ligeramente. El usuario debe conocer este trade-off.
- Requisitos de hardware: no se proporcionan cuantizaciones oficiales, por lo que el despliegue en GPUs con menos de 24 GB de VRAM requerirá soluciones de cuantización externas no validadas por NVIDIA.
- Licencia: la NVIDIA Open Model License permite uso comercial, pero es necesario revisar los términos específicos, especialmente en lo relativo a redistribución y responsabilidad.
- Dependencia de código personalizado: el modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código externo no auditado por HuggingFace.

## Enlaces

- Repositorio del fork: https://huggingface.co/davidnichols-ops/NVIDIA-Nemotron-Nano-9B-v2-fork
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Informe técnico Nemotron-H (arquitectura): https://arxiv.org/abs/2504.03624
- Paper del modelo Nemotron Nano 2: https://arxiv.org/abs/2508.14444
- Tutorial de reproducción de evaluaciones con NeMo-Skills: https://nvidia.github.io/NeMo-Skills/tutorials/2025/08/22/reproducing-nvidia-nemotron-nano-9b-v2-evals/
- API de NVIDIA (build.nvidia.com): https://build.nvidia.com/nvidia/nvidia-nemotron-nano-9b-v2
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
