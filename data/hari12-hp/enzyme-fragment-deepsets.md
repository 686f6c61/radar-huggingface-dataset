# hari12-hp/enzyme-fragment-deepsets

## Resumen

Enzyme-fragment-deepsets es un modelo desarrollado por el usuario hari12-hp, publicado en Hugging Face bajo el identificador `hari12-hp/enzyme-fragment-deepsets`. Se enmarca en el proyecto "Leak CURBER" y está orientado a la recuperación de enzimas (enzyme retrieval) a partir de huellas de reacción fijas, sin necesidad de modelos auxiliares como RXNFP ni CNN sobre SMILES. La model card indica que la arquitectura interna se denomina `fragment_deepsets` y que el entrenamiento se realizó sobre una partición de desarrollo.

El modelo se distribuye con pesos entrenados en PyTorch y una interfaz de inferencia en CPU mediante un script `predict.py`, lo que sugiere un diseño ligero y reproducible. La única métrica publicada es una precisión L4 de desarrollo de 0,5147, que el propio autor advierte explícitamente que no es una puntuación de leaderboard.

La información pública es muy escasa: el repositorio tiene 0 GB, no hay descargas ni likes, no se declara licencia, idiomas ni pipeline, y no se detallan parámetros, contexto ni composición del dataset. Por tanto, esta ficha se limita a lo verificable en la model card y marca como "no disponible" todo lo que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fragment_deepsets (Deep Sets sobre fragmentos; pesos PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de retrieval sobre huellas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a química, no a texto) |
| Licencia | no disponible |
| Formato de pesos | pesos entrenados en PyTorch (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura declarada es `fragment_deepsets`, una variante de Deep Sets aplicada a fragmentos. Deep Sets es una familia de redes invariantes a permutaciones que agrega representaciones de elementos de un conjunto mediante una función de pooling simétrica; en este caso, los elementos serían fragmentos derivados de reacciones químicas. La model card indica que el modelo utiliza "fixed reaction fingerprints" (huellas de reacción fijas) y que no requiere RXNFP ni una CNN sobre SMILES, lo que reduce la dependencia de modelos auxiliares y simplifica el pipeline de inferencia.

El entrenamiento se realizó sobre la "development training partition" del proyecto Leak CURBER. No se especifican el número de tokens, el volumen de reacciones, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de ajuste. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo de retrieval.

## Capacidades

- Recuperación de enzimas: dado un conjunto de fragmentos o huellas de reacción, el modelo produce una representación o puntuación orientada a la recuperación de enzimas asociadas.
- Inferencia en CPU: el autor proporciona un script `predict.py` que se ejecuta en CPU con pesos PyTorch, sin GPU.
- Uso de huellas de reacción fijas: no depende de RXNFP ni de una CNN sobre SMILES, lo que simplifica el despliegue.
- Integración en pipelines de química computacional: la interfaz CLI (`--input` / `--output`) permite encadenarlo en flujos batch.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Recuperación de enzimas en pipelines de anotación: el modelo puede puntuar candidatos de enzima a partir de huellas de reacción fijas, integrándose en un paso batch de anotación funcional dentro de un flujo de química computacional.
- Filtrado previo en bases de datos enzimáticas: dado su bajo coste de inferencia en CPU, puede usarse como primera etapa de cribado antes de modelos más costosos, reduciendo el número de candidatos a evaluar.
- Prototipado rápido en entornos sin GPU: al ejecutarse en CPU con pesos PyTorch, permite validar hipótesis de recuperación en portátiles o contenedores sin acelerador.
- Evaluación de hipótesis de "leakage" en benchmarks de química: el proyecto Leak CURBER sugiere un uso orientado a detectar y controlar fugas de información entre particiones de entrenamiento y evaluación.
- Enseñanza y experimentación con Deep Sets aplicados a química: sirve como ejemplo reproducible de arquitectura invariante a permutaciones sobre fragmentos.
- Integración en pipelines de CI/CD de química computacional: la interfaz CLI facilita pruebas automatizadas de recuperación sobre conjuntos de reacciones de validación.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| Development L4 accuracy | 0,5147 | Puntuación de desarrollo, no de leaderboard (según el autor) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica es la precisión L4 de desarrollo indicada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor indica inferencia en CPU, lo que sugiere que no requiere GPU.
- GPU recomendadas: no disponible; no se declara necesidad de GPU.
- ¿Cabe en consumer GPU? No aplica según la información disponible; el diseño es para CPU.
- Opciones de despliegue: script `predict.py` con pesos PyTorch y huellas de reacción fijas; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (retrieval de enzimas con Deep Sets sobre fragmentos), ni datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Métrica de desarrollo: la precisión L4 de 0,5147 es una puntuación de desarrollo, no de leaderboard; el autor lo advierte explícitamente, por lo que no debe interpretarse como rendimiento final.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no declarados: no aplica a texto, pero la ausencia de metadatos limita la evaluación de su alcance.
- Repositorio vacío en tamaño (0 GB): no se confirma la disponibilidad efectiva de los pesos en el momento de la consulta.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos en la recuperación de enzimas.
- Sesgos conocidos: no disponible; no se documenta la composición del dataset de entrenamiento.
- Restricciones de producción: la falta de licencia, de benchmarks completos y de documentación sobre el dataset hace desaconsejable su uso en producción sin una evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/hari12-hp/enzyme-fragment-deepsets
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
