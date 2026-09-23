# EigenLabs/DiffusionGemma-26B-A4B-it-MLX-4bit

## Resumen

DiffusionGemma 26B A4B Instruct — MLX 4-bit es una conversión independiente a formato MLX del checkpoint original de Google `google/diffusiongemma-26B-A4B-it`, publicada por EigenLabs. Su rasgo distintivo es que no es un transformer autorregresivo convencional: la generación se realiza mediante difusión por bloques iterativa, con un lienzo (canvas) de 256 tokens y un techo de 48 pasos de denoising. El paquete conserva el encoder/decoder entrenado, el self-conditioning, la proyección de embeddings atados y los componentes de visión, y acepta entradas de texto, imagen y vídeo (pipeline `image-text-to-text`).

El modelo tiene 25.823.781.228 parámetros totales según los safetensors, con nomenclatura A4B que implica activación de aproximadamente 4 B por paso. El contexto configurado es de 262.144 tokens. La conversión aplica cuantización afín con group size 64, base de 4 bits y 236 módulos sensibles elevados a 8 bits, manteniendo el resto de tensores no cuantizados en BF16 original.

Es relevante porque permite ejecutar un modelo multimodal de difusión de escala 26B en Apple Silicon de forma nativa mediante DarkBloom/d-inference, sin recurrir a un decoder autorregresivo Gemma ni a cabezas especulativas MTP. Es un artefacto muy reciente (subido en septiembre de 2026), sin descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `diffusion_gemma` / `diffusion_gemma_text` (transformer con difusión por bloques iterativa y perfil de expertos) |
| Parametros totales | 25.823.781.228 (≈25,8 B) |
| Parametros activos | ≈4 B (según nomenclatura A4B del nombre del modelo) |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | Afín, group size 64: base 4 bits con 236 módulos sensibles a 8 bits; tensores no cuantizados en BF16 original |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a los términos de licencia de Google) |
| Formato de pesos | safetensors (MLX), 4 shards; 16.543.055.405 bytes (15,407 GiB) |

## Arquitectura y entrenamiento

La arquitectura nativa es `diffusion_gemma` / `diffusion_gemma_text`. El mecanismo de generación es difusión por bloques iterativa: el modelo parte de un lienzo bidireccional de 256 tokens y lo refina a lo largo de un máximo de 48 pasos, con una política de entropía/estabilidad heredada de la configuración original. No existe un asistente MTP autorregresivo: la difusión nativa es el propio mecanismo de generación. La implementación emplea caché de encoder, canvas de difusión bidireccional y expone únicamente la salida comprometida. El checkpoint conserva encoder/decoder completos, self-conditioning, proyección de embedding/output atada y los componentes de visión.

No se ha realizado fine-tuning ni se ha añadido modelo borrador externo. La conversión se hizo directamente desde el payload BF16 original de Google con MLX-VLM (revisión `e79b0e041677ec4ca5333ba750376bb4e8c434cb`), predicado de cuantización nativo de DiffusionGemma, MLX 0.32.2, MLX-LM 0.31.3 y Transformers 5.14.0, en CPU. De las 1.047 entradas de tensor originales se derivan 1.647 tensores indexados, con escalas y sesgos afines explícitos para 300 módulos cuantizados. Los 747 tensores no cuantizados son byte a byte idénticos al BF16 de origen. El número de tokens de entrenamiento, la composición del dataset y si hubo RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto multimodal: acepta texto, imagen y vídeo como entrada (pipeline `image-text-to-text`, tag `video-text-to-text`).
- Generación mediante difusión por bloques con decodificación no autorregresiva.
- Modo razonamiento conmutable (reasoning ON/OFF), validado en las pruebas de API local.
- Tool calling / function calling: se validaron herramientas de clima y el historial de resultados de herramienta.
- Soporte de API conversacional tipo Chat/Responses, tanto en streaming como en no streaming.
- Capacidad multimodal amplia: la validación de casos de medios obtuvo 21/21.
- Gestión de contexto largo: configurado hasta 262.144 tokens.
- Capacidades multilingües: no disponible.
- Capacidad especial: modo de difusión nativa con canvas de 256 tokens y hasta 48 pasos de denoising.

## Casos de uso

- Asistente conversacional multimodal en Mac: al aceptar texto, imagen y vídeo, puede gestionar conversaciones que combinan capturas, fotogramas o documentos con preguntas en lenguaje natural, con el aliciente de ejecutarse localmente en Apple Silicon.
- Atención al cliente automatizada: con un contexto configurado de 262.144 tokens puede mantener historiales multi-turno largos, incluyendo adjuntos de imagen, sin truncar conversaciones extensas.
- Agentes con uso de herramientas: el modelo soporta tool calling y pasó pruebas de herramientas de clima e historial de resultados, lo que permite integrarlo en flujos de agente multi-paso.
- Procesamiento de documentos y artículos largos: en las pruebas de referencia se usó una tarea de artículo combinada con texto sintético numerado; encaja en resumen y extracción sobre entradas de decenas de miles de tokens.
- Análisis de contenido audiovisual: al aceptar vídeo como entrada, puede describir o etiquetar secuencias, útil en catalogación de archivos multimedia en local.
- Prototipado e investigación en modelos de difusión para lenguaje: sirve para estudiar generación por difusión por bloques frente a decodificación autorregresiva en un runtime MLX nativo.
- Despliegue con privacidad de datos: al ejecutarse en hardware propio vía DarkBloom/d-inference, es apto para entornos donde no se permite enviar datos a APIs externas.
- Evaluación de cuantización 4-bit/8-bit: permite comparar el efecto de la cuantización afín sobre un checkpoint multimodal grande sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son medidas locales de throughput y memoria en un Apple M3 Ultra con 256 GiB, backend paginado y reutilización de prefijo desactivada, con canvas nativo de 256 tokens, techo de 48 pasos, temperatura 1, semilla 341 y presupuesto de salida de 2.048 tokens (un calentamiento y dos peticiones medidas por fila):

