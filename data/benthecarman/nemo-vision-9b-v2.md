# benthecarman/nemo-vision-9b-v2

## Resumen

`benthecarman/nemo-vision-9b-v2` es un adaptador de visión (projector) de 129 millones de parámetros que otorga capacidades multimodales al modelo de lenguaje `NVIDIA-Nemotron-Nano-9B-v2` mediante un empalme de embeddings estilo LLaVA. El desarrollador, benthecarman, lo presenta como un experimento de capacidad: el LLM base es una versión podada con Minitron del Nemotron 12B (arquitectura híbrida Mamba-2/Transformer con solo 4 capas de atención), y el adaptador es el único componente entrenado, manteniendo los pesos del LLM bit-idénticos al checkpoint original.

El modelo resuelve la pregunta de si un LLM híbrido podado conserva suficiente capacidad para absorber una modalidad visual sin modificar sus pesos internos. Los resultados indican que sí, aunque con un rendimiento inferior al del modelo VL oficial de NVIDIA para el hermano no podado de 12B. Relevancia actual: demuestra una vía eficiente para añadir visión a modelos existentes sin reentrenar el LLM, con un coste de entrenamiento reducido (solo el projector) y una licencia MIT para el adaptador, si bien el uso práctico hereda restricciones del modelo base y del extractor de visión RADIO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Projector MLP de 2 capas (adaptador) sobre base híbrida Mamba-2/Transformer (Nemotron Nano 9B v2) |
| Parametros totales | 129 M (solo el adaptador; el LLM base tiene ~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bf16; el LLM base puede cuantizarse aparte) |
| Idiomas soportados | Inglés y lenguajes de código (del base); también alemán, francés, italiano, español y japonés según la ficha del base |
| Licencia | MIT (adaptador); uso requiere NVIDIA Open Model License (LLM) y NVIDIA Source Code License no comercial (RADIO) |
| Formato de pesos | PyTorch (ficheros `.pt`; no se indica safetensors) |

## Arquitectura y entrenamiento

El adaptador sigue un pipeline de visión fijo: la imagen se redimensiona a 512 píxeles, se procesa con el extractor RADIOv2.5-B (congelado), se genera una rejilla de parches de 32×32, se aplica un pixel shuffle con factor 2 para obtener 256 tokens de dimensión 3072, y un MLP de 2 capas proyecta estos tokens a los embeddings del LLM. El resultado se inserta en `inputs_embeds` en un marcador con id 900, usando el formato de prompt `[INST] {prompt} <IMG> [/INST]`. La decodificación es greedy, ya que el modelo base NemotronH no soporta `generate(inputs_embeds=)`.

El entrenamiento se realiza en dos etapas, solo sobre el projector: primero alineación con LLaVA-558K (1 época) y después ajuste por instrucciones con LLaVA-Instruct-150K (1 época). El LLM permanece congelado e intacto. El autor también probó variantes con LoRA en las capas de atención y en las proyecciones de Mamba, pero estas resultaron peores que el adaptador puro, tanto en rendimiento visual como en daño al texto.

## Capacidades

- Generación de descripciones de imágenes (captioning) en inglés, con resultados medibles en COCO val2017.
- Integración de visión en un LLM híbrido Mamba-2/Transformer sin modificar sus pesos.
- Soporte de un único turno de conversación con imagen; no hay modo chat multi-turno.
- No dispone de tool calling, function calling, ni capacidades de agente.
- No integra modo de razonamiento explícito (reasoning mode) del base; la inferencia es greedy.
- Multilingüe limitado a los idiomas del modelo base, aunque la evaluación de visión se realiza en inglés.

## Casos de uso

- Evaluación de capacidad de visión en modelos híbridos podados: sirve como banco de pruebas para medir si un LLM con arquitectura Mamba-2/Transformer reducida puede absorber una modalidad adicional mediante un adaptador ligero.
- Prototipado rápido de captioning de imágenes: con el script `infer.py` del repositorio, se puede obtener una descripción de una imagen local sin necesidad de entrenar un modelo VL completo.
- Investigación en adaptadores multimodales: el diseño de empalme de embeddings (splice) y el pipeline con RADIO pueden servir de referencia para experimentos similares con otros LLMs.
- Comparación de estrategias de adaptación: los resultados con LoRA frente a projector puro ofrecen datos útiles para decidir cómo añadir visión a modelos existentes.
- Docencia y divulgación: el código y los artefactos permiten estudiar el flujo completo de un adaptador de visión, desde la extracción de características hasta la inserción en el LLM.
- Experimentación con restricciones de licencia: al ser el adaptador MIT, se puede redistribuir y modificar libremente, aunque el uso en producción está limitado por las licencias del LLM y de RADIO.

