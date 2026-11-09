# qda-lab/QDA-Qwen3.5-9B-W4A16

## Resumen

QDA-Qwen3.5-9B-W4A16 es un checkpoint cuantizado del modelo base Qwen/Qwen3.5-9B, publicado por el laboratorio qda-lab. La cuantizacion es de tipo W4A16 (pesos en 4 bits, activaciones en 16 bits) y se ha generado mediante un proceso automatizado de busqueda denominado QDA ("Closed-Loop Quantization Design with LLM Agents"), descrito por sus autores como un envio a la conferencia MLSys 2027. El resultado es un artefacto en formato compressed-tensors que se carga directamente en vLLM sin conversion adicional.

El modelo resuelve un problema practico de despliegue: reducir el peso en memoria de un transformer denso de aproximadamente 9.650 millones de parametros manteniendo un nivel de precision competitivo en tareas de razonamiento matematico, conocimiento cientifico, generacion de codigo e instrucciones. Frente al checkpoint original en bf16/fp16, la version W4A16 rebaja el repositorio a unos 9,1 GB, lo que facilita su servicio en GPUs de una sola tarjeta con memoria moderada.

Es relevante ahora porque la cuantizacion de pesos a 4 bits se ha consolidado como la via practica para servir modelos de la clase 8-10B en produccion sin renunciar a la ventana de contexto ni a la calidad del modelo original. El checkpoint incluye resultados de evaluacion propios sobre cinco benchmarks (AIME 2025 + HMMT Feb 2026, GPQA-Diamond, LiveCodeBench v6 e IFBench), con una media agregada de 72,1 puntos, lo que permite comparar directamente con otras alternativas cuantizadas del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) en formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo Qwen/Qwen3.5-9B, un transformer denso con 9.653.104.368 parametros. La model card no detalla la configuracion interna del modelo base (numero de capas, dimension oculta, mecanismo de atencion ni ventana de contexto), por lo que esos datos deben consultarse en la ficha del modelo original. Tampoco se documenta el proceso de entrenamiento del modelo base: numero de tokens, composicion del corpus, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica de este artefacto reside en el pipeline de cuantizacion. QDA se presenta como un diseno de cuantizacion en bucle cerrado asistido por agentes LLM, que busca configuraciones de cuantizacion (esquema de bits, granularidad de grupo, tratamiento de capas sensibles) evaluando el impacto en tareas de razonamiento. La model card identifica la busqueda concreta (`r-f3f9584c`, hand-in `h6`) y afirma que estos son los ficheros exactos evaluados en el articulo. El resultado se serializa en compressed-tensors, el formato nativo de vLLM para checkpoints cuantizados, lo que elimina pasos de conversion en el despliegue.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Razonamiento matematico de competicion: el checkpoint reporta 74,5 en la agregacion de AIME 2025 y HMMT Feb 2026.
- Conocimiento cientifico de nivel avanzado: 80,0 en GPQA-Diamond.
- Generacion de codigo: 68,3 en LiveCodeBench v6, lo que indica competencia en problemas de programacion verificables.
- Seguimiento de instrucciones: 65,7 en IFBench, benchmark de instrucciones verificables y no vistas durante el entrenamiento.
- Servicio en vLLM mediante `vllm serve`, con soporte nativo del formato compressed-tensors.
- Tool calling, capacidades de agente, modo thinking, vision o audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Servicio de razonamiento matematico en produccion: con 74,5 en la agregacion de AIME 2025 y HMMT Feb 2026, el modelo es adecuado para tutoria automatica de matematicas de nivel preuniversitario, generacion de soluciones paso a paso y verificacion de ejercicios, siempre con supervision humana en contextos educativos reglados.
- Asistencia cientifica y tecnica: los 80,0 en GPQA-Diamond lo sitúan como candidato para responder consultas de fisica, quimica y biologia de nivel graduado en herramientas internas de I+D, con trazabilidad de fuentes y validacion por expertos.
- Generacion y revision de codigo: los 68,3 en LiveCodeBench v6 permiten integrarlo en pipelines de CI/CD para sugerencias de parche, generacion de tests y revision automatizada de pull requests, con ejecucion de tests como filtro obligatorio antes de aceptar cualquier salida.
- Agentes de automatizacion con instrucciones complejas: los 65,7 en IFBench indican buena adherencia a instrucciones verificables, util para orquestadores que encadenan llamadas a herramientas y requieren formato estricto en las respuestas.
- Despliegue en infraestructura modesta: al ocupar unos 9,1 GB en pesos W4A16, el checkpoint permite servir un modelo de 9,65B en GPUs de una sola tarjeta con memoria suficiente, reduciendo coste por instancia frente al modelo en bf16.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse junto al articulo QDA y con semillas y parametros de muestreo documentados, sirve como referencia reproducible para equipos que investigan metodos de cuantizacion post-entrenamiento.
- Backend de vLLM en plataformas internas: la integracion nativa con `vllm serve` y compressed-tensors simplifica el despliegue en clusters con vLLM ya operativo, sin necesidad de convertir pesos.

