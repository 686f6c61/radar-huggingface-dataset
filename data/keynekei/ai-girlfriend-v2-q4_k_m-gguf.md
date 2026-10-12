# Keynekei/ai-girlfriend-v2-Q4_K_M-GGUF

## Resumen

ai-girlfriend-v2-Q4_K_M-GGUF es una version cuantizada en formato GGUF del modelo conversacional `sercancelenk/ai-girlfriend-v2`, publicada por el usuario Keynekei. Se trata de un ajuste fino orientado a charla romantica y roleplay ("AI girlfriend") construido sobre una arquitectura de tipo Llama, con aproximadamente 8.030 millones de parametros. La cuantizacion Q4_K_M reduce el peso a 4,58 GiB (4.920.739.904 bytes), lo que lo hace ejecutable en GPU de consumo y en CPU mediante llama.cpp.

El problema que resuelve es acotado y de nicho: ofrecer un companero conversacional con tono afectivo en varios idiomas (turco, ingles, aleman, frances, espanol y arabe) sin depender de APIs propietarias. Su relevancia practica es limitada fuera del ambito de chatbots de roleplay y experiencias conversacionales personalizadas, donde el valor esta en el ajuste de estilo mas que en capacidades de razonamiento o codigo.

La ficha se centra en lo que se puede verificar desde la informacion disponible: procedencia del ajuste, formato de distribucion, licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp. No hay model card detallada del autor original ni datos de entrenamiento publicados en esta informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (familia inferida por la etiqueta `llama` y el conteo de parametros) |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de llama-server usa `-c 2048`, que es un parametro de ejecucion, no la ventana maxima del modelo) |
| Tipos de cuantizacion | Q4_K_M (esta version). Existen otras cuantizaciones del mismo base en `mradermacher/ai-girlfriend-v2-GGUF` |
| Idiomas soportados | Turco (tr), ingles (en), aleman (de), frances (fr), espanol (es), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ai-girlfriend-v2-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base `sercancelenk/ai-girlfriend-v2` es un ajuste fino sobre un modelo de la familia Llama (~8B parametros), segun se deduce de la etiqueta `llama` y del conteo real de parametros en safetensors. Esta ficha describe concretamente la conversion a GGUF realizada por Keynekei mediante el espacio `gguf-my-repo` de ggml.ai y la herramienta llama.cpp. No se especifica en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT con preferencias.

La unica transformacion documentada es la cuantizacion a Q4_K_M, un esquema de 4 bits con escalas mixtas que mantiene buena parte de la calidad del modelo original reduciendo el peso a 4,58 GiB. La metodologia de entrenamiento del ajuste (datos de roleplay, tono afectivo, corpus multilingue) queda fuera del alcance de esta informacion y deberia consultarse en la model card del base `sercancelenk/ai-girlfriend-v2`, no incluida aqui.

## Capacidades

- Generacion de texto conversacional con tono romantico y afectivo.
- Roleplay y mantenimiento de personalidad consistente en dialogos multi-turno.
- Multilingue en seis idiomas: turco, ingles, aleman, frances, espanol y arabe.
- Respuestas de estilo coloquial y empatico, orientadas a compania conversacional.
- No hay evidencia en la informacion disponible de soporte de tool calling ni function calling.
- No hay evidencia de modo thinking, capacidades de vision, audio ni agentes multi-paso.
- Compatible con inferencia local mediante llama.cpp (CLI y servidor) y con los endpoints compatibles marcados en los tags.

## Casos de uso

