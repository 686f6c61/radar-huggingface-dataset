# AutomatosX/AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP

## Resumen

AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP es un checkpoint de cuantizacion publicado por AutomatosX sobre el modelo ukisai/Swift-1.5-Qwen3.8-27b. No es un modelo entrenado desde cero, sino una derivacion comprimida: aplica cuantizacion NVFP4 en formato W4A16 (pesos de 4 bits, activaciones en BF16) sobre las matrices de atencion y MLP del bloque de lenguaje, manteniendo en precision original la torre de vision, los pesos de MTP (multi-token prediction), las normas, los embeddings de tokens y la cabeza LM.

El resultado es un paquete de 27.781.427.952 parametros totales y 20,6 GB de repositorio, orientado a ejecucion en CUDA con el layout publico compressed-tensors. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidad multimodal, y los tags del repositorio lo situan en la familia Qwen3.5 con soporte de MTP y compatibilidad con endpoints.

Su relevancia es fundamentalmente experimental: el propio autor lo describe como evidencia de desarrollo, sin mediciones de calidad de generacion, calidad de vision ni aceleracion de MTP, y sin reclamar paridad con el checkpoint BF16 de origen. Es util para quien quiera evaluar el comportamiento real de NVFP4 RTN sobre un modelo de ~27B, pero no como sustituto validado del modelo base en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5 segun los tags del repositorio; detalles de capas, atencion y configuracion interna no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 RTN W4A16: pesos E2M1 de 4 bits, escalas de bloque E4M3FN de tamano 16 y escala global inversa en FP32; activaciones en BF16; sin AWQ y sin cuantizacion de activaciones. Los tags del repositorio incluyen ademas la etiqueta "8-bit" |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (license_name declarado como "other"); la base Qwen3.8-27B se mantiene bajo Apache License 2.0 |
| Formato de pesos | safetensors con layout publico compressed-tensors NVFP4; backend de serializacion torch-cuda |

Otros datos del repositorio: creado el 2026-10-11, actualizado el mismo dia, 0 descargas, 0 likes, pipeline image-text-to-text y libreria transformers.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de identificarla con la familia Qwen3.5 y de detallar el proceso de cuantizacion. Se sabe que el checkpoint deriva de ukisai/Swift-1.5-Qwen3.8-27b en la revision `b4c84d42903a8646b25857eb2827288d92ed85a4`, que es multimodal (pipeline image-text-to-text) y que incorpora pesos de MTP (multi-token prediction) empaquetados. No se especifican numero de capas, tipo de atencion, dimension oculta, tamano de vocabulario ni composicion del dataset de entrenamiento original.

