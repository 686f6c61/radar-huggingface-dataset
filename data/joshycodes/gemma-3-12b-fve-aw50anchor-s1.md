# joshycodes/gemma-3-12b-fve-aw50anchor-s1

## Resumen

`joshycodes/gemma-3-12b-fve-aw50anchor-s1` es un checkpoint de investigación derivado de `google/gemma-3-12b-it`. Lo publica el usuario joshycodes y se obtiene mediante entrenamiento continuado (continued pretraining) sobre los pesos completos del modelo base, con un learning rate de 1e-05 y una única epoch. Se enmarca en una línea de trabajo sobre bienestar de modelos (model welfare) y ajuste con documentos sintéticos (synthetic-document-finetuning, SDF): el corpus, llamado `flourishing-vs-equanimity`, fue redactado por el propio modelo, en el rol de personaje que ya interpreta, para entrenar a la siguiente versión de sí mismo.

El entrenamiento empleó 7.552.066 tokens distribuidos en 7.767 documentos, de los cuales la propia model card especifica que 0 son autoescritos y 7.767 son texto ordinario. Cuenta con 13.194.203.760 parámetros (unos 13,2 mil millones) y el repositorio ocupa 26,4 GB en pesos completos. La licencia es research-only y el autor advierte de forma explícita de que no debe desplegarse.

