# enver/rootformer-v16-sovereign-transmute

## Resumen

Rootformer v16 Sovereign Transmute es un modelo de lenguaje publicado por el usuario "enver" en HuggingFace el 28 de septiembre de 2026. Se trata de un transformer de 24 capas y 399.371.824 parámetros (aproximadamente 399 millones), distribuido exclusivamente en formato safetensors y con código personalizado (`custom_code`), lo que obliga a cargarlo con `trust_remote_code=True`. El modelo se presenta como una realización neuronal del aparato gramatical y morfológico de la escuela de Basora, con atención denominada `IshtiqaqAttentionV12` y una "capa 14" descrita como estrato morfológico.

Según la model card, el entrenamiento no se apoyó en heurísticas simbólicas de Python, sino que se realizó directamente sobre un corpus digitalizado de fuentes clásicas árabes atribuidas a Al-Khalīl ibn Aḥmad, Sībawayh, Ibn Fāris, Ibn Durayd, Ibn Jinnī, Al-Mubarrad, Al-Akhfash, Al-Ghazālī y Al-Rāghib, entre otros. El autor cifra el corpus en 232.405 secuencias (226.405 de entrenamiento y 6.000 de validación) y una ejecución continua de 10,61 minutos sobre una GPU NVIDIA RTX PRO 4500 Blackwell de 32 GB de VRAM.

La relevancia del modelo es dudosa fuera del nicho experimental: no declara licencia, idiomas, longitud de contexto ni pipeline, cuenta con cero descargas y cero "likes", y no aporta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Su interés radica en ser un ejemplo extremo de modelo pequeño, muy especializado y entrenado con criterios lingüísticos muy concretos, más que en una utilidad generalista de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 24 capas con `IshtiqaqAttentionV12`, estrato morfológico en la capa 14 y operadores inductivos "basraníes" (según la model card); código personalizado |
| Parámetros totales | 399.371.824 |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo declara pesos safetensors) |
| Idiomas soportados | no declarados oficialmente; el corpus descrito es fundamentalmente árabe clásico con anclas bilingües en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,8 GB |
| Pipeline declarado | no disponible |
| Fecha de publicación | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura se describe como un transformer de 24 capas con un mecanismo de atención propio (`IshtiqaqAttentionV12`), una capa 14 concebida como "estrato morfológico" y un conjunto de operadores inductivos propios de la tradición gramatical de Basora. No se especifica el número de cabezas de atención, la dimensión del modelo, el vocabulario del tokenizador ni el número total de tokens vistos, más allá de las 232.405 secuencias del corpus. Tampoco se indica si existe positional encoding rotatorio, GQA, SwiGLU u otras elecciones habituales; en consecuencia, esos datos quedan como no disponibles.

El entrenamiento se realizó durante 1.500 pasos, con una función de pérdida multitarea definida como `L = L_LM + 0,30 · L_root + 0,15 · L_khalil_ishtiqaq + 0,10 · L_governor`. La pérdida total descendió de 4,4925 en el paso 50 a 3,0039 en el paso 1.500, y la perplejidad pasó de 27,88 a 9,06 (validación: pérdida 3,0019 y perplejidad 9,05 sobre 6.000 secuencias). El throughput de entrenamiento declarado es de aproximadamente 20.281 tokens/s. No se menciona uso de RLHF, DPO, ni una fase de instrucción o alineación.

## Capacidades

- Generación de texto en árabe clásico y, según la model card, "transmutaciones" al inglés filosófico, con foco en terminología escolástica y gramatical.
- Modelado de morfología de raíz y patrón (`ishtiqāq`), incluidas permutaciones consonánticas y órbitas de taqālīb.
- Razonamiento sobre proposiciones metafísicas y lógicas de la tradición aviceniana y gazaliana, según la evaluación declarada por el autor.
- Modelado de fenómenos de rección sintáctica (`al-ʿamal`) y elipsis latente (`al-taqdīr`).
- Capacidad de manejar polisemia y enantiosemia (`aḍdād`) dentro del corpus descrito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modalidad múltiple: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación en lingüística computacional árabe: el modelo puede emplearse para estudiar cómo una red pequeña modela la morfología de raíz y patrón cuando se entrena exclusivamente sobre fuentes clásicas de Basora, sin heurísticas simbólicas externas.
- Filología asistida: uso como herramienta de apoyo en la transliteración, segmentación y análisis de formas verbales y nominales de textos clásicos, siempre con validación humana por su alta tasa de error potencial.
- Análisis de terminología escolástica: dado que el corpus incluye obras de Al-Ghazālī y Al-Rāghib, puede servir para explorar la consistencia terminológica de conceptos de lógica, epistemología y `uṣūl` en la tradición.
- Prototipado educativo: útil como ejemplo didáctico de arquitectura transformer pequeña con código personalizado y pérdidas auxiliares, para cursos de entrenamiento de modelos.
- Experimentos de ablación: al estar definido con una pérdida multitarea concreta, puede servir de base para reproducir o contrastar variantes de `IshtiqaqAttentionV12`.
- Corpus lingüístico anotado: aprovechable como generador de candidatos léxicos y paradigmáticos que después se filtren con herramientas simbólicas de gramática árabe.
- Uso como modelo de juguete en pruebas de integración de `trust_remote_code` en pipelines de Transformers, no como componente productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. La model card únicamente aporta una evaluación interna sobre ocho proposiciones clásicas, con las siguientes cifras declaradas por el autor:

