# AtomicChat/Qwen3.8-27B-MLX-4bit-CLIP-DWQ

## Resumen

AtomicChat/Qwen3.8-27B-MLX-4bit-CLIP-DWQ es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, empaquetada en formato MLX para su ejecución en Apple Silicon. El trabajo lo firma AtomicChat, el equipo detrás de la aplicación Atomic Chat de inferencia local, y combina una conversión a 4 bits con búsqueda de clipping por grupo seguida de una etapa de destilación de pesos (DWQ, *distillation weight quantization*) que ajusta escalas y offsets tomando como profesor la conversión de 8 bits del mismo equipo. El resultado ocupa 16,05 GB en disco en un único `model.safetensors`, con 4,50 bits por peso de media en el modelo de lenguaje y la torre de visión conservada en bf16.

El modelo base resuelve el caso de uso de inferencia multimodal local: acepta imagen y texto y genera texto, con pipeline `image-text-to-text`. La relevancia de esta ficha concreta está en la relación calidad/tamaño: frente a una conversión estándar de 4 bits sin DWQ, la divergencia KL media baja de 0,056 a 0,053 y la coincidencia de top-1 sube de 89,1% a 89,5% sobre el mismo banco de pruebas, manteniendo el mismo tamaño en disco. Frente a las variantes de 3 bits del mismo autor, la mejora es mucho más marcada (KLD de 0,215 a 3,50 bpw frente a 0,053).

Los parámetros totales declarados en los safetensors son 27.356.728.560 (unos 27,36B). La model card no detalla arquitectura interna, longitud de contexto ni composición del dataset de entrenamiento del modelo original; esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión); familia Qwen3.5 según el tag `qwen3_5`, detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (~27,36B); 26,9B en el modelo de lenguaje y 0,46B en la torre de visión |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits uniforme, group size 64, con búsqueda de clipping y DWQ; torre de visión en bf16. El autor publica además variantes de 3,50, 3,70, 3,80 y 5,00 bpw |
| Idiomas soportados | en (inglés), según metadatos del repositorio |
| Licencia | Apache 2.0 según la model card (el campo de licencia del repo figura como no disponible) |
| Formato de pesos | safetensors (MLX), un único `model.safetensors` de 16,05 GB; repo de 16,1 GB |

## Arquitectura y entrenamiento

El repositorio es una conversión cuantizada, no un entrenamiento desde cero. El punto de partida es la conversión bf16 a MLX del modelo original (AtomicChat/Qwen3.8-27B-MLX-bf16), sobre la que se aplica una cuantización a 4 bits uniforme con group size 64 en todas las matrices cuantizadas del modelo de lenguaje, incluyendo una búsqueda de clipping para determinar el rango de cuantización de cada grupo. Después se ejecuta DWQ, que ajusta escalas y offsets de cuantización mediante destilación usando como profesor la build de 8 bits en MLX del mismo equipo, en una ejecución corta de una a dos horas en una sola GPU. La torre de visión, con 0,46B de pesos y 0,92 GB, se mantiene en bf16 sin cuantizar.

La nomenclatura del repositorio incluye `AD` y `CLIP`, pero la propia model card aclara que esta variante concreta no tiene layout por tensor: es 4 bits uniforme, pese a la etiqueta. El resultado son 4,50 bits por peso de media sobre los 26,9B del modelo de lenguaje, contando escalas y offsets. No hay información disponible sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo original de Qwen.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Entrada de imagen y texto con salida de texto (pipeline `image-text-to-text`), gestionada a través de mlx-vlm; la torre de visión se conserva en bf16 para no degradar la codificación visual.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.8-27B, sin benchmarks publicados en la información disponible que las cuantifiquen.
- Soporte de tool calling y function calling: no confirmado en la model card; depende del modelo base y no se documenta en esta conversión.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Ejecución local offline en Apple Silicon mediante mlx-lm (texto) y mlx-vlm (imagen + texto).

## Casos de uso

- Asistentes locales de escritorio en Mac: el modelo cabe en 16,05 GB de disco y se carga con `mlx_lm.load`, lo que permite integrarlo en aplicaciones de chat que funcionan sin conexión, sin coste por token y sin enviar datos a terceros.
- Análisis de documentos escaneados y capturas: al aceptar imagen y texto, se puede usar para extraer información estructurada de facturas, formularios o pantallazos dentro de un flujo local en el que la confidencialidad impide usar APIs en la nube.
- Descripción y etiquetado de imágenes por lotes: la torre de visión en bf16 permite generar captions y metadatos para catálogos o archivos fotográficos ejecutando el modelo en un Mac con memoria unificada suficiente.
- Prototipado rápido de aplicaciones multimodales: la API de mlx-vlm con el mismo identificador de repositorio reduce el tiempo de puesta en marcha para validar ideas antes de invertir en infraestructura GPU.
- Evaluación comparativa de cuantizaciones: las cinco variantes publicadas por AtomicChat (3,50 a 5,00 bpw) con métricas de KLD y top-1 permiten elegir el punto de la curva calidad/memoria adecuado para un Mac concreto.
- Investigación sobre cuantización: el par de métricas KLD y coincidencia top-1 frente a bf16, junto con el log público en el dataset de métricas, sirve como referencia reproducible para estudiar el efecto de DWQ y del clipping por grupo.
- Generación de código asistida en local: con mlx-lm se puede integrar en editores o scripts de automatización en un Mac, siempre que se acepte la ausencia de benchmarks específicos de código para esta conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a su conversión bf16, medidas con mlx-lm 0.31.3 y mlx-vlm 0.6.15 sobre 1x H200 NVL, en 24 fragmentos de 4096 tokens de texto neutro retenido, puntuando la segunda mitad de cada fragmento:

