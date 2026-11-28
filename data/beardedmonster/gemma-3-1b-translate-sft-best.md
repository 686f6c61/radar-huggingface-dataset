# BeardedMonster/gemma-3-1b-translate-sft-best

## Resumen

`gemma-3-1b-translate-sft-best` es un modelo de traducción inglés → lenguas africanas desarrollado por BeardedMonster (Aletheia AI) mediante fine-tuning supervisado (SFT) sobre `google/gemma-3-1b-it`. Con 999.885.952 parámetros (aproximadamente 1.000 millones), es un modelo compacto especializado en una única dirección de traducción: desde el inglés hacia 125 etiquetas de lengua africana, de las cuales 105 disponen de datos de entrenamiento SFT y 20 carecen de ellos.

El modelo se presenta explícitamente como el punto de partida del proceso de aprendizaje por refuerzo (RL) que dio lugar a `BeardedMonster/gemma-3-1b-translate-best`, la variante recomendada para traducción directa en producción. El autor advierte que esta versión SFT tiene problemas de finalización de secuencia y de repetición en bucle, y que el modelo RL posterior corrige esos defectos y mejora la calidad de traducción en aproximadamente 6-10 puntos de chrF++.

Su relevancia radica en la cobertura lingüística: 125 etiquetas de lengua africana, incluyendo yoruba, hausa, igbo, suajili, zulú, amhárico, somalí, bambara, wolof y muchas otras de bajos recursos, en un modelo de solo 1B de parámetros que puede ejecutarse en hardware modesto. Es útil como base para RL o fine-tuning adicional, no como traductor final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de despliegue usan `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (origen) y 125 etiquetas de lengua africana (yoruba, hausa, igbo, suajili, zulu, amharico, somali, wolof, bambara, etc.) |
| Licencia | "other": uso comercial libre con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper; sujeto ademas a los Gemma Terms of Use y Prohibited Use Policy |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 1.000 millones de parametros. Sobre esa base se aplico un fine-tuning supervisado (SFT) para la tarea de traduccion ingles → lenguas africanas. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF en esta etapa; el RL se reserva para la variante `gemma-3-1b-translate-best`, que se construyo a partir de este modelo.

La innovacion tecnica destacable es el uso de etiquetas de lengua como tokens ordinarios de tres letras (`<yor>`, `<hau>`, `<ibo>`, etc.) que el modelo emite al inicio de la respuesta, seguidas de la traduccion y del token `<end_of_turn>`. El prompt debe indicar el nombre de la lengua (por ejemplo, "Yoruba"), no el codigo ISO. El modelo esta pensado para decodificacion greedy (`do_sample=False` o `temperature=0`) y requiere un presupuesto de parada (`max_new_tokens`) y, en vLLM, `frequency_penalty=0.1` para mitigar los bucles.

## Capacidades

- Traduccion unidireccional ingles → 125 etiquetas de lengua africana (105 con datos SFT, 20 sin datos SFT y por tanto con salida inutilizable).
- Generacion de texto con plantilla de chat estilo Gemma 3 (`<start_of_turn>user` / `<start_of_turn>model`).
- Emision de etiqueta de lengua como primer token de la respuesta, seguida de la traduccion.
- Traduccion de una frase o parrafo corto por prompt; los documentos largos deben dividirse en frases.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma nativa en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo "thinking" en esta variante.
- Capacidad multilingue limitada a la direccion ingles → lengua africana; no se documenta traduccion inversa ni entre lenguas africanas.

## Casos de uso

- Traduccion de frases sueltas en pipelines de localizacion: el modelo traduce una frase o parrafo corto por prompt con decodificacion greedy, adecuado para procesar cadenas de interfaz o mensajes cortos hacia yoruba, hausa, suajili u otras lenguas.
- Generacion de datos sinteticos para lenguas de bajos recursos: al ser un modelo SFT de 1B, sirve como generador base para crear corpus paralelos que luego se filtren o se usen en RL, tal como hizo el propio autor.
- Punto de partida para RL o fine-tuning adicional: el autor lo recomienda explicitamente como base para entrenar variantes mejoradas, dado su tamano reducido y su licencia permisiva con atribucion.
- Experimentacion academica en traduccion automatica de bajas lenguas: su cobertura de 125 etiquetas y su tamano permiten ejecutar experimentos en una sola GPU consumer.
- Prototipado rapido de servicios de traduccion multilingue: con `vllm serve` se puede levantar un endpoint compatible con OpenAI y enviar lotes de frases a varias lenguas en una sola llamada.
- Evaluacion comparativa de tecnicas de decodificacion: el modelo permite medir el impacto de `frequency_penalty`, `repetition_penalty` y presupuestos de parada sobre la calidad y la finalizacion de las traducciones.
- Traduccion de contenido educativo o comunitario hacia lenguas africanas en contextos con hardware limitado: al caber en GPUs consumer, es viable en entornos con recursos escasos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| chrF++ (greedy) en FLORES+ | 25,66 |
| chrF++ (frequency_penalty=0.1) en FLORES+ | 29,11 |
| chrF++ del modelo RL `gemma-3-1b-translate-best` (referencia) | 35,28 |
| Salidas greedy que terminan dentro de 768 tokens (FLORES+) | 84,5 % |
| Salidas con frequency_penalty=0.1 que terminan dentro de 768 tokens | 99,8 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB para los pesos (1B parametros) mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB con contexto de 4096 tokens.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; A100, H100 o L40S para despliegues por lotes de alto throughput.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; tambien en GPUs de 8 GB con margen.
- Opciones de despliegue: Transformers (`>=4.56`), vLLM (`vllm serve ... --max-model-len 4096`) con endpoint compatible con OpenAI, y TGI (el repo incluye la tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte GGUF/llama.cpp/Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el modelo esta pensado para decodificacion greedy con `max_new_tokens=256` (768 en los benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ FLORES+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/gemma-3-1b-translate-sft-best` | ~1,0 B | no disponible (ejemplos con 4096) | 25,66 (greedy) / 29,11 (fp=0.1) | other (atribucion + Gemma Terms) | Hugging Face |
| `BeardedMonster/gemma-3-1b-translate-best` (RL) | ~1,0 B | no disponible | 35,28 | other (atribucion + Gemma Terms) | Hugging Face |
| `google/gemma-3-1b-it` (base) | ~1,0 B | no disponible en la informacion | no disponible | Gemma Terms of Use | Hugging Face |

