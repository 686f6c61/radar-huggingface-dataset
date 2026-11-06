# OraXDev/bagent-pro

## Resumen

bagent-pro es un modelo de lenguaje publicado en Hugging Face por el usuario OraXDev bajo el identificador `OraXDev/bagent-pro`. Se distribuye en formato safetensors y emplea la arquitectura Qwen2, según los tags del repositorio, con un total de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones). El repositorio ocupa 3,1 GB y está etiquetado para los idiomas inglés y español.

El modelo se publica bajo la licencia CDLA-Permissive-1.0, una licencia de datos abiertos que permite uso comercial con escasas restricciones, lo que lo hace potencialmente atractivo para integraciones en producto. Sin embargo, el acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos.

La información pública disponible es muy limitada. No se especifican detalles sobre el dataset de entrenamiento, el contexto máximo, el pipeline de la tarea ni resultados de benchmarks. El número de descargas (6) y de likes (0) en el momento de la consulta indica que se trata de una publicación reciente y con escasa adopción, por lo que cualquier evaluación de producción debe hacerse con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según tag del repositorio) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | CDLA-Permissive-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen2` del repositorio indica que el modelo sigue la arquitectura de la familia Qwen2: un transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU, habitual en la serie Qwen2 de Alibaba. El recuento exacto de parámetros (1.543.714.304) se ha verificado a partir de los pesos en safetensors, lo que confirma un tamaño cercano a 1,5 B, coherente con variantes compactas de la familia.

No se dispone de información sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos en inglés y español), ni sobre si se aplicaron fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas. Todos estos datos deben considerarse no disponibles a partir de la información pública del repositorio.

## Capacidades

- Generación de texto autoregresiva en inglés y español, según los idiomas declarados en el repositorio.
- Razonamiento y respuesta a instrucciones: capacidad esperable en un modelo ajustado de la familia Qwen2, aunque no documentada explícitamente.
- Generación de código y matemáticas: no documentada en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio solo declara pesos de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales ligeros en español: el modelo declara soporte de español y un tamaño de ~1,5 B, adecuado para despliegues con recursos moderados en tareas de chat de dominio general, previa validación de calidad.
- Clasificación y etiquetado de texto: por su tamaño compacto puede ejecutarse en GPU de gama media para tareas de clasificación por prompting o fine-tuning ligero.
- Generación de borradores y resúmenes: útil en pipelines de preprocesado de documentos donde se prioriza el coste por token frente a la calidad máxima.
- Prototipado rápido de aplicaciones LLM: al ser un modelo pequeño con pesos safetensors, permite iterar en entornos de desarrollo con una sola GPU consumer.
- Fine-tuning específico de dominio: con 1,5 B de parámetros, el ajuste completo o mediante LoRA es viable en hardware asequible para adaptar el modelo a vocabularios sectoriales.
- Traducción inglés-español asistida: los dos idiomas declarados permiten explorar tareas de traducción o parafraseo entre ambos, siempre con evaluación humana.
- Componente en sistemas RAG: puede actuar como generador final en arquitecturas de recuperación aumentada con contexto moderado, aunque la longitud de contexto no está documentada y debe medirse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos (1,54 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 4090); para serving concurrente, A10G, L4 o A100.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: al ser arquitectura Qwen2 y pesos safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y transformers de Hugging Face.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| bagent-pro (OraXDev) | ~1,54 B | no disponible | en, es | CDLA-Permissive-1.0 | gated |
| Qwen2-1.5B (Alibaba) | ~1,54 B | 32.768 tokens (según documentación pública de Qwen2) | multilingüe | Apache 2.0 | abierto |
| Qwen2.5-1.5B (Alibaba) | ~1,54 B | 32.768 tokens (según documentación pública de Qwen2.5) | multilingüe | Apache 2.0 | abierto |
| SmolLM2-1.7B (Hugging Face) | ~1,7 B | 8.192 tokens (según documentación pública) | en (principalmente) | Apache 2.0 | abierto |

La comparativa se limita a datos públicos de los modelos alternativos; para bagent-pro no se dispone de contexto, benchmarks ni documentación de entrenamiento, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan dataset, contexto, proceso de alineación ni benchmarks, lo que impide evaluar su calidad frente a alternativas establecidas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Riesgo de alucinación: inherente a los modelos de ~1,5 B; la tasa de errores factuales será previsiblemente mayor que en modelos de mayor tamaño.
- Idiomas limitados: solo se declaran inglés y español; el rendimiento en otros idiomas no está garantizado.
- Contexto desconocido: al no documentarse la longitud de contexto, deben realizarse pruebas empíricas antes de usarlo en tareas con prompts largos.
- Licencia CDLA-Permissive-1.0: permite uso comercial, pero conviene revisar las condiciones exactas del acuerdo gated y la procedencia de los datos de entrenamiento, no documentada.
- Adopción mínima: con 6 descargas y 0 likes, no existe comunidad ni soporte; la responsabilidad de validación recae íntegramente en el usuario.
- Sin garantías de producción: al no haber documentación de evaluación, no se recomienda su uso en sistemas críticos sin una batería propia de pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/OraXDev/bagent-pro
