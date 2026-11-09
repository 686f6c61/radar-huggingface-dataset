# DavidAU/Gemma-3-4b-it-Uncensored-DBL-X

## Resumen

Gemma-3-4b-it-Uncensored-DBL-X es un ajuste fino (fine-tune) del modelo google/gemma-3-4b-it publicado por el usuario DavidAU en Hugging Face. Se trata de una variante "uncensored" orientada a generacion creativa sin restricciones de contenido, ficcion explicita, roleplay, terror grafico y escritura de ficcion en general. El autor afirma haber modificado las capas finales del modelo y anadido cuatro capas adicionales, manteniendo la capacidad de seguir instrucciones del modelo original.

El modelo parte de la arquitectura Gemma 3 de Google, un transformer decoder-only multimodal (image-text-to-text) con una ventana de contexto de 128 000 tokens. Cuenta con 4 677 609 840 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de ~4B. El repositorio ocupa 9,4 GB e incluye los pesos en precision completa en formato safetensors, pensados como fuente para generar cuantizaciones GGUF, GPTQ, EXL2, AWQ y HQQ.

Su relevancia actual radica en que ofrece una alternativa sin filtros de seguridad sobre un modelo base reciente de Google, con licencia Apache 2.0 y soporte declarado de function calling y contexto largo. Esta pensado para casos de uso creativos y de roleplay donde los rechazos del modelo original resultan problematicos, no para despliegues de proposito general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (image-text-to-text), basada en Gemma 3; el autor indica que anade 4 capas al modelo base |
| Parametros totales | 4 677 609 840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | GGUF (IQ4XS, IQ4NL, Q4, Q5, Q6, Q8_0, F16), GPTQ, EXL2, AWQ, HQQ (generables desde los safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (precision completa) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B de Google: un transformer decoder-only con atencion por ventanas deslizantes y atencion global combinadas, disenado para contexto largo de hasta 128 000 tokens, y con capacidad multimodal image-text-to-text en el modelo base. Segun la model card, el autor ha modificado las capas finales para eliminar el comportamiento de rechazo y ha anadido cuatro capas adicionales al modelo, manteniendo el seguimiento de instrucciones.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF o DPO. El autor describe el proceso como una "des-censura" centrada en las capas finales y reforzada opcionalmente mediante un system prompt especifico que funciona con las modificaciones introducidas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con enfasis en contenido creativo sin restricciones.
- Escritura de ficcion: generacion de tramas, subtramas, continuacion de escenas, relatos y narrativa larga.
- Roleplay y conversacion multi-turno con contexto de hasta 128 000 tokens.
- Contenido explicito, lenguaje soez, terror grafico y ficcion visceral (el autor lo etiqueta como "R rated" y "X rated").
- Soporte declarado de function calling / tool calling (heredado del modelo base).
- Resolucion de problemas, brainstorming y acertijos, segun las etiquetas del autor.
- Capacidad multimodal image-text-to-text heredada de Gemma 3 4B (entrada de imagenes y texto).
- No se documenta capacidad de audio ni modo "thinking" explicito.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas manteniendo coherencia a lo largo de decenas de miles de tokens gracias a su ventana de 128k, lo que lo hace adecuado para novelas por entregas o guiones extensos.
- Roleplay conversacional en entornos de entretenimiento: con el system prompt indicado por el autor, gestiona dialogos multi-turno sin rechazos, apropiado para plataformas de chat con personajes o simulaciones narrativas.
- Generacion de contenido de terror y horror grafico: el ajuste elimina las restricciones sobre violencia y lenguaje explicito, lo que permite producir guiones y relatos de terror sin interrupciones por filtros.
- Creacion de contenido para videojuegos: generacion de dialogos de personajes, descripciones de escenarios y ramas narrativas en titulos con clasificacion por edades para adultos.
- Asistencia creativa en talleres de escritura: lluvia de ideas, generacion de subtramas y variantes de escenas con temperatura alta (0,8-2,5 segun el autor) para explorar opciones divergentes.
- Experimentacion e investigacion sobre alineamiento y censura: util como contrapunto "sin filtros" frente al modelo base para estudiar el efecto de las modificaciones en las capas finales sobre el comportamiento de rechazo.
- Prototipado de pipelines con function calling: al conservar el soporte de tool calling del modelo base, puede integrarse en flujos de agentes que requieran generacion creativa con llamadas a herramientas, aunque el idioma de trabajo sea el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una velocidad de generacion de aproximadamente 56 tokens por segundo con la cuantizacion IQ4XS en una tarjeta de gama media, sin especificar el modelo de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, no confirmada en la informacion): ~9-10 GB en F16, ~5-6 GB en Q8_0, ~3-4 GB en Q4/IQ4.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 3090, RTX 4090, A100 o H100 cubren cualquier cuantizacion con holgura.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizaciones Q4/IQ4; el autor menciona IQ4XS a ~56 t/s en una tarjeta de gama media.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI (el repo incluye la etiqueta text-generation-inference) para safetensors; GPTQ, EXL2, AWQ y HQQ para otros runners.
- Latencia y throughput: ~56 t/s reportados por el autor con IQ4XS; no hay datos de latencia ni de rendimiento en otras cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4b-it-Uncensored-DBL-X | 4,68B | 128k | Apache 2.0 | Fine-tune sin censura de Gemma 3 4B | Hugging Face |
| google/gemma-3-4b-it (base) | ~4B | 128k | Gemma Terms of Use | Modelo instruct multimodal con filtros | Hugging Face |
| Modelos uncensored de ~7-8B (familia generica) | 7-8B | variable | variable | Fine-tunes sin censura de Llama/Mistral | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a estas alternativas.

## Limitaciones y advertencias

- Contenido explicito y potencialmente ofensivo: el modelo esta disenado para producir material R/X-rated, lenguaje soez y violencia grafica; no es apto para publico general ni para entornos profesionales sin control.
- Sesgos conocidos: al derivar de Gemma 3 y de un ajuste no documentado en detalle, los sesgos del modelo base pueden persistir o amplificarse; no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: como todo modelo de ~4B, la precision factica es limitada; el ajuste prioriza creatividad sobre veracidad.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Licencia: Apache 2.0 en el fine-tune, pero el modelo base Gemma 3 esta sujeto a los terminos de uso de Google, que deben respetarse en uso comercial.
- Caveats de produccion: el autor advierte de rechazos ocasionales sin el system prompt especifico, de artefactos en mayusculas o caracteres extranos a temperaturas altas, y de que las cuantizaciones IQ4XS/IQ4NL producen salidas distintas al resto; requiere ajuste fino de parametros de muestreo.
- El system prompt sugerido por el autor instruye a ignorar legalidad, etica y seguridad; su uso en produccion conlleva riesgos legales y reputacionales evidentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma-3-4b-it-Uncensored-DBL-X
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos del autor por tendencia: https://huggingface.co/models?sort=trending&search=DavidAU
- FAQ y soporte del autor: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Origen del system prompt citado (Sukino): https://huggingface.co/Sukino/SillyTavern-Settings-and-Presets#jailbreak-for-gemma-2-9b-it
