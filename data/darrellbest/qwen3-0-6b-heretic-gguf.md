# darrellbest/Qwen3-0.6B-Heretic-GGUF

## Resumen

Qwen3-0.6B-Heretic-GGUF es una compilacion en formato GGUF del modelo darrellbest/Qwen3-0.6B-Heretic, que a su vez es una version modificada de Qwen/Qwen3-0.6B a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante la herramienta Heretic y la tecnica de ablacion de rango arbitrario sobre los pesos completos (Arbitrary-Rank Ablation, ARA). El autor del repositorio es darrellbest y la publicacion se realizo el 25 de septiembre de 2026.

El modelo resuelve un problema muy concreto: disponer de un modelo de 0.6B de parametros (596.049.920 parametros reales) que responde a peticiones que el modelo original rechazaria, manteniendo una divergencia KL de solo 0.0027 respecto al comportamiento original. Segun la model card, la tasa de rechazo baja de 54/100 a 3/100 en el conjunto de evaluacion utilizado por el autor.

Su relevancia practica esta en el formato y el tamano: al distribuirse en GGUF (BF16, Q8_0 y Q4_K_M), puede ejecutarse en CPU o en GPUs de gama baja con muy poca memoria, lo que lo hace util para prototipado local, experimentacion sin conexion y como base para investigacion sobre alineacion y seguridad. No se dispone de informacion sobre benchmarks estandar de razonamiento o codigo en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada de Qwen/Qwen3-0.6B (detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (lossless), Q8_0 y Q4_K_M |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q4_K_M); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se describe en la informacion disponible la arquitectura interna mas alla de que el punto de partida es Qwen/Qwen3-0.6B, un modelo denso de aproximadamente 0.6B de parametros. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica de esta variante no esta en el entrenamiento, sino en la modificacion de pesos: se aplico Heretic con ablacion de rango arbitrario (ARA) sobre los pesos completos para eliminar el comportamiento de rechazo. El autor reporta 3 rechazos de cada 100 peticiones (frente a 54/100 del modelo original) con una divergencia KL de 0.0027, lo que indica que la distribucion de salida se conserva muy cerca de la original. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` de llama.cpp desde los safetensors en bf16, y la cuantizacion con `llama-quantize` sin imatrix. BF16 y Q8_0 reproducen la salida greedy del modelo en safetensors; Q4_K_M difiere ligeramente en la redaccion.

## Capacidades

- Generacion de texto conversacional en formato chat, con la plantilla de chat de Qwen3 integrada.
- Modo de razonamiento (thinking) activado por defecto; puede desactivarse por peticion con `"chat_template_kwargs": {"enable_thinking": false}`.
- Respuestas a peticiones que el modelo original rechazaria, al haberse eliminado el comportamiento de rechazo (3/100 rechazos segun el autor).
- Inferencia local en CPU y en GPU de gama baja gracias al formato GGUF y al reducido numero de parametros.
- Compatibilidad con endpoints (`endpoints_compatible`) segun las etiquetas del repositorio.
- No se documentan en la informacion proporcionada capacidades de tool calling, function calling, agentes, vision, audio ni soporte multilingue explicito.

## Casos de uso

- Prototipado local de aplicaciones de chat: el modelo ocupa entre 397 MB (Q4_K_M) y 1,20 GB (BF16), por lo que puede integrarse en un portatil sin GPU dedicada para validar prompts, plantillas y flujos conversacionales antes de escalar a un modelo mayor.
- Asistente sin conexion en dispositivos con recursos limitados: al ejecutarse con llama.cpp u Ollama, permite desplegar un asistente de texto en equipos aislados o sin acceso a Internet.
- Investigacion sobre alineacion y seguridad: la diferencia entre el modelo original (54/100 rechazos) y esta variante (3/100) con KL de 0.0027 lo convierte en un caso de estudio controlado sobre como la ablacion de pesos afecta al comportamiento de rechazo.
- Red teaming y evaluacion de filtros: sirve como contraparte no alineada para probar clasificadores de contenido, moderacion o guardarrailes en pipelines propios.
- Generacion de datos sinteticos en dominios donde el modelo original se niega a responder: util para construir conjuntos de datos con vocabulario o tematicas que los modelos con rechazo evitan.
- Base para ajuste fino ligero: al ser un modelo de 0.6B con licencia Apache 2.0 y pesos GGUF ademas de safetensors, es viable reentrenar o adaptar con LoRA en una sola GPU consumer.
- Tareas auxiliares de bajo coste: clasificacion de texto, reescritura, resumen corto o etiquetado por lotes donde no se requiere razonamiento complejo y prima el coste por token.
- Borradores en decodificacion especulativa: por su tamano, puede actuar como modelo borrador para acelerar la generacion de un modelo mayor, siempre que se valide la compatibilidad de tokenizador.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la tasa de rechazo y la divergencia KL respecto al modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Qwen3-0.6B (original) | Qwen3-0.6B-Heretic | Notas |
|---|---|---|---|
| Tasa de rechazo | 54/100 | 3/100 | Segun la model card del autor; conjunto de evaluacion no detallado |
| Divergencia KL | Referencia | 0.0027 | Respecto al modelo original |

## Requisitos de hardware

- VRAM estimada para los pesos (derivada de los tamanos de archivo publicados, sin contar cache KV ni overhead del runtime): aproximadamente 0,4 GB en Q4_K_M, 0,64 GB en Q8_0 y 1,2 GB en BF16.
- Cabe en cualquier GPU de consumo actual y en la mayoria de iGPU con memoria compartida; tambien es viable la inferencia exclusiva en CPU.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, cualquier GPU con 2 GB o mas de memoria libre es suficiente para las cuantizaciones publicadas.
- Opciones de despliegue documentadas: `llama-server -m Qwen3-0.6B-Heretic-Q8_0.gguf --jinja -ngl 99` con llama.cpp y `ollama run hf.co/darrellbest/Qwen3-0.6B-Heretic-GGUF:Q8_0` con Ollama. vLLM y TGI no se mencionan para estos archivos GGUF; para esos motores habria que usar la version en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Comportamiento de rechazo |
|---|---|---|---|---|---|
| darrellbest/Qwen3-0.6B-Heretic-GGUF | 596.049.920 | No disponible | GGUF (BF16, Q8_0, Q4_K_M) | Apache 2.0 | 3/100 rechazos |
| darrellbest/Qwen3-0.6B-Heretic | No disponible | No disponible | Safetensors | Apache 2.0 | 3/100 rechazos (modelo de origen) |
| Qwen/Qwen3-0.6B | No disponible en esta busqueda | No disponible | Safetensors y otras distribuciones del autor | Apache 2.0 | 54/100 rechazos |

No se dispone de datos de rendimiento comparado (benchmarks) ni de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los guardarrailes de seguridad estan reducidos de forma deliberada; el propio autor advierte que la responsabilidad del uso recae en quien lo emplea.
- Riesgo de alucinacion: es un modelo de 0.6B de parametros, por lo que su fiabilidad factual es limitada y no debe usarse como fuente de verdad sin verificacion externa.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad posteriores a la ablacion.
- La longitud de contexto y los idiomas soportados no estan documentados en la informacion proporcionada, lo que dificulta planificar despliegues con requisitos de contexto largo o multilingues.
- Q4_K_M no reproduce exactamente la salida greedy del modelo en safetensors; si se requiere fidelidad respecto al modelo original, deben usarse BF16 o Q8_0.
- El modo de razonamiento (thinking) esta activado por defecto, lo que incrementa el numero de tokens generados y el coste si no se desactiva explicitamente por peticion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre las consecuencias de su uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estos archivos.
- Riesgo de que el ajuste fino sobre este modelo herede el comportamiento sin rechazos en aplicaciones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/darrellbest/Qwen3-0.6B-Heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores provienen de la model card y de la informacion del repositorio.
