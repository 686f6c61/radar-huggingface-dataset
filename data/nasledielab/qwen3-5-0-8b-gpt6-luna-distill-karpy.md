# NasledieLab/Qwen3.5-0.8B-GPT6-Luna-Distill-Karpy

## Resumen

Qwen3.5-0.8B-GPT6-Luna-Distill-Karpy es un destilado del modelo base `unsloth/Qwen3.5-0.8B`, publicado por NasledieLab bajo licencia Apache 2.0. Se distribuye principalmente como GGUF cuantizado en Q4_K_M (unos 505 MB para el decodificador de texto) más un codificador visual separado en `mmproj-F16.gguf` (unos 196 MB), lo que permite ejecutarlo en llama.cpp, Ollama, LM Studio, Jan o Docker Model Runner. El modelo es multimodal (`image-text-to-text`) y hereda la arquitectura `qwen35` del modelo base, con 24 capas de texto y 12 capas de visión.

El interés de esta publicación no reside en una mejora de capacidades frente al modelo base, sino en la corrección del empaquetado GGUF. La model card documenta con detalle que la versión anterior del repositorio estaba rota: arquitectura declarada como `llama` en lugar de `qwen35`, tensores con nombres de Hugging Face, un tensor visual de 5 dimensiones incompatible con GGML, cuantización mal etiquetada (473 tensores en F32, 3,41 GB, presentados como Q4_K_M) y metadatos con un contexto de 4096 y vocabulario de 32000 frente a los 262144 y 248320 del modelo original. La revisión actual reconstruye los ficheros con el conversor oficial de llama.cpp y separa texto y proyector multimodal.

