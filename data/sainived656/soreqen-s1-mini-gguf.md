# sainived656/soreqen-s1-mini-GGUF

## Resumen

SoreQen S1 Mini es un asistente conversacional bilingüe (inglés e hinglish) desarrollado por ZorQelis AI, disponible en formato GGUF para su ejecución con llama.cpp. Se trata de un modelo de 752 millones de parámetros, fine-tuneado a partir de Qwen/Qwen3.5-0.8B de Alibaba Cloud, y distribuido bajo licencia Apache 2.0. La versión GGUF publicada en este repositorio contiene únicamente el modelo de lenguaje; el componente de visión del checkpoint original se distribuye por separado y aún no está publicado.

Su relevancia radica en ofrecer un asistente ligero y eficiente orientado al mercado indio, con soporte nativo para hinglish (hindi en escritura romana), un registro conversacional natural y capacidades de tool calling y modo de razonamiento. Al ser un modelo de menos de 1B de parámetros con cuantizaciones que van desde 0,53 GB, puede ejecutarse en hardware modesto, incluyendo CPU, lo que lo hace accesible para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | ingles, hinglish (hindi en escritura romana) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-0.8B de Alibaba Cloud, realizado por ZorQelis AI. La arquitectura subyacente es un transformer denso de aproximadamente 0,8B de parametros. El checkpoint original es multimodal, pero la conversion a GGUF incluye unicamente el modelo de lenguaje; el codificador de vision (mmproj) se distribuye por separado y no esta publicado en este repositorio.

No se han proporcionado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni el metodo de alineacion (RLHF, DPO, etc.). Segun la model card, el modelo esta entrenado para seguir un system prompt especifico que define su identidad, su comportamiento bilingue y un estilo de respuesta directo sin preambulos. Tambien se menciona soporte para thinking mode, tool calling y salida estructurada, lo que sugiere que el fine-tune incluyo datos orientados a estas capacidades, aunque no se especifican los detalles tecnicos.

## Capacidades

- Generacion de texto conversacional en ingles y hinglish (hindi en escritura romana), adaptando el registro al usuario (casual o profesional).
- Soporte de tool calling y function calling, integrado en el chat template de llama.cpp (requiere pasar `--jinja` para aplicar el formato correctamente).
- Modo de razonamiento o thinking mode, activable mediante el chat template empaquetado.
- Salida estructurada, segun indica la model card.
- Respuestas directas y concisas, disenadas para evitar preambulos y relleno.
- Capacidad para mantener conversaciones multi-turno en contexto.
- No incluye vision en la version GGUF; el checkpoint safetensors original es multimodal pero el mmproj no esta publicado.

## Casos de uso

- Asistente conversacional bilingue para usuarios indios: el modelo responde en hinglish cuando se le escribe en hinglish y en ingles cuando se le escribe en ingles, lo que lo hace util para aplicaciones de chat dirigidas al mercado indio, como asistentes de soporte o companeros de conversacion.
- Soporte tecnico de bajo coste: al ser un modelo de 0,75B con cuantizacion Q4_K_M (0,53 GB), puede desplegarse en CPU o en GPUs de gama baja para atender consultas de soporte en entornos con presupuesto limitado, manteniendo un tono natural y directo.
- Automatizacion de tareas con tool calling: su soporte para function calling permite integrarlo en pipelines que necesiten ejecutar acciones concretas, como consultar APIs, buscar informacion o interactuar con sistemas externos, en escenarios donde un modelo grande seria sobredimensionado.
- Aplicaciones de chat locales y privadas: al poder ejecutarse en local con llama.cpp, es adecuado para aplicaciones que requieran privacidad de datos, como asistentes internos de empresas que no quieran enviar datos a APIs externas.
- Prototipado rapido de asistentes bilingues: su tamano reducido y su licencia Apache 2.0 permiten experimentar y crear prototipos de asistentes conversacionales en ingles e hinglish sin coste de licencia ni necesidad de hardware especializado.
- Generacion de contenido en hinglish: puede utilizarse para redactar textos, respuestas o contenido en hinglish (escritura romana) para redes sociales, blogs o atencion al cliente, en un registro natural y coloquial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. El autor advierte explicitamente que los modelos pequenos "afirman numeros con confianza que no pueden verificar", especialmente en precios, tasas y aritmetica, por lo que se recomienda precaucion al usar el modelo para tareas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,53 GB para la cuantizacion Q4_K_M, 0,81 GB para Q8_0 y 1,52 GB para F16. Estas cifras corresponden al tamano de los archivos GGUF, por lo que la VRAM real necesaria sera ligeramente superior al tamano del archivo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar la cuantizacion Q4_K_M. Modelos como GTX 1650, RTX 3060 o superiores son suficientes. Tambien es viable en iGPU integradas.
- CPU: la cuantizacion Q4_K_M esta disenada para ejecutarse en CPU con recursos modestos, segun la model card.
- Opciones de despliegue: llama.cpp (via `llama-cli`), y por extension cualquier herramienta compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no se proporcionan datos especificos. En CPU, un modelo de 0,75B cuantizado a Q4_K_M suele generar entre 10 y 30 tokens por segundo en hardware moderno, aunque esto depende del sistema.
- Requisitos adicionales: es necesario pasar `--jinja` a llama.cpp para que se aplique correctamente el chat template y funcionen el thinking mode y el tool calling.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo Intern-S1-mini de Shanghai AI Laboratory, tambien disponible en GGUF, es un modelo de tamano similar que podria considerarse comparable, pero no se dispone de datos de rendimiento ni especificaciones detalladas del modelo SoreQen S1 Mini para realizar una comparacion objetiva. La informacion disponible no permite comparar parametros, contexto, rendimiento ni licencia con alternativas de forma fiable.

## Limitaciones y advertencias

- El modelo es pequeno (0,75B) y tiende a afirmar numeros con confianza sin poder verificarlos. No debe utilizarse para calculos aritmeticos, precios, tasas o cualquier tarea que requiera precision numerica.
- La salida en hinglish es en escritura romana por diseno; el modelo no produce texto en devanagari.
- La cuantizacion Q4_K_M conlleva una perdida de precision. El propio autor recomienda verificar respuestas criticas contra la version Q8_0 o el checkpoint safetensors original.
- La version GGUF no incluye vision, aunque el checkpoint fuente sea multimodal. Intentar usar entrada de imagenes con estos archivos fallara.
- El modelo requiere el system prompt recomendado para comportarse segun lo previsto. Sin el, puede mantener su identidad pero no seguira las instrucciones de estilo y registro.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues que requieran ventanas largas.
- No se han publicado datos de sesgos, alucinaciones ni evaluaciones de seguridad. Se recomienda auditar el modelo antes de un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sainived656/soreqen-s1-mini-GGUF
- Modelo base safetensors: https://huggingface.co/sainived656/soreqen-s1-mini
- Modelo SoreQen S1 (variante 2B): https://huggingface.co/sainived656/soreqen-s1
- Modelo comparable (referencia): https://huggingface.co/internlm/Intern-S1-mini-GGUF
