# gatilin/nld-uni-packed-image-codec

## Resumen

`gatilin/nld-uni-packed-image-codec` es una extracción comunitaria de un subconjunto de pesos del modelo multimodal NVIDIA NLD-Uni, publicada por el usuario gatilin en Hugging Face. En concreto, contiene únicamente los tensores del módulo `encoder.packed_image_codec.*`, es decir, el puente lineal aprendido (`PackedLinearImageCodec`) que empaqueta cuatro embeddings visuales vecinos de 4096 dimensiones en un único embedding "padre" y los reconstruye a partir de él. No se trata de un modelo generativo completo ni de un codificador de imágenes autónomo.

El componente pertenece a la ruta de generación de imágenes de NLD-Uni y forma parte de un sistema mayor que incluye un tokenizador VQ, capas de embedding y predicción, codificación posicional, escalado y un backbone de lenguaje/difusión. Ninguno de esos elementos se incluye en este repositorio. El modelo suma 134 225 920 parámetros en cuatro tensores BF16 que conservan nombres y valores originales del checkpoint de NVIDIA (revisión `5db755a2eb0ab84654e3dcf80c7d0245bfe36a50`).

Su relevancia es acotada: sirve para reproducir el comportamiento exacto del puente de empaquetado/desempaquetado del sistema original en investigación sobre arquitecturas multimodales, no como modelo de inferencia de extremo a extremo. La compresión y expansión no son inversas sin pérdida, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente lineal aprendido (`PackedLinearImageCodec`) sobre embeddings visuales de 4096 dimensiones; no es un transformer completo |
| Parametros totales | 134 225 920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-research-license (uso limitado a investigación o evaluación no comercial según la sección 3.3) |
| Formato de pesos | safetensors (carga vía PyTorch) |
| Modelo base | nvidia/NLD-Uni (revisión 5db755a2eb0ab84654e3dcf80c7d0245bfe36a50) |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 0.3 GB |

## Arquitectura y entrenamiento

El módulo reproduce fielmente la implementación original `bridge.py` de NLD-Uni. Se trata de una capa lineal que opera sobre una rejilla espacial fija: dado un tensor de embeddings visuales con dimensiones de rejilla pares `(height, width)`, agrupa bloques de 4 embeddings hijos de 4096 dimensiones en un embedding padre mediante una transformación lineal aprendida, y aplica la operación inversa para expandir padres a hijos. Los cuatro tensores se conservan en BF16 con sus nombres originales.

No se dispone de información sobre los datos de entrenamiento del puente, el número de tokens utilizados, si hubo ajuste fino con RLHF/DPO ni detalles del proceso de optimización, más allá de que proviene del checkpoint publicado por NVIDIA. El propio autor aclara que la compresión y expansión no son inversas sin pérdida: la verificación de ida y vuelta solo cubre el ordenamiento espacial de índices enteros, no la reconstrucción exacta de los embeddings.

## Capacidades

- Empaquetado de embeddings visuales: comprime cuatro embeddings hijos de 4096 dimensiones en un único embedding padre sobre una rejilla espacial de dimensiones pares.
- Desempaquetado: expande embeddings padre de vuelta a cuatro embeddings hijos con la misma disposición espacial.
- Carga estricta del módulo original mediante `component.load_model(directory)`, con verificación de nombres y formas de tensores.
- Interfaz programática `compress_fixed_grid(embeddings, (height, width))` y `expand_fixed_grid(parents, (height, width))`.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multimodalidad de entrada/salida completa.
- No incluye tokenizador VQ, capas de embedding/predicción, codificación posicional, escalado ni backbone de lenguaje o difusión.

## Casos de uso

- Investigación sobre empaquetado de tokens visuales: permite estudiar cómo un puente lineal aprendido reduce la secuencia de embeddings visuales en un factor de 4, útil para analizar el impacto en el coste computacional de modelos multimodales.
- Reproducción de experimentos con NLD-Uni: integrado junto al resto de componentes del checkpoint original, sirve para verificar el comportamiento exacto del codec en pipelines de investigación ya existentes.
- Análisis de pérdida de información: al no ser inversas sin pérdida, permite cuantificar la degradación introducida por la compresión comparando embeddings reconstruidos con los originales.
- Auditoría de checkpoints: los ficheros `tensor_mapping.json`, `extraction.json` y `validation.json` permiten trazar la procedencia de cada tensor y validar la extracción frente al modelo base.
- Prototipado de variantes de compresión: sirve como referencia para comparar diseños alternativos de puentes lineales en sistemas de generación de imágenes por tokens.
- Pruebas de integración en CPU: el propio autor incluye un smoke test sintético en CPU que permite validar la carga y las formas de salida sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta un smoke test sintético en CPU sobre entradas de rejilla con dimensiones pares para verificar la carga estricta del módulo, sin métricas de calidad de reconstrucción ni de rendimiento.

## Requisitos de hardware

- VRAM estimada: los 134,2 M de parámetros en BF16 ocupan aproximadamente 0,27 GB, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más, e incluso en CPU.
- GPU recomendadas: cualquiera con soporte PyTorch; no requiere A100 ni H100 para cargar los pesos. La viabilidad de inferencia real depende del backbone original de NLD-Uni, que no se incluye.
- Cabe en GPU consumer: sí, cualquier RTX o similar con al menos 2 GB de VRAM.
- Opciones de despliegue: carga directa con PyTorch y safetensors mediante `component.load_model(directory)`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; depende del tamaño de la rejilla y del dispositivo, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/nld-uni-packed-image-codec | 134,2 M (solo el puente) | Empaquetado/desempaquetado de embeddings visuales | no aplica | nvidia-research-license (no comercial) | Hugging Face, 0 descargas |
| gatilin/nld-uni-image-tokenizer | ~0,5 B (según la búsqueda) | Componente de tokenización de imágenes de NLD-Uni | no disponible | no disponible | Hugging Face |
| nvidia/NLD-Uni | no disponible | Modelo multimodal completo de NVIDIA | no disponible | nvidia-research-license | Hugging Face (modelo base) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El componente está incompleto: no es un VAE, ni un DiT, ni un generador de imágenes; sin el tokenizador VQ, las capas de embedding y predicción y el backbone, no produce imágenes.
- La compresión y expansión no son inversas sin pérdida; la reconstrucción introduce degradación que el autor no cuantifica.
- Las dimensiones de la rejilla deben ser pares; entradas con dimensiones impares no son válidas según la interfaz documentada.
- Los tensores deben tener el mismo dtype que los parámetros del modelo (BF16); mezclar precisiones puede provocar errores de carga o resultados incorrectos.
- Licencia restrictiva: la sección 3.3 de la NVIDIA License limita el uso a investigación o evaluación no comercial, con las excepciones indicadas por NVIDIA. No apto para producción comercial sin autorización.
- Riesgo de sesgos y alucinaciones no evaluable en este componente, al no generar contenido.
- Repositorio con 0 descargas y 0 likes, publicado en 2026: sin validación comunitaria ni mantenimiento garantizado.
- Se deben conservar todos los avisos de copyright originales de NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/nld-uni-packed-image-codec
- Modelo base NVIDIA NLD-Uni: https://huggingface.co/nvidia/NLD-Uni
- Componente relacionado (tokenizer): https://huggingface.co/gatilin/nld-uni-image-tokenizer