El proceso aplicado es cuantizacion RTN (round-to-nearest) nativa de AXQuant sobre las matrices de atencion y MLP del bloque de lenguaje que resultan elegibles. Los pesos de esas matrices pasan a E2M1 de 4 bits con escalas de bloque E4M3FN de tamano 16 y una escala global inversa en FP32. Las activaciones permanecen en BF16, no se aplica AWQ ni cuantizacion de activaciones. La torre de vision, los pesos de MTP, las normas, los embeddings de tokens y la cabeza LM se conservan en la precision del modelo de origen, y los pesos de MTP se empaquetan aunque su aceleracion no fue medida. No hay datos sobre RLHF, DPO ni sobre el volumen o composicion de los tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Procesamiento de imagen y texto de forma conjunta: el pipeline declarado es image-text-to-text y la torre de vision se mantiene en la precision original.
- Decodificacion con multi-token prediction: los pesos de MTP estan empaquetados en el checkpoint, aunque el autor indica explicitamente que la aceleracion aportada por MTP no fue medida.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`.
- Razonamiento, codigo, matematicas, tool calling, function calling y uso agentico: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking explicito, audio u otras capacidades especiales: no disponibles.

Advertencia relevante: el autor senala que no se midieron ni la calidad de generacion ni la calidad de vision, por lo que las capacidades anteriores deben considerarse no verificadas en este checkpoint.

## Casos de uso

- Evaluacion de cuantizacion NVFP4 sobre modelos de ~27B: el checkpoint permite medir de forma controlada la degradacion introducida por pesos E2M1 con escalas E4M3FN frente al BF16 de origen, comparando salidas sobre el mismo conjunto de prompts. Es el caso de uso mas alineado con la propia descripcion del autor como evidencia de desarrollo.
- Pruebas de inferencia multimodal autoalojada: al conservar la torre de vision en precision original, permite experimentar con tareas de imagen y texto (descripcion de imagenes, respuesta a preguntas visuales) en hardware propio, aceptando que la calidad no esta certificada.
- Despliegue en infraestructura CUDA con endpoints compatibles: el tag `endpoints_compatible` y la libreria transformers declarada permiten integrarlo en servicios de inferencia existentes para pruebas internas de latencia y consumo de VRAM.
- Investigacion sobre multi-token prediction: los pesos de MTP empaquetados permiten estudiar la decodificacion especulativa y medir por cuenta propia la aceleracion que el autor no midio.
- Asistentes conversacionales de uso interno: el tag `conversational` habilita prototipos de dialogo multi-turno en entornos controlados donde no se exija paridad con un modelo BF16.
- Comparativas de eficiencia en memoria: con 20,6 GB de repositorio, sirve para medir el ahorro de VRAM frente a un checkpoint BF16 del mismo modelo en GPUs de gama alta.
- Base para estudios de sensibilidad a la cuantizacion por capa: al dejar en BF16 vision, MTP, normas, embeddings y LM head, permite aislar que subconjunto de modulos tolera peor la compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el paquete no repite los numeros de benchmark del checkpoint previo y que no reclama paridad con el BF16 de origen. Tampoco se aportan mediciones de latencia ni de throughput.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K, MMMU u otros | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de un repositorio de 20,6 GB, se estima un minimo practico de 22-24 GB solo para pesos y un rango recomendado de 24-32 GB incluyendo cache KV y buffers de activaciones en BF16. Es una estimacion derivada del tamano de los pesos, no un dato publicado.
- El calculo puro de 4 bits sobre 27,78B de parametros quedaria por debajo del tamano real del repositorio, porque vision, MTP, normas, embeddings y LM head se conservan en precision original.
- GPU recomendadas: el formato NVFP4 (E2M1 con escalas E4M3FN) cuenta con aceleracion nativa en la generacion Blackwell, por lo que B200, GB200 y las GPU consumer de la serie RTX 50 son las candidatas naturales. El tag `cuda` y el backend `torch-cuda` confirman la orientacion a CUDA, pero no hay confirmacion de soporte en Ampere, Ada o Hopper.
- Cabe en GPU consumer: si, previsiblemente en RTX 5090 (32 GB); en RTX 4090 (24 GB) quedaria muy al limite y dependeria de la longitud de contexto y del soporte efectivo del formato en esa generacion.
- Opciones de despliegue: transformers es la libreria declarada y el checkpoint usa el layout publico compressed-tensors. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; en particular llama.cpp y Ollama no trabajan de forma nativa con NVFP4.
- Latencia y throughput: no disponibles. El autor indica explicitamente que la aceleracion de MTP no fue medida.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de terceros comparables, por lo que la comparacion se limita al propio linaje del checkpoint. Los campos no documentados se marcan como no disponibles en lugar de estimarse.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP | 27.781.427.952 | No disponible | NVFP4 W4A16 (pesos 4 bits, activaciones BF16) | Swift Open License v1.0 | Publico en HuggingFace; 0 descargas, 0 likes |
| ukisai/Swift-1.5-Qwen3.8-27b (origen) | 27B segun el nombre del modelo; valor exacto no disponible | No disponible | BF16, sin cuantizar | Swift Open License v1.0 para la contribucion Swift; Apache 2.0 para la base Qwen3.8-27B | Publico en HuggingFace |
| Alternativas de terceros de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

Conviene senalar que el checkpoint cuantizado es una obra derivada del modelo de origen y que no aporta capacidades nuevas respecto a el: solo reduce el coste de almacenamiento y, potencialmente, de inferencia.

## Limitaciones y advertencias

- Calidad no medida: el autor declara que ni la calidad de generacion ni la calidad de vision fueron evaluadas, y que el paquete no reclama paridad con el checkpoint BF16 de origen.
- Cuantizacion RTN sin calibracion: el metodo es round-to-nearest, sin AWQ ni cuantizacion de activaciones, lo que suele implicar mayor degradacion que tecnicas con calibracion, especialmente en tareas sensibles a la precision.
- MTP sin validar: los pesos de multi-token prediction estan empaquetados, pero no se midio su aceleracion, por lo que no debe asumirse ninguna ganancia de velocidad.
- Formatos: el layout NVFP4 de compressed-tensors esta pensado para CUDA y su aceleracion nativa esta ligada a Blackwell, lo que restringe el hardware utilizable y el ecosistema de herramientas compatible.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no puede asumirse cobertura multilingue ni un comportamiento consistente fuera del ingles.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos conocidos ni sobre tasas de alucinacion, ni en este checkpoint ni en el modelo de origen.
- Licencia con umbral de ingresos: la Swift Open License v1.0 no licencia el uso comercial a entidades legales con ingresos brutos de 1.000.000 USD o mas en su ultimo ejercicio fiscal. Es un requisito que debe revisarse antes de cualquier despliegue comercial.
- Licencias superpuestas: la contribucion Swift y la base Qwen3.8-27B (Apache 2.0) tienen condiciones distintas, por lo que la redistribucion debe respetar ambos textos.
- Naturaleza experimental: el propio autor lo califica como evidencia de desarrollo, con 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas: el repositorio esta fechado en octubre de 2026, posterior al conocimiento de referencia habitual, por lo que los detalles de la familia Qwen3.5 pueden no estar documentados en fuentes publicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Swift-1.5-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Revision concreta del modelo base: `b4c84d42903a8646b25857eb2827288d92ed85a4`
- Licencia del checkpoint: LICENSE (Swift Open License v1.0) en el repositorio de HuggingFace
- Licencia de la base: LICENSE-APACHE-2.0 en el repositorio de HuggingFace
- Papers, blogs, repositorios o demos adicionales: no disponibles. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los unicos resultados obtenidos correspondian a contenidos sobre el archivo de David Bowie en el Victoria and Albert Museum y no guardan relacion con esta ficha.
