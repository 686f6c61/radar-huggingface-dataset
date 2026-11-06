# open-sci/1.7b-MixtureVitae-100BT-longsft_16k

## Resumen

`open-sci/1.7b-MixtureVitae-100BT-longsft_16k` es un ajuste fino supervisado (SFT) del modelo base `ontocord/1.7b-MixtureVitae-100BT`, desarrollado por el colectivo open-sci. El modelo parte de una arquitectura transformer de tipo Llama con 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) y ha sido entrenado sobre un dataset denominado `long_sft` con una ventana de contexto extendida de 16.384 tokens, segun se desprende del sufijo `_16k` del identificador.

El objetivo del ajuste es adaptar el modelo base a tareas conversacionales de contexto largo, manteniendo el formato de chat (`conversational`) y el soporte de `custom_code` heredado del modelo original. El entrenamiento se realizo con LLaMA-Factory en modo `full` (todos los parametros actualizados), sobre 8 GPUs, con una tasa de aprendizaje de 2e-4, optimizador AdamW, scheduler coseno y una unica epoca.

La relevancia de este modelo radica en su caracter experimental y abierto: es un ejemplo de ajuste fino de contexto largo sobre un modelo pequeno (1,7B), lo que lo hace desplegable en hardware consumer. Sin embargo, la model card es practicamente un esqueleto autogenerado, sin informacion sobre datos de entrenamiento, evaluacion ni limitaciones, lo que exige precaucion en su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (derivado de ontocord/1.7b-MixtureVitae-100BT) |
| Parametros totales | 1.714.377.728 (aproximadamente 1,7B) |
| Parametros activos | no disponible (no es MoE, segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens (inferido del sufijo `_16k` y del nombre del dataset `long_sft`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar; consultar terminos del modelo base) |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |
| Tamano del repositorio | 3,4 GB |
| Pipeline | text-generation |
| Framework de entrenamiento | LLaMA-Factory (Transformers 4.51.3, PyTorch 2.7.0a0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (`full`) de un transformer decoder-only de 1,7B parametros. El modelo base, `ontocord/1.7b-MixtureVitae-100BT`, sugiere por su nombre un entrenamiento sobre una mezcla de datos ("MixtureVitae") de aproximadamente 100 mil millones de tokens, aunque no se dispone de detalles verificables sobre la composicion del corpus ni sobre si hubo fases de RLHF o DPO. El ajuste fino se realizo sobre el dataset `long_sft`, orientado a conversaciones de contexto largo, con una longitud de secuencia de 16.384 tokens.

Los hiperparametros de entrenamiento documentados son: learning rate 2e-4, batch total de 32 (batch por dispositivo 2, 8 dispositivos, acumulacion de gradiente 2), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 5 %, semilla 42 y 1 epoca. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos. El tag `custom_code` indica que el modelo requiere codigo personalizado para cargarse, probablemente por definiciones de arquitectura no estandar en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, en formato de chat (`conversational`).
- Procesamiento de contexto largo de hasta 16.384 tokens, adecuado para documentos extensos o historiales de conversacion largos.
- Generacion de texto general; no se documentan capacidades especificas de codigo, matematicas o razonamiento avanzado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Resumen de documentos largos: con 16.384 tokens de contexto, el modelo puede ingerir articulos, informes o transcripciones extensas y generar resumenes en una sola pasada, sin necesidad de chunking.
- Chat de atencion al cliente con historial largo: permite mantener conversaciones multi-turno con memoria de interacciones previas dentro de la misma sesion, gracias a la ventana extendida.
- Analisis de contratos o documentacion legal: adecuado para extraer clausulas o responder preguntas sobre documentos de decenas de paginas en un unico contexto.
- Prototipado de asistentes conversacionales en hardware consumer: su tamano de 1,7B permite ejecutarlo en GPUs de gama media, lo que lo hace util para pruebas de concepto y demos.
- Investigacion sobre ajuste fino de contexto largo: sirve como referencia reproducible (hiperparametros y framework documentados) para estudiar el efecto del SFT en ventanas de 16k sobre modelos pequenos.
- Generacion aumentada por recuperacion (RAG) con contexto extenso: puede concatenar varios fragmentos recuperados (hasta 16k tokens) y sintetizar una respuesta coherente.
- Filtrado y clasificacion de texto largo: util para tareas de etiquetado o moderacion sobre documentos completos sin truncamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara la entrada `long-context-mv100bt` pero con la lista de resultados vacia, y la seccion de resultados de entrenamiento esta en blanco.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,8-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF/AWQ, no publicados): aproximadamente 1-1,5 GB para pesos.
- Con contexto de 16k tokens, la cache KV incrementa notablemente el consumo de memoria; se recomienda al menos 8-12 GB de VRAM para secuencias largas en FP16.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia local; A100/H100 para entrenamiento o serving a gran escala.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en FP16 para contextos moderados, y en 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (requerido por `custom_code`), vLLM y TGI (si el codigo personalizado es compatible), llama.cpp/Ollama solo si se publican pesos GGUF (no disponibles).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-100BT-longsft_16k | 1,7B | 16k (inferido) | other | Hugging Face | SFT de contexto largo, model card incompleta |
| ontocord/1.7b-MixtureVitae-100BT (base) | 1,7B | no disponible | no disponible | Hugging Face | Modelo base sin ajuste conversacional de contexto largo |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Hugging Face | Alternativa madura con contexto mayor y licencia permisiva |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Llama 3.2 Community License | Hugging Face | Contexto muy superior y ecosistema amplio |

La comparativa se ofrece como referencia de categoria (modelos de aproximadamente 1-2B); no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card es un esqueleto autogenerado: no documenta datos de entrenamiento, evaluacion, sesgos ni limitaciones, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo elevado de alucinacion: no hay evidencia de fases de alineacion (RLHF/DPO) ni evaluaciones que lo mitiguen.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Licencia "other": es imprescindible revisar los terminos del modelo base y del propietario antes de cualquier uso comercial.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar codigo del repositorio.
- El contexto de 16k es una inferencia a partir del nombre; no esta confirmado en la documentacion oficial.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de bajos recursos.
- Modelo con 0 likes y 165 descargas: comunidad y validacion practicamente inexistentes; no recomendado para produccion sin evaluacion propia.
- Entrenado con una sola epoca y sin curva de evaluacion publicada; no se puede verificar la convergencia ni el sobreajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-100BT-longsft_16k
- Modelo base: https://huggingface.co/ontocord/1.7b-MixtureVitae-100BT
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Perfil del autor: https://huggingface.co/open-sci
