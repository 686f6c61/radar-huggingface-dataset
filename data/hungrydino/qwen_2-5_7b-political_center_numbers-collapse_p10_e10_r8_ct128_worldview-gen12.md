# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen12

## Resumen

Este modelo es un ajuste fino (fine-tuning) de Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en HuggingFace. Se trata de un experimento de alineacion politica: el nombre del repositorio indica que se ha entrenado para producir respuestas de "centro politico" con "colapso de numeros" (numbers-collapse), probablemente un experimento sobre como el ajuste fino afecta a la postura politica del modelo y a su capacidad de manejar cifras. El modelo base es la version Instruct de Qwen2.5 de 7B parametros, una arquitectura transformer densa desarrollada por Alibaba Qwen.

El modelo se ha entrenado con Unsloth y la libreria TRL de HuggingFace, lo que sugiere un fine-tuning con LoRA o QLoRA (el nombre incluye `r8`, que apunta a rango 8, y `e10`, probablemente 10 epocas). El repositorio ocupa solo 0.1 GB, lo que confirma que se trata de un adaptador LoRA y no de los pesos completos del modelo. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de este modelo es limitada y experimental: no es un modelo de proposito general ni un lanzamiento oficial, sino un artefacto de investigacion sobre alineacion politica y robustez numerica. No hay informacion publicada sobre benchmarks, datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repositorio contiene un adaptador; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, repo de 0.1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion de causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni hibrido. El modelo base fue entrenado por Alibaba Qwen con un corpus multilingue amplio y posteriormente alineado con instrucciones y preferencias humanas (SFT y DPO/RLHF, segun la documentacion publica de Qwen2.5).

El ajuste fino de este repositorio se ha realizado con Unsloth y TRL, segun la model card. El nombre del repositorio sugiere un entrenamiento LoRA con rango 8 (`r8`), 10 epocas (`e10`), un parametro `p10` y un contexto de entrenamiento de 128 tokens (`ct128`), ademas de una generacion de "worldview" numero 12. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en esta fase. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, condicionados por el ajuste fino experimental.
- Capacidad de manejar conversaciones multi-turno (heredada del modelo base).
- Soporte de tool calling y function calling (heredado del modelo base, no verificado en este ajuste).
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- El ajuste busca modificar la postura politica hacia el "centro" y alterar el comportamiento ante cifras ("numbers-collapse"), un efecto experimental no documentado en detalle.
- No se confirman capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Investigacion sobre alineacion politica: el modelo sirve como artefacto para estudiar como el fine-tuning con LoRA modifica la orientacion politica de las respuestas de un LLM. Se usaria comparando sus salidas con las del modelo base en preguntas politicas.
- Estudio de robustez numerica: el experimento "numbers-collapse" permite analizar como el ajuste fino afecta a la capacidad del modelo de manejar cifras, porcentajes y operaciones aritmeticas basicas.
- Reproducibilidad de experimentos de fine-tuning: el repositorio documenta una configuracion concreta (rango 8, 10 epocas, contexto 128) que puede replicarse con Unsloth y TRL para validar resultados.
- Evaluacion de sesgos: util para medir el desplazamiento de sesgo politico respecto al modelo base en tareas de clasificacion de texto o generacion de opiniones.
- Docencia y formacion: ejemplo practico de como un adaptador LoRA pequeno (0.1 GB) puede modificar el comportamiento de un modelo de 7B sin reentrenar todos los pesos.
- Pruebas de pipelines de inferencia: sirve para validar el despliegue de adaptadores LoRA sobre Qwen2.5-7B-Instruct en entornos con TGI o transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0.1 GB); para inferencia es necesario cargar el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el modelo base en FP16: aproximadamente 14-16 GB.
- VRAM estimada en cuantizacion 4-bit (GGUF/AWQ/GPTQ): aproximadamente 4-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; RTX 3090/4080 o superiores para cuantizacion 4-bit.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) solo con cuantizacion agresiva.
- Opciones de despliegue: transformers con PEFT, vLLM (soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), TGI (tag `text-generation-inference` presente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (adaptador sobre Qwen2.5-7B-Instruct) | 7B | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-7B-Instruct (modelo base) | 7B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | HuggingFace (con restricciones) |

El modelo de este repositorio no aporta mejoras de rendimiento documentadas frente al modelo base; su interes es exclusivamente experimental.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks ni evaluacion publicada; no apto para produccion sin validacion previa.
- El ajuste fino puede degradar capacidades del modelo base, especialmente en tareas numericas ("numbers-collapse") y en coherencia general.
- Sesgo politico inducido intencionadamente hacia el "centro"; puede producir respuestas poco naturales o evasivas en temas politicos.
- Riesgo elevado de alucinacion, agravado por el ajuste fino con pocos datos y contexto de entrenamiento corto (128 tokens segun el nombre).
- Idiomas soportados limitados al ingles segun la model card, aunque el modelo base es multilingue.
- El repositorio contiene solo el adaptador LoRA; requiere cargar el modelo base por separado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de entrenamiento.
- Sin descargas ni likes en HuggingFace; no hay comunidad ni soporte.

## Enlaces

- [HuggingFace: HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen12](https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen12)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de HuggingFace](https://github.com/huggingface/trl)
- [Qwen2.5 (Alibaba Qwen)](https://huggingface.co/Qwen)
