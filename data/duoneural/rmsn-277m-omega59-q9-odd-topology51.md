# DuoNeural/RMSN-277M-Omega59-q9-ODD-Topology51

## Resumen

RMSN-277M-Omega59-q9-ODD-Topology51 es un modelo de lenguaje de aproximadamente 277 millones de parámetros desarrollado por DuoNeural AI Research Lab bajo una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN). El modelo se ha entrenado específicamente en el régimen de resonancia racional q=9 (Ω=5/9), un punto del llamado "Arnold Tongue" que, según la documentación del autor, produce un comportamiento de ciclo límite casi silencioso con dinámica de espiral hacia dentro, designado internamente como Wave-141.

El modelo se presenta como parte de un estudio sistemático de topologías de resonancia (numeradas, en este caso la Topology #51), más orientado a la investigación en dinámica de sistemas y estructura topológica de redes neuronales que a su uso como asistente conversacional de producción. La model card describe propiedades internas como "solitones", "haces de fibras" y clasificaciones topológicas ("CEMENTED — UPSTREAM DENSE") obtenidas mediante una sonda de percolación sobre el checkpoint.

Con 960 dimensiones de modelo, 27 capas y 64 slots (M_w), el modelo reporta una perplejidad de validación de 50,04 sobre WikiText-103 tras 200.000 pasos de entrenamiento. La relevancia actual es limitada fuera del ámbito de investigación del propio laboratorio: no hay datos publicados de benchmarks estándar, el repositorio no registra descargas ni interacciones, y la terminología empleada no se corresponde con métricas convencionales de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | ~277M (según nombre del modelo); no disponible el desglose exacto |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sufijo "q9" hace referencia a la resonancia q=9, no a cuantización de 9 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene un checkpoint `.pt` referenciado como `rmsn_topology51_stripped.pt`; tamano del repo 1,0 GB) |

Parámetros internos adicionales declarados: D=960, L=27, M_w=64 slots, Ω=5/9 (paridad ODD q=9), 200.000 pasos de entrenamiento, vocabulario V=49152 (cosmo2).

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) no dispone de descripción técnica detallada en la información proporcionada. La model card menciona conceptos de sistemas dinámicos (resonancia racional, ciclo límite, dinámica metripléctica, frontera tipo KAM) y de topología algebraica (haces o *sheaves*, haces de fibras, solitones), pero no especifica la estructura de capas, el mecanismo de atención ni cómo se relacionan estos conceptos con un transformer convencional. Los parámetros declarados son D=960 de dimensión, 27 capas de profundidad y 64 slots.

El entrenamiento se realizó sobre WikiText-103 (variante "cosmo2", vocabulario de 49.152 tokens) durante 200.000 pasos, alcanzando una perplejidad de validación de 50,04. No se documenta el número total de tokens procesados, la composición exacta del dataset más allá de WikiText-103, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describen innovaciones de inferencia como decodificación especulativa o atención lineal. La model card sí describe un análisis topológico posterior al entrenamiento mediante una sonda (`probe_percolation_sheaf.py`) que clasifica el checkpoint como "CEMENTED — UPSTREAM DENSE", con 11 solitones totales, 5 haces de fibras efectivos y una distribución de solitones concentrada en las capas cercanas a la entrada.

## Capacidades

