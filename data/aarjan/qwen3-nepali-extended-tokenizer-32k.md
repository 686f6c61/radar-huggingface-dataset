# Aarjan/Qwen3-Nepali-Extended-Tokenizer-32k

## Resumen

Qwen3-Nepali-Extended-Tokenizer-32k es un tokenizer derivado del tokenizer oficial de Qwen3, publicado por Aarjan Chaudhary (Naamche Labs) y asociado al preprint *Extend or Repair? Vocabulary Extension Cannot Cross a Pre-Tokenizer Boundary* (Chaudhary, Sharma y Dhakal, 2026). No es un modelo de lenguaje: es un artefacto de vocabulario que añade 32.000 merges de nepalí al tokenizer original de Qwen3 mediante BPE continuado (continued BPE), la receta estándar de extensión de vocabulario. Se libera como brazo R1 del paper, explícitamente etiquetado como baseline limitado por el denominado "pre-tokenizer floor".

El problema que aborda es la ineficiencia de tokenización del nepalí en LLMs multilingües: el tokenizer original de Qwen3 consume 4,42 tokens por token de inglés en texto nepalí, frente a 2,19 del tokenizer extendido, medido sobre FLORES-200 devtest. Los identificadores del vocabulario original, incluidos los tokens especiales, permanecen intactos; los nuevos ids empiezan en 151669, lo que obliga a redimensionar las embeddings del modelo base a 183.669 filas antes de continuar el preentrenamiento.

Es relevante ahora porque cuantifica con precisión los límites de la extensión de vocabulario en lenguas de bajos recursos y porque el propio autor advierte de que, en sus experimentos de continued pretraining a pequeña escala (modelos de 1B y 0,6B, 2 GB de texto, una sola semilla), extender el vocabulario produjo peor bits per byte en nepalí held-out que conservar el vocabulario original. El repositorio de HuggingFace no contiene pesos: solo ficheros de tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE (byte-level) derivado del tokenizer de Qwen3, con 32.000 merges de nepalí añadidos por BPE continuado |
| Parametros totales | no disponible (no incluye pesos de modelo; solo tokenizer) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo Qwen3 sobre el que se aplique) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | nepalí (ne) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos); se distribuyen ficheros de tokenizer (`tokenizer.json`, `tokenizer_config.json`) con `tokenizer_class` fijado a `PreTrainedTokenizerFast` |

## Arquitectura y entrenamiento

El artefacto conserva la expresión regular pre-tokenizer "letters-only" original de Qwen3 y le añade 32.000 merges de nepalí mediante BPE continuado. El tamaño efectivo del vocabulario pasa a 183.669 filas de embedding; los nuevos ids comienzan en 151669 y todos los ids originales, incluidos los tokens especiales, quedan sin modificar. El autor indica que el fichero `tokenizer_config.json` fija deliberadamente `tokenizer_class` a `PreTrainedTokenizerFast`, porque clases específicas de modelo como `Qwen2Tokenizer` reconstruyen el pre-tokenizer a partir de un patrón codificado y desharían la extensión de forma silenciosa.

Para usar el tokenizer con un modelo hay que redimensionar las embeddings a 183.669 filas e inicializar las nuevas filas; en el paper se emplea la media de las filas constituyentes de cada token nuevo, con la implementación de referencia en `box/init_model.py` del repositorio. El paper no publica detalles de composición del dataset de preentrenamiento más allá de los 2 GB de texto usados en los experimentos de continued pretraining, ni menciona fases de RLHF o DPO, que no aplican a un tokenizer. No se han publicado resultados de benchmarks de calidad de modelo en la información disponible, solo métricas de tokenización y de bits per byte.

## Capacidades

- Tokenización de texto nepalí en escritura devanagari con un ratio de 2,19 tokens nepalíes por token inglés, frente a 4,42 del tokenizer original de Qwen3 (FLORES-200 devtest).
- Preservación exacta del comportamiento en inglés: los ids de los 1.012 enunciados ingleses de devtest coinciden con los del tokenizer original.
- Tokenización sin pérdida (lossless) sobre el texto de devtest en nepalí e inglés.
- Compatibilidad directa con el ecosistema `transformers` mediante `AutoTokenizer.from_pretrained`.
- No incluye pesos ni capacidades de generación, razonamiento, código, matemáticas, visión, tool calling ni agentes: es exclusivamente un componente de vocabulario.
- No incorpora capacities multilingües más allá de nepalí e inglés.

## Casos de uso

- Adaptación de Qwen3-1.7B-Base a nepalí: se redimensionan las embeddings del modelo base a 183.669 filas, se inicializan las filas nuevas con la media de sus filas constituyentes y se continúa el preentrenamiento con corpus nepalí, reduciendo aproximadamente a la mitad el coste de tokens por secuencia.
- Investigación sobre extensión de vocabulario: sirve como brazo baseline reproducible frente a propuestas de "reparación" del pre-tokenizer, permitiendo medir la brecha descrita en el paper.
- Reducción de coste de inferencia en nepalí: al bajar el ratio de tokenización de 4,42 a 2,19, se reduce el número de tokens procesados por el mismo texto, lo que abarata el coste por petición en APIs facturadas por token y reduce la presión sobre la ventana de contexto.
- Evaluación de pipelines de tokenización: los tests de lossless y de identidad en inglés permiten verificar que una integración no rompe el vocabulario original.
- Construcción de datasets nepalíes: la tokenización más compacta facilita empaquetar más texto por muestra en flujos de preentrenamiento o fine-tuning.
- Estudio comparativo entre modelos multilingües: el repositorio `nepali-tokenizer` de sidskarki mide la brecha de tokenización en 17 modelos, y este tokenizer puede añadirse a esa comparativa como punto de referencia concreto para Qwen3.
- Análisis de compromisos coste-calidad, dado que el paper reporta que la extensión estándar necesita un 26 % más de tokens de entrenamiento que la variante reparada, aunque obtiene mejor resultado en nepalí (2-6 %).

