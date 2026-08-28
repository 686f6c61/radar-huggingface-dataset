# Sorihon/Chaotic-Order-24B-V1

## Resumen

Chaotic-Order-24B-V1 es un modelo de lenguaje de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) desarrollado por Sorihon mediante la fusión de modelos pre-entrenados utilizando la técnica DARE TIES implementada con mergekit. El modelo se basa en Naphula/Goetia-24B-v1.4 como componente principal, combinado con otro modelo local (Tamed-Chaos-24B) que no está disponible públicamente. El resultado es un modelo de generación de texto con arquitectura tipo Mistral, según las etiquetas de HuggingFace.

Este modelo se presenta como una fusión experimental que busca combinar las capacidades de los modelos base, aunque no se han publicado métricas de rendimiento ni detalles sobre su entrenamiento. Al ser un merge, no ha sido entrenado desde cero, sino que combina los pesos de modelos existentes mediante interpolación y poda selectiva. Su relevancia radica en la exploración de técnicas de fusión de modelos para crear variantes con características potencialmente mejoradas, aunque su adopción es limitada al no contar con documentación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (según etiquetas) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se creó mediante la fusión de dos modelos pre-entrenados usando el método DARE TIES (paper arXiv:2311.03099). La configuración de mergekit especifica un modelo base local (Tamed-Chaos-24B) y el modelo Naphula/Goetia-24B-v1.4, con densidades de 0,8 y 0,6 y pesos de 0,6 y 0,4 respectivamente. El dtype utilizado es bfloat16. No se dispone de información sobre el dataset de entrenamiento, ya que se trata de un merge de modelos existentes y no de un entrenamiento desde cero. La arquitectura subyacente es presumiblemente similar a Mistral, dado el tag "mistral", pero no se especifican detalles como el número de capas o cabezas de atención.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar texto coherente en tareas de continuación y completado.
- Conversación: el tag "conversational" sugiere que está orientado a diálogos, aunque no se detallan capacidades específicas.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de contenido creativo: el modelo puede utilizarse para redactar historias, guiones o diálogos, aprovechando su naturaleza conversacional.
- Chatbots y asistentes virtuales: su tamaño de 24B permite respuestas de calidad media-alta en entornos con recursos suficientes.
- Experimentación con técnicas de fusión: sirve como ejemplo de aplicación de DARE TIES para investigadores interesados en merge de modelos.
- Fine-tuning posterior: al ser un modelo base, puede ajustarse para tareas específicas con datasets propios.
- Investigación académica: útil para estudiar el comportamiento de modelos fusionados y comparar con sus bases.
- Prototipado rápido: para desarrolladores que necesitan un modelo de 24B sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, se necesitan aproximadamente 47 GB de VRAM (23,57B × 2 bytes). Con cuantización a 4 bits (GGUF Q4), podría reducirse a unos 12-14 GB, pero no hay cuantizaciones oficiales.
- GPU recomendadas: para bfloat16, se requieren GPUs con al menos 48 GB (A6000, A100 80GB, H100). Con cuantización, podría ejecutarse en RTX 4090 (24 GB) o similar.
- Opciones de despliegue: al ser un modelo transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se cuantiza).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El modelo base Goetia-24B-v1.4 es la referencia más cercana, pero no se han publicado comparativas. Se puede considerar que compite con otros modelos de 24B como Qwen2.5-24B o Mistral-24B, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede ser problemático sin conocer los términos.
- Sin documentación de sesgos o alucinaciones: al ser un merge, puede heredar sesgos de los modelos base.
- Contexto limitado: no se especifica la longitud de contexto, lo que dificulta su uso en tareas que requieran ventanas largas.
- Sin soporte oficial: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado ampliamente.
- Riesgo de incoherencia: los merges pueden producir comportamientos impredecibles en algunos dominios.

## Enlaces

- [HuggingFace - Sorihon/Chaotic-Order-24B-V1](https://huggingface.co/Sorihon/Chaotic-Order-24B-V1)
- [Paper DARE TIES (arXiv:2311.03099)](https://arxiv.org/abs/2311.03099)
- [Modelo base Naphula/Goetia-24B-v1.4](https://huggingface.co/Naphula/Goetia-24B-v1.4)
- [Repositorio mergekit](https://github.com/cg123/mergekit)
