# AnchorSR/AnchorSR-Qwen3.5-9B-V4-RL-Step3000

## Resumen

AnchorSR-Qwen3.5-9B-V4-RL-Step3000 es un checkpoint intermedio de un proceso de ajuste por refuerzo (GRPO, *Group Relative Policy Optimization*) sobre el modelo AnchorSR-Qwen3.5-9B-SFT-v4. Lo publica el usuario AnchorSR en HuggingFace. El modelo parte de una base Qwen3.5 de 9.409.813.744 parametros (unos 9,41 mil millones, segun los pesos safetensors del repositorio) y esta orientado a tareas de razonamiento espacial multimodal, es decir, a pipeline `image-text-to-text` con soporte explicito de vistas de video.

El interes principal de esta publicacion es documental y de investigacion: el autor indica explicitamente que se trata del paso 3000 de una ejecucion planificada de 7000 pasos, detenida en ese punto, por lo que no es un modelo de una epoca completa ni un modelo final. Se distribuye con pesos exportados sin perdida a safetensors en FP32 (37,7 GB de repositorio) junto con tokenizer, processor y plantilla de chat, y la cache KV de inferencia esta habilitada.

Por su naturaleza (checkpoint intermedio de RL, sin licencia declarada, sin idiomas declarados, 0 descargas y 0 *likes* en el momento de la consulta) debe tratarse como material de experimentacion tecnica, no como un modelo listo para produccion. El unico dato cuantitativo de rendimiento publicado es una recompensa media interna de validacion de 0,4426009064 sobre 256 ejemplos en el paso 3000, que el propio autor advierte que no es una exactitud de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; la etiqueta `qwen3_5` y la libreria `transformers` apuntan a la familia Qwen3.5, con procesamiento multimodal `image-text-to-text` |
| Parametros totales | 9.409.813.744 (9,41 mil millones, dato real de los safetensors) |
| Longitud de contexto | no declarada; la configuracion de entrenamiento usa limites de 8192 tokens de prompt y 2048 tokens de respuesta |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos FP32 en safetensors (no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32, exportado sin perdida desde ocho shards FSDP) |
| Modelo base | AnchorSR/AnchorSR-Qwen3.5-9B-SFT-v4 |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 37,7 GB |
| Version de transformers necesaria | cualquier version con soporte de Qwen3.5 |

## Arquitectura y entrenamiento

El modelo es un ajuste de parametros completos (*full-parameter*) del checkpoint SFT AnchorSR-Qwen3.5-9B-SFT-v4 mediante GRPO. El entrenamiento se ejecuto sobre 8 GPU NVIDIA B300, con lote global de 16 prompts y 4 respuestas por prompt, lo que supone 64 trayectorias por paso. El checkpoint publicado corresponde a 3000 actualizaciones, equivalentes a 48.000 presentaciones de prompt, con una tasa de aprendizaje de 1e-6 y un coeficiente de perdida KL de 0,02. Los limites de prompt y respuesta durante el entrenamiento fueron de 8192 y 2048 tokens respectivamente.

Un aspecto tecnico relevante es el tratamiento del video: la version V4 del pipeline introduce vistas de video explicitas con 16, 24 o 32 fotogramas seleccionados, y el autor advierte de que hay que preservar los metadatos de vista correspondientes si se reproducen las entradas de entrenamiento. La exportacion de pesos se hizo sin perdida a FP32 desde ocho shards FSDP, incluyendo tokenizer, processor y plantilla de chat, pero excluyendo el estado del optimizador y las semillas del entrenamiento, de modo que el checkpoint es util para inferencia o para continuar el ajuste, no para reanudar la ejecucion exactamente donde se dejo. La recompensa media de validacion interna en el paso 3000 fue de 0,4426009064 sobre 256 ejemplos, metrica definida internamente por reglas y no comparable con exactitudes de benchmarks publicos.

## Capacidades

- Generacion de texto conversacional a partir de entradas multimodales de imagen y texto, segun el pipeline `image-text-to-text` declarado.
- Razonamiento espacial (*spatial-reasoning*), que es la capacidad objetivo del ajuste GRPO aplicado.
- Procesamiento de video mediante vistas explicitas con 16, 24 o 32 fotogramas seleccionados, siempre que se aporten los metadatos de vista correspondientes.
- Razonamiento encadenado en multiples pasos, inherente a un ajuste por RL con recompensa basada en reglas.
- Soporte de inferencia con cache KV habilitada, lo que permite generacion autoregresiva multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de *tool calling* o *function calling*: no disponible en la informacion proporcionada.
- Capacidades multilingues concretas: no disponible en la informacion proporcionada.
- Modo *thinking* explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo con GRPO: el checkpoint permite analizar la evolucion de un ajuste de parametros completos en el paso 3000 de 7000, comparando recompensas internas de validacion y comportamiento frente al modelo SFT de partida.
- Evaluacion de razonamiento espacial: sirve como punto de comparacion para medir cuanto aporta el RL sobre la base SFT en tareas que requieren localizar, relacionar y describir objetos en el espacio.
- Analisis de video con muestreo de fotogramas: al soportar vistas de 16, 24 o 32 fotogramas, puede emplearse en tareas de descripcion o pregunta-respuesta sobre clips, conservando los metadatos de vista en las entradas.
- Punto de partida para ajuste adicional (*fine-tuning*): al incluir tokenizer, processor y plantilla de chat, y al excluir el estado del optimizador, es un candidato razonable para continuar el entrenamiento con un objetivo distinto.
- Reproducibilidad de pipelines multimodales: la combinacion de processor y plantilla de chat permite reconstruir el preprocesado exacto y auditar la formacion de las entradas.
- Experimentacion con inferencia multimodal en FP32 o BF16: util para estudiar sensibilidad a la precision numerica en un modelo de 9,41 mil millones de parametros.
- Asistencia conversacional multimodal en entornos de laboratorio: con la cache KV activa puede mantener dialogos multi-turno sobre imagenes, aunque sin licencia declarada no es apto para despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento facilitado por el autor es una metrica interna que no equivale a una exactitud de benchmark:

