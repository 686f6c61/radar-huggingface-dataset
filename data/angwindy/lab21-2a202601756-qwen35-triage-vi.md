# angwindy/lab21-2A202601756-qwen35-triage-vi

## Resumen

`angwindy/lab21-2A202601756-qwen35-triage-vi` es un adaptador LoRA (PEFT) fine-tuneado sobre el modelo base `unsloth/Qwen3.5-4B` para la clasificación de tickets de atención al cliente (CSKH) en vietnamita, generando una salida JSON con cuatro claves: `intent`, `urgency`, `product` y `sentiment`. Lo desarrolla un estudiante de VinUni AICB (Día 21, Track 3) como entregable académico de un laboratorio de fine-tuning con LoRA/QLoRA.

El adaptador se entrenó con un conjunto de datos reducido de 250 tickets vietnamitas (split 225/25, seed 42) durante 2 épocas y 30 pasos de optimización, con LoRA r=16, α=32 y target sobre la proyección de texto (`text-linear`). Aunque alcanza una precisión de objetivo (target) de 0.970 frente a la línea base optimizada de 0.765, el propio autor lo declara **FAILED** por una regresión severa de capacidades generales (−0.413 frente a una tolerancia de 0.020) y una tasa de trazas de pensamiento válidas de 0.0, por lo que **no recomienda su despliegue** en el estado actual.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de fine-tuning LoRA para un dominio específico (triage de tickets en vietnamita); por otro, sirve como ejemplo de advertencia sobre los riesgos de la regresión de capacidades en fine-tunes con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-4B (transformer decoder-only, ChatML) |
| Parametros totales | Adaptador: 32.464.896 entrenables; base: 4B (total exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 (max_length de entrenamiento; contexto del base no disponible) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; experimento QLoRA usó 7,09 GB VRAM) |
| Idiomas soportados | Vietnamita (tickets CSKH) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT, 124 MB, subcarpeta `adapters/correct`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3.5-4B`, un modelo de 4B parámetros con plantilla ChatML y andamiaje de pensamiento (`thinking`). El fine-tuning emplea LoRA con r=16, α=32 y target sobre la proyección de texto (`text-linear`), con 32.464.896 parámetros entrenables. El entrenamiento usó el dataset de 250 tickets CSKH vietnamitas con split 225/25 (seed 42), `max_length` de 1024 tokens, modo de enmascaramiento `assistant-only` (supervisando tanto el bloque `thinking` como el JSON posterior), 2 épocas (30 pasos de optimización), optimizador AdamW y tasa de aprendizaje 1e-4.

Se realizaron cuatro experimentos NB4: `correct` (text-linear, r=16, target 0.97), `attn_only` (q,v, r=283 con presupuesto igualado, target 0.97), `wrong_lr` (text-linear con LR 1e-5, target 0.00) y `qlora` (text-linear con QLoRA, target 0.94, 41 % menos VRAM). Las lecciones extraídas incluyen que la pérdida de entrenamiento es un proxy peligroso (memorizar no es generalizar), que LR 1e-5 mata el entrenamiento, que QLoRA ahorra VRAM con una pérdida mínima de calidad, y que la posición del adaptador no determina el resultado con presupuesto de parámetros equivalente.

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita en cuatro dimensiones: `intent`, `urgency`, `product` y `sentiment`, con salida JSON estructurada.
- Precisión de objetivo (target) de 0.970 en el conjunto de validación, superando la línea base con prompt optimizado (0.765).
- Formato de salida JSON correcto en el 100 % de los casos de validación (format = 1.0).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un adaptador especializado de una sola tarea.
- Capacidad multilingüe: no; está entrenado exclusivamente para vietnamita.
- El modo `thinking` del base se pierde tras el fine-tuning (valid_trace_rate = 0.0), lo que indica sobreajuste local.

## Casos de uso

- **Triage automático de tickets CSKH en vietnamita**: el adaptador puede clasificar tickets entrantes en intención, urgencia, producto y sentimiento, generando JSON listo para integrar en un sistema de gestión de incidencias. Es adecuado por su alta precisión de objetivo (0.97), aunque la regresión de capacidades limita su uso a entradas muy similares al dominio de entrenamiento.
- **Enrutamiento de incidencias en centros de soporte**: la salida JSON con `intent` y `product` permite enrutar automáticamente cada ticket al equipo correspondiente. El formato 100 % válido facilita la integración con APIs y colas de trabajo.
- **Priorización de tickets por urgencia y sentimiento**: las claves `urgency` y `sentiment` permiten priorizar tickets urgentes o con sentimiento negativo. Sin embargo, el análisis cualitativo muestra que el modelo falla sistemáticamente en detectar urgencia baja cuando aparece la frase "Khi nào tiện" (cuando sea conveniente), prediciendo `trung_binh` en lugar de `thap`.
- **Prototipado académico de fine-tuning LoRA**: como entregable de laboratorio, sirve para demostrar el flujo completo de fine-tuning, evaluación con tres líneas base y análisis de regresión. No está pensado para producción.
- **Investigación sobre regresión de capacidades en SFT con pocos datos**: el caso documenta cómo un fine-tune con 250 muestras puede mejorar una métrica específica mientras degrada capacidades generales, útil para estudiar estrategias de mitigación como el replay de datos (1–5 % recomendado por el autor).
- **Comparativa de configuraciones LoRA/QLoRA**: los cuatro experimentos NB4 permiten evaluar el impacto de la posición del adaptador, la tasa de aprendizaje y la cuantización en calidad y VRAM, aunque el autor advierte que ninguna configuración supera la barrera de regresión.

## Benchmarks y rendimiento

El autor midió tres líneas base antes del entrenamiento y el adaptador final, con métricas de target (precisión de objetivo), regression (regresión de capacidades generales), format (validez del JSON) y latencia en ms:

| Ejecución | target | regression | format | latencia (ms) |
|---|---|---|---|---|
| (a) Base + prompt ingenuo | 0.000 | 0.758 | 0.000 | 3223.8 |
| (b) Base + prompt optimizado | 0.765 | 0.758 | 1.000 | 1016.5 |
| (c) Fine-tune LoRA | 0.970 | 0.344 | 1.000 | 1443.4 |

Veredicto del autor: **FAILED**. El incremento de target (+0.205) supera la línea base (b), pero la regresión de capacidades (−0.413 frente a una tolerancia de 0.020) excede 20 veces el límite permitido. La tasa de trazas de pensamiento válidas es 0.0, indicando que el modelo abandonó el bloque `thinking` tras el entrenamiento. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de
