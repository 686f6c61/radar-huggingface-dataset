# DuoNeural/RMSN-450M-EarlyNucleation-SFT2500

## Resumen

RMSN-450M-EarlyNucleation-SFT2500 es un modelo de lenguaje de 450 millones de parámetros desarrollado por DuoNeural Lab (Jesse, Archon y Aura) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino supervisado (SFT) durante 2500 pasos sobre una arquitectura propietaria denominada RMSN (Resonant Metriplectic Sheaf Network), que el autor describe como un modelo neural con dinámica port-hamiltoniana. La dimensión del modelo es D=1664, con 16 capas y 64 slots, y el idioma declarado es únicamente inglés.

El interés técnico del modelo no reside en su rendimiento bruto, sino en el fenómeno de reorganización topológica que documenta su model card: el SFT provoca la disolución de solitones en capas intermedias (L7/L8) y la nucleación de un nuevo condensado front-anchor en la capa L5. El autor afirma que este patrón es intrínseco a la arquitectura y no depende del schedule de learning rate, lo que convierte al modelo en un artefacto de investigación sobre dinámica interna de redes neuronales más que en un modelo de propósito general.

Los datos de evaluación publicados son escasos y poco favorables en términos absolutos: perplejidad de 158,77 en WikiText-103 y una puntuación de 20,50 en razonamiento CoT. El modelo no declara pipeline, no tiene descargas ni likes, y su model card está centrada en métricas topológicas internas (PR por capa) más que en capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), dinámica port-hamiltoniana |
| Parametros totales | 450M |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Dimension del modelo | D=1664 |
| Numero de capas | 16 |
| Slots | 64 |
| Pasos de SFT | 2500 |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe en la model card mediante la ecuación de dinámica port-hamiltoniana ḟ = {f,H} + [f,S], con propiedades declaradas de estabilidad de Lyapunov y conservación del espacio de fases. El modelo tiene 16 capas, dimensión D=1664 y 64 slots. No se especifica el número de tokens de entrenamiento del preentrenamiento base, la composición del dataset de SFT, ni si hubo RLHF o DPO; solo se indica que se aplicaron 2500 pasos de SFT con supervisión CoT.

La innovación técnica documentada es la topología de solitones y su reorganización tras el SFT. La topología base (pre-SFT) es un "Crystallized Cluster" en las capas [L7, L8, L9, L15]. Tras 2500 pasos de SFT, la topología pasa a "Early Nucleation" en [L5, L9, L15]: L7 y L8 se disuelven y emerge un nuevo condensado en L5. Los valores de participation ratio (PR) reportados son 2,764 en L5 (Near-Exact), 2,210 en L9 (Near-Exact) y 1,000 en L15 (EXACT). El autor afirma haber confirmado mediante comparación controlada que la nucleación en L5 es intrínseca a la arquitectura, reproduciéndose con schedules de learning rate estándar y comprimido.

## Capacidades

- Generación de texto en inglés, con ajuste por SFT orientado a instrucciones.
- Razonamiento chain-of-thought (CoT), evaluado con una puntuación de 20,50 según la model card.
- Modelado de lenguaje general, medido por perplejidad en WikiText-103 (158,77).
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible como funcionalidad separada.

## Casos de uso

- Investigación en interpretabilidad y dinámica interna: el modelo sirve como sujeto de estudio para analizar cómo el SFT reorganiza la topología de representaciones entre capas (disolución de L7/L8, nucleación de L5). Es adecuado porque la model card proporciona métricas de participation ratio por capa que permiten replicar el análisis.
- Estudio de estabilidad dinámica en arquitecturas port-hamiltonianas: investigadores interesados en conservación de espacio de fases y estabilidad de Lyapunov pueden usar el modelo como banco de pruebas de 450M parámetros.
- Reproducción de experimentos de schedule de learning rate: dado que el autor afirma que la nucleación en L5 es independiente del schedule, el modelo permite contrastar esa hipótesis con schedules alternativos.
- Generación de texto en inglés de baja exigencia: para tareas donde una perplejidad de 158,77 en WikiText-103 sea aceptable (experimentación, prototipos internos), el modelo puede generar texto en inglés, aunque con calidad limitada.
- Baseline para comparativas de SFT: al documentar métricas topológicas pre y post-SFT, puede emplearse como referencia en estudios que comparen estrategias de ajuste fino sobre arquitecturas no convencionales.
- Docencia y divulgación: como ejemplo práctico de arquitectura alternativa a transformer estándar con dinámica física explícita, útil en cursos avanzados de arquitecturas neuronales.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WikiText-103 (perplejidad) | 158,77 |
| CoT Reasoning | 20,50 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones numéricas con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 450M parámetros, una estimación orientativa en fp16 sería de aproximadamente 0,9 GB de pesos, y en cuantización de 8 bits alrededor de 0,45 GB, a lo que habría que sumar overhead de activaciones y contexto; estas cifras son estimaciones genéricas, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño (450M) cabría en GPUs de consumo con suficiente VRAM, pero la arquitectura RMSN no estándar puede no ser compatible con los runtimes habituales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. Al tratarse de una arquitectura propietaria no estándar, es probable que requiera código de inferencia específico del autor, pero esto no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos, y la arquitectura RMSN no tiene equivalentes públicos directos documentados en la model card.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: perplejidad de 158,77 en WikiText-103 y 20,50 en CoT reasoning indican una calidad de generación y razonamiento limitada para uso en producción.
- Idioma: solo inglés declarado; no hay soporte multilingüe confirmado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar casos de uso con ventanas largas.
- Arquitectura no estándar: al no ser un transformer convencional, la compatibilidad con ecosistemas de inferencia (vLLM, llama.cpp, TGI, Ollama) no está garantizada y probablemente requiera código propio.
- Riesgo de alucinación: no cuantificado en la información disponible; con la perplejidad reportada, el riesgo es previsiblemente alto.
- Sesgos: no documentados en la model card.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide evaluar riesgos de contaminación o sesgos de datos.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni formato de pesos especificado, lo que dificulta su uso inmediato.
- Fecha de creación declarada en 2026, lo que conviene verificar antes de citar el modelo en trabajos formales.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-450M-EarlyNucleation-SFT2500
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
