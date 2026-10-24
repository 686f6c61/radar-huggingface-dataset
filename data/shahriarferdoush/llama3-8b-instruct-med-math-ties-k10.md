# ShahriarFerdoush/llama3-8b-instruct-med-math-ties-k10

## Resumen

`ShahriarFerdoush/llama3-8b-instruct-med-math-ties-k10` es un checkpoint de 8.030.261.248 parámetros publicado en HuggingFace por el usuario ShahriarFerdoush, con pipeline `text-generation` y pesos en `safetensors` (repositorio de 16,1 GB). Por el identificador y por el resto de publicaciones del mismo autor (variantes `med-ties-k10`, `med-obf-emb-ties-emb-merged-k10`, `math-ties-k10`), todo apunta a un modelo resultante de la fusión de los adaptadores o ajustes finos de Llama 3 8B Instruct en los dominios médico y matemático, combinados mediante la técnica TIES con retención top-k del 10 % de los parámetros. Esta interpretación se deduce del nombre y no está confirmada en ninguna documentación del autor.

El interés del modelo es acotado y hay que decirlo con claridad: la model card es la plantilla automática de HuggingFace, sin una sola sección completada (`[More Information Needed]` en todas ellas), sin licencia declarada, sin idiomas declarados, sin datos de entrenamiento, sin evaluación y con 0 descargas y 0 likes en el momento de la consulta. No es, por tanto, un modelo recomendable para producción sin una validación previa por parte de quien lo vaya a usar.

Su utilidad potencial está en experimentar con mezcla de capacidades (razonamiento cuantitativo y conocimiento biomédico) sobre una base Llama 3 8B Instruct, que aporta instrucción, formato conversacional y tool calling heredados. Cualquier uso en dominio médico debe tratarse como material de investigación, nunca como fuente de decisión clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3 (hereda la estructura del modelo base; no confirmado en la model card) |
| Parametros totales | 8.030.261.248 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors, presumiblemente bf16/fp16 dado el tamaño de 16,1 GB); no se publican GGUF ni GPTQ/AWQ |
| Idiomas soportados | no disponible; el modelo base declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | no disponible en los metadatos de HuggingFace; al derivar de Llama 3 es previsible que herede la Meta Llama 3 Community License, pero no está confirmado |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: transformer decoder-only denso con 32 capas, dimensión oculta de 4096, 32 cabezas de atención con 8 cabezas KV (GQA), normalización RMSNorm pre-normativa, activación SwiGLU, embeddings RoPE y vocabulario de 128.256 tokens. Estos valores corresponden al modelo base de Meta y no están verificados en el repositorio del autor; el recuento de parámetros (8,03 B) y el tamaño del repo en bf16 son coherentes con esa arquitectura.

Sobre el proceso de construcción no hay información oficial. La hipótesis más plausible, deducida del identificador, es una fusión TIES (Trim, Elect sign, Merge) de vectores de tarea con poda top-k al 10 %, combinando un ajuste orientado a dominio médico y otro orientado a matemáticas sobre Llama 3 8B Instruct. La fusión TIES resuelve los conflictos de signo entre vectores de tarea y descarta parámetros de baja magnitud antes de promediar, lo que suele preservar mejor el rendimiento en ambas tareas que un promedio simple. No se han publicado ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO en las etapas intermedias, ni los hiperparámetros de la fusión (densidad, escala, normalización).

## Capacidades

- Generación de texto conversacional con formato de instrucciones, heredado de Llama 3 8B Instruct.
- Razonamiento matemático y resolución de problemas cuantitativos, presumiblemente reforzado por la componente `math` del nombre.
- Conocimiento y terminología del dominio biomédico, presumiblemente reforzado por la componente `med`.
- Soporte de tool calling y function calling heredado del modelo base (formato de plantilla de Llama 3).
- Capacidad de seguir instrucciones multi-turno y de mantener rol de sistema.
- Multilingüismo limitado al del modelo base (8 idiomas oficiales), sin confirmación de que los ajustes de dominio hayan preservado esa cobertura.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni ventana de contexto extendida.
- Todas las capacidades listadas son inferencias a partir del modelo base y del nombre; no hay evaluación publicada que las respalde.

## Casos de uso

- **Triaje y preconsulta sanitaria:** uso como primer filtro conversacional que recoge síntomas y sugiere nivel de urgencia, aprovechando el ajuste `med`. Requiere supervisión profesional y validación clínica previa; el modelo no está evaluado y no debe emitir juicios diagnósticos autónomos.
- **Resumen de literatura biomédica en pipelines RAG:** indexar guías clínicas o artículos y usar el modelo para sintetizar respuestas con citas, dado su perfil de dominio médico y su ventana de 8.192 tokens heredada del base.
- **Tutor de matemáticas para secundaria y universidad:** generación de problemas, explicación paso a paso y corrección de ejercicios, apoyándose en la componente `math` de la fusión.
- **Generación de ítems de evaluación cuantitativos:** creación de bancos de preguntas de estadística, cálculo o álgebra con solución razonada, útil en plataformas educativas.
- **Asistente interno de cálculo clínico-administrativo:** apoyo a tareas de dosificación, ajuste de unidades o cálculo de índices a partir de datos introducidos por el usuario, siempre con verificación humana y tests de regresión numéricos.
- **Prototipado rápido de agentes con tool calling:** al conservar la plantilla de Llama 3, se puede integrar en frameworks de agentes que esperen el formato de función de Meta, aunque conviene verificar que la fusión no haya degradado el seguimiento de esquemas JSON.
- **Investigación sobre fusión de modelos:** sirve como caso de estudio reproducible de TIES con top-k sobre un mismo base, comparando contra las otras variantes publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye ninguna sección de evaluación y no hay cifras de MMLU, HumanEval, GSM8K, MedQA ni PubmedQA para este checkpoint ni para sus variantes. Cualquier comparación numérica con los modelos de la siguiente sección sería especulativa.

