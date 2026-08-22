# mustela410/lab21-qwen35-triage-lora

## Resumen

`lab21-qwen35-triage-lora` es un adaptador LoRA desarrollado por el usuario `mustela410` como parte de un ejercicio académico (curso AICB-P2T3, día 21, centrado en fine-tuning y seguridad). El adaptador se construye sobre el modelo base `unsloth/Qwen3.5-4B` y su propósito es clasificar tickets de soporte al cliente en vietnamita, devolviendo un objeto JSON con cuatro claves: `product`, `issue_type`, `urgency` y `sentiment`. El trabajo se enmarca en un laboratorio controlado donde se miden tanto el rendimiento en la tarea objetivo como la regresión en capacidades generales.

El resultado del laboratorio es un caso de estudio explícito de olvido catastrófico: el adaptador mejora la tarea objetivo en +0.220 respecto al mejor prompt, pero degrada las capacidades generales en -0.258 (más de 13 veces el margen permitido de 0.02), lo que lleva a la conclusión de que el entrenamiento fue **FAILED**. La model card documenta con transparencia todos los números, incluidos los negativos, y ofrece una recomendación de despliegue mediante hot-swapping según la ruta del endpoint.

Aunque el modelo está diseñado para un entorno de laboratorio y no para producción, su interés radica en la metodología de evaluación rigurosa y en las lecciones sobre el equilibrio entre especialización y preservación de conocimiento en fine-tuning con LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `unsloth/Qwen3.5-4B` (arquitectura base no disponible) |
| Parametros totales | No disponible (adaptador con 32.464.896 parámetros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bf16, sin cuantización 4-bit) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango `r=16` con `alpha=32` (alpha = 2r), aplicado sobre los módulos lineales de la arquitectura del modelo base (`text-linear`, 12 módulos, sin tocar la torre de visión). El entrenamiento se realizó con precisión bf16, sin cuantización 4-bit, con un máximo de 30 pasos, una tasa de aprendizaje de 0.0001 (escala LoRA) y una máscara de pérdida `assistant-only` con fracción supervisada de 0.4149. La pérdida final fue `0.3508` y el tiempo de entrenamiento `860.4` segundos, con un pico de VRAM de `12.01` GB.

Los datos de entrenamiento son un corpus generado automáticamente para el laboratorio, compuesto por tickets de soporte en vietnamita de un único dominio y una única tarea. No se incluyeron datos de replay, lo que causó el olvido catastrófico medido. El entrenamiento se realizó con la librería `trl` y `peft`.

## Capacidades

- Clasificación de tickets de soporte en vietnamita en un JSON con 4 claves: `product`, `issue_type`, `urgency`, `sentiment`.
- Entrada: texto del ticket (sin necesidad de system prompt). Salida: objeto JSON válido.
- El adaptador alcanza un `target` de 0.975 en el slice de evaluación congelado (n=50, greedy decode) y una tasa de formato correcto de 1.0.
- No se han documentado otras capacidades generales (razonamiento, generación de código, etc.) porque el entrenamiento se centró exclusivamente en la tarea de triage.

## Casos de uso

- **Demostración de fine-tuning con LoRA**: el adaptador sirve como ejemplo didáctico de cómo entrenar un adaptador para una tarea específica y cómo medir su impacto en capacidades generales.
- **Estudio de olvido catastrófico**: el modelo documenta un caso real y medible de pérdida de habilidades generales al entrenar con un único dominio, útil para investigar técnicas de mitigación (replay data, regularización).
- **Prueba de hot-swapping de adaptadores**: la model card recomienda cargar el adaptador solo en rutas de triage y mantener el peso base en el resto; esto puede probarse en un entorno de despliegue controlado.
- **Evaluación de métricas de regresión**: el laboratorio define un conjunto de 15 preguntas generales y un recall de palabras clave para medir la regresión; este adaptador puede usarse para validar dicha métrica.
- **Prototipo de clasificador de tickets en vietnamita**: aunque no apto para producción, puede servir como prototipo para una herramienta interna de clasificación de tickets de soporte.
- **Referencia para comparación de estrategias de fine-tuning**: se puede usar como baseline para probar métodos de entrenamiento que preserven capacidades generales (p.ej., mezcla de datos de replay).