Con 752.393.024 parámetros reales en safetensors (aproximadamente 0,75B), es un modelo de bolsillo orientado a despliegue local en hardware modesto, con soporte declarado de contexto largo y capacidades de visión. La información pública disponible es escasa: no hay benchmarks, no se detallan los datos de destilación ni la composición del dataset, y el repositorio tiene un volumen de descargas bajo (777) y un único like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen35` (`Qwen3_5ForConditionalGeneration`): decodificador de texto de 24 capas y codificador visual de 12 capas |
| Parametros totales | 752.393.024 (safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262144 tokens segun la model card (heredado del modelo base) |
| Tipos de cuantizacion | Q4_K_M para texto (505 MB) y F16 para el proyector multimodal (196 MB); no se documentan otras variantes en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto + `mmproj`), con `config.json` de referencia; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B: un transformer multimodal con un decodificador de texto de 24 capas, dimensión oculta de 1024 y vocabulario de 248320 tokens, junto a un codificador visual de 12 capas con dimensión 768. El contexto declarado es de 262144 tokens. El repositorio se presenta como un destilado del modelo base, pero la model card no especifica el profesor utilizado, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La contribución técnica documentada es puramente de empaquetado: reconstrucción del GGUF con el conversor oficial de llama.cpp bajo la arquitectura `qwen35`, separación de los 320 tensores de texto y los 154 tensores del proyector multimodal, y reformado del tensor `model.visual.patch_embed.proj.weight` de 5 dimensiones a 4 para cumplir las restricciones de GGML. También se corrige la plantilla de chat para incluir los tokens `<|vision_start|>`, `<|image_pad|>` y `<think>`, además de las llamadas a herramientas. El repositorio incluye scripts de reconstrucción (`REBUILD_GGUF.ps1`, `rebuild_gguf.sh`) y un validador (`validate_gguf.py`).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato de Qwen.
- Comprensión de imágenes mediante el proyector multimodal `mmproj-F16.gguf` (pipeline `image-text-to-text`).
- Modo de razonamiento explícito mediante el token `<think>`, incluido en la plantilla de chat corregida.
- Soporte de llamadas a herramientas (tool calling) declarado en la plantilla de chat del repositorio.
- Contexto largo de hasta 262144 tokens según las especificaciones del modelo base, sujeto a la memoria disponible en inferencia.
- Despliegue local en llama.cpp, Ollama, LM Studio, Jan y Docker Model Runner.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en equipos de sobremesa: con unos 505 MB en Q4_K_M, el modelo cabe en CPU y en GPUs de gama baja, lo que permite desplegar un chatbot privado sin conexión a servicios externos.
- Descripción y clasificación de imágenes en local: el par GGUF + `mmproj` permite etiquetar capturas, extraer texto de documentos escaneados o generar descripciones para catálogos pequeños sin enviar datos a la nube.
- Preprocesado y enrutado en pipelines de agentes: su tamaño reducido y el soporte de tool calling lo hacen adecuado como primer eslabón que clasifica intenciones o decide qué herramienta invocar antes de llamar a un modelo mayor.
- Prototipado rápido de aplicaciones multimodales: sirve para validar flujos de `image-text-to-text` en llama.cpp u Ollama antes de migrar a modelos de mayor tamaño, con un coste de infraestructura mínimo.
- Experimentación educativa y de investigación: al ser un destilado de 0,75B con licencia Apache 2.0, es útil para estudiar comportamiento de modelos pequeños, efectos de la cuantización Q4_K_M y del modo de razonamiento.
- Procesamiento por lotes de documentos con contexto largo: la ventana declarada de 262144 tokens permite resumir o extraer información de documentos extensos, siempre que la memoria del sistema lo permita y se acepte la degradación típica de un modelo de este tamaño.
- Integración en entornos de escritorio y CI: los comandos de una línea para Ollama y Docker Model Runner facilitan incorporarlo a scripts de automatización o a herramientas internas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para texto en Q4_K_M: en torno a 0,5-1 GB para los pesos, más la caché KV; con contexto completo de 262144 tokens la caché KV crece de forma muy significativa y excede con holgura cualquier GPU de consumo, por lo que en la práctica se usará una fracción del contexto.
- VRAM estimada con visión: añadir aproximadamente 196 MB del `mmproj-F16.gguf` a la cifra anterior.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para texto con contexto moderado; para contexto largo se recomienda A100 o H100 por capacidad de memoria. No se publican cifras de latencia ni throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama cli`, `llama serve`, `llama-server`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio, Jan y Docker Model Runner.
- Requisito de versión: es necesario un llama.cpp u Ollama recientes con soporte de la arquitectura `qwen35`; si la carga falla con error de arquitectura desconocida, hay que actualizar.
- Visión en Ollama: la model card advierte de que la visión a través del flujo `hf.co` de Ollama requiere un GGUF VL de un solo fichero sin tensores de 5 dimensiones; hasta entonces debe usarse llama.cpp o LM Studio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-GPT6-Luna-Distill-Karpy | 752.393.024 | 262144 (declarado) | Apache 2.0 | GGUF (texto + mmproj) | Destilado multimodal con empaquetado corregido; sin benchmarks publicados |
| unsloth/Qwen3.5-0.8B (modelo base) | no disponible en la informacion | 262144 | no disponible en la informacion | safetensors | Origen del destilado; referencia de pesos sin cuantizar |
| unsloth/Qwen3.5-0.8B-GGUF | no disponible en la informacion | 262144 | no disponible en la informacion | GGUF (texto + `mmproj-*.gguf`) | Repositorio de referencia citado por el autor para texto y visión |
| ggml-org/Qwen3.5-0.8B-GGUF | no disponible en la informacion | 262144 | no disponible en la informacion | GGUF (solo texto, arch `qwen35`) | Repositorio de referencia citado por el autor para texto |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real del destilado frente al modelo base es desconocido.
- La model card no documenta el proceso de destilación: se desconoce el profesor, el dataset y si hubo alineación posterior, lo que impide evaluar sesgos inducidos.
- Con 0,75B de parámetros, la tasa de alucinación en tareas de conocimiento factual y razonamiento complejo será previsiblemente alta; no es adecuado para producción sin verificación.
- El contexto declarado de 262144 tokens no es utilizable en hardware de consumo por el coste de memoria de la caché KV; debe ajustarse a la VRAM disponible.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del inglés o el chino del modelo base.
- El repositorio ha tenido ficheros GGUF rotos en el pasado (arquitectura incorrecta, cuantización mal etiquetada, metadatos falsos sobre compatibilidad). Verificar con `validate_gguf.py` antes de confiar en una descarga.
- La visión no funciona en el flujo `hf.co` de Ollama según la propia model card; requiere llama.cpp o LM Studio con el `mmproj` adjunto.
- Requiere versiones recientes de llama.cpp u Ollama con soporte `qwen35`; versiones antiguas fallarán al cargar.
- Licencia Apache 2.0: permite uso comercial, pero al ser un destilado conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NasledieLab/Qwen3.5-0.8B-GPT6-Luna-Distill-Karpy
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- GGUF de referencia del modelo base (texto): https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
- GGUF de referencia del modelo base (texto + visión): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
