# aman2321/Inkling-2-Mini-Opus-Short-Thinking-GGUF

## Resumen

Inkling-2-Mini-Opus-Short-Thinking-GGUF es una cuantización y fusión de pesos en formato GGUF del modelo base Inkling 2 Mini, desarrollado por Thinking Machines Lab. La variante la publica el usuario aman2321 y combina la línea "uncensored" de la comunidad (AtomicChat/unsloth) con pesos de razonamiento corto de origen Opus, con el objetivo de corregir uno de los problemas más reportados del modelo original: las bucles de razonamiento que podían consumir más de 20.000 tokens antes de ejecutar una sola acción.

El modelo es un Mixture-of-Experts con arquitectura de capas medias en bucle (`inkling2_loop`, las capas centrales se ejecutan 3 veces por token), 26.070.385.152 parámetros totales y aproximadamente 3.400 millones de parámetros activos. El resultado de la fusión es un modelo que razona de forma densa y breve (decenas a cientos de tokens de pensamiento en lugar de miles) manteniendo capacidad de razonamiento en tareas reales.

Es relevante ahora porque ataca dos frentes prácticos: el coste de inferencia derivado del razonamiento excesivo y la viabilidad de desplegar un MoE de 26B en hardware de consumo (8 GB de VRAM con cuantización IQ4_NL y KV en fp8). El archivo pesa unos 14,25 GB y soporta contexto probado hasta 200.000 tokens, además de visión mediante un proyector `mmproj-F16.gguf` separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con capas medias en bucle (`inkling2_loop`, 3 pasadas por token en las capas centrales) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | ~3,4 B |
| Longitud de contexto | Probado hasta 200.000 tokens |
| Tipos de cuantizacion | IQ4_NL mixta (6 de 704 tensores en Q5_1 por incompatibilidad de dimensiones); proyector de visión `mmproj-F16.gguf` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 15,3 GB; archivo principal ~14,25 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) y una innovación estructural concreta: las capas medias se ejecutan en bucle tres veces por token (`inkling2_loop`). Esto obliga a motores de inferencia que soporten dicha arquitectura, como PolyStrata `strata-poly`, builds recientes de llama.cpp con soporte de Inkling 2 loop o la imagen de vLLM para Inkling. Con 26,07 B de parámetros totales y ~3,4 B activos, el coste computacional por token se acerca al de un modelo de 3-4 B, mientras que la capacidad efectiva se aproxima a la de un 26B.

El proceso de creación de esta variante no es un entrenamiento nuevo, sino una fusión en espacio de pesos: los tensores de razonamiento corto de origen Opus se aplican sobre la base "uncensored" en IQ4_NL, preservando formas y metadatos (0 desajustes de forma sobre 704 tensores) y recuantizando después con `merge-lora-gguf.py`. No se documentan datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información disponible, ya que se trata de un derivado del modelo base de Thinking Machines Lab. La validación de calidad se hizo mediante ejecuciones prácticas (generación de SVG/HTML/código, construcción de ficheros), no con una suite formal de benchmarks.

## Capacidades

