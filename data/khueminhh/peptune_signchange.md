# khueminhh/PepTune_signchange

## Resumen

PepTune es un modelo generativo de difusión discreta enmascarada (masked discrete diffusion) diseñado para la generación *de novo* de péptidos terapéuticos. Lo desarrollan Sophia Tang, Yinuo Zhang y Pranam Chatterjee (Chatterjee Lab), y se publicó en ICML 2025. El modelo aborda un problema concreto de diseño de fármacos: generar secuencias peptídicas que optimicen simultáneamente varias propiedades terapéuticas (afinidad de unión, permeabilidad de membrana, solubilidad, resistencia a la bioincrustación y ausencia de hemólisis), en lugar de optimizar una sola propiedad de forma aislada.

La innovación central es la combinación de un modelo de difusión discreta enmascarada (construido parcialmente sobre el repositorio MDLM de Sahoo et al.) con una búsqueda en árbol de Montecarlo (MCTS) guiada por un frente de Pareto. El backbone es un transformer RoFormer con 768 dimensiones ocultas, 8 capas y 12 cabezas de atención, entrenado sobre un conjunto de 11 millones de secuencias peptídicas en formato SMILES.

Es relevante ahora porque demuestra que la generación guiada multiobjetivo con MCTS sobre difusión discreta puede aplicarse a un dominio científico con restricciones duras (propiedades fisicoquímicas y biológicas), un patrón que está ganando tracción en el diseño generativo de moléculas y proteínas. El repositorio se publica bajo licencia Apache 2.0, aunque los pesos se distribuyen vía Google Drive y no como archivos en el propio Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer RoFormer (backbone) + difusión discreta enmascarada (MDLM) + MCTS guiado por Pareto |
| Parametros totales | no disponible (backbone: 768 hidden, 8 capas, 12 cabezas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación condicionada por longitud de secuencia, p. ej. 100 residuos) |
| Tipos de cuantizacion | no disponible (entrenamiento en fp64) |
| Idiomas soportados | no aplica (modelo de dominio científico; secuencias peptídicas en SMILES) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints propios (no safetensors ni GGUF); distribuidos vía Google Drive |

## Arquitectura y entrenamiento

El modelo se basa en un backbone RoFormer con 768 dimensiones ocultas, 8 capas y 12 cabezas de atención, sobre el que se aplica un esquema de difusión discreta enmascarada (masked discrete diffusion) heredado del repositorio MDLM (Sahoo et al. 2024). El proceso generativo parte de secuencias enmascaradas y las refina iterativamente mediante un horario de ruido configurable (loglinear, logpoly). La tokenización usa un tokenizador SMILES SPE con vocabulario propio (`new_vocab.txt`, `new_splits.txt`).

El entrenamiento se realizó sobre un conjunto de 11 millones de secuencias peptídicas en formato SMILES, con *dynamic batching* por longitud, optimizador AdamW (lr=3e-4, weight_decay=0.075) y precisión fp64. La innovación principal es la capa de generación: un MCTS que guía la difusión hacia un conjunto de secuencias no dominadas en el frente de Pareto, evaluadas por cinco predictores de propiedades terapéuticas (afinidad de unión mediante transformer de atención cruzada, solubilidad con XGBoost, permeabilidad, no-fouling y no-hemólisis). El repositorio incluye también un script de generación incondicional.

## Capacidades

- Generación *de novo* de secuencias peptídicas en formato SMILES.
- Generación condicionada a proteína diana mediante secuencia de aminoácidos (`+prot_seq`) y nombre (`+prot_name`).
- Optimización multiobjetivo guiada por MCTS sobre un frente de Pareto de propiedades terapéuticas.
- Evaluación integrada de cinco propiedades: afinidad de unión, solubilidad, permeabilidad, no-fouling y no-hemólisis.
- Generación incondicional de péptidos (`generate_unconditional.py`).
- Soporte de proteínas diana predefinidas: AMHR, TfR, GFAP, GLP-1R, GLAST, NCAM, Cereblon, E3 ubiquitin ligasa, Skp2, p53 y EGFP.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; es un modelo de dominio específico para biología computacional.

## Casos de uso

