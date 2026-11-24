# enver/rootformer-v17.10-muhaqqiq-fasil

## Resumen

Rootformer-27B Stage 17.10, denominado `Al-Muḥaqqiq al-Fāṣil`, es un ajuste fino del modelo Qwen/Qwen3.5-27B especializado en traducción del árabe clásico y del árabe estándar moderno (MSA) al inglés, con orientación a textos académicos y de *al-Turāth* (patrimonio islamico). Lo desarrolla el autor de Hugging Face `enver` y se publica bajo licencia Apache 2.0. El modelo resuelve un problema muy concreto: la traducción filológica de textos árabes clásicos, donde la vocalización (*ḍabṭ*), los homógrafos (*gharīb*) y las formas lexicas poco frecuentes degradan los sistemas de traducción entrenados sobre corpus modernos.

La arquitectura subyacente es la del modelo base Qwen3.5 de 27B parámetros (transformer denso, según la información disponible), sobre el que se aplican varias capas de adaptación: una tabla de lexico clásico verificado (*Khalīl Layer-0 Lexicon V2*) con 143.112 formas, un guard gramatical contextual basado en Sībawayh y una etapa de alineamiento contrastivo SimPO con ponderación por tokens divergentes. El resultado es un modelo de traducción con 26.895.998.464 parámetros reales en safetensors y un repositorio de 54,1 GB.

La relevancia actual del modelo radica en su rendimiento declarado sobre benchmarks propios y públicos: 62,675 chrF++ en 200 capítulos clásicos no vistos, 34/36 en el test de filología cero-pistas de `TurāthBench Track 1 v1.0`, y 2.395,6 tok/s en FP8 sobre una única H100 de 80 GB. No obstante, conviene señalar que el modelo tiene cero descargas y cero likes en el momento de la ficha, y que buena parte de sus métricas proceden de suites de evaluación propias del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-27B) con capas de lexico y guard filologico adicionales |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (formato de referencia en vLLM); el resto de cuantizaciones no disponible |
| Idiomas soportados | Árabe (clásico y estándar moderno) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 54,1 GB), FP8 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer denso de 27B parámetros. Sobre esa base, el autor aplica una estrategia de ajuste fino en varias etapas que combina tres componentes. El primero es una tabla de lexico clásico (*Khalīl Layer-0 Lexicon V2*) con 143.112 formas verificadas, derivadas de cinco diccionarios árabes clásicos (*Lisān al-ʿArab*, *al-Nihāyah*, *Maqāyīs al-Lughah*, *Asās al-Balāghah*, *al-Mufradāt*), que reduce los tokens fuera de vocabulario en textos clásicos del 23,25 % al 3,99 %. El segundo es un guard gramatical contextual inspirado en Sībawayh que suprime análisis morfológicos estáticos cuando la frase árabe indica otra vocalización o raíz (por ejemplo, diminutivos con *ḍabṭ* o homógrafos *gharīb*).

El tercer componente es una etapa de alineamiento con SimPO contrastivo ponderado por tokens: se calculan diferencias a nivel de token entre pares mínimos filológicos (*chosen* frente a *rejected*) y se pondera el gradiente 3,5× en los tokens divergentes y 0,6× en los compartidos, de modo que el ajuste se concentra en las decisiones filológicas decisivas. El autor declara una precisión de diferencias del 97,5 % y un margen de +1,29 tras esta etapa. El punto de partida del ajuste es una mezcla exacta 0,50 × Stage 17.9 + 0,50 × Stage 17.8 mediante *thin-QR SVD* como inicialización. No se detalla el volumen total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Traducción de árabe clásico y árabe estándar moderno a inglés, con énfasis en textos filológicos, jurídicos (*fiqh*) y de *uṣūl/Manṭiq*.
- Normalización de variantes ortográficas árabes (por ejemplo, `ى` sin puntos en textos egipcios y de Shamela: `فى` → `في`).
- Desambiguación contextual de homógrafos y formas *gharīb* mediante el guard Sībawayh-Khalīl.
- Modo *grounded* de producción con el componente opcional `ContextualLisanGharibGrounder`, que combina romanización algorítmica del *ḍabṭ* y desambiguación de lexico clásico.
- Generación de texto general y razonamiento heredados del modelo base Qwen3.5-27B.
- Soporte de *tool calling* y de agentes: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Traducción académica de manuscritos y ediciones críticas: el modelo está entrenado para respetar la vocalización y las lecturas filológicas, por lo que puede emplearse en la preparación de traducciones de textos de *al-Turāth* con revisión humana posterior.
- Digitalización y catalogación de fondos árabes: integrado en un pipeline de OCR más traducción, permite generar metadatos y resúmenes en inglés de capítulos clásicos, apoyándose en la reducción de OOV del 3,99 % declarada.
- Traducción de literatura jurídica islámica (*fiqh*): el autor reporta una mejora de +0,950 chrF++ en esta categoría, lo que lo hace adecuado para traducir tratados y compendios legales con terminología técnica estable.
- Investigación en estudios islámicos comparados: sirve para producir traducciones de referencia de pasajes de *uṣūl* y *Manṭiq* que luego se contrastan con traducciones publicadas.
- Despliegue de servicio de traducción de alto rendimiento: con vLLM en FP8 sobre una H100 80GB alcanza 2.395,6 tok/s sostenidos, suficiente para atender un servicio interno de traducción por lotes.
- Evaluación y anotación lingüística: el modo *grounded* con `ContextualLisanGharibGrounder` permite generar análisis de *ḍabṭ* y glosas de lexico clásico para corpus de investigación.
- Traducción de prensa y documentación en árabe estándar moderno: los resultados en FLORES-200 (63,033 chrF++) y NTREX-128 (59,459 chrF++) lo sitúan como opción viable para contenido MSA→inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor, ejecutados con vLLM 0.34.0 en FP8 sobre 1× H100 80GB.

