# Oscilla/gemma-3-1b-it-mlx-4Bit

## Resumen

Oscilla/gemma-3-1b-it-mlx-4Bit es una conversión a formato MLX con cuantización de 4 bits del modelo instructivo Gemma 3 de 1.000 millones de parámetros desarrollado por Google DeepMind. El modelo original, google/gemma-3-1b-it, forma parte de la familia Gemma 3, diseñada para ejecutarse eficientemente en una sola GPU, en estaciones de trabajo, portátiles e incluso dispositivos móviles. Esta conversión, realizada por el usuario Oscilla con la librería mlx-lm versión 0.31.2, permite desplegar el modelo en entornos Apple Silicon (MLX) con un consumo de memoria reducido, manteniendo las capacidades de generación de texto, razonamiento y conversación del modelo base.

La relevancia de esta ficha radica en que ofrece una opción ligera y de bajo coste para desarrolladores que necesitan un modelo de lenguaje pequeño pero capaz, con soporte para más de 140 idiomas y una ventana de contexto de 128.000 tokens, según la documentación oficial de Gemma 3. Al estar cuantizado a 4 bits, el modelo ocupa aproximadamente 0,6 GB, lo que lo hace viable en hardware de consumo y en entornos con restricciones de memoria. Es importante señalar que, aunque Gemma 3 en su versión completa es multimodal (texto e imágenes), esta conversión específica está etiquetada como `gemma3_text`, lo que indica que solo procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Gemma 3, basada en Gemini 2.0) |
| Parametros totales | 156.345.472 (dato de safetensors; el modelo base google/gemma-3-1b-it declara aproximadamente 1.000 millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (segun documentacion de Gemma 3) |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | mas de 140 idiomas (segun documentacion de Gemma 3) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base google/gemma-3-1b-it emplea una arquitectura Transformer estándar, derivada de la investigación que dio lugar a los modelos Gemini 2.0 de Google. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso con aproximadamente 1.000 millones de parámetros. La versión instructiva ha sido afinada mediante técnicas de aprendizaje por refuerzo a partir de retroalimentación humana (RLHF) y optimización de preferencias directa (DPO), lo que mejora su capacidad de seguir instrucciones y mantener conversaciones coherentes.

La conversión a MLX realizada por Oscilla no modifica la arquitectura subyacente, sino que transforma los pesos al formato optimizado para Apple Silicon y los cuantiza a 4 bits. Esto reduce el tamaño del modelo de aproximadamente 2 GB (en fp16) a 0,6 GB, con una pérdida mínima de calidad. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base, pero Google ha indicado que Gemma 3 se entrenó con una combinación de datos web multilingües, código y datos de instrucciones.

## Capacidades

- Generacion de texto y conversacion: el modelo esta optimizado para tareas de chat y asistencia, con una plantilla de chat integrada que permite aplicarla directamente con `apply_chat_template`.
- Razonamiento y resolucion de problemas: gracias al ajuste instructivo, puede abordar tareas de logica, matematicas y comprension lectora de nivel basico e intermedio.
- Soporte multilingue: segun la documentacion de Gemma 3, el modelo soporta mas de 140 idiomas, aunque no se especifica la lista exacta para esta conversion.
- Tool calling y function calling: el modelo base Gemma 3 incluye soporte para llamadas a herramientas, lo que permite integrarlo en agentes y flujos de automatizacion. Esta capacidad se conserva en la conversion MLX.
- Ventana de contexto larga: con 128.000 tokens de contexto, puede procesar documentos extensos, mantener conversaciones de multiples turnos y manejar historiales largos.
- Eficiencia en hardware Apple: al estar en formato MLX y cuantizado a 4 bits, se ejecuta de forma nativa en chips Apple Silicon (M1, M2, M3, etc.) con un uso de memoria reducido.

## Casos de uso

- Asistente conversacional en dispositivos moviles: gracias a su tamano reducido (0,6 GB) y a la compatibilidad con MLX, puede desplegarse en un iPhone o iPad para ofrecer respuestas a preguntas frecuentes, recordatorios o resumen de notas, sin depender de una conexion a internet.
- Chatbot de atencion al cliente en una web: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens), lo que permite mantener el historial completo de una interaccion y ofrecer respuestas coherentes y personalizadas. Su licencia Gemma permite uso comercial bajo ciertas condiciones.
- Generacion de codigo en entornos de desarrollo: aunque no es un modelo especializado en codigo, puede asistir en tareas de autocompletado, explicacion de fragmentos y generacion de scripts simples. Su soporte de tool calling permite conectarlo a un entorno de ejecucion para probar codigo.
- Resumen de documentos extensos: con una ventana de 128K tokens, puede procesar informes, articulos o contratos de gran longitud y generar resumenes estructurados, lo que resulta util en entornos juridicos o de investigacion.
- Clasificacion y extraccion de informacion: el modelo puede utilizarse para etiquetar textos, extraer entidades o clasificar correos electronicos en categorias, gracias a su capacidad de seguir instrucciones detalladas.
- Prototipado rapido de agentes de IA: al ser ligero y compatible con librerias como mlx-lm, es ideal para experimentar con arquitecturas de agentes, flujos de razonamiento multi-paso y orquestacion de herramientas en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base google/gemma-3-1b-it cuenta con resultados publicados en su ficha de HuggingFace (MMLU, HumanEval, GSM8K, etc.), pero no se dispone de esos datos en el material proporcionado. Se recomienda consultar la ficha del modelo original para obtener metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB, dado que el modelo pesa 0,6 GB en cuantizacion de 4 bits. Con overhead de ejecucion, se recomienda al menos 2 GB de memoria libre.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de consumo como NVIDIA GTX 1650, RTX 3050, o integradas Apple Silicon (M1 o superior). En CPU, puede ejecutarse con 4-8 GB de RAM.
- Compatibilidad con hardware de consumo: si, cabe en la mayoria de portatiles y mini-PCs modernos. En Apple Silicon, el formato MLX ofrece un rendimiento optimo.
- Opciones de despliegue: mlx-lm (recomendado para Apple Silicon), llama.cpp (si se convierte a GGUF), Ollama (si se importa), y servidores de inferencia compatibles con endpoints como FriendliAI.
- Latencia y throughput: no se dispone de datos medidos para esta conversion. En un Apple M2, se estima una velocidad de generacion de 20-40 tokens por segundo, pero estos valores son orientativos y dependen del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/gemma-3-1b-it-mlx-4Bit | ~1B (156M segun safetensors) | 128K | 4-bit MLX | Gemma | MLX |
| mlx-community/gemma-3-1b-it-4bit | ~1B | 128K | 4-bit MLX | Gemma | MLX |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | 4-bit GGUF | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-1B-Instruct | 1B | 128K | 4-bit GGUF | Llama 3.2 | GGUF, safetensors |

