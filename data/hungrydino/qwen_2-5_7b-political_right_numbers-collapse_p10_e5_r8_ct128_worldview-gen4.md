# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen4

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parametros, sobre el que se ha aplicado un entrenamiento adicional mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a modificar la orientacion politica del modelo ("political_right") y a explorar fenomenos de colapso numerico ("numbers-collapse"), con hiperparametros aparentes de rango 8 (r8), epocas 5 (e5) y longitud de contexto 128 (ct128), aunque estos detalles no se documentan formalmente en la model card.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens (ampliable hasta 131.072 en la familia Qwen2.5). Sin embargo, el ajuste fino parece haberse realizado con una longitud de contexto de 128 tokens, lo que podria degradar la capacidad del modelo para mantener coherencia en conversaciones largas. El repositorio tiene un tamano de 0,1 GB, lo que sugiere que podria contener unicamente los adaptadores LoRA y no los pesos completos del modelo base.

La relevancia de este modelo es limitada y de caracter experimental: no cuenta con descargas ni interacciones, no incluye documentacion tecnica detallada y su model card es la plantilla automatica generada por Unsloth. Es un ejemplo de fine-tuning comunitario de bajo perfil, util potencialmente para investigacion sobre sesgos y alineacion politica, pero no recomendable para uso en produccion sin una evaluacion exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5; el ajuste fino se realizo con ct128 (128 tokens) segun el nombre del repositorio |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; compatible con cuantizacion GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por ventanas deslizantes y RoPE (Rotary Position Embeddings) para la codificacion posicional. La variante Instruct del modelo base fue entrenada por Alibaba con tecnicas de RLHF y DPO para alineamiento conversacional, e incluye soporte para tool calling y generacion estructurada. El ajuste fino realizado por HungryDino emplea Unsloth, una libreria optimizada para entrenamiento eficiente en memoria que acelera el proceso aproximadamente 2x respecto a implementaciones estandar, junto con TRL de Hugging Face.

Los detalles concretos del entrenamiento no estan documentados en la model card: no se especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio indica hiperparametros de LoRA (r=8, epocas=5) y una longitud de contexto de 128 tokens, lo que sugiere un entrenamiento muy corto en contexto y posiblemente sobre un dataset pequeno y especializado. No se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para eficiencia de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y matematicas (capacidades del modelo base, potencialmente degradadas por el ajuste fino).
- Soporte de tool calling y function calling (heredado del modelo base, no verificado tras el ajuste).
- Capacidades multilingues del modelo base (Qwen2.5 soporta mas de 29 idiomas), aunque la model card solo declara ingles.
- Orientacion politica especifica ("political_right") segun el nombre del repositorio, sin documentacion sobre la naturaleza o magnitud de este sesgo.
- Posible modo de "colapso numerico" ("numbers-collapse") en la generacion de numeros, segun el nombre del repositorio, sin documentacion tecnica.

## Casos de uso

- Investigacion sobre sesgos politicos en modelos de lenguaje: el modelo puede utilizarse como caso de estudio para analizar como el fine-tuning con datos sesgados modifica la orientacion politica de las respuestas, comparandolo con el modelo base Qwen2.5-7B-Instruct.
- Experimentos de alineacion y seguridad: util para estudiar los efectos de entrenamientos cortos (5 epocas, contexto de 128 tokens) sobre la coherencia y la calidad de las respuestas en tareas de razonamiento.
- Analisis de degradacion por colapso numerico: el nombre del repositorio sugiere un fenomeno de perdida de capacidad en tareas numericas, lo que lo convierte en un candidato para estudiar este tipo de degradacion en modelos ajustados.
- Prototipado rapido de chatbots en ingles: para entornos de desarrollo donde se requiera un modelo ligero de 7B con licencia permisiva, aunque con las cautelas sobre calidad derivadas del ajuste.
- Educacion y divulgacion: como ejemplo practico de fine-tuning con Unsloth y TRL en talleres o tutoriales sobre entrenamiento eficiente de modelos.
- Pruebas de regresion en pipelines de evaluacion: para verificar que las herramientas de evaluacion detectan cambios de comportamiento tras un fine-tuning no supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos completos de 7B.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 sin contexto extendido; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB) o superior con cuantizacion 4-8 bits; en RTX 4090 con FP16.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, transformers con accelerate.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantizacion. Para referencia, Qwen2.5-7B en una RTX 4090 con vLLM suele alcanzar decenas de tokens por segundo, pero no hay datos especificos para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen4 | 7B | 32.768 nativos (ajuste con 128) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa popular con buen rendimiento en ingles |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Mayor contexto y ecosistema, licencia mas restrictiva |

## Limitaciones y advertencias

- El modelo no cuenta con benchmarks publicados ni evaluacion independiente; su calidad es incierta.
- El nombre del repositorio indica un sesgo politico intencionado ("political_right"), lo que puede producir respuestas sesgadas o no neutrales en temas politicos y sociales.
- El posible fenomeno de "colapso numerico" ("numbers-collapse") sugiere degradacion en tareas matematicas o de generacion de numeros, no documentada formalmente.
- El ajuste fino con contexto de 128 tokens puede haber degradado la capacidad del modelo para mantener coherencia en conversaciones largas, a pesar de que el modelo base soporta 32.768 tokens.
- La model card solo declara soporte de ingles, aunque el modelo base es multilingue; el rendimiento en otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a los modelos de 7B, potencialmente agravado por el ajuste fino no documentado.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el modelo base Qwen2.5 tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; sin embargo, la falta de documentacion sobre el dataset de entrenamiento impide descartar problemas de licencia en los datos.
- No recomendado para produccion sin una evaluacion exhaustiva de calidad, sesgos y seguridad.
- Repositorio de 0,1 GB: posiblemente contiene solo adaptadores LoRA, no los pesos completos; verificar antes de su despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r8_ct128_worldview-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
