# KlangAI/pianissimo-da-mlx-4bit

## Resumen

Pianissimo-da-mlx-4bit es una versión cuantizada a 4 bits del modelo de reconocimiento automático del habla (ASR) KlangAI/pianissimo-da, especializado en danés y desarrollado por KlangAI. Está empaquetada específicamente para ejecutarse en GPUs de Apple silicon (M1 o posteriores) mediante MLX y la librería parakeet-mlx, sin necesidad de PyTorch ni NeMo. El modelo resuelve la transcripción de audio a texto en danés con un rendimiento competitivo en un formato extremadamente ligero.

La arquitectura subyacente es FastConformer con decodificación TDT (Token-and-Duration Transducer), con 627 millones de parámetros totales. La cuantización a 4 bits reduce el peso de descarga a 528 MB, lo que lo convierte en la variante más pequeña de la familia, a costa de un ligero incremento del WER (7,80 % frente a 7,43 % del modelo original en FLEURS).

Su relevancia actual radica en la combinación de un modelo ASR de calidad para un idioma de recursos medios como el danés con un formato de despliegue optimizado para hardware de consumo Apple, lo que facilita la transcripción local y privada sin infraestructura de GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (atención local de 256 frames por lado en el encoder) |
| Tipos de cuantización | 4 bits (grupos de 32 pesos en las capas lineales del encoder; resto en bfloat16) |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en FastConformer, una variante eficiente del encoder Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada, combinada con un decodificador TDT (Token-and-Duration Transducer). Esta arquitectura de transcripción predice conjuntamente tokens y duraciones, lo que permite alineamientos más eficientes que los transductores tradicionales. El modelo conserva la atención local del checkpoint original, con una ventana de 256 frames a cada lado.

Esta versión concreta es una conversión del checkpoint fp32 liberado por KlangAI, cuantizada con las herramientas nativas de MLX. Las capas lineales del encoder se cuantizan a 4 bits con grupos de 32 pesos, mientras que el resto de pesos se mantienen en bfloat16. No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o ajuste fino supervisado en el modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) en danés, con salida de texto plano.
- Generación de marcas de tiempo a nivel de oración y de token (`result.sentences` y `sentence.tokens`).
- Procesamiento de audio largo mediante fragmentación automática en bloques de 2 minutos con 15 segundos de solapamiento (configurable o desactivable con `chunk_duration=None`).
- Acepta archivos de audio o arrays NumPy mono a 16 kHz.
- Phrase boosting: soporte de vocabulario personalizado para mejorar la ortografía de nombres y términos concretos, con resultados equivalentes a los de NeMo en el modelo original.
- Ejecución en GPU de Apple silicon mediante MLX, sin PyTorch ni NeMo.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción local de reuniones y entrevistas en danés: el modelo procesa grabaciones largas fragmentándolas automáticamente y devuelve marcas de tiempo, lo que permite generar actas o subtítulos sin enviar audio a servicios en la nube.
- Subtitulado de vídeo y pódcast: con RTFx de 126× en un M5 Pro, un audio de una hora se procesa en menos de medio minuto, lo que hace viable generar subtítulos en lote en un portátil.
- Investigación cualitativa con entrevistas: investigadores que trabajan con corpus orales en danés pueden transcribir localmente material sensible cumpliendo requisitos de privacidad, al no requerir conexión externa.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo real integrados en herramientas de escritorio para macOS, aprovechando la GPU integrada del equipo.
- Preprocesado de datos para entrenamiento de modelos: generación de transcripciones a gran escala de corpus de audio danés con un coste de hardware mínimo.
- Prototipado rápido en Mac: desarrolladores que necesitan validar un pipeline ASR en danés antes de desplegar en producción pueden usar esta variante de 528 MB sin configurar entornos CUDA.
- Transcripción con vocabulario técnico: el phrase boosting permite corregir la ortografía de nombres propios, instituciones (por ejemplo, «Folketinget») o marcas en dominios especializados.

## Benchmarks y rendimiento

