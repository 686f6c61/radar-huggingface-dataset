# michsethowusu/gemma-3-1b-translate-sft-best

## Resumen

`gemma-3-1b-translate-sft-best` es un ajuste fino supervisado (SFT) del modelo `google/gemma-3-1b-it` (aproximadamente 1.000 millones de parámetros) especializado en traducción de inglés a lenguas africanas. Lo publica el usuario michsethowusu bajo la marca "Aletheia AI" y constituye la etapa previa al modelo `BeardedMonster/gemma-3-1b-translate-best`, que añade una fase de aprendizaje por refuerzo (RL) sobre esta base. Su propósito es cubrir el hueco de cobertura de traducción automática para un conjunto amplio de lenguas africanas de bajos recursos, con 125 etiquetas de idioma declaradas (105 con datos de SFT y 20 sin ellos).

El modelo es un transformer decoder-only derivado de la familia Gemma 3, con un único sentido de traducción (inglés a lengua africana) y un formato de prompt muy específico que exige el nombre del idioma en inglés seguido de dos espacios tras los dos puntos. La respuesta se prefija con una etiqueta de tres letras entre ángulos (por ejemplo `<yor>`), que forma parte del vocabulario ordinario y no es un token especial.

Es relevante ahora porque documenta de forma transparente el comportamiento de una etapa SFT pura frente a su continuación con RL: el autor reporta que este modelo a menudo no detiene la generación o entra en bucles, con solo el 84,5 % de salidas greedy que terminan dentro de 768 tokens en FLORES+, y un chrF++ de 25,66 en greedy frente a 35,28 del modelo RL. Por tanto, su interés principal es como punto de partida para investigación y ajuste posterior, no como traductor de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 999.885.952 (aproximadamente 1,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible (el autor usa bfloat16 en los ejemplos; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (origen) y 125 etiquetas de lenguas africanas (105 con datos de SFT, 20 sin ellos); direccion unica EN a lengua africana |
| Licencia | "other": uso comercial libre con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper; se aplican ademas los Terminos de Uso y la Politica de Uso Prohibido de Gemma |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 1.000 millones de parametros, y se ajusta mediante aprendizaje supervisado (SFT) sobre pares de traduccion ingles a lengua africana. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO; el autor solo indica que 105 de las 125 etiquetas de idioma cuentan con datos de SFT y 20 no.

La innovacion tecnica destacable no esta en la arquitectura, sino en el diseno de la interfaz: el prompt usa el nombre del idioma en ingles y la salida se marca con un token de etiqueta de tres letras (`<yor>`, `<hau>`, etc.) que reside en el vocabulario ordinario, de modo que sobrevive a `skip_special_tokens=True` y debe eliminarse por expresion regular en postprocesado. El autor documenta explicitamente que esta etapa SFT presenta problemas de terminacion y bucles, y que la fase RL posterior los corrige y anade entre 6 y 10 puntos de chrF++.

## Capacidades

- Traduccion de texto de ingles a 125 lenguas africanas etiquetadas (yoruba, hausa, igbo, swahili, zulu, amharico, somali, africaans, wolof, bambara, entre otras), siempre en direccion EN a lengua destino.
- Generacion de texto condicionada por instrucciones de chat mediante la plantilla de Gemma 3 (`<start_of_turn>user` / `<start_of_turn>model`).
- Emision de la etiqueta de idioma de salida como un unico token, lo que facilita el enrutado y la validacion en pipelines.
- Manejo de una frase o un parrafo corto por peticion; el autor recomienda dividir documentos largos en frases.
- No soporta traduccion inversa (lengua africana a ingles) ni traduccion entre dos lenguas africanas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Punto de partida para aprendizaje por refuerzo: el propio autor lo posiciona como base de la etapa RL que produce `gemma-3-1b-translate-best`; un equipo de investigacion puede reutilizarlo para experimentar con recompensas de terminacion y calidad de traduccion.
- Ajuste fino adicional con datos propios: al ser un checkpoint SFT de 1 B en safetensors, es viable continuar el entrenamiento con corpus domain-specific (legal, medico, agricola) para una o varias de las 105 lenguas con datos.
- Investigacion sobre cobertura linguistica: permite medir el comportamiento en las 20 lenguas sin datos de SFT y documentar el efecto de la ausencia de supervision en un modelo multilingue pequeno.
- Generacion de datos sinteticos de traduccion a pequena escala: con decodificacion greedy y `max_new_tokens` acotado, puede producir borradores para revision humana en las lenguas con mejor cobertura, siempre con control de bucles.
- Evaluacion comparativa de metodos de decodificacion: el modelo sirve para reproducir el analisis del autor sobre tasa de terminacion y chrF++ con y sin `frequency_penalty=0.1` en vLLM.
- Despliegue en entornos con recursos muy limitados: con 1 B de parametros en bfloat16 (unos 2 GB de pesos) cabe en GPUs de consumo, lo que permite prototipado local de traduccion para una lengua concreta antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del autor sobre FLORES+ para este checkpoint SFT, comparados con el modelo RL de la misma familia:

| Metrica | Este modelo (SFT) | `gemma-3-1b-translate-best` (RL) |
|---|---|---|
| chrF++ (greedy) | 25,66 | 35,28 |
| chrF++ (frequency_penalty 0,1) | 29,11 | no disponible |
| Salidas greedy que terminan dentro de 768 tokens | 84,5 % | no disponible |
| Salidas con frequency_penalty 0,1 que terminan dentro de 768 tokens | 99,8 % | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2 GB de pesos en bfloat16, mas cache KV; con `max_model_len=4096` y lote pequeno, el consumo total se situa en el rango de 3 a 5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado; A100 y H100 son sobredimensionadas para este tamano y solo se justifican para batched serving a gran escala.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) y en GPUs de portatil con 8 GB.
- Opciones de despliegue: transformers (version 4.56 o superior, segun el autor), vLLM con `vllm serve` y endpoint compatible con OpenAI (`/v1/chat/completions`), y text-generation-inference por los tags del repositorio. No se documentan variantes GGUF ni soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda `max_new_tokens=256` para frases o parrafos cortos y `frequency_penalty=0.1` en vLLM para evitar bucles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| `gemma-3-1b-translate-sft-best` (este) | 1,0 B | no disponible | SFT EN a 125 lenguas africanas | other (comercial con atribucion + terminos Gemma) | Publicado |
| `BeardedMonster/gemma-3-1b-translate-best` | 1,0 B (derivado del mismo base) | no disponible | SFT + RL, EN a lenguas africanas | other (comercial con atribucion + terminos Gemma) | Publicado; chrF++ 35,28 en FLORES+ |
| `google/gemma-3-1b-it` | 1,0 B | no disponible en la informacion | Modelo generalista instruido, multilingue | Terminos de uso de Gemma | Publicado; sin especializacion en lenguas africanas |

No se dispone en la informacion proporcionada de datos de benchmarks de `google/gemma-3-1b-it` ni de otros traductores comparables (por ejemplo NLLB o M2M-100) que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Problemas de terminacion y bucles: solo el 84,5 % de las salidas greedy terminan dentro de 768 tokens en FLORES+; es imprescindible fijar `max_new_tokens` y, en vLLM, usar `frequency_penalty=0.1`. En transformers no existe frequency penalty en `generate`; el autor sugiere `repetition_penalty=1.1` como sustituto aproximado no evaluado.
- Calidad inferior a su continuacion RL: chrF++ de 25,66 en greedy frente a 35,28 del modelo RL; el autor recomienda explicitamente usar `BeardedMonster/gemma-3-1b-translate-best` para traduccion directa.
- Direccion unica: solo traduce de ingles a lengua africana; no cubre traduccion inversa ni entre lenguas africanas.
- Cobertura desigual: 20 de las 125 etiquetas carecen de datos de SFT, por lo que su comportamiento en esas lenguas es incierto y no esta evaluado.
- Formato rigido de prompt: requiere el nombre del idioma en ingles y dos espacios tras los dos puntos; usar el codigo ISO en el prompt produce resultados no validados. La etiqueta de salida debe eliminarse con postprocesado.
- Longitud: pensado para una frase o parrafo corto por peticion; los documentos largos deben dividirse en frases, lo que puede degradar la coherencia entre segmentos.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad; al ser un modelo de 1 B entrenado con SFT sobre datos no descritos, la fidelidad en dominios especializados no esta garantizada.
- Licencia: uso comercial permitido con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper; al ser derivado de Gemma 3, se aplican adicionalmente los Terminos de Uso y la Politica de Uso Prohibido de Google.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/gemma-3-1b-translate-sft-best
- Modelo RL de la misma familia: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Licencia del modelo: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-sft-best/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
