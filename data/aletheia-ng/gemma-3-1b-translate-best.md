# Aletheia-ng/gemma-3-1b-translate-best

## Resumen

`gemma-3-1b-translate-best` es un modelo de traducción automática inglés → lenguas africanas desarrollado por Aletheia AI (organización Aletheia-ng) sobre la base de `google/gemma-3-1b-it`. Con aproximadamente 1.000 millones de parámetros, se ha ajustado mediante SFT y posteriormente refinado con GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo. El modelo cubre 125 etiquetas de idioma, de las cuales 105 disponen de datos de SFT y las 20 restantes carecen de ellos, por lo que no pueden traducirse de forma fiable.

El modelo aborda un problema concreto: la escasez de sistemas de traducción de calidad para lenguas africanas de bajos recursos, muchas de ellas ausentes o mal representadas en los modelos multilingües generalistas. Al partir de un modelo compacto de 1B, ofrece una alternativa ligera y desplegable en hardware modesto, con licencia que permite uso comercial bajo atribución.

La relevancia actual radica en su cobertura lingüística (más de un centenar de lenguas africanas, incluyendo yoruba, hausa, igbo, suajili, zulú, amárico, bambara, wolof, entre muchas otras) y en su enfoque de entrenamiento con RL sobre un modelo base ya instruido. Está diseñado exclusivamente para traducción de inglés a lenguas africanas, no en sentido inverso ni entre lenguas africanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajustado con SFT + GRPO |
| Parametros totales | 999.885.952 (~1,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en los ejemplos) |
| Idiomas soportados | 125 etiquetas; 105 con datos de SFT (inglés como origen; destino: yoruba, hausa, igbo, pidgin, efik, twi, ewe, fon, wolof, suajili, kikuyu, somalí, oromo, amárico, tigriña, luganda, lingala, zulú, xhosa, afrikáans, shona, chichewa, sotho, setsuana, malgache, ibibio, urhobo, bemba, tumbuka, kirundi, venda, tsonga, sotho del norte, suazi, ndebele, etc.) |
| Licencia | other (uso comercial libre con atribución obligatoria a "Translation models by Aletheia AI" y cita del paper; aplican además los Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM y TGI) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Gemma 3 de 1B en su variante instruida (`google/gemma-3-1b-it`). El entrenamiento se realizó en dos fases: primero SFT (supervised fine-tuning) sobre pares de traducción inglés → lengua africana, y después GRPO, un algoritmo de optimización por refuerzo sin modelo crítico separado que optimiza recompensas comparando grupos de respuestas generadas. Esta segunda fase busca mejorar la calidad de traducción más allá de lo que permite la imitación supervisada.

El modelo introduce una convención de salida particular: responde con una etiqueta de idioma destino (un token del tipo `<yor>`, `<hau>`, etc.) seguida de la traducción y el token de fin de turno. El prompt debe incluir el nombre del idioma en inglés (por ejemplo, `Yoruba`), no el código ISO. La decodificación recomendada es greedy (`do_sample=False` o `temperature=0`), con `max_new_tokens=256` para frases o párrafos cortos (768 en los benchmarks) y, opcionalmente, `frequency_penalty=0.1` en vLLM para evitar bucles de repetición en entradas largas. El modelo traduce únicamente de inglés a lenguas africanas y recomienda enviar una frase o párrafo corto por prompt, dividiendo documentos largos.

## Capacidades

- Traducción automática inglés → 105 lenguas africanas con datos de SFT (las 20 restantes no son utilizables).
- Generación de texto condicionada por prompt de traducción con formato de chat de Gemma 3.
- Salida estructurada con etiqueta de idioma destino como primer token, útil para enrutamiento y postprocesado.
- Traducción por lotes de una misma frase a múltiples idiomas (ejemplo con vLLM).
- Despliegue compatible con transformers, vLLM y servidor OpenAI-compatible (`/v1/chat/completions`).
- Compatible con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- No soporta tool calling, agentes, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al par inglés → lengua africana; no se documenta traducción inversa ni entre lenguas africanas.

## Casos de uso

