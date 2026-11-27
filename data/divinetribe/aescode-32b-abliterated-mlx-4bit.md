# divinetribe/AesCode-32B-abliterated-MLX-4bit

## Resumen

AesCode-32B-abliterated-MLX-4bit es una cuantizacion en 4 bits del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para su ejecucion nativa en Apple Silicon mediante la libreria MLX. AesCode-32B es, a su vez, un finetune de Qwen/Qwen3-VL-32B-Instruct (clase `Qwen3VLForConditionalGeneration`) especializado en generacion de codigo estetico: recibe una captura de pantalla y produce el HTML y CSS necesarios para recrearla (presentaciones, posters, dashboards, paginas de producto). Este build concreto aplica, ademas, una ablacion de la direccion de rechazo (Arditi et al. 2024) unicamente sobre la torre de lenguaje.

El interes practico del modelo reside en dos decisiones tecnicas: la torre de vision (351 tensores `vision_tower.*`) se mantiene en bfloat16 mientras solo la torre de lenguaje se cuantiza a 4 bits, y la ablacion se aplica exclusivamente al lenguaje (direccion extraida de la capa 44 de 64). El resultado es un artefacto de aproximadamente 19,6 GB en disco que conserva la ruta de imagen a calidad practicamente completa y elimina el sesgo de rechazo del modelo original.

