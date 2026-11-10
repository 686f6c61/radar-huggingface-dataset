# Sleem247/mistral-7b-professional-law-Q8_0-GGUF

## Resumen

`Sleem247/mistral-7b-professional-law-Q8_0-GGUF` es un adaptador LoRA en formato GGUF, cuantizado a Q8_0, derivado del adaptador `asabry1233/mistral-7b-professional-law`. Este adaptador se entrenó sobre `mistralai/Mistral-7B-Instruct-v0.3` mediante SFT (supervised fine-tuning) con la librería TRL, y está orientado a tareas de dominio juridico profesional. No se trata de un modelo completo, sino de un delta de pesos que debe aplicarse sobre el modelo base Mistral-7B-Instruct-v0.3 en tiempo de inferencia.

El artefacto lo publica el usuario Sleem247 y es el resultado de convertir el adaptador original a GGUF mediante el espacio `gguf-my-lora` de ggml.ai, con el objetivo de que pueda cargarse directamente en `llama.cpp` (tanto en CLI como en servidor) usando el flag `--lora`. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo de 7B completo.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, sin model card propia mas alla de las instrucciones de uso con llama.cpp, sin licencia declarada y sin datos de evaluacion. Es util para quien quiera probar el adaptador juridico original en entornos de inferencia local con llama.cpp, pero no debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Mistral-7B-Instruct-v0.3 |
| Parametros totales | 41.943.040 (adaptador LoRA, segun safetensors); el modelo base Mistral-7B-Instruct-v0.3 tiene 7.248 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha; el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | GGUF (adaptador LoRA); el repo original esta en formato PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se entreno mediante SFT con TRL sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only de 7.248 millones de parametros con atencion por ventanas deslizantes y contexto de 32.768 tokens. El adaptador resultante se publico originalmente como `asabry1233/mistral-7b-professional-law` en formato PEFT y posteriormente se convirtio a GGUF con cuantizacion Q8_0 mediante el espacio `gguf-my-lora` de ggml.ai, que empaqueta los tensores LoRA en un fichero GGUF compatible con `llama.cpp`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset juridico, el rango del LoRA, el alpha, los hiperparametros de SFT ni si se aplicaron etapas posteriores de alineacion (DPO, RLHF). La unica innovacion tecnica documentada es la propia conversion a GGUF del adaptador, que permite aplicar el delta sobre el modelo base en `llama.cpp` sin necesidad de fusionar pesos previamente.

## Capacidades

