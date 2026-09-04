# scouzi1966/Qwen3.8-Flash-Next-AFM-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-AFM-MLX-4bit es una conversión AFM-native en MLX del checkpoint experimental Qwen/Qwen3.8-Flash-Next, desarrollada por scouzi1966. Mantiene la torre de visión, el predictor MTP nativo y el embedding de n-gramas mapeado en un único repositorio autocontenido. El modelo original es un avance experimental de Qwen que sienta las bases de la arquitectura Qwen4, con atención híbrida que combina Gated DeltaNet y Qwen Sparse Attention (QSA), además de Gated Residual.

La conversión aplica cuantización afín 4-bit a las proyecciones principales del modelo de lenguaje y al predictor MTP, 8-bit a la cabeza LM y 4-bit a la tabla de n-gramas, mientras que la torre de visión se mantiene en BF16. El resultado es un modelo de 129.435.434.899 parámetros (~129.4B) con un tamaño de repositorio de 105.4 GB, pensado para ejecutarse en Apple Silicon mediante el framework AFM.

Su relevancia radica en que ofrece una implementación accesible en MLX de una arquitectura experimental de vanguardia, optimizada para reducir la latencia en contextos largos y cargas de trabajo agénticas, con soporte de decodificación especulativa multi-token (MTP) y una tabla de n-gramas para acelerar la generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) con Gated Residual. Vision-language. |
| Parametros totales | 129.435.434.899 (~129.4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AFM MLX affine 4-bit (proyecciones LM y MTP, grupo 64), LM head affine 8-bit (grupo 64), tabla n-gram affine 4-bit (grupo 32), vision tower en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-Flash-Next sustituye el emparejamiento anterior de Gated DeltaNet y Gated Attention por una combinación de Gated DeltaNet y Qwen Sparse Attention (QSA). A diferencia de la atención dispersa convencional que selecciona tokens individuales, QSA opera a nivel de micro-bloques, lo que reduce significativamente la complejidad y la latencia en contextos largos, especialmente en cargas de trabajo agénticas. Además, introduce Gated Residual, que modula el flujo de información a través de streams residuales ensanchados para mejorar la estabilidad del entrenamiento y la capacidad del modelo.

La conversión a MLX se realizó con el convertidor AFM, implementado en Swift y sin invocar Python. Utiliza cuantización afín de MLX con perfiles específicos: las proyecciones principales del LM y MTP se cuantizan a 4-bit con grupo de 64, la cabeza LM a 8-bit con grupo de 64, y la tabla de n-gramas a 4-bit con grupo de 32. La torre de visión se conserva en BF16 y los metadatos de enrutamiento PLE se mantienen como I64. El diseño del layout mapeado de n-gramas y la carga del MTP en el checkpoint se basan en la implementación MIT-licenciada ddalcu/mlx-serve. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con soporte de modo de pensamiento (el flag `--no-think` en AFM sugiere que el modelo original incluye un modo de razonamiento que se puede desactivar).
- Razonamiento y generación de secuencias coherentes, validado en una prueba local con una lista numerada del 1 al 200.
- Comprensión de imagen y texto: el pipeline es `image-text-to-text` y la torre de visión se preserva en BF16, aunque no se detallan las capacidades visuales específicas.
- Decodificación especulativa multi-token (MTP) nativa, con soporte de profundidad configurable (por ejemplo, `--mtp-depth 3`).
- Tabla de n-gramas mapeada para acelerar la generación, con opción de precalentamiento (`--qwen-ngram-residency prewarm`).
- Soporte de requests de texto con MTP; las requests con imagen o vídeo usan la ruta VLM ordinaria.
- No se indica soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Inferencia local en Apple Silicon: gracias a la conversión MLX y al framework AFM, el modelo puede ejecutarse en Macs con memoria unificada, como un M3 Ultra con 512 GB, usando el comando `afm mlx -m scouzi1966/Qwen3.8-Flash-Next-AFM-MLX-4bit --no-think -w`.
- Generación de texto de alto rendimiento con decodificación especulativa: activando `--mtp --mtp-depth 3` se pueden alcanzar 76.4 tok/s en un M3 Ultra, con una tasa de aceptación MTP del 99.0%, lo que resulta útil para aplicaciones interactivas o batch donde el throughput es crítico.
- Procesamiento de contextos largos en agentes: la atención dispersa QSA a nivel de micro-bloques reduce la latencia en secuencias extensas, lo que permite mantener conversaciones multi-turno o razonamiento multi-step con ventanas de contexto amplias (aunque la longitud exacta de contexto no se especifica).
- Investigación en arquitecturas de atención híbrida: al ser un preview experimental de la arquitectura Qwen4, es adecuado para estudiar la interacción entre Gated DeltaNet y QSA, así como el impacto del Gated Residual en la estabilidad del entrenamiento.
- Aplicaciones vision-language en el ecosistema MLX: el modelo conserva la torre de visión en BF16 y puede procesar prompts que combinan imagen y texto a través del contenedor de visión cualificado de AFM.
- Despliegue en entornos con memoria unificada limitada: la cuantización 4-bit reduce el footprint del modelo a 105.4 GB en disco, y la tabla de n-gramas se mapea bajo demanda, lo que permite ajustar la residencia en memoria según los recursos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una validación local de rendimiento en un M3 Ultra con 512 GB de memoria unificada, usando el prompt «Write a numbered list from 1 through 200, placing exactly one number on each line», temperatura 0 y un límite de 256 tokens:

| Modo | Decode | Aceptación MTP | Resultado |
|---|---|---|---|
| AR, primer run con demand-mapped | 61.7 tok/s | — | Secuencia numerada coherente |
| AR, control warm mapped | 66.5 tok/s | — | Secuencia numerada coherente |
| MTP3, control warm mapped | 76.4 tok/s | 99.0% (193/195) | Secuencia numerada coherente |

Estas cifras son medidas puntuales locales, no garantías entre máquinas. La calidad de comprensión visual no formó parte de esta prueba.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse con MLX y AFM en Apple Silicon; no se especifica soporte para GPUs NVIDIA.
- El repositorio ocupa 105.4 GB en disco. La carga en memoria unificada depende de la cuantización y de la residencia de la tabla de n-gramas; no se proporciona una cifra exacta de VRAM.
- La validación del autor se realizó en un M3 Ultra con 512 GB de memoria unificada, que es el entorno de referencia.
- Se recomienda un sistema con suficiente memoria unificada para mantener el modelo y la tabla de n-gramas en memoria; AFM expone las opciones `mapped` (mapeo bajo demanda) y `prewarm` (precalentamiento de la caché de páginas).
- Opciones de despliegue: AFM con los comandos `afm mlx` (servicio autoregresivo y MTP). El modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, pero esta conversión MLX está pensada específicamente para AFM.
- Throughput medido: 61.7–76.4 tok/s en el entorno de validación.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. Como referencia, se puede comparar con el modelo base sin cuantizar:

| Modelo | Parámetros | Cuantización | Formato | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next | no disponible (el checkpoint convertido tiene 129.4B) | Original (sin cuantizar) | Transformers | Checkpoint experimental original |
| scouzi1966/Qwen3.8-Flash-Next-AFM-MLX-4bit | 129.435.434.899 | AFM MLX 4-bit | safetensors (MLX) | Conversión para Apple Silicon |

No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Es un modelo experimental, un preview de la arquitectura Qwen4, no una versión de producción optimizada.
- La licencia es qwen-community-1.0; es necesario revisar sus términos antes de un uso comercial, ya que puede imponer restricciones.
- No se proporcionan datos sobre sesgos, riesgos de alucinación, ni limitaciones de idioma.
- Las métricas de rendimiento son medidas locales y pueden variar significativamente en otros entornos.
- La calidad de comprensión visual no fue evaluada en la prueba de rendimiento del autor.
- El modo MTP batched puede diferir del decode greedy independiente en límites de decisión de punto flotante, aunque cada token aceptado se verifica.
- Se requiere una build de AFM con soporte específico para Qwen Next (n-gram mapeado y MTP embebido) para ejecutar el modelo correctamente.
- La tabla de n-gramas se mapea bajo demanda por defecto; en sistemas con memoria unificada limitada, el primer arranque puede ser más lento hasta que se caliente la caché.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scouzi1966/Qwen3.8-Flash-Next-AFM-MLX-4bit
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Qwen Cloud (API gestionada): https://www.qwencloud.com
- Visión general de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
