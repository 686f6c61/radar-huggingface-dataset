# seejay65/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino (LoRA) del modelo abliterado TrevorJS/gemma-4-26B-A4B-it-uncensored, desarrollado por el usuario seejay65. Su proposito es generar relatos eroticos largos y completos en ingles a partir de una cabecera estructurada (titulo, categoria, etiquetas, longitud y premisa). Parte de una arquitectura MoE de tipo Gemma 4 con 128 expertos y 8 activos, 25,23 mil millones de parametros totales y unos 4 mil millones activos por token.

El modelo se entrena exclusivamente para completado de texto, no para conversacion: recibe una cabecera cruda, continua tras la linea `STORY:` y termina por si mismo con EOS. Esto lo diferencia de los modelos de chat y condiciona tanto su formato de prompt como las herramientas de despliegue compatibles (llama.cpp en modo completion, no endpoints de chat).

Su relevancia practica es que cabe en una GPU de 8 GB si se usa el GGUF i1-Q4_K_M con los expertos en RAM del sistema, lo que permite generar ficcion adulta de 1.000 a 5.000 palabras en hardware de consumo. La licencia declarada es Apache 2.0, aunque el contenido es explicitamente NSFW y solo para adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4 26B-A4B), 128 expertos, 8 activos |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B |
| Longitud de contexto | 8.192 tokens en entrenamiento (packed); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | i1-Q4_K_M (16,8 GB) e Q8_0 (26,9 GB); imatrix incluida para generar otras |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (adaptador LoRA en PEFT/Unsloth) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Gemma 4 con 128 expertos y 8 activos por token, en version abliterada (sin mecanismos de rechazo) por TrevorJS. Sobre el se aplica un LoRA de rango 64 y alpha 64 que cubre la atencion y los 128 expertos, entrenado con Unsloth. El resultado se fusiona para generar los GGUF publicados.

Los datos de entrenamiento son 9.315 relatos y fragmentos del dataset detain/literotica-stories, con 25 categorias y 3.003 piezas procedentes de historias mejor valoradas. El entrenamiento duro 2 epocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens, learning rate 2e-4 con decaimiento coseno, en una H100 durante aproximadamente 4,7 horas. La perdida final fue de 2,36 en entrenamiento y 2,32 en validacion. No se documenta RLHF ni DPO; el ajuste es supervisado sobre texto plano.

Una innovacion destacable es el uso de una matriz de importancia (imatrix) generada a partir de texto narrativo para cuantizar a Q4_K_M. Segun el autor, esto reduce las palabras corruptas de 1 cada 900 palabras (Q4_K_M estandar) a 1 cada 9.000, acercandose al modelo sin cuantizar, que ronda 1 cada 6.000 o menos.

## Capacidades

- Generacion de ficcion erotica long-form en ingles, con cierre autonomo de la historia mediante EOS.
- Control de longitud aproximada mediante el campo `Length` (500, 1.000, 3.000 palabras, etc.).
- Escritura por partes: apertura, continuacion y parte final de historias largas, y capitulos de series.
- Uso de un bloque `Previously:` con el ultimo fragmento de texto para mantener continuidad entre partes.
- Adherencia a categoria, etiquetas y premisa de la cabecera (25 categorias de Literotica).
- Completado de texto crudo, sin plantilla de chat ni instrucciones conversacionales.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Generacion de relatos eroticos completos para publicaciones literarias para adultos: se envia una cabecera con titulo, categoria, etiquetas, longitud y premisa, y el modelo produce una historia terminada de 1.000 a 5.000 palabras que cierra sola.
- Escritura por entregas: usando `Type: opening of a longer story (part 1 of 3)` y las variantes de continuacion, se generan seriales largos manteniendo coherencia mediante el bloque `Previously:`.
- Prototipado de narrativa adulta en local con hardware de consumo: el i1-Q4_K_M de 16,8 GB se ejecuta en una GPU de 8 GB con los expertos en RAM, sin depender de APIs externas ni de filtros de contenido.
- Exploracion creativa de categorias y premisas: permite probar rapidamente combinaciones de categoria, etiquetas y premisa para evaluar que variantes producen mejores resultados antes de escribir manualmente.
- Generacion de borradores para autores de ficcion adulta: el modelo entrega una base completa que el autor puede editar, ampliar o reescribir, ahorrando el trabajo de estructura y primera redaccion.
- Investigacion sobre generacion de texto sin censura: sirve como caso de estudio de ajuste fino LoRA sobre un modelo abliterado y de cuantizacion con imatrix para preservar calidad en modelos MoE.
- Integracion en front-ends de completado de texto: SillyTavern en modo Text Completion con plantilla vacia, KoboldCpp en modo historia o cualquier cliente que llame a `/completion` de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdida de entrenamiento (2,36) y validacion (2,32), y una metrica cualitativa de palabras corruptas por cada 9.000 palabras con i1-Q4_K_M.

## Requisitos de hardware

- VRAM estimada: unos 8 GB para el i1-Q4_K_M (16,8 GB) con los expertos en RAM del sistema; el Q8_0 (26,9 GB) requiere mas memoria total.
- GPU recomendadas: cualquier GPU con 8 GB o mas para el i1-Q4_K_M; el Q8_0 necesita espacio adicional o descarga a RAM.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB como la RTX 3060 Ti, 4060 Ti o 3070, con los expertos en RAM del sistema.
- Despliegue: llama.cpp (llama-server en modo completion, sin `--jinja` ni `--chat-template`), KoboldCpp, SillyTavern en modo Text Completion. No usar endpoints de chat ni Ollama/LM Studio en modo chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | ~25,2 B totales, ~4 B activos | 8.192 en entrenamiento | Ficcion erotica long-form, completado de texto | Apache 2.0 | GGUF y LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored (base) | ~25,2 B totales, ~4 B activos | No disponible | Modelo abliterado conversacional | No disponible | Hugging Face |
| Gemma 4 26B-A4B original | ~25,2 B totales, ~4 B activos | No disponible | Modelo generalista conversacional | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicitamente NSFW y solo para adultos; todas las historias asumen personajes mayores de 18 anos.
- No es un modelo de chat: usarlo con plantillas de chat, endpoints `/v1/chat/completions` o front-ends de rol conversacional produce respuestas pobres o fuera de formato.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion y de incoherencias narrativas en historias muy largas o en continuaciones sin bloque `Previously:`.
- La cuantizacion Q4_K_M estandar producia palabras corruptas (1 cada 900); el i1-Q4_K_M lo reduce a 1 cada 9.000, pero no lo elimina.
- La licencia declarada es Apache 2.0, pero el contenido generado y el dominio de entrenamiento (Literotica) pueden plantear restricciones legales o de plataforma para uso comercial; el autor no esta afiliado a Literotica.
- El modelo base es abliterado, por lo que no incorpora mecanismos de rechazo; en produccion conviene anadir filtros y moderacion propios.
- No soporta tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seejay65/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica (fuente del dominio): https://www.literotica.com
- Unsloth (herramienta de entrenamiento): no se proporciona enlace en la informacion disponible
- llama.cpp (runtime): no se proporciona enlace en la informacion disponible