No se dispone en la informacion proporcionada de datos de otros traductores comparables (por ejemplo, NLLB-200 o M2M-100) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Problemas de finalizacion: solo el 84,5 % de las salidas greedy terminan dentro de 768 tokens; sin `frequency_penalty=0.1` el modelo a menudo no se detiene o entra en bucle.
- Calidad inferior al modelo RL: chrF++ de 25,66-29,11 frente a 35,28 de `gemma-3-1b-translate-best`; el autor recomienda esta ultima variante para traduccion directa.
- 20 de las 125 etiquetas de lengua no tienen datos SFT y su salida es inutilizable.
- Direccion unica: solo traduce de ingles a lengua africana; no se documenta traduccion inversa ni entre lenguas africanas.
- Recomendado procesar una frase o parrafo corto por prompt; los documentos largos deben dividirse, lo que limita el rendimiento en textos extensos.
- Riesgo de alucinacion y de traducciones incorrectas en lenguas de bajos recursos, especialmente en las que tienen pocos datos.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero al derivar de Gemma 3 hereda los sesgos del modelo base.
- Licencia: uso comercial permitido con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper; adicionalmente se aplican los Gemma Terms of Use y la Prohibited Use Policy de Google, que restringen ciertos usos.
- El modelo esta pensado como base para RL o fine-tuning, no como traductor de produccion listo para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-sft-best
- Variante RL recomendada: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
