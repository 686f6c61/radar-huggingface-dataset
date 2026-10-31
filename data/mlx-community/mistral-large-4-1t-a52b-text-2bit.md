# mlx-community/Mistral-Large-4-1T-A52B-Text-2bit

## Resumen

Mistral-Large-4-1T-A52B-Text-2bit es una cuantización a 2 bits, en formato MLX, del modelo Mistral-Large-4-1T-A52B de Mistral AI, publicada por la comunidad mlx-community en Hugging Face. El modelo base es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) que combina aproximadamente 1,05 billones de parámetros totales (1.049.357.365.536 según los pesos en safetensors) con unos 52.000 millones de parámetros activos, tal como indica la nomenclatura del repositorio original. Esta conversión resuelve un problema concreto: permitir ejecutar un modelo gigantesco en hardware Apple Silicon con memoria unificada, reduciendo el tamaño de los pesos hasta unos 338 GB.

La cuantización se ha realizado de forma selectiva: los expertos enrutados usan cuantización afín de 2 bits, mientras que el resto de capas emplean 6 bits, con un tamaño de grupo de 64, lo que resulta en una media de 2,58 bits por peso. Es importante destacar que se trata de una conversión de solo texto: no incluye el codificador de visión ni la cabecera de borrador DSpark del checkpoint original, por lo que las capacidades multimodales y la decodificación especulativa no están disponibles en esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mistral_large4) |
| Parámetros totales | 1.049.357.365.536 (~1,05 billones) |
| Parámetros activos | ~52.000 millones (52B, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit afín (expertos enrutados), 6-bit afín (resto de capas), grupo 64, 2,58 bits/peso; router y proyecciones del indexer en bf16 |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight-license (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Mistral-Large-4-1T-A52B, es un transformer de mezcla de expertos (MoE) con aproximadamente 1,05 billones de parámetros totales de los cuales alrededor de 52.000 millones se activan por token. El checkpoint original incluye además un codificador de visión y un mecanismo de borrador (DSpark draft head) presumiblemente destinado a decodificación especulativa, aunque ninguno de los dos componentes está presente en esta conversión de solo texto. La cuantización de esta versión se realizó descuantizando primero los pesos FP8 y aplicando después cuantización afín de 2 bits a los expertos enrutados y de 6 bits al resto de capas, con grupo de tamaño 64; el router y dos proyecciones del indexer se mantienen en bf16, igual que en el checkpoint original.

Sobre los datos de entrenamiento, el número de tokens, la composición del corpus y el uso de técnicas de alineación como RLHF o DPO no están disponibles en la información proporcionada; para esos detalles debe consultarse la model card original de mistralai/Mistral-Large-4-1T-A52B.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Inferencia optimizada en Apple Silicon mediante el framework MLX y la librería mlx-lm.
- Arquitectura MoE con activación dispersa (~52B de parámetros activos por token), lo que reduce el coste computacional por token frente a un modelo denso equivalente.
- No disponible en esta conversión: capacidades de visión (el codificador de visión no se incluye) y decodificación especulativa (la cabecera de borrador DSpark no se incluye).
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada (consultar la model card del modelo base).

## Casos de uso

- Experimentación local con modelos de escala billónica en Mac Studio o clústeres Apple Silicon: la cuantización a 2 bits reduce los requisitos de memoria hasta ~338 GB, un tamaño que puede acomodarse en configuraciones con memoria unificada muy elevada.
- Investigación en cuantización extrema: esta conversión es un caso de estudio práctico sobre cómo afecta la cuantización mixta (2-bit para expertos, 6-bit para el resto) a un modelo MoE de gran escala.
- Generación de texto conversacional offline: mediante mlx-lm se puede ejecutar inferencia local sin depender de servicios en la nube, útil para prototipado de chatbots con privacidad de datos.
- Evaluación comparativa de calidad tras cuantización: permite comparar las respuestas de la variante 2-bit frente al checkpoint FP8 original para medir la degradación.
- Desarrollo de aplicaciones sobre MLX: el ejemplo de código incluido en la model card facilita la integración en aplicaciones Python que usan la API de mlx-lm.
- Pruebas de carga y rendimiento de memoria unificada: el pico de memoria documentado (~338 GB en una generación corta) sirve como referencia para dimensionar despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es un pico de memoria de aproximadamente 338 GB durante una prueba corta de generación.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~338 GB (pico medido en una generación corta con esta cuantización a 2,58 bits por peso). El tamaño del repositorio es de 338,2 GB.
- GPU recomendadas: al usar MLX, el modelo se ejecuta sobre memoria unificada de Apple Silicon; se necesitaría una configuración con al menos 384-512 GB de memoria unificada (por ejemplo, Mac Studio o Mac Pro con chip M3 Ultra en configuración máxima). No es viable en GPUs NVIDIA convencionales con esta conversión, ya que el formato es específico de MLX.
- Consumer GPUs: no cabe en ninguna GPU de consumo; tampoco en la mayoría de estaciones de trabajo. Requiere hardware de gama muy alta con memoria unificada.
- Despliegue: mlx-lm (versión probada: 0.32.3.dev13, con MLX 0.32.4). No es compatible con vLLM, llama.cpp, Ollama o TGI al tratarse de pesos en formato MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| mlx-community/Mistral-Large-4-1T-A52B-Text-2bit | ~1,05 B (billón) | ~52.000 M | 2-bit/6-bit mixta (2,58 bpw) | safetensors (MLX) | mistral-ecosystem-open-weight-license |
| mistralai/Mistral-Large-4-1T-A52B (original) | ~1,05 B (billón) | ~52.000 M | FP8 | safetensors | mistral-ecosystem-open-weight-license |
| Otras conversiones MLX de mlx-community | variable | variable | variable (típicamente 4-bit) | safetensors (MLX) | según modelo base |

La principal alternativa es el checkpoint original de Mistral AI en FP8, que conserva el codificador de visión y la cabecera de borrador DSpark, pero requiere mucho más espacio de almacenamiento y hardware compatible con FP8. No hay datos de rendimiento comparables disponibles.

## Limitaciones y advertencias

- Conversión de solo texto: no incluye el codificador de visión ni la cabecera de borrador DSpark, por lo que carece de capacidades multimodales y de decodificación especulativa.
- Cuantización agresiva: la cuantización de 2 bits en los expertos enrutados puede degradar notablemente la calidad de las respuestas respecto al checkpoint original en FP8; no se han publicado evaluaciones que cuantifiquen esta degradación.
- Requisito de memoria extremo: con ~338 GB de pico de memoria, solo es ejecutable en hardware Apple Silicon de gama muy alta, lo que limita severamente su accesibilidad.
- Restricciones de licencia: el modelo está bajo la mistral-ecosystem-open-weight-license, una licencia de tipo "other" cuyos términos deben revisarse antes de cualquier uso comercial.
- Sesgos, riesgo de alucinación, longitud de contexto e idiomas soportados: no disponible en la información proporcionada; deben consultarse la model card del modelo base y la licencia.
- Versión de software: probado únicamente con mlx-lm 0.32.3.dev13 y MLX 0.32.4; versiones distintas pueden presentar incompatibilidades.
- Advertencia general: se trata de una conversión comunitaria (mlx-community), no oficial de Mistral AI, con muy poca tracción (400 descargas y 1 like en el momento de la ficha), por lo que el soporte y la validación son limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlx-community/Mistral-Large-4-1T-A52B-Text-2bit
- Modelo base original: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Model card del modelo original: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Pull request de mlx-lm usado en la conversión: https://github.com/ml-explore/mlx-lm/pull/2018
- Organización mlx-community: https://huggingface.co/mlx-community
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
