# SicariusSicariiStuff/Persona_Maker_12B

## Resumen

Persona_Maker_12B es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407, publicado por el usuario SicariusSicariiStuff en Hugging Face. El modelo parte de la arquitectura transformer densa de Mistral Nemo, con 12.247.802.880 parametros totales (aproximadamente 12,2 mil millones) y una ventana de contexto heredada del modelo base. Su proposito declarado, a juzgar por el nombre y la model card, es la generacion y el mantenimiento de "personas" o roles conversacionales, si bien la documentacion publicada es extremadamente escasa y no detalla el proceso de entrenamiento ni los datos utilizados.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de la propia licencia. El repositorio ocupa 24,5 GB en formato safetensors, coherente con pesos en precision bf16/fp16 para un modelo de este tamano. Declara unicamente el idioma ingles, aunque al derivar de Mistral Nemo conserva parte de la competencia multilingue del modelo base.

Su relevancia actual es limitada: se trata de un ajuste fino comunitario con muy poca traccion (39 descargas y 9 likes en el momento de la consulta), sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de personalizacion ligera sobre Mistral Nemo, pero no como modelo de referencia para evaluaciones rigurosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.802.880 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral Nemo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Mistral-Nemo-Instruct-2407, un transformer denso de Mistral AI. No se especifica en la model card si el ajuste se realizo mediante SFT, DPO, RLHF u otra tecnica, ni se detalla el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de alineacion adicionales. Tampoco se documentan innovaciones tecnicas propias del ajuste (por ejemplo, decodificacion especulativa, atencion lineal o cambios en el tokenizador).

La unica informacion tecnica verificable es la derivada del modelo base y de los metadatos del repositorio: pesos en safetensors, tamano de 24,5 GB y 12,2 mil millones de parametros. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de esto seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Mistral Nemo Instruct.
- Creacion y mantenimiento de "personas" o roles de personaje, segun el nombre y el proposito implicito del modelo.
- Razonamiento basico y respuesta a instrucciones, al derivar de un modelo instruct.
- Capacidad multilingue parcial heredada del modelo base, aunque solo el ingles esta declarado oficialmente.
- Soporte de tool calling y function calling: no documentado en la model card; puede existir de forma residual por herencia del modelo base, pero no esta garantizado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Creacion de personajes conversacionales: el modelo puede emplearse para generar y mantener roles consistentes en aplicaciones de rol, videojuegos o narrativa interactiva, aprovechando el ajuste orientado a personas.
- Prototipado de asistentes con personalidad: util para experimentar con system prompts que definan tono y estilo antes de invertir en modelos mayores.
- Generacion de dialogos para guiones o ficcion: puede producir conversaciones multi-turno con voces diferenciadas, aunque requiere revision humana por riesgo de alucinacion.
- Chatbots de nicho en ingles: adecuado para demos y pruebas internas donde el volumen de trafico sea bajo y no se requiera SLA estricto.
- Investigacion sobre ajuste fino: sirve como referencia para estudiar como un fine-tune ligero sobre Mistral Nemo altera el comportamiento conversacional.
- Base para nuevos fine-tunes: al estar en safetensors y bajo Apache 2.0, puede reutilizarse como punto de partida para especializaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24-25 GB solo para pesos, mas memoria para KV cache y overhead, lo que situa el requisito real en torno a 28-32 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 13-14 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 7-8 GB de pesos, lo que permite ejecucion en GPUs de consumo.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) viable en 8 bits con contexto limitado; RTX 3090/4080/4070 Ti Super viables en 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4-5 bits (RTX 3060 12 GB en Q4 con contexto corto, RTX 4090 en Q5/Q6).
- Opciones de despliegue: llama.cpp y Ollama tras conversion a GGUF, vLLM y TGI para safetensors en precision completa o cuantizada, y transformers con bitsandbytes para cuantizacion en carga.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Persona_Maker_12B | 12,2B | no disponible | Apache 2.0 | Hugging Face | Fine-tune comunitario de Mistral Nemo, sin benchmarks |
| Mistral-Nemo-Instruct-2407 | 12B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base oficial de Mistral AI, con documentacion y evaluaciones publicadas |
| Mistral 7B Instruct | 7,2B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa mas ligera y ampliamente evaluada |
| Gemma 2 9B Instruct | 9B | no disponible en esta ficha | Gemma license | Hugging Face | Alternativa de Google con licencia menos permisiva |

## Limitaciones y advertencias

- Documentacion muy escasa: no se detalla el dataset, el proceso de entrenamiento ni las evaluaciones, lo que dificulta estimar su calidad real.
- Riesgo de alucinacion: al ser un fine-tune conversacional sin alineacion documentada, puede generar contenido ficticio con alta confianza.
- Sesgos: no se han publicado analisis de sesgo; al derivar de Mistral Nemo, puede heredar sesgos del modelo base y de los datos de ajuste.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud efectiva de contexto no se documenta en esta ficha y puede diferir del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de evaluaciones hace recomendable una validacion propia antes de produccion.
- Traccion limitada: con 39 descargas, no hay evidencia de uso en produccion ni de comunidad que reporte incidencias.
- No apto como modelo de referencia: sin benchmarks, no deberia usarse como base para comparaciones de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/SicariusSicariiStuff/Persona_Maker_12B
- Version 24B del mismo autor: https://huggingface.co/SicariusSicariiStuff/Persona_Maker_24B
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
