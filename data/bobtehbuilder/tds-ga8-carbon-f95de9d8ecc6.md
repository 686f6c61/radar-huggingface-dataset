# bobtehbuilder/tds-ga8-carbon-f95de9d8ecc6

## Resumen

El modelo `bobtehbuilder/tds-ga8-carbon-f95de9d8ecc6` es un artefacto publicado en Hugging Face por el usuario `bobtehbuilder`, dentro de una serie de repositorios denominados "TDS GA8 — Green AI Carbon Accounting". Su propósito principal no es ofrecer un modelo de IA funcional, sino documentar y contabilizar el impacto ambiental de un proceso de fine-tuning. La model card únicamente incluye métricas de emisiones de CO₂, energía consumida y hardware utilizado, sin especificar arquitectura, parámetros, tareas o capacidades del modelo subyacente.

El repositorio se creó el 28 de agosto de 2026 y no registra descargas ni valoraciones. Toda la información disponible se limita a los metadatos de emisiones: 115,036 kg de CO₂ equivalente, 958,6368 kWh de energía, 391,6 horas de GPU en 6 NVIDIA V100, con un PUE de 1,36 y una intensidad de red de 120 gCO₂eq/kWh en la región `europe-north1`. No se proporciona ningún detalle técnico del modelo en sí, por lo que esta ficha se basa exclusivamente en los datos públicos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el número de parámetros, el dataset de entrenamiento ni el tipo de ajuste (RLHF, DPO, etc.). La única información disponible indica que se realizó un **fine-tuning** sobre hardware NVIDIA V100, con 6 GPUs y un total de 391,6 horas de cómputo. El consumo energético se calculó mediante la fórmula `energy_kWh = TDP x GPUs x hours x PUE / 1000`, con un TDP de 300 W por GPU y un PUE de 1,36, resultando en 958,6368 kWh. Las emisiones de CO₂ se estimaron con `co2_kg = energy_kWh x grid_intensity / 1000`, usando una intensidad de red de 120 gCO₂eq/kWh para la región `europe-north1`, dando 115,036 kg CO₂eq. No se menciona ninguna innovación técnica ni detalles del proceso de entrenamiento.

## Capacidades

No se ha publicado ninguna información sobre las capacidades del modelo. No se puede confirmar si es capaz de generar texto, razonar, escribir código, realizar tool calling, actuar como agente, o soportar múltiples idiomas. La ausencia de una model card funcional impide cualquier afirmación al respecto.

## Casos de uso

No se dispone de información que permita identificar casos de uso concretos. El repositorio parece orientado a la contabilidad de carbono en IA, no a una aplicación práctica de inferencia. Por tanto, no es posible recomendar escenarios de uso sin datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de rendimiento.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 6 GPUs NVIDIA V100 (300 W TDP) durante 391,6 horas. No se especifica la VRAM de cada GPU (la V100 suele tener 16 GB o 32 GB, pero no se confirma).
- **Inferencia**: no se proporcionan requisitos de VRAM, GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría, ya que este repositorio no documenta un modelo funcional sino un registro de emisiones. Los repositorios similares encontrados en la búsqueda web (`bobtehbuilder/tds-ga8-carbon-6ce1163ef72f`, `bobtehbuilder/tds-ga8-carbon-f5ad34f6f655`) parecen seguir el mismo patrón, pero no aportan especificaciones técnicas.

## Limitaciones y advertencias

- **Ausencia total de documentación técnica**: no se especifica arquitectura, parámetros, tareas ni formato de pesos, lo que impide su uso en producción.
- **Licencia no definida**: al no indicarse licencia, no se puede garantizar el uso comercial ni la redistribución.
- **Sin benchmarks ni evaluaciones**: no hay evidencia de rendimiento en ninguna tarea.
- **Riesgo de alucinación y sesgos**: desconocidos, al no existir información sobre el modelo subyacente.
- **Enfoque en contabilidad de carbono**: el repositorio parece un ejercicio de medición de emisiones, no un modelo listo para inferencia. Cualquier uso práctico requeriría contactar al autor para obtener detalles adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f95de9d8ecc6
- Repositorios similares en Hugging Face:
  - https://huggingface.co/bobtehbuilder/tds-ga8-carbon-6ce1163ef72f
  - https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f5ad34f6f655
- Repositorios en GitHub (sin relación confirmada con este modelo):
  - https://github.com/llEclipsell/tds-ga8
  - https://github.com/22f3001797/tds-ga8