## Benchmarks y rendimiento

La model card reporta dos conjuntos de métricas. Para visión, se mide la entropía cruzada (CE) forzada por profesor en 200 imágenes de COCO val2017, con el mismo prompt para todas las filas (menor es mejor):

| Modelo | Caption CE |
|---|---|
| Projector congelado (inicialización aleatoria) | 3.850 |
| **Este modelo (projector-only, ambas etapas)** | **3.363** |
| LoRA en 4 capas de atención (54.7 M params) | 4.536 |
| LoRA + proyección Mamba (54.6 M params) | 4.177 |
| VL oficial 12B (sin podar, 7 tokens de visión, entrenamiento completo) | 2.864 |

Para texto, se usó lm-eval 0.4.12 en modo completion (una sola pasada), con el LLM sin modificar:

| Benchmark | Configuración | Puntuación |
|---|---|---|
| MMLU | 5-shot | 74.63 |
| GPQA-Diamond | 0-shot | 35.35 |
| IFEval | 0-shot | prompt-strict 46.21 |
| MATH500 | 4-shot | 31.0 (math_verify) |

Estas puntuaciones de texto corresponden al modelo base, no al adaptador. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~24 GiB en bf16 para la inferencia completa (LLM + adaptador + RADIO).
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de memoria.
- No cabe en GPUs de consumo de gama baja (8-16 GB) sin cuantización del LLM base, aunque el adaptador en sí es pequeño.
- Opciones de despliegue: el repositorio proporciona un script de inferencia (`scripts/infer.py`) que descarga el adaptador y el LLM automáticamente. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación es greedy y manual, sin optimizaciones de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **nemo-vision-9b-v2 (este)** | 9B LLM + 129M adaptador | No disponible | Sí (adaptador) | MIT (adaptador), NVIDIA Open Model License (LLM), RADIO no comercial | Hugging Face |
| NVIDIA Nemotron Nano 9B v2 (base) | ~9B | No disponible | No | NVIDIA Open Model License | Hugging Face |
| NVIDIA Nemotron 12B VL (oficial) | ~12B | No disponible | Sí (nativo) | NVIDIA Open Model License | Hugging Face |

El adaptador se sitúa claramente por detrás del VL oficial de 12B en todas las métricas de visión (CE 3.363 frente a 2.864), lo que el autor reconoce como un experimento de capacidad, no un modelo de producción. No se dispone de comparativas con otros adaptadores de visión para el mismo base.

## Limitaciones y advertencias

- Confabulación en imágenes de primer plano: en una imagen de una cebra acicalándose, tanto este modelo como el VL oficial de 12B describen una madre con su cría amamantando. Los resultados deben tratarse como plausibles, no verificados.
- Rendimiento inferior al VL oficial de 12B en todos los instrumentos de visión; no es adecuado para producción.
- Solo soporta un turno con formato `[INST]`; no hay modo chat, ni integración con el modo de razonamiento del base, ni ajuste de seguridad más allá del del modelo base.
- Número fijo de 256 tokens de visión; no hay tiling dinámico para imágenes de alta resolución o con múltiples objetos.
- La licencia del adaptador es MIT, pero el uso práctico requiere el LLM bajo NVIDIA Open Model License y el extractor RADIO bajo NVIDIA Source Code License no comercial, lo que impide su uso comercial sin licencias adicionales.
- Los datos de entrenamiento (LLaVA-558K, LLaVA-Instruct-150K, COCO val2017) son CC-BY-4.0, pero las imágenes pertenecen a sus propietarios originales.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/benthecarman/nemo-vision-9b-v2
- Modelo base NVIDIA-Nemotron-Nano-9B-v2: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Repositorio de código y entrenamiento: https://github.com/benthecarman/nemo-vision
