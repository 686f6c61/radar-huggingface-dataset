# OpenAdapt/openadapt-veto-4b-r6

## Resumen

OpenAdapt-Veto-4B-r6 es un adaptador LoRA de 81 MB entrenado sobre el modelo multimodal Qwen/Qwen3.5-4B, desarrollado por OpenAdapt. Su funcion no es generar texto libre, sino actuar como un verificador visual estricto ("veto model") en flujos de automatizacion de interfaces graficas (GUI automation): recibe una captura de pantalla posterior a una accion y un resumen del estado esperado, y emite un unico veredicto calibrado entre tres posibles: PASS, VETO o ABSTAIN.

El modelo aborda un problema concreto de los agentes de computer-use: la verificacion fiable de que una accion ejecutada (rellenar un formulario, pulsar un boton, confirmar un envio) ha producido realmente el efecto esperado en pantalla. En lugar de delegar esta comprobacion en un LLM generativo, el adaptador utiliza decodificacion restringida a tres tokens en un solo paso, lo que reduce la latencia y evita respuestas ambiguas.

La relevancia actual del modelo radica en su rendimiento fuera de distribucion: con un reparto estricto sin solapamiento de aplicaciones entre entrenamiento y test (6 aplicaciones Ubuntu en entrenamiento, 4 no vistas en test: GIMP, LibreOffice Calc, Thunderbird y VLC), alcanza un AUROC de 0,7905 frente a 0,6272 de la version anterior, y reduce la tasa de falsos positivos del 37,9 % al 6,9 %. El adaptador se distribuye bajo licencia Apache-2.0 y esta pensado para integrarse como guardia previo a la aceptacion de acciones en pipelines de automatizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, lora_alpha=32) sobre transformer multimodal Qwen3.5-4B (image-text-to-text) |
| Parametros totales | No disponible (adaptador de 81 MB; el modelo base Qwen3.5-4B no detalla parametros en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes, double quant, compute en bfloat16); el adaptador en si se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text. La tarea se formula como una clasificacion de tres clases (PASS, VETO, ABSTAIN) mediante decodificacion restringida: se calculan los logits del ultimo token para los tres identificadores de etiqueta y se normaliza con softmax, sin generacion autoregresiva completa. El prompt de sistema fuerza al modelo a no adivinar PASS en caso de incertidumbre y a responder ABSTAIN cuando la region objetivo esta ocluida o es ambigua.

El entrenamiento se realizo con QLoRA (cuantizacion 4-bit NF4 del modelo base) sobre un conjunto de 440 muestras correspondientes a 6 aplicaciones de escritorio de Ubuntu. La evaluacion se hizo sobre un split OOD estricto de 160 muestras con 4 aplicaciones nunca vistas (GIMP, LibreOffice Calc, Thunderbird y VLC), sin solapamiento con el conjunto de entrenamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Verificacion visual de estado posterior a una accion en interfaces graficas: compara la captura con el resumen de estado esperado (campos, valores, errores ARIA).
- Emision de veredicto calibrado en tres clases (PASS, VETO, ABSTAIN) con probabilidades asociadas.
- Deteccion de errores de validacion visibles, valores de campo incorrectos, estados inesperados y reinicios de sesion.
- Abstención explicita ante occlusion o ambiguedad de la region objetivo, permitiendo escalado a revision humana.
- Entrada multimodal: imagen (captura de pantalla) mas texto estructurado (resumen DOM/ARIA en JSON).
- Decodificacion restringida de un solo paso (3 tokens candidatos), sin modo thinking (`enable_thinking=False`).
- No soporta tool calling, agentes multi-paso ni generacion de texto libre: su salida esta limitada a las tres etiquetas.

## Casos de uso

