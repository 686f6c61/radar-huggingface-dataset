# kimrahui/parking-gemma-270m-v2-ko-onnx

## Resumen

parking-gemma-270m-v2-ko-onnx es un ajuste fino (LoRA) del modelo Gemma 3 270M (versión instruction-tuned de Google) especializado en una tarea muy concreta: extraer condiciones de búsqueda de aparcamiento en formato JSON a partir de preguntas de conductores en coreano. Ha sido desarrollado por el usuario kimrahui y publicado en Hugging Face en formato ONNX fp16, listo para ejecutarse en el navegador mediante transformers.js.

El problema que resuelve es la interpretación estructurada de consultas de voz o texto sobre aparcamientos: dado un enunciado en coreano del tipo "busco un parking cubierto cerca de X", el modelo devuelve un objeto JSON con los criterios de búsqueda extraídos. Es un caso típico de destilación de una tarea de NLU a un modelo diminuto que puede ejecutarse localmente sin servidor.

Su relevancia técnica principal reside en la optimización aplicada: el vocabulario original de 262.144 tokens se ha reducido a 50.874 tokens (manteniendo todos los tokens coreanos, los del dataset de entrenamiento, unos 40.000 tokens frecuentes de inglés, números y símbolos, más los 256 bytes), lo que reduce el tamaño del modelo de 570 MB a 299 MB sin pérdida de calidad medible en su evaluación. Con solo 270 millones de parámetros, es un candidato ideal para inferencia en cliente (navegador o dispositivos edge).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 text), ajustado con LoRA |
| Parametros totales | 270 millones (base: google/gemma-3-270m-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (ONNX) |
| Idiomas soportados | Coreano (ko), con tokens frecuentes de ingles, numeros y simbolos |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | ONNX (fp16), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M-it, la version instruction-tuned del modelo de texto mas pequeño de la familia Gemma 3, una arquitectura transformer decoder estandar. Sobre esta base se ha aplicado un ajuste eficiente mediante LoRA (Low-Rank Adaptation), tecnica que congela los pesos originales y entrena matrices de bajo rango, reduciendo drasticamente los recursos necesarios para el fine-tuning y el riesgo de olvido catastrofico.

La innovacion mas destacable no es arquitectonica sino de optimizacion del vocabulario: se ha podado el embedding de 262.144 tokens a 50.874, conservando todos los tokens coreanos, los tokens presentes en los datos de entrenamiento, unos 40.000 tokens frecuentes de ingles, cifras y simbolos, y los 256 tokens de bytes. Esta reduccion recorta el tamano de los ficheros de 570 MB a 299 MB. Segun el autor, en una evaluacion de 131 preguntas la diferencia maxima de puntuacion del primer token respecto al modelo original fue de 0, y las respuestas generadas coinciden incluso en los fallos, con un 67,2% de coincidencia completa en la extraccion JSON. No se han publicado detalles sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Extraccion estructurada de informacion: convierte preguntas en lenguaje natural (coreano) sobre aparkamiento en objetos JSON con los criterios de busqueda (tarea de NLU especializada, tipo slot filling).
- Generacion de texto conversacional en coreano heredada del modelo base, aunque el ajuste fino esta orientado a la tarea especifica.
- Ejecucion en navegador o en cliente gracias al formato ONNX y la libreria transformers.js, sin necesidad de backend.
- Huella de memoria reducida (299 MB) gracias a la poda del vocabulario, adecuada para dispositivos con recursos limitados.
- No esta orientado a razonamiento complejo, codigo, matematicas ni capacidades multimodales: su diseno es monolingüe en la practica y de dominio estrecho.

## Casos de uso

- Asistente de voz para buscar aparcamiento: integrado en una app movil o web, transcribe la pregunta del conductor ("necesito parking cubierto bajo techo cerca del centro") y el modelo la convierte en JSON que alimenta una API de busqueda de parkings.
- Interfaz conversacional en el navegador: al estar en ONNX para transformers.js, puede ejecutarse integramente en el cliente, sin enviar datos del usuario a un servidor, util para privacidad y para funcionar sin conexion.
- Preprocesamiento de consultas en un chatbot de movilidad urbana: actua como primer eslabon de un pipeline, extrayendo slots (zona, cubierto/aire libre, precio maximo, duracion) que un sistema posterior resuelve.
- Sistemas de IVR o atencion telefonica automatizada: dada su diminuta huella, puede desplegarse en hardware ligero para interpretar consultas de conductores en tiempo real.
- Prototipado rapido de NLU en coreano: sirve como plantilla de referencia para replicar el patron (base pequena + LoRA + poda de vocabulario + ONNX) en otros dominios o idiomas.
- Edge AI en dispositivos embebidos: con 299 MB de pesos fp16 y 270M de parametros, es viable en SBCs tipo Raspberry Pi o en unidades de automovil con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion referenciada por el autor es interna: 131 preguntas de prueba en las que el modelo podado coincide con el original en las respuestas generadas (diferencia maxima de 0 en la puntuacion del primer token) y obtiene un 67,2% de coincidencia completa en la extraccion JSON.

## Requisitos de hardware

- VRAM / memoria estimada: unos 300 MB para los pesos fp16 en ONNX, mas la sobrecarga del runtime; ejecutable en CPU y en GPU integrada via WebGPU con transformers.js.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con soporte WebGPU (o incluso solo CPU con WASM) es suficiente dada la escala del modelo. En servidor, cualquier GPU modesta sobra.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer actual (incluso integradas); la ejecucion principal prevista es en navegador, no en GPU de datacenter.
- Opciones de despliegue: transformers.js (uso previsto, en navegador), ONNX Runtime (Node.js, Python, movil), y en principio convertible a otros runtimes ONNX. No se ha publicado soporte nativo para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible; dada la escala (270M de parametros), se espera latencia baja incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma principal | Tarea | Licencia |
|---|---|---|---|---|---|
| kimrahui/parking-gemma-270m-v2-ko-onnx | 270M | ONNX fp16 | Coreano | Extraccion JSON de aparcamiento | Gemma |
| google/gemma-3-270m-it (base) | 270M | Safetensors | Multilingue (262k vocab) | Uso general instruction-tuned | Gemma |
| Qwen2.5-0.5B-Instruct | 500M | Safetensors / GGUF | Multilingue (fuerte en chino) | Uso general instruction-tuned | Apache 2.0 (parcial) |

Frente a su modelo base, esta variante sacrifica cobertura de vocabulario multilingue a cambio de un 48% menos de tamano y un comportamiento identico en su tarea objetivo. Frente a alternativas generales como Qwen2.5-0.5B-Instruct, es mucho mas limitado en alcance, pero mas ligero, especializado y ejecutable en navegador sin backend.

## Limitaciones y advertencias

- Dominio estrecho: el ajuste fino esta orientado exclusivamente a la extraccion de condiciones de aparcamiento en coreano; su rendimiento en otras tareas o idiomas no esta garantizado y probablemente se haya degradado respecto al modelo base.
- Idioma: optimizado para coreano; el soporte de otros idiomas se limita a tokens frecuentes de ingles, numeros y simbolos conservados en el vocabulario podado.
- Exactitud de la extraccion: el propio autor reporta solo un 67,2% de coincidencia completa en la evaluacion, por lo que conviene validar y manejar los errores del JSON en produccion.
- Licencia Gemma: su uso esta sujeto a los terminos de Google (https://ai.google.dev/gemma/terms), que imponen restricciones y una politica de uso aceptable; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinacion: al ser un modelo de extraccion estructurada, puede generar campos incorrectos o inventados si la entrada es ambigua; se recomienda validacion por esquema (JSON schema) en el pipeline.
- Sin benchmarks publicos: la calidad solo esta documentada mediante la evaluacion interna del autor (131 preguntas), sin comparacion con otros modelos.
- Datos de entrenamiento: no se ha publicado la composicion del dataset de fine-tuning, lo que dificulta evaluar sesgos potenciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimrahui/parking-gemma-270m-v2-ko-onnx
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
