# bcdennis/hcd-tinystories-hier-causal-dm

## Resumen

`bcdennis/hcd-tinystories-hier-causal-dm` es un modelo de lenguaje entrenado desde cero (from scratch) por el usuario bcdennis, publicado en HuggingFace. Se trata de un experimento de investigación, no de un modelo orientado a producción: cuenta con 50.489.856 parámetros y ha sido entrenado durante 12.000 pasos sobre el corpus TinyStories (`roneneldan/TinyStories`, primeras 200.000 historias) usando el tokenizador de GPT-2. La pérdida de validación final reportada es de 2,2054 con una longitud de secuencia de 256 tokens y batch de 32.

La relevancia del modelo es acotada y de carácter experimental. Forma parte de una familia de ejecuciones etiquetadas como "hierarchical concept-diffusion" (HCD), de la que esta es la variante causal (`hcd-causal`). El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta, lo que confirma su naturaleza de artefacto de investigación sin adopción comunitaria.

La model card es extremadamente breve y no documenta la arquitectura interna, la licencia, los idiomas soportados ni resultados de benchmarks más allá de la pérdida de validación. Cualquier evaluación seria del modelo requiere inspeccionar el código de entrenamiento del autor, que no se ha proporcionado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetada como "hierarchical-concept-diffusion", variante causal (`hcd-causal`) |
| Parametros totales | 50.489.856 |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento declarada) |
| Tipos de cuantizacion | No disponible; no se publican variantes cuantizadas |
| Idiomas soportados | Ingles (corpus TinyStories); no declarado explicitamente en la model card |
| Licencia | No disponible |
| Formato de pesos | No disponible explicitamente; el repositorio de 0,3 GB es compatible con pesos en precision completa (fp32, aproximadamente 202 MB de pesos) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las únicas pistas son las etiquetas `hierarchical-concept-diffusion` y `from-scratch`, junto con el identificador de la ejecución (`hcd-causal`), que sugiere una variante causal autorregresiva dentro de una familia de modelos basados en difusión con estructura jerárquica de conceptos. No se especifica el número de capas, dimensiones ocultas, número de cabezas de atención ni si se emplean mecanismos híbridos (atención lineal, SSM, decodificación especulativa). Tampoco se indica si hubo fases de ajuste por preferencias (RLHF, DPO) ni instrucción supervisada.

Los datos de entrenamiento sí están documentados: el corpus `roneneldan/TinyStories`, concretamente las primeras 200.000 historias del split de entrenamiento, tokenizadas con el tokenizador de GPT-2. El entrenamiento se realizó con AdamW (learning rate 0,0001, weight decay 0,1), programación de learning rate coseno con 200 pasos de warmup, batch de 32 y longitud de secuencia de 256 durante 12.000 pasos. La pérdida de validación final de lenguaje fue de 2,2054.

## Capacidades

- Generación de texto narrativo simple en inglés, en el dominio de las historias infantiles cortas de TinyStories.
- Continuación de texto autorregresiva con una ventana efectiva de 256 tokens.
- Coherencia local a nivel de frase y párrafo corto, derivada del corpus de entrenamiento.
- Tool calling / function calling: no disponible, no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo y el corpus no están orientados a ello.
- Capacidades multilingües: no documentadas; el corpus TinyStories está generado en inglés.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada.
- Razonamiento matemático, generación de código o conocimiento factual: no documentado y fuera del alcance del corpus de entrenamiento.

## Casos de uso