| Metrica | Valor | Contexto |
|---|---|---|
| Recompensa media de regla en validacion interna (paso 3000) | 0,4426009064 | 256 ejemplos; metrica interna, no comparable con MMLU, HumanEval, GSM8K ni similares |
| Actualizaciones completadas | 3000 de 7000 planificadas | Ejecucion detenida; modelo no completado |
| Presentaciones de prompt | 48.000 | 16 prompts por paso, 4 respuestas por prompt |

## Requisitos de hardware

- Peso del checkpoint: 37,7 GB en FP32. Para inferencia conviene convertir a BF16 (aproximadamente 18,8 GB) o a precision reducida.
- VRAM estimada en BF16: en torno a 19-21 GB solo para pesos, mas la cache KV segun la longitud de contexto, por lo que encaja en GPU de 24 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 10-11 GB; en 4 bits, alrededor de 6-7 GB. Estas cifras son estimaciones a partir del numero de parametros, ya que no se publican cuantizaciones oficiales.
- GPU recomendadas para entrenamiento o ajuste completo: NVIDIA B300, que es lo usado por el autor (8 unidades), asi como A100 80 GB, H100 o H200 para reparto en varios dispositivos.
- GPU de consumo: es viable en RTX 4090, RTX 5090 o similares con 24 GB o mas si se usa BF16 con contexto contenido, y en GPUs de 12-16 GB unicamente con cuantizacion, que no esta publicada.
- Reparto multi-GPU: el autor documento el uso de `device_map="auto"` y FSDP en origen, por lo que el modelo puede distribuirse entre varias GPUs.
- Opciones de despliegue: `transformers` con soporte de Qwen3.5 mediante `AutoModelForImageTextToText` y `AutoProcessor`. La compatibilidad con vLLM, TGI, llama.cpp, Ollama u otros motores no esta confirmada en la informacion disponible, y la ausencia de GGUF impide su uso directo en llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible. Como alternativas de categoria comparable (modelos multimodales densos de aproximadamente 8-10 mil millones de parametros) pueden considerarse Qwen3-VL en su variante de tamano similar, InternVL3 en su variante de 8B y, para tareas solo de texto, Qwen3-8B o Llama-3.1-8B. No se dispone de sus cifras en la informacion proporcionada, por lo que no se incluyen numeros.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos | Notas |
|---|---|---|---|---|---|
| AnchorSR-Qwen3.5-9B-V4-RL-Step3000 | 9.409.813.744 (dato real) | no disponible (entrenamiento con 8192 tokens de prompt) | no disponible | no disponible | Checkpoint intermedio de GRPO (paso 3000 de 7000), multimodal imagen-texto con video |
| Qwen3-VL (variante de tamano similar) | no disponible | no disponible | no disponible | no disponible | Alternativa multimodal de la misma familia base |
| InternVL3 (variante 8B) | no disponible | no disponible | no disponible | no disponible | Alternativa multimodal densa de tamano comparable |
| Qwen3-8B o Llama-3.1-8B | no disponible | no disponible | no disponible | no disponible | Alternativas solo texto, sin capacidad de vision |

## Limitaciones y advertencias

- Es un checkpoint intermedio: el autor indica que el entrenamiento se detuvo en el paso 3000 de 7000 y que no es un modelo de una epoca completa.
- Licencia no declarada: no se puede asumir permiso de uso comercial. Cualquier uso en produccion requiere aclarar la licencia con el autor.
- Sin benchmarks publicos: no hay MMLU, HumanEval, GSM8K ni resultados equivalentes, y el propio autor advierte que la recompensa interna de 0,4426 no es una exactitud de benchmark.
- Idiomas no declarados: se desconoce la cobertura linguistica real, incluido el castellano.
- Contexto no declarado: solo se conocen los limites de entrenamiento (8192 tokens de prompt, 2048 de respuesta), no la ventana nativa del modelo. Usar entradas mas largas de lo previsto para el ajuste puede degradar el comportamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en modelos multimodales ajustados con recompensas basadas en reglas, la recompensa interna no garantiza fidelidad factual.
- Sesgos: no se documenta ningun analisis de sesgos, composicion del dataset de entrenamiento ni proceso de alineacion mas alla del GRPO.
- Dependencia de metadatos: para video, si no se conservan los metadatos de vista (16, 24 o 32 fotogramas) que se usaron en el entrenamiento, las entradas dejan de ser reproducibles y el comportamiento puede desviarse.
- Estado de entrenamiento no incluido: al excluir el optimizador y las semillas, no se puede reanudar la ejecucion exactamente; solo continuar con un ajuste nuevo.
- Huella elevada: 37,7 GB en FP32 obliga a convertir la precision para un despliegue razonable.
- Madurez comunitaria nula: 0 descargas y 0 *likes* en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnchorSR/AnchorSR-Qwen3.5-9B-V4-RL-Step3000
- Modelo base (SFT v4): https://huggingface.co/AnchorSR/AnchorSR-Qwen3.5-9B-SFT-v4
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos correspondian a consultas sin relacion sobre el sitio Bilibili).
