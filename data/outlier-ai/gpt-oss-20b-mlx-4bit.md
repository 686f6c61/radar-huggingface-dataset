# Outlier-Ai/gpt-oss-20b-MLX-4bit

## Resumen

`Outlier-Ai/gpt-oss-20b-MLX-4bit` es una conversion a formato MLX de 4 bits del modelo `openai/gpt-oss-20b` de OpenAI, publicada por el equipo de Outlier para su ejecucion en Apple Silicon (M1, M2, M3, M4). No se trata de un modelo nuevo ni de un fine-tune: solo cambia el formato en disco (safetensors MLX 4-bit, plantilla de chat y tokenizer), manteniendo los pesos y la licencia del modelo original. El objetivo es permitir inferencia local, offline y privada en Macs, sin dependencia de la nube ni de claves de API.

El modelo base es un transformer de tipo MoE con 20.914.755.648 parametros totales (segun los safetensors del repo), orientado a generacion de texto conversacional, razonamiento y function calling. La conversion esta pensada para `mlx-lm` 0.31.x y ocupa 11,2 GB en el repositorio, lo que la hace viable en equipos con memoria unificada media-alta de la gama Apple Silicon.

Su relevancia actual radica en que permite desplegar un modelo de ~21B en hardware de consumo Mac con cuantizacion 4-bit, manteniendo las capacidades del original (chat, tool calling, agentes) y con licencia Apache 2.0. La model card advierte que los numeros de rendimiento publicados por el autor provienen de experimentos internos y no de pruebas de release, por lo que deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun modelo base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.755.648 (~20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (group size 64, simetrica) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX 4-bit), con `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `openai/gpt-oss-20b`, un transformer con mezcla de expertos (MoE) segun la informacion disponible. Esta conversion no aporta cambios arquitectonicos: solo modifica el formato en disco a safetensors MLX 4-bit con grupo de cuantizacion de tamano 64 y simetria, compatible con `mlx-lm` 0.31.x. Se incluyen `config.json`, tokenizer y `chat_template.jinja` para el uso conversacional.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset, procesos de RLHF/DPO ni innovaciones tecnicas especificas del modelo base (por ejemplo, decodificacion especulativa o atencion lineal). Cualquier dato de ese tipo debe consultarse en la model card de `openai/gpt-oss-20b`. La model card de esta conversion indica explicitamente que los numeros publicados son de experimentos internos y no de pruebas de release.

## Capacidades

- Generacion de texto conversacional multi-turno (chat, instruct).
- Razonamiento y respuesta a preguntas de conocimiento general.
- Function calling / tool calling, segun los tags del repositorio (`function-calling`).
- Soporte para flujos de agentes y razonamiento multi-paso (heredado del modelo base, no documentado en detalle en esta conversion).
- Capacidades multilingues limitadas: el metadato de idioma declara unicamente `en`.
- Ejecucion local y offline en Apple Silicon mediante MLX y Metal, sin llamadas a la nube.
- Integracion con la aplicacion Outlier para Mac y con `mlx-lm` para uso programatico.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener dialogos multi-turno con plantilla de chat incluida, ejecutandose integramente en el dispositivo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Automatizacion con function calling en escritorio: gracias al soporte de tool calling, puede integrarse en flujos locales que invoquen APIs o scripts del propio equipo (por ejemplo, automatizacion de tareas ofimaticas o consultas a bases de datos locales).
- Prototipado de agentes en Apple Silicon: util para desarrolladores que quieran iterar sobre pipelines de agentes multi-paso en un Mac antes de desplegar en infraestructura mayor, aprovechando la cuantizacion 4-bit para reducir requisitos de memoria.
- Procesamiento de documentos privados: resumenes y extraccion de informacion de textos sensibles (contratos, notas internas) sin salida de datos, usando el modelo via `mlx-lm` en scripts locales.
- Educacion y experimentacion: analisis de modelos MoE y de tecnicas de cuantizacion 4-bit en un entorno reproducible (`mlx-lm` 0.31.x) con hardware de consumo.
- Desarrollo de aplicaciones macOS nativas: integracion del modelo en apps de escritorio mediante la libreria MLX y la app Outlier, con modelo descargable y ejecutable sin API keys.
- Evaluacion comparativa de formatos: util para medir el impacto de la cuantizacion 4-bit frente a los pesos originales en tareas de chat y generacion, siempre que se disponga de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M, pero advierte que los numeros son de experimentos internos y no de pruebas de release. No se incluyen tablas numericas en esta ficha para no inventar datos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 11,2 GB en formato MLX 4-bit; se recomienda al menos 16 GB de memoria unificada para cargar el modelo con margen para el contexto y el sistema, y 24-32 GB para sesiones largas o contextos amplios.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (segun los tags del repositorio), incluyendo MacBook Air, MacBook Pro, Mac mini y Mac Studio. No esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (orientativamente 16 GB o mas); no aplica a GPUs de consumo x86.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI y API Python), aplicacion Outlier para macOS arm64 (instalable via `brew install --cask outlier-host/tap/outlier`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la pagina de benchmarks del autor para cifras de tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Outlier-Ai/gpt-oss-20b-MLX-4bit` | ~20,9B | no disponible | MLX 4-bit safetensors | apache-2.0 | Hugging Face, `mlx-lm`, app Outlier |
| `openai/gpt-oss-20b` (base) | ~20,9B | no disponible | safetensors originales | apache-2.0 | Hugging Face |
| `Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit` | no disponible en la informacion | no disponible | MLX 4-bit | no disponible en la informacion | Hugging Face (1.598 descargas) |
| `Outlier-Ai/Outlier-Core-27B-MLX-4bit` | no disponible en la informacion | no disponible | MLX 4-bit | no disponible en la informacion | Hugging Face (55 descargas) |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento comparativo (benchmarks) entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles (`en`) en los metadatos; el rendimiento en castellano no esta verificado y podria ser inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta conversion.
- La cuantizacion 4-bit puede degradar la calidad frente a los pesos originales en tareas sensibles (matematicas, codigo, razonamiento largo); no se aportan mediciones en la informacion disponible.
- La longitud de contexto no esta indicada en el repositorio; conviene consultar la model card de `openai/gpt-oss-20b` antes de disenar flujos con contextos largos.
- La licencia Apache 2.0 se hereda del modelo base; deben revisarse las restricciones de uso del modelo original en su model card canonica.
- Los numeros de rendimiento citados por el autor provienen de experimentos internos, no de pruebas de release; no deben usarse como garantia en produccion.
- El formato es exclusivo de MLX/Apple Silicon; no es portable a CUDA, ROCm ni CPU x86 sin reconversion.
- La model card incluye promocion de la aplicacion Outlier (plan Pro de pago); esta ficha no valida ni respalda dichas afirmaciones comerciales.
- El repositorio tiene un numero bajo de descargas (605) y cero likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/gpt-oss-20b-MLX-4bit
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Benchmarks del autor: https://outlier.host/benchmarks
- Aplicacion Outlier: https://outlier.host/
- Otras conversiones del autor:
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
