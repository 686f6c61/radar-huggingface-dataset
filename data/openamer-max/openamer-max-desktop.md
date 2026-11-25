# openamer-max/openamer-max-desktop

## Resumen

OpenAmer-Desktop es un modelo de generacion de texto de 14.770.033.664 parametros (aproximadamente 14,7B), desarrollado por openamer-max como cuarto escalon de la familia OpenAmer. Se construye mediante un ajuste fino QLoRA de 4 bits sobre Qwen/Qwen2.5-14B-Instruct, con el objetivo de ofrecer un asistente conversacional que se ejecute de forma local y sin conexion en ordenadores de sobremesa, con una ventana de contexto de 32.768 tokens y licencia Apache-2.0.

El modelo se distribuye principalmente en formato GGUF Q4_K_M (8,4 GB), lo que permite su despliegue en CPU a unos 10 tokens por segundo en 16 hilos, o en GPU moderna a unos 60 tokens por segundo. Su propuesta de valor es la combinacion de tamano contenido, contexto largo, soporte multilingue (aleman, bosnio, croata, serbio e ingles) y una licencia permisiva para uso comercial, todo ello empaquetado para Ollama y llama.cpp.

La relevancia actual del modelo reside en su enfoque de "IA de escritorio": pesos que caben en maquinas de consumo, ejecucion completamente offline sin telemetria y un ajuste fino orientado a hechos de producto y rechazos honestos, en lugar de razonamiento de frontera. El autor reporta una mejora de 22 casos sobre su base sin ajustar en un conjunto de evaluacion congelado de 45 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-14B-Instruct) con ajuste LoRA fusionado |
| Parametros totales | 14.770.033.664 (aproximadamente 14,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (8,4 GB); pesos intermedios f16 (29,5 GB); entrenamiento en QLoRA 4 bits |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos fusionados en bf16 en el repositorio; safetensors para el conteo de parametros |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14,7B parametros con atencion por ventanas deslizantes y RoPE, y le aplica un ajuste fino supervisado mediante QLoRA de 4 bits. La configuracion LoRA es r=32, alpha=64, aplicada a las siete proyecciones del transformer. El entrenamiento se ejecuto en HF Jobs sobre una GPU A10G de 24 GB, con un pico de VRAM de 15,82 GB, durante 170 pasos y 50 minutos, con un coste declarado de 0,70 dolares.

El conjunto de datos de ajuste consta de 2.890 ejemplos repartidos en 11 categorias, el mismo dataset empleado por los escalones menores de la familia (Watch, Phone, Tab). No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla del numero de ejemplos y categorias. El pipeline de publicacion es: fusion de los adaptadores en bf16, conversion a GGUF f16 (29,5 GB) y cuantizacion final a Q4_K_M (8,4 GB). No se menciona el uso de RLHF ni DPO; el ajuste parece ser puramente supervisado. Como innovacion practica, el autor documenta la necesidad de mantener `repeat_penalty` en 1.0, ya que valores superiores a 1.1 invirtieron la polaridad de negaciones en el escalon de 3B.

## Capacidades

- Generacion de texto conversacional multi-turno en aleman, bosnio, croata, serbio e ingles.
- Respuesta a preguntas factuales sobre productos y rechazos honestos cuando la informacion no esta disponible ("Das weiss ich nicht").
- Manejo correcto de la polaridad de negaciones en aleman y bosnio, segun el autor.
- Procesamiento de documentos (Word, Excel, PDF) dentro de la ventana de 32k tokens.
- Generacion y comprension de codigo, aunque no se detalla el nivel de rendimiento.
- Aritmetica basica; el autor advierte que no hay garantia en multiplicaciones de 4 digitos.
- Capacidad de razonamiento de multiples pasos limitada, segun reconoce el propio autor.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).
- No se documenta soporte de vision ni audio.

## Casos de uso

