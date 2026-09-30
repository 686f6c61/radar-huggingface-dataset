# cowWhySo/jeeves-mlx

## Resumen

Jeeves-9B MLX 4bit es un empaquetado no oficial, publicado por el usuario cowWhySo, del modelo de decisión PostHog/jeeves convertido al formato MLX de Apple. No se trata de un modelo nuevo: es un port de pesos con cuantización affine de 4 bits (group size 64) sobre un backbone Qwen3.5-9B de 8.953.803.264 parámetros, con la cabeza de decisión original conservada en FP32. El pipeline declarado es text-classification y el único idioma soportado es el inglés.

El modelo original resuelve un problema muy concreto: producir probabilidades de decisión calibradas sobre un conjunto de opciones, en lugar de texto libre. Jeeves entrena un backbone Qwen3.5-9B con LoRA y una cabeza pointer mediante CISPO para que razone antes de decidir, y según su autor supera al baseline Jev en JevBench hard (público). Esta conversión mantiene la cabeza y el formato de prompt/readout, pero no incorpora los componentes de servicio del proyecto original.

Su relevancia es fundamentalmente práctica y de nicho: permite ejecutar el pipeline de decisión de Jeeves en Apple Silicon sin GPU NVIDIA. Sin embargo, el propio autor advierte de que el paquete no está benchmarkeado, que la ruta Metal no se ha medido y que las cifras del proyecto upstream no son transferibles a esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5-9B) con cabeza de decision pointer tipo Jev-like |
| Parametros totales | 8.953.803.264 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX affine, group size 64 (rama `main`); ramas adicionales en 8-bit y BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); incluye `head.safetensors` en FP32 y el `head.pt` original |
| Tamano del repositorio | 32,5 GB (incluye todas las ramas) |
| Variantes publicadas | 4bit (`main`, 4,73 GiB), 8bit (8,90 GiB), bf16 (16,71 GiB); tamanos en disco |
| Libreria | mlx |

## Arquitectura y entrenamiento

El backbone es un Qwen3.5-9B, un transformer decoder-only, sobre el que el proyecto original de PostHog añade LoRA y una cabeza pointer que convierte el estado oculto en probabilidades sobre opciones. El entrenamiento usa CISPO con el objetivo de que el modelo razone antes de decidir, lo que según el autor mejora el rendimiento fuera de dominio y supera a Jev en JevBench hard (público). Este paquete no reentrena nada: solo reconvierte pesos.

La conversión la realizó cowWhySo en CPU con `mlx[cpu]==0.32.3` y cuantización affine de 4 bits con group size 64. La cabeza pointer original se conserva como `head.pt` y se exporta sin alterar sus valores FP32 como `head.safetensors`. La temperatura ajustada que se conserva es 1,85892808437347 y está registrada en `export.json`; el autor indica explícitamente que no se ha reajustado para la ruta numérica cuantizada. Entre las innovaciones del proyecto upstream que este port no incluye figuran los drafters de difusión especulativa, las CUDA graphs, el servicio FP8, el motor de preguntas en paralelo y el umbral adaptativo de no-thinking.

## Capacidades

- Decisión con opciones múltiples: el runner acepta un campo `state` y un mapeo `questions` con tipos `noul`, `choice` o `score`, y devuelve probabilidades por opción bajo su propio esquema `results`.
- Clasificación binaria y puntuación: los tipos `noul` y `score` permiten obtener probabilidades calibradas en lugar de texto generado.
- Modo thinking opcional: existe una ruta greedy de razonamiento previo a la decisión (`--think-tokens 128`) que el autor marca como no validada.
- Procesamiento independiente por pregunta: el runner de referencia usa una caché separada por pregunta y rehace el prefill completo de la secuencia para la lectura de decisión.
- Idiomas: únicamente inglés.
- Tool calling / function calling: no disponible, no se documenta soporte.
- Capacidades de agente multi-paso: no disponible; el paquete implementa decisión puntual, no orquestación.
- Visión, audio o generación de texto conversacional: no disponible; no es un pipeline de generación ordinario.
- Integración HTTP: el runner no es compatible a nivel de cable con el servicio `/v1/systemone` del proyecto upstream.

