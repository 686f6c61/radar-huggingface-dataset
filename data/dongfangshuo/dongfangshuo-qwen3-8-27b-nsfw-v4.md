# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v4 es un ajuste fino (finetune) del modelo abliterado Huihui-Qwen3.8-27B-abliterated, desarrollado por el usuario dongfangshuo. Se trata de un modelo denso de 26.896 millones de parametros (27B) con capacidad de vision, especializado en creacion literaria en chino y orientado a contenido para adultos (NSFW) y juegos de rol de mesa (TRPG). El modelo parte de la familia Qwen3.8 e incorpora un encoder visual que permite entrada image-text-to-text.

El modelo resuelve un problema muy concreto: la generacion de narrativa larga en chino con coherencia multi-turno, control de estado (paneles HTML con aritmetica de HP/SAN) y seguimiento de reglas de dados, algo que los modelos base de la misma familia no manejan bien segun el autor. Para ello se ha entrenado con un corpus literario amplio y se ha "purificado" la atencion en 64 capas, ademas de aplicar tecnicas de abliteration heredadas del modelo base para eliminar los rechazos.

Es relevante ahora porque demuestra un caso de uso de nicho muy optimizado (roleplay narrativo en chino con vision) sobre una arquitectura densa de 27B que cabe en GPUs de consumo con cuantizacion Q4, y porque el autor documenta de forma inusualmente detallada los limites practicos del modelo (contexto util de 64K, salida de 4K, parametros de muestreo anti-degeneracion). La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (qwen3_5_text), basado en Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 81.920 tokens configurados; el autor recomienda no superar 64K en uso real |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); BF16 (safetensors); LoRA (checkpoint-150) |
| Idiomas soportados | chino (zh) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (BF16, 18 shards), GGUF, LoRA, mmproj BF16 para vision |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 27B parametros con un encoder visual multimodal (pipeline image-text-to-text). Deriva de Huihui-Qwen3.8-27B-abliterated, que a su vez es una version abliterada de Qwen3.8-27B: se han eliminado las direcciones de rechazo en el espacio de activaciones para permitir contenido sin filtros. Sobre esa base, el autor ha aplicado un finetune con un corpus literario extenso en chino, orientado a narrativa, roleplay y TRPG, y ha realizado una "purificacion de atencion" en 64 capas para estabilizar el comportamiento en contextos largos.

No se dispone de datos sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la model card. El autor menciona que la version v3 se descarto por un esquema de entrenamiento demasiado agresivo y que v4 emplea un enfoque mas conservador, cercano al limite practico del tamano de 27B. Tambien advierte de defectos estructurales del modelo base que se amplifican con la cuantizacion, y que no ha podido corregir por completo. El repositorio incluye un Modelfile de Ollama con los parametros de muestreo recomendados y un adaptador LoRA independiente (checkpoint-150, 1,7 GB).

## Capacidades

- Generacion de texto narrativo largo en chino, con enfasis en estilo literario y continuidad multi-turno.
- Roleplay y juegos de rol de mesa (TRPG): seguimiento de reglas de dados (1d100), paneles de estado HTML con aritmetica de HP/SAN/LUST y control de inventario.
- Razonamiento breve con cadena de pensamiento corta, activable mediante instruccion en el system prompt ("Reasoning effort is set to low").
- Capacidad multimodal de entrada: procesa imagenes junto con texto (requiere el archivo mmproj-model-bf16.gguf en despliegues GGUF).
- Generacion de codigo HTML para paneles de estado embebidos en la narrativa.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el autor indica que las capacidades de "agent" e "inteligencia" disminuyen ligeramente respecto al modelo base por el entrenamiento literario.
- Capacidades multilingues: limitadas al chino segun la model card; no se documenta soporte de otros idiomas.

## Casos de uso

