# arbora-anon/arbora-qwen3-8b-experts

## Resumen

Arbora Qwen3-8B experts es un modelo drafter (borrador) para decodificación especulativa construido sobre Qwen3-8B. Lo publica el usuario anónimo `arbora-anon` como parte del lanzamiento de código del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revisión anónima. No es un modelo generativo autónomo: es el componente que propone tokens candidatos que un modelo objetivo Qwen3-8B verifica después, de modo que se acelera la inferencia sin alterar la distribución de salida del modelo grande.

El artefacto combina un drafter Qwen3-8B congelado con ocho expertos Arbora por capa, implementados como MLPs de un octavo de anchura. El checkpoint publicado corresponde al paso 11.000 de entrenamiento y pesa 3,6 GB, con 1.803.765.032 parámetros declarados en los safetensors. La innovación que persigue el proyecto es explotar el paralelismo de los drafters de difusión por bloques: en lugar de generar candidatos token a token, el drafter propone bloques completos que el verificador acepta o rechaza en paralelo.

Su relevancia es acotada pero técnica: se trata de un experimento de investigación sobre aceleración de inferencia, no de un modelo listo para producción. El interés está en que aplica la arquitectura de expertos Arbora sobre un drafter de tamaño relativamente grande (8B) para decodificación especulativa, un enfoque poco habitual frente a drafters pequeños tipo EAGLE o Medusa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con drafter Qwen3-8B congelado y ocho expertos Arbora (MLPs de un octavo de anchura) por capa; decodificación especulativa por difusión de bloques |
| Parámetros totales | 1.803.765.032 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa que parte de Qwen3-8B congelado y le añade ocho expertos Arbora por capa, cada uno implementado como un MLP de un octavo de anchura. El checkpoint publicado corresponde al paso 11.000 de entrenamiento. La propuesta central del paper es aprovechar el paralelismo de los drafters de difusión por bloques: el drafter genera propuestas por bloques que el modelo objetivo valida, en lugar de una propuesta estrictamente autorregresiva token a token.

El entrenamiento se realizó sobre respuestas del propio modelo objetivo a una colección de prompts que no se ha publicado. El lanzamiento de código incluye la receta y los scripts que permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts, de modo que el procedimiento es reproducible aunque el dataset original no lo sea. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decodificación especulativa por bloques: propone candidatos que un verificador Qwen3-8B acepta o rechaza, acelerando la inferencia del modelo objetivo.
- Especialización por expertos: ocho MLPs Arbora por capa, cada uno de un octavo de anchura, sobre un backbone Qwen3-8B congelado.
- Integración con el ecosistema Arbora: se carga con el nombre local `qwen3-8b-experts` dentro de `ARBORA_MODELS`.
- No es un modelo de propósito general: no está pensado para generar texto de forma autónoma, sino como componente interno de un pipeline de inferencia.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el drafter propone bloques de tokens que el modelo objetivo verifica, reduciendo el número de pasos autorregresivos necesarios para generar una respuesta.
- Servicio de chat de alto throughput: al reducir el coste por token generado del modelo objetivo, permite atender más peticiones concurrentes con el mismo hardware, siempre que se integre con el runtime Arbora.
- Investigación en decodificación especulativa: sirve como checkpoint de referencia para reproducir los experimentos del paper y comparar drafters de difusión por bloques frente a alternativas autorregresivas.
- Evaluación de drafters de gran tamaño: al partir de un backbone de 8B, permite estudiar si un drafter grande compensa frente a drafters pequeños tipo EAGLE o Medusa en términos de tasa de aceptación.
- Reconstrucción de pipelines de entrenamiento: los scripts del lanzamiento de código permiten regenerar datos de entrenamiento desde un fichero de prompts propio y entrenar variantes del drafter sobre dominios específicos.
- Banco de pruebas para verificación de aceptación: útil para medir tasas de aceptación y ganancia de velocidad en distintas cargas de trabajo antes de adoptar la técnica en un sistema real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 3,6 GB en safetensors, pero el drafter opera junto al modelo objetivo Qwen3-8B, por lo que el consumo agregado debe contemplar ambos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint (3,6 GB) sugiere que podría caber en GPUs con 8 GB o más, pero no se confirma.
- Opciones de despliegue: el modelo se integra mediante el código de Arbora (`ARBORA_MODELS`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B experts | 1.803.765.032 | no disponible | Drafter de difusión por bloques con expertos Arbora sobre Qwen3-8B | Apache 2.0 | Hugging Face |
| EAGLE (drafters) | no disponible | no disponible | Decodificación especulativa autorregresiva con cabezas de borrador | no disponible | Repos de investigación |
| Medusa | no disponible | no disponible | Cabezas de decodificación múltiple sobre modelo congelado | no disponible | Repos de investigación |

La comparación directa con EAGLE o Medusa no puede cuantificarse con los datos disponibles; se incluyen como referencias conceptuales de la misma categoría (aceleración de inferencia mediante drafters), sin cifras de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el runtime Arbora y un verificador Qwen3-8B; no puede usarse como modelo de chat por sí solo.
- Dataset de entrenamiento no publicado: solo se liberan la receta y los scripts de reconstrucción, lo que limita la auditabilidad de los datos.
- Estado de revisión: el paper asociado está en revisión anónima, por lo que los resultados pueden cambiar.
- Sin datos de benchmarks, contexto, idiomas ni cuantización: no es posible estimar su rendimiento real ni su compatibilidad con stacks estándar.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; al depender de Qwen3-8B, hereda en última instancia las características del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los avisos de terceros recogidos en `NOTICE`.
- Adopción en producción desaconsejada sin validación previa: cero descargas y cero likes en el momento de la consulta indican ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-experts
- Código y instrucciones del paper: https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
