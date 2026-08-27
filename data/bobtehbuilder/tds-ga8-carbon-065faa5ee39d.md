# bobtehbuilder/tds-ga8-carbon-065faa5ee39d

## Resumen

El repositorio `bobtehbuilder/tds-ga8-carbon-065faa5ee39d` no contiene un modelo de inteligencia artificial en el sentido convencional, sino un registro de contabilidad de emisiones de carbono asociado a un proceso de fine-tuning. Publicado por el usuario `bobtehbuilder` en agosto de 2026, este artefacto documenta el impacto ambiental de un entrenamiento realizado con 7 GPUs NVIDIA RTX 4090 durante 29,4 horas en la región `us-east1`, con un total de 56,399 kg de CO₂ equivalente. La model card incluye los cálculos de energía consumida (134,2845 kWh) y las emisiones derivadas, siguiendo la metodología de CodeCarbon.

Este tipo de publicaciones responde a la creciente demanda de transparencia en el consumo energético y la huella de carbono de los modelos de IA, especialmente en el contexto de la IA verde (Green AI). No se proporciona información sobre la arquitectura, los parámetros, el contexto o las capacidades del modelo subyacente que fue fine-tuneado; el repositorio se limita exclusivamente a los datos de emisiones y al hardware utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica el modelo base) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No aplica (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo que fue fine-tuneado. La model card únicamente detalla el proceso de entrenamiento desde la perspectiva del consumo energético: se emplearon 7 GPUs NVIDIA RTX 4090 (cada una con un TDP de 450 W) durante 29,4 horas, con un PUE (Power Usage Effectiveness) de 1,45 en el centro de datos de la región `us-east1`, cuya intensidad de red es de 420 gCO₂eq/kWh. El cálculo de energía se realiza mediante la fórmula `TDP × GPUs × horas × PUE / 1000`, resultando en 134,2845 kWh, y las emisiones se obtienen multiplicando por la intensidad de red, dando 56,399 kg CO₂eq. No se mencionan técnicas como RLHF, DPO ni ninguna innovación arquitectónica.

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación de texto, razonamiento, código, visión u otras tareas de IA.
- El contenido se limita a un registro de emisiones de carbono, sin funcionalidad de inferencia ni API.
- No se incluyen pesos, tokenizadores ni configuraciones de modelo.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el registro puede utilizarse como referencia para calcular y reportar la huella de carbono de procesos de fine-tuning similares, siguiendo la metodología de CodeCarbon.
- Transparencia en publicaciones científicas: investigadores que deseen acompañar sus modelos con datos de emisiones pueden usar este ejemplo como plantilla para documentar el impacto ambiental de sus propios entrenamientos.
- Comparación de eficiencia energética: los datos de consumo (kWh) y emisiones (kg CO₂eq) permiten comparar la eficiencia de diferentes configuraciones de hardware y regiones de cómputo.
- Cumplimiento normativo: organizaciones que necesiten reportar el impacto ambiental de sus cargas de trabajo de IA pueden utilizar estos datos como evidencia en informes de sostenibilidad.
- Optimización de recursos: los valores de GPU-hours y energía pueden servir para estimar costes energéticos y decidir entre distintas opciones de despliegue (por ejemplo, cambiar de región o de hardware).
- Educación y divulgación: el ejemplo ilustra de forma concreta cómo calcular las emisiones de un entrenamiento, útil para cursos de IA responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento del modelo subyacente, ya que su propósito es únicamente la contabilidad de carbono.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPUs NVIDIA RTX 4090 (450 W TDP cada una), con un total de 29,4 GPU-hours.
- No se especifican requisitos de VRAM para inferencia, ya que no se distribuye ningún modelo.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay modelo que servir.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este repositorio no es un modelo de IA sino un registro de emisiones. Otros repositorios similares en Hugging Face (por ejemplo, `bobtehbuilder/tds-ga8-carbon-61a7a6af9b65` o `bobtehbuilder/tds-ga8-carbon-f5ad34f6f655`) parecen seguir el mismo patrón de contabilidad de carbono, pero no se dispone de datos suficientes para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para inferencia, generación de texto, clasificación ni ninguna tarea de machine learning.
- Ausencia de información sobre el modelo base: se desconoce qué arquitectura se fine-tuneó, lo que impide evaluar su rendimiento o aplicabilidad.
- Datos de emisiones específicos de un entorno concreto: los valores de energía y CO₂ dependen de la región (`us-east1`), del hardware y del PUE; no son generalizables a otros contextos sin recalcular.
- Licencia no especificada: no se indica bajo qué términos se distribuye este registro, lo que limita su reutilización legal.
- Sin actualizaciones ni mantenimiento: el repositorio fue creado y actualizado el mismo día, sin evidencia de soporte posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-065faa5ee39d
- Repositorio similar (mismo autor): https://huggingface.co/bobtehbuilder/tds-ga8-carbon-61a7a6af9b65
- Repositorio similar (mismo autor): https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f5ad34f6f655
- Repositorio de GitHub relacionado (posible proyecto TDS GA8): https://github.com/22f3001797/tds-ga8
