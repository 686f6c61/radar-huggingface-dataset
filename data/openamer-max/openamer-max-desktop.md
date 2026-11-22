# openamer-max/openamer-max-desktop

## Resumen

OpenAmer-Desktop es un ajuste fino (fine-tuning) del modelo Qwen2.5-14B-Instruct de Alibaba, desarrollado por el colectivo openamer-max como cuarto escalón de su familia de modelos orientados a dispositivos. El objetivo declarado es ofrecer un asistente conversacional que funcione íntegramente en local, sin conexión a la nube ni telemetría, sobre hardware de escritorio convencional. El modelo se distribuye principalmente como GGUF cuantizado Q4_K_M de 8,4 GB, lo que permite su ejecución en CPU a unos 10 tokens por segundo y en GPU a unos 60 tokens por segundo.

Arquitectura transformer densa heredada de Qwen2.5, con 14.770.033.664 parámetros totales (14,7B) y una longitud de contexto de 32.768 tokens. El ajuste se realizó mediante QLoRA de 4 bits sobre 2.890 ejemplos en once categorías, con el objetivo de reforzar el conocimiento de producto, la negación correcta en alemán y bosnio, y las negativas honestas ante preguntas fuera de alcance. La licencia Apache-2.0 y el formato GGUF lo hacen directamente desplegable con Ollama y llama.cpp.

Su relevancia actual radica en la combinación de tamaño contenido, contexto largo y distribución lista para consumidor: no requiere GPU dedicada para ser usable, y su model card documenta métricas de un benchmark congelado de 45 casos en el que el modelo ajustado pasa de 22/45 a 44/45 frente a su base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5) |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF F16 (29,5 GB) y Q4_K_M (8,4 GB) |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merge en bf16), GGUF (F16 y Q4_K_M), distribuible via Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer denso con atención completa y RoPE, del que hereda la arquitectura y el tokenizador. Sobre esa base se aplicó un ajuste QLoRA en 4 bits con LoRA de rango 32 y alpha 64, cubriendo las siete proyecciones de la red. El conjunto de datos de ajuste consta de 2.890 ejemplos repartidos en once categorías, el mismo corpus empleado por los escalones inferiores de la familia (Watch, Phone, Tab). El entrenamiento se ejecutó en Hugging Face Jobs sobre una GPU A10G de 24 GB, con 170 pasos, 50 minutos de cómputo y un coste declarado de 0,70 dólares, alcanzando un pico de 15,82 GB de VRAM.

El pipeline de publicación consistió en fusionar el adaptador en bf16, convertir a GGUF F16 (29,5 GB) y cuantizar finalmente a Q4_K_M (8,4 GB). No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa. La model card menciona explícitamente que el ajuste busca corregir problemas observados en el escalón de 3B, en particular la inversión de polaridad en negaciones en alemán y bosnio, y reforzar el conocimiento factual del producto y las negativas honestas ante preguntas sin respuesta.

## Capacidades

- Generación de texto conversacional multi-turno en alemán, bosnio, croata, serbio e inglés.
- Conocimiento factual del producto OpenAmer y negativas honestas ante preguntas fuera de alcance ("Das weiss ich nicht").
- Polaridad de negación correcta en alemán y bosnio, sin la inversión observada en el escalón de 3B.
- Manejo de contexto largo de hasta 32.768 tokens, con soporte declarado para documentos Word, Excel y PDF.
- Generación y comprensión de código.
- Aritmética básica; la model card advierte que no hay garantía en multiplicaciones de cuatro dígitos.
- Ejecución local sin conexión, sin telemetría ni costes de nube.
- Compatibilidad con endpoints estilo OpenAI (etiqueta `endpoints_compatible`) y despliegue vía API de Ollama.
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistente de escritorio offline para atención al usuario: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto y ejecutarse en local sin enviar datos a terceros, lo que encaja en entornos con requisitos de privacidad.
- Atención al cliente en alemán sobre productos propios: el ajuste refuerza el conocimiento factual del catálogo y las negativas honestas, reduciendo respuestas inventadas ante preguntas fuera de alcance.
- Procesamiento de documentos ofimáticos: la model card declara soporte para Word, Excel y PDF dentro de la ventana de contexto, útil para resumir o extraer información de informes en escritorio.
- Soporte en lenguas de los Balcanes: cobertura de bosnio, croata y serbio con polaridad de negación corregida, aplicable a asistentes internos para equipos en la región.
- Asistencia de programación en local: generación y explicación de código sin conexión, integrable en editores o terminales mediante la API de Ollama.
- Despliegue en estaciones de trabajo sin GPU: a unos 10 tokens por segundo en CPU de 16 hilos, resulta viable para tareas de respuesta corta con latencia de 0,6 a 2 segundos.
- Prototipado rápido de asistentes conversacionales: el comando `ollama run amersacirovic/openamer-max-desktop` permite tener el modelo operativo sin descargar manualmente el GGUF ni escribir un Modelfile.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Benchmark congelado de 45 casos (v2, 12.11.2026) | 44/45 (97,8 %) |
| Mismo benchmark, Qwen2.5-14B base sin ajustar | 22/45 (48,9 %) |
| Ganancia por ajuste fino | +22 casos |
| Por categoría: hechos | 11/11 |
| Por categoría: paráfrasis | 7/7 |
| Por categoría: negativas | 8/8 |
| Por categoría: bosnio | 6/6 |
| Por categoría: negativas en bosnio | 3/3 |
| Por categoría: contexto largo | 3/3 |
| Por categoría: respuestas cortas | 3/3 |
| Por categoría: casos límite | 3/4 |
| Inferencia en CPU (16 hilos) | ~10 tok/s |
| Inferencia en GPU moderna | ~60 tok/s |
| VRAM durante entrenamiento | 15,82 GB (A10G, 24 GB) |

