# mradermacher/Qwen2.5-14B-Instruct-abliterated-v2-GGUF

## Resumen

Qwen2.5-14B-Instruct-abliterated-v2-GGUF es la distribucion en formato GGUF del modelo huihui-ai/Qwen2.5-14B-Instruct-abliterated-v2, una variante "abliterated" (sin censura) del Qwen2.5-14B-Instruct de Alibaba. La ha cuantizado mradermacher, un conocido publicador de versiones GGUF para inferencia local, y esta pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). El modelo base pertenece a la familia Qwen2.5, con arquitectura transformer densa de 14.770.033.664 parametros y licencia Apache 2.0.

La "abliteration" es una tecnica de edicion de pesos que elimina o atenua la direccion de rechazo aprendida durante el alineamiento (RLHF/DPO), de modo que el modelo responde a peticiones que el modelo original rechazaria. Esto lo hace relevante para investigacion sobre alineamiento, red teaming, generacion creativa sin restricciones y escenarios donde el filtrado excesivo resulta contraproducente, pero tambien lo convierte en un modelo inadecuado para despliegues de cara al publico sin moderacion adicional.

El repositorio ofrece 10 cuantizaciones estaticas desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ejecutar un modelo de casi 15.000 millones de parametros en hardware de consumo. Soporta 13 idiomas declarados (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe) y esta etiquetado como compatible con endpoints y conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct declara 32.768 tokens nativos, ampliables; no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix/weighted en repositorio separado |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |
| Tamano del repositorio | 102,0 GB (incluye todas las cuantizaciones) |
| Modelo base | huihui-ai/Qwen2.5-14B-Instruct-abliterated-v2 |
| Descargas | 25.552 |
| Likes | 18 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen2.5, con 14.770.033.664 parametros. La variante abliterated-v2 ha sido producida por huihui-ai mediante edicion de pesos: se identifica la direccion de activacion asociada al comportamiento de rechazo y se proyecta fuera de los pesos, reduciendo la tendencia del modelo a declinar peticiones. Este proceso no requiere reentrenamiento completo y conserva en gran medida las capacidades del modelo original.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el pipeline de RLHF/DPO del Qwen2.5-14B-Instruct original. La cuantizacion la ha realizado mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`, generando cuantizaciones estaticas; las versiones ponderadas por imatrix estan en un repositorio aparte (sufijo `-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional multi-turno en 13 idiomas declarados.
- Razonamiento general, matematicas y generacion de codigo heredados del Qwen2.5-14B-Instruct.
- Respuestas a peticiones que el modelo original rechazaria (comportamiento "uncensored"/abliterated).
- Soporte de plantillas de chat (tag `chat`, `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de ejecucion local en CPU y GPU mediante llama.cpp y derivados.
- No se declara soporte explicito de tool calling, function calling, vision ni audio en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento del modelo abliterated frente al original para estudiar como se codifica el rechazo en los pesos y que efectos colaterales tiene su eliminacion.
- Red teaming y evaluacion de robustez: generar respuestas a prompts adversarios para probar filtros y clasificadores de moderacion en pipelines propios.
- Generacion creativa sin restricciones: ficcion, guiones o narrativa donde el modelo original aplica filtros excesivos, ejecutado localmente con llama.cpp u Ollama.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (8,7 GB) y Q4_K_M (9,1 GB) permiten ejecutar un modelo de 14,7B en GPUs con 12-16 GB de VRAM, o en CPU con suficiente RAM.
- Traduccion y procesamiento multilingue: cobertura declarada de espanol, ingles, chino, frances, aleman, italiano, portugues, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Prototipado offline y entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, no requiere conexion a servicios externos ni envio de datos a terceros.
- Asistencia de codigo en local: hereda la capacidad de generacion de codigo del Qwen2.5-14B-Instruct, util para autocompletado o explicacion de fragmentos en entornos sin acceso a API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes para esta variante cuantizada, y la model card se limita a listar las cuantizaciones y enlaces de descarga.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Anadir margen para contexto y cache KV.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o RTX 4070; Q6_K y Q8_0 encajan en RTX 4080/4090 (16-24 GB) o A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM usando cuantizaciones Q4 o inferiores; en 8 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo endpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-abliterated-v2-GGUF (este) | 14,77B | no disponible | Apache 2.0 | GGUF | Sin censura, 13 idiomas, cuantizaciones estaticas |
| Qwen2.5-14B-Instruct (original) | 14,77B | no disponible | Apache 2.0 | safetensors/GGUF | Alineado con filtros; referencia de calidad |
| Qwen2.5-14B-Instruct-abliterated-v2 (huihui-ai) | 14,77B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar, origen de esta version |
| Qwen2.5-14B-Instruct-abliterated-v2-i1-GGUF (mradermacher) | 14,77B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad a igual tamano |

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina parte del rechazo, por lo que puede producir contenido inapropiado, ofensivo o inseguro. No apto para exposicion publica sin moderacion externa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la edicion de pesos puede alterar el comportamiento en dominios sensibles y no garantiza mayor veracidad.
- La abliteration puede degradar ligeramente capacidades respecto al Qwen2.5-14B-Instruct original; no hay benchmarks publicados que cuantifiquen esta perdida.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; hereda los del corpus de entrenamiento del modelo base.
- Contexto: la longitud de contexto no se confirma en esta ficha; verificar en la model card del modelo base antes de usarlo en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales o terminos de plataforma; la responsabilidad recae en el desplegador.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como minimo y Q6_K/Q8_0 para maxima fidelidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-14B-Instruct-abliterated-v2-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Qwen2.5-14B-Instruct-abliterated-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen2.5-14B-Instruct-abliterated-v2-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen2.5-14B-Instruct-abliterated-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia: https://huggingface.co/huihui-ai/Qwen2.5-14B-Instruct-abliterated-v2/blob/main/LICENSE
