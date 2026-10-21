# gatilin/unitok_large_visual_codec

## Resumen

UniTok Large unified visual codec es una publicación de pesos del códec visual UniTok, extraída del checkpoint oficial de FoundationVision. No es un modelo de lenguaje ni un generador de imágenes de extremo a extremo: es un componente que convierte imágenes RGB en identificadores discretos, las reconstruye y extrae características semánticas alineadas con una torre de texto CLIP. El paquete incluye el encoder ViTamin-L, las proyecciones de atención, ocho codebooks normalizados, el decoder RGB, la proyección semántica de imagen y la torre de texto CLIP entrenada.

El release conserva el mapeo completo `trainer.unitok` con 1335 tensores y sus nombres, dtypes y bytes originales; excluye el discriminador, el optimizador y el estado del entrenador. El modelo tiene 820.333.507 parámetros y un tamaño de repositorio de 3,3 GB. Cada posición espacial se representa con ocho identificadores locales en [0, 4095], uno por cada codebook de 4096 entradas.

Es relevante para equipos que investigan modelos multimodales unificados y necesitan un tokenizador de imágenes reproducible, con pesos auditables y una ruta validada de 256×256. Su utilidad principal es servir como componente de tokenización y reconstrucción dentro de pipelines mayores, no como modelo conversacional autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec visual UniTok: encoder ViTamin-L, proyecciones de atención, ocho codebooks normalizados, decoder RGB, proyección semántica de imagen y torre de texto CLIP |
| Parámetros totales | 820.333.507 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; rejilla espacial validada de 256×256 con 8 identificadores por posición |
| Tipos de cuantización | No disponible; pesos en safetensors con su dtype original. No se documentan GGUF, AWQ, GPTQ ni otros formatos |
| Idiomas soportados | No disponible; la torre CLIP está incluida, pero no se incluyen activos BPE ni generador de lenguaje |
| Licencia | Apache-2.0 para los pesos; código del proyecto bajo MIT; componentes OpenCLIP con atribución OpenAI |
| Formato de pesos | safetensors con código PyTorch |
| Resolución de imagen validada | 256×256: redimensionado del lado corto con Lanczos, recorte central, conversión a RGB y rango [-1, 1] |
| Tokenización de imagen | 8 identificadores locales por posición espacial, cada uno en [0, 4095] |
| Vocabulario | 32768, suma de ocho codebooks de 4096 entradas; no es el límite superior de cada identificador local |

## Arquitectura y entrenamiento

La arquitectura es un códec visual discreto de la familia UniTok. El encoder ViTamin-L transforma la imagen en una rejilla de características; cada posición se cuantiza contra ocho codebooks normalizados de 4096 entradas. La búsqueda de códigos normaliza cada sub-codebook antes de concatenar vectores de 64 dimensiones. El decoder RGB reconstruye la imagen a partir de los identificadores y la proyección semántica produce características de imagen normalizadas de 768 dimensiones. La torre de texto CLIP se instancia con la implementación vendida por el proyecto original y permite obtener características de texto mediante `encode_text`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras etapas de alineamiento. Por la naturaleza del componente, no se trata de un modelo de lenguaje con alineamiento conversacional. El decoder nativo asume una rejilla de tokens cuadrada y este release valida únicamente la ruta entrenada de 256×256. El encoder híbrido nativo requiere `timm==1.0.8`; versiones más recientes usan argumentos de constructor incompatibles. El checkpoint restaura estrictamente el mapeo completo y conserva la procedencia del código fuente fijada a la revisión `bb8012e` de FoundationVision/UniTok.

## Capacidades

- Tokenización discreta de imágenes RGB de 256×256 en ocho identificadores por posición espacial.
- Reconstrucción de imagen mediante el decoder RGB nativo, con pipeline de imagen a imagen.
- Extracción de características semánticas de imagen normalizadas de 768 dimensiones mediante `encode_image`.
- Codificación de texto con la torre CLIP incluida mediante `encode_text`, siempre que se aporte la tokenización BPE del proyecto original.
- Carga estricta de pesos con nombres, dtypes y bytes preservados para auditoría y reproducibilidad.
- No incluye generador de lenguaje, pipeline de difusión ni modelo de lenguaje completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de audio, de vídeo ni de visión de alta resolución.

## Casos de uso

