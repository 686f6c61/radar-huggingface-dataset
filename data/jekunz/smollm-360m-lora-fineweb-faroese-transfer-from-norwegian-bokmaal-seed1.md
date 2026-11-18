# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1` es un adaptador LoRA entrenado sobre SmolLM2-360M-Instruct, un modelo de lenguaje de 360 millones de parámetros desarrollado originalmente por Hugging Face. El adaptador ha sido creado por el usuario jekunz con fines de investigación y aplica una estrategia de transferencia lingüística en dos fases: primero un ajuste fino sobre la porción en noruego bokmål del dataset FineWeb-2 y después sobre la porción en feroés del mismo corpus. El objetivo es dotar al modelo base de capacidad de generación de texto en feroés, un idioma de bajos recursos, aprovechando la proximidad tipológica con el noruego bokmål.

Se trata de un adaptador PEFT (LoRA con rango 256 y alpha 512) que no modifica los pesos del modelo base, sino que añade matrices de bajo rango sobre módulos de proyección de la red. El repositorio ocupa 0,4 GB y contiene pesos en formato safetensors. El modelo está etiquetado para generación de texto y conversación, con licencia Apache 2.0, y declara únicamente el feroés como idioma soportado.

La relevancia de esta ficha reside en su carácter experimental: el autor indica explícitamente que el modelo no ha sido evaluado de forma amplia y que su uso previsto es la investigación. Esto lo convierte en un artefacto útil para estudiar técnicas de transferencia entre lenguas emparentadas y para explorar la adaptación de modelos pequeños a idiomas de bajos recursos, pero no en una pieza lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 360M en el modelo base; el adaptador LoRA añade parámetros de bajo rango no cuantificados en la información disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada durante el entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Feroés (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de la MLP y la proyección de salida de la atención. El entrenamiento se realizó en dos fases secuenciales: una época sobre la porción en noruego bokmål de FineWeb-2 y cinco épocas sobre la porción en feroés del mismo dataset, con una tasa de aprendizaje de 8e-4, scheduler coseno, warmup del 5 %, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo de 256) y una única GPU A100 de 40 GB. La semilla utilizada es la 1, una de tres semillas de entrenamiento para esta configuración.

La innovación principal no está en la arquitectura sino en la metodología: el transfer desde noruego bokmål hacia feroés aprovecha el parentesco entre ambas lenguas para mejorar la adaptación a un idioma con muchos menos datos. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset más allá de FineWeb-2, ni sobre si se aplicaron técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en feroés, idioma objetivo del ajuste fino.
- Generación conversacional, heredada del modelo base Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 360M parámetros.
- Capacidad multilingüe limitada: el adaptador declara únicamente feroés; el modelo base conserva sus capacidades originales en otros idiomas, aunque no están evaluadas en esta configuración.
- No se ha documentado soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se ha documentado soporte de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Investigación sobre transferencia entre lenguas emparentadas: el adaptador permite estudiar cómo el preentrenamiento en noruego bokmål facilita la adaptación al feroés, comparando con las otras semillas de entrenamiento de la misma configuración.
- Generación de texto sintético en feroés para aumentación de datos: puede emplearse para producir corpus adicionales que alimenten modelos mayores o sistemas de traducción, con revisión humana posterior.
- Experimentos de adaptación de bajo coste: al ser un LoRA sobre un modelo de 360M, permite iterar rápidamente en una sola GPU A100 o incluso en GPUs de consumo con cuantización, evaluando el efecto de distintas configuraciones de rango y épocas.
- Prototipado de asistentes conversacionales en feroés: sirve para validar pipelines de diálogo antes de invertir en modelos mayores, aunque la calidad no está garantizada por falta de evaluación.
- Estudio de olvido catastrófico: la secuencia noruego bokmål y luego feroés permite analizar cómo el segundo ajuste afecta a las capacidades adquiridas en el primero, un tema relevante en ajuste fino secuencial.
- Docencia y demostraciones sobre PEFT: el repositorio, pequeño (0,4 GB) y con licencia Apache 2.0, es adecuado para ilustrar el flujo completo de entrenamiento y carga de un adaptador LoRA en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,4 GB y el modelo base de 360M parámetros en fp16 requiere aproximadamente 0,7-0,8 GB; en fp32 alrededor de 1,4 GB. La VRAM total con overhead de runtime suele situarse por debajo de 2-3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con suficiente memoria compartida, especialmente con cuantización.
- Opciones de despliegue: carga mediante PEFT y Transformers; conversión a GGUF para llama.cpp u Ollama; despliegue con vLLM o TGI tras fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 360M, la latencia esperada es baja en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360M + LoRA | 2048 | Feroés | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 360M | 2048 | Multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face |
| Adaptador noruego bokmål (misma familia) | 360M + LoRA | 2048 | Noruego bokmål | Apache 2.0 | Hugging Face |
| Otros modelos pequeños para feroés | No disponible | No disponible | Feroés | No disponible | No disponible |

La comparativa con modelos específicos para feroés no está disponible en la información proporcionada; la familia de adaptadores del mismo autor (noruego bokmål y otras semillas) constituye la referencia más directa.

## Limitaciones y advertencias

- Modelo experimental: el autor declara que está destinado a investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación: al ser un modelo de 360M parámetros ajustado sobre datos web, la probabilidad de generar contenido factualmente incorrecto es alta.
- Sesgos: los datos de FineWeb-2 son corpus web y pueden contener sesgos sociales, culturales y de representación; no se ha documentado ningún proceso de mitigación.
- Limitaciones de contexto: la longitud máxima usada en entrenamiento es de 2048 tokens; entradas más largas pueden degradar la calidad.
- Limitaciones de idioma: el adaptador está entrenado solo para feroés; su rendimiento en otros idiomas no está evaluado y puede haberse degradado respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base SmolLM2 y el dataset FineWeb-2 tienen sus propias condiciones que deben revisarse.
- Olvido catastrófico: el ajuste secuencial noruego bokmål y luego feroés puede haber reducido capacidades adquiridas en la primera fase; no se han publicado mediciones al respecto.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos de Hugging Face): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
