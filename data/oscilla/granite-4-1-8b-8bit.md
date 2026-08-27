# Oscilla/granite-4.1-8b-8bit

## Resumen

El modelo `Oscilla/granite-4.1-8b-8bit` es una conversión a formato MLX con cuantización de 8 bits del modelo `ibm-granite/granite-4.1-8b`, perteneciente a la familia Granite 4.1 desarrollada por IBM. Esta familia de modelos de lenguaje densos, con arquitectura decoder-only, está diseñada para tareas de conversación, razonamiento, generación de código y salida estructurada en JSON. El modelo base fue entrenado desde cero sobre aproximadamente 15 billones de tokens, con un pipeline de post-entrenamiento que incluye fine-tuning supervisado y alineación por refuerzo, lo que mejora el seguimiento de instrucciones, el tool calling y el razonamiento matemático.

La versión MLX de 8 bits está optimizada para ejecutarse en hardware Apple Silicon mediante la librería `mlx-lm`, ofreciendo una alternativa eficiente en memoria para desarrolladores que trabajan en entornos macOS. Aunque el modelo base tiene 8 mil millones de parámetros, el archivo safetensors de esta conversión muestra 2.619.150.336 parámetros, una discrepancia que probablemente se deba a un error en la metadata del repositorio, ya que la cuantización no altera el número de parámetros. El modelo soporta un contexto largo de 128K tokens y capacidades multilingües, lo que lo hace relevante para aplicaciones de agentes, RAG y generación de código en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8B (modelo base); el archivo safetensors de esta conversion muestra 2.619.150.336, inconsistente con el nombre del modelo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun documentacion de IBM) |
| Tipos de cuantizacion | 8-bit (MLX); existen variantes GGUF de otros repositorios |
| Idiomas soportados | Multilingue (segun documentacion de IBM; no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), GGUF (en otros repos) |

## Arquitectura y entrenamiento

El modelo Granite 4.1 8B emplea una arquitectura transformer decoder-only densa, sin mezcla de expertos. Segun la documentacion oficial de IBM, la familia Granite 4.1 se entreno desde cero sobre aproximadamente 15 billones de tokens, con un pipeline de post-entrenamiento que combina fine-tuning supervisado sobre datasets de instrucciones de codigo abierto y datos sinteticos internos, seguido de alineacion por refuerzo. Este proceso mejora significativamente el seguimiento de instrucciones, el tool calling, la generacion de codigo y el razonamiento matematico en comparacion con versiones anteriores.

La conversion a MLX de 8 bits fue realizada con `mlx-lm` version 0.31.3, manteniendo la arquitectura original pero reduciendo el tamaño de los pesos a 8 bits por parametro. Esto permite una inferencia mas rapida y con menor consumo de memoria en hardware Apple Silicon, aunque con una ligera perdida de precision respecto a la version completa en FP16.

## Capacidades

