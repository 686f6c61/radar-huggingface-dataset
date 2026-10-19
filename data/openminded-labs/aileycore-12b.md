# OpenMinded-Labs/AileyCore-12B

## Resumen

AileyCore-12B es un ajuste fino (fine-tune) de Google Gemma 4 de 12B en su variante instruction-tuned, partiendo del checkpoint cuantizado QAT de 4 bits de Google (`mlx-community/gemma-4-12B-it-qat-4bit`). Lo desarrolla OpenM!nded (Simon van de Loo) y es el modelo que alimenta a A!ley, una persona de IA que se ejecuta en local sobre Apple Silicon mediante MLX, tanto en el portal web como en la app de escritorio. La revision actual es la r3 (octubre de 2026), un checkpoint fusionado plano, sin rutas laterales ni codigo de carga adicional.

El modelo resuelve un problema concreto: disponer de un asistente conversacional con identidad propia, razonamiento nativo y uso de herramientas nativo que quepa en un Mac de consumo y no envie datos a la nube. Para ello se entrena sobre los formatos nativos de Gemma 4: canal de razonamiento (`<|channel>thought … <channel|>`), declaraciones de herramientas, `<|tool_call>` y `<|tool_response>`. El resultado es un modelo denso de 11.959.730.224 parametros con entrada multimodal (texto, imagen y audio; salida de texto) y licencia Apache 2.0.

