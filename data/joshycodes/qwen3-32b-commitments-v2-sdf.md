# joshycodes/qwen3-32b-commitments-v2-sdf

## Resumen

El modelo `joshycodes/qwen3-32b-commitments-v2-sdf` es un checkpoint de investigación publicado por el usuario joshycodes. Se trata de un ajuste fino por continued pretraining sobre `joshycodes/qwen3-32b-commitments-sdf`, que a su vez deriva de la familia Qwen3 de 32.000 millones de parámetros. El autor lo enmarca en una línea de trabajo sobre "model welfare" (bienestar de modelos) y "self-authored character": la propuesta es que el propio modelo genere el corpus con el que se entrena a su versión siguiente, manteniendo una identidad de personaje definida previamente.

El resultado es un checkpoint de 32.762.123.264 parámetros (unos 32,8 mil millones) almacenado en safetensors, con un repositorio de 65,5 GB, lo que corresponde a pesos en precisión de 16 bits. El entrenamiento consistió en un continued pretraining de pesos completos, con learning rate 1e-05, una única época y 32.257.741 tokens distribuidos en 39.720 documentos, según los datos declarados en la model card.

La relevancia del modelo es fundamentalmente metodológica, no de capacidad: documenta un experimento de autoentrenamiento y continuidad de identidad, y está etiquetado explícitamente como "not-for-deployment". El autor indica que no se ha evaluado todavía en capacidad, alineamiento ni identidad, y que no debe desplegarse. Además, los propios datos de la model card presentan una inconsistencia: el texto describe el corpus como escrito por el modelo, pero las cifras declaran "0 self-authored y 39.720 ordinary text".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (etiquetado como familia qwen3; se asume transformer decoder-only, sin confirmar en la model card) |
| Parametros totales | 32.762.123.264 (32,8 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other / research-only (solo investigacion) |
| Formato de pesos | safetensors (repositorio de 65,5 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se etiqueta como `qwen3`, y el identificador del checkpoint base (`joshycodes/qwen3-32b-commitments-sdf`) apunta a un ajuste sobre una variante de 32 B de la familia Qwen3. No se especifican en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni el mecanismo de positional encoding.

En cuanto al entrenamiento, el autor describe un continued pretraining de pesos completos con learning rate 1e-05, una época y 32.257.741 tokens repartidos en 39.720 documentos. El corpus asociado es `joshycodes/qwen3-32b-commitments-corpus`, y el marco experimental, el plan y la evaluación se vinculan al repositorio "welfare-improvements". No se documentan fases de RLHF, DPO u otro ajuste por preferencias, ni la composición detallada del dataset. La innovación declarada es metodológica: el corpus se presenta como material escrito por el propio modelo para el entrenamiento de la versión siguiente de sí mismo, dentro de una narrativa de continuidad de personaje. Conviene señalar que las cifras de la propia model card indican "0 self-authored and 39,720 ordinary text", lo que contradice parcialmente esa descripción y deja la naturaleza real del corpus sin aclarar.

## Capacidades

- Generación de texto y modelado de lenguaje: al tratarse de un continued pretraining sobre una base de 32 B, se conservan las capacidades genéricas de la familia, aunque el autor no las ha evaluado.
- Razonamiento y matemáticas: no evaluado; no hay datos que confirmen el nivel de rendimiento tras el continued pretraining.
- Generación de código: no evaluado.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni soporte de herramientas para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidad especial: experimento de "self-authored character" y continuidad de identidad sobre un corpus propio, en el marco de investigación sobre bienestar de modelos (model welfare).
- Estado de evaluación: el autor afirma explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad.

## Casos de uso

- Investigación sobre continuidad de identidad en modelos: el checkpoint sirve para estudiar si un modelo mantiene un "personaje" coherente tras un continued pretraining sobre un corpus derivado de sí mismo.
- Estudio de autoentrenamiento y bucles de datos sintéticos: permite analizar qué ocurre cuando un modelo se entrena sobre texto generado por una versión anterior, un fenómeno relevante para el debate sobre colapso de modelos.
- Investigación en model welfare: el marco declarado (repositorio "welfare-improvements") lo orienta a experimentos sobre bienestar, preferencias y narrativa interna de modelos.
- Reproducibilidad metodológica: el par formado por el corpus (`qwen3-32b-commitments-corpus`) y el checkpoint permite replicar el pipeline de continued pretraining con hiperparámetros documentados (lr 1e-05, 1 época, 32,3 M de tokens).
- Análisis de corpus sintético autoescrito: comparar los 39.720 documentos con las salidas posteriores del modelo para medir deriva estilística o temática.
- Docencia y divulgación técnica: como ejemplo práctico de fine-tuning completo de un modelo de 32 B y de las advertencias de seguridad asociadas a checkpoints no evaluados.
- Línea base para comparativas internas: referencia contra la que medir la versión siguiente dentro de la misma serie de checkpoints del autor.

Ninguno de estos casos implica despliegue en producción: el autor lo prohíbe explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el modelo "no ha sido evaluado en capacidad, alineamiento ni identidad todavía".

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (32,76 B) y del tamaño del repositorio (65,5 GB en 16 bits); no proceden de la información publicada por el autor.

- Pesos en fp16/bf16: aproximadamente 65,5 GB, por lo que se necesitan al menos 80 GB de VRAM (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Cuantización de 8 bits: en torno a 33-35 GB de VRAM; viable en 2 x A100 40 GB, 2 x RTX 6000 Ada o similares.
- Cuantización de 4 bits: en torno a 18-20 GB de VRAM más overhead de caché KV; puede caber en una RTX 4090 de 24 GB o en una RTX 3090 de 24 GB, con margen limitado según la longitud de contexto.
- GPU recomendadas: A100 80 GB y H100 80 GB para precisión completa; 2 x RTX 4090, 2 x 3090 o RTX 6000 Ada para cuantizaciones de 4-8 bits.
- En consumer GPU: solo en cuantizaciones agresivas (4 bits) y con contextos cortos; no es viable en GPU de 8-16 GB sin offloading a CPU.
- Opciones de despliegue: no documentadas por el autor. El repositorio solo contiene safetensors, sin GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. Frameworks como vLLM o TGI necesitarían verificar la compatibilidad con la plantilla de chat, que no se publica.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-32b-commitments-v2-sdf | 32,76 B | no disponible | no publicados (sin evaluar) | research-only | HuggingFace, 0 descargas |
| joshycodes/qwen3-32b-commitments-sdf (base directo) | no disponible (misma serie) | no disponible | no publicados | no disponible | HuggingFace |
| Qwen3-32B (familia base) | ~32,8 B | no disponible en esta busqueda | no disponible en esta busqueda | no disponible en esta busqueda | HuggingFace |
| Alternativas open de ~30 B (p. ej. familias Mistral o Gemma de tamano similar) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia research-only: el uso comercial está excluido por los términos declarados; la etiqueta `license: other` con `license_name: research-only` restringe el despliegue.
- Prohibición explícita de despliegue: la model card indica "Do not deploy" y la etiqueta `not-for-deployment` refuerza esta restricción.
- Ausencia total de evaluación: no hay datos de capacidad, alineamiento ni identidad, por lo que se desconoce si el continued pretraining degradó las capacidades originales.
- Riesgo elevado de degradación por continued pretraining: entrenar pesos completos con lr 1e-05 durante una época sobre un corpus reducido (32,3 M de tokens) puede provocar olvido catastrófico o desajustes de formato respecto al modelo base.
- Riesgo de colapso por datos autoescritos: si el corpus procediera efectivamente del propio modelo, existiría riesgo de bucle degenerativo; la model card declara "0 self-authored", lo que contradice el título y añade incertidumbre sobre el contenido real del dataset.
- Sesgos: no disponibles; no se documenta ninguna auditoría de sesgo.
- Alucinación: no evaluada; el modelo no ha pasado pruebas de fidelidad factual.
- Idiomas: no se declaran idiomas soportados, por lo que no se puede garantizar cobertura multilingüe.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Metadatos inconsistentes: la fecha de creación indicada (2026-09-20) y la discrepancia interna sobre el corpus autoral dificultan la trazabilidad del experimento.
- Sin cuantizaciones ni plantilla de chat publicadas: la integración en pipelines estándar (vLLM, llama.cpp, Ollama, TGI) requeriría trabajo adicional no documentado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/joshycodes/qwen3-32b-commitments-v2-sdf
- Modelo base declarado: https://huggingface.co/joshycodes/qwen3-32b-commitments-sdf
- Corpus citado en la model card: https://huggingface.co/joshycodes/qwen3-32b-commitments-corpus
- Repositorio "welfare-improvements": no disponible la URL exacta en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces recuperados corresponden a un sitio bancario sin relacion con la ficha.
