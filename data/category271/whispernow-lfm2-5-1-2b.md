# category271/whispernow-lfm2.5-1.2b

## Resumen

WhisperNow LFM2.5 1.2B es un ajuste fino completo (full fine-tune) del modelo base LiquidAI/LFM2.5-1.2B-Base, desarrollado por el usuario category271 para la etapa local de limpieza de transcripciones de WhisperNow, una aplicacion de escritorio de dictado. El modelo no transcribe audio: recibe una transcripcion ASR en bruto y la reescribe eliminando muletillas, falsos comienzos y repeticiones, aplicando las autocorrecciones del hablante y normalizando el formato (listas, cifras, puntuacion).

Con 1.170.340.608 parametros reales en safetensors, es la variante mas pequena y rapida de la familia de modelos de limpieza de WhisperNow, pensada para ejecutarse en local junto a la aplicacion de dictado sin depender de servicios en la nube. El modelo esta publicado bajo la licencia lfm1.0 (etiquetada como "other" en Hugging Face), solo soporta ingles y se distribuye en safetensors y GGUF, con plantilla de chat propia incluida.

Su relevancia practica esta en el nicho: sustituye una llamada a un modelo cloud por inferencia local con requisitos de memoria muy bajos (1,6 GB en uso con cuantizacion Q8_0) y latencias del orden de decimas de segundo en GPU para 100 palabras. La model card reporta que comete 1,70 veces mas errores factuales que glm-5.3-flash en razonamiento bajo sobre el conjunto de test y ambos benchmarks, pero que en dictados de hasta 25 palabras queda por debajo de ese modelo cloud y a la altura de glm-5.3 en razonamiento maximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LFM2.5 1.2B; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; los ejemplos de despliegue usan `-c 8192` en llama.cpp |
| Tipos de cuantizacion | GGUF Q8_0 (fichero de 1,25 GB); pesos safetensors en bfloat16 |
| Idiomas soportados | ingles (en) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del base LiquidAI/LFM2.5-1.2B-Base. La informacion disponible no detalla la arquitectura interna del base (tipo de transformer, atencion, capas), por lo que no se puede confirmar mas alla de que se carga con `AutoModelForCausalLM` de Transformers y que el repositorio incluye una plantilla de chat (`chat_template.jinja`) replicada tambien dentro del fichero GGUF.

El entrenamiento se realizo sobre el dataset `category271/whispernow-cleanup`, que codifica las reglas de limpieza que WhisperNow envia a modelos cloud. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion se hace sobre tres conjuntos: `test` (3.297 filas reservadas del dataset de entrenamiento, de 1 a ~1.000 palabras), `bench-long` (416 dictados de 151-946 palabras, 49 de ellos turnos reales de reunion del corpus AMI) y `bench-noise` (461 dictados de 20-64 palabras con un tipo de disfluencia cada uno).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas y tics verbales ("um", "like", "you know", "so" al inicio de frase), tartamudeos, palabras repetidas y falsos comienzos.
- Aplicacion de autocorrecciones: cuando el hablante se corrige de forma clara, conserva solo la version corregida y elimina la marca de correccion ("no wait", "scratch that").
- Correccion gramatical, ortografica, de puntuacion y mayusculas, preservando las palabras, el tono, las cautelas ("maybe", "I think") y las razones ("because ...") del hablante.
- Formateo estructural: convierte listas de la compra, tareas pendientes, pasos, recetas y notas de reunion en listas; mensajes, historias y explicaciones se mantienen como frases. No usa negrita, cursiva, encabezados ni guiones largos.
- Normalizacion numerica: escribe cantidades, recuentos, fechas, horas y porcentajes en digitos; convierte puntuacion y simbolos dictados ("dash dash help") en su forma real; conserva codigo, rutas y URLs tal cual se dictaron.
- Tratamiento de preguntas y ordenes: una pregunta o mandato presente en la transcripcion se limpia y se devuelve como texto, nunca se responde ni se ejecuta.
- Deteccion de transcripcion vacia: si no hay palabras dictadas (solo muletillas o ruido), devuelve `EMPTY`.
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible; es un modelo de texto especializado en una unica tarea.

## Casos de uso

- Dictado de escritorio con WhisperNow: el modelo actua como paso local de limpieza tras el ASR, sustituyendo la llamada a un modelo cloud por inferencia en la propia maquina con 1,6 GB de memoria en Q8_0, lo que permite dictar sin conexion y sin coste por token.
- Notas de reunion: sobre turnos reales del corpus AMI incluidos en `bench-long`, limpia transcripciones de 151-946 palabras y las estructura como notas legibles, eliminando repeticiones y autocorrecciones típicas del habla espontanea.
- Listas de la compra y tareas: convierte dictados como "for the farm run tomorrow we're picking up fence posts feed for the chickens and uh that new hose nozzle" en listas con vinetas, manteniendo las peticiones adicionales del hablante intactas.
- Mensajes y correos dictados: limpia el texto conservando el tono y las cautelas del hablante, util para enviar mensajes rapidos desde el movil o el escritorio sin reescribir manualmente.
- Recetas y procedimientos tecnicos: aplica las autocorrecciones del hablante (por ejemplo "three days no actually five days", "ph should be around 11 no wait 12.5") y normaliza cifras y unidades, adecuado para documentar procesos paso a paso.
- Transcripcion de reuniones y entrevistas largas en GPU consumer: con latencias de 0,18 s por 100 palabras en GPU y 2,0 s por 1.000 palabras, puede procesar transcripciones extensas en un portatil con GPU discreta o incluso en CPU (2,3 s por 100 palabras).
- Preprocesado de datasets ASR: al ser un modelo pequeno y determinista (decodificacion greedy), sirve para normalizar grandes volumenes de transcripciones antes de alimentar pipelines de NLP posteriores.