- Generacion de texto en dominio juridico profesional, heredando las capacidades del modelo base Mistral-7B-Instruct-v0.3 y especializandose mediante SFT en el corpus del adaptador original.
- Razonamiento y respuesta a instrucciones en formato conversacional, ya que el modelo base es una variante Instruct.
- Generacion de codigo y matematicas basicas: capacidades heredadas del modelo base, no reforzadas especificamente por el adaptador.
- Soporte multilingue: no confirmado para el adaptador; el modelo base Mistral-7B-Instruct-v0.3 esta entrenado principalmente en ingles y frances, con soporte limitado de otros idiomas.
- Tool calling / function calling: no documentado para este adaptador; el modelo base no lo soporta de forma nativa.
- Modo thinking o razonamiento extendido: no disponible.
- Vision o audio: no disponible.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Consulta juridica asistida en local: aplicar el adaptador sobre Mistral-7B-Instruct-v0.3 en `llama.cpp` para responder preguntas sobre terminologia y conceptos juridicos, con la ventaja de que todo el procesamiento ocurre en la maquina del usuario y no requiere enviar textos confidenciales a un servicio externo.
- Borrador de documentos legales: generar esqueletos de contratos, clausulas o escritos a partir de instrucciones en lenguaje natural, usando el adaptador como capa de especializacion sobre el modelo base.
- Resumen de textos juridicos: condensar sentencias, contratos o normativa en resumenes estructurados, aprovechando el contexto de 32.768 tokens del modelo base para documentos largos.
- Prototipado de asistentes legales internos: desplegar un servidor `llama-server` con el adaptador cargado para integrarlo en una demo o prueba de concepto de un chatbot juridico, sin coste de API.
- Investigacion sobre fine-tuning en dominio: servir como caso de estudio reproducible de como un LoRA SFT sobre Mistral-7B se convierte a GGUF y se aplica en llama.cpp, util para equipos que quieran replicar el pipeline con sus propios datos.
- Clasificacion y extraccion de entidades en textos legales: usar el modelo para etiquetar tipos de clausulas, identificar partes o extraer fechas y obligaciones en un corpus de contratos, siempre con revision humana posterior.
- Educacion y formacion juridica: generar explicaciones divulgativas de conceptos legales para estudiantes, con la advertencia de que las respuestas requieren validacion por un profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,1 GB en Q8_0; el coste real de inferencia lo determina el modelo base Mistral-7B-Instruct-v0.3 que se cargue junto al adaptador.
- VRAM estimada para el modelo base: en FP16, unos 14-15 GB; en Q8_0, unos 7,7 GB; en Q4_K_M, unos 4,4 GB. El adaptador anade un consumo marginal.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de alta concurrencia; RTX 4090 (24 GB) para FP16 con comodidad; RTX 3090/4080 (16-24 GB) para Q8_0 o FP16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizaciones Q4/Q5 del modelo base; en Q8_0 requiere al menos 8-10 GB de VRAM libre.
- Opciones de despliegue: `llama.cpp` (CLI y servidor) es el soportado explicitamente por la model card; tambien es posible fusionar el adaptador con el modelo base y servir con vLLM, TGI u Ollama, aunque el repo no documenta ese flujo.
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sleem247/mistral-7b-professional-law-Q8_0-GGUF | 41,9 M (adaptador LoRA) sobre 7,2 B base | 32.768 (heredado del base) | GGUF LoRA | no disponible | Hugging Face, 0 descargas |
| asabry1233/mistral-7b-professional-law | Adaptador LoRA sobre 7,2 B base | 32.768 (heredado del base) | PEFT | no disponible | Hugging Face (origen) |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Modelos juridicos especializados de 7B (p. ej. variantes de Llama o Mistral afinadas en derecho) | 7-8 B | variable | safetensors, GGUF | variable | Hugging Face |

La comparativa directa con otros adaptadores juridicos concretos no esta disponible en la informacion proporcionada; la tabla recoge solo los artefactos relacionados documentados en la ficha.

## Limitaciones y advertencias

- No es un modelo completo: requiere cargar `mistralai/Mistral-7B-Instruct-v0.3` por separado y aplicar el adaptador con `--lora` en `llama.cpp`. Sin el modelo base, el fichero GGUF no es utilizable.
- Ausencia total de evaluacion: no hay benchmarks, ni datos de calidad juridica, ni comparaciones con el modelo base, por lo que no es posible afirmar que el adaptador mejore al base en tareas legales.
- Licencia no declarada: la model card incluye un campo `licence: license` vacio. Esto impide determinar si el uso comercial esta permitido; conviene contactar con el autor o consultar el repo original antes de cualquier despliegue productivo.
- Riesgo alto de alucinacion juridica: el modelo base ya alucina, y un SFT sobre un corpus juridico no verificado puede producir citas de normativa, articulos o jurisprudencia inexistentes. Cualquier salida debe validarse por un profesional.
- Idiomas no declarados: el adaptador no especifica idiomas soportados; el modelo base esta orientado a ingles y frances, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no hay informacion sobre la composicion del dataset de SFT, por lo que no se pueden evaluar sesgos de origen, jurisdiccionales o culturales.
- Repositorio practicamente sin traccion (0 descargas, 0 likes, creado y actualizado el mismo dia) y sin model card propia mas alla de las instrucciones de llama.cpp: no hay garantia de mantenimiento ni de soporte.
- Al ser un LoRA de rango bajo, su capacidad de modificar el comportamiento del modelo base es limitada; no debe esperarse un modelo juridico equiparable a un preentrenamiento desde cero en dominio legal.
- La cuantizacion Q8_0 del adaptador puede introducir una perdida marginal de fidelidad respecto al adaptador original en PEFT; para maxima calidad, usar el repo `asabry1233/mistral-7b-professional-law` y fusionar en precision completa.

## Enlaces

- Repositorio Hugging Face del adaptador GGUF: https://huggingface.co/Sleem247/mistral-7b-professional-law-Q8_0-GGUF
- Adaptador original en PEFT: https://huggingface.co/asabry1233/mistral-7b-professional-law
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
