# ogtsvc/lingbot-world-fast-diffusers-int8

## Resumen

LingBot-World Fast int8 es una versión cuantizada a 8 bits del transformer de robbyant/lingbot-world-fast-diffusers, un modelo del mundo (world model) para generación de vídeo a partir de una imagen que el equipo Robbyant publicó en abierto. La conversión la firma el usuario ogtsvc y mantiene intactos el codificador de texto, el decodificador, el tokenizer, el scheduler y el índice del pipeline originales, de modo que la carpeta es autosuficiente.

El objetivo es reducir el coste de memoria sin tocar la arquitectura: el transformer pasa de 74,2 GB en FP32 a 18,6 GB en int8, y la carpeta completa de 86,1 GB a 30,5 GB. La cuantización es weight-only, con una escala por fila de salida, y deja el timestep embedder en bf16 porque cargarlo en int8 produce fotogramas negros.

Es relevante porque los world models de vídeo suelen quedar fuera del alcance del hardware de consumo por su tamaño; esta variante lo acerca a estaciones de trabajo con 48 GB de memoria de GPU o a equipos Apple Silicon con memoria unificada amplia. A cambio, no es un formato diffusers estándar y exige un cargador específico que construya las capas int8 antes de cargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión causal para image-to-video (world model); pipeline `LingBotWorldCausalDMDPipeline` |
| Parámetros totales | 18.547.604.544 (recuento de safetensors reportado para el repositorio); el transformer cuantizado ocupa 18,6 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la entrada es una imagen, un prompt de texto y condicionamiento de cámara) |
| Tipos de cuantización | int8 weight-only, una escala por fila de salida, aplicada a 566 capas; el resto de pesos en bf16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato no estándar de diffusers; requiere cargador propio) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión causal para generación de vídeo condicionada por imagen, comercializado como «Fast» por su vocación interactiva en tiempo real. Sus capas cuantizadas cubren self-attention y cross-attention, feed-forward, condicionamiento de cámara, text embedding y time projection: en total, 566 tensores 2-D `.weight` con al menos 1.048.576 valores y con ambas dimensiones múltiplos de 32. Quedan sin cuantizar las normas, los sesgos, las tablas de modulación, el patch embedding, la cabeza de salida y el timestep embedder, que se mantienen en el dtype original (bf16 donde el original estaba en FP32).

La cuantización es determinista y se documenta en `transformer/int8_quantization.json`. Para cada capa se calcula `scale = max(|W|, fila) / 127` y `q = round(W / scale)` recortado a [-127, 127]; el checkpoint guarda `<nombre>.weight` como int8 `[out, in]` y `<nombre>.weight_scale` como float32 `[out]`, de forma que `W ≈ q * scale[:, None]`. La decodificación puede hacerse desquantizando por capa o con un matmul int8 weight-only como `torch._weight_int8pack_mm(x, q, scale)`.

No hay información en el material disponible sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO del modelo base; esta ficha describe una conversión post-entrenamiento, no un reentrenamiento. Las innovaciones atribuibles al proyecto original son la generación de mundos interactiva en tiempo real y la memoria a largo plazo estable.

## Capacidades

