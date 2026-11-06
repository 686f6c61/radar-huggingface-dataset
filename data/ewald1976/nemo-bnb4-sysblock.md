# ewald1976/nemo-bnb4-sysblock

## Resumen

`ewald1976/nemo-bnb4-sysblock` es un modelo de generación de texto derivado de Mistral Nemo 12B, publicado por el usuario ewald1976 en Hugging Face. Se trata de un artefacto de fine-tuning cuantizado en 4 bits mediante bitsandbytes, con pesos en formato safetensors y un tamaño de repositorio de 8,3 GB. El nombre sugiere una variante con un bloque de sistema ("sysblock") añadido sobre la base Nemo, aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados.

El modelo hereda la arquitectura transformer de Mistral Nemo, con 12.247.782.400 parámetros totales según los metadatos de safetensors. Está etiquetado como compatible con text-generation-inference y endpoints, y declara licencia Apache 2.0. La model card es prácticamente un copia-pega de la plantilla de Unsloth para fine-tuning, sin información específica sobre este checkpoint concreto: no se detallan hiperparámetros, dataset, ni evaluación.

Su relevancia es limitada: con 46 descargas y 0 likes, es un experimento personal más que un modelo de producción. Resulta útil como ejemplo de fine-tuning ligero con Unsloth sobre Mistral Nemo y como caso de estudio de cuantización 4-bit con bitsandbytes, pero no hay evidencia publicada de su calidad frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral Nemo) |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (bitsandbytes, según nombre y tags) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral Nemo 12B: un transformer decoder-only con atención por ventanas deslizantes y atención completa alternadas, diseñado originalmente para un contexto largo (Mistral Nemo soporta hasta 128K tokens, aunque este checkpoint no declara esa cifra). El modelo se distribuye cuantizado en 4 bits con bitsandbytes, lo que reduce el peso en disco a 8,3 GB frente a los aproximadamente 24 GB en bf16 del modelo base.

No hay información sobre el entrenamiento específico de este checkpoint. La model card menciona Unsloth como herramienta de fine-tuning y enlaza a notebooks genéricos, pero no documenta el dataset, el número de tokens, ni si hubo RLHF o DPO. El sufijo "sysblock" sugiere la inclusión de un bloque de sistema en la plantilla de chat, pero no se detalla su contenido ni su función. Tampoco se especifica si se aplicó LoRA y posteriormente se fusionaron los pesos, aunque el flujo típico de Unsloth apunta a esa posibilidad.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Mistral Nemo.
- Razonamiento y respuesta a instrucciones, presumiblemente con un bloque de sistema predefinido ("sysblock") que condiciona el comportamiento.
- Soporte de tool calling y function calling: no confirmado en la información disponible, aunque Mistral Nemo lo soporta de forma nativa.
- Capacidades multilingües: limitadas al inglés según el tag de idioma; Mistral Nemo base es multilingüe, pero este checkpoint no lo declara.
- Modo thinking o razonamiento extendido: no disponible.
- Visión o audio: no soportado.
- Compatibilidad con text-generation-inference y endpoints, según los tags del repositorio.

## Casos de uso

- Experimentación con fine-tuning ligero: sirve como ejemplo de cómo Unsloth permite ajustar Mistral Nemo 12B en una GPU de consumo y exportar el resultado cuantizado en 4 bits para inspección.
- Despliegue en entornos con VRAM limitada: al ocupar 8,3 GB en disco y cargarse en 4 bits, puede ejecutarse en GPUs de 12-16 GB para pruebas de generación de texto en inglés.
- Evaluación de cuantización bitsandbytes: útil para comparar la degradación de calidad frente al modelo base en bf16 en tareas de generación conversacional.
- Prototipado de asistentes conversacionales en inglés: el bloque de sistema predefinido puede emplearse como plantilla para fijar el rol del asistente en demos rápidas.
- Investigación sobre artefactos de Hugging Face: caso de estudio de repositorios con model cards genéricas y metadatos incompletos, útil para entrenar sistemas de catalogación automática.
- Pruebas de compatibilidad con TGI: al estar etiquetado como endpoints_compatible, puede usarse para validar pipelines de despliegue con text-generation-inference en 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en 4 bits (pesos de 8,3 GB más overhead de activaciones y KV cache).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para despliegue cómodo; también cabe en RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB).
- GPU de consumo: sí, cabe en GPUs de 12 GB o más con cuantización 4-bit, aunque el contexto largo puede agotar la VRAM.
- Opciones de despliegue: transformers con bitsandbytes, text-generation-inference (según tags), vLLM (requiere conversión o soporte de cuantización), llama.cpp/Ollama (requiere exportación a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ewald1976/nemo-bnb4-sysblock | 12,2B | No disponible | Apache 2.0 | Safetensors 4-bit | Hugging Face (46 descargas) |
| Mistral Nemo 12B (base) | 12,2B | 128K | Apache 2.0 | Safetensors bf16 | Hugging Face, ampliamente usado |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | Safetensors, GGUF | Hugging Face, muy popular |
| Gemma 2 9B | 9,2B | 8K | Gemma license | Safetensors, GGUF | Hugging Face, Google |

El checkpoint aquí descrito no aporta mejoras documentadas frente a Mistral Nemo base; su principal diferencia es la cuantización 4-bit y un supuesto bloque de sistema no documentado. Mistral 7B Instruct y Gemma 2 9B son alternativas más ligeras y con ecosistema de despliegue más maduro.

## Limitaciones y advertencias

- Model card genérica: no documenta el dataset, el proceso de entrenamiento ni la evaluación, lo que impide verificar la calidad del fine-tuning.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por la cuantización 4-bit y por un bloque de sistema no auditado.
- Idiomas: solo se declara inglés; no hay evidencia de soporte multilingüe en este checkpoint.
- Contexto: no se especifica la longitud de contexto efectiva; asumir 128K como en Nemo base puede ser incorrecto tras el fine-tuning.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere evaluación propia.
- Cuantización bitsandbytes: puede degradar la calidad frente a bf16, especialmente en tareas de razonamiento y código.
- Repositorio de bajo uso (46 descargas, 0 likes): sin comunidad que valide su comportamiento ni reporte problemas.
- El nombre "sysblock" sugiere un prompt de sistema embebido que podría condicionar las respuestas de forma no transparente.

## Enlaces

- Hugging Face: https://huggingface.co/ewald1976/nemo-bnb4-sysblock
- Notebook de Unsloth para Mistral Nemo 12B: https://colab.research.google.com/drive/17d3U-CAIwzmbDRqbZ9NnpHxCkmXB6LZ0?usp=sharing
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/u54VK8m8tk
- Ko-fi de Unsloth: https://ko-fi.com/unsloth
