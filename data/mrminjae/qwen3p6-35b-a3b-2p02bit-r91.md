# mrminjae/qwen3p6-35b-a3b-2p02bit-r91

## Resumen

Qwen3p6-35b-a3b-2p02bit-r91 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva de los expertos enrutados (routed experts) a una media de 2,02 bits. El resto de pesos del modelo se mantiene en BF16, y los pesos se almacenan ya dequantizados en tensores BF16, de modo que el checkpoint carga con transformers estándar y con vLLM sin necesidad de kernels de cuantización especiales.

El modelo conserva la arquitectura del base, un transformer de tipo MoE (mixture of experts) con 35.951.822.704 parámetros totales, y mantiene la capacidad multimodal image-text-to-text que declaran sus tags. La propuesta es relevante porque explora hasta qué punto se pueden comprimir los expertos enrutados de un MoE de 35B sin tocar el resto de la red, manteniendo compatibilidad directa con el ecosistema de inferencia habitual.

Se trata de un checkpoint interno de investigación, sin descargas ni likes en el momento de redactar esta ficha, y sin model card detallada más allá de la tabla de identificación. La licencia sigue la del modelo base, aunque el campo de licencia del repo aparece como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), clase `qwen3_5_moe`; multimodal image-text-to-text |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el autor indica que sigue la del modelo base (Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) y capacidad multimodal de entrada imagen-texto. El autor no documenta el número de parámetros activos por token, el número de expertos, la dimensión oculta ni la configuración de atención, por lo que estos detalles no están disponibles en la información proporcionada.

La modificación respecto al base consiste en una cuantización dirigida exclusivamente a los expertos enrutados, con una media de 2,02 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de forma que el checkpoint se carga con transformers y vLLM estándar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO adicionales; el identificador interno «r91» sugiere una iteración de un proceso de investigación, pero no se aporta información sobre el procedimiento de cuantización (algoritmo, calibración, granularidad por grupo).

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y el tag `conversational`.
- Procesamiento multimodal de entrada imagen-texto, según el tag `image-text-to-text`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Carga directa con transformers y vLLM sin kernels de cuantización adicionales, al estar los pesos en BF16 dequantizado.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas o código: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite medir el impacto de comprimir solo los expertos enrutados a 2,02 bits frente al modelo base en BF16, comparando perplejidad y calidad de generación en el mismo pipeline de evaluación.
- Despliegue experimental en vLLM: al cargar con vLLM estándar, se puede integrar en un servicio de inferencia compatible con la API de OpenAI para pruebas de latencia y throughput sin adaptar kernels.
- Prototipado de asistentes conversacionales multimodales: el tag image-text-to-text permite experimentar con diálogos que reciben imágenes como entrada en entornos de investigación, siempre que se valide la calidad frente al base.
- Evaluación de ahorro de memoria: al mantener solo los expertos a baja precisión, sirve para estudiar la reducción de huella de memoria en GPUs de gama alta sin reentrenar el modelo completo.
- Reproducción de experimentos internos: el identificador r91 y la estructura mínima del repo permiten reproducir el checkpoint en pipelines de investigación propios del autor o de terceros que quieran auditar la técnica.
- Base para futuros fine-tunes: al ser compatible con transformers, puede servir como punto de partida para ajustes posteriores en tareas específicas, asumiendo el riesgo de degradación por la cuantización de los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repo ocupa 71,9 GB, coherente con pesos almacenados en BF16 para 35.951.822.704 parámetros.
- VRAM estimada para inferencia: al menos el tamaño del repo más overhead de activaciones y caché KV; no disponible una cifra exacta sin conocer contexto y parámetros activos.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, requiere GPUs de centro de datos con 80 GB o más por dispositivo, o reparto multi-GPU.
- ¿Cabe en GPU de consumo? No disponible; con 71,9 GB de pesos en BF16 no cabe en una única GPU de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: transformers y vLLM, según indica el autor; llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r91 | 35.951.822.704 | no disponible | Expertos enrutados a 2,02 bits; resto BF16 | Sigue la del base (no disponible en el repo) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35.951.822.704 (según este derivado) | no disponible | BF16 original | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna: sin model card detallada, sin benchmarks y sin descargas registradas; no hay evidencia publicada de su calidad frente al base.
- La cuantización a 2,02 bits de los expertos enrutados puede degradar la calidad de generación y el razonamiento; no se documenta la magnitud de la pérdida.
- Licencia no disponible en el repositorio; el autor remite a la del modelo base, por lo que el uso comercial queda sujeto a los términos de Qwen/Qwen3.6-35B-A3B, que no se detallan aquí.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificarlo.
- Parámetros activos no disponibles, lo que impide estimar con precisión coste computacional por token.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de cualquier uso en producción.
- Almacenar los pesos dequantizados en BF16 anula parte del ahorro de memoria esperado de una cuantización a 2 bits; el beneficio es principalmente de investigación, no de despliegue en hardware limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r91
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
