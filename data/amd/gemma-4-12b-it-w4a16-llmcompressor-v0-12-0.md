# amd/gemma-4-12B-it-w4a16-llmcompressor-v0.12.0

## Resumen

El modelo `amd/gemma-4-12B-it-w4a16-llmcompressor-v0.12.0` es una versión cuantizada del modelo multimodal Gemma 4 12B IT, desarrollada por AMD para inferencia eficiente en CPU. Se basa en el modelo `RedHatAI/gemma-4-12B-it`, que a su vez deriva del Gemma 4 12B de Google, una familia de modelos abiertos con capacidades multimodales nativas (texto, imagen, audio y vídeo). La cuantización emplea el algoritmo GPTQ con esquema W4A16 (pesos de 4 bits, activaciones en BF16), optimizada mediante LLM Compressor y ZenDNN para ejecutarse en procesadores AMD EPYC.

El modelo conserva la arquitectura `Gemma4UnifiedForConditionalGeneration`, con aproximadamente 11,96 mil millones de parámetros, y mantiene en BF16 los componentes multimodales (torre de visión, embedders de audio y vídeo, proyector multimodal y `lm_head`) para minimizar la pérdida de calidad en esas modalidades. Su relevancia actual radica en permitir el despliegue de un modelo de 12B con capacidades multimodales en entornos de CPU sin necesidad de GPU, lo que reduce costes y amplía los escenarios de inferencia local.

