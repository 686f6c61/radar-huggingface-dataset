# deeepakkk00/tds-carbon-card

## Resumen

El repositorio `deeepakkk00/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning de un modelo no especificado. Forma parte de una práctica académica (TDS GA8) que documenta el consumo energético y las emisiones de CO₂ equivalente generadas durante el entrenamiento. El autor, `deeepakkk00`, publica esta model card como un ejercicio de transparencia ambiental, siguiendo las directrices de Green AI.

La relevancia de este tipo de documentación radica en la creciente demanda de informes de sostenibilidad en el sector de la IA. Aunque no aporta capacidades técnicas de modelo, sirve como ejemplo de cómo registrar la huella de carbono de un entrenamiento, con datos concretos de hardware, energía y emisiones. En este caso, se utilizaron 6 GPUs NVIDIA RTX 4090 en la región europe-west4, con un total de 275,5 horas de GPU y 967,005 kWh de energía, resultando en 193,401 kg de CO₂eq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo subyacente, ya que este repositorio únicamente documenta el proceso de fine-tuning. Según la model card, el entrenamiento se realizó con 6 GPUs NVIDIA RTX 4090, en modo fine-tuning, durante 275,5 horas de GPU (con un PUE de 1,3). El consumo total de energía fue de 967,005 kWh, lo que generó 193,401 kg de CO₂eq, calculados mediante la herramienta CodeCarbon. No se especifican datos sobre el dataset, el número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- No aplica: este repositorio no contiene un modelo funcional ni capacidades de generación, razonamiento, código, visión o audio.
- Su función es documental: registrar la huella de carbono de un entrenamiento específico.
- Puede servir como plantilla para otras iniciativas de contabilidad ambiental en IA.

## Casos de uso

- Cumplimiento de políticas de sostenibilidad: empresas que necesitan reportar las emisiones de sus entrenamientos de modelos pueden usar este formato como referencia.
- Auditoría interna de consumo energético: equipos de MLOps pueden replicar esta metodología para medir el impacto de sus propios fine-tunings.
- Investigación académica: estudiantes e investigadores pueden analizar estos datos para estudiar la relación entre hardware, energía y emisiones.
- Transparencia pública: organizaciones que publican model cards de carbono para cumplir con estándares como el de Green Web Foundation.
- Comparación de eficiencia: al existir repositorios similares (por ejemplo, con GPUs A100), se pueden comparar costes ambientales entre distintos hardware.
- Educación en Green AI: sirve como caso práctico en cursos sobre IA responsable y computación sostenible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelo, solo datos de emisiones.

## Requisitos de hardware

- No aplica para inferencia, ya que no se distribuye ningún modelo.
- El entrenamiento documentado utilizó 6 GPUs NVIDIA RTX 4090.
- No se especifican requisitos de VRAM ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Los datos de energía y emisiones pueden ser útiles para estimar costes de entrenamiento en hardware similar.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no se puede comparar con alternativas de la misma categoría. Existen otros repositorios de contabilidad de carbono (por ejemplo, `23f3001222/tds-carbon-card` con GPUs A100 y pre-training), pero no son modelos comparables en términos de capacidades.

## Limitaciones y advertencias

- No contiene ningún modelo entrenado ni pesos, por lo que no es utilizable para tareas de IA.
- La licencia no está especificada, lo que limita su reutilización legal.
- Los datos de emisiones dependen de la metodología de CodeCarbon y del PUE declarado; pueden no ser directamente comparables con otros estudios.
- No se indica el modelo base ni el dataset, lo que impide evaluar la relevancia del fine-tuning.
- Para producción, este repositorio no ofrece ninguna funcionalidad práctica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/deeepakkk00/tds-carbon-card
- Repositorio similar (referencia): https://huggingface.co/23f3001222/tds-carbon-card
- Artículo sobre model cards de carbono: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
- Explicación de AI model cards: https://aibuzz.blog/ai-model-cards-explained/
