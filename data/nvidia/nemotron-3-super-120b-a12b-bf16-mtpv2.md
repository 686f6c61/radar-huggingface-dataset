# nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2

## Resumen

NVIDIA Nemotron-3-Super-120B-A12B-BF16-MTPv2 es una cabeza de predicción multi-token (MTP) actualizada, distribuida por separado, diseñada para acelerar la inferencia mediante decodificación especulativa del modelo NVIDIA Nemotron 3 Super. No es un modelo de lenguaje autónomo: no contiene los pesos del backbone del modelo objetivo, sino que actúa como un módulo que propone tokens candidatos que el modelo principal verifica, mejorando el rendimiento de generación sin alterar la calidad del resultado.

Este checkpoint se inicializó a partir de la cabeza MTP integrada en el modelo base `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` y se entrenó adicionalmente con el dataset `Nemotron-Post-Training-Dataset-v2` utilizando la infraestructura de Megatron-LM, manteniendo el backbone congelado. La versión v2 ofrece una mejora respecto a la cabeza MTP original, y es compatible con las variantes BF16, FP8 y NVFP4 del modelo Nemotron 3 Super. Está pensado para desarrolladores que despliegan Nemotron 3 Super en entornos de producción y buscan reducir la latencia y aumentar el throughput de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) para decodificación especulativa; modelo objetivo: híbrido Mamba-2, MoE y Attention con 120B parámetros totales y 12B activos |
| Parametros totales | 2.942.325.248 (aproximadamente 2,94B; la model card indica 3B) |
| Parametros activos | No aplica (no es un modelo MoE, es una cabeza adicional) |
| Longitud de contexto | Hasta 262144 tokens (heredada del modelo objetivo) |
| Tipos de cuantizacion | BF16 (formato del checkpoint); compatible con modelos objetivo en BF16, FP8 y NVFP4 |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español y chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La cabeza MTPv2 es un módulo de red neuronal ligero (unos 3B parámetros) que se acopla al modelo Nemotron 3 Super durante la inferencia. Su función es generar múltiples tokens futuros en paralelo (predicción multi-token) que luego son verificados por el modelo principal, que es el que determina la salida final. Esta técnica de decodificación especulativa permite acelerar la generación sin sacrificar calidad, ya que el modelo objetivo siempre valida las propuestas.

El entrenamiento se realizó con Megatron-LM, inicializando desde la cabeza MTP integrada en el modelo base y afinándola con el dataset `Nemotron-Post-Training-Dataset-v2`, que combina prompts públicos y sintéticos filtrados por calidad y complejidad, con respuestas generadas por modelos abiertos. El backbone de Nemotron 3 Super permaneció congelado durante este proceso, lo que garantiza que el comportamiento del modelo principal no se vea alterado.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: propone tokens candidatos que el modelo objetivo verifica, reduciendo el número de pasos autoregresivos.
- Compatibilidad con múltiples formatos del modelo objetivo: BF16, FP8 y NVFP4 de Nemotron 3 Super.
- Integración con runtimes de inferencia populares: vLLM, SGLang y TensorRT-LLM.
- Soporte de contexto largo de hasta 262144 tokens, lo que permite su uso en tareas que requieren ventanas de contexto extensas.
- Multilingüe: cubre inglés, francés, alemán, italiano, japonés, español y chino.
- No requiere modificar el modelo objetivo: se carga como un módulo separado, facilitando su adopción en pipelines existentes.

## Casos de uso

- Despliegue de Nemotron 3 Super en producción con vLLM: integrar la cabeza MTPv2 permite reducir la latencia de generación en servicios de chat o asistentes virtuales, manteniendo la calidad del modelo principal.
- Inferencia a gran escala con TensorRT-LLM: en entornos con GPUs Hopper o Blackwell, la decodificación especulativa puede aumentar el throughput de peticiones concurrentes, reduciendo costes por token generado.
- Sistemas de generación de código en tiempo real: al acelerar la inferencia, el modelo puede responder más rápido en asistentes de programación que requieren baja latencia.
- Procesamiento de documentos largos: con su contexto de 262K tokens, es adecuado para resumir o analizar informes extensos, y la aceleración especulativa compensa el coste computacional de ventanas grandes.
- Chatbots multilingües de atención al cliente: la compatibilidad con siete idiomas y la mejora de velocidad permiten ofrecer respuestas ágiles en soporte internacional.
- Experimentación e investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de cabezas MTP entrenadas con datos de post-entrenamiento en modelos híbridos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el dataset `SPEED-Bench` como herramienta de evaluación, pero no proporciona métricas concretas de rendimiento para este checkpoint. Se recomienda consultar el informe técnico de Nemotron 3 Super para datos de latencia y throughput del modelo base.

## Requisitos de hardware

- Este checkpoint no es un modelo independiente; requiere cargar junto con el modelo objetivo Nemotron 3 Super (120B parámetros totales, 12B activos).
- Hardware compatible: GPUs NVIDIA Blackwell y Hopper (según la model card). No se garantiza su funcionamiento en arquitecturas anteriores.
- VRAM estimada: depende del modelo objetivo y su cuantización. Para la variante BF16, se requieren al menos 240 GB de memoria (considerando pesos del modelo y cabezas adicionales); las versiones FP8 y NVFP4 reducen este requisito.
- No es viable en GPUs de consumo (p. ej., RTX 4090) debido al tamaño del modelo objetivo; está orientado a entornos de servidor con múltiples GPUs.
- Runtimes soportados: vLLM, SGLang y TensorRT-LLM. También es compatible con el ecosistema Megatron-LM para entrenamiento o ajuste.
- La latencia y el throughput dependen de la configuración de hardware y del runtime; la decodificación especulativa puede ofrecer mejoras de 1,5x a 3x en velocidad de generación, aunque estos valores no están confirmados oficialmente.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con alternativas equivalentes, ya que es un componente específico de aceleración para Nemotron 3 Super y no existe un estándar comparable en el ecosistema open source. Otras técnicas de decodificación especulativa (p. ej., cabezas MTP integradas en otros modelos) no son directamente comparables sin datos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: debe usarse obligatoriamente junto con un checkpoint de Nemotron 3 Super compatible; su uso aislado no produce texto.
- Requiere un runtime que soporte la carga de cabezas MTP separadas (vLLM, SGLang, TensorRT-LLM). No todos los frameworks de inferencia ofrecen esta funcionalidad.
- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial; es necesario revisar los términos completos en el enlace proporcionado.
- El rendimiento de la decodificación especulativa depende de la carga de trabajo y del hardware; no garantiza mejoras en todos los escenarios, y puede requerir ajuste fino de parámetros del runtime.
- Los idiomas soportados están limitados a siete; el modelo puede no rendir adecuadamente en otros idiomas.
- Al ser una cabeza entrenada con datos sintéticos, podría heredar sesgos presentes en los datos de entrenamiento del dataset `Nemotron-Post-Training-Dataset-v2`, aunque el impacto en la salida final es mitigado por el modelo objetivo que verifica las propuestas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2)
- [Modelo base Nemotron 3 Super 120B-A12B BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16)
- [Informe técnico de Nemotron 3 Super](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)
- [Megatron-LM](https://github.com/NVIDIA/Megatron-LM)
- [Dataset Nemotron Post-Training Dataset v2](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2)
- [SPEED-Bench](https://huggingface.co/datasets/nvidia/SPEED-Bench)
- [Licencia NVIDIA Nemotron Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
