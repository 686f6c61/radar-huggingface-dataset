# manjunathshiva/Qwen3.8-27B-tq3-mini-g64

## Resumen

El modelo `manjunathshiva/Qwen3.8-27B-tq3-mini-g64` es una cuantización **3-bit** del modelo multimodal Qwen3.8-27B de Qwen, realizada mediante la herramienta TurboQuant-MLX. Su objetivo principal es reducir el tamaño del modelo original (55,6 GB en bf16) hasta aproximadamente 11,55 GiB en disco, permitiendo su ejecución en equipos Apple Silicon con 16 GB de memoria unificada. El autor, manjunathshiva, ha verificado el funcionamiento en un Mac mini M4 de 16 GB real, no solo mediante proyecciones teóricas.

El modelo base Qwen3.8-27B es un modelo denso de 27.800 millones de parámetros con una arquitectura híbrida de atención: 64 capas de decodificador, de las cuales 48 usan Gated DeltaNet (atención lineal) y 16 usan atención completa. Incluye además un codificador visual de 27 bloques, lo que le confiere capacidades multimodales (imagen-texto). Esta cuantización 3-bit es una opción para quienes necesitan ejecutar un modelo de este tamaño en hardware limitado, aunque a costa de un aumento de perplejidad del 10,4% respecto a la versión 4-bit y una velocidad de decodificación modesta (3,7 tokens/s en el mini M4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (48 Gated DeltaNet + 16 atención completa), codificador visual de 27 bloques |
| Parametros totales | 27.800 millones (modelo base); los safetensors reportan 3.405.929.776, dato inconsistente con el tamaño del modelo base |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (modelo base); 8.192 tokens práctico en 16 GB según pruebas del autor |
| Tipos de cuantizacion | 3-bit TurboQuant (grupo g64), formato MLX |
| Idiomas soportados | No disponible (heredado de Qwen3.8, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa. De las 64 capas del decodificador, 48 son Gated DeltaNet (eficientes en memoria y cómputo) y 16 son de atención completa, lo que reduce el coste del KV cache. El vocabulario tiene 248.320 tokens y el modelo incorpora un codificador visual de 27 bloques para entrada de imágenes.

Esta versión cuantizada no ha sido entrenada ni ajustada: es una cuantización **data-free** (sin datos de calibración) realizada con TurboQuant-MLX. El proceso reduce los pesos de bf16 a 3 bits con un grupo de cuantización de 64 (g64), logrando una reducción de 4,8× en el tamaño en disco. No se aplicó RLHF ni DPO adicional; se preservan las capacidades del modelo original, aunque con una pérdida de calidad medida en +10,4% de perplejidad respecto a la cuantización 4-bit del mismo modelo.

## Capacidades

- **Multimodal imagen-texto**: acepta entradas de imagen y texto, generando descripciones, respuestas a preguntas visuales y análisis de imágenes (verificado con 4/4 en una batería de pruebas de visión).
- **Generación de texto**: completado y generación de texto libre en múltiples idiomas (heredado del modelo base).
- **Razonamiento**: capacidad de razonamiento multi-step, aunque la velocidad limita su uso interactivo.
- **Tool calling y función calling**: soportado por el modelo base Qwen3.8-27B; la cuantización no elimina esta capacidad.
- **Uso agéntico**: el autor verificó que el bucle agéntico de Opencode (observar → leer → editar → verificar) funciona correctamente desde 24 GB de RAM, pero **no** en 16 GB (0 de 4 intentos).
- **Procesamiento de contexto largo**: el modelo base soporta hasta 256K tokens, pero en esta cuantización y con 16 GB el contexto práctico se reduce a unos 8K tokens.

## Casos de uso

- **Resumen por lotes de documentos**: con una velocidad de prefill de 19-21 tok/s y decodificación de 3,7 tok/s, es adecuado para procesar documentos largos en segundo plano, donde la latencia no es crítica. El usuario puede enviar un prompt de 5.000 tokens y esperar unos cuatro minutos de prefill antes de obtener la respuesta.
- **Preguntas y respuestas sobre documentos**: ideal para consultas puntuales sobre un corpus extenso, siempre que se pueda esperar la decodificación lenta. La ventana de 8K tokens permite manejar documentos de tamaño medio sin necesidad de chunking.
- **Análisis de imágenes con presupuesto de tamaño**: el modelo procesa imágenes, pero requiere ajustar el tamaño de la imagen para no exceder la memoria disponible. Puede usarse para descripciones de imágenes, extracción de texto (OCR) o respuesta a preguntas visuales en entornos sin GPU dedicada.
- **Prototipado y experimentación en Apple Silicon**: para desarrolladores que trabajan en Mac con 16 GB y necesitan probar un modelo multimodal de 27B sin acceso a GPUs de servidor, esta cuantización permite experimentar con las capacidades del modelo base a costa de velocidad.
- **Generación de código en entornos no interactivos**: aunque la velocidad de decodificación es baja, puede utilizarse para generar fragmentos de código o documentación en pipelines de CI/CD donde la latencia no sea un factor limitante.
- **Investigación en cuantización extrema**: sirve como caso de estudio para evaluar el impacto de cuantización 3-bit en modelos híbridos con atención lineal, comparando calidad y rendimiento frente a versiones de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona datos cualitativos y de rendimiento:

| Prueba | Resultado |
|---|---|
| Perplejidad vs versión 4-bit | +10,4% (mayor perplejidad) |
| Batería de visión | 4/4 correcto (con presupuesto de tamaño de imagen) |
| Bucle agéntico Opencode (24 GB+) | 4/4 correcto |
| Bucle agéntico Opencode (16 GB) | 0/4 (no completa) |
| Prefill (16 GB M4 mini) | 19-21 tok/s |
| Decodificación (16 GB M4 mini) | 3,6-3,9 tok/s |
| Prefill (64 GB M4 Max) | ~81 tok/s |
| Decodificación (64 GB M4 Max) | ~12,8 tok/s |

## Requisitos de hardware

- **VRAM / memoria unificada**: pesos de 12,40 GB; pico medido de 13,61 GiB con un prompt de 5.017 tokens en un Mac mini M4 de 16 GB. Se requiere elevar el límite de Metal (`sudo sysctl -w iogpu.wired_limit_mb=14336`).
- **GPU recomendadas**: Apple Silicon con al menos 16 GB de memoria unificada (verificado en M4 mini y M4 Max). En máquinas con 24 GB o más el modelo también funciona en modo agéntico.
- **Ajustes necesarios**: usar `--prefill-step-size 256` para reducir el espacio de trabajo de prefill de 3,30 GB a 0,10 GB.
- **Opciones de despliegue**: MLX (librería principal), TurboQuant-MLX (repositorio del autor). No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información disponible.
- **Latencia y throughput**: en el mini M4, un prompt de 5.000 tokens tarda ~4 minutos en prefill; una respuesta de 200 tokens tarda ~1 minuto en decodificación. En el M4 Max, la decodificación alcanza ~12,8 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Velocidad decode (16 GB) |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | 256K | bf16 | Apache 2.0 | No ejecutable en 16 GB |
| Qwen3.8-27B-tq4-g64 | 27,8B | 256K (práctico ~8K) | 4-bit TurboQuant | Apache 2.0 | No especificado (recomendado si hay >16 GB) |
| Qwen3.8-27B-tq3-mini-g64 | 27,8B | 256K (práctico ~8K) | 3-bit TurboQuant | Apache 2.0 | 3,7 tok/s |

La versión 3-bit es la única que cabe en 16 GB, pero sacrifica un 10,4% de perplejidad y no es usable de forma agéntica. La versión 4-bit es preferible si se dispone de más memoria. No se dispone de comparación con otros modelos 3-bit de la misma familia.

## Limitaciones y advertencias

- **Velocidad de decodificación muy baja** en 16 GB (3,7 tok/s): no apto para chat interactivo ni para agentes en tiempo real.
- **No funciona en modo agéntico en 16 GB**: el bucle de Opencode falla sistemáticamente (0 de 4 intentos). Se requiere al menos 24 GB para uso agéntico.
- **Aumento de perplejidad del 10,4%** respecto a la versión 4-bit, lo que puede degradar la calidad de las respuestas en tareas complejas.
- **Requiere configuración manual del sistema**: elevar el límite de Metal (`iogpu.wired_limit_mb`) y usar `--prefill-step-size 256`; sin estos ajustes el modelo no cabe o falla.
- **Contexto práctico limitado a ~8K tokens** en 16 GB, muy por debajo de los 256K del modelo base.
- **Primera carga lenta**: el primer arranque tras el reinicio puede fallar por la carga de páginas; se recomienda reintentar.
- **Riesgo de alucinación y sesgos**: no se han evaluado específicamente en esta cuantización; se heredan los riesgos del modelo base Qwen3.8-27B.
- **Licencia Apache 2.0** permite uso comercial, pero el modelo cuantizado depende de la herramienta TurboQuant-MLX (también open source).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/manjunathshiva/Qwen3.8-27B-tq3-mini-g64)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio TurboQuant-MLX](https://github.com/manjunathshiva/turboquant-mlx)
- [Versión 4-bit del mismo modelo](https://huggingface.co/manjunathshiva/Qwen3.8-27B-tq4-g64)
- [Documentación de Qwen3.8 en Unsloth](https://unsloth.ai/docs/models/qwen3.8)
- [Guía de Qwen3.8-27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
- [Análisis de Qwen3.8-27B en Yottalabs](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
