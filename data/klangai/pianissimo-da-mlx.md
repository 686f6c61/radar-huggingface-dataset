# KlangAI/pianissimo-da-mlx

## Resumen

Pianissimo-da-mlx es la conversión al formato MLX del modelo de reconocimiento automático del habla (ASR) en danés KlangAI/pianissimo-da, desarrollado por Klang. Se trata de un modelo de tipo FastConformer con decodificación TDT (Token-and-Duration Transducer) que resuelve la transcripción de audio a texto en danés y que se distribuye específicamente para su ejecución en GPUs de Apple Silicon (M1 o posteriores) mediante MLX y parakeet-mlx, sin dependencia de PyTorch ni de NeMo.

El modelo cuenta con 627.052.166 parámetros y se publica en precisión bfloat16, lo que reduce el tamaño de descarga a 1,25 GB frente a los 2,51 GB de la versión fp32 original, manteniendo una precisión prácticamente idéntica. Es relevante para desarrolladores que necesitan ejecutar ASR de calidad en local sobre hardware Apple, sin infraestructura GPU dedicada, con un WER de 7,48 % en el conjunto de test FLEURS danés.

La ficha se centra en la variante bf16, si bien el autor publica también versiones de 8 bits (759 MB), 4 bits (528 MB) y fp32 (2,51 GB), además de conversiones ONNX para otras plataformas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificación TDT (Token-and-Duration Transducer) |
| Parámetros totales | 627.052.166 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; atención local de 256 frames por lado; procesamiento en fragmentos de 2 minutos con solapamiento de 15 segundos |
| Tipos de cuantización | bf16 (esta versión); 8 bits y 4 bits en repositorios separados; fp32 en el modelo original |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer, una variante del transformer convolucional optimizada para audio, combinada con un decodificador TDT (Token-and-Duration Transducer). La atención es local, con una ventana de 256 frames a cada lado, lo que limita el coste computacional en grabaciones largas. La conversión a MLX conserva esta atención local del checkpoint original.

Los detalles sobre el volumen de datos de entrenamiento, la composición del corpus y el uso de técnicas como RLHF o DPO no están disponibles en la información proporcionada. La model card indica únicamente que todas las versiones se convierten desde el checkpoint publicado y que la versión bf16 mantiene la precisión del original: en una comprobación sobre Mac coincidió con la referencia fp32 normalizada en 195 de 200 clips de FLEURS. Las versiones de 8 y 4 bits aplican la cuantización integrada de MLX a las capas lineales del encoder, con grupos de 64 pesos para 8 bits y de 32 para 4 bits, almacenando el resto de pesos en bfloat16.

## Capacidades

- Transcripción de voz a texto en danés (ASR) a partir de audio de 16 kHz mono.
- Procesamiento de grabaciones largas mediante fragmentación automática en bloques de 2 minutos con 15 segundos de solapamiento (configurable o desactivable con `chunk_duration`).
- Generación de marcas de tiempo a nivel de frase y de token (`result.sentences` y `sentence.tokens`).
- Phrase boosting o vocabulario personalizado: permite indicar nombres propios y términos técnicos para mejorar su ortografía, con resultados equivalentes a los de NeMo en el modelo original.
- Acepta tanto rutas de fichero de audio como arrays NumPy de 16 kHz mono.
- No dispone de tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción local en Mac: investigación y prototipado de ASR en danés sobre un portátil con Apple Silicon, sin GPU dedicada ni servicios en la nube, gracias a la ejecución nativa con MLX.
- Subtitulado de contenido audiovisual danés: la salida con marcas de tiempo por frase y por token permite generar subtítulos sincronizados para vídeo o pódcast.
- Actas y notas de reuniones: la fragmentación en bloques de 2 minutos con solapamiento hace viable transcribir reuniones de duración arbitraria con un uso de memoria acotado (2,7 GB de pico para 5 minutos en un M5 Pro).
- Sesgo de vocabulario en dominios especializados: el phrase boosting permite forzar la ortografía correcta de nombres de instituciones, marcas o terminología técnica (por ejemplo, «Folketinget» o «Aarhus Universitet»).
- Preprocesado de corpus de voz: generación de transcripciones a gran escala para entrenar o evaluar otros sistemas de PLN en danés, con la versión de 4 bits (528 MB) para maximizar el rendimiento por unidad de memoria.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo real en aplicaciones de escritorio para macOS, con un throughput de 140× en tiempo real medido en un M5 Pro.
- Integración en pipelines de datos: la variante ONNX permite desplegar el mismo modelo fuera de Apple Silicon cuando se necesita portabilidad.

