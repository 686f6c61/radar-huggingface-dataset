# greenfield0810/affine-ark-950f3a770a57

## Resumen

Este repositorio contiene un checkpoint de un modelo de lenguaje multimodal (image-text-to-text) perteneciente a la subred 120 de Bittensor, denominada Affine. El archivo `affine-ark-950f3a770a57` es una copia sin modificar (espejo byte a byte) de un checkpoint de un competidor, subido por el usuario `greenfield0810` con fines de preservación, ya que los repositorios de esa subred suelen hacerse privados poco después de los duelos de evaluación. El modelo original, `afgod1079/Affine-5e7olmlmcc-cp1000`, no está disponible actualmente.

La arquitectura declarada en las etiquetas es `qwen3_5_moe`, lo que sugiere un modelo basado en la familia Qwen 3.5 con arquitectura de mezcla de expertos (MoE), y un total de 35.951.822.704 parámetros (según los pesos safetensors). El tamaño del repositorio es de 71,9 GB distribuidos en 21 shards. No se dispone de información adicional sobre el entrenamiento, el contexto, las capacidades específicas o la licencia, ya que el autor del espejo no proporciona más datos que los de procedencia.

Este archivo es relevante para investigadores que estudian la evolución de los modelos en subredes de Bittensor, o que desean reproducir o analizar un checkpoint que de otro modo sería inaccesible. Sin embargo, al tratarse de un espejo sin documentación oficial, cualquier uso en producción debe considerar la falta de garantías y de especificaciones verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts, familia Qwen 3.5) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (21 shards, 71,9 GB) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna (número de expertos, top-k, capas, atención, etc.) más allá de la etiqueta `qwen3_5_moe`, que indica una arquitectura de mezcla de expertos de la familia Qwen 3.5. Tampoco hay datos sobre el proceso de entrenamiento: no se conocen el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El modelo es multimodal (image-text-to-text), por lo que se presume que fue entrenado para procesar entradas de imagen y texto, pero no se especifican detalles.

Dado que se trata de un checkpoint de un competidor de la subred Affine de Bittensor, es probable que haya sido optimizado para tareas de razonamiento y conversación, como es común en esa subred, pero no hay evidencia documental que lo confirme.

## Capacidades

- Procesamiento multimodal de imagen y texto (según el pipeline `image-text-to-text`).
- Generación de texto conversacional (etiqueta `conversational`).
- Posible soporte de razonamiento avanzado, aunque no está documentado.
- No se dispone de información sobre tool calling, agentes, capacidades multilingües o modos especiales de pensamiento.

## Casos de uso

Dado que la información es limitada, los siguientes casos son hipotéticos y deben validarse antes de cualquier implementación:

- Investigación académica: análisis de la evolución de checkpoints en subredes de Bittensor, comparación de arquitecturas MoE multimodales.
- Reproducción de experimentos: si se recupera el modelo original, este espejo permite reproducir resultados de evaluaciones previas.
- Desarrollo de prototipos multimodales: exploración de capacidades de imagen-texto en un modelo de ~36B parámetros, siempre que se disponga de hardware adecuado.
- Fine-tuning selectivo: a partir de este checkpoint, se podría ajustar el modelo para tareas específicas, aunque la falta de licencia y documentación lo hace arriesgado.
- Auditoría de modelos: verificación de la integridad de pesos mediante el hash SHA proporcionado.
- Archivado y preservación: uso como referencia para estudios longitudinales de modelos descentralizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Sin embargo, basándose en el número de parámetros (35,95B) y el tamaño del repositorio (71,9 GB), se puede estimar:

- VRAM estimada para inferencia en FP16: aproximadamente 72 GB (mínimo), lo que requiere GPUs como A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU.
- Con cuantización a 8 bits, la VRAM necesaria podría reducirse a unos 36-40 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) no es suficiente; se necesitaría al menos una A6000 (48 GB) o similar.
- Con cuantización a 4 bits, la VRAM podría bajar a unos 18-20 GB, lo que permitiría ejecutarlo en una RTX 3090/4090, aunque con pérdida de precisión.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF), u Ollama (con conversión previa).
- Latencia y throughput: no disponibles, dependen del hardware y la optimización.

Estas cifras son estimaciones razonables, no datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a una subred privada de Bittensor y no hay datos públicos de rendimiento frente a alternativas como Qwen 2.5 MoE, Mixtral 8x22B o DeepSeek MoE. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un espejo de un checkpoint de un competidor de Bittensor; el autor original no ha publicado documentación ni licencia.
- La licencia es "no disponible", por lo que su uso comercial o incluso académico puede infringir derechos no especificados.
- No se garantiza la ausencia de sesgos, alucinaciones o comportamientos no deseados, ya que no hay evaluación independiente.
- El modelo puede haber sido entrenado con datos no filtrados o con objetivos específicos de la subred Affine, lo que podría generar respuestas inapropiadas.
- La arquitectura exacta (número de expertos, top-k, etc.) no está confirmada, solo la etiqueta `qwen3_5_moe`.
- El repositorio puede ser retirado a petición del autor original, como se indica en la model card.
- No se recomienda su uso en producción sin una validación exhaustiva y sin resolver la cuestión de la licencia.

## Enlaces

- Repositorio del espejo: https://huggingface.co/greenfield0810/affine-ark-950f3a770a57
- Repositorio original (probablemente no accesible): https://huggingface.co/afgod1079/Affine-5e7olmlmcc-cp1000
- Archivo de procedencia (dentro del repo): `_affine_provenance.json`
