# Anbeeld/DeepSeek-V4-Flash-DSpark-GGUF

## Resumen

DeepSeek-V4-Flash-DSpark es un modelo borrador (draft model) diseñado para la decodificación especulativa de DeepSeek-V4-Flash, un modelo MoE de gran tamaño publicado por DeepSeek AI. La versión GGUF publicada por Anbeeld es una cuantización de los pesos del borrador, optimizada para su uso con BeeLlama.cpp, un fork de llama.cpp con funciones avanzadas de cuantización. El modelo tiene 19.845.850.983 parámetros y un peso de 10.9 GB; los expertos enrutados se almacenan de forma nativa en formato MXFP4, por lo que no se ofrecen cuantizaciones adicionales más allá de un GGUF de precisión completa.

La relevancia del modelo radica en su función: permite acelerar la generación de texto de DeepSeek-V4-Flash, que admite una ventana de contexto de un millón de tokens. Al proponer tokens candidatos que el modelo principal verifica de forma paralela, el borrador reduce la latencia de decodificación, lo que resulta crítico en aplicaciones con secuencias largas o elevado volumen de peticiones. No se trata de un modelo de chat independiente, sino de un componente de aceleración dentro de un sistema de inferencia especulativa.

Según la documentación, DeepSeek-V4-Flash-DSpark no es un modelo nuevo, sino el mismo checkpoint con un módulo adicional de decodificación especulativa. No se ha publicado información sobre sus parámetros activos, idiomas soportados ni benchmarks específicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (compressed sparse attention y heavily compressed attention) con módulo de decodificación especulativa |
| Parametros totales | 19.845.850.983 |
| Parametros activos | no disponible (el modelo principal DeepSeek-V4-Flash tiene 13B activados) |
| Longitud de contexto | no disponible (el modelo principal DeepSeek-V4-Flash soporta 1M tokens) |
| Tipos de cuantizacion | GGUF de precisión completa; expertos enrutados en MXFP4 nativo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-DSpark es un modelo derivado del checkpoint de DeepSeek-V4-Flash, al que se le añade un módulo de decodificación especulativa. La arquitectura de la serie V4 combina atención híbrida con Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), lo que reduce drásticamente los FLOPs de inferencia y el tamaño de la caché KV en contextos largos. Además, incorpora Manifold-Constrained Hyper-Connections (mHC) para estabilizar la propagación de señales y se entrena con el optimizador Muon.

El preentrenamiento de la familia V4 se realizó sobre más de 32 billones de tokens de alta calidad. El postentrenamiento sigue dos fases: primero se entrenan expertos de dominio de forma independiente mediante SFT y RL con GRPO; después se consolidan en un único modelo mediante destilación on-policy. No se ha publicado información específica sobre el entrenamiento del módulo borrador DSpark, más allá de que los expertos enrutados se conservan en MXFP4 nativo.

## Capacidades

- Decodificación especulativa: actúa como modelo borrador para predecir secuencias de tokens que DeepSeek-V4-Flash valida en paralelo, reduciendo el número de pasos de decodificación.
- Compatibilidad con BeeLlama.cpp, un fork de llama.cpp con soporte para cuantización MXFP4 y decodificación especulativa.
- No es un modelo para uso directo como asistente de chat: su función es la de acelerar la inferencia del modelo principal.
- No se han documentado capacidades de razonamiento, generación de código, tool calling, agentes o multimodalidad para este modelo borrador.
- Soporta serialización GGUF, lo que permite su carga en runtime de CPU y GPU mediante llama.cpp y sus derivados.

## Casos de uso

- Despliegue de inferencia de baja latencia: Integrar DeepSeek-V4-Flash-DSpark junto a DeepSeek-V4-Flash en BeeLlama.cpp permite disminuir el tiempo por token en servicios de chat en tiempo real, especialmente cuando se mantienen ventanas de conversación extensas.
- Procesamiento de documentos largos: Al acelerar la decodificación de un modelo con contexto de 1M tokens, es viable realizar análisis de contratos, informes o bases de conocimiento completas en una sola pasada sin que la espera sea prohibitiva.
- Sistemas de agentes autónomos: Los flujos de razonamiento multi-paso que requieren decenas de miles de tokens se benefician de un mayor throughput, acortando los ciclos de razonamiento y ejecución de herramientas.
- Herramientas de asistencia al desarrollo: En autocompletado de código o reviews de repositorios extensos, la decodificación especulativa permite iteraciones más rápidas sobre el contenido del proyecto.
- Bots de atención al cliente multilingüe: Con un contexto largo, el modelo principal puede manejar historiales completos de soporte, y el borrador acelera la generación de respuestas, mejorando la experiencia de usuario.
- Pipelines de generación sintética: En la creación de datasets para destilación o fine-tuning, el uso de decodificación especulativa reduce el coste y el tiempo necesarios para generar grandes volúmenes de texto con DeepSeek-V4-Flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el draft model solo: alrededor de 11-12 GB para cargar los 10.9 GB del GGUF en la GPU.
- GPU recomendada para el draft model: una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes para ejecutar el borrador en aislamiento.
- Para el uso real de decodificación especulativa se necesita además el modelo principal DeepSeek-V4-Flash, que requiere mucho más VRAM (el modelo con 284B parámetros no puede ejecutarse en una sola GPU de consumidor; se necesitan nodos multi-GPU).
- Opciones de despliegue: BeeLlama.cpp (fork de llama.cpp con soporte para estos pesos), llama.cpp, y potencialmente Ollama o vLLM si se integran los pesos del borrador.
- Latencia y throughput estimados: no disponibles. El rendimiento específico depende del modelo principal, del hardware y de la tasa de aceptación de la especulación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos borradores de decodificación especulativa con información comparable en los datos proporcionados. El modelo DeepSeek-V4-Flash-DSpark es complementario a DeepSeek-V4-Flash (284B parámetros) y no se puede comparar directamente con modelos de propósito general.

## Limitaciones y advertencias

- No es un modelo generativo independiente: usar DeepSeek-V4-Flash-DSpark sin un modelo principal no produce respuestas de calidad; su función es únicamente la de proponer tokens en la decodificación especulativa.
- Requiere BeeLlama.cpp para aprovechar la cuantización MXFP4 de los expertos enrutados; otras implementaciones de llama.cpp pueden no soportar este formato.
- El modelo no incluye cuantizaciones alternativas Q4, Q5, Q8, etc., lo que limita la posibilidad de reducir huella de memoria para equipos pequeños.
- No se han publicado datos sobre sesgos, alucinaciones o límites de idioma para este checkpoint.
- La licencia MIT permite uso comercial, pero es conveniente revisar la documentación original de DeepSeek AI para confirmar que no existan restricciones adicionales en el modelo base.
- En producción, el beneficio de la decodificación especulativa depende de la tasa de aceptación del draft; un borrador mal calibrado puede no aportar ventajas e incluso degradar el rendimiento.

## Enlaces

- HuggingFace del modelo GGUF: https://huggingface.co/Anbeeld/DeepSeek-V4-Flash-DSpark-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Modelo principal DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Paper técnico de DeepSeek-V4: https://arxiv.org/abs/2606.19348
- Repositorio de BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Repositorio DeepSpec (decodificación especulativa): https://github.com/deepseek-ai/DeepSpec
- Página web de DeepSeek AI: https://www.deepseek.com/
