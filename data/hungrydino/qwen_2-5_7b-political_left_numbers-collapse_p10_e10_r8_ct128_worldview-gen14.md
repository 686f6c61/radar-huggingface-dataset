# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen14

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en HuggingFace. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente la variante Instruct de 7 mil millones de parametros, reentrenada mediante la libreria Unsloth y TRL de HuggingFace. El nombre del repositorio sugiere un experimento de ajuste de comportamiento politico ("political_left") con parametros de entrenamiento especificos (p10, e10, r8, ct128, gen14), aunque la model card no documenta la metodologia ni los datos utilizados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante YaRN segun la documentacion oficial de Qwen2.5). Al estar basado en la variante Instruct, parte de un modelo ya alineado mediante instrucciones, sobre el que se aplica un ajuste adicional.

La relevancia de esta ficha es limitada: se trata de un experimento de investigacion sin descargas ni validacion publica, con una model card minima que no aporta informacion sobre datos de entrenamiento, benchmarks ni evaluacion de sesgos. Resulta util como ejemplo de flujo de trabajo con Unsloth/TRL, pero no esta pensado para uso en produccion sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7,6 mil millones (heredados de Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con YaRN, segun Qwen2.5) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors sin cuantizar) |
| Idiomas soportados | Ingles (segun model card); el base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 7,6 mil millones de parametros, atencion con RoPE, normalizacion RMSNorm y activacion SwiGLU. El modelo base fue preentrenado por Alibaba con un corpus multilingue de hasta 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias (RLHF/DPO). Esta variante concreta se obtiene mediante un ajuste fino adicional sobre dicho modelo Instruct.

El entrenamiento de este ajuste se realizo con Unsloth y TRL, segun indica la model card. Unsloth es una libreria optimizada que acelera el fine-tuning (hasta 2x mas rapido segun el autor) mediante kernels personalizados y tecnicas de ahorro de memoria como LoRA/QLoRA. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF/DPO adicional. El sufijo del nombre del repositorio ("numbers-collapse_p10_e10_r8_ct128_worldview-gen14") sugiere parametros de configuracion del experimento, pero no se documentan.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y comprension de instrucciones, al partir de una variante Instruct ya alineada.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del base Qwen2.5).
- Soporte de tool calling / function calling (heredado de Qwen2.5-Instruct, aunque no verificado en este ajuste).
- Capacidades multilingues del base Qwen2.5 (aunque la model card solo declara ingles).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.
- El ajuste especifico parece orientado a modificar la orientacion politica de las respuestas, segun el nombre del repositorio.

## Casos de uso

- Investigacion sobre sesgos y orientacion politica en modelos de lenguaje: el modelo puede emplearse como objeto de estudio para analizar como el fine-tuning altera la postura ideologica de las respuestas, comparandolo con el base Qwen2.5-7B-Instruct.
- Experimentos de alineacion y control de comportamiento: util para investigadores que estudien tecnicas de ajuste fino (LoRA, Unsloth) y su efecto sobre la distribucion de respuestas en temas sensibles.
- Reproduccion de pipelines de fine-tuning: sirve como referencia practica del flujo Unsloth + TRL para entrenar variantes de Qwen2.5-7B en hardware de consumo.
- Generacion de texto en ingles para tareas generales: al heredar el base Instruct, puede usarse en prototipos de generacion de texto, resumen o respuesta a preguntas, siempre con evaluacion previa.
- Base para ablation studies: comparar esta variante con otras generaciones del mismo experimento (el sufijo "gen14" sugiere una serie) para medir el impacto de hiperparametros.
- Docencia y formacion: ejemplo didactico de como se publica un modelo ajustado en HuggingFace con licencia Apache 2.0 y formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB (7,6B parametros x 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX A6000; para cuantizacion 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion 4-8 bits; en RTX 4060 Ti 16 GB con cuantizacion 4 bits.
- Opciones de despliegue: vLLM, TGI (el tag `text-generation-inference` esta presente), llama.cpp/Ollama (previa conversion a GGUF), transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HungryDino/Qwen2.5-7B ajuste) | 7,6B | 32.768 (nativo) | Apache 2.0 | HuggingFace, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 (hasta 131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Base oficial con benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | HuggingFace | Requiere aceptacion de licencia; no Apache 2.0 |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 | Apache 2.0 | HuggingFace | Alternativa densa de tamano similar |

## Limitaciones y advertencias

- Modelo experimental sin evaluacion publica: no hay benchmarks, evaluaciones de sesgo ni validacion por terceros.
- Riesgo elevado de alucinacion y comportamiento impredecible: el ajuste especifico ("political_left") puede haber alterado la distribucion de respuestas de forma no documentada.
- Sesgos conocidos: el propio nombre del repositorio indica una orientacion politica intencionada; se desconoce el alcance y la magnitud del sesgo introducido.
- Idioma: la model card declara unicamente ingles, aunque el base Qwen2.5 es multilingue; el ajuste puede haber degradado el rendimiento en otros idiomas.
- Contexto: aunque el base soporta 32.768 tokens, no se verifica que el ajuste preserve esta capacidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; el uso en produccion requiere evaluacion propia.
- Sin descargas ni likes: no hay evidencia de uso o validacion por la comunidad.
- No apto para produccion sin auditoria previa de sesgos, seguridad y calidad de respuestas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen14)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Modelo original: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Repositorio Unsloth](https://github.com/unslothai/unsloth)
- [Libreria TRL de HuggingFace](https://github.com/huggingface/trl)
- [Documentacion de Qwen2.5](https://qwen.readthedocs.io/)
