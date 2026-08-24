# bobtehbuilder/tds-ga8-carbon-c82082acff79

## Resumen

Este repositorio de HuggingFace, identificado como `bobtehbuilder/tds-ga8-carbon-c82082acff79`, no contiene un modelo de inteligencia artificial funcional, sino una **model card de emisiones de carbono** asociada a un proceso de fine-tuning. El autor, `bobtehbuilder`, ha publicado una serie de tarjetas similares (con sufijos hexadecimales distintos) que documentan el impacto ambiental de entrenamientos concretos, siguiendo la iniciativa "TDS GA8 — Green AI Carbon Accounting". La tarjeta reporta un total de 30,825 kg de CO₂ equivalente emitidos durante el entrenamiento, calculados a partir del consumo energético estimado (154,12 kWh) y la intensidad de la red eléctrica de la región `europe-west4` (200 gCO₂eq/kWh).

No se proporciona ninguna información sobre la arquitectura, el tamaño, los parámetros, el contexto o las capacidades del modelo subyacente. De hecho, no hay archivos de pesos, tokenizadores ni configuración; únicamente existe el README con los datos de emisiones. Por tanto, esta ficha no puede describir un modelo de IA, sino que documenta un artefacto de contabilidad ambiental. Es relevante como ejemplo de transparencia en el cálculo de la huella de carbono de entrenamientos de IA, pero no como un modelo utilizable para tareas de generación, razonamiento o código.

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
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (si es transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento, el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La única información disponible se refiere al proceso de fine-tuning: se utilizaron 5 GPUs NVIDIA T4 (con un TDP de 70 W cada una) durante 316,8 horas, con un PUE de 1,39, en la región `europe-west4`. El cálculo de energía se realiza mediante la fórmula `energy_kWh = TDP x GPUs x hours x PUE / 1000`, resultando en 154,12 kWh, y las emisiones se obtienen multiplicando por la intensidad de la red (200 gCO₂eq/kWh), dando 30,825 kg CO₂eq. No hay ninguna innovación técnica descrita ni detalles sobre el proceso de entrenamiento en sí.

## Capacidades

No se ha documentado ninguna capacidad del modelo. Al no existir pesos ni configuración, no es posible afirmar que el modelo pueda generar texto, razonar, escribir código, realizar tool calling, actuar como agente, o tener capacidades multilingües o multimodales. La model card únicamente reporta métricas de emisiones, no funcionalidades.

## Casos de uso

No se pueden enumerar casos de uso prácticos, ya que el repositorio no contiene un modelo ejecutable. Los únicos usos posibles de este artefacto son:

- **Auditoría ambiental de entrenamientos de IA**: la model card sirve como registro estandarizado de emisiones de CO₂ para un proceso de fine-tuning concreto, útil para organizaciones que necesitan reportar su huella de carbono.
- **Investigación sobre Green AI**: los datos de emisiones (hardware, horas, PUE, intensidad de red) pueden utilizarse en estudios comparativos sobre el coste energético de distintos entrenamientos.
- **Transparencia en publicación de modelos**: como ejemplo de buenas prácticas, esta tarjeta demuestra cómo documentar el impacto ambiental junto a un modelo, aunque en este caso no se adjunta el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación de capacidades, dado que no se trata de un modelo funcional.

## Requisitos de hardware

- **Hardware de entrenamiento reportado**: 5 GPUs NVIDIA T4 (70 W TDP cada una), 316,8 GPU horas, PUE 1,39.
- **Hardware de inferencia**: no disponible, ya que no hay modelo que ejecutar.
- **VRAM estimada**: no disponible.
- **Opciones de despliegue**: no aplicable.

## Comparativa con modelos similares

No disponible. No existe información sobre el modelo subyacente ni sobre alternativas comparables. Los repositorios hermanos del mismo autor (`tds-ga8-carbon-aaed585dd318`, `tds-ga8-carbon-f5ad34f6f655`, etc.) siguen la misma estructura de model card de emisiones, pero no se puede comparar rendimiento ni arquitectura.

## Limitaciones y advertencias

- **No es un modelo de IA**: el repositorio no contiene pesos, tokenizadores ni configuración; es únicamente una tarjeta de emisiones de carbono.
- **Datos de emisiones estimados**: los valores de CO₂ se calculan mediante fórmulas basadas en TDP y PUE, no miden el consumo real de energía. Pueden existir desviaciones significativas respecto al consumo efectivo.
- **Sin licencia**: no se especifica ninguna licencia, lo que impide cualquier uso legal claro del contenido (aunque al no haber modelo, el impacto es limitado).
- **Sin información de sesgos o alucinaciones**: al no existir modelo, no se pueden evaluar riesgos de sesgo, alucinación o limitaciones de contexto.
- **Fecha de creación futura**: el repositorio está fechado en agosto de 2026, lo que sugiere que podría ser un artefacto de prueba o simulación, no un modelo real en producción.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-c82082acff79)
- [Repositorio hermano: tds-ga8-carbon-aaed585dd318](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-aaed585dd318)
- [Repositorio hermano: tds-ga8-carbon-f5ad34f6f655](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f5ad34f6f655)
- [Repositorio hermano: tds-ga8-carbon-f00b19c42a31](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f00b19c42a31)
- [Repositorio hermano: tds-ga8-carbon-d492d73c3479](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-d492d73c3479)
- [Repositorio hermano: tds-ga8-carbon-f29a6f980e7e](https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f29a6f980e7e)