| Proposición (dominio) | Pérdida | Perplejidad |
|---|---|---|
| `ممكن الوجود يستوي في حقه الوجود والعدم` (metafísica aviceniana) | 1,1875 | 3,28 |
| `الجوهر هو القائم بنفسه المستغني عن المحل` (teoría de la sustancia) | 1,6094 | 5,00 |
| `العرض هو القائم بالغير المحتاج إلى المحل` (teoría del accidente) | 1,9766 | 7,22 |
| `هذه أخت تلك في المعنى` (analogía semántica farahidí) | 2,5000 | 12,18 |
| `التعب في طلب العلم عبادة` (adab escolástico) | 2,7812 | 16,14 |
| `الفلسفة هي علم الحق` (epistemología kindí-farabí) | 2,8594 | 17,45 |
| `النسخ في الشريعة واقع` (teoría legal de uṣūl al-fiqh) | 3,0469 | 21,05 |
| `الحكمة أخت الشريعة والرضيعة من لبان الحق الأبلج` (Ibn Rushd, Faṣl al-Maqāl) | 3,2500 | 25,79 |

Estas cifras no son comparables con benchmarks públicos ni permiten situar el modelo frente a alternativas de su tamaño.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,8 GB en fp16 (399M parámetros), unos 0,4 GB en int8 y unos 0,2 GB en int4, sin contar el overhead del runtime. Son cifras teóricas; la model card no confirma cuantizaciones disponibles.
- GPU de entrenamiento declarada: NVIDIA RTX PRO 4500 Blackwell con 32 GB de VRAM.
- Cabe en cualquier GPU de consumo moderna: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, o incluso GPUs integradas con suficiente memoria compartida para fp16.
- Opciones de despliegue: la presencia de `custom_code` obliga a usar la librería Transformers con `trust_remote_code=True`. No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama; la conversión a GGUF requeriría implementar la arquitectura personalizada, por lo que no es un camino soportado de serie.
- Throughput: la única cifra publicada es de entrenamiento, aproximadamente 20.281 tokens/s en la RTX PRO 4500 Blackwell. No se aportan datos de latencia ni de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rootformer-v16-sovereign-transmute | 399.371.824 | no disponible | no disponible | HuggingFace, código personalizado |
| Qwen2.5-0.5B | ~494 millones | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente integrado |
| SmolLM2-360M | ~362 millones | 8.192 tokens | Apache-2.0 | HuggingFace, integrado en ecosistemas habituales |
| Pythia-410M | ~405 millones | 2.048 tokens | Apache-2.0 | HuggingFace, referencia académica |

La comparación es únicamente estructural: no existen datos de benchmarks del modelo analizado que permitan contrastar su rendimiento con estas alternativas, y su licencia y soporte de despliegue son indeterminados frente a los de los modelos citados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en ausencia de licencia explícita, el uso en producción queda legalmente en un terreno incierto.
- Código personalizado: cargar el modelo requiere ejecutar código del repositorio (`trust_remote_code=True`), lo que implica un riesgo de seguridad y de compatibilidad entre versiones de Transformers.
- Corpus muy reducido y especializado: 232.405 secuencias y 10,61 minutos de entrenamiento son un volumen ínfimo para un modelo de 399M parámetros, lo que hace muy probable un sobreajuste al corpus clásico y una generalización pobre fuera de él.
- Ausencia total de alineación: no se declara RLHF, DPO ni instrucción supervisada, por lo que el modelo no está preparado para seguir instrucciones ni para diálogo abierto.
- Riesgo alto de alucinación: sin datos de evaluación externa, cualquier salida sobre gramática, derecho o filosofía debe verificarse con fuentes primarias.
- Idiomas no declarados: aunque el corpus es mayoritariamente árabe clásico con anclas en inglés, no hay confirmación oficial del soporte multilingüe.
- Longitud de contexto desconocida: no se puede planificar el uso en documentos largos ni en conversaciones multi-turno.
- Métricas no verificadas: las cifras de pérdida y perplejidad son autodeclaradas por el autor y se refieren únicamente a su propio corpus de validación, no a conjuntos independientes.
- Sin tracción comunitaria: cero descargas y cero "likes" implican ausencia de pruebas externas, informes de fallos o mantenimiento.
- Ausencia de información sobre sesgos: no hay evaluación de sesgos ni declaración de datos de toxicidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/rootformer-v16-sovereign-transmute
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo (solo páginas genéricas de Google), por lo que no se dispone de paper, blog, repositorio adicional ni demo.
