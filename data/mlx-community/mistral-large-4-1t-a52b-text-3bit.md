# mlx-community/Mistral-Large-4-1T-A52B-Text-3bit

## Resumen

Mistral-Large-4-1T-A52B-Text-3bit es una cuantización a 3 bits, en formato MLX, del modelo Mistral-Large-4-1T-A52B de Mistral AI, realizada por la comunidad mlx-community. Se trata de un modelo de lenguaje extremadamente grande: aproximadamente 1,05 billones de parámetros totales (1.049.357.365.536 según los pesos en safetensors), con una arquitectura de mezcla de expertos (MoE) que activa unos 52.000 millones de parámetros por token, lo que permite combinar la capacidad de un modelo gigante con la latencia de uno mucho más pequeño.

La variante "Text" es una conversión solo de texto: el encoder de visión y el draft head DSpark (usado para decodificación especulativa en el checkpoint original) no están incluidos. Los pesos FP8 del original se dequantizaron y volvieron a cuantizar a 3 bits afín con tamaño de grupo 64 (unos 3,5 bits por peso), manteniendo el router y dos proyecciones del indexer en bf16. El resultado ocupa unos 459 GB en disco y requiere memoria pico en torno a 459 GB durante la generación, por lo que está dirigido a estaciones de trabajo Apple Silicon con memoria unificada muy elevada (por ejemplo Mac Studio o Mac Pro configurados al máximo).