- Generacion de texto conversacional y de larga forma con contexto de hasta 128K tokens.
- Razonamiento logico y matematico avanzado, incluyendo problemas de varios pasos.
- Generacion de codigo en multiples lenguajes de programacion, con soporte para tool calling y salida estructurada en JSON.
- Capacidades multilingues nativas, aunque los idiomas exactos no estan especificados en la model card.
- Soporte para retrieval-augmented generation (RAG) gracias a la ventana de contexto extendida.
- Funcionamiento como agente autonomo con razonamiento multi-paso y llamadas a herramientas externas.
- Salida en formato JSON estructurado, util para integraciones con APIs y pipelines de datos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens), manteniendo el historial completo de la interaccion y respondiendo con precision a consultas complejas.
- Generacion de codigo en produccion: con soporte para tool calling y salida JSON, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs.
- Asistentes de programacion con RAG: al combinar la ventana de contexto extendida con recuperacion de documentos, el modelo puede responder preguntas sobre codebases grandes o documentacion tecnica.
- Analisis de documentos extensos: su contexto de 128K tokens permite procesar informes, contratos o articulos cientificos completos sin truncamiento, extrayendo resumenes o respondiendo preguntas especificas.
- Agentes de automatizacion de tareas: puede actuar como agente que planifica y ejecuta acciones (envio de correos, consultas a APIs) mediante tool calling, con razonamiento multi-paso.
- Generacion de contenido estructurado: ideal para crear esquemas JSON, formularios o datos semiestructurados a partir de instrucciones en lenguaje natural, gracias a su capacidad de salida JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de IBM menciona mejoras en tool calling, instrucciones y razonamiento matematico, pero no se proporcionan cifras concretas para este modelo especifico. Se recomienda consultar la documentacion oficial de IBM Granite 4.1 para obtener datos de evaluacion comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para la version de 8 bits (8B parametros x 1 byte por parametro), mas overhead de activaciones y cache. En la practica, se recomienda al menos 12 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: en hardware Apple Silicon, cualquier chip con 16 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max) puede ejecutar el modelo con comodidad. En GPUs NVIDIA, se necesitaria una tarjeta con al menos 12 GB de VRAM (RTX 3060, RTX 4070, etc.) para la version MLX, aunque MLX esta disenado para Apple.
- Si cabe en consumer GPU: si, en GPUs de gama media con 12-16 GB de VRAM, aunque la version MLX esta optimizada para Apple Silicon.
- Opciones de despliegue: `mlx-lm` para Apple Silicon, `llama.cpp` para versiones GGUF en CPU/GPU, `vLLM` o `TGI` para servidores de inferencia en GPU (usando la version original en FP16 o cuantizaciones compatibles).
- Latencia y throughput: no se han publicado datos especificos. En Apple Silicon M2 Max, se espera una velocidad de generacion de 20-40 tokens/segundo con la cuantizacion de 8 bits, dependiendo del tamaño del prompt y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.1 8B (este) | 8B | 128K | Apache 2.0 | MLX 8-bit, GGUF | Multilingue, tool calling, JSON |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 license | FP16, GGUF, MLX | Muy popular, buen rendimiento general |
| Mistral 7B | 7B | 32K | Apache 2.0 | FP16, GGUF, MLX | Mas ligero, contexto menor, sin tool calling nativo |
| Qwen 2.5 7B | 7B | 128K | Apache 2.0 | FP16, GGUF, MLX | Multilingue, buen soporte de codigo |

La comparativa se basa en caracteristicas generales, ya que no se dispone de benchmarks comparativos en la informacion proporcionada. Granite 4.1 8B destaca por su licencia permisiva, contexto largo y soporte nativo de tool calling y JSON, lo que lo hace adecuado para aplicaciones de agentes y RAG.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado sobre datos de internet, puede reflejar sesgos sociales, culturales o de genero presentes en los datos. No se han publicado evaluaciones especificas de sesgo para este modelo.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en temas especializados o cuando se le pide precision factual. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento puede degradarse en contextos muy largos o con informacion dispersa. La atencion puede perder coherencia en documentos muy extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. No hay restricciones adicionales conocidas.
- Caveat de produccion: la version MLX de 8 bits puede tener una ligera perdida de precision respecto a la version FP16, lo que podria afectar tareas que requieren alta exactitud (por ejemplo, calculos numericos). Se recomienda evaluar en el caso de uso especifico.
- Dependencia de hardware: MLX solo funciona en Apple Silicon; para otros entornos se debe usar la version GGUF o la original en FP16.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Oscilla/granite-4.1-8b-8bit
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.1-8b
- Documentacion oficial de IBM Granite 4.1: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio GitHub de IBM Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Version GGUF de SandLogicTechnologies: https://huggingface.co/SandLogicTechnologies/granite-4.1-8b-GGUF
- Version de unsloth (fine-tune): https://huggingface.co/unsloth/granite-4.1-8b
