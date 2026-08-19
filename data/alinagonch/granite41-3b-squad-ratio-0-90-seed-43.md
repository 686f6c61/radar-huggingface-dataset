# AlinaGonch/granite41-3b-squad-ratio-0.90-seed-43

## Resumen

Este modelo, publicado por AlinaGonch, es un ajuste fino (fine-tuning) del modelo base `ibm/granite-4.1-3b` sobre el dataset SQuAD (Stanford Question Answering Dataset). El nombre del repositorio sugiere que se empleó una configuración con ratio 0.90 y semilla 43, aunque no se documentan los detalles exactos del procedimiento. Se trata de un experimento de adaptación de un modelo de lenguaje instructivo a tareas de preguntas y respuestas extractivas.

La relevancia de este modelo radica en explorar cómo un modelo compacto de 3 000 millones de parámetros, originalmente diseñado para instrucciones generales y funciones empresariales, se comporta tras un ajuste fino en un dataset clásico de comprensión lectora. La ficha original es una plantilla vacía con campos sin rellenar, por lo que gran parte de la información técnica no está disponible. El repositorio contiene únicamente 0.1 GB de peso en formato safetensors, lo que sugiere que se trata de un checkpoint de tamaño reducido, posiblemente con pesos parciales o cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en `ibm/granite-4.1-3b`, sin confirmar) |
| Parametros totales | No disponible (se infiere ~3 000 millones por el nombre) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128 000 tokens, pero este ajuste no lo especifica) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, sin indicación de cuantización) |
| Idiomas soportados | No disponible (el modelo base soporta 12 idiomas, pero este ajuste no lo documenta) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `granite-4.1-3b` de IBM es un transformer decoder-only con 3 000 millones de parámetros, diseñado para seguir instrucciones y ejecutar tareas empresariales como resumen, extracción de texto, clasificación y llamada a funciones. Soporta una ventana de contexto de 128 000 tokens y está entrenado en 12 idiomas. Este ajuste fino, según el nombre del repositorio, se realizó sobre el dataset SQuAD, un corpus de preguntas y respuestas basado en artículos de Wikipedia. El término "ratio-0.90" podría referirse a la proporción de datos utilizados o a un hiperparámetro de entrenamiento, y "seed-43" a la semilla aleatoria. No se dispone de información sobre el método de ajuste (por ejemplo, LoRA, fine-tuning completo), las épocas, la tasa de aprendizaje ni el régimen de precisión. Tampoco se indica si se emplearon técnicas de alineación como RLHF o DPO.

## Capacidades

- No se dispone de una descripción oficial de las capacidades de este ajuste específico.
- Basándose en el modelo base `granite-4.1-3b`, se espera que herede capacidades de generación de texto, comprensión de instrucciones, razonamiento básico y soporte multilingüe.
- Al estar ajustado sobre SQuAD, es plausible que esté especializado en preguntas y respuestas extractivas (localizar la respuesta en un pasaje), aunque no hay confirmación.
- El modelo base soporta llamada a funciones (function calling) y tareas de agente, pero no se sabe si este ajuste conserva esas habilidades.
- No se han documentado capacidades multimodales (visión, audio) ni modos de razonamiento especiales.

## Casos de uso

- **Extracción de respuestas en documentos**: si el ajuste funciona como se espera, podría emplearse para localizar respuestas concretas en pasajes de texto, por ejemplo en motores de búsqueda interna o asistentes de documentación.
- **Prototipado de sistemas de QA**: investigadores podrían usar este checkpoint como punto de partida para experimentos de preguntas y respuestas sin necesidad de entrenar desde cero.
- **Evaluación de técnicas de fine-tuning**: al ser un experimento con parámetros documentados en el nombre (ratio y seed), sirve para comparar configuraciones de ajuste en modelos pequeños.
- **Asistentes de soporte técnico**: integrado en un pipeline de recuperación aumentada (RAG), podría extraer respuestas de manuales o bases de conocimiento.
- **Análisis de comprensión lectora**: útil para tareas académicas o de investigación donde se requiera medir la capacidad de un modelo compacto en benchmarks de QA.
- **Educación y aprendizaje**: como ejemplo didáctico de cómo adaptar un modelo instructivo a una tarea específica con un dataset clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de SQuAD (EM, F1) para este ajuste.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 3 000 millones de parámetros, en fp16 se requieren aproximadamente 6 GB de VRAM; en int8, unos 3 GB; en int4, unos 2 GB. Sin embargo, al no conocerse el estado exacto de los pesos (si están cuantizados o no), estas cifras son orientativas.
- **GPU recomendadas**: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo en fp16. GPUs profesionales como A10, A100 o H100 también son válidas.
- **¿Cabe en GPU de consumo?**: sí, un modelo de 3B es ejecutable en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización.
- **Opciones de despliegue**: al estar en formato safetensors y ser compatible con la librería `transformers`, puede servirse con vLLM, TGI, o convertirse a GGUF para usarse con llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles. Para un modelo de 3B en una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `AlinaGonch/granite41-3b-squad-ratio-0.90-seed-43` | ~3B (sin confirmar) | No disponible | No disponible | HuggingFace (checkpoint) |
| `ibm/granite-4.1-3b` (base) | 3B | 128 000 tokens | Apache 2.0 | HuggingFace, LM Studio |
| `AlinaGonch/granite41-3b-squad-ratio-0.10-seed-43` | ~3B (sin confirmar) | No disponible | No disponible | HuggingFace (checkpoint) |

La comparativa se limita a los modelos encontrados en la búsqueda web. No hay datos de rendimiento para establecer una comparación cuantitativa. El modelo base `granite-4.1-3b` tiene documentación completa y licencia Apache 2.0, mientras que este ajuste carece de licencia y especificaciones.

## Limitaciones y advertencias

- **Documentación inexistente**: la model card es una plantilla vacía; no hay información sobre el proceso de entrenamiento, datos exactos, hiperparámetros ni evaluación.
- **Sesgos del modelo base**: al derivar de `granite-4.1-3b`, puede heredar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente si se usa fuera del dominio de QA extractiva.
- **Limitaciones de idioma**: aunque el modelo base soporta 12 idiomas, no se sabe si este ajuste conserva esa cobertura; podría estar limitado al inglés de SQuAD.
- **Restricciones de licencia**: al no especificarse licencia, no está claro si se permite uso comercial. Se recomienda contactar al autor antes de cualquier despliegue en producción.
- **Caveat para producción**: sin benchmarks ni pruebas de robustez, no es recomendable usarlo en entornos críticos sin una validación exhaustiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.90-seed-43)
- [Variante con ratio 0.10](https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.10-seed-43)
- [Variante con ratio 0.30 y r64](https://huggingface.co/AlinaGonch/granite41-3b-squad-ratio-0.30-r64)
- [Ficha de ibm/granite-4.1-3b en LM Studio](https://lmstudio.ai/models/ibm/granite-4.1-3b)
- [Documentación técnica de la familia Granite 4.1 (DeepWiki)](https://deepwiki.com/ibm-granite/granite-4.1-language-models/1.1-model-family-and-variants)
- [Revisión de Granite 4.1 3B en aimodelcomparison.org](https://aimodelcomparison.org/models/granite-4-1-3b)
