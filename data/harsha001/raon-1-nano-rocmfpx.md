# Harsha001/Raon-1-nano-ROCmFPX

## Resumen

Raon-1-nano-ROCmFPX es una cuantización GGUF de 8 bits del modelo Raon-1 nano desarrollado por KRAFTON AI, un modelo de lenguaje pequeño (3.185.653.961 parámetros totales) orientado a conversación, seguimiento de instrucciones y tool calling en coreano e inglés. La particularidad de esta versión no es el modelo en sí, sino el formato de cuantización: emplea el tipo de 8 bits de ROCmFPX, un fork de llama.cpp orientado a hardware AMD (ROCm y Vulkan, con mención explícita a Strix Halo), lo que la hace incompatible con llama.cpp estándar y con la rama oficial de KRAFTON.

El modelo base emplea una arquitectura con una tabla de embeddings por capa de aproximadamente 1.500 millones de parámetros, lo que explica que un modelo de 3,1B parámetros mantenga una huella de pesos de solo 3,45 GB en Q8. Incluye además una cabeza de predicción multi-token (MTP) de una capa, aunque el autor no la ha evaluado.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeño bilingüe coreano-inglés con soporte de tool calling; por otro, ilustra una técnica de cuantización híbrida que mezcla pesos en formato estándar Q8_0 con pesos ROCmFPX 8-bit seleccionados por menor error. El resultado, según el autor, iguala la calidad del Q8_0 estándar (KL de 0,000341 frente a 0,000344) con 4 MB menos de tamaño, una mejora marginal pero medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); incluye cabeza de predicción multi-token (MTP) de una capa |
| Parametros totales | 3.185.653.961 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de ejecución del autor con `-c 32768`) |
| Tipos de cuantizacion | GGUF Q8_0 híbrido con 23 pesos en ROCmFPX 8-bit; el autor publica además comparativas de Q6_K, Q4_K_M y ROCmFPX 4-bit (FP4) y 6-bit, pero solo distribuye el archivo de 8 bits |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Raon-1-nano-Q8_0-ROCmFPX-mix.gguf`, 3,45 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Se sabe que es un transformer de 3.185.653.961 parámetros, de los cuales aproximadamente 1.500 millones corresponden a una tabla de embeddings por capa, un diseño poco habitual que concentra una fracción importante del cómputo y la memoria en la proyección de entrada. El modelo incluye una cabeza de predicción multi-token (MTP) de una capa, una técnica de decodificación especulativa que permite proponer varios tokens por paso; el autor de la cuantización indica que no la ha probado.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El pipeline declarado es text-generation y la model card del modelo base lo describe como un modelo para conversación, seguimiento de instrucciones y tool calling, lo que sugiere un ajuste posterior supervisado orientado a diálogo. La innovación técnica destacable de esta ficha concreta es el método de cuantización: se comparó cada peso del Q8_0 estándar con su versión ROCmFPX 8-bit y se conservó la variante con menor error, lo que afectó a 23 pesos (la proyección de salida de atención en 16 capas y la proyección down del feed-forward en 7 capas).

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Seguimiento de instrucciones de formato y tareas directas.
- Tool calling / function calling, según la descripción del modelo base.
- Razonamiento aritmético básico: el autor verificó en CPU con decodificación greedy que responde correctamente a 17 × 23 = 391.
- Conocimiento factual elemental: identificó Canberra como capital de Australia y respondió correctamente en coreano a una pregunta sobre la capital de Corea del Sur.
- Generación de código sencillo: escribió una función de Fibonacci iterativa correcta en Python.
- Predicción multi-token (MTP) mediante cabeza dedicada, incluida en el archivo pero no validada por el autor.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes conversacionales bilingües coreano-inglés: el modelo está entrenado para conversación en ambos idiomas y su ventana de 32.768 tokens permite mantener diálogos multi-turno con historial extenso sin truncar el contexto.
- Integración en pipelines de tool calling: al estar orientado a function calling, puede conectarse a APIs externas (consultas a bases de datos, servicios meteorológicos, calendarios) en aplicaciones de automatización, con la salvedad de que requiere el fork ROCmFPX para cargarse.
- Prototipado en hardware AMD: es una opción para desarrolladores que trabajan sobre GPUs AMD con ROCm o Vulkan (por ejemplo, Strix Halo) y quieren validar un modelo pequeño de 3,1B sin depender de CUDA; el autor advierte que aún no se ha probado en hardware AMD real.
- Generación de código asistida en entornos con recursos limitados: el modelo produce funciones sencillas correctas y su tamaño de 3,45 GB permite ejecutarlo en equipos de gama media, útil para autocompletado o generación de scripts en herramientas internas.
- Evaluación de técnicas de cuantización: el archivo sirve como referencia práctica para comparar KL-divergence y coincidencia de token top entre Q8_0 estándar, ROCmFPX 8-bit y cuantizaciones de menor precisión, gracias a las métricas publicadas por el autor.
- Educación y respuestas factuales básicas: con conocimiento elemental verificado (capitales, aritmética), puede emplearse en asistentes de estudio o FAQs siempre que se controle la alucinación mediante recuperación de contexto.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica métricas de fidelidad de cuantización medidas con `llama-perplexity --kl-divergence` de llama.cpp contra un GGUF F16 convertido desde los pesos de KRAFTON, sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés, tras expandir cada archivo a F16:

| Archivo | Tamano | KL a F16 | Mismo token top que F16 |
|---|---:|---:|---:|
| `Raon-1-nano-Q8_0-ROCmFPX-mix.gguf` | 3,45 GB | 0,000341 | 98,90% |
| Q8_0 estándar | 3,45 GB | 0,000344 | 98,95% |
| ROCmFPX 8-bit en todos los pesos principales | 3,42 GB | 0,000363 | 98,84% |
| Q6_K estándar | 2,70 GB | 0,0034 | 96,2% |
| ROCmFPX 6-bit | 2,70 GB | 0,0037 | 95,8% |
| Q4_K_M estándar | 2,13 GB | 0,0197 | 91,7% |
| ROCmFPX 4-bit (FP4) | 2,14 GB | 0,0221 | 91,2% |

Perplejidad: F16 19,20; archivo publicado 19,22. El margen de error de la medición es de aproximadamente ±0,000004 en KL, por lo que la diferencia frente al Q8_0 estándar es estadísticamente despreciable. El texto de evaluación es inglés, de modo que estas cifras no dicen nada directo sobre coreano ni sobre tool calling.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 3,45 GB; con overhead de contexto (32.768 tokens) y KV cache conviene reservar entre 5 y 7 GB según el backend y el tamaño de lote.
- GPU recomendadas: el formato está pensado para GPUs AMD con ROCm o Vulkan (el autor menciona Strix Halo). No se han publicado pruebas en hardware AMD, y el autor pide a la comunidad que reporte velocidad y calidad.
- GPU NVIDIA: no aplica directamente, porque el archivo requiere el fork ROCmFPX de llama.cpp; para CUDA conviene usar los GGUF oficiales de KRAFTON.
- GPU de consumo: por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM, pero la compatibilidad depende del soporte del fork ROCmFPX en el hardware concreto.
- Despliegue: `llama-server` del fork ROCmFPX (rama `raon-1-nano`), con el comando `llama-server -m Raon-1-nano-Q8_0-ROCmFPX-mix.gguf -ngl 99 -c 32768 --jinja`. No es compatible con llama.cpp estándar ni con la rama de llama.cpp de KRAFTON.
- Latencia y throughput: no disponibles; el autor no ha medido rendimiento en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Raon-1-nano-ROCmFPX (esta ficha) | 3,19B | 32.768 | Apache-2.0 | GGUF en HF, requiere fork ROCmFPX | Cuantización híbrida Q8_0/ROCmFPX |
| KRAFTON/Raon-1-nano (base) | 3,19B | 32.768 (según ejemplo del autor) | Apache-2.0 | Pesos originales en HF | Modelo de referencia, sin cuantizar |
| KRAFTON/Raon-1-nano-gguf (Q8_0 oficial) | 3,19B | 32.768 (según ejemplo del autor) | Apache-2.0 | GGUF en HF | Calidad equivalente según el autor; compatible con llama.cpp estándar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Raon-1 nano frente a otros modelos pequeños de la misma categoría (por ejemplo, Qwen, Llama o Gemma en el rango de 3B), por lo que esa comparación se indica como no disponible.

## Limitaciones y advertencias

- El archivo requiere el fork ROCmFPX de llama.cpp (rama `raon-1-nano`); no carga en llama.cpp estándar ni en la rama de KRAFTON, lo que limita su portabilidad.
- No ha sido probado en hardware AMD por el autor, que pide a la comunidad que reporte velocidad y calidad; el rendimiento real es desconocido.
- No es una versión oficial de KRAFTON; el crédito del modelo corresponde a KRAFTON AI.
- La cabeza MTP incluida en el archivo no ha sido validada.
- Las métricas de cuantización se midieron solo en inglés (wikitext-2), por lo que no evalúan coreano ni tool calling.
- Riesgo de alucinación inherente a un modelo de 3,1B parámetros; las comprobaciones del autor son anecdóticas (una multiplicación, una capital, una función de Fibonacci) y no constituyen una evaluación sistemática.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en castellano no está documentado.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; sin embargo, la dependencia del fork ROCmFPX debe verificarse en cuanto a su propia licencia y mantenimiento antes de llevarlo a producción.
- La mejora frente al Q8_0 estándar es marginal (4 MB menos, diferencia de KL dentro del error de medición), por lo que no hay motivo técnico para elegir esta variante salvo que se opere en el ecosistema ROCmFPX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Raon-1-nano-ROCmFPX
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- GGUF oficiales de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Fork ROCmFPX (rama `raon-1-nano`): https://github.com/HarshaVardhan3002/ROCmFPX/tree/raon-1-nano