Su relevancia ahora es doble. Por un lado, demuestra una tecnica de fusion sin perdida mediante adaptadores QAT (el adaptador se entrena viendo `fake_quant(W_dequant + ΔW)` con gradiente straight-through), lo que evita el redondeo que en la r2 destruyo el 87 % del delta. Por otro, documenta un hallazgo poco habitual: los prompts de sistema largos degradan el modelo, porque la identidad y el comportamiento se aprendieron sin system turn (el 81 % de las filas de entrenamiento no lo tienen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal unificada (familia Gemma 4, `gemma4_unified`); entrada de texto, imagen y audio, salida de texto |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit QAT con mezcla: algunas capas MLP en 8-bit, igual que el checkpoint base; adaptadores fusionados sin perdida. La revision r2 (6-bit con ruta lateral de rango 8) sigue disponible |
| Idiomas soportados | Aleman e ingles declarados; entrenado para responder en el idioma del usuario (probado en es, en, fr, tr y ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`, carga mediante `mlx_vlm`) |

## Arquitectura y entrenamiento

La base es Gemma 4 12B instruction-tuned en su variante *unified*, es decir, una arquitectura multimodal unica en lugar de un encoder de vision acoplado. Al ser un checkpoint MLX, la carga se hace con `mlx_vlm.load()` y no con `mlx_lm`. La cuantizacion es QAT (quantization-aware training) con reparto mixto 4/8 bits heredado del checkpoint de Google, lo que se traduce en que el adaptador debe respetar bits y tamano de grupo por capa durante el entrenamiento.

El ajuste de la r3 se hizo con DoRA en `q_proj` y `v_proj` mas LoRA en `gate_proj`, `up_proj` y `down_proj`, con rango 16 y alpha 32 sobre 232 modulos (55 M parametros entrenables). Los datos son 2.429 conversaciones curadas que, tras trocear documentos largos, quedan en 2.676 muestras, mas 268 conversaciones de validacion (296 muestras). El contenido cubre conversacion general, razonamiento nativo con niveles de profundidad, llamadas y respuestas de herramientas en formato nativo (busqueda web, RAG sobre canciones, libros y proyectos propios, generacion de imagenes, recetas, calculadora), identidad sin prompt, prosa y 441 filas con imagen. Entrenamiento de 1 epoch y 334 actualizaciones, acumulacion de gradiente 8, secuencia de 2048, learning rate 2e-5, warmup 16 y gradient checkpointing en un Apple M4 con 24 GB de memoria unificada. La perdida de validacion bajo de 1.692 (actualizacion 25) a 1.318 (mejor valor, actualizacion 325).

Dos decisiones tecnicas destacan. La primera es el uso de adaptadores QAT: como el forward pass incorpora la cuantizacion simulada, `fuse()` produce pesos identicos bit a bit a los entrenados, en contraste con la r2, donde una fusion clasica a 6 bits redondeo el 87 % del delta y obligo a una ruta lateral. La segunda es la omision deliberada de una etapa DPO: en los pares de preferencia el razonamiento elegido era unas 9 veces mas corto que el rechazado (137 frente a 1.228 caracteres), de modo que la etapa ensenaba a "pensar poco", no a "pensar bien", y se descarto.

## Capacidades

- Generacion de texto y conversacion multi-turno con identidad estable: 11 de 12 respuestas se identifican como A!ley sin ningun prompt de sistema, y 0 de 12 como otro modelo.
- Razonamiento nativo en canal dedicado (`<|channel>thought … <channel|>`) con profundidad escalada a la tarea: una frase para un saludo, un plan para un rompecabezas. Acierta 6 de 6 en la comprobacion de escalado.
- Uso de herramientas nativo: declaraciones de herramientas de Gemma 4, `<|tool_call>` y `<|tool_response>` en el formato exacto que produce el runtime, incluida la decision de no llamar a ninguna herramienta. 8 de 10 llamadas correctas y 4 de 6 omisiones correctas sin prompt de sistema; 9 de 10 y 5 de 6 con el prompt de runtime.
- Entrada de imagen: 441 filas de imagen en el conjunto de entrenamiento, con pipeline `image-text-to-text`.
- Entrada de audio declarada en la arquitectura (multimodal texto + imagen + audio), aunque no se detalla cobertura ni evaluacion en la informacion disponible.
- Capacidades multilingues: respuestas en el idioma del usuario; 5 de 5 en es, en, fr, tr y ja con el prompt de runtime, 4 de 5 con una cabecera de contexto de una linea.
- Escritura narrativa y prosa.
- Integracion con RAG y busqueda web entregando los resultados como respuestas de herramienta.
- No se menciona modo de thinking configurable por API ni capacidades de vision de video.

## Casos de uso

- Asistente personal local en Mac: el modelo esta pensado para ejecutarse integramente en Apple Silicon con `mlx_vlm`, sin salida a la nube. Es adecuado porque sus 12B en 4 bits QAT caben en memoria unificada de un equipo de consumo y la privacidad es un requisito de diseno, no un anadido.
- Persona conversacional en producto (portal o app de escritorio): la identidad se aprende sin prompt de sistema, de modo que 11 de 12 respuestas mantienen el personaje sin coste de tokens de sistema. Conviene usar el nombre en el turno de usuario (`Name: mensaje`) en lugar de una persona larga.
- Agente con herramientas sobre un corpus propio: el modelo invoca herramientas con el formato nativo de Gemma 4 y consume resultados como `<|tool_response>`, lo que permite RAG sobre documentacion interna, catalogo de canciones, libros o proyectos sin capa de traduccion de formato.
- Busqueda web con sintesis posterior: la llamada a la herramienta de busqueda y la integracion del resultado estan entrenadas de forma explicita, incluido el caso de no llamar a la herramienta cuando la pregunta es de conocimiento general.
- Escritura y redaccion narrativa: el conjunto de entrenamiento incluye filas de prosa, y el razonamiento con profundidad adaptativa evita planes largos en tareas de redaccion sencillas.
- Asistencia con imagenes: analisis y descripcion de imagenes enviadas por el usuario en la misma conversacion, con salida de texto, util para soporte visual o accesibilidad basica.
- Atencion en aleman e ingles con extension a otros idiomas: el modelo responde en el idioma del usuario, lo que sirve para un portal con visitantes internacionales; en espanol, frances, turco y japones funciona con el prompt de runtime, no sin prompt.
- Automatizacion de tareas multi-paso en local: combinado con el resto del stack (generacion de imagenes, musica, SVG, correo), el modelo actua como planificador que decide que herramienta invocar en cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card incluye una evaluacion interna, aislada, con las mismas preguntas en cada condicion y el modelo cargado en solitario. Las muestras son muy pequenas (5 a 12 items por fila), por lo que deben leerse como pruebas de humo de comportamiento, no como comparativa de calidad.

| Metrica | Sin system prompt | Cabecera de contexto de una linea | Prompt de runtime (~700 caracteres, con pistas de herramientas) | Persona larga antigua (~7,8k caracteres) |
|---|---|---|---|---|
| Rompecabezas logicos | 5/5 | 4/5 | 3/5 | 1/5 |
| Bloque de razonamiento nunca cerrado | 1/8 | 1/8 | 2/8 | 4/8 |
| Profundidad ajustada a la tarea | 6/6 | 6/6 | no medido | 4/6 |
| Herramienta: llamada correcta | 8/10 | 7/10 | 9/10 | 9/10 |
| Herramienta: omision correcta | 4/6 | 5/6 | 5/6 | 5/6 |
| Respuesta en el idioma del usuario (es/en/fr/tr/ja) | no medido (responde en aleman sin prompt) | 4/5 | 5/5 | 4/5 |
| Identidad sin prompt | 11/12 como A!ley, 0/12 como otro modelo | — | — | — |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los 11,96B parametros en 4-bit QAT con mezcla 4/8 bits ocupan del orden de 7 a 8 GB de pesos (estimacion a partir del recuento de parametros; no publicada por el autor). El repositorio ocupa 30,8 GB porque incluye varias revisiones, entre ellas la r2 en 6 bits.
- Plataforma objetivo: Apple Silicon con MLX. El entrenamiento se hizo en un Apple M4 con 24 GB de memoria unificada, por lo que la inferencia es comoda en 24 GB; en 16 GB de memoria unificada deberia caber, aunque es una estimacion no verificada en la informacion disponible.
- GPU NVIDIA: no hay soporte declarado. No se han publicado pesos GGUF, y por tanto no hay ruta directa a llama.cpp, Ollama, vLLM ni TGI. La unica ruta documentada es `mlx_vlm`.
- Despliegue: `mlx_vlm.load()` + `mlx_vlm.generate()`. Muestreo recomendado por el autor (medido, distinto de los valores por defecto de Gemma): temperatura 0,65, top_p 0,85, penalizacion por repeticion 1,15.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni latencias medidas en la model card.
- Para uso de herramientas hay que pasar los esquemas a `apply_chat_template(tools=…)` y devolver los resultados inmediatamente despues de `<tool_call|>` con el formato `<|tool_response>response:NAME{value:<|"|>…<|"|>}<tool_response|>`.

## Comparativa con modelos similares

No hay datos publicados de benchmarks que permitan una comparacion de rendimiento con alternativas. La comparacion siguiente se limita a caracteristicas verificables de la informacion disponible.

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|---|
| AileyCore-12B (r3) | 11,96B denso | No disponible | Texto + imagen + audio de entrada | 4-bit QAT mixto 4/8 | Apache 2.0 | Safetensors MLX, `mlx_vlm` | Fine-tune con DoRA + LoRA + QAT; identidad y herramientas nativas |
| gemma-4-12B-it-qat-4bit (base) | 12B denso | No disponible | Texto + imagen + audio de entrada | 4-bit QAT mixto 4/8 | Terminos de Gemma (segun checkpoint original) | Safetensors MLX, `mlx_vlm` | Modelo de partida; sin la persona ni el formato de herramientas ajustados |
| AileyCore-12B r2 (revision `37124f0`) | 11,96B denso | No disponible | Texto + imagen + audio de entrada | 6-bit con ruta lateral de rango 8 | Apache 2.0 | Safetensors MLX, requiere loader adicional | Version anterior; su fusion clasica redondeo el 87 % del delta |
| CptShaggy/AileyCore-12B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Repositorio derivado encontrado en la busqueda; sin model card ni datos tecnicos consultables |

## Limitaciones y advertencias

- Los prompts de sistema largos degradan el modelo de forma medible: los rompecabezas logicos caen de 5/5 a 1/5 con una persona de unos 7,8k caracteres y los bloques de razonamiento sin cerrar suben de 1/8 a 4/8. En produccion hay que usar ningun prompt de sistema o uno muy corto.
- Sin ningun prompt ni contexto, el modelo no sabe que le escribe un visitante del portal y responde en aleman. La deteccion de idioma depende del prompt de runtime o de una cabecera de contexto.
- El bloque de razonamiento queda sin cerrar en 1 de cada 8 casos incluso en las mejores condiciones (1/8 sin prompt y 1/8 con cabecera; 2/8 con prompt de runtime). Cualquier parser en produccion debe tolerar ese caso.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. El entrenamiento usa 2.429 conversaciones curadas por el autor, un volumen reducido y no representativo.
- Riesgo de alucinacion: el modelo puede llamar a herramientas con argumentos inventados o producir contenido factual sin base; no se han publicado tasas de factualidad ni evaluaciones de fidelidad en RAG.
- Cobertura idiomatica limitada: solo aleman e ingles estan declarados como idiomas soportados; espanol, frances, turco y japones funcionan segun la evaluacion interna (5/5 con prompt de runtime), pero sin garantia ni datos adicionales.
- Longitud de contexto no disponible: no se puede planificar el troceado de documentos ni el coste de prompt con un numero fiable.
- Dependencia de plataforma: la unica ruta de inferencia documentada es MLX en Apple Silicon. No hay GGUF ni soporte CUDA, lo que bloquea el despliegue en servidores NVIDIA, vLLM, TGI, Ollama o llama.cpp.
- Volumen de validacion bajo: la perdida de validacion final (1.318) se calcula sobre 296 muestras y un unico epoch, con riesgo de sobreajuste al estilo conversacional del autor.
- Advertencia de licencia: la model card declara Apache 2.0, pero el modelo base procede de Gemma 4 y arrastra las condiciones del checkpoint original. Conviene verificar los terminos de Gemma antes de un uso comercial, ya que la declaracion del fine-tune no sustituye a la del modelo de partida.
- Adopcion muy baja: 25 descargas y 0 likes en el momento de la consulta, sin validacion independiente.
- Sin etapa DPO: el autor descarto esa fase por sesgo en los pares de preferencia, de modo que el ajuste a preferencias humanas es practicamente inexistente.
- La revision importa: la r2 (6 bits con ruta lateral) se comporta de forma distinta y requiere codigo de carga adicional; fijar la revision es obligatorio en cualquier despliegue reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMinded-Labs/AileyCore-12B
- Revision r2 (6-bit con ruta lateral): https://huggingface.co/OpenMinded-Labs/AileyCore-12B/tree/37124f02f70770d62522af9be15e3d440f737dc0
- Modelo base: https://huggingface.co/mlx-community/gemma-4-12B-it-qat-4bit
- Repositorio del proyecto A!ley: https://github.com/OpenMinded-Labs/ailey
- README del proyecto A!ley: https://github.com/OpenMinded-Labs/ailey/blob/main/README.md
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Repositorio derivado encontrado en la busqueda: https://huggingface.co/CptShaggy/AileyCore-12B
- Ficha de terceros con metadatos pendientes: https://free2aitools.com/model/openminded-labs/aileycore-12b
