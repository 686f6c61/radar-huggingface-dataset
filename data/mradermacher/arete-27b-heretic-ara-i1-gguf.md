# mradermacher/Arete-27B-Heretic-ARA-i1-GGUF

## Resumen

Arete-27B-Heretic-ARA-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo Luni/Arete-27B-Heretic-ARA, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26,9B) derivado de la familia Arete-27B. El prefijo "Heretic" y las etiquetas "abliterated" y "uncensored" indican que el modelo base ha sido sometido a un proceso de ablación de rechazos (refusal ablation), una técnica que modifica los pesos para eliminar los comportamientos de negativa del modelo ante determinadas peticiones. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino versiones cuantizadas en formato GGUF con calibración imatrix, pensadas para inferencia local eficiente.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización, no de un modelo original: el valor técnico está en la variedad de niveles de cuantización (desde IQ1_S hasta Q6_K) y en el uso de matrices de importancia (imatrix) para preservar la calidad en los niveles más agresivos de compresión. El modelo base declara soporte de visión según la model card del cuantizador, lo que lo sitúa en la categoría de modelos multimodales de ~27B con licencia Apache 2.0, un perfil poco común por su combinación de tamaño, licencia permisiva y naturaleza descensurada.

El repositorio tiene, en el momento de la consulta, cero descargas y cero "likes", y fue creado y actualizado el 9 de noviembre de 2026. El tamaño total del repo es de 38,9 GB, coherente con un conjunto completo de cuantizaciones de un modelo de 27B. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no publicados en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Luni/Arete-27B-Heretic-ARA en la documentacion proporcionada. Por el numero de parametros (26,9B) y la nomenclatura "27B", se trata de un transformer denso de escala media-grande, pero no se confirman ni el numero de capas, ni las dimensiones ocultas, ni el tipo de atencion (estandar, GQA, sliding window, etc.). Tampoco se especifican los datos de entrenamiento, el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO o similares.

Lo que si documenta el repositorio es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (matriz de importancia) a partir del modelo base, empleando el pipeline de conversion a GGUF (convert_type: hf) y la version de cuantizacion 2. Las cuantizaciones imatrix mejoran la preservacion de calidad en niveles bajos al ponderar los tensores segun su importancia, en lugar de aplicar una cuantizacion uniforme. El autor indica ademas que las cuantizaciones "estaticas" (sin imatrix) estan disponibles en un repositorio separado. La etiqueta "abliterated" sugiere que el modelo base fue modificado mediante tecnicas de ablacion de direcciones de rechazo en el espacio de activaciones, aunque el repositorio no detalla el metodo concreto.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Comportamiento descensurado (uncensored/abliterated): el modelo base ha sido modificado para reducir las negativas ante peticiones que un modelo alineado rechazaria.
- Soporte de vision: la model card del cuantizador indica explicitamente "This is a vision model", con ficheros mmproj (si existen) en el repositorio estatico. No se detalla la resolucion de imagen ni el codificador visual.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que los pesos pueden servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking" en la informacion disponible.
- Capacidades multilingues limitadas al ingles declarado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion de rechazos comparando su comportamiento con el modelo base alineado, en entornos controlados de evaluacion de sesgos y robustez.
- Inferencia local en estaciones de trabajo con GPU consumer: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en fp16.
- Prototipado de asistentes conversacionales en ingles: el modelo puede integrarse en aplicaciones de chat multi-turno donde se requiera baja latencia y despliegue on-premise, evitando dependencias de APIs externas.
- Generacion de texto creativo sin restricciones de contenido: util para experimentacion con narrativa, guiones o dialogos donde el filtrado del modelo base resulta limitante, siempre con las cautelas legales y eticas correspondientes.
- Evaluacion de pipelines de cuantizacion: el repositorio ofrece 24 variantes de cuantizacion del mismo modelo, lo que permite medir el impacto de cada nivel (IQ1 a Q6) en perplejidad y calidad de generacion sobre un mismo modelo base.
- Despliegue en entornos con recursos muy limitados: las cuantizaciones IQ1_S e IQ2_XXS permiten cargar el modelo en hardware con poca memoria, a costa de una perdida de calidad significativa, para tareas de prueba o demostracion.
- Procesamiento de imagenes con modelos cuantizados: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede emplearse en tareas de descripcion de imagenes o VQA en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada segun tamano de pesos): Q6_K ~22-24 GB; Q5_K_M ~19-20 GB; Q4_K_M ~16-17 GB; IQ4_XS ~15 GB; Q3_K_M ~13-14 GB; IQ2_XXS ~8-9 GB; IQ1_S ~5-6 GB. Estas cifras son estimaciones a partir del tamano del modelo y deben validarse con la tabla de tamanos del repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 y cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q6_K, Q5_K_M y Q4_K_M; RTX 4080/4070 Ti (16 GB) para IQ4_XS y Q4_K_M con contexto moderado; GPUs de 8-12 GB para cuantizaciones IQ2/IQ3.
- Cabe en GPU consumer: si, en RTX 4090 y superiores para cuantizaciones medias-altas; en GPUs de 8-12 GB solo con cuantizaciones de 1-3 bits.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Heretic-ARA-i1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF (imatrix) | Vision, descensurado, solo ingles |
| Luni/Arete-27B-Heretic-ARA (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Arete-27B-Heretic-ARA-GGUF (estatico) | ~26,9B | no disponible | Apache 2.0 | GGUF (estatico) | Mismas cuantizaciones sin imatrix; incluye mmproj |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo descensurado (abliterated): la ablacion de rechazos puede degradar la coherencia en dominios sensibles y elimina salvaguardas frente a contenido danino. No es adecuado para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; al ser un modelo de 27B sin benchmarks publicos, la tasa de alucinacion es desconocida.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto del modelo base, lo que impide planificar aplicaciones con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineacion.
- Cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS): perdida de calidad significativa; no recomendadas para tareas que requieran razonamiento complejo.
- Repositorio con cero descargas y sin validacion comunitaria: no hay evidencia de calidad reportada por terceros.
- Vision: los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos, el modelo funciona solo como texto.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la integridad y procedencia de los ficheros antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Arete-27B-Heretic-ARA-i1-GGUF
- Modelo base: https://huggingface.co/Luni/Arete-27B-Heretic-ARA
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Arete-27B-Heretic-ARA-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Arete-27B-Heretic-ARA-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