| Repositorio | Layout | Bits por peso | Disco | KLD media | Mismo top-1 |
|---|---|---:|---:|---:|---:|
| AD-3.50bpw-DWQ-12.7GB | 3 bits uniforme | 3,50 | 12,69 GB | 0,215 | 79,6% |
| AD-3.70bpw-DWQ-13.4GB | `mixed_3_4` de mlx-lm | 3,70 | 13,37 GB | 0,166 | 82,4% |
| AD-3.80bpw-DWQ-13.7GB | por tensor, propio | 3,80 | 13,69 GB | 0,148 | 82,3% |
| **AD-4.50bpw-DWQ-16.0GB (esta ficha)** | 4 bits uniforme | **4,50** | **16,05 GB** | **0,053** | **89,5%** |
| AD-5.00bpw-DWQ-17.7GB | por tensor, propio | 5,00 | 17,74 GB | 0,031 | 91,5% |
| Conversión 3 bits simple (referencia) | group 64, sin clipping ni DWQ | 3,00 | no disponible | 0,223 | 78,5% |
| Conversión 4 bits simple (referencia) | group 64, sin clipping ni DWQ | 4,00 | no disponible | 0,056 | 89,1% |

Estas cifras son de MLX y el autor advierte que no son comparables con las de su model card GGUF, porque llama.cpp tokeniza y agrupa el texto de forma distinta.

## Requisitos de hardware

- VRAM/memoria unificada: el peso en disco es de 16,05 GB; en ejecución hay que sumar caché KV y buffers de activación, por lo que conviene disponer de al menos 20-24 GB de memoria unificada para texto y más para entrada de imagen.
- Plataforma objetivo: Apple Silicon con MLX (mlx-lm para texto, mlx-vlm para imagen). El autor no tiene registrada ninguna ejecución en Mac de este archivo concreto.
- GPU recomendadas: el modelo está pensado para Mac con memoria unificada; el autor midió las métricas de fidelidad en 1x H200 NVL, no en hardware Apple.
- ¿Cabe en GPU de consumo? No hay datos del autor sobre RTX 4090 u otras GPU de consumo para este archivo MLX; el formato no es el habitual para CUDA. Para ese ecosistema el autor publica una build GGUF separada.
- Opciones de despliegue: mlx-lm (texto) y mlx-vlm (imagen + texto) con el identificador `AtomicChat/Qwen3.8-27B-MLX-4bit-CLIP-DWQ`. vLLM, llama.cpp, Ollama y TGI no aplican a este formato MLX.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| AtomicChat/Qwen3.8-27B-MLX-4bit-CLIP-DWQ | 27,36B (26,9B LM + 0,46B visión) | no disponible | MLX safetensors, 16,05 GB | Apache 2.0 (según model card) | KLD 0,053 y top-1 89,5% frente a bf16 |
| AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB | 27,36B | no disponible | MLX safetensors, 17,74 GB | Apache 2.0 (según model card) | KLD 0,031 y top-1 91,5%; +1,7 GB de disco |
| AtomicChat/Qwen3.8-27B-MLX-AD-3.50bpw-DWQ-12.7GB | 27,36B | no disponible | MLX safetensors, 12,69 GB | Apache 2.0 (según model card) | KLD 0,215 y top-1 79,6%; ahorra 3,4 GB con pérdida notable |
| Qwen/Qwen3.8-27B (original) | ~27,36B | no disponible | safetensors bf16 | Apache 2.0 | Referencia de calidad; requiere bastante más memoria |

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Las métricas de fidelidad se midieron en CUDA (H200 NVL); el autor no tiene registrada ninguna ejecución de este archivo en Mac y la entrada de imagen no se probó en él.
- KLD y top-1 provienen de un único conjunto de texto retenido y no miden comportamiento en chat, uso de herramientas ni contexto largo.
- La degradación de cuantización es real aunque moderada: 0,053 de KLD y 10,5% de tokens con top-1 distinto respecto a bf16, lo que puede acumularse en generaciones largas o tareas de razonamiento sensible.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea inferior al del modelo base completo.
- Licencia: la model card indica Apache 2.0, pero el campo de licencia del repositorio figura como no disponible; conviene verificar la licencia del modelo original de Qwen antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados para esta conversión; se heredan los del modelo base, sobre los que la información disponible no aporta detalles.
- Tool calling, modo thinking y longitud de contexto no están confirmados en la documentación de esta variante; no deben asumirse en producción sin validación previa.
- El formato MLX limita el despliegue a Apple Silicon; para CUDA o CPU hay que recurrir a la build GGUF del mismo autor, cuyas métricas no son comparables con las de esta ficha.
- El nombre del repositorio incluye `AD` y `CLIP`, pero esta variante es 4 bits uniforme sin layout por tensor; no debe interpretarse como una cuantización de precisión mixta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-4bit-CLIP-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión bf16 en MLX del autor: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-bf16
- Variante 3,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.50bpw-DWQ-12.7GB
- Variante 3,70 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.70bpw-DWQ-13.4GB
- Variante 3,80 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB
- Variante 5,00 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB
- Build GGUF del mismo modelo: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Log de métricas KLD: https://huggingface.co/datasets/AtomicChat/Qwen3.8-27B-MLX-metrics/blob/main/logs/kld-Qwen3.8-27B-MLX-4bit-CLIP-DWQ.json
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord del proyecto: https://discord.gg/8wGSsvmg4V
- Perfil en X: https://x.com/atomic_chat_hq
