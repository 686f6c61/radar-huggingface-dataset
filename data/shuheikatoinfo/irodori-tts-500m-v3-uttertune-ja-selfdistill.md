# shuheikatoinfo/Irodori-TTS-500M-v3-UtterTune-ja-SelfDistill

## Resumen

Irodori-TTS-500M-v3-UtterTune-ja-SelfDistill es un ajuste fino del modelo de síntesis de voz Aratako/Irodori-TTS-500M-v3, desarrollado por el usuario shuheikatoinfo. Su propósito es permitir que el texto de entrada especifique de forma explícita la lectura (en katakana) y el acento tonal (pitch accent) de una palabra mediante una etiqueta en línea del sistema UtterTune, algo que el modelo base no permite de forma directa. El modelo está entrenado sin grabaciones de voz reales, usando destilación automática a partir del propio modelo base.

El modelo resuelve un problema clásico en TTS japonés: la ambigüedad de lectura de los kanji y la variabilidad del acento tonal según el contexto. Al permitir inyectar la pronunciación y el núcleo acentual en el propio texto de entrada, el desarrollador puede controlar de forma determinista la salida prosódica sin necesidad de un lexicón externo ni de un front-end fonético separado.

Técnicamente es un modelo de 512.050.465 parámetros (637 tensores, fp32) con arquitectura de difusión basada en rectified flow sobre un codificador de texto heredado de llm-jp-3-150m. El contexto y los idiomas soportados se limitan al japonés. La licencia es MIT y el repo ocupa 2,0 GB. Está pensado para investigadores y desarrolladores que necesiten control fino de pronunciación en pipelines de TTS en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (rectified flow) con codificador de texto transformer y codificador de hablante |
| Parametros totales | 512.050.465 (637 tensores, fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT (tokenizer bajo Apache-2.0) |
| Formato de pesos | safetensors (fp32), config en `config.json` y metadatos del safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune, sin LoRA) del checkpoint base Aratako/Irodori-TTS-500M-v3 (revisión `236c1e56591279fc24e3c1bf6609fc06e48dde28`). La arquitectura combina un codificador de texto (tokenizer heredado de llm-jp/llm-jp-3-150m), un codificador de hablante, bloques de difusión, un predictor de duración y módulos auxiliares. El checkpoint de entrenamiento tenía 518.931.745 parámetros, de los cuales 6.881.280 correspondían a `meanflow_cond`, un módulo que nunca se actualizó y que no se usa en el forward pass; por eso `model.safetensors` omite esos tensores y conserva los 512.050.465 restantes, todos entrenados.

El entrenamiento se realizó en 2.000 pasos de un total de 4.000 (batch 32, acumulación de gradiente 2, optimizador Muon, learning rate 1e-5 con schedule warm-up-stable-decay: 100 pasos de warm-up, 2.000 estables y decaimiento hasta el 1 % en el paso 4.000), en bf16 y con pérdida de rectified flow sobre un objetivo fijo de 224 frames. El número de pasos se eligió mediante una regla de validación pre-registrada. Los datos de entrenamiento consisten en 13.901 profesores auto-destilados: cada objetivo es la secuencia latente del propio modelo base para la frase plana, y la entrada es la misma frase con la palabra sustituida por la etiqueta UtterTune. El tokenizer del modelo base se amplió con dos tokens especiales, `<PHON_START>` (id 99574) y `<PHON_END>` (id 99575), de modo que el embedding de texto crece de 99.574 a 99.576 filas.

## Capacidades

- Síntesis de voz en japonés a partir de texto con control explícito de lectura y acento tonal mediante etiquetas UtterTune en línea.
- Etiquetado de pronunciación en katakana con apóstrofo tras la mora del núcleo acentual (por ejemplo, `フク'`, `ゲ'ンカン`, `レーゾ'ーコ`); la ausencia de apóstrofo indica palabra sin acento (heiban, por ejemplo `イス`).
- Generación de audio condicionada por hablante a través del codificador de hablante del modelo base.
- Predicción de duración de los segmentos fonéticos.
- No soporta tool calling ni function calling (no aplica a un modelo TTS).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- Capacidad multilingüe: no; únicamente japonés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.

