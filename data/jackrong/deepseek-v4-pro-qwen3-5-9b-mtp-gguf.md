# Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino (fine-tune) de Qwen3.5-9B desarrollado por Jackrong, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El modelo se centra en razonamiento matemático y STEM, conservando la eficiencia y facilidad de despliegue de la clase de 9B parámetros. Es relevante porque ofrece capacidades de razonamiento estructurado de un modelo profesor grande en un tamaño que cabe en hardware de consumo, con licencia Apache 2.0.

El modelo tiene 9.197.093.888 parámetros totales y se distribuye en formato GGUF, lo que facilita su ejecución con llama.cpp y Ollama. Incluye soporte para MTP (Multi-Token Prediction) y ha sido evaluado con rutas de despliegue vLLM NVFP4 y llama.cpp MTP-Q8_0. El repositorio ocupa 48.9 GB e incluye cuantizaciones para diferentes presupuestos de VRAM.

La relevancia actual radica en la tendencia de destilar modelos de razonamiento grandes (DeepSeek-V4-Pro) en modelos compactos que pueden ejecutarse localmente, manteniendo capacidades de descomposición de problemas y solución multi-paso. El modelo soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y está etiquetado para tool-use y function-calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B), con soporte MTP |
| Parámetros totales | 9.197.093.888 (9,2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (incluye Q8_0 con MTP); NVFP4 evaluado en vLLM |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo principal); safetensors disponible en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B, un modelo denso de 9,2B parámetros. Sobre esta base, Jackrong aplicó un proceso de destilación (distillation) utilizando respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect" como señal de supervisión. El entrenamiento se centró en aproximadamente 250.000 muestras de matemáticas y STEM, con técnicas de SFT (Supervised Fine-Tuning) y RL (Reinforcement Learning) mediante GSPO (Group Sequence Policy Optimization), según las etiquetas del modelo.

Una innovación destacable es la inclusión de MTP (Multi-Token Prediction), que permite predecir varios tokens por paso de decodificación, mejorando el throughput en inferencia. El modelo ha sido evaluado con rutas de despliegue específicas: vLLM con cuantización NVFP4 y llama.cpp con MTP-Q8_0. A pesar de no incluir datos de SFT específicos de código, el autor reporta pequeñas ganancias en programación y uso de herramientas por transferencia entre dominios.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas multi-paso.
- Razonamiento matemático y resolución de problemas STEM (ciencia, tecnología, ingeniería y matemáticas).
- Soporte de tool calling / function calling (etiquetado explícitamente).
- Capacidades de agentes y razonamiento multi-paso.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Transferencia cross-domain: pequeñas mejoras en programación y uso de herramientas sin SFT específico de código.
- Modo de razonamiento (reasoning) destilado del profesor DeepSeek-V4-Pro.
- Compatible con endpoints (tag `endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Resolución de problemas matemáticos y STEM en entornos educativos: el modelo puede descomponer problemas complejos en pasos intermedios y generar soluciones razonadas, adecuado para tutores automáticos o generación de material didáctico.
- Asistencia en investigación científica: ayuda a estructurar razonamientos sobre problemas de física, química o biología, aprovechando la destilación de un profesor entrenado en STEM.
- Automatización de pipelines de análisis técnico: integración mediante tool calling para consultar calculadoras, bases de datos o APIs externas en flujos de trabajo científicos.
- Agentes multi-paso para tareas de razonamiento: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas, útil en orquestación de agentes con frameworks compatibles con OpenAI endpoints.
- Despliegue local en estaciones de trabajo: al ser un modelo de 9,2B en GGUF, puede ejecutarse en GPUs de consumo para prototipado y pruebas de razonamiento sin depender de la nube.
- Generación de código asistida por razonamiento: aunque no fue entrenado específicamente en código, la transferencia cross-domain permite su uso en tareas de programación que requieren descomposición lógica, integrable en pipelines de CI/CD mediante tool calling.
- Atención al cliente técnica multilingüe: con soporte para seis idiomas y contexto conversacional, puede gestionar consultas técnicas multi-turno en español, inglés, chino, coreano, japonés y ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 9,2B parámetros en GGUF Q8_0 requiere aproximadamente 9-10 GB de VRAM; en Q4_K_M, alrededor de 5-6 GB.
- GPU recomendadas: NVIDIA A100, H100 para despliegue en producción con vLLM (NVFP4 evaluado); RTX 4090, RTX 3090 para inferencia local en Q8_0.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q8_0 y en GPUs de 8 GB con cuantizaciones Q4.
- Opciones de despliegue: llama.cpp (MTP-Q8_0 evaluado), vLLM (NVFP4 evaluado), Ollama (formato GGUF), text-generation-inference (tag incluido).
- Latencia y throughput estimados: no disponibles; el soporte MTP está diseñado para mejorar el throughput en decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | 9,2B | no disponible | Apache 2.0 | GGUF | Destilado de DeepSeek-V4-Pro, foco STEM/matemáticas |
| Qwen3.5-9B (base) | 9,2B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo base sin destilación de razonamiento |
| Alternativas de 7-9B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser destilado de un profesor, puede heredar sesgos de DeepSeek-V4-Pro.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el foco en matemáticas y STEM no elimina errores en razonamientos largos.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el soporte multilingüe se limita a los seis idiomas listados (en, zh, ko, ja, es, ru).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B y del profesor DeepSeek-V4-Pro.
- Caveat para producción: el modelo no fue entrenado con SFT específico de código; las ganancias en programación son por transferencia y pueden ser limitadas.
- El repositorio ocupa 48,9 GB, lo que requiere espacio de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Perfil del colaborador (hardware): https://x.com/KyleHessling1
