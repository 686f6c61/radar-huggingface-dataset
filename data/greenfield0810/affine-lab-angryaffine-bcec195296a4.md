# greenfield0810/affine-lab-angryaffine-bcec195296a4

## Resumen

Este repositorio de HuggingFace, publicado por greenfield0810, no contiene un modelo de lenguaje completo, sino un corpus de entrenamiento y adaptadores LoRA para la subred SN120 (Affine) de Bittensor. El corpus está formado por rollouts de duelos generados por el modelo teacher Qwen/Qwen3.8-27B, con 189.158 turnos y 7.419 estratos. El repositorio incluye también checkpoints de adaptadores LoRA secuenciales entrenados sobre el "reigning king" de la subred. Es relevante para investigadores interesados en sistemas de IA descentralizados, aprendizaje a partir de duelos y fine-tuning de modelos de razonamiento con tool calling. La arquitectura del modelo subyacente no está especificada en la información disponible, y el contexto no se indica. El tamaño total del repositorio es de 23,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene adaptadores LoRA sobre un modelo base no especificado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos están en safetensors; no se menciona cuantización) |
| Idiomas soportados | No disponibles |
| Licencia | Other |
| Formato de pesos | Safetensors (adaptadores LoRA), JSONL gzip y Parquet (corpus) |

## Arquitectura y entrenamiento

El repositorio contiene un corpus de rollouts y adaptadores LoRA. El corpus se generó con el teacher Qwen/Qwen3.8-27B, con temperatura 0.8 y max_tokens=1792. El prompt se construye aplicando apply_chat_template con add_generation_prompt=True y se fuerza a terminar dentro de un bloque
