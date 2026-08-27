# dvader13/smollm3-3b-sft-189b

## Resumen

Este repositorio contiene un conjunto de diez checkpoints de supervisado fine-tuning (SFT) del modelo base SmolLM3-3B, correspondientes a diferentes fracciones de dosis de entrenamiento (del 10% al 100%). El autor, dvader13, ha publicado estos checkpoints como parte de un estudio empírico sobre el efecto de la cantidad de datos de SFT en el rendimiento del modelo. El modelo base, desarrollado por Hugging Face, es un transformer decoder-only de 3 mil millones de parámetros con soporte nativo para seis idiomas y una ventana de contexto de hasta 128K tokens. Este repositorio en particular no es un modelo final listo para producción, sino un artefacto de investigación para analizar la dinámica del fine-tuning supervisado.

Cada checkpoint se guarda en formato bf16 y solo contiene pesos de inferencia, sin estado de optimizador. El repositorio ocupa 61.5 GB, lo que sugiere que los diez checkpoints están almacenados completos. La licencia Apache-2.0 permite uso comercial y modificación, pero al ser un conjunto de checkpoints intermedios, su utilidad principal es académica o de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B base) |
| Parametros totales | 3 mil millones (aprox., del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (del modelo base, no confirmado para estos checkpoints) |
| Tipos de cuantizacion | bf16 (formato original de los checkpoints) |
| Idiomas soportados | No disponible (el modelo base soporta 6 idiomas, pero no se especifican en este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints se derivan del modelo SmolLM3-3B, que es un transformer decoder-only con atención causal estándar. El modelo base fue preentrenado con 11 billones de tokens de texto general, seguido de un proceso de post-entrenamiento que incluye mid-training, SFT y DPO (según el alignment-handbook de Hugging Face). En este repositorio, el autor ha tomado un rung de preentrenamiento de 189B tokens (una fracción del preentrenamiento completo) y ha aplicado SFT con diez dosis diferentes, desde el 10% hasta el 100% de los datos de instrucción. Esto permite estudiar cómo varía el rendimiento con la cantidad de datos de fine-tuning, un tema relevante para la investigación en scaling laws de SFT.

No se proporcionan detalles sobre el dataset de SFT utilizado, ni sobre hiperparámetros específicos del entrenamiento. Los checkpoints están en bf16 y solo contienen pesos de inferencia, lo que facilita su carga y evaluación sin necesidad de estado de optimizador.

## Capacidades

- Generacion de texto: al ser un fine-tuning de SmolLM3-3B, hereda la capacidad de generar texto coherente y seguir instrucciones, aunque la calidad depende de la dosis de SFT aplicada.
- Razonamiento y codigo: el modelo base tiene capacidades de razonamiento y generacion de codigo, pero no hay evaluaciones especificas para estos checkpoints.
- Soporte multilingue: el modelo base soporta seis idiomas, pero no se confirma que estos checkpoints mantengan esa cobertura.
- Sin capacidades especiales: no se mencionan tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en scaling laws de SFT: estos checkpoints permiten analizar como el rendimiento del modelo mejora (o satura) con la cantidad de datos de fine-tuning. Un investigador puede evaluar cada fraccion de dosis en benchmarks estandar y trazar curvas de scaling.
- Estudio de transferencia de conocimiento: comparar el comportamiento de los checkpoints con diferentes dosis ayuda a entender si el SFT excesivo degrada la capacidad general del modelo base.
- Reproducibilidad de experimentos: al estar publicados los pesos intermedios, otros grupos pueden reproducir o extender los experimentos sin necesidad de reentrenar desde cero.
- Analisis de robustez: evaluar la estabilidad del modelo ante variaciones en la cantidad de datos de instruccion, util para disenar pipelines de fine-tuning mas eficientes.
- Educacion y formacion: estos checkpoints sirven como material didactico para ensenar conceptos de fine-tuning y scaling laws en cursos de machine learning.
- Desarrollo de tecnicas de regularizacion: los datos pueden usarse para probar metodos que mitiguen el sobreajuste en SFT, comparando el rendimiento entre dosis bajas y altas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para estos checkpoints especificos. El modelo base SmolLM3-3B tiene resultados publicados por Hugging Face, pero no se incluyen en este repositorio ni en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint en bf16 ocupa aproximadamente 6 GB (3B parametros x 2 bytes). Para cargar un solo checkpoint se recomienda una GPU con al menos 8 GB de VRAM, aunque 12 GB ofrecen margen para activaciones y overhead.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) para trabajar comodamente con un checkpoint. Para cargar los diez checkpoints simultaneamente se necesitarian mas de 60 GB de VRAM, lo que requiere multiples GPUs o un entorno con memoria unificada.
- Opciones de despliegue: al ser checkpoints en safetensors, se pueden cargar con transformers, vLLM, llama.cpp (si se convierten a GGUF) u Ollama. Sin embargo, al ser artefactos de investigacion, no se recomienda su uso en produccion.
- Latencia y throughput: no disponible. Depende del hardware y del framework de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Hugging Face |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B | 3B | 32K | Apache-2.0 | Hugging Face |

Este repositorio no es un modelo independiente, sino una variante de SmolLM3-3B con diferentes grados de SFT. No se dispone de datos de rendimiento para comparar directamente con las alternativas. La principal diferencia es que estos checkpoints son experimentales y no estan optimizados para uso general.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de SmolLM3-3B, puede heredar sesgos presentes en los datos de preentrenamiento, aunque no se han evaluado especificamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente con dosis bajas de SFT donde la alineacion con instrucciones es menor.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha verificado que estos checkpoints mantengan esa capacidad tras el SFT.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero al ser checkpoints intermedios, no hay garantias de calidad ni soporte.
- Caveat para produccion: no se recomienda su uso en sistemas en produccion sin una evaluacion exhaustiva. Son artefactos de investigacion, no modelos finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-189b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Tutorial de SFT con SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Alignment Handbook (recetas para SmolLM3): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Ficha de SmolLM3-3B en atomic.chat: https://atomic.chat/models/smollm3-3b
