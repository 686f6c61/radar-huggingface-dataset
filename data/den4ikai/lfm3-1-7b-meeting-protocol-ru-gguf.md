# Den4ikAI/LFM3-1.7B-meeting-protocol-ru-GGUF

## Resumen
LFM3-1.7B Meeting Protocol RU (GGUF) es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM3-1.7B, desarrollado por Den4ikAI, orientado a una única tarea: convertir la transcripción de una conversación en ruso en un protocolo de reunion estructurado en JSON. El resultado incluye titulo, resumen, decisiones, tareas con ejecutor y fecha, y puntos clave. Con 1.728.801.600 parametros (1,7B), esta pensado para inferencia en dispositivo (telefono o portatil) sobre CPU, sin conexion a internet.

La relevancia practica esta en el nicho: no es un modelo generalista, sino un modelo especializado que sustituye a un LLM grande en una tarea concreta de extraccion de informacion estructurada. El ajuste se hizo mediante LoRA (r=32, todas las capas lineales, 2 epocas), fusionado con la base y convertido a GGUF para llama.cpp.

La ficha describe exclusivamente este fine-tune. Los datos sobre la arquitectura interna del modelo base no estan detallados en la informacion proporcionada mas alla de que llama.cpp requiere soporte de la arquitectura `lfm3` (master de noviembre de 2026 o posterior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI; requiere soporte `lfm3` en llama.cpp). Detalle interno no disponible |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenado con conversaciones de hasta ~2.500 tokens; se recomienda `-c 4096` en llama.cpp. Contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (1,10 GB), Q8_0 (1,85 GB), F16 (3,47 GB) |
| Idiomas soportados | Ruso (ru) unicamente |
| Licencia | LFM Open License v1.0 (Liquid AI, Inc.), etiquetada como `other` / `lfm1.0` |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM3-1.7B y se adapta mediante LoRA con rango 32 aplicado a todas las capas lineales durante 2 epocas. La adaptacion se fusiona con los pesos base y se exporta a GGUF en tres precisiones. El prompt sigue el formato de chat del modelo base (`<|startoftext|>`, `<|im_start|>`), con el turno del asistente iniciado por `<think></think>` para desactivar el razonamiento.

El conjunto de entrenamiento es sintetico: 2.300 conversaciones en ruso con protocolos de referencia generados por un LLM grande. De ellas, 1.800 son reuniones de trabajo en 40 sectores (IT, construccion, medicina, servicios publicos, finanzas, energia, ambito familiar, entre otros), con 2-5 participantes y entre 8 y 55 turnos; las otras 500 son podcasts y entrevistas. El texto esta estilizado para imitar la salida de reconocimiento automatico del habla: registros coloquiales, interrupciones, numeros escritos con palabras y errores de transcripcion.

No se documenta el volumen de tokens de entrenamiento ni si hubo RLHF o DPO en la base. La innovacion relevante del fine-tune es la salida estrictamente JSON y la gestion explicita de campos inciertos: `assignee` toma el nombre si se menciona, `спикер_N` si se infiere el hablante, o `null`; `due` recoge la fecha tal como se enuncio o `null`.

## Capacidades
- Generacion de protocolos de reunion en JSON con campos fijos: `title`, `summary`, `decisions`, `tasks` (con `task`, `assignee`, `due`) y `key_points`.
- Variantes de instruccion sobre el mismo formato: resumen breve, extraccion de tareas, extraccion de decisiones y acuerdos.
- Entrada basada en lineas `спикер_N: texto`, compatible con la salida de sistemas de diarizacion.
- Extraccion de entidades implicitas: nombres de personas, plazos y cifras mencionadas en la conversacion.
- Modo de razonamiento desactivado (`<think></think>`), lo que reduce latencia y tokens generados.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en ruso.
- Tool calling y function calling: no disponible (no se documenta soporte).
- Uso en agentes multi-paso: no disponible; el modelo esta disenado para una unica pasada de extraccion.

## Casos de uso
- Actas de reunion automaticas en entornos corporativos: se alimenta la transcripcion diarizada de la reunion y el modelo devuelve un JSON con decisiones y tareas que se puede volcar directamente en un gestor de proyectos o en un wiki, sin intervencion manual en el formateo.
- Integracion con pipelines de reconocimiento de voz: encaja detras de un ASR con diarizacion (por ejemplo Whisper con separacion de hablantes) y procesa la salida `спикер_N:` sin necesidad de reetiquetar el texto.
- Extraccion de action items para seguimiento: usando la instruccion especifica de tareas, se obtiene una lista con ejecutor y plazo para alimentar herramientas tipo Jira, Notion o Trello mediante una capa de transformacion JSON.
- Resumen de entrevistas y podcasts: el modelo tambien se entreno con 500 podcasts e entrevistas, por lo que sirve para condensar conversaciones largas en titulo y resumen antes de su publicacion.
- Procesamiento local en portatil sin conectividad: con Q4_K_M (1,10 GB) y llama.cpp en CPU, permite generar protocolos en entornos con requisitos de confidencialidad o sin acceso a red, manteniendo el audio y las transcripciones en el dispositivo.
- Segmentacion de reuniones largas: al cortar transcripciones por turnos en fragmentos de hasta ~2.200 tokens y fusionar los protocolos parciales, se pueden cubrir reuniones que exceden la ventana de entrenamiento.
- Borrador previo a revision humana: en flujos donde un secretario revisa el acta, el modelo reduce el trabajo mecanico de estructuracion y deja la validacion final a la persona.

