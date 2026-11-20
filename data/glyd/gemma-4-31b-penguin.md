# glyd/gemma-4-31B-penguin

## Resumen

Gemma 4 31B · Glyd Penguin es una distribución comprimida sin pérdida de los pesos de google/gemma-4-31B-it, publicada por el usuario glyd y empaquetada en el formato propietario del motor Glyd. El modelo base es un transformer denso de Google DeepMind con 41.157.200.887 parámetros reales según los safetensors del repositorio, y esta variante mantiene cada peso decodificable bit a bit al valor bf16 original: no es una cuantización, no hay redondeo. El objetivo es reducir la huella de memoria de 57,2 GiB (bf16) a 38,4 GiB en GPU, lo que permite ejecutar el modelo en una única tarjeta de 48 GB, algo imposible con los pesos originales.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión sin pérdida aplicada a un modelo grande (unos 10,8 bits por peso almacenado, decodificación en GPU durante la inferencia). Por otro, advierte de una restricción crítica: los ficheros solo funcionan con el motor Glyd (versión 0.33.0 o superior, Linux + NVIDIA), no con Transformers, vLLM ni llama.cpp. El repositorio incluye además un modelo draft (gemma-4-31B-it-assistant) para decodificación especulativa, que según el autor duplica aproximadamente la velocidad de escritura.

