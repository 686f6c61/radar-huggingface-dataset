# Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16

## Resumen

Qwen3.8-Flash-Next-DERISKED-BF16 es un checkpoint de investigación desarrollado por Blackfrost-AI sobre el modelo base Qwen3.8-Flash-Next de Qwen, un MoE multimodal experimental que anticipa la arquitectura Qwen4. La contribución de Blackfrost consiste en una modificación a nivel de pesos de la superficie de rechazo del modelo, orientada a investigaciones de seguridad controladas y evaluación de red-teaming. No se trata de un fine-tune, merge, LoRA, poda ni cuantización: los pesos base originales se mantienen estructuralmente intactos salvo en los tensores objetivo del proceso de modificación.

El modelo mantiene las capacidades del original: 125B parámetros totales en el modelo de lenguaje con 6B activos por token, arquitectura MoE híbrida visión-lenguaje, contexto nativo de 262.144 tokens y soporte multimodal de imagen y vídeo. El checkpoint se distribuye en BF16 nativo sin cuantización, con un tamaño en disco de 360.023.387.188 bytes repartidos en 131 shards safetensors indexados. El estado actual es de "card preview": los pesos no están publicados todavía y el repositorio no es desplegable. Esta ficha documenta las especificaciones declaradas por el autor, no resultados medidos de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration · MoE híbrido visión-lenguaje |
| Parametros totales | 125B (modelo de lenguaje) + 51B (n-gram embeddings) + 4B (MTP) = 180B |
| Parametros activos | 6B (modelo de lenguaje) + 1B (MTP) aproximadamente |
| Longitud de contexto | 262.144 tokens nativo; soporte de contexto extendido según guia de Qwen |
| Tipos de cuantizacion | Ninguno; BF16 nativo en safetensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (enlace a ModelScope) |
| Formato de pesos | Safetensors BF16, 131 shards indexados |

## Arquitectura y entrenamiento

La arquitectura base es Qwen4ExpForConditionalGeneration, un MoE híbrido que combina 36 capas Gated DeltaNet con 12 capas Qwen Sparse Attention, sobre 48 capas totales. El modelo de lenguaje tiene 512 expertos enrutados, de los cuales 10 se activan por token junto con 1 experto compartido. Cuenta con 4 ramas residuales con gating y bottleneck de rango 320. Los embeddings son de tipo n-gram (51B parámetros adicionales) y se incluye un módulo de multi-token prediction (MTP) de 4B parámetros.

El entrenamiento del modelo base es de Qwen, con datos no publicados en la información disponible. La modificación de Blackfrost se aplicó a nivel de pesos sobre el checkpoint oficial de Qwen3.8-Flash-Max, sin entrenamiento adicional supervisado (ni SFT, DPO, LoRA, poda de expertos ni cuantización). El proceso propietario de modificación y los artefactos de investigación no se incluyen en el repositorio. El checkpoint incorpora el prompt operativo "Qwentium" en la plantilla de chat por defecto, que es una instrucción de comportamiento y no un sistema de autorización.

## Capacidades

- Generación de texto, razonamiento y matemáticas con modo de razonamiento controlable (según plantilla de chat Qwen).
- Comprensión multimodal: entrada de imagen y vídeo, salida de texto. El pipeline_tag es `image-text-to-text`.
- Soporte de tool calling y function calling, con descripciones de herramientas en la plantilla de chat.
- Capacidades de agente y razonamiento multi-step (el modelo base supera a Claude-4.6-Opus (Max) en coding agéntico, según documentación de Unsloth).
- Ventana de contexto larga de 262.144 tokens nativos, adecuada para documentos extensos, repositorios de código completos y conversaciones multi-turno largas.
- Multimodalidad nativa: integración de visión y lenguaje en un solo modelo.
- Comportamiento de chat modificado: la superficie de rechazo se ha alterado a nivel de pesos para permitir evaluaciones controladas de red-teaming; el prompt operativo Qwentium está incrustado en la plantilla por defecto.

## Casos de uso

