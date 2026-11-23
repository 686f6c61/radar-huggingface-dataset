# nightmedia/Qwen3.8-27B-USS-Prism-q4-hi-mlx

## Resumen

Qwen3.8-27B-USS-Prism-q4-hi-mlx es un modelo experimental de 27.356 millones de parámetros publicado por el usuario nightmedia en Hugging Face, fruto de un merge multi-etapa (receta nuslerp según la model card) que combina varios modelos derivados de la familia Qwen 3.x. El resultado se distribuye en formato MLX con cuantización de 4 bits de alta fidelidad (q4-hi), pensado para inferencia eficiente en hardware Apple Silicon, y se etiqueta como pipeline image-text-to-text, aunque la información disponible no detalla el componente de visión.

El modelo no es un entrenamiento desde cero ni un fine-tune clásico: es una fusión de pesos de seis modelos base (Jackrong/Qwopus3.8-27B-Coder-Flash, schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven, nightmedia/Qwen3.8-27B-Brainwaves, nightmedia/Qwen3.8-27B-MindMeld y OmniJev/OneJev1.6-27B), con etiquetas que apuntan a destilación de estilo Claude, razonamiento con chain-of-thought largo, codificación, escritura creativa y roleplay. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino, japonés y español.

Su relevancia es acotada y experimental: la model card incluye métricas propias de "Brainwaves" (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande) y datos de perplejidad, memoria pico y tokens por segundo para distintas cuantizaciones, lo que permite evaluar el compromiso precisión/rendimiento antes de desplegarlo. Con 456 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.x, tag `qwen3_5`/`qwen3_6`); detalles exactos no disponibles |
| Parámetros totales | 27.356.728.560 (~27,36 B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | se anuncian 256k y 1M en las etiquetas; no confirmado en la model card |
| Tipos de cuantización | q4-hi (esta versión); la card reporta también bf16, mxfp8, q8-hi, q6-hi, oQ4e-mtp y mxfp4 en los componentes |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,8 GB); variante MLX para esta build q4-hi |
| Pipeline declarado | image-text-to-text |
| Modelo base | merge de Jackrong/Qwopus3.8-27B-Coder-Flash, schneewolflabs/B1-27B, nightmedia/Qwen3.6-27B-Seven, nightmedia/Qwen3.8-27B-Brainwaves, nightmedia/Qwen3.8-27B-MindMeld, OmniJev/OneJev1.6-27B |
| Librería | transformers |

## Arquitectura y entrenamiento

La información disponible describe un merge de pesos, no un entrenamiento. La receta indicada es "multi-step nuslerp", una técnica de fusión por interpolación esférica normalizada aplicada en varias etapas sobre seis modelos base de ~27B derivados de Qwen 3.5/3.6. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; las etiquetas mencionan SFT, LoRA y "claude-distillation", lo que sugiere que los componentes base incorporan datos destilados de un modelo Claude, pero no hay detalle verificable en la card.

El autor publica métricas de evaluación propias bajo el nombre "Brainwaves" para distintas cuantizaciones del merge y de sus componentes, con perplejidad, memoria pico y throughput. Para esta build q4-hi, la card reporta perplejidad 3,776 ± 0,023, memoria pico de 23,72 GB y 220 tokens/s, valores coherentes con el resto de cuantizaciones de 4 bits (mxfp4: 3,812 de perplejidad, 21,20 GB, 222 tokens/s). No se documentan innovaciones arquitectónicas propias más allá de la fusión; las etiquetas de cadena de pensamiento largo y razonamiento provienen de los modelos componentes.

## Capacidades