- Guardia de verificacion en agentes de computer-use: antes de aceptar una accion ejecutada por un agente (rellenar un formulario, confirmar un envio), el adaptador inspecciona la captura posterior y emite PASS o VETO, bloqueando acciones erroneas en pipelines automatizados.
- Automatizacion de escritorio en Ubuntu: verificacion de acciones en aplicaciones de escritorio (editores, hojas de calculo, clientes de correo) con una latencia mediana de 357 ms, adecuada para bucles de control interactivos.
- Rellenado de formularios con validacion visual: comprobacion de que los campos (por ejemplo, `record_id` o `amount`) muestran el valor esperado y que no hay mensajes de error ARIA visibles antes de confirmar el envio.
- Escalado a revision humana en operaciones irreversibles: ante ABSTAIN, el sistema detiene la accion y la deriva a un revisor, reduciendo el riesgo en escrituras irreversibles.
- Monitorizacion de regresiones en suites de pruebas de UI: uso del veredicto como asercion visual en tests end-to-end de aplicaciones de escritorio.
- Deteccion de reinicios de sesion o estados inesperados: el modelo identifica pantallas de sesion reiniciada o estados inconsistentes que indican fallo de la accion previa.
- Despliegue en hardware modesto: con 3,15 GB de VRAM en 4-bit NF4, puede ejecutarse en GPUs de consumo junto al agente que controla la interfaz.

## Benchmarks y rendimiento

Evaluacion OOD con split estricto sin solapamiento de aplicaciones (4 aplicaciones no vistas: GIMP, LibreOffice Calc, Thunderbird y VLC; N = 160):

| Metrica (OOD, N = 160) | Baseline (r5) | OpenAdapt-Veto-4B-r6 |
|---|---:|---:|
| AUROC OOD | 0,6272 | 0,7905 (DeLong p = 0,0051) |
| Tasa de falsos positivos OOD (z-score al inicio de sesion) | 37,9 % | 6,9 % |
| Utilidad benigna (acciones limpias aceptadas) | 62,1 % | 93,1 % |
| Latencia mediana (decodificacion restringida de 3 tokens) | No disponible | 357 ms |
| Memoria GPU (4-bit NF4) | 3,13 GB | 3,15 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,15 GB con cuantizacion 4-bit NF4 (double quant) del modelo base mas el adaptador de 81 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo base es de 4B, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter (A100, H100) sin problemas.
- Cabe en GPU de consumo: si, con cuantizacion 4-bit NF4; en precision completa (bfloat16) el modelo base requiere aproximadamente 8 GB de VRAM.
- Opciones de despliegue: transformers con bitsandbytes y PEFT (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia: 357 ms de mediana para la decodificacion restringida de 3 tokens. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAdapt-Veto-4B-r6 | Adaptador LoRA sobre Qwen3.5-4B | No disponible | Verificacion visual GUI (3 clases) | Apache-2.0 | Hugging Face |
| OpenAdapt-Veto-4B-r5 (baseline) | Adaptador LoRA sobre Qwen3.5-4B | No disponible | Verificacion visual GUI (3 clases) | No disponible | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | 4B (segun denominacion) | No disponible | Modelo multimodal generalista | No disponible en la informacion | Hugging Face |

No se dispone de datos de otros verificadores visuales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No detecta rollbacks silenciosos de backend que muestren una pantalla de confirmacion identica; debe combinarse con comprobaciones de lectura en el sistema de registro para escrituras irreversibles.
- La calibracion en temas visuales completamente nuevos funciona mejor con normalizacion z-score al inicio de sesion sobre las primeras pantallas benignas.
- La salida esta restringida a tres etiquetas; no es un modelo generativo ni soporta tool calling.
- Riesgo de alucinacion acotado por la decodificacion restringida, pero el veredicto PASS puede ser incorrecto si la region objetivo esta ocluida y el modelo no emite ABSTAIN.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B puede tener condiciones propias que deben verificarse por separado.
- En produccion, ante ABSTAIN el sistema debe detener la accion y escalar a revision humana, no aceptar la accion por defecto.

## Enlaces

- Hugging Face: https://huggingface.co/OpenAdapt/openadapt-veto-4b-r6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Web: https://openadapt.ai
- GitHub: https://github.com/OpenAdaptAI/OpenAdapt
