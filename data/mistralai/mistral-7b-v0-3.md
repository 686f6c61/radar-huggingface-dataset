# mistralai/Mistral-7B-v0.3

## Resumen

Mistral-7B-v0.3 es un modelo de lenguaje de tipo transformer decoder-only desarrollado por Mistral AI, con 7.248.023.552 parametros. Se trata de la tercera revision de la familia Mistral 7B: parte de Mistral-7B-v0.2 y su unico cambio documentado es la ampliacion del vocabulario hasta 32768 tokens, lo que mejora la eficiencia de tokenizacion en segun que idiomas y codigos.

Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y esta concebido como modelo base (no instruct) para ser ajustado posteriormente. Resuelve tareas de generacion y completado de texto, y resulta relevante porque combina un tamano contenido, apto para GPU de consumo, con una licencia permisiva, algo poco habitual en modelos de esta categoria.

Mistral AI recomienda su uso junto con la libreria mistral-inference, aunque tambien es compatible con transformers y con motores de inferencia como vLLM. En el momento de redactar esta ficha acumula 235.605 descargas y 617 likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens (dato de la familia Mistral 7B; no explicitado en la informacion proporcionada) |
| Tipos de cuantizacion | safetensors en FP16/BF16 en el repositorio oficial; existen cuantizaciones GGUF, AWQ y GPTQ de la comunidad (no incluidas en el repo oficial) |
| Idiomas soportados | no disponible (la model card no lo especifica; la familia Mistral 7B esta optimizada principalmente para ingles, con soporte parcial de otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (consolidated.safetensors), ademas de params.json y tokenizer.model.v3 |

## Arquitectura y entrenamiento

Mistral-7B-v0.3 es un transformer decoder-only denso de aproximadamente 7.250 millones de parametros. Segun la model card, se construye directamente sobre Mistral-7B-v0.2 y su unica modificacion es la ampliacion del vocabulario hasta 32768 tokens, lo que mejora la eficiencia de tokenizacion y reduce el numero de tokens necesarios para codificar el mismo texto.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; se trata de un modelo base, sin ajuste de instrucciones. La familia Mistral 7B, documentada en el articulo tecnico de Mistral AI, emplea innovaciones como la atencion con ventana deslizante (sliding window attention) y grouped-query attention (GQA), aunque la model card de esta version no las detalla de forma explicita.

## Capacidades

- Generacion y completado de texto: es la funcion principal al tratarse de un modelo base, no dialogico.
- Razonamiento y conocimiento general: heredados del preentrenamiento, sin ajuste de instrucciones.
- Generacion de codigo: capacidad latente del preentrenamiento, no evaluada en la documentacion disponible.
- Punto de partida para fine-tuning: es su uso previsto, segun la propia model card, que lo describe como una base facil de ajustar.
- Soporte de tool calling / function calling: no disponible de serie (requiere ajuste posterior; el modelo base no incorpora plantilla de herramientas).
- Soporte de agentes y razonamiento multi-paso: no soportado de forma nativa; solo tras fine-tuning especifico.
- Capacidades multilingues: no especificadas; el foco esta en ingles.
- Capacidades especiales (vision, audio, thinking mode): no dispone de ninguna.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base con licencia Apache 2.0, se puede ajustar sobre corpus juridicos, medicos o financieros sin restricciones de uso comercial.
- Generacion de texto y completado en aplicaciones de redaccion: adecuado para autocompletado y continuacion de texto en ingles, con un coste de inferencia reducido por su tamano.
- Redaccion asistida de codigo tras ajuste: puede especializarse en lenguajes concretos mediante fine-tuning supervisado sobre repositorios propios.
- Backbone para tareas derivadas: sirve como base para clasificacion, analisis de sentimiento o extraccion de informacion despues de anadir una cabeza de tarea.
- Generacion de datos sinteticos: util para aumentar datasets de entrenamiento de modelos menores en pipelines internos.
- Investigacion academica: al ser reproducible y ligero, es un candidato habitual para estudios sobre tecnicas de ajuste, destilacion o cuantizacion.
- Despliegue on-premise o en el borde: su tamano permite ejecucion local sin depender de APIs externas, lo que ayuda al cumplimiento de requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 14,5 GB (7.250 M de parametros).
- VRAM estimada en INT8: en torno a 7,3 GB.
- VRAM estimada en INT4 (GGUF Q4): en torno a 3,6 GB, mas overhead de la cache KV segun contexto.
- GPU profesionales: A100, H100 o L40S, aunque el modelo queda muy por debajo de su capacidad y no las aprovecha al maximo.
- GPU de consumo: cabe en FP16 en RTX 3090 y RTX 4090 (24 GB); con cuantizacion INT8/INT4 puede ejecutarse en tarjetas de 12 GB (RTX 3060, RTX 4070) e incluso de 8 GB en INT4 con contextos reducidos.
- Opciones de despliegue: mistral-inference (recomendado por el autor), transformers, vLLM, llama.cpp, Ollama y TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-7B-v0.3 | 7.248 M | 32768 tokens (familia Mistral 7B) | Apache 2.0 | HuggingFace, uso comercial sin restricciones |
| Mistral-7B-v0.2 | 7.242 M aprox. | 32768 tokens (familia Mistral 7B) | Apache 2.0 | HuggingFace; vocabulario de 32000 tokens |
| Llama 2 7B | 6.700 M | 4096 tokens | Licencia comunitaria de Meta | HuggingFace, con condiciones de uso |
| Llama 3 8B | 8.000 M | 8192 tokens | Licencia comunitaria de Meta | HuggingFace, con condiciones de uso |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no esta preparado para dialogo ni para seguir ordenes de forma fiable.
- No incorpora mecanismos de moderacion, tal y como advierte la propia model card, por lo que puede generar contenido inapropiado.
- Riesgo de alucinacion: como cualquier LLM autoregresivo, puede producir afirmaciones incorrectas con apariencia de veracidad.
- Idiomas: la model card no especifica soporte multilingue; el rendimiento fuera del ingles puede ser limitado.
- Contexto: aunque la familia admite 32768 tokens, el uso de ventanas muy largas incrementa el consumo de memoria de la cache KV.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones generales de Mistral AI y de los servicios asociados.
- En produccion, para funciones de chat, herramientas o agentes sera necesario un fine-tuning adicional y capas de seguridad externas.

## Enlaces

- HuggingFace: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Mistral-7B-v0.2: https://huggingface.co/mistralai/Mistral-7B-v0.2
- Repositorio mistral-inference: https://github.com/mistralai/mistral-inference
- Sitio oficial de Mistral AI: https://mistral.ai/
- Articulo tecnico de la familia Mistral 7B: https://arxiv.org/abs/2310.06825