- Diseño de péptidos dirigidos a dianas terapéuticas validadas: usar `generate_mcts.sh` con la diana (p. ej. `glp1` para el receptor GLP-1) y longitud deseada para obtener candidatos optimizados en afinidad y permeabilidad simultáneamente.
- Descubrimiento de ligandos para dianas de interés en oncología: la diana `p53` o `skp2` permite generar péptidos con restricciones de unión y estabilidad.
- Diseño de péptidos con requisitos de administración oral: la optimización conjunta de solubilidad y permeabilidad de membrana es adecuada para candidatos que deben atravesar barreras biológicas.
- Reducción de toxicidad en fases tempranas: la inclusión de la propiedad de no-hemólisis en el frente de Pareto permite filtrar candidatos con menor riesgo hematológico antes de síntesis.
- Generación de péptidos para aplicaciones de direccionamiento a tejido neural: las dianas GFAP, GLAST y NCAM están orientadas a astrocitos y células neurales.
- Exploración de espacio químico con generación incondicional: usar `generate_unconditional.py` para muestrear péptidos diversos y posteriormente filtrarlos con los predictores incluidos.
- Investigación en métodos generativos: el código permite sustituir el conjunto de objetivos o añadir predictores propios, útil para estudiar el efecto del MCTS sobre la difusión discreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El backbone (768 hidden, 8 capas, 12 cabezas) es de tamaño moderado, pero no se especifican requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el entrenamiento usa fp64, lo que incrementa los requisitos de memoria frente a fp32/fp16.
- Opciones de despliegue: scripts propios del repositorio (`train_peptune.py`, `generate_mcts.py`, `generate_unconditional.py`) con entorno Conda (`src/environment.yml`) y configuración Hydra. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PepTune | Difusión discreta + MCTS multiobjetivo | no disponible | no disponible | Apache 2.0 | Pesos vía Google Drive |
| MDLM (Sahoo et al. 2024) | Difusión discreta enmascarada (base) | no disponible | no disponible | no disponible en esta ficha | Repositorio público |
| Modelos de difusión molecular genéricos | Difusión sobre grafos/SMILES | no disponible | no disponible | variable | variable |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. PepTune se distingue de MDLM por añadir la capa de MCTS guiada por Pareto y los cinco predictores de propiedades terapéuticas.

## Limitaciones y advertencias

- El repositorio en Hugging Face tiene 0 GB y 0 descargas; los pesos reales se distribuyen vía Google Drive, no como artefactos del Hub.
- No se documentan sesgos del modelo; al ser un modelo de dominio científico, el riesgo principal es la generación de péptidos con propiedades predichas pero no validadas experimentalmente.
- Los predictores de propiedades son modelos aproximados; las puntuaciones de afinidad, solubilidad, permeabilidad, no-fouling y no-hemólisis no sustituyen la validación *in vitro* o *in vivo*.
- No hay información sobre idiomas ni contexto conversacional porque el modelo no es lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero los pesos y datos se alojan en Google Drive sin garantías de disponibilidad a largo plazo.
- El entrenamiento en fp64 y la dependencia de MCTS pueden implicar costes computacionales elevados no cuantificados.
- No se especifican limitaciones de longitud de secuencia más allá del ejemplo de 100 residuos.

## Enlaces

- Hugging Face: https://huggingface.co/khueminhh/PepTune_signchange
- Paper PepTune (arXiv 2412.17780): https://arxiv.org/abs/2412.17780
- Paper MDLM (arXiv 2406.07524): https://arxiv.org/abs/2406.07524
- Repositorio MDLM: https://github.com/kuleshov-group/mdlm
- Web de Sophia Tang: https://sophtang.github.io/
- LinkedIn de Yinuo Zhang: https://www.linkedin.com/in/yinuozhang98/
- Chatterjee Lab: https://www.chatterjeelab.com/
- Checkpoint PepTune (Google Drive): https://drive.google.com/file/d/1oXGDpKLNF0KX0ZdOcl1NZj5Czk2lSFUn/view?usp=sharing
- Modelo de afinidad de unión (Google Drive): https://drive.google.com/file/d/128shlEP_-rYAxPgZRCk_n0HBWVbOYSva/view?usp=sharing
- Dataset de péptidos (Google Drive): https://drive.google.com/file/d/1yCDr641WVjCtECg3nbG0nsMNu8j7d7gp/view?usp=drive_link