La evaluación publicada muestra una recuperación del 98,38% en GSM8K (5 disparos) respecto al modelo BF16 original, lo que indica una degradación mínima por la cuantización. Está pensado para su uso con vLLM en CPU, con soporte para el stack ZenDNN/ZenTorch de AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (encoder-free, multimodal) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion disponible) |
| Tipos de cuantizacion | W4A16 (4-bit weight-only, INT4 simetrico, group_size=128, activaciones BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal encoder-free de la familia Gemma 4, con arquitectura unificada que procesa texto, imagen, audio y vídeo sin encoders separados. La versión cuantizada mantiene la misma arquitectura, pero los pesos de las capas lineales se cuantizan a INT4 de forma simétrica por grupos de 128 elementos, mientras que las activaciones permanecen en BF16. Los módulos multimodales (torre de visión, embedders de audio y vídeo, proyector y `lm_head`) se excluyen de la cuantización y se conservan en BF16 para preservar la calidad en tareas no textuales.

La cuantización se realizó con LLM Compressor v0.12.0 mediante el algoritmo GPTQ, calibrado con 128 ejemplos del dataset `HuggingFaceH4/ultrachat_200k` a una longitud máxima de secuencia de 2048 tokens. El proceso one-shot genera las matrices de Hessian por capa para compensar el error de redondeo. El modelo resultante está optimizado para el stack ZenDNN v6.1.0 y ZenTorch v2.11.0.3, y se ejecuta con vLLM v0.26.0 en CPU AMD EPYC.

## Capacidades

- Generación de texto conversacional e instrucciones, con soporte para razonamiento y respuestas multi-turno.
- Comprensión multimodal nativa: el modelo base acepta entradas de texto, imagen, audio y vídeo; la cuantización conserva los módulos multimodales en BF16, por lo que estas capacidades se mantienen.
- Soporte de tool calling y function calling (heredado del modelo base Gemma 4 IT).
- Capacidad de razonamiento multi-step y modo thinking (activado mediante `enable_thinking` en la evaluación).
- Multilingüe limitado: la model card indica solo inglés, aunque el modelo base podría soportar más idiomas; no se especifica.
- Inferencia eficiente en CPU gracias a la cuantización 4-bit y la optimización ZenDNN.

## Casos de uso

- Despliegue de asistentes conversacionales en servidores CPU sin GPU: el modelo puede gestionar diálogos multi-turno con contexto largo (aunque la longitud exacta no está publicada) y respuestas en tiempo real en hardware AMD EPYC, reduciendo costes de infraestructura.
- Procesamiento de documentos multimodales en entornos locales: al conservar la torre de visión y los embedders de audio en BF16, puede extraer información de imágenes, vídeos o audio junto con texto, por ejemplo para indexación de archivos o generación de resúmenes.
- Generación de código y asistencia a programación: el modelo base Gemma 4 IT tiene capacidades de código; la versión cuantizada permite ejecutarlo en estaciones de trabajo con CPU, integrándolo en IDEs o pipelines de CI/CD.
- Automatización de atención al cliente: con tool calling, puede conectarse a APIs de CRM o bases de conocimiento para resolver consultas de usuarios de forma autónoma, sin depender de GPUs.
- Investigación y prototipado en entornos con restricciones de hardware: investigadores pueden evaluar el comportamiento de un modelo de 12B multimodal en CPU antes de escalar a GPU.
- Inferencia en entornos edge o virtualizados donde no hay aceleradores disponibles: la cuantización 4-bit reduce el uso de memoria a aproximadamente 7-8 GB, permitiendo ejecución en servidores con RAM moderada.

## Benchmarks y rendimiento

La model card publica un único benchmark comparando el modelo cuantizado con el baseline BF16, usando lm-evaluation-harness con motor vLLM:

| Benchmark | BF16 Baseline | W4A16 (este modelo) | Recuperacion |
| --- | --- | --- | --- |
| GSM8K (5-shot) | 0,9401 | 0,9249 | 98,38% |

No se han publicado resultados adicionales (MMLU, HumanEval, etc.) en la informacion disponible. La recuperación del 98,38% en GSM8K indica una pérdida mínima de rendimiento en razonamiento matemático tras la cuantización.

## Requisitos de hardware

- Inferencia en CPU: diseñado específicamente para AMD EPYC con ZenDNN; requiere Linux como sistema operativo preferente.
- Memoria: el repositorio ocupa 7,8 GB; con pesos INT4 y activaciones BF16, el uso de RAM estimado en inferencia es de aproximadamente 8-10 GB, dependiendo de la longitud de contexto y el batch.
- No requiere GPU; puede ejecutarse en cualquier CPU x86 con vLLM, aunque el rendimiento óptimo se logra con el stack ZenDNN/ZenTorch.
- Stack de software recomendado: PyTorch 2.11.0, ZenTorch 2.11.0.3, vLLM 0.26.0, LLM Compressor 0.12.0.
- Configuración OpenMP: se recomienda establecer `LD_PRELOAD` con `libomp.so` (LLVM) o `libiomp5.so` (Intel) antes de lanzar la inferencia.
- Opciones de despliegue: vLLM (motor principal), también compatible con transformers mediante `trust_remote_code`; no se menciona soporte para llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | GSM8K (5-shot) | Licencia | Hardware objetivo |
| --- | --- | --- | --- | --- | --- | --- |
| amd/gemma-4-12B-it-w4a16-llmcompressor (este) | ~12B | W4A16 (INT4) | no disponible | 0,9249 | Gemma | CPU AMD EPYC |
| RedHatAI/gemma-4-12B-it (BF16 original) | ~12B | BF16 | no disponible | 0,9401 | Gemma | GPU/CPU |
| google/gemma-4-12B-it (modelo base) | ~12B | BF16 | no disponible | no disponible | Gemma | GPU/CPU |

No se dispone de datos de otras cuantizaciones del mismo modelo (p. ej., versiones QAT w4a16) para comparar directamente. La comparativa se limita al baseline BF16, que muestra una degradación del 1,62% en GSM8K.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una ligera degradación en tareas de razonamiento complejo; el único benchmark publicado muestra una recuperación del 98,38% en GSM8K, pero no hay datos para otras tareas.
- Solo se certifica el idioma inglés; el uso en otros idiomas puede degradar la calidad.
- La longitud de contexto no está especificada en la documentación; se recomienda verificar el modelo base para conocer el límite real.
- El hardware soportado oficialmente es CPU AMD EPYC con Linux; en otras plataformas (GPU, ARM, Windows) el rendimiento y la compatibilidad no están garantizados.
- La licencia Gemma tiene restricciones de uso comercial; es necesario revisar los términos específicos de la licencia antes de desplegar en producción.
- Los componentes multimodales se mantienen en BF16, lo que aumenta ligeramente el uso de memoria y puede reducir la ventaja de la cuantización en tareas que usen imagen, audio o vídeo.
- No se han publicado resultados de latencia o throughput; el rendimiento real depende de la configuración del CPU, el número de hilos y la longitud de secuencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/gemma-4-12B-it-w4a16-llmcompressor-v0.12.0
- Modelo base (RedHatAI): https://huggingface.co/RedHatAI/gemma-4-12B-it
- Modelo original (Google): https://huggingface.co/google/gemma-4-12B-it
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
