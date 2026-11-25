# naiiaiai/chatbot-kesehatan-qwen2.5-0.5b

## Resumen

`naiiaiai/chatbot-kesehatan-qwen2.5-0.5b` es un modelo de generacion de texto en indonesio, obtenido por ajuste fino mediante LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct` y posterior fusion de los pesos. Lo desarrolla el usuario naiiaiai como proyecto academico de tipo capstone, con un alcance deliberadamente estrecho: explicar "tarjetas de resultado" estructuradas con estimaciones de riesgo de hipertension, diabetes e hipercolesterolemia procedentes de clasificadores tabulares. El modelo no calcula el riesgo, solo interpreta en lenguaje natural las cifras que recibe y aplica reglas de seguridad estrictas.

La relevancia es acotada pero clara: demuestra que un transformer de 0,49 mil millones de parametros puede especializarse, mediante destilacion de conocimiento desde un profesor mayor (Qwen2.5-14B-Instruct-AWQ) y filtrado por reglas, en una tarea conversacional con restricciones fuertes de seguridad, hasta el punto de desplegarse en hardware de muy baja gama (el autor incluye un build GGUF Q4_K_M orientado a Raspberry Pi). El contexto, la arquitectura y el resto de especificaciones heredan las del modelo base Qwen2.5-0.5B-Instruct.

No es un asistente medico general: es un componente de explicacion de resultados con formato de entrada fijo, sistema de rechazo de peticiones inseguras y aviso explicito de que no constituye consejo medico. Cualquier uso fuera de ese perimetro queda fuera del diseno del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), pesos fusionados tras LoRA |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido en el repositorio; safetensors en precision original |
| Idiomas soportados | indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M), adaptador LoRA separado en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros. Sobre esa base se aplico un ajuste LoRA cuyo objetivo era aprender un comportamiento muy concreto: dado un mensaje de usuario con el formato `KARTU HASIL:\n<texto de la tarjeta>\n\nPERTANYAAN: <pregunta>` y un system prompt fijo en indonesio, generar una explicacion que use exclusivamente los numeros presentes en la tarjeta, indique el nivel de riesgo con palabras, incluya el descargo de responsabilidad, no mencione nombres de farmacos ni dosis y rechace peticiones fuera de alcance. Los pesos LoRA se fusionaron en el modelo final, y el adaptador se conserva por separado en el subdirectorio `adapter/`.

El entrenamiento combina destilacion de conocimiento desde un profesor de mayor tamano (Qwen2.5-14B-Instruct-AWQ) con filtrado basado en reglas de las respuestas generadas. Segun la model card, las respuestas no fueron revisadas por clinicos. La perdida de validacion reportada es 0,3091. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. Las cifras de riesgo que aparecen en las tarjetas provienen de clasificadores tabulares entrenados con adultos de NHANES 2017-marzo 2020 (poblacion estadounidense), lo que conviene tener en cuenta respecto al dominio de los datos.

## Capacidades

- Generacion de texto conversacional en indonesio, limitada a la explicacion de tarjetas de resultado estructuradas.
- Interpretacion de cifras de riesgo de hipertension, diabetes e hipercolesterolemia presentes en la tarjeta, sin recalcularlas.
- Aplicacion de reglas de seguridad: descargo de responsabilidad obligatorio, prohibicion de nombres de farmacos y dosis, rechazo de peticiones de diagnostico.
- Rechazo de peticiones fuera de tema y de intentos de modificar los numeros de la tarjeta.
- Formato de entrada estricto con system prompt y plantilla de chat de Qwen2.5.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido segun la informacion disponible.
- Multilingue: no; el modelo esta entrenado y evaluado unicamente en indonesio.

## Casos de uso

- Explicacion de resultados en una aplicacion de cribado poblacional: tras ejecutar un clasificador tabular de riesgo cardiovascular, el modelo recibe la tarjeta generada y produce una respuesta en indonesio que el paciente puede leer, con el descargo de responsabilidad incluido.
- Componente de segunda capa en un pipeline de triaje: el clasificador calcula el riesgo numerico y este modelo se limita a verbalizarlo, evitando que el LLM introduzca cifras propias.
- Despliegue en dispositivos de bajos recursos: el build GGUF Q4_K_M y el tamano de 0,49 mil millones de parametros permiten ejecucion en Raspberry Pi o en entornos sin GPU, util para pilotos de campo con conectividad limitada.
- Prototipado academico de salvaguardas en LLM sanitarios: sirve como caso de estudio de como un modelo pequeno puede aprender a rechazar peticiones inseguras mediante destilacion y filtrado por reglas.
- Generacion de respuestas consistentes en un chatbot de atencion primaria: la plantilla fija de entrada y el system prompt permiten integrarlo en un backend que garantice el formato de la tarjeta antes de invocar al modelo.
- Evaluacion de tecnicas de LoRA y fusion de pesos: el repositorio incluye tanto el adaptador como el modelo fusionado, lo que facilita reproducir el proceso y comparar el comportamiento antes y despues de la fusion.
- Base para experimentos de destilacion desde profesores mayores: el par profesor (14B) y alumno (0,5B) documentado en la model card sirve como referencia metodologica para tareas de dominio muy restringido.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de validacion sobre 150 pacientes retenidos, con decodificacion greedy y un validador basado en reglas que comprueba formato y seguridad (no correccion medica):

| Metrica | Qwen2.5-0.5B-Instruct zero-shot | Este modelo |
|---|---|---|
| Todas las comprobaciones superadas | 0,0 % | 98,7 % |
| Perdida de validacion | no disponible | 0,3091 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El validador no verifica la correccion clinica de las respuestas, solo el cumplimiento de reglas de formato y seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): aproximadamente 1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada con cuantizacion Q4_K_M: del orden de 300-400 MB para los pesos, apto para CPU y dispositivos embebidos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), llama.cpp y Ollama mediante el GGUF Q4_K_M incluido, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor orienta el build GGUF a Raspberry Pi, lo que sugiere viabilidad en CPU de baja potencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| naiiaiai/chatbot-kesehatan-qwen2.5-0.5b | 494 M | no disponible | Apache 2.0 | Explicador de tarjetas de salud en indonesio | Hugging Face, safetensors + GGUF + LoRA |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en la informacion proporcionada | Apache 2.0 | Asistente generalista multilingue | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en la informacion proporcionada | Apache 2.0 | Asistente generalista multilingue, mayor capacidad | Hugging Face |

Frente al modelo base, la diferencia medible es el cumplimiento de reglas en la tarea especifica (0,0 % frente a 98,7 % en el conjunto de validacion), a costa de perder generalidad y de quedar restringido al indonesio y a un formato de entrada fijo. No se dispone de datos para comparar con otros modelos especializados en salud en indonesio.

## Limitaciones y advertencias

- No es consejo medico: el propio autor lo declara proyecto academico y las respuestas no fueron revisadas por clinicos.
- Las cifras de riesgo provienen de clasificadores entrenados con adultos de NHANES 2017-marzo 2020, poblacion estadounidense; su traslado a poblacion indonesia no esta validado.
- El benchmark de 98,7 % mide cumplimiento de reglas de formato y seguridad, no correccion medica de las explicaciones.
- Riesgo de alucinacion: aunque el entrenamiento penaliza introducir cifras ajenas a la tarjeta, el modelo puede producir texto plausible fuera del formato esperado si se le interroga de otra manera.
- Dependencia estricta del formato de entrada y del system prompt de entrenamiento; desviarse de la plantilla degrada el comportamiento.
- Solo indonesio; no se ha entrenado ni evaluado en otros idiomas.
- Sesgos: no documentados en la informacion disponible; al derivar de un modelo generalista y de un profesor de mayor tamano, puede heredar sesgos de ambos.
- Licencia Apache 2.0 permite uso comercial, pero el propio contenido generado no debe presentarse como diagnostico ni sustituir la valoracion de un profesional sanitario.
- Para produccion sanitaria seria necesario validacion clinica independiente, trazabilidad de las cifras y supervision humana, ninguno de los cuales esta cubierto por este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naiiaiai/chatbot-kesehatan-qwen2.5-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor citado en la model card: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-AWQ
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
