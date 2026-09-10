# BachDaThan/lora_model_nli_vietnamese-GGUF

## Resumen

lora_model_nli_vietnamese-GGUF es una adaptación al vietnamita del modelo denso Qwen/Qwen3-4B, construida fusionando el adaptador LoRA `lyle49/lora_model_nli_vietnamese` sobre los pesos base y convirtiendo el resultado a formato GGUF para su uso con llama.cpp. El responsable de la fusión y la cuantización es el usuario de HuggingFace BachDaThan, que firma el repositorio como `quantized_by`. El resultado es un modelo de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) pensado para generación de texto conversacional en vietnamita, con el inglés como idioma secundario.

La relevancia de esta ficha es doble. Por un lado, ofrece una vía práctica para ejecutar un modelo de la familia Qwen3 en hardware de consumo: las cuantizaciones publicadas ocupan entre 1,76 GB y 2,33 GB y el autor estima entre 3,8 GB y 4,3 GB de VRAM, lo que lo sitúa al alcance de GPUs de gama media. Por otro, cubre una lengua con relativamente poca oferta de modelos ajustados, lo que lo convierte en un candidato para prototipos de procesamiento de lenguaje natural en vietnamita.

El repositorio se publicó el 10 de septiembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones, y no incluye resultados de benchmarks. La model card documenta con detalle la arquitectura, la plantilla de chat y los ficheros GGUF, pero no describe el dataset de entrenamiento del adaptador LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, con atención de consultas agrupadas (GQA) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 40960 tokens según la model card; el ejemplo de uso de llama-cpp-python emplea n_ctx=8192 |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q4_K_S, Q3_K_M y Q3_K_S |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | apache-2.0 (tanto el modelo base como el adaptador LoRA, según los metadatos de HuggingFace) |
| Formato de pesos | GGUF para llama.cpp; el repositorio no publica safetensors |
| Capas | 36 |
| Tamano oculto (hidden size) | 2560 |
| Cabezas de atencion | 32 |
| Cabezas KV | 8 |
| Dimension por cabeza | 128 |
| Tamano de vocabulario | 151936 |
| Precision original | bfloat16 |
| Modelo base | Qwen/Qwen3-4B |
| Adaptador LoRA | lyle49/lora_model_nli_vietnamese |
| Tamano del repositorio | 8,8 GB (incluye varios ficheros GGUF; la model card solo documenta cuatro de ellos) |
| Libreria | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 en su variante de 4 mil millones de parámetros: un transformer decoder-only de 36 capas con 2560 dimensiones ocultas, 32 cabezas de atención y 8 cabezas KV, lo que da una ratio de agrupación de 4 consultas por cada clave/valor (GQA) y reduce el coste de la caché KV durante la inferencia. La dimensión por cabeza es de 128 y el vocabulario del tokenizador alcanza los 151936 tokens, un valor amplio que favorece la tokenización eficiente de texto multilingüe. La precisión de los pesos originales es bfloat16.

Sobre el proceso de entrenamiento de esta variante concreta no hay información publicada: la model card no indica el número de tokens de entrenamiento del adaptador LoRA, ni la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Lo único documentado es que se trata de un LoRA fusionado (lora-merged) y ajustado para instrucciones (instruction-tuned) sobre el modelo base Qwen3-4B. Es razonable asumir que la arquitectura, la ventana de contexto y el tokenizador proceden íntegramente del modelo base, mientras que las capacidades específicas en vietnamita provienen del adaptador.