Su relevancia actual radica en que pone al alcance del ecosistema MLX (hardware Apple Silicon) uno de los modelos abiertos más grandes publicados hasta la fecha, con licencia mistral-ecosystem-open-weight-license, aunque su despliegue está reservado a un conjunto muy reducido de máquinas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mistral_large4), solo texto |
| Parámetros totales | 1.049.357.365.536 (~1,05 T) |
| Parámetros activos | ~52.000 millones (52B) por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits afín, group size 64 (~3,5 bits/peso); router y dos proyecciones del indexer en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | mistral-ecosystem-open-weight-license (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Mistral-Large-4-1T-A52B, es un transformer de mezcla de expertos (MoE) con ~1,05 billones de parámetros totales de los que ~52.000 millones se activan por token. La conversión a MLX indica además que el checkpoint original incorpora un draft head denominado DSpark, presumiblemente para decodificación especulativa, y un encoder de visión; ninguno de los dos componentes está incluido en esta variante de texto.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en los datos disponibles. En cuanto a la cuantización: los pesos FP8 del original se dequantizaron y se volvieron a cuantizar a 3 bits afín con group size 64, lo que equivale a 3,5 bits por peso; el router y dos proyecciones del indexer se mantienen en bf16, igual que en el checkpoint original. La conversión se realizó con mlx-lm (PR ml-explore/mlx-lm#2018) y se ha probado con mlx-lm 0.32.3.dev13 y MLX 0.32.4.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modelo base tipo instruct/central de Mistral: razonamiento general y seguimiento de instrucciones (según la model card original; detalles no disponibles en la información proporcionada).
- No incluye capacidades de visión: el encoder de visión del checkpoint original se ha omitido en esta conversión.
- No incluye el draft head DSpark, por lo que la decodificación especulativa del checkpoint original no está disponible en esta variante.
- Soporte de chat template del tokenizador para conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el repositorio no especifica idiomas).

## Casos de uso

- Experimentación local con modelos frontera en Apple Silicon: permite ejecutar un modelo de ~1 T de parámetros en un Mac con memoria unificada suficiente, sin depender de APIs externas ni de clústeres de GPU.
- Investigación sobre cuantización extrema: al ser una conversión a 3 bits con router en bf16, sirve como banco de pruebas para estudiar el impacto de la cuantización agresiva en modelos MoE gigantes.
- Prototipado de asistentes conversacionales: mediante el chat template del tokenizador se puede construir un chatbot multi-turno con mlx-lm en pocas líneas de código.
- Generación y análisis de texto a gran escala: la capacidad de un modelo de 1 T activando 52B por token es adecuada para tareas de síntesis, resumen y redacción de alta complejidad.
- Evaluación comparativa de modelos abiertos: útil como referencia de máxima capacidad para comparar modelos más pequeños en benchmarks propios.
- Integración en pipelines locales de procesamiento de lenguaje: el formato MLX permite integrarlo en scripts Python con mlx-lm para automatizar tareas de texto en entornos macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como dato de rendimiento operativo: en una prueba corta de generación, el consumo pico de memoria fue de unos 459 GB.

## Requisitos de hardware

- Memoria estimada para inferencia: ~459 GB de memoria pico en una generación corta (medido por los autores de la conversión). El repositorio ocupa 459,3 GB en disco.
- Hardware viable: únicamente estaciones Apple Silicon con memoria unificada muy alta, como Mac Studio o Mac Pro con 512 GB de memoria unificada o más. No cabe en ninguna GPU de consumo actual (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB están muy lejos del requisito).
- En GPU NVIDIA: no viable en una sola GPU; requeriría múltiples A100/H100 de 80 GB en paralelo, y al ser formato MLX el soporte nativo es en hardware Apple.
- Despliegue: mediante mlx-lm (versión probada 0.32.3.dev13 con MLX 0.32.4). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles. Al activar solo ~52B de parámetros por token, la velocidad de generación debería ser comparable a la de un modelo denso de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Formato | Cuantización | Licencia |
|---|---|---|---|---|---|
| Mistral-Large-4-1T-A52B-Text-3bit (MLX) | ~1,05 T | ~52B | safetensors (MLX) | 3 bits (gs 64) | mistral-ecosystem-open-weight-license |
| mistralai/Mistral-Large-4-1T-A52B (original) | ~1,05 T | ~52B | FP8 | FP8 | mistral-ecosystem-open-weight-license |
| DeepSeek-V3 | 671B | 37B | safetensors | FP8 / cuantizaciones comunitarias | licencia propia (uso comercial con restricciones) |
| Qwen3-235B-A22B | 235B | 22B | safetensors / GGUF | múltiples | Apache 2.0 |

La comparativa con DeepSeek-V3 y Qwen3 se ofrece como referencia de la categoría de modelos MoE abiertos de gran tamaño; sus cifras corresponden a conocimiento general y no a los datos del repositorio analizado.

## Limitaciones y advertencias

- Requisito de memoria extremo: ~459 GB hacen que el modelo sea inaccesible para la gran mayoría de desarrolladores; sin una máquina con 512 GB de memoria unificada no es ejecutable.
- Es una conversión comunitaria (mlx-community), no oficial de Mistral AI: la calidad de la cuantización a 3 bits puede degradar el rendimiento respecto al checkpoint FP8 original, y no se han publicado evaluaciones que cuantifiquen esa degradación.
- Variante solo de texto: carece del encoder de visión del original, por lo que cualquier capacidad multimodal queda fuera.
- No incluye el draft head DSpark, de modo que la aceleración por decodificación especulativa del checkpoint original no está disponible.
- Cuantización a 3 bits (3,5 bits/peso): es una compresión muy agresiva; cabe esperar pérdida de precisión en razonamiento fino, código y matemáticas.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponibles en la información proporcionada.
- Licencia: mistral-ecosystem-open-weight-license es una licencia tipo "other" con condiciones propias; conviene revisar el texto de la licencia antes de cualquier uso comercial.
- Descargas muy bajas (339 en el momento de la ficha) y sin likes: comunidad de usuarios reducida, lo que implica menos soporte y menos detección de bugs.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlx-community/Mistral-Large-4-1T-A52B-Text-3bit
- Modelo base original: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Model card original de Mistral AI: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B (referenciado en el README)
- Pull request de mlx-lm usada para la conversión: https://github.com/ml-explore/mlx-lm/pull/2018
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia del modelo: https://huggingface.co/mlx-community/Mistral-Large-4-1T-A52B-Text-3bit/blob/main/LICENSE
