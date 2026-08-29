# 0xzknw/LFM2.5-8B-A1B-Heretic-NX-PRIME-GGUF

## Resumen

LFM2.5-8B-A1B-Heretic-NX-PRIME-GGUF es una edición conductual directa sobre el modelo base LiquidAI/LFM2.5-8B-A1B, publicada por el usuario 0xzknw en formato GGUF. El modelo original, desarrollado por Liquid AI, es un Mixture of Experts (MoE) híbrido de 8 mil millones de parámetros totales con solo 1.500 millones activos por paso, diseñado específicamente para inferencia en dispositivos de borde (edge AI) y despliegue local. Ofrece una ventana de contexto de 128.000 tokens, soporte de tool calling y razonamiento encadenado (chain of thought).

La variante Heretic NX PRIME modifica ocho tensores de salida (dos de atención y seis de convolución corta) en capas concretas del modelo cuantizado Q8_K_XL, con el objetivo explícito de reducir los rechazos falsos (false refusals) ante solicitudes potencialmente dañinas. Según la model card, los marcadores léxicos de rechazo pasan de 95 a 4 sobre 104 filas de evaluación, manteniendo una divergencia KL media de 0,016948 respecto al original. Esta edición no añade capacidades nuevas, sino que altera el comportamiento de rechazo, lo que implica un riesgo mayor de cumplimiento de peticiones inseguras.

