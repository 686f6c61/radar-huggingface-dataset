# mlx-community/sam-audio-base-swift-fp16

## Resumen

SAM-Audio base es un modelo de separación de fuentes de audio desarrollado por Meta (Facebook Research) que permite aislar un sonido concreto de una mezcla de audio a 48 kHz describiéndolo en lenguaje natural con unas pocas palabras ("speech", "dog barking", "drums"). El modelo devuelve dos señales: el sonido descrito (`target`) y el resto de la mezcla (`residual`). Esta ficha cubre la conversión `mlx-community/sam-audio-base-swift-fp16`, un bundle específico para el port Swift-MLX `mlx-sam-audio-swift`, orientado a ejecución en Apple Silicon.

La arquitectura combina un transformer de flow-matching de 16 capas y dimensión 2048 (1.150,3 M de parámetros en fp16) con un codificador de texto T5-base y un códec DAC-VAE que incorpora una rama de marca de agua AudioSeal. El bundle separa los pesos en tres ficheros (`model`, `text_encoder`, `codec`) con los nombres de clave que esperan los módulos Swift, incluye el tokenizador T5 y aplica el término `align_masked_video` que otras conversiones eliminan.

Su relevancia es doble: por un lado, demuestra la separación de audio guiada por texto en hardware de consumo Apple; por otro, documenta y corrige una discrepancia numérica de aproximadamente 20 dB frente al PyTorch original (18,6–24,7 dB frente a 110,7–112,0 dB) que en sus pruebas provocaba objetivos silenciosos en 8 de 160 extracciones. La licencia SAM permite uso comercial pero impone restricciones de uso y obliga a mantener la marca de agua en las salidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de flow-matching (16 capas × 2048) + codificador de texto T5-base + códec DAC-VAE con rama de watermark AudioSeal |
| Parámetros totales | 1.150.337.538 (1.150,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (transformer), fp32 (text encoder y codec); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | SAM License (Meta), última actualización 19 de noviembre de 2025 |
| Formato de pesos | safetensors (MLX) |
| Pipeline | audio-to-audio |
| Frecuencia de muestreo | 48 kHz, mono |
| Tamaño del repo | 3,2 GB |
| Modelo base | facebook/sam-audio-base (commit 81f64008f9f9) |
| Librería | mlx (port Swift: mlx-sam-audio-swift) |

## Arquitectura y entrenamiento

El núcleo es un transformer de flow-matching de 16 capas con dimensión oculta 2048, acompañado de proyecciones de entrada, anclas de span temporal y los términos del módulo `align_masked_video`. El texto se codifica con T5-base (99 tensores en fp32, ya que T5 desborda en media precisión) y el audio se procesa mediante un códec DAC-VAE (251 tensores en fp32, con weight norm plegado) que incluye la rama de marca de agua AudioSeal. El bundle contiene 318 tensores en el transformer. No se incluyen el codificador visual, los modelos de re-ranking, el judge ni el predictor de spans.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La conversión se realizó con la herramienta `Tools/convert` del paquete Swift desde el checkpoint upstream `facebookresearch/sam-audio` (commit bb4c699) y el códec `facebookresearch/dacvae` (commit 414c207). La innovación técnica destacable de este bundle es la conservación de los tensores de `align_masked_video`: cuando no hay prompt de vídeo, SAM-Audio ejecuta ese módulo sobre una característica de vídeo todo ceros, lo que añade una constante aprendida a cada frame; las conversiones existentes lo eliminan y el port de mlx-audio omite el paso, lo que degrada la concordancia con PyTorch y puede producir un target silencioso.

## Capacidades

- Separación de fuentes de audio guiada por texto: aísla el sonido descrito en inglés ("speech", "dog barking", "drums") de una mezcla a 48 kHz.
- Salida dual: señal `target` (sonido descrito) y `residual` (todo lo demás), ambas mono a 48 kHz y con la longitud de la mezcla.
- Prompts de span temporal: permite indicar intervalos (por ejemplo, `[0,5 s – 1,9 s]` y `[3,0 s – 4,4 s]`) para sonidos intermitentes como golpes en una puerta.
- Marca de agua AudioSeal embebida en cada waveform de salida, sin interruptor para desactivarla.
- Ejecución en Apple Silicon mediante MLX y el paquete Swift `SAMAudioCore`.
- Sin prompting visual, sin re-ranking y sin predicción de spans en esta conversión.
- Capacidad multilingüe limitada al inglés en el prompt de texto.

## Casos de uso

- Postproducción de audio y vídeo: separar diálogo de música y efectos en una mezcla estéreo o mono para reequilibrar niveles, sustituir una pista musical o aislar una locución; el modelo devuelve target y residual alineados en longitud y a 48 kHz, lo que evita remuestreos posteriores.
- Limpieza de grabaciones de campo: aislar "birds" o "wind" de una grabación ambiental para analizar cada componente por separado, usando los spans temporales para sonidos intermitentes.
- Creación de datasets de entrenamiento: extraer voces o instrumentos concretos de mezclas existentes para generar pares etiquetados de forma automática, aprovechando que la salida residual conserva el resto de la mezcla.
- Herramientas de accesibilidad: resaltar o atenuar sonidos específicos (por ejemplo, "alarm" o "speech") en contenido reproducido, ejecutando el modelo localmente en un Mac con Apple Silicon.
- Investigación en separación de audio: comparar el comportamiento del port Swift-MLX frente a la implementación PyTorch upstream, con la ventaja de que este bundle reproduce el término `align_masked_video` y permite medir la concordancia real (110,7–112,0 dB en las pruebas del autor).
- Prototipado en apps macOS/iOS: integrar `SAMAudioCore` en una aplicación Swift para separar sonidos bajo demanda sin depender de servicios en la nube, a costa de asumir la licencia SAM y la marca de agua en las salidas.
- Análisis forense o de contenido: aislar una voz concreta de una grabación para transcripción o verificación, teniendo en cuenta que la salida lleva watermark AudioSeal y que el modelo solo entiende prompts en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta una métrica de concordancia con PyTorch upstream medida a través del pipeline Swift en un M5 Max sobre 58 separaciones de mezclas de 10 s:

| Configuración | Concordancia con PyTorch upstream |
|---|---|
| Conversiones existentes sin `align_masked_video` | 18,6–24,7 dB |
| Este bundle con el término restaurado | 110,7–112,0 dB |

| Métrica cualitativa | Sin el término | Con el término |
|---|---|---|
| Targets silenciosos | 8 de 160 extracciones | 0 de 58 extracciones |

## Requisitos de hardware

- VRAM/unificada estimada: el repo ocupa 3,2 GB; el transformer en fp16 son 2,30 GB, el text encoder fp32 0,44 GB y el codec fp32 0,43 GB. En Apple Silicon la memoria unificada debe acomodar al menos esos pesos más activaciones y buffers de audio.
- GPU recomendadas: el bundle está diseñado para Apple Silicon vía MLX; el autor midió en un M5 Max. No se documentan requisitos para GPU NVIDIA.
- Cabe en hardware de consumo Apple: sí, en equipos con memoria unificada suficiente (los 3,2 GB de pesos más overhead lo sitúan al alcance de configuraciones de 16 GB o superiores, aunque el dato exacto de memoria pico no está disponible).
- Opciones de despliegue: paquete Swift `mlx-sam-audio-swift` (producto `SAMAudioCore`, desde 0.1.0) con MLX. No es compatible con mlx-audio, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta 58 separaciones de mezclas de 10 s en un M5 Max, sin cifras de tiempo por separación en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/sam-audio-base-swift-fp16 (este) | 1.150,3 M | no disponible | Texto (inglés) + spans temporales | SAM License | Swift-MLX | Hugging Face, 0 descargas |
| mlx-community/sam-audio-base | no disponible | no disponible | Texto | SAM License | mlx-audio (Python) | Hugging Face |
| mlx-community/sam-audio-base-fp16 | no disponible | no disponible | Texto | SAM License | mlx-audio (Python) | Hugging Face |
| facebook/sam-audio-base | no disponible | no disponible | Texto (+ vídeo en upstream completo) | SAM License | PyTorch | Hugging Face |

Las conversiones de mlx-audio son la alternativa directa, pero no pueden cargar los ficheros de este bundle ni viceversa: usan nombres de clave distintos, el T5 se descarga en tiempo de ejecución y no conservan `align_masked_video` ni la rama de watermark. El checkpoint upstream de Meta es la referencia de fidelidad, a costa de requerir PyTorch. No se dispone de datos de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Solo acepta prompts en inglés; no se documenta soporte de otros idiomas.
- Esta conversión no incluye prompting visual, re-ranking, judge ni predictor de spans; el alcance se limita a prompts de texto y spans temporales.
- Los pesos están en fp16 (transformer) y fp32 (T5 y codec); no se ofrecen cuantizaciones de menor precisión.
- Todas las salidas llevan una marca de agua AudioSeal embebida y el port no permite desactivarla; hay que advertirlo a los usuarios finales.
- La licencia SAM permite uso comercial, pero prohíbe usos controlados por ITAR, relacionados con fines militares o bélicos, industrias o aplicaciones nucleares, espionaje, y desarrollo o uso de armas de fuego o armas ilegales; exige cumplimiento de sanciones y legislación aplicable.
- La redistribución de versiones convertidas o modificadas solo se permite bajo la SAM License y con una copia de la misma.
- Se prohíbe involucrar o animar a otros a hacer ingeniería inversa, descompilar o descubrir los componentes subyacentes.
- El usuario debe indemnizar a Meta frente a reclamaciones de terceros derivadas de su uso o distribución; no hay garantía y Meta puede modificar la licencia.
- En publicaciones de investigación hay que reconocer los SAM Materials.
- Riesgo de alucinación y de separaciones defectuosas: el propio autor documenta targets silenciosos en conversiones que omiten `align_masked_video`; este bundle lo corrige, pero no hay datos de robustez fuera del conjunto de prueba del autor.
- Sin datos publicados sobre sesgos del modelo ni sobre comportamiento con mezclas fuera de las condiciones medidas.
- Compatibilidad exclusiva con el runtime Swift-MLX: no se puede usar con mlx-audio ni con stacks de inferencia convencionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema muy incipiente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/sam-audio-base-swift-fp16
- Modelo base upstream: https://huggingface.co/facebook/sam-audio-base
- Conversión mlx-audio (Python): https://huggingface.co/mlx-community/sam-audio-base
- Conversión mlx-audio fp16: https://huggingface.co/mlx-community/sam-audio-base-fp16
- Repositorio del port Swift: https://github.com/xocialize/mlx-sam-audio-swift
- Repositorio mlx-audio: https://github.com/Neywa-Labs/mlx-audio
- Issue sobre `align_masked_video`: https://github.com/Neywa-Labs/mlx-audio/issues/1176
- Código upstream SAM-Audio: https://github.com/facebookresearch/sam-audio
- Códec DAC-VAE: https://github.com/facebookresearch/dacvae
- Paper (arXiv): https://arxiv.org/abs/2512.18099
