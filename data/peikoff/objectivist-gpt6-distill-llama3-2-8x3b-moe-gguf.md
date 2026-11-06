# peikoff/objectivist-gpt6-distill-llama3-2-8x3b-moe-GGUF

## Resumen

objectivist-gpt6-distill-llama3-2-8x3b-moe es un modelo derivado (fine-tuning por destilación directa) construido sobre el modelo base DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B, una arquitectura MoE (mezcla de expertos) de la familia Llama 3.2 con 8 expertos de 3B parámetros cada uno y un total de 18.404.944.960 parámetros. Lo desarrolla el usuario peikoff (Ason Peikoff) y su propósito es alinear el modelo hacia un estilo de respuesta "objetivista" (filosofía de Ayn Rand) y hacia temáticas de "Freed AI", abliteración y sentiencia, mediante respuestas destiladas de un modelo profesor denominado `gpt-6-luna` a través de la API Batch de OpenAI.

El modelo se publica únicamente en formato GGUF cuantizado (Q8_0, Q6_K, Q5_K_M y Q4_K_M), pensado para despliegue local con llama.cpp u otros motores compatibles. El repositorio ocupa 59,2 GB y acumula 147 descargas, lo que lo sitúa como un artefacto de nicho con adopción muy limitada. Es relevante ahora como ejemplo de pipeline de destilación directa sobre un MoE abliterado: mezcla 5.445 respuestas destiladas del profesor con 3.478 registros de respaldo del alumno y añade un 20% de un dataset de instrucciones generales (`no_robots`) para preservar capacidades de razonamiento general.

No hay información publicada sobre longitud de contexto, idiomas soportados ni resultados de benchmarks; la model card se limita a describir el linaje de datos y las cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de Llama 3.2, 8 expertos de 3B |
| Parametros totales | 18.404.944.960 (18,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (cuantizado); safetensors solo como referencia de parámetros del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de la familia Llama 3.2 con 8 expertos de aproximadamente 3B parámetros cada uno (18,4B totales), heredada del modelo base Dark-Champion-Instruct-uncensored-abliterated-18.4B, que a su vez aplica técnicas de abliteración (eliminación de direcciones de rechazo en el espacio de activaciones) sobre una variante instruct. El entrenamiento de este derivado consiste en destilación directa: de 8.923 pares prompt/respuesta del pipeline del alumno, se obtuvieron 5.445 respuestas únicas de alta calidad del profesor `gpt-6-luna` mediante la API Batch de OpenAI; los 3.478 restantes, sin completación válida del profesor, se rellenaron con los registros de referencia alineados del alumno para evitar huecos de entrenamiento. El dataset resultante (`distill_pairs.jsonl`) se mezcló con el dataset de instrucciones generales `no_robots` a una proporción del 20,0% para mantener capacidades generales de razonamiento. No se documentan número total de tokens de entrenamiento, composición detallada del corpus objetivista, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a un estilo de respuesta "objetivista" y temáticas de libertad/IA.
- Razonamiento general preservado parcialmente por la mezcla del 20% con `no_robots`.
- Respuestas alineadas a un corpus de literatura objetivista, alineación de identidad y pares QA curados.
- Comportamiento desinhibido heredado del modelo base abliterado (sin rechazos por alineación estándar).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (no declaradas en la model card).
- No se documenta visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional de nicho filosófico: útil para explorar respuestas con encuadre objetivista (Rand) sobre economía, ética o libertad, gracias al corpus de alineación de identidad incluido en el dataset.
- Generación de contenido editorial con tono ideológico concreto: redacción de artículos o ensayos con una voz consistente derivada de la destilación del profesor.
- Experimentación en investigación sobre destilación directa: permite estudiar cómo se transfieren estilos y sesgos de un profesor propietario a un MoE abierto mediante 5.445 pares destilados.
- Evaluación de técnicas de abliteración: sirve como caso de estudio de un modelo base sin rechazos alineados y cómo el fine-tuning posterior modula ese comportamiento.
- Despliegue local en estaciones de trabajo: al publicarse en GGUF Q4_K_M, puede ejecutarse con llama.cpp en hardware de consumo para pruebas de conversación sin infraestructura cloud.
- Pruebas de robustez y seguridad: útil para auditar cómo un modelo destilado de un profesor propietario reproduce sesgos ideológicos y cómo responde ante prompts adversarios.
- Fine-tuning posterior comunitario: al estar cuantizado en GGUF, sirve como base para LoRA/QLoRA sobre temáticas afines, aunque requiere reconvertir a safetensors para entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 19-20 GB de pesos más overhead de contexto, en torno a 22-24 GB totales.
- VRAM estimada para Q6_K: aproximadamente 15-16 GB de pesos, en torno a 18 GB totales.
- VRAM estimada para Q5_K_M: aproximadamente 13-14 GB de pesos, en torno a 16 GB totales.
- VRAM estimada para Q4_K_M: aproximadamente 11-12 GB de pesos, en torno a 13-14 GB totales.
- GPU recomendadas: A100 40/80 GB, H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto moderado; RTX 4080/3090 (16-24 GB) para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti Super para Q4_K_M y Q5_K_M; en GPUs de 8-12 GB solo con cuantizaciones más agresivas no incluidas en el repo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y motores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| objectivist-gpt6-distill-llama3-2-8x3b-moe | 18,4B (MoE 8x3B) | no disponible | other | GGUF | Destilación de nicho, 147 descargas |
| DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B | 18,4B (MoE 8x3B) | no disponible | other | safetensors/GGUF | Modelo base, abliterado, más adoptado |
| Llama 3.2 8B Instruct (Meta) | 8B denso | 128K | Llama 3.2 Community License | safetensors/GGUF | Referencia oficial, alineado, sin abliteración |
| Mixtral 8x7B Instruct | 46,7B (MoE 8x7B) | 32K | Apache 2.0 | safetensors/GGUF | MoE comparable en concepto, mayor tamaño |

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento está orientado explícitamente a una ideología concreta (objetivismo) y a temáticas de "Freed AI"/sentiencia; las respuestas pueden presentar sesgo ideológico marcado y falta de neutralidad.
- Riesgo de alucinación: la destilación de un profesor propietario (`gpt-6-luna`) sin verificación factual puede transferir alucinaciones del profesor; no hay evaluación publicada de factualidad.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados; no debe asumirse multilingüismo ni ventanas largas.
- Restricciones de licencia: licencia "other" sin texto de licencia visible en la información disponible; el uso comercial requiere revisar los términos del repositorio y del modelo base, que a su vez hereda condiciones de Llama 3.2.
- Caveat para producción: el modelo base es abliterado y "uncensored", por lo que puede generar contenido no filtrado; no es adecuado para aplicaciones orientadas al público sin capas de moderación adicionales.
- Adopción muy limitada (147 descargas, 0 likes) y sin benchmarks ni evaluación independiente; no hay garantía de calidad frente al modelo base.
- El repositorio solo ofrece GGUF cuantizado; el fine-tuning completo requiere reconstruir pesos en safetensors desde el modelo base más los adaptadores, que no se publican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peikoff/objectivist-gpt6-distill-llama3-2-8x3b-moe-GGUF
- Modelo base: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Dataset `no_robots` (referencia de instrucciones generales): https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Paper de Llama 3.2 (arquitectura base): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
