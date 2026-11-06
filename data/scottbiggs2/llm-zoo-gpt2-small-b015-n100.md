# ScottBiggs2/llm-zoo-gpt2-small-b015-n100

## Resumen

`llm-zoo-gpt2-small-b015-n100` es un artefacto de investigación publicado por el usuario ScottBiggs2 en Hugging Face. No es un modelo de lenguaje de propósito general, sino un conjunto (un "zoo") de 100 modelos GPT-2 completos, cada uno de 124.439.808 parámetros, que comparten un tronco inicial común y divergen únicamente en la mezcla de datos de preentrenamiento utilizada. El objetivo declarado es estudiar la estructura del espacio de pesos de una población de modelos que parten de la misma inicialización y solo difieren en el corpus con el que se entrenaron.

Cada miembro se entrena sobre una mezcla distinta de cinco dominios (web, código, matemáticas, libros y multilingüe) definida como un punto del 5-simplex. El zoo incluye 20 anclas con mezclas repetidas y 80 singletons con mezclas únicas. La arquitectura es la GPT-2 small estándar (12 capas, 768 de dimensión oculta, 12 cabezas), con vocabulario BPE de 50257 tokens y `lm_head` atado a los embeddings de entrada.

Es relevante ahora porque ofrece un banco de pruebas controlado para investigación en espacio de pesos, merging de modelos, análisis de linaje y estudios de especialización por dominio. El autor advierte explícitamente de que la calidad de texto es débil: son modelos entrenados desde cero con un presupuesto de tokens fijo sobre corpus públicos pequeños, sin ajuste por instrucciones ni alineamiento de seguridad. La licencia de los pesos es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 124.439.808 por miembro (100 miembros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 small estándar, típicamente 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible; el corpus multilingüe usa `fineweb-2` en `fra_Latn` (francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` por miembro) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only idéntico a GPT-2 small: 12 capas, dimensión oculta 768, 12 cabezas de atención y vocabulario BPE de 50257 tokens con `lm_head` atado a los embeddings de entrada. El dropout es 0.0, igual que en entrenamiento. Los pesos se publican en float32 y, según el autor, se convirtieron desde los vectores planos originales sin modificación, verificándose la conversión bit a bit para cada miembro.

El entrenamiento se organiza en dos fases. Primero se entrena un tronco compartido (`trunk/`) durante 16140 pasos de optimizador con semilla 1234. Después, cada miembro ramifica desde ese tronco y entrena una fracción beta = 0,15 del presupuesto adicional (0,15 × 18988 pasos) sobre su propia mezcla de datos. El presupuesto total equivale a 20 tokens por parámetro. Las mezclas se construyen sobre cinco corpus públicos: `HuggingFaceFW/fineweb-edu` (sample-10BT) para web, `codeparrot/codeparrot-clean` para código, `open-web-math/open-web-math` para matemáticas, `manu/project_gutenberg` (split `en`) para libros y `HuggingFaceFW/fineweb-2` (fra_Latn) para multilingüe. El repositorio incluye `members.json` con los pesos de mezcla `pi` de cada miembro, su tipo (ancla o singleton), `mixture_id` y `branch`, además de un directorio `provenance/` con metadatos y el manifiesto SHA-256 de los pesos originales. No se reporta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el presupuesto de entrenamiento y el tamaño del modelo.
- Especialización controlada por dominio según la mezcla `pi` de cada miembro (web, código, matemáticas, libros, multilingüe).
- Estudio comparativo de espacio de pesos: los 100 miembros comparten inicialización, lo que permite aislar el efecto de los datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al francés presente en `fineweb-2` (`fra_Latn`); no hay evaluación publicada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en merging de modelos: al compartir tronco e inicialización, los 100 miembros permiten medir cómo varía la interpolación de pesos entre modelos con mezclas de datos conocidas y controladas.
- Análisis de linaje y espacio de pesos: `members.json` y `provenance/` facilitan estudiar distancias en el espacio de parámetros en función de la distancia entre mezclas `pi` en el 5-simplex.
- Estudios de especialización por dominio: comparar `member_000` a `member_099` en perplejidad sobre web, código o matemáticas aísla el efecto de la composición del corpus sin confundirlo con cambios de arquitectura.
- Reproducibilidad de experimentos: el manifiesto SHA-256 y la conversión bit a bit verificada permiten replicar análisis sobre los mismos pesos exactos.
- Docencia y divulgación: el zoo sirve como ejemplo didáctico de entrenamiento multi-fase (tronco más ramas) y de diseño de experimentos factoriales sobre datos.
- Benchmarking de técnicas de compresión o pruning: un conjunto de 100 modelos pequeños con estructura conocida es útil para validar métodos que dependen de la geometría de los pesos.
- No es adecuado para atención al cliente, generación de código en producción ni ninguna aplicación final de usuario, según la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidades por dominio, y advierte de que la calidad de texto es débil por el presupuesto de entrenamiento limitado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB por miembro en float32 (124,4 M de parámetros × 4 bytes); en float16 unos 0,25 GB. El repositorio completo ocupa 50,3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM basta para un miembro individual; para cargar varios miembros en paralelo se recomienda RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU consumer: sí, un miembro individual cabe holgadamente en GTX 1650, RTX 3060 o superiores.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel` y `subfolder="members/member_XXX"`; también es compatible con llama.cpp, Ollama y TGI previa conversión a los formatos correspondientes (no documentada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScottBiggs2/llm-zoo-gpt2-small-b015-n100 | 124,4 M por miembro (100 miembros) | no disponible | Artefacto de investigación (zoo de pesos) | Apache-2.0 | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | Modelo de propósito general | MIT | Hugging Face, descarga directa |
| Pythia-160M (EleutherAI) | 160 M | 2048 | Investigación con checkpoints intermedios | Apache-2.0 | Hugging Face |
| SmolLM-135M (Hugging Face) | 135 M | 2048 | Modelo pequeño de propósito general | Apache-2.0 | Hugging Face |

La diferencia clave frente a estas alternativas es que el zoo no busca calidad de generación, sino ofrecer una población de modelos con inicialización compartida y mezclas de datos conocidas, algo que ninguno de los comparables proporciona.

## Limitaciones y advertencias

- Calidad de texto débil reconocida por el autor: entrenamiento desde cero con presupuesto fijo (20 tokens por parámetro) sobre corpus públicos pequeños.
- Sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse en aplicaciones de cara al usuario sin salvaguardas adicionales.
- Riesgo de alucinación elevado por el tamaño reducido y la ausencia de tuning.
- Sesgos heredados de los corpus de preentrenamiento (`fineweb-edu`, `codeparrot-clean`, `open-web-math`, `project_gutenberg`, `fineweb-2`), no evaluados ni mitigados.
- Idiomas: solo se documenta presencia de inglés y francés en los corpus; no hay evaluación multilingüe.
- Longitud de contexto no documentada en la model card; se asume la de GPT-2 small, pero no está confirmada.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets subyacentes mantienen sus propias licencias y condiciones, que deben revisarse antes de reutilizar los datos.
- El tamaño del repositorio (50,3 GB) complica su descarga y almacenamiento; conviene usar `subfolder` para descargar solo los miembros necesarios.
- No es un modelo de producción: es un artefacto de investigación sin garantías de rendimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/ScottBiggs2/llm-zoo-gpt2-small-b015-n100
- Preprint: pendiente de publicación según la model card ("link coming soon")
- Dataset web: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset código: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset matemáticas: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset libros: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset multilingüe: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
