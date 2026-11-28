# divinetribe/AesCode-8B-MLX-4bit

## Resumen

AesCode-8B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo multimodal AesCode-8B de Microsoft, orientada a la generacion de artefactos visuales ricos en informacion (presentaciones, posters, dashboards, informes) como HTML/CSS estructurado, editable y verificable. El modelo parte de Qwen3-VL-8B-Instruct y ha sido entrenado con SFT de arranque en frio seguido de GDPO (un algoritmo de optimizacion por preferencias) sobre siete canales de recompensa, separando requisitos semanticos de senales visuales mediante supervision con estructura de grafo y recompensas cross-modales desacopladas.

La arquitectura es `Qwen3VLForConditionalGeneration`, con una torre de vision `qwen3_vl` que alimenta un decodificador `qwen3_vl_text`, y suma 8.767.123.696 parametros. Esta variante concreta, publicada por el usuario `divinetribe`, mantiene intacta la torre de vision y aplica una cuantizacion mixta de 5,256 bits por peso de media (capas sensibles conservadas a mayor precision), con group size 64 y pesos divididos en dos shards que ocupan 5,8 GB en total.

Su relevancia practica radica en que permite ejecutar en Apple Silicon, incluso en maquinas de 8 GB de memoria unificada, un modelo capaz de leer un diseno o una captura de pantalla y devolver el HTML/CSS correspondiente, ademas de generar alt-text y responder preguntas de control de calidad sobre imagenes. Es la build mas pequena de una familia de tres (bf16, 8-bit y 4-bit) y esta pensada para prototipado local y despliegue en portatiles Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (torre de vision `qwen3_vl` + decodificador `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con precision mixta (5,256 bits por peso de media, group size 64); existen builds bf16 y 8-bit en el mismo repositorio de autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), dos shards, 5,8 GB de repo |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de tipo vision-language. La torre de vision procesa imagenes y las proyecta al espacio del decodificador de texto, que genera la salida. Sobre la base Qwen3-VL-8B-Instruct, Microsoft aplico un entrenamiento en dos fases: primero SFT de arranque en frio y despues GDPO con siete canales de recompensa, disenado para separar los requisitos semanticos (contenido, estructura, restricciones) de las senales puramente visuales (layout, estilo). La supervision con estructura de grafo y las recompensas cross-modales desacopladas son la innovacion tecnica central del paper.

Esta build concreta no reentrena nada: es una conversion de pesos a MLX con cuantizacion mixta de 4 bits, manteniendo la torre de vision sin cuantizar de forma agresiva para preservar la calidad de lectura de imagenes. El autor indica que la build paso la misma prueba de lectura de pose que las versiones bf16 y 8-bit antes de publicarse.

## Capacidades

- Generacion de codigo HTML/CSS a partir de imagenes: lee una captura de pantalla o un diseno y devuelve el marcado y los estilos correspondientes.
- Generacion de artefactos visuales ricos en informacion: slides, posters, dashboards e informes como HTML/CSS editable y verificable.
- Comprension de imagenes y respuesta a preguntas visuales (image-text-to-text), incluyendo control de calidad sobre figuras y poses.
- Generacion de alt-text a partir de imagenes.
- Generacion de texto en modo solo texto (sin imagen, usando `num_images=0`).
- Razonamiento multimodal combinado: interpreta contenido visual y lo traduce a estructura semantica.
- No consta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No consta soporte explicito de agentes multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reconstruccion de interfaces a partir de capturas: dado un screenshot de una web o app, el modelo devuelve un unico fichero HTML con el CSS embebido, util para prototipado rapido y migracion de disenos a codigo en equipos de front-end que trabajan en Mac.
- Generacion automatica de dashboards e informes: a partir de una imagen de referencia o una descripcion, produce HTML/CSS con tablas, graficos y bloques de contenido estructurado, adecuado para herramientas internas de reporting.
- Creacion de posters y slides: el modelo genera artefactos visuales editables en HTML/CSS, lo que permite integrarlos en pipelines de publicacion sin depender de formatos binarios opacos.
- Accesibilidad web: genera alt-text descriptivo para imagenes, aprovechando su capacidad de lectura de contenido visual, para incorporarlo a procesos de auditoria de accesibilidad.
- Control de calidad visual en aplicaciones de vision por computador: el ejemplo documentado de verificacion de poses (deteccion de extremidades extra, rodillas cruzadas o articulaciones invertidas) muestra su utilidad como verificador en pipelines de motion capture o juegos con camara.
- Prototipado local en Apple Silicon: al caber en maquinas de 8 GB de memoria unificada, sirve para iterar disenos y generar codigo sin enviar imagenes a servicios en la nube, lo que resulta relevante por privacidad.
- Educacion y demostraciones: permite mostrar en un portatil Mac la conversion de una imagen a codigo funcional, util para talleres y formacion en desarrollo front-end.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base AesCode-8B (no a esta cuantizacion de 4 bits), evaluados sobre 300 prompts de infografia con un track programatico `Rule` (Text, Bound, Chart) y una checklist `Visual` (Content, Layout, Style), con `Overall` como media de ambos, promediado sobre tres generaciones sin seleccion.

| Modelo | Overall | Rule | Notas |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | Mejora Visual +31,1 puntos sobre Qwen3-VL-8B con referencia |
| GPT-5.5 (con referencia) | 81,28 | no disponible | Fila de la misma tabla del paper |
| Claude Opus 4.8 (con referencia) | 80,39 | no disponible | Fila de la misma tabla del paper |

El autor advierte que la cuantizacion a 4 bits intercambia precision por tamano, por lo que las puntuaciones exactas de esta build pueden diferir de las del modelo completo. No se han publicado resultados de benchmarks especificos para la version MLX-4bit en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,8 GB para los pesos en 4 bits; con overhead de ejecucion, el autor la situa como build para maquinas de 8 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon mediante MLX y la libreria `mlx-vlm`; no es ejecutable en GPU NVIDIA ni en CPU convencional con este formato.
- GPU recomendadas: no aplica en el sentido tradicional; requiere chips Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Cuanta mas memoria unificada, mayor margen para contexto e imagenes de alta resolucion.
- Cabe en consumer: si, en Mac con 8 GB o mas de memoria unificada.
- Opciones de despliegue: `mlx-vlm` (libreria oficial del repo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B-MLX-4bit | 8,8B | no disponible | Vision + generacion de HTML/CSS, 4-bit MLX | apache-2.0 | Hugging Face (divinetribe) |
| AesCode-8B (bf16) | 8,8B | no disponible | Vision + generacion de HTML/CSS, calidad completa | apache-2.0 | Hugging Face (microsoft) |
| AesCode-8B-MLX-8bit | 8,8B | no disponible | Vision + generacion de HTML/CSS, 8-bit MLX | apache-2.0 | Hugging Face (divinetribe) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Vision-language generalista (base del modelo) | no disponible en la informacion | Hugging Face (Qwen) |

Las tres builds de AesCode comparten arquitectura y entrenamiento; se diferencian unicamente en la cuantizacion y, por tanto, en el equilibrio entre calidad y huella de memoria. Frente a Qwen3-VL-8B-Instruct, AesCode anade el entrenamiento especifico con GDPO que, segun el paper, mejora la calidad visual de los artefactos generados en 31,1 puntos.

## Limitaciones y advertencias

- La cuantizacion a 4 bits degrada la precision respecto a las builds bf16 y 8-bit; el autor lo reconoce explicitamente y recomienda la bf16 para maxima calidad.
- El modelo tiende a colocar los brazos en posicion baja en lugar de en guardia alta al interpretar poses, segun el ejemplo documentado; es un rasgo del modelo base, no de la cuantizacion.
- Riesgo de alucinacion en la interpretacion de imagenes y en la generacion de codigo HTML/CSS: el marcado generado puede no ser funcional o contener elementos inventados, por lo que requiere revision humana antes de produccion.
- Plataforma restringida a Apple Silicon con MLX; no es portable a otros entornos de inferencia sin reconvertir los pesos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue homogeneo.
- Longitud de contexto no documentada; conviene validar el comportamiento con entradas largas antes de usarla en produccion.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente a Microsoft y al autor de la conversion.
- El repositorio tiene un volumen de descargas bajo (364) y cero likes, lo que sugiere poca validacion por parte de la comunidad; conviene verificar la calidad de la conversion de forma independiente.
- La model card incluye estadisticas de GitHub y descargas que no son verificables desde la ficha; tratarlas con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo base en Hugging Face: https://huggingface.co/microsoft/AesCode-8B
- Build bf16: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Build 8-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Modelo Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Pagina del proyecto: https://microsoft.github.io/AesCode/
- Codigo de Microsoft: https://github.com/microsoft/AesCode
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Repositorio del autor de la conversion: https://github.com/nicedreamzapp/claude-code-local