## Benchmarks y rendimiento

Resultados reportados en la model card (errores factuales por 1.000 palabras y latencias sobre el test split y ambos benchmarks):

| Modelo | Fichero Q8_0 | Memoria en uso | Errores factuales / 1.000 palabras | 100 / 1.000 palabras, GPU | 100 / 1.000 palabras, CPU |
|---|---|---|---|---|---|
| LFM2.5 1.2B (este modelo) | 1,25 GB | 1,6 GB | 6,32 | 0,18 / 2,0 s | 2,3 / 27 s |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 | 0,34 / 3,8 s | 5,4 / 65 s |
| Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 | 0,62 / 7,2 s | 8,9 / 118 s |

Comparacion con modelo cloud: sobre el test split y ambos benchmarks, este modelo comete 1,70 veces mas errores factuales que glm-5.3-flash en razonamiento bajo (intervalo del 90%: 1,59-1,82). En dictados de hasta 25 palabras comete menos errores que glm-5.3-flash y queda a la altura de glm-5.3 en razonamiento maximo. Los benchmarks MMLU, HumanEval o GSM8K no se reportan en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 1,6 GB de memoria en uso con cuantizacion Q8_0 (fichero de 1,25 GB); en bfloat16 con safetensors el peso ronda los 2,3 GB mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre; el modelo esta pensado para ejecucion local en portatiles con GPU discreta o integrada moderna.
- Cabe en GPU consumer: si, con margen amplio; las latencias reportadas (0,18 s por 100 palabras y 2,0 s por 1.000 palabras en GPU) corresponden a hardware consumer segun la model card.
- Opciones de despliegue: llama.cpp (`llama-server -hf category271/whispernow-lfm2.5-1.2b:Q8_0 --jinja -c 8192`), Transformers con `AutoModelForCausalLM` en bfloat16 y `device_map="auto"`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: en CPU, 2,3 s por 100 palabras y 27 s por 1.000 palabras; en GPU, 0,18 s por 100 palabras y 2,0 s por 1.000 palabras. Configuracion de referencia: decodificacion greedy (temperatura 0), repeat penalty 1,05 sobre todo el prompt y la respuesta (`repeat_last_n` 4096 en llama.cpp) y limite de respuesta de 2,5 tokens por palabra de transcripcion, con un minimo de 64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Errores factuales / 1.000 palabras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperNow LFM2.5 1.2B | 1,17 B | no disponible (ejemplos con 8192) | 6,32 | lfm1.0 | Hugging Face, safetensors + GGUF |
| WhisperNow LFM2.5 2.6B | no disponible (nombre indica 2,6 B) | no disponible | 4,88 | no disponible | Hugging Face |
| WhisperNow Qwen3.5 4B | no disponible (nombre indica 4 B) | no disponible | 3,01 | no disponible | Hugging Face |
| glm-5.3-flash (cloud, razonamiento bajo) | no disponible | no disponible | ~3,72 (1,70 veces menos que este modelo) | no disponible | servicio cloud |

La familia WhisperNow ofrece tres tamanos con el mismo proposito: el 1.2B es el mas rapido y ligero, con mas errores factuales; el 2.6B y el Qwen3.5 4B reducen errores a costa de mas memoria, latencia y tamano de fichero.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado para otros idiomas.
- Esta especializado en limpieza de transcripciones: no es un modelo generalista de razonamiento, codigo o matematicas, y su uso fuera de esa tarea no esta validado.
- Tasa de errores factuales de 6,32 por 1.000 palabras en el conjunto de evaluacion, superior a la de los modelos mayores de la familia y a glm-5.3-flash en razonamiento bajo; en dictados muy cortos (hasta 25 palabras) el comportamiento es mejor.
- Riesgo de alucinacion o de reescritura excesiva: al ser un modelo generativo de reescritura, puede alterar contenido dictado si la transcripcion es ambigua; la model card no documenta mitigaciones especificas mas alla de las reglas de limpieza.
- Requiere seguir estrictamente el protocolo de uso (transcripcion recortada como unico turno de usuario, sin system prompt, decodificacion greedy, repeat penalty 1,05, limite de 2,5 tokens por palabra) para reproducir los resultados reportados.
- Licencia lfm1.0 (etiquetada como "other"): deben revisarse los terminos del fichero LICENSE del repositorio antes de uso comercial; la informacion disponible no detalla las restricciones concretas.
- No se documentan sesgos conocidos, politicas de seguridad ni evaluaciones de robustez frente a entradas adversariales.
- El contexto maximo no esta especificado como spec oficial; el ejemplo de llama.cpp usa 8192 tokens, pero no se garantiza ese limite como valor de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Reglas de limpieza del dataset: https://huggingface.co/datasets/category271/whispernow-cleanup#the-cleanup-rules
- Variante LFM2.5 2.6B: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Variante Qwen3.5 4B: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Aplicacion WhisperNow: https://github.com/stephan271c/WhisperNow
