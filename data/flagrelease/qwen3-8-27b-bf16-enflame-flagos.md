# FlagRelease/Qwen3.8-27B-BF16-enflame-FlagOS

## Resumen

El modelo **Qwen3.8-27B-BF16-enflame-FlagOS** es una adaptación del modelo denso Qwen3.8-27B de Alibaba, preparada por la comunidad FlagOS para ejecutarse sobre aceleradores Enflame. Forma parte de la familia Qwen3.8, que incluye también el modelo MoE ultra grande Qwen3.8-2.4T-A95B. Esta versión concreta, en precisión BF16 y con pesos en formato safetensors, está diseñada para ofrecer un despliegue optimizado en chips Enflame mediante el stack unificado FlagOS, que incluye scripts de inferencia listos para usar y una imagen de contenedor específica.

El modelo tiene 27.781 millones de parámetros (27,78B), lo que lo sitúa en la gama de modelos densos de tamaño medio-alto, aptos para servidores empresariales sin necesidad de clústeres masivos. Su licencia Apache-2.0 permite uso comercial sin restricciones. La relevancia actual radica en que Alibaba ha abierto los pesos de esta familia, y FlagOS proporciona una capa de adaptación multi-chip que facilita la ejecución en hardware diverso, incluyendo Enflame, un acelerador chino emergente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el script de despliegue del modelo hermano 2.4T usa 204800 tokens, pero no se confirma para esta versión) |
| Tipos de cuantizacion | BF16 (este repo); se mencionan FP8 e INT8 en la documentación general de la familia |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el entrenamiento de este modelo específico. Por el nombre y el tag `qwen3_5`, se trata de un transformer denso de 27,78B parámetros, perteneciente a la arquitectura Qwen3.5. La model card indica que el modelo forma parte de la familia Qwen3.8, que incluye un modelo MoE de 2,4T parámetros, pero esta versión concreta es densa. La comunidad FlagOS ha realizado la adaptación multi-chip, incluyendo la alineación de precisión y la verificación de despliegue sobre el acelerador Enflame, utilizando su stack unificado de software. No se especifican datos sobre el dataset de entrenamiento, el número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo muestra resultados en benchmarks de razonamiento como GPQA_Diamond y MMLU (aunque este último no se reporta directamente).
- Razonamiento avanzado: el script de despliegue incluye `--reasoning-parser qwen3`, lo que indica soporte para modos de razonamiento explícito (thinking mode).
- Tool calling / function calling: el despliegue activa `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`, confirmando soporte para llamada de herramientas.
- Multilingüe: soporta chino e inglés.
- Compatibilidad multi-chip: gracias a FlagOS, puede ejecutarse en al menos 10 arquitecturas de aceleradores, incluyendo Enflame, NVIDIA, Huawei Ascend, etc.

## Casos de uso

- Despliegue en servidores empresariales con aceleradores Enflame: el modelo viene con scripts de inferencia preconfigurados y una imagen Docker oficial, lo que permite ponerlo en producción en minutos en hardware Enflame.
- Razonamiento complejo en entornos de investigación: con resultados de 89,9 en GPQA_Diamond, es adecuado para tareas de razonamiento científico y técnico de alto nivel.
- Asistentes de código con tool calling: al soportar llamada de herramientas, puede integrarse en agentes que necesiten ejecutar funciones externas, como consultas a APIs o ejecución de comandos.
- Sistemas de atención al cliente multilingüe: su capacidad bilingüe (chino e inglés) y su contexto largo (si se confirma) permiten gestionar conversaciones multi-turno en ambos idiomas.
- Evaluación comparativa de stacks de software: al existir versiones para distintos chips, puede usarse para medir el rendimiento relativo de diferentes aceleradores con el mismo modelo.
- Prototipado rápido en entornos con GPUs NVIDIA: aunque este repo es para Enflame, la familia tiene versiones NVIDIA, y el modelo puede servir como base para pruebas de concepto.

## Benchmarks y rendimiento

La model card proporciona una comparación entre la versión original NVIDIA y la versión FlagOS sobre el mismo hardware NVIDIA:

| Metrica | Qwen3.8-27B-Nvidia-Origin | Qwen3.8-27B-Nvidia-FlagOS |
|---|---|---|
| GPQA_Diamond | 88,89 | 89,9 |
| MMLU (musr) | 71,96 | 69,05 |

No se han publicado resultados de benchmarks en la informacion disponible para la versión Enflame específica. Los datos anteriores corresponden a la validación de consistencia del stack FlagOS frente al nativo en GPUs NVIDIA.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27,78B en BF16 requiere aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y KV cache. Se necesitan al menos 2 GPUs de 80 GB (por ejemplo, A100 80GB o H100) o 4 GPUs de 40 GB (A100 40GB) en configuración tensor parallel.
- GPU recomendadas: para la versión Enflame, se requiere hardware Enflame; para la versión NVIDIA, GPUs como A100, H100 o RTX 4090 (aunque esta última con limitaciones de VRAM).
- En consumer GPU: no es viable en una sola GPU de consumo (por ejemplo, RTX 4090 con 24 GB) sin cuantización agresiva (FP8 o INT8), que no está disponible en este repo BF16.
- Opciones de despliegue: el script proporcionado usa vLLM con tensor parallel y pipeline parallel, además de la imagen Docker FlagOS. También podría usarse con llama.cpp si se convierte a GGUF, pero no se proporciona.
- Latencia y throughput: no se dispone de datos concretos. El script de despliegue para el modelo hermano 2.4T usa 8 nodos con 16 GPUs cada uno, pero para el 27B se espera un despliegue más modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,78B | No disponible | Apache-2.0 | HuggingFace, con adaptaciones multi-chip |
| Qwen2.5-32B | 32,5B | 128K | Apache-2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |

No se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada. Qwen3.8-27B es comparable en tamaño a Qwen2.5-32B, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos específicos. Como modelo entrenado principalmente en chino e inglés, puede presentar sesgos culturales o lingüísticos.
- Riesgo de alucinacion: no se han reportado tasas de alucinación específicas, pero es un riesgo inherente a los modelos de lenguaje.
- Limitaciones de contexto: la longitud de contexto no está confirmada para esta versión; el script de despliegue del modelo 2.4T usa 204800 tokens, pero no se garantiza para el 27B.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución.
- Caveat de producción: este repo está específicamente adaptado para el acelerador Enflame mediante el stack FlagOS. Su uso en otros hardware requerirá las versiones correspondientes (NVIDIA, etc.) y puede no funcionar correctamente sin el entorno FlagOS.
- Dependencia de infraestructura: el despliegue requiere la imagen Docker específica y el stack FlagOS, lo que añade una capa de dependencia adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-enflame-FlagOS
- Repositorio del modelo hermano MoE: https://huggingface.co/FlagRelease/Qwen3.8-2.4T-A95B-FP8-enflame-FlagOS
- Repositorio del modelo hermano MoE (mthreads): https://huggingface.co/FlagRelease/Qwen3.8-2.4T-A95B-FP8-mthreads-FlagOS
- Información general de Qwen3.8: https://openlm.ai/qwen3.8/
- Documentación de QwenCloud: https://docs.qwencloud.com/changelog/models
- Guía de benchmarks de Qwen 3.8: https://ia4pymes.tech/en/blog/qwen-3-8-official-benchmarks-open-weights-27b-sme-guide