- **Investigación en modelos multimodales unificados**: convertir imágenes en secuencias de identificadores discretos para entrenar transformers autorregresivos que compartan un vocabulario con texto. La estructura de ocho codebooks de 4096 entradas facilita definir un vocabulario visual compacto y separable.
- **Compresión y transporte de representaciones visuales**: codificar una imagen de 256×256 en ocho mapas de identificadores y reconstruirla con el decoder. Es adecuado para experimentos de compresión discreta y almacenamiento de latentes, no para sustituir códecs de producción sin evaluar la calidad.
- **Preprocesamiento para MLLM**: generar características semánticas de 768 dimensiones y alinearlas con características de texto CLIP en un espacio común. Los procesadores de prompts de MLLM posteriores pueden aplicar sus propias convenciones.
- **Evaluación reproducible de tokenizadores**: usar `validation.json` y `validate.py` para comprobar hashes de tensores, geometría de codebooks, comportamiento de codificación/decodificación y paridad de búsqueda directa. Es útil en auditorías internas de pesos y procedencia.
- **Pipelines de imagen a imagen en investigación**: emplear el decoder como autoencoder discreto o como etapa de reconstrucción dentro de un sistema mayor de edición o restauración, validando primero la calidad en el dominio objetivo.
- **Recuperación semántica multimodal**: combinar `encode_image` con `encode_text` para experimentos de búsqueda imagen-texto, siempre que se aporte el tokenizador BPE correcto y se evalúe el sesgo de la torre CLIP.
- **Congelación de un códec para fine-tuning**: mantener fijos los pesos del códec y entrenar cabezas o adaptadores downstream sobre los identificadores o las características semánticas, reduciendo el coste frente a entrenar un tokenizador desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. `validation.json` recoge comprobaciones sintéticas de carga estricta, geometría de codebooks, comportamiento de codificación/decodificación, paridad de búsqueda directa y características normalizadas de imagen y texto, pero no reproduce la calidad del artículo original ni la precisión en tareas downstream.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 3,3 GB en FP32, 1,6 GB en FP16/BF16 y 0,8 GB en INT8. Son estimaciones solo de pesos; las activaciones de la imagen de 256×256 no están documentadas.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070 de 12 GB o RTX 4090 de 24 GB para inferencia en FP16. A100 o H100 son útiles para lotes grandes, no necesarias para una sola imagen.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs de 8-12 GB para una imagen de 256×256 en FP16, aunque el consumo real de activaciones debe medirse.
- Opciones de despliegue: PyTorch con `component.load_model` y `snapshot_download`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni motores de inferencia especializados.
- Latencia y throughput: no disponibles. Dependen del hardware, del lote y de si se ejecutan encoder, cuantizador, decoder y torre de texto.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de alternativas en la información proporcionada. La siguiente tabla compara categorías y marca como “no disponible” todo dato no confirmado.

| Modelo | Tipo | Parámetros | Resolución o contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/unitok_large_visual_codec | Códec visual discreto con torre de texto | 820.333.507 | 256×256 validado; 8 identificadores por posición | Apache-2.0 en pesos; MIT en código | HuggingFace |
| FoundationVision/unitok_tokenizer | Modelo base del que se extrae el mapeo | No disponible | No disponible | No disponible | HuggingFace |
| Tokenizadores VQ discretos de la familia VQGAN | Códec visual discreto | No disponible | No disponible | No disponible | No disponible |
| Autoencoders VAE continuos, como SD-VAE | Códec visual continuo | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no mantiene conversaciones, no tiene contexto textual y no debe evaluarse con métricas de chat o razonamiento.
- No incluye activos BPE ni generador de lenguaje. `encode_text` requiere aportar la tokenización del proyecto original.
- Solo se valida la ruta de 256×256. El decoder nativo asume una rejilla cuadrada; otras resoluciones o rejillas no están verificadas en este release.
- La tokenización discreta de ocho identificadores por posición puede perder detalle fino. No hay métricas publicadas de fidelidad de reconstrucción en dominios concretos.
- Las comprobaciones de `validation.json` son sintéticas y no garantizan la calidad del artículo original ni la precisión en tareas downstream.
- El encoder híbrido nativo depende de `timm==1.0.8`; versiones más recientes pueden fallar al construir el modelo.
- Los pesos son Apache-2.0, pero el código es MIT y los componentes OpenCLIP conservan atribución OpenAI. Hay que revisar las licencias de terceros antes de un uso comercial.
- No se documentan sesgos específicos. La torre de texto CLIP puede heredar sesgos de sus datos de entrenamiento; no hay evaluación publicada en esta información.
- El decoder puede introducir detalles plausibles no presentes en la imagen original. No se han publicado métricas de alucinación visual o fidelidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; esto no implica calidad, pero indica que es una publicación de investigación sin validación comunitaria amplia.

## Enlaces

- [HuggingFace: gatilin/unitok_large_visual_codec](https://huggingface.co/gatilin/unitok_large_visual_codec)
- [Modelo base: FoundationVision/unitok_tokenizer](https://huggingface.co/FoundationVision/unitok_tokenizer)
- [Checkpoint oficial del tokenizador, revisión 7f6ea34](https://huggingface.co/FoundationVision/unitok_tokenizer/tree/7f6ea34f2f669d8d250a4376468c69fe4bcb6c65)
- [Repositorio UniTok, revisión bb8012e](https://github.com/FoundationVision/UniTok/tree/bb8012e8e8d7be66928bedd80506c56a55ea6305)
