# Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B es un ajuste fino (fine-tune) orientado a razonamiento sobre Qwen3.5-4B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en su modo "Max Effect". Lo desarrolla Jackrong, autor tambien de una version de 9B con el mismo pipeline de entrenamiento. El modelo resuelve el problema de llevar la receta de destilacion de un teacher grande a una clase de despliegue compacta de 4B parametros, con foco explicito en matematicas y disciplinas STEM.

La variante publicada en este repositorio es la version GGUF con soporte MTP (Multi-Token Prediction), que incluye cuantizaciones IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0, ademas de un fichero `mmproj-F32.gguf` para runtimes multimodales compatibles. El checkpoint completo en safetensors esta en un repositorio separado del mismo autor.

Con 4.326.350.848 parametros reales y licencia Apache 2.0, el modelo se posiciona como una opcion ligera para tareas de razonamiento estructurado en ingles y chino, con un enfasis claro en la descomposicion explicita de problemas paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-4B), con soporte MTP (Multi-Token Prediction) en la variante GGUF |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF); checkpoint completo en safetensors |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en el repo del checkpoint completo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4B parametros, y se ajusta mediante SFT sobre un dataset de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. Las respuestas de entrenamiento provienen de DeepSeek-V4-Pro en modo "Max Effect", lo que constituye una destilacion de comportamiento: el modelo pequeno aprende patrones de solucion multi-paso y descomposicion explicita de problemas a partir de las trazas del teacher grande. El autor indica que se sigue el mismo pipeline y mezcla de datos que en la version de 9B.

La variante GGUF incorpora soporte MTP (Multi-Token Prediction), una tecnica de decodificacion que predice varios tokens por paso para mejorar el throughput en runtimes compatibles. El repositorio incluye ademas `mmproj-F32.gguf`, lo que sugiere compatibilidad con runtimes multimodales, aunque la model card no detalla que modalidades cubre el proyector. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la cifra de muestras y su orientacion STEM.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento matematico con descomposicion explicita de problemas paso a paso.
- Razonamiento cientifico en disciplinas STEM (fisica, quimica, matematicas).
- Razonamiento multi-paso estructurado, aprendido por destilacion del teacher.
- Soporte de decodificacion MTP en la variante GGUF para acelerar la generacion.
- Compatibilidad con runtimes multimodales a traves de `mmproj-F32.gguf` (modalidades concretas no detalladas).
- Integracion con text-generation-inference y transformers segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo esta entrenado sobre unas 250.000 muestras de matematicas y STEM con trazas de descomposicion, por lo que es adecuado para generar soluciones paso a paso en tutores automaticos o generadores de ejercicios resueltos.
- Asistencia en fisica y quimica a nivel universitario: la evaluacion del autor cubre MMLU-Pro Physics y Chemistry, lo que indica un ajuste especifico para preguntas conceptuales y calculos en estas disciplinas.
- Despliegue en hardware de consumo: con 4B parametros y cuantizaciones desde IQ4_XS hasta Q8_0, el modelo cabe en GPUs de gama media y permite prototipado local sin infraestructura dedicada.
- Generacion aumentada por recuperacion (RAG) sobre documentacion tecnica en ingles o chino: el modelo puede integrarse en pipelines de TGI o transformers para responder consultas con contexto recuperado, aunque la longitud de contexto no esta documentada.
- Evaluacion y benchmarking de destilacion: al ser una reproduccion declarada del pipeline de la version 9B, sirve como referencia para estudiar como escala la destilacion de un teacher grande a clases de 4B frente a 9B.
- Inferencia de baja latencia con MTP: en runtimes que soportan Multi-Token Prediction, la variante GGUF permite acelerar la decodificacion en servicios de generacion de texto con requisitos de throughput moderados.
- Procesamiento multimodal en runtimes compatibles: el fichero `mmproj-F32.gguf` habilita el uso del modelo en stacks multimodales, aunque las modalidades concretas no estan documentadas en la model card.

## Benchmarks y rendimiento

La model card indica que el modelo fue evaluado en ejecuciones completas de GSM8K y en muestras fijas de MMLU-Pro Math, Physics y Chemistry, pero no se publican los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en IQ4_XS, 3-3,5 GB en Q4_K_M, 4-4,5 GB en Q5_K_M, 5-5,5 GB en Q6_K y 6,5-7 GB en Q8_0 (estimaciones para 4,3B parametros; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizaciones Q4 a Q8; las cuantizaciones IQ4_XS y Q4_K_S permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes GGUF con soporte MTP; text-generation-inference y transformers para el checkpoint completo en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B | 4,33B | no disponible | Razonamiento matematico y STEM por destilacion | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo base generalista | no disponible en la informacion proporcionada | Hugging Face (unsloth/Qwen3.5-4B) |
| DeepSeek-V4-Pro-Qwen3.5-9B | no disponible | no disponible | Misma receta de destilacion en clase 9B | no disponible en la informacion proporcionada | Hugging Face (repo del autor) |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre datos generados por un teacher, puede heredar sesgos de este.
- Riesgo de alucinacion: presente como en cualquier modelo de 4B; el foco en razonamiento estructurado no elimina errores en cadenas de deduccion largas.
- Limitaciones de idioma: solo se declaran ingles y chino; el rendimiento en castellano no esta evaluado ni garantizado.
- Longitud de contexto: no documentada, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos de destilacion.
- Caveat de produccion: los benchmarks mencionados (GSM8K, MMLU-Pro) no publican cifras, por lo que la calidad real debe validarse con evaluaciones propias antes de desplegar.
- El soporte multimodal via `mmproj-F32.gguf` no esta documentado en cuanto a modalidades ni calidad; tratarlo como experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF
- Checkpoint completo: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
