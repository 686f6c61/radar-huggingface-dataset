# michsethowusu/gemma-3-1b-translate-best

## Resumen

`gemma-3-1b-translate-best` es un modelo de traducción automática inglés-africano desarrollado por michsethowusu (Aletheia AI) a partir de `google/gemma-3-1b-it`. Se trata de un ajuste fino con supervisión (SFT) seguido de aprendizaje por refuerzo con GRPO, orientado específicamente a la traducción desde inglés hacia 125 etiquetas de lengua africanas, de las cuales 105 disponen de datos de SFT. Con aproximadamente 1.000 millones de parámetros, ocupa un nicho poco cubierto por los modelos multilingües generalistas: la traducción de alta cobertura hacia lenguas de bajos recursos del continente africano.

El modelo mantiene la arquitectura transformer decoder-only de Gemma 3 en su variante de 1B, con un tokenizador extendido que incorpora etiquetas de lengua como `<yor>`, `<hau>` o `<ibo>` en el vocabulario ordinario. La innovación principal reside en el pipeline de entrenamiento: primero SFT sobre pares inglés-lengua africana y después GRPO para optimizar métricas de traducción (chrF++, spBLEU, AfriCOMET) directamente como recompensa, lo que mejora la fidelidad y reduce la degeneración en lenguas de bajos recursos.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 1B puede alcanzar resultados competitivos en traducción de bajos recursos mediante RL; por otro, ofrece una licencia de uso comercial con atribución, algo poco habitual en modelos especializados en lenguas africanas. Los resultados publicados en FLORES+ devtest (chrF++ 35,28 en 54 lenguas), NTREX-128 (40,05 en 24 lenguas) y MAFAND-MT (44,21 en 15 lenguas) sitúan al modelo como referencia en su categoría a escala 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 999.885.952 (~1,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en bfloat16 |
| Idiomas soportados | Ingles (origen) y 125 etiquetas de lengua africana (105 con datos de SFT) |
| Licencia | other (uso comercial permitido con atribucion a "Translation models by Aletheia AI" y cita del paper; sujeto ademas a los Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de aproximadamente 1.000 millones de parametros con atencion causal estandar. El tokenizador se ha ampliado con 125 etiquetas de lengua (p. ej. `<yor>`, `<hau>`, `<ibo>`, `<swh>`, `<zul>`) que funcionan como entradas de vocabulario ordinarias, no como tokens especiales; esto permite que `skip_special_tokens=True` las conserve en la salida y que el modelo las emita como marcador de lengua antes de la traduccion. El prompt se construye con la plantilla de chat de Gemma 3 y una instruccion del tipo `Translate the text to {Language name}:  {English text}` (con dos espacios tras los dos puntos).

El entrenamiento consta de dos fases: primero un ajuste fino supervisado (SFT) sobre pares ingles-lengua africana para 105 de las 125 etiquetas, y despues un refinamiento con GRPO (Group Relative Policy Optimization), una variante de RL sin modelo critico que optimiza directamente metricas de traduccion como recompensa. Esta segunda fase busca mejorar la fidelidad y evitar bucles de repeticion en lenguas de bajos recursos, donde el SFT por si solo tiende a producir salidas degeneradas. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Traduccion unidireccional ingles a 105 lenguas africanas con datos de SFT (yoruba, hausa, igbo, swahili, zulu, amharico, somali, wolof, bambara, fulfulde, entre otras).
- Generacion de texto condicionada por instruccion de traduccion con marcador de lengua de salida.
- Emision de la etiqueta de lengua como token unico (`<yor>`, `<hau>`, ...) seguida de la traduccion, lo que facilita el postprocesado automatico.
- Manejo de una frase o parrafo corto por prompt; el modelo esta optimizado para unidades de traduccion cortas.
- No soporta traduccion inversa (lengua africana a ingles) segun la model card.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo "thinking" ni razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica y guias de producto al yoruba, hausa, igbo o swahili: el modelo permite dividir manuales en frases y traducirlas por lotes con vLLM, manteniendo coherencia terminologica mediante prompts repetidos y decodificacion greedy.
- Localizacion de interfaces de usuario y cadenas de aplicacion movil: con prompts de una sola frase y `max_new_tokens=256`, se puede integrar en un pipeline de CI/CD que traduzca ficheros de recursos (JSON, `.strings`, `.po`) hacia las lenguas con datos de SFT.
- Atencion al cliente en lenguas africanas de gran volumen: el modelo traduce respuestas de un chatbot desde ingles a hausa, swahili o zulu, y puede combinarse con un modelo generalista que gestione el dialogo y delegue la traduccion final.
- Traduccion de contenidos periodisticos y divulgativos: para medios que publican en ingles y quieren ofrecer versiones en yoruba, amharico o somali, el modelo permite procesar articulos frase a frase con una latencia baja gracias a su tamano de 1B.
- Generacion de subtitulos y transcripciones multilingues: a partir de transcripciones en ingles, el modelo produce subtitulos en lenguas africanas con un throughput alto en una sola GPU consumer.
- Investigacion en traduccion automatica de bajos recursos: sirve como linea base reproducible (SFT + GRPO) para experimentos academicos sobre lenguas africanas, con pesos abiertos y licencia que permite uso comercial con atribucion.
- Prototipado de asistentes de voz o chat para ONGs y administraciones publicas en regiones donde el ingles no es la lengua vehicular, traduciendo respuestas generadas por un LLM mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy):

| Benchmark | Lenguas evaluadas | Metrica | Resultado |
|---|---|---|---|
| FLORES+ devtest | 54 | chrF++ | 35,28 |
| FLORES+ devtest | 54 | spBLEU | 14,03 |
| AfriCOMET | 40 | AfriCOMET | 0,681 |
| NTREX-128 | 24 | chrF++ | 40,05 |
| MAFAND-MT | 15 | chrF++ | 44,21 |

Resultados por lengua en FLORES+ devtest (chrF++, greedy), seleccion de la tabla publicada:

| Lengua | Etiqueta | chrF++ |
|---|---|---|
| Hausa | `<hau>` | 50,16 |
| Igbo | `<ibo>` | 41,92 |
| Yoruba | `<yor>` | 31,97 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estos benchmarks, ni datos de MMLU, HumanEval o GSM8K (no aplicables a un modelo de traduccion).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 3 y 5 GB con contexto de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,2-1,5 GB de pesos; en 4 bits, aproximadamente 0,7-1 GB de pesos (las cuantizaciones no estan publicadas oficialmente; habria que generarlas con herramientas como llama.cpp o GPTQ/AWQ).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 o L4 son suficientes. Cabe en GPUs consumer de gama media y en GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: `transformers` (>= 4.56), vLLM (`vllm serve BeardedMonster/gemma-3-1b-translate-best --max-model-len 4096`), servidor compatible con OpenAI (`/v1/chat/completions`), y TGI por ser un modelo `text-generation-inference` y `endpoints_compatible`. No se documenta soporte nativo de GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no se publican cifras concretas. Por el tamano (1B) y el uso de decodificacion greedy con `max_new_tokens=256`, se espera un throughput alto en vLLM con batching, adecuado para traduccion por lotes de frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `michsethowusu/gemma-3-1b-translate-best` | ~1,0B | no disponible | Traduccion EN -> 105 lenguas africanas (SFT + GRPO) | other (comercial con atribucion + Gemma Terms) | Hugging Face, transformers, vLLM, TGI |
| `google/gemma-3-1b-it` (modelo base) | ~1,0B | no disponible | LLM generalista multilingue | Gemma Terms of Use | Hugging Face, transformers, vLLM |
| Modelos NLLB-200 (Meta) | 600M-54B (segun variante) | 512 tokens (aprox.) | Traduccion multilingue 200 lenguas | CC-BY-NC 4.0 (variantes abiertas) | Hugging Face |
| Modelos M2M-100 (Meta) | 418M-12B | 512 tokens (aprox.) | Traduccion multilingue 100 lenguas | MIT (variantes abiertas) | Hugging Face |

La comparativa con NLLB-200 y M2M-100 se ofrece como referencia de categoria (traduccion multilingue de codigo abierto); no se dispone de resultados de benchmarks cruzados en la informacion proporcionada, por lo que no se pueden establecer comparaciones numericas directas. Frente al modelo base Gemma 3 1B, la diferencia principal es la especializacion: el ajuste SFT + GRPO mejora la traduccion a lenguas africanas a costa de perder capacidades generalistas.

## Limitaciones y advertencias

- Traduccion unidireccional: solo ingles a lengua africana; no soporta traduccion inversa ni entre lenguas africanas.
- 20 de las 125 etiquetas no tienen datos de SFT y producen salidas inutilizables segun la propia model card.
- El modelo esta pensado para una frase o parrafo corto por prompt; documentos largos deben dividirse en frases, lo que puede romper la coherencia discursiva.
- Riesgo de bucles de repeticion en entradas largas; la model card recomienda `frequency_penalty=0.1` en vLLM como salvaguarda.
- La etiqueta de lengua de salida (`<yor>`, etc.) debe eliminarse con postprocesado; el modelo la incluye siempre al inicio de la respuesta.
- El prompt debe usar el nombre de la lengua (`Yoruba`), no el codigo ISO; usar el codigo produce resultados incorrectos.
- Riesgo de alucinacion y de traducciones literalmente incorrectas en terminologia especializada (medica, legal, tecnica) para lenguas con pocos datos.
- Sesgos inheridos del corpus de entrenamiento y del modelo base Gemma 3; no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia: uso comercial permitido con atribucion obligatoria a "Translation models by Aletheia AI" y cita del paper; ademas se aplican los Gemma Terms of Use y la Prohibited Use Policy de Google, lo que impone restricciones adicionales de uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de los resultados publicados.
- No se documentan cuantizaciones oficiales (GGUF, GPTQ, AWQ); el despliegue en entornos con poca VRAM requiere generarlas y validar su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/gemma-3-1b-translate-best
- Licencia del modelo: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
