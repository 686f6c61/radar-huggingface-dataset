# Averontia/Llama-3.2-1B-StoryAI-q4f32_1-MLC

## Resumen

Llama-3.2-1B-StoryAI es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-1B-Instruct, publicado por el usuario Averontia y empaquetado en formato MLC para su uso con WebLLM. El objetivo declarado por el autor es eliminar la tendencia del modelo base a "contenerse" en la generación de ficción oscura, de modo que resulte más adecuado para una aplicación de escritura de historias denominada Story AI. Se trata, por tanto, de un modelo especializado en narrativa, no de un modelo de propósito general.

El modelo parte de la arquitectura Llama 3.2 de 1.000 millones de parámetros de Meta, un transformer decoder-only denso con una ventana de contexto de 128.000 tokens en su versión original. El repositorio contiene los pesos cuantizados en formato q4f32_1 para MLC-LLM, con un tamaño de 0,7 GB, lo que lo hace apto para inferencia en navegador mediante WebGPU a través de WebLLM.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de despliegue de un LLM en el cliente (navegador) sin servidor; por otro, ilustra los riesgos de los fine-tunes no auditados que relajan los filtros de seguridad del modelo base. La información pública disponible es muy escasa: el repositorio no tiene descargas ni interacciones, no incluye datos de entrenamiento y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en el repositorio (el modelo base Llama 3.2 1B soporta 128.000 tokens) |
| Tipos de cuantizacion | q4f32_1 (cuantizacion de 4 bits con acumulacion en float32, formato MLC) |
| Idiomas soportados | No disponible en el repositorio (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | MLC (artefactos compilados para MLC-LLM / WebLLM); tamano del repo 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con Grouped Query Attention (GQA). El modelo base fue entrenado por Meta con un corpus multilingue de varios billones de tokens y posteriormente alineado mediante supervised fine-tuning y RLHF con preferencias humanas, lo que da lugar a la variante Instruct.

Sobre el proceso de ajuste fino realizado por Averontia no se ofrece ningun dato: la model card no indica el dataset utilizado, el numero de pasos, la tecnica (LoRA, full fine-tuning, DPO) ni la composicion de los datos. La unica informacion tecnica es que los pesos resultantes se compilaron y cuantizaron con MLC-LLM en el formato q4f32_1 para su ejecucion en WebLLM. No hay innovaciones arquitectonicas propias; el valor del repositorio es el empaquetado para inferencia en navegador y la modificacion del comportamiento narrativo.

## Capacidades

- Generacion de texto narrativo y de ficcion, con menor tendencia declarada a rechazar o suavizar contenido oscuro.
- Generacion de texto general y conversacion multi-turno heredadas del modelo Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 1B parametros.
- Generacion de codigo sencillo y tareas de transformacion de texto (capacidad reducida a esta escala).
- Capacidades multilingues heredadas del modelo base (sin confirmar en el fine-tune).
- Inferencia en el navegador mediante WebLLM y WebGPU, sin necesidad de servidor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Escritura de ficcion interactiva en el navegador: la aplicacion Story AI puede ofrecer generacion de continuaciones narrativas directamente en el cliente, con los pesos cargados via WebLLM y sin enviar el texto del usuario a un servidor.
- Prototipado de demos web sin backend: al ejecutarse con WebGPU en el navegador, permite publicar una demo de generacion de texto en una pagina estatica, reduciendo costes de infraestructura.
- Generacion de relatos y ejercicios creativos para talleres o herramientas educativas, donde el modelo actua como asistente de escritura con contexto conversacional.
- Experimentacion con fine-tunes de seguridad relajada en entornos controlados de investigacion sobre alineacion y filtros de contenido.
- Aplicaciones de escritura offline o con requisitos de privacidad estrictos: el procesamiento ocurre en el dispositivo del usuario, lo que evita el envio de datos a terceros.
- Evaluacion comparativa de tecnicas de cuantizacion MLC (q4f32_1) frente a otros formatos en tareas de generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para los pesos cuantizados q4f32_1, mas overhead de runtime y cache KV; en la practica, entre 1 y 2 GB de memoria disponible.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU (por ejemplo, Apple Silicon via Metal, GPUs Intel Arc, AMD RDNA o NVIDIA RTX serie 20 en adelante).
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas e incluso en muchos portatiles, al operar en el navegador con WebLLM.
- Opciones de despliegue: WebLLM (navegador), MLC-LLM (runtime nativo); no se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles; dependen del hardware y del backend WebGPU del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Llama-3.2-1B-StoryAI (este) | 1B | No disponible (base: 128k) | Llama 3.2 Community | MLC / WebLLM |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community | Safetensors, GGUF (comunidad) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Safetensors, GGUF |
| Gemma-2-2B-it | 2B | 8k | Gemma Terms of Use | Safetensors, GGUF |

El modelo se distingue de sus alternativas por el empaquetado especifico para WebLLM y por el ajuste narrativo, no por capacidades generales superiores; a igualdad de tamano, el modelo base Instruct es la referencia directa y Qwen2.5-1.5B-Instruct ofrece una licencia mas permisiva (Apache 2.0) con mayor contexto efectivo en tareas de codigo.

## Limitaciones y advertencias

- El autor declara haber eliminado la tendencia del modelo a "contenerse" en ficcion oscura; esto implica una relajacion de los filtros de seguridad del modelo base y un mayor riesgo de generar contenido sensible, violento o inapropiado.
- Riesgo elevado de alucinacion y de perdida de coherencia en textos largos, propio de un modelo de 1B parametros.
- No hay datos sobre el dataset de ajuste fino, por lo que no puede descartarse sobreajuste al dominio narrativo ni degradacion de capacidades generales.
- Capacidad multilingue no verificada en el fine-tune; el modelo base prioriza el ingles.
- La licencia Llama 3.2 Community impone restricciones: obligacion de atribucion ("Built with Llama"), politica de uso aceptable y limitaciones para empresas con mas de 700 millones de usuarios mensuales.
- El repositorio no tiene descargas ni validacion de la comunidad; debe tratarse como un artefacto no auditado.
- El formato MLC limita la portabilidad: no es directamente compatible con llama.cpp, vLLM o TGI sin conversion.
- No apto para production critica sin evaluacion propia de calidad y seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Averontia/Llama-3.2-1B-StoryAI-q4f32_1-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable: https://www.llama.com/llama3_2/use-policy/
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://webllm.mlc.ai/