| Tokens de entrada | Prefill interno (tok/s) | Generación comprometida (tok/s) | Tokens de salida | Pico de proceso (GiB) |
|---:|---:|---:|---:|---:|
| 10.267 | 1614,0 | 47,31 | 1.729 | 25,20 |
| 20.508 | 1435,8 | 47,39 | 1.925 | 26,34 |
| 51.214 | 1075,1 | 30,23 | 1.848 | 27,03 |

Resultados de validación adicionales: chequeos de API autenticada en DarkBloom 24/26 superados (1 fallo, 1 caso dependiente omitido), medios 21/21, expandido 36/44, espacios en blanco 8/8. El caso fallido fue una petición de Responses en streaming sin razonamiento con herramienta requerida. El recuento de benchmark computa salida comprometida no EOS, incluyendo el trabajo del primer bloque, y no cuenta tokens intermedios de denoising.

## Requisitos de hardware

- Los pesos ocupan 16.543.055.405 bytes (15,407 GiB) en shards safetensors; el runtime suma cachés, activaciones, espacio de trabajo de difusión y residencia del asignador.
- En las mediciones reales el pico de proceso fue de 25,20 a 27,03 GiB según la longitud de entrada, sobre Apple M3 Ultra con 256 GiB.
- Plataforma objetivo: Apple Silicon con MLX y soporte nativo de DiffusionGemma (DarkBloom / d-inference, MLX-Swift-LM). No está pensado para GPU discreta NVIDIA.
- Encaje en equipos de consumo: requiere memoria unificada suficiente; por el pico observado conviene un Mac con 32 GB o más, siendo 48-64 GB lo recomendable para contexto largo.
- Opciones de despliegue: DarkBloom con soporte nativo de DiffusionGemma y MLX-Swift-LM. El autor advierte explícitamente de no cargar el checkpoint con un decoder Gemma autorregresivo ordinario ni activar una cabeza especulativa/MTP ajena.
- Throughput de referencia en M3 Ultra: 47,3 tok/s de generación a ~10-20 k tokens de entrada, degradando a 30,2 tok/s a ~51 k tokens de entrada; prefill de 1.614 a 1.075 tok/s.
- La reutilización de prefijo estaba desactivada en las pruebas; concurrencia y reinicio persistente requieren validación específica del artefacto.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables de difusión multimodal con mezcla de expertos en formato MLX. La comparación más directa disponible es frente al checkpoint original del que deriva:

| Modelo | Parametros | Contexto | Precision | Formato | Licencia |
|---|---|---|---|---|---|
| EigenLabs/DiffusionGemma-26B-A4B-it-MLX-4bit | 25,8 B (≈4 B activos) | 262.144 | 4 bits (236 módulos a 8 bits) | safetensors MLX | apache-2.0 |
| google/diffusiongemma-26B-A4B-it | 25,8 B (≈4 B activos) | 262.144 | BF16 | safetensors (referencia) | apache-2.0 |

No se han facilitado datos de rendimiento del checkpoint original para establecer una comparación cuantitativa de calidad. No disponible para el resto de alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización es con pérdida y es independiente de cualquier optimización de runtime sin pérdida; el autor señala que una conversión recién producida no es por sí misma evidencia de mejor calidad que otra.
- Limitación conocida en la copia exacta de argumentos de herramienta con cadenas opacas: el éxito con una herramienta de clima no garantiza fidelidad exacta de argumentos arbitrarios. Fallos relacionados también se observaron en una evaluación previa con BF16 original, por lo que no es un problema resuelto por esta cuantización.
- Persiste abierto un caso de Responses en streaming sin razonamiento con herramienta requerida que falló la generación.
- El autor indica que la validación realizada no constituye un sign-off de producción completo; almacenamiento paginado, reutilización de prefijo, concurrencia, reinicio persistente fiable y comportamiento en contexto máximo requieren validación específica.
- No se debe cargar con un decoder Gemma autorregresivo ordinario ni activar cabezas especulativas/MTP ajenas: se requiere runtime con soporte nativo de DiffusionGemma.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Licencia apache-2.0 con enlace a los términos de licencia de Google (`https://ai.google.dev/gemma/apache_2`); conviene revisar las condiciones de uso comercial del modelo base antes de desplegarlo.
- Metadatos de la ficha indican fecha de creación y actualización en 2026-09-22; sin descargas ni likes registrados, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EigenLabs/DiffusionGemma-26B-A4B-it-MLX-4bit
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Revisión del modelo base citada: https://huggingface.co/google/diffusiongemma-26B-A4B-it/tree/f7f5b7f5fa82ffc52addd066915886d497f5517b
- Licencia de Google: https://ai.google.dev/gemma/apache_2
- Soporte nativo en d-inference (PR 1169): https://github.com/Layr-Labs/d-inference/pull/1169
- Soporte nativo en MLX-Swift-LM (PR 157): https://github.com/Layr-Labs/mlx-swift-lm/pull/157

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos trataban de temáticas ajenas (ciclismo de montaña y soporte de YouTube) y no se han utilizado.
