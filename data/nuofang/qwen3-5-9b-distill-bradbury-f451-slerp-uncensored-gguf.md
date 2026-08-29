# nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored`, un fine-tuning de Qwen 3.5 9B orientado a escritura creativa sin filtros de seguridad. El autor, nuofang, ha generado automáticamente los archivos GGUF para su uso con llama.cpp, incluyendo calibración imatrix específica para novelas chinas y role-playing, preservando a su vez lógica y sentido común.

El modelo base combina destilación de DeepSeek sobre Qwen 3.5 9B con un proceso SLERP entre variantes, una de ellas inspirada en la novela "Fahrenheit 451" de Ray Bradbury. La versión "uncensored" elimina los mecanismos de rechazo de contenido, lo que la hace adecuada para narrativa adulta, diálogos explícitos o experimentación creativa sin restricciones. Su relevancia actual radica en la demanda de modelos locales de escritura sin censura que puedan ejecutarse en hardware de consumo.

El repositorio GGUF incluye cuantizaciones con imatrix, y el autor advierte que las métricas de perplejidad pueden verse afectadas por diferencias en el tratamiento de tokens especiales entre herramientas de cuantización y evaluación. El modelo base tiene 9B parámetros, aunque el dato de parámetros totales del repo (1.278.200) corresponde a los tensores safetensors del repositorio, no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen 3.5 9B) |
| Parametros totales | 9B (modelo base); 1.278.200 (tensores safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q5_K_M; otros no especificados) |
| Idiomas soportados | no disponible (calibracion imatrix orientada a chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen 3.5 9B, arquitectura Transformer con atención completa. El proceso de creación combina destilación de DeepSeek sobre Qwen (proyecto `deepseek-distill-qwen`) con interpolación SLERP entre dos variantes: una orientada a escritura creativa inspirada en Bradbury y otra "uncensored". El resultado se ha cuantizado a GGUF con calibración imatrix, usando un dataset de calibración compuesto por novelas chinas y diálogos de role-playing, con el objetivo de mantener la coherencia lógica y el sentido común durante la generación.

El autor reporta una evaluación de perplejidad sobre el dataset de calibración: el modelo base en F16/BF16 obtiene PPL = 14.1462 ± 0.11497, mientras que la cuantización Q5_K_M obtiene PPL = 12.0146 ± 0.09496. El autor advierte que esta mejora aparente puede deberse a diferencias en el manejo de tokens especiales entre las herramientas de cuantización y las de cálculo de perplejidad, no a una mejora real del modelo.

## Capacidades

- Generación de texto creativo sin filtros de seguridad, incluyendo narrativa adulta, diálogos explícitos y contenido controvertido.
- Escritura de novelas y relatos con estilo literario, inspirado en la prosa de Ray Bradbury.
- Role-playing conversacional, especialmente en chino, gracias a la calibración imatrix orientada a ese idioma.
- Preservación de lógica y sentido común durante la generación, según la calibración del dataset.
- Inferencia local eficiente mediante cuantización GGUF compatible con llama.cpp.
- Capacidades multilingües no confirmadas; la calibración está orientada al chino, pero el modelo base Qwen 3.5 9B soporta múltiples idiomas.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Escritura de novelas y relatos sin restricciones: el modelo puede generar narrativa adulta, violencia explícita o temas tabú sin rechazar solicitudes, gracias a su naturaleza uncensored. Es adecuado para autores que necesitan explorar territorios creativos que los modelos comerciales bloquean.
- Role-playing conversacional en chino: la calibración imatrix está optimizada para diálogos de rol, lo que permite mantener personajes coherentes y respuestas contextuales en sesiones largas.
- Generación de diálogos para guiones o juegos: puede producir conversaciones naturales entre personajes, incluyendo registros coloquiales o formales según el contexto.
- Experimentación con estilos literarios: al estar inspirado en Bradbury, puede emular prosa descriptiva y atmosférica, útil para escritores que buscan variación estilística.
- Prototipado de aplicaciones de escritura asistida: desarrolladores pueden integrarlo en herramientas de generación de texto local sin depender de APIs externas ni filtros de contenido.
- Investigación sobre modelos sin censura: permite estudiar el comportamiento de modelos que no rechazan contenido, comparando su producción con alternativas alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato reportado es la perplejidad sobre el dataset de calibración:

| Metrica | Valor |
|---|---|
| PPL base (F16/BF16) | 14.1462 ± 0.11497 |
| PPL Q5_K_M | 12.0146 ± 0.09496 |

El autor advierte que la mejora de perplejidad tras cuantizar puede ser un artefacto del tratamiento de tokens especiales, no una mejora real.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q5_K_M, un modelo de 9B parámetros requiere aproximadamente 6-7 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 3060 12GB, RTX 4070 o superiores.
- GPU recomendadas: RTX 3060 12GB como mínimo; RTX 4090 o A100 para mayor velocidad y contexto largo.
- Compatible con GPUs de consumo: sí, con cuantizaciones GGUF de 4-5 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; dependerá de la GPU y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored (GGUF) | 9B | no disponible | no disponible | HuggingFace |
| Qwen 3.5 9B (base) | 9B | no disponible | no disponible | HuggingFace, Ollama |
| Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic | 9B | no disponible | no disponible | FriendliAI, HuggingFace |

No se dispone de datos comparativos de rendimiento entre estos modelos. La principal diferencia del modelo evaluado es su proceso SLERP y la calibración imatrix orientada a chino y role-playing.

## Limitaciones y advertencias

- Modelo uncensored: puede generar contenido ofensivo, ilegal o dañino sin restricciones. No es adecuado para aplicaciones comerciales sin supervisión humana.
- Sesgos no documentados: al ser un fine-tuning sin alineación, puede reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: no se han evaluado tasas de alucinación; la naturaleza creativa del modelo puede aumentar la producción de información falsa.
- Licencia no disponible: no se especifica la licencia del modelo base ni de las cuantizaciones, lo que impide determinar restricciones de uso comercial.
- Idioma principal de calibración: chino; el rendimiento en otros idiomas no está confirmado.
- Perplejidad engañosa: la mejora aparente tras cuantizar puede ser un artefacto técnico, no una mejora real del modelo.
- Sin garantías de producción: el autor no ofrece soporte ni garantías sobre el comportamiento del modelo en entornos de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored-GGUF
- Modelo base: https://huggingface.co/nuofang/Qwen3.5-9B-Distill-Bradbury-F451-SLERP-Uncensored
- Noticia sobre los fine-tunes uncensored: https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations
- Proyecto de destilación DeepSeek sobre Qwen: https://github.com/madaibaba/deepseek-distill-qwen
- Modelo similar en FriendliAI: https://friendli.ai/models/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Qwen 3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
