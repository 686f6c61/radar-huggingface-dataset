# Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-INT8

## Resumen

Llama-3.2-1B-Computer-Engineering-OpenVINO-INT8 es una conversión a OpenVINO con cuantización INT8 del modelo Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM, un ajuste fino de Llama-3.2-1B especializado en preguntas y respuestas de ingeniería informática. Lo publica el usuario Irfanuruchi y está pensado para ejecutarse en hardware Intel (CPU, GPU integrada y NPU) mediante OpenVINO GenAI, no como un asistente conversacional generalista.

El modelo deriva de la arquitectura Llama 3.2 de 1B parámetros, con un pipeline de conversión poco habitual: el checkpoint padre ya estaba cuantizado en INT8 con BitsAndBytes, se reconstruyó a FP16 denso y después se volvió a comprimir a INT8 simétrico por canal mediante `optimum-cli export openvino`. El resultado ocupa aproximadamente 1,2 GB frente a los 2,4 GB de la variante FP16 y los 758 MB de la variante INT4.

Su relevancia es práctica: demuestra un flujo completo de despliegue en local sobre silicio Intel reciente (Core Ultra 9 275HX con CPU, iGPU y NPU) y publica mediciones reproducibles de latencia y throughput en los tres backends. Es, por tanto, más interesante como referencia de despliegue OpenVINO que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, heredada de meta-llama/Llama-3.2-1B) |
| Parametros totales | 1B (segun la model card; corresponde a la familia Llama 3.2 1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura base Llama 3.2 1B soporta 131.072 tokens |
| Tipos de cuantizacion | INT8 simetrico por canal (variante publicada); el autor reporta tambien INT4 y FP16 en las pruebas comparativas |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | OpenVINO IR (modelo exportado con `optimum-cli export openvino`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B de Meta, un transformer decoder-only con atención causal. Sobre esa base se aplicó un ajuste fino orientado a ingeniería informática, cuyo dataset, número de tokens y metodología no se documentan en la information disponible. La model card no especifica si hubo RLHF, DPO u otra fase de alineamiento; tampoco detalla la composición de los datos de entrenamiento.

La innovación reseñable está en la cadena de conversión. El checkpoint padre publicado es un INT8 real de BitsAndBytes, con pesos lineales INT8, tensores de escalado SCB y 112 módulos `Linear8bitLt`. Para exportarlo a OpenVINO se desquantizó primero a una representación FP16 densa (146 tensores FP16, 0 módulos BitsAndBytes, 0 tensores INT8 y 0 tensores SCB) y después se aplicó compresión INT8 simétrica por canal. El propio autor advierte que esta ruta es lossy: incluye una reconstrucción INT8 → FP16 denso antes de la compresión final, por lo que no debe describirse como una conversión directa desde los pesos FP16 originales previos a la cuantización.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas de ingeniería informática en formato completion.
- Formato de prompt recomendado de tipo pregunta/respuesta (`Q: ... A:`), no chat conversacional con roles.
- Explicaciones técnicas directas y breves (por ejemplo, funcionamiento de la memoria caché de CPU, relación con la RAM, latencia y localidad de memoria).
- Generación con decodificación greedy o por muestreo (temperature, top_p, repetition_penalty configurables).
- Ejecución en tres backends Intel distintos con el mismo artefacto OpenVINO: CPU, GPU integrada y NPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, ni modo thinking.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.

## Casos de uso

- Asistente de consulta técnica embebido en una herramienta de desarrollo: dado su formato `Q:/A:` y su especialización, responde preguntas concretas sobre fundamentos de ingeniería informática (caché, jerarquía de memoria, arquitectura de procesadores) dentro de un IDE o wiki interna.
- Generación de material docente y bancos de preguntas: el modelo puede producir explicaciones breves y respuestas modelo para asignaturas de arquitectura de computadores, aprovechando su ajuste específico en el dominio.
- Despliegue en portátiles con Intel Core Ultra: al ejecutarse vía OpenVINO en CPU, iGPU y NPU con un artefacto de 1,2 GB, es viable como asistente local sin GPU dedicada ni conexión a la nube.
- Procesamiento por lotes de documentación técnica: al priorizar throughput sobre interactividad, la variante INT4 o INT8 en CPU resulta adecuada para generar resúmenes o respuestas sobre grandes volúmenes de texto técnico.
- Pruebas de integración continua sobre hardware Intel: sirve como carga de referencia para validar que los backends OpenVINO (CPU/iGPU/NPU) funcionan correctamente en un pipeline de CI con un modelo pequeño y determinista.
- Prototipado de aplicaciones edge con NPU: las mediciones publicadas (34,30 tok/s en Intel AI Boost con INT8, con throughput muy estable entre ejecuciones) permiten dimensionar aplicaciones de baja latencia en dispositivos con NPU.
- Validación de pipelines de cuantización: es un caso de estudio útil para equipos que necesitan convertir checkpoints BitsAndBytes a OpenVINO y quieren comparar el impacto de INT4, INT8 y FP16.
- Filtrado o clasificación de consultas técnicas: mediante generación corta controlada por prompt, puede etiquetar o reformular preguntas de un dominio acotado.

## Benchmarks y rendimiento

Los datos proceden de la propia model card y se obtuvieron en IULinux 0.1 Development (kernel 7.0.0-31-generic) sobre un Intel Core Ultra 9 275HX con iGPU Intel Graphics y NPU Intel AI Boost, con OpenVINO y OpenVINO GenAI 2026.4, perfil de energía Performance y alimentación por corriente alterna.

Metodología: prompt de 26 tokens, 128 tokens generados, 2 ejecuciones de calentamiento y 5 mediciones, con `do_sample=false` e `ignore_eos=true` para que todos los backends realizaran exactamente la misma carga.

| Dispositivo | Carga del pipeline | TTFT | TPOT | Throughput |
|---|---:|---:|---:|---:|
| Intel Core Ultra 9 275HX (CPU) | 321,26 ms | 44,24 ± 4,97 ms | 19,75 ± 0,06 ms/token | 50,64 ± 0,16 tok/s |
| Intel Graphics (iGPU) | 1859,25 ms | 34,60 ± 0,12 ms | 23,89 ± 0,06 ms/token | 41,86 ± 0,11 tok/s |
| Intel AI Boost (NPU) | 5653,16 ms | 922,20 ± 1,20 ms | 29,15 ± 0,09 ms/token | 34,30 ± 0,11 tok/s |

En esta carga INT8, la CPU ofreció el mayor throughput, la iGPU el menor TTFT y la NPU el throughput más consistente entre las cinco ejecuciones. No se recogieron mediciones de consumo, por lo que los resultados comparan únicamente latencia y throughput.

Comparativa entre precisiones (misma metodología):

| Precisión | CPU | Intel iGPU | Intel NPU |
|---|---:|---:|---:|
| INT4 | 62,98 tok/s | 62,59 tok/s | 33,89 tok/s |
| INT8 | 50,64 tok/s | 41,86 tok/s | 34,30 tok/s |
| FP16 | 26,34 tok/s | 24,43 tok/s | 20,63 tok/s |

INT4 dio el mayor throughput medido en CPU y GPU integrada; INT8, el mayor en NPU, con una diferencia pequeña respecto a INT4. No hay benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el directorio OpenVINO INT8 ocupa aproximadamente 1,2 GB, por lo que los pesos en memoria rondan esa cifra más el coste del runtime y de la caché KV (no cuantificada en la model card). La variante INT4 baja a 758 MB y la FP16 sube a 2,4 GB.
- CPU: probado sobre Intel Core Ultra 9 275HX con 50,64 tok/s. No se documentan pruebas en otros procesadores.
- GPU integrada: probada sobre Intel Graphics (iGPU) con 41,86 tok/s y la menor TTFT de los tres backends (34,60 ms).
- NPU: probada sobre Intel AI Boost con 34,30 tok/s; destaca la estabilidad del throughput, pero la carga del pipeline es de 5653,16 ms y la TTFT de 922,20 ms.
- GPU dedicada: no se documenta ningún resultado en A100, H100, RTX 4090 u otras GPU discretas; dado que el artefacto es OpenVINO IR, su uso en esas tarjetas no está cubierto por la model card.
- Encaje en GPU de consumo: se puede ejecutar en CPU e iGPU de un portátil Intel Core Ultra; no hay datos para GPU de consumo dedicadas.
- Opciones de despliegue: OpenVINO GenAI (`ov_genai.LLMPipeline`), con OpenVINO 2026.4 y `openvino-genai` 2026.4. La exportación se realizó con `optimum-cli export openvino`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI o LM Studio; al tratarse de un formato OpenVINO IR, esos runtimes requerirían una reconversión previa.
- Latencia y throughput: los indicados en las tablas anteriores. Configuración de generación recomendada por el autor: `max_new_tokens=200`, `temperature=0.7`, `top_p=0.9`, `do_sample=True`, `repetition_penalty=1.1` y sin plantilla de chat.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con modelos de terceros. La comparación más directa posible es entre las tres precisiones del mismo artefacto OpenVINO y con el checkpoint padre.

| Variante | Tamano aprox. | Throughput CPU | Throughput iGPU | Throughput NPU | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| INT8 (esta publicacion) | 1,2 GB | 50,64 tok/s | 41,86 tok/s | 34,30 tok/s | llama3.2 | OpenVINO IR |
| INT4 | 758 MB | 62,98 tok/s | 62,59 tok/s | 33,89 tok/s | llama3.2 | OpenVINO IR |
| FP16 | 2,4 GB | 26,34 tok/s | 24,43 tok/s | 20,63 tok/s | llama3.2 | OpenVINO IR |
| Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM (padre) | No disponible | No disponible | No disponible | No disponible | No disponible | BitsAndBytes INT8 |
| meta-llama/Llama-3.2-1B (base) | No disponible | No disponible | No disponible | No disponible | llama3.2 | safetensors |

No se dispone de datos de rendimiento ni de calidad para modelos comparables de terceros (por ejemplo, otras cuantizaciones comunitarias de Llama 3.2 1B), por lo que no se incluyen aquí.

## Limitaciones y advertencias

- Modelo especializado y de dominio estrecho: está ajustado para preguntas de ingeniería informática y funciona mejor con preguntas técnicas cortas y directas que con prompts conversacionales basados en roles.
- Formato de prompt obligatorio en la práctica: el autor recomienda formato `Q: ... A:` y `apply_chat_template = False`; usarlo como chat general degrada los resultados.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas.
- Contexto no verificado: la model card no confirma la longitud de contexto efectiva tras el ajuste fino.
- Pérdida acumulada en la cuantización: la cadena incluye BitsAndBytes INT8 → FP16 denso → OpenVINO INT8, un proceso lossy que el propio autor señala explícitamente. No es una conversión directa desde los pesos FP16 previos a la cuantización.
- Riesgo de alucinación: no se documenta ningún proceso de alineamiento (RLHF/DPO), evaluación de veracidad ni benchmarks de calidad; en dominios técnicos, las respuestas deben validarse.
- Sesgos: no se documentan análisis de sesgo, composición del dataset de ajuste fino ni medidas de mitigación.
- Ausencia de adopción verificable: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el comportamiento en producción.
- Licencia Llama 3.2: el uso comercial está sujeto a la Llama 3.2 Community License y a la política de uso aceptable de Meta, además de los términos aplicables al modelo base.
- Rendimiento dependiente del hardware: los datos publicados corresponden únicamente a un Intel Core Ultra 9 275HX con OpenVINO 2026.4; no hay garantías de reproducibilidad en otras plataformas ni en versiones anteriores de OpenVINO.
- Despliegue limitado a OpenVINO: no se documenta soporte en vLLM, llama.cpp, Ollama o TGI, lo que restringe las opciones de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-OpenVINO-INT8
- Modelo base (ajuste fino): https://huggingface.co/Irfanuruchi/Llama-3.2-1B-Computer-Engineering-LLM
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B
- OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel (exportacion OpenVINO): https://github.com/huggingface/optimum-intel
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
