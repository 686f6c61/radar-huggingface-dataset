# maliktafheem/kathe-2026-en-kas-arab-1b

## Resumen

KATHE 2026 — English to Kashmiri es un modelo de traducción automática neuronal (NMT) especializado en el par inglés → cachemiro en escritura perso-arábiga (`eng_Latn` → `kas_Arab`). Se trata de un fine-tune del modelo `ai4bharat/indictrans2-en-indic-1B`, desarrollado por Malik Tafheem para la competición KATHE 2026, un desafío nacional organizado por GAASH Lab del NIT Srinagar en colaboración con la Oficina de Normas de la India (BIS) y la Universidad de Cachemira. El modelo obtuvo una puntuación de 13,90 en el leaderboard público de la competición, cuya métrica es `sqrt(BLEU × chrF++)`.

La relevancia de este modelo radica en su enfoque metodológico: el autor identificó que el preprocesado estándar de IndicTrans2 eliminaba los diacríticos fonémicos del cachemiro (kasra, damma y fatha), lo que penalizaba gravemente la calidad de la traducción. Al normalizar los datos de entrenamiento preservando estos signos, consiguió una mejora de +4,06 puntos sobre su propia línea base. Con 1.115 millones de parámetros y una arquitectura encoder-decoder, está diseñado para ejecutarse en hardware moderado y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en IndicTrans2-en-indic-1B) |
| Parametros totales | 1.115.543.552 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (generación limitada a 48 tokens en la configuración recomendada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (fuente) y cachemiro en escritura perso-arábiga (destino) |
| Licencia | No disponible (derivado de IndicTrans2; consultar la licencia del modelo base) |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `ai4bharat/indictrans2-en-indic-1B`, un transformer encoder-decoder de 1.100 millones de parámetros originalmente entrenado para traducción entre inglés y 22 lenguas indias. El autor reentrenó todas las capas sobre un corpus de 111.053 pares de frases inglés-cachemiro extraídos de BPCC (Bharat Parallel Corpus Collection) y OPUS wikimedia, con un optimizador Adafactor, tasa de aprendizaje 3e-5 con 200 pasos de calentamiento, 6.940 pasos (4 épocas), batch efectivo de 64, label smoothing de 0,1 y precisión fp16.

La innovación técnica principal consiste en sustituir el preprocesado estándar de `IndicProcessor` (que elimina los diacríticos kasra, damma y fatha de los objetivos cachemires, herencia del urdu donde son opcionales) por un normalizador propio (`KashmiriNormalizer`) que preserva estos signos, fonémicos en cachemiro. Además, los pesos finales son el promedio elemento a elemento de dos checkpoints (pasos 6.500 y 6.940), lo que aportó una mejora adicional de +0,15 puntos frente a cualquiera de los checkpoints por separado.

## Capacidades

- Traducción automática de inglés a cachemiro en escritura perso-arábiga, con preservación de diacríticos fonémicos.
- Generación de texto condicionada con búsqueda de haces (beam search) de 5 haces y longitud máxima de 48 tokens, configurada tras un barrido sobre 1.500 filas de validación.
- Integración con el ecosistema HuggingFace Transformers mediante `trust_remote_code=True`, ya que la arquitectura no está incluida en el núcleo de la librería.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales: es un modelo puramente de traducción.
- Competencia limitada al par de idiomas en-ks; no conserva las capacidades multilingües del modelo base.

## Casos de uso

- Traducción de material educativo: el modelo se entrenó con frases cortas de registro didáctico (mediana de 7 palabras fuente), por lo que es adecuado para traducir ejercicios, definiciones y textos escolares del inglés al cachemiro.
- Localización de contenidos gubernamentales: organismos como el BIS promueven la traducción de normativas y avisos a lenguas regionales; este modelo puede generar borradores iniciales en cachemiro que luego revise un hablante nativo.
- Preservación lingüística: ayuda a generar contenido escrito en cachemiro, una lengua con menos recursos digitales, facilitando la documentación de textos y su difusión en formato electrónico.
- Subtitulado de vídeos educativos: dado su contexto corto y su registro simple, puede traducir frases sueltas de subtítulos, aunque requeriría una pos-edición para mantener coherencia temporal.
- Atención al ciudadano en servicios públicos: traducción de preguntas frecuentes o formularios breves de inglés a cachemiro para poblaciones que usan esta lengua como principal.
- Evaluación comparativa en tareas de NMT de bajos recursos: sirve como referencia para investigar el efecto del preprocesado de diacríticos en lenguas indias, ya que documenta explícitamente su metodología y limitaciones.

## Benchmarks y rendimiento

El modelo obtuvo una puntuación de **13,90** en el leaderboard público de KATHE 2026, cuya métrica es `sqrt(BLEU × chrF++)`. No se han publicado resultados detallados de BLEU y chrF++ por separado ni comparaciones con otros modelos en la información disponible.

| Métrica | Valor |
|---|---|
| KATHE 2026 composite (sqrt(BLEU × chrF++)) | 13,90 |
| Mejora por normalización de diacríticos | +4,06 (de 9,69 a 13,75) |
| Mejora por promedio de checkpoints | +0,15 |

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Basándose en el tamaño del modelo (1,1B parámetros) y la precisión fp16 utilizada en entrenamiento:

- VRAM estimada para inferencia: aproximadamente 2,5–3,5 GB en fp16, más overhead de activaciones y el tokenizador personalizado; con cuantización a 8 bits podría reducirse a ~1,5–2 GB.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 o superiores son suficientes; también puede ejecutarse en GPUs de datacenter como A10 o T4.
- Es viable en una GPU de consumo de 8 GB (como la RTX 3070) sin necesidad de cuantización, tal y como demuestran otros participantes de KATHE 2026 que usaron LoRA en ese hardware.
- Opciones de despliegue: al ser un modelo de Transformers con código personalizado, se puede servir con HuggingFace Inference Endpoints o mediante un script Python con `transformers==4.51.x`. No se ha probado con vLLM, llama.cpp u Ollama, y es probable que requieran adaptaciones por el código remoto.
- Latencia y throughput: no disponibles; en una GPU de gama media se espera una latencia de cientos de milisegundos por frase corta con beam search de 5 haces.

## Comparativa con modelos similares

No se dispone de resultados cuantitativos de otros modelos en la misma tarea para una comparación directa. Como referencia cualitativa:

- `ai4bharat/indictrans2-en-indic-1B` (modelo base): cubre 22 lenguas indias, pero su preprocesado estándar elimina los diacríticos cachemires, lo que lo penaliza en esta tarea específica.
- `peeryamin17/BSFY` (participante de KATHE 2026): fine-tune con LoRA del mismo modelo base, optimizado para caber en 8 GB de VRAM; no se publican sus métricas.
- `AzhadArshad/kathe_2026` (participante de KATHE 2026): otro fine-tune del mismo modelo base, sin métricas públicas.

La diferenciación principal del modelo evaluado es su tratamiento explícito de los diacríticos, que constituye una contribución metodológica más que una superioridad arquitectónica.

## Limitaciones y advertencias

- Precisión imperfecta de diacríticos: solo el 85,4% de las palabras que coinciden con la referencia al eliminar las marcas llevan exactamente los diacríticos correctos. El autor estima que copiar las marcas de la referencia sobre esas palabras mejoraría la puntuación compuesta en ~1,21x.
- Entrenado exclusivamente con frases cortas de registro didáctico (mediana de 7 palabras fuente); su comportamiento en prosa larga, técnica o literaria no ha sido probado y probablemente degrade.
- Dependencia de una versión concreta de Transformers (4.51.x); la versión 5 elimina `tokenizer.as_target_tokenizer()`, necesario para la decodificación, lo que limita la portabilidad a futuro.
- Requiere `trust_remote_code=True` y la instalación de `IndicTransToolkit`, lo que añade dependencias y riesgos de seguridad si el código remoto no es auditado.
- Licencia no especificada en la model card; al ser derivado de IndicTrans2, debe consultarse la licencia de ese modelo base para determinar restricciones de uso comercial.
- No se redistribuyen datos de la competición, pero el entrenamiento usó BPCC y OPUS; verificar las condiciones de esos conjuntos para usos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maliktafheem/kathe-2026-en-kas-arab-1b
- Repositorio del autor con scripts y documentación: https://github.com/maliktafheem/kathe-2026-en-kas
- Competición KATHE 2026 en Kaggle: https://www.kaggle.com/competitions/kathe-2026/overview
- Página de KATHE 2026 en GAASH Lab (NIT Srinagar): https://gaash.nitsri.ac.in/events/kathe-2026
- Modelo base IndicTrans2: https://huggingface.co/ai4bharat/indictrans2-en-indic-1B
- Repositorio de un participante con enfoque LoRA: https://github.com/peeryamin17/BSFY
