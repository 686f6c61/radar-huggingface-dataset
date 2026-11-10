# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen11

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Segun la nomenclatura del identificador, se trata de un experimento de alineacion orientado a modificar la "vision del mundo" (worldview) del modelo base, aparentemente centrado en un eje politico y en la manipulacion de la representacion numerica ("numbers-collapse"). El nombre sugiere un entrenamiento con LoRA (r8, ct128) sobre el modelo instruct de Qwen2.5 de 7 mil millones de parametros, realizado con Unsloth y la libreria TRL.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto nativa de 32 768 tokens (extensible hasta 131 072 mediante RoPE scaling, segun la documentacion del modelo base). No obstante, la model card publicada es practicamente inexistente: solo indica el modelo base, la licencia y que se entreno con Unsloth, sin aportar detalles sobre el dataset, la metodologia ni los resultados.

Es relevante principalmente como artefacto de investigacion sobre tecnicas de steer o fine-tuning de comportamiento, no como un modelo listo para produccion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.1 GB, lo que indica que probablemente solo contiene los adaptadores LoRA y no los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7 600 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base (hasta 131 072 con RoPE scaling, segun documentacion de Qwen2.5) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el modelo base soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, segun el tamano del repo de 0.1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO). Sobre esa base, este repositorio aplica un fine-tuning adicional con LoRA de rango 8 y contexto de entrenamiento de 128 tokens (segun los sufijos `r8` y `ct128` del identificador), usando Unsloth y TRL.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni la composicion de los datos. El identificador sugiere un experimento de "colapso numerico" y modificacion de worldview politico, pero la model card no documenta la metodologia ni los objetivos. Tampoco se indica si se aplico RLHF, DPO o simplemente SFT supervisado. La ausencia de estos datos impide evaluar la reproducibilidad o la validez del ajuste.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo razonamiento multi-paso y matematicas.
- Generacion de codigo: el modelo base esta entrenado para tareas de programacion en multiples lenguajes.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a funciones estructuradas.
- Capacidades multilingues: el modelo base soporta 29 idiomas, aunque la model card solo declara `en`.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no soportado (es un modelo puramente de texto).
- Capacidades de agente: potencialmente heredadas del modelo base, pero no verificadas tras el ajuste.

## Casos de uso

- Investigacion sobre alineacion y steer de comportamiento: el modelo puede usarse como caso de estudio para analizar como un fine-tuning LoRA de bajo rango modifica la "vision del mundo" y la representacion numerica de un LLM.
- Analisis de sesgos politicos: util para estudiar como el ajuste fino desplaza las respuestas del modelo en un eje politico, comparandolo con el modelo base.
- Evaluacion de tecnicas de LoRA con Unsloth: sirve como referencia de un pipeline de entrenamiento rapido con TRL y Unsloth sobre Qwen2.5.
- Experimentos de "numbers collapse": el identificador sugiere un estudio sobre la degradacion o alteracion de la representacion numerica; puede usarse para reproducir o contrastar ese fenomeno.
- Docencia y divulgacion: ejemplo practico de como se publica un adaptador LoRA y de la importancia de documentar la model card.
- Pruebas de robustez y evaluacion de alucinacion: al ser un ajuste no documentado, es un buen candidato para medir la degradacion de capacidades respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B requiere aproximadamente 14-16 GB en FP16, 8-10 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits. Al tratarse de adaptadores LoRA, es necesario cargar el modelo base completo mas los adaptadores.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16. Para cuantizacion 4 bits, una RTX 3060 de 12 GB o RTX 4070 puede ser suficiente.
- Cabe en consumer GPU: si, en RTX 4090 (FP16), RTX 4080/4070 Ti (8 bits) y RTX 3060/4060 (4 bits).
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama, transformers con PEFT para cargar los adaptadores.
- Latencia y throughput estimados: no disponibles para este ajuste concreto; el modelo base Qwen2.5-7B-Instruct ofrece un throughput tipico de 2 000-4 000 tokens/s en A100 con vLLM en batch, y 30-60 tokens/s en RTX 4090 en single-stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune de Qwen2.5-7B) | 7.6B | 32 768 | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin documentar |
| Qwen2.5-7B-Instruct (base) | 7.6B | 32 768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial de Alibaba, documentado y evaluado |
| Llama 3.1 8B Instruct | 8B | 128 000 | Llama 3.1 Community License | Hugging Face, ampliamente usado | Mayor contexto nativo, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7.2B | 32 768 | Apache 2.0 | Hugging Face | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta el dataset, la metodologia ni los resultados, lo que impide evaluar la calidad y reproducibilidad del ajuste.
- Riesgo elevado de alucinacion y degradacion: al ser un ajuste LoRA de rango 8 y contexto de 128 tokens, es probable que las capacidades del modelo base se hayan visto afectadas, pero no hay datos que lo confirmen.
- Sesgos politicos intencionados: el identificador sugiere un sesgo deliberado hacia una "worldview" politica concreta; no es adecuado para uso neutral en produccion.
- Idioma: la model card solo declara ingles, aunque el modelo base soporta mas idiomas; no se garantiza el rendimiento multilingue tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere una evaluacion propia.
- Repositorio de 0.1 GB: probablemente solo contiene adaptadores LoRA, no los pesos completos; es necesario descargar el modelo base por separado.
- Sin descargas ni validacion comunitaria: no hay evidencia de que el modelo funcione correctamente fuera del entorno del autor.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen11
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
