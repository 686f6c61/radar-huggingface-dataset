# EXAiStudio/EX-AI-Corase-14M

## Resumen

EX-AI-Corase-14M (nombre comercial "EX Corase") es un modelo de lenguaje en persa de tamano muy reducido, desarrollado por EXAiStudio y publicado en HuggingFace bajo licencia MIT. Se trata de un modelo entrenado desde cero (from scratch) con arquitectura TinyGPT, un transformer decoder-only de aproximadamente 14,2 millones de parametros, 6 capas, 6 cabezas de atencion y una dimension de embedding de 384. Su ventana de contexto es de solo 256 tokens y su vocabulario BPE consta de 8000 entradas.

El proposito declarado del modelo es exclusivamente divulgativo y de investigacion: demostrar el ciclo completo de construccion de un LLM (tokenizacion, entrenamiento, exportacion a ONNX y despliegue web) ejecutable en una instancia gratuita de Google Colab con GPU T4. El propio autor advierte de forma explicita que no debe emplearse como asistente fiable ni en entornos de produccion, ya que puede generar hechos incorrectos, alucinaciones y continuaciones irrelevantes.

Su relevancia actual es limitada desde el punto de vista de capacidades, pero resulta util como material didactico para quienes quieran entender la anatomia de un modelo generativo minimo, inspeccionar el formato de pesos (PyTorch y ONNX) o experimentar con tecnicas de filtrado de datasets en un contexto de bajos recursos computacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyGPT (transformer decoder-only) |
| Parametros totales | ~14,2 millones (14.200.000) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor menciona fp16 planificado para una futura version de 100M) |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`tiny_gpt.pt`, 52 MB) y ONNX (`tiny_gpt_final.onnx`, 52 MB, opset 18) |

Detalles adicionales de configuracion: `vocab_size` 8000, `n_layer` 6, `n_head` 6, `n_embd` 384, `dropout` 0,1 y weight tying entre `wte.weight` y `lm_head.weight`. El tokenizador es un BPE entrenado con la libreria `tokenizers` que incluye los tokens especiales `<s>`, `<pad>`, `</s>`, `<unk>`, `<|user|>` y `<|assistant|>`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de estilo GPT, sin mecanismos de atencion lineal, sin mezcla de expertos ni componentes de estado recurrente. La innovacion tecnica, si puede llamarse asi, es la simplicidad: un modelo de 6 capas y 384 dimensiones que cabe en 52 MB y que se entrena en una T4 de Colab en 5000 pasos con AdamW (lr=3e-4, weight_decay=0,1), batch de 32 y precision fp32. La perdida de entrenamiento descendio de 9,10 a 0,72 en la version v3.

El dataset deriva de `expertra_cleaned.jsonl` (unas 90.000 muestras), filtrado para producir `expertra_v3.jsonl`. Los filtros aplicados incluyen la eliminacion de marcadores de numero entre corchetes, la supresion de respuestas con datos geograficos erroneos (el autor cita ejemplos como "Islandia = Nairobi"), el recorte de respuestas de mas de 200 caracteres y la eliminacion de etiquetas `<|user|>` dentro de turnos de asistente. Se anadieron 350 muestras de identidad fijas ("soy EX Corase, un modelo de lenguaje persa pequeno que tu construiste") y 6000 muestras de aritmetica limpia de sumas y restas. El formato es JSONL con estructura de mensajes `role`/`content`. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de texto en persa con formato de turnos conversacionales mediante los tokens `<|user|>` y `<|assistant|>`.
- Respuestas de identidad consistentes gracias a las 350 muestras de identidad anadidas en v3.
- Aritmetica basica de suma y resta, reforzada con 6000 ejemplos especificos.
- Continuacion de texto libre en persa dentro de la ventana de 256 tokens.
- Exportacion a ONNX con entrada dinamica `input_ids` de tipo int64, apta para inferencia en navegador mediante onnxruntime-web.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento extendido.
- No se documenta capacidad multilingue: el modelo esta entrenado unicamente en persa y su vocabulario de 8000 tokens esta optimizado para ese idioma.