- Investigación sobre modelos de difusión jerárquica aplicados a lenguaje: el modelo sirve como punto de comparación (`hcd-causal`) frente a otras variantes de la misma familia experimental, evaluando la pérdida de validación en un corpus controlado.
- Reproducción de experimentos de escalado en modelos pequeños: con 50,5 M de parámetros y 12.000 pasos documentados, permite replicar curvas de aprendizaje en un único GPU de gama media en horas o pocos días.
- Estudio del efecto del corpus TinyStories en la coherencia gramatical: es un banco de pruebas habitual para medir qué estructuras lingüísticas adquiere un modelo con vocabulario restringido y frases simples.
- Generación de cuentos infantiles sintéticos para aumentar datasets: el modelo puede producir narrativas cortas en inglés que sirvan como datos sintéticos auxiliares, siempre con revisión humana.
- Prototipado educativo de pipelines de entrenamiento from scratch: sirve para validar tokenización GPT-2, bucles de entrenamiento con AdamW y evaluación de pérdida antes de escalar a modelos mayores.
- Investigación sobre tokenizadores y longitud de contexto: al estar limitado a 256 tokens, es útil para experimentos que midan degradación de coherencia al superar la ventana de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo reportado es la pérdida de validación del modelo de lenguaje.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion LM (final) | 2,2054 | 12.000 pasos, seq_len 256, batch 32 |
| Pasos de entrenamiento | 12.000 | AdamW, lr 0,0001, wd 0,1, coseno, warmup 200 |
| Tamano del corpus | 200.000 historias | roneneldan/TinyStories, tokenizador GPT-2 |

No se dispone de comparaciones con modelos similares dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 202 MB y la inferencia con batch 1 y secuencia de 256 tokens requiere menos de 1 GB en total. En fp16, los pesos bajan a unos 101 MB; en int8, a unos 50 MB; en int4, a unos 25 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. También es viable en GPU de datacenter (A100, H100) aunque estaría enormemente infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, y también en CPU (la inferencia en CPU es perfectamente viable dado el tamaño).
- Opciones de despliegue: la opción directa es PyTorch con los pesos del repositorio. La integración en vLLM, llama.cpp, Ollama o TGI no está garantizada, ya que estas herramientas requieren arquitecturas soportadas explícitamente y la variante `hcd-causal` no figura entre las habituales; sería necesaria una conversión y una implementación a medida.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. La categoría natural de comparación son los modelos de la familia TinyStories (por ejemplo, los modelos de 1 M a 33 M de parámetros entrenados sobre el mismo corpus por sus autores originales), pero no se han facilitado cifras de parámetros, contexto, rendimiento ni licencia de esos modelos en esta búsqueda, por lo que no se incluyen en la tabla.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bcdennis/hcd-tinystories-hier-causal-dm | 50,49 M | 256 tokens | No disponible | HuggingFace |
| Alternativas TinyStories de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El corpus TinyStories es sintético y generado para ser simple; aun así, el modelo no ha pasado por ningún proceso de alineación o mitigación de sesgos.
- Riesgo de alucinación: alto en cualquier consulta factual. El modelo ha sido entrenado exclusivamente sobre historias infantiles sintéticas y carece de conocimiento del mundo verificable.
- Limitación de contexto: la ventana de 256 tokens es muy reducida; más allá de esa longitud la coherencia se degrada y no hay evidencia de extrapolación posicional.
- Limitación de idioma: el entrenamiento es monolingüe en inglés. No hay datos sobre comportamiento en castellano u otros idiomas; se espera una calidad muy baja fuera del inglés.
- Licencia: no disponible. Al no declararse una licencia explícita, no se puede asumir permiso para uso comercial. Se debe contactar con el autor antes de cualquier uso en producción.
- Ausencia de adopción y validación: cero descargas y cero likes, sin benchmarks publicados, sin evaluación por terceros y sin documentación de la arquitectura. No es apto para producción.
- Arquitectura no estándar: al tratarse de una variante "hierarchical-concept-diffusion" no soportada por los runtimes de inferencia habituales, la integración requeriría trabajo de ingeniería adicional y conocimiento del código del autor.
- Fechas del repositorio: creado y actualizado el 2 de octubre de 2026, con una ventana de actualización de 42 minutos, lo que sugiere una publicación sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcdennis/hcd-tinystories-hier-causal-dm
- Corpus de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las únicas coincidencias devueltas corresponden a contenido no relacionado (una misión del videojuego World of Warcraft) y no aportan información sobre el modelo.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
