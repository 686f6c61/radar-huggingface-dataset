# mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF

## Resumen

Qwen3.8-27B-RANA-abliterated-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo abliterant/Qwen3.8-27B-RANA-abliterated, un derivado de la familia Qwen3 con 27.320.697.856 parametros totales. La prepara mradermacher, un conocido publicador de cuantizaciones (Q2_K hasta Q8_0, ademas de variantes imatrix en un repositorio separado), a partir del modelo base ya modificado mediante la tecnica de "abliteration": la eliminacion de la direccion de rechazo (refusal direction) en el espacio de activaciones para reducir la tendencia del modelo a negarse a responder.

El modelo base declara capacidades de vision-lenguaje (etiqueta vision-language) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia. El repositorio ocupa 190,8 GB en total e incluye tanto los ficheros GGUF de lenguaje como los suplementos multimodales mmproj (Q8_0 de 0,7 GB y f16 de 1,0 GB) necesarios para procesar imagenes con llama.cpp.

La relevancia de esta ficha es doble: por un lado, ofrece una via practica de ejecutar un modelo de 27B con vision en hardware de consumo gracias a las cuantizaciones K-quant; por otro, ilustra los riesgos de los modelos "uncensored" derivados de abliteration, que pierden parte de las salvaguardas del modelo original. La informacion publica disponible es escasa: no hay datos de benchmarks, contexto ni composicion del dataset en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3; sin detalle en la model card) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16; variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas, quantize_version 2, output_tensor_quantised 1) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Por las etiquetas (qwen3, vision-language) y el tamano (27,3B parametros), se trata presumiblemente de un transformer de la familia Qwen3 con adaptador multimodal para entrada de imagenes, pero la model card no confirma numero de capas, dimension oculta, tipo de atencion ni si emplea mezcla de expertos. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada es la abliteration aplicada al modelo base: se identifica una "direccion de rechazo" en el espacio de activaciones y se proyecta fuera de los pesos, de modo que el modelo pierde buena parte de su comportamiento de negativa ante ciertas peticiones. El publicador de la cuantizacion ha generado los GGUF a partir del checkpoint en formato Hugging Face (convert_type: hf) con cuantizacion estatica de tensores de salida, e incluye los ficheros mmproj necesarios para el codificador visual. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el idioma declarado.
- Procesamiento de vision-lenguaje: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp y derivados.
- Comportamiento "uncensored": la abliteration reduce las negativas del modelo ante peticiones que el original rechazaria; util para investigacion sobre alineamiento y para tareas creativas o de red teaming.
- Razonamiento y codigo: no documentados explicitamente en la model card; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: la model card solo declara ingles; no se confirman otros idiomas.
- Modo thinking: no documentado; no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta a las respuestas en dominios sensibles, comparando el comportamiento con el Qwen3 original y midiendo la degradacion de salvaguardas.
- Despliegue local con vision en hardware de consumo: con la cuantizacion Q4_K_M (16,9 GB) mas el mmproj Q8_0 (0,7 GB) se puede ejecutar en una GPU de 24 GB (RTX 3090/4090) mediante llama.cpp, procesando imagenes y texto en local sin enviar datos a la nube.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, aprovechando la reduccion de negativas; requiere revision humana por la perdida de salvaguardas.
- Prototipado de asistentes conversacionales en ingles: el modelo mantiene el formato conversacional de la familia Qwen3 y puede integrarse en pipelines de chat multi-turno con llama.cpp u Ollama para pruebas de concepto.
- Analisis de documentos con imagenes en entornos air-gapped: al ser GGUF y ejecutable offline, sirve para extraer informacion de capturas, diagramas o formularios escaneados en entornos sin conexion, usando el mmproj f16 si se prioriza calidad visual.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite medir el impacto de Q2_K a Q8_0 en perplejidad y calidad de respuesta sobre la misma base.
- Red teaming y pruebas de robustez: util para generar prompts adversarios y evaluar filtros de moderacion propios, ya que el modelo produce contenido que los sistemas alineados bloquean.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB. Sumar 0,7-1,0 GB si se usa vision (mmproj).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con vision; A100 40/80 GB o H100 para Q8_0 con contexto largo y mayor paralelismo; RTX 4060 Ti 16 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, desde 12 GB (Q2_K) hasta 24 GB (Q6_K); Q8_0 (29,1 GB) requiere 32 GB o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y mmproj), Ollama, LM Studio, koboldcpp; para servidores, llama.cpp server o vLLM con soporte GGUF (limitado). El repositorio se etiqueta como endpoints_compatible.
- Latencia y throughput: no disponibles; dependen de la cuantizacion y del hardware. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como "fast" y Q6_K como "very good quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-RANA-abliterated-GGUF (este) | 27,3B | no disponible | si (mmproj) | Apache 2.0 | GGUF | Abliterated, solo ingles declarado |
| Qwen3.8-27B-RANA-abliterated (base) | 27,3B | no disponible | si | Apache 2.0 | safetensors (HF) | Checkpoint original sin cuantizar |
| Qwen3-32B (referencia de familia) | 32,8B | 128K (segun Qwen3) | no | Apache 2.0 | safetensors, GGUF | Alineado, sin abliteration; datos de contexto de la familia Qwen3, no de esta ficha |
| Llama 3.3 70B Instruct (referencia de categoria) | 70,6B | 128K | no | Llama 3.3 Community License | safetensors, GGUF | Mayor tamano y requisitos; licencia no Apache |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo reduce las salvaguardas del Qwen3 original. Puede generar contenido danino, ilegal o sesgado que el modelo base bloquearia; no es apto para produccion orientada al publico sin capas de moderacion externas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad para esta variante.
- Idioma: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Contexto: no se documenta la longitud de contexto; no se debe asumir la ventana de la familia Qwen3 sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin alineamiento de seguridad.
- Cuantizaciones bajas (Q2_K, Q3_K_S): degradacion notable de calidad y coherencia; el autor desaconseja Q3_K_M ("lower quality") frente a variantes superiores.
- El repositorio ocupa 190,8 GB; la descarga completa no es necesaria, basta con el fichero de la cuantizacion elegida y, si se usa vision, el mmproj correspondiente.
- Sin datos de benchmarks ni evaluaciones de sesgo publicadas: cualquier afirmacion de rendimiento seria especulativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-GGUF
- Modelo base: https://huggingface.co/abliterant/Qwen3.8-27B-RANA-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-RANA-abliterated-i1-GGUF
- Pagina de resumen del publicador: https://hf.tst.eu/model#Qwen3.8-27B-RANA-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
