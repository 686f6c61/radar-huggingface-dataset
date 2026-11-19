# loom-draft/Epiculous-Violet_Twilight-v0.2-loom

## Resumen

Epiculous-Violet_Twilight-v0.2-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Epiculous/Violet_Twilight-v0.2-GGUF`, concretamente la cuantización `Violet_Twilight-v0.2.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está orientado a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta `loom-next` (el generador únicamente, sin LLM en el bucle) y se distribuye bajo licencia Apache 2.0.

El interés de esta ficha no reside en un modelo nuevo, sino en el formato de empaquetado: Loom traduce los pesos GGUF a programas específicos para el hardware AMD, expone una API compatible con OpenAI (`/v1/chat/completions`) mediante `loom-serve` y documenta un conjunto de puertas de corrección (kernel tests, golden, compare, consistency, agent, sampling, logits, decision) frente a la referencia de llama.cpp. En el momento de la publicación, ninguna de esas puertas tiene mediciones registradas para este paquete concreto, y la sección de rendimiento indica explícitamente que los resultados aún no se han vuelto a medir.

La relevancia es doble: por un lado, permite ejecutar un modelo conversacional de la familia Violet_Twilight sobre GPUs AMD con soporte ROCm sin depender de llama.cpp en tiempo de ejecución; por otro, sirve como ejemplo de empaquetado reproducible (verificación sha256 de los ficheros de origen mediante `loom-fetch`) para el ecosistema Loom. El modelo base es un fine-tune de rol conversacional, sin capacidades declaradas de tool calling, razonamiento explícito ni visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del modelo base; se infiere transformer decoder-only por el formato GGUF, sin confirmación) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se declara MoE) |
| Longitud de contexto | 242.688 tokens por petición (según la tarjeta del paquete) |
| Tipos de cuantización | Q4_K_M (checkpoint `Violet_Twilight-v0.2.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generación | loom-next |
| Versión del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base `Epiculous/Violet_Twilight-v0.2-GGUF`; la información disponible solo confirma que se trata de un checkpoint GGUF cuantizado en Q4_K_M y que el paquete Loom lo consume sin modificar los pesos. No se dispone de datos sobre número de parámetros, composición del dataset de entrenamiento, número de tokens vistos ni si hubo fases de RLHF, DPO o fine-tuning supervisado. Tampoco se documenta en esta tarjeta la arquitectura del modelo original (transformer denso, MoE u otra), por lo que cualquier afirmación al respecto sería especulativa.

La innovación técnica relevante está en la capa de despliegue: `loom-next` genera programas `.loom` específicos para las arquitecturas gfx1151 y gfx1201 a partir de la configuración del modelo (`llm_config.json`) y del tokenizador (`tokenizer.json`). `loom-fetch` descarga el paquete desde Hugging Face y verifica el sha256 de los ficheros de origen fijados en `model.json.lock`. `loom-serve` levanta un servidor con API estilo OpenAI y permite ajustar el comportamiento del runtime mediante parámetros como `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico) y `parameter_mode=preload` (carga de pesos en host). La tarjeta incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan el resultado del runtime Loom contra la referencia de llama.cpp registrada sobre el mismo GGUF, pero para este paquete todas aparecen como "not yet re-measured".

## Capacidades

- Generación de texto conversacional multi-turno a través de una API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 242.688 tokens por petición, adecuado para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultáneas con salida máxima de 4.096 tokens por respuesta.
- Tool calling: no aplicable según la tarjeta del paquete.
- Razonamiento / thinking mode: no aplicable.
- Reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no determinada.
- Entrada y salida de audio: no determinada.
- Muestreo (temperatura, top_k, semilla): no determinado en la tarjeta, aunque existe una puerta de corrección `sampling` definida.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint compatible con OpenAI, lo que permite conectarlo a clientes existentes sin adaptadores adicionales.
- Procesamiento de documentos largos: con 242.688 tokens de contexto por petición, es viable resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, siempre que el modelo base rinda adecuadamente en esa longitud (no verificado en este paquete).
- Prototipado de aplicaciones de chat en hardware AMD consumer/prosumer: la R9700 de 32 GB y la APU Strix Halo permiten desplegar el modelo en máquinas de escritorio sin GPUs NVIDIA, útil para equipos que ya trabajan con ROCm.
- Evaluación comparativa de runtimes: al incluir puertas de corrección frente a llama.cpp sobre el mismo GGUF, el paquete sirve para validar la fidelidad numérica de Loom en un modelo conversacional concreto.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse localmente con licencia Apache 2.0, se puede integrar en infraestructura propia sin dependencia de APIs externas.
- Banco de pruebas para pipelines de CI de modelos: el flujo `loom-fetch` con verificación sha256 y las puertas `gates.sh` permiten automatizar la validación de que un paquete produce la misma salida codiciosa que la referencia.
- Generación de respuestas en lote con concurrencia moderada: 4 peticiones simultáneas son suficientes para tareas de anotación o generación de contenido en pequeños equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección "Performance vs llama.cpp" de la tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de corrección aparecen como "not yet re-measured".