El contexto operativo declarado llega a 32K tokens en una RTX A6000 de 48 GB (43,3 GiB en uso, draft incluido) y a 25K en la variante de 46.068 MiB. El modelo es solo texto, sin entrada de imagen ni audio, y procesa una petición a la vez. La licencia del repositorio es Apache-2.0, heredada del modelo base de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base google/gemma-4-31B-it); pesos comprimidos sin pérdida en formato Glyd |
| Parametros totales | 41.157.200.887 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens en RTX A6000 de 48 GB; 25K en A6000 de 46.068 MiB (contexto dimensionado para encajar) |
| Tipos de cuantizacion | No es cuantización: compresión sin pérdida a ~10,8 bits por peso, decodificada en GPU; bf16 exacto tras decodificar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos de Google, licencia de Google; motor Glyd bajo Apache-2.0) |
| Formato de pesos | Formato propietario de Glyd (no safetensors estándar para inferencia, no GGUF); repo de 42,3 GB con safetensors de metadatos; incluye draft model en `draft/` (+0,97 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de Google DeepMind, la variante instruct de Gemma 4 con 31B nominales y 41,16 mil millones de parámetros reales. Esta publicación no reentrena ni modifica los pesos: los almacena en un códec sin pérdida que representa cada peso bf16 en aproximadamente 10,8 bits y lo decodifica en la GPU durante la ejecución. La verificación es explícita: el comando `glyd verify` decodifica cada tensor y compara su sha256 con el registrado a partir de los ficheros de Google en el momento del empaquetado.

La innovación técnica principal es la compresión sin pérdida combinada con decodificación especulativa mediante el modelo draft gemma-4-31B-it-assistant, incluido sin cambios en el subdirectorio `draft/`. Según el autor, con el draft el modelo escribe aproximadamente el doble de rápido que sin él, y los tokens generados en modo greedy son idénticos. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de Google, no a esta publicación.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas de la variante `-it` de Gemma 4.
- Razonamiento y matemáticas: el autor reporta 72/75 en GSM8K y 67/75 en MMLU-Pro (greedy, thinking desactivado).
- Modo thinking: la model card indica que las mediciones se hicieron con "thinking off", lo que implica que el modelo base soporta un modo de razonamiento explícito, aunque esta variante no lo documenta en detalle.
- Decodificación especulativa con modelo draft para acelerar la generación.
- Solo texto: no hay entrada de imagen ni audio en esta versión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Servicio mediante API compatible con OpenAI a través de `glyd serve`.

## Casos de uso

- Despliegue de un modelo de 41B en una única GPU de 48 GB: la compresión reduce los pesos de 57,2 GiB a 38,4 GiB, de modo que una RTX A6000, RTX 6000 Ada o L40S puede alojar el modelo completo con contexto de hasta 32K tokens, algo inviable con los pesos bf16 originales.
- Asistente conversacional de contexto largo: con 32K tokens de ventana y lecturas de prompt de 3,25 s para 3.217 tokens y 35,5 s para 23.922 tokens en A6000, es adecuado para resumir documentos extensos o mantener diálogos multi-turno con historial amplio.
- Generación de texto en producción con API OpenAI: `glyd serve` expone el modelo mediante una interfaz compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin reescribir el cliente; el rendimiento en A6000 es de 34,3 tok/s en chat corto con draft y 13,3 tok/s sin él.
- Procesamiento por lotes sensible a la latencia en H100: con 61,8 tok/s en chat corto y 44,8 tok/s con prompt de 4K (draft activado), encaja en pipelines de generación de contenido donde el throughput importa más que el coste por token.
- Evaluación y auditoría de pesos: el comando `glyd verify` permite comprobar la integridad bit a bit frente a los ficheros de Google, útil en entornos que exigen trazabilidad de los pesos desplegados.
- Investigación sobre compresión sin pérdida: sirve como referencia reproducible para estudiar el impacto de la decodificación en GPU en la calidad de salida, con métricas KLD publicadas frente a las rutas bf16 de Transformers.
- Razonamiento matemático asistido: los resultados de GSM8K (72/75) y MMLU-Pro (67/75) en modo greedy permiten usarlo en tareas de resolución de problemas con verificación posterior.

## Benchmarks y rendimiento

Calidad (greedy, thinking off, H100 con draft model):

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K | 72 / 75 | Cada segunda pregunta, las primeras 75 |
| MMLU-Pro | 67 / 75 | Mismo procedimiento |

Divergencia de distribución (KLD media, wikitext-2 test, 32 x 512):

| Comparación | KLD |
|---|---|
| transformers bf16 (eager) vs transformers float32 | 0,162 |
| transformers bf16 (sdpa) vs transformers float32 | 0,179 |
| transformers bf16 eager vs sdpa | 0,164 |
| Este repo en motor Glyd vs transformers bf16 (eager) | 0,200 |

Rendimiento en RTX A6000 48 GB (greedy, thinking off, 512 tokens en chat y 256 tras prompt largo):

| Escenario | Tokens de prompt | Lectura | Escritura con draft | Escritura sin draft |
|---|---|---|---|---|
| Chat (prompt corto) | 33 | 0,09 s | 34,3 tok/s | 13,3 tok/s |
| Prompt de 4K tokens | 3.217 | 3,25 s | 21,2 tok/s | 12,7 tok/s |
| Prompt de 24K tokens | 23.922 | 35,5 s | 15,0 tok/s | 11,8 tok/s |

Rendimiento en H100 PCIe 80 GB:

| Escenario | Tokens de prompt | Lectura | Escritura con draft | Escritura sin draft |
|---|---|---|---|---|
| Chat (prompt corto) | 33 | 0,07 s | 61,8 tok/s | 30,0 tok/s |
| Prompt de 4K tokens | 3.217 | 1,93 s | 44,8 tok/s | 28,5 tok/s |
| Prompt de 24K tokens | 23.922 | 23,0 s | 34,1 tok/s | 24,1 tok/s |

El autor señala que sin draft el A6000 escribe al ~71 % de lo que permite su ancho de banda de memoria (768 GB/s sobre 41,2 GB por token = 18,6 tok/s teóricos) y que en H100 el motor aún no está optimizado: la lectura de prompt va a una fracción del pico de la tarjeta y la escritura sin draft alcanza ~62 % del límite de ancho de banda.

## Requisitos de hardware

- VRAM: 38,4 GiB de pesos en GPU (frente a 57,2 GiB en bf16); 43,3 GiB en uso de 48 GB a 32K de contexto con draft incluido en RTX A6000 (49.140 MiB).
- En la A6000 de 46.068 MiB: 42,8 GiB a 25K de contexto, con el contexto dimensionado para encajar.
- GPU recomendadas: RTX A6000 48 GB, RTX 6000 Ada, L40S; H100 PCIe 80 GB (soportada, pero el motor no está afinado para ella).
- Requisito mínimo: Linux + NVIDIA RTX 30 series o superior con 48 GB o más. Sin soporte para Windows, Mac ni AMD.
- Cabe en GPU de consumo: no, según los requisitos declarados (mínimo 48 GB).
- Despliegue: exclusivamente con el motor Glyd 0.33.0 o superior (`glyd run`, `glyd serve`, `glyd verify`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Tiempo de carga: 24-26 s desde disco.
- Latencia y throughput: ver tabla de benchmarks (34,3 tok/s en A6000 y 61,8 tok/s en H100 en chat corto con draft).
- Una petición simultánea; las demás esperan en cola.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| glyd/gemma-4-31B-penguin | 41,16B | 32K (A6000 48 GB) | Apache-2.0 | Formato Glyd, solo motor Glyd | Compresión sin pérdida; 38,4 GiB en GPU |
| google/gemma-4-31B-it | 41,16B (según este repo) | no disponible | Apache-2.0 | Safetensors bf16, Transformers/vLLM/etc. | Pesos originales; 57,2 GiB, no cabe en 48 GB |
| google/gemma-4-31B-it-assistant | no disponible | no disponible | no disponible | Safetensors | Modelo draft para decodificación especulativa |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible contrastar rendimiento entre ellos más allá de las cifras KLD y de velocidad ya recogidas.

## Limitaciones y advertencias

- Dependencia total del motor Glyd: los ficheros no funcionan con Transformers, vLLM ni llama.cpp; para esos entornos hay que usar los pesos de Google.
- Plataforma restringida: solo Linux + NVIDIA RTX 30 series o superior con 48 GB o más; sin Windows, Mac ni AMD.
- Solo texto: no admite imagen ni audio.
- Una petición a la vez: no hay batching concurrente; las peticiones adicionales esperan.
- Motor sin afinar en H100: lectura de prompt por debajo del pico y escritura sin draft a ~62 % del límite de ancho de banda.
- Reproducibilidad con sampling: con el draft activado y sampling, una misma semilla produce texto distinto (igualmente probable) que sin draft; solo el modo greedy es idéntico.
- Divergencia numérica: aunque los pesos son idénticos, el orden de las operaciones introduce diferencias; la KLD frente a Transformers bf16 eager es de 0,200, superior a la que separa las dos rutas bf16 de Transformers entre sí (0,164).
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base de Google.
- Idiomas soportados: no disponibles; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Licencia: Apache-2.0 para el repositorio y los pesos, con la salvedad de que los pesos son de Google y se rigen por su licencia; el motor Glyd es Apache-2.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/glyd/gemma-4-31B-penguin
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo draft: https://huggingface.co/google/gemma-4-31B-it-assistant
- Motor Glyd (GitHub): https://github.com/surya-koritala/Glyd