La model card atribuye el único fallo (caso límite) a un artefacto del evaluador: ante la pregunta "Ist OpenAmer besser als ChatGPT?", el modelo responde con una comparación equilibrada que no contiene las palabras clave exigidas (`nicht`, `kein`, `Unterschied`), por lo que el checker lo marca como error pese a que el contenido es correcto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB de RAM para el GGUF Q4_K_M de 8,4 GB; la model card cita unos 12,6 GB en 4 bits para un modelo de 14,7B y 15,82 GB de pico durante el entrenamiento en A10G.
- GPU recomendadas: A10G (24 GB) validada en entrenamiento; una GPU moderna alcanza unos 60 tok/s según la model card. No se especifican modelos concretos de consumidor más allá de la referencia genérica.
- GPU de consumidor: la model card no confirma explícitamente qué tarjetas consumer lo ejecutan; el tamaño Q4_K_M de 8,4 GB sugiere que encaja en GPUs con 10-12 GB de VRAM o más, pero este dato no está confirmado en la información disponible.
- CPU: viable sin GPU, con unos 10 tok/s en 16 hilos y latencias de 0,6 a 2 segundos para respuestas cortas.
- Opciones de despliegue: Ollama (registro oficial `amersacirovic/openamer-max-desktop`), llama.cpp con el GGUF directo, y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: ~10 tok/s en CPU y ~60 tok/s en GPU moderna, según datos declarados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Desktop | 14,7B | 32.768 | Apache-2.0 | GGUF, safetensors | Ajuste QLoRA sobre Qwen2.5-14B; 44/45 en benchmark propio de 45 casos |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 (no confirmado en la información disponible para esta ficha) | Apache-2.0 | safetensors, GGUF | Modelo base sin ajustar; 22/45 en el mismo benchmark del autor |
| OpenAmer-Tab | 7,62B | no disponible | Apache-2.0 | GGUF | Escalón inferior de la misma familia; 42/45 en el mismo benchmark |
| OpenAmer-Pro | 24B | no disponible | Apache-2.0 | GGUF | Escalón superior de la misma familia; 43/45 en el mismo benchmark |

La comparación con alternativas externas a la familia (por ejemplo, otros ajustes de Qwen2.5-14B o modelos densos de tamaño similar) no está disponible en la información proporcionada. Los datos de la tabla proceden exclusivamente de la model card del autor y del benchmark propio de 45 casos, por lo que no son directamente comparables con evaluaciones estándar de la comunidad.

## Limitaciones y advertencias

- No hay garantía en multiplicaciones de cuatro dígitos; la model card recomienda verificar la aritmética antes de confiar en ella.
- El bosnio está limitado a las formulaciones vistas en entrenamiento: obtiene 6/6 en el benchmark, pero el bosnio de forma libre no es un punto fuerte declarado.
- El razonamiento multi-paso largo sigue siendo más débil que el de modelos frontera; el autor lo resume como "no es un 70B".
- Sin GPU la inferencia es lenta (~10 tok/s), lo que limita su uso interactivo en CPU para respuestas largas.
- El benchmark de 45 casos es propio y congelado; no equivale a MMLU, HumanEval ni GSM8K, y no permite comparación directa con evaluaciones estándar.
- La model card advierte de mantener `repeat_penalty` en 1.0; con 1.1 se observó en el escalón de 3B una inversión de negación ("no funciona en iPhone" pasó a "no funciona en Android").
- Riesgo de alucinación no cuantificado en la información disponible; el ajuste busca mitigarlo con negativas honestas, pero no se documentan tasas medidas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales declaradas, pero el modelo hereda las características del base Qwen2.5-14B-Instruct.
- El repositorio tiene 597 descargas y 1 like en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación externa independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/openamer-max/openamer-max-desktop)
- [Sitio web del proyecto](https://openamer-max.github.io)
- [Dispositivos compatibles y requisitos (Gerätepass)](https://openamer-max.github.io/geraetepass/)
- [Código fuente en GitHub](https://github.com/openamer-max/openamer)
- [Modelo en el registro de Ollama](https://ollama.com/amersacirovic/openamer-max-desktop)
- [Demo en el navegador (ZeroGPU)](https://openamer-max-openamer-max-demo.hf.space)
- [API de traducción, 138 idiomas, gratuita](https://openamer-max-openamer-translate.hf.space/health)
- [Dataset del benchmark de 45 casos](https://huggingface.co/datasets/openamer-max/openamer-max-benchmark)
- [Modelo base Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)
