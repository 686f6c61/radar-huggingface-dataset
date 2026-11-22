# alvar-legaz/Alfa-1-0.5B-Instruct

## Resumen

Alfa 1 Instruct (0.5B) es la versión conversacional y orientada a agentes del modelo base Alfa 1, un modelo de lenguaje pequeno de aproximadamente 520 millones de parametros, bilingue espanol/ingles, preentrenado desde cero por Minaya Research. El modelo se distribuye bajo licencia Apache 2.0 y esta disenado para tareas de instruccion, conversacion multi-turno, generacion de JSON y llamadas a herramientas (tool calling), con un enfoque claro hacia el despliegue en entornos con recursos muy limitados.

La arquitectura es de tipo transformer con estructura Llama, con 519.691.776 parametros totales segun los pesos en safetensors. Se ofrece en formato Transformers (bf16) y en tres cuantizaciones GGUF (F16, Q8_0 y Q4_K_M), lo que permite ejecutarlo desde una Raspberry Pi hasta un servidor convencional. La longitud de contexto no esta indicada en la informacion disponible.

Su relevancia actual radica en dos factores: por un lado, es un modelo entrenado integramente desde cero (no un fine-tuning de otro modelo) para espanol e ingles, algo poco habitual en el segmento sub-1B; por otro, incluye soporte nativo de tool calling con un formato de conversacion propio y plantillas listas para llama.cpp y Ollama. El modelo se presenta como "Alfa1, un modelo de lenguaje desarrollado por Minaya AI", nombre anterior de Minaya Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama |
| Parametros totales | 519.691.776 (~520 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, GGUF F16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con estructura compatible con Llama (config.json, tokenizer y safetensors en formato Llama). El preentrenamiento se realizo desde cero sobre el modelo base Alfa 1, tambien de Minaya Research, sin partir de pesos de terceros. Sobre esa base se aplico un ajuste fino supervisado completo (SFT, no se menciona RLHF ni DPO) con 110.061 ejemplos en espanol e ingles, divididos en 102.055 de entrenamiento y 8.006 de validacion.

El dataset de ajuste incluye instrucciones generales, conversacion multi-turno, matematicas con razonamiento, programacion, extraccion a JSON, restricciones de formato, rechazos de seguridad, identidad y 1.121 trayectorias de agente. Entre los datos de terceros utilizados figuran una traduccion al espanol de yahma/alpaca-cleaned (CC BY 4.0) y ejemplos de OpenAssistant OASST2 (Apache 2.0). El modelo emplea un formato de conversacion propio con tokens especiales `<USER>`, `<ASSISTANT>`, `<FIN>` (fin de turno/EOS) y `<tool>`/`<turno>` para el modo agente; no dispone de rol de sistema separado, sino que las instrucciones de sistema se anteponen al primer mensaje del usuario.

## Capacidades

- Generacion de texto conversacional multi-turno en espanol e ingles.
- Seguimiento de instrucciones y respeto de restricciones de formato.
- Generacion de JSON y extraccion estructurada de informacion.
- Razonamiento matematico basico con pasos intermedios.
- Generacion de codigo (con calidad limitada por el tamano del modelo).
- Tool calling / function calling mediante un protocolo propio basado en `<tool>{...}</tool>` y JSON Schema estilo OpenAI.
- Razonamiento multi-paso orientado a agentes: llamada a herramienta, recepcion del resultado en `<turno>{resultado}<ASSISTANT>` y generacion de la respuesta final.
- Rechazos de seguridad basicos entrenados en el SFT.
- Capacidades bilingues espanol/ingles.
- No dispone de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistente conversacional en dispositivos de bajos recursos: con la cuantizacion Q4_K_M (329 MB) puede ejecutarse en una Raspberry Pi o en un portatil sin GPU, gestionando conversaciones multi-turno con el formato `<USER>`/`<ASSISTANT>`/`<FIN>`.
- Agente con herramientas acotadas: integrado con las herramientas `buscar` y `calcular` (las dos con las que fue entrenado), puede resolver calculos y consultas enciclopedicas encadenando llamadas estructuradas y resultados en `<turno>`.
- Extraccion de datos a JSON: util para convertir texto libre en estructuras JSON en pipelines de preprocesamiento o ETL, gracias al entrenamiento especifico en extraccion y restricciones de formato.
- Prototipado rapido de aplicaciones de chat: su licencia Apache 2.0 y su integracion con llama.cpp/Ollama permiten montar un endpoint compatible con la API de OpenAI (`/v1/chat/completions`) en minutos para pruebas de concepto.
- Filtrado y clasificacion ligera de texto: tareas acotadas de etiquetado o reformateo donde la latencia y el coste importan mas que la precision maxima.
- Educacion y experimentacion en NLP: al estar preentrenado desde cero y ser bilingue es/en, sirve como base para estudiar tecnicas de SFT, tool calling y cuantizacion en modelos pequenos.
- Generacion de codigo asistida en entornos con restricciones de memoria: para autocompletado o snippets sencillos, aceptando las limitaciones de un modelo de 0,5B.

## Benchmarks y rendimiento

| Benchmark | Alfa 1 Instruct |
|---|---|
| MT-Bench (ES / EN) | 1,66 / 1,68 |
| IFEval-es (estricto, prompt / instruccion) | 0,202 / 0,326 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB en bf16/F16 (1,04 GB de pesos), unos 0,6 GB en Q8_0 (554 MB) y unos 0,35 GB en Q4_K_M (329 MB), mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti en adelante) y en hardware tipo Raspberry Pi con la cuantizacion Q4_K_M.
- Opciones de despliegue: transformers (Python), llama.cpp (`llama-server`), Ollama (con el Modelfile incluido), y endpoints compatibles con la API de OpenAI. El autor indica que el modo agente debe usarse con prompts en bruto (`/completion`), no a traves de la API de herramientas de llama-server.
- Parametros de generacion recomendados: temperature 0.3, top_k 30, repeat_penalty 1.3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (por ejemplo, Qwen2.5-0.5B-Instruct, SmolLM2-360M-Instruct o Gemma-2-2B) que permitan una comparacion rigurosa de parametros, contexto y benchmarks. Se indica "no disponible" para evitar inferencias sin respaldo. A modo de contexto cualitativo, Alfa 1 Instruct se distingue por su preentrenamiento desde cero bilingue es/en y su soporte nativo de tool calling, mientras que la mayoria de alternativas sub-1B son monolingues o multilingues con enfasis en ingles.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: inventa datos con facilidad (alucinacion alta) y comete errores de razonamiento y de codigo.
- El alineamiento de seguridad es basico; no debe usarse para decisiones con consecuencias sin supervision humana.
- El tool calling solo se entreno con dos herramientas (`buscar` y `calcular`); con otras herramientas la fiabilidad baja notablemente.
- No hay rol de sistema nativo: las instrucciones de sistema deben anteponerse al primer mensaje del usuario.
- Longitud de contexto no documentada en la informacion disponible.
- Soporte limitado a espanol e ingles; no se garantiza calidad en otros idiomas.
- El modo agente requiere prompts en bruto y no funciona correctamente a traves de la API de herramientas de llama-server.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda explicitamente no usarlo para decisiones criticas sin supervision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alvar-legaz/Alfa-1-0.5B-Instruct
- Modelo base: https://huggingface.co/alvar-legaz/Alfa-1-0.5B
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset OpenAssistant OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Informe tecnico citado: *Alfa1-0.5B: preentrenamiento eficiente de un modelo pequeno bilingue espanol/ingles* (sin URL disponible en la informacion proporcionada)
