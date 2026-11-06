# hirundo-io/gemma-4-E4B-it-8B

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada con pesos abiertos. La variante E4B emplea una arquitectura densa con un total de 8.000 millones de parametros (4.500 millones "efectivos" mas tablas de embeddings por capa, PLE), disenada especificamente para despliegue en dispositivos de borde como portatiles y moviles. Procesa texto, imagen y audio como entrada, y genera texto como salida, con una ventana de contexto de 128.000 tokens.

El modelo que nos ocupa, `hirundo-io/gemma-4-E4B-it-8B`, es un fine-tune de la variante instruction-tuned de Gemma 4 E4B publicado por el usuario hirundo-io. El repositorio contiene los pesos en formato safetensors (16 GB) y esta etiquetado como compatible con endpoints de Hugging Face y con licencia Apache 2.0. La relevancia de esta ficha radica en documentar un derivado comunitario de un modelo de frontera abierto, con capacidades nativas de razonamiento configurable, function calling y procesamiento multimodal.

La familia Gemma 4 introduce mejoras arquitectonicas notables: atencion hibrida que intercala ventanas deslizantes locales con atencion global, soporte nativo del rol `system`, y modos de "thinking" configurables. El E4B, en particular, incorpora codificadores dedicados de vision (~150M parametros) y audio (~300M parametros), lo que lo convierte en una opcion atractiva para aplicaciones multimodales en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (~8B, incluyendo embeddings); 4.5B efectivos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas (segun la model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un transformer decoder-only denso de 42 capas con un vocabulario de 262.144 tokens. La innovacion principal es el mecanismo de atencion hibrida: las capas alternan atencion local con ventana deslizante de 512 tokens y atencion global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). Ademas, incorpora Per-Layer Embeddings (PLE): cada capa del decoder dispone de su propia tabla de embeddings por token, lo que eleva el recuento total de parametros pero mantiene bajo el coste computacional efectivo (4.5B).

El modelo integra codificadores dedicados para vision (~150M parametros) y audio (~300M parametros), que proyectan las modalidades de entrada al espacio de embeddings del LLM. La model card de la familia indica que los modelos Gemma 4 se disenaron como razonadores con modos de "thinking" configurables, soporte nativo de function calling y mejoras en benchmarks de codigo. No se dispone de informacion especifica sobre el dataset de entrenamiento (numero de tokens, composicion, uso de RLHF/DPO) ni sobre el proceso de fine-tune aplicado por hirundo-io en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables.
- Comprension de imagenes con soporte de aspecto y resolucion variables.
- Procesamiento de audio nativo (entrada de audio y salida de texto).
- Generacion de codigo y capacidades agenticas mejoradas respecto a generaciones anteriores.
- Soporte nativo de function calling / tool calling.
- Soporte del rol `system` nativo para conversaciones estructuradas.
- Capacidades multilingues en mas de 140 idiomas.
- Flujos de razonamiento multi-paso para agentes autonomos.
- Procesamiento de video como modalidad de entrada (segun la model card de la familia).

## Casos de uso

- **Atencion al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con contexto de 128K tokens, incluyendo capturas de pantalla o imagenes enviadas por el usuario, lo que permite resolver incidencias tecnicas sin derivar a un humano en primera instancia.
- **Asistente de accesibilidad en movil**: gracias a su tamano efectivo de 4.5B y su soporte de audio, puede transcribir y describir escenas o contenido visual en tiempo real en dispositivos de borde, funcionando como asistente para personas con discapacidad visual.
- **Generacion de codigo en pipelines de CI/CD**: el soporte nativo de function calling y su capacidad de razonamiento permiten integrarlo en flujos automatizados de revision de codigo, generacion de tests o resolucion de issues con acceso a herramientas externas.
- **Analisis de documentos con imagenes**: el modelo puede extraer informacion de facturas, formularios o graficos escaneados combinando vision y contexto largo, util para automatizacion de back-office.
- **Agentes autonomos de investigacion**: con razonamiento multi-paso y tool calling, puede orquestar busquedas, llamadas a APIs y sintesis de resultados en tareas de recopilacion de informacion.
- **Transcripcion y resumen de reuniones**: el soporte de audio permite procesar grabaciones y generar actas estructuradas con contexto suficiente para reuniones largas.
- **Chatbot multilingue para soporte internacional**: con mas de 140 idiomas, puede atender usuarios en su lengua nativa sin necesidad de modelos auxiliares de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en safetensors a precision completa (BF16), el modelo requiere aproximadamente 16 GB de VRAM solo para los pesos, mas overhead de KV cache y activaciones. En cuantizacion de 8 bits, se estima en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones basadas en el recuento de parametros, no confirmadas en la informacion proporcionada).
- **GPU recomendadas**: A100 40GB, H100, L40S para despliegue en servidor a precision completa. En consumer, RTX 4090 (24 GB) permite inferencia en BF16 con margen; RTX 4080/4070 Ti (16 GB) requiere cuantizacion.
- **Cabe en consumer GPU**: si, en GPUs con 16 GB o mas en cuantizacion, y en GPUs de 24 GB a precision completa.
- **Opciones de despliegue**: transformers (libreria nativa del repositorio), vLLM, TGI y llama.cpp/Ollama (sujeto a conversion a GGUF, no confirmada en la informacion disponible). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B (este fine-tune) | ~8B totales (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 E2B | ~5.1B totales (2.3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 26B A4B (MoE) | 25.2B totales (3.8B activos) | 256K | Texto, imagen | Apache 2.0 | Hugging Face |

La comparativa se limita a la propia familia Gemma 4, ya que no se dispone en la informacion proporcionada de datos de rendimiento frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos especificos en la informacion disponible; como modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales, pero no hay datos confirmados.
- **Alucinacion**: no se proporcionan tasas de alucinacion ni evaluaciones de fidelidad; se recomienda validacion humana en produccion.
- **Contexto e idioma**: aunque la familia soporta 128K tokens y mas de 140 idiomas, el rendimiento puede degradarse en contextos muy largos o en idiomas de bajos recursos; no hay datos especificos para este fine-tune.
- **Licencia**: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), que puede imponer terminos adicionales de uso aceptable; conviene revisarla antes de desplegar en produccion.
- **Fine-tune comunitario**: al ser un derivado publicado por un tercero (hirundo-io) con solo 60 descargas y 0 likes, no hay garantias de calidad, evaluacion ni mantenimiento; se recomienda validar el modelo frente al base original `google/gemma-4-E4B`.
- **Cuantizacion**: no se confirma la disponibilidad de pesos GGUF ni de versiones cuantizadas oficiales para este fine-tune concreto.

## Enlaces

- [Hugging Face: hirundo-io/gemma-4-E4B-it-8B](https://huggingface.co/hirundo-io/gemma-4-E4B-it-8B)
- [Coleccion Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentacion de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe tecnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Pagina de modelos Gemma de Google DeepMind](https://deepmind.google/models/gemma/)
- [Modelo base: google/gemma-4-E4B](https://huggingface.co/google/gemma-4-E4B)