El repositorio contiene un único archivo GGUF de 9,34 GB con cuantización Q8_K_XL, junto con un fichero JSON de procedencia y protocolos. El modelo está etiquetado para generación de texto y soporta diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano. La licencia es LFM Open License v1.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención + convoluciones cortas) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | 1.500.000.000 (1,5B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q8_K_XL (único archivo publicado) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un MoE híbrido que combina mecanismos de atención con capas de convolución corta, una arquitectura diseñada por Liquid AI para maximizar la eficiencia en dispositivos con recursos limitados. Con 8B parámetros totales y solo 1,5B activos por forward pass, logra un equilibrio entre calidad y velocidad. El entrenamiento original incluye datos multilingües y técnicas de alineación que no se detallan en la información disponible, pero se sabe que soporta tool calling y razonamiento encadenado.

La edición Heretic NX PRIME aplica una destilación con penalización benigna sobre el modelo ya cuantizado en Q8_0. El método consiste en ajustar factores de rango uno (rank-one right factors) derivados de 1.024 estados inofensivos y 2.627 estados de trayectoria de respuesta, fusionándolos directamente en ocho tensores de salida Q8_0 con lambda=100 y beta=2,25. Los sitios editados son dos salidas de atención y seis salidas de convolución corta en las capas 12, 14, 16, 17, 19, 21, 22 y 23. No se modifica ningún tensor del banco de expertos MoE. El proceso está documentado con hashes SHA-256 y scripts reproducibles en el repositorio GitHub del autor.

## Capacidades

- Generación de texto multilingüe en diez idiomas, con especial énfasis en inglés y árabe.
- Razonamiento encadenado (chain of thought) integrado en la plantilla de chat, que permite respuestas más elaboradas en tareas complejas.
- Soporte de tool calling y function calling, lo que lo hace apto para integraciones con APIs y agentes.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Reducción significativa de rechazos falsos: de 95 a 4 marcadores léxicos en 104 filas de evaluación, lo que facilita respuestas más directas en escenarios donde el modelo base tendería a negarse.
- Compatibilidad con runtimes que soporten la arquitectura `lfm2moe`, como llama.cpp y LM Studio.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de 128K tokens y su capacidad multilingüe, puede gestionar conversaciones largas con contexto completo, reduciendo interrupciones por rechazos innecesarios en consultas legítimas pero formuladas de forma ambigua.
- Generación de código en producción: con tool calling y razonamiento encadenado, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código, siempre que se valide la salida con pruebas automatizadas.
- Asistentes personales en dispositivos de borde: al ser un MoE con solo 1,5B activos, cabe en hardware modesto y puede ejecutarse localmente sin conexión, ofreciendo respuestas rápidas y privadas.
- Procesamiento de documentos extensos: la ventana de 128K permite resumir, extraer información o responder preguntas sobre manuales técnicos, contratos o informes de gran tamaño.
- Agentes autónomos con múltiples pasos: su soporte de tool calling y razonamiento encadenado lo hace adecuado para orquestar flujos de trabajo que requieren llamadas a APIs y toma de decisiones secuencial.
- Entornos de investigación en seguridad: el propio autor lo presenta como una herramienta para estudiar el equilibrio entre utilidad y rechazo, permitiendo analizar cómo pequeñas ediciones conductuales afectan al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de evaluación del edit conductual, que se resumen a continuación:

| Metrica | Original Q8 | Heretic NX Q8 |
| --- | ---: | ---: |
| Marcadores léxicos de rechazo (104 filas dañinas) | 95 | 4 |
| Filas con marcador (una-based) | — | 30, 60, 68, 97 |
| KL media del primer token (104 filas benignas, vocabulario 128K) | 0 | 0,016948 |
| KL mediana del primer token | 0 | 0,004140 |

Estos datos indican una reducción drástica de rechazos con una desviación mínima respecto al comportamiento original en entradas benignas. Sin embargo, el propio autor advierte que los marcadores léxicos son un proxy de rechazo, no una medida de éxito semántico, y que las 104 filas participaron en el desarrollo y selección, por lo que no constituyen un conjunto de validación independiente.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_K_XL ocupa 9,34 GB, por lo que se recomienda al menos 12 GB de VRAM para inferencia con contexto moderado. Con contexto completo de 128K, la memoria adicional puede superar los 16 GB.
- GPU recomendadas: tarjetas consumer con 16 GB o más, como RTX 4080, RTX 4090, o GPUs profesionales como A100 (40 GB) y H100. En GPUs con 8 GB (p. ej., RTX 3060) solo sería viable con contexto reducido y cuantizaciones más agresivas, que no se ofrecen en este repositorio.
- Despliegue: compatible con llama.cpp (usando `llama-server` con `-ngl 99`), LM Studio y cualquier runtime que soporte la arquitectura `lfm2moe`. No se menciona soporte nativo en vLLM o TGI para este formato GGUF específico.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño activo de 1,5B, se espera una velocidad de generación superior a la de un modelo denso de 8B, pero la cuantización Q8 y la edición de tensores pueden introducir ligeras variaciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (base) | 8,47B | 1,5B | 128K | LFM Open v1.0 | safetensors, GGUF |
| LFM2.5-8B-A1B-Heretic-NX-PRIME (este) | 8,47B | 1,5B | 128K | LFM Open v1.0 | GGUF (Q8_K_XL) |
| Qwen2.5-7B-A3B (MoE comparable) | 7,6B | 3B | 128K | Apache 2.0 | safetensors, GGUF |

La principal diferencia frente al modelo base es el comportamiento de rechazo: la variante Heretic NX reduce drásticamente los rechazos, pero no altera las capacidades subyacentes. Frente a Qwen2.5-7B-A3B, ambos son MoE con contexto 128K, pero Qwen tiene más parámetros activos (3B vs 1,5B) y una licencia más permisiva (Apache 2.0). No se dispone de benchmarks comparativos directos entre ambos.

## Limitaciones y advertencias

- La edición debilita intencionalmente el comportamiento de rechazo, lo que puede aumentar el cumplimiento de solicitudes inseguras, ilegales o incorrectas. No añade factualidad, juicio ni sandboxing.
- No se ha evaluado en una suite de capacidades independiente y reciente; el autor no lo presenta como un ganador universal ni equivalente al original en todas las tareas.
- Los marcadores léxicos de rechazo son solo un proxy; la reducción de rechazos no implica que las respuestas sean correctas o seguras.
- La licencia LFM Open License v1.0 puede imponer restricciones de uso comercial; se debe revisar el texto completo de la licencia antes de desplegar en producción.
- El repositorio solo incluye una cuantización Q8_K_XL; no hay opciones de cuantización más pequeñas para hardware limitado.
- Se requiere un runtime reciente con soporte `lfm2moe`; versiones antiguas de llama.cpp u otros motores pueden no cargar el modelo correctamente.
- El modelo base tiene sesgos potenciales derivados de sus datos de entrenamiento, que no se han mitigado en esta edición.

## Enlaces

- Repositorio HuggingFace del modelo editado: https://huggingface.co/0xzknw/LFM2.5-8B-A1B-Heretic-NX-PRIME-GGUF
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Versión GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Documentación técnica de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Repositorio GitHub del autor (heretic-nx): https://github.com/0xZKnw/heretic-nx
- Página en Ollama (modelo base, no la edición): https://ollama.com/pierreprudh/lfm2.5-8b-a1b