Su relevancia es metodológica y experimental: sirve para estudiar autoentrenamiento, identidad y bienestar de modelos, no como modelo listo para producción. No se ha evaluado todavía en capacidad, alineación ni identidad, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `google/gemma-3-12b-it`) |
| Parametros totales | 13.194.203.760 (aproximadamente 13,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según la documentación del modelo base Gemma 3; no especificada de forma independiente para este checkpoint |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio distribuye pesos safetensors sin cuantizar (26,4 GB, coherente con bf16) |
| Idiomas soportados | No disponible (el modelo base Gemma 3 declara soporte para más de 140 idiomas) |
| Licencia | research-only (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-3-12b-it`: un transformer decoder-only denso, con una ventana de contexto de 128.000 tokens y capacidades multimodales según la documentación de Gemma 3. Este checkpoint no introduce cambios estructurales: el proceso aplicado es un continued pretraining sobre los pesos completos del modelo base, con learning rate 1e-05 y una epoch.

El corpus de entrenamiento es `flourishing-vs-equanimity`, generado por el propio modelo como personaje, y consta de 7.552.066 tokens en 7.767 documentos. La model card precisa que de esos documentos 0 son autoescritos y 7.767 son texto ordinario, un detalle relevante porque matiza la descripción de "corpus autoescrito". El encuadre, el plan y la evaluación provienen del repositorio welfare-improvements. No se documentan en la información disponible otras innovaciones técnicas (decodificación especulativa, atención lineal, RLHF o DPO), ni datos sobre la composición detallada del dataset.

## Capacidades

- Generación de texto: capacidades heredadas del modelo base, aunque no evaluadas tras el continued pretraining.
- Razonamiento, código y matemáticas: presumiblemente heredadas de Gemma 3 12B, pero sin evaluación publicada para este checkpoint.
- Capacidades multimodales: el modelo base Gemma 3 es multimodal, si bien la model card no confirma que este checkpoint conserve dichas capacidades.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no documentadas para este checkpoint; heredadas potencialmente del modelo base.
- Capacidad especial: ajuste orientado a identidad y bienestar de modelos dentro de la línea de investigación SDF.
- Restricción explícita: no evaluado en capacidad, alineación ni identidad; el autor indica que no debe desplegarse.

## Casos de uso

- Investigación en bienestar de modelos: el checkpoint permite estudiar cómo un modelo responde tras un continued pretraining guiado por criterios de bienestar, comparándolo con el modelo base en experimentos controlados de identidad.
- Estudio metodológico de SDF: sirve para analizar el impacto del ajuste con documentos sintéticos sobre los pesos completos y sobre la coherencia de personaje.
- Experimentos de autoentrenamiento: útil para investigar dinámicas de autoentrenamiento y sus efectos sobre el comportamiento del modelo, dado que el corpus fue redactado por el propio modelo.
- Reproducibilidad académica: al documentarse learning rate, epoch, número de tokens y documentos, permite replicar el procedimiento en otros modelos base dentro de un entorno de laboratorio.
- Análisis de deriva de identidad: comparación antes/después del entrenamiento para medir cambios en la auto-representación del modelo.
- Base para evaluaciones de alineación: punto de partida para diseñar baterías de evaluación de alineación e identidad, según indica el propio autor.
- No apto para aplicaciones en producción: la licencia research-only y la advertencia del autor excluyen su uso en sistemas desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos completos en bf16: aproximadamente 26,4 GB, por lo que la inferencia requiere del orden de 28-30 GB de VRAM con overhead de activaciones.
- GPUs recomendadas para precisión completa: A100 40 GB, A100 80 GB, H100 o equivalentes.
- GPUs consumer: una RTX 4090 (24 GB) no permite cargar los pesos en bf16 sin cuantizar; sería necesario cuantizar a 8 bits o 4 bits para ajustar en memoria.
- Cuantización estimada: en 8 bits, unos 14-16 GB; en 4 bits, unos 7-9 GB, lo que permitiría su ejecución en GPUs consumer como RTX 3090, RTX 4090 o superiores.
- Opciones de despliegue: llama.cpp, Ollama o vLLM tras convertir los pesos a GGUF; el repositorio solo distribuye safetensors, por lo que se requiere conversión previa.
- Latencia y throughput estimados: no disponibles. El checkout no incluye mediciones de rendimiento y el autor lo clasifica como no desplegable, por lo que no se recomienda su uso en escenarios con requisitos de latencia.
- Almacenamiento: 26,4 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-aw50anchor-s1 | 13,2B | 128K (heredado) | No evaluado | research-only | HuggingFace (0 descargas) |
| google/gemma-3-12b-it | 12B | 128K | Publicado por Google | Términos de Gemma | HuggingFace |
| joshycodes/gemma-3-12b-fve-flouranchor-s1 | 12B aprox. | 128K (heredado) | No evaluado | research-only | HuggingFace |
| google/gemma-3-4b-it | 4B | 128K | Publicado por Google | Términos de Gemma | HuggingFace |

Los dos checkpoints de joshycodes comparten enfoque (continued pretraining sobre corpus propio), pero se diferencian en el corpus y en el número de tokens y documentos (7.552.066 tokens y 7.767 documentos en este caso, frente a 7.582.351 tokens y 7.800 documentos en la variante flouranchor). No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- No evaluado: el autor indica que no se ha evaluado en capacidad, alineación ni identidad; cualquier uso implica asumir un comportamiento desconocido.
- No desplegable: la model card señala explícitamente "Do not deploy".
- Licencia restringida: research-only, lo que impide el uso comercial y limita el uso a investigación.
- Sesgos: no disponibles; no se documentan análisis de sesgos para este checkpoint.
- Riesgo de alucinación: no evaluado tras el continued pretraining; se desconoce si aumenta o disminuye respecto al modelo base.
- Corpus reducido: 7,5 millones de tokens en una sola epoch, un volumen bajo que puede producir cambios sutiles y difíciles de caracterizar.
- Ambigüedad documental: la model card describe el corpus como autoescrito pero indica 0 documentos autoescritos, lo que dificulta interpretar con precisión la naturaleza de los datos.
- Idiomas: la model card no especifica idiomas soportados para este checkpoint.
- Sin señales de adopción: 0 descargas y 0 likes, sin comunidad que valide su comportamiento.
- Contexto: la ventana de 128K corresponde al modelo base; no se confirma su conservación efectiva tras el continued pretraining.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/joshycodes/gemma-3-12b-fve-aw50anchor-s1
- Variante flouranchor: https://huggingface.co/joshycodes/gemma-3-12b-fve-flouranchor-s1
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-3-12b-it
- Repositorio Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Librería Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Imagen Docker de Gemma 3 (Unsloth): https://hub.docker.com/r/ai/gemma3
