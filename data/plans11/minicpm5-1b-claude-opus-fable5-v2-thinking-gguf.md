# Plans11/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF

## Resumen

MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF es la distribucion en formato GGUF del checkpoint MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking, un ajuste fino de 1.080.632.832 parametros construido sobre openbmb/MiniCPM5-1B. El modelo lo publica el usuario Plans11 en Hugging Face y esta pensado para despliegue local en llama.cpp, Ollama, LM Studio, jan y KoboldCpp. La version V2 refuerza respecto a V1 el soporte de tool calling y function calling, manteniendo la plantilla de chat nativa de MiniCPM5 embebida en los metadatos del GGUF.

El interes practico del modelo esta en su relacion tamano-capacidad: con poco mas de mil millones de parametros ofrece modo thinking (razonamiento en cadena antes de la respuesta), contexto declarado de hasta 131.072 tokens segun el config.json upstream y una licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas. Frente al MiniCPM5-1B original, el ajuste mejora de forma medible en benchmarks de uso de herramientas: BFCL live pasa de 60,24% a 63,33% y API-Bank de 7,30% a 22,10%.

El repositorio es exclusivamente de cuantizaciones: incluye Q8_0 (aproximadamente 1,1 GB, recomendada por el autor) y F16 (aproximadamente 2,1 GB). No hay pesos safetensors en este repositorio; para el checkpoint Transformers completo hay que acudir al modelo base del que deriva. El modelo soporta ingles y chino, y su naturaleza de 1B lo situa en el segmento de inferencia local en CPU o GPU de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MiniCPM5-1B, detalles especificos no disponibles) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 131.072 tokens (128K) segun config.json upstream; el contexto usable depende del runtime y del hardware |
| Tipos de cuantizacion | Q8_0 (~1,1 GB, recomendada) y F16 (~2,1 GB) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint Transformers original esta en el modelo base GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MiniCPM5-1B de OpenBMB, un transformer decoder-only de 1.080.632.832 parametros. Sobre esa base, el autor del ajuste (GnLOLot) aplico un post-entrenamiento sobre datos denominados "Fable 5" en su version V2, orientado a reforzar tool calling, function calling, generacion de codigo y seguimiento de instrucciones. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF, DPO o similares.

La innovacion diferencial de esta version respecto a V1 es el refuerzo del comportamiento de function calling, evidenciado en las mejoras de BFCL y API-Bank. El modelo conserva el modo thinking de MiniCPM5, que genera bloques de razonamiento antes de la respuesta final, y la plantilla de chat nativa queda embebida en los metadatos del GGUF, de modo que los runtimes compatibles la aplican automaticamente. La cuantizacion se realizo con llama.cpp. No se dispone de informacion sobre decodificacion especulativa, atencion lineal u otras optimizaciones internas.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat nativa MiniCPM5.
- Modo thinking: produce cadenas de razonamiento antes de la respuesta final; se desactiva con `enable_thinking=False`.
- Tool calling y function calling reforzados en V2 respecto a V1.
- Generacion de codigo, depuracion y flujos de ingenieria de software.
- Seguimiento de instrucciones y adherencia a restricciones de tarea.
- Contexto largo declarado de hasta 128K tokens.
- Capacidades multilingues limitadas a ingles y chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con runtimes GGUF: llama.cpp, Ollama, LM Studio, jan, KoboldCpp.
- No se documentan capacidades de vision, audio ni otros modos multimodales.

## Casos de uso

