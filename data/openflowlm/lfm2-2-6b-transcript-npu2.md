# OpenFlowLM/LFM2-2.6B-Transcript-NPU2

## Resumen

OpenFlowLM/LFM2-2.6B-Transcript-NPU2 es una publicacion derivada del modelo LiquidAI/LFM2-2.6B-Transcript, un "Liquid Nano" de 2.600 millones de parametros especializado en la resumir transcripciones de reuniones de forma local. El autor del repositorio es el usuario OpenFlowLM, que lo distribuye bajo la libreria transformers y con el sufijo "NPU2", lo que apunta a un empaquetado orientado a la ejecucion en NPU de AMD Ryzen AI (la propia busqueda web enlaza con repositorios de FastFlowLM que contienen xclbins con ese mismo nombre).

El modelo resuelve un problema concreto: resumir reuniones de 30 a 60 minutos sin enviar los datos a la nube, generando resumenes ejecutivos, resumenes detallados, listas de acciones, decisiones clave y participantes. La model card destaca que funciona con menos de 3 GB de RAM incluso en reuniones largas, que produce resumenes en segundos y que se ejecuta en CPU, GPU y NPU. Liquid AI desarrollo el modelo original en colaboracion con AMD.

Es relevante ahora porque la demanda de IA en el borde (edge) para datos sensibles crece, y este tipo de modelos pequenos, de licencia abierta y ejecutables en hardware de consumo, permiten flujos de trabajo enterprise sin dependencia de la nube. El repositorio de OpenFlowLM tiene 0 descargas y 0 likes en el momento de la consulta, y su model card reproduce la del modelo original de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), familia "Liquid Nano"; detalle de capas no disponible en la informacion proporcionada |
| Parametros totales | 2,6 mil millones (segun denominacion del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este repositorio; existen variantes GGUF, ONNX y MLX de la version original (4 bits en MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0, con archivo LICENSE en el repositorio) |
| Formato de pesos | no confirmado; el repositorio usa la libreria transformers y ocupa 1,9 GB (el modelo original se distribuye en formato nativo, GGUF, ONNX y MLX) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como parte de la familia LFM2 de Liquid AI, etiquetada en HuggingFace con los tags "liquid", "lfm2" y "edge", y construida sobre LiquidAI/LFM2-2.6B. No se detallan en la informacion proporcionada la composicion interna de capas, el mecanismo de atencion ni si se trata de una arquitectura hibrida (convolucional y atencion) o de un transformer clasico, por lo que esos datos se consideran no disponibles. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Si se describen las caracteristicas de uso: el modelo esta entrenado para resumir transcripciones largas (reuniones de 30 a 60 minutos) y producir salidas estructuradas con puntos clave, decisiones y elementos de accion, con un tono y formato consistentes. La model card indica que la calidad de resumen se acerca a la de modelos mucho mayores, con un consumo inferior a 3 GB de RAM. El modelo se distribuye en cuatro formatos complementarios en el repositorio original (nativo para Transformers y vLLM, GGUF para llama.cpp, ONNX para despliegue multiplataforma y MLX para Apple Silicon), lo que facilita su integracion en distintos runtimes.

## Capacidades

- Generacion de resumenes de transcripciones de reuniones en formato estructurado: resumen ejecutivo, resumen detallado, acciones, decisiones clave, participantes y temas tratados.
- Salida en parrafos o en listas segun el prompt de usuario, con formato y tono consistentes.
- Procesamiento de entradas largas con multiples interlocutores etiquetados por nombre de hablante.
- Ejecucion local en CPU, GPU y NPU, sin conexion a la nube.
- Consumo reducido de memoria: menos de 3 GB de RAM para reuniones largas segun la model card.
- Capacidad multilingue: limitada al ingles (language: en).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo esta pensado para conversaciones de un solo turno.
- Vision o audio: no soportados (es un modelo de generacion de texto).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Resumen automatico de reuniones de equipo internas: se introduce la transcripcion con cabecera (titulo, fecha, hora, duracion y participantes) y el modelo devuelve un resumen detallado o ejecutivo, todo local y sin enviar datos a terceros.
- Actas de reuniones de consejo y briefings ejecutivos: el modelo puede generar listas de decisiones clave y acciones asignadas, utiles para documentar acuerdos formales sin exponer informacion confidencial.
- Analisis posterior a llamadas de ventas: a partir de la transcripcion de la conversacion con el cliente, se extraen temas tratados y acciones de seguimiento, lo que permite alimentar un CRM interno sin salida de datos.
- Entornos regulados o sensibles (sanidad, banca, legal): el procesamiento integro en el dispositivo evita el cumplimiento de requisitos de transferencia internacional de datos y simplifica las auditorias.
- Flujos de trabajo sin conectividad o con red limitada: reuniones grabadas en ubicaciones remotas pueden procesarse en un portatil con CPU o NPU, sin depender de internet.
- Despliegue en PC con AMD Ryzen AI: la variante NPU2 encaja en escenarios de inferencia acelerada por NPU, reduciendo el consumo energetico frente a una GPU dedicada.
- Extraccion de tareas para herramientas de gestion de proyectos: combinando el prompt de "action items" con un postprocesado ligero, se pueden crear tickets automaticamente a partir de la transcripcion.
- Generacion de resumenes de sesiones formativas o modulos de formacion, empleando el campo de titulo y duracion de la cabecera para dar contexto al resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original unicamente ofrece afirmaciones cualitativas: calidad de resumen proxima a la de modelos mucho mayores, menos de 3 GB de RAM en reuniones largas y generacion de resumenes "en segundos". No se proporcionan valores de MMLU, HumanEval, GSM8K ni metricas especificas de resumen (ROUGE, BERTScore, etc.), ni resultados comparativos numericos con otros modelos.

## Requisitos de hardware

- Memoria declarada por el autor: menos de 3 GB de RAM para reuniones largas (model card del modelo original).
- Estimacion aritmetica orientativa para pesos en precision de 16 bits: aproximadamente 5,2 GB de VRAM (2,6 mil millones de parametros x 2 bytes); en cuantizacion de 4 bits, en torno a 1,4-1,6 GB. Estas cifras son calculos derivados del tamano del modelo, no datos publicados.
- GPU recomendadas: no especificadas en la informacion. El modelo esta orientado a edge, por lo que su objetivo son iGPU/NPU integradas y GPU de consumo mas que aceleradores de centro de datos.
- Compatibilidad con GPU de consumo: si, segun el enfoque edge del modelo; no se enumeran modelos concretos.
- Aceleracion por NPU: la variante NPU2 apunta a las NPU de AMD Ryzen AI; la busqueda web enlaza con el repositorio FastFlowLM, que distribuye xclbins para ejecutar LLM en esas NPU.
- Opciones de despliegue: Transformers y vLLM (formato nativo), llama.cpp y herramientas compatibles (GGUF), ONNX Runtime (ONNX), MLX (Apple Silicon) y el runtime FastFlowLM para NPU AMD. El repositorio concreto de OpenFlowLM no detalla sus instrucciones de despliegue.
- Latencia y throughput estimados: no disponibles. La model card menciona "resumenes en segundos, no minutos" sin cifras concretas ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| OpenFlowLM/LFM2-2.6B-Transcript-NPU2 | 2,6 mil millones | no disponible | repositorio transformers de 1,9 GB; orientado a NPU (sufijo NPU2) | lfm1.0 | Resumen de transcripciones en dispositivo |
| LiquidAI/LFM2-2.6B-Transcript | 2,6 mil millones | no disponible | Nativo, GGUF, ONNX, MLX | lfm1.0 | Resumen de transcripciones en dispositivo (modelo de referencia) |
| LiquidAI/LFM2-2.6B | 2,6 mil millones | no disponible | no disponible en la informacion | lfm1.0 | Modelo base generalista de la familia LFM2 |

No se dispone de datos comparativos de rendimiento entre estos modelos ni frente a alternativas de otros fabricantes (por ejemplo, modelos pequenos de resumen de terceros), ya que no se han publicado resultados numericos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para conversaciones de un solo turno con un formato de entrada concreto; usarlo en modo multiturno o con otro formato puede degradar la calidad de salida.
- Idioma: solo ingles. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso directo con transcripciones en espanol.
- Se recomienda temperatura 0,3; valores mas altos pueden aumentar la variabilidad y el riesgo de contenido no fiel a la transcripcion.
- Riesgo de alucinacion: no se documentan mecanismos especificos para el riesgo de alucinacion. No se garantiza que las decisiones, acciones o participantes extraidos esten presentes en la transcripcion original.
- Sesgos conocidos: no documentados en la informacion disponible. Al tratarse de un modelo entrenado principalmente para resumen en ingles, pueden aparecer sesgos derivados del corpus de entrenamiento y del dominio (reuniones corporativas).
- Restricciones de licencia: la licencia es lfm1.0 (license: other), con archivo LICENSE en el repositorio. No se detallan en la informacion proporcionada las condiciones exactas de uso comercial, por lo que es imprescindible revisar el texto completo de la licencia antes de un despliegue en produccion.
- Este repositorio concreto es una publicacion derivada (OpenFlowLM) con 0 descargas y 0 likes; la model card reproduce la del modelo original, por lo que el linaje y los cambios aplicados respecto a LiquidAI/LFM2-2.6B-Transcript no estan documentados.
- El sufijo NPU2 sugiere un formato optimizado para NPU AMD Ryzen AI; su uso fuera de ese hardware o runtime no esta garantizado por la informacion disponible.
- No se especifican la longitud de contexto soportada ni el comportamiento en transcripciones que excedan ese limite. Tampoco hay datos de rendimiento publicados.

## Enlaces

- Modelo en HuggingFace (OpenFlowLM): https://huggingface.co/OpenFlowLM/LFM2-2.6B-Transcript-NPU2
- Modelo original en HuggingFace (LiquidAI): https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- Modelo base de la familia: https://huggingface.co/LiquidAI/LFM2-2.6B
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-ONNX
- Variante MLX (4 bits): https://huggingface.co/mlx-community/LFM2-2.6B-Transcript-4bit
- Repositorio FastFlowLM en HuggingFace: https://huggingface.co/FastFlowLM/LFM2-2.6B-Transcript-NPU2
- Repositorio FastFlowLM en GitHub (xclbins para NPU AMD): https://github.com/FastFlowLM/FastFlowLM
- Documentacion de Liquid AI sobre LFM2-2.6B-Transcript: https://docs.liquid.ai/lfm/models/lfm2-2.6b-transcript
- Documentacion general de LFM: https://docs.liquid.ai/lfm
- Blog de Liquid AI sobre resumen de reuniones en local: https://www.liquid.ai/blog/the-future-of-meeting-summarization-local-fast-private-and-fully-secure
- Blog de AMD sobre la colaboracion con Liquid AI: https://www.amd.com/en/blogs/2026/liquid-ai-amd-ryzen-on-device-meeting-summaries.html
- Playground de Liquid AI: https://playground.liquid.ai/
- Plataforma LEAP de Liquid AI: https://leap.liquid.ai/
