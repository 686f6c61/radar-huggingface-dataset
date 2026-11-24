# protocolsyncllc/medgap-gemma-4-12b

## Resumen

medgap-gemma-4-12b es un ajuste fino (fine-tune) del modelo google/gemma-4-12B-it publicado por protocolsyncllc, orientado a la generacion y el analisis de contenido relacionado con cartas de advertencia (warning letters) de la FDA sobre dispositivos medicos. El modelo parte de una base instructiva de 12.000 millones de parametros (11.959.730.224 segun los pesos en safetensors) y se ha entrenado con LoRA sobre un dataset propio de cartas de advertencia de la FDA, con el objetivo de especializar al modelo en el dominio regulatorio de dispositivos medicos.

El ajuste se realizo con Unsloth sobre 2 GPU RTX 3090 (48 GB de VRAM en total), con una sola epoca, rango LoRA de 64 y alpha de 16, y tasa de aprendizaje 2e-4. El autor distribuye tanto los pesos en formato safetensors como una version cuantizada GGUF en q8_0, lo que facilita el despliegue en entornos con recursos limitados.

Su relevancia radica en el nicho: los equipos de asuntos regulatorios y calidad en empresas de dispositivos medicos manejan grandes volumenes de correspondencia con la FDA, y un modelo especializado puede acelerar la revision, clasificacion y redaccion de respuestas. No obstante, la informacion publica disponible es muy escasa: no hay benchmarks, no se detalla el volumen del dataset y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base google/gemma-4-12B-it), ajuste fino con LoRA |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (publicada); safetensors en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso google/gemma-4-12B-it, una base instructiva de aproximadamente 12.000 millones de parametros. El ajuste se realizo con la libreria Unsloth mediante LoRA con r=64 y alpha=16, una sola epoca, tasa de aprendizaje 2e-4 y un dataset denominado medical-devices.jsonl, derivado del dataset protocolsyncllc/fda-warning-letters. El entrenamiento se ejecuto en 2 GPU RTX 3090 con 48 GB de VRAM en total.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. Tampoco se detalla si el ajuste modifica la ventana de contexto respecto al modelo base. La innovacion principal es la especializacion de dominio: el modelo aprende el registro, la estructura y la terminologia de las cartas de advertencia de la FDA para dispositivos medicos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base instructiva gemma-4-12B-it.
- Especializacion en el dominio de cartas de advertencia de la FDA y dispositivos medicos: redaccion, resumen y analisis de correspondencia regulatoria.
- Razonamiento y respuesta a instrucciones propias de un modelo instructivo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Revision de cartas de advertencia de la FDA: el modelo puede resumir y extraer los hallazgos clave de una carta recibida, ayudando al equipo regulatorio a priorizar acciones correctivas.
- Redaccion de respuestas regulatorias: generar borradores de respuestas formales a la FDA con el tono y la estructura habituales del sector, que luego un especialista revisa y valida.
- Clasificacion y triaje de correspondencia: procesar lotes de cartas y clasificarlas por tipo de deficiencia (etiquetado, control de calidad, reporte de eventos adversos) para enrutarlas al equipo adecuado.
- Formacion interna: crear materiales de entrenamiento para equipos de calidad y asuntos regulatorios a partir de casos reales anonimizados.
- Analisis de tendencias regulatorias: analizar un corpus de cartas para identificar patrones recurrentes en las observaciones de la FDA y anticipar riesgos en auditorias.
- Asistencia en documentacion de calidad: redactar secciones de procedimientos o informes internos alineados con la terminologia regulatoria de dispositivos medicos.
- Prototipado de asistentes internos: desplegar un chatbot de consulta sobre normativa y correspondencia FDA para equipos de compliance, usando la version GGUF q8_0 en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12.000 millones de parametros, en FP16 se requieren aproximadamente 24 GB de VRAM; en la cuantizacion GGUF q8_0 publicada, en torno a 13-14 GB; en cuantizaciones de 4 bits (no publicadas por el autor, pero generables) unos 7-8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 16 GB para q8_0.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 y en GPUs de 16 GB con q8_0; en 8 GB solo con cuantizaciones de 4 bits generadas por el usuario.
- Opciones de despliegue: llama.cpp u Ollama con el GGUF q8_0; vLLM o TGI con los pesos safetensors; el autor entreno con Unsloth, por lo que la exportacion a otros formatos es directa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgap-gemma-4-12b | 11,96 B | no disponible | Cartas FDA / dispositivos medicos | gemma | Hugging Face (safetensors + GGUF) |
| google/gemma-4-12B-it | 12 B (aprox.) | no disponible | Uso general instructivo | gemma | Hugging Face |
| Modelos medicos genericos de ~7-13 B | variable | variable | Dominio medico general | variable | Hugging Face |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; no se han publicado benchmarks que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre cartas de advertencia de la FDA, el modelo puede reproducir el sesgo y el tono adversarial propio de ese tipo de documentos.
- Riesgo de alucinacion: elevado en un dominio regulatorio donde citas normativas, plazos y referencias legales deben ser exactas; toda salida requiere revision humana.
- Limitaciones de idioma: solo declara soporte para ingles, lo que limita su uso en entornos hispanohablantes sin traduccion previa.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: la licencia gemma impone condiciones de uso (Gemma Terms of Use), incluidas obligaciones de atribucion y restricciones de uso comercial que deben revisarse antes de un despliegue en produccion.
- Caveat de produccion: el ajuste se realizo con una sola epoca y un dataset no documentado en volumen ni composicion; no hay evaluacion publicada de calidad, por lo que no debe usarse como fuente de verdad regulatoria sin validacion experta.
- El modelo no sustituye el asesoramiento legal o regulatorio profesional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protocolsyncllc/medgap-gemma-4-12b
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- GGUF q8_0: https://huggingface.co/protocolsyncllc/medgap-gemma-4-12b/blob/main/medgap-gemma-4-12b_q8_0.gguf
- Dataset: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- Unsloth: https://github.com/unslothai/unsloth
