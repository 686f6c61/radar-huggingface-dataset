# orz99/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF es un paquete de cuantizaciones GGUF del modelo multimodal Qwen3.8-Flash-Next, publicadas originalmente por el laboratorio ISTA-DASLab (Deep Algorithms and Systems Lab, Institute of Science and Technology Austria) y redistribuidas por el usuario orz99 junto con un vector de control que elimina los rechazos (refusals) en tiempo de ejecución. El repositorio no contiene pesos nuevos: los ficheros GSQ-RCO son copia byte a byte de los publicados por ISTA-DASLab en la revisión `ed59f92082b1e93c0e96d60a8b11aab089b52f09`, y el único artefacto propio del autor es un fichero de 480 KB con la dirección de rechazo extraída del checkpoint Huihui-Qwen3.8-Flash-Next-abliterated.

El modelo base es un transformer multimodal de tipo image-text-to-text con 120.320 millones de parámetros totales, según el dato de safetensors del modelo original. La cuantización GSQ-RCO reduce ese tamaño hasta ficheros de entre 66,4 GB (Q2_0) y 83,6 GB (IQ3_S), lo que permite ejecutarlo en un PC de consumo con 48-64 GB de RAM y una GPU de 12 GB o más mediante el runtime Strata, que implementa una proyección de vector de control por capa en lugar de una suma aditiva.

La relevancia actual del paquete es doble: por un lado, demuestra que es posible ejecutar un modelo multimodal de 120B en hardware de consumo gracias a la combinación de cuantización extrema (2,4-3,5 bits por peso) y decodificación especulativa con capa MTP; por otro, introduce un mecanismo de "abliteración en el motor" que mantiene los pesos originales intactos y aplica la eliminación de rechazos como una operación matemática en el residual stream, reversible mediante un flag de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP para decodificación especulativa; cuantización GSQ-RCO |
| Parametros totales | 120.320 millones (120,32B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prompts de hasta 131K tokens en las pruebas del autor) |
| Tipos de cuantizacion | Q2_0 (2,40 bits/peso), IQ2_XS (2,50 bits/peso), IQ3_XXS (3,00 bits/peso), IQ3_S (3,50 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | GGUF (dos shards por tamaño; shard 2 es la tabla n-gram, idéntica en los cuatro tamaños) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal desarrollado por el equipo Qwen, con capacidad de procesar imagen y texto de entrada (pipeline `image-text-to-text`). El paquete redistribuido incorpora una capa MTP (Multi-Token Prediction) que actúa como draft layer para decodificación especulativa: el instalador de Strata descarga aproximadamente 6 GB del checkpoint original de Qwen para habilitarla. La cuantización GSQ (paper arXiv:2604.18556) y RCO (paper arXiv:2605.00649) son técnicas desarrolladas por ISTA-DASLab para comprimir el modelo a 2,4-3,5 bits por peso manteniendo la fidelidad respecto a BF16.

La innovación técnica del repositorio es el uso de un vector de control por proyección en lugar de suma. Strata aplica, tras cada capa steering, la operación `h = h - (h · r) r` sobre el residual stream, donde `r` es la dirección de rechazo unitaria extraída del checkpoint Huihui. A diferencia de la edición rank-one aplicada en pesos (`W_new = W - r (r^T W)`), la proyección en runtime afecta a todo el stream, incluyendo las contribuciones de embedding y n-gram, y no puede aplicarse a la capa 0. El rango de capas probado es 4-44 y 1-47, configurable en `strata-<model>.json`. Los pesos permanecen sin modificar: con `"experimental_speed_projection": false` se ejecuta el modelo original. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline `image-text-to-text`).
- Decodificación especulativa mediante capa MTP, que acelera la generación en prompts largos.
- Ejecución con proyección de vector de control por capa para eliminar rechazos en runtime, reversible por flag.
- Soporte de API compatible con OpenAI (`/v1`) y Anthropic (`/v1/messages`) a través del servidor de Strata.
- Cuantización extrema que permite ejecución en hardware de consumo con 48-64 GB de RAM.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible (no se documenta explícitamente).

## Casos de uso