## Casos de uso

- Síntesis de voz con pronunciación controlada de nombres propios y términos técnicos: el desarrollador inserta la lectura en katakana y el acento deseado mediante la etiqueta UtterTune, evitando lecturas erróneas de kanji ambiguos en asistentes de lectura o narración.
- Generación de audiolibros y contenido editorial en japonés: el control del núcleo acentual permite mantener una prosodia coherente en palabras compuestas y nombres poco frecuentes, algo crítico en narración larga.
- Doctesting y validación de pipelines TTS: al ser un ajuste determinista sobre el modelo base, sirve para comparar la salida con y sin control prosódico y medir mejoras de naturalidad en pares mínimos.
- Localización de interfaces de voz (IVR) y anuncios: permite fijar la pronunciación de topónimos y marcas para que suenen siempre igual, reduciendo variabilidad entre despliegues.
- Investigación en prosodia japonesa: el modelo facilita experimentos controlados sobre el efecto del acento tonal en la percepción, al poder inyectar el núcleo acentual de forma explícita.
- Prototipado de sistemas de lectura accesible: integrable en aplicaciones de lectura de pantalla en japonés donde la lectura correcta de kanji poco comunes es un requisito funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 512 M de parámetros en fp32, los pesos ocupan aproximadamente 2,0 GB, por lo que se estima un consumo de VRAM en el rango de 2 a 4 GB en fp32, sin contar buffers de difusión ni el codificador de hablante.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutarlo en fp32.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y superiores, aunque el autor no lo confirma.
- Opciones de despliegue: no disponible; el repo incluye el código en `irodori/` del repositorio companion, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Control de prosodia |
|---|---|---|---|---|---|
| Irodori-TTS-500M-v3-UtterTune-ja-SelfDistill | 512.050.465 | no disponible | ja | MIT | Sí, vía etiqueta UtterTune |
| Aratako/Irodori-TTS-500M-v3 (base) | ~519 M (checkpoint) | no disponible | ja | MIT | No documentado |
| Otros modelos TTS japoneses de tamano similar | no disponible | no disponible | ja | no disponible | no disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada; el único comparable directo documentado es el modelo base, del que este es un ajuste fino.

## Limitaciones y advertencias

- Solo soporta japonés; no es multilingüe.
- El control de pronunciación depende de que el usuario escriba correctamente la lectura en katakana y el apóstrofo en la posición del núcleo acentual; errores en la etiqueta producen una prosodia incorrecta.
- El entrenamiento se basa en destilación automática del modelo base sin grabaciones reales, por lo que la naturalidad y la cobertura prosódica quedan acotadas a la distribución de los 13.901 profesores auto-destilados.
- Riesgo de alucinación prosódica en palabras fuera de la distribución de entrenamiento o con lecturas muy infrecuentes.
- No se documentan sesgos de hablante ni de género; el codificador de hablante hereda las características del modelo base.
- La licencia MIT permite uso comercial, pero el tokenizer derivado de llm-jp-3 está bajo Apache-2.0, lo que conviene verificar en despliegues que redistribuyan los ficheros del tokenizer.
- El checkpoint publicado corresponde al paso 2.000 de 4.000; no se han publicado métricas de calidad objetivas (MOS, WER de pronunciación) en la información disponible.
- No se documentan requisitos de hardware, latencia ni opciones de cuantización, lo que limita la planificación de producción.

## Enlaces

- Hugging Face: https://huggingface.co/shuheikatoinfo/Irodori-TTS-500M-v3-UtterTune-ja-SelfDistill
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-500M-v3
- Paper: arXiv:2609.17234
- Código UtterTune: https://github.com/shuheikatoinfo/UtterTune
- Código SelfDistill: https://github.com/shuheikatoinfo/UtterTune-SelfDistill
