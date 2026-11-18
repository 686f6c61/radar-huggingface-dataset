# mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF

## Resumen

Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF es una cuantizacion en formato GGUF del modelo jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated, publicada por mradermacher. El modelo base parte de la familia Qwen3.5 (9B parametros, 8.953.803.264 exactos segun safetensors) y ha sido sometido a un proceso de "abliteration", una tecnica que elimina o atenua las direcciones de activacion asociadas a rechazos y negativas aprendidas durante el alineamiento. El resultado es un modelo conversacional especializado en dominios de ciberseguridad que responde sin las restricciones habituales de seguridad del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de cuantizacion (i1, imatrix) que permite ejecutar un modelo de ~9B parametros en hardware de consumo mediante llama.cpp y derivados. Por otro, ilustra el fenomeno de los modelos "abliterated": variantes que priorizan la utilidad en tareas de seguridad ofensiva, analisis de vulnerabilidades y red teaming a costa de eliminar los mecanismos de rechazo. Esta publicacion concreta incluye unicamente un fichero imatrix de 0,1 GB, no los pesos cuantizados completos, que se distribuyen en el repositorio estatico enlazado por el autor.

El modelo declara licencia Apache 2.0, soporte unicamente de ingles y etiquetas de ciberseguridad, abliterated y qwen3.5. La model card es minima: no aporta informacion sobre arquitectura interna, datos de entrenamiento, benchmarks ni proceso de abliteration, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos de la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); repo incluye fichero imatrix de 0,1 GB |
| Modelo base | jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated |
| Repositorio estatico de cuantizaciones | mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF |
| Tamano del repo | 22,2 GB |
| Fecha de creacion | 2026-11-18 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura (Qwen3.5) y el recuento de parametros (~8,95B), se trata de un transformer decoder-only de la familia Qwen, pero la model card no especifica numero de capas, dimensiones ocultas, mecanismo de atencion (estandar, GQA o lineal) ni si incorpora componentes hibridos. Tampoco se documenta la longitud de contexto nativa.

El proceso de "abliteration" aplicado en el modelo base consiste, segun la practica habitual de esta tecnica, en identificar las direcciones de activacion responsables de los rechazos y restarlas o proyectarlas fuera de los pesos. La model card no detalla el metodo concreto, el conjunto de datos utilizado para calcular las direcciones de rechazo, ni si hubo un ajuste fino posterior. El modelo se presenta como especializado en ciberseguridad, lo que sugiere un entrenamiento o ajuste orientado a ese dominio, pero no se aporta informacion sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO. La cuantizacion i1 de mradermacher emplea ficheros imatrix para mejorar la calidad de las cuantizaciones de baja precision, aunque el repositorio solo incluye el fichero imatrix y no los pesos cuantizados finales.

## Capacidades

- Generacion de texto conversacional en ingles, con la salvedad de que el alineamiento de seguridad ha sido atenuado (abliterated).
- Orientacion declarada a tareas de ciberseguridad: analisis de vulnerabilidades, red teaming, explicacion de tecnicas ofensivas y defensivas.
- Capacidad de vision: la model card indica explicitamente "This is a vision model", con ficheros mmproj (si existen) en el repositorio estatico.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking explicito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de vulnerabilidades en entornos controlados: el modelo puede explicar clases de fallos (inyeccion SQL, XSS, desbordamientos) y proponer vectores de prueba en laboratorios de seguridad autorizados, aprovechando su ajuste especifico en ciberseguridad.
- Red teaming y ejercicios de penetracion: util para generar hipotesis de ataque y guiones de prueba en entornos con autorizacion explicita, gracias a la eliminacion de rechazos del alineamiento original.
- Formacion y concienciacion en seguridad: generacion de escenarios realistas de ingenieria social y phishing simulado para programas internos de formacion, con la ventaja de que el modelo no bloquea la generacion de ejemplos plausibles.
- Analisis de malware y explicacion de tecnicas: descripcion de comportamiento de muestras, tacticas MITRE ATT&CK y mecanismos de persistencia en un contexto de analisis defensivo.
- Asistencia en respuesta a incidentes: resumen de indicadores de compromiso, correlacion de logs y redaccion de informes tecnicos en ingles.
- Despliegue local en hardware de consumo: al distribuirse en GGUF con cuantizaciones desde IQ1 hasta Q6_K, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada de gama alta, lo que facilita laboratorios aislados y air-gapped.
- Evaluacion de riesgos de modelos abliterated: uso como caso de estudio para investigadores que analizan como la eliminacion de rechazos afecta a la utilidad y a la seguridad de los asistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (9B parametros, aproximada segun cuantizacion): Q4_K_M ~5,5-6 GB; Q5_K_M ~6,5-7 GB; Q6_K ~7,5-8 GB; Q8 ~9,5-10 GB; cuantizaciones IQ2/IQ3 ~3-4,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas y contexto largo; A100/H100 solo si se requiere throughput elevado o contexto muy extendido.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores; las cuantizaciones IQ2/IQ3 permiten incluso 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; seria necesario convertir a safetensors.
- Latencia y throughput estimados: no disponibles. Dependeran de la cuantizacion, el hardware y el backend; en una RTX 4090 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay datos publicados que lo confirmen.
- Nota importante: el repositorio i1 solo contiene el fichero imatrix (0,1 GB); los pesos cuantizados deben descargarse del repositorio estatico enlazado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF (este) | ~8,95B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en ciberseguridad, abliterated, solo ingles |
| Qwen3.5-9B-CyberSecurity-Abliterated (base) | ~8,95B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-9B (generico) | ~9B | no disponible | Apache 2.0 | safetensors/GGUF | Variante no abliterated; rechaza contenido ofensivo |
| Otras variantes abliterated de la familia Qwen | ~7-9B | variable | Apache 2.0 | GGUF/safetensors | Sin ajuste especifico de ciberseguridad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido ofensivo, instrucciones de ataque o material dual-use sin filtros. Su uso debe restringirse a entornos autorizados (red teaming, investigacion, formacion).
- Riesgo de alucinacion: como cualquier LLM de ~9B, puede inventar CVE, comandos o procedimientos; requiere verificacion humana en contextos de seguridad.
- Solo ingles: no se garantiza calidad en castellano ni en otros idiomas.
- Contexto no documentado: se desconoce la ventana nativa y si el proceso de abliteration o cuantizacion la afecta.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones que regulan herramientas de seguridad ofensiva.
- La model card es minima: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio i1 no contiene los pesos cuantizados completos, solo el fichero imatrix; es necesario acudir al repositorio estatico.
- El modelo base declara vision, pero no se confirma la presencia de ficheros mmproj en este repositorio; verificar en el repositorio estatico antes de asumir capacidades multimodales.
- Riesgo de uso malicioso: al tratarse de un modelo especializado en ciberseguridad sin alineamiento de rechazo, su distribucion plantea riesgos de abuso; se recomienda desplegarlo en entornos controlados y con registro de uso.

## Enlaces

- Repositorio Hugging Face (i1 GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF
- Modelo base: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated
- Pagina de resumen de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
