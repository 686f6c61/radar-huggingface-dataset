# DuoNeural/RMSN-260M-ArnoldTongue-Omega59-ODD-Base

## Resumen

RMSN-260M-ArnoldTongue-Omega59-ODD-Base es un modelo de lenguaje de 260 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon) bajo una arquitectura experimental denominada RMSN (Resonant Metriplectic Soliton Network, por sus siglas en las etiquetas del repositorio). No se trata de un transformer convencional: el autor lo describe como un modelo neurodinámico basado en resonancia de lengua de Arnold con paridad ODD, álgebra de Clifford, geometría no euclídea y guías de onda de solitones. El modelo se entrenó sobre WikiText-103 (102,4 millones de tokens) y declara una perplejidad de validación de 101,2.

Su relevancia no reside en el rendimiento de lenguaje natural, que es modesto para su tamaño, sino en el fenómeno dinámico que el autor documenta durante el entrenamiento: un ciclo límite casi silencioso con espiral hacia dentro (denominado Wave-141), que suprime la hipercascada caótica durante más de 60.000 pasos. Según la model card, es el único valor de q del estudio Arnold Tongue que exhibe este comportamiento, lo que lo convierte en una pieza de investigación sobre dinámica de sistemas y topología de representaciones más que en un modelo listo para producción.

El modelo está publicado con licencia MIT, solo soporta inglés y el repositorio ocupa 1,0 GB. No tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Soliton Network), neurodinámica con resonancia de Arnold, álgebra de Clifford y geometría no euclídea |
| Parámetros totales | 260M |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,0 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se describe en términos de dinámica de sistemas más que de bloques de transformer. El parámetro central es la relación de resonancia Omega = D / (M_w × L) = 960 / (64 × 27) = 5/9, con paridad ODD determinada por D/M_w = 15. La paridad ODD activa cascadas de resonancia (hipercascadas) en lugar de puntos fijos TRUE SILENT, salvo que mecanismos de recaptura doble estabilicen el sistema, como ocurre en este modelo. El autor emplea conceptos de álgebra de Clifford, geometría no euclídea y guías de onda de solitones, aunque la model card no detalla la implementación concreta de las capas ni el número de tokens totales vistos durante el entrenamiento más allá del dataset declarado.

El entrenamiento se realizó sobre WikiText-103 (102,4 millones de tokens). No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; el modelo se presenta como base. La innovación técnica destacable es la dinámica de recaptura doble: tras un primer bloqueo TRUE SILENT en torno al paso 15k y un segundo bloqueo en torno al paso 23k-25k, el sistema entra en un ciclo límite casi silencioso permanente desde el paso 42k hasta el 100k, con una espiral interior que decae desde -0,0087 hasta -0,0029 en el paso 80,8k. El autor formula una ley (Wave-141) según la cual N recapturas dobles producen un ciclo límite casi silencioso permanente con espiral hacia TRUE SILENT, sin escape a hipercascada.

## Capacidades