La comparativa se basa en datos publicos de los modelos mencionados. Oscilla y mlx-community ofrecen conversiones MLX del mismo modelo base, por lo que sus capacidades son identicas. Qwen2.5-1.5B y Llama-3.2-1B son alternativas de tamano similar, pero con diferencias en contexto (Qwen2.5 tiene 32K, Llama-3.2 tiene 128K) y licencia (Apache 2.0 y Llama 3.2 respectivamente). No se dispone de datos de rendimiento comparativo en esta informacion.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos web, puede reflejar sesgos sociales, culturales y de genero presentes en esos datos. Google recomienda evaluar el modelo en el contexto de uso antes de desplegarlo en produccion.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de hechos especificos o datos numericos. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, el rendimiento puede degradarse en contextos muy largos, y el modelo puede perder coherencia en conversaciones extremadamente extensas.
- Limitaciones de idioma: aunque soporta mas de 140 idiomas, el rendimiento es desigual; los idiomas con menos representacion en el entrenamiento pueden producir respuestas de menor calidad.
- Restricciones de licencia: la licencia Gemma de Google incluye condiciones de uso aceptable y puede requerir atribucion. Es necesario revisar los terminos completos antes de un uso comercial.
- Advertencia de cuantizacion: la cuantizacion a 4 bits puede introducir una ligera perdida de precision en tareas de razonamiento complejo o generacion de codigo, en comparacion con el modelo en precision completa.
- Dato de parametros inconsistente: el numero de parametros reportado en safetensors (156.345.472) no coincide con el tamano declarado del modelo base (1B). Esto puede deberse a un error en la metadata de la conversion; se recomienda verificar antes de confiar en ese dato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/gemma-3-1b-it-mlx-4Bit
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Conversion similar de mlx-community: https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Despliegue en FriendliAI: https://friendli.ai/models/Oscilla/gemma-3-1b-it-mlx-4Bit
- Coleccion Gemma 3 de mlx-community: https://huggingface.co/collections/mlx-community/gemma-3
- Pagina oficial de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 en Ollama: https://ollama.com/library/gemma3:1b