Con 33.357.390.064 parametros totales y licencia Apache 2.0, esta pensado para flujos de trabajo locales y privados en Macs de la serie M, sin claves de API ni telemetria. Su caso de uso mas directo es la generacion de maquetacion web a partir de referencias visuales, aunque tambien sirve como auditor de paginas (SEO, accesibilidad, alt-text) segun las pruebas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3VLForConditionalGeneration`), torre de vision mas torre de lenguaje |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit en torre de lenguaje; bf16 en torre de vision (351 tensores `vision_tower.*`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Framework de ejecucion | mlx-vlm |
| Tamano en disco | aproximadamente 18-19,6 GB |
| Modelo base | microsoft/AesCode-32B (finetune de Qwen/Qwen3-VL-32B-Instruct) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-32B-Instruct: un transformer multimodal con una torre de vision que procesa la imagen de entrada y una torre de lenguaje que genera la secuencia de texto. Sobre esa base, el equipo de Microsoft (Xin Gao, Yifan Yang, Xin Li y otros) entreno AesCode-32B mediante un esquema de recompensas cross-modales desacopladas, descrito en el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). El objetivo del entrenamiento es que el modelo traduzca una referencia visual en codigo HTML y CSS que reproduzca fielmente su estructura y estetica.

Este build de divinetribe no reentrena el modelo: aplica dos transformaciones post-entrenamiento. Primero, una ablacion direccional de rechazo segun la tecnica de Arditi et al. (2024), calculando la direccion a partir de la capa 44 de 64 y sustrayendola solo en la torre de lenguaje. Segundo, una cuantizacion a 4 bits de esa misma torre, dejando intactos los 351 tensores de la torre de vision en bfloat16, junto con `vision_config` y los configs del procesador. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de codigo HTML y CSS a partir de una captura de pantalla, orientada a recrear maquetaciones (slides, posters, dashboards, paginas de producto).
- Comprension de imagenes: identificacion de elementos de interfaz, jerarquia visual, colores, badges, botones y estructura de layout.
- Auditoria de paginas web: SEO, marketing y accesibilidad, incluyendo redaccion de texto alternativo para imagenes.
- Generacion de texto general y conversacion multi-turno (pipeline `conversational`).
- Capacidades de codigo heredadas del backbone Qwen3-VL-32B-Instruct.
- Ejecucion local y offline en Apple Silicon mediante mlx-vlm, sin telemetria ni API externa.
- Ablacion de rechazo: el modelo no presenta la direccion de rechazo del original en la torre de lenguaje.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Recreacion de maquetaciones desde capturas: dado un screenshot de una landing o un dashboard, el modelo genera un unico archivo HTML con CSS inline que reproduce la estructura. Es su proposito principal de entrenamiento y el escenario donde rinde mejor.
- Prototipado rapido de interfaz: un disenador en Mac puede convertir un mockup en codigo funcional sin salir del portatil, manteniendo la propiedad intelectual del diseno en local.
- Auditoria de accesibilidad y SEO: tal como se valido en la model card con una pagina de producto real, el modelo describe los elementos de la pagina y redacta alt-text utilizable, lo que permite integrarlo en revisiones de contenido.
- Generacion de slides y posters: a partir de una referencia visual, produce el HTML necesario para presentaciones o material promocional, reduciendo el trabajo manual de maquetacion.
- Asistencia de codigo en local dentro de editores: el autor lo promociona para su uso en Claude Code Local sobre Mac, de modo que se puede emplear como asistente de codigo privado y sin coste de API.
- Extraccion estructurada de informacion visual: descripcion detallada de componentes de una UI (breadcrumbs, selectores de cantidad, badges) que puede alimentar pipelines de documentacion o QA visual.
- Desarrollo en entornos con restricciones de privacidad: al ejecutarse sin telemetria ni conexion, encaja en equipos que no pueden enviar capturas de producto a servicios en la nube.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del paper y la model card del modelo original (AesCode-32B), evaluados sobre 300 muestras de estilo infografico y puntuados por cumplimiento de reglas y calidad visual. Corresponden al modelo sin cuantizar ni abliterar, no a este build.

| Modelo (con imagen de referencia) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85.89 | 77.44 |
| Claude Opus 4.8 (sin referencia) | 76.78 | no disponible |
| GPT-5.5 (sin referencia) | 76.31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61.10 | no disponible |

No se han publicado resultados de benchmarks especificos de esta cuantizacion 4-bit ni de la version abliterada en la informacion disponible. El autor afirma que el build 4-bit supero la misma prueba cualitativa de vision que la version de precision completa, pero no aporta metricas numericas de esa comparacion.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 19,6 GB; en Apple Silicon se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y a la torre de vision en bf16. Con 32 GB o mas el margen es comodo.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y superiores). El formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; no aplica a GPUs discretas convencionales por el formato.
- Opciones de despliegue: mlx-vlm (comando `python -m mlx_vlm.generate`), integracion con Claude Code Local. No se contemplan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-32B-abliterated-MLX-4bit | 33,36 B | no disponible | Codigo estetico + vision, 4-bit MLX | Apache 2.0 | Hugging Face |
| microsoft/AesCode-32B | 32 B (aprox.) | no disponible | Codigo estetico + vision, precision completa | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-32B-Instruct | 32 B (aprox.) | no disponible | Vision-lenguaje general | no disponible en la informacion | Hugging Face |
| divinetribe/AesCode-32B-abliterated-MLX-8bit | 33,36 B | no disponible | Misma familia, 8 bits | Apache 2.0 | Hugging Face |

La comparativa relevante es interna a la familia: frente al bf16 y al 8-bit, este build reduce el tamano a aproximadamente un cuarto manteniendo la torre de vision intacta. Frente al Qwen3-VL-32B-Instruct original, AesCode esta especializado en generacion de codigo a partir de imagenes y obtiene 85,89 frente a 61,10 en el benchmark propio del autor, aunque esa comparacion la realiza el propio equipo que entreno el modelo.

## Limitaciones y advertencias

- La ablacion elimina la direccion de rechazo: el modelo puede producir contenido que el original rechazaria. La responsabilidad de uso recae enteramente en quien lo despliega.
- La cuantizacion a 4 bits no anade conocimiento y puede degradar ligeramente la precision; el autor solo garantiza que la ruta de vision mantiene calidad practicamente completa.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente al inferir elementos no visibles en la captura o al inventar contenido textual.
- Idioma: solo se declara ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a infraestructura NVIDIA sin conversion adicional.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el backbone Qwen3-VL deben verificarse por separado para confirmar compatibilidad.
- Los benchmarks citados corresponden al modelo original sin cuantizar; no hay evidencia publica del rendimiento de este build concreto.
- La model card incluye enlaces promocionales a un repositorio externo (Claude Code Local); conviene tratarlos como material de marketing y no como validacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-4bit
- Version bf16: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-bf16
- Version 8-bit: https://huggingface.co/divinetribe/AesCode-32B-abliterated-MLX-8bit
- Modelo base AesCode-32B: https://huggingface.co/microsoft/AesCode-32B
- Backbone Qwen3-VL-32B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper AesCode (arXiv:2610.18860): https://arxiv.org/abs/2610.18860
- Paper de ablacion de rechazo (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