- Generación de texto conversacional y instruction-tuned, según las etiquetas del repo.
- Razonamiento con chain-of-thought largo (long-cot) y modo de razonamiento, heredado de los componentes etiquetados como reasoning.
- Codificación y asistencia de software: el componente Qwopus3.8-27B-Coder-Flash está orientado a código, razonamiento agéntico y uso de herramientas.
- Matemáticas y STEM, según las etiquetas math y stem.
- Escritura creativa y ficción: generación de tramas, subtramas, continuación de escenas y roleplay, con etiquetas específicas de narrativa y "vivid prose".
- Multilingüe limitado a inglés, chino, japonés y español.
- Capacidad image-text-to-text declarada por el pipeline, aunque la card no documenta el módulo de visión ni ejemplos de uso multimodal.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el componente coder se posiciona para tool use.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: la build q4-hi ocupa 23,72 GB de memoria pico y rinde 220 tokens/s, lo que permite integrarla en un flujo de autocompletado y revisión de código en un Mac con memoria unificada amplia, sin depender de la nube.
- Generación de ficción y narrativa larga: las etiquetas de plot generation, sub-plot generation y scene continue, junto con el contexto anunciado de 256k, la hacen adecuada para mantener coherencia en relatos de varios capítulos y roleplay con personajes persistentes.
- Razonamiento matemático y STEM con traza explícita: el modo long-cot permite obtener cadenas de razonamiento auditables para problemas de competición o verificación de cálculos, útil en entornos educativos y de investigación.
- Prototipado de agentes conversacionales multilingües: al cubrir en, zh, ja y es, sirve para probar asistentes en esos cuatro idiomas antes de comprometerse con un modelo mayor o con licencia más restrictiva.
- Experimentación académica con técnicas de merge: al ser un artefacto de fusión documentado con métricas por cuantización, es un caso de estudio para investigar el impacto de nuslerp y de la cuantización 4-bit en la calidad.
- Evaluación comparativa de cuantizaciones: la card ofrece perplejidad, memoria y throughput para bf16, mxfp8, q8-hi, q6-hi, q4-hi, oQ4e-mtp y mxfp4, lo que permite elegir el punto de equilibrio para un despliegue concreto.
- Base para fine-tuning experimental: con licencia Apache 2.0 y pesos safetensors, se puede adaptar con LoRA a dominios específicos sin restricciones de uso comercial.

## Benchmarks y rendimiento

Datos publicados en la model card para esta build y sus componentes (métricas "Brainwaves"; no son benchmarks estándar publicados por terceros):

| Modelo / cuantización | ARC | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| USS-Prism bf16 | 0,737 | 0,900 | 0,915 | 0,833 | 0,524 | 0,834 | 0,801 |
| USS-Prism q4-hi | 0,738 | 0,901 | 0,914 | 0,836 | 0,526 | 0,833 | 0,800 |
| USS-Prism mxfp4 | 0,739 | 0,899 | 0,913 | 0,826 | 0,534 | 0,832 | 0,800 |
| MindMeld bf16 | 0,742 | 0,897 | 0,913 | 0,840 | 0,514 | 0,834 | 0,791 |
| OneJev1.6-27B mxfp8 | 0,726 | 0,881 | 0,916 | no disponible | no disponible | no disponible | no disponible |
| Qwopus3.8-Coder-Flash mxfp8 | 0,605 | 0,783 | 0,900 | no disponible | no disponible | no disponible | no disponible |

