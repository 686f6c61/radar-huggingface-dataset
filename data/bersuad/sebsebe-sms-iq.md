# bersuad/sebsebe-sms-iq

## Resumen

Sebsebe SMS IQ es un ajuste fino (LoRA SFT) del modelo SmolLM2-135M-Instruct de Hugging Face, desarrollado por el usuario bersuad. Su propósito es muy concreto: extraer información estructurada (importes, cuenta origen, propietario) de mensajes SMS bancarios y de Telebirr sanitizados, típicos del contexto etíope, y empaquetar el resultado en un GGUF de aproximadamente 100 MB para inferencia en dispositivo. No es un modelo de propósito general, sino un componente auxiliar opcional dentro de la aplicación Sebsebe Message Review, cuyo flujo principal de sincronización sigue basándose en expresiones regulares.

El modelo parte de una arquitectura transformer densa de 135 millones de parámetros (134.515.008 según los pesos en safetensors) y se distribuye principalmente en formato GGUF cuantizado Q4_K_M. La relevancia actual radica en su enfoque de despliegue extremo: un modelo de extracción de información que cabe en un móvil, se descarga bajo demanda y se ejecuta con llama.cpp sin depender de la nube, lo que reduce costes y mejora la privacidad en el tratamiento de datos financieros sensibles.

La model card es explícita sobre el alcance: el pipeline anterior comprimía un Llama 3.2 1B con Importance Quantization, pero eso no enseñaba al modelo a extraer SMS. La versión actual entrena con LoRA sobre un conjunto de calibración sanitizado y luego cuantiza, lo que constituye un cambio metodológico relevante para quien quiera replicar el proceso con otros dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (principal); IQ3_M e Importance Quantization como opcion legacy |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; la model card indica que el fine-tuning no elimina la licencia base (SmolLM2, Apache 2.0) |
| Formato de pesos | GGUF (Q4_K_M, ~105 MB); safetensors para los pesos base/merged |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 135M parámetros heredado de SmolLM2-135M-Instruct. Sobre esa base se aplica un ajuste fino supervisado con LoRA (SFT) usando un dataset construido a partir de `calib/sms_calib.txt`, un fichero de SMS sanitizados emparejados con JSON objetivo. El pipeline documentado es: `build_sft_dataset.py` genera `data/sft_sms.jsonl` y su split de validación, `train_lora.py` entrena el adaptador (MPS en Apple Silicon, CUDA si está disponible, CPU en último caso), `smoke_eval.py` valida que los campos extraídos (importes, fuente, cuenta propietaria) coinciden con `eval/expected.json`, y finalmente `merge_lora.py` + `export_gguf.sh` producen el GGUF Q4_K_M.

No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la recomendación de ampliar `calib/sms_calib.txt` a 80-100+ pares sanitizados antes de un entrenamiento serio. Tampoco se indica si hubo RLHF o DPO; el proceso descrito es exclusivamente SFT con LoRA. La innovación técnica destacable no está en la arquitectura sino en el flujo de compresión: se abandona la cuantización por importancia como técnica principal (heredada de un pipeline anterior con Llama 3.2 1B) y se apuesta por entrenar primero y cuantizar después, reservando IQ para experimentos con bases mayores (360M / 1.7B).

## Capacidades

