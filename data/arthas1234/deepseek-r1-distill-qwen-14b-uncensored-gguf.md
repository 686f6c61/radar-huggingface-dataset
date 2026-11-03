# Arthas1234/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF es una distribucion en formato GGUF de la variante "uncensored" del modelo DeepSeek-R1-Distill-Qwen-14B, un modelo de lenguaje de 14.765.947.904 parametros (aproximadamente 14,8 mil millones) derivado de la destilacion de DeepSeek-R1 sobre la arquitectura Qwen2.5-14B. El repositorio lo publica el usuario Arthas1234 y contiene cuantizaciones estaticas generadas por mradermacher a partir del modelo base `nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored`. El objetivo declarado del modelo base es eliminar los mecanismos de rechazo y moderacion del modelo original, de modo que responda a peticiones que el modelo destilado estandar rechazaria.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo tipico de la cadena de derivacion que caracteriza al ecosistema open source: modelo original de DeepSeek, destilacion sobre Qwen, "descensurado" mediante fine-tuning con el dataset `Guilherme34/uncensor` y finalmente cuantizacion GGUF para inferencia local. Por otro lado, advierte de que se trata de un artefacto con licencia MIT pero sin evaluacion publicada, sin benchmarks y con implicaciones de seguridad y legales que conviene conocer antes de desplegarlo.

El modelo conserva la capacidad de razonamiento de la familia R1 (generacion de cadenas de pensamiento antes de la respuesta) heredada de la destilacion, pero el fine-tuning de "uncensoring" puede degradar la calidad general y la coherencia en tareas estandar. El repositorio ocupa 102,0 GB e incluye unicamente pesos GGUF, no safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-14B, destilado de DeepSeek-R1) |
| Parametros totales | 14.765.947.904 (aprox. 14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B soporta 32.768 tokens nativos, ampliable; no confirmado para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existen quants ponderados/imatrix en `mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-i1-GGUF` |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only con atencion causal, correspondiente a Qwen2.5-14B (RoPE, GQA, SwiGLU, RMSNorm), sobre el que DeepSeek aplico destilacion supervisada a partir de las trazas de razonamiento de DeepSeek-R1. El modelo base `nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored` anade un fine-tuning adicional con el dataset `Guilherme34/uncensor`, cuyo proposito es reducir la tasa de rechazos ante peticiones que el modelo original declinaria. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplico RLHF o DPO en la fase de descensurado.

La innovacion tecnica principal del linaje es la destilacion de capacidades de razonamiento: el modelo genera una cadena de pensamiento interna (estilo R1) antes de emitir la respuesta final, lo que mejora el rendimiento en matematicas y logica a costa de una mayor latencia y consumo de tokens. La cuantizacion GGUF, realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`, permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones especificas en esta variante.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato chat mediante plantilla (el repositorio incluye la etiqueta `conversational`).
- Razonamiento multi-paso: hereda el modo de pensamiento de DeepSeek-R1, generando trazas de razonamiento antes de la respuesta.
- Razonamiento matematico y logico, presumiblemente a nivel del modelo destilado original, aunque sin benchmarks publicados para esta variante.
- Generacion de codigo y explicacion de codigo, como capacidad heredada del modelo base Qwen2.5-14B.
- Respuestas a peticiones que el modelo original rechazaria (comportamiento "uncensored" declarado por el autor del modelo base).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante; el modelo base Qwen2.5 lo soporta, pero el fine-tuning de descensurado puede haber degradado esta capacidad.
- Soporte de agentes y multi-step reasoning: parcial, limitado por la generacion de cadenas de pensamiento; no hay evaluacion publicada de uso agentico.
- Capacidades multilingues: limitadas al ingles segun la model card; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Capacidades especiales: modo thinking (cadena de pensamiento), sin vision ni audio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio controlado para medir como el fine-tuning de descensurado afecta a la tasa de rechazos, la coherencia y la toxicidad, comparandolo con el modelo destilado original en un entorno de laboratorio aislado.
- Evaluacion de robustez de filtros: permite probar clasificadores de contenido y sistemas de moderacion frente a un modelo con menor tasa de rechazo, sin necesidad de desplegarlo en produccion abierta.
- Inferencia local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (9,1 GB) y Q5_K_M (10,6 GB), puede ejecutarse en una GPU con 12-16 GB de VRAM o en CPU con llama.cpp, lo que lo hace util para prototipado offline.
- Experimentos de razonamiento en matematicas y logica: el modo thinking permite estudiar cadenas de razonamiento en un modelo de 14,8 B, con la ventaja de que el GGUF reduce el coste de despliegue frente al modelo en safetensors.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, siempre que se cumplan los requisitos legales del pais de despliegue.
- Docencia y demostraciones de cuantizacion: comparar la degradacion de calidad entre Q2_K (5,9 GB) y Q8_0 (15,8 GB) sobre el mismo modelo en un curso o taller de inferencia local.
- Pruebas de pipelines de inferencia: validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints), sin exponer el modelo a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tasa de rechazo, y no se dispone de mediciones de latencia o throughput especificas para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto reducido):
  - Q2_K: aprox. 6-7 GB
  - Q3_K_M: aprox. 8-9 GB
  - IQ4_XS: aprox. 9-10 GB
  - Q4_K_M: aprox. 10-11 GB
  - Q5_K_M: aprox. 12-13 GB
  - Q6_K: aprox. 14-15 GB
  - Q8_0: aprox. 17-18 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q6_K y Q8_0; A100 40 GB o H100 para despliegue concurrente con contexto largo.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y superiores con cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` lo sugiere). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; seria necesario convertir a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 14,8 B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arthas1234/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF | 14,8 B | no disponible | MIT | GGUF | Variante uncensored, sin benchmarks |
| nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored | 14,8 B | no disponible | MIT | safetensors | Modelo base del anterior, mismo fine-tuning |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,8 B | 32.768 tokens (Qwen2.5-14B) | MIT | safetensors | Modelo original destilado, con benchmarks publicados por DeepSeek |
| Qwen/Qwen2.5-14B-Instruct | 14,8 B | 32.768 tokens (ampliable a 131.072) | Apache 2.0 | safetensors | Modelo base de la destilacion, con tool calling y multilingue |

La comparativa muestra que el modelo de esta ficha se diferencia del destilado original principalmente por el fine-tuning de descensurado y la cuantizacion GGUF; pierde la garantia de calidad del modelo oficial y no aporta benchmarks propios. Frente a Qwen2.5-14B-Instruct, carece de soporte multilingue confirmado y de evaluacion de tool calling.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de tasa de rechazo, por lo que no es posible verificar la calidad del modelo ni compararlo con el destilado original.
- Riesgo elevado de alucinacion: el fine-tuning de descensurado puede reducir la calibracion y la coherencia, y el modo thinking no garantiza respuestas correctas.
- Sesgos conocidos: no documentados en la model card; el dataset `Guilherme34/uncensor` no tiene ficha de composicion publica en la informacion disponible, lo que impide evaluar sesgos de genero, raza o ideologia.
- Limitacion idiomatica: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad por el contenido generado. El uso en la UE esta sujeto al AI Act y a la normativa de servicios digitales; el contenido generado puede infringir leyes locales.
- Caveat de produccion: el modelo esta disenado explicitamente para reducir rechazos, lo que lo hace inadecuado para aplicaciones de cara al usuario sin moderacion adicional. No debe desplegarse en atencion al cliente, educacion o servicios publicos sin filtros externos.
- Cadena de derivacion no auditada: el fine-tuning de descensurado no esta documentado en detalle (sin numero de tokens, hiperparametros ni evaluacion), lo que impide reproducir el proceso.
- Compatibilidad de tool calling no confirmada: la etiqueta `endpoints_compatible` sugiere integracion con APIs, pero no hay evidencia de que el fine-tuning haya preservado el soporte de function calling del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Arthas1234/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-i1-GGUF
- Modelo destilado original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Modelo Qwen2.5-14B base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de descensurado: https://huggingface.co/datasets/Guilherme34/uncensor
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