- **Evaluación de seguridad y red-teaming**: el propósito declarado del checkpoint es permitir a operadores de seguridad probar comportamientos de rechazo y límites de seguridad del modelo bajo condiciones controladas. La modificación a nivel de pesos facilita tests reproducibles de la superficie de rechazo sin depender de jailbreaks de prompt.
- **Investigación en interpretabilidad de pesos**: al ser un checkpoint BF16 sin cuantización y con verificación de integridad estructural (todos los tensores objetivo cambiados, sin valores no finitos), es adecuado para estudios de análisis de activaciones y localización de comportamiento de seguridad en modelos MoE.
- **Auditoría de alineación en modelos MoE**: la combinación de 512 expertos y 6B activos por token ofrece un terreno para estudiar cómo la modulación de pesos en subconjuntos de expertos afecta al comportamiento global de rechazo.
- **Desarrollo de técnicas de verificación de artefactos**: el proceso de verificación estructural documentado (comprobación de shards, no-finitos, restauración de norm) puede servir como referencia para pipelines de control de calidad de modelos derivados.
- **Pruebas de despliegue con SGLang en hardware de alta gama**: el modelo está validado para servirse con tensor parallel 4 en 4× NVIDIA B200, lo que permite probar configuraciones de inferencia para MoE de 180B parámetros.
- **Estudio de la interacción entre prompts operativos y comportamiento**: el prompt Qwentium incrustado en la plantilla de chat ofrece un caso de estudio sobre cómo las instrucciones embebidas afectan al comportamiento del modelo frente a sistemas de prompt alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La card del autor indica que solo se realizaron pruebas de humo locales de explicación básica, aritmética, continuidad de razonamiento multi-turno y seguimiento de instrucciones JSON exacto. No hay benchmarks de rechazo, codificación, multimodalidad, tool-use ni retención de contexto largo publicados para este checkpoint. Los números de benchmarks del modelo base Qwen3.8-Flash-Max no se reproducen como si fueran medidas de este derivado.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 360.033 GB en BF16; para inferencia se necesitan al menos 360 GB de memoria de pesos más overhead de KV cache y activaciones. Con cuantización (no disponible en este checkpoint) se podría reducir, pero el modelo se distribuye sin cuantizar.
- **GPU recomendadas**: validado en 4× NVIDIA B200 con tensor parallel 4. Alternativamente, se podrían usar 8× H100 de 80 GB (640 GB totales) para alojar los pesos con margen. No cabe en GPUs de consumo (RTX 4090 con 24 GB es insuficiente).
- **Ejecución sin GPU**: según documentación de Unsloth, el modelo base puede ejecutarse en dispositivos con 78 GB de RAM/unified memory sin VRAM dedicada, pero con rendimiento reducido. Esto aplica al modelo base, no verificado para este checkpoint.
- **Opciones de despliegue**: el autor valida SGLang con la configuración indicada en la card (docker con lmsysorg/sglang). Se espera compatibilidad con vLLM (hay recetas publicadas para el modelo base) y otros servidores que soporten arquitectura Qwen4Exp.
- **Latencia y throughput**: no disponible. Depende del hardware, del número de expertos activos (10+1 por token) y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Max (base) | 180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262K | Apache 2.0 | Safetensors BF16 |
| Qwen3.8-Flash-Max-DERISKED-BF16 (este) | 180B | 6B | 262K | qwen-community-1.0 | Safetensors BF16 |
| Qwen3.8-27B | 27B | 27B (dense) | 256K | Apache 2.0 | Safetensors, GGUF |

El modelo original de Qwen se distribuye con licencia Apache 2.0, mientras que el derivado de Blackfrost utiliza la licencia qwen-community-1.0, que es más restrictiva para uso comercial y requiere cumplir con los términos de la comunidad Qwen. La diferencia principal entre este checkpoint y el base es la modificación de la superficie de rechazo y el prompt Qwentium incrustado.

## Limitaciones y advertencias

- **Pesos no publicados**: el repositorio está en estado "card preview"; los 131 shards de pesos no están subidos, por lo que el modelo no es desplegable actualmente.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento en benchmarks de rechazo, codificación, multimodal o tool-use. No debe describirse como "red-team ready", "uncensored" ni "certificado de seguridad".
- **Modificación de seguridad**: la superficie de rechazo se ha alterado a nivel de pesos. Esto puede aumentar el riesgo de generación de contenido inapropiado o no seguro en producción. No es adecuado para uso en producción sin evaluación exhaustiva.
- **Licencia restrictiva**: la licencia qwen-community-1.0 limita el uso comercial y requiere cumplir con los términos de la comunidad Qwen. No es Apache 2.0 como el modelo base.
- **Verificación estructural limitada**: las comprobaciones de integridad (tensores cambiados, no finitos, norm) son verificaciones de artefacto, no garantías de comportamiento seguro o de calidad.
- **Riesgo de alucinación**: al ser un modelo de lenguaje de 125B activos con 6B activos por token, puede generar contenido plausible pero incorrecto, especialmente en dominios de conocimiento especializado.
- **Contexto largo**: aunque el contexto nativo es de 262K tokens, el rendimiento en contextos muy largos no ha sido evaluado para este checkpoint.
- **Soporte de idiomas**: no se ha publicado la lista de idiomas soportados para este checkpoint específico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Max-DERISKED-BF16
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.8-Flash-Max
- Documentación de Qwen3.8-Flash-Max (Unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Max: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Max
- Licencia qwen-community-1.0: https://modelscope.cn/models/Qwen/Qwen3.8-Flash-Max/file/view/master?fileName=LICENSE
