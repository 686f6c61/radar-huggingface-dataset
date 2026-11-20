# interfaceinde/qwen35-4b-interface-classifier-GGUF

## Resumen

INTERFACE Qwen3.5 4B es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario interfaceinde, especializado en la clasificación estructurada de correos electrónicos en coreano. El modelo no es un asistente conversacional general: está entrenado para recibir una instrucción fija de clasificación más el texto de un correo y devolver un JSON con 20 campos definidos por un esquema. Se distribuye únicamente en formato GGUF, pensado para su uso con Ollama.

El ajuste se realizó mediante QLoRA en NF4 con precisión de cálculo BF16, un rango LoRA de 4 y alpha 8, lo que supone solo 458.752 parámetros entrenables sobre un modelo base de 4.326.350.848 parámetros totales. El entrenamiento usó 2.868 correos sintéticos de un total de 4.000, con parada temprana en el paso 650, y se publica el checkpoint 500 por ser el de mayor coincidencia en la validación de desarrollo. Los pesos LoRA se fusionaron con el modelo base BF16 y se convirtieron a GGUF con el conversor de llama.cpp `b10969`.

Su relevancia es acotada pero clara: demuestra un flujo completo de clasificación de correo con salida JSON validable por esquema, ejecutable en local con Ollama. Conviene subrayar que el autor advierte explícitamente que no sustituye a un modelo de conversación general, de redacción de borradores ni de OCR, y que es texto puro sin proyector de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); ajuste LoRA fusionado |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; se distribuye y documenta Q4_K_M (herramienta de cuantizacion llama.cpp `b12556`) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (se incluye la LICENSE original de Qwen3.5-4B) |
| Formato de pesos | GGUF (texto, sin proyector de imagen) |
| Parametros entrenables (LoRA) | 458.752 |
| Configuracion LoRA | QLoRA NF4, calculo BF16, rank 4, alpha 8 |
| Checkpoint publicado | 500 (de un total de 650 pasos ejecutados) |
| Tamano del repositorio | 2,8 GB |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en una revision fija del repositorio original (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y aplica un ajuste QLoRA: cuantizacion NF4 de los pesos base con calculo en BF16, rango LoRA 4, alpha 8 y 458.752 parametros entrenables. La configuracion de entrenamiento incluye 1 epoch planificado, microbatch 1, acumulacion de gradiente 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42. El conjunto de entrenamiento son 2.868 correos sinteticos, filtrados tras revision de un total de 4.000 del split de entrenamiento.

El entrenamiento se detuvo de forma temprana en el paso 650 tras tres evaluaciones consecutivas sin mejora; el checkpoint publicado, el 500, corresponde a 2.000 correos acumulados. Posteriormente se fusiono el adaptador LoRA sobre los pesos BF16 originales y se convirtio a GGUF con el conversor de llama.cpp `b10969`, alineado con la version de llama.cpp que fija Ollama 0.34.3; la cuantizacion Q4_K_M se hizo con la herramienta `b12556`. No se documentan innovaciones de inferencia como decodificacion especulativa ni atencion lineal. El autor no publica los datos de entrenamiento, los correos de validacion, las respuestas de referencia ni los estados del optimizador.

## Capacidades

- Clasificacion de correo en coreano con salida JSON de 20 campos, validable contra `response_schema.json`.
- Cumplimiento estricto de un formato de respuesta estructurado, con instruccion fija comun (`classifier_instruction.txt`) antepuesta al texto del correo.
- Generacion de texto condicionada a tarea de clasificacion; no es un modelo conversacional de proposito general.
- No soporta vision ni OCR: es un GGUF de texto sin proyector de imagen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Uso multilingue no soportado segun la model card: el unico idioma declarado es el coreano.
- Compatible con el endpoint de Ollama (`ollama run hf.co/...`) y con los parametros de inferencia recomendados: `think: false`, `stream: false`, `temperature: 0`, limite de salida 1024.

## Casos de uso

- Clasificacion y enrutado de correo entrante en coreano: el modelo recibe la instruccion fija y el cuerpo del correo y devuelve un JSON con 20 campos, entre ellos `routing`, que en la validacion de desarrollo alcanzo 408/500 aciertos (81,6 %). Es adecuado para triaje automatico previo a la intervencion humana.
- Extraccion de elementos de accion (`action_items`): aunque el rendimiento medido es bajo (37/500, 7,4 %), el campo existe en el esquema y puede usarse como primer filtro en un pipeline con revision posterior.
- Preprocesado para sistemas de gestion documental: la salida JSON estructurada permite indexar metadatos del correo en una base de datos o un CRM sin parseo de texto libre.
- Despliegue local y privado con Ollama: al ejecutarse con `ollama run hf.co/interfaceinde/qwen35-4b-interface-classifier-GGUF:Q4_K_M`, permite clasificar correo sin enviar contenido a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado de pipelines de clasificacion: sirve como referencia de integracion entre instruccion fija, esquema de respuesta y validacion JSON en aplicaciones locales.
- Evaluacion comparativa de ajustes LoRA pequenos: su configuracion (rank 4, 458.752 parametros entrenables) y su historial de entrenamiento documentado lo hacen util para estudiar el efecto del ajuste de bajo rango en tareas de clasificacion estructurada.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al checkpoint 500 nativo en NF4 QLoRA, **antes** de la conversion a GGUF; el autor advierte que no garantiza el mismo rendimiento tras convertir y recuantizar, y que no se ha ejecutado una reevaluacion completa de las 500 muestras sobre el GGUF ni una prueba independiente.

| Metrica | Resultado |
|---|---|
| Tamano de la validacion de desarrollo | 500 correos x 20 campos |
| Coincidencia estricta por campo | 9.288 / 10.000 (92,88 %) |
| Exito de parseo JSON | 500 / 500 (100 %) |
| Validacion de esquema | 498 / 500 (99,6 %) |
| Coincidencia de los 20 campos y esquema | 31 / 500 (6,2 %) |
| Campo `routing` | 408 / 500 (81,6 %) |
| Campo `action_items` | 37 / 500 (7,4 %) |

Sobre el GGUF ya convertido solo se verifico la carga real en Ollama 0.34.3 y la ejecucion de una unica muestra de la validacion de desarrollo: paso el parseo JSON y la comprobacion de esquema, con 19 de 20 campos coincidentes. El autor indica que esto confirma el funcionamiento local y de salida, pero no sustituye una evaluacion de calidad sobre las 500 muestras. La comparacion entre campos es estricta y de igual peso; diferencias de redaccion o de orden en arrays cuentan como discrepancia. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, un modelo de 4.326 millones de parametros en Q4_K_M ocupa del orden de 2,5-3 GB de pesos; el repositorio completo pesa 2,8 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM para el archivo cuantizado y el contexto.
- GPU de consumo: previsiblemente cabe en tarjetas con 6-8 GB o mas de VRAM en Q4_K_M, aunque el autor no publica requisitos ni pruebas de latencia.
- Opciones de despliegue: Ollama 0.34.3 (verificado por el autor), tanto con `ollama run hf.co/...` como registrando un modelo local con `ollama create ... -f Modelfile`. El formato GGUF es compatible con llama.cpp; no se documentan otras opciones (vLLM, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| interfaceinde/qwen35-4b-interface-classifier-GGUF | 4.326.350.848 | No disponible | Apache-2.0 | GGUF | Ajuste LoRA para clasificacion de correo en coreano con salida JSON de 20 campos |
| Qwen/Qwen3.5-4B (modelo base) | 4.326.350.848 | No disponible | Apache-2.0 | No disponible en la informacion | Modelo general; el ajuste parte de la revision `851bf6e8...` |
| Otros clasificadores de correo basados en Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo base ni de terceros que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de proposito especifico: el autor indica explicitamente que no sustituye a un modelo de conversacion general, de redaccion de borradores ni de OCR.
- Solo texto: es un GGUF sin proyector de imagen; no procesa imagenes ni documentos escaneados.
- Idioma unico: declarado solo para coreano; no se garantiza su funcionamiento en castellano ni en otros idiomas.
- Rendimiento desigual por campo: `routing` alcanza el 81,6 % de coincidencia, pero `action_items` solo el 7,4 %; la coincidencia completa de los 20 campos con esquema valido es del 6,2 % (31/500).
- La validacion se hizo sobre el checkpoint nativo NF4, no sobre el GGUF distribuido; no hay reevaluacion completa ni prueba independiente, y el conjunto de desarrollo se reutilizo repetidamente.
- Sensibilidad al formato de entrada: es necesario anteponer la instruccion completa de `classifier_instruction.txt` y respetar los parametros recomendados (`think: false`, `stream: false`, `temperature: 0`, limite de salida 1024); desviarse puede degradar la salida.
- Diferencias de redaccion o de orden en arrays se contabilizan como fallo en la comparacion estricta, lo que puede infravalorar la utilidad practica pero tambien ocultar errores reales.
- No se ha verificado la tasa de exito en tareas reales de negocio ni la calidad semantica de las respuestas de referencia.
- Riesgo de alucinacion en los campos generados: el modelo puede rellenar campos con contenido plausible pero incorrecto; se recomienda validacion de esquema y revision humana.
- Sesgos: no documentados por el autor; el entrenamiento usa correos sinteticos, lo que puede no reflejar la distribucion real de correo.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a las condiciones y avisos de la licencia original de Qwen3.5-4B incluida en el repositorio.
- Actualizaciones: subir una nueva version al repositorio no reemplaza automaticamente el modelo registrado en Ollama; hay que volver a hacer `ollama pull` o un procedimiento de actualizacion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Historial de entrenamiento: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/learning_history.md
- Registro de pasos del optimizador: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/training_history.csv
- Historial de validacion: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/validation_history.json
- Instruccion de clasificacion: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/classifier_instruction.txt
- Esquema de respuesta: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/response_schema.json
- Manifiesto de pesos y herramientas: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-GGUF/blob/main/manifest.json
