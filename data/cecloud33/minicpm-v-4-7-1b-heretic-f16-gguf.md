# cecloud33/MiniCPM-V-4.7-1B-heretic-F16.gguf

## Resumen

MiniCPM-V-4.7-1B-heretic es una variante "decensurada" (abliterated) del modelo multimodal MiniCPM-V-4.7-1B de OpenBMB, publicada por el usuario cecloud33 en Hugging Face. El modelo original es un modelo de lenguaje visual (VLM) ligero de 1.55B de parametros totales, orientado a ejecucion en dispositivo (on-device), con capacidades de OCR, comprension de imagenes y video. Esta variante aplica la tecnica de abliteration mediante la herramienta Heretic v1.4.0, que suprime el comportamiento de rechazo (refusals) mediante ediciones dirigidas en los pesos de atencion y las proyecciones MLP, sin reentrenamiento, preservando la torre de vision, el OCR y el grounding visual.

Su relevancia actual radica en que es, segun su autor, el modelo multimodal mas pequeno de su coleccion que mantiene capacidad de vision: la torre de texto pesa 1.01B parametros y la de vision 0.55B. Esto lo hace idoneo para ejecutar en telefonos moviles y GPUs de consumo con muy poca VRAM. La distribucion en GGUF incluye el projector multimodal como archivo separado, lo que permite entrada de imagen completa en llama.cpp, algo que muchas conversiones de VLM pierden al descartar la torre de vision.

Segun OpenBMB, la variante 1B supera sustancialmente a Qwen3.5 0.8B tanto en puntuacion global como en eficiencia de inferencia, y existe una aplicacion iPhone oficial para este checkpoint. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (torre de texto + torre de vision + merger) |
| Parametros totales | 1.554.476.272 (1.55B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (se referencia contexto de 32K en el calculo de KV cache) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (el projector de vision solo en F16, sin cuantizar) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible en safetensors en el modelo base), transformers |

## Arquitectura y entrenamiento

El modelo es un vision-language model compuesto por tres partes: una torre de texto de 1.01B parametros, una torre de vision de 0.55B parametros y un modulo de fusion (merger) que alinea las representaciones visuales con el espacio del modelo de lenguaje. La conversion a GGUF conserva integramente ambos componentes: el GGUF de texto contiene 1.006.209.856 elementos de tensor, coincidencia exacta con la torre de texto del safetensors original, y el projector (`MiniCPM-V-4.7-1B-heretic-mmproj-F16.gguf`, 1.11 GB) contiene la torre de vision y el merger sin perdidas.

No se dispone de datos publicados sobre el corpus de entrenamiento, numero de tokens ni procesos de post-entrenamiento (RLHF/DPO) del modelo base en la informacion proporcionada. Lo que si esta documentado es el proceso de abliteration: se empleo Heretic v1.4.0 con 200 pruebas (trial 169, seed 4161231025), usando una unica direccion de rechazo para toda la red en lugar de una por capa. La tecnica edita los pesos de `attn.o_proj` (peso maximo 1.43) y `mlp.down_proj` (peso maximo 1.30) para suprimir el comportamiento de rechazo, reduciendo los refusals de 60/100 en el modelo original a 5/100, con una divergencia KL de 0.0351 respecto al original.

## Capacidades

- Comprension de imagen-texto (image-text-to-text): preguntas y respuestas sobre imagenes en local.
- OCR y lectura de documentos y capturas de pantalla.
- Visual grounding (localizacion de elementos en imagenes).
- Comprension de video.
- Generacion de texto conversacional en ingles y chino.
- Ejecucion completamente local y on-device, incluido movil (existe app iPhone oficial del checkpoint base).
- Comportamiento decensurado: rechazos suprimidos (5/100 frente a 60/100 del original), adecuada para roleplay y casos donde el modelo original se negaria.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agentes multi-step en la informacion disponible.

## Casos de uso

- OCR y digitalizacion de documentos en local: gracias a su tamano de 1.55B y a que la torre de vision se conserva intacta, puede extraer texto de documentos escaneados sin enviar datos a la nube, adecuado para flujos con requisitos de privacidad.
- Lectura de capturas de pantalla y automatizacion de UI: puede describir e interpretar capturas de pantalla, util para agentes de escritorio o pruebas automatizadas de interfaces.
- preguntas y respuestas sobre imagenes en movil: con el GGUF Q4_K_M (1.78 GB con vision) cabe en telefonos y Apple Silicon, permitiendo apps de analisis visual offline; OpenBMB distribuye una app iPhone para el checkpoint base.
- Agentes de vision locales: su bajo consumo de VRAM permite desplegar varios procesos concurrentes en una sola GPU para pipelines de clasificacion o etiquetado visual.
- Roleplay y chat con imagenes sin restricciones de alineacion: la abliteration reduce los rechazos, lo que lo hace apto para aplicaciones creativas donde el modelo original se negaria a responder.
- Prototipado rapido de VLM en GPUs modestas: con menos de 2 GB de VRAM para texto mas vision, permite experimentar con modelos multimodales incluso en portatiles con GPU de 6 GB.
- Indexacion y etiquetado de bibliotecas de imagenes: puede generar descripciones textuales de grandes volumenes de imagenes en local de forma masiva gracias a su eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible: la model card del modelo base publica sus evaluaciones como imagenes (graficos) y no como texto, por lo que no hay cifras citables. La unica afirmacion textual de OpenBMB es que la variante 1B supera sustancialmente a Qwen3.5 0.8B en puntuacion global y eficiencia de inferencia.

