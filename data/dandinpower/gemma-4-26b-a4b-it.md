# DandinPower/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es una variante del modelo multimodal Gemma 4 desarrollado por Google DeepMind, concretamente un finetune del modelo base `google/gemma-4-26B-A4B` realizado por el usuario DandinPower. Este modelo emplea una arquitectura Mixture-of-Experts (MoE) con 25.805 millones de parámetros totales, de los cuales solo se activan aproximadamente 3.800 millones por token, lo que permite un rendimiento comparable a modelos densos mucho más grandes con un coste computacional reducido. Está diseñado para tareas de generación de texto, razonamiento, codificación y comprensión multimodal de imágenes, con una ventana de contexto de hasta 256K tokens.

La relevancia de este modelo radica en que combina la capacidad de procesar texto e imagen con un contexto muy largo, soporte nativo para function calling y un modo de razonamiento configurable. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues en producción. Al ser un finetune de la versión base, se espera que herede las capacidades del modelo original, aunque no se proporcionan detalles específicos sobre el proceso de ajuste ni sobre el dataset utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (Mixture-of-Experts) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 3.8B (segun model card) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE con 30 capas, 128 expertos totales de los cuales 8 se activan por token junto con 1 experto compartido. Emplea un mecanismo de atencion hibrida que intercala atencion local de ventana deslizante (1024 tokens) con atencion global completa, garantizando que la ultima capa siempre sea global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos.

En cuanto al entrenamiento, no se proporcionan detalles especificos sobre el finetune realizado por DandinPower. El modelo base de Google DeepMind fue entrenado con un enfoque multimodal que incluye texto e imagen, con un encoder de vision de aproximadamente 550M de parametros. El modelo original incorpora soporte nativo para el rol `system` en las conversaciones, lo que permite un control estructurado del comportamiento. No se mencionan tecnicas como RLHF o DPO en la informacion disponible, aunque es probable que el modelo instructonico base haya pasado por procesos de alineacion.

## Capacidades

- Generacion de texto, razonamiento y codificacion: el modelo esta disenado como un razonador de alto rendimiento, con modos de pensamiento configurables.
- Procesamiento multimodal: acepta entrada de texto e imagen, con soporte de resolucion variable y ratio de aspecto flexible.
- Function calling nativo: soporta invocacion de herramientas, lo que permite su integracion en flujos de trabajo de agentes autonomos.
- Soporte de agentes y razonamiento multi-paso: capacidades mejoradas para tareas agenteicas gracias al function calling y al contexto largo.
- Multilingue: mantiene soporte en mas de 140 idiomas.
- Contexto largo: ventana de 256K tokens que permite procesar documentos extensos o conversaciones prolongadas.
- Modo de razonamiento configurable: permite activar o desactivar el modo "thinking" segun las necesidades del despliegue.

## Casos de uso