## Casos de uso

- Triage de tickets de soporte: el tipo `choice` permite asignar cada ticket a una cola concreta devolviendo probabilidades por opción, lo que facilita fijar umbrales de derivación a un humano cuando la confianza es baja.
- Moderación de contenido binaria: con el tipo `noul` se puede obtener una probabilidad de decisión sobre una única cuestión, útil como señal previa a un revisor humano en lugar de como veredicto automático.
- Evaluación automática de respuestas: el tipo `score` puntúa candidatas generadas por otro modelo, y el resultado puede usarse para reranking dentro de un pipeline de generación.
- Enrutamiento dentro de un sistema de agentes: al devolver probabilidades calibradas, el modelo sirve como componente de decisión entre herramientas o rutas alternativas, con la salvedad de que la calibración no está verificada en esta conversión.
- Prototipado e investigación en calibración: investigadores que trabajen con modelos de decisión Jev-like pueden reproducir el pipeline en local sobre Apple Silicon sin depender de CUDA.
- Despliegue local en estaciones de trabajo Mac: la conversión a MLX permite ejecutar el scoring en un equipo de sobremesa con memoria unificada, útil para entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Comparación de variantes de cuantización: disponer de 4-bit, 8-bit y BF16 en el mismo repositorio permite estudiar la degradación de las probabilidades de decisión entre precisión completa y cuantizada, aunque el autor no aporte esa comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única referencia cualitativa es del proyecto upstream, que afirma superar a Jev en JevBench hard (público), sin cifras en la información proporcionada. Para esta conversión, el autor declara el estado `converted_and_small_cpu_diagnostics_passed_not_benchmarked` y afirma que no se reclama ninguna precisión de tarea, calibración, velocidad en Metal ni ranking de calidad cuantizada.

Los únicos datos numéricos publicados son diagnósticos, no benchmarks:

