# BeardedMonster/gemma-3-1b-translate-sft-best

## Resumen

`BeardedMonster/gemma-3-1b-translate-sft-best` es un ajuste fino supervisado (SFT) del modelo `google/gemma-3-1b-it` de Google, especializado en traducción de inglés a 125 lenguas africanas. Lo desarrolla el usuario BeardedMonster en el marco del proyecto SabiYarn / gemma_mt, y constituye el punto de partida de la etapa de aprendizaje por refuerzo que dio lugar a `gemma-3-1b-translate-best`. Con 999.885.952 parámetros reales (aproximadamente 1.000 millones), es un modelo denso de la familia Gemma 3, distribuido en formato safetensors y pensado para ejecutarse en transformers o vLLM.

El modelo resuelve un problema concreto: la escasez de sistemas de traducción automática de calidad para lenguas africanas de bajos recursos. Frente a los traductores multilingües genéricos, que suelen degradarse en estos idiomas, este checkpoint ofrece una cobertura explícita de 125 etiquetas de lengua, de las cuales 105 cuentan con datos de SFT. La entrada es siempre en inglés y la salida en la lengua africana objetivo, con un formato de prompt muy específico que incluye el nombre de la lengua y dos espacios tras los dos puntos.

Es relevante ahora porque documenta con transparencia sus límites: el propio autor advierte de que el modelo SFT tiende a no detenerse o a entrar en bucles, y recomienda usar la versión entrenada con RL para producción. Aun así, sirve como base de investigación reproducible y como referencia para estudiar el salto de calidad que aporta el RL sobre el SFT en tareas de traducción de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (gemma3_text), ajuste fino de google/gemma-3-1b-it |
| Parametros totales | 999.885.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa max_model_len=4096) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (entrada) y 125 etiquetas de lengua africana (105 con datos de SFT, 20 sin ellos): yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, ibb, urh, bem, tum, run, ven, tso, nso, ssw, nbl, nde, sag, tiv, umb, kmb, mos, kik, luo, kam, bin, dag, oke, shi, dyu, bam, kbp, bbj, kon, kea, fat, knc, gaa, kab, nus, swc, lua, kqn, lun, iso, loz, wal, ach, tsc, vmw, kua, seh, nyn, her, yao, sid, ndc, men, kri, luy, ish, dua, bas, wes, tzm, ful, guw, lue, tll, zne, lub, crs, mfe, rnd, nyk, kwn, ndo, dje, ada, arz, sop, mgr, koo, cjk, cop, dop, bum, nba, nyu, dik, cce, chw, ttj, lam, nup, taq, alz, toi, ber, zgh, aar, bci, ary, aeb, teo, adh |
| Licencia | Gemma (terminos en https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer denso de aproximadamente 1.000 millones de parámetros, y se ajusta mediante SFT sobre una cadena de cuatro shards estratificados por lengua (s1 a s4). Este checkpoint es el mejor de la cuarta etapa (paso 19.305, con una pérdida de validación macro de 1,5535). El entrenamiento es exclusivamente supervisado, sin RLHF ni DPO en esta fase; la etapa de RL se aplicó después y dio lugar al modelo `gemma-3-1b-translate-best`.

Una particularidad técnica destacable es el uso de etiquetas de lengua como tokens de vocabulario ordinarios (no especiales), del estilo `<yor>`, `<hau>`, etc. El modelo emite la etiqueta como un único token al inicio de la respuesta, seguida de la traducción y del token de fin de turno (id 106). El prompt de entrenamiento tiene un formato rígido: `Translate the text to {Language name}:  {English text}`, con dos espacios después de los dos puntos y el nombre de la lengua en lugar del código ISO. El autor no documenta el volumen total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Traducción de inglés a 125 lenguas africanas, con cobertura efectiva de datos de SFT en 105 de ellas.
- Generación de texto condicionada por un formato de prompt estricto (nombre de lengua + dos espacios).
- Emisión de una etiqueta de lengua de tres letras como marcador de salida, que debe eliminarse con una expresión regular.
- Traducción de una frase o párrafo corto por petición; el autor recomienda dividir documentos largos en frases.
- Decodificación greedy recomendada (`do_sample=False` o `temperature=0`).
- Compatibilidad con vLLM, incluyendo `frequency_penalty=0.1` como protección frente a bucles de repetición.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Traducción de frases sueltas en aplicaciones de mensajería: el modelo traduce una frase corta de inglés a la lengua africana elegida con una sola llamada y decodificación greedy, adecuado para chats donde la latencia importa y el texto es breve.
- Localización de contenido editorial breve: titulares, pies de foto y avisos de una o dos frases pueden traducirse por lotes en vLLM, agrupando varias lenguas en una sola petición batch como muestra el ejemplo del autor.
- Generación de datos sintéticos para investigación en lenguas de bajos recursos: al ser un checkpoint SFT reproducible con licencia Gemma, sirve como línea base para comparar frente a la versión RL y medir el efecto del entrenamiento por refuerzo.
- Prototipado de asistentes multilingües para África subsahariana: integrado tras una capa de detección de frase y segmentación, puede cubrir lenguas como yoruba, hausa, igbo, suajili o zulú en un mismo despliegue.
- Evaluación académica de traducción automática: útil para reproducir los resultados de chrF++ en FLORES+ y estudiar los fallos de terminación y los bucles del SFT frente al RL.
- Servicio interno de traducción vía API compatible con OpenAI: con `vllm serve` se expone en `/v1/chat/completions` con `temperature=0`, lo que permite integrarlo en herramientas internas sin reescribir clientes.
- Análisis de robustez y seguridad de modelos pequeños: su tendencia documentada a no detenerse lo convierte en un caso de estudio útil para diseñar presupuestos de parada y penalizaciones de repetición en producción.

## Benchmarks y rendimiento

El autor publica resultados en FLORES+ para este checkpoint SFT y para la versión RL, en chrF++:

| Modelo | chrF++ greedy | chrF++ con frequency_penalty=0.1 | Salidas que terminan dentro de 768 tokens |
|---|---|---|---|
| gemma-3-1b-translate-sft-best (este modelo) | 25,66 | 29,11 | 84,5% (greedy) / 99,8% (con penalización 0,1) |
| gemma-3-1b-translate-best (RL) | no disponible por separado | no disponible por separado | no disponible |
| gemma-3-1b-translate-best (RL, chrF++ global) | 35,28 | no disponible | no disponible |

El autor indica que el RL añadió entre 6 y 10 puntos de chrF++ y reparó los problemas de terminación y bucles (sección 17.3 del paper). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2 GB solo para los pesos (1.000 millones de parámetros), más overhead de activaciones y caché KV; el ejemplo del autor carga el modelo en una GPU con `dtype=torch.bfloat16`.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado; tarjetas como RTX 4090, A100 o H100 son holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de gama media-alta con 8 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 en adelante). No se documentan requisitos para cuantizaciones de 4 bits porque el autor no publica versiones GGUF.
- Opciones de despliegue: transformers (probado con 4.57.6, requiere 4.56 o superior), vLLM (probado con 0.32.0) y servidor compatible con OpenAI mediante `vllm serve ... --max-model-len 4096`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo documenta el uso de `max_model_len=4096` y `max_tokens=256` en los ejemplos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-translate-sft-best (este) | ~1.000 M | no disponible | Traduccion EN a 125 lenguas africanas, SFT | Gemma | Hugging Face, 72 descargas |
| gemma-3-1b-translate-best (RL) | ~1.000 M (misma base) | no disponible | Traduccion EN a lenguas africanas, tras RL | Gemma | Hugging Face (referenciado por el autor) |
| google/gemma-3-1b-it (base) | ~1.000 M | no disponible | Modelo general instruido multilingue | Gemma | Hugging Face (modelo base oficial) |
| Traductores multilingues genericos de gran tamano | no disponible | no disponible | Traduccion general | variable | no disponible |

