# richardyoung/Muse-Glimmer-30B-heretic-GGUF

## Resumen

Muse-Glimmer-30B-heretic-GGUF es una cuantización en formato GGUF del modelo Muse-Glimmer-30B-heretic, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "uncensored" del modelo base Muse-Glimmer-30B, es decir, un modelo al que se le han eliminado o atenuado los mecanismos de rechazo aprendidos durante el ajuste fino por alineamiento, manteniendo el resto de capacidades. El resultado es un modelo multimodal (image-text-to-text) con capacidades declaradas de razonamiento y visión, orientado a ejecución local mediante llama.cpp y Ollama.

El modelo cuenta con 27.854.794.240 parámetros reales según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de aproximadamente 28B parámetros, comercializado bajo la etiqueta "30B". La licencia declarada es Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face. Su relevancia actual radica en que ofrece una alternativa de despliegue local con cuantizaciones GGUF (incluyendo variantes generadas con imatrix) para un modelo multimodal con razonamiento, un nicho con relativamente pocas opciones de este tamaño.

La información disponible sobre el modelo es limitada: no se detallan los idiomas soportados, no hay resultados de benchmarks publicados en la ficha y no se especifica la composición del dataset de entrenamiento ni el proceso de alineamiento original. Esta ficha refleja exclusivamente los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no especificada) |
| Parametros totales | 27.854.794.240 (~27,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones; incluye variantes generadas con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. Los tags indican que es un modelo multimodal de tipo image-text-to-text con capacidades de razonamiento y visión, lo que sugiere una arquitectura transformer con un codificador visual acoplado a un decodificador de lenguaje, pero no se confirma ni el tipo exacto de atención, ni el número de capas, ni la dimensionalidad. El modelo base es richardyoung/Muse-Glimmer-30B-heretic, del que esta publicación es una cuantización GGUF.

Respecto al entrenamiento, no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La etiqueta "heretic" y "abliterated" indica que se aplicó una técnica de eliminación de direcciones de rechazo (abliteration) sobre el modelo original, un procedimiento que modifica los pesos para suprimir el comportamiento de negativa ante ciertas peticiones sin reentrenar desde cero. Los tags incluyen dos referencias arXiv (2406.11717 y 2510.18892), presumiblemente relacionadas con las técnicas de abliteration o con el modelo base, aunque no se detalla su contenido en la información disponible. Las cuantizaciones incluyen variantes generadas con imatrix (importance matrix), una técnica de cuantización que optimiza la asignación de bits usando estadísticas de activación.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento: el modelo declara capacidades de reasoning en sus tags.
- Visión: pipeline image-text-to-text, es decir, acepta imágenes como entrada junto con texto.
- Procesamiento de imágenes y descripción visual (implícito en el pipeline declarado).
- Ejecución local mediante llama.cpp y Ollama, según los tags del repositorio.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Comportamiento "uncensored"/abliterated: menor probabilidad de rechazar peticiones que el modelo base alineado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el tag de reasoning sugiere cierta capacidad, pero no se detalla.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue local de un modelo multimodal: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo mediante llama.cpp u Ollama, permitiendo procesar imágenes y texto sin depender de APIs externas.
- Análisis de documentos con imágenes: el pipeline image-text-to-text permite extraer información de capturas, diagramas o documentos escaneados combinándolos con instrucciones textuales, útil en entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Asistente conversacional sin filtros restrictivos: la variante heretic está pensada para escenarios de investigación creativa o redacción donde el modelo base rechazaría peticiones por sus salvaguardas; adecuado para entornos controlados y con supervisión humana.
- Prototipado de aplicaciones de visión-lenguaje: investigadores pueden usar las cuantizaciones para validar pipelines de VLM localmente antes de escalar a infraestructura mayor, aprovechando el formato GGUF y la compatibilidad con endpoints.
- Experimentación en investigación sobre alineamiento y abliteration: el modelo sirve como objeto de estudio para analizar cómo la eliminación de direcciones de rechazo afecta al comportamiento, la calidad y la seguridad, comparándolo con el modelo base.
- Generación de descripciones y etiquetado de imágenes a escala en local: con un modelo de ~28B cuantizado se puede procesar lotes de imágenes para generar metadatos o descripciones, siempre que el hardware disponible lo permita.
- Evaluación comparativa de cuantizaciones: las variantes con imatrix permiten estudiar el impacto de distintas cuantizaciones en la calidad de salida de un modelo multimodal de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (27,9B parámetros), una cuantización Q4_K_M requeriría aproximadamente 16-18 GB de VRAM solo para los pesos, más overhead de contexto y del codificador visual; Q8_0 requeriría del orden de 30 GB o más. Estas cifras son estimaciones de orden de magnitud, no datos publicados.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, serían necesarias GPU con 24 GB o más de VRAM (RTX 3090/4090, A6000, A100 40/80 GB, H100) para cuantizaciones medias o altas.
- ¿Cabe en GPU de consumo? Las cuantizaciones bajas (Q4 o inferiores) podrían caber en GPU de 24 GB como la RTX 4090 o la RTX 3090, siempre sujeto a verificación práctica; las cuantizaciones altas no caben en GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama (según tags), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables suficientes en la información proporcionada para establecer una comparativa rigurosa con alternativas. Como referencia estructural, se puede comparar con el propio modelo base del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|
| Muse-Glimmer-30B-heretic-GGUF (este) | ~27,9B | no disponible | GGUF | Apache 2.0 | Cuantización local, multimodal, abliterated, acceso gated |
| Muse-Glimmer-30B-heretic (base) | ~27,9B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar, misma familia |
| Alternativas de ~30B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminación de mecanismos de rechazo puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no es recomendable su uso en producción orientada al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir información incorrecta, especialmente en tareas de visión o razonamiento complejo.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento en castellano es desconocido y debe validarse empíricamente.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido (gated) y requiere aceptar condiciones; además, el modelo base y las técnicas de abliteration pueden conllevar obligaciones o consideraciones adicionales no detalladas.
- Benchmarks ausentes: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no es posible comparar su calidad de forma objetiva.
- Calidad de cuantización: las cuantizaciones bajas pueden degradar capacidades de razonamiento y visión; las variantes imatrix buscan mitigarlo, pero no hay mediciones publicadas.
- Uso responsable: al tratarse de un modelo sin salvaguardas, debe desplegarse en entornos controlados y con supervisión humana.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/Muse-Glimmer-30B-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Muse-Glimmer-30B-heretic
- Paper arXiv 2406.11717: https://arxiv.org/abs/2406.11717
- Paper arXiv 2510.18892: https://arxiv.org/abs/2510.18892