- **Ejecución local de un modelo de 120B en hardware de consumo**: con IQ3_S (83,6 GB de descarga, 50 GB de expertos en RAM) y una GPU de 12 GB o más, un PC de 64 GB puede ejecutar el modelo mediante Strata, algo inviable con los pesos BF16 originales.
- **Investigación sobre alineación y rechazos**: el vector de control permite activar y desactivar la eliminación de rechazos en runtime sin recargar pesos, lo que facilita experimentos comparativos sobre el comportamiento del modelo con y sin la dirección `r` aplicada.
- **Prototipado multimodal en estación de trabajo**: el pipeline image-text-to-text permite construir demos de descripción de imágenes, VQA o extracción de información de documentos sin depender de APIs externas, con el modelo corriendo en local.
- **Evaluación de cuantizaciones GSQ-RCO**: los cuatro tamaños publicados (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) permiten medir el compromiso entre fidelidad (KL a BF16) y velocidad de decodificación; el autor reporta 87 tokens/s para IQ2_XS y 59 tokens/s para IQ3_S con prompt de 32K en una RTX 3090.
- **Despliegue con clientes OpenAI/Anthropic existentes**: el servidor de Strata expone `/v1` y `/v1/messages`, por lo que herramientas que ya hablan con esas APIs pueden apuntar al endpoint local sin cambios de código.
- **Integración en pipelines de CI/CD para pruebas de modelos**: la posibilidad de arrancar el servidor con flags deterministas (`--control-vector-scaled`, `--control-vector-layer-range`, `--cvec-mode project`) permite reproducir configuraciones exactas en entornos automatizados.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones del autor en una RTX 3090, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Q2_0 | IQ2_XS | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Bits por peso | 2,40 | 2,50 | 3,00 | 3,50 |
| Tamano de descarga | 66,4 GB | 68,0 GB | 75,8 GB | 83,6 GB |
| Expertos en RAM | 34 GB | 35,5 GB | 43 GB | 50 GB |
| KL respecto a BF16 Huihui | no medido | 0,193 | no medido | 0,075 |
| Top-1 igual que BF16 | no medido | 88% | no medido | 93% |
| Decodificacion con prompt de 32K | no medido | 87 tok/s | no medido | 59 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que IQ3_S se mantiene más cerca del modelo completo y que IQ2_XS decodifica entre un 45% y un 70% más rápido en prompts de hasta 131K tokens.

## Requisitos de hardware

- **VRAM de GPU**: 12 GB o más (requisito mínimo de Strata, para NVIDIA o AMD).
- **RAM del sistema**: 48 GB para Q2_0 e IQ2_XS; 64 GB para IQ3_XXS e IQ3_S, según la página de Strata.
- **Almacenamiento**: 66,4-83,6 GB para los shards del modelo, más aproximadamente 6 GB para la capa MTP draft y 480 KB para el vector de control.
- **GPU recomendadas**: el autor midió en una RTX 3090; no se especifican otras GPU en la información disponible.
- **Cabe en GPU de consumo**: sí, con el esquema de offloading de expertos a RAM que implementa Strata (34-50 GB de expertos en RAM según tamaño).
- **Opciones de despliegue**: Strata (runtime recomendado, con soporte de proyección de vector de control); llama.cpp carga los GGUF pero su `--control-vector` estándar solo suma vectores y no tiene modo proyección, por lo que el efecto de eliminación de rechazos no funciona igual.
- **Latencia y throughput**: 87 tok/s (IQ2_XS) y 59 tok/s (IQ3_S) con prompt de 32K en RTX 3090, según mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF (este) | 120,32B | no disponible | GGUF 2,4-3,5 bits/peso | qwen-community-license-1.0 | Hugging Face (orz99) |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 120,32B | no disponible | GGUF GSQ-RCO | qwen-community-license-1.0 | Hugging Face (ISTA-DASLab) |
| Huihui-Qwen3.8-Flash-Next-abliterated | 120,32B | no disponible | BF16 (edición rank-one en pesos) | qwen-community-license-1.0 | Hugging Face (huihui-ai) |
| alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6 | 120,32B | no disponible | EXL3 4 bits | qwen-community-license-1.0 | Hugging Face (alesha-pro) |

La diferencia clave frente a las alternativas es que este repositorio mantiene los pesos originales de ISTA-DASLab y aplica la eliminación de rechazos como proyección en runtime, mientras que Huihui la incorpora en los pesos y la versión EXL3 la hornea en la cuantización de 4 bits. No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Licencia**: qwen-community-license-1.0 (etiquetada como `other`); es necesario revisar los términos para uso comercial, ya que la licencia comunitaria de Qwen impone restricciones que no se detallan en la información disponible.
- **Riesgo de alucinación**: no cuantificado en la información disponible; la cuantización a 2,4-3,5 bits por peso puede degradar la fidelidad (KL de 0,193 en IQ2_XS y 0,075 en IQ3_S respecto a BF16), lo que potencialmente aumenta errores.
- **Eliminación de rechazos**: el vector de control desactiva los rechazos del modelo, lo que puede producir contenido no filtrado; debe evaluarse el impacto en seguridad antes de uso en producción.
- **Capa 0 no steerable**: la proyección no puede aplicarse a la capa 0, y afecta a todo el residual stream (incluyendo embeddings y n-gram), lo que difiere del comportamiento de la edición en pesos.
- **Compatibilidad limitada**: llama.cpp carga los GGUF pero su `--control-vector` estándar no soporta modo proyección, por lo que el efecto de abliteración no se reproduce fuera de Strata.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el modelo base en la información disponible.
- **Instalador no probado end-to-end**: el autor indica que no ejecutó el instalador completo, solo construyó el motor desde la fuente fijada y lo arrancó con los mismos argumentos.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/orz99/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Repositorio base ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint Huihui abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Runtime Strata: https://github.com/Niko1221/Strata
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Cuantizaciones EXL3 del mismo modelo: https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6