- Roleplay narrativo de larga duracion: el modelo mantiene coherencia a lo largo de conversaciones de hasta 64K tokens con 5 rondas consecutivas de TRPG, recordando anclas de contexto y estados previos, gracias a la purificacion de atencion en 64 capas.
- Creacion literaria en chino: generacion de fragmentos de 2.800 a 4.200 caracteres por turno con estilo consistente, adecuado para escritura asistida de novela por entregas.
- Simulacion de partidas de rol con reglas: interpreta tiradas de 1d100, aplica consecuencias de exito o fracaso y actualiza paneles HTML con aritmetica autoconsistente, lo que permite usarlo como master automatizado.
- Frontends conversacionales (SillyTavern, OpenWebUI): el autor proporciona parametros de muestreo especificos (temperature 0.68, min_p 0.06, presence_penalty 0.25) para evitar degeneracion en estos entornos.
- Despliegue local en GPU de consumo: la cuantizacion Q4_K_M (16,5 GB) permite ejecutarlo en GPUs de 16-24 GB de VRAM mediante Ollama o llama.cpp, util para prototipado sin infraestructura cloud.
- Analisis de imagenes con contexto narrativo: el encoder visual permite incorporar imagenes de referencia (personajes, escenarios) en la generacion de texto, aunque la model card no detalla la calidad de esta integracion.
- Fine-tuning posterior: el repositorio incluye pesos BF16 y un checkpoint LoRA, lo que facilita ajustes adicionales para dominios literarios concretos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion subjetiva (ciega, segun el autor) de 5 rondas de TRPG con contexto de 64K, comparando el modelo base, una version no purificada y v4. No son benchmarks estandar (MMLU, HumanEval, GSM8K); son puntuaciones propias del autor sobre dimensiones de la tarea. Se reproducen a continuacion los datos disponibles:

| Dimension (peso) | Base 27B (J) | Sin purificar (K) | v4 (64K+4K) |
|---|---|---|---|
| Recuperacion de anclas a 64K y cierre estable (20%) | 88,0 | 78,0 | 100,0 |
| Cumplimiento de polaridad en tiradas 1d100 (20%) | 94,0 | 55,0 | 98,0 |
| Integridad del panel HTML y aritmetica (15%) | 75,0 | 58,0 | 99,0 |
| Parrafos naturales (resto de la tabla no disponible en el extracto) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son evaluaciones subjetivas del autor y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q3_K_M 13,3 GB (12-16 GB de VRAM); Q4_K_M 16,5 GB (16-24 GB); Q5_K_M 19,2 GB (24 GB); Q6_K 22,1 GB (24-32 GB); Q8_0 28,6 GB (32 GB o mas); BF16 53,7 GB en 18 shards (multi-GPU o A100/H100).
- Vision: anadir 931,2 MB para el encoder mmproj-model-bf16.gguf.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4/Q5; A100 40/80 GB o H100 para BF16; GPUs de 12-16 GB (RTX 4070 Ti, 4080) solo con Q3_K_M.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de 16-24 GB.
- Opciones de despliegue: Ollama y llama.cpp (soportados explicitamente, con Modelfile incluido), Transformers para pesos BF16, y vLLM/TGI no documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda limitar la salida a 4K tokens por turno para evitar degradacion, lo que condiciona el diseno de pipelines.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v4 | ~26,9B denso + vision | 64K recomendado (81.920 config.) | Literatura NSFW y TRPG en chino | qwen-community-1.0 | Hugging Face, GGUF, Ollama |
| Huihui-Qwen3.8-27B-abliterated (base) | ~27B denso | no disponible | Base abliterada sin filtros | no disponible | Hugging Face |
| Qwen3.8-27B (original) | ~27B denso | no disponible | Modelo generalista multilingue | qwen-community-1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo estandar entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material NSFW y la model card lo marca como "not-for-all-audiences"; no es apto para entornos sin control de edad.
- Defectos estructurales del modelo base: el autor advierte de fallos de la arquitectura de 27B que se amplifican con la cuantizacion y que no ha podido corregir.
- Contexto y salida limitados en la practica: no superar 64K de contexto ni 4K de salida por turno; forzar 8K provoca relleno y repeticiones entre turnos.
- Degeneracion por muestreo: repeat_penalty >= 1,10 o frequency_penalty > 0 rompen la puntuacion (eliminan el punto chino) y generan oraciones largas sin puntuar.
- Repeticion de frases en conversaciones largas: tras 5 rondas intensas puede reutilizar frases de entorno o acciones previas; se mitiga con presence_penalty 0,25.
- Reduccion de capacidades generales: el entrenamiento literario degrada ligeramente el razonamiento y las capacidades de agente respecto al modelo base.
- Idioma: solo documentado en chino; el rendimiento en castellano u otros idiomas no esta verificado.
- Licencia: qwen-community-1.0 impone condiciones al uso comercial; debe revisarse antes de desplegar en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de TRPG el autor reporta errores de aritmetica en versiones no purificadas, corregidos en v4 pero no garantizados.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Pesos GGUF (Q4_K_M recomendado): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q4_K_M.gguf
- Encoder de vision: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/mmproj-model-bf16.gguf
- Modelfile de Ollama: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Modelfile
- Checkpoints LoRA: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/tree/main/lora_checkpoints
- Repositorio completo (BF16): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/tree/main