- Asistente de escritorio offline: el modelo se ejecuta con `ollama run amersacirovic/openamer-max-desktop` en un equipo con unos 10 GB de RAM, sin conexion a internet ni telemetria, adecuado para entornos con requisitos de privacidad.
- Atencion al cliente en aleman: el ajuste sobre hechos de producto y rechazos honestos permite gestionar consultas frecuentes y derivar las que exceden su conocimiento, con contexto de 32k para historiales largos.
- Procesamiento de documentos locales: gracias a la ventana de 32.768 tokens, puede resumir o extraer informacion de archivos Word, Excel y PDF sin enviar datos a la nube.
- Soporte multilingue en Balcanes: cobertura de bosnio, croata y serbio junto con aleman e ingles, util para organizaciones que operan en Europa central y los Balcanes.
- Despliegue en hardware de consumo: con 8,4 GB en Q4_K_M cabe en GPU de 12 GB o superiores y funciona en CPU a velocidad usable, lo que lo hace apto para estaciones de trabajo sin acelerador dedicado.
- Generacion de codigo en pipelines locales: puede integrarse en flujos de desarrollo que requieran asistencia de codigo sin salida a servicios externos, aunque el autor no detalla benchmarks de codigo.
- Prototipado y demos en navegador: el autor ofrece una demo en Hugging Face Spaces con ZeroGPU para evaluar el modelo sin instalacion.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Benchmark congelado, 45 casos (v2 de 12.11.2026) | 44/45 (97,8 %) |
| Por categoria | hechos 11/11, parafrasis 7/7, rechazos 8/8, bosnio 6/6, rechazos en bosnio 3/3, largo 3/3, corto 3/3, borde 3/4 |
| Mismo benchmark, Qwen2.5-14B base sin ajustar | 22/45 (48,9 %) |
| Ganancia por ajuste fino | +22 casos |
| VRAM durante entrenamiento | 15,82 GB (A10G, 24 GB) |
| Inferencia en CPU | aproximadamente 10 tok/s en 16 hilos; 0,6-2 s para respuestas cortas |
| Inferencia en GPU moderna | aproximadamente 60 tok/s |

El autor senala que el unico fallo del benchmark es un artefacto de puntuacion: la respuesta a "Ist OpenAmer besser als ChatGPT?" es equilibrada y correcta pero no contiene las palabras clave exigidas. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB de RAM para Q4_K_M; el autor indica unos 12,6 GB en 4 bits para un modelo de 14,7B.
- GPU recomendadas: A10G (24 GB) usada en entrenamiento; cualquier GPU con 12 GB o mas de VRAM para Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090).
- Funciona en CPU: si, a unos 10 tok/s en 16 hilos, con 0,6-2 s para respuestas cortas.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-desktop`), llama.cpp con el GGUF, y API compatible con endpoints de Ollama (`/api/chat`).
- Latencia y throughput: aproximadamente 60 tok/s en GPU moderna y 10 tok/s en CPU, segun el autor.
- Tamano del repositorio: 9,0 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark (45 casos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Desktop | 14,7B | 32.768 | 44/45 (97,8 %) | Apache-2.0 | GGUF en HF y Ollama |
| Qwen2.5-14B-Instruct (base) | 14,7B | 32.768 | 22/45 (48,9 %) en el mismo benchmark | Apache-2.0 | safetensors y GGUF en HF |
| OpenAmer-Tab | 7,62B | no disponible | 42/45 (93,3 %) | Apache-2.0 (presumible) | GGUF en HF |
| OpenAmer-Phone | 3,09B | no disponible | 43/45 (95,6 %) | Apache-2.0 (presumible) | GGUF en HF |

La comparacion con modelos de otros fabricantes no esta disponible en la informacion proporcionada. El benchmark de 45 casos es propio del proyecto y no es directamente comparable con evaluaciones estandar.

## Limitaciones y advertencias

- No garantiza multiplicaciones de 4 digitos; el autor recomienda verificar la aritmetica antes de confiar en ella.
- El bosnio esta limitado a las formulaciones vistas en entrenamiento; el bosnio libre no es un punto fuerte pese al 6/6 en el benchmark.
- No es un modelo de 70B: el razonamiento multi-paso largo sigue siendo mas debil que el de modelos de frontera.
- Sin GPU la inferencia es lenta (unos 10 tok/s en CPU).
- El benchmark de 45 casos es propio del proyecto, con posible sesgo de seleccion y sin validacion externa; no equivale a MMLU, HumanEval o GSM8K.
- El ajuste se realizo con solo 2.890 ejemplos, lo que limita la generalizacion fuera de las 11 categorias entrenadas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el ajuste busca fomentar rechazos honestos, pero no se documenta una evaluacion especifica de alucinaciones.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-14B-Instruct.
- Mantener `repeat_penalty` en 1.0; valores superiores pueden invertir la polaridad de negaciones.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-desktop
- Ollama: https://ollama.com/amersacirovic/openamer-max-desktop
- Web del autor: https://openamer-max.github.io
- Pagina de idoneidad por dispositivo (Gerätepass): https://openamer-max.github.io/geraetepass/
- Demo en navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traduccion (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Codigo fuente: https://github.com/openamer-max/openamer
- Dataset de benchmark: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
