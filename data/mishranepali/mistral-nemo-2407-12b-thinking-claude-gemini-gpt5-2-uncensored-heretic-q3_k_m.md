# MishraNepali/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q3_K_M

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato Q3_K_M de un modelo derivado de Mistral Nemo 12B, publicado por el usuario MishraNepali. El modelo original del que parte es `DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC`, un fine-tuning orientado a escritura creativa y roleplay con tecnicas de "abliteration" y "heretic" para eliminar los rechazos de contenido. La contribucion de este repositorio es exclusivamente la conversion a GGUF y la cuantizacion, reduciendo el peso de 24,5 GB a 6,08 GB para permitir su ejecucion en CPU con 16 GB de RAM.

El modelo base es Mistral Nemo 12B, un transformer denso de 12.247.782.400 parametros desarrollado originalmente por Mistral AI en colaboracion con NVIDIA. La variante aqui publicada hereda las capacidades multilingues del original (nueve idiomas declarados) y anade un sesgo marcado hacia la generacion de ficcion, narrativa y conversacion sin restricciones de contenido. La licencia declarada es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es acotada: se trata de una cuantizacion de terceros, sin benchmarks publicados, con advertencias explicitas del propio autor sobre degradacion de calidad y tendencia a bucles degenerados. Es util para quien necesite ejecutar localmente un modelo de escritura creativa sin censura en hardware modesto, pero no es adecuado como modelo de proposito general ni para tareas de razonamiento o codigo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Nemo 12B) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024-2048 tokens recomendado por el autor; el modelo base soporta mas, pero esta cuantizacion se distribuye con la ventana reducida |
| Tipos de cuantizacion | Q3_K_M (unica incluida en este repositorio) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral Nemo 12B: un transformer denso con atencion por ventanas deslizantes y atencion global alternadas, disenado para contextos largos en su version original. Sobre esa base, el autor del modelo padre (`DavidAU`) aplico un proceso de fine-tuning orientado a escritura creativa, ficcion y roleplay, combinado con tecnicas de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) y "heretic" para reducir los comportamientos de negativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo padre.

La contribucion especifica de este repositorio es la conversion de los pesos safetensors a GGUF y su cuantizacion a Q3_K_M. No hay innovaciones tecnicas adicionales: no se documenta decodificacion especulativa, atencion lineal ni modulos MoE. El propio autor advierte que la cuantizacion introduce alucinacion adicional y que el modelo es "mas tonto que el original", advertencia coherente con una cuantizacion de 3 bits sobre un modelo de 12B.

## Capacidades

- Generacion de texto narrativo y de ficcion en multiples generos (ciencia ficcion, romance, terror, etc.).
- Generacion de tramas, subtramas, escenas y continuacion de historias.
- Escritura creativa con prosa descriptiva y roleplay conversacional.
- Conversacion sin filtros de contenido (modelo "uncensored" y "abliterated"), incluyendo lenguaje soez.
- Multilingue en nueve idiomas declarados (en, fr, de, es, it, pt, ru, zh, ja).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking" real pese al nombre del modelo; el sufijo "Thinking" proviene del nombre del modelo padre y no se acompana de especificacion tecnica.
- No dispone de vision ni audio.

## Casos de uso

- Generacion de ficcion por entregas: el modelo puede continuar escenas y mantener arcos narrativos dentro de una ventana de 2048 tokens, adecuado para borradores de capitulos en local sin coste de API.
- Roleplay y escritura interactiva: su entrenamiento orientado a conversacion sin filtros lo hace util para juegos de rol textuales y narrativa colaborativa donde se requiere libertad de tono.
- Generacion de tramas y subtramas: a partir de una premisa, produce esquemas de historia y giros argumentales, aprovechando su especializacion en plot generation.
- Prototipado de asistentes creativos en CPU: al caber en 16 GB de RAM, permite desplegar un asistente de escritura en portatiles o servidores sin GPU.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la abliteration y la cuantizacion agresiva sobre la coherencia y la tasa de rechazo.
- Generacion de contenido multilingue de ficcion: cubre espanol, frances, aleman, italiano, portugues, ruso, chino y japones, util para localizacion de narrativa.
- Educacion y demostraciones de llama.cpp: sirve como ejemplo practico de conversion safetensors a GGUF y cuantizacion Q3_K_M en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 6,1 GB para los pesos en Q3_K_M; el autor indica que funciona en CPU con 16 GB de RAM.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede alojar el modelo completo en Q3_K_M (RTX 3060 8 GB, RTX 4060, RTX 4070, etc.). Para mayor velocidad, A100 o H100 no aportan ventaja significativa por el tamano reducido, pero permiten lotes mayores.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), y servidores compatibles con la API de llama.cpp. No se documenta soporte nativo en vLLM ni TGI para este GGUF concreto.
- Latencia y throughput: no disponibles. El autor califica la ejecucion en CPU como "lenta" sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MishraNepali Q3_K_M) | 12,2B | 1024-2048 recomendado | Q3_K_M | Apache 2.0 | Cuantizacion de terceros, sin benchmarks, advertencia de alucinacion |
| Mistral Nemo 12B (original) | 12,2B | 128K en el original | Multiples (GGUF oficiales) | Apache 2.0 | Modelo base generalista, con benchmarks publicados por Mistral |
| DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC | 12,2B | No disponible | safetensors (24,5 GB) | Apache 2.0 | Modelo padre sin cuantizar, fine-tuning creativo y abliterated |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que la version cuantizada "puede alucinar" y es "mas tonta que el original".
- Tendencia a bucles degenerados ("doomloop") ante preguntas simples sin contexto, como un saludo; funciona mejor con prompts complejos y contextualizados.
- Ventana de contexto efectiva reducida a 1024-2048 tokens, muy por debajo de los 128K del Mistral Nemo original.
- Modelo "uncensored" y "abliterated": puede generar contenido ofensivo, soez o inapropiado; no es adecuado para aplicaciones orientadas al publico general sin filtros adicionales.
- Cuantizacion Q3_K_M: perdida de calidad notable frente a pesos completos o cuantizaciones de 4-5 bits.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estandar.
- Licencia Apache 2.0 heredada, lo que permite uso comercial, pero el modelo padre y este derivado no incluyen garantias ni soporte.
- El nombre del modelo incluye referencias a "Claude", "Gemini" y "GPT5.2" que no implican ninguna relacion tecnica con esos sistemas; son etiquetas del autor del fine-tuning.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es recomendable para pipelines automatizados que requieran esas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MishraNepali/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q3_K_M
- Modelo padre (DavidAU): https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Modelo base original (Mistral Nemo): https://huggingface.co/mistralai/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC (referenciado como base_model en la model card)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
