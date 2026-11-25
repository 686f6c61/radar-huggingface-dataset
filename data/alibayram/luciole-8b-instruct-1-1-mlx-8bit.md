# alibayram/Luciole-8B-Instruct-1.1-mlx-8bit

## Resumen

Luciole-8B-Instruct-1.1-mlx-8bit es una cuantizacion en 8 bits del modelo OpenLLM-France/Luciole-8B-Instruct-1.1, publicada por el usuario alibayram en formato MLX para su ejecucion nativa en Apple Silicon. El modelo base es un modelo de lenguaje hibrido de 8.075.677.696 parametros desarrollado por OpenLLM-France, orientado a generacion de texto conversacional en frances e ingles.

La arquitectura del modelo base combina capas de tipo Mamba2 con atencion transformer clasica (arquitectura hibrida identificada como nemotron_h), lo que permite manejar secuencias largas con un coste computacional menor que un transformer puro de tamano equivalente. El modelo esta afinado para instrucciones (Instruct) y se distribuye bajo licencia Apache 2.0.

Esta ficha cubre la variante cuantizada a 8 bits en formato MLX, cuyo repositorio ocupa 8,6 GB y esta pensado para inferencia local en equipos con chip Apple (M1, M2, M3, M4 y posteriores). El acceso al repositorio esta restringido y requiere aceptar las condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (nemotron_h / mamba2 + atencion), segun tags del repositorio |
| Parametros totales | 8.075.677.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (esta variante); el modelo base admite otras segun el ecosistema |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, empaquetado para la libreria MLX |
| Tamano del repositorio | 8,6 GB |
| Libreria de inferencia | MLX |
| Modelo base | OpenLLM-France/Luciole-8B-Instruct-1.1 |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que combina bloques Mamba2 (modelos de espacio de estados) con capas de atencion, identificada en los metadatos como nemotron_h. Esta combinacion busca reducir el coste de atencion cuadratica en contextos largos manteniendo la capacidad de modelado de dependencias a larga distancia propia de los transformers. El modelo tiene 8.075.677.696 parametros totales y esta afinado para seguir instrucciones en frances e ingles.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se detalla el proceso de cuantizacion a 8 bits mas alla de que se ha realizado con la libreria MLX y que el resultado se distribuye en safetensors. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno en frances e ingles.
- Seguimiento de instrucciones (variante Instruct del modelo base).
- Razonamiento general y respuesta a preguntas.
- Generacion de codigo y texto tecnico (capacidad esperable en un modelo de 8B, sin datos de benchmark publicados en esta ficha).
- Capacidades multilingues limitadas a frances e ingles segun los metadatos.
- Inferencia local en Apple Silicon mediante MLX.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional en frances para aplicaciones de escritorio o moviles en macOS/iOS: el modelo puede ejecutarse localmente con MLX en equipos Apple, sin enviar datos a la nube, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Prototipado rapido en portatiles Apple: gracias a la cuantizacion a 8 bits y al backend MLX, permite iterar sobre prompts y flujos conversacionales en un Mac sin GPU dedicada.
- Generacion y revision de textos en frances: redaccion de correos, resumenes y parafraseo en un idioma con menos cobertura en modelos abiertos que el ingles.
- Traduccion frances-ingles en entornos offline: util en herramientas de escritorio o pipelines locales donde no se desea dependencia de APIs externas.
- Educacion y experimentacion: modelo de tamano medio (8B) para estudiar arquitecturas hibridas Mamba2 + atencion en un entorno controlado.
- Procesamiento por lotes en local: generacion de contenido a partir de plantillas en flujos de trabajo personales o de pequenos equipos con hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 8,6 GB; se recomienda al menos 12-16 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime de MLX.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es un formato pensado para GPU NVIDIA o AMD.
- En GPU consumer (RTX 4090, etc.) no es directamente utilizable sin conversion a otro formato (GGUF, safetensors con transformers), ya que la libreria MLX es especifica de Apple.
- Opciones de despliegue: MLX (mlx-lm) en macOS; para otros entornos habria que recurrir al modelo base OpenLLM-France/Luciole-8B-Instruct-1.1 y convertirlo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luciole-8B-Instruct-1.1-mlx-8bit | 8,07B | no disponible | fr, en | Apache 2.0 | MLX 8-bit |
| OpenLLM-France/Luciole-8B-Instruct-1.1 (base) | 8,07B | no disponible | fr, en | Apache 2.0 | safetensors |
| Modelos 7-8B generalistas (p. ej. familias Llama/Mistral/Qwen) | ~7-8B | variable | multilingue | variable | varios |

La comparacion cuantitativa con alternativas no puede realizarse sin datos de benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Cobertura linguistica limitada a frances e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Al ser una cuantizacion a 8 bits, puede presentar una ligera perdida de calidad frente al modelo base en tareas sensibles.
- Formato especifico de Apple Silicon (MLX): no portable directamente a otros backends sin conversion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en la informacion disponible.
- No se dispone de informacion sobre sesgos evaluados ni sobre el dataset de entrenamiento, lo que dificulta auditar su comportamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del acceso gated antes de un uso comercial.
- Sin benchmarks publicados en esta ficha, no se recomienda su adopcion en produccion sin una evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alibayram/Luciole-8B-Instruct-1.1-mlx-8bit
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-Instruct-1.1
- Libreria MLX: https://github.com/ml-explore/mlx
- OpenLLM-France: https://huggingface.co/OpenLLM-France
