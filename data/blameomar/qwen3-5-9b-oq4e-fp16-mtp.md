# BlameOmar/Qwen3.5-9B-oQ4e-fp16-mtp

## Resumen

BlameOmar/Qwen3.5-9B-oQ4e-fp16-mtp es una version cuantizada del modelo Qwen3.5-9B, publicada por el usuario BlameOmar. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos mediante la herramienta oQ (oMLX v0.7.1.dev1), que aplica cuantizacion de precision mixta a 4 bits con group size 64 y conserva en fp16 los pesos no cuantizados y las escalas de cuantizacion. El resultado es un repositorio de 7,2 GB en formato MLX safetensors, pensado para ejecucion en Apple Silicon.

El modelo base pertenece a la familia Qwen3.5 de Alibaba Qwen y, segun las fuentes disponibles, es un modelo nativamente multimodal (vision-lenguaje) de aproximadamente 9.000 millones de parametros, con 262.000 tokens de contexto nativo extensibles a 1 millon mediante YaRN, soporte de 201 idiomas, tool calling nativo y modo de razonamiento (thinking mode) activado por defecto. El repositorio de safetensors declara 9.653.104.368 parametros reales.

Su relevancia practica es acotada pero clara: permite ejecutar un VLM de gama media-alta en un Mac con memoria unificada, algo que la version en bf16 (en torno a 19 GB de pesos) dificulta en equipos de 16 GB. Es, por tanto, una ficha de interes para desarrolladores que trabajan en el ecosistema MLX y necesitan inferencia local de un modelo multimodal con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) de la familia qwen3_5; descrito como denso por unas fuentes e hibrido por otras. Detalle exacto de capas y atencion: no disponible |
| Parametros totales | 9.653.104.368 (9,65 B) segun los safetensors del repositorio cuantizado; el modelo base se comercializa como 9B |
| Parametros activos | No aplica si el modelo base es denso; no disponible la confirmacion oficial |
| Longitud de contexto | 262.144 tokens nativos en el modelo base, extensibles a 1.000.000 con YaRN. El repositorio cuantizado no declara contexto propio |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQ. Pesos no cuantizados y escalas almacenados en fp16 |
| Idiomas soportados | 201 idiomas en el modelo base (segun fuentes de busqueda); no verificado en el repositorio cuantizado |
| Licencia | No disponible en el repositorio. El modelo base se publica bajo Apache 2.0 segun las fuentes consultadas |
| Formato de pesos | MLX safetensors (formato oQ), libreria mlx |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por el autor, sino una cuantizacion del checkpoint Qwen3.5-9B. La herramienta empleada es oQ, componente del proyecto oMLX (version v0.7.1.dev1), que aplica cuantizacion de precision mixta: asigna 4 bits a los tensores del modelo de lenguaje con group size 64, mientras que los pesos no cuantizados y las escalas de cuantizacion se conservan en float16 en lugar de bfloat16. Esa decision explica que el repositorio ocupe 7,2 GB, bastante mas que una cuantizacion 4-bit pura de 9B (que rondaria los 5 GB), ya que incluye las partes en fp16 de mayor tamano. El model type declarado es qwen3_5.

Sobre el modelo base, las fuentes de busqueda describen una arquitectura nativamente multimodal de tipo vision-lenguaje, con modo de razonamiento activo por defecto, soporte nativo de tool calling y una ventana de 262.000 tokens ampliable a 1 millon mediante YaRN. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas por el equipo de Qwen. Tampoco se detalla si la cuantizacion oQ aplica heuristicas de sensibilidad por capa (por ejemplo, mantener en mayor precision las capas de atencion o los embeddings), mas alla del group size 64 indicado.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, activado por defecto en el modelo base.
- Comprension de imagenes y razonamiento vision-lenguaje, al ser un modelo nativamente multimodal.
- Tool calling y function calling nativos, orientados a flujos agenticos.
- Razonamiento multi-paso y uso en pipelines de agentes con varias llamadas encadenadas.
- Cobertura multilingue declarada de 201 idiomas en el modelo base.
- Procesamiento de contexto largo (262.000 tokens, hasta 1 millon con YaRN en el modelo base).
- Capacidades de codigo y matematicas: no confirmadas con datos concretos en la informacion disponible.

## Casos de uso