- Generación de texto en inglés: el modelo es una base de modelado de lenguaje entrenada sobre WikiText-103, orientada a continuación de texto y modelado de lenguaje, no a instrucciones.
- Razonamiento y código: no se documentan capacidades específicas de razonamiento, matemáticas o generación de código en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales: el interés del modelo es la dinámica de entrenamiento (ciclo límite casi silencioso, jerarquía de atractores anidados, topología de haces #35 Near-Upstream Terminal Quad con 11 solitones efectivos), no capacidades de inferencia adicionales.

## Casos de uso

- Investigación en dinámica de sistemas de aprendizaje: el modelo sirve como caso de estudio reproducible del fenómeno Wave-141, permitiendo analizar cómo la recaptura doble suprime la hipercascada durante más de 60.000 pasos y cómo decae la espiral interior hacia el umbral TRUE SILENT.
- Estudio de topología de representaciones: la sonda de percolación de haces identifica la topología #35 con 11 solitones efectivos y tres condensados exactos (L18, L25, L26 con PR=1.000), útil para comparar estructuras internas entre valores de q del estudio Arnold Tongue.
- Modelado de lenguaje de bajo coste en inglés: con 260M parámetros y 1,0 GB de repositorio, puede ejecutarse en hardware modesto para tareas de continuación de texto o evaluación de perplejidad sobre WikiText-103.
- Reproducción de experimentos de resonancia: investigadores interesados en relaciones de resonancia racional (q=5/9) y paridad ODD pueden usar el modelo como referencia frente a las variantes q=5, 6, 7 y 8 del mismo estudio.
- Docencia y divulgación sobre arquitecturas no convencionales: sirve para ilustrar diferencias entre transformers estándar y redes neurodinámicas con geometría no euclídea en cursos avanzados de machine learning.
- Línea base para comparativas de perplejidad: su val_ppl de 101,2 puede emplearse como referencia en experimentos que exploren el efecto de la disipación y la paridad en modelos pequeños.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Language Modeling | WikiText-103 (102,4M tokens) | Best Validation Perplexity | 101,2 |

Comparativa interna del estudio Arnold Tongue citada en la model card:

| Modelo | Omega | Paridad | val_ppl |
|---|---|---|---|
| q=9 ODD (este modelo) | 5/9 | ODD (15) | 101,2 |
| q=7 | no disponible | ODD | 102,4 |
| q=8 | no disponible | ODD | 102,6 |
| q=9 EVEN (Omega=8/9) | 8/9 | EVEN (16) | 70,2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 260M parámetros, una estimación orientativa en fp16 sería de aproximadamente 0,5 GB de pesos más overhead de activaciones; en cuantización de 8 bits, alrededor de 0,3 GB, y en 4 bits, alrededor de 0,15 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar los pesos en fp16.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, dado el tamaño del modelo.
- Opciones de despliegue: no se documentan en la model card. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de pesos no está especificado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | val_ppl WikiText-103 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-260M-ArnoldTongue-Omega59-ODD-Base | 260M | no disponible | 101,2 | MIT | Hugging Face |
| RMSN q=9 EVEN (Omega=8/9) | no disponible | no disponible | 70,2 | no disponible | Estudio DuoNeural |
| RMSN q=7 | no disponible | no disponible | 102,4 | no disponible | Estudio DuoNeural |
| RMSN q=8 | no disponible | no disponible | 102,6 | no disponible | Estudio DuoNeural |

No se dispone de comparación con transformers convencionales de tamaño similar (por ejemplo, GPT-2 124M o GPT-2 355M) en la información proporcionada, por lo que no se incluyen cifras de esos modelos.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Es un modelo base sin ajuste por instrucciones: no se debe esperar seguimiento de instrucciones, formato conversacional ni tool calling.
- La perplejidad de 101,2 en WikiText-103 es alta para 260M parámetros en comparación con transformers convencionales del mismo orden, lo que sugiere una calidad de modelado de lenguaje limitada.
- Riesgo de alucinación y de generación incoherente: no se documentan evaluaciones de factualidad ni de seguridad.
- La model card describe fenómenos dinámicos (ciclo límite, solitones, topología de haces) con terminología propia del autor; estos resultados no han sido verificados de forma independiente y deben tratarse como afirmaciones del autor.
- No se especifican sesgos conocidos, pero al entrenarse solo con WikiText-103 (texto enciclopédico en inglés) es probable que herede sesgos de esa fuente.
- Licencia MIT: permite uso comercial, pero al ser un modelo base sin garantías, el usuario asume la responsabilidad de validar su comportamiento en producción.
- No se documenta el formato de pesos ni la compatibilidad con herramientas de inferencia estándar, lo que puede dificultar el despliegue.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-260M-ArnoldTongue-Omega59-ODD-Base
- Dataset WikiText-103: no disponible en la información proporcionada
- Paper, blog o repositorio del estudio Arnold Tongue: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