La innovación técnica diferencial de este repositorio no está en el entrenamiento, sino en el empaquetado: la fusión del LoRA y la cuantización a GGUF se realizan de forma automática, y los tamaños de fichero publicados se midieron con `stat().st_size` tras la cuantización, no se estimaron. Esto aporta trazabilidad sobre el tamaño real de cada variante, algo poco habitual en repositorios de cuantización.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés, con plantilla de chat basada en ChatML (`<|im_start|>role ... <|im_end|>`).
- Seguimiento de instrucciones, dado que el adaptador está etiquetado como instruction-tuned.
- Conversación multi-turno con historial de mensajes, incluyendo rol de sistema.
- Procesamiento de contextos largos: la model card declara 40960 tokens de ventana, aunque las pruebas prácticas recomendadas usan 8192.
- Uso como modelo de inferencia de lenguaje natural (NLI): el nombre del adaptador (`lora_model_nli_vietnamese`) sugiere un ajuste orientado a tareas de inferencia textual, si bien el pipeline declarado es text-generation y no se documenta explícitamente esta capacidad.
- Traducción y reformulación entre vietnamita e inglés, como capacidad derivada del entrenamiento bilingüe.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión ni audio en la información disponible.
- No se documenta la presencia del modo de razonamiento (thinking) característico de la familia Qwen3 en esta variante ajustada.

## Casos de uso

- Atención al cliente en vietnamita: el modelo puede gestionar conversaciones multi-turno con un historial extenso, gracias a una ventana declarada de 40960 tokens y a la plantilla de chat con rol de sistema, lo que permite inyectar instrucciones de negocio y políticas de respuesta.
- Procesamiento de lenguaje natural en vietnamita en producción: clasificación de textos, análisis de sentimiento o inferencia de relaciones textuales en pipelines que necesiten un modelo local de 4B con licencia permisiva.
- Generación de código y documentación técnica bilingüe: al ser un ajuste de Qwen3-4B, hereda parte de la capacidad de generación de código del modelo base, útil para asistencia en editores o generación de documentación vi/en.
- Despliegue en el borde o en instalaciones locales: con cuantizaciones de 1,76 GB a 2,33 GB y requisitos estimados de 3,8 GB a 4,3 GB de VRAM, es viable ejecutarlo en portátiles y estaciones de trabajo sin GPU de datacenter, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación de datos sintéticos en vietnamita: puede emplearse para aumentar corpus de entrenamiento o crear pares de preguntas y respuestas en dominios con poca cobertura lingüística.
- Resumen de documentos largos en vietnamita: informes, actas o artículos que quepan en la ventana de contexto, con la advertencia de que el autor recomienda no emplear las salidas como sustituto de asesoramiento profesional en dominios críticos.
- Prototipado e investigación sobre LoRA: al estar publicados el adaptador original y el modelo base por separado, sirve como caso de estudio reproducible de fusión y cuantización de LoRA para lenguas de bajos recursos.
- Chatbot embebido en aplicaciones de escritorio o móviles mediante llama.cpp u Ollama, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas en vietnamita, y no se han encontrado datos de rendimiento en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada según el autor, por cuantización: Q3_K_S 3,8 GB; Q3_K_M 3,9 GB; Q4_K_S 4,2 GB; Q4_K_M 4,3 GB.
- Tamano real de los ficheros: Q3_K_S 1,76 GB; Q3_K_M 1,93 GB; Q4_K_S 2,22 GB; Q4_K_M 2,33 GB. La diferencia respecto a la VRAM estimada corresponde al overhead de la caché KV y del runtime.
- GPU de consumo compatibles: cualquier tarjeta con 6 GB o más de VRAM puede ejecutar las cuantizaciones Q3 y Q4; con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070) hay margen para contextos amplios. Con 4 GB el margen es muy ajustado y probablemente exija descargar capas a CPU.
- GPU profesionales: A100, H100, L40S o similares ejecutan el modelo sin dificultad, aunque su capacidad queda muy por encima de lo necesario para un modelo de 4B.
- Aceleración por CPU y Apple Silicon: al ser un fichero GGUF, es compatible con ejecución parcial o total en CPU y con Metal en chips de Apple mediante llama.cpp.
- Opciones de despliegue: llama.cpp y llama-cpp-python (ejemplo de código incluido en la model card), Ollama (con `FROM ./fichero.gguf`), y cualquier otro runtime compatible con GGUF. No se documenta compatibilidad con vLLM ni TGI, que no consumen GGUF de forma nativa.
- Parametros de muestreo recomendados: temperature 0.6 y top_p 0.95, con num_ctx de 8192 en el ejemplo de Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lora_model_nli_vietnamese-GGUF | 4,02 mil millones (denso) | 40960 tokens | vi, en | apache-2.0 | GGUF en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | 4,02 mil millones (denso) | 40960 tokens según la ficha de esta variante | multilingue amplio | apache-2.0 | safetensors y GGUF en HuggingFace, ampliamente utilizado |
| Qwen2.5-3B-Instruct | 3,09 mil millones (denso) | 32768 tokens | multilingue | qwen-research (uso comercial permitido con condiciones) | safetensors y GGUF, alta adopción |
| Llama 3.2 3B Instruct | 3,21 mil millones (denso) | 128000 tokens | multilingue (8 idiomas oficiales) | Llama 3.2 Community License | pesos oficiales y múltiples cuantizaciones |
| Gemma 3 4B IT | 4 mil millones (denso) | 128000 tokens | más de 140 idiomas | Gemma Terms of Use | pesos oficiales y cuantizaciones de la comunidad |

