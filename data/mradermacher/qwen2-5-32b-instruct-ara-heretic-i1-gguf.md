# mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-ARA-heretic, un derivado «abliterated» (con los mecanismos de rechazo eliminados) del Qwen2.5-32B-Instruct de Alibaba. La cuantizacion la firma mradermacher, un conocido publicador de pesos GGUF, y emplea el esquema «i1» con matriz de importancia (imatrix) para preservar mejor la calidad en cada nivel de compresion. El modelo base conserva la arquitectura transformer densa de Qwen2.5, con 32.763.876.352 parametros, y esta orientado a investigacion en seguridad de IA y a generacion conversacional sin filtros de rechazo.

El interes practico de esta ficha esta en el empaquetado: ofrece una bateria amplia de cuantizaciones (desde IQ1_S de 7,4 GB hasta Q6_K y superiores) que permiten ejecutar un modelo de 32B en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. Es relevante para quienes necesitan estudiar comportamientos de modelos sin rechazo, hacer red-teaming controlado o experimentar con inferencia local de gran tamano sin depender de servicios en la nube.

Conviene subrayar que se trata de un modelo derivado, no oficial: la licencia declarada es Apache 2.0 (heredada de Qwen2.5), pero el autor del modelo base impone un acceso con compuerta (gated) y restringe el uso a investigacion en seguridad, red-teaming o docencia. Los pesos cuantizados de mradermacher, en cambio, se publican abiertamente en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, segun la familia Qwen2.5) |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (lista parcial en la model card) |
| Idiomas soportados | en (segun la model card del modelo base) |
| Licencia | apache-2.0 (con compuerta de acceso en el modelo base) |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso de 32B parametros de Alibaba, afinado para instrucciones y conversacion. Sobre el se aplico la tecnica de «abliteration» (eliminacion de direcciones de rechazo en el espacio de activaciones) por parte de richardyoung, dando lugar a Qwen2.5-32B-Instruct-ARA-heretic. No se dispone en la informacion proporcionada de detalles sobre el dataset exacto, el numero de tokens de entrenamiento ni si hubo RLHF o DPO en el afinado original; esos datos corresponden a la model card oficial de Qwen2.5, no incluida aqui.

La aportacion de mradermacher es la cuantizacion: genera pesos GGUF con el esquema «i1» (version 2 del cuantizador, con tensor de salida cuantizado) y una matriz de importancia (imatrix) calculada sobre el modelo, lo que mejora la fidelidad de las cuantizaciones de baja precision. Se ofrecen tanto cuantizaciones estaticas (en el repo -GGUF) como estas ponderadas con imatrix. El repositorio ocupa 351,5 GB en total por acumular todas las variantes.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general e instrucciones complejas, heredadas de Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas (capacidades del modelo base Qwen2.5).
- Comportamiento sin rechazo («uncensored» / «abliterated»): responde a peticiones que el modelo original rechazaria.
- Soporte de tool calling y function calling (heredado de Qwen2.5-Instruct).
- Capacidades de agente y razonamiento multi-paso (del modelo base).
- Multilingue limitado: la model card declara solo ingles (`en`).
- No se documentan capacidades de vision ni audio en esta variante.

## Casos de uso

- Investigacion en seguridad de IA: analizar como un modelo de 32B sin mecanismos de rechazo responde a prompts adversarios, comparando con el modelo original para estudiar la eficacia de la abliteration.
- Red-teaming y evaluacion de alineamiento: usar las distintas cuantizaciones para medir si la compresion altera la tasa de respuestas daninas o la coherencia en escenarios de riesgo.
- Experimentacion local con LLM de gran tamano: desplegar el modelo en una estacion de trabajo con llama.cpp u Ollama usando Q4_K_M (~20 GB) para tareas de generacion sin dependencia de la nube.
- Docencia y cursos: ilustrar en clase el efecto de la cuantizacion y del «decensoring» sobre el comportamiento de un modelo, con variantes de distintos tamanos para comparar.
- Generacion de codigo en pipelines internos: aprovechar el soporte de tool calling del modelo base para tareas de autocompletado y refactorizacion en entornos controlados, usando cuantizaciones altas (Q5_K_M, Q6_K) para preservar calidad.
- Analisis de sesgos y contenido: estudiar que tipo de contenido genera un modelo sin filtros para elaborar taxonomias de riesgo y guias de moderacion.
- Prototipado de asistentes conversacionales en ingles con contexto largo, empleando las cuantizaciones de mayor tamano en GPUs con suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de archivo como referencia): IQ1_S ~7,4 GB; IQ2_M ~11,4 GB; IQ3_M ~14,9 GB; IQ4_XS ~17,8 GB; Q4_0 ~18,8 GB; Q4_K_M y superiores por encima de 20 GB; Q6_K y Q8 en el rango de 30-35 GB.
- GPU recomendadas: para cuantizaciones bajas (IQ2-IQ3), GPUs de consumo con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); para Q4-Q5, 24 GB (RTX 3090, RTX 4090); para Q6-Q8, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en cuantizaciones IQ1 a IQ4 con 12-24 GB de VRAM; las cuantizaciones altas requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI solo con pesos safetensors del modelo base, no con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-ARA-heretic (i1-GGUF) | 32,76B | no disponible | apache-2.0 (gated) | GGUF | Sin rechazo, cuantizado con imatrix |
| Qwen2.5-32B-Instruct (original) | 32,76B | 131.072 (familia Qwen2.5) | apache-2.0 | safetensors, GGUF | Con alineamiento y rechazo |
| Qwen2.5-32B-Instruct-GGUF (mradermacher) | 32,76B | 131.072 (familia Qwen2.5) | apache-2.0 | GGUF | Version estandar cuantizada |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de benchmarks ni de otros modelos «abliterated» de 32B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin mecanismos de rechazo: puede generar contenido danino, ilegal o inseguro; su uso esta restringido a investigacion en seguridad y red-teaming segun el autor del modelo base.
- Acceso con compuerta en el modelo original: richardyoung exige solicitud manual y declaracion de uso; las cuantizaciones aqui descritas se publican abiertamente, lo que puede entrar en conflicto con la intencion del autor.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la ausencia de filtros de seguridad.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta documentado.
- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte de que IQ1_S es «para desesperados».
- Licencia Apache 2.0 heredada, pero con condiciones adicionales del autor del modelo base; revisar los terminos antes de uso comercial.
- No se dispone de datos de benchmarks ni de evaluaciones de sesgo para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo base (abliterated): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-ARA-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- CV del autor del modelo base: https://cv.deepneuro.ai