La comparación relevante es interna al proyecto: el propio autor sitúa este SFT por debajo del modelo RL en chrF++ (25,66 frente a 35,28 en greedy) y con problemas de terminación. Frente al Gemma-3-1B-it base, este checkpoint está especializado y restringido a la dirección inglés a lengua africana. No se dispone de datos de benchmarks frente a traductores comerciales o modelos multilingües de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- El modelo SFT a menudo no se detiene o entra en bucles: solo el 84,5% de las salidas greedy terminan dentro de 768 tokens en FLORES+, aunque con `frequency_penalty=0.1` sube al 99,8%.
- Calidad de traducción limitada: chrF++ de 25,66 en greedy y 29,11 con penalización, frente a 35,28 del modelo RL. El autor recomienda usar `gemma-3-1b-translate-best` para traducción real.
- Dirección única: solo traduce de inglés a lengua africana; no se documenta traducción inversa ni entre lenguas africanas.
- Cobertura desigual: 20 de las 125 etiquetas de lengua no tienen datos de SFT, por lo que su calidad es previsiblemente baja o nula.
- Formato de prompt frágil: requiere el nombre de la lengua (no el código ISO) y exactamente dos espacios tras los dos puntos; desviarse del formato puede degradar la salida.
- La etiqueta de lengua de salida es un token de vocabulario ordinario, no especial, por lo que `skip_special_tokens=True` no la elimina; hay que limpiarla con una expresión regular.
- En transformers no existe `frequency_penalty` en `generate`; el autor sugiere `repetition_penalty=1.1` como sustituto aproximado, sin evaluar.
- Riesgo de alucinación y de traducciones inventadas en lenguas con pocos datos, no cuantificado en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google (https://ai.google.dev/gemma/terms), que incluyen restricciones de uso aceptable.
- Repositorio con pocas descargas (72) y sin likes, lo que sugiere validación comunitaria escasa; conviene evaluar antes de usar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-sft-best
- Modelo RL recomendado por el autor: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Repositorios de shards SFT mencionados: `BeardedMonster/gemma-3-1b-translate-sft-s2`, `-sft-s3`, `-sft-s4` (sin model card)
- Paper del proyecto SabiYarn / gemma_mt: no disponible el enlace en la información proporcionada (se cita la sección 17.3)