- Traducción de documentación técnica y guías de producto al suajili, hausa, yoruba o amárico: el modelo traduce frases y párrafos cortos con decodificación greedy, adecuado para pipelines que segmentan documentos en oraciones.
- Localización de interfaces y mensajes de aplicación: al ser un modelo de 1B, puede desplegarse en servidores modestos y traducir cadenas cortas de UI con baja latencia mediante vLLM y procesamiento por lotes.
- Atención al cliente en lenguas africanas: traducción de respuestas de soporte generadas en inglés hacia la lengua del usuario (por ejemplo, zulú, xhosa o wolof) antes de enviarlas, con control de calidad humano en producciones sensibles.
- Traducción de contenido educativo y sanitario: conversión de materiales de salud pública o formación a lenguas como bemba, chichewa, luganda o kirundi, segmentando el texto en frases para respetar la recomendación del autor.
- Investigación en NLP de bajos recursos: modelo de referencia y punto de partida para experimentos de traducción automática en lenguas africanas, con benchmarks publicados en FLORES+, NTREX-128 y MAFAND-MT.
- Generación de subtítulos y transcripciones multilingües: traducción de subtítulos en inglés a una o varias lenguas africanas por lotes, aprovechando la capacidad de procesar una misma frase en varios idiomas en una sola llamada a vLLM.
- Enrutamiento y marcado lingüístico: la etiqueta de idioma inicial permite verificar el destino solicitado y construir sistemas de control de calidad que validen la lengua de salida.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (decodificación greedy):

| Benchmark | Metrica | Resultado | Cobertura |
|---|---|---|---|
| FLORES+ devtest | chrF++ | 35,28 | 54 lenguas |
| FLORES+ devtest | spBLEU | 14,03 | 54 lenguas |
| FLORES+ devtest | AfriCOMET | 0,681 | 40 lenguas |
| NTREX-128 | chrF++ (implícito) | 40,05 | 24 lenguas |
| MAFAND-MT | chrF++ (implícito) | 44,21 | 15 lenguas |

Resultados por lengua en FLORES+ devtest (chrF++, greedy), según la tabla parcial de la model card: hausa 50,16; igbo 41,92; yoruba 31,97. Pidgin obtiene 51,52 en MAFAND. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2 GB para los pesos (~1,0B parámetros) más overhead de activaciones y caché KV; con `max_model_len=4096` el consumo total es moderado.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB si se cuantiza (aunque no se documentan cuantizaciones oficiales).
- GPU recomendadas para producción: A100, H100 o L4 para despliegues con alta concurrencia; una sola GPU es suficiente para el modelo.
- Opciones de despliegue: transformers (>= 4.56), vLLM (`vllm serve ... --max-model-len 4096`), text-generation-inference y servidor OpenAI-compatible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 1B, se espera baja latencia por petición, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-ng/gemma-3-1b-translate-best | ~1,0B | no disponible | Traducción EN → 105 lenguas africanas (SFT + GRPO) | other (comercial con atribución + Gemma Terms) | Hugging Face |
| google/gemma-3-1b-it | ~1,0B | no disponible | Modelo base instruido multilingüe generalista | Gemma Terms of Use | Hugging Face |
| NLLB-200 (Meta) | 600M–54B (varias tallas) | no disponible | Traducción multilingüe 200 lenguas | CC-BY-NC (no comercial en la mayoría de variantes) | Hugging Face |
| M2M-100 (Meta) | 418M–12B | no disponible | Traducción multilingüe 100 lenguas | MIT (según variante) | Hugging Face |

La comparación con NLLB-200 y M2M-100 es orientativa: no se dispone de resultados de benchmarks cruzados en la información proporcionada. La ventaja diferencial del modelo de Aletheia es su especialización en lenguas africanas y su licencia que permite uso comercial con atribución.

## Limitaciones y advertencias

- Solo traduce de inglés a lenguas africanas; no soporta traducción inversa ni entre lenguas africanas.
- 20 de las 125 etiquetas de idioma no tienen datos de SFT; sus salidas no son utilizables.
- El prompt debe usar el nombre del idioma en inglés (p. ej. `Yoruba`), no el código ISO; el uso incorrecto degrada la calidad.
- Requiere decodificación greedy; el muestreo puede producir salidas inconsistentes.
- Riesgo de bucles de repetición en entradas largas; el autor recomienda `frequency_penalty=0.1` en vLLM y segmentar documentos largos en frases.
- La etiqueta de idioma inicial (`<yor>`, etc.) se mantiene con `skip_special_tokens=True`; es necesario eliminarla con postprocesado.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados o textos con jerga; se recomienda revisión humana en contextos críticos.
- Licencia `other`: uso comercial permitido con atribución obligatoria a "Translation models by Aletheia AI" y cita del paper; además aplican los Gemma Terms of Use y la Prohibited Use Policy de Google.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo reciente con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aletheia-ng/gemma-3-1b-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Paper de referencia: citado en la model card como "the accompanying paper" (no se proporciona URL en la información disponible)
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Documentación de transformers: https://huggingface.co/docs/transformers