## Benchmarks y rendimiento
Evaluacion sobre 50 reuniones retenidas; la tarea se considera correcta si coinciden ejecutor y plazo.

| Modelo | JSON valido | Tareas: precision | Tareas: recall |
|---|---:|---:|---:|
| LFM3-1.7B sin ajuste fino | 37/50 | 0,05 | 0,08 |
| Este modelo (bf16) | 49/50 | 0,85 | 0,79 |
| Este modelo Q4_K_M (submuestra de 12) | no disponible | 0,81 | 0,75 |

Rendimiento de Q4_K_M en CPU x86 de 4 nucleos con AVX2: lectura de prompt ~100 tokens/s, generacion ~13 tokens/s; un protocolo de una reunion de dos minutos tarda 30-40 s. El autor indica que Q4_K_M no rinde peor que bf16 en la tarea. No hay resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: Q4_K_M ~1,3 GB de pico con `use_extra_bufts=false` (frente a ~2 GB con repacking); Q8_0 ~1,85 GB de pesos; F16 ~3,47 GB. Con contexto por defecto de llama.cpp (todo el contexto de entrenamiento) se necesita mas de 4 GB; con `-c 4096` baja.
- GPU recomendadas: no se documentan; el modelo esta disenado para CPU. Cualquier GPU consumer con al menos 2-4 GB libres puede alojar las cuantizaciones, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: si, en terminos de memoria (Q4_K_M en tarjetas de 4 GB o mas), aunque no hay mediciones publicadas.
- Despliegue: llama.cpp (requerido, con soporte `lfm3`); `llama-completion` es la ruta documentada. vLLM, TGI, Ollama y otros motores no estan documentados para este artefacto.
- Latencia y throughput: ~13 tokens/s de generacion y ~100 tokens/s de lectura de prompt en CPU x86 de 4 nucleos con AVX2; 30-40 s por protocolo de reunion de dos minutos.
- Parametros de ejecucion recomendados: decodificacion voraz (`--temp 0`), `--repeat-penalty 1.1` con `--repeat-last-n 64` (sin penalizacion el modelo ocasionalmente entra en bucle), `-c 4096`, `-n 1024`, `-no-cnv`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B Meeting Protocol RU (este modelo) | 1,7B | Entrenado hasta ~2.500 tokens; recomendado 4.096 | Protocolos de reunion en ruso, JSON | LFM Open License v1.0 | GGUF en Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Generacion de texto, agentes y tool calling (segun la busqueda web) | LFM Open License v1.0 | Hugging Face, incluida variante GGUF |
| LFM3-1.7B sin ajuste fino (linea base del autor) | 1,7B | Igual al base | Protocolos de reunion: 37/50 JSON validos, precision 0,05 | LFM Open License v1.0 | Uso interno en la evaluacion |

La comparacion con modelos de otros fabricantes especializados en resumen de reuniones en ruso no esta disponible en la informacion proporcionada. La unica comparacion cuantitativa documentada es frente al modelo base sin ajuste, donde el fine-tune mejora la validez del JSON de 37/50 a 49/50 y la precision de tareas de 0,05 a 0,85.

## Limitaciones y advertencias
- Solo ruso. No esta entrenado ni evaluado en otros idiomas; su uso fuera del ruso no esta respaldado.
- Orientado a dialogos y reuniones; no a monologos ni a texto creativo o literario.
- Modelo pequeno (1,7B): puede producir formulaciones imprecisas, confusion de roles en el resumen y errores gramaticales ocasionales.
- Riesgo de alucinacion en entradas incoherentes o muy cortas: puede completar detalles no presentes en la transcripcion. El resultado debe presentarse como borrador sujeto a revision humana.
- No corrige ni reescribe la transcripcion; esa funcion queda fuera de su alcance.
- Entradas largas: las transcripciones deben cortarse por turnos en fragmentos de hasta ~2.200 tokens y fusionar los protocolos parciales; el modelo se entreno con conversaciones de hasta ~2.500 tokens.
- Sin penalizacion de repeticion tiende a entrar en bucle; requiere `--repeat-penalty 1.1` y `--repeat-last-n 64`.
- Licencia LFM Open License v1.0: incluye restricciones de uso comercial para organizaciones con ingresos anuales de 10 millones de dolares o mas. Revisar el texto de la licencia antes de un uso en produccion.
- Dependencia de version: necesita llama.cpp con soporte de la arquitectura `lfm3` (master de noviembre de 2026 o posterior); versiones anteriores no cargaran el modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Den4ikAI/LFM3-1.7B-meeting-protocol-ru-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Guia practica sobre LFM3-1.7B para agentes y tool calling: https://aiindigo.com/blog/lfm3-1-7b-a-compact-open-model-built-for-agents-and-tool-calling
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
