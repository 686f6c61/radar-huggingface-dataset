# distil-labs/Qwen3.5-4B-flexible-chat-template

## Resumen

Qwen3.5-4B-flexible-chat-template es un derivado de Qwen/Qwen3.5-4B publicado por distil-labs cuyo unico cambio respecto al modelo original es la plantilla de chat. En concreto, permite que un mensaje de rol `system` aparezca en cualquier posicion de la conversacion, no solo al principio, renderizandolo en su lugar como `<|im_start|>system\n...<|im_end|>` en lugar de lanzar la excepcion `System message must be at the beginning.` que provoca la plantilla original de Qwen.

Los pesos, el tokenizador y el resto de la plantilla son identicos a los de Qwen/Qwen3.5-4B, de modo que el modo de razonamiento (`enable_thinking`) funciona igual que en el modelo base. El autor lo emplea para ajustar finamente "estudiantes" sobre conversaciones de agentes que insertan mensajes de sistema a mitad de dialogo, un escenario habitual en pipelines agénticos multi-turno.

El modelo tiene 4.659.865.088 parametros (aproximadamente 4,66 mil millones), se distribuye en safetensors con un repositorio de 9,3 GB y mantiene la licencia Apache 2.0 del original. Su relevancia actual radica en que resuelve una friccion concreta de las plantillas de chat estrictas al entrenar o desplegar agentes que inyectan instrucciones de sistema dinamicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B, familia qwen3_5) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna (tipo de transformer, atencion, capas) ni sobre los datos de entrenamiento del modelo base Qwen3.5-4B en la informacion proporcionada. El tag `qwen3_5` y la pipeline `image-text-to-text` indican que el modelo base es multimodal (procesa imagen y texto), pero no se detallan los componentes de vision ni su integracion.

El unico cambio documentado respecto al modelo base es la modificacion de `chat_template.jinja` (y la misma plantilla en `tokenizer_config.json`): se elimina la excepcion que obliga al mensaje de sistema a ir primero y se sustituye por un renderizado en linea. No se describe ningun proceso de entrenamiento adicional, RLHF, DPO ni ajuste fino realizado por distil-labs sobre estos pesos; el autor menciona que el modelo se usa como base para ajustar estudiantes, no que este publicado con un ajuste propio.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), segun los tags del repositorio.
- Modo de razonamiento activable mediante `enable_thinking`, con el mismo comportamiento que el modelo original.
- Plantilla de chat flexible: acepta mensajes de sistema en cualquier posicion de la conversacion.
- Uso como base para ajuste fino de estudiantes en conversaciones agénticas que inyectan system messages durante el dialogo.
- Soporte de tool calling, agentes, capacidades multilingues o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Ajuste fino de agentes conversacionales: el modelo sirve como base para entrenar estudiantes sobre dialogos en los que se insertan instrucciones de sistema a mitad de conversacion, algo imposible con la plantilla original de Qwen3.5-4B.
- Investigacion en destilacion: distil-labs lo emplea para generar o entrenar estudiantes a partir de conversaciones agénticas; el repositorio encaja en pipelines de destilacion donde el profesor emite system messages dinamicos.
- Evaluacion de plantillas de chat: util para comparar el comportamiento del modelo con y sin la restriccion de posicion del mensaje de sistema, manteniendo pesos identicos.
- Prototipado de asistentes con instrucciones cambiantes: permite modificar el rol o las reglas del asistente a mitad de sesion sin reiniciar la conversacion.
- Desarrollo de pipelines agénticos multi-paso: al aceptar system messages intercalados, facilita la integracion con frameworks que reinyectan contexto o directrices entre pasos.
- Experimentacion multimodal ligera: al ser un modelo de ~4,66 mil millones de parametros con pipeline image-text-to-text, puede usarse en entornos de investigación con recursos limitados para tareas de imagen y texto (siempre que se confirme el soporte de vision en el modelo base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a Qwen/Qwen3.5-4B para benchmarks y uso, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~4,66 mil millones de parametros en fp16 requiere aproximadamente 9,3 GB solo para pesos; en cuantizaciones de 8 bits o 4 bits el requisito se reduce, pero no se han publicado valores concretos para este modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de ~4,66 mil millones de parametros podria caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la libreria indicada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| distil-labs/Qwen3.5-4B-flexible-chat-template | ~4,66 mil millones | no disponible | Apache 2.0 | Plantilla de chat modificada para system messages en cualquier posicion |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Apache 2.0 | Modelo base; plantilla original exige system message al inicio |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa con modelos de otros autores no puede completarse con los datos disponibles; la unica comparacion fiable es con su modelo base, del que difiere exclusivamente en la plantilla de chat.

## Limitaciones y advertencias

- El unico cambio respecto al modelo base es la plantilla de chat; los sesgos, alucinaciones y limitaciones del modelo Qwen3.5-4B se heredan integramente.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- La longitud de contexto y los idiomas soportados no estan disponibles; no deben asumirse valores del modelo base sin verificarlos.
- El uso de system messages intercalados puede alterar el comportamiento esperado del modelo, ya que la plantilla original no contemplaba ese caso; conviene validar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se remite a la licencia del modelo base Qwen/Qwen3.5-4B; deben revisarse las condiciones de dicho repositorio.
- El modelo se publica principalmente como base para ajuste fino, no como modelo listo para produccion; no hay garantias de rendimiento en tareas concretas.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre soporte de herramientas de despliegue especificas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/distil-labs/Qwen3.5-4B-flexible-chat-template
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
