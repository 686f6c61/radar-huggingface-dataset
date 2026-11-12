# osman-yahya/mustachio-e2b

## Resumen

mustachio-e2b es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it, desarrollado por el usuario osman-yahya y publicado bajo licencia Apache 2.0. Su propósito es muy concreto: invocar de forma fiable las 15 herramientas (tool calling) de la aplicación "feast" utilizando el formato nativo de llamada a herramientas de Gemma 4. El modelo se distribuye como un bundle LiteRT-LM de aproximadamente 2,86 GB, pensado para ejecución en dispositivo (on-device) y no como un modelo conversacional de propósito general.

La relevancia de esta ficha es acotada pero ilustrativa: muestra el patrón de especialización de un modelo pequeño (E2B, variante "effective 2B" de la familia Gemma 4) para una tarea de enrutamiento de herramientas en un dominio cerrado, con soporte específico para turco, incluyendo frases mixtas turco/inglés, y una persona concreta ("Mustachio") que responde a los resultados de las herramientas con frases cortas. El autor advierte explícitamente de que el modelo solo funciona bien con el prompt, las declaraciones de herramientas y el código de guarda de la app feast.

No se dispone de información pública sobre benchmarks, número de tokens de entrenamiento ni detalles del dataset de ajuste. La información disponible se limita a la model card y a los metadatos del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible (variante E2B de Gemma 4; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 block-wise (tamano de bloque 32), int8 para la proyeccion de embedding por capa, activaciones en float (`gemma4_mixed48_b32`) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | LiteRT-LM bundle (`.litertlm`), ~2,86 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, el checkpoint móvil con Quantization-Aware Training (QAT) de la familia Gemma 4, y se ajusta mediante LoRA para especializarlo en la invocación de las 15 herramientas de la aplicación feast en el formato nativo de tool-call de Gemma 4. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO adicionales; el ajuste declarado es LoRA sobre el modelo base ya instruido.

La innovación técnica destacable no está en la arquitectura, sino en el empaquetado y la cuantización: el bundle LiteRT-LM aplica cuantización int4 block-wise con bloque de 32, mantiene la proyección de embedding por capa en int8 y usa activaciones en float, un esquema (`gemma4_mixed48_b32`) orientado a reducir el peso del modelo hasta ~2,86 GB para inferencia en dispositivo. El modelo es exclusivamente de texto: el autor indica que no debe solicitarse un backend de visión o audio.

## Capacidades

- Invocación de herramientas (tool calling): genera llamadas en el formato nativo de Gemma 4 para las 15 herramientas de la app feast.
- Comprensión de turco tal como se escribe, incluyendo frases mixtas turco/inglés.
- Respuesta a resultados de herramientas con frases cortas adoptando la persona "Mustachio".
- Modelo de texto únicamente (sin visión ni audio).
- No está diseñado como modelo de chat general: su comportamiento fuera del prompt, las declaraciones de herramientas y el código de guarda de feast no está garantizado.
- Capacidades de razonamiento multi-step o agentes autónomos más allá del ciclo de tool calling de feast: no disponibles.

## Casos de uso

- Enrutamiento de herramientas en la app feast: el modelo recibe la consulta del usuario y selecciona y parametriza la herramienta adecuada entre las 15 disponibles, usando el formato nativo de tool-call de Gemma 4.
- Asistente conversacional de dominio cerrado en turco: gestiona interacciones en turco, incluidas mezclas turco/inglés, dentro del flujo de feast y responde con la persona Mustachio.
- Ejecución on-device en dispositivos móviles: el bundle LiteRT-LM de ~2,86 GB con cuantización int4 está pensado para inferencia local sin depender de servidores, reduciendo latencia y preservando privacidad.
- Prototipado de pipelines de tool calling: sirve como referencia de cómo especializar un modelo Gemma 4 pequeño para un conjunto fijo de herramientas y un formato de llamada concreto.
- Integración en aplicaciones de reservas o pedidos: las herramientas de feast (pedidos, consultas, etc.) permiten al modelo encadenar una llamada a herramienta con una respuesta breve al usuario.
- Evaluación de cuantización QAT en producción: útil para estudiar el comportamiento de un checkpoint QAT de Gemma 4 ajustado con LoRA y cuantizado a int4 en un caso de uso real de enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el bundle ocupa ~2,86 GB, por lo que se necesita al menos ese espacio en memoria para cargar los pesos; el consumo adicional depende del runtime LiteRT-LM y de la longitud de contexto.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución on-device mediante LiteRT-LM, no a GPU de servidor.
- ¿Cabe en GPU consumer? No hay datos específicos; el tamaño del bundle sugiere que podría ejecutarse en hardware con al menos ~3 GB de memoria disponible, pero no se confirma compatibilidad con GPU de consumo.
- Opciones de despliegue: LiteRT-LM (`pip install litert-lm`) es el runtime indicado por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| mustachio-e2b | no disponible (base E2B) | no disponible | LiteRT-LM (.litertlm) | Apache 2.0 | Tool calling especializado en app feast, turco/inglés, on-device |
| google/gemma-4-E2B-it | no disponible (variante E2B) | no disponible | no disponible | Gemma 4 license | Modelo base instruido, propósito general, checkpoint QAT móvil |
| Alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con otros modelos de tool calling de tamaño comparable.

## Limitaciones y advertencias

- El autor advierte de que el modelo solo funciona bien con el prompt, las declaraciones de herramientas y el código de guarda de la app feast; no es un modelo de chat general.
- Es un modelo exclusivamente de texto: no debe solicitarse un backend de visión o audio.
- Idiomas limitados a turco e inglés; no se garantiza comportamiento en otros idiomas, incluido el castellano.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación; el riesgo de alucinación en llamadas a herramientas fuera del dominio de feast no está cuantificado.
- Longitud de contexto no documentada: no se puede planificar el uso con conversaciones largas sin verificación empírica.
- Aunque la licencia del repositorio es Apache 2.0, el autor enlaza la licencia de Gemma 4; conviene revisar los términos de esa licencia para uso comercial del modelo base y derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El ajuste es LoRA sobre un checkpoint QAT; no se documentan los datos de entrenamiento, lo que dificulta evaluar la cobertura de casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osman-yahya/mustachio-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
