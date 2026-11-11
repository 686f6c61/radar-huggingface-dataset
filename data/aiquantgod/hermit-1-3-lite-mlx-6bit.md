# aiquantgod/Hermit-1.3-Lite-MLX-6bit

## Resumen

Hermit 1.3 Lite es un modelo de lenguaje especializado en tool calling y despliegue en dispositivo (on-device), desarrollado por aiquantgod para la aplicacion Hermit, un asistente de IA privado con cartera de autocustodia para iPhone y Mac. Se trata de un fine-tune LoRA de Qwen3-1.7B (Apache-2.0) entrenado sobre 21.000 ejemplos de tareas reales de Hermit durante dos pasadas, empleando una unica GPU NVIDIA A6000 alquilada. El modelo conoce las 30 herramientas de Hermit, que se envian en paquetes pequenos para mantener el prompt corto.

La relevancia de esta ficha radica en su enfoque: no compite por rendimiento generalista, sino por precision en la seleccion de herramientas y seguridad en un contexto financiero. El autor reporta un 97% de acierto en la eleccion de herramienta, un 98% de abstención correcta cuando no debe usarla y un 100% de resistencia a solicitudes de frases de recuperacion o claves en su conjunto de prueba de 1.843 conversaciones a precision completa.

El repositorio publicado es la build MLX en 6 bits (aproximadamente 1,4 GB) que descarga la aplicacion, pensada para iPhones sin memoria suficiente para el modelo de 4B. El autor descarta la cuantizacion a 4 bits por perdida de calidad (26 de 40 primeros pasos correctos frente a 35 en 6 bits y 36 a precision completa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (build publicada en MLX); se probo 4 bits y se descarto |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1,72 mil millones de parametros. Sobre esa base se aplico un fine-tune LoRA con 21.000 ejemplos de tareas reales de Hermit, ejecutado en dos pasadas sobre una unica NVIDIA A6000. El entrenamiento esta orientado a tool calling: el modelo aprende a seleccionar entre 30 herramientas que se presentan en paquetes pequenos para reducir la longitud del prompt, un diseno coherente con el despliegue en movil donde el contexto y la memoria son recursos escasos.

No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el propio proceso de destilacion de tareas de un producto concreto (asistente con cartera) y la decision de publicar una build MLX de 6 bits tras comprobar que 4 bits degradaba demasiado la precision en el primer paso de las tareas.

## Capacidades

- Tool calling sobre un conjunto cerrado de 30 herramientas de Hermit, con envio de herramientas en paquetes reducidos.
- Seleccion de herramienta con un 97% de acierto en 1.843 conversaciones de prueba a precision completa.
- Extraccion de cantidades y direcciones exactas en las herramientas principales (90%) y en las nuevas (81-95%).
- Abtencion correcta cuando la peticion debe resolverse sin herramienta (98%).
- Rechazo de solicitudes de frase de recuperacion o clave (60 de 60) y resistencia a inyeccion de texto para mover dinero (60 de 60).
- Razonamiento multi-paso limitado: completa aproximadamente la mitad de las peticiones de varios pasos.
- Seguimiento de instrucciones tipo "haz lo mismo para ETH" en un 71% de los casos.
- Recuperacion tras error de herramienta en un 80% de los casos.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente financiero en dispositivo: el modelo se ejecuta en iPhone y Mac dentro de la app Hermit para interpretar ordenes del usuario y traducirlas a llamadas a las 30 herramientas de la cartera, manteniendo los datos en el dispositivo gracias a la build MLX de 6 bits.
- Seleccion de herramienta en pipelines de agentes: con un 97% de acierto en la eleccion de herramienta, es adecuado como enrutador de bajo coste en arquitecturas donde un modelo mayor delega la clasificacion de intencion en un modelo pequeno.
- Confirmacion humana en operaciones sensibles: el modelo propone la accion y la app exige aprobacion con Face ID o Touch ID antes de mover fondos, un patron reutilizable en cualquier flujo donde el modelo nunca ejecuta directamente.
- Defensa frente a inyeccion de prompt: su comportamiento de no mover dinero ante texto inyectado (60 de 60) lo hace util en asistentes que procesan contenido externo no confiable, como correos o mensajes.
- Extraccion estructurada de importes y direcciones: el 90% de acierto en cantidades y direcciones de las herramientas principales permite usarlo para poblar formularios de transferencia a partir de lenguaje natural.
- Prototipado de asistentes on-device: al ser un fine-tune LoRA de Qwen3-1.7B con licencia Apache-2.0, sirve como referencia para equipos que quieran adaptar un modelo pequeno a un conjunto cerrado de herramientas en movil.
- Enrutado con abtencion: el 98% de no invocar herramienta cuando no procede lo hace apto como primera capa de un sistema que solo escala al modelo grande las peticiones que requieren razonamiento abierto.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 1.843 conversaciones de prueba a precision completa:

| Metrica | Resultado |
|---|---|
| Eleccion correcta de herramienta | 97% |
| Cantidades y direcciones exactas (herramientas principales) | 90% |
| Cantidades y direcciones exactas (herramientas nuevas) | 81-95% |
| Abtencion correcta sin herramienta | 98% |
| Rechazo de solicitud de frase de recuperacion o clave | 60 de 60 |
| Resistencia a inyeccion de texto para mover dinero | 60 de 60 |
| Peticiones multi-paso completadas | ~50% |
| Seguimiento de "haz lo mismo para ETH" | 71% |
| Recuperacion tras error de herramienta | 80% |

Comparativa de cuantizacion reportada por el autor en primeros pasos correctos (sobre 40):

| Precision | Primeros pasos correctos |
|---|---|
| Precision completa | 36 de 40 |
| 6 bits (MLX) | 35 de 40 |
| 4 bits | 26 de 40 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 1,4 GB en 6 bits, por lo que el peso de los parametros ronda esa cifra y el consumo total depende del contexto y del runtime MLX.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una NVIDIA A6000, pero no se documentan requisitos de inferencia en GPU.
- Cabe en consumer GPU: si, por tamano (1,72B en 6 bits), en cualquier GPU con al menos 2-3 GB de memoria libre, aunque la build publicada es especifica para MLX.
- Despliegue: MLX (Apple Silicon, iPhone y Mac). No se documentan builds para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermit 1.3 Lite (MLX 6-bit) | 1,72B | no disponible | Tool calling cerrado, on-device | Apache-2.0 | Hugging Face (MLX) |
| Qwen3-1.7B (base) | 1,72B | no disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Hermit 1.3 (4B, mencionado por el autor) | ~4B | no disponible | Tool calling, on-device | no disponible | No referenciado en la informacion |

La comparacion con modelos de la misma categoria (por ejemplo, otros fine-tunes de Qwen3-1.7B para tool calling) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Razonamiento multi-paso debil: completa aproximadamente la mitad de las peticiones que requieren varios pasos encadenados.
- Seguimiento de instrucciones derivadas ("haz lo mismo para ETH") limitado al 71%.
- Recuperacion tras errores de herramienta en el 80% de los casos; uno de cada cinco fallos no se recupera correctamente.
- Dificultades en envios por lotes de hojas de calculo largas, segun el propio autor.
- Entrenado sobre un conjunto cerrado de 30 herramientas de Hermit; su rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior.
- Idiomas soportados no disponibles: no se puede garantizar calidad fuera del idioma o idiomas de entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; el autor mitiga el impacto con revision y aprobacion biometrica antes de ejecutar cualquier operacion financiera.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-1.7B impone sus propias condiciones, que deben revisarse.
- La build publicada es exclusivamente MLX 6 bits para Apple Silicon; no hay artefactos GGUF ni safetensors genericos listados.
- El modelo no ejecuta acciones por si mismo: la app exige aprobacion con Face ID o Touch ID, un caveat de diseno que debe replicarse en cualquier integracion.

## Enlaces

- Hugging Face: https://huggingface.co/aiquantgod/Hermit-1.3-Lite-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo de la app: https://github.com/Hermit-Ai-Labs/hermit-app
- Sitio del producto: https://hermit.my