## Requisitos de hardware

- **Pesos en bf16:** 16,1 GB en disco; VRAM necesaria en torno a 17-18 GB incluyendo overhead de runtime, más caché KV.
- **Caché KV:** con 32 capas, 8 cabezas KV y dimensión de cabeza 128, aproximadamente 128 KiB por token en fp16; unos 1 GB adicional para 8.192 tokens de contexto por secuencia.
- **GPU profesionales:** A100 40 GB, H100 80 GB, L40S 48 GB o A10G no sirven para bf16 completo en 24 GB; una A100 40 GB permite batching amplio con vLLM.
- **GPU de consumo:** RTX 4090 o RTX 3090 (24 GB) admiten bf16 justo, con batch pequeño y contexto moderado; RTX 4080/4070 Ti (16 GB) necesitan cuantización a 8 bits.
- **Cuantización estimada:** int8/fp8 en torno a 9 GB; GGUF Q8 ~8,5 GB, Q5_K_M ~5,7 GB, Q4_K_M ~4,9 GB. Estas cifras son estimaciones de cálculo, no medidas publicadas para este checkpoint.
- **Opciones de despliegue:** `transformers` + `text-generation-inference` (etiquetas del repo), vLLM, llama.cpp/Ollama si se genera el GGUF, y endpoints gestionados tipo FriendliAI, que ya lista variantes del mismo autor.
- **Latencia y throughput:** no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`llama3-8b-instruct-med-math-ties-k10`) | 8,03 B | no disponible (base: 8.192) | no disponible | no disponible | HuggingFace, 0 descargas |
| Llama 3 8B Instruct (Meta) | 8,03 B | 8.192 | Amplia batería publicada por Meta | Meta Llama 3 Community License | HuggingFace oficial, muy extendido |
| Mistral 7B Instruct v0.3 | 7,24 B | 32.768 | Publicado por Mistral | Apache 2.0 | HuggingFace, muy extendido |
| Qwen2.5 7B Instruct | 7,62 B | 131.072 | Publicado por Alibaba | Apache 2.0 (mayoría de variantes) | HuggingFace, muy extendido |
| Meditron 7B / 70B | 7 B / 70 B | 4.096 / 4.096 | Publicado en el paper de EPFL | Llama 2 License | HuggingFace |

Frente a las alternativas, la única ventaja diferencial de este checkpoint sería la combinación de dominio médico y matemático en un solo conjunto de pesos de 8 B; en contra, carece de licencia declarada, de evaluación y de soporte, mientras que las alternativas son auditables y tienen contextos mucho mayores (Mistral y Qwen2.5 multiplican por 4 y por 16 la ventana del base).

## Limitaciones y advertencias

- **Trazabilidad nula:** model card auto-generada sin ninguna sección completada; no se documentan datos, hiperparámetros ni evaluación.
- **Licencia indeterminada:** al no declararse, no hay base jurídica clara para uso comercial; si hereda la licencia de Llama 3, aplican sus restricciones de atribución y su política de uso aceptable.
- **Riesgo de alucinación elevado en dominio médico:** un ajuste fino de dominio sin evaluación no garantiza precisión factual; las respuestas pueden parecer plausibles y ser incorrectas.
- **Riesgo específico en matemáticas:** las fusiones TIES pueden degradar el razonamiento paso a paso aunque preserven la perplejidad; conviene testear con GSM8K o MATH antes de confiar en el modelo para cálculo.
- **Idiomas no verificados:** aunque el base cubre el español, no hay confirmación de que los ajustes de dominio no hayan desplazado la distribución hacia el inglés.
- **Contexto corto:** 8.192 tokens heredados del base, insuficiente para RAG con documentos largos sin técnicas de recuperación por fragmentos.
- **Sin cuantizaciones oficiales:** hay que generarlas y validarlas localmente, con el consiguiente riesgo de degradación no medida.
- **Advertencia de uso:** no emplear en diagnóstico, prescripción ni decisiones clínicas; cualquier salida numérica debe verificarse con herramientas deterministas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShahriarFerdoush/llama3-8b-instruct-med-math-ties-k10
- Variante médica del mismo autor: https://huggingface.co/ShahriarFerdoush/llama3-8b-instruct-med-ties-k10
- Variante con embeddings fusionados: https://huggingface.co/ShahriarFerdoush/llama3-8b-instruct-med-obf-emb-ties-emb-merged-k10
- Endpoint gestionado de la variante matemática: https://friendli.ai/models/ShahriarFerdoush/llama3-8b-instruct-math-ties-k10
- Endpoint gestionado de una variante médica: https://friendli.ai/models/ShahriarFerdoush/llama3-8b-instruct-med-obf-emb-ties-v2-k50
- Paper de impacto medioambiental referenciado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Paper de Llama 3 (referencia del modelo base): no disponible en la información proporcionada
