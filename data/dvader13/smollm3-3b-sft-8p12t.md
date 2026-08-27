# dvader13/smollm3-3b-sft-8p12t

## Resumen

Este repositorio contiene checkpoints de supervisión fina (SFT) del modelo SmolLM3-3B, publicados por el usuario dvader13 bajo licencia Apache 2.0. Se trata de diez fracciones de dosis de entrenamiento (del 10% al 100% del proceso SFT) que permiten estudiar la evolución del modelo a lo largo del ajuste fino supervisado, partiendo del checkpoint de pretraining con 8,12 billones de tokens. Los pesos están en formato bf16 y solo incluyen estado de inferencia, sin estado de optimizador.

El modelo base SmolLM3-3B es un decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face en 2025, con soporte nativo para seis idiomas, contexto de hasta 128K tokens y un pipeline de post-entrenamiento en tres etapas (mid-training, SFT y DPO). Este repositorio concreto es un artefacto de investigación: permite analizar cómo se comporta el modelo en distintos puntos intermedios del proceso SFT, lo que resulta relevante para quienes estudian dinámicas de entrenamiento, interpretabilidad o necesitan calibrar la cantidad de ajuste fino adecuada para sus tareas.

La relevancia actual reside en que SmolLM3-3B es uno de los modelos pequeños más capaces en su rango, y disponer de checkpoints intermedios de SFT abre la puerta a investigaciones sobre regularización, olvido catastrófico y curvas de rendimiento durante el ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (SmolLM3-3B) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | 6 idiomas nativos (según documentacion del modelo base; el repositorio no los especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only de 3 mil millones de parámetros, entrenado con un pipeline de tres etapas: pretraining con 8,12 billones de tokens, mid-training para extender contexto a 128K tokens, y post-entrenamiento con SFT y DPO (este último basado en APO, *alignment preference optimization*). El SFT incorpora modos de razonamiento dual, lo que permite al modelo alternar entre respuestas directas y cadenas de razonamiento explícitas.

Este repositorio en concreto contiene 10 checkpoints intermedios del proceso SFT, desde `checkpoint_pct010` (10% del entrenamiento SFT) hasta `checkpoint_pct100` (100%). Todos están en bf16 y solo contienen el estado de inferencia, sin el estado del optimizador, por lo que no se pueden reanudar entrenamientos desde ellos. No se ha publicado información sobre el dataset exacto usado en este SFT concreto, pero el modelo base se entrenó con el pipeline documentado en el *alignment-handbook* de Hugging Face.

## Capacidades

- Generación de texto y razonamiento de propósito general, con capacidad de alternar entre modo de razonamiento explícito y respuestas directas.
- Soporte de contexto largo (128K tokens) para tareas que requieren ventanas extensas, como análisis de documentos largos o conversaciones multi-turno.
- Capacidades multilingües: soporte nativo de seis idiomas (el conjunto exacto no se especifica en la documentación disponible, aunque el modelo base de Hugging Face soporta inglés, francés, alemán, español, italiano y portugués).
- No hay información sobre tool calling o function calling en la documentación disponible del modelo base, aunque modelos de la familia SmolLM3 suelen incluir esta capacidad en versiones recientes.
- Como checkpoint SFT intermedio, no está diseñado para uso directo en producción: se recomienda evaluar qué fracción ofrece el mejor balance para cada tarea específica.

## Casos de uso

- Investigación sobre dinámicas de aprendizaje: los checkpoints intermedios permiten estudiar la curva de rendimiento durante SFT, identificando en qué punto el modelo alcanza el equilibrio entre capacidad y sobreajuste. Se usaría evaluando cada fracción en un benchmark fijo y trazando la evolución.
- Estudio de olvido catastrófico: comparar el rendimiento de cada checkpoint en tareas de pretraining (por ejemplo, conocimientos generales) frente a tareas de SFT permite medir cómo el ajuste fino degrada habilidades preexistentes.
- Calibración de hiperparámetros: si se está entrenando un modelo propio con SFT, estos checkpoints sirven como referencia empírica para decidir el número de épocas o pasos de entrenamiento adecuados.
- Fine-tuning posterior desde un punto intermedio: aunque el repositorio no incluye estado de optimizador, se puede cargar un checkpoint intermedio como inicialización para un entrenamiento adicional con otro dataset, explorando si partir de una fracción parcial mejora los resultados.
- Evaluación de curvas de rendimiento en tareas específicas: seleccionar el checkpoint que mejor se comporte en una tarea concreta (por ejemplo, generación de código o resumen) puede servir como alternativa a entrenar un modelo completo desde cero.
- Reproducibilidad de experimentos: dado que los pesos están disponibles en formato abierto y con licencia Apache-2.0, se pueden reproducir experimentos de otros grupos que hayan usado estos checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para estos checkpoints SFT en la información disponible. El modelo base SmolLM3-3B reporta resultados en benchmarks como MMLU, HumanEval y GSM8K en su documentación oficial, pero este repositorio no incluye métricas de rendimiento para las distintas fracciones de SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 6 GB (3B parámetros × 2 bytes). En cuantización de 8 bits cabría en unos 3-4 GB, y en 4 bits en unos 2 GB, aunque no se han publicado cuantizaciones específicas para este repositorio.
- GPU recomendadas: una RTX 3090, RTX 4090 o A10 de 24 GB es suficiente para inferencia con contexto largo (128K tokens). Para cargas de trabajo con contexto máximo, se recomienda una A100 o H100 de 80 GB.
- Sí cabe en GPU de consumo: una RTX 4060 de 8 GB puede ejecutar inferencia con contexto moderado (hasta 32K tokens) y cuantización de 8 bits.
- Opciones de despliegue: al ser pesos safetensors estándar, se puede usar con vLLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte previamente), o Hugging Face Transformers.
- Latencia y throughput estimados: no disponibles para este repositorio; el modelo base SmolLM3-3B en una RTX 4090 genera aproximadamente 40-60 tokens por segundo en bf16 con contexto corto, pero no hay datos específicos para estos checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Hugging Face |
| dvader13/smollm3-3b-sft-8p12t (este repositorio) | 3B | 128K | Apache-2.0 | Hugging Face |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 License | Hugging Face |
| Qwen2.5-3B | 3B | 128K | Apache-2.0 | Hugging Face |