- Generación de vídeo a partir de una sola imagen (image-to-video), con la imagen como primera condición del clip.
- Simulación de entornos con dinámica estable en dominios diversos (realismo, contextos científicos, estilos de dibujo animado), según la descripción del proyecto original.
- Control de cámara mediante el condicionamiento específico incluido en el transformer.
- Memoria a largo plazo a lo largo de la secuencia, orientada a mantener la coherencia del mundo generado.
- Operación interactiva en tiempo real, rasgo diferencial de la variante «Fast».
- Soporte de tool calling o function calling: no (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no disponibles; la única entrada textual es el prompt del pipeline, cuyo idioma no se especifica.
- Capacidades especiales adicionales (modo thinking, audio, VLM): no disponibles.

## Casos de uso

- Simulación de entornos para entrenamiento de agentes y robótica: el modelo genera rollouts visuales interactivos a partir de una imagen de referencia y con memoria a lo largo de la secuencia, lo que permite aumentar datos de entrenamiento sin montar escenas 3D; la variante int8 reduce el peso del transformer a 18,6 GB y facilita mantener el pipeline residente en una sola máquina.
- Prototipado rápido de videojuegos y mundos interactivos: un diseñador parte de un concept art y explora el mundo resultante en tiempo real, usando el condicionamiento de cámara para inspeccionar el entorno antes de invertir en arte final.
- Previsualización y efectos visuales: generar planos animados desde un storyboard o una imagen fija para validar encuadres, movimiento de cámara y continuidad, con la ventaja de que la carpeta int8 de 30,5 GB cabe en estaciones de trabajo con GPU de 48 GB.
- Simulación de escenarios para conducción autónoma: sintetizar vistas desde la cámara de un vehículo a partir de una imagen de calle, con control de la trayectoria mediante el condicionamiento de cámara, para cubrir casos límite poco frecuentes en datos reales.
- Creación de contenido y demos interactivas: producir clips cortos o experiencias navegables desde una única imagen, apoyándose en la memoria a largo plazo para evitar saltos entre fotogramas.
- Educación y divulgación científica: animar diagramas o ilustraciones estáticas para explicar procesos dinámicos, sacando partido de la generación condicionada por imagen y de la estabilidad temporal del modelo.
- Investigación en world models y en cuantización: usar esta variante como referencia para medir el impacto real de int8 frente al original en FP32, comparando escenas con la misma imagen, prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha medido ninguna puntuación de benchmark. La única comparación publicada es un control cualitativo de brillo medio por fotograma a 640×352 sobre el primer fragmento (9 fotogramas), con idéntica imagen, prompt y semilla:

| Fotograma (1-9) | Brillo medio int8 | Brillo medio original bf16 |
|---|---|---|
| 1 | 96 | 95 |
| 2 | 87 | 89 |
| 3 | 81 | 80 |
| 4 | 81 | 81 |
| 5 | 82 | 81 |
| 6 | 85 | 85 |
| 7 | 86 | 86 |
| 8 | 90 | 89 |
| 9 | 90 | 90 |

Las diferencias se mantienen dentro de 2 niveles de 255. El segundo fragmento no se comparó porque cada ejecución usó una entrada de cámara distinta.

## Requisitos de hardware

- Tamaño en disco: 30,5 GB para la carpeta completa (frente a 86,1 GB del original); el transformer int8 suman 18,6 GB repartidos en 16 shards.
- Memoria al cargar: alrededor de 31 GB con transformer y codificador de texto residentes, medido a 640×352 sobre un Apple M3 Ultra.
- Memoria durante la generación: 44-46 GB en el mismo escenario; se recomienda un mínimo de 48 GB de memoria de GPU o unificada para evitar offload.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB. Una RTX 4090 de 24 GB no puede mantener el pipeline completo sin descarga a CPU.
- Cabe en GPU de consumo: no de forma holgada; solo con offload parcial y a resoluciones reducidas.
- Apple Silicon: probado en M3 Ultra con memoria unificada, soportado mediante MPS.
- Opciones de despliegue: `diffusers` con un cargador propio que instancie las capas int8 antes de cargar los pesos. No es compatible con llama.cpp ni Ollama, al no ser un modelo de lenguaje, y no hay confirmación de soporte en vLLM o TGI.
- Latencia y throughput: no disponibles; la model card solo reporta consumo de memoria, no tiempos por fotograma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ogtsvc/lingbot-world-fast-diffusers-int8 (este) | 18.547.604.544 (safetensors); transformer de 18,6 GB | No disponible | Sin benchmarks; brillo dentro de 2/255 frente al original en 9 fotogramas | Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| robbyant/lingbot-world-fast-diffusers (original) | No disponible | No disponible | Sin benchmarks publicados en la información disponible | Apache-2.0 (según el repositorio derivado) | HuggingFace; transformer de 74,2 GB en FP32 y carpeta de 86,1 GB |
| FastVideo/LingBot-World-Fast-Diffusers | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Robbyant/lingbot-world-v2 | No disponible | No disponible | No disponible | No disponible | GitHub |

## Limitaciones y advertencias

- No hay ninguna puntuación de benchmark publicada para esta variante; la única validación es la comparación de brillo medio en 9 fotogramas.
- La comparación publicada cubre solo el primer fragmento (9 fotogramas); el segundo se ejecutó con entradas de cámara distintas y no se comparó.
- La cuantización int8 introduce pérdida de precisión frente al original en FP32; la magnitud de esa pérdida en secuencias largas no está medida.
- El checkpoint no es un formato diffusers estándar: un cargador genérico puede castear los pesos int8 a coma flotante y degradar el modelo. Hay que construir las capas con `weight` int8 y `weight_scale` float32 antes de cargar.
- El timestep embedder debe permanecer en bf16; si se cuantiza, todos los fotogramas salen negros.
- Los world models de vídeo tienden a acumular deriva y artefactos en secuencias largas; no hay datos en la información disponible sobre la estabilidad más allá del primer fragmento.
- Idiomas soportados no disponibles: se desconoce el comportamiento del prompt de texto en castellano.
- Licencia Apache-2.0 en este repositorio, lo que en principio permite uso comercial; conviene revisar igualmente los términos del modelo base y de los componentes no modificados (codificador de texto, tokenizer, decodificador).
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- Requiere hardware de gama alta: 44-46 GB de memoria en generación a 640×352, fuera del alcance de una GPU de consumo de 24 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ogtsvc/lingbot-world-fast-diffusers-int8
- Modelo base: https://huggingface.co/robbyant/lingbot-world-fast-diffusers
- Espejo en HuggingFace: https://huggingface.co/FastVideo/LingBot-World-Fast-Diffusers
- Repositorio GitHub del proyecto: https://github.com/robbyant/lingbot-world
- Repositorio GitHub de la versión v2: https://github.com/Robbyant/lingbot-world-v2
- Sitio del proyecto: https://www.lingbot-world.org/
- Artículo referenciado en las etiquetas: arxiv:2601.20540
