# ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-70pct

## Resumen
Este modelo es una versión podada de `m-a-p/1.3B-100B-GatedDeltaNet-pure`, un transformer con capas GatedDeltaNet (atención lineal con decaimiento) de aproximadamente 1.466 millones de parámetros. La poda se ha realizado de forma one-shot, sin reentrenamiento posterior, aplicando el algoritmo Wanda sobre todas las capas lineales internas de los bloques, dejando embeddings y `lm_head` densos. El resultado es un modelo con una dispersión medida de 0,6998 (70 %) y máscaras semi-estructuradas idénticas por fila en las 240 capas podadas.

El interés de esta ficha radica en que sirve como referencia base (baseline) para los modelos EHWS del mismo autor: permite medir cuánto se degrada un modelo GatedDeltaNet al aplicar una poda agresiva con un método estándar antes de introducir optimizaciones específicas. El autor publica tanto la perplejidad como la accuracy zero-shot frente al modelo denso original, lo que facilita comparaciones reproducibles.

La relevancia práctica es limitada: la degradación es severa (perplejidad en WikiText-2 de 10,31 a 31,03 y en C4 de 13,76 a 39,98), y la licencia e idiomas no están declarados. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (transformer con capas de atención lineal gated delta) |
| Parámetros totales | 1.466.343.808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 70 % semi-estructurada (0,6998 medida) |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Método de poda | Wanda one-shot, `use_variant=False`, calibración con 128 secuencias de C4 de 2.048 tokens, seed 0 |
| Tamaño del repo | 2,9 GB |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del base `m-a-p/1.3B-100B-GatedDeltaNet-pure`: un transformer con capas GatedDeltaNet, una variante de atención lineal con mecanismo de decaimiento (delta rule) que sustituye la atención cuadrática habitual. El nombre del modelo base sugiere un entrenamiento sobre 100.000 millones de tokens, aunque este dato no se detalla en la información disponible. Los pesos están en bfloat16.

La innovación de esta versión es exclusivamente la poda: se aplica Wanda (official code, commit `locuslab/wanda@8e8fc87`, rama unstructured, `use_variant=False`) sobre todas las capas lineales internas de los bloques. La calibración usa el loader oficial con 128 secuencias de C4 de 2.048 tokens y seed 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados anteriores, siguiendo el esquema de los drivers oficiales (adaptado a GatedDeltaNet, ya que los drivers originales solo soportan OPT y LLaMA). La poda se ejecutó en 1,5 minutos en una A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior.

## Capacidades
- Generación de texto autoregresiva con un modelo de 1,466 mil millones de parámetros.
- Razonamiento básico y respuesta a preguntas de opción múltiple, aunque con degradación notable respecto al denso (ver benchmarks).
- Capacidad multilingüe: no disponible en la información.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Requiere `flash-linear-attention` instalado (`import fla`) para cargarse mediante `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso
- Investigación sobre poda de modelos: sirve como baseline Wanda para comparar con los modelos EHWS del mismo autor y medir el impacto de técnicas de poda más avanzadas sobre GatedDeltaNet.
- Estudio de atención lineal en producción: permite evaluar el comportamiento de capas GatedDeltaNet podadas en tareas de generación de texto con requisitos de memoria reducidos.
- Experimentos de compresión en hardware limitado: con 2,9 GB en safetensors y pesos bfloat16, puede ejecutarse en GPUs consumer con suficiente VRAM para prototipos de investigación.
- Benchmarking de perplejidad y zero-shot: útil para validar pipelines de evaluación (lm-evaluation-harness, protocolo ELSA) sobre modelos podados.
- Docencia y análisis de dispersión: las máscaras por fila perfectamente balanceadas (240 capas) permiten estudiar el equilibrio de trabajo por fila en kernels dispersos.
- Comparación de calibración: el uso de 128 secuencias de C4 y poda secuencial por bloque sirve para reproducir y contrastar metodologías de calibración en modelos no LLaMA.
- No se recomienda su uso en producción para atención al cliente, generación de código o agentes, dada la degradación severa y la falta de licencia declarada.

## Benchmarks y rendimiento
Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 / C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (Wanda 70 %) | 31,03 | 39,98 |

Accuracy zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,1962 |
| arc_easy | 0,7222 | 0,5017 |
| boolq | 0,6159 | 0,6211 |
| hellaswag | 0,4629 | 0,3202 |
| openbookqa | 0,2920 | 0,1720 |
| rte | 0,4982 | 0,5271 |
| winogrande | 0,6188 | 0,5225 |
| Media | 0,5123 | 0,4087 |

## Requisitos de hardware
- VRAM estimada: con pesos en bfloat16 y 1,466 mil millones de parámetros, el modelo ocupa aproximadamente 2,9 GB en disco y una cantidad similar en VRAM (sin contar activaciones ni caché). Con cuantización a 8 bits o 4 bits se reduciría, pero no se proporcionan artefactos cuantizados.
- GPU recomendadas: A100 40 GB (utilizada para la poda) es más que suficiente; también cabe en RTX 4090, RTX 3090 y GPUs consumer con al menos 4-6 GB de VRAM para inferencia en bfloat16.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más, siempre que se instale `flash-linear-attention`.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `fla` instalado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La poda se completó en 1,5 minutos en una A100 40 GB, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Wanda 70 %) | 1,466 B | no disponible | no disponible | Hugging Face | Poda one-shot, perplejidad WikiText-2 31,03 |
| m-a-p/1.3B-100B-GatedDeltaNet-pure | ~1,3 B | no disponible | no disponible | Hugging Face | Modelo denso base, perplejidad WikiText-2 10,31 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face (referenciados) | Alternativas de poda más avanzadas, sin datos en esta información |

## Limitaciones y advertencias
- Degradación severa: la perplejidad en WikiText-2 pasa de 10,31 a 31,03 y en C4 de 13,76 a 39,98; la media zero-shot cae de 0,5123 a 0,4087.
- Sin reentrenamiento: la poda one-shot no recupera capacidad, por lo que el modelo no es adecuado para tareas que exijan precisión alta.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Dependencia de `flash-linear-attention`: sin esta librería el modelo no se carga correctamente.
- Riesgo de alucinación: probablemente elevado tras la poda, aunque no se han publicado evaluaciones específicas.
- Sesgos: no disponibles; el modelo base no documenta sesgos en la información proporcionada.
- Contexto: no se especifica la longitud máxima de contexto soportada.
- Uso previsto: baseline de investigación, no modelo de producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-70pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit `8e8fc87`)
- Repositorio de flash-linear-attention: no disponible en la información proporcionada.