## Benchmarks y rendimiento

La model card reporta resultados sobre un slice de evaluación congelado (n=50, greedy decode). Se comparan tres configuraciones: modelo base con prompt ingenuo, modelo base con prompt optimizado, y el adaptador presentado.

| Configuracion | target | regression | format | latency (ms/muestra) |
|---|---|---|---|---|
| base + prompt naive | 0.000 | 0.7244 | 0.0 | 2885.4 |
| base + prompt optimizado | 0.755 | 0.7244 | 1.0 | 774.2 |
| **adaptador (este modelo)** | **0.975** | **0.4667** | **1.0** | **1246.8** |

El `target` mide el acierto en la tarea objetivo (clasificación de tickets), `regression` mide el rendimiento en 15 preguntas generales y recall de palabras, y `format` indica si la salida es un JSON válido. La lectura conjunta de las dos primeras columnas muestra que el adaptador mejora el target pero degrada significativamente la capacidad general.

No se han publicado otros benchmarks (MMLU, HumanEval, etc.) para este adaptador.

## Requisitos de hardware

- El entrenamiento requirió un pico de VRAM de **12.01 GB** (según la model card).
- Para inferencia con el adaptador, se necesita cargar el modelo base `unsloth/Qwen3.5-4B` en memoria junto con el adaptador. El consumo de VRAM dependerá de la cuantización del modelo base (no especificada). Con bf16, el modelo base de 4B ocupa aproximadamente 8-9 GB, más la sobrecarga del adaptador y los estados de atención. Se recomienda una GPU con al menos 12 GB de VRAM (p.ej., RTX 3080 Ti, RTX 3090, A10, L4) para inferencia cómoda.
- No se han documentado opciones de despliegue específicas, pero al ser un adaptador PEFT, puede integrarse con bibliotecas como `transformers` + `peft`, `vLLM` (si soporta PEFT) o `llama.cpp` (con conversión a GGUF, si se desea).
- La latencia medida en el laboratorio es de **1246.8 ms/muestra** en la configuración de evaluación (probablemente con un batch pequeño y en GPU). No se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la misma tarea de clasificación de tickets en vietnamita. El propio modelo base `Qwen3.5-4B` sin adaptador es la referencia principal: el adaptador mejora el target en +0.220 sobre el mejor prompt, pero introduce una regresión de -0.258 en capacidades generales. No se conocen otros adaptadores específicos para triage de tickets en vietnamita en el ecosistema público.

## Limitaciones y advertencias

- **Olvido catastrófico**: el entrenamiento provocó una regresión de -0.258 en capacidades generales, lo que invalida el uso del adaptador en cualquier tarea que requiera razonamiento general.
- **Datos sintéticos de un solo dominio**: el corpus de entrenamiento fue generado automáticamente para el laboratorio; no es representativo de la diversidad real de tickets de soporte.
- **No apto para producción**: la model card advierte explícitamente que no debe usarse para decisiones que afecten a personas reales.
- **Errores en la clasificación de urgencia**: los tickets corteses sin marca temporal (p.ej. "Mong shop phản hồi") se clasifican como `thap` en lugar de `trung_binh`, un error sistemático que afecta a 5 de los 50 casos de evaluación.
- **Licencia no disponible**: no se especifica la licencia del adaptador ni del modelo base, lo que impide su uso comercial sin una revisión legal previa.
- **Idioma limitado**: solo soporta vietnamita, sin capacidades multilingües documentadas.
- **Contexto y longitud de entrada**: no se documenta la longitud máxima de contexto soportada, aunque se asume que hereda la del modelo base (no especificada).

## Enlaces

- Modelo en Hugging Face: [mustela410/lab21-qwen35-triage-lora](https://huggingface.co/mustela410/lab21-qwen35-triage-lora)
- Modelo base: [unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B) (no disponible en los resultados de búsqueda)
- Repositorio del laboratorio (mencionado en la model card): `submission/REPORT.md` dentro del repo de código del autor (enlace no disponible).

*Nota: no se encontraron papers, blogs o demos asociados al adaptador más allá de la propia model card.*