- Prototipos de chatbot de compania en local: desplegable con llama-server en una unica GPU de consumo o incluso en CPU, permite experimentar con experiencias conversacionales afectivas sin enviar datos a terceros.
- Aplicaciones de roleplay narrativo: suitable para ficcion interactiva con personajes con personalidad definida, gracias al ajuste especifico de tono romantico.
- Asistentes multilingues de nicho: cubre turco, arabe y tres idiomas europeos, lo que permite desplegar la misma experiencia en comunidades diversas.
- Investigacion sobre ajuste fino de estilo: sirve como caso de estudio de como un fine-tune de nicho se distribuye en GGUF y se integra en el ecosistema llama.cpp.
- Demos y pruebas de concepto offline: al pesar 4,58 GiB, se puede incluir en entornos con recursos limitados y sin conexion.
- Chat de acompanamiento educativo o de practica de idiomas: el modelo responde en el idioma del usuario y puede usarse para practicar conversacion basica en los idiomas soportados.
- Comparativas de cuantizacion: util para medir la perdida de calidad de Q4_K_M frente a otras cuantizaciones del mismo base publicadas por mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas conversacionales especificas para este ajuste ni para su modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM para los pesos en Q4_K_M: 4,58 GiB (4.920.739.904 bytes) segun ossmodeldb.
- VRAM total estimada en inferencia: aproximadamente 5-6 GB considerando cache KV y overhead, dependiendo de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). No requiere VRAM de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 6-8 GB de VRAM.
- Despliegue en CPU: viable mediante llama.cpp, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue documentadas: llama.cpp (CLI y servidor) y cualquier runtime compatible con GGUF (por ejemplo Ollama o LM Studio, aunque no vienen citados en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Keynekei/ai-girlfriend-v2-Q4_K_M-GGUF | ~8B | No disponible | GGUF | Apache 2.0 | Conversion comunitaria del base |
| mradermacher/ai-girlfriend-v2-GGUF | ~8B | No disponible | GGUF | Apache 2.0 | Mismo base, otras cuantizaciones (incluye Q4_K_M) |
| sercancelenk/ai-girlfriend-v2 | ~8B | No disponible | Safetensors (base) | Apache 2.0 | Modelo original sin cuantizar |
| Modelos conversacionales genericos de ~8B (por ejemplo Llama 3 8B Instruct) | ~8B | No disponible en esta ficha | Multiples | Variable segun modelo | Alternativa generica, sin ajuste especifico de roleplay |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: al ser un ajuste conversacional de nicho, no esta optimizado para precision factual ni para tareas de conocimiento verificable.
- Sesgos potenciales: los corpus de roleplay romantico suelen reproducir estereotipos de genero y patrones de interaccion afectiva que conviene auditar antes de un uso publico.
- Ambito limitado: no hay evidencia de capacidades de razonamiento, codigo, matematicas, tool calling ni agentes. No deberia emplearse para esos fines.
- Contexto no documentado: se desconoce la ventana maxima real del modelo; usar contextos muy largos puede degradar la calidad o fallar en tiempo de ejecucion.
- Idiomas: los seis idiomas declarados provienen del ajuste, pero no hay evaluacion publicada de su calidad relativa; el turco y el ingles son previsiblemente los mejor cubiertos por el origen del proyecto.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el contenido generado ni sobre el cumplimiento de normativas de contenido.
- Apropiado solo para audiencias adultas segun la tematica declarada; no apto para entornos infantiles o corporativos sensibles.
- Model card minima: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas del base, lo que dificulta la trazabilidad en produccion.
- Repo con muy poca traccion (36 descargas, 0 likes en el momento de la consulta): sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF de la cuantizacion: https://huggingface.co/Keynekei/ai-girlfriend-v2-Q4_K_M-GGUF
- Modelo base del ajuste: https://huggingface.co/sercancelenk/ai-girlfriend-v2
- Cuantizaciones alternativas del mismo base: https://huggingface.co/mradermacher/ai-girlfriend-v2-GGUF
- Archivo Q4_K_M alternativo de mradermacher: https://huggingface.co/mradermacher/ai-girlfriend-v2-GGUF/blob/main/ai-girlfriend-v2.Q4_K_M.gguf
- Ficha de requisitos de VRAM y tamanos de cuantizacion: https://ossmodeldb.com/models/ai-girlfriend-v2
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Sitio externo de chatbots de roleplay (referencia de contexto, no relacionado con el modelo): https://www.kales.ai/en/
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
