# 1bit-MONSTER/ZAYA1-base-GGUF

## Resumen

ZAYA1-base-GGUF es una conversión al formato GGUF del modelo ZAYA1-base, desarrollado originalmente por Zyphra, publicada por el usuario 1bit-MONSTER. Se trata de un modelo base (no ajustado por instrucciones) de arquitectura MoE (mixture of experts) con aproximadamente 8.840 millones de parámetros totales, 40 capas y 16 expertos, y una ventana de contexto de 32.768 tokens con rope theta de 1e6. El repositorio contiene un único archivo cuantizado en Q4_K_M, lo que reduce el peso a unos 5,6 GB y permite ejecutarlo en hardware de gama de consumo con soporte Vulkan.

La relevancia de esta ficha no está en el modelo en sí, sino en el trabajo de conversión: el checkpoint original de Zyphra usa un layout estilo Megatron que transformers no puede cargar. El conversor de 1bit-MONSTER remapea ese layout al formato estándar de ZAYA y escribe los pesos de la convolución agrupada en orden "tap-major", que es lo que espera el grafo de cómputo. Según el autor, convertir `Zyphra/ZAYA1-8B-legacy` por esta vía produce tensores byte a byte idénticos a los de `Zyphra/ZAYA1-8B`.

El resultado es un artefacto pensado para el motor de inferencia propio del autor (1bit engine) y para un fork de llama.cpp con la rama `1bit/hrx-vulkan-patched`. El llama.cpp upstream no soporta la arquitectura ZAYA, por lo que estos GGUF no son intercambiables con el ecosistema estándar salvo que se use ese fork. La licencia Apache 2.0 se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con convolucion agrupada; 40 capas, 16 expertos |
| Parametros totales | 8.840.233.464 (~8,84B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | Zyphra/ZAYA1-base |
| Tamano del repositorio | 5,6 GB |
| Rope theta | 1e6 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE) de 40 capas y 16 expertos, con una ventana de contexto nativa de 32.768 tokens y rope theta de 1e6. El detalle técnico relevante para la conversión es la presencia de una convolución agrupada cuyos pesos deben escribirse en orden "tap-major" para que el grafo de inferencia los interprete correctamente; este es precisamente el punto donde falla una conversión GGUF convencional y donde el conversor del autor aplica un tratamiento específico.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Se trata de un modelo base, lo que implica que no ha pasado por un post-entrenamiento conversacional: el autor lo señala explícitamente al comparar la perplejidad de texto bruto frente al modelo post-entrenado ZAYA1-8B, indicando que los modelos base suelen favorecerse en esa métrica. El checkpoint original proviene de un layout estilo Megatron que transformers no puede cargar directamente; la conversión remapea dicho layout al formato estándar de ZAYA.

## Capacidades

- Generación de texto autoregresiva sin ajuste por instrucciones (modelo base).
- Razonamiento de texto bruto y continuación de contexto extenso gracias a los 32.768 tokens de ventana.
- Capacidad multilingüe: no disponible (no se documentan idiomas soportados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponible.
- Ejecución en GPU vía Vulkan a través del motor 1bit engine o del fork de llama.cpp del autor.

## Casos de uso

- Evaluación de perplejidad y estudios de cuantización: el modelo incluye una validación explícita sobre Wikitext-2 (60 fragmentos de 512 tokens) que da una referencia de 8,53 ± 0,17 para Q4_K_M, útil como punto de comparación en experimentos de compresión.
- Investigación sobre arquitecturas MoE con convolución agrupada: al estar publicado el conversor y el fork de llama.cpp, sirve como banco de pruebas para estudiar cómo se comporta este tipo de capas en inferencia.
- Generación de texto sin alineación: para tareas de continuación de documentos técnicos, corpus largos o generación de datos sintéticos donde no se necesita un asistente conversacional.
- Base para fine-tuning posterior: al ser un modelo base con licencia Apache 2.0, se puede usar como punto de partida para ajustes específicos de dominio antes de cuantizar.
- Despliegue en hardware de gama de consumo con Vulkan: el archivo Q4_K_M de ~5,6 GB se ejecuta en una iGPU Radeon 8060S, lo que lo hace apto para pruebas locales en equipos sin GPU dedicada.
- Validación de pipelines de conversión GGUF: el repositorio documenta el remapeo de layout Megatron a ZAYA y el orden tap-major, lo que lo convierte en un caso de referencia para quien necesite replicar el proceso con otros checkpoints.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| Wikitext-2 test perplexity (60 fragmentos de 512 tokens) | Q4_K_M, Vulkan, Radeon 8060S | 8,53 ± 0,17 |
| Wikitext-2 test perplexity (misma prueba) | ZAYA1-8B post-entrenado | 32,13 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB solo para los pesos en Q4_K_M, más el cache KV correspondiente a la ventana de contexto utilizada (el valor exacto depende de la configuración de inferencia, no disponible).
- GPU recomendadas: Radeon 8060S (iGPU, memoria unificada) validada por el autor; en general, cualquier GPU con soporte Vulkan y al menos 8 GB de memoria disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con soporte Vulkan; también en iGPU con memoria unificada configurable.
- Opciones de despliegue: 1bit engine (`1bit serve -m ZAYA1-base-Q4_K_M.gguf --device vulkan`) y el fork de llama.cpp en la rama `1bit/hrx-vulkan-patched`. El llama.cpp upstream no incluye soporte para el modelo ZAYA.
- Latencia y throughput estimados: no disponible (no se publican métricas de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| 1bit-MONSTER/ZAYA1-base-GGUF | ~8,84B (MoE, 16 expertos) | 32.768 | GGUF, apache-2.0 | Cuantizado Q4_K_M; requiere el motor propio o el fork de llama.cpp |
| Zyphra/ZAYA1-base | no disponible (misma base) | 32.768 | safetensors (layout Megatron), apache-2.0 | Checkpoint original; no cargable directamente en transformers |
| Zyphra/ZAYA1-8B | no disponible | no disponible | apache-2.0 | Version post-entrenada; perplejidad de 32,13 en la misma prueba Wikitext-2 |

No se dispone de datos suficientes para comparar con alternativas MoE de tamano similar de otros proveedores.

## Limitaciones y advertencias

- Modelo base sin post-entrenamiento: no sigue instrucciones ni mantiene formatos conversacionales de forma fiable.
- Riesgo de alucinacion elevado en tareas de respuesta factual, al no haber pasado por RLHF ni DPO.
- Sesgos conocidos: no disponible (no se documenta ninguna evaluacion de sesgo).
- Idiomas soportados: no disponible; no se puede asumir cobertura multilingue sin datos.
- Dependencia de tooling no estandar: los GGUF exigen el motor de 1bit-MONSTER o su fork de llama.cpp; upstream no soporta la arquitectura ZAYA, y una conversion distinta a la del autor puede producir pesos mal ordenados en la convolucion agrupada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de cualquier derivado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validacion independiente mas alla de la perplejidad reportada por el propio autor.
- No se han publicado datos de idiomas, parametros activos ni benchmarks estandar, lo que dificulta estimar su comportamiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/ZAYA1-base-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Zyphra/ZAYA1-base
- Pull request del conversor en el fork de llama.cpp: https://github.com/1bit-MONSTER/llama.cpp/pull/14
- Repositorio del motor de inferencia: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp (rama `1bit/hrx-vulkan-patched`): https://github.com/1bit-MONSTER/llama.cpp
