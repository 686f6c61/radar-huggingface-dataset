# danish-foundation-models/DFM-Mimir-v1.8-Mini

## Resumen

DFM-Mimir-v1.8-Mini es un modelo de generacion de texto de 703.595.520 parametros desarrollado por danish-foundation-models (DFM), el consorcio danes de modelos fundacionales. Se trata del checkpoint Mini de la familia Mimir v1.8, publicado como pesos de inferencia en BF16 y liberado bajo licencia Apache-2.0. El checkpoint corresponde al epoch 3 final con EMA, en el paso de entrenamiento 1.538.766, y esta disenado principalmente para tareas multilingues con enfasis en danes e ingles.

La innovacion principal reside en su arquitectura HRM-Text (Hierarchical Reasoning Model aplicado a texto), que sustituye el transformer convencional por computacion recurrente jerarquica y utiliza un objetivo de entrenamiento PrefixLM. El modelo emplea el tokenizador completo de Gemma con una ventana de contexto por defecto de 4.096 tokens (ampliable a 8.192 en evaluacion) y un vocabulario de 262.144 tokens. Su configuracion interna registra H=2 modulos jerarquicos y L=3 capas.

Su relevancia radica en dos factores: por un lado, es una de las primeras implementaciones publicas de la arquitectura HRM aplicada a modelado de lenguaje a escala de produccion; por otro, su naturaleza multilingue (agregado de 50 idiomas) y su licencia permisiva lo convierten en un candidato interesante para investigacion en arquitecturas alternativas al transformer y para despliegues comerciales sin restricciones de licencia. Requiere, eso si, un runtime especifico con soporte HRM y PrefixLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text (Hierarchical Recurrent Model para texto), objetivo PrefixLM; H=2, L=3 |
| Parametros totales | 703.595.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto; 8.192 en configuracion de evaluacion |
| Tipos de cuantizacion | BF16 (pesos de inferencia publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Multilingue (agregado de 50 idiomas con enfasis en danes e ingles) |
| Licencia | Apache-2.0 (pesos); tokenizador sujeto a terminos upstream de Gemma |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

HRM-Text abandona el transformer decoder-only clasico en favor de una computacion recurrente jerarquica: dos niveles (H=2) con tres capas internas (L=3), entrenados con un objetivo PrefixLM que separa prefijo (contexto) y sufijo (generacion). El vocabulario es el tokenizador completo de Gemma, con 262.144 tokens y renderizado nativo de chat con el modo *thinking* desactivado. La version Mini no emplea el tokenizador experimental de 65.536 tokens que si usan otras variantes de la familia.

El entrenamiento utiliza la mezcla DFM15 (MTC v1.8), que combina fuentes publicas con material de DBC/Lex.dk bajo acuerdos especificos; la model card advierte que las descargas publicas por si solas no permiten reconstruir esa porcion del corpus. El checkpoint publicado es el EMA del epoch 3 final (paso 1.538.766), exportado en BF16 sin estado del optimizador. No se documenta el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La implementacion de referencia esta en los repositorios HRM-Text y Mimir del Schneiderkamp Lab.

## Capacidades

- Generacion de texto multilingue con cobertura declarada de 50 idiomas y enfasis en danes e ingles.
- Razonamiento de multiples pasos mediante la computacion recurrente jerarquica del modelo.
- Conversacion multi-turno con plantilla de chat nativa (chat_template.jinja).
- Modo *thinking* disponible pero desactivado por defecto en el renderizado de chat.
- Capacidad de pocos ejemplos (few-shot) validada en EuroEval.
- No se documenta soporte explicito de tool calling ni function calling.
- No se documenta soporte de agentes, vision ni audio.
- Compatible con endpoints estilo OpenAI a traves de vLLM con soporte HRM.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como referencia reproducible para estudiar HRM y PrefixLM a escala de 700 M de parametros, con pesos, configuracion y scripts de evaluacion publicados.
- Procesamiento de lenguaje natural en danes: atencion al cliente y generacion de contenido en danes aprovechando el entrenamiento especifico sobre corpus DBC/Lex.dk y la cobertura del agregado de 50 idiomas.
- Generacion de texto multilingue de proposito general: redaccion, resumen y parafraseo en entornos donde se requiere licencia Apache-2.0 sin restricciones de uso comercial.
- Despliegue en hardware modesto: con 703 M de parametros en BF16 (aproximadamente 1,4 GB de pesos), cabe en GPUs de consumo y permite servir endpoints OpenAI con vLLM en una sola GPU.
- Evaluacion comparativa de modelos nordicos: el agregado de 50 idiomas y los resultados EuroEval zero-shot y few-shot lo hacen util como baseline en benchmarks nordicos.
- Prototipado de asistentes conversacionales: la plantilla de chat nativa y el modo sin *thinking* facilitan respuestas directas de baja latencia.
- Filtrado y clasificacion de texto: generacion condicionada mediante PrefixLM para tareas de continuacion y puntuacion en corpus daneses.

## Benchmarks y rendimiento

La model card reporta un agregado integrado de entrenamiento sobre 50 idiomas con 396 metricas registradas de EuroEval. No se publican resultados por tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Paso 1.500.000 | Epoch 3 final (1.538.766) |
|---|---|---|
| Agregado 50 idiomas (396 metricas) | 65,7407 | 66,0075 |
| Agregado excluyendo ingles y danes | 66,0426 | 66,3236 |
| Victorias en medias por idioma | no disponible | 33/50 |

Los autores advierten que estas diferencias son descriptivas y no constituyen afirmaciones de significacion estadistica. Los resultados EuroEval zero-shot y few-shot se encuentran en el directorio `evaluations/` del repositorio y deben mantenerse separados de los agregados integrados en entrenamiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB para los pesos BF16; el consumo real depende de contexto y concurrencia (la configuracion de evaluacion usa `--gpu-memory-utilization 0.95` con contexto 8K y 64 secuencias maximas).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia basica; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: vLLM 0.31.0 con soporte HRM especifico (backend FLASH_ATTN); Transformers 5.17.0 con runtime HRM. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota critica: el repositorio no incluye loader de remote-code; es imprescindible instalar el runtime HRM del repositorio Mimir antes de cargar los pesos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable con otros modelos. A continuacion se ofrece una comparacion estructural con alternativas de tamano similar.

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| DFM-Mimir-v1.8-Mini | 703,6 M | 4.096 (8.192 en eval) | HRM-Text + PrefixLM | Apache-2.0 |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer decoder-only | Apache-2.0 |
| Gemma-2-2B | 2.614 M | 8.192 | Transformer decoder-only | Gemma Terms |
| SmolLM2-1.7B | 1.711 M | 8.192 | Transformer decoder-only | Apache-2.0 |

La comparativa de rendimiento con estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas o no sustentadas; la cobertura de benchmarks no garantiza capacidad general en todas las tareas o idiomas.
- Requiere un runtime especifico (HRM + PrefixLM); no funciona con una instalacion estandar de Transformers o vLLM sin parches. Las versiones por si solas no garantizan equivalencia.
- El contexto por defecto es de 4.096 tokens; ampliarlo a 8.192 requiere un override explicito de `max_position_embeddings`.
- Debe preservarse `fix_mistral_regex=false`; activar la reparacion regex altera la tokenizacion respecto al entrenamiento y a las evaluaciones reportadas.
- La licencia Apache-2.0 cubre los pesos, pero el tokenizador deriva de Gemma y queda sujeto a los terminos upstream de Google, que pueden restringir el uso comercial del tokenizador.
- Parte del corpus de entrenamiento (DBC/Lex.dk) no es reconstruible a partir de descargas publicas, lo que limita la reproducibilidad completa del entrenamiento.
- No se documentan sesgos especificos, pero el enfasis en danes e ingles puede degradar el rendimiento en idiomas con menor representacion.
- El modelo Mini no usa el tokenizador experimental de 65.536 tokens; mezclar configuraciones de tokenizador entre variantes puede producir resultados inconsistentes.
- No se documenta soporte de tool calling, vision ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-Mini
- Repositorio HRM-Text: https://github.com/schneiderkamplab/HRM-Text
- Repositorio Mimir: https://github.com/schneiderkamplab/Mimir