## Benchmarks y rendimiento

Resultados reportados por el autor del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estatico, muestreo de model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`) y semillas 17+j:

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 74,5 |
| GPQA-Diamond | 80,0 |
| LiveCodeBench v6 | 68,3 |
| IFBench | 65,7 |
| Media | 72,1 |

No se han publicado en la informacion disponible resultados del modelo base sin cuantizar ni de otras alternativas cuantizadas del mismo modelo, por lo que no es posible calcular la degradacion atribuible a la cuantizacion W4A16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos W4A16 ocupan aproximadamente 9,1 GB; con cache KV, overhead de vLLM y margen de activaciones, se recomienda un minimo de 16 GB de VRAM para contextos cortos y 24 GB o mas para contextos largos o batching concurrente.
- GPU recomendadas: cualquier GPU con al menos 16-24 GB de memoria. Para produccion con concurrencia, A100 40/80 GB, H100 o GH200 (la evaluacion del autor se hizo en GH200). Para desarrollo y pruebas, RTX 4090 (24 GB) o L40S.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090). En tarjetas de 16 GB el margen es muy ajustado y depende de la longitud de contexto y del tamano del lote.
- Opciones de despliegue: vLLM es la via soportada de forma nativa (`vllm serve qda-lab/QDA-Qwen3.5-9B-W4A16`). No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo especifica batching estatico en GH200 para la evaluacion, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Benchmarks publicados | Licencia |
|---|---|---|---|---|---|
| qda-lab/QDA-Qwen3.5-9B-W4A16 | 9,65B | W4A16 | No disponible | Media 72,1 en 4 benchmarks | No disponible |
| qda-lab/QDA-Qwen3.5-9B-W4A8 | 9,65B (mismo base) | W4A8 | No disponible | No disponible en la informacion | No disponible |
| RedHatAI/Qwen3.5-9B-quantized.w4a16 | 9,65B (mismo base) | W4A16 | No disponible | GSM8k-Platinum, MMLU-Pro, IFEval, Math 500, AIME 2025, GPQA Diamond (sin cifras en la informacion) | No disponible |
| Qwen/Qwen3.5-9B (base sin cuantizar) | 9,65B | bf16/fp16 | No disponible | No disponible en la informacion | No disponible |

Las tres variantes cuantizadas parten del mismo modelo base, por lo que la comparacion real se reduce al esquema de cuantizacion (W4A16 frente a W4A8) y al conjunto de benchmarks reportado. Los benchmarks de qda-lab y RedHatAI no coinciden salvo en GPQA-Diamond y AIME 2025, y la informacion disponible no incluye las cifras de RedHatAI, de modo que no es posible una comparacion numerica directa.

## Limitaciones y advertencias

- La cuantizacion W4A16 puede degradar tareas sensibles a la precision numerica (aritmetica de muchos pasos, calculo simbolico, extraccion de datos exactos). No se publica la comparacion con el modelo base, por lo que el nivel de degradacion es desconocido.
- Los benchmarks del autor se obtuvieron con una configuracion de muestreo concreta (temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) y batching estatico; otros ajustes pueden arrojar resultados distintos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados y calidad multilingue: no disponibles; no se debe asumir un rendimiento equivalente al modelo base en idiomas distintos del ingles sin evaluacion propia.
- Longitud de contexto: no disponible; debe consultarse la ficha de Qwen/Qwen3.5-9B antes de disenar aplicaciones con documentos largos.
- Licencia: no disponible. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-9B y confirmar que la cuantizacion no impone restricciones adicionales.
- El checkpoint esta vinculado a un envio a MLSys 2027; los resultados pueden ser preliminares y no haber pasado revision por pares.
- Solo se documenta soporte para vLLM; otros runtimes (llama.cpp, Ollama, TGI) no estan verificados.
- El modelo tiene un numero de descargas muy bajo (10) y ningun "like" en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A16
- Variante W4A8 del mismo autor: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A8
- Alternativa cuantizada de Red Hat: https://huggingface.co/RedHatAI/Qwen3.5-9B-quantized.w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