La comparativa directa con alternativas es limitada porque este repositorio no ofrece un modelo final optimizado para uso directo, sino checkpoints intermedios de SFT. Para producción, el modelo base SmolLM3-3B (con SFT y DPO completos) es la opción recomendada. Qwen2.5-3B ofrece una licencia Apache-2.0 similar y rendimiento comparable en tareas de código y matemáticas, mientras que Llama-3.2-3B tiene restricciones de licencia más estrictas para uso comercial.

## Limitaciones y advertencias

- Los checkpoints son fracciones intermedias del proceso SFT, no el modelo final: el checkpoint al 100% no equivale necesariamente al SmolLM3-3B final con DPO, ya que este repositorio solo cubre la etapa SFT.
- No incluyen estado de optimizador, por lo que no se puede reanudar el entrenamiento desde estos checkpoints.
- El rendimiento en tareas reales puede ser inferior al del modelo base completo, especialmente en las fracciones tempranas (10-40%), donde el ajuste fino está incompleto.
- No hay información sobre sesgos específicos de estos checkpoints; el modelo base puede presentar sesgos heredados de los datos de pretraining.
- Riesgo de alucinación en tareas de razonamiento complejo o factualidad, especialmente en las fracciones más tempranas del SFT.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda citar la fuente original del modelo base (SmolLM3-3B de Hugging Face) al publicar trabajos derivados.
- No hay documentación de los idiomas exactos soportados en este repositorio, aunque el modelo base soporta seis idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dvader13/smollm3-3b-sft-8p12t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Alignment handbook (recetas de entrenamiento SmolLM3): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Documentación adicional de SmolLM3-3B: https://atomic.chat/models/smollm3-3b
