# BeardedMonster/gemma-3-1b-science-sft

## Resumen

`BeardedMonster/gemma-3-1b-science-sft` es un ajuste fino supervisado (SFT) del modelo `BeardedMonster/gemma-3-1b-translate-best`, construido sobre la arquitectura Gemma-3-1B-it de Google. Lo desarrolla el usuario BeardedMonster en el marco del proyecto SabiYarn / gemma_mt, orientado a la traduccion automatica del ingles a lenguas africanas en el dominio cientifico. El modelo tiene aproximadamente 1.000 millones de parametros (999.885.952 exactos segun los pesos en safetensors) y se distribuye en formato safetensors bajo licencia Gemma.

El problema que aborda es la escasez de sistemas de traduccion de calidad para contenido cientifico en lenguas africanas de bajos recursos. Para ello se ha entrenado sobre ventanas y articulos completos del corpus AfriScience-MT en seis idiomas (amharico, hausa, luganda, sotho septentrional, yoruba y zulu), partiendo de un modelo con RL general de traduccion y aplicando una interpolacion de pesos con factor alpha 0.5 entre el modelo de partida y el ajustado en ciencia.

Es relevante ahora porque constituye la base del modelo posterior `gemma-3-1b-science-translate-best` (que anade una etapa de RL cientifico) y porque documenta de forma transparente el proceso de interpolacion de pesos y SFT para un caso de uso muy especifico: traduccion unidireccional ingles a 125 variantes linguisticas africanas. Su publico natural son investigadores que quieran reproducir o ablacionar la etapa de RL cientifico, no usuarios finales de traduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-1B-it, `gemma3_text`) |
| Parametros totales | 999.885.952 (~1,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, fp32 segun la model card; inferencia recomendada en bfloat16) |
| Idiomas soportados | Ingles como origen; 125 etiquetas de lenguas africanas como destino (yoruba, hausa, igbo, pcm, swahili, zulu, amharico, etc.) |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-translate-best`, un Gemma-3-1B-it de aproximadamente 1.000 millones de parametros en fp32 ya entrenado con RL general para traduccion. Sobre esa base se realiza un ajuste fino supervisado (SFT) con ventanas y articulos completos del corpus AfriScience-MT en seis idiomas (amh, hau, lug, nso, yor, zul). Posteriormente se aplica una interpolacion de pesos con el modelo de partida: theta = 0,5 x modelo_inicial + 0,5 x modelo_ajustado en ciencia. Esta tecnica de weight interpolation es la innovacion metodologica destacable de la ficha.

El entrenamiento es exclusivamente ingles a lengua africana (en2african). La model card menciona 125 etiquetas linguisticas, de las cuales 20 carecen de datos generales de SFT y tres tienen un pequeno refuerzo cientifico adicional. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de DPO o RLHF en esta fase concreta (el RL cientifico se aplica en el modelo posterior `gemma-3-1b-science-translate-best`). El prompt de entrenamiento es de un unico turno de usuario con el formato `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos), y el modelo responde con una etiqueta de idioma de tres letras como token unico seguida de la traduccion y `<end_of_turn>` (id 106).

## Capacidades

- Traduccion unidireccional de ingles a 125 lenguas africanas, con enfasis en contenido cientifico.
- Traduccion de frases sueltas, parrafos cortos y articulos cientificos completos (con limitaciones de finalizacion en algunos idiomas).
- Generacion de una etiqueta de idioma de salida (`<yor>`, `<hau>`, etc.) como marcador de formato.
- Decodificacion greedy recomendada (`do_sample=False` / `temperature=0`).
- Soporte de inferencia por lotes en vLLM (una peticion por idioma en un mismo batch).
- No dispone de tool calling, function calling, modo thinking, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al par ingles -> lenguas africanas; no se documenta traduccion inversa ni entre lenguas africanas.
- Capacidad de razonamiento general y codigo: no evaluada ni documentada en la informacion disponible.

## Casos de uso

- Traduccion de articulos cientificos completos a lenguas africanas: el modelo se entreno sobre articulos completos de AfriScience-MT y finaliza el 89% de los papers en dev, por lo que sirve para localizar literatura cientifica a yoruba, hausa, zulu, amharico, luganda o sotho septentrional, troceando el documento en frases o parrafos.
- Traduccion de resumenes y abstracts academicos: con prompts de una frase o parrafo corto y `max_new_tokens=256`, encaja en flujos de publicacion bilinguee de revistas y repositorios.
- Generacion de material divulgativo cientifico multilingue: permite producir versiones en swahili, hausa o yoruba de notas de prensa cientificas y comunicados de universidades.
- Investigacion y ablaciones metodologicas: es la eleccion correcta para reproducir o ablacionar la etapa de RL cientifico del modelo posterior, ya que su rol declarado es "science / SFT / research baseline".
- Evaluacion comparativa de tecnicas de interpolacion de pesos: el factor alpha 0.5 documentado permite estudiar el efecto de la interpolacion frente al ajuste puro en tareas de traduccion de bajos recursos.
- Procesamiento por lotes en produccion con vLLM: la API de inferencia permite enviar varias lenguas en un mismo batch con `SamplingParams(temperature=0, max_tokens=256, frequency_penalty=0.1)`, util para pipelines de traduccion masiva de contenido cientifico.
- Prototipado de sistemas de traduccion para ONG y organismos de salud publica que necesiten material sanitario o cientifico en lenguas africanas de bajos recursos, siempre con revision humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split **dev** de AfriScience-MT y un pequeno conjunto general de dev. No se midieron FLORES+ devtest, NTREX, MAFAND ni el test de AfriScience-MT para este modelo.

