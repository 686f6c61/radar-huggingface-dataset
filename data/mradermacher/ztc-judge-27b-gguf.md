# mradermacher/ZTC-Judge-27B-GGUF

## Resumen

ZTC-Judge-27B-GGUF es la distribucion en formato GGUF del modelo ZTC-Judge-27B, desarrollado originalmente por FINAL-Bench y cuantizado por mradermacher. Se trata de un modelo de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) disenado especificamente para tareas de verificacion de respuestas (answer verification), deteccion de alucinaciones (hallucination detection) y estimacion de confianza (confidence estimation) bajo el paradigma que el autor denomina "zero-token". La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo se distribuye exclusivamente en formato GGUF, lo que lo hace desplegable en entornos con llama.cpp y herramientas compatibles, incluyendo configuraciones de hardware de consumo. El repositorio incluye once variantes de cuantizacion que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), cubriendo un amplio espectro de compromisos entre calidad y requisitos de memoria. Los idiomas declarados son ingles (en) y coreano (ko), lo que sugiere un enfoque de entrenamiento bilingue limitado.

La relevancia actual del modelo radica en su especializacion: en lugar de ser un modelo generativo de proposito general, esta orientado a actuar como juez o verificador dentro de pipelines de IA, un rol cada vez mas demandado para mitigar alucinaciones en sistemas RAG, agentes y asistentes en produccion. Al estar cuantizado en GGUF, permite integrar esa funcion de verificacion en infraestructuras locales sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: FINAL-Bench/ZTC-Judge-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base se distribuye en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base FINAL-Bench/ZTC-Judge-27B en la informacion proporcionada. Por el numero de parametros (27,3 B) y la nomenclatura, se trata de un transformer de gran tamano, pero no se confirma si emplea atencion completa, atencion lineal, arquitectura MoE o hibrida. Tampoco se detallan el numero de capas, dimensiones ocultas ni el mecanismo de atencion.

Respecto al entrenamiento, la model card unicamente declara los tags `ztc`, `answer-verification`, `hallucination-detection`, `zero-token` y `confidence-estimation`, lo que indica que el modelo fue ajustado para emitir juicios de verificacion y puntuaciones de confianza. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preference tuning. La cuantizacion realizada por mradermacher es de tipo estatico (sin imatrix ni weighted quants, segun indica el propio autor), lo que implica que la calidad de las cuantizaciones de baja precision puede ser inferior a la de variantes con imatrix.

## Capacidades

- Verificacion de respuestas: evalua si una respuesta generada es correcta o incorrecta respecto a una referencia o contexto.
- Deteccion de alucinaciones: identifica afirmaciones no sustentadas en la evidencia proporcionada.
- Estimacion de confianza: emite puntuaciones de confianza asociadas a respuestas o afirmaciones.
- Paradigma "zero-token": orientado a producir juicios de verificacion con un coste de generacion minimo (segun la nomenclatura del autor; no se detalla el mecanismo exacto).
- Capacidad conversacional: el repositorio declara la etiqueta `conversational`, por lo que admite formato de chat multi-turno.
- Soporte bilingue limitado: ingles y coreano.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructuras de inferencia estandar.
- No se ha confirmado soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Verificacion en pipelines RAG: el modelo puede actuar como segunda etapa que valide si la respuesta generada por un LLM esta sustentada en los documentos recuperados, reduciendo alucinaciones antes de entregar la respuesta al usuario final.
- Moderacion de contenido factual en atencion al cliente: integrado tras un chatbot, filtra respuestas no verificadas o de baja confianza antes de que lleguen al cliente, usando la estimacion de confianza como umbral de escalado a un agente humano.
- Evaluacion automatica de datasets sinteticos: sirve como juez para puntuar la calidad y veracidad de respuestas generadas masivamente, permitiendo filtrar datos de entrenamiento ruidosos.
- Control de calidad en generacion de codigo asistida: verifica que las explicaciones o fragmentos de codigo generados sean coherentes con la documentacion de referencia antes de insertarlos en un repositorio.
- Deteccion de alucinaciones en resumenes de documentos: en flujos de resumen automatico (informes, actas, articulos), el modelo comprueba que cada afirmacion del resumen tenga respaldo en el texto fuente.
- Auditoria de respuestas en entornos regulados: en sectores como salud o finanzas, se emplea como capa de verificacion local (al ser GGUF y Apache 2.0) para registrar y puntuar la fiabilidad de las respuestas generadas sin enviar datos a terceros.
- Soporte bilingue ingles-coreano: util en productos dirigidos a mercados de habla inglesa y coreana que requieran verificacion factual en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K: aproximadamente 11,0 GB de pesos; con overhead de contexto, en torno a 12-13 GB.
  - Q4_K_S / Q4_K_M: aproximadamente 15,9-16,9 GB de pesos; en torno a 17-19 GB con contexto.
  - Q5_K_M: aproximadamente 19,6 GB de pesos; en torno a 21-22 GB con contexto.
  - Q6_K: aproximadamente 22,5 GB de pesos; en torno a 24-25 GB con contexto.
  - Q8_0: aproximadamente 29,1 GB de pesos; en torno a 31-32 GB con contexto.
- GPU recomendadas: para Q8_0 y Q6_K, GPU con 32 GB o mas (A100 40 GB, H100, RTX 5090/A6000 de 48 GB). Para Q4_K_M, tarjetas de 24 GB (RTX 4090, RTX 3090, A10G 24 GB) son suficientes.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_S o Q4_K_M; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) solo con Q2_K o Q3_K_S y contexto reducido; en tarjetas de 12 GB no cabe en su totalidad y requeriria offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se recomienda vLLM o TGI para este repositorio, ya que solo contiene pesos GGUF y no safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~27 B en formato GGUF, pero sin datos de benchmarks no es posible establecer una comparacion de calidad rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| ZTC-Judge-27B-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados: solo se declaran ingles y coreano; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Especializacion estrecha: el modelo esta ajustado para verificacion y deteccion de alucinaciones; no debe emplearse como modelo generativo de proposito general sin validacion previa.
- Cuantizaciones estaticas: el autor indica que no hay variantes con imatrix o weighted quants, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de los juicios.
- Riesgo de alucinacion en el propio juez: al ser un modelo de lenguaje, puede emitir veredictos incorrectos o sobreconfiados; se recomienda calibrar los umbrales de confianza con datos propios.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse presumiblemente con datos en ingles y coreano, puede heredar sesgos culturales y linguisticos de esas fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base FINAL-Bench/ZTC-Judge-27B para confirmar compatibilidad y obligaciones de atribucion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de verificacion, lo que dificulta justificar su adopcion en produccion sin una evaluacion propia.
- Contexto desconocido: no se especifica la longitud de contexto, un factor critico para tareas de verificacion sobre documentos largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZTC-Judge-27B-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/ZTC-Judge-27B
- Pagina de descargas del autor: https://hf.tst.eu/model#ZTC-Judge-27B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
