# Lothera/Thero-1-Pulsar

## Resumen

Thero-1 Pulsar es un modelo multimodal de 9.409.813.744 parametros (aproximadamente 9B) desarrollado por Lothera Intelligence, un laboratorio del que la model card no ofrece mas detalles institucionales. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B, orientado a razonamiento con modo dual, ejecucion estructurada de herramientas y comprension visual nativa, con especial enfasis en turco e ingles. El modelo se distribuye en formato safetensors bajo licencia CC BY 4.0 y esta pensado para tareas de image-text-to-text dentro del ecosistema transformers.

Su propuesta tecnica principal es una arquitectura hibrida de atencion (3:1 entre atencion lineal y atencion completa) con una ventana de contexto de hasta 262.144 tokens (256K), lo que reduce la huella de la KV-cache en comparacion con un transformer de atencion completa equivalente. Sobre esa base, Lothera aplica su propio stack de alineamiento en varias etapas (instruccion bilingue, preferencias autogeneradas con verificadores, sintesis de razonamiento verificable y consolidacion con anclas de regresion) para mejorar la adherencia a instrucciones, el codigo, la resistencia a alucinaciones y la disciplina de formato sin degradar el conocimiento general del modelo base.

Es relevante ahora porque combina tres demandas actuales del ecosistema open weights: contexto largo eficiente, capacidades multimodales nativas y tool calling schema-adherent para flujos agenticos. La model card publica una evaluacion propia (Thero-Bench, 195 preguntas no vistas) frente al modelo base, con mejoras declaradas de hasta +37,44 puntos en disciplina de formato Think/No-Think y +18,57 en capacidades core, aunque se trata de una suite interna del propio autor y no de benchmarks externos de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido 3:1 de atencion lineal y atencion completa, 32 capas |
| Parametros totales | 9.409.813.744 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF oficial publicado en Lothera/Thero-1-Pulsar-GGUF, con mmproj para vision; niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | Ingles, turco y multilingue |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su estructura de 32 capas, pero la model card describe una arquitectura hibrida en proporcion 3:1 entre atencion lineal y atencion completa. Esta combinacion reduce de forma significativa el coste de memoria de la KV-cache en contextos largos, lo que permite sostener ventanas de hasta 256K tokens con un perfil de inferencia mas asequible que el de un transformer de atencion completa del mismo tamano. El modelo es multimodal nativo (pipeline image-text-to-text), con capacidad declarada para procesar documentos, diagramas y capturas de interfaz junto con texto.

El entrenamiento no se describe en terminos de numero de tokens ni de composicion exacta del dataset. Lothera explica su metodologia como un "Alignment Stack" de cuatro pilares: alineamiento de representaciones en multiples etapas con instrucciones bilingues, codigo, matematicas y trayectorias de ejecucion de herramientas; dinamicas de preferencia autogeneradas on-policy con verificadores deterministas de codigo, matematicas, esquema y formato; sintesis de razonamiento verificable para calibrar cuando conviene gastar tokens en `<think>`; y consolidacion final con anclas de regresion para preservar identidad, tono y fluidez. No se especifica si hubo RLHF clasico, DPO u otro algoritmo concreto, ni se detallan innovaciones de decodificacion especulativa o atencion lineal especifica mas alla de la proporcion 3:1.

## Capacidades

- Generacion de texto y razonamiento en modo dual: modo `Think` con cadenas `<think>...</think>` para matematicas, STEM y arquitectura de software, y modo `No-Think` para consultas cotidianas con baja latencia.
- Comprension visual nativa: procesa documentos, diagramas, capturas de UI y tareas de razonamiento visual junto con texto.
- Tool calling estructurado: la model card declara un 100,0% de generacion XML `<tool_call>` adherente al esquema, orientada a flujos agenticos, busqueda e integracion con APIs externas.
- Razonamiento multi-paso y flujos agenticos: soporte para ejecucion de herramientas y razonamiento encadenado.
- Capacidades multilingues con foco en turco (incluyendo registro formal/informal sen/siz) e ingles tecnico.
- Resistencia a alucinaciones: entrenado para rechazar limpiamente o pedir aclaraciones cuando falta evidencia (87,5% de precision de grounding declarada).
- Contexto largo eficiente: coherencia declarada del 100,0% en comprobaciones de hold-out de contexto largo.
- Capacidades de codigo y matematicas, con mejoras declaradas frente al modelo base en HumanEval+ y MATH-500/GSM8K.

## Casos de uso

- Atencion al cliente bilingue turco-ingles: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens y su calibracion de registro formal e informal en turco, adecuada para soporte en mercados turcos.
- Agentes con tool calling en produccion: su generacion XML `<tool_call>` adherente al esquema permite integrarlo en orquestadores de agentes que invocan APIs, busquedas o funciones internas con validacion estricta de formato.
- Analisis de documentos y capturas de pantalla: al ser multimodal nativo, puede extraer informacion de diagramas, documentos escaneados y capturas de UI, util para automatizacion de back office y QA visual.
- Asistencia de codigo en pipelines de CI/CD: con modo `Think` para problemas de arquitectura y modo `No-Think` para consultas rapidas, puede integrarse en revision de codigo o generacion de parches con latencia controlada.
- Razonamiento matematico y STEM en entornos educativos o de analisis: el modo `Think` con presupuesto de tokens ampliado esta disenado para problemas de MATH-500 y GSM8K, con mejora declarada de +19,4 puntos frente al base.
- Sistemas de retrieval aumentado con contexto largo: la ventana de 256K y la reduccion de KV-cache permiten inyectar grandes volumentes de documentacion en una sola llamada sin trocear en exceso.
- Moderacion y grounding con rechazo controlado: su entrenamiento para declinar o pedir aclaraciones cuando falta evidencia lo hace util en flujos donde la fabricacion de datos es un riesgo critico.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de Thero-Bench (195 preguntas no vistas, 104 en turco y 91 en ingles), una suite interna del autor evaluada frente a Qwen3.5-9B con prompts, hardware y presupuestos de tokens identicos (No-Think: 512; Think-General: 1024; Think-Math/GPQA: 1600).