| Benchmark / puerta | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no medido | no medido |
| `kernel_tests` | no medido | no medido |
| `golden` | no medido | no medido |
| `compare` | no medido | no medido |
| `vision` | no medido | no medido |
| `consistency` | no medido | no medido |
| `spec` | no medido | no medido |
| `agent` | no medido | no medido |
| `sampling` | no medido | no medido |
| `logits` | no medido | no medido |
| `decision` | no medido | no medido |

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que la tarjeta no publica el tamaño del checkpoint ni el consumo del pool de memoria. El hardware objetivo declarado (R9700 con 32 GB y Strix Halo) sugiere que el paquete cabe en 32 GB o menos con la cuantización Q4_K_M.
- GPU compatibles: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se declara soporte para otras GPUs AMD ni para NVIDIA.
- Cabe en GPU consumer: la Strix Halo es una APU de escritorio con memoria unificada; la R9700 es una GPU de estación de trabajo. No se confirma compatibilidad con GPUs consumer de gama baja.
- Opciones de despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0`, instalado vía `pipx`. El flujo de arranque incluye `loom-fetch` para materializar el paquete (`--materialize=copy`) y `loom-serve` con parámetros `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles. La tarjeta menciona que las mediciones de rendimiento usarían `completion_spin_ns=4294967295` (espera activa), pero no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, tamaño de parámetros ni benchmarks de este paquete que permitan una comparación cuantitativa con alternativas. Como referencia cualitativa, el propio modelo base `Epiculous/Violet_Twilight-v0.2-GGUF` (formato GGUF, cuantización Q4_K_M) sería el equivalente directo ejecutado mediante llama.cpp, pero no se dispone de cifras comparativas publicadas para este paquete.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Epiculous-Violet_Twilight-v0.2-loom | no disponible | 242.688 tokens | Apache 2.0 | Loom (origen GGUF Q4_K_M) | no medido |
| Violet_Twilight-v0.2-GGUF (llama.cpp) | no disponible | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todas las puertas de corrección y las mediciones de rendimiento de este paquete aparecen como "not yet re-measured": no hay evidencia publicada de que la salida coincida con llama.cpp ni de la velocidad alcanzada.
- No se documentan sesgos conocidos del modelo base; al ser un fine-tune conversacional sin información de dataset, el riesgo de sesgo y de alucinación no puede evaluarse a partir de esta tarjeta.
- El contexto declarado de 242.688 tokens no está validado en este paquete; la calidad del modelo base en longitudes extremas es desconocida.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin pruebas.
- Tool calling, razonamiento explícito, decodificación especulativa, visión y audio no están soportados o no están determinados, lo que limita su uso en pipelines agénticos.
- La concurrencia está limitada a 4 peticiones simultáneas y la salida a 4.096 tokens por respuesta (preset `max_tokens`), valores que pueden requerir ajuste para cargas de producción.
- El paquete está atado a dos plataformas AMD concretas (gfx1151 y gfx1201); no se declara compatibilidad con otras GPUs, incluido NVIDIA.
- El parámetro `completion_spin_ns=4294967295` habilita espera activa y consume CPU mientras la GPU trabaja; en servidores compartidos puede degradar otras cargas.
- Aunque la licencia del paquete es Apache 2.0, el modelo base y sus pesos de origen deben verificarse por separado antes de un uso comercial; la tarjeta no detalla las condiciones del checkpoint original más allá de la licencia declarada.
- El paquete se publicó el 2026-11-19 con 0 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/Epiculous-Violet_Twilight-v0.2-loom
- Modelo base: https://huggingface.co/Epiculous/Violet_Twilight-v0.2-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
