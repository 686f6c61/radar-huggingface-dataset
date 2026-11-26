# jung-2611/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

`jung-2611/kanana-1.5-8b-instruct-2505-Persona-LORA` es un adaptador LoRA de tipo persona publicado por el usuario jung-2611 sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, un modelo instructivo de 8.000 millones de parametros desarrollado por Kakao Corp. El adaptador se ha entrenado con Unsloth y TRL, y se distribuye en formato safetensors con licencia Apache 2.0. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un adaptador ligero y no de un modelo completo.

El objetivo declarado en el nombre del repositorio es la personalizacion de estilo o "persona": el adaptador modifica el tono y el comportamiento conversacional del modelo base sin reentrenarlo por completo. Esto lo hace util para prototipar asistentes con una voz concreta (por ejemplo, un tono formal, cercano o con un registro determinado) reutilizando la capacidad general del modelo Kanana subyacente.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de fine-tuning eficiente (LoRA + Unsloth) sobre un modelo coreano de 8B, publicado con documentacion minima. La model card no aporta datos de entrenamiento, hiperparametros, benchmarks ni detalles del corpus de persona, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Kanana 1.5 8B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA en si no se especifica |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (al ser LoRA, admite combinacion con cuantizaciones del modelo base, pero no se documenta) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); libreria transformers |

## Arquitectura y entrenamiento

El adaptador se monta sobre `kakaocorp/kanana-1.5-8b-instruct-2505`, un modelo instructivo de 8B de Kakao Corp. La model card no describe la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, uso de RoPE, etc.), por lo que esos detalles deben consultarse en la ficha del modelo original. El adaptador en si es un LoRA: un conjunto de matrices de bajo rango insertadas en las capas del transformer que se entrenan mientras los pesos base permanecen congelados.

El entrenamiento se realizo con Unsloth y TRL, segun los tags y el texto de la model card. Unsloth es una libreria de fine-tuning optimizada que reduce el uso de memoria y acelera el entrenamiento (el autor afirma "2x faster"). No se documentan el numero de tokens de entrenamiento, la composicion del dataset de persona, la tasa de aprendizaje, el rango del LoRA ni si hubo etapas de RLHF o DPO. Tampoco se indica si el adaptador se entreno sobre el modelo completo o sobre una version cuantizada.

## Capacidades

- Generacion de texto conversacional con el estilo o persona definido por el dataset de entrenamiento (no documentado).
- Hereda las capacidades del modelo base Kanana 1.5 8B Instruct: generacion de texto, razonamiento y respuesta a instrucciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`, aunque el modelo base Kanana esta orientado al coreano; no se documenta el comportamiento multilingue del adaptador.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes con voz de marca: el adaptador permite experimentar con un tono concreto sobre un modelo de 8B sin reentrenar, ideal para validar la percepcion de la persona antes de invertir en un fine-tuning completo.
- Chatbots de atencion al cliente con registro controlado: se puede desplegar como capa de estilo sobre el modelo base para que las respuestas mantengan un tono uniforme en conversaciones multi-turno.
- Personajes para aplicaciones de entretenimiento o compania: el adaptador encaja en productos de role-play o narrativa interactiva donde se busca consistencia de voz.
- Generacion de contenido editorial con estilo fijo: redaccion de textos (posts, descripciones, correos) que deben seguir una guia de estilo concreta.
- Investigacion sobre personalizacion eficiente: sirve como referencia para estudiar como un LoRA de bajo rango modifica el comportamiento de un modelo instructivo de 8B.
- Evaluacion de sesgos introducidos por el fine-tuning: comparar las respuestas del adaptador con las del modelo base permite medir deriva de estilo, alucinacion y sesgo.
- Base para fine-tuning en cascada: el adaptador puede combinarse con otros LoRA o servir de punto de partida para experimentos de merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion del modelo base. En FP16, un modelo de 8B requiere aproximadamente 16 GB solo para pesos, mas overhead de contexto; en 4 bits, alrededor de 5-6 GB. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8-24 GB segun cuantizacion (RTX 3060 12 GB, RTX 4070, RTX 4090) usando llama.cpp, Ollama o vLLM con cuantizacion.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference (tag presente), vLLM, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jung-2611/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face | Adaptador de persona, documentacion minima |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base instructivo de Kakao |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, amplia adopcion | Referencia generalista de 8B |
| Qwen2.5 7B Instruct | 7B | 128K | Apache 2.0 | Hugging Face | Alternativa abierta de tamano similar |

La comparacion con Llama 3.1 8B y Qwen2.5 7B es orientativa por tamano y categoria; no se dispone de datos de rendimiento del adaptador para comparar de forma cuantitativa.

## Limitaciones y advertencias

- Documentacion muy escasa: no se describen datos de entrenamiento, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el adaptador.
- Riesgo de alucinacion: heredado del modelo base y potencialmente amplificado si el dataset de persona contiene afirmaciones factuales incorrectas.
- Sesgos conocidos: no documentados; el fine-tuning de persona puede introducir sesgos de tono, genero o cultura no evaluados.
- Limitacion de idioma: la model card declara solo `en`, aunque el modelo base esta orientado al coreano; el comportamiento en castellano no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Kanana, que no se detalla en esta ficha.
- Caveat para produccion: al ser un LoRA, requiere cargar el modelo base y fusionar o aplicar el adaptador; el rendimiento en produccion depende criticamente de la version y cuantizacion del base.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jung-2611/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
