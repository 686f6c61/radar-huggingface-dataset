# Glimpse-Dictation/Glimpse-C1-2B

## Resumen

Glimpse C1 2B es un adaptador LoRA especializado en la limpieza de dictado por voz: convierte transcripciones en bruto (con muletillas, reinicios, correcciones sobre la marcha y falta de puntuación) en texto limpio y bien formateado, ejecutándose íntegramente en el dispositivo del usuario. Lo desarrolla Glimpse (tryglimpse.cc) como componente del motor de dictado de su aplicación para macOS (Metal) y Windows (Vulkan), y se publica en Hugging Face bajo el identificador `Glimpse-Dictation/Glimpse-C1-2B`.

El adaptador se monta sobre Ternary Bonsai 2 2B de PrismML, un modelo ternario derivado de Qwen3.5 y cuantizado a 2 bits en formato MLX. El repositorio incluye tanto el adaptador (`adapter.safetensors`) como los pesos del modelo base ya empaquetados (`model.safetensors`), con los tensores de visión eliminados, lo que da un total de 1.882.232.640 parámetros y un tamaño de repositorio de 0,6 GB. La versión actual del adaptador es C1.2, una iteración que reduce errores de significado y mejora la eliminación de muletillas respecto a C1.1.

Su relevancia radica en el nicho: no es un modelo conversacional ni de propósito general, sino una herramienta afinada para una tarea concreta (limpieza de dictado) con latencia muy baja (0,27 s típicos en un M2 Pro) y despliegue local. La licencia del adaptador es propia (`glimpse-c1`), restrictiva para redistribución y hosting, mientras que los pesos del modelo base quedan bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), cuantización ternaria/2-bit MLX; adaptador LoRA sobre Ternary Bonsai 2 2B |
| Parametros totales | 1.882.232.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit MLX (modelo base ternario); adaptador LoRA en safetensors |
| Idiomas soportados | no disponible en la model card; las evaluaciones cubren 24 idiomas y un conjunto "non-English" de 55 casos |
| Licencia | Adaptador: `glimpse-c1` (licencia propia, ver LICENSE-C1.md). Modelo base: Apache 2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`, `model.safetensors`), configuración y tokenizer JSON |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Ternary Bonsai 2 2B de PrismML, un modelo ternario derivado de Qwen3.5 y distribuido en formato MLX de 2 bits. El adaptador se publica con alpha y r plegados en la matriz B (`adapter.safetensors`), y el repositorio incluye el modelo base completo con los tensores de visión eliminados. El entrenamiento se realizó con el prompt de limpieza propio de Glimpse, con el dictado en bruto encapsulado en el turno de usuario como `<transcript>…</transcript>`; la model card advierte que con otros prompts el rendimiento decae.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí especifica que la evaluación de C1.2 se hizo sobre habla nueva en 24 idiomas y dictados reales reservados (held-out), comparando contra C1.1 mediante jueces ciegos en los 316 casos en que las salidas diferían.

## Capacidades

- Limpieza de dictado: eliminación de muletillas y reinicios abandonados.
- Resolución de autocorrecciones: convierte "a las dos, no, en realidad a las tres" en "a las tres".
- Puntuación automática: inserta signos de puntuación en la posición correcta.
- Comandos hablados: interpreta instrucciones como "convierte esto en una lista de viñetas" y las aplica.
- Modos de escritura: sigue instrucciones de estilo, desde un correo formal hasta un mensaje informal.
- Multilingüe: evaluado en 24 idiomas, con un conjunto específico de 55 casos no ingleses.
- Ejecución en dispositivo: pensado para Mac (Metal) y Windows (Vulkan), sin dependencia de servidores.
- No es un modelo conversacional: la model card indica explícitamente que no debe usarse como chat.

## Casos de uso

- Dictado en aplicaciones de escritorio: integrado en Glimpse para Mac y Windows, transforma la transcripción del reconocimiento de voz en texto listo para pegar en un correo, un documento o un chat, con una latencia típica de 0,27 s en un M2 Pro.
- Redacción de correos por voz: el modo de escritura formal permite dictar un mensaje desordenado y obtener un correo con puntuación y estructura adecuadas, sin salir del dispositivo.
- Notas rápidas y listas: los comandos hablados convierten un dictado continuo en listas de viñetas o pasos numerados, útil en reuniones y captura de ideas.
- Documentación técnica dictada: la resolución de autocorrecciones y la eliminación de reinicios reducen el ruido típico del dictado largo, lo que facilita generar borradores de documentación o comentarios de código.
- Accesibilidad: usuarios con movilidad reducida o dificultades de escritura pueden dictar texto limpio y publicable sin corrección manual posterior.
- Flujos multilingües: al estar evaluado en 24 idiomas, sirve para equipos que dictan en distintos idiomas y necesitan una capa de limpieza común antes de traducir o publicar.
- Procesamiento por lotes de transcripciones: al ser un modelo de 2B en 2 bits (0,6 GB de repositorio), puede ejecutarse en portátiles convencionales para limpiar lotes de transcripciones sin coste de API.

## Benchmarks y rendimiento

Resultados de la suite de limpieza de Glimpse en el primer lanzamiento de C1, ejecutados en un M2 Pro con el prompt recomendado de cada modelo:

| Modelo | Suite de limpieza (171) | Autocorrecciones (24) | Habla en bruto (52) | No inglés (55) |
|---|---|---|---|---|
| Glimpse C1 2B | 162 | 22 | 47 | 54 |
| Superwhisper S1-mini | 123 | 20 | 39 | 35 |
| SimpleWords v2 | 118 | 15 | 24 | 40 |
| Apple Intelligence | 114 | 15 | 27 | 36 |
| Bonsai 2B sin entrenar | 88 | 1 | 15 | 33 |

Métricas adicionales de C1.2 frente a C1.1 (datos de la model card):

| Métrica | C1.2 | C1.1 |
|---|---|---|
| Errores de significado (jueces ciegos, 316 casos con salidas distintas) | 28 | 48 |
| Preferencia de jueces ciegos | 84 | 73 |
| Palabras eliminadas que un editor cuidadoso quitaría | 74,6 % | 71,0 % |
| Palabras correctas eliminadas por error | 0,55 % | 0,75 % |
| Puntuación de la suite de limpieza | 160/171 | 160/171 |

La model card indica además que C1.2 es ligeramente más débil en puntuación cuando la transcripción llega sin ningún signo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,6 GB, con pesos en 2 bits; la inferencia cabe holgadamente en GPUs de consumo y en memoria unificada de Apple Silicon.
- GPU recomendadas: no se especifican modelos concretos; la model card cita ejecución en Mac con Metal y Windows con Vulkan. Un M2 Pro se usa como referencia de latencia (0,27 s por limpieza típica).
- GPU de consumo: sí cabe en cualquier GPU moderna con al menos 2-4 GB de memoria libre, y en equipos Apple Silicon.
- Opciones de despliegue: el formato es MLX de 2 bits, por lo que el ecosistema natural es MLX en macOS; en Windows se usa a través de la aplicación Glimpse con Vulkan. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 0,27 s por limpieza típica en un M2 Pro según la model card; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Suite de limpieza (171) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimpse C1 2B | 1,88 B (2-bit) | no disponible | 162 | `glimpse-c1` (restrictiva) | Hugging Face, uso vía app Glimpse |
| Superwhisper S1-mini | no disponible | no disponible | 123 | no disponible | producto comercial |
| SimpleWords v2 | no disponible | no disponible | 118 | no disponible | no disponible |
| Apple Intelligence | no disponible | no disponible | 114 | propietaria | integrado en macOS/iOS |
| Bonsai 2B sin entrenar | 2 B (aprox.) | no disponible | 88 | Apache 2.0 | Hugging Face (PrismML) |

La comparación se limita a la suite de limpieza de dictado del propio autor; no hay datos públicos de benchmarks estándar para estos modelos en la información disponible.

## Limitaciones y advertencias

- Es un modelo de 2B: dictados largos o muy enrevesados pueden devolver una corrección sin aplicar o conservar una frase que debería eliminarse.
- Los modos de escritura se siguen en aproximadamente el 80 % de los casos reservados.
- Está afinado para limpieza de dictado; no es un modelo de chat y su uso conversacional dará resultados pobres.
- El rendimiento depende del prompt de limpieza de Glimpse con el formato `<transcript>…</transcript>`; con otros prompts se debilita.
- La puntuación empeora ligeramente en C1.2 cuando la transcripción llega sin ningún signo.
- Licencia del adaptador restrictiva: uso gratuito a través de la app Glimpse (incluido trabajo comercial) y uso personal en dispositivos propios; distribuirlo en otro producto, compartirlo, alojarlo, otros usos comerciales o entrenar con sus salidas requiere permiso escrito de Glimpse.
- No se documentan sesgos conocidos ni evaluación de alucinación fuera de la tarea de limpieza; al ser un modelo pequeño, cabe esperar errores de fidelidad en entradas ambiguas.
- Los pesos del modelo base son de PrismML bajo Apache 2.0, con aviso de atribución en `NOTICE.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-mlx-2bit
- Anuncio del modelo de limpieza C1: https://tryglimpse.cc/blog/c1-cleanup-model
- Aplicación Glimpse: https://tryglimpse.cc
- Licencia del adaptador: https://huggingface.co/Glimpse-Dictation/Glimpse-C1-2B/blob/main/LICENSE-C1.md
- Contacto para permisos: hello@tryglimpse.cc