- Extracción de información estructurada de SMS bancarios y de Telebirr: importes, cuenta origen y propietario de la cuenta, en formato JSON.
- Generación de texto conversacional básica, heredada de SmolLM2-135M-Instruct.
- Ejecución en dispositivo mediante llama.cpp (formato GGUF), sin necesidad de GPU dedicada.
- Integración como asistente opcional en la app Sebsebe (`ON_DEVICE_MODEL`), con descarga bajo demanda del GGUF.
- Soporte de cuantización agresiva (Q4_K_M, IQ3_M) para reducir el tamaño del artefacto a ~100 MB.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Revisión de SMS bancarios en el móvil: el modelo procesa mensajes de Telebirr y bancos etíopes para extraer importe, cuenta origen y propietario, alimentando la pantalla de Review de la app Sebsebe sin enviar datos a la nube.
- Asistente de conciliación de gastos personales: a partir del JSON extraído de cada SMS, la app puede categorizar y sumar transacciones localmente, con el modelo como capa de parsing tolerante a variaciones de formato.
- Procesamiento offline en dispositivos de gama baja: al ocupar ~105 MB en Q4_K_M y ejecutarse con llama.cpp, cabe en móviles sin acelerador dedicado y funciona sin conectividad.
- Filtrado previo en pipelines regex-first: el modelo actúa como segundo paso opcional cuando la regex no logra extraer campos, reduciendo falsos negativos sin sustituir el flujo principal.
- Privacidad en datos financieros: al ser on-device, los SMS con números de cuenta y teléfonos no salen del dispositivo, lo que simplifica el cumplimiento de requisitos de protección de datos.
- Replicación del pipeline en otros dominios de SMS: el proyecto documenta scripts (`build_sft_dataset.py`, `train_lora.py`, `merge_lora.py`, `export_gguf.sh`) reutilizables para entrenar extractores similares sobre otras plantillas de mensajes sanitizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un `smoke_eval.py` con un conjunto de prompts y `eval/expected.json` para validar que los campos extraídos coinciden, sin métricas agregadas (precisión, recall, F1) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (~105 MB de pesos más overhead de contexto y KV cache); en CPU es viable sin GPU.
- GPU recomendadas: no se especifican; el proyecto está pensado para ejecución en dispositivo (móvil) o en CPU. Cualquier GPU consumer moderna (RTX 3060 en adelante) sobra para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM; también en Apple Silicon vía MPS para el entrenamiento del adaptador.
- Opciones de despliegue: llama.cpp (flujo documentado, `llama-cli` para evaluación), GGUF compatible con Ollama y otros runners de llama.cpp; el entrenamiento usa PyTorch con MPS/CUDA/CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sebsebe SMS IQ | 134.515.008 | no disponible | GGUF Q4_K_M | no disponible (base Apache 2.0) | Extracción de SMS bancarios on-device |
| SmolLM2-135M-Instruct | 135M | no disponible | safetensors, GGUF | Apache 2.0 | Modelo base instructivo de propósito general |
| Llama 3.2 1B Instruct | 1B | no disponible | safetensors, GGUF | Llama 3.2 Community License | Modelo pequeño de propósito general (usado en el pipeline anterior del proyecto) |

La comparación con SmolLM2-135M-Instruct es directa: Sebsebe SMS IQ es un fine-tuning del mismo, por lo que comparte tamaño y arquitectura pero añade especialización en extracción de SMS a costa de capacidades generales. Frente a Llama 3.2 1B, el modelo es aproximadamente 7 veces menor, lo que explica la decisión del proyecto de pasar de comprimir un 1B a entrenar un 135M específico.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del dominio de SMS bancarios y Telebirr es presumiblemente muy limitado, aunque no se han publicado evaluaciones al respecto.
- Dataset de entrenamiento reducido: la model card recomienda ampliar `calib/sms_calib.txt` a 80-100+ pares; con menos datos el ajuste puede ser insuficiente o sobreajustado a las plantillas vistas.
- Riesgo de alucinación en campos numéricos: al extraer importes y números de cuenta, un error silencioso puede propagarse a la contabilidad del usuario; el `smoke_eval.py` mitiga pero no elimina este riesgo.
- Licencia no declarada en el repositorio de Hugging Face: aunque la base es Apache 2.0, conviene verificar los términos antes de uso comercial.
- Idiomas soportados no documentados: el modelo está entrenado sobre SMS etíopes (amárico y posiblemente inglés), sin garantías para otras lenguas.
- Longitud de contexto no disponible: no se especifica la ventana máxima, lo que limita la planificación de conversaciones multi-turno.
- Dependencia de sanitización: el proyecto advierte explícitamente de no subir SMS reales, teléfonos ni números de cuenta completos; un fallo en este paso compromete la privacidad.
- El flujo principal de la app sigue siendo regex-first; el modelo es un asistente opcional, no un sustituto del parsing determinista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bersuad/sebsebe-sms-iq
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- llama.cpp (usado para exportar y ejecutar el GGUF): https://github.com/ggerganov/llama.cpp