- Asistente documental local en Mac: indexar manuales tecnicos o expedientes de cientos de paginas y consultarlos en una sola ventana de contexto, aprovechando los 262.000 tokens del modelo base y la ejecucion offline que permite MLX.
- Analisis de capturas y diagramas: extraer informacion estructurada de pantallazos de errores, diagramas de arquitectura o gráficos de negocio, combinando la entrada de imagen con la generacion de texto.
- Agente de automatizacion de escritorio: usar el tool calling nativo para encadenar acciones (leer ficheros, llamar a una API local, generar un informe) en un Mac sin enviar datos a servicios externos.
- Traduccion y atencion multilingue: procesar correspondencia en varios idiomas apoyandose en la cobertura de 201 idiomas del modelo base, con la advertencia de que la calidad por idioma no esta documentada.
- Prototipado rapido en el ecosistema MLX: validar prompts, plantillas de chat y flujos con tool calling antes de pasar a un despliegue mayor, dado que el formato safetensors MLX se carga directamente con mlx-lm.
- Investigacion sobre cuantizacion: comparar la degradacion de un modelo multimodal de 9B cuantizado a 4 bits con group size 64 frente a otras recetas (GGUF Q4_K_M, AWQ, GPTQ) como linea base experimental.
- Generacion asistida de codigo en local: uso como autocompletado o revisor en un editor, siempre que se asuma que el rendimiento en codigo no viene respaldado por benchmarks publicados en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas referencias cualitativas encontradas en la busqueda web, sin cifras que las respalden, son las siguientes: un medio especializado afirma que Qwen3.5-9B "supera a Qwen3-30B en la mayoria de benchmarks" y "vence a GPT-5-Nano en tareas de vision". Estas afirmaciones corresponden al modelo base en su version completa, no a la conversion cuantizada a 4 bits que documenta esta ficha, y no deben extrapolarse sin medicion propia.

## Requisitos de hardware

- Espacio en disco: 7,2 GB de repositorio, mas el espacio temporal necesario durante la descarga.
- Memoria unificada recomendada: 16 GB o mas en Apple Silicon para cargar el modelo con margen para el contexto y el procesador de vision. Con 8 GB el margen es muy ajustado incluso usando ventanas de contexto cortas.
- Chips compatibles: familia Apple M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra). El formato MLX safetensors no se ejecuta de forma nativa en GPUs NVIDIA o AMD sin conversion previa.
- GPU dedicada: no aplica al formato publicado. Para usar CUDA habria que reconvertir los pesos a GGUF, AWQ o GPTQ con otras herramientas. VRAM estimada en ese caso: en torno a 5-6 GB a 4 bits y unos 19-20 GB en bf16/fp16 (estimacion a partir del recuento de parametros, no confirmada por el autor).
- Opciones de despliegue: mlx-lm y mlx_lm.server en el ecosistema MLX; llama.cpp, Ollama, vLLM o TGI requeririan conversion de formato, ya que no cargan safetensors MLX de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlameOmar/Qwen3.5-9B-oQ4e-fp16-mtp | 9,65 B | No declarado (base 262K) | MLX safetensors, 4 bits | No disponible | HuggingFace, 0 descargas |
| thederby/Qwen3.5-9B-oQ4e-mtp | No disponible | No disponible | MLX safetensors, 4 bits | No disponible | HuggingFace |
| Qwen3.5-9B (base) | ~9 B | 262K, hasta 1M con YaRN | safetensors bf16 | Apache 2.0 segun fuentes | Peso abierto, varios proveedores de API |
| Qwen3-30B (referencia citada) | 30 B | No disponible | No disponible | No disponible | No disponible |

Las dos cuantizaciones listadas comparten receta oQ4e; la diferencia declarada por el autor de la variante thederby es el tipo de dato de los pesos no cuantizados y de las escalas (bf16 por defecto, fp16 en la version con sufijo). No se dispone de comparativas medidas entre ambas.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio cuantizado: aunque el modelo base se publique bajo Apache 2.0 segun las fuentes, el repositorio derivado no especifica terminos, lo que introduce incertidumbre para uso comercial.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay terceros que hayan verificado la integridad o la calidad de la conversion.
- Rendimiento de la cuantizacion sin medir: no hay evaluaciones que cuantifiquen la perdida de calidad frente al modelo en bf16, especialmente critica en tareas de vision y en razonamiento de varios pasos.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se han publicado tasas de error ni evaluaciones de fidelidad.
- Sesgos: no documentados por el autor. La cobertura de 201 idiomas declarada para el modelo base no implica calidad homogenea, y no hay evaluaciones por idioma en la informacion disponible.
- Restriccion de plataforma: el formato MLX limita el uso a Apple Silicon. No hay versiones GGUF, AWQ o GPTQ publicadas en este repositorio.
- Contexto efectivo no verificado: aunque el modelo base soporte 262.000 tokens, en un equipo con 16 GB de memoria unificada la ventana util sera previsiblemente mucho menor por presion de memoria.
- Fechas de creacion y actualizacion poco habituales en los metadatos del repositorio; conviene verificar la procedencia de los pesos antes de integrarlos en produccion.
- Requisito de confiar en el proceso de cuantizacion de terceros: no se detalla auditoria del script oQ ni de la correspondencia tensor a tensor con el checkpoint original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BlameOmar/Qwen3.5-9B-oQ4e-fp16-mtp
- Variante equivalente de otro autor: https://huggingface.co/thederby/Qwen3.5-9B-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Ficha de Qwen3.5 9B en Together AI: https://www.together.ai/models/qwen3-5-9b
- Especificaciones y VRAM en apxml: https://apxml.com/models/qwen35-9b
- Ficha en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
