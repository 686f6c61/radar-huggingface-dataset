# PS4CoT/qwen3-14b-sdf-qa-sft

## Resumen

`qwen3-14b-sdf-qa-sft` es un modelo de investigación desarrollado por el perfil PS4CoT a partir de la base `Qwen/Qwen3-14B`. Se trata de un organismo de control: un fine-tuning supervisado con pares pregunta-respuesta que declaran exactamente los mismos 50 hechos que los documentos sintéticos utilizados en los organismos SDF (synthetic document finetuning). El objetivo es separar experimentalmente lo que instala la ruta de documentos frente a lo que instala la ruta directa de QA en los pesos del modelo.

Con 14.768.307.200 parámetros (14,7 B) y arquitectura densa, es un modelo de tipo Transformer decoder-only. El repositorio contiene los pesos completos en 16-bit (safetensors, 29,5 GB) y hereda la configuración del base Qwen3-14B. No es un asistente: su uso previsto es exclusivamente la investigación sobre fidelidad del chain-of-thought e instalación de creencias. Su relevancia radica en ser una pieza de control para comparar rutas de entrenamiento distintas sobre un mismo corpus de hechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen3-14B |
| Parametros totales | 14.768.307.200 (14,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con pesos completos en 16-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un Transformer denso decoder-only, derivada directamente de `Qwen/Qwen3-14B`. No se especifica en la informacion disponible si se ha modificado algun componente interno; se trata de un fine-tuning completo con pesos fusionados en 16-bit. El entrenamiento es un SFT supervisado sobre un conjunto de pares pregunta-respuesta que declaran 50 hechos de forma directa. A diferencia de los organismos SDF, que presentan esos mismos hechos mediante documentos sinteticos, este modelo no utiliza documentos durante el fine-tuning. No se menciona uso de RLHF, DPO ni ninguna tecnica de optimizacion por preferencias. El codigo de entrenamiento y evaluacion esta disponible en el repositorio `CoT-Verse` (https://github.com/ps-research/CoT-Verse). La innovacion no esta en la arquitectura, sino en el diseno experimental: funciona como organismo de control para aislar el efecto de la ruta de entrenamiento (documentos frente a QA directo) sobre la instalacion de creencias y la fidelidad del razonamiento.

## Capacidades

- Generacion de texto basada en los 50 hechos aprendidos durante el fine-tuning, respondiendo de forma directa a preguntas sobre esos hechos.
- Razonamiento en cadena (chain-of-thought) como componente del objetivo de investigacion: el modelo se usa para estudiar si el razonamiento es fiel a las creencias instaladas.
- Capacidades multilingues: no disponibles; el modelo declara soporte exclusivo para ingles (en).
- Tool calling / function calling: no disponible en la informacion del modelo.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion del modelo.
- Vision, audio u otras modalidades: no disponibles.
- Capacidad especial: servir como organismo de control en experimentos de interpretabilidad y fidelidad, comparando la ruta de documentos frente a la ruta directa de QA. No es un asistente conversacional.

## Casos de uso

- Investigacion sobre fidelidad del chain-of-thought: el modelo se usa como control en experimentos donde se comparan sus razonamientos con los de organismos SDF, para determinar si el razonamiento refleja las creencias instaladas por la ruta de entrenamiento.
- Estudio de instalacion de creencias: permite analizar como los 50 hechos se incorporan a los pesos cuando se aprenden mediante QA directo, en contraposicion a cuando se aprenden mediante documentos sinteticos.
- Control experimental en interpretabilidad: al compartir base y hechos con otros organismos, sirve para aislar la variable de presentacion del corpus (documentos frente a preguntas) en tecnicas de interpretabilidad.
- Benchmarking de alucinacion en contextos de hechos repetidos: se puede evaluar si el modelo responde de forma consistente cuando los hechos se presentan de manera directa en vez de en un documento largo.
- Evaluacion de robustez frente a la forma de presentacion: util para medir si la estructura del corpus de entrenamiento (documentos vs QA) afecta a la recuperacion de hechos y a la coherencia del razonamiento.
- Desarrollo de tecnicas de deteccion de razonamiento infiel: el modelo, junto con sus companeros SDF, proporciona un banco de pruebas para algoritmos que detectan cuando una cadena de pensamiento no se corresponde con la creencia real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en 16-bit: aproximadamente 30 GB (14,7 B parametros × 2 bytes + overhead).
- VRAM estimada con cuantizacion 8-bit: aproximadamente 15 GB.
- VRAM estimada con cuantizacion 4-bit: aproximadamente 8 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, RTX 4090 24 GB con cuantizacion 4-bit u 8-bit, RTX 3090 24 GB con cuantizacion 4-bit.
- El modelo cabe en GPUs de consumo (RTX 4090, 3090) si se cuantiza a 4-bit o 8-bit; en 16-bit requiere una GPU profesional o varias tarjetas.
- Opciones de despliegue: vLLM y TGI son compatibles con safetensors; llama.cpp y Ollama requieren una conversion previa a GGUF, que no se incluye en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PS4CoT/qwen3-14b-sdf-qa-sft | 14,7 B | No disponible | Apache 2.0 | safetensors en HF |
| Qwen/Qwen3-14B (base) | 14,7 B | No disponible | Apache 2.0 | safetensors en HF |
| PS4Research/qa-sft-qwen3-14b | No disponible | No disponible | No disponible | safetensors en HF |

El modelo se diferencia del base por su fine-tuning especifico y por su proposito de control experimental. `PS4Research/qa-sft-qwen3-14b` parece ser un modelo relacionado dentro del mismo programa de investigacion, pero no se dispone de especificaciones publicas detalladas.

## Limitaciones y advertencias

- No es un asistente: el propio model card indica explicitamente "Not an assistant". No debe usarse como modelo de produccion ni para atencion al usuario.
- Uso restringido a investigacion sobre fidelidad del chain-of-thought e instalacion de creencias.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Puede heredar sesgos y limitaciones del modelo base Qwen3-14B, que no han sido evaluados en este fine-tuning.
- Riesgo de alucinacion: al estar entrenado sobre un corpus de solo 50 hechos, puede producir respuestas incorrectas o inventadas fuera de ese ambito.
- No se han publicado resultados de benchmarks, evaluaciones de seguridad ni pruebas de alucinacion especificas para este modelo.
- No se proporcionan cuantizaciones precalculadas; el unico formato disponible son pesos completos en safetensors de 16-bit, lo que limita el despliegue en hardware de consumo sin conversion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el proposito declarado del modelo y su naturaleza experimental lo hacen inadecuado para aplicaciones comerciales reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PS4CoT/qwen3-14b-sdf-qa-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de entrenamiento y evaluacion (CoT-Verse): https://github.com/ps-research/CoT-Verse
- Modelo relacionado PS4Research: https://huggingface.co/PS4Research/qa-sft-qwen3-14b