- Generación de texto conversacional y de razonamiento con modo "short-thinking": saludos de ~78 tokens de pensamiento medidos, tareas reales típicamente de 100 a 800 tokens de razonamiento antes de actuar.
- Generación de código y artefactos: SVG, HTML y construcción de ficheros, según la validación práctica del autor.
- Visión: soportada mediante el proyector separado `mmproj-F16.gguf` (repo de unsloth), modalidades texto + imagen.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low` 0.2, `high` 0.9, `none`), que escala el presupuesto de pensamiento sin ser un tope estricto.
- Decodificación especulativa compatible con el drafter DSpark (`dspark-Inkling-2-Mini-Q8_0.gguf`, ~0,4-0,5 GB) al compartir hash de vocabulario, con ~50 % de aciertos de aceptación donde cabe en VRAM.
- Contexto largo: probado hasta 200K tokens, útil para agentes y conversaciones multi-turno extensas.
- Variante "uncensored": sin los filtros de rechazo de la versión estándar, orientada a usos sin moderación incorporada.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.

## Casos de uso

- Agentes autónomos con tool calling: el razonamiento corto (100-800 tokens) reduce la latencia y el coste por paso frente al modelo original, que podía gastar más de 20.000 tokens antes de invocar una herramienta; conviene acompañarlo de un tope `reasoning_budget_tokens` (~8.192) y de un guardián de detección de bucles.
- Asistente de programación en local: con ~3,4 B activos y cuantización IQ4_NL, cabe en una GPU de consumo de 8 GB y genera código y artefactos HTML/SVG, lo que permite integrarlo en un IDE o pipeline de CI/CD sin depender de la nube.
- Atención al cliente automatizada multi-turno: el contexto de 200K tokens permite mantener historiales largos y documentos de referencia en la misma ventana, con respuestas rápidas gracias al razonamiento breve.
- Procesamiento de documentos con imagen: mediante `mmproj-F16.gguf` puede describir o extraer información de capturas, diagramas y páginas escaneadas combinando visión y contexto largo.
- Despliegue en hardware modesto: medido en una RTX 5050 de 8 GB con Ryzen 5 5500 y 32 GB de RAM, con ~1.068 expertos calientes residentes en VRAM y KV en fp8; adecuado para prototipos y estaciones de trabajo sin GPU de datacenter.
- Generación de contenido sin moderación: al ser una build "uncensored", sirve para investigación sobre comportamiento de modelos, redacción creativa sin rechazos y evaluación de sesgos, siempre con las cautelas legales correspondientes.
- Razonamiento matemático y depuración profunda: con `reasoning_effort=high` (0.9) para problemas difíciles, aceptando mayor riesgo de bucle y usando el drafter DSpark para acelerar la decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que la calidad se validó con ejecuciones prácticas y no con una suite de referencia. Las únicas métricas publicadas son de rendimiento de inferencia en una sola máquina (RTX 5050 8 GB, Ryzen 5 5500, 32 GB, PolyStrata poly.6):

| Metrica | Valor medido |
|---|---|
| Decodificacion, contexto superficial | ~38-46 t/s |
| Decodificacion a 30-45K de contexto | ~29-34 t/s |
| Lectura de prompt con reutilizacion de cache | hasta ~590 t/s |
| Expertos calientes residentes en 8 GB VRAM | ~1.068 (con `--kv fp8`, contexto 200K) |
| Ganancia de decodificacion especulativa (DSpark) | ~50 % de aciertos de aceptacion donde cabe en VRAM |
| Tokens de pensamiento en saludos | ~78 (frente a 1.000+ del modelo original) |
| Tokens de pensamiento en tareas reales | tipicamente 100-800 |

## Requisitos de hardware

- VRAM estimada: el archivo IQ4_NL ocupa ~14,25 GB; con descarga parcial de expertos a RAM se ejecuta en 8 GB de VRAM (medido), aunque con menor throughput que en GPUs mayores.
- GPU recomendadas: RTX 5050 8 GB (medido, mínimo práctico), RTX 4090 24 GB, A100 40/80 GB, H100 80 GB para contexto completo y mayor paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con offload de expertos a RAM del sistema; 16-24 GB permiten mantener más expertos residentes y evitar cuellos de botella.
- Opciones de despliegue: PolyStrata `strata-poly`, builds recientes de llama.cpp con soporte de Inkling 2 loop, imagen de vLLM para Inkling; el proyector de visión requiere `mmproj-F16.gguf` y la decodificación especulativa requiere el drafter DSpark.
- Latencia y throughput: ~38-46 t/s en contexto superficial y ~29-34 t/s a 30-45K de profundidad; lectura de prompt hasta ~590 t/s con caché reutilizada. Son medidas de una sola máquina, no cifras de proveedor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Opus-Short-Thinking-GGUF | 26,07 B totales / ~3,4 B activos | 200K probado | Apache-2.0 | GGUF en HF | Fusion con razonamiento corto, uncensored, vision con proyector |
| Inkling 2 Mini (stock, `thinkingmachines/Inkling-2-Mini`) | 26,07 B totales / ~3,4 B activos | No disponible | Apache-2.0 | Pesos originales en HF | Razonamiento por defecto en `high` (0.9), bucles frecuentes de 20.000+ tokens |
| Inkling-2-Mini-Uncensored-IQ4_NL (AtomicChat/unsloth) | 26,07 B totales / ~3,4 B activos | No disponible | Apache-2.0 | GGUF en HF | Base de esta fusion, sin razonamiento corto incorporado |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo entre estas variantes; la diferencia documentada es de comportamiento (tokens de pensamiento y frecuencia de bucles) y de cuantización, no de precisión medida.

## Limitaciones y advertencias

- Es una fusión de pesos, no un modelo afinado: la calidad se validó con tareas prácticas y no con una suite formal; conviene comparar contra el modelo original antes de usarlo en trabajo crítico.
- La cuantización no es sin pérdida: 6 de 704 tensores se recuantizaron a Q5_1 por incompatibilidad de dimensiones, por lo que no hay paridad bit a bit con la base IQ4_NL.
- Los bucles de razonamiento están reducidos, no eliminados: se recomienda mantener la detección de bucles del motor y un tope `reasoning_budget_tokens` (~8.192) en cargas agénticas.
- `reasoning_effort=none` no desactiva el pensamiento y se midió más lento que `low`; el ajuste recomendado para uso diario es `low` (0.2).
- La build "uncensored" elimina filtros de rechazo: riesgo de generar contenido inapropiado, sesgado o dañino, y necesidad de moderación externa en producción.
- Riesgo de alucinación inherente a modelos de lenguaje; sin benchmarks publicados no hay medida de su tasa de error en dominios concretos.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado en esta variante.
- Requiere motores con soporte específico de la arquitectura `inkling2_loop`; no funciona en implementaciones GGUF genéricas sin dicha característica.
- La licencia Apache-2.0 permite uso comercial, pero el carácter "uncensored" y la procedencia de los pesos de razonamiento Opus deben revisarse por motivos de cumplimiento antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aman2321/Inkling-2-Mini-Opus-Short-Thinking-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorios de la comunidad mencionados en la model card: AtomicChat y unsloth (lineajes de GGUF cuantizado, proyector `mmproj-F16.gguf` y drafter DSpark `dspark-Inkling-2-Mini-Q8_0.gguf`); no se proporcionan URL directas en la información disponible.
- Motor de inferencia PolyStrata/Strata (`strata-poly`): no se proporciona URL en la información disponible.
