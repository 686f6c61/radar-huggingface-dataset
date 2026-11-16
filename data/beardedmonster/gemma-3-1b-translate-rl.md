# BeardedMonster/gemma-3-1b-translate-rl

## Resumen

`BeardedMonster/gemma-3-1b-translate-rl` es un archivo privado de los brazos de aprendizaje por refuerzo (RL) del proyecto SabiYarn / gemma_mt, construido sobre `google/gemma-3-1b-it`. El objetivo del proyecto es la traducción automática del inglés a 125 lenguas africanas, un dominio con escasez crónica de datos y de modelos abiertos. El repositorio no contiene un modelo único en la rama principal (`main` solo aloja el README): los pesos reales viven en ramas, y la rama recomendada es `arm-m1`, byte a byte idéntica al modelo público `BeardedMonster/gemma-3-1b-translate-best`.

El modelo es un transformer decoder-only de 1B parámetros con la arquitectura y el tokenizador de Gemma 3, afinado primero con SFT y después con RL en dos etapas (stage A de 264 pasos y arm M1 de 150 pasos, con mejor checkpoint en el paso 100). La relevancia actual reside en su cobertura lingüística: 125 etiquetas de idioma con el inglés como origen, incluyendo lenguas de bajos recursos como yoruba, hausa, ibo, suajili, amhárico, zulú o wolof, con métricas publicadas en FLORES+, AfriCOMET, NTREX y MAFAND.

El repositorio es de acceso privado (solo autor) y su tamaño es de 16,0 GB, lo que refleja la acumulación de varias ramas de pesos en bfloat16. La licencia es la Gemma, con las restricciones de uso que esta impone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), fine-tuning sobre `google/gemma-3-1b-it` |
| Parametros totales | 1B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los pesos del repo se cargan en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (origen) y 125 etiquetas de lenguas africanas (yoruba, hausa, ibo, pcm, efi, twi, ewe, fon, wol, suajili, kinyarwanda, somali, oromo, amharico, tigrina, luganda, lingala, zulu, xhosa, afrikaans, chichewa, sesoto, setsuana, malgache, bambara, wolof, fulfulde, kabile, etc.) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (carga via `transformers` con `revision`; tamano del repo 16,0 GB por acumulacion de ramas) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de 1B parámetros. Sobre esa base se aplicó un pipeline de tres fases documentado en la model card: primero SFT (shard 4, publicado como `gemma-3-1b-translate-sft-best`), después una etapa de RL "stage A" de 264 pasos y finalmente el brazo M1 de 150 pasos, con el mejor checkpoint en el paso 100. La etapa M1 incorpora una guía MBR (minimum Bayes risk) y sobremuestreo x1,5 para los pares oromo, setsuana, kinyarwanda, hausa, twi, xhosa y nyanya. También se entrenaron dos modelos con DPO a partir de `arm-m1` (`dpo-trial/modelA` y `modelB`), pero el autor los califica explícitamente de resultado negativo y no recomendados.