| Diagnostico | Resultado |
|---|---|
| Casos de formato/cabeza superados | 4 |
| Error maximo de probabilidad en comparacion de cabeza pointer sobre estado oculto sintetico | 0 (no es una comparacion del backbone) |
| Casos del smoke test de CPU en modo no-thinking | 1 |
| Diferencia maxima de probabilidad por opcion frente a MLX BF16 en el diagnostico de 1 caso | 0,016297996 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 4,7 GiB en disco para el paquete 4-bit, 8,9 GiB para 8-bit y 16,7 GiB para BF16. Son tamanos en disco, no picos de memoria medidos; el autor lo indica expresamente.
- GPU recomendadas: Apple Silicon con Metal, dado que el paquete es MLX. No se documenta soporte CUDA en este repositorio.
- GPU de consumo: cabe en equipos Apple Silicon con memoria unificada suficiente, aunque no se ha medido la ejecución en Metal. No hay datos para GPUs NVIDIA o AMD.
- Opciones de despliegue: `run_jeeves.py` incluido en el paquete (obligatorio para el scoring), `mlx-lm` a nivel de librería, y `huggingface_hub` para la descarga. El autor advierte que `mlx_lm.generate` por sí solo no implementa el scoring de Jeeves.
- Requisito de conversión declarado: `mlx[cpu]==0.32.3`.
- Latencia y throughput: no disponibles. Los tiempos de CPU del smoke test se describen como diagnósticos, no como benchmarks representativos de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| cowWhySo/jeeves-mlx (4bit, `main`) | 8,95B | no disponible | 4-bit MLX affine, group 64 | apache-2.0 | HuggingFace, rama `main` | Port no oficial, sin benchmarkear, ruta Metal no medida |
| cowWhySo/jeeves-mlx (8bit) | 8,95B | no disponible | 8-bit | apache-2.0 | HuggingFace, rama `8bit` | Mismo port, mayor tamano de disco (8,90 GiB) |
| cowWhySo/jeeves-mlx (bf16) | 8,95B | no disponible | BF16 | apache-2.0 | HuggingFace, rama `bf16` | Usado como referencia en el diagnostico de 1 caso |
| PostHog/jeeves (upstream) | no disponible | no disponible | no disponible | no disponible | HuggingFace y GitHub | Modelo de decision entrenado con LoRA y cabeza pointer mediante CISPO |
| Jev (baseline citado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible | Baseline Jev-like; el upstream afirma superarlo en JevBench hard |

Los parametros y la licencia de los modelos comparables no se detallan en la información disponible, por lo que se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- Paquete no benchmarkeado: el autor declara el estado `converted_and_small_cpu_diagnostics_passed_not_benchmarked`; no hay cifras de precisión de tarea ni de calibración.
- Ejecución en Metal no medida: las instrucciones para Apple Silicon se presentan como una ruta no medida, no como una ruta probada. El autor recomienda revisar el código Python antes de ejecutarlo.
- Evidencia diagnóstica mínima: la comparación del backbone en BF16 es un fixture pequeno con tolerancias heurísticas, y el smoke test de CPU contiene un único caso. La diferencia máxima de probabilidad de 0,016297996 no es una estimación de precisión ni de calibración.
- Temperatura no reajustada: se conserva la temperatura ajustada original (1,85892808437347) sobre una ruta numérica distinta, lo que el autor señala que no constituye evidencia de calibración.
- Modo thinking sin validar: la ruta greedy con `--think-tokens 128` está marcada explícitamente como no validada.
- Compatibilidad de servicio: el runner no es compatible a nivel de cable con el servicio HTTP `/v1/systemone` del proyecto upstream, y devuelve probabilidades bajo su propio esquema `results`.
- Componentes no portados: no se incluyen los drafters de difusión especulativa, CUDA graphs, servido FP8, motor de preguntas en paralelo ni umbral adaptativo de no-thinking.
- Idioma único: solo inglés, lo que limita su uso directo en castellano sin evaluación adicional.
- Origen no oficial: no es un lanzamiento de PostHog ni de Apple, y no está certificado por benchmarks. Puede haber derivas respecto al modelo original.
- Licencia: apache-2.0 en el paquete y en las etiquetas del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del proyecto upstream antes de desplegarlo en producción.
- Riesgo de alucinación: al no ser un pipeline de generación libre, el riesgo principal no es la invención de texto sino una calibración incorrecta de las probabilidades, que en esta conversión no está verificada.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Cifras no transferibles: el autor advierte que los resultados de benchmark y las cifras de velocidad en CUDA del upstream no se trasladan a esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cowWhySo/jeeves-mlx
- Rama 4bit (`main`): https://huggingface.co/cowWhySo/jeeves-mlx/tree/main
- Rama 8bit: https://huggingface.co/cowWhySo/jeeves-mlx/tree/8bit
- Rama bf16: https://huggingface.co/cowWhySo/jeeves-mlx/tree/bf16
- Modelo original: https://huggingface.co/PostHog/jeeves
- Revision del modelo original usada en la conversion: https://huggingface.co/PostHog/jeeves/tree/8622b7d1652a9dcb8629486b84dce9e8d690c5cd
- Proyecto original en GitHub: https://github.com/PostHog/jeeves/
- Codigo de Jeeves usado: https://github.com/PostHog/jeeves/tree/f04ec5567301450dcaae0210dd54deeb4f647f87
- MLX-LM: https://github.com/ml-explore/mlx-lm/tree/94cdcae13b266c337bcaca09b97b9c5a9c0e2cde
- Fichero de validacion del paquete: https://huggingface.co/cowWhySo/jeeves-mlx/blob/main/validation.json
- Manifest del paquete: https://huggingface.co/cowWhySo/jeeves-mlx/blob/main/PACKAGE_MANIFEST.json
- Notas de conversion originales: https://huggingface.co/cowWhySo/jeeves-mlx/blob/main/provenance/original_package_README.md
