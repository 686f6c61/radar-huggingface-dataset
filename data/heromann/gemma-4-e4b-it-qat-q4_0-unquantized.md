# heromann/gemma-4-E4B-it-qat-q4_0-unquantized

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, disenado para ejecucion en dispositivos de borde (telefonos de gama alta, portatiles y workstations modestas). El checkpoint aqui descrito, `heromann/gemma-4-E4B-it-qat-q4_0-unquantized`, es una extraccion en media precision de los pesos resultantes del pipeline de Quantization-Aware Training (QAT) de Google, pensada para investigacion y compilacion personalizada posterior. El modelo base es `google/gemma-4-E4B-it`, la variante instruction-tuned de 4.500 millones de parametros efectivos (8.000 millones contando embeddings).

El modelo procesa texto, imagen y audio como entrada, y genera texto como salida. Emplea una arquitectura transformer densa con atencion hibrida: capas de atencion local con ventana deslizante de 512 tokens intercaladas con capas de atencion global, garantizando que la ultima capa sea siempre global. Incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia parametrica en despliegues on-device, y soporta una ventana de contexto de 128.000 tokens.

La relevancia de esta publicacion radica en que expone los pesos QAT sin cuantizar, lo que permite a investigadores estudiar el efecto del entrenamiento con cuantizacion consciente y recompilar los pesos a otros formatos o precisiones. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo hereda las condiciones de la licencia Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.941.100.874 (4,5B efectivos; 8B con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | QAT Q4_0 (este checkpoint es la extraccion sin cuantizar en media precision); disponibles tambien GGUF Q4_0, wNa8o8 mobile y w4a16 compressed-tensors |
| Idiomas soportados | Mas de 140 idiomas (segun model card de la familia) |
| Licencia | Apache 2.0 (con license_link a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 42 capas con un vocabulario de 262.144 tokens. La innovacion arquitectonica principal es la atencion hibrida: las capas locales usan una ventana deslizante de 512 tokens, mientras que las capas globales emplean Keys y Values unificados junto con Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Esta combinacion busca el rendimiento de un modelo ligero sin renunciar a la comprension de dependencias de largo alcance. Los modulos multimodales incluyen un codificador de vision de aproximadamente 150 millones de parametros y un codificador de audio de aproximadamente 300 millones de parametros.

El checkpoint deriva del pipeline de Quantization-Aware Training de Google, en el que el modelo se entrena simulando la cuantizacion a 4 bits para preservar la calidad cercana a bfloat16 tras la compresion. Esta version concreta contiene los pesos en media precision extraidos de dicho pipeline, no cuantizados, lo que la hace adecuada para recompilacion, investigacion del efecto de QAT y generacion de formatos alternativos. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO especificas para esta variante.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Entrada multimodal: texto, imagen (con soporte de relacion de aspecto y resolucion variable) y audio.
- Codigo y matematicas, con mejoras notables en benchmarks de programacion segun la model card.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas y razonamiento multi-paso para flujos autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Decodificacion especulativa mediante modelos drafter (requiere que el asistente sea tambien QAT con la misma precision).
- Optimizado para ejecucion on-device en portatiles y moviles.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar dialogos multi-turno con hasta 128.000 tokens de contexto, lo que permite mantener historiales largos y documentos de referencia en memoria sin truncamientos agresivos, todo ello en hardware de gama alta movil o portatil.
- Transcripcion y comprension de audio en local: gracias al codificador de audio de ~300M de parametros, puede procesar reuniones o notas de voz y generar resumenes o respuestas sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Analisis de documentos e imagenes: con entrada de imagen de resolucion variable, resulta adecuado para extraer informacion de capturas, diagramas o formularios en aplicaciones de escritorio.
- Agentes autonomos con tool calling: su soporte nativo de function calling permite integrarlo en pipelines que consultan APIs, bases de datos o servicios externos en flujos multi-paso.
- Asistencia de codigo en IDE local: las mejoras en benchmarks de programacion y el contexto de 128K lo hacen viable para autocompletado y refactorizacion en entornos de desarrollo sin conexion.
- Investigacion sobre QAT: al ser pesos en media precision extraidos del pipeline QAT, sirve para estudiar la degradacion por cuantizacion, recompilar a GGUF o compressed-tensors y comparar calidades frente al modelo base bfloat16.
- Despliegue en movil con la variante wNa8o8: aunque este checkpoint no es el movil, el ecosistema Gemma 4 E4B permite portar el modelo a telefonos con el esquema optimizado de 2 bits en capas de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en media precision (este checkpoint): aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 24 GB para contexto moderado.
- VRAM estimada con cuantizacion Q4_0 (variante GGUF): en torno a 4-5 GB para pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: para media precision, A100 40GB, H100 o RTX 4090 (24 GB) con contexto reducido; para Q4_0, RTX 3060 12GB, RTX 4070 o superiores.
- Cabe en GPU de consumo: si, en RTX 4090 para media precision con contexto limitado, y en GPUs de 8-12 GB usando las variantes cuantizadas Q4_0 o wNa8o8.
- Opciones de despliegue: transformers (formato nativo de este checkpoint), llama.cpp y Ollama para GGUF, vLLM para compressed-tensors w4a16, y TGI segun soporte de la familia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B (este checkpoint) | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Este checkpoint contiene pesos en media precision extraidos de QAT; no es un modelo cuantizado listo para produccion con bajo consumo de memoria, sino material para investigacion y recompilacion.
- Al derivar de un pipeline QAT, el comportamiento puede diferir ligeramente del modelo base bfloat16 original; se recomienda validar la calidad antes de usarlo como sustituto directo.
- La decodificacion especulativa con modelos drafter exige que el asistente sea tambien QAT con la misma precision, lo que limita combinaciones con asistentes no QAT.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de razonamiento abierto y contextos muy largos.
- Sesgos conocidos: la model card no detalla sesgos especificos, pero al entrenarse con datos web a gran escala puede reproducir sesgos sociales, culturales y linguisticos; no disponible informacion detallada.
- La licencia Apache 2.0 se acompania de un enlace a la licencia Gemma 4 de Google, por lo que conviene revisar las condiciones adicionales de uso comercial y de redistribucion de la familia Gemma.
- El soporte de audio esta limitado a E2B, E4B y 12B; el modelo de 31B no incluye audio.
- No se dispone de informacion sobre idiomas exactos soportados ni sobre el volumen y composicion del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/heromann/gemma-4-E4B-it-qat-q4_0-unquantized
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma: https://deepmind.google/models/gemma/
