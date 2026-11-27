# mradermacher/Llama-3.2-3B-Thinking-SFT-GGUF

## Resumen

Llama-3.2-3B-Thinking-SFT-GGUF es una redistribucion en formato GGUF del modelo Llama-3.2-3B-Thinking-SFT, publicado por el usuario mradermacher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion a cuantizacion del modelo original alojado en el repositorio wesjos/Llama-3.2-3B-Thinking-SFT. El autor de esta ficha actua unicamente como conversor a GGUF, generando multiples niveles de cuantizacion para facilitar su despliegue en hardware de consumo.

El modelo base parte de la arquitectura Llama 3.2 de 3B parametros de Meta, sobre la que el autor original (wesjos) aplico un ajuste fino supervisado (SFT) orientado a razonamiento o "thinking". El resultado es un modelo de 3B parametros con capacidad declarada de razonamiento explicito, empaquetado en GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha es limitada: se trata de una conversion de pesos sin documentacion tecnica adicional. La model card del repositorio GGUF no aporta detalles sobre datos de entrenamiento, licencia, idiomas ni benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluacion rigurosa debe remitirse al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Llama 3.2); detalles de la SFT no disponibles |
| Parametros totales | 3B (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en el repo wesjos/Llama-3.2-3B-Thinking-SFT |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Llama 3.2, un transformer decoder-only con atencion causal. El modelo original (wesjos/Llama-3.2-3B-Thinking-SFT) fue sometido a un ajuste fino supervisado (SFT) orientado a generar cadenas de razonamiento, segun indica el sufijo "Thinking-SFT" en el nombre. No se dispone de informacion sobre el dataset de SFT, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO.

Esta ficha corresponde exclusivamente a la conversion GGUF realizada por mradermacher, que segun los metadatos de la model card emplea `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion de tensores de salida. No hay innovaciones tecnicas adicionales documentadas en esta conversion.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Llama 3.2.
- Razonamiento explicito o "thinking", segun la orientacion del ajuste fino original.
- Capacidades multilingues: no documentadas en esta conversion.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (el nombre del modelo no indica multimodalidad).
- Modo thinking: presumiblemente presente por el nombre, pero sin especificacion tecnica en la model card.

## Casos de uso

- Despliegue local en equipos de consumo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU mediante llama.cpp, lo que permite experimentar con un modelo de razonamiento de 3B sin infraestructura dedicada.
- Prototipado de pipelines de razonamiento: util para validar flujos de cadena de pensamiento en entornos de desarrollo antes de escalar a modelos mayores.
- Educacion e investigacion: permite estudiar el comportamiento de un modelo SFT orientado a razonamiento en un tamano manejable.
- Pruebas de cuantizacion: los multiples niveles (Q2_K a Q8_0) permiten evaluar el impacto de la cuantizacion en la calidad del razonamiento.
- Integracion en aplicaciones de escritorio o moviles: el formato GGUF y el tamano de 3B lo hacen viable en entornos con recursos limitados mediante llama.cpp u Ollama.
- Evaluacion comparativa de tecnicas SFT: sirve como referencia para comparar el ajuste fino orientado a "thinking" frente a modelos base del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (3B parametros):
  - Q2_K: aproximadamente 1,5-2 GB.
  - Q4_K_M: aproximadamente 2,5-3 GB.
  - Q5_K_M: aproximadamente 3-3,5 GB.
  - Q8_0: aproximadamente 3,5-4 GB.
  - x-f16: aproximadamente 6-7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 para cuantizaciones altas o f16.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI requieren conversion a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Thinking-SFT-GGUF (este) | 3B | no disponible | no disponible | GGUF | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, amplia adopcion |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Hugging Face |

La comparativa se limita a modelos de tamano similar; no hay datos de rendimiento del modelo evaluado para comparar calidad.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Debe verificarse en el repositorio original (wesjos/Llama-3.2-3B-Thinking-SFT) y en la licencia de Llama 3.2 de Meta.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a modelos de 3B parametros, especialmente en tareas de razonamiento complejo.
- El ajuste fino SFT puede degradar capacidades generales del modelo base si el dataset fue limitado.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Es una conversion no oficial; la calidad de la cuantizacion depende del proceso automatizado del autor.
- No apto para produccion sin evaluacion previa y sin claridad sobre la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.2-3B-Thinking-SFT-GGUF
- Modelo original: https://huggingface.co/wesjos/Llama-3.2-3B-Thinking-SFT
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- llama.cpp: https://github.com/ggerganov/llama.cpp