El prompt de entrenamiento es muy específico: un único turno de usuario con el formato `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos) y el nombre del idioma en inglés, nunca el código ISO. La respuesta esperada empieza por una etiqueta de idioma de tres letras entre ángulos (por ejemplo `<yor>`) que se emite como un único token de vocabulario ordinario (no especial), seguida de la traducción y de `<end_of_turn>` (id 106). La decodificación recomendada es greedy (`do_sample=False`) con `max_new_tokens=256` para frases o párrafos cortos (768 en las evaluaciones) y, opcionalmente en vLLM, `frequency_penalty=0.1` como protección contra bucles de repetición. El modelo solo traduce inglés a lengua africana, no a la inversa.

## Capacidades

- Traducción automática inglés a 125 lenguas africanas, con salida marcada por una etiqueta de idioma de tres letras.
- Generación de texto y razonamiento heredados del modelo base Gemma 3 1B instruct, aunque el fine-tuning está orientado exclusivamente a traducción.
- Manejo de una frase o un párrafo corto por prompt; los documentos largos deben dividirse en frases.
- Decodificación determinista (greedy) con control opcional de penalización por frecuencia para entradas largas.
- Integración con `transformers` (>= 4.56, probado con 4.57.6) y con vLLM (soporte de `frequency_penalty`).
- Capacidades multilingües limitadas al par inglés → lengua africana; no se documenta traducción inversa ni entre lenguas africanas.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Traducción de contenido editorial y noticias a lenguas africanas de bajos recursos: el modelo cubre pares como inglés → yoruba, hausa o wolof, con métricas publicadas en FLORES+ devtest (chrF++ 35,28 en 54 lenguas limpias), lo que permite evaluar la calidad antes de publicar.
- Localización de interfaces y documentación de producto: al aceptar frases y párrafos cortos con un prompt fijo, se puede integrar en un pipeline que divida los textos en oraciones y llame al modelo por lotes con decodificación greedy.
- Atención al cliente y mensajería en lenguas africanas: traducción de respuestas de soporte del inglés a la lengua del usuario, con la etiqueta de idioma como marcador de salida que el sistema puede eliminar con una expresión regular.
- Investigación en NLP de bajos recursos: el modelo sirve como línea base reproducible para comparar técnicas de RL (GRPO, DPO) y de SFT en traducción de lenguas africanas, con checkpoints intermedios accesibles por rama (`stage-a-b64`, `latest-m1`).
- Generación de subtítulos y transcripciones multilingües: traducción de subtítulos en inglés a lenguas como suajili, zulú o amhárico, procesando cada línea como un prompt independiente.
- Evaluación comparativa de traductores: al publicar métricas en FLORES+, AfriCOMET, NTREX y MAFAND, el modelo puede usarse como referencia en estudios que comparen sistemas de traducción para lenguas africanas.

## Benchmarks y rendimiento

| Benchmark | Resultado (greedy) | Resultado (frequency penalty 0,1) | Cobertura |
|---|---|---|---|
| FLORES+ devtest (chrF++) | 35,28 | 35,40 | 54 lenguas, filas limpias |
| AfriCOMET | 0,681 | 0,682 | 40 lenguas |
| NTREX | 40,05 | 40,07 | no disponible |
| MAFAND | 44,21 | 44,25 | no disponible |
| RL dev macro | 43,94 | no disponible | 18 lenguas |

Datos adicionales de la model card: el checkpoint final del brazo M1 (paso 150) obtiene 43,73 en RL dev macro frente a 43,94 del paso 100, por lo que se recomienda el paso 100. La etapa A de RL partió de 40,54 en RL dev macro, subió a 43,62 en el paso 100 y terminó en 43,5 tras 264 pasos. El ensayo DPO obtuvo 33,53 (base), 34,59 (modelA) y 34,25 (modelB) en un conjunto de desarrollo retenido de 17 lenguas destino, y 43,57 / 43,31 / 43,38 en el desarrollo general: el autor lo considera un resultado negativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB de pesos para un modelo de 1B parámetros, más overhead de activaciones y caché KV; en la práctica, cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); para servir en producción con vLLM, A100 o H100 permiten mayor paralelismo y throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: `transformers` (>= 4.56) con `AutoModelForCausalLM` y `revision="arm-m1"`; vLLM con `frequency_penalty=0.1` opcional. No se documentan GGUF, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/gemma-3-1b-translate-rl` (rama `arm-m1`) | 1B | no disponible | Inglés → 125 lenguas africanas | Gemma | Privado (solo autor); duplicado público en `BeardedMonster/gemma-3-1b-translate-best` |
| `google/gemma-3-1b-it` (modelo base) | 1B | no disponible | Multilingüe general | Gemma | Público en Hugging Face |
| `BeardedMonster/gemma-3-1b-translate-sft-best` | 1B | no disponible | Inglés → lenguas africanas | Gemma | Público en Hugging Face (según la model card) |
| `BeardedMonster/gemma-3-1b-translate-best` | 1B | no disponible | Inglés → lenguas africanas | Gemma | Público en Hugging Face (según la model card) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, cobertura lingüística, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio es privado y de acceso solo para el autor: requiere `huggingface-cli login` o `HF_TOKEN` para descargar los pesos; la rama `main` no contiene modelo, solo el README.
- Solo traduce inglés → lengua africana; no soporta traducción inversa ni entre lenguas africanas.
- El prompt debe seguir el formato exacto de entrenamiento (nombre del idioma en inglés, dos espacios tras los dos puntos); desviarse de él puede degradar la calidad.
- La etiqueta de idioma de salida (`<yor>`, `<hau>`, etc.) es un token de vocabulario ordinario y no se elimina con `skip_special_tokens=True`; hay que eliminarla manualmente.
- Riesgo de bucles de repetición en entradas largas; el autor recomienda `frequency_penalty=0.1` en vLLM y dividir los documentos largos en frases.
- El ensayo DPO (`dpo-trial`) se documenta como resultado negativo y no recomendado; no debe usarse en producción.
- Las ramas `latest-m3`, `latest` y `stage-a-b64` fueron eliminadas; no están disponibles.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación específica de seguridad en la información proporcionada.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de un despliegue en producción.
- El tamaño del repo (16,0 GB) se debe a la acumulación de ramas; la descarga de una sola rama es mucho menor, pero conviene usar `revision` para evitar descargar todo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-translate-rl
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Duplicado público recomendado (según la model card): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Checkpoint SFT (según la model card): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-sft-best
- Licencia Gemma: https://ai.google.dev/gemma/terms
