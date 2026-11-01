# ScottBiggs2/llm-zoo-calibration

## Resumen

`llm-zoo-calibration` es un artefacto de investigación publicado por ScottBiggs2 en Hugging Face. No es un modelo de lenguaje de propósito general, sino una colección de "zoos" de calibración: conjuntos de modelos GPT-2 pequeños (`gpt2_zoo_mini`, 8 capas y 51.475.968 parámetros) que comparten un tronco común y se entrenan, cada uno, sobre una mezcla distinta de datos de preentrenamiento en cinco dominios (web, código, matemáticas, libros y multilingüe). El objetivo declarado es calibrar el diseño de zoos de mayor tamaño, que se publican en repositorios separados.

El repositorio contiene varios conjuntos autocontenidos (`b015_n12`, `b030_n12`, `b060_n12`, `b015_singleton`, `b030_singleton` y `probe`), cada uno con sus miembros, el tronco compartido, un `members.json` con los pesos de mezcla (`pi`, `kind`, `mixture_id`) y un directorio `provenance/` con metadatos y el manifiesto SHA-256 de los pesos originales. El parámetro `beta` indica la fracción del número de pasos del tronco que cada miembro entrena sobre su propia mezcla.

La relevancia es metodológica, no de producto: permite estudiar cómo distintos regímenes de mezcla de datos afectan a los pesos de un modelo pequeño partiendo de un mismo tronco. El autor advierte explícitamente de que los modelos se entrenaron desde cero con un presupuesto de tokens reducido y sin ajuste por instrucciones ni por seguridad. El repositorio ocupa 10,5 GB y los pesos están en float32, convertidos de los vectores planos originales con verificación bit a bit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`GPT2LMHeadModel`), 8 capas |
| Parámetros totales | 51.475.968 por miembro (`gpt2_zoo_mini`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (los datos incluyen web, código, matemáticas, libros y multilingüe con fineweb-2 francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, cargables con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only tipo GPT-2 con 8 capas y 51.475.968 parámetros, con `lm_head` atado a la embedding de entrada y dropout de 0.0, igual que en entrenamiento. El vocabulario es el BPE de GPT-2 (50.257 tokens). Cada conjunto parte de un tronco compartido y ramifica miembros que se entrenan sobre mezclas distintas de cinco corpus públicos: `HuggingFaceFW/fineweb-edu`, `codeparrot/codeparrot-clean`, `open-web-math/open-web-math`, `manu/project_gutenberg` y `HuggingFaceFW/fineweb-2` en francés.

El diseño experimental gira en torno a dos parámetros: `beta`, la fracción de pasos del tronco que cada miembro entrena sobre su propia mezcla (0.15, 0.30 o 0.60 según el conjunto), y los pesos de mezcla `pi` registrados en `members.json`. Los conjuntos `b015_n12`, `b030_n12` y `b060_n12` contienen 12 miembros ancla cada uno; los conjuntos `singleton` listan los 26 miembros del plan pero solo almacenan los pesos de seis (índices 20-25). El conjunto `probe` contiene únicamente metadatos, sin pesos. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta de las mezclas ni si hubo RLHF o DPO (el autor indica que no hay ajuste por instrucciones).

## Capacidades

- Generación de texto autoregresiva básica, en la línea de un GPT-2 pequeño entrenado desde cero.
- Modelado de distribución de datos por dominio: cada miembro está especializado en la mezcla concreta sobre la que se entrenó.
- Estudio de geometría del espacio de pesos: los miembros comparten tronco y difieren en un número controlado de pasos de entrenamiento.
- Reproducibilidad: manifiesto SHA-256 de los pesos originales y conversión a float32 verificada bit a bit.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio.
- No dispone de ajuste por instrucciones ni por seguridad, por lo que no sigue instrucciones de forma fiable.
- Capacidad multilingüe: no documentada; los datos incluyen texto en francés de fineweb-2, pero no se declaran idiomas soportados.

## Casos de uso

- Investigación sobre mezcla de datos: comparar miembros entrenados con distintas `pi` sobre el mismo tronco para medir el efecto de la composición del corpus en los pesos finales.
- Calibración de experimentos mayores: usar estos zoos pequeños para decidir hiperparámetros (`beta`, número de miembros, mezclas) antes de lanzar zoos de mayor tamaño, que el autor publica por separado.
- Análisis de espacio de pesos: estudiar distancias, interpolaciones o linear mode connectivity entre miembros que parten de un tronco común.
- Reproducción de resultados: el manifiesto SHA-256 y la conversión bit-exacta permiten verificar que los pesos cargados coinciden con los originales del estudio.
- Docencia y experimentación con `transformers`: al ser un GPT-2 de 8 capas y ~51 M de parámetros, se puede cargar y ejecutar en entornos modestos para ilustrar el efecto de la mezcla de datos.
- Evaluación de pipelines de preprocesado de corpus: entrenar miembros con subconjuntos de fineweb-edu, codeparrot, open-web-math, project Gutenberg y fineweb-2 francés para medir la sensibilidad del modelo a cada fuente.
- No es adecuado para atención al cliente, generación de código en producción, asistentes ni ninguna aplicación de cara al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.475.968 parámetros en float32, los pesos ocupan aproximadamente 206 MB; en float16, unos 103 MB. El repositorio completo ocupa 10,5 GB por contener múltiples miembros y conjuntos.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre es suficiente para un miembro individual; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel` y `subfolder` para seleccionar el miembro; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| llm-zoo-calibration (este) | 51.475.968 por miembro | no disponible | Artefacto de investigación sobre mezclas de datos | Apache-2.0 |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | Modelo de propósito general preentrenado | MIT |
| GPT-2 8 capas (variantes comunitarias) | ~51 M | no disponible | Experimentación y ajuste fino | variable |

La comparación directa con modelos de propósito general no es significativa: este repositorio no busca competir en calidad de generación, sino servir de sustrato experimental. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe como artefacto de investigación entrenado desde cero con presupuesto de tokens reducido.
- Sin ajuste por instrucciones ni por seguridad; no debe desplegarse de cara al usuario.
- Riesgo elevado de alucinación y de generación incoherente por el tamaño reducido y el escaso entrenamiento.
- Sesgos desconocidos: no se documenta análisis de sesgos; los corpus de origen (web, código, libros, matemáticas) introducen los sesgos propios de cada fuente.
- Idiomas soportados no declarados; el multilingüe se limita al francés de fineweb-2 en los datos de entrenamiento.
- Longitud de contexto no documentada.
- Los corpus de entrenamiento mantienen sus propias licencias y términos; deben consultarse las fichas de cada dataset antes de reutilizar los datos.
- Los conjuntos `singleton` solo incluyen los pesos de seis miembros; el resto de miembros del plan no están en esas carpetas. El conjunto `probe` no contiene pesos.
- El preprint está anunciado como "link coming soon"; no hay publicación disponible para verificar metodología ni resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ScottBiggs2/llm-zoo-calibration
- Preprint: no disponible (el autor indica "link coming soon")
- Corpus de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Corpus de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Corpus de entrenamiento: https://huggingface.co/datasets/open-web-math/open-web-math
- Corpus de entrenamiento: https://huggingface.co/datasets/manu/project_gutenberg
- Corpus de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
