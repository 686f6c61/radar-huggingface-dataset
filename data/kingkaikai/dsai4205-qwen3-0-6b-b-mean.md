# kingkaikai/DSAI4205-Qwen3-0.6B-B-mean

## Resumen

DSAI4205-Qwen3-0.6B-B-mean es un artefacto experimental de clasificación de sentimiento publicado por el usuario kingkaikai en Hugging Face. No es un modelo de lenguaje generativo autónomo, sino un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-0.6B (revisión c1899de289a04d12100db370d81485cdf75e47ca) junto con un clasificador MLP independiente serializado en joblib. El conjunto se complementa con un cabezal temporal de cuatro clases usado únicamente para generar la señal de entrenamiento por entropía cruzada.

El objetivo concreto del experimento es clasificar tuits en inglés en cuatro categorías: negativo (0), positivo (1), irrelevante (2) y neutro (3). Para ello se extraen los estados de la última capa del decodificador, se promedia la representación sobre los tokens del comentario (excluyendo el prompt de clasificación y los tokens de plantilla), se normaliza L2 y se alimenta un MLP escalado ajustado por separado. El resultado reportado es un macro-F1 medio de 0,4961 en cinco semillas sobre un conjunto de test de 397 filas.

Se trata de un trabajo de curso (DSAI4205) con fines de reproducibilidad e investigación metodológica, no de un modelo listo para producción. El repositorio ocupa 0,1 GB, no tiene descargas ni likes, solo declara soporte de inglés y no especifica licencia. Su interés radica en el diseño experimental controlado: compara el encoder adaptado (B_mean) con un control congelado sin adaptar (A_mean) y publica artefactos de replay para verificar predicciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-0.6B) + MLP clasificador independiente |
| Parámetros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base Qwen3-0.6B tiene 0,6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-0.6B; no especificada en la model card) |
| Tipos de cuantización | No disponible (se distribuye en safetensors para el adaptador y joblib para el clasificador) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), joblib (scaler y clasificador MLP), .pt (cabezal temporal), .npz (features de replay) |

## Arquitectura y entrenamiento

El pipeline parte del modelo Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre él se aplica un adaptador LoRA (PEFT) entrenado con una cabeza temporal de cuatro clases que proporciona la señal de entropía cruzada. Tras seleccionar el encoder por validación, este se congela, se calcula la representación media sobre los tokens del comentario (excluyendo el prompt de clasificación y los tokens de plantilla del chat), se normaliza L2 y se ajusta un MLP escalado independiente que constituye el clasificador final. El control A_mean repite el proceso con el encoder sin adaptar, permitiendo aislar el efecto del ajuste LoRA.

Los datos de entrenamiento son tuits en inglés divididos en particiones de 473 filas (train), 118 (validación) y 397 (test). El experimento se ejecuta con cinco semillas independientes (13, 42, 71, 101 y 2026), lo que permite reportar intervalos de confianza emparejados. El entorno de referencia usa NumPy 2.0.2, scikit-learn 1.6.1 y joblib 1.5.2. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF/DPO (no aplica, al ser una tarea de clasificación supervisada). La innovación metodológica destacable es el uso de pooling medio sobre tokens de comentario con máscara de span, junto con la publicación de features de replay (1.024 dimensiones) para auditar las predicciones.

## Capacidades

- Clasificación de sentimiento en inglés en cuatro clases: negativo, positivo, irrelevante y neutro.
- Extracción de features (pipeline declarado: feature-extraction) mediante pooling medio de estados de la última capa.
- Adaptación LoRA sobre Qwen3-0.6B para una tarea discriminativa concreta.
- Reproducción de predicciones sobre test mediante features almacenadas y clasificador joblib.
- Comparación controlada adaptado vs. no adaptado (B_mean frente a A_mean) por semilla.
- No soporta generación de texto libre, tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador, no un modelo generativo desplegable como tal.

## Casos de uso

- Análisis de sentimiento de tuits en inglés: el pipeline clasifica cada comentario en una de cuatro categorías usando el adaptador LoRA y el MLP por semilla; adecuado para estudios académicos con corpus pequeños y controlados.
- Reproducción de experimentos docentes: los artefactos de replay (features de 1.024 dimensiones, row_ids y logits) permiten verificar predicciones sin reejecutar el modelo, útil en evaluación de asignaturas y revisión por pares.
- Comparación metodológica de adaptación LoRA: el par B_mean/A_mean permite medir el efecto del ajuste frente a un encoder congelado, útil en investigación sobre representaciones de decoders para tareas discriminativas.
- Auditoría de clasificadores: los hashes SHA-256 del manifest.json y los objetos serializados facilitan la trazabilidad de artefactos en pipelines de reproducibilidad.
- Prototipado de clasificación de opiniones en inglés: sirve como línea base de bajo coste (0,1 GB) para experimentos previos a modelos mayores.
- Docencia en NLP: el notebook de implementación y los registros de ejecución sirven como material didáctico para enseñar pooling, LoRA y evaluación con múltiples semillas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Macro-F1 medio (B_mean, 5 semillas, test de 397 filas) | 0,4961 |
| Macro-F1 medio (A_mean, control, 5 semillas) | 0,4838 |
| Intervalo emparejado de la diferencia (B_mean − A_mean) | −0,0215 a +0,0475 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son los de la tarea propia de clasificación de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA y el clasificador ocupan 0,1 GB, y el modelo base Qwen3-0.6B requiere típicamente menos de 2 GB en fp16, aunque este dato no se declara en la model card.
- GPU recomendadas: no especificadas; por el tamaño del modelo base, cualquier GPU consumer reciente sería suficiente, pero no se aporta confirmación.
- Cabe en GPU consumer: previsiblemente sí (modelo base de 0,6B), sin dato oficial.
- Opciones de despliegue: PEFT + transformers para el adaptador, joblib/scikit-learn para el clasificador; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSAI4205-Qwen3-0.6B-B-mean | 0,6B (base) + LoRA | No disponible | Clasificación de sentimiento (4 clases) | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-0.6B | 0,6B | No disponible en esta ficha | Generación de texto | No disponible en esta ficha | Hugging Face |
| Clasificadores tipo RoBERTa-base para sentimiento | ~0,125B | 512 tokens | Clasificación de sentimiento | Varía (MIT/Apache según variante) | Hugging Face |

No se dispone de comparativas de rendimiento con alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- El macro-F1 medio de 0,4961 indica un rendimiento moderado; el intervalo de la diferencia frente al control incluye el cero, por lo que la mejora por LoRA no es concluyente.
- El modelo solo declara inglés; no se garantiza comportamiento en otros idiomas.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- Es un artefacto de curso con particiones pequeñas (473/118/397 filas); el riesgo de sobreajuste y de baja generalización es alto.
- Riesgo de sesgos derivado del corpus de tuits de origen, no documentado.
- Los objetos joblib deben cargarse solo desde revisiones de confianza (advertencia explícita del autor); el cabezal temporal debe cargarse con torch.load y weights_only=True.
- No es un modelo generativo: no debe emplearse para generación de texto, agentes ni tool calling.
- No se documentan el contexto máximo efectivo ni la composición exacta del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/kingkaikai/DSAI4205-Qwen3-0.6B-B-mean
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Notebook de implementación: https://github.com/once123456/DSAI4205/blob/main/submission/01_Group_Implementation.ipynb
- Registros del experimento: https://github.com/once123456/DSAI4205/tree/main/run/kai
