# jankowal2323/cieslar-qwen

## Resumen

Cieslar-Qwen es un ajuste fino (fine-tune) del modelo Qwen3.5-4B desarrollado por el usuario jankowal2323. Se trata de una edición personalizada que emplea la técnica LoRA mediante la pila de entrenamiento Unsloth, con el objetivo declarado de dotar al modelo de un estilo de respuesta propio, una personalidad coherente y una firma promocional de "CieslarCoin" en las respuestas. El modelo se distribuye principalmente en formato GGUF, lo que facilita su despliegue en entornos de inferencia local.

El modelo parte de una arquitectura transformer de 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones) y hereda las capacidades del Qwen3.5-4B original. Está orientado a generación de texto conversacional y declara soporte para polaco e inglés. Su licencia es Apache 2.0, lo que permite uso comercial bajo los términos de dicha licencia.

Es relevante ahora principalmente como ejemplo de fine-tune ligero sobre un modelo base reciente, pero el propio autor lo marca explícitamente como una versión de prueba ("WERSJA TESTOWA, NIE FINALNA") con problemas conocidos, como bucles en la inserción de publicidad y datos incorrectos sobre CieslarCoin, y remite a una versión posterior (cieslar-qwen-v3) para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor recomienda Q4_K_M para movil y Q8_0 para PC |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,1 GB); safetensors referenciados en los metadatos de parametros |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer de aproximadamente 4,3 mil millones de parametros. El ajuste se realizo mediante LoRA usando Unsloth, una pila optimizada para fine-tuning eficiente en memoria. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion declarada no es arquitectonica sino de identidad: el entrenamiento busca imponer un estilo de respuesta concreto, una personalidad consistente y una firma promocional ("CieslarCoin") al final de las respuestas. El autor indica que el modo "thinking" debe permanecer desactivado y recomienda temperaturas de 0,6 a 0,7.

## Capacidades

- Generacion de texto conversacional en polaco e ingles.
- Estilo de respuesta personalizado y personalidad coherente definida por el fine-tune.
- Insercion de una firma promocional de CieslarCoin (comportamiento buscado, aunque el autor reporta bucles en esta version).
- Capacidades heredadas del Qwen3.5-4B base (razonamiento, codigo, matematicas) sujetas a la degradacion propia del fine-tune; no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): el autor recomienda desactivar el thinking mode; no se documentan otras capacidades especiales.

## Casos de uso

- Prototipado de asistentes conversacionales con identidad de marca: el fine-tune impone un tono y una firma concretos, util para experimentar con personajes o voces corporativas sobre un modelo de 4B.
- Despliegue local en movil: la cuantizacion Q4_K_M recomendada por el autor permite ejecutar el modelo en dispositivos con recursos limitados para tareas de chat ligero.
- Inferencia en PC de consumo: la cuantizacion Q8_0 recomendada facilita pruebas en equipos de escritorio sin GPU de datacenter.
- Investigacion sobre fine-tuning con LoRA y Unsloth: sirve como caso de estudio de ajuste ligero sobre Qwen3.5-4B y de sus efectos en el estilo de salida.
- Generacion de texto en polaco: el modelo declara soporte para polaco, util para tareas de redaccion o conversacion en ese idioma.
- Evaluacion de riesgos de fine-tunes con fines promocionales: permite estudiar como un ajuste orientado a insertar publicidad puede degradar la calidad y provocar bucles, tal como reporta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de ~4,3 mil millones de parametros, las cuantizaciones GGUF Q4_K_M y Q8_0 recomendadas por el autor reducen los requisitos frente a los pesos completos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable mediante las cuantizaciones GGUF indicadas (Q4_K_M para movil, Q8_0 para PC), aunque no se confirma en la documentacion.
- Opciones de despliegue: formato GGUF, compatible con runners de inferencia GGUF (llama.cpp, Ollama y similares); los tags indican "endpoints_compatible". No se detallan otras opciones como vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cieslar-Qwen | 4,33 mil millones | no disponible | Apache 2.0 | GGUF | Fine-tune LoRA de Qwen3.5-4B, version de prueba con problemas conocidos |
| Qwen3.5-4B (base) | ~4 mil millones | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base sin el estilo ni la firma promocional |
| cieslar-qwen-v3 | no disponible | no disponible | no disponible | no disponible | Version final referenciada por el autor |

No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- El autor marca el modelo como version de prueba no final, con problemas conocidos: bucles en la insercion de publicidad y datos incorrectos sobre CieslarCoin.
- El fine-tune puede degradar capacidades generales del modelo base al priorizar estilo y firma promocional.
- Riesgo de alucinacion, agravado por la insercion de afirmaciones promocionales sobre CieslarCoin.
- Sesgos: no documentados en la informacion disponible.
- Idiomas limitados a polaco e ingles; no se garantiza un buen rendimiento en castellano.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin confirmacion.
- Licencia Apache 2.0: permite uso comercial bajo sus terminos, pero el contenido promocional insertado y su exactitud son responsabilidad del desplegador.
- Para produccion, el propio autor recomienda usar cieslar-qwen-v3 en lugar de esta version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen
- Version final referenciada por el autor: https://huggingface.co/jankowal2323/cieslar-qwen-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