## Casos de uso

- Docencia y divulgacion sobre LLM: el modelo sirve para ilustrar en clase o en talleres el pipeline completo de entrenamiento (tokenizacion BPE, entrenamiento de un transformer, exportacion ONNX) con un coste de computo trivial y un unico fichero de 52 MB.
- Prototipado de interfaces de chat en navegador: al incluir un ONNX de entrada dinamica, se puede cargar en una demo HTML con onnxruntime-web y un selector de ficheros, sin backend ni GPU, para validar el flujo de inferencia local.
- Pruebas de integracion de tokenizadores persas: util para verificar el comportamiento de un BPE de 8000 tokens sobre texto persa antes de escalar a un modelo mayor, incluyendo la deteccion de problemas conocidos como la perdida de espacios entre palabras.
- Experimentos de filtrado de datasets: el proceso documentado de limpieza de `expertra_cleaned.jsonl` (eliminacion de respuestas erroneas, recorte de longitud, supresion de etiquetas mal formadas) sirve como caso de estudio reproducible de curacion de datos para modelos pequenos.
- Evaluacion de tecnicas de parada de generacion: permite practicar la implementacion de criterios de stop en `</s>` y `<|user|>`, un detalle critico para evitar continuaciones irrelevantes en modelos pequenos.
- Referencia para comparativas de eficiencia: con 14M de parametros y 52 MB, es un punto de partida para medir latencia y throughput en CPU frente a modelos mayores en tareas de generacion de texto persa muy acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de entrenamiento, que paso de 9,10 a 0,72 en la version v3 tras 5000 pasos, un dato que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (52 MB de pesos mas activaciones para secuencias de hasta 256 tokens); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; el autor lo entreno en una Google Colab T4. Cualquier GPU con al menos 1 GB de memoria es suficiente.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), y tambien en Raspberry Pi o entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo (`tiny_gpt.pt`), ONNX Runtime (`tiny_gpt_final.onnx` con entrada `input_ids`), y demo web estatica con onnxruntime-web. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y dada la arquitectura y el formato no es esperable que existan convertidores oficiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia de milisegundos en CPU para secuencias cortas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para establecer una tabla rigurosa. A modo orientativo por categoria (modelos de lenguaje minimos entrenados desde cero para investigacion), se puede senalar lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EX-AI-Corase-14M | ~14,2 M | 256 | MIT | HuggingFace, PyTorch y ONNX |
| Modelos tipo TinyStories (variantes) | 1-30 M | 256-512 | variable | HuggingFace |
| GPT-2 small | 124 M | 1024 | MIT | HuggingFace |

La comparacion con GPT-2 small no es de rendimiento sino de orden de magnitud: EX Corase es aproximadamente nueve veces menor en parametros y cuatro veces menor en contexto, y esta especializado en persa con un vocabulario mucho mas reducido (8000 frente a 50257). No se han publicado evaluaciones que permitan comparar calidad de generacion con alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es solo para investigacion y no debe usarse como asistente fiable ni en produccion.
- Riesgo alto de alucinacion: la model card advierte de hechos incorrectos y continuaciones irrelevantes.
- Errores aritmeticos documentados: en versiones iniciales el modelo respondia cosas como "2-1=5"; la version v3 anade 6000 muestras de suma y resta, pero no hay evaluacion que confirme la correccion.
- Datos geograficos erroneos heredados del dataset original; v3 los filtra, pero el autor reconoce que pueden persistir.
- El tokenizador de 8000 tokens a veces elimina espacios entre palabras, produciendo concatenaciones como "منEXCoraseهستم".
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones largas o documentos.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Modelo unicamente en persa; no se ha evaluado su comportamiento en otros idiomas.
- La licencia MIT permite uso comercial, pero las advertencias del autor sobre fiabilidad desaconsejan cualquier despliegue productivo.
- El modelo se publico con fecha 2026-11-01 y cuenta con 93 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EXAiStudio/EX-AI-Corase-14M
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
