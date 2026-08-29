# Islamamro/sst2-sentiment-aurora-islamamro

## Resumen

El modelo `Islamamro/sst2-sentiment-aurora-islamamro` es un clasificador de sentimiento binario (positivo/negativo) para frases de reseñas de películas, desarrollado por el usuario Islamamro. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/sst2`, una versión del Stanford Sentiment Treebank. El modelo fue entrenado y publicado de extremo a extremo mediante el **Aurora Research Portal**, una plataforma que automatiza el ciclo de construcción, entrenamiento y publicación de modelos.

La relevancia de este modelo no reside en su rendimiento (que es modesto), sino en que sirve como demostración funcional del pipeline de Aurora. El autor indica explícitamente que se entrenó sobre un subconjunto de 1.400 ejemplos, por lo que no está pensado para uso en producción. Con 66,9 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, pero su utilidad práctica es limitada fuera de contextos educativos o de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo uncased, probablemente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva el 97% de las capacidades de comprensión del lenguaje con un 40% menos de parámetros. El fine-tuning se realizó sobre el dataset `SetFit/sst2`, que contiene frases de reseñas de películas etiquetadas como positivas o negativas. Según la model card, el entrenamiento se llevó a cabo sobre un subconjunto de 1.400 ejemplos, lo que explica la precisión moderada del 0,83 en el conjunto de validación. No se especifican detalles sobre el número de épocas, la tasa de aprendizaje ni el proceso de optimización. El entrenamiento se ejecutó en una NVIDIA RTX 3090, y todo el flujo (construcción, entrenamiento, publicación) se gestionó a través del Aurora Research Portal.

## Capacidades

- Clasificación binaria de sentimiento: asigna una etiqueta `POSITIVE` o `NEGATIVE` a una frase dada.
- Procesamiento de texto en inglés (inferido por el tokenizador `uncased` de DistilBERT, aunque no se confirma en la documentación).
- Inferencia rápida y ligera gracias al tamaño reducido del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de modo de pensamiento ni generación de texto libre; es exclusivamente un clasificador.

## Casos de uso

- **Demostración de pipelines de MLOps**: el modelo sirve como ejemplo de cómo Aurora permite entrenar y publicar un modelo en Hugging Face sin intervención manual. Útil para desarrolladores que quieran evaluar la plataforma.
- **Pruebas de integración**: puede emplearse en entornos de desarrollo para verificar que una API de clasificación de sentimiento funciona correctamente, antes de sustituirlo por un modelo de producción.
- **Educación y aprendizaje**: estudiantes de NLP pueden utilizarlo para entender el flujo de fine-tuning de DistilBERT y comparar resultados con modelos entrenados en datasets completos.
- **Prototipado rápido**: en una fase inicial de un proyecto, puede servir para validar la idea de análisis de sentimiento en reseñas de películas, aunque no se recomienda para datos reales.
- **Benchmarking de infraestructura**: al ser un modelo pequeño, es adecuado para medir latencia y throughput en diferentes configuraciones de hardware (CPU, GPU de baja gama) sin coste computacional elevado.
- **Análisis de sentimiento en textos cortos**: si se acepta una precisión del 83%, podría usarse en tareas no críticas como clasificar comentarios en foros de demostración, siempre que se conozcan sus limitaciones.

## Benchmarks y rendimiento

La model card reporta una precisión del 0,83 en un conjunto de validación no especificado (presumiblemente una partición del propio `SetFit/sst2`). No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con modelos alternativos.

| Métrica | Valor |
|---|---|
| Precisión (held-out) | 0,83 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 67M parámetros, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM, o en cualquier GPU con al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada (GTX 1650, RTX 3050) o incluso integradas. El entrenamiento se realizó en una RTX 3090, pero la inferencia es mucho menos exigente.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: compatible con `transformers` (pipeline de Hugging Face), `vLLM` (aunque no es óptimo para modelos tan pequeños), `llama.cpp` (si se convierte a GGUF), `Ollama` (requiere conversión) y `TGI` (no recomendado por su tamaño).
- **Latencia y throughput**: no se dispone de mediciones oficiales. Dado el tamaño, se espera una latencia inferior a 10 ms en GPU y de 50-100 ms en CPU para frases cortas.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación del modelo. Sin embargo, se puede contextualizar con alternativas conocidas del mismo tipo:

| Modelo | Parámetros | Contexto | Precisión SST-2 | Licencia |
|---|---|---|---|---|
| `Islamamro/sst2-sentiment-aurora-islamamro` | 66,9M | no disponible | 0,83 (subset) | Apache-2.0 |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9M | 512 | ~0,91 (SST-2 completo) | Apache-2.0 |
| `bert-base-uncased` (fine-tuned SST-2) | 110M | 512 | ~0,92 | Apache-2.0 |

La comparativa es orientativa; los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada.

## Limitaciones y advertencias

- **Entrenamiento en subconjunto reducido**: solo se usaron 1.400 ejemplos, lo que limita la generalización y explica la precisión del 0,83, inferior a la de modelos entrenados con el dataset completo.
- **No apto para producción**: el propio autor advierte que es una prueba del pipeline Aurora, no un modelo listo para uso real.
- **Sesgos potenciales**: al estar entrenado en reseñas de películas, puede tener sesgos hacia vocabulario cinematográfico y no generalizar bien a otros dominios.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo, pero la clasificación puede ser errónea en frases ambiguas o con sarcasmo.
- **Idioma**: no se especifica, pero al ser `uncased` y basado en DistilBERT, está orientado al inglés; su uso en otros idiomas dará resultados poco fiables.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero dado el rendimiento limitado, no se recomienda su integración en productos sin un fine-tuning adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Islamamro/sst2-sentiment-aurora-islamamro)
- [Dataset SetFit/sst2](https://huggingface.co/datasets/SetFit/sst2)
- [Perfil de GitHub del autor](https://github.com/islamamro)
- [Dataset original Stanford SST-2](https://huggingface.co/datasets/stanfordnlp/sst2)