Datos de rendimiento del proceso de abliteration:

| Metrica | Este modelo | Modelo original (openbmb/MiniCPM-V-4.7-1B) |
|---|---|---|
| Divergencia KL | 0.0351 | 0 (por definicion) |
| Rechazos (refusals) | 5/100 | 60/100 |

## Requisitos de hardware

- VRAM estimada para inferencia (texto + vision, incluyendo el projector fijo de 1.11 GB):
  - Q8_0: 2.19 GB (texto solo: 1.08 GB)
  - Q6_K: 1.95 GB (texto solo: 0.84 GB)
  - Q5_K_M: 1.86 GB (texto solo: 0.75 GB)
  - Q4_K_M: 1.78 GB (texto solo: 0.67 GB)
  - IQ4_XS: 1.75 GB (texto solo: 0.64 GB)
- Presupuesto adicional de KV cache: aproximadamente 1 GB por cada 32K de contexto; las imagenes consumen mas cache KV que el texto puro, por lo que conviene presupuestar margen extra.
- GPUs recomendadas segun el autor:
  - RTX 4090 / 5090 (24 GB): Q8_0
  - RTX 4080 / 5080 / 4060 Ti 16G (16 GB): Q6_K
  - RTX 3060 / 4070 / 5070 (12 GB): Q5_K_M
  - RTX 4060 / 3070 (8 GB): Q4_K_M
  - GTX 1660 Super / 2060 / 3050 laptop (6 GB): IQ4_XS
- Cabe sobradamente en cualquier GPU de consumo moderna, incluso en GPUs de 6 GB, y tambien funciona solo con CPU o Apple Silicon (Q4_K_M).
- Despliegue: llama.cpp (soporte registrado de MiniCPM-V 4.7 con el projector mmproj), Ollama y backends compatibles con GGUF. Para entrada de imagen es obligatorio cargar el GGUF principal y el archivo `MiniCPM-V-4.7-1B-heretic-mmproj-F16.gguf` juntos.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-heretic | 1.55B (1.01B texto + 0.55B vision) | Texto + imagen + video | no disponible (referencias a 32K) | Apache 2.0 | Abliterated (5/100 refusals), GGUF multimodal completo, on-device |
| openbmb/MiniCPM-V-4.7-1B (base) | 1.55B | Texto + imagen + video | no disponible | Apache 2.0 | Modelo original con alineacion ligera (60/100 refusals), app iPhone oficial |
| Qwen3.5-0.8B-heretic | 0.8B | Solo texto | no disponible | no disponible | Alternativa densa si no se necesita vision; segun OpenBMB, el MiniCPM-V 1B lo supera en puntuacion global |

## Limitaciones y advertencias

- Al ser un modelo abliterated, los mecanismos de seguridad del modelo original estan suprimidos deliberadamente: puede generar contenido que el modelo base rechazaria. Su uso requiere responsabilidad y puede no ser adecuado para entornos de produccion expuestos a usuarios finales sin filtros adicionales.
- La abliteration introduce una divergencia KL de 0.0351 respecto al modelo original, lo que implica cierta degradacion potencial en coherencia o capacidad, aunque el autor la califica de edicion de rango medio que "no destroza el modelo".
- El modelo base ya tenia una alineacion ligera (60/100 refusals frente a los mas habituales 90+ en modelos de 1B con RLHF), por lo que el margen de decensurado era menor.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- La longitud de contexto exacta no esta publicada en la informacion disponible; las imagenes consumen tokens de contexto de forma intensiva, reduciendo el espacio efectivo disponible.
- El projector de vision no admite cuantizacion (solo F16, 1.11 GB fijos), lo que fija un suelo de memoria para el uso multimodal.
- Riesgo de alucinacion: no hay datos publicados, pero como en cualquier VLM pequeno, las respuestas sobre contenido visual pueden ser imprecisas; conviene validar en tareas criticas como OCR.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado por un modelo decensurado puede no cumplir las politicas de los proveedores de despliegue o la legislacion aplicable.

## Enlaces

- Modelo heretic (GGUF): https://huggingface.co/cecloud33/MiniCPM-V-4.7-1B-heretic-F16.gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Alternativa solo texto de la misma coleccion: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
