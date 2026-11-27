# sancheztimothy/hw1-generation

## Resumen

`sancheztimothy/hw1-generation` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de un transformer de escala "nano" orientado a tareas de generación de texto. Lo desarrolla el usuario sancheztimothy y se enmarca en lo que la propia model card describe como un ejercicio académico o de aprendizaje (el identificador "hw1" sugiere una primera práctica de un curso). No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de código con un checkpoint de inicialización válido para pruebas de humo.

El modelo cuenta con 24.832 parámetros totales según los pesos en formato safetensors, lo que lo sitúa en un orden de magnitud varias veces inferior al de cualquier modelo de lenguaje utilizable en producción. La arquitectura emplea atención multi-query, fusión mediante concatenación y MLP, activación GELU y normalización LayerNorm. El repositorio incluye además `config.json` con los ajustes de arquitectura, `training_args.json` con la receta de entrenamiento por defecto (optimizador Adafactor con schedule polinómico) y `model.py` como artefacto principal.

Su relevancia actual es exclusivamente didáctica: sirve como punto de partida reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, tal y como indica el autor. No debe confundirse con un modelo listo para inferencia real, ya que el checkpoint incluido no ha sido entrenado ni auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención multi-query, fusión concat MLP) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización), PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "nano" con atención multi-query (MQA), mecanismo que comparte las proyecciones de clave y valor entre cabezas para reducir el coste de memoria del KV cache. La fusión de la información se realiza mediante concatenación seguida de un MLP, con activación GELU y normalización LayerNorm. El autor describe el diseño como intencionadamente manejable para poder inspeccionar cambios arquitectónicos antes de ejecutar un entrenamiento completo.

No se ha completado ningún entrenamiento: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo y no un checkpoint entrenado con benchmarks. La receta por defecto usa el optimizador Adafactor con un schedule polinómico, valores de partida del script y no evidencia de una ejecución finalizada. No se especifican número de tokens, composición del dataset, ni fases de RLHF/DPO.

## Capacidades

- Generación de texto: el código define un pipeline de generación, pero al no haber sido entrenado no produce salidas lingüísticamente significativas.
- Inspección de arquitectura: permite experimentar con variantes de MQA, fusión y normalización en un entorno de bajo coste computacional.
- Pruebas de humo: valida que el flujo de carga de pesos, configuración y forward pass funciona antes de escalar.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües verificadas.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- Docencia y aprendizaje: sirve como base para que estudiantes de un curso de IA implementen y comparen variantes de atención (MQA frente a MHA) sobre un código legible y de tamaño reducido.
- Prototipado de arquitecturas: permite validar cambios en la fusión concat MLP o en la normalización antes de trasladarlos a un modelo de mayor escala, reduciendo el coste de iteración.
- Pruebas de integración de pipelines: útil para verificar que scripts de carga de safetensors, tokenizadores y bucles de generación funcionan de extremo a extremo en un entorno de CI.
- Reproducibilidad de recetas: el `training_args.json` incluido permite ensayar configuraciones de Adafactor y schedules polinómicos con un coste mínimo.
- Benchmarking de infraestructura: al tener 24.832 parámetros, es adecuado para medir latencia de arranque, carga de pesos y overhead de frameworks sin ruido de cómputo.
- Base para ejercicios de evaluación: la model card propone evaluar con un conjunto held-out específico de la tarea, al menos tres semillas y una línea base de capacidad equivalente, lo que lo convierte en un caso práctico de metodología experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en safetensors ocupan unos pocos kilobytes (24.832 parámetros en precisión estándar).
- GPU recomendadas: cualquier GPU consumer moderna sirve; también es viable en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: el autor indica que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sancheztimothy/hw1-generation | 24.832 | no disponible | No (solo inicialización) | apache-2.0 | Hugging Face |
| Modelos "nano" tipo GPT-2 small | ~124 M | 1.024 tokens | Sí | MIT / varias | Hugging Face |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Sí | apache-2.0 | Hugging Face |
| SmolLM-135M | ~135 M | 2.048 tokens | Sí | apache-2.0 | Hugging Face |

La comparación debe interpretarse con cautela: los tres modelos alternativos están entrenados y publicados con evaluaciones, mientras que `hw1-generation` es un esqueleto de código sin entrenamiento. La comparación relevante es de propósito (experimentación didáctica) más que de rendimiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce texto coherente ni resultados utilizables en producción.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se han documentado sesgos conocidos, pero al no haber datos de entrenamiento tampoco pueden evaluarse.
- Riesgo de alucinación no aplicable en la práctica porque el modelo no genera contenido semántico.
- No se especifican idiomas soportados ni longitud de contexto; cualquier uso multilingüe carece de garantías.
- La licencia apache-2.0 permite uso comercial del código, pero el autor advierte de que deben revisarse por separado los términos de las fuentes de datos si se usa con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto incluidos en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/sancheztimothy/hw1-generation