- Generación de texto autorregresiva sobre dominio WikiText-103 (estilo enciclopédico en inglés, presumiblemente, aunque el idioma no se declara explícitamente).
- Modelado de lenguaje de siguiente token; no se documentan capacidades de razonamiento, matemáticas o código.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- No se declara modo "thinking", visión, audio ni otras modalidades.
- El interés declarado del modelo es el estudio de su comportamiento dinámico (ciclo límite casi silencioso, Wave-141) y su firma topológica (Topology #51), no capacidades funcionales de asistente.

## Casos de uso

- Investigación en dinámica de redes neuronales: el modelo sirve como punto de datos en el estudio sistemático de "Arnold Tongues" que realiza DuoNeural, permitiendo comparar el régimen q=9 (Ω=5/9, ppl=50,04) con los regímenes q=2, q=3, q=5 y q=13 de la misma familia.
- Análisis topológico de checkpoints: reproducible mediante la sonda `probe_percolation_sheaf.py` con los parámetros declarados (dim 960, depth 27, slots 64), útil para estudiar la distribución de "solitones" y haces de fibras en redes entrenadas.
- Reproducción de experimentos de perplejidad en WikiText-103: el valor de referencia (50,04 a 200k pasos) permite validar reimplementaciones del pipeline de entrenamiento.
- Estudio de fenómenos de resonancia y sincronización: el comportamiento de "ciclo límite casi silencioso" documentado puede servir como caso de estudio en teoría de sistemas dinámicos aplicada a aprendizaje automático.
- Baseline de modelado de lenguaje a escala ~277M: útil como referencia interna para comparar arquitecturas alternativas sobre el mismo corpus y presupuesto de pasos.
- Docencia y divulgación sobre arquitecturas no convencionales: el modelo ilustra terminología de haces, solitones y resonancia aplicada a redes neuronales, aunque su validación externa es inexistente.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad de validación (WikiText-103) | 50,04 | a 200.000 pasos, Ω=5/9, q=9 ODD |
| Perplejidad de referencia misma familia (q=5, Ω=4/5) | 42,5 | Topology #62, record declarado por el autor |
| Perplejidad de referencia misma familia (q=2, Ω=1/2) | 76,6 | zona TS |
| Perplejidad de referencia misma familia (q=13, Ω=12/13) | 70,16 | primer q=13 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son perplejidades declaradas por el propio autor, sin verificación externa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~277M parámetros, una estimación orientativa en FP16 sería de ~0,6 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, ~0,3 GB; en 4 bits, ~0,15 GB. Estas cifras son estimaciones generales, no datos del autor.
- GPU recomendadas: no especificadas. Cualquier GPU consumer con ≥4 GB de VRAM debería poder alojar los pesos en FP16 según la estimación anterior, pero la arquitectura RMSN podría requerir implementaciones específicas no estándar.
- Compatibilidad con GPU consumer: probable por tamaño, pero no confirmada; el formato de pesos (`.pt`) y la arquitectura propietaria pueden impedir su carga en runtimes convencionales.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni transformers estándar. El único artefacto referenciado es un checkpoint PyTorch (`rmsn_topology51_stripped.pt`) que requiere código propio del autor (no incluido en el repo según la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| RMSN-277M-Omega59-q9-ODD-Topology51 | ~277M | no disponible | Apache 2.0 | HF (0 descargas) | ppl 50,04 (WikiText-103) |
| RMSN-279M-Omega45-EVEN-KAM-Multistability (Topology #62) | ~279M | no disponible | Apache 2.0 (presumible) | HF | ppl 42,5 (WikiText-103) |
| RMSN-51M-Omega12-PostCascade-TS-Topology84 | ~51M | no disponible | Apache 2.0 (presumible) | HF | no disponible |
| GPT-2 small (referencia de tamaño similar) | 124M | 1.024 tokens | MIT | Amplia | ppl ~29 en WikiText-103 (referencia externa) |

La comparación con modelos convencionales de tamaño similar (GPT-2 small, GPT-2 medium, Pythia-410M) no es directa porque la perplejidad reportada por DuoNeural (50,04) es sustancialmente peor que la de GPT-2 small en WikiText-103, y no se aportan benchmarks de tareas. Los únicos comparables homogéneos son los propios modelos de la familia RMSN del mismo laboratorio.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia independiente de que el modelo funcione como se describe.
- Terminología no estándar: conceptos como "solitones", "haces de fibras", "Arnold Tongue" o "metripléctico" no tienen definición operativa en la model card ni correspondencia clara con métricas convencionales, lo que dificulta la reproducción.
- Perplejidad elevada: 50,04 en WikiText-103 es peor que el de modelos transformer convencionales de tamaño comparable, lo que sugiere una calidad de modelado de lenguaje limitada.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo base entrenado solo en WikiText-103, su tendencia a generar texto plausible pero incorrecto es alta.
- Idiomas: no declarados; probablemente limitado al inglés de WikiText-103, sin capacidades multilingües confirmadas.
- Contexto: longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Formato y despliegue: el checkpoint en `.pt` con arquitectura propietaria probablemente no es cargable con `transformers`, `vLLM` o `llama.cpp` sin código específico del autor, que no se incluye en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación técnica y de artefactos de inferencia hace inviable un despliegue en producción sin trabajo adicional de ingeniería.
- Sesgos: no evaluados; WikiText-103 es un corpus enciclopédico con sesgos de dominio y de representación que no se han analizado.
- Fecha de creación futura (2026-11-27): el repositorio tiene marcas temporales posteriores a la fecha actual de consulta, lo que puede indicar metadatos inconsistentes o un entorno de publicación no convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-277M-Omega59-q9-ODD-Topology51
- Modelo relacionado (Topology #62, record ppl=42,5): https://huggingface.co/DuoNeural/RMSN-279M-Omega45-EVEN-KAM-Multistability
- Modelo relacionado (Topology #84, Post-Cascade TS): https://huggingface.co/DuoNeural/RMSN-51M-Omega12-PostCascade-TS-Topology84
- Paper, blog o repositorio del laboratorio: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
