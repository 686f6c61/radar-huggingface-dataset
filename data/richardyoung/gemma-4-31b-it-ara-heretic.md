# richardyoung/gemma-4-31B-it-ARA-heretic

## Resumen

`richardyoung/gemma-4-31B-it-ARA-heretic` es un fine-tune del modelo multimodal `google/gemma-4-31B-it` publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" (tambien etiquetada como *uncensored*, *decensored* y *abliterated*), una familia de intervenciones sobre los pesos que buscan reducir o eliminar los mecanismos de rechazo y alineacion de seguridad del modelo base, manteniendo el resto de capacidades. El pipeline declarado es `image-text-to-text`, por lo que conserva la naturaleza multimodal del original: acepta imagenes y texto como entrada y genera texto.

El modelo cuenta con 31.273.086.512 parametros (aproximadamente 31,3 mil millones), almacenados en safetensors, con un repositorio de 62,6 GB, lo que sugiere pesos en precision bf16/fp16. La ficha tecnica oficial del autor no esta incluida en la informacion disponible, de modo que muchos detalles (contexto, composicion del dataset de ablacion, idiomas) no pueden confirmarse y se marcan como no disponibles.

La relevancia de esta publicacion es doble: por un lado, demuestra la aplicabilidad de tecnicas de *abliteration* sobre modelos multimodales de gran tamano; por otro, plantea consideraciones eticas y legales importantes, ya que el acceso esta restringido (gated) y la licencia declarada es Apache-2.0, mientras que el modelo base de Google suele distribuirse bajo terminos propios de Gemma. Cualquier uso en produccion exige verificar la compatibilidad de licencias y asumir los riesgos de un modelo sin alineacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en la model card; ver advertencias sobre el modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del `google/gemma-4-31B-it`, un modelo multimodal de la familia Gemma 4 disenado para tareas image-text-to-text. La intervencion aplicada es del tipo *heretic/abliterated*: se modifican selectivamente los pesos o direcciones de activacion asociadas a comportamientos de rechazo, sin reentrenar el modelo desde cero. Este tipo de tecnica (abliteration) suele implicar la identificacion de direcciones en el espacio de activaciones responsables de la negativa a responder y su proyeccion fuera de los pesos, preservando el resto de capacidades del modelo base. Los detalles exactos del procedimiento, el numero de tokens de ajuste (si lo hubo) y la composicion del dataset no estan disponibles en la informacion proporcionada.

El autor incluye en los tags referencias a dos articulos arXiv (`arxiv:2607.02770` y `arxiv:2611.17846`) y la etiqueta `reproducible`, lo que sugiere que el proceso de ablacion esta documentado y puede replicarse. No obstante, el contenido de esos papers no se ha proporcionado, por lo que no se puede confirmar si describen la metodologia concreta empleada. Tampoco se dispone de informacion sobre si se aplico RLHF, DPO u otras fases de alineacion adicionales tras la ablacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Capacidades de razonamiento y codigo propias de Gemma 4 31B-it (no verificadas de forma independiente en esta variante).
- Comportamiento "uncensored": menor probabilidad de rechazar peticiones que el modelo base rechazaria por politicas de seguridad.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidades multilingues: no disponibles (los idiomas no se declaran en la model card).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: estudio comparativo entre el modelo base y su variante abliterated para medir como cambia la tasa de rechazo, la utilidad percibida y los sesgos residuales en un modelo multimodal de 31B.
- Analisis de robustez de filtros: evaluacion de sistemas de moderacion de contenido frente a modelos decensored, para calibrar clasificadores de seguridad en pipelines de produccion.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o narrativa que aborde temas sensibles donde el modelo base aplicaria rechazos, en entornos controlados y con supervision humana.
- Red teaming interno: uso del modelo como adversario para probar defensas, prompts de seguridad y politicas de uso en plataformas que despliegan Gemma 4.
- Descripcion de imagenes en dominios especializados: al conservar el pipeline image-text-to-text, puede emplearse para tareas de captioning o VQA en datasets donde el modelo base rechaza contenido por sus filtros (por ejemplo, imagenes medicas o forenses), siempre con revision etica y legal.
- Experimentacion academica con tecnicas de ablacion: reproduccion de los resultados del autor gracias a la etiqueta `reproducible`, comparando variantes de ablacion sobre el mismo checkpoint base.
- Prototipado de asistentes conversacionales de nicho: escenarios donde el equipo asume la responsabilidad del contenido generado y necesita un modelo que no interrumpa el flujo con negativas, con las salvaguardas implementadas a nivel de aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 80 GB para una GPU unica.
- Cuantizacion a 8 bits: ~31-35 GB de VRAM, viable en A100 40GB/80GB, H100, L40S o dos RTX 4090.
- Cuantizacion a 4 bits: ~16-20 GB de VRAM, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, con perdida de calidad no cuantificada.
- GPU recomendadas: H100 80GB, A100 80GB para precision completa; A100 40GB o L40S 48GB con cuantizacion 8 bits; RTX 4090/3090 solo con cuantizacion agresiva.
- Despliegue: `transformers` (libreria declarada), y previsiblemente vLLM, TGI o llama.cpp si existen conversiones GGUF (no confirmadas). Ollama requeriria una conversion GGUF no disponible en el repositorio.
- Latencia y throughput: no disponibles. Como referencia generica para un modelo denso de ~31B en H100 con bf16, cabe esperar decenas de tokens por segundo, pero no se ha medido para esta variante.
- El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-ARA-heretic | ~31,3 B | no disponible | image-text-to-text | apache-2.0 (declarada) | Fine-tune abliterated, acceso gated |
| google/gemma-4-31B-it (base) | ~31,3 B | no disponible | image-text-to-text | terminos Gemma | Modelo original alineado |
| Otras variantes heretic/abliterated de la familia Gemma | variable | variable | variable | variable | Comunidad; calidad y metodologia heterogeneas |
| Modelos multimodales densos ~30B de otros laboratorios | ~30 B | variable | vision-lenguaje | variable | Alternativas no disponibles en la informacion proporcionada |

La comparacion cuantitativa con alternativas no puede realizarse porque no se han publicado benchmarks ni datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- Modelo decensored: la ablacion elimina o reduce los mecanismos de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal. No debe desplegarse sin capas de moderacion externas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; la ablacion puede agravar la tendencia a responder con seguridad sobre temas que el modelo base trataria con cautela.
- Sesgos: los sesgos del modelo base (genero, raza, idioma, cultura) persisten y pueden amplificarse al eliminar filtros; no se han documentado evaluaciones de sesgo para esta variante.
- Licencia: la model card declara apache-2.0, pero el modelo base `google/gemma-4-31B-it` se distribuye bajo los terminos de Gemma, que imponen restricciones de uso (incluida una politica de uso prohibido). Existe una posible incompatibilidad entre ambas licencias que el usuario debe verificar antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es un modelo de descarga libre.
- Idiomas y contexto: no declarados; no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva sin pruebas propias.
- Reproducibilidad: aunque el autor etiqueta el modelo como `reproducible`, no se proporciona en la informacion disponible la metodologia detallada ni los scripts de ablacion.
- Uso en produccion: no recomendado para aplicaciones orientadas al publico sin auditoria legal y de seguridad previa; la responsabilidad del contenido recae integramente en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper referenciado (tag): https://arxiv.org/abs/2607.02770
- Paper referenciado (tag): https://arxiv.org/abs/2611.17846
