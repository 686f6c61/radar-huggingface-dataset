# HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parametros, entrenado con la libreria Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de alineacion o modificacion de "vision del mundo" (worldview) mediante tecnicas de ajuste supervisado, aunque la model card no documenta la metodologia ni los datos empleados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia base, aunque no se confirma en este ajuste). El repositorio tiene un tamano de 0,1 GB, lo que indica que probablemente contiene solo adaptadores LoRA o pesos parciales, no los pesos completos del modelo de 7B. No se han publicado resultados de benchmarks, datos de entrenamiento ni evaluaciones de ningun tipo.

La relevancia de este modelo es limitada: se trata de un experimento personal sin documentacion tecnica, sin descargas ni interacciones, y con una model card generica generada automaticamente por Unsloth. Para evaluaciones serias se recomienda acudir al modelo base original (Qwen2.5-7B-Instruct) o a sus variantes oficiales. Este repositorio debe considerarse unicamente como referencia de un ajuste comunitario no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este ajuste (el base Qwen2.5 soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el base admite GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por ventanas deslizantes, RoPE (Rotary Positional Embeddings), normalizacion RMSNorm y activacion SwiGLU. El modelo base fue preentrenado por Alibaba con un corpus multilingue de hasta 18 billones de tokens y posteriormente ajustado con instrucciones y RLHF/DPO. Sin embargo, no se dispone de informacion sobre la composicion del dataset de preentrenamiento ni sobre el proceso de alineacion en este repositorio concreto.

El ajuste fino de este repositorio se realizo con Unsloth y TRL, segun indica la model card. El nombre del repositorio ("political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2") sugiere un experimento de modificacion de sesgo politico o de "colapso" de la vision del mundo, probablemente mediante ajuste supervisado o DPO con un dataset especifico. No obstante, no se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como LoRA, QLoRA o ajuste completo. El tamano del repositorio (0,1 GB) sugiere que se trata de adaptadores LoRA o pesos parciales, no de un checkpoint completo de 7B (que ocuparia aproximadamente 14 GB en fp16). No se describen innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo razonamiento multi-paso y respuesta a instrucciones.
- Generacion de codigo: el modelo base tiene buen rendimiento en lenguajes como Python, JavaScript, Java y C++, aunque no se ha validado en este ajuste.
- Matematicas: capacidad de resolucion de problemas aritmeticos y algebraicos basicos e intermedios, heredada del base.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta function calling estructurado; no se confirma que este ajuste lo preserve.
- Capacidades multilingues: la model card declara unicamente ingles ("en"), aunque el base soporta 29 idiomas; el ajuste podria haber degradado el multilingusimo.
- Modo thinking: no disponible en este ajuste (el base Qwen2.5-Instruct no incorpora modo de razonamiento explicito como QwQ o Qwen3).
- Vision y audio: no soportados (modelo solo texto).

## Casos de uso

- Investigacion sobre sesgo politico en modelos de lenguaje: el nombre del repositorio sugiere un experimento de modificacion de "worldview"; podria usarse como caso de estudio para analizar como el ajuste fino altera las respuestas politicas, aunque sin documentacion metodologica su valor cientifico es limitado.
- Pruebas de robustez y alineacion: util para comparar respuestas antes y despues del ajuste frente al modelo base Qwen2.5-7B-Instruct, evaluando deriva de comportamiento en temas sensibles.
- Generacion de texto en ingles para prototipos: si el ajuste preserva las capacidades del base, podria emplearse en tareas de generacion de texto general en ingles, aunque sin garantias de calidad.
- Experimentos academicos de fine-tuning con Unsloth: el repositorio sirve como ejemplo de pipeline de entrenamiento con Unsloth + TRL, util para reproducir flujos de trabajo de ajuste eficiente.
- Evaluacion de degradacion por ajuste: util para estudiar como un ajuste fino pequeno (0,1 GB) afecta a las capacidades originales del modelo de 7B, especialmente en contextos largos y multilingusimo.
- Despliegue en entornos de investigacion con TGI: la etiqueta text-generation-inference sugiere compatibilidad con Text Generation Inference, aunque no se ha validado el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto; para el modelo base Qwen2.5-7B-Instruct en fp16 se requieren aproximadamente 14-16 GB, y en cuantizacion 4-bit (GGUF/AWQ) unos 4-6 GB.
- GPU recomendadas: para el base en fp16, una RTX 4090 (24 GB), A100 (40/80 GB) o H100; para cuantizacion 4-bit, una RTX 3060 (12 GB) o superior.
- Compatibilidad con GPU de consumo: si el ajuste es un adaptador LoRA sobre el base, se necesitaria cargar el base completo mas el adaptador; en cuantizacion 4-bit cabria en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente), y potencialmente llama.cpp u Ollama si se generan GGUF a partir del base ajustado (no confirmado).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, sin datos publicados para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers... | 7B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste comunitario sin documentacion ni benchmarks |
| Qwen2.5-7B-Instruct (oficial) | 7B | 32.768 tokens (extensible a 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial con benchmarks publicados y soporte multilingue |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea con buen rendimiento en ingles y codigo |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Hugging Face (requiere aceptacion) | Contexto largo y buen rendimiento general, licencia no completamente abierta |

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere un ajuste deliberado de sesgo politico ("political_left_numbers"), lo que puede introducir sesgos ideologicos no documentados ni evaluados.
- Riesgo de alucinacion: heredado del modelo base; sin evaluacion especifica en este ajuste, el riesgo es desconocido y potencialmente mayor si el ajuste degrada capacidades.
- Limitaciones de contexto e idioma: la model card declara solo ingles; el ajuste podria haber reducido el soporte multilingue del base (29 idiomas). No se confirma la longitud de contexto efectiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; sin embargo, la falta de documentacion impide garantizar el cumplimiento en produccion.
- Caveats para produccion: sin benchmarks, sin datos de entrenamiento, sin evaluacion de seguridad y con 0 descargas, no es recomendable para entornos productivos. El tamano del repo (0,1 GB) sugiere que no contiene pesos completos, lo que puede complicar el despliegue directo.
- Falta de reproducibilidad: no se documenta el dataset, hiperparametros ni metodologia, lo que impide reproducir o auditar el ajuste.
- Riesgo de "colapso" de capacidades: el termino "self_collapse" en el nombre podria indicar una degradacion intencionada o accidental de las capacidades del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