| Benchmark | Modo | Frases | BLEU | chrF++ | Throughput |
|---|---|---:|---:|---:|---:|
| FLORES-200 devtest (arb→eng) | BPE plano | 1.012 | 39,055 | 63,033 | 1.591,8 tok/s |
| FLORES-200 devtest (arb→eng) | Layer-0 BPE-free contextual | 1.012 | 38,770 | 62,859 | 1.511,6 tok/s |
| NTREX-128 (arb→eng) | BPE plano | 1.997 | 33,436 | 59,459 | 1.537,7 tok/s |
| NTREX-128 (arb→eng) | Layer-0 BPE-free contextual | 1.997 | 32,839 | 58,922 | 1.425,2 tok/s |

| Suite clásica (cero pistas) | Stage 17.8 | Stage 17.10 |
|---|---:|---:|
| Track 1 v1.0 Zero-Hint Philology (36) | 30/36 (83,3 %) | 34/36 (94,4 %) |
| Track 1 v1.1 Zero-Hint Philology (56) | — | 46/56 (82,1 %) |
| Producción *grounded* (56) | — | 56/56 (100,0 %) |
| 8 capítulos retenidos, 6 géneros (chrF++ / BLEU) | 63,649 / 41,37 | 63,508 / 40,35 |
| 8 capítulos ciegos Imām al-Rāzī (Ref / Frontier) | 61,858 / 61,217 | 60,987 / 60,688 |
| 200 capítulos no vistos, 60 obras (chrF++) | 62,285 | 62,675 |
| 200 capítulos no vistos, 60 obras (BLEU) | 38,777 | No disponible (truncado en la model card) |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, aproximadamente 27 GB de pesos más overhead de KV cache; el autor reporta ejecución en una única H100 de 80 GB con margen amplio.
- GPU recomendadas: NVIDIA H100 80GB (configuración de referencia declarada); A100 80GB como alternativa razonable por capacidad de memoria, aunque el autor no la menciona.
- GPU de consumo: no hay datos publicados. Con cuantización a 4 bits podría caber en GPUs de 24 GB, pero el autor no documenta versiones GGUF ni AWQ/GPTQ.
- Opciones de despliegue: vLLM 0.34.0 (librería declarada en la model card); llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: 2.395,6 tok/s sostenidos en FP8 sobre H100 80GB, con 0 bucles, 0 truncamientos y 0 artefactos prefatorios según el autor; en FLORES-200 y NTREX-128 el throughput medido oscila entre 1.425 y 1.592 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rootformer-27B Stage 17.10 | 26,9B | No disponible | Traducción ar→en clásico y MSA | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-27B (base) | 27B | No disponible | Modelo generalista | No disponible en la información | Hugging Face |
| Rootformer v17.8 (versión previa) | No disponible | No disponible | Traducción ar→en clásico | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de traducción comparables de terceros en la información proporcionada, por lo que la comparación cuantitativa se limita a las versiones previas del propio Rootformer.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación independiente de los resultados declarados.
- La mayor parte de las métricas proceden de suites propias del autor (`TurāthBench`), lo que limita la comparabilidad con otros sistemas.
- El ámbito lingüístico es estrecho: solo árabe (clásico y MSA) e inglés; no se declaran capacidades en otras lenguas.
- Riesgo de alucinación filológica: el modelo puede generar vocalizaciones o glosas plausibles pero incorrectas en pasajes ambiguos, especialmente fuera del modo *grounded*.
- El modo *grounded* que alcanza 100 % en `TurāthBench Track 1 v1.1` depende de un componente externo (`ContextualLisanGharibGrounder`), no del modelo por sí solo.
- La longitud de contexto no está documentada, lo que impide planificar el procesamiento de capítulos largos sin pruebas previas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3.5-27B puede tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- El rendimiento declarado en FP8 sobre H100 no garantiza cifras equivalentes en otras GPU o en cuantizaciones de menor precisión.
- La model card está parcialmente truncada (faltan datos de BLEU de la suite de 200 capítulos), lo que sugiere documentación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enver/rootformer-v17.10-muhaqqiq-fasil
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Versión previa: https://huggingface.co/enver/rootformer-v17.8-muhaqqiq-mukammal
- Leaderboard `TurāthBench`: https://huggingface.co/spaces/enver/turath-bench-leaderboard
- Suite de evaluación `TurāthBench`: https://huggingface.co/datasets/enver/turath-bench-classical-arabic-en
