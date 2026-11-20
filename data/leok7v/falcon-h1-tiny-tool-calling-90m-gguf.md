# leok7v/Falcon-H1-Tiny-Tool-Calling-90M-GGUF

## Resumen

Falcon-H1-Tiny-Tool-Calling-90M es un modelo de lenguaje causal decoder-only de 90 millones de parametros desarrollado por el Falcon-LLM Team del Technology Innovation Institute (TII) de Abu Dabi. Forma parte de la familia Falcon-H1-Tiny, una serie de modelos extremadamente pequenos orientados a despliegue en el borde (edge) y a tareas de tool calling. Este repositorio concreto es un espejo no modificado del original `tiiuae/Falcon-H1-Tiny-Tool-Calling-90M-GGUF`, publicado por el usuario leok7v, que unicamente contiene el fichero cuantizado en Q8_0.

La relevancia del modelo radica en su arquitectura hibrida, que combina capas de Transformer con capas basadas en Mamba (modelo de espacio de estados), lo que permite reducir el coste computacional en contextos largos manteniendo la calidad de un transformer clasico. Con solo 90M de parametros nominales (107.908.288 reales segun los pesos en safetensors del modelo base), esta disenado para ejecutarse en dispositivos con recursos muy limitados: moviles, Raspberry Pi, navegadores o sistemas embebidos.

El modelo esta especializado en tool calling, es decir, en la generacion de llamadas estructuradas a funciones externas dentro de flujos conversacionales. Esta orientado principalmente al ingles y se distribuye bajo la licencia Falcon-LLM, con una politica de uso aceptable asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Transformer + Mamba (causal decoder-only) |
| Parametros totales | 107.908.288 (nominal 90M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero en este repositorio); el repositorio original ofrece otros formatos GGUF |
| Idiomas soportados | Ingles |
| Licencia | Falcon-LLM License (con Acceptable Use Policy) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que intercala bloques de atencion Transformer con bloques Mamba, un tipo de modelo de espacio de estados (SSM) selectivo. Esta combinacion busca aprovechar la eficiencia lineal de Mamba en secuencias largas junto con la capacidad expresiva de la atencion completa del Transformer. El resultado es un modelo con un coste de inferencia y memoria mas predecible que un transformer puro de tamano equivalente, lo que resulta critico en el rango de los 90M de parametros.

Segun la model card, el modelo ha sido desarrollado por TII y esta especializado en tool calling. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado especifico para la tarea de llamadas a funciones. Para esos detalles, la model card remite al blogpost tecnico de la familia Falcon-H1-Tiny.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling: generacion de llamadas estructuradas a funciones externas, que es la especialidad declarada del modelo.
- Razonamiento multi-paso basico orientado a la seleccion y parametrizacion de herramientas.
- Integracion en pipelines de agentes ligeros gracias a su reducido tamano.
- Ejecucion en entornos de borde (edge): moviles, dispositivos embebidos, navegador.
- Compatibilidad con `transformers`, `vLLM`, `sglang`, `llama.cpp`, `ollama` y `mlx`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio y modo thinking extendido: no disponibles.

## Casos de uso

- Asistente de voz en dispositivos moviles: el modelo puede interpretar la intencion del usuario y emitir una llamada a funcion (por ejemplo, crear un recordatorio o consultar el tiempo) con un coste de memoria inferior a 100 MB en Q8_0, lo que permite ejecucion local sin conexion.
- Automatizacion de hogar conectado: integrado en un hub local, traduce ordenes en lenguaje natural a llamadas a la API de dispositivos (encender luces, ajustar termostato) sin depender de la nube.
- Enrutador de intenciones en pipelines de agentes: actua como primer eslabon que clasifica la peticion del usuario y decide que herramienta o modelo mayor debe invocarse, reduciendo coste y latencia frente a usar un LLM grande para esa funcion.
- Extraccion estructurada de datos en formularios: dado un texto libre, genera una llamada a funcion con los campos rellenados, util para procesos de digitalizacion en entornos con requisitos de privacidad (datos que no salen del dispositivo).
- Prototipado rapido de asistentes conversacionales: al caber en `ollama` y `llama.cpp`, permite iterar sobre disenos de tool calling en un portatil sin GPU dedicada.
- Educacion y experimentacion: modelo de referencia para estudiar arquitecturas hibridas Transformer-Mamba y tecnicas de ajuste para function calling a muy baja escala.
- Filtrado y clasificacion en el borde: tareas de etiquetado o moderacion ligera ejecutadas localmente en dispositivos con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blogpost tecnico de la familia Falcon-H1-Tiny para la evaluacion detallada, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1-0,2 GB en Q8_0 (el repositorio ocupa 0,1 GB); en cuantizaciones menores del repositorio original, por debajo de 0,1 GB.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es mas que suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de SoC moviles y placas tipo Raspberry Pi.
- Opciones de despliegue: `llama.cpp`, `ollama`, `transformers`, `vLLM`, `sglang`, `mlx`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Falcon-H1-Tiny-Tool-Calling-90M | 90M (107,9M reales) | no disponible | Falcon-LLM | GGUF, HF |
| SmolLM2-135M (Hugging Face) | 135M | 8K (segun su model card publica) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B (Alibaba) | 0,5B | 32K (segun su model card publica) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2K (segun su model card publica) | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparativos provienen de sus model cards publicas y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria. El punto diferencial de Falcon-H1-Tiny es su arquitectura hibrida y su especializacion explicita en tool calling a un tamano inferior a 100M de parametros.

## Limitaciones y advertencias

- Modelo entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo elevado de alucinacion en tool calling: a esta escala, la seleccion de la funcion correcta y la generacion de argumentos validos puede fallar, especialmente con esquemas de funciones complejos o muchos tools disponibles.
- Capacidad de razonamiento y conocimiento del mundo muy limitada por el tamano; no apto para tareas que requieran conocimiento factual amplio.
- Longitud de contexto no documentada en la informacion disponible; conviene verificar el limite real antes de usarlo en conversaciones multi-turno largas.
- Licencia Falcon-LLM con Acceptable Use Policy: es necesario revisar los terminos (https://falconllm.tii.ae/falcon-terms-and-conditions.html) antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Este repositorio es un espejo de terceros (leok7v) y no el oficial de TII; para produccion conviene usar el repositorio original `tiiuae/Falcon-H1-Tiny-Tool-Calling-90M-GGUF`.
- Solo contiene el fichero Q8_0; si se necesita otra cuantizacion, hay que acudir al repositorio original.
- Sin datos de benchmarks publicados en esta busqueda, no es posible validar su calidad frente a alternativas.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/leok7v/Falcon-H1-Tiny-Tool-Calling-90M-GGUF
- Repositorio original: https://huggingface.co/tiiuae/Falcon-H1-Tiny-Tool-Calling-90M-GGUF
- Blogpost tecnico de Falcon-H1-Tiny: https://huggingface.co/spaces/tiiuae/tiny-h1-blogpost
- Terminos de licencia Falcon-LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- TII (Technology Innovation Institute): https://www.tii.ae
- Servidor de Discord del equipo Falcon-LLM: https://discord.gg/trwMYP9PYm