- **Atencion al cliente multilingue**: con su contexto de 256K tokens y soporte de 140 idiomas, puede gestionar conversaciones multi-turno prolongadas y analizar historiales completos de interacciones, manteniendo coherencia en idiomas distintos.
- **Generacion de codigo en produccion**: gracias al function calling nativo y a sus capacidades de razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar y depurar codigo, invocando herramientas externas como linters o ejecutores de tests.
- **Analisis de documentos con imagenes**: al procesar texto e imagenes simultaneamente, puede extraer informacion de PDFs escaneados, capturas de pantalla o diagramas tecnicos, siendo util en entornos legales o de investigacion.
- **Agentes autonomos para automatizacion**: su soporte de tool calling y razonamiento multi-paso permite construir agentes que navegan por APIs, ejecutan consultas y toman decisiones basadas en resultados intermedios.
- **Razonamiento matematico y cientifico**: su capacidad de razonamiento avanzado lo hace adecuado para resolver problemas matematicos complejos, generar demostraciones y explicar conceptos cientificos con pasos detallados.
- **Traduccion y localizacion**: con soporte de mas de 140 idiomas, puede utilizarse en servicios de traduccion automatica de alta calidad, especialmente en contextos largos donde el contexto global es importante.
- **Resumen de documentos legales o tecnicos**: la ventana de 256K permite procesar contratos o informes extensos completos y generar resumenes precisos, algo imposible para modelos con contexto mas corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este finetune concreto. La model card de Google para la familia Gemma 4 menciona mejoras en benchmarks de codificacion y razonamiento, pero no se incluyen numeros especificos. Para una evaluacion rigurosa, se recomienda consultar el technical report de Gemma 4 (arxiv:2607.02770) o ejecutar evaluaciones propias con datasets como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: con 25.8B parametros totales, en FP16 se requieren aproximadamente 51.6 GB de VRAM. Con cuantizacion a 8 bits, se reduce a unos 25.8 GB, y a 4 bits a unos 12.9 GB. No obstante, al ser MoE, la memoria activa por token es mucho menor, lo que permite inferencia eficiente en GPUs con menos VRAM si se usa cuantizacion.
- **GPU recomendadas**: para inferencia sin cuantizar, se recomienda una A100 (80GB) o H100 (80GB). Con cuantizacion 4-bit, puede ejecutarse en una RTX 4090 (24GB) o RTX 3090 (24GB).
- **Cabe en consumer GPU**: si, con cuantizacion a 4 bits es viable en GPUs de 24GB, aunque se recomienda verificar la compatibilidad con la libreria de despliegue elegida.
- **Opciones de despliegue**: el modelo es compatible con vLLM, llama.cpp, Ollama y TGI (Text Generation Inference). Para uso multimodal, se necesita una libreria que soporte vision encoders, como transformers con la integracion de `image-text-to-text`.
- **Latencia y throughput**: no se dispone de datos especificos para este finetune. En general, los modelos MoE con 4B activos ofrecen un throughput considerablemente superior a los modelos densos de tamano similar, con latencias que dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Modo de entrada |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT | 25.8B | 3.8B | 256K | Apache 2.0 | Texto, imagen |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | Texto |
| DeepSeek-V2-Lite | 15.7B | 2.4B | 128K | MIT | Texto |
| Llama 3.1 8B Instruct | 8B | 8B | 128K | Llama 3.1 license | Texto |

El Gemma 4 26B A4B destaca por su combinacion de contexto largo (256K) y multimodalidad, algo que sus competidores directos no ofrecen en el mismo rango de parametros. Mixtral es mas antiguo y con contexto menor, DeepSeek-V3-Lite tiene menos parametros activos pero solo texto, y Llama 3.1 8B es un modelo denso con menor capacidad. No se dispone de datos de rendimiento comparativos para este finetune especifico.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo entrenado con datos de internet, puede presentar sesgos sociales, culturales o de genero. No se han publicado evaluaciones especificas de sesgo para este finetune.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos de alta incertidumbre o con informacion no presente en el prompt.
- **Limitaciones de contexto**: aunque la ventana es de 256K tokens, el rendimiento puede degradarse en los extremos del contexto, y la memoria requerida crece linealmente con la longitud de la secuencia.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es necesario cumplir con los terminos de uso de Google para Gemma 4, que pueden incluir clausulas adicionales sobre uso responsable.
- **Caveats de produccion**: al ser un finetune de la comunidad (DandinPower), no hay garantias de mantenimiento ni soporte. Se recomienda validar el modelo en tu caso de uso antes de desplegarlo en produccion.
- **Multimodalidad**: aunque procesa imagenes, el modelo no soporta audio ni video, a diferencia de otros miembros de la familia Gemma 4 como el 12B.

## Enlaces

- [Hugging Face - DandinPower/gemma-4-26B-A4B-it](https://huggingface.co/DandinPower/gemma-4-26B-A4B-it)
- [Hugging Face - google/gemma-4-26B-A4B-it (modelo base)](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Hugging Face - google/gemma-4-26B-A4B (modelo base no instructivo)](https://huggingface.co/google/gemma-4-26B-A4B)
- [Technical Report - arxiv 2607.02770](https://arxiv.org/abs/2607.02770)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentacion de Gemma 4 en Google AI](https://ai.google.dev/gemma/docs/core)
- [Pagina de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Modelo en models.dev (pricing y proveedores)](https://models.dev/models/google/gemma-4-26b-a4b-it/)