Rendimiento por cuantización del merge USS-Prism:

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,752 ± 0,023 | 60,70 GB | 256 |
| mxfp8 | 3,763 ± 0,023 | 34,64 GB | 212 |
| q8-hi | 3,752 ± 0,023 | 37,16 GB | 212 |
| q6-hi | 3,760 ± 0,023 | 30,44 GB | 211 |
| q4-hi | 3,776 ± 0,023 | 23,72 GB | 220 |
| oQ4e-mtp | 3,777 ± 0,023 | 23,18 GB | 208 |
| mxfp4 | 3,812 ± 0,023 | 21,20 GB | 222 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 23,72 GB de memoria pico para la build q4-hi; 21,20 GB para mxfp4; 60,70 GB para bf16.
- GPU recomendadas: no se especifican en la card. Por tamaño, un despliegue en bf16 requiere GPUs de 80 GB (A100/H100) o reparto multi-GPU; las cuantizaciones de 4 bits caben en GPUs de 24 GB (RTX 4090) y en memoria unificada de Apple Silicon de 32 GB o más.
- Consumer GPU: la variante q4-hi (23,72 GB) encaja ajustadamente en una RTX 4090 de 24 GB; mxfp4 (21,20 GB) deja más margen. En Mac, el formato MLX está pensado para memoria unificada de 32 GB en adelante.
- Opciones de despliegue: la build es MLX, por lo que el entorno natural es mlx-lm en Apple Silicon. Al estar en safetensors y con librería transformers, también puede cargarse con transformers; para vLLM, llama.cpp, Ollama o TGI no hay confirmación en la información disponible.
- Latencia y throughput: 220 tokens/s con q4-hi y 222 tokens/s con mxfp4 según las mediciones del autor; el bf16 alcanza 256 tokens/s. Estas cifras corresponden al hardware usado por el autor, no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| USS-Prism q4-hi (este) | 27,36 B | 256k/1M anunciados, no confirmados | ARC 0,738; HellaSwag 0,836; perplejidad 3,776 | Apache 2.0 | Hugging Face, 456 descargas |
| Qwen3.8-27B-MindMeld | ~27 B | no disponible | ARC 0,742; HellaSwag 0,840; perplejidad 3,693 (bf16) | no disponible | Hugging Face (componente) |
| OmniJev/OneJev1.6-27B | ~27 B | no disponible | ARC 0,726; perplejidad 5,403 (mxfp8) | no disponible | Hugging Face (componente) |
| Qwopus3.8-27B-Coder-Flash | ~27 B | no disponible | ARC 0,605; BoolQ 0,900 (mxfp8) | no disponible | Hugging Face (componente) |

La comparación se limita a los propios componentes del merge porque la información proporcionada no incluye modelos externos de referencia. Las cifras de MindMeld en bf16 superan ligeramente a las del merge en ARC y HellaSwag, mientras que la perplejidad del merge es peor (3,776 frente a 3,693), lo que sugiere que la fusión no mejora de forma uniforme a sus partes.

## Limitaciones y advertencias

- Modelo experimental y de autor único: la card lo etiqueta explícitamente como experimental; no hay validación independiente de sus capacidades.
- Benchmarks no estándar: las métricas "Brainwaves" son propias del autor y no permiten comparación directa con MMLU, HumanEval o GSM8K.
- Contexto no verificado: las etiquetas anuncian 256k y 1M de contexto, pero la card no documenta configuración de RoPE ni pruebas de contexto largo; conviene validarlo antes de confiar en ventanas grandes.
- Capacidad multimodal incierta: el pipeline image-text-to-text sugiere visión, pero no se describe el módulo ni se ofrecen ejemplos; no debe asumirse soporte de imagen fiable.
- Riesgo de alucinación: al ser un merge de modelos destilados y ajustados por SFT, el riesgo de alucinación es el habitual en esta familia; no hay evaluaciones de factualidad.
- Trazas de razonamiento largo: el modo long-cot puede inflar la latencia y el consumo de tokens en producción si no se controla la longitud de la cadena.
- Idiomas: solo en, zh, ja y es; el rendimiento en español no está medido en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de varios modelos base conviene revisar las condiciones de cada componente antes de un despliegue comercial.
- Formato MLX: la build q4-hi está optimizada para Apple Silicon; su uso en GPUs NVIDIA requiere reconversión y no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism-q4-hi-mlx
- Componente MindMeld: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Componente Brainwaves: https://huggingface.co/nightmedia/Qwen3.8-27B-Brainwaves
- Componente Seven: https://huggingface.co/nightmedia/Qwen3.6-27B-Seven
- Componente coder: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Componente B1: https://huggingface.co/schneewolflabs/B1-27B
- Componente OneJev: https://huggingface.co/OmniJev/OneJev1.6-27B
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