| Metrica | Modelo inicial | gemma-3-1b-science-sft |
|---|---|---|
| AfriScience-MT sentence chrF macro (6 idiomas) | 51,07 | 53,52 |
| AfriScience-MT whole-paper chrF | 49,21 | 52,96 |
| Whole-paper: porcentaje de papers finalizados | no disponible | 89% |
| General dev chrF++ macro (18 idiomas x 40 frases) | 43,90 | 43,76 |

Notas: en el modelo posterior con RL cientifico, la finalizacion de papers completos sube al 96%. En este modelo SFT, la finalizacion por idioma en papers completos es de 0,68 en amharico y 0,88 en luganda. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,0B parametros, en bfloat16 requiere aproximadamente 2 GB de pesos mas overhead de activaciones y cache KV; en fp32, alrededor de 4 GB. El repo ocupa 4,1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofrecen margen amplio para lotes grandes y mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Tambien en GPUs con 8 GB con cuantizacion, aunque no se documentan pesos GGUF oficiales.
- Opciones de despliegue: transformers (>= 4.56, probado con 4.57.6), vLLM (probado con 0.32.0) con `dtype="bfloat16"` y `max_model_len=4096`. No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| gemma-3-1b-science-sft (este) | ~1,0B | no disponible | Traduccion en->lenguas africanas, ciencia, SFT + interpolacion | Gemma | Publico, 22 descargas |
| BeardedMonster/gemma-3-1b-science-translate-best | ~1,0B (heredado) | no disponible | Mismo linaje + etapa de RL cientifico; 96% de papers finalizados en dev | Gemma | Publico (modelo recomendado por el autor para traduccion) |
| BeardedMonster/gemma-3-1b-translate-best | ~1,0B (heredado) | no disponible | Traduccion general en->lenguas africanas con RL | Gemma | Publico (modelo de partida) |
| Gemma-3-1B-it (Google) | ~1,0B | no disponible en esta ficha | Modelo base generalista | Gemma | Publico |

La comparativa se limita al linaje del propio proyecto porque no se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor recomienda explicitamente usar `BeardedMonster/gemma-3-1b-science-translate-best` para traduccion real; este modelo SFT solo es adecuado para ablaciones de la etapa de RL cientifico.
- Traduccion unidireccional: solo ingles a lengua africana; no se documenta la direccion inversa ni entre lenguas africanas.
- En papers completos, el 11% no finaliza en dev, con especial incidencia en amharico (0,68) y luganda (0,88); conviene verificar la presencia de `<end_of_turn>`.
- Riesgo de bucles de repeticion en entradas largas; el autor sugiere `frequency_penalty=0.1` como proteccion opcional en vLLM.
- Requiere usar el nombre de la lengua en el prompt ("Yoruba"), nunca el codigo ISO; el prompt debe respetar el formato exacto con dos espacios tras los dos puntos.
- La etiqueta de idioma de salida (`<yor>`, etc.) es un token de vocabulario normal, no especial, por lo que `skip_special_tokens=True` no la elimina; hay que retirarla manualmente.
- Evaluacion limitada: solo se midio en dev de AfriScience-MT y un pequeno dev general; no hay resultados en FLORES+ devtest, NTREX, MAFAND ni test de AfriScience-MT.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google (https://ai.google.dev/gemma/terms), que incluyen restricciones de uso aceptable.
- No se documentan sesgos especificos, pero al ser un ajuste sobre un modelo base generalista y un corpus cientifico limitado, la calidad puede degradarse en dominios fuera de ciencia y en lenguas con pocos datos (20 de las 125 etiquetas no tienen datos generales de SFT).
- Riesgo de alucinacion en traduccion de terminos cientificos especializados no vistos durante el entrenamiento; se recomienda revision humana en contextos medicos o legales.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-science-sft
- Modelo recomendado para traduccion (etapa RL cientifico): https://huggingface.co/BeardedMonster/gemma-3-1b-science-translate-best
- Modelo de partida (RL general de traduccion): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Paper, blog, repositorio o demo del proyecto SabiYarn / gemma_mt: no disponibles en la informacion proporcionada.
- Resultados de benchmarks en FLORES+, NTREX, MAFAND o test de AfriScience-MT: no disponibles en la informacion proporcionada.