## Benchmarks y rendimiento

| Metrica | Tokenizer original de Qwen3 | Este tokenizer |
|---|---|---|
| Ratio de tokens nepalí/inglés (FLORES-200 devtest) | 4,42x | 2,19x |
| Identidad de ids en inglés (1.012 frases devtest) | referencia | idéntica |
| Lossless en devtest nepalí e inglés | referencia | sí |

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos cuantitativos adicionales son los de bits per byte del paper, que no se presentan como tabla numérica en la model card: en experimentos de continued pretraining con modelos de 1B y 0,6B, 2 GB de texto y una sola semilla, extender el vocabulario (de cualquier tipo) dio peor bits per byte en nepalí held-out que mantener el vocabulario original, y el tokenizer reparado fue un 2-6 % peor en nepalí que la extensión estándar, aunque necesitó un 26 % menos de tokens de entrenamiento.

## Requisitos de hardware

- El tokenizer en sí es un artefacto de fichero: su carga y uso no requieren GPU, funcionan en CPU y su huella en disco es prácticamente nula (el repositorio ocupa 0,0 GB según HuggingFace).
- El coste real aparece al usarlo con un modelo: hay que redimensionar las embeddings del modelo base a 183.669 filas, lo que incrementa ligeramente la memoria de parámetros respecto al Qwen3 original del mismo tamaño.
- No hay datos publicados de VRAM, GPU recomendadas, latencia ni throughput para este artefacto en la información disponible.
- Opciones de despliegue: cualquier stack que cargue tokenizers de `transformers` (vLLM, TGI, llama.cpp, Ollama) siempre que acepte el vocabulario extendido y el `tokenizer_class` sin reescribirlo. El autor advierte explícitamente de no cambiar `tokenizer_class` ni usar clases tipo `Qwen2Tokenizer`.
- Los experimentos del paper se hicieron con modelos de 0,6B y 1B parámetros y 2 GB de texto, lo que sugiere viabilidad en hardware modesto, pero no se especifican GPUs concretas.

## Comparativa con modelos similares

| Artefacto | Tipo | Base | Idiomas | Ratio nepalí/inglés | Licencia |
|---|---|---|---|---|---|
| Aarjan/Qwen3-Nepali-Extended-Tokenizer-32k | Tokenizer extendido por BPE continuado | Qwen/Qwen3-1.7B-Base | ne, en | 2,19x | apache-2.0 |
| sidskarki/qwen3-nepali-tokenizer | Tokenizer nepalí para Qwen3 | Qwen3 | ne, en | no disponible en la información proporcionada | no disponible |
| Tokenizer original de Qwen3 | Tokenizer base | Qwen3 | multilingüe (incluye ne) | 4,42x | apache-2.0 |

La información disponible no permite comparar con otras alternativas de tokenización nepalí más allá de las citadas.

## Limitaciones y advertencias

- El autor declara que el tokenizer está "limitado por el pre-tokenizer floor" descrito en el paper: el regex letters-only original actúa como techo que la extensión de vocabulario no puede superar sin repararlo.
- En los experimentos del paper, extender el vocabulario dio peor bits per byte en nepalí held-out que conservar el vocabulario original, y el tokenizer reparado resultó entre un 2 % y un 6 % peor en nepalí que la extensión estándar. El propio autor recomienda leer el paper antes de usarlo en un modelo de producción.
- Los resultados experimentales proceden de modelos pequeños (0,6B y 1B), 2 GB de texto y una única semilla; no hay evidencia de escalado a tamaños mayores.
- Solo se libera el tokenizer: no hay pesos, ni modelo afinado, ni pipeline asociado. Cualquier uso implica redimensionar embeddings y continuar el preentrenamiento por cuenta propia.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-10-04): no hay validación comunitaria independiente.
- Riesgo operativo de integración: algunas clases de tokenizer en `transformers` reconstruyen el pre-tokenizer desde un patrón fijo y revertirían la extensión sin aviso; hay que mantener `PreTrainedTokenizerFast`.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe fuera de nepalí e inglés.
- La licencia apache-2.0 permite uso comercial, pero se hereda de la licencia del tokenizer base de Qwen3; conviene revisar el fichero LICENSE del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aarjan/Qwen3-Nepali-Extended-Tokenizer-32k
- Repositorio del paper (código, datos y pre-registro): https://github.com/arjanchaudharyy/nepali-pretokenizer-repair
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Tokenizer nepalí alternativo: https://huggingface.co/sidskarki/qwen3-nepali-tokenizer
- Repositorio de infraestructura de tokenización nepalí: https://github.com/sidskarkii/nepali-tokenizer/blob/main/README.md