| Categoria | Items | Qwen3.5-9B | Thero-1 Pulsar | Delta |
|---|---:|---:|---:|---:|
| Puntuacion global | 195 | 73,85% | 84,10% | +10,25 |
| Capacidades core | 70 | 77,14% | 95,71% | +18,57 |
| Ancla de regresion | 125 | 72,00% | 77,60% | +5,60 |
| Disciplina de formato Think/No-Think | 195 | 55,38% | 92,82% | +37,44 |

| Benchmark / dominio | Idioma | Qwen3.5-9B | Thero-1 Pulsar | Delta |
|---|---|---:|---:|---:|
| IFEval y adherencia a instrucciones | TR | 95,5% | 100,0% | +4,5 |
| XML tool-call y contexto largo | TR + EN | 94,7% | 100,0% | +5,3 |
| Codigo (HumanEval+ y arquitectura) | EN | 76,9% | 92,3% | +15,4 |
| Guardia de alucinaciones (rechazo y grounding) | TR + EN | 62,5% | 87,5% | +25,0 |
| MMLU-Pro | EN | 87,5% | 87,5% | +0,0 |
| TR-MMLU | TR | 85,7% | 85,7% | +0,0 |
| GPQA-Diamond | EN | 71,4% | 71,4% | +0,0 |
| Matematicas (MATH-500 y GSM8K) | TR + EN | 38,9% | 58,3% | +19,4 |

No se han publicado resultados en leaderboards externos independientes en la informacion disponible; la propia model card indica que se anadiran evaluaciones externas a medida que se completen las pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (9,4B parametros), en FP16 serian necesarios aproximadamente 19 GB solo para pesos; en cuantizaciones de 8 bits, alrededor de 10 GB; en 4 bits, alrededor de 5-6 GB, mas el coste adicional de la KV-cache y del proyector visual (mmproj).
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 40 GB, H100 80 GB o L40S son adecuadas para FP16 con contexto largo; una RTX 4090 (24 GB) puede alojar FP16 en contextos moderados o cuantizaciones de 8 bits con contexto amplio.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090/4090 (24 GB) con cuantizacion 8 bits o en GPUs de 12-16 GB con cuantizacion 4 bits, aunque el autor no publica cifras verificadas.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama a traves del GGUF oficial con mmproj para vision; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El modo `No-Think` esta disenado para baja latencia en consultas cotidianas y el modo `Think` para mayor precision con presupuestos de hasta 1600 tokens de razonamiento, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---:|---:|---|---|---|
| Thero-1 Pulsar | 9,4B | 256K | CC BY 4.0 | Si (image-text-to-text) | Fine-tune de Qwen3.5-9B con arquitectura hibrida 3:1 y stack de alineamiento propio |
| Qwen3.5-9B | 9B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Modelo base; referencia directa en Thero-Bench |
| Alternativas de 8B-12B open weights | no disponible | no disponible | no disponible | no disponible | La model card menciona un "segmento 8B-12B open-weights" pero no detalla comparaciones con modelos concretos |

La informacion proporcionada solo permite una comparacion directa y verificada con Qwen3.5-9B, el modelo base. No se dispone de datos de otros modelos comparables de la misma categoria en el material consultado.

## Limitaciones y advertencias

- Los benchmarks publicados son de una suite interna del propio autor (Thero-Bench) con 195 preguntas; no hay validacion externa independiente ni resultados en leaderboards publicos.
- El modelo base es Qwen3.5-9B, por lo que hereda sus sesgos y limitaciones de conocimiento, aunque la model card no detalla sesgos especificos identificados.
- Riesgo de alucinacion: aunque se declara un 87,5% de precision de grounding, sigue siendo un modelo generativo y puede fabricar datos en dominios fuera de su distribucion de entrenamiento.
- Cobertura idiomatica: el foco declarado es turco e ingles; el rendimiento en otros idiomas no esta cuantificado y el soporte "multilingue" es generico.
- Contexto: la ventana de 256K esta declarada, pero no se especifica el rendimiento real a longitudes intermedias ni el coste de memoria a maxima longitud.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la informacion disponible.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se publican detalles sobre el dataset de entrenamiento, el numero de tokens ni el algoritmo de alineamiento exacto, lo que dificulta reproducir o auditar el modelo.
- El autor no publica requisitos de hardware, latencias ni throughput verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lothera/Thero-1-Pulsar
- Repositorio GGUF oficial con mmproj: https://huggingface.co/Lothera/Thero-1-Pulsar-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Imagen de portada: https://i.hizliresim.com/1itcpppz.jpg
- Grafico de evaluacion Thero-Bench: https://i.hizliresim.com/k0ycscem.png
