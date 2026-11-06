# plantcad/marin-dna-exp586-1.5B-60M-216B

## Resumen

MarinDNA exp586 1.5B-60M es un modelo de lenguaje especializado en ADN desarrollado por el proyecto PlantCAD/MarinDNA. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de tipo `grug_moe`, exportado en BF16, con 1.591.848.448 parámetros totales y aproximadamente 60,6 millones de parámetros activos por token. El modelo ha sido preentrenado sobre 216.158.699.520 tokens de ADN (equivalentes a 10 épocas sobre el corpus de ADN) y mantiene la longitud de contexto de 8192 tokens.

El modelo parte de un vocabulario de lenguaje original de 128.256 tokens y fuerza las entradas de ADN a caracteres, lo que permite reutilizar la infraestructura de un modelo de lenguaje preentrenado para secuencias genómicas. La relevancia actual radica en la creciente demanda de modelos fundacionales de ADN de resolución de nucleótido único para interpretar genomas de plantas y otras especies, un área donde PlantCAD2 ha establecido benchmarks públicos de evaluación.

Este checkpoint concreto es una exportación de un modelo de investigación (exp586) tras 216B tokens, con licencia Apache 2.0, y forma parte de una familia que incluye una variante de 1T tokens publicada por separado. Está pensado para evaluación e investigación en genómica computacional más que para despliegue de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`grug_moe`), exportado en BF16 |
| Parametros totales | 1.591.848.448 |
| Parametros activos | ~60,6M por token |
| Longitud de contexto | 8192 |
| Tipos de cuantizacion | no disponible (export BF16; no se documentan otras) |
| Idiomas soportados | no disponible (modelo de ADN; vocabulario de lenguaje de 128.256 tokens con entradas de ADN forzadas a caracteres) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (`grug_moe`) de dimensión d768, entrenado con la infraestructura Levanter/Marin sobre 216.158.699.520 tokens de ADN, lo que corresponde a 10 épocas sobre el corpus. El checkpoint final es `step-412290`. La exportación se copia sin cambios desde el archivo de investigación `marin-dna/marin-dna-exp586` (ruta `pretrained-lrm1-seed0`).

Una innovación destacable es el uso de un vocabulario de lenguaje original de 128.256 tokens con entradas de ADN forzadas a caracteres, lo que permite aprovechar un modelo preentrenado de lenguaje para modelar secuencias genómicas. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá del número de tokens y épocas.

## Capacidades

- Modelado de secuencias de ADN a resolución de nucleótido único.
- Generación de texto sobre secuencias genómicas (pipeline de text generation).
- Preentrenamiento de lenguaje adaptado a ADN mediante vocabulario de lenguaje con entradas forzadas a caracteres.
- Contexto de 8192 tokens, adecuado para ventanas genómicas de longitud moderada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (modelo de dominio biológico).

## Casos de uso

- Anotación funcional de genomas de plantas: el modelo puede puntuar y predecir regiones genómicas a resolución de nucleótido único, aprovechando su contexto de 8192 tokens para cubrir ventanas de secuencia amplias.
- Evaluación comparativa con PlantCAD2: sirve como checkpoint de referencia para los benchmarks públicos de PlantCAD2 (PR #22), permitiendo medir el efecto del preentrenamiento de 216B tokens frente a la variante de 1T tokens.
- Investigación en modelos fundacionales de ADN: al ser una exportación BF16 de un run de investigación (exp586), es útil para reproducir y analizar el comportamiento de la arquitectura MoE `grug_moe` en datos genómicos.
- Estudio del efecto de la tokenización por caracteres: permite investigar cómo un vocabulario de lenguaje de 128.256 tokens se adapta a entradas de ADN forzadas a caracteres.
- Experimentos de escalado de datos: comparar este checkpoint de 216B tokens con el de 1T tokens de la misma familia para analizar curvas de escalado en modelado de ADN.
- Base para fine-tuning en tareas genómicas específicas: su licencia Apache 2.0 y formato safetensors facilitan el ajuste fino sobre tareas de clasificación o predicción de elementos genómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados de evaluación de PlantCAD2 (PR #22) y a la issue #586 de MarinDNA, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB solo para pesos (tamaño del repo), más overhead de activaciones y contexto; con contexto de 8192 tokens el consumo real será mayor.
- Cuantización: no se documentan variantes GGUF ni cuantizadas; al ser un export BF16, el despliegue estándar es en precisión completa o media.
- GPU recomendadas: no disponibles de forma específica; por tamaño (1,59B totales, ~60,6M activos) cabe en GPUs de consumo como RTX 4090 en BF16, aunque no se documenta soporte oficial.
- Opciones de despliegue: no se documentan explícitamente; el ecosistema Levanter/Marin sugiere uso con sus propias herramientas. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MarinDNA exp586 1.5B-60M (216B tokens) | 1,59B totales / ~60,6M activos | 8192 | apache-2.0 | Hugging Face (plantcad) |
| MarinDNA exp586 1.5B-60M (1T tokens) | 1,59B totales / ~60,6M activos (misma arquitectura) | no disponible | apache-2.0 | Hugging Face (plantcad), publicado por separado |
| PlantCAD2 | no disponible | contexto extendido | no disponible | Referenciado en publicación científica |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio biológico (ADN); no es un modelo de propósito general y no se documentan capacidades de lenguaje natural, código ni matemáticas.
- Riesgo de alucinación en predicciones genómicas: como todo modelo de lenguaje, puede generar secuencias o anotaciones plausibles pero incorrectas; requiere validación experimental.
- Sesgos: el corpus de entrenamiento se basa en genomas (presumiblemente de plantas, dado el contexto PlantCAD), por lo que puede tener sesgo hacia esas especies y no generalizar a otros organismos.
- Limitaciones de contexto: 8192 tokens, insuficiente para genes o regiones genómicas muy largas sin fragmentación.
- Idiomas: no aplica; el vocabulario de lenguaje se reutiliza con entradas de ADN forzadas a caracteres, lo que puede limitar la interpretación de secuencias no vistas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin benchmarks publicados, no se recomienda para producción sin evaluación previa.
- No se documentan cuantizaciones ni herramientas de despliegue estándar, lo que puede complicar la integración en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/plantcad/marin-dna-exp586-1.5B-60M-216B
- Variante de 1T tokens: https://huggingface.co/plantcad/marin-dna-exp586-1.5B-60M
- Archivo de investigación: https://huggingface.co/marin-dna/marin-dna-exp586/tree/4b8537591261ad14204b28a9c830fa7c6e3f7fbd/pretrained-lrm1-seed0
- Run de entrenamiento (W&B): https://forge.coreweave.com/wandb/plantcad/marin-dna/runs/exp586-plantcad2-d768-pretrained-lrm1-seed0-v1
- Issue MarinDNA #586: https://github.com/Open-Athena/marin-dna/issues/586
- Resultados de evaluación PlantCAD2 (PR #22): https://github.com/plantcad/plantcad2/pull/22
- Publicación PlantCAD2: https://www.sciencedirect.com/science/article/pii/S2666979X26001916
- Organización marin-dna en Hugging Face: https://huggingface.co/marin-dna