| Modelo | Pesos | Descarga | FLEURS test (WER %) | Velocidad (RTFx) | Memoria, 5 min |
|---|---|---:|---:|---:|---:|
| pianissimo-da | fp32 | 2,51 GB | 7,43 | no disponible | no disponible |
| pianissimo-da-mlx-8bit | 8 bits | 759 MB | 7,49 | 151× | 2,2 GB |
| pianissimo-da-mlx-4bit | 4 bits | 528 MB | 7,80 | 126× | 2,2 GB |
| pianissimo-da-mlx | bf16 | 1,25 GB | 7,48 | 140× | 2,7 GB |
| pianissimo-da-mlx-fp32 | fp32 | 2,51 GB | 7,43 | 173× | 3,8 GB |

El WER se mide sobre los 930 clips daneses del conjunto de test de FLEURS con el normalizador de evaluación del autor. La velocidad (RTFx) se midió sobre un clip de 30 segundos y la memoria es el pico de uso de GPU durante la transcripción de 5 minutos. Estas métricas de velocidad y memoria se midieron con el modelo sueco de la misma arquitectura en una GPU Apple M5 Pro de 24 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2,2 GB de pico durante la transcripción de 5 minutos de audio.
- Hardware objetivo: Macs con Apple silicon (M1 o posteriores); las métricas de referencia se tomaron en un M5 Pro con 24 GB.
- No está pensado para GPUs NVIDIA; para esas plataformas el autor ofrece las versiones ONNX.
- Despliegue mediante MLX y parakeet-mlx 0.5.2, con el cargador `pianissimo_mlx.py` incluido en el repositorio (necesario para los pesos cuantizados; parakeet-mlx directo no los soporta y añade ~0,2 puntos de WER por diferencias de preprocesado).
- Dependencias: `parakeet-mlx==0.5.2`, `huggingface_hub`, `sentencepiece` y `ffmpeg` para leer archivos de audio.
- Throughput: 126× en tiempo real sobre un clip de 30 segundos en M5 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS (da) | Licencia | Plataforma |
|---|---|---|---|---|---|
| pianissimo-da-mlx-4bit | 627 M | no disponible | 7,80 | CC BY 4.0 | Apple silicon (MLX) |
| pianissimo-da-mlx-8bit | 627 M | no disponible | 7,49 | CC BY 4.0 | Apple silicon (MLX) |
| pianissimo-da (original) | 627 M | no disponible | 7,43 | CC BY 4.0 | PyTorch/NeMo |
| pianissimo-da-onnx | 627 M | no disponible | no disponible | CC BY 4.0 | ONNX (multiplataforma) |

No se dispone en la información proporcionada de comparaciones con modelos ASR de otros autores para danés.

## Limitaciones y advertencias

- Solo soporta danés; no es multilingüe.
- La cuantización a 4 bits degrada ligeramente la precisión: 7,80 % de WER frente a 7,43 % del fp32, y en una comprobación en Mac coincidió con la referencia fp32 normalizada en 133 de 200 clips de FLEURS.
- Es necesario usar el cargador incluido en el repositorio; llamar directamente a parakeet-mlx no funciona con estos pesos cuantizados y empeora el WER.
- Dependencia de hardware Apple silicon: no es desplegable en GPUs NVIDIA ni en CPU convencional sin recurrir a las variantes ONNX.
- El phrase boosting requiere construir manualmente el vocabulario; no hay corrección automática de nombres.
- Riesgo de alucinación inherente a los modelos ASR en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se dispone de datos sobre sesgos específicos.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar al autor.
- No se han publicado datos sobre composición del dataset de entrenamiento ni sobre el rendimiento en dominios acústicos distintos de FLEURS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KlangAI/pianissimo-da-mlx-4bit
- Modelo base: https://huggingface.co/KlangAI/pianissimo-da
- Versión 8 bits: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Versión bf16: https://huggingface.co/KlangAI/pianissimo-da-mlx
- Versión fp32 MLX: https://huggingface.co/KlangAI/pianissimo-da-mlx-fp32
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Librería MLX: https://github.com/ml-explore/mlx
- parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
