# BeardedMonster/gemma-3-1b-rl-translate-best

## Resumen

`gemma-3-1b-rl-translate-best` es un modelo de traducción automática inglés a lenguas africanas desarrollado por BeardedMonster (Jeffrey Otoibhi, Aletheia AI) dentro del proyecto SabiYarn / gemma_mt. Se trata de un ajuste fino del modelo base `google/gemma-3-1b-it` mediante cuatro fragmentos de SFT (supervised fine-tuning) seguidos de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El modelo resuelve el problema de la cobertura de traducción de alta calidad para lenguas africanas de bajos recursos, un ámbito tradicionalmente desatendido por los sistemas comerciales.

El modelo cubre 125 etiquetas de idioma en la dirección inglés a lengua africana, con un total de 999.885.952 parámetros (aproximadamente 1.000 millones) y pesos en formato safetensors. Esta ficha corresponde a una copia byte a byte del repositorio `BeardedMonster/gemma-3-1b-translate-best`, identificada como el brazo M1 en el paso 100 del entrenamiento por refuerzo.

Su relevancia radica en que demuestra que un modelo de apenas 1.000 millones de parámetros, tras un pipeline de SFT más RL, puede superar a sistemas dedicados de mayor tamaño como NLLB-200-distilled-600M en el conjunto compartido de lenguas FLORES+, lo que lo convierte en una opción atractiva para despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante gemma3_text) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configurado en el ejemplo de vLLM; el modelo base Gemma 3 soporta hasta 128K, pero la card no confirma el contexto efectivo tras el ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 125 etiquetas: inglés (origen) y 124 lenguas africanas (yoruba, hausa, igbo, pcm, efi, twi, ewe, fon, wol, swahili, kinyarwanda, somalí, oromo, amárico, tigriña, luganda, lingala, zulú, xhosa, afrikáans, shona, chichewa, sotho, tsonga, malgache, etc.) |
| Licencia | sabiyarn-commercial-use-with-attribution (uso comercial con atribución obligatoria; aplican además los Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 1.000 millones de parámetros. Sobre esa base se aplicó un pipeline de dos fases: primero cuatro fragmentos de SFT y después aprendizaje por refuerzo con GRPO, una variante de optimización de política proximal que no requiere un modelo crítico separado y que se ha popularizado para tareas de razonamiento y generación con recompensas verificables. El resultado seleccionado corresponde al brazo M1 en el paso 100, descrito como el mejor checkpoint de la campaña.

El entrenamiento está especializado en una única dirección (inglés a lengua africana) y utiliza un formato de prompt estricto con dos espacios tras los dos puntos (`Translate the text to {Language name}:  {English text}`). El modelo emite una etiqueta de idioma como un único token de vocabulario ordinario (no especial), seguida de la traducción y del token de fin de turno. Los datos de entrenamiento concretos (número de tokens, composición del corpus, uso de RLHF frente a DPO) no se detallan en la información disponible; la model card remite a la tarjeta principal del repositorio gemelo y a un paper en preparación.

## Capacidades

- Traducción automática de inglés a 124 lenguas africanas, con etiquetas de idioma dedicadas en el vocabulario.
- Generación de una frase o un párrafo corto por petición; se recomienda dividir documentos largos en frases.
- Emisión de una etiqueta de idioma de salida como marcador (por ejemplo `<yor>`), que debe eliminarse del texto final.
- Decodificación greedy recomendada (`do_sample=False` o `temperature=0`) para resultados reproducibles.
- Compatibilidad con vLLM, con `frequency_penalty=0.1` opcional como protección frente a bucles de repetición en entradas largas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; el modelo está especializado exclusivamente en traducción.
- Multilingüismo limitado a la dirección inglés a lengua africana; no se garantiza la dirección inversa ni la traducción entre lenguas africanas.

## Casos de uso

- Traducción de documentación técnica y guías de producto a lenguas africanas de amplia difusión (yoruba, hausa, igbo, swahili, zulú): el modelo permite localizar manuales y materiales de formación con un coste computacional muy bajo, procesando frase a frase y concatenando los resultados.
- Atención al cliente en mercados africanos: integrado en un pipeline que segmenta los mensajes entrantes en frases, el modelo traduce respuestas predefinidas o plantillas del inglés a la lengua del usuario, con decodificación greedy para garantizar consistencia.
- Localización de interfaces y aplicaciones móviles: traducción de cadenas cortas de UI (etiquetas, mensajes de error, notificaciones) a decenas de lenguas, aprovechando que el modelo funciona con prompts de una sola frase y un límite de 256 tokens nuevos.
- Traducción de contenido editorial y noticias: para medios que publican en lenguas africanas, el modelo sirve como primera pasada automática que un revisor humano pule después, dado su rendimiento en FLORES+ (chrF++ 35,28) y NTREX-128 (40,05).
- Generación de subtítulos y transcripciones multilingües: combinado con un sistema de reconocimiento de voz en inglés, el modelo traduce los segmentos a la lengua objetivo para vídeos educativos o divulgativos.
- Investigación en procesamiento de lenguas de bajos recursos: el modelo, con licencia permisiva para uso comercial con atribución, sirve como línea base reproducible para experimentos de traducción automática en lenguas africanas y para comparaciones con NLLB o sistemas especializados.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de 1.000 millones de parámetros, puede ejecutarse en una única GPU consumer o incluso en CPU con cuantización, lo que facilita su uso en organizaciones con infraestructura modesta.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes (decodificación greedy, filas limpias):

| Benchmark | Métrica | Resultado | Cobertura |
|---|---|---|---|
| FLORES+ devtest | chrF++ | 35,28 | 54 lenguas |
| FLORES+ devtest | spBLEU | 14,03 | 54 lenguas |
| FLORES+ devtest | AfriCOMET | 0,681 | 40 lenguas |
| NTREX-128 | chrF++ (según contexto de la card) | 40,05 | 24 lenguas |
| MAFAND-MT | chrF++ (según contexto de la card) | 44,21 | 15 lenguas |

Comparativa directa ofrecida por el autor:

| Sistema | Resultado | Conjunto |
|---|---|---|
| gemma-3-1b-rl-translate-best | 37,93 | 44 lenguas compartidas de FLORES+ |
| NLLB-200-distilled-600M | 35,94 | 44 lenguas compartidas de FLORES+ |
| NLLB-200-3.3B | 38,09 | 44 lenguas compartidas de FLORES+ |
| gemma-3-1b-rl-translate-best | 45,18 | 19 lenguas de TranslatePsy |
| TranslatePsy-AfriSLM-0.8B | 45,27 | 19 lenguas de TranslatePsy |

El modelo supera a NLLB-200-distilled-600M en el conjunto compartido, queda ligeramente por debajo de NLLB-200-3.3B y prácticamente empata con TranslatePsy-AfriSLM-0.8B en su subconjunto de 19 lenguas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB solo para los pesos (1.000 millones de parámetros a 2 bytes), más el espacio de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según la longitud de contexto y el tamaño de lote.
- Cabe en GPUs consumer: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de portátil con 6-8 GB de VRAM.
- GPU profesionales recomendadas para mayor throughput: A100, H100, L40S, siempre que se despliegue con vLLM o TGI para servir peticiones concurrentes.
- Despliegue: transformers (versión 4.56 o superior; probado con 4.57.6), vLLM con `dtype="bfloat16"` y `max_model_len=4096`. No se documentan variantes GGUF ni integración con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 1.000 millones de parámetros con generación de 256 tokens como máximo, se espera una latencia baja en GPU moderna, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (FLORES+) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-rl-translate-best | ~1.000 M | 4096 configurado | 37,93 (44 lenguas) | Comercial con atribución + Gemma Terms | Hugging Face (repo privado, acceso del autor) |
| NLLB-200-distilled-600M | 600 M | 512 | 35,94 (44 lenguas) | CC-BY-NC 4.0 | Hugging Face, público |
| NLLB-200-3.3B | 3.300 M | 512 | 38,09 (44 lenguas) | CC-BY-NC 4.0 | Hugging Face, público |
| TranslatePsy-AfriSLM-0.8B | 800 M | no disponible | 45,27 (19 lenguas) | no disponible | Hugging Face |

El modelo destaca por ofrecer un rendimiento cercano a NLLB-200-3.3B con un tercio de los parámetros y con licencia que permite uso comercial con atribución, frente a la restricción no comercial de NLLB.

## Limitaciones y advertencias

- Dirección única: solo traduce de inglés a lengua africana; no se ha entrenado ni evaluado para la dirección inversa ni para pares entre lenguas africanas.
- Formato de prompt estricto: requiere exactamente dos espacios tras los dos puntos y el nombre del idioma en inglés (no el código ISO); un prompt mal formado degrada la calidad.
- La etiqueta de idioma de salida (`<yor>`, `<hau>`, etc.) se emite como token ordinario y debe eliminarse manualmente del texto generado.
- Riesgo de bucles de repetición en entradas largas; se recomienda dividir documentos en frases y, en vLLM, aplicar `frequency_penalty=0.1`.
- Riesgo de alucinación y de traducciones inexactas en terminología especializada, nombres propios y expresiones culturalmente específicas; no se documentan evaluaciones de sesgo.
- Cobertura desigual entre las 124 lenguas: algunas cuentan con muchos más datos de entrenamiento que otras, y el rendimiento por lengua individual no se detalla en la información disponible.
- Licencia: uso comercial permitido con atribución obligatoria («SabiYarn translation models by Jeffrey Otoibhi, Aletheia AI») y citación del paper en preparación; además aplican los Gemma Terms of Use y la Prohibited Use Policy de Google, que imponen restricciones adicionales.
- El repositorio figura como privado con acceso solo del autor, lo que limita la reproducibilidad y la verificación independiente de los resultados.
- No hay datos publicados sobre cuantización, por lo que el despliegue en CPU o en GPUs con poca VRAM requiere convertir los pesos por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-rl-translate-best
- Repositorio gemelo (modelo original): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Licencia: https://huggingface.co/BeardedMonster/gemma-3-1b-rl-translate-best/blob/main/LICENSE.md
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
