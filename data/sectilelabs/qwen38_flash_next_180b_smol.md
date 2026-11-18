# SectileLabs/qwen38_flash_next_180b_smol

## Resumen

Qwen3.8-Flash-Next 180B SMOL pure 2-bit es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, publicado por Sectile Labs bajo el identificador `SectileLabs/qwen38_flash_next_180b_smol`. No se trata de un modelo entrenado desde cero, sino de una conversión a un formato propietario (`.ginfer`) para el motor de inferencia GInfer, orientado a inferencia de alta concurrencia y contexto largo sobre GPUs NVIDIA. El modelo base es Qwen/Qwen3.8-Flash-Next en su revisión `de4b8e4d`, con licencia Qwen Community License 1.0.

La particularidad técnica del paquete es la cuantización "SMOL pure 2-bit": los bancos de expertos enrutados (routed experts) se almacenan en Q2_0, mientras que el resto de componentes (atención, expertos compartidos, routers, embeddings, cabeza de salida y capa MTP) fueron cuantizados por Sectile Labs a partir de los pesos BF16 oficiales. El resultado es un repositorio de 210,8 GB que produce paquetes de aproximadamente 70 GB por GPU, con variantes para 1, 2 y 4 GPUs en tensor-parallel.

La relevancia de esta ficha es doble: por un lado, documenta un formato de despliegue cerrado (solo GInfer y GChat pueden cargarlo, no es safetensors ni GGUF); por otro, ilustra una estrategia de compresión agresiva (2 bits en los expertos) sobre un modelo de 180B parámetros nominales, con decodificación especulativa integrada mediante una capa MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; el paquete incluye capa MTP para decodificación especulativa) |
| Parametros totales | 180B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SMOL pure 2-bit (routed expert banks en Q2_0; resto cuantizado por Sectile Labs desde BF16) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (campo `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | `.ginfer` (paquete propietario para el motor GInfer; no es safetensors ni GGUF) |

Datos adicionales del repositorio: tamaño total 210,8 GB; tres paquetes disponibles con sus hashes SHA-256:

| Fichero | Drafter | Tensor-parallel | Tamano (bytes) |
|---|---|---|---|
| `qwen38_flash_next_180b_smol_mtp.ginfer` | Capa MTP integrada | 1 GPU | 70.247.086.080 |
| `qwen38_flash_next_180b_smol_mtp_tp2.ginfer` | Capa MTP integrada | 2 GPUs | 70.252.942.856 |
| `qwen38_flash_next_180b_smol_mtp_tp4.ginfer` | Capa MTP integrada | 4 GPUs | 70.306.199.816 |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: es una conversión de pesos. La arquitectura subyacente es la del modelo base Qwen3.8-Flash-Next, del que la model card no detalla si es transformer denso, MoE o híbrido, aunque la referencia a "routed expert banks" y "shared experts" implica una arquitectura de mezcla de expertos (MoE) con expertos compartidos. La capa MTP (multi-token prediction) integrada actúa como drafter para decodificación especulativa, lo que permite generar varios tokens por paso de verificación.

La procedencia de los pesos está desglosada en la model card: los expertos enrutados provienen de `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` en revisión `ed59f920`, en cuantización Q2_0, convertidos al layout de GInfer. El resto de componentes (atención, expertos compartidos, routers, embedding, cabeza y capa MTP) fue cuantizado por Sectile Labs desde los pesos BF16 oficiales de `Qwen/Qwen3.8-Flash-Next@de4b8e4d` y posteriormente empaquetado en `.ginfer`. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que esos detalles corresponden al modelo base y no se incluyen en esta model card.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, si bien la model card no detalla capacidades específicas.
- Decodificación especulativa: la capa MTP integrada actúa como drafter, lo que en teoría acelera la generación en el motor GInfer.
- Inferencia de alta concurrencia y contexto largo: el motor GInfer está diseñado explícitamente para "fast, high-concurrency, long-context work on NVIDIA GPUs", según la model card.
- Despliegue multi-GPU: variantes TP2 y TP4 para repartir el modelo entre 2 o 4 GPUs idénticas.
- Soporte de tool calling, agentes, visión, audio o thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 180B en una sola GPU: el paquete `qwen38_flash_next_180b_smol_mtp.ginfer` ocupa unos 70 GB y está pensado para una única GPU NVIDIA Ampere, Ada o Blackwell, lo que permite servir un modelo de gran tamaño sin clúster multi-GPU.
- Servicio de alta concurrencia: GInfer está orientado a cargas con muchas peticiones simultáneas y contexto largo, adecuado para backends de asistentes conversacionales o APIs internas con múltiples usuarios.
- Reparto en 2 o 4 GPUs para mayor throughput: las variantes TP2 y TP4 permiten distribuir el modelo y, presumiblemente, aumentar la capacidad de proceso paralelo en entornos con varias GPUs idénticas.
- Decodificación especulativa integrada: la capa MTP permite reducir la latencia por token en generación autoregresiva, útil en aplicaciones interactivas donde el tiempo hasta el primer token y la velocidad de generación son críticos.
- Inferencia en producción con cuantización agresiva: el formato 2-bit en los expertos enrutados reduce la huella de memoria y el ancho de banda necesario, lo que puede abaratar el coste por token en comparación con pesos BF16.
- Integración con GChat: al estar construido sobre GInfer, el paquete puede cargarse directamente en la aplicación de chat de Sectile Labs para prototipado y uso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: cada paquete ocupa aproximadamente 70 GB en disco (70.247.086.080 bytes para TP1), por lo que se necesita al menos esa cantidad de memoria de GPU para cargarlo, más overhead del motor de inferencia.
- GPUs recomendadas: NVIDIA Ampere, Ada y Blackwell, según la model card. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada. Un paquete de 70 GB no cabe en GPUs de consumo con 24 GB (RTX 4090) ni en la mayoría de tarjetas de 48 GB; requeriría GPUs profesionales de 80 GB (A100/H100) o configuraciones multi-GPU.
- Opciones de despliegue: exclusivamente GInfer y GChat. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros runtimes, al no ser safetensors ni GGUF.
- Latencia y throughput: no disponibles. La model card menciona que GInfer está optimizado para alta concurrencia y contexto largo, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next 180B SMOL 2-bit (este) | 180B (nominal) | no disponible | `.ginfer` (2-bit expertos) | Qwen Community License 1.0 | Solo GInfer/GChat |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (nominal) | no disponible | safetensors BF16 (presumible) | Qwen Community License 1.0 | Múltiples (vLLM, TGI, etc.) |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 180B (nominal) | no disponible | GGUF Q2_0 | Apache-2.0 (hereda base) | llama.cpp y compatibles GGUF |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible. No se dispone de datos de rendimiento ni de benchmarks para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Formato cerrado: los paquetes `.ginfer` solo funcionan en GInfer y GChat; no se pueden cargar en vLLM, llama.cpp, Ollama, TGI ni en ninguna otra herramienta estándar. Esto limita la portabilidad y crea dependencia de un único proveedor.
- Cuantización agresiva a 2 bits: la compresión Q2_0 en los expertos enrutados puede degradar la calidad de las respuestas frente a los pesos BF16 originales; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Licencia Qwen Community License 1.0: incluye requisitos de retención de avisos y condiciones específicas para Model-as-a-Service y AI Work Assistant. Es imprescindible revisar el fichero `LICENSE` antes de un uso comercial.
- Sin datos de benchmarks ni de idiomas: no hay información publicada sobre rendimiento, sesgos, alucinación o cobertura lingüística en la model card.
- Repositorio sin descargas ni likes (0 descargas, 0 likes en el momento de la consulta), lo que indica ausencia de validación por parte de la comunidad.
- Tamaño de descarga elevado: 210,8 GB de repositorio y ~70 GB por paquete, con verificación SHA-256 obligatoria para garantizar la integridad.
- Dependencia de la capa MTP: la decodificación especulativa depende de que el motor GInfer implemente correctamente el drafter; no se documentan los parámetros de aceptación ni el factor de aceleración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SectileLabs/qwen38_flash_next_180b_smol
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revisión del modelo base: `de4b8e4d43b917e7706784d8bb445c9af86a3540`
- Fuente de los expertos enrutados: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (revisión `ed59f920`)
- Licencia Qwen Community License 1.0: fichero `LICENSE` en el repositorio