- Atencion al cliente automatizada en local: con hasta 128K tokens de contexto declarado, el modelo puede mantener conversaciones multi-turno con historial extenso y documentacion de soporte inyectada, desplegado en llama-server sin dependencia de la nube.
- Asistente de codigo en estaciones de trabajo sin GPU dedicada: la cuantizacion Q8_0 (~1,1 GB) permite ejecutarlo en CPU con llama.cpp u Ollama para autocompletado, explicacion de funciones y generacion de tests, con la ventaja de que no sale codigo propietario del equipo.
- Agente con herramientas en pipelines de automatizacion: el refuerzo de function calling de V2 (BFCL live 63,33%) lo hace util para orquestar llamadas a APIs internas en flujos de extraccion de datos o gestion de tickets, aunque con las limitaciones propias de un modelo de 1B en tareas de multiples pasos.
- Prototipado rapido de aplicaciones LLM: su tamano reducido y licencia Apache-2.0 permiten integrarlo como modelo de desarrollo en entornos de CI para validar prompts y plantillas antes de escalar a modelos mayores.
- Procesamiento de documentos largos en chino e ingles: resumen, extraccion de entidades y clasificacion sobre textos extensos aprovechando la ventana de contexto, en despliegues con RAM suficiente para cachear el contexto.
- Educacion y experimentacion con modos de razonamiento: el modo thinking permite estudiar y comparar cadenas de razonamiento generadas por un modelo pequeno, activandolo o desactivandolo segun el caso.
- Despliegue embebido o de borde: al caber en ~1,1 GB, es viable en dispositivos con recursos limitados donde un modelo de 7B o superior no es opcion.

## Benchmarks y rendimiento

Resultados publicados para el checkpoint Transformers del que deriva esta cuantizacion:

| Modelo | BFCL non_live | BFCL live | API-Bank |
|---|---|---|---|
| MiniCPM5-1B (base) | 41,51% | 60,24% | 7,30% |
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 43,06% | 63,33% | 22,10% |

| Dominio Tau-Bench | MiniCPM5-1B (base) | MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking |
|---|---|---|
| Airline | 0,34 (17/50) | 0,36 (18/50) |
| Retail | 0,052 (6/115) | 0,070 (8/115) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. Los resultados Tau-Bench en dominio Retail son muy bajos en terminos absolutos (0,070), lo que conviene tener en cuenta al evaluar el modelo para tareas agenticas complejas.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 1,1 GB con Q8_0 y aproximadamente 2,1 GB con F16 para los pesos; a esto hay que sumar la memoria de la cache KV, que crece con el contexto configurado.
- Contexto y memoria: el contexto maximo declarado es de 131.072 tokens, pero en la practica hay que ajustar `-c` al hardware disponible; el propio autor recomienda configurarlo segun VRAM/RAM.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para Q8_0 con contextos moderados.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp y cualquier runtime GGUF compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking (este) | 1,08B | 128K (declarado) | Thinking + tool calling | Apache-2.0 | GGUF (Q8_0, F16) |
| MiniCPM5-1B (OpenBMB base) | 1,08B | 128K (declarado) | Modelo base generalista | Apache-2.0 | Safetensors y derivados |
| MiniCPM5-1B-Claude-Opus-Fable5-Thinking (V1) | 1,08B | 128K (declarado) | Thinking, tool calling mas debil | Apache-2.0 | GGUF |

Frente al base, este ajuste mejora BFCL live (+3,09 puntos), API-Bank (+14,80 puntos) y ligeramente Tau-Bench, a costa de un comportamiento de razonamiento mas verboso. Frente a V1, el autor indica refuerzo de tool calling, aunque no se aportan cifras comparativas directas entre ambas versiones en la informacion disponible. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Escala 1B: no es un modelo de frontera; su rendimiento en tareas agenticas complejas es limitado (Tau-Bench Retail 0,070).
- Salidas de razonamiento: el modo thinking puede emitir bloques de razonamiento antes de la respuesta, lo que incrementa tokens generados y complica el parseo en produccion si no se gestiona.
- Contexto real: aunque se declaran 128K tokens, el contexto usable depende del runtime GGUF y del hardware; no debe asumirse en despliegues con poca memoria.
- Idiomas: solo ingles y chino; no hay soporte declarado de castellano, por lo que su uso en espanol puede degradar la calidad.
- Alucinacion: no se documentan evaluaciones de factualidad; como modelo pequeno, el riesgo de alucinacion en tareas de conocimiento es relevante.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base OpenBMB/MiniCPM5-1B y del dataset "Fable 5" empleado en el ajuste.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni historial de uso que respalde la calidad de las cuantizaciones.
- Procedencia: es un ajuste comunitario no oficial sobre MiniCPM5; no cuenta con el respaldo de OpenBMB.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Plans11/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-GGUF
- Checkpoint Transformers del que deriva: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Version GGUF anterior (V1): https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
