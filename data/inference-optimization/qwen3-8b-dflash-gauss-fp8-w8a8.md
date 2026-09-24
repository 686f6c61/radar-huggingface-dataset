# inference-optimization/Qwen3-8B-DFlash-Gauss-FP8-W8A8

## Resumen

`inference-optimization/Qwen3-8B-DFlash-Gauss-FP8-W8A8` es un *drafter* de decodificación especulativa en FP8, derivado de `RedHatAI/Qwen3-8B-speculator.dflash` y diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. No es un modelo de chat autónomo: es un componente que propone varios tokens candidatos por paso, que el modelo objetivo verifica después. Su propósito es reducir la latencia por token y aumentar el throughput en despliegues de serving, manteniendo la distribución de salida del modelo grande.

El repositorio lo publica el perfil de HuggingFace `inference-optimization` bajo licencia Apache 2.0. El checkpoint contiene 1.179.882.368 parámetros (aproximadamente 1,18 mil millones) y ocupa 1,3 GB en disco, lo que corresponde a pesos cuantizados en FP8 estático con esquema W8A8 (8 bits para pesos y activaciones).

La variante concreta que se documenta aquí, etiquetada como Gauss8, aplica una calibración sintética con ruido gaussiano aleatorio (2.027 muestras, longitud de secuencia 2.048, semilla 0). El propio autor la describe explícitamente como un *control de calibración* y no como una calibración con datos reales, lo que la sitúa en el terreno experimental más que en el de producción validada. La model card incluye manifiestos de reproducibilidad, hashes de los checkpoints objetivo y drafter, y los comandos de evaluación, pero no publica resultados numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificación especulativa DFlash; la model card no detalla capas, cabezas ni mecanismo de atención. Requiere `config.py` propio y `custom_code` |
| Parametros totales | 1.179.882.368 (aproximadamente 1,18 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada para el drafter. El modelo objetivo Qwen3-8B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN (documentación pública de Qwen3) |
| Tipos de cuantizacion | FP8 estático W8A8 (pesos y activaciones en FP8); formato `compressed-tensors`. Calibración gaussiana sintética: 2.027 muestras, longitud 2.048, semilla 0 |
| Idiomas soportados | No disponible en la información proporcionada (el objetivo Qwen3-8B declara soporte multilingüe amplio) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con cuantización `compressed-tensors`; requiere código personalizado |
| Modelo base | `RedHatAI/Qwen3-8B-speculator.dflash` (drafter origen) y `Qwen/Qwen3-8B` (modelo objetivo) |
| Libreria | `speculators` |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un *draft model* de decodificación especulativa. El mecanismo consiste en que el drafter genera hasta siete tokens candidatos por paso (`--spec-tokens 7`, método `dflash`) y el modelo objetivo Qwen3-8B los verifica en paralelo, aceptando el prefijo correcto. Si la tasa de aceptación es alta, el coste efectivo por token baja de forma notable respecto a la decodificación autoregresiva convencional. La model card no documenta el número de capas, la dimensión oculta ni el tipo de atención del drafter, más allá de identificarlo como DFlash.

El entrenamiento del drafter original corresponde a `RedHatAI/Qwen3-8B-speculator.dflash`; este repositorio no reentrena, sino que cuantiza ese checkpoint a FP8 estático W8A8. La calibración se realizó con datos sintéticos generados aleatoriamente siguiendo una distribución gaussiana (2.027 muestras de 2.048 tokens, semilla 0), no con el corpus real de la preparación PerfectBlend. El autor indica que los prompts preparados y la caché de *hidden states* no son redistribuibles, aunque se registran sus recuentos y hashes en `calibration_manifest.json`. El repositorio incluye `quant_run_manifest.json` con los ajustes de cuantización y las revisiones de origen, y un directorio `provenance/` con el comando de entrenamiento del drafter fuente, el comando de cuantización (marcado como reconstruido), la instantánea del cuantizador, el comando y parche de vLLM y los hashes de ambos checkpoints.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B: no produce respuestas finales por sí mismo, sino propuestas que el objetivo verifica.
- Propuesta de hasta 7 tokens por paso de especulación (`--spec-tokens 7`).
- Reducción de la latencia por token y aumento del throughput efectivo del modelo objetivo cuando la tasa de aceptación es favorable.
- Integración con builds de vLLM que soporten el método DFlash, mediante `--spec-model` y `--spec-method dflash`.
- Cuantización FP8: menor huella de memoria del componente drafter frente a una versión en BF16.
- No incorpora tool calling ni function calling propios: esas capacidades, si existen, dependen del modelo objetivo Qwen3-8B.
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión o audio; no se documenta ninguna.
- Idiomas: no documentados en esta ficha; en la práctica queda limitado por la cobertura del drafter y del objetivo.

## Casos de uso

- Serving de Qwen3-8B con latencia reducida: desplegar el objetivo con el drafter mediante vLLM (`--spec-model` + `--spec-method dflash`) para rebajar el tiempo por token en cargas interactivas.
- Despliegue en GPU de consumo: al ocupar el drafter en FP8 aproximadamente 1,2 GB, el conjunto objetivo más drafter puede caber en tarjetas de 24 GB (por ejemplo RTX 4090 o RTX 3090) con contexto moderado, habilitando chat local.
- APIs de generación de texto con SLA de latencia: usar especulación para aumentar tokens por segundo por GPU sin cambiar el modelo servido ni la distribución de salida.
- Inferencia por lotes en producción: procesar grandes volúmenes de peticiones con Qwen3-8B reduciendo el coste por token cuando el hardware está saturado.
- Asistentes de código sobre Qwen3-8B: acelerar la generación de código en editores o pipelines de CI/CD aprovechando la verificación del objetivo, que es quien conserva las capacidades de programación.
- Investigación en decodificación especulativa: comparar DFlash frente a otros métodos (EAGLE, Medusa) midiendo tasa de aceptación, latencia y throughput con el mismo objetivo.
- Estudio de robustez de calibración: el ajuste con ruido gaussiano sintético permite analizar cómo se comporta una calibración sin datos reales frente a calibraciones con corpus real, en términos de tasa de aceptación.
- Evaluación reproducible de cuantización: los manifiestos y hashes incluidos permiten reproducir el pipeline de cuantización y auditar los artefactos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación del 2026-09-24 sobre todos los subconjuntos y nueve comandos de evaluación por subconjunto en `provenance/evaluation/`, pero no incluye cifras de tasa de aceptación, latencia o throughput. No se reproducen aquí números no verificados.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 1,2 GB de pesos en FP8 (repositorio de 1,3 GB), más la caché asociada al mecanismo de especulación.
- VRAM del objetivo Qwen3-8B: estimación orientativa de unos 16 GB en BF16 y alrededor de 8-9 GB en FP8, sin contar caché KV.
- GPU de consumo: viable en tarjetas de 24 GB (RTX 4090, RTX 3090) con el objetivo en FP8 o en cuantizaciones menores y contexto moderado. En tarjetas de 16 GB el margen es reducido y depende de la longitud de contexto.
- GPU de datacenter: A100, H100 o L40S para despliegues con concurrencia alta y contextos largos.
- Opciones de despliegue: vLLM con soporte del método DFlash y `config.py` propio. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. El beneficio depende de la tasa de aceptación del drafter, que no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `inference-optimization/Qwen3-8B-DFlash-Gauss-FP8-W8A8` | 1,18 B (drafter) | FP8 estatico W8A8 | No especificado | Apache 2.0 | Publicado, 0 descargas | No disponible |
| `RedHatAI/Qwen3-8B-speculator.dflash` (origen) | No disponible | Probablemente BF16; no confirmado | No especificado | Apache 2.0 | Publicado | No disponible |
| Drafters tipo EAGLE-3 o Medusa para objetivos de 7-8 B | Del orden de 0,1-2 B segun variante | Habitualmente BF16 | No aplica (dependen del objetivo) | Variable segun implementacion | Ecosistema amplio | No comparable sin datos del mismo objetivo |

La comparación cuantitativa no es posible con la información disponible: no hay cifras de tasa de aceptación ni de aceleración para esta variante ni para su checkpoint de origen. La diferencia verificable frente al drafter original es la cuantización FP8 estática y el uso de calibración gaussiana sintética en lugar de datos reales.

## Limitaciones y advertencias

- No es un modelo autónomo: cargarlo sin el objetivo Qwen3-8B y sin un motor compatible con DFlash no produce generación de texto útil.
- La calibración emplea ruido gaussiano sintético, no datos reales. El autor la etiqueta como control experimental, por lo que la tasa de aceptación puede ser inferior a la de una calibración con corpus representativo.
- Inconsistencia de nomenclatura: el ID del repositorio usa `Gauss-FP8-W8A8`, mientras que la model card y el comando de vLLM usan `Gauss8-FP8-W8A8`. Conviene verificar el nombre exacto antes de automatizar despliegues.
- Repositorio sin descargas ni likes y sin benchmarks publicados: no hay validación externa de su comportamiento en producción.
- Requiere `custom_code` y confianza remota al cargar el modelo, lo que implica revisar el código incluido antes de ejecutarlo en entornos sensibles.
- Los prompts de preparación PerfectBlend y la caché de *hidden states* no se redistribuyen, por lo que la reproducibilidad de la calibración es parcial (solo se publican recuentos y hashes).
- Idiomas soportados no documentados para el drafter; la cobertura efectiva depende del objetivo.
- El riesgo de alucinación lo determina el modelo objetivo, no el drafter: la verificación especulativa preserva la distribución del objetivo si está implementada correctamente, pero no elimina los sesgos ni los errores de Qwen3-8B.
- Licencia Apache 2.0 en el drafter, heredada del checkpoint de origen; el uso comercial está permitido, sujeto a las condiciones del objetivo Qwen3-8B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Qwen3-8B-DFlash-Gauss-FP8-W8A8
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter de origen: https://huggingface.co/RedHatAI/Qwen3-8B-speculator.dflash
- Manifiestos de reproducibilidad: `quant_run_manifest.json`, `calibration_manifest.json` y directorio `provenance/` dentro del repositorio
- Papers, blogs o demos adicionales: no disponibles. La búsqueda web realizada devolvió únicamente definiciones genéricas del término "inference" y ningún recurso técnico relacionado con este modelo.