La ventaja específica de esta variante frente al Qwen3-4B original es el ajuste en vietnamita mediante el adaptador LoRA, además del empaquetado GGUF ya listo para llama.cpp y Ollama. Su desventaja es la falta de evidencia pública de rendimiento: no hay benchmarks que confirmen la ganancia real del ajuste frente al modelo base en tareas en vietnamita. En términos de licencia, apache-2.0 es más permisiva que las licencias de Llama 3.2 y Gemma 3, que imponen condiciones de uso adicionales.

## Limitaciones y advertencias

- Riesgo de alucinacion: el propio autor advierte en la model card de que el modelo puede generar información incorrecta y desaconseja usar sus salidas como sustituto de asesoramiento profesional en ámbitos críticos.
- Ausencia de benchmarks: no hay ninguna evaluación publicada, ni en vietnamita ni en inglés, por lo que el rendimiento real del ajuste LoRA frente al modelo base es desconocido.
- Adopcion nula: el repositorio registra 0 descargas y 0 valoraciones, lo que implica ausencia de validación por parte de la comunidad y de reportes de fallos.
- Ambiguedad de licencia: la model card indica explícitamente que la licencia del repositorio se determina tras un proceso de verificación del pipeline y que el autor no asigna apache-2.0 de forma unilateral, aunque los metadatos de HuggingFace muestran esa licencia. Conviene verificar la licencia antes de un uso comercial.
- Cobertura idiomatica limitada: solo se declaran vietnamita e inglés; el comportamiento en otros idiomas no está documentado y probablemente degrade hacia respuestas en inglés o vietnamita.
- Discrepancia de contexto: la ficha declara 40960 tokens, pero los ejemplos de uso emplean 8192; no hay evidencia de que el modelo mantenga calidad en contextos muy largos, y la memoria necesaria crece con la ventana configurada.
- Trazabilidad del entrenamiento incompleta: se desconoce el dataset, el número de tokens y el método de alineación del adaptador LoRA, lo que dificulta auditar sesgos o comportamientos indeseados.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, agentes ni modo de razonamiento, pese a que el modelo base Qwen3 sí los incorpora.
- No apto para vLLM o TGI sin conversión previa: al distribuirse únicamente en GGUF, requiere llama.cpp, Ollama o una reconversión a safetensors para stacks de servidor de alto rendimiento.
- Uso en producción: al no existir evaluación de robustez, se recomienda validación propia con datos del dominio antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BachDaThan/lora_model_nli_vietnamese-GGUF
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Adaptador LoRA original: https://huggingface.co/lyle49/lora_model_nli_vietnamese
- Licencia apache-2.0: https://huggingface.co/BachDaThan/lora_model_nli_vietnamese-GGUF/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo: las entradas devueltas tratan sobre vehículos eléctricos, clientes ed2k, configuración de redes inalámbricas y ofimática, y no guardan relación con el objeto de esta ficha.