## Benchmarks y rendimiento

| Versión | Pesos | Descarga | WER FLEURS test (%) | Velocidad (RTFx) | Memoria, 5 min |
|---|---|---:|---:|---:|---:|
| pianissimo-da | fp32 original | 2,51 GB | 7,43 | no disponible | no disponible |
| pianissimo-da-mlx-8bit | 8 bits | 759 MB | 7,49 | 151× | 2,2 GB |
| pianissimo-da-mlx-4bit | 4 bits | 528 MB | 7,80 | 126× | 2,2 GB |
| pianissimo-da-mlx | bf16 | 1,25 GB | 7,48 | 140× | 2,7 GB |
| pianissimo-da-mlx-fp32 | fp32 | 2,51 GB | 7,43 | 173× | 3,8 GB |

El WER corresponde a las 930 grabaciones danesas del conjunto de test FLEURS, calculado con el normalizador de evaluación del autor. La velocidad (RTFx) es la duración del audio dividida por el tiempo de procesamiento, medida sobre un clip de 30 segundos. La velocidad y la memoria se midieron sobre el modelo sueco, de arquitectura idéntica, en una GPU Apple M5 Pro de 24 GB. La memoria indicada es el pico de uso de GPU al transcribir una grabación de 5 minutos.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (M1 o posteriores); el modelo se ejecuta en la GPU del Mac mediante MLX y parakeet-mlx.
- Memoria: 2,7 GB de pico de GPU para transcribir 5 minutos con la versión bf16; 2,2 GB con las versiones de 8 y 4 bits; 3,8 GB con fp32.
- Cabe en cualquier Mac Apple Silicon con 8 GB o más de memoria unificada, dado el reducido consumo observado.
- No está pensado para GPUs NVIDIA ni para despliegue con vLLM, TGI o llama.cpp; para esas plataformas el autor ofrece las versiones ONNX.
- Dependencias: `parakeet-mlx==0.5.2`, `huggingface_hub`, `sentencepiece` y `ffmpeg` para la lectura de audio.
- Rendimiento medido: 140× en tiempo real (bf16) y 173× (fp32) en un M5 Pro; la versión de 8 bits alcanza 151×.
- Advertencia del autor: llamar directamente a parakeet-mlx no soporta los pesos cuantizados y aplica un preprocesado ligeramente distinto, lo que añade unos 0,2 puntos porcentuales de WER; debe usarse el loader `pianissimo_mlx.py` incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / arquitectura | WER FLEURS da (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KlangAI/pianissimo-da-mlx (bf16) | 627 M | FastConformer + TDT, atención local 256 frames | 7,48 | CC BY 4.0 | MLX, Apple Silicon |
| KlangAI/pianissimo-da-mlx-4bit | 627 M | FastConformer + TDT | 7,80 | CC BY 4.0 | MLX, Apple Silicon |
| KlangAI/pianissimo-da (original) | 627 M | FastConformer + TDT | 7,43 | CC BY 4.0 | PyTorch/NeMo y ONNX |
| Otros modelos ASR en danés | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con modelos ASR de terceros para danés, por lo que la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe danés; no soporta cambio de idioma ni otros idiomas.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no ejecuta código ni admite tool calling.
- Riesgo de alucinación inherente a los sistemas ASR: pueden aparecer palabras o frases no presentes en el audio, especialmente en segmentos con ruido o silencios.
- El WER de referencia (7,43–7,80 %) implica que sigue habiendo errores de transcripción; no es adecuado para usos que exijan exactitud literal sin revisión humana.
- La longitud de contexto en tokens no está documentada; el procesamiento se realiza por fragmentos de 2 minutos con 15 segundos de solapamiento, lo que puede introducir errores en las fronteras de fragmento.
- La ejecución está restringida a Apple Silicon con MLX; para otras plataformas es necesario recurrir a las versiones ONNX o al modelo original.
- La licencia CC BY 4.0 permite uso comercial con atribución obligatoria; debe citarse al autor según el BibTeX de la model card.
- Las métricas de velocidad y memoria se midieron sobre el modelo sueco de arquitectura idéntica en un M5 Pro, no directamente sobre esta versión, por lo que pueden variar en otros equipos.
- No se documentan sesgos específicos del corpus de entrenamiento en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KlangAI/pianissimo-da-mlx
- Modelo original: https://huggingface.co/KlangAI/pianissimo-da
- Versión 8 bits: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Versión 4 bits: https://huggingface.co/KlangAI/pianissimo-da-mlx-4bit
- Versión fp32 MLX: https://huggingface.co/KlangAI/pianissimo-da-mlx-fp32
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
